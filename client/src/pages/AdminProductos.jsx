import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Edit, Trash2, PlusCircle, Package, AlertTriangle } from 'lucide-react';
import ProductForm from '../components/ProductForm'; 
import ConfirmModal from '../components/ConfirmModal'; 
import AlertModal from '../components/AlertModal'; // <-- 1. IMPORTAMOS EL NUEVO MODAL

function AdminProductos() {
  const [productos, setProductos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Estados para modals
  const [modalAbierto, setModalAbierto] = useState(false);
  const [productoAEditar, setProductoAEditar] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productoAEliminar, setProductoAEliminar] = useState(null); 

  // --- 2. NUEVO ESTADO PARA EL MODAL DE ALERTA ---
  const [alertModal, setAlertModal] = useState({ isOpen: false, message: '' });

  // Función para Cargar los Productos
  const fetchProductos = async () => {
    try {
      const respuesta = await axios.get('/api/productos');
      setProductos(respuesta.data);
    } catch (err) {
      setError('Error al cargar los productos.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Carga de datos y Protección de la Ruta (sin cambios)
  useEffect(() => {
    const rol = localStorage.getItem('rol');
    if (rol !== 'admin') {
      console.log('Acceso denegado. Redirigiendo...');
      navigate('/');
      return;
    }
    fetchProductos();
  }, [navigate]);

  // Función para Eliminar (llamada por el modal)
  const handleDelete = async () => {
    if (!productoAEliminar) return; 

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/productos/${productoAEliminar.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      fetchProductos(); 
      closeDeleteModal(); 
      // --- 3. MOSTRAMOS EL MODAL DE ÉXITO ---
      setAlertModal({ isOpen: true, message: '🗑️ Producto eliminado correctamente' });

    } catch (err) {
      const msg = err.response?.data?.message || 'Error al eliminar el producto.';
      setError(msg);
      closeDeleteModal(); 
      setTimeout(() => setError(null), 5000);
    }
  };

  // Handlers para el Formulario
  const handleShowForm = (producto = null) => {
    setProductoAEditar(producto); 
    setModalAbierto(true);
  };
  const handleCloseForm = () => {
    setModalAbierto(false);
    setProductoAEditar(null);
  };

  // --- 4. handleSave AHORA MUESTRA EL MODAL DE ALERTA ---
  const handleSave = (message) => {
    fetchProductos(); // Recarga la lista
    handleCloseForm(); // Cierra el formulario
    setAlertModal({ isOpen: true, message: message }); // <-- Muestra el modal de éxito
  };

  // Handlers para el Modal de Eliminación
  const openDeleteModal = (producto) => {
    setProductoAEliminar(producto);
    setIsDeleteModalOpen(true);
  };
  const closeDeleteModal = () => {
    setProductoAEliminar(null);
    setIsDeleteModalOpen(false);
  };

  // Función para formatear moneda
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  }

  // --- Renderizado ---
  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <p style={styles.loading}>Cargando productos...</p>
      </div>
    );
  }

  return (
    <div style={styles.pageWrapper}>
      
      {/* Encabezado con título y botón (sin cambios) */}
      <div style={styles.header}>
        <div style={styles.titleContainer}>
          <div style={styles.titleIconWrapper}>
            <Package size={32} style={{color: '#e09a6d'}} />
          </div>
          <h1 style={styles.title}>Gestión de Productos</h1>
        </div>
        <button 
          style={styles.createButton}
          onMouseEnter={(e) => e.target.style.backgroundColor = '#c97b4f'}
          onMouseLeave={(e) => e.target.style.backgroundColor = '#e09a6d'}
          onClick={() => handleShowForm(null)}
        >
          <PlusCircle size={20} />
          <span>Crear Producto</span>
        </button>
      </div>

      {/* Mensaje de Error (sin cambios) */}
      {error && (
        <div style={styles.error}>
          <AlertTriangle size={24} style={{ color: '#dc3545', marginRight: '0.5rem' }} />
          <p style={{ margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Tabla de Productos (sin cambios) */}
      <div style={styles.tableContainer}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={styles.th}>ID</th>
              <th style={styles.th}>Nombre</th>
              <th style={styles.th}>Precio</th>
              <th style={styles.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productos.map((producto) => (
              <tr key={producto.id} style={styles.tr}>
                <td style={styles.td}>#{producto.id}</td>
                <td style={styles.td}>{producto.nombre}</td>
                <td style={styles.tdPrice}>{formatCurrency(producto.precio)}</td>
                <td style={{ ...styles.td, ...styles.actionsCell }}>
                  <button 
                    style={styles.actionButtonEdit}
                    onClick={() => handleShowForm(producto)}
                    title="Editar"
                  >
                    <Edit size={18} />
                  </button>
                  <button 
                    style={styles.actionButtonDelete}
                    onClick={() => openDeleteModal(producto)}
                    title="Eliminar"
                  >
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 5. RENDERIZADO DE TODOS LOS MODALS --- */}
      {modalAbierto && (
        <ProductForm
          productoAEditar={productoAEditar}
          onClose={handleCloseForm}
          onSave={handleSave} // <-- Le pasamos la nueva función 'handleSave'
        />
      )}

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDelete}
        title="Confirmar Eliminación"
        message={`¿Estás seguro de que quieres eliminar "${productoAEliminar?.nombre}"?`}
      />

      {/* RENDER DEL NUEVO MODAL DE ALERTA */}
      {alertModal.isOpen && (
        <AlertModal
          title="¡Éxito!"
          message={alertModal.message}
          onClose={() => setAlertModal({ isOpen: false, message: '' })}
        />
      )}

    </div>
  );
}

// Estilos JSS (sin cambios)
const styles = {
  pageWrapper: {
    backgroundColor: '#fdf5e6',
    color: '#5c2c0c',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(92, 44, 12, 0.2)',
    margin: '1rem 0',
  },
  header: {
    display: 'flex',
    flexWrap: 'wrap', 
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
    borderBottom: '2px solid #e09a6d',
    paddingBottom: '1.5rem',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  titleIconWrapper: {
    backgroundColor: 'white',
    borderRadius: '50%',
    width: '60px',
    height: '60px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 10px rgba(92, 44, 12, 0.1)',
  },
  title: {
    margin: 0,
    color: '#c44d00',
    fontSize: '2rem',
    fontWeight: '700',
  },
  createButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: '#e09a6d',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.25rem',
    borderRadius: '8px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 10px rgba(92, 44, 12, 0.2)',
  },
  loading: {
    textAlign: 'center',
    fontSize: '1.5rem',
    color: '#5c2c0c',
    padding: '3rem',
  },
  error: {
    display: 'flex',
    alignItems: 'center',
    color: '#dc3545',
    fontWeight: 'bold',
    backgroundColor: '#ffebee',
    padding: '1rem',
    borderRadius: '8px',
    border: '1px solid #dc3545',
    marginBottom: '1.5rem',
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto',
    backgroundColor: 'white',
    borderRadius: '12px',
    border: '1px solid #e09a6d',
    boxShadow: '0 4px 10px rgba(92, 44, 12, 0.1)',
  },
  th: {
    backgroundColor: '#fdf5e6',
    color: '#c44d00',
    padding: '1rem',
    textAlign: 'left',
    fontSize: '0.9rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e09a6d',
  },
  tr: {
    // hover
  },
  td: {
    color: '#5c2c0c',
    padding: '1rem',
    borderBottom: '1px dashed #e09a6d',
    verticalAlign: 'middle',
  },
  tdPrice: { 
    color: '#28a745', 
    fontWeight: '600',
    padding: '1rem',
    borderBottom: '1px dashed #e09a6d',
    verticalAlign: 'middle',
  },
  actionsCell: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  actionButtonEdit: {
    color: '#007bff',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
  actionButtonDelete: {
    color: '#dc3545',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    transition: 'transform 0.2s ease',
  },
};

export default AdminProductos;