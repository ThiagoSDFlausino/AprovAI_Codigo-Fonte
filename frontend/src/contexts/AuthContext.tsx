// src/contexts/AuthContext.js
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AuthService from '../services/AuthService';
import AuthRepository from '../repositories/AuthRepository';
import UserService from '../services/UserService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // Initial session check (not inside onAuthStateChange lock — async OK here)
    AuthService.getCurrentSession()
      .then(async (session) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
          try {
            const prof = await UserService.getUserProfile(session.user.id);
            if (!cancelled) setProfile(prof);
          } catch {
            /* profile optional on boot */
          }
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    // Never use async + await on other Supabase calls inside this callback — it runs under
    // an internal auth lock and causes deadlock (signIn hangs forever). Defer profile load.
    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          if (cancelled) return;
          UserService.getUserProfile(session.user.id)
            .then((prof) => {
              if (!cancelled) setProfile(prof);
            })
            .catch(() => {});
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  /**
   * Recarrega `public.profiles` para o utilizador autenticado.
   * Use após promover a admin no SQL (sem fechar sessão) ou passe `userId` logo após o login.
   */
  const refreshProfile = useCallback(async (userIdOverride) => {
    let id = userIdOverride;
    if (!id) {
      try {
        id = (await AuthRepository.getCurrentUser())?.id;
      } catch {
        id = undefined;
      }
    }
    if (!id) return;
    try {
      const prof = await UserService.getUserProfile(id);
      setProfile(prof);
    } catch {
      setProfile(null);
    }
  }, []);

  const isAdmin = (profile?.role || '').toLowerCase() === 'admin';

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
