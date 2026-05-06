import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import {
  Menu, Search, Star, X, ChevronRight, FlaskConical,
  BarChart2, Grid3X3, GitCompare, Zap, ArrowUpRight,
} from "lucide-react";
import toast from "react-hot-toast";
import { useLocation } from "wouter";

/* ─── Extended materials library ─── */
type Category = "Steel" | "Aluminum" | "Titanium" | "Cast Iron" | "Polymer" | "Copper" | "Composite";

interface MatEntry {
  id: string; name: string; shortName: string; category: Category;
  E: number;       // Young's Modulus GPa
  Sy: number;      // Yield Strength MPa
  Su: number;      // Ultimate Strength MPa
  density: number; // kg/m³
  nu: number;      // Poisson
  k: number;       // Thermal conductivity W/m·K
  alpha: number;   // Thermal expansion 1e-6/°C
  cost: number;    // relative $/kg (normalized to 1045 steel = 1.0)
  machinability: number;    // 0–100
  weldability: number;      // 0–100
  corrosionResistance: number; // 0–100
  usage: string;   // typical application note
}

const DB: MatEntry[] = [
  { id:"s1045",   name:"AISI 1045 Steel",       shortName:"1045 Steel",  category:"Steel",     E:205,  Sy:530,  Su:625,  density:7850, nu:0.29, k:49.8,  alpha:11.3, cost:1.0,  machinability:65, weldability:70, corrosionResistance:20, usage:"Shafts, gears, machine parts" },
  { id:"s4140",   name:"AISI 4140 Alloy Steel",  shortName:"4140 Steel",  category:"Steel",     E:210,  Sy:655,  Su:795,  density:7850, nu:0.30, k:42.7,  alpha:12.3, cost:1.8,  machinability:57, weldability:60, corrosionResistance:25, usage:"High-strength gears, crankshafts" },
  { id:"s304",    name:"AISI 304 Stainless",      shortName:"304 SS",      category:"Steel",     E:193,  Sy:215,  Su:505,  density:7900, nu:0.28, k:16.2,  alpha:17.2, cost:3.2,  machinability:45, weldability:85, corrosionResistance:90, usage:"Food equipment, chemical tanks" },
  { id:"s316l",   name:"AISI 316L Stainless",     shortName:"316L SS",     category:"Steel",     E:200,  Sy:170,  Su:485,  density:7990, nu:0.28, k:15.9,  alpha:16.0, cost:4.1,  machinability:40, weldability:90, corrosionResistance:95, usage:"Marine, pharmaceutical, surgical" },
  { id:"al6061",  name:"Al 6061-T6",              shortName:"6061-T6",     category:"Aluminum",  E:68.9, Sy:276,  Su:310,  density:2700, nu:0.33, k:167,   alpha:23.6, cost:2.8,  machinability:90, weldability:70, corrosionResistance:75, usage:"Aerospace structures, heat sinks" },
  { id:"al7075",  name:"Al 7075-T6",              shortName:"7075-T6",     category:"Aluminum",  E:71.7, Sy:503,  Su:572,  density:2810, nu:0.33, k:130,   alpha:23.4, cost:5.2,  machinability:80, weldability:30, corrosionResistance:55, usage:"Aircraft wings, bicycle frames" },
  { id:"al2024",  name:"Al 2024-T4",              shortName:"2024-T4",     category:"Aluminum",  E:73.1, Sy:324,  Su:469,  density:2780, nu:0.33, k:121,   alpha:23.2, cost:3.8,  machinability:85, weldability:20, corrosionResistance:45, usage:"Fuselage skins, truck wheels" },
  { id:"al1060",  name:"Al 1060",                 shortName:"1060 Al",     category:"Aluminum",  E:69.0, Sy:28,   Su:70,   density:2705, nu:0.33, k:222,   alpha:23.6, cost:2.0,  machinability:95, weldability:95, corrosionResistance:80, usage:"Electrical conductors, heat sinks" },
  { id:"ti64",    name:"Ti-6Al-4V",               shortName:"Ti-6Al-4V",   category:"Titanium",  E:114,  Sy:880,  Su:950,  density:4430, nu:0.34, k:6.7,   alpha:8.6,  cost:35.0, machinability:25, weldability:65, corrosionResistance:95, usage:"Aerospace, biomedical implants" },
  { id:"tipure",  name:"CP Titanium Grade 2",     shortName:"CP-Ti Gr.2",  category:"Titanium",  E:105,  Sy:275,  Su:345,  density:4510, nu:0.37, k:16.0,  alpha:8.4,  cost:28.0, machinability:40, weldability:85, corrosionResistance:92, usage:"Chemical plants, medical devices" },
  { id:"gci",     name:"Grey Cast Iron",           shortName:"Grey CI",     category:"Cast Iron", E:110,  Sy:240,  Su:180,  density:7200, nu:0.26, k:52,    alpha:10.5, cost:0.8,  machinability:80, weldability:10, corrosionResistance:15, usage:"Engine blocks, machine frames" },
  { id:"ndi",     name:"Ductile Iron GJS-500",     shortName:"Ductile CI",  category:"Cast Iron", E:169,  Sy:320,  Su:500,  density:7100, nu:0.28, k:36,    alpha:11.0, cost:1.1,  machinability:60, weldability:15, corrosionResistance:18, usage:"Crankshafts, gears, pipes" },
  { id:"hdpe",    name:"HDPE",                     shortName:"HDPE",        category:"Polymer",   E:0.8,  Sy:22,   Su:30,   density:960,  nu:0.44, k:0.49,  alpha:130,  cost:1.5,  machinability:70, weldability:55, corrosionResistance:95, usage:"Tanks, pipes, cutting boards" },
  { id:"pa66",    name:"Nylon 66 (PA66)",          shortName:"PA66",        category:"Polymer",   E:2.7,  Sy:82,   Su:82,   density:1140, nu:0.40, k:0.26,  alpha:80,   cost:2.3,  machinability:75, weldability:40, corrosionResistance:85, usage:"Gears, bearings, casings" },
  { id:"cu110",   name:"Copper C110",              shortName:"Cu C110",     category:"Copper",    E:117,  Sy:70,   Su:220,  density:8940, nu:0.34, k:391,   alpha:17.0, cost:8.5,  machinability:80, weldability:75, corrosionResistance:70, usage:"Electrical, heat exchangers" },
  { id:"cfrp",    name:"CFRP Unidirectional",      shortName:"CFRP UD",     category:"Composite", E:135,  Sy:1500, Su:1500, density:1600, nu:0.30, k:5.0,   alpha:0.5,  cost:85.0, machinability:15, weldability:0,  corrosionResistance:98, usage:"Aerospace, motorsport, robotics" },
];

