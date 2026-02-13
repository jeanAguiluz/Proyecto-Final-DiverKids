import os
from dotenv import load_dotenv
from flask import Flask, jsonify
from flask_cors import CORS
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager
from models import db, bcrypt


def normalize_database_url(database_url: str) -> str:
    """Normaliza DATABASE_URL para SQLAlchemy en proveedores como Render."""
    if database_url and database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql://", 1)
    return database_url


def create_app():
    """Factory function para crear la aplicación Flask"""

    # Cargar variables de entorno PRIMERO
    load_dotenv()

    app = Flask(__name__)

    # Directorio de instancia para la base de datos
    app.instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
    os.makedirs(app.instance_path, exist_ok=True)

    # Configuraciones básicas
    app.config['DEBUG'] = os.getenv('FLASK_DEBUG', 'false').lower() == 'true'
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key-change-in-production')
    app.config['FRONTEND_URL'] = os.getenv('FRONTEND_URL', 'http://localhost:5173')

    # Base de datos
    database_url = normalize_database_url(
        os.getenv('DATABASE_URL', 'sqlite:///' + os.path.join(app.instance_path, 'database.db'))
    )
    app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    # Configuración JWT
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'jwt-secret-key-change-in-production')
    app.config['JWT_ACCESS_TOKEN_EXPIRES'] = 86400  # 24 horas
    app.config['JWT_TOKEN_LOCATION'] = ['headers']
    app.config['JWT_HEADER_NAME'] = 'Authorization'
    app.config['JWT_HEADER_TYPE'] = 'Bearer'

    # Inicializar extensiones
    db.init_app(app)
    bcrypt.init_app(app)
    Migrate(app, db)
    jwt = JWTManager(app)

    # Handlers de errores JWT
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        print(f"❌ Token inválido: {error}")
        return jsonify({'msg': 'Token inválido', 'error': str(error)}), 422

    @jwt.unauthorized_loader
    def unauthorized_callback(error):
        print(f"❌ Sin autorización: {error}")
        return jsonify({'msg': 'Falta token de autorización', 'error': str(error)}), 401

    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        print("❌ Token expirado")
        return jsonify({'msg': 'Token expirado'}), 401

    # CORS - permite las solicitudes del front
    cors_origins = os.getenv(
        'CORS_ORIGINS',
        'http://localhost:5173,http://localhost:3000'
    ).split(',')
    cors_origins = [origin.strip() for origin in cors_origins if origin.strip()]
    CORS(app, origins=cors_origins, supports_credentials=True)

    # Registro de blueprints
    from routes import api
    app.register_blueprint(api, url_prefix='/api')

    # Ruta raíz home
    @app.route('/')
    def home():
        return {
            "message": "Bienvenido a la API de DiverKids",
            "version": "1.0",
            "endpoints": {
                "auth": "/api/signup, /api/login, /api/profile",
                "events": "/api/events",
                "contacts": "/api/contact, /api/contacts",
                "costumes": "/api/costumes",
                "packages": "/api/packages",
                "bookings": "/api/bookings"
            }
        }, 200

    # Manejo de errores
    @app.errorhandler(404)
    def not_found(error):
        return {"msg": "Recurso no encontrado"}, 404

    @app.errorhandler(500)
    def internal_error(error):
        return {"msg": "Error interno del servidor"}, 500

    # Crear tablas
    with app.app_context():
        db.create_all()
        print("✅ Base de datos inicializada")

    return app


# Ejecutar la aplicación local
if __name__ == '__main__':
    app = create_app()
    app.run(
        host='0.0.0.0',
        port=int(os.getenv('PORT', 5001)),
        debug=app.config['DEBUG'],
        use_reloader=False
    )
