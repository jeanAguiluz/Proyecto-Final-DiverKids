import { createContext, useState, useContext } from 'react';

// Crear el contexto de autenticación
// eslint-disable-next-line react-refresh/only-export-components
export const AuthContext = createContext();

// Crear el hook useAuth
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
    return useContext(AuthContext); // Usamos useContext para obtener el contexto de autenticación
};

// Crear el proveedor del contexto de autenticación
export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);  // Estado para manejar el usuario
    const [token, setToken] = useState(null);  // Estado para manejar el token

    const login = (userData, jwtToken) => {
        setUser(userData);  // Guardamos el usuario
        setToken(jwtToken);  // Guardamos el token
    };

    const logout = () => {
        setUser(null);  // Limpiamos el estado del usuario
        setToken(null);  // Limpiamos el token
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout }}>
            {children}  {/* Proveemos el contexto a los componentes hijos */}
        </AuthContext.Provider>
    );
}