const CAT_COLOR: Record<Category, string> = {
  Steel:      "#60A5FA",
  Aluminum:   "#F97316",
  Titanium:   "#A78BFA",
  "Cast Iron":"#9CA3AF",
  Polymer:    "#22C55E",
  Copper:     "#F59E0B",
  Composite:  "#EC4899",
};
const CATEGORIES = Object.keys(CAT_COLOR) as Category[];

/* ─── Axis options for Ashby plots ─── */
type AxisKey = "density"|"Sy"|"E"|"k"|"alpha"|"cost"|"specificStrength"|"Su";
const AXIS_OPTIONS: { key: AxisKey; label: string; unit: string }[] = [
  { key:"density",         label:"Density",           unit:"kg/m³" },
  { key:"Sy",              label:"Yield Strength",     unit:"MPa" },
  { key:"E",               label:"Young's Modulus",    unit:"GPa" },
  { key:"Su",              label:"Ultimate Strength",  unit:"MPa" },
  { key:"k",               label:"Thermal Conductivity", unit:"W/m·K" },
  { key:"alpha",           label:"Thermal Expansion",  unit:"µm/m·°C" },
  { key:"cost",            label:"Relative Cost",      unit:"×" },
  { key:"specificStrength",label:"Specific Strength",  unit:"kN·m/kg" },
];
function getVal(m: MatEntry, k: AxisKey) {
  if (k === "specificStrength") return Math.round((m.Sy / m.density) * 1000) / 10;
  return m[k as keyof MatEntry] as number;
}

/* ─── Radar normaliser ─── */
const RADAR_AXES = ["Specific Strength","Stiffness","Machinability","Weldability","Corrosion Res.","Affordability"] as const;
const maxSpecStr = Math.max(...DB.map(m => m.Sy/m.density));
const maxE       = Math.max(...DB.map(m => m.E));
const maxCost    = Math.max(...DB.map(m => m.cost));

function radarData(mats: MatEntry[]) {
  return RADAR_AXES.map(axis => {
    const entry: Record<string, number|string> = { axis };
    mats.forEach(m => {
      let val = 0;
      if (axis === "Specific Strength")  val = Math.round((m.Sy/m.density)/maxSpecStr*100);
      if (axis === "Stiffness")          val = Math.round(m.E/maxE*100);
      if (axis === "Machinability")      val = m.machinability;
      if (axis === "Weldability")        val = m.weldability;
      if (axis === "Corrosion Res.")     val = m.corrosionResistance;
      if (axis === "Affordability")      val = Math.round((1 - (m.cost/maxCost)*0.95)*100);
      entry[m.id] = val;
    });
    return entry;
  });
}

const RADAR_COLORS = ["#F97316","#60A5FA","#22C55E"];

