import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { API_URL } from "../config/api";
import "../styles/Auth.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [devResetUrl, setDevResetUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    setError("");
    setMessage("");
    setDevResetUrl("");
    setLoading(true);

    try {
      const res = await axios.post(`${API_URL}/forgot-password`, { email });
      setMessage(res.data.msg || "Revisa tu correo para continuar.");
      if (res.data.dev_reset_url) {
        setDevResetUrl(res.data.dev_reset_url);
      }
    } catch (err) {
      setError(err.response?.data?.msg || "No se pudo procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card auth-card">
              <div className="card-body">
                <h2 className="text-center mb-4">Recuperar contraseña</h2>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}
                {devResetUrl && (
                  <div className="alert alert-warning">
                    Modo desarrollo: correo no entregado. Prueba con este enlace:
                    <br />
                    <a href={devResetUrl}>{devResetUrl}</a>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        handleSubmit(e);
                      }
                    }}
                    required
                  />
                </div>

                <button type="button" className="btn btn-primary w-100" onClick={handleSubmit} disabled={loading}>
                  {loading ? "Enviando..." : "Enviar enlace"}
                </button>

                <div className="mt-3 text-center">
                  <Link to="/login" className="btn btn-primary w-100 auth-secondary-btn">
                    Volver a Iniciar Sesión
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

export default ForgotPassword;
