# Della Vita - URABA-PAIS

Backend para el hackathon de gestion de beneficiarios del proyecto **URABA-PAIS**
(COOPI, FADV / Albero della Vita, HIAS Colombia, Humanity & Inclusion).

Usa la base `Base_Beneficiarios_Hackathon.xlsx` (exportada a CSV interno).

## Stack

- OpenJDK 25
- Spring Boot 4 + JPA/Hibernate + Lombok
- PostgreSQL
- Docker Compose
- Swagger UI

## Dominio

| Entidad | Para que sirve |
|---|---|
| Beneficiario | Persona atendida (migrante, refugiado, desplazado, retornado, poblacion local) |
| Actividad | Kits, VBG, fondos, unidad movil, formacion, rehabilitacion (R1/R2/R3) |
| Atencion | Registro de ayuda/atencion con estado del caso |
| Dashboard | Resumen para jurados: municipio, organizacion, resultado, estado |

## Levantar

```
docker compose up --build
```

- API: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html
- Postgres: `localhost:5432` / user `dellavita` / pass `dellavita` / db `dellavita`

Al arrancar vacio, importa sola la base del hackathon.

## Endpoints clave (`/api/v1`)

### Beneficiarios
- `POST /beneficiarios/guardar`
- `POST /beneficiarios/editar`
- `POST /beneficiarios/cambiarEstado`
- `POST /beneficiarios/listar` (filtro: municipio, organizacion, tipoPoblacion, activo)

### Actividades
- `POST /actividades/guardar`
- `POST /actividades/editar`
- `POST /actividades/cambiarEstado`
- `POST /actividades/listar` (filtro: resultadoAsociado R1/R2/R3)

### Atenciones
- `POST /atenciones/guardar`
- `POST /atenciones/editar`
- `POST /atenciones/cambiarEstado` (Pendiente | Atendido | En seguimiento | Finalizado)
- `POST /atenciones/listar`
- `POST /atenciones/listarPorBeneficiario`

### Hackathon
- `POST /importacion/baseHackathon`
- `POST /dashboard/resumen`
