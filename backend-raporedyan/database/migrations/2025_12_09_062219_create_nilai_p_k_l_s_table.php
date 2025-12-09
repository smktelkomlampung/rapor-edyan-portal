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
        Schema::create('nilai_pkls', function (Blueprint $table) {
            $table->id();
            $table->foreignId('siswa_id')->constrained('siswas')->onDelete('cascade');
            $table->foreignId('tujuan_pembelajaran_id')->constrained('tujuan_pembelajarans')->onDelete('cascade');
            $table->integer('skor')->default(0); // Nilai 0-100
            $table->timestamps();

            // Mencegah duplikasi: 1 Siswa hanya punya 1 nilai untuk 1 tujuan
            $table->unique(['siswa_id', 'tujuan_pembelajaran_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('nilai_p_k_l_s');
    }
};
