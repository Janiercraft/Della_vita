param(
    [string]$Url = 'http://localhost:8080',
    [string]$Usuario = $env:ADMIN_USER,
    [string]$Clave = $env:ADMIN_PASSWORD
)

# Requiere PowerShell 7. No guarda las credenciales en archivos.
if (-not $Usuario -or -not $Clave) {
    throw 'Define ADMIN_USER y ADMIN_PASSWORD, o pasa los parametros Usuario y Clave.'
}

$autorizacion = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes("${Usuario}:${Clave}"))
$cliente = [System.Net.Http.HttpClient]::new()
$contenido = [System.Net.Http.MultipartFormDataContent]::new()
try {
    $cliente.DefaultRequestHeaders.Authorization = [System.Net.Http.Headers.AuthenticationHeaderValue]::new('Basic', $autorizacion)
    $cliente.DefaultRequestHeaders.Add('X-Requested-With', 'gestion-beneficiarios')
    $bytesArchivo = [IO.File]::ReadAllBytes((Join-Path $PSScriptRoot 'beneficiarios.csv'))
    $parteArchivo = [System.Net.Http.ByteArrayContent]::new($bytesArchivo)
    $contenido.Add($parteArchivo, 'archivo', 'beneficiarios.csv')
    $mapeo = Get-Content -LiteralPath (Join-Path $PSScriptRoot 'mapeo.json') -Raw
    $parteMapeo = [System.Net.Http.StringContent]::new($mapeo, [Text.Encoding]::UTF8, 'application/json')
    $contenido.Add($parteMapeo, 'configuracion')
    $respuesta = $cliente.PostAsync("$Url/api/v1/importaciones", $contenido).GetAwaiter().GetResult()
    $cuerpo = $respuesta.Content.ReadAsStringAsync().GetAwaiter().GetResult()
    if (-not $respuesta.IsSuccessStatusCode) { throw $cuerpo }
    $resultado = $cuerpo | ConvertFrom-Json
    $resultado | ConvertTo-Json -Depth 10
    $id = $resultado.datos.id
    $reporte = $cliente.GetByteArrayAsync("$Url/api/v1/importaciones/$id/reporte").GetAwaiter().GetResult()
    $destinoReporte = Join-Path $PSScriptRoot "reporte-importacion-$id.csv"
    [IO.File]::WriteAllBytes($destinoReporte, $reporte)
    Write-Host "Reporte guardado en $destinoReporte"
}
finally {
    $contenido.Dispose()
    $cliente.Dispose()
}
