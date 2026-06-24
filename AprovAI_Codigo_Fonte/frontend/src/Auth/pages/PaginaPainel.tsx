import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Users, ShieldCheck, ArrowRight, GraduationCap } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../../components/shared/Navbar';

const PaginaPainel = () => {
  const { profile, isAdmin, isProfessor } = useAuth();

  const cards = [
    {
      title: 'Métodos de Estudo',
      desc: isAdmin ? 'Gerencie todos os métodos cadastrados no sistema.' : 'Explore os métodos disponíveis para potencializar seus estudos.',
      icon: <BookOpen size={22} />,
      color: 'var(--primary)',
      bg: 'var(--primary-glow)',
      to: '/methods',
      label: isAdmin ? 'Gerenciar métodos' : 'Ver métodos',
    },
    {
      title: 'Matérias',
      desc: isProfessor ? 'Crie, edite e remova matérias cadastradas.' : 'Visualize as matérias disponíveis no sistema.',
      icon: <GraduationCap size={22} />,
      color: 'var(--success)',
      bg: 'rgba(52,211,153,0.12)',
      to: '/subjects',
      label: isProfessor ? 'Gerenciar matérias' : 'Ver matérias',
    },
    {
      title: 'Usuários',
      desc: isAdmin ? 'Crie, edite e remova contas de usuários.' : 'Visualize a lista de usuários cadastrados.',
      icon: <Users size={22} />,
      color: 'var(--accent)',
      bg: 'rgba(167,139,250,0.12)',
      to: '/users',
      label: isAdmin ? 'Gerir utilizadores' : 'Ver utilizadores',
    },
  ];

  return (
    <div className="page">
      <Navbar />
      <div className="page-content">
        {/* Welcome */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700 }}>
              Olá, {profile?.nome?.split(' ')[0] || 'usuário'} 👋
            </h1>
            {isAdmin && (
              <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(167,139,250,0.15)', color: 'var(--accent)', borderRadius: 6, padding: '3px 10px', fontSize: 12, fontWeight: 600 }}>
                <ShieldCheck size={13} /> Admin
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
            {isAdmin ? 'Você tem acesso completo ao sistema.' : 'Bem-vindo ao painel do AprovAI.'}
          </p>
          {isAdmin ? (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10, maxWidth: 640, lineHeight: 1.6 }}>
              Como <strong style={{ color: 'var(--text-secondary)' }}>admin</strong> pode: criar e editar{' '}
              <strong>métodos de estudo</strong>, criar e editar <strong>utilizadores</strong>, e apagar registos
              permitidos pelas políticas do Supabase. Utilize <strong>Métodos</strong> e <strong>Utilizadores</strong> na barra superior.
            </p>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 13, marginTop: 10, maxWidth: 640, lineHeight: 1.6 }}>
              Conta <strong>standard</strong>: pode ver métodos e a lista de utilizadores. Para criar métodos ou
              utilizadores, peça a um administrador para promover o seu e-mail a <strong>admin</strong> no Supabase
              (SQL no README: secção &quot;Crie o primeiro Admin&quot;).
            </p>
          )}
        </div>

        {/* Cards */}
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
