<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TempatPKL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TempatPKLController extends Controller
{
    // GET
    public function index()
    {
        $data = TempatPKL::latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // POST (Create)
    public function store(Request $request)
    {
        $request->validate(['nama' => 'required|string']);

        $data = TempatPKL::create(['nama' => $request->nama]);

        return response()->json(['success' => true, 'message' => 'Tempat PKL berhasil ditambahkan', 'data' => $data]);
    }

    // PUT (Update)
    public function update(Request $request, $id)
    {
        $tempat = TempatPKL::find($id);
        if (!$tempat) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $request->validate(['nama' => 'required|string']);

        $tempat->update(['nama' => $request->nama]);

        return response()->json(['success' => true, 'message' => 'Tempat PKL berhasil diupdate']);
    }

    // DELETE
    public function destroy($id)
    {
        $tempat = TempatPKL::find($id);
        if ($tempat) {
            $tempat->delete();
            return response()->json(['success' => true, 'message' => 'Data berhasil dihapus']);
        }
        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
    }

    // BULK IMPORT
    public function bulkStore(Request $request)
    {
        $data = $request->input('data');
        if (empty($data)) return response()->json(['success' => false, 'message' => 'Data kosong'], 400);

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                // Pakai firstOrCreate biar gak ada nama tempat duplikat
                TempatPKL::firstOrCreate(['nama' => $row['nama']]);
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => count($data) . ' data berhasil diimpor']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()], 500);
        }
    }
}
