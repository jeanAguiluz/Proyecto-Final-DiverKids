import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import AdminRoute from './context/components/adminRoute';  // Ruta protegida para admin
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <div className="container mt-4">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminPanel />
                </AdminRoute>
              } 
            />
          </Routes>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
