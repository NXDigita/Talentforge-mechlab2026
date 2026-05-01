interface SFBadgeProps {
  sf: number | null;
}

export function SFBadge({ sf }: SFBadgeProps) {
  if (sf === null) return <span className="font-mono text-gray-500">N/A</span>;
  let color = "text-red-400";
  if (sf >= 2.5) color = "text-green-300 font-bold";
  else if (sf >= 1.5) color = "text-green-400";
  else if (sf >= 1.0) color = "text-amber-400";
  return <span className={`font-mono ${color}`}>{sf.toFixed(2)}x</span>;
}
