import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { GraduationCap, Lock, User, ArrowRight } from 'lucide-react';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Simulate loading
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (login(username, password)) {
      toast.success('Login berhasil!', {
        description: 'Selamat datang di Rapor-Edyan',
      });
      navigate('/dashboard');
    } else {
      toast.error('Login gagal', {
        description: 'Username atau password salah',
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 border-2 border-primary/20 animate-float" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-accent/10 border-2 border-accent/20 animate-float" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-primary/5 border-2 border-primary/10 animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-20 right-1/3 w-20 h-20 bg-accent/10 border-2 border-accent/20 animate-float" style={{ animationDelay: '0.5s' }} />
        <div className="absolute top-1/3 left-1/2 w-28 h-28 bg-muted border-2 border-border animate-float" style={{ animationDelay: '1.5s' }} />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative animate-slide-up">
        {/* Main Card */}
        <div className="bg-card border-4 border-foreground shadow-brutal-lg p-8 relative">
          {/* Decorative Corner */}
          <div className="absolute -top-3 -right-3 w-6 h-6 bg-primary border-2 border-foreground" />
          <div className="absolute -bottom-3 -left-3 w-6 h-6 bg-accent border-2 border-foreground" />

          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-primary text-primary-foreground flex items-center justify-center border-4 border-foreground shadow-brutal mb-4 animate-pulse-slow">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Rapor-Edyan</h1>
            <p className="text-muted-foreground mt-2 text-center">
              Sistem Manajemen Rapor PKL
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-bold">
                Username
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username"
                  className="pl-11 border-2 border-foreground focus:ring-2 focus:ring-primary h-12"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-bold">
                Password
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  className="pl-11 border-2 border-foreground focus:ring-2 focus:ring-primary h-12"
                  required
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-lg font-bold border-4 border-foreground shadow-brutal hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all bg-primary text-primary-foreground"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent animate-spin" />
                  Memproses...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Masuk
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-4 bg-muted border-2 border-border">
            <p className="text-sm font-bold mb-2">Demo Kredensial:</p>
            <p className="text-sm text-muted-foreground">
              Username: <span className="font-mono font-bold text-foreground">admin</span>
            </p>
            <p className="text-sm text-muted-foreground">
              Password: <span className="font-mono font-bold text-foreground">admin</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
