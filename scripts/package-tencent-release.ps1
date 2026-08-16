param(
  [string]$OutputDirectory = "local-deliveries/tencent-cloud",
  [string]$Version = ""
)

$ErrorActionPreference = "Stop"

if ([string]::IsNullOrWhiteSpace($Version)) {
  $Version = Get-Date -Format "yyyyMMdd-HHmmss"
}

Write-Host "Running release checks..."
npm run build
npm run check:i18n
npm run test:server
node --check server.mjs
git diff --check

$root = (Get-Location).Path
$stage = Join-Path $env:TEMP "qiongverse-tencent-$Version"
$archive = Join-Path (Join-Path $root $OutputDirectory) "qiongverse-$Version.tar.gz"

if (Test-Path $stage) { Remove-Item -LiteralPath $stage -Recurse -Force }
New-Item -ItemType Directory -Path $stage | Out-Null
New-Item -ItemType Directory -Path (Join-Path $stage "deploy") | Out-Null

$include = @(
  "dist",
  "knowledge",
  "server.mjs",
  "package.json",
  "package-lock.json",
  "index.html",
  "deploy/qiongverse.service.example",
  "deploy/Caddyfile.qiongverse.com.example",
  "deploy/tencent-cloud/install.sh",
  "deploy/tencent-cloud/README.md",
  "public/assets/social/luoyin-cg-vertical.mp4",
  "public/assets/travel/hainan-unfolded-hero.mp4"
)
foreach ($path in $include) {
  $source = Join-Path $root $path
  if (-not (Test-Path $source)) { throw "Required release path is missing: $path" }
  $destination = Join-Path $stage $path
  $parent = Split-Path -Parent $destination
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  Copy-Item -LiteralPath $source -Destination $destination -Recurse -Force
}

New-Item -ItemType Directory -Force -Path (Join-Path $root $OutputDirectory) | Out-Null
if (Test-Path $archive) { Remove-Item -LiteralPath $archive -Force }
tar -czf $archive -C $stage .

$hashOutput = & certutil.exe -hashfile $archive SHA256
$hash = ($hashOutput | Where-Object { $_ -match '^[0-9A-Fa-f]{64}$' } | Select-Object -First 1).Trim()
if ([string]::IsNullOrWhiteSpace($hash)) { throw "Unable to calculate SHA-256 for the release archive" }
$manifest = [ordered]@{
  version = $Version
  archive = (Resolve-Path $archive).Path
  sha256 = $hash
  excludes = @(".env", "node_modules", ".git", "GLM_API_KEY", "OAuth secrets", "local logs")
}
$manifest | ConvertTo-Json -Depth 4 | Set-Content -Encoding utf8 (Join-Path (Join-Path $root $OutputDirectory) "qiongverse-$Version.manifest.json")

Remove-Item -LiteralPath $stage -Recurse -Force
Write-Host "Release archive: $archive"
Write-Host "SHA-256: $hash"
