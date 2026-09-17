# Base de datos local - ejecucion desde VS Code

## Forma recomendada

1. Abre esta carpeta completa en VS Code.
2. Presiona `F5` o ve a **Run and Debug > Run ProyectoApplication**.
3. La tarea `Preparar PostgreSQL local` inicia PostgreSQL, sincroniza la clave del usuario y verifica la autenticacion.
4. Spring Boot se conecta a `127.0.0.1:15432`.

## Si usas el enlace `Run` sobre el metodo main

Ejecuta primero:

```powershell
.\iniciar-postgres.ps1
```

Luego pulsa `Run` sobre `ProyectoApplication.main`.

## Datos locales

- Host: `127.0.0.1`
- Puerto Windows: `15432`
- Puerto dentro de Docker: `5432`
- Base: `beneficiarios`
- Usuario: `beneficiarios`
- Clave: `123`

El puerto `15432` se usa intencionalmente para evitar conectarse por error a otro PostgreSQL instalado en Windows en el puerto `5432`.

## Docker completo

Para ejecutar backend + PostgreSQL dentro de Docker:

```powershell
docker compose up -d --build
```

El backend Docker usa el perfil `docker` y se conecta internamente a `postgres:5432`.

## Verificacion

```powershell
.\verificar-db.ps1
```

No uses `docker compose down -v` salvo que quieras eliminar completamente los datos del volumen.
