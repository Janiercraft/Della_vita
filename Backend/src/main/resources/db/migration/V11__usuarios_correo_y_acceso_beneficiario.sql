ALTER TABLE usuario ADD COLUMN IF NOT EXISTS correo VARCHAR(150);

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_correo_lower
ON usuario (LOWER(correo))
WHERE correo IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_usuario_nombre_lower
ON usuario (LOWER(nombre_usuario));

CREATE INDEX IF NOT EXISTS ix_usuario_rol_activo
ON usuario (rol, activo);
