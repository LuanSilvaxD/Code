import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Gerrothorax } from "./components/Amphibia";
import { Mascot } from "./components/Mascot";
import { FONT } from "./theme";

const SEA = "radial-gradient(circle at 50% 38%,#2a5a7a 0%,#0b1424 80%)";
const Header: React.FC = () => (
  <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 2 }}>GERROTHORAX · v2</div>
    <div style={{ fontWeight: 700, fontSize: 21, color: "#c4b5fd" }}>para aprovar · reconstrução artística (cores e partes moles desconhecidas)</div>
  </div>
);
const Sand: React.FC<{ w?: number }> = ({ w = 2.4 }) => (
  <mesh position={[0, -0.02, 0]} receiveShadow>
    <boxGeometry args={[w, 0.04, w * 0.7]} />
    <meshStandardMaterial color="#8f8462" roughness={1} />
  </mesh>
);

export const GerroSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <TileView t={{ name: "3/4", size: "cabeça em meia-lua · ombros e quadril · cauda-remo · brânquias (incerto)", target: [0, 0.06, 0], fit: 1.15, az: 38, el: 26, scene: (f) => (<><Sand /><Gerrothorax f={f} /></>) }} w={1080} h={640} bg={SEA} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "DE CIMA", size: "cabeça mais larga que longa", target: [0, 0.05, 0], fit: 1.1, az: 0, el: 88, scene: (f) => <Gerrothorax f={f} /> }} w={540} h={420} bg={SEA} />
      <TileView t={{ name: "CABEÇA (CLOSE)", size: "olhos com pálpebra · lábio · sulcos sutis", target: [0.3, 0.06, 0], fit: 0.42, az: 55, el: 30, scene: (f) => (<><Sand /><Gerrothorax f={f} /></>) }} w={540} h={420} bg={SEA} />
      <TileView t={{ name: "NADANDO", size: "cauda-remo ondulando", target: [0, 0.3, 0], fit: 1.15, az: 20, el: 35, scene: (f) => <group position={[0, 0.3, 0]}><Gerrothorax f={f} swim={1} /></group> }} w={540} h={420} bg={SEA} />
      <TileView t={{ name: "BOCA ABERTA (SUCÇÃO)", size: "de frente", target: [0.25, 0.06, 0], fit: 0.75, az: 80, el: 14, scene: (f) => (<><Sand /><Gerrothorax f={f} mouth={1} /></>) }} w={540} h={420} bg={SEA} />
      <TileView t={{ name: "DE LADO + MASCOTE (escala)", size: "~0,9 m × pessoa", target: [0.35, 0.5, 0], fit: 2.4, az: 0, el: 6, scene: (f) => (<><Sand w={3.2} /><Gerrothorax f={f} /><Mascot frame={f} position={[1.05, 0, 0]} scale={0.55} rotY={-0.4} /></>) }} w={540} h={420} bg={SEA} />
      <TileView t={{ name: "SEM BRÂNQUIAS (opção)", size: "se preferir sem o incerto", target: [0, 0.06, 0], fit: 1.15, az: 38, el: 26, scene: (f) => (<><Sand /><Gerrothorax f={f} gills={0} /></>) }} w={540} h={420} bg={SEA} />
    </div>
  </AbsoluteFill>
);
