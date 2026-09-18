ALTER TABLE usuario ADD COLUMN municipio_asignado VARCHAR(150);

ALTER TABLE beneficiario ADD COLUMN estado_revision_duplicidad VARCHAR(40) NOT NULL DEFAULT 'APROBADO';
ALTER TABLE beneficiario ADD COLUMN estado_consentimiento VARCHAR(30) NOT NULL DEFAULT 'PENDIENTE';
ALTER TABLE beneficiario ADD CONSTRAINT ck_estado_revision_duplicidad
    CHECK (estado_revision_duplicidad IN ('APROBADO','EN_REVISION_DUPLICIDAD','DESCARTADO','FUSIONADO'));
ALTER TABLE beneficiario ADD CONSTRAINT ck_estado_consentimiento
    CHECK (estado_consentimiento IN ('PENDIENTE','OTORGADO','RECHAZADO','REVOCADO'));
CREATE INDEX ix_beneficiario_revision_duplicidad ON beneficiario(estado_revision_duplicidad);
CREATE INDEX ix_beneficiario_municipio ON beneficiario(municipio);

ALTER TABLE atencion ADD COLUMN estado_validacion_ayuda VARCHAR(30) NOT NULL DEFAULT 'NO_APLICA';
ALTER TABLE atencion ADD CONSTRAINT ck_estado_validacion_ayuda
    CHECK (estado_validacion_ayuda IN ('NO_APLICA','PENDIENTE','VALIDADA','RECHAZADA'));
CREATE INDEX ix_atencion_validacion_ayuda ON atencion(estado_validacion_ayuda);
