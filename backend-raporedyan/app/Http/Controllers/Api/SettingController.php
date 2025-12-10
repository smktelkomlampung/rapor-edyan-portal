<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    // Ambil Data (Selalu baris pertama)
    public function index()
    {
        $setting = Setting::first();
        if (!$setting) {
            // Fallback jika belum ada data (walau harusnya ada dari seeder)
            $setting = Setting::create(['nama_sekolah' => 'Sekolah Belum Disetting']);
        }
        return response()->json(['success' => true, 'data' => $setting]);
    }

    // Update Data
    public function update(Request $request)
    {
        $setting = Setting::first();

        $setting->update([
            'nama_sekolah' => $request->namaSekolah,
            'tahun_pelajaran' => $request->tahunPelajaran,
            'tanggal_mulai_pkl' => $request->tanggalMulaiPKL,
            'tanggal_akhir_pkl' => $request->tanggalAkhirPKL,
            'nama_kepala_sekolah' => $request->namaKepalaSekolah,
            'nip_kepala_sekolah' => $request->nipKepalaSekolah,
            'kota' => $request->kota,
            'tanggal_rapor' => $request->tanggalRapor,
        ]);

        return response()->json(['success' => true, 'message' => 'Pengaturan berhasil disimpan']);
    }
}
