import { useState, useEffect } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { currentUser, analyticsData, nftBadges } from "@/data/mockData";
import { Menu, Shield, Copy, ExternalLink, Share2, Sparkles, TrendingUp, TrendingDown, AlertTriangle, Target, Zap, RefreshCw, ChevronRight } from "lucide-react";
import { AreaChart, Area, LineChart, Line, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ReferenceLine, ReferenceArea, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const showToast = () => toast("⚙️ Simulation feature live soon!", { icon: "⚙️", style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });

const COMPETENCY = [
  { subject: "FEA", user: 88, avg: 72 },
  { subject: "CFD", user: 71, avg: 68 },
  { subject: "CAD", user: 65, avg: 70 },
  { subject: "Kinematics", user: 79, avg: 65 },
  { subject: "Manufacturing", user: 58, avg: 63 },
  { subject: "Thermal", user: 84, avg: 71 },
];

const DOMAIN_TABLE = [
  { domain: "FEA Structural", attempts: 28, best: 92, avg: 81, bestSF: 3.21, status: "Expert" },
  { domain: "CFD Flow", attempts: 12, best: 74, avg: 67, bestSF: null, status: "Advanced" },
  { domain: "Kinematics", attempts: 9, best: 91, avg: 84, bestSF: 2.97, status: "Advanced" },
  { domain: "Thermal", attempts: 8, best: 87, avg: 79, bestSF: 4.1, status: "Advanced" },
  { domain: "CAD", attempts: 4, best: 65, avg: 60, bestSF: null, status: "Intermediate" },
  { domain: "Manufacturing", attempts: 2, best: 71, avg: 68, bestSF: null, status: "Intermediate" },
];

const RANGES = ["7D", "30D", "90D", "All"] as const;

/* ─── AI Insights engine ─── */
type InsightType = "warning" | "opportunity" | "trend" | "action" | "achievement";

interface Insight {
  id: string;
  type: InsightType;
  title: string;
  body: string;
  metric: string;
  metricLabel: string;
  metricColor: string;
  cta: string;
  ctaHref?: string;
  icon: typeof TrendingUp;
}

function generateInsights(seed: number): Insight[] {
  const recentScores = analyticsData.slice(-7).map(d => d.score);
  const prevScores = analyticsData.slice(-14, -7).map(d => d.score);
  const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
  const prevAvg = prevScores.reduce((a, b) => a + b, 0) / prevScores.length;
  const scoreDelta = recentAvg - prevAvg;

  const feaAvg = DOMAIN_TABLE.find(d => d.domain === "FEA Structural")?.avg ?? 81;
  const cfdAvg = DOMAIN_TABLE.find(d => d.domain === "CFD Flow")?.avg ?? 67;
  const cfdGap = feaAvg - cfdAvg;

  const cadScore = COMPETENCY.find(c => c.subject === "CAD")?.user ?? 65;
  const cadAvg = COMPETENCY.find(c => c.subject === "CAD")?.avg ?? 70;

  const mfgAttempts = DOMAIN_TABLE.find(d => d.domain === "Manufacturing")?.attempts ?? 2;

  const recentSFs = analyticsData.slice(-7).map(d => d.sf);
  const sfTrend = recentSFs[recentSFs.length - 1] - recentSFs[0];

  const insights: Insight[] = [
    {
      id: "cfd-gap",
      type: "warning",
      title: "CFD scores lag FEA by 14 points",
      body: `Your FEA avg (${feaAvg}) is ${cfdGap} pts above CFD avg (${cfdAvg}). This gap is holding back your TFES ceiling. Turbulence model selection (k-ε vs k-ω SST) is the most common failure point in your CFD runs.`,
      metric: `−${cfdGap} pts`,
      metricLabel: "FEA vs CFD gap",
      metricColor: "#EF4444",
      cta: "Try CFD Challenge",
      ctaHref: "/challenges",
      icon: AlertTriangle,
    },
    {
      id: "score-momentum",
      type: scoreDelta >= 0 ? "trend" : "warning",
      title: scoreDelta >= 0
        ? `Score up ${scoreDelta.toFixed(1)} pts this week`
        : `Score down ${Math.abs(scoreDelta).toFixed(1)} pts this week`,
      body: scoreDelta >= 0
        ? `7-day moving average is climbing. Your mesh quality scores improved most — Jacobian values above 0.90 are consistently unlocking the top score tier.`
        : `Recent simulations pulled your average down. Check your mesh density settings — 3 of your last 5 runs used coarse meshes (>5 mm) which capped scores below 75.`,
      metric: `${scoreDelta >= 0 ? "+" : ""}${scoreDelta.toFixed(1)}`,
      metricLabel: "7-day delta",
      metricColor: scoreDelta >= 0 ? "#22C55E" : "#EF4444",
      cta: "View Score Trend",
      icon: scoreDelta >= 0 ? TrendingUp : TrendingDown,
    },
    {
      id: "cad-below-avg",
      type: "opportunity",
      title: "CAD score is 5 pts below domain average",
      body: `Your CAD competency (${cadScore}) sits below the platform average (${cadAvg}). You've only attempted 4 CAD projects. Completing 3 more would unlock the CAD Fundamentals badge and boost your TFES by an estimated +6 pts.`,
      metric: `${cadScore} vs ${cadAvg}`,
      metricLabel: "You vs domain avg",
      metricColor: "#F59E0B",
      cta: "Start CAD Project",
      ctaHref: "/designvault",
      icon: Target,
    },
    {
      id: "thermal-strength",
      type: "achievement",
      title: "Thermal Engineering is your hidden strength",
      body: `Avg SF of 4.1x in Thermal — top 8% platform-wide. With only 8 attempts, you're already Advanced tier. Two Expert-level Thermal challenges would push you to the top 3% and qualify for the Thermal Engineer Elite badge (₹18,500 prize).`,
      metric: "4.10x",
      metricLabel: "Avg SF in Thermal",
      metricColor: "#22C55E",
      cta: "View Thermal Challenge",
      ctaHref: "/challenges",
      icon: Zap,
    },
    {
      id: "manufacturing-gap",
      type: "action",
      title: `Manufacturing: only ${mfgAttempts} attempts logged`,
      body: `Manufacturing is your least explored domain — ${mfgAttempts} runs vs your FEA total of 28. Employers in Tier 1 automotive firms filter specifically for CNC + FEA combined profiles. Even 3–4 Manufacturing runs would round out your portfolio significantly.`,
      metric: `${mfgAttempts} runs`,
      metricLabel: "vs 28 in FEA",
      metricColor: "#60A5FA",
      cta: "Try CNC Challenge",
      ctaHref: "/challenges",
      icon: Target,
    },
    {
      id: "sf-trend",
      type: sfTrend >= 0 ? "trend" : "warning",
      title: sfTrend >= 0
        ? "Safety Factor improving — great material choices"
        : "Safety Factor dipping — review material selections",
      body: sfTrend >= 0
        ? `SF has risen ${sfTrend.toFixed(2)}x over the last 7 sims. Switching from Al 6061 to AISI 1045 Steel on structural runs is paying off. Keep this material strategy for load-heavy challenges.`
        : `SF dropped ${Math.abs(sfTrend).toFixed(2)}x recently. Bracket Mount v1 (SF 0.87) is dragging the average. Re-run with increased cross-section height or switch to Ti-6Al-4V for critical load paths.`,
      metric: `${sfTrend >= 0 ? "+" : ""}${sfTrend.toFixed(2)}x`,
      metricLabel: "SF change (7 sims)",
      metricColor: sfTrend >= 0 ? "#22C55E" : "#EF4444",
      cta: "View SF History",
      icon: sfTrend >= 0 ? TrendingUp : TrendingDown,
    },
  ];

  // Shuffle deterministically with seed
  const shuffled = [...insights];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = (seed * 7 + i * 13) % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 4);
}

