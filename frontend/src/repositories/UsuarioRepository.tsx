import UsuarioDAO from '../dao/UsuarioDAO';
import type { Usuario } from '../classes';

const UsuarioRepository = {
  async PesquisaUsuario() {
    return await UsuarioDAO.PesquisaUsuario();
  },

  async PesquisaUsuarioPorId(id: string) {
    return await UsuarioDAO.PesquisaUsuarioPorId(id);
  },

  async PesquisaUsuarioPorIdOpcional(id: string) {
    return await UsuarioDAO.PesquisaUsuarioPorIdOpcional(id);
  },

  async CadastroUsuario(data: Partial<Usuario>) {
    return await UsuarioDAO.CadastroUsuario(data);
  },

  async AtualizarUsuario(id: string, data: Partial<Usuario>) {
    return await UsuarioDAO.AtualizarUsuario(id, data);
  },

  async DeletarUsuario(id: string) {
    return await UsuarioDAO.DeletarUsuario(id);
  },

  async PesquisaUsuarioPorEmail(email: string) {
    return await UsuarioDAO.PesquisaUsuarioPorEmail(email);
  },

  async PesquisaRegistroUsersOpcional(id: string) {
    return await UsuarioDAO.PesquisaRegistroUsersOpcional(id);
  },
};

export default UsuarioRepository;
