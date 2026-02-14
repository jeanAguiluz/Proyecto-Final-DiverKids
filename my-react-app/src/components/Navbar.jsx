import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import logo from "../imgs/logocirculo1.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const toggleMenu = () => setIsOpen(!isOpen);
    const closeMenu = () => setIsOpen(false);

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

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
                <Link to="/" onClick={closeMenu}>Inicio</Link>
                <Link to="/packages" onClick={closeMenu}>Paquetes</Link>
                <Link to="/events" onClick={closeMenu}>Eventos</Link>
                <Link to="/costumes" onClick={closeMenu}>Disfraces</Link>
                <Link to="/about" onClick={closeMenu}>Nosotros</Link>
                <Link to="/contact" onClick={closeMenu}>Contacto</Link>

                {/* Mostrar según autenticación */}
                {user ? (
                    <>
                        <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                        {user.role === 'admin' && (
                            <>
                                <Link to="/admin/costumes" onClick={closeMenu}>Admin Disfraces</Link>
                                <Link to="/admin/packages" onClick={closeMenu}>Admin Paquetes</Link>
                                <Link to="/admin/contacts" onClick={closeMenu}>Admin Contactos</Link>
                            </>
                        )}
                        <button className="btn-logout" onClick={() => { closeMenu(); logout(); }}>
                            Cerrar Sesión
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn-login" onClick={closeMenu}>Iniciar Sesión</Link>
                )}
            </div>
            {isOpen && <div className="overlay" onClick={closeMenu} aria-hidden="true" />}
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
