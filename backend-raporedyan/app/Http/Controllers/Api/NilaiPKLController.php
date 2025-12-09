<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NilaiPKL;
use App\Models\Siswa;
use App\Models\TujuanPembelajaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\DB;

class NilaiPKLController extends Controller
{
    // 1. Ambil List Kelas untuk Dropdown
    public function getKelasList()
    {
        $kelas = Siswa::select('kelas')->distinct()->orderBy('kelas')->pluck('kelas');
        return response()->json(['success' => true, 'data' => $kelas]);
    }

    // 2. Ambil Data Siswa + Nilai berdasarkan Kelas
    public function getByKelas(Request $request)
    {
        $kelas = $request->query('kelas');

        // Ambil semua TP untuk header kolom
        $tujuan = TujuanPembelajaran::all();

        // Ambil siswa di kelas tersebut beserta nilainya
        $siswa = Siswa::where('kelas', $kelas)
            ->with(['nilai'])
            ->orderBy('nama')
            ->get();

        // Format data biar frontend enak render nya
        // Jadikan array: { siswa_id: 1, nama: 'Budi', nilai: { 'tp_id_1': {skor: 80, deskripsi: 'Baik'} } }
        $formattedData = $siswa->map(function ($s) {
            $nilaiMap = [];
            foreach ($s->nilai as $n) {
                // Simpan objek lengkap (skor & deskripsi)
                $nilaiMap[$n->tujuan_pembelajaran_id] = [
                    'skor' => $n->skor,
                    'deskripsi' => $n->deskripsi
                ];
            }

            // [FIX] PENTING: Harus di-return agar masuk ke $formattedData
            return [
                'id' => $s->id,
                'nama' => $s->nama,
                'nisn' => $s->nisn,
                'nilai' => $nilaiMap
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'tujuanPembelajaran' => $tujuan,
                'siswa' => $formattedData
            ]
        ]);
    }

