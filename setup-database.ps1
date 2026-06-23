# Configura la base de datos proyecto_taller en PostgreSQL
# Uso: .\setup-database.ps1 -Password "tu_contraseña_de_postgres"
# Opcional: .\setup-database.ps1 -Password "..." -Seed

param(
  [Parameter(Mandatory = $true)]
  [string]$Password,

  [switch]$Seed
)

$ErrorActionPreference = "Stop"
$psql = "C:\Program Files\PostgreSQL\18\bin\psql.exe"

if (-not (Test-Path $psql)) {
  Write-Error "No se encontró psql en $psql. Ajusta la ruta si instalaste otra versión."
}

$env:PGPASSWORD = $Password
$root = $PSScriptRoot

function Invoke-Psql {
  param([string[]]$PsqlArgs)
  & $psql @PsqlArgs
  if ($LASTEXITCODE -ne 0) {
    throw "psql falló (código $LASTEXITCODE). Revisa usuario/contraseña de PostgreSQL."
  }
}

Write-Host "Creando base de datos (si no existe)..."
Invoke-Psql -PsqlArgs @("-U", "postgres", "-h", "127.0.0.1", "-p", "5432", "-d", "postgres", "-f", "$root\create_database.sql")

Write-Host "Creando tablas..."
Invoke-Psql -PsqlArgs @("-U", "postgres", "-h", "127.0.0.1", "-p", "5432", "-d", "proyecto_taller", "-f", "$root\proyecto_taller_fixed.sql")

if ($Seed) {
  Write-Host "Insertando datos de ejemplo..."
  Invoke-Psql -PsqlArgs @("-U", "postgres", "-h", "127.0.0.1", "-p", "5432", "-d", "proyecto_taller", "-f", "$root\seed_taller_futbol.sql")
}

Write-Host ""
Write-Host "Listo. Base de datos proyecto_taller configurada."
Write-Host "Recuerda poner la misma contraseña en el archivo .env (DB_PASSWORD)."
