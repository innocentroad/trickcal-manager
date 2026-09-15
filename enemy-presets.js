// Trickcal Damage Calculator - Enemy Preset Data
// Keep this file enemy-only for formation damage pages.

const ENEMY_PRESET_CONTENTS = Object.freeze({
    crusade: Object.freeze({
        label: "進軍",
        englishLabel: "Crusade",
        difficulties: Object.freeze({
            mild: Object.freeze({ label: "微辛" }),
            medium: Object.freeze({ label: "中辛" }),
            hot: Object.freeze({ label: "激辛" })
        })
    }),
    dimensionalClash: Object.freeze({
        label: "次元の衝突",
        shortLabel: "次元",
        englishLabel: "Dimensional Clash",
        rules: Object.freeze({
            fixedGrade: 6,
            disabledEffectSources: Object.freeze(["spell"]),
            artifactLimitCycle: Object.freeze([5, 9, 13])
        })
    }),
    eliasFrontier: Object.freeze({
        label: "エーリアスフロンティア",
        shortLabel: "EF",
        englishLabel: "Elias Frontier",
        stageLabels: Object.freeze(["微辛1", "微辛2", "小辛1", "小辛2", "中辛1", "中辛2", "麻辣1", "麻辣2", "激辛1", "激辛2"]),
        rules: Object.freeze({
            fixedGrade: 4,
            disabledEffectSources: Object.freeze(["synergy"])
        })
    }),
    yggdrasilDigSite: Object.freeze({ label: "世界樹採掘基地", englishLabel: "Yggdrasil Dig Site" }),
    crashCourse: Object.freeze({ label: "短期速成コース", englishLabel: "Crash Course" }),
    dollyDelightBusters: Object.freeze({ label: "ヌウリングバスターズ", englishLabel: "Dolly Delight Busters" }),
    dungeon: Object.freeze({
        label: "ダンジョン",
        englishLabel: "Dungeon",
        hideInSelection: true,
        modes: Object.freeze({
            secretBakery: Object.freeze({ label: "秘密ベーカリー", englishLabel: "Secret Bakery" }),
            goldThiefAttack: Object.freeze({ label: "GTA", englishLabel: "Gold Thief Attack" }),
            sugarFree: Object.freeze({ label: "Sugar Free", englishLabel: "Sugar Free" }),
            getYourCrayon: Object.freeze({ label: "Crazy on クレヨン", englishLabel: "Get Your Crayon" }),
            cloneFactory: Object.freeze({ label: "Clone Factory", englishLabel: "Clone Factory" })
        })
    })
});

const ENEMY_PRESET_CONTENT_ALIASES = Object.freeze({
    dimension: Object.freeze({ type: "dimensionalClash" }),
    ef: Object.freeze({ type: "eliasFrontier" }),
    gta: Object.freeze({ type: "dungeon", mode: "goldThiefAttack" })
});

// プリセットには `size: "medium"` のように指定する。
// rankは大小比較や将来のヒット数プリセット選択用で、実寸・倍率ではない。
const ENEMY_SIZE_DEFINITIONS = Object.freeze({
    extraSmall: Object.freeze({ label: "超小型", rank: 1 }),
    small: Object.freeze({ label: "小型", rank: 2 }),
    medium: Object.freeze({ label: "中型", rank: 3 }),
    large: Object.freeze({ label: "大型", rank: 4 }),
    extraLarge: Object.freeze({ label: "超大型", rank: 5 })
});

const ENEMY_SIZE_ALIASES = Object.freeze({
    "1": "extraSmall",
    "2": "small",
    "3": "medium",
    "4": "large",
    "5": "extraLarge",
    xs: "extraSmall",
    tiny: "extraSmall",
    extrasmall: "extraSmall",
    超小型: "extraSmall",
    s: "small",
    small: "small",
    小型: "small",
    m: "medium",
    medium: "medium",
    中型: "medium",
    l: "large",
    large: "large",
    大型: "large",
    xl: "extraLarge",
    huge: "extraLarge",
    extralarge: "extraLarge",
    超大型: "extraLarge"
});

