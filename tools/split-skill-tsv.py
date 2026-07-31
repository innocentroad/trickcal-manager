#!/usr/bin/env python3
"""Split the exported skill TSV into skill master and effect tables."""

from __future__ import annotations

import argparse
import csv
import re
from collections import Counter, OrderedDict
from pathlib import Path


MASTER_COLUMNS = [
    "skillId",
    "id",
    "使徒名",
    "スキル種別",
    "スキル名",
    "説明",
    "硬直秒",
    "高学年クールタイム秒",
    "スキル発動条件種別",
    "スキル発動条件値",
]

EFFECT_SOURCE_COLUMNS = [
    "値の種類",
    "値分類",
    "効果タイプ",
    "攻撃分類",
    "効果スタック",
    "最大スタック",
    "条件",
    "効果対象",
    "参照",
    "固定値",
    *[f"Lv{level}" for level in range(1, 16)],
]

SKILL_TYPE_SUFFIXES = {
    "低学年": "low",
    "高学年": "high",
    "パッシブ": "passive",
    "普通攻撃_基本": "basic",
    "普通攻撃_強化": "enhanced",
}


def normalize_text(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def is_parameter_caption(value: str) -> bool:
    """Return True for prose cells that are actually numeric effect labels."""
    return bool(
        re.fullmatch(
            r".*(?:持続時間|攻撃回数|発射回数|発射数|クールタイム)[。.]?",
            value,
        )
    )


def ensure_sentence_end(value: str) -> str:
    if not value or value[-1] in "。！？!?）)":
        return value
    return f"{value}。"


def build_skill_description(rows: list[dict[str, str]]) -> str:
    """Build Wiki-style prose from description fragments in source-row order."""
    candidates: list[str] = []
    for row in rows:
        value = normalize_text(row["説明"])
        if value and value not in candidates:
            candidates.append(value)
    if not candidates:
        return ""

    counts = Counter(row["説明"] for row in rows if row["説明"])
    primary = max(candidates, key=lambda value: (counts[value], len(value)))
    narrative = [primary] if not is_parameter_caption(primary) else []

    for candidate in candidates:
        if candidate == primary or is_parameter_caption(candidate):
            continue
        if any(candidate in existing for existing in narrative):
            continue
        # Long competing descriptions usually represent an old/new wording
        # conflict rather than another sentence belonging to the same skill.
        if len(primary) >= 50 and len(candidate) > len(primary) * 0.6:
            continue
        narrative.append(candidate)

    if not narrative:
        return primary
    return " ".join(ensure_sentence_end(value) for value in narrative)


def read_exported_tsv(path: Path) -> tuple[list[str], list[dict[str, str]]]:
    # Google Sheets exports some in-cell line breaks as bare CR characters
    # without TSV quoting. Treat those as spaces before splitting records.
    text = path.read_text(encoding="utf-8-sig")
    text = re.sub(r"\r(?!\n)", " ", text)
    lines = text.splitlines()
    if not lines:
        raise ValueError("入力TSVが空です")

    headers = lines[0].split("\t")
    rows: list[dict[str, str]] = []
    line_index = 1
    while line_index < len(lines):
        line_number = line_index + 1
        record = lines[line_index]
        line_index += 1
        if not record.strip():
            continue
        cells = record.split("\t")
        while len(cells) < len(headers) and line_index < len(lines):
            record = f"{record} {lines[line_index]}"
            line_index += 1
            cells = record.split("\t")
        if len(cells) != len(headers):
            raise ValueError(
                f"{line_number}行目から始まるレコードの列数が不正です: "
                f"expected={len(headers)}, actual={len(cells)}"
            )
        row = {
            header: normalize_text(value) if header == "説明" else value.strip()
            for header, value in zip(headers, cells)
        }
        if not any(
            row[column]
            for column in ("id", "使徒名", "スキル種別", "スキル名", "値の種類")
        ):
            continue
        rows.append(row)
    return headers, rows


def select_group_value(rows: list[dict[str, str]], column: str) -> str:
    values = [row[column] for row in rows if row[column]]
    if not values:
        return ""
    counts = Counter(values)
    return max(counts, key=lambda value: (counts[value], len(value)))


def write_tsv(path: Path, columns: list[str], rows: list[dict[str, str]]) -> None:
    with path.open("w", encoding="utf-8", newline="") as handle:
        writer = csv.DictWriter(
            handle,
            fieldnames=columns,
            delimiter="\t",
            lineterminator="\n",
            extrasaction="ignore",
        )
        writer.writeheader()
        writer.writerows(rows)


def split_skills(
    source: Path, master_output: Path, effect_output: Path, review_output: Path
) -> tuple[int, int, int]:
    headers, source_rows = read_exported_tsv(source)
    required = {
        "id",
        "使徒名",
        "スキル種別",
        "スキル名",
        "説明",
        "硬直秒",
        "高学年クールタイム秒",
        "スキル発動条件種別",
        "スキル発動条件値",
        *EFFECT_SOURCE_COLUMNS,
    }
    missing = sorted(required.difference(headers))
    if missing:
        raise ValueError(f"必須列がありません: {', '.join(missing)}")

    groups: OrderedDict[tuple[str, str, str, str], list[dict[str, str]]] = (
        OrderedDict()
    )
    for row in source_rows:
        skill_type = row["スキル種別"]
        if skill_type not in SKILL_TYPE_SUFFIXES:
            raise ValueError(f"未対応のスキル種別です: {skill_type!r}")
        key = (row["id"], row["使徒名"], skill_type, row["スキル名"])
        groups.setdefault(key, []).append(row)

    master_rows: list[dict[str, str]] = []
    effect_rows: list[dict[str, str]] = []
    review_rows: list[dict[str, str]] = []

    for (apostle_id, apostle_name, skill_type, skill_name), rows in groups.items():
        skill_id = f"{apostle_id}_{SKILL_TYPE_SUFFIXES[skill_type]}"
        description = build_skill_description(rows)
        master_rows.append(
            {
                "skillId": skill_id,
                "id": apostle_id,
                "使徒名": apostle_name,
                "スキル種別": skill_type,
                "スキル名": skill_name,
                "説明": description,
                "硬直秒": select_group_value(rows, "硬直秒"),
                "高学年クールタイム秒": select_group_value(
                    rows, "高学年クールタイム秒"
                ),
                "スキル発動条件種別": select_group_value(
                    rows, "スキル発動条件種別"
                ),
                "スキル発動条件値": select_group_value(
                    rows, "スキル発動条件値"
                ),
            }
        )

        for index, row in enumerate(rows, start=1):
            effect_rows.append(
                {
                    "skillId": skill_id,
                    "effectId": f"{skill_id}_e{index:02d}",
                    **{column: row[column] for column in EFFECT_SOURCE_COLUMNS},
                }
            )

        descriptions = Counter(row["説明"] for row in rows if row["説明"])
        if len(descriptions) > 1:
            for candidate, count in descriptions.most_common():
                related_effects = " / ".join(
                    f"{row['値の種類']}:{row['値分類']}"
                    for row in rows
                    if row["説明"] == candidate
                )
                review_rows.append(
                    {
                        "skillId": skill_id,
                        "使徒名": apostle_name,
                        "スキル種別": skill_type,
                        "スキル名": skill_name,
                        "採用説明": description,
                        "説明候補": candidate,
                        "使用行数": count,
                        "対応効果": related_effects,
                    }
                )

    write_tsv(master_output, MASTER_COLUMNS, master_rows)
    write_tsv(
        effect_output, ["skillId", "effectId", *EFFECT_SOURCE_COLUMNS], effect_rows
    )
    write_tsv(
        review_output,
        [
            "skillId",
            "使徒名",
            "スキル種別",
            "スキル名",
            "採用説明",
            "説明候補",
            "使用行数",
            "対応効果",
        ],
        review_rows,
    )
    return len(master_rows), len(effect_rows), len(review_rows)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("input", type=Path)
    parser.add_argument("--master-output", required=True, type=Path)
    parser.add_argument("--effect-output", required=True, type=Path)
    parser.add_argument("--review-output", required=True, type=Path)
    args = parser.parse_args()

    counts = split_skills(
        args.input, args.master_output, args.effect_output, args.review_output
    )
    print(
        f"skill master={counts[0]}, skill effects={counts[1]}, "
        f"description review rows={counts[2]}"
    )


if __name__ == "__main__":
    main()
