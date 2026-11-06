// Daily travel budget: everyday spending per category, priced at the destination.
import { CATEGORIES } from '../countries.js';

const clean = (v) => (Number.isFinite(v) && v > 0 ? v : 0);

export function dailyBudget({ home, rate, pOrig, pDest, days }) {
  if (!(rate > 0) || !pOrig || !pDest) return null;
  const d = Math.max(1, Math.floor(Number(days) || 0));
  const rows = CATEGORIES.map((cat) => {
    const h = clean(home?.[cat]);
    const ratio = pDest[cat] / pOrig[cat];
    return { cat, home: h, ratio, there: h * rate * ratio };
  });
  const perDayHome = rows.reduce((s, r) => s + r.home, 0);
  const perDayThere = rows.reduce((s, r) => s + r.there, 0);
  const perDayThereInHome = perDayThere / rate;
  return {
    rows, perDayHome, perDayThere, perDayThereInHome,
    tripThere: perDayThere * d, tripThereInHome: perDayThereInHome * d,
    vsHome: perDayHome ? perDayThereInHome / perDayHome : null,
  };
}
