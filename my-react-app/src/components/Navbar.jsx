import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import logo from "../imgs/logocirculo1.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => setIsOpen(!isOpen);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-brand">
                    <img src={logo} alt="Logo DiverKids" className="logo" />
                </Link>
            </div>

            {/* Botón hamburguesa */}
            <button className="hamburger" onClick={toggleMenu}>
                ☰
            </button>

            <div className={`navbar-right ${isOpen ? "open" : ""}`}>
                <Link to="/">Inicio</Link>
                <Link to="/packages">Paquetes</Link>
                <Link to="/events">Eventos</Link>
                <Link to="/costumes">Disfraces</Link>
                <Link to="/about">Nosotros</Link>
                <Link to="/contact">Contacto</Link>

                {/* Mostrar según autenticación */}
                {user ? (
                    <>
                        <Link to="/dashboard">Dashboard</Link>
                        {user.role === 'admin' && (
                            <>
                                <Link to="/admin/costumes">Admin Disfraces</Link>
                                <Link to="/admin/packages">Admin Paquetes</Link>
                                <Link to="/admin/contacts">Admin Contactos</Link>
                            </>
                        )}
                        <button className="btn-logout" onClick={logout}>
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn-login">Iniciar Sesión</Link>
                )}
            </div>
            <svg
                className="navbar-wave"
                viewBox="0 0 1440 220"
                preserveAspectRatio="none"
                aria-hidden="true"
            >
                <path d="M0,78 C210,18 430,42 640,112 C860,186 1070,162 1250,112 C1328,90 1388,84 1440,92 L1440,220 L0,220 Z" />
            </svg>
        </nav>
    );
}
