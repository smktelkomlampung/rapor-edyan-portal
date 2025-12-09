// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import api from '@/lib/axios'; // Import axios yang tadi kita bikin

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>; // Kita ubah jadi Promise
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  
  // Cek status login pas aplikasi pertama load
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      // Nembak ke Laravel
      const response = await api.post('/login', { username, password });

      if (response.data.success) {
        const { token, user } = response.data.data;

        // Simpan Token & User di LocalStorage biar gak ilang pas refresh
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        setUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Login Error:", error);
      return false;
    }
  };

  const logout = () => {
    // Hapus data session
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Optional: Nembak logout ke API biar token di database hangus
    // api.post('/logout'); 
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};