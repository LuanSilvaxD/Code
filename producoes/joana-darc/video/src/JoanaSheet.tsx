import { ThreeCanvas } from "@remotion/three";
import { Color } from "three";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { BRAND } from "./brand";
import { usePose } from "./components/CameraController";
import { city, FranceMap, Route } from "./components/FranceMap";
import { Lighting } from "./components/Lighting";
import { Bastille, Bridge, Castle, Cathedral, Church, CourtRoom, Crown, Drawbridge, ENG, FRA, Gate, House, OrleansCity, Pyre, Rider, Scroll, Statue, ThroneHall, Tourelles, Tree } from "./components/Medieval";
import { crowdLooks, Person, type PersonLook } from "./components/Person";
import { Mascot } from "./components/Mascot";
import { FONT } from "./theme";
import { clamp, orbit, type Vec3 } from "./utils/animation";

// Folhas de design do EP. 02 (tudo em METROS, pessoa de 1,7 m para escala), exceto o mapa (u3d).
const PS = 1.7 / 1.8;
const SIL = new Color("#211a2c");
const sil = (hex: string, k: number) => new Color(hex).lerp(SIL, 1 - clamp(k, 0, 1)).getStyle();
const SKY = "linear-gradient(180deg,#a9c6dd 0%,#e7e3d8 100%)";
const HALL = "linear-gradient(180deg,#3a2c44 0%,#6b5a63 100%)";
const NIGHT = "linear-gradient(180deg,#141a33 0%,#3b2f4f 100%)";
const STUDIO = "radial-gradient(circle at 50% 40%,#3b2a52 0%,#171222 75%)";

/** Ela: camponesa (túnica), "de homem" (roupa masculina) ou de armadura com estandarte. k = 0 silhueta, 1 revelada. */
const HER: Record<"peasant" | "male" | "armor", PersonLook & { banner?: string; sword?: boolean }> = {
  peasant: { skin: "#eac3a2", hair: "#5a3b26", hairStyle: "long", tunic: "#a5473b", belt: "#4a3322", sleeves: "long", pants: "#5b4636", shoes: "#4a3322" },
  male: { skin: "#eac3a2", hair: "#5a3b26", hairStyle: "short", shirt: "#6b5a43", sleeves: "long", pants: "#3f3a52", shoes: "#3a2a1e" },
  armor: { skin: "#eac3a2", hair: "#5a3b26", hairStyle: "short", shirt: "#e9e2d0", sleeves: "long", pants: "#3a3f4a", armor: "#c3c6cc", shoes: "#3a2a1e", banner: "#f2ede0", sword: true },
};
export const Her: React.FC<{ f: number; look: keyof typeof HER; k?: number; p?: Vec3; r?: number; rim?: boolean }> = ({ f, look, k = 0, p = [0, 0, 0], r = 0.25, rim = false }) => {
  const L = HER[look];
  const c = (h?: string) => (h ? sil(h, k) : undefined);
  return (
    <group>
      <Person frame={f} position={p} rotY={r} scale={PS} seed={1} hairStyle={L.hairStyle} sleeves={L.sleeves} skin={c(L.skin)} hair={c(L.hair)} tunic={c(L.tunic)} belt={c(L.belt)} shirt={c(L.shirt)} pants={c(L.pants)} shoes={c(L.shoes)} armor={c(L.armor)} banner={L.banner ? sil(L.banner, Math.max(k, 0.55)) : undefined} sword={L.sword} />
      {rim && k < 0.5 ? <pointLight position={[p[0] - 0.5, 2.6, p[2] - 1.0]} intensity={1.6} distance={2.6} decay={2} color="#a78bfa" /> : null}
    </group>
  );
};
const QMark: React.FC<{ x: string; y: string }> = ({ x, y }) => (
  <div style={{ position: "absolute", left: x, top: y, transform: "translate(-50%,-50%)", fontFamily: FONT, fontWeight: 900, fontSize: 64, color: "#c4b5fd", textShadow: "0 0 18px #8b5cf6, 0 3px 6px #000" }}>?</div>
);

