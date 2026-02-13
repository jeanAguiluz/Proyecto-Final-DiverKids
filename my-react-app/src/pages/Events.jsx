import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/useAuth';
import { useNavigate } from 'react-router-dom';
import "../styles/estilosPaguinas.css";
import '../styles/Events.css';
import { API_URL } from '../config/api';

function Events() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  });

  const fetchEvents = useCallback(async () => {
  console.log('🔍 Intentando cargar eventos...');
  console.log('🔍 Token disponible:', token);
  
  if (!token) {
    console.log('❌ No hay token, redirigiendo a login');
    navigate('/login');
    return;
  }

  try {
    console.log('📡 Haciendo petición GET /api/events');
    console.log('📡 Header Authorization:', `Bearer ${token}`);
    
    const response = await axios.get(`${API_URL}/events`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Respuesta recibida:', response.data);
    setEvents(response.data);
    setLoading(false);
  } catch (error) {
    console.error('❌ Error completo:', error);
    console.error('❌ Response:', error.response);
    setError('Error al cargar los eventos');
    setLoading(false);
  }
}, [token, navigate]);

  useEffect(() => {
    fetchEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingEvent) {
        // Actualizar
        await axios.put(
          `${API_URL}/events/${editingEvent.id}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Evento actualizado exitosamente');
      } else {
        // Crear
        await axios.post(
          `${API_URL}/events`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Evento creado exitosamente');
      }

      resetForm();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Error al guardar el evento');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      date: event.date,
      time: event.time || '',
      location: event.location || '',
      description: event.description || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este evento?')) return;

    try {
      await axios.delete(`${API_URL}/events/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Evento eliminado');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      alert('Error al eliminar el evento');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      date: '',
      time: '',
      location: '',
      description: ''
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  if (!user) {
    return (
      <div className="container mt-5 text-center">
        <h2>Debes iniciar sesión para ver tus eventos</h2>
        <button className="btn btn-primary mt-3" onClick={() => navigate('/login')}>
          Iniciar Sesión
        </button>
      </div>
    );
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

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  return (
    <div className="events-page">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4 events-header">
          <h1 className="events-title">📅 Mis Eventos</h1>
          <button 
            className="btn btn-primary events-new-btn"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nuevo Evento'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="card mb-4">
            <div className="card-body">
              <h3>{editingEvent ? 'Editar Evento' : 'Nuevo Evento'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Título del Evento *</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Ej: Cumpleaños de ..."
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Fecha *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-3">
                    <div className="mb-3">
                      <label className="form-label">Hora</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Ubicación</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        placeholder="Ej: Casa de María, Salón de Fiestas XYZ"
                      />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Descripción</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detalles del evento..."
                      />
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    {editingEvent ? 'Actualizar' : 'Crear'} Evento
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Eventos */}
        {events.length === 0 ? (
          <div className="text-center py-5 events-empty-state">
            <h3>No tienes eventos programados</h3>
            <p>Crea tu primer evento para empezar a planificar tus fiestas</p>
          </div>
        ) : (
          <div className="events-grid">
            {events.map(event => (
              <div key={event.id} className="event-card">
                <div className="event-date-badge">
                  <div className="month">{new Date(event.date).toLocaleDateString('es', { month: 'short' })}</div>
                  <div className="day">{new Date(event.date).getDate()}</div>
                </div>
                
                <div className="event-content">
                  <h3>{event.title}</h3>
                  
                  {event.time && (
                    <p className="event-info">
                      <span>🕐</span> {event.time}
                    </p>
                  )}
                  
                  {event.location && (
                    <p className="event-info">
                      <span>📍</span> {event.location}
                    </p>
                  )}
                  
                  {event.description && (
                    <p className="event-description">{event.description}</p>
                  )}
                  
                  <span className={`badge bg-${event.status === 'confirmed' ? 'success' : event.status === 'pending' ? 'warning' : 'secondary'}`}>
                    {event.status === 'confirmed' ? 'Confirmado' : event.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                  </span>
                </div>
                
                <div className="event-actions">
                  <button 
                    className="btn btn-sm btn-warning"
                    onClick={() => handleEdit(event)}
                  >
                    ✏️ Editar
                  </button>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(event.id)}
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Events;
