import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const COSTUME_ORDER_KEY = 'admin_costumes_order';

function AdminCostumes() {
  const formSectionRef = useRef(null);
  const [costumes, setCostumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCostume, setEditingCostume] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [costumeToDelete, setCostumeToDelete] = useState(null);
  const [orderedIds, setOrderedIds] = useState(() => {
    try {
      const raw = localStorage.getItem(COSTUME_ORDER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    size: '',
    price_per_day: '',
    image_url: '',
    available: true,
    stock_quantity: 1
  });

  const formatCLP = (value) =>
    new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0
    }).format(Number(value) || 0);

  const parseCLPNumber = (value) => {
    const onlyDigits = String(value ?? '').replace(/[^\d]/g, '');
    return Number(onlyDigits) || 0;
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    const value = imageUrl.trim();
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value;
    }
    return `/imgs/${value}`;
  };

  const fetchCostumes = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/costumes`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setCostumes(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching costumes:', error);
      setLoading(false);
    }
  }, []); // ← Array vacío = no depende de nada

  useEffect(() => {
    fetchCostumes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const normalizedOrderedIds = useMemo(() => {
    const currentIds = costumes.map((costume) => costume.id);
    const validExisting = orderedIds.filter((id) => currentIds.includes(id));
    const missingIds = currentIds.filter((id) => !validExisting.includes(id));
    return [...validExisting, ...missingIds];
  }, [costumes, orderedIds]);

  useEffect(() => {
    localStorage.setItem(COSTUME_ORDER_KEY, JSON.stringify(normalizedOrderedIds));
  }, [normalizedOrderedIds]);

  const moveCostume = (costumeId, direction) => {
    const index = normalizedOrderedIds.indexOf(costumeId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= normalizedOrderedIds.length) return;

    const nextOrder = [...normalizedOrderedIds];
    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    setOrderedIds(nextOrder);
    localStorage.setItem(COSTUME_ORDER_KEY, JSON.stringify(nextOrder));
  };

  const sortedCostumes = [...costumes].sort((a, b) => {
    const indexA = normalizedOrderedIds.indexOf(a.id);
    const indexB = normalizedOrderedIds.indexOf(b.id);
    const safeA = indexA === -1 ? Number.MAX_SAFE_INTEGER : indexA;
    const safeB = indexB === -1 ? Number.MAX_SAFE_INTEGER : indexB;
    return safeA - safeB;
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem('token');
      const config = {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      };

      const payload = {
        ...formData,
        price_per_day: parseCLPNumber(formData.price_per_day),
        stock_quantity: Number(formData.stock_quantity) || 0
      };

      if (editingCostume) {
        // Actualizar
        await axios.put(
          `${API_URL}/costumes/${editingCostume.id}`,
          payload,
          config
        );
        alert('Disfraz actualizado exitosamente');
      } else {
        // Crear
        await axios.post(`${API_URL}/costumes`, payload, config);
        alert('Disfraz creado exitosamente');
      }

      resetForm();
      fetchCostumes();
    } catch (error) {
      console.error('Error saving costume:', error);
      alert('Error al guardar el disfraz. ' + (error.response?.data?.msg || ''));
    }
  };

  const handleEdit = (costume) => {
    setEditingCostume(costume);
    setFormData({
      name: costume.name,
      description: costume.description || '',
      category: costume.category || '',
      size: costume.size || '',
      price_per_day: costume.price_per_day,
      image_url: costume.image_url || '',
      available: costume.available,
      stock_quantity: costume.stock_quantity
    });
    setShowForm(true);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/costumes/${costumeToDelete.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      alert('Disfraz eliminado exitosamente');
      setShowDeleteModal(false);
      setCostumeToDelete(null);
      fetchCostumes();
    } catch (error) {
      console.error('Error deleting costume:', error);
      alert('Error al eliminar el disfraz');
    }
  };

  const confirmDelete = (costume) => {
    setCostumeToDelete(costume);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      size: '',
      price_per_day: '',
      image_url: '',
      available: true,
      stock_quantity: 1
    });
    setEditingCostume(null);
    setShowForm(false);
  };

  return (
    <div className="admin-costumes container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎭 Gestión de Disfraces</h2>
        <button
          className="btn btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : '+ Nuevo Disfraz'}
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <div className="card mb-4" ref={formSectionRef}>
          <div className="card-body">
            <h3>{editingCostume ? 'Editar Disfraz' : 'Nuevo Disfraz'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Nombre *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label">Categoría</label>
                    <select
                      className="form-select"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="Superhéroes">Superhéroes</option>
                      <option value="Princesas">Princesas</option>
                      <option value="Personajes">Personajes</option>
                    </select>
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
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Talla</label>
                    <select
                      className="form-select"
                      value={formData.size}
                      onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                    >
                      <option value="">Seleccionar...</option>
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                    </select>
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Precio por día *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      value={formData.price_per_day}
                      onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                      required
                      placeholder="Ej: 18000 o 18.000"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                      min="0"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Disponible</label>
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.available}
                        onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      />
                    </div>
                  </div>
                </div>

                <div className="col-md-12">
                  <div className="mb-3">
                    <label className="form-label">URL de Imagen</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.image_url}
                      onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                      placeholder="Ej: /imgs/spiderman.webp o spiderman.webp o https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  {editingCostume ? 'Actualizar' : 'Crear'} Disfraz
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabla de Disfraces */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center">Cargando...</div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Imagen</th>
                    <th>Nombre</th>
                    <th>Categoría</th>
                    <th>Talla</th>
                    <th>Precio/día</th>
                    <th>Stock</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedCostumes.map((costume, index) => (
                    <tr key={costume.id}>
                      <td>{index + 1}</td>
                      <td>
                        {costume.image_url ? (
                          <img
                            src={resolveImageUrl(costume.image_url)}
                            alt={costume.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                          />
                        ) : (
                          <div style={{ width: '50px', height: '50px', background: '#f0f0f0', borderRadius: '5px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            🎭
                          </div>
                        )}
                      </td>
                      <td>{costume.name}</td>
                      <td>{costume.category || '-'}</td>
                      <td>{costume.size || '-'}</td>
                      <td>{formatCLP(costume.price_per_day)}</td>
                      <td>{costume.stock_quantity}</td>
                      <td>
                        <span className={`badge ${costume.available ? 'bg-success' : 'bg-danger'}`}>
                          {costume.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => moveCostume(costume.id, 'up')}
                          title="Subir"
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => moveCostume(costume.id, 'down')}
                          title="Bajar"
                        >
                          ↓
                        </button>
                        <button
                          className="btn btn-sm btn-warning me-2"
                          onClick={() => handleEdit(costume)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger"
                          onClick={() => confirmDelete(costume)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar Disfraz</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de eliminar "{costumeToDelete?.name}"?</p>
                <p className="text-danger">Esta acción no se puede deshacer.</p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                  Cancelar
                </button>
                <button type="button" className="btn btn-danger" onClick={handleDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCostumes;
