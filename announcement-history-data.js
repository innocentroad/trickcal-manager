                                                                             
                                                                                      
(function initAnnouncementHistoryData(root, factory) {
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.TRICKCAL_ANNOUNCEMENT_HISTORY_DATA = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function createAnnouncementHistoryData() {
  'use strict';

  const HISTORY = {
    schemaVersion: 1,
    source: 'user-provided-discord-announcements',
    entries: [
      { id: '20261008-feature-enemy-selection-defense', date: '2026-10-08', category: 'feature', title: '敵の選択・表示と防御条件を改善', items: ['敵プリセットを検索・コンテンツ・敵名で絞って選べるようにしました。次元の敵を追加・更新し、段階の高い順に表示します。', '敵データ画面をコンパクトに整理し、スマホでは敵の選択を別画面で開けるようにしました。', '敵の物理・魔法属性を補完しました。攻撃の種類やシールドなど、未設定の防御条件は通常計算で手動指定できます。設定済みの敵属性・行動条件と矛盾する効果は適用しません。'] },
      { id: '20261008-fix-lethe-life-job', date: '2026-10-08', category: 'fix', title: 'レーテーのアルバイト素材表示を修正', items: ['レーテーのアルバイト獲得素材が、使徒一覧・素材からの逆引きに表示されない不具合を修正しました。'] },
      { id: '20261008-game-data-lethe-yomi-enemies', date: '2026-10-08', category: 'game-data', title: 'レーテー・ヨミのアサイドと敵データを追加', items: ['レーテーの使徒・スキル・装備・ボード情報と、ヨミのアサイド情報を追加しました。', 'R41リニュアの激辛を含むエーリアスフロンティアの敵ステータスを更新し、次元21段階のイサムレヨン・ケルベロスを追加しました。', '敵プリセットをコンテンツ・敵ごとに並べて探しやすくしました。'] },
      { id: '20261008-fix-damage-dps-precision', date: '2026-10-08', category: 'fix', title: 'ダメージ計算・DPSβの精度を改善', items: ['命中ごとのダメージや会心率の丸め処理、行動別補正と一部の効果・タイミング処理を見直しました。', '確認済みの使徒についてDPS対応を追加しました。使徒・構成によっては未対応があり、飛翔時間などを簡略化した計算も含みます。'] },
      { id: '20261005-feature-tools-history', date: '2026-10-05', category: 'feature', title: 'ツール追加と操作の取り消しを改善', items: ['ツールにビンゴ最善手探索とPvP順位ナビを追加しました。', 'ステータス管理の取り消し・やり直しを見直し、使徒や画面の移動と内容の変更を分けて戻せるようにしました。', '上部ナビとスマホのジャンプボタン表示を調整しました。'] },
      { id: '20261004-feature-master-power-calc', date: '2026-10-04', category: 'feature', title: 'ダメージ計算に教主の権能を追加', items: ['教主の権能を選択し、対応する与ダメージ・被ダメージ補正やDPSの攻撃速度・SP回復・高学年クールタイム補助を反映できるようになりました。権能自身の攻撃は集計しません。', 'DPS下バーに権能のOFF／AUTO切り替えを追加しました。AUTOは一定間隔で使用する仮定の計算です。', '計算画面にページ内移動を追加し、コインの数字表示を編成画面に揃えました。'] },
      { id: '20261004-fix-favorite-artifact-display', date: '2026-10-04', category: 'fix', title: '愛用遺物の表示を調整', items: ['編成で使徒に対応する愛用遺物を選んだ場合、黄色い囲みではなく専用の背景で表示するようにしました。'] },
      { id: '20261004-fix-dps-calculation', date: '2026-10-04', category: 'fix', title: 'DPSβの計算と処理を改善', items: ['リニュアの高学年効果、エピカのアサイドA2以上、モモの分身体などの計算を見直しました。', 'DPS計算の処理を軽量化しました。対応は暫定で、一部のタイミングや効果には仮定・未対応があります。ゲーム内の結果との完全一致を保証するものではありません。'] },
      { id: '20261004-feature-calc-settings', date: '2026-10-04', category: 'feature', title: '計算設定の保存・持ち出しを改善', items: ['計算設定をJSONファイルで書き出し・読み込みできるようにしました。', '新しい計算保存は結果キャッシュを含めず、比較時に設定から再計算します。旧保存は確認付きで軽量化できます。', '保存件数と容量不足時の案内を追加し、ステータス管理の重複キャッシュも減らしました。ブラウザの容量によっては件数上限前に保存できない場合があります。'] },
      { id: '20261002-game-data-epica-belita-aside', date: '2026-10-02', category: 'game-data', title: 'エピカ・ベリータのアサイドに対応', items: ['エピカ・ベリータのアサイド情報とステータス補正を追加しました。', 'エピカは敵が1体の場合の普通攻撃追加命中を通常ダメージ計算に反映しました。エピカのアサイドA2以上は未対応効果があるため、DPS計算結果を表示しません。'] },
      { id: '20261002-feature-life-job-material-search', date: '2026-10-02', category: 'feature', title: 'アルバイト素材と使徒の検索を追加', items: ['素材から関連使徒、使徒から素材を探せるようになりました。', '研究素材の詳細から、関連使徒を確認できるようになりました。'] },
      { id: '20260929-game-data-mystic-species', date: '2026-09-29', category: 'game-data', title: '種族名表記を統一', items: ['種族名「？？？」を「ミスティック」に変更しました。'] },
      { id: '20260927-feature-apostle-data', date: '2026-09-27', category: 'feature', title: '使徒データを比較しやすく改善', items: ['使徒データの表示をコンパクトにし、Rank全体効果を一覧で比較できるようにしました。', 'アサイド等級で魔法防御が表示されない問題を修正しました。'] },
      { id: '20260927-feature-research-materials', date: '2026-09-27', category: 'feature', title: '研究の段階別情報と素材計画を追加', items: ['研究の段階ごとの効果、必要素材、研究時間を確認できるようにしました。', '残りの研究に必要な素材数と製作ツリーを追加しました。', '所持素材数を登録し、不足する素材数を確認できます。'] },
      { id: '20260927-fix-stat-rounding', date: '2026-09-27', category: 'fix', title: 'ステータス計算の精度を改善', items: ['ステータス計算の小数処理と丸め処理を見直しました。従来と表示値が変わる場合があります。', '旧保存データに再計算が必要と表示された場合は、ステータス管理で該当する育成設定を確認し、必要な項目を再設定して保存してください。'] },
      { id: '20260926-fix-aside-combat-power', date: '2026-09-26', category: 'fix', title: 'アサイドのステータス・戦闘力計算を更新', items: ['アサイドのステータス計算と戦闘力の計算式・端数処理を見直しました。従来と表示値が変わる場合があります。', 'ダメージ計算で敵使徒の育成設定を変更したときに、ステータスがずれる問題を修正しました。', '更新前の保存データを読み込んだ際の、計算値の更新処理を修正しました。', '旧保存データに再計算が必要と表示された場合は、ステータス管理で該当スロットの育成設定を確認し、不足項目を再設定して保存してください。'] },
      { id: '20260925-fix-crit-profile', date: '2026-09-25', category: 'fix', title: '会心率上限とダークモード表示を修正', items: ['通常計算・DPS計算の会心率上限を80%から75%へ変更しました。下限5%と確定会心100%は変更していません。', 'ダークモードで一部使徒のプロフィール画像背景が明るいままになる問題を修正しました。'] },
      { id: '20260925-game-data', date: '2026-09-25', category: 'game-data', title: 'ジョアン・研究11／12段階・次元の敵データを追加', items: ['ジョアンとスペルカード「ジョアンの祈りの権能」を追加しました。通常ダメージ計算に対応しています。DPS計算は未対応です。', '研究11・12段階のデータを追加しました。', '次元の衝突16～21段階に、活発のサライグマ・ハットツムリ・リリ一を追加しました。既存のリリ一18段階のステータスも更新しました。', 'サライグマ・ハットツムリのスキル倍率は未設定です。'] },
      { id: '20260925-feature', date: '2026-09-25', category: 'feature', title: '性格選択と研究の取得順に対応', items: ['裏面など、使徒ごとに候補が異なる性格選択に対応しました。ジョアンは憂鬱・純粋から選択できます。', '研究の段階ごとに異なる取得順と到達回数に対応しました。'] },
      { id: '20260919-feature', date: '2026-09-19', category: 'feature', title: 'データメニュー・使徒データを追加', items: ['確認用のデータメニューを新設しました。', '使徒データの閲覧ページを追加しました。'] },
      { id: '20260918-feature', date: '2026-09-18', category: 'feature', title: '編成共有の画像保存を正式追加', items: ['編成共有に画像保存機能を正式追加しました。'] },
      { id: '20260918-fix', date: '2026-09-18', category: 'fix', title: '編成共有の画像表示を修正', items: ['編成共有で画像が表示されない不具合を修正しました。'] },
      { id: '20260917-game-data', date: '2026-09-17', category: 'game-data', title: 'エルフィン・ジェイドのアサイドに対応', items: ['エルフィン・ジェイドのアサイドに対応しました。'] },
      { id: '20260917-feature', date: '2026-09-17', category: 'feature', title: 'DPSβでスノキーに仮対応', items: ['DPSβでスノキーに仮対応しました。'] },
      { id: '20260916-feature', date: '2026-09-16', category: 'feature', title: '新ドメインへ移行', items: ['サイトを新ドメインへ移行しました。保存データの引き継ぎ方法は、重要なお知らせをご確認ください。'] },
      { id: '20260911-game-data', date: '2026-09-11', category: 'game-data', title: 'シェルム・バリエに対応', items: ['シェルム・バリエに対応しました。'] },
      { id: '20260911-feature', date: '2026-09-11', category: 'feature', title: '編成共有機能を追加', items: ['編成をURLで共有できるようになりました。'] },
      { id: '20260903-game-data', date: '2026-09-03', category: 'game-data', title: 'ギデオン・シルフィールのアサイドに対応', items: ['ギデオン・シルフィールのアサイドに対応しました。'] },
      { id: '20260903-feature', date: '2026-09-03', category: 'feature', title: 'DPSβの仮対応使徒を追加', items: ['DPSβでエピカ・ギデオン・シルフィールに仮対応しました。'] },
      { id: '20260829-game-data', date: '2026-08-29', category: 'game-data', title: '敵プリセットにエリフロのイサムレヨンを追加', items: ['敵プリセットにエリフロのイサムレヨンを追加しました。登録ステータスは敵データページでも確認できます。'], historicalNotes: ['敵スキル倍率は普通攻撃のみの対応として追加しました。'] },
      { id: '20260828-fix', date: '2026-08-28', category: 'fix', title: 'スマホでの表示崩れを修正', items: ['スマホでの表示崩れに対応し、結果表示などを変更しました。'] },
      { id: '20260827-game-data', date: '2026-08-27', category: 'game-data', title: 'ピラ関連に対応', items: ['ピラ関連に対応しました。'] },
      { id: '20260827-feature', date: '2026-08-27', category: 'feature', title: 'DPS表示のβテスト版を追加', items: ['一部の使徒を対象に、DPS表示のβテスト版を追加しました。', '攻撃速度などの評価や、ダメージ構成率の表示に対応しました。'], historicalNotes: ['攻撃タイミングなどに未対応の条件があり、精度に制限があるβ版として公開しました。'] },
      { id: '20260820-game-data', date: '2026-08-20', category: 'game-data', title: 'ブランセ・フリックルのアサイドに対応', items: ['ブランセ・フリックルのアサイドに対応しました。'] },
      { id: '20260813-game-data', date: '2026-08-13', category: 'game-data', title: 'アヤのアサイド・スペルカードなどを追加', items: ['アヤのアサイド、スペルカード「アヤの雪の花魔法」などを追加しました。'] },
      { id: '20260813-feature', date: '2026-08-13', category: 'feature', title: '比較対象の選択・ボード進捗グラフを追加', items: ['ダメージ計算の比較モードで、比較対象を選択できるようになりました。', '全体ボードの各使徒に達成率グラフを追加しました。', '個別ボードに詳細な進捗グラフなどを追加しました。'] },
      { id: '20260808-feature', date: '2026-08-08', category: 'feature', title: 'ダメージ比較機能・結果表示の切り替えを追加', items: ['現在の設定を比較基準として保存し、設定変更時のダメージ変動を確認できる機能を追加しました。', '結果の表示を、会心率・会心ダメージ量・基礎ダメージ係数で切り替えられるようになりました。', '従来のボード現在／予定による比較を、追加クレヨン%へ移動しました。', 'ダメージ計算の詳細情報の表示を変更しました。'] },
      { id: '20260806-game-data', date: '2026-08-06', category: 'game-data', title: 'カンナ・ナイアのアサイドを追加', items: ['カンナ・ナイアのアサイドを追加しました。'] },
      { id: '20260806-feature', date: '2026-08-06', category: 'feature', title: '複数タブの保存挙動・全体ボードの表記を改善', items: ['複数タブで開いた場合の保存状態の挙動を改善しました。', '全体ボードの現在の全体効果値の表記を変更しました。'] },
      { id: '20260730-game-data', date: '2026-07-30', category: 'game-data', title: 'ロレット関連を追加', items: ['ロレット関連を追加しました。'] },
      { id: '20260728-feature', date: '2026-07-28', category: 'feature', title: '敵データ・ボード閲覧機能を拡充', items: ['スマホでの表示を改善し、その他の表示も調整しました。', '敵データを閲覧できるようになりました。', 'ダメージ計算のPvP指定時に、挑戦範囲を計算できるようになりました。', '全体ボードで、特殊マス・上級マス・ステータス・ボードを指定した達成率や必要リソースなどの集計詳細を確認できるようになりました。', '全体ボードからボードプレビューへ移動できるようになりました。各使徒のボード確認や未実装パターンの生成に利用できます。'] },
      { id: '20260723-game-data', date: '2026-07-23', category: 'game-data', title: 'ルード関連を追加', items: ['ルード関連を追加しました。'] },
      { id: '20260723-feature', date: '2026-07-23', category: 'feature', title: '一括設定に使徒設定を追加', items: ['一括設定に使徒設定を追加しました。'] },
      { id: '20260719-feature', date: '2026-07-19', category: 'feature', title: 'PvPに仮対応', items: ['敵側に使徒を設定できるようになり、PvPに仮対応しました。'] },
      { id: '20260717-game-data', date: '2026-07-17', category: 'game-data', title: 'ダーヤ・ティグ関連と基礎データを更新', items: ['ダーヤ・ティグ関連を追加しました。', '強化攻撃確率などのデータを更新しました。'] },
      { id: '20260717-feature', date: '2026-07-17', category: 'feature', title: '戦闘力計算の精度・処理を改善', items: ['戦闘力の計算精度を向上しました。', '処理などを改善しました。'] },
      { id: '20260717-fix', date: '2026-07-17', category: 'fix', title: '不具合を修正', items: ['不具合を修正しました。'] },
      { id: '20260709-game-data', date: '2026-07-09', category: 'game-data', title: 'アリス・シーラのアサイドを追加', items: ['アリス・シーラのアサイドを追加しました。'] },
      { id: '20260709-feature', date: '2026-07-09', category: 'feature', title: '計算結果の保存・操作の取り消し／やり直しを追加', items: ['ダメージ計算に計算結果の保存機能を追加しました。', 'ステータス管理に操作の取り消し・やり直し（undo／redo）を追加しました。'] },
      { id: '20260707-feature', date: '2026-07-07', category: 'feature', title: '動作の重さを改善', items: ['重くなっていた処理を改善しました。'] },
      { id: '20260705-feature', date: '2026-07-05', category: 'feature', title: '戦闘力表示・編成のコイン枚数算出を追加', items: ['管理ツールで戦闘力を表示するようにしました。', '総戦闘力から編成のコイン枚数を求められるようにしました。'], historicalNotes: ['追加時点では、戦闘力に100前後の誤差がある旨を告知しました。'] },
      { id: '20260703-game-data', date: '2026-07-03', category: 'game-data', title: 'バロン関連を追加', items: ['バロン関連の使徒・アサイド・ボード・遺物を追加しました。'] },
      { id: '20260625-game-data', date: '2026-06-25', category: 'game-data', title: 'シオン・リム関連を追加', items: ['シオン・リム関連を追加しました。'] },
      { id: '20260625-feature', date: '2026-06-25', category: 'feature', title: '使徒管理ツールを追加・計算機と連動', items: ['使徒管理ツールを追加し、ダメージ計算機と連動させました。'], historicalNotes: ['更新時点では旧計算機も残していました。'] },
      { id: '20260618-game-data', date: '2026-06-18', category: 'game-data', title: 'リニュア関連を追加', items: ['リニュア関連を追加しました。'] },
      { id: '20260611-game-data', date: '2026-06-11', category: 'game-data', title: 'ルポ・ヘイリーのアサイド関連を追加', items: ['ルポ・ヘイリーのアサイド関連を追加しました。'], historicalNotes: ['普通攻撃ダメージ量の補正がかかる位置は不明のため、仮置きとして追加しました。'] },
      { id: '20260605-game-data', date: '2026-06-05', category: 'game-data', title: 'リスティ関連・敵プリセットを追加', items: ['リスティ関連を追加しました。', 'プリセットにR41リニュア・イサムレヨンを追加しました。'] },
      { id: '20260605-feature', date: '2026-06-05', category: 'feature', title: 'クレヨン比較にアサイド全体効果の選択を追加', items: ['クレヨン比較に、アサイド全体効果を選択する機能を追加しました。'] }
    ]
  };

  function validateEntries(input) {
    const errors = [];
    if (!input || typeof input !== 'object' || Array.isArray(input)) {
      return { ok: false, errors: ['履歴データがobjectではありません'], entries: [] };
    }
    if (input.schemaVersion !== 1) errors.push('schemaVersionは1である必要があります');
    if (typeof input.source !== 'string' || !input.source.trim()) errors.push('sourceが必要です');
    if (!Array.isArray(input.entries)) errors.push('entriesはarrayである必要があります');
    const entries = Array.isArray(input.entries) ? input.entries : [];
    const ids = new Set();
    const allowedCategories = new Set(['game-data', 'feature', 'fix']);
    entries.forEach((entry, index) => {
      const label = `entries[${index}]`;
      if (!entry || typeof entry !== 'object' || Array.isArray(entry)) {
        errors.push(`${label}はobjectである必要があります`);
        return;
      }
      if (typeof entry.id !== 'string' || !entry.id.trim()) errors.push(`${label}.idが必要です`);
      else if (ids.has(entry.id)) errors.push(`${label}.idが重複しています: ${entry.id}`);
      else ids.add(entry.id);
      if (typeof entry.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(entry.date)
        || Number.isNaN(Date.parse(`${entry.date}T00:00:00Z`))
        || new Date(`${entry.date}T00:00:00Z`).toISOString().slice(0, 10) !== entry.date) {
        errors.push(`${label}.dateが実在するYYYY-MM-DDではありません`);
      }
      if (!allowedCategories.has(entry.category)) errors.push(`${label}.categoryが不正です`);
      if (typeof entry.title !== 'string' || !entry.title.trim()) errors.push(`${label}.titleが必要です`);
      if (!Array.isArray(entry.items) || !entry.items.length
        || entry.items.some(item => typeof item !== 'string' || !item.trim())) {
        errors.push(`${label}.itemsは空でない文字列arrayである必要があります`);
      }
      if (entry.historicalNotes !== undefined
        && (!Array.isArray(entry.historicalNotes)
          || entry.historicalNotes.some(note => typeof note !== 'string' || !note.trim()))) {
        errors.push(`${label}.historicalNotesは空でない文字列arrayである必要があります`);
      }
    });
    const sorted = entries.map((entry, sourceIndex) => ({ entry, sourceIndex }))
      .filter(item => item.entry && typeof item.entry === 'object')
      .sort((left, right) => {
        const byDate = String(right.entry.date || '').localeCompare(String(left.entry.date || ''));
        return byDate || left.sourceIndex - right.sourceIndex;
      })
      .map(item => item.entry);
    return { ok: errors.length === 0, errors, entries: sorted };
  }

  return Object.freeze({
    schemaVersion: HISTORY.schemaVersion,
    source: HISTORY.source,
    entries: HISTORY.entries,
    validateEntries
  });
});
