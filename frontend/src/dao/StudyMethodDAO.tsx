// src/dao/StudyMethodDAO.js
import { supabase } from '../utils/supabaseClient';

const StudyMethodDAO = {
  async PesquisaMetodoEstudo() {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async PesquisaMetodoEstudoPorId(id) {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  async CadastroMetodoEstudo(methodData) {
    const { data, error } = await supabase
      .from('study_methods')
      .insert([methodData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async AtualizarMetodoEstudo(id, methodData) {
    const { data, error } = await supabase
      .from('study_methods')
      .update({ ...methodData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async DeletarMetodoEstudo(id) {
    const { error } = await supabase
      .from('study_methods')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async PesquisaMetodoEstudoPorCategoria(category) {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .eq('category', category)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async PesquisaMetodoEstudoPorTexto(term) {
    const { data, error } = await supabase
      .from('study_methods')
      .select('*')
      .or(`name.ilike.%${term}%,description.ilike.%${term}%`)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  }
};

export default StudyMethodDAO;
