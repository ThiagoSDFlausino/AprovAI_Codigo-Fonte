import UsuarioDAO from '../dao/UsuarioDAO';

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

  async CadastroUsuario(data: Record<string, unknown>) {
    return await UsuarioDAO.CadastroUsuario(data);
  },

  async AtualizarUsuario(id: string, data: Record<string, unknown>) {
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
