                                                 
                                                        

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

function compareEnemyPresetEntries([keyA, presetA], [keyB, presetB]) {
    const a = getEnemyPresetMetadata(presetA, keyA);
    const b = getEnemyPresetMetadata(presetB, keyB);
    const contentTypes = Object.keys(ENEMY_PRESET_CONTENTS);
    const contentOrder = type => {
        const index = contentTypes.indexOf(type);
        return index >= 0 ? index : contentTypes.length;
    };
    const compareText = (x, y) => String(x || '').localeCompare(String(y || ''), 'ja', { numeric: true });
    return Number(!!presetA.isCustom) - Number(!!presetB.isCustom)
        || contentOrder(a.type) - contentOrder(b.type)
        || compareText(a.type, b.type)
        || compareText(a.name, b.name)
        || compareText(a.personality, b.personality)
        || compareText(a.mode, b.mode)
        || compareText(a.difficulty, b.difficulty)
        || a.world - b.world
        || a.stage - b.stage
        || compareText(keyA, keyB);
}

function getEnemyPresetSearchText(preset = {}, key = "") {
    const metadata = getEnemyPresetMetadata(preset, key);
    return [key, metadata.name, metadata.personality, metadata.size, metadata.sizeLabel, metadata.contentLabel, metadata.contentShortLabel, metadata.contentEnglishLabel, metadata.modeLabel, metadata.modeEnglishLabel, metadata.difficultyLabel, metadata.worldLabel, metadata.stageLabel, formatEnemyPresetDisplayName(preset, key)]
        .filter(Boolean)
        .join(" ");
}

                                                                               
                                                                              
