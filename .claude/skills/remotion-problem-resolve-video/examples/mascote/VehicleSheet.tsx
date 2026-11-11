import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Person, personLook } from "./components/Person";
import { Airplane, Boat, Bus, Car, CargoShip, PassengerCar, Rails, Rocket, SteamLocomotive, Truck } from "./components/Vehicles";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folha de design dos veículos (de perfil), cada um com uma pessoa de 1,7 m ao lado para escala.

const TW = 540;
const TH = 430;
const FOV = 12;
const P = 1.7 / 1.8; // Person em metros

type Tile = { name: string; size: string; target: Vec3; fit: number; el?: number; scene: (f: number) => React.ReactNode };

const Ground: React.FC<{ w: number; c?: string; water?: boolean }> = ({ w, c = "#4a4652", water }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[w, 0.1, w * 0.25]} />
    <meshStandardMaterial color={water ? "#2f7fc4" : c} roughness={water ? 0.3 : 0.9} transparent={water} opacity={water ? 0.85 : 1} />
  </mesh>
);

const TILES: Tile[] = [
  { name: "CARRO", size: "4,3 m", target: [-0.7, 0.95, 0], fit: 7.2, scene: (f) => (<><Ground w={30} /><Car frame={f} /><Person {...personLook("v1")} frame={f} position={[-3.3, 0, 0.6]} scale={P} rotY={0.2} /></>) },
  { name: "ÔNIBUS", size: "12 m", target: [-0.8, 2.0, 0], fit: 15.5, scene: (f) => (<><Ground w={60} /><Bus frame={f} /><Person {...personLook("v2")} frame={f} position={[-7.0, 0, 0.8]} scale={P} rotY={0.2} /></>) },
  { name: "CAMINHÃO", size: "10,5 m", target: [-0.7, 2.0, 0], fit: 14.5, scene: (f) => (<><Ground w={60} /><Truck frame={f} /><Person {...personLook("v3")} frame={f} position={[-6.6, 0, 0.8]} scale={P} rotY={0.2} /></>) },
  { name: "TREM A VAPOR", size: "locomotiva 11 m + vagão 12 m", target: [-1.0, 3.0, 0], fit: 27.5, scene: (f) => (<><Ground w={80} c="#6d6450" /><Rails length={34} position={[-1, 0, 0]} /><SteamLocomotive frame={f} position={[5.4, 0.22, 0]} /><PassengerCar frame={f} position={[-7.2, 0.22, 0]} /><Person {...personLook("v4")} frame={f} position={[-14.2, 0, 1.6]} scale={P} rotY={0.2} /></>) },
  { name: "NAVIO CARGUEIRO", size: "60 m (reais: até 400 m)", target: [1, 7, 0], fit: 66, el: 8, scene: (f) => (<><Ground w={240} water /><CargoShip frame={f} position={[-1, -3.2, 0]} /><mesh position={[32, 0.6, 6]}><boxGeometry args={[6, 1.2, 4]} /><meshStandardMaterial color="#6b4b3a" /></mesh><Person {...personLook("v5")} frame={f} position={[32, 1.2, 6]} scale={P} /></>) },
  { name: "BARCO DE PESCA", size: "7 m", target: [0.8, 1.6, 0], fit: 10.5, scene: (f) => (<><Ground w={50} water /><Boat frame={f} position={[-0.3, -0.35, 0]} /><mesh position={[4.6, 0.25, 1]}><boxGeometry args={[2.4, 0.5, 2.4]} /><meshStandardMaterial color="#6b4b3a" /></mesh><Person {...personLook("v6")} frame={f} position={[4.6, 0.5, 1]} scale={P} rotY={-0.3} /></>) },
  { name: "FOGUETE", size: "50 m (genérico)", target: [4, 25, 0], fit: 74, el: 4, scene: (f) => (<><Ground w={160} c="#5a5652" /><mesh position={[0, 0.6, 0]}><boxGeometry args={[12, 1.2, 12]} /><meshStandardMaterial color="#3a3a44" /></mesh><Rocket frame={f} position={[0, 1.2, 0]} /><Person {...personLook("v7")} frame={f} position={[9, 0, 4]} scale={P} /></>) },
  { name: "AVIÃO", size: "38 m (genérico)", target: [-1.5, 6, 0], fit: 44, scene: (f) => (<><Ground w={160} c="#4a4652" /><Airplane /><Person {...personLook("v8")} frame={f} position={[19.5, 0, 4]} scale={P} rotY={-0.3} /></>) },
];

const TileView: React.FC<{ t: Tile }> = ({ t }) => {
  const f = useCurrentFrame();
  const aspect = TW / TH;
  const d = t.fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * aspect);
  const pose = orbit(t.target, d, 0, t.el ?? 6);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: TW, height: TH, overflow: "hidden" }}>
      <ThreeCanvas width={TW} height={TH} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: FOV, near: 1, far: 3000, position: [0, 2, 50] }}>
        <Cam />
        <Lighting shadowExtent={Math.max(10, t.fit * 0.7)} />
        {t.scene(f)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 18, top: 12, fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 1, textShadow: "0 3px 10px rgba(0,0,0,0.6)" }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 20, color: "#c4b5fd" }}>{t.size}</div>
      </div>
    </div>
  );
};

export const VehicleSheet: React.FC = () => {
  const { umbra } = BRAND.colors;
  return (
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${umbra} 0%, #2a1d48 60%, ${umbra} 100%)` }}>
      <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 56, letterSpacing: 2 }}>VEÍCULOS · DESIGN</div>
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
