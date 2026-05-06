import { useState, useMemo } from "react";
import { Link } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import {
  Menu, Search, Filter, ChevronRight, ChevronLeft, MessageSquare,
  MapPin, Star, X, TrendingUp, Users, Briefcase, CheckCircle,
  Building2, SlidersHorizontal, ExternalLink, Plus, Trash2, Clock
} from "lucide-react";
import toast from "react-hot-toast";

/* ─── Types ─── */
const STAGES = ["Shortlisted", "Screening Call", "Technical Interview", "Offer Extended", "Hired"] as const;
type Stage = typeof STAGES[number];

interface Candidate {
  id: string;
  name: string;
  initials: string;
  avatarColor: string;
  city: string;
  tfes: number;
  avgSF: number;
  domain: string;
  domains: string[];
  role: string;
  badges: number;
  sims: number;
  matchPct: number;
  tier: "Expert" | "Advanced" | "Intermediate";
  stage: Stage;
  addedDate: string;
  notes: string[];
  starred: boolean;
}

/* ─── Mock pipeline data ─── */
const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: "priya-sharma", name: "Priya Sharma", initials: "PS", avatarColor: "#7C3AED",
    city: "Mumbai", tfes: 97, avgSF: 3.12, domain: "FEA Structural",
    domains: ["FEA", "Thermal", "CAD"], role: "FEA Analyst",
    badges: 14, sims: 112, matchPct: 98, tier: "Expert",
    stage: "Shortlisted", addedDate: "2 days ago", notes: [], starred: true,
  },
  {
    id: "arjun-mehta", name: "Arjun Mehta", initials: "AM", avatarColor: "#0891B2",
    city: "Bangalore", tfes: 95, avgSF: 2.98, domain: "CFD Flow",
    domains: ["CFD", "Thermal", "Manufacturing"], role: "CFD Engineer",
    badges: 12, sims: 98, matchPct: 94, tier: "Expert",
    stage: "Screening Call", addedDate: "5 days ago", notes: ["Strong CFD background. Spoke for 30 min — excellent turbulence model knowledge."], starred: false,
  },
  {
    id: "divya-nair", name: "Divya Nair", initials: "DN", avatarColor: "#059669",
    city: "Chennai", tfes: 92, avgSF: 3.45, domain: "Thermal",
    domains: ["Thermal", "FEA", "Kinematics"], role: "Simulation Lead",
    badges: 11, sims: 87, matchPct: 91, tier: "Advanced",
    stage: "Technical Interview", addedDate: "8 days ago", notes: ["Excellent thermal analysis skills. Best SF (3.45x) we've seen this cycle.", "Interview scheduled for May 9 at 11:00 IST."], starred: true,
  },
  {
    id: "vikram-singh", name: "Vikram Singh", initials: "VS", avatarColor: "#D97706",
    city: "Delhi", tfes: 84, avgSF: 2.55, domain: "Kinematics",
    domains: ["Kinematics", "FEA", "CAD"], role: "Design Engineer",
    badges: 9, sims: 71, matchPct: 83, tier: "Advanced",
    stage: "Shortlisted", addedDate: "3 days ago", notes: [], starred: false,
  },
  {
    id: "ananya-krishnan", name: "Ananya Krishnan", initials: "AK", avatarColor: "#E11D48",
    city: "Pune", tfes: 81, avgSF: 2.88, domain: "CFD Flow",
    domains: ["CFD", "Thermal"], role: "R&D Engineer",
    badges: 7, sims: 64, matchPct: 79, tier: "Advanced",
    stage: "Offer Extended", addedDate: "14 days ago", notes: ["Verbal offer made on May 4. CTC: ₹18L. Awaiting written response by May 10."], starred: true,
  },
  {
    id: "rohan-gupta", name: "Rohan Gupta", initials: "RG", avatarColor: "#0D9488",
    city: "Ahmedabad", tfes: 76, avgSF: 2.21, domain: "FEA Structural",
    domains: ["FEA", "Manufacturing"], role: "Graduate Engineer",
    badges: 6, sims: 53, matchPct: 74, tier: "Intermediate",
    stage: "Shortlisted", addedDate: "1 day ago", notes: [], starred: false,
  },
  {
    id: "sneha-pillai", name: "Sneha Pillai", initials: "SP", avatarColor: "#9333EA",
    city: "Kolkata", tfes: 73, avgSF: 2.34, domain: "Thermal",
    domains: ["Thermal", "CFD"], role: "Simulation Lead",
    badges: 5, sims: 48, matchPct: 71, tier: "Intermediate",
    stage: "Screening Call", addedDate: "6 days ago", notes: ["Follow-up call scheduled for May 8. Awaiting portfolio PDF."], starred: false,
  },
  {
    id: "karan-malhotra", name: "Karan Malhotra", initials: "KM", avatarColor: "#B45309",
    city: "Jaipur", tfes: 88, avgSF: 2.76, domain: "FEA Structural",
    domains: ["FEA", "Kinematics", "CAD"], role: "FEA Analyst",
    badges: 10, sims: 79, matchPct: 87, tier: "Expert",
    stage: "Hired", addedDate: "21 days ago", notes: ["Offer accepted May 2. Start date June 1. Joining as Sr. FEA Analyst."], starred: false,
  },
  {
    id: "meera-reddy", name: "Meera Reddy", initials: "MR", avatarColor: "#0369A1",
    city: "Hyderabad", tfes: 79, avgSF: 2.61, domain: "Kinematics",
    domains: ["Kinematics", "Manufacturing", "CAD"], role: "Design Engineer",
    badges: 7, sims: 61, matchPct: 77, tier: "Advanced",
    stage: "Shortlisted", addedDate: "4 days ago", notes: [], starred: false,
  },
  {
    id: "ajay-varma", name: "Ajay Varma", initials: "AV", avatarColor: "#047857",
    city: "Bangalore", tfes: 91, avgSF: 3.08, domain: "CFD Flow",
    domains: ["CFD", "FEA", "Thermal"], role: "CFD Engineer",
    badges: 11, sims: 83, matchPct: 89, tier: "Expert",
    stage: "Technical Interview", addedDate: "10 days ago", notes: ["Panel interview done. Strong on CFD. Pending manager approval."], starred: true,
  },
];

