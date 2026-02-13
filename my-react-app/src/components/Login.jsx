import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import '../styles/Auth.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/'); // Redirigir al home
    } else {
      setError(result.message);
    }

    setLoading(false);
  };

  return (
    <div className="auth-page">
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card auth-card">
            <div className="card-body">
              <div className="login-title-card mb-4">
                <h2 className="text-center mb-0 login-rainbow-title">Iniciar Sesión</h2>
              </div>

              {error && (
                <div className="alert alert-danger" role="alert">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <input
                    type="password"
                    className="form-control"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100"
                  disabled={loading}
                >
                  {loading ? 'Cargando...' : 'Iniciar Sesión'}
                </button>
              </form>

              <div className="mt-3 d-grid gap-2">
                <Link to="/register" className="btn btn-primary auth-mini-btn">
                  📝 Regístrate aquí
                </Link>
                <Link to="/forgot-password" className="btn btn-primary auth-mini-btn">
                  🔐 ¿Olvidaste tu contraseña?
                </Link>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
</div>
  );
}

export default Login;
