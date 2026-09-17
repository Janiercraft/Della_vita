# Verificación del proyecto

Verificado el 17 de septiembre de 2026.

| Comprobación | Resultado |
|---|---|
| Compilación Java | 102 archivos de producción y 2 archivos de pruebas compilados con `javac --release 25`, sin errores |
| Java local | JDK 25.0.2 |
| Base de integración | PostgreSQL 17.11, instancia aislada de pruebas |
| Migraciones | Cuatro migraciones Flyway aplicadas y esquema validado por Hibernate |
| Pruebas | 33 ejecutadas, 33 correctas, 0 fallidas, 0 omitidas |
| Compose principal | `docker compose config --quiet`: correcto |
| Compose de pruebas | `docker compose config --quiet`: correcto |
| Imágenes Docker | Etiquetas de Maven/OpenJDK 25, Temurin 25 JRE y PostgreSQL 17 verificadas en el registro |
| Formato | 104 archivos Java formateados con indentación de cuatro espacios |

Las pruebas comprueban autenticación, roles, validación de campos, búsqueda sin documento, unicidad de documentos, versión de edición, desactivación, relaciones, participación por periodo, idempotencia de atenciones, carga CSV/Excel, carga multipart, importaciones concurrentes, reanudación, reporte de duplicados, casos de revisión, familias, integrantes, catálogos, seguimientos, unificación con historial, protección del último administrador, inmutabilidad de auditoría y ausencia de contraseñas en respuestas y auditoría.

La sesión de herramientas tuvo una restricción al resolver rutas canónicas de Windows en `Documents`. Por ese motivo no se declara una ejecución exitosa de `mvn clean test` en esta sesión. Maven resolvió el árbol de dependencias y después se compilaron las fuentes con el compilador de Java 25 y el procesador Lombok, y se ejecutaron las mismas pruebas JUnit sobre PostgreSQL mediante JUnit Platform. Las pruebas están incluidas y pueden ejecutarse normalmente con Maven o con el Compose de pruebas en el entorno del usuario.

No se construyeron ni arrancaron los contenedores Docker en esta sesión. La validación de Compose y de las etiquetas de imágenes no equivale a una prueba de despliegue en contenedores.

La guía DOCX y el Excel inicial estaban bloqueados por otro proceso. Se verificaron los requisitos del chat y datos sintéticos de prueba, no el contenido de esos dos archivos.
