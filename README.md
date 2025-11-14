# API RESTful con Node.js, Express, TypeScript y PostgreSQL

API RESTful completa con operaciones CRUD para gestión de productos y sistema de autenticación JWT. Incluye control de acceso basado en roles, documentación con Swagger, Prisma ORM y buenas prácticas de desarrollo.

[![Tests](https://img.shields.io/badge/tests-passing-brightgreen)](https://github.com/tu-usuario/remedial-ipg-backend-ciclo-7)
[![Coverage](https://img.shields.io/badge/coverage-80%25-green)](https://github.com/tu-usuario/remedial-ipg-backend-ciclo-7)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-16+-green)](https://nodejs.org/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)
- [Requisitos Previos](#-requisitos-previos)
- [Inicio Rápido](#-inicio-rápido)
- [Instalación Detallada](#-instalación-detallada)
  - [Opción 1: Con Docker Compose](#opción-1-con-docker-compose-recomendado)
  - [Opción 2: PostgreSQL con Homebrew](#opción-2-postgresql-con-homebrew-macos)
- [Estructura del Proyecto](#-estructura-del-proyecto)
- [Modelos de Base de Datos](#-modelos-de-base-de-datos)
- [Autenticación y Autorización](#-autenticación-y-autorización)
- [Documentación de API](#-documentación-de-api)
- [Comandos Útiles](#-comandos-útiles)
- [Solución de Problemas](#-solución-de-problemas)
- [Testing](#-testing)
- [Variables de Entorno](#-variables-de-entorno)
- [Documentación Adicional](#-documentación-adicional)

---

## ✨ Características

- 🔐 **Autenticación JWT**: Sistema completo de registro y login con tokens JWT
- 📦 **CRUD de Productos**: Operaciones completas de Crear, Leer, Actualizar y Eliminar
- 👥 **Control de Acceso**: Sistema de autorización basado en roles (USER, ADMIN, MODERATOR)
- 🗄️ **PostgreSQL + Prisma**: ORM moderno con migraciones y type-safety
- 📚 **Documentación Swagger**: Interfaz interactiva para probar la API
- 🔒 **Seguridad**: Helmet, CORS, bcrypt para contraseñas
- ✅ **Testing**: Suite de tests con 80%+ de cobertura
- 🐳 **Docker**: Configuración lista para desarrollo con Docker Compose
- 📝 **TypeScript**: Tipado estático para mayor seguridad
- 🎨 **Code Quality**: ESLint, Prettier y Husky pre-commit hooks

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Descripción |
|------------|---------|-------------|
| **Node.js** | v16+ | Entorno de ejecución JavaScript |
| **Express** | v4.18 | Framework web minimalista |
| **TypeScript** | v5.9 | Superset de JavaScript con tipado |
| **PostgreSQL** | v15 | Base de datos relacional |
| **Prisma** | v6.19 | ORM moderno para Node.js |
| **JWT** | v9.0 | Autenticación basada en tokens |
| **Bcrypt** | v3.0 | Hash seguro de contraseñas |
| **Swagger** | v4.6 | Documentación de API |
| **Jest** | v29.3 | Framework de testing |
| **Docker** | - | Contenedorización |

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior) - [Descargar](https://nodejs.org/)
- **npm** (incluido con Node.js) o **yarn**
- **Docker & Docker Compose** (opcional, recomendado) - [Descargar](https://www.docker.com/)
- **PostgreSQL** (v12 o superior, si no usas Docker) - [Descargar](https://www.postgresql.org/download/)

---

## 🚀 Inicio Rápido

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd remedial-ipg-backend-ciclo-7

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Edita .env con tus configuraciones

# 4. Levantar PostgreSQL con Docker
docker-compose up -d

# 5. Ejecutar migraciones de Prisma
npm run prisma:generate
npm run prisma:migrate

# 6. Iniciar servidor en modo desarrollo
npm run dev
```

¡Listo! 🎉 El servidor estará disponible en `http://localhost:3000`

---

## 📦 Instalación Detallada

### Opción 1: Con Docker Compose (Recomendado)

Esta es la forma más rápida y sencilla de configurar el entorno de desarrollo.

#### Paso 1: Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd remedial-ipg-backend-ciclo-7
```

#### Paso 2: Instalar dependencias de Node.js

```bash
npm install
```

#### Paso 3: Configurar variables de entorno

```bash
cp .env.example .env
```

Edita el archivo `.env` con la siguiente configuración:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos PostgreSQL (Docker Compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"

# JWT
JWT_SECRET=mi_clave_secreta_super_segura_cambiar_en_produccion_2024
JWT_EXPIRE=7d

# CORS (opcional)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

#### Paso 4: Levantar contenedores de Docker

```bash
# Iniciar PostgreSQL y PgAdmin
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps
```

Esto levantará:
- **PostgreSQL** en `localhost:5432`
- **PgAdmin** en `http://localhost:5050` (admin@ejemplo.com / admin)

#### Paso 5: Generar Prisma Client y ejecutar migraciones

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones (crear tablas en la BD)
npm run prisma:migrate

# (Opcional) Verificar la base de datos con Prisma Studio
npm run prisma:studio
```

#### Paso 6: Iniciar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev
```

El servidor estará disponible en `http://localhost:3000`

---

### Opción 2: PostgreSQL con Homebrew (macOS)

Si prefieres instalar PostgreSQL localmente sin Docker.

#### Paso 1: Instalar PostgreSQL con Homebrew

```bash
# Instalar PostgreSQL
brew install postgresql@15

# Iniciar el servicio de PostgreSQL
brew services start postgresql@15

# Verificar que PostgreSQL esté corriendo
brew services list | grep postgresql
```

#### Paso 2: Crear la base de datos

```bash
# Conectarse a PostgreSQL
psql postgres

# Crear la base de datos
CREATE DATABASE api_productos;

# Crear usuario (opcional, si no usas el usuario por defecto)
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE api_productos TO postgres;

# Salir de psql
\q
```

#### Paso 3: Continuar con los pasos 1-3 y 5-6 de la Opción 1

Sigue los mismos pasos de instalación, configuración de `.env`, generación de Prisma y inicio del servidor.

---

## 📁 Estructura del Proyecto

```
remedial-ipg-backend-ciclo-7/
│
├── .github/                    # Configuración de GitHub Actions (CI/CD)
│   └── workflows/
│       ├── ci.yml             # Pipeline de integración continua
│       ├── lint.yml           # Verificación de linting
│       └── test.yml           # Ejecución de tests
│
├── .husky/                     # Git hooks (pre-commit, pre-push)
│   ├── pre-commit             # Ejecuta lint-staged antes de commit
│   └── pre-push               # Ejecuta tests antes de push
│
├── documentation/              # Documentación adicional del proyecto
│   ├── SETUP.md               # Guía detallada de instalación
│   ├── DATABASE.md            # Modelos y schema de BD
│   ├── DOCKER.md              # Referencia de comandos Docker
│   └── ERRORS.md              # Solución de problemas comunes
│
├── prisma/                     # Configuración de Prisma ORM
│   ├── migrations/            # Migraciones de base de datos
│   │   └── 20251114001803_api_products/
│   │       └── migration.sql  # SQL de la migración inicial
│   ├── schema.prisma          # Esquema de la base de datos
│   └── seed.ts                # Datos iniciales (seeders)
│
├── src/                        # Código fuente de la aplicación
│   │
│   ├── controllers/           # Controladores HTTP (manejo de requests)
│   │   ├── auth.ts           # Controlador de autenticación
│   │   └── product.ts        # Controlador de productos
│   │
│   ├── middleware/            # Middlewares personalizados
│   │   └── auth.ts           # Middleware de autenticación y autorización
│   │
│   ├── models/                # Modelos y tipos TypeScript
│   │   ├── business/         # Modelos de dominio/negocio
│   │   │   ├── auth.ts      # Interfaces de autenticación
│   │   │   └── product.ts   # Interfaces de productos
│   │   ├── config.ts         # Interfaz de configuración
│   │   └── status_code.ts    # Códigos de estado HTTP
│   │
│   ├── routes/                # Definición de rutas
│   │   ├── index.ts          # Router principal (carga dinámica)
│   │   ├── auth.ts           # Rutas de autenticación
│   │   └── products.ts       # Rutas de productos
│   │
│   ├── services/              # Lógica de negocio (business logic)
│   │   ├── auth.ts           # Servicio de autenticación
│   │   └── product.ts        # Servicio de productos
│   │
│   ├── tools/                 # Herramientas y utilidades
│   │   ├── health.ts         # Health check endpoint
│   │   └── swagger.ts        # Configuración de Swagger
│   │
│   ├── utils/                 # Utilidades generales
│   │   ├── jwt.ts            # Funciones para JWT
│   │   ├── password.ts       # Hash y validación de contraseñas
│   │   └── prisma.ts         # Cliente Prisma singleton
│   │
│   ├── app.ts                 # Configuración de Express
│   ├── config.ts              # Configuración de la aplicación
│   └── server.ts              # Punto de entrada del servidor
│
├── test/                       # Tests unitarios e integración
│   ├── __mocks__/             # Mocks para testing
│   ├── controllers/           # Tests de controladores
│   ├── middleware/            # Tests de middlewares
│   ├── services/              # Tests de servicios
│   └── utils/                 # Tests de utilidades
│
├── .env                        # Variables de entorno (NO commitear)
├── .env.example                # Ejemplo de variables de entorno
├── .eslintrc.js                # Configuración de ESLint
├── .gitignore                  # Archivos ignorados por Git
├── .nvmrc                      # Versión de Node.js
├── docker-compose.yml          # Configuración de Docker Compose
├── jest.config.js              # Configuración de Jest
├── package.json                # Dependencias y scripts
├── postman_collection.json     # Colección de Postman
├── README.md                   # Este archivo
└── tsconfig.json               # Configuración de TypeScript
```

### Arquitectura de Capas

El proyecto sigue una arquitectura en capas:

1. **Routes** → Definen los endpoints y conectan con los controladores
2. **Controllers** → Manejan las peticiones HTTP y las respuestas
3. **Services** → Contienen la lógica de negocio
4. **Prisma (ORM)** → Interactúa con la base de datos
5. **Models** → Definen las interfaces y tipos TypeScript

---

## 🗄️ Modelos de Base de Datos

### Diagrama Entidad-Relación

```
┌─────────────────┐                    ┌─────────────────┐
│      User       │                    │    Product      │
├─────────────────┤                    ├─────────────────┤
│ id (PK)         │◄───────────────────│ userId (FK)     │
│ email (unique)  │       1:N          │ id (PK)         │
│ password        │                    │ name            │
│ firstName       │                    │ description     │
│ lastName        │                    │ price           │
│ role (enum)     │                    │ stock           │
│ isActive        │                    │ category        │
│ createdAt       │                    │ image           │
│ updatedAt       │                    │ isActive        │
└─────────────────┘                    │ createdAt       │
                                       │ updatedAt       │
                                       └─────────────────┘

┌─────────────────┐
│   Role (Enum)   │
├─────────────────┤
│ USER            │
│ ADMIN           │
│ MODERATOR       │
└─────────────────┘
```

### User (Usuario)

Almacena la información de los usuarios del sistema.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Identificador único | Primary Key |
| `email` | String | Correo electrónico | Unique, Required |
| `password` | String | Contraseña hasheada | Required |
| `firstName` | String | Nombre | Required |
| `lastName` | String | Apellido | Optional |
| `role` | Enum (Role) | Rol del usuario | Default: USER |
| `isActive` | Boolean | Estado del usuario | Default: true |
| `createdAt` | DateTime | Fecha de creación | Auto-generated |
| `updatedAt` | DateTime | Última actualización | Auto-updated |
| `products` | Product[] | Productos creados | Relation |

### Product (Producto)

Almacena la información de los productos.

| Campo | Tipo | Descripción | Constraints |
|-------|------|-------------|-------------|
| `id` | String (UUID) | Identificador único | Primary Key |
| `name` | String | Nombre del producto | Required |
| `description` | String | Descripción | Optional |
| `price` | Float | Precio | Required |
| `stock` | Integer | Cantidad en stock | Default: 0 |
| `category` | String | Categoría | Required, Indexed |
| `image` | String | URL de imagen | Optional |
| `isActive` | Boolean | Producto activo | Default: true |
| `userId` | String (UUID) | ID del creador | Foreign Key, Indexed |
| `user` | User | Usuario creador | Relation |
| `createdAt` | DateTime | Fecha de creación | Auto-generated |
| `updatedAt` | DateTime | Última actualización | Auto-updated |

### Role (Enumeración)

Roles disponibles en el sistema:

- **USER**: Usuario estándar (puede crear y gestionar sus propios productos)
- **ADMIN**: Administrador (control total sobre todos los productos)
- **MODERATOR**: Moderador (permisos extendidos, configurables)

### Índices

- `users.email` - Índice único para búsquedas rápidas por email
- `products.category` - Índice para filtrado por categoría
- `products.userId` - Índice para búsquedas por usuario

### Relaciones

- **User → Product**: Un usuario puede tener muchos productos (1:N)
- **Cascade Delete**: Si se elimina un usuario, se eliminan todos sus productos

> 📘 Para más detalles sobre el schema, consulta [documentation/DATABASE.md](./documentation/DATABASE.md)

---

## 🔐 Autenticación y Autorización

### Sistema de Autenticación JWT

La API utiliza **JSON Web Tokens (JWT)** para autenticación stateless.

#### Flujo de Autenticación

```
┌─────────┐                                          ┌─────────┐
│ Cliente │                                          │   API   │
└────┬────┘                                          └────┬────┘
     │                                                    │
     │  1. POST /api/v1/auth/register                    │
     │  { email, password, firstName, lastName }         │
     ├──────────────────────────────────────────────────►│
     │                                                    │
     │  2. Hashea password, crea user en BD              │
     │     Genera JWT token                              │
     │◄──────────────────────────────────────────────────┤
     │  { token, user }                                  │
     │                                                    │
     │  3. POST /api/v1/auth/login                       │
     │  { email, password }                              │
     ├──────────────────────────────────────────────────►│
     │                                                    │
     │  4. Valida credenciales, genera JWT               │
     │◄──────────────────────────────────────────────────┤
     │  { token, user }                                  │
     │                                                    │
     │  5. GET /api/v1/products                          │
     │  Header: Authorization: Bearer <token>            │
     ├──────────────────────────────────────────────────►│
     │                                                    │
     │  6. Verifica JWT, extrae userId y role            │
     │     Ejecuta lógica de negocio                     │
     │◄──────────────────────────────────────────────────┤
     │  { products }                                     │
     │                                                    │
```

#### Estructura del Token JWT

```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "usuario@ejemplo.com",
  "role": "USER",
  "iat": 1699564800,
  "exp": 1700169600
}
```

#### Headers de Autenticación

Para endpoints protegidos, incluye el token en el header:

```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Autorización Basada en Roles (RBAC)

| Acción | USER | MODERATOR | ADMIN |
|--------|:----:|:---------:|:-----:|
| Registrarse | ✅ | ✅ | ✅ |
| Iniciar sesión | ✅ | ✅ | ✅ |
| Ver productos | ✅ | ✅ | ✅ |
| Crear producto | ✅ | ✅ | ✅ |
| Editar propio producto | ✅ | ✅ | ✅ |
| Eliminar propio producto | ✅ | ✅ | ✅ |
| Editar producto de otro | ❌ | ❌ | ✅ |
| Eliminar producto de otro | ❌ | ❌ | ✅ |
| Eliminar permanentemente | ❌ | ❌ | ✅ |

### Middlewares de Seguridad

1. **authenticate**: Valida el JWT y extrae información del usuario
2. **authorize([roles])**: Verifica que el usuario tenga uno de los roles permitidos

#### Ejemplo de uso en rutas

```typescript
// Ruta protegida - requiere autenticación
router.get('/profile', authenticate, getProfile);

// Ruta protegida - requiere rol ADMIN
router.delete(
  '/products/:id/permanent',
  authenticate,
  authorize([Role.ADMIN]),
  permanentlyDeleteProduct
);
```

---

## 📚 Documentación de API

### Swagger UI (Recomendado)

La forma más fácil de explorar y probar la API es usando Swagger UI.

1. **Inicia el servidor**:
   ```bash
   npm run dev
   ```

2. **Abre tu navegador** en:
   ```
   http://localhost:3000/api-docs
   ```

3. **Autenticación en Swagger**:
   - Haz clic en el botón **"Authorize"** (🔓)
   - Ingresa: `Bearer <tu_token_jwt>`
   - Haz clic en "Authorize"

### Colección de Postman

También incluimos una colección de Postman con todos los endpoints.

1. **Importar la colección**:
   - Abre Postman
   - Importa el archivo `postman_collection.json` ubicado en la raíz del proyecto

2. **Configurar environment**:
   - Crea un nuevo environment en Postman
   - Agrega las variables:
     ```
     base_url: http://localhost:3000
     token: (se auto-completará al hacer login)
     ```

3. **Uso**:
   - Ejecuta primero `POST Register` o `POST Login`
   - El token se guardará automáticamente
   - Los demás endpoints usarán el token automáticamente

### Endpoints Principales

#### Autenticación

```http
POST   /api/v1/auth/register      # Registrar nuevo usuario
POST   /api/v1/auth/login         # Iniciar sesión
GET    /api/v1/auth/profile       # Obtener perfil (requiere auth)
```

#### Productos

```http
GET    /api/v1/products           # Listar todos los productos
GET    /api/v1/products/:id       # Obtener un producto por ID
POST   /api/v1/products           # Crear producto (requiere auth)
PUT    /api/v1/products/:id       # Actualizar producto (requiere auth)
DELETE /api/v1/products/:id       # Eliminar producto - soft delete (requiere auth)
DELETE /api/v1/products/:id/permanent  # Eliminar permanentemente (requiere ADMIN)
```

#### Health Check

```http
GET    /health                    # Estado del servidor y BD
```

### Ejemplos de Uso

#### 1. Registrar un usuario

```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario@ejemplo.com",
    "password": "Password123!",
    "firstName": "Juan",
    "lastName": "Pérez"
  }'
```

**Respuesta:**

```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "usuario@ejemplo.com",
      "firstName": "Juan",
      "lastName": "Pérez",
      "role": "USER",
      "isActive": true
    }
  }
}
```

#### 2. Crear un producto

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <tu_token>" \
  -d '{
    "name": "Laptop HP Pavilion",
    "description": "Laptop de 15.6 pulgadas, 16GB RAM",
    "price": 899.99,
    "stock": 10,
    "category": "Electrónica",
    "image": "https://ejemplo.com/imagen.jpg"
  }'
```

#### 3. Filtrar productos

```bash
# Por categoría
curl "http://localhost:3000/api/v1/products?category=Electrónica"

# Por rango de precios
curl "http://localhost:3000/api/v1/products?minPrice=100&maxPrice=1000"

# Combinar filtros
curl "http://localhost:3000/api/v1/products?category=Electrónica&minPrice=500&isActive=true"
```

---

## 🛠️ Comandos Útiles

### NPM Scripts

```bash
# Desarrollo
npm run dev              # Inicia servidor en modo desarrollo (hot-reload)

# Construcción
npm run build            # Compila TypeScript a JavaScript
npm start                # Ejecuta el servidor desde ./dist (producción)

# Calidad de Código
npm run lint             # Ejecuta ESLint para verificar código
npm run lint:fix         # Ejecuta ESLint y corrige errores automáticamente

# Testing
npm test                 # Ejecuta todos los tests
npm run test:coverage    # Ejecuta tests con reporte de cobertura
npm run test:coveralls   # Genera reporte para Coveralls

# Prisma
npm run prisma:generate  # Genera Prisma Client
npm run prisma:migrate   # Ejecuta migraciones pendientes
npm run prisma:studio    # Abre Prisma Studio (GUI de BD)
npm run prisma:seed      # Ejecuta seeders (datos iniciales)
```

### Comandos de Docker

```bash
# Iniciar servicios
docker-compose up -d                    # Inicia PostgreSQL y PgAdmin en background

# Detener servicios
docker-compose down                     # Detiene y elimina contenedores
docker-compose down -v                  # Detiene y elimina contenedores + volúmenes

# Ver logs
docker-compose logs                     # Ver logs de todos los servicios
docker-compose logs -f postgres         # Ver logs de PostgreSQL en tiempo real

# Estado de contenedores
docker-compose ps                       # Lista contenedores activos

# Reiniciar servicios
docker-compose restart                  # Reinicia todos los servicios
docker-compose restart postgres         # Reinicia solo PostgreSQL

# Ejecutar comandos dentro del contenedor
docker-compose exec postgres psql -U postgres -d api_productos

# Limpiar todo (¡CUIDADO! Elimina datos)
docker-compose down -v --remove-orphans
```

### Comandos de Prisma

```bash
# Generar Prisma Client (después de cambios en schema.prisma)
npx prisma generate

# Crear una nueva migración
npx prisma migrate dev --name nombre_de_la_migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear la base de datos (¡CUIDADO! Elimina todos los datos)
npx prisma migrate reset

# Abrir Prisma Studio (GUI para ver/editar datos)
npx prisma studio

# Ver estado de migraciones
npx prisma migrate status

# Formatear schema.prisma
npx prisma format

# Validar schema.prisma
npx prisma validate
```

### Comandos de PostgreSQL

```bash
# Conectarse a PostgreSQL (Docker)
docker-compose exec postgres psql -U postgres -d api_productos

# Conectarse a PostgreSQL (local)
psql -U postgres -d api_productos

# Comandos dentro de psql
\dt                    # Listar tablas
\d users               # Describir tabla 'users'
\l                     # Listar bases de datos
\q                     # Salir de psql

# Backup de base de datos
docker-compose exec postgres pg_dump -U postgres api_productos > backup.sql

# Restaurar backup
docker-compose exec -T postgres psql -U postgres api_productos < backup.sql
```

---

## 🔧 Solución de Problemas

### Error: No se puede conectar a PostgreSQL

**Síntoma:**
```
Error: Can't reach database server at localhost:5432
```

**Soluciones:**

1. **Verificar que PostgreSQL esté corriendo**:
   ```bash
   # Docker
   docker-compose ps

   # Si no está corriendo
   docker-compose up -d

   # Homebrew (macOS)
   brew services list | grep postgresql

   # Si no está corriendo
   brew services start postgresql@15
   ```

2. **Verificar el DATABASE_URL en .env**:
   ```env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"
   ```

3. **Verificar que el puerto 5432 no esté ocupado**:
   ```bash
   lsof -i :5432
   ```

---

### Error: Prisma Client no inicializado

**Síntoma:**
```
Error: @prisma/client did not initialize yet
```

**Solución:**
```bash
# Genera el Prisma Client
npx prisma generate

# Reinicia el servidor
npm run dev
```

---

### Error: Token JWT inválido o expirado

**Síntoma:**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Soluciones:**

1. **Obtén un nuevo token** haciendo login nuevamente
2. **Verifica que el header esté correcto**:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
   (Nota el espacio después de "Bearer")

3. **Verifica que JWT_SECRET sea el mismo** en `.env`

---

### Error: Puerto 3000 ya está en uso

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Soluciones:**

1. **Encuentra el proceso usando el puerto**:
   ```bash
   lsof -i :3000
   ```

2. **Mata el proceso**:
   ```bash
   kill -9 <PID>
   ```

3. **O cambia el puerto en .env**:
   ```env
   PORT=3001
   ```

---

### Error: Migraciones pendientes

**Síntoma:**
```
Error: There are pending migrations
```

**Solución:**
```bash
# Aplicar migraciones pendientes
npm run prisma:migrate
```

---

### Error: Tests fallan con "Cannot find module"

**Solución:**
```bash
# Limpia cache de Jest
npm test -- --clearCache

# Reinstala dependencias
rm -rf node_modules package-lock.json
npm install
```

---

### Error: ESLint falla en pre-commit

**Síntoma:**
```
✖ npm run lint:
  (código con errores de linting)
```

**Solución:**
```bash
# Corrige automáticamente los errores
npm run lint:fix

# Luego intenta el commit nuevamente
git add .
git commit -m "tu mensaje"
```

> 📘 Para más soluciones, consulta [documentation/ERRORS.md](./documentation/ERRORS.md)

---

## 🧪 Testing

### Ejecutar Tests

```bash
# Todos los tests
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch (se re-ejecutan al cambiar archivos)
npm test -- --watch

# Tests de un archivo específico
npm test -- auth.spec.ts

# Tests con mayor detalle
npm test -- --verbose
```

### Cobertura de Tests

El proyecto mantiene una cobertura de tests superior al **80%**.

```bash
# Generar reporte de cobertura
npm run test:coverage

# Ver reporte en el navegador
open coverage/lcov-report/index.html
```

### Estructura de Tests

```
test/
├── __mocks__/              # Mocks compartidos
│   └── prisma.ts          # Mock de Prisma Client
├── controllers/            # Tests de controladores
│   ├── auth.spec.ts
│   └── product.spec.ts
├── middleware/             # Tests de middlewares
│   └── auth.spec.ts
├── services/               # Tests de servicios
│   ├── auth.spec.ts
│   └── product.spec.ts
└── utils/                  # Tests de utilidades
    ├── jwt.spec.ts
    └── password.spec.ts
```

---

## 🔐 Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
# ======================
# CONFIGURACIÓN DEL SERVIDOR
# ======================
PORT=3000
NODE_ENV=development

# ======================
# BASE DE DATOS POSTGRESQL
# ======================
# Formato: postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_bd]?schema=[schema]
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"

# ======================
# JWT (JSON WEB TOKENS)
# ======================
# Clave secreta para firmar tokens (¡CAMBIAR EN PRODUCCIÓN!)
JWT_SECRET=mi_clave_secreta_super_segura_cambiar_en_produccion_2024

# Tiempo de expiración del token (ejemplos: 1h, 7d, 30d)
JWT_EXPIRE=7d

# ======================
# CORS
# ======================
# Orígenes permitidos (separados por comas)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Descripción de Variables

| Variable | Descripción | Valor por defecto | Requerido |
|----------|-------------|-------------------|-----------|
| `PORT` | Puerto donde corre el servidor | `3000` | No |
| `NODE_ENV` | Entorno de ejecución | `development` | No |
| `DATABASE_URL` | URL de conexión a PostgreSQL | - | **Sí** |
| `JWT_SECRET` | Clave secreta para JWT | - | **Sí** |
| `JWT_EXPIRE` | Tiempo de expiración de tokens | `7d` | No |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS | - | No |

### Notas de Seguridad

✅ En producción:
- Usa un `JWT_SECRET` largo y aleatorio
- Configura `NODE_ENV=production`
- Usa HTTPS
- Configura `ALLOWED_ORIGINS` con los dominios específicos

---

## 📖 Documentación Adicional

Para información más detallada, consulta los siguientes documentos:

- **[SETUP.md](./documentation/SETUP.md)** - Guía detallada de instalación y configuración
- **[DATABASE.md](./documentation/DATABASE.md)** - Modelos, relaciones y queries de la base de datos
- **[DOCKER.md](./documentation/DOCKER.md)** - Comandos y configuración de Docker
- **[ERRORS.md](./documentation/ERRORS.md)** - Solución de problemas comunes y debugging
