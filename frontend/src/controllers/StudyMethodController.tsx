// src/controllers/StudyMethodController.tsx
import type { Dispatch, SetStateAction } from 'react';
import StudyMethodService from '../services/StudyMethodService';
import { getSupabaseErrorMessage } from '../utils/supabaseError';

/** Matches `PesquisaMetodoEstudo({ search, category })` no service. */
export type StudyMethodFilters = {
  search?: string;
  category?: string;
};

export type StudyMethod = {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes?: number | null;
  benefits?: string[];
  ideal_for?: string;
  created_by?: string;
  created_at?: string;
};

export type StudyMethodFormInput = {
  name: string;
  description: string;
  category: string;
  duration_minutes?: number | null;
  benefits?: string[];
  ideal_for?: string;
};

type ToastLike = {
  error: (message: string) => void;
  success: (message: string) => void;
};

const StudyMethodController = {
  async PesquisaMetodoEstudo(
    filters: StudyMethodFilters,
    setMethods: Dispatch<SetStateAction<StudyMethod[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    toast: ToastLike,
  ) {
    setLoading(true);
    try {
      const data = await StudyMethodService.PesquisaMetodoEstudo(filters);
      setMethods(data as StudyMethod[]);
    } catch {
      toast.error('Erro ao carregar métodos de estudo.');
    } finally {
      setLoading(false);
    }
  },

  async CadastroMetodoEstudo(
    formData: StudyMethodFormInput,
    userId: string,
    setMethods: Dispatch<SetStateAction<StudyMethod[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const newMethod = await StudyMethodService.CadastroMetodoEstudo(formData, userId);
      setMethods((prev: StudyMethod[]) => [newMethod as StudyMethod, ...prev]);
      toast.success('Método criado com sucesso!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao criar método.');
    }
  },

  async AtualizarMetodoEstudo(
    id: string,
    formData: StudyMethodFormInput,
    setMethods: Dispatch<SetStateAction<StudyMethod[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const updated = await StudyMethodService.AtualizarMetodoEstudo(id, formData);
      setMethods((prev: StudyMethod[]) =>
        prev.map((m: StudyMethod) => (m.id === id ? (updated as StudyMethod) : m)),
      );
      toast.success('Método atualizado!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao atualizar método.');
    }
  },

  async DeletarMetodoEstudo(
    id: string,
    setMethods: Dispatch<SetStateAction<StudyMethod[]>>,
    toast: ToastLike,
  ) {
    try {
      await StudyMethodService.DeletarMetodoEstudo(id);
      setMethods((prev: StudyMethod[]) => prev.filter((m: StudyMethod) => m.id !== id));
      toast.success('Método removido.');
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao remover método.');
    }
  },

  getCategories() {
    return StudyMethodService.getCategories();
  },

  getCategoryLabel(value: string) {
    return StudyMethodService.getCategoryLabel(value);
  },
};

export default StudyMethodController;
