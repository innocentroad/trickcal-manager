param(
  [string]$UnitsJson = "..\..\unit.json",
  [string]$BoardsJson = "..\..\site\board_nama.json",
  [string]$ApostlesJs = "..\apostles.js",
  [string]$OutputDir = "..\tmp\stat_prediction",
  [string]$BoardNodeOverrides = "board-node-overrides.tsv"
)

$ErrorActionPreference = "Stop"

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$unitsPath = Join-Path $scriptDir $UnitsJson
$boardsPath = Join-Path $scriptDir $BoardsJson
$apostlesPath = Join-Path $scriptDir $ApostlesJs
$outputPath = Join-Path $scriptDir $OutputDir
$boardNodeOverridesPath = Join-Path $scriptDir $BoardNodeOverrides

New-Item -ItemType Directory -Force -Path $outputPath | Out-Null

function Export-Tsv {
  param(
    [Parameter(Mandatory = $true)] [object[]]$Rows,
    [Parameter(Mandatory = $true)] [string]$Path
  )
  $Rows | Export-Csv -Path $Path -Delimiter "`t" -NoTypeInformation -Encoding UTF8
}

function Split-List {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return @() }
  return @($Value -split "," | ForEach-Object { $_.Trim() })
}

function Format-DisplayNumber {
  param([string]$Value)
  if ([string]::IsNullOrWhiteSpace($Value)) { return "" }
  $num = 0.0
  if (-not [double]::TryParse($Value, [ref]$num)) { return $Value }
  if ([math]::Abs($num - [math]::Round($num)) -lt 0.000001) { return ([string][int][math]::Round($num)) }
  return $Value
}

function Get-StatName {
  param([string]$Code)
  $map = @{
    "0" = ""
    "1" = "HP"
    "3" = "物理攻撃力"
    "4" = "魔法攻撃力"
    "5" = "物理防御力"
    "6" = "魔法防御力"
    "7" = "会心"
    "8" = "会心DMG"
    "9" = "会心抵抗"
    "10" = "会心DMG抵抗"
    "86" = "物理攻撃力%"
    "87" = "魔法攻撃力%"
    "88" = "物理防御力%"
    "89" = "魔法防御力%"
    "90" = "会心%"
    "91" = "会心DMG%"
    "92" = "会心抵抗%"
    "93" = "会心DMG抵抗%"
    "94" = "HP%"
    "95" = "攻撃力%"
    "96" = "防御力%"
    "97" = "会心系%"
    "98" = "抵抗系%"
    "99" = "物理/魔法防御%"
    "100" = "防御系%"
    "101" = "会心/会心抵抗%"
    "102" = "会心DMG/会心DMG抵抗%"
    "103" = "全体系%"
  }
  if ($map.ContainsKey($Code)) { return $map[$Code] }
  return ""
}

function Get-BoardNodeTypeName {
  param([string]$Code)
  $map = @{
    "1" = "Step開始"
    "2" = "開始/接続"
    "3" = "通常"
    "4" = "複合/大"
    "5" = "特殊/大"
  }
  if ($map.ContainsKey($Code)) { return $map[$Code] }
  return ""
}

function Get-BoardStatName {
  param(
    [string]$Code,
    [string]$NodeType
  )
  if ($NodeType -eq "4") {
    # Large compound nodes use board stat codes, not the normal stat table.
    $map = @{
      "86" = "全体物理攻撃力"
      "87" = "全体魔法攻撃力"
      "90" = "全体魔法防御力"
      "91" = "全体物理防御力"
      "94" = "全体HP"
      "96" = "全体会心DMG"
      "98" = "会心抵抗"
      "100" = "全体会心"
      "102" = "会心DMG抵抗"
    }
    if ($map.ContainsKey($Code)) { return $map[$Code] }
  }
  if ($NodeType -eq "5") {
    # Large special nodes store percent values as tenths: 30 => 3%.
    $map = @{
      "88" = "全体物理攻撃力%"
      "89" = "全体魔法攻撃力%"
      "92" = "全体魔法防御力%"
      "93" = "全体物理防御力%"
      "95" = "全体攻撃力%"
      "97" = "全体会心%"
      "99" = "会心抵抗%"
      "101" = "全体会心DMG%"
      "103" = "会心DMG抵抗%"
    }
    if ($map.ContainsKey($Code)) { return $map[$Code] }
  }
  return Get-StatName $Code
}

function Format-BoardStatValue {
  param(
    [string]$Value,
    [string]$NodeType
  )
  if ($NodeType -ne "5") { return (Format-DisplayNumber $Value) }
  $num = 0.0
  if (-not [double]::TryParse($Value, [ref]$num)) { return $Value }
  return (Format-DisplayNumber ([string]($num / 10.0)))
}

function Format-StatEffect {
  param(
    [object[]]$StatCodes,
    [object[]]$Values,
    [string]$NodeType = ""
  )
  $parts = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $StatCodes.Count; $i++) {
    $code = [string]$StatCodes[$i]
    $name = Get-BoardStatName $code $NodeType
    $value = if ($Values.Count -gt $i) { [string]$Values[$i] } else { "" }
    if ([string]::IsNullOrWhiteSpace($name) -or [string]::IsNullOrWhiteSpace($value)) { continue }
    $num = 0.0
    if ([double]::TryParse($value, [ref]$num) -and [math]::Abs($num) -lt 0.000001) { continue }
    $displayValue = Format-BoardStatValue $value $NodeType
    if ($name.EndsWith("%")) {
      $parts.Add(("{0}+{1}%" -f $name.TrimEnd("%"), $displayValue))
    } else {
      $parts.Add(("{0}+{1}" -f $name, $displayValue))
    }
  }
  if ($parts.Count -eq 0) { return "" }
  return ($parts -join " / ")
}

