import { useState } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save, School, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';
import type { Settings as SettingsType } from '@/types';

const SettingsPage = () => {
  const [settings, setSettings] = useState<SettingsType>({
    namaSekolah: 'SMK Negeri 1 Kota Contoh',
    tanggalMulaiPKL: '2025-01-06',
    tanggalAkhirPKL: '2025-06-30',
    tahunPelajaran: '2024/2025',
    namaKepalaSekolah: 'Drs. H. Ahmad Sudirman, M.Pd.',
  });

  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Simulate saving
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    toast.success('Pengaturan berhasil disimpan');
    setIsSaving(false);
  };

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
                <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent animate-spin" />
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
