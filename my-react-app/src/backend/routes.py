from flask import Blueprint, request, jsonify, current_app
from models import db, User, Event, Contact, Costume, AnimationPackage, Booking, PasswordReset
from flask_jwt_extended import (
    create_access_token,
    jwt_required,
    get_jwt_identity
)
from datetime import datetime, timedelta
import secrets
from email_service import email_service
from google_calendar_service import google_calendar_service

api = Blueprint("api", __name__)


def build_event_datetimes(date_str, time_str=None, duration_hours=2):
    """Construye datetime inicio/fin para Google Calendar."""
    base_date = datetime.strptime(date_str, "%Y-%m-%d").date()
    if time_str:
        base_time = datetime.strptime(time_str, "%H:%M").time()
    else:
        base_time = datetime.strptime("12:00", "%H:%M").time()
    start_dt = datetime.combine(base_date, base_time)
    end_dt = start_dt + timedelta(hours=max(1, int(duration_hours or 1)))
    return start_dt, end_dt


# ====================================
# DECORADOR PARA VERIFICAR ADMIN
# ====================================

def admin_required(fn):
    """Decorador personalizado para verificar si el usuario es admin"""
    from functools import wraps
    
    @wraps(fn)
    @jwt_required()
    def wrapper(*args, **kwargs):
        user_id = int(get_jwt_identity())
        user = User.query.get_or_404(user_id)
        
        if not user.is_admin:
            return jsonify({"msg": "Acceso denegado. Solo administradores."}), 403
        
        return fn(*args, **kwargs)
    
    return wrapper


# ====================================
# AUTENTICACIÓN
# ====================================

@api.route("/signup", methods=["POST"])
def signup():
    """Registro de nuevos usuarios"""
    try:
        body = request.get_json()

        # Validaciones
        if not body or not body.get("name") or not body.get("email") or not body.get("password"):
            return jsonify({"msg": "Nombre, email y contraseña son requeridos"}), 400

        # Verificar si el usuario ya existe
        existing_user = User.query.filter_by(email=body["email"]).first()
        if existing_user:
            return jsonify({"msg": "El email ya está registrado"}), 409

        # Crear usuario
        user = User(
            name=body["name"],
            email=body["email"],
            phone=body.get("phone", ""),
            role=body.get("role", "parent")  # Por defecto parent
        )
        
        # El setter de password automáticamente hace el hash
        user.password = body["password"]

        db.session.add(user)
        db.session.commit()

        return jsonify({
            "msg": "Usuario creado exitosamente",
            "user": user.serialize()
        }), 201
        
    except Exception as e:
        print(f"❌ Error en signup: {str(e)}")
        db.session.rollback()
        return jsonify({"msg": "Error al crear el usuario"}), 500


@api.route('/login', methods=['POST'])
def login():
    """Login de usuarios"""
    try:
        body = request.get_json()
        
        email = body.get('email')
        password = body.get('password')

        if not email or not password:
            return jsonify({"msg": "Email y contraseña requeridos"}), 400

        # Buscar usuario
        user = User.query.filter_by(email=email).first()

        if not user:
            return jsonify({"msg": "Email o contraseña incorrectos"}), 401
        
        # Verificar contraseña
        if not user.check_password(password):
            return jsonify({"msg": "Email o contraseña incorrectos"}), 401

        # Crear token JWT (IMPORTANTE: convertir a string)
        access_token = create_access_token(identity=str(user.id))

        return jsonify({
            'user': user.serialize(),
            'token': access_token
        }), 200
        
    except Exception as e:
        print(f"❌ Error en login: {str(e)}")
        return jsonify({"msg": "Error al iniciar sesión"}), 500


@api.route("/profile", methods=["GET"])
@jwt_required()
def profile():
    """Obtener perfil del usuario autenticado"""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)

    return jsonify(user.serialize()), 200


