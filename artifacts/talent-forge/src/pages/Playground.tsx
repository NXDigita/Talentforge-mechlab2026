import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { materials } from "@/data/mockData";
import {
  Menu, Play, RotateCcw, Save, ChevronRight, CheckCircle,
  Cpu, Layers, Gauge, FlaskConical, Thermometer, Cog,
  AlertTriangle, TrendingUp, Download, Share2
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Config types ─── */
type SimType = "FEA" | "CFD" | "Thermal" | "Kinematics";
type GeomKey = "box" | "cylinder" | "lbracket" | "gear" | "pipe";
type MeshDensity = "coarse" | "medium" | "fine" | "ultra";
type SolverType = "direct" | "iterative";

interface Config {
  simType: SimType;
  projectName: string;
  geometry: GeomKey;
  materialIdx: number;
  loadMag: number;
  meshDensity: MeshDensity;
  solver: SolverType;
  tolerance: number;
}

/* ─── Geometry data ─── */
const GEOMETRIES: Record<GeomKey, { label: string; area: number; description: string }> = {
  box:       { label: "Solid Box (50×50mm)", area: 2500, description: "Rectangular solid section" },
  cylinder:  { label: "Cylinder (r=25mm)",   area: 1963, description: "Circular cross-section" },
  lbracket:  { label: "L-Bracket (20×20mm)", area: 400,  description: "L-shaped bracket" },
  gear:      { label: "Spur Gear (m=3)",     area: 800,  description: "20-tooth spur gear" },
  pipe:      { label: "Pipe (OD50/ID40mm)",  area: 706,  description: "Hollow circular section" },
};

const MESH_META: Record<MeshDensity, { label: string; size: string; elements: string; jacobian: number; score: number }> = {
  coarse: { label: "Coarse", size: "5 mm",   elements: "8,400",  jacobian: 0.71, score: 8 },
  medium: { label: "Medium", size: "2 mm",   elements: "42,800", jacobian: 0.87, score: 16 },
  fine:   { label: "Fine",   size: "1 mm",   elements: "186,200",jacobian: 0.93, score: 22 },
  ultra:  { label: "Ultra",  size: "0.5 mm", elements: "712,400",jacobian: 0.97, score: 25 },
};

const SIM_META: Record<SimType, { label: string; icon: typeof Cpu; color: string; metricLabel: string; unit: string }> = {
  FEA:       { label: "FEA Structural", icon: Layers,      color: "#F97316", metricLabel: "Safety Factor",      unit: "x" },
  CFD:       { label: "CFD Flow",       icon: FlaskConical, color: "#60A5FA", metricLabel: "Pressure Drop",      unit: "Pa" },
  Thermal:   { label: "Thermal",        icon: Thermometer, color: "#EF4444", metricLabel: "Max Temperature",    unit: "°C" },
  Kinematics:{ label: "Kinematics",     icon: Cog,         color: "#22C55E", metricLabel: "Efficiency",         unit: "%" },
};

/* ─── Score calculation ─── */
function calcResults(cfg: Config) {
  const mat = materials[cfg.materialIdx];
  const geo = GEOMETRIES[cfg.geometry];
  const mesh = MESH_META[cfg.meshDensity];

  // Stress / primary metric
  const syNum = parseFloat(mat.Sy.replace(" MPa", ""));
  const densityNum = parseFloat(mat.density.replace(" kg/m³", ""));
  const stressMPa = (cfg.loadMag * 1000) / geo.area; // N/mm² = MPa (load in kN)

  let primaryMetric = 0;
  let sfScore = 0;

  if (cfg.simType === "FEA") {
    const sf = stressMPa > 0 ? syNum / stressMPa : 99;
    primaryMetric = Math.min(sf, 9.99);
    sfScore = sf >= 2.5 ? 25 : sf >= 1.5 ? 18 : sf >= 1.0 ? 8 : 2;
  } else if (cfg.simType === "CFD") {
    primaryMetric = Math.round(cfg.loadMag * 1000 * 0.42); // pseudo pressure drop
    sfScore = primaryMetric < 5000 ? 25 : primaryMetric < 15000 ? 18 : 10;
  } else if (cfg.simType === "Thermal") {
    primaryMetric = Math.round(40 + cfg.loadMag * 8); // pseudo max temp °C
    sfScore = primaryMetric < 100 ? 25 : primaryMetric < 200 ? 18 : primaryMetric < 350 ? 10 : 4;
  } else {
    primaryMetric = Math.round(85 + (25 - mesh.score) * 0.4 + Math.random() * 3); // efficiency %
    primaryMetric = Math.min(99, primaryMetric);
    sfScore = primaryMetric >= 95 ? 25 : primaryMetric >= 90 ? 20 : 14;
  }

  // Mesh quality score
  const meshScore = mesh.score;

  // Convergence score
  const convBase = cfg.solver === "direct" ? 22 : 17;
  const convBonus = cfg.tolerance <= 1e-6 ? 3 : cfg.tolerance <= 1e-4 ? 2 : 0;
  const convergenceScore = Math.min(25, convBase + convBonus);

  // Material efficiency: specific strength (Sy/density) relative to steel baseline
  const steelSy = 530, steelDensity = 7850;
  const specificStr = syNum / densityNum;
  const baselineSpecific = steelSy / steelDensity;
  const matRatio = specificStr / baselineSpecific;
  const materialScore = Math.min(25, Math.round(matRatio * 17));

  const total = meshScore + sfScore + convergenceScore + materialScore;

  const grade =
    total >= 90 ? "A+" : total >= 80 ? "A" : total >= 70 ? "B+" :
    total >= 60 ? "B" : total >= 50 ? "C+" : "C";

  return { primaryMetric, sfScore, meshScore, convergenceScore, materialScore, total, grade, syNum, stressMPa, mesh, mat };
}

/* ─── Terminal line generator ─── */
function buildTerminalLines(cfg: Config, res: ReturnType<typeof calcResults>) {
  const mesh = MESH_META[cfg.meshDensity];
  const geo = GEOMETRIES[cfg.geometry];
  const mat = materials[cfg.materialIdx];
  const ts = () => {
    const d = new Date();
    return `[${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}:${String(d.getSeconds()).padStart(2,"0")}.${String(d.getMilliseconds()).padStart(3,"0")}]`;
  };

  const lines: { text: string; type: "stage"|"info"|"success"|"error"|"progress" }[] = [];

  const push = (text: string, type: typeof lines[0]["type"] = "info") => lines.push({ text, type });

  push(`─── Stage 1: Initialize ───`, "stage");
  push(`${ts()} → Loading project: ${cfg.projectName.replace(/\s/g,"_").toLowerCase()}.step`);
  push(`${ts()} ✓ Project loaded (${(Math.random()*3+1).toFixed(1)}MB, ${Math.floor(Math.random()*400+600)} faces)`, "success");

  push(`─── Stage 2: Import Geometry ───`, "stage");
  push(`${ts()} → Parsing ${geo.label} B-Rep entities...`);
  push(`${ts()} ✓ Geometry validated — cross-section area: ${geo.area.toLocaleString()} mm²`, "success");

  push(`─── Stage 3: Mesh Generation ───`, "stage");
  push(`${ts()} → Generating mesh (target: ${mesh.size})`);
  push(`${ts()} ████████████████████ 100% — ${mesh.elements} elements`, "progress");
  push(`${ts()} ✓ Jacobian quality: ${mesh.jacobian} (${mesh.jacobian>=0.9?"excellent":"acceptable"})`, "success");

  push(`─── Stage 4: Boundary Conditions ───`, "stage");

  if (cfg.simType === "FEA") {
    push(`${ts()} → Fixed constraint: face_id=1 (6 DOF)`);
    push(`${ts()} → Applied load: ${cfg.loadMag} kN @ geometry centroid`);
    push(`${ts()} ✓ Boundary conditions verified`, "success");
    push(`─── Stage 5: FEA Solve (${cfg.solver === "direct" ? "PARDISO" : "CG Iterative"}) ───`, "stage");
    push(`${ts()} → Solver: ${cfg.solver === "direct" ? "Direct (PARDISO)" : "Iterative (CG)"} — ${mesh.elements} DOF`);
    push(`${ts()} → Iteration 1: residual ${(Math.random()*0.005+0.002).toFixed(4)}`);
    push(`${ts()} → Iteration 2: residual ${(cfg.tolerance * 8.7).toExponential(2)}`);
    push(`${ts()} → Iteration 3: residual ${(cfg.tolerance * 0.21).toExponential(2)} ✓ CONVERGED`, "success");
    push(`─── Stage 6: Results ───`, "stage");
    push(`${ts()} → Peak von Mises stress: ${res.stressMPa.toFixed(1)} MPa`);
    push(`${ts()} → Yield strength (${mat.name}): ${res.syNum} MPa`);
    const sf = res.primaryMetric;
    const sfColor = sf >= 2.5 ? "✅ SAFE" : sf >= 1.5 ? "⚠️ MARGINAL" : "❌ CRITICAL";
    push(`${ts()} → SF = ${res.syNum}/${res.stressMPa.toFixed(1)} = ${sf.toFixed(2)} ${sfColor}`, sf >= 1.5 ? "success" : "error");
  } else if (cfg.simType === "CFD") {
    push(`${ts()} → Inlet velocity: ${(cfg.loadMag*0.5).toFixed(1)} m/s`);
    push(`${ts()} → Turbulence model: k-ε Realizable`);
    push(`${ts()} ✓ Boundary conditions set`, "success");
    push(`─── Stage 5: CFD Solve (SIMPLE) ───`, "stage");
    push(`${ts()} → Pressure-velocity coupling: SIMPLE`);
    push(`${ts()} → Iteration 50: residuals p=${(cfg.tolerance*14).toExponential(2)} U=${(cfg.tolerance*8).toExponential(2)}`);
    push(`${ts()} → Iteration 100: CONVERGED — all residuals < ${cfg.tolerance.toExponential(0)}`, "success");
    push(`─── Stage 6: Results ───`, "stage");
    push(`${ts()} → Max velocity: ${(cfg.loadMag*0.5).toFixed(2)} m/s`);
    push(`${ts()} → Pressure drop: ${res.primaryMetric} Pa`);
    push(`${ts()} → Reynolds number: ${Math.round(cfg.loadMag*1000*0.001/0.001).toLocaleString()}`, "success");
  } else if (cfg.simType === "Thermal") {
    push(`${ts()} → Heat flux: ${(cfg.loadMag*100).toFixed(0)} W/m²`);
    push(`${ts()} → Convection coefficient: 25 W/m²·K`);
    push(`${ts()} ✓ Thermal BCs applied`, "success");
    push(`─── Stage 5: Thermal Solve ───`, "stage");
    push(`${ts()} → Steady-state solver: MUMPS direct`);
    push(`${ts()} → Convergence criterion: ΔT < ${cfg.tolerance*1000} mK`);
    push(`${ts()} → ✓ Converged in 1 iteration (linear problem)`, "success");
    push(`─── Stage 6: Results ───`, "stage");
    push(`${ts()} → Max temperature: ${res.primaryMetric} °C`);
    push(`${ts()} → Min temperature: 25.0 °C`);
    push(`${ts()} → Thermal resistance: ${(res.primaryMetric/cfg.loadMag/100).toFixed(4)} K·m²/W`, "success");
  } else {
    push(`${ts()} → Input speed: ${cfg.loadMag*100} RPM`);
    push(`${ts()} → Gear ratio: ${(cfg.loadMag*0.3+2).toFixed(2)}:1`);
    push(`${ts()} ✓ Kinematic constraints set`, "success");
    push(`─── Stage 5: Kinematic Solve ───`, "stage");
    push(`${ts()} → Forward kinematic analysis...`);
    push(`${ts()} → Velocity propagation: ${mesh.elements} nodes`);
    push(`${ts()} ✓ All constraints satisfied`, "success");
    push(`─── Stage 6: Results ───`, "stage");
    push(`${ts()} → Output speed: ${Math.round(cfg.loadMag*100/(cfg.loadMag*0.3+2))} RPM`);
    push(`${ts()} → Mechanical efficiency: ${res.primaryMetric}%`);
    push(`${ts()} → Power loss: ${(100-res.primaryMetric).toFixed(1)}%`, "success");
  }

  push(`─── Stage 7: Score & Certify ───`, "stage");
  push(`${ts()} → Mesh Quality:     ${res.meshScore}/25`);
  push(`${ts()} → Performance:      ${res.sfScore}/25`);
  push(`${ts()} → Convergence:      ${res.convergenceScore}/25`);
  push(`${ts()} → Material Eff.:    ${res.materialScore}/25`);
  push(`${ts()} → TOTAL SCORE:      ${res.total}/100  Grade: ${res.grade}`, "success");
  push(`${ts()} ✓ Simulation complete — result saved to Playground log`, "success");

  return lines;
}

/* ─── Stress map SVGs ─── */
function StressMapSVG({ type, score }: { type: SimType; score: number }) {
  const intensity = score / 100;

  if (type === "FEA") return (
    <svg viewBox="0 0 360 180" className="w-full rounded-lg" style={{ background: "#020d1c", border: "1px solid #1F2937" }}>
      <defs>
        <linearGradient id="feaStress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="25%" stopColor="#FF6600" />
          <stop offset="55%" stopColor="#FFCC00" />
          <stop offset="80%" stopColor="#00CC44" />
          <stop offset="100%" stopColor="#0055FF" />
        </linearGradient>
        <pattern id="pgrid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M 15 0 L 0 0 0 15" fill="none" stroke="#0a2040" strokeWidth="0.4"/></pattern>
        <marker id="arr" markerWidth="8" markerHeight="8" refX="4" refY="4" orient="auto"><polygon points="0,0 8,4 0,8" fill="#EF4444"/></marker>
      </defs>
      <rect width="360" height="180" fill="url(#pgrid)" />
      {/* Fixed wall */}
      <rect x="18" y="50" width="24" height="80" fill="#1a3a5c" stroke="#F97316" strokeWidth="1"/>
      <line x1="42" y1="50" x2="42" y2="130" stroke="#F97316" strokeWidth="2"/>
      {/* Geometry body with stress gradient */}
      <rect x="42" y="72" width={220*intensity+60} height="36" fill="url(#feaStress)" rx="2"/>
      {/* Deformation line */}
      <path d={`M 42 90 Q ${130+intensity*40} ${88+intensity*12} ${310} ${105+intensity*8}`} stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="5,3" fill="none" opacity="0.7"/>
      {/* Load arrow */}
      <line x1="300" y1="38" x2="300" y2="70" stroke="#EF4444" strokeWidth="2" markerEnd="url(#arr)"/>
      <text x="310" y="56" fill="#EF4444" fontSize="9" fontFamily="JetBrains Mono">F</text>
      {/* Labels */}
      <text x="24" y="26" fill="#60A5FA" fontSize="8" fontFamily="JetBrains Mono">VON MISES STRESS DISTRIBUTION</text>
      <text x="44" y="152" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">MAX (FIXED END)</text>
      <text x="240" y="152" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">MIN (FREE END)</text>
      {/* Colorbar */}
      <defs><linearGradient id="cbH" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stopColor="#0055FF"/><stop offset="50%" stopColor="#FFCC00"/><stop offset="100%" stopColor="#FF0000"/></linearGradient></defs>
      <rect x="44" y="163" width="180" height="7" fill="url(#cbH)" rx="1"/>
      <text x="44" y="177" fill="#6B7280" fontSize="7" fontFamily="JetBrains Mono">0</text>
      <text x="204" y="177" fill="#6B7280" fontSize="7" fontFamily="JetBrains Mono" textAnchor="end">σ_max MPa</text>
    </svg>
  );

  if (type === "CFD") return (
    <svg viewBox="0 0 360 180" className="w-full rounded-lg" style={{ background: "#020d1c", border: "1px solid #1F2937" }}>
      <defs>
        <linearGradient id="cfdVel" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0055FF"/>
          <stop offset="40%" stopColor="#00CCFF"/>
          <stop offset="70%" stopColor="#00FF88"/>
          <stop offset="100%" stopColor="#FF6600"/>
        </linearGradient>
        <pattern id="cgrid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M 15 0 L 0 0 0 15" fill="none" stroke="#0a2040" strokeWidth="0.4"/></pattern>
      </defs>
      <rect width="360" height="180" fill="url(#cgrid)"/>
      {/* Pipe walls */}
      <rect x="20" y="40" width="320" height="20" fill="#1E3A5F" stroke="#374151" strokeWidth="1"/>
      <rect x="20" y="120" width="320" height="20" fill="#1E3A5F" stroke="#374151" strokeWidth="1"/>
      {/* Velocity contours */}
      {[0,1,2,3,4].map(i => (
        <rect key={i} x="20" y={60+i*12} width="320" height="12"
          fill={`hsl(${200+i*30},80%,${35+i*5}%)`} opacity="0.8"/>
      ))}
      {/* Flow arrows */}
      {[70,82,94,106,118].map((y,i) => (
        [80,160,240].map(x => (
          <line key={`${x}-${y}`} x1={x} y1={y} x2={x+28+i*2} y2={y} stroke="rgba(255,255,255,0.4)" strokeWidth="1"
            markerEnd="url(#cfarr)"/>
        ))
      ))}
      <defs><marker id="cfarr" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto"><polygon points="0,0 6,3 0,6" fill="rgba(255,255,255,0.4)"/></marker></defs>
      <text x="24" y="26" fill="#60A5FA" fontSize="8" fontFamily="JetBrains Mono">VELOCITY CONTOURS — PIPE FLOW</text>
      <text x="24" y="168" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">WALL (v=0)</text>
      <text x="145" y="93" fill="white" fontSize="7" fontFamily="JetBrains Mono" textAnchor="middle">v_max (centerline)</text>
    </svg>
  );

  if (type === "Thermal") return (
    <svg viewBox="0 0 360 180" className="w-full rounded-lg" style={{ background: "#020d1c", border: "1px solid #1F2937" }}>
      <defs>
        <linearGradient id="thGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF0000"/>
          <stop offset="40%" stopColor="#FF8800"/>
          <stop offset="75%" stopColor="#FFFF00"/>
          <stop offset="100%" stopColor="#0088FF"/>
        </linearGradient>
        <pattern id="tgrid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M 15 0 L 0 0 0 15" fill="none" stroke="#0a2040" strokeWidth="0.4"/></pattern>
      </defs>
      <rect width="360" height="180" fill="url(#tgrid)"/>
      {/* Heat source */}
      <rect x="20" y="20" width="20" height="140" fill="#FF2200" opacity="0.9" rx="2"/>
      <text x="10" y="95" fill="#FF4400" fontSize="8" fontFamily="JetBrains Mono" transform="rotate(-90,10,95)">HEAT SRC</text>
      {/* Body with thermal gradient */}
      <rect x="40" y="50" width="280" height="80" fill="url(#thGrad)" rx="3"/>
      {/* Isotherms */}
      {[0.2,0.4,0.6,0.8].map((t,i) => (
        <line key={i} x1={40+280*t} y1="50" x2={40+280*t} y2="130" stroke="white" strokeWidth="0.8" strokeDasharray="3,3" opacity="0.4"/>
      ))}
      <text x="24" y="26" fill="#EF4444" fontSize="8" fontFamily="JetBrains Mono">TEMPERATURE FIELD (°C)</text>
      <text x="42" y="155" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">T_max</text>
      <text x="270" y="155" fill="#9CA3AF" fontSize="7" fontFamily="JetBrains Mono">T_ambient (25°C)</text>
    </svg>
  );

  // Kinematics
  return (
    <svg viewBox="0 0 360 180" className="w-full rounded-lg" style={{ background: "#020d1c", border: "1px solid #1F2937" }}>
      <defs>
        <pattern id="kgrid" width="15" height="15" patternUnits="userSpaceOnUse"><path d="M 15 0 L 0 0 0 15" fill="none" stroke="#0a2040" strokeWidth="0.4"/></pattern>
      </defs>
      <rect width="360" height="180" fill="url(#kgrid)"/>
      {/* Driver gear */}
      <circle cx="110" cy="90" r="45" fill="none" stroke="#F97316" strokeWidth="2.5"/>
      <circle cx="110" cy="90" r="6" fill="#F97316"/>
      {[0,30,60,90,120,150,180,210,240,270,300,330].map(a => (
        <rect key={a} x="107" y="43" width="6" height="14" fill="#F97316" rx="1"
          transform={`rotate(${a} 110 90)`}/>
      ))}
      <text x="110" y="94" fill="#F97316" fontSize="9" fontFamily="JetBrains Mono" textAnchor="middle">DRIVER</text>
      {/* Driven gear (smaller) */}
      <circle cx="230" cy="90" r="30" fill="none" stroke="#22C55E" strokeWidth="2.5"/>
      <circle cx="230" cy="90" r="5" fill="#22C55E"/>
      {[0,45,90,135,180,225,270,315].map(a => (
        <rect key={a} x="227" y="58" width="6" height="12" fill="#22C55E" rx="1"
          transform={`rotate(${a} 230 90)`}/>
      ))}
      <text x="230" y="94" fill="#22C55E" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">DRIVEN</text>
      {/* Arrows */}
      <path d="M 100 52 A 10 10 0 0 0 80 62" stroke="#F97316" strokeWidth="1.5" fill="none" strokeDasharray="4,2"/>
      <path d="M 240 128 A 10 10 0 0 0 260 118" stroke="#22C55E" strokeWidth="1.5" fill="none" strokeDasharray="4,2"/>
      <text x="24" y="26" fill="#22C55E" fontSize="8" fontFamily="JetBrains Mono">KINEMATIC ANALYSIS — GEAR TRAIN</text>
      <text x="90" y="160" fill="#F97316" fontSize="8" fontFamily="JetBrains Mono">ω_in</text>
      <text x="218" y="160" fill="#22C55E" fontSize="8" fontFamily="JetBrains Mono">ω_out</text>
      <text x="160" y="94" fill="#9CA3AF" fontSize="8" fontFamily="JetBrains Mono" textAnchor="middle">mesh</text>
    </svg>
  );
}

/* ─── Score breakdown bar ─── */
function ScoreBar({ label, value, max = 25, color }: { label: string; value: number; max?: number; color: string }) {
  return (
    <div>
      <div className="flex justify-between text-xs font-mono mb-1">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }}>{value}/{max}</span>
      </div>
      <div className="h-2 bg-[#1F2937] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${(value / max) * 100}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="h-2 rounded-full"
          style={{ background: color }}
        />
      </div>
    </div>
  );
}

