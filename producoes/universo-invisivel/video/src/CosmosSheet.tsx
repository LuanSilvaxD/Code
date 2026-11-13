import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { NightGlobe, Sun } from "./components/Apagao";
import { CosmicWeb, Euclid, ExpandingField, Iceberg, Lens, PullArrows, SkyThird, SpiralGalaxy, UniversePie } from "./components/Cosmos";
import { Mascot } from "./components/Mascot";
import { Stars } from "./components/SpaceScene";
import { FONT } from "./theme";

const SPACE = "radial-gradient(circle at 50% 45%,#2a2366 0%,#08061a 80%)";
const SEA = "linear-gradient(180deg,#0e1a3a 0%,#081024 100%)";
const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 42, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 22, color: "#c4b5fd" }}>{sub}</div>
  </div>
);

export const CosmosSheet1: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="UNIVERSO INVISÍVEL · 1" sub="para aprovar · esquemáticos (fora de escala)" />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "GALÁXIA + MATÉRIA ESCURA", size: "halo roxo = ilustração (é invisível)", target: [0, 0, 0], fit: 8, az: 0, el: 20, scene: (f) => (<><Stars frame={f} radius={40} count={500} /><SpiralGalaxy spin={f * 0.01} halo={1} /><PullArrows f={f} /></>) }} w={540} h={580} bg={SPACE} />
      <TileView t={{ name: "SEM MATÉRIA ESCURA", size: "as estrelas de fora escapam", target: [0, 0, 0], fit: 9, az: 0, el: 20, scene: (f) => (<><Stars frame={f} radius={40} count={500} /><SpiralGalaxy spin={f * 0.03} scatter={0.6} seed="b" /></>) }} w={540} h={580} bg={SPACE} />
      <TileView t={{ name: "PIZZA DO UNIVERSO", size: "5% visível · 27% matéria escura · 68% energia escura", target: [0, 0.2, 0], fit: 6.4, az: 0, el: 25, scene: () => <UniversePie k5={1} k27={1} k68={1} /> }} w={540} h={580} bg={SPACE} />
      <TileView t={{ name: "SÓ OS 5% + CONTORNO", size: "o resto ainda \"vazio\"", target: [0, 0.2, 0], fit: 6.4, az: 0, el: 25, scene: () => <UniversePie k5={1} outline={1} /> }} w={540} h={580} bg={SPACE} />
    </div>
    <TileView t={{ name: "EXPANSÃO ACELERADA", size: "galáxias se afastando cada vez mais rápido", target: [0, 0, 0], fit: 12, az: 0, el: 5, scene: (f) => <ExpandingField f={f} t={0.4} /> }} w={1080} h={600} bg={SPACE} />
  </AbsoluteFill>
);

export const CosmosSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="UNIVERSO INVISÍVEL · 2" sub="para aprovar · Euclid, lente, teia e iceberg" />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "EUCLID (ESTILIZADO)", size: "tubo + escudo solar · sem logos · mascote p/ escala", target: [0, 0.3, 0], fit: 4.6, az: 30, el: 10, scene: (f) => (<><Stars frame={f} radius={40} count={500} /><Euclid f={f} /><Mascot frame={f} position={[1.7, -1.2, 1.0]} scale={0.5} float={1} rotY={-0.6} /></>) }} w={540} h={580} bg={SPACE} />
      <TileView t={{ name: "SOL · TERRA · EUCLID + 1/3 DO CÉU", size: "ESQUEMA: distâncias fora de escala", target: [-1, 0, 0], fit: 26, az: 0, el: 12, scene: (f) => (<><group position={[-10, 0, 0]}><Sun r={2.4} f={f} /></group><NightGlobe R={1.2} /><group position={[5, 0, 0]}><Euclid f={f} s={0.6} /><SkyThird r={4} k={1} /></group></>) }} w={540} h={580} bg={SPACE} />
      <TileView t={{ name: "LENTE GRAVITACIONAL", size: "galáxia de fundo vira arcos · contorno do halo", target: [0, 0, 0], fit: 10, az: 0, el: 0, scene: (f) => <Lens f={f} pass={1} arcs={1} field={1} trace={1} /> }} w={540} h={580} bg={SPACE} />
      <TileView t={{ name: "TEIA CÓSMICA (O MAPA)", size: "filamentos e nós de galáxias", target: [0, 0, 0], fit: 9, az: 0, el: 10, scene: (f) => <CosmicWeb f={f} light={1} /> }} w={540} h={580} bg={SPACE} />
    </div>
    <TileView t={{ name: "ICEBERG", size: "5% acima d'água · 95% escondido embaixo", target: [0, -1.8, 0], fit: 11, az: 20, el: 4, scene: (f) => (<><Iceberg f={f} /><Mascot frame={f} position={[2.2, 0.4, 1.2]} scale={0.5} float={1} rotY={-0.6} /></>) }} w={1080} h={600} bg={SEA} />
  </AbsoluteFill>
);
