import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import type { Materia } from '../../classes';

type ManterMateriaModalProps = {
  materia?: Materia;
  onSave: (formData: { sigla: string }) => void;
  onClose: () => void;
  isCreate: boolean;
};

const ManterMateriaModal = ({ materia, onSave, onClose, isCreate }: ManterMateriaModalProps) => {
  const [sigla, setSigla] = useState('');

  useEffect(() => {
    if (materia) {
      setSigla(materia.sigla || '');
    } else {
      setSigla('');
    }
  }, [materia]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ sigla });
  };

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 420 }}>
        <div className="modal-header">
          <span className="modal-title">{isCreate ? 'Nova Matéria' : 'Editar Matéria'}</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Sigla</label>
              <input
                className="input"
                type="text"
                placeholder="Ex: MAT101"
                value={sigla}
                onChange={(e) => setSigla(e.target.value)}
                required
                maxLength={20}
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

export default ManterMateriaModal;
