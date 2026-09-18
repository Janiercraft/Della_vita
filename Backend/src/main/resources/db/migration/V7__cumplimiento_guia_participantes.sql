-- Campos adicionales para cubrir de forma explicita los requisitos de la Guia para Participantes.
-- No elimina ni renombra campos existentes; solo amplia el modelo.

ALTER TABLE programa ADD COLUMN linea_intervencion VARCHAR(150);

ALTER TABLE participacion
    ADD COLUMN estado_participacion VARCHAR(30) NOT NULL DEFAULT 'INSCRITO';
ALTER TABLE participacion
    ADD CONSTRAINT ck_estado_participacion
    CHECK (estado_participacion IN ('INSCRITO','EN_PROCESO','FINALIZADO','RETIRADO'));
CREATE INDEX ix_participacion_estado ON participacion(estado_participacion);

ALTER TABLE atencion ADD COLUMN descripcion VARCHAR(2000);
ALTER TABLE atencion ADD COLUMN responsable VARCHAR(200);
ALTER TABLE atencion ADD COLUMN resultado VARCHAR(2000);
ALTER TABLE atencion ADD COLUMN remision VARCHAR(1000);

-- Aprovecha observaciones existentes como descripcion inicial cuando ya hay datos cargados.
UPDATE atencion SET descripcion = observaciones WHERE descripcion IS NULL AND observaciones IS NOT NULL;

ALTER TABLE seguimiento ADD COLUMN avance_novedad VARCHAR(2000);
ALTER TABLE seguimiento ADD COLUMN accion_pendiente VARCHAR(2000);
