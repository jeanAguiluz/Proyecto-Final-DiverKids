import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import NotFound from './components/NotFound';
import Events from './pages/Events';
import Packages from './pages/Packages';
import PackageDetail from './pages/PackageDetail';
import PrivateRoute from './components/PrivateRoute';
import Costumes from './pages/Costumes';
import CostumeDetail from './pages/CostumeDetail';
import AdminCostumes from './components/AdminCostumes';
import AdminPackages from './components/AdminPackages';
import AdminContacts from './components/AdminContacts';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import WhatsAppButton from './components/WhatsAppButton';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/events" element={<Events />} />
        <Route path="/packages" element={<Packages />} />
        <Route path="/packages/:id" element={<PackageDetail />} />
        <Route path="/costumes" element={<Costumes />} />
        <Route path="/costumes/:id" element={<CostumeDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Ruta protegida - Solo Admin */}
        <Route
          path="/admin/costumes"
          element={
            <PrivateRoute requireAdmin={true}>
              <AdminCostumes />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/packages"
          element={
            <PrivateRoute requireAdmin={true}>
              <AdminPackages />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/contacts"
          element={
            <PrivateRoute requireAdmin={true}>
              <AdminContacts />
            </PrivateRoute>
          }
        />
        {/* Ruta protegida - Dashboard */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        {/* Ruta protegida - Bookings */}
        <Route
          path="/bookings"
          element={
            <PrivateRoute>
              <Bookings />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>


      {/* Botón flotante de WhatsApp */}
      <WhatsAppButton />
      <Footer /> 
    </>
  );
}

export default App;
