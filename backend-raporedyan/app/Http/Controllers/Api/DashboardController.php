<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Siswa;
use App\Models\TempatPKL;
use App\Models\InstrukturPKL;
use App\Models\PembimbingSekolah;
use App\Models\Setting;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Ambil Statistik (Count)
        $stats = [
            'total_siswa' => Siswa::count(),
            'total_tempat' => TempatPKL::count(),
            'total_instruktur' => InstrukturPKL::count(),
            'total_pembimbing' => PembimbingSekolah::count(),
        ];

        // 2. Ambil Info Sistem (Settings)
        $setting = Setting::first();

        return response()->json([
            'success' => true,
            'data' => [
                'stats' => $stats,
                'settings' => $setting
            ]
        ]);
    }
}
