import { Link, useLocation } from "wouter";
import { Settings, Menu, X, Bell, CheckCheck, Shield, Zap, Trophy, Users, Clock, TrendingUp, AlertTriangle, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

/* ─── Notification types ─── */
type NType = "pipeline" | "challenge" | "badge" | "sim" | "profile" | "alert";

interface Notification {
  id: string;
  type: NType;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href?: string;
  urgent?: boolean;
}

/* ─── Mock notification feed ─── */
const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: "n1", type: "pipeline", read: false, urgent: false,
    title: "Divya Nair accepted interview",
    body: "Technical Interview confirmed for May 9 at 11:00 IST · Video · Bharat Engineering Ltd.",
    time: "Just now", href: "/talent-pipeline",
  },
  {
    id: "n2", type: "challenge", read: false, urgent: true,
    title: "CFD-INT-003 deadline in 4 hours",
    body: "Internal Flow in Elbow Pipe challenge closes tonight. You're at 30% — submit partial work now to secure XP.",
    time: "2 min ago", href: "/challenges",
  },
  {
    id: "n3", type: "badge", read: false, urgent: false,
    title: "New badge unlocked: Thermal Engineer Elite",
    body: "You've qualified for the Heat Sink Thermal Performance challenge badge (₹18,500 prize pool).",
    time: "18 min ago", href: "/mechedge",
  },
  {
    id: "n4", type: "pipeline", read: false, urgent: false,
    title: "High-TFES candidate matched your pipeline",
    body: "Karan Malhotra (TFES 88, FEA Expert) matches your active FEA Analyst role — 87% fit.",
    time: "1 hr ago", href: "/talent-pipeline",
  },
  {
    id: "n5", type: "profile", read: false, urgent: false,
    title: "3 recruiters viewed your portfolio",
    body: "Mahindra Engineering, L&T ECC, and Tata Technologies visited your profile in the last 24h.",
    time: "3 hr ago", href: "/portfolio/raj.kumar",
  },
  {
    id: "n6", type: "sim", read: true, urgent: false,
    title: "Bracket Mount v1 needs review",
    body: "Safety Factor 0.87x is below the minimum threshold. Re-run with reinforced cross-section before submitting.",
    time: "Yesterday", href: "/simforge",
  },
  {
    id: "n7", type: "alert", read: true, urgent: false,
    title: "Leaderboard rank changed: #4 → #4",
    body: "Vikram Singh gained 142 XP overnight. Your gap is now 340 XP — complete one more FEA challenge to hold position.",
    time: "Yesterday", href: "/leaderboard",
  },
  {
    id: "n8", type: "sim", read: true, urgent: false,
    title: "Simulation score updated: Gear Train 4-Stage",
    body: "CIE re-graded your Gear Train run. Final score: 92/100 · SF 3.21x · NFT minted on Polygon PoS.",
    time: "2 days ago", href: "/simforge",
  },
];

const TYPE_META: Record<NType, { icon: typeof Bell; color: string; bg: string }> = {
  pipeline: { icon: Users,         color: "#60A5FA", bg: "bg-blue-500/15" },
  challenge:{ icon: Zap,           color: "#F97316", bg: "bg-orange-500/15" },
  badge:    { icon: Shield,        color: "#22C55E", bg: "bg-green-500/15" },
  sim:      { icon: TrendingUp,    color: "#A78BFA", bg: "bg-violet-500/15" },
  profile:  { icon: Trophy,        color: "#F59E0B", bg: "bg-amber-500/15" },
  alert:    { icon: AlertTriangle, color: "#EF4444", bg: "bg-red-500/15" },
};

