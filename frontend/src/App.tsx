import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import { Permissao } from './classes';
import PaginaLogin from './pages/PaginaLogin';
import PaginaRegistro from './pages/PaginaRegistro';
import PaginaPainel from './pages/PaginaPainel';
import PaginaUsuarios from './pages/PaginaUsuarios';
import PaginaMetodos from './pages/PaginaMetodos';
import PaginaMaterias from './pages/PaginaMaterias';
import './styles/global.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<PaginaLogin />} />
          <Route path="/register" element={<PaginaRegistro />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><PaginaPainel /></ProtectedRoute>
          } />

          <Route path="/users" element={
            <ProtectedRoute allowedPermissoes={[Permissao.ADM]}>
              <PaginaUsuarios />
            </ProtectedRoute>
          } />

          <Route path="/methods" element={
            <ProtectedRoute allowedPermissoes={[Permissao.ADM]}>
              <PaginaMetodos />
            </ProtectedRoute>
          } />

          <Route path="/materias" element={
            <ProtectedRoute allowedPermissoes={[Permissao.ADM, Permissao.Professor, Permissao.Aluno]}>
              <PaginaMaterias />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              fontFamily: 'Sora, sans-serif',
              fontSize: 14,
            },
            success: { iconTheme: { primary: 'var(--success)', secondary: '#fff' } },
            error: { iconTheme: { primary: 'var(--danger)', secondary: '#fff' } },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}
export default App;
