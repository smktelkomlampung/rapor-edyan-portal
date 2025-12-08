import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

interface NilaiPKL {
  id: string;
  namaSiswa: string;
  skor: number;
  deskripsi: string;
  catatan: string;
}

const initialData: NilaiPKL[] = [
  { id: '1', namaSiswa: 'Ahmad Rizki', skor: 85, deskripsi: 'Sangat Baik', catatan: 'Menunjukkan keterampilan teknis yang baik' },
  { id: '2', namaSiswa: 'Siti Nurhaliza', skor: 90, deskripsi: 'Sangat Baik', catatan: 'Komunikasi dan kerjasama tim sangat baik' },
  { id: '3', namaSiswa: 'Budi Santoso', skor: 78, deskripsi: 'Baik', catatan: 'Perlu meningkatkan kedisiplinan' },
];

const NilaiPKLPage = () => {
  const [data, setData] = useState<NilaiPKL[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NilaiPKL | null>(null);
  const [formData, setFormData] = useState({
    namaSiswa: '',
    skor: 0,
    deskripsi: '',
    catatan: '',
  });

  const filteredData = data.filter((item) =>
    item.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = (item?: NilaiPKL) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        namaSiswa: item.namaSiswa,
        skor: item.skor,
        deskripsi: item.deskripsi,
        catatan: item.catatan,
      });
    } else {
      setEditingItem(null);
      setFormData({ namaSiswa: '', skor: 0, deskripsi: '', catatan: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map((item) =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      ));
      toast.success('Data nilai berhasil diperbarui');
    } else {
      const newItem: NilaiPKL = { id: Date.now().toString(), ...formData };
      setData([...data, newItem]);
      toast.success('Data nilai berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item: NilaiPKL) => {
    setData(data.filter((d) => d.id !== item.id));
    toast.success('Data nilai berhasil dihapus');
  };

  const columns = [
    { key: 'namaSiswa' as const, header: 'Nama Siswa' },
    { 
      key: 'skor' as const, 
      header: 'Skor',
      render: (item: NilaiPKL) => (
        <span className={`font-bold ${item.skor >= 80 ? 'text-accent' : item.skor >= 60 ? 'text-chart-3' : 'text-destructive'}`}>
          {item.skor}
        </span>
      )
    },
    { key: 'deskripsi' as const, header: 'Deskripsi' },
    { key: 'catatan' as const, header: 'Catatan' },
  ];

  return (
    <div>
      <PageHeader
        title="Nilai PKL"
        description="Kelola data nilai Praktik Kerja Industri"
        actions={
          <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all">
            <Plus className="w-4 h-4 mr-2" />
            Tambah Nilai
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

      <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} title={editingItem ? 'Edit Nilai PKL' : 'Tambah Nilai PKL'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="namaSiswa">Nama Siswa</Label>
            <Input id="namaSiswa" value={formData.namaSiswa} onChange={(e) => setFormData({ ...formData, namaSiswa: e.target.value })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="skor">Skor (0-100)</Label>
            <Input id="skor" type="number" min="0" max="100" value={formData.skor} onChange={(e) => setFormData({ ...formData, skor: Number(e.target.value) })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi</Label>
            <Input id="deskripsi" value={formData.deskripsi} onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })} className="border-2" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="catatan">Catatan</Label>
            <Textarea id="catatan" value={formData.catatan} onChange={(e) => setFormData({ ...formData, catatan: e.target.value })} className="border-2 min-h-[100px]" />
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

export default NilaiPKLPage;
