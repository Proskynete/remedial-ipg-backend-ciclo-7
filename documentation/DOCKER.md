# Guía de Docker y Docker Compose

Referencia completa de comandos Docker para el proyecto.

---

## 📋 Tabla de Contenidos

- [Introducción](#introducción)
- [docker-compose.yml](#docker-composeyml)
- [Comandos Básicos](#comandos-básicos)
- [Gestión de Servicios](#gestión-de-servicios)
- [Logs y Monitoreo](#logs-y-monitoreo)
- [Gestión de Volúmenes](#gestión-de-volúmenes)
- [Troubleshooting](#troubleshooting)
- [Comandos Avanzados](#comandos-avanzados)
- [Mejores Prácticas](#mejores-prácticas)

---

## 🐳 Introducción

Este proyecto utiliza Docker Compose para facilitar el setup del entorno de desarrollo. Los servicios incluidos son:

- **PostgreSQL 15**: Base de datos principal
- **PgAdmin 4**: Interfaz web para administrar PostgreSQL (opcional)

---

## 📄 docker-compose.yml

### Configuración Actual

```yaml
version: '3.8'

services:
  # Base de datos PostgreSQL
  postgres:
    image: postgres:15-alpine
    container_name: api_productos_db
    restart: unless-stopped
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: api_productos
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Opcional: PgAdmin para administrar la base de datos
  pgadmin:
    image: dpage/pgadmin4:latest
    container_name: api_productos_pgadmin
    restart: unless-stopped
    environment:
      PGADMIN_DEFAULT_EMAIL: admin@ejemplo.com
      PGADMIN_DEFAULT_PASSWORD: admin
    ports:
      - "5050:80"
    depends_on:
      - postgres
    volumes:
      - pgadmin_data:/var/lib/pgadmin

volumes:
  postgres_data:
    driver: local
  pgadmin_data:
    driver: local
```

### Explicación de la Configuración

#### Servicio PostgreSQL

| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| `image` | `postgres:15-alpine` | Imagen oficial de PostgreSQL versión 15 (Alpine es más liviana) |
| `container_name` | `api_productos_db` | Nombre del contenedor |
| `restart` | `unless-stopped` | Reinicia automáticamente excepto si se detiene manualmente |
| `POSTGRES_USER` | `postgres` | Usuario de la base de datos |
| `POSTGRES_PASSWORD` | `postgres` | Contraseña del usuario |
| `POSTGRES_DB` | `api_productos` | Nombre de la base de datos |
| `ports` | `5432:5432` | Puerto expuesto (host:container) |
| `volumes` | `postgres_data` | Volumen para persistencia de datos |

#### Health Check

```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U postgres"]
  interval: 10s      # Verifica cada 10 segundos
  timeout: 5s        # Timeout de 5 segundos
  retries: 5         # 5 intentos antes de marcar como unhealthy
```

#### Servicio PgAdmin

| Configuración | Valor | Descripción |
|---------------|-------|-------------|
| `image` | `dpage/pgadmin4:latest` | Interfaz web para PostgreSQL |
| `PGADMIN_DEFAULT_EMAIL` | `admin@ejemplo.com` | Email para login |
| `PGADMIN_DEFAULT_PASSWORD` | `admin` | Contraseña para login |
| `ports` | `5050:80` | Puerto expuesto (acceso en http://localhost:5050) |
| `depends_on` | `postgres` | Se inicia después de postgres |

---

## 🚀 Comandos Básicos

### Iniciar Servicios

```bash
# Iniciar todos los servicios en background
docker-compose up -d

# Iniciar con logs visibles (sin -d)
docker-compose up

# Iniciar solo PostgreSQL (sin PgAdmin)
docker-compose up -d postgres

# Forzar recreación de contenedores
docker-compose up -d --force-recreate

# Reconstruir imágenes antes de iniciar
docker-compose up -d --build
```

**Salida esperada:**
```
Creating network "remedial-ipg-backend-ciclo-7_default" with the default driver
Creating volume "remedial-ipg-backend-ciclo-7_postgres_data" with local driver
Creating volume "remedial-ipg-backend-ciclo-7_pgadmin_data" with local driver
Creating api_productos_db ... done
Creating api_productos_pgadmin ... done
```

### Detener Servicios

```bash
# Detener todos los servicios (conserva volúmenes)
docker-compose down

# Detener y eliminar volúmenes (¡CUIDADO! Elimina datos)
docker-compose down -v

# Detener sin eliminar contenedores
docker-compose stop

# Detener solo PostgreSQL
docker-compose stop postgres
```

### Reiniciar Servicios

```bash
# Reiniciar todos los servicios
docker-compose restart

# Reiniciar solo PostgreSQL
docker-compose restart postgres

# Reiniciar solo PgAdmin
docker-compose restart pgadmin
```

---

## 📊 Gestión de Servicios

### Ver Estado de Servicios

```bash
# Listar contenedores activos
docker-compose ps

# Salida esperada:
#          Name                        Command              State           Ports
# -----------------------------------------------------------------------------------
# api_productos_db       docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp
# api_productos_pgadmin  /entrypoint.sh                  Up      0.0.0.0:5050->80/tcp
```

### Ver Servicios Definidos

```bash
# Listar servicios del docker-compose.yml
docker-compose config --services

# Salida:
# postgres
# pgadmin
```

### Verificar Health Check

```bash
# Inspeccionar health del contenedor
docker inspect --format='{{json .State.Health}}' api_productos_db | python -m json.tool

# Verificar directamente con pg_isready
docker-compose exec postgres pg_isready -U postgres
```

---

## 📝 Logs y Monitoreo

### Ver Logs

```bash
# Ver logs de todos los servicios
docker-compose logs

# Ver logs en tiempo real (follow)
docker-compose logs -f

# Ver logs solo de PostgreSQL
docker-compose logs postgres
docker-compose logs -f postgres

# Ver últimas 50 líneas
docker-compose logs --tail=50 postgres

# Ver logs con timestamps
docker-compose logs -t postgres

# Ver logs desde una fecha específica
docker-compose logs --since 2024-01-15T10:00:00 postgres
```

### Monitorear Recursos

```bash
# Ver uso de recursos (CPU, memoria)
docker stats api_productos_db api_productos_pgadmin

# Salida:
# CONTAINER ID   NAME                    CPU %   MEM USAGE / LIMIT     MEM %
# a1b2c3d4e5f6   api_productos_db        0.50%   45.2MiB / 7.775GiB   0.57%
# b2c3d4e5f6g7   api_productos_pgadmin   0.10%   125MiB / 7.775GiB    1.57%
```

---

## 💾 Gestión de Volúmenes

### Listar Volúmenes

```bash
# Listar todos los volúmenes
docker volume ls

# Filtrar volúmenes del proyecto
docker volume ls | grep remedial-ipg-backend-ciclo-7
```

### Inspeccionar Volúmenes

```bash
# Ver detalles del volumen de PostgreSQL
docker volume inspect remedial-ipg-backend-ciclo-7_postgres_data

# Salida (JSON):
# [
#     {
#         "CreatedAt": "2024-01-15T10:30:00Z",
#         "Driver": "local",
#         "Labels": {...},
#         "Mountpoint": "/var/lib/docker/volumes/...",
#         "Name": "remedial-ipg-backend-ciclo-7_postgres_data",
#         "Scope": "local"
#     }
# ]
```

### Backup de Datos

#### Backup de Base de Datos

```bash
# Backup completo de la base de datos
docker-compose exec postgres pg_dump -U postgres api_productos > backup_$(date +%Y%m%d_%H%M%S).sql

# Backup en formato custom (comprimido)
docker-compose exec postgres pg_dump -U postgres -Fc api_productos > backup.dump

# Backup con timestamp en el nombre
docker-compose exec postgres pg_dump -U postgres api_productos > backup_$(date +%Y%m%d).sql
```

#### Restaurar Backup

```bash
# Restaurar desde archivo SQL
cat backup_20240115.sql | docker-compose exec -T postgres psql -U postgres api_productos

# Restaurar desde formato custom
docker-compose exec postgres pg_restore -U postgres -d api_productos -c backup.dump

# Restaurar eliminando base de datos existente primero
docker-compose exec postgres psql -U postgres -c "DROP DATABASE IF EXISTS api_productos;"
docker-compose exec postgres psql -U postgres -c "CREATE DATABASE api_productos;"
cat backup.sql | docker-compose exec -T postgres psql -U postgres api_productos
```

### Eliminar Volúmenes

```bash
# Eliminar volúmenes no usados
docker volume prune

# Eliminar volumen específico (debe detener servicios primero)
docker-compose down
docker volume rm remedial-ipg-backend-ciclo-7_postgres_data
```

**⚠️ ADVERTENCIA**: Eliminar el volumen de PostgreSQL borrará TODOS los datos.

---

## 🔧 Troubleshooting

### Contenedor no Inicia

```bash
# Ver logs para identificar el error
docker-compose logs postgres

# Verificar que el puerto no esté en uso
lsof -i :5432
# Si hay un proceso, mátalo:
kill -9 <PID>

# Reintentar
docker-compose up -d postgres
```

### Puerto ya en Uso

```bash
# Opción 1: Cambiar puerto en docker-compose.yml
ports:
  - "5433:5432"  # Cambiar 5432 a 5433

# Opción 2: Detener PostgreSQL local
# macOS (Homebrew)
brew services stop postgresql@15

# Linux
sudo systemctl stop postgresql
```

### Contenedor en Estado "Unhealthy"

```bash
# Verificar health check
docker inspect --format='{{json .State.Health}}' api_productos_db

# Entrar al contenedor para debuggear
docker-compose exec postgres bash

# Dentro del contenedor:
pg_isready -U postgres
psql -U postgres -d api_productos
```

### Resetear Todo

```bash
# Detener servicios, eliminar contenedores y volúmenes
docker-compose down -v --remove-orphans

# Eliminar imágenes no usadas
docker image prune -a

# Reiniciar desde cero
docker-compose up -d
```

---

## 🛠️ Comandos Avanzados

### Ejecutar Comandos en el Contenedor

```bash
# Ejecutar comando SQL
docker-compose exec postgres psql -U postgres -d api_productos -c "SELECT * FROM users LIMIT 5;"

# Abrir shell de PostgreSQL (psql)
docker-compose exec postgres psql -U postgres -d api_productos

# Dentro de psql:
\dt                    # Listar tablas
\d users               # Describir tabla users
\l                     # Listar bases de datos
SELECT COUNT(*) FROM products;
\q                     # Salir
```

### Entrar al Contenedor (Bash)

```bash
# Entrar al contenedor de PostgreSQL
docker-compose exec postgres bash

# Comandos útiles dentro del contenedor:
ps aux                 # Ver procesos
cat /etc/os-release    # Ver versión del OS
pg_isready -U postgres # Verificar que PostgreSQL esté listo
exit                   # Salir del contenedor
```

### Copiar Archivos

```bash
# Copiar archivo desde el host al contenedor
docker cp backup.sql api_productos_db:/tmp/backup.sql

# Copiar archivo desde el contenedor al host
docker cp api_productos_db:/var/lib/postgresql/data/pg_hba.conf ./pg_hba.conf
```

### Inspeccionar Red

```bash
# Listar redes
docker network ls

# Inspeccionar red del proyecto
docker network inspect remedial-ipg-backend-ciclo-7_default

# Ver IPs de los contenedores
docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' api_productos_db
```

### Crear Dump Programado

```bash
# Script de backup automático (backup.sh)
#!/bin/bash
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR
docker-compose exec -T postgres pg_dump -U postgres api_productos > $BACKUP_FILE
echo "Backup creado: $BACKUP_FILE"

# Eliminar backups más antiguos de 7 días
find $BACKUP_DIR -name "backup_*.sql" -mtime +7 -delete

# Dar permisos de ejecución:
chmod +x backup.sh

# Ejecutar:
./backup.sh

# Programar con cron (cada día a las 2 AM):
crontab -e
# Agregar:
0 2 * * * /ruta/completa/al/backup.sh
```

---

## ✅ Mejores Prácticas

### Seguridad

1. **No uses contraseñas débiles en producción**
   ```yaml
   # ❌ Malo (desarrollo)
   POSTGRES_PASSWORD: postgres

   # ✅ Bueno (producción)
   POSTGRES_PASSWORD: ${DB_PASSWORD}  # Desde variable de entorno
   ```

2. **No expongas puertos innecesarios en producción**
   ```yaml
   # ❌ Malo (expone PostgreSQL a internet)
   ports:
     - "0.0.0.0:5432:5432"

   # ✅ Bueno (solo localhost)
   ports:
     - "127.0.0.1:5432:5432"
   ```

### Performance

1. **Limita recursos si es necesario**
   ```yaml
   services:
     postgres:
       deploy:
         resources:
           limits:
             cpus: '2'
             memory: 2G
           reservations:
             memory: 512M
   ```

2. **Usa volúmenes nombrados** (ya lo estamos haciendo ✅)
   ```yaml
   volumes:
     postgres_data:  # ✅ Nombrado, fácil de gestionar
   ```

### Mantenimiento

```bash
# Limpieza regular de recursos no usados
docker system prune -a --volumes

# Ver espacio usado por Docker
docker system df

# Monitorear logs (rotar si crecen mucho)
docker-compose logs --tail=100
```

### Desarrollo vs Producción

```yaml
# docker-compose.yml (desarrollo)
services:
  postgres:
    environment:
      POSTGRES_PASSWORD: postgres  # OK para desarrollo
    ports:
      - "5432:5432"  # Exponer puerto

# docker-compose.prod.yml (producción)
services:
  postgres:
    environment:
      POSTGRES_PASSWORD_FILE: /run/secrets/db_password  # Usar secretos
    # NO exponer puerto, usar red interna
```

---

## 📚 Recursos Adicionales

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [PostgreSQL Docker Image](https://hub.docker.com/_/postgres)
- [PgAdmin Docker Image](https://hub.docker.com/r/dpage/pgadmin4)

---

## 🎯 Resumen de Comandos Más Usados

```bash
# Iniciar
docker-compose up -d

# Ver logs
docker-compose logs -f postgres

# Estado
docker-compose ps

# Reiniciar
docker-compose restart

# Detener
docker-compose down

# Backup
docker-compose exec postgres pg_dump -U postgres api_productos > backup.sql

# Restaurar
cat backup.sql | docker-compose exec -T postgres psql -U postgres api_productos

# Entrar a PostgreSQL
docker-compose exec postgres psql -U postgres -d api_productos

# Limpiar todo
docker-compose down -v
```

---

**¿Problemas con Docker?** Consulta la [guía de errores comunes](./ERRORS.md).
