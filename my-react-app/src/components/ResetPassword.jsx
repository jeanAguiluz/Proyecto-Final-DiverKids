import React, { useState } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { API_URL } from "../config/api";
import "../styles/Auth.css";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!token) {
      setError("Token inválido o faltante.");
      return;
    }

    if (newPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/reset-password`, {
        token,
        new_password: newPassword
      });
      setMessage(res.data.msg || "Contraseña actualizada correctamente.");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.msg || "No se pudo restablecer la contraseña.");
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
                <h2 className="text-center mb-4">Nueva contraseña</h2>

                {message && <div className="alert alert-success">{message}</div>}
                {error && <div className="alert alert-danger">{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Nueva contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Confirmar contraseña</label>
                    <input
                      type="password"
                      className="form-control"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      minLength={6}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary w-100" disabled={loading}>
                    {loading ? "Guardando..." : "Actualizar contraseña"}
                  </button>
                </form>

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

export default ResetPassword;
