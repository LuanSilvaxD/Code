import { useCurrentFrame } from "remotion";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { add, ANANAS_P, CMP_120, CMP_90, CMP_BIG, FLOWER, NAUTILUS, PAIRS, PINE_P } from "../data/fibo";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import { HEIGHT, WIDTH } from "../utils/timing";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D da "espiral de Fibonacci".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const ORANGE = "#ff9a3a";
const BLUE = "#5ab4ff";
const GOLD = "#ffcf3a";

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const Counter: React.FC<{ n: number; color: string; label: string; side: "left" | "right"; v: number }> = ({ n, color, label, side, v }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top: 1080, [side]: 100, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1)})` }}>
      <div style={{ fontSize: 150, lineHeight: 1, color, ...stroke(8) }}>{n}</div>
      <div style={{ fontSize: 34, color: "#fff", ...stroke(4) }}>{label}</div>
    </div>
  );

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const a = track("countA", g);
  const b = track("countB", g);
  return (
    <>
      <Counter n={Math.round(a)} color={ORANGE} label="↻ HORÁRIO" side="left" v={a > 0.2 ? 1 : 0} />
      <Counter n={Math.round(b)} color={BLUE} label="↺ ANTI-HORÁRIO" side="right" v={b > 0.2 ? 1 : 0} />
    </>
  );
};

const Tile: React.FC<{ text: string; v: number; color?: string; size?: number }> = ({ text, v, color = "#fff", size = 96 }) => {
  const k = clamp(v, 0, 1.2);
  return (
    <div style={{ minWidth: size * 0.95, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.1, color, opacity: clamp(v * 1.6, 0, 1), transform: `translateY(${(1 - clamp(v, 0, 1)) * 30}px) scale(${0.6 + 0.4 * k})`, ...stroke(6) }}>{text}</div>
  );
};

const SEQ = ["1", "1", "2", "3", "5", "8", "13"];
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const dim = track("dim", g);
  const step = track("seq.step", g);
  const sum = track("seq.sum", g);
  const more = track("seq.more", g);
  return (
    <>
      <div style={{ position: "absolute", inset: 0, background: "rgba(11,8,18,0.62)", opacity: clamp(dim, 0, 1) }} />
      {sum > 0.01 ? (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18, alignItems: "center" }}>
          <Tile text="5" v={sum} size={130} />
          <Tile text="+" v={sum} size={100} color="#c4b5fd" />
          <Tile text="8" v={sum} size={130} />
          <Tile text="=" v={sum} size={100} color="#c4b5fd" />
          <Tile text="13" v={sum} size={130} color={GOLD} />
        </div>
      ) : null}
      <div style={{ position: "absolute", top: 720, left: 70, right: 70, display: "flex", justifyContent: "center", gap: 14 }}>
        {SEQ.map((t, i) => (step > i ? <Tile key={i} text={t} v={clamp(step - i, 0, 1)} size={100} color={i === Math.ceil(step) - 1 ? GOLD : "#fff"} /> : <div key={i} style={{ minWidth: 95 }} />))}
      </div>
      {more > 0.01 ? (
        <div style={{ position: "absolute", top: 880, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
          <Tile text="21" v={more} size={100} />
          <Tile text="34" v={more} size={110} color={ORANGE} />
          <Tile text="55" v={more} size={110} color={BLUE} />
          <Tile text="…" v={more} size={100} />
        </div>
      ) : null}
    </>
  );
};

const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("casais.k", g);
  const stage = Math.max(1, Math.ceil(track("rabbits.n", g) - 0.001));
  if (v < 0.01) return null;
  return (
    <div style={{ position: "absolute", top: 1130, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(v, 0, 1) }}>
      <div style={{ fontSize: 40, color: "#fff", ...stroke(4) }}>CASAIS DE COELHOS</div>
      <div style={{ display: "flex", justifyContent: "center", gap: 26, marginTop: 4 }}>
        {PAIRS.map((p, i) => (
          <span key={i} style={{ fontSize: i === stage - 1 ? 96 : 70, color: i < stage ? (i === stage - 1 ? GOLD : "#fff") : "rgba(255,255,255,0.25)", ...stroke(6) }}>{p}</span>
        ))}
      </div>
    </div>
  );
};

const RATIOS = [
  ["2 ÷ 1", "2"],
  ["3 ÷ 2", "1,5"],
  ["5 ÷ 3", "1,667"],
  ["8 ÷ 5", "1,6"],
  ["13 ÷ 8", "1,625"],
  ["21 ÷ 13", "1,615"],
];
const Ratios: React.FC<{ g: number }> = ({ g }) => {
  const step = track("ratio.step", g);
  const lock = track("ratio.lock", g);
  if (step < 0.01) return null;
  return (
    <div style={{ position: "absolute", top: 905, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(step, 0, 1) }}>
      {RATIOS.map(([a, b], i) =>
        step > i ? (
          <div key={i} style={{ display: "flex", gap: 22, fontSize: 52, lineHeight: 1.15, opacity: clamp(step - i, 0, 1) * (lock > 0.05 && i < 5 ? 0.55 : 1) }}>
            <span style={{ color: "#fff", minWidth: 230, textAlign: "right", ...stroke(5) }}>{a}</span>
            <span style={{ color: "#c4b5fd", ...stroke(5) }}>=</span>
            <span style={{ color: i === 5 ? GOLD : "#fff", minWidth: 200, ...stroke(5) }}>{b}</span>
          </div>
        ) : null,
      )}
    </div>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => <Ratios g={useG(scene)} />;
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Ratios g={g} />
      <Seal v={track("seal.k", g)} />
    </>
  );
};

/** Transferidor 2D sobre o centro do miolo: duas sementes consecutivas separadas por 137,5°. */
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = clamp(track("proto.k", g), 0, 1.2);
  if (v < 0.01) return null;
  const pose = cameraPoseAt(g);
  const c = projectPoint(pose, add(FLOWER, [0, 0.06, 0.45]), WIDTH, HEIGHT);
  const R = 230;
  const sweep = 137.5 * clamp(v, 0, 1);
  const a0 = -90; // primeira semente para cima
  const pt = (deg: number, r: number) => [c.x + Math.cos((deg * Math.PI) / 180) * r, c.y + Math.sin((deg * Math.PI) / 180) * r];
  const [x1, y1] = pt(a0, R);
  const [x2, y2] = pt(a0 + sweep, R);
  const [ax, ay] = pt(a0, R * 0.55);
  const [bx, by] = pt(a0 + sweep, R * 0.55);
  const [lx, ly] = pt(a0 + sweep / 2, R * 0.82);
  return (
    <svg width={WIDTH} height={HEIGHT} style={{ position: "absolute", inset: 0, opacity: clamp(v, 0, 1) }}>
      <path d={`M ${ax} ${ay} A ${R * 0.55} ${R * 0.55} 0 0 1 ${bx} ${by}`} fill="none" stroke={GOLD} strokeWidth={10} strokeLinecap="round" />
      {[[x1, y1], [x2, y2]].map(([x, y], i) => (
        <g key={i}>
          <line x1={c.x} y1={c.y} x2={x} y2={y} stroke="#0b0812" strokeWidth={14} strokeLinecap="round" />
          <line x1={c.x} y1={c.y} x2={x} y2={y} stroke="#fff" strokeWidth={7} strokeLinecap="round" />
          <circle cx={x} cy={y} r={18} fill={i ? GOLD : "#fff"} stroke="#0b0812" strokeWidth={5} />
        </g>
      ))}
      <text x={lx + 30} y={ly} fontFamily={FONT} fontWeight={900} fontSize={64} fill={GOLD} stroke="#0b0812" strokeWidth={8} paintOrder="stroke" textAnchor="start">{`${sweep.toFixed(1).replace(".", ",")}°`}</text>
    </svg>
  );
};

const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const k = track("cmp.k", g);
  const bad = track("cmp.bad", g);
  return (
    <>
      <WorldLabel pose={pose} point={add(CMP_BIG, [1.75, 0.9, 0])} text="137,5° ✔" appear={k} offset={[0, 0]} size={34} accent="#4ade80" safe={false} />
      <WorldLabel pose={pose} point={add(CMP_120, [0, -1.35, 0])} text={bad > 0.5 ? "120° ✖" : "120°"} appear={k} offset={[0, 0]} size={30} accent={bad > 0.5 ? "#ff5a4a" : "#c4b5fd"} safe={false} />
      <WorldLabel pose={pose} point={add(CMP_90, [0, -1.35, 0])} text={bad > 0.5 ? "90° ✖" : "90°"} appear={k} offset={[0, 0]} size={30} accent={bad > 0.5 ? "#ff5a4a" : "#c4b5fd"} safe={false} />
      <Seal v={1} top={250} />
    </>
  );
};

const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(PINE_P, [0, 1.35, 0])} text="PINHA" appear={track("plant.hiA", g)} offset={[0, -40]} size={30} accent={ORANGE} />
      <WorldLabel pose={pose} point={add(ANANAS_P, [0, 2.1, 0])} text="ABACAXI" appear={track("plant.hiB", g)} offset={[0, -40]} size={30} accent={BLUE} />
    </>
  );
};

const S9: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const cross = clamp(track("cross", g), 0, 1.3);
  const lab = clamp(track("nlabels", g), 0, 1.2);
  const pose = cameraPoseAt(g);
  const c = projectPoint(pose, add(NAUTILUS, [0.2, 0, 0]), WIDTH, HEIGHT);
  return (
    <>
      {cross > 0.01 ? (
        <div style={{ position: "absolute", left: c.x - 200, top: c.y - 230, width: 400, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 420, lineHeight: 1, color: "#ff4a3a", opacity: clamp(cross, 0, 1), transform: `scale(${0.5 + 0.5 * cross})`, ...stroke(12) }}>✖</div>
      ) : null}
      {lab > 0.01 ? (
        <div style={{ position: "absolute", top: 1090, left: 90, right: 90, display: "flex", flexDirection: "column", gap: 14, alignItems: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(lab, 0, 1), transform: `scale(${0.85 + 0.15 * clamp(lab, 0, 1)})` }}>
          <div style={{ padding: "8px 26px", borderRadius: 18, background: "rgba(11,8,18,0.78)", border: "3px solid #f2e2c4", color: "#f2e2c4", fontSize: 40 }}>NÁUTILO: ≈ 1,33 a cada ¼ de volta</div>
          <div style={{ padding: "8px 26px", borderRadius: 18, background: "rgba(11,8,18,0.78)", border: `3px solid ${GOLD}`, color: GOLD, fontSize: 40 }}>ESPIRAL ÁUREA: 1,618</div>
        </div>
      ) : null}
    </>
  );
};

const S10: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const items: [string, string, string][] = [
    ["sum1", "SOMA DOS DOIS ANTERIORES", "#fff"],
    ["sum2", "SEMENTES A 137,5°", GOLD],
    ["sum3", "NÁUTILO: MITO", "#ff8a7a"],
  ];
  return (
    <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, fontFamily: FONT, fontWeight: 900 }}>
      {items.map(([t, label, color]) => {
        const v = clamp(track(t, g), 0, 1.2);
        return v > 0.01 ? (
          <div key={t} style={{ padding: "8px 26px", borderRadius: 999, background: "rgba(11,8,18,0.72)", border: `3px solid ${color}`, color, fontSize: 40, opacity: clamp(v, 0, 1), transform: `translateX(${(1 - clamp(v, 0, 1)) * -60}px) scale(${0.8 + 0.2 * v})` }}>{label}</div>
        ) : null;
      })}
    </div>
  );
};

export const FIBO_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 }, s9: { Overlay: S9 }, s10: { Overlay: S10 },
};
