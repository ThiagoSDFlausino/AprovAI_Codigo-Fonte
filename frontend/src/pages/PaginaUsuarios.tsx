// src/pages/PaginaUsuarios.tsx
import React, { useEffect, useState } from 'react';
import { Users, Plus, Pencil, Trash2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import UsuarioController from '../controllers/UsuarioController';
import UserModal from '../components/users/UserModal';
import type { Usuario } from '../classes';
import Navbar from '../components/shared/Navbar';

const PaginaUsuarios = () => {
  const { isAdmin, profile } = useAuth();
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => { UsuarioController.PesquisaUsuario(setUsers, setLoading, toast); }, []);

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = async (formData) => {
    if (modal.mode === 'create') {
      await UsuarioController.CadastroUsuario(formData, setUsers, () => setModal(null), toast);
    } else {
      await UsuarioController.AtualizarUsuario(modal.user.id, formData, setUsers, () => setModal(null), toast);
    }
  };

  const handleDelete = async (id) => {
    await UsuarioController.DeletarUsuario(id, setUsers, toast);
    setDeleteConfirm(null);
  };

  const roleBadge = (role) => (
    <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-standard'}`}>
      {role === 'admin' ? 'Admin' : 'Standard'}
    </span>
  );

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 42, height: 42, background: 'rgba(167,139,250,0.12)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
              <Users size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: 22, fontWeight: 700 }}>Usuários</h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>
                {isAdmin ? 'Gerencie as contas de usuário' : 'Lista de usuários cadastrados'}
              </p>
            </div>
          </div>
          {isAdmin && (
            <button className="btn btn-primary" onClick={() => setModal({ mode: 'create' })}>
              <Plus size={16} /> Novo Usuário
            </button>
          )}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20, maxWidth: 400 }}>
          <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Buscar usuários..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Table */}
        {loading ? (
          <div className="empty-state"><div className="spinner" style={{ width: 32, height: 32 }} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <Users size={40} style={{ opacity: 0.3 }} />
            <p>Nenhum usuário encontrado.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Email</th>
                  <th>Perfil</th>
                  <th>Criado em</th>
                  {isAdmin && <th style={{ textAlign: 'right' }}>Ações</th>}
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ fontWeight: 500 }}>
                      {u.name || '—'}
                      {u.id === profile?.id && <span style={{ marginLeft: 6, fontSize: 11, color: 'var(--text-muted)' }}>(você)</span>}
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td>{roleBadge(u.role)}</td>
                    <td style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-BR') : '—'}
                    </td>
                    {isAdmin && (
                      <td>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 4 }}>
                          <button className="btn-icon" title="Editar" onClick={() => setModal({ mode: 'edit', user: u })}>
                            <Pencil size={15} />
                          </button>
                          <button
                            className="btn-icon danger"
                            title="Excluir"
                            onClick={() => setDeleteConfirm(u)}
                            disabled={u.id === profile?.id}
                          >
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
          {filtered.length} usuário{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Modal create/edit */}
      {modal && (
        <UserModal
          user={modal.user}
          isCreate={modal.mode === 'create'}
          onSave={handleSave}
          onClose={() => setModal(null)}
        />
      )}

      {/* Delete confirm modal */}
      {deleteConfirm && (
        <div className="modal-overlay">
          <div className="modal" style={{ maxWidth: 380 }}>
            <div className="modal-header">
              <span className="modal-title">Confirmar exclusão</span>
              <button className="btn-icon" onClick={() => setDeleteConfirm(null)}><span>✕</span></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)' }}>
                Tem certeza que deseja excluir <strong style={{ color: 'var(--text)' }}>{deleteConfirm.name || deleteConfirm.email}</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDeleteConfirm(null)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => handleDelete(deleteConfirm.id)}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaginaUsuarios;
