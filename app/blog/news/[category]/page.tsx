import SiteShell from "@/components/SiteShell";
import SvgLineChart from "@/components/blog/SvgLineChart";
import { encodeEconomyArticlePayload } from "@/lib/economy-article-payload";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  fetchCryptoDetailData,
  fetchEconomyDetailData,
  fetchStocksDetailData,
  isNewsCategorySlug,
} from "@/lib/news-detail";
import type { Metadata } from "next";

export const revalidate = 120;

type Props = { params: Promise<{ category: string }> };

const titles: Record<string, string> = {
  crypto: "Crypto markets",
  stocks: "US stocks & headlines",
  economy: "Economy & world news",
};

function fmtUsdCompact(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  if (n >= 1e12) return `$${(n / 1e12).toFixed(2)}T`;
  if (n >= 1e9) return `$${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
  if (n >= 1e3) return `$${(n / 1e3).toFixed(2)}K`;
  if (n < 1) return `$${n.toFixed(4)}`;
  return `$${n.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

function fmtNumber(n: number | null): string {
  if (n == null || Number.isNaN(n)) return "—";
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  if (!isNewsCategorySlug(category)) return { title: "News" };
  return {
    title: `${titles[category]} | Blog`,
    description: `Live ${category} data, charts, and context.`,
  };
}

export default async function NewsCategoryPage({ params }: Props) {
  const { category } = await params;
  if (!isNewsCategorySlug(category)) notFound();

  if (category === "crypto") {
    const data = await fetchCryptoDetailData();
    return (
      <SiteShell>
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-28 bg-black">
          <Link href="/blog" className="text-sm text-red-500 hover:text-red-400 mb-6 inline-block">
            ← Back to blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{titles.crypto}</h1>
          <p className="text-neutral-400 text-sm mb-8">
            Top assets by market cap (USD). Charts: ~30 day history via CoinGecko. For information only — not financial advice.
          </p>
          {!data.coins.length ? (
            <p className="text-neutral-500">Live data is temporarily unavailable.</p>
          ) : (
            <div className="space-y-10">
              {data.coins.map((coin) => (
                <section
                  key={coin.id}
                  className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 md:p-6"
                >
                  <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                    <h2 className="text-xl font-semibold text-white">
                      {coin.name}{" "}
                      <span className="text-neutral-500 text-base font-normal">({coin.symbol})</span>
                    </h2>
                    <div className="text-sm text-neutral-400 tabular-nums">
                      {coin.price != null && (
                        <span className="text-white font-medium">
                          ${coin.price.toLocaleString(undefined, { maximumFractionDigits: coin.price < 1 ? 4 : 2 })}
                        </span>
                      )}
                      {coin.change24h != null && (
                        <span
                          className={
                            coin.change24h >= 0 ? "text-emerald-400 ml-2" : "text-red-400 ml-2"
                          }
                        >
                          {coin.change24h >= 0 ? "+" : ""}
                          {coin.change24h.toFixed(2)}% 24h
                        </span>
                      )}
                    </div>
                  </div>
                  {coin.extra ? (
                    <div className="mb-6 space-y-4">
                      <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500">Market snapshot</h3>
                      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs sm:text-sm">
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                          <dt className="text-neutral-500 mb-0.5">Rank (market cap)</dt>
                          <dd className="text-white font-medium tabular-nums">
                            {coin.extra.marketCapRank != null ? `#${coin.extra.marketCapRank}` : "—"}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                          <dt className="text-neutral-500 mb-0.5">Market cap</dt>
                          <dd className="text-white font-medium tabular-nums">
                            {fmtUsdCompact(coin.extra.marketCapUsd)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                          <dt className="text-neutral-500 mb-0.5">24h volume</dt>
                          <dd className="text-white font-medium tabular-nums">
                            {fmtUsdCompact(coin.extra.volume24hUsd)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                          <dt className="text-neutral-500 mb-0.5">24h high / low</dt>
                          <dd className="text-white font-medium tabular-nums">
                            {fmtUsdCompact(coin.extra.high24hUsd)} / {fmtUsdCompact(coin.extra.low24hUsd)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                          <dt className="text-neutral-500 mb-0.5">7d change</dt>
                          <dd
                            className={
                              coin.extra.change7dPct == null
                                ? "text-neutral-400"
                                : coin.extra.change7dPct >= 0
                                  ? "text-emerald-400 font-medium"
                                  : "text-red-400 font-medium"
                            }
                          >
                            {coin.extra.change7dPct == null ? "—" : `${coin.extra.change7dPct >= 0 ? "+" : ""}${coin.extra.change7dPct.toFixed(2)}%`}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3">
                          <dt className="text-neutral-500 mb-0.5">Circulating supply</dt>
                          <dd className="text-white font-medium tabular-nums">
                            {fmtNumber(coin.extra.circulatingSupply)}
                          </dd>
                        </div>
                        <div className="rounded-lg bg-black/40 border border-white/5 p-3 sm:col-span-2">
                          <dt className="text-neutral-500 mb-0.5">All-time high / low (USD)</dt>
                          <dd className="text-white font-medium tabular-nums">
                            {fmtUsdCompact(coin.extra.athUsd)} / {fmtUsdCompact(coin.extra.atlUsd)}
                          </dd>
                        </div>
                      </dl>
                      {coin.extra.blurb ? (
                        <div>
                          <h3 className="text-xs font-mono uppercase tracking-widest text-neutral-500 mb-2">Overview</h3>
                          <p className="text-sm text-neutral-400 leading-relaxed">{coin.extra.blurb}</p>
                          <p className="text-[10px] text-neutral-600 mt-2">Source: CoinGecko project description (may be community-edited).</p>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  <SvgLineChart
                    data={coin.series}
                    title="Price (USD)"
                    accent="#f87171"
                    valuePrefix="$"
                  />
                </section>
              ))}
            </div>
          )}
        </div>
      </SiteShell>
    );
  }

  if (category === "stocks") {
    const data = await fetchStocksDetailData();
    return (
      <SiteShell>
        <div className="max-w-4xl mx-auto px-6 pt-10 pb-28 bg-black">
          <Link href="/blog" className="text-sm text-red-500 hover:text-red-400 mb-6 inline-block">
            ← Back to blog
          </Link>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{titles.stocks}</h1>
          <p className="text-neutral-400 text-sm mb-8">
            ETF proxies (SPY, QQQ, DIA) — ~3 month daily closes (Yahoo). Headlines from Yahoo Finance RSS. Informational only.
          </p>
          <div className="space-y-10 mb-12">
            {data.tickers.map((t) => (
              <div key={t.symbol} className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 md:p-6">
                <h2 className="text-lg font-semibold text-white mb-4">{t.symbol}</h2>
                <SvgLineChart data={t.series} title="Adjusted close (USD)" accent="#60a5fa" valuePrefix="$" />
              </div>
            ))}
          </div>
          <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 md:p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Latest headlines</h2>
            {data.headlines.length ? (
              <ul className="space-y-5 text-sm">
                {data.headlines.map((item) => (
                  <li key={item.href} className="leading-snug border-b border-white/5 pb-5 last:border-0 last:pb-0">
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white font-medium text-base hover:text-red-400 transition underline-offset-2 hover:underline"
                    >
                      {item.title}
                    </a>
                    {item.summary ? (
                      <p className="text-neutral-500 text-xs mt-2 leading-relaxed">{item.summary}</p>
                    ) : null}
                    <p className="text-[10px] text-neutral-600 mt-1.5">Opens publisher site in a new tab</p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-neutral-500 text-sm">No headlines available right now.</p>
            )}
          </section>
        </div>
      </SiteShell>
    );
  }

  const data = await fetchEconomyDetailData();
  return (
    <SiteShell>
      <div className="max-w-4xl mx-auto px-6 pt-10 pb-28 bg-black">
        <Link href="/blog" className="text-sm text-red-500 hover:text-red-400 mb-6 inline-block">
          ← Back to blog
        </Link>
        <h1 className="text-3xl md:text-4xl font-bold mb-2">{titles.economy}</h1>
        <p className="text-neutral-400 text-sm mb-8">
          Global business headlines (BBC, NYT Economy RSS), plus US macro charts from the World Bank. Open an item for a
          longer summary and the original article.
        </p>
        <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 md:p-6 mb-10">
          <h2 className="text-lg font-semibold text-white mb-4">World economy — what&apos;s moving</h2>
          {data.worldNews.length ? (
            <ul className="space-y-4">
              {data.worldNews.map((item) => (
                <li key={item.href} className="border-b border-white/5 pb-4 last:border-0 last:pb-0">
                  <Link
                    href={`/blog/news/economy/article?d=${encodeURIComponent(encodeEconomyArticlePayload(item))}`}
                    className="text-white font-medium text-sm hover:text-red-400 transition underline-offset-2 hover:underline"
                  >
                    {item.title}
                  </Link>
                  {item.summary ? (
                    <p className="text-neutral-500 text-xs mt-1.5 leading-relaxed line-clamp-3">{item.summary}</p>
                  ) : null}
                  <p className="text-[10px] text-red-500/90 mt-2 font-medium">View brief &amp; source link →</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-500 text-sm">World news feeds are temporarily unavailable.</p>
          )}
        </section>
        {data.bullets.length > 0 && (
          <ul className="mb-10 space-y-2 text-sm text-neutral-300">
            {data.bullets.map((b, i) => (
              <li key={i} className="border-l-2 border-violet-500/40 pl-3">
                {b}
              </li>
            ))}
          </ul>
        )}
        <div className="space-y-10">
          {data.gdp?.points?.length ? (
            <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 md:p-6">
              <SvgLineChart
                data={data.gdp.points}
                title="US nominal GDP (trillions USD)"
                accent="#a78bfa"
                valuePrefix="$"
                compactTrillions
              />
            </section>
          ) : null}
          {data.inflation?.points?.length ? (
            <section className="rounded-2xl border border-white/10 bg-neutral-950/60 p-5 md:p-6">
              <SvgLineChart
                data={data.inflation.points}
                title="US inflation — CPI, annual % (World Bank)"
                accent="#c084fc"
                valueSuffix="%"
              />
            </section>
          ) : null}
          {!data.gdp && !data.inflation && (
            <p className="text-neutral-500">Indicator data is temporarily unavailable.</p>
          )}
        </div>
      </div>
    </SiteShell>
  );
}
