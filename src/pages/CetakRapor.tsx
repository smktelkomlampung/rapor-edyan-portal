import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
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
import { Printer, Eye, FileText, User, Building2, GraduationCap, Check, ChevronsUpDown, Loader2, FolderDown } from 'lucide-react';
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
    waliKelas: string;
    nipWali: string;
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

  const [isZipping, setIsZipping] = useState(false);

  // State untuk Settings Sekolah (Dinamis dari Backend)
  const [settings, setSettings] = useState({
    namaSekolah: '',
    tahunPelajaran: '',
    tanggalMulai: '',
    tanggalAkhir: '',
    namaKepalaSekolah: '',
    nipKepala: '',
    waliKelas: '', // Placeholder, nanti diisi per siswa
    kota: '',
    tanggalCetak: ''
  });

  // 0. Load Settings Sekolah
  useEffect(() => {
    api.get('/settings').then(res => {
        if(res.data.success) {
            const d = res.data.data;
            // Helper format tanggal Indo
            const formatDate = (dateString: string) => {
                if(!dateString) return '-';
                return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            };

            setSettings({
                namaSekolah: d.nama_sekolah || 'Nama Sekolah Belum Diisi',
                tahunPelajaran: d.tahun_pelajaran || '-',
                tanggalMulai: formatDate(d.tanggal_mulai_pkl),
                tanggalAkhir: formatDate(d.tanggal_akhir_pkl),
                namaKepalaSekolah: d.nama_kepala_sekolah || '-',
                nipKepala: d.nip_kepala_sekolah || '-',
                waliKelas: '-', // Akan diupdate saat generate per siswa
                kota: d.kota || 'Kota',
                tanggalCetak: formatDate(d.tanggal_rapor)
            });
        }
    });
  }, []);

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
        api.get(`/nilai-pkl?kelas=${selectedKelas}`).then(res => {
            if(res.data.success) {
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

  // 3. Generate Preview Data
  const handlePreview = async () => {
    if (!selectedSiswaId) {
      toast.error('Pilih siswa terlebih dahulu');
      return;
    }

    setIsLoading(true);
    try {
        const resNilai = await api.get(`/nilai-pkl?kelas=${selectedKelas}`);
        const dataNilaiRaw = resNilai.data.data;
        const siswaNilai = dataNilaiRaw.siswa.find((s:any) => s.id === selectedSiswaId);
        
        const nilaiFormatted = dataNilaiRaw.tujuanPembelajaran.map((tp: any) => {
            const n = siswaNilai.nilai[tp.id] || { skor: 0, deskripsi: '-' };
            return {
                tp: tp.nama.replace(/<[^>]*>?/gm, ''),
                skor: n.skor,
                deskripsi: n.deskripsi || '-'
            };
        });

        // Ambil data lengkap siswa termasuk Wali Kelas dari endpoint Bulk
        const resBulk = await api.get(`/rapor/bulk?kelas=${selectedKelas}`);
        const siswaBulk = resBulk.data.data.find((s:any) => s.id === selectedSiswaId);

        const completeData: RaporDataComplete = {
            siswa: {
                id: selectedSiswaId,
                nama: siswaNilai.nama,
                nisn: siswaNilai.nisn,
                kelas: selectedKelas,
                programKeahlian: siswaBulk?.programKeahlian || 'Teknik Jaringan Komputer dan Telekomunikasi',
                konsentrasiKeahlian: siswaBulk?.konsentrasiKeahlian || 'Teknik Komputer dan Jaringan',
            },
            mapping: {
                tempat: siswaBulk?.tempatPKL || '-',
                instruktur: siswaBulk?.instrukturPKL || '-',
                pembimbing: siswaBulk?.pembimbingSekolah || '-'
            },
            nilai: nilaiFormatted,
            absensi: {
                sakit: siswaBulk?.absensi?.sakit || 0,
                izin: siswaBulk?.absensi?.izin || 0,
                alpha: siswaBulk?.absensi?.alpha || 0,
                catatan: siswaBulk?.absensi?.catatan || 'Sudah melakukan kegiatan PKL dengan baik.'
            },
            // Ambil data Wali Kelas
            // @ts-ignore
            waliKelas: siswaBulk?.waliKelas || '-', 
            nipWali: siswaBulk?.nipWali || '-'
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
        // Gunakan Wali Kelas dari data siswa
        waliKelas: previewData.waliKelas || '-',
        tanggalCetak: settings.tanggalCetak,
        kota: settings.kota
      }
    });

    doc.save(`Rapor_PKL_${previewData.siswa.nama.replace(/\s+/g, '_')}.pdf`);
    toast.success('Rapor berhasil didownload');
  };

  // --- BULK DOWNLOAD LOGIC ---
  const handleDownloadZip = async () => {
    if (!selectedKelas) {
        toast.error('Pilih kelas terlebih dahulu!');
        return;
    }

    setIsZipping(true);
    const toastId = toast.loading('Menyiapkan data rapor sekelas...');

    try {
        const res = await api.get(`/rapor/bulk?kelas=${selectedKelas}`);
        if (!res.data.success) throw new Error('Gagal mengambil data');

        const siswaList = res.data.data;
        const zip = new JSZip();
        const folder = zip.folder(`Rapor_PKL_${selectedKelas.replace(/\s+/g, '_')}`);

        let count = 0;
        
        siswaList.forEach((siswa: any) => {
            const pdfData = {
                nama: siswa.nama,
                nisn: siswa.nisn,
                kelas: siswa.kelas,
                programKeahlian: siswa.programKeahlian,
                konsentrasiKeahlian: siswa.konsentrasiKeahlian,
                tempatPKL: siswa.tempatPKL,
                instruktur: siswa.instrukturPKL,
                pembimbing: siswa.pembimbingSekolah,
                tanggalMulai: settings.tanggalMulai,
                tanggalAkhir: settings.tanggalAkhir,
                nilai: siswa.nilai,
                catatan: siswa.absensi.catatan,
                absensi: siswa.absensi,
                settings: {
                    sekolah: settings.namaSekolah,
                    tahunAjaran: settings.tahunPelajaran,
                    kepalaSekolah: settings.namaKepalaSekolah,
                    nipKepala: settings.nipKepala,
                    // Dynamic Wali Kelas per Siswa
                    waliKelas: siswa.waliKelas || '-', 
                    tanggalCetak: settings.tanggalCetak,
                    kota: settings.kota
                }
            };

            const doc = generateRaporPDF(pdfData);
            const pdfBlob = doc.output('blob');
            
            const namaFile = `${String(count + 1).padStart(2, '0')}_${siswa.nama.replace(/\s+/g, '_')}.pdf`;
            folder?.file(namaFile, pdfBlob);
            count++;
        });

        toast.loading(`Mengkompres ${count} file PDF...`, { id: toastId });
        
        const content = await zip.generateAsync({ type: 'blob' });
        saveAs(content, `Rapor_PKL_${selectedKelas}.zip`);

        toast.success(`Berhasil mengunduh ${count} rapor!`, { id: toastId });

    } catch (error) {
        console.error(error);
        toast.error('Gagal membuat ZIP', { id: toastId });
    } finally {
        setIsZipping(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Cetak Rapor PKL"
        description="Cetak laporan Praktik Kerja Industri dalam format PDF"
        actions={
          <div className="flex gap-2">
             <Button
                onClick={handleDownloadZip}
                disabled={!selectedKelas || isZipping}
                className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all bg-primary text-primary-foreground"
             >
                {isZipping ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <FolderDown className="w-4 h-4 mr-2" />}
                Download ZIP Kelas
             </Button>
          </div>
        }
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

                  {/* Footer TTD (Preview Only) */}
                  <div className="mt-8 flex justify-end text-xs text-muted-foreground">
                      <div className="text-right">
                          <p>{settings.kota}, {settings.tanggalCetak}</p>
                          <p className="mt-8 font-bold underline">{previewData.waliKelas}</p>
                          <p>Wali Kelas</p>
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