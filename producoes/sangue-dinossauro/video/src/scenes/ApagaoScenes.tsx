import { useCurrentFrame } from "remotion";
import { brPos } from "../components/Apagao";
import { cameraPoseAt } from "../components/CameraController";
import { SeriesCard } from "../components/Series";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, BRAZIL, ITAIPU } from "../data/apagao";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "apagão mundial" (quadro Boato ou Verdade?).
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const BLUE = "#3d8bff";
const ORANGE = "#ff9a3c";
const RED = "#ff4a3d";
const GREEN = "#3fd27a";
const YEL = "#f2c14e";
const STROKE = { WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" } as const;

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const Panel: React.FC<{ children: React.ReactNode; top: number; v: number; width?: number }> = ({ children, top, v, width = 760 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, left: 540 - width / 2, width, opacity: clamp(v, 0, 1), transform: `translateY(${(1 - clamp(v, 0, 1)) * 30}px) scale(${0.92 + 0.08 * clamp(v, 0, 1)})`, padding: "18px 24px", borderRadius: 26, background: "rgba(11,8,18,0.78)", border: "2px solid rgba(196,181,253,0.45)", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", fontFamily: FONT, color: "#fff" }}>
      {children}
    </div>
  );

/* s1 — posts virais genéricos */
const Post: React.FC<{ v: number; side: 1 | -1; top: number; text: string; likes: string; rot: number }> = ({ v, side, top, text, likes, rot }) => {
  const k = clamp(v, 0, 1);
  if (k < 0.01) return null;
  return (
    <div style={{ position: "absolute", top, left: side < 0 ? 70 : 410, width: 600, transform: `translateX(${(1 - k) * side * 700}px) rotate(${rot}deg)`, padding: 22, borderRadius: 24, background: "#f7f7fb", boxShadow: "0 16px 40px rgba(0,0,0,0.55)", fontFamily: FONT, color: "#16141f" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div style={{ width: 54, height: 54, borderRadius: 27, background: side < 0 ? "#9a8cf0" : "#f0a07a" }} />
        <div>
          <div style={{ width: 170, height: 14, borderRadius: 7, background: "#c9c7d4" }} />
          <div style={{ width: 110, height: 11, borderRadius: 6, background: "#dedce6", marginTop: 8 }} />
        </div>
      </div>
      <div style={{ marginTop: 16, fontWeight: 900, fontSize: 36, lineHeight: 1.12 }}>{text}</div>
      <div style={{ marginTop: 14, display: "flex", gap: 26, color: "#6a6778", fontWeight: 800, fontSize: 24 }}>
        <span style={{ color: RED }}>♥ {likes}</span>
        <span>↗ compartilhar</span>
      </div>
    </div>
  );
};
const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("posts.cards", g);
  return (
    <>
      <Post v={v} side={-1} top={560} text="APAGÃO MUNDIAL DIA 17/11!!! 3 DIAS SEM LUZ" likes="48 mil" rot={-3} />
      <Post v={clamp(v * 1.2 - 0.2, 0, 1)} side={1} top={850} text="Os Simpsons previram... prepare velas e água" likes="31 mil" rot={2.5} />
    </>
  );
};

/* s2 — cartão do quadro + medidor balançando */
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <SeriesCard v={track("series.card", g)} top={520} />
      <VerdictMeter show={track("verdict.show", g)} needle={track("verdict.wobble", g) * 22 * Math.sin(g / 5)} size={380} top={1090} />
    </>
  );
};

/* s5 — medidor inclina para BOATO */
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <VerdictMeter show={track("verdict.show", g)} needle={track("verdict.needle", g)} size={330} top={1110} />;
};

const S6: React.FC<SceneProps> = ({ scene }) => <Seal v={track("seal.v", useG(scene))} />;

