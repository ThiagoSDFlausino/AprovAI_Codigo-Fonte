export type MetodoEstudo = {
  id: string;
  nome: string;
  descricao: string;
  categoria: string;
  duracao?: number | null;
  beneficios?: string[];
  ideal_para?: string;
  criado_por?: string;
  criado_em?: string;
  atualizado_em?: string;
};

export type FiltrosMetodoEstudo = {
  busca?: string;
  categoria?: string;
};

export type EntradaFormularioMetodoEstudo = {
  nome: string;
  descricao: string;
  categoria: string;
  duracao?: number | null;
  beneficios?: string[];
  ideal_para?: string;
};
