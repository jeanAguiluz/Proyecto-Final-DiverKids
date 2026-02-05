import React from 'react';
import ReactDOM from 'react-dom/client';  // Importa correctamente ReactDOM
import App from './App';
import "./styles/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";


const root = ReactDOM.createRoot(document.getElementById('root')); // Crea la raíz para la aplicación

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);