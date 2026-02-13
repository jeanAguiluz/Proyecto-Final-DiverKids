import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "../styles/estilosPaguinas.css";
import '../styles/Packages.css';
import { API_URL } from '../config/api';

const PACKAGE_ORDER_KEY = 'admin_packages_order';

function Packages() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    available: true
  });

  const fetchPackages = useCallback(async () => {
    try {
      const params = {};
      if (filters.available) {
        params.available = 'true';
      }

      const response = await axios.get(`${API_URL}/packages`, { params });
      setPackages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setError('Error al cargar los paquetes');
      setLoading(false);
    }
  }, [filters.available]);

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
    fetchPackages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrar por búsqueda
  const filteredPackages = packages.filter(pkg =>
    pkg.name.toLowerCase().includes(filters.search.toLowerCase()) ||
    (pkg.description && pkg.description.toLowerCase().includes(filters.search.toLowerCase()))
  );

  const getPackageOrder = () => {
    try {
      const raw = localStorage.getItem(PACKAGE_ORDER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const packageOrder = getPackageOrder();

  const sortedFilteredPackages = [...filteredPackages].sort((a, b) => {
    const indexA = packageOrder.indexOf(a.id);
    const indexB = packageOrder.indexOf(b.id);
    const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    return safeA - safeB;
  });

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
    <div className="packages-page">
      <div className="packages-header">
        <div className="hero-title">
        <h1>
          <span className="fixed-emoji">🎊</span> Paquetes de Animación
        </h1>
        </div>
        <p>Celebra con diversión garantizada</p>
      </div>

      <div className="container mt-4">
        {/* Filtros */}
        <div className="filters-section mb-4">
          <div className="row">
            <div className="col-md-8">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar paquete..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={filters.available}
                  onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                  id="availableCheck"
                />
                <label className="form-check-label" htmlFor="availableCheck">
                  Solo disponibles
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de Paquetes */}
        <div className="packages-grid">
          {filteredPackages.length === 0 ? (
            <div className="col-12 text-center">
              <p>No se encontraron paquetes</p>
            </div>
          ) : (
            sortedFilteredPackages.map(pkg => (
              <div key={pkg.id} className="package-card">
                <Link to={`/packages/${pkg.id}`} className="package-image-link">
                  <div className="package-image">
                    {pkg.image_url ? (
                      <img src={resolveImageUrl(pkg.image_url)} alt={pkg.name} />
                    ) : (
                      <div className="placeholder-image">🎉</div>
                    )}
                    {!pkg.available && (
                      <span className="badge bg-danger position-absolute top-0 end-0 m-2">
                        No disponible
                      </span>
                    )}
                  </div>
                </Link>

                <div className="package-body">
                  <div className="package-header-info">
                    <span className="badge bg-info">{pkg.duration_hours}h</span>
                    {pkg.max_children && (
                      <span className="badge bg-secondary">Max {pkg.max_children} niños</span>
                    )}
                  </div>

                  <h3 className="package-title">
                    <Link to={`/packages/${pkg.id}`} className="package-title-link">
                      {pkg.name}
                    </Link>
                  </h3>

                  {pkg.description && (
                    <p className="package-description">{pkg.description}</p>
                  )}

                  {pkg.includes && (
                    <div className="package-includes">
                      <strong>Incluye:</strong>
                      <ul>
                        {parseIncludes(pkg.includes).map((item, index) => (
                          <li key={`${pkg.id}-include-${index}`}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="package-footer">
                    <div className="package-price">
                      {formatCLP(pkg.price)}
                    </div>
                    <div className="package-footer-actions">
                      <Link to={`/packages/${pkg.id}`} className="btn btn-outline-dark">
                        Detalle
                      </Link>
                      {pkg.available ? (
                        <Link
                          to={`/bookings?package=${pkg.id}`}
                          className="btn btn-primary"
                        >
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default Packages;
