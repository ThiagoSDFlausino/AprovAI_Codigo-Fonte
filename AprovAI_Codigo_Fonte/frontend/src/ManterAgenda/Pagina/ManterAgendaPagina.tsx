
import React, { useEffect, useMemo, useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  BookOpen,
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';

import { useAuth } from '../../Auth/contexts/AuthContext';
import Navbar from '../../components/Navbar';
import ManterAgendaController from '../Controller/ManterAgendaController';
import type {
  AgendaAtividade,
  StatusAgenda,
} from '../Agenda/AgendaAtividade';

const diasSemana = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

const meses = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const formatarData = (data: Date): string => {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');

  return `${ano}-${mes}-${dia}`;
};

const converterData = (data: string): Date => {
  const [ano, mes, dia] = data.split('-').map(Number);

  return new Date(ano, mes - 1, dia);
};

const formatarDataCompleta = (data: string): string => {
  return converterData(data).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });
};

const obterEstiloStatus = (status: StatusAgenda) => {
  switch (status) {
    case 'CONCLUIDO':
      return {
        label: 'Concluída',
        cor: 'var(--success)',
        fundo: 'var(--success-bg, rgba(34, 197, 94, 0.10))',
        icon: <CheckCircle2 size={15} />,
      };

    case 'ATRASADO':
      return {
        label: 'Atrasada',
        cor: 'var(--danger)',
        fundo: 'var(--danger-bg, rgba(239, 68, 68, 0.10))',
        icon: <AlertCircle size={15} />,
      };

    case 'ATIVO':
      return {
        label: 'Em andamento',
        cor: 'var(--primary)',
        fundo: 'var(--primary-glow)',
        icon: <Clock size={15} />,
      };

    default:
      return {
        label: 'Pendente',
        cor: 'var(--text-secondary)',
        fundo: 'var(--background)',
        icon: <Circle size={15} />,
      };
  }
};

