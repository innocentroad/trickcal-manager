/* DPS計算Worker。単一seedは表示用結果、複数seedは集計用として使い分ける。 */
importScripts('dps-simulator.js?v=20260827n');

self.addEventListener('message', event => {
  const requestId = event.data?.requestId;
  try {
    const simulator = self.TRICKCAL_DPS_SIMULATOR;
    if (!simulator) throw new Error('DPSシミュレーターを読み込めませんでした');
    const options = event.data.options || {};
    const result = event.data.mode === 'single'
      ? simulator.simulate(event.data.config, {
        ...options,
        recordTimeline: true,
        recordDamageSeries: true
      })
      : simulator.simulateMany(event.data.config, {
        ...options,
        recordTimeline: false,
        recordDamageSeries: false,
        onProgress: progress => self.postMessage({ requestId, progress })
      });
    self.postMessage({ requestId, result });
  } catch (error) {
    self.postMessage({
      requestId,
      error: error?.message || String(error || 'Worker計算に失敗しました')
    });
  }
});
