import { useState } from "react";
import { useParams, Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { FEAStressMap } from "@/components/FEAStressMap";
import { Menu, FileText, Box, Database, Terminal, ChevronRight } from "lucide-react";

const FILES = [
  { name: "README.md", icon: FileText, type: "md" },
  { name: "gear-assembly.step", icon: Box, type: "step" },
  { name: "material-spec.json", icon: Database, type: "json" },
  { name: "mesh-report.simlog", icon: Terminal, type: "simlog" },
  { name: "stress-results.fea.json", icon: FileText, type: "fea" },
];

const COMMITS = [
  { hash: "a3f9c1", msg: "Add refined mesh v2", author: "Raj Kumar", ago: "2 days ago" },
  { hash: "7b2e45", msg: "Update boundary conditions", author: "Raj Kumar", ago: "5 days ago" },
  { hash: "3d8f92", msg: "Initial geometry import", author: "Raj Kumar", ago: "1 week ago" },
  { hash: "c1a8e7", msg: "Project created", author: "Raj Kumar", ago: "2 weeks ago" },
];

function FileViewer({ type }: { type: string }) {
  if (type === "md") return (
    <div className="p-6 text-sm text-gray-300 max-w-2xl">
      <h1 className="text-xl font-bold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Spur Gear Assembly — FEA Analysis</h1>
      <p className="mb-4 text-gray-400">Multi-stage spur gear assembly subjected to torsional loading. Material: AISI 1045 Steel. Load: 2400 N·m.</p>
      <h2 className="text-base font-semibold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>Methodology</h2>
      <p className="mb-3 text-gray-400">Static structural FEA using tetrahedral meshing with 42,800 elements. PARDISO direct solver with 3 convergence iterations.</p>
      <h2 className="text-base font-semibold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>Results</h2>
      <ul className="list-disc list-inside text-gray-400 space-y-1 font-mono text-xs">
        <li>Peak von Mises stress: 187.4 MPa (root fillet)</li>
        <li>Safety Factor: 2.84 ✅ SAFE</li>
        <li>TFES Score: 89/100</li>
        <li>Jacobian quality: 0.92 (excellent)</li>
      </ul>
    </div>
  );
  if (type === "step") return (
    <div className="flex items-center justify-center p-8">
      <svg viewBox="0 0 320 280" width={320} height={280} style={{ background: "#020d1c", borderRadius: 8, border: "1px solid #1F2937" }}>
        <defs>
          <pattern id="dwgGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a3a5c" strokeWidth="0.5" />
          </pattern>
        </defs>
        <rect width="320" height="280" fill="url(#dwgGrid)" />
        {/* Isometric gear wireframe */}
        <g stroke="#60A5FA" strokeWidth="1" fill="none" opacity="0.8">
          {/* Hub */}
          <ellipse cx="160" cy="140" rx="35" ry="20" />
          <ellipse cx="160" cy="155" rx="35" ry="20" />
          <line x1="125" y1="140" x2="125" y2="155" /><line x1="195" y1="140" x2="195" y2="155" />
          {/* Teeth */}
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * 45 * Math.PI) / 180;
            const x = 160 + 65 * Math.cos(a); const y = 140 + 37 * Math.sin(a);
            return <g key={i}>
              <ellipse cx={x} cy={y} rx="10" ry="6" />
              <ellipse cx={x} cy={y + 8} rx="10" ry="6" />
            </g>;
          })}
          <ellipse cx="160" cy="140" rx="70" ry="40" strokeDasharray="4,2" opacity="0.4" />
        </g>
        <text x="160" y="220" fill="#60A5FA" fontSize="10" textAnchor="middle" fontFamily="JetBrains Mono">gear-assembly.step — WIREFRAME VIEW</text>
      </svg>
    </div>
  );
  if (type === "json") return (
    <div className="p-6">
      <table className="text-xs w-full font-mono">
        <thead><tr className="border-b border-[#1F2937] text-gray-400"><th className="text-left py-2 pr-8">Property</th><th className="text-left py-2">Value</th></tr></thead>
        <tbody className="text-gray-300">
          {[["Material", "AISI 1045 Steel"], ["Young's Modulus", "205 GPa"], ["Yield Strength", "530 MPa"], ["Density", "7850 kg/m³"], ["Poisson's Ratio", "0.29"], ["Thermal Expansion", "11.2 μm/m·K"]].map(([k, v]) => (
            <tr key={k} className="border-b border-[#1F2937]/40"><td className="py-2 pr-8 text-gray-400">{k}</td><td className="py-2 text-[#F97316]">{v}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  if (type === "simlog") return (
    <div className="p-4 font-mono text-xs text-green-400 h-64 overflow-y-auto" style={{ background: "#010806" }}>
      {["[08:42:15.032] Stage 1: Initialize — OK", "[08:42:16.231] Stage 3: Mesh — 42,800 elements", "[08:42:16.891] Jacobian: 0.92", "[08:42:17.963] Stage 5: FEA Solve", "[08:42:18.845] Convergence: residual 2.1e-6 ✓", "[08:42:19.943] SF = 530/187.4 = 2.84 ✅ SAFE", "[08:42:20.381] Score: 89/100", "[08:42:21.264] Complete"].map((l, i) => <div key={i}>{l}</div>)}
    </div>
  );
  return <div className="p-6"><FEAStressMap width={480} height={320} /></div>;
}

const TABS = ["Files", "Simulations", "Commits", "Score Report"] as const;

export default function DesignVaultDetail() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "spur-gear-assembly";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Files");
  const [activeFile, setActiveFile] = useState(FILES[0]);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-6xl">
          <button className="md:hidden text-gray-400 mb-4" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
          {/* Breadcrumb */}
          <div className="flex items-center gap-1 text-sm font-mono mb-4 text-gray-400">
            <Link href="/designvault" className="hover:text-[#F97316]">raj.kumar</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-white">{id}</span>
          </div>
          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#1F2937] mb-6">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`} data-testid={`tab-detail-${t.toLowerCase()}`}>{t}</button>
            ))}
            <div className="ml-auto self-center">
              <select className="bg-[#111827] border border-[#1F2937] rounded px-2 py-1 text-xs text-gray-400 focus:outline-none">
                <option>main ▾</option><option>dev ▾</option>
              </select>
            </div>
          </div>

          {activeTab === "Files" && (
            <div className="grid grid-cols-[240px_1fr] gap-0 bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
              <div className="border-r border-[#1F2937]">
                {FILES.map(f => {
                  const Icon = f.icon;
                  return (
                    <button key={f.name} onClick={() => setActiveFile(f)} className={`flex items-center gap-2 w-full px-4 py-2.5 text-xs text-left transition-colors ${activeFile.name === f.name ? "bg-[#F97316]/10 text-[#F97316] border-l-2 border-[#F97316]" : "text-gray-400 hover:bg-[#1F2937] hover:text-white"}`} data-testid={`file-${f.name}`}>
                      <Icon className="w-3 h-3 flex-shrink-0" /><span className="font-mono truncate">{f.name}</span>
                    </button>
                  );
                })}
              </div>
              <div><FileViewer type={activeFile.type} /></div>
            </div>
          )}

          {activeTab === "Commits" && (
            <div className="space-y-2">
              {COMMITS.map(c => (
                <div key={c.hash} className="flex items-center justify-between bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3">
                  <div>
                    <span className="text-sm text-white">{c.msg}</span>
                    <span className="text-xs text-gray-500 ml-2">{c.author} · {c.ago}</span>
                  </div>
                  <span className="font-mono text-xs text-[#60A5FA] bg-[#60A5FA]/10 px-2 py-0.5 rounded">[{c.hash}]</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === "Simulations" && (
            <div className="text-center py-10 text-gray-500 font-mono text-sm">
              <Link href={`/simforge/spur-gear-assembly`} className="text-[#F97316] hover:underline">View simulation in SimForge →</Link>
            </div>
          )}

          {activeTab === "Score Report" && (
            <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-6">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 font-mono text-sm">
                {[["Mesh Quality", "94%"], ["Boundary Setup", "88%"], ["Convergence", "97%"], ["Material Selection", "82%"], ["Documentation", "79%"], ["Overall TFES", "89/100"]].map(([k, v]) => (
                  <div key={k} className="bg-[#1F2937] rounded p-3">
                    <div className="text-gray-400 text-xs mb-1">{k}</div>
                    <div className="text-[#F97316] font-bold">{v}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
