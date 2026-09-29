#!/usr/bin/env python3
"""Focused regression tests for legacy species-name normalization in generators."""

from __future__ import annotations

import importlib.util
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TOOLS = ROOT / "tools"
sys.path.insert(0, str(TOOLS))

from research_data import normalize_vertical_research  # noqa: E402
from species_names import normalize_species_name  # noqa: E402


def load_generator(filename: str, module_name: str):
    spec = importlib.util.spec_from_file_location(module_name, TOOLS / filename)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {filename}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


apostle_generator = load_generator("generate-apostles.py", "generate_apostles_species_test")
stat_generator = load_generator("generate-stat-data.py", "generate_stat_data_species_test")


class Sheet:
    def __init__(self, rows):
        self.rows = rows

    def iter_rows(self, *, values_only=False):
        assert values_only
        return iter(self.rows)


class Workbook:
    sheetnames = ["使徒基礎設定"]

    def __init__(self):
        self.sheet = Sheet([
            ("id", "使徒名", "性格", "種族", "備考"),
            ("Yomi", "ヨミ", "憂鬱", "？？？", "説明に？？？を含む"),
            ("Other", "試験", "純粋", "ミスティック", ""),
            ("Unknown", "未知", "純粋", "未登録種族", ""),
        ])

    def __getitem__(self, name):
        assert name == "使徒基礎設定"
        return self.sheet


def test_generator_paths():
    assert normalize_species_name("？？？") == "ミスティック"
    assert normalize_species_name("ミスティック") == "ミスティック"
    assert normalize_species_name("未登録種族") == "未登録種族"
    assert normalize_species_name("説明中の？？？") == "説明中の？？？"
    assert normalize_species_name(None) is None

    basic_rows = apostle_generator.read_sheet_rows(Workbook(), "使徒基礎設定")
    by_id = {row["id"]: row for row in basic_rows}
    assert by_id["yomi"]["race"] == "ミスティック"
    assert by_id["other"]["race"] == "ミスティック"
    assert by_id["unknown"]["race"] == "未登録種族"
    assert by_id["yomi"]["notes"] == "説明に？？？を含む"

    def stat_basic(identifier: str, species: str, description: str = ""):
        return {
            "id": identifier, "種族": species, "性格": "純粋", "説明": description,
            "攻撃速度基礎": 100, "戦闘力補正値": 0,
            "戦闘力低学年係数": 0, "戦闘力高学年係数": 0,
            "戦闘力パッシブ係数": 0, "戦闘力アサイド係数": 0,
        }

    normalized_basic = stat_generator.normalize_basic_info([
        stat_basic("old", "？？？", "？？？"),
        stat_basic("new", "ミスティック"),
        stat_basic("unknown", "未登録種族"),
    ])
    assert [row["種族"] for row in normalized_basic] == ["ミスティック", "ミスティック", "未登録種族"]
    assert normalized_basic[0]["説明"] == "？？？"

    def effect(research_id: int, species: str):
        return {
            "研究ID": research_id, "段階": 1, "取得順": research_id,
            "区分": "ステータス", "内容": "物理攻撃力",
            "種族": species, "ステータス": "物理攻撃力", "増加値": research_id,
            "非ステータス効果原値": "", "必要ゴールド": 0,
            "研究時間": 0, "研究時間単位": "秒",
        }

    output = normalize_vertical_research(
        [effect(1, "？？？"), effect(2, "ミスティック"), effect(3, "未登録種族")],
        [], [], [], [],
    )
    assert [row["種族"] for row in output["research"]] == ["ミスティック", "ミスティック", "未登録種族"]


if __name__ == "__main__":
    test_generator_paths()
    print("species name generator compatibility: OK")
