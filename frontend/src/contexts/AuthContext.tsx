
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import AuthService from '../services/AuthService';
import AuthRepository from '../repositories/AuthRepository';
import UsuarioService from '../services/UsuarioService';
import { criarUsuario, parsePermissao, Permissao, type Usuario } from '../classes';

type AuthContextValue = {
  user: User | null;
  profile: Usuario | null;
  permissao: Permissao | null;
  loading: boolean;
  isAdm: boolean;
  isProfessor: boolean;
  isAluno: boolean;
  refreshProfile: (userIdOverride?: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function perfilFallback(authUser: User): Usuario {
  return criarUsuario({
    id: authUser.id,
    email: authUser.email ?? '',
    name: String(authUser.user_metadata?.name ?? '').trim() || authUser.email?.split('@')[0] || '',
    role: authUser.user_metadata?.role ?? Permissao.Aluno,
  });
}

function resolverPermissao(profile: Usuario | null, authUser: User | null): Permissao | null {
  if (profile) return profile.permissao;
  if (!authUser) return null;
  return parsePermissao(String(authUser.user_metadata?.role ?? Permissao.Aluno));
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const carregarPerfil = useCallback(async (authUser: User) => {
    try {
      return await UsuarioService.PesquisaPerfilUsuario(authUser.id);
    } catch {
      return perfilFallback(authUser);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    AuthService.getCurrentSession()
      .then(async (session) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
          const prof = await carregarPerfil(session.user);
          if (!cancelled) setProfile(prof);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((_event, session) => {
      if (cancelled) return;
      if (session?.user) {
        setUser(session.user);
        setTimeout(() => {
          if (cancelled) return;
          carregarPerfil(session.user)
            .then((prof) => {
              if (!cancelled) setProfile(prof);
            })
            .catch(() => {
              if (!cancelled) setProfile(perfilFallback(session.user));
            });
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
  }, [carregarPerfil]);

  const refreshProfile = useCallback(async (userIdOverride?: string) => {
    let authUser: User | null = user;
    if (userIdOverride) {
      try {
        const session = await AuthService.getCurrentSession();
        if (session?.user?.id === userIdOverride) authUser = session.user;
      } catch {
        authUser = null;
      }
    }
    if (!authUser) {
      try {
        authUser = (await AuthRepository.getCurrentUser()) as User | null;
      } catch {
        authUser = null;
      }
    }
    if (!authUser?.id) return;
    try {
      const prof = await carregarPerfil(authUser);
      setProfile(prof);
      setUser(authUser);
    } catch {
      setProfile(perfilFallback(authUser));
    }
  }, [user, carregarPerfil]);

  const permissao = resolverPermissao(profile, user);
  const isAdm = permissao === Permissao.ADM;
  const isProfessor = permissao === Permissao.Professor;
  const isAluno = permissao === Permissao.Aluno;

  return (
    <AuthContext.Provider
      value={{ user, profile, permissao, loading, isAdm, isProfessor, isAluno, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
