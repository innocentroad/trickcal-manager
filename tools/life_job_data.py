#!/usr/bin/env python3
"""Normalize the workbook's life-job sheets for browsing and direct lookup."""

from __future__ import annotations

import hashlib
import json
import re
from pathlib import Path
from typing import Any


class LifeJobDataError(ValueError):
    pass


def _fail(sheet: str, row: int, column: str, reason: str) -> None:
    raise LifeJobDataError(f"{sheet} 行{row} {column}: {reason}")


def _row_number(row: dict[str, Any], fallback: int) -> int:
    try:
        return int(row.get("__sourceRow", fallback))
    except (TypeError, ValueError):
        return fallback


def _require_headers(sheet: str, headers: list[str], required: tuple[str, ...]) -> None:
    missing = [name for name in required if name not in headers]
    if missing:
        _fail(sheet, 1, ", ".join(missing), "必須列がありません")


def _text(value: Any, sheet: str, row: int, column: str, *, required: bool = True) -> str:
    if value is None:
        value = ""
    text = str(value)
    if not text.strip():
        if required:
            _fail(sheet, row, column, "値が必要です")
        return ""
    if text != text.strip():
        _fail(sheet, row, column, "前後の空白を除いてください")
    return text


def _positive_integer(value: Any, sheet: str, row: int, column: str) -> int:
    if isinstance(value, bool):
        _fail(sheet, row, column, "正の整数が必要です")
    try:
        number = float(value)
    except (TypeError, ValueError):
        _fail(sheet, row, column, "正の整数が必要です")
    if not number.is_integer() or number < 1 or number > 9007199254740991:
        _fail(sheet, row, column, "安全な範囲の正の整数が必要です")
    return int(number)


def _nonnegative_integer(value: Any, sheet: str, row: int, column: str) -> int:
    if not isinstance(value, bool) and value not in (None, "") and str(value) in ("0", "0.0"):
        return 0
    return _positive_integer(value, sheet, row, column)


def _stable_id(prefix: str, parts: tuple[str, ...]) -> str:
    source = json.dumps(parts, ensure_ascii=False, separators=(",", ":"))
    return f"{prefix}_{hashlib.sha256(source.encode('utf-8')).hexdigest()[:16]}"


def _safe_image_file(name: str, material: str, image_dir: Path) -> str:
    if not re.fullmatch(r'[^<>:"/\\|?*\x00-\x1f]+\.(?:png|webp)', name, flags=re.IGNORECASE) or name.startswith("."):
        raise LifeJobDataError(f"素材「{material}」の画像対応表に不正なファイル名があります: {name}")
    resolved_dir = image_dir.resolve()
    image_path = (resolved_dir / name).resolve()
    if image_path.parent != resolved_dir or not image_path.is_file():
        raise LifeJobDataError(f"素材「{material}」の画像がありません: {name}")
    return name


