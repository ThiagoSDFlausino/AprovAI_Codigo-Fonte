
import MateriaDAO from '../DAO/ManterMateriaDAO';

import type {
  EntradaFormularioMateria,
  Materia,
  MateriaAluno,
  AlunoDisponivelMateria,
} from '../../classes';

const MateriaRepository = {
  // ==========================================
  // OPERAÇÕES DE MATÉRIA
  // ==========================================

  async PesquisaMateria() {
    return await MateriaDAO.PesquisaMateria();
  },

  async PesquisaMateriaPorId(id: string) {
    return await MateriaDAO.PesquisaMateriaPorId(id);
  },

  async CadastroMateria(data: Partial<Materia>) {
    return await MateriaDAO.CadastroMateria(data);
  },

  async AtualizarMateria(
    id: string,
    data: EntradaFormularioMateria
  ) {
    return await MateriaDAO.AtualizarMateria(id, data);
  },

  async DeletarMateria(id: string) {
    return await MateriaDAO.DeletarMateria(id);
  },

  async PesquisaMateriaPorTexto(term: string) {
    return await MateriaDAO.PesquisaMateriaPorTexto(term);
  },

  // ==========================================
  // OPERAÇÕES DE ALUNOS POR MATÉRIA
  // ==========================================

  /**
   * Busca todos os alunos disponíveis para vinculação.
   */
  async PesquisaAlunosDisponiveis(): Promise<AlunoDisponivelMateria[]> {
    return await MateriaDAO.PesquisaAlunosDisponiveis();
  },

  /**
   * Busca os alunos vinculados a uma matéria.
   */
  async PesquisaAlunosVinculados(
    materiaId: string
  ): Promise<MateriaAluno[]> {
    return await MateriaDAO.PesquisaAlunosVinculados(materiaId);
  },

  /**
   * Busca os IDs dos alunos vinculados a uma matéria.
   */
  async PesquisaIdsAlunosVinculados(
    materiaId: string
  ): Promise<string[]> {
    return await MateriaDAO.PesquisaIdsAlunosVinculados(materiaId);
  },

  /**
   * Vincula vários alunos a uma matéria.
   */
  async VincularAlunosMateria(
    materiaId: string,
    alunosIds: string[]
  ) {
    return await MateriaDAO.VincularAlunosMateria(
      materiaId,
      alunosIds
    );
  },

  /**
   * Remove o vínculo entre um aluno e uma matéria.
   */
  async DesvincularAlunoMateria(
    materiaId: string,
    alunoId: string
  ) {
    return await MateriaDAO.DesvincularAlunoMateria(
      materiaId,
      alunoId
    );
  },
};

export default MateriaRepository;
