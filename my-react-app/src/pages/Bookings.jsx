import react from 'react';
import { useAuth } from '../context/useAuth';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import "../styles/estilosPaguinas.css";
import '../styles/Bookings.css';
import { API_URL } from '../config/api';

function Bookings() {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = react.useState([]);
  const [costumes, setCostumes] = react.useState([]);
  const [packages, setPackages] = react.useState([]);
  const [loading, setLoading] = react.useState(true);
  const [showForm, setShowForm] = react.useState(false);
  const [editingBooking, setEditingBooking] = react.useState(null);

  const [formData, setFormData] = react.useState({
    booking_type: 'costume', // costume, package, both
    event_date: '',
    event_time: '',
    event_location: '',
    event_address: '',
    num_children: 10,
    costume_id: '',
    package_id: '',
    special_requests: ''
  });

  const formatCLP = (value) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);

  const calculatedTotal = react.useMemo(() => {
    let total = 0;

    if (formData.booking_type === 'costume' || formData.booking_type === 'both') {
      const selectedCostume = costumes.find(
        (costume) => String(costume.id) === String(formData.costume_id)
      );
      total += Number(selectedCostume?.price_per_day) || 0;
    }

    if (formData.booking_type === 'package' || formData.booking_type === 'both') {
      const selectedPackage = packages.find(
        (pkg) => String(pkg.id) === String(formData.package_id)
      );
      total += Number(selectedPackage?.price) || 0;
    }

    return total;
  }, [formData.booking_type, formData.costume_id, formData.package_id, costumes, packages]);

  const fetchBookings = react.useCallback(async () => {
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.get(`${API_URL}/bookings`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBookings(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setLoading(false);
    }
  }, [token, navigate]);

  const fetchCostumesAndPackages = react.useCallback(async () => {
    try {
      const [costumesRes, packagesRes] = await Promise.all([
        axios.get(`${API_URL}/costumes`),
        axios.get(`${API_URL}/packages`)
      ]);

      setCostumes(costumesRes.data.filter(c => c.available));
      setPackages(packagesRes.data.filter(p => p.available));
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  react.useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    fetchBookings();
    fetchCostumesAndPackages();

    // Esperar a que los datos se carguen antes de pre-seleccionar
    const timer = setTimeout(() => {
      const packageId = searchParams.get('package');
      const costumeId = searchParams.get('costume');

      if (packageId || costumeId) {
        setShowForm(true);

        if (packageId && costumeId) {
          setFormData(prev => ({
            ...prev,
            package_id: packageId,
            costume_id: costumeId,
            booking_type: 'both'
          }));
        } else if (packageId) {
          setFormData(prev => ({
            ...prev,
            package_id: packageId,
            booking_type: 'package'
          }));
        } else if (costumeId) {
          setFormData(prev => ({
            ...prev,
            costume_id: costumeId,
            booking_type: 'costume'
          }));
        }
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [user]);
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBooking) {
        // Actualizar
        await axios.put(
          `${API_URL}/bookings/${editingBooking.id}`,
          { ...formData, total_price: calculatedTotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Reserva actualizada exitosamente');
      } else {
        // Crear
        await axios.post(
          `${API_URL}/bookings`,
          { ...formData, total_price: calculatedTotal },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        alert('Reserva creada exitosamente');
      }

      resetForm();
      fetchBookings();
    } catch (error) {
      console.error('Error saving booking:', error);
      alert(error.response?.data?.msg || 'Error al guardar la reserva');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de cancelar esta reserva?')) return;

    try {
      await axios.delete(`${API_URL}/bookings/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Reserva cancelada');
      fetchBookings();
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error al cancelar la reserva');
    }
  };

  const resetForm = () => {
    setFormData({
      booking_type: 'costume',
      event_date: '',
      event_time: '',
      event_location: '',
      event_address: '',
      num_children: 10,
      costume_id: '',
      package_id: '',
      special_requests: ''
    });
    setEditingBooking(null);
    setShowForm(false);
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
    <div className="bookings-page">
      <div className="container mt-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <h1>🎊 Mis Reservas</h1>
          <button
            className="btn btn-primary"
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? 'Cancelar' : '+ Nueva Reserva'}
          </button>
        </div>

        {/* Formulario */}
        {showForm && (
          <div className="card mb-4 booking-form-card">
            <div className="card-body">
              <h3>{editingBooking ? 'Editar Reserva' : 'Nueva Reserva'}</h3>
              <form onSubmit={handleSubmit}>
                <div className="row">
                  {/* Tipo de reserva */}
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Tipo de Reserva *</label>
                      <select
                        className="form-control"
                        value={formData.booking_type}
                        onChange={(e) => setFormData({ ...formData, booking_type: e.target.value })}
                        required
                      >
                        <option value="costume">Solo Disfraz</option>
                        <option value="package">Solo Paquete de Animación</option>
                        <option value="both">Disfraz + Paquete</option>
                      </select>
                    </div>
                  </div>

                  {/* Disfraz */}
                  {(formData.booking_type === 'costume' || formData.booking_type === 'both') && (
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Disfraz</label>
                        <select
                          className="form-control"
                          value={formData.costume_id}
                          onChange={(e) => setFormData({ ...formData, costume_id: e.target.value })}
                        >
                          <option value="">Seleccionar...</option>
                          {costumes.map(costume => (
                            <option key={costume.id} value={costume.id}>
                              {costume.name} - {formatCLP(costume.price_per_day)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Paquete */}
                  {(formData.booking_type === 'package' || formData.booking_type === 'both') && (
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label">Paquete de Animación</label>
                        <select
                          className="form-control"
                          value={formData.package_id}
                          onChange={(e) => setFormData({ ...formData, package_id: e.target.value })}
                        >
                          <option value="">Seleccionar...</option>
                          {packages.map(pkg => (
                            <option key={pkg.id} value={pkg.id}>
                              {pkg.name} - {formatCLP(pkg.price)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Fecha y hora */}
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Fecha del Evento *</label>
                      <input
                        type="date"
                        className="form-control"
                        value={formData.event_date}
                        onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Hora</label>
                      <input
                        type="time"
                        className="form-control"
                        value={formData.event_time}
                        onChange={(e) => setFormData({ ...formData, event_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="col-md-4">
                    <div className="mb-3">
                      <label className="form-label">Número de Niños</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.num_children}
                        onChange={(e) => setFormData({ ...formData, num_children: e.target.value })}
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>

                  {/* Ubicación */}
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Lugar del Evento</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.event_location}
                        onChange={(e) => setFormData({ ...formData, event_location: e.target.value })}
                        placeholder="Ej: Casa, Salón de Fiestas"
                      />
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="mb-3">
                      <label className="form-label">Dirección</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.event_address}
                        onChange={(e) => setFormData({ ...formData, event_address: e.target.value })}
                        placeholder="Calle, número, comuna"
                      />
                    </div>
                  </div>

                  {/* Solicitudes especiales */}
                  <div className="col-md-12">
                    <div className="mb-3">
                      <label className="form-label">Solicitudes Especiales</label>
                      <textarea
                        className="form-control"
                        rows="3"
                        value={formData.special_requests}
                        onChange={(e) => setFormData({ ...formData, special_requests: e.target.value })}
                        placeholder="Tema de la fiesta, alergias, preferencias..."
                      />
                    </div>
                  </div>

                  {/* Total */}
                  <div className="col-md-12">
                    <div className="total-price">
                      <h4>Total: {formatCLP(calculatedTotal)}</h4>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success">
                    {editingBooking ? 'Actualizar' : 'Crear'} Reserva
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetForm}>
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lista de Reservas */}
        {bookings.length === 0 ? (
          <div className="text-center py-5">
            <h3>No tienes reservas</h3>
            <p className="text-muted">Crea tu primera reserva para una fiesta inolvidable</p>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h4>{booking.booking_type === 'costume' ? '🎭 Disfraz' : booking.booking_type === 'package' ? '🎉 Paquete' : '🎊 Disfraz + Paquete'}</h4>
                  <span className={`badge bg-${booking.status === 'confirmed' ? 'success' :
                      booking.status === 'pending' ? 'warning' :
                        booking.status === 'cancelled' ? 'danger' : 'secondary'
                    }`}>
                    {booking.status === 'confirmed' ? 'Confirmada' :
                      booking.status === 'pending' ? 'Pendiente' :
                        booking.status === 'cancelled' ? 'Cancelada' : booking.status}
                  </span>
                </div>

                <div className="booking-details">
                  <p><strong>📅 Fecha:</strong> {new Date(booking.event_date).toLocaleDateString('es-CL')}</p>
                  {booking.event_time && <p><strong>🕐 Hora:</strong> {booking.event_time}</p>}
                  {booking.event_location && <p><strong>📍 Lugar:</strong> {booking.event_location}</p>}
                  {booking.num_children && <p><strong>👶 Niños:</strong> {booking.num_children}</p>}
                  {booking.special_requests && (
                    <p><strong>📝 Notas:</strong> {booking.special_requests}</p>
                  )}
                  <p className="total"><strong>💰 Total:</strong> {formatCLP(booking.total_price)}</p>
                </div>

                <div className="booking-actions">
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => handleDelete(booking.id)}
                  >
                    Cancelar Reserva
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

export default Bookings;
