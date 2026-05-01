interface TFESGaugeProps {
  value: number;
  max?: number;
  size?: number;
}

export function TFESGauge({ value, max = 100, size = 120 }: TFESGaugeProps) {
  const radius = size * 0.38;
  const cx = size / 2;
  const cy = size / 2;
  const startAngle = -220;
  const endAngle = 40;
  const totalAngle = endAngle - startAngle;
  const pct = value / max;
  const angle = startAngle + totalAngle * pct;

  const toXY = (a: number, r: number) => {
    const rad = (a * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  };

  const describeArc = (startA: number, endA: number, r: number) => {
    const s = toXY(startA, r);
    const e = toXY(endA, r);
    const largeArc = Math.abs(endA - startA) > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <path d={describeArc(startAngle, endAngle, radius)} fill="none" stroke="#1F2937" strokeWidth="8" strokeLinecap="round" />
      <path d={describeArc(startAngle, angle, radius)} fill="none" stroke="#F97316" strokeWidth="8" strokeLinecap="round" />
      <text x={cx} y={cy - 2} textAnchor="middle" fill="#F9FAFB" fontSize={size * 0.22} fontFamily="Space Grotesk" fontWeight="700">{value}</text>
      <text x={cx} y={cy + size * 0.14} textAnchor="middle" fill="#6B7280" fontSize={size * 0.1} fontFamily="JetBrains Mono">/{max}</text>
    </svg>
  );
}
