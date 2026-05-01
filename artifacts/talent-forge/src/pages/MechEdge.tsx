import { useState } from "react";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { currentUser, analyticsData, nftBadges } from "@/data/mockData";
import { Menu, Shield, Copy, ExternalLink, Share2 } from "lucide-react";
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

export default function MechEdge() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [range, setRange] = useState<typeof RANGES[number]>("30D");

  const sliced = range === "7D" ? analyticsData.slice(-7) : range === "30D" ? analyticsData : range === "90D" ? analyticsData : analyticsData;

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

          {/* Competency radar */}
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

            {/* Domain table */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
              <h2 className="font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Domain Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead><tr className="border-b border-[#1F2937] text-gray-400"><th className="text-left py-2 pr-3">Domain</th><th>Best</th><th>Avg</th><th>Status</th></tr></thead>
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
