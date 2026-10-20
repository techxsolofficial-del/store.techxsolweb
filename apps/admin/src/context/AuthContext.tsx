import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginAdmin, verifyAdminSession } from '../services/api';

interface AuthContextType {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('bazaarpk_admin_token'));
  const [user, setUser] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      if (!token) {
        setIsLoading(false);
        return;
      }
      try {
        const userData = await verifyAdminSession();
        setUser(userData);
      } catch {
        localStorage.removeItem('bazaarpk_admin_token');
        setToken(null);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, [token]);

  const login = async (email: string, pass: string) => {
    const data = await loginAdmin(email, pass);
    localStorage.setItem('bazaarpk_admin_token', data.token);
    setToken(data.token);
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('bazaarpk_admin_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

