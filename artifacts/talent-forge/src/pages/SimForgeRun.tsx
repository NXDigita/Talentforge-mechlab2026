import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusPill } from "@/components/StatusPill";
import { FEAStressMap } from "@/components/FEAStressMap";
import { simulations, terminalLines } from "@/data/mockData";
import { Menu, RotateCcw, CheckCircle, Loader } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import toast from "react-hot-toast";

const showToast = () => toast("⚙️ Simulation feature live soon!", { icon: "⚙️", style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });

const STAGES = ["Init", "Import", "Mesh", "Boundary", "Solve", "Results", "Certify"];
const STAGE_THRESHOLDS = [2, 4, 8, 12, 18, 22, 27];

const lineColor = (type: string) => {
  if (type === "stage") return "#60A5FA";
  if (type === "success") return "#22C55E";
  if (type === "progress") return "#F97316";
  return "#D1D5DB";
};

const SCORE_DATA = [
  { name: "Mesh Quality", score: 94 },
  { name: "Boundary Setup", score: 88 },
  { name: "Convergence", score: 97 },
  { name: "Material Select.", score: 82 },
  { name: "Documentation", score: 79 },
];

const AI_FEEDBACK = [
  { pass: true, text: "Mesh quality excellent — Jacobian 0.92 exceeds threshold (0.8)" },
  { pass: true, text: "Residual convergence to 2.1e-6 — solver accuracy verified" },
  { pass: true, text: "Safety factor 2.84 — 42% margin above recommended minimum (2.0)" },
  { pass: false, text: "Material over-specified — consider Al 6061-T6 for 65% weight reduction at this SF" },
  { pass: false, text: "Documentation score 79% — add simulation methodology notes to README" },
];

const TABS = ["Analysis Log", "Stress Map", "Score Report", "Raw Data"] as const;

