import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { SeriesCard } from "../components/Series";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, HOURGLASS, SECTION, SPLIT } from "../data/sangue";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "sangue de dinossauro" (Boato ou Verdade? EP. 02).
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const RED = "#ff4a3d";
const GREEN = "#3fd27a";
const YEL = "#f2c14e";
const STROKE = { WebkitTextStroke: "3px #0b0812", paintOrder: "stroke fill" } as const;

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );
const Panel: React.FC<{ children: React.ReactNode; top: number; v: number; width?: number }> = ({ children, top, v, width = 760 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, left: 540 - width / 2, width, opacity: clamp(v, 0, 1), transform: `translateY(${(1 - clamp(v, 0, 1)) * 30}px) scale(${0.92 + 0.08 * clamp(v, 0, 1)})`, padding: "18px 24px", borderRadius: 26, background: "rgba(11,8,18,0.78)", border: "2px solid rgba(196,181,253,0.45)", boxShadow: "0 12px 30px rgba(0,0,0,0.5)", fontFamily: FONT, color: "#fff" }}>
      {children}
    </div>
  );

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Seal v={track("diorama.show", g) * track("dino.reveal", g)} text="RECONSTRUÇÃO ARTÍSTICA" />;
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
const S3: React.FC<SceneProps> = () => <Seal v={1} text="RECONSTRUÇÃO ARTÍSTICA" />;

