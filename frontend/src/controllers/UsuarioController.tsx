import type { Dispatch, SetStateAction } from 'react';
import UsuarioService from '../services/UsuarioService';
import { getSupabaseErrorMessage } from '../utils/supabaseError';
import type { EntradaFormularioUsuario, Usuario } from '../classes';

type ToastLike = {
  error: (message: string) => void;
  success: (message: string) => void;
};

const UsuarioController = {
  async PesquisaUsuario(
    setUsers: Dispatch<SetStateAction<Usuario[]>>,
    setLoading: Dispatch<SetStateAction<boolean>>,
    toast: ToastLike,
  ) {
    setLoading(true);
    try {
      const data = await UsuarioService.PesquisaUsuario();
      setUsers(data);
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  },

  async CadastroUsuario(
    formData: EntradaFormularioUsuario,
    setUsers: Dispatch<SetStateAction<Usuario[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const newUser = await UsuarioService.CadastroUsuario(formData);
      setUsers((prev) => [newUser, ...prev]);
      toast.success('Usuário criado com sucesso!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao criar usuário.');
    }
  },

  async AtualizarUsuario(
    id: string,
    formData: EntradaFormularioUsuario,
    setUsers: Dispatch<SetStateAction<Usuario[]>>,
    closeModal: () => void,
    toast: ToastLike,
  ) {
    try {
      const updated = await UsuarioService.AtualizarUsuario(id, formData);
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      toast.success('Usuário atualizado!');
      closeModal();
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao atualizar usuário.');
    }
  },

  async DeletarUsuario(
    id: string,
    setUsers: Dispatch<SetStateAction<Usuario[]>>,
    toast: ToastLike,
  ) {
    try {
      await UsuarioService.DeletarUsuario(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      toast.success('Usuário removido.');
    } catch (error: unknown) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao remover usuário.');
    }
  },
};

export default UsuarioController;
