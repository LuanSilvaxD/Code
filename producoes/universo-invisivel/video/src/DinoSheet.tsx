import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { Aratasaurus } from "./components/Dino";
import { Lighting } from "./components/Lighting";
import { Person, personLook } from "./components/Person";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folha de design do ARATASSAURO (metros; pessoa de 1,7 m para escala).
const PS = 1.7 / 1.8;
const STUDIO = "radial-gradient(circle at 50% 40%,#2c4a50 0%,#0e1a1c 78%)";
const FOV = 14;
type Tile = { name: string; size: string; target: Vec3; fit: number; az?: number; el?: number; scene: (f: number) => React.ReactNode };

export const TileView: React.FC<{ t: Tile; w: number; h: number; bg?: string }> = ({ t, w, h, bg = STUDIO }) => {
  const f = useCurrentFrame();
  const d = t.fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * Math.min(1, w / h));
  const pose = orbit(t.target, d, t.az ?? 0, t.el ?? 5);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov: FOV, near: d * 0.02, far: d * 8, position: [0, 0, d] }}>
        <Cam />
        <Lighting shadowExtent={Math.max(1.5, t.fit * 0.8)} />
        {t.scene(f)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f0ebff" }}>{t.size}</div>
      </div>
    </div>
  );
};
const Ground: React.FC<{ w?: number }> = ({ w = 6 }) => (
  <mesh position={[0, -0.03, 0]} receiveShadow>
    <boxGeometry args={[w, 0.06, 2.4]} />
    <meshStandardMaterial color="#8a7a5a" roughness={1} />
  </mesh>
);
const Ref: React.FC<{ f: number; x: number }> = ({ f, x }) => <Person {...personLook(7)} frame={f} position={[x, 0, -0.5]} scale={PS} rotY={-0.5} seed={7} />;


export const DinoSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
      <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 2 }}>ARATASSAURO v2 · RECONSTRUÇÃO</div>
      <div style={{ fontWeight: 700, fontSize: 22, color: "#c4b5fd" }}>para aprovar · ~3,1 m (jovem) · versão B (penugem) · pessoa de 1,7 m</div>
    </div>
    <TileView t={{ name: "PERFIL", size: "focinho → cauda 3,1 m · quadril ~1 m", target: [0, 0.78, 0], fit: 4.2, az: 0, el: 4, scene: (f) => (<><Ground /><Aratasaurus frame={f} feathers={1} /><Ref f={f} x={1.9} /></>) }} w={1080} h={560} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "3/4 ANDANDO", size: "passada, cauda e pescoço em movimento", target: [0, 0.75, 0], fit: 3.4, az: 38, el: 12, scene: (f) => (<><Ground /><Aratasaurus frame={f} walk={1} feathers={1} /></>) }} w={540} h={600} />
      <TileView t={{ name: "FRENTE, CÂMERA BAIXA", size: "peito fundo, coxas fortes", target: [0.3, 0.8, 0], fit: 2.6, az: 70, el: -4, scene: (f) => (<><Ground /><Aratasaurus frame={f} feathers={1} look={-0.6} /></>) }} w={540} h={600} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "360px 360px 360px" }}>
      <TileView t={{ name: "CABEÇA", size: "sobrancelha, olho, dentes, mandíbula", target: [1.13, 1.4, 0], fit: 0.62, az: 28, el: 8, scene: (f) => <Aratasaurus frame={f} feathers={1} /> }} w={360} h={400} />
      <TileView t={{ name: "PÉ", size: "3 dedos + dedinho de trás · garras", target: [0.08, 0.1, 0.14], fit: 0.45, az: 30, el: 18, scene: (f) => (<><Ground /><Aratasaurus frame={f} feathers={1} /></>) }} w={360} h={400} />
      <TileView t={{ name: "MÃO", size: "3 dedos com garras · franja", target: [0.68, 0.76, 0.15], fit: 0.42, az: 25, el: 6, scene: (f) => <Aratasaurus frame={f} feathers={1} /> }} w={360} h={400} />
    </div>
  </AbsoluteFill>
);
