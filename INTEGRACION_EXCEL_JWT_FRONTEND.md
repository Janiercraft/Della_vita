# Integración Excel + JWT

Se conectó el frontend recibido con el backend actualizado con JWT.

## Flujo

1. `/api/v1/auth/login` devuelve el JWT en `Authorization` y `X-Auth-Token`.
2. El frontend guarda el JWT en `localStorage` (`jwt_token`).
3. Las solicitudes autenticadas priorizan `Authorization: Bearer <token>`.
4. En **Consultas y Ficha 360° > Indicadores y Reportes**, un ADMIN puede seleccionar un `.xlsx`, `.xls` o `.csv`.
5. El archivo se envía como `multipart/form-data` a `/api/v1/importaciones/auto?confirmar=true&hoja=0&separador=AUTO`.
6. El backend detecta las columnas, procesa las filas y devuelve el resumen.
7. El frontend muestra importados, duplicados, pendientes y errores, y refresca los reportes.

## Restricciones respetadas

- La importación permanece limitada a `ADMIN`, igual que en el backend.
- Máximo 10 MB, de acuerdo con la lógica del backend.
- No se modificaron `compose.yml` ni `application*.yml`.
- Se mantiene Basic Auth como respaldo de compatibilidad, pero JWT tiene prioridad.

## Ejecución del frontend

Desde `Frontend`:

```bash
npm install
npm run dev
```

Por defecto consume `http://localhost:8080/api/v1`. Para otro backend configure `VITE_API_URL`.
