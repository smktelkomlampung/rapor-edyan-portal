import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Search, Upload, Download, FileText, Filter, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { parseExcelFile, exportToExcel, downloadExcelTemplate } from '@/utils/excelUtils';
import { exportTableToPDF } from '@/utils/pdfUtils';
import type { PembimbingSekolah } from '@/types';
import api from '@/lib/axios';

const PembimbingSekolahPage = () => {
  const [data, setData] = useState<PembimbingSekolah[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PembimbingSekolah | null>(null);
  const [nama, setNama] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/pembimbing-sekolah');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data Pembimbing');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: PembimbingSekolah) => {
    if (item) {
      setEditingItem(item);
      setNama(item.nama);
    } else {
      setEditingItem(null);
      setNama('');
    }
    setIsModalOpen(true);
  };

  // --- CRUD Operations ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingItem) {
        await api.put(`/pembimbing-sekolah/${editingItem.id}`, { nama });
        toast.success('Data berhasil diperbarui');
      } else {
        await api.post('/pembimbing-sekolah', { nama });
        toast.success('Data berhasil ditambahkan');
      }
      await fetchData(); // Refresh data
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: PembimbingSekolah) => {
    if(!window.confirm(`Hapus pembimbing ${item.nama}?`)) return;

    try {
      await api.delete(`/pembimbing-sekolah/${item.id}`);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  // --- Import / Export ---
  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loadingToast = toast.loading('Mengimpor data...');

    try {
      const importedData = await parseExcelFile<{ nama: string; Nama?: string }>(file);
      const formattedData = importedData.map((row) => ({
        nama: row.nama || row.Nama || '',
      })).filter(item => item.nama);

      if (formattedData.length === 0) {
        toast.error("Tidak ada data valid dalam file Excel");
        return;
      }

      // Kirim ke Backend
      const response = await api.post('/pembimbing-sekolah/bulk', { data: formattedData });

      if (response.data.success) {
        toast.success(response.data.message);
        fetchData();
      }
    } catch (error) {
      toast.error('Gagal mengimpor file Excel');
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
      'Nama Pembimbing Sekolah': item.nama,
    }));
    exportToExcel(exportData, 'Data_Pembimbing_Sekolah', 'Pembimbing Sekolah');
    toast.success('Data berhasil diekspor ke Excel');
  };

  const handleExportPDF = () => {
    const columns: { key: keyof PembimbingSekolah; header: string }[] = [
      { key: 'nama', header: 'Nama Pembimbing Sekolah' },
    ];
    exportTableToPDF(filteredData, columns, 'Data Pembimbing Sekolah', 'Pembimbing_Sekolah');
    toast.success('Data berhasil diekspor ke PDF');
  };

  const handleDownloadTemplate = () => {
    downloadExcelTemplate(['Nama'], 'Pembimbing_Sekolah');
    toast.success('Template Excel berhasil diunduh');
  };

  const columns = [{ key: 'nama' as const, header: 'Nama Pembimbing Sekolah' }];

  return (
    <div>
      <PageHeader
        title="Pembimbing Sekolah"
        description="Kelola data pembimbing dari sekolah"
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
              Tambah
            </Button>
          </div>
        }
      />

      <Card className="border-2 border-border shadow-brutal mb-6 animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input 
                placeholder="Cari nama pembimbing..." 
                value={searchTerm} 
                onChange={(e) => setSearchTerm(e.target.value)} 
                className="pl-11 border-2 border-border focus:border-primary" 
            />
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-border rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-bold">Mengambil data...</span>
        </div>
      ) : (
        <DataTable data={filteredData} columns={columns} onEdit={handleOpenModal} onDelete={handleDelete} />
      )}

      <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} title={editingItem ? 'Edit Pembimbing Sekolah' : 'Tambah Pembimbing Sekolah'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Pembimbing Sekolah</Label>
            <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="border-2" required />
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

export default PembimbingSekolahPage;