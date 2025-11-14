# Documentación de Base de Datos

Documentación completa del schema de base de datos, modelos, relaciones y queries.

---

## 📋 Tabla de Contenidos

- [Diagrama Entidad-Relación](#diagrama-entidad-relación)
- [Modelos](#modelos)
  - [User (Usuario)](#user-usuario)
  - [Product (Producto)](#product-producto)
  - [Role (Enumeración)](#role-enumeración)
- [Relaciones](#relaciones)
- [Índices y Optimizaciones](#índices-y-optimizaciones)
- [Migraciones](#migraciones)
- [Queries Comunes](#queries-comunes)
- [Seeders](#seeders)

---

## 🗺️ Diagrama Entidad-Relación

```
┌─────────────────────────────────┐                    ┌─────────────────────────────────┐
│            User                 │                    │           Product               │
├─────────────────────────────────┤                    ├─────────────────────────────────┤
│ id:          String (PK, UUID)  │◄───────────────────│ userId:      String (FK, UUID)  │
│ email:       String (Unique)    │       1:N          │ id:          String (PK, UUID)  │
│ password:    String             │                    │ name:        String             │
│ firstName:   String             │                    │ description: String?            │
│ lastName:    String?            │                    │ price:       Float              │
│ role:        Role (Enum)        │                    │ stock:       Integer            │
│ isActive:    Boolean            │                    │ category:    String (Indexed)   │
│ createdAt:   DateTime           │                    │ image:       String?            │
│ updatedAt:   DateTime           │                    │ isActive:    Boolean            │
│ products:    Product[]          │                    │ user:        User               │
└─────────────────────────────────┘                    │ createdAt:   DateTime           │
                                                       │ updatedAt:   DateTime           │
┌─────────────────────────────────┐                    └─────────────────────────────────┘
│        Role (Enum)              │
├─────────────────────────────────┤
│ USER                            │
│ ADMIN                           │
│ MODERATOR                       │
└─────────────────────────────────┘
```

---

## 📊 Modelos

### User (Usuario)

Almacena la información de los usuarios del sistema con autenticación y autorización.

#### Schema Prisma

```prisma
model User {
  id        String    @id(map: "usuarios_pkey") @default(uuid())
  email     String    @unique(map: "usuarios_email_key")
  password  String
  firstName String
  lastName  String?
  role      Role      @default(USER)
  isActive  Boolean   @default(true)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  products  Product[]

  @@map("users")
}
```

#### Estructura de la Tabla

| Campo | Tipo | Descripción | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | VARCHAR (UUID) | Identificador único del usuario | PRIMARY KEY | `uuid()` |
| `email` | VARCHAR | Correo electrónico | UNIQUE, NOT NULL | - |
| `password` | VARCHAR | Contraseña hasheada con bcrypt | NOT NULL | - |
| `firstName` | VARCHAR | Nombre del usuario | NOT NULL | - |
| `lastName` | VARCHAR | Apellido del usuario | NULLABLE | `NULL` |
| `role` | ENUM (Role) | Rol del usuario (USER, ADMIN, MODERATOR) | NOT NULL | `USER` |
| `isActive` | BOOLEAN | Estado del usuario (activo/inactivo) | NOT NULL | `true` |
| `createdAt` | TIMESTAMP | Fecha y hora de creación | NOT NULL | `now()` |
| `updatedAt` | TIMESTAMP | Fecha y hora de última actualización | NOT NULL | Auto-update |
| `products` | Relation | Productos creados por el usuario | - | - |

#### Índices

- **PRIMARY KEY**: `id`
- **UNIQUE**: `email` (permite búsquedas rápidas y previene duplicados)

#### Validaciones de Negocio

- Email debe ser válido (formato email)
- Password debe tener al menos 6 caracteres (hasheado con bcrypt, 10 rounds)
- firstName no puede estar vacío
- Role debe ser uno de: USER, ADMIN, MODERATOR

#### Ejemplo de Datos

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "juan.perez@ejemplo.com",
  "password": "$2b$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "USER",
  "isActive": true,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Product (Producto)

Almacena la información de los productos del catálogo.

#### Schema Prisma

```prisma
model Product {
  id          String   @id(map: "productos_pkey") @default(uuid())
  name        String
  description String?
  price       Float
  stock       Int      @default(0)
  category    String
  image       String?
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade, map: "productos_usuarioId_fkey")

  @@index([category], map: "productos_categoria_idx")
  @@index([userId], map: "productos_usuarioId_idx")
  @@map("products")
}
```

#### Estructura de la Tabla

| Campo | Tipo | Descripción | Constraints | Default |
|-------|------|-------------|-------------|---------|
| `id` | VARCHAR (UUID) | Identificador único del producto | PRIMARY KEY | `uuid()` |
| `name` | VARCHAR | Nombre del producto | NOT NULL | - |
| `description` | TEXT | Descripción detallada | NULLABLE | `NULL` |
| `price` | DECIMAL | Precio del producto | NOT NULL, >= 0 | - |
| `stock` | INTEGER | Cantidad disponible | NOT NULL, >= 0 | `0` |
| `category` | VARCHAR | Categoría del producto | NOT NULL, INDEXED | - |
| `image` | VARCHAR (URL) | URL de la imagen | NULLABLE | `NULL` |
| `isActive` | BOOLEAN | Producto activo (soft delete) | NOT NULL | `true` |
| `userId` | VARCHAR (UUID) | ID del usuario creador | FOREIGN KEY, INDEXED | - |
| `user` | Relation | Usuario que creó el producto | - | - |
| `createdAt` | TIMESTAMP | Fecha de creación | NOT NULL | `now()` |
| `updatedAt` | TIMESTAMP | Fecha de última actualización | NOT NULL | Auto-update |

#### Índices

- **PRIMARY KEY**: `id`
- **INDEX**: `category` (acelera filtrado por categoría)
- **INDEX**: `userId` (acelera búsqueda de productos por usuario)
- **FOREIGN KEY**: `userId` → `users.id` (ON DELETE CASCADE)

#### Validaciones de Negocio

- name no puede estar vacío
- price debe ser mayor o igual a 0
- stock debe ser mayor o igual a 0
- category no puede estar vacío
- image debe ser una URL válida (si se proporciona)

#### Ejemplo de Datos

```json
{
  "id": "660e8400-e29b-41d4-a716-446655440000",
  "name": "Laptop HP Pavilion",
  "description": "Laptop HP Pavilion de 15.6 pulgadas, Intel Core i5, 16GB RAM, 512GB SSD",
  "price": 899.99,
  "stock": 10,
  "category": "Electrónica",
  "image": "https://ejemplo.com/images/laptop-hp-pavilion.jpg",
  "isActive": true,
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

---

### Role (Enumeración)

Define los roles disponibles para usuarios en el sistema.

#### Schema Prisma

```prisma
enum Role {
  USER
  ADMIN
  MODERATOR
}
```

#### Valores y Permisos

| Rol | Valor | Descripción | Permisos |
|-----|-------|-------------|----------|
| **USER** | `USER` | Usuario estándar | Crear productos, editar/eliminar propios productos |
| **ADMIN** | `ADMIN` | Administrador | Control total sobre todos los productos y usuarios |
| **MODERATOR** | `MODERATOR` | Moderador | Permisos extendidos (configurables según necesidad) |

#### Matriz de Permisos

| Acción | USER | MODERATOR | ADMIN |
|--------|:----:|:---------:|:-----:|
| Registrarse | ✅ | ✅ | ✅ |
| Ver productos (públicos) | ✅ | ✅ | ✅ |
| Crear producto | ✅ | ✅ | ✅ |
| Editar propio producto | ✅ | ✅ | ✅ |
| Eliminar propio producto | ✅ | ✅ | ✅ |
| Editar producto de otro | ❌ | ❌ | ✅ |
| Eliminar producto de otro | ❌ | ❌ | ✅ |
| Eliminar permanentemente | ❌ | ❌ | ✅ |
| Ver perfil propio | ✅ | ✅ | ✅ |

---

## 🔗 Relaciones

### User → Product (1:N)

Un usuario puede crear muchos productos, pero cada producto pertenece a un solo usuario.

#### Definición en Prisma

```prisma
// En el modelo User
products  Product[]  // Relación 1:N

// En el modelo Product
userId    String
user      User @relation(fields: [userId], references: [id], onDelete: Cascade)
```

#### Comportamiento de Cascade Delete

```
Si se elimina un User:
  ├─ Se eliminan TODOS sus Products automáticamente
  └─ Esto previene productos huérfanos en la BD
```

#### Ejemplo de Query

```typescript
// Obtener usuario con todos sus productos
const userWithProducts = await prisma.user.findUnique({
  where: { id: userId },
  include: { products: true }
});

// Obtener producto con información del usuario
const productWithUser = await prisma.product.findUnique({
  where: { id: productId },
  include: { user: true }
});
```

---

## ⚡ Índices y Optimizaciones

### Índices Existentes

| Tabla | Campo | Tipo | Propósito |
|-------|-------|------|-----------|
| `users` | `id` | PRIMARY KEY | Identificación única |
| `users` | `email` | UNIQUE INDEX | Login rápido y prevención de duplicados |
| `products` | `id` | PRIMARY KEY | Identificación única |
| `products` | `category` | INDEX | Filtrado eficiente por categoría |
| `products` | `userId` | INDEX | Búsqueda de productos por usuario |

### Queries Optimizadas

#### ✅ Query Eficiente (usa índice)

```sql
-- Filtrar por categoría (usa índice productos_categoria_idx)
SELECT * FROM products WHERE category = 'Electrónica';

-- Buscar por email (usa índice usuarios_email_key)
SELECT * FROM users WHERE email = 'usuario@ejemplo.com';
```

#### ❌ Query No Optimizada (sin índice)

```sql
-- Filtrar por descripción (no hay índice, full table scan)
SELECT * FROM products WHERE description LIKE '%laptop%';

-- Buscar por nombre (no hay índice, full table scan)
SELECT * FROM users WHERE firstName = 'Juan';
```

### Recomendaciones de Optimización

Si el catálogo crece significativamente (>10,000 productos), considera:

1. **Índice en `price`** para rangos de precios:
   ```prisma
   @@index([price])
   ```

2. **Índice compuesto** para filtros comunes:
   ```prisma
   @@index([category, isActive])
   ```

3. **Full-text search** en `name` y `description`:
   ```prisma
   @@index([name(ops: raw("gin_trgm_ops"))], type: Gin)
   ```

---

## 🔄 Migraciones

### Migración Inicial

Archivo: `prisma/migrations/20251114001803_api_products/migration.sql`

```sql
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "usuarios_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT NOT NULL,
    "image" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    CONSTRAINT "productos_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "usuarios_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "productos_categoria_idx" ON "products"("category");

-- CreateIndex
CREATE INDEX "productos_usuarioId_idx" ON "products"("userId");

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "productos_usuarioId_fkey"
    FOREIGN KEY ("userId") REFERENCES "users"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
```

### Comandos de Migración

```bash
# Ver estado de migraciones
npx prisma migrate status

# Crear nueva migración
npx prisma migrate dev --name descripcion_del_cambio

# Aplicar migraciones en producción
npx prisma migrate deploy

# Resetear BD (¡CUIDADO! Elimina todos los datos)
npx prisma migrate reset
```

---

## 🔍 Queries Comunes

### Usuarios

#### Crear Usuario

```typescript
const newUser = await prisma.user.create({
  data: {
    email: "usuario@ejemplo.com",
    password: hashedPassword, // Previamente hasheado
    firstName: "Juan",
    lastName: "Pérez",
    role: "USER"
  }
});
```

#### Buscar Usuario por Email

```typescript
const user = await prisma.user.findUnique({
  where: { email: "usuario@ejemplo.com" }
});
```

#### Obtener Usuario con sus Productos

```typescript
const userWithProducts = await prisma.user.findUnique({
  where: { id: userId },
  include: {
    products: {
      where: { isActive: true },
      orderBy: { createdAt: 'desc' }
    }
  }
});
```

#### Actualizar Perfil

```typescript
const updatedUser = await prisma.user.update({
  where: { id: userId },
  data: {
    firstName: "Juan Carlos",
    lastName: "Pérez García"
  }
});
```

### Productos

#### Crear Producto

```typescript
const newProduct = await prisma.product.create({
  data: {
    name: "Laptop HP",
    description: "Laptop HP Pavilion 15.6",
    price: 899.99,
    stock: 10,
    category: "Electrónica",
    image: "https://ejemplo.com/imagen.jpg",
    userId: userId
  }
});
```

#### Listar Todos los Productos

```typescript
const products = await prisma.product.findMany({
  where: { isActive: true },
  include: {
    user: {
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true
      }
    }
  },
  orderBy: { createdAt: 'desc' }
});
```

#### Filtrar Productos por Categoría

```typescript
const products = await prisma.product.findMany({
  where: {
    category: "Electrónica",
    isActive: true
  }
});
```

#### Filtrar por Rango de Precios

```typescript
const products = await prisma.product.findMany({
  where: {
    price: {
      gte: 100,  // Mayor o igual a 100
      lte: 1000  // Menor o igual a 1000
    },
    isActive: true
  }
});
```

#### Actualizar Producto

```typescript
const updatedProduct = await prisma.product.update({
  where: { id: productId },
  data: {
    price: 799.99,
    stock: 15
  }
});
```

#### Soft Delete (marcar como inactivo)

```typescript
const deletedProduct = await prisma.product.update({
  where: { id: productId },
  data: { isActive: false }
});
```

#### Hard Delete (eliminar permanentemente)

```typescript
const deletedProduct = await prisma.product.delete({
  where: { id: productId }
});
```

### Queries Avanzadas

#### Buscar Productos con Filtros Múltiples

```typescript
const products = await prisma.product.findMany({
  where: {
    AND: [
      { category: "Electrónica" },
      { price: { gte: 500, lte: 1500 } },
      { isActive: true },
      { stock: { gt: 0 } }
    ]
  },
  include: { user: true },
  orderBy: { price: 'asc' },
  take: 10,
  skip: 0
});
```

#### Contar Productos por Categoría

```typescript
const productCount = await prisma.product.groupBy({
  by: ['category'],
  _count: {
    id: true
  },
  where: {
    isActive: true
  }
});
```

#### Obtener Estadísticas de Productos

```typescript
const stats = await prisma.product.aggregate({
  _count: { id: true },
  _avg: { price: true },
  _sum: { stock: true },
  _min: { price: true },
  _max: { price: true },
  where: { isActive: true }
});
```

---

## 🌱 Seeders

### Archivo de Seed

Ubicación: `prisma/seed.ts`

```typescript
import { PrismaClient, Role } from '@prisma/client';
import { hashPassword } from '../src/utils/password';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Crear usuario admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@ejemplo.com' },
    update: {},
    create: {
      email: 'admin@ejemplo.com',
      password: await hashPassword('Admin123!'),
      firstName: 'Admin',
      lastName: 'Sistema',
      role: Role.ADMIN,
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Crear usuario regular
  const user = await prisma.user.upsert({
    where: { email: 'usuario@ejemplo.com' },
    update: {},
    create: {
      email: 'usuario@ejemplo.com',
      password: await hashPassword('User123!'),
      firstName: 'Usuario',
      lastName: 'Demo',
      role: Role.USER,
    },
  });

  console.log('✅ Regular user created:', user.email);

  // Crear productos de ejemplo
  const products = [
    {
      name: 'Laptop HP Pavilion',
      description: 'Laptop HP Pavilion 15.6" Intel Core i5, 16GB RAM, 512GB SSD',
      price: 899.99,
      stock: 10,
      category: 'Electrónica',
      userId: user.id,
    },
    {
      name: 'Mouse Logitech MX Master',
      description: 'Mouse inalámbrico ergonómico con precisión alta',
      price: 99.99,
      stock: 25,
      category: 'Accesorios',
      userId: user.id,
    },
    // Agregar más productos según necesites
  ];

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`✅ Created ${products.length} products`);
  console.log('🎉 Seed completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
```

### Ejecutar Seed

```bash
# Ejecutar seed
npm run prisma:seed

# O directamente con Node
npx ts-node prisma/seed.ts
```

---

## 📚 Recursos Adicionales

- [Prisma Documentation](https://www.prisma.io/docs/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)

---

**¿Necesitas ayuda con queries o migraciones?** Revisa la [guía de setup](./SETUP.md) o la [solución de problemas](./ERRORS.md).
