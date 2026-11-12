import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { BoreholeMouth, Coins, Drill, DrillStation, EarthGlobe, GlobePin, Magnifier, Microfossil, Microphone, RockColumn, RustyCap, ScaleBoard, Tundra } from "./components/Kola";
import { Lighting } from "./components/Lighting";
import { Mascot } from "./components/Mascot";
import { crowdLooks, Person } from "./components/Person";
import { FONT } from "./theme";
import { orbit, type Vec3 } from "./utils/animation";

// Folhas de design do "buraco mais fundo". Superfície em METROS (pessoa 1,7 m); coluna/régua/globo em u3d esquemáticos.
const PS = 1.7 / 1.8;
const SKY = "linear-gradient(180deg,#9fb3c8 0%,#e3e8ee 100%)";
const STUDIO = "radial-gradient(circle at 50% 40%,#3b2a52 0%,#171222 75%)";
const DEEP = "radial-gradient(circle at 50% 45%,#2a1d3a 0%,#0e0a16 80%)";

type Tile = { name: string; size: string; target: Vec3; fit: number; az?: number; el?: number; bg: string; unit?: number; scene: (f: number) => React.ReactNode; over?: React.ReactNode };

const WORKER = (i: number) => ({ ...crowdLooks(6, "kola-inverno")[i], shirt: ["#3f4a5c", "#5a4a3a", "#2f4d4a", "#4b3f5a"][i % 4], sleeves: "long" as const, pants: "#2c2f38", helmet: "sallet" as const, helmetColor: "#f2b01e" });
const Ref: React.FC<{ f: number; p: Vec3; i?: number; r?: number }> = ({ f, p, i = 0, r = 0.3 }) => <Person {...WORKER(i)} frame={f} position={p} scale={PS} rotY={r} seed={i + 30} />;

const SURFACE: Tile[] = [
  {
    name: "ESTAÇÃO SG-3", size: "torre fechada ~58 m · galpões · laje · pessoa 1,7 m (seta)", target: [4, 22, 0], fit: 110, az: 28, el: 14, bg: SKY, unit: 0.02,
    scene: (f) => (<><Tundra w={150} d={110} /><DrillStation lights={1} /><Ref f={f} p={[8, 0.4, 14]} /></>),
  },
  {
    name: "ESTAÇÃO ABANDONADA", size: "hoje · ruínas + tampa (no centro) · pessoa 1,7 m", target: [4, 4, 0], fit: 70, az: 28, el: 22, bg: SKY, unit: 0.03,
    scene: (f) => (<><Tundra w={150} d={110} /><DrillStation ruin={1} /><group position={[0, 0.4, 0]}><RustyCap /></group><Ref f={f} p={[3, 0.4, 4]} /></>),
  },
  {
    name: "TUNDRA NEVADA", size: "placa da superfície · arbustos, pedras, montes de neve", target: [0, 0, 0], fit: 170, az: 20, el: 30, bg: SKY, unit: 0.015,
    scene: () => <Tundra w={180} d={140} />,
  },
  {
    name: "BOCA DO FURO · 23 CM", size: "tubo de revestimento + régua de 30 cm · pessoa 1,7 m", target: [0.5, 0.7, 0], fit: 2.6, az: 25, el: 16, bg: SKY, unit: 0.5,
    scene: (f) => (<><BoreholeMouth /><Ref f={f} p={[0.9, 0.2, -0.3]} r={-0.5} /></>),
  },
  {
    name: "TAMPA ENFERRUJADA", size: "Ø ~0,7 m · soldada na laje · mascote em pé", target: [0, 0.45, 0], fit: 2.6, az: 30, el: 22, bg: SKY, unit: 0.5,
    scene: (f) => (<><RustyCap /><Mascot frame={f} position={[0.05, 0.42, 0.05]} scale={0.7} /></>),
  },
  {
    name: "OPERÁRIOS (APROVADOS)", size: "roupa de inverno + capacete · variados", target: [0, 0.9, 0], fit: 4.6, az: 0, el: 6, bg: SKY, unit: 0.3,
    scene: (f) => (<><mesh position={[0, -0.05, 0]}><boxGeometry args={[8, 0.1, 3]} /><meshStandardMaterial color="#e9eef3" /></mesh>{[0, 1, 2, 3].map((i) => <Ref key={i} f={f} p={[-1.5 + i, 0, 0]} i={i} r={0.2 - i * 0.1} />)}</>),
  },
];

