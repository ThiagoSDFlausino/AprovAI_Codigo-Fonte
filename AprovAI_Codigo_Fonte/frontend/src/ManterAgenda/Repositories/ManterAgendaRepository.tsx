
import ManterAgendaDAO from '../DAO/ManterAgendaDAO';
import type { AgendaAtividade } from '../Agenda/AgendaAtividade';

/**
 * Camada de repositório da Agenda.
 * Responsável por intermediar o acesso aos dados.
 */
const ManterAgendaRepository = {
  /**
   * Pesquisa a agenda de atividades de um aluno.
   */
  async PesquisaAgendaAluno(
    alunoId: string
  ): Promise<AgendaAtividade[]> {
    return await ManterAgendaDAO.PesquisaAgendaAluno(alunoId);
  },
};

export default ManterAgendaRepository;
