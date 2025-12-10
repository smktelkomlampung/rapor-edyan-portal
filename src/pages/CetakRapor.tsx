import { useState, useEffect } from 'react';
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
import { 
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Printer, Eye, FileText, User, Building2, GraduationCap, Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { generateRaporPDF } from '@/utils/pdfUtils';
import api from '@/lib/axios';
import { cn } from "@/lib/utils";

// Interface Data Gabungan
interface RaporDataComplete {
    siswa: {
        id: number;
        nama: string;
        nisn: string;
        kelas: string;
        programKeahlian: string;
        konsentrasiKeahlian: string;
    };
    mapping: {
        tempat: string;
        instruktur: string;
        pembimbing: string;
    };
    nilai: {
        tp: string;
        skor: number;
        deskripsi: string;
    }[];
    absensi: {
        sakit: number;
        izin: number;
        alpha: number;
        catatan: string;
    };
}

const CetakRapor = () => {
  // State
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  
  const [siswaOptions, setSiswaOptions] = useState<{id: number, nama: string}[]>([]);
  const [selectedSiswaId, setSelectedSiswaId] = useState<number | null>(null);
  const [openCombobox, setOpenCombobox] = useState(false);

  const [previewData, setPreviewData] = useState<RaporDataComplete | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Settings Sekolah (Bisa dipindah ke database Settings nanti)
  const settings = {
    namaSekolah: 'SMK TELKOM LAMPUNG',
    tahunPelajaran: '2024/2025',
    tanggalMulai: '15 Juli 2024',
    tanggalAkhir: '13 Desember 2024',
    namaKepalaSekolah: 'ADANG WIHANDA, S.T.',
    nipKepala: '-',
    waliKelas: 'KHAFIDH FEBRIANSYAH, S.Pd.', // Idealnya dari DB
    kota: 'Pringsewu',
    tanggalCetak: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
  };

  // 1. Load Kelas
  useEffect(() => {
    api.get('/siswa').then(res => {
        if(res.data.success) {
            const allSiswa = res.data.data;
            const uniqueKelas = [...new Set(allSiswa.map((s: any) => s.kelas))] as string[];
            setKelasOptions(uniqueKelas.sort());
        }
    });
  }, []);

  // 2. Load Siswa saat Kelas berubah
  useEffect(() => {
    if(selectedKelas) {
        // Ambil data dari endpoint Nilai (karena disana sudah terstruktur per kelas)
        // Atau bisa dari endpoint Siswa biasa. Kita pakai endpoint Nilai biar sekalian cek kelengkapan.
        api.get(`/nilai-pkl?kelas=${selectedKelas}`).then(res => {
            if(res.data.success) {
                // Map data siswa untuk dropdown
                const options = res.data.data.siswa.map((s: any) => ({
                    id: s.id,
                    nama: s.nama
                }));
                setSiswaOptions(options);
            }
        });
        setSelectedSiswaId(null);
        setPreviewData(null);
    }
  }, [selectedKelas]);

  // 3. Generate Preview Data (Fetch Realtime dari berbagai endpoint)
  const handlePreview = async () => {
    if (!selectedSiswaId) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
        // Kita butuh 3 data: Mapping, Nilai, Absensi.
        // Karena endpoint backend kita terpisah, kita panggil paralel.
        // (Idealnya backend punya 1 endpoint /rapor/{id} yg menggabungkan ini)
        
        // A. Ambil Info Siswa & Nilai
        const resNilai = await api.get(`/nilai-pkl?kelas=${selectedKelas}`);
        const dataNilaiRaw = resNilai.data.data;
        const siswaNilai = dataNilaiRaw.siswa.find((s:any) => s.id === selectedSiswaId);
        
        // Format Nilai
        const nilaiFormatted = dataNilaiRaw.tujuanPembelajaran.map((tp: any) => {
            const n = siswaNilai.nilai[tp.id] || { skor: 0, deskripsi: '-' };
            return {
                tp: tp.nama.replace(/<[^>]*>?/gm, ''), // Hapus tag HTML
                skor: n.skor,
                deskripsi: n.deskripsi || '-'
            };
        });

        // B. Ambil Mapping
        const resMapping = await api.get('/mapping');
        const mappingRaw = resMapping.data.data.mappings.find((m:any) => m.id === selectedSiswaId);
        // Perlu cari nama text dari ID mapping (karena backend kirim ID)
        // Ini agak tricky tanpa endpoint khusus detail siswa.
        // Asumsi: Kita pakai placeholder dulu jika mapping belum ideal di backend, 
        // ATAU kita perbaiki backend MappingController index untuk kirim object nama juga.
        // SEMENTARA: Kita ambil dari list option yang dikirim MappingController
        const tempatList = resMapping.data.data.options.tempat;
        const instrukturList = resMapping.data.data.options.instruktur;
        const pembimbingList = resMapping.data.data.options.pembimbing;

        const namaTempat = tempatList.find((t:any) => t.id == mappingRaw.tempatPKLId)?.nama || '-';
        const namaInstruktur = instrukturList.find((i:any) => i.id == mappingRaw.instrukturPKLId)?.nama || '-';
        const namaPembimbing = pembimbingList.find((p:any) => p.id == mappingRaw.pembimbingSekolahId)?.nama || '-';

        // C. Ambil Absensi
        const resAbsen = await api.get(`/absensi?kelas=${selectedKelas}`);
        const absenRaw = resAbsen.data.data.find((a:any) => a.id === selectedSiswaId);

        // Gabungkan Data
        const completeData: RaporDataComplete = {
            siswa: {
                id: selectedSiswaId,
                nama: siswaNilai.nama,
                nisn: siswaNilai.nisn,
                kelas: selectedKelas,
                programKeahlian: 'Teknik Jaringan Komputer dan Telekomunikasi', // Hardcoded / Ambil dari DB
                konsentrasiKeahlian: 'Teknik Komputer dan Jaringan', // Hardcoded / Ambil dari DB
            },
            mapping: {
                tempat: namaTempat,
                instruktur: namaInstruktur,
                pembimbing: namaPembimbing
            },
            nilai: nilaiFormatted,
            absensi: {
                sakit: absenRaw?.sakit || 0,
                izin: absenRaw?.izin || 0,
                alpha: absenRaw?.alpha || 0,
                catatan: absenRaw?.catatan || 'Sudah melakukan kegiatan PKL dengan baik.'
            }
        };

        setPreviewData(completeData);
        toast.success('Data siap dicetak');

    } catch (error) {
        console.error(error);
        toast.error('Gagal mengambil data rapor');
    } finally {
        setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!previewData) return;

    const doc = generateRaporPDF({
      nama: previewData.siswa.nama,
      nisn: previewData.siswa.nisn,
      kelas: previewData.siswa.kelas,
      programKeahlian: previewData.siswa.programKeahlian,
      konsentrasiKeahlian: previewData.siswa.konsentrasiKeahlian,
      tempatPKL: previewData.mapping.tempat,
      instruktur: previewData.mapping.instruktur,
      pembimbing: previewData.mapping.pembimbing,
      tanggalMulai: settings.tanggalMulai,
      tanggalAkhir: settings.tanggalAkhir,
      nilai: previewData.nilai,
      catatan: previewData.absensi.catatan,
      absensi: previewData.absensi,
      settings: {
        sekolah: settings.namaSekolah,
        tahunAjaran: settings.tahunPelajaran,
        kepalaSekolah: settings.namaKepalaSekolah,
        nipKepala: settings.nipKepala,
        waliKelas: settings.waliKelas,
        tanggalCetak: settings.tanggalCetak,
        kota: settings.kota
      }
    });

    doc.save(`Rapor_PKL_${previewData.siswa.nama.replace(/\s+/g, '_')}.pdf`);
    toast.success('Rapor berhasil didownload');
  };

  return (
    <div>
      <PageHeader
        title="Cetak Rapor PKL"
        description="Cetak laporan Praktik Kerja Industri dalam format PDF"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Panel Kontrol Kiri */}
        <Card className="border-2 border-border shadow-brutal animate-slide-up h-fit">
          <CardHeader className="border-b-2 border-border">
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Filter & Cetak
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            
            {/* 1. Filter Kelas */}
            <div className="space-y-2">
              <Label>Pilih Kelas</Label>
              <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="-- Pilih Kelas --" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  {kelasOptions.map((k) => (
                    <SelectItem key={k} value={k}>{k}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 2. Cari Siswa (Combobox Searchable) */}
            <div className="space-y-2">
              <Label>Cari Siswa</Label>
              <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={openCombobox}
                    className="w-full justify-between border-2 bg-card"
                    disabled={!selectedKelas}
                  >
                    {selectedSiswaId
                      ? siswaOptions.find((s) => s.id === selectedSiswaId)?.nama
                      : "Pilih siswa..."}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[300px] p-0 border-2">
                  <Command>
                    <CommandInput placeholder="Ketik nama siswa..." />
                    <CommandList>
                        <CommandEmpty>Siswa tidak ditemukan.</CommandEmpty>
                        <CommandGroup>
                        {siswaOptions.map((siswa) => (
                            <CommandItem
                            key={siswa.id}
                            value={siswa.nama}
                            onSelect={() => {
                                setSelectedSiswaId(siswa.id);
                                setOpenCombobox(false);
                            }}
                            >
                            <Check
                                className={cn(
                                "mr-2 h-4 w-4",
                                selectedSiswaId === siswa.id ? "opacity-100" : "opacity-0"
                                )}
                            />
                            {siswa.nama}
                            </CommandItem>
                        ))}
                        </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handlePreview}
                variant="outline"
                className="flex-1 border-2"
                disabled={!selectedSiswaId || isLoading}
              >
                {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Eye className="w-4 h-4 mr-2" />}
                Preview
              </Button>
              <Button
                onClick={handlePrint}
                className="flex-1 border-2 border-foreground shadow-brutal-sm"
                disabled={!previewData}
              >
                <Printer className="w-4 h-4 mr-2" />
                Cetak PDF
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Panel Preview Kanan */}
        <div className="lg:col-span-2">
          <Card className="border-2 border-border shadow-brutal animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="border-b-2 border-border bg-muted/20">
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Tampilan Rapor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {previewData ? (
                <div className="space-y-6 animate-fade-in text-sm">
                  {/* Kop Surat Mini */}
                  <div className="text-center border-b-2 border-border pb-4 mb-4">
                    <h2 className="font-bold text-lg">{settings.namaSekolah}</h2>
                    <p className="text-muted-foreground">Tahun Pelajaran: {settings.tahunPelajaran}</p>
                  </div>

                  {/* Info Siswa */}
                  <div className="grid grid-cols-2 gap-x-8 gap-y-2 mb-4">
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Nama:</span>
                        <span className="font-bold">{previewData.siswa.nama}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">NISN:</span>
                        <span>{previewData.siswa.nisn}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Kelas:</span>
                        <span>{previewData.siswa.kelas}</span>
                    </div>
                    <div className="grid grid-cols-[100px_1fr]">
                        <span className="text-muted-foreground">Tempat:</span>
                        <span className="font-semibold">{previewData.mapping.tempat}</span>
                    </div>
                  </div>

                  {/* Tabel Nilai Preview */}
                  <div className="border-2 border-border rounded-md overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-muted text-xs uppercase">
                            <tr>
                                <th className="p-2 border-r border-border text-left">Tujuan Pembelajaran</th>
                                <th className="p-2 border-r border-border text-center w-16">Skor</th>
                                <th className="p-2 text-left">Deskripsi</th>
                            </tr>
                        </thead>
                        <tbody className="text-xs">
                            {previewData.nilai.map((n, i) => (
                                <tr key={i} className="border-t border-border">
                                    <td className="p-2 border-r border-border font-medium">{n.tp}</td>
                                    <td className="p-2 border-r border-border text-center font-bold">{n.skor}</td>
                                    <td className="p-2 text-muted-foreground">{n.deskripsi}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>

                  {/* Absensi & Catatan */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-muted/30 p-3 rounded border border-border">
                        <h4 className="font-bold mb-2">Ketidakhadiran</h4>
                        <ul className="space-y-1 text-xs">
                            <li className="flex justify-between"><span>Sakit:</span> <b>{previewData.absensi.sakit} hari</b></li>
                            <li className="flex justify-between"><span>Izin:</span> <b>{previewData.absensi.izin} hari</b></li>
                            <li className="flex justify-between"><span>Alpha:</span> <b>{previewData.absensi.alpha} hari</b></li>
                        </ul>
                    </div>
                    <div className="bg-muted/30 p-3 rounded border border-border">
                        <h4 className="font-bold mb-2">Catatan</h4>
                        <p className="text-xs italic text-muted-foreground">"{previewData.absensi.catatan}"</p>
                    </div>
                  </div>

                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/10 border-2 border-dashed border-border rounded-lg">
                  <GraduationCap className="w-16 h-16 mx-auto mb-4 opacity-20" />
                  <p>Silahkan filter kelas dan pilih siswa untuk melihat preview.</p>
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