import React, { useEffect, useState, useCallback } from 'react';
import { GraduationCap, Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../Auth/contexts/AuthContext';
import MateriaController from '../Controller/ManterMateriaController';
import type { Materia } from '../../classes';
import ManterMateriaModal from './ManterMateriaModal';
import Navbar from '../../components/shared/Navbar';

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; materia: Materia }
  | null;

const MateriaCard = ({
  materia,
  isProfessor,
  onEdit,
  onDelete,
}: {
  materia: Materia;
  isProfessor: boolean;
  onEdit: (materia: Materia) => void;
  onDelete: (materia: Materia) => void;
}) => (
  <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
      <div style={{
        width: 44, height: 44, background: 'rgba(52,211,153,0.12)', borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)',
        fontWeight: 700, fontSize: 13,
      }}>
        {materia.sigla.slice(0, 3)}
      </div>
      <div>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>{materia.sigla}</h3>
        {materia.criado_em && (
          <p style={{ color: 'var(--text-muted)', fontSize: 12, marginTop: 2 }}>
            Cadastrada em {new Date(materia.criado_em).toLocaleDateString('pt-BR')}
          </p>
        )}
      </div>
    </div>
    {isProfessor && (
      <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
        <button className="btn-icon" onClick={() => onEdit(materia)} title="Editar"><Pencil size={15} /></button>
        <button className="btn-icon danger" onClick={() => onDelete(materia)} title="Excluir"><Trash2 size={15} /></button>
      </div>
    )}
  </div>
);

const ManterMateriaPagina = () => {
  const { isProfessor, user } = useAuth();
  const [materias, setMaterias] = useState<Materia[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<Materia | null>(null);

  const load = useCallback(() => {
    MateriaController.PesquisaMateria({ busca: search }, setMaterias, setLoading, toast);
  }, [search]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData: { sigla: string }) => {
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

  const handleDelete = async (materia: Materia) => {
    await MateriaController.DeletarMateria(materia.id, setMaterias, toast);
    setDeleteConfirm(null);
  };

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
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {isProfessor ? 'Gerencie as matérias cadastradas no sistema' : 'Visualize as matérias disponíveis'}
              </p>
            </div>
          </div>
          {isProfessor && (
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
              <Plus size={16} /> Nova Matéria
            </button>
          )}
        </div>

        <div style={{ position: 'relative', maxWidth: 480, marginBottom: 24 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            className="input"
            style={{ paddingLeft: 36 }}
            placeholder="Buscar por sigla..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>
          {materias.length} matéria{materias.length !== 1 ? 's' : ''} encontrada{materias.length !== 1 ? 's' : ''}
        </p>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : materias.length === 0 ? (
          <div className="empty-state">
            <GraduationCap size={40} style={{ opacity: 0.3 }} />
            <p>Nenhuma matéria encontrada.</p>
            {isProfessor && (
              <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'create' })}>
                <Plus size={14} /> Criar matéria
              </button>
            )}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {materias.map((m) => (
              <MateriaCard
                key={m.id}
                materia={m}
                isProfessor={isProfessor}
                onEdit={(materia) => setModal({ mode: 'edit', materia })}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>
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

      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Confirmar exclusão</span>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}><span>✕</span></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Deseja excluir a matéria <strong style={{ color: 'var(--text)' }}>{deleteConfirm.sigla}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManterMateriaPagina;
