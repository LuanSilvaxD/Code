import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Person, personLook } from "./components/Person";
import { Anglerfish, Bathysphere, DeepShrimp, Dolphin, Everest, Jellyfish, Lanternfish, SeaCucumber, SeaTurtle, Snailfish, SpermWhale, Squid } from "./components/Sea";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folha de design dos 12 elementos novos do vídeo do oceano (de perfil). Escala: pessoa de 1,7 m nos grandes;
// barra branca nos pequenos (o tamanho da barra está escrito no quadro).

const TW = 360;
const TH = 430;
const FOV = 12;
const P = 1.7 / 1.8;

type Tile = { name: string; size: string; bar?: string; target: Vec3; fit: number; bg: string; scene: (f: number) => React.ReactNode };

const Bar: React.FC<{ len: number; p: Vec3 }> = ({ len, p }) => (
  <group position={p}>
    <mesh>
      <boxGeometry args={[len, len * 0.04, len * 0.02]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[(s * len) / 2, 0, 0]}>
        <boxGeometry args={[len * 0.03, len * 0.16, len * 0.02]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    ))}
  </group>
);
const Floor: React.FC<{ w: number; c: string }> = ({ w, c }) => (
  <mesh position={[0, -0.05, 0]}>
    <boxGeometry args={[w, 0.1, w * 0.3]} />
    <meshStandardMaterial color={c} roughness={0.9} />
  </mesh>
);

const SUN = "linear-gradient(180deg,#3d8fd1 0%,#1d5a9c 100%)";
const TWI = "linear-gradient(180deg,#1b3a6b 0%,#0e1f40 100%)";
const DEEP = "linear-gradient(180deg,#0a1226 0%,#04060d 100%)";

const TILES: Tile[] = [
  { name: "BATISFERA", size: "≈ 2,2 m · mascote dentro", target: [-0.4, 1.1, 0], fit: 4.6, bg: SUN, scene: (f) => (<><Floor w={14} c="#c9b98a" /><Bathysphere frame={f} position={[0.4, 0, 0]} lamp={0.6} /><Person {...personLook("s1")} frame={f} position={[-1.7, 0, 0.6]} scale={P} rotY={0.3} /></>) },
  { name: "TARTARUGA", size: "≈ 1,1 m", target: [-0.3, 0.9, 0], fit: 2.8, bg: SUN, scene: (f) => (<><Floor w={10} c="#c9b98a" /><SeaTurtle frame={f} position={[0.45, 1.0, 0]} /><Person {...personLook("s2")} frame={f} position={[-0.9, 0, 0.4]} scale={P} rotY={0.3} /></>) },
  { name: "GOLFINHO", size: "≈ 2,6 m", target: [-0.4, 0.9, 0], fit: 4.4, bg: SUN, scene: (f) => (<><Floor w={14} c="#c9b98a" /><Dolphin frame={f} position={[0.55, 1.15, 0]} /><Person {...personLook("s3")} frame={f} position={[-1.9, 0, 0.5]} scale={P} rotY={0.3} /></>) },
  { name: "PEIXE-LANTERNA", size: "≈ 8 cm", bar: "barra = 5 cm", target: [0, -0.005, 0], fit: 0.13, bg: TWI, scene: (f) => (<><Lanternfish frame={f} /><Bar len={0.05} p={[0, -0.035, 0]} /></>) },
  { name: "TAMBORIL", size: "≈ 15 cm", bar: "barra = 10 cm", target: [0.01, 0.025, 0], fit: 0.3, bg: DEEP, scene: (f) => (<><Anglerfish frame={f} /><Bar len={0.1} p={[0, -0.075, 0]} /></>) },
  { name: "CAMARÃO VERMELHO", size: "≈ 10 cm (no farol)", bar: "barra = 5 cm", target: [0.04, 0, 0], fit: 0.24, bg: DEEP, scene: (f) => (<><DeepShrimp frame={f} /><Bar len={0.05} p={[0.01, -0.04, 0]} /></>) },
  { name: "ÁGUA-VIVA", size: "≈ 15 cm de sino", bar: "barra = 10 cm", target: [0, -0.04, 0], fit: 0.28, bg: DEEP, scene: (f) => (<><Jellyfish frame={f} /><Bar len={0.1} p={[0, -0.17, 0]} /></>) },
  { name: "CACHALOTE", size: "≈ 16 m", target: [1.2, 0.2, 0], fit: 21, bg: TWI, scene: (f) => (<><SpermWhale frame={f} /><Person {...personLook("s8")} frame={f} position={[9.8, -2.2, 0.5]} scale={P} rotY={-0.4} /><mesh position={[9.8, -2.25, 0.5]}><boxGeometry args={[1.6, 0.1, 1.6]} /><meshStandardMaterial color="#6b4b3a" /></mesh></>) },
  { name: "LULA", size: "≈ 1 m", target: [-0.4, 0.9, 0], fit: 2.8, bg: TWI, scene: (f) => (<><Floor w={10} c="#3a4560" /><Squid frame={f} position={[0.35, 1.0, 0]} /><Person {...personLook("s9")} frame={f} position={[-0.95, 0, 0.4]} scale={P} rotY={0.3} /></>) },
  { name: "PEPINO-DO-MAR", size: "≈ 30 cm", bar: "barra = 10 cm", target: [0, 0.04, 0], fit: 0.46, bg: DEEP, scene: (f) => (<><Floor w={2} c="#4a4652" /><SeaCucumber frame={f} /><Bar len={0.1} p={[0, 0.005, 0.12]} /></>) },
  { name: "PEIXE-CARACOL", size: "≈ 25 cm", bar: "barra = 10 cm", target: [-0.02, -0.01, 0], fit: 0.42, bg: DEEP, scene: (f) => (<><Snailfish frame={f} /><Bar len={0.1} p={[-0.02, -0.09, 0]} /></>) },
  { name: "MONTE EVEREST", size: "8.849 m", bar: "barra = 1 km", target: [0, 4.6, 0], fit: 21, bg: "linear-gradient(180deg,#8fc3ea 0%,#dfeaf2 100%)", scene: () => (<><Everest /><Bar len={1} p={[7.6, 0.4, 3]} /></>) },
];

const TileView: React.FC<{ t: Tile }> = ({ t }) => {
  const f = useCurrentFrame();
  const d = t.fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * (TW / TH));
  const pose = orbit(t.target, d, 0, 5);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: TW, height: TH, overflow: "hidden", background: t.bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={TW} height={TH} gl={{ antialias: true }} flat camera={{ fov: FOV, near: d * 0.02, far: d * 4, position: [0, 0, d] }}>
        <Cam />
        <Lighting />
        {t.scene(f)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
        <div style={{ fontWeight: 900, fontSize: 25, letterSpacing: 0.5 }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 17, color: "#e3dcff" }}>{t.size}</div>
      </div>
      {t.bar ? <div style={{ position: "absolute", left: 0, right: 0, bottom: 10, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 16, color: "#fff", textShadow: "0 2px 6px rgba(0,0,0,0.8)" }}>{t.bar}</div> : null}
    </div>
  );
};

export const SeaSheet: React.FC = () => {
  const { umbra } = BRAND.colors;
  return (
    <AbsoluteFill style={{ background: umbra }}>
      <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 50, letterSpacing: 2 }}>OCEANO · DESIGNS NOVOS</div>
        <div style={{ fontWeight: 700, fontSize: 24, color: "#c4b5fd" }}>para aprovar · pessoa de 1,7 m ou barra para escala</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>
        {TILES.map((t) => (
          <TileView key={t.name} t={t} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