function Format-BoardCost {
  param(
    [object[]]$ItemIds,
    [object[]]$ItemValues,
    [string]$Gold,
    [hashtable]$ItemMap,
    [hashtable]$Fallback
  )
  $parts = New-Object System.Collections.Generic.List[string]
  $goldValue = 0.0
  if ([double]::TryParse([string]$Gold, [ref]$goldValue) -and $goldValue -gt 0) {
    $parts.Add(("ゴールド:{0}" -f (Format-DisplayNumber $Gold)))
  }
  for ($i = 0; $i -lt $ItemIds.Count; $i++) {
    $id = [string]$ItemIds[$i]
    if ([string]::IsNullOrWhiteSpace($id) -or $id -eq "0") { continue }
    $name = Get-NameForId $id $ItemMap $Fallback
    if ([string]::IsNullOrWhiteSpace($name)) { $name = "item:$id" }
    $count = if ($ItemValues.Count -gt $i) { [string]$ItemValues[$i] } else { "" }
    $parts.Add(("{0}:{1}" -f $name, (Format-DisplayNumber $count)))
  }
  return ($parts -join " / ")
}

function Get-ApostleLibrary {
  param([string]$Path)
  $text = Get-Content -Raw $Path
  $match = [regex]::Match($text, "const\s+APOSTLE_LIBRARY\s*=\s*(\[[\s\S]*?\]);")
  if (-not $match.Success) { return @() }
  return @($match.Groups[1].Value | ConvertFrom-Json)
}

$units = @(Get-Content -Raw $unitsPath | ConvertFrom-Json)
$boards = @(Get-Content -Raw $boardsPath | ConvertFrom-Json)
$apostles = Get-ApostleLibrary -Path $apostlesPath

$boardNodeOverrideMap = @{}
if (Test-Path $boardNodeOverridesPath) {
  Import-Csv -Path $boardNodeOverridesPath -Delimiter "`t" | ForEach-Object {
    if (-not [string]::IsNullOrWhiteSpace($_.nodeUid) -and -not [string]::IsNullOrWhiteSpace($_.nodeLabelOverride)) {
      $boardNodeOverrideMap[[string]$_.nodeUid] = $_
    }
  }
}

function Add-ItemFromObject {
  param(
    [object]$Value,
    [hashtable]$Map
  )
  if ($null -eq $Value) { return }
  if ($Value -is [System.Array]) {
    foreach ($item in $Value) { Add-ItemFromObject $item $Map }
    return
  }
  if ($Value -is [pscustomobject]) {
    $props = @($Value.PSObject.Properties.Name)
    if ($props -contains "uid" -and $props -contains "name") {
      $uid = [string]$Value.uid
      if ($uid -match "^\d+$" -and -not $Map.ContainsKey($uid)) {
        $Map[$uid] = $Value
      }
    }
    foreach ($prop in $Value.PSObject.Properties) {
      Add-ItemFromObject $prop.Value $Map
    }
  }
}

function Get-ItemSummary {
  param([object]$Item)
  if ($null -eq $Item) { return "" }
  $stats = Split-List $Item.stat
  if ($stats.Count -eq 0) { return "" }
  $indexName = @{
    1 = "HP"
    5 = "物理攻撃力"
    6 = "魔法攻撃力"
    7 = "物理防御力"
    8 = "魔法防御力"
    9 = "会心"
    10 = "会心DMG"
    11 = "会心抵抗"
    12 = "会心DMG抵抗"
  }
  $parts = New-Object System.Collections.Generic.List[string]
  for ($i = 0; $i -lt $stats.Count; $i++) {
    $raw = $stats[$i]
    $num = 0.0
    if ([double]::TryParse($raw, [ref]$num) -and [math]::Abs($num) -gt 0.000001) {
      $index = $i + 1
      $name = if ($indexName.ContainsKey($index)) { $indexName[$index] } else { "stat$index" }
      $parts.Add(("{0}:{1}" -f $name, $raw))
    }
  }
  return ($parts -join ", ")
}

function Get-EquipIdInfo {
  param([string]$EquipId)
  $result = [ordered]@{
    category = ""
    rank = ""
    variant = ""
  }
  if ($EquipId -notmatch "^\d{6}$") { return [pscustomobject]$result }
  $prefix = $EquipId.Substring(0, 2)
  $categoryMap = @{
    "11" = "防具"
    "12" = "アクセサリー"
    "13" = "武器"
  }
  $result.category = if ($categoryMap.ContainsKey($prefix)) { $categoryMap[$prefix] } else { "" }
  $result.rank = [int]$EquipId.Substring(2, 2)
  $result.variant = [int]$EquipId.Substring(4, 2)
  return [pscustomobject]$result
}

function Get-NameForId {
  param(
    [string]$Id,
    [hashtable]$Map,
    [hashtable]$Fallback
  )
  if ([string]::IsNullOrWhiteSpace($Id) -or $Id -eq "0") { return "" }
  if ($Map.ContainsKey($Id)) { return $Map[$Id].name }
  if ($Fallback.ContainsKey($Id)) { return $Fallback[$Id] }
  return ""
}

$itemMap = @{}
foreach ($jsonPath in @(
  (Join-Path $scriptDir "..\..\tmp\meluna-10033-ja.json"),
  (Join-Path $scriptDir "..\..\tmp\meluna-unit.json")
)) {
  if (Test-Path $jsonPath) {
    $json = Get-Content -Raw $jsonPath | ConvertFrom-Json
    Add-ItemFromObject $json $itemMap
  }
}

