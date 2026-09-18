ALTER TABLE usuario
ADD COLUMN id_beneficiario BIGINT NULL;

ALTER TABLE usuario
ADD CONSTRAINT fk_usuario_beneficiario
FOREIGN KEY (id_beneficiario) REFERENCES beneficiario(id);

CREATE INDEX idx_usuario_id_beneficiario
ON usuario(id_beneficiario);
