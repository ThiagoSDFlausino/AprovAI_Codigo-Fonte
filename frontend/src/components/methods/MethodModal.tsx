// src/components/methods/MethodModal.js
import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import StudyMethodController from '../../controllers/StudyMethodController';

const MethodModal = ({ method, onSave, onClose, isCreate }) => {
  const categories = StudyMethodController.getCategories().filter(c => c.value !== 'all');
  const [form, setForm] = useState({
    name: '', description: '', category: 'focus',
    duration_minutes: '', benefits: [], ideal_for: '',
  });
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    if (method) {
      setForm({
        name: method.name || '',
        description: method.description || '',
        category: method.category || 'focus',
        duration_minutes: method.duration_minutes || '',
        benefits: method.benefits || [],
        ideal_for: method.ideal_for || '',
      });
    }
  }, [method]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const addBenefit = () => {
    const b = benefitInput.trim();
    if (!b) return;
    setForm(p => ({ ...p, benefits: [...p.benefits, b] }));
    setBenefitInput('');
  };

  const removeBenefit = (i) => setForm(p => ({ ...p, benefits: p.benefits.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, duration_minutes: form.duration_minutes ? parseInt(form.duration_minutes) : null });
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">{isCreate ? 'Novo Método' : 'Editar Método'}</span>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="label">Nome do método</label>
              <input className="input" type="text" placeholder="Ex: Técnica Pomodoro" value={form.name} onChange={set('name')} required />
            </div>

            <div className="form-group">
              <label className="label">Descrição</label>
              <textarea className="input" rows={3} placeholder="Descreva o método..." value={form.description} onChange={set('description')} required style={{ resize: 'vertical' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Categoria</label>
                <select className="input" value={form.category} onChange={set('category')}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Duração (minutos)</label>
                <input className="input" type="number" placeholder="Ex: 25" value={form.duration_minutes} onChange={set('duration_minutes')} min={1} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Ideal para</label>
              <input className="input" type="text" placeholder="Ex: Estudantes com dificuldade de foco" value={form.ideal_for} onChange={set('ideal_for')} />
            </div>

            <div className="form-group">
              <label className="label">Benefícios</label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <input className="input" type="text" placeholder="Adicionar benefício..." value={benefitInput} onChange={e => setBenefitInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addBenefit())} />
                <button type="button" className="btn btn-ghost btn-sm" onClick={addBenefit} style={{ whiteSpace: 'nowrap' }}>
                  <Plus size={14} /> Add
                </button>
              </div>
              {form.benefits.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.benefits.map((b, i) => (
                    <span key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 6, padding: '3px 8px', fontSize: 13 }}>
                      {b}
                      <button type="button" onClick={() => removeBenefit(i)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 0 }}>
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
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

export default MethodModal;
