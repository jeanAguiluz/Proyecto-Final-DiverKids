import React, { useState } from "react";
import axios from "axios";
import "../styles/estilosPaguinas.css";
import { API_URL } from "../config/api";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/contact`, form);
            setMsg(res.data.msg);
            setForm({ name: "", email: "", message: "" });
        } catch (error) {
            setMsg("Error al enviar mensaje");
            console.error(error);
        }
    };

    return (
        <div className="contact-page">
            <div className="container mt-4">
                <div className="hero-section text-center">
                    <h1 className="hero-title font-size=3.0rem">
                        <span className="contact-title-icon">📍</span> Contacto DiverKids
                    </h1>
                </div>
                {/* Formulario de contacto */}
                <div className="w-75 containerForm mx-auto">
                    {msg && <div className="alert alert-info">{msg}</div>}

                    <form onSubmit={handleSubmit} className="formContacto">
                        <div className="mb-3">
                            <input
                                className="form-control inputContacto"
                                placeholder="Nombre"
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <input
                                type="email"
                                className="form-control inputContacto"
                                placeholder="Email"
                                value={form.email}
                                onChange={(e) => setForm({ ...form, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <textarea
                                className="form-control inputContacto"
                                placeholder="Déjanos tu mensaje"
                                rows="4"
                                value={form.message}
                                onChange={(e) => setForm({ ...form, message: e.target.value })}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary btnSubmit">
                            Enviar
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
