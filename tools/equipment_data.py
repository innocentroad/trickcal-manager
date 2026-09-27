"""Equipment source contract: each enhancement multiplier is relative to base."""

import math


def normalize_equipment_values(rows: list[dict[str, object]]) -> list[dict[str, object]]:
    if not rows:
        raise ValueError("装備効果: データ行がありません")
    stat_names = {
        "物理攻撃": "物理攻撃力", "魔法攻撃": "魔法攻撃力",
        "物理防御": "物理防御力", "魔法防御": "魔法防御力",
    }
    normalized = []
    seen = set()
    for line, row in enumerate(rows, start=2):
        label = f"装備効果 行{line} ({row.get('装備名', '')})"

        def number(column, minimum):
            raw = row.get(column)
            if raw is None or isinstance(raw, bool) or str(raw).strip() == "":
                raise ValueError(f"{label} {column}: 数値が必要です")
            try:
                value = float(raw)
            except (TypeError, ValueError):
                raise ValueError(f"{label} {column}: 数値が必要です") from None
            if not math.isfinite(value) or value < minimum:
                raise ValueError(f"{label} {column}: {minimum}以上の有限数が必要です")
            return value

        rank, tier = number("rank", 1), number("tier", 1)
        if not rank.is_integer() or not tier.is_integer():
            raise ValueError(f"{label} rank/tier: 整数が必要です")
        stat = str(row.get("ステータス") or "").strip()
        group = stat_names.get(stat, stat)
        if group not in {"HP", "物理攻撃力", "魔法攻撃力", "物理防御力", "魔法防御力",
                         "会心/会心DMG", "会心抵抗/会心DMG抵抗"}:
            raise ValueError(f"{label} ステータス: 未対応の値 {stat!r}")
        name = str(row.get("装備名") or "").strip()
        if not name:
            raise ValueError(f"{label} 装備名: 空欄です")
        key = (int(rank), group, int(tier))
        if key in seen:
            raise ValueError(f"{label} rank/ステータス/tier: 重複 {key}")
        seen.add(key)
        item = dict(row)
        item.update(statGroup=group, equipName=name, enhance0=number("強化なし", 0))
        for enhance in range(1, 6):
            column = f"強化倍率+{enhance}"
            multiplier = number(column, 1)
            value = item["enhance0"] * multiplier
            if not math.isfinite(value):
                raise ValueError(f"{label} {column}: 基礎値との積が有限数ではありません")
            # No intermediate truncation, decimal rounding, or repeated multiplication.
            item[f"enhance{enhance}"] = value
        normalized.append(item)
    return normalized
