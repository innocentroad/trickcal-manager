param(
  [string]$UnitEquipsTsv = "..\tmp\stat_prediction\unit_equips.tsv",
  [string]$OutputDir = "..\img\equipicons",
  [string]$BaseUrl = "https://img.kusoge.xyz/trickcal/equipicons"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$unitEquipsPath = Join-Path $scriptDir $UnitEquipsTsv
$outputPath = Join-Path $scriptDir $OutputDir

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

function Get-InferredEquipIcon {
  param([string]$EquipId)
  if ([string]::IsNullOrWhiteSpace($EquipId) -or $EquipId -notmatch "^\d{6}$") { return "" }
  $prefix = $EquipId.Substring(0, 2)
  $urlSuffix = $EquipId.Substring(3, 3)
  $type = switch ($prefix) {
    "11" { "Armor" }
    "12" { "Accessory" }
    "13" { "Weapon" }
    default { "" }
  }
  if ([string]::IsNullOrWhiteSpace($type)) { return "" }
  return "Equip_Icon_${type}${urlSuffix}"
}

function Convert-EquipIconToLocalName {
  param([string]$Icon)
  if ([string]::IsNullOrWhiteSpace($Icon)) { return "" }
  if ($Icon -match "^Equip_Icon_(Armor|Accessory|Weapon)(\d)(\d{2})$") {
    return "Equip_$($Matches[1])0$($Matches[2])$($Matches[3])"
  }
  if ($Icon -match "^Equip_(Armor|Accessory|Weapon)(\d{4})$") {
    return $Icon
  }
  return $Icon -replace "^Equip_Icon_", "Equip_"
}

if (-not (Test-Path $unitEquipsPath)) {
  throw "unit_equips.tsv not found: $unitEquipsPath"
}

$icons = New-Object System.Collections.Generic.SortedSet[string]
Import-Csv -Path $unitEquipsPath -Delimiter "`t" | ForEach-Object {
  $icon = [string]$_.equipIcon
  if ([string]::IsNullOrWhiteSpace($icon)) {
    $icon = Get-InferredEquipIcon ([string]$_.equipId)
  }
  if (-not [string]::IsNullOrWhiteSpace($icon)) {
    [void]$icons.Add($icon)
  }
}

$downloaded = 0
$skipped = 0
$failed = New-Object System.Collections.Generic.List[string]

foreach ($icon in $icons) {
  $localIcon = Convert-EquipIconToLocalName $icon
  $fileName = "$localIcon.webp"
  $destination = Join-Path $outputPath $fileName
  if (Test-Path $destination) {
    $skipped++
    continue
  }

  $url = "$BaseUrl/$icon.webp"
  try {
    Invoke-WebRequest -Uri $url -OutFile $destination -UseBasicParsing
    $downloaded++
  } catch {
    $failed.Add("$icon`t$($_.Exception.Message)")
  }
}

$failedPath = Join-Path $outputPath "_failed.tsv"
if ($failed.Count -gt 0) {
  @("icon`tmessage") + $failed | Set-Content -Path $failedPath -Encoding UTF8
} elseif (Test-Path $failedPath) {
  Remove-Item -Path $failedPath
}

[pscustomobject]@{
  Total = $icons.Count
  Downloaded = $downloaded
  Skipped = $skipped
  Failed = $failed.Count
  OutputDir = (Resolve-Path $outputPath).Path
}
