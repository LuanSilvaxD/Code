import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { TileView } from "./DinoSheet";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { worldScale } from "./components/Person";
import { Stars } from "./components/SpaceScene";
import { Bridge, CrowsNest, HullCutaway, Iceberg, NEST_X, RadioRoom, TitanicHero } from "./components/Doc3D";
import { Figure1912, type Role } from "./components/Figures1912";
import { NightSea } from "./components/Titanic";
import { FONT } from "./theme";
import type { Vec3 } from "./utils/animation";

const NIGHT = "linear-gradient(180deg,#03050f 0%,#0a1430 60%,#13244a 100%)";
const DAY = "linear-gradient(180deg,#7fa8cc 0%,#c8d8e4 70%,#e6e2d6 100%)";
const STUDIO = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";
const WS = worldScale(1);
const P = WS.person;

/** Tile com câmera livre (posição, alvo e FOV próprios) — para planos de dentro da cabine. */
const CamTile: React.FC<{ name: string; size: string; pos: Vec3; target: Vec3; fov: number; w: number; h: number; bg: string; scene: (f: number) => React.ReactNode }> = ({ name, size, pos, target, fov, w, h, bg, scene }) => {
  const f = useCurrentFrame();
  const Cam = () => {
    usePose({ position: pos, target, fov });
    return null;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov, near: 0.05, far: 900, position: pos }}>
        <Cam />
        <Lighting shadowExtent={8} />
        {scene(f)}
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
        <div style={{ fontWeight: 900, fontSize: 22 }}>{name}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f0ebff" }}>{size}</div>
      </div>
    </div>
  );
};

const DaySea: React.FC = () => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]} receiveShadow>
    <planeGeometry args={[200, 200]} />
    <meshBasicMaterial color="#2f5f88" />
  </mesh>
);
/** Convés de madeira com amurada (para os figurantes). */
const DeckStrip: React.FC<{ w?: number }> = ({ w = 8 }) => (
  <group>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[0, -0.05, -1.5 + i * 0.25]} receiveShadow>
        <boxGeometry args={[w, 0.1, 0.245]} />
        <meshStandardMaterial color={i % 2 ? "#b89a6e" : "#ab8d62"} flatShading />
      </mesh>
    ))}
    <mesh position={[0, 0.55, -1.6]}><boxGeometry args={[w, 0.06, 0.08]} /><meshStandardMaterial color="#e8e0cc" /></mesh>
    {Array.from({ length: Math.round(w / 0.5) }, (_, i) => (
      <mesh key={`r${i}`} position={[-w / 2 + 0.25 + i * 0.5, 0.27, -1.6]}><boxGeometry args={[0.04, 0.55, 0.04]} /><meshStandardMaterial color="#e8e0cc" /></mesh>
    ))}
  </group>
);
const Header: React.FC = () => (
  <div style={{ height: 80, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 30, letterSpacing: 2 }}>DOCUMENTÁRIO TITANIC · DESIGNS (FOLHA 1 · v3)</div>
    <div style={{ fontWeight: 700, fontSize: 18, color: "#c4b5fd" }}>visão de dentro da ponte · fardas da tripulação · passageiros vestidos como em 1912</div>
  </div>
);
const FLOOD = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.15, 0.45, 0.7, 0.85, 0.95, 1];
const CREW: [Role, string][] = [["captain", "COMANDANTE"], ["officer", "OFICIAL"], ["seaman", "MARINHEIRO / VIGIA"], ["radio", "RADIOTELEGRAFISTA"]];
const PAX: [Role, string, string?][] = [["gent", "CAVALHEIRO · 1ª"], ["lady", "DAMA · 1ª"], ["lady", "DAMA · 1ª", "#2a3a5a"], ["steerageMan", "HOMEM · 3ª"], ["steerageWoman", "MULHER · 3ª"], ["child", "CRIANÇA · 3ª"]];

