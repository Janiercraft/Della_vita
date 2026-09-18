$ErrorActionPreference = 'Stop'

Write-Host 'Estado del contenedor:' -ForegroundColor Cyan
docker compose ps postgres

Write-Host ''
Write-Host 'Prueba de autenticacion TCP con password:' -ForegroundColor Cyan
docker compose exec -T -e PGPASSWORD=123 postgres psql -h 127.0.0.1 -U beneficiarios -d beneficiarios -v ON_ERROR_STOP=1 -c "SELECT current_user, current_database(), version();"

Write-Host ''
Write-Host 'Tablas actuales:' -ForegroundColor Cyan
docker compose exec -T postgres psql -U beneficiarios -d beneficiarios -c '\dt'
