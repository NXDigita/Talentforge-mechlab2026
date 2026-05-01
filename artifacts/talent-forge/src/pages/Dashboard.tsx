import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusPill } from "@/components/StatusPill";
import { SFBadge } from "@/components/SFBadge";
import { TFESGauge } from "@/components/TFESGauge";
import { FEAStressMap } from "@/components/FEAStressMap";
import { currentUser, simulations, challenges } from "@/data/mockData";
import { Shield } from "lucide-react";

const extraSims = [
  { id: "shaft-torsion-v3", name: "Shaft Torsion v3", type: "FEA", status: "SAFE", score: 83, sf: 2.12, duration: "3m 21s" },
  { id: "impeller-cfd", name: "Impeller CFD", type: "CFD", status: "WARN", score: 68, sf: null, duration: "12m 04s" },
  { id: "frame-static", name: "Frame Static Analysis", type: "FEA", status: "CRITICAL", score: 28, sf: 0.72, duration: "5m 55s" },
  { id: "belt-drive", name: "Belt Drive System", type: "Kinematics", status: "SAFE", score: 91, sf: 2.97, duration: "2m 02s" },
  { id: "heat-exchanger", name: "Heat Exchanger", type: "Thermal", status: "SAFE", score: 79, sf: 3.48, duration: "9m 18s" },
];

const allSims = [...simulations, ...extraSims].slice(0, 10);

export default function Dashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-7xl">
          <div className="flex items-center gap-3 mb-6">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>Dashboard</h1>
              <p className="text-sm text-gray-500">Welcome back, {currentUser.name}</p>
            </div>
          </div>

          {/* 4 stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4 flex flex-col items-center">
              <TFESGauge value={currentUser.tfes} size={100} />
              <div className="text-xs text-gray-400 mt-1">TFES Score</div>
            </div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">Simulations Run</div>
              <div className="font-mono text-3xl font-bold text-white mb-2">{currentUser.sims}</div>
              <div className="flex gap-0.5 items-end h-8">
                {[4, 7, 3, 9, 6, 11, 8].map((v, i) => (
                  <div key={i} className="flex-1 bg-[#F97316] rounded-sm" style={{ height: `${(v / 11) * 100}%`, opacity: 0.5 + (i / 14) }} />
                ))}
              </div>
            </div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">Avg Safety Factor</div>
              <div className="font-mono text-3xl font-bold text-green-400 mb-1">{currentUser.avgSF}x</div>
              <div className="text-xs text-gray-500 font-mono">Sy/σ_max avg</div>
              <div className="mt-2 text-xs text-green-400 font-mono">Above 2.0 threshold</div>
            </div>
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
              <div className="text-xs text-gray-400 mb-2">NFT Badges</div>
              <div className="flex items-center gap-2">
                <Shield className="w-8 h-8 text-[#F97316]" />
                <div className="font-mono text-3xl font-bold text-white">{currentUser.badges}</div>
              </div>
              <div className="text-xs text-gray-500 mt-2 font-mono">On Polygon PoS</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Simulation Table */}
            <div className="lg:col-span-2">
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden mb-6">
                <div className="px-4 py-3 border-b border-[#1F2937]">
                  <h2 className="font-semibold text-sm text-white" style={{ fontFamily: "Space Grotesk" }}>Recent Simulations</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#1F2937]">
                        {["Status", "Project", "Type", "Score", "SF", "Duration", ""].map(h => (
                          <th key={h} className="px-3 py-2 text-left text-xs text-gray-500 font-medium">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allSims.map((sim) => (
                        <tr key={sim.id} className="border-b border-[#1F2937]/50 hover:bg-[#1F2937]/30 transition-colors">
                          <td className="px-3 py-2"><StatusPill status={sim.status} /></td>
                          <td className="px-3 py-2 text-white text-xs font-medium max-w-[120px] truncate">{sim.name}</td>
                          <td className="px-3 py-2"><span className="font-mono text-xs text-[#60A5FA]">{sim.type}</span></td>
                          <td className="px-3 py-2 font-mono text-xs text-white">{sim.score}/100</td>
                          <td className="px-3 py-2"><SFBadge sf={sim.sf ?? null} /></td>
                          <td className="px-3 py-2 font-mono text-xs text-gray-400">{sim.duration}</td>
                          <td className="px-3 py-2">
                            <Link href={`/simforge/${sim.id}`} className="text-xs text-[#F97316] hover:underline" data-testid={`link-view-${sim.id}`}>View →</Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Active Challenges */}
              <div>
                <h2 className="font-semibold text-sm text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Active Challenges</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {challenges.filter(c => c.status === "active").map(ch => (
                    <Link key={ch.id} href={`/challenges/${ch.id}`} className="block bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg p-4 transition-colors" data-testid={`card-challenge-${ch.id}`}>
                      <div className="flex items-start justify-between mb-2">
                        <span className="font-mono text-xs text-[#60A5FA]">{ch.id}</span>
                        <span className="text-xs text-amber-400">{ch.deadline}</span>
                      </div>
                      <div className="font-semibold text-sm text-white mb-3">{ch.name}</div>
                      <div className="h-1.5 bg-[#1F2937] rounded-full mb-2">
                        <div className="h-1.5 bg-[#F97316] rounded-full" style={{ width: `${ch.progress}%` }} />
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500 font-mono">{ch.progress}% complete</span>
                        <span className="text-[#F97316] font-mono">{ch.xp} XP · {ch.prize}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* FEA Widget */}
            <div>
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                <h2 className="font-semibold text-sm text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>FEA Preview — Spur Gear</h2>
                <FEAStressMap width={340} height={240} />
                <div className="grid grid-cols-2 gap-3 mt-3 text-xs font-mono">
                  {[
                    ["Peak Stress", "187.4 MPa", "text-red-400"],
                    ["Min Stress", "8.3 MPa", "text-blue-400"],
                    ["Safety Factor", "2.84x", "text-green-400"],
                    ["Elements", "42,800", "text-gray-300"],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="bg-[#1F2937] rounded p-2">
                      <div className="text-gray-500 text-[10px] mb-0.5">{label}</div>
                      <div className={cls}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
