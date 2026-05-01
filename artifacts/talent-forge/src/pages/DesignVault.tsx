import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { currentUser, simulations } from "@/data/mockData";
import { Menu, Star, GitFork, Search } from "lucide-react";

const SKILL_CHIPS = [
  { label: "FEA Structural", passed: true },
  { label: "CFD Flow", passed: true },
  { label: "Kinematics", passed: true },
  { label: "Thermal", passed: true },
  { label: "CAD", passed: false },
  { label: "Manufacturing", passed: false },
];

const PINNED = [
  { id: "spur-gear-assembly", name: "spur-gear-assembly", desc: "Multi-stage spur gear FEA under torsional load", score: 89, sf: 2.84, stars: 12, forks: 3, domain: "FEA" },
  { id: "bracket-mount-v1", name: "bracket-mount-v1", desc: "Cantilevered bracket under vertical point load", score: 31, sf: 0.87, stars: 2, forks: 0, domain: "FEA" },
  { id: "pipe-bend-flow", name: "pipe-bend-flow", desc: "CFD analysis of 90° pipe elbow flow dynamics", score: 74, sf: null, stars: 7, forks: 2, domain: "CFD" },
  { id: "gear-train-4stage", name: "gear-train-4stage", desc: "4-stage parallel-axis gear train kinematics", score: 92, sf: 3.21, stars: 18, forks: 5, domain: "Kinematics" },
  { id: "cooling-fin-array", name: "cooling-fin-array", desc: "Array of aluminum cooling fins thermal FEA", score: 87, sf: 4.1, stars: 9, forks: 1, domain: "Thermal" },
];

const TABS = ["Overview", "Repositories", "Projects", "Badges", "Forks"] as const;

export default function DesignVault() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");
  const [search, setSearch] = useState("");

  const filtered = PINNED.filter(p => p.name.includes(search) || p.desc.includes(search));

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-6xl">
          <button className="md:hidden text-gray-400 mb-4" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Left profile */}
            <div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5 sticky top-20">
                <div className="w-16 h-16 rounded-full bg-[#F97316] flex items-center justify-center text-white text-xl font-bold mb-3" style={{ fontFamily: "Space Grotesk" }}>RK</div>
                <div className="font-bold text-lg text-white mb-0.5" style={{ fontFamily: "Space Grotesk" }}>{currentUser.name}</div>
                <div className="text-sm text-gray-400 mb-1 font-mono">{currentUser.username}</div>
                <div className="text-xs text-amber-400 mb-4">{currentUser.tier} Engineer 🟠</div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">TFES Score</span>
                    <span className="font-mono text-[#F97316]">{currentUser.tfes}/100</span>
                  </div>
                  <div className="h-1.5 bg-[#1F2937] rounded-full"><div className="h-1.5 bg-[#F97316] rounded-full" style={{ width: `${currentUser.tfes}%` }} /></div>
                </div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {SKILL_CHIPS.map(sk => (
                    <span key={sk.label} className={`px-2 py-0.5 text-xs rounded-full font-mono ${sk.passed ? "bg-green-500/15 text-green-400 border border-green-500/20" : "bg-[#1F2937] text-gray-500 border border-[#374151]"}`}>
                      {sk.passed ? "✓ " : ""}{sk.label}
                    </span>
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-[#1F2937] pt-3">
                  <div><div className="font-mono font-bold text-white">{currentUser.sims}</div><div className="text-gray-500">Sims</div></div>
                  <div><div className="font-mono font-bold text-white">{currentUser.badges}</div><div className="text-gray-500">Badges</div></div>
                  <div><div className="font-mono font-bold text-green-400">{currentUser.avgSF}x</div><div className="text-gray-500">Avg SF</div></div>
                </div>
              </div>
            </div>

            {/* Right content */}
            <div>
              <div className="flex gap-1 border-b border-[#1F2937] mb-6">
                {TABS.map(t => (
                  <button key={t} onClick={() => setActiveTab(t)}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`}
                    data-testid={`tab-vault-${t.toLowerCase()}`}
                  >{t}</button>
                ))}
              </div>

              {activeTab === "Overview" && (
                <div className="space-y-8">
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Simulation Activity</h3>
                    <ContributionHeatmap />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Pinned Projects</h3>
                    <div className="grid md:grid-cols-2 gap-3">
                      {PINNED.map(p => (
                        <Link key={p.id} href={`/designvault/${p.id}`} className="block bg-[#0A0F1E] border border-[#1F2937] hover:border-[#F97316] rounded-lg p-4 transition-colors" data-testid={`card-pinned-${p.id}`}>
                          <div className="flex items-start justify-between mb-2">
                            <span className="text-sm font-mono text-[#60A5FA] font-medium">{p.name}</span>
                            <span className="text-xs px-1.5 py-0.5 bg-[#F97316]/10 text-[#F97316] rounded font-mono">{p.score}/100</span>
                          </div>
                          <p className="text-xs text-gray-500 mb-3">{p.desc}</p>
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex gap-3 text-gray-500 font-mono">
                              <span><Star className="w-3 h-3 inline mr-0.5" />{p.stars}</span>
                              <span><GitFork className="w-3 h-3 inline mr-0.5" />{p.forks}</span>
                            </div>
                            <div className="flex gap-2">
                              <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded text-[10px] font-mono">{p.domain}</span>
                              {p.sf !== null && <span className={`font-mono text-[10px] ${p.sf >= 2.5 ? "text-green-300" : p.sf >= 1.5 ? "text-green-400" : p.sf >= 1.0 ? "text-amber-400" : "text-red-400"}`}>SF {p.sf}</span>}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "Repositories" && (
                <div>
                  <div className="flex gap-3 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Find a repository..." className="w-full pl-9 pr-4 py-2 bg-[#111827] border border-[#1F2937] rounded text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F97316]" data-testid="input-repo-search" />
                    </div>
                    <select className="bg-[#111827] border border-[#1F2937] rounded px-3 py-2 text-sm text-gray-400 focus:outline-none">
                      <option>Sort: Recent</option>
                      <option>Sort: Score</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    {filtered.map(r => (
                      <Link key={r.id} href={`/designvault/${r.id}`} className="flex items-center justify-between bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg px-4 py-3 transition-colors" data-testid={`row-repo-${r.id}`}>
                        <div>
                          <span className="font-mono text-[#60A5FA] text-sm">{r.name}</span>
                          <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                          <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{r.domain}</span>
                          <span>{r.score}/100</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {(activeTab === "Projects" || activeTab === "Badges" || activeTab === "Forks") && (
                <div className="text-center py-16 text-gray-500 font-mono text-sm">
                  <div className="text-2xl mb-3">⚙️</div>
                  <div>No {activeTab.toLowerCase()} yet</div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
