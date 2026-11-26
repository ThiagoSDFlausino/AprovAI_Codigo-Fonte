
/**
 * Representa uma atividade cadastrada em uma matéria.
 */
export type Atividade = {
    id: string;
    materia_id: string;
    conteudo: string;
    prazo: string;
  };
  
  /**
   * Filtros utilizados na pesquisa de atividades.
   */
  export type FiltrosAtividade = {
    busca?: string;
    materia_id?: string;
  };
  
  /**
   * Dados necessários para cadastrar ou atualizar uma atividade.
   */
  export type EntradaFormularioAtividade = {
    materia_id: string;
    conteudo: string;
    prazo: string;
  };
  