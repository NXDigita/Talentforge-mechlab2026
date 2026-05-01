import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { ContributionHeatmap } from "@/components/ContributionHeatmap";
import { currentUser } from "@/data/mockData";
import { Menu, Star, GitFork, Search, Upload, X, CheckCircle, Loader, FileText, AlertCircle } from "lucide-react";

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

const ACCEPTED_EXTS = [".step", ".stp", ".dxf", ".iges", ".stl"];

const PIPELINE_STAGES = [
  { id: "validate", label: "File Validation", detail: "Checking format & integrity", duration: 1400 },
  { id: "parse", label: "Geometry Parsing", detail: "Extracting B-Rep entities", duration: 1800 },
  { id: "mesh", label: "Mesh Preview", detail: "Generating surface tessellation", duration: 2200 },
  { id: "analyze", label: "Design Analysis", detail: "Extracting faces, edges & volumes", duration: 1600 },
  { id: "index", label: "Repository Index", detail: "Writing metadata & committing", duration: 900 },
];

type StageState = "pending" | "running" | "done" | "error";

interface PipelineStage {
  id: string;
  label: string;
  detail: string;
  state: StageState;
  log?: string;
}

interface UploadedFile {
  name: string;
  size: string;
  ext: string;
  faces: number;
  edges: number;
  volume: string;
  ts: string;
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1048576).toFixed(2)} MB`;
}

function FileUploadModal({ onClose, onComplete }: { onClose: () => void; onComplete: (f: UploadedFile) => void }) {
  const [dragOver, setDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [stages, setStages] = useState<PipelineStage[]>([]);
  const [phase, setPhase] = useState<"drop" | "pipeline" | "done">("drop");
  const inputRef = useRef<HTMLInputElement>(null);

  const STAGE_LOGS: Record<string, string> = {
    validate: "✓ STEP AP214 format confirmed, no corruption",
    parse: "✓ 847 faces, 1,284 edges, 312 vertices parsed",
    mesh: "✓ 42,800 surface triangles generated (quality: 0.94)",
    analyze: "✓ Volume: 218.4 cm³, Bounding box: 240×180×95 mm",
    index: "✓ Committed to @raj.kumar/vault — ref: a8c3f2b",
  };

  const handleFile = useCallback((f: File) => {
    const ext = "." + f.name.split(".").pop()!.toLowerCase();
    if (!ACCEPTED_EXTS.includes(ext)) {
      setError(`Unsupported format. Accepted: ${ACCEPTED_EXTS.join(", ")}`);
      return;
    }
    setError("");
    setFile(f);
    startPipeline(f);
  }, []);

  const startPipeline = (f: File) => {
    setPhase("pipeline");
    const init: PipelineStage[] = PIPELINE_STAGES.map(s => ({ ...s, state: "pending" as StageState }));
    setStages(init);

    let delay = 300;
    PIPELINE_STAGES.forEach((stage, i) => {
      setTimeout(() => {
        setStages(prev => prev.map((s, idx) => idx === i ? { ...s, state: "running" } : s));
      }, delay);
      delay += stage.duration;
      setTimeout(() => {
        setStages(prev => prev.map((s, idx) => idx === i ? { ...s, state: "done", log: STAGE_LOGS[stage.id] } : s));
        if (i === PIPELINE_STAGES.length - 1) {
          setTimeout(() => {
            setPhase("done");
            onComplete({
              name: f.name.replace(/\.[^/.]+$/, ""),
              size: formatBytes(f.size || 2_340_000),
              ext: "." + f.name.split(".").pop()!.toUpperCase(),
              faces: 847,
              edges: 1284,
              volume: "218.4 cm³",
              ts: new Date().toLocaleString(),
            });
          }, 600);
        }
      }, delay);
      delay += 200;
    });
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, [handleFile]);

  const totalDuration = PIPELINE_STAGES.reduce((a, s) => a + s.duration + 200, 300);
  const doneCount = stages.filter(s => s.state === "done").length;
  const progress = stages.length ? Math.round((doneCount / stages.length) * 100) : 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget && phase !== "pipeline") onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-lg overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1F2937]">
          <div>
            <div className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Upload Design File</div>
            <div className="text-xs text-gray-500 font-mono mt-0.5">STEP · DXF · IGES · STL</div>
          </div>
          {phase !== "pipeline" && (
            <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors" data-testid="btn-close-upload"><X className="w-5 h-5" /></button>
          )}
        </div>

        <div className="p-6">
          {/* Drop zone */}
          {phase === "drop" && (
            <div>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-all ${dragOver ? "border-[#F97316] bg-[#F97316]/5" : "border-[#374151] hover:border-[#F97316]/60 hover:bg-[#F97316]/5"}`}
                data-testid="dropzone"
              >
                <input
                  ref={inputRef}
                  type="file"
                  accept=".step,.stp,.dxf,.iges,.stl"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  data-testid="input-file-upload"
                />
                <motion.div animate={dragOver ? { scale: 1.1 } : { scale: 1 }} transition={{ duration: 0.15 }}>
                  <Upload className={`w-10 h-10 mx-auto mb-4 transition-colors ${dragOver ? "text-[#F97316]" : "text-gray-500"}`} />
                </motion.div>
                <div className="text-sm font-semibold text-white mb-1">
                  {dragOver ? "Drop it!" : "Drag & drop your design file"}
                </div>
                <div className="text-xs text-gray-500 mb-4">or click to browse</div>
                <div className="flex gap-2 justify-center flex-wrap">
                  {ACCEPTED_EXTS.map(ext => (
                    <span key={ext} className="px-2 py-0.5 bg-[#1F2937] text-gray-400 text-xs font-mono rounded border border-[#374151]">{ext.toUpperCase()}</span>
                  ))}
                </div>
              </div>
              {error && (
                <div className="mt-3 flex items-center gap-2 text-red-400 text-xs font-mono bg-red-500/10 border border-red-500/20 rounded p-3">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
                </div>
              )}
              <p className="text-xs text-gray-600 text-center mt-4 font-mono">Max 50 MB · Encrypted at rest · Private by default</p>
            </div>
          )}

          {/* Pipeline */}
          {(phase === "pipeline" || phase === "done") && file && (
            <div>
              {/* File info row */}
              <div className="flex items-center gap-3 mb-5 p-3 bg-[#0A0F1E] border border-[#1F2937] rounded-lg">
                <FileText className="w-8 h-8 text-[#60A5FA] flex-shrink-0" />
                <div className="min-w-0">
                  <div className="font-mono text-sm text-white truncate">{file.name}</div>
                  <div className="text-xs text-gray-500 font-mono">{formatBytes(file.size || 2_340_000)}</div>
                </div>
                {phase === "done" && <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 ml-auto" />}
              </div>

              {/* Progress bar */}
              <div className="mb-5">
                <div className="flex justify-between text-xs font-mono text-gray-400 mb-1.5">
                  <span>{phase === "done" ? "Ingestion complete" : "Ingesting design..."}</span>
                  <span className={phase === "done" ? "text-green-400" : "text-[#F97316]"}>{progress}%</span>
                </div>
                <div className="h-1.5 bg-[#1F2937] rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full ${phase === "done" ? "bg-green-400" : "bg-[#F97316]"}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Stage list */}
              <div className="space-y-2">
                {stages.map((stage, i) => (
                  <motion.div
                    key={stage.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                      stage.state === "done" ? "border-green-500/20 bg-green-500/5" :
                      stage.state === "running" ? "border-[#F97316]/30 bg-[#F97316]/5" :
                      "border-[#1F2937] bg-transparent"
                    }`}
                  >
                    <div className="mt-0.5 flex-shrink-0">
                      {stage.state === "done" && <CheckCircle className="w-4 h-4 text-green-400" />}
                      {stage.state === "running" && <Loader className="w-4 h-4 text-[#F97316] animate-spin" />}
                      {stage.state === "pending" && <div className="w-4 h-4 rounded-full border border-[#374151]" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className={`text-xs font-semibold transition-colors ${
                        stage.state === "done" ? "text-green-400" :
                        stage.state === "running" ? "text-[#F97316]" :
                        "text-gray-500"
                      }`}>{stage.label}</div>
                      <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                        {stage.state === "done" && stage.log ? stage.log : stage.detail}
                      </div>
                    </div>
                    {stage.state === "running" && (
                      <div className="flex gap-0.5 mt-1 flex-shrink-0">
                        {[0,1,2].map(j => (
                          <motion.div
                            key={j}
                            className="w-1 h-1 rounded-full bg-[#F97316]"
                            animate={{ opacity: [0.3, 1, 0.3] }}
                            transition={{ duration: 0.9, repeat: Infinity, delay: j * 0.2 }}
                          />
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Done state CTA */}
              <AnimatePresence>
                {phase === "done" && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-5"
                  >
                    <div className="text-center mb-4">
                      <div className="inline-flex items-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 text-sm px-4 py-2 rounded-full font-mono">
                        <CheckCircle className="w-4 h-4" /> Design added to your vault
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 py-2.5 text-sm font-semibold bg-[#F97316] text-white rounded hover:bg-[#ea6c0f] transition-colors"
                        data-testid="btn-view-in-vault"
                      >
                        View in Vault
                      </button>
                      <button
                        onClick={() => { setPhase("drop"); setFile(null); setStages([]); }}
                        className="px-4 py-2.5 text-sm border border-[#374151] text-gray-400 hover:text-white rounded transition-colors"
                        data-testid="btn-upload-another"
                      >
                        Upload Another
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function DesignVault() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<typeof TABS[number]>("Overview");
  const [search, setSearch] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);

  const ALL_REPOS = [
    ...PINNED,
    ...uploadedFiles.map(f => ({
      id: `uploaded-${f.name}`,
      name: f.name,
      desc: `Uploaded ${f.ext} file — ${f.faces} faces, ${f.edges} edges, Vol ${f.volume}`,
      score: 0,
      sf: null,
      stars: 0,
      forks: 0,
      domain: "CAD",
      isNew: true,
    })),
  ];

  const filtered = ALL_REPOS.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.desc.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <AnimatePresence>
        {showUpload && (
          <FileUploadModal
            onClose={() => setShowUpload(false)}
            onComplete={f => setUploadedFiles(prev => [f, ...prev])}
          />
        )}
      </AnimatePresence>

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
                <div className="grid grid-cols-3 gap-2 text-center text-xs border-t border-[#1F2937] pt-3 mb-4">
                  <div><div className="font-mono font-bold text-white">{currentUser.sims}</div><div className="text-gray-500">Sims</div></div>
                  <div><div className="font-mono font-bold text-white">{currentUser.badges}</div><div className="text-gray-500">Badges</div></div>
                  <div><div className="font-mono font-bold text-green-400">{currentUser.avgSF}x</div><div className="text-gray-500">Avg SF</div></div>
                </div>
                {/* Upload CTA in sidebar */}
                <button
                  onClick={() => setShowUpload(true)}
                  className="w-full py-2 text-sm font-semibold bg-[#F97316] text-white rounded hover:bg-[#ea6c0f] transition-colors flex items-center justify-center gap-2"
                  data-testid="btn-upload-sidebar"
                >
                  <Upload className="w-4 h-4" /> Upload Design
                </button>
              </div>
            </div>

            {/* Right content */}
            <div>
              <div className="flex items-center justify-between mb-0">
                <div className="flex gap-1 border-b border-[#1F2937] flex-1">
                  {TABS.map(t => (
                    <button key={t} onClick={() => setActiveTab(t)}
                      className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${activeTab === t ? "border-[#F97316] text-[#F97316]" : "border-transparent text-gray-400 hover:text-white"}`}
                      data-testid={`tab-vault-${t.toLowerCase()}`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              <div className="mt-6">
                {activeTab === "Overview" && (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>Simulation Activity</h3>
                      <ContributionHeatmap />
                    </div>

                    {/* Uploaded files banner */}
                    <AnimatePresence>
                      {uploadedFiles.length > 0 && (
                        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                          <div className="flex items-center gap-2 mb-3 text-green-400 font-semibold text-sm">
                            <CheckCircle className="w-4 h-4" /> {uploadedFiles.length} file{uploadedFiles.length > 1 ? "s" : ""} recently ingested
                          </div>
                          <div className="space-y-2">
                            {uploadedFiles.map(f => (
                              <div key={f.name} className="flex items-center gap-3 text-xs font-mono">
                                <FileText className="w-3.5 h-3.5 text-[#60A5FA]" />
                                <span className="text-[#60A5FA]">{f.name}{f.ext.toLowerCase()}</span>
                                <span className="text-gray-500">{f.size}</span>
                                <span className="text-gray-600">·</span>
                                <span className="text-gray-500">{f.faces} faces, Vol {f.volume}</span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Pinned Projects</h3>
                        <button
                          onClick={() => setShowUpload(true)}
                          className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-[#111827] border border-[#1F2937] hover:border-[#F97316] text-gray-400 hover:text-[#F97316] rounded transition-colors"
                          data-testid="btn-upload-overview"
                        >
                          <Upload className="w-3 h-3" /> Upload Design
                        </button>
                      </div>
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
                      <button
                        onClick={() => setShowUpload(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded hover:bg-[#ea6c0f] transition-colors whitespace-nowrap"
                        data-testid="btn-upload-repos"
                      >
                        <Upload className="w-4 h-4" /> Upload
                      </button>
                    </div>
                    <div className="space-y-2">
                      {filtered.map(r => (
                        <Link
                          key={r.id}
                          href={"isNew" in r && r.isNew ? "#" : `/designvault/${r.id}`}
                          className="flex items-center justify-between bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg px-4 py-3 transition-colors"
                          data-testid={`row-repo-${r.id}`}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-[#60A5FA] text-sm">{r.name}</span>
                              {"isNew" in r && r.isNew && (
                                <span className="text-[10px] px-1.5 py-0.5 bg-green-500/15 text-green-400 border border-green-500/20 rounded font-mono">NEW</span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-0.5">{r.desc}</p>
                          </div>
                          <div className="flex items-center gap-3 text-xs font-mono text-gray-400">
                            <span className="px-1.5 py-0.5 bg-blue-500/10 text-blue-400 rounded">{r.domain}</span>
                            {r.score > 0 && <span>{r.score}/100</span>}
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
          </div>
        </motion.div>
      </div>
    </div>
  );
}
