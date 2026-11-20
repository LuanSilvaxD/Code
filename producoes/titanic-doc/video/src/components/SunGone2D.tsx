import { BRAND } from "../brand";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Elementos 2D do vídeo-teste "E se o Sol sumisse?": gancho do frame 1, contador 8:20, selo da marca no canto.
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

/** Gancho gigante no frame 1 (sem fade de entrada). lines: [texto, cor]. v 0..1 controla a saída. */
export const HookText: React.FC<{ v: number; lines: [string, string][]; top?: number }> = ({ v, lines, top = 520 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(v, 0, 1)})` }}>
      {lines.map(([t, c], i) => (
        <div key={i} style={{ fontSize: i === 1 ? 150 : 96, lineHeight: 1.0, color: c, letterSpacing: -1, textShadow: "0 12px 30px rgba(0,0,0,0.6)", ...stroke(i === 1 ? 12 : 9) }}>{t}</div>
      ))}
    </div>
  );

/** Contador regressivo mm:ss (secs = segundos restantes). danger 0..1 deixa vermelho. */
export const Countdown: React.FC<{ secs: number; v: number; label?: string; top?: number }> = ({ secs, v, label = "ATÉ A LUZ ACABAR", top = 300 }) => {
  if (v < 0.01) return null;
  const s = Math.max(0, Math.round(secs));
  const mm = Math.floor(s / 60), ss = s % 60;
  const red = s < 60;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1) }}>
      <div style={{ display: "inline-block", padding: "6px 28px", borderRadius: 22, background: "rgba(11,8,18,0.78)", border: `4px solid ${red ? "#ff4a3d" : "#ffd27a"}` }}>
        <div style={{ fontSize: 110, lineHeight: 1, color: red ? "#ff5a4a" : "#ffd27a", fontVariantNumeric: "tabular-nums", ...stroke(6) }}>{mm}:{String(ss).padStart(2, "0")}</div>
      </div>
      <div style={{ marginTop: 6, fontSize: 28, color: "#fff", ...stroke(4) }}>{label}</div>
    </div>
  );
};

/** Contador de dias ("DIA 365"). */
export const DayCount: React.FC<{ day: number; v: number; top?: number }> = ({ day, v, top = 1060 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1) }}>
      <span style={{ fontSize: 46, color: "#fff", ...stroke(5) }}>DIA </span>
      <span style={{ fontSize: 110, color: "#9fd8ff", ...stroke(7) }}>{Math.round(day)}</span>
    </div>
  );

/** Selo pequeno da marca no canto (substitui a animação de abertura no teste). */
export const CornerBug: React.FC<{ v?: number }> = ({ v = 1 }) => (
  <div style={{ position: "absolute", left: 40, top: 70, display: "flex", alignItems: "center", gap: 10, opacity: 0.85 * clamp(v, 0, 1), fontFamily: FONT }}>
    <div style={{ width: 44, height: 44, borderRadius: 22, background: "radial-gradient(circle,#2a1d48,#0b0812)", border: `2px solid ${BRAND.colors.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 4, height: 26, borderRadius: 2, background: "#f5f0ff", boxShadow: `0 0 10px ${BRAND.colors.accent}` }} />
    </div>
    <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 4, color: "#f5f0ff", ...stroke(3) }}>FENDA UMBRA</div>
  </div>
);
