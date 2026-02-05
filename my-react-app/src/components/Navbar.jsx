import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import logo from "../imgs/logocirculo1.svg";
import bgImage from "../imgs/logo-bg-navbar.svg"; // tu imagen redimensionada
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css";

export default function Navbar() {
    const { user, logout } = useContext(AuthContext);
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar" style={{ backgroundImage: `url(${bgImage})` }}>
            <div className="navbar-left">
                <img src={logo} alt="Logo DiverKids" className="logo" />
            </div>

            {/* Botón hamburguesa */}
            <button className="hamburger" onClick={toggleMenu}>
                ☰
            </button>

            <div className={`navbar-right ${isOpen ? "open" : ""}`}>
                <Link to="/">Inicio</Link>
                <Link to="/about">Nosotros</Link>
                <Link to="/contact">Contacto</Link>
                <Link to="/events">Events</Link>
                {user ? (
                    <>
                        <Link to="/profile">Profile</Link>
                        <button className="btn-logout" onClick={logout}>
                            Logout
                        </button>
                    </>
                ) : (
                    <Link to="/login">Mi Cuenta</Link>
                )}
            </div>
        </nav>
    );
}
