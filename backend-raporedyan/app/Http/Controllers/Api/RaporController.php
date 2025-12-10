<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\TujuanPembelajaran;
use App\Models\Kelas;
use App\Models\Setting;
use Illuminate\Http\Request;

class RaporController extends Controller
{
    public function getBulkData(Request $request)
    {
        $kelas = $request->query('kelas');
        if (!$kelas) return response()->json(['success' => false, 'message' => 'Kelas harus dipilih'], 400);

        // [BARU] Ambil Data Wali Kelas dari tabel 'kelas'
        $dataKelas = Kelas::where('nama', $kelas)->first();

        $waliKelas = '-';
        $nipWali = '-';

        if ($dataKelas) {
            // Format Nama Lengkap: [Depan] [Nama], [Belakang]
            $depan = $dataKelas->gelar_depan ? $dataKelas->gelar_depan . ' ' : '';
            $belakang = $dataKelas->gelar_belakang ? ', ' . $dataKelas->gelar_belakang : '';
            $waliKelas = $depan . $dataKelas->wali_kelas . $belakang;

            $nipWali = $dataKelas->nip;
        }

        // [BARU] Ambil Data Wali Kelas dari tabel 'kelas'
        $dataKelas = Kelas::where('nama', $kelas)->first();

        $waliKelas = '-';
        $nipWali = '-';

        if ($dataKelas) {
            // Format Nama Lengkap: [Depan] [Nama], [Belakang]
            $depan = $dataKelas->gelar_depan ? $dataKelas->gelar_depan . ' ' : '';
            $belakang = $dataKelas->gelar_belakang ? ', ' . $dataKelas->gelar_belakang : '';
            $waliKelas = $depan . $dataKelas->wali_kelas . $belakang;

            $nipWali = $dataKelas->nip;
        }

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

        // [BARU] Ambil Pengaturan Sekolah (Kop Surat & TTD)
        $settingDB = Setting::first();

        // Default value jika belum disetting
        $sekolahInfo = [
            'namaSekolah' => $settingDB->nama_sekolah ?? 'SMK BELUM DISETTING',
            'tahunPelajaran' => $settingDB->tahun_pelajaran ?? date('Y'),
            'kepalaSekolah' => $settingDB->nama_kepala_sekolah ?? '-',
            'nipKepala' => $settingDB->nip_kepala_sekolah ?? '-',
            'kota' => $settingDB->kota ?? 'Indonesia',
            // Format tanggal rapor (misal: 2024-12-15 jadi "15 Desember 2024")
            'tanggalCetak' => $settingDB->tanggal_rapor ? date('d F Y', strtotime($settingDB->tanggal_rapor)) : date('d F Y'),
            'tglMulai' => $settingDB->tanggal_mulai_pkl ? date('d F Y', strtotime($settingDB->tanggal_mulai_pkl)) : '-',
            'tglAkhir' => $settingDB->tanggal_akhir_pkl ? date('d F Y', strtotime($settingDB->tanggal_akhir_pkl)) : '-',
        ];

        // Format Data agar siap dilahap Frontend
        $dataRapor = $siswa->map(function ($s) use ($listTP, $waliKelas, $nipWali) {

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
                // [BARU] Data Wali Kelas Dynamic
                'waliKelas' => $waliKelas,
                'nipWali' => $nipWali,
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
            'data' => $dataRapor,
            'meta_settings' => $sekolahInfo // [BARU] Kirim settings terpisah
        ]);
    }
}
