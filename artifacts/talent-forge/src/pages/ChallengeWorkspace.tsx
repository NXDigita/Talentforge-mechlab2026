import { useState } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { challenges, materials } from "@/data/mockData";
import { Menu, Clock, Zap, Trophy, Play, CheckCircle, Loader } from "lucide-react";
import toast from "react-hot-toast";

const showToast = () => toast("⚙️ Simulation feature live soon!", { icon: "⚙️", style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });

const CENTER_TABS = ["Model Setup", "Material", "Boundary Conditions", "Notes"] as const;

const RUN_STAGES = ["Meshing", "Applying BC", "Solving", "Post-processing", "Score"];

function BeamSVG() {
  return (
    <svg viewBox="0 0 400 200" width="100%" style={{ background: "#020d1c", borderRadius: 8, border: "1px solid #1F2937" }}>
      <defs>
        <pattern id="bpGrid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a3a5c" strokeWidth="0.4" /></pattern>
        <pattern id="hatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="8" stroke="#F97316" strokeWidth="2" /></pattern>
      </defs>
      <rect width="400" height="200" fill="url(#bpGrid)" />
      {/* Fixed wall hatch */}
      <rect x="20" y="60" width="30" height="80" fill="url(#hatch)" opacity="0.7" />
      <line x1="50" y1="60" x2="50" y2="140" stroke="#F97316" strokeWidth="2" />
      {/* Beam */}
      <rect x="50" y="85" width="280" height="30" fill="#1E3A5F" stroke="#60A5FA" strokeWidth="1.5" />
      {/* Load arrow */}
      <line x1="330" y1="40" x2="330" y2="82" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto">
          <polygon points="0,0 8,4 0,8" fill="#EF4444" />
        </marker>
      </defs>
      <text x="345" y="65" fill="#EF4444" fontSize="10" fontFamily="JetBrains Mono">500 N ↓</text>
      {/* Dimension lines */}
      <line x1="50" y1="155" x2="330" y2="155" stroke="white" strokeWidth="0.7" strokeDasharray="3,2" opacity="0.5" />
      <text x="190" y="168" fill="#9CA3AF" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">L = 800 mm</text>
      <line x1="360" y1="85" x2="360" y2="115" stroke="white" strokeWidth="0.7" strokeDasharray="3,2" opacity="0.5" />
      <text x="375" y="103" fill="#9CA3AF" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono">H=30</text>
      <text x="32" y="130" fill="#F97316" fontSize="9" textAnchor="middle" fontFamily="JetBrains Mono" transform="rotate(-90, 32, 100)">FIXED</text>
    </svg>
  );
}

function BeamStressMap() {
  return (
    <svg viewBox="0 0 320 120" width="100%" style={{ background: "#020d1c", borderRadius: 8, border: "1px solid #1F2937" }}>
      <defs>
        <linearGradient id="beamStress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="30%" stopColor="#FF8800" />
          <stop offset="60%" stopColor="#FFFF00" />
          <stop offset="85%" stopColor="#00CC44" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
      </defs>
      <rect x="20" y="30" width="280" height="60" fill="url(#beamStress)" rx="2" />
      {/* Deformed shape dashed */}
      <path d="M 20 60 Q 160 58 300 90" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="5,3" fill="none" opacity="0.7" />
      <text x="20" y="18" fill="#60A5FA" fontSize="8" fontFamily="JetBrains Mono">VON MISES — CANTILEVER BEAM</text>
      <text x="22" y="108" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">FIXED END (MAX)</text>
      <text x="240" y="108" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">TIP (MIN)</text>
    </svg>
  );
}

