#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.join(__dirname, '..');
const DEFAULT_OUTPUT = path.join(__dirname, 'fixtures', 'max-growth-verification-state.json');
const EXPORT_SCHEMA = 'trickcal-stat-state';
const EXPORT_VERSION = 2;
const VERIFICATION_SLOT = 6;
const FIXTURE_NAME = 'Codex表示検証用・全育成最大';

function readGeneratedStatData(root = ROOT) {
  const context = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'statData.js'), 'utf8'),
    context,
    { filename: 'statData.js' }
  );
  const data = context.window.TRICKCAL_STAT_DATA;
  if (!data?.sheets?.basicInfo?.length || typeof data.getById !== 'function') {
    throw new Error('statData.jsからTRICKCAL_STAT_DATAを読み込めませんでした');
  }
  return data;
}

function readGeneratedCards(root = ROOT) {
  const context = {};
  const source = `${fs.readFileSync(path.join(root, 'cards.js'), 'utf8')}\nthis.__cardLibrary = CARD_LIBRARY;`;
  vm.runInNewContext(source, context, { filename: 'cards.js' });
  const library = context.__cardLibrary;
  if (!library?.artifacts?.length || !library?.spells?.length) {
    throw new Error('cards.jsからCARD_LIBRARYを読み込めませんでした');
  }
  return library;
}

function readPublicReleaseConfig(root = ROOT) {
  const context = { window: {} };
  vm.runInNewContext(
    fs.readFileSync(path.join(root, 'public-release-config.js'), 'utf8'),
    context,
    { filename: 'public-release-config.js' }
  );
  const release = context.window.TRICKCAL_PUBLIC_RELEASE;
  if (typeof release?.isAsideEnabled !== 'function') {
    throw new Error('public-release-config.jsから公開判定を読み込めませんでした');
  }
  return release;
}

function boardKey(row) {
  return `${row.ボード階層}:${row.X_pos}:${row.Y_pos}`;
}

function createBoardState(rows) {
  const boards = {};
  (rows || []).forEach(row => {
    const layer = String(row.ボード階層);
    if (!boards[layer]) boards[layer] = { filled: {}, targets: [] };
    // スタートマスは状態へ保存せず、アプリ側の既存ルールで常時有効にする。
    if (row.マス_type !== 'スタート') boards[layer].filled[boardKey(row)] = true;
  });
  return boards;
}

function getAvailableEquipmentKeys(equipment) {
  return Object.keys(equipment || {})
    .filter(key => key.startsWith('Equip_Rank9_') && Number(equipment[key]) > 0)
    .map(key => key.slice('Equip_Rank9_'.length));
}

function hasAsideData(data, id) {
  return !!data.getById('asideTiers', id)
    && ((data.getById('asideStatEffects', id) || []).length > 0
      || (data.getById('asideSpecialEffects', id) || []).length > 0);
}

function createMaxApostleState(basic, data, release) {
  const id = basic.id;
  const rarity = Number(basic.レア度) || 1;
  const asideEnabled = release.isAsideEnabled(id) && hasAsideData(data, id);
  const asideRank = asideEnabled ? 3 : 0;
  const equipment = data.getById('equipment', id);

  return {
    rank: 9,
    level: 145,
    star: 5,
    grade: 6,
    gradeConfigured: true,
    bond: rarity === 1 ? 1 : 30,
    asideRank,
    asideLevel: asideRank ? 50 : 0,
    skillLevels: {
      low: asideRank ? 15 : 12,
      high: asideRank ? 15 : 12,
      passive: asideRank ? 15 : 12
    },
    // フォローは育成値ではなく、表示・計算条件として手動で切り替える項目にする。
    follow: false,
    equipment: Object.fromEntries(
      getAvailableEquipmentKeys(equipment).map(key => [key, { enabled: true, enhance: 5 }])
    ),
    boards: createBoardState(data.getById('board', id)),
    statSnapshots: {}
  };
}

function createDefaultFormation() {
  const emptyRow = () => ({
    apostles: ['', '', ''],
    artifacts: [['', '', ''], ['', '', ''], ['', '', '']]
  });
  return {
    cardKind: 'artifact',
    rows: [emptyRow(), emptyRow(), emptyRow()],
    spells: [],
    masterPowers: [],
    coins: 0,
    coinMode: 'manual'
  };
}

