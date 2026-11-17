import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Elementos 2D do "El Niño 2026–2027".
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

/** Medidor de intensidade (FRACO → MUITO FORTE). v 0..1. */
export const IntensityMeter: React.FC<{ v: number; w?: number }> = ({ v, w = 760 }) => {
  const k = clamp(v, 0, 1);
  const levels = [
    { t: "FRACO", c: "#ffd27a" },
    { t: "MODERADO", c: "#ffb04a" },
    { t: "FORTE", c: "#ff7a3a" },
    { t: "MUITO FORTE", c: "#ff3a2a" },
  ];
  return (
    <div style={{ width: w, fontFamily: FONT }}>
      <div style={{ position: "relative", height: 70, borderRadius: 35, background: "rgba(11,8,18,0.82)", border: "4px solid #0b0812", overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: 6, top: 6, bottom: 6, width: `calc(${k * 100}% - 12px)`, borderRadius: 29, background: "linear-gradient(90deg,#ffd27a,#ffb04a 35%,#ff7a3a 65%,#ff2a1a)" }} />
        {[0.25, 0.5, 0.75].map((x) => <div key={x} style={{ position: "absolute", left: `${x * 100}%`, top: 0, bottom: 0, width: 4, background: "rgba(11,8,18,0.7)" }} />)}
      </div>
      <div style={{ display: "flex", marginTop: 8 }}>
        {levels.map((l, i) => (
          <div key={l.t} style={{ flex: 1, textAlign: "center", fontWeight: 900, fontSize: 24, color: k >= (i + 0.5) / 4 ? l.c : "#6a6080", ...stroke(4) }}>{l.t}</div>
        ))}
      </div>
    </div>
  );
};

