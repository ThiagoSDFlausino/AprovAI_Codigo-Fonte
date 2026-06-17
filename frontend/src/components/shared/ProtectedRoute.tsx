
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Permissao } from '../../classes';

type ProtectedRouteProps = {
  children: React.ReactElement;
  allowedPermissoes?: Permissao[];
};

const ProtectedRoute = ({ children, allowedPermissoes }: ProtectedRouteProps): React.ReactElement => {
  const { user, permissao, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
        <div className="spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  if (allowedPermissoes) {
    const papel = permissao ?? Permissao.Aluno;
    if (!allowedPermissoes.includes(papel)) {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
};

export default ProtectedRoute;
