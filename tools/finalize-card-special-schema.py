#!/usr/bin/env python3
"""Finalize the full card-special-effect TSV into the structured schema.

Input is the review TSV produced by convert-effect-runtime-columns.py.  The
script does not edit the workbook.  It consolidates random min/max rows into a
single logical effect and writes the random range master alongside the result.
"""

from __future__ import annotations

import argparse
import csv
import re
from pathlib import Path
from typing import Any


STAR_COLUMNS = [f"特殊効果_Star{star}" for star in range(1, 6)]

OUTPUT_HEADERS = [
    "id", "カード名", "effectId", "効果処理グループID", "処理順",
    "値の種類", "値分類", "効果タイプ", "攻撃分類",
    "効果スタック", "最大スタック", "同効果非スタック", "同一使徒非スタック",
    "発動条件種別", "発動条件値", "発動元ID",
    "適用条件種別", "適用条件値", "条件",
    "効果対象", "対象スキル", "参照", "randomId", "持続時間秒",
    "リセット条件種別", "リセット条件値", "リセット元ID",
    "固定値", *STAR_COLUMNS,
]

RANDOM_HEADERS = [
    "randomId", "乱数名", "乱数方式", "値形式", "調査状態",
    "段階種別", "段階", "最小値", "最大値", "刻み", "端点", "備考",
]

STACK_MERGES = {
    "artifact_vivi_silver_staff_e02": ("artifact_vivi_silver_staff_e01", "20"),
    "artifact_blanchet_bouquet_e02": ("artifact_blanchet_bouquet_e01", "9"),
    "artifact_tig_blazing_sword_e02": ("artifact_tig_blazing_sword_e01", "10"),
}

GROUP_OVERRIDES = {
    "artifact_vivi_silver_staff_e03": ("artifact_vivi_silver_staff_max_stack", "1"),
    "artifact_vivi_silver_staff_e04": ("artifact_vivi_silver_staff_max_stack", "2"),
    "artifact_naia_dolphin_watergun_e01": ("artifact_naia_dolphin_watergun_proc", "1"),
    "artifact_naia_dolphin_watergun_e02": ("artifact_naia_dolphin_watergun_proc", "2"),
    "artifact_shoupan_magical_backpack_e01": ("artifact_shoupan_magical_backpack_proc", "1"),
    "artifact_shoupan_magical_backpack_e02": ("artifact_shoupan_magical_backpack_proc", "2"),
    "artifact_icy_charm_e01": ("artifact_icy_charm_proc", "1"),
    "artifact_icy_charm_e02": ("artifact_icy_charm_proc", "2"),
    "artifact_selene_midnight_mirage_e01": ("artifact_selene_midnight_mirage_proc", "1"),
    "artifact_selene_midnight_mirage_e02": ("artifact_selene_midnight_mirage_proc", "2"),
    "artifact_snorky_fedora_e01": ("artifact_snorky_fedora_hp50", "1"),
    "artifact_snorky_fedora_e02": ("artifact_snorky_fedora_hp50", "2"),
}


def clean(value: Any) -> str:
    text = "" if value is None else str(value).strip()
    if re.fullmatch(r"-?\d+\.0+", text):
        return text.split(".", 1)[0]
    return text


def read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [dict(row) for row in csv.DictReader(handle, delimiter="\t")]


def write_tsv(path: Path, headers: list[str], rows: list[dict[str, Any]]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=headers, delimiter="\t", lineterminator="\n", extrasaction="ignore")
        writer.writeheader()
        for row in rows:
            writer.writerow({header: clean(row.get(header, "")) for header in headers})


def infer_effect_type(value_kind: str, target: str) -> str:
    text = value_kind.replace(" ", "")
    if "ダメージ効果" in text:
        return "攻撃"
    if text in {"HP回復", "SP回復"}:
        return "回復"
    if any(token in text for token in ("コイン獲得", "性格判定", "学年+")):
        return "特殊"
    if any(token in text for token in ("毒", "目くらまし")):
        return "デバフ"
    if any(token in text for token in ("敵防御力減少", "被ダメージ増加")) or target in {"敵", "敵全体"} and "減少" in text:
        return "デバフ"
    return "バフ"


