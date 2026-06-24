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
