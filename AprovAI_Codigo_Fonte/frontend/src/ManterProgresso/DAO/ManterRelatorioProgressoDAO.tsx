import { supabase } from '../../utils/supabaseClient';

import { StatusProgresso } from '../Progresso/Progresso';

import type {
  AlunoProgressoRelatorio,
  AtividadeProgressoRelatorio,
  CursoProgressoRelatorio,
  MateriaProgressoRelatorio,
  RelatorioProgresso,
} from '../Progresso/RelatorioProgresso';

type MateriaRow = {
  id: string;
  sigla: string;
};

type AlunoRow = {
  id: string;
  nome: string;
  curso: string | null;
};

type VinculoRow = {
  materia_id: string;
  aluno_id: string;
};

type AtividadeRow = {
  id: string;
  materia_id: string;
  conteudo: string;
  prazo: string | null;
};

type ProgressoRow = {
  aluno_id: string;
  atividade_id: string;
  status: StatusProgresso;
  percentual_conclusao: number;
  data_inicio: string | null;
  data_conclusao: string | null;
};

const ManterRelatorioProgressoDAO = {
  async PesquisaRelatorioProgresso(
    professorId: string,
  ): Promise<RelatorioProgresso> {
    const { data: materiasData, error: erroMaterias } = await supabase
      .from('Materia')
      .select('id, sigla')
      .eq('criado_por', professorId)
      .order('sigla', { ascending: true });

    if (erroMaterias) throw erroMaterias;

    const materias = (materiasData ?? []) as MateriaRow[];

    if (materias.length === 0) {
      return {
        cursos: [],
        total_alunos: 0,
        total_cursos: 0,
      };
    }

    const materiasIds = materias.map((materia) => materia.id);

    const { data: vinculosData, error: erroVinculos } = await supabase
      .from('MateriaAluno')
      .select('materia_id, aluno_id')
      .in('materia_id', materiasIds);

    if (erroVinculos) throw erroVinculos;

    const vinculos = (vinculosData ?? []) as VinculoRow[];

    if (vinculos.length === 0) {
      return {
        cursos: [],
        total_alunos: 0,
        total_cursos: 0,
      };
    }

    const alunosIds = Array.from(
      new Set(vinculos.map((vinculo) => vinculo.aluno_id)),
    );

    const { data: alunosData, error: erroAlunos } = await supabase
      .from('Usuario')
      .select('id, nome, curso')
      .in('id', alunosIds)
      .eq('perfil', 'Aluno')
      .order('nome', { ascending: true });

    if (erroAlunos) throw erroAlunos;

    const alunos = (alunosData ?? []) as AlunoRow[];

    const alunosValidosIds = new Set(alunos.map((aluno) => aluno.id));

    const vinculosValidos = vinculos.filter((vinculo) =>
      alunosValidosIds.has(vinculo.aluno_id),
    );

    const { data: atividadesData, error: erroAtividades } = await supabase
      .from('Atividade')
      .select('id, materia_id, conteudo, prazo')
      .in('materia_id', materiasIds);

    if (erroAtividades) throw erroAtividades;

    const atividades = (atividadesData ?? []) as AtividadeRow[];

    let progressos: ProgressoRow[] = [];

    if (atividades.length > 0 && alunosIds.length > 0) {
      const atividadesIds = atividades.map((atividade) => atividade.id);

      const { data: progressosData, error: erroProgressos } = await supabase
        .from('Progresso')
        .select(
          'aluno_id, atividade_id, status, percentual_conclusao, data_inicio, data_conclusao',
        )
        .in('atividade_id', atividadesIds)
        .in('aluno_id', alunosIds);

      if (erroProgressos) throw erroProgressos;

      progressos = (progressosData ?? []) as ProgressoRow[];
    }

    const materiasPorId = new Map(
      materias.map((materia) => [materia.id, materia]),
    );

    const atividadesPorMateria = new Map<string, AtividadeRow[]>();

    atividades.forEach((atividade) => {
      const lista = atividadesPorMateria.get(atividade.materia_id) ?? [];

      lista.push(atividade);
      atividadesPorMateria.set(atividade.materia_id, lista);
    });

    const progressoPorAlunoAtividade = new Map<string, ProgressoRow>();

    progressos.forEach((progresso) => {
      progressoPorAlunoAtividade.set(
        `${progresso.aluno_id}:${progresso.atividade_id}`,
        progresso,
      );
    });

    const alunosRelatorio: AlunoProgressoRelatorio[] = alunos.map((aluno) => {
      const materiasDoAluno = vinculosValidos.filter(
        (vinculo) => vinculo.aluno_id === aluno.id,
      );

      const materiasRelatorio: MateriaProgressoRelatorio[] =
        materiasDoAluno.map((vinculo) => {
          const materia = materiasPorId.get(vinculo.materia_id);

          const atividadesDaMateria =
            atividadesPorMateria.get(vinculo.materia_id) ?? [];

          const atividadesRelatorio: AtividadeProgressoRelatorio[] =
            atividadesDaMateria.map((atividade) => {
              const progresso = progressoPorAlunoAtividade.get(
                `${aluno.id}:${atividade.id}`,
              );

              return {
                atividade_id: atividade.id,
                conteudo: atividade.conteudo,
                prazo: atividade.prazo,
                status: progresso?.status ?? StatusProgresso.NAO_INICIADO,
                percentual_conclusao:
                  progresso?.percentual_conclusao ?? 0,
                data_inicio: progresso?.data_inicio ?? null,
                data_conclusao: progresso?.data_conclusao ?? null,
              };
            });

          const percentual =
            atividadesRelatorio.length > 0
              ? atividadesRelatorio.reduce(
                  (soma, atividade) =>
                    soma + atividade.percentual_conclusao,
                  0,
                ) / atividadesRelatorio.length
              : 0;

          return {
            materia_id: vinculo.materia_id,
            materia_sigla: materia?.sigla ?? 'Matéria não identificada',
            percentual: Number(percentual.toFixed(2)),
            total_atividades: atividadesRelatorio.length,
            atividades: atividadesRelatorio,
          };
        });

      const percentualGeral =
        materiasRelatorio.length > 0
          ? materiasRelatorio.reduce(
              (soma, materia) => soma + materia.percentual,
              0,
            ) / materiasRelatorio.length
          : 0;

      return {
        aluno_id: aluno.id,
        aluno_nome: aluno.nome,
        curso: aluno.curso?.trim() || 'Curso não informado',
        percentual: Number(percentualGeral.toFixed(2)),
        materias: materiasRelatorio.sort((a, b) =>
          a.materia_sigla.localeCompare(b.materia_sigla),
        ),
      };
    });

    const alunosPorCurso = new Map<string, AlunoProgressoRelatorio[]>();

    alunosRelatorio.forEach((aluno) => {
      const lista = alunosPorCurso.get(aluno.curso) ?? [];

      lista.push(aluno);
      alunosPorCurso.set(aluno.curso, lista);
    });

    const cursos: CursoProgressoRelatorio[] = Array.from(
      alunosPorCurso.entries(),
    )
      .map(([curso, alunosDoCurso]) => {
        const percentual =
          alunosDoCurso.length > 0
            ? alunosDoCurso.reduce(
                (soma, aluno) => soma + aluno.percentual,
                0,
              ) / alunosDoCurso.length
            : 0;

        return {
          curso,
          percentual: Number(percentual.toFixed(2)),
          total_alunos: alunosDoCurso.length,
          alunos: alunosDoCurso.sort((a, b) =>
            a.aluno_nome.localeCompare(b.aluno_nome),
          ),
        };
      })
      .sort((a, b) => a.curso.localeCompare(b.curso));

    return {
      cursos,
      total_alunos: alunosRelatorio.length,
      total_cursos: cursos.length,
    };
  },
};

export default ManterRelatorioProgressoDAO;