import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ShieldCheck, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/shared/Navbar';

const PaginaPainel = () => {
  const { profile, isAdm, isProfessor, isAluno } = useAuth();

  const cards = [
    isAdm && {
      title: 'Métodos de Estudo',
      desc: 'Crie, edite e remova métodos de estudo do sistema.',
      icon: <BookOpen size={22} />,
      color: 'var(--primary)',
      bg: 'var(--primary-glow)',
      to: '/methods',
      label: 'Gerenciar métodos',
    },
    isAdm && {
      title: 'Usuários',
      desc: 'Crie, edite e remova contas de usuários.',
      icon: <Users size={22} />,
      color: 'var(--accent)',
      bg: 'rgba(167,139,250,0.12)',
      to: '/users',
      label: 'Gerenciar usuários',
    },
    (isAdm || isProfessor || isAluno) && {
      title: 'Matérias',
      desc: isProfessor
        ? 'Crie, edite e remova matérias do sistema.'
        : 'Visualize as matérias criadas pelos professores.',
      icon: <GraduationCap size={22} />,
      color: 'var(--success)',
      bg: 'rgba(52,211,153,0.12)',
      to: '/materias',
      label: isProfessor ? 'Gerenciar matérias' : 'Ver matérias',
    },
  ].filter(Boolean) as Array<{
    title: string;
    desc: string;
    icon: React.ReactNode;
    color: string;
    bg: string;
    to: string;
    label: string;
  }>;

  const roleLabel = isAdm ? 'Administrador' : isProfessor ? 'Professor' : 'Aluno';

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>
              Olá, {profile?.nome?.split(' ')[0] || 'usuário'} 👋
            </h1>
            {(isAdm || isProfessor) && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(167,139,250,0.15)', color: 'var(--accent)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                <ShieldCheck size={13} /> {roleLabel}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            Bem-vindo ao painel do AprovAI.
          </p>
          {isAdm && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10, maxWidth: 640, lineHeight: 1.6 }}>
              Como <strong style={{ color: 'var(--text-secondary)' }}>administrador</strong>, você pode gerenciar{' '}
              <strong>métodos de estudo</strong>, <strong>usuários</strong> e visualizar as{' '}
              <strong>matérias</strong> criadas pelos professores.
            </p>
          )}
          {isProfessor && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10, maxWidth: 640, lineHeight: 1.6 }}>
              Como <strong style={{ color: 'var(--text-secondary)' }}>professor</strong>, você pode criar e gerenciar{' '}
              <strong>matérias</strong> no sistema.
            </p>
          )}
          {isAluno && (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10, maxWidth: 640, lineHeight: 1.6 }}>
              Como <strong style={{ color: 'var(--text-secondary)' }}>aluno</strong>, você pode consultar as{' '}
              <strong>matérias</strong> disponíveis.
            </p>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {cards.map((card) => (
            <div key={card.to} className="card" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 48, height: 48, background: card.bg, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color }}>
                  {card.icon}
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 16 }}>{card.title}</div>
                </div>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: 14, flex: 1 }}>{card.desc}</p>
              <Link to={card.to} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-start' }}>
                {card.label} <ArrowRight size={14} />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PaginaPainel;
