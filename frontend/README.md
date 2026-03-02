# Frontend - Reservas de Cancha

Frontend desarrollado con Angular 18 y Tailwind CSS para el sistema de gestión de talleres, alumnos, profesores, reservas y salidas.

## 🚀 Tecnologías

- **Angular 18** - Framework TypeScript
- **Tailwind CSS** - Framework CSS utility-first
- **RxJS** - Programación reactiva
- **TypeScript** - Lenguaje de programación

## 📋 Requisitos Previos

- Node.js (v18 o superior)
- npm o yarn
- Backend NestJS corriendo en `http://localhost:3000`

## ⚙️ Instalación

1. Navegar a la carpeta frontend:
```bash
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

## 🏃 Ejecutar la Aplicación

### Modo desarrollo

```bash
npm start
```

La aplicación estará disponible en `http://localhost:4200`

### Compilar para producción

```bash
npm run build
```

## 📱 Características

- ✅ Dashboard con estadísticas
- ✅ Gestión de Talleres (CRUD completo)
- ✅ Gestión de Alumnos (CRUD completo)
- ✅ Gestión de Profesores (CRUD completo)
- ✅ Gestión de Reservas (CRUD completo)
- ✅ Gestión de Salidas (CRUD completo)
- ✅ Gestión de Administradores
- ✅ Diseño responsive con Tailwind CSS
- ✅ Formularios reactivos con validación
- ✅ Navegación con Angular Router

## 🎨 Estructura del Proyecto

```
src/
├── app/
│   ├── models/          # Interfaces TypeScript
│   ├── pages/           # Componentes de páginas
│   ├── services/        # Servicios (API)
│   ├── shared/          # Componentes compartidos
│   ├── app.component.ts
│   └── app.routes.ts
├── environments/        # Configuración de entornos
├── styles.css           # Estilos globales con Tailwind
└── main.ts              # Punto de entrada
```

## 🔧 Configuración

El archivo `src/environments/environment.ts` contiene la URL del backend:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000'
};
```

Asegúrate de que el backend NestJS esté corriendo en el puerto 3000.

## 📝 Notas

- El frontend está configurado para comunicarse con el backend en `http://localhost:3000`
- Si cambias el puerto del backend, actualiza `environment.ts`
- Tailwind CSS está configurado y listo para usar
- Todos los componentes son standalone (Angular 18)

