<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('mappings', function (Blueprint $table) {
            $table->id();

            // Relasi ke Siswa (siswas)
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade')->unique();

            // Relasi ke Tempat PKL (tempat_pkls) - Pastikan pakai 's'
            $table->foreignId('tempat_pkl_id')->nullable()->constrained('tempat_pkls')->onDelete('set null');

            // Relasi ke Instruktur PKL (instruktur_pkls) - Pastikan pakai 's'
            $table->foreignId('instruktur_pkl_id')->nullable()->constrained('instruktur_pkls')->onDelete('set null');

            // Relasi ke Pembimbing Sekolah (pembimbing_sekolahs) - Pastikan pakai 's'
            $table->foreignId('pembimbing_sekolah_id')->nullable()->constrained('pembimbing_sekolahs')->onDelete('set null');

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('mappings');
    }
};
