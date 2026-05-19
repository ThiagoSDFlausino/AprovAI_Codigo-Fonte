export type MetodoEstudo = {
  id: string;
  name: string;
  description: string;
  category: string;
  duration_minutes?: number | null;
  benefits?: string[];
  ideal_for?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
};

export type FiltrosMetodoEstudo = {
  search?: string;
  category?: string;
};

export type EntradaFormularioMetodoEstudo = {
  name: string;
  description: string;
  category: string;
  duration_minutes?: number | null;
  benefits?: string[];
  ideal_for?: string;
};
