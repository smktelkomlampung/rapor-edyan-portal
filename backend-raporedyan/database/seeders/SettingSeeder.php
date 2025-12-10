<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Setting;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        Setting::create([
            'nama_sekolah' => 'SMK Negeri 1 Kota Contoh',
            'tahun_pelajaran' => '2024/2025',
            'tanggal_mulai_pkl' => '2024-07-15',
            'tanggal_akhir_pkl' => '2024-12-15',
            'nama_kepala_sekolah' => 'Drs. H. Ahmad, M.Pd.',
            'nip_kepala_sekolah' => '19800101 200501 1 001'
        ]);
    }
}
