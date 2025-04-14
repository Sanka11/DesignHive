import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import { AuthProvider } from "./auth/AuthContext";
import { Toaster } from "react-hot-toast"; // ✅ This line

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
        <Toaster position="top-right" reverseOrder={false} /> {/* ✅ Toasts will show here */}
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
