import MetodoEstudoDAO from '../DAO/ManterMetodoEstudoDAO';
import type { EntradaFormularioMetodoEstudo, MetodoEstudo } from '../../classes';

const MetodoEstudoRepository = {
  async PesquisaMetodoEstudo() {
    return await MetodoEstudoDAO.PesquisaMetodoEstudo();
  },

  async PesquisaMetodoEstudoPorId(id: string) {
    return await MetodoEstudoDAO.PesquisaMetodoEstudoPorId(id);
  },

  async CadastroMetodoEstudo(data: Partial<MetodoEstudo>) {
    return await MetodoEstudoDAO.CadastroMetodoEstudo(data);
  },

  async AtualizarMetodoEstudo(id: string, data: EntradaFormularioMetodoEstudo) {
    return await MetodoEstudoDAO.AtualizarMetodoEstudo(id, data);
  },

  async DeletarMetodoEstudo(id: string) {
    return await MetodoEstudoDAO.DeletarMetodoEstudo(id);
  },

  async PesquisaMetodoEstudoPorCategoria(category: string) {
    return await MetodoEstudoDAO.PesquisaMetodoEstudoPorCategoria(category);
  },

  async PesquisaMetodoEstudoPorTexto(term: string) {
    return await MetodoEstudoDAO.PesquisaMetodoEstudoPorTexto(term);
  },
};

export default MetodoEstudoRepository;
