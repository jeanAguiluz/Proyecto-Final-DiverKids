import os
from flask import Flask, request, jsonify
from flask_jwt_extended import JWTManager, create_access_token
from werkzeug.security import generate_password_hash, check_password_hash
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate # Para las migraciones
from flask import Blueprint

# Configuración del backend
app = Flask(__name__)

# Apuntar a la carpeta 'instance' para la base de datos
app.instance_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), 'instance')
os.makedirs(app.instance_path, exist_ok=True)
app.config['DEBUG'] = True  # Habilitar modo debug
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + app.instance_path + '/database.db'  # Ruta correcta para la base de datos en 'instance'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False  # Evitar el aviso de modificaciones
app.config['SECRET_KEY'] = 'your-secret-key'
app.config['JWT_SECRET_KEY'] = 'your-jwt-secret-key'


db = SQLAlchemy(app)
jwt = JWTManager(app)
migrate = Migrate(app, db)

# Habilitar CORS para permitir solicitudes desde el frontend en React
CORS(app, origins=["http://localhost:5173"])

api = Blueprint("api", __name__)

# Modelo de Usuario
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    is_admin = db.Column(db.Boolean, default=False)  # Agregar is_admin al modelo

    def set_password(self, password):
        self.password = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password, password)
    
# Ruta para login
@api.route('/api/login', methods=['POST'])
def login():
    try:
        email = request.json.get('email', None)
        password = request.json.get('password', None)

        if not email or not password:
            return jsonify({"msg": "Correo y contraseña requeridos"}), 400

        user = User.query.filter_by(email=email).first()

        if not user or not check_password_hash(user.password, password):
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

    except Exception as e:
        return jsonify({"msg": "Error interno del servidor", "error": str(e)}), 500
    
    
# Ruta para registro de usuario
@api.route('/api/signup', methods=['POST'])
def signup():
    body = request.get_json()
    if not body or not body.get("email") or not body.get("password"):
        return jsonify({"msg": "Email y password requeridos"}), 400

    if User.query.filter_by(email=body["email"]).first():
        return jsonify({"msg": "Usuario ya existe"}), 409

    user = User(email=body["email"])
    user.set_password(body["password"])  # Cifra la contraseña
    user.is_admin = body.get("role", "parent") == "admin"  # Asigna el rol 'admin' si el cuerpo lo contiene

    db.session.add(user)
    db.session.commit()

    return jsonify({"msg": "Usuario creado exitosamente"}), 201

from routes import api  # Asegúrate de importar el blueprint de rutas
app.register_blueprint(api) # Registrar el blueprint de rutas en la aplicación Flask 

# Ejecutar la aplicación Flask
if __name__ == '__main__':
    with app.app_context():  # Crear el contexto de la aplicación
        db.create_all()  # Crea las tablas en la base de datos
    app.run(debug=True)
