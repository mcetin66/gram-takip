import * as idefix from './idefix.mjs';
import * as trendyol from './trendyol.mjs';
import * as altinkaynak from './altinkaynak.mjs';

const parsers = {
  'idefix.com': idefix,
  'www.idefix.com': idefix,
  'trendyol.com': trendyol,
  'www.trendyol.com': trendyol,
  'altinkaynak.com': altinkaynak,
  'www.altinkaynak.com': altinkaynak
};

export async function getParser(url) {
  try {
    const hostname = new URL(url).hostname;
    return parsers[hostname] || null;
  } catch (e) {
    return null;
  }
}