$itemFallback = @{
  "610001" = "クレヨン1"
  "610002" = "クレヨン2"
  "610003" = "クレヨン3"
  "610004" = "クレヨン4"
  "4300000" = "ボードStep1解放素材"
}

$wikiEquipRankRows = @(
  @{ rank = 1; statGroup = "HP"; names = "赤いエプロン|赤いスカート|普通のホームウェア|古ぼけたマント|首元が伸びたTシャツ"; values = "1707|2434|3162|3889|4616" },
  @{ rank = 1; statGroup = "物理攻撃力"; names = "おもちゃのメリケンサック|赤い鉛筆|ミニ水鉄砲|硬いバケット|ボクサーグローブ"; values = "180|200|220|239|259" },
  @{ rank = 1; statGroup = "魔法攻撃力"; names = "壊れた傘|スリング|古いおたま|小さなパン切り包丁|エナジードリンク"; values = "180|200|220|239|259" },
  @{ rank = 1; statGroup = "物理防御力"; names = "リサイクル紙袋|急ごしらえの三角帽子|赤い布のベルト|ゴムのショートパンツ|赤い首浮き輪"; values = "361|401|441|480|520" },
  @{ rank = 1; statGroup = "魔法防御力"; names = "古いスリッパ|普通のスリッパ|水中メガネ|小さな仮面|古いメガネ"; values = "361|401|441|480|520" },
  @{ rank = 1; statGroup = "会心/会心DMG"; names = "古いヘアブラシ|糸の腕輪|古いバンド|糸の指輪|アメ玉の指輪"; values = "270|300|330|359|389" },
  @{ rank = 1; statGroup = "会心抵抗/会心DMG抵抗"; names = "あめ玉の耳飾り|古い小銭入れ|冷却ネックカバー|古いコップ|くるくるキャンディの首飾り"; values = "270|300|330|359|389" },

  @{ rank = 2; statGroup = "HP"; names = "可愛いエプロン|リボン付きスカート|ボーダー柄のホームウェア|ミニマント|足跡シャツ"; values = "2443|3484|4525|5565|6606" },
  @{ rank = 2; statGroup = "物理攻撃力"; names = "ケーキ用パン切り包丁|ミニイルカ水鉄砲|ライ麦バゲット|消しゴム付き鉛筆|バイク用グローブ"; values = "258|286|315|343|371" },
  @{ rank = 2; statGroup = "魔法攻撃力"; names = "狙撃スリング|高級レーザーポインター|自動開閉傘|プラスチックのおたま|金属のメリケンサック"; values = "258|286|315|343|371" },
  @{ rank = 2; statGroup = "物理防御力"; names = "パンの香りが漂うパン袋|金箔の三角帽子|流行遅れのベルト|バックル付きショートパンツ|可愛い首浮き輪"; values = "517|574|631|687|744" },
  @{ rank = 2; statGroup = "魔法防御力"; names = "室内用スリッパ|カチューシャ|ハート形の水中メガネ|装飾仮面|優等生メガネ"; values = "517|574|631|687|744" },
  @{ rank = 2; statGroup = "会心/会心DMG"; names = "斧形のヘアブラシ|結び目の腕輪|柔らかバンド|捨てられた指輪|宝石キャンディの指輪"; values = "387|429|472|514|556" },
  @{ rank = 2; statGroup = "会心抵抗/会心DMG抵抗"; names = "ぐるぐるキャンディの耳飾り|丈夫な小銭入れ|登山用ネックカバー|歯磨き用コップ|アメ玉の首飾り"; values = "387|429|472|514|556" },

  @{ rank = 3; statGroup = "HP"; names = "リボン付きエプロン|ハート柄のスカート|チェック柄のホームウェア|飛行マント|新品のシャツ"; values = "3496|4985|6475|7964|9453" },
  @{ rank = 3; statGroup = "物理攻撃力"; names = "綿菓子のメリケンサック|ギフトでもらった鉛筆|ラーメン職人のおたま|栗のグローブ|最年長バゲット"; values = "369|410|451|491|532" },
  @{ rank = 3; statGroup = "魔法攻撃力"; names = "派手なパン切り包丁|ストライク|ペパミタンD|アクアコルト|華やかなマイク"; values = "369|410|451|491|532" },
  @{ rank = 3; statGroup = "物理防御力"; names = "改良プレゼント袋|誕生日ケーキ帽子|スエードベルト|冒険家のショートパンツ|花形首浮き輪"; values = "740|821|903|984|1065" },
  @{ rank = 3; statGroup = "魔法防御力"; names = "ダブルウィングの水中メガネ|ボーダー柄カチューシャ|ダブルスターの水中メガネ|パーティーの仮面|翼飾りのメガネ"; values = "740|821|903|984|1065" },
  @{ rank = 3; statGroup = "会心/会心DMG"; names = "プロミスバンドの腕輪|古いハンドミラー|丈夫なバンド|関節注意指輪|ガラスキャンディの指輪"; values = "553|614|675|735|796" },
  @{ rank = 3; statGroup = "会心抵抗/会心DMG抵抗"; names = "ミニポーチ|手作りネックカバー|ボーダー柄の歯磨き用コップ|手作りキャンディ首飾り|鉄製のヘアブラシ"; values = "553|614|675|735|796" },

  @{ rank = 4; statGroup = "HP"; names = "料理用エプロン|春色のワンピース|ワンピースパジャマ|怪しいデザインのマント|春色のパーカー"; values = "5003|7134|9266|11397|13528" },
  @{ rank = 4; statGroup = "物理攻撃力"; names = "メリケンサックグローブ|ニャンパン|壊れた万年筆|トウモロコシ脱穀手袋|クロレラバゲット"; values = "528|586|645|703|761" },
  @{ rank = 4; statGroup = "魔法攻撃力"; names = "アウトドアの懐中電灯|あなタ？ヌキマイク|モンスター！打破|パーティーケーキ包丁|アクアショットガン"; values = "528|586|645|703|761" },
  @{ rank = 4; statGroup = "物理防御力"; names = "旧式の目出し帽|春色の花冠|ミニラビットベルト|ジャージパンツ|スプリング救命胴衣"; values = "1059|1175|1292|1408|1524" },
  @{ rank = 4; statGroup = "魔法防御力"; names = "春色の靴|クマ耳のカチューシャ|カエルの水中メガネ|クマの仮面|ワンポイントサングラス"; values = "1059|1175|1292|1408|1524" },
  @{ rank = 4; statGroup = "会心/会心DMG"; names = "革の腕輪|春色のハンドミラー|腕時計バンド|分離されたメリケンサック|ウサギの宝石の指輪"; values = "792|879|966|1052|1139" },
  @{ rank = 4; statGroup = "会心抵抗/会心DMG抵抗"; names = "クマのポーチ|スプリングマフラー|プラスチックの歯磨き用コップ|ウサギの首飾り|ツボ押し兼用ヘアブラシ"; values = "792|879|966|1052|1139" },

  @{ rank = 5; statGroup = "HP"; names = "小さなレディのエプロン|新緑のワンピース|新緑のワンピースパジャマ|オペラマント|長袖パーカー"; values = "7160|10210|13260|16309|19359" },
  @{ rank = 5; statGroup = "物理攻撃力"; names = "作家の万年筆|アクアスプラッシュ|そよ風メリケンサック|クリーム分割バゲット|そよ風の手袋"; values = "756|839|923|1006|1089" },
  @{ rank = 5; statGroup = "魔法攻撃力"; names = "三球三振|夜行キノコの懐中時計|スターパン|風切り|キュウリダー"; values = "756|839|923|1006|1089" },
  @{ rank = 5; statGroup = "物理防御力"; names = "グリーンハートサングラス|匿名保証の目出し帽|野花の花冠|作業ズボン|緑の救命胴衣"; values = "1516|1682|1849|2015|2181" },
  @{ rank = 5; statGroup = "魔法防御力"; names = "リボン付き靴|緑のスニーカー|ウサギ耳のカチューシャ|フグの水中メガネ|ヒツジの仮面"; values = "1516|1682|1849|2015|2181" },
  @{ rank = 5; statGroup = "会心/会心DMG"; names = "ストラップの腕輪|新緑のハンドミラー|金属バックルの腕時計|絶対の指輪|キツネ宝石の指輪"; values = "1133|1257|1382|1506|1630" },
  @{ rank = 5; statGroup = "会心抵抗/会心DMG抵抗"; names = "ミニラビットポーチ|ねじねじマフラー|高級歯磨き用コップ|キツネの首飾り|ふわふわブラシ"; values = "1133|1257|1382|1506|1630" },

  @{ rank = 6; statGroup = "HP"; names = "フリルエプロン|ピクニックワンピース|パーティー用ワンピースパジャマ|キラキラフリルマント|スーパーニャンパーカー"; values = "10246|14610|18975|23339|27703" },
  @{ rank = 6; statGroup = "物理攻撃力"; names = "彗星ブレード|騎士のメリケンサック|怒れるパン職人のバゲット|双翼の万年筆|クラウドグローブ"; values = "1083|1202|1321|1439|1558" },
  @{ rank = 6; statGroup = "魔法攻撃力"; names = "ウサギ飾りの傘|三者凡退|双翼のパン|ブルーレモネード|アクアクラッシュ"; values = "1083|1202|1321|1439|1558" },
  @{ rank = 6; statGroup = "物理防御力"; names = "スキー用目出し帽|空の花の花冠|星飾りのベルト|ロックスタージーンズ|星飾りの救命胴衣"; values = "2169|2407|2646|2884|3122" },
  @{ rank = 6; statGroup = "魔法防御力"; names = "ウィングスニーカー|スーパーニャンカチューシャ|ダックウィングシュノーケル|ライオンの仮面|フェイクサングラス"; values = "2169|2407|2646|2884|3122" },
  @{ rank = 6; statGroup = "会心/会心DMG"; names = "バックルの腕輪|清明のハンドミラー|健康チェック腕時計|祈願の指輪|ライオン宝石の指輪"; values = "1621|1799|1978|2156|2334" },
  @{ rank = 6; statGroup = "会心抵抗/会心DMG抵抗"; names = "ミニニャンニャンポーチ|心を込めた手作りマフラー|キュートカップ|ライオンの首飾り|ミニロールブラシ"; values = "1621|1799|1978|2156|2334" },

  @{ rank = 7; statGroup = "HP"; names = "工芸家のエプロン|サマードレス|キュートラビットパジャマ|見習い魔法使いのマント|キュートラビットフード付きジャンパー"; values = "14662|20907|27153|33398|39643" },
  @{ rank = 7; statGroup = "物理攻撃力"; names = "クーパーマンのメリケンサック|アクアキャロット|オーブン破壊者のバゲット|青い鳥の万年筆|深い眠りの手袋"; values = "1549|1719|1890|2060|2230" },
  @{ rank = 7; statGroup = "魔法攻撃力"; names = "正義の具現化|スリーアウト|オーブン無視パン|大容量モンスター！打破|悲鳴のランタン"; values = "1549|1719|1890|2060|2230" },
  @{ rank = 7; statGroup = "物理防御力"; names = "新品のヘルメット|ガラスのティアラ|勝負師の祈願ベルト|ダウンパンツ|救助隊員の救命胴衣"; values = "3104|3445|3786|4126|4467" },
  @{ rank = 7; statGroup = "魔法防御力"; names = "ミドルブーツ|フリルカチューシャ|深海調査用シュノーケル|ケイソンの仮面|フラワーサングラス"; values = "3104|3445|3786|4126|4467" },
  @{ rank = 7; statGroup = "会心/会心DMG"; names = "宝石飾りの腕輪|妖精のハンドミラー|スマート腕時計|保護の指輪|クリスタルの指輪"; values = "2321|2576|2831|3085|3340" },
  @{ rank = 7; statGroup = "会心抵抗/会心DMG抵抗"; names = "革のトートバッグ|リボン付きチョーカー|手作りの陶器コップ|クリスタルの首飾り|ヘアアイロン"; values = "2321|2576|2831|3085|3340" },

  @{ rank = 8; statGroup = "HP"; names = "技術者のエプロン|イブニングドレス|遊び好きのパジャマ|中級魔法使いのマント|パワーウィングダウンジャケット"; values = "20982|29919|38856|47792|56729" },
  @{ rank = 8; statGroup = "物理攻撃力"; names = "アクアインパクト|霜ムースパン|ふわふわの羽根ペン|超デコピン手袋|破滅のバゲット"; values = "2218|2461|2705|2948|3191" },
  @{ rank = 8; statGroup = "魔法攻撃力"; names = "コールドゲーム|キュートハートマイク|幻のグレープサイダー|星明りのランタン|ポッピングメリケンサック"; values = "2218|2461|2705|2948|3191" },
  @{ rank = 8; statGroup = "物理防御力"; names = "パーティー用サングラス|バイクウィングヘルメット|アメジストのティアラ|スキーパンツ|キュートハートの救命胴衣"; values = "4442|4930|5418|5905|6393" },
  @{ rank = 8; statGroup = "魔法防御力"; names = "イーグルウィングヘルメット|Uクラウンシュノーケル|高級真珠のカチューシャ|クラウンシュノーケル|隣町の悪役の仮面"; values = "4442|4930|5418|5905|6393" },
  @{ rank = 8; statGroup = "会心/会心DMG"; names = "金細工の腕輪|星空のハンドミラー|通信強化腕時計|マナーの指輪|アメジストの指輪"; values = "3321|3686|4051|4415|4780" },
  @{ rank = 8; statGroup = "会心抵抗/会心DMG抵抗"; names = "ライラックのショルダーバッグ|アメジストのチョーカー|カスタムタンブラー|アメジストの首飾り|多機能ヘアアイロン"; values = "3321|3686|4051|4415|4780" }
)

