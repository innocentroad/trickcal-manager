                                                 
                                                        

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
        isWorldBoss: true,
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
        isWorldBoss: true,
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
        isWorldBoss: typeof preset.isWorldBoss === "boolean"
            ? preset.isWorldBoss : definition.isWorldBoss === true,
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
        || (a.type === 'dimensionalClash' && b.type === 'dimensionalClash' ? b.stage - a.stage : 0)
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

                                                                               
const ENEMY_SKILL_SETS = {
  "set1": [
    {
      "name": "基本攻撃・叩きつけ",
      "mult": 100,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "hitCount": 2,
      "skillKey": "M.E.O.W（EF）/1",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 50,
          "count": 2,
          "attackCategory": "基本攻撃",
          "timeSeconds": 1.7333334684371948,
          "intervalSeconds": 1.8666666746139526
        }
      ],
      "hitRevision": "72f3d8aceaa9b3a8a2b97d2097e1f52f902d17827b5c4fcf3038a978ef1468d3"
    },
    {
      "name": "張り手",
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 1,
      "skillKey": "M.E.O.W（EF）/2",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "強化攻撃",
          "timeSeconds": 1.6666667
        }
      ],
      "hitRevision": "b093b0a62fa04c1fad69bfd69c787e6d5289377792f30e2cca961589ff310135"
    },
    {
      "name": "ガトリング",
      "mult": 1350,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 9,
      "skillKey": "M.E.O.W（EF）/3",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 2,
          "attackCategory": "強化攻撃",
          "timeSeconds": 2.8000001907348633,
          "intervalSeconds": 0.09999990463256836
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 2,
          "attackCategory": "強化攻撃",
          "timeSeconds": 3.1000001430511475,
          "intervalSeconds": 0.13333344459533691
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 2,
          "attackCategory": "強化攻撃",
          "timeSeconds": 3.3333334922790527,
          "intervalSeconds": 0.09999990463256836
        },
        {
          "order": 4,
          "label": "区間4",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 3,
          "attackCategory": "強化攻撃",
          "timeSeconds": 3.6000001430511475,
          "intervalSeconds": 0.10000002384185791
        }
      ],
      "hitRevision": "cce67e33e47073634b3560590205c06d74d48ee9f095740e1941fb3861cd7bb8"
    },
    {
      "name": "火炎放射A",
      "mult": 4000,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 10,
      "skillKey": "M.E.O.W（EF）/4",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 2.6666667461395264,
          "intervalSeconds": 0.13333344459533691
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 2.9666669368743896,
          "intervalSeconds": 0.1333332061767578
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 3.266666889190674,
          "intervalSeconds": 0.1333332061767578
        },
        {
          "order": 4,
          "label": "区間4",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 3.566666841506958,
          "intervalSeconds": 0.13333344459533691
        },
        {
          "order": 5,
          "label": "区間5",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 3.866666793823242,
          "intervalSeconds": 0.1333332061767578
        }
      ],
      "hitRevision": "2193e56b5668dd58f6e7f7d03d9c327c545d2935cb413a728db6f621316353d9"
    },
    {
      "name": "火炎放射B",
      "mult": 4000,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 10,
      "skillKey": "M.E.O.W（EF）/5",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 2.6666667461395264,
          "intervalSeconds": 0.16666674613952637
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 2.9666669368743896,
          "intervalSeconds": 0.16666650772094727
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 3.266666889190674,
          "intervalSeconds": 0.16666650772094727
        },
        {
          "order": 4,
          "label": "区間4",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 3.566666841506958,
          "intervalSeconds": 0.16666674613952637
        },
        {
          "order": 5,
          "label": "区間5",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 2,
          "attackCategory": "スキル",
          "timeSeconds": 3.866666793823242,
          "intervalSeconds": 0.16666698455810547
        }
      ],
      "hitRevision": "2193e56b5668dd58f6e7f7d03d9c327c545d2935cb413a728db6f621316353d9"
    },
    {
      "name": "波状攻撃",
      "mult": 2200,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 11,
      "skillKey": "M.E.O.W（EF）/6",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 200,
          "count": 11,
          "attackCategory": "スキル",
          "timeSeconds": 2.6666667461395264,
          "intervalSeconds": 0.1
        }
      ],
      "hitRevision": "8c59bf034818f0ee61ef9af6c99997856d92686ba39d61d2df00da384362b297"
    },
    {
      "name": "ミサイル",
      "mult": 13300,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 19,
      "skillKey": "M.E.O.W（EF）/7",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 700,
          "count": 19,
          "attackCategory": "スキル",
          "timeSeconds": 4.333333492279053,
          "intervalSeconds": 0.13333333863152397
        }
      ],
      "hitRevision": "7c84508ad8f16379d87808dbb59d1dad949e298eff1920c5d9af67bc9901b52e"
    },
    {
      "name": "ランチャー",
      "mult": 720,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 3,
      "skillKey": "M.E.O.W（EF）/8",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 240,
          "count": 3,
          "attackCategory": "スキル",
          "timeSeconds": 3.133333444595337,
          "intervalSeconds": 0.43333327770233154
        }
      ],
      "hitRevision": "8f32712aa6174fd245cae8f287c58bbbbc668cd2cf8e6f02009b351325ef5737"
    },
    {
      "name": "溜めレーザー",
      "mult": 4250,
      "action": "攻撃",
      "attackCategory": "スキル",
      "attackCategoryCandidates": [
        "CTスキル",
        "HP条件スキル"
      ],
      "classificationMode": "entry-dependent",
      "hitCount": 15,
      "skillKey": "M.E.O.W（EF）/9",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 300,
          "count": 12,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 0.23333334922790527,
          "intervalSeconds": 0.20000000433488327
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 300,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 2.5333335399627686,
          "intervalSeconds": 0.0666666030883789
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 50,
          "count": 1,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 5.233333587646484
        }
      ],
      "hitRevision": "eab71039a848ec5404958e4696f9bc423318361a62c3d927581f6bb001b80127"
    },
    {
      "name": "溜めレーザー（阻止）",
      "mult": 500,
      "action": "攻撃",
      "classificationMode": "unconfirmed",
      "hitCount": 4,
      "skillKey": "M.E.O.W（EF）/10",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 3,
          "classificationMode": "unconfirmed",
          "timeSeconds": 0.23333334922790527,
          "intervalSeconds": 0.40000003576278687
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 50,
          "count": 1,
          "classificationMode": "unconfirmed",
          "timeSeconds": 5.233333587646484
        }
      ],
      "hitRevision": "7f595d5b9bac723ab6436dc536c3aa45387db184908f243742573ea8b5cef807"
    }
  ],
  "set2": [
    {
      "name": "基本攻撃・3連射",
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "hitCount": 3,
      "skillKey": "R41リニュア（EF）/1",
      "hits": [
        {
          "order": 1,
          "label": "基本攻撃・3連射1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 50,
          "count": 1,
          "attackCategory": "基本攻撃",
          "timeSeconds": 1.033
        },
        {
          "order": 2,
          "label": "基本攻撃・3連射2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 50,
          "count": 1,
          "attackCategory": "基本攻撃",
          "timeSeconds": 1.367
        },
        {
          "order": 3,
          "label": "基本攻撃・3連射3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 50,
          "count": 1,
          "attackCategory": "基本攻撃",
          "timeSeconds": 1.967
        }
      ],
      "hitRevision": "c5c335facc1565492e95881ecb2cb6f09078abe6eb2451f6d5cbea1e4a28deb3"
    },
    {
      "name": "ワープ薙ぎ払い",
      "mult": 200,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/2",
      "hits": [
        {
          "order": 1,
          "label": "ワープ薙ぎ払い",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 200,
          "count": 1,
          "attackCategory": "強化攻撃",
          "timeSeconds": 1.833
        }
      ],
      "hitRevision": "ccb91f0af4df05c5484d08e9482bfc9f334ffa444cf0785db712408a4c54cfbe"
    },
    {
      "name": "振り回し+振り下ろし",
      "mult": 650,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 2,
      "skillKey": "R41リニュア（EF）/3",
      "hits": [
        {
          "order": 1,
          "label": "振り回し",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 300,
          "count": 1,
          "attackCategory": "強化攻撃",
          "timeSeconds": 1.133
        },
        {
          "order": 2,
          "label": "振り下ろし",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 350,
          "count": 1,
          "attackCategory": "強化攻撃",
          "timeSeconds": 3.133
        }
      ],
      "hitRevision": "f7cfdc7201b01e9adf93986d308b16bfb67669f352b101bfb879f45529b3657c"
    },
    {
      "name": "蹴り斬り",
      "mult": 600,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 2,
      "skillKey": "R41リニュア（EF）/4",
      "hits": [
        {
          "order": 1,
          "label": "蹴り斬り",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 200,
          "count": 1,
          "attackCategory": "強化攻撃",
          "timeSeconds": 1.3
        },
        {
          "order": 2,
          "label": "蹴り斬り追撃",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 1,
          "attackCategory": "強化攻撃",
          "timeSeconds": 1.533
        }
      ],
      "hitRevision": "0abdc4689a19fef777b8def7566578927fa3e69e4cef3246e741559a83068372"
    },
    {
      "name": "蹴り切り+ワープ踏み斬り",
      "mult": 900,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 2,
      "skillKey": "R41リニュア（EF）/5",
      "hits": [
        {
          "order": 1,
          "label": "蹴り切り",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 300,
          "count": 1,
          "attackCategory": "スキル",
          "timeSeconds": 1.3
        },
        {
          "order": 2,
          "label": "ワープ踏み斬り",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 600,
          "count": 1,
          "attackCategory": "スキル",
          "timeSeconds": 2.533
        }
      ],
      "hitRevision": "8a6fff17e674b3309b77ca0738938aacc51c517c4aa86f5751b72234ecf29839"
    },
    {
      "name": "突き(ビーム前)",
      "mult": 300,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/6",
      "hits": [
        {
          "order": 1,
          "label": "突き(ビーム前)",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 300,
          "count": 1,
          "attackCategory": "スキル",
          "timeSeconds": 1.267
        }
      ],
      "hitRevision": "17476830162cf5ea59061b3d1738dfc323132330fa5ce9086110c79bda0971c6"
    },
    {
      "name": "ビーム",
      "mult": 1250,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 5,
      "skillKey": "R41リニュア（EF）/7",
      "hits": [
        {
          "order": 1,
          "label": "ビーム",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 250,
          "count": 5,
          "attackCategory": "スキル",
          "timeSeconds": 2.933,
          "intervalSeconds": 0.233
        }
      ],
      "hitRevision": "13a2cd1fc9df1ceae02e794ade68521706caaaf794bdae285c2fad84cb788e89"
    },
    {
      "name": "ビーム(ドローン追撃)",
      "provisionalWarnings": [
        "間接攻撃はボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 500,
      "action": "攻撃",
      "attackCategory": "スキル",
      "description": "ステータスはボスと別判定かも",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/8"
    },
    {
      "name": "重力球",
      "provisionalWarnings": [
        "間接攻撃はボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 600,
      "action": "攻撃",
      "attackCategory": "スキル",
      "description": "ステータスはボスと別判定かも",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/9"
    },
    {
      "name": "着陸（重力球破壊失敗時）",
      "mult": 1000,
      "action": "攻撃",
      "attackCategory": "スキル",
      "description": "ステータスはボスと別判定かも",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/10"
    },
    {
      "name": "時間停止ドローン",
      "provisionalWarnings": [
        "間接攻撃はボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 2030,
      "action": "攻撃",
      "attackCategory": "スキル",
      "description": "ステータスはボスと別判定かも",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/11"
    },
    {
      "name": "火傷（隕石など）",
      "provisionalWarnings": [
        "間接攻撃はボス本人のステータスを使った暫定計算です。"
      ],
      "statusType": "火傷",
      "statusDamageMode": "single-tick",
      "mult": 30,
      "action": "攻撃",
      "attackCategory": "状態異常",
      "hitCount": 1,
      "skillKey": "R41リニュア（EF）/12"
    }
  ],
  "set3": [
    {
      "name": "基本攻撃",
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "イサムレヨン（EF）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "9bd2af4b5f70169003add8598705278cf15f1e5a41f5bdd73499979662770b2f"
    },
    {
      "name": "薙ぎ払い",
      "mult": 250,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "イサムレヨン（EF）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 250,
          "count": 1,
          "attackCategory": "強化攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "cdc36ab95d7aa517750f7c9d1381b6b29dd6d017675912629dfe4132bd9e6ddd"
    },
    {
      "name": "直線斬り",
      "mult": 600,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "イサムレヨン（EF）/3",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 600,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "d98a48cc761802d952ac225314c7231538efae09c258cd18887174c95428b19b"
    },
    {
      "name": "基本攻撃[金モード]",
      "mult": 175,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "イサムレヨン（EF）/4",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "cd10f6c67688dde5279585047d4d8df6e589588a8bbc86f967ad6727b8b7cb60"
    },
    {
      "name": "薙ぎ払い[金モード]",
      "mult": 300,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "イサムレヨン（EF）/5",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 300,
          "count": 1,
          "attackCategory": "強化攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "f6f91ca359e99ba96b6af4eae7dd54101132c39d21d39e896934da1eda94351b"
    },
    {
      "name": "直線斬り[金モード]",
      "mult": 700,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "イサムレヨン（EF）/6",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 700,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "e3f6e2d1864ba6c49742caf42d6294c876172e559662abbc9e34daab7c4a7fad"
    }
  ],
  "set4": [
    {
      "name": "（通常）",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 100,
      "action": "攻撃",
      "hitCount": 1,
      "skillKey": "バンク蔵/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 100,
          "count": 1
        }
      ],
      "hitRevision": "b8b6efab4f572f152d4c618b48ce082377da04f5367595e85752c3b683856d46"
    }
  ],
  "set5": [
    {
      "name": "基本攻撃",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 100,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "skillKey": "リリ一（次元）/1"
    },
    {
      "name": "ピコハン",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 100,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/2"
    },
    {
      "name": "ネギ",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 250,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/3"
    },
    {
      "name": "100tハンマー",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 400,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/4"
    },
    {
      "name": "火の息",
      "mult": 75,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 5,
      "skillKey": "リリ一（次元）/5",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 15,
          "count": 5,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 3.000000238418579,
          "intervalSeconds": 0.2666667103767395
        }
      ],
      "hitRevision": "ae50f53620da85f53f44c02f3f72d2a606bd6c610c37fba380654fe8b8dd8cb3"
    },
    {
      "name": "暴走モードA",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 100,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/6"
    },
    {
      "name": "暴走モードB",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/7"
    },
    {
      "name": "暴走モードC",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 200,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/8"
    },
    {
      "name": "暴走モードD",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 250,
      "action": "攻撃",
      "attackCategory": "スキル",
      "skillKey": "リリ一（次元）/9"
    }
  ],
  "set6": [
    {
      "name": "基本攻撃・足踏み",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 100,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "skillKey": "ケルベロス（次元）/1"
    },
    {
      "name": "叩きつけ",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "skillKey": "ケルベロス（次元）/2"
    },
    {
      "name": "舐め回し",
      "mult": 1548,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 18,
      "skillKey": "ケルベロス（次元）/3",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.40000003576278687
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.40000003576278687
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.46666669845581055
        },
        {
          "order": 4,
          "label": "区間4",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.46666669845581055
        },
        {
          "order": 5,
          "label": "区間5",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.5333333611488342
        },
        {
          "order": 6,
          "label": "区間6",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.5333333611488342
        },
        {
          "order": 7,
          "label": "区間7",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.0666667222976685
        },
        {
          "order": 8,
          "label": "区間8",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.0666667222976685
        },
        {
          "order": 9,
          "label": "区間9",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.133333444595337
        },
        {
          "order": 10,
          "label": "区間10",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.133333444595337
        },
        {
          "order": 11,
          "label": "区間11",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.2000000476837158
        },
        {
          "order": 12,
          "label": "区間12",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.2000000476837158
        },
        {
          "order": 13,
          "label": "区間13",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.7666667699813843
        },
        {
          "order": 14,
          "label": "区間14",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.7666667699813843
        },
        {
          "order": 15,
          "label": "区間15",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.8333333730697632
        },
        {
          "order": 16,
          "label": "区間16",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.8333333730697632
        },
        {
          "order": 17,
          "label": "区間17",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 22,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.9000000953674316
        },
        {
          "order": 18,
          "label": "区間18",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.9000000953674316
        }
      ],
      "hitRevision": "c98ac8d8f0bb5bc788a0e670d4752fb55f58cbd281bd5509535974e8301bc138"
    },
    {
      "name": "咆哮",
      "mult": 306,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 17,
      "skillKey": "ケルベロス（次元）/4",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.20000001788139343,
          "intervalSeconds": 0.1666666567325592
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.40000003576278687,
          "intervalSeconds": 0.13333332538604736
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.6000000238418579,
          "intervalSeconds": 0.03333336114883423
        },
        {
          "order": 4,
          "label": "区間4",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.8000000715255737,
          "intervalSeconds": 0.06666666269302368
        },
        {
          "order": 5,
          "label": "区間5",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.033333420753479,
          "intervalSeconds": 0.0666666030883789
        },
        {
          "order": 6,
          "label": "区間6",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 3,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.2000000476837158,
          "intervalSeconds": 0.13333332538604736
        },
        {
          "order": 7,
          "label": "区間7",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.533333420753479,
          "intervalSeconds": 0.03333330154418945
        },
        {
          "order": 8,
          "label": "区間8",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 18,
          "count": 2,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.633333444595337,
          "intervalSeconds": 0.16666662693023682
        }
      ],
      "hitRevision": "8e5471c556a507ff75488ba1d49f25ffdb62a85373095a403bfd7364d20ed417"
    },
    {
      "name": "突進・前半",
      "mult": 1750,
      "action": "攻撃",
      "attackCategory": "スキル",
      "attackCategoryCandidates": [
        "CTスキル",
        "HP条件スキル"
      ],
      "classificationMode": "entry-dependent",
      "hitCount": 10,
      "skillKey": "ケルベロス（次元）/5",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 2.9666669368743896,
          "intervalSeconds": 0.0666666030883789
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 3.633333444595337,
          "intervalSeconds": 0.06666684150695801
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 4.300000190734863,
          "intervalSeconds": 0.0666666030883789
        },
        {
          "order": 4,
          "label": "区間4",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 4.9666666984558105,
          "intervalSeconds": 0.06666707992553711
        },
        {
          "order": 5,
          "label": "区間5",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 5.633333683013916,
          "intervalSeconds": 0.0666666030883789
        }
      ],
      "hitRevision": "5e0df9e76114ff99c2429f0d0b5421538c45fdc9957ab15587f2bb2f7ad65e67"
    },
    {
      "name": "突進・後半",
      "mult": 1050,
      "action": "攻撃",
      "attackCategory": "スキル",
      "attackCategoryCandidates": [
        "CTスキル",
        "HP条件スキル"
      ],
      "classificationMode": "entry-dependent",
      "hitCount": 6,
      "skillKey": "ケルベロス（次元）/6",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 0.23333334922790527,
          "intervalSeconds": 0.06666666269302368
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 0.9000000357627869,
          "intervalSeconds": 0.06666666269302368
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 2,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 1.533333420753479,
          "intervalSeconds": 0.06666672229766846
        }
      ],
      "hitRevision": "d52d8f6df182f7bc8e7cf0648e58e9621878796688eeecabe012242f6cd2f60f"
    },
    {
      "name": "吸い込み",
      "mult": 800,
      "action": "攻撃",
      "attackCategory": "スキル",
      "attackCategoryCandidates": [
        "CTスキル",
        "HP条件スキル"
      ],
      "classificationMode": "entry-dependent",
      "hitCount": 18,
      "skillKey": "ケルベロス（次元）/7",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 25,
          "count": 16,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 0,
          "intervalSeconds": 0.20000000794728598
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 250,
          "count": 1,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 0.5666667222976685
        },
        {
          "order": 3,
          "label": "区間3",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "スキル",
          "attackCategoryCandidates": [
            "CTスキル",
            "HP条件スキル"
          ],
          "classificationMode": "entry-dependent",
          "timeSeconds": 3.1666667461395264
        }
      ],
      "hitRevision": "d26a228cef0efbca0ae95d3183e9410f4840a3fa63ced3041380b06b164674db"
    }
  ],
  "set7": [
    {
      "name": "基本攻撃",
      "mult": 100,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "hitCount": 1,
      "skillKey": "イサムレヨン（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 100,
          "count": 1,
          "attackCategory": "基本攻撃"
        }
      ],
      "hitRevision": "cb32a88c843bf599dd3203b31579fb8a2c561ea02f3d70b71e2925ad9451fb4c"
    },
    {
      "name": "薙ぎ払い",
      "mult": 175,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 1,
      "skillKey": "イサムレヨン（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 175,
          "count": 1,
          "attackCategory": "強化攻撃"
        }
      ],
      "hitRevision": "e2b59296ea2f91fe849bf79ace19c4bd50f3fb55ec3c3af849bbef1e9cdb1cf1"
    },
    {
      "name": "直線斬り",
      "mult": 400,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 1,
      "skillKey": "イサムレヨン（次元）/3",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 400,
          "count": 1,
          "attackCategory": "スキル"
        }
      ],
      "hitRevision": "ea3aa1cf39add29a37fc64dcc073cd11ef1fae5d980f6fe43193a63170614372"
    },
    {
      "name": "基本攻撃[金モード]",
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "hitCount": 1,
      "skillKey": "イサムレヨン（次元）/4",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "基本攻撃"
        }
      ],
      "hitRevision": "ec3c1a7912e5c3d2bcfeaf6dc675ebc6762ee3e7b6c733ad7c75ddc4239e87a4"
    },
    {
      "name": "薙ぎ払い[金モード]",
      "mult": 250,
      "action": "攻撃",
      "attackCategory": "強化攻撃",
      "hitCount": 1,
      "skillKey": "イサムレヨン（次元）/5",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 250,
          "count": 1,
          "attackCategory": "強化攻撃"
        }
      ],
      "hitRevision": "03abf2635ad60a87c936fa2e115f368fcbc7a05b34558f6082c1f7786973b4fe"
    },
    {
      "name": "直線斬り[金モード]",
      "mult": 600,
      "action": "攻撃",
      "attackCategory": "スキル",
      "hitCount": 1,
      "skillKey": "イサムレヨン（次元）/6",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 600,
          "count": 1,
          "attackCategory": "スキル"
        }
      ],
      "hitRevision": "10b9bfc53ce4637120234373244edaffb6bf7ef74f7f63d84a0136fe9fc976f1"
    }
  ],
  "set8": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 120,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "キモグリ（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 120,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "e0dd9ca9516cda9f78233f1d88fa9b6ddc79ea69a9530253c6ca1a1efaf5e439"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 384,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "キモグリ（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 384,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "89dd0a825a7a8c1ba9c98d5389c90a600f58c73e0f9b1907132a45c1f62a4f70"
    }
  ],
  "set9": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "サライグマ（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "563ef37a5064592a2c99ed39e544f4f33de0e851ab25d12f3fe2fbb99202d453"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 360,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "サライグマ（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 360,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "920ef1722e38c462b3ef4e6447c2bdaa523abbf68ce86dea408f100a68ca9048"
    }
  ],
  "set10": [
    {
      "name": "通常攻撃",
      "mult": 207.89999999999998,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 3,
      "skillKey": "ドローンG型（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 69.3,
          "count": 3,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.46666669845581055,
          "intervalSeconds": 0.1666666865348816
        }
      ],
      "hitRevision": "a592b5b34c5417e22c226c23e2aec4073649e3419aac7d0a9ecb8e516705cc5f"
    },
    {
      "name": "スキル",
      "mult": 249.6,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 8,
      "skillKey": "ドローンG型（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 31.2,
          "count": 8,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.0666667222976685,
          "intervalSeconds": 0.13333332538604736
        }
      ],
      "hitRevision": "85d63d0d93166a3ed6b73f9ad22f61aa58f440aceaf9ec969e367eefb67b99c2"
    }
  ],
  "set11": [
    {
      "name": "通常攻撃",
      "mult": 178.2,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 3,
      "skillKey": "ドローンS型（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 59.4,
          "count": 3,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.3333333432674408,
          "intervalSeconds": 0.1666666716337204
        }
      ],
      "hitRevision": "26cafa3ada20500aed6e3928426e16737be1cd97ec38f7268079096e959e83b0"
    },
    {
      "name": "スキル",
      "mult": 374.4,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 8,
      "skillKey": "ドローンS型（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 46.8,
          "count": 8,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.9333333969116211,
          "intervalSeconds": 0.13333334241594588
        }
      ],
      "hitRevision": "6ef9e39a3f267e26c58e421cf64d61f66c86e1e2f3581a7de079dd4ceb7dbfb6"
    }
  ],
  "set12": [
    {
      "name": "通常攻撃",
      "mult": 180,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 4,
      "skillKey": "ドローンU型（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 45,
          "count": 3,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry",
          "timeSeconds": 0.9000000357627869,
          "intervalSeconds": 0.46666666865348816
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 45,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry",
          "timeSeconds": 2.366666793823242
        }
      ],
      "hitRevision": "d20ef59131ac05b99d4a2714c0f9598f0c6cfe000530ee5d6e23ac3be04edeca"
    }
  ],
  "set13": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 210,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ドン石（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 210,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "8e2ee276085cac0f2e06120d6b4193a37eb8e8421b027a9117ab1d09cee7a391"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 256,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ドン石（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 256,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "a7d0ebf2b09cb940aee01513b04c91242e0008937145325328017906db24dcc4"
    }
  ],
  "set14": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 150,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ナニクマ（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 150,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "563ef37a5064592a2c99ed39e544f4f33de0e851ab25d12f3fe2fbb99202d453"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 360,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ナニクマ（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 360,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "920ef1722e38c462b3ef4e6447c2bdaa523abbf68ce86dea408f100a68ca9048"
    }
  ],
  "set15": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 180,
      "action": "攻撃",
      "classificationMode": "unconfirmed",
      "hitCount": 1,
      "skillKey": "ヌウリング（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 180,
          "count": 1,
          "classificationMode": "unconfirmed"
        }
      ],
      "hitRevision": "337bb3e9cf5fd680a95cfb853bf9292eec8eeb409d0bcfe6935294f6a6d74867"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 288,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ヌウリング（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 288,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "b664aeb6bbe59b999f4ba19783a91ef91bdd9e1deba82f1655d37690e9cb768e"
    }
  ],
  "set16": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 120,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ノビリュー（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 120,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "e0dd9ca9516cda9f78233f1d88fa9b6ddc79ea69a9530253c6ca1a1efaf5e439"
    },
    {
      "name": "スキル",
      "mult": 384.0,
      "action": "攻撃",
      "attackCategory": "SPスキル",
      "classificationMode": "standard-entry",
      "hitCount": 5,
      "skillKey": "ノビリュー（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 76.8,
          "count": 5,
          "attackCategory": "SPスキル",
          "classificationMode": "standard-entry",
          "timeSeconds": 1.100000023841858,
          "intervalSeconds": 0.13333335518836975
        }
      ],
      "hitRevision": "a9cdc369dab46ee4ebbcac40461242ed18d93587116e73817aff9be03f02b48b"
    }
  ],
  "set17": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 180,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ハットツムリ（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 180,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "e3b0b648e9e2123ba137903a8e85658c4237ed3420d1648c4fc7107ddf6a0c35"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 360,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ハットツムリ（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 360,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "920ef1722e38c462b3ef4e6447c2bdaa523abbf68ce86dea408f100a68ca9048"
    }
  ],
  "set18": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 120,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ルパル（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 120,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "e0dd9ca9516cda9f78233f1d88fa9b6ddc79ea69a9530253c6ca1a1efaf5e439"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 480,
      "action": "攻撃",
      "attackCategory": "スキル",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "ルパル（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 480,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "76801eb9c9b72041ca88159a4b8e9e13c1bd3fa6d100da1e995c648114fc6405"
    }
  ],
  "set19": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 180,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "一口草（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 180,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "e3b0b648e9e2123ba137903a8e85658c4237ed3420d1648c4fc7107ddf6a0c35"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 720,
      "action": "攻撃",
      "classificationMode": "unconfirmed",
      "hitCount": 3,
      "skillKey": "一口草（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "区間1",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 360,
          "count": 1,
          "attackCategory": "スキル",
          "classificationMode": "standard-entry"
        },
        {
          "order": 2,
          "label": "区間2",
          "source": "direct",
          "actor": "boss",
          "coefficientP": 180,
          "count": 2,
          "classificationMode": "unconfirmed",
          "timeSeconds": 1.2666667699813843,
          "intervalSeconds": 0.5
        }
      ],
      "hitRevision": "d5565fb944bd36c97f145f73471414ce46976d8034133d2e98b78335d198cdf1"
    }
  ],
  "set20": [
    {
      "name": "通常攻撃",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 210,
      "action": "攻撃",
      "attackCategory": "基本攻撃",
      "classificationMode": "standard-entry",
      "hitCount": 1,
      "skillKey": "幽霊布団（次元）/1",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 210,
          "count": 1,
          "attackCategory": "基本攻撃",
          "classificationMode": "standard-entry"
        }
      ],
      "hitRevision": "8e2ee276085cac0f2e06120d6b4193a37eb8e8421b027a9117ab1d09cee7a391"
    },
    {
      "name": "スキル",
      "provisionalWarnings": [
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 240,
      "action": "攻撃",
      "classificationMode": "unconfirmed",
      "hitCount": 1,
      "skillKey": "幽霊布団（次元）/2",
      "hits": [
        {
          "order": 1,
          "label": "",
          "source": "unknown",
          "actor": "boss",
          "coefficientP": 240,
          "count": 1,
          "classificationMode": "unconfirmed"
        }
      ],
      "hitRevision": "b1c0252d91edbc8a3c4543ecd3bb8a960830b505f50dfe7478a879bc7f70396c"
    }
  ],
  "set21": [
    {
      "name": "通常攻撃1",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 100,
      "action": "攻撃",
      "skillKey": "[E] Dummy/1"
    },
    {
      "name": "通常攻撃2",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 50,
      "action": "攻撃",
      "skillKey": "[E] Dummy/2"
    },
    {
      "name": "通常攻撃3",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 80,
      "action": "攻撃",
      "skillKey": "[E] Dummy/3"
    },
    {
      "name": "通常攻撃4",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 120,
      "action": "攻撃",
      "skillKey": "[E] Dummy/4"
    },
    {
      "name": "通常攻撃5",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 150,
      "action": "攻撃",
      "skillKey": "[E] Dummy/5"
    },
    {
      "name": "強攻撃1",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 200,
      "action": "攻撃",
      "skillKey": "[E] Dummy/6"
    },
    {
      "name": "強攻撃2",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 300,
      "action": "攻撃",
      "skillKey": "[E] Dummy/7"
    },
    {
      "name": "スキル攻撃1",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 500,
      "action": "攻撃",
      "skillKey": "[E] Dummy/8"
    },
    {
      "name": "スキル攻撃2",
      "provisionalWarnings": [
        "攻撃主体がボス本人以外または未確認のため、ボス本人のステータスを使った暫定計算です。",
        "直接・間接の区分が未確認のため、ボス本人のステータスを使った暫定計算です。"
      ],
      "mult": 1000,
      "action": "攻撃",
      "skillKey": "[E] Dummy/9"
    }
  ]
};
const ENEMY_PRESETS = {
    "ef_meow_11": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":1},"hp":401524,"atk_p":1507,"atk_m":1507,"def_p":2796,"def_m":2796,"crit":2377,"critDmg":2377,"critRes":1948,"critDmgRes":1948,"special":214.28000000000003,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":401524,"atk_p":1507,"atk_m":1507,"def_p":2796,"def_m":2796,"crit":2377,"critDmg":2377,"critRes":1948,"critDmgRes":1948}},{"name":"Phase 2 (4/5)","stats":{"hp":438585,"atk_p":1647,"atk_m":1647,"def_p":3056,"def_m":3056,"crit":2597,"critDmg":2597,"critRes":2128,"critDmgRes":2128}},{"name":"Phase 3 (3/5)","stats":{"hp":475647,"atk_p":1787,"atk_m":1787,"def_p":3316,"def_m":3316,"crit":2817,"critDmg":2817,"critRes":2308,"critDmgRes":2308}},{"name":"Phase 4 (2/5)","stats":{"hp":512708,"atk_p":1927,"atk_m":1927,"def_p":3576,"def_m":3576,"crit":3037,"critDmg":3037,"critRes":2488,"critDmgRes":2488}},{"name":"Phase 5 (1/5)","stats":{"hp":549769,"atk_p":2067,"atk_m":2067,"def_p":3836,"def_m":3836,"crit":3257,"critDmg":3257,"critRes":2668,"critDmgRes":2668}},{"name":"Phase 6 (0/5)","stats":{"hp":586830,"atk_p":2207,"atk_m":2207,"def_p":4096,"def_m":4096,"crit":3477,"critDmg":3477,"critRes":2848,"critDmgRes":2848}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_12": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":2},"hp":2179702,"atk_p":3607,"atk_m":3607,"def_p":6696,"def_m":6696,"crit":5677,"critDmg":5677,"critRes":4648,"critDmgRes":4648,"special":385.70000000000005,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":2179702,"atk_p":3607,"atk_m":3607,"def_p":6696,"def_m":6696,"crit":5677,"critDmg":5677,"critRes":4648,"critDmgRes":4648}},{"name":"Phase 2 (4/5)","stats":{"hp":2390635,"atk_p":3957,"atk_m":3957,"def_p":7346,"def_m":7346,"crit":6227,"critDmg":6227,"critRes":5098,"critDmgRes":5098}},{"name":"Phase 3 (3/5)","stats":{"hp":2601568,"atk_p":4307,"atk_m":4307,"def_p":7996,"def_m":7996,"crit":6777,"critDmg":6777,"critRes":5548,"critDmgRes":5548}},{"name":"Phase 4 (2/5)","stats":{"hp":2812501,"atk_p":4657,"atk_m":4657,"def_p":8646,"def_m":8646,"crit":7327,"critDmg":7327,"critRes":5998,"critDmgRes":5998}},{"name":"Phase 5 (1/5)","stats":{"hp":3023434,"atk_p":5007,"atk_m":5007,"def_p":9296,"def_m":9296,"crit":7877,"critDmg":7877,"critRes":6448,"critDmgRes":6448}},{"name":"Phase 6 (0/5)","stats":{"hp":3234367,"atk_p":5357,"atk_m":5357,"def_p":9946,"def_m":9946,"crit":8427,"critDmg":8427,"critRes":6898,"critDmgRes":6898}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_21": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":3},"hp":4745749,"atk_p":5357,"atk_m":5357,"def_p":9946,"def_m":9946,"crit":8427,"critDmg":8427,"critRes":6898,"critDmgRes":6898,"special":528.55,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":4745749,"atk_p":5357,"atk_m":5357,"def_p":9946,"def_m":9946,"crit":8427,"critDmg":8427,"critRes":6898,"critDmgRes":6898}},{"name":"Phase 2 (4/5)","stats":{"hp":5209998,"atk_p":5882,"atk_m":5882,"def_p":10921,"def_m":10921,"crit":9252,"critDmg":9252,"critRes":7573,"critDmgRes":7573}},{"name":"Phase 3 (3/5)","stats":{"hp":5674247,"atk_p":6407,"atk_m":6407,"def_p":11896,"def_m":11896,"crit":10077,"critDmg":10077,"critRes":8248,"critDmgRes":8248}},{"name":"Phase 4 (2/5)","stats":{"hp":6138496,"atk_p":6932,"atk_m":6932,"def_p":12871,"def_m":12871,"crit":10902,"critDmg":10902,"critRes":8923,"critDmgRes":8923}},{"name":"Phase 5 (1/5)","stats":{"hp":6602746,"atk_p":7457,"atk_m":7457,"def_p":13846,"def_m":13846,"crit":11727,"critDmg":11727,"critRes":9598,"critDmgRes":9598}},{"name":"Phase 6 (0/5)","stats":{"hp":7066995,"atk_p":7982,"atk_m":7982,"def_p":14821,"def_m":14821,"crit":12552,"critDmg":12552,"critRes":10273,"critDmgRes":10273}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_22": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":4},"hp":11848508,"atk_p":8507,"atk_m":8507,"def_p":15796,"def_m":15796,"crit":13377,"critDmg":13377,"critRes":10948,"critDmgRes":10948,"special":785.6800000000001,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":11848508,"atk_p":8507,"atk_m":8507,"def_p":15796,"def_m":15796,"crit":13377,"critDmg":13377,"critRes":10948,"critDmgRes":10948}},{"name":"Phase 2 (4/5)","stats":{"hp":13017115,"atk_p":9347,"atk_m":9347,"def_p":17356,"def_m":17356,"crit":14697,"critDmg":14697,"critRes":12028,"critDmgRes":12028}},{"name":"Phase 3 (3/5)","stats":{"hp":14185721,"atk_p":10187,"atk_m":10187,"def_p":18916,"def_m":18916,"crit":16017,"critDmg":16017,"critRes":13108,"critDmgRes":13108}},{"name":"Phase 4 (2/5)","stats":{"hp":15354327,"atk_p":11027,"atk_m":11027,"def_p":20476,"def_m":20476,"crit":17337,"critDmg":17337,"critRes":14188,"critDmgRes":14188}},{"name":"Phase 5 (1/5)","stats":{"hp":16522933,"atk_p":11867,"atk_m":11867,"def_p":22036,"def_m":22036,"crit":18657,"critDmg":18657,"critRes":15268,"critDmgRes":15268}},{"name":"Phase 6 (0/5)","stats":{"hp":17691539,"atk_p":12707,"atk_m":12707,"def_p":23596,"def_m":23596,"crit":19977,"critDmg":19977,"critRes":16348,"critDmgRes":16348}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_31": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":5},"hp":26286605,"atk_p":12707,"atk_m":12707,"def_p":23596,"def_m":23596,"crit":19977,"critDmg":19977,"critRes":16348,"critDmgRes":16348,"special":1128.5200000000002,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":26286605,"atk_p":12707,"atk_m":12707,"def_p":23596,"def_m":23596,"crit":19977,"critDmg":19977,"critRes":16348,"critDmgRes":16348}},{"name":"Phase 2 (4/5)","stats":{"hp":28891129,"atk_p":13967,"atk_m":13967,"def_p":25936,"def_m":25936,"crit":21957,"critDmg":21957,"critRes":17968,"critDmgRes":17968}},{"name":"Phase 3 (3/5)","stats":{"hp":31495653,"atk_p":15227,"atk_m":15227,"def_p":28276,"def_m":28276,"crit":23937,"critDmg":23937,"critRes":19588,"critDmgRes":19588}},{"name":"Phase 4 (2/5)","stats":{"hp":34100176,"atk_p":16487,"atk_m":16487,"def_p":30616,"def_m":30616,"crit":25917,"critDmg":25917,"critRes":21208,"critDmgRes":21208}},{"name":"Phase 5 (1/5)","stats":{"hp":36704700,"atk_p":17747,"atk_m":17747,"def_p":32956,"def_m":32956,"crit":27897,"critDmg":27897,"critRes":22828,"critDmgRes":22828}},{"name":"Phase 6 (0/5)","stats":{"hp":39309224,"atk_p":19007,"atk_m":19007,"def_p":35296,"def_m":35296,"crit":29877,"critDmg":29877,"critRes":24448,"critDmgRes":24448}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_32": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":6},"hp":58588935,"atk_p":19007,"atk_m":19007,"def_p":35296,"def_m":35296,"crit":29877,"critDmg":29877,"critRes":24448,"critDmgRes":24448,"special":1642.7800000000002,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":58588935,"atk_p":19007,"atk_m":19007,"def_p":35296,"def_m":35296,"crit":29877,"critDmg":29877,"critRes":24448,"critDmgRes":24448}},{"name":"Phase 2 (4/5)","stats":{"hp":64411853,"atk_p":20897,"atk_m":20897,"def_p":38806,"def_m":38806,"crit":32847,"critDmg":32847,"critRes":26878,"critDmgRes":26878}},{"name":"Phase 3 (3/5)","stats":{"hp":70234771,"atk_p":22787,"atk_m":22787,"def_p":42316,"def_m":42316,"crit":35817,"critDmg":35817,"critRes":29308,"critDmgRes":29308}},{"name":"Phase 4 (2/5)","stats":{"hp":76057690,"atk_p":24677,"atk_m":24677,"def_p":45826,"def_m":45826,"crit":38787,"critDmg":38787,"critRes":31738,"critDmgRes":31738}},{"name":"Phase 5 (1/5)","stats":{"hp":81880608,"atk_p":26567,"atk_m":26567,"def_p":49336,"def_m":49336,"crit":41757,"critDmg":41757,"critRes":34168,"critDmgRes":34168}},{"name":"Phase 6 (0/5)","stats":{"hp":87703526,"atk_p":28457,"atk_m":28457,"def_p":52846,"def_m":52846,"crit":44727,"critDmg":44727,"critRes":36598,"critDmgRes":36598}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_41": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":7},"hp":127799868,"atk_p":28107,"atk_m":28107,"def_p":52196,"def_m":52196,"crit":44177,"critDmg":44177,"critRes":36148,"critDmgRes":36148,"special":2385.6000000000004,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":127799868,"atk_p":28107,"atk_m":28107,"def_p":52196,"def_m":52196,"crit":44177,"critDmg":44177,"critRes":36148,"critDmgRes":36148}},{"name":"Phase 2 (4/5)","stats":{"hp":140526780,"atk_p":30907,"atk_m":30907,"def_p":57396,"def_m":57396,"crit":48577,"critDmg":48577,"critRes":39748,"critDmgRes":39748}},{"name":"Phase 3 (3/5)","stats":{"hp":153253691,"atk_p":33707,"atk_m":33707,"def_p":62596,"def_m":62596,"crit":52977,"critDmg":52977,"critRes":43348,"critDmgRes":43348}},{"name":"Phase 4 (2/5)","stats":{"hp":165980603,"atk_p":36507,"atk_m":36507,"def_p":67796,"def_m":67796,"crit":57377,"critDmg":57377,"critRes":46948,"critDmgRes":46948}},{"name":"Phase 5 (1/5)","stats":{"hp":178707515,"atk_p":39307,"atk_m":39307,"def_p":72996,"def_m":72996,"crit":61777,"critDmg":61777,"critRes":50548,"critDmgRes":50548}},{"name":"Phase 6 (0/5)","stats":{"hp":191434427,"atk_p":42107,"atk_m":42107,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_meow_42": {"name":"M.E.O.W","content":{"type":"eliasFrontier","stage":8},"hp":286321339,"atk_p":42107,"atk_m":42107,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148,"special":3528.4,"dmgType":"phys","size":"extralarge","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":286321339,"atk_p":42107,"atk_m":42107,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148}},{"name":"Phase 2 (4/5)","stats":{"hp":314874090,"atk_p":46307,"atk_m":46307,"def_p":85996,"def_m":85996,"crit":72777,"critDmg":72777,"critRes":59548,"critDmgRes":59548}},{"name":"Phase 3 (3/5)","stats":{"hp":343426842,"atk_p":50507,"atk_m":50507,"def_p":93796,"def_m":93796,"crit":79377,"critDmg":79377,"critRes":64948,"critDmgRes":64948}},{"name":"Phase 4 (2/5)","stats":{"hp":371979594,"atk_p":54707,"atk_m":54707,"def_p":101596,"def_m":101596,"crit":85977,"critDmg":85977,"critRes":70348,"critDmgRes":70348}},{"name":"Phase 5 (1/5)","stats":{"hp":400532345,"atk_p":58907,"atk_m":58907,"def_p":109396,"def_m":109396,"crit":92577,"critDmg":92577,"critRes":75748,"critDmgRes":75748}},{"name":"Phase 6 (0/5)","stats":{"hp":429085097,"atk_p":63107,"atk_m":63107,"def_p":117196,"def_m":117196,"crit":99177,"critDmg":99177,"critRes":81148,"critDmgRes":81148}}],"weakness":{"phys":{"add":75},"statusTakenDamage":{"add":30,"status":"感電"}}},
    "ef_r41renewa_11": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":1},"hp":401524,"atk_p":1507,"atk_m":1507,"def_p":2796,"def_m":2796,"crit":2377,"critDmg":2377,"critRes":1948,"critDmgRes":1948,"special":214.28000000000003,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":401524,"atk_p":1507,"atk_m":1507,"def_p":2796,"def_m":2796,"crit":2377,"critDmg":2377,"critRes":1948,"critDmgRes":1948}},{"name":"Phase 2 (4/5)","stats":{"hp":438585,"atk_p":1647,"atk_m":1647,"def_p":3056,"def_m":3056,"crit":2597,"critDmg":2597,"critRes":2128,"critDmgRes":2128}},{"name":"Phase 3 (3/5)","stats":{"hp":475647,"atk_p":1787,"atk_m":1787,"def_p":3316,"def_m":3316,"crit":2817,"critDmg":2817,"critRes":2308,"critDmgRes":2308}},{"name":"Phase 4 (2/5)","stats":{"hp":512708,"atk_p":1927,"atk_m":1927,"def_p":3576,"def_m":3576,"crit":3037,"critDmg":3037,"critRes":2488,"critDmgRes":2488}},{"name":"Phase 5 (1/5)","stats":{"hp":549769,"atk_p":2067,"atk_m":2067,"def_p":3836,"def_m":3836,"crit":3257,"critDmg":3257,"critRes":2668,"critDmgRes":2668}},{"name":"Phase 6 (0/5)","stats":{"hp":586830,"atk_p":2207,"atk_m":2207,"def_p":4096,"def_m":4096,"crit":3477,"critDmg":3477,"critRes":2848,"critDmgRes":2848}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_12": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":2},"hp":2179702,"atk_p":3607,"atk_m":3607,"def_p":6696,"def_m":6696,"crit":5677,"critDmg":5677,"critRes":4648,"critDmgRes":4648,"special":385.70000000000005,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":2179702,"atk_p":3607,"atk_m":3607,"def_p":6696,"def_m":6696,"crit":5677,"critDmg":5677,"critRes":4648,"critDmgRes":4648}},{"name":"Phase 2 (4/5)","stats":{"hp":2390635,"atk_p":3957,"atk_m":3957,"def_p":7346,"def_m":7346,"crit":6227,"critDmg":6227,"critRes":5098,"critDmgRes":5098}},{"name":"Phase 3 (3/5)","stats":{"hp":2601568,"atk_p":4307,"atk_m":4307,"def_p":7996,"def_m":7996,"crit":6777,"critDmg":6777,"critRes":5548,"critDmgRes":5548}},{"name":"Phase 4 (2/5)","stats":{"hp":2812501,"atk_p":4657,"atk_m":4657,"def_p":8646,"def_m":8646,"crit":7327,"critDmg":7327,"critRes":5998,"critDmgRes":5998}},{"name":"Phase 5 (1/5)","stats":{"hp":3023434,"atk_p":5007,"atk_m":5007,"def_p":9296,"def_m":9296,"crit":7877,"critDmg":7877,"critRes":6448,"critDmgRes":6448}},{"name":"Phase 6 (0/5)","stats":{"hp":3234367,"atk_p":5357,"atk_m":5357,"def_p":9946,"def_m":9946,"crit":8427,"critDmg":8427,"critRes":6898,"critDmgRes":6898}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_21": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":3},"hp":4745749,"atk_p":5357,"atk_m":5357,"def_p":9946,"def_m":9946,"crit":8427,"critDmg":8427,"critRes":6898,"critDmgRes":6898,"special":528.55,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":4745749,"atk_p":5357,"atk_m":5357,"def_p":9946,"def_m":9946,"crit":8427,"critDmg":8427,"critRes":6898,"critDmgRes":6898}},{"name":"Phase 2 (4/5)","stats":{"hp":5209998,"atk_p":5882,"atk_m":5882,"def_p":10921,"def_m":10921,"crit":9252,"critDmg":9252,"critRes":7573,"critDmgRes":7573}},{"name":"Phase 3 (3/5)","stats":{"hp":5674247,"atk_p":6407,"atk_m":6407,"def_p":11896,"def_m":11896,"crit":10077,"critDmg":10077,"critRes":8248,"critDmgRes":8248}},{"name":"Phase 4 (2/5)","stats":{"hp":6138496,"atk_p":6932,"atk_m":6932,"def_p":12871,"def_m":12871,"crit":10902,"critDmg":10902,"critRes":8923,"critDmgRes":8923}},{"name":"Phase 5 (1/5)","stats":{"hp":6602746,"atk_p":7457,"atk_m":7457,"def_p":13846,"def_m":13846,"crit":11727,"critDmg":11727,"critRes":9598,"critDmgRes":9598}},{"name":"Phase 6 (0/5)","stats":{"hp":7066995,"atk_p":7982,"atk_m":7982,"def_p":14821,"def_m":14821,"crit":12552,"critDmg":12552,"critRes":10273,"critDmgRes":10273}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_22": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":4},"hp":11848508,"atk_p":8507,"atk_m":8507,"def_p":15796,"def_m":15796,"crit":13377,"critDmg":13377,"critRes":10948,"critDmgRes":10948,"special":785.6800000000001,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":11848508,"atk_p":8507,"atk_m":8507,"def_p":15796,"def_m":15796,"crit":13377,"critDmg":13377,"critRes":10948,"critDmgRes":10948}},{"name":"Phase 2 (4/5)","stats":{"hp":13017115,"atk_p":9347,"atk_m":9347,"def_p":17356,"def_m":17356,"crit":14697,"critDmg":14697,"critRes":12028,"critDmgRes":12028}},{"name":"Phase 3 (3/5)","stats":{"hp":14185721,"atk_p":10187,"atk_m":10187,"def_p":18916,"def_m":18916,"crit":16017,"critDmg":16017,"critRes":13108,"critDmgRes":13108}},{"name":"Phase 4 (2/5)","stats":{"hp":15354327,"atk_p":11027,"atk_m":11027,"def_p":20476,"def_m":20476,"crit":17337,"critDmg":17337,"critRes":14188,"critDmgRes":14188}},{"name":"Phase 5 (1/5)","stats":{"hp":16522933,"atk_p":11867,"atk_m":11867,"def_p":22036,"def_m":22036,"crit":18657,"critDmg":18657,"critRes":15268,"critDmgRes":15268}},{"name":"Phase 6 (0/5)","stats":{"hp":17691539,"atk_p":12707,"atk_m":12707,"def_p":23596,"def_m":23596,"crit":19977,"critDmg":19977,"critRes":16348,"critDmgRes":16348}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_31": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":5},"hp":26286605,"atk_p":12707,"atk_m":12707,"def_p":23596,"def_m":23596,"crit":19977,"critDmg":19977,"critRes":16348,"critDmgRes":16348,"special":1128.5200000000002,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":26286605,"atk_p":12707,"atk_m":12707,"def_p":23596,"def_m":23596,"crit":19977,"critDmg":19977,"critRes":16348,"critDmgRes":16348}},{"name":"Phase 2 (4/5)","stats":{"hp":28891129,"atk_p":13967,"atk_m":13967,"def_p":25936,"def_m":25936,"crit":21957,"critDmg":21957,"critRes":17968,"critDmgRes":17968}},{"name":"Phase 3 (3/5)","stats":{"hp":31495653,"atk_p":15227,"atk_m":15227,"def_p":28276,"def_m":28276,"crit":23937,"critDmg":23937,"critRes":19588,"critDmgRes":19588}},{"name":"Phase 4 (2/5)","stats":{"hp":34100176,"atk_p":16487,"atk_m":16487,"def_p":30616,"def_m":30616,"crit":25917,"critDmg":25917,"critRes":21208,"critDmgRes":21208}},{"name":"Phase 5 (1/5)","stats":{"hp":36704700,"atk_p":17747,"atk_m":17747,"def_p":32956,"def_m":32956,"crit":27897,"critDmg":27897,"critRes":22828,"critDmgRes":22828}},{"name":"Phase 6 (0/5)","stats":{"hp":39309224,"atk_p":19007,"atk_m":19007,"def_p":35296,"def_m":35296,"crit":29877,"critDmg":29877,"critRes":24448,"critDmgRes":24448}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_32": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":6},"hp":58588935,"atk_p":19007,"atk_m":19007,"def_p":35296,"def_m":35296,"crit":29877,"critDmg":29877,"critRes":24448,"critDmgRes":24448,"special":1642.7800000000002,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":58588935,"atk_p":19007,"atk_m":19007,"def_p":35296,"def_m":35296,"crit":29877,"critDmg":29877,"critRes":24448,"critDmgRes":24448}},{"name":"Phase 2 (4/5)","stats":{"hp":64411853,"atk_p":20897,"atk_m":20897,"def_p":38806,"def_m":38806,"crit":32847,"critDmg":32847,"critRes":26878,"critDmgRes":26878}},{"name":"Phase 3 (3/5)","stats":{"hp":70234771,"atk_p":22787,"atk_m":22787,"def_p":42316,"def_m":42316,"crit":35817,"critDmg":35817,"critRes":29308,"critDmgRes":29308}},{"name":"Phase 4 (2/5)","stats":{"hp":76057690,"atk_p":24677,"atk_m":24677,"def_p":45826,"def_m":45826,"crit":38787,"critDmg":38787,"critRes":31738,"critDmgRes":31738}},{"name":"Phase 5 (1/5)","stats":{"hp":81880608,"atk_p":26567,"atk_m":26567,"def_p":49336,"def_m":49336,"crit":41757,"critDmg":41757,"critRes":34168,"critDmgRes":34168}},{"name":"Phase 6 (0/5)","stats":{"hp":87703526,"atk_p":28457,"atk_m":28457,"def_p":52846,"def_m":52846,"crit":44727,"critDmg":44727,"critRes":36598,"critDmgRes":36598}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_41": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":7},"hp":127799868,"atk_p":28107,"atk_m":28107,"def_p":52196,"def_m":52196,"crit":44177,"critDmg":44177,"critRes":36148,"critDmgRes":36148,"special":2385.6000000000004,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":127799868,"atk_p":28107,"atk_m":28107,"def_p":52196,"def_m":52196,"crit":44177,"critDmg":44177,"critRes":36148,"critDmgRes":36148}},{"name":"Phase 2 (4/5)","stats":{"hp":140526780,"atk_p":30907,"atk_m":30907,"def_p":57396,"def_m":57396,"crit":48577,"critDmg":48577,"critRes":39748,"critDmgRes":39748}},{"name":"Phase 3 (3/5)","stats":{"hp":153253691,"atk_p":33707,"atk_m":33707,"def_p":62596,"def_m":62596,"crit":52977,"critDmg":52977,"critRes":43348,"critDmgRes":43348}},{"name":"Phase 4 (2/5)","stats":{"hp":165980603,"atk_p":36507,"atk_m":36507,"def_p":67796,"def_m":67796,"crit":57377,"critDmg":57377,"critRes":46948,"critDmgRes":46948}},{"name":"Phase 5 (1/5)","stats":{"hp":178707515,"atk_p":39307,"atk_m":39307,"def_p":72996,"def_m":72996,"crit":61777,"critDmg":61777,"critRes":50548,"critDmgRes":50548}},{"name":"Phase 6 (0/5)","stats":{"hp":191434427,"atk_p":42107,"atk_m":42107,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_42": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":8},"hp":286321339,"atk_p":42107,"atk_m":42107,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148,"special":3528.4,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":286321339,"atk_p":42107,"atk_m":42107,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148}},{"name":"Phase 2 (4/5)","stats":{"hp":314874090,"atk_p":46307,"atk_m":46307,"def_p":85996,"def_m":85996,"crit":72777,"critDmg":72777,"critRes":59548,"critDmgRes":59548}},{"name":"Phase 3 (3/5)","stats":{"hp":343426842,"atk_p":50507,"atk_m":50507,"def_p":93796,"def_m":93796,"crit":79377,"critDmg":79377,"critRes":64948,"critDmgRes":64948}},{"name":"Phase 4 (2/5)","stats":{"hp":371979594,"atk_p":54707,"atk_m":54707,"def_p":101596,"def_m":101596,"crit":85977,"critDmg":85977,"critRes":70348,"critDmgRes":70348}},{"name":"Phase 5 (1/5)","stats":{"hp":400532345,"atk_p":58907,"atk_m":58907,"def_p":109396,"def_m":109396,"crit":92577,"critDmg":92577,"critRes":75748,"critDmgRes":75748}},{"name":"Phase 6 (0/5)","stats":{"hp":429085097,"atk_p":63107,"atk_m":63107,"def_p":117196,"def_m":117196,"crit":99177,"critDmg":99177,"critRes":81148,"critDmgRes":81148}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":99}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}},"manualStates":{"attackValues":[0],"attackOptions":[{"value":0,"label":"なし"}],"reductionValues":[0,30],"reductionOptions":[{"value":0,"label":"なし"},{"value":30,"label":"−30pt（25秒）","durationSeconds":25}]}},
    "ef_r41renewa_51": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":9},"hp":1140381107,"atk_p":84107,"atk_m":84107,"def_p":156196,"def_m":156196,"crit":132177,"critDmg":132177,"critRes":108148,"critDmgRes":108148,"special":6956.8,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":1140381107,"atk_p":84107,"atk_m":84107,"def_p":156196,"def_m":156196,"crit":132177,"critDmg":132177,"critRes":108148,"critDmgRes":108148}},{"name":"Phase 2 (4/5)","stats":{"hp":1254260914,"atk_p":92507,"atk_m":92507,"def_p":171796,"def_m":171796,"crit":145377,"critDmg":145377,"critRes":118948,"critDmgRes":118948}},{"name":"Phase 3 (3/5)","stats":{"hp":1368140721,"atk_p":100907,"atk_m":100907,"def_p":187396,"def_m":187396,"crit":158577,"critDmg":158577,"critRes":129748,"critDmgRes":129748}},{"name":"Phase 4 (2/5)","stats":{"hp":1482020528,"atk_p":109307,"atk_m":109307,"def_p":202996,"def_m":202996,"crit":171777,"critDmg":171777,"critRes":140548,"critDmgRes":140548}},{"name":"Phase 5 (1/5)","stats":{"hp":1595900334,"atk_p":117707,"atk_m":117707,"def_p":218596,"def_m":218596,"crit":184977,"critDmg":184977,"critRes":151348,"critDmgRes":151348}},{"name":"Phase 6 (0/5)","stats":{"hp":1709780141,"atk_p":126107,"atk_m":126107,"def_p":234196,"def_m":234196,"crit":198177,"critDmg":198177,"critRes":162148,"critDmgRes":162148}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":9}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}}},
    "ef_r41renewa_52": {"name":"R41リニュア","content":{"type":"eliasFrontier","stage":10},"hp":4551729746,"atk_p":168107,"atk_m":168107,"def_p":312196,"def_m":312196,"crit":264177,"critDmg":264177,"critRes":216148,"critDmgRes":216148,"special":13813.6,"dmgType":"phys","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":4551729746,"atk_p":168107,"atk_m":168107,"def_p":312196,"def_m":312196,"crit":264177,"critDmg":264177,"critRes":216148,"critDmgRes":216148}},{"name":"Phase 2 (4/5)","stats":{"hp":5006586573,"atk_p":184907,"atk_m":184907,"def_p":343396,"def_m":343396,"crit":290577,"critDmg":290577,"critRes":237748,"critDmgRes":237748}},{"name":"Phase 3 (3/5)","stats":{"hp":5461443400,"atk_p":201707,"atk_m":201707,"def_p":374596,"def_m":374596,"crit":316977,"critDmg":316977,"critRes":259348,"critDmgRes":259348}},{"name":"Phase 4 (2/5)","stats":{"hp":5916300228,"atk_p":218507,"atk_m":218507,"def_p":405796,"def_m":405796,"crit":343377,"critDmg":343377,"critRes":280948,"critDmgRes":280948}},{"name":"Phase 5 (1/5)","stats":{"hp":6371157055,"atk_p":235307,"atk_m":235307,"def_p":436996,"def_m":436996,"crit":369777,"critDmg":369777,"critRes":302548,"critDmgRes":302548}},{"name":"Phase 6 (0/5)","stats":{"hp":6826013882,"atk_p":252107,"atk_m":252107,"def_p":468196,"def_m":468196,"crit":396177,"critDmg":396177,"critRes":324148,"critDmgRes":324148}}],"modifiers":{"targetDebuffs":{"breakTakenDmg":{"perStack":5,"maxStacks":9}}},"weakness":{"mag":{"add":75},"statusTakenDamage":{"add":30,"status":"苦痛"}}},
    "ef_isamureyon_11": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":1},"hp":523726,"atk_p":1507,"atk_m":1507,"def_p":4094,"def_m":4094,"crit":2377,"critDmg":2377,"critRes":1717,"critDmgRes":1717,"special":214.28000000000003,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":523726,"atk_p":1507,"atk_m":1507,"def_p":4094,"def_m":4094,"crit":2377,"critDmg":2377,"critRes":1717,"critDmgRes":1717}},{"name":"Phase 2 (4/5)","stats":{"hp":572066,"atk_p":1647,"atk_m":1647,"def_p":4474,"def_m":4474,"crit":2597,"critDmg":2597,"critRes":1877,"critDmgRes":1877}},{"name":"Phase 3 (3/5)","stats":{"hp":620407,"atk_p":1787,"atk_m":1787,"def_p":4854,"def_m":4854,"crit":2817,"critDmg":2817,"critRes":2037,"critDmgRes":2037}},{"name":"Phase 4 (2/5)","stats":{"hp":668748,"atk_p":1927,"atk_m":1927,"def_p":5234,"def_m":5234,"crit":3037,"critDmg":3037,"critRes":2197,"critDmgRes":2197}},{"name":"Phase 5 (1/5)","stats":{"hp":717089,"atk_p":2067,"atk_m":2067,"def_p":5614,"def_m":5614,"crit":3257,"critDmg":3257,"critRes":2357,"critDmgRes":2357}},{"name":"Phase 6 (0/5)","stats":{"hp":765430,"atk_p":2207,"atk_m":2207,"def_p":5994,"def_m":5994,"crit":3477,"critDmg":3477,"critRes":2517,"critDmgRes":2517}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_12": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":2},"hp":2843086,"atk_p":3607,"atk_m":3607,"def_p":9794,"def_m":9794,"crit":5677,"critDmg":5677,"critRes":4117,"critDmgRes":4117,"special":385.70000000000005,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":2843086,"atk_p":3607,"atk_m":3607,"def_p":9794,"def_m":9794,"crit":5677,"critDmg":5677,"critRes":4117,"critDmgRes":4117}},{"name":"Phase 2 (4/5)","stats":{"hp":3118216,"atk_p":3957,"atk_m":3957,"def_p":10744,"def_m":10744,"crit":6227,"critDmg":6227,"critRes":4517,"critDmgRes":4517}},{"name":"Phase 3 (3/5)","stats":{"hp":3393346,"atk_p":4307,"atk_m":4307,"def_p":11694,"def_m":11694,"crit":6777,"critDmg":6777,"critRes":4917,"critDmgRes":4917}},{"name":"Phase 4 (2/5)","stats":{"hp":3668476,"atk_p":4657,"atk_m":4657,"def_p":12644,"def_m":12644,"crit":7327,"critDmg":7327,"critRes":5317,"critDmgRes":5317}},{"name":"Phase 5 (1/5)","stats":{"hp":3943606,"atk_p":5007,"atk_m":5007,"def_p":13594,"def_m":13594,"crit":7877,"critDmg":7877,"critRes":5717,"critDmgRes":5717}},{"name":"Phase 6 (0/5)","stats":{"hp":4218736,"atk_p":5357,"atk_m":5357,"def_p":14544,"def_m":14544,"crit":8427,"critDmg":8427,"critRes":6117,"critDmgRes":6117}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_21": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":3},"hp":6190102,"atk_p":5357,"atk_m":5357,"def_p":14544,"def_m":14544,"crit":8427,"critDmg":8427,"critRes":6117,"critDmgRes":6117,"special":528.55,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":6190102,"atk_p":5357,"atk_m":5357,"def_p":14544,"def_m":14544,"crit":8427,"critDmg":8427,"critRes":6117,"critDmgRes":6117}},{"name":"Phase 2 (4/5)","stats":{"hp":6795645,"atk_p":5882,"atk_m":5882,"def_p":15969,"def_m":15969,"crit":9252,"critDmg":9252,"critRes":6717,"critDmgRes":6717}},{"name":"Phase 3 (3/5)","stats":{"hp":7401187,"atk_p":6407,"atk_m":6407,"def_p":17394,"def_m":17394,"crit":10077,"critDmg":10077,"critRes":7317,"critDmgRes":7317}},{"name":"Phase 4 (2/5)","stats":{"hp":8006730,"atk_p":6932,"atk_m":6932,"def_p":18819,"def_m":18819,"crit":10902,"critDmg":10902,"critRes":7917,"critDmgRes":7917}},{"name":"Phase 5 (1/5)","stats":{"hp":8612272,"atk_p":7457,"atk_m":7457,"def_p":20244,"def_m":20244,"crit":11727,"critDmg":11727,"critRes":8517,"critDmgRes":8517}},{"name":"Phase 6 (0/5)","stats":{"hp":9217815,"atk_p":7982,"atk_m":7982,"def_p":21669,"def_m":21669,"crit":12552,"critDmg":12552,"critRes":9117,"critDmgRes":9117}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_22": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":4},"hp":15454569,"atk_p":8507,"atk_m":8507,"def_p":23094,"def_m":23094,"crit":13377,"critDmg":13377,"critRes":9717,"critDmgRes":9717,"special":785.6800000000001,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":15454569,"atk_p":8507,"atk_m":8507,"def_p":23094,"def_m":23094,"crit":13377,"critDmg":13377,"critRes":9717,"critDmgRes":9717}},{"name":"Phase 2 (4/5)","stats":{"hp":16978837,"atk_p":9347,"atk_m":9347,"def_p":25374,"def_m":25374,"crit":14697,"critDmg":14697,"critRes":10677,"critDmgRes":10677}},{"name":"Phase 3 (3/5)","stats":{"hp":18503106,"atk_p":10187,"atk_m":10187,"def_p":27654,"def_m":27654,"crit":16017,"critDmg":16017,"critRes":11637,"critDmgRes":11637}},{"name":"Phase 4 (2/5)","stats":{"hp":20027375,"atk_p":11027,"atk_m":11027,"def_p":29934,"def_m":29934,"crit":17337,"critDmg":17337,"critRes":12597,"critDmgRes":12597}},{"name":"Phase 5 (1/5)","stats":{"hp":21551644,"atk_p":11867,"atk_m":11867,"def_p":32214,"def_m":32214,"crit":18657,"critDmg":18657,"critRes":13557,"critDmgRes":13557}},{"name":"Phase 6 (0/5)","stats":{"hp":23075913,"atk_p":12707,"atk_m":12707,"def_p":34494,"def_m":34494,"crit":19977,"critDmg":19977,"critRes":14517,"critDmgRes":14517}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_31": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":5},"hp":34286865,"atk_p":12707,"atk_m":12707,"def_p":34494,"def_m":34494,"crit":19977,"critDmg":19977,"critRes":14517,"critDmgRes":14517,"special":1128.5200000000002,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":34286865,"atk_p":12707,"atk_m":12707,"def_p":34494,"def_m":34494,"crit":19977,"critDmg":19977,"critRes":14517,"critDmgRes":14517}},{"name":"Phase 2 (4/5)","stats":{"hp":37684070,"atk_p":13967,"atk_m":13967,"def_p":37914,"def_m":37914,"crit":21957,"critDmg":21957,"critRes":15957,"critDmgRes":15957}},{"name":"Phase 3 (3/5)","stats":{"hp":41081275,"atk_p":15227,"atk_m":15227,"def_p":41334,"def_m":41334,"crit":23937,"critDmg":23937,"critRes":17397,"critDmgRes":17397}},{"name":"Phase 4 (2/5)","stats":{"hp":44478479,"atk_p":16487,"atk_m":16487,"def_p":44754,"def_m":44754,"crit":25917,"critDmg":25917,"critRes":18837,"critDmgRes":18837}},{"name":"Phase 5 (1/5)","stats":{"hp":47875684,"atk_p":17747,"atk_m":17747,"def_p":48174,"def_m":48174,"crit":27897,"critDmg":27897,"critRes":20277,"critDmgRes":20277}},{"name":"Phase 6 (0/5)","stats":{"hp":51272889,"atk_p":19007,"atk_m":19007,"def_p":51594,"def_m":51594,"crit":29877,"critDmg":29877,"critRes":21717,"critDmgRes":21717}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_32": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":6},"hp":76420333,"atk_p":19007,"atk_m":19007,"def_p":51594,"def_m":51594,"crit":29877,"critDmg":29877,"critRes":21717,"critDmgRes":21717,"special":1642.7800000000002,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":76420333,"atk_p":19007,"atk_m":19007,"def_p":51594,"def_m":51594,"crit":29877,"critDmg":29877,"critRes":21717,"critDmgRes":21717}},{"name":"Phase 2 (4/5)","stats":{"hp":84015443,"atk_p":20897,"atk_m":20897,"def_p":56724,"def_m":56724,"crit":32847,"critDmg":32847,"critRes":23877,"critDmgRes":23877}},{"name":"Phase 3 (3/5)","stats":{"hp":91610554,"atk_p":22787,"atk_m":22787,"def_p":61854,"def_m":61854,"crit":35817,"critDmg":35817,"critRes":26037,"critDmgRes":26037}},{"name":"Phase 4 (2/5)","stats":{"hp":99205665,"atk_p":24677,"atk_m":24677,"def_p":66984,"def_m":66984,"crit":38787,"critDmg":38787,"critRes":28197,"critDmgRes":28197}},{"name":"Phase 5 (1/5)","stats":{"hp":106800776,"atk_p":26567,"atk_m":26567,"def_p":72114,"def_m":72114,"crit":41757,"critDmg":41757,"critRes":30357,"critDmgRes":30357}},{"name":"Phase 6 (0/5)","stats":{"hp":114395887,"atk_p":28457,"atk_m":28457,"def_p":77244,"def_m":77244,"crit":44727,"critDmg":44727,"critRes":32517,"critDmgRes":32517}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_41": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":7},"hp":166695455,"atk_p":28107,"atk_m":28107,"def_p":76294,"def_m":76294,"crit":44177,"critDmg":44177,"critRes":32117,"critDmgRes":32117,"special":2385.6000000000004,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":166695455,"atk_p":28107,"atk_m":28107,"def_p":76294,"def_m":76294,"crit":44177,"critDmg":44177,"critRes":32117,"critDmgRes":32117}},{"name":"Phase 2 (4/5)","stats":{"hp":183295774,"atk_p":30907,"atk_m":30907,"def_p":83894,"def_m":83894,"crit":48577,"critDmg":48577,"critRes":35317,"critDmgRes":35317}},{"name":"Phase 3 (3/5)","stats":{"hp":199896094,"atk_p":33707,"atk_m":33707,"def_p":91494,"def_m":91494,"crit":52977,"critDmg":52977,"critRes":38517,"critDmgRes":38517}},{"name":"Phase 4 (2/5)","stats":{"hp":216496414,"atk_p":36507,"atk_m":36507,"def_p":99094,"def_m":99094,"crit":57377,"critDmg":57377,"critRes":41717,"critDmgRes":41717}},{"name":"Phase 5 (1/5)","stats":{"hp":233096734,"atk_p":39307,"atk_m":39307,"def_p":106694,"def_m":106694,"crit":61777,"critDmg":61777,"critRes":44917,"critDmgRes":44917}},{"name":"Phase 6 (0/5)","stats":{"hp":249697054,"atk_p":42107,"atk_m":42107,"def_p":114294,"def_m":114294,"crit":66177,"critDmg":66177,"critRes":48117,"critDmgRes":48117}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "ef_isamureyon_42": {"name":"イサムレヨン","content":{"type":"eliasFrontier","stage":8},"hp":373462578,"atk_p":42107,"atk_m":42107,"def_p":114294,"def_m":114294,"crit":66177,"critDmg":66177,"critRes":48117,"critDmgRes":48117,"special":3528.4,"dmgType":"mag","size":"large","phases":[{"name":"Phase 1 (5/5)","stats":{"hp":373462578,"atk_p":42107,"atk_m":42107,"def_p":114294,"def_m":114294,"crit":66177,"critDmg":66177,"critRes":48117,"critDmgRes":48117}},{"name":"Phase 2 (4/5)","stats":{"hp":410705298,"atk_p":46307,"atk_m":46307,"def_p":125694,"def_m":125694,"crit":72777,"critDmg":72777,"critRes":52917,"critDmgRes":52917}},{"name":"Phase 3 (3/5)","stats":{"hp":447948017,"atk_p":50507,"atk_m":50507,"def_p":137094,"def_m":137094,"crit":79377,"critDmg":79377,"critRes":57717,"critDmgRes":57717}},{"name":"Phase 4 (2/5)","stats":{"hp":485190737,"atk_p":54707,"atk_m":54707,"def_p":148494,"def_m":148494,"crit":85977,"critDmg":85977,"critRes":62517,"critDmgRes":62517}},{"name":"Phase 5 (1/5)","stats":{"hp":522433457,"atk_p":58907,"atk_m":58907,"def_p":159894,"def_m":159894,"crit":92577,"critDmg":92577,"critRes":67317,"critDmgRes":67317}},{"name":"Phase 6 (0/5)","stats":{"hp":559676176,"atk_p":63107,"atk_m":63107,"def_p":171294,"def_m":171294,"crit":99177,"critDmg":99177,"critRes":72117,"critDmgRes":72117}}],"manualStates":{"attackValues":[0,50,100],"attackOptions":[{"value":0,"label":"なし"},{"value":50,"label":"通常・金クレヨン / +50pt（10秒）","durationSeconds":10},{"value":100,"label":"通常クレヨン / +100pt（10秒）","durationSeconds":10}],"reductionValues":[0,50],"reductionOptions":[{"value":0,"label":"なし"},{"value":50,"label":"−50pt（10秒）","durationSeconds":10}]}},
    "GTA_24": {"name":"バンク蔵","content":{"type":"dungeon","mode":"goldThiefAttack","stage":24},"hp":4231046,"atk_p":1,"atk_m":1,"def_p":114582,"def_m":114582,"crit":1,"critDmg":1,"critRes":20000,"critDmgRes":1,"special":100,"dmgType":"phys","personality":"憂鬱"},
    "dimension_l1ly_3": {"name":"リリ一","content":{"type":"dimensionalClash","stage":3},"hp":10731490,"atk_p":3616,"atk_m":3616,"def_p":6696,"def_m":6696,"crit":5677,"critDmg":5677,"critRes":4648,"critDmgRes":4648,"special":385.7,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_l1ly_6": {"name":"リリ一","content":{"type":"dimensionalClash","stage":6},"hp":34124359,"atk_p":6416,"atk_m":6416,"def_p":11896,"def_m":11896,"crit":10077,"critDmg":10077,"critRes":8248,"critDmgRes":8248,"special":614.26,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_l1ly_9": {"name":"リリ一","content":{"type":"dimensionalClash","stage":9},"hp":93898145,"atk_p":10616,"atk_m":10616,"def_p":19696,"def_m":19696,"crit":16677,"critDmg":16677,"critRes":13648,"critDmgRes":13648,"special":957.1,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_l1ly_12": {"name":"リリ一","content":{"type":"dimensionalClash","stage":12},"hp":259346389,"atk_p":17616,"atk_m":17616,"def_p":32696,"def_m":32696,"crit":27677,"critDmg":27677,"critRes":22648,"critDmgRes":22648,"special":1528.5,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_l1ly_15": {"name":"リリ一","content":{"type":"dimensionalClash","stage":15},"hp":661796770,"atk_p":28116,"atk_m":28116,"def_p":52196,"def_m":52196,"crit":44177,"critDmg":44177,"critRes":36148,"critDmgRes":36148,"special":2385.6,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_l1ly_18": {"name":"リリ一","content":{"type":"dimensionalClash","stage":18},"hp":1486382912,"atk_p":42116,"atk_m":42116,"def_p":78196,"def_m":78196,"crit":66177,"critDmg":66177,"critRes":54148,"critDmgRes":54148,"special":3528.4,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_l1ly_21": {"name":"リリ一","content":{"type":"dimensionalClash","stage":21},"hp":7847071278,"atk_p":96716,"atk_m":96716,"def_p":179596,"def_m":179596,"crit":151977,"critDmg":151977,"critRes":124348,"critDmgRes":124348,"special":7985.32,"dmgType":"mag","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_cerberus_3": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":3},"hp":13950945,"atk_p":3089,"atk_m":3089,"def_p":6696,"def_m":6696,"crit":4117,"critDmg":4117,"critRes":4648,"critDmgRes":4648,"special":385.7,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_cerberus_6": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":6},"hp":44361682,"atk_p":5489,"atk_m":5489,"def_p":11896,"def_m":11896,"crit":7317,"critDmg":7317,"critRes":8248,"critDmgRes":8248,"special":614.26,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_cerberus_9": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":9},"hp":122067614,"atk_p":9089,"atk_m":9089,"def_p":19696,"def_m":19696,"crit":12117,"critDmg":12117,"critRes":13648,"critDmgRes":13648,"special":957.1,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_cerberus_12": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":12},"hp":337150349,"atk_p":15089,"atk_m":15089,"def_p":32696,"def_m":32696,"crit":20117,"critDmg":20117,"critRes":22648,"critDmgRes":22648,"special":1528.5,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_cerberus_15": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":15},"hp":860335869,"atk_p":24089,"atk_m":24089,"def_p":52196,"def_m":52196,"crit":32117,"critDmg":32117,"critRes":36148,"critDmgRes":36148,"special":2385.6,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_cerberus_18": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":18},"hp":1932297888,"atk_p":36089,"atk_m":36089,"def_p":78196,"def_m":78196,"crit":48117,"critDmg":48117,"critRes":54148,"critDmgRes":54148,"special":3528.4,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_cerberus_21": {"name":"ケルベロス","content":{"type":"dimensionalClash","stage":21},"hp":10201192898,"atk_p":82889,"atk_m":82889,"def_p":179596,"def_m":179596,"crit":110517,"critDmg":110517,"critRes":124348,"critDmgRes":124348,"special":7985.32,"dmgType":"phys","size":"large","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}},"weakness":{"statusDamage":{"otherP":1000}}},
    "dimension_isamureyon_3": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":3},"hp":21462979,"atk_p":3607,"atk_m":3607,"def_p":9794,"def_m":9794,"crit":5677,"critDmg":5677,"critRes":4117,"critDmgRes":4117,"special":385.7,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_isamureyon_6": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":6},"hp":68248718,"atk_p":6407,"atk_m":6407,"def_p":17394,"def_m":17394,"crit":10077,"critDmg":10077,"critRes":7317,"critDmgRes":7317,"special":614.26,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_isamureyon_9": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":9},"hp":187796290,"atk_p":10607,"atk_m":10607,"def_p":28794,"def_m":28794,"crit":16677,"critDmg":16677,"critRes":12117,"critDmgRes":12117,"special":957.1,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_isamureyon_12": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":12},"hp":518692779,"atk_p":17607,"atk_m":17607,"def_p":47794,"def_m":47794,"crit":27677,"critDmg":27677,"critRes":20117,"critDmgRes":20117,"special":1528.5,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_isamureyon_15": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":15},"hp":1323593540,"atk_p":28107,"atk_m":28107,"def_p":76294,"def_m":76294,"crit":44177,"critDmg":44177,"critRes":32117,"critDmgRes":32117,"special":2385.6,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_isamureyon_18": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":18},"hp":2972765824,"atk_p":42107,"atk_m":42107,"def_p":114294,"def_m":114294,"crit":66177,"critDmg":66177,"critRes":48117,"critDmgRes":48117,"special":3528.4,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_isamureyon_21": {"name":"イサムレヨン","content":{"type":"dimensionalClash","stage":21},"hp":15694142556,"atk_p":96707,"atk_m":96707,"def_p":262494,"def_m":262494,"crit":151977,"critDmg":151977,"critRes":110517,"critDmgRes":110517,"special":7985.32,"dmgType":"phys","personality":"","modifiers":{"buffs":{"anger":{"perStack":40,"maxStacks":5}}}},
    "dimension_kimoguri_1": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":1},"hp":3971951,"atk_p":2207,"atk_m":2207,"def_p":4096,"def_m":4096,"crit":3477,"critDmg":3477,"critRes":2517,"critDmgRes":2517,"special":271.42,"dmgType":"phys","personality":""},
    "dimension_kimoguri_4": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":4},"hp":15345483,"atk_p":4307,"atk_m":4307,"def_p":7996,"def_m":7996,"crit":6777,"critDmg":6777,"critRes":4917,"critDmgRes":4917,"special":442.84,"dmgType":"phys","personality":""},
    "dimension_kimoguri_7": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":7},"hp":46290800,"atk_p":7457,"atk_m":7457,"def_p":13846,"def_m":13846,"crit":11727,"critDmg":11727,"critRes":8517,"critDmgRes":8517,"special":699.97,"dmgType":"phys","personality":""},
    "dimension_kimoguri_10": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":10},"hp":127546300,"atk_p":12357,"atk_m":12357,"def_p":22946,"def_m":22946,"crit":19427,"critDmg":19427,"critRes":14117,"critDmgRes":14117,"special":1099.95,"dmgType":"phys","personality":""},
    "dimension_kimoguri_13": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":13},"hp":348564554,"atk_p":20407,"atk_m":20407,"def_p":37896,"def_m":37896,"crit":32077,"critDmg":32077,"critRes":23317,"critDmgRes":23317,"special":1757.06,"dmgType":"phys","personality":""},
    "dimension_kimoguri_16": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":16},"hp":800383871,"atk_p":30907,"atk_m":30907,"def_p":57396,"def_m":57396,"crit":48577,"critDmg":48577,"critRes":35317,"critDmgRes":35317,"special":2614.16,"dmgType":"phys","personality":""},
    "dimension_kimoguri_19": {"name":"キモグリ","content":{"type":"dimensionalClash","stage":19},"hp":4289320162,"atk_p":71507,"atk_m":71507,"def_p":132796,"def_m":132796,"crit":112377,"critDmg":112377,"critRes":81717,"critDmgRes":81717,"special":5928.28,"dmgType":"phys","personality":""},
    "dimension_saraiguma_1": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":1},"hp":3971951,"atk_p":2207,"atk_m":2207,"def_p":4096,"def_m":4096,"crit":3477,"critDmg":3477,"critRes":2517,"critDmgRes":2517,"special":271.42,"dmgType":"phys","personality":""},
    "dimension_saraiguma_4": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":4},"hp":15345483,"atk_p":4307,"atk_m":4307,"def_p":7996,"def_m":7996,"crit":6777,"critDmg":6777,"critRes":4917,"critDmgRes":4917,"special":442.84,"dmgType":"phys","personality":""},
    "dimension_saraiguma_7": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":7},"hp":46290800,"atk_p":7457,"atk_m":7457,"def_p":13846,"def_m":13846,"crit":11727,"critDmg":11727,"critRes":8517,"critDmgRes":8517,"special":699.97,"dmgType":"phys","personality":""},
    "dimension_saraiguma_10": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":10},"hp":127546300,"atk_p":12357,"atk_m":12357,"def_p":22946,"def_m":22946,"crit":19427,"critDmg":19427,"critRes":14117,"critDmgRes":14117,"special":1099.95,"dmgType":"phys","personality":""},
    "dimension_saraiguma_13": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":13},"hp":348564554,"atk_p":20407,"atk_m":20407,"def_p":37896,"def_m":37896,"crit":32077,"critDmg":32077,"critRes":23317,"critDmgRes":23317,"special":1757.06,"dmgType":"phys","personality":""},
    "dimension_saraiguma_16": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":16},"hp":800383871,"atk_p":30907,"atk_m":30907,"def_p":57396,"def_m":57396,"crit":48577,"critDmg":48577,"critRes":35317,"critDmgRes":35317,"special":2614.16,"dmgType":"phys","personality":""},
    "dimension_saraiguma_19": {"name":"サライグマ","content":{"type":"dimensionalClash","stage":19},"hp":4289320162,"atk_p":71507,"atk_m":71507,"def_p":132796,"def_m":132796,"crit":112377,"critDmg":112377,"critRes":81717,"critDmgRes":81717,"special":5928.28,"dmgType":"phys","personality":""},
    "dimension_drone_g_1": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":1},"hp":3971951,"atk_p":1889,"atk_m":1889,"def_p":4096,"def_m":4096,"crit":4421,"critDmg":4421,"critRes":2517,"critDmgRes":2517,"special":271.42,"dmgType":"phys","personality":""},
    "dimension_drone_g_4": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":4},"hp":15345483,"atk_p":3689,"atk_m":3689,"def_p":7996,"def_m":7996,"crit":8621,"critDmg":8621,"critRes":4917,"critDmgRes":4917,"special":442.84,"dmgType":"phys","personality":""},
    "dimension_drone_g_7": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":7},"hp":46290800,"atk_p":6389,"atk_m":6389,"def_p":13846,"def_m":13846,"crit":14921,"critDmg":14921,"critRes":8517,"critDmgRes":8517,"special":699.97,"dmgType":"phys","personality":""},
    "dimension_drone_g_10": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":10},"hp":127546300,"atk_p":10589,"atk_m":10589,"def_p":22946,"def_m":22946,"crit":24721,"critDmg":24721,"critRes":14117,"critDmgRes":14117,"special":1099.95,"dmgType":"phys","personality":""},
    "dimension_drone_g_13": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":13},"hp":348564554,"atk_p":17489,"atk_m":17489,"def_p":37896,"def_m":37896,"crit":40821,"critDmg":40821,"critRes":23317,"critDmgRes":23317,"special":1757.06,"dmgType":"phys","personality":""},
    "dimension_drone_g_16": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":16},"hp":800383871,"atk_p":26489,"atk_m":26489,"def_p":57396,"def_m":57396,"crit":61821,"critDmg":61821,"critRes":35317,"critDmgRes":35317,"special":2614.16,"dmgType":"phys","personality":""},
    "dimension_drone_g_19": {"name":"ドローンG型","content":{"type":"dimensionalClash","stage":19},"hp":4289320162,"atk_p":61289,"atk_m":61289,"def_p":132796,"def_m":132796,"crit":143021,"critDmg":143021,"critRes":81717,"critDmgRes":81717,"special":5928.28,"dmgType":"phys","personality":""},
    "dimension_drone_s_1": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":1},"hp":3971951,"atk_p":1889,"atk_m":1889,"def_p":4096,"def_m":4096,"crit":4421,"critDmg":4421,"critRes":2517,"critDmgRes":2517,"special":271.42,"dmgType":"phys","personality":""},
    "dimension_drone_s_4": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":4},"hp":15345483,"atk_p":3689,"atk_m":3689,"def_p":7996,"def_m":7996,"crit":8621,"critDmg":8621,"critRes":4917,"critDmgRes":4917,"special":442.84,"dmgType":"phys","personality":""},
    "dimension_drone_s_7": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":7},"hp":46290800,"atk_p":6389,"atk_m":6389,"def_p":13846,"def_m":13846,"crit":14921,"critDmg":14921,"critRes":8517,"critDmgRes":8517,"special":699.97,"dmgType":"phys","personality":""},
    "dimension_drone_s_10": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":10},"hp":127546300,"atk_p":10589,"atk_m":10589,"def_p":22946,"def_m":22946,"crit":24721,"critDmg":24721,"critRes":14117,"critDmgRes":14117,"special":1099.95,"dmgType":"phys","personality":""},
    "dimension_drone_s_13": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":13},"hp":348564554,"atk_p":17489,"atk_m":17489,"def_p":37896,"def_m":37896,"crit":40821,"critDmg":40821,"critRes":23317,"critDmgRes":23317,"special":1757.06,"dmgType":"phys","personality":""},
    "dimension_drone_s_16": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":16},"hp":800383871,"atk_p":26489,"atk_m":26489,"def_p":57396,"def_m":57396,"crit":61821,"critDmg":61821,"critRes":35317,"critDmgRes":35317,"special":2614.16,"dmgType":"phys","personality":""},
    "dimension_drone_s_19": {"name":"ドローンS型","content":{"type":"dimensionalClash","stage":19},"hp":4289320162,"atk_p":61289,"atk_m":61289,"def_p":132796,"def_m":132796,"crit":143021,"critDmg":143021,"critRes":81717,"critDmgRes":81717,"special":5928.28,"dmgType":"phys","personality":""},
    "dimension_drone_u_2": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":2},"hp":6940312,"atk_p":2907,"atk_m":2907,"def_p":5396,"def_m":5396,"crit":4577,"critDmg":4577,"critRes":3317,"critDmgRes":3317,"special":328.56,"dmgType":"phys","personality":""},
    "dimension_drone_u_5": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":5},"hp":20782293,"atk_p":5007,"atk_m":5007,"def_p":9296,"def_m":9296,"crit":7877,"critDmg":7877,"critRes":5717,"critDmgRes":5717,"special":499.98,"dmgType":"phys","personality":""},
    "dimension_drone_u_8": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":8},"hp":70682282,"atk_p":9207,"atk_m":9207,"def_p":17096,"def_m":17096,"crit":14477,"critDmg":14477,"critRes":10517,"critDmgRes":10517,"special":842.82,"dmgType":"phys","personality":""},
    "dimension_drone_u_11": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":11},"hp":166337068,"atk_p":14107,"atk_m":14107,"def_p":26196,"def_m":26196,"crit":22177,"critDmg":22177,"critRes":16117,"critDmgRes":16117,"special":1242.8,"dmgType":"phys","personality":""},
    "dimension_drone_u_14": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":14},"hp":450947731,"atk_p":23207,"atk_m":23207,"def_p":43096,"def_m":43096,"crit":36477,"critDmg":36477,"critRes":26517,"critDmgRes":26517,"special":1985.62,"dmgType":"phys","personality":""},
    "dimension_drone_u_17": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":17},"hp":1074589749,"atk_p":35807,"atk_m":35807,"def_p":66496,"def_m":66496,"crit":56277,"critDmg":56277,"critRes":40917,"critDmgRes":40917,"special":3014.14,"dmgType":"phys","personality":""},
    "dimension_drone_u_20": {"name":"ドローンU型","content":{"type":"dimensionalClash","stage":20},"hp":6336787566,"atk_p":86907,"atk_m":86907,"def_p":161396,"def_m":161396,"crit":136577,"critDmg":136577,"critRes":99317,"critDmgRes":99317,"special":7185.36,"dmgType":"phys","personality":""},
    "dimension_donseki_2": {"name":"ドン石","content":{"type":"dimensionalClash","stage":2},"hp":7981398,"atk_p":2489,"atk_m":2489,"def_p":7894,"def_m":5396,"crit":3317,"critDmg":3317,"critRes":3748,"critDmgRes":3748,"special":328.56,"dmgType":"phys","size":"large","personality":""},
    "dimension_donseki_5": {"name":"ドン石","content":{"type":"dimensionalClash","stage":5},"hp":23899703,"atk_p":4289,"atk_m":4289,"def_p":13594,"def_m":9296,"crit":5717,"critDmg":5717,"critRes":6448,"critDmgRes":6448,"special":499.98,"dmgType":"phys","size":"large","personality":""},
    "dimension_donseki_8": {"name":"ドン石","content":{"type":"dimensionalClash","stage":8},"hp":81284748,"atk_p":7889,"atk_m":7889,"def_p":24994,"def_m":17096,"crit":10517,"critDmg":10517,"critRes":11848,"critDmgRes":11848,"special":842.82,"dmgType":"phys","size":"large","personality":""},
    "dimension_donseki_11": {"name":"ドン石","content":{"type":"dimensionalClash","stage":11},"hp":191287817,"atk_p":12089,"atk_m":12089,"def_p":38294,"def_m":26196,"crit":16117,"critDmg":16117,"critRes":18148,"critDmgRes":18148,"special":1242.8,"dmgType":"phys","size":"large","personality":""},
    "dimension_donseki_14": {"name":"ドン石","content":{"type":"dimensionalClash","stage":14},"hp":518590202,"atk_p":19889,"atk_m":19889,"def_p":62994,"def_m":43096,"crit":26517,"critDmg":26517,"critRes":29848,"critDmgRes":29848,"special":1985.62,"dmgType":"phys","size":"large","personality":""},
    "dimension_donseki_17": {"name":"ドン石","content":{"type":"dimensionalClash","stage":17},"hp":1235778693,"atk_p":30689,"atk_m":30689,"def_p":97194,"def_m":66496,"crit":40917,"critDmg":40917,"critRes":46048,"critDmgRes":46048,"special":3014.14,"dmgType":"phys","size":"large","personality":""},
    "dimension_donseki_20": {"name":"ドン石","content":{"type":"dimensionalClash","stage":20},"hp":7287306871,"atk_p":74489,"atk_m":74489,"def_p":235894,"def_m":161396,"crit":99317,"critDmg":99317,"critRes":111748,"critDmgRes":111748,"special":7185.36,"dmgType":"phys","size":"large","personality":""},
    "dimension_nanikuma_2": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":2},"hp":9022413,"atk_p":2489,"atk_m":2489,"def_p":5396,"def_m":5396,"crit":3317,"critDmg":3317,"critRes":3748,"critDmgRes":3748,"special":328.56,"dmgType":"phys","personality":""},
    "dimension_nanikuma_5": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":5},"hp":27016993,"atk_p":4289,"atk_m":4289,"def_p":9296,"def_m":9296,"crit":5717,"critDmg":5717,"critRes":6448,"critDmgRes":6448,"special":499.98,"dmgType":"phys","personality":""},
    "dimension_nanikuma_8": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":8},"hp":91886989,"atk_p":7889,"atk_m":7889,"def_p":17096,"def_m":17096,"crit":10517,"critDmg":10517,"critRes":11848,"critDmgRes":11848,"special":842.82,"dmgType":"phys","personality":""},
    "dimension_nanikuma_11": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":11},"hp":216238223,"atk_p":12089,"atk_m":12089,"def_p":26196,"def_m":26196,"crit":16117,"critDmg":16117,"critRes":18148,"critDmgRes":18148,"special":1242.8,"dmgType":"phys","personality":""},
    "dimension_nanikuma_14": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":14},"hp":586232107,"atk_p":19889,"atk_m":19889,"def_p":43096,"def_m":43096,"crit":26517,"critDmg":26517,"critRes":29848,"critDmgRes":29848,"special":1985.62,"dmgType":"phys","personality":""},
    "dimension_nanikuma_17": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":17},"hp":1396966761,"atk_p":30689,"atk_m":30689,"def_p":66496,"def_m":66496,"crit":40917,"critDmg":40917,"critRes":46048,"critDmgRes":46048,"special":3014.14,"dmgType":"phys","personality":""},
    "dimension_nanikuma_20": {"name":"ナニクマ","content":{"type":"dimensionalClash","stage":20},"hp":8237824049,"atk_p":74489,"atk_m":74489,"def_p":161396,"def_m":161396,"crit":99317,"critDmg":99317,"critRes":111748,"critDmgRes":111748,"special":7185.36,"dmgType":"phys","personality":""},
    "dimension_nuuringu_2": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":2},"hp":9022413,"atk_p":2489,"atk_m":2489,"def_p":7894,"def_m":7894,"crit":3748,"critDmg":3748,"critRes":4577,"critDmgRes":4577,"special":328.56,"dmgType":"phys","personality":""},
    "dimension_nuuringu_5": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":5},"hp":27016993,"atk_p":4289,"atk_m":4289,"def_p":13594,"def_m":13594,"crit":6448,"critDmg":6448,"critRes":7877,"critDmgRes":7877,"special":499.98,"dmgType":"phys","personality":""},
    "dimension_nuuringu_8": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":8},"hp":91886989,"atk_p":7889,"atk_m":7889,"def_p":24994,"def_m":24994,"crit":11848,"critDmg":11848,"critRes":14477,"critDmgRes":14477,"special":842.82,"dmgType":"phys","personality":""},
    "dimension_nuuringu_11": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":11},"hp":216238223,"atk_p":12089,"atk_m":12089,"def_p":38294,"def_m":38294,"crit":18148,"critDmg":18148,"critRes":22177,"critDmgRes":22177,"special":1242.8,"dmgType":"phys","personality":""},
    "dimension_nuuringu_14": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":14},"hp":586232107,"atk_p":19889,"atk_m":19889,"def_p":62994,"def_m":62994,"crit":29848,"critDmg":29848,"critRes":36477,"critDmgRes":36477,"special":1985.62,"dmgType":"phys","personality":""},
    "dimension_nuuringu_17": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":17},"hp":1396966761,"atk_p":30689,"atk_m":30689,"def_p":97194,"def_m":97194,"crit":46048,"critDmg":46048,"critRes":56277,"critDmgRes":56277,"special":3014.14,"dmgType":"phys","personality":""},
    "dimension_nuuringu_20": {"name":"ヌウリング","content":{"type":"dimensionalClash","stage":20},"hp":8237824049,"atk_p":74489,"atk_m":74489,"def_p":235894,"def_m":235894,"crit":111748,"critDmg":111748,"critRes":136577,"critDmgRes":136577,"special":7185.36,"dmgType":"phys","personality":""},
    "dimension_nobiryu_1": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":1},"hp":3971951,"atk_p":2207,"atk_m":2207,"def_p":4096,"def_m":4096,"crit":3477,"critDmg":3477,"critRes":2517,"critDmgRes":2517,"special":271.42,"dmgType":"mag","personality":""},
    "dimension_nobiryu_4": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":4},"hp":15345483,"atk_p":4307,"atk_m":4307,"def_p":7996,"def_m":7996,"crit":6777,"critDmg":6777,"critRes":4917,"critDmgRes":4917,"special":442.84,"dmgType":"mag","personality":""},
    "dimension_nobiryu_7": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":7},"hp":46290800,"atk_p":7457,"atk_m":7457,"def_p":13846,"def_m":13846,"crit":11727,"critDmg":11727,"critRes":8517,"critDmgRes":8517,"special":699.97,"dmgType":"mag","personality":""},
    "dimension_nobiryu_10": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":10},"hp":127546300,"atk_p":12357,"atk_m":12357,"def_p":22946,"def_m":22946,"crit":19427,"critDmg":19427,"critRes":14117,"critDmgRes":14117,"special":1099.95,"dmgType":"mag","personality":""},
    "dimension_nobiryu_13": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":13},"hp":348564554,"atk_p":20407,"atk_m":20407,"def_p":37896,"def_m":37896,"crit":32077,"critDmg":32077,"critRes":23317,"critDmgRes":23317,"special":1757.06,"dmgType":"mag","personality":""},
    "dimension_nobiryu_16": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":16},"hp":800383871,"atk_p":30907,"atk_m":30907,"def_p":57396,"def_m":57396,"crit":48577,"critDmg":48577,"critRes":35317,"critDmgRes":35317,"special":2614.16,"dmgType":"mag","personality":""},
    "dimension_nobiryu_19": {"name":"ノビリュー","content":{"type":"dimensionalClash","stage":19},"hp":4289320162,"atk_p":71507,"atk_m":71507,"def_p":132796,"def_m":132796,"crit":112377,"critDmg":112377,"critRes":81717,"critDmgRes":81717,"special":5928.28,"dmgType":"mag","personality":""},
    "dimension_hattsumuri_2": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":2},"hp":7981398,"atk_p":2489,"atk_m":2489,"def_p":5396,"def_m":7894,"crit":3317,"critDmg":3317,"critRes":3748,"critDmgRes":3748,"special":328.56,"dmgType":"mag","size":"large","personality":""},
    "dimension_hattsumuri_5": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":5},"hp":23899703,"atk_p":4289,"atk_m":4289,"def_p":9296,"def_m":13594,"crit":5717,"critDmg":5717,"critRes":6448,"critDmgRes":6448,"special":499.98,"dmgType":"mag","size":"large","personality":""},
    "dimension_hattsumuri_8": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":8},"hp":81284748,"atk_p":7889,"atk_m":7889,"def_p":17096,"def_m":24994,"crit":10517,"critDmg":10517,"critRes":11848,"critDmgRes":11848,"special":842.82,"dmgType":"mag","size":"large","personality":""},
    "dimension_hattsumuri_11": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":11},"hp":191287817,"atk_p":12089,"atk_m":12089,"def_p":26196,"def_m":38294,"crit":16117,"critDmg":16117,"critRes":18148,"critDmgRes":18148,"special":1242.8,"dmgType":"mag","size":"large","personality":""},
    "dimension_hattsumuri_14": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":14},"hp":518590202,"atk_p":19889,"atk_m":19889,"def_p":43096,"def_m":62994,"crit":26517,"critDmg":26517,"critRes":29848,"critDmgRes":29848,"special":1985.62,"dmgType":"mag","size":"large","personality":""},
    "dimension_hattsumuri_17": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":17},"hp":1235778693,"atk_p":30689,"atk_m":30689,"def_p":66496,"def_m":97194,"crit":40917,"critDmg":40917,"critRes":46048,"critDmgRes":46048,"special":3014.14,"dmgType":"mag","size":"large","personality":""},
    "dimension_hattsumuri_20": {"name":"ハットツムリ","content":{"type":"dimensionalClash","stage":20},"hp":7287306871,"atk_p":74489,"atk_m":74489,"def_p":161396,"def_m":235894,"crit":99317,"critDmg":99317,"critRes":111748,"critDmgRes":111748,"special":7185.36,"dmgType":"mag","size":"large","personality":""},
    "dimension_ruparu_1": {"name":"ルパル","content":{"type":"dimensionalClash","stage":1},"hp":3971951,"atk_p":2207,"atk_m":2207,"def_p":4096,"def_m":4096,"crit":3477,"critDmg":3477,"critRes":2517,"critDmgRes":2517,"special":271.42,"dmgType":"mag","personality":""},
    "dimension_ruparu_4": {"name":"ルパル","content":{"type":"dimensionalClash","stage":4},"hp":15345483,"atk_p":4307,"atk_m":4307,"def_p":7996,"def_m":7996,"crit":6777,"critDmg":6777,"critRes":4917,"critDmgRes":4917,"special":442.84,"dmgType":"mag","personality":""},
    "dimension_ruparu_7": {"name":"ルパル","content":{"type":"dimensionalClash","stage":7},"hp":46290800,"atk_p":7457,"atk_m":7457,"def_p":13846,"def_m":13846,"crit":11727,"critDmg":11727,"critRes":8517,"critDmgRes":8517,"special":699.97,"dmgType":"mag","personality":""},
    "dimension_ruparu_10": {"name":"ルパル","content":{"type":"dimensionalClash","stage":10},"hp":127546300,"atk_p":12357,"atk_m":12357,"def_p":22946,"def_m":22946,"crit":19427,"critDmg":19427,"critRes":14117,"critDmgRes":14117,"special":1099.95,"dmgType":"mag","personality":""},
    "dimension_ruparu_13": {"name":"ルパル","content":{"type":"dimensionalClash","stage":13},"hp":348564554,"atk_p":20407,"atk_m":20407,"def_p":37896,"def_m":37896,"crit":32077,"critDmg":32077,"critRes":23317,"critDmgRes":23317,"special":1757.06,"dmgType":"mag","personality":""},
    "dimension_ruparu_16": {"name":"ルパル","content":{"type":"dimensionalClash","stage":16},"hp":800383871,"atk_p":30907,"atk_m":30907,"def_p":57396,"def_m":57396,"crit":48577,"critDmg":48577,"critRes":35317,"critDmgRes":35317,"special":2614.16,"dmgType":"mag","personality":""},
    "dimension_ruparu_19": {"name":"ルパル","content":{"type":"dimensionalClash","stage":19},"hp":4289320162,"atk_p":71507,"atk_m":71507,"def_p":132796,"def_m":132796,"crit":112377,"critDmg":112377,"critRes":81717,"critDmgRes":81717,"special":5928.28,"dmgType":"mag","personality":""},
    "dimension_hitokuchigusa_2": {"name":"一口草","content":{"type":"dimensionalClash","stage":2},"hp":9022413,"atk_p":2489,"atk_m":2489,"def_p":7894,"def_m":7894,"crit":3748,"critDmg":3748,"critRes":4577,"critDmgRes":4577,"special":328.56,"dmgType":"phys","personality":""},
    "dimension_hitokuchigusa_5": {"name":"一口草","content":{"type":"dimensionalClash","stage":5},"hp":27016993,"atk_p":4289,"atk_m":4289,"def_p":13594,"def_m":13594,"crit":6448,"critDmg":6448,"critRes":7877,"critDmgRes":7877,"special":499.98,"dmgType":"phys","personality":""},
    "dimension_hitokuchigusa_8": {"name":"一口草","content":{"type":"dimensionalClash","stage":8},"hp":91886989,"atk_p":7889,"atk_m":7889,"def_p":24994,"def_m":24994,"crit":11848,"critDmg":11848,"critRes":14477,"critDmgRes":14477,"special":842.82,"dmgType":"phys","personality":""},
    "dimension_hitokuchigusa_11": {"name":"一口草","content":{"type":"dimensionalClash","stage":11},"hp":216238223,"atk_p":12089,"atk_m":12089,"def_p":38294,"def_m":38294,"crit":18148,"critDmg":18148,"critRes":22177,"critDmgRes":22177,"special":1242.8,"dmgType":"phys","personality":""},
    "dimension_hitokuchigusa_14": {"name":"一口草","content":{"type":"dimensionalClash","stage":14},"hp":586232107,"atk_p":19889,"atk_m":19889,"def_p":62994,"def_m":62994,"crit":29848,"critDmg":29848,"critRes":36477,"critDmgRes":36477,"special":1985.62,"dmgType":"phys","personality":""},
    "dimension_hitokuchigusa_17": {"name":"一口草","content":{"type":"dimensionalClash","stage":17},"hp":1396966761,"atk_p":30689,"atk_m":30689,"def_p":97194,"def_m":97194,"crit":46048,"critDmg":46048,"critRes":56277,"critDmgRes":56277,"special":3014.14,"dmgType":"phys","personality":""},
    "dimension_hitokuchigusa_20": {"name":"一口草","content":{"type":"dimensionalClash","stage":20},"hp":8237824049,"atk_p":74489,"atk_m":74489,"def_p":235894,"def_m":235894,"crit":111748,"critDmg":111748,"critRes":136577,"critDmgRes":136577,"special":7185.36,"dmgType":"phys","personality":""},
    "dimension_yureifuton_2": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":2},"hp":13880625,"atk_p":2489,"atk_m":2489,"def_p":0,"def_m":0,"crit":3748,"critDmg":3748,"critRes":3748,"critDmgRes":0,"special":328.56,"dmgType":"phys","personality":""},
    "dimension_yureifuton_5": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":5},"hp":41564586,"atk_p":4289,"atk_m":4289,"def_p":0,"def_m":0,"crit":6448,"critDmg":6448,"critRes":6448,"critDmgRes":0,"special":499.98,"dmgType":"phys","personality":""},
    "dimension_yureifuton_8": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":8},"hp":141364565,"atk_p":7889,"atk_m":7889,"def_p":0,"def_m":0,"crit":11848,"critDmg":11848,"critRes":11848,"critDmgRes":0,"special":842.82,"dmgType":"phys","personality":""},
    "dimension_yureifuton_11": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":11},"hp":332674136,"atk_p":12089,"atk_m":12089,"def_p":0,"def_m":0,"crit":18148,"critDmg":18148,"critRes":18148,"critDmgRes":0,"special":1242.8,"dmgType":"phys","personality":""},
    "dimension_yureifuton_14": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":14},"hp":901895462,"atk_p":19889,"atk_m":19889,"def_p":0,"def_m":0,"crit":29848,"critDmg":29848,"critRes":29848,"critDmgRes":0,"special":1985.62,"dmgType":"phys","personality":""},
    "dimension_yureifuton_17": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":17},"hp":2149179498,"atk_p":30689,"atk_m":30689,"def_p":0,"def_m":0,"crit":46048,"critDmg":46048,"critRes":46048,"critDmgRes":0,"special":3014.14,"dmgType":"phys","personality":""},
    "dimension_yureifuton_20": {"name":"幽霊布団","content":{"type":"dimensionalClash","stage":20},"hp":12673575132,"atk_p":74489,"atk_m":74489,"def_p":0,"def_m":0,"crit":111748,"critDmg":111748,"critRes":111748,"critDmgRes":0,"special":7185.36,"dmgType":"phys","personality":""},
    "dummy_enemy": {"name":"[E] Dummy","hp":1000000,"atk_p":30000,"atk_m":30000,"def_p":60000,"def_m":60000,"crit":25000,"critDmg":25000,"critRes":20000,"critDmgRes":20000,"special":100,"dmgType":"phys","hideInSelection":true}
};
const ENEMY_PRESET_SKILL_SETS = {"ef_meow_11":"set1","ef_meow_12":"set1","ef_meow_21":"set1","ef_meow_22":"set1","ef_meow_31":"set1","ef_meow_32":"set1","ef_meow_41":"set1","ef_meow_42":"set1","ef_r41renewa_11":"set2","ef_r41renewa_12":"set2","ef_r41renewa_21":"set2","ef_r41renewa_22":"set2","ef_r41renewa_31":"set2","ef_r41renewa_32":"set2","ef_r41renewa_41":"set2","ef_r41renewa_42":"set2","ef_r41renewa_51":"set2","ef_r41renewa_52":"set2","ef_isamureyon_11":"set3","ef_isamureyon_12":"set3","ef_isamureyon_21":"set3","ef_isamureyon_22":"set3","ef_isamureyon_31":"set3","ef_isamureyon_32":"set3","ef_isamureyon_41":"set3","ef_isamureyon_42":"set3","GTA_24":"set4","dimension_l1ly_3":"set5","dimension_l1ly_6":"set5","dimension_l1ly_9":"set5","dimension_l1ly_12":"set5","dimension_l1ly_15":"set5","dimension_l1ly_18":"set5","dimension_l1ly_21":"set5","dimension_cerberus_3":"set6","dimension_cerberus_6":"set6","dimension_cerberus_9":"set6","dimension_cerberus_12":"set6","dimension_cerberus_15":"set6","dimension_cerberus_18":"set6","dimension_cerberus_21":"set6","dimension_isamureyon_3":"set7","dimension_isamureyon_6":"set7","dimension_isamureyon_9":"set7","dimension_isamureyon_12":"set7","dimension_isamureyon_15":"set7","dimension_isamureyon_18":"set7","dimension_isamureyon_21":"set7","dimension_kimoguri_1":"set8","dimension_kimoguri_4":"set8","dimension_kimoguri_7":"set8","dimension_kimoguri_10":"set8","dimension_kimoguri_13":"set8","dimension_kimoguri_16":"set8","dimension_kimoguri_19":"set8","dimension_saraiguma_1":"set9","dimension_saraiguma_4":"set9","dimension_saraiguma_7":"set9","dimension_saraiguma_10":"set9","dimension_saraiguma_13":"set9","dimension_saraiguma_16":"set9","dimension_saraiguma_19":"set9","dimension_drone_g_1":"set10","dimension_drone_g_4":"set10","dimension_drone_g_7":"set10","dimension_drone_g_10":"set10","dimension_drone_g_13":"set10","dimension_drone_g_16":"set10","dimension_drone_g_19":"set10","dimension_drone_s_1":"set11","dimension_drone_s_4":"set11","dimension_drone_s_7":"set11","dimension_drone_s_10":"set11","dimension_drone_s_13":"set11","dimension_drone_s_16":"set11","dimension_drone_s_19":"set11","dimension_drone_u_2":"set12","dimension_drone_u_5":"set12","dimension_drone_u_8":"set12","dimension_drone_u_11":"set12","dimension_drone_u_14":"set12","dimension_drone_u_17":"set12","dimension_drone_u_20":"set12","dimension_donseki_2":"set13","dimension_donseki_5":"set13","dimension_donseki_8":"set13","dimension_donseki_11":"set13","dimension_donseki_14":"set13","dimension_donseki_17":"set13","dimension_donseki_20":"set13","dimension_nanikuma_2":"set14","dimension_nanikuma_5":"set14","dimension_nanikuma_8":"set14","dimension_nanikuma_11":"set14","dimension_nanikuma_14":"set14","dimension_nanikuma_17":"set14","dimension_nanikuma_20":"set14","dimension_nuuringu_2":"set15","dimension_nuuringu_5":"set15","dimension_nuuringu_8":"set15","dimension_nuuringu_11":"set15","dimension_nuuringu_14":"set15","dimension_nuuringu_17":"set15","dimension_nuuringu_20":"set15","dimension_nobiryu_1":"set16","dimension_nobiryu_4":"set16","dimension_nobiryu_7":"set16","dimension_nobiryu_10":"set16","dimension_nobiryu_13":"set16","dimension_nobiryu_16":"set16","dimension_nobiryu_19":"set16","dimension_hattsumuri_2":"set17","dimension_hattsumuri_5":"set17","dimension_hattsumuri_8":"set17","dimension_hattsumuri_11":"set17","dimension_hattsumuri_14":"set17","dimension_hattsumuri_17":"set17","dimension_hattsumuri_20":"set17","dimension_ruparu_1":"set18","dimension_ruparu_4":"set18","dimension_ruparu_7":"set18","dimension_ruparu_10":"set18","dimension_ruparu_13":"set18","dimension_ruparu_16":"set18","dimension_ruparu_19":"set18","dimension_hitokuchigusa_2":"set19","dimension_hitokuchigusa_5":"set19","dimension_hitokuchigusa_8":"set19","dimension_hitokuchigusa_11":"set19","dimension_hitokuchigusa_14":"set19","dimension_hitokuchigusa_17":"set19","dimension_hitokuchigusa_20":"set19","dimension_yureifuton_2":"set20","dimension_yureifuton_5":"set20","dimension_yureifuton_8":"set20","dimension_yureifuton_11":"set20","dimension_yureifuton_14":"set20","dimension_yureifuton_17":"set20","dimension_yureifuton_20":"set20","dummy_enemy":"set21"};
for (const [key, group] of Object.entries(ENEMY_PRESET_SKILL_SETS)) ENEMY_PRESETS[key].skills = ENEMY_SKILL_SETS[group];
const ENEMY_PRESET_KEY_ALIASES = Object.freeze({"ef_isamurayon_11":"ef_isamureyon_11","ef_isamurayon_12":"ef_isamureyon_12","ef_isamurayon_21":"ef_isamureyon_21","ef_isamurayon_22":"ef_isamureyon_22","ef_isamurayon_31":"ef_isamureyon_31","ef_isamurayon_32":"ef_isamureyon_32","ef_isamurayon_41":"ef_isamureyon_41","ef_isamurayon_42":"ef_isamureyon_42","dimension_Isamurayon_3":"dimension_isamureyon_3","dimension_Isamurayon_6":"dimension_isamureyon_6","dimension_Isamurayon_9":"dimension_isamureyon_9","dimension_Isamurayon_12":"dimension_isamureyon_12","dimension_Isamurayon_15":"dimension_isamureyon_15","dimension_Isamurayon_18":"dimension_isamureyon_18","dimension_Isamurayon_21":"dimension_isamureyon_21","dimension_キモグリ_1":"dimension_kimoguri_1","dimension_キモグリ_4":"dimension_kimoguri_4","dimension_キモグリ_7":"dimension_kimoguri_7","dimension_キモグリ_10":"dimension_kimoguri_10","dimension_キモグリ_13":"dimension_kimoguri_13","dimension_キモグリ_16":"dimension_kimoguri_16","dimension_キモグリ_19":"dimension_kimoguri_19","dimension_サライグマ_1":"dimension_saraiguma_1","dimension_サライグマ_4":"dimension_saraiguma_4","dimension_サライグマ_7":"dimension_saraiguma_7","dimension_サライグマ_10":"dimension_saraiguma_10","dimension_サライグマ_13":"dimension_saraiguma_13","saraiguma_d_16":"dimension_saraiguma_16","saraiguma_d_19":"dimension_saraiguma_19","dimension_ドローンG型_1":"dimension_drone_g_1","dimension_ドローンG型_4":"dimension_drone_g_4","dimension_ドローンG型_7":"dimension_drone_g_7","dimension_ドローンG型_10":"dimension_drone_g_10","dimension_ドローンG型_13":"dimension_drone_g_13","dimension_ドローンG型_16":"dimension_drone_g_16","dimension_ドローンG型_19":"dimension_drone_g_19","dimension_ドローンS型_1":"dimension_drone_s_1","dimension_ドローンS型_4":"dimension_drone_s_4","dimension_ドローンS型_7":"dimension_drone_s_7","dimension_ドローンS型_10":"dimension_drone_s_10","dimension_ドローンS型_13":"dimension_drone_s_13","dimension_ドローンS型_16":"dimension_drone_s_16","dimension_ドローンS型_19":"dimension_drone_s_19","dimension_ドローンU型_2":"dimension_drone_u_2","dimension_ドローンU型_5":"dimension_drone_u_5","dimension_ドローンU型_8":"dimension_drone_u_8","dimension_ドローンU型_11":"dimension_drone_u_11","dimension_ドローンU型_14":"dimension_drone_u_14","dimension_ドローンU型_17":"dimension_drone_u_17","dimension_ドローンU型_20":"dimension_drone_u_20","dimension_ドン石_2":"dimension_donseki_2","dimension_ドン石_5":"dimension_donseki_5","dimension_ドン石_8":"dimension_donseki_8","dimension_ドン石_11":"dimension_donseki_11","dimension_ドン石_14":"dimension_donseki_14","dimension_ドン石_17":"dimension_donseki_17","dimension_ドン石_20":"dimension_donseki_20","dimension_ナニクマ_2":"dimension_nanikuma_2","dimension_ナニクマ_5":"dimension_nanikuma_5","dimension_ナニクマ_8":"dimension_nanikuma_8","dimension_ナニクマ_11":"dimension_nanikuma_11","dimension_ナニクマ_14":"dimension_nanikuma_14","dimension_ナニクマ_17":"dimension_nanikuma_17","dimension_ナニクマ_20":"dimension_nanikuma_20","dimension_ヌウリング_2":"dimension_nuuringu_2","dimension_ヌウリング_5":"dimension_nuuringu_5","dimension_ヌウリング_8":"dimension_nuuringu_8","dimension_ヌウリング_11":"dimension_nuuringu_11","dimension_ヌウリング_14":"dimension_nuuringu_14","dimension_ヌウリング_17":"dimension_nuuringu_17","dimension_ヌウリング_20":"dimension_nuuringu_20","dimension_ノビリュー_1":"dimension_nobiryu_1","dimension_ノビリュー_4":"dimension_nobiryu_4","dimension_ノビリュー_7":"dimension_nobiryu_7","dimension_ノビリュー_10":"dimension_nobiryu_10","dimension_ノビリュー_13":"dimension_nobiryu_13","dimension_ノビリュー_16":"dimension_nobiryu_16","dimension_ノビリュー_19":"dimension_nobiryu_19","dimension_ハットツムリ_2":"dimension_hattsumuri_2","dimension_ハットツムリ_5":"dimension_hattsumuri_5","dimension_ハットツムリ_8":"dimension_hattsumuri_8","dimension_ハットツムリ_11":"dimension_hattsumuri_11","dimension_ハットツムリ_14":"dimension_hattsumuri_14","hattsumuri_d_17":"dimension_hattsumuri_17","hattsumuri_d_20":"dimension_hattsumuri_20","dimension_ルパル_1":"dimension_ruparu_1","dimension_ルパル_4":"dimension_ruparu_4","dimension_ルパル_7":"dimension_ruparu_7","dimension_ルパル_10":"dimension_ruparu_10","dimension_ルパル_13":"dimension_ruparu_13","dimension_ルパル_16":"dimension_ruparu_16","dimension_ルパル_19":"dimension_ruparu_19","dimension_一口草_2":"dimension_hitokuchigusa_2","dimension_一口草_5":"dimension_hitokuchigusa_5","dimension_一口草_8":"dimension_hitokuchigusa_8","dimension_一口草_11":"dimension_hitokuchigusa_11","dimension_一口草_14":"dimension_hitokuchigusa_14","dimension_一口草_17":"dimension_hitokuchigusa_17","dimension_一口草_20":"dimension_hitokuchigusa_20","dimension_幽霊布団_2":"dimension_yureifuton_2","dimension_幽霊布団_5":"dimension_yureifuton_5","dimension_幽霊布団_8":"dimension_yureifuton_8","dimension_幽霊布団_11":"dimension_yureifuton_11","dimension_幽霊布団_14":"dimension_yureifuton_14","dimension_幽霊布団_17":"dimension_yureifuton_17","dimension_幽霊布団_20":"dimension_yureifuton_20","lily_d_15":"dimension_l1ly_15","lily_d_18":"dimension_l1ly_18","lily_vivacious_d_18":"dimension_l1ly_18","lily_vivacious_d_21":"dimension_l1ly_21","Kérberos_d_15":"dimension_cerberus_15","Kérberos_d_18":"dimension_cerberus_18","Isamurayon_d_15":"dimension_isamureyon_15","Isamurayon_d_18":"dimension_isamureyon_18","meow_ef_11":"ef_meow_11","meow_ef_12":"ef_meow_12","meow_ef_21":"ef_meow_21","meow_ef_22":"ef_meow_22","meow_ef_31":"ef_meow_31","meow_ef_32":"ef_meow_32","meow_ef_41":"ef_meow_41","meow_ef_42":"ef_meow_42","R41Renewa_ef_31":"ef_r41renewa_31","R41Renewa_ef_32":"ef_r41renewa_32","R41Renewa_ef_41":"ef_r41renewa_41","R41Renewa_ef_42":"ef_r41renewa_42","Isamurayon_ef_41":"ef_isamureyon_41","Isamurayon_ef_42":"ef_isamureyon_42","R41Renewa_ef_11":"ef_r41renewa_11","R41Renewa_ef_12":"ef_r41renewa_12","R41Renewa_ef_21":"ef_r41renewa_21","R41Renewa_ef_22":"ef_r41renewa_22","R41Renewa_ef_51":"ef_r41renewa_51","R41Renewa_ef_52":"ef_r41renewa_52","Isamurayon_ef_11":"ef_isamureyon_11","Isamurayon_ef_12":"ef_isamureyon_12","Isamurayon_ef_21":"ef_isamureyon_21","Isamurayon_ef_22":"ef_isamureyon_22","Isamurayon_ef_31":"ef_isamureyon_31","Isamurayon_ef_32":"ef_isamureyon_32","Kérberos_d_21":"dimension_cerberus_21","Isamurayon_d_21":"dimension_isamureyon_21","dimension_リリ一_3":"dimension_l1ly_3","dimension_ケルベロス_3":"dimension_cerberus_3","dimension_イサムレヨン_3":"dimension_isamureyon_3","dimension_リリ一_6":"dimension_l1ly_6","dimension_ケルベロス_6":"dimension_cerberus_6","dimension_イサムレヨン_6":"dimension_isamureyon_6","dimension_リリ一_9":"dimension_l1ly_9","dimension_ケルベロス_9":"dimension_cerberus_9","dimension_イサムレヨン_9":"dimension_isamureyon_9","dimension_リリ一_12":"dimension_l1ly_12","dimension_ケルベロス_12":"dimension_cerberus_12","dimension_イサムレヨン_12":"dimension_isamureyon_12"});
function resolveEnemyPresetKey(key) { return Object.prototype.hasOwnProperty.call(ENEMY_PRESET_KEY_ALIASES,key) ? ENEMY_PRESET_KEY_ALIASES[key] : typeof key === "string" ? key : ""; }
for (const [oldKey,key] of Object.entries(ENEMY_PRESET_KEY_ALIASES)) Object.defineProperty(ENEMY_PRESETS,oldKey,{value:ENEMY_PRESETS[key],enumerable:false});
const ENEMY_DAMAGE_TYPE_DEFAULTS = Object.freeze({
    "キモグリ": "phys",
    "ルパル": "mag",
    "ノビリュー": "mag",
    "ドローンG型": "phys",
    "ドローンS型": "phys",
    "ナニクマ": "phys",
    "一口草": "phys",
    "ドン石": "phys",
    "幽霊布団": "phys",
    "ヌウリング": "phys",
    "ドローンU型": "phys"
});
for (const preset of Object.values(ENEMY_PRESETS)) {
    if (preset.content?.type !== "dimensionalClash" || preset.dmgType === "phys" || preset.dmgType === "mag") continue;
    const damageType = ENEMY_DAMAGE_TYPE_DEFAULTS[preset.name];
    if (damageType) preset.dmgType = damageType;
}
                                                                               
ENEMY_PRESETS.dummy_enemy.hideInSelection = true;
