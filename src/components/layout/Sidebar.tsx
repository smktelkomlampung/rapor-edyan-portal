import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Building2, 
  UserCheck, 
  GraduationCap,
  BookOpen,
  ClipboardList,
  Calendar,
  Settings,
  LogOut,
  X,
  Menu
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { useState } from 'react';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Users, label: 'Data Siswa', path: '/siswa' },
  { icon: Building2, label: 'Tempat PKL', path: '/tempat-pkl' },
  { icon: UserCheck, label: 'Instruktur PKL', path: '/instruktur-pkl' },
  { icon: GraduationCap, label: 'Pembimbing Sekolah', path: '/pembimbing' },
  { icon: BookOpen, label: 'Tujuan Pembelajaran', path: '/tujuan-pembelajaran' },
  { icon: ClipboardList, label: 'Nilai PKL', path: '/nilai-pkl' },
  { icon: Calendar, label: 'Absensi PKL', path: '/absensi-pkl' },
  { icon: Settings, label: 'Pengaturan', path: '/settings' },
];

export const Sidebar = () => {
  const { logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-2 bg-sidebar text-sidebar-foreground border-2 border-sidebar-border shadow-brutal-sm lg:hidden"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full w-64 bg-sidebar text-sidebar-foreground border-r-2 border-sidebar-border z-50 transition-transform duration-300 lg:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b-2 border-sidebar-border flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Rapor-Edyan</h1>
              <p className="text-sm text-sidebar-foreground/70 mt-1">Sistem Rapor PKL</p>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-sidebar-accent lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all border-2 border-transparent",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground border-sidebar-ring shadow-brutal-sm"
                      : "hover:bg-sidebar-accent hover:border-sidebar-border"
                  )
                }
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t-2 border-sidebar-border">
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-destructive hover:bg-sidebar-accent transition-colors border-2 border-transparent hover:border-destructive"
            >
              <LogOut className="w-5 h-5" />
              Keluar
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
