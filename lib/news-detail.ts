export type NewsCategorySlug = "crypto" | "stocks" | "economy";

export const NEWS_CATEGORY_SLUGS: NewsCategorySlug[] = ["crypto", "stocks", "economy"];

export function isNewsCategorySlug(s: string): s is NewsCategorySlug {
  return s === "crypto" || s === "stocks" || s === "economy";
}

const TIMEOUT_MS = 12000;

async function fetchJson<T>(url: string, revalidate: number): Promise<T | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { Accept: "application/json" },
      next: { revalidate },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function fetchText(url: string, revalidate: number): Promise<string | null> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: ctrl.signal, next: { revalidate } });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

type YahooChartJson = {
  chart?: {
    result?: Array<{
      timestamp?: number[];
      indicators?: { quote?: Array<{ close?: Array<number | null> }> };
    }>;
  };
};

function parseYahooChartCloses(json: YahooChartJson): number[] {
  const r = json.chart?.result?.[0];
  const closes = r?.indicators?.quote?.[0]?.close;
  if (!closes?.length) return [];
  return closes.filter((c): c is number => c != null);
}

export type RssArticle = {
  title: string;
  href: string;
  summary: string;
};

function stripTags(html: string): string {
  return html
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractFirstHttpUrl(text: string): string {
  const m = text.match(/https?:\/\/[^\s<"'<>]+/i);
  return m ? m[0].replace(/[),.;]+$/, "") : "";
}

/** Parses RSS/SMR items: title, link, plaintext description. */
export function parseRssArticles(xml: string, max = 25, opts?: { skipTitleSubstrings?: string[] }): RssArticle[] {
  const skip = (opts?.skipTitleSubstrings ?? []).map((s) => s.toLowerCase());
  const items: RssArticle[] = [];
  const seenHref = new Set<string>();
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;

  while ((m = itemRe.exec(xml)) && items.length < max) {
    const block = m[1];
    const titleRaw =
      block.match(/<title[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/title>/i)?.[1] ?? "";
    let title = stripTags(titleRaw);
    if (!title) continue;
    if (skip.some((s) => title.toLowerCase().includes(s))) continue;

    let href =
      stripTags(block.match(/<link[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/link>/i)?.[1] ?? "").split(
        /\s/
      )[0] ?? "";
    if (!href || !href.startsWith("http")) {
      const gu = block.match(/<guid[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/guid>/i)?.[1];
      href = gu ? stripTags(gu).split(/\s/)[0] : "";
    }
    if (!href || !href.startsWith("http")) {
      href = extractFirstHttpUrl(block);
    }
    if (!href.startsWith("http")) continue;
    if (seenHref.has(href)) continue;
    seenHref.add(href);

    const descRaw =
      block.match(/<description[^>]*>(?:<!\[CDATA\[)?([\s\S]*?)(?:\]\]>)?<\/description>/i)?.[1] ?? "";
    let summary = stripTags(descRaw);
    if (summary.length > 260) summary = `${summary.slice(0, 257)}…`;

    items.push({ title, href, summary });
  }

  return items;
}

async function fetchYahooSeries(symbol: string): Promise<number[]> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1mo&interval=1d`;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsReader/1.0)" },
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const json = (await res.json()) as YahooChartJson;
    return parseYahooChartCloses(json);
  } catch {
    return [];
  } finally {
    clearTimeout(t);
  }
}

export type BlogCardCharts = {
  crypto: { symbol: string; name: string; prices: number[] }[];
  stocks: { symbol: string; prices: number[] }[];
  economy: { title: string; points: { label: string; value: number }[] } | null;
};

export async function fetchBlogCardCharts(): Promise<BlogCardCharts> {
  const empty: BlogCardCharts = {
    crypto: [],
    stocks: [],
    economy: null,
  };

  const markets = await fetchJson<
    {
      id: string;
      symbol: string;
      name: string;
      sparkline_in_7d?: { price?: number[] };
    }[]
  >(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=3&page=1&sparkline=true",
    120
  );

  const crypto =
    markets?.map((m) => ({
      symbol: m.symbol.toUpperCase(),
      name: m.name,
      prices: m.sparkline_in_7d?.price?.length ? m.sparkline_in_7d.price : [],
    })) ?? [];

  const [spy, qqq] = await Promise.all([fetchYahooSeries("SPY"), fetchYahooSeries("QQQ")]);
  const stocks: { symbol: string; prices: number[] }[] = [];
  if (spy.length > 1) stocks.push({ symbol: "SPY", prices: spy });
  if (qqq.length > 1) stocks.push({ symbol: "QQQ", prices: qqq });

  const gdp = await fetchJson<
    [{ page: number; pages: number; total: number }, { date: string; value: number | null }[]]
  >("https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json&per_page=8&MRV=8", 600);

  let economy: BlogCardCharts["economy"] = null;
  const rows = gdp?.[1]?.filter((r) => r.value != null) ?? [];
  if (rows.length > 1) {
    economy = {
      title: "US GDP (World Bank, USD)",
      points: rows
        .map((r) => ({
          label: String(r.date).slice(0, 4),
          value: (r.value as number) / 1e12,
        }))
        .reverse(),
    };
  }

  return { crypto, stocks, economy };
}

export type ChartPoint = { label: string; value: number };

export type CryptoCoinExtra = {
  marketCapUsd: number | null;
  volume24hUsd: number | null;
  circulatingSupply: number | null;
  high24hUsd: number | null;
  low24hUsd: number | null;
  change7dPct: number | null;
  athUsd: number | null;
  atlUsd: number | null;
  marketCapRank: number | null;
  blurb: string;
};

export type CryptoDetailData = {
  coins: {
    id: string;
    name: string;
    symbol: string;
    price: number | null;
    change24h: number | null;
    series: ChartPoint[];
    extra: CryptoCoinExtra | null;
  }[];
};

type CoinGeckoDetailJson = {
  description?: { en?: string };
  market_data?: {
    market_cap?: { usd?: number };
    total_volume?: { usd?: number };
    circulating_supply?: number;
    high_24h?: { usd?: number };
    low_24h?: { usd?: number };
    price_change_percentage_7d?: number;
    ath?: { usd?: number };
    atl?: { usd?: number };
    market_cap_rank?: number;
  };
};

function blurbFromDescription(en?: string): string {
  if (!en) return "";
  const plain = en
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!plain) return "";
  return plain.length > 480 ? `${plain.slice(0, 477)}…` : plain;
}

async function fetchCoinGeckoExtra(id: string): Promise<CryptoCoinExtra | null> {
  const j = await fetchJson<CoinGeckoDetailJson>(
    `https://api.coingecko.com/api/v3/coins/${encodeURIComponent(id)}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`,
    120
  );
  if (!j?.market_data) return null;
  const md = j.market_data;
  return {
    marketCapUsd: md.market_cap?.usd ?? null,
    volume24hUsd: md.total_volume?.usd ?? null,
    circulatingSupply: md.circulating_supply ?? null,
    high24hUsd: md.high_24h?.usd ?? null,
    low24hUsd: md.low_24h?.usd ?? null,
    change7dPct: md.price_change_percentage_7d ?? null,
    athUsd: md.ath?.usd ?? null,
    atlUsd: md.atl?.usd ?? null,
    marketCapRank: md.market_cap_rank ?? null,
    blurb: blurbFromDescription(j.description?.en),
  };
}

export async function fetchCryptoDetailData(): Promise<CryptoDetailData> {
  const markets = await fetchJson<
    {
      id: string;
      symbol: string;
      name: string;
      current_price: number;
      price_change_percentage_24h: number;
    }[]
  >(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=5&page=1&sparkline=false",
    120
  );

  if (!markets?.length) return { coins: [] };

  const top = markets.slice(0, 5);

  const [charts, extras] = await Promise.all([
    Promise.all(
      top.map((m) =>
        fetchJson<{ prices: [number, number][] }>(
          `https://api.coingecko.com/api/v3/coins/${m.id}/market_chart?vs_currency=usd&days=30`,
          120
        )
      )
    ),
    Promise.all(top.map((m) => fetchCoinGeckoExtra(m.id))),
  ]);

  const coins = top.map((m, i) => {
    const prices = charts[i]?.prices ?? [];
    const step = Math.max(1, Math.floor(prices.length / 24));
    const sampled =
      prices.length === 0
        ? []
        : prices.filter((_, idx) => idx % step === 0 || idx === prices.length - 1).slice(-24);
    const series: ChartPoint[] = sampled.map(([ms, p]) => ({
      label: new Date(ms).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
      value: p,
    }));
    return {
      id: m.id,
      name: m.name,
      symbol: m.symbol.toUpperCase(),
      price: m.current_price ?? null,
      change24h: m.price_change_percentage_24h ?? null,
      series,
      extra: extras[i] ?? null,
    };
  });

  return { coins };
}

export type StocksDetailData = {
  tickers: { symbol: string; series: ChartPoint[] }[];
  headlines: RssArticle[];
};

export async function fetchStocksDetailData(): Promise<StocksDetailData> {
  const symbols = ["SPY", "QQQ", "DIA"] as const;
  const results = await Promise.all(
    symbols.map(async (sym) => {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=3mo&interval=1d`;
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
      try {
        const res = await fetch(url, {
          signal: ctrl.signal,
          headers: { "User-Agent": "Mozilla/5.0 (compatible; NewsReader/1.0)" },
          next: { revalidate: 300 },
        });
        if (!res.ok) return { symbol: sym, series: [] as ChartPoint[] };
        const json = (await res.json()) as YahooChartJson;
        const r = json.chart?.result?.[0];
        const closes = r?.indicators?.quote?.[0]?.close;
        const ts = r?.timestamp;
        if (!closes?.length || !ts?.length) return { symbol: sym, series: [] };
        const series: ChartPoint[] = [];
        const stride = Math.max(1, Math.floor(closes.length / 30));
        for (let i = 0; i < closes.length; i += stride) {
          const c = closes[i];
          if (c == null) continue;
          const t0 = ts[i];
          series.push({
            label: t0 ? new Date(t0 * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "",
            value: c,
          });
        }
        const last = closes.length - 1;
        if (series.length && series[series.length - 1].value !== closes[last]) {
          const tLast = ts[last];
          series.push({
            label: tLast ? new Date(tLast * 1000).toLocaleDateString(undefined, { month: "short", day: "numeric" }) : "",
            value: closes[last] as number,
          });
        }
        return { symbol: sym, series };
      } catch {
        return { symbol: sym, series: [] };
      } finally {
        clearTimeout(t);
      }
    })
  );

  const xml = await fetchText(
    "https://feeds.finance.yahoo.com/rss/2.0/headline?s=SPY,QQQ,DIA&region=US&lang=en-US",
    300
  );
  const headlines = xml
    ? parseRssArticles(xml, 25, { skipTitleSubstrings: ["yahoo finance news"] })
    : [];

  return { tickers: results, headlines };
}

export type EconomyDetailData = {
  gdp: { points: ChartPoint[] } | null;
  inflation: { points: ChartPoint[] } | null;
  bullets: string[];
  worldNews: RssArticle[];
};

async function fetchWorldEconomyRss(): Promise<RssArticle[]> {
  const [bbc, nyt] = await Promise.all([
    fetchText("https://feeds.bbci.co.uk/news/business/rss.xml", 300),
    fetchText("https://rss.nytimes.com/services/xml/rss/nyt/Economy.xml", 300),
  ]);
  const merged: RssArticle[] = [];
  const seen = new Set<string>();
  for (const xml of [bbc, nyt]) {
    if (!xml) continue;
    for (const a of parseRssArticles(xml, 15)) {
      if (seen.has(a.href)) continue;
      seen.add(a.href);
      merged.push(a);
      if (merged.length >= 22) return merged;
    }
  }
  return merged;
}

export async function fetchEconomyDetailData(): Promise<EconomyDetailData> {
  const [gdpRes, cpiRes, worldNews] = await Promise.all([
    fetchJson<
      [{ page: number; pages: number; total: number }, { date: string; value: number | null }[]]
    >("https://api.worldbank.org/v2/country/US/indicator/NY.GDP.MKTP.CD?format=json&per_page=15&MRV=15", 600),
    fetchJson<
      [{ page: number; pages: number; total: number }, { date: string; value: number | null }[]]
    >("https://api.worldbank.org/v2/country/US/indicator/FP.CPI.TOTL.ZG?format=json&per_page=15&MRV=15", 600),
    fetchWorldEconomyRss(),
  ]);

  const gdpRows = gdpRes?.[1]?.filter((r) => r.value != null) ?? [];
  const cpiRows = cpiRes?.[1]?.filter((r) => r.value != null) ?? [];

  const gdp =
    gdpRows.length > 1
      ? {
          points: gdpRows
            .map((r) => ({
              label: String(r.date).slice(0, 4),
              value: (r.value as number) / 1e12,
            }))
            .reverse(),
        }
      : null;

  const inflation =
    cpiRows.length > 1
      ? {
          points: cpiRows
            .map((r) => ({
              label: String(r.date).slice(0, 4),
              value: r.value as number,
            }))
            .reverse(),
        }
      : null;

  const bullets: string[] = [];
  const latestGdp = gdpRows[0];
  const latestCpi = cpiRows[0];
  if (latestGdp?.value != null) {
    bullets.push(`Latest US GDP (nominal, World Bank ${latestGdp.date}): $${(latestGdp.value / 1e12).toFixed(2)}T`);
  }
  if (latestCpi?.value != null) {
    bullets.push(`Latest US CPI inflation (annual %, World Bank ${latestCpi.date}): ${latestCpi.value.toFixed(2)}%`);
  }

  return { gdp, inflation, bullets, worldNews };
}
