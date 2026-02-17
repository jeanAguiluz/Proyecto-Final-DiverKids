import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import logo from "../imgs/logocirculo1.svg";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/Navbar.css";

export default function Navbar() {
    const { user, logout } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);
    const location = useLocation();
    const adminMenuRef = useRef(null);

    const toggleMenu = () => {
        setIsOpen((prevOpen) => {
            const nextOpen = !prevOpen;
            if (!nextOpen) {
                setIsAdminMenuOpen(false);
            }
            return nextOpen;
        });
    };

    const closeMenu = () => {
        setIsOpen(false);
        setIsAdminMenuOpen(false);
    };

    const toggleAdminMenu = () => {
        setIsAdminMenuOpen((prevOpen) => !prevOpen);
    };

    useEffect(() => {
        closeMenu();
    }, [location.pathname]);

    useEffect(() => {
        if (!isAdminMenuOpen) return undefined;

        const handleOutsideClick = (event) => {
            if (adminMenuRef.current && !adminMenuRef.current.contains(event.target)) {
                setIsAdminMenuOpen(false);
            }
        };

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setIsAdminMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        document.addEventListener('touchstart', handleOutsideClick);
        document.addEventListener('keydown', handleEscape);

        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
            document.removeEventListener('touchstart', handleOutsideClick);
            document.removeEventListener('keydown', handleEscape);
        };
    }, [isAdminMenuOpen]);

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="navbar-brand">
                    <img src={logo} alt="Logo DiverKids" className="logo" />
                </Link>
            </div>

            {/* Boton hamburguesa */}
            <button type="button" className="hamburger" onClick={toggleMenu}>
                ☰
            </button>

            <div className={`navbar-right ${isOpen ? "open" : ""}`}>
                <Link to="/" onClick={closeMenu}>Inicio</Link>
                <Link to="/packages" onClick={closeMenu}>Paquetes</Link>
                <Link to="/events" onClick={closeMenu}>Eventos</Link>
                <Link to="/costumes" onClick={closeMenu}>Disfraces</Link>
                <Link to="/about" onClick={closeMenu}>Nosotros</Link>
                <Link to="/contact" onClick={closeMenu}>Contacto</Link>

                {/* Mostrar segun autenticacion */}
                {user ? (
                    <>
                        <Link to="/dashboard" onClick={closeMenu}>Dashboard</Link>
                        {user.role === 'admin' && (
                            <div className={`admin-menu ${isAdminMenuOpen ? 'open' : ''}`} ref={adminMenuRef}>
                                <button
                                    type="button"
                                    className="admin-menu-trigger"
                                    onClick={toggleAdminMenu}
                                    aria-expanded={isAdminMenuOpen}
                                    aria-haspopup="true"
                                >
                                    Admin
                                    <span className="admin-menu-caret" aria-hidden="true">▾</span>
                                </button>
                                <div className={`admin-submenu ${isAdminMenuOpen ? 'open' : ''}`}>
                                    <Link to="/admin/costumes" onClick={closeMenu}>Admin Disfraces</Link>
                                    <Link to="/admin/packages" onClick={closeMenu}>Admin Paquetes</Link>
                                    <Link to="/admin/contacts" onClick={closeMenu}>Admin Contactos</Link>
                                </div>
                            </div>
                        )}
                        <button className="btn-logout" onClick={() => { closeMenu(); logout(); }}>
                            Cerrar Sesion
                        </button>
                    </>
                ) : (
                    <Link to="/login" className="btn-login" onClick={closeMenu}>Iniciar Sesion</Link>
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
