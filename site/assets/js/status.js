// Loading states for data-backed tools. The page shows numbers only in "ready".
export function statusAt({ startedAt, now, settled, online, slowMs = 6000 }) {
  if (settled === 'ok') return 'ready';
  if (online === false) return 'offline';
  if (settled === 'error') return 'error';
  return now - startedAt >= slowMs ? 'slow' : 'loading';
}

/** Run load(), reflect its state on main[data-state], call onReady(data) on success. Retries on button or when back online. */
export function trackStatus(main, load, onReady, { slowMs = 6000 } = {}) {
  let run = 0;
  let timer = null;
  const online = () => (typeof navigator === 'undefined' ? true : navigator.onLine !== false);

  const start = () => {
    const id = ++run;
    const startedAt = Date.now();
    let settled = null;
    const paint = () => { if (id === run) main.dataset.state = statusAt({ startedAt, now: Date.now(), settled, online: online(), slowMs }); };
    clearInterval(timer);
    timer = setInterval(paint, 500);
    paint();
    Promise.resolve().then(load).then(
      (data) => { if (id !== run) return; settled = 'ok'; clearInterval(timer); paint(); onReady(data); },
      (err) => { if (id !== run) return; settled = 'error'; clearInterval(timer); paint(); console.warn('CentAtlas data:', err); },
    );
  };

  main.querySelectorAll('[data-retry]').forEach((b) => b.addEventListener('click', start));
  addEventListener('online', () => { if (main.dataset.state !== 'ready') start(); });
  addEventListener('offline', () => { if (main.dataset.state !== 'ready') main.dataset.state = 'offline'; });
  start();
  return { retry: start };
}
