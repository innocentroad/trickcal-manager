const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const announcementData = require('../announcements-data');
const announcements = require('../announcements');
const storageBackup = require('../storage-backup');

class FakeClassList {
  constructor(node) { this.node = node; }
  values() { return new Set(String(this.node.className || '').split(/\s+/).filter(Boolean)); }
  write(values) { this.node.className = Array.from(values).join(' '); }
  add(...names) { const values = this.values(); names.forEach(name => values.add(name)); this.write(values); }
  remove(...names) { const values = this.values(); names.forEach(name => values.delete(name)); this.write(values); }
  contains(name) { return this.values().has(name); }
}

class FakeNode {
  constructor(document, tagName) {
    this.ownerDocument = document;
    this.nodeType = 1;
    this.tagName = String(tagName).toUpperCase();
    this.children = [];
    this.parentNode = null;
    this.attributes = new Map();
    this.dataset = {};
    this.className = '';
    this.id = '';
    this.classList = new FakeClassList(this);
    this.listeners = new Map();
    this.style = {
      values: new Map(),
      setProperty: (name, value) => this.style.values.set(name, String(value)),
      getPropertyValue: name => this.style.values.get(name) || ''
    };
    this._textContent = '';
    this.open = false;
    this.disabled = false;
    this.isContentEditable = false;
  }

  set textContent(value) {
    this._textContent = String(value ?? '');
    this.children = [];
  }

  get textContent() {
    return this._textContent + this.children.map(child => child.textContent).join('');
  }

  appendChild(child) {
    child.parentNode = this;
    this.children.push(child);
    return child;
  }

  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parentNode = null;
    }
    return child;
  }

  prepend(child) {
    child.parentNode = this;
    this.children.unshift(child);
    return child;
  }

  insertBefore(child, reference) {
    child.parentNode = this;
    const index = this.children.indexOf(reference);
    if (index < 0) this.children.push(child);
    else this.children.splice(index, 0, child);
    return child;
  }

  replaceChildren(...children) {
    this._textContent = '';
    this.children = [];
    children.filter(Boolean).forEach(child => this.appendChild(child));
  }

  setAttribute(name, value) {
    this.attributes.set(String(name), String(value));
    if (name === 'id') this.id = String(value);
    if (name === 'open') this.open = true;
    if (name === 'disabled') this.disabled = true;
  }

  getAttribute(name) { return this.attributes.has(String(name)) ? this.attributes.get(String(name)) : null; }

  removeAttribute(name) {
    this.attributes.delete(String(name));
    if (name === 'open') this.open = false;
    if (name === 'disabled') this.disabled = false;
  }

  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }

  removeEventListener(type, listener) {
    this.listeners.set(type, (this.listeners.get(type) || []).filter(item => item !== listener));
  }

  dispatchEvent(event) {
    const value = event || { type: 'event' };
    value.target = value.target || this;
    (this.listeners.get(value.type) || []).slice().forEach(listener => listener(value));
    return true;
  }

  click() { this.dispatchEvent({ type: 'click', target: this }); }
  focus() { this.ownerDocument.activeElement = this; }
  showModal() { this.open = true; this.setAttribute('open', ''); }
  close() { this.open = false; this.removeAttribute('open'); this.dispatchEvent({ type: 'close', target: this }); }

  get nextSibling() {
    if (!this.parentNode) return null;
    const index = this.parentNode.children.indexOf(this);
    return index >= 0 ? this.parentNode.children[index + 1] || null : null;
  }

  getBoundingClientRect() { return { height: 0, width: 0, top: 0, bottom: 0 }; }

  matches(selector) {
    const value = selector.trim();
    if (value.includes(',')) return value.split(',').some(part => this.matches(part));
    if (value === '*') return true;
    if (value === 'main') return this.tagName === 'MAIN';
    if (value === 'dialog') return this.tagName === 'DIALOG';
    if (value === 'dialog[open]') return this.tagName === 'DIALOG' && this.open;
    if (value === '[role="dialog"][aria-modal="true"]') return this.getAttribute('role') === 'dialog' && this.getAttribute('aria-modal') === 'true';
    if (value === '[data-modal-open="true"]') return this.getAttribute('data-modal-open') === 'true';
    if (value === '[data-calculation-busy="true"]') return this.getAttribute('data-calculation-busy') === 'true';
    if (value === '[data-calculating="true"]') return this.getAttribute('data-calculating') === 'true';
    if (value === '[data-announcement-display-settings]') return this.getAttribute('data-announcement-display-settings') === 'true';
    if (value === '[data-announcement-display-status]') return this.getAttribute('data-announcement-display-status') === 'true';
    if (value === '[data-announcement-restore]') return this.getAttribute('data-announcement-restore') === 'true';
    if (value === '[data-announcement-display-error]') return this.getAttribute('data-announcement-display-error') === 'true';
    if (value === '[data-announcement-trigger]') return this.getAttribute('data-announcement-trigger') === 'true';
    if (value === 'button') return this.tagName === 'BUTTON';
    if (value === 'a[href]') return this.tagName === 'A' && this.getAttribute('href') !== null;
    if (value.startsWith('#')) return this.id === value.slice(1) || this.getAttribute('id') === value.slice(1);
    if (value.startsWith('.')) return this.classList.contains(value.slice(1));
    if (value.startsWith('[tabindex]')) return this.getAttribute('tabindex') !== null;
    if (value.startsWith('button:not')) return this.tagName === 'BUTTON' && !this.disabled;
    if (value.startsWith('a[')) return this.tagName === 'A';
    if (value === 'input' || value === 'textarea' || value === 'select') return this.tagName === value.toUpperCase();
    return this.tagName.toLowerCase() === value.toLowerCase();
  }

  querySelectorAll(selector) {
    const found = [];
    const walk = node => {
      node.children.forEach(child => {
        if (child.matches(selector)) found.push(child);
        walk(child);
      });
    };
    walk(this);
    return found;
  }

  querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
}

