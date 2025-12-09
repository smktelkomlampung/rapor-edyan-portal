<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Mapping;
use App\Models\Siswa;
use App\Models\TempatPKL;
use App\Models\InstrukturPKL;
use App\Models\PembimbingSekolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class MappingController extends Controller
{
    public function index()
    {
        // 1. Ambil semua siswa beserta data mappingnya (jika ada)
        // Kita gunakan 'left join' logic via Eloquent 'with'
        $students = Siswa::with(['mapping'])->latest()->get();

        // 2. Ambil data master untuk Dropdown
        $tempatPkl = TempatPKL::all();
        $instruktur = InstrukturPKL::all();
        $pembimbing = PembimbingSekolah::all();

        // 3. Format data agar mudah dibaca Frontend
        $formattedData = $students->map(function ($s) {
            return [
                'id' => $s->id, // ID Siswa
                'namaSiswa' => $s->nama,
                'nisn' => $s->nisn,
                'kelas' => $s->kelas,
                // Ambil ID dari mapping jika ada, jika tidak null
                'tempatPKLId' => $s->mapping ? $s->mapping->tempat_pkl_id : null,
                'instrukturPKLId' => $s->mapping ? $s->mapping->instruktur_pkl_id : null,
                'pembimbingSekolahId' => $s->mapping ? $s->mapping->pembimbing_sekolah_id : null,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => [
                'mappings' => $formattedData,
                'options' => [
                    'tempat' => $tempatPkl,
                    'instruktur' => $instruktur,
                    'pembimbing' => $pembimbing,
                ]
            ]
        ]);
    }

    // Fungsi Simpan Masal (Bulk Update)
    public function storeBulk(Request $request)
    {
        $mappings = $request->input('mappings'); // Array data dari frontend

        DB::beginTransaction();
        try {
            foreach ($mappings as $item) {
                // Gunakan updateOrCreate berdasarkan siswa_id
                Mapping::updateOrCreate(
                    ['siswa_id' => $item['id']], // Kunci pencarian (ID Siswa)
                    [
                        'tempat_pkl_id' => $item['tempatPKLId'],
                        'instruktur_pkl_id' => $item['instrukturPKLId'],
                        'pembimbing_sekolah_id' => $item['pembimbingSekolahId'],
                    ]
                );
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Mapping berhasil disimpan!']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal menyimpan: ' . $e->getMessage()], 500);
        }
    }

    // Method baru untuk Import Excel berdasarkan NAMA
    public function import(Request $request)
    {
        $data = $request->input('data'); // Array dari Excel (Isinya Nama)

        if (empty($data)) {
            return response()->json(['success' => false, 'message' => 'Data kosong'], 400);
        }

        // 1. Optimasi: Ambil semua Master Data dulu biar gak query berulang-ulang
        // Kita jadikan Key-nya adalah NAMA (lowercase) dan Value-nya ID
        $siswaMap = Siswa::pluck('id', DB::raw('LOWER(nama)'))->toArray();
        $tempatMap = TempatPKL::pluck('id', DB::raw('LOWER(nama)'))->toArray();
        $instrukturMap = InstrukturPKL::pluck('id', DB::raw('LOWER(nama)'))->toArray();
        $pembimbingMap = PembimbingSekolah::pluck('id', DB::raw('LOWER(nama)'))->toArray();

        $successCount = 0;
        $errors = [];

        DB::beginTransaction();
        try {
            foreach ($data as $index => $row) {
                // Bersihkan input (trim spasi & lowercase)
                $namaSiswa = strtolower(trim($row['namaSiswa'] ?? ''));
                $namaTempat = strtolower(trim($row['tempatPKL'] ?? ''));
                $namaInstruktur = strtolower(trim($row['instrukturPKL'] ?? ''));
                $namaPembimbing = strtolower(trim($row['pembimbingSekolah'] ?? ''));

                // 2. Cari ID Siswa (Wajib Ada)
                if (!isset($siswaMap[$namaSiswa])) {
                    // Skip jika siswa tidak ditemukan di database
                    continue;
                }
                $siswaId = $siswaMap[$namaSiswa];

                // 3. Cari ID Master Data (Jika ada di excel, cari di map. Jika gak ketemu, null)
                $tempatId = $namaTempat && isset($tempatMap[$namaTempat]) ? $tempatMap[$namaTempat] : null;
                $instrukturId = $namaInstruktur && isset($instrukturMap[$namaInstruktur]) ? $instrukturMap[$namaInstruktur] : null;
                $pembimbingId = $namaPembimbing && isset($pembimbingMap[$namaPembimbing]) ? $pembimbingMap[$namaPembimbing] : null;

                // 4. Simpan Mapping
                Mapping::updateOrCreate(
                    ['siswa_id' => $siswaId], // Kunci unik
                    [
                        'tempat_pkl_id' => $tempatId,
                        'instruktur_pkl_id' => $instrukturId,
                        'pembimbing_sekolah_id' => $pembimbingId,
                    ]
                );

                $successCount++;
            }

            DB::commit();
            return response()->json([
                'success' => true,
                'message' => "Berhasil memproses $successCount data mapping."
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Error import: ' . $e->getMessage()], 500);
        }
    }
}
