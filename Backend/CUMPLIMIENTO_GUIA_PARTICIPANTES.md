# Ajustes de cumplimiento - Guia para Participantes URABA-PAIS

Este proyecto conserva todos los modulos adicionales existentes (RBAC, auditoria, IA, importacion, deduplicacion, unificacion, seguridad, idempotencia y demas) y agrega unicamente lo necesario para cubrir de forma explicita los requisitos funcionales detectados en la guia.

## Cambios realizados

1. Programas: se agrego `lineaIntervencion`.
2. Participaciones: se agrego `estadoParticipacion` con los valores `INSCRITO`, `EN_PROCESO`, `FINALIZADO`, `RETIRADO`.
3. Atenciones/ayudas: se agregaron `descripcion`, `responsable`, `resultado` y `remision`, conservando `observaciones`.
4. Seguimientos: se agregaron `avanceNovedad` y `accionPendiente`, conservando los campos previos.
5. Ficha consolidada: el historial incorpora familia y una vista detallada de la participacion con datos del programa.
6. Reportes: se agregaron `beneficiariosUnicos`, `seguimientosPendientes` y `participacionesPorPrograma`; se conservan los indicadores existentes.
7. Base de datos: la migracion `V7__cumplimiento_guia_participantes.sql` amplia el esquema sin borrar datos ni columnas existentes.

## Compatibilidad

- No se eliminaron endpoints.
- No se retiraron campos anteriores.
- No se eliminaron modulos extra.
- Clientes antiguos que no envien `estadoParticipacion` continuan funcionando: el servicio usa `INSCRITO` por defecto.
- `observaciones` se mantiene en atenciones y seguimientos para no romper integraciones existentes.
