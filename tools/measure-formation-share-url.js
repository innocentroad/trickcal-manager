'use strict';

const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');
const { TextDecoder } = require('node:util');
const vm = require('node:vm');
const zlib = require('node:zlib');

// 共有URLの方式比較用ハーネス。製品画面・保存データ・datasheetは変更しない。
const ROOT_DIR = path.resolve(__dirname, '..');
const CARDS_PATH = path.join(ROOT_DIR, 'cards.js');
const DEFAULT_BASE_URL = 'https://innocentroad.github.io/trickcal-manager/formation-share.html';
const FORMAT_VERSION = 1;
const CATALOG_VERSION = 1;
const FLAGS = Object.freeze({ ALV: 1, SLV: 2, GLOBAL_PERCENT: 4 });
const DEFAULT_FLAGS = FLAGS.ALV | FLAGS.SLV | FLAGS.GLOBAL_PERCENT;
const GLOBAL_PERCENT_KEYS = Object.freeze([
  'hp', 'patk', 'matk', 'pdef', 'mdef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'
]);
const GLOBAL_PERCENT_VALUES = Object.freeze([607, 616, 621, 592, 591, 590, 591, 606, 601, 0]);
const MAX_BINARY_BYTES = 64 * 1024;
const MAX_URL_DATA_BYTES = 16 * 1024;
const MAX_TITLE_BYTES = 240;
const MAX_RELIC_ENTRIES = 27;
const MAX_SPELL_ENTRIES = 256;
const MAX_POWER_ENTRIES = 8;
const MAX_GLOBAL_SCALE = 3;
const B_WIRE_PUBLIC_FLAGS = FLAGS.ALV | FLAGS.SLV | FLAGS.GLOBAL_PERCENT;
const B_WIRE_MEMBER_COMMON = 0x08;
const B_WIRE_GLOBAL_DELTA = 0x10;
const B_WIRE_FLAGS = B_WIRE_PUBLIC_FLAGS | B_WIRE_MEMBER_COMMON | B_WIRE_GLOBAL_DELTA;
const CHECKSUM_BYTES = 4;

const APOSTLE_IDS = Object.freeze([
  'Xion', 'Aya', 'Momo', 'Kyarot', 'Epica', 'Alice', 'Tig', 'Sylla', 'Kidian'
]);
const SAMPLE_ARTIFACT_IDS = Object.freeze([
  'artifact_xion_black_cape', 'artifact_dragonlight_sword', 'artifact_jade_codex',
  'artifact_icy_charm', 'artifact_life_gem', 'artifact_safety_harness',
  'artifact_30kg_kettlebell', 'artifact_elven_wand', 'artifact_ring_of_greed',
  'artifact_kyarot_sugarcane', 'artifact_chloe_sewing_chest', 'artifact_picora_fashion_pouch',
  'artifact_yomi_moonflower', 'artifact_blanchet_bouquet', 'artifact_risty_replica_glove',
  'artifact_barong_cursed_doll', 'artifact_shoupan_magical_backpack', 'artifact_snorky_fedora',
  'artifact_tig_blazing_sword', 'artifact_dragonlight_sword', 'artifact_jade_codex',
  'artifact_healing_pendant', 'artifact_old_wooden_dagger', 'artifact_icy_charm',
  'artifact_safety_harness', 'artifact_life_gem', 'artifact_assassin_scroll'
]);
const SAMPLE_SPELL_IDS = Object.freeze([
  'spell_aya_snowflake_magic', 'spell_epica_hero_exaltation', 'spell_alice_fake_magic',
  'spell_combat_master', 'spell_aroma_therapy', 'spell_cheer_up'
]);
const MASTER_POWER_ID = 'masterpower_acceleration';

function loadCardLibrary() {
  const source = fs.readFileSync(CARDS_PATH, 'utf8');
  const context = { console };
  vm.createContext(context);
  vm.runInContext(`${source}\nthis.__shareCardLibrary = CARD_LIBRARY;`, context, { filename: CARDS_PATH });
  return {
    source,
    library: context.__shareCardLibrary
  };
}

const { source: cardsSource, library: cardLibrary } = loadCardLibrary();
const allSpellIds = (cardLibrary.spells || []).map(card => card.id).filter(Boolean);
const allCatalogIds = [
  ...APOSTLE_IDS,
  ...SAMPLE_ARTIFACT_IDS,
  ...SAMPLE_SPELL_IDS,
  ...allSpellIds,
  MASTER_POWER_ID
];
const shortIdRegistry = new Map(
  [...new Set(allCatalogIds)].sort().map((id, index) => [id, index + 1])
);
const cardsSourceHash = crypto.createHash('sha256').update(cardsSource).digest('hex').slice(0, 12);

function refFor(id) {
  const ref = shortIdRegistry.get(id);
  assert.ok(ref, `計測用辞書にIDがありません: ${id}`);
  return ref;
}

function base64urlEncode(bytes) {
  return Buffer.from(bytes).toString('base64')
    .replaceAll('+', '-')
    .replaceAll('/', '_')
    .replace(/=+$/u, '');
}

