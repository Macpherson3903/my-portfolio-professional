import type { ChartPoint } from "@/lib/news-detail";

type SvgLineChartProps = {
  data: ChartPoint[];
  title?: string;
  accent?: string;
  valuePrefix?: string;
  valueSuffix?: string;
  /** When true, formats Y values in compact trillions (for GDP T$). */
  compactTrillions?: boolean;
};

export default function SvgLineChart({
  data,
  title,
  accent = "#f87171",
  valuePrefix = "",
  valueSuffix = "",
  compactTrillions = false,
}: SvgLineChartProps) {
  if (data.length < 2) {
    return (
      <div className="rounded-xl border border-white/10 bg-neutral-950/50 p-4 text-sm text-neutral-500">
        Not enough data for a chart.
      </div>
    );
  }

  const viewW = 640;
  const viewH = 200;
  const padL = 48;
  const padR = 16;
  const padT = title ? 28 : 16;
  const padB = 36;
  const iw = viewW - padL - padR;
  const ih = viewH - padT - padB;

  const values = data.map((d) => d.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const span = maxV - minV || 1;

  const fmt = (v: number) => {
    if (compactTrillions) return `${valuePrefix}${v.toFixed(2)}T`;
    const abs = Math.abs(v);
    if (abs >= 1e6) return `${valuePrefix}${(v / 1e6).toFixed(2)}M${valueSuffix}`;
    if (abs >= 1e3) return `${valuePrefix}${(v / 1e3).toFixed(2)}K${valueSuffix}`;
    return `${valuePrefix}${v.toFixed(2)}${valueSuffix}`;
  };

  const toX = (i: number) => padL + (i / (data.length - 1)) * iw;
  const toY = (v: number) => padT + ih - ((v - minV) / span) * ih;

  const pathD = data
    .map((p, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(p.value).toFixed(1)}`)
    .join(" ");

  const yLabels = [maxV, minV + span / 2, minV].map((v, i) => (
    <text
      key={i}
      x={padL - 6}
      y={toY(v) + 4}
      textAnchor="end"
      fill="#737373"
      fontSize="10"
    >
      {fmt(v)}
    </text>
  ));

  const xTickEvery = Math.max(1, Math.floor(data.length / 5));
  const xLabels = data.map((p, i) =>
    i % xTickEvery === 0 || i === data.length - 1 ? (
      <text key={i} x={toX(i)} y={viewH - 10} textAnchor="middle" fill="#737373" fontSize="10">
        {p.label}
      </text>
    ) : null
  );

  return (
    <div className="w-full">
      {title ? <p className="text-sm font-medium text-white mb-1">{title}</p> : null}
      <svg
        viewBox={`0 0 ${viewW} ${viewH}`}
        className="w-full h-auto max-h-[220px]"
        role="img"
        aria-label={title ?? "Price chart"}
      >
        <line x1={padL} y1={padT} x2={padL} y2={padT + ih} stroke="#ffffff14" strokeWidth="1" />
        <line x1={padL} y1={padT + ih} x2={padL + iw} y2={padT + ih} stroke="#ffffff14" strokeWidth="1" />
        {yLabels}
        <path
          d={pathD}
          fill="none"
          stroke={accent}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {xLabels}
      </svg>
    </div>
  );
}
