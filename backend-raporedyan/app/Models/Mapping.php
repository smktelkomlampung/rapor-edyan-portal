<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Mapping extends Model
{
    use HasFactory;

    protected $guarded = ['id'];

    // Definisikan Relasi agar bisa dipanggil di Controller
    public function siswa()
    {
        return $this->belongsTo(Siswa::class, 'siswa_id');
    }

    public function tempatPkl()
    {
        return $this->belongsTo(TempatPKL::class, 'tempat_pkl_id');
    }

    public function instrukturPkl()
    {
        return $this->belongsTo(InstrukturPKL::class, 'instruktur_pkl_id');
    }

    public function pembimbingSekolah()
    {
        return $this->belongsTo(PembimbingSekolah::class, 'pembimbing_sekolah_id');
    }
}
