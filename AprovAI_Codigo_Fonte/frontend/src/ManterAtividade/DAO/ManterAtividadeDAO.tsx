
import { supabase } from '../../utils/supabaseClient';

import type {
  Atividade,
  EntradaFormularioAtividade,
} from '../../classes';

const AtividadeDAO = {
  /**
   * Pesquisa todas as atividades que o usuário autenticado
   * tem permissão para visualizar.
   */
  async PesquisaAtividade() {
    const { data, error } = await supabase
      .from('Atividade')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return data as Atividade[];
  },

  /**
   * Pesquisa uma atividade pelo seu ID.
   */
  async PesquisaAtividadePorId(id: string) {
    const { data, error } = await supabase
      .from('Atividade')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;

    return data as Atividade;
  },

  /**
   * Pesquisa as atividades de uma matéria específica.
   */
  async PesquisaAtividadePorMateria(materiaId: string) {
    const { data, error } = await supabase
      .from('Atividade')
      .select('*')
      .eq('materia_id', materiaId)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return data as Atividade[];
  },

  /**
   * Cadastra uma atividade vinculada a uma matéria.
   *
   * O progresso inicial dos alunos vinculados à matéria
   * é criado automaticamente pelo trigger do banco de dados.
   */
  async CadastroAtividade(
    atividadeData: EntradaFormularioAtividade,
  ) {
    const { data, error } = await supabase
      .from('Atividade')
      .insert([
        {
          materia_id: atividadeData.materia_id,
          conteudo: atividadeData.conteudo.trim(),
          prazo: atividadeData.prazo || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return data as Atividade;
  },

  /**
   * Atualiza os dados de uma atividade.
   */
  async AtualizarAtividade(
    id: string,
    atividadeData: EntradaFormularioAtividade,
  ) {
    const { data, error } = await supabase
      .from('Atividade')
      .update({
        materia_id: atividadeData.materia_id,
        conteudo: atividadeData.conteudo.trim(),
        prazo: atividadeData.prazo || null,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return data as Atividade;
  },

  /**
   * Exclui uma atividade.
   *
   * O banco também exclui os registros de progresso
   * relacionados por meio da chave estrangeira ON DELETE CASCADE.
   */
  async DeletarAtividade(id: string) {
    const { error } = await supabase
      .from('Atividade')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return true;
  },

  /**
   * Pesquisa atividades pelo conteúdo.
   */
  async PesquisaAtividadePorTexto(termo: string) {
    const { data, error } = await supabase
      .from('Atividade')
      .select('*')
      .ilike('conteudo', `%${termo}%`)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return data as Atividade[];
  },
};

export default AtividadeDAO;
