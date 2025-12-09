import { useState, useRef, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Upload, Download, Loader2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { parseExcelFile, exportToExcel, downloadExcelTemplate } from '@/utils/excelUtils';
import type { TujuanPembelajaran } from '@/types';
import api from '@/lib/axios';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import Style Default Quill

const TujuanPembelajaranPage = () => {
  const [data, setData] = useState<TujuanPembelajaran[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TujuanPembelajaran | null>(null);
  
  // State untuk konten Editor
  const [nama, setNama] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Fetch Data ---
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/tujuan-pembelajaran');
      if (response.data.success) {
        setData(response.data.data);
      }
    } catch (error) {
      toast.error('Gagal mengambil data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Helper: Strip HTML tags untuk pencarian & display tabel ---
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const filteredData = data.filter((item) =>
    stripHtml(item.nama).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: TujuanPembelajaran) => {
    if (item) {
      setEditingItem(item);
      setNama(item.nama); // Load konten HTML ke editor
    } else {
      setEditingItem(null);
      setNama('');
    }
    setIsModalOpen(true);
  };

  // --- CRUD Operations ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validasi manual karena ReactQuill kadang menyisakan tag <p><br></p> saat kosong
    if (nama.replace(/<(.|\n)*?>/g, '').trim().length === 0) {
        toast.error('Tujuan Pembelajaran tidak boleh kosong');
        return;
    }

    setIsSaving(true);
    try {
      if (editingItem) {
        await api.put(`/tujuan-pembelajaran/${editingItem.id}`, { nama });
        toast.success('Data berhasil diperbarui');
      } else {
        await api.post('/tujuan-pembelajaran', { nama });
        toast.success('Data berhasil ditambahkan');
      }
      await fetchData(); 
      setIsModalOpen(false);
    } catch (error) {
      toast.error('Gagal menyimpan data');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: TujuanPembelajaran) => {
    if(!window.confirm('Yakin ingin menghapus data ini?')) return;
    try {
      await api.delete(`/tujuan-pembelajaran/${item.id}`);
      toast.success('Data berhasil dihapus');
      fetchData();
    } catch (error) {
      toast.error('Gagal menghapus data');
    }
  };

  // --- Import / Export ---
  const handleDownloadTemplate = () => {
    downloadExcelTemplate(['Tujuan Pembelajaran'], 'Template_Tujuan_Pembelajaran');
    toast.success('Template berhasil diunduh');
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const loadingToast = toast.loading('Mengimpor data...');

    try {
      const importedData = await parseExcelFile<{ 'Tujuan Pembelajaran': string }>(file);
      const formattedData = importedData.map(row => ({
        nama: row['Tujuan Pembelajaran'] || ''
      })).filter(item => item.nama);

      if (formattedData.length === 0) {
        toast.error('File kosong atau format salah', { id: loadingToast });
        return;
      }

      const response = await api.post('/tujuan-pembelajaran/import', { data: formattedData });
      if(response.data.success) {
        toast.success(response.data.message, { id: loadingToast });
        fetchData();
      }
    } catch (error) {
        toast.error('Gagal import Excel', { id: loadingToast });
    } finally {
      if(fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Konfigurasi Kolom Tabel
  const columns = [
    { 
        key: 'nama' as const, 
        header: 'Tujuan Pembelajaran',
        // Custom render biar HTML nya gak berantakan di tabel
        render: (item: TujuanPembelajaran) => (
            <div className="line-clamp-2 text-sm text-muted-foreground" 
                 dangerouslySetInnerHTML={{ __html: item.nama }} 
            />
        )
    }
  ];

  // Konfigurasi Toolbar Editor (Opsional)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}],
      ['clean']
    ],
  };

  return (
    <div>
      <PageHeader
        title="Tujuan Pembelajaran"
        description="Kelola daftar tujuan pembelajaran PKL"
        actions={
            <div className="flex flex-wrap gap-2">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
                
                <Button variant="outline" onClick={handleDownloadTemplate} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
                    <Download className="w-4 h-4 mr-2" /> Template
                </Button>
                <Button variant="outline" onClick={handleImportExcel} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
                    <Upload className="w-4 h-4 mr-2" /> Import Excel
                </Button>
                <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Tambah
                </Button>
            </div>
        }
      />

      <div className="mb-6 animate-fade-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Cari tujuan pembelajaran..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
            className="pl-11 border-2 border-border focus:border-primary" 
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64 border-2 border-dashed border-border rounded-lg">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-2 font-bold">Mengambil data...</span>
        </div>
      ) : (
        <DataTable data={filteredData} columns={columns} onEdit={handleOpenModal} onDelete={handleDelete} />
      )}

      <FormModal 
        open={isModalOpen} 
        onOpenChange={setIsModalOpen} 
        title={editingItem ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran'}
        // Kita perbesar modalnya biar editornya lega
        className="max-w-2xl" 
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Deskripsi Tujuan Pembelajaran</Label>
            
            {/* Rich Text Editor */}
            <div className="border-2 border-foreground rounded-md overflow-hidden bg-background">
                <ReactQuill 
                    theme="snow" 
                    value={nama} 
                    onChange={setNama}
                    modules={modules}
                    className="h-64 mb-12" // mb-12 buat space toolbar bawah quill
                />
            </div>
          </div>
          
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-2">Batal</Button>
            <Button 
                type="submit" 
                disabled={isSaving}
                className="flex-1 border-2 border-foreground shadow-brutal-sm"
            >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingItem ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default TujuanPembelajaranPage;