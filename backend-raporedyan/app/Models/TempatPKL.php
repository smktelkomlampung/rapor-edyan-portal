<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TempatPKL extends Model
{
    use HasFactory;

    // Pastikan nama tabel sesuai migrasi (kadang Laravel bingung sama singkatan PKL)
    protected $table = 'tempat_pkls';

    protected $fillable = ['nama'];
}
