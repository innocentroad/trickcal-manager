"""Validate research stage values and acquisition orders from the datasheet."""

from __future__ import annotations

import math
import re
from pathlib import Path


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


def normalize_vertical_research(
    effects: list[dict[str, object]], materials: list[dict[str, object]],
    recipes: list[dict[str, object]], facilities: list[dict[str, object]],
    catalog: list[dict[str, object]],
    image_dir: Path | None = None,
) -> dict[str, list[dict[str, object]]]:
    """Validate the user-facing sheets and emit only the public research fields."""
    def fail(sheet: str, row: int, column: str, reason: str) -> None:
        raise ResearchDataError(f"{sheet} 行{row} {column}: {reason}")

    def integer(value: object, sheet: str, row: int, column: str, *, zero: bool = False) -> int:
        if isinstance(value, bool) or not filled(value):
            fail(sheet, row, column, "整数が必要です")
        try:
            number = float(value)
        except (TypeError, ValueError):
            fail(sheet, row, column, "整数が必要です")
        if not math.isfinite(number) or not number.is_integer() or number < (0 if zero else 1):
            fail(sheet, row, column, "有効な整数が必要です")
        return int(number)

    def number(value: object, sheet: str, row: int, column: str) -> float | int:
        if isinstance(value, bool) or not filled(value):
            fail(sheet, row, column, "数値が必要です")
        try:
            result = float(value)
        except (TypeError, ValueError):
            fail(sheet, row, column, "数値が必要です")
        if not math.isfinite(result):
            fail(sheet, row, column, "有限の数値が必要です")
        return int(result) if result.is_integer() else result

    def ingredients(source: dict[str, object], sheet: str, row: int) -> list[dict[str, object]]:
        result = []
        for index in (1, 2):
            name = source.get(f"材料{index}")
            count = source.get(f"必要数{index}")
            if filled(name) != filled(count):
                fail(sheet, row, f"材料{index}/必要数{index}", "両方記入するか両方空欄にしてください")
            if filled(name):
                result.append({"name": str(name), "count": integer(count, sheet, row, f"必要数{index}")})
        if len({item["name"] for item in result}) != len(result):
            fail(sheet, row, "材料", "同じ素材が重複しています")
        return result

    image_keys: dict[str, str] = {}
    image_dir = (image_dir or Path(__file__).resolve().parent.parent / "img" / "Materials").resolve()
    for row_number, row in enumerate(catalog, 2):
        name, key = row.get("素材名"), row.get("画像キー")
        if not filled(name):
            fail("素材マスター", row_number, "素材名", "名称が必要です")
        if filled(key):
            filename = str(key)
            if (not re.fullmatch(r'[^<>:"/\\|?*\x00-\x1f]+\.(?:png|webp)', filename)
                    or filename.startswith(".")):
                fail("素材マスター", row_number, "画像キー", f"素材「{name}」の不正なファイル名: {filename}")
            image_path = (image_dir / filename).resolve()
            if image_path.parent != image_dir or not image_path.is_file():
                fail("素材マスター", row_number, "画像キー", f"素材「{name}」の画像がありません: {filename}")
        if name in image_keys:
            fail("素材マスター", row_number, "素材名", "重複しています")
        image_keys[str(name)] = str(key) if filled(key) else ""

    def known(name: object, sheet: str, row: int, column: str) -> str:
        if not filled(name) or str(name) not in image_keys:
            fail(sheet, row, column, f"素材マスターに完全一致する名称がありません: {name}")
        return str(name)

    research: list[dict[str, object]] = []
    by_id: dict[int, tuple[int, int]] = {}
    orders: dict[int, set[int]] = {}
    for row_number, row in enumerate(effects, 2):
        sheet = "研究効果"
        research_id = integer(row.get("研究ID"), sheet, row_number, "研究ID")
        if research_id in by_id:
            fail(sheet, row_number, "研究ID", f"重複しています（先行行{by_id[research_id][1]}）")
        stage = integer(row.get("段階"), sheet, row_number, "段階")
        order = integer(row.get("取得順"), sheet, row_number, "取得順")
        if order in orders.setdefault(stage, set()):
            fail(sheet, row_number, "取得順", f"{stage}段階で重複しています")
        orders[stage].add(order)
        if not filled(row.get("内容")) or not filled(row.get("区分")):
            fail(sheet, row_number, "区分/内容", "必須です")
        species, stat = row.get("種族"), row.get("ステータス")
        if filled(species) != filled(stat):
            fail(sheet, row_number, "種族/ステータス", "両方記入するか両方空欄にしてください")
        value = row.get("増加値")
        raw_effect = row.get("非ステータス効果原値")
        if filled(stat):
            value = number(value, sheet, row_number, "増加値")
        elif filled(value) or not filled(raw_effect):
            fail(sheet, row_number, "増加値/非ステータス効果原値", "非ステータス効果の原値が必要です")
        if row.get("研究時間単位") != "秒":
            fail(sheet, row_number, "研究時間単位", "秒が必要です")
        research.append({
            "研究ID": research_id, "段階": stage, "取得順": order,
            "区分": row["区分"], "内容": row["内容"],
            "種族": species if filled(species) else "", "ステータス": stat if filled(stat) else "",
            "増加値": value if filled(stat) else "",
            "非ステータス効果原値": raw_effect if filled(raw_effect) else "",
            "必要ゴールド": integer(row.get("必要ゴールド"), sheet, row_number, "必要ゴールド", zero=True),
            "研究時間": integer(row.get("研究時間"), sheet, row_number, "研究時間", zero=True),
            "研究時間単位": "秒",
        })
        by_id[research_id] = (stage, row_number)
    if sorted(orders) != list(range(1, max(orders, default=0) + 1)):
        fail("研究効果", 1, "段階", "1から連続する段階が必要です")
    for stage, values in orders.items():
        if values != set(range(1, len(values) + 1)):
            fail("研究効果", 1, "取得順", f"{stage}段階に欠番があります")
    research.sort(key=lambda row: (row["段階"], row["取得順"]))

    material_by_id: dict[int, list[dict[str, object]]] = {}
    for row_number, row in enumerate(materials, 2):
        sheet = "研究素材"
        research_id = integer(row.get("研究ID"), sheet, row_number, "研究ID")
        stage = integer(row.get("段階"), sheet, row_number, "段階")
        if research_id not in by_id or by_id[research_id][0] != stage:
            fail(sheet, row_number, "研究ID/段階", "研究効果に一致する行がありません")
        name = known(row.get("素材名（参照用）"), sheet, row_number, "素材名（参照用）")
        group = material_by_id.setdefault(research_id, [])
        if any(item["name"] == name for item in group):
            fail(sheet, row_number, "素材名（参照用）", "研究内で重複しています")
        group.append({"name": name, "count": integer(row.get("必要数"), sheet, row_number, "必要数")})
    for row in research:
        row["素材"] = material_by_id.get(row["研究ID"], [])

    output_recipes = []
    recipe_names = set()
    for row_number, row in enumerate(recipes, 2):
        sheet = "素材製作レシピ"
        name = known(row.get("完成素材"), sheet, row_number, "完成素材")
        if name in recipe_names:
            fail(sheet, row_number, "完成素材", "重複しています")
        recipe_names.add(name)
        items = ingredients(row, sheet, row_number)
        if not items:
            fail(sheet, row_number, "材料1", "少なくとも1つ必要です")
        for item in items:
            known(item["name"], sheet, row_number, "材料")
        if row.get("時間単位") != "秒":
            fail(sheet, row_number, "時間単位", "秒が必要です")
        output_recipes.append({
            "name": name, "stage": integer(row.get("レシピ段階"), sheet, row_number, "レシピ段階"),
            "outputCount": integer(row.get("完成数"), sheet, row_number, "完成数"),
            "seconds": integer(row.get("製作時間"), sheet, row_number, "製作時間", zero=True),
            "materials": items,
        })

    transitions = set()
    for row_number, row in enumerate(facilities, 2):
        sheet = "施設強化素材"
        name = row.get("施設")
        if not filled(name):
            fail(sheet, row_number, "施設", "必須です")
        before = integer(row.get("変更前Lv"), sheet, row_number, "変更前Lv")
        after = integer(row.get("変更後Lv"), sheet, row_number, "変更後Lv")
        if after != before + 1:
            fail(sheet, row_number, "変更後Lv", "変更前Lvの次のレベルが必要です")
        key = (name, before, after)
        if key in transitions:
            fail(sheet, row_number, "施設/変更前Lv", "重複しています")
        transitions.add(key)
        items = ingredients(row, sheet, row_number)
        for item in items:
            known(item["name"], sheet, row_number, "材料")
        integer(row.get("必要ゴールド"), sheet, row_number, "必要ゴールド", zero=True)

    return {"research": research, "researchRecipes": output_recipes,
            "researchMaterialCatalog": [{"name": name, "imageKey": key} for name, key in image_keys.items()]}
