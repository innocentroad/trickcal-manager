// Trickcal Damage Calculator - Card Data (foundation)
// This file stores cards in a calculation-friendly format.

const CARD_LIBRARY = {
    artifacts: [
        {
            id: "relic_yomi_flower",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "ヨミ",
            name: "ヨミの向月葵の花",
            cost: 26,
            bonusesByStar: [
                { critRateP: 21.0, critDmgP: 11.2 },
                { critRateP: 26.3, critDmgP: 14.0 },
                { critRateP: 31.6, critDmgP: 16.8 },
                { critRateP: 36.8, critDmgP: 19.6 },
                { critRateP: 42.1, critDmgP: 22.4 }
            ],
            conditionalEffects: [
                {
                    id: "same_lane_taken_reduction",
                    type: "toggle",
                    label: "同列 被ダメージ減少",
                    shortLabel: "同列 被ダメ減",
                    bonusesByStar: [
                        { takenDmgP: 11.5 },
                        { takenDmgP: 13.5 },
                        { takenDmgP: 15.5 },
                        { takenDmgP: 17.5 },
                        { takenDmgP: 19.5 }
                    ]
                },
                {
                    id: "magic_attack_power_up",
                    type: "toggle",
                    label: "同列かつ魔法攻撃時 攻撃力増加",
                    shortLabel: "同列 魔法攻撃力+",
                    onlyWhenDmgType: "mag",
                    description: "着用者と同じ列の味方にのみ適用",
                    bonusesByStar: [
                        { atkP: 11.5 },
                        { atkP: 13.5 },
                        { atkP: 15.5 },
                        { atkP: 17.5 },
                        { atkP: 19.5 }
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 低学年スキル 強化",
                    description: "満月の使者"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "魔法攻撃力・会心抵抗・会心ダメージ抵抗+9%"
                }
            ]
        },
        {
            id: "relic_elfin_ice_cake",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "エルフィン",
            name: "エルフィンのアイスケーキ",
            cost: 19,
            bonusesByStar: [
                { atkP: 14.9, hpP: 19.9 },
                { atkP: 18.7, hpP: 24.9 },
                { atkP: 22.4, hpP: 29.8 },
                { atkP: 26.1, hpP: 34.8 },
                { atkP: 29.8, hpP: 39.8 }
            ],
            conditionalEffects: [
                {
                    id: "zero_kill_magic_damage",
                    type: "toggle",
                    label: "撃破0体時 魔法与ダメ増",
                    shortLabel: "0撃破 魔法与ダメ増",
                    defaultEnabled: true,
                    onlyWhenDmgType: "mag",
                    nonStacking: true,
                    description: "敵を1体でも撃破すると消失 / ウェーブごとに更新 / スタックしない",
                    bonusesByStar: [
                        { addP: 40.0 },
                        { addP: 47.0 },
                        { addP: 54.0 },
                        { addP: 61.0 },
                        { addP: 68.0 }
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 強化攻撃 強化",
                    description: "アイスケーキを食べてSP回復 / 次に使用するスキルの与ダメージ増加"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "魔法攻撃力・会心・会心ダメージ+9%"
                }
            ]
        },
        {
            id: "relic_butter_yellow_card",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "バター",
            name: "バターのイエローカード",
            cost: 22,
            bonusesByStar: [
                { atkP: 17.5, hasteP: 14.0 },
                { atkP: 21.9, hasteP: 17.5 },
                { atkP: 26.3, hasteP: 21.0 },
                { atkP: 30.6, hasteP: 24.5 },
                { atkP: 35.0, hasteP: 28.0 }
            ],
            conditionalEffects: [
                {
                    id: "enhanced_attack_damage",
                    type: "toggle",
                    label: "強化攻撃時 与ダメージ増加",
                    shortLabel: "強化攻撃 与ダメ増",
                    description: "強化攻撃時のみ適用",
                    bonusesByStar: [
                        { addP: 40.0 },
                        { addP: 46.5 },
                        { addP: 53.0 },
                        { addP: 59.5 },
                        { addP: 66.0 }
                    ]
                },
                {
                    id: "signature_attack_change",
                    type: "info",
                    label: "Lv.1 強化攻撃 強化",
                    descriptionByStar: [
                        "物理150% / 強化物理250%\n味方が直接ダメージを受けるたび怒り+4、100で強化攻撃が変更",
                        "物理150% / 強化物理250%\n味方が直接ダメージを受けるたび怒り+4、100で強化攻撃が変更",
                        "物理150% / 強化物理250%\n味方が直接ダメージを受けるたび怒り+4、100で強化攻撃が変更",
                        "物理150% / 強化物理250%\n味方が直接ダメージを受けるたび怒り+4、100で強化攻撃が変更",
                        "物理150% / 強化物理250%\n味方が直接ダメージを受けるたび怒り+4、100で強化攻撃が変更"
                    ]
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "高学年スキルCT-5秒 / 強化攻撃確率+20%"
                }
            ]
        },
        {
            id: "relic_vivi_baton",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "ヴィヴィ",
            name: "ヴィヴィの銀色の指揮棒",
            cost: 24,
            bonusesByStar: [
                { hpP: 25.7, critDmgResP: 6.4 },
                { hpP: 32.1, critDmgResP: 8.0 },
                { hpP: 38.5, critDmgResP: 9.6 },
                { hpP: 44.9, critDmgResP: 11.2 },
                { hpP: 51.4, critDmgResP: 12.8 }
            ],
            conditionalEffects: [
                {
                    id: "normal_stack_defense",
                    type: "info",
                    label: "通常攻撃スタック 防御力増加",
                    descriptionByStar: [
                        "通常攻撃1回ごとに防御力+1% (最大20スタック)\nこの効果はスタックしない",
                        "通常攻撃1回ごとに防御力+1.2% (最大20スタック)\nこの効果はスタックしない",
                        "通常攻撃1回ごとに防御力+1.4% (最大20スタック)\nこの効果はスタックしない",
                        "通常攻撃1回ごとに防御力+1.6% (最大20スタック)\nこの効果はスタックしない",
                        "通常攻撃1回ごとに防御力+1.8% (最大20スタック)\nこの効果はスタックしない"
                    ]
                },
                {
                    id: "max_stack_defense",
                    type: "toggle",
                    label: "20スタック時 防御力・最大HP増加",
                    shortLabel: "20スタック 防御/HP+",
                    nonStacking: true,
                    descriptionByStar: [
                        "通常攻撃スタックが最大時のみ適用 / 防御力+20% / 最大HP+20% / この効果はスタックしない",
                        "通常攻撃スタックが最大時のみ適用 / 防御力+24% / 最大HP+20% / この効果はスタックしない",
                        "通常攻撃スタックが最大時のみ適用 / 防御力+28% / 最大HP+20% / この効果はスタックしない",
                        "通常攻撃スタックが最大時のみ適用 / 防御力+32% / 最大HP+20% / この効果はスタックしない",
                        "通常攻撃スタックが最大時のみ適用 / 防御力+36% / 最大HP+20% / この効果はスタックしない"
                    ],
                    bonusesByStar: [
                        { defP: 20.0, hpP: 20.0 },
                        { defP: 24.0, hpP: 20.0 },
                        { defP: 28.0, hpP: 20.0 },
                        { defP: 32.0, hpP: 20.0 },
                        { defP: 36.0, hpP: 20.0 }
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 高学年スキル 強化",
                    description: "クイックシルバーフィナーレ"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "HP+9% / 1秒ごとのSP回復+10"
                }
            ]
        },
        {
            id: "relic_elena_drone",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "エレナ",
            name: "エレナの強化ドローン",
            cost: 21,
            bonusesByStar: [
                { hpP: 16.6, atkP: 13.3 },
                { hpP: 20.8, atkP: 16.7 },
                { hpP: 25.0, atkP: 20.0 },
                { hpP: 29.1, atkP: 23.3 },
                { hpP: 33.3, atkP: 26.6 }
            ],
            conditionalEffects: [
                {
                    id: "low_grade_skill_haste",
                    type: "info",
                    label: "低学年スキル使用後 攻撃速度増加",
                    descriptionByStar: [
                        "6秒間 +6% / この効果はスタックしない",
                        "6秒間 +6.6% / この効果はスタックしない",
                        "6秒間 +7.2% / この効果はスタックしない",
                        "6秒間 +7.8% / この効果はスタックしない",
                        "6秒間 +8.4% / この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 高学年スキル 強化",
                    description: "D-CATパルス波"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "攻撃速度+100%"
                }
            ]
        },
        {
            id: "relic_ritz_whetstone",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "リッツ",
            name: "リッツのすり減った砥石",
            cost: 23,
            bonusesByStar: [
                { hpP: 18.4, defP: 18.4 },
                { hpP: 23.0, defP: 23.0 },
                { hpP: 27.6, defP: 27.6 },
                { hpP: 32.2, defP: 32.2 },
                { hpP: 36.8, defP: 36.8 }
            ],
            conditionalEffects: [
                {
                    id: "normal_attack_taken_reduction",
                    type: "toggle",
                    label: "通常攻撃 被ダメージ減少",
                    shortLabel: "通常攻撃 被ダメ減",
                    nonStacking: true,
                    description: "通常攻撃で受けるダメージのみ / この効果はスタックしない",
                    bonusesByStar: [
                        { takenDmgP: 40.0 },
                        { takenDmgP: 40.0 },
                        { takenDmgP: 40.0 },
                        { takenDmgP: 40.0 },
                        { takenDmgP: 40.0 }
                    ]
                },
                {
                    id: "normal_twice_heal",
                    type: "info",
                    label: "基本攻撃2回命中ごとに回復",
                    descriptionByStar: [
                        "最大HPの15%回復 / この効果はスタックしない",
                        "最大HPの16.5%回復 / この効果はスタックしない",
                        "最大HPの18%回復 / この効果はスタックしない",
                        "最大HPの19.5%回復 / この効果はスタックしない",
                        "最大HPの21%回復 / この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 パッシブスキル 強化",
                    description: "パッシブスキル"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "物理攻撃力・会心・会心ダメージ+9%"
                }
            ]
        },
        {
            id: "relic_blanse_bouquet",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "ブランセ",
            name: "ブランセの花束",
            cost: 16,
            bonusesByStar: [
                { critRateP: 6.6, critDmgP: 4.1 },
                { critRateP: 8.3, critDmgP: 5.2 },
                { critRateP: 9.9, critDmgP: 6.2 },
                { critRateP: 11.6, critDmgP: 7.2 },
                { critRateP: 13.2, critDmgP: 8.2 }
            ],
            conditionalEffects: [
                {
                    id: "low_grade_magic_def_down",
                    type: "toggle",
                    label: "低学年スキル命中時 魔法防御減少",
                    shortLabel: "低学年 魔防減",
                    nonStacking: true,
                    descriptionByStar: [
                        "8秒間 / 1スタック3% / 最大9回スタック / この効果はスタックしない",
                        "8秒間 / 1スタック3.5% / 最大9回スタック / この効果はスタックしない",
                        "8秒間 / 1スタック4% / 最大9回スタック / この効果はスタックしない",
                        "8秒間 / 1スタック4.5% / 最大9回スタック / この効果はスタックしない",
                        "8秒間 / 1スタック5% / 最大9回スタック / この効果はスタックしない"
                    ],
                    bonusesByStar: [
                        { enemyDefDownP: 27.0 },
                        { enemyDefDownP: 31.5 },
                        { enemyDefDownP: 36.0 },
                        { enemyDefDownP: 40.5 },
                        { enemyDefDownP: 45.0 }
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 低学年スキル 強化",
                    description: "シンクローズ・ブロッサム"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "魔法攻撃力・会心・会心ダメージ+9%"
                }
            ]
        },
        {
            id: "relic_picola_pouch",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "ピコラ",
            name: "ピコラのファッションポーチ",
            cost: 23,
            bonusesByStar: [
                { atkP: 18.4 },
                { atkP: 23.0 },
                { atkP: 27.6 },
                { atkP: 32.2 },
                { atkP: 36.8 }
            ],
            conditionalEffects: [
                {
                    id: "healing_amount_up",
                    type: "info",
                    label: "HP治癒量増加",
                    description: "数値未確認"
                },
                {
                    id: "target_defense_up",
                    type: "toggle",
                    label: "回復対象 防御増加",
                    shortLabel: "回復対象 防御増加",
                    nonStacking: true,
                    bonusesByStar: [
                        { defP: 8 },
                        { defP: 10 },
                        { defP: 12 },
                        { defP: 14 },
                        { defP: 16 }
                    ],
                    descriptionByStar: [
                        "6秒間 / カード効果で発生する回復では発動しない / この効果はスタックしない",
                        "6秒間 / カード効果で発生する回復では発動しない / この効果はスタックしない",
                        "6秒間 / カード効果で発生する回復では発動しない / この効果はスタックしない",
                        "6秒間 / カード効果で発生する回復では発動しない / この効果はスタックしない",
                        "6秒間 / カード効果で発生する回復では発動しない / この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 低学年スキル 強化",
                    description: "初回限定ステッカー"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "魔法攻撃力・会心抵抗・会心ダメージ抵抗+9%"
                }
            ]
        },
        {
            id: "relic_shion_black_cloak",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "シオン・ザ・DB",
            name: "シオンの黒マント",
            cost: 25,
            bonusesByStar: [
                { atkP: 16.6, critRateP: 9.9 },
                { atkP: 22.2, critRateP: 12.9 },
                { atkP: 28.2, critRateP: 15.9 },
                { atkP: 36.5, critRateP: 18.9 },
                { atkP: 44.4, critRateP: 22.2 }
            ],
            conditionalEffects: [
                {
                    id: "single_enemy_damage_up",
                    type: "toggle",
                    label: "敵1体時 与ダメ増",
                    shortLabel: "敵1体 与ダメ増",
                    defaultEnabled: true,
                    nonStacking: true,
                    bonusesByStar: [
                        { addP: 44 },
                        { addP: 49.5 },
                        { addP: 55 },
                        { addP: 60.5 },
                        { addP: 66 }
                    ],
                    descriptionByStar: [
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 基本攻撃 強化",
                    description: "強化の弾丸を発射"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "物理攻撃力・会心・会心ダメージ+9%"
                }
            ]
        },
        {
            id: "relic_naia_watergun",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "ナイア",
            name: "ナイアのイルカ水鉄砲",
            cost: 19,
            bonusesByStar: [
                { hpP: 19.9, defP: 14.9 },
                { hpP: 24.9, defP: 18.7 },
                { hpP: 29.8, defP: 22.4 },
                { hpP: 34.8, defP: 26.1 },
                { hpP: 39.8, defP: 29.8 }
            ],
            conditionalEffects: [
                {
                    id: "after_skill_healing_up",
                    type: "info",
                    label: "スキル使用後 HP治癒量増加",
                    descriptionByStar: [
                        "8秒間 +36%（クールタイム: 12秒）",
                        "8秒間 +45%（クールタイム: 12秒）",
                        "8秒間 +54%（クールタイム: 12秒）",
                        "8秒間 +63%（クールタイム: 12秒）",
                        "8秒間 +72%（クールタイム: 12秒）"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 低学年スキル 強化",
                    description: "キレイにしてあげる！"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "魔法攻撃力・会心抵抗・会心ダメージ抵抗+9%"
                }
            ]
        },
        {
            id: "relic_shupan_backpack",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "シュパン",
            name: "シュパンの魔法リュック",
            cost: 24,
            bonusesByStar: [
                { hpP: 25.7, atkP: 19.3 },
                { hpP: 32.1, atkP: 24.1 },
                { hpP: 38.5, atkP: 28.9 },
                { hpP: 44.9, atkP: 33.7 },
                { hpP: 51.4, atkP: 38.5 }
            ],
            conditionalEffects: [
                {
                    id: "same_lane_taken_reduction",
                    type: "toggle",
                    label: "通常攻撃2回ごと 同列被ダメ減",
                    shortLabel: "2攻撃ごと 同列被ダメ減",
                    nonStacking: true,
                    bonusesByStar: [
                        { takenDmgP: 12 },
                        { takenDmgP: 15 },
                        { takenDmgP: 18 },
                        { takenDmgP: 21 },
                        { takenDmgP: 24 }
                    ],
                    descriptionByStar: [
                        "6秒間（クールタイム: 10秒）/ この効果はスタックしない",
                        "6秒間（クールタイム: 10秒）/ この効果はスタックしない",
                        "6秒間（クールタイム: 10秒）/ この効果はスタックしない",
                        "6秒間（クールタイム: 10秒）/ この効果はスタックしない",
                        "6秒間（クールタイム: 10秒）/ この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 強化攻撃 強化",
                    description: "味方回復 / シールド付与 / 防御力増加"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "高学年スキルCT-5秒"
                }
            ]
        },
        {
            id: "relic_snoky_fedora",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "スノキー",
            name: "スノキーのフェドーラ",
            cost: 18,
            bonusesByStar: [
                { hasteP: 11.3, hpP: 18.8 },
                { hasteP: 14.1, hpP: 23.5 },
                { hasteP: 16.9, hpP: 28.1 },
                { hasteP: 19.7, hpP: 32.8 },
                { hasteP: 22.5, hpP: 37.5 }
            ],
            conditionalEffects: [
                {
                    id: "hp50_max_hp_up",
                    type: "toggle",
                    label: "HP50%以上 最大HP・防御増加",
                    shortLabel: "HP50%以上 HP/防御+",
                    nonStacking: true,
                    bonusesByStar: [
                        { hpP: 10.0, defP: 20.0 },
                        { hpP: 10.0, defP: 24.5 },
                        { hpP: 10.0, defP: 29.0 },
                        { hpP: 10.0, defP: 33.5 },
                        { hpP: 10.0, defP: 38.0 }
                    ],
                    descriptionByStar: [
                        "HP50%以上時のみ適用 / 最大HP+10% / 防御力+20% / この効果はスタックしない",
                        "HP50%以上時のみ適用 / 最大HP+10% / 防御力+24.5% / この効果はスタックしない",
                        "HP50%以上時のみ適用 / 最大HP+10% / 防御力+29% / この効果はスタックしない",
                        "HP50%以上時のみ適用 / 最大HP+10% / 防御力+33.5% / この効果はスタックしない",
                        "HP50%以上時のみ適用 / 最大HP+10% / 防御力+38% / この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 強化攻撃 強化",
                    description: "前方飛び蹴り / 気絶付与"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "物理攻撃力・物理防御力・魔法防御力+9%"
                }
            ]
        },
        {
            id: "relic_serine_night_mirage",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "セリーネ",
            name: "セリーネの夜幻影",
            cost: 28,
            bonusesByStar: [
                { critResP: 13.7, critDmgResP: 7.6 },
                { critResP: 17.1, critDmgResP: 9.5 },
                { critResP: 20.6, critDmgResP: 11.4 },
                { critResP: 24.0, critDmgResP: 13.3 },
                { critResP: 27.5, critDmgResP: 15.2 }
            ],
            conditionalEffects: [
                {
                    id: "skill_self_recover",
                    type: "info",
                    label: "スキル使用時 自己回復",
                    descriptionByStar: [
                        "最大HPの12%回復 / 超過回復は6秒間シールド化 / この効果はスタックしない",
                        "最大HPの15%回復 / 超過回復は6秒間シールド化 / この効果はスタックしない",
                        "最大HPの18%回復 / 超過回復は6秒間シールド化 / この効果はスタックしない",
                        "最大HPの21%回復 / 超過回復は6秒間シールド化 / この効果はスタックしない",
                        "最大HPの24%回復 / 超過回復は6秒間シールド化 / この効果はスタックしない"
                    ]
                },
                {
                    id: "skill_self_shield",
                    type: "info",
                    label: "スキル使用時 シールド",
                    description: "最大HPを超えた回復量を6秒間シールドに変換"
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 高学年スキル 強化",
                    description: "チャンネルNo.5"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "高学年スキルCT-10秒"
                }
            ]
        },
        {
            id: "relic_carrot_cane",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "キャロット",
            name: "キャロットのサトウキビ",
            cost: 17,
            bonusesByStar: [
                { hasteP: 10.6, defP: 13.2 },
                { hasteP: 13.2, defP: 16.5 },
                { hasteP: 15.9, defP: 19.8 },
                { hasteP: 18.5, defP: 23.1 },
                { hasteP: 21.2, defP: 26.4 }
            ],
            conditionalEffects: [
                {
                    id: "same_lane_sp_recover",
                    type: "info",
                    label: "同列 SP回復増加",
                    descriptionByStar: [
                        "1秒ごと +4 / この効果はスタックしない",
                        "1秒ごと +6 / この効果はスタックしない",
                        "1秒ごと +8 / この効果はスタックしない",
                        "1秒ごと +10 / この効果はスタックしない",
                        "1秒ごと +12 / この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 低学年スキル 強化",
                    description: "急成長の樹液発射"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "HP・物理防御力・魔法防御力+9%"
                }
            ]
        },
        {
            id: "relic_chloe_sewing_chest",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "クロエ",
            name: "クロエの万能裁縫箱",
            cost: 30,
            bonusesByStar: [
                { hasteP: 19.7, critResP: 14.8 },
                { hasteP: 24.6, critResP: 18.5 },
                { hasteP: 29.6, critResP: 22.2 },
                { hasteP: 34.5, critResP: 25.9 },
                { hasteP: 39.4, critResP: 29.6 }
            ],
            conditionalEffects: [
                {
                    id: "shield_taken_reduction",
                    type: "toggle",
                    label: "シールド時 被ダメージ減少",
                    shortLabel: "シールド時 被ダメ減",
                    nonStacking: true,
                    descriptionByStar: [
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない"
                    ],
                    bonusesByStar: [
                        { takenDmgP: 18.0 },
                        { takenDmgP: 21.0 },
                        { takenDmgP: 24.0 },
                        { takenDmgP: 27.0 },
                        { takenDmgP: 30.0 }
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 パッシブスキル 強化",
                    description: "強化対象の詳細は後日対応"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "魔法攻撃力・会心抵抗・会心ダメージ抵抗+9%"
                }
            ]
        },
        {
            id: "relic_listy_replica_glove",
            kind: "artifact",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "リスティ",
            name: "リスティの模造グローブ",
            cost: 19,
            bonusesByStar: [
                { atkP: 14.9, critDmgP: 8.0 },
                { atkP: 18.6, critDmgP: 10.0 },
                { atkP: 22.4, critDmgP: 12.0 },
                { atkP: 26.1, critDmgP: 13.9 },
                { atkP: 29.8, critDmgP: 15.9 }
            ],
            conditionalEffects: [
                {
                    id: "normal_attack_6_crit_rate_up",
                    type: "toggle",
                    label: "通常攻撃6回ごと 会心率増加",
                    shortLabel: "6攻撃ごと 会心率+",
                    nonStacking: true,
                    bonusesByStar: [
                        { critRateP: 18.0 },
                        { critRateP: 21.0 },
                        { critRateP: 24.0 },
                        { critRateP: 27.0 },
                        { critRateP: 30.0 }
                    ],
                    descriptionByStar: [
                        "12秒間 / この効果はスタックしない",
                        "12秒間 / この効果はスタックしない",
                        "12秒間 / この効果はスタックしない",
                        "12秒間 / この効果はスタックしない",
                        "12秒間 / この効果はスタックしない"
                    ]
                },
                {
                    id: "signature_skill",
                    type: "info",
                    label: "Lv.1 強化攻撃 強化",
                    description: "3回攻撃するごとに敵をハッキングし、確定会心物理ダメージを与える。強化攻撃使用後、自身のSPを回復する。"
                },
                {
                    id: "signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "物理攻撃力・会心・会心ダメージ+9%"
                }
            ]
        },
        {
            id: "relic_dragon_sword",
            kind: "artifact",
            rarity: "伝説",
            name: "竜光剣",
            cost: 25,
            bonusesByStar: [
                { atkP: 40.3 },
                { atkP: 50.4 },
                { atkP: 60.4 },
                { atkP: 70.5 },
                { atkP: 80.6 }
            ],
            conditionalEffects: [
                {
                    id: "time_haste",
                    type: "info",
                    label: "時間経過で攻撃速度増加",
                    descriptionByStar: [
                        "1秒ごと +3% / 低学年スキル使用でリセット / この効果はスタックしない",
                        "1秒ごと +3.5% / 低学年スキル使用でリセット / この効果はスタックしない",
                        "1秒ごと +4% / 低学年スキル使用でリセット / この効果はスタックしない",
                        "1秒ごと +4.5% / 低学年スキル使用でリセット / この効果はスタックしない",
                        "1秒ごと +5% / 低学年スキル使用でリセット / この効果はスタックしない"
                    ]
                }
            ]
        },
        {
            id: "relic_life_gem",
            kind: "artifact",
            rarity: "伝説",
            name: "ライフジェム",
            cost: 23,
            bonusesByStar: [
                { hpP: 24.5, critDmgResP: 6.1 },
                { hpP: 30.6, critDmgResP: 7.7 },
                { hpP: 36.8, critDmgResP: 9.2 },
                { hpP: 42.9, critDmgResP: 10.7 },
                { hpP: 49.0, critDmgResP: 12.2 }
            ],
            conditionalEffects: [
                {
                    id: "low_hp_self_heal",
                    type: "info",
                    label: "HP40%以下時 自己回復",
                    descriptionByStar: [
                        "5秒以内に最大HPの80%を回復 / この効果はスタックしない",
                        "5秒以内に最大HPの88%を回復 / この効果はスタックしない",
                        "5秒以内に最大HPの96%を回復 / この効果はスタックしない",
                        "5秒以内に最大HPの104%を回復 / この効果はスタックしない",
                        "5秒以内に最大HPの112%を回復 / この効果はスタックしない"
                    ]
                }
            ]
        },
        {
            id: "relic_30kg_kettlebell",
            kind: "artifact",
            rarity: "伝説",
            name: "30KGケトルベル",
            cost: 22,
            bonusesByStar: [
                { critRateP: 17.5, critDmgP: 9.3 },
                { critRateP: 21.9, critDmgP: 11.7 },
                { critRateP: 26.4, critDmgP: 14.0 },
                { critRateP: 30.6, critDmgP: 16.3 },
                { critRateP: 35.0, critDmgP: 18.7 }
            ],
            conditionalEffects: [
                {
                    id: "skill_damage_up",
                    type: "toggle",
                    label: "スキル与ダメ増",
                    shortLabel: "スキル与ダメ増",
                    defaultEnabled: true,
                    nonStacking: true,
                    bonusesByStar: [
                        { addP: 30 },
                        { addP: 38 },
                        { addP: 46 },
                        { addP: 54 },
                        { addP: 62 }
                    ],
                    descriptionByStar: [
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない"
                    ]
                },
                {
                    id: "normal_damage_down",
                    type: "toggle",
                    label: "通常攻撃ダメージ減少",
                    shortLabel: "通常攻撃ダメージ減少",
                    nonStacking: true,
                    bonusesByStar: [
                        { addP: -40 },
                        { addP: -40 },
                        { addP: -40 },
                        { addP: -40 },
                        { addP: -40 }
                    ],
                    description: "-40% / この効果はスタックしない"
                }
            ]
        },
        {
            id: "relic_nisril_knife",
            kind: "artifact",
            rarity: "伝説",
            name: "ニスリルのパン切り包丁",
            cost: 21,
            bonusesByStar: [
                { atkP: 16.6, hasteP: 13.3 },
                { atkP: 20.8, hasteP: 16.7 },
                { atkP: 25.0, hasteP: 20.0 },
                { atkP: 29.1, hasteP: 23.3 },
                { atkP: 33.3, hasteP: 26.6 }
            ],
        },
        {
            id: "relic_fuwafuwa_vest",
            kind: "artifact",
            rarity: "伝説",
            name: "ふわふわチョッキ",
            cost: 17,
            bonusesByStar: [
                { defP: 26.4 },
                { defP: 33.1 },
                { defP: 39.7 },
                { defP: 46.3 },
                { defP: 52.9 }
            ],
        },
        {
            id: "relic_eldain_lamp",
            kind: "artifact",
            rarity: "伝説",
            name: "エルダインランプ",
            cost: 16,
            bonusesByStar: [
                { hpP: 16.5 },
                { hpP: 20.6 },
                { hpP: 24.8 },
                { hpP: 28.9 },
                { hpP: 33.0 }
            ],
            conditionalEffects: [
                {
                    id: "healing_amount_up",
                    type: "info",
                    label: "HP治癒量増加",
                    descriptionByStar: [
                        "+9.9%",
                        "+12.4%",
                        "+14.9%",
                        "+17.3%",
                        "+19.8%"
                    ]
                }
            ]
        },
        {
            id: "relic_assassin_book",
            kind: "artifact",
            rarity: "伝説",
            name: "暗殺者の秘伝書",
            cost: 11,
            bonusesByStar: [
                { atkP: 8.3, critRateP: 8.3 },
                { atkP: 10.4, critRateP: 10.4 },
                { atkP: 12.4, critRateP: 12.4 },
                { atkP: 14.5, critRateP: 14.5 },
                { atkP: 16.6, critRateP: 16.6 }
            ],
            conditionalEffects: [
                {
                    id: "blind_effect",
                    type: "info",
                    label: "目くらまし効果",
                    description: "未反映"
                }
            ]
        },
        {
            id: "relic_sword_staff",
            kind: "artifact",
            rarity: "希少",
            name: "剣と杖",
            cost: 23,
            bonusesByStar: [
                { atkP: 13.8 },
                { atkP: 17.2 },
                { atkP: 20.7 },
                { atkP: 24.1 },
                { atkP: 27.6 }
            ],
            conditionalEffects: [
                {
                    id: "attack_speed_bonus",
                    type: "info",
                    label: "攻撃速度増加",
                    description: "数値未確認"
                }
            ]
        },
        {
            id: "relic_safety_belt",
            kind: "artifact",
            rarity: "希少",
            name: "安全帯",
            cost: 22,
            bonusesByStar: [
                { hpP: 35.0 },
                { hpP: 43.8 },
                { hpP: 52.5 },
                { hpP: 61.3 },
                { hpP: 70.0 }
            ],
            conditionalEffects: [
                {
                    id: "opening_lane_shield",
                    type: "info",
                    label: "同列全体 開幕シールド",
                    descriptionByStar: [
                        "最大HP30% / 6秒",
                        "最大HP33% / 6秒",
                        "最大HP36% / 6秒",
                        "最大HP39% / 6秒",
                        "最大HP42% / 6秒"
                    ]
                }
            ]
        },
        {
            id: "relic_battle_manual",
            kind: "artifact",
            rarity: "希少",
            name: "バトルマニュアル",
            cost: 20,
            bonusesByStar: [
                { critRateP: 11.8, critDmgP: 6.3 },
                { critRateP: 14.8, critDmgP: 7.9 },
                { critRateP: 17.8, critDmgP: 9.5 },
                { critRateP: 20.7, critDmgP: 11.1 },
                { critRateP: 23.7, critDmgP: 12.6 }
            ],
        },
        {
            id: "relic_blue_grimoire",
            kind: "artifact",
            rarity: "希少",
            name: "青玉色の魔導書",
            cost: 20,
            bonusesByStar: [
                { atkP: 23.7 },
                { atkP: 29.6 },
                { atkP: 35.5 },
                { atkP: 41.4 },
                { atkP: 47.3 }
            ],
            conditionalEffects: [
                {
                    id: "skill_damage_boost",
                    type: "toggle",
                    label: "スキル与ダメ増",
                    defaultEnabled: true,
                    bonusesByStar: [
                        { addP: 18.0 },
                        { addP: 21.0 },
                        { addP: 24.0 },
                        { addP: 27.0 },
                        { addP: 30.0 }
                    ]
                }
            ]
        },
        {
            id: "relic_scale_armor",
            kind: "artifact",
            rarity: "希少",
            name: "スケイルアーマー",
            cost: 17,
            bonusesByStar: [
                { defP: 9.9 },
                { defP: 12.4 },
                { defP: 14.9 },
                { defP: 17.4 },
                { defP: 19.8 }
            ],
            conditionalEffects: [
                {
                    id: "hp_recovery_amount",
                    type: "info",
                    label: "HP回復量増加",
                    description: "数値未確認"
                }
            ]
        },
        {
            id: "relic_blessed_pauldron",
            kind: "artifact",
            rarity: "希少",
            name: "祝福された肩鎧",
            cost: 16,
            bonusesByStar: [
                { hpP: 12.4, defP: 9.3 },
                { hpP: 15.5, defP: 11.6 },
                { hpP: 18.6, defP: 13.9 },
                { hpP: 21.7, defP: 16.2 },
                { hpP: 24.8, defP: 18.6 }
            ],
            conditionalEffects: [
                {
                    id: "hp_regen",
                    type: "info",
                    label: "毎秒HP回復",
                    description: "1秒ごとに最大HPの2%回復"
                }
            ]
        },
        {
            id: "relic_origin_grail",
            kind: "artifact",
            rarity: "希少",
            name: "起源の聖杯",
            cost: 15,
            bonusesByStar: [
                { critDmgP: 4.6, hasteP: 6.9 },
                { critDmgP: 5.8, hasteP: 8.7 },
                { critDmgP: 6.9, hasteP: 10.4 },
                { critDmgP: 8.1, hasteP: 12.1 },
                { critDmgP: 9.2, hasteP: 13.9 }
            ],
            conditionalEffects: [
                {
                    id: "normal_hit_sp_recover",
                    type: "info",
                    label: "通常攻撃命中時 SP回復",
                    description: "SP+4 / この効果はスタックしない"
                }
            ]
        },
        {
            id: "relic_high_priest_censer",
            kind: "artifact",
            rarity: "希少",
            name: "祭司長の香炉",
            cost: 15,
            bonusesByStar: [
                { defP: 17.3 },
                { defP: 21.6 },
                { defP: 26.0 },
                { defP: 30.3 },
                { defP: 34.6 }
            ],
            conditionalEffects: [
                {
                    id: "shield_received_up",
                    type: "info",
                    label: "受けるシールド効果増加",
                    descriptionByStar: [
                        "+66%",
                        "+72%",
                        "+78%",
                        "+84%",
                        "+90%"
                    ]
                }
            ]
        },
        {
            id: "relic_madness_mask",
            kind: "artifact",
            rarity: "希少",
            name: "狂気の仮面",
            cost: 14,
            bonusesByStar: [
                { critDmgResP: 5.4 },
                { critDmgResP: 6.7 },
                { critDmgResP: 8.0 },
                { critDmgResP: 9.4 },
                { critDmgResP: 10.7 }
            ],
            conditionalEffects: [
                {
                    id: "aoe_fixed_damage",
                    type: "info",
                    label: "周囲に固定ダメージ",
                    description: "1秒ごとに最大HPの3%ダメージ / この効果はスタックしない"
                }
            ]
        },
        {
            id: "relic_healing_pendant",
            kind: "artifact",
            rarity: "希少",
            name: "癒やしのペンダント",
            cost: 14,
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                {
                    id: "heal_amount",
                    type: "info",
                    label: "HP治癒量増加",
                    descriptionByStar: [
                        "+12.9%",
                        "+16.1%",
                        "+19.3%",
                        "+22.5%",
                        "+25.7%"
                    ]
                },
                {
                    id: "sp_regen",
                    type: "info",
                    label: "毎秒SP回復量増加",
                    descriptionByStar: [
                        "+10",
                        "+11",
                        "+12",
                        "+13",
                        "+14"
                    ]
                }
            ]
        },
        {
            id: "relic_obsidian_shuriken",
            kind: "artifact",
            rarity: "高級",
            name: "黒曜石の手裏剣",
            cost: 17,
            bonusesByStar: [
                { atkP: 13.2 },
                { atkP: 16.5 },
                { atkP: 19.8 },
                { atkP: 23.1 },
                { atkP: 26.4 }
            ],
            conditionalEffects: [
                {
                    id: "normal_attack_damage_up",
                    type: "toggle",
                    label: "通常攻撃 与ダメ増",
                    shortLabel: "通常攻撃 与ダメ増",
                    bonusesByStar: [
                        { addP: 9.0 },
                        { addP: 10.5 },
                        { addP: 12.0 },
                        { addP: 13.5 },
                        { addP: 15.0 }
                    ]
                }
            ]
        },
        {
            id: "relic_greed_ring",
            kind: "artifact",
            rarity: "高級",
            name: "強欲の指輪",
            cost: 13,
            bonusesByStar: [
                { critDmgResP: 3.3 },
                { critDmgResP: 4.1 },
                { critDmgResP: 5.0 },
                { critDmgResP: 5.8 },
                { critDmgResP: 6.6 }
            ],
            conditionalEffects: [
                {
                    id: "status_damage_up",
                    type: "info",
                    label: "状態異常ダメージ増加",
                    descriptionByStar: [
                        "+15%",
                        "+17.5%",
                        "+20%",
                        "+22.5%",
                        "+25%"
                    ]
                }
            ]
        },
        {
            id: "relic_oldwood_dagger",
            kind: "artifact",
            rarity: "高級",
            name: "古木のダガー",
            cost: 13,
            bonusesByStar: [
                { critDmgP: 5.3 },
                { critDmgP: 6.6 },
                { critDmgP: 7.9 },
                { critDmgP: 9.2 },
                { critDmgP: 10.6 }
            ],
            conditionalEffects: [
                {
                    id: "sp_regen",
                    type: "info",
                    label: "毎秒SP回復量増加",
                    descriptionByStar: [
                        "1秒ごと +6 / 同類の遺物効果はスタックしない",
                        "1秒ごと +7 / 同類の遺物効果はスタックしない",
                        "1秒ごと +8 / 同類の遺物効果はスタックしない",
                        "1秒ごと +9 / 同類の遺物効果はスタックしない",
                        "1秒ごと +10 / 同類の遺物効果はスタックしない"
                    ]
                }
            ]
        },
        {
            id: "relic_elf_staff",
            kind: "artifact",
            rarity: "高級",
            name: "エルフ製の杖",
            cost: 11,
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                {
                    id: "hp_recovery_amount",
                    type: "info",
                    label: "HP回復量増加",
                    descriptionByStar: [
                        "+4.4%",
                        "+5.5%",
                        "+6.6%",
                        "+7.7%",
                        "+8.8%"
                    ]
                },
                {
                    id: "opening_shield",
                    type: "info",
                    label: "開幕シールド",
                    description: "最大HP60% / 10秒"
                }
            ]
        },
        {
            id: "relic_gem_ring",
            kind: "artifact",
            rarity: "高級",
            name: "宝石の指輪",
            cost: 11,
            bonusesByStar: [
                { atkP: 4.1, critDmgP: 2.2 },
                { atkP: 5.2, critDmgP: 2.8 },
                { atkP: 6.2, critDmgP: 3.3 },
                { atkP: 7.2, critDmgP: 3.9 },
                { atkP: 8.3, critDmgP: 4.4 }
            ],
        },
        {
            id: "relic_thorn_crown",
            kind: "artifact",
            rarity: "高級",
            name: "茨の冠",
            cost: 10,
            bonusesByStar: [
                { defP: 7.5 },
                { defP: 9.3 },
                { defP: 11.2 },
                { defP: 13.1 },
                { defP: 14.9 }
            ],
            conditionalEffects: [
                {
                    id: "skill_damage_up",
                    type: "toggle",
                    label: "スキル与ダメ増",
                    shortLabel: "スキル与ダメ増",
                    defaultEnabled: true,
                    bonusesByStar: [
                        { addP: 9.0 },
                        { addP: 10.5 },
                        { addP: 12.0 },
                        { addP: 13.5 },
                        { addP: 15.0 }
                    ]
                }
            ]
        },
        {
            id: "relic_old_arrow",
            kind: "artifact",
            rarity: "高級",
            name: "古びた矢",
            cost: 10,
            bonusesByStar: [
                { hasteP: 6.0 },
                { hasteP: 7.5 },
                { hasteP: 9.0 },
                { hasteP: 10.5 },
                { hasteP: 12.0 }
            ],
        },
        {
            id: "relic_frost_charm",
            kind: "artifact",
            rarity: "高級",
            name: "霜のお守り",
            cost: 10,
            bonusesByStar: [
                { critResP: 4.5 },
                { critResP: 5.6 },
                { critResP: 6.7 },
                { critResP: 7.8 },
                { critResP: 9.0 }
            ],
            conditionalEffects: [
                {
                    id: "debuff_resist",
                    type: "info",
                    label: "デバフ抵抗効果",
                    descriptionByStar: [
                        "デバフに1回抵抗 / この効果はスタックしない（クールタイム: 10秒）",
                        "デバフに1回抵抗 / この効果はスタックしない（クールタイム: 9.5秒）",
                        "デバフに1回抵抗 / この効果はスタックしない（クールタイム: 9秒）",
                        "デバフに1回抵抗 / この効果はスタックしない（クールタイム: 8.5秒）",
                        "デバフに1回抵抗 / この効果はスタックしない（クールタイム: 8秒）"
                    ]
                }
            ]
        },
        {
            id: "relic_furoshiki_robe",
            kind: "artifact",
            rarity: "高級",
            name: "風呂敷のローブ",
            cost: 10,
            bonusesByStar: [
                { critResP: 4.5 },
                { critResP: 5.6 },
                { critResP: 6.7 },
                { critResP: 7.8 },
                { critResP: 9.0 }
            ],
        },
        {
            id: "relic_shining_tiara",
            kind: "artifact",
            rarity: "高級",
            name: "シャイニングティアラ",
            cost: 9,
            bonusesByStar: [
                { hpP: 4.5 },
                { hpP: 5.6 },
                { hpP: 6.7 },
                { hpP: 7.8 },
                { hpP: 8.9 }
            ],
            conditionalEffects: [
                {
                    id: "healing_amount",
                    type: "info",
                    label: "HP治癒量増加",
                    descriptionByStar: [
                        "+2.7%",
                        "+3.3%",
                        "+4.0%",
                        "+4.7%",
                        "+5.3%"
                    ]
                }
            ]
        },
        {
            id: "relic_cardboard_armor",
            kind: "artifact",
            rarity: "高級",
            name: "段ボールのアーマー",
            cost: 9,
            bonusesByStar: [
                { defP: 6.7 },
                { defP: 8.4 },
                { defP: 10.0 },
                { defP: 11.7 },
                { defP: 13.4 }
            ],
        },
        {
            id: "relic_head_towel",
            kind: "artifact",
            rarity: "高級",
            name: "頭巻きタオル",
            cost: 8,
            bonusesByStar: [
                { hpP: 7.9 },
                { hpP: 9.8 },
                { hpP: 11.8 },
                { hpP: 13.8 },
                { hpP: 15.7 }
            ],
        },
        {
            id: "relic_rusty_awl",
            kind: "artifact",
            rarity: "高級",
            name: "錆びついた錐",
            cost: 6,
            bonusesByStar: [
                { critRateP: 4.4 },
                { critRateP: 5.5 },
                { critRateP: 6.6 },
                { critRateP: 7.6 },
                { critRateP: 8.7 }
            ],
        }
    ],
    spells: [
        {
            id: "spell_alice_hex",
            kind: "spell",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "アリス",
            name: "アリスのデタラメな呪術",
            cost: 23,
            bonusesByStar: [
                { atkP: 7.7, critRateP: 7.7 },
                { atkP: 9.6, critRateP: 9.6 },
                { atkP: 11.5, critRateP: 11.5 },
                { atkP: 13.4, critRateP: 13.4 },
                { atkP: 15.3, critRateP: 15.3 }
            ],
            conditionalEffects: [
                {
                    id: "alice_party_heal",
                    type: "info",
                    label: "5秒ごと味方全体HP回復",
                    descriptionByStar: [
                        "5〜10%回復",
                        "5〜12%回復",
                        "5〜14%回復",
                        "5〜16%回復",
                        "5〜18%回復"
                    ]
                },
                { id: "alice_party_sp", type: "info", label: "5秒ごと味方全体SP回復", description: "1〜10回復" },
                {
                    id: "alice_signature_random_red",
                    label: "Lv.1 ランダム効果 赤: 与ダメ減少",
                    shortLabel: "赤カード 与ダメ減",
                    type: "toggle",
                    description: "与ダメ減:5秒 / 魔法ダメ300%",
                    bonusesByStar: [
                        { takenDmgP: 30.0 },
                        { takenDmgP: 30.0 },
                        { takenDmgP: 30.0 },
                        { takenDmgP: 30.0 },
                        { takenDmgP: 30.0 }
                    ]
                },
                { id: "alice_signature_random_yellow", type: "info", label: "Lv.1 ランダム効果 黄: 気絶", description: "気絶:3秒 / 魔法ダメ300%" },
                { id: "alice_signature_random", type: "info", label: "Lv.1 ランダム効果 青: SP減少", description: "SP減少量:50 / 魔法ダメ300%" },
                { id: "alice_signature_lv3", type: "info", label: "Lv.3", description: "毎秒SP回復+10" }
            ],
        },
        {
            id: "spell_epica_anthem",
            kind: "spell",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "エピカ",
            name: "エピカの高貴なる英雄讃歌",
            cost: 30,
            bonusesByStar: [
                { atkP: 10.3, critDmgP: 5.5 },
                { atkP: 12.8, critDmgP: 6.9 },
                { atkP: 15.4, critDmgP: 8.2 },
                { atkP: 18.0, critDmgP: 9.6 },
                { atkP: 20.5, critDmgP: 11.0 }
            ],
            conditionalEffects: [
                {
                    id: "epica_signature_party_buff",
                    label: "Lv.1 全員 与ダメージ+15%",
                    shortLabel: "愛用 与ダメ+15%",
                    nonStacking: true,
                    type: "toggle",
                    bonusesByStar: [
                        { addP: 15.0 },
                        { addP: 15.0 },
                        { addP: 15.0 },
                        { addP: 15.0 },
                        { addP: 15.0 }
                    ],
                    descriptionByStar: [
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない"
                    ]
                },
                { id: "epica_grade_up", type: "info", label: "ウェーブ開始時 学年+1", description: "ランダムな味方1人" },
                { id: "epica_signature_haste", type: "info", label: "Lv.1 全員 攻撃速度増加", description: "+10%" },
                {
                    id: "epica_signature_guard",
                    label: "Lv.1 味方戦闘不能時 全員 被ダメ減少",
                    shortLabel: "味方落ち 被ダメ減",
                    nonStacking: true,
                    type: "toggle",
                    bonusesByStar: [
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 }
                    ],
                    descriptionByStar: [
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない",
                        "この効果はスタックしない"
                    ]
                },
                { id: "epica_signature_lv3", type: "info", label: "Lv.3", description: "ウェーブ開始から15秒間 攻撃速度+50%" }
            ],
        },
        {
            id: "spell_yiide_dream",
            kind: "spell",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "イード",
            name: "ルシ - イードドリーム",
            imageFile: "ルシ ‐ イードドリーム.webp",
            cost: 36,
            bonusesByStar: [
                { critResP: 7.5, critDmgResP: 4.2 },
                { critResP: 9.4, critDmgResP: 5.2 },
                { critResP: 11.3, critDmgResP: 6.3 },
                { critResP: 13.2, critDmgResP: 7.3 },
                { critResP: 15.0, critDmgResP: 8.4 }
            ],
            conditionalEffects: [
                {
                    id: "yiide_frontline_reduce",
                    label: "前列 被ダメージ減少",
                    shortLabel: "前列 被ダメ減",
                    type: "toggle",
                    bonusesByStar: [
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 },
                        { takenDmgP: 15.0 }
                    ]
                },
                {
                    id: "yiide_guard_def",
                    label: "前列かつガード 防御力増加",
                    shortLabel: "ガード 防御+",
                    type: "toggle",
                    bonusesByStar: [
                        { defP: 20.0 },
                        { defP: 23.0 },
                        { defP: 26.0 },
                        { defP: 26.0 },
                        { defP: 26.0 }
                    ]
                },
                { id: "yiide_signature_hp", type: "info", label: "Lv.1 最大HP増加", description: "+15%" },
                { id: "yiide_signature_sp", type: "info", label: "Lv.1 定期SP回復", description: "5秒ごと +30" },
                { id: "yiide_signature_lv3", type: "info", label: "Lv.3", description: "イード回復量増加+30%" }
            ],
        },
        {
            id: "spell_renewa_time_paradox",
            kind: "spell",
            rarity: "伝説",
            signature: true,
            favoriteCharacter: "リニュア",
            name: "リニュアのタイムパラドックス",
            cost: 27,
            bonusesByStar: [
                { critRateP: 9.1, critDmgP: 4.9 },
                { critRateP: 11.4, critDmgP: 6.1 },
                { critRateP: 13.7, critDmgP: 7.3 },
                { critRateP: 16.0, critDmgP: 8.5 },
                { critRateP: 18.3, critDmgP: 9.7 },
                { critRateP: 20.6, critDmgP: 10.9 }
            ],
            conditionalEffects: [
                {
                    id: "renewa_wave_damage_up",
                    type: "toggle",
                    defaultEnabled: true,
                    nonStacking: true,
                    label: "ウェーブ開始時 全員 与ダメ増加",
                    shortLabel: "開幕 与ダメ増",
                    bonusesByStar: [
                        { addP: 32.0 },
                        { addP: 36.0 },
                        { addP: 40.0 },
                        { addP: 44.0 },
                        { addP: 48.0 }
                    ],
                    descriptionByStar: [
                        "30秒間 / この効果はスタックしない",
                        "30秒間 / この効果はスタックしない",
                        "30秒間 / この効果はスタックしない",
                        "30秒間 / この効果はスタックしない",
                        "30秒間 / この効果はスタックしない"
                    ]
                },
                {
                    id: "renewa_signature_haste",
                    type: "info",
                    label: "Lv.1 最高攻撃力の味方 攻撃速度増加",
                    description: "15秒ごと / 攻撃速度+50% / 持続時間10秒"
                },
                {
                    id: "renewa_signature_lv3",
                    type: "info",
                    label: "Lv.3",
                    description: "高学年スキルのクールタイムが5秒減少する"
                }
            ],
        },
        {
            id: "spell_beauty_is_sin",
            kind: "spell",
            rarity: "伝説",
            name: "美しいって罪ね",
            cost: 28,
            bonusesByStar: [
                { critRateP: 9.5, critDmgP: 5.1 },
                { critRateP: 11.9, critDmgP: 6.4 },
                { critRateP: 14.3, critDmgP: 7.6 },
                { critRateP: 16.6, critDmgP: 8.9 },
                { critRateP: 19.0, critDmgP: 10.2 }
            ],
        },
        {
            id: "spell_suspicious_potion",
            kind: "spell",
            rarity: "伝説",
            name: "怪しいポーション",
            cost: 26,
            costByStar: [26, 25, 24, 23, 22],
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                {
                    id: "suspicious_poison",
                    type: "info",
                    label: "ウェーブ開始時 毒霧",
                    descriptionByStar: [
                        "敵全体を12秒間 毒状態(最も攻撃力の高いキャラ参照 6%ずつダメージ/与ダメ-11%)",
                        "敵全体を15秒間 毒状態(最も攻撃力の高いキャラ参照 6%ずつダメージ/与ダメ-11%)",
                        "敵全体を18秒間 毒状態(最も攻撃力の高いキャラ参照 6%ずつダメージ/与ダメ-11%)",
                        "敵全体を21秒間 毒状態(最も攻撃力の高いキャラ参照 6%ずつダメージ/与ダメ-11%)",
                        "敵全体を24秒間 毒状態(最も攻撃力の高いキャラ参照 6%ずつダメージ/与ダメ-11%)"
                    ]
                }
            ],
        },
        {
            id: "spell_battle_master",
            kind: "spell",
            rarity: "伝説",
            name: "バトルの達人",
            cost: 24,
            bonusesByStar: [
                { atkP: 16.1 },
                { atkP: 20.1 },
                { atkP: 24.1 },
                { atkP: 28.1 },
                { atkP: 32.1 }
            ],
            conditionalEffects: [
                {
                    id: "battle_master_skill_damage",
                    label: "スキル攻撃時 与ダメージ増加",
                    shortLabel: "スキル時 与ダメ増",
                    type: "toggle",
                    defaultEnabled: true,
                    bonusesByStar: [
                        { addP: 6.8 },
                        { addP: 8.3 },
                        { addP: 9.8 },
                        { addP: 11.3 },
                        { addP: 12.8 }
                    ]
                }
            ],
        },
        {
            id: "spell_aromatherapy",
            kind: "spell",
            rarity: "伝説",
            name: "アロマセラピー",
            cost: 10,
            costByStar: [10, 9, 8, 7, 6],
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                {
                    id: "aroma_heal",
                    type: "info",
                    label: "HP治癒量 / HP回復量増加",
                    descriptionByStar: [
                        "HP治癒量 +2.5% / HP回復量 +1.7%",
                        "HP治癒量 +3.1% / HP回復量 +2.1%",
                        "HP治癒量 +3.8% / HP回復量 +2.5%",
                        "HP治癒量 +4.4% / HP回復量 +2.9%",
                        "HP治癒量 +5.0% / HP回復量 +3.3%"
                    ]
                },
                { id: "aroma_full_sp", type: "info", label: "残りSPが最も低い味方のSP回復", description: "SPを100%まで回復" }
            ],
        },
        {
            id: "spell_motivation_up",
            kind: "spell",
            rarity: "希少",
            name: "やる気アップ",
            cost: 24,
            bonusesByStar: [
                { critRateP: 6.0 },
                { critRateP: 7.5 },
                { critRateP: 9.0 },
                { critRateP: 10.5 },
                { critRateP: 12.0 }
            ],
            conditionalEffects: [
                { id: "motivation_haste", type: "info", label: "攻撃速度増加", description: "4.8/6/7.2/8.4/9.6%" }
            ],
        },
        {
            id: "spell_caring",
            kind: "spell",
            rarity: "希少",
            name: "世話好き",
            cost: 22,
            bonusesByStar: [
                { hpP: 7.3, healingP: 4.4 },
                { hpP: 9.1, healingP: 5.5 },
                { hpP: 10.9, healingP: 6.6 },
                { hpP: 12.8, healingP: 7.7 },
                { hpP: 14.6, healingP: 8.8 }
            ],
            conditionalEffects: [
                { id: "caring_hp", type: "info", label: "最大HP増加", description: "7.3/9.1/10.9/12.8/14.6%" },
                { id: "caring_heal", type: "info", label: "HP治癒量増加", description: "4.4/5.5/6.6/7.7/8.8%" }
            ],
        },
        {
            id: "spell_center_best",
            kind: "spell",
            rarity: "希少",
            name: "センター最高！",
            cost: 20,
            bonusesByStar: [
                { critDmgP: 5.3 },
                { critDmgP: 6.6 },
                { critDmgP: 7.9 },
                { critDmgP: 9.2 },
                { critDmgP: 10.5 }
            ],
            conditionalEffects: [
                {
                    id: "center_row_damage",
                    label: "中列時 与ダメージ増加",
                    shortLabel: "中列 与ダメ増",
                    type: "toggle",
                    bonusesByStar: [
                        { addP: 7.0 },
                        { addP: 8.0 },
                        { addP: 9.0 },
                        { addP: 10.0 },
                        { addP: 11.0 }
                    ]
                },
                {
                    id: "center_row_reduce",
                    label: "中列時 被ダメージ減少",
                    shortLabel: "中列 被ダメ減",
                    type: "toggle",
                    bonusesByStar: [
                        { takenDmgP: 5.0 },
                        { takenDmgP: 6.0 },
                        { takenDmgP: 7.0 },
                        { takenDmgP: 8.0 },
                        { takenDmgP: 9.0 }
                    ]
                }
            ],
        },
        {
            id: "spell_frontline",
            kind: "spell",
            rarity: "希少",
            name: "前衛隊",
            cost: 20,
            bonusesByStar: [
                { defP: 9.9 },
                { defP: 12.3 },
                { defP: 14.8 },
                { defP: 17.2 },
                { defP: 19.7 }
            ],
            conditionalEffects: [
                {
                    id: "frontline_row_damage",
                    label: "前列時 与ダメージ増加",
                    shortLabel: "前列 与ダメ増",
                    type: "toggle",
                    bonusesByStar: [
                        { addP: 4.0 },
                        { addP: 5.0 },
                        { addP: 6.0 },
                        { addP: 7.0 },
                        { addP: 8.0 }
                    ]
                },
                {
                    id: "frontline_row_reduce",
                    label: "前列時 被ダメージ減少",
                    shortLabel: "前列 被ダメ減",
                    type: "toggle",
                    bonusesByStar: [
                        { takenDmgP: 8.0 },
                        { takenDmgP: 9.0 },
                        { takenDmgP: 10.0 },
                        { takenDmgP: 11.0 },
                        { takenDmgP: 12.0 }
                    ]
                },
                { id: "frontline_haste", type: "info", label: "攻撃速度増加", description: "数値未確認" }
            ],
        },
        {
            id: "spell_backline",
            kind: "spell",
            rarity: "希少",
            name: "後衛隊",
            cost: 20,
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                { id: "backline_haste", type: "info", label: "攻撃速度増加", description: "7.9/9.9/11.8/13.8/15.8%" },
                {
                    id: "backline_row_damage",
                    label: "後列時 与ダメージ増加",
                    shortLabel: "後列 与ダメ増",
                    type: "toggle",
                    bonusesByStar: [
                        { addP: 9.0 },
                        { addP: 10.0 },
                        { addP: 11.0 },
                        { addP: 12.0 },
                        { addP: 13.0 }
                    ]
                },
                {
                    id: "backline_row_reduce",
                    label: "後列時 被ダメージ減少",
                    shortLabel: "後列 被ダメ減",
                    type: "toggle",
                    bonusesByStar: [
                        { takenDmgP: 3.0 },
                        { takenDmgP: 8.0 },
                        { takenDmgP: 8.0 },
                        { takenDmgP: 9.0 },
                        { takenDmgP: 9.0 }
                    ]
                }
            ],
        },
        {
            id: "spell_personality_madness",
            kind: "spell",
            rarity: "希少",
            name: "性格カード【狂気】",
            imageFile: "性格カード【狂気】.webp",
            cost: 16,
            bonusesByStar: [
                { atkP: 7.7 },
                { atkP: 9.7 },
                { atkP: 11.6 },
                { atkP: 13.5 },
                { atkP: 15.5 }
            ],
            conditionalEffects: [
                { id: "madness_personality", type: "info", label: "性格『狂気』判定+1", description: "狂気シナジーを1つ追加" }
            ],
        },
        {
            id: "spell_personality_lively",
            kind: "spell",
            rarity: "希少",
            name: "性格カード【活発】",
            imageFile: "性格カード【活発】.webp",
            cost: 16,
            bonusesByStar: [
                { critRateP: 7.7 },
                { critRateP: 9.7 },
                { critRateP: 11.6 },
                { critRateP: 13.5 },
                { critRateP: 15.5 }
            ],
            conditionalEffects: [
                { id: "lively_personality", type: "info", label: "性格『活発』判定+1", description: "活発シナジーを1つ追加" }
            ],
        },
        {
            id: "spell_personality_pure",
            kind: "spell",
            rarity: "希少",
            name: "性格カード【純粋】",
            imageFile: "性格カード【純粋】.webp",
            cost: 16,
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                { id: "pure_heal", type: "info", label: "HP回復量増加", description: "4.1/5.2/6.2/7.2/8.3%" },
                { id: "pure_personality", type: "info", label: "性格『純粋』判定+1", description: "純粋シナジーを1つ追加" }
            ],
        },
        {
            id: "spell_personality_gloomy",
            kind: "spell",
            rarity: "希少",
            name: "性格カード【憂鬱】",
            imageFile: "性格カード【憂鬱】.webp",
            cost: 16,
            bonusesByStar: [
                { defP: 7.7 },
                { defP: 9.7 },
                { defP: 11.6 },
                { defP: 13.5 },
                { defP: 15.5 }
            ],
            conditionalEffects: [
                { id: "gloomy_personality", type: "info", label: "性格『憂鬱』判定+1", description: "憂鬱シナジーを1つ追加" }
            ],
        },
        {
            id: "spell_personality_calm",
            kind: "spell",
            rarity: "希少",
            name: "性格カード【冷静】",
            imageFile: "性格カード【冷静】.webp",
            cost: 16,
            bonusesByStar: [
                { critDmgP: 4.1 },
                { critDmgP: 5.2 },
                { critDmgP: 6.2 },
                { critDmgP: 7.2 },
                { critDmgP: 8.3 }
            ],
            conditionalEffects: [
                { id: "calm_personality", type: "info", label: "性格『冷静』判定+1", description: "冷静シナジーを1つ追加" }
            ],
        },
        {
            id: "spell_speedy_movement",
            kind: "spell",
            rarity: "高級",
            name: "神速の身のこなし",
            cost: 22,
            bonusesByStar: [
                { critDmgP: 2.0 },
                { critDmgP: 2.4 },
                { critDmgP: 2.9 },
                { critDmgP: 3.4 },
                { critDmgP: 3.9 }
            ],
            conditionalEffects: [
                { id: "speedy_haste", type: "info", label: "攻撃速度増加", description: "2.9/3.7/4.4/5.1/5.8%" }
            ],
        },
        {
            id: "spell_firm_conviction",
            kind: "spell",
            rarity: "高級",
            name: "堅固な信念",
            cost: 21,
            bonusesByStar: [
                { critResP: 2.1, critDmgResP: 1.2 },
                { critResP: 2.6, critDmgResP: 1.5 },
                { critResP: 3.1, critDmgResP: 1.7 },
                { critResP: 3.6, critDmgResP: 2.0 },
                { critResP: 4.2, critDmgResP: 2.3 }
            ],
        },
        {
            id: "spell_critical_strike",
            kind: "spell",
            rarity: "高級",
            name: "会心の一撃",
            cost: 18,
            bonusesByStar: [
                { critRateP: 2.9, critDmgP: 1.6 },
                { critRateP: 3.7, critDmgP: 2.0 },
                { critRateP: 4.4, critDmgP: 2.3 },
                { critRateP: 5.1, critDmgP: 2.7 },
                { critRateP: 5.9, critDmgP: 3.1 }
            ],
        },
        {
            id: "spell_hp_training",
            kind: "spell",
            rarity: "高級",
            name: "体力強化",
            cost: 18,
            bonusesByStar: [
                { hpP: 3.9, defP: 2.9 },
                { hpP: 4.9, defP: 3.7 },
                { hpP: 5.9, defP: 4.4 },
                { hpP: 6.8, defP: 5.1 },
                { hpP: 7.8, defP: 5.9 }
            ],
            conditionalEffects: [
                { id: "hp_training_hp", type: "info", label: "最大HP増加", descriptionByStar: ["+3.9%", "+4.9%", "+5.9%", "+6.8%", "+7.8%"] }
            ],
        },
        {
            id: "spell_bulletproof",
            kind: "spell",
            rarity: "高級",
            name: "防弾不壊",
            cost: 17,
            bonusesByStar: [
                { hpP: 3.7, defP: 2.8 },
                { hpP: 4.6, defP: 3.4 },
                { hpP: 5.5, defP: 4.1 },
                { hpP: 6.4, defP: 4.8 },
                { hpP: 7.3, defP: 5.5 }
            ],
            conditionalEffects: [
                { id: "bulletproof_hp", type: "info", label: "最大HP増加", descriptionByStar: ["+3.7%", "+4.6%", "+5.5%", "+6.4%", "+7.3%"] }
            ],
        },
        {
            id: "spell_health_best",
            kind: "spell",
            rarity: "高級",
            name: "健康が一番",
            cost: 15,
            bonusesByStar: [
                { defP: 4.8 },
                { defP: 6.0 },
                { defP: 7.2 },
                { defP: 8.4 },
                { defP: 9.6 }
            ],
        },
        {
            id: "spell_afterimage",
            kind: "spell",
            rarity: "高級",
            name: "これ、残像だよ",
            cost: 13,
            bonusesByStar: [{}, {}, {}, {}, {}],
            conditionalEffects: [
                { id: "afterimage_haste", type: "info", label: "攻撃速度増加", descriptionByStar: ["+3.3%", "+4.1%", "+5.0%", "+5.8%", "+6.6%"] }
            ],
        },
        {
            id: "spell_personal_training",
            kind: "spell",
            rarity: "高級",
            name: "パーソナルトレーニング",
            cost: 12,
            bonusesByStar: [
                { hpP: 2.5, critResP: 1.1 },
                { hpP: 3.2, critResP: 1.4 },
                { hpP: 3.8, critResP: 1.7 },
                { hpP: 4.4, critResP: 2.0 },
                { hpP: 5.0, critResP: 2.3 }
            ],
            conditionalEffects: [
                { id: "personal_training_hp", type: "info", label: "最大HP増加", descriptionByStar: ["+2.5%", "+3.2%", "+3.8%", "+4.4%", "+5.0%"] }
            ],
        },
        {
            id: "spell_you_can_do_it",
            kind: "spell",
            rarity: "高級",
            name: "やればできる",
            cost: 12,
            bonusesByStar: [
                { atkP: 3.8 },
                { atkP: 4.7 },
                { atkP: 5.7 },
                { atkP: 6.6 },
                { atkP: 7.6 }
            ],
        },
        {
            id: "spell_apprentice_mage",
            kind: "spell",
            rarity: "高級",
            name: "見習い魔法使い",
            cost: 12,
            bonusesByStar: [
                { atkP: 1.9, critDmgP: 1.0 },
                { atkP: 2.4, critDmgP: 1.3 },
                { atkP: 2.8, critDmgP: 1.5 },
                { atkP: 3.3, critDmgP: 1.8 },
                { atkP: 3.8, critDmgP: 2.0 }
            ],
        },
        {
            id: "spell_catch_him",
            kind: "spell",
            rarity: "高級",
            name: "あいつを捕まえろ！",
            cost: 11,
            bonusesByStar: [
                { critRateP: 1.7 },
                { critRateP: 2.2 },
                { critRateP: 2.6 },
                { critRateP: 3.0 },
                { critRateP: 3.4 }
            ],
            conditionalEffects: [
                { id: "catch_him_haste", type: "info", label: "攻撃速度増加", descriptionByStar: ["+1.4%", "+1.7%", "+2.1%", "+2.4%", "+2.8%"] },
                {
                    id: "catch_him_wave",
                    label: "1ウェーブ攻撃力増加",
                    shortLabel: "1wave 攻撃+",
                    type: "toggle",
                    defaultEnabled: true,
                    bonusesByStar: [
                        { atkP: 15.0 },
                        { atkP: 17.5 },
                        { atkP: 20.0 },
                        { atkP: 22.5 },
                        { atkP: 25.0 }
                    ]
                }
            ],
        },
        {
            id: "spell_random_coin",
            kind: "spell",
            rarity: "高級",
            name: "ランダムコイン",
            cost: 11,
            bonusesByStar: [
                { hpP: 2.3 },
                { hpP: 2.9 },
                { hpP: 3.45 },
                { hpP: 4.05 },
                { hpP: 4.6 }
            ],
            conditionalEffects: [
                { id: "random_coin_hp", type: "info", label: "最大HP増加", descriptionByStar: ["+2.3%", "+2.9%", "+3.45%", "+4.05%", "+4.6%"] },
                {
                    id: "random_coin_coin",
                    type: "info",
                    label: "コイン獲得効果",
                    descriptionByStar: [
                        "7〜15枚獲得",
                        "9〜17枚獲得",
                        "11〜19枚獲得",
                        "13〜21枚獲得",
                        "15〜23枚獲得"
                    ]
                }
            ],
        },
        {
            id: "spell_tree_bark",
            kind: "spell",
            rarity: "高級",
            name: "巨木の皮",
            cost: 11,
            bonusesByStar: [
                { defP: 1.7 },
                { defP: 2.2 },
                { defP: 2.6 },
                { defP: 3.0 },
                { defP: 3.4 }
            ],
            conditionalEffects: [
                { id: "tree_bark_heal", type: "info", label: "HP回復量増加", descriptionByStar: ["+0.9%", "+1.2%", "+1.4%", "+1.6%", "+1.8%"] }
            ],
        },
        {
            id: "spell_rookie_fighter",
            kind: "spell",
            rarity: "高級",
            name: "新人ファイター",
            cost: 10,
            bonusesByStar: [
                { atkP: 1.6, critRateP: 1.6 },
                { atkP: 2.0, critRateP: 2.0 },
                { atkP: 2.3, critRateP: 2.3 },
                { atkP: 2.7, critRateP: 2.7 },
                { atkP: 3.1, critRateP: 3.1 }
            ],
        },
        {
            id: "spell_soda_capsule",
            kind: "spell",
            rarity: "高級",
            name: "ソーダ味カプセル",
            cost: 5,
            bonusesByStar: [
                { defP: 1.5 },
                { defP: 1.9 },
                { defP: 2.3 },
                { defP: 2.6 },
                { defP: 3.0 }
            ],
            conditionalEffects: [
                { id: "soda_capsule_sp", type: "info", label: "味方全体SP回復", descriptionByStar: ["36回復", "46回復", "56回復", "66回復", "76回復"] }
            ],
        },
        {
            id: "spell_strawberry_capsule",
            kind: "spell",
            rarity: "高級",
            name: "イチゴ味カプセル",
            cost: 4,
            bonusesByStar: [
                { hpP: 1.6 },
                { hpP: 2.0 },
                { hpP: 2.4 },
                { hpP: 2.8 },
                { hpP: 3.2 }
            ],
            conditionalEffects: [
                { id: "strawberry_capsule_hp", type: "info", label: "最大HP増加", descriptionByStar: ["+1.6%", "+2.0%", "+2.4%", "+2.8%", "+3.2%"] },
                { id: "strawberry_capsule_heal", type: "info", label: "味方全体HP回復", descriptionByStar: ["15%回復", "16.5%回復", "18%回復", "19.5%回復", "21%回復"] }
            ],
        }
    ]
};

const CARD_SOLDER_DATA = {
    relic_yomi_flower: { 1: { critRateP: 5.2, critDmgP: 2.8 }, 2: { critRateP: 10.5, critDmgP: 5.7 } },
    relic_elfin_ice_cake: { 1: { atkP: 3.8, hpP: 4.9 }, 2: { atkP: 7.5, hpP: 9.9 } },
    relic_butter_yellow_card: { 1: { atkP: 4.4, hasteP: 3.5 }, 2: { atkP: 8.8, hasteP: 7.0 } },
    relic_vivi_baton: { 1: { hpP: 6.4, critDmgResP: 1.6 }, 2: { hpP: 12.8, critDmgResP: 3.3 } },
    relic_elena_drone: { 1: { hpP: 4.1, atkP: 3.4 }, 2: { hpP: 8.3, atkP: 6.7 } },
    relic_ritz_whetstone: { 1: { hpP: 4.6, defP: 4.6 }, 2: { hpP: 9.2, defP: 9.2 } },
    relic_blanse_bouquet: { 1: { critRateP: 1.7, critDmgP: 1.1 }, 2: { critRateP: 3.3, critDmgP: 2.1 } },
    relic_picola_pouch: { 1: { atkP: 4.6, healingP: 3.7 }, 2: { atkP: 9.2, healingP: 7.4 } },
    relic_chloe_sewing_chest: { 1: { hasteP: 4.9, critResP: 3.7 }, 2: { hasteP: 9.9, critResP: 7.4 } },
    relic_listy_replica_glove: { 1: { atkP: 3.8, critDmgP: 2.0 }, 2: { atkP: 7.5, critDmgP: 4.0 } },
    relic_shion_black_cloak: { 1: { atkP: 7.9, critRateP: 3.3 }, 2: { atkP: 15.8, critRateP: 6.6 } },
    relic_naia_watergun: { 1: { hpP: 4.9, defP: 3.8 }, 2: { hpP: 9.9, defP: 7.5 } },
    relic_shupan_backpack: { 1: { hpP: 6.4, atkP: 4.8 }, 2: { hpP: 12.8, atkP: 9.7 } },
    relic_snoky_fedora: { 1: { hasteP: 2.8, hpP: 4.7 }, 2: { hasteP: 5.7, hpP: 9.4 } },
    relic_serine_night_mirage: { 1: { critResP: 3.4, critDmgResP: 1.9 }, 2: { critResP: 6.9, critDmgResP: 3.8 } },
    relic_carrot_cane: { 1: { hasteP: 2.6, defP: 3.3 }, 2: { hasteP: 5.3, defP: 6.7 } },
    relic_dragon_sword: { 1: { atkP: 10.0 }, 2: { atkP: 20.1 } },
    relic_life_gem: { 1: { hpP: 6.1, critDmgResP: 1.6 }, 2: { hpP: 12.3, critDmgResP: 3.1 } },
    relic_30kg_kettlebell: { 1: { critRateP: 4.4, critDmgP: 2.3 }, 2: { critRateP: 8.8, critDmgP: 4.7 } },
    relic_nisril_knife: { 1: { atkP: 4.1, hasteP: 3.4 }, 2: { atkP: 8.3, hasteP: 6.7 } },
    relic_fuwafuwa_vest: { 1: { defP: 6.6 }, 2: { defP: 13.2 } },
    relic_eldain_lamp: { 1: { healingP: 9.9 }, 2: { healingP: 19.8 } },
    relic_assassin_book: { 1: { atkP: 2.0, critRateP: 2.0 }, 2: { atkP: 4.1, critRateP: 4.1 } },
    relic_sword_staff: { 1: { atkP: 3.4, hasteP: 2.7 }, 2: { atkP: 6.9, hasteP: 5.5 } },
    relic_safety_belt: { 1: { hpP: 8.8 }, 2: { hpP: 17.5 } },
    relic_battle_manual: { 1: { critRateP: 2.9, critDmgP: 1.6 }, 2: { critRateP: 5.9, critDmgP: 3.2 } },
    relic_blue_grimoire: { 1: { atkP: 5.9 }, 2: { atkP: 11.8 } },
    relic_scale_armor: { 1: { hpRecoveryP: 1.3, defP: 2.5 }, 2: { hpRecoveryP: 2.6, defP: 5.0 } },
    relic_blessed_pauldron: { 1: { hpP: 3.0, defP: 2.3 }, 2: { hpP: 6.1, defP: 4.6 } },
    relic_origin_grail: { 1: { critDmgP: 1.2, hasteP: 1.7 }, 2: { critDmgP: 2.4, hasteP: 3.4 } },
    relic_high_priest_censer: { 1: { defP: 4.3 }, 2: { defP: 8.7 } },
    relic_madness_mask: { 1: { critDmgResP: 1.3 }, 2: { critDmgResP: 2.7 } },
    relic_healing_pendant: { 1: { healingP: 3.2 }, 2: { healingP: 6.4 } },
    relic_obsidian_shuriken: { 1: { atkP: 3.3 }, 2: { atkP: 6.7 } },
    relic_greed_ring: { 1: { critDmgResP: 0.8 }, 2: { critDmgResP: 1.7 } },
    relic_oldwood_dagger: { 1: { critDmgP: 1.3 }, 2: { critDmgP: 2.6 } },
    relic_elf_staff: { 1: { hpRecoveryP: 1.1 }, 2: { hpRecoveryP: 2.2 } },
    relic_gem_ring: { 1: { atkP: 1.0, critDmgP: 0.6 }, 2: { atkP: 2.1, critDmgP: 1.1 } },
    relic_thorn_crown: { 1: { defP: 1.9 }, 2: { defP: 3.8 } },
    relic_old_arrow: { 1: { hasteP: 1.5 }, 2: { hasteP: 3.0 } },
    relic_frost_charm: { 1: { critResP: 1.1 }, 2: { critResP: 2.2 } },
    relic_furoshiki_robe: { 1: { critResP: 1.1 }, 2: { critResP: 2.2 } },
    relic_shining_tiara: { 1: { healingP: 1.1 }, 2: { healingP: 2.2 } },
    relic_cardboard_armor: { 1: { defP: 1.6 }, 2: { defP: 3.3 } },
    relic_rusty_awl: { 1: { critRateP: 1.1 }, 2: { critRateP: 2.2 } },

    spell_alice_hex: { 1: { atkP: 1.9, critRateP: 1.9 }, 2: { atkP: 3.9, critRateP: 3.9 } },
    spell_epica_anthem: { 1: { atkP: 2.6, critDmgP: 1.3 }, 2: { atkP: 5.2, critDmgP: 2.7 } },
    spell_yiide_dream: { 1: { critResP: 1.9, critDmgResP: 1.0 }, 2: { critResP: 3.8, critDmgResP: 2.1 } },
    spell_renewa_time_paradox: { 1: { critRateP: 2.3, critDmgP: 1.2 }, 2: { critRateP: 4.6, critDmgP: 2.4 } },
    spell_suspicious_potion: { 1: { critRateP: 4.7, critDmgP: 2.9 }, 2: { critRateP: 5.9, critDmgP: 3.7 } },
    spell_beauty_is_sin: { 1: { critRateP: 2.4, critDmgP: 1.2 }, 2: { critRateP: 4.8, critDmgP: 2.5 } },
    spell_battle_master: { 1: { atkP: 4.0 }, 2: { atkP: 8.1 } },
    spell_aromatherapy: { 1: { healingP: 0.6, hpRecoveryP: 0.4 }, 2: { healingP: 1.3, hpRecoveryP: 0.9 } },
    spell_motivation_up: { 1: { critRateP: 1.5, hasteP: 1.2 }, 2: { critRateP: 3.0, hasteP: 2.4 } },
    spell_caring: { 1: { hpP: 1.8, healingP: 1.1 }, 2: { hpP: 3.6, healingP: 2.2 } },
    spell_center_best: { 1: { critDmgP: 1.3 }, 2: { critDmgP: 2.7 } },
    spell_frontline: { 1: { defP: 2.5 }, 2: { defP: 4.9 } },
    spell_backline: { 1: { hasteP: 2.0 }, 2: { hasteP: 3.9 } },
    spell_personality_madness: { 1: { atkP: 1.9 }, 2: { atkP: 3.9 } },
    spell_personality_lively: { 1: { critRateP: 1.9 }, 2: { critRateP: 3.9 } },
    spell_personality_pure: { 1: { hpRecoveryP: 1.0 }, 2: { hpRecoveryP: 2.0 } },
    spell_personality_gloomy: { 1: { defP: 1.9 }, 2: { defP: 3.9 } },
    spell_personality_calm: { 1: { critDmgP: 1.0 }, 2: { critDmgP: 2.0 } },
    spell_speedy_movement: { 1: { hasteP: 0.8, critDmgP: 0.5 }, 2: { hasteP: 1.5, critDmgP: 1.0 } },
    spell_firm_conviction: { 1: { critResP: 0.5, critDmgResP: 0.3 }, 2: { critResP: 1.0, critDmgResP: 0.6 } },
    spell_critical_strike: { 1: { critRateP: 0.7, critDmgP: 0.4 }, 2: { critRateP: 1.4, critDmgP: 0.8 } },
    spell_hp_training: { 1: { hpP: 1.0, defP: 0.7 }, 2: { hpP: 2.0, defP: 1.4 } },
    spell_bulletproof: { 1: { hpP: 1.0, defP: 0.7 }, 2: { hpP: 1.9, defP: 1.4 } },
    spell_health_best: { 1: { defP: 1.2 }, 2: { defP: 2.4 } },
    spell_afterimage: { 1: { hasteP: 0.8 }, 2: { hasteP: 1.7 } },
    spell_personal_training: { 1: { hpP: 0.7, critResP: 0.2 }, 2: { hpP: 1.3, critResP: 0.5 } },
    spell_you_can_do_it: { 1: { atkP: 0.9 }, 2: { atkP: 1.9 } },
    spell_apprentice_mage: { 1: { atkP: 0.5, critDmgP: 0.3 }, 2: { atkP: 0.9, critDmgP: 0.5 } },
    spell_catch_him: { 1: { hasteP: 0.3, critRateP: 0.5 }, 2: { hasteP: 0.7, critRateP: 0.9 } },
    spell_random_coin: { 1: { hpP: 1.2 }, 2: { hpP: 2.3 } },
    spell_tree_bark: { 1: { hpRecoveryP: 0.3, defP: 0.5 }, 2: { hpRecoveryP: 0.5, defP: 0.9 } },
    spell_rookie_fighter: { 1: { atkP: 0.4, critRateP: 0.4 }, 2: { atkP: 0.8, critRateP: 0.8 } },
    spell_soda_capsule: { 1: { defP: 0.4 }, 2: { defP: 0.8 } },
    spell_strawberry_capsule: { 1: { hpP: 0.4 }, 2: { hpP: 0.8 } }
};

for (const card of [...CARD_LIBRARY.artifacts, ...CARD_LIBRARY.spells]) {
    if (CARD_SOLDER_DATA[card.id]) {
        card.solderBonuses = CARD_SOLDER_DATA[card.id];
    }
}

const CARD_INDEX = Object.fromEntries(
    [...CARD_LIBRARY.artifacts, ...CARD_LIBRARY.spells].map(card => [card.id, card])
);
