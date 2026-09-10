'use strict';

const assert = require('node:assert/strict');
const zlib = require('node:zlib');
const catalog = require('../formation-share-catalog.js');
const codec = require('../formation-share-codec.js');

function expectError(action, message) {
  assert.throws(action, error => {
    assert.equal(error.name, 'FormationShareCodecError');
    if (message) assert.match(error.message, message);
    return true;
  });
}

function withChecksum(body) {
  const bytes = Uint8Array.from(body);
  const checksum = codec.crc32(bytes);
  return Uint8Array.from([
    ...bytes,
    checksum & 0xff,
    (checksum >>> 8) & 0xff,
    (checksum >>> 16) & 0xff,
    (checksum >>> 24) & 0xff
  ]);
}

function cloneBytes(value) {
  return Uint8Array.from(value);
}

const empty = {
  v: 1,
  m: 1,
  members: Array(9).fill(null),
  relicSlots: Array(27).fill(null),
  spells: [],
  powers: [],
  globalPercent: null
};

const emptyEncoded = codec.encode(empty, { catalog });
const emptyDecoded = codec.decode(emptyEncoded.payload, { catalog });
assert.deepEqual(emptyDecoded.snapshot, empty);
assert.deepEqual(
  Array.from(emptyEncoded.binary.slice(0, -4)),
  [
    0x54, 0x43, 0x53, 0x50, 0x01, 0x01, 0x00,
    ...Array(9).fill(0),
    0x00,
    ...Array(27).fill(0),
    0x00,
    0x00
  ]
);
assert.equal(codec.crc32(new TextEncoder().encode('123456789')), 0xcbf43926);
assert.deepEqual(
  Array.from(codec.inflateRaw(emptyEncoded.compressed)),
  Array.from(emptyEncoded.binary)
);
assert.deepEqual(
  Array.from(zlib.inflateRawSync(Buffer.from(emptyEncoded.compressed))),
  Array.from(emptyEncoded.binary)
);
assert.equal(codec.encode(empty, { catalog }).payload, emptyEncoded.payload);

const representative = {
  v: 1,
  m: 1,
  members: [
    { id: catalog.apostles[0], star: 5, asideRank: 3 },
    { id: catalog.apostles[1], star: null, asideRank: 0 },
    { id: catalog.apostles[2], star: 1, asideRank: null },
    { id: catalog.apostles[3], star: 2, asideRank: 'notApplicable' },
    { id: catalog.apostles[4], star: 3, asideRank: 1 },
    null,
    null,
    null,
    null
  ],
  relicSlots: [
    { id: catalog.artifacts[0], star: 5, solder: 2 },
    { id: catalog.artifacts[0], star: 5, solder: 2 },
    { id: catalog.artifacts[1], star: null, solder: null },
    ...Array(24).fill(null)
  ],
  spells: [
    { id: catalog.spells[0], star: 5, solder: 2, count: 2 },
    { id: catalog.spells[0], star: 5, solder: 2, count: 3 },
    { id: catalog.spells[0], star: 4, solder: 2, count: 1 },
    { id: catalog.spells[1], star: 1, solder: null, count: 1 }
  ],
  powers: [catalog.masterPowers[3], catalog.masterPowers[0]],
  globalPercent: [607, 6.07, 0, null, 1.2, null, null, null, null, 0.001]
};
const representativeEncoded = codec.encode(representative, { catalog });
const representativeDecoded = codec.decode(representativeEncoded.payload, { catalog });
const measurementBaseUrl = 'https://example.test/app/formation-share.html';
const representativeUrl = codec.createUrl(representative, {
  catalog,
  baseUrl: measurementBaseUrl + '?old=1#old'
});
assert.deepEqual(representativeDecoded.snapshot, {
  ...representative,
  relicSlots: representative.relicSlots,
  spells: [
    { id: catalog.spells[0], star: 5, solder: 2, count: 5 },
    { id: catalog.spells[0], star: 4, solder: 2, count: 1 },
    { id: catalog.spells[1], star: 1, solder: null, count: 1 }
  ]
});
assert.equal(representativeEncoded.format, '1.z');
assert.match(
  representativeUrl,
  /^https:\/\/example\.test\/app\/formation-share\.html#1\.z\.[A-Za-z0-9_-]+$/
);
assert.deepEqual(
  codec.decodeHash('#1.z.' + representativeEncoded.payload, { catalog }).snapshot,
  representativeDecoded.snapshot
);
assert.ok(representativeEncoded.payload.length < codec.LIMITS.maxUrlDataChars);

