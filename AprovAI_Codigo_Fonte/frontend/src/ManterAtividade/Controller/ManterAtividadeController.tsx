
import AtividadeService from '../Service/ManterAtividadeService';
import type {
  Atividade,
  EntradaFormularioAtividade,
} from '../../classes';

/**
 * Controller de atividades.
 * Faz a comunicação entre a interface e a camada de serviço.
 */
const AtividadeController = {
  /**
   * Lista as atividades disponíveis para o usuário autenticado.
   */
  async PesquisaAtividade(): Promise<Atividade[]> {
    return await AtividadeService.PesquisaAtividade();
  },

  /**
   * Busca uma atividade pelo seu ID.
   */
  async PesquisaAtividadePorId(id: string): Promise<Atividade> {
    return await AtividadeService.PesquisaAtividadePorId(id);
  },

  /**
   * Busca todas as atividades de uma matéria específica.
   */
  async PesquisaAtividadePorMateria(
    materiaId: string
  ): Promise<Atividade[]> {
    return await AtividadeService.PesquisaAtividadePorMateria(
      materiaId
    );
  },

  /**
   * Cadastra uma nova atividade.
   */
  async CadastroAtividade(
    atividadeData: EntradaFormularioAtividade
  ): Promise<Atividade> {
    return await AtividadeService.CadastroAtividade(atividadeData);
  },

  /**
   * Atualiza os dados de uma atividade.
   */
  async AtualizarAtividade(
    id: string,
    atividadeData: EntradaFormularioAtividade
  ): Promise<Atividade> {
    return await AtividadeService.AtualizarAtividade(
      id,
      atividadeData
    );
  },

  /**
   * Exclui uma atividade.
   */
  async DeletarAtividade(id: string): Promise<boolean> {
    return await AtividadeService.DeletarAtividade(id);
  },

  /**
   * Pesquisa atividades pelo conteúdo.
   */
  async PesquisaAtividadePorTexto(
    termo: string
  ): Promise<Atividade[]> {
    return await AtividadeService.PesquisaAtividadePorTexto(termo);
  },
};

export default AtividadeController;
