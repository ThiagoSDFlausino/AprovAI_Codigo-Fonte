import UsuarioRepository from '../repositories/UsuarioRepository';
import { createHeadlessSupabaseClient } from '../utils/supabaseClient';
import type { EntradaFormularioUsuario, Usuario } from '../classes';

function normalizeRole(role: unknown) {
  return String(role || '')
    .trim()
    .toLowerCase();
}

function mergeProfileWithUsersRow(profile: Usuario | null, usersRow: Record<string, unknown> | null): Usuario {
  if (!usersRow) return profile as Usuario;
  if (!profile) return profileFromUsersRowOnly(usersRow);
  const rProfile = normalizeRole(profile?.role);
  const rUsers = normalizeRole(usersRow.role);
  const role = rProfile === 'admin' || rUsers === 'admin' ? 'admin' : profile?.role || String(usersRow.role || 'standard');
  const name =
    (profile?.name && String(profile.name).trim()) ||
    (usersRow.full_name && String(usersRow.full_name).trim()) ||
    (usersRow.name && String(usersRow.name).trim()) ||
    '';
  return {
    ...profile,
    id: profile?.id || String(usersRow.id),
    email: profile?.email || String(usersRow.email || ''),
    name,
    role,
    created_at: profile?.created_at || (usersRow.created_at as string | undefined),
    updated_at: profile?.updated_at || (usersRow.updated_at as string | undefined),
  };
}

function profileFromUsersRowOnly(usersRow: Record<string, unknown>): Usuario {
  const role = normalizeRole(usersRow.role) === 'admin' ? 'admin' : String(usersRow.role || 'standard');
  const email = String(usersRow.email || '');
  return {
    id: String(usersRow.id),
    email,
    name: String(usersRow.full_name || usersRow.name || '').trim() || email.split('@')[0] || '',
    role,
    created_at: usersRow.created_at as string | undefined,
    updated_at: usersRow.updated_at as string | undefined,
  };
}

const UsuarioService = {
  async PesquisaUsuario() {
    return await UsuarioRepository.PesquisaUsuario();
  },

  async PesquisaUsuarioPorId(id: string) {
    return await UsuarioRepository.PesquisaUsuarioPorId(id);
  },

  async CadastroUsuario(userData: EntradaFormularioUsuario) {
    const { email, password, name, role } = userData;

    const signupClient = createHeadlessSupabaseClient();
    const { data: authData, error } = await signupClient.auth.signUp({
      email,
      password: password || '',
      options: {
        data: {
          name: (name || '').trim(),
          role: role || 'standard',
        },
      },
    });
    if (error) throw error;
    if (!authData?.user?.id) {
      throw new Error('Não foi possível criar o utilizador na autenticação.');
    }

    let profile = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(authData.user.id);
    if (profile) return profile;

    return await UsuarioRepository.CadastroUsuario({
      id: authData.user.id,
      email,
      name: (name || '').trim() || email.split('@')[0],
      role: role || 'standard',
      created_at: new Date().toISOString(),
    });
  },

  async AtualizarUsuario(id: string, userData: Partial<EntradaFormularioUsuario>) {
    const allowedFields = ['name', 'role', 'email'];
    const filtered = Object.fromEntries(
      Object.entries(userData).filter(([k]) => allowedFields.includes(k)),
    );
    return await UsuarioRepository.AtualizarUsuario(id, filtered);
  },

  async DeletarUsuario(id: string) {
    return await UsuarioRepository.DeletarUsuario(id);
  },

  async PesquisaPerfilUsuario(userId: string) {
    const profile = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(userId);
    let usersRow: Record<string, unknown> | null = null;
    try {
      usersRow = await UsuarioRepository.PesquisaRegistroUsersOpcional(userId);
    } catch {
      usersRow = null;
    }
    if (!profile && !usersRow) {
      return await UsuarioRepository.PesquisaUsuarioPorId(userId);
    }
    if (!profile) {
      return profileFromUsersRowOnly(usersRow as Record<string, unknown>);
    }
    return mergeProfileWithUsersRow(profile, usersRow);
  },
};

export default UsuarioService;
