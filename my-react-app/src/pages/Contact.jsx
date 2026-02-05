import React, { useState } from "react";
import axios from "axios";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", message: "" });
    const [msg, setMsg] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://127.0.0.1:5000/api/contact", form);
            setMsg(res.data.msg);
            setForm({ name: "", email: "", message: "" });
        } catch (error) {
            setMsg("Error al enviar mensaje");
            console.error(error);
        }
    };

    return (
        <div className="container mt-5 w-75">
            <h2>Contacto DiverKids</h2>
            {msg && <div className="alert alert-info">{msg}</div>}

            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        className="form-control"
                        placeholder="Nombre"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="email"
                        className="form-control"
                        placeholder="Email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        placeholder="Mensaje"
                        rows="4"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">Enviar</button>
            </form>
        </div>
    );
}
