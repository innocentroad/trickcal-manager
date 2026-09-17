'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { git } = require('./verify-public-site-git.js');
const { LEDGER_FILE } = require('./transfer-public-site-artifact.js');

function saveJson(file, value) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const temporary = file + '.' + crypto.randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temporary, JSON.stringify(value, null, 2) + '\n', { flag: 'wx' });
    fs.renameSync(temporary, file);
  } finally { if (fs.existsSync(temporary)) fs.unlinkSync(temporary); }
}
function receiptPath(input) {
  const destination = fs.realpathSync(input.destinationDir).toLowerCase();
  const key = crypto.createHash('sha256').update(destination).digest('hex').slice(0, 12);
  return path.join(path.dirname(input.bundlePath), 'delivery-' + input.candidateId + '-' + input.profile + '-' + key + '.json');
}
function scopeFromPlan(plan) {
  return {
    stagePaths: [...new Set([...plan.operations.write.map(x => x.path), ...plan.operations.delete.map(x => x.path), LEDGER_FILE])].sort(),
    deletedPaths: plan.operations.delete.map(x => x.path).sort()
  };
}
function loadReceipt(input, file, { allowPlanned = false } = {}) {
  file = file || receiptPath(input);
  if (!fs.existsSync(file)) throw new Error('receipt required: ' + file);
  const receipt = JSON.parse(fs.readFileSync(file, 'utf8'));
  if (receipt.schemaVersion !== 2 || receipt.candidateId !== input.candidateId || receipt.profile !== input.profile
    || fs.realpathSync(receipt.destinationDir) !== fs.realpathSync(input.destinationDir)
    || receipt.bundlePath !== input.bundlePath || !/^[0-9a-f]{40}$/.test(receipt.baseCommit)
    || (!allowPlanned && !receipt.applied)) throw new Error('receipt does not match this applied delivery');
  const plan = receipt.plan;
  if (!plan?.accepted || plan.candidateId !== input.candidateId || plan.profile !== input.profile
    || path.resolve(plan.destinationDir) !== path.resolve(input.destinationDir)) throw new Error('receipt plan mismatch');
  const expected = scopeFromPlan(plan);
  if (JSON.stringify(receipt.stagePaths) !== JSON.stringify(expected.stagePaths)
    || JSON.stringify(receipt.deletedPaths) !== JSON.stringify(expected.deletedPaths)) throw new Error('receipt scope mismatch');
  for (const name of receipt.stagePaths) {
    if (typeof name !== 'string' || /[\\:\0]/.test(name) || name.startsWith('/')
      || name.split('/').some(part => !part || part === '.' || part === '..')
      || /^(?:\.git|\.github)(?:\/|$)/i.test(name)) throw new Error('unsafe receipt path');
  }
  const build = JSON.parse(fs.readFileSync(input.buildPath));
  const owned = new Set(build.files.filter(x => x.profile === input.profile).map(x => input.profile === 'legacy' ? x.output.replace(/^trickcal-manager\//, '') : x.output));
  owned.add('public-site-deployment.json'); owned.add(LEDGER_FILE);
  let previous = new Set();
  const previousFiles = git(input.destinationDir, ['ls-tree', '--name-only', receipt.baseCommit, '--', LEDGER_FILE]).trim();
  if (previousFiles) {
    const ledger = JSON.parse(git(input.destinationDir, ['show', receipt.baseCommit + ':' + LEDGER_FILE]));
    if (ledger.profile !== input.profile) throw new Error('previous ledger profile mismatch');
    previous = new Set(ledger.ownedFiles.map(x => x.path));
  }
  for (const item of plan.operations.write) {
    if (!owned.has(item.path)) throw new Error('receipt write outside candidate: ' + item.path);
  }
  for (const name of receipt.deletedPaths) {
    if (!previous.has(name) || owned.has(name) || /^(?:\.git|\.github)(?:\/|$)/.test(name)) throw new Error('receipt deletion outside previous ownership: ' + name);
  }
  return { file, receipt };
}
function contextualError(error, receiptFile, phase) {
  error.message += '\nphase: ' + phase + '\nreceipt: ' + receiptFile
    + '\nresume: node tools/public-site-publication.js stage --receipt "' + receiptFile + '"';
  return error;
}
module.exports = { saveJson, receiptPath, scopeFromPlan, loadReceipt, contextualError };
