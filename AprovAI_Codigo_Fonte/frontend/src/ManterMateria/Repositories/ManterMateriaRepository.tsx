import MateriaDAO from '../DAO/ManterMateriaDAO';
import type { EntradaFormularioMateria, Materia } from '../../classes';

const MateriaRepository = {
  async PesquisaMateria() {
    return await MateriaDAO.PesquisaMateria();
  },

  async PesquisaMateriaPorId(id: string) {
    return await MateriaDAO.PesquisaMateriaPorId(id);
  },

  async CadastroMateria(data: Partial<Materia>) {
    return await MateriaDAO.CadastroMateria(data);
  },

  async AtualizarMateria(id: string, data: EntradaFormularioMateria) {
    return await MateriaDAO.AtualizarMateria(id, data);
  },

  async DeletarMateria(id: string) {
    return await MateriaDAO.DeletarMateria(id);
  },

  async PesquisaMateriaPorTexto(term: string) {
    return await MateriaDAO.PesquisaMateriaPorTexto(term);
  },
};

export default MateriaRepository;
