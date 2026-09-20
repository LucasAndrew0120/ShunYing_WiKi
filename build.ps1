$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

$port = 6657
while (Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue) {
  $port++
}

Write-Host "Preview: http://localhost:$port/"
npm.cmd run preview -- --port $port
exit $LASTEXITCODE
