// Visitor-selectable themes. Without a saved choice the page follows the device's light/dark setting.
export const THEMES = ['light', 'dark', 'sepia', 'contrast', 'sheet', 'terminal', 'ledger'];
const KEY = 'theme';

export function readSaved(storage) {
  try {
    return storage ? storage.getItem(KEY) : null;
  } catch {
    return null;
  }
}

export function resolveTheme(saved, prefersDark) {
  if (THEMES.includes(saved)) return saved;
  return prefersDark ? 'dark' : 'light';
}

function storageOrNull() {
  try { return globalThis.localStorage; } catch { return null; }
}

export function initThemeSelect(select) {
  const root = document.documentElement;
  const saved = readSaved(storageOrNull());
  const prefersDark = globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  select.value = resolveTheme(saved, prefersDark);
  if (THEMES.includes(saved)) root.dataset.theme = saved;
  select.addEventListener('change', () => {
    root.dataset.theme = select.value;
    try { storageOrNull()?.setItem(KEY, select.value); } catch { /* storage blocked: theme lasts for this page only */ }
  });
}
