import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { User, Lock } from 'lucide-react';
import logo from '../assets/logo.jpeg';

export default function LoginPage() {
  const [nombre_usuario, setNombreUsuario] = useState('');
  const [contrasena, setContrasena] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 🧠 Recuperar usuario guardado si se activó "Recordarme"
  useEffect(() => {
    const savedUser = localStorage.getItem('rememberedUser');
    if (savedUser) {
      setNombreUsuario(savedUser);
      setRemember(true);
    }
  }, []);

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setError(null);

    try {
      const respuesta = await axios.post('/api/login', {
        nombre_usuario,
        contrasena,
      });

      localStorage.setItem('token', respuesta.data.token);
      localStorage.setItem('rol', respuesta.data.rol);

      // 💾 Guardar o borrar el usuario según "Recordarme"
      if (remember) {
        localStorage.setItem('rememberedUser', nombre_usuario);
      } else {
        localStorage.removeItem('rememberedUser');
      }

      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-400 via-orange-500 to-orange-600 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Decoraciones */}
      <div className="absolute top-12 left-12 text-yellow-300 text-2xl opacity-60">✦</div>
      <div className="absolute top-32 right-24 text-yellow-200 text-xl opacity-50">✦</div>
      <div className="absolute bottom-32 left-32 text-yellow-300 text-lg opacity-60">✦</div>

      {/* Contenedor principal */}
      <div className="w-full max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl">
        <div className="bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
          
          {/* Header con logo */}
          <div className="relative h-80 bg-gradient-to-b from-orange-500 via-orange-400 to-orange-300 overflow-hidden p-8">
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-48 h-48 rounded-full shadow-2xl flex items-center justify-center mb-4 relative border-4 border-orange-600 overflow-hidden">
                <img src={logo} alt="Logo Cielito Lindo" className="w-full h-full object-cover" />
              </div>
              <h1 className="text-white text-2xl font-bold tracking-wide" style={{color: '#fdf5e6'}}>Bienvenido</h1>
              <p className="text-white/90 text-lg mt-1" style={{color: '#fdf5e6'}}>Ingresa a tu cuenta</p>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-10 rounded-t-3xl -mt-8 relative z-10" style={{backgroundColor: '#fdf5e6'}}>
            <h2 className="text-2xl font-bold text-center mb-8 tracking-wide" style={{color: '#5c2c0c'}}>
              INICIAR SESIÓN
            </h2>
            
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Usuario */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <User className="text-white w-5 h-5" />
                </div>
                <input
                  type="text"
                  placeholder="Usuario"
                  value={nombre_usuario}
                  onChange={(e) => setNombreUsuario(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 text-white placeholder-white/70 rounded-full focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#e09a6d' }}
                />
              </div>
              
              {/* Contraseña */}
              <div className="relative">
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                  <Lock className="text-white w-5 h-5" />
                </div>
                <input
                  type="password"
                  placeholder="Contraseña"
                  value={contrasena}
                  onChange={(e) => setContrasena(e.target.value)}
                  required
                  className="w-full pl-12 pr-4 py-4 text-white placeholder-white/70 rounded-full focus:outline-none focus:ring-2"
                  style={{ backgroundColor: '#e09a6d' }}
                />
              </div>
              
              {/* Error */}
              {error && (
                <div className="text-center py-2 px-4 rounded-full" style={{backgroundColor: '#ffebee', color: '#c62828'}}>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              {/* Checkbox Recordarme */}
              <div className="flex items-center text-sm px-2">
                <label className="flex items-center space-x-2 cursor-pointer" style={{color: '#5c2c0c'}}>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(e) => setRemember(e.target.checked)}
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{ accentColor: '#e09a6d' }}
                  />
                  <span className="font-medium">Recordarme</span>
                </label>
              </div>

              {/* Botón Login */}
              <div className="flex justify-center pt-4">
                <button
                  type="submit"
                  className="px-20 py-3 text-white rounded-full transition-all duration-200 shadow-lg font-bold text-lg hover:shadow-xl transform hover:scale-105"
                  style={{ backgroundColor: '#e09a6d' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#c97b4f'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#e09a6d'}
                >
                  ENTRAR
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-sm" style={{color: '#fdf5e6'}}>
          <p className="font-medium">Cielito Lindo © 2024</p>
          <p className="text-lg opacity-100 mt-1">Sabor auténtico mexicano</p>
        </div>
      </div>
    </div>
  );
}
