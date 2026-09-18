# Configurar la URL del backend en el frontend

El frontend quedó preparado para cambiar la API sin modificar código ni recompilar.

## Opción recomendada: desde la pantalla de login

1. Abre el frontend.
2. En la pantalla de inicio de sesión pulsa **Configuración del servidor / API**.
3. En **BASE URL del backend** pega la dirección pública del backend.

Ejemplo con Render:

```text
https://mi-backend.onrender.com
```

4. Pulsa **Guardar URL**.
5. Inicia sesión normalmente.

El frontend añadirá automáticamente `/api/v1`, por lo que ambas formas son válidas:

```text
https://mi-backend.onrender.com
https://mi-backend.onrender.com/api/v1
```

La dirección queda guardada en `localStorage` bajo la clave `uraba_api_base_url`, por lo que permanece al recargar el navegador.

## Opción alternativa: variable de entorno de Vite

Crea este archivo:

```text
Frontend/.env
```

Con este contenido:

```env
VITE_API_URL=https://mi-backend.onrender.com
```

También se incluye `Frontend/.env.example` como referencia.

La URL configurada manualmente desde el login tiene prioridad sobre `VITE_API_URL`.

## Desarrollo local

Si no configuras nada, el valor predeterminado continúa siendo:

```text
http://localhost:8080/api/v1
```

## Archivo responsable

Toda la configuración está centralizada en:

```text
Frontend/src/core/api/apiClient.js
```

No es necesario cambiar las URLs individualmente en los módulos.
