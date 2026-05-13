// src/components/shared/Navbar.js
import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { BookOpen, Users, LogOut, LayoutDashboard, ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import AuthController from '../../controllers/AuthController';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { profile, isAdmin, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => AuthController.handleLogout(navigate, toast);

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={16} /> },
    { to: '/methods', label: 'Métodos', icon: <BookOpen size={16} /> },
    { to: '/users', label: 'Usuários', icon: <Users size={16} /> },
  ];

  return (
    <header style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 100,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', gap: 32, height: 60,
      }}>
        {/* Logo */}
        <Link to="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34, height: 34, background: 'var(--primary)',
            borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BookOpen size={18} color="#fff" />
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: 'var(--text)' }}>AprovAI</span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: 4, flex: 1 }}>
          {navLinks.map(link => {
            const active = location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '6px 14px', borderRadius: 8, textDecoration: 'none',
                  fontSize: 14, fontWeight: active ? 600 : 400,
                  color: active ? 'var(--primary)' : 'var(--text-secondary)',
                  background: active ? 'var(--primary-glow)' : 'transparent',
                  transition: 'all 0.15s',
                }}
              >
                {link.icon} {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isAdmin && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--accent)' }}>
              <ShieldCheck size={14} />
              <span>Admin</span>
            </div>
          )}
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            {profile?.name || profile?.email}
          </div>
          <button
            type="button"
            className="btn-icon"
            title="Recarregar perfil (útil após mudar role no Supabase)"
            onClick={async () => {
              await refreshProfile();
              toast.success('Perfil atualizado.');
            }}
          >
            <RefreshCw size={16} />
          </button>
          <button onClick={handleLogout} className="btn-icon" title="Sair">
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
