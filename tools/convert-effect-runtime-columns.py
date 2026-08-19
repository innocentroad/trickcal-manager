#!/usr/bin/env python3
"""Create reviewable runtime-effect TSV candidates from exported datasheet TSVs.

This tool never edits the Excel workbook or the exported source TSVs. It copies
the supported effect sheets to another directory, fills empty structured
runtime columns, repairs known legacy column alignment in the copied data, and
writes review/summary TSVs alongside them.
"""

from __future__ import annotations

import argparse
import csv
import re
from collections import defaultdict
from dataclasses import dataclass, field
from pathlib import Path
from typing import Iterable


DEFAULT_SHEETS = (
    "スキル効果",
    "アサイド特殊効果",
    "愛用カード効果",
    "カード特殊効果",
    "教主の権能効果",
)

RUNTIME_COLUMNS = (
    "効果処理グループID",
    "処理順",
    "発動条件種別",
    "発動条件値",
    "発動元ID",
    "適用条件種別",
    "適用条件値",
)

REVIEW_COLUMNS = (
    "元ファイル",
    "行番号",
    "id",
    "skillId",
    "effectId",
    "元条件",
    *RUNTIME_COLUMNS,
    "変換状態",
    "信頼度",
    "要確認理由",
)

TEMPORAL_HINT_RE = re.compile(
    r"秒|回|開始|終了|使用|発動|命中|被弾|撃破|破壊|消滅|召喚|獲得|消費|"
    r"チャージ|スタック|ウェーブ|戦闘不能|HP|SP|ランダム|帰還"
)

GENERATED_SOURCE_IDS = {
    ("Aya_low", "生成物命中時"): "Aya_low_butterfly",
    ("Aya_low", "生成物帰還時"): "Aya_low_butterfly",
    ("Momo_low", "生成物消滅時"): "Momo_low_clone",
    ("Momo_high", "生成物消滅時"): "Momo_high_clone",
}

SHIFTED_TRIGGER_TYPES = {"一定間隔秒"}
SHIFTED_APPLY_TYPES = {"対象行動状態", "敵種別"}

STATE_SPLIT_SPECS = {
    "Chloe_low_e01": {
        "durationEffectId": "Chloe_low_e06",
        "groupId": "Chloe_low_doll_will",
    },
    "Kommy_high_e05": {
        "durationEffectId": "Kommy_high_e06",
        "groupId": "Kommy_high_giant",
    },
    "Epica_high_e03": {
        "durationEffectId": "Epica_high_e06",
        "groupId": "Epica_high_performance",
    },
}


@dataclass
class Inference:
    values: dict[str, str] = field(default_factory=dict)
    confidence: str = ""
    reasons: list[str] = field(default_factory=list)

    def set(self, key: str, value: object, confidence: str = "高") -> None:
        if value is None or str(value).strip() == "" or key in self.values:
            return
        self.values[key] = clean_number(value)
        if confidence_rank(confidence) > confidence_rank(self.confidence):
            self.confidence = confidence


def confidence_rank(value: str) -> int:
    # Lower is better. An empty value means that no inference has happened yet.
    return {"高": 1, "中": 2, "低": 3, "": 0}.get(value, 3)


def clean_number(value: object) -> str:
    text = str(value).strip()
    if re.fullmatch(r"-?\d+\.0+", text):
        return text.split(".", 1)[0]
    return text


def read_tsv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        reader = csv.DictReader(handle, delimiter="\t")
        return list(reader.fieldnames or []), [dict(row) for row in reader]


