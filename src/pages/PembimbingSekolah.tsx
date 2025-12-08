import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search, Upload } from 'lucide-react';
import { toast } from 'sonner';
import type { PembimbingSekolah } from '@/types';

const initialData: PembimbingSekolah[] = [
  { id: '1', nama: 'Drs. Ahmad Sudirman, M.Pd.' },
  { id: '2', nama: 'Hj. Siti Aminah, S.Pd.' },
  { id: '3', nama: 'Ir. Bambang Susilo' },
];

const PembimbingSekolahPage = () => {
  const [data, setData] = useState<PembimbingSekolah[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<PembimbingSekolah | null>(null);
  const [nama, setNama] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map((item) =>
        item.id === editingItem.id ? { ...item, nama } : item
      ));
      toast.success('Data berhasil diperbarui');
    } else {
      const newItem: PembimbingSekolah = { id: Date.now().toString(), nama };
      setData([...data, newItem]);
      toast.success('Data berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item: PembimbingSekolah) => {
    setData(data.filter((d) => d.id !== item.id));
    toast.success('Data berhasil dihapus');
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      toast.success('File Excel berhasil diimpor', { description: file.name });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const columns = [{ key: 'nama' as const, header: 'Nama Pembimbing Sekolah' }];

  return (
    <div>
      <PageHeader
        title="Pembimbing Sekolah"
        description="Kelola data pembimbing dari sekolah"
        actions={
          <div className="flex gap-3">
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx,.xls" className="hidden" />
            <Button variant="outline" onClick={handleImportExcel} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Upload className="w-4 h-4 mr-2" />
              Import Excel
            </Button>
            <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
              <Plus className="w-4 h-4 mr-2" />
              Tambah
            </Button>
          </div>
        }
      />

      <div className="mb-6 animate-fade-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Cari nama pembimbing..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 border-2 border-border focus:border-primary" />
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} onEdit={handleOpenModal} onDelete={handleDelete} />

      <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} title={editingItem ? 'Edit Pembimbing Sekolah' : 'Tambah Pembimbing Sekolah'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Pembimbing Sekolah</Label>
            <Input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} className="border-2" required />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-2">Batal</Button>
            <Button type="submit" className="flex-1 border-2 border-foreground shadow-brutal-sm">{editingItem ? 'Simpan' : 'Tambah'}</Button>
          </div>
        </form>
      </FormModal>
    </div>
  );
};

export default PembimbingSekolahPage;
