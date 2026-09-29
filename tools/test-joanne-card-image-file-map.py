#!/usr/bin/env python3
"""Validate Joanne's generated spell asset mapping without editing the workbook."""

from __future__ import annotations

import importlib.util
import json
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parent.parent
GENERATOR_PATH = Path(__file__).with_name("generate-card-data.py")
JOANNE_SPELL_ID = "spell_joanne_prayer_power"
JOANNE_SPELL_NAME = "ジョアンの祈りの権能"
JOANNE_SPELL_IMAGE = f"{JOANNE_SPELL_NAME}.webp"
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
    "id": JOANNE_SPELL_ID,
    "種別": "スペル",
    "レア度": "伝説",
    "カード名": JOANNE_SPELL_NAME,
    "Cost_Star1": 30,
}]
fixture_cards, _ = GENERATOR.build_cards(fixture_rows, [], {}, {})
fixture_spell = fixture_cards["spells"][0]
assert fixture_spell["id"] == JOANNE_SPELL_ID
assert fixture_spell["name"] == JOANNE_SPELL_NAME
assert fixture_spell["imageFile"] == JOANNE_SPELL_IMAGE

generated_cards = load_generated_object(
    ROOT / "cards.js",
    "const CARD_LIBRARY = ",
    ";\n\nconst CARD_SOLDER_DATA",
)
card = next(
    item for item in generated_cards["spells"]
    if item.get("id") == JOANNE_SPELL_ID
)
assert card["name"] == JOANNE_SPELL_NAME
assert card["imageFile"] == JOANNE_SPELL_IMAGE
assert (ROOT / "img" / "Card" / "Spell" / JOANNE_SPELL_IMAGE).is_file()
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
share_card = display_data["spells"][JOANNE_SPELL_ID]
assert share_card["name"] == JOANNE_SPELL_NAME
assert share_card["imagePath"].startswith(f"img/Card/Spell/{JOANNE_SPELL_IMAGE}?v=")
assert "SpellCardIcon_58.webp" not in share_card["imagePath"]

print("Joanne card image/normal stat/shield mapping checks passed.")