const STAGE_META: Record<Stage, { color: string; border: string; bg: string; icon: typeof CheckCircle; label: string }> = {
  "Shortlisted":         { color: "#60A5FA", border: "border-blue-500/30",   bg: "bg-blue-500/5",   icon: Star,          label: "Shortlisted" },
  "Screening Call":      { color: "#F59E0B", border: "border-amber-500/30",  bg: "bg-amber-500/5",  icon: Clock,         label: "Screening Call" },
  "Technical Interview": { color: "#F97316", border: "border-orange-500/30", bg: "bg-orange-500/5", icon: Briefcase,     label: "Technical Interview" },
  "Offer Extended":      { color: "#A78BFA", border: "border-violet-500/30", bg: "bg-violet-500/5", icon: TrendingUp,    label: "Offer Extended" },
  "Hired":               { color: "#22C55E", border: "border-green-500/30",  bg: "bg-green-500/5",  icon: CheckCircle,   label: "Hired" },
};

const TIER_COLOR: Record<string, string> = {
  Expert: "#F97316", Advanced: "#60A5FA", Intermediate: "#9CA3AF",
};

const ALL_DOMAINS = ["FEA", "CFD", "Thermal", "Kinematics", "CAD", "Manufacturing"];

/* ─── Note editor ─── */
function NoteEditor({ notes, onSave, onClose }: { notes: string[]; onSave: (n: string[]) => void; onClose: () => void }) {
  const [list, setList] = useState([...notes]);
  const [draft, setDraft] = useState("");

  const add = () => {
    if (!draft.trim()) return;
    setList(prev => [...prev, draft.trim()]);
    setDraft("");
  };

  return (
    <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
      className="absolute left-0 right-0 top-full mt-1 z-30 bg-[#0D1424] border border-[#374151] rounded-lg p-3 shadow-xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-mono text-gray-400">Team Notes</span>
        <button onClick={() => { onSave(list); onClose(); }} className="text-[10px] text-[#F97316] font-mono hover:underline">Save & close</button>
      </div>
      <div className="space-y-1.5 mb-2 max-h-32 overflow-y-auto">
        {list.map((n, i) => (
          <div key={i} className="flex items-start gap-2 group">
            <p className="flex-1 text-[11px] text-gray-300 leading-relaxed bg-[#1F2937] rounded px-2 py-1">{n}</p>
            <button onClick={() => setList(prev => prev.filter((_, j) => j !== i))} className="opacity-0 group-hover:opacity-100 mt-1"><Trash2 className="w-3 h-3 text-red-400" /></button>
          </div>
        ))}
        {list.length === 0 && <p className="text-[11px] text-gray-600 font-mono italic">No notes yet</p>}
      </div>
      <div className="flex gap-1.5">
        <input value={draft} onChange={e => setDraft(e.target.value)} onKeyDown={e => e.key === "Enter" && add()}
          placeholder="Add note... (Enter to add)"
          className="flex-1 bg-[#1F2937] border border-[#374151] rounded px-2 py-1 text-[11px] text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F97316] font-mono"
        />
        <button onClick={add} className="px-2 py-1 bg-[#F97316] text-white rounded text-[11px]"><Plus className="w-3 h-3" /></button>
      </div>
    </motion.div>
  );
}

