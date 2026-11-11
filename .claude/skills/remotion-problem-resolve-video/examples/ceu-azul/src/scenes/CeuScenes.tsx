import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Burst } from "../components/Burst";
import { cameraPoseAt } from "../components/CameraController";
import { WorldLabel } from "../components/WorldLabel";
import { track } from "../data/scenes";
import { CLUSTER_N, clusterMolecule, EYE, lerp3, NOON_SUN, sunPos } from "../data/sky";
import { FONT } from "../theme";
import { clamp, lerp, type Vec3 } from "../utils/animation";
import type { SceneModule, SceneProps } from "./types";

// Camadas 2D das cenas do "céu azul": rótulos ancorados no 3D, cartões didáticos e o selo de esquema.

const useG = (scene: SceneProps["scene"]) => useCurrentFrame() + scene.startFrame;

/** Selo discreto: cúpula, moléculas e caminhos são esquemáticos (fora de escala). */
const Seal: React.FC = () => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1528, display: "flex", justifyContent: "center" }}>
    <div style={{ padding: "6px 16px", borderRadius: 999, background: "rgba(11,8,18,0.62)", border: "2px solid rgba(196,181,253,0.45)", color: "#d9ccff", fontFamily: FONT, fontWeight: 800, fontSize: 24, letterSpacing: 1.5 }}>
      ESQUEMA · FORA DE ESCALA
    </div>
  </div>
);

const Card: React.FC<{ appear: number; top: number; children: React.ReactNode }> = ({ appear, top, children }) => {
  if (appear < 0.01) return null;
  const a = clamp(appear, 0, 1);
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, opacity: a, translate: `0px ${(1 - a) * 40}px`, scale: String(0.94 + 0.06 * a), padding: "22px 28px", borderRadius: 30, background: "rgba(15,11,28,0.86)", border: "3px solid rgba(139,92,246,0.75)", boxShadow: "0 18px 40px rgba(0,0,0,0.45)", fontFamily: FONT, color: "#fff" }}>
      {children}
    </div>
  );
};

const wavePath = (w: number, h: number, cycles: number, phase: number, amp: number) => {
  let d = "";
  for (let i = 0; i <= 120; i++) {
    const x = (i / 120) * w;
    const y = h / 2 + Math.sin((i / 120) * cycles * Math.PI * 2 + phase) * amp;
    d += `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`;
  }
  return d;
};

// ---- cena 4: rótulos N₂ / O₂
const MoleculesOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const lab = track("molecules.labels", g);
  const iN = 2;
  const iO = CLUSTER_N - 1;
  return (
    <AbsoluteFill>
      <WorldLabel pose={pose} point={clusterMolecule(iN, g)} text={"NITROGÊNIO\nN₂"} appear={lab} offset={[-150, -150]} accent="#a9bddf" />
      <WorldLabel pose={pose} point={clusterMolecule(iO, g)} text={"OXIGÊNIO\nO₂"} appear={clamp(lab * 1.3 - 0.3, 0, 1)} offset={[150, 160]} accent="#ff8f7a" />
      <Seal />
    </AbsoluteFill>
  );
};

// ---- cena 5: onda curta × onda longa
const WaveOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const show = track("waveCard.show", g);
  const cmp = track("waveCard.compare", g);
  const ph = g * 0.18;
  const W = 520;
  const H = 96;
  const row = (label: string, color: string, cycles: number, note: string, emph: number) => (
    <div style={{ display: "flex", alignItems: "center", gap: 18, marginTop: 8 }}>
      <div style={{ width: 210, fontWeight: 900, fontSize: 34, color }}>{label}</div>
      <svg width={W} height={H} style={{ overflow: "visible" }}>
        <path d={wavePath(W, H, cycles, ph, 36)} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", right: 34, fontWeight: 800, fontSize: 26, color: "#e9e4ff", opacity: emph }}>{note}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <Card appear={show} top={1000}>
        <div style={{ fontWeight: 800, fontSize: 28, color: "#c4b5fd", letterSpacing: 1 }}>TAMANHO DA ONDA DE CADA COR</div>
        {row("AZUL", "#4ea2ff", 6, "", 0)}
        {row("VERMELHO", "#ff5a5a", 2.4, "", 0)}
        <div style={{ marginTop: 12, display: "flex", justifyContent: "space-between", fontWeight: 900, fontSize: 30, opacity: clamp(cmp * 1.5, 0, 1) }}>
          <span style={{ color: "#4ea2ff" }}>CURTA → DESVIA MUITO</span>
          <span style={{ color: "#ff8080" }}>LONGA → POUCO</span>
        </div>
      </Card>
      <Seal />
    </AbsoluteFill>
  );
};

