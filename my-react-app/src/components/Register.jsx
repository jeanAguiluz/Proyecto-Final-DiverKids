import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../config/api';
import '../styles/Auth.css';

function Register() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await axios.post(`${API_URL}/signup`, formData);
            alert('Cuenta creada exitosamente. Por favor inicia sesión.');
            navigate('/login');
        } catch (error) {
            console.error('Error al registrar:', error);
            setError(error.response?.data?.msg || 'Error al crear la cuenta');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div className="auth-page">
            <div className="container mt-5">
                <div className="row justify-content-center">
                    <div className="col-md-6">
                        <div className="card auth-card">
                            <div className="card-body">
                                <h2 className="text-center mb-4">Crear Cuenta</h2>

                                {error && (
                                    <div className="alert alert-danger" role="alert">
                                        {error}
                                    </div>
                                )}

                                <form onSubmit={handleSubmit}>
                                    <div className="mb-3">
                                        <label className="form-label">Nombre Completo *</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            name="name"
                                            value={formData.name}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Email *</label>
                                        <input
                                            type="email"
                                            className="form-control"
                                            name="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Teléfono</label>
                                        <input
                                            type="tel"
                                            className="form-control"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="+56912345678"
                                        />
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Contraseña *</label>
                                        <input
                                            type="password"
                                            className="form-control"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleChange}
                                            required
                                            minLength="6"
                                        />
                                        <small className="text-muted">Mínimo 6 caracteres</small>
                                    </div>

                                    <button
                                        type="submit"
                                        className="btn btn-primary w-100"
                                        disabled={loading}
                                    >
                                        {loading ? 'Creando cuenta...' : 'Registrarse'}
                                    </button>
                                </form>

                                <div className="mt-3 text-center">
                                    <p>
                                        ¿Ya tienes cuenta?{' '}
                                        <Link to="/login">Inicia sesión aquí</Link>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Register;
