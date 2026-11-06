// Countries offered by the tools. Names and currencies only: every number comes from official sources at runtime.
export const COUNTRIES = {
  US: { name: { en: 'United States', pt: 'Estados Unidos' }, cur: 'USD', iso3: 'USA' },
  CA: { name: { en: 'Canada', pt: 'Canadá' }, cur: 'CAD', iso3: 'CAN' },
  MX: { name: { en: 'Mexico', pt: 'México' }, cur: 'MXN', iso3: 'MEX' },
  BR: { name: { en: 'Brazil', pt: 'Brasil' }, cur: 'BRL', iso3: 'BRA' },
  GB: { name: { en: 'United Kingdom', pt: 'Reino Unido' }, cur: 'GBP', iso3: 'GBR' },
  CH: { name: { en: 'Switzerland', pt: 'Suíça' }, cur: 'CHF', iso3: 'CHE' },
  NO: { name: { en: 'Norway', pt: 'Noruega' }, cur: 'NOK', iso3: 'NOR' },
  DE: { name: { en: 'Germany', pt: 'Alemanha' }, cur: 'EUR', iso3: 'DEU' },
  FR: { name: { en: 'France', pt: 'França' }, cur: 'EUR', iso3: 'FRA' },
  NL: { name: { en: 'Netherlands', pt: 'Países Baixos' }, cur: 'EUR', iso3: 'NLD' },
  IT: { name: { en: 'Italy', pt: 'Itália' }, cur: 'EUR', iso3: 'ITA' },
  ES: { name: { en: 'Spain', pt: 'Espanha' }, cur: 'EUR', iso3: 'ESP' },
  PT: { name: { en: 'Portugal', pt: 'Portugal' }, cur: 'EUR', iso3: 'PRT' },
  GR: { name: { en: 'Greece', pt: 'Grécia' }, cur: 'EUR', iso3: 'GRC' },
  JP: { name: { en: 'Japan', pt: 'Japão' }, cur: 'JPY', iso3: 'JPN' },
  TH: { name: { en: 'Thailand', pt: 'Tailândia' }, cur: 'THB', iso3: 'THA' },
  AU: { name: { en: 'Australia', pt: 'Austrália' }, cur: 'AUD', iso3: 'AUS' },
};

export const CATEGORIES = ['rest', 'food', 'trans', 'rec', 'cloth'];

const isPt = (lang) => String(lang || '').toLowerCase().startsWith('pt');

export function countryName(code, lang) {
  const c = COUNTRIES[code];
  return c ? c.name[isPt(lang) ? 'pt' : 'en'] : code;
}

export function fillCountrySelect(select, lang, selected) {
  const codes = Object.keys(COUNTRIES).sort((a, b) =>
    countryName(a, lang).localeCompare(countryName(b, lang), isPt(lang) ? 'pt-BR' : 'en-US'));
  select.replaceChildren(...codes.map((code) =>
    new Option(`${countryName(code, lang)} (${COUNTRIES[code].cur})`, code, false, code === selected)));
}
