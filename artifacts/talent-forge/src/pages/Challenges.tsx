import { useState } from "react";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Sidebar } from "@/components/Sidebar";
import { challenges } from "@/data/mockData";
import { Menu, Swords, Clock, Zap, Trophy } from "lucide-react";

const diffColor: Record<string, string> = {
  Beginner: "text-green-400 bg-green-500/10 border-green-500/20",
  Intermediate: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Advanced: "text-red-400 bg-red-500/10 border-red-500/20",
  Expert: "text-purple-400 bg-purple-500/10 border-purple-500/20",
};

const statusLabel: Record<string, { text: string; cls: string }> = {
  active: { text: "ACTIVE", cls: "text-green-400 bg-green-500/10 border-green-500/20" },
  upcoming: { text: "UPCOMING", cls: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  completed: { text: "COMPLETED", cls: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
};

export default function Challenges() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white">
      <Navbar />
      <Sidebar mobileOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="pt-14 md:pl-[248px]">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="p-6 max-w-4xl">
          <div className="flex items-center gap-3 mb-6">
            <button className="md:hidden text-gray-400" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <div>
              <h1 className="text-xl font-bold text-white" style={{ fontFamily: "Space Grotesk" }}>Challenges</h1>
              <p className="text-sm text-gray-500">Compete. Earn. Get Verified.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {challenges.map(ch => {
              const s = statusLabel[ch.status];
              return (
                <Link key={ch.id} href={`/challenges/${ch.id}`} className="block bg-[#111827] border border-[#1F2937] hover:border-[#F97316] rounded-lg p-5 transition-colors" data-testid={`card-challenge-${ch.id}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span className="font-mono text-xs text-[#60A5FA] block mb-1">{ch.id}</span>
                      <h3 className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>{ch.name}</h3>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded border font-mono ${s.cls}`}>{s.text}</span>
                  </div>
                  <div className="flex gap-2 mb-3 flex-wrap">
                    <span className={`text-xs px-2 py-0.5 rounded border ${diffColor[ch.difficulty] ?? "text-gray-400 bg-gray-500/10 border-gray-500/20"}`}>{ch.difficulty}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[#1F2937] text-gray-400 font-mono">{ch.domain}</span>
                  </div>
                  {ch.status === "active" && (
                    <div className="mb-3">
                      <div className="h-1.5 bg-[#1F2937] rounded-full"><div className="h-1.5 bg-[#F97316] rounded-full" style={{ width: `${ch.progress}%` }} /></div>
                      <div className="text-xs text-gray-500 font-mono mt-1">{ch.progress}% complete</div>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex gap-3 text-gray-400">
                      <span><Zap className="w-3 h-3 inline mr-0.5 text-[#F97316]" />{ch.xp} XP</span>
                      <span><Trophy className="w-3 h-3 inline mr-0.5 text-amber-400" />{ch.prize}</span>
                    </div>
                    <span className="text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" />{ch.deadline}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
