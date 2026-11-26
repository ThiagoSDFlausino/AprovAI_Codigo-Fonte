
import AtividadeRepository from '../Repositories/ManterAtividadeRepository';
import type {
  Atividade,
  EntradaFormularioAtividade,
} from '../../classes';

/**
 * Camada de serviço de atividades.
 * Centraliza as validações e as regras de negócio
 * antes de realizar operações no banco de dados.
 */
const AtividadeService = {
  /**
   * Pesquisa todas as atividades que o usuário tem permissão para visualizar.
   */
  async PesquisaAtividade(): Promise<Atividade[]> {
    return await AtividadeRepository.PesquisaAtividade();
  },

  /**
   * Pesquisa uma atividade pelo seu identificador.
   */
  async PesquisaAtividadePorId(id: string): Promise<Atividade> {
    if (!id || !id.trim()) {
      throw new Error('O identificador da atividade é obrigatório.');
    }

    return await AtividadeRepository.PesquisaAtividadePorId(id);
  },

  /**
   * Pesquisa as atividades vinculadas a uma matéria.
   */
  async PesquisaAtividadePorMateria(
    materiaId: string
  ): Promise<Atividade[]> {
    if (!materiaId || !materiaId.trim()) {
      throw new Error('É necessário informar uma matéria.');
    }

    return await AtividadeRepository.PesquisaAtividadePorMateria(
      materiaId
    );
  },

  /**
   * Cadastra uma nova atividade após validar os campos obrigatórios.
   */
  async CadastroAtividade(
    atividadeData: EntradaFormularioAtividade
  ): Promise<Atividade> {
    if (!atividadeData.materia_id?.trim()) {
      throw new Error('Selecione uma matéria para a atividade.');
    }

    if (!atividadeData.conteudo?.trim()) {
      throw new Error('O conteúdo da atividade é obrigatório.');
    }

    const dadosValidados: EntradaFormularioAtividade = {
      materia_id: atividadeData.materia_id.trim(),
      conteudo: atividadeData.conteudo.trim(),
      prazo: atividadeData.prazo?.trim() || '',
    };

    return await AtividadeRepository.CadastroAtividade(dadosValidados);
  },

  /**
   * Atualiza uma atividade existente após validar os dados.
   */
  async AtualizarAtividade(
    id: string,
    atividadeData: EntradaFormularioAtividade
  ): Promise<Atividade> {
    if (!id || !id.trim()) {
      throw new Error('O identificador da atividade é obrigatório.');
    }

    if (!atividadeData.materia_id?.trim()) {
      throw new Error('Selecione uma matéria para a atividade.');
    }

    if (!atividadeData.conteudo?.trim()) {
      throw new Error('O conteúdo da atividade é obrigatório.');
    }

    const dadosValidados: EntradaFormularioAtividade = {
      materia_id: atividadeData.materia_id.trim(),
      conteudo: atividadeData.conteudo.trim(),
      prazo: atividadeData.prazo?.trim() || '',
    };

    return await AtividadeRepository.AtualizarAtividade(
      id,
      dadosValidados
    );
  },

  /**
   * Exclui uma atividade pelo identificador.
   */
  async DeletarAtividade(id: string): Promise<boolean> {
    if (!id || !id.trim()) {
      throw new Error('O identificador da atividade é obrigatório.');
    }

    return await AtividadeRepository.DeletarAtividade(id);
  },

  /**
   * Pesquisa atividades pelo conteúdo informado.
   */
  async PesquisaAtividadePorTexto(
    termo: string
  ): Promise<Atividade[]> {
    if (!termo || !termo.trim()) {
      return await AtividadeRepository.PesquisaAtividade();
    }

    return await AtividadeRepository.PesquisaAtividadePorTexto(
      termo.trim()
    );
  },
};

export default AtividadeService;
