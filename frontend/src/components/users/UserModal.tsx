// src/components/users/UserModal.js
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { EntradaFormularioUsuario, Usuario } from '../../classes';

type UserModalProps = {
  user?: Usuario;
  onSave: (form: EntradaFormularioUsuario) => void;
  onClose: () => void;
  isCreate: boolean;
};

const UserModal = ({ user, onSave, onClose, isCreate }: UserModalProps) => {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'standard' });

  useEffect(() => {
    if (user) setForm({ name: user.name || '', email: user.email || '', password: '', role: user.role || 'standard' });
  }, [user]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) return;
    if (isCreate && !form.password) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isCreate ? 'Novo Usuário' : 'Editar Usuário'}</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Nome completo</label>
              <input className="input" type="text" placeholder="Nome" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="email@exemplo.com" value={form.email} onChange={set('email')} required disabled={!isCreate} />
            </div>
            {isCreate && (
              <div className="form-group">
                <label className="label">Senha</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={form.password} onChange={set('password')} required minLength={6} />
              </div>
            )}
            <div className="form-group">
              <label className="label">Perfil</label>
              <select className="input" value={form.role} onChange={set('role')}>
                <option value="standard">Standard</option>
                <option value="admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-ghost" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary">{isCreate ? 'Criar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
