import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { Burst } from "../components/Burst";
import { cameraPoseAt, projectPoint } from "../components/CameraController";
import { onGlobe } from "../components/Kola";
import { WorldLabel } from "../components/WorldLabel";
import { BOTTOM_KM, depthY, FACE_Z, GLOBE, GLOBE_R, KM, KOLA_W, MOUTH, SCALE_POS, SIBERIA_W, Y0 } from "../data/kola";
import { track } from "../data/scenes";
import { FONT } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D do "buraco mais fundo". Dentro do Overlay o frame é LOCAL: g = frame global (trilhas são globais).
const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;
const RED = "#e2563f";
const YEL = "#f2c14e";
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const fmt = (m: number) => Math.round(m).toLocaleString("pt-BR");

const Seal: React.FC<{ v: number; text: string; top?: number }> = ({ v, text, top = 1250 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, right: 90, opacity: clamp(v, 0, 1) * 0.92, padding: "8px 16px", borderRadius: 12, border: "2px dashed #c4b5fd", background: "rgba(11,8,18,0.6)", color: "#e3dcff", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1 }}>{text}</div>
  );

const Stamp: React.FC<{ v: number; text: string; color?: string; top?: number }> = ({ v, text, color = RED, top = 640 }) =>
  v < 0.01 ? null : (
    <div style={{ position: "absolute", top, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div style={{ opacity: clamp(v, 0, 1), scale: String(1.6 - 0.6 * clamp(v, 0, 1)), rotate: "-8deg", padding: "16px 40px", border: `9px solid ${color}`, borderRadius: 18, color, fontFamily: FONT, fontWeight: 900, fontSize: 110, letterSpacing: 6, background: "rgba(11,8,18,0.6)" }}>{text}</div>
    </div>
  );

/** Medidor de profundidade (global): aparece quando a câmera está na coluna; mostra a broca, ou a câmera se a broca estiver longe. */
export const DepthHud: React.FC = () => {
  const g = useCurrentFrame();
  const pose = cameraPoseAt(g);
  const inColumn = pose.target[1] < Y0 - 0.25 && Math.abs(pose.target[0]) < 3 && Math.abs(pose.target[2] - FACE_Z) < 3;
  const myth = track("myth.k", g);
  if (!inColumn || myth > 0.4) return null;
  const camKm = clamp((Y0 - pose.target[1]) / KM, 0, BOTTOM_KM);
  const drill = track("drill.km", g);
  const km = Math.abs(drill - camKm) < 1.2 ? drill : camKm;
  const p = clamp(km / BOTTOM_KM, 0, 1);
  const H = 520;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, top: 560, width: 180, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px #000" }}>
        <div style={{ fontWeight: 800, fontSize: 20, letterSpacing: 2, color: "#c4b5fd" }}>PROFUNDIDADE</div>
        <div style={{ fontWeight: 900, fontSize: 46, lineHeight: 1.05 }}>{fmt(km * 1000)} m</div>
        <div style={{ position: "relative", marginTop: 14, marginLeft: 8, width: 10, height: H, borderRadius: 5, background: "rgba(245,240,255,0.18)" }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: 10, height: H * p, borderRadius: 5, background: "linear-gradient(180deg,#8b5cf6,#ff7a2a)" }} />
          {[0, 4, 8, 12].map((k) => (
            <div key={k} style={{ position: "absolute", left: 16, top: (H * k) / BOTTOM_KM - 11, fontSize: 18, fontWeight: 800, color: "#e3dcff" }}>— {k} km</div>
          ))}
          <div style={{ position: "absolute", left: -7, top: H * p - 12, width: 24, height: 24, borderRadius: 12, background: "#f5f0ff", boxShadow: "0 0 14px #8b5cf6" }} />
        </div>
      </div>
      <Seal v={1} text="ESCALA ESQUEMÁTICA" top={1250} />
    </AbsoluteFill>
  );
};

