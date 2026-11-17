import { useCurrentFrame } from "remotion";
import { cameraPoseAt } from "../components/CameraController";
import { Clock2D, DayCounter, PhoneMap, SpinGauge, Thermo, TICK_SECONDS, TICK_T0, YearsCard } from "../components/Interstellar2D";
import { LikeSubscribe } from "../components/LikeSubscribe";
import { SeriesCard } from "../components/Series";
import { VerdictMeter } from "../components/Verdict";
import { WorldLabel } from "../components/WorldLabel";
import { add, GPS, planetPos, SEA, SKY_BH, SPACE } from "../data/is";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "Filme × Realidade #1".
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const GOLD = "#ffcf3a";
const ticksAt = (g: number) => Math.max(0, (g / 30 - TICK_T0) / TICK_SECONDS);

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
const Pop: React.FC<{ v: number; children: React.ReactNode; style: React.CSSProperties }> = ({ v, children, style }) =>
  v < 0.01 ? null : <div style={{ position: "absolute", opacity: clamp(v, 0, 1), transform: `scale(${0.7 + 0.3 * clamp(v, 0, 1.1)})`, ...style }}>{children}</div>;

const S1: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const sp = track("split", g);
  return (
    <>
      <SeriesCard v={track("series.card", g)} top={560} />
      <Pop v={sp} style={{ left: 120, top: 880, transformOrigin: "50% 50%" }}><Clock2D ticks={0.3} size={300} label="1 HORA · PLANETA" /></Pop>
      <Pop v={sp} style={{ right: 120, top: 880, transformOrigin: "50% 50%" }}><YearsCard years={track("years", g)} label="NA TERRA" /></Pop>
      <Pop v={sp} style={{ left: 0, right: 0, top: 1000, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 90, color: "#fff", WebkitTextStroke: "6px #0b0812", paintOrder: "stroke fill" }}>=</Pop>
    </>
  );
};

const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("ticks.k", g);
  const t = ticksAt(g);
  const t0 = Math.floor(ticksAt(scene.startFrame));
  return (
    <>
      <Pop v={v} style={{ left: 315, top: 400, transformOrigin: "50% 50%" }}><Clock2D ticks={t} size={450} label="PLANETA" /></Pop>
      <Pop v={v} style={{ left: 0, right: 0, top: 1080, transformOrigin: "50% 50%" }}><DayCounter ticks={t - t0} /></Pop>
    </>
  );
};

const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const space = track("space.show", g) > 0.5;
  return (
    <>
      {space ? <WorldLabel pose={pose} point={add(SPACE, add(planetPos(6), [0, 0.6, 0]))} text="PLANETA" appear={1} offset={[0, -40]} size={24} accent="#7fe0ff" /> : null}
      {!space && track("clocks.k", g) > 0.5 ? (
        <>
          <div style={{ position: "absolute", left: 90, top: 1120, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: "#ffb0a0", WebkitTextStroke: "4px #0b0812", paintOrder: "stroke fill" }}>PERTO: LENTO</div>
          <div style={{ position: "absolute", right: 90, top: 1120, fontFamily: FONT, fontWeight: 900, fontSize: 30, color: "#a0ffc0", WebkitTextStroke: "4px #0b0812", paintOrder: "stroke fill" }}>LONGE: RÁPIDO</div>
        </>
      ) : null}
      <Seals g={g} />
    </>
  );
};

const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const ph = track("phone", g);
  return (
    <>
      {ph < 0.5 ? <WorldLabel pose={pose} point={add(GPS, [0, 1.9, 0])} text="TERRA" appear={1} offset={[0, -30]} size={24} accent="#8fd0ff" /> : null}
      <Pop v={ph} style={{ left: 360, top: 470, transformOrigin: "50% 30%" }}><PhoneMap drift={track("drift", g)} fix={0} w={360} /></Pop>
    </>
  );
};

const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <Pop v={track("gauge", g)} style={{ left: 370, top: 420, transformOrigin: "50% 0%" }}><SpinGauge v={track("gauge.v", g)} size={340} /></Pop>
      <WorldLabel pose={pose} point={add(SPACE, add(planetPos(track("orbit.r", g, 6)), [0, 0.6, 0]))} text="PLANETA" appear={1} offset={[0, -40]} size={24} accent="#7fe0ff" />
      <LikeSubscribe t={track("ls", g)} top={1040} side="right" />
    </>
  );
};

/** Inset: o planeta esticado pela maré (oval) e balançando (seta curva) — ESQUEMA. */
const TideInset: React.FC<{ v: number; f: number }> = ({ v, f }) => {
  const rock = Math.sin(f / 10) * 14;
  return (
    <Pop v={v} style={{ left: 90, top: 440, transformOrigin: "0 0" }}>
      <div style={{ width: 330, height: 250, borderRadius: 24, background: "rgba(11,8,18,0.8)", border: "3px solid #7fe0ff", position: "relative", fontFamily: FONT }}>
        <svg width="330" height="210" viewBox="0 0 330 210">
          <circle cx="50" cy="105" r="26" fill="#000" stroke="#ffb04a" strokeWidth="5" />
          <g transform={`rotate(${rock} 205 105)`}>
            <ellipse cx="205" cy="105" rx="70" ry="46" fill="#2b86a8" stroke="#0b0812" strokeWidth="4" />
            <ellipse cx="205" cy="105" rx="50" ry="40" fill="#1f6f9a" />
            <path d="M140 105 L120 105" stroke="#7fe0ff" strokeWidth="6" markerEnd="" />
          </g>
          <path d="M150 40 A80 70 0 0 1 262 40" fill="none" stroke="#ffcf3a" strokeWidth="6" />
          <path d="M262 40 l-16 -6 l4 16 z" fill="#ffcf3a" />
          <path d="M150 170 A80 70 0 0 0 262 170" fill="none" stroke="#ffcf3a" strokeWidth="6" />
          <path d="M150 170 l16 6 l-4 -16 z" fill="#ffcf3a" />
        </svg>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", color: "#e3dcff", fontWeight: 800, fontSize: 20 }}>MARÉ ESTICA + PLANETA BALANÇA</div>
      </div>
    </Pop>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  return (
    <>
      <TideInset v={track("inset", g)} f={g} />
      <WorldLabel pose={pose} point={add(SEA, add(SKY_BH, [0, 4.5, 0]))} text="BURACO NEGRO" appear={track("inset", g) > 0.5 ? 0 : 1} offset={[0, -30]} size={24} accent={GOLD} />
    </>
  );
};
const S7: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <>
      <Pop v={track("thermo", g)} style={{ right: 140, top: 520, transformOrigin: "50% 50%" }}><Thermo v={track("thermo.v", g)} /></Pop>
      <Seals g={g} />
    </>
  );
};
const S8: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <VerdictMeter show={track("verdict", g)} needle={track("needle", g, -90)} size={440} top={1000} labels={["✖ NÃO FUNCIONA", "FUNCIONA ✔"]} />;
};

export const IS_MODULES: Record<string, SceneModule> = {
  s1: { Overlay: S1 }, s2: { Overlay: S2 }, s3: { Overlay: S3 }, s4: { Overlay: S4 }, s5: { Overlay: S5 }, s6: { Overlay: S6 }, s7: { Overlay: S7 }, s8: { Overlay: S8 },
};
