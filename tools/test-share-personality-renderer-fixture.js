'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const personality = require('../formation-personality.js');
const source = fs.readFileSync(require.resolve('../formation-share.js'), 'utf8');
const instrumented = source.replace(/\}\)\(\);\s*$/, 'globalThis.__renderMember = renderMember;})();');
assert.notEqual(instrumented, source, 'share renderer must be loaded');
const context = {
  window: {
    TRICKCAL_FORMATION_SHARE_DISPLAY_DATA: {
      apostles: { Joanne: { name: 'ジョアン', personality: '裏面', personalityOptions: ['憂鬱', '純粋'], imagePath: 'img/Chara/Joanne.webp' } },
      artifacts: {}, spells: {}, masterPowers: {}, assets: {}
    },
    TRICKCAL_FORMATION_PERSONALITY: personality
  },
  document: { getElementById: () => ({ hidden: false, textContent: '' }) }
};
vm.runInNewContext(instrumented, context);
const member = { id: 'Joanne', star: 3, asideRank: 0 };
const render = (selection, version = 2) => context.__renderMember(member, [null, null, null], 0, {
  v: version, resonancePersonalities: [selection]
});
const invalid = render('冷静');
assert.match(invalid, /旧選択：冷静／現在の候補外/);
assert.doesNotMatch(invalid, /img\/性格_冷静\.webp|img\/性格_裏面\.webp/);
const unselected = render(null);
assert.match(unselected, /性格未選択/);
assert.doesNotMatch(unselected, /img\/性格_裏面\.webp/);
assert.match(render('憂鬱'), /img\/性格_憂鬱\.webp/);
assert.match(render(null, 1), /性格未選択/);
console.log('share renderer personality fixture: OK');