function base64urlDecode(value) {
  const encoded = String(value);
  assert.match(encoded, /^[A-Za-z0-9_-]*$/u, 'Base64urlに使用できない文字があります');
  assert.notEqual(encoded.length % 4, 1, 'Base64urlの長さが不正です');
  const normalized = encoded.replaceAll('-', '+').replaceAll('_', '/');
  return Buffer.from(normalized + '='.repeat((4 - normalized.length % 4) % 4), 'base64');
}

const CRC32_TABLE = Array.from({ length: 256 }, (_, seed) => {
  let value = seed;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? (value >>> 1) ^ 0xedb88320 : value >>> 1;
  return value >>> 0;
});

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of Buffer.from(bytes)) value = (value >>> 8) ^ CRC32_TABLE[(value ^ byte) & 0xff];
  return (value ^ 0xffffffff) >>> 0;
}

function appendChecksum(bytes) {
  const data = Buffer.from(bytes);
  const result = Buffer.alloc(data.length + CHECKSUM_BYTES);
  data.copy(result);
  result.writeUInt32LE(crc32(data), data.length);
  assert.ok(result.length <= MAX_BINARY_BYTES, 'チェックサムを含むB方式の出力が大きすぎます');
  return result;
}

function verifyAndStripChecksum(bytes) {
  const data = Buffer.from(bytes);
  assert.ok(data.length >= CHECKSUM_BYTES, 'B方式のチェックサムがありません');
  const body = data.subarray(0, data.length - CHECKSUM_BYTES);
  const expected = data.readUInt32LE(data.length - CHECKSUM_BYTES);
  assert.equal(crc32(body), expected, 'B方式のチェックサムが一致しません');
  return body;
}

function normalizeFlags(flags) {
  return Number(flags) & (FLAGS.ALV | FLAGS.SLV | FLAGS.GLOBAL_PERCENT);
}

function encodeMember(profile, flags) {
  if (!profile) return null;
  const result = [refFor(profile.id), profile.star, profile.asideRank];
  if (flags & FLAGS.ALV) result.push(profile.asideLevel);
  if (flags & FLAGS.SLV) result.push(profile.skills.low, profile.skills.high, profile.skills.passive);
  return result;
}

function makeMemberProfiles(mode = 'sample') {
  const uniform = mode === 'uniform';
  return APOSTLE_IDS.map((id, index) => ({
    id,
    star: 5,
    asideRank: uniform ? 2 : [2, 2, 0, 3, 1, 0, 3, 2, 1][index],
    asideLevel: uniform ? 30 : [30, 30, 0, 40, 20, 0, 40, 30, 20][index],
    skills: {
      low: uniform ? 14 : [14, 14, 12, 15, 13, 12, 15, 14, 13][index],
      high: uniform ? 14 : [14, 14, 12, 15, 13, 12, 15, 14, 13][index],
      passive: uniform ? 14 : [14, 14, 12, 15, 13, 12, 15, 14, 13][index]
    }
  }));
}

function cardState(id, index, mode) {
  if (mode === 'duplicate') return { id, star: 5, solder: 0 };
  return { id, star: 5 - (index % 3 === 0 ? 0 : index % 3 === 1 ? 1 : 2), solder: index % 3 };
}

function addDictionaryEntry(entries, indexes, item) {
  const key = JSON.stringify(item);
  let ref = indexes.get(key);
  if (!ref) {
    ref = entries.length + 1;
    entries.push(item);
    indexes.set(key, ref);
  }
  return ref;
}

function encodeRelics(memberCount, mode) {
  const entries = [];
  const indexes = new Map();
  const refs = [];
  for (let slot = 0; slot < SAMPLE_ARTIFACT_IDS.length; slot += 1) {
    const memberIndex = Math.floor(slot / 3);
    const isEmptyMemberRelic = mode === 'empty-relic' && memberIndex === 6;
    const isActive = memberIndex < memberCount || isEmptyMemberRelic;
    if (!isActive) {
      refs.push(0);
      continue;
    }
    const id = mode === 'duplicate'
      ? 'artifact_xion_black_cape'
      : SAMPLE_ARTIFACT_IDS[slot];
    const state = mode === 'duplicate' ? { star: 5, solder: 0 } : cardState(id, slot, mode);
    refs.push(addDictionaryEntry(entries, indexes, [refFor(id), state.star, state.solder]));
  }
  return { entries, refs };
}

function encodeSpells(ids, mode) {
  const entries = [];
  const indexes = new Map();
  for (let index = 0; index < ids.length; index += 1) {
    const id = ids[index];
    const state = mode === 'duplicate'
      ? { star: 5, solder: 0 }
      : cardState(id, index, mode);
    const key = JSON.stringify([refFor(id), state.star, state.solder]);
    const existing = indexes.get(key);
    if (existing) {
      entries[existing - 1][3] += 1;
    } else {
      indexes.set(key, entries.length + 1);
      entries.push([refFor(id), state.star, state.solder, 1]);
    }
  }
  return entries;
}

