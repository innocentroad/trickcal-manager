#!/usr/bin/env node
'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { buildImageData, renderSource } = require('./generate-apostle-skill-image-data.js');

const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'apostle-skill-images-'));
try {
  const imageDir = path.join(tempRoot, 'Skill');
  fs.mkdirSync(imageDir, { recursive: true });
  fs.writeFileSync(path.join(imageDir, 'Icon_AdmissionSkill_Joanne.webp'), 'low');
  fs.writeFileSync(path.join(imageDir, 'Icon_GraduateSkill_Joanne.webp'), 'high');
  fs.writeFileSync(path.join(imageDir, 'Skill_F_Alice.webp'), 'standard-low');
  fs.writeFileSync(path.join(imageDir, 'Skill_P_Alice.webp'), 'passive');
  let data = buildImageData(imageDir);
  assert.deepEqual(data.Joanne, {
    high: 'img/Chara/Skill/Icon_GraduateSkill_Joanne.webp',
    low: 'img/Chara/Skill/Icon_AdmissionSkill_Joanne.webp'
  });
  assert.equal(data.Joanne.passive, undefined);
  assert.deepEqual(data.Alice, {
    low: 'img/Chara/Skill/Skill_F_Alice.webp',
    passive: 'img/Chara/Skill/Skill_P_Alice.webp'
  });
  assert.doesNotMatch(renderSource(data), /Skill_P_Joanne\.webp/);

  fs.writeFileSync(path.join(imageDir, 'Skill_P_Joanne.webp'), 'future-passive');
  data = buildImageData(imageDir);
  assert.equal(data.Joanne.passive, 'img/Chara/Skill/Skill_P_Joanne.webp');
  assert.match(renderSource(data), /Skill_P_Joanne\.webp/);
  console.log('Apostle skill image availability fixture passed.');
} finally {
  fs.rmSync(tempRoot, { recursive: true, force: true });
}