class FakeDocument {
  constructor(page = 'dashboard', withTopbarTrigger = false) {
    this.activeElement = null;
    this.listeners = new Map();
    this.documentElement = new FakeNode(this, 'html');
    this.body = new FakeNode(this, 'body');
    this.documentElement.appendChild(this.body);
    const topBar = new FakeNode(this, 'section');
    topBar.className = page === 'calc' ? 'fdc-top-control-bar' : 'dashboard-top-control-bar';
    const host = new FakeNode(this, 'div');
    host.className = page === 'calc' ? 'fdc-top-actions' : 'dashboard-top-actions';
    const main = new FakeNode(this, 'main');
    main.className = page === 'calc' ? 'fdc-shell' : 'dashboard-main';
    this.body.appendChild(topBar);
    if (withTopbarTrigger) {
      const trigger = new FakeNode(this, 'button');
      trigger.className = 'topbar-announcement-trigger';
      trigger.setAttribute('data-announcement-trigger', 'true');
      topBar.appendChild(trigger);
    }
    this.body.appendChild(host);
    this.body.appendChild(main);
  }

  createElement(tagName) { return new FakeNode(this, tagName); }
  querySelector(selector) { return this.documentElement.querySelector(selector); }
  querySelectorAll(selector) { return this.documentElement.querySelectorAll(selector); }
  getElementById(id) { return this.querySelector(`#${id}`); }
  addEventListener(type, listener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type).push(listener);
  }
  dispatchEvent(event) {
    const value = event || { type: 'event' };
    value.target = value.target || this;
    (this.listeners.get(value.type) || []).slice().forEach(listener => listener(value));
    return true;
  }
}

class FakeStorage {
  constructor(initial = null) {
    this.value = initial;
    this.reads = 0;
    this.writes = 0;
    this.throwRead = false;
    this.throwWrite = false;
  }

  getItem() {
    this.reads += 1;
    if (this.throwRead) throw new Error('blocked read');
    return this.value;
  }

  setItem(_key, value) {
    this.writes += 1;
    if (this.throwWrite) throw new Error('quota');
    this.value = value;
  }
}

function createWindow(profile = 'new', { releaseEnabled = false, page = 'manager', search = '', hash = '' } = {}) {
  const legacy = profile === 'legacy';
  const pathname = page === 'calc'
    ? (legacy ? '/trickcal-manager/formation-damage-calc.html' : '/calc/')
    : page === 'data'
      ? (legacy ? '/trickcal-manager/data/' : '/data/')
    : page === 'other'
      ? (legacy ? '/trickcal-manager/other/' : '/other/')
      : (legacy ? '/trickcal-manager/stat-dashboard.html' : '/manager/');
  const location = {
      origin: legacy ? 'https://innocentroad.github.io' : 'https://trickcal.irlab.dev',
      hostname: legacy ? 'innocentroad.github.io' : 'trickcal.irlab.dev',
      pathname,
      search,
      hash
    };
  location.href = `${location.origin}${location.pathname}${location.search}${location.hash}`;
  return {
    location,
    history: {
      state: null,
      replaceState(state, _title, next) {
        const url = new URL(next, location.href);
        location.pathname = url.pathname;
        location.search = url.search;
        location.hash = url.hash;
        location.href = url.href;
        this.state = state;
      }
    },
    setTimeout,
    TRICKCAL_PUBLIC_SITE: {
      profile,
      pageUrl(route) {
        return { manager: legacy ? '/trickcal-manager/stat-dashboard.html' : '/manager/', transfer: legacy ? '/trickcal-manager/storage-transfer.html' : '/transfer/' }[route];
      },
      peerPageUrl(route, origin) {
        const base = origin.replace(/\/$/, '');
        return `${base}${route === 'manager' ? (legacy ? '/manager/' : '/trickcal-manager/stat-dashboard.html') : (legacy ? '/transfer/' : '/trickcal-manager/storage-transfer.html')}`;
      }
    },
    TRICKCAL_STORAGE_TRANSFER: {
      defaultSourceOrigin: 'https://innocentroad.github.io',
      defaultTargetOrigin: 'https://trickcal.irlab.dev'
    },
    TRICKCAL_ANNOUNCEMENTS_RELEASE_CONFIG: {
      releaseGate: 'announcements-migration-20260915',
      enabled: releaseEnabled,
      autoEnabled: true,
      bannerEnabled: true,
      profiles: ['new', 'legacy'],
      pages: ['manager', 'calc']
    }
  };
}

