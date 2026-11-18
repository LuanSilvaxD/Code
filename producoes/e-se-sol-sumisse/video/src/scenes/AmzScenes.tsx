import { useCurrentFrame } from "remotion";
import { BigCount, HeightTag, TimeRuler, ViralCard } from "../components/Amazon2D";
import { cameraPoseAt } from "../components/CameraController";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { SeriesCard } from "../components/Series";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, CAS, CAS_PERSON, FOR } from "../data/amz";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Cidade perdida na Amazônia".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA · FORA DE ESCALA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );
const Pop: React.FC<{ v: number; children: React.ReactNode; style: React.CSSProperties }> = ({ v, children, style }) =>
  v < 0.01 ? null : <div style={{ position: "absolute", opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1.1)})`, ...style }}>{children}</div>;

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <SeriesCard v={track("series.card", g)} top={560} />;
};
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Pop v={track("viral", g)} style={{ left: 280, top: 880, transformOrigin: "50% 50%" }}><ViralCard views={track("views", g)} t={g} /></Pop>;
};
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Pop v={track("ruler", g)} style={{ left: 90, top: 420, transformOrigin: "50% 50%" }}><TimeRuler k={track("ruler.k", g)} dino={track("dino", g)} human={track("human", g)} /></Pop>;
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <VerdictMeter show={track("verdict", g)} needle={track("needle", g)} size={440} top={1000} />;
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const px = track("scan.x", g, -99);
  return (
    <>
      <WorldLabel pose={pose} point={add(FOR, [px, 4.6, 0])} text="LIDAR" appear={track("plane", g) > 0.5 ? 1 : 0} offset={[0, -40]} size={28} accent="#7aff9a" />
      <LikeSubscribe t={track("ls", g)} top={1040} side="right" />
    </>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Pop v={track("count", g)} style={{ left: 0, right: 0, top: 380, transformOrigin: "50% 50%" }}><BigCount v={track("count.v", g)} label="PLATAFORMAS DE TERRA" /></Pop>
      <Seal v={track("seal.k", g)} />
    </>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(CAS, [CAS_PERSON[0], 0.16, CAS_PERSON[2]])} text="1 PESSOA (ESCALA REAL)" appear={track("htag", g) > 0.5 ? 1 : 0} offset={[150, -120]} size={24} accent="#ffffff" />
      <Pop v={track("htag", g)} style={{ left: 90, top: 420, transformOrigin: "0 0" }}><HeightTag /></Pop>
      <Seal v={track("seal.k", g)} />
    </>
  );
};
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const l = track("lines", g);
  const n = track("needle", g, -90);
  return (
    <>
      <VerdictMeter show={track("verdict", g)} needle={n} size={440} top={980} />
      {l > 0.01 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(l, 0, 1), lineHeight: 1.25 }}>
          <div style={{ fontSize: 50, color: "#ff5a4a", ...stroke(6) }}>RATANABÁ: BOATO</div>
          <div style={{ fontSize: 50, color: "#3fd27a", opacity: n > 0 ? 1 : 0.25, ...stroke(6) }}>CIDADES ANTIGAS: VERDADE</div>
        </div>
      ) : null}
    </>
  );
};

export const AMZ_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
