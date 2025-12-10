<?php

namespace App\Helpers;

class DeskripsiHelper
{
    public static function generate($tpNama, $skor)
    {
        $tp = strtolower($tpNama);
        $kategori = self::getKategori($tp);
        $range = self::getRange($skor);

        // Ambil kalimat dari kamus berdasarkan kategori dan range nilai
        $templates = self::getDictionary()[$kategori][$range] ?? self::getDefaultDictionary()[$range];

        // Pilih satu kalimat secara acak biar variatif
        return $templates[array_rand($templates)];
    }

    private static function getKategori($tp)
    {
        if (str_contains($tp, 'soft skill') || str_contains($tp, 'komunikasi') || str_contains($tp, 'disiplin')) {
            return 'soft_skill';
        } elseif (str_contains($tp, 'k3lh') || str_contains($tp, 'norma') || str_contains($tp, 'pos') || str_contains($tp, 'apd')) {
            return 'k3lh';
        } elseif (str_contains($tp, 'teknis') || str_contains($tp, 'kompetensi') || str_contains($tp, 'alat')) {
            return 'teknis';
        } elseif (str_contains($tp, 'bisnis') || str_contains($tp, 'wirausaha') || str_contains($tp, 'usaha')) {
            return 'bisnis';
        }
        return 'umum';
    }

    private static function getRange($skor)
    {
        if ($skor >= 91) return 'sangat_baik';
        if ($skor >= 80) return 'baik';
        if ($skor >= 70) return 'cukup';
        return 'kurang';
    }