/** Calendário "25 DEZ" com estrela de Natal (star 0..1 brilha). */
export const XmasCalendar: React.FC<{ star?: number }> = ({ star = 1 }) => (
  <div style={{ position: "relative", width: 300, fontFamily: FONT }}>
    <div style={{ height: 300, borderRadius: 30, background: "#f5f0ff", border: "10px solid #0b0812", overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.5)" }}>
      <div style={{ height: 76, background: "#2f9a5a", borderBottom: "8px solid #0b0812", color: "#fff", fontWeight: 900, fontSize: 44, textAlign: "center", lineHeight: "76px" }}>DEZEMBRO</div>
      <div style={{ fontWeight: 900, fontSize: 150, lineHeight: 1.3, color: "#c8302a", textAlign: "center" }}>25</div>
    </div>
    <svg width="120" height="120" viewBox="0 0 24 24" style={{ position: "absolute", right: -80, top: -86, opacity: clamp(star, 0, 1), transform: `scale(${0.8 + 0.2 * clamp(star, 0, 1)}) rotate(${star * 20}deg)`, filter: "drop-shadow(0 0 12px rgba(255,210,58,0.9))" }}>
      <path d="M12 1.5l3.1 6.6 7.2.9-5.3 5 1.4 7.1L12 17.6 5.6 21.1 7 14l-5.3-5 7.2-.9z" fill="#ffd23a" stroke="#0b0812" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  </div>
);

/** Linha do tempo do El Niño (previsão): curva de intensidade ago/26 → ago/27, pico nov–jan, NEUTRO no meio de 2027. */
const MONTHS = ["AGO", "SET", "OUT", "NOV", "DEZ", "JAN", "FEV", "MAR", "ABR", "MAI", "JUN", "JUL", "AGO"];
const INT = [1.2, 1.5, 1.9, 2.3, 2.5, 2.4, 2.0, 1.5, 1.0, 0.6, 0.3, 0.1, 0.0];
export const NinoTimeline: React.FC<{ draw: number; peak?: number; neutral?: number; today?: number; w?: number; h?: number }> = ({ draw, peak = 0, neutral = 0, today = 1, w = 880, h = 520 }) => {
  const x0 = 60, x1 = w - 40, y0 = h - 90, top = 70;
  const X = (i: number) => x0 + (i / (MONTHS.length - 1)) * (x1 - x0);
  const Y = (v: number) => y0 - (v / 2.7) * (y0 - top);
  const n = clamp(draw, 0, 1) * (MONTHS.length - 1);
  const pts: string[] = [];
  for (let i = 0; i <= Math.floor(n); i++) pts.push(`${X(i)},${Y(INT[i])}`);
  if (n % 1 > 0 && Math.floor(n) < MONTHS.length - 1) {
    const i = Math.floor(n), t = n - i;
    pts.push(`${X(i + t)},${Y(INT[i] + (INT[i + 1] - INT[i]) * t)}`);
  }
  const area = pts.length > 1 ? `M${X(0)},${y0} L${pts.join(" L")} L${pts[pts.length - 1].split(",")[0]},${y0} Z` : "";
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ fontFamily: FONT, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}>
      <defs>
        <linearGradient id="ninoFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor="#ff5a3a" stopOpacity="0.9" />
          <stop offset="1" stopColor="#ff9a4a" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <rect x={0} y={0} width={w} height={h} rx={26} fill="rgba(11,8,18,0.84)" stroke="#c4b5fd" strokeWidth={3} />
      <text x={x0} y={44} fill="#ffffff" fontWeight={900} fontSize={30}>EL NIÑO 2026–2027 · PREVISÃO</text>
      {/* faixa do pico */}
      <rect x={X(3) - 6} y={top} width={X(5) - X(3) + 12} height={y0 - top} rx={10} fill="#ff3a2a" opacity={0.18 * clamp(peak, 0, 1)} />
      {peak > 0.01 ? <text x={(X(3) + X(5)) / 2} y={top + 30} textAnchor="middle" fill="#ff6a4a" fontWeight={900} fontSize={30} opacity={clamp(peak, 0, 1)}>PICO</text> : null}
      {/* faixa neutra */}
      <rect x={X(9) - 6} y={top} width={X(12) - X(9) + 12} height={y0 - top} rx={10} fill="#7fe0ff" opacity={0.16 * clamp(neutral, 0, 1)} />
      {neutral > 0.01 ? <text x={(X(9) + X(12)) / 2} y={top + 30} textAnchor="middle" fill="#7fe0ff" fontWeight={900} fontSize={28} opacity={clamp(neutral, 0, 1)}>NORMAL</text> : null}
      {area ? <path d={area} fill="url(#ninoFill)" /> : null}
      {pts.length > 1 ? <polyline points={pts.join(" ")} fill="none" stroke="#ff5a3a" strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /> : null}
      <line x1={x0} x2={x1} y1={y0} y2={y0} stroke="#e3dcff" strokeWidth={3} />
      {MONTHS.map((m, i) => (
        <text key={i} x={X(i)} y={y0 + 34} textAnchor="middle" fill={i >= 3 && i <= 5 ? "#ff8a6a" : "#e3dcff"} fontWeight={800} fontSize={20}>{m}</text>
      ))}
      <text x={X(0)} y={y0 + 62} fill="#a89cc8" fontWeight={800} fontSize={18}>2026</text>
      <text x={X(5)} y={y0 + 62} textAnchor="middle" fill="#a89cc8" fontWeight={800} fontSize={18}>2027</text>
      {today > 0.01 ? (
        <g opacity={clamp(today, 0, 1)}>
          <line x1={X(3) + 10} x2={X(3) + 10} y1={top + 40} y2={y0} stroke="#ffffff" strokeWidth={3} strokeDasharray="8 6" />
          <rect x={X(3) - 32} y={y0 - 34} width={84} height={30} rx={15} fill="#ffffff" />
          <text x={X(3) + 10} y={y0 - 12} textAnchor="middle" fill="#0b0812" fontWeight={900} fontSize={18}>HOJE</text>
        </g>
      ) : null}
    </svg>
  );
};

/** Legenda de região no mapa (balão). */
export const RegionTag: React.FC<{ title: string; sub: string; color: string; icon: string }> = ({ title, sub, color, icon }) => (
  <div style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 18px", borderRadius: 18, background: "rgba(11,8,18,0.85)", border: `3px solid ${color}`, fontFamily: FONT, boxShadow: "0 8px 20px rgba(0,0,0,0.5)" }}>
    {icon ? <div style={{ fontSize: 40 }}>{icon}</div> : null}
    <div>
      <div style={{ fontWeight: 900, fontSize: 30, color }}>{title}</div>
      <div style={{ fontWeight: 800, fontSize: 20, color: "#e3dcff" }}>{sub}</div>
    </div>
  </div>
);