// ------------------------------------------------------------------ por cena
const S2: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("news.cards", g);
  if (v < 0.01) return null;
  const card = (top: number, left: number, rot: number, big: string, small: string, k: number) => (
    <div style={{ position: "absolute", top, left, width: 420, rotate: `${rot}deg`, opacity: clamp(v * 1.2 - k * 0.15, 0, 1), scale: String(0.8 + 0.2 * clamp(v, 0, 1)), padding: "18px 22px", background: "#efe6cf", color: "#1a1410", borderRadius: 6, boxShadow: "0 12px 30px rgba(0,0,0,0.55)", fontFamily: FONT }}>
      <div style={{ fontWeight: 900, fontSize: 36, lineHeight: 1.05 }}>{big}</div>
      <div style={{ fontWeight: 700, fontSize: 20, marginTop: 8, color: "#5a4a3a" }}>{small}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {card(560, 80, -6, "CIENTISTAS OUVEM GRITOS?", "a história que rodou o mundo · 1989", 0)}
      {card(800, 560, 5, "\"POÇO PARA O INFERNO\"", "relato sem fonte · nenhuma revista científica", 1)}
    </AbsoluteFill>
  );
};

const Waveform: React.FC<{ v: number; split: number }> = ({ v, split }) => {
  if (v < 0.01) return null;
  const bars = Array.from({ length: 36 }, (_, i) => 18 + Math.abs(Math.sin(i * 1.7) * 60 + Math.sin(i * 0.43) * 40));
  const groups = ["GRITO", "ECO", "RUÍDO"];
  return (
    <div style={{ position: "absolute", top: 900, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 18 * split, opacity: clamp(v, 0, 1) }}>
      {groups.map((name, gi) => (
        <div key={name} style={{ display: "flex", flexDirection: "column", alignItems: "center", translate: `0 ${split * (gi % 2 ? -26 : 26)}px`, rotate: `${split * (gi - 1) * 6}deg` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 5, height: 150, padding: "0 14px", borderRadius: 18, background: `rgba(11,8,18,${0.4 + 0.4 * split})`, border: `3px solid rgba(226,86,63,${split})` }}>
            {bars.slice(gi * 12, gi * 12 + 12).map((h, i) => <div key={i} style={{ width: 12, height: h, borderRadius: 6, background: RED }} />)}
          </div>
          <div style={{ marginTop: 10, opacity: split, fontFamily: FONT, fontWeight: 900, fontSize: 28, color: "#fff", textShadow: "0 2px 6px #000" }}>EFEITO: {name}</div>
        </div>
      ))}
    </div>
  );
};

const S3: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return (
    <AbsoluteFill>
      <Stamp v={track("stamp.boato", g)} text="BOATO" top={560} />
      <Waveform v={track("waveform.show", g)} split={track("waveform.split", g)} />
      <WorldLabel pose={cameraPoseAt(g)} point={SIBERIA_W} text="SIBÉRIA" appear={track("pin.siberia", g)} offset={[0, -120]} size={34} />
    </AbsoluteFill>
  );
};

const S4: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const atGlobe = Math.hypot(pose.target[0] - GLOBE[0], pose.target[2] - GLOBE[2]) < 6;
  return (
    <AbsoluteFill>
      {atGlobe ? <WorldLabel pose={pose} point={KOLA_W} text="KOLA" appear={track("pin.kola", g)} offset={[0, -130]} size={40} accent={YEL} /> : null}
      {!atGlobe ? <WorldLabel pose={pose} point={add(MOUTH, [0, 0.3, 0])} text="POÇO SG-3" appear={clamp(track("station.lights", g), 0, 1)} offset={[0, -60]} size={32} /> : null}
    </AbsoluteFill>
  );
};

const S5: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <WorldLabel pose={cameraPoseAt(g)} point={add(MOUTH, [0, 0.016, 0.005])} text="23 cm" appear={track("ruler.show", g)} offset={[0, -110]} size={40} accent={YEL} />;
};