$wikiEquipValueByName = @{}
foreach ($row in $wikiEquipRankRows) {
  $names = $row.names -split "\|"
  $values = $row.values -split "\|"
  for ($i = 0; $i -lt $names.Count; $i++) {
    $wikiEquipValueByName[$names[$i]] = [pscustomobject]@{
      rank = $row.rank
      statGroup = $row.statGroup
      tier = $i + 1
      value = $values[$i]
    }
  }
}

$attackTypeMap = @{
  "1" = "物理"
  "2" = "魔法"
}
$personalityMap = @{
  "0" = "純粋"
  "1" = "冷静"
  "2" = "活発"
  "3" = "憂鬱"
  "4" = "狂気"
}
$tribeMap = @{
  "0" = "精霊"
  "1" = "獣人"
  "2" = "妖精"
  "3" = "エルフ"
  "4" = "幽霊"
  "5" = "龍族"
  "6" = "魔女"
  "7" = "？？？"
}

$availableUnits = @($units | Where-Object { $_.available } | Sort-Object uid)
$unitByUid = @{}
foreach ($unit in $availableUnits) {
  $unitByUid[[string]$unit.uid] = $unit
}

$unitMaster = $availableUnits | ForEach-Object {
  [pscustomobject]@{
    unitUid = $_.uid
    enName = $_.name
    icon = $_.icon
    resourceName = $_.resource_name
    rarity = $_.rarity
    attackTypeCode = $_.attack_type
    attackType = $attackTypeMap[[string]$_.attack_type]
    personalityCode = $_.personality
    personality = $personalityMap[[string]$_.personality]
    tribeCode = $_.tribe
    tribe = $tribeMap[[string]$_.tribe]
    positionCode = $_.position
    jobCode = $_.job
    rangeTypeCode = $_.range_type
    gaugeOffense = $_.gauge_offense
    gaugeDefense = $_.gauge_defense
    gaugeUtility = $_.gauge_utility
    activeSkillGrowth = $_.active_skill_value_a
    ultimateSkillGrowth = $_.ultimate_skill_value_a
    passiveGrowth = $_.passive_value_a
    weightValue = $_.weight_value_a
  }
}

