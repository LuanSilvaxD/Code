import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Branch, InfraWaves, Pine, Supercell, Tree, Warbler } from "./components/Birds";
import { Mascot } from "./components/Mascot";
import { FONT } from "./theme";

const SKY = "linear-gradient(180deg,#5aa8e0 0%,#bfe2f5 70%,#e8f4f8 100%)";
const STORM = "linear-gradient(180deg,#2a2e40 0%,#4a5068 60%,#6a7088 100%)";
const Header: React.FC = () => (
  <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 2 }}>PÁSSAROS × TEMPESTADE · v2</div>
    <div style={{ fontWeight: 700, fontSize: 21, color: "#c4b5fd" }}>para aprovar · padrão novo (volume, olhos com brilho, penas, patas)</div>
  </div>
);
const Ground: React.FC<{ w?: number }> = ({ w = 6 }) => (
  <mesh position={[0, -0.02, 0]} receiveShadow>
    <boxGeometry args={[w, 0.04, w * 0.7]} />
    <meshStandardMaterial color="#5a8a3a" roughness={1} />
  </mesh>
);

export const BirdSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <TileView t={{ name: "MARIQUITA NO GALHO · 3/4", size: "~12 cm, ~10 g · coroa e asa amarelas · máscara e garganta pretas", target: [0.05, 0.4, 0], fit: 1.6, az: 35, el: 12, scene: (f) => (<><group position={[0, 0.01, 0]}><Branch f={f} len={2.4} /></group><group position={[0, 0.25, 0]}><Warbler f={f} sing={1} /></group></>) }} w={1080} h={600} bg={SKY} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "DE LADO", size: "perfil", target: [0.05, 0.4, 0], fit: 1.5, az: 0, el: 4, scene: (f) => <Warbler f={f} /> }} w={540} h={400} bg={SKY} />
      <TileView t={{ name: "EM VOO", size: "asas abertas batendo", target: [0, 0.5, 0], fit: 1.9, az: 25, el: 30, scene: (f) => <Warbler f={f} fly={1} /> }} w={540} h={400} bg={SKY} />
      <TileView t={{ name: "RASTREADOR NAS COSTAS", size: "geolocalizador leve com haste", target: [-0.05, 0.5, 0], fit: 1.1, az: -40, el: 25, scene: (f) => <Warbler f={f} tracker={1} /> }} w={540} h={400} bg={SKY} />
      <TileView t={{ name: "ÁRVORE + MASCOTE", size: "floresta low-poly · escala", target: [0, 1.8, 0], fit: 7, az: 15, el: 8, scene: (f) => (<><Ground /><group position={[-1.1, 0, 0]}><Tree f={f} /></group><group position={[1.7, 0, -1.2]}><Pine f={f} s={0.9} /></group><group position={[2.4, 0, 0.6]}><Tree f={f} seed="c" s={0.6} /></group><Mascot frame={f} position={[0.6, 0, 1]} scale={0.9} rotY={-0.4} /></>) }} w={540} h={400} bg={SKY} />
      <TileView t={{ name: "SUPERCÉLULA + TORNADO", size: "bigorna, base escura, funil girando", target: [0.8, 3.4, 0], fit: 13, az: 10, el: 6, scene: (f) => (<><Ground w={16} /><Supercell f={f} /></>) }} w={540} h={440} bg={STORM} />
      <TileView t={{ name: "ONDAS DE INFRASSOM", size: "som grave saindo da tempestade (esquema)", target: [0, 2, 0], fit: 30, az: 20, el: 28, scene: (f) => (<><Ground w={44} /><Supercell f={f} s={0.7} /><InfraWaves f={f * 6} k={1} maxR={18} /></>) }} w={540} h={440} bg={STORM} />
    </div>
  </AbsoluteFill>
);
