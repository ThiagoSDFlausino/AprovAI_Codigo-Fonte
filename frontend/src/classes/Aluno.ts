import { Permissao } from './Permissao';
import { Usuario } from './Usuario';

export class Aluno extends Usuario {
  matricula?: number | null;
  curso?: string;

  constructor(dados: Partial<Aluno> & Pick<Usuario, 'id' | 'nome' | 'email'>) {
    super({ ...dados, permissao: Permissao.Aluno });
    this.matricula = dados.matricula;
    this.curso = dados.curso;
  }
}
