type MiniSparklineProps = {
  values: number[];
  color?: string;
  className?: string;
};

/** Compact SVG trend line for card previews (no extra dependencies). */
export default function MiniSparkline({ values, color = "#f87171", className = "" }: MiniSparklineProps) {
  if (values.length < 2) {
    return (
      <div className={`h-9 rounded-md bg-neutral-900/80 border border-white/5 ${className}`} aria-hidden />
    );
  }

  const w = 120;
  const h = 36;
  const pad = 2;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;

  const pts = values
    .map((v, i) => {
      const x = pad + (i / (values.length - 1)) * (w - 2 * pad);
      const y = h - pad - ((v - min) / span) * (h - 2 * pad);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className={`w-full h-9 ${className}`}
      preserveAspectRatio="none"
      aria-hidden
    >
      <polyline fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}
