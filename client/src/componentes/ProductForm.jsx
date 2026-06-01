import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, UtensilsCrossed } from 'lucide-react'; // <-- Ícono de comida

function ProductForm({ productoAEditar, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    imagen_url: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    if (productoAEditar) {
      setFormData({
        nombre: productoAEditar.nombre,
        descripcion: productoAEditar.descripcion || '',
        precio: productoAEditar.precio,
        imagen_url: productoAEditar.imagen_url || ''
      });
    } else {
      setFormData({ nombre: '', descripcion: '', precio: '', imagen_url: '' });
    }
  }, [productoAEditar]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };

      if (productoAEditar) {
        await axios.put(
          `/api/productos/${productoAEditar.id}`,
          formData,
          config
        );
        onSave('✅ ¡Producto actualizado con éxito!'); // <-- Solo avisa
      } else {
        await axios.post(
          '/api/productos',
          formData,
          config
        );
        onSave('✅ ¡Producto creado con éxito!'); // <-- Solo avisa
      }
      
      // onClose(); // <-- LÍNEA ELIMINADA (MUY IMPORTANTE)

    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el producto');
      console.error(err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  return (
    // Overlay
    <div 
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{backgroundColor: 'rgba(245, 138, 42, 0.3)'}}
      onClick={onClose}
    >
      {/* Modal */}
      <div 
        className="w-full max-w-lg relative rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div 
          className="relative p-8 text-center"
          style={{
            background: 'linear-gradient(to bottom, #e09a6d, #c97b4f)',
          }}
        >
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X size={20} className="text-white" />
          </button>
          <div className="absolute top-4 left-8 text-yellow-300 opacity-40 text-2xl">❋</div>
          <div className="absolute bottom-4 right-12 text-yellow-200 opacity-30 text-xl">❋</div>
          {/* Icono y título */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 rounded-full bg-white shadow-lg flex items-center justify-center mb-4">
              {/* --- ÍCONO CAMBIADO --- */}
              <UtensilsCrossed size={40} style={{color: '#e09a6d'}} />
            </div>
            <h2 className="text-white text-2xl font-bold tracking-wide" style={{textShadow: '2px 2px 4px rgba(92, 44, 12, 0.5)'}}>
              {productoAEditar ? '✏️ Editar Producto' : '➕ Nuevo Producto'}
            </h2>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8" style={{backgroundColor: '#fdf5e6'}}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                Nombre del Producto
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                placeholder="Ej: Tacos al Pastor"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e09a6d',
                  color: '#5c2c0c'
                }}
              />
            </div>

            {/* Campo Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                Descripción
              </label>
              <textarea
                name="descripcion"
                id="descripcion"
                rows="3"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe tu delicioso platillo..."
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all resize-none"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e09a6d',
                  color: '#5c2c0c'
                }}
              />
            </div>

            {/* Campo Precio */}
            <div>
              <label htmlFor="precio" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                Precio
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 font-bold" style={{color: '#e09a6d'}}>
                  $
                </span>
                <input
                  type="number"
                  name="precio"
                  id="precio"
                  step="0.01"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#e09a6d',
                    color: '#5c2c0c'
                  }}
                />
              </div>
            </div>

            {/* Campo URL de Imagen */}
            <div>
              <label htmlFor="imagen_url" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                URL de Imagen (Opcional)
              </label>
              <input
                type="text"
                name="imagen_url"
                id="imagen_url"
                value={formData.imagen_url}
                onChange={handleChange}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e09a6d',
                  color: '#5c2c0c'
                }}
              />
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="text-center py-2 px-4 rounded-xl" style={{backgroundColor: '#ffebee', color: '#c62828'}}>
                <p className="text-sm font-medium">{error}</p>
              </div>
            )}

            {/* Botones */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-xl border-2 font-bold transition-all hover:bg-gray-100"
                style={{
                  borderColor: '#dc3545',
                  color: '#dc3545',
                  backgroundColor: 'white'
                }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
                style={{
                  backgroundColor: '#e09a6d'
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#c97b4f'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#e09a6d'}
              >
                <Save size={18} />
                <span>Guardar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;