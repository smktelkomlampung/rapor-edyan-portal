import { useState, useRef } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Save, Filter, Download, Upload, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { exportToExcel, parseExcelFile } from '@/utils/excelUtils';
import { exportTableToPDF } from '@/utils/pdfUtils';

interface MappingData {
  id: string;
  namaSiswa: string;
  nisn: string;
  kelas: string;
  tempatPKL: string;
  instrukturPKL: string;
  pembimbingSekolah: string;
}

const siswaData = [
  { id: '1', nama: 'Ahmad Rizki', nisn: '1234567890', kelas: 'XII RPL 1' },
  { id: '2', nama: 'Siti Nurhaliza', nisn: '1234567891', kelas: 'XII RPL 1' },
  { id: '3', nama: 'Budi Santoso', nisn: '1234567892', kelas: 'XII RPL 2' },
  { id: '4', nama: 'Dewi Lestari', nisn: '1234567893', kelas: 'XII RPL 2' },
  { id: '5', nama: 'Eko Prasetyo', nisn: '1234567894', kelas: 'XII TKJ 1' },
];

const tempatPKLOptions = [
  'PT. Teknologi Nusantara',
  'CV. Solusi Digital',
  'PT. Inovasi Teknologi',
  'PT. Maju Bersama',
];

const instrukturOptions = [
  'Pak Andi Wijaya',
  'Bu Siti Rahayu',
  'Pak Budi Hartono',
  'Bu Dewi Susanti',
];

const pembimbingOptions = [
  'Drs. Ahmad Sudirman, M.Pd.',
  'Hj. Siti Aminah, S.Pd.',
  'Ir. Bambang Susilo',
  'Dra. Ratna Sari',
];

