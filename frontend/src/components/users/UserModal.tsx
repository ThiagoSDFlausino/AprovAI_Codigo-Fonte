import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Permissao, permissaoLabel, usuarioParaFormulario, type EntradaFormularioUsuario, type Usuario } from '../../classes';

type UserModalProps = {
  user?: Usuario;
  onSave: (form: EntradaFormularioUsuario) => void;
  onClose: () => void;
  isCreate: boolean;
};

const UserModal = ({ user, onSave, onClose, isCreate }: UserModalProps) => {
  const [form, setForm] = useState<EntradaFormularioUsuario>({
    nome: '',
    email: '',
    senha: '',
    permissao: Permissao.Aluno,
    matricula: null,
    curso: '',
    formacao: '',
    codigo: null,
    telefone: '',
  });

  useEffect(() => {
    if (user) {
      setForm({ ...usuarioParaFormulario(user), senha: '' });
    }
  }, [user]);

  const set = (field: keyof EntradaFormularioUsuario) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nome || !form.email) return;
    if (isCreate && !form.senha) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isCreate ? 'Novo Usuário' : 'Editar Usuário'}</span>
          <button type="button" className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Nome completo</label>
              <input className="input" type="text" placeholder="Nome" value={form.nome} onChange={set('nome')} required />
            </div>
            <div className="form-group">
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="email@exemplo.com"
                value={form.email}
                onChange={set('email')}
                required
                disabled={!isCreate}
              />
            </div>
            {isCreate && (
              <div className="form-group">
                <label className="label">Senha</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={form.senha}
                  onChange={set('senha')}
                  required
                  minLength={6}
                />
              </div>
            )}
            <div className="form-group">
              <label className="label">Permissão</label>
              <select className="input" value={form.permissao} onChange={set('permissao')}>
                <option value={Permissao.ADM}>{permissaoLabel(Permissao.ADM)}</option>
                <option value={Permissao.Professor}>{permissaoLabel(Permissao.Professor)}</option>
                <option value={Permissao.Aluno}>{permissaoLabel(Permissao.Aluno)}</option>
              </select>
            </div>

            {form.permissao === Permissao.Aluno && (
              <>
                <div className="form-group">
                  <label className="label">Matrícula</label>
                  <input
                    className="input"
                    type="number"
                    value={form.matricula ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, matricula: e.target.value ? Number(e.target.value) : null }))}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Curso</label>
                  <input className="input" type="text" value={form.curso} onChange={set('curso')} />
                </div>
              </>
            )}

            {form.permissao === Permissao.Professor && (
              <div className="form-group">
                <label className="label">Formação</label>
                <input className="input" type="text" value={form.formacao} onChange={set('formacao')} />
              </div>
            )}

            {form.permissao === Permissao.ADM && (
              <>
                <div className="form-group">
                  <label className="label">Código</label>
                  <input
                    className="input"
                    type="number"
                    value={form.codigo ?? ''}
                    onChange={(e) => setForm((p) => ({ ...p, codigo: e.target.value ? Number(e.target.value) : null }))}
                  />
                </div>
                <div className="form-group">
                  <label className="label">Telefone</label>
                  <input className="input" type="text" value={form.telefone} onChange={set('telefone')} />
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
