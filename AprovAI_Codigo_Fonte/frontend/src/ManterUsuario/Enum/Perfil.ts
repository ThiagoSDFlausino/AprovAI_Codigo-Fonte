
import type {
  EntradaFormularioUsuario,
  Usuario,
} from '../Usuario/Usuario';

export enum Perfil {
  Adm = 'Adm',
  Professor = 'Professor',
  Aluno = 'Aluno',
}

/**
 * Normaliza os diferentes nomes utilizados para identificar
 * os perfis dos usuários no sistema.
 */
export function normalizarPerfil(perfil: unknown): Perfil {
  const valor = String(perfil || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (
    valor === 'admin' ||
    valor === 'adm' ||
    valor === 'administrador' ||
    valor === 'administradora'
  ) {
    return Perfil.Adm;
  }

  if (valor === 'professor' || valor === 'professora') {
    return Perfil.Professor;
  }

  if (valor === 'aluno' || valor === 'aluna' || valor === 'standard') {
    return Perfil.Aluno;
  }

  return Perfil.Aluno;
}

function parseMatricula(valor: unknown): number | null {
  if (valor === null || valor === undefined || valor === '') {
    return null;
  }

  const numero =
    typeof valor === 'number'
      ? valor
      : Number(String(valor).trim());

  return Number.isFinite(numero) ? numero : null;
}

/**
 * Retorna somente os campos específicos do perfil selecionado.
 */
export function aplicarCamposPorPerfil(
  entrada: Pick<
    EntradaFormularioUsuario,
    'perfil' | 'funcao' | 'formacao' | 'matricula' | 'curso'
  >,
): Pick<Usuario, 'funcao' | 'formacao' | 'matricula' | 'curso'> {
  const perfil = normalizarPerfil(entrada.perfil);

  switch (perfil) {
    case Perfil.Adm:
      return {
        funcao: entrada.funcao?.trim() || null,
        formacao: null,
        matricula: null,
        curso: null,
      };

    case Perfil.Professor:
      return {
        funcao: null,
        formacao: entrada.formacao?.trim() || null,
        matricula: null,
        curso: null,
      };

    case Perfil.Aluno:
      return {
        funcao: null,
        formacao: null,
        matricula: parseMatricula(entrada.matricula),
        curso: entrada.curso?.trim() || null,
      };
  }
}
