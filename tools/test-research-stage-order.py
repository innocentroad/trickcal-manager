#!/usr/bin/env python3
"""Focused source validation cases for research acquisition order."""

from copy import deepcopy

from research_data import ResearchDataError, validate_research_rows


HEADERS = ["id", "種族", "ステータス", "段階1", "段階2", "段階11", "取得順11"]
ROWS = [
    {"id": 1, "種族": "妖精", "ステータス": "物理攻撃力", "段階1": 5, "段階2": 10,
     "段階11": 54, "取得順11": 2},
    {"id": 2, "種族": "", "ステータス": "", "段階1": "説明", "段階2": "説明",
     "段階11": "説明", "取得順11": 1},
]


def validate(headers=HEADERS, rows=ROWS):
    # The fixture covers stage 1, 2, 11 with intentionally omitted intermediate
    # stages by supplying blank stage columns (their acquisition count is zero).
    complete_headers = ["id", "種族", "ステータス"] + [f"段階{stage}" for stage in range(1, 12)] + ["取得順11"]
    if headers is not HEADERS:
        complete_headers = headers
    return validate_research_rows(complete_headers, rows)


assert validate()[11] == 2


def rejects(mutator, column):
    rows = deepcopy(ROWS)
    mutator(rows)
    try:
        validate(rows=rows)
    except ResearchDataError as error:
        assert column in str(error), str(error)
        assert "研究効果" in str(error), str(error)
    else:
        raise AssertionError(f"expected error in {column}")


rejects(lambda rows: rows[0].update(id=""), "id")
rejects(lambda rows: rows[0].update(id=2), "id")
rejects(lambda rows: rows[0].update(取得順11=""), "取得順11")
rejects(lambda rows: rows[0].update(取得順11=0), "取得順11")
rejects(lambda rows: rows[0].update(取得順11=1), "取得順11")
rejects(lambda rows: rows[0].update(取得順11=3), "取得順11")
rejects(lambda rows: rows[0].update(段階11=""), "段階11")
rejects(lambda rows: rows[0].update(段階11="bad"), "段階11")
rejects(lambda rows: rows[0].update(種族=""), "種族/ステータス")
try:
    validate(headers=["id", "種族", "ステータス"] + [f"段階{stage}" for stage in range(1, 12)])
except ResearchDataError as error:
    assert "取得順11" in str(error)
else:
    raise AssertionError("missing acquisition-order header accepted")

print("research source validation: OK")
