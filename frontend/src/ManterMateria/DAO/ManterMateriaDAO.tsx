import { supabase } from '../../utils/supabaseClient';
import type { EntradaFormularioMateria, Materia } from '../../classes';

const MateriaDAO = {
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

  async AtualizarMateria(id: string, materiaData: EntradaFormularioMateria) {
    const { data, error } = await supabase
      .from('Materia')
      .update({ ...materiaData, atualizado_em: new Date().toISOString() })
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
};

export default MateriaDAO;