const DESCENT: Tile[] = [
  {
    name: "COLUNA DE ROCHA", size: "esquemática · 0 → 12.262 m · esquenta com a profundidade", target: [0, -12.6, 0], fit: 27, az: 18, el: 4, bg: DEEP, unit: 1,
    scene: (f) => (<><RockColumn heat={1} f={f} /><Drill tip={-24.52} top={0} f={f} heat={1} r={0.08} /></>),
  },
  {
    name: "RACHADURAS COM ÁGUA", size: "3–6 km · gotas que escorrem", target: [0, -9, 0], fit: 3.6, az: 18, el: 4, bg: DEEP, unit: 1,
    scene: (f) => (<><RockColumn cracks={1} heat={0.3} f={f} /><Drill tip={-9.6} top={0} f={f} r={0.06} /></>),
  },
  {
    name: "A LENDA (VERMELHO)", size: "fogo + microfone no cabo · só no trecho do mito", target: [0, -23.2, 0], fit: 4.4, az: 14, el: 4, bg: "radial-gradient(circle at 50% 60%,#4a1210 0%,#120608 80%)", unit: 1,
    scene: (f) => (<><RockColumn myth={1} f={f} /><group position={[0.5, 0, 0.75]}><Microphone y={-22.6} top={-19} s={0.22} /></group></>),
  },
  {
    name: "BROCA TRICÔNICA", size: "ponta da coluna de hastes · brilha com o calor", target: [0, 0.12, 0], fit: 0.5, az: 25, el: 12, bg: STUDIO, unit: 1,
    scene: (f) => (<><group position={[-0.1, 0, 0]}><Drill tip={0} top={0.6} f={f} r={0.05} /></group><group position={[0.12, 0, 0]}><Drill tip={0} top={0.6} f={f} r={0.05} heat={1} /></group></>),
  },
  {
    name: "FÓSSEIS DE PLÂNCTON", size: "microscópicos · formas ilustrativas · lupa", target: [0, 0, 0], fit: 8, az: 0, el: 0, bg: DEEP, unit: 1,
    scene: (f) => (<><Magnifier r={3} />{([0, 1, 2, 3, 4] as const).map((k, i) => <group key={k} position={[[-1.4, 1.2, -0.2, 1.3, 0.1][i], [0.9, 0.8, -0.1, -1.0, -1.6][i], 0.3]}><Microfossil kind={k} s={0.55} spin={f * 0.02 + i} /></group>)}</>),
  },
  {
    name: "TERMÔMETRO + MOEDAS", size: "termômetro 2D (esperado × real) · moedas 3D", target: [0, 0.4, 0], fit: 4, az: 20, el: 18, bg: STUDIO, unit: 1,
    scene: () => (<group position={[0.8, 0, 0]}><Coins level={1} r={0.35} /></group>),
    over: <Thermo />,
  },
];

function Thermo() {
  return (
    <div style={{ position: "absolute", left: 40, top: 110, width: 130, height: 280, fontFamily: FONT }}>
      <div style={{ position: "absolute", left: 40, top: 0, width: 34, height: 230, borderRadius: 17, background: "#f5f0ff", border: "4px solid #0b0812" }} />
      <div style={{ position: "absolute", left: 48, top: 28, width: 18, height: 200, borderRadius: 9, background: "linear-gradient(0deg,#ff3b14,#ff8a2a)" }} />
      <div style={{ position: "absolute", left: 28, top: 210, width: 58, height: 58, borderRadius: 29, background: "#ff3b14", border: "4px solid #0b0812" }} />
      <div style={{ position: "absolute", left: 82, top: 112, color: "#9fd0ff", fontWeight: 900, fontSize: 18 }}>— 100 °C</div>
      <div style={{ position: "absolute", left: 82, top: 22, color: "#ff8a6a", fontWeight: 900, fontSize: 20 }}>— 180 °C</div>
    </div>
  );
}

