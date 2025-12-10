import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { DataTable } from '@/components/ui/DataTable';
import { FormModal } from '@/components/ui/FormModal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus, Search, RefreshCw, Filter, Loader2, Check, ChevronsUpDown } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import api from '@/lib/axios';

// Interface Data
interface KelasData {
  id: number;
  nama: string;
  wali_kelas: string;
  nip: string;
}

interface GuruData {
  id: number;
  nama: string;
}

const WaliKelas = () => {
  const [data, setData] = useState<KelasData[]>([]);
  const [guruOptions, setGuruOptions] = useState<GuruData[]>([]); // State untuk list guru
  
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openCombobox, setOpenCombobox] = useState(false); // State buka/tutup dropdown

  const [editingItem, setEditingItem] = useState<KelasData | null>(null);
  const [formData, setFormData] = useState({ nama: '', wali_kelas: '', nip: '' });

  // 1. Fetch Data Kelas & Guru
  const fetchData = async () => {
    setIsLoading(true);
    try {
        const res = await api.get('/kelas');
        if(res.data.success) setData(res.data.data);
    } catch (error) {
        toast.error('Gagal mengambil data kelas');
    } finally {
        setIsLoading(false);
    }
  };

  const fetchGuru = async () => {
    try {
        const res = await api.get('/pembimbing-sekolah'); // Ambil dari tabel Pembimbing
        if(res.data.success) setGuruOptions(res.data.data);
    } catch (error) {
        console.error("Gagal load guru", error);
    }
  };

  useEffect(() => {
    fetchData();
    fetchGuru();
  }, []);

  // Sync Logic
  const handleSync = async () => {
    setIsSyncing(true);
    try {
        const res = await api.post('/kelas/sync');
        if(res.data.success) {
            toast.success(res.data.message);
            fetchData();
        }
    } catch (error) {
        toast.error('Gagal sinkronisasi');
    } finally {
        setIsSyncing(false);
    }
  };

  // CRUD
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
        if (editingItem) {
            await api.put(`/kelas/${editingItem.id}`, formData);
            toast.success('Data Wali Kelas diperbarui');
        } else {
            await api.post('/kelas', formData);
            toast.success('Kelas baru ditambahkan');
        }
        fetchData();
        setIsModalOpen(false);
    } catch (error: any) {
        toast.error(error.response?.data?.message || 'Gagal menyimpan');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (item: KelasData) => {
    if(!window.confirm(`Hapus kelas ${item.nama}?`)) return;
    try {
        await api.delete(`/kelas/${item.id}`);
        toast.success('Kelas dihapus');
        fetchData();
    } catch (error) {
        toast.error('Gagal menghapus');
    }
  };

  const handleOpenModal = (item?: KelasData) => {
    if (item) {
        setEditingItem(item);
        setFormData({ nama: item.nama, wali_kelas: item.wali_kelas, nip: item.nip });
    } else {
        setEditingItem(null);
        setFormData({ nama: '', wali_kelas: '', nip: '' });
    }
    setIsModalOpen(true);
  };

  const filteredData = data.filter(item => 
    item.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.wali_kelas.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    { key: 'nama' as const, header: 'Nama Kelas' },
    { key: 'wali_kelas' as const, header: 'Wali Kelas' },
    { key: 'nip' as const, header: 'NIP' },
  ];

  return (
    <div>
      <PageHeader
        title="Data Wali Kelas"
        description="Petakan nama kelas dengan wali kelas masing-masing"
        actions={
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleSync} disabled={isSyncing} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
                    {isSyncing ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <RefreshCw className="w-4 h-4 mr-2"/>}
                    Ambil dari Data Siswa
                </Button>
                <Button onClick={() => handleOpenModal()} className="border-2 border-foreground shadow-brutal-sm hover:shadow-none transition-all">
                    <Plus className="w-4 h-4 mr-2" /> Tambah Manual
                </Button>
            </div>
        }
      />

      <Card className="border-2 border-border shadow-brutal mb-6 animate-fade-in">
        <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
                <Filter className="w-5 h-5" /> Filter
            </CardTitle>
        </CardHeader>
        <CardContent>
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input 
                    placeholder="Cari kelas atau nama wali..." 
                    value={searchTerm} 
                    onChange={(e) => setSearchTerm(e.target.value)} 
                    className="pl-11 border-2" 
                />
            </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex justify-center h-64 items-center"><Loader2 className="w-8 h-8 animate-spin"/></div>
      ) : (
        <DataTable data={filteredData} columns={columns} onEdit={handleOpenModal} onDelete={handleDelete} />
      )}

      <FormModal open={isModalOpen} onOpenChange={setIsModalOpen} title={editingItem ? 'Edit Wali Kelas' : 'Tambah Kelas Baru'}>
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nama Kelas */}
            <div className="space-y-2">
                <Label>Nama Kelas</Label>
                <Input 
                    value={formData.nama} 
                    onChange={e => setFormData({...formData, nama: e.target.value})} 
                    className="border-2" 
                    required 
                    placeholder="Contoh: XII RPL 1"
                />
            </div>

            {/* Dropdown Wali Kelas (Searchable) */}
            <div className="space-y-2">
                <Label>Nama Wali Kelas (Dari Data Pembimbing)</Label>
                <Popover open={openCombobox} onOpenChange={setOpenCombobox}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            role="combobox"
                            aria-expanded={openCombobox}
                            className="w-full justify-between border-2 bg-card font-normal"
                        >
                            {formData.wali_kelas || "Pilih Wali Kelas..."}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[400px] p-0 border-2">
                        <Command>
                            <CommandInput placeholder="Cari nama guru..." />
                            <CommandList>
                                <CommandEmpty>Guru tidak ditemukan.</CommandEmpty>
                                <CommandGroup>
                                    {guruOptions.map((guru) => (
                                        <CommandItem
                                            key={guru.id}
                                            value={guru.nama} // Search by Name
                                            onSelect={() => {
                                                // Saat dipilih, set nama ke formData
                                                setFormData({ ...formData, wali_kelas: guru.nama });
                                                setOpenCombobox(false);
                                            }}
                                        >
                                            <Check
                                                className={cn(
                                                    "mr-2 h-4 w-4",
                                                    formData.wali_kelas === guru.nama ? "opacity-100" : "opacity-0"
                                                )}
                                            />
                                            {guru.nama}
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </Command>
                    </PopoverContent>
                </Popover>
                <p className="text-[10px] text-muted-foreground">
                    *Data diambil dari menu Pembimbing Sekolah. Jika nama tidak ada, tambahkan dulu di sana.
                </p>
            </div>

            {/* NIP (Manual Input karena di tabel pembimbing belum ada kolom NIP) */}
            <div className="space-y-2">
                <Label>NIP (Opsional)</Label>
                <Input 
                    value={formData.nip} 
                    onChange={e => setFormData({...formData, nip: e.target.value})} 
                    className="border-2" 
                    placeholder="-" 
                />
            </div>

            <div className="flex gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="flex-1 border-2">Batal</Button>
                <Button type="submit" disabled={isSaving} className="flex-1 border-2 border-foreground shadow-brutal-sm">Simpan</Button>
            </div>
        </form>
      </FormModal>
    </div>
  );
};

export default WaliKelas;