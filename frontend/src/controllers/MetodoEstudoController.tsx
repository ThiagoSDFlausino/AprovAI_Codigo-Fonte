import type { Dispatch, SetStateAction } from 'react';
import MetodoEstudoService from '../services/MetodoEstudoService';
import { getSupabaseErrorMessage } from '../utils/supabaseError';
import type {
  EntradaFormularioMetodoEstudo,
  FiltrosMetodoEstudo,
  MetodoEstudo,
} from '../classes';

type ToastLike = {
  error: (message: string) => void;
  success: (message: string) => void;
};

const MetodoEstudoController = {
  async PesquisaMetodoEstudo(
    filters: FiltrosMetodoEstudo,
    setMethods: Dispatch<SetStateAction<MetodoEstudo[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    toast: ToastLike,
  ) {
    setLoading(true);
    try {
      const data = await MetodoEstudoService.PesquisaMetodoEstudo(filters);
      setMethods(data);
    } catch {
      toast.error('Erro ao carregar métodos de estudo.');
    } finally {
      setLoading(false);
    }
  },

  async CadastroMetodoEstudo(
    formData: EntradaFormularioMetodoEstudo,
    userId: string,
    setMethods: Dispatch<SetStateAction<MetodoEstudo[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const newMethod = await MetodoEstudoService.CadastroMetodoEstudo(formData, userId);
      setMethods((prev) => [newMethod, ...prev]);
      toast.success('Método criado com sucesso!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao criar método.');
    }
  },

  async AtualizarMetodoEstudo(
    id: string,
    formData: EntradaFormularioMetodoEstudo,
    setMethods: Dispatch<SetStateAction<MetodoEstudo[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const updated = await MetodoEstudoService.AtualizarMetodoEstudo(id, formData);
      setMethods((prev) => prev.map((m) => (m.id === id ? updated : m)));
      toast.success('Método atualizado!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao atualizar método.');
    }
  },

  async DeletarMetodoEstudo(
    id: string,
    setMethods: Dispatch<SetStateAction<MetodoEstudo[]>>,
    toast: ToastLike,
  ) {
    try {
      await MetodoEstudoService.DeletarMetodoEstudo(id);
      setMethods((prev) => prev.filter((m) => m.id !== id));
      toast.success('Método removido.');
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao remover método.');
    }
  },

  getCategories() {
    return MetodoEstudoService.getCategories();
  },

  getCategoryLabel(value: string) {
    return MetodoEstudoService.getCategoryLabel(value);
  },
};

export default MetodoEstudoController;
