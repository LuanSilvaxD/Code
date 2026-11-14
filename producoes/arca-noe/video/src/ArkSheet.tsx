import { AbsoluteFill } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { Ararat, ArkOutline, Campfire, CharredWood, DrillRig, Durupinar, Plateau, Sheep, SynclineBlock } from "./components/Ark";
import { Mascot } from "./components/Mascot";
import { Person } from "./components/Person";
import { FONT } from "./theme";

const SKY = "linear-gradient(180deg,#6aa8d8 0%,#cfe4ee 70%,#ece4d4 100%)";
const STUDIO = "radial-gradient(circle at 50% 42%,#2a2240 0%,#0b0812 78%)";
const Header: React.FC = () => (
  <div style={{ height: 140, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 40, letterSpacing: 2 }}>ARCA DE NOÉ? · DESIGNS</div>
    <div style={{ fontWeight: 700, fontSize: 21, color: "#c4b5fd" }}>para aprovar · paisagem 1 u = 10 m · objetos em metros</div>
  </div>
);
const Ground: React.FC<{ w?: number; c?: string }> = ({ w = 4, c = "#9a8a62" }) => (
  <mesh position={[0, -0.02, 0]} receiveShadow>
    <boxGeometry args={[w, 0.04, w * 0.7]} />
    <meshStandardMaterial color={c} roughness={1} />
  </mesh>
);

export const ArkSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <TileView t={{ name: "DURUPINAR + ARARAT", size: "formação em forma de casco (~157 m) no planalto · Monte Ararat ao fundo", target: [0, 8, -20], fit: 80, az: 14, el: 10, scene: () => (<><Plateau /><group position={[6, 0, 8]} scale={1.6}><Durupinar /></group><group position={[-14, 0, -60]} scale={0.8}><Ararat /></group></>) }} w={1080} h={520} bg={SKY} />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={{ name: "DE CIMA + ARCA (300 CÔVADOS)", size: "contorno dourado por cima da formação", target: [0, 0, 0], fit: 19, az: 0, el: 80, scene: () => (<><Ground w={24} /><Durupinar /><group position={[0, 0.2, 0]}><ArkOutline /></group></>) }} w={540} h={330} bg={SKY} />
      <TileView t={{ name: "MADEIRA CARBONIZADA", size: "fragmentos sobre lona · amostra", target: [0, 0.02, 0], fit: 1.1, az: 20, el: 50, scene: (f) => <CharredWood f={f} /> }} w={540} h={330} bg={STUDIO} />
      <TileView t={{ name: "DOBRA DE ROCHA (CORTE)", size: "camadas em U (sinclinal) · erosão = casco", target: [0, 0.4, 0], fit: 7.5, az: 0, el: 8, scene: () => <SynclineBlock fold={1} erode={0.5} /> }} w={540} h={330} bg={STUDIO} />
      <TileView t={{ name: "SONDA + TESTEMUNHO", size: "perfuração · amostra com camada escura", target: [0.3, 1.3, 0], fit: 4, az: 25, el: 10, scene: (f) => (<><DrillRig f={f} depth={0.5} core={1} /><Person frame={f} position={[-1, 0, 0.6]} rotY={0.6} seed={3} /></>) }} w={540} h={330} bg={SKY} />
      <TileView t={{ name: "FOGUEIRA + PASTOR + OVELHAS", size: "a hipótese do próprio líder da equipe", target: [0.3, 0.7, 0], fit: 4.2, az: 15, el: 12, scene: (f) => (<><Ground w={6} /><Campfire f={f} /><Person frame={f} position={[-0.9, 0, -0.2]} rotY={0.8} seed={11} robe="#7a5a3a" /><group position={[1.1, 0, 0.3]} rotation={[0, 2.6, 0]}><Sheep f={f} graze={1} /></group><group position={[0.9, 0, -0.9]} rotation={[0, -2.2, 0]}><Sheep f={f + 20} /></group></>) }} w={540} h={330} bg={SKY} />
      <TileView t={{ name: "OVELHA (CLOSE) + MASCOTE", size: "lã em tufos · cara escura · patas com casco", target: [0.1, 0.55, 0], fit: 2.2, az: 30, el: 12, scene: (f) => (<><Ground w={3} /><Sheep f={f} /><Mascot frame={f} position={[-0.9, 0, 0.3]} scale={0.6} rotY={0.4} /></>) }} w={540} h={330} bg={SKY} />
    </div>
  </AbsoluteFill>
);
