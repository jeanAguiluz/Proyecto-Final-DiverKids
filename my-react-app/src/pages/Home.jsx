import React from "react";
import { Link } from "react-router-dom";
import fiestaImg from "../imgs/trixie de pie.png"; // coloca una imagen en src/imgs/fiesta.jpg
import disfracesImg from "../imgs/trixie de pie.png"; // coloca una imagen en src/imgs/disfraces.jpg

export default function Home() {
    return (
        <div className="text-center">
            <h1 className="mb-4">Bienvenidos a DiverKids 🎉</h1>
            <p className="lead">
                DiverKids hace que cada celebración infantil sea inolvidable. Organizamos fiestas temáticas y ofrecemos arriendo de disfraces.
            </p>
            
            <div className="row mt-5">
                <div className="col-md-6 mb-3">
                    <div className="card shadow-sm h-100 p-3">
                        <img src={fiestaImg} className="card-img-top mb-2" alt="Fiesta" />
                        <h3>Eventos Personalizados</h3>
                        <p>Organizamos fiestas temáticas para cada niño, con juegos y actividades divertidas.</p>
                        <Link to="/events" className="btn btn-primary mt-2">Ver Eventos</Link>
                    </div>
                </div>
                <div className="col-md-6 mb-3">
                    <div className="card shadow-sm h-100 p-3">
                        <img src={disfracesImg} className="card-img-top mb-2" alt="Disfraces" />
                        <h3>Arriendo de Disfraces</h3>
                        <p>Encuentra disfraces increíbles para tus fiestas y actividades especiales.</p>
                        <Link to="/events" className="btn btn-primary mt-2">Ver Disfraces</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