function normalizeEnemySize(value) {
    if (value == null || value === "") return "";
    if (typeof value === "number" && Number.isFinite(value)) {
        return ENEMY_SIZE_ALIASES[String(Math.round(value))] || "";
    }
    const raw = String(value).trim();
    if (ENEMY_SIZE_DEFINITIONS[raw]) return raw;
    const normalized = raw.replace(/[\s_\-]/g, "").toLocaleLowerCase("en-US");
    return ENEMY_SIZE_ALIASES[normalized] || ENEMY_SIZE_ALIASES[raw] || "";
}

function getEnemySizeMetadata(value) {
    const size = normalizeEnemySize(value);
    const definition = ENEMY_SIZE_DEFINITIONS[size] || {};
    return {
        size,
        sizeLabel: String(definition.label || ""),
        sizeRank: Number(definition.rank) || 0
    };
}

function getEnemyPresetMetadata(preset = {}, key = "") {
    const rawName = String(preset.name || key || "").trim();
    const legacyDimension = rawName.match(/^\[次元(\d+)\]\s*(.*)$/);
    const legacyEf = rawName.match(/^\[EF\/([^\]]+)\]\s*(.*)$/i);
    const legacyGta = rawName.match(/^\[GTA(\d+)\]\s*(.*)$/i);
    const legacyType = legacyDimension ? "dimensionalClash" : legacyEf ? "eliasFrontier" : legacyGta ? "dungeon" : "";
    const legacyMode = legacyGta ? "goldThiefAttack" : "";
    const legacyStage = legacyDimension
        ? Number(legacyDimension[1])
        : legacyEf
            ? ENEMY_PRESET_CONTENTS.eliasFrontier.stageLabels.indexOf(legacyEf[1]) + 1
            : legacyGta
                ? Number(legacyGta[1])
                : 0;
    const content = preset.content && typeof preset.content === "object" ? preset.content : {};
    const rawType = String(content.type || legacyType || "other");
    const alias = ENEMY_PRESET_CONTENT_ALIASES[rawType] || {};
    const type = String(alias.type || rawType || "other");
    const mode = String(content.mode || alias.mode || legacyMode || "");
    const difficulty = String(content.difficulty || "");
    const world = Math.max(0, Number(content.world) || 0);
    const stage = Math.max(0, Number(content.stage ?? legacyStage) || 0);
    const definition = ENEMY_PRESET_CONTENTS[type] || {};
    const modeDefinition = definition.modes?.[mode] || {};
    const difficultyDefinition = definition.difficulties?.[difficulty] || {};
    const contentShortLabel = String(content.shortLabel || definition.shortLabel || content.label || definition.label || "");
    const definitionRules = definition.rules || {};
    const artifactLimitCycle = definitionRules.artifactLimitCycle || [];
    const artifactLimit = stage && artifactLimitCycle.length
        ? Number(artifactLimitCycle[(stage - 1) % artifactLimitCycle.length]) || 0
        : Number(definitionRules.artifactLimit) || 0;
    const rules = {
        fixedGrade: Number(definitionRules.fixedGrade) || 0,
        disabledEffectSources: Array.from(definitionRules.disabledEffectSources || []),
        artifactLimit
    };
    const sizeMetadata = getEnemySizeMetadata(preset.size ?? preset.enemySize);
    const name = String(
        legacyDimension?.[2]
        || legacyEf?.[2]
        || legacyGta?.[2]
        || rawName.replace(/^\[保存\]\s*/, "")
        || key
    ).trim();
    const customStageLabel = String(content.stageLabel || "");
    const stageLabel = customStageLabel || (type === "eliasFrontier"
        ? definition.stageLabels?.[stage - 1] || (stage ? `${stage}段階` : "")
        : type === "dimensionalClash"
            ? (stage ? `${stage}段階` : "")
            : type === "crusade"
                ? (stage ? `Stage ${stage}` : "")
            : (stage ? String(stage) : ""));
    return {
        type,
        mode,
        difficulty,
        world,
        stage,
        name,
        personality: String(preset.personality || ""),
        ...sizeMetadata,
        contentLabel: String(content.label || definition.label || ""),
        contentShortLabel,
        selectionContentLabel: definition.hideInSelection ? "" : contentShortLabel,
        contentEnglishLabel: String(definition.englishLabel || ""),
        modeLabel: String(content.modeLabel || modeDefinition.label || ""),
        modeEnglishLabel: String(modeDefinition.englishLabel || ""),
        difficultyLabel: String(content.difficultyLabel || difficultyDefinition.label || ""),
        worldLabel: world ? `World ${world}` : "",
        stageLabel,
        rules
    };
}