def write_tsv(path: Path, headers: Iterable[str], rows: Iterable[dict[str, str]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    headers = list(headers)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=headers,
            delimiter="\t",
            lineterminator="\n",
            extrasaction="ignore",
        )
        writer.writeheader()
        writer.writerows(rows)


def ensure_runtime_columns(headers: list[str]) -> list[str]:
    result = list(headers)
    if "効果処理グループID" not in result:
        index = result.index("effectId") + 1 if "effectId" in result else 0
        result[index:index] = ["効果処理グループID", "処理順"]

    trigger_anchor = "最大スタック" if "最大スタック" in result else "処理順"
    insert_at = result.index(trigger_anchor) + 1
    for name in ("発動条件種別", "発動条件値", "発動元ID", "適用条件種別", "適用条件値"):
        if name not in result:
            result.insert(insert_at, name)
            insert_at += 1
    return result


def condition_text(row: dict[str, str]) -> str:
    parts: list[str] = []
    for name in ("条件", "条件1", "条件2"):
        value = (row.get(name) or "").strip()
        if value and value not in parts:
            parts.append(value)
    return " / ".join(parts)


def primary_condition_text(row: dict[str, str]) -> str:
    """Return the event-level condition, excluding secondary qualifiers."""
    return ((row.get("条件") or row.get("条件1") or "")).strip()


def build_context(rows: list[dict[str, str]]) -> dict[str, object]:
    grouped: dict[tuple[str, str], list[dict[str, str]]] = defaultdict(list)
    for row in rows:
        grouped[(parent_id(row), primary_condition_text(row))].append(row)
    threshold_events: set[tuple[str, str]] = set()
    for key, items in grouped.items():
        if any(
            (item.get("値分類") or "").strip() in {"持続時間", "クールタイム"}
            for item in items
        ):
            threshold_events.add(key)

    shield_sources: dict[str, str] = {}
    for row in rows:
        if (row.get("値の種類") or "").strip() != "シールド":
            continue
        if (row.get("値分類") or "").strip() not in {"倍率", "固定値", "状態付与"}:
            continue
        source_id = (row.get("effectId") or "").strip()
        if source_id:
            shield_sources.setdefault(parent_id(row), source_id)
    return {"threshold_events": threshold_events, "shield_sources": shield_sources}


def clear_runtime_fields(row: dict[str, str]) -> None:
    for column in RUNTIME_COLUMNS:
        row[column] = ""
    for column in ("条件", "条件1", "条件2"):
        if column in row:
            row[column] = ""


def split_named_state_rows(
    rows: list[dict[str, str]], headers: list[str]
) -> tuple[list[dict[str, str]], list[set[str]]]:
    """Expand known named modes into explicit state-grant and duration rows."""
    expanded: list[dict[str, str]] = []
    changed: list[set[str]] = []
    existing_ids = {(row.get("effectId") or "").strip() for row in rows}
    level_columns = [column for column in headers if re.fullmatch(r"Lv\d+", column)]
    value_columns = ["固定値", *level_columns]

    for source_row in rows:
        row = dict(source_row)
        spec = STATE_SPLIT_SPECS.get((row.get("effectId") or "").strip())
        if not spec:
            expanded.append(row)
            changed.append(set())
            continue

        duration_id = spec["durationEffectId"]
        if duration_id in existing_ids:
            expanded.append(row)
            changed.append(set())
            continue

        duration_row = dict(row)
        duration_row["effectId"] = duration_id
        duration_row["効果処理グループID"] = spec["groupId"]
        duration_row["処理順"] = "2"
        duration_row["効果タイプ"] = "固有状態"
        duration_row["値分類"] = "持続時間"
        clear_runtime_fields(duration_row)
        duration_row["効果処理グループID"] = spec["groupId"]
        duration_row["処理順"] = "2"

        row["効果処理グループID"] = spec["groupId"]
        row["処理順"] = "1"
        row["値分類"] = "状態付与"
        row["効果タイプ"] = "固有状態"
        row["条件"] = ""
        for column in value_columns:
            if column in row:
                row[column] = ""

        expanded.extend((row, duration_row))
        changed.extend((
            {"効果処理グループID", "処理順", "値分類", "効果タイプ", *value_columns},
            {"effectId", "効果処理グループID", "処理順", "効果タイプ"},
        ))
        existing_ids.add(duration_id)

    # Kommy's sleep has no dedicated state row in the source sheet, so derive it
    # from the four-second recovery duration while preserving the original rows.
    by_effect = {(row.get("effectId") or "").strip(): row for row in expanded}
    if "Kommy_low_e04" not in existing_ids and "Kommy_low_e02" in by_effect:
        template = dict(by_effect["Kommy_low_e02"])
        grant = dict(template)
        clear_runtime_fields(grant)
        grant.update({
            "effectId": "Kommy_low_e04",
            "効果処理グループID": "Kommy_low_sleep",
            "処理順": "1",
            "値の種類": "睡眠",
            "値分類": "状態付与",
            "効果タイプ": "固有状態",
            "効果対象": "自身",
            "参照": "",
            "固定値": "",
        })
        for column in level_columns:
            grant[column] = ""

        duration = dict(template)
        clear_runtime_fields(duration)
        duration.update({
            "effectId": "Kommy_low_e05",
            "効果処理グループID": "Kommy_low_sleep",
            "処理順": "2",
            "値の種類": "睡眠",
            "値分類": "持続時間",
            "効果タイプ": "固有状態",
            "効果対象": "自身",
            "参照": "",
        })
        for column in level_columns:
            duration[column] = ""

        insert_at = next(
            index + 1 for index, item in enumerate(expanded)
            if (item.get("effectId") or "") == "Kommy_low_e03"
        )
        expanded[insert_at:insert_at] = [grant, duration]
        changed[insert_at:insert_at] = [
            {"effectId", "効果処理グループID", "処理順", "値の種類", "値分類", "効果タイプ"},
            {"effectId", "効果処理グループID", "処理順", "値の種類", "効果タイプ"},
        ]

    return expanded, changed


def apply_named_state_references(rows: list[dict[str, str]], changed: list[set[str]]) -> None:
    state_rules = {
        "Chloe_basic_e01": ("apply", "固有状態外", "Chloe_low_e01"),
        "Chloe_basic_e02": ("apply", "固有状態中", "Chloe_low_e01"),
        "Chloe_basic_e03": ("apply", "固有状態中", "Chloe_low_e01"),
        "Chloe_basic_e04": ("apply", "固有状態中", "Chloe_low_e01"),
        "Chloe_enhanced_e01": ("apply", "固有状態外", "Chloe_low_e01"),
        "Chloe_enhanced_e02": ("apply", "固有状態外", "Chloe_low_e01"),
        "Chloe_enhanced_e03": ("apply", "固有状態外", "Chloe_low_e01"),
        "Chloe_enhanced_e04": ("apply", "固有状態外", "Chloe_low_e01"),
        "Kommy_low_e01": ("apply", "固有状態中", "Kommy_low_e04"),
        "Kommy_low_e02": ("apply", "固有状態中", "Kommy_low_e04"),
        "Kommy_low_e03": ("apply", "固有状態中", "Kommy_low_e04"),
        "Kommy_high_e03": ("apply", "固有状態中", "Kommy_high_e05"),
        "Kommy_high_e04": ("apply", "固有状態中", "Kommy_high_e05"),
        "Epica_high_e04": ("trigger", "固有状態付与時", "Epica_high_e03"),
        "Epica_high_e05": ("trigger", "固有状態付与時", "Epica_high_e03"),
    }
    for index, row in enumerate(rows):
        effect_id = (row.get("effectId") or "").strip()
        rule = state_rules.get(effect_id)
        if rule:
            mode, condition_type, state_id = rule
            if mode == "apply":
                row["適用条件種別"] = condition_type
                row["適用条件値"] = state_id
                changed[index].update({"適用条件種別", "適用条件値"})
            else:
                row["発動条件種別"] = condition_type
                row["発動元ID"] = state_id
                changed[index].update({"発動条件種別", "発動元ID"})

        if effect_id in {"Chloe_basic_e02", "Chloe_basic_e03", "Chloe_basic_e04"}:
            row["効果処理グループID"] = "Chloe_basic_doll_will"
            row["処理順"] = str({"Chloe_basic_e02": 1, "Chloe_basic_e03": 2, "Chloe_basic_e04": 3}[effect_id])
            changed[index].update({"効果処理グループID", "処理順"})
        if effect_id in {"Kommy_low_e01", "Kommy_low_e02"}:
            row["効果処理グループID"] = "Kommy_low_sleep_recovery"
            row["処理順"] = "1" if effect_id.endswith("e01") else "2"
            changed[index].update({"効果処理グループID", "処理順"})

    # Chloe's aside listens to each application/refresh of the named mode.
    for index, row in enumerate(rows):
        effect_id = (row.get("effectId") or "").strip()
        if effect_id not in {f"Chloe_aside_2_e{number:02d}" for number in range(7, 12)}:
            continue
        row["発動条件種別"] = "固有状態付与時"
        row["発動条件値"] = ""
        row["発動元ID"] = "Chloe_low_e01"
        row["効果処理グループID"] = "Chloe_aside_2_doll_will"
        row["処理順"] = str(int(effect_id.rsplit("e", 1)[1]) - 6)
        changed[index].update(
            {"発動条件種別", "発動条件値", "発動元ID", "効果処理グループID", "処理順"}
        )


def repair_shifted_masterpower_row(row: dict[str, str]) -> set[str]:
    """Repair rows still aligned to the pre-runtime-column master-power layout."""
    changed: set[str] = set()
    effect_stack = (row.get("効果スタック") or "").strip()
    max_stack = (row.get("最大スタック") or "").strip()

    if effect_stack == "敵命中数" and max_stack:
        row["効果スタック"] = "TRUE"
        row["発動条件種別"] = "敵命中時"
        row["発動条件値"] = "1"
        row["発動元ID"] = "poppin_physical_damage"
        changed.update({"効果スタック", "発動条件種別", "発動条件値", "発動元ID"})
        return changed

    if effect_stack in SHIFTED_APPLY_TYPES and max_stack:
        row["適用条件種別"] = effect_stack
        row["適用条件値"] = max_stack
        row["効果スタック"] = ""
        row["最大スタック"] = ""
        changed.update({"効果スタック", "最大スタック", "適用条件種別", "適用条件値"})
        return changed

    if max_stack not in SHIFTED_TRIGGER_TYPES | SHIFTED_APPLY_TYPES:
        return changed

    condition_type = max_stack
    condition_value = (row.get("発動条件種別") or "").strip()
    condition_note = (row.get("発動条件値") or "").strip()
    old_target = (row.get("条件") or "").strip()
    old_reference = (row.get("効果対象") or "").strip()
    old_fixed = (row.get("参照") or "").strip()
    old_duration = (row.get("固定値") or "").strip()

    row["最大スタック"] = ""
    row["発動条件種別"] = ""
    row["発動条件値"] = ""
    if condition_type in SHIFTED_TRIGGER_TYPES:
        row["発動条件種別"] = "n秒ごと"
        row["発動条件値"] = condition_value
    else:
        row["適用条件種別"] = condition_type
        row["適用条件値"] = condition_value
    row["条件"] = condition_note
    row["効果対象"] = old_target
    row["参照"] = old_reference
    row["固定値"] = old_fixed
    if "持続時間秒" in row:
        row["持続時間秒"] = old_duration
    changed.update(
        {
            "最大スタック",
            "発動条件種別",
            "発動条件値",
            "適用条件種別",
            "適用条件値",
            "条件",
            "効果対象",
            "参照",
            "固定値",
            "持続時間秒",
        }
    )
    return changed


def infer_runtime(row: dict[str, str], context: dict[str, object]) -> Inference:
    result = Inference()
    text = condition_text(row)
    if not text:
        return result

    # Explicit cadence/count patterns are safe enough to copy automatically.
    match = re.search(r"(\d+(?:\.\d+)?)\s*秒ごと", text)
    if match:
        result.set("発動条件種別", "n秒ごと")
        result.set("発動条件値", match.group(1))

    match = re.search(
        r"(?:普通|通常|基本|強化)?攻撃(?:が)?\s*(\d+)\s*回(?:が)?(?:命中する)?(?:たび|ごと)",
        text,
    )
    if match:
        result.set("発動条件種別", "n回ごと")
        result.set("発動条件値", match.group(1))
        result.set("発動元ID", "普通攻撃")

    match = re.search(r"(?:味方が)?\s*(\d+)\s*回(?:直接)?ダメージ", text)
    if match and "ごと" not in text:
        result.set("発動条件種別", "被ダメージ回数", "中")
        result.set("発動条件値", match.group(1), "中")

    match = re.search(
        r"(?:直接(?:攻撃)?)?ダメージ(?:を)?\s*(\d+)\s*回(?:受けた|被弾)",
        text,
    )
    if match:
        result.set("発動条件種別", "被ダメージ回数", "高")
        result.set("発動条件値", match.group(1), "高")
        result.set("発動元ID", "直接ダメージ", "高")

    exact_triggers = (
        (r"戦闘開始時", "戦闘開始時"),
        (r"ウェーブ(?:の)?開始時", "ウェーブ開始時"),
        (r"味方戦闘不能時", "味方戦闘不能時"),
        (r"敵撃破時", "敵撃破時"),
        (r"豆乳シールド破壊時", "シールド終了時"),
        (r"自シールド破壊時|シールド破壊時", "シールド破壊時"),
        (r"召喚獣破壊時|召喚獣消滅時", "生成物消滅時"),
        (r"蝶帰還時", "生成物帰還時"),
        (r"蝶衝突時", "生成物命中時"),
        (r"状態異常を付与した時", "状態異常付与時"),
        (r"回復させた場合", "回復時"),
        (r"マヨによる毒効果終了時", "状態終了時"),
        (r"保護発動時", "状態発動時"),
        (r"軍艦召喚時", "生成物攻撃時"),
    )
    for pattern, trigger_type in exact_triggers:
        if re.search(pattern, text):
            result.set("発動条件種別", trigger_type, "高")
            break

    if "シールド破壊時" in text:
        shield_source = context["shield_sources"].get(parent_id(row), "")
        if shield_source:
            result.set("発動元ID", shield_source, "高")

    if "マヨによる毒効果終了時" in text:
        result.set("発動元ID", "毒")
        result.set("適用条件種別", "付与者", "高")
        result.set("適用条件値", row.get("id", ""), "高")
    if "保護発動時" in text:
        result.set("発動元ID", "保護")
    if "ぬいぐるみの意志発動時" in text:
        existing_apply = (row.get("適用条件種別") or "").strip()
        if existing_apply != "固有状態中":
            result.set("発動条件種別", "固有状態付与時", "高")
            result.set("発動元ID", "Chloe_low_e01", "高")
    if "軍艦召喚時" in text:
        result.reasons.append("軍艦の生成物IDと砲弾タイミングが未登録")
        result.confidence = "低"

    action_patterns = (
        (r"低学年(?:スキル)?(?:が(?:敵に)?)?命中(?:時|するたび)", "低学年スキル命中時", "低学年スキル"),
        (r"高学年(?:スキル)?(?:が(?:敵に)?)?命中(?:時|するたび)", "高学年スキル命中時", "高学年スキル"),
        (r"(?:普通|通常|基本)攻撃命中時", "普通攻撃命中時", "普通攻撃"),
        (r"強化攻撃命中時", "強化攻撃命中時", "強化攻撃"),
        (r"低学年(?:スキル)?使用後|低学年(?:スキル)?発動後", "低学年スキル終了時", "低学年スキル"),
        (r"高学年(?:スキル)?使用後|高学年(?:スキル)?発動後", "高学年スキル終了時", "高学年スキル"),
        (r"低学年(?:スキル)?使用時|低学年(?:スキル)?発動時", "低学年スキル使用時", "低学年スキル"),
        (r"高学年(?:スキル)?使用時|高学年(?:スキル)?発動時", "高学年スキル使用時", "高学年スキル"),
        (r"強化攻撃使用時|強化攻撃時", "強化攻撃使用時", "強化攻撃"),
        (r"スキル使用時|スキル発動時", "スキル使用時", "スキル"),
    )
    for pattern, trigger_type, source in action_patterns:
        if re.search(pattern, text):
            result.set("発動条件種別", trigger_type, "高")
            result.set("発動元ID", source, "高")
            break

    if "オーバードライブ" in text and "発動時" in text:
        result.set("発動条件種別", "高学年スキル使用時", "高")
        result.set("発動元ID", "高学年スキル", "高")
    if "強化攻撃で回復時" in text:
        result.set("発動条件種別", "回復時", "高")
        result.set("発動元ID", "普通攻撃_強化", "高")

    resource_match = re.search(r"([^/（）()、]+?)(獲得時|消費時|チャージ完了時)", text)
    if resource_match and not result.values.get("発動条件種別"):
        result.set("発動条件種別", "リソース変化時", "中")
        result.set("発動条件値", resource_match.group(2), "中")
        result.set("発動元ID", resource_match.group(1).strip(), "中")

    # Applicability is separate from the event that starts processing.
    status_match = re.search(r"([^/、]+?)状態の敵(?:を|に|へ|攻撃|への)", text)
    if status_match:
        result.set("適用条件種別", "対象状態", "高")
        result.set("適用条件値", status_match.group(1).strip(), "高")

    hp_match = re.search(r"(?:自分|自身|着用者)?HP(?:が)?\s*(\d+(?:\.\d+)?)\s*[％%](以下|以上|未満)", text)
    if hp_match:
        threshold, operator = hp_match.groups()
        threshold_key = (parent_id(row), primary_condition_text(row))
        if "になった" in text or threshold_key in context["threshold_events"]:
            result.set("発動条件種別", f"自身HP{operator}到達時", "高")
            result.set("発動条件値", threshold, "高")
        else:
            result.set("適用条件種別", f"自身HP{operator}", "高")
            result.set("適用条件値", threshold, "高")

    if "編成時" in text and not result.values.get("適用条件種別"):
        result.set("適用条件種別", "編成中", "中")
        result.set("適用条件値", row.get("id", ""), "中")

    ally_personality = re.search(r"(純粋|冷静|狂気|活発|憂鬱)性格の味方", text)
    if ally_personality:
        result.set("適用条件種別", "味方性格", "高")
        result.set("適用条件値", ally_personality.group(1), "高")

    if "目標の敵へ攻撃時" in text:
        result.set("適用条件種別", "攻撃対象", "高")
        result.set("適用条件値", "目標の敵", "高")
    if "目標の敵からの攻撃時" in text:
        result.set("適用条件種別", "攻撃元", "高")
        result.set("適用条件値", "目標の敵", "高")

    elapsed_repeat = re.search(r"(\d+(?:\.\d+)?)\s*秒経過時[（(]繰り返し[）)]", text)
    if elapsed_repeat:
        result.set("発動条件種別", "n秒ごと", "高")
        result.set("発動条件値", elapsed_repeat.group(1), "高")

    branch_match = re.search(r"(赤カード|黄カード|青カード)時", text)
    if branch_match:
        result.set("適用条件種別", "分岐", "中")
        result.set("適用条件値", branch_match.group(1), "中")

    potion_match = re.search(r"(緑|赤|黄)のポーション使用時", text)
    if potion_match:
        result.set("発動条件種別", "低学年スキル効果発生時", "高")
        result.set("発動元ID", "低学年スキル", "高")
        result.set("適用条件種別", "ランダム分岐", "高")
        result.set("適用条件値", f"{potion_match.group(1)}のポーション", "高")

    jade_range = re.search(r"翡翠玉(\d+)～(\d+)スタック時", text)
    jade_exact = re.search(r"翡翠玉(\d+)スタック時", text)
    if jade_range:
        result.set("適用条件種別", "リソーススタック範囲", "高")
        result.set("適用条件値", f"翡翠玉:{jade_range.group(1)}-{jade_range.group(2)}", "高")
    elif jade_exact:
        result.set("適用条件種別", "リソーススタック", "高")
        result.set("適用条件値", f"翡翠玉:{jade_exact.group(1)}", "高")
    if "翡翠玉3スタックで翡翠玉取得時" in text:
        result.set("発動条件種別", "リソース獲得時", "高")
        result.set("発動元ID", "翡翠玉", "高")
        result.set("適用条件種別", "発動前リソーススタック", "高")
        result.set("適用条件値", "翡翠玉:3", "高")

    if "高学年スキルで回転時" in text:
        result.set("適用条件種別", "行動区間", "高")
        result.set("適用条件値", f"{parent_id(row)}:回転", "高")

    if "敵を1体も倒していない時" in text:
        result.set("適用条件種別", "敵撃破数", "高")
        result.set("適用条件値", "0", "高")
    enemy_count = re.search(r"敵が(\d+)体以上", text)
    if enemy_count:
        result.set("適用条件種別", "敵数以上", "高")
        result.set("適用条件値", enemy_count.group(1), "高")
    if "普通攻撃スタック最大時" in text:
        result.set("適用条件種別", "カードスタック最大", "高")
        result.set("適用条件値", row.get("id", ""), "高")
    if "1ウェーブ中" in text:
        result.set("適用条件種別", "ウェーブ番号", "高")
        result.set("適用条件値", "1", "高")
    if "追加で敵がいる場合" in text:
        result.set("適用条件種別", "追加対象存在", "高")
        result.set("適用条件値", "1", "高")
    if "最大HPを超えたHP回復量" in text:
        result.set("適用条件種別", "超過回復あり", "高")
        result.set("適用条件値", "1", "高")

    if "ランダム" in text and "ランダム最低値" not in text and "ランダム最大値" not in text and not (
        result.values.get("発動条件種別") or (row.get("発動条件種別") or "").strip()
    ):
        result.set("発動条件種別", "ランダム分岐", "中")

    effective_trigger = result.values.get("発動条件種別") or (
        row.get("発動条件種別") or ""
    ).strip()
    effective_source = result.values.get("発動元ID") or (row.get("発動元ID") or "").strip()
    effective_apply = result.values.get("適用条件種別") or (
        row.get("適用条件種別") or ""
    ).strip()

    generated_source = GENERATED_SOURCE_IDS.get((parent_id(row), effective_trigger))
    if generated_source and not effective_source:
        result.set("発動元ID", generated_source, "高")
        effective_source = generated_source

    if "スキル発動後" in text:
        if parent_id(row).endswith("_low"):
            result.set("発動条件種別", "低学年スキル終了時", "中")
            result.set("発動元ID", "低学年スキル", "中")
        elif parent_id(row).endswith("_high"):
            result.set("発動条件種別", "高学年スキル終了時", "中")
            result.set("発動元ID", "高学年スキル", "中")
        else:
            result.set("発動条件種別", "スキル終了時", "中")
            result.set("発動元ID", parent_id(row), "中")
        result.reasons.append("発動後がモーション開始後か終了後か要確認")
        result.confidence = "低"
    if "力を溜めている時" in text:
        result.reasons.append("力溜め区間の基礎効果と被弾ごとの増加量を分離する必要あり")
        result.confidence = "低"
    if re.fullmatch(r"6秒経過時", primary_condition_text(row)):
        result.reasons.append("戦闘開始6秒後の一度だけか6秒周期か要確認")
        result.confidence = "低"
    if "低学年スキルが命中時/ランダム発動" in text:
        result.set("適用条件種別", "ランダム分岐", "中")
        result.set("適用条件値", (row.get("値の種類") or "").strip(), "中")
        result.reasons.append("3分岐の確率または重みが未設定")
        result.confidence = "低"
    if "ランダム最低値" in text or "ランダム最大値" in text:
        if "カード選択時" in text:
            result.set("発動条件種別", "カード選択時", "高")
            result.set("発動元ID", row.get("id", ""), "高")
        result.reasons.append("最低値・最大値を同一乱数効果の上下限として関連付ける必要あり")
        result.confidence = "低"
    if "かつ" in text and not (effective_trigger and effective_apply):
        result.reasons.append("複合条件の一部を構造化できない")
        result.confidence = "低"
    if (
        TEMPORAL_HINT_RE.search(text)
        and not effective_trigger
        and not effective_apply
        and not result.reasons
    ):
        result.reasons.append("動的条件らしいが発動条件を確定できない")
        result.confidence = "低"
    if effective_trigger.startswith("生成物") and not effective_source:
        result.reasons.append("生成物IDを発動元IDへ設定する必要あり")
        result.confidence = "低"
    return result


def parent_id(row: dict[str, str]) -> str:
    return (row.get("skillId") or row.get("id") or "effect").strip()


def normalized_group_key(row: dict[str, str]) -> tuple[str, ...]:
    return (
        parent_id(row),
        (row.get("発動条件種別") or "").strip(),
        (row.get("発動条件値") or "").strip(),
        (row.get("発動元ID") or "").strip(),
        (row.get("適用条件種別") or "").strip(),
        (row.get("適用条件値") or "").strip(),
        primary_condition_text(row),
    )


def assign_groups(rows: list[dict[str, str]], changed: list[set[str]]) -> None:
    grouped: dict[tuple[str, ...], list[int]] = defaultdict(list)
    for index, row in enumerate(rows):
        if (row.get("発動条件種別") or "").strip():
            grouped[normalized_group_key(row)].append(index)

    counters: dict[str, int] = defaultdict(int)
    for indexes in grouped.values():
        if len(indexes) < 2 and not any(
            (rows[index].get("効果処理グループID") or "").strip() for index in indexes
        ):
            continue
        existing = next(
            ((rows[index].get("効果処理グループID") or "").strip() for index in indexes
             if (rows[index].get("効果処理グループID") or "").strip()),
            "",
        )
        parent = parent_id(rows[indexes[0]])
        if not existing:
            counters[parent] += 1
            existing = f"{parent}_proc{counters[parent]:02d}"

        used_orders = {
            clean_number(rows[index].get("処理順", ""))
            for index in indexes
            if (rows[index].get("処理順") or "").strip()
        }
        next_order = 1
        for index in indexes:
            row = rows[index]
            if not (row.get("効果処理グループID") or "").strip():
                row["効果処理グループID"] = existing
                changed[index].add("効果処理グループID")
            if not (row.get("処理順") or "").strip():
                while str(next_order) in used_orders:
                    next_order += 1
                row["処理順"] = str(next_order)
                used_orders.add(str(next_order))
                changed[index].add("処理順")
                next_order += 1


def find_sheet(input_dir: Path, sheet_name: str) -> Path | None:
    matches = sorted(input_dir.glob(f"*_{sheet_name}.tsv"))
    return matches[0] if matches else None


def convert_sheet(source: Path, destination: Path) -> tuple[list[dict[str, str]], dict[str, int]]:
    headers, rows = read_tsv(source)
    headers = ensure_runtime_columns(headers)
    if source.stem.endswith("スキル効果") and not source.stem.endswith("アサイド特殊効果"):
        rows, changed = split_named_state_rows(rows, headers)
    else:
        changed = [set() for _ in rows]
    inferences: list[Inference] = []

    for index, row in enumerate(rows):
        for column in headers:
            row.setdefault(column, "")
        if source.stem.endswith("教主の権能効果"):
            changed[index].update(repair_shifted_masterpower_row(row))

    apply_named_state_references(rows, changed)

    context = build_context(rows)
    for index, row in enumerate(rows):
        inference = infer_runtime(row, context)
        inferences.append(inference)
        for column, value in inference.values.items():
            if not (row.get(column) or "").strip():
                row[column] = value
                changed[index].add(column)

    assign_groups(rows, changed)
    write_tsv(destination, headers, rows)

    review_rows: list[dict[str, str]] = []
    counts = {"rows": len(rows), "changed": 0, "review": 0, "unchanged": 0}
    for index, (row, inference) in enumerate(zip(rows, inferences), start=2):
        was_changed = bool(changed[index - 2])
        unresolved = bool(inference.reasons)
        if not was_changed and not unresolved:
            counts["unchanged"] += 1
            continue
        if was_changed:
            counts["changed"] += 1
        if unresolved or inference.confidence == "低":
            counts["review"] += 1
        review = {
            "元ファイル": source.name,
            "行番号": str(index),
            "id": row.get("id", ""),
            "skillId": row.get("skillId", ""),
            "effectId": row.get("effectId", ""),
            "元条件": condition_text(row),
            "変換状態": "要確認" if unresolved or inference.confidence == "低" else "候補生成",
            "信頼度": inference.confidence or "中",
            "要確認理由": " / ".join(inference.reasons),
        }
        for column in RUNTIME_COLUMNS:
            review[column] = row.get(column, "")
        review_rows.append(review)
    return review_rows, counts


def main() -> None:
    parser = argparse.ArgumentParser(
        description="Infer structured runtime columns into reviewable effect TSV copies."
    )
    parser.add_argument("--input-dir", default="tmp/datasheet-tsv")
    parser.add_argument("--output-dir", default="tmp/effect-runtime-candidates")
    parser.add_argument(
        "--sheet",
        action="append",
        dest="sheets",
        help="Sheet name to convert; repeat to select multiple sheets.",
    )
    args = parser.parse_args()

    input_dir = Path(args.input_dir)
    output_dir = Path(args.output_dir)
    if not input_dir.is_dir():
        parser.error(f"input directory does not exist: {input_dir}")
    if input_dir.resolve() == output_dir.resolve():
        parser.error("output directory must differ from input directory")
    output_dir.mkdir(parents=True, exist_ok=True)

    all_reviews: list[dict[str, str]] = []
    summaries: list[dict[str, str]] = []
    for sheet_name in args.sheets or DEFAULT_SHEETS:
        source = find_sheet(input_dir, sheet_name)
        if source is None:
            print(f"Skipped missing sheet: {sheet_name}")
            continue
        reviews, counts = convert_sheet(source, output_dir / source.name)
        all_reviews.extend(reviews)
        summaries.append(
            {
                "シート": sheet_name,
                "行数": str(counts["rows"]),
                "候補入力行": str(counts["changed"]),
                "要確認行": str(counts["review"]),
                "変更なし行": str(counts["unchanged"]),
            }
        )
        print(
            f"Converted {sheet_name}: {counts['changed']} candidates, "
            f"{counts['review']} need review"
        )

    write_tsv(output_dir / "変換候補.tsv", REVIEW_COLUMNS, all_reviews)
    write_tsv(
        output_dir / "要確認.tsv",
        REVIEW_COLUMNS,
        (row for row in all_reviews if row.get("変換状態") == "要確認"),
    )
    write_tsv(
        output_dir / "変換集計.tsv",
        ("シート", "行数", "候補入力行", "要確認行", "変更なし行"),
        summaries,
    )
    print(f"Wrote candidate TSVs to {output_dir}")


if __name__ == "__main__":
    main()
