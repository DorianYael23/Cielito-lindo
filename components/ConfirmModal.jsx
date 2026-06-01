import React from 'react';
import { X, AlertTriangle, Trash2 } from 'lucide-react';

function ConfirmModal({ isOpen, onClose, onConfirm, title, message }) {
  if (!isOpen) return null;

  return (
    // Overlay con fondo naranja translúcido
    <div 
      className="fixed inset-0 flex justify-center items-center z-50"
      style={{backgroundColor: 'rgba(245, 138, 42, 0.4)'}}
      onClick={onClose}
    >
      {/* Modal */}
      <div 
        className="w-full max-w-md relative rounded-3xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header con advertencia */}
        <div 
          className="relative p-8 text-center"
          style={{
            background: 'linear-gradient(to bottom, #dc3545, #c82333)',
          }}
        >
          {/* Botón cerrar */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
          >
            <X size={20} className="text-white" />
          </button>

          {/* Decoraciones de advertencia */}
          <div className="absolute top-4 left-8 text-yellow-300 opacity-50 text-2xl">⚠️</div>
          <div className="absolute bottom-4 right-12 text-yellow-200 opacity-40 text-xl">⚠️</div>

          {/* Icono de advertencia */}
          <div className="flex flex-col items-center">
            <div 
              className="w-24 h-24 rounded-full bg-white shadow-2xl flex items-center justify-center mb-4 animate-pulse"
              style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
              }}
            >
              <AlertTriangle size={50} style={{color: '#dc3545'}} />
            </div>
            <h2 className="text-white text-2xl font-bold tracking-wide" style={{textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'}}>
              {title || '⚠️ Confirmar Acción'}
            </h2>
          </div>
        </div>

        {/* Contenido con fondo beige */}
        <div className="p-8" style={{backgroundColor: '#fdf5e6'}}>
          {/* Mensaje */}
          <div className="text-center mb-6">
            <p className="text-lg font-medium mb-2" style={{color: '#5c2c0c'}}>
              {message || '¿Estás seguro de realizar esta acción?'}
            </p>
            <p className="text-sm" style={{color: '#777'}}>
              Esta acción no se puede deshacer
            </p>
          </div>

          {/* Banner de advertencia */}
          <div 
            className="mb-6 p-4 rounded-xl flex items-center gap-3"
            style={{
              backgroundColor: '#fff3cd',
              borderLeft: '4px solid #ffc107'
            }}
          >
            <AlertTriangle size={20} style={{color: '#856404'}} />
            <p className="text-sm font-medium" style={{color: '#856404'}}>
              ⚡ Precaución: Esta operación es permanente
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border-2 font-bold transition-all hover:bg-gray-100"
              style={{
                borderColor: '#6c757d',
                color: '#6c757d',
                backgroundColor: 'white'
              }}
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 py-3 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
              style={{
                backgroundColor: '#dc3545'
              }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#c82333'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#dc3545'}
            >
              <Trash2 size={18} />
              <span>Eliminar</span>
            </button>
          </div>
        </div>

        {/* Footer decorativo */}
        <div 
          className="py-2 text-center text-xs font-medium"
          style={{
            backgroundColor: '#f8d7da',
            color: '#721c24'
          }}
        >
          🔒 Confirma tu decisión cuidadosamente
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
      `}</style>
    </div>
  );
}

export default ConfirmModal;