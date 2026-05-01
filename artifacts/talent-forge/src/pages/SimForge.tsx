import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { StatusPill } from "@/components/StatusPill";
import { SFBadge } from "@/components/SFBadge";
import { simulations, materials } from "@/data/mockData";
import { Menu, Plus, X, Play, CheckCircle, Loader, ChevronDown, ChevronRight, Zap, Trophy } from "lucide-react";

/* ─── Static data ─── */
const extra = [
  { id: "shaft-torsion-v3", name: "Shaft Torsion v3", type: "FEA", status: "SAFE", score: 83, sf: 2.12, duration: "3m 21s", date: "May 1, 2025" },
  { id: "impeller-cfd", name: "Impeller CFD", type: "CFD", status: "WARN", score: 68, sf: null, duration: "12m 04s", date: "Apr 30, 2025" },
  { id: "frame-static", name: "Frame Static Analysis", type: "FEA", status: "CRITICAL", score: 28, sf: 0.72, duration: "5m 55s", date: "Apr 29, 2025" },
  { id: "belt-drive", name: "Belt Drive System", type: "Kinematics", status: "SAFE", score: 91, sf: 2.97, duration: "2m 02s", date: "Apr 28, 2025" },
  { id: "heat-exchanger", name: "Heat Exchanger", type: "Thermal", status: "SAFE", score: 79, sf: 3.48, duration: "9m 18s", date: "Apr 27, 2025" },
];

const PROJECTS = [
  "spur-gear-assembly", "bracket-mount-v1", "pipe-bend-flow",
  "gear-train-4stage", "cooling-fin-array", "shaft-torsion-v3",
];

const SIM_TYPES = ["FEA Structural", "FEA Thermal", "CFD Internal", "CFD External", "Kinematics", "Modal"];

const LOAD_PRESETS: Record<string, string> = {
  "FEA Structural": "500 N vertical point load",
  "FEA Thermal": "85 °C ambient, 50 W heat source",
  "CFD Internal": "5 L/min @ 3.2 bar inlet",
  "CFD External": "12 m/s freestream, AoA 5°",
  "Kinematics": "1200 RPM input, 2.4 N·m",
  "Modal": "Free-free boundary, 0–2000 Hz",
};

const FILTERS = ["All", "Safe", "Critical", "Warning", "Running"] as const;

/* ─── Pipeline definition ─── */
interface LogLine { text: string; color: string; }
interface Stage {
  id: string;
  label: string;
  logs: LogLine[];
  duration: number; // ms per log line
}