$equipRows = foreach ($unit in $availableUnits) {
  foreach ($rankEquip in @($unit.equips)) {
    $equipIds = Split-List $rankEquip.equip_list
    for ($i = 0; $i -lt $equipIds.Count; $i++) {
      $equipId = $equipIds[$i]
      $item = if ($itemMap.ContainsKey($equipId)) { $itemMap[$equipId] } else { $null }
      $equipInfo = Get-EquipIdInfo $equipId
      $wikiMatch = if ($item -and $wikiEquipValueByName.ContainsKey([string]$item.name)) { $wikiEquipValueByName[[string]$item.name] } else { $null }
      [pscustomobject]@{
        unitUid = $unit.uid
        enName = $unit.name
        rank = $rankEquip.rank
        slot = $i + 1
        equipId = $equipId
        equipName = Get-NameForId $equipId $itemMap $itemFallback
        equipCategory = $equipInfo.category
        equipRankFromId = $equipInfo.rank
        equipVariantFromId = $equipInfo.variant
        equipIcon = if ($item) { $item.icon } else { "" }
        equipGrade = if ($item) { $item.grade } else { $equipInfo.rank }
        equipType = if ($item) { $item.type } else { "" }
        equipEnhancePt = if ($item) { $item.enhance_pt } else { "" }
        equipStatRaw = if ($item) { $item.stat } else { "" }
        equipStatSummary = Get-ItemSummary $item
        wikiStatGroup = if ($wikiMatch) { $wikiMatch.statGroup } else { "" }
        wikiTier = if ($wikiMatch) { $wikiMatch.tier } else { "" }
        wikiBaseValue = if ($wikiMatch) { $wikiMatch.value } else { "" }
        memo_statGroup = if ($wikiMatch) { $wikiMatch.statGroup } else { "" }
        memo_tier = if ($wikiMatch) { $wikiMatch.tier } else { "" }
      }
    }
  }
}

