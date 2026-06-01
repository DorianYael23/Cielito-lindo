// client/src/pages/MenuPage.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react'; // Ya no se necesita LogOut
import ProductCard from '../components/ProductCard';
import ShoppingCart from '../components/ShoppingCart'; 
// Ya no se importa 'logo'

function MenuPage() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Tu useEffect para cargar productos (sin cambios)
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No hay token, redirigiendo a login');
          navigate('/login');
          return;
        }
        const respuesta = await axios.get('/api/productos');
        setProductos(respuesta.data);
      } catch (err) {
        console.error('Error al obtener productos:', err);
        setError('No se pudieron cargar los productos.');
      }
    };
    fetchProductos();
  }, [navigate]);

  // handleLogout() se eliminó (ahora está en Navbar.jsx)

  // Tu manejo de error (sin cambios)
  if (error) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
        <p className="text-white text-xl font-bold">{error}</p>
      </div>
    );
  }

  // EL RETURN AHORA ES SÚPER SIMPLE
  // Ya no tiene el div de fondo, ni el Header, ni el Footer.
  // Solo el layout de 2 columnas.
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      
      {/* Columna de Productos */}
      <div className="flex-grow lg:w-2/3">
        <div className="mb-6">
          <h2 className="text-white text-3xl font-bold text-center mb-2" 
              style={{ textShadow: '2px 2px 4px rgba(92, 44, 12, 0.5)' }}>
            🌮 Nuestros Antojitos 🌮
          </h2>
          <div className="flex justify-center">
            <div className="h-1 w-32 rounded-full" style={{ backgroundColor: '#fdf5e6' }}></div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {productos.map((producto) => (
            <ProductCard key={producto.id} product={producto} />
          ))}
        </div>
      </div>

      {/* Columna del Carrito */}
      <div className="lg:w-1/3">
        <div className="sticky top-28"> {/* Se pega 28 unidades desde el top (gracias al pt-36 del layout) */}
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 flex items-center gap-3" 
                 style={{ backgroundColor: 'rgba(92, 44, 12, 0.4)' }}>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" 
                   style={{ backgroundColor: '#e09a6d' }}>
                <ShoppingBag className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-white font-bold text-xl">Pedido actual</h3>
            </div>
            <div className="p-4" style={{ backgroundColor: '#fdf5e6' }}>
              <ShoppingCart />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default MenuPage;