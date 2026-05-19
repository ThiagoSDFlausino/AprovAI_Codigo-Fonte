import { supabase } from '../utils/supabaseClient';
import type { EntradaFormularioMetodoEstudo, MetodoEstudo } from '../classes';

const MetodoEstudoDAO = {
  async PesquisaMetodoEstudo() {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MetodoEstudo[];
  },

  async PesquisaMetodoEstudoPorId(id: string) {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as MetodoEstudo;
  },

  async CadastroMetodoEstudo(methodData: Partial<MetodoEstudo>) {
    const { data, error } = await supabase
      .from('study_methods')
      .insert([methodData])
      .select()
      .single();
    if (error) throw error;
    return data as MetodoEstudo;
  },

  async AtualizarMetodoEstudo(id: string, methodData: EntradaFormularioMetodoEstudo) {
    const { data, error } = await supabase
      .from('study_methods')
      .update({ ...methodData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MetodoEstudo;
  },

  async DeletarMetodoEstudo(id: string) {
    const { error } = await supabase
      .from('study_methods')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async PesquisaMetodoEstudoPorCategoria(category: string) {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MetodoEstudo[];
  },

  async PesquisaMetodoEstudoPorTexto(term: string) {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as MetodoEstudo[];
  },
};

export default MetodoEstudoDAO;
