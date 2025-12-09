import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom"; // Tambah Navigate & Outlet
import { AuthProvider, useAuth } from "@/contexts/AuthContext"; // Tambah useAuth
import { MainLayout } from "@/components/layout/MainLayout";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import DataSiswa from "./pages/DataSiswa";
import MappingPKL from "./pages/MappingPKL";
import TempatPKL from "./pages/TempatPKL";
import InstrukturPKL from "./pages/InstrukturPKL";
import PembimbingSekolah from "./pages/PembimbingSekolah";
import TujuanPembelajaran from "./pages/TujuanPembelajaran";
import NilaiPKL from "./pages/NilaiPKL";
import AbsensiPKL from "./pages/AbsensiPKL";
import CetakRapor from "./pages/CetakRapor";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// 1. Kita bikin komponen Penjaga Pintu (Route Guard)
const ProtectedRoute = () => {
  const { isAuthenticated } = useAuth();
  // Kita cek localStorage juga biar pas refresh gak langsung ketendang ke login
  const token = localStorage.getItem('token');

  // Kalau gak ada auth state DAN gak ada token, tendang ke login
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // Kalau aman, lanjut render halaman anak (Outlet)
  return <Outlet />;
};

// 2. Component Redirect kalau user sudah login tapi coba buka /login lagi
const PublicRoute = () => {
  const { isAuthenticated } = useAuth();
  const token = localStorage.getItem('token');

  if (isAuthenticated || token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Halaman Public (Landing Page) */}
            <Route path="/" element={<Index />} />

            {/* Halaman Login (Hanya bisa diakses kalau BELUM login) */}
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<Login />} />
            </Route>

            {/* Halaman Protected (Hanya bisa diakses kalau SUDAH login) */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/siswa" element={<DataSiswa />} />
                <Route path="/mapping-pkl" element={<MappingPKL />} />
                <Route path="/tempat-pkl" element={<TempatPKL />} />
                <Route path="/instruktur-pkl" element={<InstrukturPKL />} />
                <Route path="/pembimbing" element={<PembimbingSekolah />} />
                <Route path="/tujuan-pembelajaran" element={<TujuanPembelajaran />} />
                <Route path="/nilai-pkl" element={<NilaiPKL />} />
                <Route path="/absensi-pkl" element={<AbsensiPKL />} />
                <Route path="/cetak-rapor" element={<CetakRapor />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Route>

            {/* Catch all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;