def normalize_life_job_data(
    item_rows: list[dict[str, Any]],
    *,
    headers: dict[str, list[str]],
    material_catalog: list[dict[str, Any]],
    basic_info: list[dict[str, Any]],
    public_apostle_ids: set[str],
    material_image_dir: Path,
    apostle_image_dir: Path,
    life_job_material_image_map: list[dict[str, Any]] | None = None,
    resume_reward_headers: list[str] | None = None,
    resume_reward_rows: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Build the public material lookup from workbook resume rows only."""
    item_sheet = "アイテム基礎"
    _require_headers(item_sheet, headers[item_sheet], ("素材名", "分類", "素材等級"))

    item_by_name: dict[str, dict[str, Any]] = {}
    for index, item in enumerate(item_rows, 2):
        row_no = _row_number(item, index)
        name = _text(item.get("素材名"), item_sheet, row_no, "素材名")
        if name in item_by_name:
            _fail(item_sheet, row_no, "素材名", f"重複しています（先行行{_row_number(item_by_name[name], 0)}）")
        item_by_name[name] = item

    catalog_by_name: dict[str, dict[str, Any]] = {}
    for index, entry in enumerate(material_catalog, 2):
        name = str(entry.get("name", ""))
        if name in catalog_by_name:
            raise LifeJobDataError(f"研究素材カタログ: 素材「{name}」が重複しています")
        catalog_by_name[name] = entry

    image_map_sheet = "アルバイト素材画像対応表"
    for index, entry in enumerate(life_job_material_image_map or [], 2):
        row_no = _row_number(entry, index)
        name = _text(entry.get("素材名"), image_map_sheet, row_no, "素材名")
        filename = _text(entry.get("画像ファイル名"), image_map_sheet, row_no, "画像ファイル名")
        if not filename.lower().endswith(".webp"):
            _fail(image_map_sheet, row_no, "画像ファイル名", "WebPファイル名が必要です")
        if name not in item_by_name:
            _fail(image_map_sheet, row_no, "素材名", f"アイテム基礎に完全一致する素材がありません: {name}")
        if item_by_name[name].get("分類") != "素材":
            _fail(image_map_sheet, row_no, "素材名", f"参照先「{name}」の分類が素材ではありません")
        if name in catalog_by_name:
            _fail(image_map_sheet, row_no, "素材名", f"研究素材カタログと重複しています: {name}")
        catalog_by_name[name] = {"name": name, "imageKey": filename}

    material_names: set[str] = set()

    apostle_ids_by_name: dict[str, set[str]] = {}
    basic_info_by_id: dict[str, list[dict[str, Any]]] = {}
    for row in basic_info:
        name = str(row.get("使徒名", row.get("名前", "")))
        apostle_id = str(row.get("id", "")).strip()
        if name and apostle_id:
            normalized_id = apostle_id.casefold()
            apostle_ids_by_name.setdefault(name, set()).add(normalized_id)
            basic_info_by_id.setdefault(normalized_id, []).append(row)

    # Presence in basicInfo is not release eligibility: provisional apostles can
    # be entered there before publication. Only the explicit ID roster is public.
    roster_sheet = "公開使徒ID名簿"
    public_rows_by_name: dict[str, dict[str, Any]] = {}
    for public_id in sorted({str(value).strip().casefold() for value in public_apostle_ids if str(value).strip()}):
        rows = basic_info_by_id.get(public_id, [])
        if len(rows) != 1:
            raise LifeJobDataError(f"{roster_sheet}: basicInfoへ一意に対応しません: {public_id}")
        row = rows[0]
        name = str(row.get("使徒名", row.get("名前", ""))).strip()
        if not name:
            raise LifeJobDataError(f"{roster_sheet}: 使徒名が空です: {public_id}")
        if name in public_rows_by_name:
            raise LifeJobDataError(f"{roster_sheet}: 公開名が重複しています: {name}")
        if apostle_ids_by_name.get(name) != {public_id}:
            raise LifeJobDataError(f"{roster_sheet}: 同名使徒があり、仕事参照を一意に識別できません: {name}")
        public_rows_by_name[name] = row
    if not public_rows_by_name:
        raise LifeJobDataError(f"{roster_sheet}: 公開使徒IDがありません")

    public_apostle_names = set(public_rows_by_name)
    resume_sheet = "使徒アルバイト報酬"
    _require_headers(resume_sheet, resume_reward_headers or [],
                     ("使徒名", "素材名", "表示順", "メイン", "入手元"))
    resume_slots: list[dict[str, Any]] = []
    slot_pairs: set[tuple[str, str]] = set()
    slot_positions: set[tuple[str, int]] = set()
    allowed_sources = {
        "仕事": ["job"],
        "休息": ["rest"],
        "仕事・休息": ["job", "rest"],
    }
    for index, row in enumerate(resume_reward_rows or [], 2):
        row_no = _row_number(row, index)
        apostle_name = _text(row.get("使徒名"), resume_sheet, row_no, "使徒名")
        material_name = _text(row.get("素材名"), resume_sheet, row_no, "素材名")
        if len(apostle_ids_by_name.get(apostle_name, ())) != 1:
            _fail(resume_sheet, row_no, "使徒名", f"使徒基礎設定に一意に対応しません: {apostle_name}")
        if material_name not in item_by_name or item_by_name[material_name].get("分類") != "素材":
            _fail(resume_sheet, row_no, "素材名", f"アイテム基礎の素材にありません: {material_name}")
        if (apostle_name, material_name) in slot_pairs:
            _fail(resume_sheet, row_no, "素材名", f"同じ使徒・素材が重複しています: {apostle_name}・{material_name}")
        slot_pairs.add((apostle_name, material_name))
        order = _positive_integer(row.get("表示順"), resume_sheet, row_no, "表示順")
        if (apostle_name, order) in slot_positions:
            _fail(resume_sheet, row_no, "表示順", f"同じ使徒内で重複しています: {apostle_name}・{order}")
        slot_positions.add((apostle_name, order))
        main = _nonnegative_integer(row.get("メイン"), resume_sheet, row_no, "メイン")
        if main not in (0, 1):
            _fail(resume_sheet, row_no, "メイン", "0または1が必要です")
        source = _text(row.get("入手元"), resume_sheet, row_no, "入手元")
        if source not in allowed_sources:
            _fail(resume_sheet, row_no, "入手元", "仕事／休息／仕事・休息のいずれかが必要です")
        if apostle_name not in public_apostle_names:
            continue
        material_names.add(material_name)
        resume_slots.append({"apostleName": apostle_name, "materialName": material_name,
                             "order": order, "isBest": main == 1,
                             "sources": allowed_sources[source]})

    materials: list[dict[str, Any]] = []
    for name in sorted(material_names):
        source_item = item_by_name[name]
        material_id = _stable_id("mat", (name,))
        material: dict[str, Any] = {
            "id": material_id,
            "name": name,
            "category": "素材",
            "itemGrade": int(float(source_item["素材等級"])),
        }
        catalog_entry = catalog_by_name.get(name)
        image_name = str(catalog_entry.get("imageKey", "")) if catalog_entry else ""
        if image_name:
            material["imageFileName"] = _safe_image_file(image_name, name, material_image_dir)
        materials.append(material)

    apostle_asset_by_name: dict[str, str] = {}
    apostle_names = public_apostle_names
    portrait_files: dict[str, Path] = {}
    for image in apostle_image_dir.glob("*.webp"):
        key = image.stem.casefold()
        if key in portrait_files:
            raise LifeJobDataError(f"使徒画像の大文字小文字が曖昧です: {portrait_files[key].name} / {image.name}")
        portrait_files[key] = image
    for apostle_name, row in public_rows_by_name.items():
        apostle_id = str(row["id"]).strip()
        image = portrait_files.get(apostle_id.casefold())
        if image is not None and image.is_file():
            # Windows accepts ED.webp for Ed.webp; public HTTP paths do not.
            # Preserve the actual filename rather than the data ID's casing.
            apostle_asset_by_name[apostle_name] = image.stem

    material_id_by_name = {entry["name"]: entry["id"] for entry in materials}
    public_resume_slots = [
        {"apostleName": slot["apostleName"], "materialId": material_id_by_name[slot["materialName"]],
         "isBest": slot["isBest"], "order": slot["order"],
         "sources": slot["sources"]}
        for slot in sorted(resume_slots, key=lambda slot: (slot["apostleName"],
            slot["order"]))
    ]
    apostles = [
        {"name": apostle_name, **({"assetId": apostle_asset_by_name[apostle_name]}
                                  if apostle_name in apostle_asset_by_name else {})}
        for apostle_name in sorted(apostle_names)
    ]

    return {
        "lifeJobs": {
            "schemaVersion": 5,
            "materials": materials,
            "apostles": apostles,
            "resumeMaterialSlots": public_resume_slots,
        }
    }
