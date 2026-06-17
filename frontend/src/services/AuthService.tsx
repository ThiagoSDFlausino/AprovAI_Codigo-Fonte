import AuthRepository from '../repositories/AuthRepository';
import UsuarioRepository from '../repositories/UsuarioRepository';

const AuthService = {
  async login(email, password) {
    const data = await AuthRepository.login(email, password);
    return { success: true, data };
  },

  async CadastroUsuario(email, password, name, role = 'aluno') {

    const authData = await AuthRepository.register(email, password, {
      name: name?.trim() || '',
      role: role || 'aluno',
    });

    if (!authData.user) {
      throw new Error('Erro ao criar usuário na autenticação.');
    }
    if (authData.session?.user?.id === authData.user.id) {
      const existing = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(authData.user.id);
      if (!existing) {
        await UsuarioRepository.CadastroUsuario({
          id: authData.user.id,
          email,
          name: (name || '').trim() || email.split('@')[0],
          role: role || 'aluno',
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
