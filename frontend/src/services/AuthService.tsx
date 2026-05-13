// src/services/AuthService.js
import AuthRepository from '../repositories/AuthRepository';
import UserRepository from '../repositories/UserRepository';

const AuthService = {
  async login(email, password) {
    // Do not query `profiles` before login: RLS only allows SELECT for `authenticated`,
    // so the anon client never sees rows and would falsely redirect everyone to register.
    const data = await AuthRepository.login(email, password);
    return { success: true, data };
  },

  async CadastroUsuario(email, password, name, role = 'standard') {
    // Create auth user; pass name (and role) in user_metadata for the DB trigger
    // `handle_new_user` in supabase_migration.sql, which inserts into `profiles`.
    // A second INSERT from the client hits RLS and/or duplicates the row.
    const authData = await AuthRepository.register(email, password, {
      name: name?.trim() || '',
      role: role || 'standard',
    });

    if (!authData.user) {
      throw new Error('Erro ao criar usuário na autenticação.');
    }

    // Perfil costuma ser criado pelo trigger `handle_new_user` (supabase_migration.sql).
    // Se o trigger não existir no projeto, só conseguimos gravar `profiles` quando já há sessão
    // (auth.uid() = id na política de INSERT).
    if (authData.session?.user?.id === authData.user.id) {
      const existing = await UserRepository.findByIdMaybe(authData.user.id);
      if (!existing) {
        await UserRepository.CadastroUsuario({
          id: authData.user.id,
          email,
          name: (name || '').trim() || email.split('@')[0],
          role: role || 'standard',
          created_at: new Date().toISOString(),
        });
      }
    }

    return { success: true };
  },

  async logout() {
    return await AuthRepository.logout();
  },

  async getCurrentSession() {
    return await AuthRepository.getCurrentSession();
  },

  onAuthStateChange(callback) {
    return AuthRepository.onAuthStateChange(callback);
  }
};

export default AuthService;
