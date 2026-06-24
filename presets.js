// Trickcal Damage Calculator - Preset Data
// You can easily add new characters or enemies here.

const PLAYER_PRESETS = {
    "dummy_player": {
        name: "[P] Dummy",
        atk: 30000,
        hp: 200000,
        crit: 25000,
        critDmg: 25000,
        def: 60000,
        critRes: 20000,
        critDmgRes: 20000,
        skills: [
            { name: "通常攻撃1", mult: 100 },
            { name: "通常攻撃2", mult: 50 },
            { name: "通常攻撃3", mult: 80 },
            { name: "通常攻撃4", mult: 120 },
            { name: "通常攻撃5", mult: 150 },
            { name: "強攻撃1", mult: 200 },
            { name: "強攻撃2", mult: 300 },
            { name: "スキル攻撃1", mult: 250 },
            { name: "スキル攻撃2", mult: 500 },
            { name: "スキル攻撃3", mult: 1000 }
        ]
    },
    "dummy_player_2": {
        name: "[P] Dummy 2",
        atk: 60000,
        hp: 400000,
        crit: 50000,
        critDmg: 50000,
        def: 90000,
        critRes: 40000,
        critDmgRes: 40000,
        skills: [
            { name: "通常攻撃1", mult: 100 },
            { name: "通常攻撃2", mult: 50 },
            { name: "通常攻撃3", mult: 80 },
            { name: "通常攻撃4", mult: 120 },
            { name: "通常攻撃5", mult: 150 },
            { name: "強攻撃1", mult: 200 },
            { name: "強攻撃2", mult: 300 },
            { name: "スキル攻撃1", mult: 250 },
            { name: "スキル攻撃2", mult: 500 },
            { name: "スキル攻撃3", mult: 1000 }
        ]
    },
    "dummy_player_3": {
        name: "[P] Dummy 3",
        atk: 90000,
        hp: 600000,
        crit: 50000,
        critDmg: 50000,
        def: 120000,
        critRes: 40000,
        critDmgRes: 40000,
        skills: [
            { name: "通常攻撃1", mult: 100 },
            { name: "通常攻撃2", mult: 50 },
            { name: "通常攻撃3", mult: 80 },
            { name: "通常攻撃4", mult: 120 },
            { name: "通常攻撃5", mult: 150 },
            { name: "強攻撃1", mult: 200 },
            { name: "強攻撃2", mult: 300 },
            { name: "スキル攻撃1", mult: 250 },
            { name: "スキル攻撃2", mult: 500 },
            { name: "スキル攻撃3", mult: 1000 }
        ]
    }
};

