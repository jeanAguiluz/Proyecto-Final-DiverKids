import { useState, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import axiosInstance from '../axiosConfig';  // Asegúrate de que Axios esté configurado correctamente

export default function Login() {
    const { login } = useContext(AuthContext);  // Accede a la función login del contexto
    const [email, setEmail] = useState("");  // Estado para el email
    const [password, setPassword] = useState("");  // Estado para la contraseña
    const [errorMessage, setErrorMessage] = useState("");  // Estado para manejar errores

    const handleSubmit = async (e) => {
        e.preventDefault();  // Prevenir el comportamiento predeterminado del formulario

        try {
            // Enviar la solicitud POST usando Axios al backend
            const res = await axiosInstance.post("http://127.0.0.1:5000/api/login", { email, password });

            if (res.status === 200) {
                // Almacenar el token en el almacenamiento local
                localStorage.setItem("token", res.data.token);

                // Llamar a la función login del contexto para actualizar el estado global
                login(res.data.user, res.data.token);

                // Redirigir a la página protegida (por ejemplo, perfil)
                window.location.href = "/profile";

                alert("Login exitoso!");
            }
        } catch (err) {
            // Manejar errores (por ejemplo, usuario no encontrado, etc.)
            if (err.response && err.response.data) {
                setErrorMessage(err.response.data.msg);  // Mostrar mensaje de error
            } else {
                setErrorMessage("Hubo un error al intentar iniciar sesión");
            }
        }
    };

    return (
        <div className="container mt-4">
            <h2>Login</h2>
            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>} {/* Mostrar mensaje de error */}
            <form onSubmit={handleSubmit} className="w-50 mx-auto">
                <input
                    className="form-control mb-2"
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}  // Actualizar el estado del email
                />
                <input
                    className="form-control mb-2"
                    type="password"
                    placeholder="Contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}  // Actualizar el estado de la contraseña
                />
                <button className="btn btn-primary w-100" type="submit">
                    Login
                </button>
            </form>
        </div>
    );
}