function getCaseConfig(name) {
  const configurations = {
    one: { memberCount: 1, spellIds: SAMPLE_SPELL_IDS.slice(0, 1), mode: 'sample' },
    six: { memberCount: 6, spellIds: SAMPLE_SPELL_IDS, mode: 'sample' },
    nine: { memberCount: 9, spellIds: SAMPLE_SPELL_IDS, mode: 'sample' },
    duplicate: { memberCount: 9, spellIds: SAMPLE_SPELL_IDS.map(() => SAMPLE_SPELL_IDS[0]), mode: 'duplicate' },
    'all-spells': { memberCount: 9, spellIds: allSpellIds, mode: 'sample' },
    uniform: { memberCount: 9, spellIds: SAMPLE_SPELL_IDS, mode: 'uniform' },
    max: {
      memberCount: 9,
      spellIds: allSpellIds,
      mode: 'sample',
      title: [151, 202, 'EF麻辣2・次元15段階・最大育成の相談用編成']
    },
    'empty-relic': { memberCount: 6, spellIds: SAMPLE_SPELL_IDS, mode: 'empty-relic' },
    decimal: { memberCount: 9, spellIds: SAMPLE_SPELL_IDS, mode: 'sample', globalMode: 'decimal' },
    unknown: { memberCount: 9, spellIds: SAMPLE_SPELL_IDS, mode: 'sample', globalMode: 'unknown' },
    hidden: { memberCount: 9, spellIds: SAMPLE_SPELL_IDS, mode: 'sample', flags: 0 },
    'no-global': { memberCount: 9, spellIds: SAMPLE_SPELL_IDS, mode: 'sample', flags: FLAGS.ALV | FLAGS.SLV }
  };
  const config = configurations[name];
  assert.ok(config, `未知のケースです: ${name}`);
  return config;
}

function buildSnapshot(name) {
  const config = getCaseConfig(name);
  const flags = normalizeFlags(config.flags == null ? DEFAULT_FLAGS : config.flags);
  const profiles = makeMemberProfiles(config.mode);
  const relics = encodeRelics(config.memberCount, config.mode);
  const snapshot = {
    v: FORMAT_VERSION,
    m: CATALOG_VERSION,
    o: flags,
    a: profiles.map((profile, index) => index < config.memberCount ? encodeMember(profile, flags) : null),
    r: relics.entries,
    e: relics.refs,
    s: encodeSpells(config.spellIds, config.mode),
    p: [refFor(MASTER_POWER_ID)]
  };
  if (flags & FLAGS.GLOBAL_PERCENT) {
    snapshot.g = config.globalMode === 'decimal'
      ? [607.25, 616.5, 621.75, 592.125, 591, 590.5, 591.125, 606.25, 601.5, 0]
      : config.globalMode === 'unknown'
        ? [607, null, 621, null, 591, 590, null, 606, 601, 0]
        : [...GLOBAL_PERCENT_VALUES];
  }
  if (config.title) snapshot.t = config.title;
  return snapshot;
}

function encodeJ(snapshot) {
  const json = JSON.stringify(snapshot);
  const rawBytes = Buffer.from(json, 'utf8');
  const compressedBytes = zlib.deflateRawSync(rawBytes, { level: 9 });
  return {
    json,
    rawBytes,
    compressedBytes,
    payload: base64urlEncode(compressedBytes)
  };
}

function decodeJ(payload) {
  const compressedBytes = base64urlDecode(payload);
  assert.ok(compressedBytes.length <= MAX_URL_DATA_BYTES, 'J方式の入力が大きすぎます');
  return JSON.parse(zlib.inflateRawSync(compressedBytes, { maxOutputLength: MAX_BINARY_BYTES }).toString('utf8'));
}

class BinaryWriter {
  constructor() {
    this.bytes = [];
  }

  writeByte(value) {
    assert.ok(Number.isInteger(value) && value >= 0 && value <= 255, `1バイト値が範囲外です: ${value}`);
    this.bytes.push(value);
  }

  writeBytes(value) {
    for (const byte of Buffer.from(value)) this.writeByte(byte);
  }

  writeUvarint(value) {
    assert.ok(Number.isSafeInteger(value) && value >= 0, `非負整数として扱えません: ${value}`);
    let remaining = value;
    while (remaining >= 0x80) {
      this.writeByte((remaining % 0x80) + 0x80);
      remaining = Math.floor(remaining / 0x80);
    }
    this.writeByte(remaining);
  }

  writeString(value) {
    const bytes = Buffer.from(String(value), 'utf8');
    assert.ok(bytes.length <= MAX_TITLE_BYTES, 'タイトルが長すぎます');
    this.writeUvarint(bytes.length);
    this.writeBytes(bytes);
  }

  toBuffer() {
    const result = Buffer.from(this.bytes);
    assert.ok(result.length <= MAX_BINARY_BYTES, 'B方式の出力が大きすぎます');
    return result;
  }
}

class BinaryReader {
  constructor(value) {
    this.bytes = Buffer.from(value);
    this.offset = 0;
    assert.ok(this.bytes.length <= MAX_BINARY_BYTES, 'B方式の入力が大きすぎます');
  }

  readByte() {
    assert.ok(this.offset < this.bytes.length, 'B方式のデータが途中で終わっています');
    return this.bytes[this.offset++];
  }

