<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;

// Public Routes
Route::post('/login', [AuthController::class, 'login']);

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
});
