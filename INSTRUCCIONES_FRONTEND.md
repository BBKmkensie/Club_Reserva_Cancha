# Instrucciones para Ejecutar el Frontend Angular

## 📦 Instalación

1. **Navegar a la carpeta frontend:**
```bash
cd frontend
```

2. **Instalar dependencias:**
```bash
npm install
```

Esto instalará:
- Angular 18 y todas sus dependencias
- Tailwind CSS y PostCSS
- Todas las dependencias necesarias

## 🚀 Ejecutar el Proyecto

### Desarrollo

```bash
npm start
```

O directamente:

```bash
ng serve
```

La aplicación estará disponible en: **http://localhost:4200**

### Compilar para Producción

```bash
npm run build
```

Los archivos compilados estarán en la carpeta `dist/reservas-frontend`

## ⚙️ Configuración

### Backend API

Asegúrate de que el backend NestJS esté corriendo en `http://localhost:3000`.

Si necesitas cambiar la URL del backend, edita:
- `frontend/src/environments/environment.ts` (desarrollo)
- `frontend/src/environments/environment.prod.ts` (producción)

## 📱 Características Implementadas

✅ **Dashboard**
- Estadísticas generales
- Vista de talleres y reservas recientes

✅ **Gestión de Talleres**
- Crear, editar, eliminar talleres
- Formularios con validación

✅ **Gestión de Alumnos**
- CRUD completo
- Asociación con talleres
- Tabla responsive

✅ **Gestión de Profesores**
- CRUD completo
- Asociación con talleres
- Cards modernos

✅ **Gestión de Reservas**
- CRUD completo
- Filtros por fecha y taller
- Tabla con información detallada

✅ **Gestión de Salidas**
- CRUD completo
- Cards informativos

✅ **Gestión de Administradores**
- Crear y eliminar admins
- Tabla de administradores

## 🎨 Diseño

- **Tailwind CSS** para estilos modernos y responsive
- **Componentes standalone** (Angular 18)
- **Formularios reactivos** con validación
- **Navegación** con Angular Router
- **Diseño responsive** para móviles y desktop

## 🔧 Solución de Problemas

### Error: "Cannot find module '@angular/..."
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Error de conexión con el backend
- Verifica que el backend NestJS esté corriendo
- Revisa la URL en `environment.ts`
- Verifica CORS en el backend

### Tailwind CSS no funciona
- Verifica que `tailwind.config.js` esté en la raíz de `frontend`
- Verifica que `postcss.config.js` esté presente
- Asegúrate de que `styles.css` tenga las directivas de Tailwind

## 📝 Notas Importantes

1. **Node.js**: Requiere Node.js v18 o superior
2. **Puerto**: El frontend corre en el puerto 4200 por defecto
3. **Backend**: Debe estar corriendo en el puerto 3000
4. **CORS**: El backend debe tener CORS habilitado (ya está configurado)

## 🎯 Próximos Pasos

1. Inicia el backend NestJS: `npm run start:dev` (en la raíz del proyecto)
2. Inicia el frontend Angular: `npm start` (en la carpeta frontend)
3. Abre tu navegador en: `http://localhost:4200`

¡Listo para usar! 🚀

