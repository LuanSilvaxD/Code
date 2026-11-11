import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { Bird, Cat, Cow, Dog, Elephant, Fish, Horse, Whale } from "./components/Animals";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Person, personLook } from "./components/Person";
import { Boat } from "./components/Vehicles";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folha de design dos animais (de perfil), cada um com uma pessoa de 1,7 m ao lado para escala.

const TW = 540;
const TH = 430;
const FOV = 12;
const P = 1.7 / 1.8;

type Tile = { name: string; size: string; target: Vec3; fit: number; el?: number; scene: (f: number) => React.ReactNode };

const Ground: React.FC<{ w: number; c?: string; water?: boolean }> = ({ w, c = "#6f9a5e", water }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[w, 0.1, w * 0.25]} />
    <meshStandardMaterial color={water ? "#2f7fc4" : c} roughness={water ? 0.3 : 0.9} transparent={water} opacity={water ? 0.85 : 1} />
  </mesh>
);

const TILES: Tile[] = [
  { name: "CACHORRO", size: "≈ 0,9 m", target: [-0.25, 0.85, 0], fit: 2.6, scene: (f) => (<><Ground w={12} /><Dog frame={f} position={[0.3, 0, 0]} /><Person {...personLook("a1")} frame={f} position={[-0.9, 0, 0.3]} scale={P} rotY={0.3} /></>) },
  { name: "GATO", size: "≈ 0,5 m", target: [-0.2, 0.85, 0], fit: 2.4, scene: (f) => (<><Ground w={12} /><Cat frame={f} position={[0.35, 0, 0]} /><Person {...personLook("a2")} frame={f} position={[-0.75, 0, 0.3]} scale={P} rotY={0.3} /></>) },
  { name: "CAVALO", size: "≈ 2,4 m · 1,6 m de altura", target: [-0.3, 1.15, 0], fit: 4.6, scene: (f) => (<><Ground w={20} /><Horse frame={f} position={[0.2, 0, 0]} /><Person {...personLook("a3")} frame={f} position={[-1.9, 0, 0.4]} scale={P} rotY={0.3} /></>) },
  { name: "VACA", size: "≈ 2,4 m", target: [-0.3, 1.1, 0], fit: 4.8, scene: (f) => (<><Ground w={20} /><Cow frame={f} position={[0.2, 0, 0]} /><Person {...personLook("a4")} frame={f} position={[-1.95, 0, 0.4]} scale={P} rotY={0.3} /></>) },
  { name: "ELEFANTE", size: "≈ 4,5 m · 3 m de altura", target: [-0.3, 1.9, 0], fit: 7.2, scene: (f) => (<><Ground w={30} c="#b9a06a" /><Elephant frame={f} position={[0.2, 0, 0]} /><Person {...personLook("a5")} frame={f} position={[-2.7, 0, 0.8]} scale={P} rotY={0.3} /></>) },
  { name: "PASSARINHO", size: "≈ 15 cm", target: [0, 0.95, 0], fit: 2.4, scene: (f) => (<><Ground w={12} /><mesh position={[0.45, 0.65, 0]} castShadow><boxGeometry args={[0.1, 1.3, 0.1]} /><meshStandardMaterial color="#7a5634" /></mesh><Bird frame={f} position={[0.45, 1.3, 0]} /><Person {...personLook("a6")} frame={f} position={[-0.5, 0, 0.3]} scale={P} rotY={0.3} /></>) },
  { name: "PEIXE", size: "≈ 50 cm", target: [-0.25, 0.95, 0], fit: 2.8, scene: (f) => (<><Ground w={12} c="#4a4652" /><mesh position={[0.45, 0.35, 0]}><boxGeometry args={[1.3, 0.7, 0.55]} /><meshStandardMaterial color="#5a3d2b" /></mesh><mesh position={[0.45, 1.05, 0]}><boxGeometry args={[1.3, 0.7, 0.55]} /><meshStandardMaterial color="#6fb6e8" transparent opacity={0.35} roughness={0.1} /></mesh><Fish frame={f} position={[0.45, 1.05, 0.05]} /><Person {...personLook("a7")} frame={f} position={[-0.75, 0, 0.3]} scale={P} rotY={0.3} /></>) },
  { name: "BALEIA", size: "≈ 14 m (barco de 7 m)", target: [0.5, 0.6, 0], fit: 27, el: 9, scene: (f) => (<><Ground w={120} water /><Whale frame={f} position={[-2.5, 0.5, 0]} /><Boat frame={f} position={[9.5, -0.35, 1.5]} rotY={Math.PI} /><Person {...personLook("a8")} frame={f} position={[10.3, 0.95, 1.5]} scale={P} rotY={-0.6} /></>) },
];

const TileView: React.FC<{ t: Tile }> = ({ t }) => {
  const f = useCurrentFrame();
  const d = t.fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * (TW / TH));
  const pose = orbit(t.target, d, 0, t.el ?? 6);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: TW, height: TH, overflow: "hidden" }}>
      <ThreeCanvas width={TW} height={TH} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: FOV, near: 0.1, far: 3000, position: [0, 2, 50] }}>
        <Cam />
        <Lighting shadowExtent={Math.max(4, t.fit * 0.7)} />
        {t.scene(f)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 18, top: 12, fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 1, textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>{t.size}</div>
      </div>
    </div>
  );
};

export const AnimalSheet: React.FC = () => {
  const { umbra } = BRAND.colors;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${umbra} 0%, #2a1d48 60%, ${umbra} 100%)` }}>
      <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 56, letterSpacing: 2 }}>ANIMAIS · DESIGN</div>
        <div style={{ fontWeight: 700, fontSize: 26, color: "#c4b5fd" }}>vista de lado · pessoa de 1,7 m para escala</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px` }}>
        {TILES.map((t) => (
          <TileView key={t.name} t={t} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
