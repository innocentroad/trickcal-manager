#!/usr/bin/env python3
"""Regression checks for optional stackGroupId generator plumbing."""

from __future__ import annotations

import importlib.util
from pathlib import Path
from types import ModuleType


TOOLS_DIR = Path(__file__).resolve().parent


def load_script(name: str, filename: str) -> ModuleType:
    spec = importlib.util.spec_from_file_location(name, TOOLS_DIR / filename)
    if spec is None or spec.loader is None:
        raise RuntimeError(f"cannot load {filename}")
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


apostles = load_script("generate_apostles", "generate-apostles.py")
cards = load_script("generate_card_data", "generate-card-data.py")
stats = load_script("generate_stat_data", "generate-stat-data.py")

assert apostles.KEY_MAP["スタックグループID"] == "stackGroupId"
assert apostles.KEY_MAP["スタック集約ID"] == "stackGroupId"
assert apostles.has_effect_payload({"stackGroupId": "frostbite_shared"})

card_effect: dict[str, object] = {}
cards.copy_runtime_effect_fields(
    {"スタックグループID": "frostbite_shared"},
    card_effect,
)
assert card_effect["stackGroupId"] == "frostbite_shared"

normalized = stats.normalize_skill_rows([
    {"スタック集約ID": "frostbite_shared", "effectId": "sample_e01"}
])[0]
assert normalized["stackGroupId"] == "frostbite_shared"
assert "スタック集約ID" not in normalized

print("stackGroupId generator tests passed")
