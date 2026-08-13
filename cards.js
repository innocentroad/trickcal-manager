// Trickcal Damage Calculator - Card Data (generated from datasheet)
// Edit tools/trickcal_datasheet.xlsx and rebuild with tools/generate-card-data.py.

const CARD_LIBRARY = {
    "artifacts": [
        {
            "id": "artifact_yomi_moonflower",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ヨミの向月葵の花",
            "signature": true,
            "favoriteCharacter": "ヨミ",
            "cost": 26,
            "bonusesByStar": [
                {
                    "critDmgP": 11.2,
                    "critRateP": 21
                },
                {
                    "critDmgP": 14,
                    "critRateP": 26.3
                },
                {
                    "critDmgP": 16.8,
                    "critRateP": 31.6
                },
                {
                    "critDmgP": 19.6,
                    "critRateP": 36.8
                },
                {
                    "critDmgP": 22.4,
                    "critRateP": 42.1
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_yomi_moonflower_e01",
                    "type": "toggle",
                    "label": "戦闘開始時 被ダメージ減少",
                    "shortLabel": "被ダメージ減少",
                    "valueClass": "倍率",
                    "description": "同列 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少11.5% (戦闘開始時 / 同列)",
                        "被ダメージ減少13.5% (戦闘開始時 / 同列)",
                        "被ダメージ減少15.5% (戦闘開始時 / 同列)",
                        "被ダメージ減少17.5% (戦闘開始時 / 同列)",
                        "被ダメージ減少19.5% (戦闘開始時 / 同列)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 11.5
                        },
                        {
                            "takenDmgP": 13.5
                        },
                        {
                            "takenDmgP": 15.5
                        },
                        {
                            "takenDmgP": 17.5
                        },
                        {
                            "takenDmgP": 19.5
                        }
                    ]
                },
                {
                    "id": "artifact_yomi_moonflower_e02",
                    "type": "toggle",
                    "label": "戦闘開始時 魔法 攻撃力増加",
                    "shortLabel": "魔法 攻撃力増加",
                    "valueClass": "倍率",
                    "onlyWhenDmgType": "mag",
                    "description": "同列 / 倍率",
                    "descriptionByStar": [
                        "攻撃力増加11.5% (戦闘開始時 / 同列)",
                        "攻撃力増加13.5% (戦闘開始時 / 同列)",
                        "攻撃力増加15.5% (戦闘開始時 / 同列)",
                        "攻撃力増加17.5% (戦闘開始時 / 同列)",
                        "攻撃力増加19.5% (戦闘開始時 / 同列)"
                    ],
                    "bonusesByStar": [
                        {
                            "atkP": 11.5
                        },
                        {
                            "atkP": 13.5
                        },
                        {
                            "atkP": 15.5
                        },
                        {
                            "atkP": 17.5
                        },
                        {
                            "atkP": 19.5
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_erpin_ice_cream_cake",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "エルフィンのアイスケーキ",
            "signature": true,
            "favoriteCharacter": "エルフィン",
            "cost": 19,
            "bonusesByStar": [
                {
                    "atkP": 14.9,
                    "hpP": 19.9
                },
                {
                    "atkP": 18.7,
                    "hpP": 24.9
                },
                {
                    "atkP": 22.4,
                    "hpP": 29.8
                },
                {
                    "atkP": 26.1,
                    "hpP": 34.8
                },
                {
                    "atkP": 29.8,
                    "hpP": 39.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_erpin_ice_cream_cake_e01",
                    "type": "toggle",
                    "label": "敵を1体も倒していない時 魔法ダメージ 魔法 与ダメージ増加",
                    "shortLabel": "魔法 与ダメージ増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "onlyWhenDmgType": "mag",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加40% (敵を1体も倒していない時 / 自分)",
                        "与ダメージ増加47% (敵を1体も倒していない時 / 自分)",
                        "与ダメージ増加54% (敵を1体も倒していない時 / 自分)",
                        "与ダメージ増加61% (敵を1体も倒していない時 / 自分)",
                        "与ダメージ増加68% (敵を1体も倒していない時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 40
                        },
                        {
                            "addP": 47
                        },
                        {
                            "addP": 54
                        },
                        {
                            "addP": 61
                        },
                        {
                            "addP": 68
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_butter_yellow_card",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "バターのイエローカード",
            "signature": true,
            "favoriteCharacter": "バター",
            "cost": 22,
            "bonusesByStar": [
                {
                    "atkP": 17.5,
                    "hasteP": 14
                },
                {
                    "atkP": 21.9,
                    "hasteP": 17.5
                },
                {
                    "atkP": 26.3,
                    "hasteP": 21
                },
                {
                    "atkP": 30.6,
                    "hasteP": 24.5
                },
                {
                    "atkP": 35,
                    "hasteP": 28
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_butter_yellow_card_e01",
                    "type": "toggle",
                    "label": "強化攻撃ダメージ 強化攻撃 与ダメージ増加",
                    "shortLabel": "強化攻撃 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加40% (強化攻撃ダメージ / 自分)",
                        "与ダメージ増加46.5% (強化攻撃ダメージ / 自分)",
                        "与ダメージ増加53% (強化攻撃ダメージ / 自分)",
                        "与ダメージ増加59.5% (強化攻撃ダメージ / 自分)",
                        "与ダメージ増加66% (強化攻撃ダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 40
                        },
                        {
                            "addP": 46.5
                        },
                        {
                            "addP": 53
                        },
                        {
                            "addP": 59.5
                        },
                        {
                            "addP": 66
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_vivi_silver_staff",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ヴィヴィの銀色の指揮棒",
            "signature": true,
            "favoriteCharacter": "ヴィヴィ",
            "cost": 24,
            "bonusesByStar": [
                {
                    "critDmgResP": 6.4,
                    "hpP": 25.7
                },
                {
                    "critDmgResP": 8,
                    "hpP": 32.1
                },
                {
                    "critDmgResP": 9.6,
                    "hpP": 38.5
                },
                {
                    "critDmgResP": 11.2,
                    "hpP": 44.9
                },
                {
                    "critDmgResP": 12.8,
                    "hpP": 51.4
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_vivi_silver_staff_e01",
                    "type": "toggle",
                    "label": "普通攻撃1回ごとに 防御力増加",
                    "shortLabel": "防御力増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "防御力増加1% (普通攻撃1回ごとに / 自分)",
                        "防御力増加1.2% (普通攻撃1回ごとに / 自分)",
                        "防御力増加1.4% (普通攻撃1回ごとに / 自分)",
                        "防御力増加1.6% (普通攻撃1回ごとに / 自分)",
                        "防御力増加1.8% (普通攻撃1回ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "defP": 1
                        },
                        {
                            "defP": 1.2
                        },
                        {
                            "defP": 1.4
                        },
                        {
                            "defP": 1.6
                        },
                        {
                            "defP": 1.8
                        }
                    ]
                },
                {
                    "id": "artifact_vivi_silver_staff_e02",
                    "type": "toggle",
                    "label": "最大スタック数",
                    "valueClass": "スタック数",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / スタック数",
                    "descriptionByStar": [
                        "最大スタック数20 (自分)",
                        "最大スタック数20 (自分)",
                        "最大スタック数20 (自分)",
                        "最大スタック数20 (自分)",
                        "最大スタック数20 (自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "maxStack": 20
                        },
                        {
                            "maxStack": 20
                        },
                        {
                            "maxStack": 20
                        },
                        {
                            "maxStack": 20
                        },
                        {
                            "maxStack": 20
                        }
                    ]
                },
                {
                    "id": "artifact_vivi_silver_staff_e03",
                    "type": "toggle",
                    "label": "普通攻撃スタック最大時 防御力増加",
                    "shortLabel": "防御力増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "防御力増加20% (普通攻撃スタック最大時 / 自分)",
                        "防御力増加24% (普通攻撃スタック最大時 / 自分)",
                        "防御力増加28% (普通攻撃スタック最大時 / 自分)",
                        "防御力増加32% (普通攻撃スタック最大時 / 自分)",
                        "防御力増加36% (普通攻撃スタック最大時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "defP": 20
                        },
                        {
                            "defP": 24
                        },
                        {
                            "defP": 28
                        },
                        {
                            "defP": 32
                        },
                        {
                            "defP": 36
                        }
                    ]
                },
                {
                    "id": "artifact_vivi_silver_staff_e04",
                    "type": "toggle",
                    "label": "普通攻撃スタック最大時 最大HP増加",
                    "shortLabel": "最大HP増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "最大HP増加20% (普通攻撃スタック最大時 / 自分)",
                        "最大HP増加20% (普通攻撃スタック最大時 / 自分)",
                        "最大HP増加20% (普通攻撃スタック最大時 / 自分)",
                        "最大HP増加20% (普通攻撃スタック最大時 / 自分)",
                        "最大HP増加20% (普通攻撃スタック最大時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpP": 20
                        },
                        {
                            "hpP": 20
                        },
                        {
                            "hpP": 20
                        },
                        {
                            "hpP": 20
                        },
                        {
                            "hpP": 20
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_elena_enhanced_drone",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "エレナの強化ドローン",
            "signature": true,
            "favoriteCharacter": "エレナ",
            "cost": 21,
            "bonusesByStar": [
                {
                    "atkP": 13.3,
                    "hpP": 16.6
                },
                {
                    "atkP": 16.7,
                    "hpP": 20.8
                },
                {
                    "atkP": 20,
                    "hpP": 25
                },
                {
                    "atkP": 23.3,
                    "hpP": 29.1
                },
                {
                    "atkP": 26.6,
                    "hpP": 33.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_elena_enhanced_drone_e01",
                    "type": "toggle",
                    "label": "低学年スキル使用時 攻撃速度",
                    "shortLabel": "攻撃速度",
                    "valueClass": "倍率",
                    "duration": "6",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 持続:6 / 倍率",
                    "descriptionByStar": [
                        "攻撃速度6% (低学年スキル使用時 / 自分)",
                        "攻撃速度6.6% (低学年スキル使用時 / 自分)",
                        "攻撃速度7.2% (低学年スキル使用時 / 自分)",
                        "攻撃速度7.8% (低学年スキル使用時 / 自分)",
                        "攻撃速度8.4% (低学年スキル使用時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hasteP": 6
                        },
                        {
                            "hasteP": 6.6
                        },
                        {
                            "hasteP": 7.2
                        },
                        {
                            "hasteP": 7.8
                        },
                        {
                            "hasteP": 8.4
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_leets_worn_whetstone",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "リッツのすり減った砥石",
            "signature": true,
            "favoriteCharacter": "リッツ",
            "cost": 23,
            "bonusesByStar": [
                {
                    "defP": 18.4,
                    "hpP": 18.4
                },
                {
                    "defP": 23,
                    "hpP": 23
                },
                {
                    "defP": 27.6,
                    "hpP": 27.6
                },
                {
                    "defP": 32.2,
                    "hpP": 32.2
                },
                {
                    "defP": 36.8,
                    "hpP": 36.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_leets_worn_whetstone_e01",
                    "type": "toggle",
                    "label": "被普通攻撃時 被ダメージ減少",
                    "shortLabel": "被ダメージ減少",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少40% (被普通攻撃時 / 自分)",
                        "被ダメージ減少40% (被普通攻撃時 / 自分)",
                        "被ダメージ減少40% (被普通攻撃時 / 自分)",
                        "被ダメージ減少40% (被普通攻撃時 / 自分)",
                        "被ダメージ減少40% (被普通攻撃時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 40
                        },
                        {
                            "takenDmgP": 40
                        },
                        {
                            "takenDmgP": 40
                        },
                        {
                            "takenDmgP": 40
                        },
                        {
                            "takenDmgP": 40
                        }
                    ]
                },
                {
                    "id": "artifact_leets_worn_whetstone_e02",
                    "type": "toggle",
                    "label": "基本攻撃が2回命中するたび HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 参照:最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復15% (基本攻撃が2回命中するたび / 自分)",
                        "HP回復16.5% (基本攻撃が2回命中するたび / 自分)",
                        "HP回復18% (基本攻撃が2回命中するたび / 自分)",
                        "HP回復19.5% (基本攻撃が2回命中するたび / 自分)",
                        "HP回復21% (基本攻撃が2回命中するたび / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 15
                        },
                        {
                            "hpRecoveryP": 16.5
                        },
                        {
                            "hpRecoveryP": 18
                        },
                        {
                            "hpRecoveryP": 19.5
                        },
                        {
                            "hpRecoveryP": 21
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_blanchet_bouquet",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ブランセの花束",
            "signature": true,
            "favoriteCharacter": "ブランセ",
            "cost": 16,
            "bonusesByStar": [
                {
                    "critDmgP": 4.1,
                    "critRateP": 6.6
                },
                {
                    "critDmgP": 5.2,
                    "critRateP": 8.3
                },
                {
                    "critDmgP": 6.2,
                    "critRateP": 9.9
                },
                {
                    "critDmgP": 7.2,
                    "critRateP": 11.6
                },
                {
                    "critDmgP": 8.2,
                    "critRateP": 13.2
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_blanchet_bouquet_e01",
                    "type": "toggle",
                    "label": "低学年スキルが敵に命中するたび 魔法 敵防御力減少",
                    "shortLabel": "魔法 敵防御力減少",
                    "valueClass": "倍率",
                    "duration": "8",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "onlyWhenDmgType": "mag",
                    "description": "敵 / 持続:8 / 倍率",
                    "descriptionByStar": [
                        "敵防御力減少3% (低学年スキルが敵に命中するたび / 敵)",
                        "敵防御力減少3.5% (低学年スキルが敵に命中するたび / 敵)",
                        "敵防御力減少4% (低学年スキルが敵に命中するたび / 敵)",
                        "敵防御力減少4.5% (低学年スキルが敵に命中するたび / 敵)",
                        "敵防御力減少5% (低学年スキルが敵に命中するたび / 敵)"
                    ],
                    "bonusesByStar": [
                        {
                            "enemyDefDownP": 3
                        },
                        {
                            "enemyDefDownP": 3.5
                        },
                        {
                            "enemyDefDownP": 4
                        },
                        {
                            "enemyDefDownP": 4.5
                        },
                        {
                            "enemyDefDownP": 5
                        }
                    ]
                },
                {
                    "id": "artifact_blanchet_bouquet_e02",
                    "type": "toggle",
                    "label": "最大スタック数",
                    "valueClass": "スタック数",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "敵 / スタック数",
                    "descriptionByStar": [
                        "最大スタック数9 (敵)",
                        "最大スタック数9 (敵)",
                        "最大スタック数9 (敵)",
                        "最大スタック数9 (敵)",
                        "最大スタック数9 (敵)"
                    ],
                    "bonusesByStar": [
                        {
                            "maxStack": 9
                        },
                        {
                            "maxStack": 9
                        },
                        {
                            "maxStack": 9
                        },
                        {
                            "maxStack": 9
                        },
                        {
                            "maxStack": 9
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_picora_fashion_pouch",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ピコラのファッションポーチ",
            "signature": true,
            "favoriteCharacter": "ピコラ",
            "cost": 23,
            "bonusesByStar": [
                {
                    "atkP": 18.4,
                    "healingP": 14.7
                },
                {
                    "atkP": 23,
                    "healingP": 18.4
                },
                {
                    "atkP": 27.6,
                    "healingP": 22.1
                },
                {
                    "atkP": 32.2,
                    "healingP": 25.7
                },
                {
                    "atkP": 36.8,
                    "healingP": 29.4
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_picora_fashion_pouch_e01",
                    "type": "toggle",
                    "label": "対象を回復させた場合（カード効果を除く） 防御力増加",
                    "shortLabel": "防御力増加",
                    "valueClass": "倍率",
                    "duration": "6",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "対象の味方 / 持続:6 / 倍率",
                    "descriptionByStar": [
                        "防御力増加8% (対象を回復させた場合（カード効果を除く） / 対象の味方)",
                        "防御力増加10% (対象を回復させた場合（カード効果を除く） / 対象の味方)",
                        "防御力増加12% (対象を回復させた場合（カード効果を除く） / 対象の味方)",
                        "防御力増加14% (対象を回復させた場合（カード効果を除く） / 対象の味方)",
                        "防御力増加16% (対象を回復させた場合（カード効果を除く） / 対象の味方)"
                    ],
                    "bonusesByStar": [
                        {
                            "defP": 8
                        },
                        {
                            "defP": 10
                        },
                        {
                            "defP": 12
                        },
                        {
                            "defP": 14
                        },
                        {
                            "defP": 16
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_xion_black_cape",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "シオンの黒マント",
            "signature": true,
            "favoriteCharacter": "シオン・ザ・DB",
            "cost": 25,
            "bonusesByStar": [
                {
                    "atkP": 16.6,
                    "critRateP": 9.9
                },
                {
                    "atkP": 22.2,
                    "critRateP": 12.9
                },
                {
                    "atkP": 28.2,
                    "critRateP": 15.9
                },
                {
                    "atkP": 36.5,
                    "critRateP": 18.9
                },
                {
                    "atkP": 44.4,
                    "critRateP": 22.2
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_xion_black_cape_e01",
                    "type": "toggle",
                    "label": "敵が1体しかいない場合 与ダメージ増加",
                    "shortLabel": "与ダメージ増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加44% (敵が1体しかいない場合 / 自分)",
                        "与ダメージ増加49.5% (敵が1体しかいない場合 / 自分)",
                        "与ダメージ増加55% (敵が1体しかいない場合 / 自分)",
                        "与ダメージ増加60.5% (敵が1体しかいない場合 / 自分)",
                        "与ダメージ増加66% (敵が1体しかいない場合 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 44
                        },
                        {
                            "addP": 49.5
                        },
                        {
                            "addP": 55
                        },
                        {
                            "addP": 60.5
                        },
                        {
                            "addP": 66
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_naia_dolphin_watergun",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ナイアのイルカ水鉄砲",
            "signature": true,
            "favoriteCharacter": "ナイア",
            "cost": 19,
            "bonusesByStar": [
                {
                    "defP": 14.9,
                    "hpP": 19.9
                },
                {
                    "defP": 18.7,
                    "hpP": 24.9
                },
                {
                    "defP": 22.4,
                    "hpP": 29.8
                },
                {
                    "defP": 26.1,
                    "hpP": 34.8
                },
                {
                    "defP": 29.8,
                    "hpP": 39.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_naia_dolphin_watergun_e01",
                    "type": "toggle",
                    "label": "スキル使用時 着用者のHP治癒量",
                    "shortLabel": "着用者のHP治癒量",
                    "valueClass": "倍率",
                    "duration": "8",
                    "description": "自分 / 持続:8 / 倍率",
                    "descriptionByStar": [
                        "着用者のHP治癒量36% (スキル使用時 / 自分)",
                        "着用者のHP治癒量45% (スキル使用時 / 自分)",
                        "着用者のHP治癒量54% (スキル使用時 / 自分)",
                        "着用者のHP治癒量63% (スキル使用時 / 自分)",
                        "着用者のHP治癒量72% (スキル使用時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "healingP": 36
                        },
                        {
                            "healingP": 45
                        },
                        {
                            "healingP": 54
                        },
                        {
                            "healingP": 63
                        },
                        {
                            "healingP": 72
                        }
                    ]
                },
                {
                    "id": "artifact_naia_dolphin_watergun_e02",
                    "type": "toggle",
                    "label": "クールタイム",
                    "valueClass": "クールタイム",
                    "description": "自分 / クールタイム",
                    "descriptionByStar": [
                        "クールタイム12 (自分)",
                        "クールタイム12 (自分)",
                        "クールタイム12 (自分)",
                        "クールタイム12 (自分)",
                        "クールタイム12 (自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "cooltime": 12
                        },
                        {
                            "cooltime": 12
                        },
                        {
                            "cooltime": 12
                        },
                        {
                            "cooltime": 12
                        },
                        {
                            "cooltime": 12
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_shoupan_magical_backpack",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "シュパンの魔法リュック",
            "signature": true,
            "favoriteCharacter": "シュパン",
            "cost": 24,
            "bonusesByStar": [
                {
                    "atkP": 19.3,
                    "hpP": 25.7
                },
                {
                    "atkP": 24.1,
                    "hpP": 32.1
                },
                {
                    "atkP": 28.9,
                    "hpP": 38.5
                },
                {
                    "atkP": 33.7,
                    "hpP": 44.9
                },
                {
                    "atkP": 38.5,
                    "hpP": 51.4
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_shoupan_magical_backpack_e01",
                    "type": "toggle",
                    "label": "普通攻撃2回ごとに 被ダメージ減少",
                    "shortLabel": "被ダメージ減少",
                    "valueClass": "倍率",
                    "duration": "6",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "同列 / 持続:6 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少12% (普通攻撃2回ごとに / 同列)",
                        "被ダメージ減少15% (普通攻撃2回ごとに / 同列)",
                        "被ダメージ減少18% (普通攻撃2回ごとに / 同列)",
                        "被ダメージ減少21% (普通攻撃2回ごとに / 同列)",
                        "被ダメージ減少24% (普通攻撃2回ごとに / 同列)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 12
                        },
                        {
                            "takenDmgP": 15
                        },
                        {
                            "takenDmgP": 18
                        },
                        {
                            "takenDmgP": 21
                        },
                        {
                            "takenDmgP": 24
                        }
                    ]
                },
                {
                    "id": "artifact_shoupan_magical_backpack_e02",
                    "type": "toggle",
                    "label": "クールタイム",
                    "valueClass": "クールタイム",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "同列 / クールタイム",
                    "descriptionByStar": [
                        "クールタイム10 (同列)",
                        "クールタイム10 (同列)",
                        "クールタイム10 (同列)",
                        "クールタイム10 (同列)",
                        "クールタイム10 (同列)"
                    ],
                    "bonusesByStar": [
                        {
                            "cooltime": 10
                        },
                        {
                            "cooltime": 10
                        },
                        {
                            "cooltime": 10
                        },
                        {
                            "cooltime": 10
                        },
                        {
                            "cooltime": 10
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_snorky_fedora",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "スノキーのフェドーラ",
            "signature": true,
            "favoriteCharacter": "スノキー",
            "cost": 18,
            "bonusesByStar": [
                {
                    "hasteP": 11.3,
                    "hpP": 18.8
                },
                {
                    "hasteP": 14.1,
                    "hpP": 23.5
                },
                {
                    "hasteP": 16.9,
                    "hpP": 28.1
                },
                {
                    "hasteP": 19.7,
                    "hpP": 32.8
                },
                {
                    "hasteP": 22.5,
                    "hpP": 37.5
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_snorky_fedora_e01",
                    "type": "toggle",
                    "label": "着用者のHPが50％以上 最大HP増加",
                    "shortLabel": "最大HP増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "最大HP増加10% (着用者のHPが50％以上 / 自分)",
                        "最大HP増加10% (着用者のHPが50％以上 / 自分)",
                        "最大HP増加10% (着用者のHPが50％以上 / 自分)",
                        "最大HP増加10% (着用者のHPが50％以上 / 自分)",
                        "最大HP増加10% (着用者のHPが50％以上 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpP": 10
                        },
                        {
                            "hpP": 10
                        },
                        {
                            "hpP": 10
                        },
                        {
                            "hpP": 10
                        },
                        {
                            "hpP": 10
                        }
                    ]
                },
                {
                    "id": "artifact_snorky_fedora_e02",
                    "type": "toggle",
                    "label": "着用者のHPが50％以上 防御力増加",
                    "shortLabel": "防御力増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "防御力増加20% (着用者のHPが50％以上 / 自分)",
                        "防御力増加24.5% (着用者のHPが50％以上 / 自分)",
                        "防御力増加29% (着用者のHPが50％以上 / 自分)",
                        "防御力増加33.5% (着用者のHPが50％以上 / 自分)",
                        "防御力増加38% (着用者のHPが50％以上 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "defP": 20
                        },
                        {
                            "defP": 24.5
                        },
                        {
                            "defP": 29
                        },
                        {
                            "defP": 33.5
                        },
                        {
                            "defP": 38
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_selene_midnight_mirage",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "セリーネの夜幻影",
            "signature": true,
            "favoriteCharacter": "セリーネ",
            "cost": 28,
            "bonusesByStar": [
                {
                    "critDmgResP": 7.6,
                    "critResP": 13.7
                },
                {
                    "critDmgResP": 9.5,
                    "critResP": 17.1
                },
                {
                    "critDmgResP": 11.4,
                    "critResP": 20.6
                },
                {
                    "critDmgResP": 13.3,
                    "critResP": 24
                },
                {
                    "critDmgResP": 15.2,
                    "critResP": 27.4
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_selene_midnight_mirage_e01",
                    "type": "toggle",
                    "label": "スキル使用時 HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 参照:最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復12% (スキル使用時 / 自分)",
                        "HP回復15% (スキル使用時 / 自分)",
                        "HP回復18% (スキル使用時 / 自分)",
                        "HP回復21% (スキル使用時 / 自分)",
                        "HP回復24% (スキル使用時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 12
                        },
                        {
                            "hpRecoveryP": 15
                        },
                        {
                            "hpRecoveryP": 18
                        },
                        {
                            "hpRecoveryP": 21
                        },
                        {
                            "hpRecoveryP": 24
                        }
                    ]
                },
                {
                    "id": "artifact_selene_midnight_mirage_e02",
                    "type": "toggle",
                    "label": "スキル使用時 最大HPを超えたHP回復量 シールド付与",
                    "shortLabel": "シールド付与",
                    "valueClass": "倍率",
                    "duration": "6",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 持続:6 / 参照:最大HPを超えたHP回復量 / 倍率",
                    "descriptionByStar": [
                        "シールド付与12% (スキル使用時 / 自分)",
                        "シールド付与15% (スキル使用時 / 自分)",
                        "シールド付与18% (スキル使用時 / 自分)",
                        "シールド付与21% (スキル使用時 / 自分)",
                        "シールド付与24% (スキル使用時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "shieldP": 12
                        },
                        {
                            "shieldP": 15
                        },
                        {
                            "shieldP": 18
                        },
                        {
                            "shieldP": 21
                        },
                        {
                            "shieldP": 24
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_kyarot_sugarcane",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "キャロットのサトウキビ",
            "signature": true,
            "favoriteCharacter": "キャロット",
            "cost": 17,
            "bonusesByStar": [
                {
                    "defP": 13.2,
                    "hasteP": 10.6
                },
                {
                    "defP": 16.5,
                    "hasteP": 13.2
                },
                {
                    "defP": 19.8,
                    "hasteP": 15.9
                },
                {
                    "defP": 23.1,
                    "hasteP": 18.5
                },
                {
                    "defP": 26.4,
                    "hasteP": 21.2
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_kyarot_sugarcane_e01",
                    "type": "toggle",
                    "label": "戦闘開始時 毎秒SP回復量増加",
                    "shortLabel": "毎秒SP回復量増加",
                    "valueClass": "固定値",
                    "nonStackingSameApostle": true,
                    "description": "同列 / 固定値",
                    "descriptionByStar": [
                        "毎秒SP回復量増加4 (戦闘開始時 / 同列)",
                        "毎秒SP回復量増加6 (戦闘開始時 / 同列)",
                        "毎秒SP回復量増加8 (戦闘開始時 / 同列)",
                        "毎秒SP回復量増加10 (戦闘開始時 / 同列)",
                        "毎秒SP回復量増加12 (戦闘開始時 / 同列)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRegen": 4
                        },
                        {
                            "spRegen": 6
                        },
                        {
                            "spRegen": 8
                        },
                        {
                            "spRegen": 10
                        },
                        {
                            "spRegen": 12
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_chloe_sewing_chest",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "クロエの万能裁縫箱",
            "signature": true,
            "favoriteCharacter": "クロエ",
            "cost": 30,
            "bonusesByStar": [
                {
                    "critResP": 14.8,
                    "hasteP": 19.7
                },
                {
                    "critResP": 18.5,
                    "hasteP": 24.6
                },
                {
                    "critResP": 22.2,
                    "hasteP": 29.6
                },
                {
                    "critResP": 25.9,
                    "hasteP": 34.5
                },
                {
                    "critResP": 29.6,
                    "hasteP": 39.4
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_chloe_sewing_chest_e01",
                    "type": "toggle",
                    "label": "着用者にシールドが付与されている場合 被ダメージ減少",
                    "shortLabel": "被ダメージ減少",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少18% (着用者にシールドが付与されている場合 / 自分)",
                        "被ダメージ減少21% (着用者にシールドが付与されている場合 / 自分)",
                        "被ダメージ減少24% (着用者にシールドが付与されている場合 / 自分)",
                        "被ダメージ減少27% (着用者にシールドが付与されている場合 / 自分)",
                        "被ダメージ減少30% (着用者にシールドが付与されている場合 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 18
                        },
                        {
                            "takenDmgP": 21
                        },
                        {
                            "takenDmgP": 24
                        },
                        {
                            "takenDmgP": 27
                        },
                        {
                            "takenDmgP": 30
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_risty_replica_glove",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "リスティの模造グローブ",
            "signature": true,
            "favoriteCharacter": "リスティ",
            "cost": 19,
            "bonusesByStar": [
                {
                    "atkP": 14.9,
                    "critDmgP": 8
                },
                {
                    "atkP": 18.6,
                    "critDmgP": 10
                },
                {
                    "atkP": 22.4,
                    "critDmgP": 12
                },
                {
                    "atkP": 26.1,
                    "critDmgP": 13.9
                },
                {
                    "atkP": 29.8,
                    "critDmgP": 15.9
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_risty_replica_glove_e01",
                    "type": "toggle",
                    "label": "普通攻撃6回ごとに 会心率",
                    "shortLabel": "会心率",
                    "valueClass": "倍率",
                    "duration": "12",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 持続:12 / 倍率",
                    "descriptionByStar": [
                        "会心率18% (普通攻撃6回ごとに / 自分)",
                        "会心率21% (普通攻撃6回ごとに / 自分)",
                        "会心率24% (普通攻撃6回ごとに / 自分)",
                        "会心率27% (普通攻撃6回ごとに / 自分)",
                        "会心率30% (普通攻撃6回ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "critRateP": 18
                        },
                        {
                            "critRateP": 21
                        },
                        {
                            "critRateP": 24
                        },
                        {
                            "critRateP": 27
                        },
                        {
                            "critRateP": 30
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_barong_cursed_doll",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "バロンの呪いのぬいぐるみ",
            "signature": true,
            "favoriteCharacter": "バロン",
            "cost": 24,
            "bonusesByStar": [
                {
                    "atkP": 19.3,
                    "defP": 19.3
                },
                {
                    "atkP": 24.1,
                    "defP": 24.1
                },
                {
                    "atkP": 28.9,
                    "defP": 28.9
                },
                {
                    "atkP": 33.7,
                    "defP": 33.7
                },
                {
                    "atkP": 38.5,
                    "defP": 38.5
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_barong_cursed_doll_e01",
                    "type": "toggle",
                    "label": "着用者が敵に状態異常を付与した時 強化攻撃 与ダメージ増加",
                    "shortLabel": "強化攻撃 与ダメージ増加",
                    "valueClass": "倍率",
                    "duration": "6",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 持続:6 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加50% (着用者が敵に状態異常を付与した時 / 自分)",
                        "与ダメージ増加56.5% (着用者が敵に状態異常を付与した時 / 自分)",
                        "与ダメージ増加63% (着用者が敵に状態異常を付与した時 / 自分)",
                        "与ダメージ増加69.5% (着用者が敵に状態異常を付与した時 / 自分)",
                        "与ダメージ増加76% (着用者が敵に状態異常を付与した時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 50
                        },
                        {
                            "addP": 56.5
                        },
                        {
                            "addP": 63
                        },
                        {
                            "addP": 69.5
                        },
                        {
                            "addP": 76
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_tig_blazing_sword",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ティグの燃え盛る剣",
            "signature": true,
            "favoriteCharacter": "ティグ",
            "cost": 21,
            "bonusesByStar": [
                {
                    "atkP": 16.6,
                    "critDmgP": 8.9
                },
                {
                    "atkP": 20.8,
                    "critDmgP": 11.1
                },
                {
                    "atkP": 25,
                    "critDmgP": 13.3
                },
                {
                    "atkP": 29.2,
                    "critDmgP": 15.5
                },
                {
                    "atkP": 33.4,
                    "critDmgP": 17.7
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_tig_blazing_sword_e01",
                    "type": "toggle",
                    "label": "普通攻撃3回ごとに 攻撃速度",
                    "shortLabel": "攻撃速度",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "攻撃速度2% (普通攻撃3回ごとに / 自分)",
                        "攻撃速度2.5% (普通攻撃3回ごとに / 自分)",
                        "攻撃速度3% (普通攻撃3回ごとに / 自分)",
                        "攻撃速度3.5% (普通攻撃3回ごとに / 自分)",
                        "攻撃速度4% (普通攻撃3回ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hasteP": 2
                        },
                        {
                            "hasteP": 2.5
                        },
                        {
                            "hasteP": 3
                        },
                        {
                            "hasteP": 3.5
                        },
                        {
                            "hasteP": 4
                        }
                    ]
                },
                {
                    "id": "artifact_tig_blazing_sword_e02",
                    "type": "toggle",
                    "label": "最大スタック数",
                    "valueClass": "スタック数",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / スタック数",
                    "descriptionByStar": [
                        "最大スタック数10 (自分)",
                        "最大スタック数10 (自分)",
                        "最大スタック数10 (自分)",
                        "最大スタック数10 (自分)",
                        "最大スタック数10 (自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "maxStack": 10
                        },
                        {
                            "maxStack": 10
                        },
                        {
                            "maxStack": 10
                        },
                        {
                            "maxStack": 10
                        },
                        {
                            "maxStack": 10
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_rudd_exercise_manual",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ルードのトレーニング教本",
            "signature": true,
            "favoriteCharacter": "ルード",
            "cost": 19,
            "bonusesByStar": [
                {
                    "hpP": 33
                },
                {
                    "hpP": 41.3
                },
                {
                    "hpP": 49.6
                },
                {
                    "hpP": 57.9
                },
                {
                    "hpP": 66.2
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_rudd_exercise_manual_e01",
                    "type": "info",
                    "label": "HP回復量増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "HP回復量増加30% (自分)",
                        "HP回復量増加33% (自分)",
                        "HP回復量増加36% (自分)",
                        "HP回復量増加39% (自分)",
                        "HP回復量増加42% (自分)"
                    ]
                }
            ]
        },
        {
            "id": "artifact_rollett_magic_hat",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ロレットのマジックハット",
            "signature": true,
            "favoriteCharacter": "ロレット",
            "cost": 18,
            "bonusesByStar": [
                {
                    "atkP": 14.1,
                    "critRateP": 14.1
                },
                {
                    "atkP": 17.6,
                    "critRateP": 17.6
                },
                {
                    "atkP": 21.1,
                    "critRateP": 21.1
                },
                {
                    "atkP": 24.6,
                    "critRateP": 24.6
                },
                {
                    "atkP": 28.1,
                    "critRateP": 28.1
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_rollett_magic_hat_e01",
                    "type": "toggle",
                    "label": "敵が3体以上の場合 スキルダメージ スキル 与ダメージ増加",
                    "shortLabel": "スキル 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加45% (敵が3体以上の場合 / 自分)",
                        "与ダメージ増加56% (敵が3体以上の場合 / 自分)",
                        "与ダメージ増加67% (敵が3体以上の場合 / 自分)",
                        "与ダメージ増加78% (敵が3体以上の場合 / 自分)",
                        "与ダメージ増加89% (敵が3体以上の場合 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 45
                        },
                        {
                            "addP": 56
                        },
                        {
                            "addP": 67
                        },
                        {
                            "addP": 78
                        },
                        {
                            "addP": 89
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_dragonlight_sword",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "竜光剣",
            "cost": 25,
            "bonusesByStar": [
                {
                    "atkP": 40.3
                },
                {
                    "atkP": 50.4
                },
                {
                    "atkP": 60.4
                },
                {
                    "atkP": 70.5
                },
                {
                    "atkP": 80.6
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_dragonlight_sword_e01",
                    "type": "toggle",
                    "label": "1秒ごとに 攻撃速度増加",
                    "shortLabel": "攻撃速度増加",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率 / リセット:低学年スキル使用時",
                    "descriptionByStar": [
                        "攻撃速度増加3% (1秒ごとに / 自分)",
                        "攻撃速度増加3.5% (1秒ごとに / 自分)",
                        "攻撃速度増加4% (1秒ごとに / 自分)",
                        "攻撃速度増加4.5% (1秒ごとに / 自分)",
                        "攻撃速度増加5% (1秒ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hasteP": 3
                        },
                        {
                            "hasteP": 3.5
                        },
                        {
                            "hasteP": 4
                        },
                        {
                            "hasteP": 4.5
                        },
                        {
                            "hasteP": 5
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_life_gem",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ライフジェム",
            "cost": 23,
            "bonusesByStar": [
                {
                    "critDmgResP": 6.1,
                    "hpP": 24.5
                },
                {
                    "critDmgResP": 7.7,
                    "hpP": 30.6
                },
                {
                    "critDmgResP": 9.2,
                    "hpP": 36.8
                },
                {
                    "critDmgResP": 10.7,
                    "hpP": 42.9
                },
                {
                    "critDmgResP": 12.2,
                    "hpP": 49
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_life_gem_e01",
                    "type": "toggle",
                    "label": "HPが40%以下になった場合 HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 参照:最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復80% (HPが40%以下になった場合 / 自分)",
                        "HP回復88% (HPが40%以下になった場合 / 自分)",
                        "HP回復96% (HPが40%以下になった場合 / 自分)",
                        "HP回復104% (HPが40%以下になった場合 / 自分)",
                        "HP回復112% (HPが40%以下になった場合 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 80
                        },
                        {
                            "hpRecoveryP": 88
                        },
                        {
                            "hpRecoveryP": 96
                        },
                        {
                            "hpRecoveryP": 104
                        },
                        {
                            "hpRecoveryP": 112
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_30kg_kettlebell",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "30KGケトルベル",
            "cost": 22,
            "bonusesByStar": [
                {
                    "critDmgP": 9.3,
                    "critRateP": 17.5
                },
                {
                    "critDmgP": 11.7,
                    "critRateP": 21.9
                },
                {
                    "critDmgP": 14,
                    "critRateP": 26.4
                },
                {
                    "critDmgP": 16.3,
                    "critRateP": 30.6
                },
                {
                    "critDmgP": 18.7,
                    "critRateP": 35
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_30kg_kettlebell_e01",
                    "type": "toggle",
                    "label": "スキルダメージ スキル 与ダメージ上昇",
                    "shortLabel": "スキル 与ダメージ上昇",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ上昇30% (スキルダメージ / 自分)",
                        "与ダメージ上昇38% (スキルダメージ / 自分)",
                        "与ダメージ上昇46% (スキルダメージ / 自分)",
                        "与ダメージ上昇54% (スキルダメージ / 自分)",
                        "与ダメージ上昇62% (スキルダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 30
                        },
                        {
                            "addP": 38
                        },
                        {
                            "addP": 46
                        },
                        {
                            "addP": 54
                        },
                        {
                            "addP": 62
                        }
                    ]
                },
                {
                    "id": "artifact_30kg_kettlebell_e02",
                    "type": "toggle",
                    "label": "普通攻撃ダメージ 普通攻撃 与ダメージ上昇",
                    "shortLabel": "普通攻撃 与ダメージ上昇",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ上昇-40% (普通攻撃ダメージ / 自分)",
                        "与ダメージ上昇-40% (普通攻撃ダメージ / 自分)",
                        "与ダメージ上昇-40% (普通攻撃ダメージ / 自分)",
                        "与ダメージ上昇-40% (普通攻撃ダメージ / 自分)",
                        "与ダメージ上昇-40% (普通攻撃ダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": -40
                        },
                        {
                            "addP": -40
                        },
                        {
                            "addP": -40
                        },
                        {
                            "addP": -40
                        },
                        {
                            "addP": -40
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_mithril_knife",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ニスリルのパン切り包丁",
            "cost": 21,
            "bonusesByStar": [
                {
                    "atkP": 16.6,
                    "hasteP": 13.3
                },
                {
                    "atkP": 20.8,
                    "hasteP": 16.7
                },
                {
                    "atkP": 25,
                    "hasteP": 20
                },
                {
                    "atkP": 29.1,
                    "hasteP": 23.3
                },
                {
                    "atkP": 33.3,
                    "hasteP": 26.6
                }
            ]
        },
        {
            "id": "artifact_fluffy_vest",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "ふわふわチョッキ",
            "cost": 17,
            "bonusesByStar": [
                {
                    "defP": 26.4
                },
                {
                    "defP": 33.1
                },
                {
                    "defP": 39.7
                },
                {
                    "defP": 46.3
                },
                {
                    "defP": 52.9
                }
            ]
        },
        {
            "id": "artifact_eldyne_lamp",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "エルダインランプ",
            "cost": 16,
            "bonusesByStar": [
                {
                    "hpP": 16.5,
                    "healingP": 9.9
                },
                {
                    "hpP": 20.6,
                    "healingP": 12.4
                },
                {
                    "hpP": 24.8,
                    "healingP": 14.9
                },
                {
                    "hpP": 28.9,
                    "healingP": 17.3
                },
                {
                    "hpP": 33,
                    "healingP": 19.8
                }
            ]
        },
        {
            "id": "artifact_assassin_scroll",
            "kind": "artifact",
            "rarity": "伝説",
            "name": "暗殺者の秘伝書",
            "cost": 11,
            "bonusesByStar": [
                {
                    "atkP": 8.3,
                    "critRateP": 8.3
                },
                {
                    "atkP": 10.4,
                    "critRateP": 10.4
                },
                {
                    "atkP": 12.4,
                    "critRateP": 12.4
                },
                {
                    "atkP": 14.5,
                    "critRateP": 14.5
                },
                {
                    "atkP": 16.6,
                    "critRateP": 16.6
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_assassin_scroll_e01",
                    "type": "info",
                    "label": "普通攻撃5回ごとに 目くらまし",
                    "shortLabel": "目くらまし",
                    "valueClass": "状態付与",
                    "duration": "2.5",
                    "description": "敵 / 持続:2.5 / 状態付与"
                }
            ]
        },
        {
            "id": "artifact_sword_and_staff",
            "kind": "artifact",
            "rarity": "希少",
            "name": "剣と杖",
            "cost": 23,
            "bonusesByStar": [
                {
                    "atkP": 13.8,
                    "hasteP": 11
                },
                {
                    "atkP": 17.2,
                    "hasteP": 13.8
                },
                {
                    "atkP": 20.7,
                    "hasteP": 16.5
                },
                {
                    "atkP": 24.1,
                    "hasteP": 19.3
                },
                {
                    "atkP": 27.6,
                    "hasteP": 22.1
                }
            ]
        },
        {
            "id": "artifact_safety_harness",
            "kind": "artifact",
            "rarity": "希少",
            "name": "安全帯",
            "cost": 22,
            "bonusesByStar": [
                {
                    "hpP": 35
                },
                {
                    "hpP": 43.8
                },
                {
                    "hpP": 52.5
                },
                {
                    "hpP": 61.3
                },
                {
                    "hpP": 70
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_safety_harness_e01",
                    "type": "toggle",
                    "label": "戦闘開始時 シールド付与",
                    "shortLabel": "シールド付与",
                    "valueClass": "倍率",
                    "duration": "6",
                    "description": "同列 / 持続:6 / 参照:対象の最大HP / 倍率",
                    "descriptionByStar": [
                        "シールド付与30% (戦闘開始時 / 同列)",
                        "シールド付与33% (戦闘開始時 / 同列)",
                        "シールド付与36% (戦闘開始時 / 同列)",
                        "シールド付与39% (戦闘開始時 / 同列)",
                        "シールド付与42% (戦闘開始時 / 同列)"
                    ],
                    "bonusesByStar": [
                        {
                            "shieldP": 30
                        },
                        {
                            "shieldP": 33
                        },
                        {
                            "shieldP": 36
                        },
                        {
                            "shieldP": 39
                        },
                        {
                            "shieldP": 42
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_combat_manual",
            "kind": "artifact",
            "rarity": "希少",
            "name": "バトルマニュアル",
            "cost": 20,
            "bonusesByStar": [
                {
                    "critDmgP": 6.3,
                    "critRateP": 11.8
                },
                {
                    "critDmgP": 7.9,
                    "critRateP": 14.8
                },
                {
                    "critDmgP": 9.5,
                    "critRateP": 17.8
                },
                {
                    "critDmgP": 11.1,
                    "critRateP": 20.7
                },
                {
                    "critDmgP": 12.6,
                    "critRateP": 23.7
                }
            ]
        },
        {
            "id": "artifact_jade_codex",
            "kind": "artifact",
            "rarity": "希少",
            "name": "青玉色の魔導書",
            "cost": 20,
            "bonusesByStar": [
                {
                    "atkP": 23.7
                },
                {
                    "atkP": 29.6
                },
                {
                    "atkP": 35.5
                },
                {
                    "atkP": 41.4
                },
                {
                    "atkP": 47.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_jade_codex_e01",
                    "type": "toggle",
                    "label": "スキルダメージ スキル 与ダメージ増加",
                    "shortLabel": "スキル 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加18% (スキルダメージ / 自分)",
                        "与ダメージ増加21% (スキルダメージ / 自分)",
                        "与ダメージ増加24% (スキルダメージ / 自分)",
                        "与ダメージ増加27% (スキルダメージ / 自分)",
                        "与ダメージ増加30% (スキルダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 18
                        },
                        {
                            "addP": 21
                        },
                        {
                            "addP": 24
                        },
                        {
                            "addP": 27
                        },
                        {
                            "addP": 30
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_scale_armor",
            "kind": "artifact",
            "rarity": "希少",
            "name": "スケイルアーマー",
            "cost": 17,
            "bonusesByStar": [
                {
                    "defP": 9.9,
                    "hpRecoveryP": 5.3
                },
                {
                    "defP": 12.4,
                    "hpRecoveryP": 6.6
                },
                {
                    "defP": 14.9,
                    "hpRecoveryP": 7.9
                },
                {
                    "defP": 17.4,
                    "hpRecoveryP": 9.2
                },
                {
                    "defP": 19.8,
                    "hpRecoveryP": 10.6
                }
            ]
        },
        {
            "id": "artifact_blessed_pauldrons",
            "kind": "artifact",
            "rarity": "希少",
            "name": "祝福された肩鎧",
            "cost": 16,
            "bonusesByStar": [
                {
                    "defP": 9.3,
                    "hpP": 12.4
                },
                {
                    "defP": 11.6,
                    "hpP": 15.5
                },
                {
                    "defP": 13.9,
                    "hpP": 18.6
                },
                {
                    "defP": 16.2,
                    "hpP": 21.7
                },
                {
                    "defP": 18.6,
                    "hpP": 24.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_blessed_pauldrons_e01",
                    "type": "toggle",
                    "label": "1秒ごとに HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "description": "自分 / 参照:最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復2% (1秒ごとに / 自分)",
                        "HP回復2% (1秒ごとに / 自分)",
                        "HP回復2% (1秒ごとに / 自分)",
                        "HP回復2% (1秒ごとに / 自分)",
                        "HP回復2% (1秒ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 2
                        },
                        {
                            "hpRecoveryP": 2
                        },
                        {
                            "hpRecoveryP": 2
                        },
                        {
                            "hpRecoveryP": 2
                        },
                        {
                            "hpRecoveryP": 2
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_chalice_of_origins",
            "kind": "artifact",
            "rarity": "希少",
            "name": "起源の聖杯",
            "cost": 15,
            "bonusesByStar": [
                {
                    "critDmgP": 4.6,
                    "hasteP": 6.9
                },
                {
                    "critDmgP": 5.8,
                    "hasteP": 8.7
                },
                {
                    "critDmgP": 6.9,
                    "hasteP": 10.4
                },
                {
                    "critDmgP": 8.1,
                    "hasteP": 12.1
                },
                {
                    "critDmgP": 9.2,
                    "hasteP": 13.9
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_chalice_of_origins_e01",
                    "type": "toggle",
                    "label": "通常攻撃命中時 SP回復",
                    "shortLabel": "SP回復",
                    "valueClass": "固定値",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 固定値",
                    "descriptionByStar": [
                        "SP回復4 (通常攻撃命中時 / 自分)",
                        "SP回復4 (通常攻撃命中時 / 自分)",
                        "SP回復4 (通常攻撃命中時 / 自分)",
                        "SP回復4 (通常攻撃命中時 / 自分)",
                        "SP回復4 (通常攻撃命中時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRecovery": 4
                        },
                        {
                            "spRecovery": 4
                        },
                        {
                            "spRecovery": 4
                        },
                        {
                            "spRecovery": 4
                        },
                        {
                            "spRecovery": 4
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_grail_of_origins",
            "kind": "artifact",
            "rarity": "希少",
            "name": "祭司長の香炉",
            "cost": 15,
            "bonusesByStar": [
                {
                    "defP": 17.3
                },
                {
                    "defP": 21.6
                },
                {
                    "defP": 26
                },
                {
                    "defP": 30.3
                },
                {
                    "defP": 34.6
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_grail_of_origins_e01",
                    "type": "toggle",
                    "label": "シールド付与時 シールド効果増加",
                    "shortLabel": "シールド効果増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "シールド効果増加66% (シールド付与時 / 自分)",
                        "シールド効果増加72% (シールド付与時 / 自分)",
                        "シールド効果増加78% (シールド付与時 / 自分)",
                        "シールド効果増加84% (シールド付与時 / 自分)",
                        "シールド効果増加90% (シールド付与時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "shieldEffectP": 66
                        },
                        {
                            "shieldEffectP": 72
                        },
                        {
                            "shieldEffectP": 78
                        },
                        {
                            "shieldEffectP": 84
                        },
                        {
                            "shieldEffectP": 90
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_fanatic_mask",
            "kind": "artifact",
            "rarity": "希少",
            "name": "狂気の仮面",
            "cost": 14,
            "bonusesByStar": [
                {
                    "critDmgResP": 5.4
                },
                {
                    "critDmgResP": 6.7
                },
                {
                    "critDmgResP": 8
                },
                {
                    "critDmgResP": 9.4
                },
                {
                    "critDmgResP": 10.7
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_fanatic_mask_e01",
                    "type": "info",
                    "label": "1秒ごとに ダメージ効果",
                    "shortLabel": "ダメージ効果",
                    "valueClass": "倍率",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "周辺の敵 / 参照:最大HP / 倍率",
                    "descriptionByStar": [
                        "ダメージ効果3% (1秒ごとに / 周辺の敵)",
                        "ダメージ効果3% (1秒ごとに / 周辺の敵)",
                        "ダメージ効果3% (1秒ごとに / 周辺の敵)",
                        "ダメージ効果3% (1秒ごとに / 周辺の敵)",
                        "ダメージ効果3% (1秒ごとに / 周辺の敵)"
                    ]
                }
            ]
        },
        {
            "id": "artifact_healing_pendant",
            "kind": "artifact",
            "rarity": "希少",
            "name": "癒やしのペンダント",
            "cost": 14,
            "bonusesByStar": [
                {
                    "healingP": 12.9
                },
                {
                    "healingP": 16.1
                },
                {
                    "healingP": 19.3
                },
                {
                    "healingP": 22.5
                },
                {
                    "healingP": 25.7
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_healing_pendant_e01",
                    "type": "toggle",
                    "label": "1秒ごとに 毎秒SP回復量増加",
                    "shortLabel": "毎秒SP回復量増加",
                    "valueClass": "固定値",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 固定値",
                    "descriptionByStar": [
                        "毎秒SP回復量増加10 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加11 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加12 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加13 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加14 (1秒ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRegen": 10
                        },
                        {
                            "spRegen": 11
                        },
                        {
                            "spRegen": 12
                        },
                        {
                            "spRegen": 13
                        },
                        {
                            "spRegen": 14
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_obsidian_shuriken",
            "kind": "artifact",
            "rarity": "高級",
            "name": "黒曜石の手裏剣",
            "cost": 17,
            "bonusesByStar": [
                {
                    "atkP": 13.2
                },
                {
                    "atkP": 16.5
                },
                {
                    "atkP": 19.8
                },
                {
                    "atkP": 23.1
                },
                {
                    "atkP": 26.4
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_obsidian_shuriken_e01",
                    "type": "toggle",
                    "label": "普通攻撃ダメージ 普通攻撃 与ダメージ増加",
                    "shortLabel": "普通攻撃 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加9% (普通攻撃ダメージ / 自分)",
                        "与ダメージ増加10.5% (普通攻撃ダメージ / 自分)",
                        "与ダメージ増加12% (普通攻撃ダメージ / 自分)",
                        "与ダメージ増加13.5% (普通攻撃ダメージ / 自分)",
                        "与ダメージ増加15% (普通攻撃ダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 9
                        },
                        {
                            "addP": 10.5
                        },
                        {
                            "addP": 12
                        },
                        {
                            "addP": 13.5
                        },
                        {
                            "addP": 15
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_ring_of_greed",
            "kind": "artifact",
            "rarity": "高級",
            "name": "強欲の指輪",
            "cost": 13,
            "bonusesByStar": [
                {
                    "critDmgResP": 3.3
                },
                {
                    "critDmgResP": 4.1
                },
                {
                    "critDmgResP": 5
                },
                {
                    "critDmgResP": 5.8
                },
                {
                    "critDmgResP": 6.6
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_ring_of_greed_e01",
                    "type": "toggle",
                    "label": "状態異常ダメージ 状態異常 与ダメージ増加",
                    "shortLabel": "状態異常 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加15% (状態異常ダメージ / 自分)",
                        "与ダメージ増加17.5% (状態異常ダメージ / 自分)",
                        "与ダメージ増加20% (状態異常ダメージ / 自分)",
                        "与ダメージ増加22.5% (状態異常ダメージ / 自分)",
                        "与ダメージ増加25% (状態異常ダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 15
                        },
                        {
                            "addP": 17.5
                        },
                        {
                            "addP": 20
                        },
                        {
                            "addP": 22.5
                        },
                        {
                            "addP": 25
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_old_wooden_dagger",
            "kind": "artifact",
            "rarity": "高級",
            "name": "古木のダガー",
            "cost": 13,
            "bonusesByStar": [
                {
                    "critDmgP": 5.3
                },
                {
                    "critDmgP": 6.6
                },
                {
                    "critDmgP": 7.9
                },
                {
                    "critDmgP": 9.2
                },
                {
                    "critDmgP": 10.6
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_old_wooden_dagger_e01",
                    "type": "toggle",
                    "label": "1秒ごとに 毎秒SP回復量増加",
                    "shortLabel": "毎秒SP回復量増加",
                    "valueClass": "固定値",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 固定値",
                    "descriptionByStar": [
                        "毎秒SP回復量増加6 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加7 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加8 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加9 (1秒ごとに / 自分)",
                        "毎秒SP回復量増加10 (1秒ごとに / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRegen": 6
                        },
                        {
                            "spRegen": 7
                        },
                        {
                            "spRegen": 8
                        },
                        {
                            "spRegen": 9
                        },
                        {
                            "spRegen": 10
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_elven_wand",
            "kind": "artifact",
            "rarity": "高級",
            "name": "エルフ製の杖",
            "cost": 11,
            "bonusesByStar": [
                {
                    "hpRecoveryP": 4.4
                },
                {
                    "hpRecoveryP": 5.5
                },
                {
                    "hpRecoveryP": 6.6
                },
                {
                    "hpRecoveryP": 7.7
                },
                {
                    "hpRecoveryP": 8.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_elven_wand_e01",
                    "type": "toggle",
                    "label": "戦闘開始時 シールド付与",
                    "shortLabel": "シールド付与",
                    "valueClass": "倍率",
                    "duration": "10",
                    "description": "自分 / 持続:10 / 参照:最大HP / 倍率",
                    "descriptionByStar": [
                        "シールド付与60% (戦闘開始時 / 自分)",
                        "シールド付与60% (戦闘開始時 / 自分)",
                        "シールド付与60% (戦闘開始時 / 自分)",
                        "シールド付与60% (戦闘開始時 / 自分)",
                        "シールド付与60% (戦闘開始時 / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "shieldP": 60
                        },
                        {
                            "shieldP": 60
                        },
                        {
                            "shieldP": 60
                        },
                        {
                            "shieldP": 60
                        },
                        {
                            "shieldP": 60
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_gemstone_ring",
            "kind": "artifact",
            "rarity": "高級",
            "name": "宝石の指輪",
            "cost": 11,
            "bonusesByStar": [
                {
                    "atkP": 4.1,
                    "critDmgP": 2.2
                },
                {
                    "atkP": 5.2,
                    "critDmgP": 2.8
                },
                {
                    "atkP": 6.2,
                    "critDmgP": 3.3
                },
                {
                    "atkP": 7.2,
                    "critDmgP": 3.9
                },
                {
                    "atkP": 8.3,
                    "critDmgP": 4.4
                }
            ]
        },
        {
            "id": "artifact_crown_of_thorns",
            "kind": "artifact",
            "rarity": "高級",
            "name": "茨の冠",
            "cost": 10,
            "bonusesByStar": [
                {
                    "defP": 7.5
                },
                {
                    "defP": 9.3
                },
                {
                    "defP": 11.2
                },
                {
                    "defP": 13.1
                },
                {
                    "defP": 14.9
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_crown_of_thorns_e01",
                    "type": "toggle",
                    "label": "スキルダメージ スキル 与ダメージ増加",
                    "shortLabel": "スキル 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "自分 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加9% (スキルダメージ / 自分)",
                        "与ダメージ増加10.5% (スキルダメージ / 自分)",
                        "与ダメージ増加12% (スキルダメージ / 自分)",
                        "与ダメージ増加13.5% (スキルダメージ / 自分)",
                        "与ダメージ増加15% (スキルダメージ / 自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 9
                        },
                        {
                            "addP": 10.5
                        },
                        {
                            "addP": 12
                        },
                        {
                            "addP": 13.5
                        },
                        {
                            "addP": 15
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_weathered_arrow",
            "kind": "artifact",
            "rarity": "高級",
            "name": "古びた矢",
            "cost": 10,
            "bonusesByStar": [
                {
                    "hasteP": 6
                },
                {
                    "hasteP": 7.5
                },
                {
                    "hasteP": 9
                },
                {
                    "hasteP": 10.5
                },
                {
                    "hasteP": 12
                }
            ]
        },
        {
            "id": "artifact_icy_charm",
            "kind": "artifact",
            "rarity": "高級",
            "name": "霜のお守り",
            "cost": 10,
            "bonusesByStar": [
                {
                    "critResP": 4.5
                },
                {
                    "critResP": 5.6
                },
                {
                    "critResP": 6.7
                },
                {
                    "critResP": 7.8
                },
                {
                    "critResP": 9
                }
            ],
            "conditionalEffects": [
                {
                    "id": "artifact_icy_charm_e01",
                    "type": "toggle",
                    "label": "デバフ抵抗効果",
                    "valueClass": "回数",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / 回数",
                    "descriptionByStar": [
                        "デバフ抵抗効果1 (自分)",
                        "デバフ抵抗効果1 (自分)",
                        "デバフ抵抗効果1 (自分)",
                        "デバフ抵抗効果1 (自分)",
                        "デバフ抵抗効果1 (自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "debuffResistP": 1
                        },
                        {
                            "debuffResistP": 1
                        },
                        {
                            "debuffResistP": 1
                        },
                        {
                            "debuffResistP": 1
                        },
                        {
                            "debuffResistP": 1
                        }
                    ]
                },
                {
                    "id": "artifact_icy_charm_e02",
                    "type": "toggle",
                    "label": "クールタイム",
                    "valueClass": "クールタイム",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "自分 / クールタイム",
                    "descriptionByStar": [
                        "クールタイム10 (自分)",
                        "クールタイム9.5 (自分)",
                        "クールタイム9 (自分)",
                        "クールタイム8.5 (自分)",
                        "クールタイム8 (自分)"
                    ],
                    "bonusesByStar": [
                        {
                            "cooltime": 10
                        },
                        {
                            "cooltime": 9.5
                        },
                        {
                            "cooltime": 9
                        },
                        {
                            "cooltime": 8.5
                        },
                        {
                            "cooltime": 8
                        }
                    ]
                }
            ]
        },
        {
            "id": "artifact_cotton_cloak",
            "kind": "artifact",
            "rarity": "高級",
            "name": "風呂敷のローブ",
            "cost": 10,
            "bonusesByStar": [
                {
                    "critResP": 4.5
                },
                {
                    "critResP": 5.6
                },
                {
                    "critResP": 6.7
                },
                {
                    "critResP": 7.8
                },
                {
                    "critResP": 9
                }
            ]
        },
        {
            "id": "artifact_shining_tiara",
            "kind": "artifact",
            "rarity": "高級",
            "name": "シャイニングティアラ",
            "cost": 9,
            "bonusesByStar": [
                {
                    "hpP": 4.5,
                    "healingP": 2.7
                },
                {
                    "hpP": 5.6,
                    "healingP": 3.3
                },
                {
                    "hpP": 6.7,
                    "healingP": 4
                },
                {
                    "hpP": 7.8,
                    "healingP": 4.7
                },
                {
                    "hpP": 8.9,
                    "healingP": 5.3
                }
            ]
        },
        {
            "id": "artifact_cardboard_armor",
            "kind": "artifact",
            "rarity": "高級",
            "name": "段ボールのアーマー",
            "cost": 9,
            "bonusesByStar": [
                {
                    "defP": 6.7
                },
                {
                    "defP": 8.4
                },
                {
                    "defP": 10
                },
                {
                    "defP": 11.7
                },
                {
                    "defP": 13.4
                }
            ]
        },
        {
            "id": "artifact_head_wrap",
            "kind": "artifact",
            "rarity": "高級",
            "name": "頭巻きタオル",
            "cost": 8,
            "bonusesByStar": [
                {
                    "hpP": 7.9
                },
                {
                    "hpP": 9.8
                },
                {
                    "hpP": 11.8
                },
                {
                    "hpP": 13.8
                },
                {
                    "hpP": 15.7
                }
            ]
        },
        {
            "id": "artifact_rusty_awl",
            "kind": "artifact",
            "rarity": "高級",
            "name": "錆びついた錐",
            "cost": 6,
            "bonusesByStar": [
                {
                    "critRateP": 4.4
                },
                {
                    "critRateP": 5.5
                },
                {
                    "critRateP": 6.6
                },
                {
                    "critRateP": 7.6
                },
                {
                    "critRateP": 8.7
                }
            ]
        }
    ],
    "spells": [
        {
            "id": "spell_alice_fake_magic",
            "kind": "spell",
            "rarity": "伝説",
            "name": "アリスのデタラメな呪術",
            "signature": true,
            "favoriteCharacter": "アリス",
            "cost": 23,
            "bonusesByStar": [
                {
                    "atkP": 7.7,
                    "critRateP": 7.7
                },
                {
                    "atkP": 9.6,
                    "critRateP": 9.6
                },
                {
                    "atkP": 11.5,
                    "critRateP": 11.5
                },
                {
                    "atkP": 13.4,
                    "critRateP": 13.4
                },
                {
                    "atkP": 15.3,
                    "critRateP": 15.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_alice_fake_magic_e01",
                    "type": "toggle",
                    "label": "5秒ごと ランダム最低値 HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "description": "味方全体 / 参照:対象の最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復5% (5秒ごと / 味方全体)",
                        "HP回復5% (5秒ごと / 味方全体)",
                        "HP回復5% (5秒ごと / 味方全体)",
                        "HP回復5% (5秒ごと / 味方全体)",
                        "HP回復5% (5秒ごと / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 5
                        },
                        {
                            "hpRecoveryP": 5
                        },
                        {
                            "hpRecoveryP": 5
                        },
                        {
                            "hpRecoveryP": 5
                        },
                        {
                            "hpRecoveryP": 5
                        }
                    ]
                },
                {
                    "id": "spell_alice_fake_magic_e02",
                    "type": "toggle",
                    "label": "5秒ごと ランダム最大値 HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "description": "味方全体 / 参照:対象の最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復10% (5秒ごと / 味方全体)",
                        "HP回復12% (5秒ごと / 味方全体)",
                        "HP回復14% (5秒ごと / 味方全体)",
                        "HP回復16% (5秒ごと / 味方全体)",
                        "HP回復18% (5秒ごと / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 10
                        },
                        {
                            "hpRecoveryP": 12
                        },
                        {
                            "hpRecoveryP": 14
                        },
                        {
                            "hpRecoveryP": 16
                        },
                        {
                            "hpRecoveryP": 18
                        }
                    ]
                },
                {
                    "id": "spell_alice_fake_magic_e03",
                    "type": "toggle",
                    "label": "5秒ごと ランダム最低値 SP回復",
                    "shortLabel": "SP回復",
                    "valueClass": "固定値",
                    "description": "味方全体 / 固定値",
                    "descriptionByStar": [
                        "SP回復1 (5秒ごと / 味方全体)",
                        "SP回復1 (5秒ごと / 味方全体)",
                        "SP回復1 (5秒ごと / 味方全体)",
                        "SP回復1 (5秒ごと / 味方全体)",
                        "SP回復1 (5秒ごと / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRecovery": 1
                        },
                        {
                            "spRecovery": 1
                        },
                        {
                            "spRecovery": 1
                        },
                        {
                            "spRecovery": 1
                        },
                        {
                            "spRecovery": 1
                        }
                    ]
                },
                {
                    "id": "spell_alice_fake_magic_e04",
                    "type": "toggle",
                    "label": "5秒ごと ランダム最大値 SP回復",
                    "shortLabel": "SP回復",
                    "valueClass": "固定値",
                    "description": "味方全体 / 固定値",
                    "descriptionByStar": [
                        "SP回復10 (5秒ごと / 味方全体)",
                        "SP回復10 (5秒ごと / 味方全体)",
                        "SP回復10 (5秒ごと / 味方全体)",
                        "SP回復10 (5秒ごと / 味方全体)",
                        "SP回復10 (5秒ごと / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRecovery": 10
                        },
                        {
                            "spRecovery": 10
                        },
                        {
                            "spRecovery": 10
                        },
                        {
                            "spRecovery": 10
                        },
                        {
                            "spRecovery": 10
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_epica_hero_exaltation",
            "kind": "spell",
            "rarity": "伝説",
            "name": "エピカの高貴なる英雄讃歌",
            "signature": true,
            "favoriteCharacter": "エピカ",
            "cost": 30,
            "bonusesByStar": [
                {
                    "atkP": 10.3,
                    "critDmgP": 5.5
                },
                {
                    "atkP": 12.8,
                    "critDmgP": 6.9
                },
                {
                    "atkP": 15.4,
                    "critDmgP": 8.2
                },
                {
                    "atkP": 18,
                    "critDmgP": 9.6
                },
                {
                    "atkP": 20.5,
                    "critDmgP": 11
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_epica_hero_exaltation_e01",
                    "type": "toggle",
                    "label": "ウェーブ開始時 学年+",
                    "shortLabel": "学年+",
                    "valueClass": "固定値",
                    "description": "ランダムな味方1人 / 固定値",
                    "descriptionByStar": [
                        "学年+1 (ウェーブ開始時 / ランダムな味方1人)",
                        "学年+1 (ウェーブ開始時 / ランダムな味方1人)",
                        "学年+1 (ウェーブ開始時 / ランダムな味方1人)",
                        "学年+1 (ウェーブ開始時 / ランダムな味方1人)",
                        "学年+1 (ウェーブ開始時 / ランダムな味方1人)"
                    ],
                    "bonusesByStar": [
                        {
                            "gradePlus": 1
                        },
                        {
                            "gradePlus": 1
                        },
                        {
                            "gradePlus": 1
                        },
                        {
                            "gradePlus": 1
                        },
                        {
                            "gradePlus": 1
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_luc_ed_dream",
            "kind": "spell",
            "rarity": "伝説",
            "name": "ルシ - イードドリーム",
            "signature": true,
            "favoriteCharacter": "イード",
            "cost": 36,
            "bonusesByStar": [
                {
                    "critDmgResP": 4.2,
                    "critResP": 7.5
                },
                {
                    "critDmgResP": 5.2,
                    "critResP": 9.4
                },
                {
                    "critDmgResP": 6.3,
                    "critResP": 11.3
                },
                {
                    "critDmgResP": 7.3,
                    "critResP": 13.2
                },
                {
                    "critDmgResP": 8.4,
                    "critResP": 15
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_luc_ed_dream_e01",
                    "type": "toggle",
                    "label": "被ダメージ減少",
                    "valueClass": "倍率",
                    "description": "味方前列 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少15% (味方前列)",
                        "被ダメージ減少15% (味方前列)",
                        "被ダメージ減少15% (味方前列)",
                        "被ダメージ減少15% (味方前列)",
                        "被ダメージ減少15% (味方前列)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 15
                        },
                        {
                            "takenDmgP": 15
                        },
                        {
                            "takenDmgP": 15
                        },
                        {
                            "takenDmgP": 15
                        },
                        {
                            "takenDmgP": 15
                        }
                    ]
                },
                {
                    "id": "spell_luc_ed_dream_e02",
                    "type": "toggle",
                    "label": "防御力増加",
                    "valueClass": "倍率",
                    "description": "味方前列かつガードタイプ / 倍率",
                    "descriptionByStar": [
                        "防御力増加20% (味方前列かつガードタイプ)",
                        "防御力増加23% (味方前列かつガードタイプ)",
                        "防御力増加26% (味方前列かつガードタイプ)",
                        "防御力増加29% (味方前列かつガードタイプ)",
                        "防御力増加32% (味方前列かつガードタイプ)"
                    ],
                    "bonusesByStar": [
                        {
                            "defP": 20
                        },
                        {
                            "defP": 23
                        },
                        {
                            "defP": 26
                        },
                        {
                            "defP": 29
                        },
                        {
                            "defP": 32
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_renewa_time_paradox",
            "kind": "spell",
            "rarity": "伝説",
            "name": "リニュアのタイムパラドックス",
            "signature": true,
            "favoriteCharacter": "リニュア",
            "cost": 27,
            "bonusesByStar": [
                {
                    "critDmgP": 4.9,
                    "critRateP": 9.1
                },
                {
                    "critDmgP": 6.1,
                    "critRateP": 11.4
                },
                {
                    "critDmgP": 7.3,
                    "critRateP": 13.7
                },
                {
                    "critDmgP": 8.5,
                    "critRateP": 16
                },
                {
                    "critDmgP": 9.8,
                    "critRateP": 18.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_renewa_time_paradox_e01",
                    "type": "toggle",
                    "label": "ウェーブ開始時 与ダメージ増加",
                    "shortLabel": "与ダメージ増加",
                    "valueClass": "倍率",
                    "duration": "30",
                    "nonStackingSameEffect": true,
                    "nonStackingSameApostle": true,
                    "description": "味方全体 / 持続:30 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加32% (ウェーブ開始時 / 味方全体)",
                        "与ダメージ増加36% (ウェーブ開始時 / 味方全体)",
                        "与ダメージ増加40% (ウェーブ開始時 / 味方全体)",
                        "与ダメージ増加44% (ウェーブ開始時 / 味方全体)",
                        "与ダメージ増加48% (ウェーブ開始時 / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 32
                        },
                        {
                            "addP": 36
                        },
                        {
                            "addP": 40
                        },
                        {
                            "addP": 44
                        },
                        {
                            "addP": 48
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_aya_snowflake_magic",
            "kind": "spell",
            "rarity": "伝説",
            "name": "アヤの雪の花魔法",
            "signature": true,
            "favoriteCharacter": "アヤ",
            "cost": 32,
            "bonusesByStar": [
                {
                    "critDmgP": 5.9,
                    "critRateP": 11
                },
                {
                    "critDmgP": 7.4,
                    "critRateP": 13.8
                },
                {
                    "critDmgP": 8.8,
                    "critRateP": 16.5
                },
                {
                    "critDmgP": 10.3,
                    "critRateP": 19.3
                },
                {
                    "critDmgP": 11.8,
                    "critRateP": 22
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_aya_snowflake_magic_e01",
                    "type": "toggle",
                    "label": "与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "味方中列 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加10% (味方中列)",
                        "与ダメージ増加10% (味方中列)",
                        "与ダメージ増加10% (味方中列)",
                        "与ダメージ増加10% (味方中列)",
                        "与ダメージ増加10% (味方中列)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 10
                        },
                        {
                            "addP": 10
                        },
                        {
                            "addP": 10
                        },
                        {
                            "addP": 10
                        },
                        {
                            "addP": 10
                        }
                    ]
                },
                {
                    "id": "spell_aya_snowflake_magic_e02",
                    "type": "toggle",
                    "label": "攻撃力増加",
                    "valueClass": "倍率",
                    "description": "味方中列かつアタッカータイプ / 倍率",
                    "descriptionByStar": [
                        "攻撃力増加30% (味方中列かつアタッカータイプ)",
                        "攻撃力増加33% (味方中列かつアタッカータイプ)",
                        "攻撃力増加36% (味方中列かつアタッカータイプ)",
                        "攻撃力増加39% (味方中列かつアタッカータイプ)",
                        "攻撃力増加42% (味方中列かつアタッカータイプ)"
                    ],
                    "bonusesByStar": [
                        {
                            "atkP": 30
                        },
                        {
                            "atkP": 33
                        },
                        {
                            "atkP": 36
                        },
                        {
                            "atkP": 39
                        },
                        {
                            "atkP": 42
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_fatal_charm",
            "kind": "spell",
            "rarity": "伝説",
            "name": "美しいって罪ね",
            "cost": 28,
            "bonusesByStar": [
                {
                    "critDmgP": 5.1,
                    "critRateP": 9.5
                },
                {
                    "critDmgP": 6.4,
                    "critRateP": 11.9
                },
                {
                    "critDmgP": 7.6,
                    "critRateP": 14.3
                },
                {
                    "critDmgP": 8.9,
                    "critRateP": 16.6
                },
                {
                    "critDmgP": 10.2,
                    "critRateP": 19
                }
            ]
        },
        {
            "id": "spell_strange_elixir",
            "kind": "spell",
            "rarity": "伝説",
            "name": "怪しいポーション",
            "cost": 26,
            "costByStar": [
                26,
                25,
                24,
                23,
                22
            ],
            "conditionalEffects": [
                {
                    "id": "spell_strange_elixir_e01",
                    "type": "info",
                    "label": "ウェーブ開始時 毒",
                    "shortLabel": "毒",
                    "valueClass": "状態付与",
                    "duration": "星で変動",
                    "description": "敵全体 / 持続:星で変動 / 状態付与"
                },
                {
                    "id": "spell_strange_elixir_e02",
                    "type": "toggle",
                    "label": "ウェーブ開始時 毒持続時間",
                    "shortLabel": "毒持続時間",
                    "valueClass": "持続時間",
                    "duration": "星で変動",
                    "description": "敵全体 / 持続:星で変動 / 持続時間",
                    "descriptionByStar": [
                        "毒持続時間12 (ウェーブ開始時 / 敵全体)",
                        "毒持続時間15 (ウェーブ開始時 / 敵全体)",
                        "毒持続時間18 (ウェーブ開始時 / 敵全体)",
                        "毒持続時間21 (ウェーブ開始時 / 敵全体)",
                        "毒持続時間24 (ウェーブ開始時 / 敵全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "poisonDuration": 12
                        },
                        {
                            "poisonDuration": 15
                        },
                        {
                            "poisonDuration": 18
                        },
                        {
                            "poisonDuration": 21
                        },
                        {
                            "poisonDuration": 24
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_combat_master",
            "kind": "spell",
            "rarity": "伝説",
            "name": "バトルの達人",
            "cost": 24,
            "bonusesByStar": [
                {
                    "atkP": 16.1
                },
                {
                    "atkP": 20.1
                },
                {
                    "atkP": 24.1
                },
                {
                    "atkP": 28.1
                },
                {
                    "atkP": 32.1
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_combat_master_e01",
                    "type": "toggle",
                    "label": "スキルダメージ スキル 与ダメージ増加",
                    "shortLabel": "スキル 与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "味方全体 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加6.8% (スキルダメージ / 味方全体)",
                        "与ダメージ増加8.3% (スキルダメージ / 味方全体)",
                        "与ダメージ増加9.8% (スキルダメージ / 味方全体)",
                        "与ダメージ増加11.3% (スキルダメージ / 味方全体)",
                        "与ダメージ増加12.8% (スキルダメージ / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 6.8
                        },
                        {
                            "addP": 8.3
                        },
                        {
                            "addP": 9.8
                        },
                        {
                            "addP": 11.3
                        },
                        {
                            "addP": 12.8
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_aroma_therapy",
            "kind": "spell",
            "rarity": "伝説",
            "name": "アロマセラピー",
            "cost": 10,
            "costByStar": [
                10,
                9,
                8,
                7,
                6
            ],
            "bonusesByStar": [
                {
                    "healingP": 2.5,
                    "hpRecoveryP": 1.7
                },
                {
                    "healingP": 3.1,
                    "hpRecoveryP": 2.1
                },
                {
                    "healingP": 3.8,
                    "hpRecoveryP": 2.5
                },
                {
                    "healingP": 4.4,
                    "hpRecoveryP": 2.9
                },
                {
                    "healingP": 5,
                    "hpRecoveryP": 3.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_aroma_therapy_e01",
                    "type": "toggle",
                    "label": "カード選択時 SP回復",
                    "shortLabel": "SP回復",
                    "valueClass": "倍率",
                    "description": "残りSPが最も低い味方 / 倍率",
                    "descriptionByStar": [
                        "SP回復100% (カード選択時 / 残りSPが最も低い味方)",
                        "SP回復100% (カード選択時 / 残りSPが最も低い味方)",
                        "SP回復100% (カード選択時 / 残りSPが最も低い味方)",
                        "SP回復100% (カード選択時 / 残りSPが最も低い味方)",
                        "SP回復100% (カード選択時 / 残りSPが最も低い味方)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRecoveryP": 100
                        },
                        {
                            "spRecoveryP": 100
                        },
                        {
                            "spRecoveryP": 100
                        },
                        {
                            "spRecoveryP": 100
                        },
                        {
                            "spRecoveryP": 100
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_cheer_up",
            "kind": "spell",
            "rarity": "希少",
            "name": "やる気アップ",
            "cost": 24,
            "bonusesByStar": [
                {
                    "critRateP": 6,
                    "hasteP": 4.8
                },
                {
                    "critRateP": 7.5,
                    "hasteP": 6
                },
                {
                    "critRateP": 9,
                    "hasteP": 7.2
                },
                {
                    "critRateP": 10.5,
                    "hasteP": 8.4
                },
                {
                    "critRateP": 12,
                    "hasteP": 9.6
                }
            ]
        },
        {
            "id": "spell_warm_hearted",
            "kind": "spell",
            "rarity": "希少",
            "name": "世話好き",
            "cost": 22,
            "bonusesByStar": [
                {
                    "healingP": 4.4,
                    "hpP": 7.3
                },
                {
                    "healingP": 5.5,
                    "hpP": 9.1
                },
                {
                    "healingP": 6.6,
                    "hpP": 10.9
                },
                {
                    "healingP": 7.7,
                    "hpP": 12.8
                },
                {
                    "healingP": 8.8,
                    "hpP": 14.6
                }
            ]
        },
        {
            "id": "spell_stealth_slacker",
            "kind": "spell",
            "rarity": "希少",
            "name": "センター最高！",
            "cost": 20,
            "bonusesByStar": [
                {
                    "critDmgP": 5.3
                },
                {
                    "critDmgP": 6.6
                },
                {
                    "critDmgP": 7.9
                },
                {
                    "critDmgP": 9.2
                },
                {
                    "critDmgP": 10.5
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_stealth_slacker_e01",
                    "type": "toggle",
                    "label": "与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "味方中列 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加7% (味方中列)",
                        "与ダメージ増加8% (味方中列)",
                        "与ダメージ増加9% (味方中列)",
                        "与ダメージ増加10% (味方中列)",
                        "与ダメージ増加11% (味方中列)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 7
                        },
                        {
                            "addP": 8
                        },
                        {
                            "addP": 9
                        },
                        {
                            "addP": 10
                        },
                        {
                            "addP": 11
                        }
                    ]
                },
                {
                    "id": "spell_stealth_slacker_e02",
                    "type": "toggle",
                    "label": "被ダメージ減少",
                    "valueClass": "倍率",
                    "description": "味方中列 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少5% (味方中列)",
                        "被ダメージ減少6% (味方中列)",
                        "被ダメージ減少7% (味方中列)",
                        "被ダメージ減少8% (味方中列)",
                        "被ダメージ減少9% (味方中列)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 5
                        },
                        {
                            "takenDmgP": 6
                        },
                        {
                            "takenDmgP": 7
                        },
                        {
                            "takenDmgP": 8
                        },
                        {
                            "takenDmgP": 9
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_vanguard",
            "kind": "spell",
            "rarity": "希少",
            "name": "前衛隊",
            "cost": 20,
            "bonusesByStar": [
                {
                    "defP": 9.9
                },
                {
                    "defP": 12.3
                },
                {
                    "defP": 14.8
                },
                {
                    "defP": 17.2
                },
                {
                    "defP": 19.7
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_vanguard_e01",
                    "type": "toggle",
                    "label": "与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "味方前列 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加4% (味方前列)",
                        "与ダメージ増加5% (味方前列)",
                        "与ダメージ増加6% (味方前列)",
                        "与ダメージ増加7% (味方前列)",
                        "与ダメージ増加8% (味方前列)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 4
                        },
                        {
                            "addP": 5
                        },
                        {
                            "addP": 6
                        },
                        {
                            "addP": 7
                        },
                        {
                            "addP": 8
                        }
                    ]
                },
                {
                    "id": "spell_vanguard_e02",
                    "type": "toggle",
                    "label": "被ダメージ減少",
                    "valueClass": "倍率",
                    "description": "味方前列 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少8% (味方前列)",
                        "被ダメージ減少9% (味方前列)",
                        "被ダメージ減少10% (味方前列)",
                        "被ダメージ減少11% (味方前列)",
                        "被ダメージ減少12% (味方前列)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 8
                        },
                        {
                            "takenDmgP": 9
                        },
                        {
                            "takenDmgP": 10
                        },
                        {
                            "takenDmgP": 11
                        },
                        {
                            "takenDmgP": 12
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_rear_guard",
            "kind": "spell",
            "rarity": "希少",
            "name": "後衛隊",
            "cost": 20,
            "bonusesByStar": [
                {
                    "hasteP": 7.9
                },
                {
                    "hasteP": 9.9
                },
                {
                    "hasteP": 11.8
                },
                {
                    "hasteP": 13.8
                },
                {
                    "hasteP": 15.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_rear_guard_e01",
                    "type": "toggle",
                    "label": "与ダメージ増加",
                    "valueClass": "倍率",
                    "description": "味方後列 / 倍率",
                    "descriptionByStar": [
                        "与ダメージ増加9% (味方後列)",
                        "与ダメージ増加10% (味方後列)",
                        "与ダメージ増加11% (味方後列)",
                        "与ダメージ増加12% (味方後列)",
                        "与ダメージ増加13% (味方後列)"
                    ],
                    "bonusesByStar": [
                        {
                            "addP": 9
                        },
                        {
                            "addP": 10
                        },
                        {
                            "addP": 11
                        },
                        {
                            "addP": 12
                        },
                        {
                            "addP": 13
                        }
                    ]
                },
                {
                    "id": "spell_rear_guard_e02",
                    "type": "toggle",
                    "label": "被ダメージ減少",
                    "valueClass": "倍率",
                    "description": "味方後列 / 倍率",
                    "descriptionByStar": [
                        "被ダメージ減少3% (味方後列)",
                        "被ダメージ減少8% (味方後列)",
                        "被ダメージ減少8% (味方後列)",
                        "被ダメージ減少9% (味方後列)",
                        "被ダメージ減少9% (味方後列)"
                    ],
                    "bonusesByStar": [
                        {
                            "takenDmgP": 3
                        },
                        {
                            "takenDmgP": 8
                        },
                        {
                            "takenDmgP": 8
                        },
                        {
                            "takenDmgP": 9
                        },
                        {
                            "takenDmgP": 9
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_personality_mad",
            "kind": "spell",
            "rarity": "希少",
            "name": "性格カード【狂気】",
            "cost": 16,
            "bonusesByStar": [
                {
                    "atkP": 7.7
                },
                {
                    "atkP": 9.7
                },
                {
                    "atkP": 11.6
                },
                {
                    "atkP": 13.5
                },
                {
                    "atkP": 15.5
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_personality_mad_e01",
                    "type": "toggle",
                    "label": "カード選択時 狂気性格判定+1",
                    "shortLabel": "狂気性格判定+1",
                    "valueClass": "固定値",
                    "description": "性格シナジー / 固定値",
                    "descriptionByStar": [
                        "狂気性格判定+1 (カード選択時 / 性格シナジー)",
                        "狂気性格判定+1 (カード選択時 / 性格シナジー)",
                        "狂気性格判定+1 (カード選択時 / 性格シナジー)",
                        "狂気性格判定+1 (カード選択時 / 性格シナジー)",
                        "狂気性格判定+1 (カード選択時 / 性格シナジー)"
                    ],
                    "bonusesByStar": [
                        {
                            "personalityMadnessPlus": 1
                        },
                        {
                            "personalityMadnessPlus": 1
                        },
                        {
                            "personalityMadnessPlus": 1
                        },
                        {
                            "personalityMadnessPlus": 1
                        },
                        {
                            "personalityMadnessPlus": 1
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_personality_vivacious",
            "kind": "spell",
            "rarity": "希少",
            "name": "性格カード【活発】",
            "cost": 16,
            "bonusesByStar": [
                {
                    "critRateP": 7.7
                },
                {
                    "critRateP": 9.7
                },
                {
                    "critRateP": 11.6
                },
                {
                    "critRateP": 13.5
                },
                {
                    "critRateP": 15.5
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_personality_vivacious_e01",
                    "type": "toggle",
                    "label": "カード選択時 活発性格判定+1",
                    "shortLabel": "活発性格判定+1",
                    "valueClass": "固定値",
                    "description": "性格シナジー / 固定値",
                    "descriptionByStar": [
                        "活発性格判定+1 (カード選択時 / 性格シナジー)",
                        "活発性格判定+1 (カード選択時 / 性格シナジー)",
                        "活発性格判定+1 (カード選択時 / 性格シナジー)",
                        "活発性格判定+1 (カード選択時 / 性格シナジー)",
                        "活発性格判定+1 (カード選択時 / 性格シナジー)"
                    ],
                    "bonusesByStar": [
                        {
                            "personalityVivaciousPlus": 1
                        },
                        {
                            "personalityVivaciousPlus": 1
                        },
                        {
                            "personalityVivaciousPlus": 1
                        },
                        {
                            "personalityVivaciousPlus": 1
                        },
                        {
                            "personalityVivaciousPlus": 1
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_personality_innocent",
            "kind": "spell",
            "rarity": "希少",
            "name": "性格カード【純粋】",
            "cost": 16,
            "bonusesByStar": [
                {
                    "hpRecoveryP": 4.1
                },
                {
                    "hpRecoveryP": 5.2
                },
                {
                    "hpRecoveryP": 6.2
                },
                {
                    "hpRecoveryP": 7.2
                },
                {
                    "hpRecoveryP": 8.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_personality_innocent_e01",
                    "type": "toggle",
                    "label": "カード選択時 純粋性格判定+1",
                    "shortLabel": "純粋性格判定+1",
                    "valueClass": "固定値",
                    "description": "性格シナジー / 固定値",
                    "descriptionByStar": [
                        "純粋性格判定+1 (カード選択時 / 性格シナジー)",
                        "純粋性格判定+1 (カード選択時 / 性格シナジー)",
                        "純粋性格判定+1 (カード選択時 / 性格シナジー)",
                        "純粋性格判定+1 (カード選択時 / 性格シナジー)",
                        "純粋性格判定+1 (カード選択時 / 性格シナジー)"
                    ],
                    "bonusesByStar": [
                        {
                            "personalityPurePlus": 1
                        },
                        {
                            "personalityPurePlus": 1
                        },
                        {
                            "personalityPurePlus": 1
                        },
                        {
                            "personalityPurePlus": 1
                        },
                        {
                            "personalityPurePlus": 1
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_personality_depressed",
            "kind": "spell",
            "rarity": "希少",
            "name": "性格カード【憂鬱】",
            "cost": 16,
            "bonusesByStar": [
                {
                    "defP": 7.7
                },
                {
                    "defP": 9.7
                },
                {
                    "defP": 11.6
                },
                {
                    "defP": 13.5
                },
                {
                    "defP": 15.5
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_personality_depressed_e01",
                    "type": "toggle",
                    "label": "カード選択時 憂鬱性格判定+1",
                    "shortLabel": "憂鬱性格判定+1",
                    "valueClass": "固定値",
                    "description": "性格シナジー / 固定値",
                    "descriptionByStar": [
                        "憂鬱性格判定+1 (カード選択時 / 性格シナジー)",
                        "憂鬱性格判定+1 (カード選択時 / 性格シナジー)",
                        "憂鬱性格判定+1 (カード選択時 / 性格シナジー)",
                        "憂鬱性格判定+1 (カード選択時 / 性格シナジー)",
                        "憂鬱性格判定+1 (カード選択時 / 性格シナジー)"
                    ],
                    "bonusesByStar": [
                        {
                            "personalityGloomyPlus": 1
                        },
                        {
                            "personalityGloomyPlus": 1
                        },
                        {
                            "personalityGloomyPlus": 1
                        },
                        {
                            "personalityGloomyPlus": 1
                        },
                        {
                            "personalityGloomyPlus": 1
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_personality_composed",
            "kind": "spell",
            "rarity": "希少",
            "name": "性格カード【冷静】",
            "cost": 16,
            "bonusesByStar": [
                {
                    "critDmgP": 4.1
                },
                {
                    "critDmgP": 5.2
                },
                {
                    "critDmgP": 6.2
                },
                {
                    "critDmgP": 7.2
                },
                {
                    "critDmgP": 8.3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_personality_composed_e01",
                    "type": "toggle",
                    "label": "カード選択時 冷静性格判定+1",
                    "shortLabel": "冷静性格判定+1",
                    "valueClass": "固定値",
                    "description": "性格シナジー / 固定値",
                    "descriptionByStar": [
                        "冷静性格判定+1 (カード選択時 / 性格シナジー)",
                        "冷静性格判定+1 (カード選択時 / 性格シナジー)",
                        "冷静性格判定+1 (カード選択時 / 性格シナジー)",
                        "冷静性格判定+1 (カード選択時 / 性格シナジー)",
                        "冷静性格判定+1 (カード選択時 / 性格シナジー)"
                    ],
                    "bonusesByStar": [
                        {
                            "personalityCoolPlus": 1
                        },
                        {
                            "personalityCoolPlus": 1
                        },
                        {
                            "personalityCoolPlus": 1
                        },
                        {
                            "personalityCoolPlus": 1
                        },
                        {
                            "personalityCoolPlus": 1
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_swift_move",
            "kind": "spell",
            "rarity": "高級",
            "name": "神速の身のこなし",
            "cost": 22,
            "bonusesByStar": [
                {
                    "critDmgP": 2,
                    "hasteP": 2.9
                },
                {
                    "critDmgP": 2.4,
                    "hasteP": 3.7
                },
                {
                    "critDmgP": 2.9,
                    "hasteP": 4.4
                },
                {
                    "critDmgP": 3.4,
                    "hasteP": 5.1
                },
                {
                    "critDmgP": 3.9,
                    "hasteP": 5.8
                }
            ]
        },
        {
            "id": "spell_firm_belief",
            "kind": "spell",
            "rarity": "高級",
            "name": "堅固な信念",
            "cost": 21,
            "bonusesByStar": [
                {
                    "critDmgResP": 1.2,
                    "critResP": 2.1
                },
                {
                    "critDmgResP": 1.5,
                    "critResP": 2.6
                },
                {
                    "critDmgResP": 1.7,
                    "critResP": 3.1
                },
                {
                    "critDmgResP": 2,
                    "critResP": 3.6
                },
                {
                    "critDmgResP": 2.3,
                    "critResP": 4.2
                }
            ]
        },
        {
            "id": "spell_fatal_blow",
            "kind": "spell",
            "rarity": "高級",
            "name": "会心の一撃",
            "cost": 18,
            "bonusesByStar": [
                {
                    "critDmgP": 1.6,
                    "critRateP": 2.9
                },
                {
                    "critDmgP": 2,
                    "critRateP": 3.7
                },
                {
                    "critDmgP": 2.3,
                    "critRateP": 4.4
                },
                {
                    "critDmgP": 2.7,
                    "critRateP": 5.1
                },
                {
                    "critDmgP": 3.1,
                    "critRateP": 5.9
                }
            ]
        },
        {
            "id": "spell_keeping_fit",
            "kind": "spell",
            "rarity": "高級",
            "name": "体力強化",
            "cost": 18,
            "bonusesByStar": [
                {
                    "defP": 2.9,
                    "hpP": 3.9
                },
                {
                    "defP": 3.7,
                    "hpP": 4.9
                },
                {
                    "defP": 4.4,
                    "hpP": 5.9
                },
                {
                    "defP": 5.1,
                    "hpP": 6.8
                },
                {
                    "defP": 5.9,
                    "hpP": 7.8
                }
            ]
        },
        {
            "id": "spell_bulletproof",
            "kind": "spell",
            "rarity": "高級",
            "name": "防弾不壊",
            "cost": 17,
            "bonusesByStar": [
                {
                    "defP": 2.8,
                    "hpP": 3.7
                },
                {
                    "defP": 3.4,
                    "hpP": 4.6
                },
                {
                    "defP": 4.1,
                    "hpP": 5.5
                },
                {
                    "defP": 4.8,
                    "hpP": 6.4
                },
                {
                    "defP": 5.5,
                    "hpP": 7.3
                }
            ]
        },
        {
            "id": "spell_robust_health",
            "kind": "spell",
            "rarity": "高級",
            "name": "健康が一番",
            "cost": 15,
            "bonusesByStar": [
                {
                    "defP": 4.8
                },
                {
                    "defP": 6
                },
                {
                    "defP": 7.2
                },
                {
                    "defP": 8.4
                },
                {
                    "defP": 9.6
                }
            ]
        },
        {
            "id": "spell_where_you_lookin",
            "kind": "spell",
            "rarity": "高級",
            "name": "これ、残像だよ",
            "cost": 13,
            "bonusesByStar": [
                {
                    "hasteP": 3.3
                },
                {
                    "hasteP": 4.1
                },
                {
                    "hasteP": 5
                },
                {
                    "hasteP": 5.8
                },
                {
                    "hasteP": 6.6
                }
            ]
        },
        {
            "id": "spell_personal_training",
            "kind": "spell",
            "rarity": "高級",
            "name": "パーソナルトレーニング",
            "cost": 12,
            "bonusesByStar": [
                {
                    "critResP": 1.1,
                    "hpP": 2.5
                },
                {
                    "critResP": 1.4,
                    "hpP": 3.2
                },
                {
                    "critResP": 1.7,
                    "hpP": 3.8
                },
                {
                    "critResP": 2,
                    "hpP": 4.4
                },
                {
                    "critResP": 2.3,
                    "hpP": 5
                }
            ]
        },
        {
            "id": "spell_empower",
            "kind": "spell",
            "rarity": "高級",
            "name": "やればできる",
            "cost": 12,
            "bonusesByStar": [
                {
                    "atkP": 3.8
                },
                {
                    "atkP": 4.7
                },
                {
                    "atkP": 5.7
                },
                {
                    "atkP": 6.6
                },
                {
                    "atkP": 7.6
                }
            ]
        },
        {
            "id": "spell_wizard_apprentice",
            "kind": "spell",
            "rarity": "高級",
            "name": "見習い魔法使い",
            "cost": 12,
            "bonusesByStar": [
                {
                    "atkP": 1.9,
                    "critDmgP": 1
                },
                {
                    "atkP": 2.4,
                    "critDmgP": 1.3
                },
                {
                    "atkP": 2.8,
                    "critDmgP": 1.5
                },
                {
                    "atkP": 3.3,
                    "critDmgP": 1.8
                },
                {
                    "atkP": 3.8,
                    "critDmgP": 2
                }
            ]
        },
        {
            "id": "spell_get_her",
            "kind": "spell",
            "rarity": "高級",
            "name": "あいつを捕まえろ！",
            "cost": 11,
            "bonusesByStar": [
                {
                    "critRateP": 1.7,
                    "hasteP": 1.4
                },
                {
                    "critRateP": 2.2,
                    "hasteP": 1.7
                },
                {
                    "critRateP": 2.6,
                    "hasteP": 2.1
                },
                {
                    "critRateP": 3,
                    "hasteP": 2.4
                },
                {
                    "critRateP": 3.4,
                    "hasteP": 2.8
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_get_her_e01",
                    "type": "toggle",
                    "label": "1ウェーブ中 攻撃力増加",
                    "shortLabel": "攻撃力増加",
                    "valueClass": "倍率",
                    "description": "味方全体 / 倍率",
                    "descriptionByStar": [
                        "攻撃力増加15% (1ウェーブ中 / 味方全体)",
                        "攻撃力増加17.5% (1ウェーブ中 / 味方全体)",
                        "攻撃力増加20% (1ウェーブ中 / 味方全体)",
                        "攻撃力増加22.5% (1ウェーブ中 / 味方全体)",
                        "攻撃力増加25% (1ウェーブ中 / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "atkP": 15
                        },
                        {
                            "atkP": 17.5
                        },
                        {
                            "atkP": 20
                        },
                        {
                            "atkP": 22.5
                        },
                        {
                            "atkP": 25
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_random_coin",
            "kind": "spell",
            "rarity": "高級",
            "name": "ランダムコイン",
            "cost": 11,
            "bonusesByStar": [
                {
                    "hpP": 2.3
                },
                {
                    "hpP": 2.9
                },
                {
                    "hpP": 3.45
                },
                {
                    "hpP": 4.05
                },
                {
                    "hpP": 4.6
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_random_coin_e01",
                    "type": "toggle",
                    "label": "カード選択時 ランダム最低値 コイン獲得",
                    "shortLabel": "コイン獲得",
                    "valueClass": "固定値",
                    "description": "コイン / 固定値",
                    "descriptionByStar": [
                        "コイン獲得7 (カード選択時 / コイン)",
                        "コイン獲得9 (カード選択時 / コイン)",
                        "コイン獲得11 (カード選択時 / コイン)",
                        "コイン獲得13 (カード選択時 / コイン)",
                        "コイン獲得15 (カード選択時 / コイン)"
                    ],
                    "bonusesByStar": [
                        {
                            "coin": 7
                        },
                        {
                            "coin": 9
                        },
                        {
                            "coin": 11
                        },
                        {
                            "coin": 13
                        },
                        {
                            "coin": 15
                        }
                    ]
                },
                {
                    "id": "spell_random_coin_e02",
                    "type": "toggle",
                    "label": "カード選択時 ランダム最大値 コイン獲得",
                    "shortLabel": "コイン獲得",
                    "valueClass": "固定値",
                    "description": "コイン / 固定値",
                    "descriptionByStar": [
                        "コイン獲得15 (カード選択時 / コイン)",
                        "コイン獲得17 (カード選択時 / コイン)",
                        "コイン獲得19 (カード選択時 / コイン)",
                        "コイン獲得21 (カード選択時 / コイン)",
                        "コイン獲得23 (カード選択時 / コイン)"
                    ],
                    "bonusesByStar": [
                        {
                            "coin": 15
                        },
                        {
                            "coin": 17
                        },
                        {
                            "coin": 19
                        },
                        {
                            "coin": 21
                        },
                        {
                            "coin": 23
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_big_tree_bark",
            "kind": "spell",
            "rarity": "高級",
            "name": "巨木の皮",
            "cost": 11,
            "bonusesByStar": [
                {
                    "defP": 1.7,
                    "hpRecoveryP": 0.9
                },
                {
                    "defP": 2.2,
                    "hpRecoveryP": 1.2
                },
                {
                    "defP": 2.6,
                    "hpRecoveryP": 1.4
                },
                {
                    "defP": 3,
                    "hpRecoveryP": 1.6
                },
                {
                    "defP": 3.4,
                    "hpRecoveryP": 1.8
                }
            ]
        },
        {
            "id": "spell_trainee",
            "kind": "spell",
            "rarity": "高級",
            "name": "新人ファイター",
            "cost": 10,
            "bonusesByStar": [
                {
                    "atkP": 1.6,
                    "critRateP": 1.6
                },
                {
                    "atkP": 2,
                    "critRateP": 2
                },
                {
                    "atkP": 2.3,
                    "critRateP": 2.3
                },
                {
                    "atkP": 2.7,
                    "critRateP": 2.7
                },
                {
                    "atkP": 3.1,
                    "critRateP": 3.1
                }
            ]
        },
        {
            "id": "spell_soda_capsule",
            "kind": "spell",
            "rarity": "高級",
            "name": "ソーダ味カプセル",
            "cost": 5,
            "bonusesByStar": [
                {
                    "defP": 1.5
                },
                {
                    "defP": 1.9
                },
                {
                    "defP": 2.3
                },
                {
                    "defP": 2.6
                },
                {
                    "defP": 3
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_soda_capsule_e01",
                    "type": "toggle",
                    "label": "カード選択時 SP回復",
                    "shortLabel": "SP回復",
                    "valueClass": "固定値",
                    "description": "味方全体 / 固定値",
                    "descriptionByStar": [
                        "SP回復36 (カード選択時 / 味方全体)",
                        "SP回復46 (カード選択時 / 味方全体)",
                        "SP回復56 (カード選択時 / 味方全体)",
                        "SP回復66 (カード選択時 / 味方全体)",
                        "SP回復76 (カード選択時 / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "spRecovery": 36
                        },
                        {
                            "spRecovery": 46
                        },
                        {
                            "spRecovery": 56
                        },
                        {
                            "spRecovery": 66
                        },
                        {
                            "spRecovery": 76
                        }
                    ]
                }
            ]
        },
        {
            "id": "spell_strawberry_capsule",
            "kind": "spell",
            "rarity": "高級",
            "name": "イチゴ味カプセル",
            "cost": 4,
            "bonusesByStar": [
                {
                    "hpP": 1.6
                },
                {
                    "hpP": 2
                },
                {
                    "hpP": 2.4
                },
                {
                    "hpP": 2.8
                },
                {
                    "hpP": 3.2
                }
            ],
            "conditionalEffects": [
                {
                    "id": "spell_strawberry_capsule_e01",
                    "type": "toggle",
                    "label": "カード選択時 HP回復",
                    "shortLabel": "HP回復",
                    "valueClass": "倍率",
                    "description": "味方全体 / 参照:対象の最大HP / 倍率",
                    "descriptionByStar": [
                        "HP回復15% (カード選択時 / 味方全体)",
                        "HP回復16.5% (カード選択時 / 味方全体)",
                        "HP回復18% (カード選択時 / 味方全体)",
                        "HP回復19.5% (カード選択時 / 味方全体)",
                        "HP回復21% (カード選択時 / 味方全体)"
                    ],
                    "bonusesByStar": [
                        {
                            "hpRecoveryP": 15
                        },
                        {
                            "hpRecoveryP": 16.5
                        },
                        {
                            "hpRecoveryP": 18
                        },
                        {
                            "hpRecoveryP": 19.5
                        },
                        {
                            "hpRecoveryP": 21
                        }
                    ]
                }
            ]
        }
    ]
};

const CARD_SOLDER_DATA = {
    "artifact_yomi_moonflower": {
        "1": {
            "critDmgP": 2.8,
            "critRateP": 5.2
        },
        "2": {
            "critDmgP": 5.7,
            "critRateP": 10.5
        }
    },
    "artifact_erpin_ice_cream_cake": {
        "1": {
            "atkP": 3.8,
            "hpP": 4.9
        },
        "2": {
            "atkP": 7.5,
            "hpP": 9.9
        }
    },
    "artifact_butter_yellow_card": {
        "1": {
            "atkP": 4.4,
            "hasteP": 3.5
        },
        "2": {
            "atkP": 8.8,
            "hasteP": 7
        }
    },
    "artifact_vivi_silver_staff": {
        "1": {
            "critDmgResP": 1.6,
            "hpP": 6.4
        },
        "2": {
            "critDmgResP": 3.3,
            "hpP": 12.8
        }
    },
    "artifact_elena_enhanced_drone": {
        "1": {
            "atkP": 3.4,
            "hpP": 4.1
        },
        "2": {
            "atkP": 6.7,
            "hpP": 8.3
        }
    },
    "artifact_leets_worn_whetstone": {
        "1": {
            "defP": 4.6,
            "hpP": 4.6
        },
        "2": {
            "defP": 9.2,
            "hpP": 9.2
        }
    },
    "artifact_blanchet_bouquet": {
        "1": {
            "critDmgP": 1.1,
            "critRateP": 1.7
        },
        "2": {
            "critDmgP": 2.1,
            "critRateP": 3.3
        }
    },
    "artifact_picora_fashion_pouch": {
        "1": {
            "atkP": 4.6,
            "healingP": 3.7
        },
        "2": {
            "atkP": 9.2,
            "healingP": 7.4
        }
    },
    "artifact_xion_black_cape": {
        "1": {
            "atkP": 7.9,
            "critRateP": 3.3
        },
        "2": {
            "atkP": 15.8,
            "critRateP": 6.6
        }
    },
    "artifact_naia_dolphin_watergun": {
        "1": {
            "defP": 3.8,
            "hpP": 4.9
        },
        "2": {
            "defP": 7.5,
            "hpP": 9.9
        }
    },
    "artifact_shoupan_magical_backpack": {
        "1": {
            "atkP": 4.8,
            "hpP": 6.4
        },
        "2": {
            "atkP": 9.7,
            "hpP": 12.8
        }
    },
    "artifact_snorky_fedora": {
        "1": {
            "hasteP": 2.8,
            "hpP": 4.7
        },
        "2": {
            "hasteP": 5.7,
            "hpP": 9.4
        }
    },
    "artifact_selene_midnight_mirage": {
        "1": {
            "critDmgResP": 1.9,
            "critResP": 3.4
        },
        "2": {
            "critDmgResP": 3.8,
            "critResP": 6.9
        }
    },
    "artifact_kyarot_sugarcane": {
        "1": {
            "defP": 3.3,
            "hasteP": 2.6
        },
        "2": {
            "defP": 6.7,
            "hasteP": 5.3
        }
    },
    "artifact_chloe_sewing_chest": {
        "1": {
            "critResP": 3.7,
            "hasteP": 4.9
        },
        "2": {
            "critResP": 7.4,
            "hasteP": 9.9
        }
    },
    "artifact_risty_replica_glove": {
        "1": {
            "atkP": 3.8,
            "critDmgP": 2
        },
        "2": {
            "atkP": 7.5,
            "critDmgP": 4
        }
    },
    "artifact_barong_cursed_doll": {
        "1": {
            "atkP": 4.8,
            "defP": 4.8
        },
        "2": {
            "atkP": 9.6,
            "defP": 9.6
        }
    },
    "artifact_tig_blazing_sword": {
        "1": {
            "atkP": 4.9,
            "critDmgP": 3.7
        },
        "2": {
            "atkP": 9.9,
            "critDmgP": 7.4
        }
    },
    "artifact_rudd_exercise_manual": {
        "1": {
            "hpP": 4.8
        },
        "2": {
            "hpP": 9.7
        }
    },
    "artifact_rollett_magic_hat": {
        "1": {
            "atkP": 3.8,
            "critRateP": 2
        },
        "2": {
            "atkP": 7.5,
            "critRateP": 4
        }
    },
    "artifact_dragonlight_sword": {
        "1": {
            "atkP": 10
        },
        "2": {
            "atkP": 20.1
        }
    },
    "artifact_life_gem": {
        "1": {
            "critDmgResP": 1.6,
            "hpP": 6.1
        },
        "2": {
            "critDmgResP": 3.1,
            "hpP": 12.3
        }
    },
    "artifact_30kg_kettlebell": {
        "1": {
            "critDmgP": 2.3,
            "critRateP": 4.4
        },
        "2": {
            "critDmgP": 4.7,
            "critRateP": 8.8
        }
    },
    "artifact_mithril_knife": {
        "1": {
            "atkP": 4.1,
            "hasteP": 3.4
        },
        "2": {
            "atkP": 8.3,
            "hasteP": 6.7
        }
    },
    "artifact_fluffy_vest": {
        "1": {
            "defP": 6.6
        },
        "2": {
            "defP": 13.2
        }
    },
    "artifact_eldyne_lamp": {
        "1": {
            "hpP": 4.1,
            "healingP": 2.5
        },
        "2": {
            "hpP": 8.3,
            "healingP": 5
        }
    },
    "artifact_assassin_scroll": {
        "1": {
            "atkP": 2,
            "critRateP": 2
        },
        "2": {
            "atkP": 4.1,
            "critRateP": 4.1
        }
    },
    "artifact_sword_and_staff": {
        "1": {
            "atkP": 3.4,
            "hasteP": 2.7
        },
        "2": {
            "atkP": 6.9,
            "hasteP": 5.5
        }
    },
    "artifact_safety_harness": {
        "1": {
            "hpP": 8.8
        },
        "2": {
            "hpP": 17.5
        }
    },
    "artifact_combat_manual": {
        "1": {
            "critDmgP": 1.6,
            "critRateP": 2.9
        },
        "2": {
            "critDmgP": 3.2,
            "critRateP": 5.9
        }
    },
    "artifact_jade_codex": {
        "1": {
            "atkP": 5.9
        },
        "2": {
            "atkP": 11.8
        }
    },
    "artifact_scale_armor": {
        "1": {
            "defP": 2.5,
            "hpRecoveryP": 1.3
        },
        "2": {
            "defP": 5,
            "hpRecoveryP": 2.6
        }
    },
    "artifact_blessed_pauldrons": {
        "1": {
            "defP": 2.3,
            "hpP": 3
        },
        "2": {
            "defP": 4.6,
            "hpP": 6.1
        }
    },
    "artifact_chalice_of_origins": {
        "1": {
            "critDmgP": 1.2,
            "hasteP": 1.7
        },
        "2": {
            "critDmgP": 2.4,
            "hasteP": 3.4
        }
    },
    "artifact_grail_of_origins": {
        "1": {
            "defP": 4.3
        },
        "2": {
            "defP": 8.7
        }
    },
    "artifact_fanatic_mask": {
        "1": {
            "critDmgResP": 1.3
        },
        "2": {
            "critDmgResP": 2.7
        }
    },
    "artifact_healing_pendant": {
        "1": {
            "healingP": 3.2
        },
        "2": {
            "healingP": 6.4
        }
    },
    "artifact_obsidian_shuriken": {
        "1": {
            "atkP": 3.3
        },
        "2": {
            "atkP": 6.7
        }
    },
    "artifact_ring_of_greed": {
        "1": {
            "critDmgResP": 0.8
        },
        "2": {
            "critDmgResP": 1.7
        }
    },
    "artifact_old_wooden_dagger": {
        "1": {
            "critDmgP": 1.3
        },
        "2": {
            "critDmgP": 2.6
        }
    },
    "artifact_elven_wand": {
        "1": {
            "hpRecoveryP": 1.1
        },
        "2": {
            "hpRecoveryP": 2.2
        }
    },
    "artifact_gemstone_ring": {
        "1": {
            "atkP": 1,
            "critDmgP": 0.6
        },
        "2": {
            "atkP": 2.1,
            "critDmgP": 1.1
        }
    },
    "artifact_crown_of_thorns": {
        "1": {
            "defP": 1.9
        },
        "2": {
            "defP": 3.8
        }
    },
    "artifact_weathered_arrow": {
        "1": {
            "hasteP": 1.5
        },
        "2": {
            "hasteP": 3
        }
    },
    "artifact_icy_charm": {
        "1": {
            "critResP": 1.1
        },
        "2": {
            "critResP": 2.2
        }
    },
    "artifact_cotton_cloak": {
        "1": {
            "critResP": 1.1
        },
        "2": {
            "critResP": 2.2
        }
    },
    "artifact_shining_tiara": {
        "1": {
            "hpP": 1.1,
            "healingP": 0.7
        },
        "2": {
            "hpP": 2.3,
            "healingP": 1.4
        }
    },
    "artifact_cardboard_armor": {
        "1": {
            "defP": 1.6
        },
        "2": {
            "defP": 3.3
        }
    },
    "artifact_head_wrap": {
        "1": {
            "hpP": 2
        },
        "2": {
            "hpP": 4
        }
    },
    "artifact_rusty_awl": {
        "1": {
            "critRateP": 1.1
        },
        "2": {
            "critRateP": 2.2
        }
    },
    "spell_alice_fake_magic": {
        "1": {
            "atkP": 1.9,
            "critRateP": 1.9
        },
        "2": {
            "atkP": 3.9,
            "critRateP": 3.9
        }
    },
    "spell_epica_hero_exaltation": {
        "1": {
            "atkP": 2.6,
            "critDmgP": 1.3
        },
        "2": {
            "atkP": 5.2,
            "critDmgP": 2.7
        }
    },
    "spell_luc_ed_dream": {
        "1": {
            "critDmgResP": 1,
            "critResP": 1.9
        },
        "2": {
            "critDmgResP": 2.1,
            "critResP": 3.8
        }
    },
    "spell_renewa_time_paradox": {
        "1": {
            "critDmgP": 1.2,
            "critRateP": 2.3
        },
        "2": {
            "critDmgP": 2.4,
            "critRateP": 4.6
        }
    },
    "spell_aya_snowflake_magic": {
        "1": {
            "critDmgP": 1.2,
            "critRateP": 2.3
        },
        "2": {
            "critDmgP": 2.4,
            "critRateP": 4.6
        }
    },
    "spell_fatal_charm": {
        "1": {
            "critDmgP": 1.2,
            "critRateP": 2.4
        },
        "2": {
            "critDmgP": 2.5,
            "critRateP": 4.8
        }
    },
    "spell_strange_elixir": {
        "1": {
            "critDmgP": 2.9,
            "critRateP": 4.7
        },
        "2": {
            "critDmgP": 3.7,
            "critRateP": 5.9
        }
    },
    "spell_combat_master": {
        "1": {
            "atkP": 4
        },
        "2": {
            "atkP": 8.1
        }
    },
    "spell_aroma_therapy": {
        "1": {
            "healingP": 0.6,
            "hpRecoveryP": 0.4
        },
        "2": {
            "healingP": 1.3,
            "hpRecoveryP": 0.9
        }
    },
    "spell_cheer_up": {
        "1": {
            "critRateP": 1.5,
            "hasteP": 1.2
        },
        "2": {
            "critRateP": 3,
            "hasteP": 2.4
        }
    },
    "spell_warm_hearted": {
        "1": {
            "healingP": 1.1,
            "hpP": 1.8
        },
        "2": {
            "healingP": 2.2,
            "hpP": 3.6
        }
    },
    "spell_stealth_slacker": {
        "1": {
            "critDmgP": 1.3
        },
        "2": {
            "critDmgP": 2.7
        }
    },
    "spell_vanguard": {
        "1": {
            "defP": 2.5
        },
        "2": {
            "defP": 4.9
        }
    },
    "spell_rear_guard": {
        "1": {
            "hasteP": 2
        },
        "2": {
            "hasteP": 3.9
        }
    },
    "spell_personality_mad": {
        "1": {
            "atkP": 1.9
        },
        "2": {
            "atkP": 3.9
        }
    },
    "spell_personality_vivacious": {
        "1": {
            "critRateP": 1.9
        },
        "2": {
            "critRateP": 3.9
        }
    },
    "spell_personality_innocent": {
        "1": {
            "hpRecoveryP": 1
        },
        "2": {
            "hpRecoveryP": 2
        }
    },
    "spell_personality_depressed": {
        "1": {
            "defP": 1.9
        },
        "2": {
            "defP": 3.9
        }
    },
    "spell_personality_composed": {
        "1": {
            "critDmgP": 1
        },
        "2": {
            "critDmgP": 2
        }
    },
    "spell_swift_move": {
        "1": {
            "critDmgP": 0.5,
            "hasteP": 0.8
        },
        "2": {
            "critDmgP": 1,
            "hasteP": 1.5
        }
    },
    "spell_firm_belief": {
        "1": {
            "critDmgResP": 0.3,
            "critResP": 0.5
        },
        "2": {
            "critDmgResP": 0.6,
            "critResP": 1
        }
    },
    "spell_fatal_blow": {
        "1": {
            "critDmgP": 0.4,
            "critRateP": 0.7
        },
        "2": {
            "critDmgP": 0.8,
            "critRateP": 1.4
        }
    },
    "spell_keeping_fit": {
        "1": {
            "defP": 0.7,
            "hpP": 1
        },
        "2": {
            "defP": 1.4,
            "hpP": 2
        }
    },
    "spell_bulletproof": {
        "1": {
            "defP": 0.7,
            "hpP": 1
        },
        "2": {
            "defP": 1.4,
            "hpP": 1.9
        }
    },
    "spell_robust_health": {
        "1": {
            "defP": 1.2
        },
        "2": {
            "defP": 2.4
        }
    },
    "spell_where_you_lookin": {
        "1": {
            "hasteP": 0.8
        },
        "2": {
            "hasteP": 1.7
        }
    },
    "spell_personal_training": {
        "1": {
            "critResP": 0.2,
            "hpP": 0.7
        },
        "2": {
            "critResP": 0.5,
            "hpP": 1.3
        }
    },
    "spell_empower": {
        "1": {
            "atkP": 0.9
        },
        "2": {
            "atkP": 1.9
        }
    },
    "spell_wizard_apprentice": {
        "1": {
            "atkP": 0.5,
            "critDmgP": 0.3
        },
        "2": {
            "atkP": 0.9,
            "critDmgP": 0.5
        }
    },
    "spell_get_her": {
        "1": {
            "critRateP": 0.5,
            "hasteP": 0.3
        },
        "2": {
            "critRateP": 0.9,
            "hasteP": 0.7
        }
    },
    "spell_random_coin": {
        "1": {
            "hpP": 1.2
        },
        "2": {
            "hpP": 2.3
        }
    },
    "spell_big_tree_bark": {
        "1": {
            "defP": 0.5,
            "hpRecoveryP": 0.3
        },
        "2": {
            "defP": 0.9,
            "hpRecoveryP": 0.5
        }
    },
    "spell_trainee": {
        "1": {
            "atkP": 0.4,
            "critRateP": 0.4
        },
        "2": {
            "atkP": 0.8,
            "critRateP": 0.8
        }
    },
    "spell_soda_capsule": {
        "1": {
            "defP": 0.4
        },
        "2": {
            "defP": 0.8
        }
    },
    "spell_strawberry_capsule": {
        "1": {
            "hpP": 0.4
        },
        "2": {
            "hpP": 0.8
        }
    }
};

const CARD_ID_ALIASES = {
    "relic_yomi_flower": "artifact_yomi_moonflower",
    "relic_elfin_ice_cake": "artifact_erpin_ice_cream_cake",
    "relic_butter_yellow_card": "artifact_butter_yellow_card",
    "relic_vivi_baton": "artifact_vivi_silver_staff",
    "relic_elena_drone": "artifact_elena_enhanced_drone",
    "relic_ritz_whetstone": "artifact_leets_worn_whetstone",
    "relic_blanse_bouquet": "artifact_blanchet_bouquet",
    "relic_picola_pouch": "artifact_picora_fashion_pouch",
    "relic_shion_black_cloak": "artifact_xion_black_cape",
    "relic_naia_watergun": "artifact_naia_dolphin_watergun",
    "relic_shupan_backpack": "artifact_shoupan_magical_backpack",
    "relic_snoky_fedora": "artifact_snorky_fedora",
    "relic_serine_night_mirage": "artifact_selene_midnight_mirage",
    "relic_carrot_cane": "artifact_kyarot_sugarcane",
    "relic_chloe_sewing_chest": "artifact_chloe_sewing_chest",
    "relic_listy_replica_glove": "artifact_risty_replica_glove",
    "relic_barong_cursed_doll": "artifact_barong_cursed_doll",
    "relic_tig_blazing_sword": "artifact_tig_blazing_sword",
    "relic_rudd_exercise_manual": "artifact_rudd_exercise_manual",
    "relic_rollett_magic_hat": "artifact_rollett_magic_hat",
    "relic_dragon_sword": "artifact_dragonlight_sword",
    "relic_life_gem": "artifact_life_gem",
    "relic_30kg_kettlebell": "artifact_30kg_kettlebell",
    "relic_nisril_knife": "artifact_mithril_knife",
    "relic_fuwafuwa_vest": "artifact_fluffy_vest",
    "relic_eldain_lamp": "artifact_eldyne_lamp",
    "relic_assassin_book": "artifact_assassin_scroll",
    "relic_sword_staff": "artifact_sword_and_staff",
    "relic_safety_belt": "artifact_safety_harness",
    "relic_battle_manual": "artifact_combat_manual",
    "relic_blue_grimoire": "artifact_jade_codex",
    "relic_scale_armor": "artifact_scale_armor",
    "relic_blessed_pauldron": "artifact_blessed_pauldrons",
    "relic_origin_grail": "artifact_chalice_of_origins",
    "relic_high_priest_censer": "artifact_grail_of_origins",
    "relic_madness_mask": "artifact_fanatic_mask",
    "relic_healing_pendant": "artifact_healing_pendant",
    "relic_obsidian_shuriken": "artifact_obsidian_shuriken",
    "relic_greed_ring": "artifact_ring_of_greed",
    "relic_oldwood_dagger": "artifact_old_wooden_dagger",
    "relic_elf_staff": "artifact_elven_wand",
    "relic_gem_ring": "artifact_gemstone_ring",
    "relic_thorn_crown": "artifact_crown_of_thorns",
    "relic_old_arrow": "artifact_weathered_arrow",
    "relic_frost_charm": "artifact_icy_charm",
    "relic_furoshiki_robe": "artifact_cotton_cloak",
    "relic_shining_tiara": "artifact_shining_tiara",
    "relic_cardboard_armor": "artifact_cardboard_armor",
    "relic_head_towel": "artifact_head_wrap",
    "relic_rusty_awl": "artifact_rusty_awl",
    "spell_alice_hex": "spell_alice_fake_magic",
    "spell_epica_anthem": "spell_epica_hero_exaltation",
    "spell_yiide_dream": "spell_luc_ed_dream",
    "spell_beauty_is_sin": "spell_fatal_charm",
    "spell_suspicious_potion": "spell_strange_elixir",
    "spell_battle_master": "spell_combat_master",
    "spell_aromatherapy": "spell_aroma_therapy",
    "spell_motivation_up": "spell_cheer_up",
    "spell_caring": "spell_warm_hearted",
    "spell_center_best": "spell_stealth_slacker",
    "spell_frontline": "spell_vanguard",
    "spell_backline": "spell_rear_guard",
    "spell_personality_madness": "spell_personality_mad",
    "spell_personality_lively": "spell_personality_vivacious",
    "spell_personality_pure": "spell_personality_innocent",
    "spell_personality_gloomy": "spell_personality_depressed",
    "spell_personality_calm": "spell_personality_composed",
    "spell_speedy_movement": "spell_swift_move",
    "spell_firm_conviction": "spell_firm_belief",
    "spell_critical_strike": "spell_fatal_blow",
    "spell_hp_training": "spell_keeping_fit",
    "spell_health_best": "spell_robust_health",
    "spell_afterimage": "spell_where_you_lookin",
    "spell_you_can_do_it": "spell_empower",
    "spell_apprentice_mage": "spell_wizard_apprentice",
    "spell_catch_him": "spell_get_her",
    "spell_tree_bark": "spell_big_tree_bark",
    "spell_rookie_fighter": "spell_trainee"
};

const CARD_EFFECT_ID_ALIASES = {
    "relic_yomi_flower|same_lane_taken_reduction": {
        "cardId": "artifact_yomi_moonflower",
        "effectId": "artifact_yomi_moonflower_e01"
    },
    "relic_yomi_flower|magic_attack_power_up": {
        "cardId": "artifact_yomi_moonflower",
        "effectId": "artifact_yomi_moonflower_e02"
    },
    "relic_elfin_ice_cake|zero_kill_magic_damage": {
        "cardId": "artifact_erpin_ice_cream_cake",
        "effectId": "artifact_erpin_ice_cream_cake_e01"
    },
    "relic_butter_yellow_card|enhanced_attack_damage": {
        "cardId": "artifact_butter_yellow_card",
        "effectId": "artifact_butter_yellow_card_e01"
    },
    "relic_vivi_baton|normal_stack_defense": {
        "cardId": "artifact_vivi_silver_staff",
        "effectId": "artifact_vivi_silver_staff_e01"
    },
    "relic_vivi_baton|max_stack": {
        "cardId": "artifact_vivi_silver_staff",
        "effectId": "artifact_vivi_silver_staff_e02"
    },
    "relic_vivi_baton|max_stack_defense": {
        "cardId": "artifact_vivi_silver_staff",
        "effectId": "artifact_vivi_silver_staff_e03"
    },
    "relic_vivi_baton|max_stack_hp": {
        "cardId": "artifact_vivi_silver_staff",
        "effectId": "artifact_vivi_silver_staff_e04"
    },
    "relic_elena_drone|low_grade_skill_haste": {
        "cardId": "artifact_elena_enhanced_drone",
        "effectId": "artifact_elena_enhanced_drone_e01"
    },
    "relic_ritz_whetstone|normal_attack_taken_reduction": {
        "cardId": "artifact_leets_worn_whetstone",
        "effectId": "artifact_leets_worn_whetstone_e01"
    },
    "relic_ritz_whetstone|normal_twice_heal": {
        "cardId": "artifact_leets_worn_whetstone",
        "effectId": "artifact_leets_worn_whetstone_e02"
    },
    "relic_blanse_bouquet|low_grade_magic_def_down": {
        "cardId": "artifact_blanchet_bouquet",
        "effectId": "artifact_blanchet_bouquet_e01"
    },
    "relic_blanse_bouquet|max_stack": {
        "cardId": "artifact_blanchet_bouquet",
        "effectId": "artifact_blanchet_bouquet_e02"
    },
    "relic_picola_pouch|target_defense_up": {
        "cardId": "artifact_picora_fashion_pouch",
        "effectId": "artifact_picora_fashion_pouch_e01"
    },
    "relic_shion_black_cloak|single_enemy_damage_up": {
        "cardId": "artifact_xion_black_cape",
        "effectId": "artifact_xion_black_cape_e01"
    },
    "relic_naia_watergun|after_skill_healing_up": {
        "cardId": "artifact_naia_dolphin_watergun",
        "effectId": "artifact_naia_dolphin_watergun_e01"
    },
    "relic_naia_watergun|cool_time": {
        "cardId": "artifact_naia_dolphin_watergun",
        "effectId": "artifact_naia_dolphin_watergun_e02"
    },
    "relic_shupan_backpack|same_lane_taken_reduction": {
        "cardId": "artifact_shoupan_magical_backpack",
        "effectId": "artifact_shoupan_magical_backpack_e01"
    },
    "relic_shupan_backpack|cool_time": {
        "cardId": "artifact_shoupan_magical_backpack",
        "effectId": "artifact_shoupan_magical_backpack_e02"
    },
    "relic_snoky_fedora|hp50_max_hp_up": {
        "cardId": "artifact_snorky_fedora",
        "effectId": "artifact_snorky_fedora_e01"
    },
    "relic_snoky_fedora|hp50_max_def_up": {
        "cardId": "artifact_snorky_fedora",
        "effectId": "artifact_snorky_fedora_e02"
    },
    "relic_serine_night_mirage|skill_self_recover": {
        "cardId": "artifact_selene_midnight_mirage",
        "effectId": "artifact_selene_midnight_mirage_e01"
    },
    "relic_serine_night_mirage|skill_self_shield": {
        "cardId": "artifact_selene_midnight_mirage",
        "effectId": "artifact_selene_midnight_mirage_e02"
    },
    "relic_carrot_cane|same_lane_sp_recover": {
        "cardId": "artifact_kyarot_sugarcane",
        "effectId": "artifact_kyarot_sugarcane_e01"
    },
    "relic_chloe_sewing_chest|shield_taken_reduction": {
        "cardId": "artifact_chloe_sewing_chest",
        "effectId": "artifact_chloe_sewing_chest_e01"
    },
    "relic_listy_replica_glove|normal_attack_6_crit_rate_up": {
        "cardId": "artifact_risty_replica_glove",
        "effectId": "artifact_risty_replica_glove_e01"
    },
    "relic_barong_cursed_doll|target_debuff_enhanced_attack_damage": {
        "cardId": "artifact_barong_cursed_doll",
        "effectId": "artifact_barong_cursed_doll_e01"
    },
    "relic_tig_blazing_sword|normal_attack_3_haste": {
        "cardId": "artifact_tig_blazing_sword",
        "effectId": "artifact_tig_blazing_sword_e01"
    },
    "relic_tig_blazing_sword|max_stack": {
        "cardId": "artifact_tig_blazing_sword",
        "effectId": "artifact_tig_blazing_sword_e02"
    },
    "relic_rudd_exercise_manual|rudd_hp_recovery": {
        "cardId": "artifact_rudd_exercise_manual",
        "effectId": "artifact_rudd_exercise_manual_e01"
    },
    "relic_rollett_magic_hat|triple_enemy_skill_damage_boost": {
        "cardId": "artifact_rollett_magic_hat",
        "effectId": "artifact_rollett_magic_hat_e01"
    },
    "relic_dragon_sword|time_haste": {
        "cardId": "artifact_dragonlight_sword",
        "effectId": "artifact_dragonlight_sword_e01"
    },
    "relic_life_gem|low_hp_self_heal": {
        "cardId": "artifact_life_gem",
        "effectId": "artifact_life_gem_e01"
    },
    "relic_30kg_kettlebell|skill_damage_up": {
        "cardId": "artifact_30kg_kettlebell",
        "effectId": "artifact_30kg_kettlebell_e01"
    },
    "relic_30kg_kettlebell|normal_damage_down": {
        "cardId": "artifact_30kg_kettlebell",
        "effectId": "artifact_30kg_kettlebell_e02"
    },
    "relic_assassin_book|blind_effect": {
        "cardId": "artifact_assassin_scroll",
        "effectId": "artifact_assassin_scroll_e01"
    },
    "relic_safety_belt|opening_lane_shield": {
        "cardId": "artifact_safety_harness",
        "effectId": "artifact_safety_harness_e01"
    },
    "relic_blue_grimoire|skill_damage_boost": {
        "cardId": "artifact_jade_codex",
        "effectId": "artifact_jade_codex_e01"
    },
    "relic_blessed_pauldron|hp_regen": {
        "cardId": "artifact_blessed_pauldrons",
        "effectId": "artifact_blessed_pauldrons_e01"
    },
    "relic_origin_grail|normal_hit_sp_recover": {
        "cardId": "artifact_chalice_of_origins",
        "effectId": "artifact_chalice_of_origins_e01"
    },
    "relic_high_priest_censer|shield_received_up": {
        "cardId": "artifact_grail_of_origins",
        "effectId": "artifact_grail_of_origins_e01"
    },
    "relic_madness_mask|aoe_fixed_damage": {
        "cardId": "artifact_fanatic_mask",
        "effectId": "artifact_fanatic_mask_e01"
    },
    "relic_healing_pendant|sp_regen": {
        "cardId": "artifact_healing_pendant",
        "effectId": "artifact_healing_pendant_e01"
    },
    "relic_obsidian_shuriken|normal_attack_damage_up": {
        "cardId": "artifact_obsidian_shuriken",
        "effectId": "artifact_obsidian_shuriken_e01"
    },
    "relic_greed_ring|status_damage_up": {
        "cardId": "artifact_ring_of_greed",
        "effectId": "artifact_ring_of_greed_e01"
    },
    "relic_oldwood_dagger|sp_regen": {
        "cardId": "artifact_old_wooden_dagger",
        "effectId": "artifact_old_wooden_dagger_e01"
    },
    "relic_elf_staff|opening_shield": {
        "cardId": "artifact_elven_wand",
        "effectId": "artifact_elven_wand_e01"
    },
    "relic_frost_charm|debuff_resist": {
        "cardId": "artifact_icy_charm",
        "effectId": "artifact_icy_charm_e01"
    },
    "relic_frost_charm|cool_time": {
        "cardId": "artifact_icy_charm",
        "effectId": "artifact_icy_charm_e02"
    },
    "relic_thorn_crown|skill_damage_up": {
        "cardId": "artifact_crown_of_thorns",
        "effectId": "artifact_crown_of_thorns_e01"
    },
    "spell_alice_hex|alice_party_heal_min": {
        "cardId": "spell_alice_fake_magic",
        "effectId": "spell_alice_fake_magic_e01"
    },
    "spell_alice_hex|alice_party_heal_max": {
        "cardId": "spell_alice_fake_magic",
        "effectId": "spell_alice_fake_magic_e02"
    },
    "spell_alice_hex|alice_party_sp_min": {
        "cardId": "spell_alice_fake_magic",
        "effectId": "spell_alice_fake_magic_e03"
    },
    "spell_alice_hex|alice_party_sp_max": {
        "cardId": "spell_alice_fake_magic",
        "effectId": "spell_alice_fake_magic_e04"
    },
    "spell_epica_anthem|epica_grade_up": {
        "cardId": "spell_epica_hero_exaltation",
        "effectId": "spell_epica_hero_exaltation_e01"
    },
    "spell_yiide_dream|yiide_frontline_reduce": {
        "cardId": "spell_luc_ed_dream",
        "effectId": "spell_luc_ed_dream_e01"
    },
    "spell_yiide_dream|yiide_guard_def": {
        "cardId": "spell_luc_ed_dream",
        "effectId": "spell_luc_ed_dream_e02"
    },
    "spell_renewa_time_paradox|renewa_wave_damage_up": {
        "cardId": "spell_renewa_time_paradox",
        "effectId": "spell_renewa_time_paradox_e01"
    },
    "spell_suspicious_potion|suspicious_poison": {
        "cardId": "spell_strange_elixir",
        "effectId": "spell_strange_elixir_e01"
    },
    "spell_suspicious_potion|suspicious_poisonDuration": {
        "cardId": "spell_strange_elixir",
        "effectId": "spell_strange_elixir_e02"
    },
    "spell_battle_master|battle_master_skill_damage": {
        "cardId": "spell_combat_master",
        "effectId": "spell_combat_master_e01"
    },
    "spell_aromatherapy|aroma_full_sp": {
        "cardId": "spell_aroma_therapy",
        "effectId": "spell_aroma_therapy_e01"
    },
    "spell_center_best|center_row_damage": {
        "cardId": "spell_stealth_slacker",
        "effectId": "spell_stealth_slacker_e01"
    },
    "spell_center_best|center_row_reduce": {
        "cardId": "spell_stealth_slacker",
        "effectId": "spell_stealth_slacker_e02"
    },
    "spell_frontline|frontline_row_damage": {
        "cardId": "spell_vanguard",
        "effectId": "spell_vanguard_e01"
    },
    "spell_frontline|frontline_row_reduce": {
        "cardId": "spell_vanguard",
        "effectId": "spell_vanguard_e02"
    },
    "spell_backline|backline_row_damage": {
        "cardId": "spell_rear_guard",
        "effectId": "spell_rear_guard_e01"
    },
    "spell_backline|backline_row_reduce": {
        "cardId": "spell_rear_guard",
        "effectId": "spell_rear_guard_e02"
    },
    "spell_personality_madness|madness_personality": {
        "cardId": "spell_personality_mad",
        "effectId": "spell_personality_mad_e01"
    },
    "spell_personality_lively|lively_personality": {
        "cardId": "spell_personality_vivacious",
        "effectId": "spell_personality_vivacious_e01"
    },
    "spell_personality_pure|pure_personality": {
        "cardId": "spell_personality_innocent",
        "effectId": "spell_personality_innocent_e01"
    },
    "spell_personality_gloomy|gloomy_personality": {
        "cardId": "spell_personality_depressed",
        "effectId": "spell_personality_depressed_e01"
    },
    "spell_personality_calm|calm_personality": {
        "cardId": "spell_personality_composed",
        "effectId": "spell_personality_composed_e01"
    },
    "spell_catch_him|catch_him_wave": {
        "cardId": "spell_get_her",
        "effectId": "spell_get_her_e01"
    },
    "spell_random_coin|random_coin_coin_min": {
        "cardId": "spell_random_coin",
        "effectId": "spell_random_coin_e01"
    },
    "spell_random_coin|random_coin_coin_max": {
        "cardId": "spell_random_coin",
        "effectId": "spell_random_coin_e02"
    },
    "spell_soda_capsule|soda_capsule_sp": {
        "cardId": "spell_soda_capsule",
        "effectId": "spell_soda_capsule_e01"
    },
    "spell_strawberry_capsule|strawberry_capsule_heal": {
        "cardId": "spell_strawberry_capsule",
        "effectId": "spell_strawberry_capsule_e01"
    }
};

function resolveCardIdAlias(id) {
    const key = String(id || '');
    return CARD_ID_ALIASES[key] || key;
}

function migrateCardStateMap(source) {
    const input = source && typeof source === 'object' ? source : {};
    const result = {};
    for (const [id, value] of Object.entries(input)) {
        if (!CARD_ID_ALIASES[id]) result[id] = value;
    }
    for (const [id, value] of Object.entries(input)) {
        const currentId = resolveCardIdAlias(id);
        if (!Object.prototype.hasOwnProperty.call(result, currentId)) result[currentId] = value;
    }
    return result;
}

function migrateCardEffectStateMap(source) {
    const input = source && typeof source === 'object' ? source : {};
    const result = {};
    for (const [rawKey, value] of Object.entries(input)) {
        let key = String(rawKey || '');
        for (const [legacyKey, current] of Object.entries(CARD_EFFECT_ID_ALIASES)) {
            const separator = legacyKey.indexOf('|');
            const oldCardId = legacyKey.slice(0, separator);
            const oldEffectId = legacyKey.slice(separator + 1);
            const cardToken = `:${oldCardId}:`;
            const effectToken = `:${oldEffectId}:`;
            if (!key.includes(cardToken) || !key.includes(effectToken)) continue;
            key = key.replace(cardToken, `:${current.cardId}:`);
            key = key.replace(effectToken, `:${current.effectId}:`);
            break;
        }
        result[key] = value;
    }
    return result;
}

for (const card of [...CARD_LIBRARY.artifacts, ...CARD_LIBRARY.spells]) {
    if (CARD_SOLDER_DATA[card.id]) {
        card.solderBonuses = CARD_SOLDER_DATA[card.id];
    }
}

const CARD_INDEX = Object.fromEntries(
    [...CARD_LIBRARY.artifacts, ...CARD_LIBRARY.spells].map(card => [card.id, card])
);
