import React from "react";
import aboutImg from "../imgs/logo diverkids trixie.png"; // coloca una imagen en src/imgs/about.jpg

export default function About() {
    return (
        <div className="container text-center">
            <h1 className="mb-4">Sobre DiverKids</h1>
            <img src={aboutImg} className="img-fluid rounded mb-4" alt="Sobre DiverKids" />
            <p>
                DiverKids nació para hacer que cada celebración infantil sea única e inolvidable.
                Nos especializamos en fiestas temáticas, juegos interactivos y disfraces para que los niños vivan una experiencia mágica.
            </p>

            <div className="row mt-4">
                <div className="col-md-4 mb-3">
                    <div className="card shadow-sm h-100 p-3">
                        <h4>Misión</h4>
                        <p>Crear momentos inolvidables para los niños y sus familias con eventos llenos de diversión.</p>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="card shadow-sm h-100 p-3">
                        <h4>Visión</h4>
                        <p>Ser la empresa líder en organización de fiestas y eventos infantiles a nivel local.</p>
                    </div>
                </div>
                <div className="col-md-4 mb-3">
                    <div className="card shadow-sm h-100 p-3">
                        <h4>Valores</h4>
                        <p>Creatividad, responsabilidad y diversión son el corazón de DiverKids.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
