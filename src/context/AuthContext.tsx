'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated on mount
    const authCookie = Cookies.get('isAuthenticated');
    setIsAuthenticated(authCookie === 'true');
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    // Simple client-side check
    if (email === 'sinaparsania15@gmail.com' && password === 'EnjoyIt') {
      // Set cookie with 7 days expiration
      Cookies.set('isAuthenticated', 'true', { expires: 7, secure: true, sameSite: 'strict' });
      setIsAuthenticated(true);
      toast.success('Welcome back!');
      router.push('/');
      return true;
    } else {
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    Cookies.remove('isAuthenticated');
    setIsAuthenticated(false);
    router.push('/login');
    toast.success('Logged out successfully');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
