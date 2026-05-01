import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusPill } from "@/components/StatusPill";
import { SFBadge } from "@/components/SFBadge";
import { simulations } from "@/data/mockData";
import { Menu } from "lucide-react";

const extra = [
  { id: "shaft-torsion-v3", name: "Shaft Torsion v3", type: "FEA", status: "SAFE", score: 83, sf: 2.12, duration: "3m 21s", date: "May 1, 2025" },
  { id: "impeller-cfd", name: "Impeller CFD", type: "CFD", status: "WARN", score: 68, sf: null, duration: "12m 04s", date: "Apr 30, 2025" },
  { id: "frame-static", name: "Frame Static Analysis", type: "FEA", status: "CRITICAL", score: 28, sf: 0.72, duration: "5m 55s", date: "Apr 29, 2025" },
  { id: "belt-drive", name: "Belt Drive System", type: "Kinematics", status: "SAFE", score: 91, sf: 2.97, duration: "2m 02s", date: "Apr 28, 2025" },
  { id: "heat-exchanger", name: "Heat Exchanger", type: "Thermal", status: "SAFE", score: 79, sf: 3.48, duration: "9m 18s", date: "Apr 27, 2025" },
];
const allSims = [
  ...simulations.map(s => ({ ...s, date: "May 1, 2025" })),
  ...extra
];

const FILTERS = ["All", "Safe", "Critical", "Warning", "Running"] as const;

export default function SimForge() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");

  const filtered = allSims.filter(s => {
    if (filter === "All") return true;
    if (filter === "Safe") return s.status === "SAFE";
    if (filter === "Critical") return s.status === "CRITICAL";
    if (filter === "Warning") return s.status === "WARN";
    if (filter === "Running") return s.status === "RUNNING";
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-6xl">
          <div className="flex items-center gap-3 mb-6">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>SimForge</h1>
              <p className="text-sm text-gray-500 font-mono">Simulation pipeline · raj.kumar</p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[["63", "Total Runs"], ["76%", "Pass Rate"], ["81/100", "Avg Score"]].map(([v, l]) => (
              <div key={l} className="bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3">
                <div className="font-mono text-2xl font-bold text-white">{v}</div>
                <div className="text-xs text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* Filter tabs */}
          <div className="flex gap-1 border-b border-[#1F2937] mb-4">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${filter === f ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`} data-testid={`tab-filter-${f.toLowerCase()}`}>{f}</button>
            ))}
          </div>

          {/* Table */}
          <div className="bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#1F2937]">
                  {["Status", "Project", "Type", "Score", "SF", "Duration", "Date", ""].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs text-gray-500 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id} className="border-b border-[#1F2937]/50 hover:bg-[#1F2937]/30 transition-colors">
                    <td className="px-4 py-3"><StatusPill status={s.status} /></td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#60A5FA]">{s.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white">{s.score}/100</td>
                    <td className="px-4 py-3"><SFBadge sf={s.sf ?? null} /></td>
                    <td className="px-4 py-3 font-mono text-xs text-gray-400">{s.duration}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{s.date}</td>
                    <td className="px-4 py-3">
                      <Link href={`/simforge/${s.id}`} className="text-xs text-[#F97316] hover:underline" data-testid={`link-simforge-${s.id}`}>View →</Link>
                    </td>
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
