import MateriaRepository from '../repositories/MateriaRepository';
import type { EntradaFormularioMateria } from '../classes';

const MateriaService = {
  async PesquisaMateria() {
    return await MateriaRepository.PesquisaMateria();
  },

  async PesquisaMateriaPorId(id: string) {
    return await MateriaRepository.PesquisaMateriaPorId(id);
  },

  async CadastroMateria(materiaData: EntradaFormularioMateria, userId: string) {
    const { sigla, nome } = materiaData;

    if (!sigla?.trim()) {
      throw new Error('A sigla da matéria é obrigatória.');
    }

    return await MateriaRepository.CadastroMateria({
      sigla: sigla.trim().toUpperCase(),
      nome: nome?.trim() || '',
      created_by: userId,
      created_at: new Date().toISOString(),
    });
  },

  async AtualizarMateria(id: string, materiaData: EntradaFormularioMateria) {
    const { sigla, nome } = materiaData;

    if (!sigla?.trim()) {
      throw new Error('A sigla da matéria é obrigatória.');
    }

    return await MateriaRepository.AtualizarMateria(id, {
      sigla: sigla.trim().toUpperCase(),
      nome: nome?.trim() || '',
    });
  },

  async DeletarMateria(id: string) {
    return await MateriaRepository.DeletarMateria(id);
  },
};

export default MateriaService;
