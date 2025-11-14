# Guía Detallada de Instalación y Configuración

Esta guía proporciona instrucciones paso a paso para configurar el proyecto en diferentes entornos.

---

## 📋 Tabla de Contenidos

- [Requisitos del Sistema](#requisitos-del-sistema)
- [Instalación con Docker Compose](#instalación-con-docker-compose)
- [Instalación con PostgreSQL Local](#instalación-con-postgresql-local)
- [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
- [Prisma ORM Setup](#prisma-orm-setup)
- [Verificación de la Instalación](#verificación-de-la-instalación)
- [Configuración de IDE](#configuración-de-ide)
- [Troubleshooting](#troubleshooting)

---

## 📋 Requisitos del Sistema

### Software Requerido

| Software | Versión Mínima | Recomendada | Enlace |
|----------|----------------|-------------|---------|
| Node.js | 16.x | 18.x o superior | [nodejs.org](https://nodejs.org/) |
| npm | 8.x | 9.x o superior | Incluido con Node.js |
| Git | 2.x | Última | [git-scm.com](https://git-scm.com/) |
| Docker (opcional) | 20.x | Última | [docker.com](https://www.docker.com/) |
| PostgreSQL (sin Docker) | 12.x | 15.x | [postgresql.org](https://www.postgresql.org/) |

### Especificaciones del Sistema

- **RAM**: Mínimo 4GB, recomendado 8GB o más
- **Espacio en Disco**: Al menos 500MB libres
- **Sistema Operativo**: Windows 10+, macOS 10.15+, o Linux (Ubuntu 20.04+)

---

## 🐳 Instalación con Docker Compose

Esta es la forma más rápida y recomendada para configurar el entorno de desarrollo.

### Paso 1: Verificar que Docker esté instalado

```bash
# Verificar Docker
docker --version
# Salida esperada: Docker version 20.x.x o superior

# Verificar Docker Compose
docker-compose --version
# Salida esperada: docker-compose version 1.29.x o superior
```

Si Docker no está instalado:
- **macOS**: Descarga [Docker Desktop for Mac](https://www.docker.com/products/docker-desktop)
- **Windows**: Descarga [Docker Desktop for Windows](https://www.docker.com/products/docker-desktop)
- **Linux**: Sigue las instrucciones en [docs.docker.com](https://docs.docker.com/engine/install/)

### Paso 2: Clonar el repositorio

```bash
# Clonar el proyecto
git clone <url-del-repositorio>

# Entrar al directorio
cd remedial-ipg-backend-ciclo-7

# Verificar que estés en la rama correcta
git branch
```

### Paso 3: Instalar dependencias de Node.js

```bash
# Instalar todas las dependencias
npm install

# Verificar que las dependencias se instalaron correctamente
npm list --depth=0
```

### Paso 4: Configurar variables de entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env

# Editar el archivo .env con tu editor favorito
nano .env  # o vim .env, code .env, etc.
```

Configura las siguientes variables:

```env
# Servidor
PORT=3000
NODE_ENV=development

# Base de datos (para Docker Compose)
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"

# JWT
JWT_SECRET=tu_clave_secreta_muy_segura_cambiar_en_produccion_2024
JWT_EXPIRE=7d

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Paso 5: Levantar los contenedores Docker

```bash
# Iniciar PostgreSQL y PgAdmin en segundo plano
docker-compose up -d

# Verificar que los contenedores estén corriendo
docker-compose ps

# Deberías ver algo como:
#        Name                      Command              State           Ports
# --------------------------------------------------------------------------------
# api_productos_db       docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
# api_productos_pgadmin  /entrypoint.sh                  Up      0.0.0.0:5050->80/tcp
```

### Paso 6: Ver los logs (opcional)

```bash
# Ver logs de PostgreSQL
docker-compose logs -f postgres

# Para salir de los logs: Ctrl + C
```

### Paso 7: Configurar Prisma y ejecutar migraciones

```bash
# Generar el Prisma Client
npm run prisma:generate

# Ejecutar las migraciones (crear tablas)
npm run prisma:migrate

# (Opcional) Abrir Prisma Studio para ver la base de datos
npm run prisma:studio
# Esto abrirá http://localhost:5555 en tu navegador
```

### Paso 8: Iniciar el servidor

```bash
# Modo desarrollo (con hot-reload)
npm run dev

# La salida debería mostrar:
# > ts-node-dev ./src/server.ts
# [INFO] Server running on http://localhost:3000
```

### Paso 9: Verificar la instalación

Abre tu navegador en:
- **API**: http://localhost:3000
- **Swagger Docs**: http://localhost:3000/api-docs
- **Health Check**: http://localhost:3000/health
- **PgAdmin** (opcional): http://localhost:5050

---

## 🗄️ Instalación con PostgreSQL Local

Si prefieres no usar Docker, puedes instalar PostgreSQL localmente.

### macOS (con Homebrew)

#### Paso 1: Instalar PostgreSQL

```bash
# Actualizar Homebrew
brew update

# Instalar PostgreSQL 15
brew install postgresql@15

# Iniciar PostgreSQL como servicio
brew services start postgresql@15

# Verificar que PostgreSQL esté corriendo
brew services list | grep postgresql
# Deberías ver: postgresql@15 started ...
```

#### Paso 2: Crear la base de datos

```bash
# Conectarse a PostgreSQL
psql postgres

# Dentro de psql:
CREATE DATABASE api_productos;

# Crear usuario (opcional)
CREATE USER postgres WITH PASSWORD 'postgres';
GRANT ALL PRIVILEGES ON DATABASE api_productos TO postgres;

# Salir de psql
\q
```

#### Paso 3: Continuar con los pasos 2-4 y 7-9 de Docker Compose

La única diferencia es que ya no necesitas ejecutar `docker-compose up -d`.

### Windows

#### Paso 1: Descargar PostgreSQL

1. Ve a [postgresql.org/download/windows](https://www.postgresql.org/download/windows/)
2. Descarga el instalador de PostgreSQL 15
3. Ejecuta el instalador

#### Paso 2: Durante la instalación

- **Puerto**: Usa el puerto por defecto (5432)
- **Contraseña**: Anota la contraseña del superusuario (postgres)
- **Locale**: Selecciona tu idioma preferido

#### Paso 3: Crear la base de datos

```cmd
# Abrir Command Prompt como Administrador

# Conectarse a PostgreSQL
psql -U postgres

# Crear la base de datos
CREATE DATABASE api_productos;

# Salir
\q
```

#### Paso 4: Actualizar .env

```env
DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA@localhost:5432/api_productos?schema=public"
```

### Linux (Ubuntu/Debian)

```bash
# Actualizar paquetes
sudo apt update

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib

# Iniciar el servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Cambiar a usuario postgres
sudo -i -u postgres

# Crear la base de datos
createdb api_productos

# (Opcional) Crear usuario
createuser --interactive --pwprompt

# Salir
exit
```

---

## ⚙️ Configuración de Variables de Entorno

### Archivo .env Completo

```env
# ======================
# CONFIGURACIÓN DEL SERVIDOR
# ======================
# Puerto donde corre la aplicación
PORT=3000

# Entorno de ejecución (development, production, test)
NODE_ENV=development

# ======================
# BASE DE DATOS POSTGRESQL
# ======================
# Formato: postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_bd]?schema=[schema]

# Para Docker Compose:
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/api_productos?schema=public"

# Para PostgreSQL local (macOS/Linux):
# DATABASE_URL="postgresql://tu_usuario:tu_contraseña@localhost:5432/api_productos?schema=public"

# Para PostgreSQL local (Windows):
# DATABASE_URL="postgresql://postgres:tu_contraseña@localhost:5432/api_productos?schema=public"

# ======================
# JWT (JSON WEB TOKENS)
# ======================
# Clave secreta para firmar tokens
# IMPORTANTE: Cambia esto en producción por una clave aleatoria y segura
JWT_SECRET=mi_clave_secreta_super_segura_cambiar_en_produccion_2024

# Tiempo de expiración del token
# Ejemplos: 1h (1 hora), 7d (7 días), 30d (30 días)
JWT_EXPIRE=7d

# ======================
# CORS
# ======================
# Orígenes permitidos (separados por comas)
# Agrega aquí los dominios de tu frontend
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:4200

# ======================
# OTROS (OPCIONAL)
# ======================
# Nivel de logs (error, warn, info, debug)
# LOG_LEVEL=info
```

### Generar JWT_SECRET Seguro

```bash
# En Linux/macOS
openssl rand -base64 64

# En Node.js (cualquier sistema)
node -e "console.log(require('crypto').randomBytes(64).toString('base64'))"

# Copia el resultado y úsalo como JWT_SECRET
```

---

## 🗄️ Prisma ORM Setup

### Comandos Prisma Esenciales

#### 1. Generar Prisma Client

```bash
# Después de instalar dependencias o modificar schema.prisma
npm run prisma:generate

# Esto crea el cliente de Prisma con los tipos TypeScript
```

#### 2. Crear y Ejecutar Migraciones

```bash
# Crear una nueva migración (para cambios en schema.prisma)
npx prisma migrate dev --name nombre_descriptivo

# Aplicar migraciones pendientes
npm run prisma:migrate

# Ver estado de migraciones
npx prisma migrate status
```

#### 3. Resetear Base de Datos (¡CUIDADO! Elimina todos los datos)

```bash
# Solo en desarrollo
npx prisma migrate reset

# Confirma con 'y' cuando te lo pida
```

#### 4. Prisma Studio (GUI para ver/editar datos)

```bash
# Abre http://localhost:5555
npm run prisma:studio
```

### Modificar el Schema

Si necesitas hacer cambios al schema:

1. **Edita** `prisma/schema.prisma`
2. **Crea la migración**:
   ```bash
   npx prisma migrate dev --name descripcion_del_cambio
   ```
3. **Genera el cliente**:
   ```bash
   npm run prisma:generate
   ```

---

## ✅ Verificación de la Instalación

### Checklist de Verificación

- [ ] Node.js instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Dependencias instaladas (`ls node_modules`)
- [ ] PostgreSQL corriendo (Docker o local)
- [ ] Base de datos creada
- [ ] Variables de entorno configuradas (`.env` existe)
- [ ] Prisma Client generado
- [ ] Migraciones ejecutadas
- [ ] Servidor inicia sin errores (`npm run dev`)

### Pruebas de Endpoints

```bash
# Health check
curl http://localhost:3000/health

# Debería retornar:
# {"status":"OK","timestamp":"2024-01-15T10:30:00.000Z"}

# Swagger docs (en el navegador)
open http://localhost:3000/api-docs
```

### Verificar Base de Datos

```bash
# Con Prisma Studio
npm run prisma:studio

# O con psql
psql -U postgres -d api_productos

# Dentro de psql:
\dt  # Listar tablas
# Deberías ver: users, products

\d users  # Describir tabla users
\q  # Salir
```

---

## 💻 Configuración de IDE

### Visual Studio Code

#### Extensiones Recomendadas

Instala estas extensiones para una mejor experiencia de desarrollo:

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "ms-vscode.vscode-typescript-next",
    "firsttris.vscode-jest-runner",
    "humao.rest-client"
  ]
}
```

#### Settings.json

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```

### JetBrains WebStorm / IntelliJ IDEA

1. Abre **Settings** > **Languages & Frameworks** > **JavaScript** > **Prettier**
2. Activa **"On save"** para formateo automático
3. Configura ESLint en **Settings** > **Languages & Frameworks** > **JavaScript** > **Code Quality Tools** > **ESLint**

---

## 🔧 Troubleshooting

### Error: Cannot find module 'X'

```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install
```

### Error: Port 3000 already in use

```bash
# Encuentra el proceso
lsof -i :3000

# Mata el proceso (reemplaza <PID> con el número real)
kill -9 <PID>

# O cambia el puerto en .env
PORT=3001
```

### Error: Cannot connect to database

```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps  # Para Docker
brew services list | grep postgresql  # Para Homebrew

# Reiniciar PostgreSQL
docker-compose restart postgres  # Para Docker
brew services restart postgresql@15  # Para Homebrew
```

### Error: Prisma Client is not generated

```bash
# Generar el cliente
npm run prisma:generate

# Reiniciar servidor
npm run dev
```

---

## 🎯 Próximos Pasos

Una vez completada la instalación:

1. ✅ Lee la [documentación de API](../README.md#documentación-de-api)
2. ✅ Explora [Swagger UI](http://localhost:3000/api-docs)
3. ✅ Revisa los [modelos de base de datos](./DATABASE.md)
4. ✅ Aprende los [comandos de Docker](./DOCKER.md)
5. ✅ Ejecuta los tests: `npm test`

---

**¿Problemas con la instalación?** Consulta [ERRORS.md](./ERRORS.md) para soluciones comunes.
