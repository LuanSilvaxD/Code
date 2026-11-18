import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { CornerBug, Countdown, HookText } from "../components/SunGone2D";
import { WorldLabel } from "../components/WorldLabel";
import { add, SP, SUN } from "../data/sun";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "E se o Sol sumisse?". O que atravessa cenas (gancho, contador, dias, curtir) fica em SunGlobal2D.
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;

const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useCurrentFrame() + scene.startFrame;
  return <WorldLabel pose={cameraPoseAt(g)} point={add(SP, [SUN[0], SUN[1] + 1.9, 0])} text="ONDE O SOL ESTAVA" appear={1} offset={[0, -30]} size={26} accent="#ffb02a" />;
};

/** Linha DIA + temperatura (abaixo da Terra, acima da legenda). */
const StatRow: React.FC<{ g: number }> = ({ g }) => {
  const dv = track("dc.v", g), tv = track("temp.v", g);
  if (dv < 0.01 && tv < 0.01) return null;
  const temp = Math.round(track("temp", g));
  const cold = temp <= 0;
  const box: React.CSSProperties = { padding: "4px 22px", borderRadius: 20, background: "rgba(11,8,18,0.72)", border: "3px solid #9fd8ff", display: "flex", alignItems: "baseline", gap: 8 };
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 1215, display: "flex", justifyContent: "center", gap: 26, fontFamily: FONT, fontWeight: 900 }}>
      {dv > 0.01 ? (
        <div style={{ ...box, opacity: clamp(dv, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(dv, 0, 1.1)})` }}>
          <span style={{ fontSize: 34, color: "#fff", ...stroke(4) }}>DIA</span>
          <span style={{ fontSize: 76, color: "#9fd8ff", fontVariantNumeric: "tabular-nums", ...stroke(6) }}>{Math.round(track("dc", g))}</span>
        </div>
      ) : null}
      {tv > 0.01 ? (
        <div style={{ ...box, borderColor: cold ? "#7ac8ff" : "#ffb02a", opacity: clamp(tv, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(tv, 0, 1.1)})` }}>
          <span style={{ fontSize: 76, color: cold ? "#bfe6ff" : "#ffd27a", fontVariantNumeric: "tabular-nums", ...stroke(6) }}>{temp < 0 ? `−${-temp}` : temp}</span>
          <span style={{ fontSize: 40, color: "#fff", ...stroke(4) }}>°C</span>
        </div>
      ) : null}
    </div>
  );
};

/** Elementos 2D globais (atravessam cortes): selo, gancho do frame 1, contador, dias/temperatura, curtir+inscrever. */
export const SunGlobal2D: React.FC = () => {
  const g = useCurrentFrame();
  const outroFade = 1 - clamp(track("fade", g), 0, 1);
  return (
    <>
      <HookText v={track("hook", g)} lines={[["E SE O", "#ffffff"], ["SOL", "#ffb02a"], ["SUMISSE?", "#ffffff"]]} top={560} />
      <Countdown secs={track("cd", g)} v={track("cd.v", g) * outroFade} top={560} />
      <StatRow g={g} />
      <LikeSubscribe t={track("ls", g)} top={400} side="right" />
    </>
  );
};
export const SunBug: React.FC = () => <CornerBug />;

export const SUN_MODULES: Record<string, SceneModule> = { s3: { Overlay: S3 } };
