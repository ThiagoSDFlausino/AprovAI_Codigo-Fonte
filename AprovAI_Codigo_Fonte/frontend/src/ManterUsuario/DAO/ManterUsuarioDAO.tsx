import { supabase } from '../../utils/supabaseClient';
import type { Usuario } from '../Usuario/Usuario';

const UsuarioDAO = {
  async PesquisaUsuario() {
    const { data, error } = await supabase
      .from('Usuario')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data as Usuario[];
  },

  async PesquisaUsuarioPorId(id: string) {
    const { data, error } = await supabase
      .from('Usuario')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Usuario;
  },

  async PesquisaUsuarioPorIdOpcional(id: string) {
    const { data, error } = await supabase
      .from('Usuario')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    return data as Usuario | null;
  },

  async CadastroUsuario(userData: Partial<Usuario>) {
    const { senha: _senha, ...dados } = userData;
    const { data, error } = await supabase
      .from('Usuario')
      .insert([dados])
      .select('*')
      .single();
    if (error) throw error;
    return data as Usuario;
  },

  async AtualizarUsuario(id: string, userData: Partial<Usuario>) {
    const { senha: _senha, ...dados } = userData;
    const { data, error } = await supabase
      .from('Usuario')
      .update({ ...dados, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();
    if (error) throw error;
    return data as Usuario;
  },

  async DeletarUsuario(id: string) {
    const { error } = await supabase
      .from('Usuario')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async PesquisaUsuarioPorEmail(email: string) {
    const { data, error } = await supabase
      .from('Usuario')
      .select('*')
      .eq('email', email)
      .maybeSingle();
    if (error) throw error;
    return data as Usuario | null;
  },
};

export default UsuarioDAO;
