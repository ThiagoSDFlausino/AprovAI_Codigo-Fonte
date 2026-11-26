
import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  type Dispatch,
  type SetStateAction,
} from 'react';

import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Search,
  Users,
  UserRound,
  X,
  Check,
  ArrowLeft,
  ClipboardList,
  CalendarDays,
  BookOpen,
  CheckCircle2,
  Clock3,
  Circle,
} from 'lucide-react';

import toast from 'react-hot-toast';

import { useAuth } from '../../Auth/contexts/AuthContext';
import MateriaController from '../Controller/ManterMateriaController';
import AtividadeController from '../../ManterAtividade/Controller/ManterAtividadeController';
import ProgressoController from '../../ManterProgresso/Controller/ManterProgressoController';

import type {
  Materia,
  AlunoDisponivelMateria,
  Atividade,
  EntradaFormularioAtividade,
} from '../../classes';

import {
  StatusProgresso,
  type Progresso,
} from '../../classes';

import ManterMateriaModal from './ManterMateriaModal';
import ManterAtividadePaginaModal from '../../ManterAtividade/Pagina/ManterAtividadePaginaModal';

import Navbar from '../../components/Navbar';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; materia: Materia }
  | null;

type ToastLike = {
  error: (message: string) => void;
  success: (message: string) => void;
};

type ProgressoComAluno = Progresso & {
  aluno_nome?: string;
};

type MateriaCardProps = {
  materia: Materia;
  isProfessor: boolean;
  onOpen: (materia: Materia) => void;
  onEdit: (materia: Materia) => void;
  onDelete: (materia: Materia) => void;
  onManageStudents: (materia: Materia) => void;
};

const MateriaCard = ({
  materia,
  isProfessor,
  onOpen,
  onEdit,
  onDelete,
  onManageStudents,
}: MateriaCardProps) => (
  <div
    className="card"
    role="button"
    tabIndex={0}
    onClick={() => onOpen(materia)}
    onKeyDown={(event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        onOpen(materia);
      }
    }}
    style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
      cursor: 'pointer',
      transition: 'transform 0.2s, border-color 0.2s',
    }}
  >
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        minWidth: 0,
        flex: 1,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          background: 'rgba(52,211,153,0.12)',
          borderRadius: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--success)',
          fontWeight: 700,
          fontSize: 13,
          flexShrink: 0,
        }}
      >
        {materia.sigla.slice(0, 3)}
      </div>

      <div style={{ minWidth: 0 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>
          {materia.sigla}
        </h3>

        {materia.criado_em && (
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: 12,
              marginTop: 2,
            }}
          >
            Cadastrada em{' '}
            {new Date(materia.criado_em).toLocaleDateString('pt-BR')}
          </p>
        )}

        <p
          style={{
            color: 'var(--success)',
            fontSize: 12,
            marginTop: 5,
          }}
        >
          Abrir matéria →
        </p>
      </div>
    </div>

    {isProfessor && (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          flexShrink: 0,
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="btn-icon"
          onClick={() => onManageStudents(materia)}
          title="Gerenciar alunos"
        >
          <Users size={16} />
        </button>

        <button
          type="button"
          className="btn-icon"
          onClick={() => onEdit(materia)}
          title="Editar matéria"
        >
          <Pencil size={15} />
        </button>

        <button
          type="button"
          className="btn-icon danger"
          onClick={() => onDelete(materia)}
          title="Excluir matéria"
        >
          <Trash2 size={15} />
        </button>
      </div>
    )}
  </div>
);

