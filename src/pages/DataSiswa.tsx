import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import type { Siswa } from '@/types';

const initialData: Siswa[] = [
  { id: '1', nama: 'Ahmad Rizki', nisn: '1234567890', kelas: 'XII RPL 1', programKeahlian: 'Teknik Informatika', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak' },
  { id: '2', nama: 'Siti Nurhaliza', nisn: '1234567891', kelas: 'XII RPL 1', programKeahlian: 'Teknik Informatika', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak' },
  { id: '3', nama: 'Budi Santoso', nisn: '1234567892', kelas: 'XII RPL 2', programKeahlian: 'Teknik Informatika', konsentrasiKeahlian: 'Rekayasa Perangkat Lunak' },
];

const DataSiswa = () => {
  const [data, setData] = useState<Siswa[]>(initialData);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Siswa | null>(null);
  const [formData, setFormData] = useState({
    nama: '',
    nisn: '',
    kelas: '',
    programKeahlian: '',
    konsentrasiKeahlian: '',
  });

  const filteredData = data.filter(
    (item) =>
      item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.nisn.includes(searchTerm) ||
      item.kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setData(data.map((item) =>
        item.id === editingItem.id ? { ...item, ...formData } : item
      ));
      toast.success('Data siswa berhasil diperbarui');
    } else {
      const newItem: Siswa = {
        id: Date.now().toString(),
        ...formData,
      };
      setData([...data, newItem]);
      toast.success('Data siswa berhasil ditambahkan');
    }
    setIsModalOpen(false);
  };

  const handleDelete = (item: Siswa) => {
    setData(data.filter((d) => d.id !== item.id));
    toast.success('Data siswa berhasil dihapus');
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
          <Button
            onClick={() => handleOpenModal()}
            className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
          >
            <Plus className="w-4 h-4 mr-2" />
            Tambah Siswa
          </Button>
        }
      />

      {/* Search */}
      <div className="mb-6 animate-fade-in">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Cari nama, NISN, atau kelas..."
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
        title={editingItem ? 'Edit Data Siswa' : 'Tambah Data Siswa'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Peserta Didik</Label>
            <Input
              id="nama"
              value={formData.nama}
              onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
              className="border-2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="nisn">NISN</Label>
            <Input
              id="nisn"
              value={formData.nisn}
              onChange={(e) => setFormData({ ...formData, nisn: e.target.value })}
              className="border-2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kelas">Kelas</Label>
            <Input
              id="kelas"
              value={formData.kelas}
              onChange={(e) => setFormData({ ...formData, kelas: e.target.value })}
              className="border-2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="programKeahlian">Program Keahlian</Label>
            <Input
              id="programKeahlian"
              value={formData.programKeahlian}
              onChange={(e) => setFormData({ ...formData, programKeahlian: e.target.value })}
              className="border-2"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="konsentrasiKeahlian">Konsentrasi Keahlian</Label>
            <Input
              id="konsentrasiKeahlian"
              value={formData.konsentrasiKeahlian}
              onChange={(e) => setFormData({ ...formData, konsentrasiKeahlian: e.target.value })}
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

export default DataSiswa;
