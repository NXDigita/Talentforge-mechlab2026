import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { leaderboard } from "@/data/mockData";
import { Menu, Trophy } from "lucide-react";

const DOMAIN_TABS = ["Overall", "FEA", "CFD", "CAD", "Kinematics", "Thermal"] as const;
const GEO_FILTERS = ["All India", "Tamil Nadu", "Tier 2", "By Institute"] as const;

const tierColor: Record<string, string> = {
  Expert: "text-[#F97316] bg-[#F97316]/10 border-[#F97316]/30",
  Advanced: "text-blue-400 bg-blue-500/10 border-blue-500/30",
  Intermediate: "text-green-400 bg-green-500/10 border-green-500/30",
  Beginner: "text-gray-400 bg-gray-500/10 border-gray-500/30",
};

const PODIUM_COLORS = ["#C0C0C0", "#FFD700", "#CD7F32"];
const PODIUM_HEIGHTS = [80, 110, 65];
const PODIUM_ORDER = [1, 0, 2];

export default function Leaderboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [domainTab, setDomainTab] = useState<typeof DOMAIN_TABS[number]>("Overall");
  const [geoFilter, setGeoFilter] = useState<typeof GEO_FILTERS[number]>("All India");

  const top3 = leaderboard.slice(0, 3);
  const rest = leaderboard.slice(3);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-5xl">
          <div className="flex items-center gap-3 mb-6">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>Leaderboard</h1>
              <p className="text-sm text-gray-500">Top mechanical engineers by TFES score</p>
            </div>
          </div>

          {/* Domain tabs */}
          <div className="flex gap-1 border-b border-[#1F2937] mb-4 overflow-x-auto">
            {DOMAIN_TABS.map(t => (
              <button key={t} onClick={() => setDomainTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors whitespace-nowrap ${domainTab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`} data-testid={`tab-domain-${t.toLowerCase()}`}>{t}</button>
            ))}
          </div>

          {/* Geo filter */}
          <div className="flex gap-2 mb-8">
            {GEO_FILTERS.map(f => (
              <button key={f} onClick={() => setGeoFilter(f)} className={`px-3 py-1.5 text-xs rounded font-mono transition-colors ${geoFilter === f ? "bg-[#F97316] text-white" : "bg-[#111827] border border-[#1F2937] text-gray-400 hover:text-white"}`} data-testid={`btn-geo-${f.toLowerCase().replace(" ", "-")}`}>{f}</button>
            ))}
          </div>

          {/* Podium */}
          <div className="flex items-end justify-center gap-4 mb-8 h-48">
            {PODIUM_ORDER.map(i => {
              const user = top3[i];
              const pos = i;
              const medals = ["🥇", "🥈", "🥉"];
              return (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="flex flex-col items-center">
                  <div className="w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-sm mb-2" style={{ background: PODIUM_COLORS[pos], fontFamily: "Space Grotesk" }}>
                    {user.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="text-sm font-semibold text-white mb-0.5" style={{ fontFamily: "Space Grotesk" }}>{user.name.split(" ")[0]}</div>
                  <div className="font-mono text-xs text-[#F97316] mb-1">TFES {user.tfes}</div>
                  <div className="text-lg mb-2">{medals[pos]}</div>
                  <div className="w-20 flex items-end justify-center text-center" style={{ height: PODIUM_HEIGHTS[pos] + "px", background: `${PODIUM_COLORS[pos]}22`, border: `1px solid ${PODIUM_COLORS[pos]}44`, borderRadius: "6px 6px 0 0" }}>
                    <span className="font-mono text-xs pb-2" style={{ color: PODIUM_COLORS[pos] }}>#{pos + 1}</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Full table */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  {["Rank", "Name", "City", "Tier", "XP", "TFES", "Avg SF", "Top Domain", "Badges"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((u) => (
                  <tr key={u.rank} className={`border-b border-[#1F2937]/50 transition-colors ${u.isCurrentUser ? "bg-[#F97316]/10 border-l-2 border-l-[#F97316]" : "hover:bg-[#1F2937]/30"}`} data-testid={`row-leader-${u.rank}`}>
                    <td className="px-4 py-3 font-mono text-sm">
                      {u.rank <= 3 ? ["🥇", "🥈", "🥉"][u.rank - 1] : <span className="text-gray-400">#{u.rank}</span>}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/portfolio/${u.name.toLowerCase().replace(" ", ".")}`} className="text-white hover:text-[#F97316] font-medium text-sm transition-colors">
                        {u.name} {u.isCurrentUser && <span className="text-xs text-[#F97316] font-mono ml-1">(you)</span>}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{u.city}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded border font-mono ${tierColor[u.tier] ?? ""}`}>{u.tier}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-300">{u.xp.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-[#F97316]">{u.tfes}</td>
                    <td className="px-4 py-3 font-mono text-xs text-green-400">{u.avgSF}x</td>
                    <td className="px-4 py-3"><span className="text-xs px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded font-mono">{u.domain}</span></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-300 flex items-center gap-1"><Trophy className="w-3 h-3 text-amber-400" />{u.badges}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
