<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AbsensiPKL;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AbsensiPKLController extends Controller
{
    // 1. Get List Kelas (Bisa reuse logic, tapi kita buat endpoint sendiri biar independen)
    public function getKelasList()
    {
        $kelas = Siswa::select('kelas')->distinct()->orderBy('kelas')->pluck('kelas');
        return response()->json(['success' => true, 'data' => $kelas]);
    }

    // 2. Get Data by Kelas
    public function getByKelas(Request $request)
    {
        $kelas = $request->query('kelas');

        $siswa = Siswa::where('kelas', $kelas)
            ->with(['absensi'])
            ->orderBy('nama')
            ->get()
            ->map(function ($s) {
                return [
                    'id' => $s->id,
                    'nama' => $s->nama,
                    'nisn' => $s->nisn,
                    'sakit' => $s->absensi->sakit ?? 0,
                    'izin' => $s->absensi->izin ?? 0,
                    'alpha' => $s->absensi->alpha ?? 0,
                    'catatan' => $s->absensi->catatan ?? '',
                ];
            });

        return response()->json(['success' => true, 'data' => $siswa]);
    }

    // 3. Store Bulk (Simpan Semua)
    public function storeBulk(Request $request)
    {
        $data = $request->input('data');

        DB::beginTransaction();
        try {
            foreach ($data as $item) {
                AbsensiPKL::updateOrCreate(
                    ['siswa_id' => $item['id']],
                    [
                        'sakit' => (int)$item['sakit'],
                        'izin' => (int)$item['izin'],
                        'alpha' => (int)$item['alpha'],
                        'catatan' => $item['catatan']
                    ]
                );
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Absensi berhasil disimpan']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }

    // 4. Import Excel (Smart Case Insensitive)
    public function import(Request $request)
    {
        $data = $request->input('data');
        if (empty($data)) return response()->json(['success' => false, 'message' => 'Data kosong'], 400);

        $siswaMap = Siswa::pluck('id', 'nisn')->toArray();

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                // Ubah semua key array jadi lowercase biar "Sakit", "sakit", "SAKIT" terbaca sama
                $row = array_change_key_case($row, CASE_LOWER);

                $nisn = (string)($row['nisn'] ?? '');
                if (!isset($siswaMap[$nisn])) continue;

                AbsensiPKL::updateOrCreate(
                    ['siswa_id' => $siswaMap[$nisn]],
                    [
                        'sakit' => (int)($row['sakit'] ?? 0),
                        'izin' => (int)($row['izin'] ?? 0),
                        'alpha' => (int)($row['alpha'] ?? 0),
                        'catatan' => $row['catatan'] ?? ''
                    ]
                );
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => 'Import absensi berhasil']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => $e->getMessage()], 500);
        }
    }
}