const MappingPKL = () => {
  const [mappings, setMappings] = useState<MappingData[]>(
    siswaData.map((s) => ({
      id: s.id,
      namaSiswa: s.nama,
      nisn: s.nisn,
      kelas: s.kelas,
      tempatPKL: '',
      instrukturPKL: '',
      pembimbingSekolah: '',
    }))
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterTempat, setFilterTempat] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const kelasOptions = [...new Set(siswaData.map((s) => s.kelas))];

  const filteredMappings = mappings.filter((m) => {
    const matchSearch =
      m.namaSiswa.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.nisn.includes(searchTerm);
    const matchKelas = filterKelas === 'all' || m.kelas === filterKelas;
    const matchTempat = filterTempat === 'all' || m.tempatPKL === filterTempat;
    return matchSearch && matchKelas && matchTempat;
  });

  const updateMapping = (id: string, field: keyof MappingData, value: string) => {
    setMappings(
      mappings.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSave = () => {
    toast.success('Mapping PKL berhasil disimpan');
  };

  const handleExportExcel = () => {
    const exportData = mappings.map((m, i) => ({
      No: i + 1,
      'Nama Siswa': m.namaSiswa,
      NISN: m.nisn,
      Kelas: m.kelas,
      'Tempat PKL': m.tempatPKL,
      'Instruktur PKL': m.instrukturPKL,
      'Pembimbing Sekolah': m.pembimbingSekolah,
    }));
    exportToExcel(exportData, 'Mapping_PKL', 'Mapping PKL');
    toast.success('Data berhasil diekspor ke Excel');
  };

  const handleExportPDF = () => {
    const columns: { key: keyof MappingData; header: string }[] = [
      { key: 'namaSiswa', header: 'Nama Siswa' },
      { key: 'nisn', header: 'NISN' },
      { key: 'kelas', header: 'Kelas' },
      { key: 'tempatPKL', header: 'Tempat PKL' },
      { key: 'instrukturPKL', header: 'Instruktur PKL' },
      { key: 'pembimbingSekolah', header: 'Pembimbing Sekolah' },
    ];
    exportTableToPDF(filteredMappings, columns, 'Data Mapping PKL', 'Mapping_PKL');
    toast.success('Data berhasil diekspor ke PDF');
  };

  const handleImportExcel = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await parseExcelFile<{
        'Nama Siswa': string;
        NISN: string;
        Kelas: string;
        'Tempat PKL': string;
        'Instruktur PKL': string;
        'Pembimbing Sekolah': string;
      }>(file);

      const newMappings = data.map((row, index) => ({
        id: Date.now().toString() + index,
        namaSiswa: row['Nama Siswa'] || '',
        nisn: row['NISN']?.toString() || '',
        kelas: row['Kelas'] || '',
        tempatPKL: row['Tempat PKL'] || '',
        instrukturPKL: row['Instruktur PKL'] || '',
        pembimbingSekolah: row['Pembimbing Sekolah'] || '',
      }));

      setMappings([...mappings, ...newMappings]);
      toast.success(`${data.length} data berhasil diimpor dari Excel`);
    } catch (error) {
      toast.error('Gagal mengimpor file Excel');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <PageHeader
        title="Mapping Anggota PKL"
        description="Atur penempatan siswa PKL dengan pembimbing dan tempat PKL"
        actions={
          <div className="flex flex-wrap gap-2">
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
              variant="outline"
              onClick={handleExportExcel}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
            <Button
              variant="outline"
              onClick={handleExportPDF}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={handleSave}
              className="border-2 border-foreground shadow-brutal-sm hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5 transition-all"
            >
              <Save className="w-4 h-4 mr-2" />
              Simpan
            </Button>
          </div>
        }
      />

      {/* Filters */}
      <Card className="border-2 border-border shadow-brutal mb-6 animate-fade-in">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="w-5 h-5" />
            Filter Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Cari Siswa</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Nama atau NISN..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-2"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Filter Kelas</Label>
              <Select value={filterKelas} onValueChange={setFilterKelas}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih Kelas" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {kelasOptions.map((kelas) => (
                    <SelectItem key={kelas} value={kelas}>
                      {kelas}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filter Tempat PKL</Label>
              <Select value={filterTempat} onValueChange={setFilterTempat}>
                <SelectTrigger className="border-2 bg-card">
                  <SelectValue placeholder="Pilih Tempat" />
                </SelectTrigger>
                <SelectContent className="bg-card border-2 border-border z-50">
                  <SelectItem value="all">Semua Tempat</SelectItem>
                  {tempatPKLOptions.map((tempat) => (
                    <SelectItem key={tempat} value={tempat}>
                      {tempat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div className="border-2 border-border shadow-brutal bg-card overflow-hidden animate-slide-up">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-b-2 border-border bg-muted hover:bg-muted">
                <TableHead className="font-bold">No</TableHead>
                <TableHead className="font-bold">Nama Siswa</TableHead>
                <TableHead className="font-bold">NISN</TableHead>
                <TableHead className="font-bold">Kelas</TableHead>
                <TableHead className="font-bold min-w-[200px]">Tempat PKL</TableHead>
                <TableHead className="font-bold min-w-[200px]">Instruktur PKL</TableHead>
                <TableHead className="font-bold min-w-[200px]">Pembimbing Sekolah</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMappings.map((mapping, index) => (
                <TableRow
                  key={mapping.id}
                  className="border-b-2 border-border hover:bg-muted/50 animate-fade-in"
                  style={{ animationDelay: `${index * 30}ms` }}
                >
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell className="font-medium">{mapping.namaSiswa}</TableCell>
                  <TableCell>{mapping.nisn}</TableCell>
                  <TableCell>{mapping.kelas}</TableCell>
                  <TableCell>
                    <Select
                      value={mapping.tempatPKL}
                      onValueChange={(value) => updateMapping(mapping.id, 'tempatPKL', value)}
                    >
                      <SelectTrigger className="border-2 bg-card">
                        <SelectValue placeholder="Pilih Tempat PKL" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-2 border-border z-50">
                        {tempatPKLOptions.map((tempat) => (
                          <SelectItem key={tempat} value={tempat}>
                            {tempat}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.instrukturPKL}
                      onValueChange={(value) => updateMapping(mapping.id, 'instrukturPKL', value)}
                    >
                      <SelectTrigger className="border-2 bg-card">
                        <SelectValue placeholder="Pilih Instruktur" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-2 border-border z-50">
                        {instrukturOptions.map((instruktur) => (
                          <SelectItem key={instruktur} value={instruktur}>
                            {instruktur}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={mapping.pembimbingSekolah}
                      onValueChange={(value) => updateMapping(mapping.id, 'pembimbingSekolah', value)}
                    >
                      <SelectTrigger className="border-2 bg-card">
                        <SelectValue placeholder="Pilih Pembimbing" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-2 border-border z-50">
                        {pembimbingOptions.map((pembimbing) => (
                          <SelectItem key={pembimbing} value={pembimbing}>
                            {pembimbing}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default MappingPKL;
