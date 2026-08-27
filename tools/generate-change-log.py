#!/usr/bin/env python3
"""Compare generated data with the pre-generation backup and write a value log."""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


GENERATED_CONSTANTS = {
    "apostles.js": ("APOSTLE_LIBRARY",),
    "cards.js": (
        "CARD_LIBRARY",
        "CARD_SOLDER_DATA",
        "CARD_ID_ALIASES",
        "CARD_EFFECT_ID_ALIASES",
        "CARD_RANDOM_DEFINITIONS",
    ),
    "statData.js": ("TRICKCAL_STAT_DATA",),
}

# Values in these fields can be intentionally renamed, but a change is worth
# checking because another sheet or runtime feature may refer to the old value.
NOTICE_KEYS = {
    "id",
    "effectId",
    "cardId",
    "skillId",
    "randomId",
    "name",
    "cardName",
    "skillName",
    "targetSkillName",
    "triggerSourceId",
    "conditionValue",
    "status",
    "statusId",
    "stateId",
}

IGNORED_PATH_KEYS = {"generatedAt"}
IDENTITY_KEYS = (
    "effectId",
    "id",
    "cardId",
    "skillId",
    "randomId",
    "name",
    "cardName",
    "skillName",
    "valueKind",
)


def compact_value(value: Any, limit: int = 360) -> str:
    text = json.dumps(value, ensure_ascii=False, separators=(",", ":"))
    if len(text) <= limit:
        return text
    return f"{text[:limit - 3]}..."


def extract_json_constant(text: str, constant_name: str) -> Any:
    marker = f"const {constant_name} ="
    start = text.find(marker)
    if start < 0:
        raise ValueError(f"constant not found: {constant_name}")
    value_start = start + len(marker)
    decoder = json.JSONDecoder()
    value, _ = decoder.raw_decode(text[value_start:].lstrip())
    return value


def load_generated_file(path: Path, constants: tuple[str, ...]) -> dict[str, Any]:
    if not path.exists():
        raise FileNotFoundError(path)
    text = path.read_text(encoding="utf-8")
    result: dict[str, Any] = {}
    for constant_name in constants:
        result[constant_name] = extract_json_constant(text, constant_name)
    return result


def list_item_label(item: Any, index: int) -> str:
    if isinstance(item, dict):
        for key in IDENTITY_KEYS:
            value = item.get(key)
            if value not in (None, ""):
                return f"{key}={compact_value(value, 120)}"
    return str(index)


def child_path(path: str, key: str) -> str:
    return f"{path}.{key}" if path else key


def list_path(path: str, item: Any, index: int) -> str:
    return f"{path}[{list_item_label(item, index)}]"


def leaf_key(path: str) -> str:
    token = path.rsplit(".", 1)[-1]
    token = token.rsplit("[", 1)[-1].rstrip("]")
    return token.split("=", 1)[0]


def compare_values(before: Any, after: Any, path: str, changes: list[tuple[str, str, Any, Any]]) -> None:
    if isinstance(before, dict) and isinstance(after, dict):
        keys = sorted(set(before) | set(after), key=str)
        for key in keys:
            if key in IGNORED_PATH_KEYS:
                continue
            next_path = child_path(path, str(key))
            if key not in before:
                compare_values(None, after[key], next_path, changes)
            elif key not in after:
                compare_values(before[key], None, next_path, changes)
            else:
                compare_values(before[key], after[key], next_path, changes)
        return

    if isinstance(before, list) and isinstance(after, list):
        length = max(len(before), len(after))
        for index in range(length):
            before_item = before[index] if index < len(before) else None
            after_item = after[index] if index < len(after) else None
            item_path = list_path(path, after_item if index < len(after) else before_item, index)
            compare_values(before_item, after_item, item_path, changes)
        return

    if before != after:
        kind = "NOTICE" if leaf_key(path) in NOTICE_KEYS else "CHANGE"
        changes.append((kind, path, before, after))


def load_all(directory: Path) -> dict[str, dict[str, Any]]:
    return {
        file_name: load_generated_file(directory / file_name, constants)
        for file_name, constants in GENERATED_CONSTANTS.items()
    }


def write_log(
    output: Path,
    previous_dir: Path,
    current_dir: Path,
    changes: list[tuple[str, str, Any, Any]],
) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    notice_count = sum(kind == "NOTICE" for kind, *_ in changes)
    change_count = len(changes) - notice_count
    lines = [
        "Trickcal Manager generated value change log",
        f"Generated: {datetime.now(timezone.utc).isoformat(timespec='seconds')}",
        f"Previous: {previous_dir}",
        f"Current: {current_dir}",
        f"Summary: notices={notice_count}, changes={change_count}, total={len(changes)}",
        "",
    ]
    if not changes:
        lines.append("[INFO] No generated value changes.")
    else:
        for kind, path, before, after in changes:
            label = "[NOTICE]" if kind == "NOTICE" else "[CHANGE]"
            lines.append(
                f"{label} {path}: {compact_value(before)} -> {compact_value(after)}"
            )
    output.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--previous-dir", type=Path, required=True)
    parser.add_argument("--current-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    previous = load_all(args.previous_dir)
    current = load_all(args.current_dir)
    changes: list[tuple[str, str, Any, Any]] = []
    for file_name in GENERATED_CONSTANTS:
        compare_values(
            previous[file_name],
            current[file_name],
            f"{file_name}",
            changes,
        )
    write_log(args.output, args.previous_dir, args.current_dir, changes)
    notice_count = sum(kind == "NOTICE" for kind, *_ in changes)
    print(f"Generated change log: {args.output} (notices={notice_count}, changes={len(changes) - notice_count})")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
