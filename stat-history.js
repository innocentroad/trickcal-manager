(function (root, factory) {
  'use strict';
  const api = factory();
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.TRICKCAL_STAT_HISTORY = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const stable = value => value && typeof value === 'object'
    ? Array.isArray(value) ? value.map(stable)
      : Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]))
    : value;
  const same = (a, b) => JSON.stringify(stable(a)) === JSON.stringify(stable(b));
  const bytes = value => new TextEncoder().encode(JSON.stringify(value)).length;

  function create(options = {}) {
    const limit = options.limit || 50;
    const maxBytes = options.maxBytes || 4 * 1024 * 1024;
    let undo = [], redo = [], open = null, generation = 1, busy = false;
    const changed = () => options.onChange?.();
    const dirtyOpen = () => open && !same(open.before, open.after);
    const totalBytes = () => [...undo, ...redo, ...(open ? [open] : [])].reduce((sum, entry) => sum + bytes(entry), 0);
    function reset(reason) {
      undo = []; redo = []; open = null; generation += 1;
      changed();
      if (reason) options.onBoundary?.(reason);
    }
    function trim() {
      while (undo.length && (undo.length + redo.length + (open ? 1 : 0) > limit || totalBytes() > maxBytes)) undo.shift();
    }
    function append(entry) {
      if (same(entry.before, entry.after)) { changed(); return false; }
      const event = copy({ ...entry, generation });
      if (bytes(event) > maxBytes) {
        reset('変更が大きいため、この操作は取り消せません。');
        return false;
      }
      redo = []; undo.push(event); trim(); changed();
      return true;
    }
    function closeGroup() {
      if (!open) return false;
      const event = open; open = null;
      return append(event);
    }
    function record(entry, groupKey = '') {
      if (busy) return false;
      if (!groupKey) { closeGroup(); return append(entry); }
      if (open?.groupKey !== groupKey) closeGroup();
      if (!open) open = copy({ ...entry, groupKey, generation });
      else if (options.mergeGroup) open = copy(options.mergeGroup(open, entry));
      else open.after = copy(entry.after);
      if (bytes(open) > maxBytes) { reset('変更が大きいため、この操作は取り消せません。'); return false; }
                                                                                  
                                                                       
      trim();
      if (undo.length + redo.length + 1 > limit || totalBytes() > maxBytes) {
        reset('履歴の上限に達したため、取り消し履歴をリセットしました。'); return false;
      }
      changed(); return true;
    }
    function restore(direction, apply) {
      if (busy) return { applied: false, reason: 'busy' };
      closeGroup();
      const source = direction === 'undo' ? undo : redo;
      const target = direction === 'undo' ? redo : undo;
      const event = source[source.length - 1];
      if (!event) return { applied: false, reason: 'empty' };
      if (event.generation !== generation) return { applied: false, reason: 'stale' };
      busy = true; changed();
      try {
        const result = apply(copy(event), direction);
        if (result?.then) throw new Error('History apply must be synchronous');
        if (!result?.applied) return result || { applied: false };
        source.pop(); target.push(event);
        return { ...result, label: event.label };
      } finally { busy = false; changed(); }
    }
    function status() {
      const pending = dirtyOpen();
      return {
        generation, busy, undoCount: undo.length + (pending ? 1 : 0), redoCount: redo.length,
        canUndo: !busy && !!(pending || undo.length), canRedo: !busy && !pending && !!redo.length,
        undoLabel: pending ? open.label : undo[undo.length - 1]?.label || '',
        redoLabel: !pending ? redo[redo.length - 1]?.label || '' : '',
        bytes: totalBytes(), maxBytes, limit
      };
    }
    return { record, closeGroup, reset, status, undo: apply => restore('undo', apply), redo: apply => restore('redo', apply) };
  }
  return Object.freeze({ create, same });
});
