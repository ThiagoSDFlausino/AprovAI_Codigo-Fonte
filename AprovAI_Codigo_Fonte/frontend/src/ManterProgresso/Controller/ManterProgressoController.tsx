
import ManterProgressoService from '../Service/ManterProgressoService';
import type { Progresso } from '../Progresso/Progresso';

/**
 * Controller de progresso.
 * Faz a comunicação entre a interface e a camada de serviço.
 */
const ManterProgressoController = {
  /**
   * Lista todos os registros de progresso.
   */
  async PesquisaProgresso(): Promise<Progresso[]> {
    try {
      return await ManterProgressoService.PesquisaProgresso();
    } catch (error) {
      console.error('Erro ao pesquisar progressos:', error);
      throw error;
    }
  },

  /**
   * Lista os progressos de um aluno.
   */
  async PesquisaProgressoPorAluno(
    alunoId: string
  ): Promise<Progresso[]> {
    try {
      return await ManterProgressoService.PesquisaProgressoPorAluno(
        alunoId
      );
    } catch (error) {
      console.error('Erro ao pesquisar progresso do aluno:', error);
      throw error;
    }
  },

  /**
   * Lista os progressos de uma atividade.
   */
  async PesquisaProgressoPorAtividade(
    atividadeId: string
  ): Promise<Progresso[]> {
    try {
      return await ManterProgressoService.PesquisaProgressoPorAtividade(
        atividadeId
      );
    } catch (error) {
      console.error('Erro ao pesquisar progresso da atividade:', error);
      throw error;
    }
  },

  /**
   * Pesquisa o progresso de um aluno em uma atividade específica.
   */
  async PesquisaProgressoPorAlunoEAtividade(
    alunoId: string,
    atividadeId: string
  ): Promise<Progresso | null> {
    try {
      return await ManterProgressoService.PesquisaProgressoPorAlunoEAtividade(
        alunoId,
        atividadeId
      );
    } catch (error) {
      console.error(
        'Erro ao pesquisar progresso do aluno na atividade:',
        error
      );
      throw error;
    }
  },

  /**
   * Finaliza uma atividade para determinado aluno.
   */
  async FinalizarAtividade(
    alunoId: string,
    atividadeId: string
  ): Promise<Progresso> {
    try {
      return await ManterProgressoService.FinalizarAtividade(
        alunoId,
        atividadeId
      );
    } catch (error) {
      console.error('Erro ao finalizar atividade:', error);
      throw error;
    }
  },
};

export default ManterProgressoController;
