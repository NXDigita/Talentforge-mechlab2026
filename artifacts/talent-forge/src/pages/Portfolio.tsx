import { useState } from "react";
import { useParams } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { TFESGauge } from "@/components/TFESGauge";
import { StatusPill } from "@/components/StatusPill";
import { SFBadge } from "@/components/SFBadge";
import { currentUser, simulations, nftBadges, leaderboard } from "@/data/mockData";
import {
  Shield, ExternalLink, Share2, Briefcase, User, CheckCircle,
  ChevronDown, Send, Calendar, Download, Star, Users,
  Building2, MapPin, Target, Zap, TrendingUp, X, Clock
} from "lucide-react";
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer } from "recharts";
import toast from "react-hot-toast";

const showToast = (msg = "⚙️ Simulation feature live soon!") =>
  toast(msg, { style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });

/* ─── Static data ─── */
const COMPETENCY = [
  { subject: "FEA", user: 88, avg: 72 },
  { subject: "CFD", user: 71, avg: 68 },
  { subject: "CAD", user: 65, avg: 70 },
  { subject: "Kinematics", user: 79, avg: 65 },
  { subject: "Manufacturing", user: 58, avg: 63 },
  { subject: "Thermal", user: 84, avg: 71 },
];

const TIMELINE = [
  { type: "badge", text: "Earned Structural Analyst II badge", date: "Dec 15, 2024", color: "#F97316" },
  { type: "sim", text: "Completed spur-gear-assembly (Score 89)", date: "Dec 10, 2024", color: "#22C55E" },
  { type: "badge", text: "Earned Gear Systems Master badge", date: "Nov 10, 2024", color: "#F97316" },
  { type: "sim", text: "Completed gear-train-4stage (Score 92)", date: "Nov 5, 2024", color: "#22C55E" },
  { type: "challenge", text: "Passed FEA-STR-005 challenge", date: "Oct 28, 2024", color: "#60A5FA" },
];

const DOMAINS = ["FEA Structural", "CFD", "Thermal", "Kinematics", "CAD", "Manufacturing"];
const ROLES = ["FEA Analyst", "CFD Engineer", "Design Engineer", "Simulation Lead", "R&D Engineer", "Graduate Engineer"];
const PIPELINE_STAGES = ["Not Contacted", "Shortlisted", "Screening Call", "Technical Interview", "Offer Extended"] as const;
type PipelineStage = typeof PIPELINE_STAGES[number];

const SIMILAR_CANDIDATES = leaderboard.filter(u => !u.isCurrentUser).slice(0, 3);

/* ─── Match score calculator ─── */
function calcMatchScore(minTFES: number, minSF: number, selectedDomains: string[]): number {
  let score = 0;
  // TFES match (40 pts)
  if (currentUser.tfes >= minTFES) score += 40;
  else score += Math.max(0, 40 - (minTFES - currentUser.tfes) * 2);
  // SF match (30 pts)
  if (currentUser.avgSF >= minSF) score += 30;
  else score += Math.max(0, 30 - (minSF - currentUser.avgSF) * 15);
  // Domain match (30 pts)
  const userDomains = ["FEA Structural", "Thermal", "Kinematics", "CFD"];
  if (selectedDomains.length === 0) { score += 30; }
  else {
    const matched = selectedDomains.filter(d => userDomains.includes(d)).length;
    score += Math.round((matched / selectedDomains.length) * 30);
  }
  return Math.min(100, Math.round(score));
}

