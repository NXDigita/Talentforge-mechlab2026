import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { terminalLines } from "@/data/mockData";
import toast from "react-hot-toast";
import { Settings, GitBranch, Zap, BarChart2, ChevronRight } from "lucide-react";

const showToast = () => toast("⚙️ Simulation feature live soon!", { icon: "⚙️", style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });

function IsometricGrid() {
  return (
    <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }}
      viewBox="0 0 800 600" preserveAspectRatio="xMidYMid slice">
      <style>{`@keyframes driftUp { from { transform: translateY(0); } to { transform: translateY(-60px); } }`}</style>
      <g style={{ animation: "driftUp 20s linear infinite" }}>
        {Array.from({ length: 20 }, (_, i) =>
          Array.from({ length: 20 }, (_, j) => {
            const x = (i - j) * 40 + 400;
            const y = (i + j) * 20 + 0;
            return (
              <g key={`${i}-${j}`}>
                <line x1={x} y1={y} x2={x + 40} y2={y + 20} stroke="#F97316" strokeWidth="0.5" />
                <line x1={x} y1={y} x2={x - 40} y2={y + 20} stroke="#F97316" strokeWidth="0.5" />
                <line x1={x - 40} y1={y + 20} x2={x - 40} y2={y + 50} stroke="#F97316" strokeWidth="0.5" />
                <line x1={x + 40} y1={y + 20} x2={x + 40} y2={y + 50} stroke="#F97316" strokeWidth="0.5" />
              </g>
            );
          })
        )}
      </g>
    </svg>
  );
}

const lineTextColor = (type: string) => {
  if (type === "stage") return "#60A5FA";
  if (type === "success") return "#22C55E";
  if (type === "progress") return "#F97316";
  return "#D1D5DB";
};

const TICKER_USERS = [
  "🥇 Priya Sharma — TFES 97", "🥈 Arjun Mehta — TFES 95", "🥉 Divya Nair — TFES 92",
  "⚡ Raj Kumar — TFES 86", "🔥 Vikram Singh — TFES 84", "💡 Ananya Krishnan — TFES 81",
  "⚙️ Rohan Gupta — TFES 76", "🛠️ Sneha Pillai — TFES 73"
];

