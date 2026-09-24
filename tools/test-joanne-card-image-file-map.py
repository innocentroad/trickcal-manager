#!/usr/bin/env python3
"""Validate Joanne's generated spell asset mapping without editing the workbook."""

from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
GENERATOR_PATH = Path(__file__).with_name("generate-card-data.py")
SPEC = importlib.util.spec_from_file_location("generate_card_data", GENERATOR_PATH)
if SPEC is None or SPEC.loader is None:
    raise RuntimeError("カード生成器を読み込めません")
GENERATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(GENERATOR)


def load_generated_object(path: Path, prefix: str, suffix: str) -> dict:
    source = path.read_text(encoding="utf-8")
    match = re.search(re.escape(prefix) + r"(.*?)" + re.escape(suffix), source, re.S)
    if not match:
        raise AssertionError(f"生成オブジェクトが見つかりません: {path}")
    return json.loads(match.group(1))


fixture_rows = [{
    "id": "spell_joanne_prayer_power",
    "種別": "スペル",
    "レア度": "伝説",
    "カード名": "ジョアンの祈りの権能",
    "Cost_Star1": 30,
}]
fixture_cards, _ = GENERATOR.build_cards(fixture_rows, [], {}, {})
assert fixture_cards["spells"][0]["imageFile"] == "SpellCardIcon_58.webp"

generated_cards = load_generated_object(
    ROOT / "cards.js",
    "const CARD_LIBRARY = ",
    ";\n\nconst CARD_SOLDER_DATA",
)
card = next(
    item for item in generated_cards["spells"]
    if item.get("id") == "spell_joanne_prayer_power"
)
assert card["imageFile"] == "SpellCardIcon_58.webp"
assert (ROOT / "img" / "Card" / "Spell" / card["imageFile"]).is_file()
assert "hpP" in json.dumps(card.get("bonusesByStar", []), ensure_ascii=False)
assert "defP" in json.dumps(card.get("bonusesByStar", []), ensure_ascii=False)
shield = next(
    effect for effect in card.get("conditionalEffects", [])
    if effect.get("id") == "spell_joanne_prayer_power_e01"
)
shield_text = json.dumps(shield.get("bonusesByStar", []), ensure_ascii=False)
assert "shieldEffectP" in shield_text
assert "addP" not in shield_text

display_data = load_generated_object(
    ROOT / "formation-share-display-data.js",
    "const FORMATION_SHARE_DISPLAY_DATA = ",
    ";\n\nif (typeof globalThis",
)
share_card = display_data["spells"]["spell_joanne_prayer_power"]
assert share_card["imagePath"].startswith("img/Card/Spell/SpellCardIcon_58.webp?v=")

print("Joanne card image/normal stat/shield mapping checks passed.")
