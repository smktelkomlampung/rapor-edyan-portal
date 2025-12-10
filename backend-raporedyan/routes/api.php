<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);
Route::get('/debug-ai-models', [App\Http\Controllers\Api\NilaiPKLController::class, 'checkAvailableModels']);

// Protected Routes (Butuh Token)
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    // Route Data Siswa
    Route::get('/siswa', [App\Http\Controllers\Api\SiswaController::class, 'index']);
    Route::post('/siswa', [App\Http\Controllers\Api\SiswaController::class, 'store']);
    Route::put('/siswa/{id}', [App\Http\Controllers\Api\SiswaController::class, 'update']);
    Route::delete('/siswa/{id}', [App\Http\Controllers\Api\SiswaController::class, 'destroy']);

    // Route khusus Import Excel
    Route::post('/siswa/bulk', [App\Http\Controllers\Api\SiswaController::class, 'bulkStore']);

    // Route Tempat PKL
    Route::get('/tempat-pkl', [App\Http\Controllers\Api\TempatPKLController::class, 'index']);
    Route::post('/tempat-pkl', [App\Http\Controllers\Api\TempatPKLController::class, 'store']);
    Route::put('/tempat-pkl/{id}', [App\Http\Controllers\Api\TempatPKLController::class, 'update']);
    Route::delete('/tempat-pkl/{id}', [App\Http\Controllers\Api\TempatPKLController::class, 'destroy']);
    Route::post('/tempat-pkl/bulk', [App\Http\Controllers\Api\TempatPKLController::class, 'bulkStore']);

    // Route Instruktur PKL
    Route::get('/instruktur-pkl', [App\Http\Controllers\Api\InstrukturPKLController::class, 'index']);
    Route::post('/instruktur-pkl', [App\Http\Controllers\Api\InstrukturPKLController::class, 'store']);
    Route::put('/instruktur-pkl/{id}', [App\Http\Controllers\Api\InstrukturPKLController::class, 'update']);
    Route::delete('/instruktur-pkl/{id}', [App\Http\Controllers\Api\InstrukturPKLController::class, 'destroy']);
    Route::post('/instruktur-pkl/bulk', [App\Http\Controllers\Api\InstrukturPKLController::class, 'bulkStore']);

    // Route Pembimbing Sekolah
    Route::get('/pembimbing-sekolah', [App\Http\Controllers\Api\PembimbingSekolahController::class, 'index']);
    Route::post('/pembimbing-sekolah', [App\Http\Controllers\Api\PembimbingSekolahController::class, 'store']);
    Route::put('/pembimbing-sekolah/{id}', [App\Http\Controllers\Api\PembimbingSekolahController::class, 'update']);
    Route::delete('/pembimbing-sekolah/{id}', [App\Http\Controllers\Api\PembimbingSekolahController::class, 'destroy']);
    Route::post('/pembimbing-sekolah/bulk', [App\Http\Controllers\Api\PembimbingSekolahController::class, 'bulkStore']);

    // Mapping Routes
    Route::get('/mapping', [App\Http\Controllers\Api\MappingController::class, 'index']);
    Route::post('/mapping/save', [App\Http\Controllers\Api\MappingController::class, 'storeBulk']);
    Route::post('/mapping/import', [App\Http\Controllers\Api\MappingController::class, 'import']);

    // Tujuan Pembelajaran
    Route::get('/tujuan-pembelajaran', [App\Http\Controllers\Api\TujuanPembelajaranController::class, 'index']);
    Route::post('/tujuan-pembelajaran', [App\Http\Controllers\Api\TujuanPembelajaranController::class, 'store']);
    Route::put('/tujuan-pembelajaran/{id}', [App\Http\Controllers\Api\TujuanPembelajaranController::class, 'update']);
    Route::delete('/tujuan-pembelajaran/{id}', [App\Http\Controllers\Api\TujuanPembelajaranController::class, 'destroy']);
    Route::post('/tujuan-pembelajaran/import', [App\Http\Controllers\Api\TujuanPembelajaranController::class, 'import']);

    // Nilai PKL Routes
    Route::get('/nilai-pkl/kelas', [App\Http\Controllers\Api\NilaiPKLController::class, 'getKelasList']);
    Route::get('/nilai-pkl', [App\Http\Controllers\Api\NilaiPKLController::class, 'getByKelas']);
    Route::post('/nilai-pkl/save', [App\Http\Controllers\Api\NilaiPKLController::class, 'storeBulk']);
    Route::post('/nilai-pkl/import', [App\Http\Controllers\Api\NilaiPKLController::class, 'import']);

    Route::post('/nilai-pkl/generate-ai', [App\Http\Controllers\Api\NilaiPKLController::class, 'generateDescription']);

    // Absensi PKL Routes
    Route::get('/absensi/kelas', [App\Http\Controllers\Api\AbsensiPKLController::class, 'getKelasList']);
    Route::get('/absensi', [App\Http\Controllers\Api\AbsensiPKLController::class, 'getByKelas']);
    Route::post('/absensi/save', [App\Http\Controllers\Api\AbsensiPKLController::class, 'storeBulk']);
    Route::post('/absensi/import', [App\Http\Controllers\Api\AbsensiPKLController::class, 'import']);

    // Route khusus cetak massal
    Route::get('/rapor/bulk', [App\Http\Controllers\Api\RaporController::class, 'getBulkData']);

    // Setting Routes
    Route::get('/settings', [App\Http\Controllers\Api\SettingController::class, 'index']);
    Route::post('/settings', [App\Http\Controllers\Api\SettingController::class, 'update']);

    // Route Kelas & Wali Kelas
    Route::get('/kelas', [App\Http\Controllers\Api\KelasController::class, 'index']);
    Route::post('/kelas', [App\Http\Controllers\Api\KelasController::class, 'store']);
    Route::put('/kelas/{id}', [App\Http\Controllers\Api\KelasController::class, 'update']);
    Route::delete('/kelas/{id}', [App\Http\Controllers\Api\KelasController::class, 'destroy']);
    Route::post('/kelas/sync', [App\Http\Controllers\Api\KelasController::class, 'syncFromSiswa']);

    // Dashboard
    Route::get('/dashboard', [App\Http\Controllers\Api\DashboardController::class, 'index']);
});
