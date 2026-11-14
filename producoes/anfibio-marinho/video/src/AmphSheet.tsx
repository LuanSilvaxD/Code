import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Frog, Gerrothorax, Ichthyosaur, Salamander, SkinBlock, FossilSlab } from "./components/Amphibia";
import { Mascot } from "./components/Mascot";
import { FONT } from "./theme";

const SEA = "radial-gradient(circle at 50% 38%,#2a5a7a 0%,#0b1424 80%)";
const STUDIO = "radial-gradient(circle at 50% 42%,#2a2240 0%,#0b0812 78%)";
const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 150, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 21, color: "#c4b5fd" }}>{sub}</div>
  </div>
);
const Sand: React.FC<{ w?: number }> = ({ w = 2.4 }) => (
  <mesh position={[0, -0.02, 0]} receiveShadow>
    <boxGeometry args={[w, 0.04, w * 0.7]} />
    <meshStandardMaterial color="#c8b48a" roughness={1} />
  </mesh>
);

export const AmphSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="ANFÍBIO MARINHO · DESIGNS" sub="para aprovar · Gerrothorax maritimus (reconstrução artística) e o resto" />
    <TileView t={{ name: "GERROTHORAX MARITIMUS · 3/4", size: "~0,9 m · cabeça larga e achatada · olhos no topo · placas de osso · brânquias (incerto)", target: [0.02, 0.05, 0], fit: 1.25, az: 35, el: 28, scene: (f) => (<><Sand /><Gerrothorax f={f} swim={1} /></>) }} w={1080} h={640} bg={SEA} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "DE CIMA", size: "formato de pá · armadura", target: [0, 0.05, 0], fit: 1.15, az: 0, el: 88, scene: (f) => <Gerrothorax f={f} /> }} w={540} h={430} bg={SEA} />
      <TileView t={{ name: "DE LADO + MASCOTE (escala)", size: "bicho de ~0,9 m × pessoa", target: [0.3, 0.45, 0], fit: 2.4, az: 0, el: 6, scene: (f) => (<><Sand w={3.2} /><Gerrothorax f={f} mouth={0.8} /><Mascot frame={f} position={[1.0, 0, 0]} scale={0.55} rotY={-0.4} /></>) }} w={540} h={430} bg={SEA} />
      <TileView t={{ name: "ICTIOSSAURO", size: "réptil marinho vizinho", target: [0, 0, 0], fit: 3.4, az: 25, el: 10, scene: (f) => <Ichthyosaur f={f} /> }} w={540} h={400} bg={SEA} />
      <TileView t={{ name: "ANFÍBIOS DE HOJE", size: "sapo · salamandra", target: [0, 0.06, 0], fit: 0.6, az: 25, el: 18, scene: (f) => (<><group position={[-0.12, 0, 0.05]} rotation={[0, 0.5, 0]}><Frog f={f} /></group><group position={[0.13, 0, -0.06]} rotation={[0, 2.4, 0]}><Salamander f={f} /></group></>) }} w={540} h={400} bg={STUDIO} />
      <TileView t={{ name: "PELE EM CORTE (ESQUEMA)", size: "água (azul) sai · sal (branco)", target: [0, 0.2, 0], fit: 3.2, az: 25, el: 22, scene: (f) => <SkinBlock f={f * 4} out={1} salt={1} /> }} w={540} h={400} bg={STUDIO} />
      <TileView t={{ name: "FÓSSIL NA LAJE", size: "crânio largo · coluna · placas", target: [0, 0, 0], fit: 1.4, az: 10, el: 55, scene: () => <FossilSlab /> }} w={540} h={400} bg={STUDIO} />
    </div>
  </AbsoluteFill>
);
