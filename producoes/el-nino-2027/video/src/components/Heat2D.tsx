import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Elementos 2D do "Por que 2026 está tão quente?".
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const RED = "#ff4a3d";

/** Calendário "OUT 2026" com carimbo RECORDE (stamp 0..1). */
export const RecordCalendar: React.FC<{ stamp: number }> = ({ stamp }) => (
  <div style={{ position: "relative", width: 300, fontFamily: FONT }}>
    <div style={{ height: 300, borderRadius: 30, background: "#f5f0ff", border: "10px solid #0b0812", overflow: "hidden", boxShadow: "0 10px 24px rgba(0,0,0,0.5)" }}>
      <div style={{ height: 76, background: "#ff7a3a", borderBottom: "8px solid #0b0812", color: "#fff", fontWeight: 900, fontSize: 44, textAlign: "center", lineHeight: "76px" }}>OUTUBRO</div>
      <div style={{ fontWeight: 900, fontSize: 104, lineHeight: 1.25, color: "#171222", textAlign: "center" }}>2026</div>
    </div>
    {stamp > 0.01 ? (
      <div style={{ position: "absolute", left: -10, top: 250, transform: `rotate(-10deg) scale(${2 - clamp(stamp, 0, 1)})`, opacity: clamp(stamp * 1.6, 0, 1), padding: "4px 18px", border: `7px solid ${RED}`, borderRadius: 14, color: RED, fontWeight: 900, fontSize: 52, background: "rgba(245,240,255,0.85)" }}>RECORDE</div>
    ) : null}
  </div>
);

/** Pódio dos anos mais quentes. k 0..1 sobe as colunas; y2027 0..1 mostra a coluna tracejada de 2027. */
export const HeatPodium: React.FC<{ k: number; y2027?: number }> = ({ k, y2027 = 0 }) => {
  const cols = [
    { y: "2026", h: 0.86, place: "2º", c: "#ff8a3a" },
    { y: "2024", h: 1.0, place: "1º", c: "#ff4a3d" },
    { y: "2023", h: 0.74, place: "3º", c: "#ffb04a" },
  ];
  const H = 330;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: 18, fontFamily: FONT, height: H + 110 }}>
      {cols.map((c, i) => {
        const kk = clamp(k * 1.4 - i * 0.2, 0, 1);
        return (
          <div key={c.y} style={{ textAlign: "center", width: 150 }}>
            <div style={{ fontWeight: 900, fontSize: 40, color: "#fff", ...stroke(5) }}>{c.y}</div>
            <div style={{ height: H * c.h * kk, background: c.c, border: "6px solid #0b0812", borderRadius: "14px 14px 0 0", display: "flex", alignItems: "flex-start", justifyContent: "center", paddingTop: 10, boxSizing: "border-box", fontWeight: 900, fontSize: 48, color: "#fff", ...stroke(4) }}>{kk > 0.4 ? c.place : ""}</div>
          </div>
        );
      })}
      {y2027 > 0.01 ? (
        <div style={{ textAlign: "center", width: 150, opacity: clamp(y2027 * 2, 0, 1) }}>
          <div style={{ fontWeight: 900, fontSize: 40, color: "#ffd23a", ...stroke(5) }}>2027?</div>
          <div style={{ height: H * 1.12 * clamp(y2027, 0, 1), border: "6px dashed #ffd23a", borderRadius: "14px 14px 0 0", background: "rgba(255,210,58,0.15)" }} />
        </div>
      ) : null}
    </div>
  );
};

/** Gráfico (ESQUEMA, valores aproximados): barras anuais × média de 20 anos × linha de 1,5 °C. draw 0..1 desenha a média. */
const YEARS = Array.from({ length: 27 }, (_, i) => 2000 + i);
// anomalias aproximadas sobre o pré-industrial (esquema: tendência + variação; picos de El Niño em 2016, 2023-24, 2026)
const ANOM = YEARS.map((y) => {
  const trend = 0.78 + (y - 2000) * 0.026;
  const spike: Record<number, number> = { 2016: 0.12, 2023: 0.1, 2024: 0.13, 2026: 0.08, 2008: -0.1, 2011: -0.08, 2021: -0.07 };
  return trend + (spike[y] ?? 0) + (Math.sin(y * 1.7) * 0.03);
});
export const ParisGraph: React.FC<{ bars: number; draw: number; w?: number; h?: number; zoom?: number }> = ({ bars, draw, w = 860, h = 520 }) => {
  const x0 = 70, y0 = h - 60, x1 = w - 30, top = 40;
  const vmin = 0.5, vmax = 1.8;
  const Y = (v: number) => y0 - ((v - vmin) / (vmax - vmin)) * (y0 - top);
  const bw = (x1 - x0) / YEARS.length;
  const avg = YEARS.map((_, i) => {
    const a = ANOM.slice(Math.max(0, i - 19), i + 1);
    return a.reduce((s, v) => s + v, 0) / a.length - (i < 19 ? 0.12 * (1 - i / 19) : 0);
  });
  const nShow = Math.round(YEARS.length * clamp(bars, 0, 1));
  const nAvg = Math.round(YEARS.length * clamp(draw, 0, 1));
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} style={{ fontFamily: FONT, filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}>
      <rect x={0} y={0} width={w} height={h} rx={26} fill="rgba(11,8,18,0.82)" stroke="#c4b5fd" strokeWidth={3} />
      {YEARS.map((y, i) =>
        i < nShow ? <rect key={y} x={x0 + i * bw + 3} y={Y(ANOM[i])} width={bw - 6} height={y0 - Y(ANOM[i])} rx={4} fill={ANOM[i] > 1.5 ? "#ff4a3d" : "#ff9a4a"} /> : null,
      )}
      <line x1={x0} x2={x1} y1={Y(1.5)} y2={Y(1.5)} stroke="#ffd23a" strokeWidth={5} strokeDasharray="14 10" />
      <text x={x1 - 6} y={Y(1.5) - 12} textAnchor="end" fill="#ffd23a" fontWeight={900} fontSize={26}>LIMITE 1,5 °C</text>
      {nAvg > 1 ? <polyline points={avg.slice(0, nAvg).map((v, i) => `${x0 + i * bw + bw / 2},${Y(v)}`).join(" ")} fill="none" stroke="#7fe0ff" strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /> : null}
      {nAvg > YEARS.length - 2 ? <text x={x0 + 10} y={Y(avg[6]) - 18} textAnchor="start" fill="#7fe0ff" fontWeight={900} fontSize={24}>MÉDIA DE 20 ANOS</text> : null}
      <text x={x0} y={y0 + 36} fill="#e3dcff" fontWeight={800} fontSize={22}>2000</text>
      <text x={x1} y={y0 + 36} textAnchor="end" fill="#e3dcff" fontWeight={800} fontSize={22}>2026</text>
      <text x={x0} y={top - 6} fill="#e3dcff" fontWeight={800} fontSize={18}>ESQUEMA · VALORES APROXIMADOS</text>
    </svg>
  );
};

/** Contador "+1,75 °C". */
export const TempCounter: React.FC<{ v: number }> = ({ v }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, textAlign: "center" }}>
    <div style={{ fontSize: 140, lineHeight: 1, color: "#ff5a3a", ...stroke(8) }}>+{v.toFixed(2).replace(".", ",")}°C</div>
    <div style={{ fontSize: 30, color: "#fff", ...stroke(4) }}>OUTUBRO/2026 × ANTES DAS FÁBRICAS</div>
  </div>
);
