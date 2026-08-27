'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.resolve(__dirname, '..', 'formation-damage-calc.js'), 'utf8');
const marker = '  function getFdcUniqueTextLines(';
const start = source.indexOf(marker);
assert.notEqual(start, -1, 'getFdcUniqueTextLines が存在する');
const end = source.indexOf('\n  function ', start + marker.length);
assert.notEqual(end, -1, 'getFdcUniqueTextLines の終端を取得できる');

const context = {};
vm.runInNewContext(`
  function normalizeFdcArray(value) {
    return Array.isArray(value) ? value : [value];
  }
  ${source.slice(start + 2, end)}
  this.api = { getFdcUniqueTextLines };
`, context);

assert.deepEqual(
  Array.from(context.api.getFdcUniqueTextLines([
    'スキル名: 4秒ごとに雪の花満開の効果がチャージされる。',
    '4秒ごとに雪の花満開の効果がチャージされる。',
    '4秒ごとに雪の花満開の効果がチャージされる。',
    '低学年スキルの蝶が敵に衝突すると凍傷を付与する。',
    '低学年スキルの蝶が敵に衝突すると凍傷を付与する。',
    '条件: 次の普通攻撃命中時'
  ])),
  [
    'スキル名: 4秒ごとに雪の花満開の効果がチャージされる。',
    '低学年スキルの蝶が敵に衝突すると凍傷を付与する。',
    '条件: 次の普通攻撃命中時'
  ],
  'ラベル付き本文と、スキル・効果説明の重複を1回へまとめる'
);

console.log('FDC info text dedupe tests passed');
