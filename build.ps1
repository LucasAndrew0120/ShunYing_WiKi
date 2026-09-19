$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

npm.cmd run build
if ($LASTEXITCODE -ne 0) {
  exit $LASTEXITCODE
}

npm.cmd run preview
exit $LASTEXITCODE
