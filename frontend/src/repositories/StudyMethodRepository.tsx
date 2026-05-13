// src/repositories/StudyMethodRepository.js
import StudyMethodDAO from '../dao/StudyMethodDAO';

const StudyMethodRepository = {
  async PesquisaMetodoEstudo() {
    return await StudyMethodDAO.PesquisaMetodoEstudo();
  },

  async PesquisaMetodoEstudoPorId(id) {
    return await StudyMethodDAO.PesquisaMetodoEstudoPorId(id);
  },

  async CadastroMetodoEstudo(data) {
    return await StudyMethodDAO.CadastroMetodoEstudo(data);
  },

  async AtualizarMetodoEstudo(id, data) {
    return await StudyMethodDAO.AtualizarMetodoEstudo(id, data);
  },

  async DeletarMetodoEstudo(id) {
    return await StudyMethodDAO.DeletarMetodoEstudo(id);
  },

  async PesquisaMetodoEstudoPorCategoria(category) {
    return await StudyMethodDAO.PesquisaMetodoEstudoPorCategoria(category);
  },

  async PesquisaMetodoEstudoPorTexto(term) {
    return await StudyMethodDAO.PesquisaMetodoEstudoPorTexto(term);
  }
};

export default StudyMethodRepository;
