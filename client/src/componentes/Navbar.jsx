import React, { useState } from 'react'; // <-- 1. Importar useState
import { useNavigate, Link } from 'react-router-dom';
import { 
  LogOut, 
  LayoutDashboard, 
  ClipboardList, 
  Users, 
  ShoppingBag,
  Menu, // <-- 2. Importar el ícono de Menú
  X // <-- Para cerrar el menú
} from 'lucide-react';

function Navbar() {
  const navigate = useNavigate();
  const userRol = localStorage.getItem('rol');

  // --- 3. NUEVO ESTADO para el menú móvil ---
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    navigate('/login');
  };

  // Función para cerrar el menú móvil (útil al hacer clic en un enlace)
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    // Z-index 30 para estar sobre el contenido pero debajo de los modals (z-50)
    // Agregamos 'relative' para que el menú móvil se posicione correctamente
    <div className="fixed top-0 left-0 w-full z-30 px-4 py-4 shadow-lg backdrop-blur-sm"
         style={{ backgroundColor: 'rgba(92, 44, 12, 0.5)' }}>
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* Logo (Sin cambios) */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-orange-500 rounded-full shadow-xl flex items-center justify-center border-4 border-orange-600">
            <span className="text-2xl">🌮</span>
          </div>
          <div>
            <h1 className="text-white font-bold text-2xl tracking-wide" style={{ textShadow: '2px 2px 4px rgba(92, 44, 12, 0.5)' }}>
              CIELITO LINDO
            </h1>
            <p className="text-white/90 text-sm">Panel de pedidos</p>
          </div>
        </div>


        {/* --- 4. BOTONES DE NAVEGACIÓN (ESCRITORIO) --- */}
        {/* Ocultos en móvil ('hidden'), visibles en desktop ('md:flex') */}
        <div className="hidden md:flex items-center gap-4">
          
          {/* Enlaces solo para Admin */}
          {userRol === 'admin' && (
            <>
              {/* Botón para volver al TPV (Punto de Venta) */}
              <Link
                to="/"
                className="flex items-center gap-2 px-4 py-2 bg-green-600 rounded-full text-white font-medium hover:bg-green-700 transition-all shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>TPV (Vender)</span>
              </Link>
              
              <div className="w-px h-6 bg-white/20"></div>

              <Link
                to="/admin-usuarios"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 font-medium hover:bg-white/20 transition-all"
              >
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </Link>
              <Link
                to="/admin-productos"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 font-medium hover:bg-white/20 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Productos</span>
              </Link>
              <Link
                to="/reportes"
                className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-white/90 font-medium hover:bg-white/20 transition-all"
              >
                <ClipboardList className="w-5 h-5" />
                <span>Reportes</span>
              </Link>
            </>
          )}
          
          {/* Botón de salir */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-white/20 rounded-full text-white font-bold hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>

        {/* --- 5. BOTÓN DE MENÚ MÓVIL (HAMBURGUESA) --- */}
        {/* Visible en móvil ('md:hidden') */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-white p-2 rounded-md hover:bg-white/10"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

      </div>

      {/* --- 6. MENÚ DESPLEGABLE MÓVIL --- */}
      {/* Se muestra solo en móvil (md:hidden) y si isMobileMenuOpen es true */}
      <div 
        className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} absolute top-full left-0 w-full shadow-lg`}
        style={{ backgroundColor: 'rgba(92, 44, 12, 0.95)' }} // Fondo más opaco
      >
        <div className="max-w-7xl mx-auto flex flex-col gap-3 p-4">
          
          {userRol === 'admin' && (
            <>
              <Link
                to="/"
                onClick={closeMobileMenu} // Cierra el menú al hacer clic
                className="flex items-center justify-center gap-2 px-4 py-3 bg-green-600 rounded-full text-white font-medium hover:bg-green-700 transition-all shadow-md"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>TPV (Vender)</span>
              </Link>
              
              <div className="w-full h-px bg-white/20 my-2"></div>

              <Link
                to="/admin-usuarios"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 rounded-full text-white/90 font-medium hover:bg-white/20 transition-all"
              >
                <Users className="w-5 h-5" />
                <span>Usuarios</span>
              </Link>
              <Link
                to="/admin-productos"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 rounded-full text-white/90 font-medium hover:bg-white/20 transition-all"
              >
                <LayoutDashboard className="w-5 h-5" />
                <span>Productos</span>
              </Link>
              <Link
                to="/reportes"
                onClick={closeMobileMenu}
                className="flex items-center justify-center gap-2 px-4 py-3 bg-white/10 rounded-full text-white/90 font-medium hover:bg-white/20 transition-all"
              >
                <ClipboardList className="w-5 h-5" />
                <span>Reportes</span>
              </Link>

              <div className="w-full h-px bg-white/20 my-2"></div>
            </>
          )}
          
          <button
            onClick={() => {
              closeMobileMenu();
              handleLogout();
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-white/20 rounded-full text-white font-bold hover:bg-white/30 transition-all duration-200 shadow-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>

    </div>
  );
}

export default Navbar;