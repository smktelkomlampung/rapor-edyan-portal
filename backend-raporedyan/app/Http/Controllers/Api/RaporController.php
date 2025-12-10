<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\TujuanPembelajaran;
use Illuminate\Http\Request;

class RaporController extends Controller
{
    public function getBulkData(Request $request)
    {
        $kelas = $request->query('kelas');
        if (!$kelas) return response()->json(['success' => false, 'message' => 'Kelas harus dipilih'], 400);

        // Ambil semua TP untuk referensi urutan
        $listTP = TujuanPembelajaran::all();

        // Ambil Siswa dengan SEMUA relasinya (Eager Loading biar cepat)
        $siswa = Siswa::where('kelas', $kelas)
            ->with([
                'mapping.tempatPkl',       // Relasi ke tabel tempat_pkls
                'mapping.instrukturPkl',   // Relasi ke tabel instruktur_pkls
                'mapping.pembimbingSekolah', // Relasi ke tabel pembimbing_sekolahs
                'nilai',                   // Relasi ke nilai_pkls
                'absensi'                  // Relasi ke absensi_pkls
            ])
            ->orderBy('nama')
            ->get();

        // Format Data agar siap dilahap Frontend
        $dataRapor = $siswa->map(function ($s) use ($listTP) {

            // 1. Format Nilai (Gabungkan dengan List TP biar urut)
            $nilaiFormatted = $listTP->map(function ($tp) use ($s) {
                // Cari nilai siswa untuk TP ini
                $n = $s->nilai->where('tujuan_pembelajaran_id', $tp->id)->first();
                return [
                    'tp' => strip_tags($tp->nama), // Bersihkan HTML
                    'skor' => $n ? $n->skor : 0,
                    'deskripsi' => $n && $n->deskripsi ? $n->deskripsi : '-'
                ];
            });

            return [
                'id' => $s->id,
                'nama' => $s->nama,
                'nisn' => $s->nisn,
                'kelas' => $s->kelas,
                'programKeahlian' => 'Teknik Jaringan Komputer dan Telekomunikasi', // Default/Bisa dari DB
                'konsentrasiKeahlian' => 'Teknik Komputer dan Jaringan', // Default/Bisa dari DB

                // Data Mapping (Ambil Nama, bukan ID)
                'tempatPKL' => $s->mapping && $s->mapping->tempatPkl ? $s->mapping->tempatPkl->nama : '-',
                'instrukturPKL' => $s->mapping && $s->mapping->instrukturPkl ? $s->mapping->instrukturPkl->nama : '-',
                'pembimbingSekolah' => $s->mapping && $s->mapping->pembimbingSekolah ? $s->mapping->pembimbingSekolah->nama : '-',

                // Data Nilai Lengkap
                'nilai' => $nilaiFormatted,

                // Data Absensi
                'absensi' => [
                    'sakit' => $s->absensi->sakit ?? 0,
                    'izin' => $s->absensi->izin ?? 0,
                    'alpha' => $s->absensi->alpha ?? 0,
                    'catatan' => $s->absensi->catatan ?? 'Sudah melakukan kegiatan PKL dengan baik.'
                ]
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $dataRapor
        ]);
    }
}
