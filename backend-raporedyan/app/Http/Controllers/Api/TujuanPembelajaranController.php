<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TujuanPembelajaran;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class TujuanPembelajaranController extends Controller
{
    public function index()
    {
        return response()->json(['success' => true, 'data' => TujuanPembelajaran::latest()->get()]);
    }

    public function store(Request $request)
    {
        $request->validate(['nama' => 'required']);
        $data = TujuanPembelajaran::create(['nama' => $request->nama]);
        return response()->json(['success' => true, 'message' => 'Data berhasil disimpan', 'data' => $data]);
    }

    public function update(Request $request, $id)
    {
        $tp = TujuanPembelajaran::find($id);
        if (!$tp) return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);

        $request->validate(['nama' => 'required']);
        $tp->update(['nama' => $request->nama]);
        return response()->json(['success' => true, 'message' => 'Data berhasil diperbarui']);
    }

    public function destroy($id)
    {
        $tp = TujuanPembelajaran::find($id);
        if ($tp) {
            $tp->delete();
            return response()->json(['success' => true, 'message' => 'Data berhasil dihapus']);
        }
        return response()->json(['success' => false, 'message' => 'Data tidak ditemukan'], 404);
    }

    // IMPORT EXCEL
    public function import(Request $request)
    {
        $data = $request->input('data');
        if (empty($data)) return response()->json(['success' => false, 'message' => 'Data kosong'], 400);

        DB::beginTransaction();
        try {
            foreach ($data as $row) {
                // Bersihkan HTML tags jika import dari excel murni teks, atau biarkan jika mau format
                // Disini kita asumsi import excel isinya teks biasa, kita bungkus <p> biar rapi di WYSIWYG
                $content = $row['nama'];
                if (strip_tags($content) === $content) {
                    $content = "<p>" . $content . "</p>";
                }

                TujuanPembelajaran::create(['nama' => $content]);
            }
            DB::commit();
            return response()->json(['success' => true, 'message' => count($data) . ' data berhasil diimpor']);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json(['success' => false, 'message' => 'Gagal import: ' . $e->getMessage()], 500);
        }
    }
}
