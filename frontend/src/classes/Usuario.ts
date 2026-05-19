export type Usuario = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'standard' | string;
  created_at?: string;
  updated_at?: string;
};

export type EntradaFormularioUsuario = {
  name: string;
  email: string;
  password?: string;
  role: string;
};