/* ─── Scatter custom tooltip ─── */
function AshbyTooltip({ active, payload, xAxis, yAxis }: { active?: boolean; payload?: { payload: MatEntry }[]; xAxis: AxisKey; yAxis: AxisKey }) {
  if (!active || !payload?.length) return null;
  const m = payload[0].payload;
  const xa = AXIS_OPTIONS.find(a => a.key === xAxis)!;
  const ya = AXIS_OPTIONS.find(a => a.key === yAxis)!;
  return (
    <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-3 text-xs font-mono shadow-xl min-w-[180px]">
      <div className="font-bold text-white mb-2" style={{ fontFamily:"Space Grotesk" }}>{m.shortName}</div>
      <div className="text-gray-500 mb-1" style={{ color: CAT_COLOR[m.category] }}>{m.category}</div>
      <div className="text-gray-300">{ya.label}: <span className="text-white font-bold">{getVal(m,yAxis)} {ya.unit}</span></div>
      <div className="text-gray-300">{xa.label}: <span className="text-white font-bold">{getVal(m,xAxis)} {xa.unit}</span></div>
    </div>
  );
}

/* ─── Property badge ─── */
function PropBadge({ label, value, unit, color = "#9CA3AF" }: { label:string; value:string|number; unit?:string; color?:string }) {
  return (
    <div className="bg-[#0A0F1E] border border-[#1F2937] rounded-lg p-2.5">
      <div className="text-[9px] font-mono text-gray-500 mb-0.5">{label}</div>
      <div className="text-sm font-bold font-mono" style={{ color }}>{value}<span className="text-[10px] text-gray-500 ml-0.5">{unit}</span></div>
    </div>
  );
}

