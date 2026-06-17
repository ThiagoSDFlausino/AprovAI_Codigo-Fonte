export enum Permissao {
  ADM = 'adm',
  Professor = 'professor',
  Aluno = 'aluno',
}

export function parsePermissao(role: string | undefined | null): Permissao {
  const r = String(role || '').trim().toLowerCase();
  if (r === 'adm' || r === 'admin') return Permissao.ADM;
  if (r === 'professor') return Permissao.Professor;
  return Permissao.Aluno;
}

export function permissaoLabel(permissao: Permissao): string {
  switch (permissao) {
    case Permissao.ADM:
      return 'Administrador';
    case Permissao.Professor:
      return 'Professor';
    case Permissao.Aluno:
      return 'Aluno';
    default:
      return 'Aluno';
  }
}
