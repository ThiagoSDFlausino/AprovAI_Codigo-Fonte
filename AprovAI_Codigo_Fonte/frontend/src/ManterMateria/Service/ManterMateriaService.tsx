
import MateriaRepository from '../Repositories/ManterMateriaRepository';

import type {
  EntradaFormularioMateria,
  FiltrosMateria,
} from '../../classes';

const MateriaService = {
  // ==========================================
  // OPERAÇÕES DE MATÉRIA
  // ==========================================

  async PesquisaMateria(filters: FiltrosMateria = {}) {
    const { busca } = filters;

    if (busca && busca.trim()) {
      return await MateriaRepository.PesquisaMateriaPorTexto(
        busca.trim()
      );
    }

    return await MateriaRepository.PesquisaMateria();
  },

  async PesquisaMateriaPorId(id: string) {
    if (!id) {
      throw new Error('Identificador da matéria não informado.');
    }

    return await MateriaRepository.PesquisaMateriaPorId(id);
  },

  async CadastroMateria(
    materiaData: EntradaFormularioMateria,
    userId: string
  ) {
    const { sigla } = materiaData;

    if (!sigla || !sigla.trim()) {
      throw new Error('Sigla é obrigatória.');
    }

    if (!userId) {
      throw new Error('Usuário responsável não identificado.');
    }

    return await MateriaRepository.CadastroMateria({
      sigla: sigla.trim().toUpperCase(),
      criado_por: userId,
      criado_em: new Date().toISOString(),
    });
  },

  async AtualizarMateria(
    id: string,
    materiaData: EntradaFormularioMateria
  ) {
    if (!id) {
      throw new Error('Identificador da matéria não informado.');
    }

    const { sigla } = materiaData;

    if (!sigla || !sigla.trim()) {
      throw new Error('Sigla é obrigatória.');
    }

    return await MateriaRepository.AtualizarMateria(id, {
      sigla: sigla.trim().toUpperCase(),
    });
  },

  async DeletarMateria(id: string) {
    if (!id) {
      throw new Error('Identificador da matéria não informado.');
    }

    return await MateriaRepository.DeletarMateria(id);
  },

  // ==========================================
  // GERENCIAMENTO DE ALUNOS POR MATÉRIA
  // ==========================================

  /**
   * Busca todos os alunos disponíveis para vinculação.
   */
  async PesquisaAlunosDisponiveis() {
    return await MateriaRepository.PesquisaAlunosDisponiveis();
  },

  /**
   * Busca os alunos vinculados a uma matéria.
   */
  async PesquisaAlunosVinculados(materiaId: string) {
    if (!materiaId) {
      throw new Error('Identificador da matéria não informado.');
    }

    return await MateriaRepository.PesquisaAlunosVinculados(
      materiaId
    );
  },

  /**
   * Busca os IDs dos alunos vinculados a uma matéria.
   */
  async PesquisaIdsAlunosVinculados(materiaId: string) {
    if (!materiaId) {
      throw new Error('Identificador da matéria não informado.');
    }

    return await MateriaRepository.PesquisaIdsAlunosVinculados(
      materiaId
    );
  },

  /**
   * Vincula uma lista de alunos a uma matéria.
   */
  async VincularAlunosMateria(
    materiaId: string,
    alunosIds: string[]
  ) {
    if (!materiaId) {
      throw new Error('Identificador da matéria não informado.');
    }

    if (!Array.isArray(alunosIds)) {
      throw new Error('A lista de alunos é inválida.');
    }

    const alunosValidos: string[] = alunosIds
    .filter(
      (alunoId) =>
        typeof alunoId === 'string' && alunoId.trim() !== ''
    )
    .filter(
      (alunoId, index, lista) =>
        lista.indexOf(alunoId) === index
    );

    if (alunosValidos.length === 0) {
      throw new Error('Selecione pelo menos um aluno.');
    }

    return await MateriaRepository.VincularAlunosMateria(
      materiaId,
      alunosValidos
    );
  },

  /**
   * Remove um aluno de uma matéria.
   */
  async DesvincularAlunoMateria(
    materiaId: string,
    alunoId: string
  ) {
    if (!materiaId) {
      throw new Error('Identificador da matéria não informado.');
    }

    if (!alunoId) {
      throw new Error('Identificador do aluno não informado.');
    }

    return await MateriaRepository.DesvincularAlunoMateria(
      materiaId,
      alunoId
    );
  },
};

export default MateriaService;
