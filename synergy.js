// Trickcal synergy data.
// Counts are party member counts. Values are percentages unless noted otherwise.

const PERSONALITY_SYNERGIES = [
    {
        id: "pure",
        name: "純粋",
        icon: "img/性格_純粋.webp",
        effectsByCount: {
            2: { hpP: 6, addP: 6 },
            4: { hpP: 28, addP: 28 },
            6: { hpP: 66, addP: 66 },
            7: { hpP: 91, addP: 91 },
            8: { hpP: 120, addP: 120 },
            9: { hpP: 153, addP: 153 },
            10: { hpP: 190, addP: 190 },
            11: { hpP: 231, addP: 231 }
        }
    },
    {
        id: "cool",
        name: "冷静",
        icon: "img/性格_冷静.webp",
        effectsByCount: {
            2: { hpP: 6, addP: 6 },
            4: { hpP: 28, addP: 28 },
            6: { hpP: 66, addP: 66 },
            7: { hpP: 91, addP: 91 },
            8: { hpP: 120, addP: 120 },
            9: { hpP: 153, addP: 153 },
            10: { hpP: 190, addP: 190 },
            11: { hpP: 231, addP: 231 }
        }
    },
    {
        id: "mad",
        name: "狂気",
        icon: "img/性格_狂気.webp",
        effectsByCount: {
            2: { hpP: 6, addP: 6 },
            4: { hpP: 28, addP: 28 },
            6: { hpP: 66, addP: 66 },
            7: { hpP: 91, addP: 91 },
            8: { hpP: 120, addP: 120 },
            9: { hpP: 153, addP: 153 },
            10: { hpP: 190, addP: 190 },
            11: { hpP: 231, addP: 231 }
        }
    },
    {
        id: "active",
        name: "活発",
        icon: "img/性格_活発.webp",
        effectsByCount: {
            2: { hpP: 6, addP: 6 },
            4: { hpP: 28, addP: 28 },
            6: { hpP: 66, addP: 66 },
            7: { hpP: 91, addP: 91 },
            8: { hpP: 120, addP: 120 },
            9: { hpP: 153, addP: 153 },
            10: { hpP: 190, addP: 190 },
            11: { hpP: 231, addP: 231 }
        }
    },
    {
        id: "melancholy",
        name: "憂鬱",
        icon: "img/性格_憂鬱.webp",
        effectsByCount: {
            2: { hpP: 6, addP: 6 },
            4: { hpP: 28, addP: 28 },
            6: { hpP: 66, addP: 66 },
            7: { hpP: 91, addP: 91 },
            8: { hpP: 120, addP: 120 },
            9: { hpP: 153, addP: 153 },
            10: { hpP: 190, addP: 190 },
            11: { hpP: 231, addP: 231 }
        }
    }
];

const RACE_SYNERGIES = [
    {
        id: "dragon",
        name: "竜族",
        icon: "img/種族_竜族.webp",
        effectsByCount: {
            2: { critRateTakenDownP: 3, critDmgTakenDownP: 6 },
            3: { critRateTakenDownP: 4.5, critDmgTakenDownP: 9 },
            4: { critRateTakenDownP: 6, critDmgTakenDownP: 12 },
            5: { critRateTakenDownP: 7.5, critDmgTakenDownP: 15 },
            6: { critRateTakenDownP: 9, critDmgTakenDownP: 18 }
        }
    },
    {
        id: "elf",
        name: "エルフ",
        icon: "img/種族_エルフ.webp",
        effectsByCount: {
            2: { hasteP: 2 },
            3: { hasteP: 3 },
            4: { hasteP: 4 },
            5: { hasteP: 5 },
            6: { hasteP: 6 }
        }
    },
    {
        id: "fairy",
        name: "妖精",
        icon: "img/種族_妖精.webp",
        effectsByCount: {
            2: { skillAddP: 3 },
            3: { skillAddP: 4.5 },
            4: { skillAddP: 6 },
            5: { skillAddP: 7.5 },
            6: { skillAddP: 9 }
        }
    },
    {
        id: "beast",
        name: "獣人",
        icon: "img/種族_獣人.webp",
        effectsByCount: {
            2: { hpP: 2, basicAddP: 2 },
            3: { hpP: 3, basicAddP: 3 },
            4: { hpP: 4, basicAddP: 4 },
            5: { hpP: 5, basicAddP: 5 },
            6: { hpP: 6, basicAddP: 6 }
        }
    },
    {
        id: "ghost",
        name: "幽霊",
        icon: "img/種族_幽霊.webp",
        effectsByCount: {
            2: { damageTakenDownP: 2 },
            3: { damageTakenDownP: 3 },
            4: { damageTakenDownP: 4 },
            5: { damageTakenDownP: 5 },
            6: { damageTakenDownP: 6 }
        }
    },
    {
        id: "spirit",
        name: "精霊",
        icon: "img/種族_精霊.webp",
        effectsByCount: {
            2: { spRecoveryP: 2, hpRecoveryP: 2 },
            3: { spRecoveryP: 3, hpRecoveryP: 3 },
            4: { spRecoveryP: 4, hpRecoveryP: 4 },
            5: { spRecoveryP: 5, hpRecoveryP: 5 },
            6: { spRecoveryP: 6, hpRecoveryP: 6 }
        }
    },
    {
        id: "witch",
        name: "魔女",
        icon: "img/種族_魔女.webp",
        effectsByCount: {
            2: { critRateP: 3, critDmgP: 3 },
            3: { critRateP: 4.5, critDmgP: 4.5 },
            4: { critRateP: 6, critDmgP: 6 },
            5: { critRateP: 7.5, critDmgP: 7.5 },
            6: { critRateP: 9, critDmgP: 9 }
        }
    },
    {
        id: "unknown",
        name: "？？？",
        icon: "img/種族_？？？.webp",
        effectsByCount: {
            1: { atkP: 2 }
        }
    }
];

window.PERSONALITY_SYNERGIES = PERSONALITY_SYNERGIES;
window.RACE_SYNERGIES = RACE_SYNERGIES;