/* s7 — ondas 60 Hz × 50 Hz */
const Wave: React.FC<{ v: number; hz: number; color: string; label: string; g: number }> = ({ v, hz, color, label, g }) => {
  const k = clamp(v, 0, 1);
  if (k < 0.01) return null;
  const Wd = 520;
  const cycles = hz / 10; // 6 × 5 ciclos na mesma largura
  const pts = Array.from({ length: 121 }, (_, i) => {
    const x = (i / 120) * Wd;
    const y = 34 - 26 * Math.sin((i / 120) * cycles * Math.PI * 2 - g * 0.12 * (hz / 50));
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: k, marginTop: 6 }}>
      <div style={{ width: 170, fontWeight: 900, fontSize: 30, color, ...STROKE }}>{label}</div>
      <svg width={Wd} height={68} style={{ clipPath: `inset(0 ${(1 - k) * 100}% 0 0)` }}>
        <polyline points={pts} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" />
      </svg>
    </div>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const a = track("wave60", g);
  const b = track("wave50", g);
  return (
    <>
      <Seal v={track("seal.v", g)} top={1030} />
      <Panel top={1100} v={Math.max(a, b)} width={780}>
        <Wave v={a} hz={60} color={BLUE} label="60 Hz" g={g} />
        <Wave v={b} hz={50} color={ORANGE} label="50 Hz" g={g} />
      </Panel>
    </>
  );
};

/* s8 — Itaipu: rótulos dos dois lados */
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const v = track("itaipu.labels", g);
  return (
    <>
      <WorldLabel pose={pose} point={add(ITAIPU, [-2.1, -0.2, 0.75])} text="BRASIL · 60 Hz" appear={v} offset={[0, -130]} size={34} accent={BLUE} />
      <WorldLabel pose={pose} point={add(ITAIPU, [2.1, -0.2, 0.75])} text="PARAGUAI · 50 Hz" appear={v} offset={[0, -130]} size={34} accent={ORANGE} />
      <Seal v={1} top={1250} />
    </>
  );
};

/* s9 — contador de estados + rótulo do Ceará */
const S9: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const n = Math.round(track("counter", g));
  const pose = cameraPoseAt(g);
  const sp = track("line.spark", g);
  return (
    <>
      <WorldLabel pose={pose} point={add(BRAZIL, brPos("CE"))} text="CEARÁ" appear={sp} offset={[0, -110]} size={34} accent={RED} />
      <Panel top={1110} v={n > 0 ? 1 : 0} width={620}>
        <div style={{ textAlign: "center", fontWeight: 900 }}>
          <span style={{ fontSize: 96, color: RED, ...STROKE }}>{Math.min(n, 25)}</span>
          <span style={{ fontSize: 44, marginLeft: 14 }}>ESTADOS</span>
          <span style={{ fontSize: 44, marginLeft: 14, color: YEL, opacity: n >= 26 ? 1 : 0 }}>+ DF</span>
        </div>
      </Panel>
      <Seal v={1} top={1290} />
    </>
  );
};

/* s10 — Roraima */
const S10: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(BRAZIL, add(brPos("RR"), [0, 0.3, 0]))} text="RORAIMA" appear={track("roraima.glow", g)} offset={[0, -120]} size={38} accent={GREEN} />
      <WorldLabel pose={pose} point={add(BRAZIL, add(brPos("RR"), [0.3, 0.2, 1.6]))} text="SEM FIOS" appear={track("gap.show", g) * (1 - track("lines.trace", g))} offset={[120, 30]} size={28} accent={RED} />
      <Seal v={1} top={1250} />
    </>
  );
};

/* s12 — relógio de 9 horas */
const S12: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const h = track("clock.hours", g);
  if (h < 0.01) return null;
  return (
    <Panel top={1070} v={clamp(h * 2, 0, 1)} width={460}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
        <svg width={130} height={130} viewBox="0 0 130 130">
          <circle cx={65} cy={65} r={58} fill="#f5f0ff" stroke="#0b0812" strokeWidth={6} />
          <path d={`M65,65 L${65 + 58 * Math.sin((h / 12) * Math.PI * 2)},${65 - 58 * Math.cos((h / 12) * Math.PI * 2)} A58,58 0 ${h > 6 ? 1 : 0} 0 65,7 Z`} fill="#2a3150" opacity={0.85} />
          <line x1={65} y1={65} x2={65 + 44 * Math.sin((h / 12) * Math.PI * 2)} y2={65 - 44 * Math.cos((h / 12) * Math.PI * 2)} stroke={RED} strokeWidth={7} strokeLinecap="round" />
          <circle cx={65} cy={65} r={7} fill="#0b0812" />
        </svg>
        <div style={{ fontWeight: 900, fontSize: 72, ...STROKE }}>{Math.round(h)} h</div>
      </div>
    </Panel>
  );
};

