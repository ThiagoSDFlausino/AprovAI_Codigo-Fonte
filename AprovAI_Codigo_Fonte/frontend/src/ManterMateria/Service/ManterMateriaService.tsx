import MateriaRepository from '../Repositories/ManterMateriaRepository';
import type { EntradaFormularioMateria, FiltrosMateria } from '../../classes';

const MateriaService = {
  async PesquisaMateria(filters: FiltrosMateria = {}) {
    const { busca } = filters;

    if (busca && busca.trim()) {
      return await MateriaRepository.PesquisaMateriaPorTexto(busca.trim());
    }

    return await MateriaRepository.PesquisaMateria();
  },

  async PesquisaMateriaPorId(id: string) {
    return await MateriaRepository.PesquisaMateriaPorId(id);
  },

  async CadastroMateria(materiaData: EntradaFormularioMateria, userId: string) {
    const { sigla } = materiaData;

    if (!sigla || !sigla.trim()) {
      throw new Error('Sigla é obrigatória.');
    }

    return await MateriaRepository.CadastroMateria({
      sigla: sigla.trim().toUpperCase(),
      criado_por: userId,
      criado_em: new Date().toISOString(),
    });
  },

  async AtualizarMateria(id: string, materiaData: EntradaFormularioMateria) {
    const { sigla } = materiaData;

    if (!sigla || !sigla.trim()) {
      throw new Error('Sigla é obrigatória.');
    }

    return await MateriaRepository.AtualizarMateria(id, {
      sigla: sigla.trim().toUpperCase(),
    });
  },

  async DeletarMateria(id: string) {
    return await MateriaRepository.DeletarMateria(id);
  },
};

export default MateriaService;
