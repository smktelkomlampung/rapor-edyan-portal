import { useState, useEffect, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Download, Upload, Loader2, Search, Filter, MessageSquareText, Sparkles, Wand2 } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, parseExcelFile, downloadExcelTemplate } from '@/utils/excelUtils';
import api from '@/lib/axios';

// --- Tipe Data ---
interface TujuanPembelajaran {
    id: number;
    nama: string;
}

interface NilaiItem {
    skor: number;
    deskripsi: string;
}

interface SiswaNilai {
    id: number;
    nama: string;
    nisn: string;
    // Key: TP ID, Value: Objek {skor, deskripsi}
    nilai: Record<string, NilaiItem>; 
}

const NilaiPKLPage = () => {
  // --- State Data ---
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [tujuanList, setTujuanList] = useState<TujuanPembelajaran[]>([]);
  const [siswaData, setSiswaData] = useState<SiswaNilai[]>([]);
  
  // --- State UI ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch List Kelas saat pertama load
  useEffect(() => {
    const fetchKelas = async () => {
        try {
            const res = await api.get('/nilai-pkl/kelas');
            if(res.data.success) setKelasOptions(res.data.data);
        } catch (err) {
            toast.error('Gagal memuat daftar kelas');
        }
    };
    fetchKelas();
  }, []);

  // 2. Fetch Data Siswa & TP saat Kelas dipilih
  const fetchDataByKelas = async (kelas: string) => {
    if(!kelas) return;
    setIsLoading(true);
    try {
        const res = await api.get(`/nilai-pkl?kelas=${kelas}`);
        if(res.data.success) {
            setTujuanList(res.data.data.tujuanPembelajaran);
            setSiswaData(res.data.data.siswa);
        }
    } catch (err) {
        toast.error('Gagal memuat data nilai');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if(selectedKelas) {
        fetchDataByKelas(selectedKelas);
    } else {
        setSiswaData([]);
        setTujuanList([]);
    }
  }, [selectedKelas]);

  // 3. Handle Perubahan Skor (Angka)
  const handleScoreChange = (siswaId: number, tpId: number, val: string) => {
    let numVal = parseInt(val);
    if (isNaN(numVal)) numVal = 0;
    if (numVal > 100) numVal = 100;
    if (numVal < 0) numVal = 0;

    setSiswaData(prev => prev.map(s => {
        if (s.id === siswaId) {
            const currentData = s.nilai[tpId] || { skor: 0, deskripsi: '' };
            return {
                ...s,
                nilai: { 
                    ...s.nilai, 
                    [tpId]: { ...currentData, skor: numVal } 
                }
            };
        }
        return s;
    }));
  };

  // 4. Handle Perubahan Deskripsi (Teks)
  const handleDescChange = (siswaId: number, tpId: number, val: string) => {
    setSiswaData(prev => prev.map(s => {
        if (s.id === siswaId) {
            const currentData = s.nilai[tpId] || { skor: 0, deskripsi: '' };
            return {
                ...s,
                nilai: { 
                    ...s.nilai, 
                    [tpId]: { ...currentData, deskripsi: val } 
                }
            };
        }
        return s;
    }));
  };

  // --- AI Generator ---
  // Kita butuh state loading khusus biar gak semua loading
  const [generatingFor, setGeneratingFor] = useState<{sId: number, tpId: number} | null>(null);

  // State Auto Generate Massal
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);
  const [generateProgress, setGenerateProgress] = useState({ current: 0, total: 0 });

  const generateAIDescription = async (siswaId: number, namaSiswa: string, tpId: number, namaTP: string, skor: number) => {
    // 1. Validasi Skor dulu
    if(skor === 0 || !skor) {
        toast.warning('Isi nilai angka terlebih dahulu agar AI bisa menganalisa!');
        return;
    }

    setGeneratingFor({ sId: siswaId, tpId });
    const toastId = toast.loading('AI sedang berpikir...');

    try {
        const res = await api.post('/nilai-pkl/generate-ai', {
            tp: stripHtml(namaTP), // Bersihkan HTML dari TP
            skor: skor,
            nama_siswa: namaSiswa
        });

        if (res.data.success) {
            const deskripsiAI = res.data.data;
            // Update State
            handleDescChange(siswaId, tpId, deskripsiAI);
            toast.success('Deskripsi berhasil dibuat!', { id: toastId });
        }
    } catch (error) {
        toast.error('Gagal generate AI', { id: toastId });
    } finally {
        setGeneratingFor(null);
    }
  };

  // --- Auto Generate Massal ---
  const handleAutoGenerateAll = async () => {
    // 1. Kumpulkan Target (Skor ada, tapi Deskripsi kosong)
    const targets: { sId: number; tpId: number; namaSiswa: string; tpNama: string; skor: number }[] = [];

    siswaData.forEach(s => {
        tujuanList.forEach(tp => {
            const nilai = s.nilai[tp.id];
            // Syarat: Skor > 0 DAN Deskripsi Kosong/Pendek
            if (nilai && nilai.skor > 0 && (!nilai.deskripsi || nilai.deskripsi.trim() === '')) {
                targets.push({
                    sId: s.id,
                    tpId: tp.id,
                    namaSiswa: s.nama,
                    tpNama: tp.nama,
                    skor: nilai.skor
                });
            }
        });
    });

    if (targets.length === 0) {
        toast.info("Semua nilai yang terisi sudah memiliki deskripsi!");
        return;
    }

    if (!window.confirm(`Ditemukan ${targets.length} nilai tanpa deskripsi. Generate otomatis dengan AI sekarang?`)) {
        return;
    }

    setIsAutoGenerating(true);
    setGenerateProgress({ current: 0, total: targets.length });
    const toastId = toast.loading(`Memulai AI Magic... (0/${targets.length})`);

    // 2. Proses Antrian (Sequential biar gak kena Rate Limit Google)
    for (let i = 0; i < targets.length; i++) {
        const t = targets[i];
        
        // Update Progress UI
        setGenerateProgress({ current: i + 1, total: targets.length });
        toast.loading(`AI sedang berpikir... (${i + 1}/${targets.length})\nSiswa: ${t.namaSiswa}`, { id: toastId });

        try {
            // Panggil API Backend yang sudah ada
            const res = await api.post('/nilai-pkl/generate-ai', {
                tp: stripHtml(t.tpNama),
                skor: t.skor,
                nama_siswa: t.namaSiswa
            });

            if (res.data.success) {
                // Update State Lokal langsung
                // Kita panggil setSiswaData update function biar realtime
                setSiswaData(prev => prev.map(s => {
                    if (s.id === t.sId) {
                        const currentData = s.nilai[t.tpId] || { skor: 0, deskripsi: '' };
                        return {
                            ...s,
                            nilai: { 
                                ...s.nilai, 
                                [t.tpId]: { ...currentData, deskripsi: res.data.data } 
                            }
                        };
                    }
                    return s;
                }));
            }
            
            // DELAY SEDIKIT (PENTING!)
            // Google Gemini Free Tier punya limit request per menit.
            // Kita kasih jeda 1-2 detik per request biar aman.
            await new Promise(r => setTimeout(r, 1500)); 

        } catch (error) {
            console.error("Gagal generate untuk", t.namaSiswa);
            // Lanjut ke next item walau error
        }
    }

    toast.success(`Selesai! ${targets.length} deskripsi berhasil dibuat. Jangan lupa Simpan.`, { id: toastId });
    setIsAutoGenerating(false);
  };

  // 5. Simpan ke Backend
  const handleSave = async () => {
    if (siswaData.length === 0) return;
    setIsSaving(true);
    try {
        await api.post('/nilai-pkl/save', { data: siswaData });
        toast.success('Nilai & Deskripsi berhasil disimpan');
    } catch (err) {
        toast.error('Gagal menyimpan nilai');
    } finally {
        setIsSaving(false);
    }
  };

  // 6. Helper & Excel Logic
  const stripHtml = (html: string) => {
     const tmp = document.createElement("DIV");
     tmp.innerHTML = html;
     return (tmp.textContent || tmp.innerText || "").trim();
  };

  // 5. Excel Logic (Updated: Pre-fill Nama & NISN)
  const handleDownloadTemplate = () => {
    // Cek dulu ada data siswa gak?
    if (siswaData.length === 0) {
        toast.warning("Pilih kelas terlebih dahulu atau data siswa kosong.");
        return;
    }

    // Mapping data siswa ke format Excel
    const templateData = siswaData.map(s => {
        const row: any = {
            'Nama Siswa': s.nama,
            'NISN': s.nisn, // Ini KUNCI untuk pencocokan di backend
        };

        // Buat kolom dinamis sesuai Tujuan Pembelajaran
        tujuanList.forEach(tp => {
            const cleanName = stripHtml(tp.nama);
            
            // Kita set default 0 untuk skor dan string kosong untuk deskripsi
            // Biar guru tau kolom mana yang harus diisi
            row[cleanName] = 0; 
            row[`Deskripsi: ${cleanName}`] = ''; 
        });

        return row;
    });

    // Gunakan exportToExcel (bukan downloadExcelTemplate) karena kita bawa data baris
    exportToExcel(templateData, `Template_Input_Nilai_${selectedKelas || 'PKL'}`, 'Input Nilai');
    toast.success('Template dengan data siswa berhasil diunduh');
  };

  const handleImportExcel = () => {
    if(!selectedKelas) {
        toast.warning('Pilih kelas terlebih dahulu!');
        return;
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const loadingToast = toast.loading('Mengimpor nilai...');
    try {
        const parsedData = await parseExcelFile<any>(file);
        
        // Kirim raw data ke backend, backend akan handle pencocokan skor & deskripsi
        const response = await api.post('/nilai-pkl/import', { data: parsedData });
        
        if(response.data.success) {
            toast.success(response.data.message, { id: loadingToast });
            fetchDataByKelas(selectedKelas); // Refresh tabel
        }
    } catch (err: any) {
        toast.error('Gagal import: ' + (err.response?.data?.message || 'Error file'), { id: loadingToast });
    } finally {
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    const exportData = siswaData.map((s, i) => {
        const row: any = {
            No: i + 1,
            'Nama Siswa': s.nama,
            NISN: s.nisn,
        };
        // Flatten data nilai untuk Excel
        tujuanList.forEach(tp => {
            const cleanName = stripHtml(tp.nama);
            const dataNilai = s.nilai[tp.id] || { skor: 0, deskripsi: '' };
            
            row[cleanName] = dataNilai.skor;
            row[`Deskripsi: ${cleanName}`] = dataNilai.deskripsi;
        });
        return row;
    });
    
    exportToExcel(exportData, `Nilai_PKL_${selectedKelas}`, 'Nilai PKL');
    toast.success('Data berhasil diekspor');
  };

  // Filter Client Side (Search Nama)
  const filteredSiswa = siswaData.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn.includes(searchTerm)
  );

  return (
    <div>
      <PageHeader
        title="Input Nilai PKL"
        description="Kelola penilaian dan deskripsi capaian siswa"
        actions={
          <div className="flex flex-wrap gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
            {/* TOMBOL MAGIC AUTO GENERATE */}
            <Button 
                variant="outline" 
                onClick={handleAutoGenerateAll} 
                disabled={isAutoGenerating || siswaData.length === 0}
                className="border-2 border-primary text-primary hover:bg-primary/10 shadow-brutal-sm hover:shadow-none transition-all"
            >
               {isAutoGenerating ? (
                   <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" /> 
                    {generateProgress.current}/{generateProgress.total}
                   </>
               ) : (
                   <>
                    <Wand2 className="w-4 h-4 mr-2" /> 
                    Auto AI
                   </>
               )}
            </Button>
            <Button variant="outline" onClick={handleDownloadTemplate} disabled={tujuanList.length === 0} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
               <Download className="w-4 h-4 mr-2" /> Template
            </Button>
            
            <Button variant="outline" onClick={handleImportExcel} disabled={!selectedKelas} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
               <Upload className="w-4 h-4 mr-2" /> Import
            </Button>
            
            <Button variant="outline" onClick={handleExportExcel} disabled={siswaData.length === 0} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
               <Download className="w-4 h-4 mr-2" /> Export
            </Button>

            <Button onClick={handleSave} disabled={isSaving || siswaData.length === 0} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
               {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Save className="w-4 h-4 mr-2" />}
               Simpan Nilai
            </Button>
          </div>
        }
      />

      {/* Filter Bar */}
      <Card className="border-2 border-border shadow-brutal mb-6 animate-fade-in">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5" /> Filter Data
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Pilih Kelas (Wajib)</Label>
                    <Select value={selectedKelas} onValueChange={setSelectedKelas}>
                        <SelectTrigger className="border-2 bg-card">
                            <SelectValue placeholder="-- Pilih Kelas --" />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-2">
                            {kelasOptions.map(k => (
                                <SelectItem key={k} value={k}>{k}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2">
                    <Label>Cari Siswa</Label>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input 
                            placeholder="Nama atau NISN..." 
                            value={searchTerm} 
                            onChange={(e) => setSearchTerm(e.target.value)} 
                            className="pl-10 border-2" 
                            disabled={!selectedKelas}
                        />
                    </div>
                </div>
            </div>
        </CardContent>
      </Card>

      {/* Table Area */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-border rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-bold">Memuat data nilai...</span>
        </div>
      ) : !selectedKelas ? (
        <div className="flex justify-center items-center h-40 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <span className="text-muted-foreground font-medium">Silahkan pilih kelas terlebih dahulu untuk mengisi nilai.</span>
        </div>
      ) : (
        <div className="border-2 border-border shadow-brutal bg-card overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2 border-border bg-muted hover:bg-muted">
                            <TableHead className="w-[50px] font-bold border-r border-border">No</TableHead>
                            <TableHead className="w-[250px] font-bold border-r border-border">Nama Siswa</TableHead>
                            
                            {/* Dynamic Headers based on TP */}
                            {tujuanList.map(tp => (
                                <TableHead key={tp.id} className="min-w-[150px] font-bold text-center border-r border-border">
                                    <div className="line-clamp-2 text-xs" title={stripHtml(tp.nama)}>
                                        {stripHtml(tp.nama)}
                                    </div>
                                </TableHead>
                            ))}
                            <TableHead className="w-[100px] font-bold text-center">Rata-rata</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSiswa.map((siswa, index) => {
                            // Hitung Rata-rata
                            const scores = Object.values(siswa.nilai).map((n: any) => n.skor || 0);
                            const total = scores.reduce((a: number, b: number) => a + b, 0);
                            const avg = tujuanList.length > 0 ? (total / tujuanList.length).toFixed(1) : "0";

                            return (
                                <TableRow key={siswa.id} className="border-b border-border hover:bg-muted/50">
                                    <TableCell className="font-medium text-center border-r border-border">{index + 1}</TableCell>
                                    <TableCell className="border-r border-border">
                                        <div className="font-bold">{siswa.nama}</div>
                                        <div className="text-xs text-muted-foreground">{siswa.nisn}</div>
                                    </TableCell>

                                    {/* Input Cells */}
                                    {tujuanList.map(tp => (
                                        <TableCell key={tp.id} className="p-2 border-r border-border min-w-[120px]">
                                            <div className="flex items-center gap-1">
                                                {/* Input Skor */}
                                                <Input 
                                                    type="number" 
                                                    min="0" 
                                                    max="100"
                                                    className="text-center h-8 border-input focus:border-primary w-16"
                                                    value={siswa.nilai[tp.id]?.skor || 0}
                                                    onChange={(e) => handleScoreChange(siswa.id, tp.id, e.target.value)}
                                                />

                                                {/* Popover Deskripsi */}
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className={`h-8 w-8 hover:bg-muted ${
                                                                siswa.nilai[tp.id]?.deskripsi 
                                                                    ? "text-primary animate-pulse-slow" 
                                                                    : "text-muted-foreground opacity-50"
                                                            }`}
                                                            title="Isi Deskripsi Capaian"
                                                        >
                                                            <MessageSquareText className="h-4 w-4" />
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-80 border-2 border-foreground shadow-brutal p-3">
                                                        <div className="space-y-2">
                                                            <div className="flex justify-between items-start gap-2">
                                                                <div>
                                                                    <h4 className="font-bold text-sm leading-none">Deskripsi Capaian</h4>
                                                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                                                        {stripHtml(tp.nama)}
                                                                    </p>
                                                                </div>
                                                                
                                                                {/* TOMBOL AI MAGIC */}
                                                                <Button
                                                                    size="sm"
                                                                    variant="outline"
                                                                    className="h-7 text-xs border-primary text-primary hover:bg-primary/10"
                                                                    disabled={generatingFor?.sId === siswa.id && generatingFor?.tpId === tp.id}
                                                                    onClick={() => generateAIDescription(
                                                                        siswa.id, 
                                                                        siswa.nama, 
                                                                        tp.id, 
                                                                        tp.nama, 
                                                                        siswa.nilai[tp.id]?.skor || 0
                                                                    )}
                                                                >
                                                                    {generatingFor?.sId === siswa.id && generatingFor?.tpId === tp.id ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <Sparkles className="h-3 w-3 mr-1" />
                                                                    )}
                                                                    AI
                                                                </Button>
                                                            </div>

                                                            <Textarea 
                                                                placeholder="Ketik manual atau gunakan tombol AI..."
                                                                className="min-h-[100px] text-sm resize-none focus-visible:ring-primary"
                                                                value={siswa.nilai[tp.id]?.deskripsi || ''}
                                                                onChange={(e) => handleDescChange(siswa.id, tp.id, e.target.value)}
                                                            />
                                                        </div>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </TableCell>
                                    ))}

                                    <TableCell className="text-center font-bold bg-muted/20">
                                        {avg}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                        {filteredSiswa.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={tujuanList.length + 3} className="h-24 text-center">
                                    Tidak ada data siswa di kelas ini.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
      )}
    </div>
  );
};

export default NilaiPKLPage;