function Get-EquipMatrixGroup {
  param([object]$Row)
  if (-not [string]::IsNullOrWhiteSpace([string]$Row.wikiStatGroup)) { return [string]$Row.wikiStatGroup }
  switch ([string]$Row.slot) {
    "1" { return "HP" }
    "2" {
      $variant = 0
      if ([int]::TryParse([string]$Row.equipVariantFromId, [ref]$variant)) {
        if ($variant -ge 1 -and $variant -le 5) { return "物理攻撃" }
        if ($variant -ge 6 -and $variant -le 10) { return "魔法攻撃" }
      }
      return ""
    }
    "3" { return "物理防御" }
    "4" { return "魔法防御" }
    "5" { return "会心/会心DMG" }
    "6" { return "会心抵抗/会心DMG抵抗" }
  }
  return ""
}

function Get-EquipTierFromVariant {
  param([object]$Row)
  if (-not [string]::IsNullOrWhiteSpace([string]$Row.wikiTier)) { return [string]$Row.wikiTier }
  $variant = 0
  if (-not [int]::TryParse([string]$Row.equipVariantFromId, [ref]$variant)) { return "" }
  if ($variant -le 0) { return "" }
  return [string](5 - (($variant - 1) % 5))
}

function Get-EquipMatrixValue {
  param([object]$Row)
  $tier = Get-EquipTierFromVariant $Row
  if (-not [string]::IsNullOrWhiteSpace($tier)) { return $tier }
  return ""
}

$equipMatrixGroups = @(
  "HP",
  "物理攻撃",
  "魔法攻撃",
  "物理防御",
  "魔法防御",
  "会心/会心DMG",
  "会心抵抗/会心DMG抵抗"
)
$equipMatrixColumns = New-Object System.Collections.Generic.List[string]
for ($rank = 1; $rank -le 9; $rank++) {
  foreach ($group in $equipMatrixGroups) {
    $equipMatrixColumns.Add(("Equip_Rank{0}_{1}" -f $rank, $group))
  }
}

$equipRowsByUnit = @{}
foreach ($equipRow in $equipRows) {
  $key = [string]$equipRow.unitUid
  if (-not $equipRowsByUnit.ContainsKey($key)) {
    $equipRowsByUnit[$key] = New-Object System.Collections.Generic.List[object]
  }
  $equipRowsByUnit[$key].Add($equipRow)
}

$equipMatrixRows = foreach ($unit in $availableUnits) {
  $row = [ordered]@{
    unitUid = $unit.uid
    enName = $unit.name
  }
  foreach ($column in $equipMatrixColumns) {
    $row[$column] = ""
  }

  $unitEquipRows = if ($equipRowsByUnit.ContainsKey([string]$unit.uid)) { @($equipRowsByUnit[[string]$unit.uid].ToArray()) } else { @() }
  foreach ($equipRow in $unitEquipRows) {
    $group = Get-EquipMatrixGroup $equipRow
    if ([string]::IsNullOrWhiteSpace($group)) { continue }

    $columnGroup = switch ($group) {
      "物理攻撃力" { "物理攻撃" }
      "魔法攻撃力" { "魔法攻撃" }
      "物理防御力" { "物理防御" }
      "魔法防御力" { "魔法防御" }
      default { $group }
    }
    $columnName = "Equip_Rank$($equipRow.rank)_$columnGroup"
    if (-not $row.Contains($columnName)) { continue }

    $value = Get-EquipMatrixValue $equipRow
    if ([string]::IsNullOrWhiteSpace($value)) { continue }
    if ([string]::IsNullOrWhiteSpace([string]$row[$columnName])) {
      $row[$columnName] = $value
    } else {
      $row[$columnName] = "$($row[$columnName]) / $value"
    }
  }

  [pscustomobject]$row
}

$boardByUid = @{}
$boards | ForEach-Object { $boardByUid[[string]$_.uid] = $_ }
$boardMaxXByUnitStep = @{}
$boards | Group-Object { "{0}:{1}" -f $_.unit_uid, $_.step } | ForEach-Object {
  $maxX = @($_.Group | ForEach-Object { [int]$_.node_grid_x } | Measure-Object -Maximum).Maximum
  $boardMaxXByUnitStep[$_.Name] = $maxX
}