/* ─── Bar for 0-100 traits ─── */
function TraitBar({ label, value, color }: { label:string; value:number; color:string }) {
  return (
    <div>
      <div className="flex justify-between text-[10px] font-mono mb-1">
        <span className="text-gray-400">{label}</span>
        <span style={{ color }}>{value}/100</span>
      </div>
      <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
        <motion.div initial={{ width:0 }} animate={{ width:`${value}%` }} transition={{ duration:0.6, ease:"easeOut" }}
          className="h-1.5 rounded-full" style={{ background:color }}/>
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function MaterialsExplorer() {
  const [, navigate] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [catFilter, setCatFilter] = useState<Category[]>([]);
  const [starred, setStarred] = useState<Set<string>>(new Set(["s1045","al6061","ti64"]));
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string|null>(null);
  const [tab, setTab] = useState<"charts"|"compare"|"library">("charts");
  const [xAxis, setXAxis] = useState<AxisKey>("density");
  const [yAxis, setYAxis] = useState<AxisKey>("Sy");

  const filtered = useMemo(() => DB.filter(m => {
    const matchCat = catFilter.length === 0 || catFilter.includes(m.category);
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.category.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  }), [catFilter, search]);

  const detailMat = DB.find(m => m.id === detailId) ?? null;
  const selectedMats = DB.filter(m => selected.has(m.id));

  const toggleStar = (id: string) => setStarred(prev => { const n = new Set(prev); n.has(id)?n.delete(id):n.add(id); return n; });
  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const n = new Set(prev);
      if (n.has(id)) { n.delete(id); return n; }
      if (n.size >= 3) { toast("Max 3 materials to compare", { style:{background:"#1F2937",color:"#F9FAFB"} }); return prev; }
      n.add(id); return n;
    });
  };

  const useInPlayground = (m: MatEntry) => {
    toast.success(`Opening Playground with ${m.shortName}`, { style:{background:"#1F2937",color:"#F9FAFB",border:"1px solid #22C55E"} });
    navigate("/playground");
  };

  const byCategory = useMemo(() => {
    const map: Record<string, MatEntry[]> = {};
    filtered.forEach(m => { (map[m.category] ??= []).push(m); });
    return map;
  }, [filtered]);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <div className="flex flex-col h-[calc(100vh-56px)]">

          {/* ─── Top bar ─── */}
          <div className="flex-shrink-0 px-5 py-4 border-b border-[#1F2937] bg-[#0A0F1E]">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5"/></button>
              <div>
                <h1 className="text-lg font-bold text-white" style={{ fontFamily:"Space Grotesk" }}>Material Properties Explorer</h1>
                <p className="text-[11px] text-gray-500 font-mono">{DB.length} materials · Ashby plots · Compare up to 3 · Bookmark favourites</p>
              </div>
              <div className="ml-auto flex items-center gap-2">
                {selected.size > 0 && (
                  <motion.button initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }}
                    onClick={() => { setTab("compare"); }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-[#A78BFA]/15 border border-[#A78BFA]/30 text-[#A78BFA] rounded-lg text-xs font-mono hover:bg-[#A78BFA]/25 transition-colors">
                    <GitCompare className="w-3.5 h-3.5"/> Compare {selected.size}
                  </motion.button>
                )}
                <div className="flex bg-[#111827] border border-[#1F2937] rounded-lg overflow-hidden">
                  {(["charts","compare","library"] as const).map(t => (
                    <button key={t} onClick={() => setTab(t)}
                      className={`px-3 py-1.5 text-xs font-mono capitalize transition-colors flex items-center gap-1.5 ${tab===t?"bg-[#F97316] text-white":"text-gray-400 hover:text-white"}`}>
                      {t==="charts"&&<BarChart2 className="w-3 h-3"/>}
                      {t==="compare"&&<GitCompare className="w-3 h-3"/>}
                      {t==="library"&&<Grid3X3 className="w-3 h-3"/>}
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px] max-w-xs">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500"/>
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search materials..."
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-8 pr-3 py-1.5 text-sm font-mono text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F97316]"/>
              </div>
              {/* Category filters */}
              <div className="flex flex-wrap gap-1.5">
                {CATEGORIES.map(cat => (
                  <button key={cat} onClick={() => setCatFilter(prev => prev.includes(cat)?prev.filter(c=>c!==cat):[...prev,cat])}
                    className="px-2.5 py-1 text-[11px] font-mono rounded-full border transition-colors"
                    style={catFilter.includes(cat)
                      ? { background:`${CAT_COLOR[cat]}20`, borderColor:`${CAT_COLOR[cat]}60`, color:CAT_COLOR[cat] }
                      : { background:"transparent", borderColor:"#374151", color:"#6B7280" }
                    }>
                    {cat}
                  </button>
                ))}
                {catFilter.length > 0 && (
                  <button onClick={() => setCatFilter([])} className="px-2.5 py-1 text-[11px] font-mono rounded-full border border-[#374151] text-gray-600 hover:text-white transition-colors">
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ─── Body ─── */}
          <div className="flex flex-1 overflow-hidden">

            {/* Left: material list */}
            <div className="w-[260px] flex-shrink-0 border-r border-[#1F2937] overflow-y-auto bg-[#0A0F1E]"
              style={{ scrollbarWidth:"thin", scrollbarColor:"#374151 transparent" }}>
              {Object.entries(byCategory).map(([cat, mats]) => (
                <div key={cat}>
                  <div className="px-3 py-2 flex items-center gap-2 sticky top-0 bg-[#0A0F1E] border-b border-[#1F2937]/40 z-10">
                    <div className="w-2 h-2 rounded-full" style={{ background:CAT_COLOR[cat as Category] }}/>
                    <span className="text-[10px] font-mono text-gray-400 uppercase tracking-wider">{cat}</span>
                    <span className="ml-auto text-[10px] font-mono text-gray-600">{mats.length}</span>
                  </div>
                  {mats.map(m => (
                    <div key={m.id}
                      className={`group flex items-center gap-2 px-3 py-2.5 border-b border-[#1F2937]/30 cursor-pointer transition-colors
                        ${detailId===m.id?"bg-[#1F2937]":"hover:bg-[#111827]"}
                        ${selected.has(m.id)?"border-l-2":"border-l-2 border-l-transparent"}`}
                      style={selected.has(m.id) ? { borderLeftColor: CAT_COLOR[m.category] } : {}}
                      onClick={() => setDetailId(m.id)}
                    >
                      {/* Compare checkbox */}
                      <button onClick={e => { e.stopPropagation(); toggleSelect(m.id); }}
                        className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors ${selected.has(m.id)?"border-transparent":"border-[#374151]"}`}
                        style={selected.has(m.id) ? { background: CAT_COLOR[m.category] } : {}}>
                        {selected.has(m.id) && <svg width="8" height="8" viewBox="0 0 8 8"><path d="M1.5 4L3.5 6L6.5 2" stroke="white" strokeWidth="1.5" fill="none" strokeLinecap="round"/></svg>}
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-semibold text-gray-200 truncate">{m.shortName}</div>
                        <div className="text-[10px] font-mono text-gray-600">Sy {m.Sy} MPa · ρ {m.density.toLocaleString()}</div>
                      </div>
                      <button onClick={e => { e.stopPropagation(); toggleStar(m.id); }} className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Star className="w-3.5 h-3.5" fill={starred.has(m.id)?"#F59E0B":"none"} color={starred.has(m.id)?"#F59E0B":"#6B7280"}/>
                      </button>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Right: main content */}
            <div className="flex-1 overflow-y-auto relative" style={{ scrollbarWidth:"thin", scrollbarColor:"#374151 transparent" }}>
              <AnimatePresence mode="wait">

                {/* ─── Charts tab ─── */}
                {tab === "charts" && (
                  <motion.div key="charts" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 space-y-5">
                    {/* Axis selectors */}
                    <div className="flex items-center gap-4 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">X-AXIS</span>
                        <select value={xAxis} onChange={e => setXAxis(e.target.value as AxisKey)}
                          className="bg-[#111827] border border-[#1F2937] rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#F97316]">
                          {AXIS_OPTIONS.map(a => <option key={a.key} value={a.key}>{a.label} ({a.unit})</option>)}
                        </select>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-gray-500">Y-AXIS</span>
                        <select value={yAxis} onChange={e => setYAxis(e.target.value as AxisKey)}
                          className="bg-[#111827] border border-[#1F2937] rounded px-2 py-1 text-xs font-mono text-white focus:outline-none focus:border-[#F97316]">
                          {AXIS_OPTIONS.map(a => <option key={a.key} value={a.key}>{a.label} ({a.unit})</option>)}
                        </select>
                      </div>
                      <div className="ml-auto flex flex-wrap gap-3">
                        {CATEGORIES.map(cat => (
                          <div key={cat} className="flex items-center gap-1.5 text-[10px] font-mono text-gray-400">
                            <div className="w-2.5 h-2.5 rounded-full" style={{ background:CAT_COLOR[cat] }}/>
                            {cat}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Primary Ashby scatter */}
                    <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
                      <div className="text-sm font-semibold mb-1" style={{ fontFamily:"Space Grotesk" }}>
                        {AXIS_OPTIONS.find(a=>a.key===yAxis)?.label} vs {AXIS_OPTIONS.find(a=>a.key===xAxis)?.label}
                      </div>
                      <div className="text-[10px] font-mono text-gray-500 mb-4">Ashby selection chart · Click a point to see detail</div>
                      <ResponsiveContainer width="100%" height={340}>
                        <ScatterChart margin={{ top:10, right:30, bottom:30, left:10 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937"/>
                          <XAxis type="number" dataKey="x" name={AXIS_OPTIONS.find(a=>a.key===xAxis)?.label}
                            label={{ value:`${AXIS_OPTIONS.find(a=>a.key===xAxis)?.label} (${AXIS_OPTIONS.find(a=>a.key===xAxis)?.unit})`, position:"bottom", offset:10, fill:"#6B7280", fontSize:11, fontFamily:"JetBrains Mono" }}
                            tick={{ fill:"#6B7280", fontSize:10, fontFamily:"JetBrains Mono" }} stroke="#374151"/>
                          <YAxis type="number" dataKey="y" name={AXIS_OPTIONS.find(a=>a.key===yAxis)?.label}
                            label={{ value:`${AXIS_OPTIONS.find(a=>a.key===yAxis)?.label} (${AXIS_OPTIONS.find(a=>a.key===yAxis)?.unit})`, angle:-90, position:"insideLeft", offset:10, fill:"#6B7280", fontSize:11, fontFamily:"JetBrains Mono" }}
                            tick={{ fill:"#6B7280", fontSize:10, fontFamily:"JetBrains Mono" }} stroke="#374151"/>
                          <Tooltip content={<AshbyTooltip xAxis={xAxis} yAxis={yAxis}/>}/>
                          {CATEGORIES.map(cat => {
                            const mats = filtered.filter(m => m.category === cat);
                            if (!mats.length) return null;
                            return (
                              <Scatter key={cat} name={cat}
                                data={mats.map(m => ({ ...m, x:getVal(m,xAxis), y:getVal(m,yAxis) }))}
                                fill={CAT_COLOR[cat]}>
                                {mats.map(m => (
                                  <Cell key={m.id} fill={selected.has(m.id) ? CAT_COLOR[cat] : `${CAT_COLOR[cat]}99`}
                                    stroke={detailId===m.id?"white":"transparent"} strokeWidth={2}
                                    onClick={() => setDetailId(m.id)}
                                    style={{ cursor:"pointer" }}/>
                                ))}
                              </Scatter>
                            );
                          })}
                        </ScatterChart>
                      </ResponsiveContainer>
                    </div>

                    {/* 2-column: preset Ashby plots */}
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                      {([
                        { xa:"density" as AxisKey, ya:"Sy" as AxisKey, title:"Strength–Weight" },
                        { xa:"density" as AxisKey, ya:"E"  as AxisKey, title:"Stiffness–Weight" },
                        { xa:"cost"    as AxisKey, ya:"specificStrength" as AxisKey, title:"Specific Strength vs Cost" },
                        { xa:"alpha"   as AxisKey, ya:"k"  as AxisKey, title:"Thermal Conductivity vs Expansion" },
                      ] as { xa:AxisKey; ya:AxisKey; title:string }[]).map(({ xa, ya, title }) => (
                        <div key={title} className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
                          <div className="text-xs font-semibold text-gray-300 mb-3" style={{ fontFamily:"Space Grotesk" }}>{title}</div>
                          <ResponsiveContainer width="100%" height={200}>
                            <ScatterChart margin={{ top:5, right:20, bottom:20, left:0 }}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#1F2937"/>
                              <XAxis type="number" dataKey="x" tick={{ fill:"#6B7280", fontSize:9, fontFamily:"JetBrains Mono" }} stroke="#374151"
                                label={{ value:`${AXIS_OPTIONS.find(a=>a.key===xa)?.label} (${AXIS_OPTIONS.find(a=>a.key===xa)?.unit})`, position:"bottom", offset:8, fill:"#6B7280", fontSize:9, fontFamily:"JetBrains Mono" }}/>
                              <YAxis type="number" dataKey="y" tick={{ fill:"#6B7280", fontSize:9, fontFamily:"JetBrains Mono" }} stroke="#374151"
                                label={{ value:AXIS_OPTIONS.find(a=>a.key===ya)?.unit, angle:-90, position:"insideLeft", fill:"#6B7280", fontSize:9, fontFamily:"JetBrains Mono" }}/>
                              <Tooltip content={<AshbyTooltip xAxis={xa} yAxis={ya}/>}/>
                              {CATEGORIES.map(cat => {
                                const mats = filtered.filter(m => m.category === cat);
                                if (!mats.length) return null;
                                return (
                                  <Scatter key={cat} data={mats.map(m => ({ ...m, x:getVal(m,xa), y:getVal(m,ya) }))} fill={CAT_COLOR[cat]}>
                                    {mats.map(m => <Cell key={m.id} fill={`${CAT_COLOR[cat]}CC`} onClick={() => setDetailId(m.id)} style={{ cursor:"pointer" }}/>)}
                                  </Scatter>
                                );
                              })}
                            </ScatterChart>
                          </ResponsiveContainer>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* ─── Compare tab ─── */}
                {tab === "compare" && (
                  <motion.div key="compare" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5 space-y-5">
                    {selectedMats.length < 2 ? (
                      <div className="flex flex-col items-center justify-center py-24 text-center">
                        <GitCompare className="w-12 h-12 text-gray-700 mb-4"/>
                        <p className="text-sm text-gray-500 font-mono mb-1">Select 2–3 materials from the list</p>
                        <p className="text-xs text-gray-600 font-mono">Click the checkboxes on the left to begin comparison</p>
                      </div>
                    ) : (
                      <>
                        {/* Material header pills */}
                        <div className="flex gap-3 flex-wrap">
                          {selectedMats.map((m,i) => (
                            <div key={m.id} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-mono"
                              style={{ borderColor:`${RADAR_COLORS[i]}40`, background:`${RADAR_COLORS[i]}10`, color:RADAR_COLORS[i] }}>
                              <div className="w-2 h-2 rounded-full" style={{ background:RADAR_COLORS[i] }}/>
                              {m.shortName}
                              <button onClick={() => toggleSelect(m.id)} className="text-gray-600 hover:text-white"><X className="w-3 h-3"/></button>
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
                          {/* Radar */}
                          <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4">
                            <div className="text-sm font-semibold mb-1" style={{ fontFamily:"Space Grotesk" }}>Performance Radar</div>
                            <div className="text-[10px] font-mono text-gray-500 mb-3">Normalized 0–100 per axis</div>
                            <ResponsiveContainer width="100%" height={300}>
                              <RadarChart data={radarData(selectedMats)} margin={{ top:10, right:30, bottom:10, left:30 }}>
                                <PolarGrid stroke="#1F2937"/>
                                <PolarAngleAxis dataKey="axis" tick={{ fill:"#9CA3AF", fontSize:10, fontFamily:"JetBrains Mono" }}/>
                                <PolarRadiusAxis angle={30} domain={[0,100]} tick={{ fill:"#4B5563", fontSize:9, fontFamily:"JetBrains Mono" }}/>
                                {selectedMats.map((m,i) => (
                                  <Radar key={m.id} name={m.shortName} dataKey={m.id}
                                    stroke={RADAR_COLORS[i]} fill={RADAR_COLORS[i]} fillOpacity={0.12}/>
                                ))}
                                <Legend wrapperStyle={{ fontSize:11, fontFamily:"JetBrains Mono", paddingTop:12 }}/>
                              </RadarChart>
                            </ResponsiveContainer>
                          </div>

                          {/* Property comparison table */}
                          <div className="bg-[#111827] border border-[#1F2937] rounded-xl overflow-hidden">
                            <div className="px-4 py-3 border-b border-[#1F2937]">
                              <div className="text-sm font-semibold" style={{ fontFamily:"Space Grotesk" }}>Property Comparison</div>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs font-mono">
                                <thead>
                                  <tr className="border-b border-[#1F2937]">
                                    <th className="px-4 py-2 text-left text-gray-500 font-medium">Property</th>
                                    {selectedMats.map((m,i) => (
                                      <th key={m.id} className="px-4 py-2 text-right font-medium" style={{ color:RADAR_COLORS[i] }}>{m.shortName}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {[
                                    { label:"Category",      fn:(m:MatEntry) => m.category,                    unit:"" },
                                    { label:"Density",       fn:(m:MatEntry) => m.density.toLocaleString(),    unit:"kg/m³" },
                                    { label:"Young's Mod.",  fn:(m:MatEntry) => m.E,                           unit:"GPa" },
                                    { label:"Yield Str.",    fn:(m:MatEntry) => m.Sy,                          unit:"MPa" },
                                    { label:"Ultimate Str.", fn:(m:MatEntry) => m.Su,                          unit:"MPa" },
                                    { label:"Specific Str.", fn:(m:MatEntry) => ((m.Sy/m.density)*1000).toFixed(1), unit:"kN·m/kg" },
                                    { label:"Poisson (ν)",   fn:(m:MatEntry) => m.nu,                          unit:"" },
                                    { label:"Thermal Cond.", fn:(m:MatEntry) => m.k,                           unit:"W/m·K" },
                                    { label:"Therm. Exp.",   fn:(m:MatEntry) => m.alpha,                       unit:"µm/m·°C" },
                                    { label:"Rel. Cost",     fn:(m:MatEntry) => `${m.cost}×`,                  unit:"" },
                                    { label:"Machinability", fn:(m:MatEntry) => `${m.machinability}/100`,       unit:"" },
                                    { label:"Weldability",   fn:(m:MatEntry) => `${m.weldability}/100`,         unit:"" },
                                    { label:"Corrosion Res.",fn:(m:MatEntry) => `${m.corrosionResistance}/100`, unit:"" },
                                  ].map(row => {
                                    const vals = selectedMats.map(m => row.fn(m));
                                    const numVals = vals.map(Number).filter(v => !isNaN(v));
                                    const maxV = Math.max(...numVals);
                                    const minV = Math.min(...numVals);
                                    return (
                                      <tr key={row.label} className="border-b border-[#1F2937]/40 hover:bg-[#1F2937]/20">
                                        <td className="px-4 py-2 text-gray-500">{row.label}</td>
                                        {selectedMats.map((m,i) => {
                                          const raw = row.fn(m);
                                          const num = Number(raw);
                                          const isBest = numVals.length > 1 && !isNaN(num) && num === maxV && maxV !== minV;
                                          const isWorst = numVals.length > 1 && !isNaN(num) && num === minV && maxV !== minV;
                                          return (
                                            <td key={m.id} className="px-4 py-2 text-right">
                                              <span className={`${isBest?"text-green-400 font-bold":isWorst?"text-red-400":"text-gray-300"}`}>
                                                {raw}{row.unit && typeof raw === "number" ? ` ${row.unit}` : ""}
                                              </span>
                                            </td>
                                          );
                                        })}
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}

                {/* ─── Library tab ─── */}
                {tab === "library" && (
                  <motion.div key="library" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }} className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                      {filtered.map((m, idx) => (
                        <motion.div key={m.id} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:idx*0.03 }}
                          className={`bg-[#111827] border rounded-xl overflow-hidden cursor-pointer transition-colors hover:border-[#374151] ${detailId===m.id?"border-[#F97316]/40":"border-[#1F2937]"}`}
                          onClick={() => setDetailId(m.id)}>
                          {/* Card header */}
                          <div className="px-4 py-3 flex items-center gap-3 border-b border-[#1F2937]"
                            style={{ background:`${CAT_COLOR[m.category]}08` }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
                              style={{ background:`${CAT_COLOR[m.category]}20` }}>
                              <FlaskConical className="w-4 h-4" style={{ color:CAT_COLOR[m.category] }}/>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-semibold text-white truncate" style={{ fontFamily:"Space Grotesk" }}>{m.name}</div>
                              <div className="text-[10px] font-mono" style={{ color:CAT_COLOR[m.category] }}>{m.category}</div>
                            </div>
                            <button onClick={e => { e.stopPropagation(); toggleStar(m.id); }}>
                              <Star className="w-4 h-4" fill={starred.has(m.id)?"#F59E0B":"none"} color={starred.has(m.id)?"#F59E0B":"#4B5563"}/>
                            </button>
                          </div>
                          {/* Properties grid */}
                          <div className="p-4 grid grid-cols-3 gap-2 mb-3">
                            <PropBadge label="Yield Str." value={m.Sy} unit="MPa" color={CAT_COLOR[m.category]}/>
                            <PropBadge label="Young's E" value={m.E} unit="GPa"/>
                            <PropBadge label="Density" value={m.density.toLocaleString()} unit="kg/m³"/>
                          </div>
                          {/* Trait bars */}
                          <div className="px-4 pb-4 space-y-2">
                            <TraitBar label="Machinability" value={m.machinability} color="#F97316"/>
                            <TraitBar label="Weldability" value={m.weldability} color="#60A5FA"/>
                            <TraitBar label="Corrosion Res." value={m.corrosionResistance} color="#22C55E"/>
                          </div>
                          <div className="px-4 pb-4 flex items-center gap-2">
                            <span className="text-[10px] font-mono text-gray-600 flex-1 truncate">{m.usage}</span>
                            <button onClick={e => { e.stopPropagation(); useInPlayground(m); }}
                              className="flex items-center gap-1 text-[10px] font-mono text-[#F97316] hover:text-white transition-colors px-2 py-1 rounded border border-[#F97316]/30 hover:bg-[#F97316]/10">
                              <Zap className="w-3 h-3"/> Use
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Detail drawer ─── */}
      <AnimatePresence>
        {detailMat && (
          <>
            <motion.div key="overlay" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
              className="fixed inset-0 bg-black/40 z-40" onClick={() => setDetailId(null)}/>
            <motion.div key="drawer"
              initial={{ x:"100%" }} animate={{ x:0 }} exit={{ x:"100%" }}
              transition={{ type:"spring", damping:28, stiffness:280 }}
              className="fixed right-0 top-0 bottom-0 w-[360px] bg-[#111827] border-l border-[#1F2937] z-50 overflow-y-auto flex flex-col"
              style={{ scrollbarWidth:"thin", scrollbarColor:"#374151 transparent" }}>
              {/* Drawer header */}
              <div className="px-5 py-4 border-b border-[#1F2937] flex items-start gap-3 flex-shrink-0"
                style={{ background:`${CAT_COLOR[detailMat.category]}08` }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background:`${CAT_COLOR[detailMat.category]}20` }}>
                  <FlaskConical className="w-5 h-5" style={{ color:CAT_COLOR[detailMat.category] }}/>
                </div>
                <div className="flex-1">
                  <div className="font-bold text-white" style={{ fontFamily:"Space Grotesk" }}>{detailMat.name}</div>
                  <div className="text-xs font-mono mt-0.5" style={{ color:CAT_COLOR[detailMat.category] }}>{detailMat.category}</div>
                  <div className="text-[11px] text-gray-500 font-mono mt-1">{detailMat.usage}</div>
                </div>
                <button onClick={() => setDetailId(null)} className="text-gray-500 hover:text-white"><X className="w-5 h-5"/></button>
              </div>

              <div className="flex-1 p-5 space-y-5">
                {/* Mechanical props */}
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wide mb-3">Mechanical Properties</div>
                  <div className="grid grid-cols-2 gap-2">
                    <PropBadge label="Yield Strength (Sy)" value={detailMat.Sy} unit="MPa" color={CAT_COLOR[detailMat.category]}/>
                    <PropBadge label="Ultimate Str. (Su)" value={detailMat.Su} unit="MPa" color="#60A5FA"/>
                    <PropBadge label="Young's Modulus (E)" value={detailMat.E} unit="GPa"/>
                    <PropBadge label="Poisson's Ratio (ν)" value={detailMat.nu}/>
                    <PropBadge label="Density (ρ)" value={detailMat.density.toLocaleString()} unit="kg/m³"/>
                    <PropBadge label="Specific Strength" value={((detailMat.Sy/detailMat.density)*1000).toFixed(1)} unit="kN·m/kg" color="#A78BFA"/>
                  </div>
                </div>

                {/* Thermal props */}
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wide mb-3">Thermal Properties</div>
                  <div className="grid grid-cols-2 gap-2">
                    <PropBadge label="Thermal Cond. (k)" value={detailMat.k} unit="W/m·K" color="#EF4444"/>
                    <PropBadge label="Thermal Exp. (α)" value={detailMat.alpha} unit="µm/m·°C"/>
                  </div>
                </div>

                {/* Processability bars */}
                <div>
                  <div className="text-[10px] font-mono text-gray-500 uppercase tracking-wide mb-3">Processability</div>
                  <div className="space-y-3">
                    <TraitBar label="Machinability" value={detailMat.machinability} color="#F97316"/>
                    <TraitBar label="Weldability" value={detailMat.weldability} color="#60A5FA"/>
                    <TraitBar label="Corrosion Resistance" value={detailMat.corrosionResistance} color="#22C55E"/>
                  </div>
                </div>

                {/* Cost */}
                <div className="bg-[#0A0F1E] border border-[#1F2937] rounded-lg p-3 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] font-mono text-gray-500 mb-0.5">Relative Cost Index</div>
                    <div className="text-lg font-bold font-mono text-amber-400">{detailMat.cost}×</div>
                    <div className="text-[10px] font-mono text-gray-600">vs 1045 Steel baseline</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-gray-500 mb-0.5">Typical Use</div>
                    <div className="text-xs text-gray-400 font-mono max-w-[140px] text-right">{detailMat.usage}</div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button onClick={() => useInPlayground(detailMat)}
                    className="w-full py-2.5 bg-[#F97316] text-white text-sm font-bold rounded-lg flex items-center justify-center gap-2 hover:bg-[#ea6c0f] transition-colors"
                    style={{ fontFamily:"Space Grotesk" }}>
                    <Zap className="w-4 h-4"/> Use in Playground
                  </button>
                  <div className="flex gap-2">
                    <button onClick={() => { toggleSelect(detailMat.id); if(tab!=="compare") setTab("compare"); }}
                      className={`flex-1 py-2 text-xs font-mono rounded-lg border flex items-center justify-center gap-2 transition-colors
                        ${selected.has(detailMat.id)?"border-[#A78BFA]/40 text-[#A78BFA] bg-[#A78BFA]/10":"border-[#374151] text-gray-400 hover:text-white"}`}>
                      <GitCompare className="w-3.5 h-3.5"/> {selected.has(detailMat.id)?"Added to Compare":"Add to Compare"}
                    </button>
                    <button onClick={() => toggleStar(detailMat.id)}
                      className={`px-3 py-2 rounded-lg border transition-colors ${starred.has(detailMat.id)?"border-amber-500/40 text-amber-400 bg-amber-500/10":"border-[#374151] text-gray-400 hover:text-amber-400"}`}>
                      <Star className="w-4 h-4" fill={starred.has(detailMat.id)?"currentColor":"none"}/>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