function createEliasFrontierSheetStats(level, isamurayon = false) {
    const keys = ['hp', 'atk_p', 'atk_m', 'def_p', 'def_m', 'crit', 'critDmg', 'critRes', 'critDmgRes'];
    const base = isamurayon
        ? [6005, 114, 114, 313, 313, 188, 188, 125, 125]
        : [4604, 114, 114, 209, 209, 188, 188, 157, 157];
    const growth = isamurayon
        ? [360, 7, 7, 19, 19, 11, 11, 8, 8]
        : [276, 7, 7, 13, 13, 11, 11, 9, 9];
    const hpCorrection = Math.fround(level * 0.02857);
    const phases = Array.from({ length: 6 }, (_, index) => {
        const factor = 1 + index / 10;
        const stats = Object.fromEntries(keys.map((key, i) => [key, Math.round(i === 0
            ? (base[i] + growth[i] * level * factor) * (1 + hpCorrection)
            : base[i] + growth[i] * (level * factor - 1))]));
        return { name: `Phase ${index + 1} (${5 - index}/5)`, stats };
    });
    return { ...phases[0].stats, special: (1 + level * 0.005714) * 100, phases };
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
        atk_p: 42116,
        atk_m: 42116,
        def_p: 78196,
        def_m: 78196,
        dmgType: 'mag',
        crit: 66177,
        critDmg: 66177,
        critRes: 54148,
        critDmgRes: 54148,
        special: 3528.40,
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
    "saraiguma_d_16": {
        name: "サライグマ",
        personality: "活発",
        content: { type: "dimensionalClash", stage: 16 },
        hp: 800383871,
        atk_p: 30907,
        atk_m: 30907,
        def_p: 57396,
        def_m: 57396,
        dmgType: 'phys',
        crit: 48577,
        critDmg: 48577,
        critRes: 35317,
        critDmgRes: 35317,
        special: 2614.16,
                                  
        skills: []
    },
    "hattsumuri_d_17": {
        name: "ハットツムリ",
        personality: "活発",
        content: { type: "dimensionalClash", stage: 17 },
        hp: 1235778693,
        atk_p: 30689,
        atk_m: 30689,
        def_p: 66496,
        def_m: 97194,
        dmgType: 'mag',
        crit: 40917,
        critDmg: 40917,
        critRes: 46048,
        critDmgRes: 46048,
        special: 3014.14,
                                  
        skills: []
    },
    "lily_vivacious_d_18": {
        name: "リリ一",
        personality: "活発",
        content: { type: "dimensionalClash", stage: 18 },
        hp: 1486382912,
        atk_p: 42116,
        atk_m: 42116,
        def_p: 78196,
        def_m: 78196,
        dmgType: 'mag',
        crit: 66177,
        critDmg: 66177,
        critRes: 54148,
        critDmgRes: 54148,
        special: 3528.4,
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
    "saraiguma_d_19": {
        name: "サライグマ",
        personality: "活発",
        content: { type: "dimensionalClash", stage: 19 },
        hp: 4289320162,
        atk_p: 71507,
        atk_m: 71507,
        def_p: 132796,
        def_m: 132796,
        dmgType: 'phys',
        crit: 112377,
        critDmg: 112377,
        critRes: 81717,
        critDmgRes: 81717,
        special: 5928.28,
                                  
        skills: []
    },
    "hattsumuri_d_20": {
        name: "ハットツムリ",
        personality: "活発",
        content: { type: "dimensionalClash", stage: 20 },
        hp: 7287306871,
        atk_p: 74489,
        atk_m: 74489,
        def_p: 161396,
        def_m: 235894,
        dmgType: 'mag',
        crit: 99317,
        critDmg: 99317,
        critRes: 111748,
        critDmgRes: 111748,
        special: 7185.36,
                                  
        skills: []
    },
    "lily_vivacious_d_21": {
        name: "リリ一",
        personality: "活発",
        content: { type: "dimensionalClash", stage: 21 },
        hp: 7847071278,
        atk_p: 96716,
        atk_m: 96716,
        def_p: 179596,
        def_m: 179596,
        dmgType: 'mag',
        crit: 151977,
        critDmg: 151977,
        critRes: 124348,
        critDmgRes: 124348,
        special: 7985.32,
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
        ...createEliasFrontierSheetStats(200),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(500),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(750),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(1200),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(1800),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(2700),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(4000),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(6000),
        dmgType: "phys",
        weakness: {
            phys: { add: 75 },
            statusTakenDamage: { status: "感電", add: 30 }
        },
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
        ...createEliasFrontierSheetStats(1800),
        dmgType: "phys",
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
        },
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
        ...createEliasFrontierSheetStats(2700),
        dmgType: "phys",
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
        },
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
        ...createEliasFrontierSheetStats(4000),
        dmgType: "phys",
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
        },
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
        ...createEliasFrontierSheetStats(6000),
        dmgType: "phys",
        weakness: {
            mag: { add: 75 },
            statusTakenDamage: { status: "苦痛", add: 30 }
        },
        modifiers: {
            targetDebuffs: { breakTakenDmg: { perStack: 5, maxStacks: 9 } }
        },
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
        ...createEliasFrontierSheetStats(4000, true),
        dmgType: "mag",
        weakness: {
        },
        modifiers: {
        },
        skills: [
            { action: "攻撃", name: "普通攻撃", mult: 150, note: "AoE" }
        ]
    },
    "Isamurayon_ef_42": {
        name: "イサムレヨン",
        size: "large",
        content: { type: "eliasFrontier", stage: 8 },
        ...createEliasFrontierSheetStats(6000, true),
        dmgType: "mag",
        weakness: {
        },
        modifiers: {
        },
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

                                                                                  
Object.assign(ENEMY_PRESETS, {
    "R41Renewa_ef_11": {
        ...ENEMY_PRESETS.R41Renewa_ef_42,
        content: { type: "eliasFrontier", stage: 1 },
        ...createEliasFrontierSheetStats(200)
    },
    "R41Renewa_ef_12": {
        ...ENEMY_PRESETS.R41Renewa_ef_42,
        content: { type: "eliasFrontier", stage: 2 },
        ...createEliasFrontierSheetStats(500)
    },
    "R41Renewa_ef_21": {
        ...ENEMY_PRESETS.R41Renewa_ef_42,
        content: { type: "eliasFrontier", stage: 3 },
        ...createEliasFrontierSheetStats(750)
    },
    "R41Renewa_ef_22": {
        ...ENEMY_PRESETS.R41Renewa_ef_42,
        content: { type: "eliasFrontier", stage: 4 },
        ...createEliasFrontierSheetStats(1200)
    },
    "R41Renewa_ef_51": {
        ...ENEMY_PRESETS.R41Renewa_ef_42,
        content: { type: "eliasFrontier", stage: 9 },
        ...createEliasFrontierSheetStats(12000)
    },
    "R41Renewa_ef_52": {
        ...ENEMY_PRESETS.R41Renewa_ef_42,
        content: { type: "eliasFrontier", stage: 10 },
        ...createEliasFrontierSheetStats(24000)
    },
    "Isamurayon_ef_11": {
        ...ENEMY_PRESETS.Isamurayon_ef_42,
        content: { type: "eliasFrontier", stage: 1 },
        ...createEliasFrontierSheetStats(200, true)
    },
    "Isamurayon_ef_12": {
        ...ENEMY_PRESETS.Isamurayon_ef_42,
        content: { type: "eliasFrontier", stage: 2 },
        ...createEliasFrontierSheetStats(500, true)
    },
    "Isamurayon_ef_21": {
        ...ENEMY_PRESETS.Isamurayon_ef_42,
        content: { type: "eliasFrontier", stage: 3 },
        ...createEliasFrontierSheetStats(750, true)
    },
    "Isamurayon_ef_22": {
        ...ENEMY_PRESETS.Isamurayon_ef_42,
        content: { type: "eliasFrontier", stage: 4 },
        ...createEliasFrontierSheetStats(1200, true)
    },
    "Isamurayon_ef_31": {
        ...ENEMY_PRESETS.Isamurayon_ef_42,
        content: { type: "eliasFrontier", stage: 5 },
        ...createEliasFrontierSheetStats(1800, true)
    },
    "Isamurayon_ef_32": {
        ...ENEMY_PRESETS.Isamurayon_ef_42,
        content: { type: "eliasFrontier", stage: 6 },
        ...createEliasFrontierSheetStats(2700, true)
    }
});

                                                                                 
                                                                             
Object.assign(ENEMY_PRESETS, {
    "Kérberos_d_21": {
        ...ENEMY_PRESETS["Kérberos_d_18"],
        content: { type: "dimensionalClash", stage: 21 },
        hp: 10201192898,
        atk_p: 82889,
        atk_m: 82889,
        def_p: 179596,
        def_m: 179596,
        crit: 110517,
        critDmg: 110517,
        critRes: 124348,
        critDmgRes: 124348,
        special: 7985.32
    },
    "Isamurayon_d_21": {
        ...ENEMY_PRESETS["Isamurayon_d_18"],
        content: { type: "dimensionalClash", stage: 21 },
        hp: 15694142556,
        atk_p: 96707,
        atk_m: 96707,
        def_p: 262494,
        def_m: 262494,
        crit: 151977,
        critDmg: 151977,
        critRes: 110517,
        critDmgRes: 110517,
        special: 7985.32
    }
});
