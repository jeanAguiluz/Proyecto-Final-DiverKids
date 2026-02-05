// src/context/components/AdminRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';  // Asegúrate de que la importación sea correcta

const AdminRoute = ({ children }) => {
    const { user } = useAuth();  // Obtiene el usuario del contexto de autenticación

    if (!user || !user.is_admin) {
        // Si el usuario no está autenticado o no es administrador, redirige al login
        return <Navigate to="/login" />;
    }

    return children;  // Si el usuario es un administrador, renderiza el contenido protegido
};

export default AdminRoute;