type Tile = { name: string; size: string; target: Vec3; fit: number; az?: number; el?: number; bg: string; unit?: number; scene: (f: number) => React.ReactNode; over?: React.ReactNode };

const Floor: React.FC<{ w: number; d?: number; c?: string }> = ({ w, d, c = "#8aa36a" }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[w, 0.1, d ?? w * 0.5]} />
    <meshStandardMaterial color={c} roughness={1} />
  </mesh>
);
const Ref: React.FC<{ f: number; p: Vec3; i?: number }> = ({ f, p, i = 0 }) => <Person {...crowdLooks(6, "ref")[i]} frame={f} position={p} scale={PS} rotY={0.3} seed={i + 30} />;
const SOLDIER = (side: "fr" | "en", i: number): PersonLook & { tabard: string; helmet: "kettle"; spear: boolean } => ({ ...crowdLooks(8, side)[i], tabard: side === "fr" ? FRA : ENG, helmet: "kettle", spear: true, sleeves: "long", pants: "#3a3f4a" });

const CHARS: Tile[] = [
  {
    name: "ELA · CAMPONESA", size: "silhueta com \"?\" até a revelação · 1,7 m", target: [0, 0.95, 0], fit: 3.4, el: 6, bg: STUDIO,
    scene: (f) => (<><Floor w={8} c="#4a3d55" /><Her f={f} look="peasant" k={0} p={[-0.7, 0, 0]} rim /><Her f={f} look="peasant" k={1} p={[0.7, 0, 0]} r={-0.25} /></>),
    over: <QMark x="32%" y="34%" />,
  },
  {
    name: "ELA · \"VESTIDA DE HOMEM\"", size: "a viagem até o herdeiro (s6)", target: [0, 0.95, 0], fit: 3.4, el: 6, bg: STUDIO,
    scene: (f) => (<><Floor w={8} c="#4a3d55" /><Her f={f} look="male" k={0} p={[-0.7, 0, 0]} rim /><Her f={f} look="male" k={1} p={[0.7, 0, 0]} r={-0.25} /></>),
    over: <QMark x="32%" y="34%" />,
  },
  {
    name: "ELA · ARMADURA + ESTANDARTE", size: "estandarte branco · espada embainhada", target: [0.2, 1.3, 0], fit: 4.4, el: 6, bg: STUDIO,
    scene: (f) => (<><Floor w={9} c="#4a3d55" /><Her f={f} look="armor" k={0} p={[-1.0, 0, 0]} rim /><Her f={f} look="armor" k={1} p={[1.0, 0, 0]} r={-0.25} /></>),
    over: <QMark x="27%" y="40%" />,
  },
  {
    name: "CARLOS", size: "herdeiro (manto azul) → rei coroado", target: [0, 0.95, 0], fit: 3.4, el: 6, bg: HALL,
    scene: (f) => (<><Floor w={8} c="#8f7f6a" /><Person frame={f} position={[-0.7, 0, 0]} rotY={0.25} scale={PS} skin="#eccaa8" hair="#3b2a22" shirt="#2c4a8a" sleeves="long" pants="#2a2f45" shoes="#1d1a22" cape="#2f56a8" seed={2} /><Person frame={f} position={[0.7, 0, 0]} rotY={-0.25} scale={PS} skin="#eccaa8" hair="#3b2a22" shirt="#2c4a8a" sleeves="long" pants="#2a2f45" shoes="#1d1a22" cape="#2f56a8" crown={1} seed={2} /></>),
  },
  {
    name: "CAPITÃO + TEÓLOGOS + BISPO", size: "batinas · bispo de mitra (tribunal)", target: [0, 0.95, 0], fit: 4.6, el: 6, bg: HALL,
    scene: (f) => (<><Floor w={10} c="#6e5c4a" /><Person frame={f} position={[-1.5, 0, 0]} rotY={0.3} scale={PS} {...crowdLooks(4, "cap")[0]} tabard="#6b5a43" sword helmet="kettle" sleeves="long" seed={5} /><Person frame={f} position={[-0.5, 0, 0]} rotY={0.1} scale={PS} {...crowdLooks(4, "teo")[1]} robe="#2a2430" hairStyle="bald" seed={6} /><Person frame={f} position={[0.45, 0, 0]} rotY={-0.1} scale={PS} {...crowdLooks(4, "teo")[2]} robe="#5a4632" seed={7} /><Person frame={f} position={[1.45, 0, 0]} rotY={-0.3} scale={PS} {...crowdLooks(4, "teo")[3]} robe="#8a2f3a" mitre="#efe6cf" cape="#e9dfc6" seed={8} /></>),
  },
  {
    name: "SOLDADOS", size: "franceses (azul) × ingleses (terracota)", target: [0, 1.0, 0], fit: 4.6, el: 6, bg: SKY,
    scene: (f) => (<><Floor w={10} />{[0, 1].map((i) => <Person key={`f${i}`} frame={f} position={[-1.6 + i * 0.8, 0, 0]} rotY={0.4} scale={PS} {...SOLDIER("fr", i)} seed={10 + i} />)}{[0, 1].map((i) => <Person key={`e${i}`} frame={f} position={[0.8 + i * 0.8, 0, 0]} rotY={-0.4} scale={PS} {...SOLDIER("en", i)} seed={20 + i} />)}</>),
  },
  {
    name: "CAVALEIROS (CAVALO APROVADO)", size: "escolta de 6 · viagem noturna (s6)", target: [0, 1.3, 0], fit: 7, az: 70, el: 8, bg: NIGHT,
    scene: (f) => (<><Floor w={14} c="#3d4a3a" /><Rider f={f} p={[-1.4, 0, 0.6]} walk={1} horse="#e9e4da" person={{ ...HER.male, skin: sil("#eac3a2", 0), hair: sil("#5a3b26", 0), shirt: sil("#6b5a43", 0), pants: sil("#3f3a52", 0), shoes: sil("#3a2a1e", 0), scale: PS }} /><Rider f={f} p={[1.4, 0, -0.6]} walk={1} horse="#6b4a33" seed={4} person={{ ...SOLDIER("fr", 2), scale: PS }} /></>),
  },
  {
    name: "MASCOTE NO MUNDO", size: "visitante das estações · 1,6 m", target: [0, 0.95, 0], fit: 3.4, el: 6, bg: SKY,
    scene: (f) => (<><Floor w={8} /><group position={[-0.6, 0, 0]} scale={(1.6 / 1.65)}><Mascot frame={f} /></group><Ref f={f} p={[0.6, 0, 0]} /></>),
  },
  {
    name: "ACESSÓRIOS", size: "coroa · pergaminho com selo", target: [0, 0.8, 0], fit: 3.2, el: 12, bg: HALL,
    scene: () => (<><Floor w={6} c="#8f7f6a" /><Crown p={[-0.6, 0.6, 0]} s={0.6} /><Scroll p={[0.6, 0.9, 0]} s={0.6} /></>),
  },
];

