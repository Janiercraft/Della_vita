-- Integra campos utilizados por el frontend con persistencia real en PostgreSQL.
ALTER TABLE beneficiario
    ADD COLUMN IF NOT EXISTS tiene_discapacidad BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS observaciones VARCHAR(2000);

UPDATE beneficiario
SET tiene_discapacidad = TRUE
WHERE discapacidad IS NOT NULL AND BTRIM(discapacidad) <> '';

ALTER TABLE seguimiento
    ADD COLUMN IF NOT EXISTS responsable VARCHAR(200);

ALTER TABLE programa
    ADD COLUMN IF NOT EXISTS codigo VARCHAR(40),
    ADD COLUMN IF NOT EXISTS codigo_linea VARCHAR(40),
    ADD COLUMN IF NOT EXISTS organizacion_lider VARCHAR(250),
    ADD COLUMN IF NOT EXISTS meta_estimada INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS uq_programa_codigo_no_nulo
    ON programa(codigo)
    WHERE codigo IS NOT NULL;

-- Catálogo oficial utilizado por el frontend. Se inserta únicamente si no existe por nombre.
INSERT INTO programa (
    version, activo, dt_creacion, dt_actualizacion, usuario_creacion, usuario_actualizacion,
    codigo, nombre, codigo_linea, linea_intervencion, organizacion_lider, meta_estimada, descripcion
)
SELECT 0, TRUE, NOW(), NULL, 'flyway', NULL,
       'PR-HUM-01',
       'Ruta de Asistencia Humanitaria de Emergencia y Protección',
       'humanitarian',
       'Asistencia humanitaria y protección',
       'COOPI / Fondazione L’Albero della Vita / HIAS',
       6700,
       'Orientación en derechos, protección humanitaria, kits de emergencia y apoyo a necesidades inmediatas de familias vulnerables y migrantes.'
WHERE NOT EXISTS (
    SELECT 1 FROM programa WHERE nombre = 'Ruta de Asistencia Humanitaria de Emergencia y Protección'
);

INSERT INTO programa (
    version, activo, dt_creacion, dt_actualizacion, usuario_creacion, usuario_actualizacion,
    codigo, nombre, codigo_linea, linea_intervencion, organizacion_lider, meta_estimada, descripcion
)
SELECT 0, TRUE, NOW(), NULL, 'flyway', NULL,
       'PR-SAL-01',
       'Atención Psicosocial y Salud Mental Comunitaria',
       'health',
       'Salud y bienestar',
       'HIAS / Humanity & Inclusion (HI)',
       1800,
       'Acompañamiento psicosocial individual y familiar, primeros auxilios psicológicos y círculos comunitarios de sanación.'
WHERE NOT EXISTS (
    SELECT 1 FROM programa WHERE nombre = 'Atención Psicosocial y Salud Mental Comunitaria'
);

INSERT INTO programa (
    version, activo, dt_creacion, dt_actualizacion, usuario_creacion, usuario_actualizacion,
    codigo, nombre, codigo_linea, linea_intervencion, organizacion_lider, meta_estimada, descripcion
)
SELECT 0, TRUE, NOW(), NULL, 'flyway', NULL,
       'PR-SAL-02',
       'Salud Sexual, Reproductiva y Prevención de VBG',
       'health',
       'Salud y bienestar',
       'HIAS / HI',
       1111,
       'Orientación médica preventiva, talleres de salud sexual y reproductiva y activación de rutas de atención en violencia basada en género.'
WHERE NOT EXISTS (
    SELECT 1 FROM programa WHERE nombre = 'Salud Sexual, Reproductiva y Prevención de VBG'
);

INSERT INTO programa (
    version, activo, dt_creacion, dt_actualizacion, usuario_creacion, usuario_actualizacion,
    codigo, nombre, codigo_linea, linea_intervencion, organizacion_lider, meta_estimada, descripcion
)
SELECT 0, TRUE, NOW(), NULL, 'flyway', NULL,
       'PR-ECO-01',
       'Ruta de Emprendimiento y Medios de Vida Sostenibles',
       'economic',
       'Integración socioeconómica y cohesión social',
       'Fondazione L’Albero della Vita / HI',
       1000,
       'Capacitación en planes de negocio, capital semilla y fortalecimiento de iniciativas productivas para mujeres y jóvenes de Urabá.'
WHERE NOT EXISTS (
    SELECT 1 FROM programa WHERE nombre = 'Ruta de Emprendimiento y Medios de Vida Sostenibles'
);

INSERT INTO programa (
    version, activo, dt_creacion, dt_actualizacion, usuario_creacion, usuario_actualizacion,
    codigo, nombre, codigo_linea, linea_intervencion, organizacion_lider, meta_estimada, descripcion
)
SELECT 0, TRUE, NOW(), NULL, 'flyway', NULL,
       'PR-ECO-02',
       'Formación para la Empleabilidad e Inclusión de Discapacidad',
       'economic',
       'Integración socioeconómica y cohesión social',
       'Humanity & Inclusion / FADV',
       836,
       'Formación en habilidades laborales técnicas, intermediación de empleo y adaptaciones inclusivas para personas con discapacidad.'
WHERE NOT EXISTS (
    SELECT 1 FROM programa WHERE nombre = 'Formación para la Empleabilidad e Inclusión de Discapacidad'
);

-- Completa metadatos también cuando los programas ya existían antes de esta migración.
UPDATE programa SET codigo='PR-HUM-01', codigo_linea='humanitarian', linea_intervencion='Asistencia humanitaria y protección', organizacion_lider='COOPI / Fondazione L’Albero della Vita / HIAS', meta_estimada=6700
WHERE nombre='Ruta de Asistencia Humanitaria de Emergencia y Protección';
UPDATE programa SET codigo='PR-SAL-01', codigo_linea='health', linea_intervencion='Salud y bienestar', organizacion_lider='HIAS / Humanity & Inclusion (HI)', meta_estimada=1800
WHERE nombre='Atención Psicosocial y Salud Mental Comunitaria';
UPDATE programa SET codigo='PR-SAL-02', codigo_linea='health', linea_intervencion='Salud y bienestar', organizacion_lider='HIAS / HI', meta_estimada=1111
WHERE nombre='Salud Sexual, Reproductiva y Prevención de VBG';
UPDATE programa SET codigo='PR-ECO-01', codigo_linea='economic', linea_intervencion='Integración socioeconómica y cohesión social', organizacion_lider='Fondazione L’Albero della Vita / HI', meta_estimada=1000
WHERE nombre='Ruta de Emprendimiento y Medios de Vida Sostenibles';
UPDATE programa SET codigo='PR-ECO-02', codigo_linea='economic', linea_intervencion='Integración socioeconómica y cohesión social', organizacion_lider='Humanity & Inclusion / FADV', meta_estimada=836
WHERE nombre='Formación para la Empleabilidad e Inclusión de Discapacidad';
