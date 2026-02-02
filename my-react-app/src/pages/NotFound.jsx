import { Link } from "react-router-dom";

function NotFound() {
    return (
        <div style={{ padding: "2rem", textAlign: "center" }}>
            <h1>404</h1>
            <p>Página no encontrada</p>

            <Link to="/">Volver al Home</Link>
        </div>
    );
}

export default NotFound;
