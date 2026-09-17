$ErrorActionPreference = 'Stop'

Write-Host 'Iniciando PostgreSQL de desarrollo...' -ForegroundColor Cyan
docker compose up -d postgres

# Espera a que PostgreSQL acepte conexiones dentro del contenedor.
$maxIntentos = 30
for ($i = 1; $i -le $maxIntentos; $i++) {
    docker compose exec -T postgres pg_isready -U beneficiarios -d beneficiarios *> $null
    if ($LASTEXITCODE -eq 0) { break }
    Start-Sleep -Seconds 1
}

if ($LASTEXITCODE -ne 0) {
    throw 'PostgreSQL no inicio correctamente.'
}

# Sincroniza la clave del rol incluso si el volumen fue creado anteriormente
# con otra contrasena. La conexion por socket dentro del contenedor permite
# reparar el entorno de desarrollo sin borrar los datos.
Write-Host 'Sincronizando credenciales locales...' -ForegroundColor Cyan
docker compose exec -T postgres psql -U beneficiarios -d beneficiarios -v ON_ERROR_STOP=1 -c "ALTER USER beneficiarios WITH PASSWORD '123';" | Out-Null

# Prueba real por TCP y con password, igual que hara Spring desde Windows.
Write-Host 'Verificando autenticacion TCP...' -ForegroundColor Cyan
docker compose exec -T -e PGPASSWORD=123 postgres psql -h 127.0.0.1 -U beneficiarios -d beneficiarios -v ON_ERROR_STOP=1 -c "SELECT 1;" | Out-Null

Write-Host ''
Write-Host 'PostgreSQL listo.' -ForegroundColor Green
Write-Host 'Host: 127.0.0.1'
Write-Host 'Puerto: 15432'
Write-Host 'Base: beneficiarios'
Write-Host 'Usuario: beneficiarios'
Write-Host 'Clave: 123'
