import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
import { Search, Save, Filter, Download, Upload, FileText, Loader2, Check, ChevronsUpDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from 'sonner';
import { exportToExcel, parseExcelFile, downloadExcelTemplate } from '@/utils/excelUtils';
import { exportTableToPDF } from '@/utils/pdfUtils';
import api from '@/lib/axios';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList, // Tambahan untuk struktur baru shadcn
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

// Tipe data disesuaikan dengan response Backend
interface MappingData {
  id: number; // ID Siswa
  namaSiswa: string;
  nisn: string;
  kelas: string;
  tempatPKLId: string | null; // Simpan ID-nya
  instrukturPKLId: string | null;
  pembimbingSekolahId: string | null;
}

// Tipe data untuk Options Dropdown
interface OptionItem {
    id: number;
    nama: string;
}

// Komponen Select dengan Search (Select2 Style)
const SearchableSelect = ({ 
  value, 
  options, 
  onSelect, 
  placeholder 
}: { 
  value: string | null; 
  options: OptionItem[]; 
  onSelect: (val: string) => void; 
  placeholder: string;
}) => {
  const [open, setOpen] = useState(false);

  // Cari label berdasarkan value ID
  const selectedLabel = options.find((opt) => opt.id.toString() === value)?.nama;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between font-normal bg-card border-2"
        >
          <span className="truncate">
            {value && selectedLabel ? selectedLabel : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0 border-2">
        <Command>
          <CommandInput placeholder={`Cari ${placeholder.toLowerCase()}...`} />
          <CommandList>
            <CommandEmpty>Tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {options.map((opt) => (
                <CommandItem
                  key={opt.id}
                  value={opt.nama} // Search by nama
                  onSelect={() => {
                    onSelect(opt.id.toString());
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === opt.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {opt.nama}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const MappingPKL = () => {
  const [mappings, setMappings] = useState<MappingData[]>([]);
  const [originalMappings, setOriginalMappings] = useState<MappingData[]>([]); // Buat deteksi perubahan
  
  // State untuk Dropdown Options (Dinamis dari DB)
  const [tempatOptions, setTempatOptions] = useState<OptionItem[]>([]);
  const [instrukturOptions, setInstrukturOptions] = useState<OptionItem[]>([]);
  const [pembimbingOptions, setPembimbingOptions] = useState<OptionItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterTempat, setFilterTempat] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch All Data (Siswa + Options) ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
        const response = await api.get('/mapping');
        if(response.data.success) {
            const { mappings, options } = response.data.data;
            
            // Convert ID numbers to string for Select component value handling
            const formattedMappings = mappings.map((m: any) => ({
                ...m,
                tempatPKLId: m.tempatPKLId ? m.tempatPKLId.toString() : null,
                instrukturPKLId: m.instrukturPKLId ? m.instrukturPKLId.toString() : null,
                pembimbingSekolahId: m.pembimbingSekolahId ? m.pembimbingSekolahId.toString() : null,
            }));

            setMappings(formattedMappings);
            setOriginalMappings(JSON.stringify(formattedMappings) as any); // Deep copy for comparison

            setTempatOptions(options.tempat);
            setInstrukturOptions(options.instruktur);
            setPembimbingOptions(options.pembimbing);
        }
    } catch (error) {
        toast.error('Gagal memuat data mapping');
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Filtering Logic ---
  const kelasOptions = [...new Set(mappings.map((s) => s.kelas))];

  // Reset halaman ke 1 jika filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterKelas, filterTempat]);

  const filteredMappings = mappings.filter((m) => {
    const matchSearch =
      m.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nisn.includes(searchTerm);
    const matchKelas = filterKelas === 'all' || m.kelas === filterKelas;
    const matchTempat = filterTempat === 'all' || m.tempatPKLId === filterTempat;
    return matchSearch && matchKelas && matchTempat;
  });

  // Hitung Data Paginasi
  const totalPages = Math.ceil(filteredMappings.length / itemsPerPage);
  const paginatedData = filteredMappings.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // --- Update Local State ---
  const updateMapping = (id: number, field: keyof MappingData, value: string) => {
    setMappings(
      mappings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  // --- Save to Backend ---
  const handleSave = async () => {
    setIsSaving(true);
    try {
        // Kirim semua data mapping ke backend untuk disimpan
        await api.post('/mapping/save', { mappings });
        toast.success('Mapping PKL berhasil disimpan');
        fetchData(); // Refresh data
    } catch (error) {
        toast.error('Gagal menyimpan mapping');
    } finally {
        setIsSaving(false);
    }
  };

  // --- Export Logic ---
  const handleExportExcel = () => {
    const exportData = mappings.map((m, i) => {
        // Helper buat cari nama berdasarkan ID
        const tempat = tempatOptions.find(t => t.id.toString() === m.tempatPKLId)?.nama || '-';
        const instruktur = instrukturOptions.find(t => t.id.toString() === m.instrukturPKLId)?.nama || '-';
        const pembimbing = pembimbingOptions.find(t => t.id.toString() === m.pembimbingSekolahId)?.nama || '-';

        return {
            No: i + 1,
            'Nama Siswa': m.namaSiswa,
            NISN: m.nisn,
            Kelas: m.kelas,
            'Tempat PKL': tempat,
            'Instruktur PKL': instruktur,
            'Pembimbing Sekolah': pembimbing,
        };
    });
    exportToExcel(exportData, 'Mapping_PKL', 'Mapping PKL');
    toast.success('Data berhasil diekspor ke Excel');
  };

  const handleDownloadTemplate = () => {
    // Header sesuai dengan yang dibaca oleh fungsi handleImportExcel
    const headers = [
      'Nama Siswa', 
      'NISN',       // Opsional (Bantuan visual buat user)
      'Kelas',      // Opsional (Bantuan visual buat user)
      'Tempat PKL', // Wajib diisi sesuai Master Data
      'Instruktur PKL', 
      'Pembimbing Sekolah'
    ];
    
    downloadExcelTemplate(headers, 'Template_Mapping_PKL');
    toast.success('Template Excel berhasil diunduh');
  };

  const handleExportPDF = () => {
    // Kita perlu mapping data dulu biar yang muncul Nama bukan ID
    const pdfData = filteredMappings.map(m => ({
        ...m,
        tempatPKL: tempatOptions.find(t => t.id.toString() === m.tempatPKLId)?.nama || '-',
        instrukturPKL: instrukturOptions.find(t => t.id.toString() === m.instrukturPKLId)?.nama || '-',
        pembimbingSekolah: pembimbingOptions.find(t => t.id.toString() === m.pembimbingSekolahId)?.nama || '-',
    }));

    const columns: { key: string; header: string }[] = [
      { key: 'namaSiswa', header: 'Nama Siswa' },
      { key: 'nisn', header: 'NISN' },
      { key: 'kelas', header: 'Kelas' },
      { key: 'tempatPKL', header: 'Tempat PKL' },
      { key: 'instrukturPKL', header: 'Instruktur PKL' },
      { key: 'pembimbingSekolah', header: 'Pembimbing Sekolah' },
    ];
    exportTableToPDF(pdfData as any, columns, 'Data Mapping PKL', 'Mapping_PKL');
    toast.success('Data berhasil diekspor ke PDF');
  };

  // --- Import Logic (Simplified for Demo) ---
  // Import Excel disini agak kompleks karena harus mencocokkan Nama Tempat ke ID.
  // Untuk tutorial ini, kita fokus Import hanya menampilkan notifikasi simulasi dulu
  // atau user harus import Data Siswa, Tempat, dll secara terpisah.  
  
  // --- Import Logic ---
  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('Menganalisis file Excel...');

    try {
      // 1. Parsing Excel
      // Pastikan template excel headernya: "Nama Siswa", "Tempat PKL", "Instruktur PKL", "Pembimbing Sekolah"
      const parsedData = await parseExcelFile<{
        'Nama Siswa': string;
        'Tempat PKL'?: string;
        'Instruktur PKL'?: string;
        'Pembimbing Sekolah'?: string;
      }>(file);

      if (parsedData.length === 0) {
        toast.error('File Excel kosong atau format salah', { id: loadingToast });
        return;
      }

      // 2. Format Data untuk dikirim ke Backend
      const formattedPayload = parsedData.map(row => ({
        namaSiswa: row['Nama Siswa'] || '',
        tempatPKL: row['Tempat PKL'] || '',
        instrukturPKL: row['Instruktur PKL'] || '',
        pembimbingSekolah: row['Pembimbing Sekolah'] || ''
      })).filter(item => item.namaSiswa); // Hapus baris tanpa nama siswa

      // 3. Kirim ke Backend
      toast.loading('Mencocokkan data dengan database...', { id: loadingToast });
      
      const response = await api.post('/mapping/import', { data: formattedPayload });

      if (response.data.success) {
        toast.success(response.data.message, { id: loadingToast });
        fetchData(); // Refresh tabel otomatis
      }

    } catch (error: any) {
      console.error(error);
      toast.error('Gagal import: ' + (error.response?.data?.message || 'Terjadi kesalahan'), { id: loadingToast });
    } finally {
      // Reset input file biar bisa pilih file yang sama lagi kalau mau
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <PageHeader
        title="Mapping Anggota PKL"
        description="Atur penempatan siswa PKL dengan pembimbing dan tempat PKL"
        actions={
          <div className="flex flex-wrap gap-2">
            {/* Input File Tersembunyi (Wajib ada buat Import) */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />
            
            {/* Tombol Download Template */}
            <Button
              variant="outline"
              onClick={handleDownloadTemplate}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>

            {/* Tombol Import Excel (Sudah di-uncomment & aktif) */}
            <Button
              variant="outline"
              onClick={handleImportExcel}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportExcel}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="border-2 border-border shadow-brutal mb-6 animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nama atau NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter Kelas</Label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map((kelas) => (
                    <SelectItem key={kelas} value={kelas}>
                      {kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter Tempat PKL</Label>
              <Select value={filterTempat} onValueChange={setFilterTempat}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih Tempat" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  <SelectItem value="all">Semua Tempat</SelectItem>
                  {tempatOptions.map((tempat) => (
                    <SelectItem key={tempat.id} value={tempat.id.toString()}>
                      {tempat.nama}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-border rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-bold">Mengambil data...</span>
        </div>
      ) : (
      <div className="border-2 border-border shadow-brutal bg-card overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border bg-muted hover:bg-muted">
                <TableHead className="font-bold">No</TableHead>
                <TableHead className="font-bold">Nama Siswa</TableHead>
                <TableHead className="font-bold">NISN</TableHead>
                <TableHead className="font-bold">Kelas</TableHead>
                <TableHead className="font-bold min-w-[200px]">Tempat PKL</TableHead>
                <TableHead className="font-bold min-w-[200px]">Instruktur PKL</TableHead>
                <TableHead className="font-bold min-w-[200px]">Pembimbing Sekolah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedData.length > 0 ? (
                paginatedData.map((mapping, index) => (
                  <TableRow
                    key={mapping.id}
                    className="border-b-2 border-border hover:bg-muted/50 animate-fade-in"
                  >
                    {/* Nomor urut menyesuaikan halaman */}
                    <TableCell className="font-medium">
                      {(currentPage - 1) * itemsPerPage + index + 1}
                    </TableCell>
                    <TableCell className="font-medium">{mapping.namaSiswa}</TableCell>
                    <TableCell>{mapping.nisn}</TableCell>
                    <TableCell>{mapping.kelas}</TableCell>
                    
                    {/* Tempat PKL - Searchable */}
                    <TableCell className="min-w-[250px]">
                      <SearchableSelect
                        value={mapping.tempatPKLId}
                        options={tempatOptions}
                        placeholder="Pilih Tempat"
                        onSelect={(val) => updateMapping(mapping.id, 'tempatPKLId', val)}
                      />
                    </TableCell>

                    {/* Instruktur PKL - Searchable */}
                    <TableCell className="min-w-[250px]">
                      <SearchableSelect
                        value={mapping.instrukturPKLId}
                        options={instrukturOptions}
                        placeholder="Pilih Instruktur"
                        onSelect={(val) => updateMapping(mapping.id, 'instrukturPKLId', val)}
                      />
                    </TableCell>

                    {/* Pembimbing Sekolah - Searchable */}
                    <TableCell className="min-w-[250px]">
                      <SearchableSelect
                        value={mapping.pembimbingSekolahId}
                        options={pembimbingOptions}
                        placeholder="Pilih Pembimbing"
                        onSelect={(val) => updateMapping(mapping.id, 'pembimbingSekolahId', val)}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    Tidak ada data yang cocok.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
        {/* Pagination Footer */}
        <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t-2 border-border bg-muted/20 gap-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Baris per halaman:</span>
                <Select
                    value={itemsPerPage.toString()}
                    onValueChange={(val) => {
                        setItemsPerPage(Number(val));
                        setCurrentPage(1);
                    }}
                >
                    <SelectTrigger className="h-8 w-[70px] border-2 bg-card">
                        <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-2">
                        {[10, 20, 50, 100].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                                {size}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <span>
                    Menampilkan {(currentPage - 1) * itemsPerPage + 1}-
                    {Math.min(currentPage * itemsPerPage, filteredMappings.length)} dari {filteredMappings.length} data
                </span>
            </div>

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-2 shadow-brutal-sm hover:shadow-none h-8 w-8 p-0"
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm font-bold">
                    Halaman {currentPage} dari {Math.max(1, totalPages)}
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages || totalPages === 0}
                    className="border-2 shadow-brutal-sm hover:shadow-none h-8 w-8 p-0"
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default MappingPKL;