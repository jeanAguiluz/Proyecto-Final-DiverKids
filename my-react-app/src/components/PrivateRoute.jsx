import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminRoute = ({ children }) => {
    const { user, token } = useAuth();  // Accede al estado del usuario desde el contexto de autenticación

    if (!user || !token || !user.is_admin) {
        // Si el usuario no está autenticado o no es administrador, redirige al login
        return <Navigate to="/login" />;
    }

    return children;  // Si el usuario es un administrador, renderiza el contenido protegido
};

export default AdminRoute;
