#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '..', 'dps-support-registry.js'), 'utf8');

function record(id, statuses, name = id) {
  return { id, sourceId: id, name, statuses, note: '', sourceLine: 2 };
}
function timing(id, statuses, name = id) {
  return { id, sourceId: id, name, implementationStatuses: statuses, implementationNote: '' };
}
function makeRegistry(timingData) {
  const context = { window: {}, DPS_TIMING_DATA: timingData };
  vm.createContext(context);
  vm.runInContext(source, context, { filename: 'dps-support-registry.js' });
  return context.window.TRICKCAL_DPS_SUPPORT_REGISTRY;
}
function snapshot(targetId, { asideRank = 0, favorite = 0 } = {}) {
  return {
    targetId,
    skillLevels: { asideRank },
    selectedSkillOptions: favorite ? [{ sourceKey: `favorite:${favorite}:0` }] : []
  };
}

const done = { normal: '済', aside: '済', favorite: '済' };
const fixtureData = {
  apostles: {
    alpha: timing('alpha', { normal: '済', aside: '暫定', favorite: '済' }),
    bravo: timing('bravo', { normal: '暫定', aside: '未', favorite: '途中' }),
    nostatus: timing('noStatus', done),
    notiming: undefined
  },
  supportStatuses: {
    alpha: record('alpha', { normal: '済', aside: '暫定', favorite: '済' }),
    bravo: record('bravo', { normal: '暫定', aside: '未', favorite: '途中' }),
    notiming: record('noTiming', done)
  }
};
const registry = makeRegistry(fixtureData);
assert.ok(registry, 'support registry is exported');
assert.equal(registry.version, 3, 'manual configuration override registry is removed');

let result = registry.evaluate(snapshot('alpha'));
assert.equal(result.supported, true, 'normal-only requires normal only');
assert.equal(result.configuration, '通常');
assert.equal(result.provisional, false, 'non-required provisional aside must not badge normal-only');
assert.deepEqual(JSON.parse(JSON.stringify(result.requiredComponents)), [{ key: 'normal', label: '通常', status: '済' }]);

result = registry.evaluate(snapshot('alpha', { asideRank: 2 }));
assert.equal(result.supported, true, 'aside selection is supported when aside is 暫定');
assert.equal(result.configuration, '通常 + アサイド');
assert.equal(result.provisional, true);
assert.equal(result.provisionalLabel, 'アサイド');

result = registry.evaluate(snapshot('alpha', { favorite: 1 }));
assert.equal(result.supported, true, 'favorite selection is supported independently');
assert.equal(result.configuration, '通常 + 愛用品');
assert.equal(result.provisional, false, 'non-required aside provisional remains hidden');

result = registry.evaluate(snapshot('alpha', { asideRank: 1, favorite: 1 }));
assert.equal(result.supported, true);
assert.equal(result.configuration, '通常 + アサイド + 愛用品');
assert.equal(result.provisionalLabel, 'アサイド');

result = registry.evaluate(snapshot('bravo'));
assert.equal(result.supported, true, '暫定 normal is usable');
assert.equal(result.provisionalLabel, '通常');
assert.equal(result.implementationStatuses.normal, '暫定');
assert.equal(result.statusLabel, '通常: 暫定');

result = registry.evaluate(snapshot('bravo', { asideRank: 1 }));
assert.equal(result.supported, false, '未 aside blocks aside configuration');
assert.match(result.reason, /アサイド: 未/);
result = registry.evaluate(snapshot('bravo', { favorite: 1 }));
assert.equal(result.supported, false, '途中 favorite blocks favorite configuration');
assert.match(result.reason, /愛用品: 途中/);
result = registry.evaluate(snapshot('bravo', { asideRank: 1, favorite: 1 }));
assert.equal(result.supported, false, 'both selection checks every active component');
assert.match(result.reason, /アサイド: 未.*愛用品: 途中/);

assert.equal(registry.evaluate(snapshot('noStatus')).supported, false, 'status missing remains unsupported');
assert.match(registry.evaluate(snapshot('noTiming')).reason, /タイミングデータがありません/, 'timing missing remains unsupported');
assert.equal(registry.evaluate(snapshot('unknown')).supported, false, 'unknown apostle remains unsupported');

const timingSource = fs.readFileSync(path.join(__dirname, '..', 'dps-timing-data.js'), 'utf8');
const actualContext = { window: {} };
vm.createContext(actualContext);
vm.runInContext(timingSource, actualContext, { filename: 'dps-timing-data.js' });
vm.runInContext(source, actualContext, { filename: 'dps-support-registry.js' });
const actualRegistry = actualContext.window.TRICKCAL_DPS_SUPPORT_REGISTRY;
const timingData = vm.runInContext('DPS_TIMING_DATA', actualContext);
assert.equal(timingData.version, 8, 'generated timing schema is v8');
assert.deepEqual(JSON.parse(JSON.stringify(timingData.summary.implementationStatuses)), {
  normal: { '暫定': 15, '未': 48, '済': 12, '途中': 0 },
  aside: { '暫定': 8, '未': 60, '済': 7, '途中': 0 },
  favorite: { '暫定': 5, '未': 65, '済': 5, '途中': 0 }
}, 'generated data carries component-specific status summary');
assert.equal(actualRegistry.evaluate(snapshot('sylla')).supported, true, 'actual normal configuration is enabled by its normal status');
assert.equal(actualRegistry.evaluate(snapshot('sylla')).provisional, false, 'non-selected provisional aside does not badge');
assert.equal(actualRegistry.evaluate(snapshot('sylla', { asideRank: 2 })).provisionalLabel, 'アサイド', 'actual selected provisional aside is named');
assert.equal(actualRegistry.evaluate(snapshot('sylla', { favorite: 1 })).supported, false, 'actual blank favorite is 未');
const kidianAside = actualRegistry.evaluate(snapshot('kidian', { asideRank: 3 }));
assert.equal(kidianAside.supported, true, 'Kidian aside is enabled by its updated source status');
assert.equal(kidianAside.implementationStatuses.aside, '済', 'Kidian aside uses the source status');
assert.equal(kidianAside.provisional, false, 'Kidian aside is no longer provisional');

console.log('DPS component support registry tests passed');
