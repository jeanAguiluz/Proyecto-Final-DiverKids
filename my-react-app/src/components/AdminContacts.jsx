import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';
import { useAuth } from '../context/useAuth';

function AdminContacts() {
  const { token } = useAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchContacts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await axios.get(`${API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts(response.data);
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError('No se pudieron cargar los mensajes de contacto.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  const updateStatus = async (id, status) => {
    try {
      await axios.put(
        `${API_URL}/contact/${id}`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status } : c))
      );
    } catch (err) {
      console.error('Error updating contact status:', err);
      alert('No se pudo actualizar el estado.');
    }
  };

  const deleteContact = async (id) => {
    if (!window.confirm('¿Eliminar este mensaje de contacto?')) return;

    try {
      await axios.delete(`${API_URL}/contact/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error('Error deleting contact:', err);
      alert('No se pudo eliminar el mensaje.');
    }
  };

  return (
    <div className="container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>📩 Gestión de Contactos</h2>
        <button className="btn btn-outline-primary" onClick={fetchContacts}>
          Actualizar
        </button>
      </div>

      {loading && <div className="text-center py-4">Cargando...</div>}

      {!loading && error && (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="card">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover align-middle">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Mensaje</th>
                    <th>Estado</th>
                    <th>Fecha</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {contacts.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="text-center py-4">
                        No hay mensajes de contacto.
                      </td>
                    </tr>
                  ) : (
                    contacts.map((contact) => (
                      <tr key={contact.id}>
                        <td>{contact.id}</td>
                        <td>{contact.name}</td>
                        <td>{contact.email}</td>
                        <td style={{ minWidth: '260px' }}>{contact.message}</td>
                        <td>
                          <select
                            className="form-select form-select-sm"
                            value={contact.status || 'pending'}
                            onChange={(e) => updateStatus(contact.id, e.target.value)}
                          >
                            <option value="pending">Pendiente</option>
                            <option value="read">Leído</option>
                            <option value="replied">Respondido</option>
                          </select>
                        </td>
                        <td>
                          {contact.created_at
                            ? new Date(contact.created_at).toLocaleString()
                            : '-'}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => deleteContact(contact.id)}
                          >
                            Eliminar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminContacts;

