"""Check source values, independent multiplier examples, and unsafe input rejection."""
import importlib.util
from pathlib import Path

from equipment_data import normalize_equipment_values


def run():
    row = {"rank": 1, "tier": 1, "ステータス": "HP", "装備名": "赤いエプロン",
           "強化なし": 1707, **{f"強化倍率+{i}": multiplier for i, multiplier in
                                enumerate([1.07, 1.14, 1.21, 1.28, 1.35], 1)}}
    actual = normalize_equipment_values([row])[0]
    assert abs(actual["enhance1"] - 1826.49) < 1e-9
    assert abs(actual["enhance2"] - 1945.98) < 1e-9  # NOT 1707 * 1.07 * 1.14.
    assert abs(actual["enhance5"] - 2304.45) < 1e-9
    assert normalize_equipment_values([{**row, "強化なし": 0}])[0]["enhance1"] == 0
    for bad in (None, "", "invalid", float("nan"), float("inf"), 0.07, True):
        try:
            normalize_equipment_values([{**row, "強化倍率+2": bad}])
        except ValueError as error:
            assert "強化倍率+2" in str(error) and "赤いエプロン" in str(error)
        else:
            raise AssertionError(f"accepted invalid multiplier: {bad!r}")
    old_only = {key: value for key, value in row.items() if not key.startswith("強化倍率")}
    old_only["強化+1"] = 1826
    for rows in ([], [row, row], [old_only]):
        try:
            normalize_equipment_values(rows)
        except ValueError:
            pass
        else:
            raise AssertionError("accepted empty, duplicate, or obsolete source")

    root = Path(__file__).resolve().parent
    spec = importlib.util.spec_from_file_location("generator", root / "generate-stat-data.py")
    generator = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(generator)
    workbook = generator.read_workbook(root / "trickcal_datasheet.xlsx")
    new = normalize_equipment_values(generator.rows_to_objects(workbook["装備効果"]))
    old = generator.rows_to_objects(workbook["装備効果_旧"])
    key = lambda item: (item["rank"], item["ステータス"], item["tier"])
    old_by_key = {key(item): item for item in old}
    assert set(map(key, new)) == set(old_by_key)
    for item in new:
        previous = old_by_key[key(item)]
        assert item["equipName"] == previous["装備名"]
        assert item["enhance0"] == previous["強化なし"]
    assert "装備効果_旧" not in generator.SHEET_KEYS
    print(f"Equipment source: {len(new)} rows; identity/base unchanged; multiplier checks passed")


if __name__ == "__main__":
    run()
