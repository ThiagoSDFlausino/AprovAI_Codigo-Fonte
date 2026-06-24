import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { BookOpen, Mail, Lock, User, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import AuthController from '../../Auth/Controller/AuthController';

const PaginaRegistro = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    name: '',
    email: location.state?.email || '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthController.handleRegister(formData, navigate, toast);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg)',
      backgroundImage: 'radial-gradient(ellipse at 80% 50%, rgba(167,139,250,0.05) 0%, transparent 60%)',
      padding: 24,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            width: 56, height: 56, background: 'var(--accent)', borderRadius: 14,
            display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            boxShadow: '0 0 0 8px rgba(167,139,250,0.12)',
          }}>
            <BookOpen size={26} color="#fff" />
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 700, marginBottom: 6 }}>Criar conta</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>Preencha os dados abaixo</p>
        </div>

        <div className="card" style={{ padding: 32 }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="label">Nome completo</label>
              <div style={{ position: 'relative' }}>
                <User size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type="text" placeholder="Seu nome" value={formData.name} onChange={set('name')} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type="email" placeholder="seu@email.com" value={formData.email} onChange={set('email')} autoComplete="email" />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type="password" placeholder="Mínimo 6 caracteres" value={formData.password} onChange={set('password')} />
              </div>
            </div>

            <div className="form-group">
              <label className="label">Confirmar senha</label>
              <div style={{ position: 'relative' }}>
                <Lock size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="input" style={{ paddingLeft: 36 }} type="password" placeholder="Repita a senha" value={formData.confirmPassword} onChange={set('confirmPassword')} />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ justifyContent: 'center', marginTop: 4, height: 44 }}>
              {loading ? <div className="spinner" /> : (<> Criar conta <ArrowRight size={16} /> </>)}
            </button>
          </form>

          <p style={{ textAlign: 'center', marginTop: 20, fontSize: 13, color: 'var(--text-secondary)' }}>
            Já tem conta?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', textDecoration: 'none', fontWeight: 500 }}>Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaginaRegistro;
