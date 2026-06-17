export type Materia = {
  id: string;
  sigla: string;
  nome?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type EntradaFormularioMateria = {
  sigla: string;
  nome?: string;
};