// ---- cena 7: quanto violeta o Sol manda × quanto o olho vê
const Bar: React.FC<{ v: number; color: string; label: string }> = ({ v, color, label }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 10 }}>
    <div style={{ width: 150, fontWeight: 800, fontSize: 28, color }}>{label}</div>
    <div style={{ flex: 1, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
      <div style={{ width: `${clamp(v, 0, 1) * 100}%`, height: "100%", borderRadius: 15, background: color }} />
    </div>
  </div>
);

const VioletOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const show = track("violetCard.show", g);
  const eye = track("violetCard.eye", g);
  return (
    <AbsoluteFill>
      <Card appear={show} top={960}>
        <div style={{ fontWeight: 900, fontSize: 30, color: "#ffd36b" }}>LUZ QUE O SOL MANDA</div>
        <Bar v={0.55 * clamp(show, 0, 1)} color="#9b6cff" label="VIOLETA" />
        <Bar v={0.85 * clamp(show, 0, 1)} color="#4ea2ff" label="AZUL" />
        <div style={{ opacity: clamp(eye * 1.4, 0, 1), marginTop: 18 }}>
          <div style={{ fontWeight: 900, fontSize: 30, color: "#c4b5fd" }}>O QUANTO O OLHO VÊ</div>
          <Bar v={0.22 * eye} color="#9b6cff" label="VIOLETA" />
          <Bar v={0.7 * eye} color="#4ea2ff" label="AZUL" />
        </div>
      </Card>
      <Seal />
    </AbsoluteFill>
  );
};

// ---- cena 9/10: caminhos da luz
const pathMid = (a: Vec3, t: number) => lerp3(a, EYE, t);

const PathsOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const noon = track("path.noon", g);
  const sunset = track("path.sunset", g);
  const sun = sunPos(track("sun.angle", g, 0.12));
  return (
    <AbsoluteFill>
      <WorldLabel pose={pose} point={pathMid(NOON_SUN, 0.82)} text={"MEIO-DIA\ncaminho curto no ar"} appear={clamp(noon * 1.5 - 0.5, 0, 1)} offset={[90, -120]} accent="#9fd0ff" size={30} />
      <WorldLabel pose={pose} point={pathMid(sun, 0.45)} text={"FIM DE TARDE\ncaminho longo no ar"} appear={clamp(sunset * 1.5 - 0.5, 0, 1)} offset={[160, 170]} accent="#ff9a3c" size={30} />
      <Seal />
    </AbsoluteFill>
  );
};

const SealOnly: React.FC<SceneProps> = () => (
  <AbsoluteFill>
    <Seal />
  </AbsoluteFill>
);

// ---- cena 11: céu dividido + confete
const FinalOverlay: React.FC<SceneProps> = ({ scene }) => {
  const g = useG(scene);
  const pose = cameraPoseAt(g);
  const r = track("finalLabels.reveal", g);
  const sun = sunPos(track("sun.angle", g, 0.12));
  const m: Vec3 = [track("mascot.x", g), track("mascot.y", g) + 0.3, track("mascot.z", g)];
  return (
    <AbsoluteFill>
      <WorldLabel pose={pose} point={[lerp(NOON_SUN[0], EYE[0], 0.15), lerp(NOON_SUN[1], EYE[1], 0.15), NOON_SUN[2]]} text={"SOL ALTO\ncaminho curto = AZUL"} appear={clamp(r * 2, 0, 1)} offset={[-230, 190]} accent="#5fb0ff" size={30} />
      <WorldLabel pose={pose} point={[sun[0] + 0.4, sun[1] + 0.3, sun[2]]} text={"SOL BAIXO\ncaminho longo = LARANJA"} appear={clamp(r * 2 - 1, 0, 1)} offset={[220, -150]} accent="#ff9a3c" size={30} />
      <Burst id="final" point={m} sceneStart={scene.startFrame} />
    </AbsoluteFill>
  );
};

export const CEU_MODULES: Record<string, SceneModule> = {
  "scene-04-moleculas": { Overlay: MoleculesOverlay },
  "scene-05-onda-curta": { Overlay: WaveOverlay },
  "scene-06-rayleigh": { Overlay: SealOnly },
  "scene-07-violeta": { Overlay: VioletOverlay },
  "scene-09-fim-tarde": { Overlay: PathsOverlay },
  "scene-10-sobra-laranja": { Overlay: PathsOverlay },
  "scene-11-final": { Overlay: FinalOverlay },
};