/* ─── Candidate card ─── */
function CandidateCard({
  candidate, onMove, onStar, onUpdateNotes,
}: {
  candidate: Candidate;
  onMove: (id: string, dir: 1 | -1) => void;
  onStar: (id: string) => void;
  onUpdateNotes: (id: string, notes: string[]) => void;
}) {
  const [noteOpen, setNoteOpen] = useState(false);
  const stageIdx = STAGES.indexOf(candidate.stage);
  const matchColor = candidate.matchPct >= 85 ? "#22C55E" : candidate.matchPct >= 70 ? "#F97316" : "#6B7280";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="bg-[#111827] border border-[#1F2937] hover:border-[#374151] rounded-xl p-4 relative group transition-colors"
      data-testid={`card-${candidate.id}`}
    >
      {/* Top row */}
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
          style={{ background: candidate.avatarColor, fontFamily: "Space Grotesk" }}>
          {candidate.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-sm font-semibold text-white truncate" style={{ fontFamily: "Space Grotesk" }}>{candidate.name}</span>
            {candidate.starred && <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-gray-500 font-mono mt-0.5">
            <MapPin className="w-2.5 h-2.5" />{candidate.city}
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <div className="font-mono text-sm font-bold text-white">{candidate.tfes}</div>
          <div className="text-[9px] text-gray-500 font-mono">TFES</div>
        </div>
      </div>

      {/* Metrics row */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border"
          style={{ color: TIER_COLOR[candidate.tier], borderColor: `${TIER_COLOR[candidate.tier]}40`, background: `${TIER_COLOR[candidate.tier]}15` }}>
          {candidate.tier}
        </span>
        <span className="text-[10px] font-mono text-gray-400">SF {candidate.avgSF.toFixed(2)}x</span>
        <span className="ml-auto text-[10px] font-mono font-bold" style={{ color: matchColor }}>{candidate.matchPct}% match</span>
      </div>

      {/* Domain tags */}
      <div className="flex flex-wrap gap-1 mb-3">
        {candidate.domains.map(d => (
          <span key={d} className="text-[9px] px-1.5 py-0.5 rounded bg-[#1F2937] text-gray-400 font-mono border border-[#374151]/50">{d}</span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-3 text-[10px] font-mono text-gray-500 mb-3">
        <span>{candidate.sims} sims</span>
        <span>·</span>
        <span>{candidate.badges} badges</span>
        <span>·</span>
        <span>{candidate.addedDate}</span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {/* View profile */}
        <Link href={`/portfolio/${candidate.name.toLowerCase().replace(" ", ".")}`}
          className="flex items-center gap-1 text-[10px] px-2 py-1 border border-[#374151] text-gray-400 hover:text-white rounded transition-colors font-mono"
          data-testid={`btn-profile-${candidate.id}`}
        >
          <ExternalLink className="w-2.5 h-2.5" /> Profile
        </Link>

        {/* Notes */}
        <button onClick={() => setNoteOpen(o => !o)}
          className={`flex items-center gap-1 text-[10px] px-2 py-1 border rounded transition-colors font-mono ${noteOpen ? "border-[#F97316]/50 text-[#F97316]" : "border-[#374151] text-gray-400 hover:text-white"}`}
          data-testid={`btn-notes-${candidate.id}`}
        >
          <MessageSquare className="w-2.5 h-2.5" />
          {candidate.notes.length > 0 && <span className="text-[9px]">{candidate.notes.length}</span>}
        </button>

        {/* Star */}
        <button onClick={() => onStar(candidate.id)}
          className={`text-[10px] px-2 py-1 border rounded transition-colors ${candidate.starred ? "border-amber-500/40 text-amber-400" : "border-[#374151] text-gray-400 hover:text-amber-400"}`}
          data-testid={`btn-star-${candidate.id}`}
        >
          <Star className={`w-2.5 h-2.5 ${candidate.starred ? "fill-amber-400" : ""}`} />
        </button>

        {/* Move back */}
        {stageIdx > 0 && (
          <button onClick={() => onMove(candidate.id, -1)}
            className="text-[10px] px-2 py-1 border border-[#374151] text-gray-500 hover:text-white rounded transition-colors"
            data-testid={`btn-back-${candidate.id}`}
          >
            <ChevronLeft className="w-2.5 h-2.5" />
          </button>
        )}

        {/* Move forward */}
        {stageIdx < STAGES.length - 1 && (
          <button onClick={() => onMove(candidate.id, 1)}
            className="flex items-center gap-1 text-[10px] px-2 py-1 bg-[#F97316]/15 border border-[#F97316]/30 text-[#F97316] hover:bg-[#F97316]/25 rounded transition-colors font-mono ml-auto"
            data-testid={`btn-advance-${candidate.id}`}
          >
            {STAGES[stageIdx + 1].split(" ")[0]} <ChevronRight className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {/* Note editor dropdown */}
      <AnimatePresence>
        {noteOpen && (
          <NoteEditor
            notes={candidate.notes}
            onSave={n => onUpdateNotes(candidate.id, n)}
            onClose={() => setNoteOpen(false)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

/* ─── Stage column ─── */
function StageColumn({
  stage, candidates, onMove, onStar, onUpdateNotes,
}: {
  stage: Stage;
  candidates: Candidate[];
  onMove: (id: string, dir: 1 | -1) => void;
  onStar: (id: string) => void;
  onUpdateNotes: (id: string, notes: string[]) => void;
}) {
  const meta = STAGE_META[stage];
  const Icon = meta.icon;
  const avgTFES = candidates.length > 0
    ? Math.round(candidates.reduce((a, c) => a + c.tfes, 0) / candidates.length) : null;

  return (
    <div className="flex flex-col min-w-[280px] max-w-[300px] flex-shrink-0">
      {/* Column header */}
      <div className={`rounded-t-xl border ${meta.border} ${meta.bg} px-4 py-3 mb-2`}>
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 flex-shrink-0" style={{ color: meta.color }} />
          <span className="text-sm font-semibold text-white flex-1" style={{ fontFamily: "Space Grotesk" }}>{stage}</span>
          <span className="font-mono text-xs px-1.5 py-0.5 rounded-full border text-white"
            style={{ background: `${meta.color}20`, borderColor: `${meta.color}40`, color: meta.color }}>
            {candidates.length}
          </span>
        </div>
        {avgTFES && (
          <div className="text-[10px] font-mono text-gray-500 mt-1">Avg TFES: <span style={{ color: meta.color }}>{avgTFES}</span></div>
        )}
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 flex-1">
        <AnimatePresence mode="popLayout">
          {candidates.map(c => (
            <CandidateCard key={c.id} candidate={c} onMove={onMove} onStar={onStar} onUpdateNotes={onUpdateNotes} />
          ))}
        </AnimatePresence>
        {candidates.length === 0 && (
          <div className="border border-dashed border-[#1F2937] rounded-xl p-6 text-center">
            <p className="text-xs text-gray-600 font-mono">No candidates</p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Main page ─── */
export default function TalentPipeline() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [candidates, setCandidates] = useState<Candidate[]>(INITIAL_CANDIDATES);
  const [search, setSearch] = useState("");
  const [domainFilter, setDomainFilter] = useState<string | null>(null);
  const [minTFES, setMinTFES] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = useMemo(() => candidates.filter(c => {
    if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (domainFilter && !c.domains.includes(domainFilter)) return false;
    if (c.tfes < minTFES) return false;
    return true;
  }), [candidates, search, domainFilter, minTFES]);

  const byStage = useMemo(() => {
    const map = {} as Record<Stage, Candidate[]>;
    STAGES.forEach(s => { map[s] = []; });
    filtered.forEach(c => map[c.stage].push(c));
    return map;
  }, [filtered]);

  const totalPipeline = candidates.length;
  const avgTFES = Math.round(candidates.reduce((a, c) => a + c.tfes, 0) / candidates.length);
  const offersOut = candidates.filter(c => c.stage === "Offer Extended").length;
  const hired = candidates.filter(c => c.stage === "Hired").length;

  const moveCandidate = (id: string, dir: 1 | -1) => {
    setCandidates(prev => prev.map(c => {
      if (c.id !== id) return c;
      const idx = STAGES.indexOf(c.stage);
      const next = STAGES[idx + dir];
      if (!next) return c;
      toast(`${c.name} → ${next}`, { style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });
      return { ...c, stage: next };
    }));
  };

  const toggleStar = (id: string) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, starred: !c.starred } : c));
  };

  const updateNotes = (id: string, notes: string[]) => {
    setCandidates(prev => prev.map(c => c.id === id ? { ...c, notes } : c));
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <div className="p-6 space-y-5">

          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div>
                  <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>Talent Pipeline</h1>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">Hiring dashboard · FEA Analyst — Q2 2025</p>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-mono text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/20 px-2.5 py-1 rounded ml-2">
                  <Building2 className="w-3 h-3" /> Bharat Engineering Ltd.
                </div>
              </div>
            </div>
            <button
              onClick={() => toast("⚙️ Export to ATS coming soon!", { style: { background: "#1F2937", color: "#F9FAFB" } })}
              className="hidden md:flex items-center gap-2 text-xs px-3 py-2 border border-[#374151] text-gray-400 hover:text-white rounded transition-colors font-mono"
              data-testid="btn-export-ats"
            >
              Export to ATS
            </button>
          </motion.div>

          {/* Stats strip */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {[
              { label: "In Pipeline", value: String(totalPipeline), icon: Users, color: "#60A5FA" },
              { label: "Avg TFES Score", value: String(avgTFES), icon: TrendingUp, color: "#F97316" },
              { label: "Offers Extended", value: String(offersOut), icon: Briefcase, color: "#A78BFA" },
              { label: "Hired This Cycle", value: String(hired), icon: CheckCircle, color: "#22C55E" },
            ].map(s => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: `${s.color}15`, border: `1px solid ${s.color}30` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="font-mono text-xl font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-gray-500">{s.label}</div>
                  </div>
                </div>
              );
            })}
          </motion.div>

          {/* Search + filter bar */}
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="Search candidates by name..."
                  className="w-full bg-[#111827] border border-[#1F2937] rounded-lg pl-10 pr-4 py-2 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-[#F97316] font-mono"
                  data-testid="input-search"
                />
                {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-gray-500" /></button>}
              </div>
              <button onClick={() => setShowFilters(o => !o)}
                className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors ${showFilters ? "bg-[#F97316]/10 border-[#F97316]/40 text-[#F97316]" : "border-[#1F2937] text-gray-400 hover:text-white"}`}
                data-testid="btn-toggle-filters"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filters {(domainFilter || minTFES > 0) ? "•" : ""}
              </button>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-4 flex flex-wrap items-end gap-5">
                    {/* Domain filter */}
                    <div>
                      <div className="text-xs text-gray-400 font-mono mb-2">Domain</div>
                      <div className="flex flex-wrap gap-1.5">
                        {ALL_DOMAINS.map(d => (
                          <button key={d} onClick={() => setDomainFilter(domainFilter === d ? null : d)}
                            className={`px-2.5 py-1 text-xs rounded border font-mono transition-colors ${domainFilter === d ? "bg-[#F97316]/15 border-[#F97316]/40 text-[#F97316]" : "border-[#374151] text-gray-400 hover:text-white"}`}
                            data-testid={`filter-domain-${d.toLowerCase()}`}
                          >{d}</button>
                        ))}
                      </div>
                    </div>
                    {/* TFES filter */}
                    <div className="min-w-[180px]">
                      <div className="flex justify-between text-xs font-mono mb-1.5">
                        <span className="text-gray-400">Min TFES</span>
                        <span className="text-[#F97316]">{minTFES || "Any"}</span>
                      </div>
                      <input type="range" min={0} max={100} step={5} value={minTFES}
                        onChange={e => setMinTFES(+e.target.value)}
                        className="w-full accent-orange-500"
                        data-testid="filter-tfes"
                      />
                    </div>
                    <button onClick={() => { setDomainFilter(null); setMinTFES(0); }}
                      className="text-xs text-gray-500 hover:text-white font-mono"
                      data-testid="btn-clear-filters"
                    >Clear filters</button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Kanban board */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
            <div className="flex gap-4 overflow-x-auto pb-6" style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>
              {STAGES.map(stage => (
                <StageColumn
                  key={stage}
                  stage={stage}
                  candidates={byStage[stage]}
                  onMove={moveCandidate}
                  onStar={toggleStar}
                  onUpdateNotes={updateNotes}
                />
              ))}
            </div>
          </motion.div>

          {/* Legend footer */}
          <div className="flex flex-wrap items-center gap-4 text-[10px] font-mono text-gray-600 pt-2 border-t border-[#1F2937]">
            <span>Pipeline: Bharat Engineering Ltd. · FEA Analyst Role · Q2 2025</span>
            <span className="ml-auto">All TFES scores are cryptographically verified on Polygon PoS</span>
          </div>
        </div>
      </div>
    </div>
  );
}