const SCALE_TILE: Tile = {
  name: "RÉGUA DE ESCALA", size: "1 km = mesma medida · Everest 8.849 m · Marianas ~10.900 m · Kola 12.262 m · poço de petróleo inclinado (amarelo)",
  target: [0.05, -0.9, 0], fit: 8.2, az: 0, el: 5, bg: DEEP, unit: 1,
  scene: (f) => <ScaleBoard kola={1} oil={1} f={f} />,
};
const GLOBE_TILE: Tile = {
  name: "GLOBO EM CORTE", size: "crosta (engrossada) · manto · núcleo externo · núcleo interno · pino em Kola e na Sibéria (riscado)",
  target: [0, 0.3, 0], fit: 8.5, az: 35, el: 22, bg: DEEP, unit: 1,
  scene: () => (<group rotation={[0, -2.2, 0]}><EarthGlobe R={3} cut={1} crustGlow={0.4} /><GlobePin lon={30.6} lat={69.4} R={3} /><GlobePin lon={100} lat={62} R={3} color="#9aa1aa" cross={1} /></group>),
};

const TW = 360;
const TH = 430;
const FOV = 14;

const TileView: React.FC<{ t: Tile; w?: number; h?: number }> = ({ t, w = TW, h = TH }) => {
  const f = useCurrentFrame();
  const u = t.unit ?? 0.1;
  const fit = t.fit * u;
  const d = fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * Math.min(1, w / h));
  const pose = orbit([t.target[0] * u, t.target[1] * u, t.target[2] * u], d, t.az ?? 0, t.el ?? 5);
  const Cam = () => {
    usePose({ ...pose, fov: FOV });
    return null;
  };
  return (
    <div style={{ position: "relative", width: w, height: h, overflow: "hidden", background: t.bg, outline: "1px solid rgba(11,8,18,0.6)" }}>
      <ThreeCanvas width={w} height={h} gl={{ antialias: true }} shadows flat camera={{ fov: FOV, near: d * 0.02, far: d * 6, position: [0, 0, d] }}>
        <Cam />
        <Lighting shadowExtent={Math.max(1.5, fit * 0.8)} />
        <group scale={u}>{t.scene(f)}</group>
      </ThreeCanvas>
      {t.over}
      <div style={{ position: "absolute", left: 14, top: 10, right: 10, fontFamily: FONT, color: "#fff", textShadow: "0 2px 8px rgba(0,0,0,0.8)" }}>
        <div style={{ fontWeight: 900, fontSize: 22, letterSpacing: 0.5 }}>{t.name}</div>
        <div style={{ fontWeight: 700, fontSize: 15, color: "#f0ebff" }}>{t.size}</div>
      </div>
    </div>
  );
};

const Header: React.FC<{ title: string; sub: string }> = ({ title, sub }) => (
  <div style={{ height: 200, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: FONT, color: "#fff" }}>
    <div style={{ fontWeight: 900, fontSize: 44, letterSpacing: 2 }}>{title}</div>
    <div style={{ fontWeight: 700, fontSize: 23, color: "#c4b5fd" }}>{sub}</div>
  </div>
);

export const KolaSheet1: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="KOLA · SUPERFÍCIE" sub="para aprovar · metros reais · pessoa de 1,7 m" />
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>
      {SURFACE.map((t) => <TileView key={t.name} t={t} />)}
    </div>
  </AbsoluteFill>
);
export const KolaSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="KOLA · A DESCIDA" sub="para aprovar · coluna esquemática (furo de 23 cm exagerado)" />
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>
      {DESCENT.map((t) => <TileView key={t.name} t={t} />)}
    </div>
  </AbsoluteFill>
);
export const KolaSheet3: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="KOLA · ESCALA E PLANETA" sub="para aprovar · esquemáticos" />
    <TileView t={SCALE_TILE} w={1080} h={860} />
    <TileView t={GLOBE_TILE} w={1080} h={860} />
  </AbsoluteFill>
);
