import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Elementos 2D do "Cidade perdida na Amazônia".
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

/** Card de post viral (fake genérico, sem marca de rede social): "RATANABÁ", views subindo, corações. */
export const ViralCard: React.FC<{ views: number; t: number }> = ({ views, t }) => (
  <div style={{ position: "relative", width: 520, fontFamily: FONT }}>
    <div style={{ borderRadius: 26, background: "rgba(245,240,255,0.97)", border: "4px solid #0b0812", padding: "18px 22px", boxShadow: "0 14px 30px rgba(0,0,0,0.5)" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: "linear-gradient(135deg,#ffcf3a,#ff8a2a)" }} />
        <div>
          <div style={{ fontWeight: 900, fontSize: 24, color: "#171222" }}>VIRALIZOU EM 2022</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#6b5a9a" }}>"cidade perdida de 450 milhões de anos"</div>
        </div>
      </div>
      <div style={{ marginTop: 12, fontWeight: 900, fontSize: 52, color: "#c8901a", ...stroke(3) }}>RATANABÁ</div>
      <div style={{ marginTop: 8, fontWeight: 900, fontSize: 30, color: "#171222" }}>{Math.round(views).toLocaleString("pt-BR")} visualizações</div>
    </div>
    {Array.from({ length: 6 }, (_, i) => {
      const ph = (t * 0.03 + i / 6) % 1;
      return <div key={i} style={{ position: "absolute", right: 20 + (i % 3) * 30, top: 40 - ph * 140, opacity: 1 - ph, transform: `scale(${0.6 + ph * 0.6})` }}><svg width="44" height="40" viewBox="0 0 24 22"><path d="M12 21s-8-5.3-10.4-10C-0.2 6.6 2.6 1.5 7 1.5c2.2 0 3.8 1.3 5 3 1.2-1.7 2.8-3 5-3 4.4 0 7.2 5.1 5.4 9.5C20 15.7 12 21 12 21z" fill="#ff4a6a" stroke="#0b0812" strokeWidth="1.4" /></svg></div>;
    })}
  </div>
);

/** Régua do tempo (escala real, 450 mi → hoje): marcadores Ratanabá (450 mi), dinossauros (~230 mi), humanos (~300 mil). */
export const TimeRuler: React.FC<{ k: number; dino?: number; human?: number; w?: number }> = ({ k, dino = 0, human = 0, w = 900 }) => {
  const x0 = 40, x1 = w - 40;
  const X = (ma: number) => x1 - (ma / 450) * (x1 - x0); // milhões de anos atrás
  const kk = clamp(k, 0, 1);
  return (
    <svg width={w} height={360} viewBox={`0 0 ${w} 360`} style={{ fontFamily: FONT, overflow: "visible", filter: "drop-shadow(0 10px 24px rgba(0,0,0,0.5))" }}>
      <rect x={0} y={0} width={w} height={360} rx={26} fill="rgba(11,8,18,0.85)" stroke="#c4b5fd" strokeWidth={3} />
      <text x={x0} y={44} fill="#ffffff" fontWeight={900} fontSize={28}>LINHA DO TEMPO (ESCALA REAL)</text>
      <line x1={x0} x2={x0 + (x1 - x0) * kk} y1={200} y2={200} stroke="#e3dcff" strokeWidth={8} strokeLinecap="round" />
      {[450, 300, 150, 0].map((m) => (
        <g key={m} opacity={kk}>
          <line x1={X(m)} x2={X(m)} y1={186} y2={214} stroke="#e3dcff" strokeWidth={4} />
          <text x={X(m)} y={246} textAnchor="middle" fill="#a89cc8" fontWeight={800} fontSize={20}>{m === 0 ? "HOJE" : `${m} MI`}</text>
        </g>
      ))}
      {kk > 0.05 ? (
        <g>
          <circle cx={X(450)} cy={200} r={18} fill="#ffcf3a" stroke="#0b0812" strokeWidth={4} />
          <text x={X(450)} y={150} textAnchor="start" fill="#ffcf3a" fontWeight={900} fontSize={26}>"RATANABÁ" (450 MI)</text>
        </g>
      ) : null}
      {dino > 0.01 ? (
        <g opacity={clamp(dino, 0, 1)}>
          <circle cx={X(230)} cy={200} r={16} fill="#7ad86a" stroke="#0b0812" strokeWidth={4} />
          <text x={X(230)} y={110} textAnchor="middle" fill="#7ad86a" fontWeight={900} fontSize={24}>DINOSSAUROS</text>
          <text x={X(230)} y={138} textAnchor="middle" fill="#7ad86a" fontWeight={800} fontSize={20}>~230 MI</text>
          <line x1={X(230)} x2={X(230)} y1={146} y2={184} stroke="#7ad86a" strokeWidth={3} />
        </g>
      ) : null}
      {human > 0.01 ? (
        <g opacity={clamp(human, 0, 1)}>
          <circle cx={X(0.3)} cy={200} r={10} fill="#ff6a8a" stroke="#0b0812" strokeWidth={3} />
          <text x={X(0.3) - 6} y={300} textAnchor="end" fill="#ff8aa0" fontWeight={900} fontSize={24}>SER HUMANO: ~0,3 MI</text>
          <text x={X(0.3) - 6} y={328} textAnchor="end" fill="#ff8aa0" fontWeight={800} fontSize={18}>(QUASE NO "HOJE")</text>
          <line x1={X(0.3)} x2={X(0.3)} y1={214} y2={280} stroke="#ff8aa0" strokeWidth={3} />
        </g>
      ) : null}
    </svg>
  );
};

/** Contador grande com rótulo (ex.: "6.000+ PLATAFORMAS"). */
export const BigCount: React.FC<{ v: number; label: string; color?: string }> = ({ v, label, color = "#ffcf3a" }) => (
  <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
    <div style={{ fontSize: 130, lineHeight: 1, color, ...stroke(8) }}>{Math.round(v).toLocaleString("pt-BR")}+</div>
    <div style={{ fontSize: 36, color: "#fff", ...stroke(5) }}>{label}</div>
  </div>
);

/** Régua de altura (22 m). */
export const HeightTag: React.FC<{ text?: string }> = ({ text = "22 M" }) => (
  <div style={{ display: "inline-block", padding: "8px 18px", borderRadius: 14, background: "rgba(11,8,18,0.85)", border: "3px solid #ffcf3a", color: "#ffcf3a", fontFamily: FONT, fontWeight: 900, fontSize: 40 }}>ALTURA: {text}</div>
);
