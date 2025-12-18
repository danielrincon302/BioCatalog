# BioCatalog

Sistema de gestión de catálogos de biodiversidad. Permite registrar, organizar y consultar información sobre especies de fauna y flora.

## Tecnologías

- **Backend**: Laravel 11 (PHP 8.2+)
- **Frontend**: Next.js 14 + React 18
- **Base de datos**: MySQL 8
- **UI**: Tailwind CSS + shadcn/ui

## Estructura del Proyecto

```
BioCatalog/
├── backend/           # API Laravel
│   ├── app/
│   │   ├── Http/Controllers/Api/
│   │   ├── Models/
│   │   └── Policies/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   └── routes/api.php
│
├── frontend/          # Next.js
│   ├── app/
│   │   ├── (auth)/login/
│   │   ├── (dashboard)/items/
│   │   └── catalog/
│   ├── components/
│   └── lib/
│
├── MER.md            # Modelo Entidad-Relación
└── README.md
```

## Instalación

### Requisitos previos

- PHP 8.2+
- Composer
- Node.js 18+
- MySQL 8
- npm o yarn

### Backend (Laravel)

```bash
# 1. Ir al directorio backend
cd backend

# 2. Instalar dependencias
composer install

# 3. Configurar ambiente
cp .env.example .env
php artisan key:generate

# 4. Configurar base de datos en .env
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=biocatalog
# DB_USERNAME=root
# DB_PASSWORD=

# 5. Crear base de datos MySQL
mysql -u root -p -e "CREATE DATABASE biocatalog CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 6. Ejecutar migraciones y seeders
php artisan migrate --seed

# 7. Iniciar servidor
php artisan serve
```

El backend estará disponible en `http://localhost:8000`

### Frontend (Next.js)

```bash
# 1. Ir al directorio frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Configurar ambiente
cp .env.local.example .env.local

# 4. Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Usuario por defecto

```
Usuario: admin
Contraseña: admin123
Rol: Super Administrador
Compañía: MyNeighborhood
```

## Funcionalidades

### Roles de Usuario

| Rol | Compañías | Usuarios | Items |
|-----|-----------|----------|-------|
| Super Admin | CRUD todas | CRUD todos | CRUD todos |
| Administrador | Ver propia | CRUD editores (su compañía) | CRUD su compañía |
| Editor | Ver propia | Solo ver perfil | CRUD propios |

### Interfaces

1. **Login** (`/login`)
   - Autenticación con email y contraseña
   - Tokens JWT con Laravel Sanctum

2. **Dashboard de Items** (`/items`)
   - Lista de items con filtros
   - CRUD completo según permisos
   - Filtros por colección y búsqueda

3. **Catálogo Público** (`/catalog`)
   - Visualización de items visibles
   - Filtros por colección y compañía
   - Sin autenticación requerida

4. **Detalle de Item** (`/catalog/{slug}`)
   - URL dinámica para QR
   - Galería de imágenes
   - Información taxonómica completa

## API Endpoints

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/logout` - Cerrar sesión
- `GET /api/auth/me` - Usuario actual

### Compañías (Super Admin)
- `GET /api/companias` - Listar
- `POST /api/companias` - Crear
- `PUT /api/companias/{id}` - Actualizar
- `DELETE /api/companias/{id}` - Eliminar

### Usuarios
- `GET /api/usuarios` - Listar
- `POST /api/usuarios` - Crear
- `PUT /api/usuarios/{id}` - Actualizar
- `DELETE /api/usuarios/{id}` - Eliminar

### Items
- `GET /api/items` - Listar
- `POST /api/items` - Crear
- `GET /api/items/{id}` - Ver
- `PUT /api/items/{id}` - Actualizar
- `DELETE /api/items/{id}` - Eliminar
- `POST /api/items/{id}/imagenes` - Agregar imágenes

### Catálogo Público
- `GET /api/catalogo` - Listar items públicos
- `GET /api/catalogo/{slug}` - Ver item por slug
- `GET /api/catalogo/colecciones` - Listar colecciones
- `GET /api/catalogo/companias` - Listar compañías

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
