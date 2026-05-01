export const currentUser = {
  name: "Raj Kumar",
  username: "raj.kumar",
  tier: "Expert",
  tfes: 86,
  sims: 63,
  xp: 4320,
  xpMax: 6000,
  badges: 8,
  avgSF: 2.7,
  profileViews: 1247,
};

export const simulations = [
  { id: "spur-gear-assembly", name: "Spur Gear Assembly", type: "FEA", status: "SAFE", score: 89, sf: 2.84, material: "AISI 1045 Steel", duration: "4m 32s", peakStress: 187.4, load: "2400 N·m torque" },
  { id: "bracket-mount-v1", name: "Bracket Mount v1", type: "FEA", status: "CRITICAL", score: 31, sf: 0.87, material: "Al 6061-T6", duration: "2m 15s", peakStress: 412.6, load: "850 N vertical" },
  { id: "pipe-bend-flow", name: "Pipe Bend Flow", type: "CFD", status: "WARN", score: 74, sf: null, material: "AISI 304 SS", duration: "8m 45s", peakStress: null, load: "5 L/min @ 3.2 bar" },
  { id: "gear-train-4stage", name: "Gear Train 4-Stage", type: "Kinematics", status: "SAFE", score: 92, sf: 3.21, material: "AISI 1045 Steel", duration: "1m 58s", peakStress: 98.3, load: "1200 RPM input" },
  { id: "cooling-fin-array", name: "Cooling Fin Array", type: "Thermal", status: "SAFE", score: 87, sf: 4.1, material: "Al 6061-T6", duration: "6m 12s", peakStress: 45.2, load: "85°C ambient" },
];

export const challenges = [
  { id: "FEA-STR-007", name: "Cantilever Beam Under Point Load", difficulty: "Intermediate", domain: "FEA Structural", xp: 320, prize: "₹9,500", badge: "Structural Analyst I", status: "active", progress: 65, deadline: "2d 14h" },
  { id: "CFD-INT-003", name: "Internal Flow in Elbow Pipe", difficulty: "Advanced", domain: "CFD Flow", xp: 480, prize: "₹14,200", badge: "Flow Dynamics Pro", status: "active", progress: 30, deadline: "4d 8h" },
  { id: "KIN-GEA-002", name: "Planetary Gear Ratio Optimization", difficulty: "Intermediate", domain: "Kinematics", xp: 280, prize: "₹7,800", badge: "Gear Systems II", status: "upcoming", progress: 0, deadline: "7d" },
  { id: "FEA-THM-001", name: "Heat Sink Thermal Performance", difficulty: "Expert", domain: "Thermal", xp: 560, prize: "₹18,500", badge: "Thermal Engineer Elite", status: "upcoming", progress: 0, deadline: "9d 3h" },
  { id: "MFG-CNC-001", name: "CNC Toolpath Optimization", difficulty: "Beginner", domain: "Manufacturing", xp: 180, prize: "₹4,200", badge: "CNC Fundamentals", status: "completed", progress: 100, deadline: "Completed" },
];

export const materials = [
  { name: "AISI 1045 Steel", E: "205 GPa", Sy: "530 MPa", density: "7850 kg/m³", nu: "0.29", type: "Steel" },
  { name: "AISI 304 Stainless Steel", E: "193 GPa", Sy: "215 MPa", density: "7900 kg/m³", nu: "0.28", type: "Steel" },
  { name: "Al 6061-T6", E: "68.9 GPa", Sy: "276 MPa", density: "2700 kg/m³", nu: "0.33", type: "Aluminum" },
  { name: "Al 1060", E: "69.0 GPa", Sy: "28 MPa", density: "2705 kg/m³", nu: "0.33", type: "Aluminum" },
  { name: "Grey Cast Iron", E: "110 GPa", Sy: "240 MPa", density: "7200 kg/m³", nu: "0.26", type: "Cast Iron" },
  { name: "Ti-6Al-4V", E: "114 GPa", Sy: "880 MPa", density: "4430 kg/m³", nu: "0.34", type: "Titanium" },
  { name: "HDPE", E: "0.8 GPa", Sy: "22 MPa", density: "960 kg/m³", nu: "0.44", type: "Polymer" },
];

export const leaderboard = [
  { rank: 1, name: "Priya Sharma", city: "Mumbai", tier: "Expert", xp: 8920, tfes: 97, avgSF: 3.12, domain: "FEA", badges: 14 },
  { rank: 2, name: "Arjun Mehta", city: "Bangalore", tier: "Expert", xp: 8640, tfes: 95, avgSF: 2.98, domain: "CFD", badges: 12 },
  { rank: 3, name: "Divya Nair", city: "Chennai", tier: "Advanced", xp: 7890, tfes: 92, avgSF: 3.45, domain: "Thermal", badges: 11 },
  { rank: 4, name: "Raj Kumar", city: "Hyderabad", tier: "Expert", xp: 7320, tfes: 86, avgSF: 2.70, domain: "FEA", badges: 8, isCurrentUser: true },
  { rank: 5, name: "Vikram Singh", city: "Delhi", tier: "Advanced", xp: 6980, tfes: 84, avgSF: 2.55, domain: "Kinematics", badges: 9 },
  { rank: 6, name: "Ananya Krishnan", city: "Pune", tier: "Advanced", xp: 6540, tfes: 81, avgSF: 2.88, domain: "CFD", badges: 7 },
  { rank: 7, name: "Rohan Gupta", city: "Ahmedabad", tier: "Intermediate", xp: 5920, tfes: 76, avgSF: 2.21, domain: "FEA", badges: 6 },
  { rank: 8, name: "Sneha Pillai", city: "Kolkata", tier: "Intermediate", xp: 5480, tfes: 73, avgSF: 2.34, domain: "Thermal", badges: 5 },
];

