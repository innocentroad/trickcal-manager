#!/usr/bin/env python3
"""Generate browser timing data from the provisional DPS timing TSV files."""

from __future__ import annotations

import argparse
import csv
import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path


ACTION_KEYS = {
    "普通攻撃間隔": "normalAttackInterval",
    "普通攻撃_基本": "basicAttack",
    "普通攻撃_強化": "enhancedAttack",
    "低学年": "lowSkill",
    "高学年": "highSkill",
}


def read_tsv(path: Path) -> list[dict[str, str]]:
    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return [
            {str(key).strip(): str(value or "").strip() for key, value in row.items()}
            for row in csv.DictReader(handle, delimiter="\t")
        ]


def optional_number(value: str):
    text = str(value or "").strip()
    if not text:
        return None
    number = Decimal(text)
    return int(number) if number == number.to_integral_value() else float(number)


def round_half_up(value: Decimal) -> int:
    return int(value.quantize(Decimal("1"), rounding=ROUND_HALF_UP))


def first(row: dict[str, str], *keys: str) -> str:
    for key in keys:
        if row.get(key, "") != "":
            return row[key]
    return ""


def ensure_apostle(result: dict, raw_id: str, name: str) -> dict:
    key = raw_id.strip().lower()
    if not key:
        raise ValueError("idが空の行があります")
    entry = result.setdefault(
        key,
        {
            "id": key,
            "sourceId": raw_id.strip(),
            "name": name.strip(),
            "initialActionDelayFrames": 60,
            "initialActionDelaySource": "default",
            "measuredNormalAttackIntervalFrames": None,
            "normalAttackIntervalFrames": None,
            "actions": {},
        },
    )
    if name and entry["name"] and entry["name"] != name.strip():
        raise ValueError(f"使徒名が一致しません: {raw_id} ({entry['name']} / {name})")
    if name:
        entry["name"] = name.strip()
    return entry


def build_data(speed_path: Path, timing_path: Path, playback_rate: Decimal) -> dict:
    apostles: dict[str, dict] = {}
    warnings: list[str] = []

    for line_number, row in enumerate(read_tsv(speed_path), start=2):
        raw_id = first(row, "id", "使徒ID")
        name = first(row, "使徒", "使徒名")
        action_label = first(row, "動作名", "行動種別")
        action_key = ACTION_KEYS.get(action_label)
        if not action_key:
            warnings.append(f"速度 {line_number}行: 未対応の動作名 {action_label!r}")
            continue
        entry = ensure_apostle(apostles, raw_id, name)
        initial_delay = optional_number(
            first(row, "初動(F)", "初回行動開始(F)", "行動開始遅延(F)")
        )
        if initial_delay is not None:
            if initial_delay < 0:
                raise ValueError(f"速度 {line_number}行: 初動(F)は0以上にしてください")
            if (
                entry["initialActionDelaySource"] == "tsv"
                and entry["initialActionDelayFrames"] != initial_delay
            ):
                raise ValueError(f"速度 {line_number}行: {raw_id}の初動(F)が一致しません")
            entry["initialActionDelayFrames"] = initial_delay
            entry["initialActionDelaySource"] = "tsv"
        if action_key == "normalAttackInterval":
            measured = optional_number(first(row, "全体(F)", "普通攻撃間隔(F)"))
            if measured is None:
                warnings.append(f"速度 {line_number}行: 普通攻撃間隔が空です")
                continue
            entry["measuredNormalAttackIntervalFrames"] = measured
            entry["normalAttackIntervalFrames"] = round_half_up(Decimal(str(measured)) * playback_rate)
            continue
        motion = optional_number(first(row, "モーション(F)", "参照モーション(F)"))
        if motion is None:
            warnings.append(f"速度 {line_number}行: {action_label}のモーションが空です")
            continue
        if action_key in entry["actions"]:
            raise ValueError(f"速度 {line_number}行: {raw_id} {action_label}が重複しています")
        entry["actions"][action_key] = {
            "label": action_label,
            "motionFrames": motion,
            "timingEvents": [],
        }

    for line_number, row in enumerate(read_tsv(timing_path), start=2):
        raw_id = first(row, "id", "使徒ID")
        name = first(row, "使徒", "使徒名")
        action_label = first(row, "動作名", "行動種別")
        action_key = ACTION_KEYS.get(action_label)
        if not action_key or action_key == "normalAttackInterval":
            warnings.append(f"タイミング {line_number}行: 未対応の動作名 {action_label!r}")
            continue
        entry = ensure_apostle(apostles, raw_id, name)
        action = entry["actions"].get(action_key)
        if not action:
            warnings.append(f"タイミング {line_number}行: 速度設定がありません ({raw_id} {action_label})")
            action = {
                "label": action_label,
                "motionFrames": None,
                "timingEvents": [],
            }
            entry["actions"][action_key] = action
        event = {
            "branch": first(row, "分岐"),
            "effectId": first(row, "effectId", "対象effectId"),
            "order": optional_number(first(row, "発生順", "順番")),
            "frame": optional_number(first(row, "発生(F)")),
            "researchStatus": first(row, "発生調査状態", "調査状態"),
            "lv1PerHitMultiplier": optional_number(first(row, "Lv1・1ヒット倍率(%)")),
            "sourceHitCount": optional_number(first(row, "総ヒット数", "ヒット数")),
            "occurrenceType": first(row, "ヒット数区分", "発生区分"),
            "note": first(row, "備考"),
            "sourceLine": line_number,
        }
        action["timingEvents"].append(event)

    for entry in apostles.values():
        for action in entry["actions"].values():
            action["timingEvents"].sort(
                key=lambda item: (
                    item["branch"],
                    item["order"] is None,
                    item["order"] or 0,
                    item["frame"] is None,
                    item["frame"] or 0,
                )
            )

    return {
        "version": 1,
        "timeBase": {
            "framesPerGameSecond": 60,
            "measuredPlaybackRate": float(playback_rate),
            "subframeTicks": 10,
            "defaultInitialActionDelayFrames": 60,
            "normalAttackIntervalSource": "measuredWallClockFrames",
            "motionSource": "gameTimeFrames",
        },
        "apostles": apostles,
        "warnings": warnings,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--speed", type=Path, default=Path("../スキル速度.tsv"))
    parser.add_argument("--timing", type=Path, default=Path("../スキルタイミング.tsv"))
    parser.add_argument("--output", type=Path, default=Path("dps-timing-data.js"))
    parser.add_argument("--playback-rate", default="1.3")
    args = parser.parse_args()

    data = build_data(args.speed, args.timing, Decimal(str(args.playback_rate)))
    payload = json.dumps(data, ensure_ascii=False, indent=2)
    args.output.write_text(
        "// Generated by tools/generate-dps-timing-data.py\n"
        f"const DPS_TIMING_DATA = {payload};\n"
        "if (typeof globalThis !== 'undefined') globalThis.DPS_TIMING_DATA = DPS_TIMING_DATA;\n"
        "if (typeof module !== 'undefined' && module.exports) module.exports = DPS_TIMING_DATA;\n",
        encoding="utf-8",
    )
    print(
        f"Generated {args.output} "
        f"({len(data['apostles'])} apostles, {len(data['warnings'])} warnings)"
    )
    for warning in data["warnings"]:
        print(f"WARNING: {warning}")


if __name__ == "__main__":
    main()