def apply_card_condition_rules(row: dict[str, str]) -> None:
    condition1 = clean(row.get("条件1"))
    condition2 = clean(row.get("条件2"))

    if condition1 == "カード選択時":
        row["発動条件種別"] = "カード選択時"
        row["発動元ID"] = clean(row.get("id"))
    elif condition1 == "被普通攻撃時":
        row["発動条件種別"] = "普通攻撃被命中時"
        row["発動元ID"] = "敵普通攻撃"
    elif condition1 == "シールド付与時":
        row["発動条件種別"] = "状態付与時"
        row["発動条件値"] = "シールド"
    elif condition1 == "着用者にシールドが付与されている場合":
        row["適用条件種別"] = "固有状態中"
        row["適用条件値"] = "シールド"
    elif condition1 == "敵が1体しかいない場合":
        row["適用条件種別"] = "敵数"
        row["適用条件値"] = "1"

    action_conditions = {
        "スキルダメージ": "スキル",
        "普通攻撃ダメージ": "普通攻撃",
        "強化攻撃ダメージ": "強化攻撃",
        "状態異常ダメージ": "状態異常",
    }
    if condition1 in action_conditions and not clean(row.get("攻撃分類")):
        row["攻撃分類"] = action_conditions[condition1]
    if condition2 in action_conditions and not clean(row.get("攻撃分類")):
        row["攻撃分類"] = action_conditions[condition2]
    if condition2 == "魔法ダメージ":
        if not clean(row.get("攻撃分類")):
            row["攻撃分類"] = "魔法"


def random_range_rows(
    random_id: str,
    random_name: str,
    minimum: dict[str, str],
    maximum: dict[str, str],
    mode: str,
    value_type: str,
    status: str,
    step: str,
    endpoint: str,
    note: str,
) -> list[dict[str, str]]:
    result = []
    for star, column in enumerate(STAR_COLUMNS, start=1):
        result.append({
            "randomId": random_id,
            "乱数名": random_name,
            "乱数方式": mode,
            "値形式": value_type,
            "調査状態": status,
            "段階種別": "カード★",
            "段階": str(star),
            "最小値": clean(minimum.get(column)),
            "最大値": clean(maximum.get(column)),
            "刻み": step,
            "端点": endpoint,
            "備考": note,
        })
    return result


