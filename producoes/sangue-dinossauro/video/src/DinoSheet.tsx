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
      <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 2 }}>ARATASSAURO · RECONSTRUÇÃO</div>
      <div style={{ fontWeight: 700, fontSize: 22, color: "#c4b5fd" }}>para aprovar · ~3,1 m (jovem) · pessoa de 1,7 m · escolha A ou B</div>
    </div>
    <TileView t={{ name: "A · ESCAMAS (PERFIL)", size: "focinho → cauda 3,1 m · quadril ~1 m", target: [0, 0.75, 0], fit: 4.2, az: 0, el: 4, scene: (f) => (<><Ground /><Aratasaurus frame={f} /><Ref f={f} x={1.9} /></>) }} w={1080} h={560} />
    <TileView t={{ name: "B · ESCAMAS + PENUGEM LEVE (PERFIL)", size: "protopenas no dorso, pescoço, braços e cauda", target: [0, 0.75, 0], fit: 4.2, az: 0, el: 4, scene: (f) => (<><Ground /><Aratasaurus frame={f} feathers={1} /><Ref f={f} x={1.9} /></>) }} w={1080} h={560} />
    <div style={{ display: "grid", gridTemplateColumns: "360px 360px 360px" }}>
      <TileView t={{ name: "A · 3/4", size: "andando", target: [0, 0.7, 0], fit: 3.4, az: 35, el: 12, scene: (f) => (<><Ground /><Aratasaurus frame={f} walk={1} /></>) }} w={360} h={520} />
      <TileView t={{ name: "B · 3/4", size: "andando", target: [0, 0.7, 0], fit: 3.4, az: 35, el: 12, scene: (f) => (<><Ground /><Aratasaurus frame={f} walk={1} feathers={1} /></>) }} w={360} h={520} />
      <TileView t={{ name: "CABEÇA", size: "olho, dentes, narina, máscara", target: [1.12, 1.38, 0], fit: 0.75, az: 30, el: 8, scene: (f) => <Aratasaurus frame={f} /> }} w={360} h={520} />
    </div>
  </AbsoluteFill>
);
