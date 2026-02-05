from flask import Blueprint, request, jsonify
from models import db, User, Event, Contact
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from werkzeug.security import check_password_hash  # Asegúrate de importar check_password_hash

api = Blueprint("api", __name__)

@api.route("/signup", methods=["POST"])
def signup():
    body = request.get_json()
    if not body or not body.get("email") or not body.get("password"):
        return jsonify({"msg": "Email y password requeridos"}), 400

    if User.query.filter_by(email=body["email"]).first():
        return jsonify({"msg": "Usuario ya existe"}), 409

    user = User(email=body["email"])
    user.set_password(body["password"])
    user.role = body.get("role", "parent")  # default: parent

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado"}), 201

@api.route('/api/login', methods=['POST'])
def login():
    email = request.json.get('email', None)
    password = request.json.get('password', None)

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):  # Usa check_password_hash
        return jsonify({"msg": "Correo o contraseña incorrectos"}), 401

    # Verificar si el usuario es un administrador
    if not user.is_admin:
        return jsonify({"msg": "Acceso denegado. Solo administradores pueden acceder."}), 403

    # Crear un token JWT para el usuario autenticado
    access_token = create_access_token(identity=user.id)

    return jsonify({
        'user': {'email': user.email, 'id': user.id},
        'token': access_token
    }), 200

@api.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    return jsonify({
        "id": user.id,
        "email": user.email,
        "role": user.role
    }), 200

@api.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    events = Event.query.all()
    return jsonify([e.serialize() for e in events]), 200

@api.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    body = request.get_json()
    event = Event(title=body["title"], date=body["date"], description=body["description"])
    db.session.add(event)
    db.session.commit()
    return jsonify(event.serialize()), 201


@api.route("/events/<int:id>", methods=["PUT"])
@jwt_required()
def update_event(id):
    event = Event.query.get_or_404(id)
    body = request.get_json()
    event.title = body.get("title", event.title)
    event.date = body.get("date", event.date)
    event.description = body.get("description", event.description)
    db.session.commit()
    return jsonify(event.serialize()), 200


@api.route("/events/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_event(id):
    event = Event.query.get_or_404(id)
    db.session.delete(event)
    db.session.commit()
    return jsonify({"msg": "Evento eliminado"}), 200

# Ruta para crear un nuevo contacto (POST)
@api.route("/contact", methods=["POST"])
def create_contact():
    body = request.get_json()
    if not body or not body.get("name") or not body.get("email") or not body.get("message"):
        return jsonify({"msg": "Todos los campos son requeridos"}), 400

    contact = Contact(
        name=body["name"],
        email=body["email"],
        message=body["message"]
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify({"msg": "Mensaje enviado"}), 201

# Ruta para obtener todos los contactos (GET)
@api.route("/contacts", methods=["GET"])
@jwt_required()
def get_contacts():
    contacts = Contact.query.all()
    data = [{"id": c.id, "name": c.name, "email": c.email, "message": c.message} for c in contacts]
    return jsonify(data), 200

@api.route("/contact", methods=["POST"])
def create_contact():
    body = request.get_json()
    if not body or not body.get("name") or not body.get("email") or not body.get("message"):
        return jsonify({"msg": "Todos los campos son requeridos"}), 400

    contact = Contact(
        name=body["name"],
        email=body["email"],
        message=body["message"]
    )
    db.session.add(contact)
    db.session.commit()
    return jsonify({"msg": "Mensaje enviado"}), 201

# Listar mensajes (para admin)
@api.route("/contact", methods=["GET"])
@jwt_required()
def get_contacts():
    contacts = Contact.query.all()
    data = [{"id": c.id, "name": c.name, "email": c.email, "message": c.message} for c in contacts]
    return jsonify(data), 200

@api.route("/contact/<int:id>", methods=["DELETE"])
@jwt_required() # Asegura que solo usuarios autenticados puedan eliminar mensajes
def delete_contact(id):
    contact = Contact.query.get_or_404(id)
    db.session.delete(contact)
    db.session.commit()
    return jsonify({"msg": "Mensaje eliminado"}), 200      