function buildPipeline(project: string, simType: string, material: string, load: string): Stage[] {
  const mat = materials.find(m => m.name === material) ?? materials[0];
  const sfVal = (Math.random() * 2 + 1.5).toFixed(2);
  const score = Math.floor(Math.random() * 20 + 72);
  return [
    {
      id: "init", label: "Initialize", duration: 220,
      logs: [
        { text: `→ Loading project: ${project}.step`, color: "#D1D5DB" },
        { text: `→ Sim type: ${simType}`, color: "#D1D5DB" },
        { text: `→ Material: ${mat.name} (E=${mat.E}, Sy=${mat.Sy})`, color: "#D1D5DB" },
        { text: "✓ Solver environment ready", color: "#22C55E" },
      ],
    },
    {
      id: "geometry", label: "Geometry Import", duration: 260,
      logs: [
        { text: "→ Parsing STEP AP214 B-Rep entities...", color: "#D1D5DB" },
        { text: "→ Healing 3 degenerate edges...", color: "#D1D5DB" },
        { text: "✓ 847 faces, 1,284 edges, 312 vertices", color: "#22C55E" },
        { text: "✓ Volume: 218.4 cm³ · BBox: 240×180×95 mm", color: "#22C55E" },
      ],
    },
    {
      id: "mesh", label: "Mesh Generation", duration: 300,
      logs: [
        { text: "→ Generating tetrahedral mesh (target: 2 mm)", color: "#D1D5DB" },
        { text: "  ████░░░░░░░░░░░░░░░░  20% — seeding edges", color: "#F97316" },
        { text: "  ████████████░░░░░░░░  60% — volume fill", color: "#F97316" },
        { text: "  ████████████████████ 100% — 42,800 elements", color: "#F97316" },
        { text: "✓ Jacobian quality: 0.92 (excellent)", color: "#22C55E" },
        { text: `✓ Mesh density: ${(42800 / 218.4).toFixed(0)} elem/cm³`, color: "#22C55E" },
      ],
    },
    {
      id: "bc", label: "Boundary Conditions", duration: 240,
      logs: [
        { text: "→ Fixed constraint: face_id=147 (6 DOF)", color: "#D1D5DB" },
        { text: `→ Applied load: ${load}`, color: "#D1D5DB" },
        { text: "→ Contact pairs: 4 detected, penalty method", color: "#D1D5DB" },
        { text: "✓ Boundary conditions verified", color: "#22C55E" },
      ],
    },
    {
      id: "solve", label: "Solve", duration: 280,
      logs: [
        { text: `→ Solver: Direct (PARDISO) — ${(42800).toLocaleString()} DOF`, color: "#D1D5DB" },
        { text: "→ Assembling stiffness matrix...", color: "#D1D5DB" },
        { text: "→ Iter 1: residual 4.2e-3", color: "#60A5FA" },
        { text: "→ Iter 2: residual 8.7e-5", color: "#60A5FA" },
        { text: "→ Iter 3: residual 2.1e-6 ← CONVERGED", color: "#60A5FA" },
        { text: "✓ Solver finished in 4.3 s", color: "#22C55E" },
      ],
    },
    {
      id: "post", label: "Post-processing", duration: 250,
      logs: [
        { text: "→ Computing von Mises stress field...", color: "#D1D5DB" },
        { text: `→ Peak stress: 187.4 MPa @ root fillet`, color: "#D1D5DB" },
        { text: `→ SF = ${mat.Sy} / 187.4 = ${sfVal}`, color: "#D1D5DB" },
        { text: "→ Max displacement: 0.0124 mm", color: "#D1D5DB" },
        { text: `✓ SF = ${sfVal} — ${parseFloat(sfVal) >= 2.0 ? "✅ SAFE" : "⚠ MARGINAL"}`, color: parseFloat(sfVal) >= 2.0 ? "#22C55E" : "#F59E0B" },
      ],
    },
    {
      id: "certify", label: "Score & Certify", duration: 260,
      logs: [
        { text: `→ TFES Score: ${score}/100 (Structural Excellence)`, color: "#D1D5DB" },
        { text: "→ Minting NFT credential to Polygon PoS...", color: "#D1D5DB" },
        { text: "→ TX: 0xa3f9c1b2e4d78f92c3b5d6e... ✓", color: "#D1D5DB" },
        { text: `→ TFES updated: 86 → ${86 + Math.floor(Math.random() * 4) + 1} pts`, color: "#F97316" },
        { text: "✓ Simulation complete. Portfolio updated.", color: "#22C55E" },
      ],
    },
  ];
}

/* ─── Deploy Drawer ─── */
type DeployPhase = "config" | "running" | "done";

interface DeployedSim {
  id: string; name: string; type: string; status: string;
  score: number; sf: number; duration: string; date: string;
}

