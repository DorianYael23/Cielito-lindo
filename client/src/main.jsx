// client/src/main.jsx

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { CartProvider } from './context/CartContext'; // 1. IMPORTAMOS EL PROVIDER
import App from './App.jsx';
import './index.css';


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <CartProvider> {/* 2. ENVOLVEMOS LA APP CON EL CARTPROVIDER */}
        <App />
      </CartProvider>
    </BrowserRouter>
  </React.StrictMode>,
);