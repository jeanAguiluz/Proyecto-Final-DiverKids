import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import "../styles/estilosPaguinas.css";
import '../styles/Costumes.css';
import { API_URL } from '../config/api';

const COSTUME_ORDER_KEY = 'admin_costumes_order';

function Costumes() {
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    available: true
  });

  const fetchCostumes = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();

      if (filters.category) params.append('category', filters.category);
      if (filters.available) params.append('available', 'true');

      const response = await axios.get(`${API_URL}/costumes?${params}`);

      console.log('Response from API:', response.data); // Debug

      let filteredCostumes = response.data;

      // Validar que sea un array
      if (!Array.isArray(filteredCostumes)) {
        console.error('Response is not an array:', filteredCostumes);
        setError('Error: respuesta inválida del servidor');
        setLoading(false);
        return;
      }

      if (filters.search) {
        filteredCostumes = filteredCostumes.filter(costume =>
          costume.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          costume.description?.toLowerCase().includes(filters.search.toLowerCase())
        );
      }

      setCostumes(filteredCostumes);
      setError(null);
    } catch (err) {
      console.error('Error fetching costumes:', err);
      setError('Error al cargar los disfraces. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    const value = imageUrl.trim();
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value;
    }
    return `/imgs/${value}`;
  };

  useEffect(() => {
    fetchCostumes();
  }, [fetchCostumes]);

  const categories = ['Superhéroes', 'Princesas', 'Personajes'];

  const formatCLP = (value) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);

  const getDescriptionParts = (description) => {
    const raw = String(description || '').trim();
    if (!raw) return { title: '', items: [] };

    const byLinesOrDashes = raw
      .split(/\r?\n|(?=\s*-\s)/)
      .map((item) => item.replace(/^\s*-\s*/, '').trim())
      .filter(Boolean);

    if (byLinesOrDashes.length > 1) {
      return {
        title: byLinesOrDashes[0],
        items: byLinesOrDashes.slice(1)
      };
    }

    const bySentences = raw
      .split(/[.!?]+(?=\s|$)/)
      .map((item) => item.trim())
      .filter(Boolean);

    return {
      title: bySentences[0] || raw,
      items: bySentences.slice(1)
    };
  };

  const getCostumeOrder = () => {
    try {
      const raw = localStorage.getItem(COSTUME_ORDER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  };

  const costumeOrder = getCostumeOrder();

  const sortedCostumes = [...costumes].sort((a, b) => {
    const indexA = costumeOrder.indexOf(a.id);
    const indexB = costumeOrder.indexOf(b.id);
    const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    return safeA - safeB;
  });

  return (
    <div className="costumes-page">
      {/* Header */}
      <div className="costumes-header">
        <div className="container">
          <h1>🎭 Catálogo de Disfraces</h1>
          <p>Encuentra el disfraz perfecto para tu fiesta</p>
        </div>
      </div>

      <div className="container">
        {/* Filtros */}
        <div className="filters-section">
          <div className="row">
            <div className="col-md-4">
              <input
                type="text"
                className="form-control"
                placeholder="🔍 Buscar disfraz..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              />
            </div>
            <div className="col-md-4">
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              >
                <option value="">Todas las categorías</option>
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="col-md-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="availableOnly"
                  checked={filters.available}
                  onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                />
                <label className="form-check-label" htmlFor="availableOnly">
                  Solo disponibles
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="text-center my-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}

        {/* Grid de Disfraces */}
        {!loading && !error && (
          <>
            <div className="costumes-count">
              <p>{costumes.length} disfraz{costumes.length !== 1 ? 'es' : ''} encontrado{costumes.length !== 1 ? 's' : ''}</p>
            </div>

            <div className="row">
              {costumes.length === 0 ? (
                <div className="col-12 text-center my-5">
                  <p>No se encontraron disfraces con estos filtros.</p>
                </div>
              ) : (
                Array.isArray(sortedCostumes) && sortedCostumes.map(costume => (
                  <div key={costume.id} className="col-md-4 col-sm-6 mb-4">
                    <div className="costume-card">
                      <Link to={`/costumes/${costume.id}`} className="costume-image-link">
                        <div className="costume-image">
                          {costume.image_url ? (
                            <img src={resolveImageUrl(costume.image_url)} alt={costume.name} />
                          ) : (
                            <div className="placeholder-image">
                              <span>🎭</span>
                            </div>
                          )}
                          {!costume.available && (
                            <div className="not-available-badge">No disponible</div>
                          )}
                        </div>
                      </Link>
                      <div className="costume-info">
                        <h5>
                          <Link to={`/costumes/${costume.id}`} className="costume-title-link">
                            {costume.name}
                          </Link>
                        </h5>
                        {costume.category && (
                          <span className="badge bg-secondary mb-2">{costume.category}</span>
                        )}
                        {costume.size && (
                          <span className="badge bg-info ms-2">{costume.size}</span>
                        )}
                        {costume.description ? (
                          (() => {
                            const { title, items } = getDescriptionParts(costume.description);
                            return (
                              <div className="costume-description-wrapper">
                                <p className="costume-description-title">{title}</p>
                                {items.length > 0 && (
                                  <ul className="costume-description-list">
                                    {items.map((item, index) => (
                                      <li key={`${costume.id}-desc-${index}`}>{item}</li>
                                    ))}
                                  </ul>
                                )}
                              </div>
                            );
                          })()
                        ) : (
                          <p className="costume-description">Sin descripción</p>
                        )}
                        <div className="costume-footer">
                          <div className="costume-price">
                            {formatCLP(costume.price_per_day)}
                            <small>/día</small>
                          </div>
                          <div className="costume-footer-actions">
                            <Link to={`/costumes/${costume.id}`} className="btn btn-outline-dark">
                              Detalle
                            </Link>
                            <Link
                              to={`/bookings?costume=${costume.id}`}
                              className={`btn btn-primary ${!costume.available ? 'disabled' : ''}`}
                            >
                              Reservar
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Costumes;
