
import ManterProgressoDAO from '../DAO/ManterProgressoDAO';
import type { Progresso } from '../Progresso/Progresso';

/**
 * Camada Repository de progresso.
 * Responsável por intermediar o acesso aos dados de progresso.
 */
const ManterProgressoRepository = {
  /**
   * Pesquisa todos os registros de progresso.
   */
  async PesquisaProgresso(): Promise<Progresso[]> {
    return await ManterProgressoDAO.PesquisaProgresso();
  },

  /**
   * Pesquisa os progressos de um aluno.
   */
  async PesquisaProgressoPorAluno(
    alunoId: string
  ): Promise<Progresso[]> {
    return await ManterProgressoDAO.PesquisaProgressoPorAluno(
      alunoId
    );
  },

  /**
   * Pesquisa os progressos de uma atividade.
   */
  async PesquisaProgressoPorAtividade(
    atividadeId: string
  ): Promise<Progresso[]> {
    return await ManterProgressoDAO.PesquisaProgressoPorAtividade(
      atividadeId
    );
  },

  /**
   * Pesquisa o progresso de um aluno em uma atividade específica.
   */
  async PesquisaProgressoPorAlunoEAtividade(
    alunoId: string,
    atividadeId: string
  ): Promise<Progresso | null> {
    return await ManterProgressoDAO.PesquisaProgressoPorAlunoEAtividade(
      alunoId,
      atividadeId
    );
  },

  /**
   * Inicia uma atividade para determinado aluno.
   */
  async IniciarAtividade(
    alunoId: string,
    atividadeId: string
  ): Promise<Progresso> {
    return await ManterProgressoDAO.IniciarAtividade(
      alunoId,
      atividadeId
    );
  },

  /**
   * Finaliza uma atividade para determinado aluno.
   */
  async FinalizarAtividade(
    alunoId: string,
    atividadeId: string
  ): Promise<Progresso> {
    return await ManterProgressoDAO.FinalizarAtividade(
      alunoId,
      atividadeId
    );
  },
};

export default ManterProgressoRepository;
