# Reparación Docker/PostgreSQL

## Error corregido

El error original terminaba en:

`java.net.UnknownHostException: postgres`

Eso significa que el contenedor backend no podía resolver por DNS el nombre del contenedor PostgreSQL.
No era un error de JPA ni de Flyway; ambos fallaban porque no podían llegar a la base de datos.

## Cambios aplicados

- Red Docker explícita `uraba_backend_net`.
- PostgreSQL posee los alias DNS `postgres`, `database` y `db`.
- El backend usa `database` como host interno estable.
- `depends_on` espera a que PostgreSQL esté saludable.
- Flyway tiene reintentos de conexión.
- Hikari tiene tiempos de espera explícitos.
- El backend incluye un entrypoint que comprueba primero la resolución DNS antes de iniciar Spring Boot.
- Se mantienen todos los módulos y endpoints existentes.

## Arranque limpio recomendado

Desde la carpeta donde está `compose.yml`:

```powershell
docker compose down --remove-orphans
docker compose up --build
```

Si desea reiniciar también la base de datos desde cero (BORRA los datos locales):

```powershell
docker compose down -v --remove-orphans
docker compose up --build
```

## Verificación

```powershell
docker compose ps
docker compose exec backend getent hosts database
docker compose exec postgres pg_isready -U beneficiarios -d beneficiarios
```

La API debe quedar disponible en:

`http://localhost:8080`

Health:

`http://localhost:8080/actuator/health`
