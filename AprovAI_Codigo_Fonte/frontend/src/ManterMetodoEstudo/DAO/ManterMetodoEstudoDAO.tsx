import { supabase } from '../../utils/supabaseClient';
import type { EntradaFormularioMetodoEstudo, MetodoEstudo } from '../../classes';

const MetodoEstudoDAO = {
  async PesquisaMetodoEstudo() {
    const { data, error } = await supabase
      .from('MetodoEstudo')
      .select('*')
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data as MetodoEstudo[];
  },

  async PesquisaMetodoEstudoPorId(id: string) {
    const { data, error } = await supabase
      .from('MetodoEstudo')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as MetodoEstudo;
  },

  async CadastroMetodoEstudo(methodData: Partial<MetodoEstudo>) {
    const { data, error } = await supabase
      .from('MetodoEstudo')
      .insert([methodData])
      .select()
      .single();
    if (error) throw error;
    return data as MetodoEstudo;
  },

  async AtualizarMetodoEstudo(id: string, methodData: EntradaFormularioMetodoEstudo) {
    const { data, error } = await supabase
      .from('MetodoEstudo')
      .update({ ...methodData, atualizado_em: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as MetodoEstudo;
  },

  async DeletarMetodoEstudo(id: string) {
    const { error } = await supabase
      .from('MetodoEstudo')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },

  async PesquisaMetodoEstudoPorCategoria(categoria: string) {
    const { data, error } = await supabase
      .from('MetodoEstudo')
      .select('*')
      .eq('categoria', categoria)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data as MetodoEstudo[];
  },

  async PesquisaMetodoEstudoPorTexto(termo: string) {
    const { data, error } = await supabase
      .from('MetodoEstudo')
      .select('*')
      .or(`nome.ilike.%${termo}%,descricao.ilike.%${termo}%`)
      .order('criado_em', { ascending: false });
    if (error) throw error;
    return data as MetodoEstudo[];
  },
};

export default MetodoEstudoDAO;
