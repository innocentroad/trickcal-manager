param(
  [string]$BoardsJson = "..\..\tmp\soshage-boards-en.json",
  [string]$UnitsJson = "..\..\tmp\soshage-units-en.json",
  [string]$Output = "..\board-data.js"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$boardsPath = Join-Path $scriptDir $BoardsJson
$unitsPath = Join-Path $scriptDir $UnitsJson
$outputPath = Join-Path $scriptDir $Output

$boards = Get-Content -Raw $boardsPath | ConvertFrom-Json
$units = Get-Content -Raw $unitsPath | ConvertFrom-Json

$unitCompact = $units |
  Where-Object { $_.available } |
  Sort-Object uid |
  ForEach-Object {
    [pscustomobject]@{
      uid  = [int]$_.uid
      name = $_.name
      icon = $_.icon
    }
  }

$boardMap = [ordered]@{}
$null = $boards |
  Group-Object unit_uid |
  Sort-Object { [int]$_.Name } |
  ForEach-Object {
    $boardMap[$_.Name] = @(
      $_.Group |
        Sort-Object step, uid |
        ForEach-Object {
          [pscustomobject]@{
            uid        = [int]$_.uid
            step       = [int]$_.step
            type       = [int]$_.node_type
            stat       = $_.stat_type
            value      = $_.stat_value
            gold       = [int]$_.need_gold
            items      = $_.need_item_ids
            itemValues = $_.need_item_values
            x          = [int]$_.node_grid_x
            y          = [int]$_.node_grid_y
            needs      = $_.need_goods_array
          }
        }
    )
  }

$payload = [ordered]@{
  units  = $unitCompact
  boards = $boardMap
}

$json = $payload | ConvertTo-Json -Depth 12 -Compress
$header = @"
// Trickcal Damage Calculator - Board node data
// Generated from soshage public board API: https://soshage.com/ztrickapi/en/unit/board

"@

Set-Content -Path $outputPath -Value ($header + "const BOARD_NODE_DATA = " + $json + ";" + [Environment]::NewLine) -Encoding UTF8
Get-Item $outputPath
