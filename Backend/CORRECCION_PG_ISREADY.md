# Correccion del arranque Docker PostgreSQL

## Problema detectado

El script anterior intentaba comprobar PostgreSQL enviando trafico HTTP/TCP generico al puerto 5432. PostgreSQL no habla HTTP, por lo que registraba repetidamente:

`invalid length of startup packet`

Ademas, `/dev/tcp` no esta disponible en todos los shells `/bin/sh`, por lo que el backend podia quedarse esperando aun cuando PostgreSQL ya estaba sano.

## Correccion

- Se instala `postgresql-client` en la imagen del backend.
- El script `docker-entrypoint.sh` usa `pg_isready`, que implementa el chequeo adecuado para PostgreSQL.
- Se conserva el `depends_on: condition: service_healthy` de Docker Compose.
- Spring Boot solo inicia cuando PostgreSQL responde correctamente.

## Arranque recomendado

```powershell
docker compose down --remove-orphans
docker compose up --build
```

No es necesario borrar el volumen para aplicar esta correccion.
