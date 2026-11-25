import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";

// Camada 2D global do vídeo da Voyager: relógio de 24 h, velocímetro, distância, saudação do disco, barra de energia
// e o selo ESQUEMÁTICO. Tudo dirigido por trilhas (frame global).
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

const Clock: React.FC<{ v: number; h: number }> = ({ v, h }) => {
  if (v < 0.01) return null;
  const a = (h / 12) * Math.PI * 2; // ponteiro das horas dá 2 voltas em 24 h
  const days = Math.floor(h / 24 + 1e-6);
  return (
    <div style={{ position: "absolute", right: 90, top: 380, opacity: clamp(v, 0, 1), transform: `scale(${0.85 + 0.15 * clamp(v, 0, 1)})`, textAlign: "center", fontFamily: FONT }}>
      <svg width="210" height="210" viewBox="-110 -110 220 220">
        <circle r="100" fill="rgba(11,8,18,0.82)" stroke="#ffd27a" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => {
          const t = (i / 12) * Math.PI * 2;
          return <line key={i} x1={Math.sin(t) * 80} y1={-Math.cos(t) * 80} x2={Math.sin(t) * 92} y2={-Math.cos(t) * 92} stroke="#ece6ff" strokeWidth={i % 3 === 0 ? 6 : 3} />;
        })}
        <line x1="0" y1="0" x2={Math.sin(a) * 58} y2={-Math.cos(a) * 58} stroke="#ffd27a" strokeWidth="9" strokeLinecap="round" />
        <line x1="0" y1="0" x2={Math.sin(a * 12) * 82} y2={-Math.cos(a * 12) * 82} stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
        <circle r="8" fill="#ffd27a" />
      </svg>
      <div style={{ marginTop: -6, fontWeight: 900, fontSize: 40, color: "#ffd27a", ...stroke(5) }}>{days >= 2 ? "+2 DIAS" : days >= 1 ? "+1 DIA" : `${Math.floor(h)} H`}</div>
    </div>
  );
};

const Big: React.FC<{ v: number; top: number; children: React.ReactNode; sub?: string }> = ({ v, top, children, sub }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1), transform: `scale(${0.9 + 0.1 * clamp(v, 0, 1)})` }}>
      <div style={{ fontSize: 96, color: "#ffffff", lineHeight: 1, ...stroke(9) }}>{children}</div>
      {sub ? <div style={{ fontSize: 34, color: "#c4b5fd", marginTop: 6, letterSpacing: 2, ...stroke(5) }}>{sub}</div> : null}
    </div>
  );

const GREET = ["PAZ", "E", "FELICIDADE", "A", "TODOS"];
const Greeting: React.FC<{ n: number; v: number }> = ({ n, v }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 90, right: 90, top: 1040, textAlign: "center", opacity: clamp(v, 0, 1), fontFamily: FONT }}>
      <div style={{ display: "inline-block", padding: "18px 30px", borderRadius: 26, background: "rgba(40,28,6,0.82)", border: "4px solid #e2b85a", boxShadow: "0 0 40px rgba(226,184,90,0.45)" }}>
        <div style={{ fontWeight: 800, fontSize: 26, letterSpacing: 4, color: "#e2b85a" }}>SAUDAÇÃO EM PORTUGUÊS · DISCO DE OURO</div>
        <div style={{ fontWeight: 900, fontSize: 64, lineHeight: 1.1, color: "#fff4d8", ...stroke(4) }}>
          {GREET.map((w, i) => <span key={i} style={{ opacity: n > i ? 1 : 0.12, marginRight: 14 }}>{w}</span>)}
        </div>
      </div>
    </div>
  );

const Energy: React.FC<{ v: number; level: number }> = ({ v, level }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", left: 90, top: 400, opacity: clamp(v, 0, 1), fontFamily: FONT, textAlign: "center" }}>
      <div style={{ width: 84, height: 260, borderRadius: 18, border: "5px solid #ece6ff", background: "rgba(11,8,18,0.8)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 6, right: 6, bottom: 6, height: `${clamp(level, 0, 1) * 236}px`, borderRadius: 10, background: level > 0.5 ? "#ff8a3a" : "#ff4a3d", boxShadow: "0 0 24px rgba(255,120,40,0.7)" }} />
      </div>
      <div style={{ marginTop: 6, fontWeight: 900, fontSize: 26, color: "#ffffff", ...stroke(4) }}>ENERGIA</div>
    </div>
  );

const Schematic: React.FC<{ v: number }> = ({ v }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", right: 40, top: 76, opacity: 0.85 * clamp(v, 0, 1), fontFamily: FONT, fontWeight: 800, fontSize: 20, letterSpacing: 3, color: "#ece6ff", padding: "6px 14px", borderRadius: 999, border: "2px solid rgba(236,230,255,0.6)", background: "rgba(11,8,18,0.6)" }}>ESQUEMÁTICO · FORA DE ESCALA</div>
  );

export const VoyOverlay: React.FC = () => {
  const f = useCurrentFrame();
  const sp = track("speed", f);
  return (
    <>
      <Clock v={track("clock.v", f)} h={track("clock.h", f)} />
      <Big v={track("speed.v", f)} top={1120} sub="SEM PARAR, HÁ QUASE 50 ANOS">{Math.round(sp).toLocaleString("pt-BR")} KM/H</Big>
      <Big v={track("dist.v", f)} top={1120} sub="BILHÕES DE KM · 1 DIA-LUZ">≈ 25,9</Big>
      <Greeting n={track("greet", f)} v={track("greet.v", f)} />
      <Energy v={track("energy.v", f)} level={track("rtg", f, 0.7)} />
      <Schematic v={track("esq.v", f)} />
    </>
  );
};
