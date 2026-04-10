# Manual de Usuario - ForestPlus V2

Este manual detalla las funcionalidades de la plataforma ForestPlus V2 tanto para usuarios finales como para administradores.

---

## 🌳 Perfil de Usuario Final

Como usuario de ForestPlus, tu objetivo principal es visualizar tu impacto ambiental positivo a través de la plantación de árboles.

### 🏠 Dashboard (Inicio)
Al entrar, verás tu panel personal con los siguientes KPIs:
- **Árboles Plantados**: Número de árboles que ya tienen un lugar físico en la tierra.
- **Árboles Pendientes**: Árboles que has adquirido pero que aún no han sido asignados a una plantación real (están en "vivero digital").
- **Impacto Ambiental**: Cálculo en tiempo real de cuánto CO₂ estás compensando y sus equivalencias (km en coche, avión, etc.).
- **Próxima Plantación**: Estado de la plantación activa más cercana para ver su progreso hacia el objetivo de árboles.

### 👤 Mi Perfil
Puedes gestionar tus datos personales (Nombre, Apellidos, Foto de perfil) y cambiar tu contraseña de acceso de forma segura.

---

## 🔐 Perfil de Administrador

Además de las funciones de usuario, los administradores tienen acceso a herramientas de gestión global.

### 👥 Gestión de Usuarios
En el listado de usuarios (`/admin/users`), un administrador puede:
- **Identificar Pendientes**: Los usuarios con árboles comprados pero sin asignar aparecen resaltados en **amarillo** con un icono de árbol indicador.
- **Crear Usuarios**: Mediante el botón "+ Añadir Usuario" se abre un modal rápido para dar de alta nuevas cuentas.
- **Eliminar Usuarios**: Acción definitiva para dar de baja cuentas (con confirmación de seguridad).
- **Acceder al Perfil (Edición)**: Al pulsar el icono del **lápiz**, el administrador accede a la página completa de perfil del usuario.

### 🌲 Asignación de Árboles (Admin Only)
Desde la página de perfil de cualquier usuario, un administrador verá el botón **"Asignar Árboles"**.

#### El Proceso de Asignación:
1. **Pulsar Asignar**: Se abre el modal de gestión de plantaciones.
2. **Seleccionar Terreno**: Elegir el terreno físico donde se realizará la plantación.
3. **Seleccionar Plantación**: Elegir una de las "Plantaciones Planificadas" activas en ese terreno.
4. **Seleccionar ESPECIE**: Elegir el tipo de árbol (encina, roble, etc.) que se va a plantar.
5. **Cantidad**: Indicar cuántos árboles de los "pendientes" del usuario se van a plantar.
6. **Confirmar**: Al guardar, el contador de árboles pendientes del usuario bajará y el de plantados subirá automáticamente.

---
© 2026 ForestPlus. Gestión Sostenible de Masa Forestal.
