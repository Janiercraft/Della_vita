# Asistente IA - Roles y permisos

El asistente usa los roles que ya existen en el backend. Para no romper la base de datos ni los permisos actuales, se mantiene este mapeo:

- `ADMIN` = administrador / coordinador.
- `OPERADOR` = funcionario.
- `CONSULTA` = usuario final / beneficiario.

La seguridad no depende del prompt de Gemini. Spring Security y `AsistenteIaServiceImpl` seleccionan primero el contexto permitido y solo despues se llama a Gemini.

## ADMIN

Puede:

- Consultar reportes agregados.
- Generar resumen ejecutivo.
- Consultar un beneficiario concreto por `idBeneficiario` o por nombre cuando existe una coincidencia unica.
- Consultar programas, atenciones, seguimientos y el funcionario que registro cada evento.

Protecciones:

- Documento parcialmente enmascarado.
- Celular parcialmente enmascarado.
- No se envia direccion exacta.
- No se envian claves, credenciales ni tokens.

Endpoints IA:

- `POST /api/v1/ia/chat`
- `POST /api/v1/ia/resumen`
- `POST /api/v1/ia/beneficiarios/{idBeneficiario}/chat`
- `GET /api/v1/ia/sugerencias`

## OPERADOR - Funcionario

Puede consultar con la IA exclusivamente las atenciones y seguimientos creados por su propio usuario (`usuarioCreacion`).

No puede usar la IA para:

- Ver registros de otros funcionarios.
- Ver estadisticas globales del proyecto.
- Consultar el historial completo de cualquier beneficiario.
- Conocer motivos internos por los que una persona es beneficiaria.

Endpoints IA:

- `POST /api/v1/ia/chat`
- `POST /api/v1/ia/funcionario/chat`
- `GET /api/v1/ia/sugerencias`

## CONSULTA - Usuario final / beneficiario

El usuario debe estar vinculado a su ficha de beneficiario mediante `usuario.id_beneficiario`.

Puede consultar:

- Sus programas.
- Sus atenciones o ayudas recibidas.
- Sus seguimientos.
- Su proxima fecha de seguimiento cuando exista.

No recibe en el contexto de Gemini:

- Numero de documento.
- Celular.
- Direccion.
- Observaciones internas.
- Motivo por el cual es beneficiario.
- Informacion de otras personas.
- Estadisticas internas o globales.
- Informacion interna de funcionarios.

Endpoints IA:

- `POST /api/v1/ia/chat`
- `POST /api/v1/ia/mi-informacion/chat`
- `GET /api/v1/ia/sugerencias`

## Vincular un usuario CONSULTA con su beneficiario

Al crear o editar el usuario, ADMIN puede enviar:

```json
{
  "nombreUsuario": "pepito.usuario",
  "nombreCompleto": "Pepito Perez",
  "clave": "ClaveSegura1234",
  "rol": "CONSULTA",
  "idBeneficiario": 15
}
```

Si un usuario `CONSULTA` ya existia antes de la migracion V5 y no tiene `idBeneficiario`, el asistente rechazara su consulta hasta que ADMIN actualice el usuario.

## Actividades o ayudas programadas cercanas

El asistente ya esta instruido para no inventar esta informacion. El backend actual no tiene un modulo de actividades/ayudas programadas con fecha, hora y lugar. Mientras ese modulo no exista, Gemini indicara que no dispone de esos datos.

## Ajustes RBAC V6

A partir de la migracion `V6__rbac_funcionario_duplicidad_consentimiento.sql`:

- `OPERADOR` debe tener `municipioAsignado` (`Apartadó`, `Turbo` o `Necoclí`).
- El backend valida el municipio en beneficiarios, familias, participaciones, atenciones y seguimientos.
- `OPERADOR` no puede desactivar/anular expedientes, validar ayudas, resolver duplicidades, importar/exportar masivamente ni consultar KPIs globales.
- Los posibles duplicados sin documento por nombre + fecha de nacimiento quedan `EN_REVISION_DUPLICIDAD` y solo `ADMIN` puede resolverlos.
- Todo beneficiario nuevo inicia con consentimiento `PENDIENTE`; el funcionario puede registrar el cambio, pero la trazabilidad queda auditada.
- Las ayudas quedan `PENDIENTE` hasta validacion del coordinador; Gemini no las presenta al beneficiario como recibidas hasta quedar `VALIDADA`.

Consulte `RBAC_URABA_PAIS.md` para la matriz completa y los endpoints.
