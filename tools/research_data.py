"""Validate research stage values and acquisition orders from the datasheet."""

from __future__ import annotations

import math
import re


STAGE_RE = re.compile(r"^段階([1-9][0-9]*)$")


class ResearchDataError(ValueError):
    pass


def filled(value: object) -> bool:
    return value is not None and value != "" and not (isinstance(value, str) and not value.strip())


def positive_integer(value: object) -> bool:
    if isinstance(value, bool):
        return False
    try:
        number = float(value)
    except (TypeError, ValueError):
        return False
    return math.isfinite(number) and number > 0 and number.is_integer()


def validate_research_rows(headers: list[str], rows: list[dict[str, object]]) -> dict[int, int]:
    """Return stage acquisition counts, raising with sheet/ID/column context."""
    sheet = "研究効果"
    def fail(row_id: object, column: str, reason: str) -> None:
        raise ResearchDataError(f"{sheet} [id={row_id if filled(row_id) else '空欄'}] {column}: {reason}")

    if "id" not in headers:
        fail("", "id", "列がありません")
    stages = sorted(int(match.group(1)) for header in headers if (match := STAGE_RE.fullmatch(header)))
    if not stages or stages != list(range(1, stages[-1] + 1)):
        fail("", "段階", "段階列が1から連続していません")
    for stage in stages:
        if stage >= 11 and f"取得順{stage}" not in headers:
            fail("", f"取得順{stage}", "11段階以降は取得順列が必須です")

    seen_ids: set[int] = set()
    orders: dict[int, dict[int, object]] = {stage: {} for stage in stages}
    for row in rows:
        raw_id = row.get("id")
        if not positive_integer(raw_id):
            fail(raw_id, "id", "正の整数が必要です")
        row_id = int(float(raw_id))
        if row_id in seen_ids:
            fail(row_id, "id", "重複しています")
        seen_ids.add(row_id)
        has_species = filled(row.get("種族"))
        has_stat = filled(row.get("ステータス"))
        if has_species != has_stat:
            fail(row_id, "種族/ステータス", "両方を記入するか両方を空欄にしてください")
        for stage in stages:
            value_column = f"段階{stage}"
            order_column = f"取得順{stage}"
            value = row.get(value_column)
            has_value = filled(value)
            has_order_column = order_column in headers
            order = row.get(order_column) if has_order_column else raw_id
            if has_order_column and has_value != filled(order):
                fail(row_id, order_column if has_value else value_column, "値と取得順は両方を記入してください")
            if not has_value:
                continue
            if not positive_integer(order):
                fail(row_id, order_column if has_order_column else "id", "取得順は正の整数が必要です")
            order_number = int(float(order))
            if order_number in orders[stage]:
                fail(row_id, order_column if has_order_column else "id", f"{stage}段階の取得順{order_number}が重複しています")
            orders[stage][order_number] = row_id
            if has_stat:
                if isinstance(value, bool):
                    fail(row_id, value_column, "ステータス増加値は数値が必要です")
                try:
                    number = float(value)
                except (TypeError, ValueError):
                    fail(row_id, value_column, "ステータス増加値は数値が必要です")
                if not math.isfinite(number):
                    fail(row_id, value_column, "ステータス増加値は有限の数値が必要です")
    for stage, stage_orders in orders.items():
        expected = set(range(1, len(stage_orders) + 1))
        if set(stage_orders) != expected:
            missing = sorted(expected - set(stage_orders))
            fail("", f"取得順{stage}" if f"取得順{stage}" in headers else "id", f"{stage}段階の取得順に欠番があります: {missing}")
    return {stage: len(stage_orders) for stage, stage_orders in orders.items()}