    private static function getDictionary()
    {
        return [
            // 1. SOFT SKILLS (Referensi: Komunikasi, Kerjasama, Inisiatif)
            'soft_skill' => [
                'sangat_baik' => [
                    "Peserta didik menunjukkan soft skills yang istimewa, sangat proaktif dalam berkomunikasi dengan rekan kerja senior, serta memiliki inisiatif tinggi dalam memecahkan masalah tanpa menunggu instruksi.",
                    "Sangat mampu beradaptasi dengan budaya kerja perusahaan, menunjukkan integritas tinggi, dan menjadi teladan dalam hal kedisiplinan serta etika profesi.",
                    "Kemampuan interpersonal sangat menonjol, mampu membangun hubungan kerja yang harmonis dan efektif dengan seluruh tim di tempat PKL."
                ],
                'baik' => [
                    "Peserta didik memiliki soft skills yang baik sesuai harapan, mampu berkomunikasi dengan sopan, dan menunjukkan sikap kerja yang positif selama pelaksanaan PKL.",
                    "Telah menunjukkan kedisiplinan yang baik dan mampu bekerjasama dalam tim, serta cukup responsif terhadap arahan yang diberikan oleh pembimbing.",
                    "Peserta didik mampu menempatkan diri dengan baik di lingkungan kerja dan menjaga etika profesi yang berlaku di tempat PKL."
                ],
                'cukup' => [
                    // Mirip referensi gambar skor 77
                    "Peserta didik sudah memiliki soft skills sesuai harapan dalam hal penguasaan diri, namun masih perlu ditingkatkan dalam hal komunikasi antar rekan kerja senior dan inisiatif.",
                    "Cukup mampu beradaptasi, namun perlu meningkatkan kedisiplinan waktu dan kepedulian terhadap kebersihan lingkungan kerja agar lebih maksimal.",
                    "Komunikasi sudah berjalan cukup baik, namun perlu lebih percaya diri dalam menyampaikan pendapat atau bertanya terkait tugas yang diberikan."
                ],
                'kurang' => [
                    "Peserta didik perlu pembinaan intensif terkait kedisiplinan dan tata krama di dunia kerja agar dapat beradaptasi dengan lingkungan profesional.",
                    "Masih pasif dalam berkomunikasi dan perlu banyak peningkatan dalam hal inisiatif serta kerjasama tim."
                ]
            ],

            // 2. K3LH & POS (Referensi: APD, SOP, Keselamatan)
            'k3lh' => [
                'sangat_baik' => [
                    "Peserta didik sangat konsisten menerapkan standar K3LH, selalu menggunakan APD lengkap tanpa diminta, dan bekerja sangat rapi sesuai prosedur keselamatan.",
                    "Pemahaman terhadap SOP sangat mendalam, mampu mengidentifikasi potensi bahaya di lingkungan kerja, dan selalu bekerja dengan prinsip keselamatan utama.",
                    "Sangat disiplin terhadap aturan perusahaan dan Prosedur Operasional Standar (POS), serta mampu mengingatkan rekan kerja terkait pentingnya K3LH."
                ],
                'baik' => [
                    // Mirip referensi gambar skor 83
                    "Peserta didik telah menggunakan APD dengan tertib dan benar serta melaksanakan pekerjaan sesuai dengan Prosedur Operasional Standar (POS) yang berlaku.",
                    "Penerapan norma K3LH sudah berjalan baik, selalu menjaga kebersihan area kerja dan mematuhi instruksi keselamatan dari instruktur.",
                    "Mampu bekerja dengan aman sesuai standar perusahaan dan merawat peralatan kerja dengan cukup baik."
                ],
                'cukup' => [
                    "Peserta didik memahami dasar-dasar K3LH, namun terkadang masih perlu diingatkan untuk menggunakan APD secara lengkap pada situasi tertentu.",
                    "Sudah berusaha mengikuti POS, namun perlu lebih teliti dan konsisten dalam menjaga kerapian area kerja setelah selesai bertugas.",
                    "Penerapan prosedur keselamatan cukup baik, tetapi perlu ditingkatkan kesadarannya terhadap potensi risiko kecil di area kerja."
                ],
                'kurang' => [
                    "Peserta didik sering mengabaikan penggunaan APD dan perlu teguran tegas terkait kepatuhan terhadap prosedur keselamatan kerja.",
                    "Kurang peduli terhadap kebersihan dan standar operasional yang berlaku di tempat kerja."
                ]
            ],

            // 3. KOMPETENSI TEKNIS (Referensi: Skill, Ketelitian, Hasil Kerja)
            'teknis' => [
                'sangat_baik' => [
                    "Peserta didik menunjukkan penguasaan kompetensi teknis yang sangat matang, hasil kerjanya presisi, rapi, dan melampaui standar minimal industri.",
                    "Sangat terampil menggunakan peralatan kerja canggih, mampu menyelesaikan trouble-shooting ringan secara mandiri dengan hasil yang memuaskan.",
                    "Kualitas hasil kerja teknis sangat istimewa, menunjukkan kecepatan dan ketepatan yang setara dengan tenaga kerja pemula profesional."
                ],
                'baik' => [
                    "Peserta didik mampu menerapkan kompetensi teknis yang dipelajari di sekolah ke dalam pekerjaan nyata dengan hasil yang baik dan minim kesalahan.",
                    "Penguasaan alat dan materi teknis sudah baik, mampu menyelesaikan tugas harian sesuai target waktu yang ditentukan.",
                    "Keterampilan teknis berkembang dengan baik, mampu mengikuti instruksi teknis dan menghasilkan output kerja yang layak."
                ],
                'cukup' => [
                    // Mirip referensi gambar skor 82 (Ada "namun")
                    "Peserta didik mampu menerapkan kompetensi teknis dan memahami pekerjaan dengan keahlian yang dimiliki, namun masih perlu ditingkatkan pada ketelitian kerja.",
                    "Secara umum mampu mengoperasikan alat, tetapi perlu meningkatkan kecepatan dan kerapian hasil kerja agar sesuai target industri.",
                    "Pemahaman teknis sudah ada, namun seringkali kurang teliti dalam detail pekerjaan finishing sehingga perlu perbaikan."
                ],
                'kurang' => [
                    "Peserta didik masih kesulitan mengoperasikan peralatan dasar dan membutuhkan bimbingan penuh untuk menyelesaikan tugas teknis sederhana.",
                    "Hasil kerja teknis belum memenuhi standar, sering melakukan kesalahan prosedur yang mendasar."
                ]
            ],

            // 4. BISNIS & WIRAUSAHA (Referensi: Alur Bisnis, Mandiri)
            'bisnis' => [
                'sangat_baik' => [
                    "Peserta didik memiliki wawasan bisnis yang tajam, mampu menganalisis alur kerja perusahaan secara sistematis, dan memberikan ide pengembangan usaha.",
                    "Sangat memahami bagaimana profit didapatkan dalam alur bisnis tempat PKL dan menunjukkan jiwa entrepreneurship yang kuat.",
                    "Mampu menjelaskan rencana usaha masa depan dengan sangat logis berdasarkan pengalaman yang didapatkan di tempat PKL."
                ],
                'baik' => [
                    // Mirip referensi gambar skor 79
                    "Peserta didik telah mampu membekali kemandiriannya dengan menguasai identifikasi kegiatan usaha di tempat PKL, serta mampu menjelaskan rencana usaha.",
                    "Memahami alur bisnis dunia kerja dengan baik dan mampu melihat peluang-peluang usaha sederhana di lingkungan kerjanya.",
                    "Wawasan wirausaha berkembang baik, mengerti posisi dan peran setiap divisi dalam menunjang bisnis perusahaan."
                ],
                'cukup' => [
                    "Peserta didik cukup memahami alur bisnis dasar, namun perlu lebih mendalami bagaimana strategi pelayanan konsumen berjalan.",
                    "Sudah mengetahui produk/jasa apa yang dijual, namun belum terlalu memahami proses manajemen di balik layar.",
                    "Memiliki ketertarikan pada wirausaha, namun perlu lebih banyak belajar mengenai manajemen risiko dalam bisnis."
                ],
                'kurang' => [
                    "Peserta didik belum memahami alur bisnis tempat PKL dan cenderung pasif dalam mempelajari aspek non-teknis perusahaan.",
                    "Kurang memiliki gambaran tentang wawasan wirausaha atau proses bisnis yang berjalan."
                ]
            ]
        ];
    }

    private static function getDefaultDictionary()
    {
        return [
            'sangat_baik' => ["Peserta didik menunjukkan penguasaan materi yang sangat baik dan konsisten dalam penerapannya."],
            'baik' => ["Peserta didik mampu menerapkan materi pembelajaran dengan baik di lingkungan kerja."],
            'cukup' => ["Peserta didik cukup memahami materi namun perlu peningkatan dalam konsistensi penerapan."],
            'kurang' => ["Peserta didik perlu bimbingan lebih lanjut untuk memahami materi ini."]
        ];
    }
}
