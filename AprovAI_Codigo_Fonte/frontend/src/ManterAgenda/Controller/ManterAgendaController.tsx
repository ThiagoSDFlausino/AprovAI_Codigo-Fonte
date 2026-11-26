
import ManterAgendaService from '../Service/ManterAgendaService';
import type { AgendaAtividade } from '../Agenda/AgendaAtividade';

/**
 * Controller da Agenda.
 * Faz a comunicação entre a interface e a camada de serviço.
 */
const ManterAgendaController = {
  /**
   * Lista as atividades da agenda do aluno.
   */
  async PesquisaAgendaAluno(
    alunoId: string
  ): Promise<AgendaAtividade[]> {
    try {
      return await ManterAgendaService.PesquisaAgendaAluno(alunoId);
    } catch (error) {
      console.error('Erro ao pesquisar agenda do aluno:', error);
      throw error;
    }
  },
};

export default ManterAgendaController;
