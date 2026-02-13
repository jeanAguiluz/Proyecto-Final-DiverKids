import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import "../styles/estilosPaguinas.css";
import '../styles/Dashboard.css';
import { API_URL } from '../config/api';

function Dashboard() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    totalBookings: 0,
    pendingBookings: 0
  });
  
  const [recentEvents, setRecentEvents] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Obtener eventos
      const eventsRes = await axios.get(`${API_URL}/events`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const events = eventsRes.data;
      const now = new Date();
      const upcomingEvents = events.filter(e => new Date(e.date) >= now);
      
      setRecentEvents(events.slice(0, 3)); // Últimos 3 eventos
      
      // Obtener reservas
      const bookingsRes = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const bookings = bookingsRes.data;
      const pendingBookings = bookings.filter(b => b.status === 'pending');
      
      setRecentBookings(bookings.slice(0, 3)); // Últimas 3 reservas
      
      // Actualizar estadísticas
      setStats({
        totalEvents: events.length,
        upcomingEvents: upcomingEvents.length,
        totalBookings: bookings.length,
        pendingBookings: pendingBookings.length
      });
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container mt-4">
        {/* Header */}
        <div className="dashboard-header">
          <div>
            <h1>👋 ¡Hola, {user.name}!</h1>
            <p className="text-muted">Bienvenido a tu panel personal</p>
          </div>
          <div className="user-badge">
            <span className={`badge bg-${user.role === 'admin' ? 'danger' : 'primary'}`}>
              {user.role === 'admin' ? '👑 Admin' : '👤 Usuario'}
            </span>
          </div>
        </div>

        {/* Estadísticas */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📅</div>
            <div className="stat-info">
              <h3>{stats.totalEvents}</h3>
              <p>Eventos Totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏰</div>
            <div className="stat-info">
              <h3>{stats.upcomingEvents}</h3>
              <p>Eventos Próximos</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🎉</div>
            <div className="stat-info">
              <h3>{stats.totalBookings}</h3>
              <p>Reservas Totales</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-info">
              <h3>{stats.pendingBookings}</h3>
              <p>Reservas Pendientes</p>
            </div>
          </div>
        </div>

        <div className="row mt-4">
          {/* Eventos recientes */}
          <div className="col-md-6">
            <div className="card dashboard-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>📅 Eventos Recientes</h5>
                <Link to="/events" className="btn btn-sm btn-primary">
                  Ver todos
                </Link>
              </div>
              <div className="card-body">
                {recentEvents.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    No tienes eventos aún
                  </p>
                ) : (
                  <div className="list-group">
                    {recentEvents.map(event => (
                      <div key={event.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <h6>{event.title}</h6>
                          <span className="badge bg-info">
                            {new Date(event.date).toLocaleDateString()}
                          </span>
                        </div>
                        {event.location && (
                          <small className="text-muted">📍 {event.location}</small>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Reservas recientes */}
          <div className="col-md-6">
            <div className="card dashboard-card">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5>🎊 Reservas Recientes</h5>
                <Link to="/bookings" className="btn btn-sm btn-primary">
                  Ver todas
                </Link>
              </div>
              <div className="card-body">
                {recentBookings.length === 0 ? (
                  <p className="text-muted text-center py-3">
                    No tienes reservas aún
                  </p>
                ) : (
                  <div className="list-group">
                    {recentBookings.map(booking => (
                      <div key={booking.id} className="list-group-item">
                        <div className="d-flex justify-content-between">
                          <h6>{booking.booking_type}</h6>
                          <span className={`badge bg-${
                            booking.status === 'confirmed' ? 'success' : 
                            booking.status === 'pending' ? 'warning' : 'secondary'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        <small className="text-muted">
                          📅 {new Date(booking.event_date).toLocaleDateString()}
                        </small>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Accesos rápidos */}
        <div className="quick-actions mt-4">
          <h5 className="mb-3">🚀 Accesos Rápidos</h5>
          <div className="action-buttons">
            <Link to="/events" className="btn btn-lg btn-primary">
              📅 Crear Evento
            </Link>
            <Link to="/costumes" className="btn btn-lg btn-success">
              🎭 Ver Disfraces
            </Link>
            <Link to="/packages" className="btn btn-lg btn-info">
              🎉 Ver Paquetes
            </Link>
            <Link to="/contact" className="btn btn-lg btn-warning">
              📧 Contactar
            </Link>
          </div>
        </div>

        {/* Información del perfil */}
        <div className="card mt-4 dashboard-card">
          <div className="card-header">
            <h5>👤 Mi Perfil</h5>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <p><strong>Nombre:</strong> {user.name}</p>
                <p><strong>Email:</strong> {user.email}</p>
              </div>
              <div className="col-md-6">
                <p><strong>Teléfono:</strong> {user.phone || 'No registrado'}</p>
                <p><strong>Rol:</strong> {user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
              </div>
            </div>
            <Link to="/profile" className="btn btn-outline-primary mt-3">
              ✏️ Editar Perfil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
