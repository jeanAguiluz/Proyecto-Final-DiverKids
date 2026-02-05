import { useState } from 'react';
import axiosInstance from '../axiosConfig'; // Importamos la configuración de Axios

export default function Register() {
    const [email, setEmail] = useState("");  // Estado para el email
    const [password, setPassword] = useState("");  // Estado para la contraseña
    const [errorMessage, setErrorMessage] = useState("");  // Estado para manejar los errores
    const [successMessage, setSuccessMessage] = useState("");  // Estado para mostrar el éxito

    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevenir el comportamiento predeterminado del formulario

        try {
            // Realizar la solicitud POST al backend
            const res = await axiosInstance.post("/api/register", { email, password });

            // Mostrar el mensaje de éxito en el frontend
            setSuccessMessage(res.data.msg);  // Mensaje exitoso del backend

            // Limpiar los campos de entrada después del registro exitoso
            setEmail("");
            setPassword("");
        } catch (err) {
            // Si hay un error, mostrar el mensaje de error
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.msg);  // Mensaje de error del backend
            } else {
                setErrorMessage("Hubo un error al intentar registrar el usuario");
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>Registro de Usuario</h2>

            {/* Mostrar mensaje de éxito si se registró correctamente */}
            {successMessage && <div className="alert alert-success">{successMessage}</div>}

            {/* Mostrar mensaje de error si ocurrió algún problema */}
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="w-50 mx-auto">
                <input
                    className="form-control mb-2"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}  // Actualizar estado del email
                />
                <input
                    className="form-control mb-2"
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}  // Actualizar estado de la contraseña
                />
                <button className="btn btn-primary w-100" type="submit">
                    Registrar
                </button>
            </form>
        </div>
    );
}