const ManterAgendaPagina = () => {
  const { user, isAluno } = useAuth();

  const [atividades, setAtividades] = useState<AgendaAtividade[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [mesAtual, setMesAtual] = useState(() => {
    const hoje = new Date();

    return new Date(hoje.getFullYear(), hoje.getMonth(), 1);
  });

  const [dataSelecionada, setDataSelecionada] = useState(
    formatarData(new Date())
  );

  useEffect(() => {
    let ativo = true;

    const carregarAgenda = async () => {
      if (!user?.id) {
        setAtividades([]);
        setCarregando(false);
        return;
      }

      try {
        setCarregando(true);

        const resultado =
          await ManterAgendaController.PesquisaAgendaAluno(user.id);

        if (ativo) {
          setAtividades(resultado);
        }
      } catch (error) {
        console.error('Erro ao carregar agenda:', error);

        if (ativo) {
          toast.error('Não foi possível carregar sua agenda.');
        }
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    };

    carregarAgenda();

    return () => {
      ativo = false;
    };
  }, [user?.id]);

  const atividadesPorData = useMemo(() => {
    const agrupadas = new Map<string, AgendaAtividade[]>();

    atividades.forEach((atividade) => {
      const existentes = agrupadas.get(atividade.prazo) || [];

      agrupadas.set(atividade.prazo, [...existentes, atividade]);
    });

    return agrupadas;
  }, [atividades]);

  const atividadesSelecionadas =
    atividadesPorData.get(dataSelecionada) || [];

  const diasCalendario = useMemo(() => {
    const ano = mesAtual.getFullYear();
    const mes = mesAtual.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    // Ajusta para iniciar a semana na segunda-feira.
    const deslocamento = (primeiroDia.getDay() + 6) % 7;

    const dias: Date[] = [];

    for (let i = 0; i < deslocamento; i++) {
      dias.push(new Date(ano, mes, i - deslocamento + 1));
    }

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      dias.push(new Date(ano, mes, dia));
    }

    while (dias.length % 7 !== 0) {
      const ultimo = dias[dias.length - 1];

      dias.push(
        new Date(
          ultimo.getFullYear(),
          ultimo.getMonth(),
          ultimo.getDate() + 1
        )
      );
    }

    return dias;
  }, [mesAtual]);

  const hoje = formatarData(new Date());

  const mudarMes = (quantidade: number) => {
    setMesAtual(
      (anterior) =>
        new Date(
          anterior.getFullYear(),
          anterior.getMonth() + quantidade,
          1
        )
    );
  };

  const selecionarDia = (data: Date) => {
    setDataSelecionada(formatarData(data));
  };

  const voltarParaHoje = () => {
    const agora = new Date();

    setMesAtual(
      new Date(agora.getFullYear(), agora.getMonth(), 1)
    );

    setDataSelecionada(formatarData(agora));
  };

  const totalConcluidas = atividades.filter(
    (atividade) => atividade.status === 'CONCLUIDO'
  ).length;

  const totalAtrasadas = atividades.filter(
    (atividade) => atividade.status === 'ATRASADO'
  ).length;

  const totalPendentes = atividades.filter(
    (atividade) => atividade.status === 'NAO_INICIADO'
  ).length;

  if (!isAluno) {
    return (
      <>
        <Navbar />

        <div
          style={{
            maxWidth: 1200,
            margin: '40px auto',
            padding: '0 24px',
            color: 'var(--text)',
          }}
        >
          <h2>Acesso não permitido</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            A Agenda está disponível somente para alunos.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <main
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: '32px 24px 48px',
          color: 'var(--text)',
        }}
      >
        {/* Cabeçalho */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: 16,
            marginBottom: 28,
          }}
        >
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                marginBottom: 6,
              }}
            >
              <CalendarDays
                size={25}
                color="var(--primary)"
              />

              <h1
                style={{
                  fontSize: 25,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                Minha Agenda
              </h1>
            </div>

            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 14,
                margin: 0,
              }}
            >
              Acompanhe os prazos das atividades das suas matérias.
            </p>
          </div>

          <button
            onClick={voltarParaHoje}
            style={{
              padding: '9px 16px',
              borderRadius: 8,
              border: '1px solid var(--border)',
              background: 'var(--surface)',
              color: 'var(--text)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Hoje
          </button>
        </div>

        {/* Indicadores */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 16,
            marginBottom: 24,
          }}
        >
          {[
            {
              label: 'Total de atividades',
              valor: atividades.length,
              cor: 'var(--primary)',
              icon: <BookOpen size={20} />,
            },
            {
              label: 'Pendentes',
              valor: totalPendentes,
              cor: 'var(--text-secondary)',
              icon: <Circle size={20} />,
            },
            {
              label: 'Concluídas',
              valor: totalConcluidas,
              cor: 'var(--success)',
              icon: <CheckCircle2 size={20} />,
            },
            {
              label: 'Atrasadas',
              valor: totalAtrasadas,
              cor: 'var(--danger)',
              icon: <AlertCircle size={20} />,
            },
          ].map((item) => (
            <div
              key={item.label}
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 12,
                padding: 18,
                display: 'flex',
                alignItems: 'center',
                gap: 14,
              }}
            >
              <div style={{ color: item.cor }}>
                {item.icon}
              </div>

              <div>
                <div
                  style={{
                    fontSize: 23,
                    fontWeight: 700,
                    lineHeight: 1.2,
                  }}
                >
                  {carregando ? '—' : item.valor}
                </div>

                <div
                  style={{
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    marginTop: 4,
                  }}
                >
                  {item.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Calendário */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.5fr) minmax(280px, 0.9fr)',
            gap: 20,
            alignItems: 'start',
          }}
        >
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              minWidth: 0,
            }}
          >
            {/* Navegação do mês */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 22,
              }}
            >
              <h2
                style={{
                  fontSize: 19,
                  fontWeight: 700,
                  margin: 0,
                }}
              >
                {meses[mesAtual.getMonth()]} de{' '}
                {mesAtual.getFullYear()}
              </h2>

              <div style={{ display: 'flex', gap: 6 }}>
                <button
                  onClick={() => mudarMes(-1)}
                  title="Mês anterior"
                  className="btn-icon"
                >
                  <ChevronLeft size={19} />
                </button>

                <button
                  onClick={() => mudarMes(1)}
                  title="Próximo mês"
                  className="btn-icon"
                >
                  <ChevronRight size={19} />
                </button>
              </div>
            </div>

            {/* Dias da semana */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                marginBottom: 8,
              }}
            >
              {diasSemana.map((dia) => (
                <div
                  key={dia}
                  style={{
                    textAlign: 'center',
                    fontSize: 12,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    padding: '8px 0',
                  }}
                >
                  {dia.slice(0, 3)}
                </div>
              ))}
            </div>

            {/* Dias do calendário */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, minmax(0, 1fr))',
                gap: 5,
              }}
            >
              {diasCalendario.map((dia) => {
                const data = formatarData(dia);
                const mesmoMes =
                  dia.getMonth() === mesAtual.getMonth();

                const selecionado = data === dataSelecionada;
                const ehHoje = data === hoje;

                const atividadesDoDia =
                  atividadesPorData.get(data) || [];

                const temAtrasada = atividadesDoDia.some(
                  (atividade) => atividade.status === 'ATRASADO'
                );

                const temConcluida = atividadesDoDia.some(
                  (atividade) => atividade.status === 'CONCLUIDO'
                );

                return (
                  <button
                    key={data}
                    onClick={() => selecionarDia(dia)}
                    style={{
                      minHeight: 76,
                      padding: '8px 3px',
                      borderRadius: 9,
                      border: selecionado
                        ? '2px solid var(--primary)'
                        : ehHoje
                          ? '1px solid var(--primary)'
                          : '1px solid transparent',
                      background: selecionado
                        ? 'var(--primary-glow)'
                        : 'transparent',
                      color: mesmoMes
                        ? 'var(--text)'
                        : 'var(--text-secondary)',
                      opacity: mesmoMes ? 1 : 0.35,
                      cursor: 'pointer',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'flex-start',
                      gap: 7,
                      fontFamily: 'inherit',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight:
                          selecionado || ehHoje ? 700 : 500,
                      }}
                    >
                      {dia.getDate()}
                    </span>

                    {atividadesDoDia.length > 0 && (
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          gap: 3,
                          flexWrap: 'wrap',
                        }}
                      >
                        {temAtrasada && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'var(--danger)',
                            }}
                          />
                        )}

                        {temConcluida && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'var(--success)',
                            }}
                          />
                        )}

                        {!temAtrasada && !temConcluida && (
                          <span
                            style={{
                              width: 6,
                              height: 6,
                              borderRadius: '50%',
                              background: 'var(--primary)',
                            }}
                          />
                        )}

                        <span
                          style={{
                            fontSize: 10,
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {atividadesDoDia.length}
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legenda */}
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 16,
                marginTop: 20,
                paddingTop: 16,
                borderTop: '1px solid var(--border)',
              }}
            >
              {[
                { cor: 'var(--primary)', texto: 'Com atividades' },
                { cor: 'var(--success)', texto: 'Concluída' },
                { cor: 'var(--danger)', texto: 'Atrasada' },
              ].map((item) => (
                <div
                  key={item.texto}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 11,
                    color: 'var(--text-secondary)',
                  }}
                >
                  <span
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: '50%',
                      background: item.cor,
                    }}
                  />

                  {item.texto}
                </div>
              ))}
            </div>
          </section>

          {/* Atividades do dia selecionado */}
          <section
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 14,
              padding: 20,
              minWidth: 0,
            }}
          >
            <div
              style={{
                marginBottom: 20,
                paddingBottom: 16,
                borderBottom: '1px solid var(--border)',
              }}
            >
              <h2
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  margin: '0 0 6px',
                }}
              >
                Atividades do dia
              </h2>

              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  margin: 0,
                  textTransform: 'capitalize',
                }}
              >
                {formatarDataCompleta(dataSelecionada)}
              </p>
            </div>

            {carregando ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 10,
                  padding: '35px 10px',
                  color: 'var(--text-secondary)',
                }}
              >
                <Loader2
                  size={25}
                  style={{ animation: 'spin 1s linear infinite' }}
                />

                <span style={{ fontSize: 13 }}>
                  Carregando atividades...
                </span>
              </div>
            ) : atividadesSelecionadas.length === 0 ? (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  padding: '30px 12px',
                  color: 'var(--text-secondary)',
                  gap: 10,
                }}
              >
                <CalendarDays size={32} />

                <strong
                  style={{
                    color: 'var(--text)',
                    fontSize: 14,
                  }}
                >
                  Nenhuma atividade neste dia
                </strong>

                <span style={{ fontSize: 12 }}>
                  Selecione outra data para visualizar seus prazos.
                </span>
              </div>
            ) : (
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  maxHeight: 560,
                  overflowY: 'auto',
                  paddingRight: 3,
                }}
              >
                {atividadesSelecionadas.map((atividade) => {
                  const status = obterEstiloStatus(
                    atividade.status
                  );

                  return (
                    <article
                      key={atividade.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                        padding: 14,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'flex-start',
                          gap: 8,
                          marginBottom: 10,
                        }}
                      >
                        <span
                          style={{
                            fontSize: 11,
                            fontWeight: 700,
                            color: 'var(--primary)',
                            background: 'var(--primary-glow)',
                            padding: '5px 8px',
                            borderRadius: 6,
                          }}
                        >
                          {atividade.materia_sigla || 'Matéria'}
                        </span>

                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            fontSize: 11,
                            fontWeight: 600,
                            color: status.cor,
                            background: status.fundo,
                            padding: '5px 8px',
                            borderRadius: 6,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {status.icon}
                          {status.label}
                        </span>
                      </div>

                      <p
                        style={{
                          fontSize: 13,
                          fontWeight: 600,
                          lineHeight: 1.5,
                          margin: '0 0 12px',
                          whiteSpace: 'pre-wrap',
                          overflowWrap: 'anywhere',
                        }}
                      >
                        {atividade.conteudo}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          fontSize: 11,
                          color: 'var(--text-secondary)',
                        }}
                      >
                        <span
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                          }}
                        >
                          <Clock size={13} />
                          Prazo de entrega
                        </span>

                        <strong
                          style={{
                            color: 'var(--text)',
                          }}
                        >
                          {converterData(
                            atividade.prazo
                          ).toLocaleDateString('pt-BR')}
                        </strong>
                      </div>

                      <div
                        style={{
                          marginTop: 12,
                          height: 5,
                          borderRadius: 10,
                          background: 'var(--border)',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                atividade.percentual_conclusao
                              )
                            )}%`,
                            background:
                              atividade.status === 'CONCLUIDO'
                                ? 'var(--success)'
                                : 'var(--primary)',
                            borderRadius: 10,
                            transition: 'width 0.2s',
                          }}
                        />
                      </div>

                      <div
                        style={{
                          textAlign: 'right',
                          fontSize: 10,
                          color: 'var(--text-secondary)',
                          marginTop: 5,
                        }}
                      >
                        {atividade.percentual_conclusao}% concluído
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
};

export default ManterAgendaPagina;
