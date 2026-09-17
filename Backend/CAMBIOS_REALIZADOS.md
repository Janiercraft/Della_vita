# Cambios realizados

## 1. Run/F5 de VS Code corregido
- `application.yml` queda como configuración local de desarrollo.
- Conexión local: `jdbc:postgresql://localhost:5432/beneficiarios`.
- Usuario local: `beneficiarios`.
- Clave local: `123`.
- Ya no depende de `DB_PASSWORD` de Windows al ejecutar localmente.

## 2. Docker separado mediante perfil
- Se agregó `application-docker.yml`.
- `compose.yml` establece `SPRING_PROFILES_ACTIVE=docker` para el backend.
- Docker continúa usando `jdbc:postgresql://postgres:5432/beneficiarios` y las variables de `.env`.

## 3. PostgreSQL accesible desde VS Code
- `compose.yml` publica `5432:5432`.
- Puedes ejecutar únicamente PostgreSQL con `docker compose up -d postgres` y ejecutar Java desde VS Code.

## 4. Configuración de VS Code
- Se agregó `.vscode/launch.json` con `Run ProyectoApplication`.

## 5. Scripts auxiliares
- `iniciar-postgres.ps1`: inicia solo PostgreSQL para desarrollo local.
- `verificar-db.ps1`: muestra el estado y las tablas creadas por Flyway.

## 6. Configuración de ejemplo
- Se agregó `.env.example` para despliegues o nuevas instalaciones.

## Uso recomendado

```powershell
./iniciar-postgres.ps1
```

Luego abre `ProyectoApplication.java` y pulsa Run/F5.

Para ejecutar todo en Docker:

```powershell
docker compose up -d --build
```

No uses `docker compose down -v` salvo que quieras borrar deliberadamente la base de datos.
