import React, { useEffect, useState } from 'react';

import {
  BarChart3,
  GraduationCap,
  Users,
  UserRound,
  BookOpen,
  ChevronDown,
  ChevronRight,
  RefreshCw,
  ClipboardList,
  CalendarDays,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { useAuth } from '../../Auth/contexts/AuthContext';
import Navbar from '../../components/Navbar';

import ManterRelatorioProgressoController from '../Controller/ManterRelatorioProgressoController';

import { StatusProgresso } from '../Progresso/Progresso';

import type {
  AlunoProgressoRelatorio,
  AtividadeProgressoRelatorio,
  CursoProgressoRelatorio,
  MateriaProgressoRelatorio,
  RelatorioProgresso,
} from '../Progresso/RelatorioProgresso';

const ManterProgressoPagina = () => {
  const { user, isProfessor, loading: loadingAuth } = useAuth();

  const [relatorio, setRelatorio] = useState<RelatorioProgresso>({
    cursos: [],
    total_alunos: 0,
    total_cursos: 0,
  });

  const [loading, setLoading] = useState(true);
  const [cursosExpandidos, setCursosExpandidos] = useState<string[]>([]);
  const [alunosExpandidos, setAlunosExpandidos] = useState<string[]>([]);
  const [materiasExpandidas, setMateriasExpandidas] = useState<string[]>([]);

  const carregarRelatorio = async () => {
    if (!user?.id || !isProfessor) {
      setRelatorio({
        cursos: [],
        total_alunos: 0,
        total_cursos: 0,
      });
      setLoading(false);
      return;
    }

    setLoading(true);

    try {
      const resultado =
        await ManterRelatorioProgressoController.PesquisaRelatorioProgresso(
          user.id,
        );

      setRelatorio(resultado);
      setCursosExpandidos(resultado.cursos.map((curso) => curso.curso));
      setAlunosExpandidos([]);
      setMateriasExpandidas([]);
    } catch (error) {
      console.error('Erro ao carregar relatório de progresso:', error);

      toast.error('Não foi possível carregar o relatório de progresso.');

      setRelatorio({
        cursos: [],
        total_alunos: 0,
        total_cursos: 0,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!loadingAuth) {
      carregarRelatorio();
    }
  }, [user?.id, isProfessor, loadingAuth]);

  const alternar = (
    valor: string,
    estado: string[],
    atualizar: React.Dispatch<React.SetStateAction<string[]>>,
  ) => {
    atualizar((anteriores) =>
      anteriores.includes(valor)
        ? anteriores.filter((item) => item !== valor)
        : [...anteriores, valor],
    );
  };

  const formatarPercentual = (valor: number) =>
    `${valor.toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    })}%`;

  const obterCorProgresso = (percentual: number) => {
    if (percentual >= 100) return 'var(--success)';
    if (percentual > 0) return 'var(--warning)';
    return 'var(--text-muted)';
  };

  const BarraProgresso = ({ percentual }: { percentual: number }) => {
    const valorSeguro = Math.min(100, Math.max(0, percentual));

    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
        }}
      >
        <div
          style={{
            flex: 1,
            height: 8,
            background: 'var(--border)',
            borderRadius: 10,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${valorSeguro}%`,
              height: '100%',
              background: obterCorProgresso(percentual),
              borderRadius: 10,
              transition: 'width 0.3s',
            }}
          />
        </div>

        <strong
          style={{
            minWidth: 58,
            textAlign: 'right',
            fontSize: 13,
            color: obterCorProgresso(percentual),
          }}
        >
          {formatarPercentual(percentual)}
        </strong>
      </div>
    );
  };

  const obterStatus = (status: StatusProgresso) => {
    switch (status) {
      case StatusProgresso.CONCLUIDO:
        return {
          texto: 'Concluída',
          cor: 'var(--success)',
          fundo: 'rgba(52,211,153,0.12)',
        };

      case StatusProgresso.ATIVO:
        return {
          texto: 'Em andamento',
          cor: 'var(--warning)',
          fundo: 'rgba(251,191,36,0.12)',
        };

      case StatusProgresso.ATRASADO:
        return {
          texto: 'Atrasada',
          cor: 'var(--danger)',
          fundo: 'rgba(248,113,113,0.12)',
        };

      default:
        return {
          texto: 'Não iniciada',
          cor: 'var(--text-muted)',
          fundo: 'var(--background-secondary)',
        };
    }
  };

  const formatarData = (data: string | null) => {
    if (!data) return 'Não informada';

    const dataFormatada = new Date(`${data}T00:00:00`);

    if (Number.isNaN(dataFormatada.getTime())) {
      return data;
    }

    return dataFormatada.toLocaleDateString('pt-BR');
  };

  const CardAtividade = ({
    atividade,
  }: {
    atividade: AtividadeProgressoRelatorio;
  }) => {
    const status = obterStatus(atividade.status);

    return (
      <div
        style={{
          padding: 14,
          border: '1px solid var(--border)',
          borderRadius: 9,
          background: 'var(--background-secondary)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            gap: 12,
            marginBottom: 12,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 9,
              minWidth: 0,
            }}
          >
            <ClipboardList
              size={17}
              color="var(--text-secondary)"
              style={{ flexShrink: 0, marginTop: 2 }}
            />

            <strong
              style={{
                fontSize: 13,
                overflowWrap: 'anywhere',
              }}
            >
              {atividade.conteudo || 'Atividade sem descrição'}
            </strong>
          </div>

          <span
            style={{
              flexShrink: 0,
              padding: '4px 9px',
              borderRadius: 20,
              fontSize: 11,
              fontWeight: 600,
              color: status.cor,
              background: status.fundo,
            }}
          >
            {status.texto}
          </span>
        </div>

        <BarraProgresso
          percentual={atividade.percentual_conclusao}
        />

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            marginTop: 12,
            color: 'var(--text-muted)',
            fontSize: 11,
          }}
        >
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <CalendarDays size={13} />
            Prazo: {formatarData(atividade.prazo)}
          </span>

          {atividade.data_inicio && (
            <span>
              Início: {new Date(atividade.data_inicio).toLocaleDateString('pt-BR')}
            </span>
          )}

          {atividade.data_conclusao && (
            <span>
              Conclusão: {new Date(atividade.data_conclusao).toLocaleDateString('pt-BR')}
            </span>
          )}
        </div>
      </div>
    );
  };

  const CardMateria = ({
    materia,
  }: {
    materia: MateriaProgressoRelatorio;
  }) => {
    const expandida = materiasExpandidas.includes(materia.materia_id);

    return (
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 9,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() =>
            alternar(
              materia.materia_id,
              materiasExpandidas,
              setMateriasExpandidas,
            )
          }
          style={{
            width: '100%',
            padding: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <BookOpen size={16} color="var(--success)" />

          <strong style={{ fontSize: 13, flex: 1 }}>
            {materia.materia_sigla}
          </strong>

          <span
            style={{
              color: 'var(--text-muted)',
              fontSize: 11,
            }}
          >
            {materia.total_atividades} atividade
            {materia.total_atividades !== 1 ? 's' : ''}
          </span>

          <div style={{ width: 115 }}>
            <BarraProgresso percentual={materia.percentual} />
          </div>

          {expandida ? (
            <ChevronDown size={17} color="var(--text-muted)" />
          ) : (
            <ChevronRight size={17} color="var(--text-muted)" />
          )}
        </button>

        {expandida && (
          <div
            style={{
              padding: '0 13px 13px',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            {materia.atividades.length === 0 ? (
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  padding: 8,
                }}
              >
                Esta matéria ainda não possui atividades cadastradas.
              </p>
            ) : (
              materia.atividades.map((atividade) => (
                <CardAtividade
                  key={atividade.atividade_id}
                  atividade={atividade}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const CardAluno = ({
    aluno,
  }: {
    aluno: AlunoProgressoRelatorio;
  }) => {
    const expandido = alunosExpandidos.includes(aluno.aluno_id);

    return (
      <div
        style={{
          border: '1px solid var(--border)',
          borderRadius: 10,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() =>
            alternar(aluno.aluno_id, alunosExpandidos, setAlunosExpandidos)
          }
          style={{
            width: '100%',
            padding: 15,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 9,
              background: 'rgba(52,211,153,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0,
            }}
          >
            <UserRound size={18} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 14 }}>
              {aluno.aluno_nome}
            </strong>

            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: 11,
              }}
            >
              {aluno.materias.length} matéria
              {aluno.materias.length !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ width: 115, flexShrink: 0 }}>
            <BarraProgresso percentual={aluno.percentual} />
          </div>

          {expandido ? (
            <ChevronDown size={18} color="var(--text-muted)" />
          ) : (
            <ChevronRight size={18} color="var(--text-muted)" />
          )}
        </button>

        {expandido && (
          <div
            style={{
              padding: '0 15px 15px 65px',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            {aluno.materias.length === 0 ? (
              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 12,
                }}
              >
                Nenhuma matéria vinculada.
              </p>
            ) : (
              aluno.materias.map((materia) => (
                <CardMateria
                  key={materia.materia_id}
                  materia={materia}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  const CardCurso = ({
    curso,
  }: {
    curso: CursoProgressoRelatorio;
  }) => {
    const expandido = cursosExpandidos.includes(curso.curso);

    return (
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
        }}
      >
        <button
          type="button"
          onClick={() =>
            alternar(curso.curso, cursosExpandidos, setCursosExpandidos)
          }
          style={{
            width: '100%',
            padding: 18,
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            textAlign: 'left',
            background: 'transparent',
            border: 'none',
            color: 'var(--text)',
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 10,
              background: 'rgba(52,211,153,0.12)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--success)',
              flexShrink: 0,
            }}
          >
            <GraduationCap size={20} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <strong style={{ display: 'block', fontSize: 15 }}>
              {curso.curso}
            </strong>

            <span
              style={{
                color: 'var(--text-muted)',
                fontSize: 12,
              }}
            >
              {curso.total_alunos} aluno
              {curso.total_alunos !== 1 ? 's' : ''}
            </span>
          </div>

          <div style={{ width: 150, flexShrink: 0 }}>
            <BarraProgresso percentual={curso.percentual} />
          </div>

          {expandido ? (
            <ChevronDown size={19} color="var(--text-muted)" />
          ) : (
            <ChevronRight size={19} color="var(--text-muted)" />
          )}
        </button>

        {expandido && (
          <div
            style={{
              padding: '0 18px 18px',
              display: 'flex',
              flexDirection: 'column',
              gap: 9,
            }}
          >
            {curso.alunos.map((aluno) => (
              <CardAluno key={aluno.aluno_id} aluno={aluno} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page">
      <Navbar />

      <div className="page-content">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                background: 'rgba(52,211,153,0.12)',
                borderRadius: 10,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--success)',
              }}
            >
              <BarChart3 size={21} />
            </div>

            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>
                Progresso
              </h1>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                }}
              >
                Acompanhe o desempenho dos alunos por curso e matéria
              </p>
            </div>
          </div>

          <button
            type="button"
            className="btn btn-ghost"
            onClick={carregarRelatorio}
            disabled={loading}
          >
            <RefreshCw size={15} />
            Atualizar
          </button>
        </div>

        {!loadingAuth && !isProfessor ? (
          <div className="empty-state">
            <BarChart3 size={42} style={{ opacity: 0.3 }} />
            <p>Esta página está disponível apenas para professores.</p>
          </div>
        ) : loading ? (
          <div className="empty-state">
            <div
              className="spinner"
              style={{ width: 32, height: 32 }}
            />
            <p>Carregando relatório de progresso...</p>
          </div>
        ) : (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))',
                gap: 14,
                marginBottom: 26,
              }}
            >
              <div className="card">
                <GraduationCap size={21} color="var(--success)" />
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  Cursos
                </p>
                <strong style={{ fontSize: 22 }}>
                  {relatorio.total_cursos}
                </strong>
              </div>

              <div className="card">
                <Users size={21} color="var(--success)" />
                <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>
                  Alunos
                </p>
                <strong style={{ fontSize: 22 }}>
                  {relatorio.total_alunos}
                </strong>
              </div>
            </div>

            <div style={{ marginBottom: 15 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600 }}>
                Desempenho por curso
              </h2>

              <p
                style={{
                  color: 'var(--text-muted)',
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                Expanda um curso, selecione um aluno e abra uma matéria para
                visualizar as atividades realizadas.
              </p>
            </div>

            {relatorio.cursos.length === 0 ? (
              <div className="empty-state">
                <Users size={42} style={{ opacity: 0.3 }} />
                <p>
                  Nenhum aluno vinculado às suas matérias foi encontrado.
                </p>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 14,
                }}
              >
                {relatorio.cursos.map((curso) => (
                  <CardCurso key={curso.curso} curso={curso} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ManterProgressoPagina;