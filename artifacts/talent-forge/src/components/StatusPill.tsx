interface StatusPillProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusPill({ status, size = "sm" }: StatusPillProps) {
  const classes: Record<string, string> = {
    SAFE: "bg-green-500/20 text-green-400 border border-green-500/30",
    CRITICAL: "bg-red-500/20 text-red-400 border border-red-500/30",
    WARN: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    WARNING: "bg-amber-500/20 text-amber-400 border border-amber-500/30",
    RUNNING: "bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse",
    FAILED: "bg-red-500/20 text-red-400 border border-red-500/30",
    MESHING: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  };
  const sizeClass = size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";
  return (
    <span className={`inline-flex items-center rounded font-mono font-medium ${sizeClass} ${classes[status] ?? "bg-gray-500/20 text-gray-400 border border-gray-500/30"}`}>
      {status}
    </span>
  );
}
