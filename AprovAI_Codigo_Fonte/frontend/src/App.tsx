import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './Auth/contexts/AuthContext';
import ProtectedRoute from './components/shared/ProtectedRoute';
import PaginaLogin from './Auth/pages/PaginaLogin';
import PaginaRegistro from './Auth/pages/PaginaRegistro';
import PaginaPainel from './Auth/pages/PaginaPainel';
import PaginaUsuarios from './ManterUsuario/Pagina/ManterUsuarios';
import PaginaMetodos from './ManterMetodoEstudo/Pagina/ManterMetodoEstudoPagina';
import PaginaMaterias from './ManterMateria/Pagina/ManterMateriaPagina';
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
            <ProtectedRoute><PaginaUsuarios /></ProtectedRoute>
          } />

          <Route path="/methods" element={
            <ProtectedRoute><PaginaMetodos /></ProtectedRoute>
          } />

          <Route path="/subjects" element={
            <ProtectedRoute><PaginaMaterias /></ProtectedRoute>
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
