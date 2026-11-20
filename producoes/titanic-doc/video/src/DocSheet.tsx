import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Person, personLook, worldScale } from "./components/Person";
import { Stars } from "./components/SpaceScene";
import { Bridge, CrowsNest, HullCutaway, Iceberg, NEST_X, RadioRoom, TitanicHero } from "./components/Doc3D";
import { NightSea } from "./components/Titanic";
import { FONT } from "./theme";

const NIGHT = "linear-gradient(180deg,#03050f 0%,#0a1430 60%,#13244a 100%)";
const DAY = "linear-gradient(180deg,#7fa8cc 0%,#c8d8e4 70%,#e6e2d6 100%)";
const STUDIO = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const WS = worldScale(1);
const DaySea: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[200, 200]} />
    <meshBasicMaterial color="#2f5f88" />
  </mesh>
);
const Header: React.FC = () => (
  <div style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 2 }}>DOCUMENTÁRIO TITANIC · DESIGNS (FOLHA 1)</div>
    <div style={{ fontWeight: 700, fontSize: 18, color: "#c4b5fd" }}>navio herói (dia/noite), iceberg, corte dos compartimentos, cesto da gávea, ponte, sala de rádio</div>
  </div>
);
const FLOOD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.15, 0.45, 0.7, 0.85, 0.95, 1];
export const DocSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ display: "grid", gridTemplateColumns: "960px 960px" }}>
      <TileView t={{ name: "TITANIC · DIA (SOUTHAMPTON)", size: "desenho próprio · 269 m · 4 chaminés · 16 botes nos turcos", target: [0, 1.6, 0], fit: 24, az: 34, el: 8, scene: (f) => (<><DaySea /><TitanicHero f={f} smoke={1} /></>) }} w={960} h={500} bg={DAY} />
      <TileView t={{ name: "TITANIC · NOITE (14/4, 23h)", size: "escotilhas e janelas acesas · mar sem lua", target: [1, 1.6, 0], fit: 24, az: -30, el: 6, scene: (f) => (<><Stars count={900} radius={90} frame={f} /><NightSea f={f} size={120} seg={150} moonX={-20} /><TitanicHero f={f} lights={1} smoke={0.6} /></>) }} w={960} h={500} bg={NIGHT} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 384px)" }}>
      <TileView t={{ name: "ICEBERG", size: "blocos de gelo facetados · espuma na base · noite sem lua", target: [0.2, 1.1, 0], fit: 8.5, az: 20, el: 5, scene: (f) => (<><Stars count={500} radius={60} frame={f} /><Iceberg f={f} /><group position={[0, -0.02, 0]}><NightSea f={f} size={40} seg={70} moonX={2} calm={0.4} /></group></>) }} w={384} h={500} bg={NIGHT} />
      <TileView t={{ name: "CORTE: 16 COMPARTIMENTOS", size: "anteparas não iam até o topo · água transbordando", target: [0.6, 0.3, 0], fit: 27, az: 0, el: 4, scene: (f) => <group rotation={[0, 0, -0.06]} scale={[1, 1.8, 1]}><HullCutaway f={f} flood={FLOOD} /></group> }} w={384} h={500} bg={STUDIO} />
      <TileView t={{ name: "CESTO DA GÁVEA", size: "na frente do mastro · vigia vê o iceberg lá embaixo", target: [1.6, 0.6, 0], fit: 6.5, az: -35, el: 10, scene: (f) => (<><Stars count={600} radius={50} frame={f} /><group position={[0, -16, 0]}><NightSea f={f} size={90} seg={90} moonX={-6} /></group><group position={[9, -15.4, -1]} scale={0.6}><Iceberg f={f} under={false} /></group><CrowsNest f={f} bell={1} /><Person {...personLook(5)} frame={f} position={[NEST_X + 0.05, 0.05, 0.15]} scale={WS.person} rotY={Math.PI / 2} point={1} seed={5} /></>) }} w={384} h={500} bg={NIGHT} />
      <TileView t={{ name: "PONTE DE COMANDO", size: "leme · telégrafos · mesa de cartas · relógio 23h40", target: [0.2, 1.2, 0], fit: 6.2, az: -62, el: 14, scene: (f) => (<><group position={[0, -8, 0]}><NightSea f={f} size={80} seg={80} moonX={0} /></group><group position={[25, 6, 0]}><Stars count={300} radius={18} frame={f} /></group><Bridge f={f} wheel={0.6} tele={-0.8} /><Person {...personLook(8)} frame={f} position={[0.6, 0, 0.3]} scale={WS.person} rotY={Math.PI / 2} seed={8} /></>) }} w={384} h={500} bg={STUDIO} />
      <TileView t={{ name: "SALA DE RÁDIO", size: "aparelho Marconi · avisos de gelo empilhando · 23h40", target: [0, 1.2, -0.6], fit: 4.6, az: 30, el: 12, scene: (f) => (<><RadioRoom f={f} /><Person {...personLook(12)} frame={f} position={[0.55, 0, -0.55]} scale={WS.person} rotY={Math.PI + 0.4} seed={12} /></>) }} w={384} h={500} bg={STUDIO} />
    </div>
  </AbsoluteFill>
);
