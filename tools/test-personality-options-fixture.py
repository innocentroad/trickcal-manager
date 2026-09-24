import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
from personality_options import normalize_personality_options

for count in (2, 3, 4, 5):
    options = ["純粋", "冷静", "狂気", "活発", "憂鬱"][:count]
    row = normalize_personality_options({"id": f"fixture-{count}", "性格": "裏面", "性格候補": ",".join(options)})
    assert row["personalityOptions"] == options
    assert "性格候補" not in row
assert "personalityOptions" not in normalize_personality_options({"性格": "純粋"})
for raw in ("純粋,純粋", "純粋,未知", "純粋", "純粋,冷静,狂気,活発,憂鬱,純粋"):
    try:
        normalize_personality_options({"性格": "裏面", "性格候補": raw})
        raise AssertionError(raw)
    except ValueError:
        pass
try:
    normalize_personality_options({"性格": "純粋", "性格候補": "純粋,憂鬱"})
    raise AssertionError("fixed personality accepted")
except ValueError:
    pass
for base in ("裏面", "未知分類", ""):
    for raw in (None, ""):
        row = {"id": "Joanne", "性格": base}
        if raw is not None:
            row["性格候補"] = raw
        try:
            normalize_personality_options(row)
            raise AssertionError((base, raw))
        except ValueError as error:
            assert "Joanne" in str(error) and "性格候補" in str(error)
assert "personalityOptions" not in normalize_personality_options({"id": "resonance", "性格": "共鳴"})
print("generator personality options fixture: OK")
