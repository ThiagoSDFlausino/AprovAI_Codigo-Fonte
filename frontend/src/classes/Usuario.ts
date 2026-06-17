import { Permissao } from './Permissao';

export type EntradaFormularioUsuario = {
  nome: string;
  email: string;
  senha?: string;
  permissao: Permissao | string;
  matricula?: number | null;
  curso?: string;
  formacao?: string;
  codigo?: number | null;
  telefone?: string;
  dataNascimento?: string;
};

export class Usuario {
  id: string;
  nome: string;
  email: string;
  senha?: string;
  permissao: Permissao;
  created_at?: string;
  updated_at?: string;

  constructor(dados: Partial<Usuario> & Pick<Usuario, 'id' | 'nome' | 'email' | 'permissao'>) {
    this.id = dados.id;
    this.nome = dados.nome;
    this.email = dados.email;
    this.senha = dados.senha;
    this.permissao = dados.permissao;
    this.created_at = dados.created_at;
    this.updated_at = dados.updated_at;
  }
}
