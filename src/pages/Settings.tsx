import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, School, Calendar, User, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import api from '@/lib/axios';

// Interface sesuai Backend (Snake Case di DB, Camel Case di Frontend state)
interface SettingsType {
  namaSekolah: string;
  tanggalMulaiPKL: string;
  tanggalAkhirPKL: string;
  tahunPelajaran: string;
  namaKepalaSekolah: string;
  nipKepalaSekolah: string; // New Field
  kota: string;
  tanggalRapor: string;
}

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsType>({
    namaSekolah: '',
    tanggalMulaiPKL: '',
    tanggalAkhirPKL: '',
    tahunPelajaran: '',
    namaKepalaSekolah: '',
    nipKepalaSekolah: '',
    kota: '',
    tanggalRapor: '',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // 1. Fetch Settings
  useEffect(() => {
    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            if(res.data.success) {
                const data = res.data.data;
                // Mapping snake_case DB ke camelCase State
                setSettings({
                    namaSekolah: data.nama_sekolah || '',
                    tahunPelajaran: data.tahun_pelajaran || '',
                    tanggalMulaiPKL: data.tanggal_mulai_pkl || '',
                    tanggalAkhirPKL: data.tanggal_akhir_pkl || '',
                    namaKepalaSekolah: data.nama_kepala_sekolah || '',
                    nipKepalaSekolah: data.nip_kepala_sekolah || '',
                    kota: data.kota || '',
                    tanggalRapor: data.tanggal_rapor || '',
                });
            }
        } catch (error) {
            toast.error('Gagal memuat pengaturan');
        } finally {
            setIsLoading(false);
        }
    };
    fetchSettings();
  }, []);

  // 2. Save Settings
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
        await api.post('/settings', settings);
        toast.success('Pengaturan berhasil disimpan');
    } catch (error) {
        toast.error('Gagal menyimpan pengaturan');
    } finally {
        setIsSaving(false);
    }
  };

  if (isLoading) {
      return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      );
  }

  return (
    <div>
      <PageHeader
        title="Pengaturan"
        description="Konfigurasi informasi sekolah dan periode PKL"
      />

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 max-w-2xl">
          {/* School Info */}
          <Card className="border-2 border-border shadow-brutal animate-slide-up">
            <CardHeader className="border-b-2 border-border">
              <CardTitle className="flex items-center gap-2">
                <School className="w-5 h-5" />
                Informasi Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="namaSekolah">Nama Sekolah</Label>
                <Input
                  id="namaSekolah"
                  value={settings.namaSekolah}
                  onChange={(e) => setSettings({ ...settings, namaSekolah: e.target.value })}
                  className="border-2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahunPelajaran">Tahun Pelajaran</Label>
                <Input
                  id="tahunPelajaran"
                  value={settings.tahunPelajaran}
                  onChange={(e) => setSettings({ ...settings, tahunPelajaran: e.target.value })}
                  placeholder="2024/2025"
                  className="border-2"
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* PKL Period */}
          <Card className="border-2 border-border shadow-brutal animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="border-b-2 border-border">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Periode PKL
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tanggalMulai">Tanggal Mulai PKL</Label>
                  <Input
                    id="tanggalMulai"
                    type="date"
                    value={settings.tanggalMulaiPKL}
                    onChange={(e) => setSettings({ ...settings, tanggalMulaiPKL: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tanggalAkhir">Tanggal Akhir PKL</Label>
                  <Input
                    id="tanggalAkhir"
                    type="date"
                    value={settings.tanggalAkhirPKL}
                    onChange={(e) => setSettings({ ...settings, tanggalAkhirPKL: e.target.value })}
                    className="border-2"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Principal */}
          <Card className="border-2 border-border shadow-brutal animate-slide-up" style={{ animationDelay: '200ms' }}>
            <CardHeader className="border-b-2 border-border">
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Kepala Sekolah
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="namaKepalaSekolah">Nama Kepala Sekolah</Label>
                    <Input
                    id="namaKepalaSekolah"
                    value={settings.namaKepalaSekolah}
                    onChange={(e) => setSettings({ ...settings, namaKepalaSekolah: e.target.value })}
                    className="border-2"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="nipKepalaSekolah">NIP Kepala Sekolah</Label>
                    <Input
                    id="nipKepalaSekolah"
                    value={settings.nipKepalaSekolah}
                    onChange={(e) => setSettings({ ...settings, nipKepalaSekolah: e.target.value })}
                    className="border-2"
                    required
                    />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Titimangsa (Tempat & Tanggal Rapor) */}
          <Card className="border-2 border-border shadow-brutal animate-slide-up" style={{ animationDelay: '250ms' }}>
            <CardHeader className="border-b-2 border-border">
              <CardTitle className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                Tempat & Tanggal Rapor
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="kota">Kota (Tempat Terbit)</Label>
                    <Input
                    id="kota"
                    value={settings.kota}
                    onChange={(e) => setSettings({ ...settings, kota: e.target.value })}
                    className="border-2"
                    placeholder="Contoh: Pringsewu"
                    required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="tanggalRapor">Tanggal Rapor</Label>
                    <Input
                    id="tanggalRapor"
                    type="date"
                    value={settings.tanggalRapor}
                    onChange={(e) => setSettings({ ...settings, tanggalRapor: e.target.value })}
                    className="border-2"
                    required
                    />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <Button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto border-2 border-foreground shadow-brutal hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all animate-slide-up"
            style={{ animationDelay: '300ms' }}
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Menyimpan...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Simpan Pengaturan
              </div>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default SettingsPage;