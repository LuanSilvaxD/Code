import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { add, MAP, STORM, VIEW } from "../data/birds";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D dos "pássaros que ouviram a tempestade".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const GOLD = "#ffcf3a";

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const S1: React.FC<SceneProps> = () => null;
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = clamp((g - scene.startFrame - 20) / 10, 0, 1);
  return v > 0 ? (
    <div style={{ position: "absolute", top: 1090, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: v }}>
      <span style={{ fontSize: 120, color: GOLD, ...stroke(7) }}>≈ 10 g</span>
      <div style={{ fontSize: 34, color: "#fff", ...stroke(4) }}>MENOS QUE UMA COLHER DE AÇÚCAR</div>
    </div>
  ) : null;
};
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const km = Math.round(track("km", g));
  const d = Math.round(track("days", g));
  return (
    <>
      {km > 0 ? (
        <div style={{ position: "absolute", top: 1080, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 50, fontFamily: FONT, fontWeight: 900 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 96, color: "#fff", ...stroke(6) }}>{km.toLocaleString("pt-BR")}</div>
            <div style={{ fontSize: 32, color: "#c4b5fd", ...stroke(4) }}>QUILÔMETROS</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 96, color: GOLD, ...stroke(6) }}>{d}</div>
            <div style={{ fontSize: 32, color: "#c4b5fd", ...stroke(4) }}>DIAS</div>
          </div>
        </div>
      ) : null}
      <WorldLabel pose={pose} point={add(MAP, [0, 1.2, -3])} text="NINHOS (TENNESSEE)" appear={1} offset={[0, -50]} size={24} accent={GOLD} />
      <WorldLabel pose={pose} point={add(MAP, [0, 0.2, 7])} text="GOLFO DO MÉXICO" appear={1} offset={[0, 0]} size={24} accent="#9fd0ff" />
      <WorldLabel pose={pose} point={add(MAP, [-3, 0.2, -5])} text="TEMPESTADES" appear={track("band.k", g)} offset={[0, -30]} size={24} accent="#ff6a5a" />
      <Seal v={1} text="MAPA ESQUEMÁTICO" />
    </>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(VIEW, [0, 14, -75])} text="TEMPESTADE AO LONGE" appear={1} offset={[0, -40]} size={24} accent="#c4b5fd" />
      <Seal v={track("waves.k", g)} text="SOM INVISÍVEL · ESQUEMA" />
    </>
  );
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(STORM, [14, 0.3, 0])} text="ONDAS LENTAS" appear={1} offset={[0, 40]} size={26} accent="#c4b5fd" />
      <Seal v={1} text="SOM INVISÍVEL · ESQUEMA" />
    </>
  );
};

/** Barra de frequências (escala log): humanos de ~20 Hz para cima; algumas aves bem mais graves. */
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const h = clamp(track("freq.h", g), 0, 1.2);
  const b = clamp(track("freq.b", g), 0, 1.2);
  if (h < 0.01) return null;
  const X0 = 110, X1 = 970; // 0,05 Hz → 20.000 Hz (log)
  const lx = (hz: number) => X0 + ((Math.log10(hz) + 1.3) / (4.3 + 1.3)) * (X1 - X0);
  const ticks: [number, string][] = [[0.1, "0,1"], [1, "1"], [20, "20"], [1000, "1.000"], [20000, "20.000"]];
  const Y = 1040;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT, fontWeight: 900, opacity: clamp(h, 0, 1) }}>
      <div style={{ position: "absolute", top: Y - 70, left: 0, right: 0, textAlign: "center", fontSize: 30, color: "#fff", ...stroke(4) }}>VIBRAÇÕES POR SEGUNDO (Hz)</div>
      <div style={{ position: "absolute", top: Y, left: X0, width: X1 - X0, height: 26, borderRadius: 13, background: "rgba(11,8,18,0.7)", border: "3px solid #fff" }} />
      <div style={{ position: "absolute", top: Y + 3, left: X0 + 3, width: lx(20) - X0, height: 20, borderRadius: 10, background: "repeating-linear-gradient(45deg,#8b5cf6 0 10px,#6a3cd6 10px 20px)" }} />
      <div style={{ position: "absolute", top: Y + 3, left: lx(20), width: (X1 - lx(20)) * clamp(h, 0, 1) - 3, height: 20, borderRadius: 10, background: "#4ade80" }} />
      {ticks.map(([hz, t]) => (
        <div key={t} style={{ position: "absolute", top: Y + 34, left: lx(hz) - 40, width: 80, textAlign: "center", fontSize: 24, color: "#fff", ...stroke(3) }}>{t}</div>
      ))}
      <div style={{ position: "absolute", top: Y - 34, left: X0, width: lx(20) - X0, textAlign: "center", fontSize: 24, color: "#c4b5fd", ...stroke(3) }}>INFRASSOM</div>
      <div style={{ position: "absolute", top: Y + 72, left: lx(20) - 10, fontSize: 30, color: "#4ade80", ...stroke(4) }}>👂 HUMANO</div>
      {b > 0.01 ? (
        <>
          <div style={{ position: "absolute", top: Y + 118, left: lx(0.05) + 3, width: (lx(5000) - lx(0.05)) * clamp(b, 0, 1), height: 14, borderRadius: 7, background: GOLD }} />
          <div style={{ position: "absolute", top: Y + 138, left: X0, fontSize: 30, color: GOLD, opacity: clamp(b, 0, 1), ...stroke(4) }}>ALGUMAS AVES (EX.: POMBO, EM LABORATÓRIO)</div>
        </>
      ) : null}
    </div>
  );
};
const S7: React.FC<SceneProps> = () => <Seal v={1} text="HIPÓTESE MAIS PROVÁVEL" top={1250} />;
const S8: React.FC<SceneProps> = () => null;

export const BIRD_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