const full = {
  v: 1,
  m: 1,
  members: catalog.apostles.slice(0, 9).map((id, index) => ({
    id,
    star: (index % 5) + 1,
    asideRank: index % 4
  })),
  relicSlots: Array.from({ length: 27 }, (_, index) => ({
    id: catalog.artifacts[index],
    star: (index % 5) + 1,
    solder: index % 3
  })),
  spells: catalog.spells.map((id, index) => ({
    id,
    star: (index % 5) + 1,
    solder: index % 3,
    count: (index % 7) + 1
  })),
  powers: catalog.masterPowers.slice(),
  globalPercent: [607, 6.07, 0, 1.2, 12.345, null, 3, null, 0.001, 99.999]
};
const fullEncoded = codec.encode(full, { catalog });
assert.deepEqual(codec.decode(fullEncoded.payload, { catalog }).snapshot, full);
assert.ok(fullEncoded.payload.length < codec.LIMITS.maxUrlDataChars);
const emptyUrl = codec.createUrl(empty, { catalog, baseUrl: measurementBaseUrl });
const fullUrl = codec.createUrl(full, { catalog, baseUrl: measurementBaseUrl });

const excludedFields = codec.decode(codec.encode({
  ...representative,
  title: '非公開タイトル',
  level: 99,
  rank: 9,
  asideLevel: 3,
  skillLevels: { normal: 10 }
}, { catalog }).payload, { catalog }).snapshot;
assert.equal('title' in excludedFields, false);
assert.equal('level' in excludedFields, false);
assert.equal('rank' in excludedFields, false);
assert.equal('asideLevel' in excludedFields, false);
assert.equal('skillLevels' in excludedFields, false);

expectError(() => codec.encode({ ...empty, members: [
  { id: 'unknown-apostle', star: 1, asideRank: 0 }, ...Array(8).fill(null)
] }, { catalog }), /辞書にない/);
expectError(() => codec.encode({ ...empty, members: [
  { id: catalog.apostles[0], star: 6, asideRank: 0 }, ...Array(8).fill(null)
] }, { catalog }), /★が範囲外/);
expectError(() => codec.encode({ ...empty, spells: [
  { id: catalog.spells[0], star: 1, solder: 0, count: 0 }
] }, { catalog }), /スペル枚数/);
expectError(() => codec.encode({ ...empty, globalPercent: [
  1.2345, ...Array(9).fill(null)
] }, { catalog }), /十進表現/);
expectError(() => codec.encode({ ...empty, globalPercent: [
  -1, ...Array(9).fill(null)
] }, { catalog }), /全体%補正/);
expectError(() => codec.decode(emptyEncoded.payload.slice(0, -1) + (
  emptyEncoded.payload.endsWith('A') ? 'B' : 'A'
), { catalog }), /DEFLATE|チェックサム|共有データ/);

const oneMember = codec.encode({
  ...empty,
  members: [{ id: catalog.apostles[0], star: 1, asideRank: 0 }, ...Array(8).fill(null)]
}, { catalog }).binary;
const oneMemberBody = cloneBytes(oneMember.slice(0, -4));
oneMemberBody[6] = 0x02;
expectError(() => codec.decodeBinary(withChecksum(oneMemberBody), catalog), /予約フラグ/);
oneMemberBody[6] = 0x00;
oneMemberBody[8] |= 0x40;
expectError(() => codec.decodeBinary(withChecksum(oneMemberBody), catalog), /使徒状態/);
oneMemberBody[8] &= 0xbf;
oneMemberBody[7] = 0xff;
expectError(() => codec.decodeBinary(withChecksum(oneMemberBody), catalog), /辞書参照/);

const trailingBody = Uint8Array.from([...emptyEncoded.binary.slice(0, -4), 0]);
expectError(() => codec.decodeBinary(withChecksum(trailingBody), catalog), /余剰/);
const corruptBinary = cloneBytes(emptyEncoded.binary);
corruptBinary[corruptBinary.length - 1] ^= 0xff;
expectError(() => codec.decodeBinary(corruptBinary, catalog), /チェックサム/);

console.log(JSON.stringify({
  ok: true,
  catalog: {
    apostles: catalog.apostles.length,
    artifacts: catalog.artifacts.length,
    spells: catalog.spells.length,
    masterPowers: catalog.masterPowers.length
  },
  emptyPayloadChars: emptyEncoded.payload.length,
  representativePayloadChars: representativeEncoded.payload.length,
  fullPayloadChars: fullEncoded.payload.length,
  emptyUrlChars: emptyUrl.length,
  representativeUrlChars: representativeUrl.length,
  fullUrlChars: fullUrl.length,
  representativeBinaryBytes: representativeEncoded.binary.length,
  representativeCompressedBytes: representativeEncoded.compressed.length
}));
