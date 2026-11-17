import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { WorldLabel } from "../components/WorldLabel";
import { add, DEEP, P9_POS, P9W, PLU, SOL } from "../data/px";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Existe um Planeta X?".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const stroke = (px: number) => ({ WebkitTextStroke: `${px}px #0b0812`, paintOrder: "stroke fill" }) as const;
const RED = "#ff5a4a";
const GOLD = "#ffcf3a";
const XS: [number, number, number] = [-18, 4, 7];

const Seal: React.FC<{ v: number; text?: string; top?: number }> = ({ v, text = "ESQUEMA · FORA DE ESCALA", top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );
const Seals: React.FC<{ g: number }> = ({ g }) => (
  <>
    <Seal v={track("seal.k", g)} />
    <Seal v={track("sealI.k", g)} text="ILUSTRAÇÃO" />
  </>
);

/** Balão de comentário (sem nome nem foto do inscrito — privacidade). */
const Comment: React.FC<{ v: number }> = ({ v }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top: 1060, left: 90, right: 90, opacity: clamp(v, 0, 1), transform: `translateY(${(1 - clamp(v, 0, 1)) * 30}px) scale(${0.9 + 0.1 * clamp(v, 0, 1)})`, fontFamily: FONT }}>
      <div style={{ display: "flex", gap: 18, alignItems: "center", padding: "20px 24px", borderRadius: 26, background: "rgba(246,243,255,0.96)", boxShadow: "0 14px 34px rgba(0,0,0,0.5)", border: "3px solid #8b5cf6" }}>
        <div style={{ width: 70, height: 70, borderRadius: 35, background: "linear-gradient(135deg,#8b5cf6,#5b33d6)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 900, fontSize: 34 }}>?</div>
        <div>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#6b5a9a", letterSpacing: 1 }}>INSCRITO DO CANAL · 1ª PERGUNTA</div>
          <div style={{ fontSize: 38, fontWeight: 900, color: "#171222", lineHeight: 1.1 }}>Existe um Planeta X escondido?</div>
        </div>
      </div>
      <div style={{ marginLeft: 60, width: 0, height: 0, borderLeft: "18px solid transparent", borderRight: "18px solid transparent", borderTop: "22px solid rgba(246,243,255,0.96)" }} />
    </div>
  );

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(DEEP, [0, 1.6, 0])} text="SOL" appear={track("x.k", g) > 0 && track("comment", g) < 0.5 ? 1 : 0} offset={[0, -40]} size={24} accent={GOLD} />
      <WorldLabel pose={pose} point={add(DEEP, add(XS, [0, 2.8, 0]))} text="?" appear={clamp(track("x.k", g), 0, 1)} offset={[0, -50]} size={60} accent={GOLD} />
      <Comment v={track("comment", g)} />
    </>
  );
};

const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  if (track("plu.show", g) < 0.5) return null;
  return (
    <>
      <WorldLabel pose={pose} point={add(PLU, [0, 2.6, 0])} text="NETUNO" appear={1} offset={[0, -30]} size={28} accent="#7f9bff" />
      <WorldLabel pose={pose} point={add(PLU, [0.9, -1.0, 1.2])} text="PLUTÃO" appear={clamp(track("pluto.k", g), 0, 1)} offset={[120, -10]} size={28} accent="#e8c8a0" />
    </>
  );
};

const DATES = ["2003", "2012", "2017"];
const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const n = track("dates", g);
  const st = track("stamp", g);
  const local = useCurrentFrame();
  return (
    <>
      <div style={{ position: "absolute", top: 380, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 34, fontFamily: FONT, fontWeight: 900 }}>
        {DATES.map((d, i) => {
          if (n < i + 1) return null;
          // cada data some riscada ~8 frames depois de aparecer
          const born = scene.animations.filter((a) => a.target === "dates")[i].startFrame;
          const cross = clamp((local - born - 8) / 6, 0, 1);
          return (
            <div key={d} style={{ position: "relative", fontSize: 76, color: "#fff", opacity: 1 - cross * 0.35, ...stroke(6) }}>
              {d}
              <div style={{ position: "absolute", left: -8, top: "48%", height: 10, width: `${cross * 112}%`, background: RED, borderRadius: 5, transform: "rotate(-12deg)", boxShadow: "0 0 0 3px #0b0812" }} />
            </div>
          );
        })}
      </div>
      {st > 0.01 ? (
        <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ transform: `rotate(-10deg) scale(${2.2 - 1.2 * clamp(st, 0, 1.1)})`, opacity: clamp(st * 1.5, 0, 1), padding: "10px 46px", border: `10px solid ${RED}`, borderRadius: 22, color: RED, fontFamily: FONT, fontWeight: 900, fontSize: 150, letterSpacing: 6, background: "rgba(11,8,18,0.35)", ...stroke(4) }}>BOATO</div>
        </div>
      ) : null}
    </>
  );
};

