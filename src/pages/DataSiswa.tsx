import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Plus, Search, Upload, Download, FileText, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseExcelFile, exportToExcel, downloadExcelTemplate } from '@/utils/excelUtils';
import { exportTableToPDF } from '@/utils/pdfUtils';
import type { Siswa } from '@/types';
import api from '@/lib/axios'; // Import Axios config

const DataSiswa = () => {
  const [data, setData] = useState<Siswa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterProgram, setFilterProgram] = useState<string>('all');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Siswa | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nisn: '',
    kelas: '',
    programKeahlian: '',
    konsentrasiKeahlian: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data dari Backend ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/siswa');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      console.error(error);
      toast.error('Gagal mengambil data siswa');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Filter Logic (Client Side) ---
  const kelasOptions = [...new Set(data.map((s) => s.kelas))];
  const programOptions = [...new Set(data.map((s) => s.programKeahlian))];

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nisn.includes(searchTerm) ||
      item.kelas.toLowerCase().includes(searchTerm.toLowerCase());
    const matchKelas = filterKelas === 'all' || item.kelas === filterKelas;
    const matchProgram = filterProgram === 'all' || item.programKeahlian === filterProgram;
    return matchSearch && matchKelas && matchProgram;
  });

  const handleOpenModal = (item?: Siswa) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        nama: item.nama,
        nisn: item.nisn,
        kelas: item.kelas,
        programKeahlian: item.programKeahlian,
        konsentrasiKeahlian: item.konsentrasiKeahlian,
      });
    } else {
      setEditingItem(null);
      setFormData({ nama: '', nisn: '', kelas: '', programKeahlian: '', konsentrasiKeahlian: '' });
    }
    setIsModalOpen(true);
  };

  // --- CRUD Operations ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        // Update Data
        await api.put(`/siswa/${editingItem.id}`, formData);
        toast.success('Data siswa berhasil diperbarui');
      } else {
        // Create Data
        await api.post('/siswa', formData);
        toast.success('Data siswa berhasil ditambahkan');
      }
      // Refresh Data & Close Modal
      await fetchData();
      setIsModalOpen(false);
    } catch (error: any) {
      // Handle Validation Error dari Laravel
      const message = error.response?.data?.message || 'Terjadi kesalahan saat menyimpan';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: Siswa) => {
    if(!window.confirm(`Yakin ingin menghapus siswa ${item.nama}?`)) return;

    try {
      await api.delete(`/siswa/${item.id}`);
      toast.success('Data siswa berhasil dihapus');
      fetchData(); // Refresh list
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  // --- Import / Export Logic ---
  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('Sedang memproses import...');

    try {
      const importedData = await parseExcelFile<{
        'Nama Peserta Didik'?: string;
        nama?: string;
        NISN?: string;
        nisn?: string;
        Kelas?: string;
        kelas?: string;
        'Program Keahlian'?: string;
        programKeahlian?: string;
        'Konsentrasi Keahlian'?: string;
        konsentrasiKeahlian?: string;
      }>(file);

      const formattedData = importedData.map((row) => ({
        nama: row['Nama Peserta Didik'] || row.nama || '',
        nisn: (row.NISN || row.nisn || '').toString(),
        kelas: row.Kelas || row.kelas || '',
        programKeahlian: row['Program Keahlian'] || row.programKeahlian || '',
        konsentrasiKeahlian: row['Konsentrasi Keahlian'] || row.konsentrasiKeahlian || '',
      })).filter(item => item.nama && item.nisn); // Filter data kosong

      // Kirim ke Backend Bulk Store
      const response = await api.post('/siswa/bulk', { data: formattedData });
      
      if(response.data.success) {
        toast.success(response.data.message);
        fetchData(); // Refresh Data
      }
    } catch (error: any) {
      const errMsg = error.response?.data?.message || 'Gagal mengimpor file Excel';
      toast.error(errMsg);
    } finally {
      toast.dismiss(loadingToast);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map((item, index) => ({
      No: index + 1,
      'Nama Peserta Didik': item.nama,
      NISN: item.nisn,
      Kelas: item.kelas,
      'Program Keahlian': item.programKeahlian,
      'Konsentrasi Keahlian': item.konsentrasiKeahlian,
    }));
    exportToExcel(exportData, 'Data_Siswa', 'Data Siswa');
    toast.success('Data berhasil diekspor ke Excel');
  };

  const handleExportPDF = () => {
    const columns: { key: keyof Siswa; header: string }[] = [
      { key: 'nama', header: 'Nama Peserta Didik' },
      { key: 'nisn', header: 'NISN' },
      { key: 'kelas', header: 'Kelas' },
      { key: 'programKeahlian', header: 'Program Keahlian' },
      { key: 'konsentrasiKeahlian', header: 'Konsentrasi Keahlian' },
    ];
    exportTableToPDF(filteredData, columns, 'Data Siswa', 'Data_Siswa');
    toast.success('Data berhasil diekspor ke PDF');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(['Nama Peserta Didik', 'NISN', 'Kelas', 'Program Keahlian', 'Konsentrasi Keahlian'], 'Data_Siswa');
    toast.success('Template Excel berhasil diunduh');
  };

  const columns = [
    { key: 'nama' as const, header: 'Nama Peserta Didik' },
    { key: 'nisn' as const, header: 'NISN' },
    { key: 'kelas' as const, header: 'Kelas' },
    { key: 'programKeahlian' as const, header: 'Program Keahlian' },
    { key: 'konsentrasiKeahlian' as const, header: 'Konsentrasi Keahlian' },
  ];

  return (
    <div>
      <PageHeader
        title="Data Siswa"
        description="Kelola data peserta didik PKL"
        actions={
          <div className="flex flex-wrap gap-2">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
            <Button variant="outline" onClick={handleDownloadTemplate} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Template
            </Button>
            <Button variant="outline" onClick={handleImportExcel} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button variant="outline" onClick={handleExportExcel} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button variant="outline" onClick={handleExportPDF} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Siswa
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
              <Label>Cari</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nama, NISN, atau Kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kelas</Label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map((kelas) => (
                    <SelectItem key={kelas} value={kelas}>{kelas}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Program Keahlian</Label>
              <Select value={filterProgram} onValueChange={setFilterProgram}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih Program" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  <SelectItem value="all">Semua Program</SelectItem>
                  {programOptions.map((program) => (
                    <SelectItem key={program} value={program}>{program}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State or Data Table */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-border rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-bold">Mengambil data...</span>
        </div>
      ) : (
        <DataTable
          data={filteredData}
          columns={columns}
          onEdit={handleOpenModal}
          onDelete={handleDelete}
        />
      )}

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingItem ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Peserta Didik</Label>
            <Input id="nama" value={formData.nama} onChange={(e) => setFormData({ ...formData, nama: e.target.value })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nisn">NISN</Label>
            <Input id="nisn" value={formData.nisn} onChange={(e) => setFormData({ ...formData, nisn: e.target.value })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Input id="kelas" value={formData.kelas} onChange={(e) => setFormData({ ...formData, kelas: e.target.value })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="programKeahlian">Program Keahlian</Label>
            <Input id="programKeahlian" value={formData.programKeahlian} onChange={(e) => setFormData({ ...formData, programKeahlian: e.target.value })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="konsentrasiKeahlian">Konsentrasi Keahlian</Label>
            <Input id="konsentrasiKeahlian" value={formData.konsentrasiKeahlian} onChange={(e) => setFormData({ ...formData, konsentrasiKeahlian: e.target.value })} className="border-2" required />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-2">Batal</Button>
            <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 border-2 border-foreground shadow-brutal-sm"
            >
                {isSaving ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Menyimpan...</>
                ) : (
                    editingItem ? 'Simpan' : 'Tambah'
                )}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default DataSiswa;