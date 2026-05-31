// client/src/context/CartContext.jsx

import React, { createContext, useState, useContext } from 'react';

const CartContext = createContext();

export const useCart = () => {
  return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // --- FUNCIÓN DE AGREGAR ---
  const agregarAlCarrito = (producto) => {
    setCartItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === producto.id);

      if (itemExistente) {
        return prevItems.map((item) =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + 1 }
            : item
        );
      } else {
        return [...prevItems, { ...producto, cantidad: 1 }];
      }
    });
  };

  // --- NUEVA: FUNCIÓN DE RESTAR/ELIMINAR ---
  const restarDelCarrito = (id) => {
    setCartItems((prevItems) => {
      const itemExistente = prevItems.find((item) => item.id === id);

      // Si solo queda 1, lo eliminamos del arreglo
      if (itemExistente.cantidad === 1) {
        return prevItems.filter((item) => item.id !== id);
      }
      
      // Si hay más de 1, solo restamos la cantidad
      return prevItems.map((item) =>
        item.id === id
          ? { ...item, cantidad: item.cantidad - 1 }
          : item
      );
    });
  };

  // --- NUEVA: FUNCIÓN DE VACIAR CARRITO ---
  const limpiarCarrito = () => {
    setCartItems([]); // Simplemente lo resetea a un arreglo vacío
  };


  // 4. Pasamos las nuevas funciones
  const value = {
    cartItems,
    agregarAlCarrito,
    restarDelCarrito, // NUEVA
    limpiarCarrito,   // NUEVA
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};