/**
 * Status possíveis do progresso de uma atividade.
 */
export enum StatusProgresso {
    NAO_INICIADO = 'NAO_INICIADO',
    ATIVO = 'ATIVO',
    CONCLUIDO = 'CONCLUIDO',
    ATRASADO = 'ATRASADO',
  }
  
  /**
   * Representa o progresso de um aluno em uma atividade.
   */
  export type Progresso = {
    id: string;
    aluno_id: string;
    atividade_id: string;
    status: StatusProgresso;
    nota: number | null;
    data_inicio: string | null;
    data_conclusao: string | null;
    percentual_conclusao: number;
    criado_em?: string;
    atualizado_em?: string;
  };