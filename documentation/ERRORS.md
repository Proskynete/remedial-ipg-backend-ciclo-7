# Guía de Solución de Problemas

Guía completa para resolver errores comunes durante el desarrollo y despliegue.

---

## 📋 Tabla de Contenidos

- [Errores de Instalación](#errores-de-instalación)
- [Errores de Base de Datos](#errores-de-base-de-datos)
- [Errores de Prisma](#errores-de-prisma)
- [Errores de Autenticación](#errores-de-autenticación)
- [Errores de Docker](#errores-de-docker)
- [Errores de Compilación](#errores-de-compilación)
- [Errores de Testing](#errores-de-testing)
- [Errores de Producción](#errores-de-producción)
- [Debugging](#debugging)

---

## 📦 Errores de Instalación

### Error: Cannot find module 'X'

**Síntoma:**
```
Error: Cannot find module '@prisma/client'
Error: Cannot find module 'express'
```

**Causas:**
- Dependencias no instaladas
- node_modules corrupto
- package-lock.json desactualizado

**Soluciones:**

```bash
# Solución 1: Reinstalar dependencias
npm install

# Solución 2: Limpiar caché y reinstalar
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Solución 3: Verificar versión de Node.js
node --version  # Debe ser v16 o superior
nvm use 16     # Si usas nvm
```

---

### Error: EACCES permission denied

**Síntoma:**
```
npm ERR! Error: EACCES: permission denied, access '/usr/local/lib/node_modules'
```

**Causas:**
- Permisos insuficientes para instalar paquetes globales

**Soluciones:**

```bash
# Solución 1: Usar nvm (recomendado)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18

# Solución 2: Cambiar permisos (macOS/Linux)
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Solución 3: Usar --legacy-peer-deps
npm install --legacy-peer-deps
```

---

### Error: gyp ERR! (Windows)

**Síntoma:**
```
gyp ERR! find Python
gyp ERR! stack Error: Could not find any Visual Studio installation to use
```

**Causas:**
- Faltan herramientas de compilación en Windows

**Solución:**

```bash
# Instalar herramientas de compilación
npm install --global windows-build-tools

# O instalar manualmente:
# 1. Visual Studio Build Tools
# 2. Python 3.x
```

---

## 🗄️ Errores de Base de Datos

### Error: Can't reach database server at localhost:5432

**Síntoma:**
```
Error: Can't reach database server at `localhost:5432`
Please make sure your database server is running at `localhost:5432`.
```

**Causas:**
- PostgreSQL no está corriendo
- Puerto incorrecto
- Firewall bloqueando conexión

**Diagnóstico:**

```bash
# Verificar si PostgreSQL está corriendo
# Docker
docker-compose ps

# Homebrew (macOS)
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql

# Windows
sc query postgresql-x64-15
```

**Soluciones:**

```bash
# Solución 1: Iniciar PostgreSQL con Docker
docker-compose up -d postgres

# Solución 2: Iniciar PostgreSQL local (macOS)
brew services start postgresql@15

# Solución 3: Iniciar PostgreSQL local (Linux)
sudo systemctl start postgresql

# Solución 4: Verificar DATABASE_URL en .env
# Asegúrate que el formato sea:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"

# Solución 5: Probar conexión manualmente
psql postgresql://postgres:postgres@localhost:5432/api_productos
```

---

### Error: database "api_productos" does not exist

**Síntoma:**
```
Error: P1003: Database api_productos does not exist
```

**Causas:**
- Base de datos no creada

**Solución:**

```bash
# Con Docker
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE api_productos;"

# Con PostgreSQL local
psql -U postgres -c "CREATE DATABASE api_productos;"

# O con psql interactivo
psql -U postgres
CREATE DATABASE api_productos;
\q
```

---

### Error: password authentication failed

**Síntoma:**
```
Error: password authentication failed for user "postgres"
```

**Causas:**
- Contraseña incorrecta en DATABASE_URL
- Archivo pg_hba.conf con restricciones

**Soluciones:**

```bash
# Solución 1: Verificar DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:CONTRASEÑA_CORRECTA@localhost:5432/api_productos?schema=public"

# Solución 2: Resetear contraseña (PostgreSQL local)
sudo -u postgres psql
ALTER USER postgres WITH PASSWORD 'nueva_contraseña';
\q

# Solución 3: Con Docker, recrear contenedor
docker-compose down -v
docker-compose up -d
```

---

### Error: too many connections

**Síntoma:**
```
Error: too many connections for role "postgres"
```

**Causas:**
- Demasiadas conexiones abiertas
- Conexiones no cerradas correctamente

**Soluciones:**

```bash
# Ver conexiones activas
docker-compose exec postgres psql -U postgres -c "SELECT COUNT(*) FROM pg_stat_activity WHERE datname='api_productos';"

# Matar conexiones idle
docker-compose exec postgres psql -U postgres -c "
  SELECT pg_terminate_backend(pid)
  FROM pg_stat_activity
  WHERE datname = 'api_productos'
  AND pid <> pg_backend_pid()
  AND state = 'idle';
"

# Aumentar límite de conexiones (en docker-compose.yml)
services:
  postgres:
    command: postgres -c max_connections=200

# Reiniciar
docker-compose restart postgres
```

---

## 🔄 Errores de Prisma

### Error: Prisma Client is not generated

**Síntoma:**
```
PrismaClientInitializationError: Prisma Client did not initialize yet.
Please run "prisma generate" and try to import it again.
```

**Causas:**
- Prisma Client no generado después de instalar
- Schema modificado sin regenerar

**Solución:**

```bash
# Generar Prisma Client
npx prisma generate

# O usar el script npm
npm run prisma:generate

# Reiniciar servidor
npm run dev
```

---

### Error: Migration failed

**Síntoma:**
```
Error: P3006: Migration `20241114001803_api_products` failed to apply cleanly to a temporary database.
```

**Causas:**
- Conflicto en migraciones
- Schema inconsistente

**Soluciones:**

```bash
# Solución 1: Ver estado de migraciones
npx prisma migrate status

# Solución 2: Resetear base de datos (¡CUIDADO! Elimina datos)
npx prisma migrate reset

# Solución 3: Crear nueva migración
npx prisma migrate dev --name fix_migration

# Solución 4: Forzar aplicar en producción
npx prisma migrate deploy --force
```

---

### Error: Foreign key constraint failed

**Síntoma:**
```
Error: Foreign key constraint failed on the field: `userId`
```

**Causas:**
- Intentando crear un producto con userId inválido
- Usuario referenciado no existe

**Solución:**

```typescript
// Verificar que el usuario existe antes de crear producto
const user = await prisma.user.findUnique({
  where: { id: userId }
});

if (!user) {
  throw new Error('Usuario no encontrado');
}

// Entonces crear el producto
const product = await prisma.product.create({
  data: {
    ...productData,
    userId: userId
  }
});
```

---

### Error: Unique constraint failed

**Síntoma:**
```
Error: Unique constraint failed on the fields: (`email`)
```

**Causas:**
- Intentando crear usuario con email duplicado

**Solución:**

```typescript
// Verificar si el email ya existe
const existingUser = await prisma.user.findUnique({
  where: { email: email }
});

if (existingUser) {
  return res.status(400).json({
    success: false,
    message: 'El email ya está registrado'
  });
}

// Proceder con el registro
```

---

## 🔐 Errores de Autenticación

### Error: Token inválido o expirado

**Síntoma:**
```json
{
  "success": false,
  "message": "Token inválido o expirado"
}
```

**Causas:**
- Token JWT expirado
- JWT_SECRET incorrecto
- Token malformado

**Soluciones:**

```bash
# Solución 1: Obtener nuevo token
# Hacer login nuevamente en /api/v1/auth/login

# Solución 2: Verificar JWT_SECRET en .env
# Debe ser el mismo que se usó para generar el token

# Solución 3: Aumentar tiempo de expiración en .env
JWT_EXPIRE=30d  # 30 días en lugar de 7d

# Solución 4: Verificar formato del header
# Debe ser: Authorization: Bearer <token>
# (con espacio después de "Bearer")
```

**Debug:**

```typescript
// Ver payload del token (utils/jwt.ts)
import jwt from 'jsonwebtoken';

const decoded = jwt.decode(token);
console.log('Token payload:', decoded);
console.log('Expira en:', new Date(decoded.exp * 1000));
```

---

### Error: No autorizado

**Síntoma:**
```json
{
  "success": false,
  "message": "No tienes permisos para realizar esta acción"
}
```

**Causas:**
- Usuario no tiene el rol requerido
- Intentando modificar recurso de otro usuario

**Solución:**

```bash
# Verificar rol del usuario en la base de datos
docker-compose exec postgres psql -U postgres -d api_productos -c "
  SELECT id, email, role FROM users WHERE email = 'tu_email@ejemplo.com';
"

# Cambiar rol a ADMIN (solo para testing)
docker-compose exec postgres psql -U postgres -d api_productos -c "
  UPDATE users SET role = 'ADMIN' WHERE email = 'tu_email@ejemplo.com';
"

# Obtener nuevo token con el rol actualizado
# Hacer login nuevamente
```

---

### Error: Token no proporcionado

**Síntoma:**
```json
{
  "success": false,
  "message": "Token no proporcionado"
}
```

**Causas:**
- Header Authorization faltante
- Formato incorrecto del header

**Solución:**

```bash
# Formato correcto en curl
curl -H "Authorization: Bearer tu_token_jwt_aqui" \
  http://localhost:3000/api/v1/auth/profile

# En Postman/Insomnia:
# 1. Ir a Headers
# 2. Key: Authorization
# 3. Value: Bearer tu_token_jwt_aqui

# En Swagger:
# 1. Click en "Authorize"
# 2. Ingresar: Bearer tu_token_jwt_aqui
# 3. Click "Authorize"
```

---

## 🐳 Errores de Docker

### Error: port is already allocated

**Síntoma:**
```
Error: Bind for 0.0.0.0:5432 failed: port is already allocated
```

**Causas:**
- Puerto 5432 ya en uso por PostgreSQL local u otro contenedor

**Soluciones:**

```bash
# Solución 1: Encontrar qué está usando el puerto
lsof -i :5432

# Matar el proceso
kill -9 <PID>

# Solución 2: Cambiar puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar 5433 en el host

# Actualizar DATABASE_URL en .env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/api_productos?schema=public"

# Solución 3: Detener PostgreSQL local
brew services stop postgresql@15  # macOS
sudo systemctl stop postgresql    # Linux
```

---

### Error: network not found

**Síntoma:**
```
Error: network remedial-ipg-backend-ciclo-7_default not found
```

**Causas:**
- Red Docker eliminada o corrupta

**Solución:**

```bash
# Recrear toda la configuración
docker-compose down
docker-compose up -d
```

---

### Error: no space left on device

**Síntoma:**
```
Error: no space left on device
```

**Causas:**
- Docker sin espacio en disco

**Soluciones:**

```bash
# Ver uso de espacio de Docker
docker system df

# Limpiar contenedores detenidos
docker container prune

# Limpiar imágenes no usadas
docker image prune -a

# Limpiar volúmenes no usados
docker volume prune

# Limpiar todo (¡CUIDADO!)
docker system prune -a --volumes
```

---

## 🔨 Errores de Compilación

### Error: Cannot find name 'X' (TypeScript)

**Síntoma:**
```
error TS2304: Cannot find name 'Request'.
error TS2304: Cannot find name 'Response'.
```

**Causas:**
- Tipos TypeScript no instalados

**Solución:**

```bash
# Instalar tipos faltantes
npm install --save-dev @types/express @types/node

# Verificar tsconfig.json
cat tsconfig.json | grep "types"

# Debería incluir:
{
  "compilerOptions": {
    "types": ["node", "jest"]
  }
}
```

---

### Error: Module not found (after build)

**Síntoma:**
```
Error: Cannot find module './controllers/auth'
```

**Causas:**
- Archivos TypeScript no compilados
- Ruta incorrecta en imports

**Soluciones:**

```bash
# Solución 1: Recompilar
npm run build

# Solución 2: Limpiar dist y recompilar
rm -rf dist
npm run build

# Solución 3: Verificar tsconfig.json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src"
  }
}
```

---

## 🧪 Errores de Testing

### Error: Jest encountered an unexpected token

**Síntoma:**
```
Jest encountered an unexpected token
SyntaxError: Cannot use import statement outside a module
```

**Causas:**
- Configuración de Jest incorrecta para TypeScript

**Solución:**

```bash
# Verificar jest.config.js
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
};

# Reinstalar dependencias de testing
npm install --save-dev ts-jest @types/jest

# Limpiar caché de Jest
npm test -- --clearCache
```

---

### Error: Cannot find module (in tests)

**Síntoma:**
```
Cannot find module '../src/utils/prisma' from 'test/services/auth.spec.ts'
```

**Causas:**
- Rutas incorrectas en tests
- Mocks no configurados

**Solución:**

```typescript
// Usar rutas absolutas desde src
import { prisma } from '../../src/utils/prisma';

// O configurar paths en tsconfig.json
{
  "compilerOptions": {
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}

// Entonces en tests:
import { prisma } from '@/utils/prisma';
```

---

## 🚀 Errores de Producción

### Error: 500 Internal Server Error (sin detalles)

**Síntoma:**
```json
{
  "success": false,
  "message": "Error interno del servidor"
}
```

**Causas:**
- NODE_ENV=production oculta detalles de errores
- Error no capturado

**Soluciones:**

```bash
# Solución 1: Ver logs del servidor
pm2 logs  # Si usas PM2
journalctl -u api-productos -f  # Si usas systemd

# Solución 2: Temporalmente cambiar a development
NODE_ENV=development npm start

# Solución 3: Agregar logging apropiado
// En el código:
console.error('Error details:', error);

// O usar winston/pino para logs estructurados
```

---

### Error: CORS blocked

**Síntoma:**
```
Access to fetch at 'http://api.ejemplo.com' from origin 'http://frontend.ejemplo.com'
has been blocked by CORS policy
```

**Causas:**
- Origen no permitido en CORS

**Solución:**

```bash
# En .env
ALLOWED_ORIGINS=http://frontend.ejemplo.com,https://frontend.ejemplo.com

# O en app.ts para permitir todos (solo desarrollo):
app.use(cors({
  origin: '*'  // ¡NO usar en producción!
}));
```

---

## 🔍 Debugging

### Habilitar Logs de Debug

```bash
# Ver logs de Prisma
DEBUG=prisma:* npm run dev

# Ver todos los logs de debug
DEBUG=* npm run dev

# Logs de consultas SQL
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public&log=query"
```

### Usar VS Code Debugger

Crear `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Dev Server",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev"],
      "console": "integratedTerminal",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Herramientas Útiles

```bash
# Health check del servidor
curl http://localhost:3000/health

# Ver todas las rutas disponibles (agregar en app.ts)
app._router.stack.forEach(r => {
  if (r.route) console.log(r.route.path)
});

# Verificar conectividad de DB
npx prisma db pull  # Debe conectar sin errores

# Ver configuración de Prisma
npx prisma validate
```

---

## 📚 Recursos de Ayuda

- [Prisma Error Reference](https://www.prisma.io/docs/reference/api-reference/error-reference)
- [PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)
- [Docker Troubleshooting](https://docs.docker.com/config/daemon/troubleshoot/)
- [Node.js Debugging Guide](https://nodejs.org/en/docs/guides/debugging-getting-started/)

---

## 🆘 ¿Aún tienes problemas?

Si ninguna de estas soluciones funciona:

1. **Revisa los logs completos**
2. **Busca el error exacto en Google**
3. **Revisa Issues en GitHub del proyecto**
4. **Pregunta en el servidor de Discord/Slack del equipo**
5. **Crea un issue con**:
   - Descripción del problema
   - Pasos para reproducir
   - Logs completos
   - Versiones de software (Node, Docker, etc.)

---

**Tip**: Mantén siempre los logs accesibles con `docker-compose logs -f` o `npm run dev` en una terminal separada para debugging rápido.
