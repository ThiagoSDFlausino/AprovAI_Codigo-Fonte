import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Perfil, normalizarPerfil, type EntradaFormularioUsuario, type Usuario } from '../../classes';

type UserModalProps = {
  user?: Usuario;
  onSave: (form: EntradaFormularioUsuario) => void;
  onClose: () => void;
  isCreate: boolean;
};

const FORM_INICIAL = {
  nome: '',
  email: '',
  senha: '',
  perfil: Perfil.Aluno,
  funcao: '',
  formacao: '',
  matricula: '',
  curso: '',
};

const UserModal = ({ user, onSave, onClose, isCreate }: UserModalProps) => {
  const [form, setForm] = useState(FORM_INICIAL);

  useEffect(() => {
    if (user) {
      setForm({
        nome: user.nome || '',
        email: user.email || '',
        senha: '',
        perfil: normalizarPerfil(user.perfil),
        funcao: user.funcao || '',
        formacao: user.formacao || '',
        matricula: user.matricula != null ? String(user.matricula) : '',
        curso: user.curso || '',
      });
    } else {
      setForm(FORM_INICIAL);
    }
  }, [user]);

  const set = (field: keyof typeof FORM_INICIAL) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email) return;
    if (isCreate && !form.senha) return;
    onSave(form);
  };

  const perfil = normalizarPerfil(form.perfil);

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
              <input className="input" type="text" placeholder="Nome" value={form.nome} onChange={set('nome')} required />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input className="input" type="email" placeholder="email@exemplo.com" value={form.email} onChange={set('email')} required disabled={!isCreate} />
            </div>
            {isCreate && (
              <div className="form-group">
                <label className="label">Senha</label>
                <input className="input" type="password" placeholder="Mínimo 6 caracteres" value={form.senha} onChange={set('senha')} required minLength={6} />
              </div>
            )}
            <div className="form-group">
              <label className="label">Perfil</label>
              <select className="input" value={form.perfil} onChange={set('perfil')}>
                <option value={Perfil.Adm}>Administrador</option>
                <option value={Perfil.Professor}>Professor</option>
                <option value={Perfil.Aluno}>Aluno</option>
              </select>
            </div>

            {perfil === Perfil.Adm && (
              <div className="form-group">
                <label className="label">Função</label>
                <input className="input" type="text" placeholder="Ex: Coordenador" value={form.funcao} onChange={set('funcao')} />
              </div>
            )}

            {perfil === Perfil.Professor && (
              <div className="form-group">
                <label className="label">Formação</label>
                <input className="input" type="text" placeholder="Ex: Licenciatura em Matemática" value={form.formacao} onChange={set('formacao')} />
              </div>
            )}

            {perfil === Perfil.Aluno && (
              <>
                <div className="form-group">
                  <label className="label">Matrícula</label>
                  <input className="input" type="number" placeholder="Ex: 2024001234" value={form.matricula} onChange={set('matricula')} />
                </div>
                <div className="form-group">
                  <label className="label">Curso</label>
                  <input className="input" type="text" placeholder="Ex: Engenharia de Software" value={form.curso} onChange={set('curso')} />
                </div>
              </>
            )}
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
