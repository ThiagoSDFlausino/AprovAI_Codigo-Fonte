
import ManterProgressoRepository from '../Repositories/ManterProgressoRepository';
import {
  StatusProgresso,
  type Progresso,
} from '../Progresso/Progresso';

/**
 * Camada Service de progresso.
 * Concentra as regras de negócio relacionadas ao progresso dos alunos.
 */
const ManterProgressoService = {
  /**
   * Pesquisa todos os registros de progresso.
   */
  async PesquisaProgresso(): Promise<Progresso[]> {
    return await ManterProgressoRepository.PesquisaProgresso();
  },

  /**
   * Pesquisa os progressos de um aluno.
   */
  async PesquisaProgressoPorAluno(
    alunoId: string
  ): Promise<Progresso[]> {
    if (!alunoId || !alunoId.trim()) {
      throw new Error('O identificador do aluno é obrigatório.');
    }

    return await ManterProgressoRepository.PesquisaProgressoPorAluno(
      alunoId
    );
  },

  /**
   * Pesquisa os progressos de uma atividade.
   */
  async PesquisaProgressoPorAtividade(
    atividadeId: string
  ): Promise<Progresso[]> {
    if (!atividadeId || !atividadeId.trim()) {
      throw new Error('O identificador da atividade é obrigatório.');
    }

    return await ManterProgressoRepository.PesquisaProgressoPorAtividade(
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
    if (!alunoId || !alunoId.trim()) {
      throw new Error('O identificador do aluno é obrigatório.');
    }

    if (!atividadeId || !atividadeId.trim()) {
      throw new Error('O identificador da atividade é obrigatório.');
    }

    return await ManterProgressoRepository.PesquisaProgressoPorAlunoEAtividade(
      alunoId,
      atividadeId
    );
  },

  /**
   * Finaliza uma atividade para determinado aluno.
   *
   * Se ainda não foi iniciada, realiza primeiro a transição
   * NAO_INICIADO -> ATIVO e depois ATIVO -> CONCLUIDO.
   *
   * Se já estiver ativa, realiza somente a finalização.
   */
  async FinalizarAtividade(
    alunoId: string,
    atividadeId: string
  ): Promise<Progresso> {
    if (!alunoId || !alunoId.trim()) {
      throw new Error('O identificador do aluno é obrigatório.');
    }

    if (!atividadeId || !atividadeId.trim()) {
      throw new Error('O identificador da atividade é obrigatório.');
    }

    const progresso =
      await ManterProgressoRepository.PesquisaProgressoPorAlunoEAtividade(
        alunoId,
        atividadeId
      );

    if (!progresso) {
      throw new Error(
        'Não foi encontrado um registro de progresso para esta atividade.'
      );
    }

    if (progresso.status === StatusProgresso.CONCLUIDO) {
      throw new Error('Esta atividade já foi concluída.');
    }

    if (progresso.status === StatusProgresso.ATRASADO) {
      throw new Error(
        'Não é possível finalizar uma atividade com status atrasado.'
      );
    }

    if (progresso.status === StatusProgresso.NAO_INICIADO) {
      await ManterProgressoRepository.IniciarAtividade(
        alunoId,
        atividadeId
      );
    } else if (progresso.status !== StatusProgresso.ATIVO) {
      throw new Error('O status atual da atividade não é válido.');
    }

    return await ManterProgressoRepository.FinalizarAtividade(
      alunoId,
      atividadeId
    );
  },
};

export default ManterProgressoService;
