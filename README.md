# BioCatalog

![BioCatalog - Página Principal](docs/img/BioCatalogoHome.png)

**BioCatalog** es un sistema de gestión de catálogos de biodiversidad que permite documentar, organizar y compartir información sobre especies de fauna y flora.

La página principal del catálogo público presenta una interfaz intuitiva con:

- **Encabezado verde** con el título "Catálogo de Biodiversidad" y un buscador central
- **Panel lateral izquierdo** con filtros por Colecciones (Aves, Herbario) y Zonas
- **Grilla de tarjetas** mostrando las especies registradas, cada una con:
  - Imagen representativa de la especie
  - Etiqueta de colección (Aves, Herbario, etc.)
  - Nombre científico en formato itálico
  - Nombre común
  - Breve descripción
- **Selector de idioma** (Español/Inglés) en la esquina superior derecha
- **Acceso al área de administración** mediante el botón "Iniciar sesión"

---

## Búsqueda y Filtrado

<a href="docs/img/BioCatalogoHome-search.png">
  <img src="docs/img/BioCatalogoHome-search.png" alt="Búsqueda en el catálogo" width="600">
</a>

*Clic en la imagen para ver en tamaño completo*

El catálogo ofrece potentes herramientas de búsqueda y filtrado:

- **Barra de búsqueda**: Permite buscar especies por nombre científico o común. En el ejemplo se busca "Coli" y filtra automáticamente mostrando el "Colibrí paramuno" (*Aglaeactis cupripennis*)
- **Filtro por Colecciones**: Selecciona entre categorías como Aves (5 especies), Herbario (2 especies), etc.
- **Filtro por Zonas**: Filtra por ubicación geográfica o institución (ej: MyNeighborhood)
- **Resultados en tiempo real**: Los resultados se actualizan instantáneamente mientras escribes

---

## Detalle de Especie

<a href="docs/img/BioCatalogoDescItem.png">
  <img src="docs/img/BioCatalogoDescItem.png" alt="Detalle de especie" width="600">
</a>

*Clic en la imagen para ver en tamaño completo*

Al hacer clic sobre cualquier especie del catálogo, se accede a su ficha detallada que incluye:

- **Imagen principal**: Fotografía de alta calidad de la especie
- **Etiqueta de colección**: Indica a qué colección pertenece (Aves, Herbario, etc.)
- **Nombre científico**: *Thamnophilus multistriatus* (en formato itálico)
- **Nombre común**: Batará Carcajada
- **Descripción**: Texto detallado sobre la especie, sus características y hábitat
- **Clasificación Taxonómica**: Tabla con información científica:
  - Orden: Chiroptera
  - Clase: Aves
  - Familia: Thamnophilidae
  - Género: Thamnophilus
  - Especie: T. multistriatus
- **Historia**: Información adicional sobre el origen del nombre, características morfológicas distintivas y datos de interés científico

---

## Zona de Usuarios

El panel de administración permite gestionar todos los aspectos del catálogo. Solo usuarios autenticados pueden acceder a estas funciones.

### Gestión de Items

<a href="docs/img/Dashboard-items.png">
  <img src="docs/img/Dashboard-items.png" alt="Dashboard - Items" width="600">
</a>

*Clic en la imagen para ver en tamaño completo*

La sección de **Items** permite administrar todas las especies del catálogo:

- **Lista tabular** con columnas: Nombre científico, Nombre común, Colección, Estado y Acciones
- **Buscador** para localizar especies rápidamente
- **Filtro por colección** para ver solo items de una categoría específica
- **Estados**: Indica si el item está "Visible" en el catálogo público
- **Acciones disponibles**:
  - Ver detalle del item
  - Editar información
  - Eliminar item
- **Botón "+ Nuevo Item"** para agregar nuevas especies al catálogo

---

### Gestión de Usuarios

<a href="docs/img/Dashboard-users.png">
  <img src="docs/img/Dashboard-users.png" alt="Dashboard - Usuarios" width="600">
</a>

*Clic en la imagen para ver en tamaño completo*

La sección de **Usuarios** permite administrar el acceso al sistema:

- **Lista de usuarios** con: Nombre, Email, Rol, Zona asignada y Estado
- **Roles disponibles**:
  - **Super Administrador**: Acceso total al sistema
  - **Administrador**: Gestión completa de su zona
  - **Editor**: Puede crear y editar items
- **Estados**: Activo/Inactivo para controlar el acceso
- **Zona asignada**: Cada usuario pertenece a una zona específica
- **Acciones**: Editar y eliminar usuarios
- **Botón "+ Nuevo Usuario"** para registrar nuevos usuarios

---

### Gestión de Zonas y Colecciones

<a href="docs/img/Dashboard-zonas.png">
  <img src="docs/img/Dashboard-zonas.png" alt="Dashboard - Zonas" width="600">
</a>

*Clic en la imagen para ver en tamaño completo*

Las **Zonas** representan organizaciones, instituciones o áreas geográficas:

- **Información de zona**: Nombre, NIT, Teléfono, Email y Estado
- **Cada zona** puede tener su propio catálogo de especies
- **Multi-tenant**: El sistema soporta múltiples organizaciones independientes

<a href="docs/img/Dashboard-zonas-collecciones.png">
  <img src="docs/img/Dashboard-zonas-collecciones.png" alt="Dashboard - Configuración de Colecciones" width="400">
</a>

*Clic en la imagen para ver en tamaño completo*

Al editar una zona se puede configurar:

- **Datos básicos**: Nombre, NIT, Dirección, Teléfono, Email
- **Logo personalizado**: URL del logo de la organización
- **Estado**: Activo/Inactivo
- **Visibilidad de Colecciones**: Seleccionar qué colecciones estarán disponibles en el catálogo público de esa zona:
  - Anfibios, Aves, Invertebrados, Mamíferos, Peces, Reptiles, Herbario, Fitolitos

---

### Configuración del Catálogo

<a href="docs/img/Dashboard-config.png">
  <img src="docs/img/Dashboard-config.png" alt="Dashboard - Configuración" width="600">
</a>

*Clic en la imagen para ver en tamaño completo*

La sección de **Ajustes** permite personalizar la apariencia del catálogo público:

- **Título del catálogo**:
  - Título en Español: "Catálogo de Biodiversidad"
  - Título en Inglés: "Biodiversity Catalog"
- **Favicon**: Ícono que aparece en la pestaña del navegador (32x32 o 64x64 píxeles, formatos ICO, PNG, GIF o SVG)
- **Logo**: Imagen que se muestra en el menú lateral del catálogo público
- **Vista previa**: Muestra cómo se verá el logo en el catálogo

---

## Tecnologías

- **Backend**: Laravel 11 (PHP 8.2+)
- **Frontend**: Next.js 14 + React 18
- **Base de datos**: MySQL 8
- **UI**: Tailwind CSS + shadcn/ui
- **Contenedores**: Docker & Docker Compose

## Instalación con Docker

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/BioCatalog.git
cd BioCatalog

# Iniciar con Docker
docker compose up -d --build

# Acceder a la aplicación
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
```

## Instalación Manual

### Backend (Laravel)

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate --seed
php artisan serve
```

### Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

## Usuario por defecto

```
Usuario: admin
Contraseña: admin123
Rol: Super Administrador
```

## Colecciones Disponibles

1. Anfibios
2. Aves
3. Invertebrados
4. Mamíferos
5. Peces
6. Herbario
7. Reptiles
8. Fitolitos

## Licencia

MIT