$boardRows = foreach ($node in ($boards | Sort-Object unit_uid, step, node_grid_y, node_grid_x, uid)) {
  $statCodes = Split-List $node.stat_type
  $values = Split-List $node.stat_value
  $needItemIds = Split-List $node.need_item_ids
  $needItemValues = Split-List $node.need_item_values
  $needItemNames = @($needItemIds | ForEach-Object { Get-NameForId $_ $itemMap $itemFallback } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) })
  $needNodes = Split-List $node.need_goods_array
  $needNodeLabels = @(
    $needNodes | ForEach-Object {
      $needNode = if ($boardByUid.ContainsKey([string]$_)) { $boardByUid[[string]$_] } else { $null }
      if ($needNode) {
        "{0}(S{1}:{2},{3})" -f $_, $needNode.step, $needNode.node_grid_x, $needNode.node_grid_y
      } else {
        $_
      }
    } | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
  )
  $unit = $unitByUid[[string]$node.unit_uid]
  $effectSummary = Format-StatEffect $statCodes $values ([string]$node.node_type)
  $costSummary = Format-BoardCost $needItemIds $needItemValues $node.need_gold $itemMap $itemFallback
  $unitStepKey = "{0}:{1}" -f $node.unit_uid, $node.step
  $maxX = if ($boardMaxXByUnitStep.ContainsKey($unitStepKey)) { [int]$boardMaxXByUnitStep[$unitStepKey] } else { [int]$node.node_grid_x }
  $displayRowStartLeft = $maxX - [int]$node.node_grid_x + 1
  $displayColStartLeft = [int]$node.node_grid_y
  $nodeLabelGuessed = if ($effectSummary) { $effectSummary } else { Get-BoardNodeTypeName ([string]$node.node_type) }
  $override = if ($boardNodeOverrideMap.ContainsKey([string]$node.uid)) { $boardNodeOverrideMap[[string]$node.uid] } else { $null }
  $nodeLabel = if ($override) { $override.nodeLabelOverride } else { $nodeLabelGuessed }
  [pscustomobject]@{
    unitUid = $node.unit_uid
    enName = if ($unit) { $unit.name } else { "" }
    boardStep = "Step $($node.step)"
    position = "x$($node.node_grid_x)-y$($node.node_grid_y)"
    displayRowStartLeft = $displayRowStartLeft
    displayColStartLeft = $displayColStartLeft
    nodeLabel = $nodeLabel
    nodeLabelGuessed = $nodeLabelGuessed
    nodeLabelOverride = if ($override) { $override.nodeLabelOverride } else { "" }
    effectSummary = $effectSummary
    costSummary = $costSummary
    requiredNodeSummary = ($needNodeLabels -join " / ")
    nodeUid = $node.uid
    step = $node.step
    nodeType = $node.node_type
    nodeTypeName = Get-BoardNodeTypeName ([string]$node.node_type)
    statCode1 = if ($statCodes.Count -gt 0) { $statCodes[0] } else { "" }
    statName1 = if ($statCodes.Count -gt 0) { Get-BoardStatName $statCodes[0] ([string]$node.node_type) } else { "" }
    value1 = if ($values.Count -gt 0) { $values[0] } else { "" }
    statCode2 = if ($statCodes.Count -gt 1) { $statCodes[1] } else { "" }
    statName2 = if ($statCodes.Count -gt 1) { Get-BoardStatName $statCodes[1] ([string]$node.node_type) } else { "" }
    value2 = if ($values.Count -gt 1) { $values[1] } else { "" }
    x = $node.node_grid_x
    y = $node.node_grid_y
    needs = $node.need_goods_array
    gold = $node.need_gold
    items = $node.need_item_ids
    itemNames = ($needItemNames -join ",")
    itemValues = $node.need_item_values
  }
}

$boardSpecialReviewRows = $boardRows |
  Where-Object { $_.nodeType -in @("4", "5") } |
  Select-Object unitUid, enName, boardStep, nodeUid, nodeType, nodeTypeName, position, displayRowStartLeft, displayColStartLeft, nodeLabelGuessed, nodeLabelOverride, statCode1, statName1, value1, statCode2, statName2, value2, costSummary, requiredNodeSummary

$referencedItemIds = New-Object System.Collections.Generic.HashSet[string]
$availableUnits | ForEach-Object {
  foreach ($rankEquip in @($_.equips)) {
    foreach ($id in (Split-List $rankEquip.equip_list)) {
      if (-not [string]::IsNullOrWhiteSpace($id) -and $id -ne "0") { [void]$referencedItemIds.Add($id) }
    }
  }
}
$boards | ForEach-Object {
  foreach ($id in (Split-List $_.need_item_ids)) {
    if (-not [string]::IsNullOrWhiteSpace($id) -and $id -ne "0") { [void]$referencedItemIds.Add($id) }
  }
}
foreach ($id in $itemFallback.Keys) { [void]$referencedItemIds.Add($id) }

$itemMasterRows = $referencedItemIds |
  Sort-Object { [int]$_ } |
  ForEach-Object {
    $item = if ($itemMap.ContainsKey($_)) { $itemMap[$_] } else { $null }
    $stats = if ($item) { Split-List $item.stat } else { @() }
    $equipInfo = Get-EquipIdInfo $_
    [pscustomobject]@{
      itemUid = $_
      itemName = Get-NameForId $_ $itemMap $itemFallback
      categoryFromId = $equipInfo.category
      rankFromId = $equipInfo.rank
      variantFromId = $equipInfo.variant
      icon = if ($item) { $item.icon } else { "" }
      rarity = if ($item) { $item.rarity } else { "" }
      type = if ($item) { $item.type } else { "" }
      grade = if ($item) { $item.grade } else { $equipInfo.rank }
      unitLevel = if ($item) { $item.unit_level } else { "" }
      enhancePt = if ($item) { $item.enhance_pt } else { "" }
      statRaw = if ($item) { $item.stat } else { "" }
      statSummary = Get-ItemSummary $item
      hp = if ($stats.Count -gt 0) { $stats[0] } else { "" }
      physicalAtk = if ($stats.Count -gt 4) { $stats[4] } else { "" }
      magicAtk = if ($stats.Count -gt 5) { $stats[5] } else { "" }
      physicalDef = if ($stats.Count -gt 6) { $stats[6] } else { "" }
      magicDef = if ($stats.Count -gt 7) { $stats[7] } else { "" }
      crit = if ($stats.Count -gt 8) { $stats[8] } else { "" }
      critDmg = if ($stats.Count -gt 9) { $stats[9] } else { "" }
      critRes = if ($stats.Count -gt 10) { $stats[10] } else { "" }
      critDmgRes = if ($stats.Count -gt 11) { $stats[11] } else { "" }
    }
  }

