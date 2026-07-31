#!/usr/bin/env python3
"""Generate calculator/statData.js from the local Trickcal datasheet xlsx."""

from __future__ import annotations

import argparse
import csv
import datetime as dt
import json
import re
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

MAIN_NS = "{http://schemas.openxmlformats.org/spreadsheetml/2006/main}"
REL_NS = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"
PKG_REL_NS = "{http://schemas.openxmlformats.org/package/2006/relationships}"

SHEET_KEYS = {
    "基本情報": "basicInfo",
    "使徒基礎設定": "basicInfo",
    "Rank全体効果情報": "rankGlobalBonuses",
    "Rank全体効果": "rankGlobalBonuses",
    "装備情報": "equipment",
    "装備Tier設定": "equipment",
    "RankUpBonus": "rankUpBonuses",
    "装備効果": "equipmentValues",
    "研究効果": "research",
    "基礎ステータス値効果": "baseStatValues",
    "基礎ステータス": "baseStatValues",
    "学年補正": "gradeBonuses",
    "好感度効果": "bondBonuses",
    "ボード情報": "board",
    "ボード設定": "board",
    "スキル": "skills",
    "スキル基礎設定": "skillBasics",
    "スキル効果": "skillEffects",
    "愛用カード": "favoriteCards",
    "アサイド ステ効果": "asideStatEffects",
    "アサイド 特殊効果": "asideSpecialEffects",
    "アサイド基礎設定": "asideTiers",
    "アサイドTier": "asideTiers",
    "ボード特殊効果まとめ": "boardSpecialEffects",
    "教主の権能基礎設定": "masterPowerBasics",
    "教主の権能効果": "masterPowerEffects",
}

INDEX_BY_ID = {
    "basicInfo",
    "rankGlobalBonuses",
    "equipment",
    "asideTiers",
    "boardSpecialEffects",
    "masterPowers",
}

GROUP_BY_ID = {
    "board",
    "skills",
    "favoriteCards",
    "asideStatEffects",
    "asideSpecialEffects",
}


def column_index(cell_ref: str) -> int:
    match = re.match(r"([A-Z]+)", cell_ref or "")
    if not match:
        return 0
    value = 0
    for char in match.group(1):
        value = value * 26 + ord(char) - ord("A") + 1
    return value


def parse_scalar(value: str, cell_type: str | None, shared_strings: list[str]):
    if value is None:
        return ""
    if cell_type == "s":
        if value.isdigit():
            index = int(value)
            return shared_strings[index] if index < len(shared_strings) else value
        return value
    if cell_type == "b":
        return value == "1"
    text = str(value).strip()
    if text == "":
        return ""
    try:
        number = float(text)
    except ValueError:
        return text
    if number.is_integer():
        return int(number)
    return number


def read_shared_strings(zip_file: zipfile.ZipFile) -> list[str]:
    if "xl/sharedStrings.xml" not in zip_file.namelist():
        return []
    root = ET.fromstring(zip_file.read("xl/sharedStrings.xml"))
    strings: list[str] = []
    for item in root.findall(f"{MAIN_NS}si"):
        parts = [text.text or "" for text in item.iter(f"{MAIN_NS}t")]
        strings.append("".join(parts))
    return strings


def read_sheet_rows(zip_file: zipfile.ZipFile, sheet_path: str, shared_strings: list[str]) -> list[list[object]]:
    root = ET.fromstring(zip_file.read(sheet_path))
    rows: list[list[object]] = []
    sheet_data = root.find(f"{MAIN_NS}sheetData")
    if sheet_data is None:
        return rows
    for row in sheet_data.findall(f"{MAIN_NS}row"):
        values: list[object] = []
        for cell in row.findall(f"{MAIN_NS}c"):
            idx = column_index(cell.attrib.get("r", ""))
            while len(values) < idx - 1:
                values.append("")

            cell_type = cell.attrib.get("t")
            value_node = cell.find(f"{MAIN_NS}v")
            if cell_type == "inlineStr":
                text_node = cell.find(f"{MAIN_NS}is/{MAIN_NS}t")
                raw = text_node.text if text_node is not None else ""
                values.append(raw or "")
                continue
            if value_node is None:
                values.append("")
                continue
            values.append(parse_scalar(value_node.text or "", cell_type, shared_strings))
        while values and values[-1] == "":
            values.pop()
        rows.append(values)
    return rows


