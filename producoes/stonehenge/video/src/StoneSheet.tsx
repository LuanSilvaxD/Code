import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { AFrame, Chips, Crib, Hammerstone, Monument, PitSection, Rails, Rope, Sledge, Sun } from "./components/Monument";
import { neolithicLooks, Person } from "./components/Person";
import { AltarStone, Bluestone, HeelStone, Lintel, Sarsen, Trilithon } from "./components/Stones";
import { BARROWS, Cremations, Grass, Ground, heightAt, R, Sheep, Strata, Tree } from "./components/Terrain";
import britain from "./data/britain.json";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folhas de design de Stonehenge (tudo em METROS; pessoa de 1,7 m para escala).
const P = 1.7 / 1.8;
const LOOKS = neolithicLooks(8, "sheet");
const SKY = "linear-gradient(180deg,#9cc3e0 0%,#dfe9ee 100%)";
const DAWN = "linear-gradient(180deg,#3b4f7d 0%,#e9a66b 75%,#f6d29a 100%)";
const DUSK = "linear-gradient(180deg,#2a2550 0%,#b25a5e 65%,#f09a58 100%)";

type Tile = { name: string; size: string; target: Vec3; fit: number; az?: number; el?: number; bg: string; scene: (f: number) => React.ReactNode };

const Floor: React.FC<{ w: number }> = ({ w }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[w, 0.1, w * 0.45]} />
    <meshStandardMaterial color="#76944f" roughness={1} />
  </mesh>
);
const Man: React.FC<{ f: number; i: number; p: Vec3; r?: number; walk?: number; point?: number }> = ({ f, i, p, r = 0.3, walk = 0, point = 0 }) => (
  <Person {...LOOKS[i % LOOKS.length]} frame={f} position={p} scale={P} rotY={r} seed={i} walk={walk} point={point} />
);