/** rótulos da régua de escala */
const ScaleLabels: React.FC<{ g: number }> = ({ g }) => {
  const pose = cameraPoseAt(g);
  const K = 0.25;
  const S = (x: number, y: number): Vec3 => add(SCALE_POS, [x, y, 0.62]);
  const kola = track("scale.kola", g);
  return (
    <AbsoluteFill>
      <WorldLabel pose={pose} point={S(-2.6, 8.849 * K)} text="EVEREST" appear={track("scale.everest", g)} offset={[0, -50]} size={30} />
      <WorldLabel pose={pose} point={S(0.05, -10.935 * K)} text="FOSSA DAS MARIANAS" appear={track("scale.marianas", g)} offset={[0, 60]} size={28} accent="#7cc4ff" />
      <WorldLabel pose={pose} point={S(2.7, -12.262 * K * kola)} text={`KOLA · ${fmt(12262 * clamp(kola, 0, 1))} m`} appear={kola > 0.02 ? 1 : 0} offset={[0, 60]} size={30} accent={YEL} />
      <WorldLabel pose={pose} point={S(3.4, -0.75)} text="POÇO DE PETRÓLEO" appear={track("scale.oil", g)} offset={[0, -60]} size={26} accent={YEL} />
      <WorldLabel pose={pose} point={S(-3.3, 0.05)} text="NÍVEL DO MAR" appear={track("scale.everest", g)} offset={[40, 40]} size={22} />
    </AbsoluteFill>
  );
};
const S6: React.FC<SceneProps> = ({ scene }) => <ScaleLabels g={useG(scene)} />;
const S7: React.FC<SceneProps> = ({ scene }) => (
  <AbsoluteFill>
    <ScaleLabels g={useG(scene)} />
    <Burst id="record" point={add(SCALE_POS, [2.7, -12.262 * 0.25, 0.62])} sceneStart={scene.startFrame} colors={["#8b5cf6", "#f2c14e", "#f5f0ff"]} />
  </AbsoluteFill>
);

const Thermo: React.FC<{ v: number; exp: number; real: number }> = ({ v, exp, real }) => {
  if (v < 0.01) return null;
  const H = 360;
  const fill = (exp * 100 + real * 80) / 200; // 0..0,9 da escala de 0 a 200 °C
  return (
    <div style={{ position: "absolute", left: 640, top: 540, width: 360, height: 480, opacity: clamp(v, 0, 1), scale: String(0.85 + 0.15 * clamp(v, 0, 1)), fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 40, top: 0, width: 52, height: H, borderRadius: 26, background: "#f5f0ff", border: "5px solid #0b0812" }} />
      <div style={{ position: "absolute", left: 52, bottom: 480 - H - 6 + 60, width: 28, height: (H - 30) * fill, borderRadius: 14, background: real > 0.02 ? "linear-gradient(0deg,#ff3b14,#ff8a2a)" : "linear-gradient(0deg,#3b82f6,#7cc4ff)" }} />
      <div style={{ position: "absolute", left: 26, top: H - 30, width: 80, height: 80, borderRadius: 40, background: real > 0.02 ? "#ff3b14" : "#3b82f6", border: "5px solid #0b0812" }} />
      <div style={{ position: "absolute", left: 104, top: H - 30 - (H - 30) * 0.5 - 16, color: "#9fd0ff", fontWeight: 900, fontSize: 30, textShadow: "0 2px 6px #000", opacity: clamp(exp * 2, 0, 1) }}>— 100 °C esperado</div>
      <div style={{ position: "absolute", left: 104, top: H - 30 - (H - 30) * 0.9 - 16, color: "#ff8a6a", fontWeight: 900, fontSize: 34, textShadow: "0 2px 6px #000", opacity: clamp(real * 2, 0, 1) }}>— 180 °C real</div>
    </div>
  );
};
const S9: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Thermo v={track("thermo.show", g)} exp={track("thermo.expected", g)} real={track("thermo.real", g)} />;
};
const S10: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  return <Thermo v={track("thermo.show", g)} exp={1} real={1} />;
};

const S11: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const v = track("year.counter", g);
  const year = 1989 + Math.round(3 * clamp(track("year.count", g), 0, 1));
  return v < 0.01 ? null : (
    <div style={{ position: "absolute", top: 600, left: 0, right: 0, display: "flex", justifyContent: "center", opacity: clamp(v, 0, 1) }}>
      <div style={{ padding: "14px 40px", borderRadius: 24, background: "rgba(11,8,18,0.8)", border: `4px solid ${RED}`, fontFamily: FONT, fontWeight: 900, fontSize: 96, color: "#fff", letterSpacing: 4 }}>{year}</div>
    </div>
  );
};

