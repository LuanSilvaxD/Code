import { BRAND } from "../brand";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Abertura nova dos Shorts (desde 19/11/2026, padrão do canal: Sol, Pterodáctilo, Titanic): o gancho aparece no FRAME 1,
// sem animação da fenda, e um selo pequeno da marca fica no canto o vídeo todo. A marca completa continua no encerramento.
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

/** Gancho gigante no frame 1 (sem fade de entrada). lines: [texto, cor]; a 2ª linha é a maior. v 0..1 controla a saída. */
export const HookText: React.FC<{ v: number; lines: [string, string][]; top?: number }> = ({ v, lines, top = 560 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(v, 0, 1)})` }}>
      {lines.map(([t, c], i) => (
        <div key={i} style={{ fontSize: i === 1 ? 150 : 96, lineHeight: 1.0, color: c, letterSpacing: -1, textShadow: "0 12px 30px rgba(0,0,0,0.6)", ...stroke(i === 1 ? 12 : 9) }}>{t}</div>
      ))}
    </div>
  );

/** Etiqueta do quadro/série acima do gancho (ex.: "BOATO OU VERDADE? #5"). */
export const SeriesTag: React.FC<{ v: number; text: string; top?: number }> = ({ v, text, top = 470 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: clamp(v, 0, 1) }}>
      <span style={{ display: "inline-block", padding: "8px 26px", borderRadius: 999, background: BRAND.colors.accent, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: 38, letterSpacing: 2, boxShadow: "0 8px 20px rgba(0,0,0,0.45)" }}>{text}</span>
    </div>
  );

/** Selo pequeno da marca no canto superior esquerdo (o vídeo todo). */
export const CornerBug: React.FC<{ v?: number }> = ({ v = 1 }) => (
  <div style={{ position: "absolute", left: 40, top: 70, display: "flex", alignItems: "center", gap: 10, opacity: 0.85 * clamp(v, 0, 1), fontFamily: FONT }}>
    <div style={{ width: 44, height: 44, borderRadius: 22, background: "radial-gradient(circle,#2a1d48,#0b0812)", border: `2px solid ${BRAND.colors.accent}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 4, height: 26, borderRadius: 2, background: "#f5f0ff", boxShadow: `0 0 10px ${BRAND.colors.accent}` }} />
    </div>
    <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 4, color: "#f5f0ff", ...stroke(3) }}>FENDA UMBRA</div>
  </div>
);
