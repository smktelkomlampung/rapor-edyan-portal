<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SiswaController extends Controller
{
    // GET: Ambil semua data
    public function index()
    {
        $siswa = Siswa::latest()->get()->map(function ($item) {
            return [
                'id' => $item->id,
                'nama' => $item->nama,
                'nisn' => $item->nisn,
                'kelas' => $item->kelas,
                // Mapping ke format React
                'programKeahlian' => $item->program_keahlian,
                'konsentrasiKeahlian' => $item->konsentrasi_keahlian,
            ];
        });

        return response()->json([
            'success' => true,
            'data' => $siswa
        ]);
    }

    // POST: Tambah satu data
    public function store(Request $request)
    {
        $request->validate([
            'nama' => 'required',
            'nisn' => 'required|unique:siswas,nisn',
            'kelas' => 'required',
            'programKeahlian' => 'required',
            'konsentrasiKeahlian' => 'required',
        ]);

        $siswa = Siswa::create([
            'nama' => $request->nama,
            'nisn' => $request->nisn,
            'kelas' => $request->kelas,
            'program_keahlian' => $request->programKeahlian, // Mapping
            'konsentrasi_keahlian' => $request->konsentrasiKeahlian, // Mapping
        ]);

        return response()->json(['success' => true, 'message' => 'Data berhasil disimpan', 'data' => $siswa]);
    }

    // PUT: Update data
    public function update(Request $request, $id)
    {
        $siswa = Siswa::find($id);
        if (!$siswa) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $request->validate([
            'nama' => 'required',
            'nisn' => 'required|unique:siswas,nisn,' . $id, // Ignore unique self
            'kelas' => 'required',
        ]);

        $siswa->update([
            'nama' => $request->nama,
            'nisn' => $request->nisn,
            'kelas' => $request->kelas,
            'program_keahlian' => $request->programKeahlian,
            'konsentrasi_keahlian' => $request->konsentrasiKeahlian,
        ]);

        return response()->json(['success' => true, 'message' => 'Data berhasil diupdate']);
    }

    // DELETE: Hapus data
    public function destroy($id)
    {
        $siswa = Siswa::find($id);
        if ($siswa) {
            $siswa->delete();
            return response()->json(['success' => true, 'message' => 'Data berhasil dihapus']);
        }
        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
    }

    // POST: Bulk Import dari Excel (Array of Objects)
    public function bulkStore(Request $request)
    {
        $data = $request->input('data'); // Array dari React

        if (empty($data)) {
            return response()->json(['success' => false, 'message' => 'Data kosong'], 400);
        }

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                // Cek duplikasi NISN, kalau ada skip atau update (disini kita pakai updateOrInsert)
                Siswa::updateOrCreate(
                    ['nisn' => $row['nisn']],
                    [
                        'nama' => $row['nama'],
                        'kelas' => $row['kelas'],
                        'program_keahlian' => $row['programKeahlian'],
                        'konsentrasi_keahlian' => $row['konsentrasiKeahlian'],
                    ]
                );
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => count($data) . ' data berhasil diimpor']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()], 500);
        }
    }
}
