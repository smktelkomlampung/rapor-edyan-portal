import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
