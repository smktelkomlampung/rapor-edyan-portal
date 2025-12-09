<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\InstrukturPKL;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InstrukturPKLController extends Controller
{
    // GET
    public function index()
    {
        $data = InstrukturPKL::latest()->get();
        return response()->json(['success' => true, 'data' => $data]);
    }

    // POST (Create)
    public function store(Request $request)
    {
        $request->validate(['nama' => 'required|string']);

        $data = InstrukturPKL::create(['nama' => $request->nama]);

        return response()->json(['success' => true, 'message' => 'Instruktur berhasil ditambahkan', 'data' => $data]);
    }

    // PUT (Update)
    public function update(Request $request, $id)
    {
        $instruktur = InstrukturPKL::find($id);
        if (!$instruktur) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $request->validate(['nama' => 'required|string']);

        $instruktur->update(['nama' => $request->nama]);

        return response()->json(['success' => true, 'message' => 'Instruktur berhasil diperbarui']);
    }

    // DELETE
    public function destroy($id)
    {
        $instruktur = InstrukturPKL::find($id);
        if ($instruktur) {
            $instruktur->delete();
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
                // firstOrCreate biar nama instruktur gak dobel
                InstrukturPKL::firstOrCreate(['nama' => $row['nama']]);
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => count($data) . ' data berhasil diimpor']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()], 500);
        }
    }
}
