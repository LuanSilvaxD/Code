import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { NEPTUNE_A, planetPos, PLANETS, r631Orbit } from "../components/Solar";
import { WorldLabel } from "../components/WorldLabel";
import { add, NEP, SOLAR, STAR, sysT } from "../data/solar";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import { WIDTH } from "../utils/timing";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D da "contramão no Sistema Solar".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const RED = "#ff5a4a";
const GOLD = "#ffcf3a";

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA · FORA DE ESCALA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const nepPos = (g: number) => {
  const i = PLANETS.length - 1;
  return planetPos(PLANETS[i].a, sysT(g) / PLANETS[i].T + i * 1.7);
};

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(SOLAR, add(nepPos(g), [0, 0.6, 0]))} text="NETUNO" appear={track("r631.k", g) > 0 ? 1 : 0} offset={[0, -50]} size={26} accent="#7f9bff" />
      <Seal v={track("seal.k", g)} />
    </>
  );
};

const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const solar = track("solar.show", g) > 0.5;
  const incl = track("incl", g, 142);
  const pose = cameraPoseAt(g);
  return solar ? (
    <>
      <div style={{ position: "absolute", top: 1120, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
        <div style={{ fontSize: 34, color: "#fff", ...stroke(4) }}>INCLINAÇÃO DA ÓRBITA</div>
        <div style={{ fontSize: 120, lineHeight: 1, color: incl > 90 ? RED : GOLD, ...stroke(7) }}>{Math.round(incl)}°</div>
      </div>
      <WorldLabel pose={pose} point={add(SOLAR, [-NEPTUNE_A, 0, 0])} text="PLANO DOS PLANETAS" appear={1} offset={[60, 60]} size={24} accent="#c4b5fd" />
      <Seal v={1} />
    </>
  ) : null;
};

/** Pontinhos de detecção no céu ligados numa órbita. */
const DOTS = [
  [190, 560], [330, 470], [470, 420], [610, 410], [750, 440], [880, 510],
];
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = clamp(track("dots.k", g), 0, 1);
  const L = clamp(track("link.draw", g), 0, 1);
  if (v < 0.01 && L < 0.01) return null;
  const path = DOTS.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${y}`).join(" ");
  const len = 760;
  return (
    <svg width={WIDTH} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d={path} fill="none" stroke={RED} strokeWidth={7} strokeDasharray={`${len * L} ${len}`} strokeLinecap="round" />
      {DOTS.map(([x, y], i) => (i / DOTS.length < v ? <circle key={i} cx={x} cy={y} r={14} fill="#fff" stroke={RED} strokeWidth={5} /> : null))}
    </svg>
  );
};
const S4: React.FC<SceneProps> = () => <Seal v={1} text="ILUSTRAÇÃO" />;
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(NEP, [0, 1.9, 0])} text="NETUNO" appear={1} offset={[0, -40]} size={28} accent="#7f9bff" />
      <WorldLabel pose={pose} point={add(NEP, [-8, -0.5, -2])} text="CINTURÃO DE KUIPER" appear={1} offset={[0, 60]} size={24} accent="#c9b8a0" />
      <Seal v={1} />
    </>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(STAR, [-6.5, 5.2, -4])} text="OUTRA ESTRELA" appear={1} offset={[0, -40]} size={26} accent="#7ab8ff" />
      <WorldLabel pose={pose} point={add(STAR, [5, 0.9, 0])} text="SOL" appear={1} offset={[0, -50]} size={26} accent={GOLD} />
      <Seal v={1} text="ILUSTRAÇÃO" />
    </>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const y = Math.round(track("years", g));
  return (
    <>
      {y > 0 ? (
        <div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
          <span style={{ fontSize: 120, color: GOLD, ...stroke(7) }}>{y}</span>
          <span style={{ fontSize: 46, color: "#fff", marginLeft: 16, ...stroke(4) }}>ANOS</span>
        </div>
      ) : null}
      <WorldLabel pose={pose} point={add(SOLAR, r631Orbit(0))} text="2047" appear={track("peri.k", g)} offset={[0, -70]} size={28} accent={RED} />
      <WorldLabel pose={pose} point={add(SOLAR, add(nepPos(g), [0, 0.6, 0]))} text="NETUNO" appear={track("peri.k", g)} offset={[0, -50]} size={24} accent="#7f9bff" />
      <Seal v={1} />
    </>
  );
};
const S8: React.FC<SceneProps> = () => <Seal v={1} />;

export const SOLAR_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
