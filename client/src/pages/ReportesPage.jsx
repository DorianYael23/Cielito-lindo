import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BarChart, DollarSign, ClipboardList, AlertTriangle, TrendingUp, List } from 'lucide-react'; // Íconos

// --- 1. IMPORTACIONES PARA LA GRÁFICA (DE BARRAS) ---
import { Bar } from 'react-chartjs-2'; 
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement, 
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// --- 2. REGISTRAR LOS COMPONENTES DE CHART.JS (DE BARRAS) ---
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement, 
  Title,
  Tooltip,
  Legend
);
// ----------------------------------------------

function ReportesPage() {
  const [reporte, setReporte] = useState(null);
  const [productosVendidos, setProductosVendidos] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // --- NUEVO ESTADO PARA LA PESTAÑA ACTIVA ---
  const [activeTab, setActiveTab] = useState('grafica');

  useEffect(() => {
    const cargarReportes = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
        const rol = localStorage.getItem('rol');

        if (!token || rol !== 'admin') {
          console.error('Acceso denegado. No es admin o no hay token.');
          navigate('/');
          return;
        }

        const config = {
          headers: { 'Authorization': `Bearer ${token}` }
        };

        // Cargamos los dos reportes al mismo tiempo
        const [resVentas, resProductos] = await Promise.all([
          axios.get('/api/reportes/ventas-dia', config),
          axios.get('/api/reportes/productos-mas-vendidos', config)
        ]);
        
        setReporte(resVentas.data);
        setProductosVendidos(resProductos.data);

      } catch (err) {
        console.error('Error al cargar reportes:', err);
        setError(err.response?.data?.message || 'No se pudieron cargar los reportes.');
      } finally {
        setLoading(false); 
      }
    };

    cargarReportes();
  }, [navigate]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(val || 0);
  }

  // --- 3. PREPARAR DATOS PARA LA GRÁFICA (DE BARRAS) ---
  // (Sin cambios)
  const chartData = {
    labels: productosVendidos.map(p => p.nombre),
    datasets: [
      {
        label: 'Cantidad Vendida',
        data: productosVendidos.map(p => p.total_vendido),
        backgroundColor: '#ffa460', // Tu color naranja pastel
        borderColor: '#c97b4f',     // Un borde más oscuro
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false, // Importante para que respete la altura del div
    plugins: {
      legend: {
        display: false 
      },
      title: {
        display: false 
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
          color: '#5c2c0c' 
        },
        grid: {
          color: 'rgba(92, 44, 12, 0.1)' 
        }
      },
      x: {
         ticks: {
          color: '#5c2c0c'
        },
         grid: {
          display: false 
        }
      }
    }
  };
  // ----------------------------------------

  if (loading) {
    return (
      <div style={styles.pageWrapper}>
        <p style={styles.loading}>Cargando reportes...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.pageWrapper}>
        <div style={styles.error}>
          <AlertTriangle size={32} style={{ color: '#dc3545', marginRight: '1rem' }} />
          <div>
            <h3 style={{ margin: 0 }}>Error al cargar</h3>
            <p style={{ margin: 0, fontSize: '0.9rem' }}>{error}</p>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div style={styles.pageWrapper}>
      <style>{`
        .report-table {
          width: 100%;
          margin: 0 auto;
          border-collapse: collapse;
          background-color: #ffffff;
          border-radius: 12px;
          overflow: hidden;
          color: #5c2c0c;
        }
        .report-table th, .report-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px dashed #ffa460;
        }
        .report-table th {
          background-color: #fdf5e6;
          color: #c44d00;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          border-bottom: 2px solid #ffa460;
        }
        .report-table tr:last-child td {
          border-bottom: none;
        }
        .report-table td:last-child {
          font-weight: bold;
          color: #28a745;
        }
        .top-products-table td:last-child {
          font-weight: bold;
          color: #5c2c0c;
        }
      `}</style>

      {/* Título principal (Sin cambios) */}
      <div style={styles.titleContainer}>
        <div style={styles.titleIconWrapper}>
          <BarChart size={32} style={{color: '#ffa460'}} />
        </div>
        <h1 style={styles.title}>Reporte de Ventas de Hoy</h1>
      </div>

      {/* Resumen en tarjetas (Sin cambios) */}
      <div style={styles.resumen}>
        <div style={styles.resumenBox}>
          <div style={styles.resumenIcon}>
            <DollarSign size={24} className="text-white" />
          </div>
          <div style={styles.resumenText}>
            <h2 style={styles.resumenTitle}>Ventas Totales</h2>
            <p style={styles.resumenDato}>{formatCurrency(reporte?.resumen?.total_dia)}</p>
          </div>
        </div>
        <div style={styles.resumenBox}>
          <div style={styles.resumenIcon}>
            <ClipboardList size={24} className="text-white" />
          </div>
          <div style={styles.resumenText}>
            <h2 style={styles.resumenTitle}>Número de Ventas</h2>
            <p style={styles.resumenDato}>{reporte?.resumen?.num_ventas || 0} tickets</p>
          </div>
        </div>
      </div>

      {/* --- NUEVA LISTA INTERACTIVA (PESTAÑAS) --- */}
      <div style={styles.tabContainer}>
        <button
          style={activeTab === 'grafica' ? styles.tabButtonActive : styles.tabButton}
          onClick={() => setActiveTab('grafica')}
        >
          <TrendingUp style={styles.tabButtonIcon} />
          Gráfica de Productos mas Vendidos
        </button>
        <button
          style={activeTab === 'productos' ? styles.tabButtonActive : styles.tabButton}
          onClick={() => setActiveTab('productos')}
        >
          <List style={styles.tabButtonIcon} />
          Detalle de Productos mas Vendidos
        </button>
        <button
          style={activeTab === 'tickets' ? styles.tabButtonActive : styles.tabButton}
          onClick={() => setActiveTab('tickets')}
        >
          <ClipboardList style={styles.tabButtonIcon} />
          Tickets del Día
        </button>
      </div>

      {/* --- NUEVO CONTENEDOR DE CONTENIDO DINÁMICO --- */}
      <div style={styles.tabContent}>
        
        {/* Contenido de la Pestaña 1: Gráfica */}
        {activeTab === 'grafica' && (
          <div style={styles.chartContainer}>
            {productosVendidos.length > 0 ? (
              <Bar data={chartData} options={chartOptions} />
            ) : (
              <p style={styles.noDataText}>No hay datos de productos para graficar.</p>
            )}
          </div>
        )}

        {/* Contenido de la Pestaña 2: Tabla de Productos */}
        {activeTab === 'productos' && (
          <div style={{overflowX: 'auto'}}>
            <table className="report-table top-products-table">
              <thead>
                <tr>
                  <th style={{width: '70%'}}>Producto</th>
                  <th>Cantidad Vendida</th>
                </tr>
              </thead>
              <tbody>
                {productosVendidos.length === 0 ? (
                  <tr>
                    <td colSpan="2" style={{textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '2rem'}}>
                      No se han vendido productos hoy.
                    </td>
                  </tr>
                ) : (
                  productosVendidos.map((producto) => (
                    <tr key={producto.nombre}>
                      <td>{producto.nombre}</td>
                      <td style={{fontWeight: 'bold', fontSize: '1.1rem'}}>{producto.total_vendido}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Contenido de la Pestaña 3: Tabla de Tickets */}
        {activeTab === 'tickets' && (
          <div style={{overflowX: 'auto'}}>
            <table className="report-table">
              <thead>
                <tr>
                  <th>ID Ticket</th>
                  <th>Hora</th>
                  <th>Cajero</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {reporte.ventas.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', color: '#888', fontStyle: 'italic', padding: '2rem'}}>
                      No hay ventas registradas hoy.
                    </td>
                  </tr>
                ) : (
                  reporte.ventas.map((venta) => (
                    <tr key={venta.id}>
                      <td>#{venta.id}</td>
                      <td>{new Date(venta.fecha).toLocaleTimeString('es-MX')}</td>
                      <td>{venta.nombre_usuario}</td>
                      <td>{formatCurrency(venta.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

      </div>
    </div>
  );
}

// --- ESTILOS ACTUALIZADOS ---
// (Eliminé los estilos de subtítulos y agregué los de las pestañas)
const styles = {
  pageWrapper: {
    backgroundColor: '#fdf5e6',
    color: '#5c2c0c',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 8px 20px rgba(92, 44, 12, 0.2)',
    margin: '1rem 0',
  },
  titleContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    borderBottom: '2px solid #ffa460',
    paddingBottom: '1.5rem',
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
    flexShrink: 0,
  },
  title: {
    textAlign: 'center',
    marginBottom: 0,
    color: '#c44d00',
    fontSize: '2rem',
    fontWeight: '700',
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
    textAlign: 'left',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    backgroundColor: '#ffebee',
    padding: '1.5rem',
    borderRadius: '12px',
    border: '2px solid #dc3545',
  },
  resumen: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '2rem',
    marginBottom: '2rem', // Reducido el margen
  },
  resumenBox: {
    backgroundColor: '#ffa460',
    padding: '1.5rem',
    borderRadius: '12px',
    textAlign: 'left',
    boxShadow: '0 6px 15px rgba(92, 44, 12, 0.3)',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    flex: '1',
    minWidth: '250px',
    maxWidth: '400px',
    color: 'white',
  },
  resumenIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: '0.75rem',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resumenText: {
    display: 'flex',
    flexDirection: 'column',
  },
  resumenTitle: {
    margin: 0,
    fontSize: '0.9rem',
    fontWeight: 'normal',
    opacity: 0.9,
    textTransform: 'uppercase',
  },
  resumenDato: {
    margin: 0,
    fontSize: '1.75rem',
    fontWeight: 'bold',
  },
  
  // --- NUEVOS ESTILOS PARA PESTAÑAS ---
  tabContainer: {
    display: 'flex',
    gap: '0.25rem',
    borderBottom: '2px solid #ffa460',
    marginBottom: '-2px', // Truco para que la pestaña activa se funda con el borde
    position: 'relative',
    zIndex: 1,
  },
  tabButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.75rem 1.25rem',
    border: '2px solid transparent',
    borderBottom: 'none',
    borderRadius: '8px 8px 0 0',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    color: '#c44d00',
    fontWeight: '600',
    fontSize: '0.9rem',
    opacity: 0.7,
  },
  tabButtonActive: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '0.75rem 1.25rem',
    border: '2px solid #ffa460',
    borderBottom: '2px solid white', // Truco para tapar el borde de abajo
    borderRadius: '8px 8px 0 0',
    backgroundColor: 'white',
    cursor: 'pointer',
    color: '#c44d00',
    fontWeight: '600',
    fontSize: '0.9rem',
    opacity: 1,
    boxShadow: '0 -2px 5px rgba(92, 44, 12, 0.05)',
  },
  tabButtonIcon: {
    width: '18px',
    height: '18px',
  },
  tabContent: {
    padding: '1.5rem',
    backgroundColor: 'white',
    borderRadius: '0 12px 12px 12px', // Redondeado en todas menos esquina superior izquierda
    border: '2px solid #ffa460',
    boxShadow: '0 4px 10px rgba(92, 44, 12, 0.1)',
    position: 'relative',
    zIndex: 0,
  },
  // ------------------------------------

  chartContainer: { 
    backgroundColor: 'white',
    // Quitamos bordes y padding, ya que 'tabContent' los proporciona
    height: '350px',
  },
  noDataText: { 
    textAlign: 'center',
    color: '#888',
    fontStyle: 'italic',
    paddingTop: '2rem',
  }
};

export default ReportesPage;