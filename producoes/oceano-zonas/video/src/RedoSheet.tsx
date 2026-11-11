import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Person, personLook } from "./components/Person";
import { Anglerfish, Snailfish, Squid } from "./components/Sea";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Refação: lula, tamboril e peixe-caracol em quadros grandes (perfil + 3/4).
const TW = 540;
const TH = 573;
const FOV = 12;
const P = 1.7 / 1.8;
type Tile = { name: string; size: string; target: Vec3; fit: number; az: number; el: number; bg: string; scene: (f: number) => React.ReactNode };
const Bar: React.FC<{ len: number; p: Vec3 }> = ({ len, p }) => (
  <mesh position={p}>
    <boxGeometry args={[len, len * 0.04, len * 0.02]} />
    <meshBasicMaterial color="#ffffff" />
  </mesh>
);
const TWI = "linear-gradient(180deg,#1b3a6b 0%,#0e1f40 100%)";
const DEEP = "linear-gradient(180deg,#0a1226 0%,#04060d 100%)";
const T: Tile[] = [
  { name: "LULA · perfil", size: "≈ 1 m (barra = 50 cm)", target: [0.06, 0, 0], fit: 1.15, az: 0, el: 6, bg: TWI, scene: (f) => (<><Squid frame={f} /><Bar len={0.5} p={[0.05, -0.14, 0]} /></>) },
  { name: "LULA · ao lado de uma pessoa", size: "≈ 1 m", target: [-0.45, 0.9, 0], fit: 2.8, az: 18, el: 8, bg: TWI, scene: (f) => (<><Squid frame={f} position={[0.4, 1.1, 0]} /><Person {...personLook("r1")} frame={f} position={[-1.0, 0, 0.4]} scale={P} rotY={0.3} /><mesh position={[0, -0.05, 0]}><boxGeometry args={[10, 0.1, 3]} /><meshStandardMaterial color="#3a4560" /></mesh></>) },
  { name: "TAMBORIL · perfil", size: "≈ 15 cm (barra = 10 cm)", target: [0.015, 0.03, 0], fit: 0.3, az: 0, el: 4, bg: DEEP, scene: (f) => (<><Anglerfish frame={f} bite={0.3} /><Bar len={0.1} p={[0, -0.08, 0]} /></>) },
  { name: "TAMBORIL · 3/4", size: "boca aberta (bite)", target: [0.015, 0.03, 0], fit: 0.3, az: 35, el: 10, bg: DEEP, scene: (f) => <Anglerfish frame={f} bite={1} /> },
  { name: "PEIXE-CARACOL · perfil", size: "≈ 25 cm (barra = 10 cm)", target: [-0.05, -0.005, 0], fit: 0.4, az: 0, el: 6, bg: DEEP, scene: (f) => (<><Snailfish frame={f} /><Bar len={0.1} p={[-0.05, -0.08, 0]} /></>) },
  { name: "PEIXE-CARACOL · 3/4", size: "translúcido", target: [-0.05, -0.005, 0], fit: 0.4, az: 35, el: 14, bg: DEEP, scene: (f) => <Snailfish frame={f + 20} /> },
];
const TileView: React.FC<{ t: Tile }> = ({ t }) => {
  const f = useCurrentFrame();
  const d = t.fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * (TW / TH));
  const pose = orbit(t.target, d, t.az, t.el);
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
      <div style={{ position: "absolute", left: 16, top: 12, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.7)" }}>
        <div style={{ fontWeight: 900, fontSize: 28 }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 19, color: "#e3dcff" }}>{t.size}</div>
      </div>
    </div>
  );
};
export const RedoSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <div style={{ height: 201, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
      <div style={{ fontWeight: 900, fontSize: 48, letterSpacing: 2 }}>REFEITOS · LULA E PEIXES ABISSAIS</div>
      <div style={{ fontWeight: 700, fontSize: 24, color: "#c4b5fd" }}>perfil + 3/4 · para aprovar</div>
    </div>
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px` }}>
      {T.map((t) => (
        <TileView key={t.name} t={t} />
      ))}
    </div>
  </AbsoluteFill>
);
