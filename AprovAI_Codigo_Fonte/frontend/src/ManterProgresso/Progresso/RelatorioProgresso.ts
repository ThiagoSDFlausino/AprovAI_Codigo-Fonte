import { StatusProgresso } from './Progresso';

export type AtividadeProgressoRelatorio = {
  atividade_id: string;
  conteudo: string;
  prazo: string | null;
  status: StatusProgresso;
  percentual_conclusao: number;
  data_inicio: string | null;
  data_conclusao: string | null;
};

export type MateriaProgressoRelatorio = {
  materia_id: string;
  materia_sigla: string;
  percentual: number;
  total_atividades: number;
  atividades: AtividadeProgressoRelatorio[];
};

export type AlunoProgressoRelatorio = {
  aluno_id: string;
  aluno_nome: string;
  curso: string;
  percentual: number;
  materias: MateriaProgressoRelatorio[];
};

export type CursoProgressoRelatorio = {
  curso: string;
  percentual: number;
  total_alunos: number;
  alunos: AlunoProgressoRelatorio[];
};

export type RelatorioProgresso = {
  cursos: CursoProgressoRelatorio[];
  total_alunos: number;
  total_cursos: number;
};