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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Save, Download, Upload, Loader2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, parseExcelFile, downloadExcelTemplate } from '@/utils/excelUtils';
import api from '@/lib/axios';

interface SiswaAbsensi {
  id: number;
  nama: string;
  nisn: string;
  sakit: number;
  izin: number;
  alpha: number;
  catatan: string;
}

const AbsensiPKLPage = () => {
  const [kelasOptions, setKelasOptions] = useState<string[]>([]);
  const [selectedKelas, setSelectedKelas] = useState<string>('');
  const [siswaData, setSiswaData] = useState<SiswaAbsensi[]>([]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 1. Fetch List Kelas
  useEffect(() => {
    const fetchKelas = async () => {
        try {
            const res = await api.get('/absensi/kelas');
            if(res.data.success) setKelasOptions(res.data.data);
        } catch (err) {
            toast.error('Gagal memuat daftar kelas');
        }
    };
    fetchKelas();
  }, []);

  // 2. Fetch Data Siswa by Kelas
  const fetchDataByKelas = async (kelas: string) => {
    if(!kelas) return;
    setIsLoading(true);
    try {
        const res = await api.get(`/absensi?kelas=${kelas}`);
        if(res.data.success) {
            setSiswaData(res.data.data);
        }
    } catch (err) {
        toast.error('Gagal memuat data absensi');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if(selectedKelas) {
        fetchDataByKelas(selectedKelas);
    } else {
        setSiswaData([]);
    }
  }, [selectedKelas]);

  // 3. Handle Change Input
  const handleChange = (id: number, field: keyof SiswaAbsensi, val: string) => {
    setSiswaData(prev => prev.map(s => {
        if (s.id === id) {
            let newVal: any = val;
            // Jika field angka, parse integer
            if (['sakit', 'izin', 'alpha'].includes(field)) {
                newVal = parseInt(val) || 0;
                if(newVal < 0) newVal = 0;
            }
            return { ...s, [field]: newVal };
        }
        return s;
    }));
  };

  // 4. Save Data
  const handleSave = async () => {
    if (siswaData.length === 0) return;
    setIsSaving(true);
    try {
        await api.post('/absensi/save', { data: siswaData });
        toast.success('Data absensi berhasil disimpan');
    } catch (err) {
        toast.error('Gagal menyimpan data');
    } finally {
        setIsSaving(false);
    }
  };

  // 5. Excel Logic
  // 5. Excel Logic (Updated: Pre-fill Nama & NISN)
  const handleDownloadTemplate = () => {
    if (siswaData.length === 0) {
        toast.warning("Pilih kelas terlebih dahulu atau data siswa kosong.");
        return;
    }

    // Kita mapping data yang ada di tabel menjadi format Excel
    const templateData = siswaData.map(s => ({
        'Nama Siswa': s.nama,
        'NISN': s.nisn,       // KUNCI UTAMA (Jangan diubah user)
        'Sakit': 0,           // Default 0 sebagai panduan input
        'Izin': 0,
        'Alpha': 0,
        'Catatan': ''         // Kosongkan biar diisi guru
    }));

    // Kita pakai exportToExcel (bukan downloadExcelTemplate lagi) karena sudah ada datanya
    exportToExcel(templateData, `Template_Input_Absensi_${selectedKelas}`, 'Input Absensi');
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
    
    const loadingToast = toast.loading('Mengimpor absensi...');
    try {
        const parsedData = await parseExcelFile<any>(file);
        const response = await api.post('/absensi/import', { data: parsedData });
        
        if(response.data.success) {
            toast.success(response.data.message, { id: loadingToast });
            fetchDataByKelas(selectedKelas);
        }
    } catch (err: any) {
        toast.error('Gagal import: ' + (err.response?.data?.message || 'Error file'), { id: loadingToast });
    } finally {
        if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    const exportData = siswaData.map((s, i) => ({
        No: i + 1,
        'Nama Siswa': s.nama,
        NISN: s.nisn,
        Sakit: s.sakit,
        Izin: s.izin,
        Alpha: s.alpha,
        Total: s.sakit + s.izin + s.alpha,
        Catatan: s.catatan
    }));
    
    exportToExcel(exportData, `Absensi_PKL_${selectedKelas}`, 'Absensi PKL');
    toast.success('Data berhasil diekspor');
  };

  const filteredSiswa = siswaData.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.nisn.includes(searchTerm)
  );

  return (
    <div>
      <PageHeader
        title="Absensi PKL"
        description="Kelola data kehadiran dan catatan perilaku siswa PKL"
        actions={
          <div className="flex flex-wrap gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
            
            <Button variant="outline" onClick={handleDownloadTemplate} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
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
               Simpan Absensi
            </Button>
          </div>
        }
      />

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

      {isLoading ? (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-border rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-bold">Memuat data absensi...</span>
        </div>
      ) : !selectedKelas ? (
        <div className="flex justify-center items-center h-40 border-2 border-dashed border-border rounded-lg bg-muted/20">
            <span className="text-muted-foreground font-medium">Silahkan pilih kelas terlebih dahulu.</span>
        </div>
      ) : (
        <div className="border-2 border-border shadow-brutal bg-card overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="border-b-2 border-border bg-muted hover:bg-muted">
                            <TableHead className="w-[50px] font-bold border-r border-border text-center">No</TableHead>
                            <TableHead className="w-[250px] font-bold border-r border-border">Nama Siswa</TableHead>
                            <TableHead className="w-[80px] font-bold text-center border-r border-border">Sakit</TableHead>
                            <TableHead className="w-[80px] font-bold text-center border-r border-border">Izin</TableHead>
                            <TableHead className="w-[80px] font-bold text-center border-r border-border">Alpha</TableHead>
                            <TableHead className="w-[80px] font-bold text-center border-r border-border">Total</TableHead>
                            <TableHead className="min-w-[200px] font-bold">Catatan Perilaku</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredSiswa.map((siswa, index) => (
                            <TableRow key={siswa.id} className="border-b border-border hover:bg-muted/50">
                                <TableCell className="font-medium text-center border-r border-border">{index + 1}</TableCell>
                                <TableCell className="border-r border-border">
                                    <div className="font-bold">{siswa.nama}</div>
                                    <div className="text-xs text-muted-foreground">{siswa.nisn}</div>
                                </TableCell>
                                
                                {/* Input Angka */}
                                <TableCell className="p-2 border-r border-border">
                                    <Input 
                                        type="number" 
                                        min="0"
                                        className="text-center h-9 border-input focus:border-chart-3 focus:ring-chart-3"
                                        value={siswa.sakit}
                                        onChange={(e) => handleChange(siswa.id, 'sakit', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="p-2 border-r border-border">
                                    <Input 
                                        type="number" 
                                        min="0"
                                        className="text-center h-9 border-input focus:border-primary focus:ring-primary"
                                        value={siswa.izin}
                                        onChange={(e) => handleChange(siswa.id, 'izin', e.target.value)}
                                    />
                                </TableCell>
                                <TableCell className="p-2 border-r border-border">
                                    <Input 
                                        type="number" 
                                        min="0"
                                        className="text-center h-9 border-input focus:border-destructive focus:ring-destructive"
                                        value={siswa.alpha}
                                        onChange={(e) => handleChange(siswa.id, 'alpha', e.target.value)}
                                    />
                                </TableCell>
                                
                                {/* Total Calculated */}
                                <TableCell className="text-center font-bold bg-muted/20 border-r border-border">
                                    {siswa.sakit + siswa.izin + siswa.alpha}
                                </TableCell>

                                {/* Catatan Input */}
                                <TableCell className="p-2">
                                    <Textarea 
                                        placeholder="Catatan perilaku siswa..."
                                        className="min-h-[40px] h-10 resize-none py-2 text-sm focus-visible:ring-primary"
                                        value={siswa.catatan}
                                        onChange={(e) => handleChange(siswa.id, 'catatan', e.target.value)}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredSiswa.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
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

export default AbsensiPKLPage;