const SETS: Tile[] = [
  {
    name: "VILAREJO (SEM NOME)", size: "casas de enxaimel · igreja · árvore", target: [0, 4, 0], fit: 46, az: 25, el: 22, bg: SKY,
    scene: (f) => (<><Floor w={60} />{[[-12, -6], [-4, -9], [5, -7], [13, -3], [-14, 5]].map(([x, z], i) => <House key={i} p={[x, 0, z]} seed={i} rotY={(i - 2) * 0.25} />)}<Church p={[3, 0, 4]} rotY={-0.4} /><Tree p={[-6, 0, 6]} s={1.2} /><Tree p={[14, 0, 8]} /><Ref f={f} p={[-3, 0, 9]} /></>),
  },
  {
    name: "PORTÃO + CASTELO", size: "torres 13 m · muralha 8 m · grade levadiça", target: [0, 8, 0], fit: 52, az: 22, el: 18, bg: SKY,
    scene: (f) => (<><Floor w={70} /><Castle gateClose={0.5} /><Ref f={f} p={[1.5, 0, 14]} /></>),
  },
  {
    name: "PONTE LEVADIÇA (COMPIÈGNE)", size: "fosso · correntes · erguendo", target: [0, 4, 4], fit: 22, az: 30, el: 18, bg: SKY,
    scene: (f) => (<><Floor w={30} /><Gate p={[0, 0, 0]} /><Drawbridge p={[0, 0, 1.6]} raise={0.25} /><Ref f={f} p={[3, 0, 11]} /></>),
  },
  {
    name: "SALÃO DO TRONO (CHINON)", size: "em corte · trono · estandartes · braseiros", target: [0, 3, 0], fit: 17, az: 18, el: 20, bg: HALL,
    scene: (f) => (<><ThroneHall f={f} /><Person frame={f} position={[0, 1.15, -3.9]} scale={PS} skin="#eccaa8" hair="#3b2a22" shirt="#2c4a8a" sleeves="long" pants="#2a2f45" cape="#2f56a8" seed={2} /><Her f={f} look="male" p={[0, 0.3, 2]} r={Math.PI} /></>),
  },
  {
    name: "TRIBUNAL (RUÃO)", size: "bancadas em arco · mesa · banquinho da ré", target: [0, 2.5, 0], fit: 22, az: 15, el: 32, bg: HALL,
    scene: (f) => (<><CourtRoom />{Array.from({ length: 12 }, (_, i) => { const row = i % 3; const R = 5.2 + row * 1.6; const a = Math.PI * (0.1 + (0.8 * Math.floor(i / 3)) / 3); return <Person key={i} frame={f} position={[Math.cos(a) * -R, 0.75 + row * 1.2, -Math.sin(a) * R + 2]} rotY={Math.atan2(Math.cos(a) * R, Math.sin(a) * R - 2) + Math.PI} scale={PS} {...crowdLooks(12, "juiz")[i]} robe={i % 2 ? "#2a2430" : "#4a3a2c"} seed={40 + i} />; })}<Person frame={f} position={[0, 0.3, -4.2]} scale={PS} robe="#8a2f3a" mitre="#efe6cf" seed={8} /><Her f={f} look="male" p={[0, 0.3, 3.4]} r={Math.PI} /></>),
  },
  {
    name: "CATEDRAL DE REIMS", size: "estilizada · ~34 m · rosácea · coroação", target: [0, 14, -6], fit: 62, az: 22, el: 12, bg: SKY,
    scene: (f) => (<><Floor w={80} c="#a39a86" /><Cathedral glow={0.6} /><Ref f={f} p={[2, 0, 8]} /></>),
  },
  {
    name: "FOGUEIRA (SÓBRIA)", size: "estaca vazia · luz e fumaça · sem corpo", target: [0, 3.5, 0], fit: 13, az: 15, el: 10, bg: NIGHT,
    scene: (f) => (<><Floor w={20} c="#5a5048" /><Pyre f={f} fire={1} /><Ref f={f} p={[3.4, 0, 2]} /></>),
  },
  {
    name: "ESTÁTUA DOURADA (FIM)", size: "pedestal ~3,4 m · cavalo + ela", target: [0, 3.8, 0], fit: 10, az: 30, el: 6, bg: SKY,
    scene: (f) => (<><Floor w={16} c="#a39a86" /><Statue f={f} glow={1} /><Ref f={f} p={[-3, 0, 1.5]} /></>),
  },
  {
    name: "BASTILHA INGLESA", size: "paliçada de troncos · torre de madeira", target: [0, 4, 0], fit: 22, az: 25, el: 18, bg: SKY,
    scene: (f) => (<><Floor w={30} /><Bastille f={f} /><Person frame={f} position={[8.5, 0, 4]} rotY={0.4} scale={PS} {...SOLDIER("en", 3)} seed={23} /></>),
  },
];