export const DocSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header />
    <div style={{ display: "grid", gridTemplateColumns: "960px 960px" }}>
      <TileView t={{ name: "TITANIC · DIA (SOUTHAMPTON)", size: "desenho próprio · 269 m · 4 chaminés · 16 botes nos turcos", target: [0, 1.6, 0], fit: 24, az: 34, el: 8, scene: (f) => (<><DaySea /><TitanicHero f={f} smoke={1} /></>) }} w={960} h={460} bg={DAY} />
      <TileView t={{ name: "TITANIC · NOITE (14/4, 23h)", size: "escotilhas e janelas acesas · mar sem lua", target: [1, 1.6, 0], fit: 24, az: -30, el: 6, scene: (f) => (<><Stars count={900} radius={90} frame={f} /><NightSea f={f} size={120} seg={150} moonX={-20} /><TitanicHero f={f} lights={1} smoke={0.6} /></>) }} w={960} h={460} bg={NIGHT} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "960px 960px" }}>
      <CamTile name="DENTRO DA PONTE · 23h39" size="visão do leme para a proa: castelo de proa, mastro com o cesto da gávea, mar sem lua" pos={[-2.3, 1.75, 0.9]} target={[6, 1.2, -0.2]} fov={58} w={960} h={540} bg={NIGHT}
        scene={(f) => (<><group position={[-84, -22.5, 0]} scale={10}><TitanicHero f={f} lights={1} cutBridge /></group><group position={[0, -22.5, 0]}><NightSea f={f} size={600} seg={120} moonX={60} /></group><group position={[150, 30, 0]}><Stars count={700} radius={140} frame={f} /></group><Bridge f={f} wheel={0.3} tele={-0.6} /><Figure1912 role="seaman" frame={f} position={[0.75, 0, 0]} rotY={Math.PI / 2} scale={P} seed={2} point={0.6} /><Figure1912 role="officer" frame={f} position={[1.9, 0, 1.0]} rotY={Math.PI / 2 - 0.3} scale={P} seed={4} /><Figure1912 role="captain" frame={f} position={[1.6, 0, -1.0]} rotY={Math.PI / 2 + 0.25} scale={P} seed={6} /></>)} />
      <TileView t={{ name: "FARDAS DA TRIPULAÇÃO (1912)", size: "comandante (quepe branco, 4 divisas) · oficial · marinheiro · radiotelegrafista", target: [0, 0.95, 0], fit: 5.2, az: 0, el: 6, scene: (f) => (<><DeckStrip w={6} />{CREW.map(([r], i) => <Figure1912 key={r} role={r} frame={f} position={[-1.95 + i * 1.3, 0, 0]} rotY={-0.15 + i * 0.1} scale={P} seed={i} />)}</>) }} w={960} h={540} bg={STUDIO} />
    </div>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 384px)" }}>
      <TileView t={{ name: "PASSAGEIROS (1912)", size: "1ª classe: cartola, fraque, vestidos e chapéus · 3ª: boina, xale, lenço", target: [0, 0.9, 0], fit: 5.6, az: 10, el: 8, scene: (f) => (<><DeckStrip w={7} />{PAX.map(([r, , tint], i) => <Figure1912 key={i} role={r} frame={f} position={[-2.4 + i * 0.95, 0, (i % 2) * 0.35]} rotY={-0.2 + (i % 3) * 0.15} scale={P} seed={i + 10} tint={tint} />)}</>) }} w={384} h={500} bg={STUDIO} />
      <TileView t={{ name: "ICEBERG", size: "blocos de gelo facetados · espuma na base", target: [0.2, 1.1, 0], fit: 8.5, az: 20, el: 5, scene: (f) => (<><Stars count={500} radius={60} frame={f} /><Iceberg f={f} /><group position={[0, -0.02, 0]}><NightSea f={f} size={40} seg={70} moonX={2} calm={0.4} /></group></>) }} w={384} h={500} bg={NIGHT} />
      <TileView t={{ name: "CORTE: 16 COMPARTIMENTOS", size: "anteparas não iam até o topo", target: [0.6, 0.3, 0], fit: 27, az: 0, el: 4, scene: (f) => <group rotation={[0, 0, -0.06]} scale={[1, 1.8, 1]}><HullCutaway f={f} flood={FLOOD} /></group> }} w={384} h={500} bg={STUDIO} />
      <TileView t={{ name: "CESTO DA GÁVEA", size: "vigia de farda, sem binóculos", target: [1.6, 0.6, 0], fit: 6.5, az: -35, el: 10, scene: (f) => (<><Stars count={600} radius={50} frame={f} /><group position={[0, -16, 0]}><NightSea f={f} size={90} seg={90} moonX={-6} /></group><CrowsNest f={f} bell={1} /><Figure1912 role="seaman" frame={f} position={[NEST_X + 0.05, 0.05, 0.15]} rotY={Math.PI / 2} scale={P} point={1} seed={5} /></>) }} w={384} h={500} bg={NIGHT} />
      <TileView t={{ name: "SALA DE RÁDIO", size: "operador de farda · avisos de gelo empilhando", target: [0, 1.2, -0.6], fit: 4.6, az: 30, el: 12, scene: (f) => (<><RadioRoom f={f} /><Figure1912 role="radio" frame={f} position={[0.55, 0, -0.55]} rotY={Math.PI + 0.4} scale={P} seed={12} /></>) }} w={384} h={500} bg={STUDIO} />
    </div>
  </AbsoluteFill>
);
