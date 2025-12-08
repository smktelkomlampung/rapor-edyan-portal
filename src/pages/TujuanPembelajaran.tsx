import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { TujuanPembelajaran } from '@/types';

const initialData: TujuanPembelajaran[] = [
  { id: '1', nama: 'Menerapkan prosedur keselamatan dan kesehatan kerja' },
  { id: '2', nama: 'Menganalisis kebutuhan sistem informasi' },
  { id: '3', nama: 'Merancang antarmuka pengguna (UI/UX)' },
  { id: '4', nama: 'Mengembangkan aplikasi berbasis web' },
  { id: '5', nama: 'Mengelola database' },
];

const TujuanPembelajaranPage = () => {
  const [data, setData] = useState<TujuanPembelajaran[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<TujuanPembelajaran | null>(null);
  const [nama, setNama] = useState('');

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: TujuanPembelajaran) => {
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
      const newItem: TujuanPembelajaran = { id: Date.now().toString(), nama };
      setData([...data, newItem]);
      toast.success('Data berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item: TujuanPembelajaran) => {
    setData(data.filter((d) => d.id !== item.id));
    toast.success('Data berhasil dihapus');
  };

  const columns = [{ key: 'nama' as const, header: 'Nama Tujuan Pembelajaran' }];

  return (
    <div>
      <PageHeader
        title="Tujuan Pembelajaran"
        description="Kelola daftar tujuan pembelajaran PKL"
        actions={
          <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Tambah
          </Button>
        }
      />

      <div className="mb-6 animate-fade-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Cari tujuan pembelajaran..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 border-2 border-border focus:border-primary" />
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} onEdit={handleOpenModal} onDelete={handleDelete} />

      <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} title={editingItem ? 'Edit Tujuan Pembelajaran' : 'Tambah Tujuan Pembelajaran'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Tujuan Pembelajaran</Label>
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

export default TujuanPembelajaranPage;
