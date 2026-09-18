# RBAC URABÁ-PAÍS

## Equivalencia de roles técnicos

| Rol funcional | Rol técnico Spring Security |
|---|---|
| Coordinador / Superadmin | `ADMIN` |
| Funcionario / Profesional | `OPERADOR` |
| Usuario / Beneficiario | `CONSULTA` |

## Matriz de permisos

| Recurso / acción | Coordinador (ADMIN) | Funcionario (OPERADOR) |
|---|---|---|
| Crear beneficiario | Sí | Sí, solo municipio asignado |
| Consultar beneficiario | Sí | Sí, solo municipio asignado |
| Editar beneficiario | Sí | Sí, solo municipio asignado |
| Desactivar/anular beneficiario | Sí | No |
| Cambiar consentimiento | Sí | Sí, solo municipio asignado |
| Resolver posible duplicado | Sí | No |
| Aceptar persona como registro independiente | Sí | No |
| Fusionar fichas | Sí | No |
| Descartar posible duplicado | Sí | No |
| Crear/editar familia | Sí | Sí, solo municipio asignado |
| Desactivar familia/integrante | Sí | No |
| Crear participación | Sí | Sí, solo municipio asignado y con consentimiento otorgado |
| Desactivar participación | Sí | No |
| Registrar atención | Sí | Sí, solo municipio asignado |
| Editar atención | Sí | Sí, solo municipio asignado |
| Anular atención | Sí | No |
| Validar/rechazar ayuda | Sí | No |
| Registrar seguimiento | Sí | Sí, solo municipio asignado |
| Editar seguimiento | Sí | Sí, solo municipio asignado |
| Anular seguimiento | Sí | No |
| Gestionar programas/catálogos | Sí | No |
| Ver programas/catálogos | Sí | Sí |
| Ver KPIs macro / resumen global | Sí | No |
| Ver auditoría | Sí | No |
| Importaciones masivas | Sí | No |
| Exportación CSV masiva | Sí | No |
| Asistente IA agregado/global | Sí | No |
| IA sobre beneficiario individual | Sí | No |
| IA sobre actividad propia | Sí | Sí, únicamente su actividad y municipio |

## Delimitación territorial

Al crear un usuario `OPERADOR`, el coordinador debe asignar `municipioAsignado` con uno de estos valores:

- `Apartadó`
- `Turbo`
- `Necoclí`

El backend valida el municipio; no depende únicamente de ocultar botones en el frontend.

Ejemplo:

```json
{
  "nombreUsuario": "funcionario.turbo",
  "nombreCompleto": "Funcionario Turbo",
  "clave": "Funcionario123",
  "rol": "OPERADOR",
  "municipioAsignado": "Turbo",
  "idBeneficiario": null
}
```

## State machine: posibles duplicados

```text
NUEVO
  |
  | Funcionario registra persona sin documento
  | y coincide nombre normalizado + fecha de nacimiento
  v
EN_REVISION_DUPLICIDAD
  |\
  | \________________________________
  |                                  \
  | ACEPTAR                           \ DESCARTAR
  v                                    v
APROBADO                           DESCARTADO
  |
  | El registro puede vincularse
  | a programas cuando además
  | consentimiento = OTORGADO

EN_REVISION_DUPLICIDAD
  |
  | FUSIONAR con ficha existente
  v
FUSIONADO -> idBeneficiarioPrincipal
```

Solo `ADMIN` puede ejecutar `ACEPTAR`, `DESCARTAR` o `FUSIONAR`.

Mientras un registro esté `EN_REVISION_DUPLICIDAD`, el backend impide crear participaciones para esa persona.

## Consentimiento informado

Estados:

- `PENDIENTE`
- `OTORGADO`
- `RECHAZADO`
- `REVOCADO`

Todo beneficiario nuevo inicia en `PENDIENTE`. Antes de vincularlo a un programa debe quedar en `OTORGADO`.

## Validación de ayudas

Si `tipoAtencion` contiene `AYUDA`, `KIT` o `ENTREGA`, la atención inicia con:

```text
PENDIENTE
```

Solo el coordinador puede cambiarla a:

```text
VALIDADA
RECHAZADA
```

Las atenciones ordinarias quedan en `NO_APLICA`.

Para el rol beneficiario, el contexto enviado a Gemini no incluye ayudas pendientes o rechazadas; solo ayudas validadas y atenciones que no requieren validación.

## UX/UI para Funcionario

### Alerta de posible duplicado

El formulario no debe bloquear la jornada del funcionario con un modal obligatorio. Al guardar:

1. El backend crea la ficha con `EN_REVISION_DUPLICIDAD`.
2. La interfaz muestra un aviso ámbar no destructivo:
   - **Posible coincidencia detectada**.
   - "El registro fue guardado y enviado a revisión del coordinador. Puede continuar con su jornada."
3. Mostrar botón secundario **Ver coincidencias**, únicamente en modo lectura.
4. Deshabilitar acciones de vinculación a programas hasta resolución.

### Bandeja del Coordinador

Crear una vista **Revisión de duplicados** con:

- ficha nueva a la izquierda;
- candidatos existentes a la derecha;
- nombre, fecha de nacimiento, municipio y documento enmascarado cuando exista;
- diferencias resaltadas;
- acciones: **Aceptar como persona diferente**, **Fusionar**, **Descartar**;
- campo obligatorio `motivo` antes de confirmar.

Nunca resolver automáticamente una coincidencia con IA.

## Endpoints añadidos / modificados

### Duplicidad — solo ADMIN

```http
GET  /api/v1/duplicidades
GET  /api/v1/duplicidades/{idBeneficiario}/candidatos
POST /api/v1/duplicidades/{idBeneficiario}/resolver
```

Aceptar:

```json
{
  "version": 0,
  "accion": "ACEPTAR",
  "motivo": "Se verificó que corresponde a una persona diferente"
}
```

Descartar:

```json
{
  "version": 0,
  "accion": "DESCARTAR",
  "motivo": "Registro creado por error"
}
```

Fusionar:

```json
{
  "version": 0,
  "accion": "FUSIONAR",
  "idDestino": 1,
  "versionDestino": 2,
  "motivo": "Misma persona confirmada por coordinación"
}
```

### Consentimiento — ADMIN u OPERADOR de la sede

```http
PATCH /api/v1/beneficiarios/{id}/consentimiento
```

```json
{
  "version": 0,
  "estado": "OTORGADO",
  "motivo": "Consentimiento informado registrado"
}
```

### Validación de ayuda — solo ADMIN

```http
PATCH /api/v1/atenciones/{id}/validacion-ayuda
```

```json
{
  "version": 0,
  "estado": "VALIDADA",
  "motivo": "Entrega verificada por coordinación"
}
```

## Reglas del asistente IA

### ADMIN

- reportes agregados;
- consulta individual;
- historial autorizado;
- documento y celular enmascarados antes de Gemini;
- estado de consentimiento y revisión por duplicidad;
- información de funcionario responsable;
- nunca contraseñas, tokens ni dirección exacta en Gemini.

### OPERADOR

- solo actividad creada por el funcionario;
- únicamente registros de su `municipioAsignado`;
- sin KPIs macro ni resumen consolidado;
- sin registros de otros funcionarios;
- sin resolución de duplicados;
- sin exportaciones masivas.

### CONSULTA

- solo su propia ficha vinculada a `idBeneficiario`;
- programas y atenciones autorizadas;
- ayudas únicamente si están validadas;
- seguimientos propios;
- sin observaciones internas, datos de terceros, KPIs o motivos internos de selección.
