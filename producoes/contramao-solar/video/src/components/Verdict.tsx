import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Medidor do veredito do quadro "Boato ou Verdade?": semicírculo BOATO (vermelho, esquerda) ↔ VERDADE (verde, direita).
// needle em graus: 0 = meio, −90 = BOATO total, +90 = VERDADE total. show 0..1; size = largura em px.

const RED = "#ff4a3d";
const GREEN = "#3fd27a";

export const VerdictMeter: React.FC<{ show: number; needle: number; size?: number; top?: number; verdict?: number }> = ({ show, needle, size = 420, top = 1080, verdict = 0 }) => {
  const a = clamp(show, 0, 1);
  if (a < 0.01) return null;
  const R = size / 2;
  const n = clamp(needle, -95, 95);
  const seg = (from: number, to: number, color: string) => {
    const p = (deg: number, r: number) => {
      const t = ((deg - 90) * Math.PI) / 180;
      return [R + r * Math.cos(t), R + r * Math.sin(t)];
    };
    const [x0, y0] = p(from, R - 8);
    const [x1, y1] = p(to, R - 8);
    const [x2, y2] = p(to, R * 0.62);
    const [x3, y3] = p(from, R * 0.62);
    return <path d={`M${x0},${y0} A${R - 8},${R - 8} 0 0 1 ${x1},${y1} L${x2},${y2} A${R * 0.62},${R * 0.62} 0 0 0 ${x3},${y3} Z`} fill={color} stroke="#0b0812" strokeWidth={5} />;
  };
  const hit = clamp(verdict, 0, 1);
  return (
    <div style={{ position: "absolute", left: 540 - R, top, width: size, height: R + 70, opacity: a, transform: `scale(${0.85 + 0.15 * a})`, transformOrigin: "50% 100%", fontFamily: FONT }}>
      <svg width={size} height={R + 20} viewBox={`0 0 ${size} ${R + 20}`} style={{ overflow: "visible", filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.55))" }}>
        {seg(-90, -30, RED)}
        {seg(-30, 30, "#f2c14e")}
        {seg(30, 90, GREEN)}
        {/* ponteiro */}
        <g transform={`rotate(${n} ${R} ${R})`}>
          <path d={`M${R - 12},${R} L${R},${R * 0.18} L${R + 12},${R} Z`} fill="#f5f0ff" stroke="#0b0812" strokeWidth={5} />
        </g>
        <circle cx={R} cy={R} r={22} fill="#8b5cf6" stroke="#0b0812" strokeWidth={5} />
        {hit > 0.01 ? <circle cx={R} cy={R} r={R * (0.6 + 0.6 * hit)} fill="none" stroke={RED} strokeWidth={8} opacity={1 - hit} /> : null}
      </svg>
      <div style={{ position: "absolute", left: -10, top: R + 6, color: RED, fontWeight: 900, fontSize: size * 0.085, WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" }}>✖ BOATO</div>
      <div style={{ position: "absolute", right: -10, top: R + 6, color: GREEN, fontWeight: 900, fontSize: size * 0.085, WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" }}>VERDADE ✔</div>
    </div>
  );
};
