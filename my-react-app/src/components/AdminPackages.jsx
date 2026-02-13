import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import axios from 'axios';
import { API_URL } from '../config/api';

const PACKAGE_ORDER_KEY = 'admin_packages_order';

function AdminPackages() {
  const formSectionRef = useRef(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPackage, setEditingPackage] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [packageToDelete, setPackageToDelete] = useState(null);
  const [orderedIds, setOrderedIds] = useState(() => {
    try {
      const raw = localStorage.getItem(PACKAGE_ORDER_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_hours: 2,
    price: '',
    includes: '',
    max_children: '',
    image_url: '',
    available: true
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

  const normalizeIncludesInput = (value) => {
    if (Array.isArray(value)) return value.join('\n');
    return value || '';
  };

  const formatIncludesForPayload = (value) =>
    String(value || '')
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean)
      .join(', ');

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return '';
    const value = imageUrl.trim();
    if (value.startsWith('http://') || value.startsWith('https://') || value.startsWith('/')) {
      return value;
    }
    return `/imgs/${value}`;
  };

  const fetchPackages = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/packages`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setPackages(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching packages:', error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPackages();
  }, [fetchPackages]);

  const normalizedOrderedIds = useMemo(() => {
    const currentIds = packages.map((pkg) => pkg.id);
    const validExisting = orderedIds.filter((id) => currentIds.includes(id));
    const missingIds = currentIds.filter((id) => !validExisting.includes(id));
    return [...validExisting, ...missingIds];
  }, [packages, orderedIds]);

  useEffect(() => {
    localStorage.setItem(PACKAGE_ORDER_KEY, JSON.stringify(normalizedOrderedIds));
  }, [normalizedOrderedIds]);

  const movePackage = (packageId, direction) => {
    const index = normalizedOrderedIds.indexOf(packageId);
    if (index === -1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= normalizedOrderedIds.length) return;

    const nextOrder = [...normalizedOrderedIds];
    [nextOrder[index], nextOrder[targetIndex]] = [nextOrder[targetIndex], nextOrder[index]];
    setOrderedIds(nextOrder);
    localStorage.setItem(PACKAGE_ORDER_KEY, JSON.stringify(nextOrder));
  };

  const sortedPackages = [...packages].sort((a, b) => {
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
        duration_hours: Number(formData.duration_hours) || 2,
        price: parseCLPNumber(formData.price),
        max_children: formData.max_children ? Number(formData.max_children) : null,
        includes: formatIncludesForPayload(formData.includes)
      };

      if (editingPackage) {
        await axios.put(`${API_URL}/packages/${editingPackage.id}`, payload, config);
        alert('Paquete actualizado exitosamente');
      } else {
        await axios.post(`${API_URL}/packages`, payload, config);
        alert('Paquete creado exitosamente');
      }

      resetForm();
      fetchPackages();
    } catch (error) {
      console.error('Error saving package:', error);
      alert('Error al guardar el paquete. ' + (error.response?.data?.msg || ''));
    }
  };

  const handleEdit = (pkg) => {
    setEditingPackage(pkg);
    setFormData({
      name: pkg.name || '',
      description: pkg.description || '',
      duration_hours: pkg.duration_hours ?? 2,
      price: pkg.price ?? '',
      includes: normalizeIncludesInput(pkg.includes),
      max_children: pkg.max_children ?? '',
      image_url: pkg.image_url || '',
      available: Boolean(pkg.available)
    });
    setShowForm(true);
    setTimeout(() => {
      formSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/packages/${packageToDelete.id}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });

      alert('Paquete eliminado exitosamente');
      setShowDeleteModal(false);
      setPackageToDelete(null);
      fetchPackages();
    } catch (error) {
      console.error('Error deleting package:', error);
      alert('Error al eliminar el paquete');
    }
  };

  const confirmDelete = (pkg) => {
    setPackageToDelete(pkg);
    setShowDeleteModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      duration_hours: 2,
      price: '',
      includes: '',
      max_children: '',
      image_url: '',
      available: true
    });
    setEditingPackage(null);
    setShowForm(false);
  };

  return (
    <div className="admin-packages container mt-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>🎊 Gestión de Paquetes</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancelar' : '+ Nuevo Paquete'}
        </button>
      </div>

      {showForm && (
        <div className="card mb-4" ref={formSectionRef}>
          <div className="card-body">
            <h3>{editingPackage ? 'Editar Paquete' : 'Nuevo Paquete'}</h3>
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

                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Duración (horas)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.duration_hours}
                      onChange={(e) => setFormData({ ...formData, duration_hours: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="col-md-3">
                  <div className="mb-3">
                    <label className="form-label">Precio *</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      className="form-control"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="Ej: 15000 o 15.000"
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
                    />
                  </div>
                </div>

                <div className="col-md-8">
                  <div className="mb-3">
                    <label className="form-label">Incluye</label>
                    <textarea
                      className="form-control"
                      rows="4"
                      value={formData.includes}
                      onChange={(e) => setFormData({ ...formData, includes: e.target.value })}
                      placeholder={'Ej:\nAnimador\nShow principal\nPintacaritas'}
                    />
                    <small className="text-muted">Escribe un item por línea.</small>
                  </div>
                </div>

                <div className="col-md-2">
                  <div className="mb-3">
                    <label className="form-label">Máx. niños</label>
                    <input
                      type="number"
                      className="form-control"
                      value={formData.max_children}
                      onChange={(e) => setFormData({ ...formData, max_children: e.target.value })}
                      min="1"
                    />
                  </div>
                </div>

                <div className="col-md-2">
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
                      placeholder="Ej: /imgs/4.svg o 4.svg o https://..."
                    />
                  </div>
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">
                  {editingPackage ? 'Actualizar' : 'Crear'} Paquete
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
                    <th>Duración</th>
                    <th>Precio</th>
                    <th>Máx. niños</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedPackages.map((pkg, index) => (
                    <tr key={pkg.id}>
                      <td>{index + 1}</td>
                      <td>
                        {pkg.image_url ? (
                          <img
                            src={resolveImageUrl(pkg.image_url)}
                            alt={pkg.name}
                            style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '5px' }}
                          />
                        ) : (
                          <div
                            style={{
                              width: '50px',
                              height: '50px',
                              background: '#f0f0f0',
                              borderRadius: '5px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            🎊
                          </div>
                        )}
                      </td>
                      <td>{pkg.name}</td>
                      <td>{pkg.duration_hours}h</td>
                      <td>{formatCLP(pkg.price)}</td>
                      <td>{pkg.max_children ?? '-'}</td>
                      <td>
                        <span className={`badge ${pkg.available ? 'bg-success' : 'bg-danger'}`}>
                          {pkg.available ? 'Disponible' : 'No disponible'}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => movePackage(pkg.id, 'up')}
                          title="Subir"
                        >
                          ↑
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => movePackage(pkg.id, 'down')}
                          title="Bajar"
                        >
                          ↓
                        </button>
                        <button className="btn btn-sm btn-warning me-2" onClick={() => handleEdit(pkg)}>
                          ✏️
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => confirmDelete(pkg)}>
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

      {showDeleteModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Eliminar Paquete</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeleteModal(false)}></button>
              </div>
              <div className="modal-body">
                <p>¿Estás seguro de eliminar "{packageToDelete?.name}"?</p>
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

export default AdminPackages;
