# Reservas de Cancha - Proyecto Taller

Sistema de gestión de talleres, alumnos, profesores, reservas y salidas. Backend NestJS + frontend Angular.

Repositorio: [GitHub - Reservas_de_Cancha](https://github.com/BBKmkensie/Reservas_de_Cancha)

## 🚀 Tecnologías

- **Backend:** NestJS, TypeORM, MariaDB/MySQL
- **Frontend:** Angular 18, Tailwind CSS
- **Validación:** class-validator, class-transformer

## 📋 Requisitos previos

- **Node.js** v18 o superior
- **npm**
- **MariaDB** o **MySQL** instalado y en ejecución

---

## 🖥️ Configuración en otro PC (clonar y usar)

Sigue estos pasos para tener el proyecto funcionando en un equipo nuevo.

### 1. Clonar el repositorio

```bash
git clone https://github.com/BBKmkensie/Reservas_de_Cancha.git
cd Reservas_de_Cancha
```

### 2. Configurar la base de datos

1. Inicia MariaDB/MySQL.
2. Crea la base de datos y las tablas ejecutando los scripts SQL **en este orden** (desde la raíz del proyecto):

```bash
# Crear base de datos
mysql -u root -p < create_database.sql

# Esquema completo (tablas base)
mysql -u root -p proyecto_taller < proyecto_taller_fixed.sql

# Migraciones (roles, imagen en talleres, reservas por profesor, inscripción a salidas)
mysql -u root -p proyecto_taller < migration_roles_y_inscripcion.sql
mysql -u root -p proyecto_taller < migration_alumno_taller_nullable.sql
mysql -u root -p proyecto_taller < migration_inscripcion_taller.sql
```

3. (Opcional) Datos de ejemplo:

```bash
mysql -u root -p proyecto_taller < seed_taller_futbol.sql
mysql -u root -p proyecto_taller < insert_talleres.sql
```

Sustituye `root` y `-p` por tu usuario y contraseña de MySQL si no usas root.

### 3. Configurar el backend

```bash
# En la raíz del proyecto
cp .env.example .env
```

Edita `.env` y pon tu **DB_PASSWORD**, **DB_PORT** (por ejemplo 3306 o 3307) y el resto si lo necesitas.

```bash
npm install
npm run start:dev
```

El API quedará en **http://localhost:3000**.

### 4. Configurar el frontend

En otra terminal:

```bash
cd frontend
npm install
npm start
```

La aplicación quedará en **http://localhost:4200**. El frontend espera el backend en `http://localhost:3000` (ver `frontend/src/environments/` si cambias de puerto).

---

## ⚙️ Instalación (resumen)

1. Clonar el repositorio.
2. Crear la base de datos y ejecutar los scripts SQL en el orden indicado arriba.
3. Copiar `.env.example` a `.env` y configurar variables.
4. En la raíz: `npm install` y `npm run start:dev`.
5. En `frontend`: `npm install` y `npm start`.

## 👥 Roles del sistema

- **Super Admin**: Crea y edita talleres (con descripción, fotos), gestiona horarios de la cancha y administradores.
- **Admin (Profesor)**: Reserva horas en la cancha y abre salidas para que los estudiantes se inscriban.
- **Usuario (Estudiante/Alumno)**: Se inscribe a talleres y a salidas.

En el frontend, en la ruta `/login` se elige el rol con el que entrar (sin autenticación real; el rol se guarda en el navegador).

## 🗄️ Base de Datos

La base de datos ya debe estar creada con las siguientes tablas:
- `admin`
- `talleres`
- `alumnos`
- `profesores`
- `reservas`
- `salidas`

Para añadir roles, foto en talleres, reservas por profesor e inscripción a salidas, ejecuta la migración:

```bash
mysql -u root -p proyecto_taller < migration_roles_y_inscripcion.sql
```

Esto crea/añade: columna `admin.rol`, `talleres.imagen_url`, `reservas.profesor_id`, tabla `inscripcion_salida`.

## 🏃 Ejecutar la Aplicación

### Modo desarrollo

```bash
npm run start:dev
```

### Modo producción

```bash
npm run build
npm run start:prod
```

La aplicación estará disponible en `http://localhost:3000`

## 📚 Endpoints de la API

### Admin

- `POST /admin` - Crear un administrador
- `GET /admin` - Obtener todos los administradores
- `GET /admin/:id` - Obtener un administrador por ID
- `DELETE /admin/:id` - Eliminar un administrador

### Taller

- `POST /taller` - Crear un taller
- `GET /taller` - Obtener todos los talleres
- `GET /taller/:id` - Obtener un taller por ID
- `PATCH /taller/:id` - Actualizar un taller
- `DELETE /taller/:id` - Eliminar un taller

### Alumno

- `POST /alumno` - Crear un alumno
- `GET /alumno` - Obtener todos los alumnos
- `GET /alumno?tallerId=1` - Obtener alumnos por taller
- `GET /alumno/:id` - Obtener un alumno por ID
- `PATCH /alumno/:id` - Actualizar un alumno
- `DELETE /alumno/:id` - Eliminar un alumno

### Profesor

- `POST /profesor` - Crear un profesor
- `GET /profesor` - Obtener todos los profesores
- `GET /profesor?tallerId=1` - Obtener profesores por taller
- `GET /profesor/:id` - Obtener un profesor por ID
- `PATCH /profesor/:id` - Actualizar un profesor
- `DELETE /profesor/:id` - Eliminar un profesor

### Reserva

- `POST /reserva` - Crear una reserva
- `GET /reserva` - Obtener todas las reservas
- `GET /reserva?tallerId=1` - Obtener reservas por taller
- `GET /reserva?fecha=2024-01-01` - Obtener reservas por fecha
- `GET /reserva/:id` - Obtener una reserva por ID
- `PATCH /reserva/:id` - Actualizar una reserva
- `DELETE /reserva/:id` - Eliminar una reserva

### Salida

- `POST /salida` - Crear una salida
- `GET /salida` - Obtener todas las salidas
- `GET /salida?tallerId=1` - Obtener salidas por taller
- `GET /salida/:id` - Obtener una salida por ID
- `PATCH /salida/:id` - Actualizar una salida
- `DELETE /salida/:id` - Eliminar una salida

### Inscripción a salida (estudiantes)

- `POST /inscripcion-salida` - Inscribir un alumno en una salida (`alumnoId`, `salidaId`)
- `GET /inscripcion-salida/por-alumno/:alumnoId` - Inscripciones de un alumno
- `GET /inscripcion-salida/por-salida/:salidaId` - Inscritos en una salida
- `DELETE /inscripcion-salida?alumnoId=&salidaId=` - Desinscribir

## 📝 Ejemplos de Uso

### Crear un Admin

```bash
curl -X POST http://localhost:3000/admin \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Pérez",
    "rut": "12345678-9",
    "email": "juan@example.com",
    "password": "password123"
  }'
```

### Crear un Taller

```bash
curl -X POST http://localhost:3000/taller \
  -H "Content-Type: application/json" \
  -d '{
    "tipo": "Deportivo",
    "descripcion": "Taller de fútbol para jóvenes",
    "capacidad": 25,
    "fechaInicio": "2024-01-15",
    "adminId": 1
  }'
```

### Crear un Alumno

```bash
curl -X POST http://localhost:3000/alumno \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "María González",
    "rut": "98765432-1",
    "email": "maria@example.com",
    "telefono": "+56912345678",
    "edad": 15,
    "tallerId": 1
  }'
```

## 🔒 Seguridad

- Las contraseñas se almacenan usando hash PBKDF2 con salt
- Validación automática de datos de entrada mediante DTOs
- CORS habilitado para desarrollo

## 🧪 Testing

```bash
# unit tests
npm run test

# e2e tests
npm run test:e2e

# test coverage
npm run test:cov
```

## 📦 Estructura del Proyecto

```
src/
├── admin/           # Módulo de administradores
├── alumno/          # Módulo de alumnos
├── profesor/        # Módulo de profesores
├── taller/          # Módulo de talleres
├── reserva/         # Módulo de reservas
├── salida/          # Módulo de salidas
├── config/          # Configuración
├── dto/             # Data Transfer Objects
├── entities/        # Entidades TypeORM
├── app.module.ts    # Módulo principal
└── main.ts          # Punto de entrada
```

## 📄 Licencia

Este proyecto es privado.
