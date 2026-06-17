import { Permissao } from './Permissao';
import { Usuario } from './Usuario';

export class Adm extends Usuario {
  codigo?: number | null;
  telefone?: string;
  dataNascimento?: string;

  constructor(dados: Partial<Adm> & Pick<Usuario, 'id' | 'nome' | 'email'>) {
    super({ ...dados, permissao: Permissao.ADM });
    this.codigo = dados.codigo;
    this.telefone = dados.telefone;
    this.dataNascimento = dados.dataNascimento;
  }
}
