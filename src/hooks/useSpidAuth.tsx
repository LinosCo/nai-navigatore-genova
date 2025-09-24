import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signInWithSpid: (returnUrl?: string) => Promise<void>;
  isSpidUser: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const signInWithSpid = async (returnUrl?: string) => {
    try {
      // Redirect to SPID authentication page
      const spidUrl = buildSpidAuthUrl(returnUrl || window.location.origin);
      window.location.href = spidUrl;
    } catch (error) {
      console.error('SPID login error:', error);
      throw error;
    }
  };

  const isSpidUser = Boolean(
    user?.user_metadata?.provider === 'spid' || 
    user?.user_metadata?.codice_fiscale
  );

  const value = {
    user,
    session,
    loading,
    signOut,
    signInWithSpid,
    isSpidUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

function buildSpidAuthUrl(returnUrl: string): string {
  // URL del Service Provider SPID (da configurare con l'Identity Provider)
  const spidServiceProviderUrl = process.env.NODE_ENV === 'production' 
    ? 'https://your-domain.com/spid/login'  // URL produzione
    : 'https://localhost:8080/spid/login';  // URL test locale

  const params = new URLSearchParams({
    returnUrl: returnUrl,
    level: 'SpidL2', // Livello di autenticazione SPID
    attributeConsumingServiceIndex: '0'
  });

  return `${spidServiceProviderUrl}?${params.toString()}`;
}