const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const sol = track("sol.show", g) > 0.5;
  return (
    <>
      {sol ? (
        <>
          <WorldLabel pose={pose} point={add(SOL, [0, 0, 0])} text="SOL" appear={1} offset={[0, 46]} size={24} accent={GOLD} />
          <WorldLabel pose={pose} point={add(SOL, [-8.6, 0, 0])} text="NETUNO" appear={1} offset={[0, 40]} size={22} accent="#7f9bff" />
          <WorldLabel pose={pose} point={add(SOL, [38, 0, 0])} text="OBJETOS DISTANTES" appear={clamp(track("orb.k", g) * 2, 0, 1)} offset={[0, 0]} size={24} accent={GOLD} />
          <WorldLabel pose={pose} point={add(SOL, add(P9_POS, [0, 0, 0]))} text="PLANETA NOVE?" appear={clamp(track("p9.k", g), 0, 1)} offset={[0, -80]} size={28} accent="#9fc8ff" />
        </>
      ) : null}
      <LikeSubscribe t={track("ls", g)} top={1040} side="right" />
      <Seals g={g} />
    </>
  );
};

const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const n = track("earths", g);
  const y = Math.round(track("years", g) / 100) * 100;
  const sol = track("sol.show", g) > 0.5;
  return (
    <>
      {!sol && n > 0.01 ? (
        <div style={{ position: "absolute", top: 1150, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 10 }}>
          {Array.from({ length: 10 }, (_, i) => {
            const k = clamp(n - i, 0, 1);
            return <div key={i} style={{ width: 62, height: 62, borderRadius: 31, opacity: k, transform: `scale(${0.5 + 0.5 * k})`, background: i < 5 ? "radial-gradient(circle at 35% 30%,#8fd0ff,#2f6fd0 70%)" : "radial-gradient(circle at 35% 30%,#8fd0ff88,#2f6fd055 70%)", border: i < 5 ? "3px solid #0b0812" : "3px dashed #8fd0ff" }} />;
          })}
        </div>
      ) : null}
      {!sol ? <WorldLabel pose={pose} point={add(P9W, [1.15, -1.5, 1.2])} text="TERRA" appear={clamp(track("earth.k", g), 0, 1)} offset={[110, 0]} size={26} accent="#8fd0ff" /> : null}
      {sol ? (
        <>
          <WorldLabel pose={pose} point={add(SOL, P9_POS)} text="PLANETA NOVE" appear={1} offset={[0, -70]} size={26} accent="#9fc8ff" />
          <WorldLabel pose={pose} point={add(SOL, [0, 0, 0])} text="SISTEMA SOLAR" appear={1} offset={[0, 50]} size={22} accent={GOLD} />
        </>
      ) : null}
      {sol && y > 0 ? (
        <div style={{ position: "absolute", top: 1100, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 900 }}>
          <span style={{ fontSize: 120, color: GOLD, ...stroke(7) }}>{y.toLocaleString("pt-BR")}</span>
          <span style={{ fontSize: 46, color: "#fff", marginLeft: 16, ...stroke(4) }}>ANOS</span>
        </div>
      ) : null}
      <Seals g={g} />
    </>
  );
};

const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <WorldLabel pose={pose} point={add(P9W, [-4, 6.8, -26])} text="SOL (BEM LONGE)" appear={clamp(track("farsun.k", g), 0, 1)} offset={[0, -40]} size={24} accent={GOLD} />
      <Seals g={g} />
    </>
  );
};
const S7: React.FC<SceneProps> = () => null;
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const fade = clamp((scene.durationInFrames - 165 - useCurrentFrame()) / 10, 0, 1);
  return (
    <>
      <WorldLabel pose={pose} point={add(DEEP, add(XS, [0, 2.8, 0]))} text="PLANETA NOVE?" appear={fade} offset={[0, -50]} size={28} accent="#9fc8ff" />
      <Seals g={g} />
    </>
  );
};

export const PX_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
