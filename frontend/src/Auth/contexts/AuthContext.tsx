import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AuthService from '../Service/AuthService';
import AuthRepository from '../Repositories/AuthRepository';
import UsuarioService from '../../ManterUsuario/Service/ManterUsuarioService';
import { normalizarPerfil, Perfil } from '../../classes';
import type { Usuario } from '../../classes';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    AuthService.getCurrentSession()
      .then(async (session) => {
        if (cancelled) return;
        if (session?.user) {
          setUser(session.user);
          try {
            const prof = await UsuarioService.PesquisaPerfilUsuario(session.user.id);
            if (!cancelled) setProfile(prof);
          } catch {
           
          }
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
          UsuarioService.PesquisaPerfilUsuario(session.user.id)
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
      const prof = await UsuarioService.PesquisaPerfilUsuario(id);
      setProfile(prof);
    } catch {
      setProfile(null);
    }
  }, []);

  const isAdmin = normalizarPerfil(profile?.perfil) === Perfil.Adm;
  const isProfessor = normalizarPerfil(profile?.perfil) === Perfil.Professor;
  const isAluno = normalizarPerfil(profile?.perfil) === Perfil.Aluno;

  return (
    <AuthContext.Provider value={{ user, profile, loading, isAdmin, isProfessor, isAluno, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
