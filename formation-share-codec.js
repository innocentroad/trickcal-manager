(() => {
  'use strict';

  const globalObject = typeof globalThis !== 'undefined' ? globalThis : {};
  const VERSION = 1;
  const CATALOG_VERSION = 1;
  const MAGIC = [0x54, 0x43, 0x53, 0x50]; // TCSP
  const FLAGS = Object.freeze({ GLOBAL_PERCENT: 1 });
  const GLOBAL_PERCENT_KEYS = Object.freeze([
    'hp', 'patk', 'matk', 'pdef', 'mdef', 'crit', 'critDmg', 'critRes', 'critDmgRes', 'spRegen'
  ]);
  const MAX_URL_DATA_CHARS = 16384;
  const MAX_BINARY_BYTES = 65536;
  const MAX_MEMBERS = 9;
  const MAX_RELIC_SLOTS = 27;
  const MAX_RELIC_ENTRIES = 27;
  const MAX_SPELL_ENTRIES = 256;
  const MAX_POWER_ENTRIES = 8;
  const MAX_SPELL_COUNT = 65535;
  const MAX_GLOBAL_SCALE = 3;
  const MAX_U32 = 0xffffffff;
  const CARD_KINDS = Object.freeze({ artifact: '遺物', spell: 'スペル' });

  const LENGTH_BASE = Object.freeze([
    3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 15, 17, 19, 23, 27, 31, 35, 43, 51, 59,
    67, 83, 99, 115, 131, 163, 195, 227, 258
  ]);
  const LENGTH_EXTRA = Object.freeze([
    0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3,
    4, 4, 4, 4, 5, 5, 5, 5, 0
  ]);
  const DISTANCE_BASE = Object.freeze([
    1, 2, 3, 4, 5, 7, 9, 13, 17, 25, 33, 49, 65, 97, 129, 193,
    257, 385, 513, 769, 1025, 1537, 2049, 3073, 4097, 6145, 8193, 12289, 16385, 24577
  ]);
  const DISTANCE_EXTRA = Object.freeze([
    0, 0, 0, 0, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6,
    7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13
  ]);

  class FormationShareCodecError extends Error {
    constructor(message) {
      super(message);
      this.name = 'FormationShareCodecError';
    }
  }

  function fail(message) {
    throw new FormationShareCodecError(message);
  }

  function assert(condition, message) {
    if (!condition) fail(message);
  }

  function asUint8Array(value) {
    if (value instanceof Uint8Array) return value;
    if (value instanceof ArrayBuffer) return new Uint8Array(value);
    if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
    fail('バイト列が不正です');
  }

  function normalizeCatalog(catalog = globalObject.TRICKCAL_FORMATION_SHARE_CATALOG) {
    assert(catalog && Number(catalog.version) === CATALOG_VERSION, '未知の表示マスター版です');
    const result = { version: CATALOG_VERSION, maps: {}, lists: {} };
    for (const kind of ['apostles', 'artifacts', 'spells', 'masterPowers']) {
      const source = Array.isArray(catalog[kind]) ? catalog[kind] : [];
      const list = source.map(item => typeof item === 'string' ? item : item?.id);
      assert(list.length > 0 || kind === 'masterPowers', kind + 'の辞書が空です');
      const map = new Map();
      list.forEach((id, index) => {
        assert(typeof id === 'string' && id.length > 0, kind + 'のIDが不正です');
        assert(!map.has(id), kind + 'のIDが重複しています: ' + id);
        map.set(id, index + 1);
      });
      result.lists[kind] = list;
      result.maps[kind] = map;
    }
    return result;
  }

  function getRef(catalog, kind, id) {
    assert(typeof id === 'string' && id.length > 0, (CARD_KINDS[kind] || kind) + 'IDが空です');
    const ref = catalog.maps[kind].get(id);
    assert(ref > 0, '共有辞書にない' + (CARD_KINDS[kind] || kind) + 'IDです: ' + id);
    return ref;
  }

  function getId(catalog, kind, ref) {
    assert(Number.isInteger(ref) && ref > 0 && ref <= catalog.lists[kind].length,
      '共有辞書参照が範囲外です: ' + kind + '/' + ref);
    return catalog.lists[kind][ref - 1];
  }

  function reverseBits(value, bitCount) {
    let result = 0;
    for (let index = 0; index < bitCount; index += 1) {
      result = (result << 1) | (value & 1);
      value >>>= 1;
    }
    return result;
  }

  function makeHuffmanCodes(lengths) {
    const maxLength = Math.max(...lengths);
    const counts = Array(maxLength + 1).fill(0);
    lengths.forEach(length => { if (length) counts[length] += 1; });
    const nextCode = Array(maxLength + 1).fill(0);
    let code = 0;
    for (let bits = 1; bits <= maxLength; bits += 1) {
      code = (code + (counts[bits - 1] || 0)) << 1;
      nextCode[bits] = code;
    }
    return lengths.map(length => {
      if (!length) return null;
      const rawCode = nextCode[length];
      nextCode[length] += 1;
      return { bits: length, code: reverseBits(rawCode, length) };
    });
  }

  function makeHuffmanDecodeTable(codes) {
    const table = new Map();
    let maxBits = 0;
    codes.forEach(item => {
      if (!item) return;
      maxBits = Math.max(maxBits, item.bits);
      table.set(String(item.bits) + ':' + item.code, item.symbol);
    });
    return { table, maxBits };
  }

  const FIXED_LITERAL_CODES = makeHuffmanCodes(Array.from({ length: 288 }, (_, symbol) => (
    symbol <= 143 ? 8 : symbol <= 255 ? 9 : symbol <= 279 ? 7 : 8
  ))).map((item, symbol) => item ? { ...item, symbol } : null);
  const FIXED_DISTANCE_CODES = makeHuffmanCodes(Array(32).fill(5))
    .map((item, symbol) => ({ ...item, symbol }));
  const FIXED_LITERAL_DECODE = makeHuffmanDecodeTable(FIXED_LITERAL_CODES);
  const FIXED_DISTANCE_DECODE = makeHuffmanDecodeTable(FIXED_DISTANCE_CODES);

  class BitWriter {
    constructor() {
      this.bytes = [];
      this.buffer = 0;
      this.bits = 0;
    }

    write(value, bitCount) {
      assert(Number.isInteger(value) && value >= 0 && bitCount >= 0 && bitCount <= 16,
        'DEFLATEビット値が不正です');
      this.buffer |= value << this.bits;
      this.bits += bitCount;
      while (this.bits >= 8) {
        this.bytes.push(this.buffer & 0xff);
        this.buffer >>>= 8;
        this.bits -= 8;
      }
    }

    finish() {
      if (this.bits) this.bytes.push(this.buffer & 0xff);
      return Uint8Array.from(this.bytes);
    }
  }

  class BitReader {
    constructor(bytes) {
      this.bytes = asUint8Array(bytes);
      this.offset = 0;
      this.buffer = 0;
      this.bits = 0;
    }

    read(bitCount) {
      assert(bitCount >= 0 && bitCount <= 16, 'DEFLATE読込幅が不正です');
      while (this.bits < bitCount) {
        assert(this.offset < this.bytes.length, 'DEFLATEデータが途中で終わっています');
        this.buffer |= this.bytes[this.offset++] << this.bits;
        this.bits += 8;
      }
      const mask = bitCount === 16 ? 0xffff : (1 << bitCount) - 1;
      const value = this.buffer & mask;
      this.buffer >>>= bitCount;
      this.bits -= bitCount;
      return value;
    }

    align() {
      if (this.bits && this.buffer !== 0) fail('DEFLATEのパディングが不正です');
      this.buffer = 0;
      this.bits = 0;
    }

    assertEnd() {
      assert(!this.bits || this.buffer === 0, 'DEFLATEの末尾ビットが不正です');
      assert(this.offset === this.bytes.length, 'DEFLATEの末尾に余剰データがあります');
    }
  }

  function decodeHuffman(reader, decoder) {
    let code = 0;
    for (let bits = 1; bits <= decoder.maxBits; bits += 1) {
      code |= reader.read(1) << (bits - 1);
      const symbol = decoder.table.get(String(bits) + ':' + code);
      if (symbol !== undefined) return symbol;
    }
    fail('DEFLATEのハフマン符号が不正です');
  }

  function findCode(value, bases) {
    for (let index = bases.length - 1; index >= 0; index -= 1) {
      if (value >= bases[index]) return index;
    }
    fail('DEFLATEの符号値が範囲外です');
  }

  function addLzPosition(heads, input, position) {
    if (position + 2 >= input.length) return;
    const key = (input[position] << 16) | (input[position + 1] << 8) | input[position + 2];
    const list = heads.get(key) || [];
    list.push(position);
    if (list.length > 256) list.shift();
    heads.set(key, list);
  }

  function tokenize(input) {
    const heads = new Map();
    const tokens = [];
    let position = 0;
    while (position < input.length) {
      let bestLength = 0;
      let bestDistance = 0;
      if (position + 2 < input.length) {
        const key = (input[position] << 16) | (input[position + 1] << 8) | input[position + 2];
        const list = heads.get(key) || [];
        let examined = 0;
        for (let index = list.length - 1; index >= 0 && examined < 128; index -= 1, examined += 1) {
          const candidate = list[index];
          const distance = position - candidate;
          if (distance > 32768) break;
          let length = 3;
          const maxLength = Math.min(258, input.length - position);
          while (length < maxLength && input[candidate + length] === input[position + length]) length += 1;
          if (length > bestLength) {
            bestLength = length;
            bestDistance = distance;
            if (length === maxLength || length === 258) break;
          }
        }
      }
      if (bestLength >= 3) {
        tokens.push({ length: bestLength, distance: bestDistance });
        for (let index = 0; index < bestLength; index += 1) addLzPosition(heads, input, position + index);
        position += bestLength;
      } else {
        tokens.push({ literal: input[position] });
        addLzPosition(heads, input, position);
        position += 1;
      }
    }
    return tokens;
  }

  function deflateRaw(input) {
    const bytes = asUint8Array(input);
    assert(bytes.length <= MAX_BINARY_BYTES, 'DEFLATE入力が大きすぎます');
    const writer = new BitWriter();
    writer.write(1, 1); // BFINAL
    writer.write(1, 2); // BTYPE=01 (fixed Huffman)
    for (const token of tokenize(bytes)) {
      if (token.literal !== undefined) {
        const code = FIXED_LITERAL_CODES[token.literal];
        writer.write(code.code, code.bits);
        continue;
      }
      const lengthIndex = findCode(token.length, LENGTH_BASE);
      const lengthCode = FIXED_LITERAL_CODES[257 + lengthIndex];
      writer.write(lengthCode.code, lengthCode.bits);
      const lengthExtra = LENGTH_EXTRA[lengthIndex];
      if (lengthExtra) writer.write(token.length - LENGTH_BASE[lengthIndex], lengthExtra);
      const distanceIndex = findCode(token.distance, DISTANCE_BASE);
      const distanceCode = FIXED_DISTANCE_CODES[distanceIndex];
      writer.write(distanceCode.code, distanceCode.bits);
      const distanceExtra = DISTANCE_EXTRA[distanceIndex];
      if (distanceExtra) writer.write(token.distance - DISTANCE_BASE[distanceIndex], distanceExtra);
    }
    const endCode = FIXED_LITERAL_CODES[256];
    writer.write(endCode.code, endCode.bits);
    return writer.finish();
  }

  function inflateFixedBlock(reader, output) {
    while (true) {
      const symbol = decodeHuffman(reader, FIXED_LITERAL_DECODE);
      if (symbol < 256) {
        output.push(symbol);
        assert(output.length <= MAX_BINARY_BYTES, '展開後データが大きすぎます');
        continue;
      }
      if (symbol === 256) return;
      assert(symbol >= 257 && symbol <= 285, 'DEFLATEの長さ符号が不正です');
      const lengthIndex = symbol - 257;
      const length = LENGTH_BASE[lengthIndex] + reader.read(LENGTH_EXTRA[lengthIndex]);
      const distanceSymbol = decodeHuffman(reader, FIXED_DISTANCE_DECODE);
      assert(distanceSymbol >= 0 && distanceSymbol < DISTANCE_BASE.length, 'DEFLATEの距離符号が不正です');
      const distance = DISTANCE_BASE[distanceSymbol] + reader.read(DISTANCE_EXTRA[distanceSymbol]);
      assert(distance <= output.length, 'DEFLATEの距離が出力範囲外です');
      for (let index = 0; index < length; index += 1) output.push(output[output.length - distance]);
      assert(output.length <= MAX_BINARY_BYTES, '展開後データが大きすぎます');
    }
  }

  function inflateRaw(input) {
    const bytes = asUint8Array(input);
    assert(bytes.length <= MAX_URL_DATA_CHARS, '圧縮データが大きすぎます');
    const reader = new BitReader(bytes);
    const output = [];
    let final = false;
    while (!final) {
      final = reader.read(1) === 1;
      const type = reader.read(2);
      if (type === 0) {
        reader.align();
        const length = reader.read(8) | (reader.read(8) << 8);
        const complement = reader.read(8) | (reader.read(8) << 8);
        assert(((length ^ complement) & 0xffff) === 0xffff, 'DEFLATEの長さ補数が不正です');
        assert(output.length + length <= MAX_BINARY_BYTES, '展開後データが大きすぎます');
        for (let index = 0; index < length; index += 1) output.push(reader.read(8));
      } else if (type === 1) {
        inflateFixedBlock(reader, output);
      } else {
        fail('製品v1で未対応のDEFLATEブロックです');
      }
    }
    reader.assertEnd();
    return Uint8Array.from(output);
  }

  let crcTable = null;
  function getCrcTable() {
    if (crcTable) return crcTable;
    crcTable = Array.from({ length: 256 }, (_, value) => {
      let crc = value;
      for (let index = 0; index < 8; index += 1) crc = (crc & 1) ? (crc >>> 1) ^ 0xedb88320 : crc >>> 1;
      return crc >>> 0;
    });
    return crcTable;
  }

  function crc32(bytes) {
    let crc = 0xffffffff;
    const table = getCrcTable();
    for (const byte of asUint8Array(bytes)) crc = table[(crc ^ byte) & 0xff] ^ (crc >>> 8);
    return (crc ^ 0xffffffff) >>> 0;
  }

  function appendChecksum(body) {
    const bytes = asUint8Array(body);
    const checksum = crc32(bytes);
    const result = new Uint8Array(bytes.length + 4);
    result.set(bytes);
    result[bytes.length] = checksum & 0xff;
    result[bytes.length + 1] = (checksum >>> 8) & 0xff;
    result[bytes.length + 2] = (checksum >>> 16) & 0xff;
    result[bytes.length + 3] = (checksum >>> 24) & 0xff;
    return result;
  }

  function verifyChecksum(value) {
    const bytes = asUint8Array(value);
    assert(bytes.length >= 4, '共有データが短すぎます');
    const body = bytes.subarray(0, bytes.length - 4);
    const expected = bytes[bytes.length - 4]
      | (bytes[bytes.length - 3] << 8)
      | (bytes[bytes.length - 2] << 16)
      | (bytes[bytes.length - 1] << 24);
    assert((crc32(body) >>> 0) === (expected >>> 0), '共有データのチェックサムが一致しません');
    return body;
  }

  class BinaryWriter {
    constructor() {
      this.bytes = [];
    }

    byte(value) {
      assert(Number.isInteger(value) && value >= 0 && value <= 255, 'u8が範囲外です: ' + value);
      this.bytes.push(value);
    }

    u32(value) {
      assert(Number.isInteger(value) && value >= 0 && value <= MAX_U32, 'u32vが範囲外です: ' + value);
      let remaining = value;
      while (remaining >= 0x80) {
        this.byte((remaining & 0x7f) | 0x80);
        remaining = Math.floor(remaining / 0x80);
      }
      this.byte(remaining);
    }

    finish() {
      const body = Uint8Array.from(this.bytes);
      assert(body.length + 4 <= MAX_BINARY_BYTES, '共有データが大きすぎます');
      return appendChecksum(body);
    }
  }

  class BinaryReader {
    constructor(value) {
      this.bytes = asUint8Array(value);
      this.offset = 0;
      assert(this.bytes.length <= MAX_BINARY_BYTES, '共有データが大きすぎます');
    }

    byte() {
      assert(this.offset < this.bytes.length, '共有データが途中で終わっています');
      return this.bytes[this.offset++];
    }

    u32() {
      let value = 0;
      for (let index = 0; index < 5; index += 1) {
        const byte = this.byte();
        if (index === 4) assert((byte & 0x80) === 0 && byte <= 0x0f, 'u32vが長すぎます');
        value += (byte & 0x7f) * (2 ** (index * 7));
        if (!(byte & 0x80)) {
          if (index > 0) assert(value >= 2 ** (7 * index), 'u32vが非正規表現です');
          return value;
        }
      }
      fail('u32vが終端しません');
    }

    end() {
      assert(this.offset === this.bytes.length, '共有データの末尾に余剰データがあります');
    }
  }

  function toBase64Url(bytes) {
    const value = asUint8Array(bytes);
    let binary = '';
    for (let index = 0; index < value.length; index += 1) binary += String.fromCharCode(value[index]);
    let base64;
    if (typeof btoa === 'function') base64 = btoa(binary);
    else if (typeof Buffer !== 'undefined') base64 = Buffer.from(value).toString('base64');
    else fail('Base64エンコーダーがありません');
    return base64.replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/g, '');
  }

  function fromBase64Url(value) {
    assert(typeof value === 'string' && value.length > 0 && value.length <= MAX_URL_DATA_CHARS, 'Base64urlが不正です');
    assert(/^[A-Za-z0-9_-]+$/.test(value) && value.length % 4 !== 1, 'Base64urlの文字が不正です');
    const base64 = value.replaceAll('-', '+').replaceAll('_', '/') + '='.repeat((4 - (value.length % 4)) % 4);
    let binary;
    try {
      if (typeof atob === 'function') binary = atob(base64);
      else if (typeof Buffer !== 'undefined') binary = Buffer.from(base64, 'base64').toString('binary');
      else fail('Base64デコーダーがありません');
    } catch (error) {
      if (error instanceof FormationShareCodecError) throw error;
      fail('Base64urlを復号できません');
    }
    const result = new Uint8Array(binary.length);
    for (let index = 0; index < binary.length; index += 1) result[index] = binary.charCodeAt(index);
    return result;
  }

  function normalizeStateCode(value, kind) {
    if (value == null) return kind === 'star' ? 0 : kind === 'aside' ? 4 : 3;
    if (kind === 'aside' && value === 'notApplicable') return 5;
    assert(Number.isInteger(value), kind + 'が不正です');
    if (kind === 'star') assert(value >= 1 && value <= 5, '★が範囲外です');
    if (kind === 'aside') assert(value >= 0 && value <= 3, 'アサイド段階が範囲外です');
    if (kind === 'solder') assert(value >= 0 && value <= 2, 'はんだが範囲外です');
    return value;
  }

  function packMemberState(member) {
    assert(member && typeof member === 'object', '使徒状態が不正です');
    return normalizeStateCode(member.star, 'star') | (normalizeStateCode(member.asideRank, 'aside') << 3);
  }

  function unpackMemberState(value) {
    const star = value & 0x07;
    const aside = (value >>> 3) & 0x07;
    assert((value & 0xc0) === 0 && star <= 5 && aside <= 5, '使徒状態バイトが不正です');
    return {
      star: star === 0 ? null : star,
      asideRank: aside === 4 ? null : aside === 5 ? 'notApplicable' : aside
    };
  }

  function packCardState(card) {
    assert(card && typeof card === 'object', 'カード状態が不正です');
    return normalizeStateCode(card.star, 'star') | (normalizeStateCode(card.solder, 'solder') << 3);
  }

  function unpackCardState(value) {
    const star = value & 0x07;
    const solder = (value >>> 3) & 0x03;
    assert((value & 0xe0) === 0 && star <= 5 && solder <= 3, 'カード状態バイトが不正です');
    return { star: star === 0 ? null : star, solder: solder === 3 ? null : solder };
  }

  function decimalParts(value) {
    assert(value == null || (typeof value === 'number' && Number.isFinite(value) && value >= 0), '全体%補正が不正です');
    if (value == null) return null;
    const text = String(value);
    const match = text.match(/^(?:0|[1-9]\d*)(?:\.(\d{1,3}))?$/);
    assert(match, '全体%補正の十進表現が不正です: ' + value);
    return {
      integerText: text.split('.')[0],
      fractionText: (match[1] || '').replace(/0+$/, '')
    };
  }

  function normalizeGlobalPercent(snapshot) {
    if (snapshot.globalPercent == null) return null;
    if (Array.isArray(snapshot.globalPercent)) {
      assert(snapshot.globalPercent.length === GLOBAL_PERCENT_KEYS.length, '全体%補正の件数が不正です');
      return snapshot.globalPercent.slice();
    }
    assert(snapshot.globalPercent && typeof snapshot.globalPercent === 'object', '全体%補正が不正です');
    return GLOBAL_PERCENT_KEYS.map(key => snapshot.globalPercent[key] ?? null);
  }

  function getGlobalScale(values) {
    return values.reduce((scale, value) => Math.max(scale, decimalParts(value)?.fractionText.length || 0), 0);
  }

  function scaleDecimal(value, scale) {
    const parts = decimalParts(value);
    if (!parts) return null;
    const fraction = parts.fractionText.padEnd(scale, '0');
    const scaled = Number(parts.integerText) * (10 ** scale) + Number(fraction || 0);
    assert(Number.isSafeInteger(scaled) && scaled >= 0 && scaled <= MAX_U32, '全体%補正がu32範囲を超えています');
    return scaled;
  }

  function unscaleDecimal(value, scale) {
    return scale ? Number((value / (10 ** scale)).toFixed(scale)) : value;
  }

  function normalizeSnapshot(snapshot) {
    assert(snapshot && typeof snapshot === 'object', '共有スナップショットが不正です');
    assert(Number(snapshot.v ?? snapshot.version ?? VERSION) === VERSION, '共有形式版が不正です');
    assert(Number(snapshot.m ?? snapshot.catalogVersion ?? CATALOG_VERSION) === CATALOG_VERSION, '共有マスター版が不正です');
    const members = Array.isArray(snapshot.members) ? snapshot.members : [];
    const relicSlots = Array.isArray(snapshot.relicSlots) ? snapshot.relicSlots : [];
    const spells = Array.isArray(snapshot.spells) ? snapshot.spells : [];
    const powers = Array.isArray(snapshot.powers) ? snapshot.powers : [];
    assert(members.length === MAX_MEMBERS, '使徒枠は9件で固定です');
    assert(relicSlots.length === MAX_RELIC_SLOTS, '遺物枠は27件で固定です');
    assert(spells.length <= MAX_SPELL_ENTRIES, 'スペル件数が上限を超えています');
    assert(powers.length <= MAX_POWER_ENTRIES, '権能件数が上限を超えています');
    return {
      v: VERSION,
      m: CATALOG_VERSION,
      members,
      relicSlots,
      spells,
      powers,
      globalPercent: normalizeGlobalPercent(snapshot)
    };
  }

  function normalizeMember(member, catalog) {
    if (member == null) return null;
    assert(member && typeof member === 'object', '使徒枠が不正です');
    const id = member.id;
    getRef(catalog, 'apostles', id);
    return {
      id,
      star: member.star == null ? null : normalizeStateCode(member.star, 'star'),
      asideRank: member.asideRank === 'notApplicable'
        ? 'notApplicable'
        : member.asideRank == null
          ? null
          : normalizeStateCode(member.asideRank, 'aside')
    };
  }

  function normalizeCard(card, catalog, kind) {
    if (card == null) return null;
    assert(card && typeof card === 'object', 'カード枠が不正です');
    const id = card.id;
    getRef(catalog, kind, id);
    return {
      id,
      star: card.star == null ? null : normalizeStateCode(card.star, 'star'),
      solder: card.solder == null ? null : normalizeStateCode(card.solder, 'solder')
    };
  }

  function normalizeSpells(spells, catalog) {
    return spells.map(spell => {
      assert(spell && typeof spell === 'object', 'スペル項目が不正です');
      const normalized = normalizeCard(spell, catalog, 'spells');
      assert(Number.isInteger(spell.count) && spell.count >= 1 && spell.count <= MAX_SPELL_COUNT,
        'スペル枚数が範囲外です');
      return { ...normalized, count: spell.count };
    });
  }

  function normalizePowers(powers, catalog) {
    const seen = new Set();
    return powers.map(power => {
      assert(typeof power === 'string', '権能IDが不正です');
      getRef(catalog, 'masterPowers', power);
      assert(!seen.has(power), '権能が重複しています: ' + power);
      seen.add(power);
      return power;
    });
  }

  function normalizeSnapshotForCatalog(snapshot, catalog) {
    const normalized = normalizeSnapshot(snapshot);
    return {
      ...normalized,
      members: normalized.members.map(member => normalizeMember(member, catalog)),
      relicSlots: normalized.relicSlots.map(card => normalizeCard(card, catalog, 'artifacts')),
      spells: normalizeSpells(normalized.spells, catalog),
      powers: normalizePowers(normalized.powers, catalog)
    };
  }

  function aggregateSpells(spells, catalog) {
    const entries = [];
    const indexes = new Map();
    for (const spell of spells) {
      const ref = getRef(catalog, 'spells', spell.id);
      const state = packCardState(spell);
      const key = ref + ':' + state;
      const existingIndex = indexes.get(key);
      if (existingIndex === undefined) {
        indexes.set(key, entries.length);
        entries.push({ ...spell, count: spell.count });
      } else {
        const existing = entries[existingIndex];
        existing.count += spell.count;
        assert(existing.count <= MAX_SPELL_COUNT, '同一スペルの合計枚数が範囲外です');
      }
    }
    assert(entries.length <= MAX_SPELL_ENTRIES, 'スペル件数が上限を超えています');
    return entries;
  }

  function createRelicDictionary(relicSlots, catalog) {
    const entries = [];
    const indexes = new Map();
    const refs = relicSlots.map(card => {
      if (card == null) return 0;
      const ref = getRef(catalog, 'artifacts', card.id);
      const state = packCardState(card);
      const key = ref + ':' + state;
      let index = indexes.get(key);
      if (index === undefined) {
        assert(entries.length < MAX_RELIC_ENTRIES, '遺物辞書件数が上限を超えています');
        index = entries.length + 1;
        indexes.set(key, index);
        entries.push({ ...card });
      }
      return index;
    });
    return { entries, refs };
  }

  function normalizeGlobalValues(values) {
    if (values == null) return null;
    assert(Array.isArray(values) && values.length === GLOBAL_PERCENT_KEYS.length,
      '全体%補正の件数が不正です');
    return values.map(value => {
      decimalParts(value);
      return value == null ? null : Number(value) === 0 ? 0 : Number(value);
    });
  }

  function encodeGlobalPercent(writer, values) {
    const normalized = normalizeGlobalValues(values);
    assert(normalized !== null, '全体%補正がありません');
    const scale = getGlobalScale(normalized);
    assert(scale <= MAX_GLOBAL_SCALE, '全体%補正の小数桁が上限を超えています');
    let unknownMask = 0;
    normalized.forEach((value, index) => {
      if (value == null) unknownMask |= 1 << index;
    });
    writer.byte(scale);
    writer.u32(unknownMask);
    normalized.forEach(value => {
      if (value != null) writer.u32(scaleDecimal(value, scale));
    });
  }

  function decodeGlobalPercent(reader) {
    const scale = reader.byte();
    assert(scale <= MAX_GLOBAL_SCALE, '全体%補正の小数スケールが不正です');
    const unknownMask = reader.u32();
    assert((unknownMask & ~((1 << GLOBAL_PERCENT_KEYS.length) - 1)) === 0,
      '全体%補正の不明マスクが不正です');
    const values = GLOBAL_PERCENT_KEYS.map((_, index) => (
      unknownMask & (1 << index) ? null : unscaleDecimal(reader.u32(), scale)
    ));
    assert(getGlobalScale(values) === scale, '全体%補正のスケールが非正規です');
    return values;
  }

  function encodeBinary(snapshot, catalogInput) {
    const catalog = normalizeCatalog(catalogInput);
    const normalized = normalizeSnapshotForCatalog(snapshot, catalog);
    const relicDictionary = createRelicDictionary(normalized.relicSlots, catalog);
    const spells = aggregateSpells(normalized.spells, catalog);
    const writer = new BinaryWriter();
    MAGIC.forEach(value => writer.byte(value));
    writer.byte(VERSION);
    writer.u32(CATALOG_VERSION);
    const hasGlobalPercent = normalized.globalPercent !== null;
    writer.byte(hasGlobalPercent ? FLAGS.GLOBAL_PERCENT : 0);

    normalized.members.forEach(member => {
      if (member == null) {
        writer.u32(0);
      } else {
        writer.u32(getRef(catalog, 'apostles', member.id));
        writer.byte(packMemberState(member));
      }
    });

    writer.u32(relicDictionary.entries.length);
    relicDictionary.entries.forEach(card => {
      writer.u32(getRef(catalog, 'artifacts', card.id));
      writer.byte(packCardState(card));
    });
    relicDictionary.refs.forEach(ref => writer.u32(ref));

    writer.u32(spells.length);
    spells.forEach(spell => {
      writer.u32(getRef(catalog, 'spells', spell.id));
      writer.byte(packCardState(spell));
      writer.u32(spell.count);
    });

    writer.u32(normalized.powers.length);
    normalized.powers.forEach(power => writer.u32(getRef(catalog, 'masterPowers', power)));

    if (hasGlobalPercent) encodeGlobalPercent(writer, normalized.globalPercent);
    return writer.finish();
  }

  function assertMagic(reader) {
    MAGIC.forEach(expected => assert(reader.byte() === expected, '共有データの識別子が不正です'));
  }

  function decodeBinary(value, catalogInput) {
    const catalog = normalizeCatalog(catalogInput);
    const bytes = asUint8Array(value);
    const body = verifyChecksum(bytes);
    const reader = new BinaryReader(body);
    assertMagic(reader);
    assert(reader.byte() === VERSION, '未知の共有形式版です');
    assert(reader.u32() === CATALOG_VERSION, '未知の表示マスター版です');
    const flags = reader.byte();
    assert((flags & ~FLAGS.GLOBAL_PERCENT) === 0, '予約フラグが設定されています');

    const members = Array.from({ length: MAX_MEMBERS }, () => {
      const ref = reader.u32();
      if (ref === 0) return null;
      const id = getId(catalog, 'apostles', ref);
      return { id, ...unpackMemberState(reader.byte()) };
    });

    const relicEntryCount = reader.u32();
    assert(relicEntryCount <= MAX_RELIC_ENTRIES, '遺物辞書件数が上限を超えています');
    const relicEntries = [];
    const relicKeys = new Set();
    for (let index = 0; index < relicEntryCount; index += 1) {
      const id = getId(catalog, 'artifacts', reader.u32());
      const stateByte = reader.byte();
      const state = unpackCardState(stateByte);
      const key = id + ':' + stateByte;
      assert(!relicKeys.has(key), '遺物辞書が正規化されていません');
      relicKeys.add(key);
      relicEntries.push({ id, ...state });
    }
    const relicSlots = Array.from({ length: MAX_RELIC_SLOTS }, () => {
      const ref = reader.u32();
      assert(ref <= relicEntryCount, '遺物参照が範囲外です');
      return ref === 0 ? null : { ...relicEntries[ref - 1] };
    });

    const spellEntryCount = reader.u32();
    assert(spellEntryCount <= MAX_SPELL_ENTRIES, 'スペル件数が上限を超えています');
    const spells = [];
    const spellKeys = new Set();
    for (let index = 0; index < spellEntryCount; index += 1) {
      const id = getId(catalog, 'spells', reader.u32());
      const stateByte = reader.byte();
      const state = unpackCardState(stateByte);
      const count = reader.u32();
      assert(count >= 1 && count <= MAX_SPELL_COUNT, 'スペル枚数が範囲外です');
      const key = id + ':' + stateByte;
      assert(!spellKeys.has(key), 'スペル項目が集約されていません');
      spellKeys.add(key);
      spells.push({ id, ...state, count });
    }

    const powerCount = reader.u32();
    assert(powerCount <= MAX_POWER_ENTRIES, '権能件数が上限を超えています');
    const powers = [];
    const powerSet = new Set();
    for (let index = 0; index < powerCount; index += 1) {
      const id = getId(catalog, 'masterPowers', reader.u32());
      assert(!powerSet.has(id), '権能が重複しています');
      powerSet.add(id);
      powers.push(id);
    }

    const globalPercent = flags & FLAGS.GLOBAL_PERCENT ? decodeGlobalPercent(reader) : null;
    reader.end();
    return {
      v: VERSION,
      m: CATALOG_VERSION,
      members,
      relicSlots,
      spells,
      powers,
      globalPercent
    };
  }

  function encode(snapshot, options = {}) {
    const catalog = options.catalog || globalObject.TRICKCAL_FORMATION_SHARE_CATALOG;
    const normalized = normalizeSnapshotForCatalog(snapshot, normalizeCatalog(catalog));
    const binary = encodeBinary(normalized, catalog);
    const compressed = deflateRaw(binary);
    const payload = toBase64Url(compressed);
    assert(payload.length <= MAX_URL_DATA_CHARS, '共有URLデータが長すぎます');
    return {
      format: '1.z',
      snapshot: normalized,
      binary,
      compressed,
      payload
    };
  }

  function decode(payload, options = {}) {
    const catalog = options.catalog || globalObject.TRICKCAL_FORMATION_SHARE_CATALOG;
    const compressed = fromBase64Url(payload);
    const binary = inflateRaw(compressed);
    const snapshot = decodeBinary(binary, catalog);
    return { format: '1.z', snapshot, binary, compressed, payload };
  }

  function stripUrlSuffix(value) {
    return String(value).split(/[?#]/, 1)[0];
  }

  function createUrl(snapshot, options = {}) {
    const encoded = encode(snapshot, options);
    let baseUrl = options.baseUrl;
    if (!baseUrl) {
      if (globalObject.location?.href) {
        baseUrl = new URL('formation-share.html', globalObject.location.href).toString();
      } else {
        baseUrl = 'formation-share.html';
      }
    }
    return stripUrlSuffix(baseUrl) + '#1.z.' + encoded.payload;
  }

  function decodeHash(hash = globalObject.location?.hash || '', options = {}) {
    assert(typeof hash === 'string', '共有URLのfragmentが不正です');
    const fragment = hash.startsWith('#') ? hash.slice(1) : hash;
    const parts = fragment.split('.');
    assert(parts.length === 3 && parts[0] === String(VERSION) && parts[1] === 'z',
      '共有URL形式が不正です');
    return decode(parts[2], options);
  }

  const api = Object.freeze({
    VERSION,
    CATALOG_VERSION,
    FLAGS,
    GLOBAL_PERCENT_KEYS,
    LIMITS: Object.freeze({
      maxUrlDataChars: MAX_URL_DATA_CHARS,
      maxBinaryBytes: MAX_BINARY_BYTES,
      maxMembers: MAX_MEMBERS,
      maxRelicSlots: MAX_RELIC_SLOTS,
      maxRelicEntries: MAX_RELIC_ENTRIES,
      maxSpellEntries: MAX_SPELL_ENTRIES,
      maxPowerEntries: MAX_POWER_ENTRIES,
      maxSpellCount: MAX_SPELL_COUNT
    }),
    FormationShareCodecError,
    normalizeSnapshot: (snapshot, options = {}) => normalizeSnapshotForCatalog(
      snapshot,
      normalizeCatalog(options.catalog || globalObject.TRICKCAL_FORMATION_SHARE_CATALOG)
    ),
    crc32,
    deflateRaw,
    inflateRaw,
    encodeBinary,
    decodeBinary,
    encode,
    decode,
    createUrl,
    decodeHash,
    toBase64Url,
    fromBase64Url
  });

  globalObject.TRICKCAL_FORMATION_SHARE_CODEC = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
