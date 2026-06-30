import * as idefix from './idefix.mjs';
import * as trendyol from './trendyol.mjs';

const parsers = {
  'idefix.com': idefix,
  'www.idefix.com': idefix,
  'trendyol.com': trendyol,
  'www.trendyol.com': trendyol
};

export async function getParser(url) {
  try {
    const hostname = new URL(url).hostname;
    return parsers[hostname] || null;
  } catch (e) {
    return null;
  }
}
