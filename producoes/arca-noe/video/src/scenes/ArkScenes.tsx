import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { SeriesCard } from "../components/Series";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, ARARAT_P, LAND } from "../data/ark";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Acharam a Arca de Noé?".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const GOLD = "#ffcf3a";

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return <WorldLabel pose={pose} point={add(LAND, add(ARARAT_P, [0, 48, 0]))} text="MONTE ARARAT" appear={track("land.show", g)} offset={[0, -40]} size={26} accent="#e8ecf2" />;
};
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <SeriesCard v={track("series.card", g)} top={520} />
      <VerdictMeter show={track("verdict.show", g)} needle={track("verdict.wobble", g) * 22 * Math.sin(g / 5)} size={380} top={1090} />
    </>
  );
};
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(LAND, [0, 2.2, 3.1])} text="157 M" appear={track("ruler.k", g)} offset={[0, -40]} size={32} accent="#ffffff" />
      <WorldLabel pose={pose} point={add(LAND, add(ARARAT_P, [0, 48, 0]))} text="MONTE ARARAT" appear={1} offset={[0, -40]} size={24} accent="#e8ecf2" />
    </>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = clamp(track("ark.draw", g) * 2, 0, 1);
  return v > 0.01 ? (
    <div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, opacity: v }}>
      <div style={{ display: "inline-block", padding: "10px 26px", borderRadius: 18, background: "rgba(11,8,18,0.75)", border: `3px solid ${GOLD}` }}>
        <div style={{ fontSize: 40, color: GOLD }}>GÊNESIS 6:15</div>
        <div style={{ fontSize: 34, color: "#fff" }}>300 × 50 × 30 côvados</div>
      </div>
    </div>
  ) : null;
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={[0, -300 + 1.6, 1.2]} text="CAMADAS DOBRADAS" appear={track("fold.k", g) > 0.9 ? 1 : 0} offset={[0, -120]} size={26} accent="#e8d8b0" />
      <Seal v={1} />
    </>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const labs = clamp(track("labs.k", g), 0, 1.2);
  const wait = clamp(track("wait.k", g), 0, 1.2);
  return (
    <div style={{ position: "absolute", top: 1040, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 16, fontFamily: FONT, fontWeight: 900 }}>
      {labs > 0.01 ? (
        <div style={{ display: "flex", gap: 22, opacity: clamp(labs, 0, 1), transform: `scale(${0.8 + 0.2 * labs})` }}>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} style={{ width: 120, padding: "10px 0", borderRadius: 16, background: "rgba(11,8,18,0.75)", border: "3px solid #9fd0ff", textAlign: "center" }}>
              <div style={{ fontSize: 46 }}>🧪</div>
              <div style={{ fontSize: 22, color: "#9fd0ff" }}>LAB {i}</div>
            </div>
          ))}
        </div>
      ) : null}
      {wait > 0.01 ? <div style={{ fontSize: 44, color: GOLD, opacity: clamp(wait, 0, 1), ...stroke(5) }}>⏳ AGUARDANDO RESULTADO</div> : null}
    </div>
  );
};

/** Anéis da madeira (idade ✔) × barco (função ?). */
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const r = clamp(track("rings.k", g), 0, 1);
  const b = clamp(track("boatq.k", g), 0, 1.2);
  if (r < 0.01) return <Seal v={1} text="HIPÓTESE DO LÍDER DA EQUIPE" />;
  return (
    <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 60, fontFamily: FONT, fontWeight: 900, opacity: r }}>
      <div style={{ textAlign: "center" }}>
        <svg width={260} height={260} viewBox="-130 -130 260 260">
          {Array.from({ length: 9 }, (_, i) => (
            <circle key={i} r={120 - i * 13} fill={i % 2 ? "#c89a62" : "#b8844e"} stroke="#6a4a2a" strokeWidth={3} />
          ))}
          <circle r={8} fill="#6a4a2a" />
        </svg>
        <div style={{ fontSize: 38, color: "#4ade80", ...stroke(5) }}>✔ IDADE</div>
      </div>
      {b > 0.01 ? (
        <div style={{ textAlign: "center", opacity: clamp(b, 0, 1), transform: `scale(${0.7 + 0.3 * b})` }}>
          <div style={{ width: 260, height: 260, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 170 }}>⛵</div>
          <div style={{ fontSize: 38, color: "#ff5a4a", ...stroke(5) }}>✖ ERA BARCO?</div>
        </div>
      ) : null}
    </div>
  );
};

const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const big = track("verdict.big", g);
  const items: [string, string][] = [["chk1", "RESULTADO DA DATAÇÃO"], ["chk2", "ESTUDO REVISADO POR CIENTISTAS"], ["chk3", "PROVA DE ESTRUTURA FEITA POR GENTE"]];
  return (
    <>
      <VerdictMeter show={big} needle={track("verdict.needle", g)} size={520} top={760} verdict={track("verdict.hit", g)} />
      <div style={{ position: "absolute", top: 1000, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 12, fontFamily: FONT, fontWeight: 900 }}>
        {items.map(([t, label]) => {
          const v = clamp(track(t, g), 0, 1.2);
          return v > 0.01 ? (
            <div key={t} style={{ padding: "8px 22px", borderRadius: 999, background: "rgba(11,8,18,0.78)", border: `3px solid ${GOLD}`, color: "#fff", fontSize: 32, opacity: clamp(v, 0, 1), transform: `translateX(${(1 - clamp(v, 0, 1)) * -60}px)` }}>
              <span style={{ color: GOLD }}>☐ FALTA:</span> {label}
            </div>
          ) : null;
        })}
      </div>
    </>
  );
};

export const ARK_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