const TILES: Tile[] = [
  {
    name: "SARSEN + LINTEL", size: "4,1 m acima do chão · ~25 t / lintel ~7 t", target: [0.6, 2.6, 0], fit: 9, az: 18, el: 12, bg: SKY,
    scene: (f) => (<><Floor w={16} /><group position={[0.6, 0, 0]}><Sarsen seed={3} /></group><group position={[2.2, 5.0, 0]}><Lintel R={15} /></group><Man f={f} i={0} p={[-1.6, 0, 0.8]} /></>),
  },
  {
    name: "GRANDE TRILITO", size: "~7,3 m · lintel com encaixes", target: [0.1, 4.0, 0], fit: 11.5, az: 14, el: 8, bg: SKY,
    scene: (f) => (<><Floor w={16} /><group position={[0.6, 0, 0]}><Trilithon h={7.3} seed={60} /></group><Man f={f} i={1} p={[-2.4, 0, 1.2]} /></>),
  },
  {
    name: "PEDRAS AZUIS + ALTAR", size: "azuis ~2 m (2–5 t) · Altar 4,9 m (~6 t)", target: [0.6, 1.0, 0], fit: 8.2, az: 24, el: 26, bg: SKY,
    scene: (f) => (<><Floor w={14} /><group position={[-1.6, 0, -0.4]}><Bluestone seed={101} /></group><group position={[-0.5, 0, -0.6]}><Bluestone seed={104} h={2.3} /></group><group position={[2.4, 0, 0.3]}><AltarStone /></group><Man f={f} i={2} p={[0.6, 0, 1.0]} r={-0.3} /></>),
  },
  {
    name: "PEDRA DO CALCANHAR", size: "~4,7 m · bruta e inclinada · ~30 t", target: [0.3, 2.5, 0], fit: 7.2, az: 20, el: 8, bg: SKY,
    scene: (f) => (<><Floor w={14} /><group position={[1, 0, 0]}><HeelStone /></group><Man f={f} i={3} p={[-1.6, 0, 1]} /></>),
  },
  {
    name: "TRABALHADORES", size: "túnica, perneiras e couro · 1,7 m", target: [0, 0.95, 0], fit: 4.6, az: 0, el: 6, bg: SKY,
    scene: (f) => (<><Floor w={10} />{[0, 1, 2, 3, 4].map((i) => <Man key={i} f={f} i={i + 2} p={[-1.8 + i * 0.9, 0, (i % 2) * 0.3]} r={0.2 - i * 0.1} />)}</>),
  },
  {
    name: "TRENÓ + TRILHOS", size: "trenó 5,5 m · troncos · cordas", target: [0.6, 1.0, 0], fit: 11.5, az: 28, el: 16, bg: SKY,
    scene: (f) => (<><Floor w={22} /><Rails len={14} /><group position={[-1.5, 0.42, 0]}><Sledge /></group>{[0, 1, 2].map((i) => (<group key={i}><Man f={f} i={i + 4} p={[3.4 + i * 0.9, 0, (i - 1) * 0.9]} r={1.6} walk={1} /><Rope a={[1.6, 0.7, (i - 1) * 0.5]} b={[3.4 + i * 0.9, 1.0, (i - 1) * 0.9]} /></group>))}</>),
  },
  {
    name: "MARTELOS DE PEDRA", size: "grandes ~30 cm · pequenos ~10 cm", target: [0, 0.18, 0], fit: 1.2, az: 10, el: 18, bg: SKY,
    scene: (f) => (<><Floor w={3} /><Hammerstone size={0.3} seed={3} position={[-0.25, 0.13, 0]} /><Hammerstone size={0.24} seed={5} position={[0.1, 0.11, 0.1]} /><Hammerstone size={0.1} seed={2} position={[0.33, 0.045, 0.05]} /><Hammerstone size={0.08} seed={7} position={[0.45, 0.035, -0.05]} /><Chips t={((f % 40) / 40)} origin={[0, 0.3, -0.2]} /></>),
  },
  {
    name: "BURACO COM RAMPA", size: "corte · escoras em A · cordas", target: [0.8, 0.4, 1.5], fit: 11, az: 14, el: 8, bg: SKY,
    scene: (f) => (<><PitSection /><group position={[-0.5, -1.8, 3.0]} rotation={[0, 0, -1.0]}><Sarsen h={4.6} seed={9} tenons={0} lichen={false} /></group><group position={[-2.6, 0, 2.4]} rotation={[0, Math.PI / 2, 0]}><AFrame h={4.2} spread={2.2} /></group><Rope a={[3.3, 0.75, 3.0]} b={[-2.6, 4.2, 2.4]} /><Rope a={[-2.6, 4.2, 2.4]} b={[-4.3, 1.1, 2.5]} /><Man f={f} i={5} p={[-4.4, 0, 2.6]} r={1.5} /><Man f={f} i={6} p={[-4.6, 0, 1.6]} r={1.5} /></>),
  },
  {
    name: "PLATAFORMA DE TRONCOS", size: "sobe · calça · repete (até ~4 m)", target: [0, 2.6, 0], fit: 8.8, az: 22, el: 10, bg: SKY,
    scene: (f) => (<><Floor w={16} />{[-1, 1].map((s) => (<group key={s} position={[s * 1.6, 0, -1.2]}><Sarsen seed={20 + s} tenonX={[0]} /></group>))}<Crib layers={7} /><group position={[0, 2.62, 0]}><Lintel R={15} /></group><Man f={f} i={7} p={[-2.6, 0, 1.3]} /></>),
  },
  {
    name: "MONUMENTO COMPLETO", size: "anel Ø 30 m · ferradura de trilitos", target: [0, 2.5, 0], fit: 40, az: 30, el: 24, bg: SKY,
    scene: () => (<><Ground /><Monument heel={0} /></>),
  },
  {
    name: "HOJE (RUÍNA)", size: "padrão aproximado · não é pedra a pedra", target: [0, 2.5, 0], fit: 40, az: 30, el: 24, bg: SKY,
    scene: () => (<><Ground /><Monument heel={0} ruin={1} /></>),
  },
  {
    name: "VALA RECÉM-CAVADA", size: "~3000 a.C. · giz branco exposto · cinzas", target: [20, 0, 10], fit: 150, az: 40, el: 38, bg: SKY,
    scene: (f) => (<><Ground chalk={1} /><Cremations show={1} />{[0, 1, 2].map((i) => <Man key={i} f={f} i={i} p={[44 + i * 2.2, heightAt(44, 26), 26 - i * 3]} r={-0.6} />)}<Sheep frame={f} position={[30, heightAt(30, 34), 34]} rotY={0.6} /></>),
  },
];

