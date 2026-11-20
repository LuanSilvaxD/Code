import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { SeriesTag } from "../components/Ptero2D";
import { CornerBug, HookText } from "../components/SunGone2D";
import { RescueClock, TempCard } from "../components/Titanic2D";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, MUS, SL } from "../data/tit";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "O Jack cabia na porta?".
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;

const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(MUS, [-0.6, 1.75, 0])} text="CÓPIA (FILME)" appear={1} offset={[0, -20]} size={26} accent="#e0bf8e" />
      <WorldLabel pose={pose} point={add(MUS, [1.0, 1.6, -0.1])} text="PEDAÇO REAL" appear={g - scene.startFrame > 60 ? 1 : 0} offset={[30, -40]} size={26} accent="#ffd27a" />
    </>
  );
};
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}>
        <TempCard c={track("temp", g)} v={track("temp.v", g)} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center" }}>
        <RescueClock min={track("clock", g)} v={track("clock.v", g)} size={320} />
      </div>
    </>
  );
};
const Waterline: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <WorldLabel pose={cameraPoseAt(g)} point={add(SL, [-2.0, 0.0, 1.1])} text="LINHA D'ÁGUA" appear={1} offset={[40, 70]} size={24} accent="#9fd8ff" />;
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <VerdictMeter show={track("verdict", g)} needle={track("needle", g)} size={420} top={980} labels={["✖ NÃO FUNCIONA", "FUNCIONA ✔"]} />;
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const l = track("lines", g);
  return l > 0.01 ? (
    <div style={{ position: "absolute", left: 0, right: 0, top: 340, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: clamp(l, 0, 1), lineHeight: 1.2, transform: `scale(${0.8 + 0.2 * clamp(l, 0, 1.1)})` }}>
      <div style={{ fontSize: 64, color: "#3fd27a", ...stroke(7) }}>CABIA, COM ASTERISCO*</div>
      <div style={{ fontSize: 36, color: "#ffd27a", ...stroke(5) }}>*SÓ COM O COLETE EMBAIXO</div>
    </div>
  ) : null;
};

/** 2D global: gancho do frame 1 e curtir+inscrever. */
export const TitGlobal2D: React.FC = () => {
  const g = useCurrentFrame();
  return (
    <>
      <SeriesTag v={track("tag", g)} text="FILME × REALIDADE #2" top={540} />
      <HookText v={track("hook", g)} lines={[["CABIA", "#ffffff"], ["OS DOIS?", "#ffb02a"]]} top={620} />
      <LikeSubscribe t={track("ls", g)} top={400} side="right" />
    </>
  );
};
export const TitBug: React.FC = () => <CornerBug />;

export const TIT_MODULES: Record<string, SceneModule> = { s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: Waterline }, s5: { Overlay: Waterline }, s6: { Overlay: S6 }, s7: { Overlay: S7 } };
