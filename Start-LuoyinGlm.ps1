param(
  [SecureString]$ApiKey,
  [ValidateNotNullOrEmpty()]
  [string]$ListenHost = '127.0.0.1',
  [string]$AllowedOrigins = ''
)

$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path -Parent $PSCommandPath
$nodePath = Join-Path $env:ProgramFiles 'nodejs\node.exe'

if (-not (Test-Path -LiteralPath $nodePath)) {
  throw 'Node.js was not found at the expected location.'
}

if (-not $ApiKey) {
  $ApiKey = Read-Host -AsSecureString 'Enter GLM API key for this local service session'
}

$credentialPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($ApiKey)
try {
  $plainApiKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($credentialPointer)
  if ([string]::IsNullOrWhiteSpace($plainApiKey)) {
    throw 'A non-empty GLM API key is required.'
  }

  $existing = Get-NetTCPConnection -State Listen -LocalPort 8787 -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($existing) {
    Stop-Process -Id $existing.OwningProcess -Force
    Start-Sleep -Milliseconds 300
  }

  $env:GLM_API_KEY = $plainApiKey
  $env:LUOYIN_SERVER_PORT = '8787'
  $env:LUOYIN_SERVER_HOST = $ListenHost
  $env:LUOYIN_ALLOWED_ORIGINS = $AllowedOrigins
  Start-Process -FilePath $nodePath -ArgumentList 'server.mjs' -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'luoyin-server.log') -RedirectStandardError (Join-Path $projectRoot 'luoyin-server.err.log')
}
finally {
  if ($credentialPointer -ne [IntPtr]::Zero) {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($credentialPointer)
  }
  Remove-Item Env:GLM_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:LUOYIN_SERVER_PORT -ErrorAction SilentlyContinue
  Remove-Item Env:LUOYIN_SERVER_HOST -ErrorAction SilentlyContinue
  Remove-Item Env:LUOYIN_ALLOWED_ORIGINS -ErrorAction SilentlyContinue
}

Start-Sleep -Seconds 1
$status = Invoke-RestMethod -Uri 'http://127.0.0.1:8787/api/luoyin/status' -Method Get
if (-not $status.upstreamConfigured -or $status.model -ne 'GLM-4.6V-Flash') {
  throw 'The Luoyin service started, but GLM is not configured for this process.'
}

try {
  $probe = Invoke-RestMethod -Uri 'http://127.0.0.1:8787/api/luoyin' -Method Post -ContentType 'application/json' -Body '{"question":"Hello","language":"en","zoneId":"tropical"}'
  if ($probe.mode -ne 'glm') {
    throw 'The upstream GLM request did not return a live model response.'
  }
}
catch {
  $active = Get-NetTCPConnection -State Listen -LocalPort 8787 -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($active) {
    Stop-Process -Id $active.OwningProcess -Force
  }
  Remove-Item Env:GLM_API_KEY -ErrorAction SilentlyContinue
  Remove-Item Env:LUOYIN_SERVER_HOST -ErrorAction SilentlyContinue
  Remove-Item Env:LUOYIN_ALLOWED_ORIGINS -ErrorAction SilentlyContinue
  Start-Process -FilePath $nodePath -ArgumentList 'server.mjs' -WorkingDirectory $projectRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $projectRoot 'luoyin-server.log') -RedirectStandardError (Join-Path $projectRoot 'luoyin-server.err.log')
  throw 'GLM validation failed. Confirm the API key, endpoint access, and account availability, then run the script again.'
}

Write-Output 'Luoyin GLM service is running on http://127.0.0.1:8787'
