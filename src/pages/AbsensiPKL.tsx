import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface AbsensiPKL {
  id: string;
  namaSiswa: string;
  sakit: number;
  izin: number;
  tanpaKeterangan: number;
}

const initialData: AbsensiPKL[] = [
  { id: '1', namaSiswa: 'Ahmad Rizki', sakit: 2, izin: 1, tanpaKeterangan: 0 },
  { id: '2', namaSiswa: 'Siti Nurhaliza', sakit: 0, izin: 2, tanpaKeterangan: 0 },
  { id: '3', namaSiswa: 'Budi Santoso', sakit: 1, izin: 0, tanpaKeterangan: 1 },
];

const AbsensiPKLPage = () => {
  const [data, setData] = useState<AbsensiPKL[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AbsensiPKL | null>(null);
  const [formData, setFormData] = useState({
    namaSiswa: '',
    sakit: 0,
    izin: 0,
    tanpaKeterangan: 0,
  });

  const filteredData = data.filter((item) =>
    item.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: AbsensiPKL) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        namaSiswa: item.namaSiswa,
        sakit: item.sakit,
        izin: item.izin,
        tanpaKeterangan: item.tanpaKeterangan,
      });
    } else {
      setEditingItem(null);
      setFormData({ namaSiswa: '', sakit: 0, izin: 0, tanpaKeterangan: 0 });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map((item) =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      ));
      toast.success('Data absensi berhasil diperbarui');
    } else {
      const newItem: AbsensiPKL = { id: Date.now().toString(), ...formData };
      setData([...data, newItem]);
      toast.success('Data absensi berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item: AbsensiPKL) => {
    setData(data.filter((d) => d.id !== item.id));
    toast.success('Data absensi berhasil dihapus');
  };

  const columns = [
    { key: 'namaSiswa' as const, header: 'Nama Siswa' },
    { 
      key: 'sakit' as const, 
      header: 'Sakit',
      render: (item: AbsensiPKL) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-chart-3/20 text-chart-3 font-bold border-2 border-chart-3">
          {item.sakit}
        </span>
      )
    },
    { 
      key: 'izin' as const, 
      header: 'Izin',
      render: (item: AbsensiPKL) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-primary/20 text-primary font-bold border-2 border-primary">
          {item.izin}
        </span>
      )
    },
    { 
      key: 'tanpaKeterangan' as const, 
      header: 'Tanpa Keterangan',
      render: (item: AbsensiPKL) => (
        <span className="inline-flex items-center justify-center w-8 h-8 bg-destructive/20 text-destructive font-bold border-2 border-destructive">
          {item.tanpaKeterangan}
        </span>
      )
    },
    { 
      key: 'total' as const, 
      header: 'Total',
      render: (item: AbsensiPKL) => (
        <span className="font-bold">
          {item.sakit + item.izin + item.tanpaKeterangan}
        </span>
      )
    },
  ];

  return (
    <div>
      <PageHeader
        title="Absensi PKL"
        description="Kelola data kehadiran siswa PKL"
        actions={
          <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Absensi
          </Button>
        }
      />

      <div className="mb-6 animate-fade-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input placeholder="Cari nama siswa..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-11 border-2 border-border focus:border-primary" />
        </div>
      </div>

      <DataTable data={filteredData} columns={columns} onEdit={handleOpenModal} onDelete={handleDelete} />

      <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} title={editingItem ? 'Edit Absensi PKL' : 'Tambah Absensi PKL'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="namaSiswa">Nama Siswa</Label>
            <Input id="namaSiswa" value={formData.namaSiswa} onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })} className="border-2" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="sakit">Sakit</Label>
              <Input id="sakit" type="number" min="0" value={formData.sakit} onChange={(e) => setFormData({ ...formData, sakit: Number(e.target.value) })} className="border-2" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="izin">Izin</Label>
              <Input id="izin" type="number" min="0" value={formData.izin} onChange={(e) => setFormData({ ...formData, izin: Number(e.target.value) })} className="border-2" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tanpaKeterangan">Alpha</Label>
              <Input id="tanpaKeterangan" type="number" min="0" value={formData.tanpaKeterangan} onChange={(e) => setFormData({ ...formData, tanpaKeterangan: Number(e.target.value) })} className="border-2" required />
            </div>
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

export default AbsensiPKLPage;
