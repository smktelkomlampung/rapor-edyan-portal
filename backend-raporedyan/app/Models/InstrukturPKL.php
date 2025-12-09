<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InstrukturPKL extends Model
{
    use HasFactory;

    protected $table = 'instruktur_pkls'; // Definisikan nama tabel eksplisit

    protected $fillable = ['nama'];
}
