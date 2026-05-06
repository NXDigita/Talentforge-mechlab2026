import { Link, useLocation } from "wouter";
import { LayoutDashboard, FolderOpen, Zap, BarChart2, Trophy, Swords, Users, FlaskConical, X } from "lucide-react";
import { currentUser } from "@/data/mockData";

const navItems = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/dashboard" },
  { label: "Design Vault", icon: FolderOpen, href: "/designvault" },
  { label: "SimForge", icon: Zap, href: "/simforge" },
  { label: "MechEdge", icon: BarChart2, href: "/mechedge" },
  { label: "Challenges", icon: Swords, href: "/challenges" },
  { label: "Playground", icon: FlaskConical, href: "/playground" },
  { label: "Leaderboard", icon: Trophy, href: "/leaderboard" },
  { label: "Talent Pipeline", icon: Users, href: "/talent-pipeline" },
];

interface SidebarProps {
  mobileOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ mobileOpen, onClose }: SidebarProps) {
  const [location] = useLocation();
  const xpPct = Math.round((currentUser.xp / currentUser.xpMax) * 100);

  const content = (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F97316] flex items-center justify-center text-white font-bold text-sm" style={{ fontFamily: "Space Grotesk" }}>RK</div>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-white truncate" style={{ fontFamily: "Space Grotesk" }}>{currentUser.name}</div>
            <div className="flex items-center gap-1">
              <span className="text-xs text-amber-400">{currentUser.tier} 🟠</span>
            </div>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400">TFES</span>
            <span className="font-mono text-[#F97316]">{currentUser.tfes}/100</span>
          </div>
          <div className="h-1.5 bg-[#1F2937] rounded-full">
            <div className="h-1.5 bg-[#F97316] rounded-full" style={{ width: `${currentUser.tfes}%` }} />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-gray-400 font-mono">XP</span>
            <span className="font-mono text-gray-400">{currentUser.xp.toLocaleString()} / {currentUser.xpMax.toLocaleString()}</span>
          </div>
          <div className="h-1.5 bg-[#1F2937] rounded-full">
            <div className="h-1.5 bg-blue-500 rounded-full" style={{ width: `${xpPct}%` }} />
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5">
        {navItems.map(item => {
          const Icon = item.icon;
          const active = location === item.href || (item.href !== "/" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded text-sm transition-colors ${active ? "bg-[#F97316]/10 text-[#F97316] border-l-2 border-[#F97316]" : "text-gray-400 hover:text-white hover:bg-[#1F2937]"}`}
              data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );

  return (
    <>
      <aside className="hidden md:flex w-[248px] flex-shrink-0 bg-[#111827] border-r border-[#1F2937] fixed left-0 top-14 bottom-0 overflow-y-auto flex-col z-40">
        {content}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={onClose} />
          <aside className="absolute left-0 top-0 bottom-0 w-[248px] bg-[#111827] border-r border-[#1F2937] flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-[#1F2937]">
              <span className="font-semibold text-white" style={{ fontFamily: "Space Grotesk" }}>Menu</span>
              <button onClick={onClose}><X className="w-4 h-4 text-gray-400" /></button>
            </div>
            {content}
          </aside>
        </div>
      )}
    </>
  );
}
