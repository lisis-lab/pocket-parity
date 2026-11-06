// Card vs. cash: what each way of paying abroad costs, in the home currency.
const pos = (v) => (Number.isFinite(v) && v > 0 ? v : 0);

export function compareCosts({ amount, midRate, card = {}, atm = {}, bureau = {}, iof = 0 }) {
  if (!(midRate > 0)) return null;
  const reference = pos(amount) / midRate;
  const tax = 1 + pos(iof);
  const costs = {
    card: reference * (1 + pos(card.spread)) * (1 + pos(card.fee)) * tax,
    atm: reference * (1 + pos(atm.spread)) * tax + pos(atm.fixedFee) + pos(atm.localFee) / midRate,
    bureau: reference * (1 + pos(bureau.spread)),
  };
  const options = Object.entries(costs).map(([id, cost]) => {
    const extra = cost - reference;
    return { id, cost, extra, extraPct: reference ? extra / reference : 0 };
  });
  const cheapest = options.reduce((a, b) => (b.cost < a.cost ? b : a)).id;
  return { reference, options, cheapest };
}