  readBytes(length) {
    assert.ok(Number.isSafeInteger(length) && length >= 0, `バイト長が不正です: ${length}`);
    assert.ok(this.offset + length <= this.bytes.length, 'B方式のバイト列が不足しています');
    const result = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }

  readUvarint() {
    let value = 0;
    for (let index = 0; index < 8; index += 1) {
      const byte = this.readByte();
      value += (byte & 0x7f) * (2 ** (index * 7));
      assert.ok(Number.isSafeInteger(value), 'B方式の整数が大きすぎます');
      if (!(byte & 0x80)) return value;
    }
    throw new Error('B方式の可変長整数が長すぎます');
  }

  readString() {
    const length = this.readUvarint();
    assert.ok(length <= MAX_TITLE_BYTES, 'タイトルが長すぎます');
    try {
      return new TextDecoder('utf-8', { fatal: true }).decode(this.readBytes(length));
    } catch (error) {
      throw new Error(`タイトルのUTF-8が不正です: ${error.message}`);
    }
  }

  assertEnd() {
    assert.equal(this.offset, this.bytes.length, 'B方式の末尾に余剰データがあります');
  }
}

function packCardState(star, solder) {
  assert.ok(Number.isInteger(star) && star >= 1 && star <= 5, `カード★が範囲外です: ${star}`);
  assert.ok(Number.isInteger(solder) && solder >= 0 && solder <= 2, `はんだ値が範囲外です: ${solder}`);
  return ((star - 1) << 2) | solder;
}

function unpackCardState(value) {
  const solder = value & 0x03;
  assert.ok(solder <= 2, `はんだ値が範囲外です: ${solder}`);
  const star = (value >> 2) + 1;
  assert.ok(star >= 1 && star <= 5, `カード★が範囲外です: ${star}`);
  return { star, solder };
}

function packMemberState(star, asideRank) {
  assert.ok(Number.isInteger(star) && star >= 1 && star <= 5, `使徒★が範囲外です: ${star}`);
  assert.ok(Number.isInteger(asideRank) && asideRank >= 0 && asideRank <= 3, `A段階が範囲外です: ${asideRank}`);
  return ((star - 1) << 2) | asideRank;
}

function unpackMemberState(value) {
  const star = (value >> 2) + 1;
  assert.ok(star >= 1 && star <= 5, `使徒★が範囲外です: ${star}`);
  return { star, asideRank: value & 0x03 };
}

function readBoundedCount(reader, max, label) {
  const count = reader.readUvarint();
  assert.ok(count <= max, `${label}の件数が上限を超えています: ${count}`);
  return count;
}

function getMemberFieldDefinitions(flags) {
  const fields = [];
  if (flags & FLAGS.ALV) fields.push({ bit: 1, index: 3 });
  if (flags & FLAGS.SLV) fields.push({ bit: 2, index: flags & FLAGS.ALV ? 4 : 3 });
  if (flags & FLAGS.SLV) fields.push({ bit: 4, index: flags & FLAGS.ALV ? 5 : 4 });
  if (flags & FLAGS.SLV) fields.push({ bit: 8, index: flags & FLAGS.ALV ? 6 : 5 });
  return fields;
}

function getCommonMemberFields(snapshot, flags) {
  const presentMembers = snapshot.a.filter(Boolean);
  const common = new Map();
  if (presentMembers.length < 2) return common;
  getMemberFieldDefinitions(flags).forEach(field => {
    const value = presentMembers[0][field.index];
    if (presentMembers.every(member => member[field.index] === value)) common.set(field.bit, value);
  });
  return common;
}

function uvarintLength(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 0, `非負整数として扱えません: ${value}`);
  let length = 1;
  let remaining = value;
  while (remaining >= 0x80) {
    remaining = Math.floor(remaining / 0x80);
    length += 1;
  }
  return length;
}

function zigzagEncode(value) {
  assert.ok(Number.isSafeInteger(value), `符号付き整数として扱えません: ${value}`);
  return value >= 0 ? value * 2 : (-value * 2) - 1;
}

function zigzagDecode(value) {
  assert.ok(Number.isSafeInteger(value) && value >= 0, `符号付き整数の符号化値が不正です: ${value}`);
  return value % 2 === 0 ? value / 2 : -(value + 1) / 2;
}

function signedVarintLength(value) {
  return uvarintLength(zigzagEncode(value));
}

function writeSignedVarint(writer, value) {
  writer.writeUvarint(zigzagEncode(value));
}

function readSignedVarint(reader) {
  return zigzagDecode(reader.readUvarint());
}

function getGlobalScale(values) {
  assert.ok(Array.isArray(values) && values.length === GLOBAL_PERCENT_KEYS.length, '全体%補正の件数が不正です');
  let scale = 0;
  values.filter(value => value != null).forEach(value => {
    assert.ok(Number.isFinite(value) && value >= 0, `全体%補正が不正です: ${value}`);
    let valueScale = 0;
    while (valueScale <= MAX_GLOBAL_SCALE && !Number.isInteger(value * (10 ** valueScale))) valueScale += 1;
    assert.ok(valueScale <= MAX_GLOBAL_SCALE, `全体%補正の小数桁が多すぎます: ${value}`);
    scale = Math.max(scale, valueScale);
  });
  return scale;
}

