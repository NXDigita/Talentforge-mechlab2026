import { Link } from "wouter";
import { Settings, Menu, X } from "lucide-react";
import toast from "react-hot-toast";
import { useState } from "react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleCTA = () => toast("⚙️ Simulation feature live soon!", { icon: "⚙️", style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" } });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A0F1E]/90 backdrop-blur border-b border-[#1F2937] flex items-center px-6">
      <Link href="/" className="flex items-center gap-2 mr-8">
        <Settings className="w-5 h-5 text-[#F97316]" />
        <span className="font-bold text-white" style={{ fontFamily: "Space Grotesk", fontSize: 16 }}>Talent Forge</span>
        <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-[#F97316] rounded" style={{ fontFamily: "JetBrains Mono" }}>MECH LAB</span>
      </Link>
      <div className="hidden md:flex items-center gap-6 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-[#F97316] transition-colors">Dashboard</Link>
        <Link href="/simforge" className="text-gray-400 hover:text-[#F97316] transition-colors">SimForge</Link>
        <Link href="/mechedge" className="text-gray-400 hover:text-[#F97316] transition-colors">MechEdge</Link>
        <Link href="/challenges" className="text-gray-400 hover:text-[#F97316] transition-colors">Challenges</Link>
        <Link href="/leaderboard" className="text-gray-400 hover:text-[#F97316] transition-colors">Leaderboard</Link>
      </div>
      <div className="ml-auto flex items-center gap-3">
        <button onClick={handleCTA} className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors" data-testid="button-signin">Sign In</button>
        <button onClick={handleCTA} className="hidden md:block px-4 py-1.5 bg-[#F97316] text-white text-sm font-semibold rounded hover:bg-[#ea6c0f] transition-colors" data-testid="button-start-free">Start Free</button>
        <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#111827] border-b border-[#1F2937] p-4 flex flex-col gap-3 md:hidden">
          {["Dashboard", "SimForge", "MechEdge", "Challenges", "Leaderboard"].map(p => (
            <Link key={p} href={`/${p.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-[#F97316] py-1">{p}</Link>
          ))}
          <button onClick={handleCTA} className="mt-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded">Start Free</button>
        </div>
      )}
    </nav>
  );
}
