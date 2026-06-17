import { Permissao } from './Permissao';
import { Usuario } from './Usuario';

export class Professor extends Usuario {
  formacao?: string;

  constructor(dados: Partial<Professor> & Pick<Usuario, 'id' | 'nome' | 'email'>) {
    super({ ...dados, permissao: Permissao.Professor });
    this.formacao = dados.formacao;
  }
}
