// Inflation calculator: values is { year: index }.
export function adjust({ amount, fromYear, toYear, values }) {
  const a = values[fromYear], b = values[toYear];
  if (!(a > 0) || !(b > 0)) throw new RangeError(`No index for ${!(a > 0) ? fromYear : toYear}`);
  const f = b / a;
  const years = toYear - fromYear;
  return { value: amount * f, cumulative: f - 1, years, annualAvg: years ? Math.pow(f, 1 / Math.abs(years)) - 1 : 0 };
}

export function milestones(values, fromYear, toYear, step = 5) {
  const lo = Math.min(fromYear, toYear), hi = Math.max(fromYear, toYear);
  const out = [];
  for (let y = lo; y <= hi; y++) {
    if (values[y] == null) continue;
    if (y === lo || y === hi || y % step === 0) out.push({ year: y, index: values[y] });
  }
  return out;
}

export function yearRange(values) {
  const ys = Object.keys(values).map(Number);
  return { min: Math.min(...ys), max: Math.max(...ys) };
}