function controllerFor({ profile = 'new', storage = new FakeStorage(), config = {}, data = announcementData, backupController = null, withTopbarTrigger = false } = {}) {
  const document = new FakeDocument(config.page || 'dashboard', withTopbarTrigger);
  const window = createWindow(profile, {
    page: config.page || 'manager',
    search: config.search || '',
    hash: config.hash || ''
  });
  if (backupController) window.TRICKCAL_BACKUP_CONTROLLER = backupController;
  const controller = announcements.createController({
    window,
    document,
    data,
    storageLocal: storage,
    config: { fixture: true, scheduleAuto: false, bannerEnabled: true, profileOverride: profile, ...config },
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  return { controller, document, storage, window };
}

const testMigrationArticle = announcementData.articles[0];
const testRegularArticle = Object.freeze({
  id: 'test-regular-20260913',
  date: '2026-09-15',
  title: '通常のお知らせ',
  barTitle: '通常のお知らせ',
  summary: '通常記事のテスト表示です。',
  body: Object.freeze(['通常記事の本文です。']),
  profiles: Object.freeze(['new', 'legacy']),
  autoRevision: undefined,
  cta: null
});
const twoArticleTestData = Object.freeze({
  getArticles(profile) {
    return announcementData.getArticles(profile, [testMigrationArticle, testRegularArticle]);
  },
  getArticleForProfile(id, profile) {
    return announcementData.getArticleForProfile(id, profile, [testMigrationArticle, testRegularArticle]);
  }
});

{
  const fixture = controllerFor({ data: twoArticleTestData, withTopbarTrigger: true });
  fixture.controller.initialize();
  const bell = fixture.document.querySelector('[data-announcement-trigger]');
  assert(bell, '上バーのベルを通知controllerへ接続します');
  assert.equal(fixture.controller.getState().unreadCount, 2);
  bell.click();
  assert.equal(fixture.controller.getState().view, 'list', 'ベル押下では既存お知らせ一覧を開きます');
  assert.equal(fixture.controller.getState().unreadCount, 2, 'ベル押下だけでは既読にしません');
  fixture.document.querySelector('.trickcal-announcement-card-button').click();
  assert.equal(fixture.controller.getState().view, 'article');
  assert.equal(fixture.controller.getState().unreadCount, 1, '記事表示時だけ既読処理を行います');
  fixture.controller.close();
  assert.equal(fixture.document.activeElement, bell, '通知を閉じた後はベルへfocusを戻します');
}

const valid = announcementData.validateArticles(announcementData.articles);
assert.equal(valid.ok, true, '静的記事データが妥当です');
assert.equal(announcementData.validateArticles([{ ...announcementData.articles[0], id: announcementData.articles[0].id }]).ok, true);
assert.equal(announcementData.validateArticles([
  announcementData.articles[0],
  { ...announcementData.articles[1], id: announcementData.articles[0].id }
]).ok, false, '記事ID重複を拒否します');
assert.equal(announcementData.validateArticles([{ ...announcementData.articles[0], date: 'bad' }]).ok, false, '日付不正を拒否します');
assert.equal(announcementData.validateArticles([{ ...announcementData.articles[0], cta: 'apply-now' }]).ok, false, '未知CTAを拒否します');
assert.equal(announcementData.getArticles('legacy')[0].title, '新サイトへの移行のお知らせ');
assert.equal(announcementData.getArticles('new')[0].title, '旧サイトの保存データを引き継ぐ');
assert.equal(announcementData.getArticles('new')[0].barTitle, '旧サイトの保存データを引き継ぐ');
assert.match(announcementData.getArticles('new')[0].body[0], /旧サイトで使っていた保存データ/);
assert.deepEqual(
  announcements.sanitizeState({ version: 1, readIds: [], autoAcknowledged: [] }).dismissedIds,
  [],
  '旧形式の通知状態はdismissedIdsなしでも読めます'
);

assert.equal(storageBackup.datasetSpecs.some(spec => spec.ids.includes('preference.noticeState')), false, '通知状態を通常backupへ含めません');
assert.equal(storageBackup.rescueEntrySpecs.some(spec => spec.id === 'preference.noticeState'), false, '通知状態をrescueへ含めません');
assert.equal(storageBackup.isIncludedEntryId('preference.noticeState'), false, '通知状態をbackup entryへ含めません');

const targetPageSources = [
  'stat-dashboard.html',
  'formation-damage-calc.html'
].map(file => [file, fs.readFileSync(path.join(__dirname, '..', file), 'utf8')]);
targetPageSources.forEach(([file, source]) => {
  assert.match(source, /data-shared-topbar-page=/, `${file}が共通上バーを初期化しません`);
  assert.match(source, /shared-topbar\.css\?v=20260918(?:e|h)/, `${file}が共通上バーCSSを読み込みません`);
  assert.match(source, /shared-topbar\.js\?v=20260918(?:e|g|i)/, `${file}が共通上バーscriptを読み込みません`);
  assert.match(source, /announcements\.css\?v=20260915b/, `${file}が通知CSSを読み込みません`);
  assert.match(source, /announcements-release-config\.js\?v=20260915a[\s\S]*announcements-data\.js\?v=20260915b[\s\S]*announcements\.js\?v=20260915b/, `${file}が通知gateと資材を順序通り読み込みません`);
  assert.doesNotMatch(source, /TRICKCAL_ANNOUNCEMENTS_CONFIG\s*=\s*\{[^}]*\b(?:autoEnabled|bannerEnabled)\s*:\s*true/, `${file}で本番通知fixtureを有効化しています`);
});
assert.match(targetPageSources[0][1], /backup-source-description/, 'backup対象説明を通常画面へ表示しません');
['formation-damage-dps-prototype.html'].forEach(file => {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.doesNotMatch(source, /announcements(?:-data)?\.js|announcements\.css/, `${file}を通知の公開対象へ混入していません`);
});
['enemy-status.html', 'public/board-layout-preview.html'].forEach(file => {
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  assert.match(source, /announcements\.css\?v=20260918notice/, `${file}が共通通知CSSを読み込みません`);
  assert.match(source, /announcements-release-config\.js\?v=20260918notice[\s\S]*announcements-data\.js\?v=20260918notice[\s\S]*announcements\.js\?v=20260918notice/, `${file}が共通通知資材を順序通り読み込みません`);
});
const releaseConfigSource = fs.readFileSync(path.join(__dirname, '..', 'announcements-release-config.js'), 'utf8');
assert.match(releaseConfigSource, /releaseGate:\s*'announcements-migration-20260915'/);
assert.match(releaseConfigSource, /enabled:\s*true/, 'ローカル公開確認用gateをONにします');
assert.match(releaseConfigSource, /profiles:\s*Object\.freeze\(\['new',\s*'legacy'\]\)/);
assert.match(releaseConfigSource, /pages:\s*Object\.freeze\(\['manager',\s*'calc'\]\)/);
const announcementsSource = fs.readFileSync(path.join(__dirname, '..', 'announcements.js'), 'utf8');
const sharedTopbarSource = fs.readFileSync(path.join(__dirname, '..', 'shared-topbar.js'), 'utf8');
const sharedTopbarCssSource = fs.readFileSync(path.join(__dirname, '..', 'shared-topbar.css'), 'utf8');
assert.match(sharedTopbarSource, /createElementNS\(SVG_NS, ['"]svg['"]\)/, '共通上バーのSVGを名前空間付きで生成します');
assert.match(sharedTopbarSource, /formation:\s*'formation'[\s\S]*artifact:\s*'artifact'[\s\S]*spell:\s*'spell'[\s\S]*board:\s*'board'[\s\S]*bulk:\s*'bulk'/, 'manager内部操作キーを共通定義します');
assert.match(sharedTopbarSource, /MOBILE_ORDER\s*=\s*Object\.freeze\(\['calc',\s*'manager',\s*'artifact',\s*'board',\s*'theme',\s*'data',\s*'formation',\s*'spell',\s*'bulk',\s*'notice'\]\)/, 'スマホ操作順を確定順で共通管理します');
assert.match(sharedTopbarSource, /createElement\(['"]a['"], ['"]topbar-note-link['"]\)/, 'PCのnote導線を小さなリンクとして生成します');
assert.doesNotMatch(sharedTopbarSource, /topbar-note-link topbar-icon-action/, 'PCのnote導線にボタン用クラスを付けません');
assert.match(sharedTopbarSource, /topbarMenu\s*=\s*'data'/, 'データを共通ポップオーバーとして生成します');
assert.match(sharedTopbarSource, /topbarDataTarget/, 'データメニュー項目を識別属性付きで生成します');
assert.match(sharedTopbarSource, /installTopbarStateObserver/, 'managerの表示DOMを正として選択中状態を同期します');
assert.match(sharedTopbarSource, /event\.key !== 'Escape'/, '共通メニューのEscape閉じ処理を持ちます');
assert.doesNotMatch(sharedTopbarSource, /createElement\(['"]svg['"]\)/, 'SVG要素をHTML名前空間で生成しません');
assert.doesNotMatch(sharedTopbarCssSource, /content:\s*['"](?:ベル|☀|☾)['"]/, 'アイコン不表示を文字contentで補いません');
assert.match(announcementsSource, /trickcal-announcements-follow-bar/, '追随お知らせバーを共通controllerで生成します');
assert.match(announcementsSource, /data-announcement-trigger/, '共通ベルを既存通知controllerへ接続します');
assert.match(announcementsSource, /MIGRATION_ARTICLE_ID/, '移行バー対象を固定IDで選択します');
assert.doesNotMatch(announcementsSource, /createFollowBar\(notificationArticles\(\)\[0\]\)/, '移行バーを一般記事の先頭へ置き換えません');
assert.match(announcementsSource, /trickcal-open-backup-menu/, 'legacy manager CTAが既存保存メニューへ接続されていません');
assert.match(announcementsSource, /保存メニューを開く/, 'legacy managerの保存menu副導線がありません');
assert.match(announcementsSource, /旧サイトのバックアップ画面を開く/, '旧サイトbackup導線の文言が限定方針と一致しません');
assert.match(announcementsSource, /複数タブで同じサイトを開いている場合/, '複数タブ競合時の利用者案内がありません');
assert.doesNotMatch(announcementsSource, /trickcal-migration-banner/, '旧legacy専用バナーを共通controllerへ残しません');
const prototypeSource = fs.readFileSync(path.join(__dirname, '..', 'stat-prototype.js'), 'utf8');
assert.match(prototypeSource, /busy:\s*'保存処理が競合しています。.*そのタブを閉じて再試行してください。'/, 'full backupのbusy案内が複数タブ競合を説明しません');
assert.match(prototypeSource, /TRICKCAL_BACKUP_CONTROLLER/, '通常backupと通知CTAの共通controllerを登録しません');
assert.match(prototypeSource, /backupControllerPromise/, '共通backup controllerへ二重実行ガードがありません');
assert.match(prototypeSource, /downloadRequested/, 'backup controllerがdownload要求結果を保持しません');
assert.match(prototypeSource, /recoveryRequired/, 'backup controllerが後始末失敗を復旧必要として区別しません');
assert.match(prototypeSource, /retryable/, 'backup controllerが再試行可否を保持しません');
assert.match(prototypeSource, /backup-source-description/, 'backup対象説明の表示がありません');
const announcementsCssSource = fs.readFileSync(path.join(__dirname, '..', 'announcements.css'), 'utf8');
assert.match(announcementsCssSource, /trickcal-announcement-guide-link/, 'ガイドリンクのCSS classを描画側と一致させます');
assert.doesNotMatch(announcementsCssSource, /trickcal-announcements-guide-link/, '旧ガイドリンクclassの不一致を残しません');
assert.match(announcementsCssSource, /\.trickcal-announcements-follow-title\s*\{[\s\S]*overflow-wrap:\s*anywhere;[\s\S]*white-space:\s*normal;/, '追随バーのタイトルを文字拡大時に折り返せるようにします');
assert.doesNotMatch(announcementsCssSource, /\.trickcal-announcements-follow-title\s*\{[\s\S]*text-overflow:\s*ellipsis|\.trickcal-announcements-follow-title\s*\{[\s\S]*white-space:\s*nowrap/, '追随バーのタイトルをellipsis／nowrapへ戻しません');
const dashboardSource = fs.readFileSync(path.join(__dirname, '..', 'stat-dashboard.html'), 'utf8');
const dashboardRouteSource = fs.readFileSync(path.join(__dirname, '..', 'stat-dashboard.js'), 'utf8');
const dashboardCssSource = fs.readFileSync(path.join(__dirname, '..', 'stat-dashboard.css'), 'utf8');
const calcSource = fs.readFileSync(path.join(__dirname, '..', 'formation-damage-calc.html'), 'utf8');
const calcCssSource = fs.readFileSync(path.join(__dirname, '..', 'formation-damage-calc.css'), 'utf8');
const browserFixtureSource = fs.readFileSync(path.join(__dirname, 'fixtures', 'topbar-browser-fixture.html'), 'utf8');
assert.match(dashboardSource, /class="dashboard-bottom-bar"/, '既存manager下部操作を削除していません');
assert.match(dashboardSource, /shared-topbar\.js\?v=20260918(?:e|g|i)/, 'manager共通theme／操作生成scriptを読み込みません');
assert.match(dashboardRouteSource, /params\.get\('backup'\) === '1'/, 'バックアップ導線の初期routeを受け付けません');
assert.match(dashboardRouteSource, /params\.get\('notice'\) === 'migration-guide'/, '専用到着のnotice queryを認識しません');
assert.match(dashboardRouteSource, /focusBackup && !focusMigrationGuide/, '専用到着でbackup=1の保存メニューを重複表示します');
assert.match(dashboardRouteSource, /function openBackupMenu/, '同一画面バックアップ導線が共通helperを利用しません');
assert.match(dashboardRouteSource, /bottomSaveMenu\.open = true/, 'バックアップ導線が既存の保存メニューを開きません');
assert.match(dashboardRouteSource, /\.bottom-backup-section'\)\?\.scrollIntoView/, 'バックアップ導線が全体バックアップsectionへ到達しません');
assert.match(dashboardRouteSource, /trickcal-open-backup-menu/, 'お知らせから既存バックアップhelperを呼ぶイベントがありません');
assert.match(dashboardRouteSource, /setTimeout\(\(\) => openBackupMenu\(\{ focus: true \}\), 0\)/, 'CTA clickのバブリング前にbackup menuを開きます');
assert.doesNotMatch(dashboardRouteSource, /focusBackup[\s\S]{0,500}exportFullBackup/, 'バックアップ導線から自動exportを呼び出しています');
assert.match(dashboardRouteSource, /trickcal-announcements-layout-ready/, 'manager初期routeを追随バー生成後へ接続しません');
assert.match(dashboardCssSource, /--trickcal-top-occupied-height/, 'managerの上部占有高さを追随バーへ接続しません');
assert.match(calcCssSource, /--trickcal-top-occupied-height/, 'calcの上部占有高さを追随バーへ接続しません');
assert.match(calcCssSource, /\.fdc-perspective-toggle\s*\{[\s\S]*top:\s*calc\(var\(--trickcal-top-occupied-height\)\s*\+\s*0\.48rem\)/, '攻守切替を追随バー下へ配置しません');
assert.match(calcCssSource, /\.fdc-floating-target\s*\{[\s\S]*top:\s*calc\(var\(--trickcal-top-occupied-height\)\s*\+\s*0\.48rem\)/, '対象フロートを追随バー下へ配置しません');
assert.match(calcCssSource, /\.fdc-mobile-side-switch\s*\{[\s\S]*top:\s*calc\(var\(--trickcal-top-occupied-height\)\s*\+\s*4\.28rem\)/, '自／敵切替を追随バー下へ配置しません');
assert.doesNotMatch(calcCssSource, /top:\s*calc\(3\.25rem\s*\+\s*(?:0\.48|4\.28)rem\)/, '固定操作に旧上部固定値を残しません');
assert.match(calcSource, /shared-topbar\.js\?v=20260918(?:e|g|i)/, 'calc共通theme／操作生成scriptを読み込みません');
assert.match(browserFixtureSource, /shared-topbar\.css\?v=20260918(?:e|h)/, '通知fixtureが更新済み共通上バーCSSを読み込みません');
assert.match(browserFixtureSource, /shared-topbar\.js\?v=20260918(?:e|g|i)/, '通知fixtureが更新済み共通上バーscriptを読み込みません');
assert.match(dashboardRouteSource, /TRICKCAL_DASHBOARD_NAV/, 'manager上バーを既存画面切替APIへ接続します');
assert.doesNotMatch(dashboardRouteSource, /querySelectorAll\('\.topbar-global-menu\[open\]'\)/, '共通メニューの外側クリックを二重登録しません');
assert.match(prototypeSource, /TRICKCAL_DASHBOARD_NAV\s*=\s*Object\.freeze/, '既存画面切替処理を共通上バーから参照可能にします');
assert.match(prototypeSource, /querySelectorAll\('\[data-topbar-menu="bulk"\]'\)/, '既存manager処理を一括設定メニューだけへ限定します');
assert.doesNotMatch(prototypeSource, /querySelectorAll\('\.dashboard-top-tabs \.topbar-global-menu'\)/, '旧共通メニューセレクタでデータを一括設定扱いしません');
assert.match(sharedTopbarCssSource, /\.topbar-common-actions\s*>\s*:is\(a, button\):not\(\.topbar-note-link\)/, 'noteリンクへ補助ボタン寸法を適用しません');
assert.match(sharedTopbarCssSource, /topbar-mobile-grid\s*>\s*\.topbar-data-menu\s*>\s*\.topbar-data-popover/, 'スマホのデータメニューを左端から画面内に収めます');
['formation-damage-calc.html', 'formation-damage-dps-prototype.html', 'enemy-status.html'].forEach(file => {
  assert.match(fs.readFileSync(path.join(__dirname, '..', file), 'utf8'), /storage-transfer\.js\?v=20260913a/, `${file}が既存peer origin helperを読み込みません`);
});
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'public-route-manifest.json'), 'utf8'));
const manifestAssets = new Set(manifest.assets.map(asset => asset.source));
['shared-topbar.js', 'announcements-release-config.js', 'announcements-data.js', 'announcements.js', 'announcements.css'].forEach(asset => {
  assert.equal(manifestAssets.has(asset), true, `${asset}が公開asset台帳にありません`);
});

{
  const { controller, document, storage } = controllerFor({ profile: 'new' });
  assert.equal(controller.initialize(), true);
  assert.equal(controller.getState().bannerVisible, true, 'newにも追随お知らせバーを表示します');
  assert.equal(document.querySelectorAll('.trickcal-migration-banner').length, 0, '旧legacyバナーを残しません');
  assert.equal(controller.getState().unreadCount, 1);
  assert.equal(controller.getState().autoArticleId, null, '通常設定では自動表示しません');
  const followBar = document.querySelector('.trickcal-announcements-follow-bar');
  assert.equal(document.querySelector('.dashboard-top-control-bar').nextSibling, followBar, '追随バーを上部操作バー直下へ配置します');
  assert.match(followBar.getAttribute('aria-label'), /未読1件/);
  followBar.click();
  assert.equal(controller.getState().view, 'article', '追随バーから確定記事を開きます');
  assert.equal(controller.openArticleById('migration-file-first-20260914'), true);
  assert.equal(document.querySelector('#trickcal-announcements-title').textContent, '旧サイトの保存データを引き継ぐ');
  assert.equal(document.querySelectorAll('h3').length, 0, '記事見出しをdialog本文へ重複表示しません');
  assert.deepEqual(
    document.querySelectorAll('.trickcal-announcement-paragraph').map(node => node.textContent),
    announcementData.getArticles('new')[0].body,
    '確定文面の本文と記事データを一致させます'
  );
  const siteLink = document.querySelector('.trickcal-announcement-site-link');
  assert.equal(siteLink, null, 'new本文はprofile-awareの引き継ぎ表記へ切り替えます');
  assert.equal(document.querySelector('.trickcal-announcement-guide-button').textContent, '移行方法を見る');
  assert.deepEqual(controller.getState().readIds, ['migration-file-first-20260914']);
  assert.equal(controller.openGuide(), true);
  const writesBeforeClose = storage.writes;
  assert.equal(controller.getState().view, 'guide');
  assert.equal(document.querySelector('#trickcal-announcements-title').textContent, '保存データの移行方法');
  assert.equal(document.querySelectorAll('h3').length, 0, 'ガイド見出しをdialog本文へ重複表示しません');
  assert.equal(storage.writes, writesBeforeClose, '案内表示だけでは保存・移行処理を呼びません');
  assert.equal(document.querySelector('.trickcal-announcement-guide-details').open, false, '詳細情報は初期closedです');
  assert.match(document.querySelector('.trickcal-announcement-guide-confirm').textContent, /内容を確認してから、適用を確定できます/);
  const guideLinks = document.querySelectorAll('.trickcal-announcement-guide-link');
  const oldBackupLink = guideLinks.find(link => link.textContent === '旧サイトのバックアップ画面を開く');
  assert.match(oldBackupLink?.href || '', /stat-dashboard\.html\?view=settings&backup=1&notice=migration-guide$/, '旧バックアップ導線が直接移行ガイド入口を指しません');
  assert.equal(oldBackupLink?.target, '_blank', 'newから旧サイトへのbackup導線を同一タブへ変更します');
  controller.close();
  assert.equal(document.querySelector('#trickcal-announcements-dialog').open, false);
  assert.equal(document.activeElement, followBar, 'dialogを閉じると追随バーへfocusを戻します');
  followBar.click();
  const dialog = document.querySelector('#trickcal-announcements-dialog');
  const focusable = dialog.querySelectorAll('button');
  focusable[focusable.length - 1].focus();
  dialog.dispatchEvent({ type: 'keydown', key: 'Tab' });
  assert.equal(document.activeElement, focusable[0], 'dialogのTab終端を先頭へ循環させます');
  dialog.dispatchEvent({ type: 'cancel', preventDefault() {} });
  assert.equal(dialog.open, false, 'Escape相当のcancelでdialogを閉じます');
}

{
  const storage = new FakeStorage();
  const first = controllerFor({ profile: 'new', storage });
  first.controller.initialize();
  first.controller.openArticleById('migration-file-first-20260914');
  first.document.querySelector('.trickcal-announcement-dismiss').click();
  assert.deepEqual(first.controller.getState().dismissedIds, ['migration-file-first-20260914']);
  assert.equal(first.controller.getState().bannerVisible, false, '非表示後は追随バーを取り除きます');
  assert.equal(first.document.querySelector('.trickcal-announcements-follow-bar'), null);
  assert.equal(first.document.documentElement.style.getPropertyValue('--trickcal-follow-bar-height'), '0px');
  assert.equal(first.document.activeElement?.className, 'trickcal-announcement-display-settings-summary', '非表示後は表示設定のsummaryへfocusを移します');
  assert.equal(first.document.querySelector('.trickcal-announcement-display-settings').hidden, false);
  assert.equal(first.document.querySelector('.trickcal-announcement-restore').hidden, false);

  const reloaded = controllerFor({ profile: 'new', storage });
  reloaded.controller.initialize();
  assert.equal(reloaded.controller.getState().bannerVisible, false, '再読み込み後も非表示が保持されます');
  assert.equal(reloaded.controller.getState().unreadCount, 0, '非表示記事は未読数から除外します');
  reloaded.document.querySelector('.trickcal-announcement-restore').click();
  assert.equal(reloaded.controller.getState().dismissedIds.length, 0, '表示設定から移行案内を再表示できます');
  assert.equal(reloaded.controller.getState().bannerVisible, true);
  assert.equal(reloaded.document.activeElement?.className, 'trickcal-announcement-display-settings-summary', '再表示でも表示設定の操作位置へfocusを維持します');
}

{
  const storage = new FakeStorage();
  storage.throwWrite = true;
  const blocked = controllerFor({ profile: 'legacy', storage });
  blocked.controller.initialize();
  assert.doesNotThrow(() => {
    blocked.controller.openArticleById('migration-file-first-20260914');
    blocked.document.querySelector('.trickcal-announcement-dismiss').click();
  }, '非表示保存失敗でアプリを阻害しません');
  assert.equal(blocked.controller.getState().bannerVisible, false, '保存失敗でも現在画面では非表示を反映します');
  assert.equal(blocked.document.querySelector('.trickcal-announcement-display-error').hidden, false);
  const afterFailure = controllerFor({ profile: 'legacy', storage });
  afterFailure.controller.initialize();
  assert.equal(afterFailure.controller.getState().bannerVisible, true, '保存失敗後の再読み込みは非表示を断言しません');
}

{
  const fixture = controllerFor({ profile: 'new', data: twoArticleTestData });
  fixture.controller.initialize();
  let followBar = fixture.document.querySelector('.trickcal-announcements-follow-bar');
  assert.equal(followBar.dataset.articleId, 'migration-file-first-20260914', '初期バーが移行記事を指します');
  assert.match(followBar.textContent, /旧サイトの保存データを引き継ぐ/);
  assert.equal(followBar.listeners.get('click')?.length, 1, '初期バーへclick listenerを1つだけ接続します');

  followBar.click();
  assert.equal(fixture.document.querySelector('#trickcal-announcements-title').textContent, '旧サイトの保存データを引き継ぐ', '実click handlerで移行記事を開きます');
  fixture.document.querySelector('.trickcal-announcement-dismiss').click();

  followBar = fixture.document.querySelector('.trickcal-announcements-follow-bar');
  assert.equal(followBar, null, '移行案内を明示的に非表示にした後は一般記事へ置き換えません');

  fixture.document.querySelector('.trickcal-announcement-restore').click();
  followBar = fixture.document.querySelector('.trickcal-announcements-follow-bar');
  assert.equal(followBar.dataset.articleId, 'migration-file-first-20260914', '移行記事再表示後にバーの表示IDを戻します');
  assert.match(followBar.textContent, /旧サイトの保存データを引き継ぐ/);
  assert.equal(followBar.listeners.get('click')?.length, 1, '再表示後もclick listenerを1つだけ維持します');
  followBar.click();
  assert.equal(fixture.document.querySelector('#trickcal-announcements-title').textContent, '旧サイトの保存データを引き継ぐ', '再表示後の実click handlerが移行記事を開きます');
}

{
  const { controller, storage } = controllerFor({ profile: 'new', config: { autoEnabled: true } });
  controller.initialize();
  assert.equal(controller.maybeAutoOpen(), true, 'fixtureでは重要記事を一件だけ自動表示します');
  assert.equal(controller.getState().autoArticleId, 'migration-file-first-20260914');
  assert.deepEqual(controller.getState().autoAcknowledged, []);
  controller.close();
  assert.deepEqual(controller.getState().autoAcknowledged, [{ id: 'migration-file-first-20260914', revision: '1' }]);
  assert.equal(controller.getState().autoDecisionMade, true);
  assert.equal(controller.maybeAutoOpen(), false, '同じrevisionを再表示しません');
  const second = controllerFor({ profile: 'new', storage, config: { autoEnabled: true } }).controller;
  second.initialize();
  assert.equal(second.maybeAutoOpen(), false, '同じ保存状態の別controllerでも再表示しません');
}

{
  const storage = new FakeStorage();
  const { controller, document } = controllerFor({ profile: 'new', storage, config: { autoEnabled: true } });
  controller.initialize();
  assert.equal(controller.maybeAutoOpen(), true);
  document.querySelector('.trickcal-announcement-guide-button').click();
  assert.equal(controller.getState().view, 'guide', '自動記事から移行方法へ進めます');
  assert.deepEqual(controller.getState().autoAcknowledged, [{ id: 'migration-file-first-20260914', revision: '1' }], '移行方法へ進んだ時点で自動表示を確認済みにします');
  controller.close();
  const reloaded = controllerFor({ profile: 'new', storage, config: { autoEnabled: true } }).controller;
  reloaded.initialize();
  assert.equal(reloaded.maybeAutoOpen(), false, '案内を閉じて再読み込みしても同じ自動記事を再表示しません');
}

{
  const blocked = controllerFor({ profile: 'new', config: { autoEnabled: true } });
  const otherDialog = blocked.document.createElement('dialog');
  otherDialog.showModal();
  blocked.document.body.appendChild(otherDialog);
  blocked.controller.initialize();
  assert.equal(blocked.controller.maybeAutoOpen(), false, '他モーダル表示中は自動通知を割り込ませません');
  otherDialog.close();
  assert.equal(blocked.controller.maybeAutoOpen(), false, '安全な状態へ戻っても逃した初回機会を後追いしません');

  const calculating = controllerFor({ profile: 'new', config: { autoEnabled: true } });
  const calculation = calculating.document.createElement('div');
  calculation.className = 'is-calculating';
  calculating.document.body.appendChild(calculation);
  calculating.controller.initialize();
  assert.equal(calculating.controller.maybeAutoOpen(), false, '計算中は自動通知を割り込ませません');

  const input = controllerFor({ profile: 'new', config: { autoEnabled: true } });
  const field = input.document.createElement('input');
  input.document.body.appendChild(field);
  field.focus();
  input.controller.initialize();
  assert.equal(input.controller.maybeAutoOpen(), false, '入力中は自動通知を割り込ませません');
}

{
  const corrupted = new FakeStorage('{broken');
  const { controller } = controllerFor({ profile: 'new', storage: corrupted });
  assert.doesNotThrow(() => controller.initialize(), '破損した通知状態で起動を阻害しません');
  assert.equal(controller.getState().storageFallback, true);
  corrupted.throwWrite = true;
  assert.doesNotThrow(() => controller.openArticleById('migration-file-first-20260914'), '通知状態のquota失敗を伝播しません');
  const blocked = new FakeStorage();
  blocked.throwRead = true;
  blocked.throwWrite = true;
  const blockedController = controllerFor({ profile: 'new', storage: blocked }).controller;
  assert.doesNotThrow(() => blockedController.initialize(), 'blocked storageでUIを阻害しません');
}

{
  const legacyBackupRequests = [];
  let legacyMenuRequests = 0;
  const legacyBackupController = {
    state: { phase: 'idle', resultCode: null, message: '', recoveryRequired: false },
    getState() { return this.state; },
    subscribe(listener) { listener(this.state); return () => {}; },
    request() {
      legacyBackupRequests.push('request');
      this.state = { phase: 'finished', resultCode: 'download-requested', message: 'ダウンロードを開始しました。', recoveryRequired: false };
      return Promise.resolve({ ok: true, code: 'download-requested' });
    }
  };
  const legacy = controllerFor({ profile: 'legacy', config: { bannerEnabled: true }, backupController: legacyBackupController });
  legacy.controller.initialize();
  legacy.document.addEventListener('trickcal-open-backup-menu', () => { legacyMenuRequests += 1; });
  assert.equal(legacy.controller.getState().bannerVisible, true, 'legacyにも追随お知らせバーを表示します');
  const legacyBanner = legacy.document.querySelector('.trickcal-announcements-follow-bar');
  assert.match(legacyBanner.textContent, /お知らせ/);
  assert.match(legacyBanner.textContent, /新サイトへの移行について/);
  assert.equal(legacy.document.querySelectorAll('.trickcal-migration-banner').length, 0, '旧legacyバナーを二重表示しません');
  assert.equal(legacy.document.querySelector('.dashboard-top-control-bar').nextSibling, legacyBanner, 'legacy manager追随バーを上部バー直下へ配置します');
  const links = legacy.controller.getLinks();
  assert.match(links.newTransfer, /^https:\/\/trickcal\.irlab\.dev\//);
  legacy.controller.openGuide();
  const legacyManagerBackup = legacy.document.querySelectorAll('.trickcal-announcement-guide-link').find(link => link.textContent === 'バックアップを保存');
  assert.equal(legacyManagerBackup?.tagName, 'BUTTON', 'legacy managerのCTAを保存要求ボタンにします');
  assert.equal(legacyManagerBackup?.getAttribute('href'), null, 'legacy manager CTAに別画面リンクを残します');
  legacyManagerBackup.click();
  assert.deepEqual(legacyBackupRequests, ['request'], 'legacy manager CTAが既存backup controllerへ要求します');
  assert.equal(legacy.document.querySelector('#trickcal-announcements-dialog').open, true, 'backup開始時も通知dialogを閉じません');
  const legacyManagerMenu = legacy.document.querySelectorAll('.trickcal-announcement-guide-link').find(link => link.textContent === '保存メニューを開く');
  assert.equal(legacyManagerMenu?.tagName, 'BUTTON', 'legacy managerの副導線を同一画面buttonにします');
  legacyManagerMenu.click();
  assert.equal(legacyMenuRequests, 1, 'legacy managerの副導線が既存保存menu eventを発行します');
  assert.equal(legacyBackupRequests.length, 1, '副導線からexportを追加起動しません');
  assert.equal(legacy.document.querySelector('#trickcal-announcements-dialog').open, false, '保存menu導線では通知dialogを閉じます');
  const legacyCalc = controllerFor({ profile: 'legacy', config: { bannerEnabled: true, page: 'calc' } });
  legacyCalc.controller.initialize();
  legacyCalc.controller.openGuide();
  const legacyCalcBackup = legacyCalc.document.querySelectorAll('.trickcal-announcement-guide-link').find(link => link.textContent === '旧サイトのバックアップ画面を開く');
  assert.equal(legacyCalcBackup?.tagName, 'A', 'legacy calcのCTAを通常リンクにしません');
  assert.equal(legacyCalcBackup?.target, '_self', 'legacy calcの旧manager案内を同一タブにしません');
  assert.match(legacyCalcBackup?.href || '', /stat-dashboard\.html\?view=settings&backup=1&notice=migration-guide$/, 'legacy calcの同一タブ導線が直接移行ガイド入口を指しません');
  assert.equal(legacyCalc.document.querySelector('.fdc-top-control-bar').nextSibling, legacyCalc.document.querySelector('.trickcal-announcements-follow-bar'), '計算画面追随バーを計算上部バー直下へ配置します');
  const newSite = controllerFor({ profile: 'new', config: { bannerEnabled: true } });
  newSite.controller.initialize();
  assert.equal(newSite.controller.getState().bannerVisible, true, 'newにもlegacy専用でない追随バーを表示します');
  assert.match(newSite.document.querySelector('.trickcal-announcements-follow-bar').textContent, /旧サイトの保存データを引き継ぐ/);
  newSite.controller.openGuide();
  const newOldBackup = newSite.document.querySelectorAll('.trickcal-announcement-guide-link').find(link => link.textContent === '旧サイトのバックアップ画面を開く');
  assert.equal(newOldBackup?.target, '_blank', 'newの旧サイト導線を別Originの別タブで維持します');
  const localhost = controllerFor({ profile: 'localhost', config: { bannerEnabled: true } });
  localhost.controller.initialize();
  localhost.controller.openGuide();
  const localhostOldBackup = localhost.document.querySelectorAll('.trickcal-announcement-guide-link').find(link => link.textContent === '旧サイトのバックアップ画面を開く');
  assert.equal(localhostOldBackup?.tagName, 'A', 'localhostをlegacy managerの同一画面CTAへ誤判定します');
  assert.equal(localhostOldBackup?.target, '_blank', 'localhostを本番legacyと誤判定して同一画面遷移します');
}

{
  const originalState = {
    version: 1,
    readIds: ['migration-file-first-20260914'],
    autoAcknowledged: [{ id: 'migration-file-first-20260914', revision: '1' }],
    dismissedIds: ['migration-file-first-20260914']
  };
  const storage = new FakeStorage(JSON.stringify(originalState));
  const arrival = controllerFor({
    profile: 'legacy',
    storage,
    config: {
      search: '?view=settings&backup=1&notice=migration-guide&keep=1',
      hash: '#backup',
      autoEnabled: true,
      bannerEnabled: true
    }
  });
  arrival.controller.initialize();
  assert.equal(arrival.controller.getState().view, 'guide', '旧manager専用到着では移行ガイドを直接開きます');
  assert.deepEqual(JSON.parse(storage.value), originalState, '専用到着でも通知の非表示・確認済み状態を変更しません');
  assert.equal(arrival.window.location.search, '?view=settings&keep=1', '専用到着後はnoticeとbackupだけを消費します');
  assert.equal(arrival.window.location.hash, '#backup', '専用到着後もhashを保持します');
  arrival.controller.close();
  const reloaded = announcements.createController({
    window: arrival.window,
    document: new FakeDocument('dashboard'),
    storageLocal: storage,
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  reloaded.initialize();
  assert.equal(reloaded.getState().view, 'list', '専用到着を閉じた再読み込みではガイドを再表示しません');
  assert.equal(reloaded.getState().dialogOpen, false);
}

{
  const productionLegacyStorage = new FakeStorage();
  const productionLegacy = announcements.createController({
    window: createWindow('legacy', { releaseEnabled: true }),
    document: new FakeDocument('dashboard'),
    storageLocal: productionLegacyStorage,
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  productionLegacy.initialize();
  assert.equal(productionLegacy.getState().releaseGateOpen, true, '公開確認用gate ONを本番経路で認識します');
  assert.equal(productionLegacy.getState().bannerVisible, true, 'gate ONのlegacy managerに追随バーを表示します');
  assert.equal(productionLegacy.maybeAutoOpen(), true, 'fixtureなしのlegacy managerで初回通知を表示します');
  assert.equal(productionLegacy.getState().autoArticleId, 'migration-file-first-20260914');
  productionLegacy.close();
  const legacyReload = announcements.createController({
    window: createWindow('legacy', { releaseEnabled: true }),
    document: new FakeDocument('dashboard'),
    storageLocal: productionLegacyStorage,
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  legacyReload.initialize();
  assert.equal(legacyReload.maybeAutoOpen(), false, 'fixtureなしでも確認済みrevisionを再表示しません');
  assert.equal(legacyReload.getState().bannerVisible, true, '通知を閉じても追随バーは残ります');
}

{
  const newSite = announcements.createController({
    window: createWindow('new', { releaseEnabled: true }),
    document: new FakeDocument('dashboard'),
    storageLocal: new FakeStorage(),
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  newSite.initialize();
  assert.equal(newSite.maybeAutoOpen(), true, 'fixtureなしのnew managerで初回通知を表示します');
  assert.equal(newSite.getState().bannerVisible, true, 'gate ONのnew managerにも追随バーを表示します');
}

{
  const off = announcements.createController({
    window: createWindow('legacy', { releaseEnabled: false }),
    document: new FakeDocument('dashboard'),
    storageLocal: new FakeStorage(),
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  off.initialize();
  assert.equal(off.getState().releaseGateOpen, false, 'gate OFFでは自動通知・バナーを表示しません');
  assert.equal(off.getState().bannerVisible, false, 'gate OFFの追随バーを表示しません');
  assert.equal(off.maybeAutoOpen(), false, 'gate OFFでは自動通知を表示しません');
}

{
  const target = announcements.createController({
    window: createWindow('legacy', { releaseEnabled: true, page: 'other' }),
    document: new FakeDocument('dashboard'),
    storageLocal: new FakeStorage(),
    runtimeState: { lifecycle: 'ready', permission: 'allowed' }
  });
  target.initialize();
  assert.equal(target.getState().releaseGateOpen, false, '対象外pageではgate ON設定を適用しません');
  assert.equal(target.getState().bannerVisible, false, '対象外pageではlegacy bannerを表示しません');
  assert.equal(target.maybeAutoOpen(), false, '対象外pageでは自動通知を表示しません');
}

console.log('announcements tests passed: A1 storage isolation, wording, gate, auto acknowledgement/safety, backup route, banner placement/profile');
