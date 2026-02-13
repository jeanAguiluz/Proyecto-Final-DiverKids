import React from 'react';
import '../styles/Footer.css';

export default function Footer() {
    return (
        <footer className="footer">
            {/* Sección de información */}
            <div className="footer-info">
                <div className="container">
                    <div className="row g-4">
                        {/* Teléfonos */}
                        <div className="col-md-4">
                            <div className="footer-section">
                                <div className="footer-icon">📞</div>
                                <h4>Teléfonos & email</h4>
                                <p>Celular: +569 54839845</p>
                                <p>diverkidsinfo@gmail.com</p>
                            </div>
                        </div>

                        {/* Horario */}
                        <div className="col-md-4">
                            <div className="footer-section">
                                <div className="footer-icon">🕐</div>
                                <h4>Horario de atención</h4>
                                <p>Domingo a Domingo</p>
                                <p>Disponibilidad de Horario</p>
                            </div>
                        </div>

                        {/* Redes Sociales */}
                        <div className="col-md-4">
                            <div className="footer-section">
                                <div className="footer-icon">📱</div>
                                <h4>Redes sociales</h4>
                                <div className="social-icons">
                                    <a href="https://www.facebook.com/profile.php?id=61566973441770" target="_blank" rel="noopener noreferrer" className="social-icon facebook">
                                        <i className="fab fa-facebook-f"></i>
                                    </a>
                                    <a href="https://www.instagram.com/eventosdiverkids.cl?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D&fbclid=IwY2xjawP41p5leHRuA2FlbQIxMABicmlkETFJWWc5RHNueTlUZGVTdUkwc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjKoKCF_51EgcWMTl-Qgfkw9-iwNBNQw-Y0c72-zs7vBJT5g1hTeCrSwqWzr_aem_26VKGCCg_OF23UcloOhr-Q" target="_blank" rel="noopener noreferrer" className="social-icon instagram">
                                        <i className="fab fa-instagram"></i>
                                    </a>
                                    
                                    <a href="https://www.tiktok.com/@diverkids.cl?_r=1&_t=ZS-93bJsTg88PQ" target="_blank" rel="noopener noreferrer" className="social-icon tiktok">
                                        <i className="fa-brands fa-tiktok"></i>
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sección de cierre amarilla */}
            <div className="footer-bottom">
                <div className="footer-wave"></div>
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src="/imgs/logocirculo1.svg" alt="DiverKids Logo" />
                    </div>
                    <p className="footer-description">
                        Únete a nuestra comunidad y descubre la magia de DiverKids Eventos.<br />
                        Nos especializamos en la creación de experiencias únicas y emocionantes para eventos<br />
                        de entretenimiento. Contáctanos hoy mismo para conocer más sobre nuestros servicios y<br />
                        asegura tu próximo evento con nosotros.
                    </p>
                    <div className="footer-credits">
                        <p>Copyright © 2026 DiverKids</p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
