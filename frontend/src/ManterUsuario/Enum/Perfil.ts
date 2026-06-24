import { EntradaFormularioUsuario, Usuario } from "../Usuario/Usuario";

export enum Perfil {
    Adm = 'Adm',
    Professor = 'Professor',
    Aluno = 'Aluno',
  }
  
  export function normalizarPerfil(perfil: unknown): Perfil {
    const valor = String(perfil || '')
      .trim()
      .toLowerCase();
  
    if (valor === 'admin' || valor === 'adm') return Perfil.Adm;
    if (valor === 'professor') return Perfil.Professor;
    if (valor === 'aluno' || valor === 'standard') return Perfil.Aluno;
    return Perfil.Aluno;
  }
  
  function parseMatricula(valor: unknown): number | null {
    if (valor === null || valor === undefined || valor === '') return null;
    const numero = typeof valor === 'number' ? valor : Number(String(valor).trim());
    return Number.isFinite(numero) ? numero : null;
  }
  
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