function DeployDrawer({ onClose, onDeployed }: { onClose: () => void; onDeployed: (s: DeployedSim) => void }) {
  const [project, setProject] = useState(PROJECTS[0]);
  const [simType, setSimType] = useState(SIM_TYPES[0]);
  const [material, setMaterial] = useState(materials[0].name);
  const [load, setLoad] = useState(LOAD_PRESETS[SIM_TYPES[0]]);
  const [meshSize, setMeshSize] = useState("2");
  const [phase, setPhase] = useState<DeployPhase>("config");
  const [pipeline, setPipeline] = useState<Stage[]>([]);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [visibleLogs, setVisibleLogs] = useState<Record<string, LogLine[]>>({});
  const [completedStages, setCompletedStages] = useState<Set<string>>(new Set());
  const [expandedStage, setExpandedStage] = useState<string | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef<number>(0);
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (simType) setLoad(LOAD_PRESETS[simType] ?? "");
  }, [simType]);

  useEffect(() => {
    if (phase !== "running") return;
    const iv = setInterval(() => setElapsed(Date.now() - startRef.current), 100);
    return () => clearInterval(iv);
  }, [phase]);

  useEffect(() => {
    if (logEndRef.current) logEndRef.current.scrollIntoView({ behavior: "smooth" });
  }, [visibleLogs]);

  const handleDeploy = () => {
    const p = buildPipeline(project, simType, material, load);
    setPipeline(p);
    setPhase("running");
    setActiveStageIdx(0);
    setVisibleLogs({});
    setCompletedStages(new Set());
    setExpandedStage(p[0].id);
    startRef.current = Date.now();

    let globalDelay = 400;
    p.forEach((stage, si) => {
      setTimeout(() => {
        setActiveStageIdx(si);
        setExpandedStage(stage.id);
      }, globalDelay);
      globalDelay += 200;

      stage.logs.forEach((log, li) => {
        globalDelay += stage.duration;
        const d = globalDelay;
        setTimeout(() => {
          setVisibleLogs(prev => ({
            ...prev,
            [stage.id]: [...(prev[stage.id] ?? []), log],
          }));
        }, d);
      });

      globalDelay += 300;
      const doneDelay = globalDelay;
      setTimeout(() => {
        setCompletedStages(prev => new Set([...prev, stage.id]));
      }, doneDelay);
      globalDelay += 200;
    });

    const totalDelay = globalDelay + 500;
    setTimeout(() => {
      setPhase("done");
      const sfVal = parseFloat((Math.random() * 2 + 1.5).toFixed(2));
      const score = Math.floor(Math.random() * 20 + 72);
      const durSec = Math.floor((Date.now() - startRef.current) / 1000);
      const durStr = `${Math.floor(durSec / 60)}m ${durSec % 60}s`;
      onDeployed({
        id: `${project}-${Date.now()}`,
        name: project.replace(/-/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        type: simType.split(" ")[0],
        status: sfVal >= 2.0 ? "SAFE" : sfVal >= 1.0 ? "WARN" : "CRITICAL",
        score,
        sf: sfVal,
        duration: durStr,
        date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      });
    }, totalDelay);
  };

  const elapsedStr = `${Math.floor(elapsed / 1000)}s`;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex"
      style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(3px)" }}
      onClick={e => { if (e.target === e.currentTarget && phase !== "running") onClose(); }}
    >
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 280 }}
        className="ml-auto h-full w-full max-w-2xl bg-[#0D1424] border-l border-[#1F2937] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937] flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-[#F97316]/10 flex items-center justify-center">
              <Zap className="w-4 h-4 text-[#F97316]" />
            </div>
            <div>
              <div className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>Deploy Simulation</div>
              <div className="text-xs text-gray-500 font-mono">SimForge Pipeline v2.0</div>
            </div>
          </div>
          {phase !== "running" && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" data-testid="btn-close-deploy"><X className="w-5 h-5" /></button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Config panel */}
          {phase === "config" && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">Project</label>
                  <select value={project} onChange={e => setProject(e.target.value)} className="w-full bg-[#111827] border border-[#1F2937] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F97316] font-mono" data-testid="select-deploy-project">
                    {PROJECTS.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">Simulation Type</label>
                  <select value={simType} onChange={e => setSimType(e.target.value)} className="w-full bg-[#111827] border border-[#1F2937] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F97316] font-mono" data-testid="select-deploy-simtype">
                    {SIM_TYPES.map(t => <option key={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">Material</label>
                  <select value={material} onChange={e => setMaterial(e.target.value)} className="w-full bg-[#111827] border border-[#1F2937] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F97316] font-mono" data-testid="select-deploy-material">
                    {materials.map(m => <option key={m.name}>{m.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-400 font-mono mb-1.5">Mesh Size (mm)</label>
                  <input value={meshSize} onChange={e => setMeshSize(e.target.value)} className="w-full bg-[#111827] border border-[#1F2937] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F97316] font-mono" data-testid="input-deploy-mesh" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 font-mono mb-1.5">Load / Boundary Conditions</label>
                <input value={load} onChange={e => setLoad(e.target.value)} className="w-full bg-[#111827] border border-[#1F2937] rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F97316] font-mono" data-testid="input-deploy-load" />
              </div>

              {/* Preview cards */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Elements (est.)", val: "42,800" },
                  { label: "Est. Solve Time", val: "~4–8 min" },
                  { label: "TFES Impact", val: "+3–7 pts" },
                ].map(c => (
                  <div key={c.label} className="bg-[#111827] border border-[#1F2937] rounded p-3 text-center">
                    <div className="font-mono text-sm font-bold text-white">{c.val}</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">{c.label}</div>
                  </div>
                ))}
              </div>

              <div className="bg-[#111827] border border-[#1F2937]/50 rounded-lg p-4">
                <div className="text-xs text-gray-500 font-mono mb-2">PIPELINE STAGES</div>
                <div className="flex items-center gap-0 text-xs font-mono">
                  {["Init", "Geometry", "Mesh", "BC", "Solve", "Post", "Certify"].map((s, i, arr) => (
                    <span key={s} className="flex items-center">
                      <span className="px-2 py-0.5 bg-[#1F2937] text-gray-400 rounded text-[10px]">{s}</span>
                      {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-700 mx-0.5" />}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* Running / Done: live pipeline */}
          {(phase === "running" || phase === "done") && (
            <div className="p-6">
              {/* Status bar */}
              <div className={`flex items-center justify-between mb-5 px-4 py-2.5 rounded-lg border text-sm font-mono ${phase === "done" ? "bg-green-500/10 border-green-500/30 text-green-400" : "bg-[#F97316]/10 border-[#F97316]/30 text-[#F97316]"}`}>
                <div className="flex items-center gap-2">
                  {phase === "done" ? <CheckCircle className="w-4 h-4" /> : <Loader className="w-4 h-4 animate-spin" />}
                  {phase === "done" ? "Deployment complete" : `Deploying ${project}...`}
                </div>
                <span>{phase === "done" ? "✓ LIVE" : elapsedStr}</span>
              </div>

              {/* Overall progress */}
              <div className="mb-5">
                <div className="h-1 bg-[#1F2937] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${phase === "done" ? "bg-green-400" : "bg-[#F97316]"}`}
                    animate={{ width: phase === "done" ? "100%" : `${(completedStages.size / (pipeline.length || 1)) * 100}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
                <div className="text-[10px] font-mono text-gray-600 mt-1 text-right">
                  {completedStages.size}/{pipeline.length} stages
                </div>
              </div>

              {/* Stage accordion */}
              <div className="space-y-2">
                {pipeline.map((stage, si) => {
                  const isDone = completedStages.has(stage.id);
                  const isActive = activeStageIdx === si && phase === "running" && !isDone;
                  const isExpanded = expandedStage === stage.id;
                  const logs = visibleLogs[stage.id] ?? [];

                  return (
                    <div
                      key={stage.id}
                      className={`border rounded-lg overflow-hidden transition-colors ${isDone ? "border-green-500/25 bg-green-500/5" : isActive ? "border-[#F97316]/40 bg-[#F97316]/5" : "border-[#1F2937]"}`}
                    >
                      <button
                        onClick={() => setExpandedStage(isExpanded ? null : stage.id)}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left"
                        data-testid={`stage-toggle-${stage.id}`}
                      >
                        <div className="flex-shrink-0">
                          {isDone ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                           isActive ? <Loader className="w-4 h-4 text-[#F97316] animate-spin" /> :
                           si < activeStageIdx ? <CheckCircle className="w-4 h-4 text-green-400" /> :
                           <div className="w-4 h-4 rounded-full border border-[#374151]" />}
                        </div>
                        <span className={`text-sm font-medium flex-1 ${isDone ? "text-green-400" : isActive ? "text-[#F97316]" : si < activeStageIdx ? "text-green-400" : "text-gray-500"}`}>
                          {stage.label}
                        </span>
                        {logs.length > 0 && (
                          <span className="text-gray-600 text-xs font-mono">{logs.length} lines</span>
                        )}
                        <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${isExpanded ? "rotate-180" : ""}`} />
                      </button>

                      <AnimatePresence>
                        {isExpanded && (logs.length > 0 || isActive) && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="px-4 pb-3 font-mono text-xs space-y-0.5 border-t border-[#1F2937]/50" style={{ background: "#020810" }}>
                              <div className="pt-2" />
                              {logs.map((log, li) => (
                                <motion.div
                                  key={li}
                                  initial={{ opacity: 0, x: -4 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  style={{ color: log.color }}
                                >
                                  {log.text}
                                </motion.div>
                              ))}
                              {isActive && logs.length < stage.logs.length && (
                                <div className="text-gray-700 animate-pulse">▋</div>
                              )}
                              <div ref={logEndRef} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>

              {/* Done summary */}
              <AnimatePresence>
                {phase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 bg-[#111827] border border-[#1F2937] rounded-xl p-5"
                  >
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>Simulation Deployed Successfully</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: "Score", val: `${Math.floor(Math.random() * 20 + 72)}/100`, color: "#F97316" },
                        { label: "Safety Factor", val: `${(Math.random() * 2 + 1.5).toFixed(2)}x`, color: "#22C55E" },
                        { label: "Solve Time", val: `${elapsed > 0 ? (elapsed / 1000).toFixed(1) : "—"}s`, color: "#60A5FA" },
                      ].map(c => (
                        <div key={c.label} className="bg-[#0A0F1E] rounded-lg p-3 text-center">
                          <div className="font-mono font-bold text-sm" style={{ color: c.color }}>{c.val}</div>
                          <div className="text-[10px] text-gray-500 mt-0.5">{c.label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button onClick={onClose} className="flex-1 py-2.5 bg-[#F97316] text-white text-sm font-semibold rounded hover:bg-[#ea6c0f] transition-colors" data-testid="btn-view-results">
                        View in SimForge
                      </button>
                      <button onClick={() => { setPhase("config"); setVisibleLogs({}); setCompletedStages(new Set()); }} className="px-4 py-2.5 border border-[#374151] text-gray-400 hover:text-white text-sm rounded transition-colors whitespace-nowrap" data-testid="btn-deploy-another">
                        Deploy Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Footer CTA */}
        {phase === "config" && (
          <div className="px-6 py-4 border-t border-[#1F2937] flex-shrink-0">
            <button
              onClick={handleDeploy}
              className="w-full py-3 bg-[#F97316] text-white font-bold rounded hover:bg-[#ea6c0f] transition-colors flex items-center justify-center gap-2 text-sm"
              data-testid="btn-deploy-now"
            >
              <Play className="w-4 h-4" /> Deploy Simulation
            </button>
            <p className="text-[10px] text-center text-gray-600 font-mono mt-2">Results certified · NFT badge minted · TFES updated</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

/* ─── Main SimForge page ─── */
export default function SimForge() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [filter, setFilter] = useState<typeof FILTERS[number]>("All");
  const [showDeploy, setShowDeploy] = useState(false);
  const [deployedSims, setDeployedSims] = useState<DeployedSim[]>([]);

  const allSims = [
    ...deployedSims.map(s => ({ ...s, isNew: true })),
    ...simulations.map(s => ({ ...s, date: "May 1, 2025", isNew: false })),
    ...extra.map(s => ({ ...s, isNew: false })),
  ];

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

      <AnimatePresence>
        {showDeploy && (
          <DeployDrawer
            onClose={() => setShowDeploy(false)}
            onDeployed={s => {
              setDeployedSims(prev => [s, ...prev]);
              setShowDeploy(false);
            }}
          />
        )}
      </AnimatePresence>

      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-6xl">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
              <div>
                <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>SimForge</h1>
                <p className="text-sm text-gray-500 font-mono">Simulation pipeline · raj.kumar</p>
              </div>
            </div>
            <button
              onClick={() => setShowDeploy(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white text-sm font-bold rounded hover:bg-[#ea6c0f] transition-colors"
              data-testid="btn-deploy-simulation"
            >
              <Plus className="w-4 h-4" /> Deploy Simulation
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              ["63", "Total Runs"],
              ["76%", "Pass Rate"],
              ["81/100", "Avg Score"],
            ].map(([v, l]) => (
              <div key={l} className="bg-[#111827] border border-[#1F2937] rounded-lg px-4 py-3">
                <div className="font-mono text-2xl font-bold text-white">{v}</div>
                <div className="text-xs text-gray-400 mt-0.5">{l}</div>
              </div>
            ))}
          </div>

          {/* New deployment notice */}
          <AnimatePresence>
            {deployedSims.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="mb-4 flex items-center gap-3 bg-green-500/10 border border-green-500/20 rounded-lg px-4 py-3 text-sm"
              >
                <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span className="text-green-400 font-mono">
                  {deployedSims.length} simulation{deployedSims.length > 1 ? "s" : ""} deployed — TFES updated
                </span>
              </motion.div>
            )}
          </AnimatePresence>

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
                  <tr key={s.id} className={`border-b border-[#1F2937]/50 transition-colors ${"isNew" in s && s.isNew ? "bg-green-500/5 border-l-2 border-l-green-500/40" : "hover:bg-[#1F2937]/30"}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <StatusPill status={s.status} />
                        {"isNew" in s && s.isNew && <span className="text-[9px] px-1 py-0.5 bg-green-500/15 text-green-400 border border-green-500/20 rounded font-mono">NEW</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-white text-sm font-medium">{s.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-[#60A5FA]">{s.type}</td>
                    <td className="px-4 py-3 font-mono text-xs text-white">{s.score}/100</td>
                    <td className="px-4 py-3"><SFBadge sf={"sf" in s ? s.sf ?? null : null} /></td>
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
