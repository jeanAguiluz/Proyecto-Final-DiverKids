import React from "react";
import { Link } from "react-router-dom";
import { Carousel } from 'react-bootstrap';
import img1 from '../imgs/carrusel-H/1.svg';
import img2 from '../imgs/carrusel-H/2.svg';
import img3 from '../imgs/carrusel-H/3.svg';
import img4 from '../imgs/carrusel-H/4.svg';
import img5 from '../imgs/carrusel-H/5.svg';
import img6 from '../imgs/carrusel-H/6.svg';
import img7 from '../imgs/carrusel-H/7.svg';
import img8 from '../imgs/carrusel-H/8.svg';
import img9 from '../imgs/carrusel-H/9.svg';
import img10 from '../imgs/carrusel-H/10.svg';
import EventosImg from '../imgs/eventosP-img.svg'
import PaqueteImg from "../imgs/Paquetes-Img.svg";
import disfracesImg from "../imgs/disfraces-img.svg";
import 'bootstrap/dist/css/bootstrap.min.css';
import "../styles/estilosPaguinas.css";
import '../styles/Home.css';

export default function Home() {
    return (
        <div className="home-page">
            <div className="container">
                <div className="hero-section text-center">
                    <h1 className="hero-title font-size=3rem">¡Bienvenidos a DiverKids!</h1>
                    <p className="hero-subtitle">
                        Donde los sueños toman forma y la diversión no tiene límites
                    </p>

                </div>

                {/* Carrusel con React Bootstrap */}
                <Carousel className="mb-5 custom-carousel" fade interval={3000}>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img1}
                            alt="Fiesta 1"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img2}
                            alt="Fiesta 2"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img3}
                            alt="Fiesta 3"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img4}
                            alt="Fiesta 4"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img5}
                            alt="Fiesta 5"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img6}
                            alt="Fiesta 6"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img7}
                            alt="Fiesta 7"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img8}
                            alt="Fiesta 8"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img9}
                            alt="Fiesta 9"
                        />
                    </Carousel.Item>
                    <Carousel.Item>
                        <img
                            className="d-block w-100 carousel-image"
                            src={img10}
                            alt="Fiesta 10"
                        />
                    </Carousel.Item>
                </Carousel>

                <div className="et_pb_button_module_wrapper et_pb_button_11_wrapper et_pb_button_alignment_center et_pb_module">
                    <Link
                        to="https://www.instagram.com/eventosdiverkids.cl?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw%3D%3D&fbclid=IwY2xjawP41p5leHRuA2FlbQIxMABicmlkETFJWWc5RHNueTlUZGVTdUkwc3J0YwZhcHBfaWQQMjIyMDM5MTc4ODIwMDg5MgABHjKoKCF_51EgcWMTl-Qgfkw9-iwNBNQw-Y0c72-zs7vBJT5g1hTeCrSwqWzr_aem_26VKGCCg_OF23UcloOhr-Q" target="_blank" rel="noopener noreferer" // cambia esta ruta por la que tú quieras
                        className="et_pb_button et_pb_button_11 et_pb_bg_layout_light instagram-btn"
                    >
                        Síguenos en Instagram
                    </Link>
                </div>



                {/* Tarjetas de servicios */}
                <div className="row mt-5 g-4">
                    <div className="col-md-4">
                        <div className="card service-card shadow-lg h-200">
                            <div className="card-image-wrapper">
                                <img src={PaqueteImg} className="card-img-top" alt="Paquete" />
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">✨ Paquetes de eventos </h3>
                                <p className="card-text">
                                    Descubre nuestros paquetes llenos de magia y diversión con tus personajes favoritos. ¡Entra y elige el ideal para tu fiesta!
                                </p>
                                <Link to="/packages" className="btn btn-primary btn-lg w-100">
                                    Ver Paquetes
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card service-card shadow-lg h-100">
                            <div className="card-image-wrapper">
                                <img src={disfracesImg} className="card-img-top" alt="Disfraces" />
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">✨ Arriendo de Disfraces</h3>
                                <p className="card-text">
                                    Explora nuestra increíble variedad de disfraces y encuentra el perfecto para ti. ¡Entra y elige tu favorito!
                                </p>
                                <Link to="/costumes" className="btn btn-success btn-lg w-100">
                                    Ver Disfraces
                                </Link>
                            </div>
                        </div>
                    </div>
                    <div className="col-md-4">
                        <div className="card service-card shadow-lg h-100">
                            <div className="card-image-wrapper">
                                <img src={EventosImg} className="card-img-top" alt="Eventos" />
                            </div>
                            <div className="card-body">
                                <h3 className="card-title">✨ Evento Personalizados</h3>
                                <p className="card-text">
                                    ¿No encontraste lo que buscabas? Crea el evento de tus sueños a tu medida. ¡Entra y personalízalo!
                                </p>
                                <Link to="/events" className="btn btn-warning btn-lg w-100">
                                    Crear Evento
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}