/* ─── Terminal line component ─── */
function TermLine({ text, type }: { text: string; type: string }) {
  const color = type === "stage" ? "#60A5FA" : type === "success" ? "#22C55E" :
    type === "error" ? "#EF4444" : type === "progress" ? "#F97316" : "#9CA3AF";
  return (
    <div className="font-mono text-xs leading-relaxed" style={{ color }}>
      {type === "stage" ? <span className="text-[#374151]">{text}</span> : text}
    </div>
  );
}

/* ─── Animated score counter ─── */
function AnimatedScore({ target }: { target: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / 40;
    const iv = setInterval(() => {
      start += step;
      if (start >= target) { setDisplayed(target); clearInterval(iv); }
      else setDisplayed(Math.floor(start));
    }, 30);
    return () => clearInterval(iv);
  }, [target]);
  return <>{displayed}</>;
}

/* ─── Default config ─── */
const DEFAULT_CONFIG: Config = {
  simType: "FEA",
  projectName: "My Simulation 1",
  geometry: "box",
  materialIdx: 0,
  loadMag: 5,
  meshDensity: "medium",
  solver: "direct",
  tolerance: 1e-6,
};

/* ─── Main page ─── */
export default function Playground() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cfg, setCfg] = useState<Config>(DEFAULT_CONFIG);
  const [phase, setPhase] = useState<"idle" | "running" | "done">("idle");
  const [termLines, setTermLines] = useState<{ text: string; type: string }[]>([]);
  const [visibleLines, setVisibleLines] = useState(0);
  const [results, setResults] = useState<ReturnType<typeof calcResults> | null>(null);
  const [savedCount, setSavedCount] = useState(0);
  const termRef = useRef<HTMLDivElement>(null);

  const set = <K extends keyof Config>(key: K, val: Config[K]) =>
    setCfg(prev => ({ ...prev, [key]: val }));

  const runSim = () => {
    const res = calcResults(cfg);
    const lines = buildTerminalLines(cfg, res);
    setResults(res);
    setTermLines(lines);
    setVisibleLines(0);
    setPhase("running");

    // Stream lines with delay
    lines.forEach((_, i) => {
      setTimeout(() => {
        setVisibleLines(i + 1);
        if (termRef.current) termRef.current.scrollTop = termRef.current.scrollHeight;
        if (i === lines.length - 1) setPhase("done");
      }, i * 120 + 400);
    });
  };

  const reset = () => {
    setPhase("idle");
    setTermLines([]);
    setVisibleLines(0);
    setResults(null);
  };

  const save = () => {
    setSavedCount(c => c + 1);
    toast.success(`"${cfg.projectName}" saved to portfolio`, {
      style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #22C55E" }
    });
  };

  const simMeta = SIM_META[cfg.simType];
  const SimIcon = simMeta.icon;

  const gradeColor = (g: string) =>
    g === "A+" ? "#22C55E" : g === "A" ? "#4ADE80" : g === "B+" ? "#F97316" : g === "B" ? "#FBBF24" : "#EF4444";

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <div className="p-6 space-y-5 max-w-[1400px]">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>Simulation Playground</h1>
              <p className="text-xs text-gray-500 font-mono mt-0.5">Configure · Run · Score · Save — no challenge required</p>
            </div>
            {savedCount > 0 && (
              <div className="text-xs font-mono text-green-400 bg-green-500/10 border border-green-500/20 px-3 py-1.5 rounded">
                {savedCount} run{savedCount > 1 ? "s" : ""} saved
              </div>
            )}
          </motion.div>

          {/* 3-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr_320px] gap-5 items-start">

            {/* ─── LEFT: Config panel ─── */}
            <motion.div initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.05 }}
              className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-[#1F2937] flex items-center gap-2"
                style={{ background: "linear-gradient(135deg,#0D1424,#111827)" }}>
                <Cpu className="w-4 h-4 text-[#F97316]" />
                <span className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Simulation Config</span>
              </div>

              <div className="p-4 space-y-5">
                {/* Sim type */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block mb-2">Analysis Type</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(SIM_META) as SimType[]).map(t => {
                      const m = SIM_META[t]; const Icon = m.icon;
                      return (
                        <button key={t} onClick={() => set("simType", t)}
                          className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-mono transition-colors ${cfg.simType === t ? "border-[#F97316]/60 text-white" : "border-[#374151] text-gray-500 hover:text-gray-300"}`}
                          style={cfg.simType === t ? { background: `${m.color}15` } : {}}
                          data-testid={`btn-simtype-${t.toLowerCase()}`}
                        >
                          <Icon className="w-3.5 h-3.5" style={{ color: cfg.simType === t ? m.color : undefined }} />
                          {t}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Project name */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block mb-2">Project Name</label>
                  <input value={cfg.projectName} onChange={e => set("projectName", e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#F97316]"
                    data-testid="input-project-name"
                  />
                </div>

                {/* Geometry */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block mb-2">Geometry</label>
                  <select value={cfg.geometry} onChange={e => set("geometry", e.target.value as GeomKey)}
                    className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#F97316]"
                    data-testid="select-geometry"
                  >
                    {(Object.entries(GEOMETRIES)).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                  <p className="text-[10px] text-gray-600 font-mono mt-1">
                    A = {GEOMETRIES[cfg.geometry].area.toLocaleString()} mm² · {GEOMETRIES[cfg.geometry].description}
                  </p>
                </div>

                {/* Material */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block mb-2">Material</label>
                  <select value={cfg.materialIdx} onChange={e => set("materialIdx", +e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded-lg px-3 py-2 text-sm text-white font-mono focus:outline-none focus:border-[#F97316]"
                    data-testid="select-material"
                  >
                    {materials.map((m, i) => <option key={i} value={i}>{m.name}</option>)}
                  </select>
                  <div className="flex gap-3 mt-1 text-[10px] font-mono text-gray-600">
                    <span>Sy: {materials[cfg.materialIdx].Sy}</span>
                    <span>E: {materials[cfg.materialIdx].E}</span>
                    <span>ρ: {materials[cfg.materialIdx].density}</span>
                  </div>
                </div>

                {/* Load */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-2">
                    <span className="text-gray-400 uppercase tracking-wide">
                      {cfg.simType === "FEA" ? "Applied Load" : cfg.simType === "CFD" ? "Flow Rate" : cfg.simType === "Thermal" ? "Heat Flux" : "Input Speed"} ×10
                    </span>
                    <span className="text-[#F97316]">
                      {cfg.loadMag} {cfg.simType === "FEA" ? "kN" : cfg.simType === "CFD" ? "L/min" : cfg.simType === "Thermal" ? "kW/m²" : "×100RPM"}
                    </span>
                  </div>
                  <input type="range" min={1} max={20} value={cfg.loadMag} onChange={e => set("loadMag", +e.target.value)}
                    className="w-full accent-orange-500"
                    data-testid="slider-load"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-gray-600 mt-0.5"><span>Min</span><span>Max</span></div>
                </div>

                {/* Mesh density */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block mb-2">Mesh Density</label>
                  <div className="grid grid-cols-2 gap-1.5">
                    {(Object.keys(MESH_META) as MeshDensity[]).map(m => (
                      <button key={m} onClick={() => set("meshDensity", m)}
                        className={`py-1.5 px-2 text-[11px] rounded border font-mono transition-colors text-left ${cfg.meshDensity === m ? "bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]" : "border-[#374151] text-gray-500 hover:text-gray-300"}`}
                        data-testid={`btn-mesh-${m}`}
                      >
                        <div className="font-semibold">{MESH_META[m].label}</div>
                        <div className="text-[9px] text-gray-600">{MESH_META[m].size} · {MESH_META[m].elements} el</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Solver */}
                <div>
                  <label className="text-[10px] font-mono text-gray-400 uppercase tracking-wide block mb-2">Solver</label>
                  <div className="flex gap-2">
                    {(["direct", "iterative"] as SolverType[]).map(s => (
                      <button key={s} onClick={() => set("solver", s)}
                        className={`flex-1 py-1.5 text-[11px] rounded border font-mono transition-colors capitalize ${cfg.solver === s ? "bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]" : "border-[#374151] text-gray-500 hover:text-gray-300"}`}
                        data-testid={`btn-solver-${s}`}
                      >
                        {s === "direct" ? "Direct (PARDISO)" : "Iterative (CG)"}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tolerance */}
                <div>
                  <div className="flex justify-between text-[10px] font-mono mb-2">
                    <span className="text-gray-400 uppercase tracking-wide">Convergence Tolerance</span>
                    <span className="text-[#60A5FA]">{cfg.tolerance.toExponential(0)}</span>
                  </div>
                  <div className="flex gap-1.5">
                    {[1e-3, 1e-4, 1e-5, 1e-6].map(t => (
                      <button key={t} onClick={() => set("tolerance", t)}
                        className={`flex-1 py-1 text-[10px] rounded border font-mono transition-colors ${cfg.tolerance === t ? "bg-[#60A5FA]/15 border-[#60A5FA]/40 text-[#60A5FA]" : "border-[#374151] text-gray-500"}`}
                        data-testid={`btn-tol-${t}`}
                      >
                        {t.toExponential(0)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Run button */}
                <button
                  onClick={runSim}
                  disabled={phase === "running"}
                  className="w-full py-3 bg-[#F97316] text-white font-bold rounded-lg flex items-center justify-center gap-2 text-sm hover:bg-[#ea6c0f] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "Space Grotesk" }}
                  data-testid="btn-run-simulation"
                >
                  {phase === "running" ? (
                    <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white rounded-full" /> Running...</>
                  ) : (
                    <><Play className="w-4 h-4 fill-white" /> Run Simulation</>
                  )}
                </button>
                {phase !== "idle" && (
                  <button onClick={reset} className="w-full py-2 text-sm text-gray-400 hover:text-white border border-[#374151] rounded-lg flex items-center justify-center gap-2 transition-colors font-mono" data-testid="btn-reset">
                    <RotateCcw className="w-3.5 h-3.5" /> Reset
                  </button>
                )}
              </div>
            </motion.div>

            {/* ─── CENTER: Terminal ─── */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-[#0A0F1E] border border-[#1F2937] rounded-xl overflow-hidden flex flex-col"
              style={{ minHeight: 560 }}
            >
              {/* Terminal header */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-[#1F2937] bg-[#111827]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs font-mono text-gray-500 ml-2">
                  {cfg.simType} Solver · {cfg.projectName || "untitled"} · {MESH_META[cfg.meshDensity].elements} elements
                </span>
                {phase === "running" && (
                  <span className="ml-auto text-[10px] font-mono text-[#F97316] animate-pulse">● COMPUTING</span>
                )}
                {phase === "done" && (
                  <span className="ml-auto text-[10px] font-mono text-green-400">● COMPLETE</span>
                )}
              </div>

              {/* Terminal body */}
              <div ref={termRef} className="flex-1 p-4 overflow-y-auto space-y-0.5"
                style={{ fontFamily: "JetBrains Mono", scrollbarWidth: "thin", scrollbarColor: "#374151 transparent", minHeight: 460 }}>
                {phase === "idle" ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-20">
                    <div className="w-16 h-16 rounded-2xl bg-[#111827] border border-[#1F2937] flex items-center justify-center mb-4">
                      <SimIcon className="w-7 h-7" style={{ color: simMeta.color }} />
                    </div>
                    <p className="text-sm text-gray-400 font-mono mb-1">Configure your simulation</p>
                    <p className="text-xs text-gray-600 font-mono">and press <span className="text-[#F97316]">Run Simulation</span> to begin</p>
                    <div className="mt-6 grid grid-cols-2 gap-3 text-[11px] font-mono text-gray-600 max-w-xs">
                      {[
                        ["Geometry", GEOMETRIES[cfg.geometry].label],
                        ["Material", materials[cfg.materialIdx].name],
                        ["Mesh", `${MESH_META[cfg.meshDensity].label} (${MESH_META[cfg.meshDensity].size})`],
                        ["Solver", cfg.solver === "direct" ? "PARDISO" : "CG"],
                      ].map(([k,v]) => (
                        <div key={k} className="bg-[#111827] border border-[#1F2937] rounded p-2 text-left">
                          <div className="text-gray-500 text-[9px] mb-0.5">{k}</div>
                          <div className="text-white text-[10px] truncate">{v}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  termLines.slice(0, visibleLines).map((l, i) => (
                    <TermLine key={i} text={l.text} type={l.type} />
                  ))
                )}
                {phase === "running" && (
                  <span className="inline-block w-2 h-4 bg-[#F97316] animate-pulse ml-0.5" />
                )}
              </div>
            </motion.div>

            {/* ─── RIGHT: Results panel ─── */}
            <AnimatePresence>
              {phase !== "idle" && results && (
                <motion.div
                  key="results"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 lg:sticky lg:top-20"
                >
                  {/* Stress map */}
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
                    <div className="px-4 py-2.5 border-b border-[#1F2937] flex items-center gap-2">
                      <Gauge className="w-4 h-4 text-[#60A5FA]" />
                      <span className="text-xs font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>
                        {cfg.simType === "FEA" ? "Stress Distribution" : cfg.simType === "CFD" ? "Flow Field" : cfg.simType === "Thermal" ? "Temperature Field" : "Kinematic Diagram"}
                      </span>
                    </div>
                    <div className="p-3">
                      <StressMapSVG type={cfg.simType} score={results.total} />
                    </div>
                  </div>

                  {/* Score card */}
                  <AnimatePresence>
                    {phase === "done" && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                        className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden"
                      >
                        <div className="px-4 py-2.5 border-b border-[#1F2937] flex items-center gap-2"
                          style={{ background: "linear-gradient(135deg,#0D1424,#111827)" }}>
                          <TrendingUp className="w-4 h-4 text-[#F97316]" />
                          <span className="text-xs font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Score Breakdown</span>
                        </div>
                        <div className="p-4 space-y-4">
                          {/* Total score */}
                          <div className="flex items-center gap-4">
                            <div className="flex-1">
                              <div className="text-[10px] font-mono text-gray-500 mb-1">TOTAL SCORE</div>
                              <div className="font-mono text-4xl font-bold text-white">
                                <AnimatedScore target={results.total} /><span className="text-lg text-gray-500">/100</span>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-3xl font-bold" style={{ color: gradeColor(results.grade), fontFamily: "Space Grotesk" }}>
                                {results.grade}
                              </div>
                              <div className="text-[10px] text-gray-500 font-mono">Grade</div>
                            </div>
                          </div>

                          {/* Primary metric */}
                          <div className="bg-[#0A0F1E] border border-[#1F2937] rounded-lg p-3">
                            <div className="text-[10px] font-mono text-gray-500 mb-1">{simMeta.metricLabel}</div>
                            <div className="font-mono text-xl font-bold" style={{ color: simMeta.color }}>
                              {cfg.simType === "FEA"
                                ? `${(results.primaryMetric as number).toFixed(2)}${simMeta.unit}`
                                : `${Math.round(results.primaryMetric as number).toLocaleString()} ${simMeta.unit}`}
                            </div>
                            {cfg.simType === "FEA" && (
                              <div className={`text-[10px] font-mono mt-0.5 ${(results.primaryMetric as number) >= 2.5 ? "text-green-400" : (results.primaryMetric as number) >= 1.5 ? "text-amber-400" : "text-red-400"}`}>
                                {(results.primaryMetric as number) >= 2.5 ? "✓ SAFE — above target 2.5x" :
                                 (results.primaryMetric as number) >= 1.0 ? "⚠ MARGINAL — above failure" :
                                 "✗ CRITICAL — below failure threshold"}
                              </div>
                            )}
                          </div>

                          {/* Score bars */}
                          <div className="space-y-3">
                            <ScoreBar label="Mesh Quality" value={results.meshScore} color="#60A5FA" />
                            <ScoreBar label="Performance / SF" value={results.sfScore} color={simMeta.color} />
                            <ScoreBar label="Convergence" value={results.convergenceScore} color="#22C55E" />
                            <ScoreBar label="Material Efficiency" value={results.materialScore} color="#A78BFA" />
                          </div>

                          {/* Improvement tips */}
                          {results.total < 85 && (
                            <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                              <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold mb-2">
                                <AlertTriangle className="w-3.5 h-3.5" /> How to score higher
                              </div>
                              <ul className="space-y-1 text-[11px] font-mono text-gray-400">
                                {results.meshScore < 22 && <li>· Use Fine or Ultra mesh for better Jacobian quality</li>}
                                {results.sfScore < 20 && cfg.simType === "FEA" && <li>· Reduce load or choose a stronger material (Ti-6Al-4V, Steel)</li>}
                                {results.convergenceScore < 22 && <li>· Switch to Direct (PARDISO) solver + tighten tolerance to 1e-6</li>}
                                {results.materialScore < 18 && <li>· Ti-6Al-4V has the best specific strength for weight efficiency</li>}
                              </ul>
                            </div>
                          )}

                          {/* Actions */}
                          <div className="flex gap-2">
                            <button onClick={save}
                              className="flex-1 py-2.5 bg-[#F97316] text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#ea6c0f] transition-colors"
                              style={{ fontFamily: "Space Grotesk" }}
                              data-testid="btn-save-portfolio"
                            >
                              <Save className="w-3.5 h-3.5" /> Save to Portfolio
                            </button>
                            <button
                              onClick={() => toast("📄 Exporting report...", { style: { background: "#1F2937", color: "#F9FAFB" } })}
                              className="p-2.5 border border-[#374151] text-gray-400 hover:text-white rounded-lg transition-colors"
                              data-testid="btn-export"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => toast("🔗 Link copied!", { style: { background: "#1F2937", color: "#F9FAFB" } })}
                              className="p-2.5 border border-[#374151] text-gray-400 hover:text-white rounded-lg transition-colors"
                              data-testid="btn-share"
                            >
                              <Share2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
