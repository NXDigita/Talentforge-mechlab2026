import { useState, useMemo } from "react";

const SHADES = ["#161b22", "#0e4429", "#006d32", "#26a641", "#39d353"];

function seedRandom(seed: number) {
  let x = seed;
  return () => {
    x = (x * 1664525 + 1013904223) & 0xffffffff;
    return (x >>> 0) / 0xffffffff;
  };
}

export function ContributionHeatmap() {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; count: number; date: string } | null>(null);

  const grid = useMemo(() => {
    const rng = seedRandom(42);
    const cols = 52;
    const rows = 7;
    const data: { count: number; date: string }[][] = [];
    const baseDate = new Date(2024, 4, 1);
    for (let c = 0; c < cols; c++) {
      data[c] = [];
      for (let r = 0; r < rows; r++) {
        const dayIndex = c * 7 + r;
        const d = new Date(baseDate);
        d.setDate(baseDate.getDate() - (cols * 7 - dayIndex - 1));
        const rand = rng();
        let count = 0;
        if (rand > 0.55) count = Math.floor(rand * 2);
        if (rand > 0.75) count = Math.floor(rand * 4);
        if (rand > 0.88) count = Math.floor(rand * 6);
        if (c > 48) count = Math.max(count, Math.floor(rng() * 5));
        data[c].push({ count, date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) });
      }
    }
    return data;
  }, []);

  const cellSize = 11;
  const gap = 2;
  const leftPad = 24;
  const topPad = 24;
  const totalW = leftPad + 52 * (cellSize + gap);
  const totalH = topPad + 7 * (cellSize + gap) + 20;

  const monthLabels = ["May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];

  return (
    <div className="relative">
      <svg width={totalW} height={totalH} style={{ fontFamily: "JetBrains Mono" }}>
        {["Mon", "Wed", "Fri"].map((d, i) => (
          <text key={d} x={8} y={topPad + (i * 2 + 1) * (cellSize + gap) + cellSize * 0.8} fill="#6B7280" fontSize="9">{d}</text>
        ))}
        {monthLabels.map((m, i) => (
          <text key={m} x={leftPad + (i * 4.33) * (cellSize + gap)} y={14} fill="#6B7280" fontSize="9">{m}</text>
        ))}
        {grid.map((col, c) =>
          col.map((cell, r) => {
            const shade = Math.min(4, cell.count);
            const x = leftPad + c * (cellSize + gap);
            const y = topPad + r * (cellSize + gap);
            return (
              <rect
                key={`${c}-${r}`}
                x={x} y={y}
                width={cellSize} height={cellSize}
                fill={SHADES[shade]}
                rx="2"
                style={{ cursor: "pointer" }}
                onMouseEnter={() => setTooltip({ x: x + cellSize / 2, y, count: cell.count, date: cell.date })}
                onMouseLeave={() => setTooltip(null)}
              />
            );
          })
        )}
        {tooltip && (
          <g>
            <rect x={tooltip.x - 60} y={tooltip.y - 34} width="120" height="26" fill="#1F2937" rx="4" />
            <text x={tooltip.x} y={tooltip.y - 20} fill="#F9FAFB" fontSize="9" textAnchor="middle">
              {tooltip.count} sim{tooltip.count !== 1 ? "s" : ""} — {tooltip.date}
            </text>
          </g>
        )}
      </svg>
      <div className="flex items-center gap-1 mt-1 text-[10px] text-gray-500 font-mono justify-end">
        <span>Less</span>
        {SHADES.map((s, i) => (
          <div key={i} style={{ width: 10, height: 10, background: s, borderRadius: 2 }} />
        ))}
        <span>More</span>
      </div>
    </div>
  );
}
