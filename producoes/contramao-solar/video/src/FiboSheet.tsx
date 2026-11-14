import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { FibSquares, Nautilus, Pineapple, PineCone, Rabbit, SeedHead, Sunflower } from "./components/Fibo";
import { Mascot } from "./components/Mascot";
import { FONT } from "./theme";

const STUDIO = "radial-gradient(circle at 50% 42%,#2c4a3a 0%,#0e1a16 78%)";
const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 22, color: "#c4b5fd" }}>{sub}</div>
  </div>
);
const Grass: React.FC = () => (
  <mesh position={[0, -0.03, 0]}>
    <boxGeometry args={[4, 0.06, 2.2]} />
    <meshStandardMaterial color="#5a8a3a" roughness={1} />
  </mesh>
);

export const FiboSheet1: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="FIBONACCI · GIRASSOL" sub="para aprovar · filotaxia real (137,5°) · espirais 34 e 55" />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "GIRASSOL (DE FRENTE)", size: "900 sementes · ângulo áureo", target: [0, 0, 0], fit: 6.2, az: 0, el: 89, scene: (f) => <Sunflower f={f} stem={false} /> }} w={540} h={540} bg={STUDIO} />
      <TileView t={{ name: "34 ESPIRAIS (LARANJA)", size: "sentido horário", target: [0, 0, 0], fit: 4.4, az: 0, el: 89, scene: () => <SeedHead famA={1} /> }} w={540} h={540} bg={STUDIO} />
      <TileView t={{ name: "55 ESPIRAIS (AZUL)", size: "sentido anti-horário", target: [0, 0, 0], fit: 4.4, az: 0, el: 89, scene: () => <SeedHead famB={1} /> }} w={540} h={540} bg={STUDIO} />
      <TileView t={{ name: "GIRASSOL INTEIRO + MASCOTE", size: "caule, folhas, sépalas", target: [0, -1.6, 0], fit: 10, az: 28, el: 8, scene: (f) => (<><group rotation={[1.25, 0, 0]}><Sunflower f={f} /></group><Mascot frame={f} position={[2.6, -3.6, 1.6]} scale={0.9} rotY={-0.5} /></>) }} w={540} h={540} bg={STUDIO} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "360px 360px 360px" }}>
      <TileView t={{ name: "SEMENTES NASCENDO", size: "137,5° · 40% formado", target: [0, 0, 0], fit: 4.4, az: 0, el: 89, scene: () => <SeedHead n={500} grow={0.4} /> }} w={360} h={440} bg={STUDIO} />
      <TileView t={{ name: "120° (3 RAIOS)", size: "sobra espaço", target: [0, 0, 0], fit: 4.4, az: 0, el: 89, scene: () => <SeedHead n={500} angle={(120 * Math.PI) / 180} /> }} w={360} h={440} bg={STUDIO} />
      <TileView t={{ name: "90° (4 RAIOS)", size: "sobra espaço", target: [0, 0, 0], fit: 4.4, az: 0, el: 89, scene: () => <SeedHead n={500} angle={Math.PI / 2} /> }} w={360} h={440} bg={STUDIO} />
    </div>
  </AbsoluteFill>
);

export const FiboSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="FIBONACCI · RESTO" sub="para aprovar · coelhos, quadrados, pinha, abacaxi, náutilo" />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "COELHOS (1202)", size: "casais · low-poly", target: [0, 0.35, 0], fit: 2.8, az: 25, el: 14, scene: (f) => (<><Grass /><group position={[-0.5, 0, 0.2]}><Rabbit f={f} /></group><group position={[0.6, 0, -0.2]} rotation={[0, 2.6, 0]}><Rabbit f={f} color="#b88a5a" /></group></>) }} w={540} h={540} bg={STUDIO} />
      <TileView t={{ name: "QUADRADOS + ESPIRAL", size: "1, 1, 2, 3, 5, 8, 13 · ESQUEMA", target: [0, 0, 0], fit: 7.4, az: 0, el: 0, scene: () => <FibSquares /> }} w={540} h={540} bg={STUDIO} />
      <TileView t={{ name: "PINHA", size: "escamas em espiral (destaque)", target: [0, 0, 0], fit: 3.6, az: 20, el: 25, scene: () => <PineCone hi={1} /> }} w={540} h={540} bg={STUDIO} />
      <TileView t={{ name: "ABACAXI", size: "gomos em espiral (destaque) · coroa", target: [0, 0.4, 0], fit: 4.2, az: 20, el: 15, scene: (f) => <Pineapple hi={1} f={f} /> }} w={540} h={540} bg={STUDIO} />
    </div>
    <TileView t={{ name: "NÁUTILO EM CORTE", size: "concha real (raio ×3 por volta) × espiral áurea dourada (não encaixa)", target: [0, 0, 0], fit: 4.4, az: 0, el: 0, scene: () => <Nautilus golden={1} /> }} w={1080} h={680} bg={STUDIO} />
  </AbsoluteFill>
);