    // 3. Simpan Nilai (Bulk Update)
    public function storeBulk(Request $request)
    {
        $payload = $request->input('data'); // Array nilai

        DB::beginTransaction();
        try {
            foreach ($payload as $item) {
                foreach ($item['nilai'] as $tpId => $val) {
                    // Handle format data baru (objek)
                    // Cek apakah input berupa array {skor, deskripsi} atau cuma angka (backward compatibility)
                    $skor = is_array($val) ? ($val['skor'] ?? 0) : $val;
                    $deskripsi = is_array($val) ? ($val['deskripsi'] ?? null) : null;

                    NilaiPKL::updateOrCreate(
                        [
                            'siswa_id' => $item['id'],
                            'tujuan_pembelajaran_id' => $tpId
                        ],
                        [
                            'skor' => (int)$skor,
                            'deskripsi' => $deskripsi
                        ]
                    );
                }
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Nilai berhasil disimpan']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Import Excel
    public function import(Request $request)
    {
        $data = $request->input('data'); // Array from Excel
        if (empty($data)) return response()->json(['success' => false, 'message' => 'Data kosong'], 400);

        // Map Judul Kolom Excel ke ID Tujuan Pembelajaran
        // Contoh Excel Header: "TP: Menerapkan K3LH" -> Kita cari ID nya di DB
        $allTP = TujuanPembelajaran::all();
        $tpMap = []; // Key: Nama TP Lowercase, Value: ID

        foreach ($allTP as $tp) {
            // strip_tags penting karena TP di DB ada tag HTML <p> dari editor
            $tpMap[strtolower(strip_tags($tp->nama))] = $tp->id;
            // Kita juga support ID nya langsung misal "tp_1" (jaga-jaga)
            $tpMap['tp_' . $tp->id] = $tp->id;
        }

        $siswaMap = Siswa::pluck('id', 'nisn')->toArray(); // Map NISN ke ID Siswa

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                // Cari Siswa by NISN
                $nisn = (string)($row['NISN'] ?? '');
                if (!isset($siswaMap[$nisn])) continue; // Skip jika siswa ga ketemu
                $siswaId = $siswaMap[$nisn];

                // Loop setiap kolom excel
                foreach ($row as $key => $value) {
                    $cleanKey = strtolower($key);

                    // Cek SKOR (Format header sesuai Nama TP)
                    if (isset($tpMap[$cleanKey])) {
                        $tpId = $tpMap[$cleanKey];
                        NilaiPKL::updateOrCreate(
                            ['siswa_id' => $siswaId, 'tujuan_pembelajaran_id' => $tpId],
                            ['skor' => (int)$value]
                        );
                    }
                    // Cek DESKRIPSI (Format header: "Deskripsi: Nama TP")
                    else {
                        // Hapus prefix "deskripsi:" atau "deskripsi " untuk mencocokkan nama TP
                        $potentialTpName = str_replace(['deskripsi:', 'deskripsi '], '', $cleanKey);
                        $potentialTpName = trim($potentialTpName);

                        if (isset($tpMap[$potentialTpName])) {
                            $tpId = $tpMap[$potentialTpName];
                            NilaiPKL::updateOrCreate(
                                ['siswa_id' => $siswaId, 'tujuan_pembelajaran_id' => $tpId],
                                ['deskripsi' => $value]
                            );
                        }
                    }
                }
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Import nilai berhasil']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 5. Generate Deskripsi via AI (Gemini)
    // public function generateDescription(Request $request)
    // {
    //     $request->validate([
    //         'tp' => 'required|string',
    //         'skor' => 'required|numeric',
    //         'nama_siswa' => 'nullable|string'
    //     ]);

    //     $tp = $request->tp;
    //     $skor = $request->skor;
    //     $siswa = $request->nama_siswa ?? 'Siswa';
    //     $apiKey = env('GEMINI_API_KEY');

    //     if (!$apiKey) {
    //         return response()->json(['success' => false, 'message' => 'API Key AI belum disetting di .env'], 500);
    //     }

    //     // Tentukan predikat awal untuk membantu AI
    //     $predikat = 'Kurang';
    //     if ($skor >= 90) $predikat = 'Sangat Baik';
    //     else if ($skor >= 80) $predikat = 'Baik';
    //     else if ($skor >= 70) $predikat = 'Cukup';

    //     // Prompt Engineering (Instruksi ke AI)
    //     $prompt = "Bertindaklah sebagai guru SMK. Buatkan satu kalimat deskripsi rapor (maksimal 20 kata) untuk tujuan pembelajaran: '{$tp}'.
    //     Nilai siswa: {$skor} ({$predikat}).
    //     Gunakan bahasa formal, motivasi, dan spesifik pada materi.
    //     Contoh output: 'Ananda {$siswa} sangat baik dalam memahami konsep X namun perlu peningkatan di Y.'
    //     Langsung berikan kalimat deskripsinya saja tanpa tanda kutip.";

    //     try {
    //         // Request ke Google Gemini API
    //         $response = Http::withHeaders([
    //             'Content-Type' => 'application/json',
    //         ])->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={$apiKey}", [
    //             'contents' => [
    //                 [
    //                     'parts' => [
    //                         ['text' => $prompt]
    //                     ]
    //                 ]
    //             ]
    //         ]);

    //         $result = $response->json();

    //         // Ambil teks dari response Gemini
    //         $generatedText = $result['candidates'][0]['content']['parts'][0]['text'] ?? 'Gagal generate.';

    //         return response()->json(['success' => true, 'data' => trim($generatedText)]);
    //     } catch (\Exception $e) {
    //         return response()->json(['success' => false, 'message' => 'Gagal koneksi AI: ' . $e->getMessage()], 500);
    //     }
    // }

    // 5. Generate Deskripsi via AI (Gemini 1.5 Flash)
    public function generateDescription(Request $request)
    {
        $request->validate([
            'tp' => 'required|string',
            'skor' => 'required|numeric',
            'nama_siswa' => 'nullable|string'
        ]);

        $tp = $request->tp;
        $skor = $request->skor;
        $siswa = $request->nama_siswa ?? 'Siswa';
        $apiKey = env('GEMINI_API_KEY');

        if (!$apiKey) {
            return response()->json(['success' => false, 'message' => 'API Key belum disetting di .env'], 500);
        }

        $predikat = 'Kurang';
        if ($skor >= 90) $predikat = 'Sangat Baik';
        else if ($skor >= 80) $predikat = 'Baik';
        else if ($skor >= 70) $predikat = 'Cukup';

        // Prompt kita buat lebih detail
        $prompt = "Buatkan deskripsi rapor satu kalimat singkat (maksimal 20 kata) untuk siswa bernama '{$siswa}'. 
        Tujuan Pembelajaran: '{$tp}'. 
        Nilai: {$skor} (Predikat: {$predikat}). 
        Gunakan bahasa formal rapor kurikulum merdeka. Langsung kalimatnya saja.";

        try {
            // URL MENGGUNAKAN GEMINI 1.5 FLASH (Versi v1beta)
            $url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={$apiKey}";

            $response = Http::withHeaders([
                'Content-Type' => 'application/json',
            ])->post($url, [
                'contents' => [
                    [
                        'parts' => [
                            ['text' => $prompt]
                        ]
                    ]
                ]
            ]);

            $result = $response->json();

            // Cek Error Google
            if ($response->failed()) {
                // Debugging: Tampilkan pesan error asli dari Google jika ada
                $errorMsg = $result['error']['message'] ?? 'Unknown Error from Google';
                return response()->json([
                    'success' => false,
                    'message' => "Google Error: $errorMsg. Pastikan API Key dibuat di aistudio.google.com"
                ], 400);
            }

            // Ambil Teks
            if (isset($result['candidates'][0]['content']['parts'][0]['text'])) {
                $generatedText = $result['candidates'][0]['content']['parts'][0]['text'];
                return response()->json(['success' => true, 'data' => trim($generatedText)]);
            } else {
                return response()->json(['success' => false, 'message' => 'AI tidak memberikan teks.'], 400);
            }
        } catch (\Exception $e) {
            return response()->json(['success' => false, 'message' => 'Server Error: ' . $e->getMessage()], 500);
        }
    }

    // Fungsi Debugging: Cek Model apa yang tersedia untuk Key ini
    public function checkAvailableModels()
    {
        $apiKey = env('GEMINI_API_KEY');
        // Kita tanya ke endpoint "models"
        $response = Http::get("https://generativelanguage.googleapis.com/v1beta/models?key={$apiKey}");

        return $response->json();
    }
}