def read_workbook(path: Path) -> dict[str, list[list[object]]]:
    with zipfile.ZipFile(path) as zip_file:
        shared_strings = read_shared_strings(zip_file)
        workbook = ET.fromstring(zip_file.read("xl/workbook.xml"))
        relationships = ET.fromstring(zip_file.read("xl/_rels/workbook.xml.rels"))
        rel_map = {rel.attrib["Id"]: rel.attrib["Target"] for rel in relationships.findall(f"{PKG_REL_NS}Relationship")}

        result: dict[str, list[list[object]]] = {}
        sheets_node = workbook.find(f"{MAIN_NS}sheets")
        if sheets_node is None:
            return result
        for sheet in sheets_node.findall(f"{MAIN_NS}sheet"):
            name = sheet.attrib.get("name", "")
            rid = sheet.attrib.get(f"{REL_NS}id", "")
            target = rel_map.get(rid, "")
            if not target:
                continue
            sheet_path = target.lstrip("/")
            if not sheet_path.startswith("xl/"):
                sheet_path = f"xl/{sheet_path}"
            result[name] = read_sheet_rows(zip_file, sheet_path, shared_strings)
        return result


def unique_headers(raw_headers: list[object]) -> list[str]:
    headers: list[str] = []
    counts: dict[str, int] = {}
    for index, raw in enumerate(raw_headers):
        header = str(raw).strip() if raw != "" else f"col{index + 1}"
        count = counts.get(header, 0) + 1
        counts[header] = count
        headers.append(header if count == 1 else f"{header}_{count}")
    return headers


def rows_to_objects(rows: list[list[object]]) -> list[dict[str, object]]:
    first = next((i for i, row in enumerate(rows) if any(value != "" for value in row)), None)
    if first is None:
        return []
    headers = unique_headers(rows[first])
    objects: list[dict[str, object]] = []
    for row in rows[first + 1 :]:
        if not any(value != "" for value in row):
            continue
        item: dict[str, object] = {}
        for index, header in enumerate(headers):
            value = row[index] if index < len(row) else ""
            if header.startswith("col") and value == "":
                continue
            item[header] = value
        objects.append(item)
    return objects


def parse_tsv_scalar(value: str) -> object:
    text = value.strip()
    if text == "":
        return ""
    try:
        number = float(text)
    except ValueError:
        return text
    if number.is_integer():
        return int(number)
    return number


def read_tsv_objects(path: Path) -> list[dict[str, object]]:
    if not path.exists():
        return []
    with path.open("r", encoding="utf-8", newline="") as file:
        reader = csv.DictReader(file, delimiter="\t")
        return [
            {key: parse_tsv_scalar(value or "") for key, value in row.items() if key is not None}
            for row in reader
        ]


