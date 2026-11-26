
export type Materia = {
  id: string;
  sigla: string;
  criado_por?: string;
  criado_em?: string;
  atualizado_em?: string;
};

export type FiltrosMateria = {
  busca?: string;
};

export type EntradaFormularioMateria = {
  sigla: string;
};

/**
 * Representa o vínculo entre um aluno e uma matéria.
 * Cada aluno pode estar vinculado a várias matérias.
 */
export type MateriaAluno = {
  id: string;
  materia_id: string;
  aluno_id: string;
  criado_em: string;
};

/**
 * Dados dos alunos disponíveis para vinculação
 * a uma matéria.
 */
export type AlunoDisponivelMateria = {
  id: string;
  nome: string;
  email: string;
  matricula: number | null;
  curso: string | null;
};

/**
 * Dados necessários para vincular um aluno
 * a uma matéria.
 */
export type EntradaVinculoMateria = {
  materia_id: string;
  aluno_id: string;
};
