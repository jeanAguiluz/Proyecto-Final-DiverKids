from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt

db = SQLAlchemy()
bcrypt = Bcrypt()


class User(db.Model):
    """Modelo de Usuario con autenticación"""
    __tablename__ = 'user'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)  # ← CAMBIADO: password → password_hash
    role = db.Column(db.String(50), default="parent")  # parent, admin
    phone = db.Column(db.String(20), nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relaciones
    events = db.relationship('Event', backref='user', lazy=True, cascade='all, delete-orphan')
    bookings = db.relationship('Booking', backref='user', lazy=True, cascade='all, delete-orphan')

    @property
    def password(self):
        """Prevenir lectura de contraseña"""
        raise AttributeError('Password is not a readable attribute')
    
    @password.setter
    def password(self, password):
        """Cifra la contraseña usando bcrypt cuando se asigna user.password = 'xxx'"""
        self.password_hash = bcrypt.generate_password_hash(password).decode("utf-8")

    def check_password(self, password):
        """Verifica la contraseña hasheada"""
        return bcrypt.check_password_hash(self.password_hash, password)
    
    @property
    def is_admin(self):
        """Propiedad para verificar si es administrador"""
        return self.role == "admin"

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "phone": self.phone,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Contact(db.Model):
    """Modelo para mensajes de contacto"""
    __tablename__ = 'contact'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    email = db.Column(db.String(120), nullable=False)
    phone = db.Column(db.String(20), nullable=True)
    message = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, read, replied
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "phone": self.phone,
            "message": self.message,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Event(db.Model):
    """Modelo para eventos creados por usuarios"""
    __tablename__ = 'event'
    
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(150), nullable=False)
    date = db.Column(db.String(50), nullable=False)
    time = db.Column(db.String(20), nullable=True)
    location = db.Column(db.String(200), nullable=True)
    description = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(20), default="pending")  # pending, confirmed, cancelled
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Relación con usuario
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    def serialize(self):
        return {
            "id": self.id,
            "title": self.title,
            "date": self.date,
            "time": self.time,
            "location": self.location,
            "description": self.description,
            "status": self.status,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }


class Costume(db.Model):
    """Modelo para catálogo de disfraces (CRUD principal)"""
    __tablename__ = 'costume'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    category = db.Column(db.String(50), nullable=True)  # superhéroes, princesas, animales, etc.
    size = db.Column(db.String(20), nullable=True)  # S, M, L, XL
    price_per_day = db.Column(db.Float, nullable=False)
    image_url = db.Column(db.String(300), nullable=True)
    available = db.Column(db.Boolean, default=True)
    stock_quantity = db.Column(db.Integer, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "category": self.category,
            "size": self.size,
            "price_per_day": self.price_per_day,
            "image_url": self.image_url,
            "available": self.available,
            "stock_quantity": self.stock_quantity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class AnimationPackage(db.Model):
    """Modelo para paquetes de animación"""
    __tablename__ = 'animation_package'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=True)
    duration_hours = db.Column(db.Integer, nullable=False)  # duración en horas
    price = db.Column(db.Float, nullable=False)
    includes = db.Column(db.Text, nullable=True)  # servicios incluidos (JSON o texto)
    max_children = db.Column(db.Integer, nullable=True)
    image_url = db.Column(db.String(300), nullable=True)
    available = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def serialize(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "duration_hours": self.duration_hours,
            "price": self.price,
            "includes": self.includes,
            "max_children": self.max_children,
            "image_url": self.image_url,
            "available": self.available,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class Booking(db.Model):
    """Modelo para reservas de servicios"""
    __tablename__ = 'booking'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    
    # Tipo de reserva
    booking_type = db.Column(db.String(20), nullable=False)  # costume, package, both
    
    # Información del evento
    event_date = db.Column(db.Date, nullable=False)
    event_time = db.Column(db.String(20), nullable=True)
    event_location = db.Column(db.String(300), nullable=True)
    event_address = db.Column(db.Text, nullable=True)
    num_children = db.Column(db.Integer, nullable=True)
    
    # Items reservados (pueden ser null si no aplica)
    costume_id = db.Column(db.Integer, db.ForeignKey('costume.id'), nullable=True)
    package_id = db.Column(db.Integer, db.ForeignKey('animation_package.id'), nullable=True)
    
    # Detalles adicionales
    special_requests = db.Column(db.Text, nullable=True)
    total_price = db.Column(db.Float, nullable=False)
    
    # Estado de la reserva
    status = db.Column(db.String(20), default="pending")  # pending, confirmed, completed, cancelled
    payment_status = db.Column(db.String(20), default="pending")  # pending, paid, refunded
    
    # Timestamps
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relaciones
    costume = db.relationship('Costume', backref='bookings')
    package = db.relationship('AnimationPackage', backref='bookings')

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "user_name": self.user.name if self.user else None,
            "user_email": self.user.email if self.user else None,
            "booking_type": self.booking_type,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "event_time": self.event_time,
            "event_location": self.event_location,
            "event_address": self.event_address,
            "num_children": self.num_children,
            "costume": self.costume.serialize() if self.costume else None,
            "package": self.package.serialize() if self.package else None,
            "special_requests": self.special_requests,
            "total_price": self.total_price,
            "status": self.status,
            "payment_status": self.payment_status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


class PasswordReset(db.Model):
    """Modelo para tokens de recuperación de contraseña"""
    __tablename__ = 'password_reset'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    token = db.Column(db.String(100), unique=True, nullable=False)
    expires_at = db.Column(db.DateTime, nullable=False)
    used = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    user = db.relationship('User', backref='password_resets')

    def serialize(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "token": self.token,
            "expires_at": self.expires_at.isoformat(),
            "used": self.used,
            "created_at": self.created_at.isoformat()
        }