const MAP_TILE: Tile = {
  name: "MAPA-MAQUETE · NORTE DA FRANÇA, 1429", size: "contorno real (Natural Earth) · fronteiras aproximadas · distâncias fora de escala", target: [0, 0, 0.3], fit: 25, az: 0, el: 58, bg: STUDIO, unit: 1,
  scene: () => (
    <>
      <FranceMap eng={1} fra={1} />
      <Route pts={[city("village"), city("vaucouleurs", 0.4, -0.7), city("chinon"), city("orleans"), city("reims"), city("compiegne"), city("rouen")]} draw={1} />
      {(["village", "chinon", "orleans", "reims", "compiegne", "rouen", "paris"] as const).map((k) => (
        <mesh key={k} position={[city(k)[0], city(k)[1] + 0.08, city(k)[2]]}>
          <cylinderGeometry args={[0.3, 0.3, 0.12, 14]} />
          <meshStandardMaterial color="#f5f0ff" emissive="#8b5cf6" emissiveIntensity={0.6} />
        </mesh>
      ))}
    </>
  ),
};

const ORLEANS_TILE: Tile = {
  name: "ORLÉANS (ESTAÇÃO PRINCIPAL)", size: "muralha · ponte no Loire · Tourelles · 3 bastilhas", target: [0, 0, 14], fit: 120, az: 20, el: 42, bg: SKY,
  scene: (f) => (
    <>
      <Floor w={150} d={150} />
      <mesh position={[0, 0.02, 24 + 14]} receiveShadow>
        <boxGeometry args={[150, 0.06, 16]} />
        <meshStandardMaterial color="#5d9cc9" roughness={0.4} />
      </mesh>
      <OrleansCity f={f} forts={1} />
      {Array.from({ length: 5 }, (_, i) => <Person key={i} frame={f} position={[-6 + i * 1.4, 0, 30 + (i % 2)]} rotY={Math.PI} scale={PS} {...SOLDIER("fr", i % 4)} seed={60 + i} />)}
    </>
  ),
};

