import React, { useEffect, useState } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MateriaController from '../controllers/MateriaController';
import MateriaModal from '../components/materias/MateriaModal';
import type { EntradaFormularioMateria, Materia } from '../classes';
import Navbar from '../components/shared/Navbar';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; materia: Materia }
  | null;

const PaginaMaterias = () => {
  const { isAdm, isProfessor, user } = useAuth();
  const podeEditar = isProfessor;
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Materia | null>(null);

  useEffect(() => {
    MateriaController.PesquisaMateria(setMaterias, setLoading, toast);
  }, []);

  const filtered = materias.filter(
    (m) =>
      m.sigla?.toLowerCase().includes(search.toLowerCase()) ||
      m.nome?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSave = async (formData: EntradaFormularioMateria) => {
    if (!user?.id) {
      toast.error('Sessão inválida. Saia e entre novamente.');
      return;
    }
    if (modal?.mode === 'create') {
      await MateriaController.CadastroMateria(formData, user.id, setMaterias, () => setModal(null), toast);
    } else if (modal?.mode === 'edit') {
      await MateriaController.AtualizarMateria(modal.materia.id, formData, setMaterias, () => setModal(null), toast);
    }
  };

  const handleDelete = async (id: string) => {
    await MateriaController.DeletarMateria(id, setMaterias, toast);
    setDeleteConfirm(null);
  };

  const subtitulo = isProfessor
    ? 'Gerencie as matérias do sistema'
    : isAdm
      ? 'Visualize as matérias criadas pelos professores'
      : 'Consulte as matérias disponíveis';

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(52,211,153,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
              <GraduationCap size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>Matérias</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{subtitulo}</p>
            </div>
          </div>
          {podeEditar && (
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
              <Plus size={16} /> Nova Matéria
            </button>
          )}
        </div>

        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar matérias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={40} style={{ opacity: 0.3 }} />
            <p>Nenhuma matéria encontrada.</p>
            {podeEditar && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'create' })}>
                <Plus size={14} /> Criar matéria
              </button>
            )}
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Sigla</th>
                  <th>Nome</th>
                  <th>Criado em</th>
                  {podeEditar && <th style={{ textAlign: 'right' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600 }}>{m.sigla}</td>
                    <td style={{ color: 'var(--text-secondary)' }}>{m.nome || '—'}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {m.created_at ? new Date(m.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    {podeEditar && (
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="btn-icon" title="Editar" onClick={() => setModal({ mode: 'edit', materia: m })}>
                            <Pencil size={15} />
                          </button>
                          <button className="btn-icon danger" title="Excluir" onClick={() => setDeleteConfirm(m)}>
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 12 }}>
          {filtered.length} matéria{filtered.length !== 1 ? 's' : ''} encontrada{filtered.length !== 1 ? 's' : ''}
          {isAdm && !isProfessor && ' (somente visualização)'}
        </p>
      </div>

      {modal && (
        <MateriaModal
          materia={modal.mode === 'edit' ? modal.materia : undefined}
          isCreate={modal.mode === 'create'}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Confirmar exclusão</span>
              <button type="button" className="btn-icon" onClick={() => setDeleteConfirm(null)}><span>✕</span></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Deseja excluir a matéria <strong style={{ color: 'var(--text)' }}>{deleteConfirm.sigla}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaMaterias;
