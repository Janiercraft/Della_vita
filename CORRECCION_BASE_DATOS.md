# Correccion de base de datos

Esta version separa completamente la conexion local de la conexion Docker.

## Run desde VS Code

- Perfil: `local` (perfil predeterminado).
- JDBC: `jdbc:postgresql://127.0.0.1:15432/beneficiarios?sslmode=disable`
- Usuario: `beneficiarios`
- Clave: `123`
- `F5` ejecuta antes la tarea `Preparar PostgreSQL local`.

La tarea:

1. Levanta el servicio `postgres`.
2. Espera a que PostgreSQL este disponible.
3. Sincroniza la clave del rol `beneficiarios` a `123` sin borrar el volumen.
4. Comprueba autenticacion TCP con password.
5. Arranca la aplicacion Java.

Si se usa el enlace `Run` situado sobre `main`, ejecutar antes:

```powershell
.\iniciar-postgres.ps1
```

## Docker completo

`docker compose up -d --build` activa el perfil `docker` en el backend y usa `postgres:5432` dentro de la red Docker.

## Motivo del puerto 15432

Se evita usar `localhost:5432` desde Java para impedir que una instalacion local de PostgreSQL, un servicio residual o una resolucion distinta de localhost intercepte la conexion. El contenedor sigue escuchando internamente en 5432.

## Persistencia

Los datos se conservan en el volumen `datos_postgres`. `docker compose down` no lo borra. `docker compose down -v` si lo elimina y debe usarse solo cuando se quiera reiniciar completamente la base.
