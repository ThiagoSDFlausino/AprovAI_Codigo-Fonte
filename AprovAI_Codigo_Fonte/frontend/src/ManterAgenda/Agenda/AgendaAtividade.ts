
export type StatusAgenda =
  | 'NAO_INICIADO'
  | 'ATIVO'
  | 'CONCLUIDO'
  | 'ATRASADO';

export interface AgendaAtividade {
  id: string;
  atividade_id: string;
  materia_id: string;
  materia_sigla: string;
  conteudo: string;
  prazo: string;
  status: StatusAgenda;
  percentual_conclusao: number;
}
