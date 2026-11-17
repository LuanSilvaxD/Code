import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { regionCenter } from "../components/Nino";
import { IntensityMeter, NinoTimeline, RegionTag, XmasCalendar } from "../components/Nino2D";
import { WorldLabel } from "../components/WorldLabel";
import { add, BR, PAC } from "../data/nino";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "El Niño 2026–2027".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA · FORA DE ESCALA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );
const Seals: React.FC<{ g: number }> = ({ g }) => <Seal v={track("seal.k", g)} />;
const Pop: React.FC<{ v: number; children: React.ReactNode; style: React.CSSProperties }> = ({ v, children, style }) =>
  v < 0.01 ? null : <div style={{ position: "absolute", opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1.1)})`, ...style }}>{children}</div>;
const PacLabels: React.FC<{ g: number; winds?: boolean }> = ({ g, winds }) => {
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(PAC, [-5.4, 0.9, -0.6])} text="ÁSIA/AUSTRÁLIA" appear={1} offset={[0, -40]} size={22} accent="#a0e0a0" />
      <WorldLabel pose={pose} point={add(PAC, [5.8, 1.4, 0])} text="AMÉRICA DO SUL" appear={1} offset={[0, -40]} size={22} accent="#a0e0a0" />
      {winds ? <WorldLabel pose={pose} point={add(PAC, [1.4, 0.8, -0.9])} text="VENTOS" appear={track("warm", g) < 0.3 ? 1 : 0} offset={[0, -40]} size={22} accent="#ffffff" /> : null}
    </>
  );
};

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Pop v={track("meter", g)} style={{ left: 160, top: 1060, transformOrigin: "50% 50%" }}><IntensityMeter v={track("meter.v", g)} /></Pop>;
};
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Pop v={track("cal", g)} style={{ left: 110, top: 880, transformOrigin: "50% 50%" }}><XmasCalendar star={track("cal", g)} /></Pop>;
};
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <PacLabels g={g} winds />
      <Seals g={g} />
    </>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <PacLabels g={g} />
      <Seals g={g} />
    </>
  );
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(BR, regionCenter("N", 0.3))} text="NORTE" appear={1} offset={[0, -30]} size={24} accent="#ffffff" />
      <WorldLabel pose={pose} point={add(BR, regionCenter("NE", 0.3))} text="NORDESTE" appear={1} offset={[0, -30]} size={24} accent="#ffffff" />
      <Pop v={track("tagN", g)} style={{ left: 100, top: 400, transformOrigin: "0 0", scale: "1.35" }}><RegionTag title="MAIS SECO E QUENTE" sub="RISCO DE SECA E QUEIMADAS" color="#ff7a3a" icon="" /></Pop>
      <LikeSubscribe t={track("ls", g)} top={1040} side="right" />
      <Seals g={g} />
    </>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(BR, regionCenter("S", 0.25))} text="SUL" appear={1} offset={[120, 40]} size={26} accent="#9fd0ff" />
      <Pop v={track("tagS", g)} style={{ left: 100, top: 400, transformOrigin: "0 0", scale: "1.35" }}><RegionTag title="CHUVA ACIMA DA MÉDIA" sub="RISCO DE ENCHENTES E TEMPORAIS" color="#5aa8ff" icon="" /></Pop>
      <Seals g={g} />
    </>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Pop v={track("tl", g)} style={{ left: 100, top: 420, transformOrigin: "50% 50%" }}><NinoTimeline draw={track("tl.draw", g)} peak={track("tl.peak", g)} neutral={track("tl.neutral", g)} /></Pop>;
};
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <PacLabels g={g} />;
};

export const NINO_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
