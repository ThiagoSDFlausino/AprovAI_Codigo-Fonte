import { Adm } from './Adm';
import { Aluno } from './Aluno';
import { Permissao, parsePermissao } from './Permissao';
import { Professor } from './Professor';
import { Usuario, type EntradaFormularioUsuario } from './Usuario';
export function criarUsuario(row: Record<string, unknown>): Usuario {
  const permissao = parsePermissao(String(row.permissao ?? row.role ?? ''));
  const email = String(row.email ?? '');
  const base = {
    id: String(row.id),
    nome: String(row.nome ?? row.name ?? '').trim() || email.split('@')[0] || '',
    email,
    permissao,
    created_at: row.created_at as string | undefined,
    updated_at: row.updated_at as string | undefined,
  };

  switch (permissao) {
    case Permissao.ADM:
      return new Adm({
        ...base,
        codigo: row.codigo as number | null | undefined,
        telefone: row.telefone as string | undefined,
      });
    case Permissao.Professor:
      return new Professor({
        ...base,
        formacao: row.formacao as string | undefined,
      });
    default:
      return new Aluno({
        ...base,
        matricula: row.matricula as number | null | undefined,
        curso: row.curso as string | undefined,
      });
  }
}

export function formularioParaPersistencia(
  userData: EntradaFormularioUsuario,
  id?: string,
): Record<string, unknown> {
  const permissao = parsePermissao(String(userData.permissao));
  const payload: Record<string, unknown> = {
    name: (userData.nome || '').trim(),
    email: userData.email,
    role: permissao,
  };
  if (id) payload.id = id;

  switch (permissao) {
    case Permissao.ADM:
      if (userData.codigo != null) payload.codigo = userData.codigo;
      if (userData.telefone) payload.telefone = userData.telefone;
      break;
    case Permissao.Professor:
      payload.formacao = userData.formacao ?? '';
      break;
    case Permissao.Aluno:
    default:
      if (userData.matricula != null) payload.matricula = userData.matricula;
      payload.curso = userData.curso ?? '';
      break;
  }

  return payload;
}

export function usuarioParaFormulario(user: Usuario): EntradaFormularioUsuario {
  const form: EntradaFormularioUsuario = {
    nome: user.nome || '',
    email: user.email || '',
    permissao: user.permissao,
    matricula: null,
    curso: '',
    formacao: '',
    codigo: null,
    telefone: '',
  };

  switch (user.permissao) {
    case Permissao.ADM: {
      const adm = user as Adm;
      form.codigo = adm.codigo ?? null;
      form.telefone = adm.telefone ?? '';
      break;
    }
    case Permissao.Professor:
      form.formacao = (user as Professor).formacao ?? '';
      break;
    case Permissao.Aluno:
    default: {
      const aluno = user as Aluno;
      form.matricula = aluno.matricula ?? null;
      form.curso = aluno.curso ?? '';
      break;
    }
  }

  return form;
}
