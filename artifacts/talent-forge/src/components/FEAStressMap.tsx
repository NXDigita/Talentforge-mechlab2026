interface FEAStressMapProps {
  showDisplacement?: boolean;
  width?: number;
  height?: number;
}

export function FEAStressMap({ showDisplacement = false, width = 520, height = 380 }: FEAStressMapProps) {
  return (
    <svg viewBox="0 0 520 380" width={width} height={height} style={{ background: "#020d1c", borderRadius: 8, border: "1px solid #1F2937" }}>
      <defs>
        <linearGradient id="flankGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#FFCC00" />
        </linearGradient>
        <linearGradient id="scaleGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF0000" />
          <stop offset="25%" stopColor="#FF6600" />
          <stop offset="50%" stopColor="#FFCC00" />
          <stop offset="75%" stopColor="#00CC44" />
          <stop offset="100%" stopColor="#0066FF" />
        </linearGradient>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#1a3a5c" strokeWidth="0.5" />
        </pattern>
      </defs>

      <rect width="520" height="380" fill="url(#grid)" opacity="0.5" />

      {/* Hub/web area - blue */}
      <ellipse cx="180" cy="200" rx="60" ry="55" fill="#0066FF" opacity="0.85" />

      {/* Tooth body - gradient flank */}
      <path d="M 200 160 Q 230 140 260 145 L 280 170 Q 300 190 295 220 Q 285 250 260 258 L 200 250 Z" fill="url(#flankGrad)" />

      {/* Root fillet - red (stress concentration zone) */}
      <path d="M 195 248 Q 185 262 175 255 Q 168 248 175 238 Q 185 230 200 242 Z" fill="#FF0000" />
      <path d="M 200 158 Q 192 145 182 148 Q 174 155 180 167 Q 190 172 202 162 Z" fill="#FF0000" />

      {/* Tooth tip - green */}
      <path d="M 260 145 L 290 138 L 300 158 L 280 170 Z" fill="#00CC44" />

      {/* Additional teeth for realism */}
      <path d="M 140 240 Q 158 230 170 238 Q 180 248 170 260 Q 155 268 140 258 Z" fill="#0044CC" opacity="0.7" />
      <path d="M 140 145 Q 158 155 165 148 Q 172 138 160 130 Q 148 125 140 135 Z" fill="#0044CC" opacity="0.7" />

      {/* Annotation lines */}
      <line x1="180" y1="252" x2="100" y2="290" stroke="white" strokeWidth="0.8" opacity="0.7" />
      <text x="92" y="286" fill="white" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">Max: 187.4 MPa</text>

      <line x1="270" y1="195" x2="360" y2="175" stroke="white" strokeWidth="0.8" opacity="0.7" />
      <text x="365" y="173" fill="white" fontSize="10" fontFamily="JetBrains Mono">Contact: 412.1 MPa</text>

      <line x1="170" y1="200" x2="90" y2="200" stroke="white" strokeWidth="0.8" opacity="0.7" />
      <text x="85" y="203" fill="white" fontSize="10" fontFamily="JetBrains Mono" textAnchor="end">Min: 8.3 MPa</text>

      {/* Displacement arrows overlay */}
      {showDisplacement && (
        <g opacity="0.7">
          <line x1="260" y1="145" x2="275" y2="128" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3,2" />
          <polygon points="275,122 270,132 280,132" fill="#60A5FA" />
          <line x1="280" y1="170" x2="296" y2="160" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3,2" />
          <line x1="260" y1="258" x2="268" y2="272" stroke="#60A5FA" strokeWidth="1.5" strokeDasharray="3,2" />
          <text x="250" y="310" fill="#60A5FA" fontSize="9" fontFamily="JetBrains Mono">×200 displacement scale</text>
        </g>
      )}

      {/* Color scale bar */}
      <rect x="460" y="80" width="16" height="200" fill="url(#scaleGrad)" rx="2" />
      <text x="458" y="78" fill="#9CA3AF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">200 MPa</text>
      <text x="458" y="130" fill="#9CA3AF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">150</text>
      <text x="458" y="182" fill="#9CA3AF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">100</text>
      <text x="458" y="234" fill="#9CA3AF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">50</text>
      <text x="458" y="285" fill="#9CA3AF" fontSize="9" fontFamily="JetBrains Mono" textAnchor="end">0 MPa</text>

      <text x="16" y="22" fill="#60A5FA" fontSize="11" fontFamily="JetBrains Mono">VON MISES STRESS — SPUR GEAR ASSEMBLY</text>
    </svg>
  );
}
