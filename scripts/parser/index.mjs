import * as idefix from './idefix.mjs';
import * as trendyol from './trendyol.mjs';
import * as altinkaynak from './altinkaynak.mjs';
import * as akakce from './akakce.mjs';

const parsers = {
  'idefix.com': idefix,
  'www.idefix.com': idefix,
  'trendyol.com': trendyol,
  'www.trendyol.com': trendyol,
  'altinkaynak.com': altinkaynak,
  'www.altinkaynak.com': altinkaynak,
  'akakce.com': akakce,
  'www.akakce.com': akakce
};

export async function getParser(url) {
  try {
    const hostname = new URL(url).hostname;
    return parsers[hostname] || null;
  } catch (e) {
    return null;
  }
}
