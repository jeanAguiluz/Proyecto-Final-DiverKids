import React from "react";

export default function ConfirmModal({ show, onClose, onConfirm, title, message }) {
    return (
        <div className={`modal ${show ? "d-block" : "d-none"}`} tabIndex="-1">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">{title}</h5>
                        <button type="button" className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body">
                        <p>{message}</p>
                    </div>
                    <div className="modal-footer">
                        <button className="btn btn-secondary" onClick={onClose}>
                            Cancelar
                        </button>
                        <button className="btn btn-danger" onClick={onConfirm}>
                            Confirmar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
