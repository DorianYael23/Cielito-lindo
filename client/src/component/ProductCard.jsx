import React from 'react';
import { useCart } from '../context/CartContext';

function ProductCard({ product }) {
  const { agregarAlCarrito } = useCart();

  return (
    <div 
      style={styles.card}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.03)';
        e.currentTarget.style.boxShadow = '0 6px 14px rgba(0,0,0,0.2)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
      }}
    >
      <h3 style={styles.title}>{product.nombre}</h3>
      <p style={styles.description}>{product.descripcion}</p>
      <div style={styles.footer}>
        <span style={styles.price}>${product.precio}</span>
        <button 
          style={styles.button}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#4E342E'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#5D4037'}
          onClick={() => agregarAlCarrito(product)}
        >
          Agregar
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: '#ffffff', 
    borderRadius: '8px',
    padding: '1rem',
    margin: '0.5rem',
    width: '250px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
    color: '#2c2c2c',
    border: '1px solid #f3d9b1',
    transition: 'transform 0.25s ease, box-shadow 0.25s ease',
  },
  title: {
    fontSize: '1.15rem',
    margin: '0.5rem 0',
    fontWeight: '700',
    color: '#e67e22', // 🟠 Tono naranja cálido
  },
  description: {
    fontSize: '0.9rem',
    flex: 1,
    color: '#555',
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1rem',
  },
  price: {
    fontSize: '1.1rem',
    fontWeight: 'bold',
    color: '#8D6E63',
  },
  button: {
    padding: '0.5rem 1rem',
    border: 'none',
    borderRadius: '6px',
    backgroundColor: '#5D4037', // Café oscuro
    color: 'white',
    cursor: 'pointer',
    fontWeight: '600',
    transition: 'background-color 0.2s ease',
  },
};

export default ProductCard;
