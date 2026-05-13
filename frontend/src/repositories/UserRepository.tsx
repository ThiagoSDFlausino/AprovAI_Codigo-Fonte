// src/repositories/UserRepository.js
import UserDAO from '../dao/UserDAO';

const UserRepository = {
  async PesquisaUsuario() {
    return await UserDAO.PesquisaUsuario();
  },

  async getById(id) {
    return await UserDAO.findById(id);
  },

  async findByIdMaybe(id) {
    return await UserDAO.findByIdMaybe(id);
  },

  async CadastroUsuario(data) {
    return await UserDAO.CadastroUsuario(data);
  },

  async AtualizarUsuario(id, data) {
    return await UserDAO.AtualizarUsuario(id, data);
  },

  async DeletarUsuario(id) {
    return await UserDAO.DeletarUsuario(id);
  },

  async getByEmail(email) {
    return await UserDAO.findByEmail(email);
  },

  async findUsersRowMaybe(id) {
    return await UserDAO.findUsersRowMaybe(id);
  },
};

export default UserRepository;