export default function ChallengeWorkspace() {
  const params = useParams<{ id: string }>();
  const id = params.id ?? "FEA-STR-007";
  const ch = challenges.find(c => c.id === id) ?? challenges[0];

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [centerTab, setCenterTab] = useState<typeof CENTER_TABS[number]>("Model Setup");
  const [selectedMaterial, setSelectedMaterial] = useState(materials[0]);
  const [running, setRunning] = useState(false);
  const [runStage, setRunStage] = useState(-1);
  const [done, setDone] = useState(false);
  const [meshSize, setMeshSize] = useState("2");
  const [L, setL] = useState("800");
  const [W, setW] = useState("50");
  const [H, setH] = useState("30");

  const handleRun = () => {
    if (running || done) return;
    setRunning(true);
    setRunStage(0);
    let s = 0;
    const iv = setInterval(() => {
      s++;
      if (s < RUN_STAGES.length) {
        setRunStage(s);
      } else {
        clearInterval(iv);
        setRunning(false);
        setDone(true);
      }
    }, 2000);
  };

  const mat = selectedMaterial;

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="h-[calc(100vh-56px)] flex flex-col">
          <div className="flex items-center gap-3 px-6 py-3 border-b border-[#1F2937]">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <span className="font-mono text-sm text-[#60A5FA]">{ch.id}</span>
            <span className="text-gray-600">·</span>
            <span className="text-sm text-white font-medium">{ch.name}</span>
          </div>
          <div className="flex flex-1 overflow-hidden">
            {/* LEFT BRIEF */}
            <div className="hidden lg:flex flex-col w-[280px] flex-shrink-0 border-r border-[#1F2937] overflow-y-auto bg-[#111827] p-4 space-y-4 text-xs">
              <div>
                <div className="font-mono text-[#60A5FA] text-xs mb-1">{ch.id}</div>
                <div className="font-semibold text-white mb-1" style={{ fontFamily: "Space Grotesk" }}>{ch.name}</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-1.5 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded font-mono text-[10px]">{ch.difficulty}</span>
                  <span className="px-1.5 py-0.5 bg-[#1F2937] text-gray-400 rounded font-mono text-[10px]">{ch.domain}</span>
                </div>
              </div>
              <div>
                <div className="text-gray-400 font-medium mb-2">Objective</div>
                <div className="text-gray-300">Analyze a cantilever beam under point load. Determine max stress and deflection within allowable limits.</div>
              </div>
              <div>
                <div className="text-gray-400 font-medium mb-2">Given Specs</div>
                <table className="w-full font-mono text-[10px]">
                  <tbody>
                  {[["L", "800 mm"], ["W", "50 mm"], ["H", "30 mm"], ["Load", "500 N"], ["E", "205 GPa"]].map(([k, v]) => (
                    <tr key={k}><td className="text-gray-500 py-0.5 pr-2">{k}</td><td className="text-[#F97316]">{v}</td></tr>
                  ))}
                  </tbody>
                </table>
              </div>
              <div className="border border-[#F97316]/30 bg-[#F97316]/5 rounded p-3">
                <div className="text-gray-400 font-medium mb-2">Reference Formulas</div>
                <div className="font-mono text-[#F97316] text-[10px] space-y-1">
                  <div>σ_max = FL³/3EI</div>
                  <div>δ = FL³/3EI</div>
                  <div>SF = Sy / σ_max</div>
                </div>
              </div>
              <div className="border border-[#F97316]/50 bg-[#F97316]/5 rounded p-3">
                <div className="font-semibold text-[#F97316] mb-2">Reward</div>
                <div className="flex items-center gap-2 mb-1"><Zap className="w-3 h-3 text-[#F97316]" /><span className="font-mono text-white">{ch.xp} XP</span></div>
                <div className="flex items-center gap-2 mb-1"><Trophy className="w-3 h-3 text-amber-400" /><span className="font-mono text-white">{ch.prize}</span></div>
                <div className="text-gray-400 text-[10px] mt-1">Badge: {ch.badge}</div>
              </div>
              <div className="flex items-center gap-2 text-amber-400 font-mono text-base font-bold">
                <Clock className="w-4 h-4" /> {ch.deadline}
              </div>
            </div>

            {/* CENTER */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex gap-1 border-b border-[#1F2937] px-4 flex-shrink-0">
                {CENTER_TABS.map(t => (
                  <button key={t} onClick={() => setCenterTab(t)} className={`px-3 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${centerTab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`} data-testid={`tab-center-${t.toLowerCase().replace(" ", "-")}`}>{t}</button>
                ))}
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                {centerTab === "Model Setup" && (
                  <div>
                    <BeamSVG />
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      {[["L (mm)", L, setL], ["W (mm)", W, setW], ["H (mm)", H, setH]].map(([label, val, setter]) => (
                        <div key={label as string}>
                          <label className="block text-xs text-gray-400 mb-1 font-mono">{label as string}</label>
                          <input value={val as string} onChange={e => (setter as (v: string) => void)(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded px-2 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-[#F97316]" data-testid={`input-${(label as string).split(" ")[0].toLowerCase()}`} />
                        </div>
                      ))}
                      <div>
                        <label className="block text-xs text-gray-400 mb-1 font-mono">Mesh Size (mm)</label>
                        <input value={meshSize} onChange={e => setMeshSize(e.target.value)} className="w-full bg-[#1F2937] border border-[#374151] rounded px-2 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-[#F97316]" data-testid="input-mesh-size" />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-1 font-mono">Element Type</label>
                        <select className="w-full bg-[#1F2937] border border-[#374151] rounded px-2 py-1.5 text-sm font-mono text-white focus:outline-none focus:border-[#F97316]" data-testid="select-element-type">
                          <option>Tetrahedral</option><option>Hexahedral</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}
                {centerTab === "Material" && (
                  <div>
                    <select value={mat.name} onChange={e => setSelectedMaterial(materials.find(m => m.name === e.target.value) ?? materials[0])} className="w-full bg-[#1F2937] border border-[#374151] rounded px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-[#F97316] mb-4" data-testid="select-material">
                      {materials.map(m => <option key={m.name}>{m.name}</option>)}
                    </select>
                    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                      <div className="font-semibold text-white mb-3 text-sm" style={{ fontFamily: "Space Grotesk" }}>{mat.name}</div>
                      <table className="w-full font-mono text-xs">
                        {[["Young's Modulus", mat.E], ["Yield Strength", mat.Sy], ["Density", mat.density], ["Poisson's Ratio", mat.nu], ["Type", mat.type]].map(([k, v]) => (
                          <tr key={k} className="border-b border-[#1F2937]/40">
                            <td className="py-2 text-gray-400 pr-4">{k}</td>
                            <td className="py-2 text-[#F97316]">{v}</td>
                          </tr>
                        ))}
                      </table>
                    </div>
                  </div>
                )}
                {centerTab === "Boundary Conditions" && (
                  <div className="space-y-4">
                    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                      <div className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Fixed Constraint</div>
                      <div className="font-mono text-xs text-gray-300">Face ID: left_face (6 DOF locked)</div>
                      <div className="mt-2 text-xs text-green-400 font-mono">✓ Configured</div>
                    </div>
                    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                      <div className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Applied Load</div>
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div><label className="text-gray-400 font-mono block mb-1">Direction</label><div className="font-mono text-[#F97316]">Y −</div></div>
                        <div><label className="text-gray-400 font-mono block mb-1">Magnitude</label><div className="font-mono text-[#F97316]">500 N</div></div>
                        <div><label className="text-gray-400 font-mono block mb-1">Location</label><div className="font-mono text-[#F97316]">Free tip</div></div>
                      </div>
                    </div>
                  </div>
                )}
                {centerTab === "Notes" && (
                  <textarea className="w-full h-48 bg-[#111827] border border-[#1F2937] rounded p-3 font-mono text-sm text-gray-300 focus:outline-none focus:border-[#F97316] resize-none" placeholder="Add your analysis notes here..." data-testid="textarea-notes" />
                )}
              </div>
            </div>

            {/* RIGHT OUTPUT */}
            <div className="hidden lg:flex flex-col w-[320px] flex-shrink-0 border-l border-[#1F2937] bg-[#111827] p-4 space-y-4 overflow-y-auto">
              <div className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Analysis Output</div>
              <BeamSVG />
              <button onClick={handleRun} disabled={running || done} className={`w-full py-3 text-sm font-bold rounded flex items-center justify-center gap-2 transition-colors ${running ? "bg-amber-500/20 text-amber-400 cursor-wait" : done ? "bg-green-500/20 text-green-400 cursor-default" : "bg-[#F97316] text-white hover:bg-[#ea6c0f]"}`} data-testid="button-run-analysis">
                {running ? <><Loader className="w-4 h-4 animate-spin" /> Running...</> : done ? <><CheckCircle className="w-4 h-4" /> Complete</> : <><Play className="w-4 h-4" /> Run Analysis</>}
              </button>

              {(running || done) && (
                <div className="space-y-1">
                  {RUN_STAGES.map((s, i) => {
                    const isD = done || i < runStage;
                    const isR = !done && i === runStage;
                    return (
                      <div key={s} className={`flex items-center gap-2 text-xs font-mono py-1 ${isD ? "text-green-400" : isR ? "text-amber-400" : "text-gray-600"}`}>
                        {isD ? <CheckCircle className="w-3 h-3" /> : isR ? <Loader className="w-3 h-3 animate-spin" /> : <div className="w-3 h-3 rounded-full border border-gray-600" />}
                        {s}
                      </div>
                    );
                  })}
                </div>
              )}

              <AnimatePresence>
                {done && (
                  <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
                    <BeamStressMap />
                    <motion.div initial={{ scale: 0 }} animate={{ scale: [0, 1.15, 1] }} transition={{ delay: 0.2, duration: 0.5 }} className="flex items-center justify-center">
                      <div className="w-20 h-20 rounded-full bg-[#F97316] flex items-center justify-center">
                        <div className="text-center text-white">
                          <div className="font-bold text-lg" style={{ fontFamily: "Space Grotesk" }}>71</div>
                          <div className="text-xs font-mono">/100</div>
                        </div>
                      </div>
                    </motion.div>
                    <div className="bg-[#020d1c] border border-[#1F2937] rounded p-3 space-y-1 font-mono text-xs">
                      <div className="text-green-400">✓ PASS: SF = 3.42 (above 2.0)</div>
                      <div className="text-green-400">✓ PASS: Deflection 4.21mm in bounds</div>
                      <div className="text-amber-400">⚠ WARN: Mesh density low near support</div>
                      <div className="text-[#60A5FA]">TIP: H=40mm improves SF margin</div>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => { setDone(false); setRunStage(-1); }} className="flex-1 py-2 text-xs border border-[#374151] text-gray-400 hover:text-white rounded transition-colors" data-testid="button-adjust">Adjust Setup</button>
                      <button onClick={showToast} className="flex-1 py-2 text-xs bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors" data-testid="button-submit-final">Submit Final →</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
