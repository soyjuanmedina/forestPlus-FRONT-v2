# ForestPlus V2 - Frontend

Este es el repositorio del frontend moderno (V2) de ForestPlus, desarrollado con **Angular 17+**. Proporciona una interfaz de usuario premium, rápida y responsive para la gestión de plantaciones, monitorización de impacto ambiental y administración de usuarios.

## 🚀 Tecnologías Principales

- **Angular 17+**: Framework principal (Standalone Components).
- **TypeScript**: Tipado estático y mejores prácticas.
- **Vanilla CSS**: Sistema de diseño a medida (sin frameworks de utilidad como Tailwind, para máximo control).
- **i18next**: Soporte multi-idioma (Español/Inglés).
- **OpenAPI Generator**: Cliente de API autogenerado para sincronización perfecta con el Backend.

## 🛠️ Instalación y Configuración

### Requisitos Previos

- **Node.js** (v18 o superior recomendado)
- **NPM** (incluido con Node.js)

### Pasos para arrancar en local

1. Instalar dependencias:
   ```bash
   npm install
   ```

2. Arrancar el servidor de desarrollo:
   ```bash
   npm run start
   ```
   La aplicación estará disponible en `http://localhost:4200`.

## 📁 Estructura del Proyecto

- `src/app/api`: Modelos y servicios autogenerados desde el Swagger del Backend.
- `src/app/dashboard`: Componentes principales del panel de control (Home, Perfil, Usuarios).
- `src/app/modals`: Componentes de ventana emergente reutilizables.
- `src/app/services`: Lógica de negocio y servicios manuales (Auth, Tree, Admin).
- `src/assets/i18n`: Archivos de traducción JSON.

## 📖 Guía para Usuarios y Administradores

Para una explicación detallada de cómo usar la aplicación, las funciones de administrador y la lógica de asignación de árboles, consulta el siguiente manual:

👉 **[MANUAL_USUARIO.md](./MANUAL_USUARIO.md)**

---
Developed for ForestPlus.
