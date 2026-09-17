# Backend de gestión de beneficiarios

Proyecto Java 25 y Spring Boot para registrar beneficiarios, programas, participaciones, atenciones, seguimientos y familias. Incluye CRUD, PostgreSQL, importación parcial de CSV/Excel, reporte de duplicados, seguridad y auditoría.

Se implementaron los requisitos acordados en el chat. La guía DOCX y la base XLSX proporcionadas estaban bloqueadas por otro proceso durante la revisión. No se afirma que sus columnas o reglas específicas hayan sido verificadas. El mapeo de columnas permite adaptar las cargas cuando estén disponibles.

## Arquitectura y estructura

Una aplicación desplegable, organizada por capas. No requiere dividirse en microservicios para este alcance. PostgreSQL es el servicio de persistencia, no un segundo microservicio de negocio.

```text
src/main/java/com/proyecto/
├── controller/       Endpoints, validación de solicitudes y respuestas
├── dto/              Objetos de entrada y salida con Lombok
├── model/            Entidades JPA
├── repository/       Todas las consultas JPA
├── service/          Interfaces de los servicios
│   └── impl/         Implementación explícita de las reglas
├── exception/        Excepciones y manejo centralizado de errores
├── config/           Configuración, OpenAPI y administrador inicial
├── security/         Autenticación, roles y trazabilidad HTTP
└── util/             Normalización y paginación
src/main/resources/
├── application.yml
└── db/migration/     Migraciones SQL versionadas con Flyway
src/test/java/com/proyecto/
```

Las clases se llaman `BeneficiarioServiceImpl`, `ProgramaController`, etc. `Category`, `Product` y `Review` eran ejemplos de estructura, no entidades de este problema. Los métodos y variables usan español: `guardar`, `editar`, `cambiarEstado`, `primerNombre`, `numeroDocumento`.

Se usa Spring MVC con JPA. Los métodos devuelven DTO y páginas convencionales: envolver una consulta bloqueante JPA en `Mono.just(...)` no la vuelve reactiva. Las clases están en paquetes normales, con nivel de lenguaje y bytecode 25, sin características preview. Los archivos compactos de Java no son necesarios para entidades o controladores con nombre y paquete.

## Tecnologías

| Componente | Configuración |
|---|---|
| Java | `release 25`; OpenJDK Eclipse Temurin 25 en Docker |
| Spring Boot | 3.5.13 |
| Persistencia | Spring Data JPA, Hibernate administrado por Spring Boot |
| Base de datos | PostgreSQL 17 |
| Lombok | 1.18.42, procesador de anotaciones configurado |
| Migraciones | Flyway, con soporte PostgreSQL |
| Documentación | OpenAPI y Swagger UI, springdoc 2.8.17 |
| Importaciones | Apache Commons CSV 1.14.1 y Apache POI 5.4.1 |
| Seguridad | Spring Security, BCrypt y roles |
| Pruebas | JUnit 5, MockMvc y PostgreSQL real |

Versiones y dependencias completas en `pom.xml`. Hibernate no se fija por separado para evitar incompatibilidades con el conjunto administrado por Spring Boot.