/* s13 — calendário sem data */
const S13: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("calendar.cross", g);
  if (v < 0.01) return null;
  const k = clamp(v, 0, 1);
  return (
    <div style={{ position: "absolute", top: 1030, left: 390, width: 300, height: 280, opacity: k, transform: `scale(${0.8 + 0.2 * k})`, fontFamily: FONT }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: 24, background: "#fbfbf7", border: "5px solid #0b0812", overflow: "hidden", boxShadow: "0 14px 34px rgba(0,0,0,0.5)" }}>
        <div style={{ height: 70, background: RED, color: "#fff", fontWeight: 900, fontSize: 44, textAlign: "center", lineHeight: "70px" }}>NOV</div>
        <div style={{ fontWeight: 900, fontSize: 150, textAlign: "center", color: "#1b1b24", lineHeight: "190px" }}>17</div>
      </div>
      <svg width={300} height={280} style={{ position: "absolute", inset: 0 }}>
        <path d="M40,60 L260,240 M260,60 L40,240" stroke={RED} strokeWidth={26} strokeLinecap="round" opacity={clamp((v - 0.2) * 2, 0, 1)} />
      </svg>
    </div>
  );
};

/* s14 — veredito grande + resumo */
const Icon: React.FC<{ v: number; title: string; color: string; glyph: React.ReactNode }> = ({ v, title, color, glyph }) => (
  <div style={{ width: 290, textAlign: "center", opacity: clamp(v, 0, 1), transform: `translateY(${(1 - clamp(v, 0, 1)) * 40}px)` }}>
    <div style={{ width: 120, height: 120, margin: "0 auto", borderRadius: 30, background: "rgba(11,8,18,0.8)", border: `4px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{glyph}</div>
    <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 900, fontSize: 28, lineHeight: 1.1, color: "#fff", ...STROKE }}>{title}</div>
  </div>
);
const S14: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const big = track("verdict.big", g);
  return (
    <>
      <VerdictMeter show={big} needle={track("verdict.needle", g)} size={520} top={760} verdict={track("verdict.hit", g)} />
      <div style={{ position: "absolute", top: 1070, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 20 }}>
        <Icon v={track("summary.a", g)} title="REDES SEPARADAS" color={BLUE} glyph={<svg width={74} height={74}>{[0, 1, 2].map((i) => <circle key={i} cx={16 + i * 21} cy={i === 1 ? 22 : 50} r={13} fill={[BLUE, ORANGE, GREEN][i]} />)}</svg>} />
        <Icon v={track("summary.b", g)} title="A FALHA PARA NOS FIOS" color={RED} glyph={<svg width={74} height={74}><path d="M8,37 L30,37 M44,37 L66,37" stroke="#7fd0ff" strokeWidth={8} strokeLinecap="round" /><path d="M31,24 L43,50 M43,24 L31,50" stroke={RED} strokeWidth={7} strokeLinecap="round" /></svg>} />
        <Icon v={track("summary.c", g)} title="SOL SEM DATA MARCADA" color={YEL} glyph={<svg width={74} height={74}><circle cx={37} cy={37} r={16} fill={YEL} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={37 + 22 * Math.cos((i * Math.PI) / 4)} y1={37 + 22 * Math.sin((i * Math.PI) / 4)} x2={37 + 32 * Math.cos((i * Math.PI) / 4)} y2={37 + 32 * Math.sin((i * Math.PI) / 4)} stroke={YEL} strokeWidth={5} strokeLinecap="round" />)}</svg>} />
      </div>
    </>
  );
};

export const APAGAO_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 },
  s2: { Overlay: S2 },
  s5: { Overlay: S5 },
  s6: { Overlay: S6 },
  s7: { Overlay: S7 },
  s8: { Overlay: S8 },
  s9: { Overlay: S9 },
  s10: { Overlay: S10 },
  s12: { Overlay: S12 },
  s13: { Overlay: S13 },
  s14: { Overlay: S14 },
};
