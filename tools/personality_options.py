"""Normalize per-apostle selectable personality data from the basic sheet."""

PERSONALITIES = {"純粋", "冷静", "狂気", "活発", "憂鬱"}


def normalize_personality_options(row, *, personality_key="性格", options_key="性格候補", output_key="personalityOptions"):
    base = str(row.get(personality_key) or "").strip()
    label = f"{row.get('id') or '<ID不明>'}: {options_key}"
    value = row.pop(options_key, None)
    if value is None or value == "":
        if base in PERSONALITIES or base == "共鳴":
            return row
        raise ValueError(f"{label}が必要です（分類: {base or '空欄'}）")
    if not isinstance(value, str):
        raise ValueError(f"{label}はカンマ区切りの文字列で指定してください")
    options = [part.strip() for part in value.split(",")]
    if not 2 <= len(options) <= 5:
        raise ValueError(f"{label}は2～5性格が必要です（{len(options)}件）")
    unknown = [option for option in options if option not in PERSONALITIES]
    if unknown:
        raise ValueError(f"{label}に未知の性格があります: {', '.join(unknown)}")
    if len(set(options)) != len(options):
        raise ValueError(f"{label}に重複した性格があります")
    if base in PERSONALITIES:
        raise ValueError(f"{label}は固定性格と併用できません")
    if not base:
        raise ValueError(f"{label}には分類名（{personality_key}）が必要です")
    row[output_key] = options
    return row
