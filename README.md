# Proyecto Final - DiverKids

![DiverKids Logo](./my-react-app/src/imgs/logocirculo1.svg)

DiverKids es mi proyecto final del bootcamp. Es una app **full-stack** para gestionar eventos infantiles, disfraces y paquetes de animación.

La idea fue construir una plataforma donde:
- Los usuarios puedan registrarse, iniciar sesión y reservar servicios.
- Los administradores puedan gestionar el catálogo y las reservas.
- Exista contacto directo por formulario y WhatsApp.

---

## ¿Qué incluye el proyecto?

### Funciones para usuarios
- Registro e inicio de sesión.
- Recuperación y restablecimiento de contraseña.
- Catálogo de disfraces.
- Catálogo de paquetes.
- Creación y gestión de eventos.
- Creación y gestión de reservas.
- Dashboard con resumen de información.
- Formulario de contacto.

### Funciones para admin
- CRUD de disfraces (`/admin/costumes`).
- CRUD de paquetes (`/admin/packages`).
- Gestión de reservas y eventos.
- Revisión de mensajes de contacto.

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
- SQLite (desarrollo)

### Servicios externos
- SendGrid (emails)
- WhatsApp link

---

## Estructura general de datos

Modelos principales:
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
git clone https://github.com/tu-usuario/diverkids.git
cd diverkids
```

### 2) Backend
```bash
python -m venv venv
venv\Scripts\activate
cd my-react-app/src/backend
pip install -r requirements.txt
```

Crea `my-react-app/src/backend/.env` desde `.env.example`.

Variables mínimas:
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
```

### 3) Frontend
```bash
cd my-react-app
npm install
```

Crea `my-react-app/.env` desde `.env.example`:
```env
VITE_API_URL=http://localhost:5001
VITE_GOOGLE_MAPS_API_KEY=
```

### 4) Seed de base de datos
```bash
cd my-react-app/src/backend
python seed.py
```

---

## Ejecutar proyecto

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

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5001`

---

## Credenciales de prueba

Admin (seed):
- Email: `admin@diverkids.com`
- Password: `admin123`

También puedes crear usuario en `/register`.
Nota: por seguridad, estas credenciales no se muestran dentro de la interfaz.

---

## Rutas principales del frontend

- `/` Home
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

## Endpoints principales de API

### Auth
- `POST /api/signup`
- `POST /api/login`
- `GET /api/profile`
- `PUT /api/profile`
- `POST /api/forgot-password`
- `POST /api/reset-password`

### Costumes
- `GET /api/costumes`
- `POST /api/costumes` (admin)
- `PUT /api/costumes/:id` (admin)
- `DELETE /api/costumes/:id` (admin)

### Packages
- `GET /api/packages`
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

## Estado actual del proyecto

✅ Implementado:
- Full-stack funcional
- Autenticación JWT
- Contraseñas cifradas
- CRUDs principales
- Panel admin (disfraces + paquetes)
- Recuperación de contraseña

🛠 Pendiente/mejorable:
- Deploy final (frontend + backend)
- Cambiar SQLite a PostgreSQL en producción
- Mejorar entregabilidad de correos (Domain Authentication en SendGrid)
- Tests automáticos

---

## Rúbrica de evaluación (evidencia)

### 1) Buen diseño y presentación
- Cumplido: interfaz responsive, estilos personalizados y navegación por secciones.
- Evidencia:
  - Frontend React con componentes y estilos propios.
  - Vistas principales: Home, Costumes, Packages, Events, Bookings, Dashboard.

### 2) Registro, autenticación y restablecimiento de contraseña
- Cumplido:
  - Registro: `/register` + `POST /api/signup`
  - Login: `/login` + `POST /api/login`
  - Recuperación: `/forgot-password`, `/reset-password` + endpoints correspondientes
- Evidencia:
  - JWT para sesión y rutas protegidas.
  - Flujo completo de recuperación implementado.

### 3) Contraseñas cifradas (no texto plano)
- Cumplido:
  - Hash con Flask-Bcrypt en backend.
  - Verificación de contraseña al iniciar sesión.

### 4) Backend/API a medida
- Cumplido:
  - API propia en Flask para auth, disfraces, paquetes, eventos, reservas y contactos.

### 5) Mínimo 3 vistas + al menos 1 CRUD completo
- Cumplido de sobra:
  - Vistas: más de 10 rutas frontend.
  - CRUD completo: Costumes, Packages, Events y Bookings.
  - Admin con gestión de disfraces y paquetes.

### 6) Integración con API/librerías de terceros
- Cumplido:
  - SendGrid para emails.
  - Integración de contacto directo por WhatsApp.
  - Librerías UI y utilidades modernas en frontend.

### 7) Deploy en producción
- En progreso:
  - Falta cerrar despliegue final de frontend y backend.
  - Recomendado: Vercel/Netlify (frontend) + Render/Railway (backend).

---

## Product backlog (resumen de historias)

Historias principales implementadas:
- Como usuario, quiero registrarme para acceder a funcionalidades privadas.
- Como usuario, quiero iniciar sesión para ver mi dashboard.
- Como usuario, quiero recuperar mi contraseña por email.
- Como usuario, quiero ver catálogo de disfraces y paquetes.
- Como usuario, quiero reservar servicios para un evento.
- Como usuario, quiero crear/editar/eliminar mis eventos.
- Como admin, quiero crear/editar/eliminar disfraces.
- Como admin, quiero crear/editar/eliminar paquetes.
- Como admin, quiero revisar reservas y mensajes de contacto.

Historias pendientes/micro-mejoras:
- Como equipo, queremos desplegar en producción con variables seguras.
- Como equipo, queremos mejorar la entregabilidad de emails (Domain Authentication).
- Como equipo, queremos agregar tests automáticos.

---

## Autor

Jean Aguiluz
- GitHub: [@jeanaguiluz](https://github.com/jeanaguiluz)

---

## Nota

Este proyecto fue desarrollado como parte del proyecto final de 4Geeks Academy.