const TW = 360;
const TH = 430;
const FOV = 14;

const TileView: React.FC<{ t: Tile; w?: number; h?: number }> = ({ t, w = TW, h = TH }) => {
  const f = useCurrentFrame();
  const fit = t.fit * 0.1;
  const d = fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * (w / h));
  const pose = orbit([t.target[0] * 0.1, t.target[1] * 0.1, t.target[2] * 0.1], d, t.az ?? 0, t.el ?? 5);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: t.bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov: FOV, near: d * 0.02, far: d * 6, position: [0, 0, d] }}>
        <Cam />
        <Lighting shadowExtent={Math.max(1.5, fit * 0.8)} />
        <group scale={0.1}>{t.scene(f)}</group>
      </ThreeCanvas>
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
        <div style={{ fontWeight: 900, fontSize: 24, letterSpacing: 0.5 }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#f0ebff" }}>{t.size}</div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 48, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 23, color: "#c4b5fd" }}>{sub}</div>
  </div>
);

export const StoneSheet: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="STONEHENGE · DESIGNS NOVOS" sub="para aprovar · pessoa de 1,7 m para escala" />
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>
      {TILES.map((t) => (
        <TileView key={t.name} t={t} />
      ))}
    </div>
  </AbsoluteFill>
);

// ---------------------------------------------------------------- folha 2: terreno, Sol e mapa

const Diorama: React.FC<{ f: number; ruin?: number; sun?: "dawn" | "dusk" }> = ({ f, ruin = 0, sun }) => (
  <group>
    <Ground chalk={0} />
    <Strata />
    <Grass />
    <Monument ruin={ruin} />
    {[[-84, 30], [-86, 22], [-80, 38], [-76, 26], [-40, -84], [-30, -88], [-36, -80], [62, 62], [68, 56], [58, -66], [84, -30], [86, -22]].map(([x, z], i) => (
      <Tree key={i} position={[x, heightAt(x, z), z]} s={1.4 + (i % 2) * 0.4} seed={i} />
    ))}
    {[[30, 34, 0.4], [36, 38, 2.2], [-34, 30, 1.2], [-30, -36, 3.4], [40, -30, 5.0]].map(([x, z, r], i) => (
      <Sheep key={i} frame={f} position={[x, heightAt(x, z), z]} rotY={r} seed={i} />
    ))}
    <Cremations show={1} />
    {sun === "dawn" ? <Sun position={[420, 12, -26]} color="#ffcf7a" size={11} /> : null}
    {sun === "dusk" ? <Sun position={[-420, 10, 0]} color="#ff9a52" size={11} /> : null}
    {BARROWS.length ? null : null}
  </group>
);

const BIG: Tile[] = [
  { name: "O TERRENO (DIORAMA)", size: `planície de Salisbury · Ø ${R * 2} m · giz por baixo`, target: [0, -3, 0], fit: 230, az: 32, el: 26, bg: SKY, scene: (f) => <group scale={1}><Diorama f={f} /></group> },
  { name: "VALA + AVENIDA + TÚMULOS", size: "vala Ø ~110 m · entrada a nordeste", target: [10, 0, 0], fit: 150, az: 70, el: 48, bg: SKY, scene: (f) => <Diorama f={f} /> },
  { name: "NASCER DO SOL · VERÃO", size: "visto do centro, no eixo · Calcanhar", target: [78, 1.8, 0], fit: 24.7, az: -90, el: 0, bg: DAWN, scene: (f) => <Diorama f={f} sun="dawn" /> },
  { name: "PÔR DO SOL · INVERNO", size: "visto do Calcanhar, no mesmo eixo", target: [-10, 4, 0], fit: 31, az: 90, el: 2, bg: DUSK, scene: (f) => <Diorama f={f} sun="dusk" /> },
];