function formatEnemyPresetDisplayName(preset = {}, key = "") {
    const metadata = getEnemyPresetMetadata(preset, key);
    const context = [metadata.selectionContentLabel, metadata.modeLabel, metadata.difficultyLabel, metadata.worldLabel, metadata.stageLabel].filter(Boolean).join(" ");
    const subject = metadata.personality ? `${metadata.name}［${metadata.personality}］` : metadata.name;
    const display = context ? `${context} / ${subject}` : subject;
    return `${preset.isCustom ? "[保存] " : ""}${display}`;
}

function getEnemyPresetSearchText(preset = {}, key = "") {
    const metadata = getEnemyPresetMetadata(preset, key);
    return [key, metadata.name, metadata.personality, metadata.size, metadata.sizeLabel, metadata.contentLabel, metadata.contentShortLabel, metadata.contentEnglishLabel, metadata.modeLabel, metadata.modeEnglishLabel, metadata.difficultyLabel, metadata.worldLabel, metadata.stageLabel, formatEnemyPresetDisplayName(preset, key)]
        .filter(Boolean)
        .join(" ");
}

const ENEMY_PRESETS = {
    "lily_d_15": {
        name: "リリ一",
        content: { type: "dimensionalClash", stage: 15 },
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
            buffs: { anger: { perStack: 40, maxStacks: 5 } }
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
        name: "リリ一",
        content: { type: "dimensionalClash", stage: 18 },
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
            buffs: { anger: { perStack: 40, maxStacks: 5 } }
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
        name: "ケルベロス",
        size: "large",
        content: { type: "dimensionalClash", stage: 15 },
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
        weakness: {
            statusDamage: { otherP: 1000 }
        },
        modifiers: {
            buffs: { anger: { perStack: 40, maxStacks: 5 } }
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
        name: "ケルベロス",
        content: { type: "dimensionalClash", stage: 18 },
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
        weakness: {
            statusDamage: { otherP: 1000 }
        },
        modifiers: {
            buffs: { anger: { perStack: 40, maxStacks: 5 } }
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
        name: "イサムレヨン",
        content: { type: "dimensionalClash", stage: 15 },
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
            buffs: { anger: { perStack: 40, maxStacks: 5 } }
        },
        skills: [
            { name: "普通攻撃", mult:100  },
            { name: "薙ぎ払い", mult:175  },
            { name: "縦振り", mult:400  }
        ]
    },
"Isamurayon_d_18": {
        name: "イサムレヨン",
        content: { type: "dimensionalClash", stage: 18 },
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
            buffs: { anger: { perStack: 40, maxStacks: 5 } }
        },
        skills: [
            { name: "普通攻撃", mult:100  },
            { name: "薙ぎ払い", mult:175  },
            { name: "縦振り", mult:400  }
        ]
    },
    "meow_ef_11": {
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 1 },
        hp: 401524,
        atk_p: 1501,
        atk_m: 1501,
        def_p: 2795,
        def_m: 2795,
        dmgType: "phys",
        crit: 2380,
        critDmg: 2380,
        critRes: 1945,
        critDmgRes: 1945,
        special: 214.286,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 2 },
        hp: 2179702,
        atk_p: 3619,
        atk_m: 3619,
        def_p: 6695,
        def_m: 6695,
        dmgType: "phys",
        crit: 5680,
        critDmg: 5680,
        critRes: 4645,
        critDmgRes: 4645,
        special: 385.714,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 3 },
        hp: 4745749,
        atk_p: 5384,
        atk_m: 5384,
        def_p: 9945,
        def_m: 9945,
        dmgType: "phys",
        crit: 8430,
        critDmg: 8430,
        critRes: 6895,
        critDmgRes: 6895,
        special: 528.571,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 4 },
        hp: 11848508,
        atk_p: 8560,
        atk_m: 8560,
        def_p: 15795,
        def_m: 15795,
        dmgType: "phys",
        crit: 13380,
        critDmg: 13380,
        critRes: 10945,
        critDmgRes: 10945,
        special: 785.714,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 5 },
        hp: 26286605,
        atk_p: 12795,
        atk_m: 12795,
        def_p: 23595,
        def_m: 23595,
        dmgType: "phys",
        crit: 19980,
        critDmg: 19980,
        critRes: 16345,
        critDmgRes: 16345,
        special: 1128.571,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 6 },
        hp: 58588935,
        atk_p: 19148,
        atk_m: 19148,
        def_p: 35295,
        def_m: 35295,
        dmgType: "phys",
        crit: 29880,
        critDmg: 29880,
        critRes: 24445,
        critDmgRes: 24445,
        special: 1642.857,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 7 },
        hp: 127799868,
        atk_p: 28325,
        atk_m: 28325,
        def_p: 52195,
        def_m: 52195,
        dmgType: "phys",
        crit: 44180,
        critDmg: 44180,
        critRes: 36145,
        critDmgRes: 36145,
        special: 2385.714,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
        name: "M.E.O.W",
        size: "extralarge",
        content: { type: "eliasFrontier", stage: 8 },
        hp: 286321339,
        atk_p: 42442,
        atk_m: 42442,
        def_p: 78195,
        def_m: 78195,
        dmgType: "phys",
        crit: 66180,
        critDmg: 66180,
        critRes: 54145,
        critDmgRes: 54145,
        special: 3528.571,
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
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
            { action: "攻撃", name: "叩きつけ 2段hit", mult: 100, note: "AoE / 2段" },
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
        name: "R41リニュア",
        size: "large",
        content: { type: "eliasFrontier", stage: 5 },
        hp: 26286605,
        atk_p: 12795,
        atk_m: 12795,
        def_p: 23595,
        def_m: 23595,
        dmgType: "phys",
        crit: 19980,
        critDmg: 19980,
        critRes: 16345,
        critDmgRes: 16345,
        special: 1128.571,
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
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
        name: "R41リニュア",
        size: "large",
        content: { type: "eliasFrontier", stage: 6 },
        hp: 58588935,
        atk_p: 19148,
        atk_m: 19148,
        def_p: 35295,
        def_m: 35295,
        dmgType: "phys",
        crit: 29880,
        critDmg: 29880,
        critRes: 24445,
        critDmgRes: 24445,
        special: 1642.857,
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
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
        name: "R41リニュア",
        size: "large",
        content: { type: "eliasFrontier", stage: 7 },
        hp: 127799868,
        atk_p: 28325,
        atk_m: 28325,
        def_p: 52195,
        def_m: 52195,
        dmgType: "phys",
        crit: 44180,
        critDmg: 44180,
        critRes: 36145,
        critDmgRes: 36145,
        special: 2385.714,
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
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
        name: "R41リニュア",
        size: "large",
        content: { type: "eliasFrontier", stage: 8 },
        hp: 286321339,
        atk_p: 42442,
        atk_m: 42442,
        def_p: 78195,
        def_m: 78195,
        dmgType: "phys",
        crit: 66180,
        critDmg: 66180,
        critRes: 54145,
        critDmgRes: 54145,
        special: 3528.571,
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
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
        "Isamurayon_ef_41": {
        name: "イサムレヨン",
        size: "large",
        content: { type: "eliasFrontier", stage: 7 },
        hp: 166695455,
        atk_p: 28105,
        atk_m: 28105,
        def_p: 76295,
        def_m: 76295,
        dmgType: "mag",
        crit: 44180,
        critDmg: 44180,
        critRes: 32115,
        critDmgRes: 32115,
        special: 2385.714,
        weakness: {
        },
        modifiers: {
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
            { action: "攻撃", name: "普通攻撃", mult: 150, note: "AoE" }
        ]
    },
    "Isamurayon_ef_42": {
        name: "イサムレヨン",
        size: "large",
        content: { type: "eliasFrontier", stage: 8 },
        hp: 373462578,
        atk_p: 42105,
        atk_m: 42105,
        def_p: 114295,
        def_m: 114295,
        dmgType: "mag",
        crit: 66180,
        critDmg: 66180,
        critRes: 48115,
        critDmgRes: 48115,
        special: 3528.571,
        weakness: {
        },
        modifiers: {
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
            { action: "攻撃", name: "普通攻撃", mult: 150, note: "AoE" }
        ]
    },
    "GTA_24": {
        name: "バンク蔵",
        personality: "憂鬱",
        content: { type: "dungeon", mode: "goldThiefAttack", stage: 24 },
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