function scaleGlobalValue(value, scale) {
  if (value == null) return null;
  const scaled = Math.round(value * (10 ** scale));
  assert.ok(Number.isSafeInteger(scaled), `全体%補正が大きすぎます: ${value}`);
  return scaled;
}

function unscaleGlobalValue(value, scale) {
  if (scale === 0) return value;
  return Number((value / (10 ** scale)).toFixed(scale));
}

function shouldUseGlobalDelta(values) {
  if (!Array.isArray(values) || values.length !== GLOBAL_PERCENT_KEYS.length || values.some(value => value == null)) return false;
  const scale = getGlobalScale(values);
  const scaledValues = values.map(value => scaleGlobalValue(value, scale));
  const directLength = scaledValues.reduce((sum, value) => sum + uvarintLength(value), 0);
  const deltaLength = signedVarintLength(scaledValues[0])
    + scaledValues.slice(1).reduce((sum, value, index) => sum + signedVarintLength(value - scaledValues[index]), 0);
  return deltaLength < directLength;
}

function encodeB(snapshot) {
  const writer = new BinaryWriter();
  writer.writeBytes(Buffer.from([0x54, 0x43, 0x53, 0x42]));
  writer.writeUvarint(snapshot.v);
  writer.writeUvarint(snapshot.m);
  const flags = normalizeFlags(snapshot.o);
  const commonMembers = getCommonMemberFields(snapshot, flags);
  const globalDelta = Boolean(flags & FLAGS.GLOBAL_PERCENT) && shouldUseGlobalDelta(snapshot.g);
  const wireFlags = flags
    | (commonMembers.size ? B_WIRE_MEMBER_COMMON : 0)
    | (globalDelta ? B_WIRE_GLOBAL_DELTA : 0);
  writer.writeByte(wireFlags);
  if (commonMembers.size) {
    const commonMask = [...commonMembers.keys()].reduce((mask, bit) => mask | bit, 0);
    writer.writeByte(commonMask);
    getMemberFieldDefinitions(flags)
      .filter(field => commonMembers.has(field.bit))
      .forEach(field => writer.writeUvarint(commonMembers.get(field.bit)));
  }
  assert.equal(snapshot.a.length, 9, '使徒枠は9件で固定です');
  const memberFields = getMemberFieldDefinitions(flags);
  snapshot.a.forEach(member => {
    writer.writeByte(member ? 1 : 0);
    if (!member) return;
    writer.writeUvarint(member[0]);
    writer.writeByte(packMemberState(member[1], member[2]));
    memberFields
      .filter(field => !commonMembers.has(field.bit))
      .forEach(field => writer.writeUvarint(member[field.index]));
  });
  assert.ok(snapshot.r.length <= MAX_RELIC_ENTRIES, '遺物辞書が大きすぎます');
  writer.writeUvarint(snapshot.r.length);
  snapshot.r.forEach(entry => {
    writer.writeUvarint(entry[0]);
    writer.writeByte(packCardState(entry[1], entry[2]));
  });
  assert.equal(snapshot.e.length, 27, '遺物枠は27件で固定です');
  writer.writeUvarint(snapshot.e.length);
  snapshot.e.forEach(ref => writer.writeUvarint(ref));
  assert.ok(snapshot.s.length <= MAX_SPELL_ENTRIES, 'スペル辞書が大きすぎます');
  writer.writeUvarint(snapshot.s.length);
  snapshot.s.forEach(entry => {
    writer.writeUvarint(entry[0]);
    writer.writeByte(packCardState(entry[1], entry[2]));
    writer.writeUvarint(entry[3]);
  });
  assert.ok(snapshot.p.length <= MAX_POWER_ENTRIES, '権能数が大きすぎます');
  writer.writeUvarint(snapshot.p.length);
  snapshot.p.forEach(ref => writer.writeUvarint(ref));
  if (flags & FLAGS.GLOBAL_PERCENT) {
    assert.equal(snapshot.g.length, GLOBAL_PERCENT_KEYS.length, '全体%補正の件数が不正です');
    const globalScale = getGlobalScale(snapshot.g);
    const unknownMask = snapshot.g.reduce((mask, value, index) => value == null ? mask | (1 << index) : mask, 0);
    writer.writeByte(globalScale);
    writer.writeUvarint(unknownMask);
    if (globalDelta) {
      const scaledValues = snapshot.g.map(value => scaleGlobalValue(value, globalScale));
      writeSignedVarint(writer, scaledValues[0]);
      scaledValues.slice(1).forEach((value, index) => writeSignedVarint(writer, value - scaledValues[index]));
    } else {
      snapshot.g.forEach(value => {
        if (value != null) writer.writeUvarint(scaleGlobalValue(value, globalScale));
      });
    }
  }
  const title = snapshot.t;
  writer.writeByte(title ? 1 : 0);
  if (title) {
    writer.writeUvarint(title[0]);
    writer.writeUvarint(title[1]);
    writer.writeString(title[2] || '');
  }
  return appendChecksum(writer.toBuffer());
}