export const nftBadges = [
  { id: 1, name: "Structural Analyst II", score: 89, sf: 2.84, date: "2024-12-15", tokenAddress: "0xa3f9c1b2e4d78f", chain: "Polygon PoS" },
  { id: 2, name: "CFD Flow Pro", score: 74, sf: null, date: "2024-11-28", tokenAddress: "0xb7e2d4c8f1a930", chain: "Polygon PoS" },
  { id: 3, name: "Gear Systems Master", score: 92, sf: 3.21, date: "2024-11-10", tokenAddress: "0xc5f8a2b9e6d104", chain: "Polygon PoS" },
  { id: 4, name: "Thermal Engineer I", score: 87, sf: 4.1, date: "2024-10-22", tokenAddress: "0xd9c3e7b4f2a815", chain: "Polygon PoS" },
];

export const analyticsData = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  score: 70 + Math.sin(i * 0.3) * 10 + i * 0.4,
  sf: 1.8 + Math.cos(i * 0.2) * 0.6 + i * 0.03,
}));

export const terminalLines = [
  { delay: 0, text: "[08:42:15.032] ─── Stage 1: Initialize ───", type: "stage" },
  { delay: 160, text: "[08:42:15.194] → Loading project: spur-gear-assembly.step", type: "info" },
  { delay: 320, text: "[08:42:15.422] ✓ Project loaded (2.3MB, 847 faces)", type: "success" },
  { delay: 480, text: "[08:42:15.601] ─── Stage 2: Import Geometry ───", type: "stage" },
  { delay: 640, text: "[08:42:15.788] → Parsing STEP B-Rep entities...", type: "info" },
  { delay: 800, text: "[08:42:16.012] ✓ 847 faces, 1,284 edges imported", type: "success" },
  { delay: 960, text: "[08:42:16.231] ─── Stage 3: Mesh Generation ───", type: "stage" },
  { delay: 1120, text: "[08:42:16.445] → Generating tetrahedral mesh (target: 2mm)", type: "info" },
  { delay: 1280, text: "[08:42:16.667] ████████████████████ 100% — 42,800 elements", type: "progress" },
  { delay: 1440, text: "[08:42:16.891] ✓ Jacobian quality: 0.92 (excellent)", type: "success" },
  { delay: 1600, text: "[08:42:17.103] ─── Stage 4: Boundary Conditions ───", type: "stage" },
  { delay: 1760, text: "[08:42:17.312] → Fixed constraint: bore_face_id=147 (6 DOF)", type: "info" },
  { delay: 1920, text: "[08:42:17.534] → Applied torque: 2400 N·m @ shaft_axis", type: "info" },
  { delay: 2080, text: "[08:42:17.751] ✓ Boundary conditions verified", type: "success" },
  { delay: 2240, text: "[08:42:17.963] ─── Stage 5: FEA Solve ───", type: "stage" },
  { delay: 2400, text: "[08:42:18.182] → Solver: Direct (PARDISO) — 42,800 DOF", type: "info" },
  { delay: 2560, text: "[08:42:18.401] → Iteration 1: residual 4.2e-3", type: "info" },
  { delay: 2720, text: "[08:42:18.623] → Iteration 2: residual 8.7e-5", type: "info" },
  { delay: 2880, text: "[08:42:18.845] → Iteration 3: residual 2.1e-6 ✓ CONVERGED", type: "success" },
  { delay: 3040, text: "[08:42:19.062] ─── Stage 6: Results Processing ───", type: "stage" },
  { delay: 3200, text: "[08:42:19.284] → Peak von Mises stress: 187.4 MPa (root fillet)", type: "info" },
  { delay: 3360, text: "[08:42:19.503] → Contact stress: 412.1 MPa", type: "info" },
  { delay: 3520, text: "[08:42:19.721] → Max displacement: 0.0124 mm", type: "info" },
  { delay: 3680, text: "[08:42:19.943] → SF = Sy/σ_max = 530/187.4 = 2.84 ✅ SAFE", type: "success" },
  { delay: 3840, text: "[08:42:20.162] ─── Stage 7: Certify & Score ───", type: "stage" },
  { delay: 4000, text: "[08:42:20.381] → TFES Score: 89/100 (Structural Excellence)", type: "info" },
  { delay: 4160, text: "[08:42:20.601] → Minting NFT badge: Structural Analyst II", type: "info" },
  { delay: 4320, text: "[08:42:20.824] → Polygon PoS: 0xa3f9c1b2e4d78f92c3b5... ✓", type: "success" },
  { delay: 4480, text: "[08:42:21.043] → TFES updated: 82 → 86 (+4 pts)", type: "success" },
  { delay: 4640, text: "[08:42:21.264] ✓ Simulation complete. Portfolio updated.", type: "success" },
];