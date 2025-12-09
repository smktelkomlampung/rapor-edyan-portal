<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NilaiPKL extends Model
{
    use HasFactory;
    protected $table = 'nilai_pkls';
    protected $guarded = ['id'];
}
