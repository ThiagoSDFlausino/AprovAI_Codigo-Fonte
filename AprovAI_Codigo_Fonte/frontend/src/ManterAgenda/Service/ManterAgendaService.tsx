
import ManterAgendaRepository from '../Repositories/ManterAgendaRepository';
import type { AgendaAtividade } from '../Agenda/AgendaAtividade';

/**
 * Camada de serviço da Agenda.
 * Concentra as regras de negócio relacionadas à agenda do aluno.
 */
const ManterAgendaService = {
  /**
   * Retorna as atividades da agenda do aluno.
   */
  async PesquisaAgendaAluno(
    alunoId: string
  ): Promise<AgendaAtividade[]> {
    if (!alunoId || alunoId.trim() === '') {
      throw new Error('Não foi possível identificar o aluno.');
    }

    return await ManterAgendaRepository.PesquisaAgendaAluno(alunoId);
  },
};

export default ManterAgendaService;