export default function SimForgeRun() {
  const params = useParams<{ runId: string }>();
  const runId = params.runId ?? "spur-gear-assembly";
  const sim = simulations.find(s => s.id === runId) ?? simulations[0];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Analysis Log");
  const [logLines, setLogLines] = useState<typeof terminalLines>([]);
  const [showDisp, setShowDisp] = useState(false);
  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    let idx = 0;
    intervalRef.current = setInterval(() => {
      if (idx < terminalLines.length) {
        setLogLines(prev => [...prev, terminalLines[idx]]);
        idx++;
      } else {
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 160);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  const currentStage = STAGE_THRESHOLDS.findIndex(t => logLines.length < t);
  const completedStage = currentStage === -1 ? 7 : currentStage;
  const isComplete = logLines.length >= terminalLines.length;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-5xl">
          <button className="md:hidden text-gray-400 mb-4" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>

          {/* Header */}
          <div className="flex flex-wrap items-start gap-4 mb-6 bg-[#111827] border border-[#1F2937] rounded-lg p-5">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <StatusPill status={sim.status} size="md" />
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>{sim.name}</h1>
                <div className="w-9 h-9 rounded-full bg-[#F97316] flex items-center justify-center font-mono text-sm font-bold text-white">{sim.score}</div>
              </div>
              <div className="flex flex-wrap gap-4 text-xs font-mono text-gray-400">
                <span>SF: <span className={sim.sf && sim.sf >= 2.5 ? "text-green-300" : sim.sf && sim.sf >= 1.5 ? "text-green-400" : "text-amber-400"}>{sim.sf ?? "N/A"}x</span></span>
                <span>Material: <span className="text-gray-200">{sim.material}</span></span>
                <span>Load: <span className="text-gray-200">{sim.load}</span></span>
                <span>Type: <span className="text-[#60A5FA]">{sim.type}</span></span>
              </div>
            </div>
            <button onClick={showToast} className="px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded hover:bg-[#ea6c0f] transition-colors flex items-center gap-2" data-testid="button-redeploy">
              <RotateCcw className="w-3.5 h-3.5" /> Re-Deploy
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#1F2937] mb-6">
            {TABS.map(t => (
              <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${activeTab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`} data-testid={`tab-run-${t.toLowerCase().replace(" ", "-")}`}>{t}</button>
            ))}
          </div>

          {/* ANALYSIS LOG */}
          {activeTab === "Analysis Log" && (
            <div>
              {/* Pipeline bar */}
              <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-2">
                {STAGES.map((s, i) => {
                  const isDone = i < completedStage;
                  const isRunning = i === completedStage && !isComplete;
                  return (
                    <div key={s} className="flex items-center">
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono whitespace-nowrap transition-all ${isDone ? "bg-green-500/20 text-green-400 border border-green-500/30" : isRunning ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" : "bg-[#1F2937] text-gray-600 border border-[#374151]"}`}>
                        {isDone ? <CheckCircle className="w-3 h-3" /> : isRunning ? <Loader className="w-3 h-3 animate-spin" /> : null}
                        {s}
                      </div>
                      {i < STAGES.length - 1 && <div className={`w-6 h-px mx-0.5 ${i < completedStage ? "bg-green-500/50" : "bg-[#374151]"}`} />}
                    </div>
                  );
                })}
              </div>

              {/* Terminal */}
              <div className="bg-[#020408] border border-[#1F2937] rounded-lg overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 border-b border-[#1F2937]">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/60" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <div className="w-3 h-3 rounded-full bg-green-500/60" />
                  </div>
                  <span className="font-mono text-xs text-gray-500">{sim.id} — FEA Pipeline</span>
                  <span className={`font-mono text-xs px-2 py-0.5 rounded ${!isComplete ? "text-amber-400 bg-amber-400/10 animate-pulse" : "text-green-400 bg-green-400/10"}`}>
                    {!isComplete ? "■ LIVE" : "● COMPLETE"}
                  </span>
                </div>
                <div ref={logRef} className="h-64 overflow-y-auto p-4 space-y-0.5">
                  {logLines.map((line, i) => (
                    <div key={i} className="font-mono text-xs leading-5" style={{ color: lineColor(line.type) }}>{line.text}</div>
                  ))}
                  {!isComplete && <div className="font-mono text-xs text-gray-600 animate-pulse">▋</div>}
                </div>
              </div>
            </div>
          )}

          {/* STRESS MAP */}
          {activeTab === "Stress Map" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Von Mises Stress Map</h2>
                <button onClick={() => setShowDisp(!showDisp)} className={`px-3 py-1.5 text-xs rounded border font-mono transition-colors ${showDisp ? "bg-[#60A5FA]/20 text-[#60A5FA] border-[#60A5FA]" : "border-[#374151] text-gray-400 hover:text-white"}`} data-testid="toggle-displacement">
                  {showDisp ? "✓ " : ""}Show Displacement ×200
                </button>
              </div>
              <FEAStressMap showDisplacement={showDisp} width={580} height={400} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {[["Stress", [["Peak", "187.4 MPa", "text-red-400"], ["Min", "8.3 MPa", "text-blue-400"], ["Avg", "94.2 MPa", "text-gray-300"]]],
                  ["Safety Factor", [["SF", "2.84", "text-green-400"], ["Sy", "530 MPa", "text-gray-300"], ["σ_max", "187.4 MPa", "text-red-400"]]],
                  ["Displacement", [["Max", "0.0124 mm", "text-[#F97316]"], ["X", "0.0031 mm", "text-gray-300"], ["Y", "0.0089 mm", "text-gray-300"]]],
                  ["Mesh", [["Elements", "42,800", "text-gray-300"], ["Nodes", "8,640", "text-gray-300"], ["Jacobian", "0.92", "text-green-400"]]],
                ].map(([label, items]) => (
                  <div key={label as string} className="bg-[#111827] border border-[#1F2937] rounded-lg p-3">
                    <div className="text-xs text-gray-400 mb-2 font-semibold">{label as string}</div>
                    {(items as [string, string, string][]).map(([k, v, cls]) => (
                      <div key={k} className="flex justify-between text-xs font-mono mb-1">
                        <span className="text-gray-500">{k}</span>
                        <span className={cls}>{v}</span>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SCORE REPORT */}
          {activeTab === "Score Report" && (
            <div className="space-y-6">
              <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
                <h2 className="font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Scoring Breakdown</h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart layout="vertical" data={SCORE_DATA} margin={{ left: 20, right: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                    <YAxis type="category" dataKey="name" width={110} tick={{ fill: "#9CA3AF", fontSize: 11, fontFamily: "JetBrains Mono" }} />
                    <Tooltip contentStyle={{ background: "#1F2937", border: "1px solid #374151", borderRadius: 6, fontFamily: "JetBrains Mono", fontSize: 12 }} />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {SCORE_DATA.map((entry, i) => <Cell key={i} fill="#F97316" />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2">
                {AI_FEEDBACK.map((f, i) => (
                  <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${f.pass ? "bg-green-500/5 border-green-500/20" : "bg-amber-500/5 border-amber-500/20"}`}>
                    <span className="text-lg mt-0.5">{f.pass ? "✅" : "⚠️"}</span>
                    <span className="text-sm text-gray-300">{f.text}</span>
                  </div>
                ))}
              </div>
              <button onClick={showToast} className="px-6 py-2.5 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors text-sm" data-testid="button-improve-redeploy">
                Improve Design and Re-Deploy →
              </button>
            </div>
          )}

          {/* RAW DATA */}
          {activeTab === "Raw Data" && (
            <div className="bg-[#020408] border border-[#1F2937] rounded-lg p-4 overflow-x-auto">
              <pre className="font-mono text-xs text-green-400 leading-5">
{JSON.stringify({ id: sim.id, type: sim.type, status: sim.status, score: sim.score, safetyFactor: sim.sf, material: sim.material, load: sim.load, peakStress_MPa: sim.peakStress, mesh: { elements: 42800, nodes: 8640, jacobian: 0.92 }, solver: { iterations: 3, residual: "2.1e-6", converged: true }, duration: sim.duration }, null, 2)}
              </pre>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
