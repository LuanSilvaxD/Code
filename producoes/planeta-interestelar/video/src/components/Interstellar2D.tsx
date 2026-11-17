import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Elementos 2D do "Filme × Realidade #1" (relógio, contador de dias, celular com mapa, medidor de rotação, termômetro).
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
/** Intervalo do tic (s): 7 anos ≈ 2.557 dias por hora → 3600/2557 ≈ 1,408 s por dia terrestre. */
export const TICK_SECONDS = 3600 / 2557;

/** Relógio do planeta: mostrador + ponteiro que salta 1 passo por tic. ticks = nº de tics já dados (pode ser fracionário: o salto é rápido). */
export const Clock2D: React.FC<{ ticks: number; size?: number; label?: string }> = ({ ticks, size = 300, label = "PLANETA" }) => {
  const whole = Math.floor(ticks);
  const frac = ticks - whole;
  const jump = whole + clamp(frac / 0.12, 0, 1); // salto rápido no início de cada tic
  const ang = jump * 6; // 6° por tic (como um ponteiro de segundos)
  const R = size / 2;
  return (
    <div style={{ width: size, textAlign: "center", fontFamily: FONT }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}>
        <circle cx={R} cy={R} r={R - 8} fill="#f5f0ff" stroke="#0b0812" strokeWidth={10} />
        <circle cx={R} cy={R} r={R - 22} fill="none" stroke="#8b5cf6" strokeWidth={4} />
        {Array.from({ length: 60 }, (_, i) => {
          const a = (i / 60) * Math.PI * 2;
          const L = i % 5 === 0 ? 22 : 10;
          return <line key={i} x1={R + Math.sin(a) * (R - 30)} y1={R - Math.cos(a) * (R - 30)} x2={R + Math.sin(a) * (R - 30 - L)} y2={R - Math.cos(a) * (R - 30 - L)} stroke="#2a2240" strokeWidth={i % 5 === 0 ? 6 : 3} />;
        })}
        <g transform={`rotate(${ang} ${R} ${R})`}>
          <line x1={R} y1={R + 20} x2={R} y2={30} stroke="#ff4a3d" strokeWidth={8} strokeLinecap="round" />
        </g>
        <circle cx={R} cy={R} r={14} fill="#2a2240" />
      </svg>
      <div style={{ marginTop: 6, fontWeight: 900, fontSize: size * 0.11, color: "#c4b5fd", ...stroke(4) }}>{label}</div>
    </div>
  );
};

/** Contador "DIAS NA TERRA" que soma +1 com pop a cada tic. */
export const DayCounter: React.FC<{ ticks: number }> = ({ ticks }) => {
  const n = Math.floor(ticks);
  const pop = 1 + 0.25 * Math.max(0, 1 - (ticks - n) / 0.25);
  return (
    <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
      <div style={{ fontSize: 40, color: "#fff", ...stroke(5) }}>DIAS NA TERRA</div>
      <div style={{ fontSize: 150, lineHeight: 1, color: "#ffcf3a", transform: `scale(${pop})`, ...stroke(8) }}>+{n}</div>
    </div>
  );
};

/** Calendário "7 ANOS" (contagem 0..7). */
export const YearsCard: React.FC<{ years: number; label?: string }> = ({ years, label = "TERRA" }) => (
  <div style={{ width: 300, textAlign: "center", fontFamily: FONT }}>
    <div style={{ height: 300, borderRadius: 30, background: "#f5f0ff", border: "10px solid #0b0812", boxShadow: "0 10px 24px rgba(0,0,0,0.5)", overflow: "hidden" }}>
      <div style={{ height: 70, background: "#e5484d", borderBottom: "8px solid #0b0812" }} />
      <div style={{ fontWeight: 900, fontSize: 120, lineHeight: 1.1, color: "#171222" }}>{Math.round(years)}</div>
      <div style={{ fontWeight: 900, fontSize: 40, color: "#5b33d6" }}>ANOS</div>
    </div>
    <div style={{ marginTop: 6, fontWeight: 900, fontSize: 33, color: "#7fe0ff", ...stroke(4) }}>{label}</div>
  </div>
);

