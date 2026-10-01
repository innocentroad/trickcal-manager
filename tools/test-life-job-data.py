#!/usr/bin/env python3
"""Focused checks for the workbook-driven apostle/material lookup."""

import tempfile
import unittest
from pathlib import Path

from life_job_data import LifeJobDataError, normalize_life_job_data


class LifeJobDataTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.material_dir = self.root / "Materials"
        self.apostle_dir = self.root / "Chara"
        self.material_dir.mkdir()
        self.apostle_dir.mkdir()
        (self.material_dir / "wood.webp").write_bytes(b"fixture")
        (self.apostle_dir / "A1.webp").write_bytes(b"fixture")
        self.items = [{"素材名": "木", "分類": "素材", "素材等級": 1},
                      {"素材名": "石", "分類": "素材", "素材等級": 2}]
        self.rows = [{"__sourceRow": 2, "使徒名": "公開使徒", "素材名": "木", "表示順": 9,
                      "メイン": 1, "入手元": "仕事・休息"},
                     {"__sourceRow": 3, "使徒名": "公開使徒", "素材名": "石", "表示順": 2,
                      "メイン": 0, "入手元": "休息"}]

    def tearDown(self):
        self.temp.cleanup()

    def build(self, rows=None, headers=None, basic=None, image_map=None):
        return normalize_life_job_data(
            self.items, headers={"アイテム基礎": ["素材名", "分類", "素材等級"]},
            material_catalog=[{"name": "木", "imageKey": "wood.webp"}],
            basic_info=basic or [{"id": "A1", "使徒名": "公開使徒"}],
            public_apostle_ids={"A1"}, material_image_dir=self.material_dir,
            apostle_image_dir=self.apostle_dir, life_job_material_image_map=image_map or [],
            resume_reward_headers=headers if headers is not None else
                ["使徒名", "素材名", "表示順", "メイン", "入手元"],
            resume_reward_rows=self.rows if rows is None else rows)["lifeJobs"]

    def test_old_job_sheets_not_needed_and_order_preserved(self):
        data = self.build()
        self.assertEqual(data["schemaVersion"], 5)
        self.assertNotIn("jobs", data)
        self.assertNotIn("materialApostleLinks", data)
        names = {material["id"]: material["name"] for material in data["materials"]}
        self.assertEqual([(names[slot["materialId"]], slot["order"], slot["isBest"], slot["sources"])
                          for slot in data["resumeMaterialSlots"]],
                         [("石", 2, False, ["rest"]), ("木", 9, True, ["job", "rest"])])
        self.assertEqual(data["materials"], self.build(list(reversed(self.rows)))["materials"])

    def test_unreleased_and_empty_slots(self):
        rows = [*self.rows, {"使徒名": "仮登録", "素材名": "石", "表示順": 1,
                              "メイン": 1, "入手元": "仕事"}]
        data = self.build(rows, basic=[{"id": "A1", "使徒名": "公開使徒"},
                                       {"id": "future", "使徒名": "仮登録"}])
        self.assertEqual(len(data["resumeMaterialSlots"]), 2)
        self.assertNotIn("仮登録", repr(data))
        self.assertEqual(self.build([])["resumeMaterialSlots"], [])

    def test_bad_rows_report_sheet_row_and_column(self):
        row = self.rows[0]
        for field, value in [("表示順", 0), ("表示順", 1.5), ("メイン", 2),
                             ("メイン", ""), ("入手元", "仕事/休息"),
                             ("素材名", "不明"), ("使徒名", "不明")]:
            with self.subTest(field=field, value=value):
                with self.assertRaisesRegex(LifeJobDataError, f"使徒アルバイト報酬 行2 {field}"):
                    self.build([dict(row, **{field: value})])
        with self.assertRaisesRegex(LifeJobDataError, "行2 素材名: 同じ使徒・素材が重複"):
            self.build([row, dict(row)])
        with self.assertRaisesRegex(LifeJobDataError, "行3 表示順: 同じ使徒内で重複"):
            self.build([row, dict(self.rows[1], 表示順=9)])
        with self.assertRaisesRegex(LifeJobDataError, "行1 メイン: 必須列"):
            self.build(headers=["使徒名", "素材名", "表示順", "入手元"])
        self.assertFalse(self.build([dict(row, メイン=0)])["resumeMaterialSlots"][0]["isBest"])

    def test_images_and_public_roster(self):
        (self.material_dir / "stone.webp").write_bytes(b"fixture")
        data = self.build(image_map=[{"素材名": "石", "画像ファイル名": "stone.webp"}])
        self.assertEqual(next(item for item in data["materials"] if item["name"] == "石")["imageFileName"], "stone.webp")
        with self.assertRaisesRegex(LifeJobDataError, "公開使徒ID名簿: basicInfoへ一意に対応しません"):
            normalize_life_job_data(self.items, headers={"アイテム基礎": ["素材名", "分類", "素材等級"]},
                                    material_catalog=[], basic_info=[], public_apostle_ids={"A1"},
                                    material_image_dir=self.material_dir, apostle_image_dir=self.apostle_dir,
                                    resume_reward_headers=["使徒名", "素材名", "表示順", "メイン", "入手元"],
                                    resume_reward_rows=[])


if __name__ == "__main__":
    unittest.main()