/* ─── Main Navbar ─── */
export function Navbar() {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  const panelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLButtonElement>(null);

  const unread = notifications.filter(n => !n.read).length;

  // Close on outside click
  useEffect(() => {
    if (!notifOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        bellRef.current && !bellRef.current.contains(e.target as Node)
      ) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [notifOpen]);

  // Close when route changes
  useEffect(() => { setNotifOpen(false); setMobileOpen(false); }, [location]);

  const markRead = (id: string) =>
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));

  const markAllRead = () =>
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));

  const dismiss = (id: string) =>
    setNotifications(prev => prev.filter(n => n.id !== id));

  const handleCTA = () => toast("⚙️ Simulation feature live soon!", {
    icon: "⚙️", style: { background: "#1F2937", color: "#F9FAFB", border: "1px solid #374151" }
  });

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 h-14 bg-[#0A0F1E]/90 backdrop-blur border-b border-[#1F2937] flex items-center px-6">
      {/* Logo */}
      <Link href="/" className="flex items-center gap-2 mr-8">
        <Settings className="w-5 h-5 text-[#F97316]" />
        <span className="font-bold text-white" style={{ fontFamily: "Space Grotesk", fontSize: 16 }}>Talent Forge</span>
        <span className="px-1.5 py-0.5 text-xs font-bold text-white bg-[#F97316] rounded" style={{ fontFamily: "JetBrains Mono" }}>MECH LAB</span>
      </Link>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        <Link href="/dashboard" className="text-gray-400 hover:text-[#F97316] transition-colors">Dashboard</Link>
        <Link href="/simforge" className="text-gray-400 hover:text-[#F97316] transition-colors">SimForge</Link>
        <Link href="/mechedge" className="text-gray-400 hover:text-[#F97316] transition-colors">MechEdge</Link>
        <Link href="/challenges" className="text-gray-400 hover:text-[#F97316] transition-colors">Challenges</Link>
        <Link href="/leaderboard" className="text-gray-400 hover:text-[#F97316] transition-colors">Leaderboard</Link>
      </div>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-3">
        {/* Bell button */}
        <div className="relative">
          <button
            ref={bellRef}
            onClick={() => setNotifOpen(o => !o)}
            className={`relative p-2 rounded-lg transition-colors ${notifOpen ? "bg-[#1F2937] text-white" : "text-gray-400 hover:text-white hover:bg-[#1F2937]"}`}
            data-testid="btn-bell"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F97316] text-white text-[9px] font-bold font-mono rounded-full flex items-center justify-center"
              >
                {unread}
              </motion.span>
            )}
          </button>

          {/* Notifications panel */}
          <AnimatePresence>
            {notifOpen && (
              <motion.div
                ref={panelRef}
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 top-full mt-2 w-[380px] bg-[#111827] border border-[#1F2937] rounded-xl shadow-2xl overflow-hidden z-50"
                data-testid="notification-panel"
              >
                {/* Panel header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#1F2937]"
                  style={{ background: "linear-gradient(135deg, #0D1424 0%, #111827 100%)" }}>
                  <div className="flex items-center gap-2.5">
                    <Bell className="w-4 h-4 text-[#F97316]" />
                    <span className="font-semibold text-white text-sm" style={{ fontFamily: "Space Grotesk" }}>Notifications</span>
                    {unread > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#F97316]/20 text-[#F97316] border border-[#F97316]/30 rounded-full">
                        {unread} new
                      </span>
                    )}
                  </div>
                  <button
                    onClick={markAllRead}
                    disabled={unread === 0}
                    className="flex items-center gap-1.5 text-[11px] font-mono text-gray-500 hover:text-white disabled:opacity-30 transition-colors"
                    data-testid="btn-mark-all-read"
                  >
                    <CheckCheck className="w-3.5 h-3.5" /> Mark all read
                  </button>
                </div>

                {/* Notification list */}
                <div className="overflow-y-auto max-h-[440px]" style={{ scrollbarWidth: "thin", scrollbarColor: "#374151 transparent" }}>
                  <AnimatePresence initial={false}>
                    {notifications.map((n, i) => {
                      const meta = TYPE_META[n.type];
                      const Icon = meta.icon;

                      const CardInner = (
                        <motion.div
                          key={n.id}
                          layout
                          initial={{ opacity: 0, x: 12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -20, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.2, delay: i * 0.03 }}
                          className={`group relative flex gap-3 px-4 py-3 border-b border-[#1F2937]/60 transition-colors cursor-pointer
                            ${n.read ? "hover:bg-[#1F2937]/40" : "bg-[#F97316]/4 hover:bg-[#F97316]/8"}
                          `}
                          onClick={() => markRead(n.id)}
                          data-testid={`notification-${n.id}`}
                        >
                          {/* Unread dot */}
                          {!n.read && (
                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#F97316]" />
                          )}

                          {/* Icon */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${meta.bg}`}>
                            <Icon className="w-4 h-4" style={{ color: meta.color }} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start gap-1.5 mb-0.5">
                              <span className={`text-xs font-semibold leading-snug ${n.read ? "text-gray-300" : "text-white"}`}
                                style={{ fontFamily: "Space Grotesk" }}>
                                {n.title}
                              </span>
                              {n.urgent && (
                                <span className="flex-shrink-0 text-[9px] font-mono px-1 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded">
                                  URGENT
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-gray-500 leading-relaxed line-clamp-2">{n.body}</p>
                            <div className="flex items-center gap-2 mt-1.5">
                              <Clock className="w-2.5 h-2.5 text-gray-600" />
                              <span className="text-[10px] font-mono text-gray-600">{n.time}</span>
                              {n.href && (
                                <span className="ml-auto text-[10px] font-mono text-[#F97316] opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                                  View <ChevronRight className="w-2.5 h-2.5" />
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Dismiss */}
                          <button
                            onClick={e => { e.stopPropagation(); dismiss(n.id); }}
                            className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity mt-0.5 text-gray-600 hover:text-white"
                            data-testid={`btn-dismiss-${n.id}`}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </motion.div>
                      );

                      return n.href ? (
                        <Link key={n.id} href={n.href} onClick={() => { markRead(n.id); setNotifOpen(false); }}>
                          {CardInner}
                        </Link>
                      ) : (
                        <div key={n.id}>{CardInner}</div>
                      );
                    })}
                  </AnimatePresence>

                  {notifications.length === 0 && (
                    <div className="py-12 text-center">
                      <Bell className="w-8 h-8 text-gray-700 mx-auto mb-3" />
                      <p className="text-sm text-gray-600 font-mono">All caught up</p>
                    </div>
                  )}
                </div>

                {/* Panel footer */}
                <div className="px-4 py-2.5 border-t border-[#1F2937] flex items-center justify-between bg-[#0D1424]">
                  <span className="text-[10px] font-mono text-gray-600">
                    {notifications.filter(n => n.read).length} read · {unread} unread
                  </span>
                  <button
                    onClick={() => setNotifications(prev => prev.filter(n => !n.read))}
                    className="text-[10px] font-mono text-gray-500 hover:text-white transition-colors"
                    data-testid="btn-clear-read"
                  >
                    Clear read
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button onClick={handleCTA} className="hidden md:block text-sm text-gray-400 hover:text-white transition-colors" data-testid="button-signin">Sign In</button>
        <button onClick={handleCTA} className="hidden md:block px-4 py-1.5 bg-[#F97316] text-white text-sm font-semibold rounded hover:bg-[#ea6c0f] transition-colors" data-testid="button-start-free">Start Simulation</button>
        <button className="md:hidden text-gray-400" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="absolute top-14 left-0 right-0 bg-[#111827] border-b border-[#1F2937] p-4 flex flex-col gap-3 md:hidden">
          {["Dashboard", "SimForge", "MechEdge", "Challenges", "Leaderboard"].map(p => (
            <Link key={p} href={`/${p.toLowerCase()}`} onClick={() => setMobileOpen(false)} className="text-gray-300 hover:text-[#F97316] py-1">{p}</Link>
          ))}
          <button onClick={handleCTA} className="mt-2 px-4 py-2 bg-[#F97316] text-white text-sm font-semibold rounded">Start Simulation</button>
        </div>
      )}
    </nav>
  );
}
