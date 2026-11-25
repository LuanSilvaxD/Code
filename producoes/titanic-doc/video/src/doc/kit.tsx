import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { usePose } from "../components/CameraController";
import { Lighting } from "../components/Lighting";
import { PostFx3D } from "../components/PostFx3D";
import { worldScale } from "../components/Person";
import { FONT } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";

// Kit compartilhado das partes do documentário: câmera por chaves, planos com fade, textos, barras de cinema.
export const S = (sec: number) => Math.round(sec * 30);
export const W = 1920, H = 1080, BAR = 138;
export const WS = worldScale(1);
export const P = WS.person;
export const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
export type Key = [number, Vec3, Vec3]; // [frame local, posição, alvo]
export const poseAt = (f: number, keys: Key[], fov: number) => {
  if (f <= keys[0][0]) return { position: keys[0][1], target: keys[0][2], fov };
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0, t0] = keys[i], [f1, p1, t1] = keys[i + 1];
    if (f <= f1) {
      const k = ease(clamp((f - f0) / Math.max(1, f1 - f0), 0, 1));
      const L = (a: Vec3, b: Vec3): Vec3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
      return { position: L(p0, p1), target: L(t0, t1), fov };
    }
  }
  const l = keys[keys.length - 1];
  return { position: l[1], target: l[2], fov };
};

export type LightKind = "night" | "day" | "interior" | "none";
export const Lights: React.FC<{ kind: LightKind }> = ({ kind }) =>
  kind === "day" ? (
    <Lighting shadowExtent={40} />
  ) : kind === "night" ? (
    <>
      <ambientLight intensity={0.38} color="#8aa0d0" />
      <hemisphereLight args={["#5a6a9a", "#101018", 0.5]} />
      <directionalLight position={[-30, 40, 20]} intensity={0.55} color="#a8b8e8" />
    </>
  ) : kind === "interior" ? (
    <>
      <ambientLight intensity={0.35} color="#d8c8b0" />
      <hemisphereLight args={["#e8d8c0", "#2a2018", 0.35]} />
    </>
  ) : null;

/** Canvas 3D de um plano: câmera animada por chaves (frames locais do plano). */
export const Cine: React.FC<{ keys: Key[]; fov?: number; light?: LightKind; bg: string; filter?: string; w?: number; h?: number; glow?: number; children: (f: number) => React.ReactNode }> = ({ keys, fov = 40, light = "night", bg, filter, w = W, h = H, glow = 0, children }) => {
  const f = useCurrentFrame();
  const pose = poseAt(f, keys, fov);
  const Cam = () => {
    usePose(pose);
    return null;
  };
  return (
    <AbsoluteFill style={{ background: bg, filter }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov, near: 0.1, far: 4000, position: pose.position }} onCreated={({ gl }) => { gl.localClippingEnabled = true; }}>
        <Cam />
        <Lights kind={light} />
        {children(f)}
        {glow > 0 ? <PostFx3D bloom={glow} /> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Plano com fade de entrada/saída (frames). */
export const Shot: React.FC<{ from: number; to: number; fin?: number; fout?: number; children: React.ReactNode }> = ({ from, to, fin = 0, fout = 0, children }) => (
  <Sequence from={from} durationInFrames={to - from} layout="none">
    <Fade len={to - from} fin={fin} fout={fout}>{children}</Fade>
  </Sequence>
);
const Fade: React.FC<{ len: number; fin: number; fout: number; children: React.ReactNode }> = ({ len, fin, fout, children }) => {
  const f = useCurrentFrame();
  const a = Math.min(fin > 0 ? clamp(f / fin, 0, 1) : 1, fout > 0 ? clamp((len - f) / fout, 0, 1) : 1);
  return <AbsoluteFill style={{ opacity: a }}>{children}</AbsoluteFill>;
};

export const NIGHT = "linear-gradient(180deg,#02040c 0%,#081228 60%,#10203e 100%)";
export const DAY = "linear-gradient(180deg,#8fb4d4 0%,#cfdbe4 65%,#e8e2d2 100%)";
export const STUDIO = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";

/* ------------------------------------------------------------------ textos 2D (dentro da área útil) */

export const Caption: React.FC<{ text: string; sub?: string; from: number; len: number; pos?: "bl" | "c" | "tl" }> = ({ text, sub, from, len, pos = "bl" }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 15, 0, 1), clamp((len - f) / 15, 0, 1));
  const place: React.CSSProperties = pos === "c" ? { left: 0, right: 0, top: H / 2 - 40, textAlign: "center" } : pos === "tl" ? { left: 110, top: BAR + 40 } : { left: 110, bottom: BAR + 46 };
  return (
    <div style={{ position: "absolute", ...place, opacity: a, fontFamily: FONT, color: "#f4efe4", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
      <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: 6 }}>{text}</div>
      {sub ? <div style={{ fontWeight: 500, fontSize: 20, letterSpacing: 4, color: "#c8c0b0", marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
};

export const ChapterTag: React.FC<{ n: number; title: string; from: number; len: number }> = ({ n, title, from, len }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 18, 0, 1), clamp((len - f) / 18, 0, 1));
  return (
    <div style={{ position: "absolute", left: 110, bottom: BAR + 50, opacity: a, fontFamily: FONT, color: "#f4efe4", textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}>
      <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 8, color: "#d8c8a0" }}>CAPÍTULO {n}</div>
      <div style={{ width: 70 * a, height: 2, background: "#d8c8a0", margin: "8px 0" }} />
      <div style={{ fontWeight: 800, fontSize: 52, letterSpacing: 4 }}>{title}</div>
    </div>
  );
};

export const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.min(clamp(f / 25, 0, 1), clamp((150 - f) / 25, 0, 1));
  const sc = 1 + f * 0.0006;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%,#0c1a30 0%,#000 70%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a, transform: `scale(${sc})`, textAlign: "center", fontFamily: FONT, color: "#f4efe4" }}>
        <div style={{ fontWeight: 800, fontSize: 150, letterSpacing: 40, marginRight: -40 }}>TITANIC</div>
        <div style={{ width: 520, height: 2, background: "#c9a24a", margin: "14px auto 22px" }} />
        <div style={{ fontWeight: 500, fontSize: 34, letterSpacing: 10, color: "#d8d0c0" }}>O QUE REALMENTE ACONTECEU NAQUELA NOITE</div>
      </div>
    </AbsoluteFill>
  );
};

