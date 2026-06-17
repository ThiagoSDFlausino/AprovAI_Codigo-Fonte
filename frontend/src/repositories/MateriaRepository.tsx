import MateriaDAO from '../dao/MateriaDAO';
import type { EntradaFormularioMateria, Materia } from '../classes';

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
};

export default MateriaRepository;
