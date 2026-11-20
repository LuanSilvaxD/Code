import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Person, personLook, worldScale } from "./components/Person";
import { Stars } from "./components/SpaceScene";
import { Bridge, CrowsNest, HullCutaway, Iceberg, RadioRoom, TitanicHero } from "./components/Doc3D";
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
      <TileView t={{ name: "ICEBERG", size: "parte de cima + massa submersa", target: [0, 0.2, 0], fit: 8, az: 20, el: 6, scene: (f) => (<><Stars count={400} radius={60} frame={f} /><Iceberg /><mesh rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[30, 30]} /><meshStandardMaterial color="#0e2c4c" transparent opacity={0.55} depthWrite={false} /></mesh></>) }} w={384} h={500} bg={NIGHT} />
      <TileView t={{ name: "CORTE: 16 COMPARTIMENTOS", size: "anteparas não iam até o topo · água transbordando", target: [0.6, 0.3, 0], fit: 27, az: 0, el: 4, scene: (f) => <group rotation={[0, 0, -0.06]} scale={[1, 1.8, 1]}><HullCutaway f={f} flood={FLOOD} /></group> }} w={384} h={500} bg={STUDIO} />
      <TileView t={{ name: "CESTO DA GÁVEA", size: "vigia · sino · telefone · sem binóculos", target: [0, 1.0, 0], fit: 4.2, az: 25, el: 12, scene: (f) => (<><Stars count={400} radius={50} frame={f} /><CrowsNest f={f} bell={1} /><Person {...personLook(5)} frame={f} position={[0.1, 0.05, 0.1]} scale={WS.person} rotY={Math.PI / 2} point={1} seed={5} /></>) }} w={384} h={500} bg={NIGHT} />
      <TileView t={{ name: "PONTE DE COMANDO", size: "leme · telégrafo das máquinas · bússola", target: [0.6, 1.2, 0], fit: 5.6, az: -55, el: 14, scene: (f) => (<><Bridge f={f} wheel={0.6} tele={-0.8} /><Person {...personLook(8)} frame={f} position={[0.6, 0, 0.3]} scale={WS.person} rotY={Math.PI / 2} seed={8} /></>) }} w={384} h={500} bg={STUDIO} />
      <TileView t={{ name: "SALA DE RÁDIO", size: "telégrafo Marconi · faísca · mensagens empilhando", target: [0, 1.0, -0.6], fit: 4.4, az: 28, el: 14, scene: (f) => (<><RadioRoom f={f} /><Person {...personLook(12)} frame={f} position={[0, 0, -0.5]} scale={WS.person} rotY={Math.PI} seed={12} /></>) }} w={384} h={500} bg={STUDIO} />
    </div>
  </AbsoluteFill>
);