Referencias: [Java compatible con Spring Boot 3.5](https://docs.spring.io/spring-boot/3.5/system-requirements.html), [compatibilidad de springdoc](https://springdoc.org/v2/), [compatibilidad de Lombok](https://projectlombok.org/changelog).

## Arranque con Docker

Desde la raíz del proyecto:

```powershell
Copy-Item .env.example .env
# Establece claves propias en .env antes del primer arranque.
docker compose up --build -d
docker compose logs -f backend
```

Si `DB_USER`, `DB_PASSWORD`, `ADMIN_USER`, `ADMIN_PASSWORD` y `CORS_ORIGINS` ya están exportadas en tu terminal, Compose puede utilizarlas directamente. No es obligatorio duplicarlas en `.env`. No subas `.env` a Git.

- API: `http://localhost:8080/api/v1`
- Swagger: `http://localhost:8080/swagger-ui/index.html`
- Salud: `http://localhost:8080/actuator/health`

PostgreSQL conserva la información en el volumen `datos_postgres`. Para desarrollo local se publica únicamente en `127.0.0.1:15432`; dentro de Docker continúa usando el puerto `5432`. El backend se publica solo en `127.0.0.1:8080`. `docker compose down` detiene los servicios y conserva el volumen; no agregues `-v` si necesitas conservar sus datos.

## Arranque con Java y Maven instalados

Se aprovechan las instalaciones existentes; no es necesario reinstalarlas. Abre una terminal nueva para heredar las variables de entorno del sistema.

```powershell
java -version
mvn -version
# Si Maven no está en el PATH de esta terminal:
& "$env:MAVEN_HOME\bin\mvn.cmd" -version

# Primero prepara PostgreSQL local:
.\iniciar-postgres.ps1

# Luego puedes ejecutar:
mvn spring-boot:run
```

La URL local predeterminada es `jdbc:postgresql://127.0.0.1:15432/beneficiarios`, con usuario `beneficiarios` y clave de desarrollo `123`. El puerto `15432` evita colisiones con otro PostgreSQL instalado en Windows. Flyway crea y actualiza las tablas y `ddl-auto: validate` comprueba que el esquema coincida con las entidades.

| Variable | Uso |
|---|---|
| `DB_URL` | URL JDBC; Compose la configura para su servicio PostgreSQL |
| `DB_USER` | Usuario de PostgreSQL |
| `DB_PASSWORD` | Contraseña de PostgreSQL, sin valor secreto predeterminado |
| `ADMIN_USER` | Usuario inicial, predeterminado `administrador` |
| `ADMIN_PASSWORD` | Contraseña propia de al menos 12 caracteres para el primer arranque |
| `PORT` | Puerto HTTP, predeterminado 8080 |
| `CORS_ORIGINS` | Orígenes permitidos separados por coma |

El administrador inicial solo se crea cuando no hay usuarios. Cambiar `ADMIN_PASSWORD` después no reemplaza la contraseña almacenada: se modifica mediante el CRUD de usuarios. La clave BCrypt admite como máximo 72 bytes UTF-8.

## Autenticación y mensajes

La API usa HTTP Basic. En Swagger selecciona **Authorize** e introduce tus credenciales. En despliegues externos configura HTTPS en el proxy o servidor; la configuración entregada está orientada al uso local.

Las mutaciones requieren el encabezado `X-Requested-With: gestion-beneficiarios`. Swagger lo añade al contrato para que puedas enviarlo. La API no usa cookies de sesión; este encabezado impide mutaciones desde formularios externos que pudieran reutilizar autenticación Basic del navegador.

| Rol | Permisos |
|---|---|
| `CONSULTA` | Consultar fichas, historial y resumen |
| `OPERADOR` | CRUD de negocio, carga y consulta de importaciones |
| `ADMIN` | Lo anterior, usuarios, auditoría, decisiones de duplicados y unificación |

Ejemplo de respuesta:

```json
{
  "mensaje": "Se guardo correctamente",
  "datos": {"id": 1, "version": 0},
  "fecha": "2026-09-17T15:00:00Z",
  "solicitudId": "identificador-de-la-peticion"
}
```

Los errores de parámetros devuelven `400` con los campos correspondientes. Se usan `401`, `403`, `404`, `405`, `409`, `413` y `415` según el problema. Las fallas imprevistas devuelven un mensaje controlado y un identificador, sin exponer SQL o trazas al cliente.

Los logs SLF4J se imprimen en consola con `solicitudId`, operación e identificadores internos. Esto reemplaza los `System.out.println` dispersos y permite encontrar dónde falló una petición. No se registran cuerpos completos, contraseñas, documentos ni tokens en los logs.

## CRUD disponibles

Estos nueve recursos tienen `POST` para guardar, `GET` para listar, `GET /{id}` para consultar, `PUT /{id}` para editar y `PATCH /{id}/estado` para cambiar el estado:

| Recurso | Ruta bajo `/api/v1` |
|---|---|
| Beneficiarios | `/beneficiarios` |
| Programas | `/programas` |
| Participaciones | `/participaciones` |
| Atenciones | `/atenciones` |
| Seguimientos | `/seguimientos` |
| Familias | `/familias` |
| Integrantes | `/integrantes-familia` |
| Catálogos | `/catalogos` |
| Usuarios | `/usuarios` |

Los listados usan `pagina=0&tamanio=20`, con tamaño máximo 100. Los recursos de negocio permiten filtrar por `activo`. Beneficiarios añade `nombre` y `documento`. Las búsquedas por nombre ignoran diferencias de mayúsculas, acentos y espacios sobrantes.

Cada consulta devuelve `version`. Debes enviarla en `PUT` y `PATCH` para evitar sobrescribir cambios de otra persona. Una versión desactualizada devuelve `409`.

```json
{"activo": false, "version": 0, "motivo": "Retiro solicitado"}
```

La eliminación funcional es desactivación o anulación. No hay borrado físico de fichas, atenciones ni seguimientos. Las relaciones que identifican una participación o evento no se cambian al editar: se anula el registro y se crea uno nuevo.

Rutas adicionales:

| Método | Ruta | Función |
|---|---|---|
| GET | `/beneficiarios/{id}/historial` | Ficha, participaciones, atenciones y seguimientos paginados |
| POST | `/beneficiarios/unificar` | Unificación autorizada de dos fichas |
| GET | `/reportes/resumen` | Totales históricos, incluidos inactivos y anulados |
| GET | `/auditorias?entidad=Beneficiario&idRegistro=1` | Historial de cambios, solo administrador |
| POST | `/importaciones` | Cargar y procesar archivo |
| POST | `/importaciones/{id}/confirmar` | Procesar filas nuevas o reanudar una carga |
| GET | `/importaciones` | Listar cargas |
| GET | `/importaciones/{id}` | Resumen y conteos |
| GET | `/importaciones/{id}/filas?estado=DUPLICADO` | Filas y motivos, paginados |
| GET | `/importaciones/{id}/reporte` | Descargar reporte CSV completo |
| GET | `/importaciones/{id}/reporte?soloDuplicados=true` | Duplicados, coincidencias pendientes y vinculados |
| POST | `/importaciones/{id}/filas/{idFila}/resolver` | Resolver una coincidencia pendiente, solo administrador |

Consulta los cuerpos de todas las operaciones en Swagger y la colección de `ejemplos/gestion-beneficiarios.postman_collection.json`.

## Reglas de almacenamiento

- Una persona tiene código interno único. El documento es opcional; no se inventan números ni se usa cero para representar ausencia.
- Si se informa documento, tipo y número deben aparecer juntos. La combinación es única incluso para fichas inactivas. El número se guarda como texto.
- Tener el mismo nombre no impide el registro manual de otra persona. En importaciones, las coincidencias sin documento requieren revisión.
- Una participación es única por beneficiario, programa y periodo. Una persona puede ingresar al mismo programa en otro periodo.
- Una familia no puede repetir el mismo integrante.
- Atenciones y seguimientos admiten múltiples eventos reales. Al crearlos, envía `Idempotency-Key` con entre 8 y 100 letras, números, guiones o guiones bajos. Un reintento con la misma clave y cuerpo devuelve el registro anterior; una clave reutilizada con otros datos devuelve `409`. Una carrera simultánea puede devolver `409`; al reintentar con la misma clave recuperas el registro persistido.
- Se validan relaciones y se refuerzan con claves foráneas y restricciones en PostgreSQL.

La auditoría registra usuario autenticado, fecha, operación, motivo y valores anteriores/nuevos. No toma el usuario de auditoría de un campo enviado por el cliente. La tabla tiene un trigger que impide `UPDATE` y `DELETE`; no existe un endpoint para modificarla. Los administradores de la base conservan sus capacidades de administración, por lo que también deben restringirse sus accesos operativos.

## Carga parcial y reporte de duplicados

La carga importa fichas de **beneficiarios** desde CSV UTF-8, XLSX o XLS. Los archivos pueden proceder de cualquier sistema que exporte estos formatos. No se ejecutan archivos SQL ni se conectan arbitrariamente motores externos. Para otro origen se implementa `LectorArchivoService` y se convierte su contenido a filas con encabezados; las reglas de calidad y persistencia se reutilizan.

Las atenciones, participaciones, familias y demás entidades se registran mediante sus CRUD. Las columnas sin mapear se conservan en la fila original, pero no crean automáticamente registros de otras entidades.

`POST /api/v1/importaciones` recibe `multipart/form-data`:

- Parte `archivo`: archivo binario.
- Parte `configuracion`: JSON con `Content-Type: application/json`.
- Parámetro `confirmar`: `true` por defecto. Con `false` conserva las filas y valida su formato sin crear beneficiarios; la comparación contra la base ocurre al confirmar.

```json
{
  "mapeo": {
    "primerNombre": "Nombre",
    "primerApellido": "Apellido",
    "tipoDocumento": "Tipo",
    "numeroDocumento": "Documento"
  },
  "separador": ",",
  "hoja": 0
}
```

La clave del mapeo es el campo del sistema y el valor es el encabezado exacto del archivo. Campos disponibles: `primerNombre`, `segundoNombre`, `primerApellido`, `segundoApellido`, `tipoDocumento`, `numeroDocumento`, `fechaNacimiento`, `celular`, `municipio`, `direccion`.

Mapea al menos primer nombre y primer apellido. Las fechas de texto usan `AAAA-MM-DD`. Las fechas nativas de Excel se convierten a ese formato. Los documentos de Excel deben ser celdas de texto si contienen ceros iniciales o más de 15 dígitos: no se pueden recuperar dígitos que Excel ya haya redondeado. No se evalúan fórmulas; una fila con fórmula o error de Excel se reporta como error.

Límites: 10 MB, 10 000 filas y 200 columnas. La primera fila contiene encabezados únicos y no vacíos; el prefijo `__` está reservado. El CSV admite coma, punto y coma, barra vertical o tabulador como separador. El índice de hoja Excel empieza en cero.

| Resultado | Comportamiento |
|---|---|
| `IMPORTADO` | Se guardó una ficha nueva |
| `DUPLICADO` | Mismo tipo/número de documento y datos compatibles; se omite sin sobrescribir |
| `PENDIENTE` | Documento contradictorio o posible coincidencia por nombre; no se crea ni fusiona automáticamente |
| `ERROR` | Datos inválidos; las demás filas continúan |
| `VINCULADO` | Un administrador confirmó que corresponde a una ficha existente |
| `OMITIDO` | Un administrador decidió no incorporar la fila |
| `NUEVO` | Fila guardada temporalmente, aún no procesada |

La comparación incluye registros creados por filas anteriores del mismo archivo y fichas existentes. Un nombre igual con dos documentos distintos no se descarta como duplicado. La sugerencia aproximada compara hasta 200 candidatos por prefijo/apellido y admite hasta dos cambios en el nombre completo; no es una identificación biométrica ni una garantía de detectar todas las variantes. Se muestran hasta 20 candidatos para revisión.

Cada fila se confirma en su propia transacción. Un error de validación o duplicado no revierte las filas correctas. Si falla la infraestructura, las filas ya confirmadas quedan guardadas y puedes llamar nuevamente a `/confirmar` para procesar las que sigan en `NUEVO`.

La huella del archivo y su configuración evita repetir una carga idéntica. Si cambias el archivo o el mapeo se crea otro lote, que vuelve a comparar contra la base. No se actualizan fichas existentes automáticamente.

El reporte contiene número de fila, estado, motivo, identificador de beneficiario, candidatos, valores originales y normalizados. Los reportes tienen datos personales: su descarga está restringida a operadores y administradores.

Para resolver una coincidencia:

```json
{"accion": "VINCULAR", "idBeneficiario": 1, "motivo": "Identidad verificada presencialmente"}
```

También admite `CREAR` si se verificó que es otra persona, u `OMITIR`. No permite crear un documento que ya exista ni vincular documentos distintos. Las filas `ERROR` se corrigen en el archivo y se cargan nuevamente; no se alteran sus valores originales guardados.

## Unificación de fichas existentes

Solo un administrador puede ejecutar:

```json
{
  "idOrigen": 2,
  "idDestino": 1,
  "versionOrigen": 0,
  "versionDestino": 0,
  "motivo": "Se confirmó que ambas fichas pertenecen a la misma persona"
}
```

Se conserva la ficha original, se desactiva y se vincula mediante `idBeneficiarioPrincipal`. Sus relaciones y datos históricos permanecen intactos. El historial del principal incluye las participaciones, atenciones y seguimientos de sus fichas unificadas. No se copian ni se suman eventos artificialmente, ni se sobrescriben los datos de la ficha de destino.

No se permite reactivar o editar directamente una ficha unificada, ni unificar documentos distintos sin corregir primero esa discrepancia. Las membresías familiares originales siguen vinculadas a la ficha de origen, que señala a su principal. La unificación no borra participaciones coincidentes: conserva su procedencia para revisión. Las nuevas participaciones se registran en la ficha principal.

## Pruebas

```powershell
# Pruebas unitarias, sin requerir una base de datos:
mvn test

# Pruebas de integración: utiliza una base VACIA dedicada a pruebas.
$env:TEST_DB_URL = 'jdbc:postgresql://localhost:5432/beneficiarios_pruebas'
$env:TEST_DB_USER = 'usuario_de_pruebas'
$env:TEST_DB_PASSWORD = 'clave_de_pruebas'
mvn test
```

Las pruebas de integración se omiten si `TEST_DB_URL` no está definida. Cuando está definida, crean registros de prueba y ejecutan migraciones; nunca la apuntes a una base real de beneficiarios.

Alternativa aislada con Docker:

```powershell
docker compose -f compose.pruebas.yml up --build --abort-on-container-exit --exit-code-from pruebas
docker compose -f compose.pruebas.yml down
```

La base de pruebas de este Compose no usa el volumen de producción. Los resultados de la verificación realizada están en `VERIFICACION.md`.

## Ampliaciones

La estructura permite añadir entidades y lectores sin concentrar todas las reglas en una clase. No existe una estructura que resuelva cualquier situación sin cambios: conexiones directas a otros motores, cargas masivas mayores al límite, importación de eventos con otros esquemas y reglas específicas de la guía requieren sus adaptadores o ampliaciones de negocio.

## Desarrollo con VS Code (botón Run/F5)

El proyecto está preparado para ejecutar **Spring Boot localmente desde VS Code** y mantener **PostgreSQL en Docker**.

1. Inicia solo PostgreSQL:

```powershell
./iniciar-postgres.ps1
```

O manualmente:

```powershell
.\iniciar-postgres.ps1
```

2. Abre `src/main/java/com/proyecto/ProyectoApplication.java`.
3. Pulsa **Run** o **F5** y selecciona `Run ProyectoApplication`.

La ejecución local usa:

- URL: `jdbc:postgresql://127.0.0.1:15432/beneficiarios`
- Usuario: `beneficiarios`
- Clave: `123`
- API: `http://localhost:8080`
- Admin: `administrador`
- Clave admin local: `aguapanela12`

Para comprobar las tablas:

```powershell
./verificar-db.ps1
```

## Ejecución completa con Docker

```powershell
docker compose up -d --build
```

El servicio `backend` activa automáticamente el perfil `docker`, que usa el hostname interno `postgres` y las variables de `.env`.

> No uses `docker compose down -v` salvo que realmente quieras borrar la base de datos y recrear el volumen desde cero.
