import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Save, UserPlus, Shield } from 'lucide-react';

function UserForm({ usuarioAEditar, onClose, onSave }) {
  const [formData, setFormData] = useState({
    nombre_usuario: '',
    contrasena: '',
    rol: 'empleado'
  });
  const [error, setError] = useState(null);

  const isEditing = !!usuarioAEditar;

  useEffect(() => {
    if (isEditing) {
      setFormData({
        nombre_usuario: usuarioAEditar.nombre_usuario,
        contrasena: '',
        rol: usuarioAEditar.rol
      });
    } else {
      setFormData({ nombre_usuario: '', contrasena: '', rol: 'empleado' });
    }
  }, [usuarioAEditar, isEditing]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isEditing && !formData.contrasena) {
      setError('En modo Creación, la contraseña es obligatoria.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: { 'Authorization': `Bearer ${token}` }
      };
      
      const dataParaEnviar = { ...formData };
      if (isEditing && !dataParaEnviar.contrasena) {
        delete dataParaEnviar.contrasena;
      }

      if (isEditing) {
        await axios.put(
          `/api/usuarios/${usuarioAEditar.id}`,
          dataParaEnviar,
          config
        );
        onSave('✅ ¡Usuario actualizado con éxito!'); // <-- Solo avisa
      } else {
        await axios.post(
          '/api/register',
          dataParaEnviar,
          config
        );
        onSave('✅ ¡Usuario creado con éxito!'); // <-- Solo avisa
      }
      
      // onClose(); // <-- LÍNEA ELIMINADA (MUY IMPORTANTE)

    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar el usuario');
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
              {isEditing ? (
                <Shield size={40} style={{color: '#e09a6d'}} />
              ) : (
                <UserPlus size={40} style={{color: '#e09a6d'}} />
              )}
            </div>
            <h2 className="text-white text-2xl font-bold tracking-wide" style={{textShadow: '2px 2px 4px rgba(92, 44, 12, 0.5)'}}>
              {isEditing ? '✏️ Editar Usuario' : '👤 Nuevo Usuario'}
            </h2>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-8" style={{backgroundColor: '#fdf5e6'}}>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Campo Nombre de Usuario */}
            <div>
              <label htmlFor="nombre_usuario" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                Nombre de Usuario
              </label>
              <input
                type="text"
                name="nombre_usuario"
                id="nombre_usuario"
                value={formData.nombre_usuario}
                onChange={handleChange}
                required
                placeholder="Ej: juan_mesero"
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e09a6d',
                  color: '#5c2c0c'
                }}
              />
            </div>

            {/* Campo Contraseña */}
            <div>
              <label htmlFor="contrasena" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                Contraseña {!isEditing && <span style={{color: '#dc3545'}}>*</span>}
              </label>
              <input
                type="password"
                name="contrasena"
                id="contrasena"
                value={formData.contrasena}
                onChange={handleChange}
                required={!isEditing}
                placeholder={isEditing ? "Dejar vacío para no cambiar" : "Ingresa una contraseña"}
                className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all"
                style={{
                  backgroundColor: 'white',
                  borderColor: '#e09a6d',
                  color: '#5c2c0c'
                }}
              />
              {isEditing && (
                <small className="text-gray-600 text-xs mt-1 block">
                  💡 Dejar en blanco para no cambiar la contraseña
                </small>
              )}
            </div>

            {/* Campo Rol */}
            <div>
              <label htmlFor="rol" className="block text-sm font-bold mb-2" style={{color: '#5c2c0c'}}>
                Rol del Usuario
              </label>
              <div className="relative">
                <select
                  name="rol"
                  id="rol"
                  value={formData.rol}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border-2 focus:outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundColor: 'white',
                    borderColor: '#e09a6d',
                    color: '#5c2c0c'
                  }}
                >
                  <option value="empleado">👨‍🍳 Empleado</option>
                  <option value="admin">👑 Administrador</option>
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none" style={{color: '#e09a6d'}}>
                  ▼
                </div>
              </div>
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

export default UserForm;