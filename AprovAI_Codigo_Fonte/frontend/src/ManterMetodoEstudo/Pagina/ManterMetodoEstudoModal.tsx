import React, { useState, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import MetodoEstudoController from '../Controller/ManterMetodoEstudoController';

const MethodModal = ({ method, onSave, onClose, isCreate }) => {
  const categories = MetodoEstudoController.getCategories().filter(c => c.value !== 'all');
  const [form, setForm] = useState({
    nome: '', descricao: '', categoria: 'focus',
    duracao: '', beneficios: [], ideal_para: '',
  });
  const [benefitInput, setBenefitInput] = useState('');

  useEffect(() => {
    if (method) {
      setForm({
        nome: method.nome || '',
        descricao: method.descricao || '',
        categoria: method.categoria || 'focus',
        duracao: method.duracao || '',
        beneficios: method.beneficios || [],
        ideal_para: method.ideal_para || '',
      });
    }
  }, [method]);

  const set = f => e => setForm(p => ({ ...p, [f]: e.target.value }));

  const addBenefit = () => {
    const b = benefitInput.trim();
    if (!b) return;
    setForm(p => ({ ...p, beneficios: [...p.beneficios, b] }));
    setBenefitInput('');
  };

  const removeBenefit = (i) => setForm(p => ({ ...p, beneficios: p.beneficios.filter((_, idx) => idx !== i) }));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...form, duracao: form.duracao ? parseInt(form.duracao) : null });
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
              <input className="input" type="text" placeholder="Ex: Técnica Pomodoro" value={form.nome} onChange={set('nome')} required />
            </div>

            <div className="form-group">
              <label className="label">Descrição</label>
              <textarea className="input" rows={3} placeholder="Descreva o método..." value={form.descricao} onChange={set('descricao')} required style={{ resize: 'vertical' }} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="label">Categoria</label>
                <select className="input" value={form.categoria} onChange={set('categoria')}>
                  {categories.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="label">Duração (minutos)</label>
                <input className="input" type="number" placeholder="Ex: 25" value={form.duracao} onChange={set('duracao')} min={1} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Ideal para</label>
              <input className="input" type="text" placeholder="Ex: Estudantes com dificuldade de foco" value={form.ideal_para} onChange={set('ideal_para')} />
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
              {form.beneficios.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {form.beneficios.map((b, i) => (
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
