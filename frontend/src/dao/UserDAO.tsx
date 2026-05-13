// src/dao/UserDAO.js
import { supabase } from '../utils/supabaseClient';

const UserDAO = {
  async PesquisaUsuario() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  async findById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data;
  },

  /** 0 or 1 row — no error when missing (unlike `single()`). */
  async findByIdMaybe(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async CadastroUsuario(userData) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async AtualizarUsuario(id, userData) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  async DeletarUsuario(id) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async findByEmail(email) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  /**
   * Alguns projetos mantêm `public.users` em paralelo a `public.profiles`.
   * Se a tabela não existir ou não estiver exposta na API, devolve null (sem throw).
   */
  async findUsersRowMaybe(id) {
    const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
    if (!error) return data;
    const msg = (error.message || '').toLowerCase();
    const code = error.code || '';
    if (
      code === 'PGRST205' ||
      msg.includes('schema cache') ||
      msg.includes('does not exist') ||
      msg.includes('not find the table')
    ) {
      return null;
    }
    throw error;
  },
};

export default UserDAO;
