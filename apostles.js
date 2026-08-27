// Trickcal Damage Calculator - Apostle Data
// Generated from: トリッカル使徒データ Google Sheet

const APOSTLE_LIBRARY = [
  {
    "id": "amelia",
    "name": "アメリア",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "エルフ",
      "role": "支援",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.525
    },
    "statTypes": {
      "hp": 1.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 1.0,
      "defM": 1.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 1.0,
      "critDmgRes": 1.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Amelia_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 250.0,
              "2": 275.0,
              "3": 300.0,
              "4": 325.0,
              "5": 350.0,
              "6": 375.0,
              "7": 400.0,
              "8": 425.0,
              "9": 450.0,
              "10": 475.0,
              "11": 500.0,
              "12": 525.0,
              "13": 550.0,
              "14": 575.0,
              "15": 600.0
            }
          },
          {
            "effectId": "Amelia_low_e02",
            "valueKind": "感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Amelia_low_e03",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Amelia_low",
        "skillType": "低学年",
        "skillName": "サテライト戦術爆撃",
        "description": "サテライト信号弾を発射してレーザー爆撃を行い、敵に範囲物理ダメージを与え、感電を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Amelia_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 1080.0,
              "2": 1188.0,
              "3": 1296.0,
              "4": 1404.0,
              "5": 1512.0,
              "6": 1620.0,
              "7": 1728.0,
              "8": 1836.0,
              "9": 1944.0,
              "10": 2052.0,
              "11": 2160.0,
              "12": 2268.0,
              "13": 2376.0,
              "14": 2484.0,
              "15": 2592.0
            }
          },
          {
            "effectId": "Amelia_high_e02",
            "valueKind": "総物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 6.0
          },
          {
            "effectId": "Amelia_high_e03",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "対象状態",
            "conditionValue": "感電",
            "effectTarget": "敵"
          },
          {
            "effectId": "Amelia_high_e04",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "対象状態",
            "conditionValue": "感電",
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Amelia_high",
        "skillType": "高学年",
        "skillName": "超電導レーザーキャノン",
        "description": "最新型のレーザーキャノンを発射し、敵に6回の範囲物理ダメージを与える。過熱後はより広範囲の物理ダメージを与える（2ヒット＋加熱後4ヒット）。敵が感電状態の場合、気絶を付与する。",
        "cooldownSeconds": 32.0
      },
      {
        "effects": [
          {
            "effectId": "Amelia_passive_e01",
            "valueKind": "感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/ランダム/指定範囲内"
          },
          {
            "effectId": "Amelia_passive_e02",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/ランダム/指定範囲内",
            "levels": {
              "1": 10.0,
              "2": 10.5,
              "3": 11.0,
              "4": 11.5,
              "5": 12.0,
              "6": 12.5,
              "7": 13.0,
              "8": 13.5,
              "9": 14.0,
              "10": 14.5,
              "11": 15.0,
              "12": 15.5,
              "13": 16.0,
              "14": 16.5,
              "15": 17.0
            }
          },
          {
            "effectId": "Amelia_passive_e03",
            "valueKind": "感電",
            "valueClass": "対象数",
            "effectType": "デバフ",
            "effectTarget": "敵/ランダム/指定範囲内",
            "fixedValue": 2.0
          },
          {
            "effectId": "Amelia_passive_e04",
            "valueKind": "感電",
            "valueClass": "クールタイム",
            "effectType": "デバフ",
            "effectTarget": "敵/ランダム/指定範囲内",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Amelia_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "指定範囲内の敵をランダムで感電させる。"
      },
      {
        "effects": [
          {
            "effectId": "Amelia_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Amelia_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵にレーザーを発射して範囲物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Amelia_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 175.0
          },
          {
            "effectId": "Amelia_enhanced_e02",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Amelia_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で強化レーザーを発射して範囲物理ダメージを与え、感電を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "王子エレナ",
      "levels": {
        "1": {
          "name": "王子さまの恵み",
          "stats": [],
          "effects": [
            {
              "skillId": "Amelia_aside_1",
              "effectId": "Amelia_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Amelia_aside_1",
              "effectId": "Amelia_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Amelia_aside_1",
              "effectId": "Amelia_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Amelia_aside_1",
              "effectId": "Amelia_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "超高速サンダーレーザー",
          "stats": [],
          "effects": [
            {
              "skillId": "Amelia_aside_2",
              "effectId": "Amelia_aside_2_e01",
              "valueKind": "強化攻撃発動確率増加",
              "valueClass": "倍率",
              "effectType": "パッシブ",
              "effectTarget": "自身",
              "targetSkill": "強化攻撃",
              "fixedValue": 15.0
            },
            {
              "skillId": "Amelia_aside_2",
              "effectId": "Amelia_aside_2_e02",
              "valueKind": "普通攻撃のダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "conditionType": "対象状態",
              "conditionValue": "感電",
              "condition": "感電状態の敵攻撃時",
              "targetSkill": "普通攻撃",
              "fixedValue": 40.0
            },
            {
              "skillId": "Amelia_aside_2",
              "effectId": "Amelia_aside_2_e03",
              "valueKind": "パッシブ感電対象数",
              "valueClass": "対象数",
              "effectType": "パッシブ",
              "effectTarget": "敵/指定範囲内",
              "fixedValue": 3.0
            }
          ],
          "description": "強化攻撃の発動確率が増加する。\n感電状態の敵に与える普通攻撃のダメージ量が増加する。\nパッシブスキルで付与する感電の対象数が3体になる。"
        },
        "3": {
          "name": "援軍要請の件",
          "stats": [
            {
              "skillId": "Amelia_aside_3_global",
              "effectId": "Amelia_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Amelia_aside_3_global",
              "effectId": "Amelia_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Amelia_aside_3_battle",
              "effectId": "Amelia_aside_3_battle_e01",
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 4.0
            }
          ],
          "description": "後列の味方の1秒ごとのSP回復量を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "aya",
    "name": "アヤ",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "冷静",
      "race": "魔女",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 44.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 5.0,
      "critDmgRes": 5.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Aya_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 260.0,
              "2": 275.0,
              "3": 290.0,
              "4": 305.0,
              "5": 320.0,
              "6": 335.0,
              "7": 350.0,
              "8": 365.0,
              "9": 380.0,
              "10": 395.0,
              "11": 410.0,
              "12": 425.0,
              "13": 440.0,
              "14": 455.0,
              "15": 470.0
            }
          },
          {
            "effectId": "Aya_low_e02",
            "processGroupId": "Aya_low_proc01",
            "processOrder": 1.0,
            "valueKind": "スキルダメージ量減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "triggerType": "生成物命中時",
            "triggerSourceId": "Aya_low_butterfly",
            "condition": "蝶衝突時",
            "effectTarget": "敵",
            "fixedValue": 50.0
          },
          {
            "effectId": "Aya_low_e03",
            "processGroupId": "Aya_low_proc01",
            "processOrder": 2.0,
            "valueKind": "スキルダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "生成物命中時",
            "triggerSourceId": "Aya_low_butterfly",
            "condition": "蝶衝突時",
            "effectTarget": "敵",
            "fixedValue": 6.0
          },
          {
            "effectId": "Aya_low_e04",
            "processGroupId": "Aya_low_proc01",
            "processOrder": 3.0,
            "valueKind": "SP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "triggerType": "生成物命中時",
            "triggerSourceId": "Aya_low_butterfly",
            "condition": "蝶衝突時",
            "effectTarget": "自身",
            "fixedValue": 15.0
          }
        ],
        "skillId": "Aya_low",
        "skillType": "低学年",
        "skillName": "あられ蝶",
        "description": "敵に蝶を飛ばす。蝶は衝突した際に敵に魔法ダメージを数回与え、スキルダメージ量を減少させる。蝶が敵に衝突すると、自身のSPが回復する。SP回復効果は同じ対象に一度だけ発動する。"
      },
      {
        "effects": [
          {
            "effectId": "Aya_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 250.0,
              "2": 265.0,
              "3": 280.0,
              "4": 295.0,
              "5": 310.0,
              "6": 325.0,
              "7": 340.0,
              "8": 355.0,
              "9": 370.0,
              "10": 385.0,
              "11": 400.0,
              "12": 415.0,
              "13": 430.0,
              "14": 445.0,
              "15": 460.0
            }
          },
          {
            "effectId": "Aya_high_e02",
            "valueKind": "繰り返し回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵/ランダム",
            "fixedValue": 5.0
          },
          {
            "effectId": "Aya_high_e03",
            "valueKind": "凍傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Aya_high_e04",
            "valueKind": "凍傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Aya_high",
        "skillType": "高学年",
        "skillName": "雪花満開",
        "description": "敵に雪の花を咲かせる。雪の花は敵に範囲魔法ダメージを与え、凍傷を付与する。ダメージを受けたランダムな敵に新しい雪の花を咲かせ、敵に範囲魔法ダメージを与える。雪の花は同じ対象に一度だけ咲く。",
        "cooldownSeconds": 28.0
      },
      {
        "effects": [
          {
            "effectId": "Aya_passive_e01",
            "valueKind": "会心被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0,
              "13": 44.0,
              "14": 46.0,
              "15": 48.0
            }
          },
          {
            "effectId": "Aya_passive_e02",
            "valueKind": "冷静の味方使徒攻撃力増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "冷静の味方使徒",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          }
        ],
        "skillId": "Aya_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心被ダメージ量が減少する。冷静の味方使徒の攻撃力を増加させる。この効果はアヤがフィールドにいなくても発動する。"
      },
      {
        "effects": [
          {
            "effectId": "Aya_basic_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          },
          {
            "effectId": "Aya_basic_e02",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Aya_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "氷刃雪花を振って敵に魔法ダメージを2回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Aya_enhanced_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 190.0
          },
          {
            "effectId": "Aya_enhanced_e02",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 2.0
          },
          {
            "effectId": "Aya_enhanced_e03",
            "valueKind": "攻撃速度減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵/範囲",
            "fixedValue": 20.0
          },
          {
            "effectId": "Aya_enhanced_e04",
            "valueKind": "攻撃速度減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵/範囲",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Aya_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で氷刃雪花を振って敵に範囲魔法ダメージを2回与える。2回目の攻撃は敵の攻撃速度を減少させる。",
        "triggerType": "一定確率",
        "triggerValue": 40.0
      }
    ],
    "favoriteCard": {
      "name": "アヤの雪の花魔法",
      "kind": "スペル",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Aya_favorite_1_e01",
                "valueKind": "与ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "編成中",
                "conditionValue": "Aya",
                "condition": "アヤ編成時",
                "effectTarget": "冷静の味方使徒",
                "fixedValue": 30.0
              },
              {
                "effectId": "Aya_favorite_1_e02",
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "編成中",
                "conditionValue": "Aya",
                "condition": "アヤ編成時",
                "effectTarget": "冷静の味方使徒",
                "fixedValue": 20.0
              },
              {
                "effectId": "Aya_favorite_1_e03",
                "processGroupId": "Aya_favorite_1_periodic",
                "processOrder": 1.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "小さな雪の花魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "attackCategory": "無分類",
                "triggerType": "n秒ごと",
                "triggerValue": 10.0,
                "conditionType": "編成中",
                "conditionValue": "Aya",
                "condition": "アヤ編成時",
                "effectTarget": "敵/ランダム/範囲",
                "fixedValue": 500.0
              },
              {
                "effectId": "Aya_favorite_1_e04",
                "processGroupId": "Aya_favorite_1_periodic",
                "processOrder": 2.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "凍傷",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "effectStack": true,
                "maxStack": 9.0,
                "triggerType": "n秒ごと",
                "triggerValue": 10.0,
                "conditionType": "編成中",
                "conditionValue": "Aya",
                "condition": "アヤ編成時",
                "effectTarget": "敵/ランダム/範囲"
              },
              {
                "effectId": "Aya_favorite_1_e05",
                "processGroupId": "Aya_favorite_1_periodic",
                "processOrder": 3.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "凍傷",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "effectStack": true,
                "maxStack": 9.0,
                "triggerType": "n秒ごと",
                "triggerValue": 10.0,
                "conditionType": "編成中",
                "conditionValue": "Aya",
                "condition": "アヤ編成時",
                "effectTarget": "敵/ランダム/範囲",
                "fixedValue": 10.0
              }
            ],
            "skillId": "Aya_favorite_1",
            "skillName": "愛用Lv1",
            "description": "デッキにアヤが編成されている場合、以下の効果が発動する。\n冷静の味方使徒のダメージ量を増加させ、被ダメージ量を減少させる。\n10秒ごとにランダムな敵へ小さな雪の花を咲かせる。小さな雪の花は範囲魔法ダメージを与え、凍傷を付与する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Aya_favorite_3_e01",
                "targetSkill": "低学年",
                "valueKind": "低学年スキルダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 33.0
              }
            ],
            "skillId": "Aya_favorite_3",
            "skillName": "愛用Lv3",
            "description": "アヤの低学年スキルのスキルダメージ量が33%増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "試練の中の雪の花",
      "levels": {
        "1": {
          "name": "真っ白な雪の結晶",
          "stats": [],
          "effects": [
            {
              "skillId": "Aya_aside_1",
              "effectId": "Aya_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Aya_aside_1",
              "effectId": "Aya_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Aya_aside_1",
              "effectId": "Aya_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Aya_aside_1",
              "effectId": "Aya_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "雪の花の翼",
          "stats": [],
          "effects": [
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e01",
              "processGroupId": "Aya_aside_2_charge",
              "processOrder": 1.0,
              "valueKind": "雪の花満開チャージ獲得",
              "valueClass": "スタック数",
              "effectType": "パッシブ",
              "maxStack": 1.0,
              "triggerType": "n秒ごと",
              "triggerValue": 4.0,
              "conditionType": "リソース未所持",
              "conditionValue": "雪の花満開チャージ",
              "condition": "未チャージ時",
              "effectTarget": "自身",
              "fixedValue": 1.0
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e02",
              "processGroupId": "Aya_aside_2_attack_proc",
              "processOrder": 1.0,
              "valueKind": "雪の花満開チャージ消費",
              "valueClass": "固定値",
              "effectType": "パッシブ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "conditionType": "リソーススタック",
              "conditionValue": "雪の花満開チャージ:1",
              "condition": "次の普通攻撃命中時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃",
              "fixedValue": 1.0
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e03",
              "processGroupId": "Aya_aside_2_attack_proc",
              "processOrder": 2.0,
              "valueKind": "追加魔法ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "attackCategory": "スキル",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "conditionType": "リソーススタック",
              "conditionValue": "雪の花満開チャージ:1",
              "condition": "次の普通攻撃命中時",
              "effectTarget": "敵/範囲",
              "targetSkill": "普通攻撃",
              "fixedValue": 650.0
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e04",
              "processGroupId": "Aya_aside_2_attack_proc",
              "processOrder": 3.0,
              "valueKind": "気絶",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "conditionType": "リソーススタック",
              "conditionValue": "雪の花満開チャージ:1",
              "condition": "次の普通攻撃命中時",
              "effectTarget": "敵/範囲",
              "targetSkill": "普通攻撃"
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e05",
              "processGroupId": "Aya_aside_2_attack_proc",
              "processOrder": 4.0,
              "valueKind": "気絶",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "conditionType": "リソーススタック",
              "conditionValue": "雪の花満開チャージ:1",
              "condition": "次の普通攻撃命中時",
              "effectTarget": "敵/範囲",
              "targetSkill": "普通攻撃",
              "fixedValue": 1.5
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e06",
              "processGroupId": "Aya_aside_2_butterfly_hit",
              "processOrder": 1.0,
              "valueKind": "凍傷",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "effectStack": true,
              "maxStack": 9.0,
              "triggerType": "生成物命中時",
              "triggerSourceId": "Aya_low_butterfly",
              "condition": "低学年スキルの蝶衝突時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e07",
              "processGroupId": "Aya_aside_2_butterfly_hit",
              "processOrder": 2.0,
              "valueKind": "凍傷",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectStack": true,
              "maxStack": 9.0,
              "triggerType": "生成物命中時",
              "triggerSourceId": "Aya_low_butterfly",
              "condition": "低学年スキルの蝶衝突時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 10.0
            },
            {
              "skillId": "Aya_aside_2",
              "effectId": "Aya_aside_2_e08",
              "processGroupId": "Aya_aside_2_butterfly_return",
              "processOrder": 1.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "生成物帰還時",
              "triggerSourceId": "Aya_low_butterfly",
              "condition": "低学年スキルの蝶帰還時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "fixedValue": 20.0
            }
          ],
          "description": "4秒ごとに雪の花満開の効果がチャージされる。チャージ完了時、次の普通攻撃に追加で範囲魔法ダメージを与え、気絶を付与する。\n低学年スキルの蝶が敵に衝突すると凍傷を付与する。蝶が戻ってくると、自身のHPを回復する。"
        },
        "3": {
          "name": "万年雪の賢者！",
          "stats": [
            {
              "skillId": "Aya_aside_3_global",
              "effectId": "Aya_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4.0
            },
            {
              "skillId": "Aya_aside_3_global",
              "effectId": "Aya_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Aya_aside_3_battle",
              "effectId": "Aya_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 19.5
            },
            {
              "skillId": "Aya_aside_3_battle",
              "effectId": "Aya_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 8.8
            }
          ],
          "description": "中列の味方の与ダメージ量を増加させ、中列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "alice",
    "name": "アリス",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "幽霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Alice_low_e01",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 1.0,
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 270.0,
              "2": 295.0,
              "3": 320.0,
              "4": 345.0,
              "5": 370.0,
              "6": 395.0,
              "7": 420.0,
              "8": 445.0,
              "9": 470.0,
              "10": 495.0,
              "11": 520.0,
              "12": 545.0,
              "13": 570.0,
              "14": 595.0,
              "15": 620.0
            }
          },
          {
            "effectId": "Alice_low_e02",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 2.0,
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Alice_low_e03",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 3.0,
            "valueKind": "[傘持参]感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_low_e04",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 4.0,
            "valueKind": "[傘持参]感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 4.0
          },
          {
            "effectId": "Alice_low_e05",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 5.0,
            "valueKind": "[残り火注意]魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "残り火注意",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0,
              "13": 1320.0,
              "14": 1380.0,
              "15": 1440.0
            }
          },
          {
            "effectId": "Alice_low_e06",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 6.0,
            "valueKind": "[残り火注意]火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "conditionType": "ランダム分岐",
            "conditionValue": "残り火注意",
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_low_e07",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 7.0,
            "valueKind": "[残り火注意]火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "conditionType": "ランダム分岐",
            "conditionValue": "残り火注意",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 7.0
          },
          {
            "effectId": "Alice_low_e08",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 8.0,
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "levels": {
              "1": 180.0,
              "2": 205.0,
              "3": 230.0,
              "4": 255.0,
              "5": 280.0,
              "6": 305.0,
              "7": 330.0,
              "8": 355.0,
              "9": 380.0,
              "10": 405.0,
              "11": 430.0,
              "12": 455.0,
              "13": 480.0,
              "14": 505.0,
              "15": 530.0
            }
          },
          {
            "effectId": "Alice_low_e09",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 9.0,
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 3.0
          },
          {
            "effectId": "Alice_low_e10",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 10.0,
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 4.0
          },
          {
            "effectId": "Alice_low_e11",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 11.0,
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム"
          },
          {
            "effectId": "Alice_low_e12",
            "processGroupId": "Alice_low_proc01",
            "processOrder": 12.0,
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Alice_low",
        "skillType": "低学年",
        "skillName": "ティータイム？",
        "description": "簡易占いの3つの効果のうち1つを発動する。 傘持参: 範囲魔法ダメージを2回与え、感電を付与する。 残り火注意: 範囲魔法ダメージを与え火傷を付与する。 かすり傷注意: ランダムな敵3体に魔法ダメージを4回与え、気絶を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Alice_high_e01",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 1.0,
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 405.0,
              "2": 440.0,
              "3": 475.0,
              "4": 510.0,
              "5": 545.0,
              "6": 580.0,
              "7": 615.0,
              "8": 650.0,
              "9": 685.0,
              "10": 720.0,
              "11": 755.0,
              "12": 790.0,
              "13": 825.0,
              "14": 860.0,
              "15": 895.0
            }
          },
          {
            "effectId": "Alice_high_e02",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 2.0,
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Alice_high_e03",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 3.0,
            "valueKind": "[傘持参]感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_high_e04",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 4.0,
            "valueKind": "[傘持参]感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "傘持参",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 6.0
          },
          {
            "effectId": "Alice_high_e05",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 5.0,
            "valueKind": "[残り火注意]魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "残り火注意",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 1200.0,
              "2": 1320.0,
              "3": 1440.0,
              "4": 1560.0,
              "5": 1680.0,
              "6": 1800.0,
              "7": 1920.0,
              "8": 2040.0,
              "9": 2160.0,
              "10": 2280.0,
              "11": 2400.0,
              "12": 2520.0,
              "13": 2640.0,
              "14": 2760.0,
              "15": 2880.0
            }
          },
          {
            "effectId": "Alice_high_e06",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 6.0,
            "valueKind": "[残り火注意]火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "conditionType": "ランダム分岐",
            "conditionValue": "残り火注意",
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_high_e07",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 7.0,
            "valueKind": "[残り火注意]火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "conditionType": "ランダム分岐",
            "conditionValue": "残り火注意",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 10.0
          },
          {
            "effectId": "Alice_high_e08",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 8.0,
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "levels": {
              "1": 270.0,
              "2": 305.0,
              "3": 340.0,
              "4": 375.0,
              "5": 410.0,
              "6": 445.0,
              "7": 480.0,
              "8": 515.0,
              "9": 550.0,
              "10": 585.0,
              "11": 620.0,
              "12": 655.0,
              "13": 690.0,
              "14": 725.0,
              "15": 760.0
            }
          },
          {
            "effectId": "Alice_high_e09",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 9.0,
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 3.0
          },
          {
            "effectId": "Alice_high_e10",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 10.0,
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 4.0
          },
          {
            "effectId": "Alice_high_e11",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 11.0,
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム"
          },
          {
            "effectId": "Alice_high_e12",
            "processGroupId": "Alice_high_proc01",
            "processOrder": 12.0,
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "ランダム分岐",
            "conditionValue": "かすり傷注意",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Alice_high",
        "skillType": "高学年",
        "skillName": "ワンダーランド",
        "description": "直前に引いたアルカナカードに応じてスキルを強化し、発動する。 アルカナを使用していない場合は、かすり傷注意が発動する。",
        "cooldownSeconds": 40.0
      },
      {
        "effects": [
          {
            "effectId": "Alice_passive_e01",
            "valueKind": "SP減少",
            "valueClass": "固定値",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "levels": {
              "1": 16.0,
              "2": 17.0,
              "3": 18.0,
              "4": 19.0,
              "5": 20.0,
              "6": 21.0,
              "7": 22.0,
              "8": 23.0,
              "9": 24.0,
              "10": 25.0,
              "11": 26.0,
              "12": 27.0,
              "13": 28.0,
              "14": 29.0,
              "15": 30.0
            }
          },
          {
            "effectId": "Alice_passive_e02",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 23.0,
              "3": 26.0,
              "4": 29.0,
              "5": 32.0,
              "6": 35.0,
              "7": 38.0,
              "8": 41.0,
              "9": 44.0,
              "10": 47.0,
              "11": 50.0,
              "12": 53.0,
              "13": 56.0,
              "14": 59.0,
              "15": 62.0
            }
          }
        ],
        "skillId": "Alice_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃時、敵のSPを減少させ、自身のSPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Alice_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Alice_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "カードを投げつけて敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Alice_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 250.0
          }
        ],
        "skillId": "Alice_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに敵にカードの束を投げつけて魔法ダメージを与える。",
        "triggerType": "n回ごと",
        "triggerValue": 4.0
      }
    ],
    "favoriteCard": {
      "name": "アリスのデタラメな呪術",
      "kind": "スペル",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Alice_favorite_1_e01",
                "targetSkillName": "ランダム効果",
                "valueKind": "[赤カード]魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "conditionType": "分岐",
                "conditionValue": "赤カード",
                "condition": "赤カード時",
                "effectTarget": "敵",
                "fixedValue": 300.0
              },
              {
                "effectId": "Alice_favorite_1_e02",
                "targetSkillName": "ランダム効果",
                "valueKind": "[赤カード]与ダメージ減少",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "conditionType": "分岐",
                "conditionValue": "赤カード",
                "condition": "赤カード時",
                "effectTarget": "敵",
                "fixedValue": 30.0
              },
              {
                "effectId": "Alice_favorite_1_e03",
                "targetSkillName": "ランダム効果",
                "valueKind": "[赤カード]与ダメージ減少",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "conditionType": "分岐",
                "conditionValue": "赤カード",
                "condition": "赤カード時",
                "effectTarget": "敵",
                "fixedValue": 5.0
              },
              {
                "effectId": "Alice_favorite_1_e04",
                "targetSkillName": "ランダム効果",
                "valueKind": "[黄カード]魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "conditionType": "分岐",
                "conditionValue": "黄カード",
                "condition": "黄カード時",
                "effectTarget": "敵",
                "fixedValue": 300.0
              },
              {
                "effectId": "Alice_favorite_1_e05",
                "targetSkillName": "ランダム効果",
                "valueKind": "[黄カード]気絶",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "conditionType": "分岐",
                "conditionValue": "黄カード",
                "condition": "黄カード時",
                "effectTarget": "敵"
              },
              {
                "effectId": "Alice_favorite_1_e06",
                "targetSkillName": "ランダム効果",
                "valueKind": "[黄カード]気絶",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "conditionType": "分岐",
                "conditionValue": "黄カード",
                "condition": "黄カード時",
                "effectTarget": "敵",
                "fixedValue": 3.0
              },
              {
                "effectId": "Alice_favorite_1_e07",
                "targetSkillName": "ランダム効果",
                "valueKind": "[青カード]魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "conditionType": "分岐",
                "conditionValue": "青カード",
                "condition": "青カード時",
                "effectTarget": "敵",
                "fixedValue": 300.0
              },
              {
                "effectId": "Alice_favorite_1_e08",
                "targetSkillName": "ランダム効果",
                "valueKind": "[青カード]SP減少",
                "valueClass": "固定値",
                "effectType": "デバフ",
                "conditionType": "分岐",
                "conditionValue": "青カード",
                "condition": "青カード時",
                "effectTarget": "敵",
                "fixedValue": 50.0
              }
            ],
            "skillId": "Alice_favorite_1",
            "skillName": "愛用Lv1",
            "description": "アリスが編成中の場合、10秒ごとにランダムで効果を発動する。\n赤色カード: 赤色の雷が最大3体の敵に魔法ダメージを与え、与ダメージ量を減少させる。\n黄色カード: 黄色の雷が最大3体の敵に魔法ダメージを与え、気絶させる。\n青色カード: 青色の雷が最大3体の敵に魔法ダメージを与え、SPを減少させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Alice_favorite_3_e01",
                "valueKind": "毎秒SP回復量",
                "valueClass": "固定値",
                "effectType": "パッシブ",
                "effectTarget": "自身",
                "fixedValue": 10.0
              }
            ],
            "skillId": "Alice_favorite_3",
            "skillName": "愛用Lv3",
            "description": "毎秒SP回復量が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "最高の吉のカード",
      "levels": {
        "1": {
          "name": "幸運カードの主人公",
          "stats": [],
          "effects": [
            {
              "skillId": "Alice_aside_1",
              "effectId": "Alice_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Alice_aside_1",
              "effectId": "Alice_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Alice_aside_1",
              "effectId": "Alice_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Alice_aside_1",
              "effectId": "Alice_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "完全ラッキーアリスでしょ！",
          "stats": [],
          "effects": [
            {
              "skillId": "Alice_aside_2",
              "effectId": "Alice_aside_2_e01",
              "valueKind": "スキルダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "effectTarget": "自身",
              "fixedValue": 33.0
            },
            {
              "skillId": "Alice_aside_2",
              "effectId": "Alice_aside_2_e02",
              "processGroupId": "Alice_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "被ダメージ回数",
              "triggerValue": 12.0,
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "fixedValue": 25.0
            },
            {
              "skillId": "Alice_aside_2",
              "effectId": "Alice_aside_2_e03",
              "processGroupId": "Alice_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "HP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "triggerType": "被ダメージ回数",
              "triggerValue": 12.0,
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "reference": "最大HP",
              "fixedValue": 5.0
            },
            {
              "skillId": "Alice_aside_2",
              "effectId": "Alice_aside_2_e04",
              "processGroupId": "Alice_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "被ダメージ回数",
              "triggerValue": 12.0,
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "fixedValue": 100.0
            },
            {
              "skillId": "Alice_aside_2",
              "effectId": "Alice_aside_2_e05",
              "processGroupId": "Alice_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "SP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "triggerType": "被ダメージ回数",
              "triggerValue": 12.0,
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "fixedValue": 5.0
            }
          ],
          "description": "スキルダメージ量が増加する。\n味方が一定回数直接ダメージを受けると、自身のHPとSPを回復する。"
        },
        "3": {
          "name": "幸運を祈るわ！",
          "stats": [
            {
              "skillId": "Alice_aside_3_global",
              "effectId": "Alice_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Alice_aside_3_global",
              "effectId": "Alice_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Alice_aside_3_battle",
              "effectId": "Alice_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 19.5
            }
          ],
          "description": "中列の味方の与ダメージ量を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "allet",
    "name": "アレット",
    "basic": {
      "rarity": 2.0,
      "personality": "純粋",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 70.0,
      "combatPowerCorrectionB": 0.21
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 2.0,
      "atkM": 0.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 2.0,
      "critDmg": 2.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Allet_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0
            }
          },
          {
            "effectId": "Allet_low_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Allet_low_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Allet_low",
        "skillType": "低学年",
        "skillName": "ショベルアタック",
        "description": "ショベルを振り回して敵にダメージを与え、気絶を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Allet_high_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "シールド",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 25.0,
              "2": 27.0,
              "3": 29.0,
              "4": 31.0,
              "5": 33.0,
              "6": 35.0,
              "7": 37.0,
              "8": 39.0,
              "9": 41.0,
              "10": 43.0,
              "11": 45.0,
              "12": 47.0
            }
          },
          {
            "effectId": "Allet_high_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "自身",
            "fixedValue": 7.0
          },
          {
            "effectId": "Allet_high_e03",
            "valueKind": "シールド破壊時の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 200.0,
              "2": 210.0,
              "3": 220.0,
              "4": 230.0,
              "5": 240.0,
              "6": 250.0,
              "7": 260.0,
              "8": 270.0,
              "9": 280.0,
              "10": 290.0,
              "11": 300.0,
              "12": 310.0
            }
          }
        ],
        "skillId": "Allet_high",
        "skillType": "高学年",
        "skillName": "鎮圧準備",
        "description": "ダメージを吸収するシールドを自身に生成する。シールドが破壊されるか持続時間が終わると、敵に範囲物理ダメージを与える。",
        "cooldownSeconds": 16.0
      },
      {
        "effects": [
          {
            "effectId": "Allet_passive_e01",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Allet_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "すべての防御力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Allet_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Allet_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "盾で突進して敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "ed",
    "name": "イード",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "冷静",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 160.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 5.0,
      "critDmgRes": 5.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "ED_low_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "シールド",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0,
              "13": 48.0,
              "14": 50.0,
              "15": 52.0
            }
          },
          {
            "effectId": "ED_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "自身",
            "fixedValue": 8.0
          },
          {
            "effectId": "ED_low_e03",
            "processGroupId": "ED_low_proc01",
            "processOrder": 1.0,
            "valueKind": "保護",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "イードを除く味方全員"
          },
          {
            "effectId": "ED_low_e04",
            "processGroupId": "ED_low_proc01",
            "processOrder": 2.0,
            "valueKind": "保護",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "イードを除く味方全員",
            "fixedValue": 10.0
          },
          {
            "effectId": "ED_low_e05",
            "processGroupId": "ED_low_proc01",
            "processOrder": 3.0,
            "valueKind": "保護発動回数",
            "valueClass": "回数",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "イードを除く味方全員",
            "fixedValue": 2.0
          },
          {
            "effectId": "ED_low_e06",
            "valueKind": "味方シールド",
            "valueClass": "倍率",
            "effectType": "シールド",
            "effectTarget": "保護が発動した味方",
            "reference": "最大HP",
            "levels": {
              "1": 48.0,
              "2": 53.0,
              "3": 56.0,
              "4": 60.0,
              "5": 63.0,
              "6": 66.0,
              "7": 71.0,
              "8": 74.0,
              "9": 78.0,
              "10": 81.0,
              "11": 84.0,
              "12": 89.0,
              "13": 92.0,
              "14": 96.0,
              "15": 99.0
            }
          },
          {
            "effectId": "ED_low_e07",
            "valueKind": "味方シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "保護が発動した味方",
            "fixedValue": 12.0
          }
        ],
        "skillId": "ED_low",
        "skillType": "低学年",
        "skillName": "薄暗い境界線",
        "description": "自身にシールドを生成し、イードを除く味方全員に保護を付与する。この効果は最大2回発動する。"
      },
      {
        "effects": [
          {
            "effectId": "ED_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "周囲の敵/範囲",
            "levels": {
              "1": 700.0,
              "2": 770.0,
              "3": 840.0,
              "4": 910.0,
              "5": 980.0,
              "6": 1050.0,
              "7": 1120.0,
              "8": 1190.0,
              "9": 1260.0,
              "10": 1330.0,
              "11": 1400.0,
              "12": 1470.0,
              "13": 1540.0,
              "14": 1610.0,
              "15": 1680.0
            }
          },
          {
            "effectId": "ED_high_e02",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "周囲の敵/範囲",
            "fixedValue": 4.0
          },
          {
            "effectId": "ED_high_e03",
            "valueKind": "SP減少",
            "valueClass": "固定値",
            "effectType": "デバフ",
            "effectTarget": "周囲の敵/範囲",
            "levels": {
              "1": 96.0,
              "2": 104.0,
              "3": 112.0,
              "4": 120.0,
              "5": 128.0,
              "6": 136.0,
              "7": 144.0,
              "8": 152.0,
              "9": 160.0,
              "10": 168.0,
              "11": 176.0,
              "12": 184.0,
              "13": 192.0,
              "14": 200.0,
              "15": 208.0
            }
          }
        ],
        "skillId": "ED_high",
        "skillType": "高学年",
        "skillName": "あなたと私の宇宙",
        "description": "周囲の敵に範囲魔法ダメージを4回与え、SPを減少させる。",
        "cooldownSeconds": 38.0
      },
      {
        "effects": [
          {
            "effectId": "ED_passive_e01",
            "processGroupId": "ED_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "無敵",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "triggerType": "ウェーブ開始時",
            "condition": "ウェーブ開始時",
            "effectTarget": "自身"
          },
          {
            "effectId": "ED_passive_e02",
            "processGroupId": "ED_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "ウェーブ開始時",
            "condition": "ウェーブ開始時",
            "effectTarget": "自身",
            "levels": {
              "1": 3.0,
              "2": 3.3,
              "3": 3.6,
              "4": 3.9,
              "5": 4.2,
              "6": 4.5,
              "7": 4.8,
              "8": 5.1,
              "9": 5.4,
              "10": 5.7,
              "11": 6.0,
              "12": 6.3,
              "13": 6.6,
              "14": 6.9,
              "15": 7.2
            }
          },
          {
            "effectId": "ED_passive_e03",
            "valueKind": "目隠し免疫",
            "valueClass": "状態免疫",
            "effectType": "パッシブ",
            "effectTarget": "自身"
          }
        ],
        "skillId": "ED_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "ウェーブ開始時に一定時間、自身に無敵を付与する。目隠しの免疫を持つ。"
      },
      {
        "effects": [
          {
            "effectId": "ED_basic_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 120.0
          },
          {
            "effectId": "ED_basic_e02",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "ED_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵にレーザーを4回発射して魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "ED_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "前方の敵/範囲",
            "fixedValue": 240.0
          },
          {
            "effectId": "ED_enhanced_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 20.0
          },
          {
            "effectId": "ED_enhanced_e03",
            "valueKind": "攻撃力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "ダメージを受けた敵",
            "fixedValue": 30.0
          },
          {
            "effectId": "ED_enhanced_e04",
            "valueKind": "攻撃力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ダメージを受けた敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "ED_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "直接ダメージを9回受けるたびに、前方の敵に範囲魔法ダメージを与え、自身のHPを回復する。ダメージを受けた敵は攻撃力が減少する。 強化攻撃中は、被ダメージの回数がカウントされない。",
        "triggerType": "被ダメージ回数",
        "triggerValue": 9.0
      }
    ],
    "favoriteCard": {
      "name": "ルシ - イードドリーム",
      "kind": "スペル",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "ED_favorite_1_e01",
                "targetSkillName": "愛用カード効果",
                "valueKind": "最大HP増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "編成中",
                "conditionValue": "ED",
                "condition": "イード編成時",
                "effectTarget": "味方全員",
                "fixedValue": 15.0
              },
              {
                "effectId": "ED_favorite_1_e02",
                "targetSkillName": "愛用カード効果",
                "valueKind": "SP回復周期",
                "valueClass": "周期",
                "effectType": "回復",
                "conditionType": "編成中",
                "conditionValue": "ED",
                "condition": "イード編成時",
                "effectTarget": "自身と周囲の味方",
                "fixedValue": 5.0
              },
              {
                "effectId": "ED_favorite_1_e03",
                "targetSkillName": "愛用カード効果",
                "valueKind": "SP回復",
                "valueClass": "固定値",
                "effectType": "回復",
                "conditionType": "編成中",
                "conditionValue": "ED",
                "condition": "イード編成時",
                "effectTarget": "自身と周囲の味方",
                "fixedValue": 30.0
              }
            ],
            "skillId": "ED_favorite_1",
            "skillName": "愛用Lv1",
            "description": "デッキにイードが編成されている場合、以下の効果が発動する。\n味方全員の最大HPが増加する。\n一定時間ごとに自身と周囲の味方のSPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "ED_favorite_3_e01",
                "targetSkillName": "愛用カード効果",
                "valueKind": "HP回復量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 30.0
              }
            ],
            "skillId": "ED_favorite_3",
            "skillName": "愛用Lv3",
            "description": "イードのHP回復量が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "イード・ジ・エターナルブレット",
      "levels": {
        "1": {
          "name": "心優しいイード",
          "stats": [],
          "effects": [
            {
              "skillId": "ED_aside_1",
              "effectId": "ED_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "ED_aside_1",
              "effectId": "ED_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "ED_aside_1",
              "effectId": "ED_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "ED_aside_1",
              "effectId": "ED_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "ED_aside_1",
              "effectId": "ED_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "まだ夢から覚めていない",
          "stats": [],
          "effects": [
            {
              "skillId": "ED_aside_2",
              "effectId": "ED_aside_2_e01",
              "processGroupId": "ED_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 25.0
            },
            {
              "skillId": "ED_aside_2",
              "effectId": "ED_aside_2_e02",
              "processGroupId": "ED_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "防御力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 5.0
            },
            {
              "skillId": "ED_aside_2",
              "effectId": "ED_aside_2_e03",
              "processGroupId": "ED_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "追加シールド",
              "valueClass": "倍率",
              "effectType": "シールド",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "残りHP割合が最も低い味方",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 24.0,
                "2": 26.0,
                "3": 28.0,
                "4": 30.0,
                "5": 32.0,
                "6": 34.0,
                "7": 36.0,
                "8": 38.0,
                "9": 40.0,
                "10": 42.0,
                "11": 44.0,
                "12": 46.0,
                "13": 48.0,
                "14": 50.0,
                "15": 52.0
              }
            },
            {
              "skillId": "ED_aside_2",
              "effectId": "ED_aside_2_e04",
              "processGroupId": "ED_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "追加シールド",
              "valueClass": "持続時間",
              "effectType": "シールド",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "残りHP割合が最も低い味方",
              "targetSkill": "低学年スキル",
              "fixedValue": 8.0
            },
            {
              "skillId": "ED_aside_2",
              "effectId": "ED_aside_2_e05",
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "状態発動時",
              "triggerSourceId": "保護",
              "condition": "保護発動時",
              "effectTarget": "保護が発動した味方",
              "targetSkill": "保護",
              "fixedValue": 30.0
            }
          ],
          "description": "強化攻撃使用時、一定時間、自身の防御力を増加させる。\n低学年スキル使用時、残りHP割合が最も低い味方に追加でシールドを付与する。\n保護が発動した味方のSPを回復させる。"
        },
        "3": {
          "name": "共に見る夢",
          "stats": [
            {
              "skillId": "ED_aside_3_global",
              "effectId": "ED_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4.0
            },
            {
              "skillId": "ED_aside_3_global",
              "effectId": "ED_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "ED_aside_3_battle",
              "effectId": "ED_aside_3_battle_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全員",
              "fixedValue": 18.0
            }
          ],
          "description": "味方全員の最大HPを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "ifrit",
    "name": "イフリート",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "精霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Ifrit_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "領域内の敵",
            "levels": {
              "1": 130.0,
              "2": 143.0,
              "3": 156.0,
              "4": 169.0,
              "5": 182.0,
              "6": 195.0,
              "7": 208.0,
              "8": 221.0,
              "9": 234.0,
              "10": 247.0,
              "11": 260.0,
              "12": 273.0
            }
          },
          {
            "effectId": "Ifrit_low_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "領域内の敵"
          },
          {
            "effectId": "Ifrit_low_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "領域内の敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Ifrit_low",
        "skillType": "低学年",
        "skillName": "グツグツ",
        "description": "炎の領域を生成して領域内の敵に魔法ダメージを与え、火傷を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Ifrit_high_e01",
            "valueKind": "初回落下時魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "中央の敵/範囲",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Ifrit_high_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "中央の敵/範囲"
          },
          {
            "effectId": "Ifrit_high_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "中央の敵/範囲",
            "fixedValue": 6.0
          },
          {
            "effectId": "Ifrit_high_e04",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 80.0,
              "2": 88.0,
              "3": 96.0,
              "4": 104.0,
              "5": 112.0,
              "6": 120.0,
              "7": 128.0,
              "8": 136.0,
              "9": 144.0,
              "10": 152.0,
              "11": 160.0,
              "12": 168.0
            }
          },
          {
            "effectId": "Ifrit_high_e05",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Ifrit_high",
        "skillType": "高学年",
        "skillName": "キャンプファイア",
        "description": "空中に跳び上がった後、真ん中にいる敵に落下し、範囲魔法ダメージを与え、火傷を付与する。その後10回範囲魔法ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Ifrit_passive_e01",
            "valueKind": "基本攻撃のダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 32.0,
              "3": 34.0,
              "4": 36.0,
              "5": 38.0,
              "6": 40.0,
              "7": 42.0,
              "8": 44.0,
              "9": 46.0,
              "10": 48.0,
              "11": 50.0,
              "12": 52.0
            }
          },
          {
            "effectId": "Ifrit_passive_e02",
            "valueKind": "火傷免疫",
            "valueClass": "状態免疫",
            "effectType": "パッシブ",
            "effectTarget": "自身"
          },
          {
            "effectId": "Ifrit_passive_e03",
            "valueKind": "火傷の与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "attackCategory": "火傷",
            "conditionType": "付与者",
            "conditionValue": "自身",
            "effectTarget": "自身のスキルで発生した火傷",
            "levels": {
              "1": 24.0,
              "2": 28.0,
              "3": 32.0,
              "4": 36.0,
              "5": 40.0,
              "6": 44.0,
              "7": 48.0,
              "8": 52.0,
              "9": 56.0,
              "10": 60.0,
              "11": 64.0,
              "12": 68.0
            }
          }
        ],
        "skillId": "Ifrit_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃のダメージ量が増加し、火傷の免疫を得る。イフリートのスキルで発生した火傷のダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Ifrit_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Ifrit_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "剣を振るい、敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "ui",
    "name": "ウイ",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "活発",
      "race": "精霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 95.0,
      "combatPowerCorrectionB": 0.425
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 1.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Ui_low_e01",
            "valueKind": "持続HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/最大9名",
            "reference": "最大HP",
            "levels": {
              "1": 3.0,
              "2": 3.3,
              "3": 3.6,
              "4": 3.9,
              "5": 4.2,
              "6": 4.5,
              "7": 4.8,
              "8": 5.1,
              "9": 5.4,
              "10": 5.7,
              "11": 6.0,
              "12": 6.3,
              "13": 6.6,
              "14": 6.9,
              "15": 7.2
            }
          },
          {
            "effectId": "Ui_low_e02",
            "valueKind": "持続SP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/最大9名",
            "reference": "最大SP",
            "levels": {
              "1": 1.0,
              "2": 1.1,
              "3": 1.2,
              "4": 1.3,
              "5": 1.4,
              "6": 1.5,
              "7": 1.6,
              "8": 1.7,
              "9": 1.8,
              "10": 1.9,
              "11": 2.0,
              "12": 2.1,
              "13": 2.2,
              "14": 2.3,
              "15": 2.4
            }
          },
          {
            "effectId": "Ui_low_e03",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲/最大9名",
            "levels": {
              "1": 250.5,
              "2": 275.55,
              "3": 300.6,
              "4": 325.65,
              "5": 350.7,
              "6": 375.75,
              "7": 400.8,
              "8": 425.85,
              "9": 450.9,
              "10": 475.95,
              "11": 501.0,
              "12": 526.05,
              "13": 551.1,
              "14": 576.15,
              "15": 601.2
            }
          },
          {
            "effectId": "Ui_low_e04",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲/最大9名",
            "fixedValue": 6.0
          },
          {
            "effectId": "Ui_low_e05",
            "valueKind": "カエル雨",
            "valueClass": "持続時間",
            "effectType": "設置効果",
            "effectTarget": "自身周囲",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Ui_low",
        "skillType": "低学年",
        "skillName": "カエル雨",
        "description": "自身の周囲にカエルの雨を降らせて1秒ごとに味方のHPとSPを回復させ、敵に範囲魔法ダメージを与える。回復とダメージはそれぞれ最大9名の味方と敵に適用される。"
      },
      {
        "effects": [
          {
            "effectId": "Ui_high_e02",
            "valueKind": "HP全回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "最大HP",
            "fixedValue": 100.0
          },
          {
            "effectId": "Ui_high_e03",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "シールド",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "最大HP",
            "levels": {
              "1": 5.0,
              "2": 6.0,
              "3": 7.0,
              "4": 8.0,
              "5": 9.0,
              "6": 10.0,
              "7": 11.0,
              "8": 12.0,
              "9": 13.0,
              "10": 14.0,
              "11": 15.0,
              "12": 16.0,
              "13": 17.0,
              "14": 18.0,
              "15": 19.0
            }
          },
          {
            "effectId": "Ui_high_e04",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "残りHP割合が最も低い味方",
            "fixedValue": 6.0
          },
          {
            "effectId": "Ui_high_e05",
            "valueKind": "SP全回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "残りSP割合が最も低い味方",
            "reference": "最大SP",
            "fixedValue": 100.0
          },
          {
            "effectId": "Ui_high_e06",
            "valueKind": "変異",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵"
          },
          {
            "effectId": "Ui_high_e07",
            "valueKind": "変異",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 3.0,
              "2": 3.2,
              "3": 3.4,
              "4": 3.6,
              "5": 3.8,
              "6": 4.0,
              "7": 4.2,
              "8": 4.4,
              "9": 4.6,
              "10": 4.8,
              "11": 5.0,
              "12": 5.2,
              "13": 5.4,
              "14": 5.6,
              "15": 5.8
            }
          }
        ],
        "skillId": "Ui_high",
        "skillType": "高学年",
        "skillName": "カエルの言うとおり！",
        "description": "エルの歌で対象3体にそれぞれ効果を付与する。残りHP割合が最も低い味方のHPを全回復させ、シールドを付与する。残りSP割合が最も低い味方のSPを全回復する。ランダムな敵に変異を付与する。",
        "cooldownSeconds": 20.0
      },
      {
        "effects": [
          {
            "effectId": "Ui_passive_e01",
            "valueKind": "スキル攻撃の被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "味方全員",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          }
        ],
        "skillId": "Ui_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "味方全員に対するスキル攻撃による被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Ui_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Ui_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "精霊魔法を放って敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Ui_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 160.0
          },
          {
            "effectId": "Ui_enhanced_e02",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "fixedValue": 20.0
          }
        ],
        "skillId": "Ui_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でエルが敵を舌ではたいて魔法ダメージを与え、周囲の味方のSPを回復する。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "アンハッピーウイ",
      "levels": {
        "1": {
          "name": "エルはケロケロ",
          "stats": [],
          "effects": [
            {
              "skillId": "Ui_aside_1",
              "effectId": "Ui_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ui_aside_1",
              "effectId": "Ui_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ui_aside_1",
              "effectId": "Ui_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ui_aside_1",
              "effectId": "Ui_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ui_aside_1",
              "effectId": "Ui_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "ポジティブの王ウイ",
          "stats": [],
          "effects": [
            {
              "skillId": "Ui_aside_2",
              "effectId": "Ui_aside_2_e01",
              "valueKind": "活発追加",
              "valueClass": "固定値",
              "effectType": "パッシブ",
              "effectTarget": "自身",
              "fixedValue": 1.0
            },
            {
              "skillId": "Ui_aside_2",
              "effectId": "Ui_aside_2_e02",
              "processGroupId": "Ui_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "味方/中列",
              "targetSkill": "低学年スキル",
              "fixedValue": 16.0
            },
            {
              "skillId": "Ui_aside_2",
              "effectId": "Ui_aside_2_e03",
              "processGroupId": "Ui_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "ダメージ量増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "味方/中列",
              "targetSkill": "低学年スキル",
              "fixedValue": 7.0
            }
          ],
          "description": "活発を1個追加する。\n低学年スキル使用時、中列の味方のダメージ量を増加させる。"
        },
        "3": {
          "name": "長ぐつをはいたウイ",
          "stats": [
            {
              "skillId": "Ui_aside_3_global",
              "effectId": "Ui_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4.0
            },
            {
              "skillId": "Ui_aside_3_global",
              "effectId": "Ui_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Ui_aside_3_battle",
              "effectId": "Ui_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 14.0
            }
          ],
          "description": "中列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "vivi",
    "name": "ヴィヴィ",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "純粋",
      "race": "竜族",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 150.0,
      "spRecoveryPerSecond": 50.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 5.0,
      "critDmgRes": 5.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Vivi_low_e01",
            "processGroupId": "Vivi_low_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 33.0,
              "2": 37.0,
              "3": 40.0,
              "4": 43.0,
              "5": 46.0,
              "6": 48.0,
              "7": 51.0,
              "8": 53.0,
              "9": 56.0,
              "10": 59.0,
              "11": 61.0,
              "12": 64.0,
              "13": 66.0,
              "14": 69.0,
              "15": 72.0
            }
          },
          {
            "effectId": "Vivi_low_e02",
            "processGroupId": "Vivi_low_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Vivi_low_e03",
            "processGroupId": "Vivi_low_proc02",
            "processOrder": 1.0,
            "valueKind": "敵防御力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "triggerType": "シールド終了時",
            "triggerSourceId": "Vivi_low_e01",
            "condition": "シールド終了時",
            "effectTarget": "敵/自身周囲",
            "fixedValue": 40.0
          },
          {
            "effectId": "Vivi_low_e04",
            "processGroupId": "Vivi_low_proc02",
            "processOrder": 2.0,
            "valueKind": "敵防御力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "シールド終了時",
            "triggerSourceId": "Vivi_low_e01",
            "condition": "シールド終了時",
            "effectTarget": "敵/自身周囲",
            "fixedValue": 7.0
          }
        ],
        "skillId": "Vivi_low",
        "skillType": "低学年",
        "skillName": "わたくしに触れられまして？",
        "description": "自身にダメージを吸収する水銀シールドを付与する。 シールドが破壊されるか、持続時間が終わると、周囲の対象の防御力を減少させる。"
      },
      {
        "effects": [
          {
            "effectId": "Vivi_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/指定範囲内で最遠",
            "levels": {
              "1": 360.0,
              "2": 430.0,
              "3": 500.0,
              "4": 570.0,
              "5": 640.0,
              "6": 710.0,
              "7": 780.0,
              "8": 850.0,
              "9": 920.0,
              "10": 990.0,
              "11": 1060.0,
              "12": 1130.0,
              "13": 1200.0,
              "14": 1270.0,
              "15": 1340.0
            }
          },
          {
            "effectId": "Vivi_high_e02",
            "processGroupId": "Vivi_high_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 33.0,
              "2": 37.0,
              "3": 40.0,
              "4": 43.0,
              "5": 46.0,
              "6": 48.0,
              "7": 51.0,
              "8": 53.0,
              "9": 56.0,
              "10": 59.0,
              "11": 61.0,
              "12": 64.0,
              "13": 66.0,
              "14": 69.0,
              "15": 72.0
            }
          },
          {
            "effectId": "Vivi_high_e03",
            "processGroupId": "Vivi_high_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Vivi_high",
        "skillType": "高学年",
        "skillName": "クイックシルバーランス",
        "description": "水銀の槍を指定範囲内で最も遠い敵に飛ばして魔法ダメージを与え、自身にシールドを生成する。",
        "cooldownSeconds": 42.0
      },
      {
        "effects": [
          {
            "effectId": "Vivi_passive_e01",
            "processGroupId": "Vivi_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "ヒール",
            "triggerType": "普通攻撃命中時",
            "triggerSourceId": "普通攻撃",
            "condition": "基本攻撃命中時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 4.2,
              "2": 4.8,
              "3": 5.3,
              "4": 5.9,
              "5": 6.4,
              "6": 7.0,
              "7": 7.6,
              "8": 8.1,
              "9": 8.7,
              "10": 9.2,
              "11": 9.8,
              "12": 10.4,
              "13": 10.9,
              "14": 11.5,
              "15": 12.0
            }
          }
        ],
        "skillId": "Vivi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃が命中すると、自身のHPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Vivi_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Vivi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "刀を操り敵に魔法ダメージを2回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Vivi_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 260.0
          }
        ],
        "skillId": "Vivi_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定の確率で刀で敵を4回刺し、範囲魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 20.0
      }
    ],
    "favoriteCard": {
      "name": "ヴィヴィの銀色の指揮棒",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Vivi_favorite_1_e01",
                "processGroupId": "Vivi_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "高学年",
                "targetSkillName": "クイックシルバーフィナーレ",
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/指定範囲内で最遠",
                "levels": {
                  "1": 720.0,
                  "2": 860.0,
                  "3": 1000.0,
                  "4": 1140.0,
                  "5": 1280.0,
                  "6": 1420.0,
                  "7": 1560.0,
                  "8": 1700.0,
                  "9": 1840.0,
                  "10": 2120.0,
                  "11": 2260.0,
                  "12": 2260.0,
                  "13": 2400.0,
                  "14": 2540.0,
                  "15": 2680.0
                }
              },
              {
                "effectId": "Vivi_favorite_1_e02",
                "processGroupId": "Vivi_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "高学年",
                "targetSkillName": "クイックシルバーフィナーレ",
                "valueKind": "確定会心",
                "valueClass": "条件",
                "effectType": "攻撃",
                "effectTarget": "敵/指定範囲内で最遠"
              }
            ],
            "skillId": "Vivi_favorite_1",
            "skillName": "愛用Lv1",
            "description": "水銀の槍を指定範囲内で最も遠い敵に飛ばして確定会心魔法ダメージを与え、自身にシールドを付与する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Vivi_favorite_3_e01",
                "valueKind": "最大HP",
                "valueClass": "倍率",
                "effectType": "パッシブ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Vivi_favorite_3_e02",
                "valueKind": "毎秒SP回復量",
                "valueClass": "固定値",
                "effectType": "パッシブ",
                "effectTarget": "自身",
                "fixedValue": 10.0
              }
            ],
            "skillId": "Vivi_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ヴィヴィのHPが増加する。\nヴィヴィの1秒ごとのSP回復量が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "鎖で閉ざされた箱",
      "levels": {
        "1": {
          "name": "閉ざされた記憶の箱",
          "stats": [],
          "effects": [
            {
              "skillId": "Vivi_aside_1",
              "effectId": "Vivi_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Vivi_aside_1",
              "effectId": "Vivi_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Vivi_aside_1",
              "effectId": "Vivi_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Vivi_aside_1",
              "effectId": "Vivi_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Vivi_aside_1",
              "effectId": "Vivi_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "わたくしがお守りいたしますわ",
          "stats": [],
          "effects": [
            {
              "skillId": "Vivi_aside_2",
              "effectId": "Vivi_aside_2_e01",
              "valueKind": "被スキルダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 33.0
            },
            {
              "skillId": "Vivi_aside_2",
              "effectId": "Vivi_aside_2_e02",
              "processGroupId": "Vivi_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "SP減少量",
              "valueClass": "SP量",
              "effectType": "デバフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "effectTarget": "敵",
              "targetSkill": "基本攻撃",
              "fixedValue": 45.0
            },
            {
              "skillId": "Vivi_aside_2",
              "effectId": "Vivi_aside_2_e03",
              "processGroupId": "Vivi_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "ワールドボスSP減少量",
              "valueClass": "SP量",
              "effectType": "デバフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "effectTarget": "敵",
              "targetSkill": "基本攻撃",
              "fixedValue": 15.0
            },
            {
              "skillId": "Vivi_aside_2",
              "effectId": "Vivi_aside_2_e04",
              "processGroupId": "Vivi_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "シールド",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "低学年スキル終了時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用後",
              "effectTarget": "自身以外の残りHP割合が最も少ない味方",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 33.0,
                "2": 37.0,
                "3": 40.0,
                "4": 43.0,
                "5": 46.0,
                "6": 48.0,
                "7": 51.0,
                "8": 53.0,
                "9": 56.0,
                "10": 59.0,
                "11": 61.0,
                "12": 64.0,
                "13": 66.0,
                "14": 69.0,
                "15": 72.0
              }
            },
            {
              "skillId": "Vivi_aside_2",
              "effectId": "Vivi_aside_2_e05",
              "processGroupId": "Vivi_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "シールド",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "低学年スキル終了時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用後",
              "effectTarget": "自身以外の残りHP割合が最も少ない味方",
              "targetSkill": "低学年スキル",
              "fixedValue": 6.0
            },
            {
              "skillId": "Vivi_aside_2",
              "effectId": "Vivi_aside_2_e06",
              "valueKind": "追加発射対象数",
              "valueClass": "対象数",
              "effectType": "攻撃",
              "effectTarget": "ランダムな敵",
              "targetSkill": "高学年スキル",
              "reference": "現在の対象スキル",
              "fixedValue": 2.0
            }
          ],
          "description": "敵からの被スキルダメージ量が減少する。\n基本攻撃が命中時、攻撃した敵のSPを減少させる。\n(ワールドボスはSP減少量が低下する。)\n低学年スキル使用後、自身を除き、残りHP割合が最も低い味方に水銀シールドを付与する。\n高学年スキルの水銀の槍が、ランダムな2体に追加で発射される。"
        },
        "3": {
          "name": "名誉あるヴィヴィ",
          "stats": [
            {
              "skillId": "Vivi_aside_3_global",
              "effectId": "Vivi_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4.0
            },
            {
              "skillId": "Vivi_aside_3_global",
              "effectId": "Vivi_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Vivi_aside_3_battle",
              "effectId": "Vivi_aside_3_battle_e01",
              "valueKind": "被ダメージ量を減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            },
            {
              "skillId": "Vivi_aside_3_battle",
              "effectId": "Vivi_aside_3_battle_e02",
              "valueKind": "攻撃速度を増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 5.25
            }
          ],
          "description": "味方全員の敵からの被ダメージ量を減少させる。\n味方全員の攻撃速度を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "ashur",
    "name": "エシュール",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "妖精",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 150.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 80.0,
      "combatPowerCorrectionB": 0.335
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 5.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Ashur_low_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 500.0,
              "2": 550.0,
              "3": 600.0,
              "4": 650.0,
              "5": 700.0,
              "6": 750.0,
              "7": 800.0,
              "8": 850.0,
              "9": 900.0,
              "10": 950.0,
              "11": 1000.0,
              "12": 1050.0
            }
          },
          {
            "effectId": "Ashur_low_e02",
            "valueKind": "発射数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Ashur_low",
        "skillType": "低学年",
        "skillName": "パンテミック",
        "description": "パンを6個放ち、ぶつかった敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Ashur_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 400.0,
              "2": 440.0,
              "3": 480.0,
              "4": 520.0,
              "5": 560.0,
              "6": 600.0,
              "7": 640.0,
              "8": 680.0,
              "9": 720.0,
              "10": 760.0,
              "11": 800.0,
              "12": 840.0
            }
          },
          {
            "effectId": "Ashur_high_e02",
            "valueKind": "2回目の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "跳ね返り先の敵",
            "levels": {
              "1": 400.0,
              "2": 440.0,
              "3": 480.0,
              "4": 520.0,
              "5": 560.0,
              "6": 600.0,
              "7": 640.0,
              "8": 680.0,
              "9": 720.0,
              "10": 760.0,
              "11": 800.0,
              "12": 840.0
            }
          },
          {
            "effectId": "Ashur_high_e03",
            "valueKind": "跳ね返り数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Ashur_high_e04",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Ashur_high_e05",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Ashur_high",
        "skillType": "高学年",
        "skillName": "パンテオ",
        "description": "真ん中にいる敵に巨大なケーキを投げ落とし、敵に範囲魔法ダメージを与え気絶を付与する。 一定距離内に別の敵がいる場合、ショートケーキが跳ね返って魔法ダメージを与える。 ショートケーキは最大3体に跳ね返る。",
        "cooldownSeconds": 28.0
      },
      {
        "effects": [
          {
            "effectId": "Ashur_passive_e01",
            "processGroupId": "Ashur_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "自身HP以下到達時",
            "triggerValue": 50.0,
            "condition": "自分HP50%以下時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 35.0,
              "2": 38.0,
              "3": 41.0,
              "4": 44.0,
              "5": 47.0,
              "6": 50.0,
              "7": 53.0,
              "8": 56.0,
              "9": 59.0,
              "10": 62.0,
              "11": 65.0,
              "12": 68.0
            }
          },
          {
            "effectId": "Ashur_passive_e02",
            "processGroupId": "Ashur_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "自身HP以下到達時",
            "triggerValue": 50.0,
            "condition": "自分HP50%以下時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Ashur_passive_e03",
            "processGroupId": "Ashur_passive_proc01",
            "processOrder": 3.0,
            "valueKind": "クールタイム",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "triggerType": "自身HP以下到達時",
            "triggerValue": 50.0,
            "condition": "自分HP50%以下時",
            "effectTarget": "自身",
            "fixedValue": 25.0
          }
        ],
        "skillId": "Ashur_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "HPが50%以下になると、自分にシールドを生成する。"
      },
      {
        "effects": [
          {
            "effectId": "Ashur_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          },
          {
            "effectId": "Ashur_basic_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Ashur_basic_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Ashur_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "炎の呪文を発射して敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Ashur_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          },
          {
            "effectId": "Ashur_enhanced_e02",
            "valueKind": "2回目の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "跳ね返り先の敵",
            "fixedValue": 150.0
          },
          {
            "effectId": "Ashur_enhanced_e03",
            "valueKind": "跳ね返り数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Ashur_enhanced_e04",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Ashur_enhanced_e05",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Ashur_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で燃えるパンを発射して敵に魔法ダメージを与え、火傷を付与する。 ダメージを受けた敵の一定距離後ろに敵がいる場合、パンくずが跳ね返って魔法ダメージを与え、火傷を付与する。 パンくずは最大2体に跳ね返る。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "espi",
    "name": "エスピー",
    "basic": {
      "rarity": 2.0,
      "personality": "冷静",
      "race": "幽霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Espi_low_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 520.0,
              "2": 570.0,
              "3": 620.0,
              "4": 670.0,
              "5": 720.0,
              "6": 770.0,
              "7": 820.0,
              "8": 870.0,
              "9": 920.0,
              "10": 970.0,
              "11": 1020.0,
              "12": 1070.0
            }
          },
          {
            "effectId": "Espi_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Espi_low_e03",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Espi_low_e04",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Espi_low",
        "skillType": "低学年",
        "skillName": "ゆらゆら炎",
        "description": "幽霊ろうそくを飛ばし、敵に魔法ダメージを2回与え、沈黙を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Espi_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          },
          {
            "effectId": "Espi_high_e02",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "levels": {
              "1": 35.2,
              "2": 39.2,
              "3": 43.2,
              "4": 47.2,
              "5": 51.2,
              "6": 55.2,
              "7": 59.2,
              "8": 63.2,
              "9": 67.2,
              "10": 71.2,
              "11": 75.2,
              "12": 79.2
            }
          }
        ],
        "skillId": "Espi_high",
        "skillType": "高学年",
        "skillName": "スケキヨで～す！",
        "description": "瞬間移動した後、敵に魔法ダメージを与えSPを減少させる。",
        "cooldownSeconds": 12.0
      },
      {
        "effects": [
          {
            "effectId": "Espi_passive_e01",
            "processGroupId": "Espi_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "1秒ごとのSP回復量追加",
            "valueClass": "固定値",
            "effectType": "バフ",
            "triggerType": "自身HP未満到達時",
            "triggerValue": 100.0,
            "condition": "自HP100%未満時",
            "effectTarget": "自身",
            "levels": {
              "1": 12.0,
              "2": 14.0,
              "3": 16.0,
              "4": 18.0,
              "5": 20.0,
              "6": 22.0,
              "7": 24.0,
              "8": 26.0,
              "9": 28.0,
              "10": 30.0,
              "11": 32.0,
              "12": 34.0
            }
          },
          {
            "effectId": "Espi_passive_e02",
            "processGroupId": "Espi_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "SP回復量追加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "自身HP未満到達時",
            "triggerValue": 100.0,
            "condition": "自HP100%未満時",
            "effectTarget": "自身",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Espi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "HPが100%未満になると一定時間、1秒ごとにSP回復量が追加で増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Espi_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Espi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "ろうそくを飛ばし、敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Espi_enhanced_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 125.0
          }
        ],
        "skillId": "Espi_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でろうそくを2本飛ばし、敵に魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "epica",
    "name": "エピカ",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 20.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.465
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Epica_low_e01",
            "processGroupId": "Epica_low_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 60.0,
              "2": 63.0,
              "3": 66.0,
              "4": 69.0,
              "5": 72.0,
              "6": 75.0,
              "7": 78.0,
              "8": 81.0,
              "9": 84.0,
              "10": 87.0,
              "11": 90.0,
              "12": 93.0
            }
          },
          {
            "effectId": "Epica_low_e02",
            "processGroupId": "Epica_low_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "周囲の味方",
            "levels": {
              "1": 8.0,
              "2": 8.5,
              "3": 9.0,
              "4": 9.5,
              "5": 10.0,
              "6": 10.5,
              "7": 11.0,
              "8": 11.5,
              "9": 12.0,
              "10": 12.5,
              "11": 13.0,
              "12": 13.5
            }
          },
          {
            "effectId": "Epica_low_e03",
            "processGroupId": "Epica_low_proc01",
            "processOrder": 3.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身と周囲の味方",
            "fixedValue": 9.0
          },
          {
            "effectId": "Epica_low_e04",
            "valueKind": "強化攻撃化",
            "valueClass": "スキル変更",
            "effectType": "バフ",
            "effectTarget": "自身",
            "reference": "普通攻撃_強化"
          }
        ],
        "skillId": "Epica_low",
        "skillType": "低学年",
        "skillName": "ドラマチック演出",
        "description": "一定時間、自身と周囲の味方の攻撃速度を増加させ、基本攻撃が強化された普通攻撃に置き換わる。"
      },
      {
        "effects": [
          {
            "effectId": "Epica_high_e01",
            "valueKind": "召喚獣物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "基本攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          },
          {
            "effectId": "Epica_high_e03",
            "processGroupId": "Epica_high_performance",
            "processOrder": 1.0,
            "valueKind": "演奏",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectTarget": "自身"
          },
          {
            "effectId": "Epica_high_e06",
            "processGroupId": "Epica_high_performance",
            "processOrder": 2.0,
            "valueKind": "演奏",
            "valueClass": "持続時間",
            "effectType": "固有状態",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Epica_high_e04",
            "processGroupId": "Epica_high_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "固有状態付与時",
            "triggerSourceId": "Epica_high_e03",
            "condition": "演奏時",
            "effectTarget": "周囲の味方",
            "fixedValue": 25.0
          },
          {
            "effectId": "Epica_high_e05",
            "processGroupId": "Epica_high_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "固有状態付与時",
            "triggerSourceId": "Epica_high_e03",
            "condition": "演奏時",
            "effectTarget": "周囲の味方",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Epica_high",
        "skillType": "高学年",
        "skillName": "教主様に捧げる",
        "description": "教主を称える英雄譚を演奏する。演奏が終わるまでエピコンがランダムな敵に物理ダメージを与える。この攻撃は基本攻撃のダメージとみなされる。一定時間、周囲の味方の攻撃力が増加する。",
        "cooldownSeconds": 40.0
      },
      {
        "effects": [
          {
            "effectId": "Epica_passive_e01",
            "valueKind": "会心増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Epica_passive_e02",
            "valueKind": "会心ダメージ増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Epica_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心と会心ダメージが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Epica_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Epica_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "エピコンに敵を攻撃させ、物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Epica_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 400.0
          }
        ],
        "skillId": "Epica_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "勇敢なエピコンが一定確率で敵に範囲物理ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {
      "name": "エピカの高貴なる英雄讃歌",
      "kind": "スペル",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Epica_favorite_1_e01",
                "targetSkillName": "愛用カード効果",
                "valueKind": "ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "編成中",
                "conditionValue": "Epica",
                "condition": "エピカ編成時",
                "effectTarget": "味方全員",
                "fixedValue": 15.0
              },
              {
                "effectId": "Epica_favorite_1_e02",
                "targetSkillName": "愛用カード効果",
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "編成中",
                "conditionValue": "Epica",
                "condition": "エピカ編成時",
                "effectTarget": "味方全員",
                "fixedValue": 10.0
              },
              {
                "effectId": "Epica_favorite_1_e03",
                "processGroupId": "Epica_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "味方戦闘不能時",
                "conditionType": "編成中",
                "conditionValue": "Epica",
                "condition": "エピカ編成時かつ味方戦闘不能時",
                "effectTarget": "味方全員",
                "fixedValue": 15.0
              },
              {
                "effectId": "Epica_favorite_1_e04",
                "processGroupId": "Epica_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "味方戦闘不能時",
                "conditionType": "編成中",
                "conditionValue": "Epica",
                "condition": "エピカ編成時かつ味方戦闘不能時",
                "effectTarget": "味方全員",
                "fixedValue": 10.0
              }
            ],
            "skillId": "Epica_favorite_1",
            "skillName": "愛用Lv1",
            "description": "デッキにエピカが編成されている場合、以下の効果が発動する。\n味方全員のダメージ量と攻撃速度を増加させる。\n味方の使徒が戦闘不能になった時、味方全員の被ダメージ量を減少させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Epica_favorite_3_e01",
                "processGroupId": "Epica_favorite_3_proc01",
                "processOrder": 1.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "ウェーブ開始時",
                "conditionType": "編成中",
                "conditionValue": "Epica",
                "condition": "エピカ編成時かつウェーブ開始時",
                "effectTarget": "自身",
                "fixedValue": 50.0
              },
              {
                "effectId": "Epica_favorite_3_e02",
                "processGroupId": "Epica_favorite_3_proc01",
                "processOrder": 2.0,
                "targetSkillName": "愛用カード効果",
                "valueKind": "攻撃速度増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "ウェーブ開始時",
                "conditionType": "編成中",
                "conditionValue": "Epica",
                "condition": "エピカ編成時かつウェーブ開始時",
                "effectTarget": "自身",
                "fixedValue": 15.0
              }
            ],
            "skillId": "Epica_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ウェーブ開始時に15秒間エピカの攻撃速度が増加する。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "erpin",
    "name": "エルフィン",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "妖精",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Erpin_low_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 519.75,
              "2": 574.2,
              "3": 628.65,
              "4": 683.1,
              "5": 737.55,
              "6": 792.0,
              "7": 846.45,
              "8": 900.9,
              "9": 955.35,
              "10": 1009.8,
              "11": 1064.25,
              "12": 1118.7
            }
          },
          {
            "effectId": "Erpin_low_e02",
            "valueKind": "発射数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Erpin_low",
        "skillType": "低学年",
        "skillName": "魔弾の暴走",
        "description": "暴走する魔力弾を3個発射し、ランダムな敵に範囲魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Erpin_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 500.0,
              "2": 550.0,
              "3": 600.0,
              "4": 650.0,
              "5": 700.0,
              "6": 750.0,
              "7": 800.0,
              "8": 850.0,
              "9": 900.0,
              "10": 950.0,
              "11": 1000.0,
              "12": 1050.0
            }
          }
        ],
        "skillId": "Erpin_high",
        "skillType": "高学年",
        "skillName": "どけえぇぇぇ！！！……え？",
        "description": "杖に魔力を込めて突撃し、敵に範囲魔法ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Erpin_passive_e01",
            "valueKind": "SP回復量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0
            }
          },
          {
            "effectId": "Erpin_passive_e02",
            "valueKind": "味方純粋使徒攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "対象性格",
            "conditionValue": "純粋",
            "effectTarget": "純粋の味方",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0
            }
          }
        ],
        "skillId": "Erpin_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃のSP回復量が増加する。 純粋の味方使徒の攻撃力を増加させる。 (この効果はエルフィンがフィールドにいなくても発動する。)"
      },
      {
        "effects": [
          {
            "effectId": "Erpin_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Erpin_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "魔力弾を発射して敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Erpin_enhanced_e01",
            "valueKind": "SP回復",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 35.0
          }
        ],
        "skillId": "Erpin_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でケーキをつまみ食いして、SPを回復する。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {
      "name": "エルフィンのアイスケーキ",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Erpin_favorite_1_e01",
                "processGroupId": "Erpin_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "SP回復",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "一定確率",
                "triggerValue": 30.0,
                "effectTarget": "自身",
                "fixedValue": 35.0
              },
              {
                "effectId": "Erpin_favorite_1_e02",
                "processGroupId": "Erpin_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "スキルダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "一定確率",
                "triggerValue": 30.0,
                "effectTarget": "自身",
                "fixedValue": 60.0
              }
            ],
            "skillId": "Erpin_favorite_1",
            "skillName": "愛用Lv1",
            "description": "一定確率でアイスケーキを取り出して食べる。\nSPを回復し次のスキルのダメージ量が増加する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Erpin_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Erpin_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Erpin_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Erpin_favorite_3",
            "skillName": "愛用Lv3",
            "description": "エルフィンの魔法攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "elena",
    "name": "エレナ",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "エルフ",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 50.0,
      "combatPowerCorrectionA": 135.0,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Elena_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0
            }
          },
          {
            "effectId": "Elena_low_e02",
            "valueKind": "感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Elena_low_e03",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Elena_low",
        "skillType": "低学年",
        "skillName": "戦術ドローンMK-2",
        "description": "前方にパルス波を放出して、敵に範囲物理ダメージを与え、感電を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Elena_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 700.0,
              "2": 770.0,
              "3": 840.0,
              "4": 910.0,
              "5": 980.0,
              "6": 1050.0,
              "7": 1120.0,
              "8": 1190.0,
              "9": 1260.0,
              "10": 1330.0,
              "11": 1400.0,
              "12": 1470.0
            }
          },
          {
            "effectId": "Elena_high_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 8.0
          },
          {
            "effectId": "Elena_high_e03",
            "valueKind": "最後の爆破の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0
            }
          }
        ],
        "skillId": "Elena_high",
        "skillType": "高学年",
        "skillName": "コードネーム：D-CAT",
        "description": "特殊ドローンを送り出した後、パルス波を周囲に放出し、敵に8回範囲物理ダメージを与える。",
        "cooldownSeconds": 28.0
      },
      {
        "effects": [
          {
            "effectId": "Elena_passive_e01",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "編成中",
            "conditionValue": "Amelia",
            "condition": "アメリア編成時",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0
            }
          }
        ],
        "skillId": "Elena_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "アメリアがデッキに編成されている場合、被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Elena_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 90.0
          },
          {
            "effectId": "Elena_basic_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Elena_basic_e03",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Elena_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "エネルギー弾を発射して敵に物理ダメージを3回与える。最後の一撃はより高いダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Elena_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 600.0
          }
        ],
        "skillId": "Elena_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で過充電されたエネルギー弾を発射して敵にダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 15.0
      }
    ],
    "favoriteCard": {
      "name": "エレナの強化ドローン",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Elena_favorite_1_e01",
                "targetSkill": "高学年",
                "targetSkillName": "D-CATパルス波",
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲",
                "levels": {
                  "1": 1260.0,
                  "2": 1540.0,
                  "3": 1820.0,
                  "4": 2100.0,
                  "5": 2380.0,
                  "6": 2660.0,
                  "7": 2940.0,
                  "8": 3220.0,
                  "9": 3500.0,
                  "10": 3780.0,
                  "11": 4060.0,
                  "12": 4340.0
                }
              },
              {
                "effectId": "Elena_favorite_1_e02",
                "targetSkill": "高学年",
                "targetSkillName": "D-CATパルス波",
                "valueKind": "物理ダメージ",
                "valueClass": "ヒット数",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲",
                "fixedValue": 8.0
              },
              {
                "effectId": "Elena_favorite_1_e03",
                "targetSkill": "高学年",
                "targetSkillName": "D-CATパルス波",
                "valueKind": "最後の爆破の物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲",
                "levels": {
                  "1": 540.0,
                  "2": 660.0,
                  "3": 780.0,
                  "4": 900.0,
                  "5": 1020.0,
                  "6": 1140.0,
                  "7": 1260.0,
                  "8": 1380.0,
                  "9": 1500.0,
                  "10": 1620.0,
                  "11": 1740.0,
                  "12": 1860.0
                }
              },
              {
                "effectId": "Elena_favorite_1_e04",
                "targetSkill": "高学年",
                "targetSkillName": "D-CATパルス波",
                "valueKind": "気絶",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "effectTarget": "敵/範囲"
              },
              {
                "effectId": "Elena_favorite_1_e05",
                "targetSkill": "高学年",
                "targetSkillName": "D-CATパルス波",
                "valueKind": "気絶",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "effectTarget": "敵/範囲",
                "fixedValue": 3.0
              }
            ],
            "skillId": "Elena_favorite_1",
            "skillName": "愛用Lv1",
            "description": "強化された特殊ドローンを送った後、パルス波を周囲に放出して敵に8回の範囲物理ダメージを与え、気絶させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Elena_favorite_3_e01",
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 100.0
              }
            ],
            "skillId": "Elena_favorite_3",
            "skillName": "愛用Lv3",
            "description": "エレナの攻撃速度が増加する。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "gabia",
    "name": "ガヴィア",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "精霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 50.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.565
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 1.0,
      "critDmg": 1.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Gabia_low_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "残りHP割合が最も低い味方3名",
            "reference": "最大HP",
            "levels": {
              "1": 25.0,
              "2": 28.0,
              "3": 31.0,
              "4": 34.0,
              "5": 37.0,
              "6": 40.0,
              "7": 43.0,
              "8": 46.0,
              "9": 49.0,
              "10": 52.0,
              "11": 55.0,
              "12": 58.0
            }
          },
          {
            "effectId": "Gabia_low_e02",
            "processGroupId": "Gabia_low_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド終了時ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "シールド終了時",
            "triggerSourceId": "Gabia_low_e01",
            "condition": "シールド終了時",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 220.0,
              "2": 242.0,
              "3": 264.0,
              "4": 286.0,
              "5": 308.0,
              "6": 330.0,
              "7": 352.0,
              "8": 374.0,
              "9": 396.0,
              "10": 418.0,
              "11": 440.0,
              "12": 462.0
            }
          },
          {
            "effectId": "Gabia_low_e03",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "残りHP割合が最も低い味方3名",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Gabia_low",
        "skillType": "低学年",
        "skillName": "かえす……よ",
        "description": "残りHP割合が最も低い味方3名にシールドを付与する。 シールドが破壊されるか持続時間が終了すると、敵に範囲魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Gabia_high_e01",
            "valueKind": "無敵",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "effectTarget": "残りHP割合が最も低い味方"
          },
          {
            "effectId": "Gabia_high_e02",
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "残りHP割合が最も低い味方",
            "levels": {
              "1": 4.0,
              "2": 4.2,
              "3": 4.4,
              "4": 4.6,
              "5": 4.8,
              "6": 5.0,
              "7": 5.2,
              "8": 5.4,
              "9": 5.6,
              "10": 5.8,
              "11": 6.0,
              "12": 6.2
            }
          }
        ],
        "skillId": "Gabia_high",
        "skillType": "高学年",
        "skillName": "守って……みせる",
        "description": "残りHP割合が最も低い味方に無敵を付与する。",
        "cooldownSeconds": 23.0
      },
      {
        "effects": [
          {
            "effectId": "Gabia_passive_e01",
            "valueKind": "沈黙",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "effectTarget": "自身"
          },
          {
            "effectId": "Gabia_passive_e02",
            "processGroupId": "Gabia_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "自身HP以下到達時",
            "triggerValue": 50.0,
            "condition": "自分HP50%以下",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 35.0,
              "2": 38.0,
              "3": 41.0,
              "4": 44.0,
              "5": 47.0,
              "6": 50.0,
              "7": 53.0,
              "8": 56.0,
              "9": 59.0,
              "10": 62.0,
              "11": 65.0,
              "12": 68.0
            }
          },
          {
            "effectId": "Gabia_passive_e03",
            "processGroupId": "Gabia_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "自身HP以下到達時",
            "triggerValue": 50.0,
            "condition": "自分HP50%以下",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Gabia_passive_e04",
            "processGroupId": "Gabia_passive_proc01",
            "processOrder": 3.0,
            "valueKind": "シールド",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "triggerType": "自身HP以下到達時",
            "triggerValue": 50.0,
            "condition": "自分HP50%以下",
            "effectTarget": "自身",
            "fixedValue": 25.0
          }
        ],
        "skillId": "Gabia_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "沈黙の免疫を持ち、HPが50%以下になると、自身にシールドを生成する。"
      },
      {
        "effects": [
          {
            "effectId": "Gabia_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Gabia_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "岩石を突き出し、敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "carren",
    "name": "カレン",
    "basic": {
      "rarity": 2.0,
      "personality": "活発",
      "race": "妖精",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.4
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Carren_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "自身の最大HP",
            "levels": {
              "1": 8.0,
              "2": 8.7,
              "3": 9.4,
              "4": 10.1,
              "5": 10.8,
              "6": 11.5,
              "7": 12.2,
              "8": 12.9,
              "9": 13.6,
              "10": 14.3,
              "11": 15.0,
              "12": 15.7
            }
          }
        ],
        "skillId": "Carren_low",
        "skillType": "低学年",
        "skillName": "キャロットヒーリング",
        "description": "ニンジンの力で残りHP割合が最も低い味方を回復させる。"
      },
      {
        "effects": [
          {
            "effectId": "Carren_high_e01",
            "valueKind": "1回あたりのHP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "HPが最も少ない味方3名",
            "reference": "自身の最大HP",
            "levels": {
              "1": 15.0,
              "2": 16.5,
              "3": 18.0,
              "4": 19.5,
              "5": 21.0,
              "6": 22.5,
              "7": 24.0,
              "8": 25.5,
              "9": 27.0,
              "10": 28.5,
              "11": 30.0,
              "12": 31.5
            }
          },
          {
            "effectId": "Carren_high_e02",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "回復",
            "effectTarget": "HPが最も少ない味方",
            "fixedValue": 3.0
          },
          {
            "effectId": "Carren_high_e03",
            "valueKind": "回復回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "HPが最も少ない味方3名",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Carren_high",
        "skillType": "高学年",
        "skillName": "シェイク・ア・キャロット",
        "description": "HPが最も少ない味方3名のHPを3回回復させる。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Carren_passive_e01",
            "valueKind": "HP治癒量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Carren_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "HP治癒量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Carren_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Carren_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を唱えて敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "canna",
    "name": "カンナ",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Canna_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 330.0,
              "2": 363.0,
              "3": 396.0,
              "4": 429.0,
              "5": 462.0,
              "6": 495.0,
              "7": 528.0,
              "8": 561.0,
              "9": 594.0,
              "10": 627.0,
              "11": 660.0,
              "12": 693.0,
              "13": 726.0,
              "14": 759.0,
              "15": 792.0
            }
          }
        ],
        "skillId": "Canna_low",
        "skillType": "低学年",
        "skillName": "でかいのかますぞ！",
        "description": "特殊砲弾を発射して敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Canna_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 525.0,
              "2": 570.0,
              "3": 615.0,
              "4": 660.0,
              "5": 705.0,
              "6": 750.0,
              "7": 795.0,
              "8": 840.0,
              "9": 885.0,
              "10": 930.0,
              "11": 975.0,
              "12": 1020.0,
              "13": 1065.0,
              "14": 1110.0,
              "15": 1155.0
            }
          }
        ],
        "skillId": "Canna_high",
        "skillType": "高学年",
        "skillName": "ラムボム",
        "description": "追跡する羊爆弾を発射し、敵に物理ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Canna_passive_e01",
            "valueKind": "最大HP増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0,
              "13": 44.0,
              "14": 46.0,
              "15": 48.0
            }
          },
          {
            "effectId": "Canna_passive_e02",
            "valueKind": "強化攻撃確率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0,
              "13": 22.0,
              "14": 23.0,
              "15": 24.0
            }
          }
        ],
        "skillId": "Canna_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "最大HPが増加し強化攻撃の確率が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Canna_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "攻撃力が最も高い敵と周囲",
            "fixedValue": 125.0
          }
        ],
        "skillId": "Canna_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "攻撃力が最も高い敵に砲弾を発射して範囲物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Canna_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "攻撃力が最も高い敵と周囲",
            "fixedValue": 250.0
          },
          {
            "effectId": "Canna_enhanced_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "攻撃力が最も高い敵と周囲"
          },
          {
            "effectId": "Canna_enhanced_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "攻撃力が最も高い敵と周囲",
            "fixedValue": 1.5
          }
        ],
        "skillId": "Canna_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "攻撃力が最も高い敵に衝撃砲弾を発射して範囲物理ダメージを与え、気絶を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 20.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "日光浴カンナ",
      "levels": {
        "1": {
          "name": "完璧な休暇",
          "stats": [],
          "effects": [
            {
              "skillId": "Canna_aside_1",
              "effectId": "Canna_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Canna_aside_1",
              "effectId": "Canna_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Canna_aside_1",
              "effectId": "Canna_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Canna_aside_1",
              "effectId": "Canna_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "腕利き砲手のカンナ",
          "stats": [],
          "effects": [
            {
              "skillId": "Canna_aside_2",
              "effectId": "Canna_aside_2_e01",
              "valueKind": "強化攻撃発動確率増加",
              "valueClass": "倍率",
              "effectType": "パッシブ",
              "effectTarget": "自身",
              "targetSkill": "強化攻撃",
              "fixedValue": 15.0
            },
            {
              "skillId": "Canna_aside_2",
              "effectId": "Canna_aside_2_e02",
              "processGroupId": "Canna_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "低学年スキル終了時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用後",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 60.0
            },
            {
              "skillId": "Canna_aside_2",
              "effectId": "Canna_aside_2_e03",
              "processGroupId": "Canna_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "低学年スキル終了時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用後",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 8.0
            }
          ],
          "description": "強化攻撃発動確率が増加する。\n低学年スキル使用後、攻撃速度が増加する。"
        },
        "3": {
          "name": "後衛隊援護要請",
          "stats": [
            {
              "skillId": "Canna_aside_3_global",
              "effectId": "Canna_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 3.0
            },
            {
              "skillId": "Canna_aside_3_global",
              "effectId": "Canna_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Canna_aside_3_battle",
              "effectId": "Canna_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 9.7
            }
          ],
          "description": "後列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "kidian",
    "name": "ギデオン",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "竜族",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Kidian_low_e01",
            "valueKind": "1回の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 300.0,
              "2": 335.0,
              "3": 370.0,
              "4": 405.0,
              "5": 440.0,
              "6": 475.0,
              "7": 510.0,
              "8": 545.0,
              "9": 580.0,
              "10": 615.0,
              "11": 650.0,
              "12": 685.0,
              "13": 720.0,
              "14": 755.0,
              "15": 790.0
            }
          },
          {
            "effectId": "Kidian_low_e02",
            "valueKind": "基本攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Kidian_low_e03",
            "valueKind": "遺物1個ごとの追加攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 1.0
          },
          {
            "effectId": "Kidian_low_e04",
            "valueKind": "最大追加攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Kidian_low_e05",
            "processGroupId": "Kidian_low_proc01",
            "processOrder": 1.0,
            "valueKind": "[遺物装備0]総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "装備遺物数",
            "conditionValue": 0.0,
            "condition": "装備遺物0時",
            "effectTarget": "敵",
            "levels": {
              "1": 600.0,
              "2": 670.0,
              "3": 740.0,
              "4": 810.0,
              "5": 880.0,
              "6": 950.0,
              "7": 1020.0,
              "8": 1090.0,
              "9": 1160.0,
              "10": 1230.0,
              "11": 1300.0,
              "12": 1370.0,
              "13": 1440.0,
              "14": 1510.0,
              "15": 1580.0
            }
          },
          {
            "effectId": "Kidian_low_e06",
            "processGroupId": "Kidian_low_proc01",
            "processOrder": 2.0,
            "valueKind": "[遺物装備1]総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "装備遺物数",
            "conditionValue": 1.0,
            "condition": "装備遺物1時",
            "effectTarget": "敵",
            "levels": {
              "1": 900.0,
              "2": 1005.0,
              "3": 1110.0,
              "4": 1215.0,
              "5": 1320.0,
              "6": 1425.0,
              "7": 1530.0,
              "8": 1635.0,
              "9": 1740.0,
              "10": 1845.0,
              "11": 1950.0,
              "12": 2055.0,
              "13": 2160.0,
              "14": 2265.0,
              "15": 2370.0
            }
          },
          {
            "effectId": "Kidian_low_e07",
            "processGroupId": "Kidian_low_proc01",
            "processOrder": 3.0,
            "valueKind": "[遺物装備2]総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "装備遺物数",
            "conditionValue": 2.0,
            "condition": "装備遺物2時",
            "effectTarget": "敵",
            "levels": {
              "1": 1200.0,
              "2": 1340.0,
              "3": 1480.0,
              "4": 1620.0,
              "5": 1760.0,
              "6": 1900.0,
              "7": 2040.0,
              "8": 2180.0,
              "9": 2320.0,
              "10": 2460.0,
              "11": 2600.0,
              "12": 2740.0,
              "13": 2880.0,
              "14": 3020.0,
              "15": 3160.0
            }
          },
          {
            "effectId": "Kidian_low_e08",
            "processGroupId": "Kidian_low_proc01",
            "processOrder": 4.0,
            "valueKind": "[遺物装備3]総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "装備遺物数",
            "conditionValue": 3.0,
            "condition": "装備遺物3時",
            "effectTarget": "敵",
            "levels": {
              "1": 1500.0,
              "2": 1675.0,
              "3": 1850.0,
              "4": 2025.0,
              "5": 2200.0,
              "6": 2375.0,
              "7": 2550.0,
              "8": 2725.0,
              "9": 2900.0,
              "10": 3075.0,
              "11": 3250.0,
              "12": 3425.0,
              "13": 3600.0,
              "14": 3775.0,
              "15": 3950.0
            }
          }
        ],
        "skillId": "Kidian_low",
        "skillType": "低学年",
        "skillName": "アウトサイドカット",
        "description": "敵に突進し、物理ダメージを2回与える。遺物を1個装着するごとに攻撃回数が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Kidian_high_e01",
            "valueKind": "1回の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵の周囲",
            "levels": {
              "1": 200.0,
              "2": 215.0,
              "3": 230.0,
              "4": 245.0,
              "5": 260.0,
              "6": 275.0,
              "7": 290.0,
              "8": 305.0,
              "9": 320.0,
              "10": 335.0,
              "11": 350.0,
              "12": 365.0,
              "13": 380.0,
              "14": 395.0,
              "15": 410.0
            }
          },
          {
            "effectId": "Kidian_high_e02",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵の周囲",
            "levels": {
              "1": 600.0,
              "2": 645.0,
              "3": 690.0,
              "4": 735.0,
              "5": 780.0,
              "6": 825.0,
              "7": 870.0,
              "8": 915.0,
              "9": 960.0,
              "10": 1005.0,
              "11": 1050.0,
              "12": 1095.0,
              "13": 1140.0,
              "14": 1185.0,
              "15": 1230.0
            }
          },
          {
            "effectId": "Kidian_high_e03",
            "valueKind": "攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵の周囲",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Kidian_high",
        "skillType": "高学年",
        "skillName": "シャドウダイブ",
        "description": "影に隠れた後、残りHP割合が最も低い敵の付近に現れ、範囲物理ダメージを3回与える。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Kidian_passive_e01",
            "processGroupId": "Kidian_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "スキル使用時",
            "triggerSourceId": "スキル",
            "condition": "スキル使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 28.0,
              "3": 32.0,
              "4": 36.0,
              "5": 40.0,
              "6": 44.0,
              "7": 48.0,
              "8": 52.0,
              "9": 56.0,
              "10": 60.0,
              "11": 64.0,
              "12": 68.0,
              "13": 72.0,
              "14": 76.0,
              "15": 80.0
            }
          },
          {
            "effectId": "Kidian_passive_e02",
            "processGroupId": "Kidian_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "スキル使用時",
            "triggerSourceId": "スキル",
            "condition": "スキル使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Kidian_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "スキルを使用すると攻撃力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Kidian_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Kidian_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "短剣を振るい、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "教主の星座",
      "levels": {
        "1": {
          "name": "夜空の星座",
          "stats": [],
          "effects": [
            {
              "skillId": "Kidian_aside_1",
              "effectId": "Kidian_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kidian_aside_1",
              "effectId": "Kidian_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kidian_aside_1",
              "effectId": "Kidian_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kidian_aside_1",
              "effectId": "Kidian_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "異分子ヘディング",
          "stats": [],
          "effects": [
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e01",
              "processGroupId": "Kidian_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "低学年スキル追加攻撃回数",
              "valueClass": "回数",
              "effectType": "スキル変更",
              "attackCategory": "低学年スキル",
              "conditionType": "装備遺物数",
              "conditionValue": 0.0,
              "condition": "装備遺物0時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 2.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e02",
              "processGroupId": "Kidian_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "低学年スキル追加攻撃回数",
              "valueClass": "回数",
              "effectType": "スキル変更",
              "attackCategory": "低学年スキル",
              "conditionType": "装備遺物数",
              "conditionValue": 1.0,
              "condition": "装備遺物1時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 2.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e03",
              "processGroupId": "Kidian_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "低学年スキル追加攻撃回数",
              "valueClass": "回数",
              "effectType": "スキル変更",
              "attackCategory": "低学年スキル",
              "conditionType": "装備遺物数",
              "conditionValue": 2.0,
              "condition": "装備遺物2時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 2.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e04",
              "processGroupId": "Kidian_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "低学年スキル追加攻撃回数",
              "valueClass": "回数",
              "effectType": "スキル変更",
              "attackCategory": "低学年スキル",
              "conditionType": "装備遺物数",
              "conditionValue": 3.0,
              "condition": "装備遺物3時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 2.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e05",
              "valueKind": "目くらまし",
              "valueClass": "状態付与",
              "effectType": "バフ",
              "triggerType": "自身HP以下到達時",
              "triggerValue": 50.0,
              "effectTarget": "自身"
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e06",
              "valueKind": "目くらまし",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "自身HP以下到達時",
              "triggerValue": 50.0,
              "effectTarget": "自身",
              "fixedValue": 5.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e07",
              "valueKind": "目くらましクールタイム",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "triggerType": "自身HP以下到達時",
              "triggerValue": 50.0,
              "effectTarget": "自身",
              "fixedValue": 8.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e08",
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "自身HP以下到達時",
              "triggerValue": 50.0,
              "effectTarget": "自身",
              "fixedValue": 60.0
            },
            {
              "skillId": "Kidian_aside_2",
              "effectId": "Kidian_aside_2_e09",
              "valueKind": "SP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "triggerType": "自身HP以下到達時",
              "triggerValue": 50.0,
              "effectTarget": "自身",
              "fixedValue": 8.0
            }
          ],
          "description": "低学年スキルの基本攻撃回数が増加する。\nHPが50%以下になると、自身に目くらましをかけ、SPを回復する。"
        },
        "3": {
          "name": "ボクが輝かせてあげるよ……。",
          "stats": [
            {
              "skillId": "Kidian_aside_3_global",
              "effectId": "Kidian_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 3.0
            },
            {
              "skillId": "Kidian_aside_3_global",
              "effectId": "Kidian_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Kidian_aside_3_battle",
              "effectId": "Kidian_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 10.5
            },
            {
              "skillId": "Kidian_aside_3_battle",
              "effectId": "Kidian_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 4.5
            }
          ],
          "description": "味方全員の与ダメージ量を増加させ、味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "kyarot",
    "name": "キャロット",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "妖精",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 95.0,
      "combatPowerCorrectionB": 0.335
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 0.0,
      "atkM": 1.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Kyarot_low_e01",
            "processGroupId": "Kyarot_low_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Kyarot_low_sap",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0,
              "13": 22.0,
              "14": 23.0,
              "15": 24.0
            }
          },
          {
            "effectId": "Kyarot_low_e02",
            "processGroupId": "Kyarot_low_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Kyarot_low_sap",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "fixedValue": 8.0
          },
          {
            "effectId": "Kyarot_low_e03",
            "processGroupId": "Kyarot_low_proc01",
            "processOrder": 3.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Kyarot_low_sap",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "levels": {
              "1": 25.0,
              "2": 26.0,
              "3": 27.0,
              "4": 28.0,
              "5": 29.0,
              "6": 30.0,
              "7": 31.0,
              "8": 32.0,
              "9": 33.0,
              "10": 34.0,
              "11": 35.0,
              "12": 36.0,
              "13": 37.0,
              "14": 38.0,
              "15": 39.0
            }
          },
          {
            "effectId": "Kyarot_low_e04",
            "processGroupId": "Kyarot_low_proc01",
            "processOrder": 4.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Kyarot_low_sap",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Kyarot_low",
        "skillType": "低学年",
        "skillName": "炭酸水液発射",
        "description": "サトウキビの樹液を振って発射する。発射された樹液は、しばらくして自身に落ちる。樹液は、範囲内の味方の攻撃力を増加させ、被ダメージ量を減少させる。"
      },
      {
        "effects": [
          {
            "effectId": "Kyarot_high_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "範囲内の味方",
            "reference": "最大HP",
            "fixedValue": 6.0
          },
          {
            "effectId": "Kyarot_high_e02",
            "valueKind": "HP回復",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "範囲内の味方",
            "fixedValue": 12.0
          },
          {
            "effectId": "Kyarot_high_e03",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 40.0,
              "2": 44.0,
              "3": 48.0,
              "4": 52.0,
              "5": 56.0,
              "6": 60.0,
              "7": 64.0,
              "8": 68.0,
              "9": 72.0,
              "10": 76.0,
              "11": 80.0,
              "12": 84.0,
              "13": 88.0,
              "14": 92.0,
              "15": 96.0
            }
          },
          {
            "effectId": "Kyarot_high_e04",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 12.0
          },
          {
            "effectId": "Kyarot_high_e05",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "真ん中にいる敵"
          },
          {
            "effectId": "Kyarot_high_e06",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "真ん中にいる敵",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Kyarot_high",
        "skillType": "高学年",
        "skillName": "樹液ポンプ発射！",
        "description": "味方と敵にそれぞれサトウキビの樹液を12回ずつ発射する。味方に発射された樹液は範囲内の味方のHPを回復させる。敵に発射された樹液は範囲内の敵に範囲魔法ダメージを与える。最後に発射された樹液は真ん中にいる敵に範囲魔法ダメージを与え、沈黙を付与する。",
        "cooldownSeconds": 32.0
      },
      {
        "effects": [
          {
            "effectId": "Kyarot_passive_e01",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身と周囲の味方",
            "levels": {
              "1": 1.0,
              "2": 2.0,
              "3": 3.0,
              "4": 4.0,
              "5": 5.0,
              "6": 6.0,
              "7": 7.0,
              "8": 8.0,
              "9": 9.0,
              "10": 10.0,
              "11": 11.0,
              "12": 12.0,
              "13": 13.0,
              "14": 14.0,
              "15": 15.0
            }
          },
          {
            "effectId": "Kyarot_passive_e02",
            "valueKind": "SP回復周期",
            "valueClass": "周期",
            "effectType": "回復",
            "effectTarget": "自身と周囲の味方",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Kyarot_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "2秒ごとに自身と周囲の味方のSPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Kyarot_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 85.0
          }
        ],
        "skillId": "Kyarot_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "サトウキビを投げつけて敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Kyarot_enhanced_e01",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "fixedValue": 50.0
          }
        ],
        "skillId": "Kyarot_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回目の攻撃の代わりに、魔法成長肥料を撒いて周囲の味方のSPを回復する。",
        "triggerType": "n回ごと",
        "triggerValue": 4.0
      }
    ],
    "favoriteCard": {
      "name": "キャロットのサトウキビ",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Kyarot_favorite_1_e01",
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "対象追加",
                "valueClass": "対象数",
                "effectType": "スキル変更",
                "effectTarget": "自身と最もHP割合が低い味方",
                "reference": "低学年",
                "fixedValue": 2.0
              },
              {
                "effectId": "Kyarot_favorite_1_e02",
                "processGroupId": "Kyarot_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Kyarot_low_sap",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "levels": {
                  "1": 20.0,
                  "2": 21.0,
                  "3": 22.0,
                  "4": 23.0,
                  "5": 24.0,
                  "6": 25.0,
                  "7": 26.0,
                  "8": 27.0,
                  "9": 28.0,
                  "10": 29.0,
                  "11": 30.0,
                  "12": 31.0,
                  "13": 32.0,
                  "14": 33.0,
                  "15": 34.0
                }
              },
              {
                "effectId": "Kyarot_favorite_1_e03",
                "processGroupId": "Kyarot_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "攻撃力増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Kyarot_low_sap",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 8.0
              },
              {
                "effectId": "Kyarot_favorite_1_e04",
                "processGroupId": "Kyarot_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "HP回復量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Kyarot_low_sap",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 20.0
              },
              {
                "effectId": "Kyarot_favorite_1_e05",
                "processGroupId": "Kyarot_favorite_1_proc01",
                "processOrder": 4.0,
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "HP回復量増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Kyarot_low_sap",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 8.0
              },
              {
                "effectId": "Kyarot_favorite_1_e06",
                "processGroupId": "Kyarot_favorite_1_proc01",
                "processOrder": 5.0,
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Kyarot_low_sap",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "levels": {
                  "1": 31.0,
                  "2": 32.0,
                  "3": 33.0,
                  "4": 34.0,
                  "5": 35.0,
                  "6": 36.0,
                  "7": 37.0,
                  "8": 38.0,
                  "9": 39.0,
                  "10": 40.0,
                  "11": 41.0,
                  "12": 42.0,
                  "13": 43.0,
                  "14": 44.0,
                  "15": 45.0
                }
              },
              {
                "effectId": "Kyarot_favorite_1_e07",
                "processGroupId": "Kyarot_favorite_1_proc01",
                "processOrder": 6.0,
                "targetSkill": "低学年",
                "targetSkillName": "急成長の樹液発射",
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Kyarot_low_sap",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 8.0
              }
            ],
            "skillId": "Kyarot_favorite_1",
            "skillName": "愛用Lv1",
            "description": "サトウキビの樹液を振って発射する。\n発射された樹液は、しばらくして自身と最もHP割合が低い味方に落ちる。\n樹液は範囲内の味方の攻撃力、HP回復量を増加させ、被ダメージ量を減少させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Kyarot_favorite_3_e01",
                "targetSkillName": "愛用カード効果",
                "valueKind": "最大HP増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Kyarot_favorite_3_e02",
                "targetSkillName": "愛用カード効果",
                "valueKind": "物理防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Kyarot_favorite_3_e03",
                "targetSkillName": "愛用カード効果",
                "valueKind": "魔法防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Kyarot_favorite_3",
            "skillName": "愛用Lv3",
            "description": "キャロットのHP、物理防御力、魔法防御力が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "おひさま",
      "levels": {
        "1": {
          "name": "すくすく育って！",
          "stats": [],
          "effects": [
            {
              "skillId": "Kyarot_aside_1",
              "effectId": "Kyarot_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kyarot_aside_1",
              "effectId": "Kyarot_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kyarot_aside_1",
              "effectId": "Kyarot_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kyarot_aside_1",
              "effectId": "Kyarot_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Kyarot_aside_1",
              "effectId": "Kyarot_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "ニンジンの鮮度維持",
          "stats": [],
          "effects": [
            {
              "skillId": "Kyarot_aside_2",
              "effectId": "Kyarot_aside_2_e01",
              "processGroupId": "Kyarot_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "シールド",
              "valueClass": "倍率",
              "effectType": "シールド",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "reference": "最大HP",
              "fixedValue": 30.0
            },
            {
              "skillId": "Kyarot_aside_2",
              "effectId": "Kyarot_aside_2_e02",
              "processGroupId": "Kyarot_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "シールド",
              "valueClass": "持続時間",
              "effectType": "シールド",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 5.0
            },
            {
              "skillId": "Kyarot_aside_2",
              "effectId": "Kyarot_aside_2_e03",
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "triggerType": "シールド破壊時",
              "triggerSourceId": "Kyarot_aside_2_e01",
              "condition": "シールド破壊時",
              "effectTarget": "自身",
              "targetSkill": "シールド破壊時",
              "fixedValue": 45.0
            }
          ],
          "description": "強化攻撃にシールドが追加される。\nシールドが破壊されると、追加でSPを回復する。"
        },
        "3": {
          "name": "アイスニンジン",
          "stats": [
            {
              "skillId": "Kyarot_aside_3_global",
              "effectId": "Kyarot_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            },
            {
              "skillId": "Kyarot_aside_3_global",
              "effectId": "Kyarot_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Kyarot_aside_3_battle",
              "effectId": "Kyarot_aside_3_battle_e01",
              "valueKind": "ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "後列の味方",
              "fixedValue": 19.5
            }
          ],
          "description": "後列の味方が敵に与えるダメージ量を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "kyuri",
    "name": "キュウイ",
    "basic": {
      "rarity": 1.0,
      "personality": "純粋",
      "race": "妖精",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Kyuri_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "自身の最大HP",
            "levels": {
              "1": 5.0,
              "2": 6.3,
              "3": 7.5,
              "4": 8.8,
              "5": 10.0,
              "6": 11.3,
              "7": 12.5,
              "8": 13.8,
              "9": 15.0,
              "10": 16.3,
              "11": 17.5,
              "12": 18.8
            }
          }
        ],
        "skillId": "Kyuri_low",
        "skillType": "低学年",
        "skillName": "キュウリ投げ",
        "description": "キュウリの力で残りHP割合が最も低い味方を回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Kyuri_high_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "自身の最大HP",
            "levels": {
              "1": 10.0,
              "2": 12.0,
              "3": 14.0,
              "4": 16.0,
              "5": 18.0,
              "6": 20.0,
              "7": 22.0,
              "8": 24.0,
              "9": 26.0,
              "10": 28.0,
              "11": 30.0,
              "12": 32.0
            }
          }
        ],
        "skillId": "Kyuri_high",
        "skillType": "高学年",
        "skillName": "教主の祝福-キュウイ",
        "description": "教主の力を借り、残りHP割合が最も低い味方を回復する。",
        "cooldownSeconds": 16.0
      },
      {
        "effects": [
          {
            "effectId": "Kyuri_passive_e01",
            "valueKind": "HP治癒量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0
            }
          }
        ],
        "skillId": "Kyuri_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "HP治癒量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Kyuri_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Kyuri_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を唱えて敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "chloe",
    "name": "クロエ",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "狂気",
      "race": "妖精",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 5.0,
      "critDmgRes": 5.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Chloe_low_e01",
            "processGroupId": "Chloe_low_doll_will",
            "processOrder": 1.0,
            "valueKind": "ぬいぐるみの意志",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年スキル使用時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Chloe_low_e06",
            "processGroupId": "Chloe_low_doll_will",
            "processOrder": 2.0,
            "valueKind": "ぬいぐるみの意志",
            "valueClass": "持続時間",
            "effectType": "固有状態",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年スキル使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 8.0,
              "2": 8.4,
              "3": 8.8,
              "4": 9.2,
              "5": 9.6,
              "6": 10.0,
              "7": 10.4,
              "8": 10.8,
              "9": 11.2,
              "10": 11.6,
              "11": 12.0,
              "12": 12.4,
              "13": 12.8,
              "14": 13.2,
              "15": 13.6
            }
          },
          {
            "effectId": "Chloe_low_e02",
            "processGroupId": "Chloe_low_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 40.0,
              "2": 44.0,
              "3": 48.0,
              "4": 52.0,
              "5": 56.0,
              "6": 60.0,
              "7": 64.0,
              "8": 68.0,
              "9": 72.0,
              "10": 76.0,
              "11": 80.0,
              "12": 84.0,
              "13": 88.0,
              "14": 92.0,
              "15": 96.0
            }
          },
          {
            "effectId": "Chloe_low_e03",
            "processGroupId": "Chloe_low_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Chloe_low_e04",
            "processGroupId": "Chloe_low_proc02",
            "processOrder": 1.0,
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "普通攻撃使用時",
            "triggerSourceId": "普通攻撃",
            "conditionType": "固有状態中",
            "conditionValue": "Chloe_low_e01",
            "condition": "ぬいぐるみの意志発動中の基本攻撃時",
            "effectTarget": "自身",
            "fixedValue": 7.0
          },
          {
            "effectId": "Chloe_low_e05",
            "processGroupId": "Chloe_low_proc02",
            "processOrder": 2.0,
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "普通攻撃使用時",
            "triggerSourceId": "普通攻撃",
            "conditionType": "固有状態中",
            "conditionValue": "Chloe_low_e01",
            "condition": "ぬいぐるみの意志発動中の基本攻撃時",
            "effectTarget": "自身",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Chloe_low",
        "skillType": "低学年",
        "skillName": "メリごラウンド！",
        "description": "セバスチャンにまたがって一定時間ぬいぐるみの意志を発動し、自身にシールドを生成する。基本攻撃を行うごとに一定時間自身の普通攻撃のダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Chloe_high_e01",
            "valueKind": "プリチーセバスチャン召喚",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "自身",
            "fixedValue": 7.0
          },
          {
            "effectId": "Chloe_high_e02",
            "valueKind": "1体あたりの魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 160.0,
              "2": 176.0,
              "3": 192.0,
              "4": 208.0,
              "5": 224.0,
              "6": 240.0,
              "7": 256.0,
              "8": 272.0,
              "9": 288.0,
              "10": 304.0,
              "11": 320.0,
              "12": 336.0,
              "13": 352.0,
              "14": 368.0,
              "15": 384.0
            }
          },
          {
            "effectId": "Chloe_high_e03",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          }
        ],
        "skillId": "Chloe_high",
        "skillType": "高学年",
        "skillName": "プリチーセバスチャン",
        "description": "プリチーセバスチャンを7体召喚する。プリチーセバスチャンは敵にぶつかると爆発して範囲魔法ダメージを与え、ノックバックさせる。",
        "cooldownSeconds": 50.0
      },
      {
        "effects": [
          {
            "effectId": "Chloe_passive_e01",
            "valueKind": "普通攻撃の被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0,
              "13": 48.0,
              "14": 50.0,
              "15": 52.0
            }
          }
        ],
        "skillId": "Chloe_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "普通攻撃の被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Chloe_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "固有状態外",
            "conditionValue": "Chloe_low_e01",
            "condition": "通常時",
            "effectTarget": "敵",
            "fixedValue": 125.0
          },
          {
            "effectId": "Chloe_basic_e02",
            "processGroupId": "Chloe_basic_doll_will",
            "processOrder": 1.0,
            "valueKind": "ぬいぐるみの意志の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "固有状態中",
            "conditionValue": "Chloe_low_e01",
            "condition": "ぬいぐるみの意志発動中",
            "effectTarget": "敵",
            "fixedValue": 192.0
          },
          {
            "effectId": "Chloe_basic_e03",
            "processGroupId": "Chloe_basic_doll_will",
            "processOrder": 2.0,
            "valueKind": "ぬいぐるみの意志の魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "conditionType": "固有状態中",
            "conditionValue": "Chloe_low_e01",
            "condition": "ぬいぐるみの意志発動中",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Chloe_basic_e04",
            "processGroupId": "Chloe_basic_doll_will",
            "processOrder": 3.0,
            "valueKind": "ぬいぐるみの意志の最後の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "固有状態中",
            "conditionValue": "Chloe_low_e01",
            "condition": "ぬいぐるみの意志発動中",
            "effectTarget": "敵/範囲",
            "fixedValue": 288.0
          }
        ],
        "skillId": "Chloe_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "腕を振って敵に魔法ダメージを与える。ぬいぐるみの意志発動時は効果が変更される。"
      },
      {
        "effects": [
          {
            "effectId": "Chloe_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "固有状態外",
            "conditionValue": "Chloe_low_e01",
            "effectTarget": "敵/範囲",
            "fixedValue": 300.0
          },
          {
            "effectId": "Chloe_enhanced_e02",
            "valueKind": "挑発",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "固有状態外",
            "conditionValue": "Chloe_low_e01",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Chloe_enhanced_e03",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "固有状態外",
            "conditionValue": "Chloe_low_e01",
            "effectTarget": "敵/範囲",
            "fixedValue": 2.0
          },
          {
            "effectId": "Chloe_enhanced_e04",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "conditionType": "固有状態外",
            "conditionValue": "Chloe_low_e01",
            "effectTarget": "敵/範囲"
          }
        ],
        "skillId": "Chloe_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回攻撃するごとに両腕を叩きつけて敵を挑発し、範囲魔法ダメージを与え、ノックバックさせる。ぬいぐるみの意志発動中は強化攻撃を使用できない。",
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "favoriteCard": {
      "name": "クロエの万能裁縫箱",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Chloe_favorite_1_e01",
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "普通攻撃の被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "levels": {
                  "1": 24.0,
                  "2": 26.0,
                  "3": 28.0,
                  "4": 30.0,
                  "5": 32.0,
                  "6": 34.0,
                  "7": 36.0,
                  "8": 38.0,
                  "9": 40.0,
                  "10": 42.0,
                  "11": 44.0,
                  "12": 46.0,
                  "13": 48.0,
                  "14": 50.0,
                  "15": 52.0
                }
              },
              {
                "effectId": "Chloe_favorite_1_e02",
                "processGroupId": "Chloe_favorite_1_doll_will_tick",
                "processOrder": 1.0,
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "周期",
                "valueClass": "周期",
                "effectType": "攻撃",
                "triggerType": "n秒ごと",
                "triggerValue": 2.0,
                "conditionType": "固有状態中",
                "conditionValue": "Chloe_low_e01",
                "condition": "ぬいぐるみの意志発動中",
                "effectTarget": "敵/周囲",
                "fixedValue": 2.0
              },
              {
                "effectId": "Chloe_favorite_1_e03",
                "processGroupId": "Chloe_favorite_1_doll_will_tick",
                "processOrder": 2.0,
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "n秒ごと",
                "triggerValue": 2.0,
                "conditionType": "固有状態中",
                "conditionValue": "Chloe_low_e01",
                "condition": "ぬいぐるみの意志発動中",
                "effectTarget": "敵/周囲",
                "fixedValue": 230.0
              },
              {
                "effectId": "Chloe_favorite_1_e04",
                "processGroupId": "Chloe_favorite_1_doll_will_tick",
                "processOrder": 3.0,
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "糸爆弾",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "effectStack": true,
                "maxStack": 5.0,
                "triggerType": "n秒ごと",
                "triggerValue": 2.0,
                "conditionType": "固有状態中",
                "conditionValue": "Chloe_low_e01",
                "condition": "ぬいぐるみの意志発動中",
                "effectTarget": "敵/周囲"
              },
              {
                "effectId": "Chloe_favorite_1_e05",
                "processGroupId": "Chloe_favorite_1_doll_will_tick",
                "processOrder": 4.0,
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "糸爆弾",
                "valueClass": "最大スタック",
                "effectType": "デバフ",
                "maxStack": 5.0,
                "triggerType": "n秒ごと",
                "triggerValue": 2.0,
                "conditionType": "固有状態中",
                "conditionValue": "Chloe_low_e01",
                "condition": "ぬいぐるみの意志発動中",
                "effectTarget": "敵/周囲",
                "fixedValue": 5.0
              },
              {
                "effectId": "Chloe_favorite_1_e06",
                "processGroupId": "Chloe_favorite_1_thread_bomb_explode",
                "processOrder": 1.0,
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "糸爆弾魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "状態最大スタック到達時",
                "triggerSourceId": "Chloe_favorite_1_e04",
                "conditionType": "状態",
                "conditionValue": "糸爆弾",
                "condition": "糸爆弾が最大5スタックに到達時、爆発して5スタックを消費",
                "effectTarget": "敵/周囲",
                "fixedValue": 346.0
              }
            ],
            "skillId": "Chloe_favorite_1",
            "skillName": "愛用Lv1",
            "description": "普通攻撃の被ダメージ量が減少する。\nぬいぐるみの意志発動中、2秒ごとに周囲の敵に魔法ダメージを与える。ダメージを受けた敵は糸爆弾が付与される。\n糸爆弾は最大5つまでスタックする。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Chloe_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Chloe_favorite_3_e02",
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Chloe_favorite_3_e03",
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Chloe_favorite_3",
            "skillName": "愛用Lv3",
            "description": "クロエの魔法攻撃力、会心抵抗、会心ダメージ抵抗が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "ファッションカバークロエ",
      "levels": {
        "1": {
          "name": "セレブリティ・クロエ",
          "stats": [],
          "effects": [
            {
              "skillId": "Chloe_aside_1",
              "effectId": "Chloe_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Chloe_aside_1",
              "effectId": "Chloe_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Chloe_aside_1",
              "effectId": "Chloe_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Chloe_aside_1",
              "effectId": "Chloe_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Chloe_aside_1",
              "effectId": "Chloe_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "F/W クロエルック",
          "stats": [],
          "effects": [
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e01",
              "valueKind": "気絶",
              "valueClass": "状態免疫",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e02",
              "valueKind": "変異",
              "valueClass": "状態免疫",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e03",
              "valueKind": "直接ダメージ被弾回数",
              "valueClass": "回数",
              "effectType": "条件",
              "effectTarget": "自身",
              "fixedValue": 14.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e04",
              "valueKind": "挑発",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "effectTarget": "敵/周囲"
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e05",
              "valueKind": "挑発",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectTarget": "敵/周囲",
              "fixedValue": 3.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e06",
              "valueKind": "魔法ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "effectTarget": "敵/周囲",
              "fixedValue": 300.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e07",
              "processGroupId": "Chloe_aside_2_doll_will",
              "processOrder": 1.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "固有状態付与時",
              "triggerSourceId": "Chloe_low_e01",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 30.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e08",
              "processGroupId": "Chloe_aside_2_doll_will",
              "processOrder": 2.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "固有状態付与時",
              "triggerSourceId": "Chloe_low_e01",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 7.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e09",
              "processGroupId": "Chloe_aside_2_doll_will",
              "processOrder": 3.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "固有状態付与時",
              "triggerSourceId": "Chloe_low_e01",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "reference": "最大HP",
              "fixedValue": 1.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e10",
              "processGroupId": "Chloe_aside_2_doll_will",
              "processOrder": 4.0,
              "valueKind": "HP回復",
              "valueClass": "周期",
              "effectType": "回復",
              "triggerType": "固有状態付与時",
              "triggerSourceId": "Chloe_low_e01",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 1.0
            },
            {
              "skillId": "Chloe_aside_2",
              "effectId": "Chloe_aside_2_e11",
              "processGroupId": "Chloe_aside_2_doll_will",
              "processOrder": 5.0,
              "valueKind": "HP回復",
              "valueClass": "持続時間",
              "effectType": "回復",
              "triggerType": "固有状態付与時",
              "triggerSourceId": "Chloe_low_e01",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 7.0
            }
          ],
          "description": "気絶と変異の免疫を持つ。\n直接ダメージによって14回ダメージを受けると、周囲の敵を挑発して範囲魔法ダメージを与える。\nぬいぐるみの意思が発動すると、一定時間、攻撃速度が増加し、1秒ごとにHPが回復する。"
        },
        "3": {
          "name": "ランウェイオープニング",
          "stats": [
            {
              "skillId": "Chloe_aside_3_global",
              "effectId": "Chloe_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 4.0
            },
            {
              "skillId": "Chloe_aside_3_global",
              "effectId": "Chloe_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Chloe_aside_3_battle",
              "effectId": "Chloe_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 19.5
            },
            {
              "skillId": "Chloe_aside_3_battle",
              "effectId": "Chloe_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 8.8
            }
          ],
          "description": "前列の味方の敵への与ダメージ量を増加させ、前列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "kommy",
    "name": "コミー",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "獣人",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 2.0,
      "atkM": 0.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Kommy_low_e01",
            "processGroupId": "Kommy_low_sleep_recovery",
            "processOrder": 1.0,
            "valueKind": "HP回復持続",
            "valueClass": "倍率",
            "effectType": "回復",
            "conditionType": "固有状態中",
            "conditionValue": "Kommy_low_e04",
            "condition": "睡眠中",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 12.5,
              "2": 13.25,
              "3": 14.0,
              "4": 14.75,
              "5": 15.5,
              "6": 16.25,
              "7": 17.0,
              "8": 17.75,
              "9": 18.5,
              "10": 19.25,
              "11": 20.0,
              "12": 20.75
            }
          },
          {
            "effectId": "Kommy_low_e02",
            "processGroupId": "Kommy_low_sleep_recovery",
            "processOrder": 2.0,
            "valueKind": "HP回復持続",
            "valueClass": "持続時間",
            "effectType": "回復",
            "conditionType": "固有状態中",
            "conditionValue": "Kommy_low_e04",
            "condition": "睡眠中",
            "effectTarget": "自身",
            "fixedValue": 4.0
          },
          {
            "effectId": "Kommy_low_e03",
            "valueKind": "デバフ",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "conditionType": "固有状態中",
            "conditionValue": "Kommy_low_e04",
            "condition": "睡眠中",
            "effectTarget": "自身"
          },
          {
            "effectId": "Kommy_low_e04",
            "processGroupId": "Kommy_low_sleep",
            "processOrder": 1.0,
            "valueKind": "睡眠",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectTarget": "自身"
          },
          {
            "effectId": "Kommy_low_e05",
            "processGroupId": "Kommy_low_sleep",
            "processOrder": 2.0,
            "valueKind": "睡眠",
            "valueClass": "持続時間",
            "effectType": "固有状態",
            "effectTarget": "自身",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Kommy_low",
        "skillType": "低学年",
        "skillName": "ふかふかタイム",
        "description": "睡眠中、1秒ごとにコミーのHPが回復する。 眠っている間はデバフに免疫を持つ。"
      },
      {
        "effects": [
          {
            "effectId": "Kommy_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 450.0,
              "2": 495.0,
              "3": 540.0,
              "4": 585.0,
              "5": 630.0,
              "6": 675.0,
              "7": 720.0,
              "8": 765.0,
              "9": 810.0,
              "10": 855.0,
              "11": 900.0,
              "12": 945.0
            }
          },
          {
            "effectId": "Kommy_high_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "与ダメージ量",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0
            }
          },
          {
            "effectId": "Kommy_high_e03",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "固有状態中",
            "conditionValue": "Kommy_high_e05",
            "condition": "巨大化中",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Kommy_high_e04",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "固有状態中",
            "conditionValue": "Kommy_high_e05",
            "condition": "巨大化中",
            "effectTarget": "自身",
            "levels": {
              "1": 50.0,
              "2": 54.0,
              "3": 58.0,
              "4": 62.0,
              "5": 66.0,
              "6": 70.0,
              "7": 74.0,
              "8": 78.0,
              "9": 82.0,
              "10": 86.0,
              "11": 90.0,
              "12": 94.0
            }
          },
          {
            "effectId": "Kommy_high_e05",
            "valueKind": "巨大化",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectTarget": "自身"
          },
          {
            "effectId": "Kommy_high_e06",
            "valueKind": "巨大化",
            "valueClass": "持続時間",
            "effectType": "固有状態",
            "effectTarget": "自身",
            "fixedValue": 12.0
          }
        ],
        "skillId": "Kommy_high",
        "skillType": "高学年",
        "skillName": "エルフ族特製アニマル缶",
        "description": "特別なアニマル缶を食べ、一定時間、巨大化する。 着地時に衝撃波を起こして範囲物理ダメージを与え、HPを回復する。 巨大化の持続時間中、与ダメージ量と攻撃速度が増加する。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Kommy_passive_e01",
            "valueKind": "最大HP増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Kommy_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "最大HPが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Kommy_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          }
        ],
        "skillId": "Kommy_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵を枕で殴りつけて物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Kommy_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 300.0
          },
          {
            "effectId": "Kommy_enhanced_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Kommy_enhanced_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 1.5
          }
        ],
        "skillId": "Kommy_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で枕を強く殴りつけて敵に物理ダメージを与え、気絶を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 20.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "sari",
    "name": "サリー",
    "basic": {
      "rarity": 2.0,
      "personality": "純粋",
      "race": "幽霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Sari_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵の周囲",
            "levels": {
              "1": 180.0,
              "2": 200.0,
              "3": 220.0,
              "4": 240.0,
              "5": 260.0,
              "6": 280.0,
              "7": 300.0,
              "8": 320.0,
              "9": 340.0,
              "10": 360.0,
              "11": 380.0,
              "12": 400.0
            }
          }
        ],
        "skillId": "Sari_low",
        "skillType": "低学年",
        "skillName": "いたずらの笑み",
        "description": "指定範囲内で最も遠い敵の付近に素早く移動した後、鎌を振り回して物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Sari_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 400.0,
              "2": 440.0,
              "3": 480.0,
              "4": 520.0,
              "5": 560.0,
              "6": 600.0,
              "7": 640.0,
              "8": 680.0,
              "9": 720.0,
              "10": 760.0,
              "11": 800.0,
              "12": 840.0
            }
          },
          {
            "effectId": "Sari_high_e02",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Sari_high_e03",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Sari_high",
        "skillType": "高学年",
        "skillName": "超ポジティブトリック",
        "description": "敵に鎌で物理ダメージを与えて沈黙を付与する。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Sari_passive_e01",
            "valueKind": "会心増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Sari_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Sari_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 70.0
          }
        ],
        "skillId": "Sari_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "鎌を振り回して、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "sylla",
    "name": "シーラ",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "精霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Sylla_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "levels": {
              "1": 500.0,
              "2": 565.0,
              "3": 630.0,
              "4": 695.0,
              "5": 760.0,
              "6": 825.0,
              "7": 890.0,
              "8": 955.0,
              "9": 1020.0,
              "10": 1085.0,
              "11": 1150.0,
              "12": 1215.0,
              "13": 1280.0,
              "14": 1345.0,
              "15": 1410.0
            }
          },
          {
            "effectId": "Sylla_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "fixedValue": 5.0
          }
        ],
        "skillId": "Sylla_low",
        "skillType": "低学年",
        "skillName": "ラピッドアロー",
        "description": "矢を目に止まらない速さで5回発射し、指定範囲内で最も遠い敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Sylla_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "levels": {
              "1": 840.0,
              "2": 930.0,
              "3": 1020.0,
              "4": 1110.0,
              "5": 1200.0,
              "6": 1290.0,
              "7": 1380.0,
              "8": 1470.0,
              "9": 1560.0,
              "10": 1650.0,
              "11": 1740.0,
              "12": 1830.0,
              "13": 1920.0,
              "14": 2010.0,
              "15": 2100.0
            }
          }
        ],
        "skillId": "Sylla_high",
        "skillType": "高学年",
        "skillName": "ヘクトパスカルスイング！",
        "description": "風の精霊を飛ばして指定範囲内で最も遠い敵に物理ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Sylla_passive_e01",
            "valueKind": "基本攻撃ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 32.0,
              "3": 34.0,
              "4": 36.0,
              "5": 38.0,
              "6": 40.0,
              "7": 42.0,
              "8": 44.0,
              "9": 46.0,
              "10": 48.0,
              "11": 50.0,
              "12": 52.0,
              "13": 54.0,
              "14": 56.0,
              "15": 58.0
            }
          }
        ],
        "skillId": "Sylla_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃のダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Sylla_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "fixedValue": 150.0
          }
        ],
        "skillId": "Sylla_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "矢を発射し、指定範囲内で最も遠い敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "思い出の中の精霊たち",
      "levels": {
        "1": {
          "name": "友情の証",
          "stats": [],
          "effects": [
            {
              "skillId": "Sylla_aside_1",
              "effectId": "Sylla_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sylla_aside_1",
              "effectId": "Sylla_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sylla_aside_1",
              "effectId": "Sylla_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sylla_aside_1",
              "effectId": "Sylla_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "竜巻が吹く",
          "stats": [],
          "effects": [
            {
              "skillId": "Sylla_aside_2",
              "effectId": "Sylla_aside_2_e01",
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 40.0
            },
            {
              "skillId": "Sylla_aside_2",
              "effectId": "Sylla_aside_2_e02",
              "valueKind": "竜巻ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "普通攻撃命中時一定確率",
              "triggerValue": 75.0,
              "triggerSourceId": "普通攻撃",
              "condition": "普通攻撃命中時一定確率",
              "effectTarget": "敵",
              "targetSkill": "普通攻撃",
              "fixedValue": 120.0
            },
            {
              "skillId": "Sylla_aside_2",
              "effectId": "Sylla_aside_2_e03",
              "valueKind": "竜巻追加ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "竜巻ダメージ発生時",
              "triggerSourceId": "Sylla_aside_2_e02",
              "conditionType": "追加対象存在",
              "conditionValue": 1.0,
              "condition": "普通攻撃命中時かつ追加で敵がいる場合",
              "effectTarget": "竜巻ダメージを与えた敵を除く他の敵",
              "targetSkill": "普通攻撃",
              "fixedValue": 120.0
            }
          ],
          "description": "攻撃速度が増加する。\n普通攻撃命中時に一定確率で竜巻が発生し、ダメージを受けた敵に物理ダメージを与えて消える。\n周囲に敵がいる場合、竜巻が追加で1つ発生し、ダメージを受けた敵を除く他の敵に物理ダメージを与えて消える。"
        },
        "3": {
          "name": "精霊の守護者",
          "stats": [
            {
              "skillId": "Sylla_aside_3_global",
              "effectId": "Sylla_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3.0
            },
            {
              "skillId": "Sylla_aside_3_global",
              "effectId": "Sylla_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Sylla_aside_3_battle",
              "effectId": "Sylla_aside_3_battle_e01",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sylla_aside_3_battle",
              "effectId": "Sylla_aside_3_battle_e02",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            }
          ],
          "description": "味方全員の会心と会心ダメージを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "shaydi",
    "name": "シェイディ",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "幽霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 25.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Shaydi_low_e01",
            "valueKind": "最初の打撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "levels": {
              "1": 420.0,
              "2": 468.0,
              "3": 516.0,
              "4": 564.0,
              "5": 612.0,
              "6": 660.0,
              "7": 708.0,
              "8": 756.0,
              "9": 804.0,
              "10": 852.0,
              "11": 900.0,
              "12": 948.0
            }
          },
          {
            "effectId": "Shaydi_low_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "levels": {
              "1": 630.0,
              "2": 702.0,
              "3": 774.0,
              "4": 846.0,
              "5": 918.0,
              "6": 990.0,
              "7": 1062.0,
              "8": 1134.0,
              "9": 1206.0,
              "10": 1278.0,
              "11": 1350.0,
              "12": 1422.0
            }
          },
          {
            "effectId": "Shaydi_low_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "fixedValue": 13.0
          },
          {
            "effectId": "Shaydi_low_e04",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "levels": {
              "1": 15.0,
              "2": 16.5,
              "3": 18.0,
              "4": 19.5,
              "5": 21.0,
              "6": 22.5,
              "7": 24.0,
              "8": 25.5,
              "9": 27.0,
              "10": 28.5,
              "11": 30.0,
              "12": 31.5
            }
          }
        ],
        "skillId": "Shaydi_low",
        "skillType": "低学年",
        "skillName": "明かり消してごらん？",
        "description": "瞬間移動して射程距離内で最も後ろにいる敵に物理ダメージを13回与え、SPを減少させる。最初の斬撃はより高いダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Shaydi_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 701.4,
              "2": 771.54,
              "3": 841.68,
              "4": 911.82,
              "5": 981.96,
              "6": 1052.1,
              "7": 1122.24,
              "8": 1192.38,
              "9": 1262.52,
              "10": 1332.66,
              "11": 1402.8,
              "12": 1472.94
            }
          },
          {
            "effectId": "Shaydi_high_e02",
            "valueKind": "攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 6.0
          },
          {
            "effectId": "Shaydi_high_e03",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵"
          },
          {
            "effectId": "Shaydi_high_e04",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 6.0,
              "2": 6.5,
              "3": 7.0,
              "4": 7.5,
              "5": 8.0,
              "6": 8.5,
              "7": 9.0,
              "8": 9.5,
              "9": 10.0,
              "10": 10.5,
              "11": 11.0,
              "12": 11.5
            }
          }
        ],
        "skillId": "Shaydi_high",
        "skillType": "高学年",
        "skillName": "タイム・オブ・シェイディ",
        "description": "次元を移動しながらランダムな敵に物理ダメージを6回与え、沈黙を付与する。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Shaydi_passive_e01",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身",
            "levels": {
              "1": 6.0,
              "2": 7.0,
              "3": 8.0,
              "4": 9.0,
              "5": 10.0,
              "6": 11.0,
              "7": 12.0,
              "8": 13.0,
              "9": 14.0,
              "10": 15.0,
              "11": 16.0,
              "12": 17.0
            }
          }
        ],
        "skillId": "Shaydi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "直接ダメージを受けるとSPが回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Shaydi_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 175.0
          }
        ],
        "skillId": "Shaydi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "鎖鎌を振り回して、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "jade",
    "name": "ジェイド",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "竜族",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 25.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Jade_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 200.0,
              "2": 225.0,
              "3": 250.0,
              "4": 275.0,
              "5": 300.0,
              "6": 325.0,
              "7": 350.0,
              "8": 375.0,
              "9": 400.0,
              "10": 425.0,
              "11": 450.0,
              "12": 475.0
            }
          },
          {
            "effectId": "Jade_low_e02",
            "valueKind": "翡翠玉1～2スタック時ダメージ倍率",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "リソーススタック範囲",
            "conditionValue": "翡翠玉:1-2",
            "condition": "翡翠玉1～2スタック時",
            "effectTarget": "自身",
            "fixedValue": 1.2
          },
          {
            "effectId": "Jade_low_e03",
            "valueKind": "翡翠玉3スタック時ダメージ倍率",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "リソーススタック",
            "conditionValue": "翡翠玉:3",
            "condition": "翡翠玉3スタック時",
            "effectTarget": "自身",
            "fixedValue": 1.5
          }
        ],
        "skillId": "Jade_low",
        "skillType": "低学年",
        "skillName": "ゲルマニウム翡翠電気毛布",
        "description": "翡翠玉のスタック数が多いほど、範囲魔法の与ダメージが増加する。最大スタック状態で発動すると翡翠玉を全て失う。"
      },
      {
        "effects": [
          {
            "effectId": "Jade_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0
            }
          },
          {
            "effectId": "Jade_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 4.0
          },
          {
            "effectId": "Jade_high_e03",
            "valueKind": "翡翠玉獲得",
            "valueClass": "回数",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 3.0,
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3.0
          },
          {
            "effectId": "Jade_high_e04",
            "valueKind": "SP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 15.0
          }
        ],
        "skillId": "Jade_high",
        "skillType": "高学年",
        "skillName": "ゲルマニウム覚醒",
        "description": "地面を割って鉱物を噴出させ、敵に4回範囲魔法ダメージを与え、翡翠玉を3スタック獲得し、SPを回復する。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Jade_passive_e01",
            "valueKind": "魔法攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "リソース獲得時",
            "triggerSourceId": "翡翠玉",
            "condition": "翡翠玉3スタックで翡翠玉取得時",
            "effectTarget": "自身",
            "levels": {
              "1": 19.0,
              "2": 20.0,
              "3": 21.0,
              "4": 22.0,
              "5": 23.0,
              "6": 24.0,
              "7": 25.0,
              "8": 26.0,
              "9": 27.0,
              "10": 28.0,
              "11": 29.0,
              "12": 30.0
            }
          }
        ],
        "skillId": "Jade_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "翡翠玉が3スタックの時に強化攻撃で翡翠を摂取すると、魔法攻撃力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Jade_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Jade_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を唱えて敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Jade_enhanced_e01",
            "valueKind": "翡翠玉獲得",
            "valueClass": "回数",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 3.0,
            "effectTarget": "自身",
            "fixedValue": 1.0
          },
          {
            "effectId": "Jade_enhanced_e02",
            "valueKind": "翡翠玉最大スタック",
            "valueClass": "回数",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 3.0
          },
          {
            "effectId": "Jade_enhanced_e03",
            "processGroupId": "Jade_enhanced_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "リソース変化時",
            "triggerValue": "獲得時",
            "triggerSourceId": "翡翠玉",
            "condition": "翡翠玉獲得時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 30.0
          },
          {
            "effectId": "Jade_enhanced_e04",
            "processGroupId": "Jade_enhanced_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "リソース変化時",
            "triggerValue": "獲得時",
            "triggerSourceId": "翡翠玉",
            "condition": "翡翠玉獲得時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Jade_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で翡翠を摂取し、翡翠玉を1スタック獲得する。 翡翠玉の獲得時、自身に魔法のシールドを生成する。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "xion",
    "name": "シオン・ザ・DB",
    "basic": {
      "rarity": 3.0,
      "eldain": "不死者",
      "personality": "憂鬱",
      "race": "幽霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 50.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 105.0,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 5.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Xion_low_e01",
            "valueKind": "1回あたりの物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/最も遠い敵",
            "levels": {
              "1": 200.0,
              "2": 215.0,
              "3": 230.0,
              "4": 245.0,
              "5": 260.0,
              "6": 275.0,
              "7": 290.0,
              "8": 305.0,
              "9": 320.0,
              "10": 335.0,
              "11": 350.0,
              "12": 365.0,
              "13": 380.0,
              "14": 395.0,
              "15": 410.0
            }
          },
          {
            "effectId": "Xion_low_e02",
            "valueKind": "魔弾獲得",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6.0,
            "effectTarget": "自身",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Xion_low",
        "skillType": "低学年",
        "skillName": "魔・弾・の・射・手★",
        "description": "闇の力を集めて魔弾を2個獲得し、指定範囲内で最も遠い敵に物理ダメージを与える。攻撃時に魔弾を消費し、魔弾の数量に応じて攻撃回数が増加する。魔弾は最大6個まで獲得可能。"
      },
      {
        "effects": [
          {
            "effectId": "Xion_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲/最も遠い敵",
            "levels": {
              "1": 200.0,
              "2": 215.0,
              "3": 230.0,
              "4": 245.0,
              "5": 260.0,
              "6": 275.0,
              "7": 290.0,
              "8": 305.0,
              "9": 320.0,
              "10": 335.0,
              "11": 350.0,
              "12": 365.0,
              "13": 380.0,
              "14": 395.0,
              "15": 410.0
            }
          },
          {
            "effectId": "Xion_high_e02",
            "valueKind": "魔弾獲得",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6.0,
            "effectTarget": "自身",
            "fixedValue": 1.0
          }
        ],
        "skillId": "Xion_high",
        "skillType": "高学年",
        "skillName": "アポカリプス★ゼロ",
        "description": "指定範囲内で最も遠い敵に範囲物理ダメージを与え、魔弾を1個獲得する。魔弾は最大6個まで獲得可能。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Xion_passive_e01",
            "processGroupId": "Xion_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "物理攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "リソース変化時",
            "triggerValue": "獲得時",
            "triggerSourceId": "魔弾",
            "condition": "魔弾獲得時",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 23.0,
              "3": 26.0,
              "4": 29.0,
              "5": 32.0,
              "6": 35.0,
              "7": 38.0,
              "8": 41.0,
              "9": 44.0,
              "10": 47.0,
              "11": 50.0,
              "12": 53.0,
              "13": 56.0,
              "14": 59.0,
              "15": 62.0
            }
          },
          {
            "effectId": "Xion_passive_e02",
            "processGroupId": "Xion_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "物理攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "リソース変化時",
            "triggerValue": "獲得時",
            "triggerSourceId": "魔弾",
            "condition": "魔弾獲得時",
            "effectTarget": "自身",
            "fixedValue": 10.0
          },
          {
            "effectId": "Xion_passive_e03",
            "valueKind": "魔弾最大数",
            "valueClass": "固定値",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Xion_passive_e04",
            "valueKind": "魔弾所持時の物理ダメージ量増加(与ダメージ量増加)",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6.0,
            "conditionType": "リソース所持",
            "conditionValue": "魔弾",
            "condition": "魔弾所持時",
            "effectTarget": "自身",
            "fixedValue": 5.0
          }
        ],
        "skillId": "Xion_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "魔弾獲得時に一定時間、物理攻撃力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Xion_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/最も遠い敵",
            "fixedValue": 200.0
          }
        ],
        "skillId": "Xion_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "弾丸を発射し、指定範囲内で最も遠い敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Xion_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 350.0
          },
          {
            "effectId": "Xion_enhanced_e02",
            "valueKind": "目隠し",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Xion_enhanced_e03",
            "valueKind": "目隠し",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 6.0
          },
          {
            "effectId": "Xion_enhanced_e04",
            "valueKind": "魔弾獲得",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6.0,
            "effectTarget": "自身",
            "fixedValue": 1.0
          }
        ],
        "skillId": "Xion_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回攻撃するごとに敵に範囲物理ダメージと目隠しを付与し、魔弾を1個獲得する。魔弾は最大6個まで獲得可能。",
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "favoriteCard": {
      "name": "シオンの黒マント",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Xion_favorite_1_e01",
                "targetSkill": "普通攻撃_基本",
                "targetSkillName": "基本",
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 34.0,
                "effectTarget": "敵/最も遠い敵",
                "fixedValue": 200.0
              },
              {
                "effectId": "Xion_favorite_1_e02",
                "targetSkill": "普通攻撃_基本",
                "targetSkillName": "基本",
                "valueKind": "強化の弾丸物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 66.0,
                "effectTarget": "敵/最も遠い敵",
                "fixedValue": 444.0
              }
            ],
            "skillId": "Xion_favorite_1",
            "skillName": "愛用Lv1",
            "description": "弾丸を発射し、指定された射程距離内で最も離れている敵に物理ダメージを与える。\n一定確率で強化の弾丸を発射し、より高い物理ダメージを与える。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Xion_favorite_3_e01",
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Xion_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Xion_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Xion_favorite_3",
            "skillName": "愛用Lv3",
            "description": "シオンの物理攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "おしゃべりイード",
      "levels": {
        "1": {
          "name": "我、参上★",
          "stats": [],
          "effects": [
            {
              "skillId": "Xion_aside_1",
              "effectId": "Xion_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Xion_aside_1",
              "effectId": "Xion_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Xion_aside_1",
              "effectId": "Xion_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Xion_aside_1",
              "effectId": "Xion_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "絶対なる魔弾の力と言うべきだろうか？",
          "stats": [],
          "effects": [
            {
              "skillId": "Xion_aside_2",
              "effectId": "Xion_aside_2_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "fixedValue": 30.0
            },
            {
              "skillId": "Xion_aside_2",
              "effectId": "Xion_aside_2_e02",
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "targetSkill": "基本攻撃",
              "reference": "最大HP",
              "fixedValue": 3.0
            },
            {
              "skillId": "Xion_aside_2",
              "effectId": "Xion_aside_2_e03",
              "processGroupId": "Xion_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "スキル終了時",
              "triggerSourceId": "スキル",
              "condition": "低学年スキルまたは高学年スキル使用後",
              "fixedValue": 100.0
            },
            {
              "skillId": "Xion_aside_2",
              "effectId": "Xion_aside_2_e05",
              "processGroupId": "Xion_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "スキル終了時",
              "triggerSourceId": "スキル",
              "condition": "低学年スキルまたは高学年スキル使用後",
              "fixedValue": 6.0
            },
            {
              "skillId": "Xion_aside_2",
              "effectId": "Xion_aside_2_e06",
              "valueKind": "低学年スキルダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "targetSkill": "低学年スキル",
              "fixedValue": 100.0
            }
          ],
          "description": "最大HPが増加し、基本攻撃命中時、HPを回復する。低学年スキル、高学年スキル使用後、攻撃速度が増加する。\n低学年スキル使用中、敵が一体しかいない場合、ダメージが増加する。"
        },
        "3": {
          "name": "闇・の・救・世・主★",
          "stats": [
            {
              "skillId": "Xion_aside_3_global",
              "effectId": "Xion_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 4.0
            },
            {
              "skillId": "Xion_aside_3_global",
              "effectId": "Xion_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Xion_aside_3_battle",
              "effectId": "Xion_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 19.5
            },
            {
              "skillId": "Xion_aside_3_battle",
              "effectId": "Xion_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 8.8
            }
          ],
          "description": "後列の味方の敵への与ダメージ量を増加させ、後列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "sist",
    "name": "シスト",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "竜族",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 5.0,
      "critDmg": 5.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Sist_low_e01",
            "processGroupId": "Sist_low_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 15.0,
              "2": 17.0,
              "3": 19.0,
              "4": 21.0,
              "5": 23.0,
              "6": 25.0,
              "7": 27.0,
              "8": 29.0,
              "9": 31.0,
              "10": 33.0,
              "11": 35.0,
              "12": 37.0,
              "13": 39.0,
              "14": 41.0,
              "15": 43.0
            }
          },
          {
            "effectId": "Sist_low_e02",
            "processGroupId": "Sist_low_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 10.0
          },
          {
            "effectId": "Sist_low_e03",
            "processGroupId": "Sist_low_proc01",
            "processOrder": 3.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 15.0,
              "2": 17.0,
              "3": 19.0,
              "4": 21.0,
              "5": 23.0,
              "6": 25.0,
              "7": 27.0,
              "8": 29.0,
              "9": 31.0,
              "10": 33.0,
              "11": 35.0,
              "12": 37.0,
              "13": 39.0,
              "14": 41.0,
              "15": 43.0
            }
          },
          {
            "effectId": "Sist_low_e04",
            "processGroupId": "Sist_low_proc01",
            "processOrder": 4.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Sist_low",
        "skillType": "低学年",
        "skillName": "マウントガン",
        "description": "マウントガンを発射すると、自身の攻撃力と攻撃速度が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Sist_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/残りHP割合が最も低い敵",
            "levels": {
              "1": "600～1000",
              "2": "630～1150",
              "3": "660～1300",
              "4": "690～1450",
              "5": "720～1600",
              "6": "750～1750",
              "7": "780～1900",
              "8": "810～2050",
              "9": "840～2200",
              "10": "870～2350",
              "11": "900～2500",
              "12": "930～2650",
              "13": "960～2800",
              "14": "990～2950",
              "15": "1020～3100"
            }
          },
          {
            "effectId": "Sist_high_e02",
            "valueKind": "最大追加発動回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "自身",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Sist_high",
        "skillType": "高学年",
        "skillName": "弾丸のお届け物で～す",
        "description": "弾丸を発射し、残りHP割合が最も低い敵に物理ダメージを与える。敵を撃破すると、スキルを追加で使用する。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Sist_passive_e01",
            "valueKind": "クールタイム減少",
            "valueClass": "固定値",
            "effectType": "バフ",
            "triggerType": "普通攻撃命中時",
            "triggerSourceId": "普通攻撃",
            "condition": "基本攻撃命中時",
            "effectTarget": "自身",
            "fixedValue": "秒",
            "levels": {
              "1": 1.0,
              "2": 1.1,
              "3": 1.2,
              "4": 1.3,
              "5": 1.4,
              "6": 1.5,
              "7": 1.6,
              "8": 1.7,
              "9": 1.8,
              "10": 1.9,
              "11": 2.0,
              "12": 2.1,
              "13": 2.2,
              "14": 2.3,
              "15": 2.4
            }
          }
        ],
        "skillId": "Sist_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃が命中すると、高学年スキルのクールタイムが減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Sist_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 110.0
          }
        ],
        "skillId": "Sist_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵にガラクタを投げつけてダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "ブランドバック",
      "levels": {
        "1": {
          "name": "商売の天才シスト",
          "stats": [],
          "effects": [
            {
              "skillId": "Sist_aside_1",
              "effectId": "Sist_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sist_aside_1",
              "effectId": "Sist_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sist_aside_1",
              "effectId": "Sist_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sist_aside_1",
              "effectId": "Sist_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "友情をかけた勝負",
          "stats": [],
          "effects": [
            {
              "skillId": "Sist_aside_2",
              "effectId": "Sist_aside_2_e01",
              "processGroupId": "Sist_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "ランダムな味方の使徒",
              "valueClass": "対象数",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Sist_low_e01",
              "conditionType": "対象役割",
              "conditionValue": "アタッカー",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方",
              "targetSkill": "低学年スキル",
              "fixedValue": 2.0
            },
            {
              "skillId": "Sist_aside_2",
              "effectId": "Sist_aside_2_e02",
              "processGroupId": "Sist_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Sist_low_e01",
              "conditionType": "対象役割",
              "conditionValue": "アタッカー",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方",
              "targetSkill": "低学年スキル",
              "reference": "低学年スキルのレベルに依存"
            },
            {
              "skillId": "Sist_aside_2",
              "effectId": "Sist_aside_2_e03",
              "processGroupId": "Sist_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "攻撃力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Sist_low_e01",
              "conditionType": "対象役割",
              "conditionValue": "アタッカー",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方",
              "targetSkill": "低学年スキル",
              "fixedValue": 10.0
            },
            {
              "skillId": "Sist_aside_2",
              "effectId": "Sist_aside_2_e04",
              "processGroupId": "Sist_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Sist_low_e01",
              "conditionType": "対象役割",
              "conditionValue": "アタッカー",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方",
              "targetSkill": "低学年スキル",
              "reference": "低学年スキルのレベルに依存"
            },
            {
              "skillId": "Sist_aside_2",
              "effectId": "Sist_aside_2_e05",
              "valueKind": "乱数最大固定",
              "valueClass": "条件",
              "effectType": "スキル変更",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル"
            }
          ],
          "description": "低学年スキルのバフを獲得時、ランダムな味方アタッカー使徒の攻撃力と攻撃速度を増加させる。\nアタッカー使徒がいない場合は、ランダムな味方に適用される。\n高学年スキルは、常に最大物理ダメージ量を与える。"
        },
        "3": {
          "name": "味方ターゲット商品",
          "stats": [
            {
              "skillId": "Sist_aside_3_global",
              "effectId": "Sist_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Sist_aside_3_global",
              "effectId": "Sist_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Sist_aside_3_battle",
              "effectId": "Sist_aside_3_battle_e01",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            },
            {
              "skillId": "Sist_aside_3_battle",
              "effectId": "Sist_aside_3_battle_e02",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            }
          ],
          "description": "味方全員の会心と会心ダメージを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "shoupan",
    "name": "シュパン",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "妖精",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 44.0,
      "combatPowerCorrectionA": 95.0,
      "combatPowerCorrectionB": 0.41
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 1.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 1.0,
      "critDmg": 1.0,
      "critRes": 5.0,
      "critDmgRes": 5.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Shoupan_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "reference": "対象の最大HP",
            "fixedValue": 20.0
          },
          {
            "effectId": "Shoupan_low_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "reference": "自分の攻撃力",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0
            }
          },
          {
            "effectId": "Shoupan_low_e03",
            "valueKind": "回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Shoupan_low",
        "skillType": "低学年",
        "skillName": "無責任な配達人",
        "description": "素早く2往復して郵便を配る。 郵便物を落とすごとに、周囲の味方のHPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Shoupan_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 500.0,
              "2": 550.0,
              "3": 600.0,
              "4": 650.0,
              "5": 700.0,
              "6": 750.0,
              "7": 800.0,
              "8": 850.0,
              "9": 900.0,
              "10": 950.0,
              "11": 1000.0,
              "12": 1050.0
            }
          },
          {
            "effectId": "Shoupan_high_e02",
            "valueKind": "ノイズ",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Shoupan_high_e03",
            "valueKind": "ノイズ",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 10.0
          },
          {
            "effectId": "Shoupan_high_e04",
            "processGroupId": "Shoupan_high_proc01",
            "processOrder": 1.0,
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方",
            "levels": {
              "1": 20.0,
              "2": 21.0,
              "3": 22.0,
              "4": 23.0,
              "5": 24.0,
              "6": 25.0,
              "7": 26.0,
              "8": 27.0,
              "9": 28.0,
              "10": 29.0,
              "11": 30.0,
              "12": 31.0
            }
          },
          {
            "effectId": "Shoupan_high_e05",
            "processGroupId": "Shoupan_high_proc01",
            "processOrder": 2.0,
            "valueKind": "防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Shoupan_high",
        "skillType": "高学年",
        "skillName": "シュパン配送",
        "description": "前方へ疾走しながら郵便物をばらまき、味方の防御力を増加させる。 衝突した敵には範囲魔法ダメージを与え、ノイズを付与する。",
        "cooldownSeconds": 36.0
      },
      {
        "effects": [
          {
            "effectId": "Shoupan_passive_e01",
            "valueKind": "被スキルダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0
            }
          },
          {
            "effectId": "Shoupan_passive_e02",
            "valueKind": "移動速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 50.0
          }
        ],
        "skillId": "Shoupan_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "敵のスキル攻撃の被ダメージ量が減少する。 強化攻撃と低学年スキルの移動速度が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Shoupan_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 55.0
          }
        ],
        "skillId": "Shoupan_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "郵便物を飛ばして魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Shoupan_enhanced_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "対象の最大HP",
            "fixedValue": 15.0
          }
        ],
        "skillId": "Shoupan_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "2回目の攻撃の代わりに、HP割合が最も低い味方を回復させ、元の位置に戻る。",
        "triggerType": "n回ごと",
        "triggerValue": 2.0
      }
    ],
    "favoriteCard": {
      "name": "シュパンの魔法リュック",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Shoupan_favorite_1_e01",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "triggerType": "n回ごと",
                "triggerValue": 2.0,
                "effectTarget": "残りHP割合が最も低い味方",
                "reference": "対象の最大HP",
                "fixedValue": 15.0
              },
              {
                "effectId": "Shoupan_favorite_1_e02",
                "processGroupId": "Shoupan_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "シールド",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2.0,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "reference": "最大HP",
                "fixedValue": 30.0
              },
              {
                "effectId": "Shoupan_favorite_1_e03",
                "processGroupId": "Shoupan_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "シールド",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2.0,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "fixedValue": 6.0
              },
              {
                "effectId": "Shoupan_favorite_1_e04",
                "processGroupId": "Shoupan_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2.0,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "fixedValue": 36.0
              },
              {
                "effectId": "Shoupan_favorite_1_e05",
                "processGroupId": "Shoupan_favorite_1_proc01",
                "processOrder": 4.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "防御力増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2.0,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "fixedValue": 6.0
              }
            ],
            "skillId": "Shoupan_favorite_1",
            "skillName": "愛用Lv1",
            "description": "2回目の攻撃の代わりに、残りHP割合が最も低い味方を回復させ、元の位置に戻る。\n回復させた味方にシールドを付与し、防御力を増加させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Shoupan_favorite_3_e01",
                "targetSkill": "高学年",
                "targetSkillName": "シュパン配送",
                "valueKind": "クールタイム減少",
                "valueClass": "クールタイム",
                "effectType": "クールタイム",
                "effectTarget": "自身",
                "fixedValue": 5.0
              }
            ],
            "skillId": "Shoupan_favorite_3",
            "skillName": "愛用Lv3",
            "description": "高学年スキルのクールタイムが減少。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "jubee",
    "name": "ジュビー",
    "basic": {
      "rarity": 2.0,
      "personality": "活発",
      "race": "精霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Jubee_low_e01",
            "valueKind": "召喚獣物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "基本攻撃",
            "effectTarget": "HP割合が最も低い敵",
            "levels": {
              "1": 40.0,
              "2": 43.0,
              "3": 46.0,
              "4": 49.0,
              "5": 52.0,
              "6": 55.0,
              "7": 58.0,
              "8": 61.0,
              "9": 64.0,
              "10": 67.0,
              "11": 70.0,
              "12": 73.0
            }
          },
          {
            "effectId": "Jubee_low_e02",
            "valueKind": "召喚獣スキル物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "HP割合が最も低い敵",
            "levels": {
              "1": 90.0,
              "2": 100.0,
              "3": 110.0,
              "4": 120.0,
              "5": 130.0,
              "6": 140.0,
              "7": 150.0,
              "8": 160.0,
              "9": 170.0,
              "10": 180.0,
              "11": 190.0,
              "12": 200.0
            }
          },
          {
            "effectId": "Jubee_low_e03",
            "valueKind": "最大召喚数",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "友達のミツバチ",
            "levels": {
              "1": 2.0,
              "2": 2.0,
              "3": 2.0,
              "4": 2.0,
              "5": 2.0,
              "6": 2.0,
              "7": 3.0,
              "8": 3.0,
              "9": 3.0,
              "10": 3.0,
              "11": 3.0,
              "12": 3.0
            }
          }
        ],
        "skillId": "Jubee_low",
        "skillType": "低学年",
        "skillName": "友達が来たビー",
        "description": "友達のミツバチを呼び寄せる。 友達のミツバチはHP割合が最も低い敵を針で攻撃して物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Jubee_high_e01",
            "processGroupId": "Jubee_high_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身と召喚獣",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Jubee_high_e02",
            "processGroupId": "Jubee_high_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身と召喚獣",
            "levels": {
              "1": 20.0,
              "2": 21.0,
              "3": 22.0,
              "4": 23.0,
              "5": 24.0,
              "6": 25.0,
              "7": 26.0,
              "8": 27.0,
              "9": 28.0,
              "10": 29.0,
              "11": 30.0,
              "12": 31.0
            }
          },
          {
            "effectId": "Jubee_high_e03",
            "processGroupId": "Jubee_high_proc01",
            "processOrder": 3.0,
            "valueKind": "バフ",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身と召喚獣",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Jubee_high",
        "skillType": "高学年",
        "skillName": "ハッピーハッビー",
        "description": "自身と友達のミツバチの攻撃力と攻撃速度を増加させる。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Jubee_passive_e01",
            "valueKind": "召喚獣防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "召喚獣",
            "levels": {
              "1": 16.0,
              "2": 18.0,
              "3": 20.0,
              "4": 22.0,
              "5": 24.0,
              "6": 26.0,
              "7": 28.0,
              "8": 30.0,
              "9": 32.0,
              "10": 34.0,
              "11": 36.0,
              "12": 38.0
            }
          }
        ],
        "skillId": "Jubee_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "召喚獣の防御力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Jubee_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 120.0
          }
        ],
        "skillId": "Jubee_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "針を飛ばし、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "silphir",
    "name": "シルフィール",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "竜族",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 50.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Silphir_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 140.0,
              "2": 154.0,
              "3": 168.0,
              "4": 182.0,
              "5": 196.0,
              "6": 210.0,
              "7": 224.0,
              "8": 238.0,
              "9": 252.0,
              "10": 266.0,
              "11": 280.0,
              "12": 294.0
            }
          },
          {
            "effectId": "Silphir_low_e02",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 15.0,
              "2": 16.5,
              "3": 18.0,
              "4": 19.5,
              "5": 21.0,
              "6": 22.5,
              "7": 24.0,
              "8": 25.5,
              "9": 27.0,
              "10": 28.5,
              "11": 30.0,
              "12": 31.5
            }
          }
        ],
        "skillId": "Silphir_low",
        "skillType": "低学年",
        "skillName": "青空の支配者",
        "description": "敵に範囲物理ダメージを与え、SPを減少させる。"
      },
      {
        "effects": [
          {
            "effectId": "Silphir_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 350.0,
              "2": 385.0,
              "3": 420.0,
              "4": 455.0,
              "5": 490.0,
              "6": 525.0,
              "7": 560.0,
              "8": 595.0,
              "9": 630.0,
              "10": 665.0,
              "11": 700.0,
              "12": 735.0
            }
          },
          {
            "effectId": "Silphir_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Silphir_high",
        "skillType": "高学年",
        "skillName": "シルフィールZアタック",
        "description": "敵に短剣を8本投げつける。",
        "cooldownSeconds": 14.0
      },
      {
        "effects": [
          {
            "effectId": "Silphir_passive_e01",
            "valueKind": "基本攻撃ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 32.0,
              "3": 34.0,
              "4": 36.0,
              "5": 38.0,
              "6": 40.0,
              "7": 42.0,
              "8": 44.0,
              "9": 46.0,
              "10": 48.0,
              "11": 50.0,
              "12": 52.0
            }
          },
          {
            "effectId": "Silphir_passive_e02",
            "valueKind": "強化攻撃確率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0
            }
          }
        ],
        "skillId": "Silphir_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃のダメージ量と強化攻撃確率が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Silphir_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Silphir_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "短剣を投げつけ、敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Silphir_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 96.0
          },
          {
            "effectId": "Silphir_enhanced_e02",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 64.0
          },
          {
            "effectId": "Silphir_enhanced_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Silphir_enhanced_e04",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Silphir_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で短剣を3回投げ、敵に物理ダメージを与える。 最後の一撃はより大きなダメージを与え、SPを減少させる。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "snorky",
    "name": "スノキー",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "魔女",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.34
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Snorky_low_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "味方/前列",
            "reference": "最大HP",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0,
              "13": 48.0,
              "14": 50.0,
              "15": 52.0
            }
          },
          {
            "effectId": "Snorky_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "味方/前列",
            "fixedValue": 6.0
          },
          {
            "effectId": "Snorky_low_e03",
            "processGroupId": "Snorky_low_proc01",
            "processOrder": 1.0,
            "valueKind": "物理防御力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "triggerType": "シールド終了時",
            "triggerSourceId": "Snorky_low_e01",
            "condition": "豆乳シールド破壊時",
            "effectTarget": "敵/周囲",
            "fixedValue": 50.0
          },
          {
            "effectId": "Snorky_low_e04",
            "processGroupId": "Snorky_low_proc01",
            "processOrder": 2.0,
            "valueKind": "物理防御力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "シールド終了時",
            "triggerSourceId": "Snorky_low_e01",
            "condition": "豆乳シールド破壊時",
            "effectTarget": "敵/周囲",
            "fixedValue": 5.0
          },
          {
            "effectId": "Snorky_low_e05",
            "valueKind": "持続HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "攻撃力",
            "levels": {
              "1": 180.0,
              "2": 200.0,
              "3": 220.0,
              "4": 240.0,
              "5": 260.0,
              "6": 280.0,
              "7": 300.0,
              "8": 320.0,
              "9": 340.0,
              "10": 360.0,
              "11": 380.0,
              "12": 400.0,
              "13": 420.0,
              "14": 440.0,
              "15": 460.0
            }
          },
          {
            "effectId": "Snorky_low_e06",
            "valueKind": "持続HP回復",
            "valueClass": "周期",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 1.0
          },
          {
            "effectId": "Snorky_low_e07",
            "valueKind": "持続HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Snorky_low",
        "skillType": "低学年",
        "skillName": "違法豆乳",
        "description": "所持している闇豆乳を飲み、前列の味方にシールドを付与する。シールドが破壊されるか、持続時間が終わると、周囲の敵の物理防御力を減少させる。自身と近接する敵が3体以上の場合、1秒ごとに自身のHPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Snorky_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/周囲",
            "levels": {
              "1": 450.0,
              "2": 495.0,
              "3": 540.0,
              "4": 585.0,
              "5": 630.0,
              "6": 675.0,
              "7": 720.0,
              "8": 765.0,
              "9": 810.0,
              "10": 855.0,
              "11": 900.0,
              "12": 945.0,
              "13": 990.0,
              "14": 1035.0,
              "15": 1080.0
            }
          },
          {
            "effectId": "Snorky_high_e02",
            "valueKind": "強化物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/周囲",
            "levels": {
              "1": 900.0,
              "2": 990.0,
              "3": 1080.0,
              "4": 1170.0,
              "5": 1260.0,
              "6": 1350.0,
              "7": 1440.0,
              "8": 1530.0,
              "9": 1620.0,
              "10": 1710.0,
              "11": 1800.0,
              "12": 1890.0,
              "13": 1980.0,
              "14": 2070.0,
              "15": 2160.0
            }
          },
          {
            "effectId": "Snorky_high_e03",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/周囲"
          }
        ],
        "skillId": "Snorky_high",
        "skillType": "高学年",
        "skillName": "エリア占拠",
        "description": "高く跳び上がって地面を踏みつけ、自身を中心とする周囲の敵に範囲物理ダメージを与え、ノックバックさせる。自身と近接する敵が3体以上の場合、物理ダメージとノックバック距離が増加する。",
        "cooldownSeconds": 28.0
      },
      {
        "effects": [
          {
            "effectId": "Snorky_passive_e01",
            "processGroupId": "Snorky_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 28.0,
              "3": 32.0,
              "4": 36.0,
              "5": 40.0,
              "6": 44.0,
              "7": 48.0,
              "8": 52.0,
              "9": 56.0,
              "10": 60.0,
              "11": 64.0,
              "12": 68.0,
              "13": 72.0,
              "14": 76.0,
              "15": 80.0
            }
          },
          {
            "effectId": "Snorky_passive_e02",
            "processGroupId": "Snorky_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 3.0
          },
          {
            "effectId": "Snorky_passive_e03",
            "processGroupId": "Snorky_passive_proc01",
            "processOrder": 3.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          },
          {
            "effectId": "Snorky_passive_e04",
            "processGroupId": "Snorky_passive_proc01",
            "processOrder": 4.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Snorky_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃時、自身のダメージ量が増加し、被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Snorky_basic_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 225.0
          },
          {
            "effectId": "Snorky_basic_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Snorky_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵を素早く蹴り、物理ダメージを3回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Snorky_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 350.0
          },
          {
            "effectId": "Snorky_enhanced_e02",
            "valueKind": "連続発動",
            "valueClass": "条件",
            "effectType": "攻撃",
            "effectTarget": "自身"
          }
        ],
        "skillId": "Snorky_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "普通攻撃を3回行うごとに、味方陣営から最も近い敵に向かって前方へ飛び蹴りを放ち、範囲物理ダメージを与える。強化攻撃は一定確率でもう一度発動し、連続で発動するたびに発動確率が減少する。",
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "favoriteCard": {
      "name": "スノキーのフェドーラ",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Snorky_favorite_1_e01",
                "processGroupId": "Snorky_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "n回ごと",
                "triggerValue": 3.0,
                "effectTarget": "敵/範囲",
                "fixedValue": 700.0
              },
              {
                "effectId": "Snorky_favorite_1_e02",
                "processGroupId": "Snorky_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "気絶",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3.0,
                "effectTarget": "敵/範囲"
              },
              {
                "effectId": "Snorky_favorite_1_e03",
                "processGroupId": "Snorky_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "気絶確率",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3.0,
                "effectTarget": "敵/範囲",
                "fixedValue": 50.0
              },
              {
                "effectId": "Snorky_favorite_1_e04",
                "processGroupId": "Snorky_favorite_1_proc01",
                "processOrder": 4.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "気絶",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3.0,
                "effectTarget": "敵/範囲",
                "fixedValue": 2.0
              }
            ],
            "skillId": "Snorky_favorite_1",
            "skillName": "愛用Lv1",
            "description": "普通攻撃を3回行うごとに、味方陣営から最も近い敵に向かって前方へ飛び蹴りを放ち、範囲物理ダメージを与え、一定確率で気絶を付与する。\n強化攻撃は一定確率でもう一度発動し、連続で発動するたびに発動確率が減少する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Snorky_favorite_3_e01",
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Snorky_favorite_3_e02",
                "valueKind": "物理防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Snorky_favorite_3_e03",
                "valueKind": "魔法防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Snorky_favorite_3",
            "skillName": "愛用Lv3",
            "description": "スノキーの物理攻撃力、物理防御力、魔法防御力が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "ビッグボススノキー",
      "levels": {
        "1": {
          "name": "夢はビッグボス",
          "stats": [],
          "effects": [
            {
              "skillId": "Snorky_aside_1",
              "effectId": "Snorky_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Snorky_aside_1",
              "effectId": "Snorky_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Snorky_aside_1",
              "effectId": "Snorky_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Snorky_aside_1",
              "effectId": "Snorky_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Snorky_aside_1",
              "effectId": "Snorky_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "義理の代名詞",
          "stats": [],
          "effects": [
            {
              "skillId": "Snorky_aside_2",
              "effectId": "Snorky_aside_2_e01",
              "processGroupId": "Snorky_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "シールド",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "ウェーブ開始時",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "reference": "最大HP",
              "fixedValue": 24.0
            },
            {
              "skillId": "Snorky_aside_2",
              "effectId": "Snorky_aside_2_e02",
              "processGroupId": "Snorky_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "シールド",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "ウェーブ開始時",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "fixedValue": 12.0
            },
            {
              "skillId": "Snorky_aside_2",
              "effectId": "Snorky_aside_2_e03",
              "processGroupId": "Snorky_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "ウェーブ開始時",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "fixedValue": 32.0
            },
            {
              "skillId": "Snorky_aside_2",
              "effectId": "Snorky_aside_2_e04",
              "processGroupId": "Snorky_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "ダメージ量増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "ウェーブ開始時",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "fixedValue": 12.0
            },
            {
              "skillId": "Snorky_aside_2",
              "effectId": "Snorky_aside_2_e05",
              "processGroupId": "Snorky_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃時",
              "effectTarget": "味方/周囲",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 24.0
            },
            {
              "skillId": "Snorky_aside_2",
              "effectId": "Snorky_aside_2_e06",
              "processGroupId": "Snorky_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "被ダメージ量減少",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃時",
              "effectTarget": "味方/周囲",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 3.0
            }
          ],
          "description": "ウェーブ開始時に前列の味方にシールドを付与し、与えるダメージ量を増加させる。\n強化攻撃時、周囲の味方の被ダメージ量を減少させる。"
        },
        "3": {
          "name": "拳の味を見せてやる",
          "stats": [
            {
              "skillId": "Snorky_aside_3_global",
              "effectId": "Snorky_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Snorky_aside_3_global",
              "effectId": "Snorky_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Snorky_aside_3_battle",
              "effectId": "Snorky_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 7.5
            }
          ],
          "description": "味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "speaki",
    "name": "スピッキー",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "幽霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 5.0,
      "critDmg": 5.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Speaki_low_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内の敵3体",
            "levels": {
              "1": 297.0,
              "2": 331.65,
              "3": 366.3,
              "4": 400.95,
              "5": 435.6,
              "6": 470.25,
              "7": 504.9,
              "8": 539.55,
              "9": 574.2,
              "10": 608.85,
              "11": 643.5,
              "12": 678.15
            }
          },
          {
            "effectId": "Speaki_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内の敵3体",
            "fixedValue": 3.0
          },
          {
            "effectId": "Speaki_low_e03",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内の敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Speaki_low",
        "skillType": "低学年",
        "skillName": "パンプキンマジック",
        "description": "かぼちゃを育てる呪文を唱え、指定範囲内の敵3体に3回魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Speaki_high_e01",
            "processGroupId": "Speaki_high_proc01",
            "processOrder": 1.0,
            "valueKind": "会心ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年時",
            "effectTarget": "自身",
            "levels": {
              "1": 18.0,
              "2": 19.0,
              "3": 20.0,
              "4": 21.0,
              "5": 22.0,
              "6": 23.0,
              "7": 24.0,
              "8": 25.0,
              "9": 26.0,
              "10": 27.0,
              "11": 28.0,
              "12": 29.0
            }
          },
          {
            "effectId": "Speaki_high_e02",
            "processGroupId": "Speaki_high_proc01",
            "processOrder": 2.0,
            "valueKind": "会心ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年時",
            "effectTarget": "自身",
            "fixedValue": 12.0
          },
          {
            "effectId": "Speaki_high_e03",
            "processGroupId": "Speaki_high_proc01",
            "processOrder": 3.0,
            "valueKind": "会心ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年時に攻撃力が最も高い味方",
            "effectTarget": "攻撃力が最も高い味方",
            "levels": {
              "1": 18.0,
              "2": 19.0,
              "3": 20.0,
              "4": 21.0,
              "5": 22.0,
              "6": 23.0,
              "7": 24.0,
              "8": 25.0,
              "9": 26.0,
              "10": 27.0,
              "11": 28.0,
              "12": 29.0
            }
          },
          {
            "effectId": "Speaki_high_e04",
            "processGroupId": "Speaki_high_proc01",
            "processOrder": 4.0,
            "valueKind": "会心ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年時に攻撃力が最も高い味方",
            "effectTarget": "攻撃力が最も高い味方",
            "fixedValue": 12.0
          }
        ],
        "skillId": "Speaki_high",
        "skillType": "高学年",
        "skillName": "お菓子くれなきゃいたずらしちゃうぞ～☆",
        "description": "自身と攻撃力が最も高い味方の会心ダメージ量を増加させる。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Speaki_passive_e01",
            "valueKind": "会心率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0
            }
          }
        ],
        "skillId": "Speaki_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心率が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Speaki_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Speaki_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "かぼちゃを発射し、敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "selene",
    "name": "セリーネ",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "幽霊",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 150.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 2.0,
      "critDmg": 2.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Selene_low_e01",
            "valueKind": "1回ごとの魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0,
              "13": 66.0,
              "14": 69.0,
              "15": 72.0
            }
          },
          {
            "effectId": "Selene_low_e02",
            "valueKind": "ダメージ間隔",
            "valueClass": "周期",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 0.3
          },
          {
            "effectId": "Selene_low_e03",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Selene_low_e04",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 2.5
          }
        ],
        "skillId": "Selene_low",
        "skillType": "低学年",
        "skillName": "これが愛よ",
        "description": "遠い敵へハートを飛ばし、通過/爆発で範囲魔法ダメージと気絶を与える。"
      },
      {
        "effects": [
          {
            "effectId": "Selene_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/残りHP割合最低",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0,
              "13": 1320.0,
              "14": 1380.0,
              "15": 1440.0
            }
          },
          {
            "effectId": "Selene_high_e02",
            "processGroupId": "Selene_high_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "敵撃破時",
            "condition": "敵撃破時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 36.0,
              "2": 38.0,
              "3": 40.0,
              "4": 42.0,
              "5": 44.0,
              "6": 46.0,
              "7": 48.0,
              "8": 50.0,
              "9": 52.0,
              "10": 54.0,
              "11": 56.0,
              "12": 58.0,
              "13": 60.0,
              "14": 62.0,
              "15": 64.0
            }
          },
          {
            "effectId": "Selene_high_e03",
            "processGroupId": "Selene_high_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "敵撃破時",
            "condition": "敵撃破時",
            "effectTarget": "自身",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Selene_high",
        "skillType": "高学年",
        "skillName": "ピンクダスト",
        "description": "残りHP割合が最も低い敵に魔法ダメージを与え、撃破時に自身へシールドを生成する。",
        "cooldownSeconds": 28.0
      },
      {
        "effects": [
          {
            "effectId": "Selene_passive_e01",
            "valueKind": "会心抵抗増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0,
              "13": 44.0,
              "14": 46.0,
              "15": 48.0
            }
          },
          {
            "effectId": "Selene_passive_e02",
            "valueKind": "挑発",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "effectTarget": "自身"
          }
        ],
        "skillId": "Selene_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心抵抗が増加し、挑発に免疫を持つ。"
      },
      {
        "effects": [
          {
            "effectId": "Selene_basic_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          },
          {
            "effectId": "Selene_basic_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Selene_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "袖を振るい、敵に魔法ダメージを2回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Selene_enhanced_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 10.0
          },
          {
            "effectId": "Selene_enhanced_e02",
            "valueKind": "挑発",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Selene_enhanced_e03",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Selene_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃の代わりに自身を回復し、敵を挑発する。",
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "favoriteCard": {
      "name": "セリーネの夜幻影",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Selene_favorite_1_e01",
                "targetSkill": "高学年",
                "targetSkillName": "チャンネルNo.5",
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲/残りHP割合最低",
                "levels": {
                  "1": 900.0,
                  "2": 990.0,
                  "3": 1080.0,
                  "4": 1170.0,
                  "5": 1260.0,
                  "6": 1350.0,
                  "7": 1440.0,
                  "8": 1530.0,
                  "9": 1620.0,
                  "10": 1710.0,
                  "11": 1800.0,
                  "12": 1890.0,
                  "13": 1980.0,
                  "14": 2070.0,
                  "15": 2160.0
                }
              },
              {
                "effectId": "Selene_favorite_1_e02",
                "processGroupId": "Selene_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "高学年",
                "targetSkillName": "チャンネルNo.5",
                "valueKind": "シールド",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "高学年スキル効果発生時",
                "triggerSourceId": "Selene_high_pose_end",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "reference": "最大HP",
                "levels": {
                  "1": 30.0,
                  "2": 33.0,
                  "3": 36.0,
                  "4": 39.0,
                  "5": 42.0,
                  "6": 45.0,
                  "7": 48.0,
                  "8": 51.0,
                  "9": 54.0,
                  "10": 57.0,
                  "11": 60.0,
                  "12": 63.0,
                  "13": 66.0,
                  "14": 69.0,
                  "15": 72.0
                }
              },
              {
                "effectId": "Selene_favorite_1_e03",
                "processGroupId": "Selene_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "高学年",
                "targetSkillName": "チャンネルNo.5",
                "valueKind": "シールド",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "高学年スキル効果発生時",
                "triggerSourceId": "Selene_high_pose_end",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "fixedValue": 8.0
              },
              {
                "effectId": "Selene_favorite_1_e04",
                "processGroupId": "Selene_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "高学年",
                "targetSkillName": "チャンネルNo.5",
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "高学年スキル効果発生時",
                "triggerSourceId": "Selene_high_pose_end",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "fixedValue": 30.0
              },
              {
                "effectId": "Selene_favorite_1_e05",
                "processGroupId": "Selene_favorite_1_proc01",
                "processOrder": 4.0,
                "targetSkill": "高学年",
                "targetSkillName": "チャンネルNo.5",
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "高学年スキル効果発生時",
                "triggerSourceId": "Selene_high_pose_end",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "fixedValue": 8.0
              }
            ],
            "skillId": "Selene_favorite_1",
            "skillName": "愛用Lv1",
            "description": "ポーズを取った後、残りHP割合が最も低い敵に範囲魔法ダメージを与える。\nその後、自身にシールドを生成し、被ダメージ量が減少する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Selene_favorite_3_e01",
                "targetSkill": "高学年",
                "valueKind": "クールタイム減少",
                "valueClass": "固定値",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 10.0
              }
            ],
            "skillId": "Selene_favorite_3",
            "skillName": "愛用Lv3",
            "description": "セリーネの高学年スキルのクールタイムが減少する。"
          }
        ]
      }
    },
    "aside": {
      "name": "セレブ・セリーネ",
      "levels": {
        "1": {
          "name": "悪戯好きなセリーネ",
          "stats": [],
          "effects": [
            {
              "skillId": "Selene_aside_1",
              "effectId": "Selene_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 22.5
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "煽り専門ElTuber",
          "stats": [],
          "effects": [
            {
              "skillId": "Selene_aside_2",
              "effectId": "Selene_aside_2_e01",
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Selene_aside_2",
              "effectId": "Selene_aside_2_e02",
              "valueKind": "攻撃速度減少",
              "valueClass": "倍率",
              "effectType": "デバフ",
              "effectTarget": "敵/挑発対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 33.0
            },
            {
              "skillId": "Selene_aside_2",
              "effectId": "Selene_aside_2_e03",
              "valueKind": "攻撃速度減少",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectTarget": "敵/挑発対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 4.0
            },
            {
              "skillId": "Selene_aside_2",
              "effectId": "Selene_aside_2_e04",
              "valueKind": "強化攻撃HP回復倍率",
              "valueClass": "倍率",
              "effectType": "回復",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 2.0
            }
          ],
          "description": "直接ダメージを受けるとSPが回復する。\n強化攻撃で挑発した敵の攻撃速度を減少させる。\n強化攻撃のHP回復割合が2倍になる。"
        },
        "3": {
          "name": "寄付チャレンジ",
          "stats": [
            {
              "skillId": "Selene_aside_3_global",
              "effectId": "Selene_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 3.0
            },
            {
              "skillId": "Selene_aside_3_global",
              "effectId": "Selene_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Selene_aside_3_battle",
              "effectId": "Selene_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 9.7
            }
          ],
          "description": "前列の味方の被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "daya",
    "name": "ダーヤ",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "竜族",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Daya_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵3名",
            "levels": {
              "1": 200.0,
              "2": 225.0,
              "3": 250.0,
              "4": 275.0,
              "5": 300.0,
              "6": 325.0,
              "7": 350.0,
              "8": 375.0,
              "9": 400.0,
              "10": 425.0,
              "11": 450.0,
              "12": 475.0,
              "13": 500.0,
              "14": 525.0,
              "15": 550.0
            }
          },
          {
            "effectId": "Daya_low_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵3名"
          },
          {
            "effectId": "Daya_low_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵3名",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Daya_low",
        "skillType": "低学年",
        "skillName": "ダイヤモンドピアス",
        "description": "尖ったダイヤを突き出し、敵3名に魔法ダメージを与え、苦痛を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Daya_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 500.0,
              "2": 550.0,
              "3": 600.0,
              "4": 650.0,
              "5": 700.0,
              "6": 750.0,
              "7": 800.0,
              "8": 850.0,
              "9": 900.0,
              "10": 950.0,
              "11": 1000.0,
              "12": 1050.0,
              "13": 1100.0,
              "14": 1150.0,
              "15": 1200.0
            }
          }
        ],
        "skillId": "Daya_high",
        "skillType": "高学年",
        "skillName": "ダイヤブレ…へくちゅ！",
        "description": "くしゃみで敵に範囲魔法ダメージを与える。",
        "cooldownSeconds": 40.0
      },
      {
        "effects": [
          {
            "effectId": "Daya_passive_e01",
            "valueKind": "スキルダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "味方/後列",
            "levels": {
              "1": 12.0,
              "2": 14.0,
              "3": 16.0,
              "4": 18.0,
              "5": 20.0,
              "6": 22.0,
              "7": 24.0,
              "8": 26.0,
              "9": 28.0,
              "10": 30.0,
              "11": 32.0,
              "12": 34.0,
              "13": 36.0,
              "14": 38.0,
              "15": 40.0
            }
          }
        ],
        "skillId": "Daya_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "味方の後列使徒のスキルダメージ量を増加させる。"
      },
      {
        "effects": [
          {
            "effectId": "Daya_basic_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 72.0
          },
          {
            "effectId": "Daya_basic_e02",
            "valueKind": "最後の一撃魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 48.0
          }
        ],
        "skillId": "Daya_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "ダイヤを3個飛ばして敵に魔法ダメージを与える。最後の一撃はより高いダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Daya_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 240.0
          },
          {
            "effectId": "Daya_enhanced_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Daya_enhanced_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Daya_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で大きなダイヤを飛ばして敵に魔法ダメージを与え、苦痛を付与する。",
        "triggerType": "一定確率"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "ダイヤモンドの指輪",
      "levels": {
        "1": {
          "name": "ダイヤの輝き",
          "stats": [],
          "effects": [
            {
              "skillId": "Daya_aside_1",
              "effectId": "Daya_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Daya_aside_1",
              "effectId": "Daya_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Daya_aside_1",
              "effectId": "Daya_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Daya_aside_1",
              "effectId": "Daya_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "ダイヤ……へくちゅ！",
          "stats": [],
          "effects": [
            {
              "skillId": "Daya_aside_2",
              "effectId": "Daya_aside_2_e01",
              "processGroupId": "Daya_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 100.0
            },
            {
              "skillId": "Daya_aside_2",
              "effectId": "Daya_aside_2_e02",
              "processGroupId": "Daya_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "最大連続使用回数",
              "valueClass": "回数",
              "effectType": "使用制限",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 2.0
            },
            {
              "skillId": "Daya_aside_2",
              "effectId": "Daya_aside_2_e03",
              "valueKind": "クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル"
            },
            {
              "skillId": "Daya_aside_2",
              "effectId": "Daya_aside_2_e04",
              "processGroupId": "Daya_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "気絶",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "triggerType": "高学年スキル命中時",
              "triggerSourceId": "高学年スキル",
              "condition": "高学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "高学年スキル"
            },
            {
              "skillId": "Daya_aside_2",
              "effectId": "Daya_aside_2_e05",
              "processGroupId": "Daya_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "気絶",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "高学年スキル命中時",
              "triggerSourceId": "高学年スキル",
              "condition": "高学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "高学年スキル"
            }
          ],
          "description": "低学年スキルが命中すると、SPを100%回復する。（最大連続使用回数：2回）\n高学年スキルのクールタイムが減少し、気絶効果が追加される。"
        },
        "3": {
          "name": "指輪遠征隊",
          "stats": [
            {
              "skillId": "Daya_aside_3_global",
              "effectId": "Daya_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Daya_aside_3_global",
              "effectId": "Daya_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Daya_aside_3_battle",
              "effectId": "Daya_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 15.0
            }
          ],
          "description": "味方全員の敵への与ダメージを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "taida",
    "name": "タイダー",
    "basic": {
      "rarity": 2.0,
      "personality": "活発",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Taida_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 270.0,
              "2": 297.0,
              "3": 324.0,
              "4": 351.0,
              "5": 378.0,
              "6": 405.0,
              "7": 432.0,
              "8": 459.0,
              "9": 486.0,
              "10": 513.0,
              "11": 540.0,
              "12": 567.0
            }
          }
        ],
        "skillId": "Taida_low",
        "skillType": "低学年",
        "skillName": "DX-シューター",
        "description": "強力な弾丸を発射し、敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Taida_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 297.0,
              "2": 326.7,
              "3": 356.4,
              "4": 386.1,
              "5": 415.8,
              "6": 445.5,
              "7": 475.2,
              "8": 504.9,
              "9": 534.6,
              "10": 564.3,
              "11": 594.0,
              "12": 623.7
            }
          },
          {
            "effectId": "Taida_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Taida_high",
        "skillType": "高学年",
        "skillName": "タンタン……パン！？",
        "description": "強力な弾丸を敵に3回発射し、範囲物理ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Taida_passive_e01",
            "valueKind": "会心ダメージ増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 25.0,
              "2": 30.0,
              "3": 35.0,
              "4": 40.0,
              "5": 45.0,
              "6": 50.0,
              "7": 55.0,
              "8": 60.0,
              "9": 65.0,
              "10": 70.0,
              "11": 75.0,
              "12": 80.0
            }
          }
        ],
        "skillId": "Taida_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心ダメージが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Taida_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Taida_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "弾丸を発射し、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "chopi",
    "name": "チョッピー",
    "basic": {
      "rarity": 2.0,
      "personality": "憂鬱",
      "race": "獣人",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Chopi_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 198.0,
              "2": 217.8,
              "3": 237.6,
              "4": 257.4,
              "5": 277.2,
              "6": 297.0,
              "7": 316.8,
              "8": 336.6,
              "9": 356.4,
              "10": 376.2,
              "11": 396.0,
              "12": 415.8
            }
          },
          {
            "effectId": "Chopi_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Chopi_low",
        "skillType": "低学年",
        "skillName": "ニャオ～",
        "description": "大声を出して敵に範囲物理ダメージを3回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Chopi_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 620.0,
              "2": 682.0,
              "3": 744.0,
              "4": 806.0,
              "5": 868.0,
              "6": 930.0,
              "7": 992.0,
              "8": 1054.0,
              "9": 1116.0,
              "10": 1178.0,
              "11": 1240.0,
              "12": 1302.0
            }
          },
          {
            "effectId": "Chopi_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Chopi_high",
        "skillType": "高学年",
        "skillName": "グルル～、ワン！",
        "description": "両腕を振り回して敵に物理ダメージを10回与える。",
        "cooldownSeconds": 28.0
      },
      {
        "effects": [
          {
            "effectId": "Chopi_passive_e01",
            "valueKind": "会心増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Chopi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Chopi_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Chopi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "斧を振り回して敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "diana",
    "name": "ディアナ",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "獣人",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.45
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 2.0,
      "critDmg": 2.0,
      "critRes": 5.0,
      "critDmgRes": 5.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Diana_low_e01",
            "valueKind": "最初のHP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/残りHP割合低い3名",
            "reference": "対象最大HP",
            "levels": {
              "1": 22.0,
              "2": 24.0,
              "3": 26.0,
              "4": 28.0,
              "5": 30.0,
              "6": 32.0,
              "7": 34.0,
              "8": 36.0,
              "9": 38.0,
              "10": 40.0,
              "11": 42.0,
              "12": 44.0,
              "13": 46.0,
              "14": 48.0,
              "15": 50.0
            }
          },
          {
            "effectId": "Diana_low_e02",
            "valueKind": "2回目のHP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/残りHP割合低い3名",
            "reference": "攻撃力",
            "levels": {
              "1": 190.0,
              "2": 205.0,
              "3": 220.0,
              "4": 235.0,
              "5": 250.0,
              "6": 265.0,
              "7": 280.0,
              "8": 295.0,
              "9": 310.0,
              "10": 325.0,
              "11": 340.0,
              "12": 355.0,
              "13": 370.0,
              "14": 385.0,
              "15": 400.0
            }
          }
        ],
        "skillId": "Diana_low",
        "skillType": "低学年",
        "skillName": "ナチュラルヒーリング",
        "description": "残りHP割合が低い味方3名を回復し、追加回復を行う。"
      },
      {
        "effects": [
          {
            "effectId": "Diana_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0,
              "13": 660.0,
              "14": 690.0,
              "15": 720.0
            }
          },
          {
            "effectId": "Diana_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 11.0
          },
          {
            "effectId": "Diana_high_e03",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          }
        ],
        "skillId": "Diana_high",
        "skillType": "高学年",
        "skillName": "真の癒し手",
        "description": "前方へ気功波を放ち、敵に範囲魔法ダメージを11回与え、ノックバックさせる。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Diana_passive_e01",
            "valueKind": "会心被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0,
              "13": 44.0,
              "14": 46.0,
              "15": 48.0
            }
          },
          {
            "effectId": "Diana_passive_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "対象性格",
            "conditionValue": "狂気",
            "effectTarget": "味方",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          }
        ],
        "skillId": "Diana_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心被ダメージ量を減少し、狂気性格の味方の攻撃力を増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Diana_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Diana_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を発射し、敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Diana_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          },
          {
            "effectId": "Diana_enhanced_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/残りHP割合最低",
            "reference": "与ダメージ量",
            "fixedValue": 275.0
          }
        ],
        "skillId": "Diana_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "強化呪文で敵に魔法ダメージを与え、HP割合が低い味方を回復する。",
        "triggerType": "一定確率",
        "triggerValue": 50.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "ちびディアナ",
      "levels": {
        "1": {
          "name": "子ジカの応援？",
          "stats": [],
          "effects": [
            {
              "skillId": "Diana_aside_1",
              "effectId": "Diana_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Diana_aside_1",
              "effectId": "Diana_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Diana_aside_1",
              "effectId": "Diana_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Diana_aside_1",
              "effectId": "Diana_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Diana_aside_1",
              "effectId": "Diana_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "すごい治療法",
          "stats": [],
          "effects": [
            {
              "skillId": "Diana_aside_2",
              "effectId": "Diana_aside_2_e01",
              "valueKind": "強化攻撃回復対象",
              "valueClass": "対象数",
              "effectType": "回復",
              "effectTarget": "味方",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 3.0
            },
            {
              "skillId": "Diana_aside_2",
              "effectId": "Diana_aside_2_e02",
              "valueKind": "会心被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "conditionType": "対象性格",
              "conditionValue": "狂気",
              "effectTarget": "味方/自身除外",
              "fixedValue": 66.0
            }
          ],
          "description": "強化攻撃の回復対象が3体に増加する。\n戦闘開始時、自身を除く狂気の味方使徒の会心被ダメージ量を減少させる。"
        },
        "3": {
          "name": "自然の力",
          "stats": [
            {
              "skillId": "Diana_aside_3_global",
              "effectId": "Diana_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 3.0
            },
            {
              "skillId": "Diana_aside_3_global",
              "effectId": "Diana_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Diana_aside_3_battle",
              "effectId": "Diana_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 13.6
            },
            {
              "skillId": "Diana_aside_3_battle",
              "effectId": "Diana_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 5.9
            }
          ],
          "description": "中列の味方の与ダメージ量を増加させ、中列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "tig",
    "name": "ティグ",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.29
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Tig_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 320.0,
              "2": 352.0,
              "3": 384.0,
              "4": 416.0,
              "5": 448.0,
              "6": 480.0,
              "7": 512.0,
              "8": 544.0,
              "9": 576.0,
              "10": 608.0,
              "11": 640.0,
              "12": 672.0,
              "13": 704.0,
              "14": 736.0,
              "15": 768.0
            }
          },
          {
            "effectId": "Tig_low_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "敵種別",
            "conditionValue": "使徒",
            "condition": "対象が使徒",
            "effectTarget": "対象の敵",
            "reference": "敵の最大HP",
            "fixedValue": 20.0
          }
        ],
        "skillId": "Tig_low",
        "skillType": "低学年",
        "skillName": "ソニックブレイド",
        "description": "瞬間的に前方に前進しながら範囲物理ダメージを与えた後、元の位置に戻る。対象が使徒である場合、最大HPに比例するダメージが追加される。"
      },
      {
        "effects": [
          {
            "effectId": "Tig_high_e05",
            "processGroupId": "Tig_high_overdrive",
            "valueKind": "オーバードライブ",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectTarget": "自身"
          },
          {
            "effectId": "Tig_high_e06",
            "processGroupId": "Tig_high_overdrive",
            "valueKind": "オーバードライブ",
            "valueClass": "持続時間",
            "effectType": "固有状態",
            "effectTarget": "自身",
            "fixedValue": 10.0
          },
          {
            "effectId": "Tig_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0,
              "13": 1320.0,
              "14": 1380.0,
              "15": 1440.0
            }
          },
          {
            "effectId": "Tig_high_e02",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 150.0
          },
          {
            "effectId": "Tig_high_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 10.0
          },
          {
            "effectId": "Tig_high_e04",
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 100.0
          },
          {
            "effectId": "Tig_high_e07",
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Tig_high",
        "skillType": "高学年",
        "skillName": "オーバードライブ",
        "description": "剣気を飛ばして敵に範囲物理ダメージを与える。一定時間、攻撃速度、普通攻撃のダメージ量がアップする。 この効果は解除できない。",
        "cooldownSeconds": 20.0
      },
      {
        "effects": [
          {
            "effectId": "Tig_passive_e01",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0,
              "13": 44.0,
              "14": 46.0,
              "15": 48.0
            }
          }
        ],
        "skillId": "Tig_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "攻撃速度が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Tig_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 40.0
          },
          {
            "effectId": "Tig_basic_e02",
            "valueKind": "2回目物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Tig_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "双剣を素早く振り回して敵に2回物理ダメージを与え、2回目の打撃はより大きなダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Tig_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 60.0
          },
          {
            "effectId": "Tig_enhanced_e02",
            "valueKind": "2回目物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 90.0
          },
          {
            "effectId": "Tig_enhanced_e03",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 120.0
          }
        ],
        "skillId": "Tig_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃ごとに、双剣を振り下ろした後、周囲に振り回して、敵に範囲物理ダメージを与え、SPを回復する。 最後の一撃はより大きなダメージを与える。",
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "favoriteCard": {
      "name": "ティグの燃え盛る剣",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Tig_favorite_1_e08",
                "processGroupId": "Tig_favorite_1_overdrive",
                "processOrder": 1.0,
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "オーバードラ火ブ",
                "valueClass": "状態付与",
                "effectType": "固有状態",
                "effectTarget": "自身"
              },
              {
                "effectId": "Tig_favorite_1_e09",
                "processGroupId": "Tig_favorite_1_overdrive",
                "processOrder": 2.0,
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "オーバードラ火ブ",
                "valueClass": "持続時間",
                "effectType": "固有状態",
                "effectTarget": "自身",
                "fixedValue": 10.0
              },
              {
                "effectId": "Tig_favorite_1_e01",
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵",
                "levels": {
                  "1": 900.0,
                  "2": 990.0,
                  "3": 1080.0,
                  "4": 1170.0,
                  "5": 1260.0,
                  "6": 1350.0,
                  "7": 1440.0,
                  "8": 1530.0,
                  "9": 1620.0,
                  "10": 1710.0,
                  "11": 1800.0,
                  "12": 1890.0,
                  "13": 1980.0,
                  "14": 2070.0,
                  "15": 2160.0
                }
              },
              {
                "effectId": "Tig_favorite_1_e02",
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 200.0
              },
              {
                "effectId": "Tig_favorite_1_e03",
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "攻撃速度増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 10.0
              },
              {
                "effectId": "Tig_favorite_1_e04",
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "普通攻撃ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "damageModifierCategory": "行動倍率",
                "effectTarget": "自身",
                "fixedValue": 100.0
              },
              {
                "effectId": "Tig_favorite_1_e10",
                "targetSkill": "高学年",
                "targetSkillName": "オーバードラ火ブ",
                "valueKind": "普通攻撃ダメージ増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "damageModifierCategory": "行動倍率",
                "effectTarget": "自身",
                "fixedValue": 10.0
              },
              {
                "effectId": "Tig_favorite_1_e05",
                "processGroupId": "Tig_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "火傷",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "effectStack": true,
                "maxStack": 9.0,
                "triggerType": "強化攻撃命中時",
                "triggerValue": "各ヒット",
                "triggerSourceId": "普通攻撃_強化",
                "conditionType": "固有状態中",
                "conditionValue": "Tig_favorite_1_e08",
                "condition": "オーバードラ火ブ（高学年スキル）の持続時間中",
                "effectTarget": "敵"
              },
              {
                "effectId": "Tig_favorite_1_e06",
                "processGroupId": "Tig_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "火傷",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "effectStack": true,
                "maxStack": 9.0,
                "triggerType": "強化攻撃命中時",
                "triggerValue": "各ヒット",
                "triggerSourceId": "普通攻撃_強化",
                "conditionType": "固有状態中",
                "conditionValue": "Tig_favorite_1_e08",
                "condition": "オーバードラ火ブ（高学年スキル）の持続時間中",
                "effectTarget": "敵",
                "fixedValue": 4.0
              },
              {
                "effectId": "Tig_favorite_1_e07",
                "valueKind": "与ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "対象状態",
                "conditionValue": "火傷",
                "condition": "火傷状態の敵を攻撃時",
                "effectTarget": "自身",
                "fixedValue": 100.0
              }
            ],
            "skillId": "Tig_favorite_1",
            "skillName": "愛用Lv1",
            "description": "燃え盛る剣の気を放って敵に範囲物理ダメージを与える。\n一定時間、攻撃速度と普通攻撃のダメージが増加する。\nこの効果は解除できない。\nオーバードラ火ブの持続時間中、強化攻撃が命中すると火傷を付与する。\n火傷状態の敵に与えるダメージ量が増加する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Tig_favorite_3_e01",
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Tig_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Tig_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Tig_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ティグの物理攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "礼儀正しいディアナ",
      "levels": {
        "1": {
          "name": "ディアナの一番弟子",
          "stats": [],
          "effects": [
            {
              "skillId": "Tig_aside_1",
              "effectId": "Tig_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Tig_aside_1",
              "effectId": "Tig_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Tig_aside_1",
              "effectId": "Tig_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Tig_aside_1",
              "effectId": "Tig_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "真の師匠ディアナ",
          "stats": [],
          "effects": [
            {
              "skillId": "Tig_aside_2",
              "effectId": "Tig_aside_2_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "conditionType": "対象使徒",
              "conditionValue": "Tig/Rufo/Beni",
              "condition": "対象使徒（ティグ、ルポ、ベニー）",
              "effectTarget": "対象の味方",
              "fixedValue": 30.0
            },
            {
              "skillId": "Tig_aside_2",
              "effectId": "Tig_aside_2_e02",
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "conditionType": "対象使徒",
              "conditionValue": "Tig/Rufo/Beni",
              "condition": "対象使徒（ティグ、ルポ、ベニー）",
              "effectTarget": "対象の味方",
              "fixedValue": 25.0
            },
            {
              "skillId": "Tig_aside_2",
              "effectId": "Tig_aside_2_e03",
              "processGroupId": "Tig_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "無敵",
              "valueClass": "状態付与",
              "effectType": "バフ",
              "triggerType": "高学年スキル発動時",
              "triggerSourceId": "Tig_high_overdrive",
              "condition": "オーバードライブ（高学年スキル）発動時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3.0
            },
            {
              "skillId": "Tig_aside_2",
              "effectId": "Tig_aside_2_e04",
              "processGroupId": "Tig_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "無敵",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "高学年スキル発動時",
              "triggerSourceId": "Tig_high_overdrive",
              "condition": "オーバードライブ（高学年スキル）発動時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3.0
            },
            {
              "skillId": "Tig_aside_2",
              "effectId": "Tig_aside_2_e05",
              "processGroupId": "Tig_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "無敵",
              "valueClass": "状態付与",
              "effectType": "バフ",
              "triggerType": "高学年スキル発動時",
              "triggerSourceId": "Tig_favorite_1_overdrive",
              "condition": "オーバードラ火ブ（高学年スキル）発動時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3.0
            },
            {
              "skillId": "Tig_aside_2",
              "effectId": "Tig_aside_2_e06",
              "processGroupId": "Tig_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "無敵",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "高学年スキル発動時",
              "triggerSourceId": "Tig_favorite_1_overdrive",
              "condition": "オーバードラ火ブ（高学年スキル）発動時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3.0
            }
          ],
          "description": "ティグ、ルポ、ベニーの敵への与ダメージ量と攻撃速度が増加する。\nオーバードライブ（もしくはオーバードラ火ブ）発動時、一定時間無敵になる。"
        },
        "3": {
          "name": "次期村長ティグ",
          "stats": [
            {
              "skillId": "Tig_aside_3_global",
              "effectId": "Tig_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Tig_aside_3_global",
              "effectId": "Tig_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Tig_aside_3_battle",
              "effectId": "Tig_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "前方の敵",
              "fixedValue": 14.0
            },
            {
              "skillId": "Tig_aside_3_battle",
              "effectId": "Tig_aside_3_battle_e02",
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "前方の敵",
              "fixedValue": 5.0
            }
          ],
          "description": "前列の味方の与ダメージ量を増加させ、前列の味方の攻撃速度を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "naia",
    "name": "ナイア",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "精霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 44.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.525
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 3.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Naia_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "対象の最大HP",
            "fixedValue": 15.0
          },
          {
            "effectId": "Naia_low_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "自分の攻撃力",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0,
              "13": 22.0,
              "14": 23.0,
              "15": 24.0
            }
          },
          {
            "effectId": "Naia_low_e03",
            "valueKind": "回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "fixedValue": 20.0
          },
          {
            "effectId": "Naia_low_e04",
            "valueKind": "状態異常解除",
            "valueClass": "状態解除",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方"
          }
        ],
        "skillId": "Naia_low",
        "skillType": "低学年",
        "skillName": "それ洗ったの？",
        "description": "残りHP割合が最も低い味方を20回回復し状態異常を解除。"
      },
      {
        "effects": [
          {
            "effectId": "Naia_high_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方",
            "reference": "対象の最大HP",
            "levels": {
              "1": 10.0,
              "2": 12.0,
              "3": 14.0,
              "4": 16.0,
              "5": 18.0,
              "6": 20.0,
              "7": 22.0,
              "8": 24.0,
              "9": 26.0,
              "10": 28.0,
              "11": 30.0,
              "12": 32.0,
              "13": 34.0,
              "14": 36.0,
              "15": 38.0
            }
          },
          {
            "effectId": "Naia_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 360.0,
              "2": 396.0,
              "3": 432.0,
              "4": 468.0,
              "5": 504.0,
              "6": 540.0,
              "7": 576.0,
              "8": 612.0,
              "9": 648.0,
              "10": 684.0,
              "11": 720.0,
              "12": 756.0,
              "13": 792.0,
              "14": 828.0,
              "15": 864.0
            }
          }
        ],
        "skillId": "Naia_high",
        "skillType": "高学年",
        "skillName": "水の洗礼を受けなさい！",
        "description": "波を召喚して味方を回復し敵に魔法ダメージ。",
        "cooldownSeconds": 26.0
      },
      {
        "effects": [
          {
            "effectId": "Naia_passive_e01",
            "valueKind": "クールタイム減少",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 1.0,
              "2": 1.5,
              "3": 2.0,
              "4": 2.5,
              "5": 3.0,
              "6": 3.5,
              "7": 4.0,
              "8": 4.5,
              "9": 5.0,
              "10": 5.5,
              "11": 6.0,
              "12": 6.5,
              "13": 7.0,
              "14": 7.5,
              "15": 8.0
            }
          }
        ],
        "skillId": "Naia_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "高学年スキルのクールタイムが減少。"
      },
      {
        "effects": [
          {
            "effectId": "Naia_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 45.0
          }
        ],
        "skillId": "Naia_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵に魔法ダメージ。"
      },
      {
        "effects": [
          {
            "effectId": "Naia_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 48.0
          },
          {
            "effectId": "Naia_enhanced_e02",
            "valueKind": "最後の一撃の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 72.0
          }
        ],
        "skillId": "Naia_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で水鉄砲を素早く3回発射して敵にダメージを与える。 最後の一撃ではより大きなダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 40.0
      }
    ],
    "favoriteCard": {
      "name": "ナイアのイルカ水鉄砲",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Naia_favorite_1_e01",
                "targetSkill": "低学年",
                "targetSkillName": "キレイにしてあげる！",
                "valueKind": "戦闘開始時SP回復",
                "valueClass": "固定値",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 150.0
              },
              {
                "effectId": "Naia_favorite_1_e02",
                "targetSkill": "低学年",
                "targetSkillName": "キレイにしてあげる！",
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "残りHP割合が最も低い味方",
                "reference": "対象の最大HP",
                "fixedValue": 20.0
              },
              {
                "effectId": "Naia_favorite_1_e03",
                "targetSkill": "低学年",
                "targetSkillName": "キレイにしてあげる！",
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "残りHP割合が最も低い味方",
                "reference": "自分の攻撃力",
                "levels": {
                  "1": 20.0,
                  "2": 22.0,
                  "3": 24.0,
                  "4": 26.0,
                  "5": 28.0,
                  "6": 30.0,
                  "7": 32.0,
                  "8": 34.0,
                  "9": 36.0,
                  "10": 38.0,
                  "11": 40.0,
                  "12": 42.0
                }
              },
              {
                "effectId": "Naia_favorite_1_e04",
                "targetSkill": "低学年",
                "targetSkillName": "キレイにしてあげる！",
                "valueKind": "回数",
                "valueClass": "回数",
                "effectType": "回復",
                "effectTarget": "残りHP割合が最も低い味方",
                "fixedValue": 20.0
              },
              {
                "effectId": "Naia_favorite_1_e05",
                "targetSkill": "低学年",
                "targetSkillName": "キレイにしてあげる！",
                "valueKind": "シールド転換割合",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "回復対象",
                "fixedValue": 20.0
              },
              {
                "effectId": "Naia_favorite_1_e06",
                "targetSkill": "低学年",
                "targetSkillName": "キレイにしてあげる！",
                "valueKind": "シールド",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "effectTarget": "回復対象",
                "fixedValue": 8.0
              }
            ],
            "skillId": "Naia_favorite_1",
            "skillName": "愛用Lv1",
            "description": "戦闘開始時にSPが回復する。\n水流の洗浄効果で残りHP割合が最も低い味方のHPを20回回復させ、状態異常を解除する。\nスキル発動中に、回復する味方を1回変更できる。\n最大HPを超えて回復する場合は、一定割合をシールドに転換する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Naia_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Naia_favorite_3_e02",
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Naia_favorite_3_e03",
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Naia_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ナイアの魔法攻撃力、会心抵抗、会心ダメージ抵抗が増加。"
          }
        ]
      }
    },
    "aside": {
      "name": "説教の竜族シルフィール",
      "levels": {
        "1": {
          "name": "あなたの説教だけ聞こえる",
          "stats": [],
          "effects": [
            {
              "skillId": "Naia_aside_1",
              "effectId": "Naia_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Naia_aside_1",
              "effectId": "Naia_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Naia_aside_1",
              "effectId": "Naia_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Naia_aside_1",
              "effectId": "Naia_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Naia_aside_1",
              "effectId": "Naia_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "キュッキュッと洗うよ",
          "stats": [],
          "effects": [
            {
              "skillId": "Naia_aside_2",
              "effectId": "Naia_aside_2_e01",
              "valueKind": "気絶",
              "valueClass": "状態免疫",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "skillId": "Naia_aside_2",
              "effectId": "Naia_aside_2_e02",
              "valueKind": "ノックバック",
              "valueClass": "状態免疫",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "skillId": "Naia_aside_2",
              "effectId": "Naia_aside_2_e03",
              "valueKind": "前進する波召喚回数",
              "valueClass": "回数",
              "effectType": "召喚",
              "attackCategory": "高学年スキル",
              "effectTarget": "前進する波",
              "targetSkill": "高学年スキル",
              "fixedValue": 2.0
            }
          ],
          "description": "気絶とノックバックに免疫を持つ。\n高学年スキルの前進する波を2回召喚する。"
        },
        "3": {
          "name": "水が伝えるメッセージ",
          "stats": [
            {
              "skillId": "Naia_aside_3_global",
              "effectId": "Naia_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            },
            {
              "skillId": "Naia_aside_3_global",
              "effectId": "Naia_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Naia_aside_3_battle",
              "effectId": "Naia_aside_3_battle_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 7.2
            },
            {
              "skillId": "Naia_aside_3_battle",
              "effectId": "Naia_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 4.5
            }
          ],
          "description": "味方全員の最大HPを増加させ、味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "ner",
    "name": "ネル",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "妖精",
      "role": "支援",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 95.0,
      "combatPowerCorrectionB": 0.45
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 1.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 1.0,
      "critDmg": 1.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Ner_low_e01",
            "processGroupId": "Ner_low_proc01",
            "processOrder": 1.0,
            "valueKind": "無敵",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Ner_low_e02",
            "processGroupId": "Ner_low_proc01",
            "processOrder": 2.0,
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3.0
          },
          {
            "effectId": "Ner_low_e03",
            "processGroupId": "Ner_low_proc01",
            "processOrder": 3.0,
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "味方全体",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0,
              "13": 44.0,
              "14": 46.0,
              "15": 48.0
            }
          },
          {
            "effectId": "Ner_low_e04",
            "processGroupId": "Ner_low_proc01",
            "processOrder": 4.0,
            "valueKind": "与ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "味方全体",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Ner_low",
        "skillType": "低学年",
        "skillName": "世界樹の啓示",
        "description": "自身に無敵を付与し、味方全員の与ダメージ量を増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Ner_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/周囲",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0,
              "13": 1320.0,
              "14": 1380.0,
              "15": 1440.0
            }
          },
          {
            "effectId": "Ner_high_e02",
            "processGroupId": "Ner_high_proc01",
            "processOrder": 1.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方/周囲",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          },
          {
            "effectId": "Ner_high_e03",
            "processGroupId": "Ner_high_proc01",
            "processOrder": 2.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方/周囲",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Ner_high",
        "skillType": "高学年",
        "skillName": "エーダルの祝福",
        "description": "周囲の味方の被ダメージ量を減少し、周囲の敵に範囲魔法ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Ner_passive_e01",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身/味方周囲",
            "levels": {
              "1": 1.0,
              "2": 2.0,
              "3": 3.0,
              "4": 4.0,
              "5": 5.0,
              "6": 6.0,
              "7": 7.0,
              "8": 8.0,
              "9": 9.0,
              "10": 10.0,
              "11": 11.0,
              "12": 12.0,
              "13": 13.0,
              "14": 14.0,
              "15": 15.0
            }
          },
          {
            "effectId": "Ner_passive_e02",
            "valueKind": "SP回復",
            "valueClass": "周期",
            "effectType": "回復",
            "effectTarget": "自身/味方周囲",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Ner_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "2秒ごとに自身と周囲の味方のSPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Ner_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 80.0
          }
        ],
        "skillId": "Ner_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "斧を振り回して敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "聖君エルフィン",
      "levels": {
        "1": {
          "name": "女王特別補佐役",
          "stats": [],
          "effects": [
            {
              "skillId": "Ner_aside_1",
              "effectId": "Ner_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ner_aside_1",
              "effectId": "Ner_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ner_aside_1",
              "effectId": "Ner_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ner_aside_1",
              "effectId": "Ner_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Ner_aside_1",
              "effectId": "Ner_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "司祭長の無敵権",
          "stats": [],
          "effects": [
            {
              "skillId": "Ner_aside_2",
              "effectId": "Ner_aside_2_e01",
              "processGroupId": "Ner_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "targetSkill": "基本攻撃",
              "fixedValue": 15.0
            },
            {
              "skillId": "Ner_aside_2",
              "effectId": "Ner_aside_2_e02",
              "processGroupId": "Ner_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "被ダメージ量減少",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "targetSkill": "基本攻撃",
              "fixedValue": 3.0
            },
            {
              "skillId": "Ner_aside_2",
              "effectId": "Ner_aside_2_e03",
              "processGroupId": "Ner_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "reference": "最大HP",
              "fixedValue": 3.0
            },
            {
              "skillId": "Ner_aside_2",
              "effectId": "Ner_aside_2_e04",
              "processGroupId": "Ner_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "triggerType": "普通攻撃命中時",
              "triggerSourceId": "普通攻撃",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "fixedValue": 30.0
            },
            {
              "skillId": "Ner_aside_2",
              "effectId": "Ner_aside_2_e05",
              "processGroupId": "Ner_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "無敵",
              "valueClass": "状態付与",
              "effectType": "バフ",
              "triggerType": "高学年スキル使用時",
              "triggerSourceId": "高学年スキル",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身/前衛使徒",
              "targetSkill": "高学年スキル使用時"
            },
            {
              "skillId": "Ner_aside_2",
              "effectId": "Ner_aside_2_e06",
              "processGroupId": "Ner_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "無敵",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "高学年スキル使用時",
              "triggerSourceId": "高学年スキル",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身/前衛使徒",
              "targetSkill": "高学年スキル",
              "fixedValue": 5.0
            }
          ],
          "description": "基本攻撃が命中すると、自身の被ダメージ量が減少し、HPとSPを回復する。\n高学年スキル使用時、自身と前衛使徒に無敵を付与する。"
        },
        "3": {
          "name": "世界樹の名前で！",
          "stats": [
            {
              "skillId": "Ner_aside_3_global",
              "effectId": "Ner_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Ner_aside_3_global",
              "effectId": "Ner_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Ner_aside_3_battle",
              "effectId": "Ner_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 10.5
            },
            {
              "skillId": "Ner_aside_3_battle",
              "effectId": "Ner_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 4.5
            }
          ],
          "description": "味方全員の与ダメージ量を増加させ、味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "butter",
    "name": "バター",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 5.0,
      "critDmg": 5.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Butter_low_e01",
            "valueKind": "攻撃ごとの物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 160.0,
              "2": 176.0,
              "3": 192.0,
              "4": 208.0,
              "5": 224.0,
              "6": 240.0,
              "7": 256.0,
              "8": 272.0,
              "9": 288.0,
              "10": 304.0,
              "11": 320.0,
              "12": 336.0
            }
          },
          {
            "effectId": "Butter_low_e02",
            "valueKind": "攻撃の最大回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Butter_low",
        "skillType": "低学年",
        "skillName": "バターフライ！",
        "description": "対象が複数いる場合、跳ね返る弾丸を発射して敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Butter_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 400.0,
              "2": 440.0,
              "3": 480.0,
              "4": 520.0,
              "5": 560.0,
              "6": 600.0,
              "7": 640.0,
              "8": 680.0,
              "9": 720.0,
              "10": 760.0,
              "11": 800.0,
              "12": 840.0
            }
          },
          {
            "effectId": "Butter_high_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Butter_high_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Butter_high",
        "skillType": "高学年",
        "skillName": "ストラ～イク！",
        "description": "巨大な石を発射し、敵に範囲物理ダメージを与え、気絶を付与する。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Butter_passive_e01",
            "valueKind": "会心率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0
            }
          },
          {
            "effectId": "Butter_passive_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "対象性格",
            "conditionValue": "活発",
            "effectTarget": "味方/活発",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0
            }
          }
        ],
        "skillId": "Butter_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心率が増加する。活発の味方使徒の攻撃力を増加させる。この効果はバターがフィールドにいなくても発動する。"
      },
      {
        "effects": [
          {
            "effectId": "Butter_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Butter_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵に大きな石を発射して物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Butter_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          },
          {
            "effectId": "Butter_enhanced_e02",
            "valueKind": "確定会心",
            "valueClass": "条件",
            "effectType": "攻撃",
            "effectTarget": "敵"
          }
        ],
        "skillId": "Butter_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で犬用ガムを発射し、敵に確定会心物理ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {
      "name": "バターのイエローカード",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Butter_favorite_1_e01",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 30.0,
                "effectTarget": "敵",
                "fixedValue": 150.0
              },
              {
                "effectId": "Butter_favorite_1_e02",
                "processGroupId": "Butter_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "強化物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率(怒り100中)",
                "triggerValue": 100.0,
                "effectTarget": "敵/範囲",
                "fixedValue": 250.0
              },
              {
                "effectId": "Butter_favorite_1_e03",
                "processGroupId": "Butter_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "確定会心",
                "valueClass": "条件",
                "effectType": "攻撃",
                "triggerType": "一定確率(怒り100中)",
                "triggerValue": 100.0,
                "effectTarget": "敵/範囲"
              },
              {
                "effectId": "Butter_favorite_1_e04",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "怒り獲得",
                "valueClass": "固定値",
                "effectType": "条件",
                "effectTarget": "自身",
                "fixedValue": 4.0
              },
              {
                "effectId": "Butter_favorite_1_e05",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "怒り必要回数",
                "valueClass": "固定値",
                "effectType": "条件",
                "effectTarget": "自身",
                "fixedValue": 100.0
              }
            ],
            "skillId": "Butter_favorite_1",
            "skillName": "愛用Lv1",
            "description": "味方が直接ダメージを受けると怒りを4回獲得し、100回になると強化攻撃が変更される。\n強化攻撃では銃を取り出し、範囲内の敵に確定会心物理ダメージを与える。\n怒りはバターが倒された状態でも獲得でき、獲得した怒りは消えない。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Butter_favorite_3_e01",
                "targetSkill": "高学年",
                "valueKind": "クールタイム減少",
                "valueClass": "クールタイム",
                "effectType": "クールタイム",
                "effectTarget": "自身",
                "fixedValue": 5.0
              },
              {
                "effectId": "Butter_favorite_3_e02",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "強化攻撃確率増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 20.0
              }
            ],
            "skillId": "Butter_favorite_3",
            "skillName": "愛用Lv3",
            "description": "バターの高学年スキルのクールタイムが減少する。\nバターの強化攻撃確率が増加する。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "patula",
    "name": "パトラ",
    "basic": {
      "rarity": 1.0,
      "personality": "冷静",
      "race": "妖精",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.195
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Patula_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 150.0,
              "2": 165.0,
              "3": 180.0,
              "4": 195.0,
              "5": 210.0,
              "6": 225.0,
              "7": 240.0,
              "8": 255.0,
              "9": 270.0,
              "10": 285.0,
              "11": 300.0,
              "12": 315.0
            }
          },
          {
            "effectId": "Patula_low_e02",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Patula_low_e03",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Patula_low",
        "skillType": "低学年",
        "skillName": "ミントでも食らえ！",
        "description": "ミントを付けたフライ返しで敵を殴って物理ダメージを与え、毒を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Patula_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          }
        ],
        "skillId": "Patula_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - パトラ",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 30.0
      },
      {
        "effects": [
          {
            "effectId": "Patula_passive_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Patula_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "攻撃力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Patula_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 50.0
          }
        ],
        "skillId": "Patula_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "フライ返しを叩きつけ、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "barong",
    "name": "バロン",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "幽霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 180.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.235
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Barong_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0,
              "13": 660.0,
              "14": 690.0,
              "15": 720.0
            }
          },
          {
            "effectId": "Barong_low_e02",
            "valueKind": "呪い",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Barong_low_e03",
            "valueKind": "呪い",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 15.0
          },
          {
            "effectId": "Barong_low_e04",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Barong_low_e05",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Barong_low",
        "skillType": "低学年",
        "skillName": "陰口人形",
        "description": "最も後ろにいる敵に突進し、魔法ダメージを与え呪いを付与する。 スキル発動後、一定時間自身の攻撃速度が増加し、敵の魔法防御力を減少させる。 敵が3体以上いる場合、攻撃していない敵を優先的に攻撃する。"
      },
      {
        "effects": [
          {
            "effectId": "Barong_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600.0,
              "2": 630.0,
              "3": 660.0,
              "4": 690.0,
              "5": 720.0,
              "6": 750.0,
              "7": 780.0,
              "8": 810.0,
              "9": 840.0,
              "10": 870.0,
              "11": 900.0,
              "12": 930.0,
              "13": 960.0,
              "14": 990.0,
              "15": 1020.0
            }
          },
          {
            "effectId": "Barong_high_e02",
            "valueKind": "呪い",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Barong_high_e03",
            "valueKind": "呪い",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 15.0
          },
          {
            "effectId": "Barong_high_e04",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 25.0
          },
          {
            "effectId": "Barong_high_e05",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Barong_high",
        "skillType": "高学年",
        "skillName": "鬼火呼び",
        "description": "自身を中心に周囲の敵へ範囲魔法ダメージを与え、呪いを付与する。 一定時間、自身の被ダメージが減少する。",
        "cooldownSeconds": 40.0
      },
      {
        "effects": [
          {
            "effectId": "Barong_passive_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 35.0,
              "2": 38.0,
              "3": 41.0,
              "4": 44.0,
              "5": 47.0,
              "6": 50.0,
              "7": 53.0,
              "8": 56.0,
              "9": 59.0,
              "10": 62.0,
              "11": 65.0,
              "12": 68.0,
              "13": 71.0,
              "14": 74.0,
              "15": 77.0
            }
          },
          {
            "effectId": "Barong_passive_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 10.0
          },
          {
            "effectId": "Barong_passive_e03",
            "processGroupId": "Barong_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル終了時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年スキル発動後",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0,
              "13": 66.0,
              "14": 69.0,
              "15": 72.0
            }
          },
          {
            "effectId": "Barong_passive_e04",
            "processGroupId": "Barong_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル終了時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年スキル発動後",
            "effectTarget": "自身",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Barong_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "ウェーブ開始時に一定時間、自身にシールドを生成する。 低学年スキル使用後、一定時間自身の攻撃速度が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Barong_basic_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 120.0
          }
        ],
        "skillId": "Barong_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "釘で突き刺し、敵に魔法ダメージを2回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Barong_enhanced_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 360.0
          },
          {
            "effectId": "Barong_enhanced_e02",
            "processGroupId": "Barong_enhanced_proc01",
            "processOrder": 1.0,
            "valueKind": "目くらまし",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Barong_enhanced_e03",
            "processGroupId": "Barong_enhanced_proc01",
            "processOrder": 2.0,
            "valueKind": "目くらまし",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Barong_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "釘を飛ばして敵に魔法ダメージを2回与え、自身に目くらましを付与する。 呪い状態の敵が存在する間、バロンの基本攻撃が強化攻撃に変わる。",
        "triggerType": "呪い状態の敵が存在",
        "triggerValue": 1.0
      }
    ],
    "favoriteCard": {
      "name": "バロンの呪いのぬいぐるみ",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Barong_favorite_1_e01",
                "processGroupId": "Barong_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "総魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1.0,
                "effectTarget": "敵",
                "fixedValue": 660.0
              },
              {
                "effectId": "Barong_favorite_1_e02",
                "processGroupId": "Barong_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "攻撃速度減少",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1.0,
                "effectTarget": "敵",
                "fixedValue": 30.0
              },
              {
                "effectId": "Barong_favorite_1_e03",
                "processGroupId": "Barong_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "攻撃速度減少",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1.0,
                "effectTarget": "敵",
                "fixedValue": 5.0
              },
              {
                "effectId": "Barong_favorite_1_e04",
                "processGroupId": "Barong_favorite_1_proc02",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "目くらまし",
                "valueClass": "状態付与",
                "effectType": "バフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1.0,
                "triggerSourceId": "強化攻撃",
                "condition": "強化攻撃時",
                "effectTarget": "自身"
              },
              {
                "effectId": "Barong_favorite_1_e05",
                "processGroupId": "Barong_favorite_1_proc02",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "目くらまし",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1.0,
                "triggerSourceId": "強化攻撃",
                "condition": "強化攻撃時",
                "effectTarget": "自身",
                "fixedValue": 8.0
              }
            ],
            "skillId": "Barong_favorite_1",
            "skillName": "愛用Lv1",
            "description": "釘を飛ばして敵に3回魔法ダメージを与え、攻撃速度を減少させる。自身には目くらましを付与する。\n呪い状態の敵が存在する場合、基本攻撃の代わりに強化攻撃を発動する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Barong_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Barong_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Barong_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Barong_favorite_3",
            "skillName": "愛用Lv3",
            "description": "バロンの魔法攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "愛され幽霊バロン",
      "levels": {
        "1": {
          "name": "みんなの愛されキャラ",
          "stats": [],
          "effects": [
            {
              "skillId": "Barong_aside_1",
              "effectId": "Barong_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Barong_aside_1",
              "effectId": "Barong_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Barong_aside_1",
              "effectId": "Barong_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Barong_aside_1",
              "effectId": "Barong_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "ご主人様の時間だ",
          "stats": [],
          "effects": [
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "conditionType": "行動区間",
              "conditionValue": "Barong_low:突進",
              "condition": "低学年スキルで突進中",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 40.0
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e02",
              "valueKind": "不吉な霧生成",
              "valueClass": "持続時間",
              "effectType": "召喚",
              "effectTarget": "不吉な霧",
              "targetSkill": "低学年スキル",
              "fixedValue": 10.0
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e03",
              "processGroupId": "Barong_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "呪い",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "conditionType": "領域内",
              "conditionValue": "Barong_aside_2_ominous_mist",
              "condition": "不吉な霧の中にいる時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e04",
              "processGroupId": "Barong_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "呪い",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "conditionType": "領域内",
              "conditionValue": "Barong_aside_2_ominous_mist",
              "condition": "不吉な霧の中にいる時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 6.0
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e05",
              "processGroupId": "Barong_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "毒",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "effectStack": true,
              "maxStack": 9.0,
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e06",
              "processGroupId": "Barong_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "毒",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectStack": true,
              "maxStack": 9.0,
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 3.0
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e07",
              "processGroupId": "Barong_aside_2_proc01",
              "processOrder": 5.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "fixedValue": 15.0
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e08",
              "processGroupId": "Barong_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "気絶",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ウェーブ内初回",
              "conditionValue": "Barong_aside_2_proc02",
              "condition": "ウェーブの初回低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Barong_aside_2",
              "effectId": "Barong_aside_2_e09",
              "processGroupId": "Barong_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "気絶",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ウェーブ内初回",
              "conditionValue": "Barong_aside_2_proc02",
              "condition": "ウェーブの初回低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 3.0
            }
          ],
          "description": "低学年スキルの目標対象に向かって突進する際、被ダメージ量が減少し、足跡に沿って不吉な霧を生成する。\n不吉な霧の中にいる敵に一定時間ごとに呪いを付与する。\n低学年スキル命中時、敵に毒を付与し、自身のHPを回復させる。\nウェーブごとに最初の低学年スキル命中時、敵に気絶を付与する。"
        },
        "3": {
          "name": "新たなクジラ",
          "stats": [
            {
              "skillId": "Barong_aside_3_global",
              "effectId": "Barong_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Barong_aside_3_global",
              "effectId": "Barong_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Barong_aside_3_battle",
              "effectId": "Barong_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 13.6
            },
            {
              "skillId": "Barong_aside_3_battle",
              "effectId": "Barong_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 5.9
            }
          ],
          "description": "前列の味方の与ダメージ量を増加させ、前列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "picora",
    "name": "ピコラ",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "魔女",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.525
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Picora_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方3名",
            "reference": "攻撃力",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0,
              "13": 1320.0,
              "14": 1380.0,
              "15": 1440.0
            }
          },
          {
            "effectId": "Picora_low_e02",
            "processGroupId": "Picora_low_sticker",
            "processOrder": 3.0,
            "valueKind": "ステッカーHP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "triggerType": "固有状態付与時",
            "triggerValue": "ステッカー",
            "triggerSourceId": "Picora_low_e05",
            "effectTarget": "味方/ステッカー対象",
            "reference": "対象最大HP",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          },
          {
            "effectId": "Picora_low_e03",
            "valueKind": "会心抵抗増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "固有状態中",
            "conditionValue": "Picora_low_e05",
            "condition": "ステッカー付与時",
            "effectTarget": "味方/ステッカー対象",
            "levels": {
              "1": 11.0,
              "2": 12.0,
              "3": 13.0,
              "4": 14.0,
              "5": 15.0,
              "6": 16.0,
              "7": 17.0,
              "8": 18.0,
              "9": 19.0,
              "10": 20.0,
              "11": 21.0,
              "12": 22.0,
              "13": 23.0,
              "14": 24.0,
              "15": 25.0
            }
          },
          {
            "effectId": "Picora_low_e04",
            "valueKind": "物理防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "固有状態中",
            "conditionValue": "Picora_low_e05",
            "condition": "ステッカー付与時",
            "effectTarget": "味方/ステッカー対象",
            "levels": {
              "1": 11.0,
              "2": 12.0,
              "3": 13.0,
              "4": 14.0,
              "5": 15.0,
              "6": 16.0,
              "7": 17.0,
              "8": 18.0,
              "9": 19.0,
              "10": 20.0,
              "11": 21.0,
              "12": 22.0,
              "13": 23.0,
              "14": 24.0,
              "15": 25.0
            }
          },
          {
            "effectId": "Picora_low_e05",
            "processGroupId": "Picora_low_sticker",
            "processOrder": 1.0,
            "valueKind": "ステッカー",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectTarget": "残りHP割合が最も低い味方3名"
          },
          {
            "effectId": "Picora_low_e06",
            "processGroupId": "Picora_low_sticker",
            "processOrder": 2.0,
            "valueKind": "ステッカー",
            "valueClass": "持続時間",
            "effectType": "固有状態",
            "effectTarget": "残りHP割合が最も低い味方3名",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Picora_low",
        "skillType": "低学年",
        "skillName": "限定ステッカー",
        "description": "残りHP割合が最も低い味方3名にステッカーを貼り、HPを回復する。ステッカーは追加回復、会心抵抗、物理防御力増加を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Picora_high_e01",
            "valueKind": "状態異常解除",
            "valueClass": "状態解除",
            "effectType": "回復",
            "effectTarget": "味方/最大HP最高"
          },
          {
            "effectId": "Picora_high_e02",
            "valueKind": "挑発",
            "valueClass": "周期",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Picora_high_e03",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Picora_high_e04",
            "processGroupId": "Picora_high_proc01",
            "processOrder": 1.0,
            "valueKind": "最大HP増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方/最大HP最高",
            "levels": {
              "1": 25.0,
              "2": 27.0,
              "3": 29.0,
              "4": 31.0,
              "5": 33.0,
              "6": 35.0,
              "7": 37.0,
              "8": 39.0,
              "9": 41.0,
              "10": 43.0,
              "11": 45.0,
              "12": 47.0,
              "13": 49.0,
              "14": 51.0,
              "15": 53.0
            }
          },
          {
            "effectId": "Picora_high_e05",
            "processGroupId": "Picora_high_proc01",
            "processOrder": 2.0,
            "valueKind": "最大HP増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方/最大HP最高",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Picora_high",
        "skillType": "高学年",
        "skillName": "これであなたもファッショニスタ",
        "description": "最大HPが最も高い味方の状態異常を解除してスタイリングする。最大HPを増加させ、一定時間敵を挑発する。",
        "cooldownSeconds": 32.0
      },
      {
        "effects": [
          {
            "effectId": "Picora_passive_e01",
            "valueKind": "会心抵抗増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "味方全体",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0,
              "13": 22.0,
              "14": 23.0,
              "15": 24.0
            }
          }
        ],
        "skillId": "Picora_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "味方全員の会心抵抗が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Picora_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Picora_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を唱えて敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Picora_enhanced_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/ランダム",
            "fixedValue": 120.0
          },
          {
            "effectId": "Picora_enhanced_e02",
            "valueKind": "呪文",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵/ランダム",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Picora_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でランダムな対象に呪文を2つ唱え、魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 40.0
      }
    ],
    "favoriteCard": {
      "name": "ピコラのファッションポーチ",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Picora_favorite_1_e01",
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "味方/残りHP割合低い3名",
                "reference": "攻撃力",
                "levels": {
                  "1": 600.0,
                  "2": 660.0,
                  "3": 720.0,
                  "4": 780.0,
                  "5": 840.0,
                  "6": 900.0,
                  "7": 960.0,
                  "8": 1020.0,
                  "9": 1080.0,
                  "10": 1140.0,
                  "11": 1200.0,
                  "12": 1260.0,
                  "13": 1320.0,
                  "14": 1380.0,
                  "15": 1440.0
                }
              },
              {
                "effectId": "Picora_favorite_1_e02",
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "ステッカーHP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "triggerType": "固有状態付与時",
                "triggerValue": "ステッカー",
                "triggerSourceId": "Picora_low_e05",
                "effectTarget": "味方/ステッカー対象",
                "reference": "対象最大HP",
                "levels": {
                  "1": 12.0,
                  "2": 13.0,
                  "3": 14.0,
                  "4": 15.0,
                  "5": 16.0,
                  "6": 17.0,
                  "7": 18.0,
                  "8": 19.0,
                  "9": 20.0,
                  "10": 21.0,
                  "11": 22.0,
                  "12": 23.0,
                  "13": 24.0,
                  "14": 25.0,
                  "15": 26.0
                }
              },
              {
                "effectId": "Picora_favorite_1_e03",
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "固有状態中",
                "conditionValue": "Picora_low_e05",
                "condition": "ステッカー時",
                "effectTarget": "味方/ステッカー対象",
                "levels": {
                  "1": 11.0,
                  "2": 12.0,
                  "3": 13.0,
                  "4": 14.0,
                  "5": 15.0,
                  "6": 16.0,
                  "7": 17.0,
                  "8": 18.0,
                  "9": 19.0,
                  "10": 20.0,
                  "11": 21.0,
                  "12": 22.0,
                  "13": 23.0,
                  "14": 24.0,
                  "15": 25.0
                }
              },
              {
                "effectId": "Picora_favorite_1_e04",
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "物理防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "固有状態中",
                "conditionValue": "Picora_low_e05",
                "condition": "ステッカー時",
                "effectTarget": "味方/ステッカー対象",
                "levels": {
                  "1": 11.0,
                  "2": 12.0,
                  "3": 13.0,
                  "4": 14.0,
                  "5": 15.0,
                  "6": 16.0,
                  "7": 17.0,
                  "8": 18.0,
                  "9": 19.0,
                  "10": 20.0,
                  "11": 21.0,
                  "12": 22.0,
                  "13": 23.0,
                  "14": 24.0,
                  "15": 25.0
                }
              },
              {
                "effectId": "Picora_favorite_1_e05",
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "1秒ごとのHP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "triggerType": "n秒ごと",
                "triggerValue": 1.0,
                "triggerSourceId": "Picora_low_e05",
                "conditionType": "固有状態中",
                "conditionValue": "Picora_low_e05",
                "effectTarget": "味方/ステッカー対象",
                "reference": "対象最大HP",
                "levels": {
                  "1": 1.0,
                  "2": 2.0,
                  "3": 3.0,
                  "4": 4.0,
                  "5": 5.0,
                  "6": 6.0,
                  "7": 7.0,
                  "8": 8.0,
                  "9": 9.0,
                  "10": 10.0,
                  "11": 11.0,
                  "12": 12.0,
                  "13": 13.0,
                  "14": 14.0,
                  "15": 15.0
                }
              },
              {
                "effectId": "Picora_favorite_1_e06",
                "processGroupId": "Picora_favorite_1_sticker_regen",
                "processOrder": 1.0,
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "1秒ごとのHP回復",
                "valueClass": "周期",
                "effectType": "回復",
                "triggerType": "n秒ごと",
                "triggerValue": 1.0,
                "triggerSourceId": "Picora_low_e05",
                "conditionType": "固有状態中",
                "conditionValue": "Picora_low_e05",
                "effectTarget": "味方/ステッカー対象",
                "fixedValue": 1.0
              },
              {
                "effectId": "Picora_favorite_1_e07",
                "processGroupId": "Picora_favorite_1_sticker_regen",
                "processOrder": 2.0,
                "targetSkill": "低学年",
                "targetSkillName": "初回限定ステッカー",
                "valueKind": "ステッカー",
                "valueClass": "持続時間",
                "effectType": "固有状態",
                "effectTarget": "味方/ステッカー対象",
                "fixedValue": 8.0
              }
            ],
            "skillId": "Picora_favorite_1",
            "skillName": "愛用Lv1",
            "description": "一定時間、残りHP割合が最も低い味方3名にステッカーを貼り、HPを回復させる。\nステッカーは味方のHPを追加で回復させ、会心抵抗と物理防御力を増加させる。\nステッカーが貼られている間は、HPが継続的に回復する。\nこの効果は解除できない。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Picora_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Picora_favorite_3_e02",
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Picora_favorite_3_e03",
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Picora_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ピコラの魔法攻撃力、会心抵抗、会心ダメージ抵抗が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "ショッピングが大好き",
      "levels": {
        "1": {
          "name": "ショッピング王ピコラ",
          "stats": [],
          "effects": [
            {
              "skillId": "Picora_aside_1",
              "effectId": "Picora_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Picora_aside_1",
              "effectId": "Picora_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Picora_aside_1",
              "effectId": "Picora_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Picora_aside_1",
              "effectId": "Picora_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Picora_aside_1",
              "effectId": "Picora_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "ピコラのステッカーはオマケ！",
          "stats": [],
          "effects": [
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 20.0
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e02",
              "valueKind": "ステッカー対象数",
              "valueClass": "対象数",
              "effectType": "バフ",
              "effectTarget": "残りHP割合が最も低い味方",
              "targetSkill": "強化攻撃",
              "fixedValue": 2.0
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e08",
              "processGroupId": "Picora_aside_2_sticker_apply",
              "processOrder": 1.0,
              "valueKind": "ピコラのステッカー",
              "valueClass": "状態付与",
              "effectType": "固有状態",
              "triggerType": "強化攻撃終了時",
              "triggerSourceId": "普通攻撃_強化",
              "effectTarget": "残りHP割合が最も低い味方2名",
              "targetSkill": "強化攻撃"
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e03",
              "processGroupId": "Picora_aside_2_sticker_apply",
              "processOrder": 2.0,
              "valueKind": "ピコラのステッカー",
              "valueClass": "持続時間",
              "effectType": "固有状態",
              "triggerType": "強化攻撃終了時",
              "triggerSourceId": "普通攻撃_強化",
              "effectTarget": "残りHP割合が最も低い味方2名",
              "targetSkill": "強化攻撃",
              "fixedValue": 7.0
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e04",
              "processGroupId": "Picora_aside_2_sticker_heal",
              "processOrder": 1.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "固有状態付与時",
              "triggerValue": "ピコラのステッカー",
              "triggerSourceId": "Picora_aside_2_e08",
              "effectTarget": "ステッカー対象",
              "reference": "対象の最大HP",
              "fixedValue": 22.0
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e05",
              "processGroupId": "Picora_aside_2_sticker_heal",
              "processOrder": 2.0,
              "valueKind": "HP回復回数",
              "valueClass": "回数",
              "effectType": "回復",
              "triggerType": "固有状態付与時",
              "triggerValue": "ピコラのステッカー",
              "triggerSourceId": "Picora_aside_2_e08",
              "effectTarget": "ステッカー対象",
              "fixedValue": 2.0
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e06",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "conditionType": "固有状態中",
              "conditionValue": "Picora_aside_2_e08",
              "condition": "ステッカー時",
              "effectTarget": "ステッカー対象",
              "fixedValue": 30.0
            },
            {
              "skillId": "Picora_aside_2",
              "effectId": "Picora_aside_2_e07",
              "valueKind": "クールタイム減少",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 12.0
            }
          ],
          "description": "最大HPが増加する。\n強化攻撃後、一定時間、残りHP割合が最も低い味方2名にピコラのステッカーを貼る。\nピコラのステッカーはHPを2回回復させ、与ダメージ量を増加させる。\n高学年スキルのクールタイムが減少する。"
        },
        "3": {
          "name": "おしゃれピープル、集合！",
          "stats": [
            {
              "skillId": "Picora_aside_3_global",
              "effectId": "Picora_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 3.0
            },
            {
              "skillId": "Picora_aside_3_global",
              "effectId": "Picora_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Picora_aside_3_battle",
              "effectId": "Picora_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 7.5
            }
          ],
          "description": "味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "bigwood",
    "name": "ビッグウッド",
    "basic": {
      "rarity": 2.0,
      "personality": "純粋",
      "race": "精霊",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 80.0,
      "combatPowerCorrectionB": 0.185
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 5.0,
      "atkM": 0.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "BigWood_low_e01",
            "processGroupId": "BigWood_low_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 25.0,
              "2": 27.0,
              "3": 29.0,
              "4": 31.0,
              "5": 33.0,
              "6": 35.0,
              "7": 37.0,
              "8": 39.0,
              "9": 41.0,
              "10": 43.0,
              "11": 45.0,
              "12": 47.0
            }
          },
          {
            "effectId": "BigWood_low_e02",
            "processGroupId": "BigWood_low_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3.0
          }
        ],
        "skillId": "BigWood_low",
        "skillType": "低学年",
        "skillName": "環境保護",
        "description": "自身に魔法のシールドを生成する。"
      },
      {
        "effects": [
          {
            "effectId": "BigWood_high_e01",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "攻撃力",
            "levels": {
              "1": 375.0,
              "2": 390.0,
              "3": 405.0,
              "4": 420.0,
              "5": 435.0,
              "6": 450.0,
              "7": 465.0,
              "8": 480.0,
              "9": 495.0,
              "10": 510.0,
              "11": 525.0,
              "12": 540.0
            }
          },
          {
            "effectId": "BigWood_high_e02",
            "valueKind": "回復回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 3.0
          },
          {
            "effectId": "BigWood_high_e03",
            "valueKind": "挑発",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "BigWood_high_e04",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "BigWood_high",
        "skillType": "高学年",
        "skillName": "あたしを見て～",
        "description": "敵を挑発した後、HPを3回回復する。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "BigWood_passive_e01",
            "valueKind": "魔法被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0
            }
          }
        ],
        "skillId": "BigWood_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "魔法被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "BigWood_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "BigWood_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "拳を振るい、敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "BigWood_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 300.0
          },
          {
            "effectId": "BigWood_enhanced_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "BigWood_enhanced_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "BigWood_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で単体対象に拳を振り回し、物理ダメージを与え、気絶を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "pira",
    "name": "ピラ",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "竜族",
      "role": "支援",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 105.0,
      "combatPowerCorrectionB": 0.44
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 2.0,
      "atkM": 0.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Pira_low_e01",
            "valueKind": "物理ダメージ",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 270.0,
              "2": 285.0,
              "3": 300.0,
              "4": 315.0,
              "5": 330.0,
              "6": 345.0,
              "7": 360.0,
              "8": 375.0,
              "9": 390.0,
              "10": 405.0,
              "11": 420.0,
              "12": 435.0,
              "13": 450.0,
              "14": 465.0,
              "15": 480.0
            }
          },
          {
            "effectId": "Pira_low_e02",
            "valueKind": "攻撃速度減少",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 26.0,
              "2": 27.0,
              "3": 28.0,
              "4": 29.0,
              "5": 30.0,
              "6": 31.0,
              "7": 32.0,
              "8": 33.0,
              "9": 34.0,
              "10": 35.0,
              "11": 36.0,
              "12": 37.0,
              "13": 38.0,
              "14": 39.0,
              "15": 40.0
            }
          },
          {
            "effectId": "Pira_low_e03",
            "valueKind": "攻撃速度減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 7.0
          },
          {
            "effectId": "Pira_low_e04",
            "valueKind": "富豪獲得",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectStack": true,
            "maxStack": 30.0,
            "triggerType": "低学年スキル命中時",
            "triggerSourceId": "低学年スキル",
            "condition": "敵1体に命中するごとに",
            "effectTarget": "自身",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Pira_low",
        "skillType": "低学年",
        "skillName": "集金の時間や～！",
        "description": "像を破壊し、破片を飛び散らせて、命中した敵に範囲物理ダメージを与え、攻撃速度を減少させる。敵1体に命中するごとに一定回数富豪を獲得する。"
      },
      {
        "effects": [
          {
            "effectId": "Pira_high_e01",
            "valueKind": "富豪消費",
            "valueClass": "状態解除",
            "effectType": "固有状態",
            "triggerType": "高学年スキル終了時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年スキル終了時、富豪をランダムに消費",
            "effectTarget": "自身",
            "fixedValue": "1～30"
          },
          {
            "effectId": "Pira_high_e02",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "発動前リソーススタック範囲",
            "conditionValue": "Pira_wealth:0-29",
            "condition": "高学年開始時に富豪0～29スタック",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 675.0,
              "2": 702.0,
              "3": 729.0,
              "4": 756.0,
              "5": 783.0,
              "6": 810.0,
              "7": 837.0,
              "8": 864.0,
              "9": 891.0,
              "10": 918.0,
              "11": 945.0,
              "12": 972.0,
              "13": 999.0,
              "14": 1026.0,
              "15": 1053.0
            }
          },
          {
            "effectId": "Pira_high_e03",
            "valueKind": "会心増加",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "conditionType": "発動前リソーススタック範囲",
            "conditionValue": "Pira_wealth:0-29",
            "condition": "高学年開始時に富豪0～29スタック",
            "effectTarget": "味方全員",
            "fixedValue": 20.0
          },
          {
            "effectId": "Pira_high_e04",
            "valueKind": "会心増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "conditionType": "発動前リソーススタック範囲",
            "conditionValue": "Pira_wealth:0-29",
            "condition": "高学年開始時に富豪0～29スタック",
            "effectTarget": "味方全員",
            "fixedValue": 10.0
          },
          {
            "effectId": "Pira_high_e05",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "conditionType": "発動前リソーススタック",
            "conditionValue": "Pira_wealth:30",
            "condition": "高学年開始時に富豪30スタック",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 1350.0,
              "2": 1404.0,
              "3": 1458.0,
              "4": 1512.0,
              "5": 1566.0,
              "6": 1620.0,
              "7": 1674.0,
              "8": 1728.0,
              "9": 1782.0,
              "10": 1836.0,
              "11": 1890.0,
              "12": 1944.0,
              "13": 1998.0,
              "14": 2052.0,
              "15": 2106.0
            }
          },
          {
            "effectId": "Pira_high_e06",
            "valueKind": "会心増加",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "conditionType": "発動前リソーススタック",
            "conditionValue": "Pira_wealth:30",
            "condition": "高学年開始時に富豪30スタック",
            "effectTarget": "味方全員",
            "fixedValue": 40.0
          },
          {
            "effectId": "Pira_high_e07",
            "valueKind": "会心増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "conditionType": "発動前リソーススタック",
            "conditionValue": "Pira_wealth:30",
            "condition": "高学年開始時に富豪30スタック",
            "effectTarget": "味方全員",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Pira_high",
        "skillType": "高学年",
        "skillName": "フィーバー☆タイムや〜！",
        "description": "金の玉を降らせて敵に範囲物理ダメージを9回与え、味方全員の会心を増加させる。富豪を30スタック保有した状態でスキルを発動すると、物理ダメージと会心増加が強化される。\nスキル終了時、富豪をランダムに失う。",
        "cooldownSeconds": 30.0
      },
      {
        "effects": [
          {
            "effectId": "Pira_passive_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "リソース変化時",
            "triggerValue": "獲得時",
            "triggerSourceId": "Pira_wealth",
            "condition": "富豪獲得時",
            "effectTarget": "味方/後列",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0,
              "13": 22.0,
              "14": 23.0,
              "15": 24.0
            }
          },
          {
            "effectId": "Pira_passive_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "リソース変化時",
            "triggerValue": "獲得時",
            "triggerSourceId": "Pira_wealth",
            "condition": "富豪獲得時",
            "effectTarget": "味方/後列",
            "fixedValue": 5.0
          }
        ],
        "skillId": "Pira_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "富豪獲得時、後列の味方の攻撃力を増加させる。"
      },
      {
        "effects": [
          {
            "effectId": "Pira_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          },
          {
            "effectId": "Pira_basic_e02",
            "valueKind": "富豪獲得",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "effectStack": true,
            "maxStack": 30.0,
            "effectTarget": "自身",
            "reference": "Pira_wealth",
            "fixedValue": 1.0
          }
        ],
        "skillId": "Pira_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "名刺を投げつけ、敵に物理ダメージを与え、富豪を1スタック獲得する。"
      },
      {
        "effects": [
          {
            "effectId": "Pira_enhanced_e01",
            "valueKind": "富豪消費",
            "valueClass": "状態解除",
            "effectType": "固有状態",
            "effectTarget": "自身",
            "reference": "Pira_wealth",
            "fixedValue": "1～5"
          },
          {
            "effectId": "Pira_enhanced_e02",
            "valueKind": "1回あたり物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 125.0
          },
          {
            "effectId": "Pira_enhanced_e03",
            "valueKind": "被ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 22.0
          },
          {
            "effectId": "Pira_enhanced_e04",
            "valueKind": "被ダメージ量増加の持続時間",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Pira_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃ごとに富豪をランダムに消費し、名刺を2枚投げつける。名刺はランダムな敵に物理ダメージを与え、被ダメージ量を増加させる。\n富豪：30スタックに到達すると、高学年スキル効果が強化される。",
        "cooldownSeconds": 30.0,
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "uniqueStates": [
      {
        "stateId": "Pira_wealth",
        "name": "富豪",
        "category": "固有リソース",
        "valueType": "整数",
        "scope": "所有者単位",
        "initialValue": 0.0,
        "minValue": 0.0,
        "maxValue": 30.0,
        "step": 1.0,
        "capBehavior": "上限で打ち止め",
        "floorBehavior": "要調査",
        "dispelPolicy": "解除不能",
        "retention": "戦闘中",
        "changeEventBasis": "実際の増減時",
        "calculationSupportLevel": "未対応",
        "verificationStatus": "暫定",
        "notes": "強化攻撃・高学年終了時の消費不足処理は要調査",
        "ownerId": "pira"
      }
    ],
    "favoriteCard": {
      "name": "ピラの輝く名刺",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Pira_favorite_1_e01",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "富豪消費",
                "valueClass": "状態解除",
                "effectType": "固有状態",
                "effectTarget": "自身",
                "reference": "Pira_wealth",
                "fixedValue": "1～5"
              },
              {
                "effectId": "Pira_favorite_1_e02",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "1回あたり物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵",
                "fixedValue": 400.0
              },
              {
                "effectId": "Pira_favorite_1_e03",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "被ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "effectTarget": "敵",
                "fixedValue": 44.0
              },
              {
                "effectId": "Pira_favorite_1_e04",
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "被ダメージ量増加の持続時間",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "effectTarget": "敵",
                "fixedValue": 6.0
              }
            ],
            "skillId": "Pira_favorite_1",
            "skillName": "愛用Lv1",
            "description": "3回ごとに富豪をランダムに消費し、名刺を4枚投げつける。名刺はランダムな敵に物理ダメージを与え、被ダメージ量を増加させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Pira_favorite_3_e01",
                "targetSkill": "高学年",
                "valueKind": "クールタイム減少",
                "valueClass": "クールタイム",
                "effectType": "クールタイム",
                "effectTarget": "自身",
                "fixedValue": 5.0
              }
            ],
            "skillId": "Pira_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ピラの高学年スキルのクールタイムが5秒減少する。"
          }
        ]
      }
    },
    "aside": {
      "name": "キラキラ友情首飾り",
      "levels": {
        "1": {
          "name": "友情の証",
          "stats": [],
          "effects": [
            {
              "skillId": "Pira_aside_1",
              "effectId": "Pira_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Pira_aside_1",
              "effectId": "Pira_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Pira_aside_1",
              "effectId": "Pira_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Pira_aside_1",
              "effectId": "Pira_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Pira_aside_1",
              "effectId": "Pira_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "陽だまりの中で",
          "stats": [],
          "effects": [
            {
              "skillId": "Pira_aside_2",
              "effectId": "Pira_aside_2_e01",
              "valueKind": "会心率抵抗減少",
              "valueClass": "倍率",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 15.0
            },
            {
              "skillId": "Pira_aside_2",
              "effectId": "Pira_aside_2_e02",
              "valueKind": "会心率抵抗減少",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 8.0
            },
            {
              "skillId": "Pira_aside_2",
              "effectId": "Pira_aside_2_e03",
              "valueKind": "クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 12.0
            },
            {
              "skillId": "Pira_aside_2",
              "effectId": "Pira_aside_2_e04",
              "processGroupId": "Pira_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "高学年スキル終了時",
              "triggerSourceId": "高学年スキル",
              "effectTarget": "HP割合が最も低い味方3名",
              "targetSkill": "高学年スキル",
              "reference": "最大HP",
              "fixedValue": 45.0
            },
            {
              "skillId": "Pira_aside_2",
              "effectId": "Pira_aside_2_e05",
              "processGroupId": "Pira_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "高学年スキル終了時",
              "triggerSourceId": "高学年スキル",
              "effectTarget": "HP割合が最も低い味方3名",
              "targetSkill": "高学年スキル",
              "fixedValue": 35.0
            },
            {
              "skillId": "Pira_aside_2",
              "effectId": "Pira_aside_2_e06",
              "processGroupId": "Pira_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "会心ダメージ増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "高学年スキル終了時",
              "triggerSourceId": "高学年スキル",
              "effectTarget": "HP割合が最も低い味方3名",
              "targetSkill": "高学年スキル",
              "fixedValue": 15.0
            }
          ],
          "description": "低学年スキルが命中すると、攻撃した敵の会心率抵抗を減少させる。\n高学年スキルのクールタイムが減少する。\n高学年スキル使用後、残りHP割合が最も低い味方3名に景品を配る。景品を受け取った味方のHPを回復させ、会心ダメージを増加させる。"
        },
        "3": {
          "name": "キラキラなウチらの関係",
          "stats": [
            {
              "skillId": "Pira_aside_3_global",
              "effectId": "Pira_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            },
            {
              "skillId": "Pira_aside_3_global",
              "effectId": "Pira_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Pira_aside_3_battle",
              "effectId": "Pira_aside_3_battle_e01",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            },
            {
              "skillId": "Pira_aside_3_battle",
              "effectId": "Pira_aside_3_battle_e02",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            }
          ],
          "description": "味方全員の会心と会心ダメージを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "hilde",
    "name": "ヒルデ",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "エルフ",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 44.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.425
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 1.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 1.0,
      "critDmg": 1.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Hilde_low_e01",
            "valueKind": "ウエーブHP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/周囲",
            "reference": "自身最大HP",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0,
              "13": 22.0,
              "14": 23.0,
              "15": 24.0
            }
          },
          {
            "effectId": "Hilde_low_e02",
            "valueKind": "持続HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "conditionType": "対象HP割合未満",
            "conditionValue": 80.0,
            "effectTarget": "味方/残りHP割合が低い2名",
            "reference": "自身最大HP",
            "levels": {
              "1": 4.3,
              "2": 4.6,
              "3": 4.9,
              "4": 5.2,
              "5": 5.5,
              "6": 5.8,
              "7": 6.1,
              "8": 6.4,
              "9": 6.7,
              "10": 7.0,
              "11": 7.3,
              "12": 7.6,
              "13": 7.9,
              "14": 8.2,
              "15": 8.5
            }
          },
          {
            "effectId": "Hilde_low_e03",
            "valueKind": "持続HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "conditionType": "対象HP割合未満",
            "conditionValue": 80.0,
            "effectTarget": "味方/残りHP割合が低い2名",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Hilde_low",
        "skillType": "低学年",
        "skillName": "フィトンチッドウエーブ",
        "description": "周囲の味方全員を1回回復し、追加でHP80%未満の味方2名を継続回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Hilde_high_e01",
            "valueKind": "攻撃ごとの魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 340.0,
              "2": 370.0,
              "3": 400.0,
              "4": 430.0,
              "5": 460.0,
              "6": 490.0,
              "7": 520.0,
              "8": 550.0,
              "9": 580.0,
              "10": 610.0,
              "11": 640.0,
              "12": 670.0,
              "13": 700.0,
              "14": 730.0,
              "15": 760.0
            }
          },
          {
            "effectId": "Hilde_high_e02",
            "processGroupId": "Hilde_high_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方/範囲",
            "levels": {
              "1": 65.0,
              "2": 67.0,
              "3": 69.0,
              "4": 71.0,
              "5": 73.0,
              "6": 75.0,
              "7": 77.0,
              "8": 79.0,
              "9": 81.0,
              "10": 83.0,
              "11": 85.0,
              "12": 87.0,
              "13": 89.0,
              "14": 91.0,
              "15": 93.0
            }
          },
          {
            "effectId": "Hilde_high_e03",
            "processGroupId": "Hilde_high_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "味方/範囲",
            "levels": {
              "1": 7.0,
              "2": 7.25,
              "3": 7.5,
              "4": 7.75,
              "5": 8.0,
              "6": 8.25,
              "7": 8.5,
              "8": 8.75,
              "9": 9.0,
              "10": 9.25,
              "11": 9.5,
              "12": 9.75,
              "13": 10.0,
              "14": 10.25,
              "15": 10.5
            }
          }
        ],
        "skillId": "Hilde_high",
        "skillType": "高学年",
        "skillName": "過剰医療",
        "description": "敵に範囲魔法ダメージを与え、範囲内の味方を巨大化させ、攻撃速度を増加させる。",
        "cooldownSeconds": 36.0
      },
      {
        "effects": [
          {
            "effectId": "Hilde_passive_e01",
            "valueKind": "状態異常解除",
            "valueClass": "状態解除",
            "effectType": "回復",
            "effectTarget": "味方/指定範囲内1人"
          },
          {
            "effectId": "Hilde_passive_e02",
            "valueKind": "クールタイム",
            "valueClass": "クールタイム",
            "effectType": "回復",
            "effectTarget": "味方/指定範囲内1人",
            "levels": {
              "1": 23.0,
              "2": 22.0,
              "3": 21.0,
              "4": 20.0,
              "5": 19.0,
              "6": 18.0,
              "7": 17.0,
              "8": 16.0,
              "9": 15.0,
              "10": 14.0,
              "11": 13.0,
              "12": 12.0,
              "13": 11.0,
              "14": 10.0,
              "15": 9.0
            }
          }
        ],
        "skillId": "Hilde_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "指定範囲内の味方1人の状態異常を全て解除する。"
      },
      {
        "effects": [
          {
            "effectId": "Hilde_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Hilde_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "銃型注射器を発射して敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Hilde_enhanced_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/HP割合最低",
            "reference": "自身最大HP",
            "fixedValue": 20.0
          }
        ],
        "skillId": "Hilde_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃の代わりに、HP割合が最も少ない味方のHPを回復する。",
        "triggerType": "n回ごと",
        "triggerValue": 3.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "温泉のヒルデ",
      "levels": {
        "1": {
          "name": "自己治療",
          "stats": [],
          "effects": [
            {
              "skillId": "Hilde_aside_1",
              "effectId": "Hilde_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Hilde_aside_1",
              "effectId": "Hilde_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Hilde_aside_1",
              "effectId": "Hilde_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Hilde_aside_1",
              "effectId": "Hilde_aside_1_e04",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Hilde_aside_1",
              "effectId": "Hilde_aside_1_e05",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "医療従事者保護法",
          "stats": [],
          "effects": [
            {
              "skillId": "Hilde_aside_2",
              "effectId": "Hilde_aside_2_e01",
              "processGroupId": "Hilde_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "回復時",
              "triggerSourceId": "普通攻撃_強化",
              "condition": "強化攻撃で回復時",
              "effectTarget": "味方/強化攻撃回復対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 60.0
            },
            {
              "skillId": "Hilde_aside_2",
              "effectId": "Hilde_aside_2_e02",
              "processGroupId": "Hilde_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "回復時",
              "triggerSourceId": "普通攻撃_強化",
              "condition": "強化攻撃で回復時",
              "effectTarget": "味方/強化攻撃回復対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 6.0
            },
            {
              "skillId": "Hilde_aside_2",
              "effectId": "Hilde_aside_2_e03",
              "valueKind": "強化攻撃HP回復倍率",
              "valueClass": "倍率",
              "effectType": "回復",
              "effectTarget": "味方/強化攻撃回復対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 2.0
            }
          ],
          "description": "強化攻撃の回復対象の攻撃速度を増加させ、強化攻撃のHP回復割合が2倍になる。"
        },
        "3": {
          "name": "温泉の効能",
          "stats": [
            {
              "skillId": "Hilde_aside_3_global",
              "effectId": "Hilde_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Hilde_aside_3_global",
              "effectId": "Hilde_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Hilde_aside_3_battle",
              "effectId": "Hilde_aside_3_battle_e01",
              "valueKind": "魔法被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 10.5
            }
          ],
          "description": "味方全員の敵からの魔法被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "festa",
    "name": "フェスタ",
    "basic": {
      "rarity": 2.0,
      "personality": "憂鬱",
      "race": "エルフ",
      "role": "支援",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 80.0,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 5.0,
      "atkM": 0.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Festa_low_e01",
            "valueKind": "与ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 50.0
          },
          {
            "effectId": "Festa_low_e02",
            "valueKind": "ノイズ",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 4.0,
              "2": 4.3,
              "3": 4.6,
              "4": 4.9,
              "5": 5.2,
              "6": 5.5,
              "7": 5.8,
              "8": 6.1,
              "9": 6.4,
              "10": 6.7,
              "11": 7.0,
              "12": 7.3
            }
          },
          {
            "effectId": "Festa_low_e03",
            "valueKind": "バフ解除",
            "valueClass": "解除",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          }
        ],
        "skillId": "Festa_low",
        "skillType": "低学年",
        "skillName": "ロックンピース！",
        "description": "ロックを演奏し、範囲内の対象にノイズを付与し、対象にかかっているバフを解除する。"
      },
      {
        "effects": [
          {
            "effectId": "Festa_high_e01",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時（赤い照明）",
            "effectTarget": "自身",
            "fixedValue": 10.0,
            "levels": {
              "1": 25.0,
              "2": 26.0,
              "3": 27.0,
              "4": 28.0,
              "5": 29.0,
              "6": 30.0,
              "7": 31.0,
              "8": 32.0,
              "9": 33.0,
              "10": 34.0,
              "11": 35.0,
              "12": 36.0
            }
          },
          {
            "effectId": "Festa_high_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時（緑の照明）",
            "effectTarget": "自身",
            "fixedValue": 10.0,
            "levels": {
              "1": 50.0,
              "2": 52.0,
              "3": 54.0,
              "4": 56.0,
              "5": 58.0,
              "6": 60.0,
              "7": 62.0,
              "8": 64.0,
              "9": 66.0,
              "10": 68.0,
              "11": 70.0,
              "12": 72.0
            }
          },
          {
            "effectId": "Festa_high_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時（青い照明）",
            "effectTarget": "自身",
            "fixedValue": 10.0,
            "levels": {
              "1": 30.0,
              "2": 31.0,
              "3": 32.0,
              "4": 33.0,
              "5": 34.0,
              "6": 35.0,
              "7": 36.0,
              "8": 37.0,
              "9": 38.0,
              "10": 39.0,
              "11": 40.0,
              "12": 41.0
            }
          }
        ],
        "skillId": "Festa_high",
        "skillType": "高学年",
        "skillName": "スポットライト",
        "description": "フェスタに3つの照明を当て、照明の色に応じて異なる効果を付与する。",
        "cooldownSeconds": 20.0
      },
      {
        "effects": [
          {
            "effectId": "Festa_passive_e01",
            "valueKind": "基本攻撃与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 32.0,
              "3": 34.0,
              "4": 36.0,
              "5": 38.0,
              "6": 40.0,
              "7": 42.0,
              "8": 44.0,
              "9": 46.0,
              "10": 48.0,
              "11": 50.0,
              "12": 52.0
            }
          }
        ],
        "skillId": "Festa_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃のダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Festa_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          }
        ],
        "skillId": "Festa_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "ギターで敵を叩きつけ物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "blanchet",
    "name": "ブランセ",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "精霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.345
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 5.0,
      "critDmg": 5.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Blanchet_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 280.0,
              "2": 308.0,
              "3": 336.0,
              "4": 364.0,
              "5": 392.0,
              "6": 420.0,
              "7": 448.0,
              "8": 476.0,
              "9": 504.0,
              "10": 532.0,
              "11": 560.0,
              "12": 588.0,
              "13": 616.0,
              "14": 644.0,
              "15": 672.0
            }
          },
          {
            "effectId": "Blanchet_low_e02",
            "valueKind": "最後の一撃の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 420.0,
              "2": 462.0,
              "3": 504.0,
              "4": 546.0,
              "5": 588.0,
              "6": 630.0,
              "7": 672.0,
              "8": 714.0,
              "9": 756.0,
              "10": 798.0,
              "11": 840.0,
              "12": 882.0,
              "13": 924.0,
              "14": 966.0,
              "15": 1008.0
            }
          },
          {
            "effectId": "Blanchet_low_e03",
            "valueKind": "最大跳ね返り回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Blanchet_low",
        "skillType": "低学年",
        "skillName": "シンクローズ",
        "description": "敵に最大3回跳ね返るシンクローズを投げつけ、魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Blanchet_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 480.0,
              "2": 528.0,
              "3": 576.0,
              "4": 624.0,
              "5": 672.0,
              "6": 720.0,
              "7": 768.0,
              "8": 816.0,
              "9": 864.0,
              "10": 912.0,
              "11": 960.0,
              "12": 1008.0,
              "13": 1056.0,
              "14": 1104.0,
              "15": 1152.0
            }
          },
          {
            "effectId": "Blanchet_high_e02",
            "valueKind": "最後の一撃の総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 720.0,
              "2": 792.0,
              "3": 864.0,
              "4": 936.0,
              "5": 1008.0,
              "6": 1080.0,
              "7": 1152.0,
              "8": 1224.0,
              "9": 1296.0,
              "10": 1368.0,
              "11": 1440.0,
              "12": 1512.0,
              "13": 1584.0,
              "14": 1656.0,
              "15": 1728.0
            }
          },
          {
            "effectId": "Blanchet_high_e03",
            "valueKind": "シンクローズ",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Blanchet_high_e04",
            "valueKind": "確定会心",
            "valueClass": "条件",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Blanchet_high_e05",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Blanchet_high_e06",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Blanchet_high",
        "skillType": "高学年",
        "skillName": "青い鳥の花園",
        "description": "敵にシンクローズを3回放つ。最後の一撃は確定会心範囲ダメージを与え、全攻撃が沈黙を付与する。",
        "cooldownSeconds": 20.0
      },
      {
        "effects": [
          {
            "effectId": "Blanchet_passive_e01",
            "valueKind": "スキルダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 23.0,
              "3": 26.0,
              "4": 29.0,
              "5": 32.0,
              "6": 35.0,
              "7": 38.0,
              "8": 41.0,
              "9": 44.0,
              "10": 47.0,
              "11": 50.0,
              "12": 53.0,
              "13": 56.0,
              "14": 59.0,
              "15": 62.0
            }
          },
          {
            "effectId": "Blanchet_passive_e02",
            "valueKind": "沈黙",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "effectTarget": "自身"
          }
        ],
        "skillId": "Blanchet_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "スキルダメージ量が増加し、沈黙に免疫を得る。"
      },
      {
        "effects": [
          {
            "effectId": "Blanchet_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Blanchet_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "青い薔薇を飛ばして敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Blanchet_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 180.0
          },
          {
            "effectId": "Blanchet_enhanced_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Blanchet_enhanced_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Blanchet_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で青い薔薇を飛ばして敵に魔法ダメージを与え、苦痛を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {
      "name": "ブランセの花束",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Blanchet_favorite_1_e01",
                "processGroupId": "Blanchet_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "低学年",
                "targetSkillName": "シンクローズ・ブロッサム",
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25.0,
                "effectTarget": "敵",
                "levels": {
                  "1": 280.0,
                  "2": 308.0,
                  "3": 336.0,
                  "4": 364.0,
                  "5": 392.0,
                  "6": 420.0,
                  "7": 448.0,
                  "8": 476.0,
                  "9": 504.0,
                  "10": 532.0,
                  "11": 560.0,
                  "12": 588.0
                }
              },
              {
                "effectId": "Blanchet_favorite_1_e02",
                "processGroupId": "Blanchet_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "低学年",
                "targetSkillName": "シンクローズ・ブロッサム",
                "valueKind": "最後の一撃の魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25.0,
                "effectTarget": "敵",
                "levels": {
                  "1": 420.0,
                  "2": 462.0,
                  "3": 504.0,
                  "4": 546.0,
                  "5": 588.0,
                  "6": 630.0,
                  "7": 672.0,
                  "8": 714.0,
                  "9": 756.0,
                  "10": 798.0,
                  "11": 840.0,
                  "12": 882.0
                }
              },
              {
                "effectId": "Blanchet_favorite_1_e03",
                "processGroupId": "Blanchet_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "低学年",
                "targetSkillName": "シンクローズ・ブロッサム",
                "valueKind": "強化シンクローズの魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25.0,
                "effectTarget": "敵",
                "levels": {
                  "1": 340.0,
                  "2": 374.0,
                  "3": 408.0,
                  "4": 442.0,
                  "5": 476.0,
                  "6": 510.0,
                  "7": 544.0,
                  "8": 578.0,
                  "9": 612.0,
                  "10": 646.0,
                  "11": 680.0,
                  "12": 714.0
                }
              },
              {
                "effectId": "Blanchet_favorite_1_e04",
                "processGroupId": "Blanchet_favorite_1_proc01",
                "processOrder": 4.0,
                "targetSkill": "低学年",
                "targetSkillName": "シンクローズ・ブロッサム",
                "valueKind": "強化シンクローズの最後の一撃の魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25.0,
                "effectTarget": "敵",
                "levels": {
                  "1": 510.0,
                  "2": 561.0,
                  "3": 612.0,
                  "4": 663.0,
                  "5": 714.0,
                  "6": 765.0,
                  "7": 816.0,
                  "8": 867.0,
                  "9": 918.0,
                  "10": 969.0,
                  "11": 1020.0,
                  "12": 1071.0
                }
              },
              {
                "effectId": "Blanchet_favorite_1_e05",
                "processGroupId": "Blanchet_favorite_1_proc01",
                "processOrder": 5.0,
                "targetSkill": "低学年",
                "targetSkillName": "シンクローズ・ブロッサム",
                "valueKind": "強化シンクローズ発動確率",
                "valueClass": "倍率",
                "effectType": "条件",
                "triggerType": "一定確率",
                "triggerValue": 25.0,
                "effectTarget": "自身",
                "fixedValue": 75.0
              },
              {
                "effectId": "Blanchet_favorite_1_e06",
                "processGroupId": "Blanchet_favorite_1_proc01",
                "processOrder": 6.0,
                "targetSkill": "低学年",
                "targetSkillName": "シンクローズ・ブロッサム",
                "valueKind": "強化シンクローズ発動回数",
                "valueClass": "回数",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25.0,
                "effectTarget": "敵",
                "fixedValue": 2.0
              }
            ],
            "skillId": "Blanchet_favorite_1",
            "skillName": "愛用Lv1",
            "description": "最大3回跳ね返り、敵に魔法ダメージを与えるシンクローズを放つ。\n一定確率で強化されたシンクローズを2回放つ。\nシンクローズは攻撃していない対象を優先して攻撃する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Blanchet_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Blanchet_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Blanchet_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Blanchet_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ブランセの魔法攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "百万本の青い薔薇",
      "levels": {
        "1": {
          "name": "満開の青い薔薇",
          "stats": [],
          "effects": [
            {
              "skillId": "Blanchet_aside_1",
              "effectId": "Blanchet_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Blanchet_aside_1",
              "effectId": "Blanchet_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Blanchet_aside_1",
              "effectId": "Blanchet_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Blanchet_aside_1",
              "effectId": "Blanchet_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "咲きほこる百万本の花",
          "stats": [],
          "effects": [
            {
              "skillId": "Blanchet_aside_2",
              "effectId": "Blanchet_aside_2_e01",
              "valueKind": "強化攻撃ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "effectTarget": "自身",
              "targetSkill": "強化攻撃",
              "fixedValue": 240.0
            },
            {
              "skillId": "Blanchet_aside_2",
              "effectId": "Blanchet_aside_2_e02",
              "valueKind": "強化攻撃の対象追加",
              "valueClass": "対象数",
              "effectType": "対象数",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "effectTarget": "ランダムな敵",
              "targetSkill": "強化攻撃",
              "fixedValue": 1.0
            },
            {
              "skillId": "Blanchet_aside_2",
              "effectId": "Blanchet_aside_2_e03",
              "valueKind": "マーク爆発ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "effectTarget": "敵",
              "targetSkill": "強化攻撃",
              "fixedValue": 700.0
            },
            {
              "skillId": "Blanchet_aside_2",
              "effectId": "Blanchet_aside_2_e04",
              "valueKind": "マーク1スタックごとにダメージ追加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "maxStack": 10.0,
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "effectTarget": "敵",
              "targetSkill": "強化攻撃",
              "fixedValue": 16.0
            }
          ],
          "description": "強化攻撃のダメージ量が増加し、強化攻撃の目標対象にランダムな敵が追加される。\n高学年スキルが変化する。シンクローズがマークを付与し、最後の一撃時に爆発して魔法ダメージを与える。スタックしたマーク数に応じて爆発ダメージが追加される。"
        },
        "3": {
          "name": "青い花の香りの力",
          "stats": [
            {
              "skillId": "Blanchet_aside_3_global",
              "effectId": "Blanchet_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Blanchet_aside_3_global",
              "effectId": "Blanchet_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Blanchet_aside_3_battle",
              "effectId": "Blanchet_aside_3_battle_e01",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            },
            {
              "skillId": "Blanchet_aside_3_battle",
              "effectId": "Blanchet_aside_3_battle_e02",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            }
          ],
          "description": "味方全員の会心と会心ダメージを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "fricle",
    "name": "フリックル",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "魔女",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 20.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.335
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Fricle_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0,
              "13": 660.0,
              "14": 690.0,
              "15": 720.0
            }
          },
          {
            "effectId": "Fricle_low_e02",
            "processGroupId": "Fricle_low_proc01",
            "processOrder": 1.0,
            "valueKind": "魔法ダメージ(1回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "生成物消滅時",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 60.0
          },
          {
            "effectId": "Fricle_low_e03",
            "processGroupId": "Fricle_low_proc01",
            "processOrder": 2.0,
            "valueKind": "魔法ダメージ(2回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "生成物消滅時",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 120.0
          }
        ],
        "skillId": "Fricle_low",
        "skillType": "低学年",
        "skillName": "スティンギングゲートキーパー",
        "description": "敵に範囲魔法ダメージを与え、召喚された棘の触手を全て消滅させる。 この棘の触手は、消滅時、敵により大きなダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Fricle_high_e01",
            "valueKind": "毎秒魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "近い敵3体",
            "levels": {
              "1": 70.0,
              "2": 80.0,
              "3": 90.0,
              "4": 100.0,
              "5": 110.0,
              "6": 120.0,
              "7": 130.0,
              "8": 140.0,
              "9": 150.0,
              "10": 160.0,
              "11": 170.0,
              "12": 180.0,
              "13": 190.0,
              "14": 200.0,
              "15": 210.0
            }
          },
          {
            "effectId": "Fricle_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "持続時間",
            "effectType": "攻撃",
            "effectTarget": "近い敵3体",
            "fixedValue": 5.0
          },
          {
            "effectId": "Fricle_high_e03",
            "valueKind": "バインド",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "近い敵3体"
          },
          {
            "effectId": "Fricle_high_e04",
            "valueKind": "バインド",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "近い敵3体",
            "fixedValue": 5.0
          },
          {
            "effectId": "Fricle_high_e05",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "近い敵3体"
          },
          {
            "effectId": "Fricle_high_e06",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "近い敵3体",
            "fixedValue": 7.0
          },
          {
            "effectId": "Fricle_high_e07",
            "valueKind": "棘の触手召喚",
            "valueClass": "召喚",
            "effectType": "召喚",
            "triggerType": "生成物生成時",
            "triggerSourceId": "Fricle_high_vine",
            "condition": "棘の蔓生成時",
            "effectTarget": "敵",
            "fixedValue": 1.0
          }
        ],
        "skillId": "Fricle_high",
        "skillType": "高学年",
        "skillName": "ガードオブトーチャー",
        "description": "棘の蔓で最も近くにいる敵3名を5秒間縛り付け、魔法ダメージを与え、バインド、沈黙を付与する。 棘の蔓生成時、敵に棘の触手を1体召喚する。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Fricle_passive_e01",
            "valueKind": "対狂気与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "conditionType": "敵性格",
            "conditionValue": "狂気",
            "condition": "狂気性格攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 40.0,
              "2": 44.0,
              "3": 48.0,
              "4": 52.0,
              "5": 56.0,
              "6": 60.0,
              "7": 64.0,
              "8": 68.0,
              "9": 72.0,
              "10": 76.0,
              "11": 80.0,
              "12": 84.0,
              "13": 88.0,
              "14": 92.0,
              "15": 96.0
            }
          }
        ],
        "skillId": "Fricle_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "狂気の敵へのダメージが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Fricle_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Fricle_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "追跡する蔓を発射し、敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Fricle_enhanced_e01",
            "valueKind": "棘の触手召喚",
            "valueClass": "召喚",
            "effectType": "召喚",
            "effectTarget": "敵",
            "fixedValue": 1.0
          },
          {
            "effectId": "Fricle_enhanced_e02",
            "valueKind": "召喚獣魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "近くの敵",
            "fixedValue": 15.0
          },
          {
            "effectId": "Fricle_enhanced_e03",
            "processGroupId": "Fricle_enhanced_proc01",
            "processOrder": 1.0,
            "valueKind": "魔法ダメージ(1回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "生成物消滅時",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 30.0
          },
          {
            "effectId": "Fricle_enhanced_e04",
            "processGroupId": "Fricle_enhanced_proc01",
            "processOrder": 2.0,
            "valueKind": "魔法ダメージ(2回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "生成物消滅時",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Fricle_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で棘の触手を召喚する。 棘の触手は消滅するまで、近くの敵を攻撃する。 棘の触手は消滅時、前後方向に範囲攻撃を放つ。",
        "triggerType": "一定確率",
        "triggerValue": 33.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "上級魔女ピコラ",
      "levels": {
        "1": {
          "name": "我が愛弟子ピコラ",
          "stats": [],
          "effects": [
            {
              "skillId": "Fricle_aside_1",
              "effectId": "Fricle_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Fricle_aside_1",
              "effectId": "Fricle_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Fricle_aside_1",
              "effectId": "Fricle_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Fricle_aside_1",
              "effectId": "Fricle_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "魔女の力はすごかった！",
          "stats": [],
          "effects": [
            {
              "skillId": "Fricle_aside_2",
              "effectId": "Fricle_aside_2_e01",
              "valueKind": "強化攻撃ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "強化攻撃",
              "condition": "強化攻撃使用時",
              "targetSkill": "強化攻撃",
              "fixedValue": 100.0
            },
            {
              "skillId": "Fricle_aside_2",
              "effectId": "Fricle_aside_2_e02",
              "valueKind": "強化攻撃発動確率増加",
              "valueClass": "倍率",
              "effectType": "パッシブ",
              "effectTarget": "自身",
              "targetSkill": "強化攻撃",
              "fixedValue": 7.5
            },
            {
              "skillId": "Fricle_aside_2",
              "effectId": "Fricle_aside_2_e03",
              "valueKind": "敵防御力減少",
              "valueClass": "倍率",
              "effectType": "デバフ",
              "effectTarget": "近い敵3体",
              "targetSkill": "高学年スキル",
              "fixedValue": 30.0
            },
            {
              "skillId": "Fricle_aside_2",
              "effectId": "Fricle_aside_2_e04",
              "valueKind": "敵防御力減少",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectTarget": "近い敵3体",
              "targetSkill": "高学年スキル",
              "fixedValue": 7.0
            }
          ],
          "description": "強化攻撃で召喚した触手のダメージが2倍になり、発動確率が増加する。高学年スキルに防御力減少効果が追加される。"
        },
        "3": {
          "name": "師匠フリックルの教え",
          "stats": [
            {
              "skillId": "Fricle_aside_3_global",
              "effectId": "Fricle_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            },
            {
              "skillId": "Fricle_aside_3_global",
              "effectId": "Fricle_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Fricle_aside_3_battle",
              "effectId": "Fricle_aside_3_battle_e01",
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "回復",
              "effectTarget": "味方/中列",
              "fixedValue": 4.0
            }
          ],
          "description": "中列の味方の1秒ごとのSP回復量を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "haley",
    "name": "ヘイリー",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "エルフ",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Haley_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 316.8,
              "2": 346.5,
              "3": 376.2,
              "4": 405.9,
              "5": 435.6,
              "6": 465.3,
              "7": 495.0,
              "8": 524.7,
              "9": 554.4,
              "10": 584.1,
              "11": 613.8,
              "12": 643.5,
              "13": 673.2,
              "14": 702.9,
              "15": 732.6
            }
          },
          {
            "effectId": "Haley_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Haley_low_e03",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "命中した敵"
          },
          {
            "effectId": "Haley_low_e04",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "命中した敵",
            "fixedValue": 5.0
          }
        ],
        "skillId": "Haley_low",
        "skillType": "低学年",
        "skillName": "受け入れ難い人物",
        "description": "鞭を3回振り回して敵に範囲物理ダメージを与え、命中した敵全員に一定確率で苦痛を付与する。 敵が苦痛、火傷、毒状態の場合、対象にかかった状態異常の種類数に応じてより大きなダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Haley_high_e01",
            "valueKind": "毎秒物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 58.0,
              "2": 63.8,
              "3": 69.6,
              "4": 75.4,
              "5": 81.2,
              "6": 87.0,
              "7": 92.8,
              "8": 98.6,
              "9": 104.4,
              "10": 110.2,
              "11": 116.0,
              "12": 121.8,
              "13": 127.6,
              "14": 133.4,
              "15": 139.2
            }
          },
          {
            "effectId": "Haley_high_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "持続時間",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 7.0
          },
          {
            "effectId": "Haley_high_e03",
            "valueKind": "目隠し",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Haley_high_e04",
            "valueKind": "目隠し",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 10.0
          }
        ],
        "skillId": "Haley_high",
        "skillType": "高学年",
        "skillName": "プランB",
        "description": "敵に煙幕地帯を残す爆弾を発射し、範囲物理持続ダメージを与え目隠しを付与する。",
        "cooldownSeconds": 32.0
      },
      {
        "effects": [
          {
            "effectId": "Haley_passive_e01",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "conditionType": "対象状態",
            "conditionValue": "苦痛",
            "condition": "対象苦痛状態時",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 23.0,
              "3": 26.0,
              "4": 29.0,
              "5": 32.0,
              "6": 35.0,
              "7": 38.0,
              "8": 41.0,
              "9": 44.0,
              "10": 47.0,
              "11": 50.0,
              "12": 53.0,
              "13": 56.0,
              "14": 59.0,
              "15": 62.0
            }
          },
          {
            "effectId": "Haley_passive_e02",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "conditionType": "対象状態",
            "conditionValue": "火傷",
            "condition": "対象火傷状態時",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 23.0,
              "3": 26.0,
              "4": 29.0,
              "5": 32.0,
              "6": 35.0,
              "7": 38.0,
              "8": 41.0,
              "9": 44.0,
              "10": 47.0,
              "11": 50.0,
              "12": 53.0,
              "13": 56.0,
              "14": 59.0,
              "15": 62.0
            }
          },
          {
            "effectId": "Haley_passive_e03",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "conditionType": "対象状態",
            "conditionValue": "毒",
            "condition": "対象毒状態時",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 23.0,
              "3": 26.0,
              "4": 29.0,
              "5": 32.0,
              "6": 35.0,
              "7": 38.0,
              "8": 41.0,
              "9": 44.0,
              "10": 47.0,
              "11": 50.0,
              "12": 53.0,
              "13": 56.0,
              "14": 59.0,
              "15": 62.0
            }
          }
        ],
        "skillId": "Haley_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "敵が苦痛、火傷、毒状態の場合、状態異常の種類数に応じてダメージが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Haley_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 85.0
          }
        ],
        "skillId": "Haley_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵に鞭を振るい、範囲物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Haley_enhanced_e01",
            "processGroupId": "Haley_enhanced_proc01",
            "processOrder": 1.0,
            "valueKind": "物理攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 20.0
          },
          {
            "effectId": "Haley_enhanced_e02",
            "processGroupId": "Haley_enhanced_proc01",
            "processOrder": 2.0,
            "valueKind": "物理攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Haley_enhanced_e03",
            "processGroupId": "Haley_enhanced_proc01",
            "processOrder": 3.0,
            "valueKind": "魔法防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 40.0
          },
          {
            "effectId": "Haley_enhanced_e04",
            "processGroupId": "Haley_enhanced_proc01",
            "processOrder": 4.0,
            "valueKind": "魔法防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Haley_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに鞭を整える。 一定時間、物理攻撃力が増加し、魔法防御力が増加する。",
        "triggerType": "n回ごと",
        "triggerValue": 4.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "宇宙船艦",
      "levels": {
        "1": {
          "name": "宇宙船艦ヘイリー",
          "stats": [],
          "effects": [
            {
              "skillId": "Haley_aside_1",
              "effectId": "Haley_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Haley_aside_1",
              "effectId": "Haley_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Haley_aside_1",
              "effectId": "Haley_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Haley_aside_1",
              "effectId": "Haley_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "地球をフライバイ",
          "stats": [],
          "effects": [
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e01",
              "processGroupId": "Haley_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Haley_enhanced_e01",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く味方使徒/中列",
              "fixedValue": 32.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e02",
              "processGroupId": "Haley_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "攻撃力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Haley_enhanced_e01",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く味方使徒/中列",
              "fixedValue": 6.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e03",
              "processGroupId": "Haley_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Haley_enhanced_e01",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く味方使徒/中列",
              "fixedValue": 16.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e04",
              "processGroupId": "Haley_aside_2_proc01",
              "processOrder": 4.0,
              "valueKind": "防御力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "リソース変化時",
              "triggerValue": "獲得時",
              "triggerSourceId": "Haley_enhanced_e01",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く味方使徒/中列",
              "fixedValue": 6.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e05",
              "valueKind": "苦痛",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "triggerType": "低学年スキル最終ヒット命中時",
              "condition": "低学年スキルの最後の一撃",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e06",
              "valueKind": "苦痛",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "低学年スキル最終ヒット命中時",
              "condition": "低学年スキルの最後の一撃",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 5.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e07",
              "valueKind": "軍艦召喚",
              "valueClass": "召喚",
              "effectType": "召喚",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル"
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e08",
              "processGroupId": "Haley_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "砲弾総物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "生成物攻撃時",
              "triggerSourceId": "Haley_high_battleship",
              "condition": "軍艦召喚時",
              "effectTarget": "前方の敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 2250.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e09",
              "processGroupId": "Haley_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "砲弾物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "生成物攻撃時",
              "triggerSourceId": "Haley_high_battleship",
              "condition": "軍艦召喚時",
              "effectTarget": "前方の敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 375.0
            },
            {
              "skillId": "Haley_aside_2",
              "effectId": "Haley_aside_2_e10",
              "processGroupId": "Haley_aside_2_proc02",
              "processOrder": 3.0,
              "valueKind": "砲弾数",
              "valueClass": "ヒット数",
              "effectType": "攻撃",
              "triggerType": "生成物攻撃時",
              "triggerSourceId": "Haley_high_battleship",
              "condition": "軍艦召喚時",
              "effectTarget": "前方の敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 6.0
            }
          ],
          "description": "強化攻撃バフの獲得時、自身を除く中列の味方使徒の攻撃力と防御力を増加させる。\n低学年スキルの最後の一撃に確定で苦痛を付与する。\n高学年スキル使用時、軍艦が召喚される。軍艦は前方の敵に砲弾を6発降らせ、範囲物理ダメージを与える。"
        },
        "3": {
          "name": "味方基地防衛作戦",
          "stats": [
            {
              "skillId": "Haley_aside_3_global",
              "effectId": "Haley_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3.0
            },
            {
              "skillId": "Haley_aside_3_global",
              "effectId": "Haley_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Haley_aside_3_battle",
              "effectId": "Haley_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全員",
              "fixedValue": 7.5
            }
          ],
          "description": "味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "beni",
    "name": "ベニー",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 80.0,
      "combatPowerCorrectionB": 0.2
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 5.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Beni_low_e01",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "攻撃力",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0
            }
          },
          {
            "effectId": "Beni_low_e02",
            "processGroupId": "Beni_low_proc01",
            "processOrder": 1.0,
            "valueKind": "会心率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "Beni_low",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "levels": {
              "1": 16.0,
              "2": 16.4,
              "3": 16.8,
              "4": 17.2,
              "5": 17.6,
              "6": 18.0,
              "7": 18.4,
              "8": 18.8,
              "9": 19.2,
              "10": 19.6,
              "11": 20.0,
              "12": 20.4
            }
          },
          {
            "effectId": "Beni_low_e03",
            "processGroupId": "Beni_low_proc01",
            "processOrder": 2.0,
            "valueKind": "会心ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "Beni_low",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "levels": {
              "1": 60.0,
              "2": 64.0,
              "3": 68.0,
              "4": 72.0,
              "5": 76.0,
              "6": 80.0,
              "7": 84.0,
              "8": 88.0,
              "9": 92.0,
              "10": 96.0,
              "11": 100.0,
              "12": 104.0
            }
          },
          {
            "effectId": "Beni_low_e04",
            "processGroupId": "Beni_low_proc01",
            "processOrder": 3.0,
            "valueKind": "会心率増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "Beni_low",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "fixedValue": 8.0
          },
          {
            "effectId": "Beni_low_e05",
            "processGroupId": "Beni_low_proc01",
            "processOrder": 4.0,
            "valueKind": "会心ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "Beni_low",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Beni_low",
        "skillType": "低学年",
        "skillName": "魚ウマウマ",
        "description": "魚を食べてHPを回復する。追加で会心率と会心ダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Beni_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 660.0,
              "2": 726.0,
              "3": 792.0,
              "4": 858.0,
              "5": 924.0,
              "6": 990.0,
              "7": 1056.0,
              "8": 1122.0,
              "9": 1188.0,
              "10": 1254.0,
              "11": 1320.0,
              "12": 1386.0
            }
          },
          {
            "effectId": "Beni_high_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Beni_high_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Beni_high",
        "skillType": "高学年",
        "skillName": "ぶった切るよ～！",
        "description": "斧で地面を叩きつけ、範囲物理ダメージを与え、気絶を付与する。",
        "cooldownSeconds": 58.0
      },
      {
        "effects": [
          {
            "effectId": "Beni_passive_e01",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 6.0,
              "2": 7.0,
              "3": 8.0,
              "4": 9.0,
              "5": 10.0,
              "6": 11.0,
              "7": 12.0,
              "8": 13.0,
              "9": 14.0,
              "10": 15.0,
              "11": 16.0,
              "12": 17.0
            }
          }
        ],
        "skillId": "Beni_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "直接ダメージを受けるとSPが回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Beni_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Beni_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "斧を振り回して、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "belita",
    "name": "ベリータ",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "魔女",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Belita_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 430.0,
              "2": 473.0,
              "3": 516.0,
              "4": 559.0,
              "5": 602.0,
              "6": 645.0,
              "7": 688.0,
              "8": 731.0,
              "9": 774.0,
              "10": 817.0,
              "11": 860.0,
              "12": 903.0
            }
          }
        ],
        "skillId": "Belita_low",
        "skillType": "低学年",
        "skillName": "ディメンションバースト",
        "description": "次元エネルギーを爆発させ範囲魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Belita_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 949.62,
              "2": 1039.58,
              "3": 1129.55,
              "4": 1219.51,
              "5": 1309.48,
              "6": 1399.44,
              "7": 1489.4,
              "8": 1579.37,
              "9": 1669.33,
              "10": 1759.3,
              "11": 1849.26,
              "12": 1939.22
            }
          },
          {
            "effectId": "Belita_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 12.0
          }
        ],
        "skillId": "Belita_high",
        "skillType": "高学年",
        "skillName": "クリムゾンレイン",
        "description": "クリムゾンレインで爆撃し、敵に12回範囲魔法ダメージを与える。",
        "cooldownSeconds": 22.0
      },
      {
        "effects": [
          {
            "effectId": "Belita_passive_e01",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "conditionType": "敵配置列",
            "conditionValue": "前列",
            "condition": "対前列使徒攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 40.0,
              "2": 44.0,
              "3": 48.0,
              "4": 52.0,
              "5": 56.0,
              "6": 60.0,
              "7": 64.0,
              "8": 68.0,
              "9": 72.0,
              "10": 76.0,
              "11": 80.0,
              "12": 84.0
            }
          }
        ],
        "skillId": "Belita_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "前列の使徒への与ダメージ量が上昇する。"
      },
      {
        "effects": [
          {
            "effectId": "Belita_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Belita_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "爆撃魔法を発動させて敵に範囲魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Belita_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 200.0
          }
        ],
        "skillId": "Belita_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でマナを凝縮した爆撃魔法を発動させて敵に範囲魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "veroo",
    "name": "ベル",
    "basic": {
      "rarity": 1.0,
      "personality": "憂鬱",
      "race": "幽霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.22
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Veroo_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 60.0,
              "2": 66.0,
              "3": 72.0,
              "4": 78.0,
              "5": 84.0,
              "6": 90.0,
              "7": 96.0,
              "8": 102.0,
              "9": 108.0,
              "10": 114.0,
              "11": 120.0,
              "12": 126.0
            }
          },
          {
            "effectId": "Veroo_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Veroo_low_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 100.0,
              "2": 110.0,
              "3": 120.0,
              "4": 130.0,
              "5": 140.0,
              "6": 150.0,
              "7": 160.0,
              "8": 170.0,
              "9": 180.0,
              "10": 190.0,
              "11": 200.0,
              "12": 210.0
            }
          }
        ],
        "skillId": "Veroo_low",
        "skillType": "低学年",
        "skillName": "斧が飛ぶよ～",
        "description": "斧を3個投げ、ランダムな敵に物理ダメージを与える。 最後の一撃はより大きなダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Veroo_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          }
        ],
        "skillId": "Veroo_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - ベル",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 26.0
      },
      {
        "effects": [
          {
            "effectId": "Veroo_passive_e01",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Veroo_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "攻撃速度が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Veroo_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Veroo_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "斧を投げつけ、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "velvet",
    "name": "ベルベット",
    "basic": {
      "rarity": 3.0,
      "personality": "冷静",
      "race": "魔女",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 25.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Velvet_low_e01",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "攻撃力",
            "levels": {
              "1": 200.0,
              "2": 215.0,
              "3": 230.0,
              "4": 245.0,
              "5": 260.0,
              "6": 275.0,
              "7": 290.0,
              "8": 305.0,
              "9": 320.0,
              "10": 335.0,
              "11": 350.0,
              "12": 365.0
            }
          },
          {
            "effectId": "Velvet_low_e02",
            "processGroupId": "Velvet_low_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 25.0,
              "2": 27.0,
              "3": 29.0,
              "4": 31.0,
              "5": 33.0,
              "6": 35.0,
              "7": 37.0,
              "8": 39.0,
              "9": 41.0,
              "10": 43.0,
              "11": 45.0,
              "12": 47.0
            }
          },
          {
            "effectId": "Velvet_low_e03",
            "processGroupId": "Velvet_low_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Velvet_low_e04",
            "valueKind": "挑発",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Velvet_low_e05",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Velvet_low",
        "skillType": "低学年",
        "skillName": "かかってきな！",
        "description": "敵を挑発してHPを回復し、一定時間攻撃力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Velvet_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 216.0,
              "2": 237.6,
              "3": 259.2,
              "4": 280.8,
              "5": 302.4,
              "6": 324.0,
              "7": 345.6,
              "8": 367.2,
              "9": 388.8,
              "10": 410.4,
              "11": 432.0,
              "12": 453.6
            }
          },
          {
            "effectId": "Velvet_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 11.0
          },
          {
            "effectId": "Velvet_high_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 54.0,
              "2": 59.4,
              "3": 64.8,
              "4": 70.2,
              "5": 75.6,
              "6": 81.0,
              "7": 86.4,
              "8": 91.8,
              "9": 97.2,
              "10": 102.6,
              "11": 108.0,
              "12": 113.4
            }
          },
          {
            "effectId": "Velvet_high_e04",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Velvet_high_e05",
            "processGroupId": "Velvet_high_proc01",
            "processOrder": 1.0,
            "valueKind": "無敵",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Velvet_high_e06",
            "processGroupId": "Velvet_high_proc01",
            "processOrder": 2.0,
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Velvet_high",
        "skillType": "高学年",
        "skillName": "魔法：遠心分離",
        "description": "高速回転して斧で周囲を薙ぎ払い、敵に範囲物理ダメージを11回与え、ノックバックさせる。 最後の一撃ではより大きなダメージを与える。回転中は無敵になる。",
        "cooldownSeconds": 20.0
      },
      {
        "effects": [
          {
            "effectId": "Velvet_passive_e01",
            "valueKind": "最大HP増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Velvet_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "最大HPが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Velvet_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 125.0
          }
        ],
        "skillId": "Velvet_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "斧を振るい、敵に範囲物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "posher",
    "name": "ポーシャー",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "魔女",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 200.0,
      "spRecoveryPerSecond": 50.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.475
    },
    "statTypes": {
      "hp": 1.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 1.0,
      "defM": 1.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 1.0,
      "critDmgRes": 1.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Posher_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "低学年スキル",
            "conditionType": "ランダム分岐",
            "conditionValue": "緑のポーション",
            "condition": "緑のポーション使用時",
            "effectTarget": "HP割合が最も少ない味方",
            "reference": "攻撃力",
            "levels": {
              "1": "350～700",
              "2": "375～750",
              "3": "400～800",
              "4": "425～850",
              "5": "450～900",
              "6": "475～950",
              "7": "500～1000",
              "8": "525～1050",
              "9": "550～1100",
              "10": "575～1150",
              "11": "600～1200",
              "12": "625～1250",
              "13": "650～1300",
              "14": "675～1350",
              "15": "700～1400"
            }
          },
          {
            "effectId": "Posher_low_e02",
            "processGroupId": "Posher_low_proc01",
            "processOrder": 1.0,
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "低学年スキル",
            "conditionType": "ランダム分岐",
            "conditionValue": "赤のポーション",
            "condition": "赤のポーション使用時",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": "650～1000",
              "2": "690～1080",
              "3": "690～1080",
              "4": "690～1080",
              "5": "690～1080",
              "6": "690～1080",
              "7": "690～1080",
              "8": "690～1080",
              "9": "690～1080",
              "10": "690～1080",
              "11": "690～1080",
              "12": "1090～1880",
              "13": "1130～1960",
              "14": "1170～2040",
              "15": "1210～2120"
            }
          },
          {
            "effectId": "Posher_low_e03",
            "processGroupId": "Posher_low_proc01",
            "processOrder": 2.0,
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "低学年スキル",
            "conditionType": "ランダム分岐",
            "conditionValue": "赤のポーション",
            "condition": "赤のポーション使用時",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": "480～800",
              "2": "540～860",
              "3": "600～920",
              "4": "660～980",
              "5": "720～1040",
              "6": "780～1100",
              "7": "840～1160",
              "8": "900～1220",
              "9": "960～1280",
              "10": "1020～1340",
              "11": "1080～1400",
              "12": "1140～1460",
              "13": "1200～1520",
              "14": "1260～1580",
              "15": "1320～1640"
            }
          },
          {
            "effectId": "Posher_low_e04",
            "processGroupId": "Posher_low_proc02",
            "processOrder": 1.0,
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "低学年スキル",
            "conditionType": "ランダム分岐",
            "conditionValue": "黄のポーション",
            "condition": "黄のポーション使用時",
            "effectTarget": "ランダムな敵"
          },
          {
            "effectId": "Posher_low_e05",
            "processGroupId": "Posher_low_proc02",
            "processOrder": 2.0,
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "低学年スキル効果発生時",
            "triggerSourceId": "低学年スキル",
            "conditionType": "ランダム分岐",
            "conditionValue": "黄のポーション",
            "condition": "黄のポーション使用時",
            "effectTarget": "ランダムな敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Posher_low",
        "skillType": "低学年",
        "skillName": "どれにしようかな？",
        "description": "3つのポーションからランダムで1つを選択し、敵に投げつける。 緑のポーションはHP割合が最も少ない味方のHPを回復させる。 赤のポーションはランダムな敵に魔法ダメージを与える。 黄のポーションはランダムな敵に魔法ダメージを与え、気絶を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Posher_high_e01",
            "valueKind": "変異",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵2体"
          },
          {
            "effectId": "Posher_high_e02",
            "valueKind": "変異",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵2体",
            "levels": {
              "1": 3.0,
              "2": 3.2,
              "3": 3.4,
              "4": 3.6,
              "5": 3.8,
              "6": 4.0,
              "7": 4.2,
              "8": 4.4,
              "9": 4.6,
              "10": 4.8,
              "11": 5.0,
              "12": 5.2,
              "13": 5.4,
              "14": 5.6,
              "15": 5.8
            }
          }
        ],
        "skillId": "Posher_high",
        "skillType": "高学年",
        "skillName": "いももかぼちゃの仲間でしょ！",
        "description": "ランダムな敵2体に変異を付与。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Posher_passive_e01",
            "valueKind": "被スキルダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "被攻撃分類",
            "conditionValue": "スキル",
            "condition": "被スキル攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0,
              "13": 48.0,
              "14": 50.0,
              "15": 52.0
            }
          }
        ],
        "skillId": "Posher_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "スキル攻撃の被ダメージ量が減少。"
      },
      {
        "effects": [
          {
            "effectId": "Posher_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Posher_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "ポーションを投げつけ魔法ダメージ。"
      },
      {
        "effects": [
          {
            "effectId": "Posher_enhanced_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 250.0
          }
        ],
        "skillId": "Posher_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回目の攻撃時にポーション2個で総魔法ダメージ。",
        "triggerType": "n回ごと",
        "triggerValue": 4.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "みんなのポーション",
      "levels": {
        "1": {
          "name": "ポーション職人ポーシャー",
          "stats": [],
          "effects": [
            {
              "skillId": "Posher_aside_1",
              "effectId": "Posher_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Posher_aside_1",
              "effectId": "Posher_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Posher_aside_1",
              "effectId": "Posher_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Posher_aside_1",
              "effectId": "Posher_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "臨床実験大成功",
          "stats": [],
          "effects": [
            {
              "skillId": "Posher_aside_2",
              "effectId": "Posher_aside_2_e01",
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "味方/後列",
              "targetSkill": "低学年スキル",
              "fixedValue": "20～50"
            },
            {
              "skillId": "Posher_aside_2",
              "effectId": "Posher_aside_2_e02",
              "valueKind": "変異対象追加",
              "valueClass": "対象数",
              "effectType": "デバフ",
              "effectTarget": "敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 1.0
            }
          ],
          "description": "低学年スキルを使用すると、後列の味方のSPを回復する。\n高学年スキルに変異が1体追加される。"
        },
        "3": {
          "name": "新薬革命",
          "stats": [
            {
              "skillId": "Posher_aside_3_global",
              "effectId": "Posher_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            },
            {
              "skillId": "Posher_aside_3_global",
              "effectId": "Posher_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Posher_aside_3_battle",
              "effectId": "Posher_aside_3_battle_e01",
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            },
            {
              "skillId": "Posher_aside_3_battle",
              "effectId": "Posher_aside_3_battle_e02",
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6.0
            }
          ],
          "description": "味方全員の会心抵抗と会心ダメージ抵抗を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "mago",
    "name": "マーゴ",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "獣人",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 150.0,
      "spRecoveryPerSecond": 44.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.39
    },
    "statTypes": {
      "hp": 2.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 2.0,
      "defM": 2.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Mago_low_e01",
            "valueKind": "毎秒HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方全体",
            "reference": "自身の最大HP",
            "levels": {
              "1": 5.0,
              "2": 5.6,
              "3": 6.2,
              "4": 6.8,
              "5": 7.4,
              "6": 8.0,
              "7": 8.6,
              "8": 9.2,
              "9": 9.8,
              "10": 10.4,
              "11": 11.0,
              "12": 11.6
            }
          },
          {
            "effectId": "Mago_low_e02",
            "valueKind": "HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "effectTarget": "味方全体",
            "fixedValue": 8.0
          }
        ],
        "skillId": "Mago_low",
        "skillType": "低学年",
        "skillName": "マーゴマックスリカバリー",
        "description": "1秒ごとに味方全員のHPを回復させる。"
      },
      {
        "effects": [
          {
            "effectId": "Mago_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 846.45,
              "2": 942.93,
              "3": 1039.41,
              "4": 1135.89,
              "5": 1232.37,
              "6": 1328.85,
              "7": 1425.33,
              "8": 1521.81,
              "9": 1618.29,
              "10": 1714.77,
              "11": 1811.25,
              "12": 1907.73
            }
          }
        ],
        "skillId": "Mago_high",
        "skillType": "高学年",
        "skillName": "メェ～龍拳！",
        "description": "敵に友達のヒツジを突進させ、魔法ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Mago_passive_e01",
            "valueKind": "バフ解除",
            "valueClass": "解除",
            "effectType": "デバフ",
            "effectTarget": "指定範囲内の敵1体"
          },
          {
            "effectId": "Mago_passive_e02",
            "valueKind": "バフ解除",
            "valueClass": "クールタイム",
            "effectType": "デバフ",
            "effectTarget": "指定範囲内の敵1体",
            "levels": {
              "1": 23.0,
              "2": 22.0,
              "3": 21.0,
              "4": 20.0,
              "5": 19.0,
              "6": 18.0,
              "7": 17.0,
              "8": 16.0,
              "9": 15.0,
              "10": 14.0,
              "11": 13.0,
              "12": 12.0
            }
          }
        ],
        "skillId": "Mago_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "指定範囲内の敵1名にかかったバフをすべて解除する。"
      },
      {
        "effects": [
          {
            "effectId": "Mago_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Mago_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を発射し、敵に魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "maestromk2",
    "name": "マエストロMK2",
    "basic": {
      "rarity": 2.0,
      "personality": "狂気",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 80.0,
      "combatPowerCorrectionB": 0.185
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 5.0,
      "atkM": 0.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "MaestroMK2_low_e01",
            "processGroupId": "MaestroMK2_low_proc01",
            "processOrder": 1.0,
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "味方/前列",
            "reference": "最大HP",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0
            }
          },
          {
            "effectId": "MaestroMK2_low_e02",
            "processGroupId": "MaestroMK2_low_proc01",
            "processOrder": 2.0,
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "味方/前列",
            "fixedValue": 3.0
          }
        ],
        "skillId": "MaestroMK2_low",
        "skillType": "低学年",
        "skillName": "ロボティックマトリクス",
        "description": "前列の味方にシールドを付与する。"
      },
      {
        "effects": [
          {
            "effectId": "MaestroMK2_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 100.0,
              "2": 110.0,
              "3": 120.0,
              "4": 130.0,
              "5": 140.0,
              "6": 150.0,
              "7": 160.0,
              "8": 170.0,
              "9": 180.0,
              "10": 190.0,
              "11": 200.0,
              "12": 210.0
            }
          },
          {
            "effectId": "MaestroMK2_high_e02",
            "valueKind": "ノイズ",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "MaestroMK2_high_e03",
            "valueKind": "ノイズ",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "MaestroMK2_high",
        "skillType": "高学年",
        "skillName": "ソナーショックウェーブ",
        "description": "範囲内の対象に衝撃波を放出し、物理ダメージを与え、ノイズデバフを付与する。",
        "cooldownSeconds": 16.0
      },
      {
        "effects": [
          {
            "effectId": "MaestroMK2_passive_e01",
            "valueKind": "基本攻撃与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 32.0,
              "3": 34.0,
              "4": 36.0,
              "5": 38.0,
              "6": 40.0,
              "7": 42.0,
              "8": 44.0,
              "9": 46.0,
              "10": 48.0,
              "11": 50.0,
              "12": 52.0
            }
          },
          {
            "effectId": "MaestroMK2_passive_e02",
            "valueKind": "毒免疫",
            "valueClass": "免疫",
            "effectType": "パッシブ",
            "effectTarget": "自身"
          },
          {
            "effectId": "MaestroMK2_passive_e03",
            "valueKind": "苦痛免疫",
            "valueClass": "免疫",
            "effectType": "パッシブ",
            "effectTarget": "自身"
          }
        ],
        "skillId": "MaestroMK2_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "基本攻撃のダメージ量が増加する。 毒と苦痛の免疫を得る。"
      },
      {
        "effects": [
          {
            "effectId": "MaestroMK2_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 175.0
          }
        ],
        "skillId": "MaestroMK2_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "拳を振るい、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "mayo",
    "name": "マヨ",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "妖精",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Mayo_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "最も攻撃力が高い敵",
            "levels": {
              "1": 118.8,
              "2": 130.68,
              "3": 142.56,
              "4": 154.44,
              "5": 166.32,
              "6": 178.2,
              "7": 190.08,
              "8": 201.96,
              "9": 213.84,
              "10": 225.72,
              "11": 237.6,
              "12": 249.5
            }
          },
          {
            "effectId": "Mayo_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "最も攻撃力が高い敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Mayo_low_e03",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "最も攻撃力が高い敵"
          },
          {
            "effectId": "Mayo_low_e04",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "最も攻撃力が高い敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Mayo_low",
        "skillType": "低学年",
        "skillName": "収集家のルール",
        "description": "最も攻撃力が高い敵に毒矢を放って物理ダメージを3回与え、毒を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Mayo_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 140.0,
              "2": 154.0,
              "3": 168.0,
              "4": 182.0,
              "5": 196.0,
              "6": 210.0,
              "7": 224.0,
              "8": 238.0,
              "9": 252.0,
              "10": 266.0,
              "11": 280.0,
              "12": 294.0
            }
          },
          {
            "effectId": "Mayo_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 8.0
          },
          {
            "effectId": "Mayo_high_e03",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "ランダムな敵"
          },
          {
            "effectId": "Mayo_high_e04",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "ランダムな敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Mayo_high",
        "skillType": "高学年",
        "skillName": "それは私のコレクションっす。",
        "description": "毒矢を発射し、ランダムな敵に8回物理ダメージを与え、毒を付与する。",
        "cooldownSeconds": 11.0
      },
      {
        "effects": [
          {
            "effectId": "Mayo_passive_e01",
            "valueKind": "強化攻撃与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 28.0,
              "3": 32.0,
              "4": 36.0,
              "5": 40.0,
              "6": 44.0,
              "7": 48.0,
              "8": 52.0,
              "9": 56.0,
              "10": 60.0,
              "11": 64.0,
              "12": 68.0
            }
          },
          {
            "effectId": "Mayo_passive_e02",
            "valueKind": "毒終了時追加物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "状態終了時",
            "triggerSourceId": "毒",
            "conditionType": "付与者",
            "conditionValue": "Mayo",
            "condition": "マヨによる毒効果終了時",
            "effectTarget": "毒が消えた敵",
            "levels": {
              "1": 25.0,
              "2": 28.0,
              "3": 31.0,
              "4": 34.0,
              "5": 37.0,
              "6": 40.0,
              "7": 43.0,
              "8": 46.0,
              "9": 49.0,
              "10": 52.0,
              "11": 55.0,
              "12": 58.0
            }
          }
        ],
        "skillId": "Mayo_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃のダメージ量が増加する。 マヨのスキルで発生した毒効果が消える度に追加で物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Mayo_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Mayo_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "吹き矢を飛ばして敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Mayo_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 125.0
          },
          {
            "effectId": "Mayo_enhanced_e02",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Mayo_enhanced_e03",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Mayo_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で毒矢を飛ばして敵に物理ダメージを与え、毒を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "marie",
    "name": "マリー",
    "basic": {
      "rarity": 2.0,
      "personality": "活発",
      "race": "妖精",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Marie_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 150.0,
              "2": 160.0,
              "3": 170.0,
              "4": 180.0,
              "5": 190.0,
              "6": 200.0,
              "7": 210.0,
              "8": 220.0,
              "9": 230.0,
              "10": 240.0,
              "11": 250.0,
              "12": 260.0
            }
          },
          {
            "effectId": "Marie_low_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Marie_low_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Marie_low",
        "skillType": "低学年",
        "skillName": "爆弾のお届け物です～",
        "description": "特製爆弾を投げつけて敵に範囲物理ダメージを与え、火傷を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Marie_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 250.0,
              "2": 270.0,
              "3": 290.0,
              "4": 310.0,
              "5": 330.0,
              "6": 350.0,
              "7": 370.0,
              "8": 390.0,
              "9": 410.0,
              "10": 430.0,
              "11": 450.0,
              "12": 470.0
            }
          }
        ],
        "skillId": "Marie_high",
        "skillType": "高学年",
        "skillName": "は～じけるよ～！",
        "description": "高性能爆弾を設置した後、爆発させて敵に範囲物理ダメージを与える。",
        "cooldownSeconds": 40.0
      },
      {
        "effects": [
          {
            "effectId": "Marie_passive_e01",
            "valueKind": "強化攻撃確率増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0
            }
          },
          {
            "effectId": "Marie_passive_e02",
            "valueKind": "強化攻撃与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 28.0,
              "3": 32.0,
              "4": 36.0,
              "5": 40.0,
              "6": 44.0,
              "7": 48.0,
              "8": 52.0,
              "9": 56.0,
              "10": 60.0,
              "11": 64.0,
              "12": 68.0
            }
          }
        ],
        "skillId": "Marie_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃の確率とダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Marie_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Marie_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵に爆弾を投げつけて物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Marie_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 125.0
          },
          {
            "effectId": "Marie_enhanced_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Marie_enhanced_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Marie_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で強化爆弾を投げつけて敵に範囲物理ダメージを与え、火傷を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 50.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "mynx",
    "name": "ミンス",
    "basic": {
      "rarity": 1.0,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.195
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Mynx_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 128.7,
              "2": 141.57,
              "3": 154.44,
              "4": 167.31,
              "5": 180.18,
              "6": 193.05,
              "7": 205.92,
              "8": 218.79,
              "9": 231.66,
              "10": 244.53,
              "11": 257.4,
              "12": 270.27
            }
          },
          {
            "effectId": "Mynx_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Mynx_low",
        "skillType": "低学年",
        "skillName": "ガオオ～",
        "description": "大声を出して敵に範囲物理ダメージを3回与える。"
      },
      {
        "effects": [
          {
            "effectId": "Mynx_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 360.0,
              "2": 396.0,
              "3": 432.0,
              "4": 468.0,
              "5": 504.0,
              "6": 540.0,
              "7": 576.0,
              "8": 612.0,
              "9": 648.0,
              "10": 684.0,
              "11": 720.0,
              "12": 756.0
            }
          }
        ],
        "skillId": "Mynx_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - ミンス",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Mynx_passive_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Mynx_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "攻撃力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Mynx_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Mynx_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "剣を振るい、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "maison",
    "name": "メゾン",
    "basic": {
      "rarity": 1.0,
      "personality": "狂気",
      "race": "幽霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 20.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.27
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Maison_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 120.0,
              "2": 132.0,
              "3": 144.0,
              "4": 156.0,
              "5": 168.0,
              "6": 180.0,
              "7": 192.0,
              "8": 204.0,
              "9": 216.0,
              "10": 228.0,
              "11": 240.0,
              "12": 252.0
            }
          },
          {
            "effectId": "Maison_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Maison_low_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 80.0,
              "2": 88.0,
              "3": 96.0,
              "4": 104.0,
              "5": 112.0,
              "6": 120.0,
              "7": 128.0,
              "8": 136.0,
              "9": 144.0,
              "10": 152.0,
              "11": 160.0,
              "12": 168.0
            }
          }
        ],
        "skillId": "Maison_low",
        "skillType": "低学年",
        "skillName": "手裏剣飛ばすよ～！",
        "description": "手裏剣を3個投げ、ランダムな敵に物理ダメージを与える。最後の一撃はより大きなダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Maison_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0
            }
          }
        ],
        "skillId": "Maison_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - メゾン",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Maison_passive_e01",
            "valueKind": "会心増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Maison_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Maison_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Maison_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "手裏剣を投げ、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "meluna",
    "name": "メロナ",
    "basic": {
      "rarity": 2.0,
      "personality": "冷静",
      "race": "精霊",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.425
    },
    "statTypes": {
      "hp": 1.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 1.0,
      "defM": 1.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 1.0,
      "critDmgRes": 1.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Meluna_low_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 50.0,
              "2": 55.0,
              "3": 60.0,
              "4": 65.0,
              "5": 70.0,
              "6": 75.0,
              "7": 80.0,
              "8": 85.0,
              "9": 90.0,
              "10": 95.0,
              "11": 100.0,
              "12": 105.0
            }
          },
          {
            "effectId": "Meluna_low_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方全員",
            "reference": "与ダメージ量",
            "levels": {
              "1": 480.0,
              "2": 510.0,
              "3": 540.0,
              "4": 570.0,
              "5": 600.0,
              "6": 630.0,
              "7": 660.0,
              "8": 690.0,
              "9": 720.0,
              "10": 750.0,
              "11": 780.0,
              "12": 810.0
            }
          },
          {
            "effectId": "Meluna_low_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 5.0
          }
        ],
        "skillId": "Meluna_low",
        "skillType": "低学年",
        "skillName": "メロンに、メロメロン！",
        "description": "メロンの雨を5回降らせて敵に範囲魔法ダメージを与え、味方全員のHPを回復する。",
        "cooldownSeconds": 0.0
      },
      {
        "effects": [
          {
            "effectId": "Meluna_high_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 100.0,
              "2": 110.0,
              "3": 120.0,
              "4": 130.0,
              "5": 140.0,
              "6": 150.0,
              "7": 160.0,
              "8": 170.0,
              "9": 180.0,
              "10": 190.0,
              "11": 200.0,
              "12": 210.0
            }
          },
          {
            "effectId": "Meluna_high_e02",
            "valueKind": "爆発魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 100.0,
              "2": 110.0,
              "3": 120.0,
              "4": 130.0,
              "5": 140.0,
              "6": 150.0,
              "7": 160.0,
              "8": 170.0,
              "9": 180.0,
              "10": 190.0,
              "11": 200.0,
              "12": 210.0
            }
          },
          {
            "effectId": "Meluna_high_e03",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "与ダメージ量",
            "levels": {
              "1": 260.0,
              "2": 272.0,
              "3": 284.0,
              "4": 296.0,
              "5": 308.0,
              "6": 320.0,
              "7": 332.0,
              "8": 344.0,
              "9": 356.0,
              "10": 368.0,
              "11": 380.0,
              "12": 392.0
            }
          }
        ],
        "skillId": "Meluna_high",
        "skillType": "高学年",
        "skillName": "メーロンマスクX",
        "description": "巨大メロンをランダムな敵に向かって転がし、範囲魔法ダメージを与える。目標に到達すると爆発してダメージを与え、残りHP割合が最も低い味方のHPを回復する。",
        "cooldownSeconds": 14.0
      },
      {
        "effects": [
          {
            "effectId": "Meluna_passive_e01",
            "valueKind": "強化攻撃確率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0
            }
          }
        ],
        "skillId": "Meluna_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃確率が増加する。",
        "cooldownSeconds": 0.0
      },
      {
        "effects": [
          {
            "effectId": "Meluna_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75.0
          }
        ],
        "skillId": "Meluna_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "メロンを投げつけ、敵にダメージを与える。",
        "cooldownSeconds": 0.0
      },
      {
        "effects": [
          {
            "effectId": "Meluna_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          },
          {
            "effectId": "Meluna_enhanced_e02",
            "valueKind": "目隠し",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Meluna_enhanced_e03",
            "valueKind": "目隠し",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "levels": {
              "1": 3.0
            }
          }
        ],
        "skillId": "Meluna_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で高級メロンを投げつけて敵にダメージを与え、目隠しを付与する。",
        "cooldownSeconds": 0.0,
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "momo",
    "name": "モモ",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 20.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Momo_low_e01",
            "valueKind": "召喚獣の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "基本攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 30.0,
              "2": 34.0,
              "3": 38.0,
              "4": 42.0,
              "5": 46.0,
              "6": 50.0,
              "7": 54.0,
              "8": 58.0,
              "9": 62.0,
              "10": 66.0,
              "11": 70.0,
              "12": 74.0,
              "13": 78.0,
              "14": 82.0,
              "15": 86.0
            }
          },
          {
            "effectId": "Momo_low_e02",
            "valueKind": "召喚獣の自爆ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "スキル,召喚獣の自爆",
            "triggerType": "生成物消滅時",
            "triggerSourceId": "Momo_low_clone",
            "condition": "召喚獣破壊時",
            "effectTarget": "周囲の敵",
            "levels": {
              "1": 45.0,
              "2": 51.0,
              "3": 57.0,
              "4": 63.0,
              "5": 69.0,
              "6": 75.0,
              "7": 81.0,
              "8": 87.0,
              "9": 93.0,
              "10": 99.0,
              "11": 105.0,
              "12": 111.0,
              "13": 117.0,
              "14": 123.0,
              "15": 129.0
            }
          },
          {
            "effectId": "Momo_low_e03",
            "valueKind": "召喚",
            "valueClass": "持続時間",
            "effectType": "召喚",
            "effectTarget": "分身",
            "fixedValue": 12.0
          },
          {
            "effectId": "Momo_low_e04",
            "valueKind": "被ダメージ耐久度",
            "valueClass": "回数",
            "effectType": "召喚",
            "effectTarget": "分身",
            "fixedValue": 3.0
          },
          {
            "effectId": "Momo_low_e05",
            "valueKind": "召喚獣",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "分身",
            "levels": {
              "1": 2.0,
              "2": 2.0,
              "3": 2.0,
              "4": 2.0,
              "5": 2.0,
              "6": 3.0,
              "7": 3.0,
              "8": 3.0,
              "9": 3.0,
              "10": 3.0,
              "11": 4.0,
              "12": 4.0,
              "13": 4.0,
              "14": 4.0,
              "15": 4.0
            }
          },
          {
            "effectId": "Momo_low_e06",
            "valueKind": "感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "周囲の敵"
          },
          {
            "effectId": "Momo_low_e07",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "周囲の敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Momo_low",
        "skillType": "低学年",
        "skillName": "倍返しで抱きしめるっ",
        "description": "ランダムな敵に魔法ダメージを与える分身を召喚する。 分身は3回ダメージを受けるか、時間が経過すると破壊される。 破壊時には周囲に魔法ダメージを与え、感電を付与する。 分身はHP回復効果を受けない。"
      },
      {
        "effects": [
          {
            "effectId": "Momo_high_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲の敵",
            "levels": {
              "1": 370.0,
              "2": 395.0,
              "3": 420.0,
              "4": 445.0,
              "5": 470.0,
              "6": 495.0,
              "7": 520.0,
              "8": 545.0,
              "9": 570.0,
              "10": 595.0,
              "11": 620.0,
              "12": 645.0,
              "13": 670.0,
              "14": 695.0,
              "15": 720.0
            }
          },
          {
            "effectId": "Momo_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲の敵",
            "fixedValue": 4.0
          },
          {
            "effectId": "Momo_high_e03",
            "valueKind": "召喚獣",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "分身",
            "fixedValue": 1.0
          },
          {
            "effectId": "Momo_high_e04",
            "valueKind": "召喚獣の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "基本攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 30.0,
              "2": 34.0,
              "3": 38.0,
              "4": 42.0,
              "5": 46.0,
              "6": 50.0,
              "7": 54.0,
              "8": 58.0,
              "9": 62.0,
              "10": 66.0,
              "11": 70.0,
              "12": 74.0,
              "13": 78.0,
              "14": 82.0,
              "15": 86.0
            }
          },
          {
            "effectId": "Momo_high_e05",
            "valueKind": "召喚獣の自爆ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "スキル,召喚獣の自爆",
            "triggerType": "生成物消滅時",
            "triggerSourceId": "Momo_high_clone",
            "condition": "召喚獣破壊時",
            "effectTarget": "周囲の敵",
            "levels": {
              "1": 45.0,
              "2": 51.0,
              "3": 57.0,
              "4": 63.0,
              "5": 69.0,
              "6": 75.0,
              "7": 81.0,
              "8": 87.0,
              "9": 93.0,
              "10": 99.0,
              "11": 105.0,
              "12": 111.0,
              "13": 117.0,
              "14": 123.0,
              "15": 129.0
            }
          }
        ],
        "skillId": "Momo_high",
        "skillType": "高学年",
        "skillName": "秒殺リスサンダー",
        "description": "指定範囲内で最も後ろにいる敵の元に現れ、範囲魔法ダメージを4回与える。 攻撃が終わるとその場に分身を1個残し、スキル発動位置に戻ってくる。 分身は低学年スキルによって召喚される分身と同一の特性を持つ。",
        "cooldownSeconds": 30.0
      },
      {
        "effects": [
          {
            "effectId": "Momo_passive_e01",
            "valueKind": "発動条件",
            "valueClass": "回数",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 2.0
          },
          {
            "effectId": "Momo_passive_e02",
            "valueKind": "クールタイム",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 15.0,
              "2": 14.5,
              "3": 14.0,
              "4": 13.5,
              "5": 13.0,
              "6": 12.5,
              "7": 12.0,
              "8": 11.5,
              "9": 11.0,
              "10": 10.5,
              "11": 10.0,
              "12": 9.5,
              "13": 9.0,
              "14": 8.5,
              "15": 8.0
            }
          },
          {
            "effectId": "Momo_passive_e03",
            "processGroupId": "Momo_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 2.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "levels": {
              "1": 16.0,
              "2": 17.0,
              "3": 18.0,
              "4": 19.0,
              "5": 20.0,
              "6": 21.0,
              "7": 22.0,
              "8": 23.0,
              "9": 24.0,
              "10": 25.0,
              "11": 26.0,
              "12": 27.0,
              "13": 28.0,
              "14": 29.0,
              "15": 30.0
            }
          },
          {
            "effectId": "Momo_passive_e04",
            "processGroupId": "Momo_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 2.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Momo_passive_e05",
            "processGroupId": "Momo_passive_proc01",
            "processOrder": 3.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 2.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "levels": {
              "1": 16.0,
              "2": 17.0,
              "3": 18.0,
              "4": 19.0,
              "5": 20.0,
              "6": 21.0,
              "7": 22.0,
              "8": 23.0,
              "9": 24.0,
              "10": 25.0,
              "11": 26.0,
              "12": 27.0,
              "13": 28.0,
              "14": 28.0,
              "15": 30.0
            }
          },
          {
            "effectId": "Momo_passive_e06",
            "processGroupId": "Momo_passive_proc01",
            "processOrder": 4.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 2.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Momo_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "2回直接ダメージを受けると才気煥発を発動する。 才気煥発発動後は一定時間、攻撃力が増加し、被ダメージ量が減少する。 直接ダメージ: 状態異常ダメージ、反射ダメージを除く直接攻撃によるダメージを意味する。"
      },
      {
        "effects": [
          {
            "effectId": "Momo_basic_e01",
            "valueKind": "総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          },
          {
            "effectId": "Momo_basic_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Momo_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵に電気手裏剣を2回投げ、魔法ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "伝説の手裏剣",
      "levels": {
        "1": {
          "name": "桜花手裏剣",
          "stats": [],
          "effects": [
            {
              "skillId": "Momo_aside_1",
              "effectId": "Momo_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Momo_aside_1",
              "effectId": "Momo_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Momo_aside_1",
              "effectId": "Momo_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Momo_aside_1",
              "effectId": "Momo_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "目覚めたニンジャ",
          "stats": [],
          "effects": [
            {
              "skillId": "Momo_aside_2",
              "effectId": "Momo_aside_2_e01",
              "processGroupId": "Momo_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "召喚獣の自爆ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "attackCategory": "召喚獣の自爆",
              "triggerType": "生成物消滅時",
              "condition": "召喚獣破壊時",
              "effectTarget": "召喚獣",
              "targetSkill": "召喚獣自爆",
              "fixedValue": 200.0
            },
            {
              "skillId": "Momo_aside_2",
              "effectId": "Momo_aside_2_e02",
              "processGroupId": "Momo_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "triggerType": "生成物消滅時",
              "condition": "召喚獣破壊時",
              "effectTarget": "自身",
              "targetSkill": "召喚獣破壊時",
              "fixedValue": 10.0
            },
            {
              "skillId": "Momo_aside_2",
              "effectId": "Momo_aside_2_e03",
              "processGroupId": "Momo_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "高学年スキル使用時",
              "triggerSourceId": "高学年スキル",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 50.0
            },
            {
              "skillId": "Momo_aside_2",
              "effectId": "Momo_aside_2_e04",
              "processGroupId": "Momo_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "被ダメージ量減少",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "高学年スキル使用時",
              "triggerSourceId": "高学年スキル",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3.0
            }
          ],
          "description": "召喚獣の自爆ダメージが増加する。\n召喚獣が破壊されると、自身のSPを回復する。\n高学年スキル使用時、一定時間、モモの被ダメージ量が減少する。"
        },
        "3": {
          "name": "モモ～ハッ！",
          "stats": [
            {
              "skillId": "Momo_aside_3_global",
              "effectId": "Momo_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Momo_aside_3_global",
              "effectId": "Momo_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Momo_aside_3_battle",
              "effectId": "Momo_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 10.5
            },
            {
              "skillId": "Momo_aside_3_battle",
              "effectId": "Momo_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 4.5
            }
          ],
          "description": "味方全員の敵への与ダメージ量が増加し、味方全員の敵からの被ダメージ量が減少する。"
        }
      }
    },
    "board": null
  },
  {
    "id": "yumimi",
    "name": "ユミミ",
    "basic": {
      "rarity": 2.0,
      "personality": "狂気",
      "race": "獣人",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Yumimi_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          }
        ],
        "skillId": "Yumimi_low",
        "skillType": "低学年",
        "skillName": "発射！シュー～",
        "description": "指定範囲内で最も遠い敵に強化された矢を発射して物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Yumimi_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "最も離れている敵/範囲内の敵",
            "levels": {
              "1": 300.0,
              "2": 330.0,
              "3": 360.0,
              "4": 390.0,
              "5": 420.0,
              "6": 450.0,
              "7": 480.0,
              "8": 510.0,
              "9": 540.0,
              "10": 570.0,
              "11": 600.0,
              "12": 630.0
            }
          },
          {
            "effectId": "Yumimi_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "最も離れている敵/範囲内の敵",
            "fixedValue": 5.0
          }
        ],
        "skillId": "Yumimi_high",
        "skillType": "高学年",
        "skillName": "発射！矢の雨！",
        "description": "力を溜めて空へ矢を放ち、最も離れている敵に範囲物理ダメージを5回与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Yumimi_passive_e01",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          }
        ],
        "skillId": "Yumimi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "攻撃速度が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Yumimi_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Yumimi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "指定範囲内で最も遠い敵に矢を発射して敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "yomi",
    "name": "ヨミ",
    "basic": {
      "rarity": 3.0,
      "eldain": "星を望む者",
      "personality": "憂鬱",
      "race": "？？？",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 220.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 110.0,
      "combatPowerCorrectionB": 0.4
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 2.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Yomi_low_e01",
            "processGroupId": "Yomi_low_proc01",
            "processOrder": 1.0,
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Yomi_low_moonlight",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の味方",
            "levels": {
              "1": 20.0,
              "2": 21.0,
              "3": 22.0,
              "4": 23.0,
              "5": 24.0,
              "6": 25.0,
              "7": 26.0,
              "8": 27.0,
              "9": 28.0,
              "10": 29.0,
              "11": 30.0,
              "12": 31.0
            }
          },
          {
            "effectId": "Yomi_low_e02",
            "processGroupId": "Yomi_low_proc01",
            "processOrder": 2.0,
            "valueKind": "防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Yomi_low_moonlight",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の味方",
            "fixedValue": 6.0
          },
          {
            "effectId": "Yomi_low_e03",
            "processGroupId": "Yomi_low_proc01",
            "processOrder": 3.0,
            "valueKind": "攻撃力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "conditionType": "領域内",
            "conditionValue": "Yomi_low_moonlight",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の敵",
            "levels": {
              "1": 30.0,
              "2": 31.0,
              "3": 32.0,
              "4": 33.0,
              "5": 34.0,
              "6": 35.0,
              "7": 36.0,
              "8": 37.0,
              "9": 38.0,
              "10": 39.0,
              "11": 40.0,
              "12": 41.0
            }
          },
          {
            "effectId": "Yomi_low_e04",
            "processGroupId": "Yomi_low_proc01",
            "processOrder": 4.0,
            "valueKind": "攻撃力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "conditionType": "領域内",
            "conditionValue": "Yomi_low_moonlight",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の敵",
            "fixedValue": 6.0
          },
          {
            "effectId": "Yomi_low_e05",
            "valueKind": "月光",
            "valueClass": "持続時間",
            "effectType": "召喚",
            "effectTarget": "月光",
            "fixedValue": 8.0
          },
          {
            "effectId": "Yomi_low_e06",
            "processGroupId": "Yomi_low_proc01",
            "processOrder": 5.0,
            "valueKind": "基本攻撃強化",
            "valueClass": "スキル変更",
            "effectType": "バフ",
            "conditionType": "領域内",
            "conditionValue": "Yomi_low_moonlight",
            "condition": "月光持続中",
            "effectTarget": "自身"
          }
        ],
        "skillId": "Yomi_low",
        "skillType": "低学年",
        "skillName": "向月葵",
        "description": "一定時間、最大HPが最も高い味方を照らす月光を召喚する。 月光の中にいる味方は防御力が増加し、敵は攻撃力が減少する。 月光が持続する間、ヨミの基本攻撃が強化攻撃に変わる。"
      },
      {
        "effects": [
          {
            "effectId": "Yomi_high_e01",
            "valueKind": "味方SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "月光内の味方",
            "levels": {
              "1": 10.0,
              "2": 10.0,
              "3": 11.0,
              "4": 11.0,
              "5": 12.0,
              "6": 12.0,
              "7": 13.0,
              "8": 13.0,
              "9": 14.0,
              "10": 14.0,
              "11": 15.0,
              "12": 15.0
            }
          },
          {
            "effectId": "Yomi_high_e02",
            "valueKind": "1秒ごとの魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "月光内の敵",
            "levels": {
              "1": 250.0,
              "2": 270.0,
              "3": 290.0,
              "4": 310.0,
              "5": 330.0,
              "6": 350.0,
              "7": 370.0,
              "8": 390.0,
              "9": 410.0,
              "10": 430.0,
              "11": 450.0,
              "12": 470.0
            }
          },
          {
            "effectId": "Yomi_high_e03",
            "valueKind": "敵SP減少",
            "valueClass": "固定値",
            "effectType": "デバフ",
            "effectTarget": "月光内の敵",
            "levels": {
              "1": 15.0,
              "2": 10.0,
              "3": 16.0,
              "4": 16.0,
              "5": 17.0,
              "6": 17.0,
              "7": 18.0,
              "8": 18.0,
              "9": 19.0,
              "10": 19.0,
              "11": 20.0,
              "12": 20.0
            }
          },
          {
            "effectId": "Yomi_high_e04",
            "valueKind": "月光",
            "valueClass": "持続時間",
            "effectType": "召喚",
            "effectTarget": "月光",
            "fixedValue": 12.0
          }
        ],
        "skillId": "Yomi_high",
        "skillType": "高学年",
        "skillName": "心を込めたお迎えを",
        "description": "一定時間、雲を晴らす月光を召喚する。 月光はヨミが見ている方向へゆっくりと前進する。 月光の内側にいる味方は1秒ごとにSPが回復する。 敵は1秒ごとにダメージを受け、SPが減少する。",
        "cooldownSeconds": 26.0
      },
      {
        "effects": [
          {
            "effectId": "Yomi_passive_e01",
            "valueKind": "HP回復量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "味方全体",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0
            }
          }
        ],
        "skillId": "Yomi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "味方全員のHP回復量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Yomi_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60.0
          }
        ],
        "skillId": "Yomi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "呪文を唱えて敵に魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Yomi_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵2体",
            "fixedValue": 300.0
          },
          {
            "effectId": "Yomi_enhanced_e02",
            "valueKind": "攻撃速度減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵2体",
            "fixedValue": 40.0
          },
          {
            "effectId": "Yomi_enhanced_e03",
            "valueKind": "攻撃速度減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵2体",
            "fixedValue": 3.0
          },
          {
            "effectId": "Yomi_enhanced_e04",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 16.0
          },
          {
            "effectId": "Yomi_enhanced_e05",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "最大HP",
            "fixedValue": 16.0
          }
        ],
        "skillId": "Yomi_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で星光を降らせ、ランダムな敵2体に魔法ダメージを与え、攻撃速度を減少させる。 追加で自身と、残りHP割合が最も低い味方を回復させる。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {
      "name": "ヨミの向月葵の花",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Yomi_favorite_1_e01",
                "processGroupId": "Yomi_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "低学年",
                "targetSkillName": "満月の使者",
                "valueKind": "防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Yomi_low_moonlight",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の味方",
                "levels": {
                  "1": 20.0,
                  "2": 21.0,
                  "3": 22.0,
                  "4": 23.0,
                  "5": 24.0,
                  "6": 25.0,
                  "7": 26.0,
                  "8": 27.0,
                  "9": 28.0,
                  "10": 29.0,
                  "11": 30.0,
                  "12": 31.0
                }
              },
              {
                "effectId": "Yomi_favorite_1_e02",
                "processGroupId": "Yomi_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "低学年",
                "targetSkillName": "満月の使者",
                "valueKind": "与ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Yomi_low_moonlight",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の味方",
                "levels": {
                  "1": 10.0,
                  "2": 11.0,
                  "3": 12.0,
                  "4": 13.0,
                  "5": 14.0,
                  "6": 15.0,
                  "7": 16.0,
                  "8": 17.0,
                  "9": 18.0,
                  "10": 19.0,
                  "11": 20.0,
                  "12": 21.0
                }
              },
              {
                "effectId": "Yomi_favorite_1_e03",
                "processGroupId": "Yomi_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "低学年",
                "targetSkillName": "満月の使者",
                "valueKind": "バフ",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "conditionType": "領域内",
                "conditionValue": "Yomi_low_moonlight",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の味方",
                "fixedValue": 6.0
              },
              {
                "effectId": "Yomi_favorite_1_e04",
                "processGroupId": "Yomi_favorite_1_proc01",
                "processOrder": 4.0,
                "targetSkill": "低学年",
                "targetSkillName": "満月の使者",
                "valueKind": "攻撃力減少",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "conditionType": "領域内",
                "conditionValue": "Yomi_low_moonlight",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の敵",
                "levels": {
                  "1": 30.0,
                  "2": 31.0,
                  "3": 32.0,
                  "4": 33.0,
                  "5": 34.0,
                  "6": 35.0,
                  "7": 36.0,
                  "8": 37.0,
                  "9": 38.0,
                  "10": 39.0,
                  "11": 40.0,
                  "12": 41.0
                }
              },
              {
                "effectId": "Yomi_favorite_1_e05",
                "processGroupId": "Yomi_favorite_1_proc01",
                "processOrder": 5.0,
                "targetSkill": "低学年",
                "targetSkillName": "満月の使者",
                "valueKind": "攻撃力減少",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "conditionType": "領域内",
                "conditionValue": "Yomi_low_moonlight",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の敵",
                "fixedValue": 6.0
              },
              {
                "effectId": "Yomi_favorite_1_e06",
                "targetSkill": "低学年",
                "targetSkillName": "満月の使者",
                "valueKind": "月光",
                "valueClass": "持続時間",
                "effectType": "召喚",
                "effectTarget": "月光",
                "fixedValue": 8.0
              }
            ],
            "skillId": "Yomi_favorite_1",
            "skillName": "愛用Lv1",
            "description": "満月を最大2個召喚する。\n満月は一定時間、最大HPが最も高い味方と攻撃力が最も高い味方を照らす。\n月光の中にいる味方は防御力と与ダメージ量が増加する。\n月光の内側にいる敵は攻撃力が減少する。\n月光が続く間、ヨミの基本攻撃は強化攻撃に変わる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Yomi_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Yomi_favorite_3_e02",
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Yomi_favorite_3_e03",
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Yomi_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ヨミの魔法攻撃力、会心抵抗、会心ダメージ抵抗が増加。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "risty",
    "name": "リスティ",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 44.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.37
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Risty_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/HP最高/範囲",
            "levels": {
              "1": 135.0,
              "2": 148.0,
              "3": 161.0,
              "4": 174.0,
              "5": 187.0,
              "6": 200.0,
              "7": 213.0,
              "8": 226.0,
              "9": 239.0,
              "10": 252.0,
              "11": 265.0,
              "12": 278.0,
              "13": 291.0,
              "14": 304.0,
              "15": 317.0
            }
          },
          {
            "effectId": "Risty_low_e02",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/HP最高/範囲",
            "levels": {
              "1": 270.0,
              "2": 297.0,
              "3": 324.0,
              "4": 351.0,
              "5": 378.0,
              "6": 405.0,
              "7": 432.0,
              "8": 459.0,
              "9": 486.0,
              "10": 513.0,
              "11": 540.0,
              "12": 567.0,
              "13": 594.0,
              "14": 621.0,
              "15": 648.0
            }
          },
          {
            "effectId": "Risty_low_e03",
            "valueKind": "再探索",
            "valueClass": "回数",
            "effectType": "スキル制御",
            "triggerType": "攻撃対象未撃破時",
            "triggerSourceId": "Risty_low_e01",
            "condition": "敵が倒されなかった場合",
            "targetSkill": "低学年スキル",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Risty_low",
        "skillType": "低学年",
        "skillName": "テクノマンシー",
        "description": "HPが最も高い敵に範囲物理ダメージを与える。敵が倒されなかった場合、最大3回まで再度敵を探し出し範囲物理ダメージを与える。最後の一撃はより高いダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Risty_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵3体",
            "levels": {
              "1": 40.0,
              "2": 43.0,
              "3": 45.0,
              "4": 48.0,
              "5": 51.0,
              "6": 53.0,
              "7": 56.0,
              "8": 59.0,
              "9": 61.0,
              "10": 64.0,
              "11": 67.0,
              "12": 69.0,
              "13": 72.0,
              "14": 75.0,
              "15": 77.0
            }
          },
          {
            "effectId": "Risty_high_e02",
            "valueKind": "ブロック数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵3体",
            "fixedValue": 10.0
          },
          {
            "effectId": "Risty_high_e03",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Risty_high_e04",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵3体",
            "levels": {
              "1": 160.0,
              "2": 171.0,
              "3": 181.0,
              "4": 192.0,
              "5": 203.0,
              "6": 213.0,
              "7": 224.0,
              "8": 235.0,
              "9": 245.0,
              "10": 256.0,
              "11": 267.0,
              "12": 277.0,
              "13": 288.0,
              "14": 299.0,
              "15": 309.0
            }
          },
          {
            "effectId": "Risty_high_e05",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Risty_high_e06",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Risty_high",
        "skillType": "高学年",
        "skillName": "ボクセルグリッチ",
        "description": "残りHP割合が最も低い敵3体にブロックを10個ずつ落として物理ダメージを与える。最後に落ちるブロックはより高いダメージを与え、気絶を付与する。スキル発動中に対象を変更できる。",
        "cooldownSeconds": 26.0
      },
      {
        "effects": [
          {
            "effectId": "Risty_passive_e01",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "パッシブ",
            "effectTarget": "敵",
            "reference": "高学年スキル",
            "levels": {
              "1": 4.0,
              "2": 4.2,
              "3": 4.4,
              "4": 4.6,
              "5": 4.8,
              "6": 5.0,
              "7": 5.2,
              "8": 5.4,
              "9": 5.6,
              "10": 5.8,
              "11": 6.0,
              "12": 6.2,
              "13": 6.4,
              "14": 6.6,
              "15": 6.8
            }
          }
        ],
        "skillId": "Risty_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "高学年スキルの気絶の持続時間が変更される。"
      },
      {
        "effects": [
          {
            "effectId": "Risty_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 80.0
          }
        ],
        "skillId": "Risty_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "飲み干した缶を投げて敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Risty_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 120.0
          },
          {
            "effectId": "Risty_enhanced_e02",
            "valueKind": "確定会心",
            "valueClass": "固定値",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 1.0
          }
        ],
        "skillId": "Risty_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに敵の個人情報を収集し、確定会心物理ダメージを与える。",
        "triggerType": "n回ごと",
        "triggerValue": 4.0
      }
    ],
    "favoriteCard": {
      "name": "リスティの模造グローブ",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Risty_favorite_1_e01",
                "processGroupId": "Risty_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "確定会心",
                "valueClass": "条件",
                "effectType": "攻撃",
                "triggerType": "n回ごと",
                "triggerValue": 3.0,
                "effectTarget": "敵"
              },
              {
                "effectId": "Risty_favorite_1_e02",
                "processGroupId": "Risty_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "SP回復",
                "valueClass": "固定値",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 3.0,
                "effectTarget": "自身"
              }
            ],
            "skillId": "Risty_favorite_1",
            "skillName": "愛用Lv1",
            "description": "3回攻撃するごとに敵をハッキングし、確定会心物理ダメージを与える。\n強化攻撃使用後、自身のSPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Risty_favorite_3_e01",
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Risty_favorite_3_e02",
                "valueKind": "会心ステータス増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Risty_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Risty_favorite_3",
            "skillName": "愛用Lv3",
            "description": "リスティの物理攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "本日のPOTG",
      "levels": {
        "1": {
          "name": "リーグ・オブ・エルフ最強者",
          "stats": [],
          "effects": [
            {
              "skillId": "Risty_aside_1",
              "effectId": "Risty_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Risty_aside_1",
              "effectId": "Risty_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Risty_aside_1",
              "effectId": "Risty_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Risty_aside_1",
              "effectId": "Risty_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "天才ハッカーの登場",
          "stats": [],
          "effects": [
            {
              "skillId": "Risty_aside_2",
              "effectId": "Risty_aside_2_e01",
              "processGroupId": "Risty_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "低学年スキルで敵撃破時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキルで敵撃破時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 75.0
            },
            {
              "skillId": "Risty_aside_2",
              "effectId": "Risty_aside_2_e02",
              "processGroupId": "Risty_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "SP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "回復",
              "triggerType": "低学年スキルで敵撃破時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキルで敵撃破時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 10.0
            },
            {
              "skillId": "Risty_aside_2",
              "effectId": "Risty_aside_2_e03",
              "valueKind": "追加物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "effectTarget": "残りHP割合が最も低い敵3体",
              "targetSkill": "高学年スキル",
              "fixedValue": 160.0
            },
            {
              "skillId": "Risty_aside_2",
              "effectId": "Risty_aside_2_e04",
              "valueKind": "追加攻撃",
              "valueClass": "回数",
              "effectType": "攻撃",
              "effectTarget": "残りHP割合が最も低い敵3体",
              "targetSkill": "高学年スキル",
              "fixedValue": 3.0
            }
          ],
          "description": "低学年スキルで敵を退治すると、SPを回復する。\n高学年スキル使用後、残りHP割合が最も低い敵3体に追加で3回物理ダメージを与える。"
        },
        "3": {
          "name": "リスティのスーパーセーブ",
          "stats": [
            {
              "skillId": "Risty_aside_3_global",
              "effectId": "Risty_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3.0
            },
            {
              "skillId": "Risty_aside_3_global",
              "effectId": "Risty_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Risty_aside_3_battle",
              "effectId": "Risty_aside_3_battle_e01",
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 4.0
            }
          ],
          "description": "後列の味方の1秒ごとのSP回復量を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "leets",
    "name": "リッツ",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "竜族",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 80.0,
      "combatPowerCorrectionB": 0.22
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 5.0,
      "atkM": 0.0,
      "defP": 4.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Leets_low_e07",
            "processGroupId": "Leets_low_charge",
            "processOrder": 1.0,
            "valueKind": "力溜め",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "triggerType": "低学年スキル使用時",
            "condition": "低学年スキル使用時から力溜め終了まで",
            "effectTarget": "自身",
            "targetSkill": "低学年スキル",
            "reference": "Leets_low_charge"
          },
          {
            "effectId": "Leets_low_e02",
            "processGroupId": "Leets_low_charge",
            "processOrder": 2.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "固有状態中",
            "conditionValue": "Leets_low_charge",
            "condition": "力を溜めている間は常時適用",
            "effectTarget": "自身",
            "fixedValue": 60.0
          },
          {
            "effectId": "Leets_low_e03",
            "processGroupId": "Leets_low_charge_stack",
            "processOrder": 1.0,
            "valueKind": "最大物理ダメージ量増加",
            "valueClass": "上限値",
            "effectType": "バフ",
            "effectStack": true,
            "triggerType": "味方被ダメージ時",
            "triggerValue": "前列/直接ダメージ",
            "conditionType": "固有状態中",
            "conditionValue": "Leets_low_charge",
            "condition": "力溜め中に前列の味方が直接ダメージを受けるたび増加。1回ごとの増加量と最大スタックは要調査",
            "effectTarget": "自身",
            "levels": {
              "1": 90.0,
              "2": 100.0,
              "3": 110.0,
              "4": 120.0,
              "5": 130.0,
              "6": 140.0,
              "7": 150.0,
              "8": 160.0,
              "9": 170.0,
              "10": 180.0,
              "11": 190.0,
              "12": 200.0
            }
          },
          {
            "effectId": "Leets_low_e04",
            "processGroupId": "Leets_low_charge_stack",
            "processOrder": 2.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "上限値",
            "effectType": "バフ",
            "effectStack": true,
            "triggerType": "味方被ダメージ時",
            "triggerValue": "前列/直接ダメージ",
            "conditionType": "固有状態中",
            "conditionValue": "Leets_low_charge",
            "condition": "初期60%を含む最終上限。追加80%として加算しない",
            "effectTarget": "自身",
            "fixedValue": 80.0
          },
          {
            "effectId": "Leets_low_e01",
            "processGroupId": "Leets_low_release",
            "processOrder": 1.0,
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "低学年スキル",
            "triggerType": "固有状態終了時",
            "triggerValue": "Leets_low_charge",
            "triggerSourceId": "Leets_low_e07",
            "condition": "力溜め終了時に発生",
            "effectTarget": "敵/範囲",
            "targetSkill": "低学年スキル",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          },
          {
            "effectId": "Leets_low_e05",
            "processGroupId": "Leets_low_release",
            "processOrder": 2.0,
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerType": "攻撃命中時",
            "triggerSourceId": "Leets_low_e01",
            "effectTarget": "敵/範囲",
            "targetSkill": "低学年スキル"
          },
          {
            "effectId": "Leets_low_e06",
            "processGroupId": "Leets_low_release",
            "processOrder": 3.0,
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "triggerSourceId": "Leets_low_e05",
            "effectTarget": "敵/範囲",
            "targetSkill": "低学年スキル",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Leets_low",
        "skillType": "低学年",
        "skillName": "精錬の一撃",
        "description": "少しの間力を溜め、被ダメージ量が減少する。 力を溜めている間、前列の味方が直接ダメージを受けるたびに、自身の物理ダメージ量が上昇し、被ダメージ量減少効果が追加で増加する。 力を溜め終わると、敵に範囲物理ダメージを与え、苦痛を付与する。"
      },
      {
        "effects": [
          {
            "effectId": "Leets_high_e01",
            "processGroupId": "Leets_high_attack",
            "processOrder": 1.0,
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "高学年スキル",
            "condition": "1～2撃目",
            "effectTarget": "敵/範囲",
            "targetSkill": "高学年スキル",
            "levels": {
              "1": 100.0,
              "2": 110.0,
              "3": 120.0,
              "4": 130.0,
              "5": 140.0,
              "6": 150.0,
              "7": 160.0,
              "8": 170.0,
              "9": 180.0,
              "10": 190.0,
              "11": 200.0,
              "12": 210.0
            }
          },
          {
            "effectId": "Leets_high_e03",
            "processGroupId": "Leets_high_attack",
            "processOrder": 2.0,
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "attackCategory": "高学年スキル",
            "condition": "通常倍率部分のヒット数",
            "effectTarget": "敵/範囲",
            "targetSkill": "高学年スキル",
            "fixedValue": 2.0
          },
          {
            "effectId": "Leets_high_e02",
            "processGroupId": "Leets_high_attack",
            "processOrder": 3.0,
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "高学年スキル",
            "triggerType": "規定ヒット時",
            "triggerValue": 3.0,
            "condition": "3撃目のみ",
            "effectTarget": "敵/範囲",
            "targetSkill": "高学年スキル",
            "levels": {
              "1": 150.0,
              "2": 165.0,
              "3": 180.0,
              "4": 195.0,
              "5": 210.0,
              "6": 225.0,
              "7": 240.0,
              "8": 255.0,
              "9": 270.0,
              "10": 285.0,
              "11": 300.0,
              "12": 315.0
            }
          },
          {
            "effectId": "Leets_high_e04",
            "processGroupId": "Leets_high_attack",
            "processOrder": 4.0,
            "valueKind": "後退",
            "valueClass": "移動",
            "effectType": "スキル制御",
            "triggerType": "効果発生後",
            "triggerSourceId": "Leets_high_e02",
            "condition": "最後の一撃後に自身が後退",
            "effectTarget": "自身",
            "targetSkill": "高学年スキル"
          }
        ],
        "skillId": "Leets_high",
        "skillType": "高学年",
        "skillName": "鍛冶乱撃",
        "description": "敵を3回切りつけ、範囲物理ダメージを与える。 最後の一撃の後、反動で後ろに下がる。",
        "cooldownSeconds": 30.0
      },
      {
        "effects": [
          {
            "effectId": "Leets_passive_e03",
            "processGroupId": "Leets_passive_target",
            "processOrder": 1.0,
            "valueKind": "目標",
            "valueClass": "状態付与",
            "effectType": "固有状態",
            "triggerType": "攻撃対象設定時",
            "condition": "攻撃対象変更時または対象戦闘不能時に付け替える。解除・状態異常抵抗の対象外",
            "effectTarget": "敵/現在の攻撃対象",
            "reference": "Leets_target"
          },
          {
            "effectId": "Leets_passive_e01",
            "processGroupId": "Leets_passive_modifier",
            "processOrder": 1.0,
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "攻撃対象状態",
            "conditionValue": "Leets_target/付与者=自身",
            "condition": "自身が目標を付与した敵へ攻撃する時",
            "effectTarget": "自身",
            "levels": {
              "1": 60.0,
              "2": 66.0,
              "3": 72.0,
              "4": 78.0,
              "5": 84.0,
              "6": 90.0,
              "7": 96.0,
              "8": 102.0,
              "9": 108.0,
              "10": 114.0,
              "11": 120.0,
              "12": 126.0
            }
          },
          {
            "effectId": "Leets_passive_e02",
            "processGroupId": "Leets_passive_modifier",
            "processOrder": 2.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "攻撃元状態",
            "conditionValue": "Leets_target/付与者=自身",
            "condition": "自身が目標を付与した敵から攻撃を受ける時",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0
            }
          }
        ],
        "skillId": "Leets_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "目標の敵への与ダメージ量が増加し、目標の敵からの被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Leets_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 60.0
          },
          {
            "effectId": "Leets_basic_e02",
            "valueKind": "2回目の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 90.0
          }
        ],
        "skillId": "Leets_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "大剣を薙ぎ払って敵に範囲物理ダメージを2回与える。 2回目はより高い物理ダメージ。"
      },
      {
        "effects": [
          {
            "effectId": "Leets_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 200.0
          },
          {
            "effectId": "Leets_enhanced_e02",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          }
        ],
        "skillId": "Leets_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で敵に範囲物理ダメージを与える。 ノックバックさせる。",
        "triggerType": "一定確率",
        "triggerValue": 25.0
      }
    ],
    "favoriteCard": {
      "name": "リッツのすり減った砥石",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Leets_favorite_1_e01",
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "与ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "目標の敵へ攻撃時",
                "effectTarget": "自身",
                "levels": {
                  "1": 60.0,
                  "2": 66.0,
                  "3": 72.0,
                  "4": 78.0,
                  "5": 84.0,
                  "6": 90.0,
                  "7": 96.0,
                  "8": 102.0,
                  "9": 108.0,
                  "10": 114.0,
                  "11": 120.0,
                  "12": 126.0
                }
              },
              {
                "effectId": "Leets_favorite_1_e02",
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "目標の敵からの攻撃時",
                "effectTarget": "自身",
                "levels": {
                  "1": 24.0,
                  "2": 26.0,
                  "3": 28.0,
                  "4": 30.0,
                  "5": 32.0,
                  "6": 34.0,
                  "7": 36.0,
                  "8": 38.0,
                  "9": 40.0,
                  "10": 42.0,
                  "11": 44.0,
                  "12": 46.0
                }
              },
              {
                "effectId": "Leets_favorite_1_e03",
                "targetSkill": "パッシブ",
                "targetSkillName": "パッシブスキル",
                "valueKind": "基本攻撃ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 100.0
              },
              {
                "effectId": "Leets_favorite_1_e04",
                "targetSkill": "低学年",
                "targetSkillName": "精錬の一撃",
                "valueKind": "被ダメージ無効",
                "valueClass": "状態免疫",
                "effectType": "バフ",
                "effectTarget": "自身"
              }
            ],
            "skillId": "Leets_favorite_1",
            "skillName": "愛用Lv1",
            "description": "目標の敵への与ダメージ量が増加し、目標の敵からの被ダメージ量が減少し、目標の敵への基本攻撃のダメージ量が増加する。\n精錬の一撃で力を溜めている間、目標の敵からダメージを受けない。\n力を溜めている間、目標の敵からダメージを受けない。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Leets_favorite_3_e01",
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Leets_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Leets_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Leets_favorite_3",
            "skillName": "愛用Lv3",
            "description": "リッツの物理攻撃力、会心、会心ダメージが増加する。"
          }
        ]
      }
    },
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "renewa",
    "name": "リニュア",
    "basic": {
      "rarity": 3.0,
      "eldain": "永遠のこだま",
      "personality": "狂気",
      "race": "エルフ",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 160.0,
      "spRecoveryPerSecond": 40.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.37
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Renewa_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600.0,
              "2": 700.0,
              "3": 800.0,
              "4": 900.0,
              "5": 1000.0,
              "6": 1100.0,
              "7": 1200.0,
              "8": 1300.0,
              "9": 1400.0,
              "10": 1500.0,
              "11": 1600.0,
              "12": 1700.0,
              "13": 1800.0,
              "14": 1900.0,
              "15": 2000.0
            }
          },
          {
            "effectId": "Renewa_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 5.0
          },
          {
            "effectId": "Renewa_low_e03",
            "valueKind": "HP回復量減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 40.0
          },
          {
            "effectId": "Renewa_low_e04",
            "valueKind": "HP回復量減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 5.0
          },
          {
            "effectId": "Renewa_low_e05",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 20.0
          },
          {
            "effectId": "Renewa_low_e06",
            "valueKind": "シールド解除",
            "valueClass": "解除",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵1体"
          }
        ],
        "skillId": "Renewa_low",
        "skillType": "低学年",
        "skillName": "時空のこだま",
        "description": "敵に集中砲撃を浴びせ、範囲物理ダメージを5回与える。奇数回目の砲撃は敵のHP回復量を減少させる。偶数回目の砲撃は自身のHPを回復して敵にかかっているシールドを1つ解除する。"
      },
      {
        "effects": [
          {
            "effectId": "Renewa_high_e01",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 1.0,
            "valueKind": "全行動速度を徐々に加速",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "levels": {
              "1": 20.0,
              "2": 24.0,
              "3": 28.0,
              "4": 32.0,
              "5": 36.0,
              "6": 40.0,
              "7": 44.0,
              "8": 48.0,
              "9": 52.0,
              "10": 56.0,
              "11": 60.0,
              "12": 64.0,
              "13": 68.0,
              "14": 72.0,
              "15": 76.0
            }
          },
          {
            "effectId": "Renewa_high_e02",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 2.0,
            "valueKind": "全行動速度を徐々に加速",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "fixedValue": 7.0
          },
          {
            "effectId": "Renewa_high_e03",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 3.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          },
          {
            "effectId": "Renewa_high_e04",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 4.0,
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "fixedValue": 10.0
          },
          {
            "effectId": "Renewa_high_e05",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 5.0,
            "valueKind": "全行動速度を徐々に減速",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体"
          },
          {
            "effectId": "Renewa_high_e06",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 6.0,
            "valueKind": "全行動速度を徐々に減速",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体",
            "fixedValue": 7.0
          },
          {
            "effectId": "Renewa_high_e07",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 7.0,
            "valueKind": "時間停止",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体"
          },
          {
            "effectId": "Renewa_high_e08",
            "processGroupId": "Renewa_high_proc01",
            "processOrder": 8.0,
            "valueKind": "時間停止",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "高学年スキル使用時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体",
            "fixedValue": 3.0
          },
          {
            "effectId": "Renewa_high_e09",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵全員",
            "levels": {
              "1": 600.0,
              "2": 660.0,
              "3": 720.0,
              "4": 780.0,
              "5": 840.0,
              "6": 900.0,
              "7": 960.0,
              "8": 1020.0,
              "9": 1080.0,
              "10": 1140.0,
              "11": 1200.0,
              "12": 1260.0,
              "13": 1320.0,
              "14": 1380.0,
              "15": 1440.0
            }
          }
        ],
        "skillId": "Renewa_high",
        "skillType": "高学年",
        "skillName": "タイム・ブレイク",
        "description": "味方の全行動速度を徐々に加速させ、被ダメージ量を減少させる。敵の全行動速度を徐々に減速させ、一定時間停止させる。敵を停止させている間、敵全員に6回物理ダメージを与える。上記効果は発動時にフィールドにいた対象にのみ適用される。",
        "cooldownSeconds": 40.0
      },
      {
        "effects": [
          {
            "effectId": "Renewa_passive_e01",
            "valueKind": "沈黙",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "effectTarget": "自身"
          },
          {
            "effectId": "Renewa_passive_e02",
            "valueKind": "対純粋与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "敵性格",
            "conditionValue": "純粋",
            "condition": "純粋性格攻撃時",
            "effectTarget": "味方アタッカー",
            "levels": {
              "1": 30.0,
              "2": 34.0,
              "3": 38.0,
              "4": 42.0,
              "5": 46.0,
              "6": 50.0,
              "7": 54.0,
              "8": 58.0,
              "9": 62.0,
              "10": 66.0,
              "11": 70.0,
              "12": 74.0,
              "13": 78.0,
              "14": 82.0,
              "15": 86.0
            }
          }
        ],
        "skillId": "Renewa_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "沈黙の免疫を持つ。味方アタッカーの純粋への与ダメージ量を増加させる。"
      },
      {
        "effects": [
          {
            "effectId": "Renewa_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 90.0
          }
        ],
        "skillId": "Renewa_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "敵に魔導工学エネルギーを発射し、物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Renewa_enhanced_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 360.0
          },
          {
            "effectId": "Renewa_enhanced_e02",
            "processGroupId": "Renewa_enhanced_proc01",
            "processOrder": 1.0,
            "valueKind": "物理攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 25.0
          },
          {
            "effectId": "Renewa_enhanced_e03",
            "processGroupId": "Renewa_enhanced_proc01",
            "processOrder": 2.0,
            "valueKind": "物理攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Renewa_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに魔導工学レーザーを発射し、敵に範囲物理ダメージを与え、一定時間物理攻撃力が増加する。",
        "triggerType": "n回ごと",
        "triggerValue": 4.0
      }
    ],
    "favoriteCard": {
      "name": "リニュアのタイムパラドックス",
      "kind": "スペル",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Renewa_favorite_1_e01",
                "processGroupId": "Renewa_favorite_1_proc01",
                "processOrder": 1.0,
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n秒ごと",
                "triggerValue": 15.0,
                "conditionType": "編成中",
                "conditionValue": "Renewa",
                "condition": "リニュア編成時15秒ごとに",
                "effectTarget": "攻撃力が最も高い味方の使徒",
                "fixedValue": 50.0
              },
              {
                "effectId": "Renewa_favorite_1_e02",
                "processGroupId": "Renewa_favorite_1_proc01",
                "processOrder": 2.0,
                "valueKind": "攻撃速度増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n秒ごと",
                "triggerValue": 15.0,
                "conditionType": "編成中",
                "conditionValue": "Renewa",
                "condition": "リニュア編成時15秒ごとに",
                "effectTarget": "攻撃力が最も高い味方の使徒",
                "fixedValue": 10.0
              }
            ],
            "skillId": "Renewa_favorite_1",
            "skillName": "愛用Lv1",
            "description": "デッキにリニュアが編成されている場合、以下の効果が発動する。\n15秒ごとに攻撃力が最も高い味方の使徒の攻撃速度を増加させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Renewa_favorite_3_e01",
                "targetSkill": "高学年",
                "valueKind": "クールタイム減少",
                "valueClass": "クールタイム",
                "effectType": "クールタイム",
                "effectTarget": "自身",
                "reference": "高学年スキル",
                "fixedValue": 5.0
              }
            ],
            "skillId": "Renewa_favorite_3",
            "skillName": "愛用Lv3",
            "description": "リニュアの高学年スキルのクールタイムが5秒減少する。"
          }
        ]
      }
    },
    "aside": {
      "name": "壊れたドゥームズデイ・クロック",
      "levels": {
        "1": {
          "name": "止まった時間",
          "stats": [],
          "effects": [
            {
              "skillId": "Renewa_aside_1",
              "effectId": "Renewa_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Renewa_aside_1",
              "effectId": "Renewa_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Renewa_aside_1",
              "effectId": "Renewa_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Renewa_aside_1",
              "effectId": "Renewa_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "時空の彼方へ！",
          "stats": [],
          "effects": [
            {
              "skillId": "Renewa_aside_2",
              "effectId": "Renewa_aside_2_e01",
              "processGroupId": "Renewa_aside_2_missile_periodic",
              "processOrder": 1.0,
              "valueKind": "追加物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "n秒ごと",
              "triggerValue": 6.0,
              "condition": "6秒経過時（繰り返し）",
              "effectTarget": "敵/中央に位置する敵",
              "fixedValue": 200.0
            },
            {
              "skillId": "Renewa_aside_2",
              "effectId": "Renewa_aside_2_e02",
              "processGroupId": "Renewa_aside_2_missile_low",
              "processOrder": 1.0,
              "valueKind": "追加物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "Renewa_low",
              "conditionType": "対象スキル",
              "conditionValue": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "敵/中央に位置する敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 200.0
            },
            {
              "skillId": "Renewa_aside_2",
              "effectId": "Renewa_aside_2_e03",
              "processGroupId": "Renewa_aside_2_missile_enhanced",
              "processOrder": 1.0,
              "valueKind": "追加物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "triggerType": "強化攻撃使用時",
              "triggerSourceId": "Renewa_enhanced",
              "conditionType": "対象スキル",
              "conditionValue": "強化攻撃",
              "condition": "高学年スキル使用時",
              "effectTarget": "敵/中央に位置する敵",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 200.0
            },
            {
              "skillId": "Renewa_aside_2",
              "effectId": "Renewa_aside_2_e04",
              "valueKind": "敵現在高学年クールタイム増加",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "敵",
              "targetSkill": "敵高学年スキル",
              "fixedValue": 1.0
            },
            {
              "skillId": "Renewa_aside_2",
              "effectId": "Renewa_aside_2_e05",
              "valueKind": "自分現在高学年クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 2.0
            }
          ],
          "description": "6秒経過、または強化攻撃、低学年スキル使用時、中央に位置する敵にミサイルを投下する。\nミサイルは敵に範囲物理ダメージを与え、命中時に現在高学年スキルのクールタイムを即時増加させる。\nミサイルが爆発すると、自身の現在高学年スキルのクールタイムが即時減少する。"
        },
        "3": {
          "name": "私たちの平和な時間",
          "stats": [
            {
              "skillId": "Renewa_aside_3_global",
              "effectId": "Renewa_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 4.0
            },
            {
              "skillId": "Renewa_aside_3_global",
              "effectId": "Renewa_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Renewa_aside_3_battle",
              "effectId": "Renewa_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 22.0
            }
          ],
          "description": "味方全員の敵への与ダメージを増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "rim",
    "name": "リム",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "幽霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Rim_low_e01",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 16.0,
              "2": 16.5,
              "3": 17.0,
              "4": 17.5,
              "5": 18.0,
              "6": 18.5,
              "7": 19.0,
              "8": 19.5,
              "9": 20.0,
              "10": 20.5,
              "11": 21.0,
              "12": 21.5,
              "13": 22.0,
              "14": 22.5,
              "15": 23.0
            }
          },
          {
            "effectId": "Rim_low_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 250.0,
              "2": 280.0,
              "3": 310.0,
              "4": 340.0,
              "5": 370.0,
              "6": 400.0,
              "7": 430.0,
              "8": 460.0,
              "9": 490.0,
              "10": 520.0,
              "11": 550.0,
              "12": 580.0,
              "13": 610.0,
              "14": 640.0,
              "15": 670.0
            }
          },
          {
            "effectId": "Rim_low_e03",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rim_low_e04",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵",
            "fixedValue": 10.0
          },
          {
            "effectId": "Rim_low_e05",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          }
        ],
        "skillId": "Rim_low",
        "skillType": "低学年",
        "skillName": "スクラッチサイド",
        "description": "闇が降り、HPを回復する。斬撃を放ち、敵に範囲物理ダメージを与えて苦痛を付与し、ノックバックさせる。"
      },
      {
        "effects": [
          {
            "effectId": "Rim_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 400.0,
              "2": 430.0,
              "3": 460.0,
              "4": 490.0,
              "5": 520.0,
              "6": 550.0,
              "7": 580.0,
              "8": 610.0,
              "9": 640.0,
              "10": 670.0,
              "11": 700.0,
              "12": 730.0,
              "13": 760.0,
              "14": 790.0,
              "15": 820.0
            }
          },
          {
            "effectId": "Rim_high_e02",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600.0,
              "2": 630.0,
              "3": 660.0,
              "4": 690.0,
              "5": 720.0,
              "6": 750.0,
              "7": 780.0,
              "8": 810.0,
              "9": 840.0,
              "10": 870.0,
              "11": 900.0,
              "12": 930.0,
              "13": 960.0,
              "14": 990.0,
              "15": 1020.0
            }
          },
          {
            "effectId": "Rim_high_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 2.0
          },
          {
            "effectId": "Rim_high_e04",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最後の一撃与ダメージ量",
            "fixedValue": 250.0
          },
          {
            "effectId": "Rim_high_e05",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          }
        ],
        "skillId": "Rim_high",
        "skillType": "高学年",
        "skillName": "グリムリーパー",
        "description": "グリムの力を解放し、敵に斬撃を放ち、範囲物理ダメージを2回与えノックバックさせる。そして自身のHPを回復する。",
        "cooldownSeconds": 56.0
      },
      {
        "effects": [
          {
            "effectId": "Rim_passive_e01",
            "valueKind": "撃破時HP回復量",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 16.0,
              "2": 16.5,
              "3": 17.0,
              "4": 17.5,
              "5": 18.0,
              "6": 18.5,
              "7": 19.0,
              "8": 19.5,
              "9": 20.0,
              "10": 20.5,
              "11": 21.0,
              "12": 21.5,
              "13": 22.0,
              "14": 22.5,
              "15": 23.0
            }
          }
        ],
        "skillId": "Rim_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "直接ダメージで敵を倒すと、自身のHPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Rim_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 100.0
          },
          {
            "effectId": "Rim_basic_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rim_basic_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "範囲内の敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Rim_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "鎌を薙ぎ払って敵に範囲物理ダメージを与え、一定確率で苦痛を付与する。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "パーティの主催者リム",
      "levels": {
        "1": {
          "name": "アモール・パーティ",
          "stats": [],
          "effects": [
            {
              "skillId": "Rim_aside_1",
              "effectId": "Rim_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rim_aside_1",
              "effectId": "Rim_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rim_aside_1",
              "effectId": "Rim_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rim_aside_1",
              "effectId": "Rim_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "リカバリム",
          "stats": [],
          "effects": [
            {
              "skillId": "Rim_aside_2",
              "effectId": "Rim_aside_2_e01",
              "processGroupId": "Rim_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "直接攻撃命中時",
              "triggerSourceId": "直接攻撃",
              "conditionType": "対象状態",
              "conditionValue": "苦痛",
              "condition": "苦痛付与敵に直接攻撃時",
              "effectTarget": "自身",
              "fixedValue": 15.0
            },
            {
              "skillId": "Rim_aside_2",
              "effectId": "Rim_aside_2_e02",
              "processGroupId": "Rim_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "物理攻撃力増加の持続時間",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "直接攻撃命中時",
              "triggerSourceId": "直接攻撃",
              "conditionType": "対象状態",
              "conditionValue": "苦痛",
              "condition": "苦痛付与敵に直接攻撃時",
              "effectTarget": "自身",
              "fixedValue": 4.0
            },
            {
              "skillId": "Rim_aside_2",
              "effectId": "Rim_aside_2_e03",
              "valueKind": "物理攻撃力増加の最大スタック数",
              "valueClass": "スタック数",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 4.0
            },
            {
              "skillId": "Rim_aside_2",
              "effectId": "Rim_aside_2_e04",
              "valueKind": "低学年スキルダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 50.0
            },
            {
              "skillId": "Rim_aside_2",
              "effectId": "Rim_aside_2_e05",
              "valueKind": "低学年HP回復量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 100.0
            },
            {
              "skillId": "Rim_aside_2",
              "effectId": "Rim_aside_2_e06",
              "valueKind": "高学年スキルダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 50.0
            }
          ],
          "description": "苦痛を付与された敵に直接ダメージを与えると物理攻撃力が増加する。物理攻撃力増加は、最大4回スタックする。\n低学年、高学年スキルのダメージが増加する。低学年のHP回復値が2倍になる。"
        },
        "3": {
          "name": "君たちの瞳に乾杯！",
          "stats": [
            {
              "skillId": "Rim_aside_3_global",
              "effectId": "Rim_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4.0
            },
            {
              "skillId": "Rim_aside_3_global",
              "effectId": "Rim_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 4.0
            }
          ],
          "effects": [
            {
              "skillId": "Rim_aside_3_battle",
              "effectId": "Rim_aside_3_battle_e01",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全員",
              "fixedValue": 10.5
            }
          ],
          "description": "味方全員の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "rudd",
    "name": "ルード",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "竜族",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 3.0,
      "atkM": 0.0,
      "defP": 5.0,
      "defM": 4.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Rudd_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 160.0,
              "2": 175.0,
              "3": 190.0,
              "4": 205.0,
              "5": 220.0,
              "6": 235.0,
              "7": 250.0,
              "8": 265.0,
              "9": 280.0,
              "10": 295.0,
              "11": 310.0,
              "12": 325.0,
              "13": 340.0,
              "14": 355.0,
              "15": 370.0
            }
          },
          {
            "effectId": "Rudd_low_e02",
            "valueKind": "ノイズ",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rudd_low_e03",
            "valueKind": "ノイズ",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3.5
          },
          {
            "effectId": "Rudd_low_e04",
            "valueKind": "即時HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 6.0,
              "2": 6.5,
              "3": 7.0,
              "4": 7.5,
              "5": 8.0,
              "6": 8.5,
              "7": 9.0,
              "8": 9.5,
              "9": 10.0,
              "10": 10.5,
              "11": 11.0,
              "12": 11.5,
              "13": 12.0,
              "14": 12.5,
              "15": 13.0
            }
          },
          {
            "effectId": "Rudd_low_e05",
            "valueKind": "毎秒HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 6.0,
              "2": 6.5,
              "3": 7.0,
              "4": 7.5,
              "5": 8.0,
              "6": 8.5,
              "7": 9.0,
              "8": 9.5,
              "9": 10.0,
              "10": 10.5,
              "11": 11.0,
              "12": 11.5,
              "13": 12.0,
              "14": 12.5,
              "15": 13.0
            }
          },
          {
            "effectId": "Rudd_low_e06",
            "valueKind": "HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 3.0
          }
        ],
        "skillId": "Rudd_low",
        "skillType": "低学年",
        "skillName": "もぉいっちょぉ！",
        "description": "HPが50%未満の場合、HPを1秒ごとに回復する。 叫び声を上げて敵に範囲物理ダメージを与える。 ノイズを付与する。 すぐにHPを回復する。"
      },
      {
        "effects": [
          {
            "effectId": "Rudd_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 90.0,
              "2": 99.0,
              "3": 108.0,
              "4": 117.0,
              "5": 126.0,
              "6": 135.0,
              "7": 144.0,
              "8": 153.0,
              "9": 162.0,
              "10": 171.0,
              "11": 180.0,
              "12": 189.0,
              "13": 198.0,
              "14": 207.0,
              "15": 216.0
            }
          },
          {
            "effectId": "Rudd_high_e02",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 60.0,
              "2": 66.0,
              "3": 72.0,
              "4": 78.0,
              "5": 84.0,
              "6": 90.0,
              "7": 96.0,
              "8": 102.0,
              "9": 108.0,
              "10": 114.0,
              "11": 120.0,
              "12": 126.0,
              "13": 132.0,
              "14": 138.0,
              "15": 144.0
            }
          },
          {
            "effectId": "Rudd_high_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 5.0
          },
          {
            "effectId": "Rudd_high_e04",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 12.0,
              "2": 13.0,
              "3": 14.0,
              "4": 15.0,
              "5": 16.0,
              "6": 17.0,
              "7": 18.0,
              "8": 19.0,
              "9": 20.0,
              "10": 21.0,
              "11": 22.0,
              "12": 23.0,
              "13": 24.0,
              "14": 25.0,
              "15": 26.0
            }
          },
          {
            "effectId": "Rudd_high_e05",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rudd_high_e06",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rudd_high_e07",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Rudd_high",
        "skillType": "高学年",
        "skillName": "インパクトプレス",
        "description": "地面を強く5回叩きつけ、敵に範囲物理ダメージを与える。 最後の一撃はより高い範囲物理ダメージを与える。 最後の一撃時に自身のHPを回復する。 ノックバックさせる。 気絶を付与する。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Rudd_passive_e01",
            "valueKind": "物理被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 26.0,
              "3": 28.0,
              "4": 30.0,
              "5": 32.0,
              "6": 34.0,
              "7": 36.0,
              "8": 38.0,
              "9": 40.0,
              "10": 42.0,
              "11": 44.0,
              "12": 46.0,
              "13": 48.0,
              "14": 50.0,
              "15": 52.0
            }
          },
          {
            "effectId": "Rudd_passive_e02",
            "valueKind": "発動条件",
            "valueClass": "被弾回数",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 6.0
          },
          {
            "effectId": "Rudd_passive_e03",
            "processGroupId": "Rudd_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "無敵",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 6.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "直接ダメージを6回受けた時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Rudd_passive_e04",
            "processGroupId": "Rudd_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 6.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "直接ダメージを6回受けた時",
            "effectTarget": "自身",
            "fixedValue": 2.0
          },
          {
            "effectId": "Rudd_passive_e05",
            "processGroupId": "Rudd_passive_proc01",
            "processOrder": 3.0,
            "valueKind": "無敵",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "triggerType": "被ダメージ回数",
            "triggerValue": 6.0,
            "triggerSourceId": "直接ダメージ",
            "condition": "直接ダメージを6回受けた時",
            "effectTarget": "自身",
            "fixedValue": 15.0
          }
        ],
        "skillId": "Rudd_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "直接ダメージを6回受けると自身に無敵を付与する。 物理被ダメージ量が減少する。"
      },
      {
        "effects": [
          {
            "effectId": "Rudd_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Rudd_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "拳を振るい、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {
      "name": "ルードのトレーニング教本",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Rudd_favorite_1_e01",
                "processGroupId": "Rudd_favorite_1_proc01",
                "processOrder": 1.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 4.0,
                "effectTarget": "自身",
                "fixedValue": 30.0
              },
              {
                "effectId": "Rudd_favorite_1_e02",
                "processGroupId": "Rudd_favorite_1_proc01",
                "processOrder": 2.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 4.0,
                "effectTarget": "自身",
                "fixedValue": 6.0
              },
              {
                "effectId": "Rudd_favorite_1_e03",
                "processGroupId": "Rudd_favorite_1_proc01",
                "processOrder": 3.0,
                "targetSkill": "普通攻撃_強化",
                "targetSkillName": "強化",
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "triggerType": "n回ごと",
                "triggerValue": 4.0,
                "effectTarget": "自身",
                "reference": "最大HP",
                "fixedValue": 20.0
              }
            ],
            "skillId": "Rudd_favorite_1",
            "skillName": "愛用Lv1",
            "description": "4回攻撃をするごとにポーズを決める。\nポーズを決めると一定時間、自身の被ダメージが減少する。\nポーズが終わると、自身のHPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Rudd_favorite_3_e01",
                "valueKind": "HP",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Rudd_favorite_3_e02",
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Rudd_favorite_3_e03",
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Rudd_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ルードのHP、会心抵抗、会心ダメージ抵抗が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "ルビーのダンベル",
      "levels": {
        "1": {
          "name": "筋肉減少防止",
          "stats": [],
          "effects": [
            {
              "skillId": "Rudd_aside_1",
              "effectId": "Rudd_aside_1_e01",
              "valueKind": "HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 12.0
            },
            {
              "skillId": "Rudd_aside_1",
              "effectId": "Rudd_aside_1_e02",
              "valueKind": "物理防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 12.0
            },
            {
              "skillId": "Rudd_aside_1",
              "effectId": "Rudd_aside_1_e03",
              "valueKind": "魔法防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 12.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "たんぱく質補給",
          "stats": [],
          "effects": [
            {
              "skillId": "Rudd_aside_2",
              "effectId": "Rudd_aside_2_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "skillId": "Rudd_aside_2",
              "effectId": "Rudd_aside_2_e02",
              "valueKind": "自分現在高学年クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 1.0
            },
            {
              "skillId": "Rudd_aside_2",
              "effectId": "Rudd_aside_2_e03",
              "processGroupId": "Rudd_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "即時HP回復量",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 12.0,
                "2": 13.0,
                "3": 14.0,
                "4": 15.0,
                "5": 16.0,
                "6": 17.0,
                "7": 18.0,
                "8": 19.0,
                "9": 20.0,
                "10": 21.0,
                "11": 22.0,
                "12": 23.0,
                "13": 24.0,
                "14": 25.0,
                "15": 26.0
              }
            },
            {
              "skillId": "Rudd_aside_2",
              "effectId": "Rudd_aside_2_e04",
              "processGroupId": "Rudd_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "毎秒HP回復量",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "低学年スキル使用時",
              "triggerSourceId": "低学年スキル",
              "condition": "低学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 12.0,
                "2": 13.0,
                "3": 14.0,
                "4": 15.0,
                "5": 16.0,
                "6": 17.0,
                "7": 18.0,
                "8": 19.0,
                "9": 20.0,
                "10": 21.0,
                "11": 22.0,
                "12": 23.0,
                "13": 24.0,
                "14": 25.0,
                "15": 26.0
              }
            }
          ],
          "description": "最大HPが増加する。\n普通攻撃命中時に、現在高学年スキルのクールタイムが即時減少する。\n低学年スキルのHP回復割合が2倍になる。"
        },
        "3": {
          "name": "筋肉先発隊",
          "stats": [
            {
              "skillId": "Rudd_aside_3_global",
              "effectId": "Rudd_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3.0
            },
            {
              "skillId": "Rudd_aside_3_global",
              "effectId": "Rudd_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Rudd_aside_3_battle",
              "effectId": "Rudd_aside_3_battle_e01",
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 4.0
            }
          ],
          "description": "前列の味方の1秒ごとのSP回復量を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "rufo",
    "name": "ルポ",
    "basic": {
      "rarity": 3.0,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Rufo_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も後ろにいる敵",
            "levels": {
              "1": 420.0,
              "2": 462.0,
              "3": 504.0,
              "4": 546.0,
              "5": 588.0,
              "6": 630.0,
              "7": 672.0,
              "8": 714.0,
              "9": 756.0,
              "10": 798.0,
              "11": 840.0,
              "12": 882.0
            }
          },
          {
            "effectId": "Rufo_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も後ろにいる敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Rufo_low",
        "skillType": "低学年",
        "skillName": "ルポ流神速斬り",
        "description": "瞬間移動した後、指定範囲内で最も後ろにいる敵に4回物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Rufo_high_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も後ろにいる敵/範囲内の敵",
            "levels": {
              "1": 350.0,
              "2": 385.0,
              "3": 420.0,
              "4": 455.0,
              "5": 490.0,
              "6": 525.0,
              "7": 560.0,
              "8": 595.0,
              "9": 630.0,
              "10": 665.0,
              "11": 700.0,
              "12": 735.0
            }
          },
          {
            "effectId": "Rufo_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も後ろにいる敵/範囲内の敵",
            "fixedValue": 8.0
          },
          {
            "effectId": "Rufo_high_e03",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "conditionType": "行動区間",
            "conditionValue": "Rufo_high:回転",
            "condition": "高学年スキルで回転時",
            "effectTarget": "自身",
            "fixedValue": 50.0
          },
          {
            "effectId": "Rufo_high_e04",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "指定範囲内で最も後ろにいる敵/範囲内の敵"
          }
        ],
        "skillId": "Rufo_high",
        "skillType": "高学年",
        "skillName": "奥義：狐旋風！",
        "description": "瞬間移動して素早く回転し、指定範囲内で最も後ろにいる敵に範囲物理ダメージを8回与える。 回転中は防御力が増加する。 ノックバックさせる。",
        "cooldownSeconds": 24.0
      },
      {
        "effects": [
          {
            "effectId": "Rufo_passive_e01",
            "valueKind": "強化攻撃与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 24.0,
              "2": 28.0,
              "3": 32.0,
              "4": 36.0,
              "5": 40.0,
              "6": 44.0,
              "7": 48.0,
              "8": 52.0,
              "9": 56.0,
              "10": 60.0,
              "11": 64.0,
              "12": 68.0
            }
          }
        ],
        "skillId": "Rufo_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃のダメージ量が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Rufo_basic_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          },
          {
            "effectId": "Rufo_basic_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Rufo_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "短剣を振るい、敵に2回物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Rufo_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 200.0
          },
          {
            "effectId": "Rufo_enhanced_e02",
            "processGroupId": "Rufo_enhanced_proc01",
            "processOrder": 1.0,
            "valueKind": "目くらまし",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Rufo_enhanced_e03",
            "processGroupId": "Rufo_enhanced_proc01",
            "processOrder": 2.0,
            "valueKind": "目くらまし",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "強化攻撃使用時",
            "triggerSourceId": "強化攻撃",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Rufo_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で短剣を薙ぎ払って敵に物理ダメージを与える。 自身に目くらましを付与する。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "ブレーンルポ",
      "levels": {
        "1": {
          "name": "反アニマル缶戦線の知識王",
          "stats": [],
          "effects": [
            {
              "skillId": "Rufo_aside_1",
              "effectId": "Rufo_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rufo_aside_1",
              "effectId": "Rufo_aside_1_e02",
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rufo_aside_1",
              "effectId": "Rufo_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rufo_aside_1",
              "effectId": "Rufo_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "三銃士の大冒険",
          "stats": [],
          "effects": [
            {
              "skillId": "Rufo_aside_2",
              "effectId": "Rufo_aside_2_e01",
              "valueKind": "普通攻撃ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "damageModifierCategory": "行動倍率",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃",
              "fixedValue": 200.0
            },
            {
              "skillId": "Rufo_aside_2",
              "effectId": "Rufo_aside_2_e02",
              "processGroupId": "Rufo_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "triggerType": "状態付与時",
              "triggerSourceId": "目くらまし",
              "conditionType": "付与対象",
              "conditionValue": "自身",
              "condition": "自身に目くらまし付与時",
              "effectTarget": "自身",
              "fixedValue": 75.0
            },
            {
              "skillId": "Rufo_aside_2",
              "effectId": "Rufo_aside_2_e03",
              "processGroupId": "Rufo_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "triggerType": "状態付与時",
              "triggerSourceId": "目くらまし",
              "conditionType": "付与対象",
              "conditionValue": "自身",
              "condition": "自身に目くらまし付与時",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rufo_aside_2",
              "effectId": "Rufo_aside_2_e04",
              "processGroupId": "Rufo_aside_2_proc01",
              "processOrder": 3.0,
              "valueKind": "クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "triggerType": "状態付与時",
              "triggerSourceId": "目くらまし",
              "conditionType": "付与対象",
              "conditionValue": "自身",
              "condition": "自身に目くらまし付与時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 4.0
            },
            {
              "skillId": "Rufo_aside_2",
              "effectId": "Rufo_aside_2_e05",
              "valueKind": "初回普通攻撃強化",
              "valueClass": "スキル変更",
              "effectType": "パッシブ",
              "triggerType": "ウェーブ開始時",
              "condition": "ウェーブ開始時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃"
            }
          ],
          "description": "普通攻撃の与ダメージが増加する。\n自身に目くらましが付与されると攻撃速度が増加し、高学年スキルのクールタイムが減少する。\nウェーブ開始時、自身の最初の普通攻撃は強化攻撃で発動する。"
        },
        "3": {
          "name": "最高の戦友なのだ！",
          "stats": [
            {
              "skillId": "Rufo_aside_3_global",
              "effectId": "Rufo_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Rufo_aside_3_global",
              "effectId": "Rufo_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Rufo_aside_3_battle",
              "effectId": "Rufo_aside_3_battle_e01",
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全員",
              "fixedValue": 7.0
            }
          ],
          "description": "味方全員の攻撃速度を増加させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "layze",
    "name": "レイジー",
    "basic": {
      "rarity": 2.0,
      "personality": "冷静",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 4.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Layze_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 200.0,
              "2": 220.0,
              "3": 240.0,
              "4": 260.0,
              "5": 280.0,
              "6": 300.0,
              "7": 320.0,
              "8": 340.0,
              "9": 360.0,
              "10": 380.0,
              "11": 400.0,
              "12": 420.0
            }
          }
        ],
        "skillId": "Layze_low",
        "skillType": "低学年",
        "skillName": "XG・レーザー",
        "description": "強力なレーザーを発射し、敵に範囲物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Layze_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "直線範囲の敵",
            "levels": {
              "1": 400.0,
              "2": 430.0,
              "3": 460.0,
              "4": 490.0,
              "5": 520.0,
              "6": 550.0,
              "7": 580.0,
              "8": 610.0,
              "9": 640.0,
              "10": 670.0,
              "11": 700.0,
              "12": 730.0
            }
          },
          {
            "effectId": "Layze_high_e02",
            "valueKind": "感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "直線範囲の敵"
          },
          {
            "effectId": "Layze_high_e03",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "直線範囲の敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Layze_high",
        "skillType": "高学年",
        "skillName": "XG-MK2 レーザー",
        "description": "強力なレーザーをチャージして発射し、直線範囲の対象に範囲物理ダメージを与える。 感電を付与する。",
        "cooldownSeconds": 32.0
      },
      {
        "effects": [
          {
            "effectId": "Layze_passive_e01",
            "valueKind": "会心ダメージ増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 25.0,
              "2": 30.0,
              "3": 35.0,
              "4": 40.0,
              "5": 45.0,
              "6": 50.0,
              "7": 55.0,
              "8": 60.0,
              "9": 65.0,
              "10": 70.0,
              "11": 75.0,
              "12": 80.0
            }
          }
        ],
        "skillId": "Layze_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "会心ダメージが増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Layze_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 80.0
          }
        ],
        "skillId": "Layze_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "レーザーを発射して敵に範囲物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "levi",
    "name": "レヴィ",
    "basic": {
      "rarity": 3.0,
      "personality": "憂鬱",
      "race": "魔女",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 37.0,
      "combatPowerCorrectionA": 130.0,
      "combatPowerCorrectionB": 0.225
    },
    "statTypes": {
      "hp": 4.0,
      "atkP": 3.0,
      "atkM": 0.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 5.0,
      "critDmg": 5.0,
      "critRes": 3.0,
      "critDmgRes": 3.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Levi_low_e01",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 240.0,
              "2": 270.0,
              "3": 300.0,
              "4": 330.0,
              "5": 360.0,
              "6": 390.0,
              "7": 420.0,
              "8": 450.0,
              "9": 480.0,
              "10": 510.0,
              "11": 540.0,
              "12": 570.0
            }
          },
          {
            "effectId": "Levi_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Levi_low_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 160.0,
              "2": 180.0,
              "3": 200.0,
              "4": 220.0,
              "5": 240.0,
              "6": 260.0,
              "7": 280.0,
              "8": 300.0,
              "9": 320.0,
              "10": 340.0,
              "11": 360.0,
              "12": 380.0
            }
          }
        ],
        "skillId": "Levi_low",
        "skillType": "低学年",
        "skillName": "ニンブルカッター",
        "description": "ダガーを素早く振り回し、敵に3回物理ダメージを与える。 最後の一撃はより大きな物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Levi_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 420.0,
              "2": 460.0,
              "3": 500.0,
              "4": 540.0,
              "5": 580.0,
              "6": 620.0,
              "7": 660.0,
              "8": 700.0,
              "9": 740.0,
              "10": 780.0,
              "11": 820.0,
              "12": 860.0
            }
          }
        ],
        "skillId": "Levi_high",
        "skillType": "高学年",
        "skillName": "レヴィ・ザ・レッド",
        "description": "切り札の長刀を一瞬で抜刀し、素早くダッシュして敵に範囲物理ダメージを与える。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Levi_passive_e01",
            "valueKind": "会心率増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 30.0,
              "2": 33.0,
              "3": 36.0,
              "4": 39.0,
              "5": 42.0,
              "6": 45.0,
              "7": 48.0,
              "8": 51.0,
              "9": 54.0,
              "10": 57.0,
              "11": 60.0,
              "12": 63.0
            }
          },
          {
            "effectId": "Levi_passive_e02",
            "processGroupId": "Levi_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "高学年スキル終了時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用後",
            "effectTarget": "自身",
            "levels": {
              "1": 40.0,
              "2": 43.0,
              "3": 46.0,
              "4": 49.0,
              "5": 52.0,
              "6": 55.0,
              "7": 58.0,
              "8": 61.0,
              "9": 64.0,
              "10": 67.0,
              "11": 70.0,
              "12": 73.0
            }
          },
          {
            "effectId": "Levi_passive_e03",
            "processGroupId": "Levi_passive_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "高学年スキル終了時",
            "triggerSourceId": "高学年スキル",
            "condition": "高学年使用後",
            "effectTarget": "自身",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Levi_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "高学年スキル使用後、攻撃速度が増加する。 会心率が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Levi_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100.0
          }
        ],
        "skillId": "Levi_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "ダガーを振るい、敵に物理ダメージを与える。"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "rohne",
    "name": "ローネ",
    "basic": {
      "rarity": 3.0,
      "personality": "純粋",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0.0,
      "spRecoveryPerSecond": 50.0,
      "combatPowerCorrectionA": 90.0,
      "combatPowerCorrectionB": 0.22
    },
    "statTypes": {
      "hp": 5.0,
      "atkP": 1.0,
      "atkM": 0.0,
      "defP": 5.0,
      "defM": 5.0,
      "crit": 3.0,
      "critDmg": 3.0,
      "critRes": 4.0,
      "critDmgRes": 4.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Rohne_low_e01",
            "processGroupId": "Rohne_low_proc01",
            "processOrder": 1.0,
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方1体",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Rohne_low_e02",
            "processGroupId": "Rohne_low_proc01",
            "processOrder": 2.0,
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方1体",
            "fixedValue": 8.0
          },
          {
            "effectId": "Rohne_low_e03",
            "processGroupId": "Rohne_low_proc01",
            "processOrder": 3.0,
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方3体",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Rohne_low_e04",
            "processGroupId": "Rohne_low_proc01",
            "processOrder": 4.0,
            "valueKind": "防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "triggerType": "低学年スキル使用時",
            "triggerSourceId": "低学年スキル",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方3体",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Rohne_low",
        "skillType": "低学年",
        "skillName": "チョコより甘いオペレーション",
        "description": "最も攻撃力が高い味方1名の攻撃力を増加させる。 最も攻撃力が高い味方3名の防御力を増加させる。"
      },
      {
        "effects": [
          {
            "effectId": "Rohne_high_e01",
            "valueKind": "挑発",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "周囲の最も攻撃力が高い敵2体"
          },
          {
            "effectId": "Rohne_high_e02",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "周囲の最も攻撃力が高い敵2体",
            "fixedValue": 6.0
          },
          {
            "effectId": "Rohne_high_e03",
            "valueKind": "攻撃力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "周囲の最も攻撃力が高い敵2体",
            "levels": {
              "1": 10.0,
              "2": 11.0,
              "3": 12.0,
              "4": 13.0,
              "5": 14.0,
              "6": 15.0,
              "7": 16.0,
              "8": 17.0,
              "9": 18.0,
              "10": 19.0,
              "11": 20.0,
              "12": 21.0
            }
          },
          {
            "effectId": "Rohne_high_e04",
            "valueKind": "攻撃力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "周囲の最も攻撃力が高い敵2体",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Rohne_high",
        "skillType": "高学年",
        "skillName": "降参！降参だってば……",
        "description": "周囲の最も攻撃力が高い敵2体を挑発する。 攻撃力を減少させる。",
        "cooldownSeconds": 18.0
      },
      {
        "effects": [
          {
            "effectId": "Rohne_passive_e01",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20.0,
              "2": 22.0,
              "3": 24.0,
              "4": 26.0,
              "5": 28.0,
              "6": 30.0,
              "7": 32.0,
              "8": 34.0,
              "9": 36.0,
              "10": 38.0,
              "11": 40.0,
              "12": 42.0
            }
          },
          {
            "effectId": "Rohne_passive_e02",
            "valueKind": "毎秒HP回復量",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 0.3,
              "2": 0.3,
              "3": 0.3,
              "4": 0.6,
              "5": 0.6,
              "6": 0.6,
              "7": 0.9,
              "8": 0.9,
              "9": 0.9,
              "10": 1.2,
              "11": 1.2,
              "12": 1.2
            }
          }
        ],
        "skillId": "Rohne_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "1秒ごとにHPが回復する。 防御力が増加する。"
      },
      {
        "effects": [
          {
            "effectId": "Rohne_basic_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          }
        ],
        "skillId": "Rohne_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "剣を振り回して敵に物理ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Rohne_enhanced_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 150.0
          },
          {
            "effectId": "Rohne_enhanced_e02",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵"
          },
          {
            "effectId": "Rohne_enhanced_e03",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 2.0
          }
        ],
        "skillId": "Rohne_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で本気の攻撃を行い、敵に物理ダメージを与える。 気絶を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 30.0
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "rollett",
    "name": "ロレット",
    "basic": {
      "rarity": 3.0,
      "personality": "狂気",
      "race": "魔女",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 100.0,
      "spRecoveryPerSecond": 30.0,
      "combatPowerCorrectionA": 120.0,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3.0,
      "atkP": 0.0,
      "atkM": 4.0,
      "defP": 3.0,
      "defM": 3.0,
      "crit": 4.0,
      "critDmg": 4.0,
      "critRes": 2.0,
      "critDmgRes": 2.0
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Rollett_low_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 250.0,
              "2": 275.0,
              "3": 300.0,
              "4": 325.0,
              "5": 350.0,
              "6": 375.0,
              "7": 400.0,
              "8": 425.0,
              "9": 450.0,
              "10": 475.0,
              "11": 500.0,
              "12": 525.0,
              "13": 550.0,
              "14": 575.0,
              "15": 600.0
            }
          }
        ],
        "skillId": "Rollett_low",
        "skillType": "低学年",
        "skillName": "喝采を浴びるエンターテイナー",
        "description": "鳩を飛ばした後、鳩の復活マジックを披露する。鳩は指定範囲内で最も遠い敵に飛んでいき、範囲魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Rollett_high_e01",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 1.0,
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "triggerType": "生成物到着時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 360.0,
              "2": 393.0,
              "3": 426.0,
              "4": 459.0,
              "5": 492.0,
              "6": 525.0,
              "7": 558.0,
              "8": 591.0,
              "9": 624.0,
              "10": 657.0,
              "11": 690.0,
              "12": 723.0,
              "13": 756.0,
              "14": 789.0,
              "15": 822.0
            }
          },
          {
            "effectId": "Rollett_high_e02",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 2.0,
            "valueKind": "魔法ダメージ",
            "valueClass": "最大対象数",
            "effectType": "対象制限",
            "triggerType": "生成物到着時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "範囲内の敵",
            "fixedValue": 6.0
          },
          {
            "effectId": "Rollett_high_e03",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 3.0,
            "valueKind": "好奇心",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "triggerType": "生成物接触時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱通過",
            "effectTarget": "敵"
          },
          {
            "effectId": "Rollett_high_e04",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 4.0,
            "valueKind": "好奇心",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "生成物接触時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱通過",
            "effectTarget": "敵",
            "fixedValue": 4.0
          },
          {
            "effectId": "Rollett_high_e05",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 5.0,
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "triggerType": "生成物到着時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "敵"
          },
          {
            "effectId": "Rollett_high_e06",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 6.0,
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "triggerType": "生成物到着時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "敵",
            "fixedValue": 3.0
          },
          {
            "effectId": "Rollett_high_e07",
            "processGroupId": "Rollett_high_proc01",
            "processOrder": 7.0,
            "valueKind": "気絶",
            "valueClass": "最大対象数",
            "effectType": "対象制限",
            "triggerType": "生成物到着時",
            "triggerSourceId": "Rollett_high_box",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "範囲内の敵",
            "fixedValue": 6.0
          }
        ],
        "skillId": "Rollett_high",
        "skillType": "高学年",
        "skillName": "観客を魅了するトリックスター",
        "description": "箱を取り出して指定範囲内で最も遠い敵に届ける。 箱は通り過ぎながら周囲の敵に好奇心を付与する。 箱が目標地点に到着すると、爆発し、範囲魔法ダメージを与え、気絶を付与する。気絶とダメージは最大6名に適用される。",
        "cooldownSeconds": 32.0
      },
      {
        "effects": [
          {
            "effectId": "Rollett_passive_e01",
            "processGroupId": "Rollett_passive_proc01",
            "processOrder": 1.0,
            "valueKind": "味方現在高学年クールタイム減少",
            "valueClass": "クールタイム",
            "effectType": "クールタイム",
            "triggerType": "生成物到着時",
            "triggerSourceId": "Rollett_low_pigeon",
            "condition": "低学年スキル発動時（鳩の復活マジックを披露時）",
            "effectTarget": "ランダムな味方1名（自身以外）",
            "levels": {
              "1": 2.0,
              "2": 2.5,
              "3": 3.0,
              "4": 3.5,
              "5": 4.0,
              "6": 4.5,
              "7": 5.0,
              "8": 5.5,
              "9": 6.0,
              "10": 6.5,
              "11": 7.0,
              "12": 7.5,
              "13": 8.0,
              "14": 8.5,
              "15": 9.0
            }
          }
        ],
        "skillId": "Rollett_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "低学年スキルを使用して鳩の復活マジックを披露すると、自身を除くランダムな味方1名の現在の高学年スキルのクールタイムを即時減少させる。"
      },
      {
        "effects": [
          {
            "effectId": "Rollett_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "fixedValue": 90.0
          }
        ],
        "skillId": "Rollett_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "指定範囲内で最も遠い敵に火の玉を飛ばして魔法ダメージを与える。"
      },
      {
        "effects": [
          {
            "effectId": "Rollett_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵とその周囲の範囲内の敵",
            "fixedValue": 120.0
          },
          {
            "effectId": "Rollett_enhanced_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵"
          },
          {
            "effectId": "Rollett_enhanced_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9.0,
            "effectTarget": "敵",
            "fixedValue": 4.0
          }
        ],
        "skillId": "Rollett_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で、指定範囲内で最も遠い敵に火の玉を飛ばして、範囲魔法ダメージを与え、火傷を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 33.0
      }
    ],
    "favoriteCard": {
      "name": "ロレットのマジックハット",
      "kind": "遺物",
      "levels": {
        "1": [
          {
            "effects": [
              {
                "effectId": "Rollett_favorite_1_e01",
                "targetSkill": "低学年",
                "targetSkillName": "歓声を浴びるエンターテイナー",
                "valueKind": "総魔法ダメージ",
                "effectType": "攻撃",
                "effectTarget": "範囲内の敵",
                "levels": {
                  "1": 750.0,
                  "2": 825.0,
                  "3": 900.0,
                  "4": 975.0,
                  "5": 1050.0,
                  "6": 1125.0,
                  "7": 1200.0,
                  "8": 1275.0,
                  "9": 1350.0,
                  "10": 1425.0,
                  "11": 1500.0,
                  "12": 1575.0,
                  "13": 1650.0,
                  "14": 1725.0,
                  "15": 1800.0
                },
                "valueClass": "倍率"
              },
              {
                "effectId": "Rollett_favorite_1_e02",
                "targetSkill": "低学年",
                "targetSkillName": "歓声を浴びるエンターテイナー",
                "valueKind": "SP回復量",
                "valueClass": "固定値",
                "effectType": "回復",
                "triggerType": "低学年スキル使用時",
                "triggerSourceId": "低学年スキル",
                "condition": "低学年スキル発動時（鳩の復活マジックを披露時）",
                "effectTarget": "自身",
                "fixedValue": 100.0
              }
            ],
            "skillId": "Rollett_favorite_1",
            "skillName": "愛用Lv1",
            "description": "鳩を3体飛ばした後、鳩の復活マジックを披露する。\n鳩は指定範囲内で最も遠い敵に飛んでいき、範囲魔法ダメージを与える。\n鳩の復活マジックを披露すると、自身のSPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "effectId": "Rollett_favorite_3_e01",
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Rollett_favorite_3_e02",
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              },
              {
                "effectId": "Rollett_favorite_3_e03",
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9.0
              }
            ],
            "skillId": "Rollett_favorite_3",
            "skillName": "愛用Lv3",
            "description": "ロレットの魔法攻撃力、会心、会心ダメージが9%増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "ロレットの黄金チケット",
      "levels": {
        "1": {
          "name": "最高のエンターテインメント",
          "stats": [],
          "effects": [
            {
              "skillId": "Rollett_aside_1",
              "effectId": "Rollett_aside_1_e01",
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rollett_aside_1",
              "effectId": "Rollett_aside_1_e02",
              "valueKind": "魔法攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rollett_aside_1",
              "effectId": "Rollett_aside_1_e03",
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            },
            {
              "skillId": "Rollett_aside_1",
              "effectId": "Rollett_aside_1_e04",
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 6.0
            }
          ],
          "description": "戦闘時ステータス増加"
        },
        "2": {
          "name": "舞台を掌握するイリュージョニスト",
          "stats": [],
          "effects": [
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e01",
              "valueKind": "スキルダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 50.0
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e02",
              "valueKind": "自身のSPを回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "triggerType": "ウェーブ開始時",
              "condition": "ウェーブ開始時",
              "effectTarget": "自身",
              "fixedValue": 100.0
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e03",
              "processGroupId": "Rollett_aside_2_proc01",
              "processOrder": 1.0,
              "valueKind": "変異",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ランダム分岐",
              "conditionValue": "変異",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵2体/ランダム",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e04",
              "processGroupId": "Rollett_aside_2_proc01",
              "processOrder": 2.0,
              "valueKind": "変異",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ランダム分岐",
              "conditionValue": "変異",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵2体/ランダム",
              "targetSkill": "低学年スキル",
              "fixedValue": 3.0
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e05",
              "processGroupId": "Rollett_aside_2_proc02",
              "processOrder": 1.0,
              "valueKind": "毎秒SP回復中断",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ランダム分岐",
              "conditionValue": "毎秒SP回復中断",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル"
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e06",
              "processGroupId": "Rollett_aside_2_proc02",
              "processOrder": 2.0,
              "valueKind": "毎秒SP回復中断",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ランダム分岐",
              "conditionValue": "毎秒SP回復中断",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 10.0
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e07",
              "processGroupId": "Rollett_aside_2_proc03",
              "processOrder": 1.0,
              "valueKind": "攻撃力減少",
              "valueClass": "倍率",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ランダム分岐",
              "conditionValue": "攻撃力減少",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 30.0
            },
            {
              "skillId": "Rollett_aside_2",
              "effectId": "Rollett_aside_2_e08",
              "processGroupId": "Rollett_aside_2_proc03",
              "processOrder": 2.0,
              "valueKind": "攻撃力減少",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "triggerType": "低学年スキル命中時",
              "triggerSourceId": "低学年スキル",
              "conditionType": "ランダム分岐",
              "conditionValue": "攻撃力減少",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 10.0
            }
          ],
          "description": "スキルダメージ量が増加する。\nウェーブ開始時、自身のSPを回復する。\n低学年スキルが命中した敵へ以下の効果のうち一つを発動する。\n- ランダムな敵2体に変異を付与する。\n- 1秒ごとのSP回復を中断させる。\n- 攻撃力を減少させる。"
        },
        "3": {
          "name": "フィナーレ",
          "stats": [
            {
              "skillId": "Rollett_aside_3_global",
              "effectId": "Rollett_aside_3_global_e01",
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3.0
            },
            {
              "skillId": "Rollett_aside_3_global",
              "effectId": "Rollett_aside_3_global_e02",
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 3.0
            }
          ],
          "effects": [
            {
              "skillId": "Rollett_aside_3_battle",
              "effectId": "Rollett_aside_3_battle_e01",
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 13.6
            },
            {
              "skillId": "Rollett_aside_3_battle",
              "effectId": "Rollett_aside_3_battle_e02",
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 5.9
            }
          ],
          "description": "後列の味方の敵への与ダメージ量を増加させ、後列の味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  }
];

const APOSTLE_INDEX = Object.fromEntries(APOSTLE_LIBRARY.map(apostle => [apostle.id, apostle]));
