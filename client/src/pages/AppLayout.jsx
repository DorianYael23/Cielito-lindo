import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Importamos el Navbar

function AppLayout() {
  return (
    // CAMBIO 1: Añadimos 'flex flex-col'
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 relative overflow-hidden flex flex-col">
      
      {/* Decoraciones (sin z-index) */}
      <div className="absolute top-12 left-12 text-yellow-300 text-2xl opacity-40">✦</div>
      <div className="absolute top-32 right-24 text-yellow-200 text-xl opacity-30">✦</div>
      <div className="absolute bottom-32 left-32 text-yellow-300 text-lg opacity-40">✦</div>

      {/* 1. El Navbar (que tendrá z-30) */}
      <Navbar />

      {/* 2. El contenido (CAMBIO 2: Añadimos 'flex-1') */}
      {/* 'flex-1' le dice: "ocupa todo el espacio que sobre" */}
      <main className="relative max-w-7xl mx-auto p-6 pt-36 flex-1 w-full">
        <Outlet /> 
      </main>

      {/* 3. El Footer (SIN z-index) */}
      {/* Ahora será empujado al fondo por el 'flex-1' del main */}
      <div className="relative text-center py-6" 
           style={{ backgroundColor: 'rgba(92, 44, 12, 0.3)' }}>
        <p className="text-white font-medium">Cielito Lindo © 2024</p>
        <p className="text-white/80 text-lg mt-1">Sabor auténtico mexicano 🇲🇽</p>
      </div>
    </div>
  );
}

export default AppLayout;