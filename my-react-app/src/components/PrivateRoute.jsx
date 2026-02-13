import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

function PrivateRoute({ children, requireAdmin = false }) {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // No está autenticado
    if (!user) {
        return <Navigate to="/login" />;
    }

    // Requiere admin pero no lo es
    if (requireAdmin && user.role !== 'admin') {
        return <Navigate to="/" />;
    }

    return children;
}

export default PrivateRoute;