import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Printer, Eye, FileText, User, Building2, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { generateRaporPDF } from '@/utils/pdfUtils';

interface SiswaRapor {
  id: string;
  nama: string;
  nisn: string;
  kelas: string;
  programKeahlian: string;
  konsentrasiKeahlian: string;
  tempatPKL: string;
  instrukturPKL: string;
  pembimbingSekolah: string;
  nilaiSkor: number;
  nilaiDeskripsi: string;
  nilaiCatatan: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
}

const siswaList: SiswaRapor[] = [
  {
    id: '1',
    nama: 'Ahmad Rizki',
    nisn: '1234567890',
    kelas: 'XII RPL 1',
    programKeahlian: 'Teknik Informatika',
    konsentrasiKeahlian: 'Rekayasa Perangkat Lunak',
    tempatPKL: 'PT. Teknologi Nusantara',
    instrukturPKL: 'Pak Andi Wijaya',
    pembimbingSekolah: 'Drs. Ahmad Sudirman, M.Pd.',
    nilaiSkor: 85,
    nilaiDeskripsi: 'Sangat Baik',
    nilaiCatatan: 'Menunjukkan keterampilan teknis yang baik dalam pengembangan aplikasi',
    sakit: 2,
    izin: 1,
    tanpaKeterangan: 0,
  },
  {
    id: '2',
    nama: 'Siti Nurhaliza',
    nisn: '1234567891',
    kelas: 'XII RPL 1',
    programKeahlian: 'Teknik Informatika',
    konsentrasiKeahlian: 'Rekayasa Perangkat Lunak',
    tempatPKL: 'CV. Solusi Digital',
    instrukturPKL: 'Bu Siti Rahayu',
    pembimbingSekolah: 'Hj. Siti Aminah, S.Pd.',
    nilaiSkor: 90,
    nilaiDeskripsi: 'Sangat Baik',
    nilaiCatatan: 'Komunikasi dan kerjasama tim sangat baik',
    sakit: 0,
    izin: 2,
    tanpaKeterangan: 0,
  },
  {
    id: '3',
    nama: 'Budi Santoso',
    nisn: '1234567892',
    kelas: 'XII RPL 2',
    programKeahlian: 'Teknik Informatika',
    konsentrasiKeahlian: 'Rekayasa Perangkat Lunak',
    tempatPKL: 'PT. Inovasi Teknologi',
    instrukturPKL: 'Pak Budi Hartono',
    pembimbingSekolah: 'Ir. Bambang Susilo',
    nilaiSkor: 78,
    nilaiDeskripsi: 'Baik',
    nilaiCatatan: 'Perlu meningkatkan kedisiplinan dan ketepatan waktu',
    sakit: 1,
    izin: 0,
    tanpaKeterangan: 1,
  },
];

const tujuanPembelajaran = [
  'Menerapkan prosedur keselamatan dan kesehatan kerja',
  'Menganalisis kebutuhan sistem informasi',
  'Merancang antarmuka pengguna (UI/UX)',
  'Mengembangkan aplikasi berbasis web',
  'Mengelola database',
];

const settings = {
  namaSekolah: 'SMK Negeri 1 Kota Contoh',
  tahunPelajaran: '2024/2025',
  tanggalMulai: '6 Januari 2025',
  tanggalAkhir: '30 Juni 2025',
  namaKepalaSekolah: 'Drs. H. Ahmad Sudirman, M.Pd.',
};

