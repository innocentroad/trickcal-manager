#!/usr/bin/env python3
"""Read-only source join for the v29 combat-power datasheet paste candidate."""
from __future__ import annotations

import csv
import json
from pathlib import Path

from openpyxl import load_workbook

ROOT = Path(__file__).resolve().parents[1]
ANALYSIS = ROOT.parent / "Analyze" / "Trickcal_v29_combat_power"
OUTPUT = ROOT / "docs" / "migration" / "combat-power-coefficients-v29.tsv"
UNRESOLVED = ROOT / "docs" / "migration" / "combat-power-unresolved-v29.tsv"
ALIASES = {"Kyuri": "Cuee", "Shaydi": "Shady", "Xion": "xXionx",
           "Selene": "Selline", "Rudd": "Rude", "Layze": "Lazy"}
# Confirmed by the workbook owner on 2026-09-26; model/name alone are ambiguous.
CONFIRMED_HERO_UID = {"Daya": 10001}


def main() -> None:
    source = json.loads((ANALYSIS / "analysis" / "hero_power_sources.json").read_text(encoding="utf-8"))
    hero_info = json.loads((ANALYSIS / "sources" / "sep21" / "HeroInfo.json").read_text(encoding="utf-8"))
    for record in source:
        raw = hero_info[str(record["hero_uid"])]
        expected = [record["active_weight"], record["ultimate_weight"], record["passive_weight"],
                    record["WeightValueA_historical_B"], record["AsideValueA_if_grade_ge2"]]
        if [raw[index] for index in (34, 35, 36, 37, 41)] != expected:
            raise ValueError(f"HeroInfo source mismatch: {record['hero_uid']}")
    by_model: dict[str, list[dict]] = {}
    for record in source:
        if 10000 <= record["hero_uid"] < 11000:
            by_model.setdefault(record["model_raw"].casefold(), []).append(record)
    workbook = load_workbook(ROOT / "tools" / "trickcal_datasheet.xlsx", read_only=True, data_only=True)
    rows = workbook["使徒基礎設定"].values
    headers = next(rows)
    result, unresolved = [], []
    for values in rows:
        row = dict(zip(headers, values))
        apostle_id = row.get("id")
        if not apostle_id:
            continue
        candidates = [r for r in by_model.get(ALIASES.get(apostle_id, apostle_id).casefold(), [])
                      if r["name_ja"] == row.get("使徒名")]
        confirmed_uid = CONFIRMED_HERO_UID.get(apostle_id)
        if confirmed_uid is not None:
            candidates = [r for r in candidates if r["hero_uid"] == confirmed_uid]
        if len(candidates) != 1:
            unresolved.append([apostle_id, row.get("使徒名"), ",".join(str(r["hero_uid"]) for r in candidates),
                               "model_raw + 日本語名で一意にならない。Hero UIDの確認が必要"])
            continue
        record = candidates[0]
        result.append([apostle_id, record["hero_uid"], record["active_weight"],
                       record["ultimate_weight"], record["passive_weight"],
                       0.7, record["AsideValueA_if_grade_ge2"], record["hero_source"]])
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream, delimiter="\t")
        writer.writerow(["使徒ID", "参照HeroUID", "戦闘力低学年係数", "戦闘力高学年係数",
                         "戦闘力パッシブ係数", "戦闘力アサイド係数", "原HeroInfoアサイド係数", "出典"])
        writer.writerows(result)
    with UNRESOLVED.open("w", encoding="utf-8-sig", newline="") as stream:
        writer = csv.writer(stream, delimiter="\t")
        writer.writerow(["使徒ID", "使徒名", "候補HeroUID", "要確認事項"])
        writer.writerows(unresolved)
    print(f"候補 {len(result)} 件、ID要確認 {len(unresolved)} 件")


if __name__ == "__main__":
    main()
