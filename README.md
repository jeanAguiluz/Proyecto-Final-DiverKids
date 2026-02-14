# Proyecto Final - DiverKids

![DiverKids Logo](./my-react-app/src/imgs/logocirculo1.svg)

DiverKids es mi proyecto final del bootcamp de desarrollo web en 4Geeks Academy. Es una aplicación **full-stack** para organizar eventos infantiles, gestionar reservas y administrar catálogos de disfraces y paquetes de animación.

---

## Descripción

La plataforma permite:
- A usuarios: registrarse, iniciar sesión, crear eventos y reservar servicios.
- A administradores: gestionar disfraces, paquetes, reservas y mensajes de contacto.
- Integrar notificaciones por correo y contacto directo por WhatsApp.

---

## Funcionalidades

### Usuario
- Registro e inicio de sesión.
- Recuperación y restablecimiento de contraseña.
- Catálogo de disfraces.
- Catálogo de paquetes.
- Crear, editar y eliminar eventos.
- Crear y gestionar reservas.
- Dashboard con resumen de actividad.
- Formulario de contacto.

### Administrador
- CRUD de disfraces (`/admin/costumes`).
- CRUD de paquetes (`/admin/packages`).
- Gestión de reservas y eventos.
- Revisión y cambio de estado de mensajes de contacto.

---

## Tecnologías usadas

### Frontend
- React + Vite
- React Router DOM
- Context API
- Axios
- Bootstrap + React Bootstrap
- CSS personalizado

### Backend
- Flask
- SQLAlchemy
- Flask-JWT-Extended
- Flask-Bcrypt
- Flask-CORS
- SQLite (local)
- PostgreSQL (producción)

### Servicios externos
- SendGrid (emails)
- Google Calendar API (sincronización opcional)
- WhatsApp (enlace directo)

---

## Modelos principales

- `User`
- `Costume`
- `AnimationPackage`
- `Event`
- `Booking`
- `Contact`
- `PasswordReset`

---

## Instalación local

### 1) Clonar repositorio
```bash
git clone https://github.com/jeanAguiluz/Proyecto-Final-DiverKids.git
cd Proyecto-Final-DiverKids
```

### 2) Backend
```bash
python -m venv venv
venv\Scripts\activate
cd my-react-app/src/backend
pip install -r requirements.txt
```

Crear `my-react-app/src/backend/.env`:
```env
FLASK_DEBUG=true
SECRET_KEY=tu_secret
JWT_SECRET_KEY=tu_jwt_secret
DATABASE_URL=sqlite:///instance/database.db
CORS_ORIGINS=http://localhost:5173,http://localhost:3000
FRONTEND_URL=http://localhost:5173
SENDGRID_API_KEY=tu_sendgrid_key
SENDGRID_FROM_EMAIL=tu_correo_verificado
SENDGRID_FROM_NAME=DiverKids
GOOGLE_CALENDAR_ENABLED=false
```

### 3) Frontend
```bash
cd my-react-app
npm install
```

Crear `my-react-app/.env`:
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_MAPS_API_KEY=
```

### 4) Seed local
```bash
cd my-react-app/src/backend
python seed.py
```

---

## Ejecutar en local

### Backend
```bash
cd my-react-app/src/backend
../../../venv/Scripts/activate
python app.py
```

### Frontend
```bash
cd my-react-app
npm run dev
```

- Frontend local: `http://localhost:5173`
- Backend local: `http://localhost:5001`

---

## Deploy en producción

- Frontend (Vercel): `https://proyecto-final-diver-kids.vercel.app/`
- Backend (Railway): `https://diverkids-backend-production.up.railway.app`

---

## Credenciales de prueba

Admin:
- Email: `diverkidsinfo@gmail.com`
- Password: usar la contraseña configurada en producción

También puedes crear un usuario desde `/register`.

---

## Rutas principales (frontend)

- `/`
- `/about`
- `/contact`
- `/costumes`
- `/packages`
- `/events` (protegida)
- `/bookings` (protegida)
- `/dashboard` (protegida)
- `/profile` (protegida)
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password?token=...`
- `/admin/costumes` (admin)
- `/admin/packages` (admin)

---

## Endpoints principales (API)

### Auth
- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/forgot-password`
- `POST /api/reset-password`

### Costumes
- `GET /api/costumes`
- `GET /api/costumes/:id`
- `POST /api/costumes` (admin)
- `PUT /api/costumes/:id` (admin)
- `DELETE /api/costumes/:id` (admin)

### Packages
- `GET /api/packages`
- `GET /api/packages/:id`
- `POST /api/packages` (admin)
- `PUT /api/packages/:id` (admin)
- `DELETE /api/packages/:id` (admin)

### Events
- `GET /api/events`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Bookings
- `GET /api/bookings`
- `POST /api/bookings`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`

### Contact
- `POST /api/contact`
- `GET /api/contacts` (admin)

---

## Estado del proyecto

✅ Completado:
- Full-stack funcional
- Autenticación JWT
- Contraseñas cifradas con bcrypt
- CRUD de disfraces y paquetes (admin)
- CRUD de eventos y reservas
- Recuperación de contraseña
- Deploy de frontend y backend

🛠 Mejoras futuras:
- Tests automáticos
- Mejorar entregabilidad de correos (Domain Authentication en SendGrid)
- Integraciones adicionales de analítica/notificaciones

---

## Evidencia de rúbrica

1. Diseño y presentación: cumplido (interfaz responsive, estilos propios).
2. Registro, login y restablecimiento: cumplido.
3. Contraseña cifrada: cumplido (bcrypt).
4. Backend/API a medida: cumplido.
5. Mínimo 3 vistas + CRUD: cumplido ampliamente.
6. Integración de terceros: cumplido (SendGrid, WhatsApp, Calendar opcional).
7. Producción: cumplido (Vercel + Railway).

---

## Product Backlog (resumen)

Historias implementadas:
- Registro de usuario
- Inicio de sesión
- Recuperación de contraseña
- Ver catálogo de disfraces y paquetes
- Crear reservas y eventos
- Admin CRUD disfraces
- Admin CRUD paquetes
- Admin gestión de contactos
- Deploy frontend/backend

---

## Autor

Jean Aguiluz  
GitHub: [@jeanaguiluz](https://github.com/jeanaguiluz)

---

Proyecto desarrollado para el proyecto final de **4Geeks Academy**.
