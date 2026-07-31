// Trickcal Damage Calculator - Apostle Data
// Generated from: トリッカル使徒データ Google Sheet

const APOSTLE_LIBRARY = [
  {
    "id": "amelia",
    "name": "アメリア",
    "basic": {
      "rarity": 3,
      "personality": "冷静",
      "race": "エルフ",
      "role": "支援",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.525
    },
    "statTypes": {
      "hp": 1,
      "atkP": 4,
      "atkM": 0,
      "defP": 1,
      "defM": 1,
      "crit": 4,
      "critDmg": 4,
      "critRes": 1,
      "critDmgRes": 1
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
              "1": 250,
              "2": 275,
              "3": 300,
              "4": 325,
              "5": 350,
              "6": 375,
              "7": 400,
              "8": 425,
              "9": 450,
              "10": 475,
              "11": 500,
              "12": 525,
              "13": 550,
              "14": 575,
              "15": 600
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
            "fixedValue": 6
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
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 1080,
              "2": 1188,
              "3": 1296,
              "4": 1404,
              "5": 1512,
              "6": 1620,
              "7": 1728,
              "8": 1836,
              "9": 1944,
              "10": 2052,
              "11": 2160,
              "12": 2268,
              "13": 2376,
              "14": 2484,
              "15": 2592
            }
          },
          {
            "effectId": "Amelia_high_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 6
          },
          {
            "effectId": "Amelia_high_e03",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/感電状態"
          },
          {
            "effectId": "Amelia_high_e04",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/感電状態",
            "fixedValue": 3
          }
        ],
        "skillId": "Amelia_high",
        "skillType": "高学年",
        "skillName": "超電導レーザーキャノン",
        "description": "最新型のレーザーキャノンを発射し、敵に6回の範囲物理ダメージを与える。過熱後はより広範囲の物理ダメージを与える（2ヒット＋加熱後4ヒット）。敵が感電状態の場合、気絶を付与する。",
        "cooldownSeconds": 32
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
              "1": 10,
              "2": 10.5,
              "3": 11,
              "4": 11.5,
              "5": 12,
              "6": 12.5,
              "7": 13,
              "8": 13.5,
              "9": 14,
              "10": 14.5,
              "11": 15,
              "12": 15.5,
              "13": 16,
              "14": 16.5,
              "15": 17
            }
          },
          {
            "effectId": "Amelia_passive_e03",
            "valueKind": "感電",
            "valueClass": "対象数",
            "effectType": "デバフ",
            "effectTarget": "敵/ランダム/指定範囲内",
            "fixedValue": 2
          },
          {
            "effectId": "Amelia_passive_e04",
            "valueKind": "感電",
            "valueClass": "クールタイム",
            "effectType": "デバフ",
            "effectTarget": "敵/ランダム/指定範囲内",
            "fixedValue": 10
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
            "fixedValue": 100
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
            "fixedValue": 175
          },
          {
            "effectId": "Amelia_enhanced_e02",
            "valueKind": "感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 3
          }
        ],
        "skillId": "Amelia_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で強化レーザーを発射して範囲物理ダメージを与え、感電を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 25
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "王子エレナ",
      "levels": {
        "1": {
          "name": "王子さまの恵み",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "超高速サンダーレーザー",
          "stats": [],
          "effects": [
            {
              "valueKind": "強化攻撃発動確率増加",
              "valueClass": "倍率",
              "effectType": "パッシブ",
              "effectTarget": "自身",
              "fixedValue": 15
            },
            {
              "valueKind": "普通攻撃のダメージ量増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "感電状態の敵攻撃時",
              "targetSkill": "普通攻撃",
              "fixedValue": 40
            },
            {
              "valueKind": "パッシブ感電対象数",
              "valueClass": "対象数",
              "effectType": "パッシブ",
              "effectTarget": "敵/指定範囲内",
              "fixedValue": 3
            }
          ],
          "description": "強化攻撃の発動確率が増加する。感電状態の敵に与える普通攻撃のダメージ量が増加する。パッシブスキルで付与する感電の対象数が3体になる。"
        },
        "3": {
          "name": "援軍要請の件",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 4
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "冷静",
      "race": "魔女",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 44,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 4,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 5,
      "critDmgRes": 5
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
              "1": 260,
              "2": 275,
              "3": 290,
              "4": 305,
              "5": 320,
              "6": 335,
              "7": 350,
              "8": 365,
              "9": 380,
              "10": 395,
              "11": 410,
              "12": 425
            }
          },
          {
            "effectId": "Aya_low_e02",
            "valueKind": "スキルダメージ量減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "condition": "蝶衝突時",
            "effectTarget": "敵",
            "fixedValue": 50
          },
          {
            "effectId": "Aya_low_e03",
            "valueKind": "スキルダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "蝶衝突時",
            "effectTarget": "敵",
            "fixedValue": 6
          },
          {
            "effectId": "Aya_low_e04",
            "valueKind": "SP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "condition": "蝶衝突時",
            "effectTarget": "自身",
            "fixedValue": 15
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
              "1": 250,
              "2": 265,
              "3": 280,
              "4": 295,
              "5": 310,
              "6": 325,
              "7": 340,
              "8": 355,
              "9": 370,
              "10": 385,
              "11": 400,
              "12": 415
            }
          },
          {
            "effectId": "Aya_high_e02",
            "valueKind": "繰り返し回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵/ランダム",
            "fixedValue": 5
          },
          {
            "effectId": "Aya_high_e03",
            "valueKind": "凍傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Aya_high_e04",
            "valueKind": "凍傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 10
          }
        ],
        "skillId": "Aya_high",
        "skillType": "高学年",
        "skillName": "雪花満開",
        "description": "敵に雪の花を咲かせる。雪の花は敵に範囲魔法ダメージを与え、凍傷を付与する。ダメージを受けたランダムな敵に新しい雪の花を咲かせ、敵に範囲魔法ダメージを与える。雪の花は同じ対象に一度だけ咲く。",
        "cooldownSeconds": 28
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Aya_passive_e02",
            "valueKind": "冷静の味方使徒攻撃力増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "冷静の味方使徒",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23
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
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100
          },
          {
            "effectId": "Aya_basic_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
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
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 190
          },
          {
            "effectId": "Aya_enhanced_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 2
          },
          {
            "effectId": "Aya_enhanced_e03",
            "valueKind": "攻撃速度減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵/範囲",
            "fixedValue": 20
          },
          {
            "effectId": "Aya_enhanced_e04",
            "valueKind": "攻撃速度減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵/範囲",
            "fixedValue": 4
          }
        ],
        "skillId": "Aya_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で氷刃雪花を振って敵に範囲魔法ダメージを2回与える。2回目の攻撃は敵の攻撃速度を減少させる。",
        "triggerType": "一定確率",
        "triggerValue": 40
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "alice",
    "name": "アリス",
    "basic": {
      "rarity": 3,
      "personality": "狂気",
      "race": "幽霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Alice_low_e01",
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 270,
              "2": 295,
              "3": 320,
              "4": 345,
              "5": 370,
              "6": 395,
              "7": 420,
              "8": 445,
              "9": 470,
              "10": 495,
              "11": 520,
              "12": 545,
              "13": 570,
              "14": 595,
              "15": 620
            }
          },
          {
            "effectId": "Alice_low_e02",
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Alice_low_e03",
            "valueKind": "[傘持参]感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_low_e04",
            "valueKind": "[傘持参]感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 4
          },
          {
            "effectId": "Alice_low_e05",
            "valueKind": "[残り火注意]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260,
              "13": 1320,
              "14": 1380,
              "15": 1440
            }
          },
          {
            "effectId": "Alice_low_e06",
            "valueKind": "[残り火注意]火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_low_e07",
            "valueKind": "[残り火注意]火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 7
          },
          {
            "effectId": "Alice_low_e08",
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "levels": {
              "1": 180,
              "2": 205,
              "3": 230,
              "4": 255,
              "5": 280,
              "6": 305,
              "7": 330,
              "8": 355,
              "9": 380,
              "10": 405,
              "11": 430,
              "12": 455,
              "13": 480,
              "14": 505,
              "15": 530
            }
          },
          {
            "effectId": "Alice_low_e09",
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 3
          },
          {
            "effectId": "Alice_low_e10",
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 4
          },
          {
            "effectId": "Alice_low_e11",
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム"
          },
          {
            "effectId": "Alice_low_e12",
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 3
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
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 405,
              "2": 440,
              "3": 475,
              "4": 510,
              "5": 545,
              "6": 580,
              "7": 615,
              "8": 650,
              "9": 685,
              "10": 720,
              "11": 755,
              "12": 790,
              "13": 825,
              "14": 860,
              "15": 895
            }
          },
          {
            "effectId": "Alice_high_e02",
            "valueKind": "[傘持参]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Alice_high_e03",
            "valueKind": "[傘持参]感電",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_high_e04",
            "valueKind": "[傘持参]感電",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 6
          },
          {
            "effectId": "Alice_high_e05",
            "valueKind": "[残り火注意]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵",
            "levels": {
              "1": 1200,
              "2": 1320,
              "3": 1440,
              "4": 1560,
              "5": 1680,
              "6": 1800,
              "7": 1920,
              "8": 2040,
              "9": 2160,
              "10": 2280,
              "11": 2400,
              "12": 2520,
              "13": 2640,
              "14": 2760,
              "15": 2880
            }
          },
          {
            "effectId": "Alice_high_e06",
            "valueKind": "[残り火注意]火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "ランダム",
            "effectTarget": "敵"
          },
          {
            "effectId": "Alice_high_e07",
            "valueKind": "[残り火注意]火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "ランダム",
            "effectTarget": "敵",
            "fixedValue": 10
          },
          {
            "effectId": "Alice_high_e08",
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "levels": {
              "1": 270,
              "2": 305,
              "3": 340,
              "4": 375,
              "5": 410,
              "6": 445,
              "7": 480,
              "8": 515,
              "9": 550,
              "10": 585,
              "11": 620,
              "12": 655,
              "13": 690,
              "14": 725,
              "15": 760
            }
          },
          {
            "effectId": "Alice_high_e09",
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 3
          },
          {
            "effectId": "Alice_high_e10",
            "valueKind": "[かすり傷注意]総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 4
          },
          {
            "effectId": "Alice_high_e11",
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム"
          },
          {
            "effectId": "Alice_high_e12",
            "valueKind": "[かすり傷注意]気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "ランダム",
            "effectTarget": "敵/ランダム",
            "fixedValue": 4
          }
        ],
        "skillId": "Alice_high",
        "skillType": "高学年",
        "skillName": "ワンダーランド",
        "description": "直前に引いたアルカナカードに応じてスキルを強化し、発動する。 アルカナを使用していない場合は、かすり傷注意が発動する。",
        "cooldownSeconds": 40
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
              "1": 16,
              "2": 17,
              "3": 18,
              "4": 19,
              "5": 20,
              "6": 21,
              "7": 22,
              "8": 23,
              "9": 24,
              "10": 25,
              "11": 26,
              "12": 27,
              "13": 28,
              "14": 29,
              "15": 30
            }
          },
          {
            "effectId": "Alice_passive_e02",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 23,
              "3": 26,
              "4": 29,
              "5": 32,
              "6": 35,
              "7": 38,
              "8": 41,
              "9": 44,
              "10": 47,
              "11": 50,
              "12": 53,
              "13": 56,
              "14": 59,
              "15": 62
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
            "fixedValue": 100
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
            "fixedValue": 250
          }
        ],
        "skillId": "Alice_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに敵にカードの束を投げつけて魔法ダメージを与える。",
        "triggerType": "n回ごと",
        "triggerValue": 4
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
                "valueKind": "[赤カード]魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "condition": "赤カード時",
                "effectTarget": "敵",
                "fixedValue": 300
              },
              {
                "valueKind": "[赤カード]与ダメージ減少",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "condition": "赤カード時",
                "effectTarget": "敵",
                "fixedValue": 30
              },
              {
                "valueKind": "[赤カード]与ダメージ減少",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "condition": "赤カード時",
                "effectTarget": "敵",
                "fixedValue": 5
              },
              {
                "valueKind": "[黄カード]魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "condition": "黄カード時",
                "effectTarget": "敵",
                "fixedValue": 300
              },
              {
                "valueKind": "[黄カード]気絶",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "condition": "黄カード時",
                "effectTarget": "敵"
              },
              {
                "valueKind": "[黄カード]気絶",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "condition": "黄カード時",
                "effectTarget": "敵",
                "fixedValue": 3
              },
              {
                "valueKind": "[青カード]魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "condition": "青カード時",
                "effectTarget": "敵",
                "fixedValue": 300
              },
              {
                "valueKind": "[青カード]SP減少",
                "valueClass": "固定値",
                "effectType": "デバフ",
                "condition": "青カード時",
                "effectTarget": "敵",
                "fixedValue": 50
              }
            ],
            "skillName": "ランダム効果",
            "description": "ランダムで赤/黄/青のカード効果を発動する。赤は与ダメージ減少、黄は気絶、青はSP減少。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "毎秒SP回復量",
                "valueClass": "固定値",
                "effectType": "パッシブ",
                "effectTarget": "自身",
                "fixedValue": 10
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "完全ラッキーアリスでしょ！",
          "stats": [],
          "effects": [
            {
              "valueKind": "スキルダメージ増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 33
            },
            {
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "fixedValue": 25
            },
            {
              "valueKind": "HP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "reference": "最大HP",
              "fixedValue": 5
            },
            {
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "fixedValue": 100
            },
            {
              "valueKind": "SP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "condition": "味方が12回直接ダメージ",
              "effectTarget": "自身",
              "fixedValue": 5
            }
          ],
          "description": "スキルダメージ量が増加する。\n味方が一定回数直接ダメージを受けると、自身のHPとSPを回復する。"
        },
        "3": {
          "name": "幸運を祈るわ！",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 2,
      "personality": "純粋",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 70,
      "combatPowerCorrectionB": 0.21
    },
    "statTypes": {
      "hp": 5,
      "atkP": 2,
      "atkM": 0,
      "defP": 5,
      "defM": 5,
      "crit": 2,
      "critDmg": 2,
      "critRes": 4,
      "critDmgRes": 4
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
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630
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
            "fixedValue": 4
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
              "1": 25,
              "2": 27,
              "3": 29,
              "4": 31,
              "5": 33,
              "6": 35,
              "7": 37,
              "8": 39,
              "9": 41,
              "10": 43,
              "11": 45,
              "12": 47
            }
          },
          {
            "effectId": "Allet_high_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "自身",
            "fixedValue": 7
          },
          {
            "effectId": "Allet_high_e03",
            "valueKind": "シールド破壊時の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 200,
              "2": 210,
              "3": 220,
              "4": 230,
              "5": 240,
              "6": 250,
              "7": 260,
              "8": 270,
              "9": 280,
              "10": 290,
              "11": 300,
              "12": 310
            }
          }
        ],
        "skillId": "Allet_high",
        "skillType": "高学年",
        "skillName": "鎮圧準備",
        "description": "ダメージを吸収するシールドを自身に生成する。シールドが破壊されるか持続時間が終わると、敵に範囲物理ダメージを与える。",
        "cooldownSeconds": 16
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 100
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "冷静",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 160,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 5,
      "atkP": 0,
      "atkM": 2,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 5,
      "critDmgRes": 5
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
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46,
              "13": 48,
              "14": 50,
              "15": 52
            }
          },
          {
            "effectId": "ED_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "自身",
            "fixedValue": 8
          },
          {
            "effectId": "ED_low_e03",
            "valueKind": "保護",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "イードを除く味方全員"
          },
          {
            "effectId": "ED_low_e04",
            "valueKind": "保護",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "イードを除く味方全員",
            "fixedValue": 10
          },
          {
            "effectId": "ED_low_e05",
            "valueKind": "保護発動回数",
            "valueClass": "回数",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "イードを除く味方全員",
            "fixedValue": 2
          },
          {
            "effectId": "ED_low_e06",
            "valueKind": "味方シールド",
            "valueClass": "倍率",
            "effectType": "シールド",
            "effectTarget": "保護が発動した味方",
            "reference": "最大HP",
            "levels": {
              "1": 48,
              "2": 53,
              "3": 56,
              "4": 60,
              "5": 63,
              "6": 66,
              "7": 71,
              "8": 74,
              "9": 78,
              "10": 81,
              "11": 84,
              "12": 89,
              "13": 92,
              "14": 96,
              "15": 99
            }
          },
          {
            "effectId": "ED_low_e07",
            "valueKind": "味方シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "保護が発動した味方",
            "fixedValue": 12
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
              "1": 700,
              "2": 770,
              "3": 840,
              "4": 910,
              "5": 980,
              "6": 1050,
              "7": 1120,
              "8": 1190,
              "9": 1260,
              "10": 1330,
              "11": 1400,
              "12": 1470,
              "13": 1540,
              "14": 1610,
              "15": 1680
            }
          },
          {
            "effectId": "ED_high_e02",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "周囲の敵/範囲",
            "fixedValue": 4
          },
          {
            "effectId": "ED_high_e03",
            "valueKind": "SP減少",
            "valueClass": "固定値",
            "effectType": "デバフ",
            "effectTarget": "周囲の敵/範囲",
            "levels": {
              "1": 96,
              "2": 104,
              "3": 112,
              "4": 120,
              "5": 128,
              "6": 136,
              "7": 144,
              "8": 152,
              "9": 160,
              "10": 168,
              "11": 176,
              "12": 184,
              "13": 192,
              "14": 200,
              "15": 208
            }
          }
        ],
        "skillId": "ED_high",
        "skillType": "高学年",
        "skillName": "あなたと私の宇宙",
        "description": "周囲の敵に範囲魔法ダメージを4回与え、SPを減少させる。",
        "cooldownSeconds": 38
      },
      {
        "effects": [
          {
            "effectId": "ED_passive_e01",
            "valueKind": "無敵",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "condition": "ウェーブ開始時",
            "effectTarget": "自身"
          },
          {
            "effectId": "ED_passive_e02",
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "ウェーブ開始時",
            "effectTarget": "自身",
            "levels": {
              "1": 3,
              "2": 3.3,
              "3": 3.6,
              "4": 3.9,
              "5": 4.2,
              "6": 4.5,
              "7": 4.8,
              "8": 5.1,
              "9": 5.4,
              "10": 5.7,
              "11": 6,
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
            "fixedValue": 120
          },
          {
            "effectId": "ED_basic_e02",
            "valueKind": "総魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 4
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
            "fixedValue": 240
          },
          {
            "effectId": "ED_enhanced_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 20
          },
          {
            "effectId": "ED_enhanced_e03",
            "valueKind": "攻撃力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "ダメージを受けた敵",
            "fixedValue": 30
          },
          {
            "effectId": "ED_enhanced_e04",
            "valueKind": "攻撃力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ダメージを受けた敵",
            "fixedValue": 6
          }
        ],
        "skillId": "ED_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "直接ダメージを9回受けるたびに、前方の敵に範囲魔法ダメージを与え、自身のHPを回復する。ダメージを受けた敵は攻撃力が減少する。 強化攻撃中は、被ダメージの回数がカウントされない。",
        "triggerType": "被ダメージ回数",
        "triggerValue": 9
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
                "valueKind": "最大HP増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "イード編成時",
                "effectTarget": "味方全員",
                "fixedValue": 15
              },
              {
                "valueKind": "SP回復周期",
                "valueClass": "周期",
                "effectType": "回復",
                "condition": "イード編成時",
                "effectTarget": "自身と周囲の味方",
                "fixedValue": 5
              },
              {
                "valueKind": "SP回復",
                "valueClass": "固定値",
                "effectType": "回復",
                "condition": "イード編成時",
                "effectTarget": "自身と周囲の味方",
                "fixedValue": 30
              }
            ],
            "skillName": "愛用カード効果",
            "description": "デッキにイードが編成されている場合、味方全員の最大HPが増加し、一定時間ごとに自身と周囲の味方のSPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "HP回復量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 30
              }
            ],
            "skillName": "愛用カード効果",
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "まだ夢から覚めていない",
          "stats": [],
          "effects": [
            {
              "valueKind": "防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "強化攻撃使用時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 25
            },
            {
              "valueKind": "防御力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "強化攻撃使用時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 5
            },
            {
              "valueKind": "追加シールド",
              "valueClass": "倍率",
              "effectType": "シールド",
              "condition": "低学年スキル使用時",
              "effectTarget": "残りHP割合が最も低い味方",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 24,
                "2": 26,
                "3": 28,
                "4": 30,
                "5": 32,
                "6": 34,
                "7": 36,
                "8": 38,
                "9": 40,
                "10": 42,
                "11": 44,
                "12": 46,
                "13": 48,
                "14": 50,
                "15": 52
              }
            },
            {
              "valueKind": "追加シールド",
              "valueClass": "持続時間",
              "effectType": "シールド",
              "condition": "低学年スキル使用時",
              "effectTarget": "残りHP割合が最も低い味方",
              "targetSkill": "低学年スキル",
              "fixedValue": 8
            },
            {
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "保護発動時",
              "effectTarget": "保護が発動した味方",
              "targetSkill": "保護",
              "fixedValue": 30
            }
          ],
          "description": "強化攻撃使用時、一定時間、自身の防御力を増加させる。低学年スキル使用時、残りHP割合が最も低い味方に追加でシールドを付与する。保護が発動した味方のSPを回復させる。"
        },
        "3": {
          "name": "共に見る夢",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 4
            }
          ],
          "effects": [
            {
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全員",
              "fixedValue": 18
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
      "rarity": 3,
      "personality": "狂気",
      "race": "精霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 130,
              "2": 143,
              "3": 156,
              "4": 169,
              "5": 182,
              "6": 195,
              "7": 208,
              "8": 221,
              "9": 234,
              "10": 247,
              "11": 260,
              "12": 273
            }
          },
          {
            "effectId": "Ifrit_low_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "領域内の敵"
          },
          {
            "effectId": "Ifrit_low_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "領域内の敵",
            "fixedValue": 4
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Ifrit_high_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "中央の敵/範囲"
          },
          {
            "effectId": "Ifrit_high_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "中央の敵/範囲",
            "fixedValue": 6
          },
          {
            "effectId": "Ifrit_high_e04",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 80,
              "2": 88,
              "3": 96,
              "4": 104,
              "5": 112,
              "6": 120,
              "7": 128,
              "8": 136,
              "9": 144,
              "10": 152,
              "11": 160,
              "12": 168
            }
          },
          {
            "effectId": "Ifrit_high_e05",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 10
          }
        ],
        "skillId": "Ifrit_high",
        "skillType": "高学年",
        "skillName": "キャンプファイア",
        "description": "空中に跳び上がった後、真ん中にいる敵に落下し、範囲魔法ダメージを与え、火傷を付与する。その後10回範囲魔法ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 30,
              "2": 32,
              "3": 34,
              "4": 36,
              "5": 38,
              "6": 40,
              "7": 42,
              "8": 44,
              "9": 46,
              "10": 48,
              "11": 50,
              "12": 52
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
            "effectTarget": "自身のスキルで発生した火傷",
            "levels": {
              "1": 24,
              "2": 28,
              "3": 32,
              "4": 36,
              "5": 40,
              "6": 44,
              "7": 48,
              "8": 52,
              "9": 56,
              "10": 60,
              "11": 64,
              "12": 68
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
            "fixedValue": 100
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "活発",
      "race": "精霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 100,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 95,
      "combatPowerCorrectionB": 0.425
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 1,
      "defP": 4,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
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
              "1": 3,
              "2": 3.3,
              "3": 3.6,
              "4": 3.9,
              "5": 4.2,
              "6": 4.5,
              "7": 4.8,
              "8": 5.1,
              "9": 5.4,
              "10": 5.7,
              "11": 6,
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
              "1": 1,
              "2": 1.1,
              "3": 1.2,
              "4": 1.3,
              "5": 1.4,
              "6": 1.5,
              "7": 1.6,
              "8": 1.7,
              "9": 1.8,
              "10": 1.9,
              "11": 2,
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
              "11": 501,
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
            "fixedValue": 6
          },
          {
            "effectId": "Ui_low_e05",
            "valueKind": "カエル雨",
            "valueClass": "持続時間",
            "effectType": "回復/攻撃",
            "effectTarget": "自身周囲",
            "fixedValue": 6
          },
          {
            "effectId": "Ui_low_e06",
            "valueKind": "適用対象数",
            "valueClass": "対象数",
            "effectType": "回復/攻撃",
            "effectTarget": "味方と敵",
            "fixedValue": 9
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
            "effectId": "Ui_high_e01",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "バフ/デバフ",
            "effectTarget": "対象",
            "fixedValue": 3
          },
          {
            "effectId": "Ui_high_e02",
            "valueKind": "HP全回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "最大HP",
            "fixedValue": 100
          },
          {
            "effectId": "Ui_high_e03",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "シールド",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "最大HP",
            "levels": {
              "1": 5,
              "2": 6,
              "3": 7,
              "4": 8,
              "5": 9,
              "6": 10,
              "7": 11,
              "8": 12,
              "9": 13,
              "10": 14,
              "11": 15,
              "12": 16,
              "13": 17,
              "14": 18,
              "15": 19
            }
          },
          {
            "effectId": "Ui_high_e04",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "シールド",
            "effectTarget": "残りHP割合が最も低い味方",
            "fixedValue": 6
          },
          {
            "effectId": "Ui_high_e05",
            "valueKind": "SP全回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "残りSP割合が最も低い味方",
            "reference": "最大SP",
            "fixedValue": 100
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
              "1": 3,
              "2": 3.2,
              "3": 3.4,
              "4": 3.6,
              "5": 3.8,
              "6": 4,
              "7": 4.2,
              "8": 4.4,
              "9": 4.6,
              "10": 4.8,
              "11": 5,
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
        "cooldownSeconds": 20
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
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
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
            "fixedValue": 100
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
            "fixedValue": 160
          },
          {
            "effectId": "Ui_enhanced_e02",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "fixedValue": 20
          }
        ],
        "skillId": "Ui_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でエルが敵を舌ではたいて魔法ダメージを与え、周囲の味方のSPを回復する。",
        "triggerType": "一定確率",
        "triggerValue": 25
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "アンハッピーウイ",
      "levels": {
        "1": {
          "name": "エルはケロケロ",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "ポジティブの王ウイ",
          "stats": [],
          "effects": [
            {
              "valueKind": "活発追加",
              "valueClass": "固定値",
              "effectType": "パッシブ",
              "effectTarget": "自身",
              "fixedValue": 1
            },
            {
              "valueKind": "ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキル使用時",
              "effectTarget": "味方/中列",
              "targetSkill": "低学年スキル",
              "fixedValue": 16
            },
            {
              "valueKind": "ダメージ量増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "低学年スキル使用時",
              "effectTarget": "味方/中列",
              "targetSkill": "低学年スキル",
              "fixedValue": 7
            }
          ],
          "description": "活発を1個追加する。低学年スキル使用時、中列の味方のダメージ量を増加させる。"
        },
        "3": {
          "name": "長ぐつをはいたウイ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 4
            }
          ],
          "effects": [
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 14
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "純粋",
      "race": "竜族",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 150,
      "spRecoveryPerSecond": 50,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 5,
      "atkP": 0,
      "atkM": 2,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 5,
      "critDmgRes": 5
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Vivi_low_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 33,
              "2": 37,
              "3": 40,
              "4": 43,
              "5": 46,
              "6": 48,
              "7": 51,
              "8": 53,
              "9": 56,
              "10": 59,
              "11": 61,
              "12": 64,
              "13": 66,
              "14": 69,
              "15": 72
            }
          },
          {
            "effectId": "Vivi_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Vivi_low_e03",
            "valueKind": "敵防御力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "condition": "自シールド破壊時",
            "effectTarget": "敵/自身周囲",
            "fixedValue": 40
          },
          {
            "effectId": "Vivi_low_e04",
            "valueKind": "敵防御力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "自シールド破壊時",
            "effectTarget": "敵/自身周囲",
            "fixedValue": 7
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
              "1": 360,
              "2": 430,
              "3": 500,
              "4": 570,
              "5": 640,
              "6": 710,
              "7": 780,
              "8": 850,
              "9": 920,
              "10": 990,
              "11": 1060,
              "12": 1130,
              "13": 1200,
              "14": 1270,
              "15": 1340
            }
          },
          {
            "effectId": "Vivi_high_e02",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 33,
              "2": 37,
              "3": 40,
              "4": 43,
              "5": 46,
              "6": 48,
              "7": 51,
              "8": 53,
              "9": 56,
              "10": 59,
              "11": 61,
              "12": 64,
              "13": 66,
              "14": 69,
              "15": 72
            }
          },
          {
            "effectId": "Vivi_high_e03",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6
          }
        ],
        "skillId": "Vivi_high",
        "skillType": "高学年",
        "skillName": "クイックシルバーランス",
        "description": "水銀の槍を指定範囲内で最も遠い敵に飛ばして魔法ダメージを与え、自身にシールドを生成する。",
        "cooldownSeconds": 42
      },
      {
        "effects": [
          {
            "effectId": "Vivi_passive_e01",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "ヒール",
            "condition": "基本攻撃命中時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 4.2,
              "2": 4.8,
              "3": 5.3,
              "4": 5.9,
              "5": 6.4,
              "6": 7,
              "7": 7.6,
              "8": 8.1,
              "9": 8.7,
              "10": 9.2,
              "11": 9.8,
              "12": 10.4,
              "13": 10.9,
              "14": 11.5,
              "15": 12
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
            "fixedValue": 75
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
            "fixedValue": 260
          }
        ],
        "skillId": "Vivi_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定の確率で刀で敵を4回刺し、範囲魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 20
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
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/指定範囲内で最遠",
                "levels": {
                  "1": 720,
                  "2": 860,
                  "3": 1000,
                  "4": 1140,
                  "5": 1280,
                  "6": 1420,
                  "7": 1560,
                  "8": 1700,
                  "9": 1840,
                  "10": 2120,
                  "11": 2260,
                  "12": 2260,
                  "13": 2400,
                  "14": 2540,
                  "15": 2680
                }
              }
            ],
            "targetSkill": "高学年",
            "skillName": "クイックシルバーフィナーレ",
            "description": "水銀の槍を指定範囲内で最も遠い敵に飛ばして確定会心魔法ダメージを与え、自身にシールドを付与する"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "最大HP",
                "valueClass": "倍率",
                "effectType": "パッシブ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
            "skillName": "愛用Lv3",
            "description": "最大HPが増加する。"
          },
          {
            "effects": [
              {
                "valueKind": "毎秒SP回復量",
                "valueClass": "固定値",
                "effectType": "パッシブ",
                "effectTarget": "自身",
                "fixedValue": 10
              }
            ],
            "skillName": "愛用Lv3",
            "description": "毎秒SP回復量が増加する。"
          }
        ]
      }
    },
    "aside": {
      "name": "鎖で閉ざされた箱",
      "levels": {
        "1": {
          "name": "閉ざされた記憶の箱",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "わたくしがお守りいたしますわ",
          "stats": [],
          "effects": [
            {
              "valueKind": "被スキルダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 33
            },
            {
              "valueKind": "SP減少量",
              "valueClass": "SP量",
              "effectType": "デバフ",
              "condition": "基本攻撃命中時",
              "effectTarget": "敵",
              "targetSkill": "基本攻撃",
              "fixedValue": 45
            },
            {
              "valueKind": "ワールドボスSP減少量",
              "valueClass": "SP量",
              "effectType": "デバフ",
              "condition": "基本攻撃命中時",
              "effectTarget": "敵",
              "targetSkill": "基本攻撃",
              "fixedValue": 15
            },
            {
              "valueKind": "シールド",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキル使用後",
              "effectTarget": "自身以外の残りHP割合が最も少ない味方",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 33,
                "2": 37,
                "3": 40,
                "4": 43,
                "5": 46,
                "6": 48,
                "7": 51,
                "8": 53,
                "9": 56,
                "10": 59,
                "11": 61,
                "12": 64,
                "13": 66,
                "14": 69,
                "15": 72
              }
            },
            {
              "valueKind": "シールド",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "低学年スキル使用後",
              "effectTarget": "自身以外の残りHP割合が最も少ない味方",
              "targetSkill": "低学年スキル",
              "fixedValue": 6
            },
            {
              "valueKind": "追加発射対象数",
              "valueClass": "対象数",
              "effectType": "攻撃",
              "effectTarget": "ランダムな敵",
              "targetSkill": "高学年スキル",
              "reference": "現在の対象スキル",
              "fixedValue": 2
            }
          ],
          "description": "敵からの被スキルダメージ量が減少する。\n基本攻撃が命中時、攻撃した敵のSPを減少させる。\n(ワールドボスはSP減少量が低下する。)\n低学年スキル使用後、自身を除き、残りHP割合が最も低い味方に水銀シールドを付与する。\n高学年スキルの水銀の槍が、ランダムな2体に追加で発射される。"
        },
        "3": {
          "name": "名誉あるヴィヴィ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 4
            }
          ],
          "effects": [
            {
              "valueKind": "被ダメージ量を減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
            },
            {
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "妖精",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 150,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 80,
      "combatPowerCorrectionB": 0.335
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 5,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 500,
              "2": 550,
              "3": 600,
              "4": 650,
              "5": 700,
              "6": 750,
              "7": 800,
              "8": 850,
              "9": 900,
              "10": 950,
              "11": 1000,
              "12": 1050
            }
          },
          {
            "effectId": "Ashur_low_e02",
            "valueKind": "発射数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 6
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
              "1": 400,
              "2": 440,
              "3": 480,
              "4": 520,
              "5": 560,
              "6": 600,
              "7": 640,
              "8": 680,
              "9": 720,
              "10": 760,
              "11": 800,
              "12": 840
            }
          },
          {
            "effectId": "Ashur_high_e02",
            "valueKind": "2回目の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "跳ね返り先の敵",
            "levels": {
              "1": 400,
              "2": 440,
              "3": 480,
              "4": 520,
              "5": 560,
              "6": 600,
              "7": 640,
              "8": 680,
              "9": 720,
              "10": 760,
              "11": 800,
              "12": 840
            }
          },
          {
            "effectId": "Ashur_high_e03",
            "valueKind": "跳ね返り数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
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
            "fixedValue": 3
          }
        ],
        "skillId": "Ashur_high",
        "skillType": "高学年",
        "skillName": "パンテオ",
        "description": "真ん中にいる敵に巨大なケーキを投げ落とし、敵に範囲魔法ダメージを与え気絶を付与する。 一定距離内に別の敵がいる場合、ショートケーキが跳ね返って魔法ダメージを与える。 ショートケーキは最大3体に跳ね返る。",
        "cooldownSeconds": 28
      },
      {
        "effects": [
          {
            "effectId": "Ashur_passive_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "自分HP50%以下時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 35,
              "2": 38,
              "3": 41,
              "4": 44,
              "5": 47,
              "6": 50,
              "7": 53,
              "8": 56,
              "9": 59,
              "10": 62,
              "11": 65,
              "12": 68
            }
          },
          {
            "effectId": "Ashur_passive_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "自分HP50%以下時",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Ashur_passive_e03",
            "valueKind": "クールタイム",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "condition": "自分HP50%以下時",
            "effectTarget": "自身",
            "fixedValue": 25
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
            "fixedValue": 75
          },
          {
            "effectId": "Ashur_basic_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Ashur_basic_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 2
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
            "fixedValue": 100
          },
          {
            "effectId": "Ashur_enhanced_e02",
            "valueKind": "2回目の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "跳ね返り先の敵",
            "fixedValue": 150
          },
          {
            "effectId": "Ashur_enhanced_e03",
            "valueKind": "跳ね返り数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Ashur_enhanced_e04",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Ashur_enhanced_e05",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 3
          }
        ],
        "skillId": "Ashur_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で燃えるパンを発射して敵に魔法ダメージを与え、火傷を付与する。 ダメージを受けた敵の一定距離後ろに敵がいる場合、パンくずが跳ね返って魔法ダメージを与え、火傷を付与する。 パンくずは最大2体に跳ね返る。",
        "triggerType": "一定確率",
        "triggerValue": 30
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
      "rarity": 2,
      "personality": "冷静",
      "race": "幽霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 520,
              "2": 570,
              "3": 620,
              "4": 670,
              "5": 720,
              "6": 770,
              "7": 820,
              "8": 870,
              "9": 920,
              "10": 970,
              "11": 1020,
              "12": 1070
            }
          },
          {
            "effectId": "Espi_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
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
            "fixedValue": 10
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
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
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
        "cooldownSeconds": 12
      },
      {
        "effects": [
          {
            "effectId": "Espi_passive_e01",
            "valueKind": "1秒ごとのSP回復量追加",
            "valueClass": "固定値",
            "effectType": "バフ",
            "condition": "自HP100%未満時",
            "effectTarget": "自身",
            "levels": {
              "1": 12,
              "2": 14,
              "3": 16,
              "4": 18,
              "5": 20,
              "6": 22,
              "7": 24,
              "8": 26,
              "9": 28,
              "10": 30,
              "11": 32,
              "12": 34
            }
          },
          {
            "effectId": "Espi_passive_e02",
            "valueKind": "SP回復量追加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "自HP100%未満時",
            "effectTarget": "自身",
            "fixedValue": 10
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
            "fixedValue": 75
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
            "fixedValue": 125
          }
        ],
        "skillId": "Espi_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でろうそくを2本飛ばし、敵に魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 30
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 20,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.465
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Epica_low_e01",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 60,
              "2": 63,
              "3": 66,
              "4": 69,
              "5": 72,
              "6": 75,
              "7": 78,
              "8": 81,
              "9": 84,
              "10": 87,
              "11": 90,
              "12": 93
            }
          },
          {
            "effectId": "Epica_low_e02",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "周囲の味方",
            "levels": {
              "1": 8,
              "2": 8.5,
              "3": 9,
              "4": 9.5,
              "5": 10,
              "6": 10.5,
              "7": 11,
              "8": 11.5,
              "9": 12,
              "10": 12.5,
              "11": 13,
              "12": 13.5
            }
          },
          {
            "effectId": "Epica_low_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身と周囲の味方",
            "fixedValue": 9
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
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
            }
          },
          {
            "effectId": "Epica_high_e02",
            "valueKind": "基本攻撃扱い",
            "valueClass": "状態付与",
            "effectType": "攻撃",
            "attackCategory": "基本攻撃",
            "effectTarget": "召喚獣物理ダメージ"
          },
          {
            "effectId": "Epica_high_e03",
            "valueKind": "演奏",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Epica_high_e04",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "演奏時",
            "effectTarget": "周囲の味方",
            "fixedValue": 25
          },
          {
            "effectId": "Epica_high_e05",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "演奏時",
            "effectTarget": "周囲の味方",
            "fixedValue": 8
          }
        ],
        "skillId": "Epica_high",
        "skillType": "高学年",
        "skillName": "教主様に捧げる",
        "description": "教主を称える英雄譚を演奏する。演奏が終わるまでエピコンがランダムな敵に物理ダメージを与える。この攻撃は基本攻撃のダメージとみなされる。一定時間、周囲の味方の攻撃力が増加する。",
        "cooldownSeconds": 40
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Epica_passive_e02",
            "valueKind": "会心ダメージ増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 100
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
            "fixedValue": 400
          }
        ],
        "skillId": "Epica_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "勇敢なエピコンが一定確率で敵に範囲物理ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 25
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
                "valueKind": "ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "エピカ編成時",
                "effectTarget": "味方全員",
                "fixedValue": 15
              },
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "エピカ編成時",
                "effectTarget": "味方全員",
                "fixedValue": 10
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "エピカ編成時かつ味方戦闘不能時",
                "effectTarget": "味方全員",
                "fixedValue": 15
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "エピカ編成時かつ味方戦闘不能時",
                "effectTarget": "味方全員",
                "fixedValue": 10
              }
            ],
            "skillName": "愛用カード効果",
            "description": "デッキにエピカが編成されている場合、味方全員のダメージ量と攻撃速度を増加させる。味方の使徒が戦闘不能になった時、味方全員の被ダメージ量を減少させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "エピカ編成時かつウェーブ開始時",
                "effectTarget": "自身",
                "fixedValue": 50
              },
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "エピカ編成時かつウェーブ開始時",
                "effectTarget": "自身",
                "fixedValue": 15
              }
            ],
            "skillName": "愛用カード効果",
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
      "rarity": 3,
      "personality": "純粋",
      "race": "妖精",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "6": 792,
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
            "fixedValue": 3
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
              "1": 500,
              "2": 550,
              "3": 600,
              "4": 650,
              "5": 700,
              "6": 750,
              "7": 800,
              "8": 850,
              "9": 900,
              "10": 950,
              "11": 1000,
              "12": 1050
            }
          }
        ],
        "skillId": "Erpin_high",
        "skillType": "高学年",
        "skillName": "どけえぇぇぇ！！！……え？",
        "description": "杖に魔力を込めて突撃し、敵に範囲魔法ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23
            }
          },
          {
            "effectId": "Erpin_passive_e02",
            "valueKind": "味方純粋使徒攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "純粋の味方",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23
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
            "fixedValue": 100
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
            "fixedValue": 35
          }
        ],
        "skillId": "Erpin_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でケーキをつまみ食いして、SPを回復する。",
        "triggerType": "一定確率",
        "triggerValue": 30
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
                "valueKind": "SP回復",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "一定確率",
                "triggerValue": 30,
                "effectTarget": "自身",
                "fixedValue": 35
              },
              {
                "valueKind": "スキルダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "一定確率",
                "triggerValue": 30,
                "effectTarget": "自身",
                "fixedValue": 60
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "一定確率でアイスケーキを食べSP回復し次のスキルダメージ量を増加"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
            "skillName": "愛用Lv3",
            "description": "エルフィンの魔法攻撃力、会心、会心ダメージが増加"
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
      "rarity": 3,
      "personality": "冷静",
      "race": "エルフ",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 50,
      "combatPowerCorrectionA": 135,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260
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
            "fixedValue": 4
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
              "1": 700,
              "2": 770,
              "3": 840,
              "4": 910,
              "5": 980,
              "6": 1050,
              "7": 1120,
              "8": 1190,
              "9": 1260,
              "10": 1330,
              "11": 1400,
              "12": 1470
            }
          },
          {
            "effectId": "Elena_high_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 8
          },
          {
            "effectId": "Elena_high_e03",
            "valueKind": "最後の爆破の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630
            }
          }
        ],
        "skillId": "Elena_high",
        "skillType": "高学年",
        "skillName": "コードネーム：D-CAT",
        "description": "特殊ドローンを送り出した後、パルス波を周囲に放出し、敵に8回範囲物理ダメージを与える。",
        "cooldownSeconds": 28
      },
      {
        "effects": [
          {
            "effectId": "Elena_passive_e01",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "アメリア編成時",
            "effectTarget": "自身",
            "levels": {
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46
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
            "fixedValue": 90
          },
          {
            "effectId": "Elena_basic_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Elena_basic_e03",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60
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
            "fixedValue": 600
          }
        ],
        "skillId": "Elena_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で過充電されたエネルギー弾を発射して敵にダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 15
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
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲",
                "levels": {
                  "1": 1260,
                  "3": 1820,
                  "4": 2100,
                  "5": 2380,
                  "6": 2660,
                  "7": 2940,
                  "8": 3220,
                  "9": 3500,
                  "10": 3780,
                  "11": 4060,
                  "12": 4340
                }
              },
              {
                "valueKind": "物理ダメージ",
                "valueClass": "ヒット数",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲",
                "fixedValue": 8
              },
              {
                "valueKind": "最後の爆破の物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲",
                "levels": {
                  "1": 540,
                  "3": 780,
                  "4": 900,
                  "5": 1020,
                  "6": 1140,
                  "7": 1260,
                  "8": 1380,
                  "9": 1500,
                  "10": 1620,
                  "11": 1740,
                  "12": 1860
                }
              },
              {
                "valueKind": "気絶",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "effectTarget": "敵/範囲"
              },
              {
                "valueKind": "気絶",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "effectTarget": "敵/範囲",
                "fixedValue": 3
              }
            ],
            "targetSkill": "高学年",
            "skillName": "D-CATパルス波",
            "description": "強化された特殊ドローンを送った後、パルス波を周囲に放出して敵に8回の範囲物理ダメージを与え、気絶させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 100
              }
            ],
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
      "rarity": 3,
      "personality": "純粋",
      "race": "精霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 200,
      "spRecoveryPerSecond": 50,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.565
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 2,
      "defP": 2,
      "defM": 2,
      "crit": 1,
      "critDmg": 1,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 25,
              "2": 28,
              "3": 31,
              "4": 34,
              "5": 37,
              "6": 40,
              "7": 43,
              "8": 46,
              "9": 49,
              "10": 52,
              "11": 55,
              "12": 58
            }
          },
          {
            "effectId": "Gabia_low_e02",
            "valueKind": "シールド破壊時ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "シールド破壊時",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 220,
              "2": 242,
              "3": 264,
              "4": 286,
              "5": 308,
              "6": 330,
              "7": 352,
              "8": 374,
              "9": 396,
              "10": 418,
              "11": 440,
              "12": 462
            }
          },
          {
            "effectId": "Gabia_low_e03",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "残りHP割合が最も低い味方3名",
            "fixedValue": 6
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
              "1": 4,
              "2": 4.2,
              "3": 4.4,
              "4": 4.6,
              "5": 4.8,
              "6": 5,
              "7": 5.2,
              "8": 5.4,
              "9": 5.6,
              "10": 5.8,
              "11": 6,
              "12": 6.2
            }
          }
        ],
        "skillId": "Gabia_high",
        "skillType": "高学年",
        "skillName": "守って……みせる",
        "description": "残りHP割合が最も低い味方に無敵を付与する。",
        "cooldownSeconds": 23
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
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "自分HP50%以下",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 35,
              "2": 38,
              "3": 41,
              "4": 44,
              "5": 47,
              "6": 50,
              "7": 53,
              "8": 56,
              "9": 59,
              "10": 62,
              "11": 65,
              "12": 68
            }
          },
          {
            "effectId": "Gabia_passive_e03",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "自分HP50%以下",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Gabia_passive_e04",
            "valueKind": "シールド",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "condition": "自分HP50%以下",
            "effectTarget": "自身",
            "fixedValue": 25
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
            "fixedValue": 100
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
      "rarity": 2,
      "personality": "活発",
      "race": "妖精",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.4
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 2,
      "defP": 2,
      "defM": 2,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 8,
              "2": 8.7,
              "3": 9.4,
              "4": 10.1,
              "5": 10.8,
              "6": 11.5,
              "7": 12.2,
              "8": 12.9,
              "9": 13.6,
              "10": 14.3,
              "11": 15,
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
              "1": 15,
              "2": 16.5,
              "3": 18,
              "4": 19.5,
              "5": 21,
              "6": 22.5,
              "7": 24,
              "8": 25.5,
              "9": 27,
              "10": 28.5,
              "11": 30,
              "12": 31.5
            }
          },
          {
            "effectId": "Carren_high_e02",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "回復",
            "effectTarget": "HPが最も少ない味方",
            "fixedValue": 3
          },
          {
            "effectId": "Carren_high_e03",
            "valueKind": "回復回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "HPが最も少ない味方3名",
            "fixedValue": 3
          }
        ],
        "skillId": "Carren_high",
        "skillType": "高学年",
        "skillName": "シェイク・ア・キャロット",
        "description": "HPが最も少ない味方3名のHPを3回回復させる。",
        "cooldownSeconds": 24
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 100
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
      "rarity": 3,
      "personality": "活発",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 330,
              "2": 363,
              "3": 396,
              "4": 429,
              "5": 462,
              "6": 495,
              "7": 528,
              "8": 561,
              "9": 594,
              "10": 627,
              "11": 660,
              "12": 693
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
              "1": 525,
              "2": 570,
              "3": 615,
              "4": 660,
              "5": 705,
              "6": 750,
              "7": 795,
              "8": 840,
              "9": 885,
              "10": 930,
              "11": 975,
              "12": 1020
            }
          }
        ],
        "skillId": "Canna_high",
        "skillType": "高学年",
        "skillName": "ラムボム",
        "description": "追跡する羊爆弾を発射し、敵に物理ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Canna_passive_e02",
            "valueKind": "強化攻撃確率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
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
            "fixedValue": 125
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
            "fixedValue": 250
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
        "triggerValue": 20
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "kidian",
    "name": "ギデオン",
    "basic": {
      "rarity": 3,
      "personality": "憂鬱",
      "race": "竜族",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 200,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 300,
              "2": 335,
              "3": 370,
              "4": 405,
              "5": 440,
              "6": 475,
              "7": 510,
              "8": 545,
              "9": 580,
              "10": 615,
              "11": 650,
              "12": 685
            }
          },
          {
            "effectId": "Kidian_low_e02",
            "valueKind": "基本攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Kidian_low_e03",
            "valueKind": "遺物1個ごとの追加攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 1
          },
          {
            "effectId": "Kidian_low_e04",
            "valueKind": "最大追加攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
          },
          {
            "effectId": "Kidian_low_e05",
            "valueKind": "遺物0：総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "装備遺物0時",
            "effectTarget": "敵",
            "levels": {
              "1": 600,
              "2": 670,
              "3": 740,
              "4": 810,
              "5": 880,
              "6": 950,
              "7": 1020,
              "8": 1090,
              "9": 1160,
              "10": 1230,
              "11": 1300,
              "12": 1370
            }
          },
          {
            "effectId": "Kidian_low_e06",
            "valueKind": "遺物1：総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "装備遺物1時",
            "effectTarget": "敵",
            "levels": {
              "1": 900,
              "2": 1005,
              "3": 1110,
              "4": 1215,
              "5": 1320,
              "6": 1425,
              "7": 1530,
              "8": 1635,
              "9": 1740,
              "10": 1845,
              "11": 1950,
              "12": 2055
            }
          },
          {
            "effectId": "Kidian_low_e07",
            "valueKind": "遺物2：総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "装備遺物2時",
            "effectTarget": "敵",
            "levels": {
              "1": 1200,
              "2": 1340,
              "3": 1480,
              "4": 1620,
              "5": 1760,
              "6": 1900,
              "7": 2040,
              "8": 2180,
              "9": 2320,
              "10": 2460,
              "11": 2600,
              "12": 2740
            }
          },
          {
            "effectId": "Kidian_low_e08",
            "valueKind": "遺物3：総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "装備遺物3時",
            "effectTarget": "敵",
            "levels": {
              "1": 1500,
              "2": 1675,
              "3": 1850,
              "4": 2025,
              "5": 2200,
              "6": 2375,
              "7": 2550,
              "8": 2725,
              "9": 2900,
              "10": 3075,
              "11": 3250,
              "12": 3425
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
              "1": 200,
              "2": 215,
              "3": 230,
              "4": 245,
              "5": 260,
              "6": 275,
              "7": 290,
              "8": 305,
              "9": 320,
              "10": 335,
              "11": 350,
              "12": 365
            }
          },
          {
            "effectId": "Kidian_high_e02",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵の周囲",
            "levels": {
              "1": 600,
              "2": 645,
              "3": 690,
              "4": 735,
              "5": 780,
              "6": 825,
              "7": 870,
              "8": 915,
              "9": 960,
              "10": 1005,
              "11": 1050,
              "12": 1095
            }
          },
          {
            "effectId": "Kidian_high_e03",
            "valueKind": "攻撃回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵の周囲",
            "fixedValue": 3
          }
        ],
        "skillId": "Kidian_high",
        "skillType": "高学年",
        "skillName": "シャドウダイブ",
        "description": "影に隠れた後、残りHP割合が最も低い敵の付近に現れ、範囲物理ダメージを3回与える。",
        "cooldownSeconds": 24
      },
      {
        "effects": [
          {
            "effectId": "Kidian_passive_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "スキル使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 24,
              "2": 28,
              "3": 32,
              "4": 36,
              "5": 40,
              "6": 44,
              "7": 48,
              "8": 52,
              "9": 56,
              "10": 60,
              "11": 64,
              "12": 68
            }
          },
          {
            "effectId": "Kidian_passive_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "スキル使用時",
            "effectTarget": "自身",
            "fixedValue": 6
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
            "fixedValue": 100
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
      "levels": {}
    },
    "board": null
  },
  {
    "id": "kyarot",
    "name": "キャロット",
    "basic": {
      "rarity": 3,
      "personality": "純粋",
      "race": "妖精",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 95,
      "combatPowerCorrectionB": 0.335
    },
    "statTypes": {
      "hp": 4,
      "atkP": 0,
      "atkM": 1,
      "defP": 4,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Kyarot_low_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21,
              "13": 22,
              "14": 23,
              "15": 24
            }
          },
          {
            "effectId": "Kyarot_low_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "fixedValue": 8
          },
          {
            "effectId": "Kyarot_low_e03",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "levels": {
              "1": 25,
              "2": 26,
              "3": 27,
              "4": 28,
              "5": 29,
              "6": 30,
              "7": 31,
              "8": 32,
              "9": 33,
              "10": 34,
              "11": 35,
              "12": 36,
              "13": 37,
              "14": 38,
              "15": 39
            }
          },
          {
            "effectId": "Kyarot_low_e04",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "樹液範囲内時",
            "effectTarget": "範囲内の味方",
            "fixedValue": 8
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
            "fixedValue": 6
          },
          {
            "effectId": "Kyarot_high_e02",
            "valueKind": "HP回復",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "範囲内の味方",
            "fixedValue": 12
          },
          {
            "effectId": "Kyarot_high_e03",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 40,
              "2": 44,
              "3": 48,
              "4": 52,
              "5": 56,
              "6": 60,
              "7": 64,
              "8": 68,
              "9": 72,
              "10": 76,
              "11": 80,
              "12": 84,
              "13": 88,
              "14": 92,
              "15": 96
            }
          },
          {
            "effectId": "Kyarot_high_e04",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 12
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
            "fixedValue": 8
          }
        ],
        "skillId": "Kyarot_high",
        "skillType": "高学年",
        "skillName": "樹液ポンプ発射！",
        "description": "味方と敵にそれぞれサトウキビの樹液を12回ずつ発射する。味方に発射された樹液は範囲内の味方のHPを回復させる。敵に発射された樹液は範囲内の敵に範囲魔法ダメージを与える。最後に発射された樹液は真ん中にいる敵に範囲魔法ダメージを与え、沈黙を付与する。",
        "cooldownSeconds": 32
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
              "1": 1,
              "2": 2,
              "3": 3,
              "4": 4,
              "5": 5,
              "6": 6,
              "7": 7,
              "8": 8,
              "9": 9,
              "10": 10,
              "11": 11,
              "12": 12,
              "13": 13,
              "14": 14,
              "15": 15
            }
          },
          {
            "effectId": "Kyarot_passive_e02",
            "valueKind": "SP回復周期",
            "valueClass": "周期",
            "effectType": "回復",
            "effectTarget": "自身と周囲の味方",
            "fixedValue": 2
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
            "fixedValue": 85
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
            "fixedValue": 50
          }
        ],
        "skillId": "Kyarot_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回目の攻撃の代わりに、魔法成長肥料を撒いて周囲の味方のSPを回復する。",
        "triggerType": "n回ごと",
        "triggerValue": 4
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
                "valueKind": "対象追加",
                "valueClass": "対象数",
                "effectType": "スキル変更",
                "effectTarget": "自身と最もHP割合が低い味方",
                "reference": "低学年",
                "fixedValue": 2
              },
              {
                "valueKind": "攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "levels": {
                  "1": 20,
                  "3": 22,
                  "4": 23,
                  "5": 24,
                  "6": 25,
                  "7": 26,
                  "8": 27,
                  "9": 28,
                  "10": 29,
                  "11": 30,
                  "12": 31,
                  "13": 32,
                  "14": 33,
                  "15": 34
                }
              },
              {
                "valueKind": "攻撃力増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 8
              },
              {
                "valueKind": "HP回復量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 20
              },
              {
                "valueKind": "HP回復量増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 8
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "levels": {
                  "1": 31,
                  "3": 33,
                  "4": 34,
                  "5": 35,
                  "6": 36,
                  "7": 37,
                  "8": 38,
                  "9": 39,
                  "10": 40,
                  "11": 41,
                  "12": 42,
                  "13": 43,
                  "14": 44,
                  "15": 45
                }
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "樹液範囲内時",
                "effectTarget": "範囲内の味方",
                "fixedValue": 8
              }
            ],
            "targetSkill": "低学年",
            "skillName": "急成長の樹液発射",
            "description": "サトウキビの樹液を振って発射する。発射された樹液は、しばらくして自身と最もHP割合が低い味方に落ちる。樹液は範囲内の味方の攻撃力、HP回復量を増加させ、被ダメージ量を減少させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "最大HP増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "物理防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "魔法防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
            "skillName": "愛用カード効果",
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "ニンジンの鮮度維持",
          "stats": [],
          "effects": [
            {
              "valueKind": "シールド",
              "valueClass": "倍率",
              "effectType": "シールド",
              "condition": "強化攻撃時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "reference": "最大HP",
              "fixedValue": 30
            },
            {
              "valueKind": "シールド",
              "valueClass": "持続時間",
              "effectType": "シールド",
              "condition": "強化攻撃時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 5
            },
            {
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "condition": "シールド破壊時",
              "effectTarget": "自身",
              "targetSkill": "シールド破壊時",
              "fixedValue": 45
            }
          ],
          "description": "強化攻撃にシールドが追加される。シールドが破壊されると、追加でSPを回復する。"
        },
        "3": {
          "name": "アイスニンジン",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 1,
      "personality": "純粋",
      "race": "妖精",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 2,
      "defP": 2,
      "defM": 2,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 5,
              "2": 6.3,
              "3": 7.5,
              "4": 8.8,
              "5": 10,
              "6": 11.3,
              "7": 12.5,
              "8": 13.8,
              "9": 15,
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
              "1": 10,
              "2": 12,
              "3": 14,
              "4": 16,
              "5": 18,
              "6": 20,
              "7": 22,
              "8": 24,
              "9": 26,
              "10": 28,
              "11": 30,
              "12": 32
            }
          }
        ],
        "skillId": "Kyuri_high",
        "skillType": "高学年",
        "skillName": "教主の祝福-キュウイ",
        "description": "教主の力を借り、残りHP割合が最も低い味方を回復する。",
        "cooldownSeconds": 16
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
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63
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
            "fixedValue": 100
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "狂気",
      "race": "妖精",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 200,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 5,
      "atkP": 0,
      "atkM": 2,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 5,
      "critDmgRes": 5
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Chloe_low_e01",
            "valueKind": "ぬいぐるみの意志",
            "valueClass": "持続時間",
            "effectType": "スキル変更",
            "effectTarget": "自身",
            "levels": {
              "1": 8,
              "2": 8.4,
              "3": 8.8,
              "4": 9.2,
              "5": 9.6,
              "6": 10,
              "7": 10.4,
              "8": 10.8,
              "9": 11.2,
              "10": 11.6,
              "11": 12,
              "12": 12.4,
              "13": 12.8,
              "14": 13.2,
              "15": 13.6
            }
          },
          {
            "effectId": "Chloe_low_e02",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 40,
              "2": 44,
              "3": 48,
              "4": 52,
              "5": 56,
              "6": 60,
              "7": 64,
              "8": 68,
              "9": 72,
              "10": 76,
              "11": 80,
              "12": 84,
              "13": 88,
              "14": 92,
              "15": 96
            }
          },
          {
            "effectId": "Chloe_low_e03",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Chloe_low_e04",
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "基本攻撃時",
            "effectTarget": "自身",
            "fixedValue": 7
          },
          {
            "effectId": "Chloe_low_e05",
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "基本攻撃時",
            "effectTarget": "自身",
            "fixedValue": 10
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
            "fixedValue": 7
          },
          {
            "effectId": "Chloe_high_e02",
            "valueKind": "1体あたりの魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 160,
              "2": 176,
              "3": 192,
              "4": 208,
              "5": 224,
              "6": 240,
              "7": 256,
              "8": 272,
              "9": 288,
              "10": 304,
              "11": 320,
              "12": 336,
              "13": 352,
              "14": 368,
              "15": 384
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
        "cooldownSeconds": 50
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
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46,
              "13": 48,
              "14": 50,
              "15": 52
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
            "effectTarget": "敵",
            "fixedValue": 125
          },
          {
            "effectId": "Chloe_basic_e02",
            "valueKind": "ぬいぐるみの意志の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ぬいぐるみの意志発動時",
            "effectTarget": "敵",
            "fixedValue": 192
          },
          {
            "effectId": "Chloe_basic_e03",
            "valueKind": "ぬいぐるみの意志の魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "condition": "ぬいぐるみの意志発動時",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Chloe_basic_e04",
            "valueKind": "ぬいぐるみの意志の最後の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "ぬいぐるみの意志発動時",
            "effectTarget": "敵/範囲",
            "fixedValue": 288
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
            "effectTarget": "敵/範囲",
            "fixedValue": 300
          },
          {
            "effectId": "Chloe_enhanced_e02",
            "valueKind": "挑発",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          },
          {
            "effectId": "Chloe_enhanced_e03",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲",
            "fixedValue": 2
          },
          {
            "effectId": "Chloe_enhanced_e04",
            "valueKind": "ノックバック",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectTarget": "敵/範囲"
          }
        ],
        "skillId": "Chloe_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回攻撃するごとに両腕を叩きつけて敵を挑発し、範囲魔法ダメージを与え、ノックバックさせる。ぬいぐるみの意志発動中は強化攻撃を使用できない。",
        "triggerType": "n回ごと",
        "triggerValue": 3
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
                "valueKind": "普通攻撃の被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "levels": {
                  "1": 24,
                  "3": 28,
                  "4": 30,
                  "5": 32,
                  "6": 34,
                  "7": 36,
                  "8": 38,
                  "9": 40,
                  "10": 42,
                  "11": 44,
                  "12": 46
                }
              },
              {
                "valueKind": "周期",
                "valueClass": "周期",
                "effectType": "攻撃",
                "effectTarget": "敵/周囲",
                "fixedValue": 2
              },
              {
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/周囲",
                "fixedValue": 230
              },
              {
                "valueKind": "糸爆弾",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "effectTarget": "敵/周囲"
              },
              {
                "valueKind": "糸爆弾",
                "valueClass": "最大スタック",
                "effectType": "デバフ",
                "effectTarget": "敵/周囲",
                "fixedValue": 5
              },
              {
                "valueKind": "糸爆弾魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/周囲",
                "fixedValue": 346
              }
            ],
            "targetSkill": "パッシブ",
            "skillName": "パッシブスキル",
            "description": "普通攻撃の被ダメージ量が減少する。ぬいぐるみの意志発動中、2秒ごとに周囲の敵に魔法ダメージを与える。ダメージを受けた敵は糸爆弾が付与される。糸爆弾は最大5つまでスタックする。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "F/W クロエルック",
          "stats": [],
          "effects": [
            {
              "valueKind": "気絶",
              "valueClass": "状態免疫",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "valueKind": "変異",
              "valueClass": "状態免疫",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "valueKind": "直接ダメージ被弾回数",
              "valueClass": "回数",
              "effectType": "条件",
              "effectTarget": "自身",
              "fixedValue": 14
            },
            {
              "valueKind": "挑発",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "effectTarget": "敵/周囲"
            },
            {
              "valueKind": "挑発",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectTarget": "敵/周囲",
              "fixedValue": 3
            },
            {
              "valueKind": "魔法ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "effectTarget": "敵/周囲",
              "fixedValue": 300
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 30
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 7
            },
            {
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "reference": "最大HP",
              "fixedValue": 1
            },
            {
              "valueKind": "HP回復",
              "valueClass": "周期",
              "effectType": "回復",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 1
            },
            {
              "valueKind": "HP回復",
              "valueClass": "持続時間",
              "effectType": "回復",
              "condition": "ぬいぐるみの意志発動時",
              "effectTarget": "自身",
              "fixedValue": 7
            }
          ],
          "description": "気絶と変異の免疫を持つ。直接ダメージによって14回ダメージを受けると、周囲の敵を挑発して範囲魔法ダメージを与える。ぬいぐるみの意志が発動すると、一定時間、攻撃速度が増加し、1秒ごとにHPが回復する。"
        },
        "3": {
          "name": "ランウェイオープニング",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 4
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 19.5
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 8.8
            }
          ],
          "description": "前列の味方の敵への与ダメージ量を増加させ、前列味方の敵からの被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "kommy",
    "name": "コミー",
    "basic": {
      "rarity": 3,
      "personality": "憂鬱",
      "race": "獣人",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 5,
      "atkP": 2,
      "atkM": 0,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Kommy_low_e01",
            "valueKind": "HP回復持続",
            "valueClass": "倍率",
            "effectType": "回復",
            "condition": "睡眠中",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 12.5,
              "2": 13.25,
              "3": 14,
              "4": 14.75,
              "5": 15.5,
              "6": 16.25,
              "7": 17,
              "8": 17.75,
              "9": 18.5,
              "10": 19.25,
              "11": 20,
              "12": 20.75
            }
          },
          {
            "effectId": "Kommy_low_e02",
            "valueKind": "HP回復持続",
            "valueClass": "持続時間",
            "effectType": "回復",
            "condition": "睡眠中",
            "effectTarget": "自身",
            "fixedValue": 4
          },
          {
            "effectId": "Kommy_low_e03",
            "valueKind": "デバフ",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "condition": "睡眠中",
            "effectTarget": "自身"
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
              "1": 450,
              "2": 495,
              "3": 540,
              "4": 585,
              "5": 630,
              "6": 675,
              "7": 720,
              "8": 765,
              "9": 810,
              "10": 855,
              "11": 900,
              "12": 945
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
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63
            }
          },
          {
            "effectId": "Kommy_high_e03",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "巨大化中",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Kommy_high_e04",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "巨大化中",
            "effectTarget": "自身",
            "levels": {
              "1": 50,
              "2": 54,
              "3": 58,
              "4": 62,
              "5": 66,
              "6": 70,
              "7": 74,
              "8": 78,
              "9": 82,
              "10": 86,
              "11": 90,
              "12": 94
            }
          },
          {
            "effectId": "Kommy_high_e05",
            "valueKind": "巨大化",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "巨大化中",
            "effectTarget": "自身",
            "fixedValue": 12
          }
        ],
        "skillId": "Kommy_high",
        "skillType": "高学年",
        "skillName": "エルフ族特製アニマル缶",
        "description": "特別なアニマル缶を食べ、一定時間、巨大化する。 着地時に衝撃波を起こして範囲物理ダメージを与え、HPを回復する。 巨大化の持続時間中、与ダメージ量と攻撃速度が増加する。",
        "cooldownSeconds": 24
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 150
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
            "fixedValue": 300
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
        "triggerValue": 20
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
      "rarity": 2,
      "personality": "純粋",
      "race": "幽霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 180,
              "2": 200,
              "3": 220,
              "4": 240,
              "5": 260,
              "6": 280,
              "7": 300,
              "8": 320,
              "9": 340,
              "10": 360,
              "11": 380,
              "12": 400
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
              "1": 400,
              "2": 440,
              "3": 480,
              "4": 520,
              "5": 560,
              "6": 600,
              "7": 640,
              "8": 680,
              "9": 720,
              "10": 760,
              "11": 800,
              "12": 840
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
            "fixedValue": 6
          }
        ],
        "skillId": "Sari_high",
        "skillType": "高学年",
        "skillName": "超ポジティブトリック",
        "description": "敵に鎌で物理ダメージを与えて沈黙を付与する。",
        "cooldownSeconds": 18
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 70
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
      "rarity": 3,
      "personality": "冷静",
      "race": "精霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 500,
              "2": 565,
              "3": 630,
              "4": 695,
              "5": 760,
              "6": 825,
              "7": 890,
              "8": 955,
              "9": 1020,
              "10": 1085,
              "11": 1150,
              "12": 1215,
              "13": 1280,
              "14": 1345,
              "15": 1410
            }
          },
          {
            "effectId": "Sylla_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も遠い敵",
            "fixedValue": 5
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
              "1": 840,
              "2": 930,
              "3": 1020,
              "4": 1110,
              "5": 1200,
              "6": 1290,
              "7": 1380,
              "8": 1470,
              "9": 1560,
              "10": 1650,
              "11": 1740,
              "12": 1830,
              "13": 1920,
              "14": 2010,
              "15": 2100
            }
          }
        ],
        "skillId": "Sylla_high",
        "skillType": "高学年",
        "skillName": "ヘクトパスカルスイング！",
        "description": "風の精霊を飛ばして指定範囲内で最も遠い敵に物理ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 30,
              "2": 32,
              "3": 34,
              "4": 36,
              "5": 38,
              "6": 40,
              "7": 42,
              "8": 44,
              "9": 46,
              "10": 48,
              "11": 50,
              "12": 52,
              "13": 54,
              "14": 56,
              "15": 58
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
            "fixedValue": 150
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "竜巻が吹く",
          "stats": [],
          "effects": [
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 40
            },
            {
              "valueKind": "竜巻ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "普通攻撃命中時",
              "effectTarget": "敵",
              "targetSkill": "普通攻撃",
              "fixedValue": 120
            },
            {
              "valueKind": "竜巻追加ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "普通攻撃命中時かつ追加で敵がいる場合",
              "effectTarget": "竜巻ダメージを与えた敵を除く他の敵",
              "targetSkill": "普通攻撃",
              "fixedValue": 120
            }
          ],
          "description": "攻撃速度が増加する。\n普通攻撃命中時に一定確率で竜巻が発生し、ダメージを受けた敵に物理ダメージを与えて消える。\n周囲に敵がいる場合、竜巻が追加で1つ発生し、ダメージを受けた敵を除く他の敵に物理ダメージを与えて消える。"
        },
        "3": {
          "name": "精霊の守護者",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
            },
            {
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
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
      "rarity": 3,
      "personality": "狂気",
      "race": "幽霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 25,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.375
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 420,
              "2": 468,
              "3": 516,
              "4": 564,
              "5": 612,
              "6": 660,
              "7": 708,
              "8": 756,
              "9": 804,
              "10": 852,
              "11": 900,
              "12": 948
            }
          },
          {
            "effectId": "Shaydi_low_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "levels": {
              "1": 630,
              "2": 702,
              "3": 774,
              "4": 846,
              "5": 918,
              "6": 990,
              "7": 1062,
              "8": 1134,
              "9": 1206,
              "10": 1278,
              "11": 1350,
              "12": 1422
            }
          },
          {
            "effectId": "Shaydi_low_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "fixedValue": 13
          },
          {
            "effectId": "Shaydi_low_e04",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "射程距離内で最も後ろにいる敵",
            "levels": {
              "1": 15,
              "2": 16.5,
              "3": 18,
              "4": 19.5,
              "5": 21,
              "6": 22.5,
              "7": 24,
              "8": 25.5,
              "9": 27,
              "10": 28.5,
              "11": 30,
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
            "fixedValue": 6
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
              "1": 6,
              "2": 6.5,
              "3": 7,
              "4": 7.5,
              "5": 8,
              "6": 8.5,
              "7": 9,
              "8": 9.5,
              "9": 10,
              "10": 10.5,
              "11": 11,
              "12": 11.5
            }
          }
        ],
        "skillId": "Shaydi_high",
        "skillType": "高学年",
        "skillName": "タイム・オブ・シェイディ",
        "description": "次元を移動しながらランダムな敵に物理ダメージを6回与え、沈黙を付与する。",
        "cooldownSeconds": 18
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
              "1": 6,
              "2": 7,
              "3": 8,
              "4": 9,
              "5": 10,
              "6": 11,
              "7": 12,
              "8": 13,
              "9": 14,
              "10": 15,
              "11": 16,
              "12": 17
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
            "fixedValue": 175
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
      "rarity": 3,
      "personality": "冷静",
      "race": "竜族",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 25,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 200,
              "2": 225,
              "3": 250,
              "4": 275,
              "5": 300,
              "6": 325,
              "7": 350,
              "8": 375,
              "9": 400,
              "10": 425,
              "11": 450,
              "12": 475
            }
          },
          {
            "effectId": "Jade_low_e02",
            "valueKind": "翡翠玉1～2スタック時ダメージ倍率",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "翡翠玉1～2スタック時",
            "effectTarget": "自身",
            "fixedValue": 1.2
          },
          {
            "effectId": "Jade_low_e03",
            "valueKind": "翡翠玉3スタック時ダメージ倍率",
            "valueClass": "倍率",
            "effectType": "バフ",
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
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260
            }
          },
          {
            "effectId": "Jade_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 4
          },
          {
            "effectId": "Jade_high_e03",
            "valueKind": "翡翠玉獲得",
            "valueClass": "回数",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3
          },
          {
            "effectId": "Jade_high_e04",
            "valueKind": "SP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 15
          }
        ],
        "skillId": "Jade_high",
        "skillType": "高学年",
        "skillName": "ゲルマニウム覚醒",
        "description": "地面を割って鉱物を噴出させ、敵に4回範囲魔法ダメージを与え、翡翠玉を3スタック獲得し、SPを回復する。",
        "cooldownSeconds": 18
      },
      {
        "effects": [
          {
            "effectId": "Jade_passive_e01",
            "valueKind": "魔法攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "翡翠玉3スタックで翡翠玉取得時",
            "effectTarget": "自身",
            "levels": {
              "1": 19,
              "2": 20,
              "3": 21,
              "4": 22,
              "5": 23,
              "6": 24,
              "7": 25,
              "8": 26,
              "9": 27,
              "10": 28,
              "11": 29,
              "12": 30
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
            "fixedValue": 75
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
            "effectTarget": "自身",
            "fixedValue": 1
          },
          {
            "effectId": "Jade_enhanced_e02",
            "valueKind": "翡翠玉最大スタック",
            "valueClass": "回数",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 3
          },
          {
            "effectId": "Jade_enhanced_e03",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "翡翠玉獲得時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 30
          },
          {
            "effectId": "Jade_enhanced_e04",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "翡翠玉獲得時",
            "effectTarget": "自身",
            "fixedValue": 6
          }
        ],
        "skillId": "Jade_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で翡翠を摂取し、翡翠玉を1スタック獲得する。 翡翠玉の獲得時、自身に魔法のシールドを生成する。",
        "triggerType": "一定確率",
        "triggerValue": 25
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
      "rarity": 3,
      "eldain": "不死者",
      "personality": "憂鬱",
      "race": "幽霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 50,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 105,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 4,
      "atkP": 5,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 200,
              "2": 215,
              "3": 230,
              "4": 245,
              "5": 260,
              "6": 275,
              "7": 290,
              "8": 305,
              "9": 320,
              "10": 335,
              "11": 350,
              "12": 365,
              "13": 380,
              "14": 395,
              "15": 410
            }
          },
          {
            "effectId": "Xion_low_e02",
            "valueKind": "魔弾獲得",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6,
            "effectTarget": "自身",
            "fixedValue": 2
          },
          {
            "effectId": "Xion_low_e03",
            "valueKind": "魔弾最大数",
            "valueClass": "固定値",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Xion_low_e04",
            "valueKind": "魔弾の物理ダメージ量増加(与ダメージ量増加)",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6,
            "condition": "魔弾所持時",
            "effectTarget": "自身",
            "fixedValue": 5
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
              "1": 200,
              "2": 215,
              "3": 230,
              "4": 245,
              "5": 260,
              "6": 275,
              "7": 290,
              "8": 305,
              "9": 320,
              "10": 335,
              "11": 350,
              "12": 365,
              "13": 380,
              "14": 395,
              "15": 410
            }
          },
          {
            "effectId": "Xion_high_e02",
            "valueKind": "魔弾獲得",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6,
            "effectTarget": "自身",
            "fixedValue": 1
          },
          {
            "effectId": "Xion_high_e03",
            "valueKind": "魔弾最大数",
            "valueClass": "固定値",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Xion_high_e04",
            "valueKind": "魔弾の物理ダメージ量増加(与ダメージ量増加)",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6,
            "condition": "魔弾所持時",
            "effectTarget": "自身",
            "fixedValue": 5
          }
        ],
        "skillId": "Xion_high",
        "skillType": "高学年",
        "skillName": "アポカリプス★ゼロ",
        "description": "指定範囲内で最も遠い敵に範囲物理ダメージを与え、魔弾を1個獲得する。魔弾は最大6個まで獲得可能。",
        "cooldownSeconds": 18
      },
      {
        "effects": [
          {
            "effectId": "Xion_passive_e01",
            "valueKind": "物理攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "魔弾獲得時",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 23,
              "3": 26,
              "4": 29,
              "5": 32,
              "6": 35,
              "7": 38,
              "8": 41,
              "9": 44,
              "10": 47,
              "11": 50,
              "12": 53,
              "13": 56,
              "14": 59,
              "15": 62
            }
          },
          {
            "effectId": "Xion_passive_e02",
            "valueKind": "物理攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 9,
            "condition": "魔弾獲得時",
            "effectTarget": "自身",
            "fixedValue": 10
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
            "fixedValue": 200
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
            "fixedValue": 350
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
            "fixedValue": 6
          },
          {
            "effectId": "Xion_enhanced_e04",
            "valueKind": "魔弾獲得",
            "valueClass": "固定値",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6,
            "effectTarget": "自身",
            "fixedValue": 1
          },
          {
            "effectId": "Xion_enhanced_e05",
            "valueKind": "魔弾の物理ダメージ量増加(与ダメージ量増加)",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectStack": true,
            "maxStack": 6,
            "condition": "魔弾所持時",
            "effectTarget": "自身",
            "fixedValue": 5
          }
        ],
        "skillId": "Xion_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回攻撃するごとに敵に範囲物理ダメージと目隠しを付与し、魔弾を1個獲得する。魔弾は最大6個まで獲得可能。",
        "triggerType": "n回ごと",
        "triggerValue": 3
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
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/最も遠い敵",
                "fixedValue": 200
              }
            ],
            "targetSkill": "普通攻撃_基本",
            "skillName": "基本",
            "description": "弾丸を発射し、指定された射程距離内で最も離れている敵に物理ダメージを与える。一定確率で強化の弾丸を発射し、より高い物理ダメージを与える。"
          },
          {
            "effects": [
              {
                "valueKind": "強化の弾丸物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "敵/最も遠い敵",
                "fixedValue": 444
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "基本",
            "description": "弾丸を発射し、指定された射程距離内で最も離れている敵に物理ダメージを与える。一定確率で強化の弾丸を発射し、より高い物理ダメージを与える。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "絶対なる魔弾の力と言うべきだろうか？",
          "stats": [],
          "effects": [
            {
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "fixedValue": 30
            },
            {
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "基本攻撃命中時",
              "targetSkill": "基本攻撃",
              "reference": "最大HP",
              "fixedValue": 3
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキル使用時",
              "fixedValue": 100
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "高学年スキル使用時",
              "fixedValue": 100
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "fixedValue": 6
            },
            {
              "valueKind": "低学年スキルダメージ増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキル使用時",
              "targetSkill": "低学年スキル",
              "fixedValue": 100
            }
          ],
          "description": "最大HPが増加し、基本攻撃命中時、HPを回復する。低学年スキル、高学年スキル使用後、攻撃速度が増加する。\n低学年スキル使用中、敵が一体しかいない場合、ダメージが増加する。"
        },
        "3": {
          "name": "闇・の・救・世・主★",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 4
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "与ダメージ量増加",
              "effectType": "倍率",
              "effectTarget": "味方/後列",
              "fixedValue": 19.5
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "被ダメージ量減少",
              "effectType": "倍率",
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
      "rarity": 3,
      "personality": "狂気",
      "race": "竜族",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 200,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 5,
      "critDmg": 5,
      "critRes": 2,
      "critDmgRes": 2
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Sist_low_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 15,
              "2": 17,
              "3": 19,
              "4": 21,
              "5": 23,
              "6": 25,
              "7": 27,
              "8": 29,
              "9": 31,
              "10": 33,
              "11": 35,
              "12": 37,
              "13": 39,
              "14": 41,
              "15": 43
            }
          },
          {
            "effectId": "Sist_low_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 10
          },
          {
            "effectId": "Sist_low_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 15,
              "2": 17,
              "3": 19,
              "4": 21,
              "5": 23,
              "6": 25,
              "7": 27,
              "8": 29,
              "9": 31,
              "10": 33,
              "11": 35,
              "12": 37,
              "13": 39,
              "14": 41,
              "15": 43
            }
          },
          {
            "effectId": "Sist_low_e04",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 10
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
            "fixedValue": 2
          }
        ],
        "skillId": "Sist_high",
        "skillType": "高学年",
        "skillName": "弾丸のお届け物で～す",
        "description": "弾丸を発射し、残りHP割合が最も低い敵に物理ダメージを与える。敵を撃破すると、スキルを追加で使用する。",
        "cooldownSeconds": 24
      },
      {
        "effects": [
          {
            "effectId": "Sist_passive_e01",
            "valueKind": "クールタイム減少",
            "valueClass": "固定値",
            "effectType": "バフ",
            "condition": "基本攻撃命中時",
            "effectTarget": "自身",
            "fixedValue": "秒",
            "levels": {
              "1": 1,
              "2": 1.1,
              "3": 1.2,
              "4": 1.3,
              "5": 1.4,
              "6": 1.5,
              "7": 1.6,
              "8": 1.7,
              "9": 1.8,
              "10": 1.9,
              "11": 2,
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
            "fixedValue": 110
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "友情をかけた勝負",
          "stats": [],
          "effects": [
            {
              "valueKind": "ランダムな味方の使徒",
              "valueClass": "対象数",
              "effectType": "バフ",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方/アタッカー",
              "targetSkill": "低学年スキル",
              "fixedValue": 2
            },
            {
              "valueKind": "攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方/アタッカー",
              "targetSkill": "低学年スキル",
              "reference": "低学年スキルのレベルに依存"
            },
            {
              "valueKind": "攻撃力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方/アタッカー",
              "targetSkill": "低学年スキル",
              "fixedValue": 10
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキルのバフを獲得時",
              "effectTarget": "味方/アタッカー",
              "targetSkill": "低学年スキル",
              "reference": "低学年スキルのレベルに依存"
            },
            {
              "valueKind": "乱数最大固定",
              "valueClass": "条件",
              "effectType": "スキル変更",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル"
            }
          ],
          "description": "低学年スキルのバフを獲得時、ランダムな味方アタッカー使徒の攻撃力と攻撃速度を増加させる。アタッカー使徒がいない場合は、ランダムな味方に適用される。高学年スキルは、常に最大物理ダメージ量を与える。"
        },
        "3": {
          "name": "味方ターゲット商品",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "会心増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
            },
            {
              "valueKind": "会心ダメージ増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
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
      "rarity": 3,
      "personality": "活発",
      "race": "妖精",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 100,
      "spRecoveryPerSecond": 44,
      "combatPowerCorrectionA": 95,
      "combatPowerCorrectionB": 0.41
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 1,
      "defP": 4,
      "defM": 4,
      "crit": 1,
      "critDmg": 1,
      "critRes": 5,
      "critDmgRes": 5
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
            "fixedValue": 20
          },
          {
            "effectId": "Shoupan_low_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "reference": "自分の攻撃力",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
            }
          },
          {
            "effectId": "Shoupan_low_e03",
            "valueKind": "回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "周囲の味方",
            "fixedValue": 4
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
              "1": 500,
              "2": 550,
              "3": 600,
              "4": 650,
              "5": 700,
              "6": 750,
              "7": 800,
              "8": 850,
              "9": 900,
              "10": 950,
              "11": 1000,
              "12": 1050
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
            "fixedValue": 10
          },
          {
            "effectId": "Shoupan_high_e04",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方",
            "levels": {
              "1": 20,
              "2": 21,
              "3": 22,
              "4": 23,
              "5": 24,
              "6": 25,
              "7": 26,
              "8": 27,
              "9": 28,
              "10": 29,
              "11": 30,
              "12": 31
            }
          },
          {
            "effectId": "Shoupan_high_e05",
            "valueKind": "防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方",
            "fixedValue": 10
          }
        ],
        "skillId": "Shoupan_high",
        "skillType": "高学年",
        "skillName": "シュパン配送",
        "description": "前方へ疾走しながら郵便物をばらまき、味方の防御力を増加させる。 衝突した敵には範囲魔法ダメージを与え、ノイズを付与する。",
        "cooldownSeconds": 36
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
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46
            }
          },
          {
            "effectId": "Shoupan_passive_e02",
            "valueKind": "移動速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 50
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
            "fixedValue": 55
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
            "fixedValue": 15
          }
        ],
        "skillId": "Shoupan_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "2回目の攻撃の代わりに、HP割合が最も低い味方を回復させ、元の位置に戻る。",
        "triggerType": "n回ごと",
        "triggerValue": 2
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
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "triggerType": "n回ごと",
                "triggerValue": 2,
                "effectTarget": "残りHP割合が最も低い味方",
                "reference": "対象の最大HP",
                "fixedValue": 15
              },
              {
                "valueKind": "シールド",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "reference": "最大HP",
                "fixedValue": 30
              },
              {
                "valueKind": "シールド",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "fixedValue": 6
              },
              {
                "valueKind": "防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "fixedValue": 36
              },
              {
                "valueKind": "防御力増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 2,
                "condition": "強化攻撃時",
                "effectTarget": "回復させた味方",
                "fixedValue": 6
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "2回目の攻撃の代わりに、残りHP割合が最も低い味方を回復させ、元の位置に戻る。\n回復させた味方にシールドを付与し、防御力を増加させる。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "クールタイム減少",
                "valueClass": "固定値",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 5
              }
            ],
            "targetSkill": "高学年",
            "skillName": "シュパン配送",
            "description": "高学年スキルのクールタイムが減少"
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
      "rarity": 2,
      "personality": "活発",
      "race": "精霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 40,
              "2": 43,
              "3": 46,
              "4": 49,
              "5": 52,
              "6": 55,
              "7": 58,
              "8": 61,
              "9": 64,
              "10": 67,
              "11": 70,
              "12": 73
            }
          },
          {
            "effectId": "Jubee_low_e02",
            "valueKind": "召喚獣スキル物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "HP割合が最も低い敵",
            "levels": {
              "1": 90,
              "2": 100,
              "3": 110,
              "4": 120,
              "5": 130,
              "6": 140,
              "7": 150,
              "8": 160,
              "9": 170,
              "10": 180,
              "11": 190,
              "12": 200
            }
          },
          {
            "effectId": "Jubee_low_e03",
            "valueKind": "最大召喚数",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "友達のミツバチ",
            "levels": {
              "1": 2,
              "2": 2,
              "3": 2,
              "4": 2,
              "5": 2,
              "6": 2,
              "7": 3,
              "8": 3,
              "9": 3,
              "10": 3,
              "11": 3,
              "12": 3
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
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身と召喚獣",
            "levels": {
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Jubee_high_e02",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身と召喚獣",
            "levels": {
              "1": 20,
              "2": 21,
              "3": 22,
              "4": 23,
              "5": 24,
              "6": 25,
              "7": 26,
              "8": 27,
              "9": 28,
              "10": 29,
              "11": 30,
              "12": 31
            }
          },
          {
            "effectId": "Jubee_high_e03",
            "valueKind": "バフ",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身と召喚獣",
            "fixedValue": 8
          }
        ],
        "skillId": "Jubee_high",
        "skillType": "高学年",
        "skillName": "ハッピーハッビー",
        "description": "自身と友達のミツバチの攻撃力と攻撃速度を増加させる。",
        "cooldownSeconds": 18
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
              "1": 16,
              "2": 18,
              "3": 20,
              "4": 22,
              "5": 24,
              "6": 26,
              "7": 28,
              "8": 30,
              "9": 32,
              "10": 34,
              "11": 36,
              "12": 38
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
            "fixedValue": 120
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
      "rarity": 3,
      "personality": "純粋",
      "race": "竜族",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 200,
      "spRecoveryPerSecond": 50,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 140,
              "2": 154,
              "3": 168,
              "4": 182,
              "5": 196,
              "6": 210,
              "7": 224,
              "8": 238,
              "9": 252,
              "10": 266,
              "11": 280,
              "12": 294
            }
          },
          {
            "effectId": "Silphir_low_e02",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 15,
              "2": 16.5,
              "3": 18,
              "4": 19.5,
              "5": 21,
              "6": 22.5,
              "7": 24,
              "8": 25.5,
              "9": 27,
              "10": 28.5,
              "11": 30,
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
              "1": 350,
              "2": 385,
              "3": 420,
              "4": 455,
              "5": 490,
              "6": 525,
              "7": 560,
              "8": 595,
              "9": 630,
              "10": 665,
              "11": 700,
              "12": 735
            }
          },
          {
            "effectId": "Silphir_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 8
          }
        ],
        "skillId": "Silphir_high",
        "skillType": "高学年",
        "skillName": "シルフィールZアタック",
        "description": "敵に短剣を8本投げつける。",
        "cooldownSeconds": 14
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
              "1": 30,
              "2": 32,
              "3": 34,
              "4": 36,
              "5": 38,
              "6": 40,
              "7": 42,
              "8": 44,
              "9": 46,
              "10": 48,
              "11": 50,
              "12": 52
            }
          },
          {
            "effectId": "Silphir_passive_e02",
            "valueKind": "強化攻撃確率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
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
            "fixedValue": 100
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
            "fixedValue": 96
          },
          {
            "effectId": "Silphir_enhanced_e02",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 64
          },
          {
            "effectId": "Silphir_enhanced_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
          },
          {
            "effectId": "Silphir_enhanced_e04",
            "valueKind": "SP減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 10
          }
        ],
        "skillId": "Silphir_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で短剣を3回投げ、敵に物理ダメージを与える。 最後の一撃はより大きなダメージを与え、SPを減少させる。",
        "triggerType": "一定確率",
        "triggerValue": 25
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "魔女",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.34
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 4,
      "defM": 4,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46,
              "13": 48,
              "14": 50,
              "15": 52
            }
          },
          {
            "effectId": "Snorky_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "味方/前列",
            "fixedValue": 6
          },
          {
            "effectId": "Snorky_low_e03",
            "valueKind": "物理防御力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "condition": "豆乳シールド破壊時",
            "effectTarget": "敵/周囲",
            "fixedValue": 50
          },
          {
            "effectId": "Snorky_low_e04",
            "valueKind": "物理防御力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "豆乳シールド破壊時",
            "effectTarget": "敵/周囲",
            "fixedValue": 5
          },
          {
            "effectId": "Snorky_low_e05",
            "valueKind": "持続HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "攻撃力",
            "levels": {
              "1": 180,
              "2": 200,
              "3": 220,
              "4": 240,
              "5": 260,
              "6": 280,
              "7": 300,
              "8": 320,
              "9": 340,
              "10": 360,
              "11": 380,
              "12": 400,
              "13": 420,
              "14": 440,
              "15": 460
            }
          },
          {
            "effectId": "Snorky_low_e06",
            "valueKind": "持続HP回復",
            "valueClass": "周期",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 1
          },
          {
            "effectId": "Snorky_low_e07",
            "valueKind": "持続HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 6
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
              "1": 450,
              "2": 495,
              "3": 540,
              "4": 585,
              "5": 630,
              "6": 675,
              "7": 720,
              "8": 765,
              "9": 810,
              "10": 855,
              "11": 900,
              "12": 945,
              "13": 990,
              "14": 1035,
              "15": 1080
            }
          },
          {
            "effectId": "Snorky_high_e02",
            "valueKind": "強化物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/周囲",
            "levels": {
              "1": 900,
              "2": 990,
              "3": 1080,
              "4": 1170,
              "5": 1260,
              "6": 1350,
              "7": 1440,
              "8": 1530,
              "9": 1620,
              "10": 1710,
              "11": 1800,
              "12": 1890,
              "13": 1980,
              "14": 2070,
              "15": 2160
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
        "cooldownSeconds": 28
      },
      {
        "effects": [
          {
            "effectId": "Snorky_passive_e01",
            "valueKind": "ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 24,
              "2": 28,
              "3": 32,
              "4": 36,
              "5": 40,
              "6": 44,
              "7": 48,
              "8": 52,
              "9": 56,
              "10": 60,
              "11": 64,
              "12": 68,
              "13": 72,
              "14": 76,
              "15": 80
            }
          },
          {
            "effectId": "Snorky_passive_e02",
            "valueKind": "ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 3
          },
          {
            "effectId": "Snorky_passive_e03",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
            }
          },
          {
            "effectId": "Snorky_passive_e04",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 3
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
            "fixedValue": 225
          },
          {
            "effectId": "Snorky_basic_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
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
            "fixedValue": 350
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
        "triggerValue": 3
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
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "敵/範囲",
                "fixedValue": 700
              },
              {
                "valueKind": "気絶",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "敵/範囲"
              },
              {
                "valueKind": "気絶確率",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "敵/範囲",
                "fixedValue": 50
              },
              {
                "valueKind": "気絶",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "敵/範囲",
                "fixedValue": 2
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "普通攻撃を3回行うごとに、味方陣営から最も近い敵に向かって前方へ飛び蹴りを放ち、範囲物理ダメージを与え、一定確率で気絶を付与する。強化攻撃は一定確率でもう一度発動し、連続で発動するたびに発動確率が減少する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "物理防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "魔法防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "義理の代名詞",
          "stats": [],
          "effects": [
            {
              "valueKind": "シールド",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "reference": "最大HP",
              "fixedValue": 24
            },
            {
              "valueKind": "シールド",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "fixedValue": 12
            },
            {
              "valueKind": "ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "fixedValue": 32
            },
            {
              "valueKind": "ダメージ量増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "ウェーブ開始時",
              "effectTarget": "味方/前列",
              "fixedValue": 12
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "強化攻撃時",
              "effectTarget": "味方/周囲",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 24
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "強化攻撃時",
              "effectTarget": "味方/周囲",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 3
            }
          ],
          "description": "ウェーブ開始時に前列の味方にシールドを付与し、与えるダメージ量を増加させる。強化攻撃時、周囲の味方の被ダメージ量を減少させる。"
        },
        "3": {
          "name": "拳の味を見せてやる",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 3,
      "personality": "純粋",
      "race": "幽霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.3
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 5,
      "critDmg": 5,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 297,
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
            "fixedValue": 3
          },
          {
            "effectId": "Speaki_low_e03",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内の敵",
            "fixedValue": 3
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
            "valueKind": "会心ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年時",
            "effectTarget": "自身",
            "levels": {
              "1": 18,
              "2": 19,
              "3": 20,
              "4": 21,
              "5": 22,
              "6": 23,
              "7": 24,
              "8": 25,
              "9": 26,
              "10": 27,
              "11": 28,
              "12": 29
            }
          },
          {
            "effectId": "Speaki_high_e02",
            "valueKind": "会心ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年時",
            "effectTarget": "自身",
            "fixedValue": 12
          },
          {
            "effectId": "Speaki_high_e03",
            "valueKind": "会心ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年時に攻撃力が最も高い味方",
            "effectTarget": "攻撃力が最も高い味方",
            "levels": {
              "1": 18,
              "2": 19,
              "3": 20,
              "4": 21,
              "5": 22,
              "6": 23,
              "7": 24,
              "8": 25,
              "9": 26,
              "10": 27,
              "11": 28,
              "12": 29
            }
          },
          {
            "effectId": "Speaki_high_e04",
            "valueKind": "会心ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年時に攻撃力が最も高い味方",
            "effectTarget": "攻撃力が最も高い味方",
            "fixedValue": 12
          }
        ],
        "skillId": "Speaki_high",
        "skillType": "高学年",
        "skillName": "お菓子くれなきゃいたずらしちゃうぞ～☆",
        "description": "自身と攻撃力が最も高い味方の会心ダメージ量を増加させる。",
        "cooldownSeconds": 24
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
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63
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
            "fixedValue": 75
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
      "rarity": 3,
      "personality": "活発",
      "race": "幽霊",
      "role": "守備",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 150,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 5,
      "atkP": 0,
      "atkM": 2,
      "defP": 5,
      "defM": 5,
      "crit": 2,
      "critDmg": 2,
      "critRes": 4,
      "critDmgRes": 4
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
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63,
              "13": 66,
              "14": 69,
              "15": 72
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
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260,
              "13": 1320,
              "14": 1380,
              "15": 1440
            }
          },
          {
            "effectId": "Selene_high_e02",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "敵撃破時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 36,
              "2": 38,
              "3": 40,
              "4": 42,
              "5": 44,
              "6": 46,
              "7": 48,
              "8": 50,
              "9": 52,
              "10": 54,
              "11": 56,
              "12": 58,
              "13": 60,
              "14": 62,
              "15": 64
            }
          },
          {
            "effectId": "Selene_high_e03",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "敵撃破時",
            "effectTarget": "自身",
            "fixedValue": 8
          }
        ],
        "skillId": "Selene_high",
        "skillType": "高学年",
        "skillName": "ピンクダスト",
        "description": "残りHP割合が最も低い敵に魔法ダメージを与え、撃破時に自身へシールドを生成する。",
        "cooldownSeconds": 28
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42,
              "13": 44,
              "14": 46,
              "15": 48
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
            "fixedValue": 75
          },
          {
            "effectId": "Selene_basic_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
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
            "fixedValue": 10
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
            "fixedValue": 3
          }
        ],
        "skillId": "Selene_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃の代わりに自身を回復し、敵を挑発する。",
        "triggerType": "n回ごと",
        "triggerValue": 3
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
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "effectTarget": "敵/範囲/残りHP割合最低",
                "levels": {
                  "1": 900,
                  "3": 1080,
                  "4": 1170,
                  "5": 1260,
                  "6": 1350,
                  "7": 1440,
                  "8": 1530,
                  "9": 1620,
                  "10": 1710,
                  "11": 1800,
                  "12": 1890,
                  "13": 1980,
                  "14": 2070,
                  "15": 2160
                }
              },
              {
                "valueKind": "シールド",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "reference": "最大HP",
                "levels": {
                  "1": 30,
                  "3": 36,
                  "4": 39,
                  "5": 42,
                  "6": 45,
                  "7": 48,
                  "8": 51,
                  "9": 54,
                  "10": 57,
                  "11": 60,
                  "12": 63,
                  "13": 66,
                  "14": 69,
                  "15": 72
                }
              },
              {
                "valueKind": "シールド",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "fixedValue": 8
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "fixedValue": 30
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "ポーズ後",
                "effectTarget": "自身",
                "fixedValue": 8
              }
            ],
            "targetSkill": "高学年",
            "skillName": "チャンネルNo.5",
            "description": "ポーズ後、HP割合が低い敵に範囲魔法ダメージを与え、自身にシールドと被ダメージ量減少を付与する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "クールタイム減少",
                "valueClass": "固定値",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 10
              }
            ],
            "targetSkill": "高学年",
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 22.5
            }
          ],
          "effects": []
        },
        "2": {
          "name": "煽り専門ElTuber",
          "stats": [],
          "effects": [
            {
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "effectTarget": "自身",
              "fixedValue": 6
            },
            {
              "valueKind": "攻撃速度減少",
              "valueClass": "倍率",
              "effectType": "デバフ",
              "effectTarget": "敵/挑発対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 33
            },
            {
              "valueKind": "攻撃速度減少",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectTarget": "敵/挑発対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 4
            },
            {
              "valueKind": "強化攻撃HP回復倍率",
              "valueClass": "倍率",
              "effectType": "回復",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 2
            }
          ],
          "description": "直接ダメージを受けるとSPを回復する。強化攻撃で挑発した敵の攻撃速度を減少させ、強化攻撃のHP回復割合が2倍になる。"
        },
        "3": {
          "name": "寄付チャレンジ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 3,
      "personality": "純粋",
      "race": "竜族",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 4,
      "atkP": 0,
      "atkM": 4,
      "defP": 4,
      "defM": 4,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 200,
              "2": 225,
              "3": 250,
              "4": 275,
              "5": 300,
              "6": 325,
              "7": 350,
              "8": 375,
              "9": 400,
              "10": 425,
              "11": 450,
              "12": 475,
              "13": 500,
              "14": 525,
              "15": 550
            }
          },
          {
            "effectId": "Daya_low_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵3名"
          },
          {
            "effectId": "Daya_low_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵3名",
            "fixedValue": 8
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
              "1": 500,
              "2": 550,
              "3": 600,
              "4": 650,
              "5": 700,
              "6": 750,
              "7": 800,
              "8": 850,
              "9": 900,
              "10": 950,
              "11": 1000,
              "12": 1050,
              "13": 1100,
              "14": 1150,
              "15": 1200
            }
          }
        ],
        "skillId": "Daya_high",
        "skillType": "高学年",
        "skillName": "ダイヤブレ…へくちゅ！",
        "description": "くしゃみで敵に範囲魔法ダメージを与える。",
        "cooldownSeconds": 40
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
              "1": 12,
              "2": 14,
              "3": 16,
              "4": 18,
              "5": 20,
              "6": 22,
              "7": 24,
              "8": 26,
              "9": 28,
              "10": 30,
              "11": 32,
              "12": 34,
              "13": 36,
              "14": 38,
              "15": 40
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
            "fixedValue": 72
          },
          {
            "effectId": "Daya_basic_e02",
            "valueKind": "最後の一撃魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 48
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
            "fixedValue": 240
          },
          {
            "effectId": "Daya_enhanced_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Daya_enhanced_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 4
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "ダイヤ……へくちゅ！",
          "stats": [],
          "effects": [
            {
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "condition": "低学年スキル命中時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 100
            },
            {
              "valueKind": "最大連続使用回数",
              "valueClass": "回数",
              "effectType": "使用制限",
              "condition": "低学年スキル命中時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 2
            },
            {
              "valueKind": "クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル"
            },
            {
              "valueKind": "気絶",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "condition": "高学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "高学年スキル"
            },
            {
              "valueKind": "気絶",
              "valueClass": "持続時間",
              "effectType": "デバフ",
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
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 15
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
      "rarity": 2,
      "personality": "活発",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 270,
              "2": 297,
              "3": 324,
              "4": 351,
              "5": 378,
              "6": 405,
              "7": 432,
              "8": 459,
              "9": 486,
              "10": 513,
              "11": 540,
              "12": 567
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
              "1": 297,
              "2": 326.7,
              "3": 356.4,
              "4": 386.1,
              "5": 415.8,
              "6": 445.5,
              "7": 475.2,
              "8": 504.9,
              "9": 534.6,
              "10": 564.3,
              "11": 594,
              "12": 623.7
            }
          },
          {
            "effectId": "Taida_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3
          }
        ],
        "skillId": "Taida_high",
        "skillType": "高学年",
        "skillName": "タンタン……パン！？",
        "description": "強力な弾丸を敵に3回発射し、範囲物理ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 25,
              "2": 30,
              "3": 35,
              "4": 40,
              "5": 45,
              "6": 50,
              "7": 55,
              "8": 60,
              "9": 65,
              "10": 70,
              "11": 75,
              "12": 80
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
            "fixedValue": 100
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
      "rarity": 2,
      "personality": "憂鬱",
      "race": "獣人",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 198,
              "2": 217.8,
              "3": 237.6,
              "4": 257.4,
              "5": 277.2,
              "6": 297,
              "7": 316.8,
              "8": 336.6,
              "9": 356.4,
              "10": 376.2,
              "11": 396,
              "12": 415.8
            }
          },
          {
            "effectId": "Chopi_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3
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
              "1": 620,
              "2": 682,
              "3": 744,
              "4": 806,
              "5": 868,
              "6": 930,
              "7": 992,
              "8": 1054,
              "9": 1116,
              "10": 1178,
              "11": 1240,
              "12": 1302
            }
          },
          {
            "effectId": "Chopi_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 10
          }
        ],
        "skillId": "Chopi_high",
        "skillType": "高学年",
        "skillName": "グルル～、ワン！",
        "description": "両腕を振り回して敵に物理ダメージを10回与える。",
        "cooldownSeconds": 28
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 100
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
      "rarity": 3,
      "personality": "狂気",
      "race": "獣人",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.45
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 2,
      "defP": 2,
      "defM": 2,
      "crit": 2,
      "critDmg": 2,
      "critRes": 5,
      "critDmgRes": 5
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
              "1": 22,
              "2": 24,
              "3": 26,
              "4": 28,
              "5": 30,
              "6": 32,
              "7": 34,
              "8": 36,
              "9": 38,
              "10": 40,
              "11": 42,
              "12": 44,
              "13": 46,
              "14": 48,
              "15": 50
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
              "1": 190,
              "2": 205,
              "3": 220,
              "4": 235,
              "5": 250,
              "6": 265,
              "7": 280,
              "8": 295,
              "9": 310,
              "10": 325,
              "11": 340,
              "12": 355,
              "13": 370,
              "14": 385,
              "15": 400
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
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630,
              "13": 660,
              "14": 690,
              "15": 720
            }
          },
          {
            "effectId": "Diana_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 11
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
        "cooldownSeconds": 18
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42,
              "13": 44,
              "14": 46,
              "15": 48
            }
          },
          {
            "effectId": "Diana_passive_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "狂気性格の味方",
            "effectTarget": "味方/狂気",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
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
            "fixedValue": 75
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
            "fixedValue": 150
          },
          {
            "effectId": "Diana_enhanced_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/残りHP割合最低",
            "reference": "与ダメージ量",
            "fixedValue": 275
          }
        ],
        "skillId": "Diana_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "強化呪文で敵に魔法ダメージを与え、HP割合が低い味方を回復する。",
        "triggerType": "一定確率",
        "triggerValue": 50
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "ちびディアナ",
      "levels": {
        "1": {
          "name": "子ジカの応援？",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "すごい治療法",
          "stats": [],
          "effects": [
            {
              "valueKind": "強化攻撃回復対象",
              "valueClass": "対象数",
              "effectType": "回復",
              "effectTarget": "味方",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 3
            },
            {
              "valueKind": "会心被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方（自身除く）/狂気",
              "fixedValue": 66
            }
          ],
          "description": "強化攻撃の回復対象が3体に増加する。戦闘開始時、自身を除く狂気の味方の会心被ダメージ量を減少させる。"
        },
        "3": {
          "name": "自然の力",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 13.6
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/中列",
              "fixedValue": 5.9
            }
          ],
          "description": "中列の味方の与ダメージ量を増加させ、被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "tig",
    "name": "ティグ",
    "basic": {
      "rarity": 3,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 100,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.29
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 320,
              "2": 352,
              "3": 384,
              "4": 416,
              "5": 448,
              "6": 480,
              "7": 512,
              "8": 544,
              "9": 576,
              "10": 608,
              "11": 640,
              "12": 672,
              "13": 704,
              "14": 736,
              "15": 768
            }
          },
          {
            "effectId": "Tig_low_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "対象が使徒",
            "effectTarget": "対象の敵",
            "reference": "敵の最大HP",
            "fixedValue": 20
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
            "effectId": "Tig_high_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260,
              "13": 1320,
              "14": 1380,
              "15": 1440
            }
          },
          {
            "effectId": "Tig_high_e02",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 150
          },
          {
            "effectId": "Tig_high_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 10
          },
          {
            "effectId": "Tig_high_e04",
            "valueKind": "普通攻撃ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 100
          }
        ],
        "skillId": "Tig_high",
        "skillType": "高学年",
        "skillName": "オーバードライブ",
        "description": "剣気を飛ばして敵に範囲物理ダメージを与える。一定時間、攻撃速度、普通攻撃のダメージ量がアップする。 この効果は解除できない。"
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42,
              "13": 44,
              "14": 46,
              "15": 48
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
            "fixedValue": 40
          },
          {
            "effectId": "Tig_basic_e02",
            "valueKind": "2回目物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 60
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
            "fixedValue": 60
          },
          {
            "effectId": "Tig_enhanced_e02",
            "valueKind": "2回目物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 90
          },
          {
            "effectId": "Tig_enhanced_e03",
            "valueKind": "SP回復",
            "valueClass": "固定値",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 120
          }
        ],
        "skillId": "Tig_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃ごとに、双剣を振り下ろした後、周囲に振り回して、敵に範囲物理ダメージを与え、SPを回復する。 最後の一撃はより大きなダメージを与える。",
        "triggerType": "n回ごと",
        "triggerValue": 3
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
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "levels": {
                  "1": 900,
                  "2": 990,
                  "3": 1080,
                  "4": 1170,
                  "5": 1260,
                  "6": 1350,
                  "7": 1440,
                  "8": 1530,
                  "9": 1620,
                  "10": 1710,
                  "11": 1800,
                  "12": 1890,
                  "13": 1980,
                  "14": 2070,
                  "15": 2160
                }
              },
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "fixedValue": 200
              },
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "fixedValue": 10
              },
              {
                "valueKind": "普通攻撃ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "fixedValue": 100
              }
            ],
            "targetSkill": "高学年",
            "skillName": "オーバードラ火ブ",
            "description": "燃え盛る剣の気を放って敵に範囲物理ダメージを与える。\n一定時間、攻撃速度と普通攻撃のダメージが増加する。\nこの効果は解除できない。\nオーバードラ火ブの持続時間中、強化攻撃が命中すると火傷を付与する。\n火傷状態の敵に与えるダメージ量が増加する。"
          },
          {
            "effects": [
              {
                "valueKind": "火傷",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "condition": "オーバードラ火ブ（高学年スキル）の持続時間中",
                "effectTarget": "敵"
              },
              {
                "valueKind": "火傷",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "condition": "オーバードラ火ブ（高学年スキル）の持続時間中",
                "effectTarget": "敵",
                "fixedValue": 4
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "燃え盛る剣の気を放って敵に範囲物理ダメージを与える。\n一定時間、攻撃速度と普通攻撃のダメージが増加する。\nこの効果は解除できない。\nオーバードラ火ブの持続時間中、強化攻撃が命中すると火傷を付与する。\n火傷状態の敵に与えるダメージ量が増加する。"
          },
          {
            "effects": [
              {
                "valueKind": "与ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "火傷状態の敵を攻撃時",
                "effectTarget": "自身",
                "fixedValue": 100
              }
            ],
            "description": "燃え盛る剣の気を放って敵に範囲物理ダメージを与える。\n一定時間、攻撃速度と普通攻撃のダメージが増加する。\nこの効果は解除できない。\nオーバードラ火ブの持続時間中、強化攻撃が命中すると火傷を付与する。\n火傷状態の敵に与えるダメージ量が増加する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "真の師匠ディアナ",
          "stats": [],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "対象使徒（ティグ、ルポ、ベニー）",
              "effectTarget": "対象の味方",
              "fixedValue": 30
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "対象使徒（ティグ、ルポ、ベニー）",
              "effectTarget": "対象の味方",
              "fixedValue": 25
            },
            {
              "valueKind": "無敵",
              "valueClass": "状態付与",
              "effectType": "バフ",
              "condition": "オーバードライブ（高学年スキル）発動時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3
            },
            {
              "valueKind": "無敵",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "オーバードライブ（高学年スキル）発動時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3
            }
          ],
          "description": "ティグ、ルポ、ベニーの敵への与ダメージと攻撃速度が増加する。オーバードライブ発動時、一定時間無敵になる。"
        },
        "3": {
          "name": "次期村長ティグ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "前方の敵",
              "fixedValue": 14
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "前方の敵",
              "fixedValue": 5
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
      "rarity": 3,
      "personality": "純粋",
      "race": "精霊",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 44,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.525
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 3,
      "defP": 2,
      "defM": 2,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
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
            "fixedValue": 15
          },
          {
            "effectId": "Naia_low_e02",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "自分の攻撃力",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
            }
          },
          {
            "effectId": "Naia_low_e03",
            "valueKind": "回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "fixedValue": 20
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
              "1": 10,
              "2": 12,
              "3": 14,
              "4": 16,
              "5": 18,
              "6": 20,
              "7": 22,
              "8": 24,
              "9": 26,
              "10": 28,
              "11": 30,
              "12": 32
            }
          },
          {
            "effectId": "Naia_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 360,
              "2": 396,
              "3": 432,
              "4": 468,
              "5": 504,
              "6": 540,
              "7": 576,
              "8": 612,
              "9": 648,
              "10": 684,
              "11": 720,
              "12": 756
            }
          }
        ],
        "skillId": "Naia_high",
        "skillType": "高学年",
        "skillName": "水の洗礼を受けなさい！",
        "description": "波を召喚して味方を回復し敵に魔法ダメージ。",
        "cooldownSeconds": 26
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
              "1": 1,
              "2": 1.5,
              "3": 2,
              "4": 2.5,
              "5": 3,
              "6": 3.5,
              "7": 4,
              "8": 4.5,
              "9": 5,
              "10": 5.5,
              "11": 6,
              "12": 6.5
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
            "fixedValue": 45
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
            "fixedValue": 48
          },
          {
            "effectId": "Naia_enhanced_e02",
            "valueKind": "最後の一撃の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 72
          }
        ],
        "skillId": "Naia_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で水鉄砲を素早く3回発射して敵にダメージを与える。 最後の一撃ではより大きなダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 40
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
                "valueKind": "戦闘開始時SP回復",
                "valueClass": "固定値",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 150
              }
            ],
            "targetSkill": "低学年",
            "skillName": "キレイにしてあげる！",
            "description": "戦闘開始時にSPが回復"
          },
          {
            "effects": [
              {
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "残りHP割合が最も低い味方",
                "reference": "対象の最大HP",
                "fixedValue": 20
              },
              {
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "残りHP割合が最も低い味方",
                "reference": "自分の攻撃力",
                "levels": {
                  "1": 20,
                  "3": 24,
                  "4": 26,
                  "5": 28,
                  "6": 30,
                  "7": 32,
                  "8": 34,
                  "9": 36,
                  "10": 38,
                  "11": 40,
                  "12": 42
                }
              }
            ],
            "targetSkill": "低学年",
            "skillName": "キレイにしてあげる！",
            "description": "味方を20回回復し最大HP超過分をシールドに転換"
          },
          {
            "effects": [
              {
                "valueKind": "回数",
                "valueClass": "回数",
                "effectType": "回復",
                "effectTarget": "残りHP割合が最も低い味方",
                "fixedValue": 20
              }
            ],
            "targetSkill": "低学年",
            "skillName": "キレイにしてあげる！",
            "description": "回復回数"
          },
          {
            "effects": [
              {
                "valueKind": "シールド転換割合",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "回復対象",
                "fixedValue": 20
              }
            ],
            "targetSkill": "低学年",
            "skillName": "キレイにしてあげる！",
            "description": "シールド転換割合"
          },
          {
            "effects": [
              {
                "valueKind": "シールド",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "effectTarget": "回復対象",
                "fixedValue": 8
              }
            ],
            "targetSkill": "低学年",
            "skillName": "キレイにしてあげる！",
            "description": "シールド持続時間"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
            "skillName": "愛用Lv3",
            "description": "ナイアの魔法攻撃力、会心抵抗、会心ダメージ抵抗が増加"
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
    "id": "ner",
    "name": "ネル",
    "basic": {
      "rarity": 3,
      "personality": "狂気",
      "race": "妖精",
      "role": "支援",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 200,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 95,
      "combatPowerCorrectionB": 0.45
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 1,
      "defP": 4,
      "defM": 4,
      "crit": 1,
      "critDmg": 1,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Ner_low_e01",
            "valueKind": "無敵",
            "valueClass": "状態免疫",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Ner_low_e02",
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3
          },
          {
            "effectId": "Ner_low_e03",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "味方全体",
            "levels": {
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42,
              "13": 44,
              "14": 46,
              "15": 48
            }
          },
          {
            "effectId": "Ner_low_e04",
            "valueKind": "与ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "味方全体",
            "fixedValue": 8
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
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260,
              "13": 1320,
              "14": 1380,
              "15": 1440
            }
          },
          {
            "effectId": "Ner_high_e02",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方/周囲",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
            }
          },
          {
            "effectId": "Ner_high_e03",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方/周囲",
            "fixedValue": 6
          }
        ],
        "skillId": "Ner_high",
        "skillType": "高学年",
        "skillName": "エーダルの祝福",
        "description": "周囲の味方の被ダメージ量を減少し、周囲の敵に範囲魔法ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 1,
              "2": 2,
              "3": 3,
              "4": 4,
              "5": 5,
              "6": 6,
              "7": 7,
              "8": 8,
              "9": 9,
              "10": 10,
              "11": 11,
              "12": 12,
              "13": 13,
              "14": 14,
              "15": 15
            }
          },
          {
            "effectId": "Ner_passive_e02",
            "valueKind": "SP回復",
            "valueClass": "周期",
            "effectType": "回復",
            "effectTarget": "自身/味方周囲",
            "fixedValue": 2
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
            "fixedValue": 80
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "司祭長の無敵権",
          "stats": [],
          "effects": [
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "targetSkill": "基本攻撃",
              "fixedValue": 15
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "targetSkill": "基本攻撃",
              "fixedValue": 3
            },
            {
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "targetSkill": "最大HP",
              "fixedValue": 3
            },
            {
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "condition": "基本攻撃命中時",
              "effectTarget": "自身",
              "fixedValue": 30
            },
            {
              "valueKind": "無敵",
              "valueClass": "状態付与",
              "effectType": "バフ",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身/前衛使徒",
              "targetSkill": "高学年スキル"
            },
            {
              "valueKind": "無敵",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身/前衛使徒",
              "targetSkill": "高学年スキル",
              "fixedValue": 5
            }
          ],
          "description": "基本攻撃命中時、自身の被ダメージ量を減少し、HPとSPを回復する。高学年スキル使用時、自身と前衛使徒に無敵を付与する。"
        },
        "3": {
          "name": "世界樹の名前で！",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 10.5
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 4.5
            }
          ],
          "description": "味方全員の与ダメージ量を増加させ、被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "butter",
    "name": "バター",
    "basic": {
      "rarity": 3,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 5,
      "critDmg": 5,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 160,
              "2": 176,
              "3": 192,
              "4": 208,
              "5": 224,
              "6": 240,
              "7": 256,
              "8": 272,
              "9": 288,
              "10": 304,
              "11": 320,
              "12": 336
            }
          },
          {
            "effectId": "Butter_low_e02",
            "valueKind": "攻撃の最大回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 4
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
              "1": 400,
              "2": 440,
              "3": 480,
              "4": 520,
              "5": 560,
              "6": 600,
              "7": 640,
              "8": 680,
              "9": 720,
              "10": 760,
              "11": 800,
              "12": 840
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
            "fixedValue": 2
          }
        ],
        "skillId": "Butter_high",
        "skillType": "高学年",
        "skillName": "ストラ～イク！",
        "description": "巨大な石を発射し、敵に範囲物理ダメージを与え、気絶を付与する。",
        "cooldownSeconds": 18
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
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63
            }
          },
          {
            "effectId": "Butter_passive_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "活発性格の味方",
            "effectTarget": "味方/活発",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23
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
            "fixedValue": 100
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
            "fixedValue": 150
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
        "triggerValue": 30
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
                "valueKind": "物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 30,
                "effectTarget": "敵",
                "fixedValue": 150
              },
              {
                "valueKind": "強化物理ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率(怒り100中)",
                "triggerValue": 100,
                "effectTarget": "敵/範囲",
                "fixedValue": 250
              },
              {
                "valueKind": "確定会心",
                "valueClass": "条件",
                "effectType": "攻撃",
                "triggerType": "一定確率(怒り100中)",
                "triggerValue": 100,
                "effectTarget": "敵/範囲"
              },
              {
                "valueKind": "怒り獲得",
                "valueClass": "固定値",
                "effectType": "条件",
                "effectTarget": "自身",
                "fixedValue": 4
              },
              {
                "valueKind": "怒り必要回数",
                "valueClass": "固定値",
                "effectType": "条件",
                "effectTarget": "自身",
                "fixedValue": 100
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "味方が直接ダメージを受けると怒りを4回獲得し、100回になると強化攻撃が変更される。強化攻撃では銃を取り出し、範囲内の敵に確定会心物理ダメージを与える。怒りはバターが倒された状態でも獲得でき、獲得した怒りは消えない。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "クールタイム減少",
                "valueClass": "固定値",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 5
              }
            ],
            "targetSkill": "高学年",
            "skillName": "愛用Lv3",
            "description": "バターの高学年スキルのクールタイムが減少する。バターの強化攻撃確率が増加する。"
          },
          {
            "effects": [
              {
                "valueKind": "強化攻撃確率増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 20
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "愛用Lv3",
            "description": "バターの高学年スキルのクールタイムが減少する。バターの強化攻撃確率が増加する。"
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
      "rarity": 1,
      "personality": "冷静",
      "race": "妖精",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.195
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 150,
              "2": 165,
              "3": 180,
              "4": 195,
              "5": 210,
              "6": 225,
              "7": 240,
              "8": 255,
              "9": 270,
              "10": 285,
              "11": 300,
              "12": 315
            }
          },
          {
            "effectId": "Patula_low_e02",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Patula_low_e03",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 4
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
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
            }
          }
        ],
        "skillId": "Patula_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - パトラ",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 30
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 50
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
      "rarity": 3,
      "personality": "冷静",
      "race": "幽霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "魔法",
      "initialSp": 180,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.235
    },
    "statTypes": {
      "hp": 4,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630,
              "13": 660,
              "14": 690,
              "15": 720
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
            "fixedValue": 15
          },
          {
            "effectId": "Barong_low_e04",
            "valueKind": "沈黙",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "スキル発動後",
            "effectTarget": "敵"
          },
          {
            "effectId": "Barong_low_e05",
            "valueKind": "沈黙",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "スキル発動後",
            "effectTarget": "敵",
            "fixedValue": 10
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
              "1": 600,
              "2": 630,
              "3": 660,
              "4": 690,
              "5": 720,
              "6": 750,
              "7": 780,
              "8": 810,
              "9": 840,
              "10": 870,
              "11": 900,
              "12": 930,
              "13": 960,
              "14": 990,
              "15": 1020
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
            "fixedValue": 15
          },
          {
            "effectId": "Barong_high_e04",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 25
          },
          {
            "effectId": "Barong_high_e05",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 8
          }
        ],
        "skillId": "Barong_high",
        "skillType": "高学年",
        "skillName": "鬼火呼び",
        "description": "自身を中心に周囲の敵へ範囲魔法ダメージを与え、呪いを付与する。 一定時間、自身の被ダメージが減少する。",
        "cooldownSeconds": 40
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
              "1": 35,
              "2": 38,
              "3": 41,
              "4": 44,
              "5": 47,
              "6": 50,
              "7": 53,
              "8": 56,
              "9": 59,
              "10": 62,
              "11": 65,
              "12": 68,
              "13": 71,
              "14": 74,
              "15": 77
            }
          },
          {
            "effectId": "Barong_passive_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 10
          },
          {
            "effectId": "Barong_passive_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63,
              "13": 66,
              "14": 69,
              "15": 72
            }
          },
          {
            "effectId": "Barong_passive_e04",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "自身",
            "fixedValue": 10
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
            "fixedValue": 120
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
            "fixedValue": 360
          },
          {
            "effectId": "Barong_enhanced_e02",
            "valueKind": "目くらまし",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Barong_enhanced_e03",
            "valueKind": "目くらまし",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 8
          }
        ],
        "skillId": "Barong_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "釘を飛ばして敵に魔法ダメージを2回与え、自身に目くらましを付与する。 呪い状態の敵が存在する間、バロンの基本攻撃が強化攻撃に変わる。",
        "triggerType": "呪い状態の敵が存在",
        "triggerValue": 1
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
                "valueKind": "総魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1,
                "effectTarget": "敵",
                "fixedValue": 660
              },
              {
                "valueKind": "攻撃速度減少",
                "valueClass": "状態付与",
                "effectType": "デバフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1,
                "effectTarget": "敵",
                "fixedValue": 30
              },
              {
                "valueKind": "攻撃速度減少",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1,
                "effectTarget": "敵",
                "fixedValue": 5
              },
              {
                "valueKind": "目くらまし",
                "valueClass": "状態付与",
                "effectType": "バフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1,
                "condition": "強化攻撃時",
                "effectTarget": "自身"
              },
              {
                "valueKind": "目くらまし",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "呪い状態の敵が存在",
                "triggerValue": 1,
                "condition": "強化攻撃時",
                "effectTarget": "自身",
                "fixedValue": 8
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "description": "釘を飛ばして敵に3回魔法ダメージを与え、攻撃速度を減少させる。自身には目くらましを付与する。\n呪い状態の敵が存在する場合、基本攻撃の代わりに強化攻撃を発動する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "ご主人様の時間だ",
          "stats": [],
          "effects": [
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "低学年スキルで突進中",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 40
            },
            {
              "valueKind": "不吉な霧生成",
              "valueClass": "持続時間",
              "effectType": "召喚",
              "effectTarget": "不吉な霧",
              "targetSkill": "低学年スキル",
              "fixedValue": 10
            },
            {
              "valueKind": "呪い",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "condition": "不吉な霧の中にいる時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "valueKind": "呪い",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "condition": "不吉な霧の中にいる時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 6
            },
            {
              "valueKind": "毒",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "condition": "低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "valueKind": "毒",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "condition": "低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 3
            },
            {
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "低学年スキル命中時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "fixedValue": 15
            },
            {
              "valueKind": "気絶",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "condition": "ウェーブの初回低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル"
            },
            {
              "valueKind": "気絶",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "condition": "ウェーブの初回低学年スキル命中時",
              "effectTarget": "敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 3
            }
          ],
          "description": "低学年スキルの目標対象に向かって突進する際、被ダメージ量が減少し、足跡に沿って不吉な霧を生成する。\n不吉な霧の中にいる敵に一定時間ごとに呪いを付与する。\n低学年スキル命中時、敵に毒を付与し、自身のHPを回復させる。\nウェーブごとに最初の低学年スキル命中時、敵に気絶を付与する。"
        },
        "3": {
          "name": "新たなクジラ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 13.6
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 5.9
            }
          ],
          "description": "前列の味方の与ダメージ量を増加させ、被ダメージ量を減少させる。"
        }
      }
    },
    "board": null
  },
  {
    "id": "picora",
    "name": "ピコラ",
    "basic": {
      "rarity": 3,
      "personality": "冷静",
      "race": "魔女",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.525
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 2,
      "defP": 2,
      "defM": 2,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Picora_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/残りHP割合低い3名",
            "reference": "攻撃力",
            "levels": {
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260,
              "13": 1320,
              "14": 1380,
              "15": 1440
            }
          },
          {
            "effectId": "Picora_low_e02",
            "valueKind": "ステッカーHP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/ステッカー対象",
            "reference": "対象最大HP",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
            }
          },
          {
            "effectId": "Picora_low_e03",
            "valueKind": "会心抵抗増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "ステッカー付与時",
            "effectTarget": "味方/ステッカー対象",
            "levels": {
              "1": 11,
              "2": 12,
              "3": 13,
              "4": 14,
              "5": 15,
              "6": 16,
              "7": 17,
              "8": 18,
              "9": 19,
              "10": 20,
              "11": 21,
              "12": 22,
              "13": 23,
              "14": 24,
              "15": 25
            }
          },
          {
            "effectId": "Picora_low_e04",
            "valueKind": "物理防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "ステッカー付与時",
            "effectTarget": "味方/ステッカー対象",
            "levels": {
              "1": 11,
              "2": 12,
              "3": 13,
              "4": 14,
              "5": 15,
              "6": 16,
              "7": 17,
              "8": 18,
              "9": 19,
              "10": 20,
              "11": 21,
              "12": 22,
              "13": 23,
              "14": 24,
              "15": 25
            }
          },
          {
            "effectId": "Picora_low_e05",
            "valueKind": "ステッカー",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "effectTarget": "味方/ステッカー対象",
            "fixedValue": 8
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
            "fixedValue": 3
          },
          {
            "effectId": "Picora_high_e03",
            "valueKind": "挑発",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "敵",
            "fixedValue": 2
          },
          {
            "effectId": "Picora_high_e04",
            "valueKind": "最大HP増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方/最大HP最高",
            "levels": {
              "1": 25,
              "2": 27,
              "3": 29,
              "4": 31,
              "5": 33,
              "6": 35,
              "7": 37,
              "8": 39,
              "9": 41,
              "10": 43,
              "11": 45,
              "12": 47,
              "13": 49,
              "14": 51,
              "15": 53
            }
          },
          {
            "effectId": "Picora_high_e05",
            "valueKind": "最大HP増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方/最大HP最高",
            "fixedValue": 8
          }
        ],
        "skillId": "Picora_high",
        "skillType": "高学年",
        "skillName": "これであなたもファッショニスタ",
        "description": "最大HPが最も高い味方の状態異常を解除してスタイリングする。最大HPを増加させ、一定時間敵を挑発する。",
        "cooldownSeconds": 32
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
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21,
              "13": 22,
              "14": 23,
              "15": 24
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
            "fixedValue": 60
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
            "fixedValue": 120
          },
          {
            "effectId": "Picora_enhanced_e02",
            "valueKind": "呪文",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵/ランダム",
            "fixedValue": 2
          }
        ],
        "skillId": "Picora_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でランダムな対象に呪文を2つ唱え、魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 40
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
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "味方/残りHP割合低い3名",
                "reference": "攻撃力",
                "levels": {
                  "1": 600,
                  "3": 720,
                  "4": 780,
                  "5": 840,
                  "6": 900,
                  "7": 960,
                  "8": 1020,
                  "9": 1080,
                  "10": 1140,
                  "11": 1200,
                  "12": 1260
                }
              },
              {
                "valueKind": "ステッカーHP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "味方/ステッカー対象",
                "reference": "対象最大HP",
                "levels": {
                  "1": 12,
                  "3": 14,
                  "4": 15,
                  "5": 16,
                  "6": 17,
                  "7": 18,
                  "8": 19,
                  "9": 20,
                  "10": 21,
                  "11": 22,
                  "12": 23
                }
              },
              {
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "ステッカー時",
                "effectTarget": "味方/ステッカー対象",
                "levels": {
                  "1": 11,
                  "3": 13,
                  "4": 14,
                  "5": 15,
                  "6": 16,
                  "7": 17,
                  "8": 18,
                  "9": 19,
                  "10": 20,
                  "11": 21,
                  "12": 22
                }
              },
              {
                "valueKind": "物理防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "ステッカー時",
                "effectTarget": "味方/ステッカー対象",
                "levels": {
                  "1": 11,
                  "3": 13,
                  "4": 14,
                  "5": 15,
                  "6": 16,
                  "7": 17,
                  "8": 18,
                  "9": 19,
                  "10": 20,
                  "11": 21,
                  "12": 22
                }
              },
              {
                "valueKind": "1秒ごとのHP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "effectTarget": "味方/ステッカー対象",
                "reference": "対象最大HP",
                "levels": {
                  "1": 1,
                  "3": 3,
                  "4": 4,
                  "5": 5,
                  "6": 6,
                  "7": 7,
                  "8": 8,
                  "9": 9,
                  "10": 10,
                  "11": 11,
                  "12": 12
                }
              },
              {
                "valueKind": "1秒ごとのHP回復",
                "valueClass": "周期",
                "effectType": "回復",
                "effectTarget": "味方/ステッカー対象",
                "fixedValue": 1
              },
              {
                "valueKind": "ステッカー",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "effectTarget": "味方/ステッカー対象",
                "fixedValue": 8
              }
            ],
            "targetSkill": "低学年",
            "skillName": "初回限定ステッカー",
            "description": "味方3名にステッカーを貼り、HPを回復させる。ステッカー中は追加回復、会心抵抗、物理防御力増加、継続HP回復を付与する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "ピコラのステッカーはオマケ！",
          "stats": [],
          "effects": [
            {
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 20
            },
            {
              "valueKind": "ステッカー対象数",
              "valueClass": "対象数",
              "effectType": "バフ",
              "effectTarget": "残りHP割合が最も低い味方",
              "targetSkill": "強化攻撃",
              "fixedValue": 2
            },
            {
              "valueKind": "ピコラのステッカー",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "effectTarget": "残りHP割合が最も低い味方2名",
              "targetSkill": "強化攻撃",
              "fixedValue": 7
            },
            {
              "valueKind": "HP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "effectTarget": "ステッカー対象",
              "targetSkill": "対象の最大HP",
              "fixedValue": 22
            },
            {
              "valueKind": "HP回復回数",
              "valueClass": "回数",
              "effectType": "回復",
              "effectTarget": "ステッカー対象",
              "fixedValue": 2
            },
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "ステッカー時",
              "effectTarget": "ステッカー対象",
              "fixedValue": 30
            },
            {
              "valueKind": "クールタイム減少",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 12
            }
          ],
          "description": "最大HPが増加する。強化攻撃後、一定時間、残りHP割合が最も低い味方2名にピコラのステッカーを貼る。ピコラのステッカーはHPを2回回復させ、与ダメージ量を増加させる。高学年スキルのクールタイムが減少する。"
        },
        "3": {
          "name": "おしゃれピープル、集合！",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 2,
      "personality": "純粋",
      "race": "精霊",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 80,
      "combatPowerCorrectionB": 0.185
    },
    "statTypes": {
      "hp": 5,
      "atkP": 5,
      "atkM": 0,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "BigWood_low_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 25,
              "2": 27,
              "3": 29,
              "4": 31,
              "5": 33,
              "6": 35,
              "7": 37,
              "8": 39,
              "9": 41,
              "10": 43,
              "11": 45,
              "12": 47
            }
          },
          {
            "effectId": "BigWood_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3
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
              "1": 375,
              "2": 390,
              "3": 405,
              "4": 420,
              "5": 435,
              "6": 450,
              "7": 465,
              "8": 480,
              "9": 495,
              "10": 510,
              "11": 525,
              "12": 540
            }
          },
          {
            "effectId": "BigWood_high_e02",
            "valueKind": "回復回数",
            "valueClass": "回数",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 3
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
            "fixedValue": 4
          }
        ],
        "skillId": "BigWood_high",
        "skillType": "高学年",
        "skillName": "あたしを見て～",
        "description": "敵を挑発した後、HPを3回回復する。",
        "cooldownSeconds": 24
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
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46
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
            "fixedValue": 100
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
            "fixedValue": 300
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
            "fixedValue": 3
          }
        ],
        "skillId": "BigWood_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で単体対象に拳を振り回し、物理ダメージを与え、気絶を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 30
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "hilde",
    "name": "ヒルデ",
    "basic": {
      "rarity": 3,
      "personality": "憂鬱",
      "race": "エルフ",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 100,
      "spRecoveryPerSecond": 44,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.425
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 1,
      "defP": 4,
      "defM": 4,
      "crit": 1,
      "critDmg": 1,
      "critRes": 4,
      "critDmgRes": 4
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
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21,
              "13": 22,
              "14": 23,
              "15": 24
            }
          },
          {
            "effectId": "Hilde_low_e02",
            "valueKind": "持続HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "味方/HP80%未満2名",
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
              "10": 7,
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
            "effectTarget": "味方/HP80%未満2名",
            "fixedValue": 6
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
              "1": 340,
              "2": 370,
              "3": 400,
              "4": 430,
              "5": 460,
              "6": 490,
              "7": 520,
              "8": 550,
              "9": 580,
              "10": 610,
              "11": 640,
              "12": 670,
              "13": 700,
              "14": 730,
              "15": 760
            }
          },
          {
            "effectId": "Hilde_high_e02",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方/範囲",
            "levels": {
              "1": 65,
              "2": 67,
              "3": 69,
              "4": 71,
              "5": 73,
              "6": 75,
              "7": 77,
              "8": 79,
              "9": 81,
              "10": 83,
              "11": 85,
              "12": 87,
              "13": 89,
              "14": 91,
              "15": 93
            }
          },
          {
            "effectId": "Hilde_high_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "味方/範囲",
            "levels": {
              "1": 7,
              "2": 7.25,
              "3": 7.5,
              "4": 7.75,
              "5": 8,
              "6": 8.25,
              "7": 8.5,
              "8": 8.75,
              "9": 9,
              "10": 9.25,
              "11": 9.5,
              "12": 9.75,
              "13": 10,
              "14": 10.25,
              "15": 10.5
            }
          }
        ],
        "skillId": "Hilde_high",
        "skillType": "高学年",
        "skillName": "過剰医療",
        "description": "敵に範囲魔法ダメージを与え、範囲内の味方を巨大化させ、攻撃速度を増加させる。",
        "cooldownSeconds": 36
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
              "1": 23,
              "2": 22,
              "3": 21,
              "4": 20,
              "5": 19,
              "6": 18,
              "7": 17,
              "8": 16,
              "9": 15,
              "10": 14,
              "11": 13,
              "12": 12,
              "13": 11,
              "14": 10,
              "15": 9
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
            "fixedValue": 100
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
            "fixedValue": 20
          }
        ],
        "skillId": "Hilde_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "3回目の攻撃の代わりに、HP割合が最も少ない味方のHPを回復する。",
        "triggerType": "n回ごと",
        "triggerValue": 3
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "温泉のヒルデ",
      "levels": {
        "1": {
          "name": "自己治療",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心抵抗",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ抵抗",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "医療従事者保護法",
          "stats": [],
          "effects": [
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "強化攻撃で回復時",
              "effectTarget": "味方/強化攻撃回復対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 60
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "強化攻撃で回復時",
              "effectTarget": "味方/強化攻撃回復対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 6
            },
            {
              "valueKind": "強化攻撃HP回復倍率",
              "valueClass": "倍率",
              "effectType": "回復",
              "effectTarget": "味方/強化攻撃回復対象",
              "targetSkill": "普通攻撃_強化",
              "fixedValue": 2
            }
          ],
          "description": "強化攻撃の回復対象の攻撃速度を増加させ、強化攻撃のHP回復割合が2倍になる。"
        },
        "3": {
          "name": "温泉の効能",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 2,
      "personality": "憂鬱",
      "race": "エルフ",
      "role": "支援",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 80,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 4,
      "atkP": 5,
      "atkM": 0,
      "defP": 4,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
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
            "fixedValue": 50
          },
          {
            "effectId": "Festa_low_e02",
            "valueKind": "ノイズ",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 4,
              "2": 4.3,
              "3": 4.6,
              "4": 4.9,
              "5": 5.2,
              "6": 5.5,
              "7": 5.8,
              "8": 6.1,
              "9": 6.4,
              "10": 6.7,
              "11": 7,
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
            "condition": "高学年使用時（赤い照明）",
            "effectTarget": "自身",
            "fixedValue": 10,
            "levels": {
              "1": 25,
              "2": 26,
              "3": 27,
              "4": 28,
              "5": 29,
              "6": 30,
              "7": 31,
              "8": 32,
              "9": 33,
              "10": 34,
              "11": 35,
              "12": 36
            }
          },
          {
            "effectId": "Festa_high_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時（緑の照明）",
            "effectTarget": "自身",
            "fixedValue": 10,
            "levels": {
              "1": 50,
              "2": 52,
              "3": 54,
              "4": 56,
              "5": 58,
              "6": 60,
              "7": 62,
              "8": 64,
              "9": 66,
              "10": 68,
              "11": 70,
              "12": 72
            }
          },
          {
            "effectId": "Festa_high_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時（青い照明）",
            "effectTarget": "自身",
            "fixedValue": 10,
            "levels": {
              "1": 30,
              "2": 31,
              "3": 32,
              "4": 33,
              "5": 34,
              "6": 35,
              "7": 36,
              "8": 37,
              "9": 38,
              "10": 39,
              "11": 40,
              "12": 41
            }
          }
        ],
        "skillId": "Festa_high",
        "skillType": "高学年",
        "skillName": "スポットライト",
        "description": "フェスタに3つの照明を当て、照明の色に応じて異なる効果を付与する。",
        "cooldownSeconds": 20
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
              "1": 30,
              "2": 32,
              "3": 34,
              "4": 36,
              "5": 38,
              "6": 40,
              "7": 42,
              "8": 44,
              "9": 46,
              "10": 48,
              "11": 50,
              "12": 52
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
            "fixedValue": 150
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "精霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.345
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 5,
      "critDmg": 5,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 280,
              "2": 308,
              "3": 336,
              "4": 364,
              "5": 392,
              "6": 420,
              "7": 448,
              "8": 476,
              "9": 504,
              "10": 532,
              "11": 560,
              "12": 588
            }
          },
          {
            "effectId": "Blanchet_low_e02",
            "valueKind": "最後の一撃の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 420,
              "2": 462,
              "3": 504,
              "4": 546,
              "5": 588,
              "6": 630,
              "7": 672,
              "8": 714,
              "9": 756,
              "10": 798,
              "11": 840,
              "12": 882
            }
          },
          {
            "effectId": "Blanchet_low_e03",
            "valueKind": "最大跳ね返り回数",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
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
              "1": 480,
              "2": 528,
              "3": 576,
              "4": 624,
              "5": 672,
              "6": 720,
              "7": 768,
              "8": 816,
              "9": 864,
              "10": 912,
              "11": 960,
              "12": 1008
            }
          },
          {
            "effectId": "Blanchet_high_e02",
            "valueKind": "最後の一撃の総魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 720,
              "2": 792,
              "3": 864,
              "4": 936,
              "5": 1008,
              "6": 1080,
              "7": 1152,
              "8": 1224,
              "9": 1296,
              "10": 1368,
              "11": 1440,
              "12": 1512
            }
          },
          {
            "effectId": "Blanchet_high_e03",
            "valueKind": "シンクローズ",
            "valueClass": "回数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
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
            "fixedValue": 6
          }
        ],
        "skillId": "Blanchet_high",
        "skillType": "高学年",
        "skillName": "青い鳥の花園",
        "description": "敵にシンクローズを3回放つ。最後の一撃は確定会心範囲ダメージを与え、全攻撃が沈黙を付与する。",
        "cooldownSeconds": 20
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
              "1": 20,
              "2": 23,
              "3": 26,
              "4": 29,
              "5": 32,
              "6": 35,
              "7": 38,
              "8": 41,
              "9": 44,
              "10": 47,
              "11": 50,
              "12": 53
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
            "fixedValue": 60
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
            "fixedValue": 180
          },
          {
            "effectId": "Blanchet_enhanced_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Blanchet_enhanced_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 4
          }
        ],
        "skillId": "Blanchet_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で青い薔薇を飛ばして敵に魔法ダメージを与え、苦痛を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 25
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
                "valueKind": "魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25,
                "effectTarget": "敵",
                "levels": {
                  "1": 280,
                  "3": 336,
                  "4": 364,
                  "5": 392,
                  "6": 420,
                  "7": 448,
                  "8": 476,
                  "9": 504,
                  "10": 532,
                  "11": 560,
                  "12": 588
                }
              },
              {
                "valueKind": "最後の一撃の魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25,
                "effectTarget": "敵",
                "levels": {
                  "1": 420,
                  "3": 504,
                  "4": 546,
                  "5": 588,
                  "6": 630,
                  "7": 672,
                  "8": 714,
                  "9": 756,
                  "10": 798,
                  "11": 840,
                  "12": 882
                }
              },
              {
                "valueKind": "強化シンクローズの魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25,
                "effectTarget": "敵",
                "levels": {
                  "1": 340,
                  "3": 408,
                  "4": 442,
                  "5": 476,
                  "6": 510,
                  "7": 544,
                  "8": 578,
                  "9": 612,
                  "10": 646,
                  "11": 680,
                  "12": 714
                }
              },
              {
                "valueKind": "強化シンクローズの最後の一撃の魔法ダメージ",
                "valueClass": "倍率",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25,
                "effectTarget": "敵",
                "levels": {
                  "1": 510,
                  "3": 612,
                  "4": 663,
                  "5": 714,
                  "6": 765,
                  "7": 816,
                  "8": 867,
                  "9": 918,
                  "10": 969,
                  "11": 1020,
                  "12": 1071
                }
              },
              {
                "valueKind": "強化シンクローズ発動確率",
                "valueClass": "倍率",
                "effectType": "条件",
                "triggerType": "一定確率",
                "triggerValue": 25,
                "effectTarget": "自身",
                "fixedValue": 75
              },
              {
                "valueKind": "強化シンクローズ発動回数",
                "valueClass": "回数",
                "effectType": "攻撃",
                "triggerType": "一定確率",
                "triggerValue": 25,
                "effectTarget": "敵",
                "fixedValue": 2
              }
            ],
            "targetSkill": "低学年",
            "skillName": "シンクローズ・ブロッサム",
            "description": "最大3回跳ね返るシンクローズを放つ。一定確率で強化されたシンクローズを2回放つ。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
            "skillName": "愛用Lv3",
            "description": "ブランセの魔法攻撃力、会心、会心ダメージが増加する。"
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
    "id": "fricle",
    "name": "フリックル",
    "basic": {
      "rarity": 3,
      "personality": "冷静",
      "race": "魔女",
      "role": "攻撃",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 20,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.335
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630
            }
          },
          {
            "effectId": "Fricle_low_e02",
            "valueKind": "魔法ダメージ(1回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 60
          },
          {
            "effectId": "Fricle_low_e03",
            "valueKind": "魔法ダメージ(2回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 120
          }
        ],
        "skillId": "Fricle_low",
        "skillType": "低学年",
        "skillName": "スティンギングゲートキーパー",
        "description": "敵に範囲魔法ダメージを与え、召喚された棘の触手を全て消滅させる。 この棘の触手は、消滅時、敵により大きなダメージを与える。",
        "stunSeconds": "敵に範囲魔法ダメージを与え、召喚された棘の触手を全て消滅させる。"
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
              "1": 70,
              "2": 80,
              "3": 90,
              "4": 100,
              "5": 110,
              "6": 120,
              "7": 130,
              "8": 140,
              "9": 150,
              "10": 160,
              "11": 170,
              "12": 180
            }
          },
          {
            "effectId": "Fricle_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "持続時間",
            "effectType": "攻撃",
            "effectTarget": "近い敵3体",
            "fixedValue": 5
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
            "fixedValue": 5
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
            "fixedValue": 7
          },
          {
            "effectId": "Fricle_high_e07",
            "valueKind": "棘の触手召喚",
            "valueClass": "召喚",
            "effectType": "召喚",
            "condition": "棘の蔓生成時",
            "effectTarget": "敵",
            "fixedValue": 1
          }
        ],
        "skillId": "Fricle_high",
        "skillType": "高学年",
        "skillName": "ガードオブトーチャー",
        "description": "棘の蔓で最も近くにいる敵3名を5秒間縛り付け、魔法ダメージを与え、バインド、沈黙を付与する。 棘の蔓生成時、敵に棘の触手を1体召喚する。",
        "cooldownSeconds": 18
      },
      {
        "effects": [
          {
            "effectId": "Fricle_passive_e01",
            "valueKind": "対狂気与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "condition": "狂気性格攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 40,
              "2": 44,
              "3": 48,
              "4": 52,
              "5": 56,
              "6": 60,
              "7": 64,
              "8": 68,
              "9": 72,
              "10": 76,
              "11": 80,
              "12": 84
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
            "fixedValue": 75
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
            "fixedValue": 1
          },
          {
            "effectId": "Fricle_enhanced_e02",
            "valueKind": "召喚獣魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "近くの敵",
            "fixedValue": 15
          },
          {
            "effectId": "Fricle_enhanced_e03",
            "valueKind": "魔法ダメージ(1回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 30
          },
          {
            "effectId": "Fricle_enhanced_e04",
            "valueKind": "魔法ダメージ(2回目)",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "召喚獣消滅時",
            "effectTarget": "敵",
            "fixedValue": 60
          }
        ],
        "skillId": "Fricle_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で棘の触手を召喚する。 棘の触手は消滅するまで、近くの敵を攻撃する。 棘の触手は消滅時、前後方向に範囲攻撃を放つ。",
        "triggerType": "一定確率",
        "triggerValue": 33
      }
    ],
    "favoriteCard": {},
    "aside": {
      "levels": {}
    },
    "board": null
  },
  {
    "id": "haley",
    "name": "ヘイリー",
    "basic": {
      "rarity": 3,
      "personality": "純粋",
      "race": "エルフ",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "7": 495,
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
            "fixedValue": 3
          },
          {
            "effectId": "Haley_low_e03",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "命中した敵"
          },
          {
            "effectId": "Haley_low_e04",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "命中した敵",
            "fixedValue": 5
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
              "1": 58,
              "2": 63.8,
              "3": 69.6,
              "4": 75.4,
              "5": 81.2,
              "6": 87,
              "7": 92.8,
              "8": 98.6,
              "9": 104.4,
              "10": 110.2,
              "11": 116,
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
            "fixedValue": 7
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
            "fixedValue": 10
          }
        ],
        "skillId": "Haley_high",
        "skillType": "高学年",
        "skillName": "プランB",
        "description": "敵に煙幕地帯を残す爆弾を発射し、範囲物理持続ダメージを与え目隠しを付与する。",
        "cooldownSeconds": 32
      },
      {
        "effects": [
          {
            "effectId": "Haley_passive_e01",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "condition": "対象苦痛状態時",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 23,
              "3": 26,
              "4": 29,
              "5": 32,
              "6": 35,
              "7": 38,
              "8": 41,
              "9": 44,
              "10": 47,
              "11": 50,
              "12": 53,
              "13": 56,
              "14": 59,
              "15": 62
            }
          },
          {
            "effectId": "Haley_passive_e02",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "condition": "対象火傷状態時",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 23,
              "3": 26,
              "4": 29,
              "5": 32,
              "6": 35,
              "7": 38,
              "8": 41,
              "9": 44,
              "10": 47,
              "11": 50,
              "12": 53,
              "13": 56,
              "14": 59,
              "15": 62
            }
          },
          {
            "effectId": "Haley_passive_e03",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "condition": "対象毒状態時",
            "effectTarget": "自身",
            "levels": {
              "1": 20,
              "2": 23,
              "3": 26,
              "4": 29,
              "5": 32,
              "6": 35,
              "7": 38,
              "8": 41,
              "9": 44,
              "10": 47,
              "11": 50,
              "12": 53,
              "13": 56,
              "14": 59,
              "15": 62
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
            "fixedValue": 85
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
            "valueKind": "物理攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 20
          },
          {
            "effectId": "Haley_enhanced_e02",
            "valueKind": "物理攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Haley_enhanced_e03",
            "valueKind": "魔法防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 40
          },
          {
            "effectId": "Haley_enhanced_e04",
            "valueKind": "魔法防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃使用時",
            "effectTarget": "自身",
            "fixedValue": 6
          }
        ],
        "skillId": "Haley_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに鞭を整える。 一定時間、物理攻撃力が増加し、魔法防御力が増加する。",
        "triggerType": "n回ごと",
        "triggerValue": 4
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "宇宙船艦",
      "levels": {
        "1": {
          "name": "宇宙船艦ヘイリー",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "地球をフライバイ",
          "stats": [],
          "effects": [
            {
              "valueKind": "攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く中列の味方使徒",
              "fixedValue": 32
            },
            {
              "valueKind": "攻撃力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く中列の味方使徒",
              "fixedValue": 6
            },
            {
              "valueKind": "防御力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く中列の味方使徒",
              "fixedValue": 16
            },
            {
              "valueKind": "防御力増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "強化攻撃バフ獲得時",
              "effectTarget": "自身を除く中列の味方使徒",
              "fixedValue": 6
            },
            {
              "valueKind": "苦痛",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "effectTarget": "低学年スキルの最後の一撃",
              "targetSkill": "敵",
              "reference": "低学年スキル"
            },
            {
              "valueKind": "苦痛",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "effectTarget": "低学年スキルの最後の一撃",
              "targetSkill": "敵",
              "reference": "低学年スキル",
              "fixedValue": 5
            },
            {
              "valueKind": "軍艦召喚",
              "valueClass": "召喚",
              "effectType": "召喚",
              "effectTarget": "高学年スキル使用時",
              "targetSkill": "自身",
              "reference": "高学年スキル"
            },
            {
              "valueKind": "砲弾総物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "軍艦召喚時",
              "effectTarget": "前方の敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 2250
            },
            {
              "valueKind": "砲弾物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "軍艦召喚時",
              "effectTarget": "前方の敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 375
            },
            {
              "valueKind": "砲弾数",
              "valueClass": "ヒット数",
              "effectType": "攻撃",
              "condition": "軍艦召喚時",
              "effectTarget": "前方の敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 6
            }
          ],
          "description": "強化攻撃バフの獲得時、自身を除く中列の味方使徒の攻撃力と防御力を増加させる。低学年スキルの最後の一撃に確定で苦痛を付与する。高学年スキル使用時、軍艦が召喚される。軍艦は前方の敵に砲弾を6発降らせ、範囲物理ダメージを与える。"
        },
        "3": {
          "name": "味方基地防衛作戦",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3
            }
          ],
          "effects": [
            {
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
      "rarity": 3,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 80,
      "combatPowerCorrectionB": 0.2
    },
    "statTypes": {
      "hp": 4,
      "atkP": 5,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260
            }
          },
          {
            "effectId": "Beni_low_e02",
            "valueKind": "会心率増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "levels": {
              "1": 16,
              "2": 16.4,
              "3": 16.8,
              "4": 17.2,
              "5": 17.6,
              "6": 18,
              "7": 18.4,
              "8": 18.8,
              "9": 19.2,
              "10": 19.6,
              "11": 20,
              "12": 20.4
            }
          },
          {
            "effectId": "Beni_low_e03",
            "valueKind": "会心ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "levels": {
              "1": 60,
              "2": 64,
              "3": 68,
              "4": 72,
              "5": 76,
              "6": 80,
              "7": 84,
              "8": 88,
              "9": 92,
              "10": 96,
              "11": 100,
              "12": 104
            }
          },
          {
            "effectId": "Beni_low_e04",
            "valueKind": "会心率増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "fixedValue": 8
          },
          {
            "effectId": "Beni_low_e05",
            "valueKind": "会心ダメージ量増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "魚を食べた時",
            "effectTarget": "自身",
            "fixedValue": 8
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
              "1": 660,
              "2": 726,
              "3": 792,
              "4": 858,
              "5": 924,
              "6": 990,
              "7": 1056,
              "8": 1122,
              "9": 1188,
              "10": 1254,
              "11": 1320,
              "12": 1386
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
            "fixedValue": 4
          }
        ],
        "skillId": "Beni_high",
        "skillType": "高学年",
        "skillName": "ぶった切るよ～！",
        "description": "斧で地面を叩きつけ、範囲物理ダメージを与え、気絶を付与する。",
        "cooldownSeconds": 58
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
              "1": 6,
              "2": 7,
              "3": 8,
              "4": 9,
              "5": 10,
              "6": 11,
              "7": 12,
              "8": 13,
              "9": 14,
              "10": 15,
              "11": 16,
              "12": 17
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
            "fixedValue": 100
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
      "rarity": 3,
      "personality": "狂気",
      "race": "魔女",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 430,
              "2": 473,
              "3": 516,
              "4": 559,
              "5": 602,
              "6": 645,
              "7": 688,
              "8": 731,
              "9": 774,
              "10": 817,
              "11": 860,
              "12": 903
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
            "fixedValue": 12
          }
        ],
        "skillId": "Belita_high",
        "skillType": "高学年",
        "skillName": "クリムゾンレイン",
        "description": "クリムゾンレインで爆撃し、敵に12回範囲魔法ダメージを与える。",
        "cooldownSeconds": 22
      },
      {
        "effects": [
          {
            "effectId": "Belita_passive_e01",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "condition": "対前列使徒攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 40,
              "2": 44,
              "3": 48,
              "4": 52,
              "5": 56,
              "6": 60,
              "7": 64,
              "8": 68,
              "9": 72,
              "10": 76,
              "11": 80,
              "12": 84
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
            "fixedValue": 75
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
            "fixedValue": 200
          }
        ],
        "skillId": "Belita_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率でマナを凝縮した爆撃魔法を発動させて敵に範囲魔法ダメージを与える。",
        "triggerType": "一定確率",
        "triggerValue": 30
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
      "rarity": 1,
      "personality": "憂鬱",
      "race": "幽霊",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.22
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 60,
              "2": 66,
              "3": 72,
              "4": 78,
              "5": 84,
              "6": 90,
              "7": 96,
              "8": 102,
              "9": 108,
              "10": 114,
              "11": 120,
              "12": 126
            }
          },
          {
            "effectId": "Veroo_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 2
          },
          {
            "effectId": "Veroo_low_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "最後の一撃時",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 100,
              "2": 110,
              "3": 120,
              "4": 130,
              "5": 140,
              "6": 150,
              "7": 160,
              "8": 170,
              "9": 180,
              "10": 190,
              "11": 200,
              "12": 210
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
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
            }
          }
        ],
        "skillId": "Veroo_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - ベル",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 26
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 75
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
      "rarity": 3,
      "personality": "冷静",
      "race": "魔女",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 200,
      "spRecoveryPerSecond": 25,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 4,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 200,
              "2": 215,
              "3": 230,
              "4": 245,
              "5": 260,
              "6": 275,
              "7": 290,
              "8": 305,
              "9": 320,
              "10": 335,
              "11": 350,
              "12": 365
            }
          },
          {
            "effectId": "Velvet_low_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "levels": {
              "1": 25,
              "2": 27,
              "3": 29,
              "4": 31,
              "5": 33,
              "6": 35,
              "7": 37,
              "8": 39,
              "9": 41,
              "10": 43,
              "11": 45,
              "12": 47
            }
          },
          {
            "effectId": "Velvet_low_e03",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "自身",
            "fixedValue": 6
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
            "fixedValue": 4
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
              "1": 216,
              "2": 237.6,
              "3": 259.2,
              "4": 280.8,
              "5": 302.4,
              "6": 324,
              "7": 345.6,
              "8": 367.2,
              "9": 388.8,
              "10": 410.4,
              "11": 432,
              "12": 453.6
            }
          },
          {
            "effectId": "Velvet_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 11
          },
          {
            "effectId": "Velvet_high_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 54,
              "2": 59.4,
              "3": 64.8,
              "4": 70.2,
              "5": 75.6,
              "6": 81,
              "7": 86.4,
              "8": 91.8,
              "9": 97.2,
              "10": 102.6,
              "11": 108,
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
            "valueKind": "無敵",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Velvet_high_e06",
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "自身",
            "fixedValue": 3
          }
        ],
        "skillId": "Velvet_high",
        "skillType": "高学年",
        "skillName": "魔法：遠心分離",
        "description": "高速回転して斧で周囲を薙ぎ払い、敵に範囲物理ダメージを11回与え、ノックバックさせる。 最後の一撃ではより大きなダメージを与える。回転中は無敵になる。",
        "cooldownSeconds": 20
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 125
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "魔女",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 200,
      "spRecoveryPerSecond": 50,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.475
    },
    "statTypes": {
      "hp": 1,
      "atkP": 0,
      "atkM": 4,
      "defP": 1,
      "defM": 1,
      "crit": 4,
      "critDmg": 4,
      "critRes": 1,
      "critDmgRes": 1
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Posher_low_e01",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
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
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
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
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
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
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "黄のポーション使用時",
            "effectTarget": "ランダムな敵"
          },
          {
            "effectId": "Posher_low_e05",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "黄のポーション使用時",
            "effectTarget": "ランダムな敵",
            "fixedValue": 4
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
              "1": 3,
              "2": 3.2,
              "3": 3.4,
              "4": 3.6,
              "5": 3.8,
              "6": 4,
              "7": 4.2,
              "8": 4.4,
              "9": 4.6,
              "10": 4.8,
              "11": 5,
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
        "cooldownSeconds": 18
      },
      {
        "effects": [
          {
            "effectId": "Posher_passive_e01",
            "valueKind": "被スキルダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "被スキル攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46,
              "13": 48,
              "14": 50,
              "15": 52
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
            "fixedValue": 100
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
            "fixedValue": 250
          }
        ],
        "skillId": "Posher_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回目の攻撃時にポーション2個で総魔法ダメージ。",
        "triggerType": "n回ごと",
        "triggerValue": 4
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "みんなのポーション",
      "levels": {
        "1": {
          "name": "ポーション職人ポーシャー",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "臨床実験大成功",
          "stats": [],
          "effects": [
            {
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "condition": "低学年スキル使用時",
              "effectTarget": "味方/後列",
              "targetSkill": "低学年スキル",
              "fixedValue": "20～50"
            },
            {
              "valueKind": "変異対象追加",
              "valueClass": "対象数",
              "effectType": "デバフ",
              "effectTarget": "敵",
              "targetSkill": "高学年スキル",
              "fixedValue": 1
            }
          ],
          "description": "低学年スキルを使用すると、後列の味方のSPを回復する。高学年スキルに変異が1体追加される。"
        },
        "3": {
          "name": "新薬革命",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "会心抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
            },
            {
              "valueKind": "会心ダメージ抵抗増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 6
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
      "rarity": 3,
      "personality": "純粋",
      "race": "獣人",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 150,
      "spRecoveryPerSecond": 44,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.39
    },
    "statTypes": {
      "hp": 2,
      "atkP": 0,
      "atkM": 2,
      "defP": 2,
      "defM": 2,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 5,
              "2": 5.6,
              "3": 6.2,
              "4": 6.8,
              "5": 7.4,
              "6": 8,
              "7": 8.6,
              "8": 9.2,
              "9": 9.8,
              "10": 10.4,
              "11": 11,
              "12": 11.6
            }
          },
          {
            "effectId": "Mago_low_e02",
            "valueKind": "HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "effectTarget": "味方全体",
            "fixedValue": 8
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
        "cooldownSeconds": 18
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
              "1": 23,
              "2": 22,
              "3": 21,
              "4": 20,
              "5": 19,
              "6": 18,
              "7": 17,
              "8": 16,
              "9": 15,
              "10": 14,
              "11": 13,
              "12": 12
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
            "fixedValue": 100
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
      "rarity": 2,
      "personality": "狂気",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 80,
      "combatPowerCorrectionB": 0.185
    },
    "statTypes": {
      "hp": 5,
      "atkP": 5,
      "atkM": 0,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "MaestroMK2_low_e01",
            "valueKind": "シールド",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "前列の味方",
            "reference": "最大HP",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
            }
          },
          {
            "effectId": "MaestroMK2_low_e02",
            "valueKind": "シールド",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "前列の味方",
            "fixedValue": 3
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
              "1": 100,
              "2": 110,
              "3": 120,
              "4": 130,
              "5": 140,
              "6": 150,
              "7": 160,
              "8": 170,
              "9": 180,
              "10": 190,
              "11": 200,
              "12": 210
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
            "fixedValue": 6
          }
        ],
        "skillId": "MaestroMK2_high",
        "skillType": "高学年",
        "skillName": "ソナーショックウェーブ",
        "description": "範囲内の対象に衝撃波を放出し、物理ダメージを与え、ノイズデバフを付与する。",
        "cooldownSeconds": 16
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
              "1": 30,
              "2": 32,
              "3": 34,
              "4": 36,
              "5": 38,
              "6": 40,
              "7": 42,
              "8": 44,
              "9": 46,
              "10": 48,
              "11": 50,
              "12": 52
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
            "fixedValue": 175
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
      "rarity": 3,
      "personality": "狂気",
      "race": "妖精",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.325
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
            "fixedValue": 3
          },
          {
            "effectId": "Mayo_low_e03",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "最も攻撃力が高い敵"
          },
          {
            "effectId": "Mayo_low_e04",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "最も攻撃力が高い敵",
            "fixedValue": 4
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
              "1": 140,
              "2": 154,
              "3": 168,
              "4": 182,
              "5": 196,
              "6": 210,
              "7": 224,
              "8": 238,
              "9": 252,
              "10": 266,
              "11": 280,
              "12": 294
            }
          },
          {
            "effectId": "Mayo_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 8
          },
          {
            "effectId": "Mayo_high_e03",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "ランダムな敵"
          },
          {
            "effectId": "Mayo_high_e04",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "ランダムな敵",
            "fixedValue": 4
          }
        ],
        "skillId": "Mayo_high",
        "skillType": "高学年",
        "skillName": "それは私のコレクションっす。",
        "description": "毒矢を発射し、ランダムな敵に8回物理ダメージを与え、毒を付与する。",
        "cooldownSeconds": 11
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
              "1": 24,
              "2": 28,
              "3": 32,
              "4": 36,
              "5": 40,
              "6": 44,
              "7": 48,
              "8": 52,
              "9": 56,
              "10": 60,
              "11": 64,
              "12": 68
            }
          },
          {
            "effectId": "Mayo_passive_e02",
            "valueKind": "毒終了時追加物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "マヨによる毒効果終了時",
            "effectTarget": "毒が消えた敵",
            "levels": {
              "1": 25,
              "2": 28,
              "3": 31,
              "4": 34,
              "5": 37,
              "6": 40,
              "7": 43,
              "8": 46,
              "9": 49,
              "10": 52,
              "11": 55,
              "12": 58
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
            "fixedValue": 100
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
            "fixedValue": 125
          },
          {
            "effectId": "Mayo_enhanced_e02",
            "valueKind": "毒",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵"
          },
          {
            "effectId": "Mayo_enhanced_e03",
            "valueKind": "毒",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "敵",
            "fixedValue": 2
          }
        ],
        "skillId": "Mayo_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で毒矢を飛ばして敵に物理ダメージを与え、毒を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 30
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
      "rarity": 2,
      "personality": "活発",
      "race": "妖精",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.26
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 150,
              "2": 160,
              "3": 170,
              "4": 180,
              "5": 190,
              "6": 200,
              "7": 210,
              "8": 220,
              "9": 230,
              "10": 240,
              "11": 250,
              "12": 260
            }
          },
          {
            "effectId": "Marie_low_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Marie_low_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵",
            "fixedValue": 4
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
              "1": 250,
              "2": 270,
              "3": 290,
              "4": 310,
              "5": 330,
              "6": 350,
              "7": 370,
              "8": 390,
              "9": 410,
              "10": 430,
              "11": 450,
              "12": 470
            }
          }
        ],
        "skillId": "Marie_high",
        "skillType": "高学年",
        "skillName": "は～じけるよ～！",
        "description": "高性能爆弾を設置した後、爆発させて敵に範囲物理ダメージを与える。",
        "cooldownSeconds": 40
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
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
            }
          },
          {
            "effectId": "Marie_passive_e02",
            "valueKind": "強化攻撃与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "パッシブ",
            "effectTarget": "自身",
            "levels": {
              "1": 24,
              "2": 28,
              "3": 32,
              "4": 36,
              "5": 40,
              "6": 44,
              "7": 48,
              "8": 52,
              "9": 56,
              "10": 60,
              "11": 64,
              "12": 68
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
            "fixedValue": 75
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
            "fixedValue": 125
          },
          {
            "effectId": "Marie_enhanced_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Marie_enhanced_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵",
            "fixedValue": 2
          }
        ],
        "skillId": "Marie_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で強化爆弾を投げつけて敵に範囲物理ダメージを与え、火傷を付与する。",
        "triggerType": "一定確率",
        "triggerValue": 50
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
      "rarity": 1,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.195
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
            "fixedValue": 3
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
              "1": 360,
              "2": 396,
              "3": 432,
              "4": 468,
              "5": 504,
              "6": 540,
              "7": 576,
              "8": 612,
              "9": 648,
              "10": 684,
              "11": 720,
              "12": 756
            }
          }
        ],
        "skillId": "Mynx_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - ミンス",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 24
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 75
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
      "rarity": 1,
      "personality": "狂気",
      "race": "幽霊",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 20,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.27
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 120,
              "2": 132,
              "3": 144,
              "4": 156,
              "5": 168,
              "6": 180,
              "7": 192,
              "8": 204,
              "9": 216,
              "10": 228,
              "11": 240,
              "12": 252
            }
          },
          {
            "effectId": "Maison_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "ランダムな敵",
            "fixedValue": 2
          },
          {
            "effectId": "Maison_low_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "最後の一撃時",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 80,
              "2": 88,
              "3": 96,
              "4": 104,
              "5": 112,
              "6": 120,
              "7": 128,
              "8": 136,
              "9": 144,
              "10": 152,
              "11": 160,
              "12": 168
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
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630
            }
          }
        ],
        "skillId": "Maison_high",
        "skillType": "高学年",
        "skillName": "教主の天罰 - メゾン",
        "description": "教主の力を借りて敵に物理ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 60
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
      "rarity": 2,
      "personality": "冷静",
      "race": "精霊",
      "role": "支援",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.425
    },
    "statTypes": {
      "hp": 1,
      "atkP": 0,
      "atkM": 4,
      "defP": 1,
      "defM": 1,
      "crit": 4,
      "critDmg": 4,
      "critRes": 1,
      "critDmgRes": 1
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
              "1": 50,
              "2": 55,
              "3": 60,
              "4": 65,
              "5": 70,
              "6": 75,
              "7": 80,
              "8": 85,
              "9": 90,
              "10": 95,
              "11": 100,
              "12": 105
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
              "1": 480,
              "2": 510,
              "3": 540,
              "4": 570,
              "5": 600,
              "6": 630,
              "7": 660,
              "8": 690,
              "9": 720,
              "10": 750,
              "11": 780,
              "12": 810
            }
          },
          {
            "effectId": "Meluna_low_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "fixedValue": 5
          }
        ],
        "skillId": "Meluna_low",
        "skillType": "低学年",
        "skillName": "メロンに、メロメロン！",
        "description": "メロンの雨を5回降らせて敵に範囲魔法ダメージを与え、味方全員のHPを回復する。",
        "cooldownSeconds": 0
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
              "1": 100,
              "2": 110,
              "3": 120,
              "4": 130,
              "5": 140,
              "6": 150,
              "7": 160,
              "8": 170,
              "9": 180,
              "10": 190,
              "11": 200,
              "12": 210
            }
          },
          {
            "effectId": "Meluna_high_e02",
            "valueKind": "爆発魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/範囲",
            "levels": {
              "1": 100,
              "2": 110,
              "3": 120,
              "4": 130,
              "5": 140,
              "6": 150,
              "7": 160,
              "8": 170,
              "9": 180,
              "10": 190,
              "11": 200,
              "12": 210
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
              "1": 260,
              "2": 272,
              "3": 284,
              "4": 296,
              "5": 308,
              "6": 320,
              "7": 332,
              "8": 344,
              "9": 356,
              "10": 368,
              "11": 380,
              "12": 392
            }
          }
        ],
        "skillId": "Meluna_high",
        "skillType": "高学年",
        "skillName": "メーロンマスクX",
        "description": "巨大メロンをランダムな敵に向かって転がし、範囲魔法ダメージを与える。目標に到達すると爆発してダメージを与え、残りHP割合が最も低い味方のHPを回復する。",
        "cooldownSeconds": 14
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
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
            }
          }
        ],
        "skillId": "Meluna_passive",
        "skillType": "パッシブ",
        "skillName": "パッシブスキル",
        "description": "強化攻撃確率が増加する。",
        "cooldownSeconds": 0
      },
      {
        "effects": [
          {
            "effectId": "Meluna_basic_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 75
          }
        ],
        "skillId": "Meluna_basic",
        "skillType": "普通攻撃_基本",
        "skillName": "基本",
        "description": "メロンを投げつけ、敵にダメージを与える。",
        "cooldownSeconds": 0
      },
      {
        "effects": [
          {
            "effectId": "Meluna_enhanced_e01",
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 100
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
              "1": 3
            }
          }
        ],
        "skillId": "Meluna_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で高級メロンを投げつけて敵にダメージを与え、目隠しを付与する。",
        "cooldownSeconds": 0,
        "triggerType": "一定確率",
        "triggerValue": 25
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
      "rarity": 3,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 100,
      "spRecoveryPerSecond": 20,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 30,
              "2": 34,
              "3": 38,
              "4": 42,
              "5": 46,
              "6": 50,
              "7": 54,
              "8": 58,
              "9": 62,
              "10": 66,
              "11": 70,
              "12": 74,
              "13": 78,
              "14": 82,
              "15": 86
            }
          },
          {
            "effectId": "Momo_low_e02",
            "valueKind": "召喚獣の自爆ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "スキル,召喚獣の自爆",
            "condition": "召喚獣破壊時",
            "effectTarget": "周囲の敵",
            "levels": {
              "1": 45,
              "2": 51,
              "3": 57,
              "4": 63,
              "5": 69,
              "6": 75,
              "7": 81,
              "8": 87,
              "9": 93,
              "10": 99,
              "11": 105,
              "12": 111,
              "13": 117,
              "14": 123,
              "15": 129
            }
          },
          {
            "effectId": "Momo_low_e03",
            "valueKind": "召喚",
            "valueClass": "持続時間",
            "effectType": "召喚",
            "effectTarget": "分身",
            "fixedValue": 12
          },
          {
            "effectId": "Momo_low_e04",
            "valueKind": "被ダメージ耐久度",
            "valueClass": "回数",
            "effectType": "召喚",
            "effectTarget": "分身",
            "fixedValue": 3
          },
          {
            "effectId": "Momo_low_e05",
            "valueKind": "召喚獣",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "分身",
            "levels": {
              "1": 2,
              "2": 2,
              "3": 2,
              "4": 2,
              "5": 2,
              "6": 3,
              "7": 3,
              "8": 3,
              "9": 3,
              "10": 3,
              "11": 4,
              "12": 4,
              "13": 4,
              "14": 4,
              "15": 4
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
            "fixedValue": 2
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
              "1": 370,
              "2": 395,
              "3": 420,
              "4": 445,
              "5": 470,
              "6": 495,
              "7": 520,
              "8": 545,
              "9": 570,
              "10": 595,
              "11": 620,
              "12": 645,
              "13": 670,
              "14": 695,
              "15": 720
            }
          },
          {
            "effectId": "Momo_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲の敵",
            "fixedValue": 4
          },
          {
            "effectId": "Momo_high_e03",
            "valueKind": "召喚獣",
            "valueClass": "対象数",
            "effectType": "召喚",
            "effectTarget": "分身",
            "fixedValue": 1
          },
          {
            "effectId": "Momo_high_e04",
            "valueKind": "召喚獣の魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "基本攻撃",
            "effectTarget": "ランダムな敵",
            "levels": {
              "1": 30,
              "2": 34,
              "3": 38,
              "4": 42,
              "5": 46,
              "6": 50,
              "7": 54,
              "8": 58,
              "9": 62,
              "10": 66,
              "11": 70,
              "12": 74,
              "13": 78,
              "14": 82,
              "15": 86
            }
          },
          {
            "effectId": "Momo_high_e05",
            "valueKind": "召喚獣の自爆ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "attackCategory": "スキル,召喚獣の自爆",
            "condition": "召喚獣破壊時",
            "effectTarget": "周囲の敵",
            "levels": {
              "1": 45,
              "2": 51,
              "3": 57,
              "4": 63,
              "5": 69,
              "6": 75,
              "7": 81,
              "8": 87,
              "9": 93,
              "10": 99,
              "11": 105,
              "12": 111,
              "13": 117,
              "14": 123,
              "15": 129
            }
          }
        ],
        "skillId": "Momo_high",
        "skillType": "高学年",
        "skillName": "秒殺リスサンダー",
        "description": "指定範囲内で最も後ろにいる敵の元に現れ、範囲魔法ダメージを4回与える。 攻撃が終わるとその場に分身を1個残し、スキル発動位置に戻ってくる。 分身は低学年スキルによって召喚される分身と同一の特性を持つ。",
        "cooldownSeconds": 30
      },
      {
        "effects": [
          {
            "effectId": "Momo_passive_e01",
            "valueKind": "発動条件",
            "valueClass": "回数",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 2
          },
          {
            "effectId": "Momo_passive_e02",
            "valueKind": "クールタイム",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "effectTarget": "自身",
            "levels": {
              "1": 15,
              "2": 14.5,
              "3": 14,
              "4": 13.5,
              "5": 13,
              "6": 12.5,
              "7": 12,
              "8": 11.5,
              "9": 11,
              "10": 10.5,
              "11": 10,
              "12": 9.5,
              "13": 9,
              "14": 8.5,
              "15": 8
            }
          },
          {
            "effectId": "Momo_passive_e03",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "levels": {
              "1": 16,
              "2": 17,
              "3": 18,
              "4": 19,
              "5": 20,
              "6": 21,
              "7": 22,
              "8": 23,
              "9": 24,
              "10": 25,
              "11": 26,
              "12": 27,
              "13": 28,
              "14": 29,
              "15": 30
            }
          },
          {
            "effectId": "Momo_passive_e04",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Momo_passive_e05",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "levels": {
              "1": 16,
              "2": 17,
              "3": 18,
              "4": 19,
              "5": 20,
              "6": 21,
              "7": 22,
              "8": 23,
              "9": 24,
              "10": 25,
              "11": 26,
              "12": 27,
              "13": 28,
              "14": 28,
              "15": 30
            }
          },
          {
            "effectId": "Momo_passive_e06",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "才気煥発時（直接攻撃ダメージ2回被弾時）",
            "effectTarget": "自身",
            "fixedValue": 6
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
            "fixedValue": 150
          },
          {
            "effectId": "Momo_basic_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "目覚めたニンジャ",
          "stats": [],
          "effects": [
            {
              "valueKind": "召喚獣の自爆ダメージ増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "attackCategory": "召喚獣の自爆",
              "condition": "召喚獣破壊時",
              "effectTarget": "召喚獣",
              "targetSkill": "召喚獣自爆",
              "fixedValue": 200
            },
            {
              "valueKind": "SP回復",
              "valueClass": "固定値",
              "effectType": "回復",
              "condition": "召喚獣破壊時",
              "effectTarget": "自身",
              "targetSkill": "召喚獣破壊時",
              "fixedValue": 10
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 50
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "高学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 3
            }
          ],
          "description": "召喚獣の自爆ダメージが増加する。召喚獣が破壊されると、自身のSPを回復する。高学年スキル使用時、一定時間、モモの被ダメージ量が減少する。"
        },
        "3": {
          "name": "モモ～ハッ！",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 10.5
            },
            {
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
      "rarity": 2,
      "personality": "狂気",
      "race": "獣人",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
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
              "1": 300,
              "2": 330,
              "3": 360,
              "4": 390,
              "5": 420,
              "6": 450,
              "7": 480,
              "8": 510,
              "9": 540,
              "10": 570,
              "11": 600,
              "12": 630
            }
          },
          {
            "effectId": "Yumimi_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "最も離れている敵/範囲内の敵",
            "fixedValue": 5
          }
        ],
        "skillId": "Yumimi_high",
        "skillType": "高学年",
        "skillName": "発射！矢の雨！",
        "description": "力を溜めて空へ矢を放ち、最も離れている敵に範囲物理ダメージを5回与える。",
        "cooldownSeconds": 18
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 100
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
      "rarity": 3,
      "eldain": "星を望む者",
      "personality": "憂鬱",
      "race": "？？？",
      "role": "支援",
      "position": "中列",
      "attackType": "魔法",
      "initialSp": 220,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 110,
      "combatPowerCorrectionB": 0.4
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 2,
      "defP": 4,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Yomi_low_e01",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の味方",
            "levels": {
              "1": 20,
              "2": 21,
              "3": 22,
              "4": 23,
              "5": 24,
              "6": 25,
              "7": 26,
              "8": 27,
              "9": 28,
              "10": 29,
              "11": 30,
              "12": 31
            }
          },
          {
            "effectId": "Yomi_low_e02",
            "valueKind": "防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の味方",
            "fixedValue": 6
          },
          {
            "effectId": "Yomi_low_e03",
            "valueKind": "攻撃力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の敵",
            "levels": {
              "1": 30,
              "2": 31,
              "3": 32,
              "4": 33,
              "5": 34,
              "6": 35,
              "7": 36,
              "8": 37,
              "9": 38,
              "10": 39,
              "11": 40,
              "12": 41
            }
          },
          {
            "effectId": "Yomi_low_e04",
            "valueKind": "攻撃力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "月光内にいる時",
            "effectTarget": "月光内の敵",
            "fixedValue": 6
          },
          {
            "effectId": "Yomi_low_e05",
            "valueKind": "月光",
            "valueClass": "持続時間",
            "effectType": "召喚",
            "effectTarget": "月光",
            "fixedValue": 8
          },
          {
            "effectId": "Yomi_low_e06",
            "valueKind": "基本攻撃強化",
            "valueClass": "スキル変更",
            "effectType": "バフ",
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
              "1": 10,
              "2": 10,
              "3": 11,
              "4": 11,
              "5": 12,
              "6": 12,
              "7": 13,
              "8": 13,
              "9": 14,
              "10": 14,
              "11": 15,
              "12": 15
            }
          },
          {
            "effectId": "Yomi_high_e02",
            "valueKind": "1秒ごとの魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "月光内の敵",
            "levels": {
              "1": 250,
              "2": 270,
              "3": 290,
              "4": 310,
              "5": 330,
              "6": 350,
              "7": 370,
              "8": 390,
              "9": 410,
              "10": 430,
              "11": 450,
              "12": 470
            }
          },
          {
            "effectId": "Yomi_high_e03",
            "valueKind": "敵SP減少",
            "valueClass": "固定値",
            "effectType": "デバフ",
            "effectTarget": "月光内の敵",
            "levels": {
              "1": 15,
              "2": 10,
              "3": 16,
              "4": 16,
              "5": 17,
              "6": 17,
              "7": 18,
              "8": 18,
              "9": 19,
              "10": 19,
              "11": 20,
              "12": 20
            }
          },
          {
            "effectId": "Yomi_high_e04",
            "valueKind": "月光",
            "valueClass": "持続時間",
            "effectType": "召喚",
            "effectTarget": "月光",
            "fixedValue": 12
          }
        ],
        "skillId": "Yomi_high",
        "skillType": "高学年",
        "skillName": "心を込めたお迎えを",
        "description": "一定時間、雲を晴らす月光を召喚する。 月光はヨミが見ている方向へゆっくりと前進する。 月光の内側にいる味方は1秒ごとにSPが回復する。 敵は1秒ごとにダメージを受け、SPが減少する。",
        "cooldownSeconds": 26
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
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23
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
            "fixedValue": 60
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
            "fixedValue": 300
          },
          {
            "effectId": "Yomi_enhanced_e02",
            "valueKind": "攻撃速度減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵2体",
            "fixedValue": 40
          },
          {
            "effectId": "Yomi_enhanced_e03",
            "valueKind": "攻撃速度減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "ランダムな敵2体",
            "fixedValue": 3
          },
          {
            "effectId": "Yomi_enhanced_e04",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 16
          },
          {
            "effectId": "Yomi_enhanced_e05",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "残りHP割合が最も低い味方",
            "reference": "最大HP",
            "fixedValue": 16
          }
        ],
        "skillId": "Yomi_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で星光を降らせ、ランダムな敵2体に魔法ダメージを与え、攻撃速度を減少させる。 追加で自身と、残りHP割合が最も低い味方を回復させる。",
        "triggerType": "一定確率",
        "triggerValue": 25
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
                "valueKind": "防御力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の味方",
                "levels": {
                  "1": 20,
                  "3": 22,
                  "4": 23,
                  "5": 24,
                  "6": 25,
                  "7": 26,
                  "8": 27,
                  "9": 28,
                  "10": 29,
                  "11": 30,
                  "12": 31
                }
              },
              {
                "valueKind": "与ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の味方",
                "levels": {
                  "1": 10,
                  "3": 12,
                  "4": 13,
                  "5": 14,
                  "6": 15,
                  "7": 16,
                  "8": 17,
                  "9": 18,
                  "10": 19,
                  "11": 20,
                  "12": 21
                }
              }
            ],
            "targetSkill": "低学年",
            "skillName": "満月の使者",
            "description": "満月を最大2個召喚し月光内の味方を強化"
          },
          {
            "effects": [
              {
                "valueKind": "バフ",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の味方",
                "fixedValue": 6
              }
            ],
            "targetSkill": "低学年",
            "skillName": "満月の使者",
            "description": "バフの持続時間"
          },
          {
            "effects": [
              {
                "valueKind": "攻撃力減少",
                "valueClass": "倍率",
                "effectType": "デバフ",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の敵",
                "levels": {
                  "1": 30,
                  "3": 32,
                  "4": 33,
                  "5": 34,
                  "6": 35,
                  "7": 36,
                  "8": 37,
                  "9": 38,
                  "10": 39,
                  "11": 40,
                  "12": 41
                }
              }
            ],
            "targetSkill": "低学年",
            "skillName": "満月の使者",
            "description": "月光内の敵の攻撃力を減少"
          },
          {
            "effects": [
              {
                "valueKind": "攻撃力減少",
                "valueClass": "持続時間",
                "effectType": "デバフ",
                "condition": "月光内にいる時",
                "effectTarget": "月光内の敵",
                "fixedValue": 6
              }
            ],
            "targetSkill": "低学年",
            "skillName": "満月の使者",
            "description": "攻撃力減少の持続時間"
          },
          {
            "effects": [
              {
                "valueKind": "月光",
                "valueClass": "持続時間",
                "effectType": "召喚",
                "effectTarget": "月光",
                "fixedValue": 8
              }
            ],
            "targetSkill": "低学年",
            "skillName": "満月の使者",
            "description": "月光の持続時間"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
            "skillName": "愛用Lv3",
            "description": "ヨミの魔法攻撃力、会心抵抗、会心ダメージ抵抗が増加"
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 44,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.37
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 135,
              "2": 148,
              "3": 161,
              "4": 174,
              "5": 187,
              "6": 200,
              "7": 213,
              "8": 226,
              "9": 239,
              "10": 252,
              "11": 265,
              "12": 278,
              "13": 291,
              "14": 304,
              "15": 317
            }
          },
          {
            "effectId": "Risty_low_e02",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵/HP最高/範囲",
            "levels": {
              "1": 270,
              "2": 297,
              "3": 324,
              "4": 351,
              "5": 378,
              "6": 405,
              "7": 432,
              "8": 459,
              "9": 486,
              "10": 513,
              "11": 540,
              "12": 567,
              "13": 594,
              "14": 621,
              "15": 648
            }
          },
          {
            "effectId": "Risty_low_e03",
            "valueKind": "再探索",
            "valueClass": "回数",
            "effectType": "条件",
            "effectTarget": "敵が倒されなかった場合",
            "fixedValue": 3
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
              "1": 40,
              "2": 43,
              "3": 45,
              "4": 48,
              "5": 51,
              "6": 53,
              "7": 56,
              "8": 59,
              "9": 61,
              "10": 64,
              "11": 67,
              "12": 69,
              "13": 72,
              "14": 75,
              "15": 77
            }
          },
          {
            "effectId": "Risty_high_e02",
            "valueKind": "ブロック数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵3体",
            "fixedValue": 10
          },
          {
            "effectId": "Risty_high_e03",
            "valueKind": "対象数",
            "valueClass": "対象数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
          },
          {
            "effectId": "Risty_high_e04",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "残りHP割合が最も低い敵3体",
            "levels": {
              "1": 160,
              "2": 171,
              "3": 181,
              "4": 192,
              "5": 203,
              "6": 213,
              "7": 224,
              "8": 235,
              "9": 245,
              "10": 256,
              "11": 267,
              "12": 277,
              "13": 288,
              "14": 299,
              "15": 309
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
            "fixedValue": 3
          }
        ],
        "skillId": "Risty_high",
        "skillType": "高学年",
        "skillName": "ボクセルグリッチ",
        "description": "残りHP割合が最も低い敵3体にブロックを10個ずつ落として物理ダメージを与える。最後に落ちるブロックはより高いダメージを与え、気絶を付与する。スキル発動中に対象を変更できる。",
        "cooldownSeconds": 26
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
              "1": 4,
              "2": 4.2,
              "3": 4.4,
              "4": 4.6,
              "5": 4.8,
              "6": 5,
              "7": 5.2,
              "8": 5.4,
              "9": 5.6,
              "10": 5.8,
              "11": 6,
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
            "fixedValue": 80
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
            "fixedValue": 120
          },
          {
            "effectId": "Risty_enhanced_e02",
            "valueKind": "確定会心",
            "valueClass": "固定値",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 1
          }
        ],
        "skillId": "Risty_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに敵の個人情報を収集し、確定会心物理ダメージを与える。",
        "triggerType": "n回ごと",
        "triggerValue": 4
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
                "valueKind": "確定会心",
                "valueClass": "条件",
                "effectType": "攻撃",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "敵"
              },
              {
                "valueKind": "SP回復",
                "valueClass": "固定値",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 3,
                "effectTarget": "自身"
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "3回攻撃するごとに敵をハッキングし、確定会心物理ダメージを与える。強化攻撃使用後、自身のSPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ステータス増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "天才ハッカーの登場",
          "stats": [],
          "effects": [
            {
              "valueKind": "SP回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "低学年スキルで敵撃破時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 75
            },
            {
              "valueKind": "SP回復クールタイム",
              "valueClass": "クールタイム",
              "effectType": "回復",
              "condition": "低学年スキルで敵撃破時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 10
            },
            {
              "valueKind": "追加物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "effectTarget": "残りHP割合が最も低い敵3体",
              "targetSkill": "高学年スキル",
              "fixedValue": 160
            },
            {
              "valueKind": "追加攻撃",
              "valueClass": "回数",
              "effectType": "攻撃",
              "effectTarget": "残りHP割合が最も低い敵3体",
              "targetSkill": "高学年スキル",
              "fixedValue": 3
            }
          ],
          "description": "低学年スキルで敵を退治すると、SPを回復する。高学年スキル使用後、残りHP割合が最も低い敵3体に追加で3回物理ダメージを与える。"
        },
        "3": {
          "name": "リスティのスーパーセーブ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "味方/後列",
              "fixedValue": 4
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
      "rarity": 3,
      "personality": "狂気",
      "race": "竜族",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 80,
      "combatPowerCorrectionB": 0.22
    },
    "statTypes": {
      "hp": 4,
      "atkP": 5,
      "atkM": 0,
      "defP": 4,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Leets_low_e01",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
            }
          },
          {
            "effectId": "Leets_low_e02",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "力を溜めている時かつ前列の味方が直接ダメージを受けた時",
            "effectTarget": "自身",
            "fixedValue": 60
          },
          {
            "effectId": "Leets_low_e03",
            "valueKind": "最大物理ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "力を溜めている時かつ前列の味方が直接ダメージを受けた時",
            "effectTarget": "自身",
            "levels": {
              "1": 90,
              "2": 100,
              "3": 110,
              "4": 120,
              "5": 130,
              "6": 140,
              "7": 150,
              "8": 160,
              "9": 170,
              "10": 180,
              "11": 190,
              "12": 200
            }
          },
          {
            "effectId": "Leets_low_e04",
            "valueKind": "最大被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "力を溜めている時かつ前列の味方が直接ダメージを受けた時",
            "effectTarget": "自身",
            "fixedValue": 80
          },
          {
            "effectId": "Leets_low_e05",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Leets_low_e06",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵",
            "fixedValue": 6
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
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 100,
              "2": 110,
              "3": 120,
              "4": 130,
              "5": 140,
              "6": 150,
              "7": 160,
              "8": 170,
              "9": 180,
              "10": 190,
              "11": 200,
              "12": 210
            }
          },
          {
            "effectId": "Leets_high_e02",
            "valueKind": "最後の一撃の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 150,
              "2": 165,
              "3": 180,
              "4": 195,
              "5": 210,
              "6": 225,
              "7": 240,
              "8": 255,
              "9": 270,
              "10": 285,
              "11": 300,
              "12": 315
            }
          },
          {
            "effectId": "Leets_high_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 3
          }
        ],
        "skillId": "Leets_high",
        "skillType": "高学年",
        "skillName": "鍛冶乱撃",
        "description": "敵を3回切りつけ、範囲物理ダメージを与える。 最後の一撃の後、反動で後ろに下がる。",
        "cooldownSeconds": 30
      },
      {
        "effects": [
          {
            "effectId": "Leets_passive_e01",
            "valueKind": "与ダメージ量増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "目標の敵へ攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 60,
              "2": 66,
              "3": 72,
              "4": 78,
              "5": 84,
              "6": 90,
              "7": 96,
              "8": 102,
              "9": 108,
              "10": 114,
              "11": 120,
              "12": 126
            }
          },
          {
            "effectId": "Leets_passive_e02",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "目標の敵からの攻撃時",
            "effectTarget": "自身",
            "levels": {
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46
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
            "fixedValue": 60
          },
          {
            "effectId": "Leets_basic_e02",
            "valueKind": "2回目の物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 90
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
            "fixedValue": 200
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
        "triggerValue": 25
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
                "valueKind": "与ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "目標の敵へ攻撃時",
                "effectTarget": "自身",
                "levels": {
                  "1": 60,
                  "3": 72,
                  "4": 78,
                  "5": 84,
                  "6": 90,
                  "7": 96,
                  "8": 102,
                  "9": 108,
                  "10": 114,
                  "11": 120,
                  "12": 126
                }
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "目標の敵からの攻撃時",
                "effectTarget": "自身",
                "levels": {
                  "1": 24,
                  "3": 28,
                  "4": 30,
                  "5": 32,
                  "6": 34,
                  "7": 36,
                  "8": 38,
                  "9": 40,
                  "10": 42,
                  "11": 44,
                  "12": 46
                }
              },
              {
                "valueKind": "基本攻撃ダメージ量増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 100
              }
            ],
            "targetSkill": "パッシブ",
            "skillName": "パッシブスキル",
            "description": "目標敵への与ダメージ量増加と被ダメージ量減少、基本攻撃ダメージ増加"
          },
          {
            "effects": [
              {
                "valueKind": "被ダメージ無効",
                "valueClass": "状態免疫",
                "effectType": "バフ",
                "effectTarget": "自身"
              }
            ],
            "targetSkill": "低学年",
            "skillName": "精錬の一撃",
            "description": "力を溜めている間、目標の敵からダメージを受けない"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "物理攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
      "rarity": 3,
      "eldain": "永遠のこだま",
      "personality": "狂気",
      "race": "エルフ",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 160,
      "spRecoveryPerSecond": 40,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.37
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 3,
      "critDmg": 3,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 600,
              "2": 700,
              "3": 800,
              "4": 900,
              "5": 1000,
              "6": 1100,
              "7": 1200,
              "8": 1300,
              "9": 1400,
              "10": 1500,
              "11": 1600,
              "12": 1700,
              "13": 1800,
              "14": 1900,
              "15": 2000
            }
          },
          {
            "effectId": "Renewa_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 5
          },
          {
            "effectId": "Renewa_low_e03",
            "valueKind": "HP回復量減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 40
          },
          {
            "effectId": "Renewa_low_e04",
            "valueKind": "HP回復量減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "範囲内の敵",
            "fixedValue": 5
          },
          {
            "effectId": "Renewa_low_e05",
            "valueKind": "HP回復",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "fixedValue": 20
          },
          {
            "effectId": "Renewa_low_e06",
            "valueKind": "バフ解除",
            "valueClass": "解除",
            "effectType": "デバフ"
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
            "valueKind": "全行動速度を徐々に加速",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "levels": {
              "1": 20,
              "2": 24,
              "3": 28,
              "4": 32,
              "5": 36,
              "6": 40,
              "7": 44,
              "8": 48,
              "9": 52,
              "10": 56,
              "11": 60,
              "12": 64,
              "13": 68,
              "14": 72,
              "15": 76
            }
          },
          {
            "effectId": "Renewa_high_e02",
            "valueKind": "全行動速度を徐々に加速",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "fixedValue": 7
          },
          {
            "effectId": "Renewa_high_e03",
            "valueKind": "被ダメージ量減少",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
            }
          },
          {
            "effectId": "Renewa_high_e04",
            "valueKind": "被ダメージ量減少",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の味方全体",
            "fixedValue": 10
          },
          {
            "effectId": "Renewa_high_e05",
            "valueKind": "全行動速度を徐々に減速",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体"
          },
          {
            "effectId": "Renewa_high_e06",
            "valueKind": "全行動速度を徐々に減速",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体",
            "fixedValue": 7
          },
          {
            "effectId": "Renewa_high_e07",
            "valueKind": "時間停止",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体"
          },
          {
            "effectId": "Renewa_high_e08",
            "valueKind": "時間停止",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "高学年使用時",
            "effectTarget": "フィールド上の敵全体",
            "fixedValue": 3
          },
          {
            "effectId": "Renewa_high_e09",
            "valueKind": "総物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵全員",
            "levels": {
              "1": 600,
              "2": 660,
              "3": 720,
              "4": 780,
              "5": 840,
              "6": 900,
              "7": 960,
              "8": 1020,
              "9": 1080,
              "10": 1140,
              "11": 1200,
              "12": 1260,
              "13": 1320,
              "14": 1380,
              "15": 1440
            }
          }
        ],
        "skillId": "Renewa_high",
        "skillType": "高学年",
        "skillName": "タイム・ブレイク",
        "description": "味方の全行動速度を徐々に加速させ、被ダメージ量を減少させる。敵の全行動速度を徐々に減速させ、一定時間停止させる。敵を停止させている間、敵全員に6回物理ダメージを与える。上記効果は発動時にフィールドにいた対象にのみ適用される。",
        "cooldownSeconds": 40
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
            "condition": "純粋性格攻撃時",
            "effectTarget": "味方アタッカー",
            "levels": {
              "1": 30,
              "2": 34,
              "3": 38,
              "4": 42,
              "5": 46,
              "6": 50,
              "7": 54,
              "8": 58,
              "9": 62,
              "10": 66,
              "11": 70,
              "12": 74,
              "13": 78,
              "14": 82,
              "15": 86
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
            "fixedValue": 90
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
            "fixedValue": 360
          },
          {
            "effectId": "Renewa_enhanced_e02",
            "valueKind": "物理攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 25
          },
          {
            "effectId": "Renewa_enhanced_e03",
            "valueKind": "物理攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 6
          }
        ],
        "skillId": "Renewa_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "4回攻撃するごとに魔導工学レーザーを発射し、敵に範囲物理ダメージを与え、一定時間物理攻撃力が増加する。",
        "triggerType": "n回ごと",
        "triggerValue": 4
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
                "valueKind": "攻撃速度増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "condition": "リニュア編成時15秒ごとに",
                "effectTarget": "攻撃力が最も高い味方の使徒",
                "fixedValue": 50
              },
              {
                "valueKind": "攻撃速度増加",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "condition": "リニュア編成時15秒ごとに",
                "effectTarget": "攻撃力が最も高い味方の使徒",
                "fixedValue": 10
              }
            ],
            "skillName": "リニュアのタイムパラドックス",
            "description": "デッキにリニュアが編成されている場台、15秒ごとに攻撃力が最も高い味方の使徒の攻撃速度を増加させる"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "クールタイム減少",
                "valueClass": "固定値",
                "effectType": "スキル変更",
                "effectTarget": "自身",
                "reference": "高学年スキル",
                "fixedValue": 5
              }
            ],
            "targetSkill": "高学年",
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "時空の彼方へ！",
          "stats": [],
          "effects": [
            {
              "valueKind": "物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "6秒経過時",
              "effectTarget": "敵",
              "fixedValue": 200
            },
            {
              "valueKind": "物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "低学年スキル使用時",
              "effectTarget": "敵",
              "fixedValue": 200
            },
            {
              "valueKind": "物理ダメージ",
              "valueClass": "倍率",
              "effectType": "攻撃",
              "condition": "高学年スキル使用時",
              "effectTarget": "敵",
              "fixedValue": 200
            },
            {
              "valueKind": "敵現在高学年クールタイム増加",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "敵",
              "targetSkill": "敵高学年スキル",
              "fixedValue": 1
            },
            {
              "valueKind": "自分現在高学年クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 2
            }
          ],
          "description": "6秒経過、または強化攻撃、低学年スキル使用時、中央に位置する敵にミサイルを投下する。ミサイルは敵に範囲物理ダメージを与え、命中時に敵の現在高学年スキルのクールタイムを即時増加させる。ミサイルが爆発すると、自身の現在高学年スキルのクールタイムが即時減少する。"
        },
        "3": {
          "name": "私たちの平和な時間",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 4
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全体",
              "fixedValue": 22
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "幽霊",
      "role": "攻撃",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 16,
              "2": 16.5,
              "3": 17,
              "4": 17.5,
              "5": 18,
              "6": 18.5,
              "7": 19,
              "8": 19.5,
              "9": 20,
              "10": 20.5,
              "11": 21,
              "12": 21.5,
              "13": 22,
              "14": 22.5,
              "15": 23
            }
          },
          {
            "effectId": "Rim_low_e02",
            "valueKind": "物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 250,
              "2": 280,
              "3": 310,
              "4": 340,
              "5": 370,
              "6": 400,
              "7": 430,
              "8": 460,
              "9": 490,
              "10": 520,
              "11": 550,
              "12": 580,
              "13": 610,
              "14": 640,
              "15": 670
            }
          },
          {
            "effectId": "Rim_low_e03",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rim_low_e04",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵",
            "fixedValue": 10
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
              "1": 400,
              "2": 430,
              "3": 460,
              "4": 490,
              "5": 520,
              "6": 550,
              "7": 580,
              "8": 610,
              "9": 640,
              "10": 670,
              "11": 700,
              "12": 730,
              "13": 760,
              "14": 790,
              "15": 820
            }
          },
          {
            "effectId": "Rim_high_e02",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 600,
              "2": 630,
              "3": 660,
              "4": 690,
              "5": 720,
              "6": 750,
              "7": 780,
              "8": 810,
              "9": 840,
              "10": 870,
              "11": 900,
              "12": 930,
              "13": 960,
              "14": 990,
              "15": 1020
            }
          },
          {
            "effectId": "Rim_high_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 2
          },
          {
            "effectId": "Rim_high_e04",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最後の一撃与ダメージ量",
            "fixedValue": 250
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
        "cooldownSeconds": 56
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
              "1": 16,
              "2": 16.5,
              "3": 17,
              "4": 17.5,
              "5": 18,
              "6": 18.5,
              "7": 19,
              "8": 19.5,
              "9": 20,
              "10": 20.5,
              "11": 21,
              "12": 21.5,
              "13": 22,
              "14": 22.5,
              "15": 23
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
            "fixedValue": 100
          },
          {
            "effectId": "Rim_basic_e02",
            "valueKind": "苦痛",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵"
          },
          {
            "effectId": "Rim_basic_e03",
            "valueKind": "苦痛",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "effectTarget": "範囲内の敵",
            "fixedValue": 2
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "リカバリム",
          "stats": [],
          "effects": [
            {
              "valueKind": "物理攻撃力増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "苦痛付与敵に直接攻撃時",
              "effectTarget": "自身",
              "fixedValue": 15
            },
            {
              "valueKind": "物理攻撃力増加の持続時間",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "苦痛付与敵に直接攻撃時",
              "effectTarget": "自身",
              "fixedValue": 4
            },
            {
              "valueKind": "物理攻撃力増加の最大スタック数",
              "valueClass": "スタック数",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 4
            },
            {
              "valueKind": "低学年スキルダメージ増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 50
            },
            {
              "valueKind": "低学年HP回復量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "fixedValue": 100
            },
            {
              "valueKind": "高学年スキルダメージ増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 50
            }
          ],
          "description": "苦痛を付与された敵に直接ダメージを与えると物理攻撃力が増加する。物理攻撃力増加は、最大4回スタックする。低学年、高学年スキルのダメージが増加する。低学年のHP回復値が2倍になる。"
        },
        "3": {
          "name": "君たちの瞳に乾杯！",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "HP",
              "increaseP": 4
            },
            {
              "statApplyTo": "全体",
              "statName": "会心",
              "increaseP": 4
            }
          ],
          "effects": [
            {
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
      "rarity": 3,
      "personality": "活発",
      "race": "竜族",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.25
    },
    "statTypes": {
      "hp": 4,
      "atkP": 3,
      "atkM": 0,
      "defP": 5,
      "defM": 4,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
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
              "1": 160,
              "2": 175,
              "3": 190,
              "4": 205,
              "5": 220,
              "6": 235,
              "7": 250,
              "8": 265,
              "9": 280,
              "10": 295,
              "11": 310,
              "12": 325,
              "13": 340,
              "14": 355,
              "15": 370
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
              "1": 6,
              "2": 6.5,
              "3": 7,
              "4": 7.5,
              "5": 8,
              "6": 8.5,
              "7": 9,
              "8": 9.5,
              "9": 10,
              "10": 10.5,
              "11": 11,
              "12": 11.5,
              "13": 12,
              "14": 12.5,
              "15": 13
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
              "1": 6,
              "2": 6.5,
              "3": 7,
              "4": 7.5,
              "5": 8,
              "6": 8.5,
              "7": 9,
              "8": 9.5,
              "9": 10,
              "10": 10.5,
              "11": 11,
              "12": 11.5,
              "13": 12,
              "14": 12.5,
              "15": 13
            }
          },
          {
            "effectId": "Rudd_low_e06",
            "valueKind": "HP回復",
            "valueClass": "持続時間",
            "effectType": "回復",
            "effectTarget": "自身",
            "fixedValue": 3
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
              "1": 90,
              "2": 99,
              "3": 108,
              "4": 117,
              "5": 126,
              "6": 135,
              "7": 144,
              "8": 153,
              "9": 162,
              "10": 171,
              "11": 180,
              "12": 189,
              "13": 198,
              "14": 207,
              "15": 216
            }
          },
          {
            "effectId": "Rudd_high_e02",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 60,
              "2": 66,
              "3": 72,
              "4": 78,
              "5": 84,
              "6": 90,
              "7": 96,
              "8": 102,
              "9": 108,
              "10": 114,
              "11": 120,
              "12": 126,
              "13": 132,
              "14": 138,
              "15": 144
            }
          },
          {
            "effectId": "Rudd_high_e03",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "範囲内の敵",
            "fixedValue": 5
          },
          {
            "effectId": "Rudd_high_e04",
            "valueKind": "HP回復量",
            "valueClass": "倍率",
            "effectType": "回復",
            "effectTarget": "自身",
            "reference": "最大HP",
            "levels": {
              "1": 12,
              "2": 13,
              "3": 14,
              "4": 15,
              "5": 16,
              "6": 17,
              "7": 18,
              "8": 19,
              "9": 20,
              "10": 21,
              "11": 22,
              "12": 23,
              "13": 24,
              "14": 25,
              "15": 26
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
            "fixedValue": 2
          }
        ],
        "skillId": "Rudd_high",
        "skillType": "高学年",
        "skillName": "インパクトプレス",
        "description": "地面を強く5回叩きつけ、敵に範囲物理ダメージを与える。 最後の一撃はより高い範囲物理ダメージを与える。 最後の一撃時に自身のHPを回復する。 ノックバックさせる。 気絶を付与する。",
        "cooldownSeconds": 18
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
              "1": 24,
              "2": 26,
              "3": 28,
              "4": 30,
              "5": 32,
              "6": 34,
              "7": 36,
              "8": 38,
              "9": 40,
              "10": 42,
              "11": 44,
              "12": 46,
              "13": 48,
              "14": 50,
              "15": 52
            }
          },
          {
            "effectId": "Rudd_passive_e02",
            "valueKind": "発動条件",
            "valueClass": "被弾回数",
            "effectType": "条件",
            "effectTarget": "自身",
            "fixedValue": 6
          },
          {
            "effectId": "Rudd_passive_e03",
            "valueKind": "無敵",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "condition": "直接ダメージを6回受けた時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Rudd_passive_e04",
            "valueKind": "無敵",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "直接ダメージを6回受けた時",
            "effectTarget": "自身",
            "fixedValue": 2
          },
          {
            "effectId": "Rudd_passive_e05",
            "valueKind": "無敵",
            "valueClass": "クールタイム",
            "effectType": "バフ",
            "condition": "直接ダメージを6回受けた時",
            "effectTarget": "自身",
            "fixedValue": 15
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
            "fixedValue": 100
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
                "valueKind": "被ダメージ量減少",
                "valueClass": "倍率",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 4,
                "effectTarget": "自身",
                "fixedValue": 30
              },
              {
                "valueKind": "被ダメージ量減少",
                "valueClass": "持続時間",
                "effectType": "バフ",
                "triggerType": "n回ごと",
                "triggerValue": 4,
                "effectTarget": "自身",
                "fixedValue": 6
              },
              {
                "valueKind": "HP回復",
                "valueClass": "倍率",
                "effectType": "回復",
                "triggerType": "n回ごと",
                "triggerValue": 4,
                "effectTarget": "自身",
                "reference": "最大HP",
                "fixedValue": 20
              }
            ],
            "targetSkill": "普通攻撃_強化",
            "skillName": "強化",
            "description": "4回攻撃するごとにポーズを決める。ポーズを決めると一定時間、自身の被ダメージ量が減少する。ポーズが終わると、自身のHPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "HP",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ抵抗増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "HP",
              "increaseP": 12
            },
            {
              "statApplyTo": "本人",
              "statName": "物理防御力",
              "increaseP": 12
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法防御力",
              "increaseP": 12
            }
          ],
          "effects": []
        },
        "2": {
          "name": "たんぱく質補給",
          "stats": [],
          "effects": [
            {
              "valueKind": "最大HP増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身"
            },
            {
              "valueKind": "自分現在高学年クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 1
            },
            {
              "valueKind": "即時HP回復量",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "低学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 12,
                "2": 13,
                "3": 14,
                "4": 15,
                "5": 16,
                "6": 17,
                "7": 18,
                "8": 19,
                "9": 20,
                "10": 21,
                "11": 22,
                "12": 23,
                "13": 24,
                "14": 25,
                "15": 26
              }
            },
            {
              "valueKind": "毎秒HP回復量",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "低学年スキル使用時",
              "effectTarget": "自身",
              "targetSkill": "低学年スキル",
              "reference": "最大HP",
              "levels": {
                "1": 12,
                "2": 13,
                "3": 14,
                "4": 15,
                "5": 16,
                "6": 17,
                "7": 18,
                "8": 19,
                "9": 20,
                "10": 21,
                "11": 22,
                "12": 23,
                "13": 24,
                "14": 25,
                "15": 26
              }
            }
          ],
          "description": "最大HPが増加する。\n普通攻撃命中時に、現在高学年スキルのクールタイムが即時減少する。\n低学年スキルのHP回復割合が2倍になる。"
        },
        "3": {
          "name": "筋肉先発隊",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理防御力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "毎秒SP回復量",
              "valueClass": "固定値",
              "effectType": "バフ",
              "effectTarget": "味方/前列",
              "fixedValue": 4
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
      "rarity": 3,
      "personality": "活発",
      "race": "獣人",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.275
    },
    "statTypes": {
      "hp": 4,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 420,
              "2": 462,
              "3": 504,
              "4": 546,
              "5": 588,
              "6": 630,
              "7": 672,
              "8": 714,
              "9": 756,
              "10": 798,
              "11": 840,
              "12": 882
            }
          },
          {
            "effectId": "Rufo_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も後ろにいる敵",
            "fixedValue": 4
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
              "1": 350,
              "2": 385,
              "3": 420,
              "4": 455,
              "5": 490,
              "6": 525,
              "7": 560,
              "8": 595,
              "9": 630,
              "10": 665,
              "11": 700,
              "12": 735
            }
          },
          {
            "effectId": "Rufo_high_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "指定範囲内で最も後ろにいる敵/範囲内の敵",
            "fixedValue": 8
          },
          {
            "effectId": "Rufo_high_e03",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年スキルで回転時",
            "effectTarget": "自身",
            "fixedValue": 50
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
        "cooldownSeconds": 24
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
              "1": 24,
              "2": 28,
              "3": 32,
              "4": 36,
              "5": 40,
              "6": 44,
              "7": 48,
              "8": 52,
              "9": 56,
              "10": 60,
              "11": 64,
              "12": 68
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
            "fixedValue": 100
          },
          {
            "effectId": "Rufo_basic_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 2
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
            "fixedValue": 200
          },
          {
            "effectId": "Rufo_enhanced_e02",
            "valueKind": "目くらまし",
            "valueClass": "状態付与",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身"
          },
          {
            "effectId": "Rufo_enhanced_e03",
            "valueKind": "目くらまし",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "強化攻撃時",
            "effectTarget": "自身",
            "fixedValue": 4
          }
        ],
        "skillId": "Rufo_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で短剣を薙ぎ払って敵に物理ダメージを与える。 自身に目くらましを付与する。",
        "triggerType": "一定確率"
      }
    ],
    "favoriteCard": {},
    "aside": {
      "name": "ブレーンルポ",
      "levels": {
        "1": {
          "name": "反アニマル缶戦線の知識王",
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "物理攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "三銃士の大冒険",
          "stats": [],
          "effects": [
            {
              "valueKind": "普通攻撃ダメージ量増加(その他倍率)",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃",
              "fixedValue": 200
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "condition": "自身に目くらまし付与時",
              "effectTarget": "自身",
              "fixedValue": 75
            },
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "持続時間",
              "effectType": "バフ",
              "condition": "自身に目くらまし付与時",
              "effectTarget": "自身",
              "fixedValue": 6
            },
            {
              "valueKind": "クールタイム減少",
              "valueClass": "クールタイム",
              "effectType": "クールタイム",
              "condition": "自身に目くらまし付与時",
              "effectTarget": "自身",
              "targetSkill": "高学年スキル",
              "fixedValue": 4
            },
            {
              "valueKind": "初回普通攻撃強化",
              "valueClass": "スキル変更",
              "effectType": "パッシブ",
              "condition": "ウェーブ開始時",
              "effectTarget": "自身",
              "targetSkill": "普通攻撃"
            }
          ],
          "description": "普通攻撃の与ダメージが増加する。自身に目くらましが付与されると攻撃速度が増加し、高学年スキルのクールタイムが減少する。ウェーブ開始時、自身の最初の普通攻撃は強化攻撃で発動する。"
        },
        "3": {
          "name": "最高の戦友なのだ！",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "物理攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "会心ダメージ抵抗",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "攻撃速度増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "味方全員",
              "fixedValue": 7
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
      "rarity": 2,
      "personality": "冷静",
      "race": "エルフ",
      "role": "攻撃",
      "position": "後列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.31
    },
    "statTypes": {
      "hp": 3,
      "atkP": 4,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 200,
              "2": 220,
              "3": 240,
              "4": 260,
              "5": 280,
              "6": 300,
              "7": 320,
              "8": 340,
              "9": 360,
              "10": 380,
              "11": 400,
              "12": 420
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
              "1": 400,
              "2": 430,
              "3": 460,
              "4": 490,
              "5": 520,
              "6": 550,
              "7": 580,
              "8": 610,
              "9": 640,
              "10": 670,
              "11": 700,
              "12": 730
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
            "fixedValue": 6
          }
        ],
        "skillId": "Layze_high",
        "skillType": "高学年",
        "skillName": "XG-MK2 レーザー",
        "description": "強力なレーザーをチャージして発射し、直線範囲の対象に範囲物理ダメージを与える。 感電を付与する。",
        "cooldownSeconds": 32
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
              "1": 25,
              "2": 30,
              "3": 35,
              "4": 40,
              "5": 45,
              "6": 50,
              "7": 55,
              "8": 60,
              "9": 65,
              "10": 70,
              "11": 75,
              "12": 80
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
            "fixedValue": 80
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
      "rarity": 3,
      "personality": "憂鬱",
      "race": "魔女",
      "role": "攻撃",
      "position": "中列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 37,
      "combatPowerCorrectionA": 130,
      "combatPowerCorrectionB": 0.225
    },
    "statTypes": {
      "hp": 4,
      "atkP": 3,
      "atkM": 0,
      "defP": 3,
      "defM": 3,
      "crit": 5,
      "critDmg": 5,
      "critRes": 3,
      "critDmgRes": 3
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
              "1": 240,
              "2": 270,
              "3": 300,
              "4": 330,
              "5": 360,
              "6": 390,
              "7": 420,
              "8": 450,
              "9": 480,
              "10": 510,
              "11": 540,
              "12": 570
            }
          },
          {
            "effectId": "Levi_low_e02",
            "valueKind": "ヒット数",
            "valueClass": "ヒット数",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "fixedValue": 3
          },
          {
            "effectId": "Levi_low_e03",
            "valueKind": "最後の一撃物理ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "effectTarget": "敵",
            "levels": {
              "1": 160,
              "2": 180,
              "3": 200,
              "4": 220,
              "5": 240,
              "6": 260,
              "7": 280,
              "8": 300,
              "9": 320,
              "10": 340,
              "11": 360,
              "12": 380
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
              "1": 420,
              "2": 460,
              "3": 500,
              "4": 540,
              "5": 580,
              "6": 620,
              "7": 660,
              "8": 700,
              "9": 740,
              "10": 780,
              "11": 820,
              "12": 860
            }
          }
        ],
        "skillId": "Levi_high",
        "skillType": "高学年",
        "skillName": "レヴィ・ザ・レッド",
        "description": "切り札の長刀を一瞬で抜刀し、素早くダッシュして敵に範囲物理ダメージを与える。",
        "cooldownSeconds": 18
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
              "1": 30,
              "2": 33,
              "3": 36,
              "4": 39,
              "5": 42,
              "6": 45,
              "7": 48,
              "8": 51,
              "9": 54,
              "10": 57,
              "11": 60,
              "12": 63
            }
          },
          {
            "effectId": "Levi_passive_e02",
            "valueKind": "攻撃速度増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "高学年使用後",
            "effectTarget": "自身",
            "levels": {
              "1": 40,
              "2": 43,
              "3": 46,
              "4": 49,
              "5": 52,
              "6": 55,
              "7": 58,
              "8": 61,
              "9": 64,
              "10": 67,
              "11": 70,
              "12": 73
            }
          },
          {
            "effectId": "Levi_passive_e03",
            "valueKind": "攻撃速度増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "高学年使用後",
            "effectTarget": "自身",
            "fixedValue": 6
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
            "fixedValue": 100
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
      "rarity": 3,
      "personality": "純粋",
      "race": "エルフ",
      "role": "守備",
      "position": "前列",
      "attackType": "物理",
      "initialSp": 0,
      "spRecoveryPerSecond": 50,
      "combatPowerCorrectionA": 90,
      "combatPowerCorrectionB": 0.22
    },
    "statTypes": {
      "hp": 5,
      "atkP": 1,
      "atkM": 0,
      "defP": 5,
      "defM": 5,
      "crit": 3,
      "critDmg": 3,
      "critRes": 4,
      "critDmgRes": 4
    },
    "skills": [
      {
        "effects": [
          {
            "effectId": "Rohne_low_e01",
            "valueKind": "攻撃力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方1体",
            "levels": {
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Rohne_low_e02",
            "valueKind": "攻撃力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方1体",
            "fixedValue": 8
          },
          {
            "effectId": "Rohne_low_e03",
            "valueKind": "防御力増加",
            "valueClass": "倍率",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方3体",
            "levels": {
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
            }
          },
          {
            "effectId": "Rohne_low_e04",
            "valueKind": "防御力増加",
            "valueClass": "持続時間",
            "effectType": "バフ",
            "condition": "低学年使用時",
            "effectTarget": "最も攻撃力が高い味方3体",
            "fixedValue": 6
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
            "fixedValue": 6
          },
          {
            "effectId": "Rohne_high_e03",
            "valueKind": "攻撃力減少",
            "valueClass": "倍率",
            "effectType": "デバフ",
            "effectTarget": "周囲の最も攻撃力が高い敵2体",
            "levels": {
              "1": 10,
              "2": 11,
              "3": 12,
              "4": 13,
              "5": 14,
              "6": 15,
              "7": 16,
              "8": 17,
              "9": 18,
              "10": 19,
              "11": 20,
              "12": 21
            }
          },
          {
            "effectId": "Rohne_high_e04",
            "valueKind": "攻撃力減少",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectTarget": "周囲の最も攻撃力が高い敵2体",
            "fixedValue": 6
          }
        ],
        "skillId": "Rohne_high",
        "skillType": "高学年",
        "skillName": "降参！降参だってば……",
        "description": "周囲の最も攻撃力が高い敵2体を挑発する。 攻撃力を減少させる。",
        "cooldownSeconds": 18
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
              "1": 20,
              "2": 22,
              "3": 24,
              "4": 26,
              "5": 28,
              "6": 30,
              "7": 32,
              "8": 34,
              "9": 36,
              "10": 38,
              "11": 40,
              "12": 42
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
            "fixedValue": 150
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
            "fixedValue": 150
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
            "fixedValue": 2
          }
        ],
        "skillId": "Rohne_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で本気の攻撃を行い、敵に物理ダメージを与える。 気絶を付与する。",
        "triggerType": "一定確率"
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
      "rarity": 3,
      "personality": "狂気",
      "race": "魔女",
      "role": "攻撃",
      "position": "後列",
      "attackType": "魔法",
      "initialSp": 100,
      "spRecoveryPerSecond": 30,
      "combatPowerCorrectionA": 120,
      "combatPowerCorrectionB": 0.35
    },
    "statTypes": {
      "hp": 3,
      "atkP": 0,
      "atkM": 4,
      "defP": 3,
      "defM": 3,
      "crit": 4,
      "critDmg": 4,
      "critRes": 2,
      "critDmgRes": 2
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
              "1": 250,
              "2": 275,
              "3": 300,
              "4": 325,
              "5": 350,
              "6": 375,
              "7": 400,
              "8": 425,
              "9": 450,
              "10": 475,
              "11": 500,
              "12": 525,
              "13": 550,
              "14": 575,
              "15": 600
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
            "valueKind": "魔法ダメージ",
            "valueClass": "倍率",
            "effectType": "攻撃",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "範囲内の敵",
            "levels": {
              "1": 360,
              "2": 393,
              "3": 426,
              "4": 459,
              "5": 492,
              "6": 525,
              "7": 558,
              "8": 591,
              "9": 624,
              "10": 657,
              "11": 690,
              "12": 723,
              "13": 756,
              "14": 789,
              "15": 822
            }
          },
          {
            "effectId": "Rollett_high_e02",
            "valueKind": "魔法ダメージ",
            "valueClass": "最大対象数",
            "effectType": "対象制限",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "範囲内の敵",
            "fixedValue": 6
          },
          {
            "effectId": "Rollett_high_e03",
            "valueKind": "好奇心",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "箱通過",
            "effectTarget": "敵"
          },
          {
            "effectId": "Rollett_high_e04",
            "valueKind": "好奇心",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "箱通過",
            "effectTarget": "敵",
            "fixedValue": 4
          },
          {
            "effectId": "Rollett_high_e05",
            "valueKind": "気絶",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "敵"
          },
          {
            "effectId": "Rollett_high_e06",
            "valueKind": "気絶",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "敵",
            "fixedValue": 3
          },
          {
            "effectId": "Rollett_high_e07",
            "valueKind": "気絶",
            "valueClass": "最大対象数",
            "effectType": "対象制限",
            "condition": "箱到着時（爆発時）",
            "effectTarget": "範囲内の敵",
            "fixedValue": 6
          }
        ],
        "skillId": "Rollett_high",
        "skillType": "高学年",
        "skillName": "観客を魅了するトリックスター",
        "description": "箱を取り出して指定範囲内で最も遠い敵に届ける。 箱は通り過ぎながら周囲の敵に好奇心を付与する。 箱が目標地点に到着すると、爆発し、範囲魔法ダメージを与え、気絶を付与する。気絶とダメージは最大6名に適用される。",
        "cooldownSeconds": 32
      },
      {
        "effects": [
          {
            "effectId": "Rollett_passive_e01",
            "valueKind": "味方現在高学年クールタイム減少",
            "valueClass": "クールタイム",
            "effectType": "クールタイム",
            "condition": "低学年スキル発動時（鳩の復活マジックを披露時）",
            "effectTarget": "ランダムな味方1名（自身以外）",
            "levels": {
              "1": 2,
              "2": 2.5,
              "3": 3,
              "4": 3.5,
              "5": 4,
              "6": 4.5,
              "7": 5,
              "8": 5.5,
              "9": 6,
              "10": 6.5,
              "11": 7,
              "12": 7.5,
              "13": 8,
              "14": 8.5,
              "15": 9
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
            "fixedValue": 90
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
            "fixedValue": 120
          },
          {
            "effectId": "Rollett_enhanced_e02",
            "valueKind": "火傷",
            "valueClass": "状態付与",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9
          },
          {
            "effectId": "Rollett_enhanced_e03",
            "valueKind": "火傷",
            "valueClass": "持続時間",
            "effectType": "デバフ",
            "effectStack": true,
            "maxStack": 9,
            "fixedValue": 4
          }
        ],
        "skillId": "Rollett_enhanced",
        "skillType": "普通攻撃_強化",
        "skillName": "強化",
        "description": "一定確率で、指定範囲内で最も遠い敵に火の玉を飛ばして、範囲魔法ダメージを与え、火傷を付与する。",
        "triggerType": "一定確率"
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
                "valueKind": "総魔法ダメージ",
                "effectType": "攻撃",
                "effectTarget": "範囲内の敵",
                "levels": {
                  "1": 750,
                  "2": 825,
                  "3": 900,
                  "4": 975,
                  "5": 1050,
                  "6": 1125,
                  "7": 1200,
                  "8": 1275,
                  "9": 1350,
                  "10": 1425,
                  "11": 1500,
                  "12": 1575,
                  "13": 1650,
                  "14": 1725,
                  "15": 1800
                },
                "valueClass": "倍率"
              },
              {
                "valueKind": "SP回復量",
                "valueClass": "固定値",
                "effectType": "回復",
                "condition": "低学年スキル発動時（鳩の復活マジックを披露時）",
                "effectTarget": "自身",
                "fixedValue": 100
              }
            ],
            "targetSkill": "低学年",
            "skillName": "歓声を浴びるエンターテイナー",
            "description": "鳩を3体飛ばした後、鳩の復活マジックを披露する。鳩は指定範囲内で最も遠い敵に飛んでいき、範囲魔法ダメージを与える。\n鳩の復活マジックを披露すると、自身のSPを回復する。"
          }
        ],
        "3": [
          {
            "effects": [
              {
                "valueKind": "魔法攻撃力増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              },
              {
                "valueKind": "会心ダメージ増加",
                "valueClass": "倍率",
                "effectType": "バフ",
                "effectTarget": "自身",
                "fixedValue": 9
              }
            ],
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
          "stats": [
            {
              "statApplyTo": "本人",
              "statName": "最大HP",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "魔法攻撃力",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心",
              "increaseP": 6
            },
            {
              "statApplyTo": "本人",
              "statName": "会心ダメージ",
              "increaseP": 6
            }
          ],
          "effects": []
        },
        "2": {
          "name": "舞台を掌握するイリュージョニスト",
          "stats": [],
          "effects": [
            {
              "valueKind": "スキルダメージ量増加",
              "valueClass": "倍率",
              "effectType": "バフ",
              "effectTarget": "自身",
              "fixedValue": 50
            },
            {
              "valueKind": "自身のSPを回復",
              "valueClass": "倍率",
              "effectType": "回復",
              "condition": "ウェーブ開始時",
              "effectTarget": "自身",
              "fixedValue": 100
            },
            {
              "valueKind": "変異",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵2体/ランダム",
              "targetSkill": "低学年スキル"
            },
            {
              "valueKind": "変異",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵2体/ランダム",
              "targetSkill": "低学年スキル",
              "fixedValue": 3
            },
            {
              "valueKind": "毎秒SP回復中断",
              "valueClass": "状態付与",
              "effectType": "デバフ",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル"
            },
            {
              "valueKind": "毎秒SP回復中断",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 10
            },
            {
              "valueKind": "攻撃力減少",
              "valueClass": "倍率",
              "effectType": "デバフ",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 30
            },
            {
              "valueKind": "攻撃力減少",
              "valueClass": "持続時間",
              "effectType": "デバフ",
              "condition": "低学年スキルが命中時/ランダム発動",
              "effectTarget": "低学年スキルが命中した敵",
              "targetSkill": "低学年スキル",
              "fixedValue": 10
            }
          ],
          "description": "スキルダメージ量が増加する。\nウェーブ開始時、自身のSPを回復する。\n低学年スキルが命中した敵へ以下の効果のうち一つを発動する。\n- ランダムな敵2体に変異を付与する。\n- 1秒ごとのSP回復を中断させる。\n- 攻撃力を減少させる。"
        },
        "3": {
          "name": "フィナーレ",
          "stats": [
            {
              "statApplyTo": "全体",
              "statName": "魔法攻撃力",
              "increaseP": 3
            },
            {
              "statApplyTo": "全体",
              "statName": "魔法防御力",
              "increaseP": 3
            }
          ],
          "effects": [
            {
              "valueKind": "与ダメージ量増加",
              "valueClass": "与ダメージ量増加",
              "effectType": "倍率",
              "effectTarget": "味方/後列",
              "fixedValue": 13.6
            },
            {
              "valueKind": "被ダメージ量減少",
              "valueClass": "被ダメージ量減少",
              "effectType": "倍率",
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
