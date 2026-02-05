import { useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import ConfirmModal from "../components/ConfirmModal";

export default function Events() {
    const { token } = useContext(AuthContext); // Tomamos token del contexto
    const [events, setEvents] = useState([]);
    const [form, setForm] = useState({ title: "", date: "", description: "" });
    const [editingId, setEditingId] = useState(null);

    // Para el modal de eliminación
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);

    // 🔹 Traer eventos al cargar
    useEffect(() => {
        fetchEvents();
    }, [fetchEvents]);

    // eslint-disable-next-line react-hooks/exhaustive-deps, no-undef
    const fetchEvents = useCallback(async () => {
        try {
            const res = await axios.get("http://127.0.0.1:5000/api/events", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents(res.data);
        } catch (error) {
            console.error("Error al cargar eventos:", error);
        }
    });

    // 🔹 Crear o editar evento
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingId) {
                await axios.put(
                    `http://127.0.0.1:5000/api/events/${editingId}`,
                    form,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setEditingId(null);
            } else {
                await axios.post("http://127.0.0.1:5000/api/events", form, {
                    headers: { Authorization: `Bearer ${token}` },
                });
            }
            setForm({ title: "", date: "", description: "" });
            fetchEvents();
        } catch (error) {
            console.error("Error al guardar evento:", error);
        }
    };

    // 🔹 Editar evento
    const handleEdit = (event) => {
        setForm({
            title: event.title,
            date: event.date,
            description: event.description,
        });
        setEditingId(event.id);
    };

    // 🔹 Borrar evento
    const handleDelete = async (id) => {
        try {
            await axios.delete(`http://127.0.0.1:5000/api/events/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            fetchEvents();
        } catch (error) {
            console.error("Error al eliminar evento:", error);
        }
    };

    return (
        <div className="container my-5">
            <h1 className="text-center mb-4">Eventos DiverKids 🎉</h1>

            {/* Formulario */}
            <form className="mb-5 w-75 mx-auto" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <input
                        className="form-control"
                        placeholder="Título del evento"
                        value={form.title}
                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <input
                        type="date"
                        className="form-control"
                        value={form.date}
                        onChange={(e) => setForm({ ...form, date: e.target.value })}
                        required
                    />
                </div>
                <div className="mb-3">
                    <textarea
                        className="form-control"
                        placeholder="Descripción"
                        rows="3"
                        value={form.description}
                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                        required
                    ></textarea>
                </div>
                <div className="text-center">
                    <button className="btn btn-primary" type="submit">
                        {editingId ? "Actualizar Evento" : "Crear Evento"}
                    </button>
                </div>
            </form>

            {/* Lista de eventos */}
            <div className="row">
                {events.map((event) => (
                    <div className="col-md-4 mb-3" key={event.id}>
                        <div className="card shadow-sm h-100 p-3">
                            <h5>{event.title}</h5>
                            <p>
                                <strong>Fecha:</strong> {event.date}
                            </p>
                            <p>{event.description}</p>
                            <div className="d-flex justify-content-between">
                                <button
                                    className="btn btn-warning btn-sm"
                                    onClick={() => handleEdit(event)}
                                >
                                    Editar
                                </button>
                                <button
                                    className="btn btn-danger btn-sm"
                                    onClick={() => {
                                        setEventToDelete(event);
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal de confirmación */}
            {showDeleteModal && (
                <div className="modal show d-block" tabIndex="-1">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Confirmar eliminación</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setShowDeleteModal(false)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p>
                                    ¿Estás seguro que quieres eliminar el evento "
                                    {eventToDelete.title}"?
                                </p>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={() => setShowDeleteModal(false)}
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-danger"
                                    onClick={() => {
                                        handleDelete(eventToDelete.id);
                                        setShowDeleteModal(false);
                                    }}
                                >
                                    Eliminar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
