import React from 'react';
import { X, CheckCircle } from 'lucide-react';

// Este es el modal de "Éxito" que pediste
function AlertModal({ title = "¡Éxito!", message, onClose }) {
  return (
    // Overlay
    <div
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{ backgroundColor: 'rgba(245, 138, 42, 0.3)' }}
      onClick={onClose}
    >
      {/* Contenido del Modal */}
      <div
        className="w-full max-w-md relative rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Naranja */}
        <div
          className="relative p-6 text-center"
          style={{
            background: 'linear-gradient(to bottom, #e09a6d, #c97b4f)',
          }}
        >
          {/* Botón cerrar (opcional, pero bueno tenerlo) */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X size={18} className="text-white" />
          </button>

          {/* Icono de Éxito */}
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full bg-white shadow-lg flex items-center justify-center mb-3">
              <CheckCircle size={32} style={{ color: '#28a745' }} />
            </div>
            <h2 className="text-white text-2xl font-bold" style={{ textShadow: '2px 2px 4px rgba(92, 44, 12, 0.5)' }}>
              {title}
            </h2>
          </div>
        </div>

        {/* Mensaje y Botón */}
        <div className="p-6 text-center" style={{ backgroundColor: '#fdf5e6' }}>
          <p className="text-lg mb-6" style={{ color: '#5c2c0c' }}>
            {message}
          </p>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            style={{
              backgroundColor: '#007bff', // Azul, como el del modal de error OK
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#0056b3'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#007bff'}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );
}

export default AlertModal;