const TYPE_STYLES: Record<InsightType, { border: string; bg: string; badge: string; badgeText: string }> = {
  warning:     { border: "border-red-500/25",    bg: "bg-red-500/5",    badge: "bg-red-500/15 text-red-400 border-red-500/20",       badgeText: "Warning" },
  opportunity: { border: "border-amber-500/25",  bg: "bg-amber-500/5",  badge: "bg-amber-500/15 text-amber-400 border-amber-500/20", badgeText: "Opportunity" },
  trend:       { border: "border-blue-500/25",   bg: "bg-blue-500/5",   badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",    badgeText: "Trend" },
  action:      { border: "border-[#60A5FA]/25",  bg: "bg-[#60A5FA]/5",  badge: "bg-blue-500/15 text-blue-400 border-blue-500/20",    badgeText: "Action" },
  achievement: { border: "border-green-500/25",  bg: "bg-green-500/5",  badge: "bg-green-500/15 text-green-400 border-green-500/20", badgeText: "Achievement" },
};

/* ─── Typewriter hook ─── */
function useTypewriter(text: string, speed = 28) {
  const [displayed, setDisplayed] = useState("");
  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      if (i < text.length) { setDisplayed(text.slice(0, i + 1)); i++; }
      else clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);
  return displayed;
}