def make_output_row(row: dict[str, str]) -> dict[str, str]:
    result = {header: "" for header in OUTPUT_HEADERS}
    for key in (
        "id", "カード名", "effectId", "効果処理グループID", "処理順",
        "効果スタック", "最大スタック", "同効果非スタック", "同一使徒非スタック",
        "発動条件種別", "発動条件値",
        "発動元ID", "適用条件種別", "適用条件値", "効果対象", "参照",
    ):
        result[key] = clean(row.get(key))
    result["値の種類"] = clean(row.get("効果"))
    result["値分類"] = clean(row.get("値分類"))
    result["効果タイプ"] = infer_effect_type(result["値の種類"], result["効果対象"])
    result["攻撃分類"] = clean(row.get("攻撃タイプ"))
    result["持続時間秒"] = clean(row.get("持続時間"))
    result["条件"] = " / ".join(filter(None, (clean(row.get("条件1")), clean(row.get("条件2")))))
    for column in STAR_COLUMNS:
        result[column] = clean(row.get(column))
    apply_card_condition_rules({**row, **result})
    merged = {**row, **result}
    apply_card_condition_rules(merged)
    for key in result:
        result[key] = clean(merged.get(key, result[key]))

    reset = clean(row.get("リセット条件"))
    if reset == "低学年スキル使用時":
        result["リセット条件種別"] = "低学年スキル使用時"
        result["リセット元ID"] = "低学年スキル"
    elif reset:
        result["リセット条件種別"] = reset
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", required=True)
    parser.add_argument("--output-dir", required=True)
    args = parser.parse_args()

    rows = read_tsv(Path(args.input))
    by_effect = {clean(row.get("effectId")): row for row in rows}
    output_rows: list[dict[str, str]] = []
    random_rows: list[dict[str, str]] = []
    replacements = [
        {"oldEffectId": "spell_alice_fake_magic_e02", "newEffectId": "spell_alice_fake_magic_e01", "理由": "HP回復乱数の上限行を統合"},
        {"oldEffectId": "spell_alice_fake_magic_e04", "newEffectId": "spell_alice_fake_magic_e03", "理由": "SP回復乱数の上限行を統合"},
        {"oldEffectId": "spell_random_coin_e02", "newEffectId": "spell_random_coin_e01", "理由": "コイン乱数の上限行を統合"},
    ]
    replacements.extend(
        {"oldEffectId": old_id, "newEffectId": new_id, "理由": "最大スタック数を効果行の列へ統合"}
        for old_id, (new_id, _) in STACK_MERGES.items()
    )
    skipped = {item["oldEffectId"] for item in replacements}

    for row in rows:
        effect_id = clean(row.get("effectId"))
        if effect_id in skipped:
            continue
        result = make_output_row(row)
        for _, (stack_effect_id, maximum) in STACK_MERGES.items():
            if effect_id == stack_effect_id:
                result["効果スタック"] = "TRUE"
                result["最大スタック"] = maximum
                break
        if effect_id in GROUP_OVERRIDES:
            result["効果処理グループID"], result["処理順"] = GROUP_OVERRIDES[effect_id]
        if effect_id == "spell_alice_fake_magic_e01":
            result.update({
                "効果処理グループID": "spell_alice_fake_magic_tick",
                "処理順": "1",
                "発動条件種別": "n秒ごと",
                "発動条件値": "5",
                "発動元ID": "spell_alice_fake_magic",
                "randomId": "spell_alice_fake_magic_hp",
                "条件": "5秒ごと / 整数一様乱数（仮定）",
            })
            for column in STAR_COLUMNS:
                result[column] = ""
        elif effect_id == "spell_alice_fake_magic_e03":
            result.update({
                "効果処理グループID": "spell_alice_fake_magic_tick",
                "処理順": "2",
                "発動条件種別": "n秒ごと",
                "発動条件値": "5",
                "発動元ID": "spell_alice_fake_magic",
                "randomId": "spell_alice_fake_magic_sp",
                "条件": "5秒ごと / 整数一様乱数（仮定）",
            })
            for column in STAR_COLUMNS:
                result[column] = ""
        elif effect_id == "spell_random_coin_e01":
            result.update({
                "効果処理グループID": "spell_random_coin_draw",
                "処理順": "1",
                "発動条件種別": "カード選択時",
                "発動元ID": "spell_random_coin",
                "randomId": "spell_random_coin_amount",
                "条件": "カード選択時 / 出目分布未調査",
            })
            for column in STAR_COLUMNS:
                result[column] = ""
        output_rows.append(result)

    random_rows.extend(random_range_rows(
        "spell_alice_fake_magic_hp", "アリススペルHP回復量",
        by_effect["spell_alice_fake_magic_e01"], by_effect["spell_alice_fake_magic_e02"],
        "一様", "整数", "仮定", "1", "両端含む", "範囲内の全整数を等確率で抽選",
    ))
    random_rows.extend(random_range_rows(
        "spell_alice_fake_magic_sp", "アリススペルSP回復量",
        by_effect["spell_alice_fake_magic_e03"], by_effect["spell_alice_fake_magic_e04"],
        "一様", "整数", "仮定", "1", "両端含む", "HP回復量とは独立して抽選",
    ))
    random_rows.extend(random_range_rows(
        "spell_random_coin_amount", "ランダムコイン獲得量",
        by_effect["spell_random_coin_e01"], by_effect["spell_random_coin_e02"],
        "範囲のみ", "整数", "未調査", "", "", "出目候補と確率は未調査",
    ))

    output_dir = Path(args.output_dir)
    write_tsv(output_dir / "カード特殊効果.tsv", OUTPUT_HEADERS, output_rows)
    write_tsv(output_dir / "乱数基礎設定.tsv", RANDOM_HEADERS, random_rows)
    write_tsv(output_dir / "effectId置換.tsv", ["oldEffectId", "newEffectId", "理由"], replacements)
    print(f"Wrote {len(output_rows)} card effects and {len(random_rows)} random ranges to {output_dir}")


if __name__ == "__main__":
    main()
