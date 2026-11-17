import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { HeatPodium, ParisGraph, RecordCalendar, TempCounter } from "../components/Heat2D";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { WorldLabel } from "../components/WorldLabel";
import { add, EARTH, ESC, PAC, THERMO_AT } from "../data/heat";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Por que 2026 está tão quente?".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const GOLD = "#ffcf3a";
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA · FORA DE ESCALA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );
const Seals: React.FC<{ g: number }> = ({ g }) => <Seal v={track("seal.k", g)} />;
const Pop: React.FC<{ v: number; children: React.ReactNode; style: React.CSSProperties }> = ({ v, children, style }) =>
  v < 0.01 ? null : <div style={{ position: "absolute", opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1.1)})`, ...style }}>{children}</div>;

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Pop v={track("cal", g)} style={{ left: 620, top: 960, transformOrigin: "50% 50%" }}><RecordCalendar stamp={track("cal.stamp", g)} /></Pop>
      <Pop v={track("podium", g)} style={{ left: 250, top: 820, transformOrigin: "50% 100%" }}><HeatPodium k={track("podium.k", g)} /></Pop>
    </>
  );
};
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(EARTH, [-3.0, 1.8, 0.8])} text="LUZ DO SOL" appear={track("sun", g) > 0.5 ? 1 : 0} offset={[0, -30]} size={24} accent={GOLD} />
      <WorldLabel pose={pose} point={add(EARTH, [0.6, 1.5, 0.6])} text="CO₂" appear={track("smoke", g) > 0.5 ? 1 : 0} offset={[-80, -60]} size={28} accent="#d8d0d8" />
      <Seals g={g} />
    </>
  );
};
const YEARS = ["1980", "2000", "2026"];
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const n = track("years.k", g);
  return (
    <>
      <WorldLabel pose={pose} point={add(ESC, [THERMO_AT[0], THERMO_AT[1] + 4.0, THERMO_AT[2]])} text="TEMPERATURA" appear={1} offset={[0, -20]} size={24} accent="#ff6a4a" />
      <div style={{ position: "absolute", top: 1120, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 40, fontFamily: FONT, fontWeight: 900, fontSize: 60 }}>
        {YEARS.map((y, i) => (n >= i + 1 ? <span key={y} style={{ color: i === 2 ? "#ff6a4a" : "#fff", ...stroke(5) }}>{y}</span> : null))}
      </div>
    </>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(PAC, [-5.4, 0.9, -0.6])} text="ÁSIA/AUSTRÁLIA" appear={1} offset={[0, -40]} size={22} accent="#a0e0a0" />
      <WorldLabel pose={pose} point={add(PAC, [5.8, 1.4, 0])} text="AMÉRICA DO SUL" appear={1} offset={[0, -40]} size={22} accent="#a0e0a0" />
      <WorldLabel pose={pose} point={add(PAC, [1.4, 0.8, -0.9])} text="VENTOS" appear={track("warm", g) < 0.3 ? 1 : 0} offset={[0, -40]} size={22} accent="#ffffff" />
      <Seals g={g} />
    </>
  );
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Pop v={track("temp", g)} style={{ left: 0, right: 0, top: 360, transformOrigin: "50% 50%" }}><TempCounter v={track("temp.v", g, 1)} /></Pop>
      <LikeSubscribe t={track("ls", g)} top={1040} side="right" />
    </>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Pop v={track("podium", g)} style={{ left: 170, top: 400, transformOrigin: "50% 100%" }}><HeatPodium k={track("podium.k", g)} y2027={track("y2027", g)} /></Pop>
      {track("podium", g) < 0.5 ? <Seals g={g} /> : null}
    </>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Pop v={track("graph", g)} style={{ left: 110, top: 420, transformOrigin: "50% 50%" }}><ParisGraph bars={track("bars", g)} draw={track("avg", g)} /></Pop>;
};
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const b = track("blink", g);
  const on = b > 0.01 && Math.floor(g / 8) % 2 === 0 ? 1 : b > 0.01 ? 0.55 : 0;
  return <WorldLabel pose={pose} point={add(ESC, [THERMO_AT[0] + 0.2, THERMO_AT[1] + 1.4, THERMO_AT[2]])} text="2027?" appear={on} offset={[150, 0]} size={40} accent="#ff5a3a" />;
};

export const HEAT_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
