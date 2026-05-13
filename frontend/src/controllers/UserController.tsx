// src/controllers/UserController.js
import UserService from '../services/UserService';
import { getSupabaseErrorMessage } from '../utils/supabaseError';

const UserController = {
  async PesquisaUsuario(setUsers, setLoading, toast) {
    setLoading(true);
    try {
      const data = await UserService.PesquisaUsuario();
      setUsers(data);
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao carregar usuários.');
    } finally {
      setLoading(false);
    }
  },

  async CadastroUsuario(formData, setUsers, closeModal, toast) {
    try {
      const newUser = await UserService.CadastroUsuario(formData);
      setUsers(prev => [newUser, ...prev]);
      toast.success('Usuário criado com sucesso!');
      closeModal();
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao criar usuário.');
    }
  },

  async AtualizarUsuario(id, formData, setUsers, closeModal, toast) {
    try {
      const updated = await UserService.AtualizarUsuario(id, formData);
      setUsers(prev => prev.map(u => (u.id === id ? updated : u)));
      toast.success('Usuário atualizado!');
      closeModal();
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao atualizar usuário.');
    }
  },

  async DeletarUsuario(id, setUsers, toast) {
    try {
      await UserService.DeletarUsuario(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      toast.success('Usuário removido.');
    } catch (error) {
      toast.error(getSupabaseErrorMessage(error) || 'Erro ao remover usuário.');
    }
  }
};

export default UserController;