def normalize_basic_info(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized: list[dict[str, object]] = []
    for row in rows:
        item = dict(row)
        renames = {
            "配置列": "配列",
            "攻撃Type": "攻撃タイプ",
            "HPTier": "HPタイプ",
            "物理攻撃力Tier": "物理攻撃力タイプ",
            "魔法攻撃力Tier": "魔法攻撃力タイプ",
            "物理防御力Tier": "物理防御力タイプ",
            "魔法防御力Tier": "魔法防御力タイプ",
            "会心Tier": "会心タイプ",
            "会心DMGTier": "会心DMGタイプ",
            "会心抵抗Tier": "会心抵抗タイプ",
            "会心DMG抵抗Tier": "会心DMG抵抗タイプ",
            # Keep the public names used by the CP formula stable while accepting the legacy datasheet header as the B correction.
            "戦闘力補正": "戦闘力補正値B",
            "weight_value_a": "戦闘力補正値B",
        }
        for old, new in renames.items():
            if new not in item and old in item:
                item[new] = item[old]
        normalized.append(item)
    return normalized


def normalize_base_stat_values(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized: list[dict[str, object]] = []
    for row in rows:
        item = dict(row)
        renames = {
            "HP Base": "HP基礎",
            "ATK Base": "攻撃系基礎",
            "DEF Base": "防御系基礎",
            "Crit Base": "会心系基礎",
            "HP GrowthScale": "HP係数",
            "ATK GrowthScale": "攻撃系係数",
            "DEF GrowthScale": "防御系係数",
            "Crit GrowthScale": "会心系係数",
        }
        for old, new in renames.items():
            if new not in item and old in item:
                item[new] = item[old]
        normalized.append(item)
    return normalized


def normalize_equipment_values(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized: list[dict[str, object]] = []
    stat_names = {
        "物理攻撃": "物理攻撃力",
        "魔法攻撃": "魔法攻撃力",
        "物理防御": "物理防御力",
        "魔法防御": "魔法防御力",
    }
    for row in rows:
        stat_group = stat_names.get(str(row.get("ステータス", "")), row.get("ステータス", ""))
        item = dict(row)
        item["statGroup"] = stat_group
        item["equipName"] = row.get("装備名", "")
        item["enhance0"] = row.get("強化なし", "")
        for enhance in range(1, 6):
            item[f"enhance{enhance}"] = row.get(f"強化+{enhance}", "")
        normalized.append(item)
    return normalized


def normalize_rank_up_bonuses(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized: list[dict[str, object]] = []
    for row in rows:
        item = dict(row)
        renames = {
            "ATK": "攻撃力",
            "DEF": "防御力",
            "Crit": "会心系",
        }
        for old, new in renames.items():
            if new not in item and old in item:
                item[new] = item[old]
        normalized.append(item)
    return normalized


def normalize_skill_rows(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    normalized: list[dict[str, object]] = []
    for row in rows:
        item = dict(row)
        renames = {
            "スキル発動条件種別": "triggerType",
            "発動条件種別": "triggerType",
            "スキル発動条件値": "triggerValue",
            "発動条件値": "triggerValue",
            "スタック数": "stackCount",
            "最大スタック数": "maxStack",
            "攻撃タイプ": "attackCategory",
            "攻撃分類": "attackCategory",
            "攻撃分類上書き": "attackCategory",
            "対象攻撃種別": "attackCategory",
        }
        for old, new in renames.items():
            if new not in item and old in item:
                item[new] = item[old]
        effect_stack = item.pop("効果スタック", "")
        max_stack = item.pop("最大スタック", "")
        if effect_stack not in ("", None, False, 0):
            item["effectStack"] = effect_stack
        if max_stack not in ("", None, False, 0):
            item["maxStack"] = max_stack
        for alias in ("攻撃タイプ", "攻撃分類", "攻撃分類上書き", "対象攻撃種別"):
            item.pop(alias, None)
        if "condition" not in item:
            for key in ("条件", "発動条件"):
                value = item.get(key, "")
                if value != "":
                    item["condition"] = value
                    break
        normalized.append(item)
    return normalized


def merge_skill_sheets(
    basics: list[dict[str, object]],
    effects: list[dict[str, object]],
) -> list[dict[str, object]]:
    basics_by_skill_id = {
        str(row.get("skillId", "")): row
        for row in basics
        if row.get("skillId", "") != ""
    }
    merged: list[dict[str, object]] = []
    used_skill_ids: set[str] = set()
    for effect in effects:
        skill_id = str(effect.get("skillId", ""))
        if not skill_id:
            continue
        basic = basics_by_skill_id.get(skill_id)
        if basic is None:
            raise ValueError(f"skill effect references missing skillId: {skill_id}")
        basic_apostle_id = str(basic.get("id", ""))
        effect_apostle_id = str(effect.get("id", ""))
        if basic_apostle_id and effect_apostle_id and basic_apostle_id != effect_apostle_id:
            raise ValueError(
                f"skill apostle id mismatch: {skill_id} / {basic_apostle_id} != {effect_apostle_id}"
            )
        merged.append({**basic, **effect})
        used_skill_ids.add(skill_id)
    for skill_id, basic in basics_by_skill_id.items():
        if skill_id not in used_skill_ids:
            merged.append(dict(basic))
    return merged


def build_master_powers(
    basics: list[dict[str, object]],
    effects: list[dict[str, object]],
) -> list[dict[str, object]]:
    effects_by_id: dict[str, list[dict[str, object]]] = {}
    for raw_effect in normalize_skill_rows(effects):
        item = dict(raw_effect)
        power_id = str(item.pop("id", ""))
        if not power_id:
            continue
        if item.get("適用条件種別", "") != "":
            item["conditionType"] = item["適用条件種別"]
        if item.get("適用条件値", "") != "":
            item["conditionValue"] = item["適用条件値"]
        if item.get("持続時間秒", "") != "":
            item["durationSeconds"] = item["持続時間秒"]
        effects_by_id.setdefault(power_id, []).append(item)

    powers: list[dict[str, object]] = []
    known_ids: set[str] = set()
    for basic in basics:
        power_id = str(basic.get("id", ""))
        if not power_id:
            continue
        known_ids.add(power_id)
        powers.append({**basic, "effects": effects_by_id.get(power_id, [])})
    missing = sorted(set(effects_by_id).difference(known_ids))
    if missing:
        raise ValueError(f"master power effects reference missing ids: {', '.join(missing)}")
    return powers


def normalize_aside_tiers(
    rows: list[dict[str, object]],
    basic_info: list[dict[str, object]],
) -> list[dict[str, object]]:
    ids_by_name = {
        str(row.get("使徒名", "")): str(row.get("id", ""))
        for row in basic_info
        if row.get("使徒名", "") != "" and row.get("id", "") != ""
    }
    valid_ids = set(ids_by_name.values())
    basic_by_id = {
        str(row.get("id", "")): row
        for row in basic_info
        if row.get("id", "") != ""
    }

    def first_value(row: dict[str, object], *keys: str) -> object:
        for key in keys:
            value = row.get(key, "")
            if value not in ("", None):
                return value
        return ""

    normalized: list[dict[str, object]] = []
    for row in rows:
        name = str(row.get("使徒名", ""))
        row_id = str(row.get("id", ""))
        if row_id not in valid_ids:
            row_id = ids_by_name.get(name, row_id)
        if row_id == "":
            continue
        basic = basic_by_id.get(row_id, {})
        attack_type = str(basic.get("攻撃タイプ", basic.get("攻撃Type", "")))
        physical_attack_tier_legacy = ("ATK\nAsideTier",) if attack_type == "物理" else ()
        magic_attack_tier_legacy = ("ATK\nAsideTier",) if attack_type == "魔法" else ()
        physical_attack_bonus_legacy = ("ATK\nAsideBonus",) if attack_type == "物理" else ()
        magic_attack_bonus_legacy = ("ATK\nAsideBonus",) if attack_type == "魔法" else ()
        physical_attack_growth_legacy = ("ATK\nAsideGrowth",) if attack_type == "物理" else ()
        magic_attack_growth_legacy = ("ATK\nAsideGrowth",) if attack_type == "魔法" else ()
        physical_attack_star_legacy = ("ATK\nAsideStarBonus",) if attack_type == "物理" else ()
        magic_attack_star_legacy = ("ATK\nAsideStarBonus",) if attack_type == "魔法" else ()
        normalized.append({
            "id": row_id,
            "使徒名": name,
            "HPタイプ": first_value(row, "HP_AsideTier", "HP\nAsideTier"),
            "物理攻撃力タイプ": first_value(
                row, "物理攻撃力_AsideTier", *physical_attack_tier_legacy
            ),
            "魔法攻撃力タイプ": first_value(
                row, "魔法攻撃力_AsideTier", *magic_attack_tier_legacy
            ),
            "物理防御力タイプ": first_value(row, "物理防御力_AsideTier", "DEF\nAsideTier"),
            "魔法防御力タイプ": first_value(row, "魔法防御力_AsideTier", "DEF\nAsideTier"),
            "HP発現値": first_value(row, "HP_AsideBonus", "HP\nAsideBonus"),
            "物理攻撃力発現値": first_value(
                row, "物理攻撃力_AsideBonus", *physical_attack_bonus_legacy
            ),
            "魔法攻撃力発現値": first_value(
                row, "魔法攻撃力_AsideBonus", *magic_attack_bonus_legacy
            ),
            "物理防御力発現値": first_value(row, "物理防御力_AsideBonus", "DEF\nAsideBonus"),
            "魔法防御力発現値": first_value(row, "魔法防御力_AsideBonus", "DEF\nAsideBonus"),
            "HP_A1成長値": first_value(row, "HP_AsideGrowth", "HP\nAsideGrowth"),
            "物理攻撃力_A1成長値": first_value(
                row, "物理攻撃力_AsideGrowth", *physical_attack_growth_legacy
            ),
            "魔法攻撃力_A1成長値": first_value(
                row, "魔法攻撃力_AsideGrowth", *magic_attack_growth_legacy
            ),
            "物理防御力_A1成長値": first_value(row, "物理防御力_AsideGrowth", "DEF\nAsideGrowth"),
            "魔法防御力_A1成長値": first_value(row, "魔法防御力_AsideGrowth", "DEF\nAsideGrowth"),
            "HP星上昇値": first_value(row, "HP_AsideStarBonus", "HP\nAsideStarBonus"),
            "物理攻撃力星上昇値": first_value(
                row, "物理攻撃力_AsideStarBonus", *physical_attack_star_legacy
            ),
            "魔法攻撃力星上昇値": first_value(
                row, "魔法攻撃力_AsideStarBonus", *magic_attack_star_legacy
            ),
            "物理防御力星上昇値": first_value(row, "物理防御力_AsideStarBonus", "DEF\nAsideStarBonus"),
            "魔法防御力星上昇値": first_value(row, "魔法防御力_AsideStarBonus", "DEF\nAsideStarBonus"),
        })
    return normalized


def build_indexes(sheets: dict[str, list[dict[str, object]]]) -> dict[str, object]:
    indexes: dict[str, object] = {}
    for key, rows in sheets.items():
        if key in INDEX_BY_ID:
            indexes[f"{key}ById"] = {
                str(row.get("id")): index for index, row in enumerate(rows) if row.get("id", "") != ""
            }
        if key in GROUP_BY_ID:
            grouped: dict[str, list[int]] = {}
            for index, row in enumerate(rows):
                row_id = row.get("id", "")
                if row_id == "":
                    continue
                grouped.setdefault(str(row_id), []).append(index)
            indexes[f"{key}ById"] = grouped
    return indexes


def generate(input_path: Path, output_path: Path) -> None:
    workbook = read_workbook(input_path)
    sheets: dict[str, list[dict[str, object]]] = {}
    ignored_sheets: list[str] = []

    for sheet_name, rows in workbook.items():
        key = SHEET_KEYS.get(sheet_name)
        if key is None:
            ignored_sheets.append(sheet_name)
            continue
        sheets[key] = rows_to_objects(rows)

    if "skillBasics" in sheets or "skillEffects" in sheets:
        sheets["skills"] = merge_skill_sheets(
            sheets.pop("skillBasics", []),
            sheets.pop("skillEffects", []),
        )

    if "masterPowerBasics" in sheets or "masterPowerEffects" in sheets:
        sheets["masterPowers"] = build_master_powers(
            sheets.pop("masterPowerBasics", []),
            sheets.pop("masterPowerEffects", []),
        )

    if "basicInfo" in sheets:
        sheets["basicInfo"] = normalize_basic_info(sheets["basicInfo"])

    if "baseStatValues" in sheets:
        sheets["baseStatValues"] = normalize_base_stat_values(sheets["baseStatValues"])

    if "equipmentValues" in sheets:
        sheets["equipmentValues"] = normalize_equipment_values(sheets["equipmentValues"])

    if "rankUpBonuses" in sheets:
        sheets["rankUpBonuses"] = normalize_rank_up_bonuses(sheets["rankUpBonuses"])

    for key in ("skills", "favoriteCards", "asideSpecialEffects"):
        if key in sheets:
            sheets[key] = normalize_skill_rows(sheets[key])

    if "asideTiers" in sheets:
        sheets["asideTiers"] = normalize_aside_tiers(
            sheets["asideTiers"],
            sheets.get("basicInfo", []),
        )

    if "rankUpBonuses" not in sheets:
        rank_up_bonus_path = input_path.parent / "rank-up-bonus.tsv"
        sheets["rankUpBonuses"] = normalize_rank_up_bonuses(read_tsv_objects(rank_up_bonus_path))

    data = {
        "generatedAt": dt.datetime.now(dt.timezone.utc).replace(microsecond=0).isoformat(),
        "source": input_path.name,
        "sheets": sheets,
        "indexes": build_indexes(sheets),
        "ignoredSheets": ignored_sheets,
    }

    output_path.parent.mkdir(parents=True, exist_ok=True)
    json_text = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    output_path.write_text(
        "const TRICKCAL_STAT_DATA = "
        + json_text
        + ";\n"
        + "TRICKCAL_STAT_DATA.getById = function(table, id) {\n"
        + "  const index = this.indexes?.[`${table}ById`]?.[id];\n"
        + "  if (Array.isArray(index)) return index.map(i => this.sheets?.[table]?.[i]).filter(Boolean);\n"
        + "  return Number.isInteger(index) ? this.sheets?.[table]?.[index] : undefined;\n"
        + "};\n"
        + "window.TRICKCAL_STAT_DATA = TRICKCAL_STAT_DATA;\n",
        encoding="utf-8",
        newline="\n",
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--input",
        default="calculator/tools/trickcal_datasheet.xlsx",
        help="Path to the local Trickcal datasheet xlsx.",
    )
    parser.add_argument(
        "--output",
        default="calculator/statData.js",
        help="Path to the generated database JavaScript file.",
    )
    args = parser.parse_args()

    script_dir = Path(__file__).resolve().parent
    input_path = Path(args.input)
    output_path = Path(args.output)
    if not input_path.exists() and input_path == Path("calculator/tools/trickcal_datasheet.xlsx"):
        input_path = script_dir / "trickcal_datasheet.xlsx"
    if not output_path.parent.exists() and output_path == Path("calculator/statData.js"):
        output_path = script_dir.parent / "statData.js"

    generate(input_path, output_path)


if __name__ == "__main__":
    main()
