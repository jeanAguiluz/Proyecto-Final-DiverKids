import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/PackageDetail.css';
import { API_URL } from '../config/api';

function PackageDetail() {
  const { id } = useParams();
  const [pkg, setPkg] = useState(null);
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

  const parseIncludes = (includes) => {
    if (Array.isArray(includes)) return includes.filter(Boolean);
    return String(includes || '')
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  };

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_URL}/packages/${id}`);
        setPkg(response.data);
        setError(null);
      } catch {
        setError('No se pudo cargar el detalle del paquete.');
      } finally {
        setLoading(false);
      }
    };

    fetchPackage();
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

  if (error || !pkg) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">{error || 'Paquete no encontrado.'}</div>
        <Link className="btn btn-outline-primary" to="/packages">
          Volver a paquetes
        </Link>
      </div>
    );
  }

  return (
    <div className="package-detail-page">
      <div className="container py-4">
        <div className="package-detail-card">
          <div className="package-detail-image-wrap">
            {pkg.image_url ? (
              <img src={resolveImageUrl(pkg.image_url)} alt={pkg.name} className="package-detail-image" />
            ) : (
              <div className="package-detail-placeholder">🎉</div>
            )}
          </div>

          <div className="package-detail-info">
            <h1>{pkg.name}</h1>

            <div className="package-detail-badges">
              <span className="badge bg-info">{pkg.duration_hours}h</span>
              {pkg.max_children && <span className="badge bg-secondary">Max {pkg.max_children} niños</span>}
              <span className={`badge ${pkg.available ? 'bg-success' : 'bg-danger'}`}>
                {pkg.available ? 'Disponible' : 'No disponible'}
              </span>
            </div>

            {pkg.description && <p className="package-detail-description">{pkg.description}</p>}

            {pkg.includes && (
              <div className="package-detail-includes">
                <strong>Incluye:</strong>
                <ul>
                  {parseIncludes(pkg.includes).map((item, index) => (
                    <li key={`${pkg.id}-inc-${index}`}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            <p className="package-detail-price">{formatCLP(pkg.price)}</p>

            <div className="package-detail-actions">
              <Link className="btn btn-outline-primary" to="/packages">
                Volver a paquetes
              </Link>
              {pkg.available ? (
                <Link className="btn btn-primary" to={`/bookings?package=${pkg.id}`}>
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

export default PackageDetail;

