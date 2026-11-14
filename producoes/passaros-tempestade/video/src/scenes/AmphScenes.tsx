import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { add, LAB, MAP, SKIN } from "../data/amph";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp, rand } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "único anfíbio que vivia no mar".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const RED = "#ff5a4a";
const GOLD = "#ffcf3a";

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const n = Math.round(track("count", g));
  const x = clamp(track("seaX", g), 0, 1.3);
  return (
    <>
      {n > 0 ? (
        <div style={{ position: "absolute", top: 1080, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
          <span style={{ fontSize: 130, color: "#7ad05a", ...stroke(8) }}>{n.toLocaleString("pt-BR")}</span>
          <div style={{ fontSize: 40, color: "#fff", ...stroke(4) }}>ESPÉCIES DE ANFÍBIOS</div>
        </div>
      ) : null}
      {x > 0.01 ? <div style={{ position: "absolute", top: 640, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 380, lineHeight: 1, color: RED, opacity: clamp(x, 0, 1), transform: `scale(${0.5 + 0.5 * x})`, ...stroke(12) }}>✖</div> : null}
      <Seal v={track("sil", g)} text="ILUSTRAÇÃO" />
    </>
  );
};
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(SKIN, [-0.9, 0.32, 0.7])} text="PELE" appear={1} offset={[-30, 40]} size={26} accent="#7ad05a" />
      <WorldLabel pose={pose} point={add(SKIN, [0.6, 0.95, 0])} text="SAL DO MAR" appear={track("salt", g)} offset={[0, -60]} size={26} accent="#ffffff" />
      <WorldLabel pose={pose} point={add(SKIN, [-0.3, 0.75, 0])} text="ÁGUA SAINDO" appear={track("skin.out", g)} offset={[-40, -110]} size={26} accent="#4aa8ff" />
      <Seal v={1} />
    </>
  );
};
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(LAB, [-0.65, 0.02, 0.56])} text="1 METRO" appear={track("ruler.k", g)} offset={[0, 60]} size={28} accent={GOLD} />
      <Seal v={track("armor.k", g)} text="RECONSTRUÇÃO ARTÍSTICA" />
    </>
  );
};
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const q = clamp(track("q.k", g), 0, 1.3);
  return (
    <>
      {q > 0.01 ? <div style={{ position: "absolute", top: 620, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 300, lineHeight: 1, color: GOLD, opacity: clamp(q, 0, 1), transform: `scale(${0.5 + 0.5 * q})`, ...stroke(10) }}>?</div> : null}
      <Seal v={1} text="ILUSTRAÇÃO" />
    </>
  );
};
const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const k = track("coast.k", g);
  return (
    <>
      <WorldLabel pose={pose} point={add(MAP, [-2.5 - k * 4.5 - 1.6, 0.5, 2])} text="TERRA" appear={1} offset={[0, -40]} size={28} accent="#e8d8a0" />
      <WorldLabel pose={pose} point={add(MAP, [3.5, 1.2, 0.5])} text="FÓSSIL" appear={1} offset={[0, -60]} size={28} accent={RED} />
      <WorldLabel pose={pose} point={add(MAP, [(-2.5 - k * 4.5 + 3.2) / 2, 0.1, 0.5])} text="DEZENAS DE KM" appear={k} offset={[0, 60]} size={26} accent="#ffffff" />
      <Seal v={1} text="MAPA ESQUEMÁTICO" />
    </>
  );
};

/** Duas "assinaturas" (código de barras) que deslizam e se encaixam. */
const Barcode: React.FC<{ seed: string; color: string; label: string; x: number; v: number }> = ({ seed, color, label, x, v }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 16, transform: `translateX(${x}px)`, opacity: clamp(v, 0, 1) }}>
    <div style={{ width: 230, textAlign: "right", fontFamily: FONT, fontWeight: 900, fontSize: 30, color, ...stroke(4) }}>{label}</div>
    <div style={{ display: "flex", gap: 6, alignItems: "flex-end", padding: "10px 14px", borderRadius: 14, background: "rgba(11,8,18,0.72)", border: `3px solid ${color}` }}>
      {Array.from({ length: 16 }, (_, i) => (
        <div key={i} style={{ width: 10, height: 30 + Math.round(rand(`bar${i}`) * 60), background: color, borderRadius: 3 }} />
      ))}
    </div>
  </div>
);
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const m = clamp(track("match.k", g), 0, 1);
  const v = clamp(track("sr.glow", g), 0, 1);
  return (
    <div style={{ position: "absolute", top: 1010, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
      <Barcode seed="a" color={GOLD} label="OSSO" x={0} v={v} />
      <Barcode seed="a" color="#4aa8ff" label="MAR TRIÁSSICO" x={(1 - m) * 500} v={m} />
      {m > 0.98 ? <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#4ade80", ...stroke(6) }}>✔ IGUAIS</div> : null}
    </div>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Seal v={track("sealI.k", g)} text="HIPÓTESE · ILUSTRAÇÃO" />;
};
const S8: React.FC<SceneProps> = () => <Seal v={1} text="RECONSTRUÇÃO ARTÍSTICA" />;

export const AMPH_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
