import UsuarioRepository from '../repositories/UsuarioRepository';
import { createHeadlessSupabaseClient } from '../utils/supabaseClient';
import {
  criarUsuario,
  formularioParaPersistencia,
  parsePermissao,
  Permissao,
  type EntradaFormularioUsuario,
  type Usuario,
} from '../classes';

function mergeProfileWithUsersRow(
  profile: Record<string, unknown> | null,
  usersRow: Record<string, unknown> | null,
): Usuario {
  if (!usersRow) return criarUsuario(profile as Record<string, unknown>);
  if (!profile) return criarUsuario(usersRow);
  const rProfile = parsePermissao(String(profile.role ?? profile.permissao));
  const rUsers = parsePermissao(String(usersRow.role));
  const role =
    rProfile === Permissao.ADM || rUsers === Permissao.ADM
      ? Permissao.ADM
      : rProfile || String(usersRow.role || Permissao.Aluno);
  const nome =
    String(profile.name ?? profile.nome ?? '').trim() ||
    String(usersRow.full_name ?? usersRow.name ?? '').trim() ||
    '';
  return criarUsuario({
    ...profile,
    id: profile.id ?? usersRow.id,
    email: profile.email ?? usersRow.email,
    nome,
    role,
    created_at: profile.created_at ?? usersRow.created_at,
    updated_at: profile.updated_at ?? usersRow.updated_at,
  });
}

const UsuarioService = {
  async PesquisaUsuario() {
    const rows = await UsuarioRepository.PesquisaUsuario();
    return rows.map((row) => criarUsuario(row));
  },

  async PesquisaUsuarioPorId(id: string) {
    const row = await UsuarioRepository.PesquisaUsuarioPorId(id);
    return criarUsuario(row);
  },

  async CadastroUsuario(userData: EntradaFormularioUsuario) {
    const { email, senha, nome, permissao } = userData;
    const role = parsePermissao(String(permissao));

    const signupClient = createHeadlessSupabaseClient();
    const { data: authData, error } = await signupClient.auth.signUp({
      email,
      password: senha || '',
      options: {
        data: {
          name: (nome || '').trim(),
          role,
        },
      },
    });
    if (error) throw error;
    if (!authData?.user?.id) {
      throw new Error('Não foi possível criar o utilizador na autenticação.');
    }

    const profile = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(authData.user.id);
    if (profile) return criarUsuario(profile);

    const novo = await UsuarioRepository.CadastroUsuario({
      ...formularioParaPersistencia(userData, authData.user.id),
      created_at: new Date().toISOString(),
    });
    return criarUsuario(novo);
  },

  async AtualizarUsuario(id: string, userData: Partial<EntradaFormularioUsuario>) {
    const payload = formularioParaPersistencia({
      nome: userData.nome || '',
      email: userData.email || '',
      permissao: userData.permissao || Permissao.Aluno,
      matricula: userData.matricula,
      curso: userData.curso,
      formacao: userData.formacao,
      codigo: userData.codigo,
      telefone: userData.telefone,
    });
    const updated = await UsuarioRepository.AtualizarUsuario(id, payload);
    return criarUsuario(updated);
  },

  async DeletarUsuario(id: string) {
    return await UsuarioRepository.DeletarUsuario(id);
  },

  async PesquisaPerfilUsuario(userId: string) {
    const profile = await UsuarioRepository.PesquisaUsuarioPorIdOpcional(userId);
    let usersRow: Record<string, unknown> | null = null;
    try {
      usersRow = await UsuarioRepository.PesquisaRegistroUsersOpcional(userId);
    } catch {
      usersRow = null;
    }
    if (!profile && !usersRow) {
      const row = await UsuarioRepository.PesquisaUsuarioPorId(userId);
      return criarUsuario(row);
    }
    if (!profile) {
      return criarUsuario(usersRow as Record<string, unknown>);
    }
    return mergeProfileWithUsersRow(profile, usersRow);
  },
};

export default UsuarioService;
