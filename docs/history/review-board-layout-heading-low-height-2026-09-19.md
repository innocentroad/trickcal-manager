# Board preview low-height and data heading review follow-up — 2026-09-19

## Scope and preservation

Work was limited to the existing `release-source` worktree. The existing dirty aside-preload, shared-topbar, overlap-test, and earlier page-layout changes were retained. No commit, push, publication, workflow, or publication-setting change was performed.

The board/enemy H1 markup and compact styles were already present as dirty work at task start, but both page stylesheets still hid their prefix/separator on narrow screens. This pass removed those mobile hide rules without changing the heading markup. The application stylesheets edited in this pass were `public/board-layout-preview.css` and `enemy-status.css`; `enemy-status.html` was left unchanged. The native browser regression `tools/test-board-layout-preview-native.js` was added from the main-side focused test and adapted to run using only release-source files and routes.

## Findings and implementation

The template settings panel's `max-height` and `overflow-y:auto` were confined to the `max-width:720px` rule. At 721px the bar therefore used its natural content height (reported as 517px when Tier controls were expanded), allowing it to extend above the viewport and collide with the shared top area.

The board page also declared `--trickcal-follow-bar-height: 0px` on its body, overriding the announcement controller's root measurement. This meant the body top offset and available bottom-bar height did not account for a displayed follow bar. The page-local zero override was removed; its top-occupied value now inherits the shared topbar and follow-bar measurements.

The fixed bar now has a width-independent cap:

```css
max-height: min(70dvh, calc(100dvh - var(--trickcal-top-occupied-height, 3.25rem) - max(80px, 20dvh)));
overflow-y: auto;
```

The cap leaves at least 80px or 20% of viewport height (whichever is greater) between the measured top occupied area and the bar. On ordinary taller screens the cap exceeds the content's natural height, so the existing PC layout remains natural. The existing bar `ResizeObserver` continues to synchronize `--board-preview-bottom-bar-height`; tests wait for and compare that value with the actual bounded bar height across three stable samples after each resize/content change. No new observer, fixed pixel topbar estimate, clipping, or transform was introduced.

At 320px, the page's `body { min-width: 320px; }` caused 15px horizontal overflow when a classic scrollbar reduced the content viewport. This shifted the fixed bar above the visible viewport bottom. The board page alone now uses `min-width: 0`; at 320px the measured horizontal overflow is 0 and the bar aligns with the viewport client bottom.

The board and enemy H1s render `Trickcal Manager > ボードプレビュー` and `Trickcal Manager > 敵データ` on 320px and 375px without links or forced small text. At those widths the measured headings fit on one line. The already-present apostle heading rule remains unchanged: the prefix is hidden at 375px and visible at 1280px.

## Browser evidence

`tools/test-board-layout-preview-native.js` uses the release-source-local `tools/storage-native-browser-check.js`; it has no path or import dependency on main. Its default mode serves the source tree. `BOARD_PREVIEW_TEST_ROOT` and route variables allow the same test to serve generated new and legacy roots. It is not referenced by the public manifest and was absent from generated output.

At 721×480 with the Tier disclosure expanded:

| State | Top occupied | Bar top / height | Internal client/content | Bottom padding |
| --- | ---: | ---: | ---: | ---: |
| No notice | 55.9px | 152px / 328px | 327 / 516px | 340px |
| Isolated notice fixture (37.6px) | 93.6px | 190px / 290px | 289 / 516px | 302px |
| Collapsed, no notice | 55.9px | 247px / 233px | 232 / 232px | 245px |

The open states leave 96px between the notice/topbar occupied area and the lower bar. A real wheel event moved the lower panel's own scroll position; all eight Tier selects were scrolled into the panel, and a physical click plus keyboard selection changed a value. Collapsing returned the bar and bottom padding to their natural measured height. At 375×480 with the notice fixture, the expanded lower bar is 248px high with 632px of content; Escape closes the detail panel, returns focus to its toggle, and restores the bar to 98px. The notice fixture was isolated to the browser page; no announcement data or saved user state was changed.

The browser test passed on source, generated new, and generated legacy pages. It exercised 320, 375, 390, 720, 721, and 1280px; confirmed two topbar rows at 720px and one at 721px; checked theme light→dark→light behavior, profile-aware manager links (HTTP 200), board images, Amelia/Rudd alias image behavior, custom selection, scroll reset on data change, preservation after tile selection, zoom 60–160%, background bounds, horizontal/vertical B1–B3 labels, and the expected apostle heading prefix behavior. Horizontal overflow was 0 at tested widths.

Local public generation completed for 2,188 files. The test source was not present in the generated tree. Generation was local only; there was no deployment or live-site verification.

Commands run:

- `node --check tools/test-board-layout-preview-native.js`
- `node --check public/board-layout-preview.js`
- `git diff --check`
- `node tools/generate-public-site.js --write --out tmp/review-board-heading-20260919-final2`
- `node tools/test-board-layout-preview-native.js` on source, then the generated new and legacy roots using their public routes.

## Screenshots

- Source, 721×480 with isolated notice and expanded Tier settings: `tmp/board-preview-bottom-bar-721x480-notice-expanded.png`
- Source, 375×480 with isolated notice and expanded detail settings: `tmp/board-preview-bottom-bar-375x480-notice-expanded.png`
- Source PC, 1280×900: `tmp/board-preview-bottom-bar-1280.png`
- Generated new and legacy 721×480 screenshots: `tmp/board-preview-new-final-20260919-721x480-notice-expanded.png` and `tmp/board-preview-legacy-final-20260919-721x480-notice-expanded.png`

## Backup and remaining conditions

Pre-edit files were copied beneath:

`D:/Games/etc/trickcal/backups/review-board-heading-bottom-bar-20260919-01/release-source-before`

The preserved source paths include `public/board-layout-preview.html`, `.css`, `.js`, `enemy-status.html`, `enemy-status.css`, `STATUS.md`, and `GOAL.md`. SHA-256 equality was checked after copying; `GOAL.md` was copied and checked before its later update. The new test file and new history file had no pre-existing version to back up.

Remaining: notice layout was exercised using a quarantined DOM fixture, not by changing production notice visibility or acknowledgement state; no physical handset check or live publication occurred. All current changes, including the prior review follow-ups, remain local and unpublished.
