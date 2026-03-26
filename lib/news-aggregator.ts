export type NewsTickerItem = {
  id: string;
  category: "crypto" | "finance" | "economy";
  text: string;
};

const TIMEOUT_MS = 8000;

async function fetchJson<T>(url: string): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
      next: { revalidate: 120 },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchText(url: string): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, next: { revalidate: 300 } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

function parseRssTitles(xml: string, max = 6): string[] {
  const titles: string[] = [];
  const re = /<item[\s\S]*?<title>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) && titles.length < max) {
    const raw = m[1]?.replace(/<[^>]+>/g, "").trim();
    if (raw && !raw.toLowerCase().includes("yahoo")) titles.push(raw);
  }
  return titles;
}

export async function aggregateNewsItems(): Promise<NewsTickerItem[]> {
  const items: NewsTickerItem[] = [];
  let id = 0;

  const markets = await fetchJson<
    { id: string; symbol: string; current_price: number; price_change_percentage_24h: number }[]
  >(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false"
  );
  if (markets?.length) {
    for (const c of markets) {
      const ch = c.price_change_percentage_24h?.toFixed(2) ?? "?";
      items.push({
        id: `c-${id++}`,
        category: "crypto",
        text: `${c.symbol.toUpperCase()} $${c.current_price?.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${ch}% 24h)`,
      });
    }
  } else {
    items.push({
      id: `c-${id++}`,
      category: "crypto",
      text: "Crypto: data temporarily unavailable",
    });
  }

  const yahooXml = await fetchText(
    "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,DIA&region=US&lang=en-US"
  );
  const finTitles = yahooXml ? parseRssTitles(yahooXml, 5) : [];
  if (finTitles.length) {
    for (const t of finTitles) {
      items.push({ id: `f-${id++}`, category: "finance", text: `Markets: ${t}` });
    }
  } else {
    items.push({ id: `f-${id++}`, category: "finance", text: "Finance: headlines unavailable" });
  }

  const wb = await fetchJson<
    [{ page: number; pages: number; total: number }, { date: string; value: number | null }[]]
  >("https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json&per_page=1&MRV=1");
  const gdp = wb?.[1]?.[0];
  if (gdp?.value != null) {
    items.push({
      id: `e-${id++}`,
      category: "economy",
      text: `US GDP (World Bank, latest): $${(gdp.value / 1e12).toFixed(2)}T`,
    });
  } else {
    items.push({
      id: `e-${id++}`,
      category: "economy",
      text: "Economy: indicator data unavailable",
    });
  }

  const cpi = await fetchJson<
    [{ page: number; pages: number; total: number }, { date: string; value: number | null }[]]
  >("https://api.worldbank.org/v2/country/US/indicator/FP.CPI.TOTL.ZG?format=json&per_page=1&MRV=1");
  const inf = cpi?.[1]?.[0];
  if (inf?.value != null) {
    items.push({
      id: `e-${id++}`,
      category: "economy",
      text: `US inflation (CPI annual %, World Bank): ${inf.value.toFixed(2)}%`,
    });
  }

  return items;
}
