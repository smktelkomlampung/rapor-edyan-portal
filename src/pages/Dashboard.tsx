import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Building2, 
  UserCheck, 
  GraduationCap, 
  BookOpen, 
  ClipboardList,
  TrendingUp,
  Calendar,
  Loader2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { toast } from 'sonner';

const quickLinks = [
  { title: 'Tujuan Pembelajaran', icon: BookOpen, path: '/tujuan-pembelajaran' },
  { title: 'Nilai PKL', icon: ClipboardList, path: '/nilai-pkl' },
  { title: 'Absensi PKL', icon: Calendar, path: '/absensi-pkl' },
];

const Dashboard = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  
  // State Data Dashboard
  const [data, setData] = useState({
    stats: {
        total_siswa: 0,
        total_tempat: 0,
        total_instruktur: 0,
        total_pembimbing: 0
    },
    settings: {
        tahun_pelajaran: '-',
        tanggal_mulai_pkl: '',
        tanggal_akhir_pkl: ''
    }
  });

  useEffect(() => {
    const fetchDashboard = async () => {
        try {
            const res = await api.get('/dashboard');
            if(res.data.success) {
                setData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching dashboard", error);
            toast.error("Gagal memuat data dashboard");
        } finally {
            setIsLoading(false);
        }
    };
    fetchDashboard();
  }, []);

  // Helper Format Periode (Bulan Tahun)
  const formatPeriode = (start: string, end: string) => {
    if(!start || !end) return '-';
    const d1 = new Date(start);
    const d2 = new Date(end);
    const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
    return `${d1.toLocaleDateString('id-ID', options)} - ${d2.toLocaleDateString('id-ID', options)}`;
  };

  // Stats Array (Dinamis dari State)
  const statsItems = [
    { 
      title: 'Total Siswa', 
      value: data.stats.total_siswa, 
      icon: Users, 
      color: 'bg-primary',
      path: '/siswa'
    },
    { 
      title: 'Tempat PKL', 
      value: data.stats.total_tempat, 
      icon: Building2, 
      color: 'bg-accent',
      path: '/tempat-pkl'
    },
    { 
      title: 'Instruktur PKL', 
      value: data.stats.total_instruktur, 
      icon: UserCheck, 
      color: 'bg-chart-3',
      path: '/instruktur-pkl'
    },
    { 
      title: 'Pembimbing Sekolah', 
      value: data.stats.total_pembimbing, 
      icon: GraduationCap, 
      color: 'bg-chart-4',
      path: '/pembimbing'
    },
  ];

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
        title="Dashboard" 
        description="Selamat datang di Sistem Rapor-Edyan"
      />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsItems.map((stat, index) => (
          <Card 
            key={stat.title}
            onClick={() => navigate(stat.path)}
            className="border-2 border-border shadow-brutal hover-lift cursor-pointer animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 ${stat.color} text-primary-foreground border-2 border-foreground`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stat.value}</p>
              <div className="flex items-center gap-1 mt-2 text-accent text-sm">
                <TrendingUp className="w-4 h-4" />
                <span>Terdata</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Links */}
      <div className="mb-8 animate-slide-up" style={{ animationDelay: '400ms' }}>
        <h2 className="text-xl font-bold mb-4">Akses Cepat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickLinks.map((link) => (
            <Card
              key={link.title}
              onClick={() => navigate(link.path)}
              className="border-2 border-border shadow-brutal-sm hover-lift cursor-pointer p-6"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-muted border-2 border-border">
                  <link.icon className="w-6 h-6" />
                </div>
                <span className="font-bold">{link.title}</span>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Info Card */}
      <Card className="border-2 border-border shadow-brutal animate-slide-up" style={{ animationDelay: '500ms' }}>
        <CardHeader>
          <CardTitle>Informasi Sistem</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-muted border-2 border-border">
              <p className="text-sm text-muted-foreground">Tahun Pelajaran</p>
              <p className="text-lg font-bold">{data.settings?.tahun_pelajaran || 'Belum disetting'}</p>
            </div>
            <div className="p-4 bg-muted border-2 border-border">
              <p className="text-sm text-muted-foreground">Periode PKL</p>
              <p className="text-lg font-bold">
                {formatPeriode(data.settings?.tanggal_mulai_pkl, data.settings?.tanggal_akhir_pkl)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;