export default function Landing() {
  const [logLines, setLogLines] = useState<typeof terminalLines>([]);
  const logRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setLogLines([]);
    let idx = 0;
    const iv = setInterval(() => {
      if (idx < terminalLines.length) {
        const line = terminalLines[idx];
        if (line) setLogLines(prev => [...prev, line]);
        idx++;
      } else {
        clearInterval(iv);
      }
    }, 160);
    intervalRef.current = iv;
    return () => { clearInterval(iv); };
  }, []);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [logLines]);

  const domainCards = [
    { name: "FEA Structural", count: 47, icon: "🔩" },
    { name: "CFD Flow", count: 31, icon: "💧" },
    { name: "CAD", count: 52, icon: "📐" },
    { name: "Kinematics", count: 28, icon: "⚙️" },
    { name: "Manufacturing", count: 35, icon: "🔧" },
    { name: "Thermal", count: 24, icon: "🌡️" },
  ];

  const tickerText = TICKER_USERS.join("   ·   ") + "   ·   " + TICKER_USERS.join("   ·   ");

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <main className="pt-14">
        {/* HERO */}
        <section className="relative overflow-hidden py-28 px-6 text-center">
          <IsometricGrid />
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 max-w-4xl mx-auto">
            <div className="font-mono text-sm text-[#F97316] mb-4 tracking-wider">
              ▸ FEA · CFD · CAD · KINEMATICS — SIMULATION ENGINE v2.0
            </div>
            <h1 className="mb-6 leading-tight" style={{ fontFamily: "Space Grotesk", fontSize: "clamp(40px,7vw,72px)", fontWeight: 700 }}>
              <span className="text-white">Your Designs.</span>{" "}
              <span className="text-[#F97316]">Stress-Tested. Verified.</span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-10" style={{ fontFamily: "Inter" }}>
              Run FEA, CFD, and kinematic simulations on your mechanical designs. Get an AI-graded score, earn blockchain-verified credentials, and build a portfolio employers can trust.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <button onClick={showToast} className="px-8 py-3 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors text-base" data-testid="button-hero-simulate">
                ⚙️ Start Simulating — Free
              </button>
              <button onClick={showToast} className="px-8 py-3 border border-[#60A5FA] text-[#60A5FA] font-semibold rounded hover:bg-[#60A5FA]/10 transition-colors text-base" data-testid="button-hero-watch">
                ▶ Watch a Live FEA Run
              </button>
            </div>

            {/* Terminal */}
            <div className="mt-12 mx-auto max-w-2xl text-left bg-[#111827] border border-[#1F2937] hover:border-[#F97316] transition-colors rounded-lg overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 border-b border-[#1F2937]">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                  <div className="w-3 h-3 rounded-full bg-green-500/60" />
                </div>
                <span className="font-mono text-xs text-gray-500">spur-gear-assembly — FEA Simulation</span>
                <span className={`font-mono text-xs px-2 py-0.5 rounded ${logLines.length < terminalLines.length ? "text-amber-400 bg-amber-400/10" : "text-green-400 bg-green-400/10"}`}>
                  {logLines.length < terminalLines.length ? "■ LIVE" : "● COMPLETE"}
                </span>
              </div>
              <div ref={logRef} className="h-48 overflow-y-auto p-4 space-y-0.5" style={{ background: "#020408" }}>
                {logLines.map((line, i) => line ? (
                  <div key={i} className="font-mono text-xs leading-5" style={{ color: lineTextColor(line.type) }}>{line.text}</div>
                ) : null)}
                {logLines.length < terminalLines.length && (
                  <div className="font-mono text-xs text-gray-600 animate-pulse">▋</div>
                )}
              </div>
            </div>
          </motion.div>
        </section>

        {/* Stats strip */}
        <div className="border-t border-b border-[#1F2937] py-6 px-6">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {[["63", "Active Simulations"], ["8", "Domains"], ["11,200+", "XP Today"], ["1,800+", "Portfolios"]].map(([val, label]) => (
              <div key={label}>
                <div className="font-mono text-2xl font-bold text-[#F97316]">{val}</div>
                <div className="text-sm text-gray-400 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Module cards */}
        <section className="py-16 px-6">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-10 text-white" style={{ fontFamily: "Space Grotesk" }}>Three Platforms. One Credential.</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {[
                { icon: GitBranch, title: "Design Vault", sub: "GitHub-style CAD repository", desc: "Version-controlled storage for your .STEP, .DXF, and simulation files. Fork, star, and collaborate.", href: "/designvault" },
                { icon: Zap, title: "SimForge", sub: "Vercel-style simulation pipeline", desc: "Deploy simulations like code. Watch the FEA pipeline execute stage-by-stage with live logs.", href: "/simforge" },
                { icon: BarChart2, title: "MechEdge", sub: "Cloudflare-style analytics", desc: "Track your TFES score, safety factor trends, and competency radar across all domains.", href: "/mechedge" },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <Link key={card.title} href={card.href} className="group block bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg p-6 transition-colors cursor-pointer">
                    <div className="w-10 h-10 rounded bg-[#F97316]/10 flex items-center justify-center mb-4 group-hover:bg-[#F97316]/20 transition-colors">
                      <Icon className="w-5 h-5 text-[#F97316]" />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-1" style={{ fontFamily: "Space Grotesk" }}>{card.title}</h3>
                    <p className="text-xs text-[#60A5FA] font-mono mb-3">{card.sub}</p>
                    <p className="text-sm text-gray-400">{card.desc}</p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Domain cards */}
        <section className="py-4 px-6 pb-16">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-xl font-bold mb-6 text-white" style={{ fontFamily: "Space Grotesk" }}>Explore by Domain</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {domainCards.map(d => (
                <button key={d.name} onClick={showToast} className="text-left bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg p-4 transition-colors group" data-testid={`card-domain-${d.name}`}>
                  <div className="text-2xl mb-2">{d.icon}</div>
                  <div className="font-semibold text-white text-sm mb-1" style={{ fontFamily: "Space Grotesk" }}>{d.name}</div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{d.count} simulations</span>
                    <ChevronRight className="w-3 h-3 text-gray-600 group-hover:text-[#F97316] transition-colors" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Ticker */}
        <div className="border-t border-[#1F2937] py-3 overflow-hidden bg-[#111827]">
          <style>{`@keyframes marquee { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
          <div style={{ display: "flex", animation: "marquee 30s linear infinite", whiteSpace: "nowrap" }}>
            <span className="font-mono text-xs text-[#F97316] px-8">{tickerText}</span>
          </div>
        </div>

        {/* Bottom CTA */}
        <section className="py-20 px-6 text-center bg-[#111827]">
          <div className="max-w-2xl mx-auto">
            <Settings className="w-12 h-12 text-[#F97316] mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: "Space Grotesk" }}>Ready to prove your engineering skills?</h2>
            <p className="text-gray-400 mb-8">Join 1,800+ engineers. Free forever for students.</p>
            <button onClick={showToast} className="px-10 py-3 bg-[#F97316] text-white font-semibold rounded hover:bg-[#ea6c0f] transition-colors text-base" data-testid="button-cta-create">
              Create Free Account →
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
