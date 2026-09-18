# Integración JWT y endpoints del frontend

El frontend usa un único cliente HTTP: `Frontend/src/core/api/apiClient.js`.

- Después de `POST /api/v1/auth/login`, el JWT se toma de `X-Auth-Token` o `Authorization`.
- Todas las solicitudes protegidas envían `Authorization: Bearer <JWT>`.
- Ya no se guardan usuario/contraseña para Basic Auth en el navegador.
- Al recargar la aplicación se valida la sesión con `GET /api/v1/auth/me`.
- Si cualquier endpoint devuelve HTTP 401, el token se elimina y el frontend cierra la sesión.
- `FormData` de Excel/CSV también viaja con Bearer JWT, sin forzar manualmente Content-Type.

## Eventos completados
Se añadieron al backend las rutas que el frontend ya utilizaba:

- `POST /api/v1/eventos/{idEvento}/postularme`
- `DELETE /api/v1/eventos/{idEvento}/mi-inscripcion`

La reinscripción reactiva una inscripción cancelada y respeta el cupo del evento.

## URL del backend
Puede configurarse desde el login o mediante `VITE_API_URL`. Todas las rutas pasan por el mismo cliente.
