"""Independent small workbooks exercise new schema rejection and unknown timing."""
import importlib.util
import tempfile
from pathlib import Path
from openpyxl import Workbook

spec = importlib.util.spec_from_file_location("timing_generator", Path(__file__).with_name("generate-dps-timing-data.py"))
generator = importlib.util.module_from_spec(spec)
spec.loader.exec_module(generator)

def make_book():
    book = Workbook()
    book.remove(book.active)
    sheets = {
        "スキル速度": [["id", "使徒", "動作名", "モーション値", "モーション単位"]],
        "スキルタイミング": [["id", "使徒", "動作名", "発生値"]],
        "対応状況": [["id", "使徒名", "通常", "アサイド", "愛用品", "備考"], ["fixture", "fixture", "暫定", "未", "未", ""]],
        "生成物基礎設定": [["生成物ID", "id", "使徒", "動作名", "実行方式", "攻撃速度参照", "攻撃速度基礎"],
                          ["clone", "fixture", "fixture", "低学年", "召喚ユニット", "生成物自身", 150]],
        "召喚ユニット行動": [["生成物ID", "行動ID", "行動種別", "モーション値", "モーション単位"],
                          ["clone", "attack", "通常攻撃", 58, "ゲームF"]],
        "生成物タイミング": [["生成物ID", "行動ID", "記録用途", "イベント種別", "発生値", "発生単位", "時間基準"],
                          ["clone", "attack", "実行", "行動開始", None, "ゲームF", "生成時"],
                          ["clone", "attack", "実行", "攻撃", None, "ゲームF", "召喚ユニット行動開始"]]
    }
    for name, rows in sheets.items():
        sheet = book.create_sheet(name)
        for row in rows:
            sheet.append(row)
    return book

with tempfile.TemporaryDirectory() as directory:
    file = Path(directory) / "fixture.xlsx"
    def generate(book):
        book.save(file)
        return generator.build_data(file, dict(generator.DEFAULT_SHEETS))
    data = generate(make_book())
    assert data["summary"]["summonActions"] == 1
    # The fixture lacks a player's motion/interval, so it is correctly incomplete;
    # generation still preserves the summon metadata and detects missing values.
    assert data["incompleteApostles"][0]["id"] == "fixture"
    cases = [
        ("召喚ユニット行動", "B2", "", "行動ID"),
        ("召喚ユニット行動", "D2", -1, "モーション"),
        ("生成物タイミング", "B2", "wrong", "行動ID"),
        ("生成物タイミング", "C2", "wrong", "記録用途"),
        ("生成物タイミング", "E2", -1, "発生値"),
        ("生成物タイミング", "E3", 59, "モーション長"),
        ("生成物基礎設定", "E2", "wrong", "実行方式"),
    ]
    for sheet, cell, value, message in cases:
        book = make_book()
        book[sheet][cell] = value
        try:
            generate(book)
            raise AssertionError(f"invalid input accepted: {sheet}!{cell}")
        except ValueError as error:
            assert message in str(error), str(error)
        finally:
            book.close()
print("Summon schema references, invalid timing and missing-input validation passed")