/* ─── AI Insights Panel ─── */
function AIInsightsPanel() {
  const [seed, setSeed] = useState(1);
  const [loading, setLoading] = useState(false);
  const [insights, setInsights] = useState<Insight[]>(() => generateInsights(1));
  const [expanded, setExpanded] = useState<string | null>(insights[0]?.id ?? null);

  const headerText = useTypewriter("Analyzing 63 simulations, 6 domains, 30-day trend data...", 22);

  const refresh = () => {
    setLoading(true);
    setTimeout(() => {
      const next = seed + 1;
      setSeed(next);
      setInsights(generateInsights(next));
      setExpanded(null);
      setLoading(false);
    }, 1400);
  };

  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]" style={{ background: "linear-gradient(135deg, #0D1424 0%, #111827 100%)" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#F97316]/15 border border-[#F97316]/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#F97316]" />
          </div>
          <div>
            <div className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>AI Performance Insights</div>
            <div className="text-[10px] font-mono text-gray-600 h-3 overflow-hidden">
              {loading ? (
                <span className="text-[#F97316] animate-pulse">Re-analyzing your data...</span>
              ) : (
                <span>{headerText}</span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={refresh}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs px-3 py-1.5 border border-[#374151] text-gray-400 hover:text-white hover:border-[#F97316]/50 rounded transition-colors disabled:opacity-40"
          data-testid="btn-refresh-insights"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? "animate-spin" : ""}`} />
          Regenerate
        </button>
      </div>

      {/* Insight cards */}
      <div className="p-4 space-y-3">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="skeleton" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-3">
              {[0, 1, 2, 3].map(i => (
                <div key={i} className="h-16 rounded-lg bg-[#1F2937]/50 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </motion.div>
          ) : (
            <motion.div key={seed} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="space-y-3">
              {insights.map((insight, i) => {
                const style = TYPE_STYLES[insight.type];
                const Icon = insight.icon;
                const isOpen = expanded === insight.id;

                return (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    className={`border rounded-lg overflow-hidden transition-colors cursor-pointer ${style.border} ${isOpen ? style.bg : "border-[#1F2937] hover:border-[#374151]"}`}
                    onClick={() => setExpanded(isOpen ? null : insight.id)}
                    data-testid={`insight-card-${insight.id}`}
                  >
                    {/* Card header row */}
                    <div className="flex items-center gap-3 px-4 py-3">
                      <Icon className="w-4 h-4 flex-shrink-0" style={{ color: insight.metricColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-white" style={{ fontFamily: "Space Grotesk" }}>{insight.title}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded border font-mono ${style.badge}`}>{style.badgeText}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 mr-1">
                        <div className="font-mono text-sm font-bold" style={{ color: insight.metricColor }}>{insight.metric}</div>
                        <div className="text-[9px] text-gray-600 font-mono">{insight.metricLabel}</div>
                      </div>
                      <ChevronRight className={`w-4 h-4 text-gray-600 flex-shrink-0 transition-transform ${isOpen ? "rotate-90" : ""}`} />
                    </div>

                    {/* Expanded body */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 border-t border-[#1F2937]/40">
                            <p className="text-xs text-gray-400 leading-relaxed mt-3 mb-3">{insight.body}</p>
                            {insight.ctaHref ? (
                              <Link
                                href={insight.ctaHref}
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors"
                                onClick={e => e.stopPropagation()}
                                data-testid={`insight-cta-${insight.id}`}
                              >
                                {insight.cta} <ChevronRight className="w-3 h-3" />
                              </Link>
                            ) : (
                              <button
                                onClick={e => { e.stopPropagation(); showToast(); }}
                                className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors"
                                data-testid={`insight-cta-${insight.id}`}
                              >
                                {insight.cta} <ChevronRight className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Summary footer */}
        {!loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="pt-2 border-t border-[#1F2937] flex items-center justify-between text-[10px] font-mono text-gray-600">
            <span>Based on {analyticsData.length} data points · {DOMAIN_TABLE.reduce((a, d) => a + d.attempts, 0)} simulations · 6 domains</span>
            <span className="text-[#F97316]/60">TF-AI v2.1</span>
          </motion.div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function MechEdge() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState<typeof RANGES[number]>("30D");

  const sliced = range === "7D" ? analyticsData.slice(-7) : analyticsData;

  const movingAvg = sliced.map((d, i) => ({
    ...d,
    ma7: i >= 6 ? sliced.slice(i - 6, i + 1).reduce((a, b) => a + b.score, 0) / 7 : undefined,
  }));

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-5xl space-y-6">
          <div className="flex items-center gap-3 mb-2">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>MechEdge</h1>
              <p className="font-mono text-sm text-gray-500">@{currentUser.username}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "TFES Score", value: String(currentUser.tfes), delta: "+4", pos: true },
              { label: "Simulations", value: String(currentUser.sims), delta: "+8", pos: true },
              { label: "Avg SF", value: `${currentUser.avgSF}x`, delta: "+0.3", pos: true },
              { label: "Profile Views", value: currentUser.profileViews.toLocaleString(), delta: "+142", pos: true },
            ].map(s => (
              <div key={s.label} className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <div className="text-xs text-gray-400 mb-1">{s.label}</div>
                <div className="font-mono text-2xl font-bold text-white">{s.value}</div>
                <div className={`text-xs font-mono mt-1 ${s.pos ? "text-green-400" : "text-red-400"}`}>{s.delta} this week</div>
              </div>
            ))}
          </div>

          {/* AI Insights Panel — placed prominently above charts */}
          <AIInsightsPanel />

          {/* Score trend chart */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Score Trend</h2>
              <div className="flex gap-1">
                {RANGES.map(r => (
                  <button key={r} onClick={() => setRange(r)} className={`px-2.5 py-1 text-xs font-mono rounded transition-colors ${range === r ? "bg-[#F97316] text-white" : "bg-[#1F2937] text-gray-400 hover:text-white"}`} data-testid={`btn-range-${r}`}>{r}</button>
                ))}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={movingAvg} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <YAxis domain={[60, 100]} tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <Area type="monotone" dataKey="score" stroke="#F97316" fill="#F97316" fillOpacity={0.2} strokeWidth={2} name="Score" />
                <Line type="monotone" dataKey="ma7" stroke="#60A5FA" strokeWidth={1.5} strokeDasharray="5,3" dot={false} name="7d MA" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* SF history chart */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
            <h2 className="font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Safety Factor History</h2>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={analyticsData} margin={{ left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" />
                <XAxis dataKey="day" tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <YAxis domain={[0, 5]} tick={{ fill: "#6B7280", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 11 }} />
                <ReferenceArea y1={0} y2={1.0} fill="#EF4444" fillOpacity={0.08} />
                <ReferenceArea y1={1.0} y2={1.5} fill="#FBBF24" fillOpacity={0.08} />
                <ReferenceArea y1={1.5} y2={2.5} fill="#22C55E" fillOpacity={0.05} />
                <ReferenceLine y={1.0} stroke="#EF4444" strokeDasharray="4,3" label={{ value: "FAILURE", position: "right", fill: "#EF4444", fontSize: 9, fontFamily: "JetBrains Mono" }} />
                <ReferenceLine y={1.5} stroke="#FBBF24" strokeDasharray="4,3" label={{ value: "MIN SAFE", position: "right", fill: "#FBBF24", fontSize: 9, fontFamily: "JetBrains Mono" }} />
                <ReferenceLine y={2.5} stroke="#22C55E" strokeDasharray="4,3" label={{ value: "TARGET", position: "right", fill: "#22C55E", fontSize: 9, fontFamily: "JetBrains Mono" }} />
                <Line type="monotone" dataKey="sf" stroke="#F97316" strokeWidth={2} dot={false} name="Safety Factor" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Competency radar + domain table */}
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
              <h2 className="font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Competency Radar</h2>
              <ResponsiveContainer width="100%" height={260}>
                <RadarChart data={COMPETENCY}>
                  <PolarGrid stroke="#1F2937" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 8, fontFamily: "JetBrains Mono" }} />
                  <Radar name="You" dataKey="user" stroke="#F97316" fill="#F97316" fillOpacity={0.35} />
                  <Radar name="Domain Avg" dataKey="avg" stroke="#6B7280" fill="#6B7280" fillOpacity={0.15} strokeDasharray="4,2" />
                  <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 11 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
              <h2 className="font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Domain Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-[#1F2937] text-gray-400">
                      <th className="text-left py-2 pr-3">Domain</th>
                      <th>Best</th>
                      <th>Avg</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {DOMAIN_TABLE.map(d => (
                      <tr key={d.domain} className="border-b border-[#1F2937]/40">
                        <td className="py-2 pr-3 text-gray-300 font-medium text-left">{d.domain}</td>
                        <td className="text-center font-mono text-[#F97316]">{d.best}</td>
                        <td className="text-center font-mono text-gray-400">{d.avg}</td>
                        <td className="text-center"><span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#1F2937] text-gray-400">{d.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* NFT Credential Wall */}
          <div>
            <h2 className="font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>NFT Credential Wall</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {nftBadges.map(b => (
                <div key={b.id} className="bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg p-4 transition-colors" data-testid={`card-nft-${b.id}`}>
                  <div className="flex items-center gap-3 mb-3">
                    <Shield className="w-10 h-10 text-[#F97316]" />
                    <div>
                      <div className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>{b.name}</div>
                      <div className="text-xs text-gray-500 font-mono">{b.date}</div>
                    </div>
                  </div>
                  <div className="text-xs font-mono space-y-1 mb-3">
                    <div className="flex justify-between"><span className="text-gray-500">Score</span><span className="text-[#F97316]">{b.score}/100</span></div>
                    {b.sf && <div className="flex justify-between"><span className="text-gray-500">SF</span><span className="text-green-400">{b.sf}x</span></div>}
                    <div className="text-gray-600 truncate">{b.tokenAddress}</div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={showToast} className="flex-1 text-xs py-1.5 border border-[#374151] text-gray-400 hover:text-white rounded transition-colors flex items-center justify-center gap-1" data-testid={`btn-view-chain-${b.id}`}><ExternalLink className="w-3 h-3" /> View on Chain</button>
                    <button onClick={showToast} className="text-xs px-3 py-1.5 border border-[#374151] text-gray-400 hover:text-white rounded transition-colors" data-testid={`btn-share-${b.id}`}><Share2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Credential Shield */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
            <div className="flex items-center gap-3 mb-4">
              <Shield className="w-8 h-8 text-green-400" />
              <h2 className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>VERIFIED CREDENTIAL</h2>
            </div>
            <div className="space-y-2 mb-4">
              {["Cryptographic Signature", "CIE Auto-Graded", "On-Chain Immutable"].map(c => (
                <div key={c} className="flex items-center gap-3 text-sm"><span className="text-green-400">✓</span><span className="text-gray-300">{c}</span></div>
              ))}
            </div>
            <div className="flex items-center gap-3 pt-4 border-t border-[#1F2937]">
              <div className="flex-1 font-mono text-xs text-gray-400 bg-[#0A0F1E] border border-[#1F2937] rounded px-3 py-2 truncate">https://talentforge.io/verify/{currentUser.username}</div>
              <button onClick={() => { navigator.clipboard.writeText(`https://talentforge.io/verify/${currentUser.username}`); toast("Link copied!", { style: { background: "#1F2937", color: "#F9FAFB" } }); }} className="p-2 border border-[#374151] text-gray-400 hover:text-white rounded transition-colors" data-testid="btn-copy-verify"><Copy className="w-4 h-4" /></button>
              <button onClick={showToast} className="px-3 py-2 bg-[#F97316] text-white text-xs font-semibold rounded hover:bg-[#ea6c0f] transition-colors" data-testid="btn-qr-code">QR Code</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