const ManterMateriaPagina = () => {
  const { isProfessor, user } = useAuth();

  // Impede que consultas de uma sessão anterior sobrescrevam a lista atual.
  const requisicaoMateriasRef = useRef(0);

  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [modal, setModal] = useState<ModalState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Materia | null>(null);

  const [materiaSelecionada, setMateriaSelecionada] =
    useState<Materia | null>(null);

  const [atividades, setAtividades] = useState<Atividade[]>([]);
  const [loadingAtividades, setLoadingAtividades] = useState(false);

  const [progressosPorAtividade, setProgressosPorAtividade] =
    useState<Record<string, ProgressoComAluno[]>>({});

  const [loadingProgressos, setLoadingProgressos] = useState(false);
  const [finalizandoAtividade, setFinalizandoAtividade] =
    useState<string | null>(null);

  const [atividadeModalAberto, setAtividadeModalAberto] = useState(false);
  const [atividadeEditando, setAtividadeEditando] =
    useState<Atividade | null>(null);
  const [salvandoAtividade, setSalvandoAtividade] = useState(false);
  const [atividadeExcluir, setAtividadeExcluir] =
    useState<Atividade | null>(null);
  const [excluindoAtividade, setExcluindoAtividade] = useState(false);

  const [materiaGerenciada, setMateriaGerenciada] =
    useState<Materia | null>(null);

  const [alunos, setAlunos] = useState<AlunoDisponivelMateria[]>([]);
  const [alunosSelecionados, setAlunosSelecionados] = useState<string[]>([]);
  const [alunosVinculadosOriginais, setAlunosVinculadosOriginais] =
    useState<string[]>([]);

  const [loadingAlunos, setLoadingAlunos] = useState(false);
  const [salvandoVinculos, setSalvandoVinculos] = useState(false);

  // Recarrega as matérias quando o usuário, o perfil ou a busca mudarem.
  // A numeração da requisição impede respostas antigas de alterarem a tela.
  useEffect(() => {
    const requisicaoAtual = ++requisicaoMateriasRef.current;

    setMaterias([]);
    setLoading(true);

    const atualizarMaterias: Dispatch<SetStateAction<Materia[]>> = (valor) => {
      if (requisicaoAtual !== requisicaoMateriasRef.current) return;
      setMaterias(valor);
    };

    const atualizarLoading: Dispatch<SetStateAction<boolean>> = (valor) => {
      if (requisicaoAtual !== requisicaoMateriasRef.current) return;
      setLoading(valor);
    };

    MateriaController.PesquisaMateria(
      { busca: search },
      atualizarMaterias,
      atualizarLoading,
      toast as ToastLike,
    );

    return () => {
      if (requisicaoAtual === requisicaoMateriasRef.current) {
        requisicaoMateriasRef.current += 1;
      }
    };
  }, [search, user?.id, isProfessor]);

  const carregarAtividades = useCallback(
    async (materiaId: string) => {
      setLoadingAtividades(true);
      setLoadingProgressos(false);
      setProgressosPorAtividade({});

      try {
        const resultado =
          await AtividadeController.PesquisaAtividadePorMateria(materiaId);

        setAtividades(resultado);

        if (resultado.length === 0 || !user?.id) {
          return;
        }

        setLoadingProgressos(true);

        const resultadosProgressos = await Promise.allSettled(
          resultado.map(async (atividade) => {
            if (isProfessor) {
              const progressos =
                await ProgressoController.PesquisaProgressoPorAtividade(
                  atividade.id,
                );

              return [atividade.id, progressos] as const;
            }

            const progresso =
              await ProgressoController.PesquisaProgressoPorAlunoEAtividade(
                user.id,
                atividade.id,
              );

            return [
              atividade.id,
              progresso ? [progresso] : [],
            ] as const;
          }),
        );

        const progressosCarregados: Record<string, ProgressoComAluno[]> = {};

        resultadosProgressos.forEach((resultadoProgresso, index) => {
          const atividadeId = resultado[index].id;

          if (resultadoProgresso.status === 'fulfilled') {
            const [id, progressos] = resultadoProgresso.value;
            progressosCarregados[id] = progressos;
          } else {
            console.error(
              `Erro ao carregar progresso da atividade ${atividadeId}:`,
              resultadoProgresso.reason,
            );

            progressosCarregados[atividadeId] = [];
          }
        });

        setProgressosPorAtividade(progressosCarregados);
      } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        toast.error('Não foi possível carregar as atividades.');
        setAtividades([]);
      } finally {
        setLoadingAtividades(false);
        setLoadingProgressos(false);
      }
    },
    [isProfessor, user?.id],
  );

  const handleAbrirMateria = (materia: Materia) => {
    setMateriaSelecionada(materia);
    setAtividades([]);
    setProgressosPorAtividade({});
    carregarAtividades(materia.id);
  };

  const handleVoltarMaterias = () => {
    setMateriaSelecionada(null);
    setAtividades([]);
    setProgressosPorAtividade({});
    setAtividadeModalAberto(false);
    setAtividadeEditando(null);
    setAtividadeExcluir(null);
  };

  useEffect(() => {
    if (!materiaGerenciada) return;

    setAlunos([]);
    setAlunosSelecionados([]);
    setAlunosVinculadosOriginais([]);

    MateriaController.PesquisaAlunosDisponiveis(
      setAlunos,
      setLoadingAlunos,
      toast as ToastLike,
    );

    const atualizarVinculosCarregados: Dispatch<
      SetStateAction<string[]>
    > = (ids) => {
      setAlunosSelecionados(ids);
      setAlunosVinculadosOriginais(ids);
    };

    MateriaController.PesquisaIdsAlunosVinculados(
      materiaGerenciada.id,
      atualizarVinculosCarregados,
      toast as ToastLike,
    );
  }, [materiaGerenciada]);

  const handleSave = async (formData: { sigla: string }) => {
    if (!user?.id) {
      toast.error('Sessão inválida. Saia e entre novamente.');
      return;
    }

    if (modal?.mode === 'create') {
      await MateriaController.CadastroMateria(
        formData,
        user.id,
        setMaterias,
        () => setModal(null),
        toast as ToastLike,
      );
    } else if (modal?.mode === 'edit') {
      await MateriaController.AtualizarMateria(
        modal.materia.id,
        formData,
        setMaterias,
        () => setModal(null),
        toast as ToastLike,
      );
    }
  };

  const handleDelete = async (materia: Materia) => {
    await MateriaController.DeletarMateria(
      materia.id,
      setMaterias,
      toast as ToastLike,
    );

    setDeleteConfirm(null);
  };

  const handleSalvarAtividade = async (
    dados: EntradaFormularioAtividade,
  ) => {
    if (!materiaSelecionada) return;

    setSalvandoAtividade(true);

    try {
      const dadosAtividade: EntradaFormularioAtividade = {
        ...dados,
        materia_id: materiaSelecionada.id,
      };

      if (atividadeEditando) {
        await AtividadeController.AtualizarAtividade(
          atividadeEditando.id,
          dadosAtividade,
        );

        toast.success('Atividade atualizada com sucesso!');
      } else {
        await AtividadeController.CadastroAtividade(dadosAtividade);

        toast.success('Atividade cadastrada com sucesso!');
      }

      setAtividadeModalAberto(false);
      setAtividadeEditando(null);

      await carregarAtividades(materiaSelecionada.id);
    } catch (error) {
      console.error('Erro ao salvar atividade:', error);
      toast.error('Não foi possível salvar a atividade.');
    } finally {
      setSalvandoAtividade(false);
    }
  };

  const handleExcluirAtividade = async () => {
    if (!atividadeExcluir || !materiaSelecionada) return;

    setExcluindoAtividade(true);

    try {
      await AtividadeController.DeletarAtividade(atividadeExcluir.id);

      toast.success('Atividade excluída com sucesso!');
      setAtividadeExcluir(null);

      await carregarAtividades(materiaSelecionada.id);
    } catch (error) {
      console.error('Erro ao excluir atividade:', error);
      toast.error('Não foi possível excluir a atividade.');
    } finally {
      setExcluindoAtividade(false);
    }
  };

  const handleFinalizarAtividade = async (atividadeId: string) => {
    if (!user?.id) {
      toast.error('Sessão inválida. Saia e entre novamente.');
      return;
    }

    setFinalizandoAtividade(atividadeId);

    try {
      const progresso = await ProgressoController.FinalizarAtividade(
        user.id,
        atividadeId,
      );

      setProgressosPorAtividade((prev) => ({
        ...prev,
        [atividadeId]: [progresso],
      }));

      toast.success('Atividade finalizada com sucesso!');
    } catch (error) {
      console.error('Erro ao finalizar atividade:', error);

      toast.error(
        error instanceof Error
          ? error.message
          : 'Não foi possível finalizar a atividade.',
      );
    } finally {
      setFinalizandoAtividade(null);
    }
  };

  const handleToggleAluno = (alunoId: string) => {
    setAlunosSelecionados((prev) => {
      if (prev.includes(alunoId)) {
        return prev.filter((id) => id !== alunoId);
      }

      return [...prev, alunoId];
    });
  };

  const handleSaveVinculos = async () => {
    if (!materiaGerenciada) return;

    const novosVinculos = alunosSelecionados.filter(
      (alunoId) => !alunosVinculadosOriginais.includes(alunoId),
    );

    const vinculosRemovidos = alunosVinculadosOriginais.filter(
      (alunoId) => !alunosSelecionados.includes(alunoId),
    );

    setSalvandoVinculos(true);

    try {
      if (novosVinculos.length > 0) {
        const sucesso = await MateriaController.VincularAlunosMateria(
          materiaGerenciada.id,
          novosVinculos,
          toast as ToastLike,
        );

        if (!sucesso) return;
      }

      for (const alunoId of vinculosRemovidos) {
        const sucesso = await MateriaController.DesvincularAlunoMateria(
          materiaGerenciada.id,
          alunoId,
          toast as ToastLike,
        );

        if (!sucesso) return;
      }

      if (
        novosVinculos.length === 0 &&
        vinculosRemovidos.length === 0
      ) {
        toast.success('Nenhuma alteração foi necessária.');
      } else {
        toast.success('Acessos da matéria atualizados!');
      }

      setMateriaGerenciada(null);
    } finally {
      setSalvandoVinculos(false);
    }
  };

  const handleCloseGerenciamento = () => {
    if (salvandoVinculos) return;

    setMateriaGerenciada(null);
  };

  const formatarPrazo = (prazo?: string | null) => {
    if (!prazo) return 'Sem prazo definido';

    const data = new Date(`${prazo}T00:00:00`);

    if (Number.isNaN(data.getTime())) return prazo;

    return data.toLocaleDateString('pt-BR');
  };

  const formatarDataHora = (data?: string | null) => {
    if (!data) return '';

    const dataFormatada = new Date(data);

    if (Number.isNaN(dataFormatada.getTime())) return '';

    return dataFormatada.toLocaleString('pt-BR');
  };

  const obterStatusProgresso = (status: StatusProgresso) => {
    switch (status) {
      case StatusProgresso.NAO_INICIADO:
        return {
          texto: 'Não iniciada',
          cor: 'var(--text-muted)',
          icone: <Circle size={15} />,
        };

      case StatusProgresso.ATIVO:
        return {
          texto: 'Em andamento',
          cor: 'var(--warning)',
          icone: <Clock3 size={15} />,
        };

      case StatusProgresso.CONCLUIDO:
        return {
          texto: 'Concluída',
          cor: 'var(--success)',
          icone: <CheckCircle2 size={15} />,
        };

      case StatusProgresso.ATRASADO:
        return {
          texto: 'Atrasada',
          cor: 'var(--danger)',
          icone: <Clock3 size={15} />,
        };

      default:
        return {
          texto: 'Status desconhecido',
          cor: 'var(--text-muted)',
          icone: <Circle size={15} />,
        };
    }
  };

  return (
    <div className="page">
      <Navbar />

      <div className="page-content">
        {!materiaSelecionada ? (
          <>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 28,
                flexWrap: 'wrap',
                gap: 16,
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
                  <GraduationCap size={20} />
                </div>

                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700 }}>
                    Matérias
                  </h1>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                    }}
                  >
                    {isProfessor
                      ? 'Gerencie as matérias e os alunos com acesso'
                      : 'Visualize as matérias disponíveis'}
                  </p>
                </div>
              </div>

              {isProfessor && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setModal({ mode: 'create' })}
                >
                  <Plus size={16} />
                  Nova Matéria
                </button>
              )}
            </div>

            <div
              style={{
                position: 'relative',
                maxWidth: 480,
                marginBottom: 24,
              }}
            >
              <Search
                size={15}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />

              <input
                className="input"
                style={{ paddingLeft: 36 }}
                placeholder="Buscar por sigla..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <p
              style={{
                color: 'var(--text-muted)',
                fontSize: 13,
                marginBottom: 16,
              }}
            >
              {materias.length} matéria
              {materias.length !== 1 ? 's' : ''} encontrada
              {materias.length !== 1 ? 's' : ''}
            </p>

            {loading ? (
              <div className="empty-state">
                <div
                  className="spinner"
                  style={{ width: 32, height: 32 }}
                />
              </div>
            ) : materias.length === 0 ? (
              <div className="empty-state">
                <GraduationCap
                  size={40}
                  style={{ opacity: 0.3 }}
                />

                <p>Nenhuma matéria encontrada.</p>

                {isProfessor && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setModal({ mode: 'create' })}
                  >
                    <Plus size={14} />
                    Criar matéria
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {materias.map((materia) => (
                  <MateriaCard
                    key={materia.id}
                    materia={materia}
                    isProfessor={isProfessor}
                    onOpen={handleAbrirMateria}
                    onEdit={(item) =>
                      setModal({ mode: 'edit', materia: item })
                    }
                    onDelete={setDeleteConfirm}
                    onManageStudents={setMateriaGerenciada}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <>
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
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleVoltarMaterias}
                  title="Voltar para matérias"
                >
                  <ArrowLeft size={18} />
                  Voltar
                </button>

                <div>
                  <h1 style={{ fontSize: 22, fontWeight: 700 }}>
                    {materiaSelecionada.sigla}
                  </h1>

                  <p
                    style={{
                      color: 'var(--text-secondary)',
                      fontSize: 13,
                    }}
                  >
                    Atividades desta matéria
                  </p>
                </div>
              </div>

              {isProfessor && (
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => {
                    setAtividadeEditando(null);
                    setAtividadeModalAberto(true);
                  }}
                >
                  <Plus size={16} />
                  Nova atividade
                </button>
              )}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                marginBottom: 22,
                padding: 18,
                borderRadius: 12,
                background: 'rgba(52,211,153,0.07)',
                border: '1px solid var(--border)',
              }}
            >
              <div
                style={{
                  width: 42,
                  height: 42,
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(52,211,153,0.14)',
                  color: 'var(--success)',
                  flexShrink: 0,
                }}
              >
                <BookOpen size={20} />
              </div>

              <div>
                <p style={{ fontWeight: 600 }}>
                  {materiaSelecionada.sigla}
                </p>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 12,
                  }}
                >
                  {atividades.length} atividade
                  {atividades.length !== 1 ? 's' : ''} cadastrada
                  {atividades.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {loadingAtividades ? (
              <div className="empty-state">
                <div
                  className="spinner"
                  style={{ width: 32, height: 32 }}
                />
                <p>Carregando atividades...</p>
              </div>
            ) : atividades.length === 0 ? (
              <div className="empty-state">
                <ClipboardList
                  size={42}
                  style={{ opacity: 0.3 }}
                />

                <p>Nenhuma atividade cadastrada nesta matéria.</p>

                {isProfessor && (
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => {
                      setAtividadeEditando(null);
                      setAtividadeModalAberto(true);
                    }}
                  >
                    <Plus size={14} />
                    Cadastrar primeira atividade
                  </button>
                )}
              </div>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: 16,
                }}
              >
                {atividades.map((atividade) => {
                  const progressos =
                    progressosPorAtividade[atividade.id] ?? [];

                  const progressoAluno = progressos[0];

                  const concluidas = progressos.filter(
                    (progresso) =>
                      progresso.status === StatusProgresso.CONCLUIDO,
                  ).length;

                  const emAndamento = progressos.filter(
                    (progresso) =>
                      progresso.status === StatusProgresso.ATIVO,
                  ).length;

                  const naoIniciadas = progressos.filter(
                    (progresso) =>
                      progresso.status === StatusProgresso.NAO_INICIADO,
                  ).length;

                  const atrasadas = progressos.filter(
                    (progresso) =>
                      progresso.status === StatusProgresso.ATRASADO,
                  ).length;

                  const statusAluno = progressoAluno
                    ? obterStatusProgresso(progressoAluno.status)
                    : null;

                  return (
                    <div
                      key={atividade.id}
                      className="card"
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 14,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'flex-start',
                          justifyContent: 'space-between',
                          gap: 10,
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 9,
                            minWidth: 0,
                          }}
                        >
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 9,
                              background: 'rgba(52,211,153,0.12)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              color: 'var(--success)',
                              flexShrink: 0,
                            }}
                          >
                            <ClipboardList size={18} />
                          </div>

                          <strong style={{ fontSize: 14 }}>
                            Atividade
                          </strong>
                        </div>

                        {isProfessor && (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 3,
                              flexShrink: 0,
                            }}
                          >
                            <button
                              type="button"
                              className="btn-icon"
                              title="Editar atividade"
                              onClick={() => {
                                setAtividadeEditando(atividade);
                                setAtividadeModalAberto(true);
                              }}
                            >
                              <Pencil size={15} />
                            </button>

                            <button
                              type="button"
                              className="btn-icon danger"
                              title="Excluir atividade"
                              onClick={() => setAtividadeExcluir(atividade)}
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        )}
                      </div>

                      <p
                        style={{
                          fontSize: 14,
                          lineHeight: 1.6,
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
                          gap: 7,
                          paddingTop: 10,
                          borderTop: '1px solid var(--border)',
                          color: 'var(--text-muted)',
                          fontSize: 12,
                        }}
                      >
                        <CalendarDays size={15} />
                        Prazo: {formatarPrazo(atividade.prazo)}
                      </div>

                      <div
                        style={{
                          paddingTop: 12,
                          borderTop: '1px solid var(--border)',
                        }}
                      >
                        {loadingProgressos ? (
                          <p
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: 12,
                            }}
                          >
                            Carregando progresso...
                          </p>
                        ) : isProfessor ? (
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 10,
                              }}
                            >
                              Progresso dos alunos
                            </p>

                            {progressos.length === 0 ? (
                              <p
                                style={{
                                  color: 'var(--text-muted)',
                                  fontSize: 12,
                                }}
                              >
                                Nenhum progresso encontrado para esta atividade.
                              </p>
                            ) : (
                              <>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                      'repeat(2, minmax(0, 1fr))',
                                    gap: 8,
                                    marginBottom: 12,
                                  }}
                                >
                                  {[
                                    {
                                      label: 'Concluídas',
                                      valor: concluidas,
                                      cor: 'var(--success)',
                                    },
                                    {
                                      label: 'Em andamento',
                                      valor: emAndamento,
                                      cor: 'var(--warning)',
                                    },
                                    {
                                      label: 'Não iniciadas',
                                      valor: naoIniciadas,
                                      cor: 'var(--text-muted)',
                                    },
                                    {
                                      label: 'Atrasadas',
                                      valor: atrasadas,
                                      cor: 'var(--danger)',
                                    },
                                  ].map((item) => (
                                    <div
                                      key={item.label}
                                      style={{
                                        padding: 9,
                                        borderRadius: 8,
                                        background: 'var(--background-secondary)',
                                        border: '1px solid var(--border)',
                                      }}
                                    >
                                      <p
                                        style={{
                                          color: 'var(--text-muted)',
                                          fontSize: 11,
                                        }}
                                      >
                                        {item.label}
                                      </p>

                                      <strong
                                        style={{
                                          display: 'block',
                                          color: item.cor,
                                          fontSize: 18,
                                          marginTop: 3,
                                        }}
                                      >
                                        {item.valor}
                                      </strong>
                                    </div>
                                  ))}
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 9,
                                  }}
                                >
                                  {progressos.map((progresso) => {
                                    const status = obterStatusProgresso(
                                      progresso.status,
                                    );

                                    return (
                                      <div
                                        key={progresso.id}
                                        style={{
                                          padding: 10,
                                          borderRadius: 8,
                                          border: '1px solid var(--border)',
                                        }}
                                      >
                                        <p
                                          style={{
                                            fontSize: 11,
                                            color: 'var(--text-muted)',
                                            overflowWrap: 'anywhere',
                                          }}
                                        >
                                          Aluno: {progresso.aluno_nome}
                                        </p>

                                        <div
                                          style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            gap: 8,
                                            marginTop: 6,
                                          }}
                                        >
                                          <span
                                            style={{
                                              display: 'flex',
                                              alignItems: 'center',
                                              gap: 5,
                                              color: status.cor,
                                              fontSize: 12,
                                            }}
                                          >
                                            {status.icone}
                                            {status.texto}
                                          </span>

                                          <strong
                                            style={{
                                              fontSize: 12,
                                              color: 'var(--text)',
                                            }}
                                          >
                                            {progresso.percentual_conclusao}%
                                          </strong>
                                        </div>

                                        <div
                                          style={{
                                            height: 6,
                                            background: 'var(--border)',
                                            borderRadius: 10,
                                            overflow: 'hidden',
                                            marginTop: 8,
                                          }}
                                        >
                                          <div
                                            style={{
                                              height: '100%',
                                              width: `${progresso.percentual_conclusao}%`,
                                              background: status.cor,
                                              borderRadius: 10,
                                              transition: 'width 0.2s',
                                            }}
                                          />
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </>
                            )}
                          </div>
                        ) : progressoAluno && statusAluno ? (
                          <div>
                            <p
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                marginBottom: 10,
                              }}
                            >
                              Meu progresso
                            </p>

                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: 8,
                              }}
                            >
                              <span
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  color: statusAluno.cor,
                                  fontSize: 12,
                                  fontWeight: 600,
                                }}
                              >
                                {statusAluno.icone}
                                {statusAluno.texto}
                              </span>

                              <strong style={{ fontSize: 13 }}>
                                {progressoAluno.percentual_conclusao}%
                              </strong>
                            </div>

                            <div
                              style={{
                                height: 7,
                                background: 'var(--border)',
                                borderRadius: 10,
                                overflow: 'hidden',
                                marginTop: 9,
                              }}
                            >
                              <div
                                style={{
                                  height: '100%',
                                  width: `${progressoAluno.percentual_conclusao}%`,
                                  background: statusAluno.cor,
                                  borderRadius: 10,
                                  transition: 'width 0.2s',
                                }}
                              />
                            </div>

                            {progressoAluno.status ===
                              StatusProgresso.CONCLUIDO && (
                              <p
                                style={{
                                  color: 'var(--text-muted)',
                                  fontSize: 11,
                                  marginTop: 9,
                                }}
                              >
                                Concluída em{' '}
                                {formatarDataHora(
                                  progressoAluno.data_conclusao,
                                )}
                              </p>
                            )}

                            {progressoAluno.status !==
                              StatusProgresso.CONCLUIDO &&
                              progressoAluno.status !==
                                StatusProgresso.ATRASADO && (
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{
                                    width: '100%',
                                    marginTop: 12,
                                    justifyContent: 'center',
                                  }}
                                  onClick={() =>
                                    handleFinalizarAtividade(atividade.id)
                                  }
                                  disabled={
                                    finalizandoAtividade === atividade.id
                                  }
                                >
                                  {finalizandoAtividade === atividade.id
                                    ? 'Finalizando...'
                                    : 'Finalizar atividade'}
                                </button>
                              )}
                          </div>
                        ) : (
                          <p
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: 12,
                            }}
                          >
                            Progresso não encontrado para esta atividade.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      {modal && (
        <ManterMateriaModal
          materia={modal.mode === 'edit' ? modal.materia : undefined}
          isCreate={modal.mode === 'create'}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {atividadeModalAberto && materiaSelecionada && (
        <ManterAtividadePaginaModal
          aberto={atividadeModalAberto}
          materiaId={materiaSelecionada.id}
          atividade={atividadeEditando}
          salvando={salvandoAtividade}
          onFechar={() => {
            if (salvandoAtividade) return;

            setAtividadeModalAberto(false);
            setAtividadeEditando(null);
          }}
          onSalvar={handleSalvarAtividade}
        />
      )}

      {atividadeExcluir && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 420 }}>
            <div className="modal-header">
              <span className="modal-title">
                Confirmar exclusão
              </span>

              <button
                type="button"
                className="btn-icon"
                onClick={() => setAtividadeExcluir(null)}
                disabled={excluindoAtividade}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Deseja realmente excluir esta atividade? Esta ação não
                poderá ser desfeita.
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setAtividadeExcluir(null)}
                disabled={excluindoAtividade}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={handleExcluirAtividade}
                disabled={excluindoAtividade}
              >
                {excluindoAtividade ? 'Excluindo...' : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}

      {materiaGerenciada && (
        <div className="modal-overlay">
          <div
            className="modal"
            style={{
              maxWidth: 560,
              width: '95%',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div className="modal-header">
              <div>
                <span className="modal-title">
                  Gerenciar alunos
                </span>

                <p
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 12,
                    marginTop: 4,
                  }}
                >
                  Matéria: {materiaGerenciada.sigla}
                </p>
              </div>

              <button
                type="button"
                className="btn-icon"
                onClick={handleCloseGerenciamento}
                disabled={salvandoVinculos}
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div
              className="modal-body"
              style={{
                overflowY: 'auto',
                flex: 1,
              }}
            >
              <p
                style={{
                  color: 'var(--text-secondary)',
                  fontSize: 13,
                  marginBottom: 16,
                }}
              >
                Selecione os alunos que poderão acessar esta matéria.
                Os alunos desmarcados perderão o acesso.
              </p>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: 12,
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 600 }}>
                  Alunos cadastrados
                </span>

                <span
                  style={{
                    color: 'var(--text-muted)',
                    fontSize: 12,
                  }}
                >
                  {alunosSelecionados.length} selecionado
                  {alunosSelecionados.length !== 1 ? 's' : ''}
                </span>
              </div>

              {loadingAlunos ? (
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: 32,
                  }}
                >
                  <div
                    className="spinner"
                    style={{ width: 28, height: 28 }}
                  />
                </div>
              ) : alunos.length === 0 ? (
                <div
                  className="empty-state"
                  style={{ padding: 24 }}
                >
                  <UserRound
                    size={32}
                    style={{ opacity: 0.3 }}
                  />

                  <p>Nenhum aluno cadastrado foi encontrado.</p>
                </div>
              ) : (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  {alunos.map((aluno) => {
                    const selecionado = alunosSelecionados.includes(
                      aluno.id,
                    );

                    return (
                      <label
                        key={aluno.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 12,
                          padding: 12,
                          border: `1px solid ${
                            selecionado
                              ? 'var(--success)'
                              : 'var(--border)'
                          }`,
                          borderRadius: 8,
                          cursor: 'pointer',
                          background: selecionado
                            ? 'rgba(52,211,153,0.07)'
                            : 'transparent',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={selecionado}
                          onChange={() => handleToggleAluno(aluno.id)}
                          disabled={salvandoVinculos}
                          style={{
                            width: 16,
                            height: 16,
                            accentColor: 'var(--success)',
                            flexShrink: 0,
                          }}
                        />

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: 600, fontSize: 14 }}>
                            {aluno.nome}
                          </p>

                          <p
                            style={{
                              color: 'var(--text-muted)',
                              fontSize: 12,
                              overflowWrap: 'anywhere',
                            }}
                          >
                            {aluno.email}
                          </p>

                          {(aluno.matricula || aluno.curso) && (
                            <p
                              style={{
                                color: 'var(--text-muted)',
                                fontSize: 11,
                                marginTop: 3,
                              }}
                            >
                              {aluno.matricula
                                ? `Matrícula: ${aluno.matricula}`
                                : ''}

                              {aluno.matricula && aluno.curso ? ' • ' : ''}

                              {aluno.curso || ''}
                            </p>
                          )}
                        </div>

                        {selecionado && (
                          <Check
                            size={17}
                            color="var(--success)"
                          />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className="modal-footer"
              style={{ flexShrink: 0 }}
            >
              <button
                type="button"
                className="btn btn-ghost"
                onClick={handleCloseGerenciamento}
                disabled={salvandoVinculos}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSaveVinculos}
                disabled={loadingAlunos || salvandoVinculos}
              >
                {salvandoVinculos
                  ? 'Salvando...'
                  : 'Salvar acessos'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">
                Confirmar exclusão
              </span>

              <button
                type="button"
                className="btn-icon"
                onClick={() => setDeleteConfirm(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Deseja excluir a matéria{' '}
                <strong style={{ color: 'var(--text)' }}>
                  {deleteConfirm.sigla}
                </strong>
                ?
              </p>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setDeleteConfirm(null)}
              >
                Cancelar
              </button>

              <button
                type="button"
                className="btn btn-danger"
                onClick={() => handleDelete(deleteConfirm)}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManterMateriaPagina;
