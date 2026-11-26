
import AtividadeDAO from '../DAO/ManterAtividadeDAO';

import type {
  Atividade,
  EntradaFormularioAtividade,
} from '../../classes';

/**
 * Repository responsável por intermediar
 * a comunicação entre o Service e o DAO de atividades.
 */
const AtividadeRepository = {
  /**
   * Pesquisa as atividades disponíveis para o usuário.
   */
  async PesquisaAtividade(): Promise<Atividade[]> {
    return await AtividadeDAO.PesquisaAtividade();
  },

  /**
   * Pesquisa uma atividade pelo ID.
   */
  async PesquisaAtividadePorId(
    id: string,
  ): Promise<Atividade> {
    return await AtividadeDAO.PesquisaAtividadePorId(id);
  },

  /**
   * Pesquisa as atividades vinculadas a uma matéria.
   */
  async PesquisaAtividadePorMateria(
    materiaId: string,
  ): Promise<Atividade[]> {
    return await AtividadeDAO.PesquisaAtividadePorMateria(
      materiaId,
    );
  },

  /**
   * Realiza o cadastro de uma atividade.
   */
  async CadastroAtividade(
    atividadeData: EntradaFormularioAtividade,
  ): Promise<Atividade> {
    return await AtividadeDAO.CadastroAtividade(
      atividadeData,
    );
  },

  /**
   * Atualiza uma atividade existente.
   */
  async AtualizarAtividade(
    id: string,
    atividadeData: EntradaFormularioAtividade,
  ): Promise<Atividade> {
    return await AtividadeDAO.AtualizarAtividade(
      id,
      atividadeData,
    );
  },

  /**
   * Exclui uma atividade.
   */
  async DeletarAtividade(
    id: string,
  ): Promise<boolean> {
    return await AtividadeDAO.DeletarAtividade(id);
  },

  /**
   * Pesquisa atividades pelo conteúdo.
   */
  async PesquisaAtividadePorTexto(
    termo: string,
  ): Promise<Atividade[]> {
    return await AtividadeDAO.PesquisaAtividadePorTexto(
      termo,
    );
  },
};

export default AtividadeRepository;
