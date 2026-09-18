#!/bin/sh
set -eu

DB_HOST_VALUE="${DB_HOST:-database}"
DB_PORT_VALUE="${DB_PORT:-5432}"
DB_NAME_VALUE="${DB_NAME:-beneficiarios}"
DB_USER_VALUE="${DB_USER:-beneficiarios}"
MAX_ATTEMPTS="${DB_WAIT_ATTEMPTS:-60}"

echo "[docker-entrypoint] Esperando DNS de PostgreSQL: ${DB_HOST_VALUE}..."
i=1
while [ "$i" -le "$MAX_ATTEMPTS" ]; do
  if getent hosts "$DB_HOST_VALUE" >/dev/null 2>&1; then
    echo "[docker-entrypoint] Host ${DB_HOST_VALUE} resuelto correctamente."
    break
  fi

  if [ "$i" -eq "$MAX_ATTEMPTS" ]; then
    echo "[docker-entrypoint] ERROR: no fue posible resolver ${DB_HOST_VALUE}."
    exit 10
  fi

  sleep 1
  i=$((i + 1))
done

echo "[docker-entrypoint] Esperando PostgreSQL en ${DB_HOST_VALUE}:${DB_PORT_VALUE}..."
i=1
while [ "$i" -le "$MAX_ATTEMPTS" ]; do
  if pg_isready \
      -h "$DB_HOST_VALUE" \
      -p "$DB_PORT_VALUE" \
      -d "$DB_NAME_VALUE" \
      -U "$DB_USER_VALUE" \
      >/dev/null 2>&1; then
    echo "[docker-entrypoint] PostgreSQL listo. Iniciando Spring Boot..."
    exec java -jar /app/app.jar
  fi

  if [ "$i" -eq "$MAX_ATTEMPTS" ]; then
    echo "[docker-entrypoint] ERROR: PostgreSQL no estuvo disponible despues de ${MAX_ATTEMPTS} intentos."
    exit 11
  fi

  sleep 1
  i=$((i + 1))
done
