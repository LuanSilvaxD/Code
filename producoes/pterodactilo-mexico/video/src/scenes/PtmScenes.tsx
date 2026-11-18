import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { CctvFrame, SeriesTag } from "../components/Ptero2D";
import { PLACES } from "../components/Ptero";
import { CornerBug, HookText } from "../components/SunGone2D";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, FT, MP } from "../data/ptm";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Pterodáctilo no México?".
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "MAPA ESQUEMÁTICO", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;

const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(FT, [0, 0.6, 0])} text="ARCOSSAUROS" appear={track("tree", g) > 0.5 ? 1 : 0} offset={[0, 0]} size={26} accent="#c4b5fd" />
      <WorldLabel pose={pose} point={add(FT, [-2.1, 2.6, 0])} text="DINOSSAUROS" appear={track("dino", g) > 0.5 ? 1 : 0} offset={[0, 60]} size={26} accent="#8fd0a0" />
      <WorldLabel pose={pose} point={add(FT, [2.1, 2.6, 0])} text="PTEROSSAUROS" appear={track("ptero", g) > 0.5 ? 1 : 0} offset={[0, 60]} size={26} accent="#ffb27a" />
    </>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const onMap = track("mp.show", g) > 0.5;
  return (
    <>
      {onMap ? <WorldLabel pose={pose} point={add(MP, [PLACES.juarez[0], 0.9, PLACES.juarez[2]])} text="CIUDAD JUÁREZ" appear={track("pin.j", g) > 0.5 ? 1 : 0} offset={[-40, -50]} size={26} accent="#ffb02a" /> : null}
      {onMap ? <WorldLabel pose={pose} point={add(MP, [PLACES.bigbend[0], 0.9, PLACES.bigbend[2]])} text="BIG BEND (TEXAS)" appear={track("pin.b", g) > 0.5 ? 1 : 0} offset={[60, -50]} size={26} accent="#ff6a5a" /> : null}
      <Seal v={track("seal.k", g)} />
    </>
  );
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Seal v={track("seal.k", g)} />;
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <VerdictMeter show={track("verdict", g)} needle={track("needle", g)} size={400} top={960} />;
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const l = track("lines", g);
  const w = track("cr.show", g) > 0.5;
  return l > 0.01 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: 330, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(l, 0, 1), lineHeight: 1.25 }}>
      <div style={{ fontSize: 48, color: "#ff5a4a", ...stroke(6) }}>PTERODÁCTILO VIVO: BOATO</div>
      <div style={{ fontSize: 48, color: "#3fd27a", opacity: w ? 1 : 0.2, ...stroke(6) }}>JÁ VOARAM ALI: VERDADE</div>
    </div>
  ) : null;
};

/** 2D global: gancho do frame 1, câmera de segurança, curtir+inscrever. */
export const PtmGlobal2D: React.FC = () => {
  const g = useCurrentFrame();
  return (
    <>
      <CctvFrame f={g} v={track("cctv", g)} secs={track("cctv.t", g)} />
      <SeriesTag v={track("tag", g)} top={930} />
      <HookText v={track("hook", g)} lines={[["PTERODÁCTILO", "#ffffff"], ["NO MÉXICO?", "#ffb02a"]]} top={1010} />
      <LikeSubscribe t={track("ls", g)} top={400} side="right" />
    </>
  );
};
export const PtmBug: React.FC = () => <CornerBug />;

export const PTM_MODULES: Record<string, SceneModule> = { s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 } };
