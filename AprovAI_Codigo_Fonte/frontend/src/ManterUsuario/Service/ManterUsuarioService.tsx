import UsuarioRepository from '../Repositories/ManterUsuarioRepository';
import { createHeadlessSupabaseClient } from '../../utils/supabaseClient';
import {
  aplicarCamposPorPerfil,
  normalizarPerfil,
  type EntradaFormularioUsuario,
  type Usuario,
} from '../../classes';

function montarUsuario(
  userData: EntradaFormularioUsuario,
  extras: Partial<Usuario> = {},
): Partial<Usuario> {
  const perfil = normalizarPerfil(userData.perfil);

  return {
    nome: (userData.nome || '').trim(),
    email: userData.email,
    perfil,
    ...aplicarCamposPorPerfil(userData),
    ...extras,
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
    const { email, senha } = userData;
    const perfil = normalizarPerfil(userData.perfil);

    const signupClient = createHeadlessSupabaseClient();
    const { data: authData, error } = await signupClient.auth.signUp({
      email,
      password: senha || '',
      options: {
        data: {
          name: (userData.nome || '').trim(),
          role: perfil,
        },
      },
    });
    if (error) throw error;
    if (!authData?.user?.id) {
      throw new Error('Não foi possível criar o utilizador na autenticação.');
    }

    const payload = montarUsuario(userData, {
      id: authData.user.id,
      criado_em: new Date().toISOString(),
    });

    const existente = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(authData.user.id);
    if (existente) {
      return await UsuarioRepository.AtualizarUsuario(authData.user.id, payload);
    }

    return await UsuarioRepository.CadastroUsuario(payload);
  },

  async AtualizarUsuario(id: string, userData: Partial<EntradaFormularioUsuario>) {
    const payload: Partial<Usuario> = {};

    if (userData.nome !== undefined) payload.nome = userData.nome.trim();
    if (userData.email !== undefined) payload.email = userData.email;

    const perfil =
      userData.perfil !== undefined
        ? normalizarPerfil(userData.perfil)
        : (await UsuarioRepository.PesquisaUsuarioPorId(id)).perfil;

    payload.perfil = perfil;
    Object.assign(
      payload,
      aplicarCamposPorPerfil({
        perfil,
        funcao: userData.funcao,
        formacao: userData.formacao,
        matricula: userData.matricula,
        curso: userData.curso,
      }),
    );

    return await UsuarioRepository.AtualizarUsuario(id, payload);
  },

  async DeletarUsuario(id: string) {
    return await UsuarioRepository.DeletarUsuario(id);
  },

  async PesquisaPerfilUsuario(userId: string) {
    const usuario = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(userId);
    if (usuario) return usuario;
    return await UsuarioRepository.PesquisaUsuarioPorId(userId);
  },
};

export default UsuarioService;