const MapTile: React.FC = () => {
  const { points: p } = britain;
  const routes: [keyof typeof p, string, string][] = [["westWoods", "#7ee0a1", "SARSENS ~25 km"], ["preseli", "#8ec5ff", "AZUIS +200 km"], ["altar", "#ffd27a", "ALTAR ≥750 km"]];
  return (
    <div style={{ position: "relative", width: 540, height: 860, background: "linear-gradient(180deg,#14223b 0%,#0e1830 100%)", overflow: "hidden", outline: "1px solid rgba(11,8,18,0.6)" }}>
      <svg viewBox="80 60 760 1000" width={540} height={760} style={{ position: "absolute", top: 90, left: 0 }}>
        <path d={britain.ie} fill="#2b3a52" stroke="#45597a" strokeWidth={2} />
        <path d={britain.uk} fill="#3f5a3f" stroke="#86a77a" strokeWidth={2.5} />
        {routes.map(([k, c]) => (
          <path key={k} d={`M${p.stonehenge[0]},${p.stonehenge[1]} Q${(p.stonehenge[0] + p[k][0]) / 2 + 40},${(p.stonehenge[1] + p[k][1]) / 2} ${p[k][0]},${p[k][1]}`} fill="none" stroke={c} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" />
        ))}
        {routes.map(([k, c, label]) => (
          <g key={`${k}l`}>
            <circle cx={p[k][0]} cy={p[k][1]} r={11} fill={c} stroke="#0b0812" strokeWidth={3} />
            <text x={p[k][0] - 14} y={p[k][1] - 18} fill="#fff" fontFamily={FONT} fontWeight={900} fontSize={30} textAnchor="end" stroke="#0b0812" strokeWidth={6} paintOrder="stroke">{label}</text>
          </g>
        ))}
        <circle cx={p.stonehenge[0]} cy={p.stonehenge[1]} r={15} fill={BRAND.colors.accent} stroke="#f5f0ff" strokeWidth={4} />
        <text x={p.stonehenge[0] - 26} y={p.stonehenge[1] + 44} textAnchor="end" fill="#f5f0ff" fontFamily={FONT} fontWeight={900} fontSize={30} stroke="#0b0812" strokeWidth={6} paintOrder="stroke">STONEHENGE</text>
      </svg>
      <div style={{ position: "absolute", left: 14, top: 10, fontFamily: FONT, color: "#fff" }}>
        <div style={{ fontWeight: 900, fontSize: 24 }}>MAPA 2D (cenas 3–5)</div>
        <div style={{ fontWeight: 700, fontSize: 16, color: "#e3dcff" }}>contorno real (Natural Earth) · distâncias medidas</div>
      </div>
    </div>
  );
};

export const StoneSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="STONEHENGE · TERRENO, SOL E MAPA" sub="o cenário persistente do vídeo · para aprovar" />
    <div style={{ display: "grid", gridTemplateColumns: "540px 540px" }}>
      <TileView t={BIG[0]} w={540} h={430} />
      <TileView t={BIG[1]} w={540} h={430} />
      <TileView t={BIG[2]} w={540} h={430} />
      <TileView t={BIG[3]} w={540} h={430} />
      <MapTile />
      <div style={{ width: 540, height: 860, position: "relative" }}>
        <TileView t={{ name: "CANTEIRO NA FRENTE DO ANEL", size: "pedra no trenó chegando · equipe", target: [0, 2, 24], fit: 34, az: 30, el: 14, bg: SKY, scene: (f) => (<><Ground /><Monument heel={0} built={0.62} skipUpright={22} /><Rails len={22} /><group position={[2, heightAt(2, 26) + 0.42, 26]} rotation={[0, Math.PI / 2, 0]}><Sledge /></group>{[0, 1, 2, 3, 4, 5].map((i) => <Man key={i} f={f} i={i} p={[(i % 2 ? 1 : -1) * 1.2 + 1, heightAt(1, 31), 30 + Math.floor(i / 2) * 1.6]} r={Math.PI} walk={1} />)}</>) }} w={540} h={860} />
      </div>
    </div>
  </AbsoluteFill>
);