/** Página de revista técnica de 1911 (2D, desenho próprio) com a frase destacada. */
export const MagazinePage: React.FC = () => {
  const f = useCurrentFrame();
  const hl = clamp((f - S(4.2)) / 20, 0, 1);
  const sc = 0.82 + f * 0.0006;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%,#2a2018 0%,#0a0806 80%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 900, background: "linear-gradient(180deg,#efe4c8,#e2d4b2)", transform: `scale(${sc}) rotate(-2deg)`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", padding: "50px 56px", fontFamily: "Georgia, serif", color: "#2a2016", position: "relative" }}>
        <div style={{ textAlign: "center", fontSize: 54, fontWeight: 700, letterSpacing: 4, borderBottom: "3px double #2a2016", paddingBottom: 10 }}>THE SHIPBUILDER</div>
        <div style={{ textAlign: "center", fontSize: 20, letterSpacing: 6, margin: "10px 0 24px" }}>EDIÇÃO ESPECIAL · 1911</div>
        <svg width="648" height="150" viewBox="0 0 648 150">
          <rect x="40" y="90" width="560" height="34" fill="#2a2016" />
          <rect x="140" y="64" width="380" height="26" fill="#6a5a44" />
          {[200, 280, 360, 440].map((x) => <rect key={x} x={x} y="14" width="34" height="52" fill="#2a2016" transform={`skewX(-6)`} />)}
          <line x1="0" y1="124" x2="648" y2="124" stroke="#2a2016" strokeWidth="2" />
        </svg>
        {Array.from({ length: 13 }, (_, i) => (
          <div key={i} style={{ height: 10, background: "rgba(42,32,22,0.22)", margin: "12px 0", width: `${86 + rand(`mg${i}`) * 14}%` }} />
        ))}
        <div style={{ position: "absolute", left: 56, right: 56, top: 560, fontSize: 40, fontStyle: "italic", textAlign: "center" }}>
          <span style={{ background: `linear-gradient(90deg, rgba(255,210,90,0.85) ${hl * 100}%, transparent ${hl * 100}%)`, padding: "0 8px" }}>“practically unsinkable”</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: BAR + 40, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#ffd27a", opacity: hl, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>"PRATICAMENTE INAFUNDÁVEL"</div>
    </AbsoluteFill>
  );
};

/** Faixas pretas de cinema (2,39:1). */
export const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: BAR, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BAR, background: "#000" }} />
  </>
);

