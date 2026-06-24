import { Perfil } from "../Enum/Perfil";

export type Usuario = {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  funcao: string | null;
  formacao: string | null;
  matricula: number | null;
  curso: string | null;
  criado_em?: string;
  atualizado_em?: string;
};

export type EntradaFormularioUsuario = {
  nome: string;
  email: string;
  senha?: string;
  perfil: Perfil;
  funcao?: string;
  formacao?: string;
  matricula?: string | number | null;
  curso?: string;
};