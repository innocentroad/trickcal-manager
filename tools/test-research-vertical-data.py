#!/usr/bin/env python3
"""Compare every saved research progress with the retained horizontal source."""

import importlib.util
from pathlib import Path
from collections import defaultdict

from research_data import normalize_vertical_research, ResearchDataError, validate_research_rows


ROOT = Path(__file__).resolve().parent
spec = importlib.util.spec_from_file_location("stat_generator", ROOT / "generate-stat-data.py")
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)
workbook = generator.read_workbook(ROOT / "trickcal_datasheet.xlsx")
objects = lambda name: generator.rows_to_objects(workbook[name])
old = objects("研究効果_旧")
new_raw = objects("研究効果")
catalog = generator.read_tsv_objects(ROOT / "research-material-master.tsv")
normalized = normalize_vertical_research(
    new_raw, objects("研究素材"), objects("素材製作レシピ"),
    objects("施設強化素材"), catalog,
)
rows = normalized["research"]
assert len(rows) == 544
assert len(normalized["researchRecipes"]) == 17
assert "researchFacilities" not in normalized, "施設費用は検証のみで公開データへ含めない"
assert len(normalized["researchMaterialCatalog"]) == 28
assert all("旧効果ID" not in row for row in rows)
images = ROOT.parent / "img" / "Materials"
mapped_names = {row["画像キー"] for row in catalog if row["画像キー"]}
assert len(mapped_names) == 28
assert mapped_names == {path.name for path in images.iterdir() if path.is_file()}
assert {Path(name).suffix for name in mapped_names} == {".png", ".webp"}
assert next(row for row in normalized["researchMaterialCatalog"] if row["name"] == "ゴールド")["imageKey"] == "ゴールド.webp"
assert next(row for row in normalized["researchMaterialCatalog"] if row["name"] == "地球から来た鉛")["imageKey"] == "地球から来た鉛.png"
first_stage = [row for row in rows if row["段階"] == 1]
assert len(first_stage) == 45
assert sum(row["必要ゴールド"] for row in first_stage) == 230000
last = first_stage[-1]
assert last["研究ID"] == 45001 and last["取得順"] == 45
assert last["必要ゴールド"] == 10000 and last["素材"] == [{"name": "曲がった針金", "count": 3}]
assert first_stage[0]["素材"] == [{"name": "地球から来た鉛", "count": 3}]
assert next(row for row in normalized["researchRecipes"] if row["name"] == "地球から来た鉛") == {
    "name": "地球から来た鉛", "stage": 1, "outputCount": 1, "seconds": 300,
    "materials": [{"name": "サラサラの鉄粉", "count": 3}],
}

old_by_id = {int(row["id"]): row for row in old}
for row in new_raw:
    previous = old_by_id[int(row["旧効果ID"])]
    stage = int(row["段階"])
    assert row["内容"] == previous["内容"]
    assert row["種族"] == previous["種族"]
    assert row["ステータス"] == previous["ステータス"]
    source_value = row["増加値"] if row["種族"] else row["非ステータス効果原値"]
    assert source_value == previous[f"段階{stage}"], (row["研究ID"], stage)

headers = list(old[0])
limits = validate_research_rows(headers, old)
assert limits == {**{stage: 45 for stage in range(1, 11)}, 11: 47, 12: 47}

def old_totals(stage, progress):
    totals = defaultdict(float)
    if not stage or not progress:
        return totals
    for row in old:
        if not row.get("種族") or not row.get("ステータス"):
            continue
        key = (row["種族"], row["ステータス"])
        for step in range(1, stage + 1):
            value = row.get(f"段階{step}")
            if value == "":
                continue
            order = row.get(f"取得順{step}") if step >= 11 else row["id"]
            if step < stage or int(order) <= progress:
                totals[key] += float(value)
    return totals

def new_totals(stage, progress):
    totals = defaultdict(float)
    if not stage or not progress:
        return totals
    for row in rows:
        if not row["種族"]:
            continue
        if row["段階"] < stage or (row["段階"] == stage and row["取得順"] <= progress):
            totals[(row["種族"], row["ステータス"])] += row["増加値"]
    return totals

assert old_totals(0, 0) == new_totals(0, 0)
for stage, count in limits.items():
    for progress in range(count + 1):
        before, after = old_totals(stage, progress), new_totals(stage, progress)
        assert before == after, f"stage {stage} progress {progress}: {before} != {after}"

for key, expected_column in [
    ("研究ID", "研究ID"), ("取得順", "取得順"), ("必要ゴールド", "必要ゴールド"),
]:
    broken = [dict(row) for row in new_raw]
    broken[0][key] = ""
    try:
        normalize_vertical_research(broken, objects("研究素材"), objects("素材製作レシピ"), objects("施設強化素材"), catalog)
    except ResearchDataError as error:
        assert "研究効果 行2" in str(error) and expected_column in str(error)
    else:
        raise AssertionError(f"missing {key} was accepted")

def reject(sheet, effects=new_raw, materials=None, recipes=None, facilities=None, master=catalog, column=""):
    try:
        normalize_vertical_research(
            effects, materials if materials is not None else objects("研究素材"),
            recipes if recipes is not None else objects("素材製作レシピ"),
            facilities if facilities is not None else objects("施設強化素材"), master,
        )
    except ResearchDataError as error:
        assert sheet in str(error) and column in str(error), error
    else:
        raise AssertionError(f"invalid {sheet}/{column} was accepted")

bad_effects = [dict(row) for row in new_raw]
bad_effects[1]["取得順"] = bad_effects[0]["取得順"]
reject("研究効果 行3", effects=bad_effects, column="取得順")
bad_materials = objects("研究素材")
bad_materials[0]["必要数"] = 0
reject("研究素材 行2", materials=bad_materials, column="必要数")
bad_materials = objects("研究素材")
bad_materials[0]["素材名（参照用）"] = "似た素材"
reject("研究素材 行2", materials=bad_materials, column="素材名（参照用）")
bad_recipes = objects("素材製作レシピ")
bad_recipes[0]["必要数1"] = ""
reject("素材製作レシピ 行2", recipes=bad_recipes, column="材料1/必要数1")
catalog_without_image = [dict(row) for row in catalog]
catalog_without_image[6]["画像キー"] = ""
fallback = normalize_vertical_research(
    new_raw, objects("研究素材"), objects("素材製作レシピ"),
    objects("施設強化素材"), catalog_without_image,
)
assert any(entry["name"] == "地球から来た鉛" and entry["imageKey"] == ""
           for entry in fallback["researchMaterialCatalog"])
for filename in ("../地球から来た鉛.png", "/tmp/test.png", "C:\\test.png",
                 "https://example.com/test.png", "地球から来た鉛.svg", "地球から来た鉛.PNG",
                 "存在しない素材.png"):
    invalid_catalog = [dict(row) for row in catalog]
    invalid_catalog[6]["画像キー"] = filename
    reject("素材マスター 行8", master=invalid_catalog, column="画像キー")

print("research 544 rows; all 12 stages and every progress match; references and errors: OK")
