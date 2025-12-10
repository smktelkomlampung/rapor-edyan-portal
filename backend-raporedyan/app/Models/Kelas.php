<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Kelas extends Model
{
    use HasFactory;
    protected $table = 'kelas'; // Explicit table name
    protected $fillable = ['nama', 'wali_kelas', 'nip', 'gelar_depan', 'gelar_belakang'];
}