function decodeB(bytes) {
  const reader = new BinaryReader(verifyAndStripChecksum(bytes));
  assert.deepEqual([...reader.readBytes(4)], [0x54, 0x43, 0x53, 0x42], 'B方式のヘッダーが不正です');
  const version = reader.readUvarint();
  assert.equal(version, FORMAT_VERSION, `未知の形式版です: ${version}`);
  const catalogVersion = reader.readUvarint();
  assert.equal(catalogVersion, CATALOG_VERSION, `未知のカタログ版です: ${catalogVersion}`);
  const wireFlags = reader.readByte();
  assert.equal(wireFlags & ~B_WIRE_FLAGS, 0, '未定義のB方式フラグがあります');
  const flags = wireFlags & B_WIRE_PUBLIC_FLAGS;
  const memberFields = getMemberFieldDefinitions(flags);
  const commonMembers = new Map();
  if (wireFlags & B_WIRE_MEMBER_COMMON) {
    const commonMask = reader.readByte();
    const allowedMask = memberFields.reduce((mask, field) => mask | field.bit, 0);
    assert.ok(commonMask > 0 && (commonMask & ~allowedMask) === 0, '共通使徒値のマスクが不正です');
    memberFields
      .filter(field => commonMask & field.bit)
      .forEach(field => commonMembers.set(field.bit, reader.readUvarint()));
  }
  if (wireFlags & B_WIRE_GLOBAL_DELTA) assert.ok(flags & FLAGS.GLOBAL_PERCENT, '全体%補正の差分フラグが不正です');
  const members = Array.from({ length: 9 }, () => {
    const marker = reader.readByte();
    if (marker === 0) return null;
    assert.equal(marker, 1, '使徒枠マーカーが不正です');
    const memberRef = reader.readUvarint();
    assert.ok(memberRef > 0, '使徒参照が不正です');
    const memberState = unpackMemberState(reader.readByte());
    const result = [memberRef, memberState.star, memberState.asideRank];
    memberFields.forEach(field => result.push(
      commonMembers.has(field.bit) ? commonMembers.get(field.bit) : reader.readUvarint()
    ));
    return result;
  });
  const relicCount = readBoundedCount(reader, MAX_RELIC_ENTRIES, '遺物辞書');
  const relics = Array.from({ length: relicCount }, () => {
    const cardRef = reader.readUvarint();
    assert.ok(cardRef > 0, '遺物参照が不正です');
    return [cardRef, ...Object.values(unpackCardState(reader.readByte()))];
  });
  const relicSlotCount = reader.readUvarint();
  assert.equal(relicSlotCount, 27, '遺物枠数が不正です');
  const relicRefs = Array.from({ length: relicSlotCount }, () => reader.readUvarint());
  relicRefs.forEach(ref => assert.ok(ref <= relicCount, `遺物参照が範囲外です: ${ref}`));
  const spellCount = readBoundedCount(reader, MAX_SPELL_ENTRIES, 'スペル辞書');
  const spells = Array.from({ length: spellCount }, () => {
    const cardRef = reader.readUvarint();
    assert.ok(cardRef > 0, 'スペル参照が不正です');
    return [cardRef, ...Object.values(unpackCardState(reader.readByte())), reader.readUvarint()];
  });
  spells.forEach(entry => assert.ok(entry[3] >= 1, `スペル枚数が不正です: ${entry[3]}`));
  const powerCount = readBoundedCount(reader, MAX_POWER_ENTRIES, '権能');
  const powers = Array.from({ length: powerCount }, () => {
    const powerRef = reader.readUvarint();
    assert.ok(powerRef > 0, '権能参照が不正です');
    return powerRef;
  });
  const snapshot = { v: version, m: catalogVersion, o: flags, a: members, r: relics, e: relicRefs, s: spells, p: powers };
  if (flags & FLAGS.GLOBAL_PERCENT) {
    const globalScale = reader.readByte();
    assert.ok(globalScale <= MAX_GLOBAL_SCALE, `全体%補正の小数桁が不正です: ${globalScale}`);
    const unknownMask = reader.readUvarint();
    assert.ok(unknownMask < (1 << GLOBAL_PERCENT_KEYS.length), '全体%補正の不明値マスクが不正です');
    if (wireFlags & B_WIRE_GLOBAL_DELTA) {
      assert.equal(unknownMask, 0, '不明値を含む全体%補正に差分フラグがあります');
      const values = [readSignedVarint(reader)];
      for (let index = 1; index < GLOBAL_PERCENT_KEYS.length; index += 1) values.push(values[index - 1] + readSignedVarint(reader));
      assert.ok(values.every(value => value >= 0), '全体%補正に負の値があります');
      snapshot.g = values.map(value => unscaleGlobalValue(value, globalScale));
    } else {
      snapshot.g = Array.from({ length: GLOBAL_PERCENT_KEYS.length }, (_, index) => (
        unknownMask & (1 << index) ? null : unscaleGlobalValue(reader.readUvarint(), globalScale)
      ));
    }
  }
  const titleMarker = reader.readByte();
  if (titleMarker === 1) snapshot.t = [reader.readUvarint(), reader.readUvarint(), reader.readString()];
  else assert.equal(titleMarker, 0, 'タイトルマーカーが不正です');
  reader.assertEnd();
  return snapshot;
}