/* ─── Interview scheduler modal ─── */
const TIMES = ["09:00", "10:00", "11:00", "14:00", "15:00", "16:00"];
const DAYS = Array.from({ length: 7 }, (_, i) => {
  const d = new Date();
  d.setDate(d.getDate() + i + 1);
  return { label: d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" }), date: d };
});

function InterviewModal({ onClose }: { onClose: () => void }) {
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedTime, setSelectedTime] = useState("");
  const [mode, setMode] = useState<"Video" | "In-Person" | "Phone">("Video");
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!selectedTime) { showToast("Please select a time slot"); return; }
    setSent(true);
    setTimeout(onClose, 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.93, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.93, y: 16 }}
        transition={{ duration: 0.22 }}
        className="bg-[#111827] border border-[#1F2937] rounded-xl w-full max-w-md overflow-hidden"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#1F2937]">
          <div className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>Schedule Interview — Raj Kumar</div>
          <button onClick={onClose} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>

        <AnimatePresence mode="wait">
          {sent ? (
            <motion.div key="sent" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
              <div className="font-semibold text-white text-base mb-1" style={{ fontFamily: "Space Grotesk" }}>Interview Request Sent!</div>
              <div className="text-sm text-gray-400 font-mono">
                {DAYS[selectedDay].label} · {selectedTime} · {mode}
              </div>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-5 space-y-4">
              {/* Mode selector */}
              <div>
                <div className="text-xs text-gray-400 font-mono mb-2">Interview Mode</div>
                <div className="flex gap-2">
                  {(["Video", "In-Person", "Phone"] as const).map(m => (
                    <button key={m} onClick={() => setMode(m)}
                      className={`flex-1 py-1.5 text-xs rounded border font-mono transition-colors ${mode === m ? "bg-[#F97316] border-[#F97316] text-white" : "border-[#374151] text-gray-400 hover:border-[#F97316]/50"}`}
                      data-testid={`btn-mode-${m.toLowerCase()}`}
                    >{m}</button>
                  ))}
                </div>
              </div>

              {/* Day selector */}
              <div>
                <div className="text-xs text-gray-400 font-mono mb-2">Select Date</div>
                <div className="grid grid-cols-4 gap-1.5">
                  {DAYS.map((d, i) => (
                    <button key={i} onClick={() => setSelectedDay(i)}
                      className={`py-2 text-center rounded border text-[10px] font-mono transition-colors ${selectedDay === i ? "bg-[#F97316]/15 border-[#F97316] text-[#F97316]" : "border-[#374151] text-gray-400 hover:border-[#374151]/80"}`}
                      data-testid={`btn-day-${i}`}
                    >
                      <div>{d.label.split(",")[0]}</div>
                      <div className="text-[9px] text-gray-600">{d.label.split(" ").slice(-2).join(" ")}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time selector */}
              <div>
                <div className="text-xs text-gray-400 font-mono mb-2">Select Time (IST)</div>
                <div className="grid grid-cols-3 gap-1.5">
                  {TIMES.map(t => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      className={`py-1.5 text-xs rounded border font-mono transition-colors ${selectedTime === t ? "bg-[#F97316]/15 border-[#F97316] text-[#F97316]" : "border-[#374151] text-gray-400 hover:border-[#374151]/80"}`}
                      data-testid={`btn-time-${t}`}
                    >{t}</button>
                  ))}
                </div>
              </div>

              {selectedTime && (
                <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                  className="bg-[#0A0F1E] border border-[#1F2937] rounded p-3 font-mono text-xs text-gray-400 flex items-center gap-2"
                >
                  <Clock className="w-3 h-3 text-[#F97316]" />
                  {DAYS[selectedDay].label} · {selectedTime} IST · {mode} Interview with Raj Kumar
                </motion.div>
              )}

              <button onClick={handleSend}
                className="w-full py-2.5 bg-[#F97316] text-white text-sm font-bold rounded hover:bg-[#ea6c0f] transition-colors flex items-center justify-center gap-2"
                data-testid="btn-send-interview"
              >
                <Send className="w-4 h-4" /> Send Interview Request
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

/* ─── Hire Panel (right column in recruiter mode) ─── */
function HirePanel({ username }: { username: string }) {
  const [minTFES, setMinTFES] = useState(80);
  const [minSF, setMinSF] = useState(2.0);
  const [selectedDomains, setSelectedDomains] = useState<string[]>(["FEA Structural"]);
  const [selectedRole, setSelectedRole] = useState(ROLES[0]);
  const [pipeline, setPipeline] = useState<PipelineStage>("Not Contacted");
  const [shortlisted, setShortlisted] = useState(false);
  const [message, setMessage] = useState("");
  const [messageSent, setMessageSent] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);

  const matchScore = calcMatchScore(minTFES, minSF, selectedDomains);
  const matchColor = matchScore >= 80 ? "#22C55E" : matchScore >= 60 ? "#F97316" : "#EF4444";
  const matchLabel = matchScore >= 80 ? "Strong Match" : matchScore >= 60 ? "Good Match" : "Partial Match";

  const toggleDomain = (d: string) => setSelectedDomains(prev =>
    prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
  );

  const sendMessage = () => {
    if (!message.trim()) return;
    setMessageSent(true);
    setMessage("");
    setPipeline("Shortlisted");
    setShortlisted(true);
    showToast("✓ Message sent to Raj Kumar");
  };

  const pipelineIdx = PIPELINE_STAGES.indexOf(pipeline);

  return (
    <>
      <AnimatePresence>
        {showScheduler && <InterviewModal onClose={() => setShowScheduler(false)} />}
      </AnimatePresence>

      <div className="space-y-4">
        {/* Match Score */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Candidate Match</div>
            <div className="flex items-center gap-2">
              <div className="font-mono text-2xl font-bold" style={{ color: matchColor }}>{matchScore}%</div>
              <span className="text-xs px-2 py-0.5 rounded font-mono border"
                style={{ color: matchColor, borderColor: `${matchColor}40`, background: `${matchColor}10` }}>
                {matchLabel}
              </span>
            </div>
          </div>

          {/* Circular match visual */}
          <div className="flex justify-center mb-5">
            <svg width="100" height="100" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="40" fill="none" stroke="#1F2937" strokeWidth="8" />
              <circle cx="50" cy="50" r="40" fill="none" stroke={matchColor} strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${matchScore * 2.513} 251.3`}
                strokeDashoffset="62.8"
                style={{ transition: "stroke-dasharray 0.6s ease" }}
              />
              <text x="50" y="46" textAnchor="middle" fill="white" fontSize="18" fontFamily="JetBrains Mono" fontWeight="bold">{matchScore}%</text>
              <text x="50" y="60" textAnchor="middle" fill="#6B7280" fontSize="8" fontFamily="JetBrains Mono">{matchLabel}</text>
            </svg>
          </div>

          {/* Requirement sliders */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-gray-400">Min TFES Score</span>
                <span className={currentUser.tfes >= minTFES ? "text-green-400" : "text-red-400"}>{minTFES} {currentUser.tfes >= minTFES ? "✓" : "✗"}</span>
              </div>
              <input type="range" min={50} max={100} value={minTFES} onChange={e => setMinTFES(+e.target.value)}
                className="w-full accent-orange-500 cursor-pointer" data-testid="slider-tfes" />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-0.5"><span>50</span><span>100</span></div>
            </div>
            <div>
              <div className="flex justify-between text-xs font-mono mb-1.5">
                <span className="text-gray-400">Min Safety Factor</span>
                <span className={currentUser.avgSF >= minSF ? "text-green-400" : "text-red-400"}>{minSF.toFixed(1)}x {currentUser.avgSF >= minSF ? "✓" : "✗"}</span>
              </div>
              <input type="range" min={1.0} max={4.0} step={0.1} value={minSF} onChange={e => setMinSF(+e.target.value)}
                className="w-full accent-orange-500 cursor-pointer" data-testid="slider-sf" />
              <div className="flex justify-between text-[10px] text-gray-600 font-mono mt-0.5"><span>1.0x</span><span>4.0x</span></div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono mb-2">Required Domains</div>
              <div className="flex flex-wrap gap-1.5">
                {DOMAINS.map(d => {
                  const userHas = ["FEA Structural", "Thermal", "Kinematics", "CFD"].includes(d);
                  const isSelected = selectedDomains.includes(d);
                  return (
                    <button key={d} onClick={() => toggleDomain(d)}
                      className={`px-2 py-0.5 text-[10px] rounded border font-mono transition-colors ${isSelected
                        ? userHas ? "bg-green-500/15 border-green-500/40 text-green-400" : "bg-red-500/15 border-red-500/40 text-red-400"
                        : "border-[#374151] text-gray-500 hover:border-[#555]"}`}
                      data-testid={`btn-domain-${d.replace(" ", "-").toLowerCase()}`}
                    >
                      {isSelected && (userHas ? "✓ " : "✗ ")}{d}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-xs text-gray-400 font-mono mb-1.5">Role</div>
              <select value={selectedRole} onChange={e => setSelectedRole(e.target.value)}
                className="w-full bg-[#0A0F1E] border border-[#374151] rounded px-3 py-1.5 text-sm text-white font-mono focus:outline-none focus:border-[#F97316]"
                data-testid="select-role"
              >
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Candidate Pipeline */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Hiring Pipeline</div>
          <div className="space-y-1.5">
            {PIPELINE_STAGES.map((stage, i) => {
              const isActive = i === pipelineIdx;
              const isDone = i < pipelineIdx;
              return (
                <button key={stage} onClick={() => setPipeline(stage)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors text-left ${isActive ? "bg-[#F97316]/10 border border-[#F97316]/30 text-[#F97316]" : isDone ? "text-green-400" : "text-gray-500 hover:text-gray-300"}`}
                  data-testid={`pipeline-stage-${i}`}
                >
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isActive ? "border-[#F97316]" : isDone ? "border-green-400 bg-green-400/20" : "border-[#374151]"}`}>
                    {isDone && <CheckCircle className="w-3 h-3 text-green-400" />}
                    {isActive && <div className="w-2 h-2 rounded-full bg-[#F97316]" />}
                  </div>
                  <span className="font-mono text-xs">{stage}</span>
                  {i < pipelineIdx - 1 && <div className="ml-auto text-[10px] text-green-500/60 font-mono">✓</div>}
                </button>
              );
            })}
          </div>
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setShortlisted(true); setPipeline("Shortlisted"); showToast("✓ Added to shortlist"); }}
            className={`flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded border transition-colors ${shortlisted ? "bg-green-500/15 border-green-500/40 text-green-400" : "border-[#374151] text-gray-400 hover:text-white hover:border-[#F97316]/50"}`}
            data-testid="btn-shortlist"
          >
            <Star className={`w-3.5 h-3.5 ${shortlisted ? "fill-green-400" : ""}`} />
            {shortlisted ? "Shortlisted" : "Shortlist"}
          </button>
          <button onClick={() => setShowScheduler(true)}
            className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded border border-[#374151] text-gray-400 hover:text-white hover:border-[#F97316]/50 transition-colors"
            data-testid="btn-schedule"
          >
            <Calendar className="w-3.5 h-3.5" /> Schedule
          </button>
          <button onClick={() => showToast("📄 Credentials PDF downloading...")}
            className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded border border-[#374151] text-gray-400 hover:text-white hover:border-[#F97316]/50 transition-colors"
            data-testid="btn-download-pdf"
          >
            <Download className="w-3.5 h-3.5" /> Download PDF
          </button>
          <button onClick={() => showToast("🔗 Shareable link copied")}
            className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold rounded border border-[#374151] text-gray-400 hover:text-white hover:border-[#F97316]/50 transition-colors"
            data-testid="btn-share-recruiter"
          >
            <Share2 className="w-3.5 h-3.5" /> Share
          </button>
        </div>

        {/* Message box */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
          <div className="text-sm font-semibold text-white mb-3" style={{ fontFamily: "Space Grotesk" }}>
            {messageSent ? "Message Sent ✓" : "Contact Candidate"}
          </div>
          {messageSent ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg"
            >
              <CheckCircle className="w-4 h-4 text-green-400" />
              <div>
                <div className="text-xs text-green-400 font-mono">Message delivered to Raj Kumar</div>
                <button onClick={() => setMessageSent(false)} className="text-[10px] text-gray-500 hover:text-white mt-0.5">Send another →</button>
              </div>
            </motion.div>
          ) : (
            <>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder={`Hi Raj, we have a ${selectedRole} opening at our firm and your profile is a strong match...`}
                className="w-full bg-[#0A0F1E] border border-[#1F2937] rounded px-3 py-2 text-xs text-gray-300 font-mono placeholder:text-gray-600 focus:outline-none focus:border-[#F97316] resize-none"
                data-testid="textarea-message"
              />
              <button onClick={sendMessage}
                className="mt-2 w-full py-2 bg-[#F97316] text-white text-xs font-bold rounded hover:bg-[#ea6c0f] transition-colors flex items-center justify-center gap-2"
                data-testid="btn-send-message"
              >
                <Send className="w-3.5 h-3.5" /> Send Message
              </button>
            </>
          )}
        </div>

        {/* Similar candidates */}
        <div className="bg-[#111827] border border-[#1F2937] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Similar Candidates</div>
            <Users className="w-4 h-4 text-gray-500" />
          </div>
          <div className="space-y-3">
            {SIMILAR_CANDIDATES.map(c => (
              <div key={c.rank} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#1F2937] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                  {c.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium text-white truncate">{c.name}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{c.city} · TFES {c.tfes} · {c.domain}</div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="text-[10px] font-mono font-bold"
                    style={{ color: calcMatchScore(minTFES, minSF, selectedDomains) > 60 ? "#22C55E" : "#F97316" }}>
                    {Math.max(45, calcMatchScore(minTFES, minSF, selectedDomains) - Math.floor(Math.random() * 20))}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => showToast("🔍 Opening talent search...")}
            className="mt-3 w-full py-1.5 text-xs border border-[#374151] text-gray-400 hover:text-white rounded transition-colors font-mono"
            data-testid="btn-search-talent"
          >
            Search all {(Math.floor(Math.random() * 400) + 1800).toLocaleString()} engineers →
          </button>
        </div>
      </div>
    </>
  );
}

/* ─── Main Portfolio page ─── */
export default function Portfolio() {
  const params = useParams<{ username: string }>();
  const username = params.username ?? currentUser.username;
  const [recruiterMode, setRecruiterMode] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <div className="pt-14 max-w-6xl mx-auto p-6">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>

          {/* View toggle */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2 bg-[#111827] border border-[#1F2937] rounded-lg p-1">
              <button onClick={() => setRecruiterMode(false)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all ${!recruiterMode ? "bg-[#F97316] text-white shadow" : "text-gray-400 hover:text-white"}`}
                data-testid="btn-engineer-view"
              >
                <User className="w-4 h-4" /> Engineer View
              </button>
              <button onClick={() => setRecruiterMode(true)}
                className={`flex items-center gap-2 px-4 py-1.5 rounded text-sm font-medium transition-all ${recruiterMode ? "bg-[#F97316] text-white shadow" : "text-gray-400 hover:text-white"}`}
                data-testid="btn-recruiter-view"
              >
                <Briefcase className="w-4 h-4" /> Recruiter View
              </button>
            </div>
            {recruiterMode && (
              <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-1.5 text-xs font-mono text-[#F97316] bg-[#F97316]/10 border border-[#F97316]/20 px-3 py-1.5 rounded"
              >
                <Building2 className="w-3 h-3" /> Recruiter Portal Active
              </motion.div>
            )}
          </div>

          <div className={`grid gap-6 ${recruiterMode ? "lg:grid-cols-[1fr_360px]" : "max-w-4xl mx-auto"}`}>
            {/* LEFT: Engineer profile */}
            <div className="space-y-6 min-w-0">
              {/* Hero */}
              <div className="relative bg-[#111827] border border-[#1F2937] rounded-lg p-6">
                <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-mono px-2 py-1 rounded">
                  <Shield className="w-3 h-3" /> VERIFIED ENGINEERING PORTFOLIO
                </div>
                <div className="flex items-start gap-5">
                  <div className="w-20 h-20 rounded-full bg-[#F97316] flex items-center justify-center text-white text-2xl font-bold flex-shrink-0" style={{ fontFamily: "Space Grotesk" }}>RK</div>
                  <div>
                    <h1 className="text-2xl font-bold text-white mb-0.5" style={{ fontFamily: "Space Grotesk" }}>{currentUser.name}</h1>
                    <div className="font-mono text-sm text-gray-400 mb-1">@{username}</div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-500 font-mono mb-3">
                      <MapPin className="w-3 h-3" /> Hyderabad, India
                    </div>
                    <div className="text-sm text-amber-400">{currentUser.tier} Mechanical Engineer 🟠</div>
                  </div>
                  <div className="ml-auto hidden md:block">
                    <TFESGauge value={currentUser.tfes} size={100} />
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#1F2937] text-center">
                  {[["63", "Simulations"], ["8", "Badges"], ["2.7x", "Avg SF"], ["₹22,500", "Earned"]].map(([v, l]) => (
                    <div key={l}><div className="font-mono text-lg font-bold text-white">{v}</div><div className="text-xs text-gray-400">{l}</div></div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Competency Radar */}
                <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
                  <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>Competency Radar</h2>
                  <ResponsiveContainer width="100%" height={220}>
                    <RadarChart data={COMPETENCY}>
                      <PolarGrid stroke="#1F2937" />
                      <PolarAngleAxis dataKey="subject" tick={{ fill: "#9CA3AF", fontSize: 10, fontFamily: "JetBrains Mono" }} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: "#6B7280", fontSize: 8 }} />
                      <Radar name="You" dataKey="user" stroke="#F97316" fill="#F97316" fillOpacity={0.35} />
                      <Radar name="Domain Avg" dataKey="avg" stroke="#6B7280" fill="#6B7280" fillOpacity={0.1} strokeDasharray="4,2" />
                      <Legend wrapperStyle={{ fontFamily: "JetBrains Mono", fontSize: 10 }} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                {/* Top FEA Runs */}
                <div className="bg-[#111827] border border-[#1F2937] rounded-lg p-5">
                  <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>Top FEA Runs</h2>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-[#1F2937] text-gray-400"><th className="text-left pb-2">Project</th><th>Score</th><th>SF</th><th>Status</th></tr></thead>
                    <tbody>
                      {simulations.filter(s => s.type === "FEA").map(s => (
                        <tr key={s.id} className="border-b border-[#1F2937]/40">
                          <td className="py-2 text-gray-300 font-medium truncate max-w-[100px]">{s.name}</td>
                          <td className="py-2 text-center font-mono text-[#F97316]">{s.score}</td>
                          <td className="py-2 text-center"><SFBadge sf={s.sf ?? null} /></td>
                          <td className="py-2 text-center"><StatusPill status={s.status} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* NFT Wall */}
              <div>
                <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>NFT Credential Wall</h2>
                <div className="grid md:grid-cols-3 gap-4">
                  {nftBadges.map(b => (
                    <div key={b.id} className="bg-[#111827] border border-[#1F2937] rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3"><Shield className="w-8 h-8 text-[#F97316]" /><div><div className="text-sm font-semibold text-white">{b.name}</div><div className="text-xs text-gray-500 font-mono">{b.date}</div></div></div>
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => showToast()} className="flex-1 text-xs py-1 border border-[#374151] text-gray-400 hover:text-white rounded flex items-center justify-center gap-1"><ExternalLink className="w-3 h-3" /> Chain</button>
                        <button onClick={() => showToast()} className="text-xs px-2 py-1 border border-[#374151] text-gray-400 hover:text-white rounded"><Share2 className="w-3 h-3" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h2 className="font-semibold text-white mb-4 text-sm" style={{ fontFamily: "Space Grotesk" }}>Design Timeline</h2>
                <div className="relative pl-6 border-l border-[#1F2937]">
                  {TIMELINE.map((t, i) => (
                    <div key={i} className="mb-6 relative">
                      <div className="absolute -left-[25px] top-0 w-4 h-4 rounded-full border-2 border-[#0A0F1E]" style={{ background: t.color }} />
                      <div className="text-sm text-gray-300">{t.text}</div>
                      <div className="text-xs text-gray-500 font-mono mt-0.5">{t.date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Employer CTA — only in engineer mode */}
              {!recruiterMode && (
                <div className="bg-[#111827] border border-[#F97316]/30 rounded-lg p-6 text-center">
                  <h2 className="text-xl font-bold text-white mb-2" style={{ fontFamily: "Space Grotesk" }}>Interested in this engineer?</h2>
                  <p className="text-gray-400 text-sm mb-6">All credentials are cryptographically verified and on-chain.</p>
                  <div className="flex gap-3 justify-center">
                    <button onClick={() => setRecruiterMode(true)} className="px-6 py-2.5 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors text-sm flex items-center gap-2" data-testid="button-contact">
                      <Briefcase className="w-4 h-4" /> Open Recruiter View
                    </button>
                    <button onClick={() => showToast("📄 Credentials PDF downloading...")} className="px-6 py-2.5 border border-[#374151] text-gray-300 hover:text-white font-semibold rounded transition-colors text-sm" data-testid="button-download-creds">Download Credentials PDF</button>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT: Hire panel — only in recruiter mode */}
            <AnimatePresence>
              {recruiterMode && (
                <motion.div
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={{ duration: 0.3 }}
                  className="lg:sticky lg:top-20 lg:self-start"
                >
                  <HirePanel username={username} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
