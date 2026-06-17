import React, { useEffect, useState, useCallback } from 'react';
import { BookOpen, Plus, Pencil, Trash2, Clock, Tag, Target, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MetodoEstudoController from '../controllers/MetodoEstudoController';
import type { EntradaFormularioMetodoEstudo, MetodoEstudo } from '../classes';
import MethodModal from '../components/methods/MethodModal';
import Navbar from '../components/shared/Navbar';

const categoryColors: Record<string, { bg: string; color: string }> = {
  focus: { bg: 'rgba(79,142,247,0.1)', color: 'var(--primary)' },
  organization: { bg: 'rgba(167,139,250,0.1)', color: 'var(--accent)' },
  revision: { bg: 'rgba(251,191,36,0.1)', color: 'var(--warning)' },
  memorization: { bg: 'rgba(52,211,153,0.1)', color: 'var(--success)' },
  reading: { bg: 'rgba(248,113,113,0.1)', color: 'var(--danger)' },
  practice: { bg: 'rgba(251,191,36,0.1)', color: 'var(--warning)' },
};

type ModalState =
  | { mode: 'create' }
  | { mode: 'edit'; method: MetodoEstudo }
  | null;

type MethodCardProps = {
  method: MetodoEstudo;
  onEdit: (method: MetodoEstudo) => void;
  onDelete: (method: MetodoEstudo) => void;
};

const MethodCard = ({ method, onEdit, onDelete }: MethodCardProps) => {
  const catStyle = categoryColors[method.category] || { bg: 'var(--surface-2)', color: 'var(--text-secondary)' };
  const catLabel = MetodoEstudoController.getCategoryLabel(method.category);

  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: 14, position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16, lineHeight: 1.3 }}>{method.name}</h3>
        <div style={{ display: 'flex', gap: 2, flexShrink: 0 }}>
          <button type="button" className="btn-icon" onClick={() => onEdit(method)} title="Editar"><Pencil size={15} /></button>
          <button type="button" className="btn-icon danger" onClick={() => onDelete(method)} title="Excluir"><Trash2 size={15} /></button>
        </div>
      </div>

      <span style={{ display: 'inline-flex', alignItems: 'center', width: 'fit-content', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...catStyle }}>
        {catLabel}
      </span>

      <p style={{ color: 'var(--text-secondary)', fontSize: 13, lineHeight: 1.6, flex: 1 }}>{method.description}</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {method.duration_minutes && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Clock size={13} />
            <span>Duração: {method.duration_minutes} minutos</span>
          </div>
        )}
        {method.benefits && method.benefits.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 7, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Tag size={13} style={{ marginTop: 3 }} />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {method.benefits.map((b, i) => (
                <span key={i} style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 4, padding: '1px 7px', fontSize: 12 }}>{b}</span>
              ))}
            </div>
          </div>
        )}
        {method.ideal_for && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-secondary)' }}>
            <Target size={13} />
            <span>{method.ideal_for}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PaginaMetodos = () => {
  const { user } = useAuth();
  const [methods, setMethods] = useState<MetodoEstudo[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [modal, setModal] = useState<ModalState>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<MetodoEstudo | null>(null);
  const categories = MetodoEstudoController.getCategories();

  const load = useCallback(() => {
    MetodoEstudoController.PesquisaMetodoEstudo({ search, category }, setMethods, setLoading, toast);
  }, [search, category]);

  useEffect(() => { load(); }, [load]);

  const handleSave = async (formData: EntradaFormularioMetodoEstudo) => {
    if (!user?.id) {
      toast.error('Sessão inválida. Saia e entre novamente.');
      return;
    }
    if (modal?.mode === 'create') {
      await MetodoEstudoController.CadastroMetodoEstudo(formData, user.id, setMethods, () => setModal(null), toast);
    } else if (modal?.mode === 'edit') {
      await MetodoEstudoController.AtualizarMetodoEstudo(modal.method.id, formData, setMethods, () => setModal(null), toast);
    }
  };

  const handleDelete = async (method: MetodoEstudo) => {
    await MetodoEstudoController.DeletarMetodoEstudo(method.id, setMethods, toast);
    setDeleteConfirm(null);
  };

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'var(--primary-glow)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)' }}>
              <BookOpen size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>Métodos de Estudo</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                Gerencie os métodos disponíveis no sistema
              </p>
            </div>
          </div>
          <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
            <Plus size={16} /> Novo Método
          </button>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', flex: '1 1 240px', maxWidth: 480 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input className="input" style={{ paddingLeft: 36 }} placeholder="Buscar métodos..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width: 'auto', flex: '0 0 auto' }} value={category} onChange={e => setCategory(e.target.value)}>
            {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: 13, marginBottom: 16 }}>{methods.length} método{methods.length !== 1 ? 's' : ''} encontrado{methods.length !== 1 ? 's' : ''}</p>

        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : methods.length === 0 ? (
          <div className="empty-state">
            <BookOpen size={40} style={{ opacity: 0.3 }} />
            <p>Nenhum método encontrado.</p>
            <button className="btn btn-primary btn-sm" onClick={() => setModal({ mode: 'create' })}><Plus size={14} /> Criar método</button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
            {methods.map(m => (
              <MethodCard
                key={m.id}
                method={m}
                onEdit={(method) => setModal({ mode: 'edit', method })}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>
        )}
      </div>

      {modal && (
        <MethodModal
          method={modal.mode === 'edit' ? modal.method : undefined}
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
                Deseja excluir <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name}</strong>?
              </p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button type="button" className="btn btn-danger" onClick={() => handleDelete(deleteConfirm)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaMetodos;
