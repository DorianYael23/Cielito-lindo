import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import axios from 'axios';
import { Trash2, DollarSign, ClipboardCheck, XCircle, CheckCircle, Printer, AlertTriangle, Loader2 } from 'lucide-react'; // <-- Importé Loader2

function ShoppingCart() {
  const { cartItems, restarDelCarrito, limpiarCarrito } = useCart();
  const [mensaje, setMensaje] = useState('');
  const [mostrarModal, setMostrarModal] = useState(false);
  const [animarModal, setAnimarModal] = useState(false);
  const [ventaRegistrada, setVentaRegistrada] = useState(null);

  // --- 1. NUEVOS ESTADOS PARA EL MODAL DE DOS PASOS ---
  const [modalView, setModalView] = useState('confirm'); // 'confirm', 'success'
  const [isCobrando, setIsCobrando] = useState(false); // Para el spinner

  const [mostrarModalError, setMostrarModalError] = useState(false);
  const [mensajeModalError, setMensajeModalError] = useState('');
  
  const total = cartItems.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

  const confirmarVenta = () => {
    if (cartItems.length === 0) {
      setMensajeModalError('El pedido está vacío. Agrega productos antes de cobrar.');
      setMostrarModalError(true);
    } else {
      // --- 2. REINICIAMOS LOS ESTADOS DEL MODAL ---
      setVentaRegistrada(null);
      setModalView('confirm'); // Siempre volvemos a la vista de confirmación
      setIsCobrando(false);
      setMostrarModal(true);
      setTimeout(() => setAnimarModal(true), 50);
    }
  };
  
  const cerrarModal = () => {
    setAnimarModal(false);
    // Reiniciamos la vista del modal al cerrar
    setTimeout(() => {
      setMostrarModal(false);
      // --- ¡¡LÓGICA MOVIDA AQUÍ!! ---
      // Si la vista que estamos cerrando es la de "éxito",
      // AHORA SÍ limpiamos el carrito.
      if (modalView === 'success') {
        limpiarCarrito();
      }
      setModalView('confirm');
    }, 200);
  };

  const cerrarModalError = () => {
    setMostrarModalError(false);
    setMensajeModalError('');
  };

  const handleCobrar = async () => {
    setMensaje(''); // <-- Esto lo dejamos para limpiar errores viejos
    setIsCobrando(true); // <-- 3. Mostramos el spinner
    // NO cerramos el modal aquí

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMensaje('Error: No estás autenticado.');
        setIsCobrando(false);
        cerrarModal();
        return;
      }

      const respuesta = await axios.post(
        '/api/ventas',
        { carrito: cartItems, total },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // --- 4. ¡ÉXITO! ACTUALIZAMOS EL ESTADO Y CAMBIAMOS LA VISTA ---
      setVentaRegistrada(respuesta.data.id_venta);
      // setMensaje(`✅ Venta #${respuesta.data.id_venta} registrada con éxito`); // <--- ¡¡QUITAMOS ESTA LÍNEA!!
      setModalView('success'); // <-- CAMBIAMOS A LA VISTA DE ÉXITO
      setIsCobrando(false); // <-- Ocultamos el spinner
      
      // setTimeout(() => setMensaje(''), 4000); // <--- ¡¡Y ESTA OTRA!!

    } catch (error) {
      console.error('Error al cobrar:', error.response?.data?.message || error.message);
      setMensaje(error.response?.data?.message || 'Error al conectar con el servidor.');
      
      // Si hay error, sí cerramos el modal
      setIsCobrando(false);
      cerrarModal(); 
      setTimeout(() => setMensaje(''), 4000);
    }
  };

  // La impresión no cambia, pero ahora se llama en el momento correcto
  const imprimirTicket = () => {
    const now = new Date();
    const fecha = now.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    const hora = now.toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    const printWindow = window.open('', '', 'width=1000,height=800');
    
    const contenido = `
      <!DOCTYPE html>
      <html lang="es">
      <head>
        <meta charset="UTF-8" />
        <title>Ticket de Venta</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body {
            font-family: 'Courier New', monospace;
            padding: 20px;
            max-width: 300px;
            margin: 0 auto;
            background-color: #fff;
            color: #000;
          }
          .header {
            text-align: center;
            margin-bottom: 15px;
            border-bottom: 2px dashed #000;
            padding-bottom: 10px;
          }
          h2 {
            color: #c44d00;
            font-size: 24px;
            margin-bottom: 5px;
          }
          .info { margin-bottom: 15px; font-size: 12px; }
          .info p { margin: 3px 0; }
          table { width: 100%; border-collapse: collapse; margin: 15px 0; font-size: 12px; }
          th { text-align: left; border-bottom: 1px solid #000; padding: 5px 0; }
          td { padding: 5px 0; border-bottom: 1px dashed #ccc; }
          .text-right { text-align: right; }
          tfoot td {
            font-weight: bold;
            border-top: 2px solid #000;
            border-bottom: 2px solid #000;
            padding: 8px 0;
            font-size: 14px;
          }
          .footer {
            text-align: center;
            margin-top: 20px;
            font-size: 11px;
            border-top: 2px dashed #000;
            padding-top: 10px;
          }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <h2>🌮 Cielito Lindo 🌮</h2>
          <p style="font-size: 11px;">Sabor auténtico mexicano</p>
        </div>

        <div class="info">
          <p><strong>Venta #${ventaRegistrada || '---'}</strong></p>
          <p><strong>Fecha:</strong> ${fecha}</p>
          <p><strong>Hora:</strong> ${hora}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th class="text-right">Cant.</th>
              <th class="text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            ${cartItems.map(i => `
              <tr>
                <td>${i.nombre}</td>
                <td class="text-right">${i.cantidad}</td>
                <td class="text-right">$${(i.precio * i.cantidad).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2"><strong>TOTAL</strong></td>
              <td class="text-right"><strong>$${total.toFixed(2)}</strong></td>
            </tr>
          </tfoot>
        </table>

        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>Vuelva pronto 😊</p>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(contenido);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div style={styles.cartContainer}>
      <h2 style={styles.title}>🧾 Productos</h2>

      <div style={styles.itemList}>
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div key={item.id} style={styles.item}>
              <div style={styles.itemInfo}>
                <span style={styles.itemName}>
                  {item.nombre} <span style={styles.itemQty}>x{item.cantidad}</span>
                </span>
                <span style={styles.itemPrice}>${(item.precio * item.cantidad).toFixed(2)}</span>
              </div>
              <button
                style={{ ...styles.removeButton, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'scale(1.1)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
                onClick={() => restarDelCarrito(item.id)}
                title="Eliminar del pedido"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))
        ) : (
          <p style={styles.emptyText}>No hay productos agregados</p>
        )}

        {mensaje && <p style={styles.message(mensaje.startsWith('✅'))}>{mensaje}</p>}
      </div>

      <div style={styles.footer}>
        <div style={styles.totalRow}>
          <span style={styles.totalLabel}>Total:</span>
          <span style={styles.totalAmount}>${total.toFixed(2)}</span>
        </div>
        <button
          style={{ ...styles.checkoutButton, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.03)';
            e.currentTarget.style.boxShadow = '0 6px 10px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={confirmarVenta}
        >
          <DollarSign size={18} />
          <span>Cobrar / Registrar Venta</span>
        </button>
        <button
          style={{ ...styles.clearButton, transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.05)';
            e.currentTarget.style.boxShadow = '0 4px 8px rgba(220,53,69,0.3)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}
          onClick={limpiarCarrito}
        >
          <ClipboardCheck size={16} />
          <span>Vaciar Pedido</span>
        </button>
      </div>

      {/* --- 6. MODAL ACTUALIZADO --- */}
      {mostrarModal && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalContent,
              transform: animarModal ? 'scale(1)' : 'scale(0.9)',
              opacity: animarModal ? 1 : 0,
              transition: 'all 0.2s ease-out',
            }}
          >
            {/* VISTA 1: Confirmación */}
            {modalView === 'confirm' && (
              <>
                <h3 style={styles.modalTitle}>¿Confirmar venta?</h3>
                <p style={styles.modalText}>
                  Registrarás una venta por <strong>${total.toFixed(2)}</strong>.
                </p>
                
                {/* Mostramos spinner si está cobrando */}
                {isCobrando && (
                  <div style={styles.spinnerContainer}>
                    <Loader2 size={32} className="animate-spin" style={{color: '#ffa460'}}/>
                    <p style={{color: '#5c2c0c', fontSize: '0.9rem'}}>Registrando...</p>
                  </div>
                )}

                <div style={styles.modalActions}>
                  {/* Deshabilitamos botones mientras cobra */}
                  <button style={styles.modalConfirm} onClick={handleCobrar} disabled={isCobrando}>
                    <CheckCircle size={18} />
                    <span>Confirmar</span>
                  </button>
                  <button style={styles.modalCancel} onClick={cerrarModal} disabled={isCobrando}>
                    <XCircle size={18} />
                    <span>Cancelar</span>
                  </button>
                </div>
              </>
            )}

            {/* VISTA 2: Éxito */}
            {modalView === 'success' && (
              <>
                <h3 style={{...styles.modalTitle, color: '#28a745'}}>
                  <CheckCircle size={22} style={{verticalAlign: 'bottom', marginRight: '8px'}} />
                  ¡Venta Registrada!
                </h3>
                <p style={styles.modalText}>
                  Venta <strong>#{ventaRegistrada}</strong> registrada con éxito.
                </p>
                <div style={styles.modalActions}>
                  <button style={styles.modalPrint} onClick={imprimirTicket}>
                    <Printer size={18} />
                    <span>Imprimir Ticket</span>
                  </button>
                  <button style={styles.modalOK} onClick={cerrarModal}>
                    <CheckCircle size={18} />
                    <span>Aceptar</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Modal de Error (Sin cambios) */}
      {mostrarModalError && (
        <div style={styles.modalOverlay}>
          <div
            style={{
              ...styles.modalContent,
              transform: 'scale(1)',
              opacity: 1,
              transition: 'all 0.2s ease-out',
              borderColor: '#f5c6cb',
              borderWidth: '3px',
              borderStyle: 'solid'
            }}
          >
            <h3 style={{...styles.modalTitle, color: '#dc3545'}}>
              <AlertTriangle size={22} style={{verticalAlign: 'bottom', marginRight: '8px'}} />
              Atención
            </h3>
            <p style={styles.modalText}>
              {mensajeModalError}
            </p>
            <div style={styles.modalActions}>
              <button style={styles.modalOK} onClick={cerrarModalError}>
                <CheckCircle size={18} />
                <span>Aceptar</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- 7. ESTILOS ACTUALIZADOS ---
// (Añadí el color naranja pastel de tu proyecto y el spinner)
const styles = {
  cartContainer: {
    backgroundColor: '#fff',
    color: '#2c2c2c',
    padding: '1.5rem',
    borderRadius: '16px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
  },
  title: {
    marginTop: 0,
    textAlign: 'center',
    borderBottom: '2px solid #ffa460', // <-- TU COLOR
    paddingBottom: '1rem',
    fontWeight: '700',
    color: '#c44d00',
    fontSize: '1.4rem',
  },
  itemList: {
    flex: 1,
    minHeight: '200px',
    maxHeight: '400px',
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingTop: '1rem',
    scrollbarWidth: 'thin',
    scrollbarColor: '#ffa460 #eee', // <-- TU COLOR
  },
  item: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem 0',
    borderBottom: '1px solid #eee',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  itemName: { fontSize: '1rem', fontWeight: '600', color: '#333' },
  itemQty: { color: '#ffa460', fontWeight: '700', marginLeft: '4px' }, // <-- TU COLOR
  itemPrice: { fontSize: '0.9rem', color: '#777' },
  removeButton: {
    backgroundColor: '#ff5e57',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '28px',
    height: '28px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    borderTop: '1px solid #eee',
    paddingTop: '1rem',
    marginTop: '1rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '1.2rem',
    fontWeight: '700',
    marginBottom: '0.5rem',
  },
  totalLabel: { color: '#333' },
  totalAmount: { color: '#2e8b57' },
  checkoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '0.9rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: '600',
  },
  clearButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #dc3545',
    borderRadius: '8px',
    backgroundColor: 'transparent',
    color: '#dc3545',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    marginTop: '2rem',
    fontStyle: 'italic',
  },
  message: (exito) => ({
    textAlign: 'center',
    fontSize: '1rem',
    fontWeight: '600',
    color: exito ? '#28a745' : '#dc3545',
    padding: '1rem 0',
  }),
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 50,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: '12px',
    padding: '2rem',
    width: '90%',
    maxWidth: '400px',
    boxShadow: '0 8px 20px rgba(0,0,0,0.25)',
    textAlign: 'center',
  },
  modalTitle: { fontSize: '1.4rem', fontWeight: '700', color: '#c44d00', marginBottom: '0.5rem' },
  modalText: { color: '#333', marginBottom: '1.5rem' },
  modalActions: { display: 'flex', flexDirection: 'column', gap: '10px' },
  modalConfirm: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#28a745',
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalPrint: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '0.8rem',
    border: '1px solid #007bff',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#007bff',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalCancel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '0.8rem',
    border: '1px solid #dc3545',
    borderRadius: '8px',
    backgroundColor: 'white',
    color: '#dc3545',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalOK: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '0.8rem',
    border: 'none',
    borderRadius: '8px',
    backgroundColor: '#007bff', // Botón azul de "Aceptar"
    color: 'white',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%'
  },
  // --- NUEVO ESTILO PARA EL SPINNER ---
  spinnerContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '1rem',
  }
};

export default ShoppingCart;