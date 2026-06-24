import UsuarioDAO from '../DAO/ManterUsuarioDAO';
import type { Usuario } from '../Usuario/Usuario';

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
};

export default UsuarioRepository;