$apostleStatTierRows = foreach ($apostle in $apostles) {
  $stats = $apostle.statTypes
  [pscustomobject]@{
    apostleId = $apostle.id
    jpName = $apostle.name
    rarity = $apostle.basic.rarity
    attackType = $apostle.basic.attackType
    personality = $apostle.basic.personality
    race = $apostle.basic.race
    role = $apostle.basic.role
    position = $apostle.basic.position
    hpTier = $stats.hp
    physicalAtkTier = $stats.atkP
    magicAtkTier = $stats.atkM
    physicalDefTier = $stats.defP
    magicDefTier = $stats.defM
    critTier = $stats.crit
    critDmgTier = $stats.critDmg
    critResTier = $stats.critRes
    critDmgResTier = $stats.critDmgRes
    boardType = $apostle.basic.boardType
    boardShape = $apostle.basic.boardShape
  }
}

$baseStatTemplate = foreach ($star in 1..5) {
  foreach ($tier in 1..5) {
    foreach ($stat in @("HP", "攻撃力", "防御力", "会心", "会心DMG", "会心抵抗", "会心DMG抵抗")) {
      [pscustomobject]@{
        star = $star
        tier = $tier
        stat = $stat
        level1Value = ""
        levelUpValue = ""
        source = "wiki:戦闘システム#stats"
        memo = ""
      }
    }
  }
}

$equipValueTemplate = foreach ($row in $wikiEquipRankRows) {
  $names = $row.names -split "\|"
  $values = $row.values -split "\|"
  foreach ($tier in 1..5) {
    [pscustomobject]@{
      rank = $row.rank
      statGroup = $row.statGroup
      tier = $tier
      equipName = $names[$tier - 1]
      enhance0 = $values[$tier - 1]
      enhance1 = ""
      enhance2 = ""
      enhance3 = ""
      enhance4 = ""
      enhance5 = ""
      source = "wiki:装備ランク別等級表"
      memo = "wiki掲載はRank1-8の基礎値。+1～+5は未入力。"
    }
  }
}

$rankBonusTemplate = foreach ($fromRank in 1..9) {
  $toRank = $fromRank + 1
  foreach ($tier in 1..5) {
    [pscustomobject]@{
      rankFrom = $fromRank
      rankTo = $toRank
      tier = $tier
      hp = ""
      atk = ""
      def = ""
      critFamily = ""
      source = "wiki:戦闘システム#stats"
      memo = ""
    }
  }
}

$rankGlobalBonusRows = foreach ($apostle in $apostles) {
  foreach ($prop in @($apostle.basic.PSObject.Properties)) {
    if ($prop.Name -match "^Rank(\d+)\s*全体効果(\d+)$" -and -not [string]::IsNullOrWhiteSpace([string]$prop.Value)) {
      $rank = [int]$Matches[1]
      $slot = [int]$Matches[2]
      $valueText = [string]$prop.Value
      $statName = $valueText
      $value = ""
      if ($valueText -match "^(.*?)\s*\+([\d.]+)$") {
        $statName = $Matches[1].Trim()
        $value = $Matches[2]
      }
      [pscustomobject]@{
        apostleId = $apostle.id
        jpName = $apostle.name
        rank = $rank
        slot = $slot
        statName = $statName
        value = $value
        raw = $valueText
      }
    }
  }
}

$researchTemplate = foreach ($stat in @("HP", "物理攻撃力", "魔法攻撃力", "物理防御力", "魔法防御力", "会心", "会心DMG", "会心抵抗", "会心DMG抵抗")) {
  [pscustomobject]@{
    stat = $stat
    flatValue = ""
    percentValue = ""
    source = ""
    memo = ""
  }
}

Export-Tsv $unitMaster (Join-Path $outputPath "unit_master.tsv")
Export-Tsv $itemMasterRows (Join-Path $outputPath "item_master.tsv")
Export-Tsv $equipRows (Join-Path $outputPath "unit_equips.tsv")
Export-Tsv $equipMatrixRows (Join-Path $outputPath "unit_equip_matrix.tsv")
Export-Tsv $boardRows (Join-Path $outputPath "board_nodes.tsv")
Export-Tsv $boardSpecialReviewRows (Join-Path $outputPath "board_special_nodes_review.tsv")
Export-Tsv $apostleStatTierRows (Join-Path $outputPath "apostle_stat_tiers.tsv")
Export-Tsv $rankGlobalBonusRows (Join-Path $outputPath "rank_global_bonus_from_apostles.tsv")
Export-Tsv $baseStatTemplate (Join-Path $outputPath "base_stat_template.tsv")
Export-Tsv $equipValueTemplate (Join-Path $outputPath "equip_values_template.tsv")
Export-Tsv $rankBonusTemplate (Join-Path $outputPath "rank_bonus_template.tsv")
Export-Tsv $researchTemplate (Join-Path $outputPath "research_template.tsv")

Get-ChildItem $outputPath -Filter *.tsv | Sort-Object Name | Select-Object Name, Length
