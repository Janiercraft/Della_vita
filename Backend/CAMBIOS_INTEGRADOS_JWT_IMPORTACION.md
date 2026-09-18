# Integracion JWT + mejoras de importacion

Se partio del proyecto base entregado por el usuario.

## Conservado sin cambios

- Frontend completo.
- `Backend/compose.yml`.
- `Backend/src/main/resources/application.yml`.
- `application-local.yml`, `application-docker.yml` y `application-render.yml`.
- Usuarios, nombres de base de datos, puertos y credenciales/configuracion propios del proyecto base.

## JWT agregado al backend

- Dependencias JJWT 0.12.6.
- `JwtService` para emision y validacion.
- `FiltroJwt` para aceptar `Authorization: Bearer <token>`.
- El backend mantiene Basic Auth para compatibilidad con el frontend actual.
- `/api/v1/auth/login` sigue devolviendo el mismo perfil en `datos` y ademas devuelve el JWT en:
  - `Authorization: Bearer <token>`
  - `X-Auth-Token: <token>`
- Swagger documenta Bearer JWT y Basic Auth.
- CORS expone las cabeceras del token.

Variables opcionales de entorno (no se modificaron los YAML):

- `JWT_SECRET`: secreto HMAC de al menos 32 bytes. En produccion se recomienda establecerlo expresamente.
- `JWT_EXPIRATION_MS`: duracion del token en milisegundos. Valor por defecto: 28800000 (8 horas).

## Carga/importacion de archivos

- CSV acepta separador `AUTO` y detecta `,`, `;`, tabulacion o `|`.
- El mapeo de columnas puede omitirse y se intenta detectar automaticamente.
- Se agrego `POST /api/v1/importaciones/analizar` para inspeccionar columnas sin guardar datos.
- Se agrego `POST /api/v1/importaciones/auto` para importar con deteccion automatica.
- Se admite una columna de nombre completo, ademas del esquema separado primerNombre/primerApellido.
- El mapeo manual sigue teniendo prioridad sobre la deteccion automatica.
- Se conservan validaciones de tamano, encabezados, formatos CSV/XLS/XLSX y maximo de filas.

## Validaciones realizadas

- Frontend comparado por SHA-256: identico al frontend del proyecto base.
- `compose.yml` y todos los `application*.yml` comparados por SHA-256: identicos al proyecto base.
- No existen marcadores de conflicto en `Backend/src`.
- El entorno de trabajo no dispone de Maven ni Docker, por lo que no fue posible ejecutar aqui `mvn clean package` ni `docker compose build`.