const S12: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const mark = track("hole.mark", g);
  const cut = track("globe.cut", g);
  const p = projectPoint(pose, KOLA_W);
  const layer = (frac: number, lon: number, lat = 20): Vec3 => {
    const q = onGlobe(lon, lat, GLOBE_R * frac);
    return add(GLOBE, q);
  };
  return (
    <AbsoluteFill>
      {mark > 0.01 && p.visible ? (
        <div style={{ position: "absolute", left: p.x - 120, top: p.y - 120, width: 240, height: 240, borderRadius: 120, border: "6px solid #f2c14e", background: "rgba(11,8,18,0.25)", opacity: clamp(mark, 0, 1), boxShadow: "0 0 30px rgba(242,193,78,0.5)" }}>
          <div style={{ position: "absolute", left: 117, top: 70, width: 6, height: 18, background: "#f5f0ff", borderRadius: 3 }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 26, color: "#fff", textShadow: "0 2px 6px #000" }}>o furo: 12 km</div>
        </div>
      ) : null}
      <WorldLabel pose={pose} point={layer(0.98, 135, 30)} text="CROSTA" appear={clamp(cut * 2 - 1, 0, 1)} offset={[150, -40]} size={26} accent={YEL} />
      <WorldLabel pose={pose} point={layer(0.78, 135, -20)} text="MANTO" appear={clamp(cut * 2 - 1, 0, 1)} offset={[140, 30]} size={26} />
      <WorldLabel pose={pose} point={layer(0.38, 135, -40)} text="NÚCLEO" appear={clamp(cut * 2 - 1, 0, 1)} offset={[120, 70]} size={26} />
      <WorldLabel pose={pose} point={add(GLOBE, [0, 0, 0])} text="CENTRO · 6.371 km" appear={track("radius.draw", g) > 0.9 ? 1 : 0} offset={[0, 70]} size={26} />
      <Seal v={cut} text="ESQUEMA · CROSTA ENGROSSADA" top={1250} />
    </AbsoluteFill>
  );
};

const Icon: React.FC<{ v: number; title: string; sub: string; color: string; glyph: React.ReactNode }> = ({ v, title, sub, color, glyph }) => (
  <div style={{ width: 280, opacity: clamp(v, 0, 1), scale: String(0.7 + 0.3 * clamp(v, 0, 1.1)), padding: "18px 10px", borderRadius: 26, background: "rgba(11,8,18,0.82)", border: `4px solid ${color}`, textAlign: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ height: 70, display: "flex", alignItems: "center", justifyContent: "center" }}>{glyph}</div>
    <div style={{ fontWeight: 900, fontSize: 32, marginTop: 6 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 20, color: "#d8d0f0" }}>{sub}</div>
  </div>
);
const S13: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const h = track("summary.heat", g);
  const r = track("summary.rock", g);
  const m = track("summary.money", g);
  if (h + r + m < 0.01) return null;
  return (
    <div style={{ position: "absolute", top: 760, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 22 }}>
      <Icon v={h} title="180 °C" sub="calor" color="#ff6a3a" glyph={<div style={{ width: 22, height: 64, borderRadius: 11, background: "linear-gradient(0deg,#ff3b14,#ff8a2a)", border: "4px solid #f5f0ff" }} />} />
      <Icon v={r} title="ROCHA MOLE" sub="fecha o furo" color="#c4572a" glyph={<div style={{ width: 70, height: 46, borderRadius: "40% 60% 55% 45%", background: "#c4572a", boxShadow: "inset -8px -6px 0 #8a3a1a" }} />} />
      <Icon v={m} title="SEM VERBA" sub="fim da URSS" color={YEL} glyph={<div style={{ display: "flex", gap: 6 }}>{[0, 1, 2].map((i) => <div key={i} style={{ width: 30, height: 30, borderRadius: 15, background: "#d9a92c", border: "3px solid #7a5a10", opacity: 1 - i * 0.3 }} />)}</div>} />
    </div>
  );
};

export const KOLA_MODULES: Record<string, SceneModule> = {
  s2: { Overlay: S2 },
  s3: { Overlay: S3 },
  s4: { Overlay: S4 },
  s5: { Overlay: S5 },
  s6: { Overlay: S6 },
  s7: { Overlay: S7 },
  s9: { Overlay: S9 },
  s10: { Overlay: S10 },
  s11: { Overlay: S11 },
  s12: { Overlay: S12 },
  s13: { Overlay: S13 },
};
void BRAND;
void depthY;
