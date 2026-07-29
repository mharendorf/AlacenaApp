import { Session } from '@supabase/supabase-js';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { Profile } from '../household/types';

type SessionContextValue = {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
};

const SessionContext = createContext<SessionContextValue | null>(null);

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).single();
  if (error) return null;
  return data as Profile;
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  // initializing cubre el primer chequeo de sesión; profileLoading cubre el
  // hueco entre "cambió la sesión" y "ya sabemos si tiene hogar" — sin esto,
  // un usuario que vuelve a iniciar sesión podría verse mandado a onboarding
  // por un instante mientras el perfil todavía no cargó.
  const [initializing, setInitializing] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = useCallback(async () => {
    const userId = session?.user.id;
    if (!userId) {
      setProfile(null);
      return;
    }
    setProfile(await fetchProfile(userId));
  }, [session?.user.id]);

  useEffect(() => {
    let active = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return;
      setSession(data.session);
      if (data.session) setProfile(await fetchProfile(data.session.user.id));
      setInitializing(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!active) return;
      setSession(newSession);
      if (!newSession) {
        setProfile(null);
        return;
      }
      setProfileLoading(true);
      const nextProfile = await fetchProfile(newSession.user.id);
      if (!active) return;
      setProfile(nextProfile);
      setProfileLoading(false);
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return (
    <SessionContext.Provider value={{ session, profile, loading: initializing || profileLoading, refreshProfile }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within a SessionProvider');
  return ctx;
}
