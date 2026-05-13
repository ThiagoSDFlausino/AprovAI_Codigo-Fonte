// src/services/UserService.js
import UserRepository from '../repositories/UserRepository';
import { createHeadlessSupabaseClient } from '../utils/supabaseClient';

function normalizeRole(role) {
  return String(role || '')
    .trim()
    .toLowerCase();
}

/** Junta `profiles` com linha opcional em `public.users` (ex.: role admin só em `users`). */
function mergeProfileWithUsersRow(profile, usersRow) {
  if (!usersRow) return profile;
  if (!profile) return profileFromUsersRowOnly(usersRow);
  const rProfile = normalizeRole(profile?.role);
  const rUsers = normalizeRole(usersRow.role);
  const role = rProfile === 'admin' || rUsers === 'admin' ? 'admin' : profile?.role || usersRow.role || 'standard';
  const name =
    (profile?.name && String(profile.name).trim()) ||
    (usersRow.full_name && String(usersRow.full_name).trim()) ||
    (usersRow.name && String(usersRow.name).trim()) ||
    '';
  return {
    ...profile,
    id: profile?.id || usersRow.id,
    email: profile?.email || usersRow.email,
    name,
    role,
    created_at: profile?.created_at || usersRow.created_at,
    updated_at: profile?.updated_at || usersRow.updated_at,
  };
}

function profileFromUsersRowOnly(usersRow) {
  const role = normalizeRole(usersRow.role) === 'admin' ? 'admin' : usersRow.role || 'standard';
  return {
    id: usersRow.id,
    email: usersRow.email,
    name: (usersRow.full_name || usersRow.name || '').trim() || usersRow.email?.split('@')[0] || '',
    role,
    created_at: usersRow.created_at,
    updated_at: usersRow.updated_at,
  };
}

const UserService = {
  async PesquisaUsuario() {
    return await UserRepository.PesquisaUsuario();
  },

  async getUserById(id) {
    return await UserRepository.getById(id);
  },

  async CadastroUsuario(userData) {
    const { email, password, name, role } = userData;

    const signupClient = createHeadlessSupabaseClient();
    const { data: authData, error } = await signupClient.auth.signUp({
      email,
      password,
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

    // Trigger `handle_new_user` insere em `profiles`. Evita INSERT duplicado no cliente.
    let profile = await UserRepository.findByIdMaybe(authData.user.id);
    if (profile) return profile;

    return await UserRepository.CadastroUsuario({
      id: authData.user.id,
      email,
      name: (name || '').trim() || email.split('@')[0],
      role: role || 'standard',
      created_at: new Date().toISOString(),
    });
  },

  async AtualizarUsuario(id, userData) {
    const allowedFields = ['name', 'role', 'email'];
    const filtered = Object.fromEntries(
      Object.entries(userData).filter(([k]) => allowedFields.includes(k))
    );
    return await UserRepository.AtualizarUsuario(id, filtered);
  },

  async DeletarUsuario(id) {
    // Delete profile (auth user deletion requires admin API)
    return await UserRepository.DeletarUsuario(id);
  },

  async getUserProfile(userId) {
    const profile = await UserRepository.findByIdMaybe(userId);
    let usersRow = null;
    try {
      usersRow = await UserRepository.findUsersRowMaybe(userId);
    } catch {
      usersRow = null;
    }
    if (!profile && !usersRow) {
      return await UserRepository.getById(userId);
    }
    if (!profile) {
      return profileFromUsersRowOnly(usersRow);
    }
    return mergeProfileWithUsersRow(profile, usersRow);
  },
};

export default UserService;