@api.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Actualizar perfil del usuario"""
    user_id = int(get_jwt_identity())
    user = User.query.get_or_404(user_id)
    body = request.get_json()

    # Actualizar campos permitidos
    if body.get("name"):
        user.name = body["name"]
    if body.get("phone"):
        user.phone = body["phone"]
    
    # Cambiar contraseña si se proporciona
    if body.get("new_password"):
        user.password = body["new_password"]

    db.session.commit()

    return jsonify({
        "msg": "Perfil actualizado",
        "user": user.serialize()
    }), 200


@api.route("/forgot-password", methods=["POST"])
def forgot_password():
    """Solicitar recuperación de contraseña"""
    body = request.get_json()
    email = body.get("email")
    
    if not email:
        return jsonify({"msg": "Email requerido"}), 400
    
    user = User.query.filter_by(email=email).first()
    
    if not user:
        # Por seguridad, no revelar si el email existe
        return jsonify({"msg": "Si el email existe, recibirás un correo de recuperación"}), 200
    
    # Generar token único
    token = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(hours=1)
    
    # Guardar token
    reset = PasswordReset(
        user_id=user.id,
        token=token,
        expires_at=expires_at
    )
    db.session.add(reset)
    db.session.commit()

    # Intentar enviar correo de recuperación (no romper flujo si falla)
    email_sent = False
    try:
        email_sent = email_service.send_password_reset(user.email, token)
    except Exception as e:
        print(f"⚠️ Error enviando email de recuperación: {str(e)}")

    payload = {
        "msg": "Si el email existe, recibirás un correo de recuperación"
    }

    # Ayuda de desarrollo para probar UX cuando SendGrid no entrega correo.
    if (not email_sent) and current_app.config.get("DEBUG"):
        frontend_url = current_app.config.get("FRONTEND_URL", "http://localhost:5173")
        payload["dev_reset_url"] = f"{frontend_url}/reset-password?token={token}"
        payload["email_sent"] = False
    elif current_app.config.get("DEBUG"):
        payload["email_sent"] = True

    return jsonify(payload), 200


@api.route("/reset-password", methods=["POST"])
def reset_password():
    """Restablecer contraseña con token"""
    body = request.get_json()
    token = body.get("token")
    new_password = body.get("new_password")
    
    if not token or not new_password:
        return jsonify({"msg": "Token y nueva contraseña requeridos"}), 400
    
    # Buscar token válido
    reset = PasswordReset.query.filter_by(token=token, used=False).first()
    
    if not reset or reset.expires_at < datetime.utcnow():
        return jsonify({"msg": "Token inválido o expirado"}), 400
    
    # Actualizar contraseña
    user = User.query.get(reset.user_id)
    user.password = new_password
    
    # Marcar token como usado
    reset.used = True
    
    db.session.commit()
    
    return jsonify({"msg": "Contraseña actualizada exitosamente"}), 200


# ====================================
# EVENTS (CRUD)
# ====================================

@api.route("/events", methods=["GET"])
@jwt_required()
def get_events():
    """Obtener eventos del usuario autenticado"""
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({"msg": "Usuario no encontrado"}), 404
        
        # Si es admin, ver todos los eventos
        if user.is_admin:
            events = Event.query.all()
        else:
            events = Event.query.filter_by(user_id=user_id).all()
        
        return jsonify([e.serialize() for e in events]), 200
        
    except Exception as e:
        print(f"❌ ERROR: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"msg": str(e)}), 500


@api.route("/events", methods=["POST"])
@jwt_required()
def create_event():
    """Crear nuevo evento"""
    user_id = int(get_jwt_identity())
    body = request.get_json()

    if not body.get("title") or not body.get("date"):
        return jsonify({"msg": "Título y fecha son requeridos"}), 400

    event = Event(
        title=body["title"],
        date=body["date"],
        time=body.get("time"),
        location=body.get("location"),
        description=body.get("description", ""),
        user_id=user_id
    )

    db.session.add(event)
    db.session.commit()

    # Sincronizar opcionalmente con Google Calendar
    try:
        user = User.query.get(user_id)
        start_dt, end_dt = build_event_datetimes(event.date, event.time, duration_hours=2)
        description = event.description or ""
        if user:
            description += f"\n\nUsuario: {user.name} ({user.email})"
        google_calendar_service.create_event(
            summary=f"Evento DiverKids: {event.title}",
            description=description.strip(),
            start_dt=start_dt,
            end_dt=end_dt,
            location=event.location or "",
        )
    except Exception as error:
        print(f"⚠️ No se pudo sincronizar evento con Google Calendar: {error}")

    return jsonify(event.serialize()), 201


@api.route("/events/<int:id>", methods=["GET"])
@jwt_required()
def get_event(id):
    """Obtener un evento específico"""
    user_id = int(get_jwt_identity())
    event = Event.query.get_or_404(id)
    
    # Verificar que el usuario sea dueño o admin
    user = User.query.get(user_id)
    if event.user_id != user_id and not user.is_admin:
        return jsonify({"msg": "No autorizado"}), 403
    
    return jsonify(event.serialize()), 200


@api.route("/events/<int:id>", methods=["PUT"])
@jwt_required()
def update_event(id):
    """Actualizar evento"""
    user_id = int(get_jwt_identity())
    event = Event.query.get_or_404(id)
    
    # Verificar que el usuario sea dueño o admin
    user = User.query.get(user_id)
    if event.user_id != user_id and not user.is_admin:
        return jsonify({"msg": "No autorizado"}), 403
    
    body = request.get_json()

    event.title = body.get("title", event.title)
    event.date = body.get("date", event.date)
    event.time = body.get("time", event.time)
    event.location = body.get("location", event.location)
    event.description = body.get("description", event.description)
    event.status = body.get("status", event.status)

    db.session.commit()
    return jsonify(event.serialize()), 200


@api.route("/events/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_event(id):
    """Eliminar evento"""
    user_id = int(get_jwt_identity())
    event = Event.query.get_or_404(id)
    
    # Verificar que el usuario sea dueño o admin
    user = User.query.get(user_id)
    if event.user_id != user_id and not user.is_admin:
        return jsonify({"msg": "No autorizado"}), 403
    
    db.session.delete(event)
    db.session.commit()
    return jsonify({"msg": "Evento eliminado"}), 200


# ====================================
# CONTACT (Mensajes de contacto)
# ====================================

@api.route("/contact", methods=["POST"])
def create_contact():
    """Crear mensaje de contacto (público)"""
    body = request.get_json()

    if not body or not body.get("name") or not body.get("email") or not body.get("message"):
        return jsonify({"msg": "Todos los campos son requeridos"}), 400

    # Guardar en base de datos
    contact = Contact(
        name=body["name"],
        email=body["email"],
        phone=body.get("phone"),
        message=body["message"]
    )

    db.session.add(contact)
    db.session.commit()
    
    # ✅ Enviar notificación por email usando SendGrid
    try:
        html_content = f"""
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h2 style="color: #6B46C1;">📩 Nuevo mensaje de contacto - DiverKids</h2>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p><strong>Nombre:</strong> {body['name']}</p>
                <p><strong>Email:</strong> {body['email']}</p>
                <p><strong>Teléfono:</strong> {body.get('phone', 'No proporcionado')}</p>
                <p><strong>Mensaje:</strong></p>
                <div style="background-color: #f9f9f9; padding: 15px; border-left: 4px solid #6B46C1; margin: 15px 0;">
                    {body['message']}
                </div>
                <hr style="border: 1px solid #eee; margin: 20px 0;">
                <p style="color: #666; font-size: 12px;">
                    Este mensaje fue enviado desde el formulario de contacto de DiverKids.<br>
                    Fecha: {contact.created_at.strftime('%d/%m/%Y %H:%M')}
                </p>
            </div>
        </div>
        """
        
        result = email_service.send_email(
            to_email="diverkidsinfo@gmail.com",
            subject=f"🔔 Nuevo mensaje de {body['name']} - DiverKids",
            html_content=html_content
        )
        
        if result:
            print(f"✅ Email enviado correctamente a diverkidsinfo@gmail.com")
        else:
            print(f"⚠️ No se pudo enviar el email")
        
    except Exception as e:
        print(f"❌ Error al enviar email: {str(e)}")
        # No detener el proceso si falla el email, el mensaje ya se guardó en DB

    return jsonify({
        "msg": "Mensaje enviado exitosamente. Te contactaremos pronto.",
        "contact": contact.serialize()
    }), 201


@api.route("/contacts", methods=["GET"])
@admin_required
def get_contacts():
    """Obtener todos los mensajes de contacto (solo admin)"""
    contacts = Contact.query.order_by(Contact.created_at.desc()).all()
    return jsonify([c.serialize() for c in contacts]), 200


@api.route("/contact/<int:id>", methods=["PUT"])
@admin_required
def update_contact(id):
    """Actualizar estado del mensaje (solo admin)"""
    contact = Contact.query.get_or_404(id)
    body = request.get_json()
    
    contact.status = body.get("status", contact.status)
    db.session.commit()
    
    return jsonify(contact.serialize()), 200


@api.route("/contact/<int:id>", methods=["DELETE"])
@admin_required
def delete_contact(id):
    """Eliminar mensaje de contacto (solo admin)"""
    contact = Contact.query.get_or_404(id)
    db.session.delete(contact)
    db.session.commit()

    return jsonify({"msg": "Mensaje eliminado"}), 200


# ====================================
# COSTUMES (CRUD PRINCIPAL)
# ====================================

@api.route("/costumes", methods=["GET"])
def get_costumes():
    """Obtener catálogo de disfraces (público)"""
    # Filtros opcionales
    category = request.args.get('category')
    available = request.args.get('available')
    
    query = Costume.query
    
    if category:
        query = query.filter_by(category=category)
    if available == 'true':
        query = query.filter_by(available=True)
    
    costumes = query.all()
    return jsonify([c.serialize() for c in costumes]), 200


@api.route("/costumes/<int:id>", methods=["GET"])
def get_costume(id):
    """Obtener detalle de un disfraz"""
    costume = Costume.query.get_or_404(id)
    return jsonify(costume.serialize()), 200


@api.route("/costumes", methods=["POST"])
@admin_required
def create_costume():
    """Crear nuevo disfraz (solo admin)"""
    body = request.get_json()

    if not body.get("name") or not body.get("price_per_day"):
        return jsonify({"msg": "Nombre y precio son requeridos"}), 400

    costume = Costume(
        name=body["name"],
        description=body.get("description"),
        category=body.get("category"),
        size=body.get("size"),
        price_per_day=body["price_per_day"],
        image_url=body.get("image_url"),
        available=body.get("available", True),
        stock_quantity=body.get("stock_quantity", 1)
    )

    db.session.add(costume)
    db.session.commit()

    return jsonify(costume.serialize()), 201


@api.route("/costumes/<int:id>", methods=["PUT"])
@admin_required
def update_costume(id):
    """Actualizar disfraz (solo admin)"""
    costume = Costume.query.get_or_404(id)
    body = request.get_json()

    costume.name = body.get("name", costume.name)
    costume.description = body.get("description", costume.description)
    costume.category = body.get("category", costume.category)
    costume.size = body.get("size", costume.size)
    costume.price_per_day = body.get("price_per_day", costume.price_per_day)
    costume.image_url = body.get("image_url", costume.image_url)
    costume.available = body.get("available", costume.available)
    costume.stock_quantity = body.get("stock_quantity", costume.stock_quantity)

    db.session.commit()
    return jsonify(costume.serialize()), 200


@api.route("/costumes/<int:id>", methods=["DELETE"])
@admin_required
def delete_costume(id):
    """Eliminar disfraz (solo admin)"""
    costume = Costume.query.get_or_404(id)
    db.session.delete(costume)
    db.session.commit()
    return jsonify({"msg": "Disfraz eliminado"}), 200


# ====================================
# ANIMATION PACKAGES
# ====================================

@api.route("/packages", methods=["GET"])
def get_packages():
    """Obtener paquetes de animación (público)"""
    available = request.args.get('available')
    
    query = AnimationPackage.query
    
    if available == 'true':
        query = query.filter_by(available=True)
    
    packages = query.all()
    return jsonify([p.serialize() for p in packages]), 200


@api.route("/packages/<int:id>", methods=["GET"])
def get_package(id):
    """Obtener detalle de un paquete"""
    package = AnimationPackage.query.get_or_404(id)
    return jsonify(package.serialize()), 200


@api.route("/packages", methods=["POST"])
@admin_required
def create_package():
    """Crear paquete de animación (solo admin)"""
    body = request.get_json()

    if not body.get("name") or not body.get("price"):
        return jsonify({"msg": "Nombre y precio son requeridos"}), 400

    package = AnimationPackage(
        name=body["name"],
        description=body.get("description"),
        duration_hours=body.get("duration_hours", 2),
        price=body["price"],
        includes=body.get("includes"),
        max_children=body.get("max_children"),
        image_url=body.get("image_url"),
        available=body.get("available", True)
    )

    db.session.add(package)
    db.session.commit()

    return jsonify(package.serialize()), 201


@api.route("/packages/<int:id>", methods=["PUT"])
@admin_required
def update_package(id):
    """Actualizar paquete (solo admin)"""
    package = AnimationPackage.query.get_or_404(id)
    body = request.get_json()

    package.name = body.get("name", package.name)
    package.description = body.get("description", package.description)
    package.duration_hours = body.get("duration_hours", package.duration_hours)
    package.price = body.get("price", package.price)
    package.includes = body.get("includes", package.includes)
    package.max_children = body.get("max_children", package.max_children)
    package.image_url = body.get("image_url", package.image_url)
    package.available = body.get("available", package.available)

    db.session.commit()
    return jsonify(package.serialize()), 200


@api.route("/packages/<int:id>", methods=["DELETE"])
@admin_required
def delete_package(id):
    """Eliminar paquete (solo admin)"""
    package = AnimationPackage.query.get_or_404(id)
    db.session.delete(package)
    db.session.commit()
    return jsonify({"msg": "Paquete eliminado"}), 200


# ====================================
# BOOKINGS (Reservas)
# ====================================

@api.route("/bookings", methods=["GET"])
@jwt_required()
def get_bookings():
    """Obtener reservas del usuario autenticado"""
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    
    # Si es admin, ver todas las reservas
    if user.is_admin:
        bookings = Booking.query.order_by(Booking.event_date.desc()).all()
    else:
        bookings = Booking.query.filter_by(user_id=user_id).order_by(Booking.event_date.desc()).all()
    
    return jsonify([b.serialize() for b in bookings]), 200


@api.route("/bookings", methods=["POST"])
@jwt_required()
def create_booking():
    """Crear nueva reserva"""
    user_id = int(get_jwt_identity())
    body = request.get_json()

    # Validaciones
    if not body.get("event_date") or not body.get("booking_type"):
        return jsonify({"msg": "Fecha y tipo de reserva son requeridos"}), 400

    # Convertir fecha string a objeto date
    try:
        event_date = datetime.strptime(body["event_date"], "%Y-%m-%d").date()
    except:
        return jsonify({"msg": "Formato de fecha inválido (usar YYYY-MM-DD)"}), 400

    costume_id = int(body.get("costume_id")) if body.get("costume_id") else None
    package_id = int(body.get("package_id")) if body.get("package_id") else None

    booking = Booking(
        user_id=user_id,
        booking_type=body["booking_type"],
        event_date=event_date,
        event_time=body.get("event_time"),
        event_location=body.get("event_location"),
        event_address=body.get("event_address"),
        num_children=body.get("num_children"),
        costume_id=costume_id,
        package_id=package_id,
        special_requests=body.get("special_requests"),
        total_price=body.get("total_price", 0)
    )

    db.session.add(booking)
    db.session.commit()

    # Sincronizar opcionalmente con Google Calendar
    try:
        user = User.query.get(user_id)
        selected_costume = Costume.query.get(costume_id) if costume_id else None
        selected_package = AnimationPackage.query.get(package_id) if package_id else None

        if booking.booking_type == "both":
            summary = f"Reserva DiverKids: {selected_package.name if selected_package else 'Paquete'} + {selected_costume.name if selected_costume else 'Disfraz'}"
        elif booking.booking_type == "package":
            summary = f"Reserva DiverKids: {selected_package.name if selected_package else 'Paquete de Animación'}"
        else:
            summary = f"Reserva DiverKids: {selected_costume.name if selected_costume else 'Disfraz'}"
        if not summary.strip():
            summary = f"Reserva DiverKids #{booking.id}"

        duration = selected_package.duration_hours if selected_package and selected_package.duration_hours else 2
        start_dt, end_dt = build_event_datetimes(
            booking.event_date.isoformat(),
            booking.event_time,
            duration_hours=duration,
        )

        location_parts = [booking.event_location or "", booking.event_address or ""]
        location = ", ".join([part for part in location_parts if part]).strip()

        description_lines = [
            f"Reserva ID: {booking.id}",
            f"Tipo de reserva: {booking.booking_type}",
            f"Usuario: {user.name if user else 'N/A'} ({user.email if user else 'N/A'})",
            f"Fecha: {booking.event_date.isoformat()}",
            f"Hora: {booking.event_time or '12:00'}",
            f"Niños: {booking.num_children or 'N/A'}",
            f"Total: ${booking.total_price}",
        ]
        if selected_package:
            description_lines.append(f"Paquete: {selected_package.name}")
        if selected_costume:
            description_lines.append(f"Disfraz: {selected_costume.name}")
        if booking.special_requests:
            description_lines.append(f"Solicitudes especiales: {booking.special_requests}")

        google_calendar_service.create_event(
            summary=summary,
            description="\n".join(description_lines),
            start_dt=start_dt,
            end_dt=end_dt,
            location=location,
        )
    except Exception as error:
        print(f"⚠️ No se pudo sincronizar reserva con Google Calendar: {error}")

    return jsonify(booking.serialize()), 201


@api.route("/bookings/<int:id>", methods=["GET"])
@jwt_required()
def get_booking(id):
    """Obtener detalle de una reserva"""
    user_id = int(get_jwt_identity())
    booking = Booking.query.get_or_404(id)
    user = User.query.get(user_id)
    
    # Verificar que el usuario sea dueño o admin
    if booking.user_id != user_id and not user.is_admin:
        return jsonify({"msg": "No autorizado"}), 403
    
    return jsonify(booking.serialize()), 200


@api.route("/bookings/<int:id>", methods=["PUT"])
@jwt_required()
def update_booking(id):
    """Actualizar reserva"""
    user_id = int(get_jwt_identity())
    booking = Booking.query.get_or_404(id)
    user = User.query.get(user_id)
    body = request.get_json()
    
    # Verificar autorización
    if booking.user_id != user_id and not user.is_admin:
        return jsonify({"msg": "No autorizado"}), 403
    
    # Solo admin puede cambiar ciertos campos
    if user.is_admin:
        booking.status = body.get("status", booking.status)
        booking.payment_status = body.get("payment_status", booking.payment_status)
    
    # Usuario puede actualizar detalles del evento
    if body.get("event_time"):
        booking.event_time = body["event_time"]
    if body.get("event_location"):
        booking.event_location = body["event_location"]
    if body.get("special_requests"):
        booking.special_requests = body["special_requests"]
    
    db.session.commit()
    return jsonify(booking.serialize()), 200


@api.route("/bookings/<int:id>", methods=["DELETE"])
@jwt_required()
def delete_booking(id):
    """Cancelar/eliminar reserva"""
    user_id = int(get_jwt_identity())
    booking = Booking.query.get_or_404(id)
    user = User.query.get(user_id)
    
    # Verificar que el usuario sea dueño o admin
    if booking.user_id != user_id and not user.is_admin:
        return jsonify({"msg": "No autorizado"}), 403
    
    db.session.delete(booking)
    db.session.commit()
    return jsonify({"msg": "Reserva eliminada"}), 200


# ====================================
# ESTADÍSTICAS (Admin)
# ====================================

@api.route("/stats", methods=["GET"])
@admin_required
def get_stats():
    """Obtener estadísticas generales (solo admin)"""
    stats = {
        "total_users": User.query.count(),
        "total_bookings": Booking.query.count(),
        "pending_bookings": Booking.query.filter_by(status="pending").count(),
        "total_costumes": Costume.query.count(),
        "available_costumes": Costume.query.filter_by(available=True).count(),
        "total_packages": AnimationPackage.query.count(),
        "unread_contacts": Contact.query.filter_by(status="pending").count()
    }
    
    return jsonify(stats), 200


# ====================================
# TESTING
# ====================================

@api.route("/test-email", methods=["GET"])
def test_email():
    """Endpoint temporal para probar SendGrid"""
    to_email = request.args.get("to_email") or "diverkidsinfo@gmail.com"
    result = email_service.send_email(
        to_email=to_email,
        subject="✅ DiverKids - Prueba de Email",
        html_content="""
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
                <h1 style="color: #6B46C1;">🎉 ¡SendGrid Funciona!</h1>
                <p>Este email confirma que SendGrid está configurado correctamente en tu proyecto DiverKids.</p>
                <p><strong>Características:</strong></p>
                <ul>
                    <li>✅ API Key configurada</li>
                    <li>✅ Sender verificado</li>
                    <li>✅ Emails funcionando</li>
                </ul>
                <hr>
                <p style="color: #666; font-size: 12px;">Este es un email de prueba generado automáticamente.</p>
            </div>
        </div>
        """
    )
    return jsonify({
        "success": result,
        "to_email": to_email,
        "message": "Email enviado" if result else "Error al enviar"
    }), 200
