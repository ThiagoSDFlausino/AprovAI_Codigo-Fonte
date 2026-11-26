
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

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

  const authVersion = useRef(0);
  const profileVersion = useRef(0);

  useEffect(() => {
    let cancelled = false;

    const carregarPerfil = async (userId: string, versao: number) => {
      try {
        const prof = await UsuarioService.PesquisaPerfilUsuario(userId);

        if (
          cancelled ||
          versao !== profileVersion.current
        ) {
          return;
        }

        setProfile(prof);
      } catch {
        if (
          !cancelled &&
          versao === profileVersion.current
        ) {
          setProfile(null);
        }
      }
    };

    const {
      data: { subscription },
    } = AuthService.onAuthStateChange((_event, session) => {
      if (cancelled) return;

      authVersion.current += 1;
      profileVersion.current += 1;

      const versaoPerfil = profileVersion.current;

      if (session?.user) {
        setUser(session.user);
        setProfile(null);

        // A consulta é iniciada fora do callback de autenticação.
        setTimeout(() => {
          if (cancelled) return;

          carregarPerfil(session.user.id, versaoPerfil);
        }, 0);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    const versaoInicial = authVersion.current;

    AuthService.getCurrentSession()
      .then(async (session) => {
        if (
          cancelled ||
          versaoInicial !== authVersion.current
        ) {
          return;
        }

        if (session?.user) {
          setUser(session.user);

          profileVersion.current += 1;

          await carregarPerfil(
            session.user.id,
            profileVersion.current
          );
        } else {
          setUser(null);
          setProfile(null);
        }
      })
      .catch(() => {
        if (versaoInicial === authVersion.current) {
          setUser(null);
          setProfile(null);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
      subscription?.unsubscribe();
    };
  }, []);

  const refreshProfile = useCallback(async (userIdOverride?: string) => {
    const versao = ++profileVersion.current;

    let id = userIdOverride;

    if (!id) {
      try {
        id = (await AuthRepository.getCurrentUser())?.id;
      } catch {
        id = undefined;
      }
    }

    if (!id) {
      if (versao === profileVersion.current) {
        setProfile(null);
      }
      return;
    }

    try {
      const prof = await UsuarioService.PesquisaPerfilUsuario(id);

      if (versao === profileVersion.current) {
        setProfile(prof);
      }
    } catch {
      if (versao === profileVersion.current) {
        setProfile(null);
      }
    }
  }, []);

  const isAdmin =
    normalizarPerfil(profile?.perfil) === Perfil.Adm;

  const isProfessor =
    normalizarPerfil(profile?.perfil) === Perfil.Professor;

  const isAluno =
    normalizarPerfil(profile?.perfil) === Perfil.Aluno;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        isAdmin,
        isProfessor,
        isAluno,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

  return ctx;
};
