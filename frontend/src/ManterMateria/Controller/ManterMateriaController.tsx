import type { Dispatch, SetStateAction } from 'react';
import MateriaService from '../Service/ManterMateriaService';
import { getSupabaseErrorMessage } from '../../utils/supabaseError';
import type {
  EntradaFormularioMateria,
  FiltrosMateria,
  Materia,
} from '../../classes';

type ToastLike = {
  error: (message: string) => void;
  success: (message: string) => void;
};

const MateriaController = {
  async PesquisaMateria(
    filters: FiltrosMateria,
    setMaterias: Dispatch<SetStateAction<Materia[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    toast: ToastLike,
  ) {
    setLoading(true);
    try {
      const data = await MateriaService.PesquisaMateria(filters);
      setMaterias(data);
    } catch {
      toast.error('Erro ao carregar matérias.');
    } finally {
      setLoading(false);
    }
  },

  async CadastroMateria(
    formData: EntradaFormularioMateria,
    userId: string,
    setMaterias: Dispatch<SetStateAction<Materia[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const newMateria = await MateriaService.CadastroMateria(formData, userId);
      setMaterias((prev) => [newMateria, ...prev]);
      toast.success('Matéria criada com sucesso!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao criar matéria.');
    }
  },

  async AtualizarMateria(
    id: string,
    formData: EntradaFormularioMateria,
    setMaterias: Dispatch<SetStateAction<Materia[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const updated = await MateriaService.AtualizarMateria(id, formData);
      setMaterias((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast.success('Matéria atualizada!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao atualizar matéria.');
    }
  },

  async DeletarMateria(
    id: string,
    setMaterias: Dispatch<SetStateAction<Materia[]>>,
    toast: ToastLike,
  ) {
    try {
      await MateriaService.DeletarMateria(id);
      setMaterias((prev) => prev.filter((m) => m.id !== id));
      toast.success('Matéria removida.');
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao remover matéria.');
    }
  },
};

export default MateriaController;
