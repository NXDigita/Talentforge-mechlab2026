import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { TFESGauge } from "@/components/TFESGauge";
import { StatusPill } from "@/components/StatusPill";
import { SFBadge } from "@/components/SFBadge";
import { currentUser, simulations, nftBadges } from "@/data/mockData";
import { Shield, ExternalLink, Share2 } from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer } from "recharts";
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

const TIMELINE = [
  { type: "badge", text: "Earned Structural Analyst II badge", date: "Dec 15, 2024", color: "#F97316" },
  { type: "sim", text: "Completed spur-gear-assembly (Score 89)", date: "Dec 10, 2024", color: "#22C55E" },
  { type: "badge", text: "Earned Gear Systems Master badge", date: "Nov 10, 2024", color: "#F97316" },
  { type: "sim", text: "Completed gear-train-4stage (Score 92)", date: "Nov 5, 2024", color: "#22C55E" },
  { type: "challenge", text: "Passed FEA-STR-005 challenge", date: "Oct 28, 2024", color: "#60A5FA" },
];

export default function Portfolio() {
  const params = useParams<{ username: string }>();
  const username = params.username ?? currentUser.username;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <div className="pt-14 max-w-4xl mx-auto p-6 space-y-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
          {/* Hero */}
          <div className="relative bg-[#111827] border border-[#1F2937] rounded-lg p-6">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono px-2 py-1 rounded">
              <Shield className="w-3 h-3" /> VERIFIED ENGINEERING PORTFOLIO
            </div>
            <div className="flex items-start gap-5">
              <div className="w-20 h-20 rounded-full bg-[#F97316] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ fontFamily: "Space Grotesk" }}>RK</div>
              <div>
                <h1 className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: "Space Grotesk" }}>{currentUser.name}</h1>
                <div className="font-mono text-sm text-gray-400 mb-2">@{username}</div>
                <div className="text-sm text-amber-400 mb-4">{currentUser.tier} Mechanical Engineer 🟠</div>
              </div>
              <div className="ml-auto hidden md:block">
                <TFESGauge value={currentUser.tfes} size={100} />
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#1F2937] text-center">
              {[["63", "Simulations"], ["8", "Badges"], ["2.7x", "Avg SF"], ["₹22,500", "Earned"]].map(([v, l]) => (
                <div key={l}><div className="font-mono text-lg font-bold text-white">{v}</div><div className="text-xs text-gray-400">{l}</div></div>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Competency Radar */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
              <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>Competency Radar</h2>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={COMPETENCY}>
                  <PolarGrid stroke="#1F2937" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 8 }} />
                  <Radar name="You" dataKey="user" stroke="#F97316" fill="#F97316" fillOpacity={0.35} />
                  <Radar name="Domain Avg" dataKey="avg" stroke="#6B7280" fill="#6B7280" fillOpacity={0.1} strokeDasharray="4,2" />
                  <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Top FEA Runs */}
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
              <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>Top FEA Runs</h2>
              <table className="w-full text-xs">
                <thead><tr className="border-b border-[#1F2937] text-gray-400"><th className="text-left pb-2">Project</th><th>Score</th><th>SF</th><th>Status</th></tr></thead>
                <tbody>
                  {simulations.filter(s => s.type === "FEA").map(s => (
                    <tr key={s.id} className="border-b border-[#1F2937]/40">
                      <td className="py-2 text-gray-300 font-medium truncate max-w-[120px]">{s.name}</td>
                      <td className="py-2 text-center font-mono text-[#F97316]">{s.score}</td>
                      <td className="py-2 text-center"><SFBadge sf={s.sf ?? null} /></td>
                      <td className="py-2 text-center"><StatusPill status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* NFT Wall */}
          <div>
            <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>NFT Credential Wall</h2>
            <div className="grid md:grid-cols-3 gap-4">
              {nftBadges.map(b => (
                <div key={b.id} className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3"><Shield className="w-8 h-8 text-[#F97316]" /><div><div className="text-sm font-semibold text-white">{b.name}</div><div className="text-xs text-gray-500 font-mono">{b.date}</div></div></div>
                  <div className="flex gap-2 mt-3">
                    <button onClick={showToast} className="flex-1 text-xs py-1 border border-[#374151] text-gray-400 hover:text-white rounded flex items-center justify-center gap-1" data-testid={`btn-chain-${b.id}`}><ExternalLink className="w-3 h-3" /> Chain</button>
                    <button onClick={showToast} className="text-xs px-2 py-1 border border-[#374151] text-gray-400 hover:text-white rounded" data-testid={`btn-share-portfolio-${b.id}`}><Share2 className="w-3 h-3" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div>
            <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>Design Timeline</h2>
            <div className="relative pl-6 border-l border-[#1F2937]">
              {TIMELINE.map((t, i) => (
                <div key={i} className="mb-6 relative">
                  <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-[#0A0F1E]" style={{ background: t.color }} />
                  <div className="text-sm text-gray-300">{t.text}</div>
                  <div className="text-xs text-gray-500 font-mono mt-0.5">{t.date}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Employer CTA */}
          <div className="bg-[#111827] border border-[#F97316]/30 rounded-lg p-6 text-center">
            <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>Interested in this engineer?</h2>
            <p className="text-gray-400 text-sm mb-6">All credentials are cryptographically verified and on-chain.</p>
            <div className="flex gap-3 justify-center">
              <button onClick={showToast} className="px-6 py-2.5 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors text-sm" data-testid="button-contact">Contact Raj Kumar</button>
              <button onClick={showToast} className="px-6 py-2.5 border border-[#374151] text-gray-300 hover:text-white font-semibold rounded transition-colors text-sm" data-testid="button-download-creds">Download Credentials PDF</button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
