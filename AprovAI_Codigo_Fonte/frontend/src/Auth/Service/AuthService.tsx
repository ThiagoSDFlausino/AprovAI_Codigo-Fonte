import AuthRepository from '../Repositories/AuthRepository';
import UsuarioRepository from '../../ManterUsuario/Repositories/ManterUsuarioRepository';
import { Perfil, aplicarCamposPorPerfil, normalizarPerfil } from '../../classes';

const AuthService = {
  async login(email, password) {
    const data = await AuthRepository.login(email, password);
    return { success: true, data };
  },

  async CadastroUsuario(email, password, nome, perfil = Perfil.Aluno) {
    const perfilNormalizado = normalizarPerfil(perfil);
    const authData = await AuthRepository.register(email, password, {
      name: nome?.trim() || '',
      role: perfilNormalizado,
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
          nome: (nome || '').trim() || email.split('@')[0],
          perfil: perfilNormalizado,
          ...aplicarCamposPorPerfil({ perfil: perfilNormalizado }),
          criado_em: new Date().toISOString(),
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
