import React, { createContext, useState, useContext, useEffect } from 'react';
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
  login: (token: string, clientData: Client) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [client, setClient] = useState<Client | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Initial session check:', session);
      if (session) {
        await fetchClient(session.access_token);
      } else {
        setIsLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session);
      if (event === 'SIGNED_IN' && session) {
        await fetchClient(session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setClient(null);
        setIsAuthenticated(false);
        setIsLoading(false);
        navigate('/login');
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate]);

  const fetchClient = async (token: string) => {
    try {
      console.log('Fetching client with token:', token);
      const { data: { user } } = await supabase.auth.getUser(token);

      if (user) {
        console.log('User found:', user);
        const { data: clientData, error } = await supabase
          .from('clients')
          .select('*')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching client data:', error);
          throw error;
        } else if (clientData) {
          console.log('Client data found:', clientData);
          setClient({
            id: clientData.id,
            email: clientData.email,
            tenantId: clientData.tenant_id,
            companyName: clientData.company_name
          });
          setIsAuthenticated(true);
          navigate(`/dashboard/${clientData.tenant_id}`);
        } else {
          console.error('No client data found for user:', user.id);
          throw new Error('No client data found');
        }
      } else {
        console.error('No user found for token');
        throw new Error('No user found');
      }
    } catch (error) {
      console.error('Error fetching client:', error);
      logout();
    } finally {
      setIsLoading(false);
    }
  };

  const login = (token: string, clientData: Client) => {
    console.log('Logging in:', clientData);
    localStorage.setItem('token', token);
    setClient(clientData);
    setIsAuthenticated(true);
    navigate(`/dashboard/${clientData.tenantId}`);
  };

  const logout = async () => {
    console.log('Logging out');
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during logout:', error);
    } finally {
      localStorage.removeItem('token');
      setClient(null);
      setIsAuthenticated(false);
      navigate('/login');
    }
  };

  return (
    <AuthContext.Provider value={{ client, isAuthenticated, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};