const CetakRapor = () => {
  const [selectedSiswa, setSelectedSiswa] = useState<string>('');
  const [previewData, setPreviewData] = useState<SiswaRapor | null>(null);

  const handlePreview = () => {
    const siswa = siswaList.find((s) => s.id === selectedSiswa);
    if (siswa) {
      setPreviewData(siswa);
    } else {
      toast.error('Pilih siswa terlebih dahulu');
    }
  };

  const handlePrint = () => {
    if (!previewData) {
      toast.error('Pilih siswa dan preview terlebih dahulu');
      return;
    }

    const doc = generateRaporPDF({
      namaSiswa: previewData.nama,
      nisn: previewData.nisn,
      kelas: previewData.kelas,
      programKeahlian: previewData.programKeahlian,
      konsentrasiKeahlian: previewData.konsentrasiKeahlian,
      tempatPKL: previewData.tempatPKL,
      instrukturPKL: previewData.instrukturPKL,
      pembimbingSekolah: previewData.pembimbingSekolah,
      tanggalMulai: settings.tanggalMulai,
      tanggalAkhir: settings.tanggalAkhir,
      nilaiSkor: previewData.nilaiSkor,
      nilaiDeskripsi: previewData.nilaiDeskripsi,
      nilaiCatatan: previewData.nilaiCatatan,
      sakit: previewData.sakit,
      izin: previewData.izin,
      tanpaKeterangan: previewData.tanpaKeterangan,
      namaSekolah: settings.namaSekolah,
      tahunPelajaran: settings.tahunPelajaran,
      namaKepalaSekolah: settings.namaKepalaSekolah,
      tujuanPembelajaran,
    });

    doc.save(`Rapor_PKL_${previewData.nama.replace(/\s+/g, '_')}.pdf`);
    toast.success('Rapor berhasil dicetak ke PDF');
  };

  const handlePrintAll = () => {
    siswaList.forEach((siswa) => {
      const doc = generateRaporPDF({
        namaSiswa: siswa.nama,
        nisn: siswa.nisn,
        kelas: siswa.kelas,
        programKeahlian: siswa.programKeahlian,
        konsentrasiKeahlian: siswa.konsentrasiKeahlian,
        tempatPKL: siswa.tempatPKL,
        instrukturPKL: siswa.instrukturPKL,
        pembimbingSekolah: siswa.pembimbingSekolah,
        tanggalMulai: settings.tanggalMulai,
        tanggalAkhir: settings.tanggalAkhir,
        nilaiSkor: siswa.nilaiSkor,
        nilaiDeskripsi: siswa.nilaiDeskripsi,
        nilaiCatatan: siswa.nilaiCatatan,
        sakit: siswa.sakit,
        izin: siswa.izin,
        tanpaKeterangan: siswa.tanpaKeterangan,
        namaSekolah: settings.namaSekolah,
        tahunPelajaran: settings.tahunPelajaran,
        namaKepalaSekolah: settings.namaKepalaSekolah,
        tujuanPembelajaran,
      });
      doc.save(`Rapor_PKL_${siswa.nama.replace(/\s+/g, '_')}.pdf`);
    });
    toast.success(`${siswaList.length} rapor berhasil dicetak`);
  };

  return (
    <div>
      <PageHeader
        title="Cetak Rapor PKL"
        description="Cetak laporan Praktik Kerja Industri dalam format PDF"
        actions={
          <Button
            onClick={handlePrintAll}
            variant="outline"
            className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Printer className="w-4 h-4 mr-2" />
            Cetak Semua Rapor
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Selection */}
        <Card className="border-2 border-border shadow-brutal animate-slide-up">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Pilih Siswa
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Nama Siswa</Label>
              <Select value={selectedSiswa} onValueChange={setSelectedSiswa}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih siswa..." />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  {siswaList.map((siswa) => (
                    <SelectItem key={siswa.id} value={siswa.id}>
                      {siswa.nama} - {siswa.kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1 border-2"
              >
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 border-2 border-foreground shadow-brutal-sm"
                disabled={!previewData}
              >
                <FileText className="w-4 h-4 mr-2" />
                Cetak PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-border shadow-brutal animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="border-b-2 border-border">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Preview Rapor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {previewData ? (
                <div className="space-y-6 animate-fade-in">
                  {/* Header */}
                  <div className="text-center border-b-2 border-border pb-4">
                    <h2 className="text-xl font-bold">{settings.namaSekolah}</h2>
                    <p className="text-lg font-semibold mt-2">LAPORAN PRAKTIK KERJA INDUSTRI (PKL)</p>
                    <p className="text-muted-foreground">Tahun Pelajaran: {settings.tahunPelajaran}</p>
                  </div>

                  {/* Student Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 p-4 bg-muted border-2 border-border">
                      <h3 className="font-bold flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Data Siswa
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Nama:</span> {previewData.nama}</p>
                        <p><span className="text-muted-foreground">NISN:</span> {previewData.nisn}</p>
                        <p><span className="text-muted-foreground">Kelas:</span> {previewData.kelas}</p>
                        <p><span className="text-muted-foreground">Program:</span> {previewData.programKeahlian}</p>
                        <p><span className="text-muted-foreground">Konsentrasi:</span> {previewData.konsentrasiKeahlian}</p>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-muted border-2 border-border">
                      <h3 className="font-bold flex items-center gap-2">
                        <Building2 className="w-4 h-4" />
                        Informasi PKL
                      </h3>
                      <div className="space-y-1 text-sm">
                        <p><span className="text-muted-foreground">Tempat:</span> {previewData.tempatPKL}</p>
                        <p><span className="text-muted-foreground">Instruktur:</span> {previewData.instrukturPKL}</p>
                        <p><span className="text-muted-foreground">Pembimbing:</span> {previewData.pembimbingSekolah}</p>
                        <p><span className="text-muted-foreground">Periode:</span> {settings.tanggalMulai} - {settings.tanggalAkhir}</p>
                      </div>
                    </div>
                  </div>

                  {/* Grades */}
                  <div className="p-4 bg-primary/5 border-2 border-primary">
                    <h3 className="font-bold flex items-center gap-2 mb-3">
                      <GraduationCap className="w-4 h-4" />
                      Penilaian
                    </h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-3xl font-bold text-primary">{previewData.nilaiSkor}</p>
                        <p className="text-sm text-muted-foreground">Skor</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold">{previewData.nilaiDeskripsi}</p>
                        <p className="text-sm text-muted-foreground">Predikat</p>
                      </div>
                      <div>
                        <p className="text-lg">{previewData.sakit + previewData.izin + previewData.tanpaKeterangan}</p>
                        <p className="text-sm text-muted-foreground">Total Absen</p>
                      </div>
                    </div>
                    <p className="mt-4 text-sm bg-card p-3 border-2 border-border">
                      <span className="font-semibold">Catatan:</span> {previewData.nilaiCatatan}
                    </p>
                  </div>

                  {/* Attendance */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-chart-3/10 border-2 border-chart-3 text-center">
                      <p className="text-2xl font-bold">{previewData.sakit}</p>
                      <p className="text-sm">Sakit</p>
                    </div>
                    <div className="p-4 bg-primary/10 border-2 border-primary text-center">
                      <p className="text-2xl font-bold">{previewData.izin}</p>
                      <p className="text-sm">Izin</p>
                    </div>
                    <div className="p-4 bg-destructive/10 border-2 border-destructive text-center">
                      <p className="text-2xl font-bold">{previewData.tanpaKeterangan}</p>
                      <p className="text-sm">Tanpa Ket.</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Pilih siswa dan klik Preview untuk melihat rapor</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CetakRapor;