const ENEMY_PRESETS = {
    "lily_d_15": {
        name: "[次元15] リリ一",
        hp: 661796770,
        atk_p: 28120,
        atk_m: 28120,
        def_p: 52195,
        def_m: 52195,
        dmgType: 'mag',
        crit: 44165,
        critDmg: 44165,
        critRes: 36146,
        critDmgRes: 36146,
        special: 2385.714,
        modifiers: {
            debuffs: { anger: 200 }
        },
        skills: [
            { action: "攻撃", name: "普通攻撃", mult: 100 },
            { action: "攻撃", name: "ピコハン", mult: 100, note: "AoE / 気絶" },
            { action: "攻撃", name: "ネギ", mult: 150 },
            { action: "攻撃", name: "100tハンマー", mult: 400, note: "AoE" },
            { action: "攻撃", name: "火の息", mult: 75, note: "5段: 15%×5 / AoE" },
            { action: "攻撃", name: "暴走モードA", mult: 100, note: "ABCDをランダム?で繰り返し" },
            { action: "攻撃", name: "暴走モードB", mult: 150, note: "ABCDをランダム?で繰り返し" },
            { action: "攻撃", name: "暴走モードC", mult: 200, note: "ABCDをランダム?で繰り返し" },
            { action: "攻撃", name: "暴走モードD", mult: 250, note: "ABCDをランダム?で繰り返し" }
        ]
    },
        "lily_d_18": {
        name: "[次元18] リリ一",
        hp: 1486382912,
        atk_p: 42150,
        atk_m: 42150,
        def_p: 78195,
        def_m: 78195,
        dmgType: 'mag',
        crit: 66165,
        critDmg: 66165,
        critRes: 54146,
        critDmgRes: 54146,
        special: 3528.571,
        modifiers: {
            debuffs: { anger: 200 }
        },
        skills: [
            { action: "攻撃", name: "普通攻撃", mult: 100 },
            { action: "攻撃", name: "ピコハン", mult: 100, note: "AoE / 気絶" },
            { action: "攻撃", name: "ネギ", mult: 150 },
            { action: "攻撃", name: "100tハンマー", mult: 400, note: "AoE" },
            { action: "攻撃", name: "火の息", mult: 75, note: "5段: 15%×5 / AoE" },
            { action: "攻撃", name: "暴走モードA", mult: 100, note: "ABCDをランダム?で繰り返し" },
            { action: "攻撃", name: "暴走モードB", mult: 150, note: "ABCDをランダム?で繰り返し" },
            { action: "攻撃", name: "暴走モードC", mult: 200, note: "ABCDをランダム?で繰り返し" },
            { action: "攻撃", name: "暴走モードD", mult: 250, note: "ABCDをランダム?で繰り返し" }
        ]
    },
    "Kérberos_d_15": {
        name: "[次元15] ケルベロス",
        hp: 860335869,
        atk_p: 24090,
        atk_m: 24090,
        def_p: 52195,
        def_m: 52195,
        dmgType: 'phys',
        crit: 32120,
        critDmg: 32130,
        critRes: 36146,
        critDmgRes: 36146,
        special: 2385.714,
        modifiers: {
            debuffs: { anger: 200 }
        },
        skills: [
            { action: "攻撃", name: "普通攻撃", mult: 100, note: "2段: 50%*2" },
            { action: "攻撃", name: "叩きつけ", mult: 150 },
            { action: "攻撃", name: "舐め回し", mult: 1248, note: "18段: (22%+150%)×9 / 目隠し" },
            { action: "攻撃", name: "咆哮", mult: 305, note: "17段: 17.94%×17" },
            { action: "攻撃", name: "突進", mult: 350, note: "2段×n: (175%×2)×n" },
            { action: "攻撃", name: "突進", mult: 241, note: "最終段" },
            { action: "攻撃", name: "吸い込み", mult: 650, note: "16段+1段: 25%×16+250%" }
        ]
    },
    "Kérberos_d_18": {
        name: "[次元18] ケルベロス",
        hp: 1932297888,
        atk_p: 36090,
        atk_m: 36090,
        def_p: 78195,
        def_m: 78195,
        dmgType: 'phys',
        crit: 48120,
        critDmg: 48120,
        critRes: 54146,
        critDmgRes: 54146,
        special: 3528.571,
        modifiers: {
            debuffs: { anger: 200 }
        },
        skills: [
            { action: "攻撃", name: "普通攻撃", mult: 100, note: "2段: 50%×2" },
            { action: "攻撃", name: "叩きつけ", mult: 150 },
            { action: "攻撃", name: "舐め回し", mult: 1248, note: "18段: (22%+150%)×9 / 目隠し" },
            { action: "攻撃", name: "咆哮", mult: 305, note: "17段: 17.94%×17" },
            { action: "攻撃", name: "突進", mult: 350, note: "2段×n: (175%×2)×n" },
            { action: "攻撃", name: "突進", mult: 241, note: "最終段" },
            { action: "攻撃", name: "吸い込み", mult: 650, note: "16段+1段: 25%×16+250%" }
        ]
    },
    "Isamurayon_d_15": {
        name: "[次元15] イサムレヨン",
        hp: 1323593540,
        atk_p: 28105,
        atk_m: 28105,
        def_p: 76295,
        def_m: 76295,
        dmgType: 'phys',
        crit: 44180,
        critDmg: 44180,
        critRes: 32115,
        critDmgRes: 32115,
        special: 3528.571,
        modifiers: {
            debuffs: { anger: 200 }
        },
        skills: [
            { name: "普通攻撃", mult:100  },
            { name: "薙ぎ払い", mult:175  },
            { name: "縦振り", mult:400  }
        ]
    },
"Isamurayon_d_18": {
        name: "[次元18] イサムレヨン",
        hp: 2972765824,
        atk_p: 42105,
        atk_m: 42105,
        def_p: 114295,
        def_m: 114295,
        dmgType: 'phys',
        crit: 66180,
        critDmg: 66180,
        critRes: 48115,
        critDmgRes: 48115,
        special: 3528.571,
        modifiers: {
            debuffs: { anger: 200 }
        },
        skills: [
            { name: "普通攻撃", mult:100  },
            { name: "薙ぎ払い", mult:175  },
            { name: "縦振り", mult:400  }
        ]
    },
    "meow_ef_11": {
        name: "[EF/微辛1] M.E.O.W",
        hp: 401524,
        atk_p: 1501,
        atk_m: 1501,
        def_p: 2795,
        def_m: 2795,
        dmgType: "phys",
        crit: 2365,
        critDmg: 2365,
        critRes: 1945,
        critDmgRes: 1945,
        special: 214.286,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09230083, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.18460416, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.27690499, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.36920583, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.46150666, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_12": {
        name: "[EF/微辛2] M.E.O.W",
        hp: 2179702,
        atk_p: 3619,
        atk_m: 3619,
        def_p: 6695,
        def_m: 6695,
        dmgType: "phys",
        crit: 5665,
        critDmg: 5665,
        critRes: 4645,
        critDmgRes: 4645,
        special: 385.714,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09677149, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19354297, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29031446, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.38708594, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.48385743, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_21": {
        name: "[EF/小辛1] M.E.O.W",
        hp: 4745749,
        atk_p: 5384,
        atk_m: 5384,
        def_p: 9945,
        def_m: 9945,
        dmgType: "phys",
        crit: 8415,
        critDmg: 8415,
        critRes: 6895,
        critDmgRes: 6895,
        special: 528.571,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09782418, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19564836, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29347254, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39129693, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.48912111, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_22": {
        name: "[EF/小辛2] M.E.O.W",
        hp: 11848508,
        atk_p: 8560,
        atk_m: 8560,
        def_p: 15795,
        def_m: 15795,
        dmgType: "phys",
        crit: 13365,
        critDmg: 13365,
        critRes: 10945,
        critDmgRes: 10945,
        special: 785.714,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09862904, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19725800, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29588696, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39451592, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49314488, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_31": {
        name: "[EF/中辛1] M.E.O.W",
        hp: 26286605,
        atk_p: 12795,
        atk_m: 12795,
        def_p: 23595,
        def_m: 23595,
        dmgType: "phys",
        crit: 19965,
        critDmg: 19965,
        critRes: 16345,
        critDmgRes: 16345,
        special: 1128.571,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09908179, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19816359, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29724535, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39632714, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49540894, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_32": {
        name: "[EF/中辛2]M.E.O.W",
        hp: 58588935,
        atk_p: 19148,
        atk_m: 19148,
        def_p: 35295,
        def_m: 35295,
        dmgType: "phys",
        crit: 29865,
        critDmg: 29865,
        critRes: 24445,
        critDmgRes: 24445,
        special: 1642.857,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09938597, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19877194, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29815792, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39754389, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49692986, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_41": {
        name: "[EF/麻辣1] M.E.O.W",
        hp: 127799868,
        atk_p: 28325,
        atk_m: 28325,
        def_p: 52195,
        def_m: 52195,
        dmgType: "phys",
        crit: 44165,
        critDmg: 44165,
        critRes: 36145,
        critDmgRes: 36145,
        special: 2385.714,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09958470, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19916940, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29875410, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39833881, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49792351, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" }
        ]
    },
    "meow_ef_42": {
        name: "[EF/麻辣2] M.E.O.W",
        hp: 286321339,
        atk_p: 42442,
        atk_m: 42442,
        def_p: 78195,
        def_m: 78195,
        dmgType: "phys",
        crit: 66165,
        critDmg: 66165,
        critRes: 54145,
        critDmgRes: 54145,
        special: 3528.571,
        weakness: {
            phys: { add: 75 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09972275, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19944550, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29916825, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39889100, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49861376, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "叩きつけ", mult: 50, note: "AoE / 2段" },
            { action: "攻撃", name: "叩きつけ", mult: 100, note: "AoE / 2段" },
            { action: "攻撃", name: "張り手", mult: 150, note: "AoE" },
            { action: "攻撃", name: "張り手 2段hit", mult: 300, note: "AoE" },
            { action: "攻撃", name: "ランチャー", mult: 240, note: "AoE / RNG / 3発" },
            { action: "攻撃", name: "ガトリング", mult: 150, note: "AoE / 9発?" },
            { action: "攻撃", name: "ガトリング 9発hit", mult: 1350, note: "AoE / 9発?" },
            { action: "攻撃", name: "波状攻撃", mult: 200, note: "AoE / 12発" },
            { action: "攻撃", name: "波状攻撃 12発hit", mult: 2400, note: "AoE / 12発" },
            { action: "攻撃", name: "火炎放射", mult: 400, note: "AoE / 11発" },
            { action: "攻撃", name: "火炎放射 12発hit", mult: 4800, note: "AoE / 11発" },
            { action: "攻撃", name: "ミサイル", mult: 700, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "ミサイル 2発hit", mult: 1400, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "ミサイル 3発hit", mult: 2100, note: "AoE / RNG / 全14発?" },
            { action: "攻撃", name: "溜めレーザー", mult: 300, note: "AoE / 14発" },
            { action: "攻撃", name: "溜めレーザー 14発hit", mult: 4200, note: "AoE / 14発" }
        ]
    },
    "R41Renewa_ef_31": {
        name: "[EF/中辛1] R41リニュア",
        hp: 26286605,
        atk_p: 12795,
        atk_m: 12795,
        def_p: 23595,
        def_m: 23595,
        dmgType: "phys",
        crit: 19965,
        critDmg: 19965,
        critRes: 16345,
        critDmgRes: 16345,
        special: 1128.571,
        weakness: {
            mag: { add: 75 }
        },
        modifiers: {
            debuffs: { takenDmg: 30, painTakenDmg: 30 },
            targetDebuffs: { breakTakenDmg: 45 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09908179, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19816359, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29724535, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39632714, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49540894, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "光弾", mult: 150, note: "RNG / 3発: 50%×3" },
            { action: "攻撃", name: "薙ぎ払い", mult: 200, note: "AoE" },
            { action: "攻撃", name: "斬り上げ", mult: 200, note: "AoE / デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ2hit", mult: 600, note: "AoE / デバフ:破壊 / 2発:200%+400%" },
            { action: "攻撃", name: "ドローン砲撃", mult: 300, note: "ドローン数で1～3発?" },
            { action: "攻撃", name: "斬り上げ+振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ+回転振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "突き(ビーム前)", mult: 300, note: "AoE" },
            { action: "攻撃", name: "ビーム", mult: 1250, note: "AoE / 5発: 250%×5" },
            { action: "攻撃", name: "ビーム(ドローン追撃)", mult: 500, note: "AoE / ドローン数で1～2発?" },
            { action: "攻撃", name: "重力球", mult: 600, note: "AoE / 火傷" },
            { action: "攻撃", name: "着陸（重力球破壊失敗時）", mult: 1000, note: "AoE" },
            { action: "攻撃", name: "時間停止ドローン", mult: 2030, note: "10体: 203%×10?" }
        ]
    },
    "R41Renewa_ef_32": {
        name: "[EF/中辛2]R41リニュア",
        hp: 58588935,
        atk_p: 19148,
        atk_m: 19148,
        def_p: 35295,
        def_m: 35295,
        dmgType: "phys",
        crit: 29865,
        critDmg: 29865,
        critRes: 24445,
        critDmgRes: 24445,
        special: 1642.857,
        weakness: {
            mag: { add: 75 }
        },
        modifiers: {
            debuffs: { takenDmg: 30, painTakenDmg: 30 },
            targetDebuffs: { breakTakenDmg: 45 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09938597, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19877194, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29815792, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39754389, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49692986, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "光弾", mult: 150, note: "RNG / 3発: 50%×3" },
            { action: "攻撃", name: "薙ぎ払い", mult: 200, note: "AoE" },
            { action: "攻撃", name: "斬り上げ", mult: 200, note: "AoE / デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ2hit", mult: 600, note: "AoE / デバフ:破壊 / 2発:200%+400%" },
            { action: "攻撃", name: "ドローン砲撃", mult: 300, note: "ドローン数で1～3発?" },
            { action: "攻撃", name: "斬り上げ+振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ+回転振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "突き(ビーム前)", mult: 300, note: "AoE" },
            { action: "攻撃", name: "ビーム", mult: 1250, note: "AoE / 5発: 250%×5" },
            { action: "攻撃", name: "ビーム(ドローン追撃)", mult: 500, note: "AoE / ドローン数で1～2発?" },
            { action: "攻撃", name: "重力球", mult: 600, note: "AoE / 火傷" },
            { action: "攻撃", name: "着陸（重力球破壊失敗時）", mult: 1000, note: "AoE" },
            { action: "攻撃", name: "時間停止ドローン", mult: 2030, note: "10体: 203%×10?" }
        ]
    },
    "R41Renewa_ef_41": {
        name: "[EF/麻辣1] R41リニュア",
        hp: 127799868,
        atk_p: 28325,
        atk_m: 28325,
        def_p: 52195,
        def_m: 52195,
        dmgType: "phys",
        crit: 44165,
        critDmg: 44165,
        critRes: 36145,
        critDmgRes: 36145,
        special: 2385.714,
        weakness: {
            mag: { add: 75 }
        },
        modifiers: {
            debuffs: { takenDmg: 30, painTakenDmg: 30 },
            targetDebuffs: { breakTakenDmg: 45 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09958470, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19916940, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29875410, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39833881, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49792351, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "光弾", mult: 150, note: "RNG / 3発: 50%×3" },
            { action: "攻撃", name: "薙ぎ払い", mult: 200, note: "AoE" },
            { action: "攻撃", name: "斬り上げ", mult: 200, note: "AoE / デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ2hit", mult: 600, note: "AoE / デバフ:破壊 / 2発:200%+400%" },
            { action: "攻撃", name: "ドローン砲撃", mult: 300, note: "ドローン数で1～3発?" },
            { action: "攻撃", name: "斬り上げ+振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ+回転振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "突き(ビーム前)", mult: 300, note: "AoE" },
            { action: "攻撃", name: "ビーム", mult: 1250, note: "AoE / 5発: 250%×5" },
            { action: "攻撃", name: "ビーム(ドローン追撃)", mult: 500, note: "AoE / ドローン数で1～2発?" },
            { action: "攻撃", name: "重力球", mult: 600, note: "AoE / 火傷" },
            { action: "攻撃", name: "着陸（重力球破壊失敗時）", mult: 1000, note: "AoE" },
            { action: "攻撃", name: "時間停止ドローン", mult: 2030, note: "10体: 203%×10?" }
        ]
    },
    "R41Renewa_ef_42": {
        name: "[EF/麻辣2] R41リニュア",
        hp: 286321339,
        atk_p: 42442,
        atk_m: 42442,
        def_p: 78195,
        def_m: 78195,
        dmgType: "phys",
        crit: 66165,
        critDmg: 66165,
        critRes: 54145,
        critDmgRes: 54145,
        special: 3528.571,
        weakness: {
            mag: { add: 75 }
        },
        modifiers: {
            debuffs: { takenDmg: 30, painTakenDmg: 30 },
            targetDebuffs: { breakTakenDmg: 45 }
        },
        phases: [
            { name: "Phase 1 (5/5)", mult: 1.0, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 2 (4/5)", mult: 1.09972275, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 3 (3/5)", mult: 1.19944550, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 4 (2/5)", mult: 1.29916825, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 5 (1/5)", mult: 1.39889100, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] },
            { name: "Phase 6 (0/5)", mult: 1.49861376, scaleStats: ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'] }
        ],
        skills: [
            { action: "攻撃", name: "光弾", mult: 150, note: "RNG / 3発: 50%×3" },
            { action: "攻撃", name: "薙ぎ払い", mult: 200, note: "AoE" },
            { action: "攻撃", name: "斬り上げ", mult: 200, note: "AoE / デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ2hit", mult: 600, note: "AoE / デバフ:破壊 / 2発:200%+400%" },
            { action: "攻撃", name: "ドローン砲撃", mult: 300, note: "ドローン数で1～3発?" },
            { action: "攻撃", name: "斬り上げ+振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "斬り上げ+回転振り下ろし", mult: 0, note: "デバフ:破壊" },
            { action: "攻撃", name: "突き(ビーム前)", mult: 300, note: "AoE" },
            { action: "攻撃", name: "ビーム", mult: 1250, note: "AoE / 5発: 250%×5" },
            { action: "攻撃", name: "ビーム(ドローン追撃)", mult: 500, note: "AoE / ドローン数で1～2発?" },
            { action: "攻撃", name: "重力球", mult: 600, note: "AoE / 火傷" },
            { action: "攻撃", name: "着陸（重力球破壊失敗時）", mult: 1000, note: "AoE" },
            { action: "攻撃", name: "時間停止ドローン", mult: 2030, note: "10体: 203%×10?" },
            { action: "DoT", name: "火傷", mult: 30, note: "隕石により火傷/スタックする" }
        ]
    },
    "GTA_24": {
        name: "[GTA24]バンク蔵-憂鬱",
        hp: 4231046,
        atk_p: 1,
        atk_m: 1,
        def_p: 114582,
        def_m: 114582,
        dmgType: 'phys',
        crit: 1,
        critDmg: 1,
        critRes: 20000,
        critDmgRes: 1,
        special: 100,
        skills: [
            { action: "攻撃", name: "通常攻撃", mult: 100 },
        ]
    },
    "dummy_enemy": {
        name: "[E] Dummy",
        hp: 1000000,
        atk_p: 30000,
        atk_m: 30000,
        def_p: 60000,
        def_m: 60000,
        dmgType: 'phys',
        crit: 25000,
        critDmg: 25000,
        critRes: 20000,
        critDmgRes: 20000,
        special: 100,
        skills: [
            { action: "攻撃", name: "通常攻撃1", mult: 100 },
            { action: "攻撃", name: "通常攻撃2", mult: 50 },
            { action: "攻撃", name: "通常攻撃3", mult: 80 },
            { action: "攻撃", name: "通常攻撃4", mult: 120 },
            { action: "攻撃", name: "通常攻撃5", mult: 150 },
            { action: "攻撃", name: "強攻撃1", mult: 200 },
            { action: "攻撃", name: "強攻撃2", mult: 300 },
            { action: "攻撃", name: "スキル攻撃1", mult: 500 },
            { action: "攻撃", name: "スキル攻撃2", mult: 1000 }
        ]
    }
};
