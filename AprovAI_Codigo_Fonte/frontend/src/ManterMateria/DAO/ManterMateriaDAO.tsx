
import { supabase } from '../../utils/supabaseClient';
import type {
  EntradaFormularioMateria,
  Materia,
  MateriaAluno,
  AlunoDisponivelMateria,
} from '../../classes';

const MateriaDAO = {
  // =====================================================
  // OPERAÇÕES EXISTENTES DE MATÉRIA
  // =====================================================

  async PesquisaMateria() {
    const { data, error } = await supabase
      .from('Materia')
      .select('*')
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data as Materia[];
  },

  async PesquisaMateriaPorId(id: string) {
    const { data, error } = await supabase
      .from('Materia')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data as Materia;
  },

  async CadastroMateria(materiaData: Partial<Materia>) {
    const { data, error } = await supabase
      .from('Materia')
      .insert([materiaData])
      .select()
      .single();

    if (error) throw error;
    return data as Materia;
  },

  async AtualizarMateria(
    id: string,
    materiaData: EntradaFormularioMateria
  ) {
    const { data, error } = await supabase
      .from('Materia')
      .update({
        ...materiaData,
        atualizado_em: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data as Materia;
  },

  async DeletarMateria(id: string) {
    const { error } = await supabase
      .from('Materia')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  async PesquisaMateriaPorTexto(termo: string) {
    const { data, error } = await supabase
      .from('Materia')
      .select('*')
      .ilike('sigla', `%${termo}%`)
      .order('criado_em', { ascending: false });

    if (error) throw error;
    return data as Materia[];
  },

  // =====================================================
  // OPERAÇÕES DE ALUNOS POR MATÉRIA
  // =====================================================

  /**
   * Pesquisa os alunos cadastrados no sistema.
   * Retorna somente usuários com perfil Aluno.
   */
  async PesquisaAlunosDisponiveis() {
    const { data, error } = await supabase
      .from('Usuario')
      .select('id, nome, email, matricula, curso')
      .eq('perfil', 'Aluno')
      .order('nome', { ascending: true });

    if (error) throw error;

    return data as AlunoDisponivelMateria[];
  },

  /**
   * Pesquisa os alunos vinculados a uma matéria.
   */
  async PesquisaAlunosVinculados(materiaId: string) {
    const { data, error } = await supabase
      .from('MateriaAluno')
      .select('id, materia_id, aluno_id, criado_em')
      .eq('materia_id', materiaId)
      .order('criado_em', { ascending: false });

    if (error) throw error;

    return data as MateriaAluno[];
  },

  /**
   * Pesquisa os identificadores dos alunos vinculados
   * a uma matéria.
   */
  async PesquisaIdsAlunosVinculados(materiaId: string) {
    const { data, error } = await supabase
      .from('MateriaAluno')
      .select('aluno_id')
      .eq('materia_id', materiaId);

    if (error) throw error;

    return (data || []).map((item) => item.aluno_id);
  },

  /**
   * Vincula vários alunos a uma matéria.
   * Não duplica associações já existentes.
   */
  async VincularAlunosMateria(
    materiaId: string,
    alunosIds: string[]
  ) {
    if (alunosIds.length === 0) return true;

    const vinculos = alunosIds.map((alunoId) => ({
      materia_id: materiaId,
      aluno_id: alunoId,
    }));

    const { error } = await supabase
      .from('MateriaAluno')
      .upsert(vinculos, {
        onConflict: 'materia_id,aluno_id',
        ignoreDuplicates: true,
      });

    if (error) throw error;

    return true;
  },

  /**
   * Remove um aluno de uma matéria.
   */
  async DesvincularAlunoMateria(
    materiaId: string,
    alunoId: string
  ) {
    const { error } = await supabase
      .from('MateriaAluno')
      .delete()
      .eq('materia_id', materiaId)
      .eq('aluno_id', alunoId);

    if (error) throw error;

    return true;
  },
};

export default MateriaDAO;
