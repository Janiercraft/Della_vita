# IA con Gemini principal y DeepSeek fallback

## Flujo

1. El backend construye primero el contexto autorizado mediante `FiltroDatosIaService`.
2. El mismo contexto filtrado y las mismas instrucciones de seguridad se entregan al proveedor IA.
3. Gemini es el proveedor principal.
4. Ante error de Gemini, el backend reintenta solo los errores temporales configurados.
5. Si Gemini no responde, DeepSeek recibe exactamente el mismo contexto autorizado.
6. Si ambos proveedores fallan, la API responde HTTP 503 en vez de convertir el problema externo en HTTP 500.
7. La respuesta final se normaliza a texto plano y elimina sintaxis Markdown visible como asteriscos, encabezados y cercas de codigo.

## Variables de entorno

```env
GEMINI_API_KEY=tu_clave_gemini
GEMINI_MODEL=gemini-3.6-flash

DEEPSEEK_API_KEY=tu_clave_deepseek
DEEPSEEK_MODEL=deepseek-flash

IA_REINTENTOS_GEMINI=0
IA_REINTENTOS_DEEPSEEK=1
IA_ESPERA_REINTENTO_MS=700
```

Opcionales:

```env
GEMINI_URL=https://generativelanguage.googleapis.com
GEMINI_CONNECT_TIMEOUT_MS=5000
GEMINI_READ_TIMEOUT_MS=15000

DEEPSEEK_URL=https://api.deepseek.com
DEEPSEEK_CONNECT_TIMEOUT_MS=5000
DEEPSEEK_READ_TIMEOUT_MS=15000
```

## Docker Compose

Despues de definir `DEEPSEEK_API_KEY` en `.env`:

```bash
docker compose up -d --build
```

## Render

Agregar como variables de entorno del servicio:

```text
DEEPSEEK_API_KEY
DEEPSEEK_MODEL=deepseek-flash
```

Las variables de Gemini se mantienen como hasta ahora.

## Como comprobar el fallback

La respuesta de los endpoints IA ahora incluye el campo `proveedor` con `GEMINI` o `DEEPSEEK`.

Para una prueba controlada de DeepSeek, configure temporalmente `GEMINI_API_KEY` vacia en el entorno de prueba y mantenga `DEEPSEEK_API_KEY` configurada. Reinicie el backend y ejecute las solicitudes IA de la coleccion Postman. El campo `datos.proveedor` debe ser `DEEPSEEK`.

No haga esta prueba cambiando filtros de seguridad ni enviando entidades completas. El fallback trabaja despues de `FiltroDatosIaService`, por lo que conserva el mismo contexto autorizado por rol.
