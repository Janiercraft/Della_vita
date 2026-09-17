ALTER TABLE beneficiario ADD COLUMN id_beneficiario_principal BIGINT REFERENCES beneficiario(id);
ALTER TABLE beneficiario ADD CONSTRAINT ck_principal_distinto CHECK (id_beneficiario_principal IS NULL OR id_beneficiario_principal <> id);
CREATE INDEX ix_beneficiario_principal ON beneficiario(id_beneficiario_principal);
