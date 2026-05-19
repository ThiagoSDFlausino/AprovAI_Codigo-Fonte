import { supabase } from '../utils/supabaseClient';
import type { Usuario } from '../classes';

const UsuarioDAO = {
  async PesquisaUsuario() {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Usuario[];
  },

  async PesquisaUsuarioPorId(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Usuario;
  },

  async PesquisaUsuarioPorIdOpcional(id: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Usuario | null;
  },

  async CadastroUsuario(userData: Partial<Usuario>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([userData])
      .select()
      .single();
    if (error) throw error;
    return data as Usuario;
  },

  async AtualizarUsuario(id: string, userData: Partial<Usuario>) {
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...userData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Usuario;
  },

  async DeletarUsuario(id: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async PesquisaUsuarioPorEmail(email: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data as Usuario | null;
  },

  async PesquisaRegistroUsersOpcional(id: string) {
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

export default UsuarioDAO;
