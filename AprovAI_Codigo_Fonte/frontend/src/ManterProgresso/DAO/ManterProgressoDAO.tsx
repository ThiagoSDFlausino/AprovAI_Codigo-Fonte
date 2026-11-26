
import { supabase } from '../../utils/supabaseClient';
import {
  StatusProgresso,
  type Progresso,
} from '../Progresso/Progresso';

export type ProgressoComAluno = Progresso & {
  aluno_nome?: string;
};

/**
 * Camada DAO de progresso.
 * Responsável pelas operações de acesso à tabela Progresso no Supabase.
 */
const ManterProgressoDAO = {
  /**
   * Pesquisa todos os registros de progresso.
   */
  async PesquisaProgresso(): Promise<Progresso[]> {
    const { data, error } = await supabase
      .from('Progresso')
      .select('*');

    if (error) throw error;

    return (data ?? []) as Progresso[];
  },

  /**
   * Pesquisa os progressos de um aluno.
   */
  async PesquisaProgressoPorAluno(
    alunoId: string,
  ): Promise<Progresso[]> {
    const { data, error } = await supabase
      .from('Progresso')
      .select('*')
      .eq('aluno_id', alunoId);

    if (error) throw error;

    return (data ?? []) as Progresso[];
  },

  /**
   * Pesquisa os progressos de uma atividade e seus respectivos alunos.
   */
  async PesquisaProgressoPorAtividade(
    atividadeId: string,
  ): Promise<ProgressoComAluno[]> {
    const { data, error } = await supabase
      .from('Progresso')
      .select('*')
      .eq('atividade_id', atividadeId);

    if (error) throw error;

    const progressos = (data ?? []) as Progresso[];

    if (progressos.length === 0) {
      return [];
    }

    const alunosIds = Array.from(
      new Set(progressos.map((progresso) => progresso.aluno_id)),
    );

    const { data: alunos, error: erroAlunos } = await supabase
      .from('Usuario')
      .select('id, nome')
      .in('id', alunosIds);

    if (erroAlunos) throw erroAlunos;

    const nomesAlunos = new Map(
      (alunos ?? []).map((aluno) => [aluno.id, aluno.nome]),
    );

    return progressos.map((progresso) => ({
      ...progresso,
      aluno_nome:
        nomesAlunos.get(progresso.aluno_id) ?? 'Aluno não identificado',
    }));
  },

  /**
   * Pesquisa o progresso de um aluno em uma atividade específica.
   */
  async PesquisaProgressoPorAlunoEAtividade(
    alunoId: string,
    atividadeId: string,
  ): Promise<Progresso | null> {
    const { data, error } = await supabase
      .from('Progresso')
      .select('*')
      .eq('aluno_id', alunoId)
      .eq('atividade_id', atividadeId)
      .maybeSingle();

    if (error) throw error;

    return data as Progresso | null;
  },

  /**
   * Inicia uma atividade para determinado aluno.
   * Transição permitida: NAO_INICIADO -> ATIVO.
   */
  async IniciarAtividade(
    alunoId: string,
    atividadeId: string,
  ): Promise<Progresso> {
    const { data, error } = await supabase
      .from('Progresso')
      .update({
        status: StatusProgresso.ATIVO,
      })
      .eq('aluno_id', alunoId)
      .eq('atividade_id', atividadeId)
      .eq('status', StatusProgresso.NAO_INICIADO)
      .select('*')
      .single();

    if (error) throw error;

    return data as Progresso;
  },

  /**
   * Finaliza uma atividade para determinado aluno.
   * Transição permitida: ATIVO -> CONCLUIDO.
   */
  async FinalizarAtividade(
    alunoId: string,
    atividadeId: string,
  ): Promise<Progresso> {
    const { data, error } = await supabase
      .from('Progresso')
      .update({
        status: StatusProgresso.CONCLUIDO,
      })
      .eq('aluno_id', alunoId)
      .eq('atividade_id', atividadeId)
      .eq('status', StatusProgresso.ATIVO)
      .select('*')
      .single();

    if (error) throw error;

    return data as Progresso;
  },
};

export default ManterProgressoDAO;
