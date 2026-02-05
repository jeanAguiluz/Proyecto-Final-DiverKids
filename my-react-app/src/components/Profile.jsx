import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Profile() {
    const { user } = useContext(AuthContext);

    if (!user) return <p>Acceso denegado</p>;

    return (
        <div>
            <h1>Perfil del usuario</h1>
            <p>ID: {user.id}</p>
            <p>Email: {user.email}</p>
            <p>Role: {user.role}</p>
        </div>
    );
}