function encodeZ(snapshot) {
  const binaryBytes = encodeB(snapshot);
  const compressedBytes = zlib.deflateRawSync(binaryBytes, { level: 9 });
  return { binaryBytes, compressedBytes, payload: base64urlEncode(compressedBytes) };
}

function decodeZ(payload) {
  const compressedBytes = base64urlDecode(payload);
  assert.ok(compressedBytes.length <= MAX_URL_DATA_BYTES, 'Z方式の入力が大きすぎます');
  const binaryBytes = zlib.inflateRawSync(compressedBytes, { maxOutputLength: MAX_BINARY_BYTES });
  assert.ok(binaryBytes.length <= MAX_BINARY_BYTES, 'Z方式の展開後データが大きすぎます');
  return decodeB(binaryBytes);
}

function encodeMode(snapshot, mode) {
  if (mode === 'j') {
    const encoded = encodeJ(snapshot);
    return { rawBytes: encoded.rawBytes, encodedBytes: encoded.compressedBytes, payload: encoded.payload };
  }
  if (mode === 'b') {
    const binaryBytes = encodeB(snapshot);
    return { rawBytes: binaryBytes, encodedBytes: binaryBytes, payload: base64urlEncode(binaryBytes) };
  }
  if (mode === 'z') {
    const encoded = encodeZ(snapshot);
    return { rawBytes: encoded.binaryBytes, encodedBytes: encoded.compressedBytes, payload: encoded.payload };
  }
  throw new Error(`未対応の方式です: ${mode}`);
}

function decodeMode(payload, mode) {
  if (mode === 'j') return decodeJ(payload);
  if (mode === 'b') {
    const bytes = base64urlDecode(payload);
    assert.ok(bytes.length <= MAX_URL_DATA_BYTES, 'B方式の入力が大きすぎます');
    return decodeB(bytes);
  }
  if (mode === 'z') return decodeZ(payload);
  throw new Error(`未対応の方式です: ${mode}`);
}

function makeUrl(payload, baseUrl, mode) {
  return `${baseUrl}#${FORMAT_VERSION}.${mode}.${payload}`;
}

function measureCase(name, baseUrl, mode) {
  const snapshot = buildSnapshot(name);
  const encoded = encodeMode(snapshot, mode);
  const decoded = decodeMode(encoded.payload, mode);
  assert.deepStrictEqual(decoded, snapshot, `${name}: ${mode.toUpperCase()}方式の往復結果が一致しません`);
  assert.ok(snapshot.a.every(member => member == null || member.every(value => Number.isInteger(value))), `${name}: 使徒配列に文字列があります`);
  assert.equal(Object.hasOwn(snapshot, 'level'), false);
  assert.equal(Object.hasOwn(snapshot, 'rank'), false);
  const url = makeUrl(encoded.payload, baseUrl, mode);
  return {
    mode,
    case: name,
    members: snapshot.a.filter(Boolean).length,
    relicEntries: snapshot.r.length,
    relicSlots: snapshot.e.filter(Boolean).length,
    spellEntries: snapshot.s.length,
    spellCards: snapshot.s.reduce((sum, entry) => sum + entry[3], 0),
    flags: snapshot.o,
    memberCommonFields: mode === 'b' || mode === 'z' ? getCommonMemberFields(snapshot, snapshot.o).size : null,
    globalDelta: mode === 'b' || mode === 'z'
      ? Boolean(snapshot.o & FLAGS.GLOBAL_PERCENT) && shouldUseGlobalDelta(snapshot.g)
      : null,
    rawJsonBytes: Buffer.byteLength(JSON.stringify(snapshot), 'utf8'),
    encodedBytes: encoded.encodedBytes.length,
    payloadChars: encoded.payload.length,
    urlChars: url.length,
    roundTrip: true
  };
}

function parseArguments(argv) {
  const options = { json: false, baseUrl: process.env.TRICKCAL_SHARE_BASE_URL || DEFAULT_BASE_URL, cases: [], modes: [] };
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--json') options.json = true;
    else if (arg === '--base-url') options.baseUrl = argv[++index] || options.baseUrl;
    else if (arg === '--case') options.cases.push(argv[++index]);
    else if (arg === '--mode') options.modes.push(argv[++index]);
    else if (arg === '--help' || arg === '-h') options.help = true;
    else throw new Error(`不明な引数です: ${arg}`);
  }
  return options;
}

function expectReject(label, callback) {
  assert.throws(callback, undefined, `${label}が拒否されませんでした`);
}

function measureTiming(name, mode, iterations = 1000) {
  const snapshot = buildSnapshot(name);
  const encodeStart = process.hrtime.bigint();
  let encoded;
  for (let index = 0; index < iterations; index += 1) encoded = encodeMode(snapshot, mode);
  const encodeElapsed = Number(process.hrtime.bigint() - encodeStart) / 1e6;
  const decodeStart = process.hrtime.bigint();
  for (let index = 0; index < iterations; index += 1) decodeMode(encoded.payload, mode);
  const decodeElapsed = Number(process.hrtime.bigint() - decodeStart) / 1e6;
  return {
    case: name,
    mode,
    iterations,
    encodeMsPerCase: Number((encodeElapsed / iterations).toFixed(4)),
    decodeMsPerCase: Number((decodeElapsed / iterations).toFixed(4))
  };
}

