<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Siswa extends Model
{
    use HasFactory;

    protected $fillable = [
        'nama',
        'nisn',
        'kelas',
        'program_keahlian',
        'konsentrasi_keahlian',
    ];

    public function mapping()
    {
        return $this->hasOne(Mapping::class, 'siswa_id');
    }

    public function nilai()
    {
        return $this->hasMany(NilaiPKL::class, 'siswa_id');
    }

    public function absensi()
    {
        return $this->hasOne(AbsensiPKL::class, 'siswa_id');
    }
}