const TW = 360;
const TH = 430;
const FOV = 14;

const TileView: React.FC<{ t: Tile; w?: number; h?: number }> = ({ t, w = TW, h = TH }) => {
  const f = useCurrentFrame();
  const u = t.unit ?? 0.1;
  const fit = t.fit * u;
  const d = fit / (2 * Math.tan(((FOV / 2) * Math.PI) / 180) * (w / h));
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

export const JoanaSheet1: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="EP. 02 · PERSONAGENS" sub="para aprovar · pessoa de 1,7 m · silhueta × revelada" />
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>
      {CHARS.map((t) => <TileView key={t.name} t={t} />)}
    </div>
  </AbsoluteFill>
);
export const JoanaSheet2: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="EP. 02 · CENÁRIOS" sub="para aprovar · régua única: pessoa de 1,7 m em cada quadro" />
    <div style={{ display: "grid", gridTemplateColumns: `${TW}px ${TW}px ${TW}px` }}>
      {SETS.map((t) => <TileView key={t.name} t={t} />)}
    </div>
  </AbsoluteFill>
);
export const JoanaSheet3: React.FC = () => (
  <AbsoluteFill style={{ background: BRAND.colors.umbra }}>
    <Header title="EP. 02 · MAPA E ORLÉANS" sub="o cenário persistente · para aprovar" />
    <TileView t={MAP_TILE} w={1080} h={860} />
    <TileView t={ORLEANS_TILE} w={1080} h={860} />
  </AbsoluteFill>
);

// evita aviso de import não usado em versões sem a ponte avulsa
void Bridge;
void Tourelles;
