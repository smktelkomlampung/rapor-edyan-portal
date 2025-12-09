<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PembimbingSekolah extends Model
{
    use HasFactory;

    protected $table = 'pembimbing_sekolahs'; // Explicit table name

    protected $fillable = ['nama'];
}