/** Celular com mapa: o pino "você" escorrega (drift 0..1) e um ✔ corrige (fix 0..1). */
export const PhoneMap: React.FC<{ drift: number; fix: number; w?: number }> = ({ drift, fix, w = 360 }) => {
  const h = w * 1.9;
  const d = clamp(drift, 0, 1) * (1 - clamp(fix, 0, 1));
  const px = w * 0.5 + d * w * 0.3, py = h * 0.52 - d * h * 0.22;
  return (
    <div style={{ position: "relative", width: w, height: h, borderRadius: 46, background: "#0b0812", padding: 14, boxSizing: "border-box", boxShadow: "0 16px 34px rgba(0,0,0,0.55)" }}>
      <div style={{ position: "relative", width: "100%", height: "100%", borderRadius: 34, overflow: "hidden", background: "#e8efe2" }}>
        {/* ruas */}
        <svg width="100%" height="100%" viewBox={`0 0 ${w} ${h}`} style={{ position: "absolute", inset: 0 }}>
          <rect x={w * 0.62} y={h * 0.08} width={w * 0.3} height={h * 0.2} fill="#bfe0b0" />
          <rect x={w * 0.06} y={h * 0.66} width={w * 0.34} height={h * 0.18} fill="#a8d0f0" />
          {[0.2, 0.45, 0.72].map((k) => <rect key={k} x={0} y={h * k} width={w} height={14} fill="#fff" />)}
          {[0.3, 0.68].map((k) => <rect key={k} x={w * k} y={0} width={14} height={h} fill="#fff" />)}
          <rect x={w * 0.3} y={h * 0.45} width={w * 0.38} height={14} fill="#ffd36b" />
        </svg>
        {/* pino */}
        <div style={{ position: "absolute", left: px - 26, top: py - 64 }}>
          <svg width="52" height="68" viewBox="0 0 24 32"><path d="M12 0C5.4 0 0 5.2 0 11.6 0 20 12 32 12 32s12-12 12-20.4C24 5.2 18.6 0 12 0z" fill={d > 0.05 ? "#ff4a3d" : "#3fd27a"} stroke="#0b0812" strokeWidth="1.6" /><circle cx="12" cy="11.5" r="4.5" fill="#fff" /></svg>
        </div>
        {d > 0.05 ? <div style={{ position: "absolute", left: w * 0.1, right: w * 0.1, bottom: 26, padding: "8px 10px", borderRadius: 14, background: "#ff4a3d", color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 22, textAlign: "center" }}>ERRO: +{(d * 10).toFixed(1)} KM</div> : null}
        {fix > 0.05 ? <div style={{ position: "absolute", left: w * 0.1, right: w * 0.1, bottom: 26, padding: "8px 10px", borderRadius: 14, background: "#3fd27a", color: "#0b0812", fontFamily: FONT, fontWeight: 900, fontSize: 22, textAlign: "center", opacity: clamp(fix, 0, 1) }}>✔ CORRIGIDO</div> : null}
      </div>
    </div>
  );
};

/** Medidor de rotação do buraco negro (0..1 → 0..99,9%). */
export const SpinGauge: React.FC<{ v: number; size?: number }> = ({ v, size = 420 }) => {
  const R = size / 2;
  const k = clamp(v, 0, 1);
  const ang = -120 + 240 * k;
  const arc = (a0: number, a1: number, color: string) => {
    const p = (a: number, r: number) => [R + r * Math.sin((a * Math.PI) / 180), R - r * Math.cos((a * Math.PI) / 180)];
    const [x0, y0] = p(a0, R - 20), [x1, y1] = p(a1, R - 20);
    return <path d={`M${x0},${y0} A${R - 20},${R - 20} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1},${y1}`} fill="none" stroke={color} strokeWidth={26} />;
  };
  return (
    <div style={{ width: size, textAlign: "center", fontFamily: FONT }}>
      <svg width={size} height={size * 0.8} viewBox={`0 0 ${size} ${size * 0.8}`} style={{ filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}>
        {arc(-120, 40, "#4a3a7a")}
        {arc(40, 100, "#ffb03a")}
        {arc(100, 120, "#ff4a3d")}
        <g transform={`rotate(${ang} ${R} ${R})`}>
          <path d={`M${R - 10},${R} L${R},${36} L${R + 10},${R} Z`} fill="#f5f0ff" stroke="#0b0812" strokeWidth={4} />
        </g>
        <circle cx={R} cy={R} r={20} fill="#8b5cf6" stroke="#0b0812" strokeWidth={4} />
      </svg>
      <div style={{ marginTop: -size * 0.12, fontWeight: 900, fontSize: size * 0.17, color: k > 0.9 ? "#ff6a4a" : "#fff", ...stroke(6) }}>{(k * 99.9).toFixed(1)}%</div>
      <div style={{ fontWeight: 900, fontSize: size * 0.075, color: "#c4b5fd", ...stroke(4) }}>ROTAÇÃO DO BURACO NEGRO</div>
    </div>
  );
};

/** Termômetro: v 0..1; faixa verde = habitável. */
export const Thermo: React.FC<{ v: number; h?: number }> = ({ v, h = 420 }) => {
  const k = clamp(v, 0, 1);
  const tube = h - 90;
  return (
    <div style={{ position: "relative", width: 200, height: h, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 60, top: 0, width: 56, height: tube + 20, borderRadius: 28, background: "#f5f0ff", border: "8px solid #0b0812", boxSizing: "border-box", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: tube * 0.25, height: tube * 0.22, background: "rgba(63,210,122,0.35)" }} />
        <div style={{ position: "absolute", left: 8, right: 8, bottom: 0, height: tube * 0.62 * k + 10, borderRadius: 14, background: "linear-gradient(0deg,#ff4a3d,#ff8a3a)" }} />
      </div>
      <div style={{ position: "absolute", left: 40, top: tube - 6, width: 96, height: 96, borderRadius: 48, background: "#ff4a3d", border: "8px solid #0b0812", boxSizing: "border-box" }} />
      <div style={{ position: "absolute", left: 124, top: tube * 0.27, fontWeight: 900, fontSize: 26, color: "#3fd27a", ...stroke(4), whiteSpace: "nowrap" }}>HABITÁVEL</div>
    </div>
  );
};
