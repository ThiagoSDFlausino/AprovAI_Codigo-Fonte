import React, { useState } from 'react';
import { X } from 'lucide-react';
import type { EntradaFormularioMateria, Materia } from '../../classes';

type MateriaModalProps = {
  materia?: Materia;
  onSave: (form: EntradaFormularioMateria) => void;
  onClose: () => void;
  isCreate: boolean;
};

const MateriaModal = ({ materia, onSave, onClose, isCreate }: MateriaModalProps) => {
  const [form, setForm] = useState<EntradaFormularioMateria>({ sigla: '', nome: '' });

  React.useEffect(() => {
    if (materia) setForm({ sigla: materia.sigla || '', nome: materia.nome || '' });
  }, [materia]);

  const set = (field: keyof EntradaFormularioMateria) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.sigla?.trim()) return;
    onSave(form);
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isCreate ? 'Nova Matéria' : 'Editar Matéria'}</span>
          <button type="button" className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Sigla</label>
              <input
                className="input"
                type="text"
                placeholder="Ex: MAT"
                value={form.sigla}
                onChange={set('sigla')}
                required
                maxLength={10}
              />
            </div>
            <div className="form-group">
              <label className="label">Nome</label>
              <input
                className="input"
                type="text"
                placeholder="Nome da matéria"
                value={form.nome}
                onChange={set('nome')}
              />
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

export default MateriaModal;
