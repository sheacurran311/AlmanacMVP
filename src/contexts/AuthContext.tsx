import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate } from 'react-router-dom';

interface Client {
  id: string;
  email: string;
  tenantId: string;
  companyName: string;
}

interface AuthContextType {
  client: Client | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedClient = sessionStorage.getItem('client');
    if (storedClient) {
      setClient(JSON.parse(storedClient));
      setIsAuthenticated(sessionStorage.getItem('isAuthenticated') === 'true');
    }
    setIsLoading(false);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    console.log('Logging in:', email);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) {
        throw new Error(error.message);
      }

      if (data.session) {
        const user = data.user;

        const clientData: Client = {
          id: user.id,
          email: user.email ?? 'default@example.com',
          tenantId: user.user_metadata?.tenant_id ?? 'default-tenant-id',
          companyName: user.user_metadata?.company_name ?? 'Default Company',
        };

        // Update state and storage
        localStorage.setItem('token', data.session.access_token);
        setClient(clientData);
        setIsAuthenticated(true);
        sessionStorage.setItem('client', JSON.stringify(clientData));
        sessionStorage.setItem('isAuthenticated', 'true');
        navigate(`/dashboard/${clientData.tenantId}`, { replace: true });
      }
    } catch (error: any) {
      console.error('Error during login:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const logout = useCallback(async () => {
    console.log('Logging out');
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      // Clear storage and state
      localStorage.removeItem('token');
      sessionStorage.removeItem('client');
      sessionStorage.removeItem('isAuthenticated');
      setClient(null);
      setIsAuthenticated(false);
      setIsLoading(false);
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  return (
    <AuthContext.Provider value={{ client, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Ensure the hook is properly defined and exported without syntax issues
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
