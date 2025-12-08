import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { TempatPKL } from '@/types';

const initialData: TempatPKL[] = [
  { id: '1', nama: 'PT. Teknologi Nusantara' },
  { id: '2', nama: 'CV. Solusi Digital' },
  { id: '3', nama: 'PT. Inovasi Teknologi' },
];

const TempatPKLPage = () => {
  const [data, setData] = useState<TempatPKL[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TempatPKL | null>(null);
  const [nama, setNama] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: TempatPKL) => {
    if (item) {
      setEditingItem(item);
      setNama(item.nama);
    } else {
      setEditingItem(null);
      setNama('');
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map((item) =>
        item.id === editingItem.id ? { ...item, nama } : item
      ));
      toast.success('Data berhasil diperbarui');
    } else {
      const newItem: TempatPKL = { id: Date.now().toString(), nama };
      setData([...data, newItem]);
      toast.success('Data berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item: TempatPKL) => {
    setData(data.filter((d) => d.id !== item.id));
    toast.success('Data berhasil dihapus');
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Simulate Excel import
      toast.success('File Excel berhasil diimpor', {
        description: file.name,
      });
      // In real implementation, parse Excel file here
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const columns = [{ key: 'nama' as const, header: 'Nama Tempat PKL' }];

  return (
    <div>
      <PageHeader
        title="Tempat PKL"
        description="Kelola data tempat Praktik Kerja Industri"
        actions={
          <div className="flex gap-3">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={handleImportExcel}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button
              onClick={() => handleOpenModal()}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </div>
        }
      />

      <div className="mb-6 animate-fade-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama tempat PKL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-11 border-2 border-border focus:border-primary"
          />
        </div>
      </div>

      <DataTable
        data={filteredData}
        columns={columns}
        onEdit={handleOpenModal}
        onDelete={handleDelete}
      />

      <FormModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        title={editingItem ? 'Edit Tempat PKL' : 'Tambah Tempat PKL'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Tempat PKL</Label>
            <Input
              id="nama"
              value={nama}
              onChange={(e) => setNama(e.target.value)}
              className="border-2"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-2">
              Batal
            </Button>
            <Button type="submit" className="flex-1 border-2 border-foreground shadow-brutal-sm">
              {editingItem ? 'Simpan' : 'Tambah'}
            </Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default TempatPKLPage;