/* s4 — etimologia em tupi */
const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("name.split", g);
  return (
    <Panel top={1060} v={v} width={820}>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 18, fontWeight: 900 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 76, color: "#ffd36a", ...STROKE }}>ARA</div>
          <div style={{ fontSize: 28 }}>nascido</div>
        </div>
        <div style={{ fontSize: 60, color: "#c4b5fd", paddingBottom: 30 }}>+</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 76, color: "#ff7a3a", ...STROKE }}>ATÁ</div>
          <div style={{ fontSize: 28 }}>fogo</div>
        </div>
        <div style={{ fontSize: 60, color: "#c4b5fd", paddingBottom: 30 }}>+</div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 56, color: "#ece6ff", ...STROKE }}>SAURUS</div>
          <div style={{ fontSize: 28 }}>lagarto</div>
        </div>
      </div>
    </Panel>
  );
};
const S5: React.FC<SceneProps> = () => <Seal v={1} />;
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(SECTION, [0.9, 0.6, 0.3])} text="CANAIS" appear={track("canals.flow", g) > 0.05 || g - scene.startFrame > 120 ? 1 : 0} offset={[120, -80]} size={32} accent={RED} />
      <Seal v={1} />
    </>
  );
};
/* s7 — vinheta de microscópio */
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const z = track("micro.zoom", g);
  if (z < 0.01) return <Seal v={1} />;
  return (
    <>
      <div style={{ position: "absolute", inset: 0, opacity: clamp(z, 0, 1), background: "radial-gradient(circle at 50% 46%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 36%, rgba(6,4,8,0.92) 44%, rgba(6,4,8,0.98) 100%)" }} />
      <div style={{ position: "absolute", left: 540 - 400, top: 883 - 400, width: 800, height: 800, borderRadius: 400, border: `6px solid rgba(196,181,253,${0.5 * z})`, boxSizing: "border-box" }} />
      <Seal v={1} />
    </>
  );
};
const S9: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(SPLIT, [-1.5, 0.6, 0])} text="ESPERADA: ABAULADA" appear={track("label.a", g)} offset={[0, -140]} size={30} accent={YEL} />
      <WorldLabel pose={pose} point={add(SPLIT, [1.5, 0.6, 0])} text="ACHADA: CÔNCAVA" appear={track("label.b", g)} offset={[0, -140]} size={30} accent={RED} />
      <VerdictMeter show={track("verdict.show", g)} needle={track("verdict.wobble", g) * 14 * Math.sin(g / 4)} size={320} top={1110} />
    </>
  );
};
const S10: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <VerdictMeter show={track("verdict.big", g)} needle={track("verdict.needle", g)} size={520} top={760} />;
};
const S11: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <WorldLabel pose={cameraPoseAt(g)} point={add(HOURGLASS, [0, 1.3, 0])} text="~500 ANOS" appear={track("hourglass.show", g)} offset={[0, -60]} size={34} accent={YEL} />;
};
/* s12 — barra do tempo em proporção real */
const S12: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("timeline.show", g);
  const k = track("timeline.k", g);
  const W = 800;
  return (
    <Panel top={1080} v={v} width={880}>
      <div style={{ position: "relative", height: 150 }}>
        <div style={{ position: "absolute", left: 0, top: 58, width: W, height: 26, borderRadius: 13, background: "rgba(255,255,255,0.12)" }} />
        <div style={{ position: "absolute", left: 0, top: 58, width: Math.max(8, W * k), height: 26, borderRadius: 13, background: k > 0.02 ? `linear-gradient(90deg, ${YEL}, ${RED})` : YEL }} />
        {/* marca 1,5 milhão */}
        <div style={{ position: "absolute", left: W * 0.013 - 2, top: 40, width: 4, height: 62, background: "#cfe8ff" }} />
        <div style={{ position: "absolute", left: 0, top: 0, fontWeight: 900, fontSize: 26, color: "#cfe8ff", whiteSpace: "nowrap" }}>DNA ILEGÍVEL · ~1,5 MILHÃO</div>
        <div style={{ position: "absolute", right: 0, top: 104, fontWeight: 900, fontSize: 30, color: RED, opacity: k > 0.5 ? 1 : 0, ...STROKE }}>OSSO · 115 MILHÕES</div>
        <div style={{ position: "absolute", left: 0, top: 108, fontWeight: 700, fontSize: 22, color: "#d9d2f0" }}>hoje</div>
      </div>
    </Panel>
  );
};
const S13: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("amber.cross", g);
  if (v < 0.01) return null;
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      <path d="M380,700 L700,1020 M700,700 L380,1020" stroke={RED} strokeWidth={34} strokeLinecap="round" opacity={clamp(v, 0, 1)} style={{ filter: "drop-shadow(0 6px 14px rgba(0,0,0,0.6))" }} />
    </svg>
  );
};
const Icon: React.FC<{ v: number; title: string; color: string; glyph: React.ReactNode }> = ({ v, title, color, glyph }) => (
  <div style={{ width: 330, textAlign: "center", opacity: clamp(v, 0, 1), transform: `translateY(${(1 - clamp(v, 0, 1)) * 40}px)` }}>
    <div style={{ width: 120, height: 120, margin: "0 auto", borderRadius: 30, background: "rgba(11,8,18,0.8)", border: `4px solid ${color}`, display: "flex", alignItems: "center", justifyContent: "center" }}>{glyph}</div>
    <div style={{ marginTop: 10, fontFamily: FONT, fontWeight: 900, fontSize: 28, lineHeight: 1.1, color: "#fff", ...STROKE }}>{title}</div>
  </div>
);
const S14: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <VerdictMeter show={track("verdict.big", g)} needle={track("verdict.needle", g)} size={520} top={760} verdict={track("verdict.hit", g)} />
      <div style={{ position: "absolute", top: 1090, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 30 }}>
        <Icon v={track("summary.a", g)} title="SANGUE: MEIA VERDADE" color={YEL} glyph={<svg width={70} height={80}><path d="M35,6 C35,6 10,40 10,54 A25,25 0 0 0 60,54 C60,40 35,6 35,6 Z" fill="#c21f1f" opacity={0.55} stroke={YEL} strokeWidth={4} /></svg>} />
        <Icon v={track("summary.b", g)} title="CLONE: BOATO" color={RED} glyph={<svg width={74} height={74}><path d="M20,8 C54,24 20,50 54,66 M54,8 C20,24 54,50 20,66" stroke="#e8e8f0" strokeWidth={5} fill="none" /><path d="M14,14 L60,60 M60,14 L14,60" stroke={RED} strokeWidth={7} strokeLinecap="round" /></svg>} />
      </div>
      <Seal v={track("diorama.show", g)} text="RECONSTRUÇÃO ARTÍSTICA" />
    </>
  );
};

export const SANGUE_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 },
  s9: { Overlay: S9 }, s10: { Overlay: S10 }, s11: { Overlay: S11 }, s12: { Overlay: S12 }, s13: { Overlay: S13 }, s14: { Overlay: S14 },
};
void GREEN;
