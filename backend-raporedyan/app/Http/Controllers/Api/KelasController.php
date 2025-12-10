<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Kelas;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class KelasController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => Kelas::orderBy('nama')->get()]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required|unique:kelas,nama',
            'wali_kelas' => 'required',
        ]);

        Kelas::create($request->all());
        return response()->json(['success' => true, 'message' => 'Data kelas berhasil disimpan']);
    }

    public function update(Request $request, $id)
    {
        $kelas = Kelas::find($id);
        if (!$kelas) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $request->validate([
            'nama' => 'required|unique:kelas,nama,' . $id,
            'wali_kelas' => 'required',
        ]);

        $kelas->update($request->all());
        return response()->json(['success' => true, 'message' => 'Data kelas berhasil diupdate']);
    }

    public function destroy($id)
    {
        $kelas = Kelas::find($id);
        if ($kelas) {
            $kelas->delete();
            return response()->json(['success' => true, 'message' => 'Data berhasil dihapus']);
        }
        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
    }

    // Fitur Spesial: Sinkronisasi dari Data Siswa
    // Ini buat narik nama-nama kelas yang udah ada di tabel Siswa tapi belum ada di tabel Kelas
    public function syncFromSiswa()
    {
        $existingKelas = Kelas::pluck('nama')->toArray();
        $siswaKelas = Siswa::select('kelas')->distinct()->pluck('kelas')->toArray();

        $newCount = 0;
        foreach ($siswaKelas as $k) {
            if (!in_array($k, $existingKelas) && !empty($k)) {
                Kelas::create([
                    'nama' => $k,
                    'wali_kelas' => '-', // Default kosong dulu
                    'nip' => '-'
                ]);
                $newCount++;
            }
        }

        return response()->json(['success' => true, 'message' => "Berhasil menyinkronkan $newCount kelas baru dari data siswa."]);
    }
}
