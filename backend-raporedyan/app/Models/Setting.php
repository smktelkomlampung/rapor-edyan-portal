<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Setting extends Model
{
    use HasFactory;

    // Opsi 1: Buka semua gerbang (Recommended untuk admin panel)
    protected $guarded = ['id'];

    // Opsi 2: Kalau mau tetap pakai fillable, pastikan INI LENGKAP:

    protected $fillable = [
        'nama_sekolah',
        'tahun_pelajaran',
        'tanggal_mulai_pkl',
        'tanggal_akhir_pkl',
        'nama_kepala_sekolah',
        'nip_kepala_sekolah',
        'kota',           // <--- Jangan lupa ini
        'tanggal_rapor',  // <--- Dan ini
    ];
}
