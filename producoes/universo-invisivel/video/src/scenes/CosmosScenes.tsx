import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { add, EUCLID_P, ICE, SOLAR } from "../data/cosmos";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "universo invisível".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const STROKE = { WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" } as const;

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

/** Legenda da pizza: cada linha aparece quando a fatia é revelada. */
const Legend: React.FC<{ g: number }> = ({ g }) => {
  const v = track("legend.k", g);
  if (v < 0.01) return null;
  const rows = [
    { k: track("pie.k5", g), color: "#ffcf5a", pct: "5%", name: "o que a gente vê" },
    { k: track("pie.k27", g), color: "#a78bfa", pct: "27%", name: "matéria escura" },
    { k: track("pie.k68", g), color: "#5b7cff", pct: "68%", name: "energia escura" },
  ];
  return (
    <div style={{ position: "absolute", left: 110, right: 90, top: 1060, opacity: clamp(v, 0, 1), fontFamily: FONT }}>
      {rows.map((r, i) =>
        r.k > 0.01 ? (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 6, opacity: clamp(r.k, 0, 1), transform: `translateX(${(1 - clamp(r.k, 0, 1)) * -40}px)` }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: r.color, border: "4px solid #0b0812" }} />
            <div style={{ fontWeight: 900, fontSize: 72, color: r.color, minWidth: 170, ...STROKE, WebkitTextStroke: "5px #0b0812" }}>{r.pct}</div>
            <div style={{ fontWeight: 900, fontSize: 42, color: "#fff", ...STROKE, WebkitTextStroke: "4px #0b0812" }}>{r.name}</div>
          </div>
        ) : null,
      )}
    </div>
  );
};

const S1: React.FC<SceneProps> = ({ scene }) => <Legend g={useG(scene)} />;
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Legend g={g} />
      <Seal v={track("halo.k", g)} text="ILUSTRAÇÃO · É INVISÍVEL" />
    </>
  );
};
const S3: React.FC<SceneProps> = () => <Seal v={1} text="ILUSTRAÇÃO · É INVISÍVEL" />;
const S4: React.FC<SceneProps> = ({ scene }) => <Legend g={useG(scene)} />;
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const q = track("pie.q", g) * (track("pie.show", g) > 0.5 ? 1 : 0);
  return (
    <>
      <Legend g={g} />
      {q > 0.01 ? <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 260, color: "#f2c14e", opacity: clamp(q, 0, 1), transform: `scale(${0.6 + 0.4 * clamp(q, 0, 1)})`, ...STROKE, WebkitTextStroke: "8px #0b0812" }}>?</div> : null}
    </>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(SOLAR, [3, -2.0, 0])} text="1,5 MILHÃO DE KM" appear={track("dist.k", g)} offset={[0, 70]} size={30} accent="#c4b5fd" />
      <WorldLabel pose={pose} point={add(EUCLID_P, [0, 1.2, 0])} text="EUCLID" appear={1} offset={[0, -70]} size={30} accent="#9fd0ff" />
      <WorldLabel pose={pose} point={add(SOLAR, [0, 1.6, 0])} text="TERRA" appear={1} offset={[0, -60]} size={28} accent="#7fb2ff" />
      <Seal v={1} />
    </>
  );
};
const S7: React.FC<SceneProps> = () => <Seal v={1} />;
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const n = Math.round(track("counter", g));
  return (
    <>
      {n > 0 ? (
        <div style={{ position: "absolute", top: 1110, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
          <span style={{ fontSize: 100, color: "#9fd0ff", ...STROKE, WebkitTextStroke: "5px #0b0812" }}>{n}</span>
          <span style={{ fontSize: 44, color: "#fff", marginLeft: 14, ...STROKE }}>MILHÕES</span>
        </div>
      ) : null}
      <Seal v={1} />
    </>
  );
};
const S9: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(ICE, [0, 0.9, 0])} text="5% · O QUE A GENTE VÊ" appear={track("label.5", g)} offset={[0, -90]} size={30} accent="#ffcf5a" />
      <WorldLabel pose={pose} point={add(ICE, [0, -3.2, 0])} text="95% · INVISÍVEL" appear={track("label.95", g)} offset={[0, 0]} size={34} accent="#a78bfa" />
    </>
  );
};

export const COSMOS_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 }, s9: { Overlay: S9 },
};
