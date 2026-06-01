// client/src/App.jsx

import React from 'react';
import { Routes, Route } from 'react-router-dom';

// Importamos las páginas
import LoginPage from './pages/LoginPage';
import AppLayout from './pages/AppLayout'; // La plantilla
import MenuPage from './pages/MenuPage';
import ReportesPage from './pages/ReportesPage';
import AdminProductos from './pages/AdminProductos';
import AdminUsuarios from './pages/AdminUsuarios'; // <-- 1. IMPORTA LA NUEVA PÁGINA

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas "dentro" del Layout (con Navbar y Fondo) */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<MenuPage />} />
        
        {/* Rutas de Admin */}
        <Route path="/reportes" element={<ReportesPage />} />
        <Route path="/admin-productos" element={<AdminProductos />} />
        <Route path="/admin-usuarios" element={<AdminUsuarios />} /> {/* <-- 2. AÑADE LA RUTA */}
      </Route>
      
    </Routes>
  );
}

export default App;