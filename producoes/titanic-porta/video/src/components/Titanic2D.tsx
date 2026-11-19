import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// 2D do "O Jack cabia na porta?": relógio do resgate (0 → 2 h, marca de 15 min) e cartão de temperatura.
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

/** Relógio de 0 a 120 min: setor vermelho até 15 min ("APAGA"), ponteiro em `min`. */
export const RescueClock: React.FC<{ min: number; v: number; size?: number }> = ({ min, v, size = 330 }) => {
  if (v < 0.01) return null;
  const R = size / 2, m = clamp(min, 0, 120);
  const ang = (m / 120) * 360;
  const pt = (deg: number, r: number) => [R + r * Math.sin((deg * Math.PI) / 180), R - r * Math.cos((deg * Math.PI) / 180)];
  const [x15, y15] = pt(45, R * 0.86);
  const late = m >= 15;
  return (
    <div style={{ position: "relative", width: size, height: size + 70, opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1.1)})`, fontFamily: FONT }}>
      <svg width={size} height={size}>
        <circle cx={R} cy={R} r={R - 6} fill="rgba(11,8,18,0.82)" stroke="#e8e0d0" strokeWidth={6} />
        <path d={`M ${R} ${R} L ${R} ${R * 0.14} A ${R * 0.86} ${R * 0.86} 0 0 1 ${x15} ${y15} Z`} fill="rgba(255,74,61,0.55)" />
        {Array.from({ length: 12 }, (_, i) => {
          const [a1, b1] = pt(i * 30, R * 0.8), [a2, b2] = pt(i * 30, R * 0.92);
          return <line key={i} x1={a1} y1={b1} x2={a2} y2={b2} stroke="#e8e0d0" strokeWidth={i % 3 === 0 ? 6 : 3} />;
        })}
        {(() => {
          const [hx, hy] = pt(ang, R * 0.74);
          return <line x1={R} y1={R} x2={hx} y2={hy} stroke={late ? "#ffd27a" : "#ff6a5a"} strokeWidth={10} strokeLinecap="round" />;
        })()}
        <circle cx={R} cy={R} r={12} fill="#e8e0d0" />
        <text x={x15 + 14} y={y15 - 4} fill="#ff8a7a" fontWeight={900} fontSize={26} fontFamily={FONT}>15 MIN</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: size + 6, textAlign: "center", fontWeight: 900, fontSize: 46, color: late ? "#ffd27a" : "#ff6a5a", ...stroke(5) }}>
        {m < 60 ? `${Math.round(m)} MIN` : `${Math.floor(m / 60)} H ${String(Math.round(m % 60)).padStart(2, "0")}`}
      </div>
    </div>
  );
};

/** Cartão grande de temperatura (ex.: −2 °C). */
export const TempCard: React.FC<{ c: number; v: number }> = ({ c, v }) =>
  v < 0.01 ? null : (
    <div style={{ display: "inline-flex", alignItems: "baseline", gap: 8, padding: "6px 26px", borderRadius: 22, background: "rgba(11,8,18,0.8)", border: "4px solid #7ac8ff", opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1.1)})`, fontFamily: FONT, fontWeight: 900 }}>
      <span style={{ fontSize: 96, color: "#bfe6ff", fontVariantNumeric: "tabular-nums", ...stroke(6) }}>{c < 0 ? `−${Math.abs(Math.round(c))}` : Math.round(c)}</span>
      <span style={{ fontSize: 46, color: "#fff", ...stroke(4) }}>°C</span>
    </div>
  );
