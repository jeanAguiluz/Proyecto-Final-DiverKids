import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/CostumeDetail.css';
import { API_URL } from '../config/api';

function CostumeDetail() {
  const { id } = useParams();
  const [costume, setCostume] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const formatCLP = (value) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    const value = imageUrl.trim();
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value;
    }
    return `/imgs/${value}`;
  };

  useEffect(() => {
    const fetchCostume = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/costumes/${id}`);
        setCostume(response.data);
        setError(null);
      } catch {
        setError('No se pudo cargar el detalle del disfraz.');
      } finally {
        setLoading(false);
      }
    };

    fetchCostume();
  }, [id]);

  if (loading) {
    return (
      <div className="container text-center mt-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Cargando...</span>
        </div>
      </div>
    );
  }

  if (error || !costume) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Disfraz no encontrado.'}</div>
        <Link className="btn btn-outline-primary" to="/costumes">
          Volver al catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="costume-detail-page">
      <div className="container py-4">
        <div className="costume-detail-card">
          <div className="costume-detail-image-wrap">
            {costume.image_url ? (
              <img
                src={resolveImageUrl(costume.image_url)}
                alt={costume.name}
                className="costume-detail-image"
              />
            ) : (
              <div className="costume-detail-placeholder">🎭</div>
            )}
          </div>

          <div className="costume-detail-info">
            <h1>{costume.name}</h1>

            <div className="costume-detail-badges">
              {costume.category && <span className="badge bg-secondary">{costume.category}</span>}
              {costume.size && <span className="badge bg-info">{costume.size}</span>}
              <span className={`badge ${costume.available ? 'bg-success' : 'bg-danger'}`}>
                {costume.available ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            <p className="costume-detail-description">
              {costume.description || 'Sin descripción'}
            </p>

            <div className="costume-detail-meta">
              <p>
                <strong>Stock:</strong> {costume.stock_quantity ?? 0}
              </p>
              <p className="costume-detail-price">{formatCLP(costume.price_per_day)} /día</p>
            </div>

            <div className="costume-detail-actions">
              <Link className="btn btn-outline-primary" to="/costumes">
                Volver al catálogo
              </Link>
              {costume.available ? (
                <Link className="btn btn-primary" to={`/bookings?costume=${costume.id}`}>
                  Reservar
                </Link>
              ) : (
                <button className="btn btn-secondary" disabled>
                  No disponible
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CostumeDetail;
