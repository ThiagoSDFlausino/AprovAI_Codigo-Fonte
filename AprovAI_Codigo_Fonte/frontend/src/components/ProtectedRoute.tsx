import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../Auth/contexts/AuthContext';
import { normalizarPerfil, Perfil } from '../classes';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (adminOnly && normalizarPerfil(profile?.perfil) !== Perfil.Adm) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default ProtectedRoute;
