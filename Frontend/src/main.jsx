import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { BrandProvider } from './context/BrandContext';
import './styles/globals.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrandProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </BrandProvider>
  </React.StrictMode>,
);
