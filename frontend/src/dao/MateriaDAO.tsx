import { supabase } from '../utils/supabaseClient';
import type { EntradaFormularioMateria, Materia } from '../classes';

const MateriaDAO = {
  async PesquisaMateria() {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Materia[];
  },

  async PesquisaMateriaPorId(id: string) {
    const { data, error } = await supabase
      .from('materias')
      .select('*')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Materia;
  },

  async CadastroMateria(materiaData: Partial<Materia>) {
    const { data, error } = await supabase
      .from('materias')
      .insert([materiaData])
      .select()
      .single();
    if (error) throw error;
    return data as Materia;
  },

  async AtualizarMateria(id: string, materiaData: EntradaFormularioMateria) {
    const { data, error } = await supabase
      .from('materias')
      .update({ ...materiaData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Materia;
  },

  async DeletarMateria(id: string) {
    const { error } = await supabase
      .from('materias')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default MateriaDAO;
