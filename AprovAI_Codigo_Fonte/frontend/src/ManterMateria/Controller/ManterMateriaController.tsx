
import type { Dispatch, SetStateAction } from 'react';

import MateriaService from '../Service/ManterMateriaService';
import { getSupabaseErrorMessage } from '../../utils/supabaseError';

import type {
  EntradaFormularioMateria,
  FiltrosMateria,
  Materia,
  AlunoDisponivelMateria,
} from '../../classes';

type ToastLike = {
  error: (message: string) => void;
  success: (message: string) => void;
};

const MateriaController = {
  // ==========================================
  // OPERAÇÕES EXISTENTES DE MATÉRIA
  // ==========================================

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
      const newMateria = await MateriaService.CadastroMateria(
        formData,
        userId
      );

      setMaterias((prev) => [newMateria, ...prev]);
      toast.success('Matéria criada com sucesso!');
      closeModal();
    } catch (error: unknown) {
      toast.error(
        getSupabaseErrorMessage(error) || 'Erro ao criar matéria.'
      );
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
      const updated = await MateriaService.AtualizarMateria(
        id,
        formData
      );

      setMaterias((prev) =>
        prev.map((m) => (m.id === id ? updated : m))
      );

      toast.success('Matéria atualizada!');
      closeModal();
    } catch (error: unknown) {
      toast.error(
        getSupabaseErrorMessage(error) || 'Erro ao atualizar matéria.'
      );
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
      toast.error(
        getSupabaseErrorMessage(error) || 'Erro ao remover matéria.'
      );
    }
  },

  // ==========================================
  // GERENCIAMENTO DE ALUNOS POR MATÉRIA
  // ==========================================

  /**
   * Carrega os alunos disponíveis para vinculação.
   */
  async PesquisaAlunosDisponiveis(
    setAlunos: Dispatch<SetStateAction<AlunoDisponivelMateria[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    toast: ToastLike,
  ) {
    setLoading(true);

    try {
      const alunos = await MateriaService.PesquisaAlunosDisponiveis();
      setAlunos(alunos);
    } catch (error: unknown) {
      toast.error(
        getSupabaseErrorMessage(error) ||
        'Erro ao carregar alunos.'
      );
    } finally {
      setLoading(false);
    }
  },

  /**
   * Carrega os IDs dos alunos vinculados a uma matéria.
   */
  async PesquisaIdsAlunosVinculados(
    materiaId: string,
    setAlunosSelecionados: Dispatch<SetStateAction<string[]>>,
    toast: ToastLike,
  ) {
    try {
      const ids = await MateriaService.PesquisaIdsAlunosVinculados(
        materiaId
      );

      setAlunosSelecionados(ids);
    } catch (error: unknown) {
      toast.error(
        getSupabaseErrorMessage(error) ||
        'Erro ao carregar alunos vinculados.'
      );
    }
  },

  /**
   * Vincula os alunos selecionados a uma matéria.
   */
  async VincularAlunosMateria(
    materiaId: string,
    alunosIds: string[],
    toast: ToastLike,
  ) {
    try {
      await MateriaService.VincularAlunosMateria(
        materiaId,
        alunosIds
      );

      toast.success('Alunos vinculados à matéria com sucesso!');
      return true;
    } catch (error: unknown) {
      toast.error(
        getSupabaseErrorMessage(error) ||
        'Erro ao vincular alunos à matéria.'
      );

      return false;
    }
  },

  /**
   * Remove um aluno de uma matéria.
   */
  async DesvincularAlunoMateria(
    materiaId: string,
    alunoId: string,
    toast: ToastLike,
  ) {
    try {
      await MateriaService.DesvincularAlunoMateria(
        materiaId,
        alunoId
      );

      toast.success('Aluno removido da matéria!');
      return true;
    } catch (error: unknown) {
      toast.error(
        getSupabaseErrorMessage(error) ||
        'Erro ao remover aluno da matéria.'
      );

      return false;
    }
  },
};

export default MateriaController;