function runBoundaryChecks() {
  const snapshot = buildSnapshot('max');
  for (const mode of ['j', 'b', 'z']) {
    const encoded = encodeMode(snapshot, mode);
    expectReject(`${mode.toUpperCase()}方式の不正Base64url`, () => decodeMode(`${encoded.payload}!`, mode));
  }
  const binary = encodeB(snapshot);
  const binaryBody = binary.subarray(0, binary.length - CHECKSUM_BYTES);
  const unknownVersionBody = Buffer.from(binaryBody);
  const unknownVersion = unknownVersionBody;
  unknownVersion[4] = FORMAT_VERSION + 1;
  expectReject('B方式の未知形式版', () => decodeB(appendChecksum(unknownVersion)));
  const unknownFlag = Buffer.from(binaryBody);
  unknownFlag[6] |= 0x20;
  expectReject('B方式の未知フラグ', () => decodeB(appendChecksum(unknownFlag)));
  expectReject('B方式の末尾余剰データ', () => decodeB(appendChecksum(Buffer.concat([binaryBody, Buffer.from([0])]))));
  const corruptBinary = Buffer.from(binary);
  corruptBinary[0] = 0;
  const corruptZ = base64urlEncode(zlib.deflateRawSync(corruptBinary, { level: 9 }));
  expectReject('Z方式の破損ヘッダー', () => decodeZ(corruptZ));
  const oversizedTitle = buildSnapshot('max');
  oversizedTitle.t = [1, 2, 'x'.repeat(MAX_TITLE_BYTES + 1)];
  expectReject('B方式の過大タイトル', () => encodeB(oversizedTitle));
}

function printHelp() {
  console.log('Usage: node tools/measure-formation-share-url.js [--json] [--base-url URL] [--case NAME] [--mode j|b|z]');
  console.log('Cases: one, six, nine, duplicate, all-spells, max, empty-relic, uniform, decimal, unknown, hidden, no-global');
}

function printResults(results, baseUrl, timing) {
  console.log('方式: J=固定順配列JSON + DEFLATE raw / B=バイナリ / Z=B + DEFLATE raw（すべてBase64url）');
  console.log(`カード辞書: ${shortIdRegistry.size}件 / cards.js sha256先頭: ${cardsSourceHash}`);
  console.log(`URLベース: ${baseUrl}`);
  console.log('mode\tcase\tmembers\trelicEntries\trelicSlots\tspellEntries\tspellCards\tmemberCommonFields\tglobalDelta\trawJsonBytes\tencodedBytes\tpayloadChars\turlChars\troundTrip');
  results.forEach(result => {
    console.log([
      result.mode,
      result.case,
      result.members,
      result.relicEntries,
      result.relicSlots,
      result.spellEntries,
      result.spellCards,
      result.memberCommonFields == null ? '-' : result.memberCommonFields,
      result.globalDelta == null ? '-' : result.globalDelta ? 'yes' : 'no',
      result.rawJsonBytes,
      result.encodedBytes,
      result.payloadChars,
      result.urlChars,
      result.roundTrip ? 'OK' : 'NG'
    ].join('\t'));
  });
  console.log(`測定環境: ${process.version} / timing対象: ${timing[0]?.case || '-'} / 各方式${timing[0]?.iterations || 0}回`);
  console.log('timing\tmode\tencodeMsPerCase\tdecodeMsPerCase');
  timing.forEach(result => console.log([
    result.case,
    result.mode,
    result.encodeMsPerCase,
    result.decodeMsPerCase
  ].join('\t')));
  console.log(`計測ハーネス: ${fs.statSync(__filename).size} bytes / Node組み込み依存のみ（製品Z方式のDEFLATE raw実装は未選定）`);
}

function main() {
  const options = parseArguments(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }
  const caseNames = options.cases.length
    ? options.cases
    : ['one', 'six', 'nine', 'duplicate', 'all-spells', 'max', 'empty-relic', 'uniform', 'decimal', 'unknown', 'hidden', 'no-global'];
  const modes = options.modes.length ? options.modes : ['j', 'b', 'z'];
  modes.forEach(mode => assert.ok(['j', 'b', 'z'].includes(mode), `未対応の方式です: ${mode}`));
  runBoundaryChecks();
  const results = modes.flatMap(mode => caseNames.map(name => measureCase(name, options.baseUrl, mode)));
  const timing = modes.map(mode => measureTiming('max', mode));
  const environment = {
    node: process.version,
    platform: process.platform,
    arch: process.arch,
    harnessBytes: fs.statSync(__filename).size,
    productDependencies: { j: 'ブラウザ標準APIまたは同等のJSON/DEFLATE実装', b: 'なし', z: '決定的なDEFLATE raw実装（未選定）' }
  };
  if (options.json) console.log(JSON.stringify({ formats: modes.map(mode => `1.${mode}`), baseUrl: options.baseUrl, environment, timing, results }, null, 2));
  else printResults(results, options.baseUrl, timing);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