function createMaxGrowthPayload(options = {}) {
  const root = options.root || ROOT;
  const data = options.data || readGeneratedStatData(root);
  const cards = options.cards || readGeneratedCards(root);
  const release = options.release || readPublicReleaseConfig(root);
  const basicInfo = data.sheets.basicInfo || [];
  const preferredActiveId = options.activeId || 'Momo';
  const activeBasic = basicInfo.find(row => row.id === preferredActiveId) || basicInfo[0];
  const savedAt = String(options.savedAt || data.generatedAt || '2000-01-01T00:00:00.000Z');
  const apostles = Object.fromEntries(
    basicInfo.map(basic => [basic.id, createMaxApostleState(basic, data, release)])
  );
  const cardList = [...(cards.artifacts || []), ...(cards.spells || [])];
  const cardStates = Object.fromEntries(
    cardList.map(card => [card.id, { owned: true, star: 5, solder: 2 }])
  );

  const snapshot = {
    savedAt,
    slotName: FIXTURE_NAME,
    apostleName: activeBasic?.使徒名 || activeBasic?.id || '',
    activeId: activeBasic?.id || '',
    activeStateSlot: VERIFICATION_SLOT,
    apostles,
    comparisonStats: { v: 1, a: {} },
    research: { level: 10, progress: 45 },
    cards: cardStates,
    formation: createDefaultFormation(),
    totalCombatPower: 0,
    activeFormationPresetId: '',
    savedFormations: []
  };

  return {
    schema: EXPORT_SCHEMA,
    version: EXPORT_VERSION,
    kind: 'slot',
    exportedAt: savedAt,
    sourceSlot: VERIFICATION_SLOT,
    fixtureName: FIXTURE_NAME,
    sourceDataGeneratedAt: data.generatedAt || '',
    snapshot
  };
}

function parseArgs(argv) {
  const args = { output: DEFAULT_OUTPUT, check: false };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--check') {
      args.check = true;
      continue;
    }
    if (arg === '--output') {
      args.output = path.resolve(argv[index + 1] || DEFAULT_OUTPUT);
      index += 1;
      continue;
    }
    if (arg === '--stdout') {
      args.stdout = true;
      continue;
    }
    throw new Error(`不明な引数: ${arg}`);
  }
  return args;
}

function serializePayload(payload) {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

function main(argv = process.argv.slice(2)) {
  const args = parseArgs(argv);
  const payload = createMaxGrowthPayload();
  const serialized = serializePayload(payload);

  if (args.stdout) {
    process.stdout.write(serialized);
    return;
  }

  if (args.check) {
    if (!fs.existsSync(args.output)) throw new Error(`fixtureがありません: ${args.output}`);
    const current = fs.readFileSync(args.output, 'utf8');
    if (current !== serialized) throw new Error(`fixtureが古くなっています: ${args.output}`);
    console.log(`max growth fixture is up to date: ${args.output}`);
    return;
  }

  fs.mkdirSync(path.dirname(args.output), { recursive: true });
  fs.writeFileSync(args.output, serialized, 'utf8');
  const apostleCount = Object.keys(payload.snapshot.apostles).length;
  const cardCount = Object.keys(payload.snapshot.cards).length;
  const boardCount = Object.values(payload.snapshot.apostles)
    .reduce((sum, state) => sum + Object.values(state.boards).reduce((layerSum, layer) => layerSum + Object.keys(layer.filled).length, 0), 0);
  console.log(`created ${args.output}`);
  console.log(`apostles=${apostleCount} cards=${cardCount} boardNodes=${boardCount}`);
}

if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = {
  DEFAULT_OUTPUT,
  EXPORT_SCHEMA,
  EXPORT_VERSION,
  FIXTURE_NAME,
  VERIFICATION_SLOT,
  boardKey,
  createBoardState,
  createMaxApostleState,
  createMaxGrowthPayload,
  getAvailableEquipmentKeys,
  hasAsideData,
  readGeneratedCards,
  readGeneratedStatData,
  readPublicReleaseConfig,
  serializePayload
};
