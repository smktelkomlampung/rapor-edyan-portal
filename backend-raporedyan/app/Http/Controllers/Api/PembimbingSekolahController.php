<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PembimbingSekolah;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PembimbingSekolahController extends Controller
{
    // GET
    public function index()
    {
        $data = PembimbingSekolah::latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // POST (Create)
    public function store(Request $request)
    {
        $request->validate(['nama' => 'required|string']);

        $data = PembimbingSekolah::create(['nama' => $request->nama]);

        return response()->json(['success' => true, 'message' => 'Pembimbing berhasil ditambahkan', 'data' => $data]);
    }

    // PUT (Update)
    public function update(Request $request, $id)
    {
        $pembimbing = PembimbingSekolah::find($id);
        if (!$pembimbing) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $request->validate(['nama' => 'required|string']);

        $pembimbing->update(['nama' => $request->nama]);

        return response()->json(['success' => true, 'message' => 'Pembimbing berhasil diperbarui']);
    }

    // DELETE
    public function destroy($id)
    {
        $pembimbing = PembimbingSekolah::find($id);
        if ($pembimbing) {
            $pembimbing->delete();
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
                // Prevent duplicates
                PembimbingSekolah::firstOrCreate(['nama' => $row['nama']]);
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => count($data) . ' data berhasil diimpor']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()], 500);
        }
    }
}
