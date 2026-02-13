import React from "react";
import { Carousel } from 'react-bootstrap';
import "../styles/estilosPaguinas.css";
import img1 from '../imgs/carrusel-N/1.svg';
import img2 from '../imgs/carrusel-N/2.svg';
import img3 from '../imgs/carrusel-N/3.svg';
import img4 from '../imgs/carrusel-N/4.svg';
import img5 from '../imgs/carrusel-N/5.svg';
import 'bootstrap/dist/css/bootstrap.min.css';

export default function About() {
    return (
        <div className="about-page-bg">
            <div className="container text-center about-page">
                <div className="hero-section text-center">
                <h1 className="hero-title  font-size=3.0rem">Nosotros</h1>
                </div>

                <div className="row mt-auto about-team-row">
                    <div className="col-md-12">
                        <div className="card shadow-sm h-100 p-3"> 
                        <h3>Conoce nuestro equipo</h3><br />  
                        <p>Detrás de cada sonrisa y cada show inolvidable está el talentoso equipo de Diver Kids. Somos animadores, artistas y creadores apasionados por la diversión, dedicados a transformar cada evento en una experiencia mágica, llena de energía, creatividad y momentos que quedarán en el corazón de grandes y pequeños.</p>
                        </div>
                    </div>
                </div>

                {/* Carrusel con React Bootstrap */}
                <Carousel className="mb-5 custom-carousel" fade interval={3000}>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img1}
                            alt="Nosotros 1"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img2}
                            alt="Nosotros 2"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img3}
                            alt="Nosotros 3"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img4}
                            alt="Nosotros 4"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img5}
                            alt="Nosotros 5"
                        />
                    </Carousel.Item>
                </Carousel>

                <div className="row mt-4">
                    <div className="col-md-4 mb-3">
                        <div className="card shadow-sm h-100 p-3 about-value-card about-mision">
                            <h4>Misión</h4>
                            <p>Crear momentos inolvidables para los niños y sus familias con eventos llenos de diversión.</p>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card shadow-sm h-100 p-3 about-value-card about-vision">
                            <h4>Visión</h4>
                            <p>Ser la empresa líder en organización de fiestas y eventos infantiles a nivel local.</p>
                        </div>
                    </div>
                    <div className="col-md-4 mb-3">
                        <div className="card shadow-sm h-100 p-3 about-value-card about-valores">
                            <h4>Valores</h4>
                            <p>Creatividad, responsabilidad y diversión son el corazón de DiverKids.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
