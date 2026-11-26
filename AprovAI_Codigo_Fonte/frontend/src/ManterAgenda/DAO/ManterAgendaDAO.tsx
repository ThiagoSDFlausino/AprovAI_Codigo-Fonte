
import { supabase } from '../../utils/supabaseClient';
import type { AgendaAtividade, StatusAgenda } from '../Agenda/AgendaAtividade';

const ManterAgendaDAO = {
  /**
   * Pesquisa as atividades das matérias vinculadas ao aluno.
   * Retorna também o progresso individual de cada atividade.
   */
  async PesquisaAgendaAluno(alunoId: string): Promise<AgendaAtividade[]> {
    const { data: vinculos, error: erroVinculos } = await supabase
      .from('MateriaAluno')
      .select('materia_id')
      .eq('aluno_id', alunoId);

    if (erroVinculos) {
      throw erroVinculos;
    }

    const materiasIds = Array.from(
      new Set(
        (vinculos || [])
          .map((vinculo) => vinculo.materia_id)
          .filter(
            (materiaId): materiaId is string =>
              typeof materiaId === 'string' && materiaId.trim() !== ''
          )
      ),
    );

    if (materiasIds.length === 0) {
      return [];
    }

    const { data: materias, error: erroMaterias } = await supabase
      .from('Materia')
      .select('id, sigla')
      .in('id', materiasIds);

    if (erroMaterias) {
      throw erroMaterias;
    }

    const materiasMap = new Map(
      (materias || []).map((materia) => [materia.id, materia.sigla])
    );

    const { data: atividades, error: erroAtividades } = await supabase
      .from('Atividade')
      .select('id, materia_id, conteudo, prazo')
      .in('materia_id', materiasIds)
      .not('prazo', 'is', null)
      .order('prazo', { ascending: true });

    if (erroAtividades) {
      throw erroAtividades;
    }

    if (!atividades || atividades.length === 0) {
      return [];
    }

    const atividadesIds = atividades.map((atividade) => atividade.id);

    const { data: progressos, error: erroProgressos } = await supabase
      .from('Progresso')
      .select('atividade_id, status, percentual_conclusao')
      .eq('aluno_id', alunoId)
      .in('atividade_id', atividadesIds);

    if (erroProgressos) {
      throw erroProgressos;
    }

    const progressosMap = new Map(
      (progressos || []).map((progresso) => [
        progresso.atividade_id,
        progresso,
      ])
    );

    const hoje = new Date();
    const hojeFormatado = [
      hoje.getFullYear(),
      String(hoje.getMonth() + 1).padStart(2, '0'),
      String(hoje.getDate()).padStart(2, '0'),
    ].join('-');

    return atividades.map((atividade) => {
      const progresso = progressosMap.get(atividade.id);

      const statusSalvo = (progresso?.status ||
        'NAO_INICIADO') as StatusAgenda;

      let status: StatusAgenda = statusSalvo;

      if (statusSalvo === 'CONCLUIDO') {
        status = 'CONCLUIDO';
      } else if (atividade.prazo < hojeFormatado) {
        status = 'ATRASADO';
      } else if (statusSalvo === 'ATIVO') {
        status = 'ATIVO';
      } else {
        status = 'NAO_INICIADO';
      }

      return {
        id: atividade.id,
        atividade_id: atividade.id,
        materia_id: atividade.materia_id,
        materia_sigla: materiasMap.get(atividade.materia_id) || '',
        conteudo: atividade.conteudo,
        prazo: atividade.prazo,
        status,
        percentual_conclusao: progresso?.percentual_conclusao ?? 0,
      };
    });
  },
};

export default ManterAgendaDAO;
