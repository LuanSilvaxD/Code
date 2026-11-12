import { useCurrentFrame } from "remotion";
import { Color } from "three";
import { BRAND } from "../brand";
import { ST, U, PS, LAND_H, loc, ROUTE, CAPTIVE, MISSION, type Station } from "../data/places";
import { sceneIndexAt, track } from "../data/scenes";
import { LIGHTING } from "../theme";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { FranceMap, Route } from "./FranceMap";
import { Her, type HerLook } from "./Her";
import { MascotFromTracks } from "./Mascot";
import { Arrow, Bastille, Castle, Cathedral, Church, CourtRoom, Crown, Drawbridge, ENG, FRA, Gate, House, OrleansCity, Pyre, Rider, Scroll, Statue, ThroneHall, Tower, Tree } from "./Medieval";
import { crowdLooks, Person, type PersonLook } from "./Person";

// Cenário persistente do EP. 02: mapa-maquete + estações em miniatura (régua U = 0,04 u3d/m) + personagens.
// Tudo lê trilhas no frame GLOBAL (data/scenes.ts). Cada estação: <Sta st="..."> com conteúdo em METROS.

const SCN = (f: number) => sceneIndexAt(f) + 1; // número da cena atual (1..18)
const Sta: React.FC<{ st: Station; children: React.ReactNode; rotY?: number }> = ({ st, children, rotY = 0 }) => (
  <group position={ST[st]} rotation={[0, rotY, 0]} scale={U}>
    {children}
  </group>
);
/** Base da miniatura: placa de grama (em METROS) do topo do mapa até o chão da estação. */
const PLINTH: Partial<Record<Station, [number, number, number, number, string?]>> = {
  village: [46, 36, 0, 2], vaucouleurs: [44, 46, 0, 4], chinon: [30, 26, 0, -2], orleans: [112, 120, 0, 10],
  reims: [36, 48, 0, -9], compiegne: [58, 30, 0, 6], rouen: [30, 28, 0, -1, "#9c9076"], pyre: [32, 32, 0, 0, "#9c9076"], paris: [20, 18, 0, 1],
};
const Plinths: React.FC<{ f: number }> = ({ f }) => (
  <>
    {(Object.keys(PLINTH) as Station[]).map((k) => {
      if (k === "paris" && track("statue.show", f) < 0.5) return null;
      const [w, d, x, z, c] = PLINTH[k]!;
      const h = 0.045 / U + 0.2;
      return (
        <Sta key={k} st={k}>
          <mesh position={[x, -h / 2 + 0.02, z]} receiveShadow castShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial color={c ?? "#93ad6c"} roughness={1} />
          </mesh>
        </Sta>
      );
    })}
  </>
);
const P1 = 1.7 / 1.8; // pessoa de 1,7 m em METROS (dentro de <Sta>)

const SOLDIER = (side: "fr" | "en" | "bg", i: number): PersonLook & { tabard: string; helmet: "kettle" } => ({
  ...crowdLooks(10, side)[i % 10],
  tabard: side === "fr" ? FRA : side === "en" ? ENG : "#8a5a2a",
  helmet: "kettle",
  sleeves: "long",
  pants: "#3a3f4a",
});

/** Luz que acompanha a câmera: sombras nítidas tanto no mapa inteiro quanto num close de 0,5 u3d. */
export const JoanaLighting: React.FC = () => {
  const f = useCurrentFrame();
  const pose = cameraPoseAt(f);
  const d = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const ext = clamp(d * 0.55, 0.5, 16);
  const night = track("sky.night", f);
  const dim = track("bg.dim", f);
  const k = 1 - 0.5 * night - 0.35 * dim;
  const dir = new Color(LIGHTING.key.color).lerp(new Color("#9fb0ff"), night * 0.7);
  const t = pose.target;
  const L: Vec3 = [t[0] + ext * 1.2, t[1] + ext * 2.2, t[2] + ext * 1.4];
  return (
    <>
      <ambientLight intensity={LIGHTING.ambient * k} />
      <hemisphereLight args={[LIGHTING.hemisphere.sky, LIGHTING.hemisphere.ground, LIGHTING.hemisphere.intensity * k]} />
      <directionalLight
        position={L}
        target-position={t}
        intensity={LIGHTING.key.intensity * k}
        color={dir}
        castShadow
        shadow-mapSize-width={LIGHTING.shadowMapSize}
        shadow-mapSize-height={LIGHTING.shadowMapSize}
        shadow-camera-left={-ext}
        shadow-camera-right={ext}
        shadow-camera-top={ext}
        shadow-camera-bottom={-ext}
        shadow-camera-near={0.01}
        shadow-camera-far={ext * 8}
        shadow-bias={-0.0004}
        shadow-normalBias={0.02 * Math.max(0.05, ext / 4)}
        shadow-radius={3}
      />
      <directionalLight position={LIGHTING.fill.position} intensity={LIGHTING.fill.intensity * k} color={LIGHTING.fill.color} />
      <directionalLight position={LIGHTING.rim.position} intensity={LIGHTING.rim.intensity} color={LIGHTING.rim.color} />
    </>
  );
};

/** Pedestal retangular da marca sob o mapa (fio de luz roxa na frente). */
const Pedestal: React.FC = () => {
  const { umbra2, accent, core } = BRAND.colors;
  const w = 25.6;
  const dpt = 19.6;
  return (
    <group position={[0, -0.36, -0.33]}>
      <mesh receiveShadow>
        <boxGeometry args={[w, 0.6, dpt]} />
        <meshStandardMaterial color={umbra2} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.0, dpt / 2 + 0.02]}>
        <boxGeometry args={[w, 0.04, 0.02]} />
        <meshBasicMaterial color={core} />
      </mesh>
      <mesh position={[0, 0.0, dpt / 2 + 0.05]}>
        <boxGeometry args={[w + 0.1, 0.14, 0.04]} />
        <meshBasicMaterial color={accent} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------ ELA: onde está em cada cena
type HerState = { st: Station; x: number; z: number; y?: number; r: number; look: HerLook; banner?: boolean; walk?: number; kneel?: number; up?: number; k?: number; rim?: number };
const herState = (f: number): HerState | null => {
  const n = SCN(f);
  const armor = track("her.armor", f) > 0.5;
  if (n === 1) return { st: "orleans", x: -10, z: 29, r: 0.15, look: "armor", rim: 1 };
  if (n === 2 || n === 4) return { st: "village", x: -3, z: 9, r: 0.35, look: "peasant", rim: 1 };
  if (n === 5 || n === 6) {
    const w = track("her.walk", f);
    const ins = track("her.insist", f);
    return { st: "vaucouleurs", x: 0.5, z: lerp(24, 15.5, w) - ins * 1.2, r: Math.PI, look: "peasant", walk: w > 0 && w < 1 ? 1 : ins > 0 && ins < 1 ? 1 : 0, rim: 0.6 };
  }
  if (n === 7) return { st: "chinon", x: 0, z: 1.5, y: 0.3, r: Math.PI, look: armor ? "armor" : "male", banner: armor, rim: 0.6 };
  if (n === 9 || n === 10) return { st: "orleans", x: -10, z: 29, r: 0.15, look: "armor", kneel: track("her.down", f), rim: 1 };
  if (n === 11) return { st: "reims", x: 2.4, z: 7.2, r: -0.25, look: "armor", rim: 0.6 };
  if (n === 12) return { st: "compiegne", x: 0, z: 12, r: 0.2, look: "armor", banner: track("captors.close", f) < 0.6, rim: 0.6 };
  if (n === 13 || n === 14) return { st: "rouen", x: 0, z: 3.4, y: 0.3, r: Math.PI, look: "male", rim: 1 };
  if (n === 15) return { st: "pyre", x: 0, z: 1.2, y: 1.2, r: 0, look: "male", up: track("her.ascend", f), rim: 1 };
  if (n >= 17) return { st: "paris", x: 0, z: 4.2, r: 0.1, look: "armor", k: track("her.reveal", f), rim: 1 };
  return null;
};

/** Ponto da cabeça dela (u3d) — para o "?" 2D da camada de cima. null se ela não está em cena. */
export const herHead = (f: number): Vec3 | null => {
  const s = herState(f);
  if (!s || (s.up ?? 0) > 0.6) return null;
  return loc(s.st, s.x, s.z, (s.y ?? 0) + 2.15 + (s.up ?? 0) * 6);
};

const HerInWorld: React.FC<{ f: number }> = ({ f }) => {
  const s = herState(f);
  if (!s) return null;
  const up = s.up ?? 0;
  const kneel = s.kneel ?? 0;
  const sc = P1 * (1 - up * 0.85);
  return (
    <Sta st={s.st}>
      <group position={[s.x, (s.y ?? 0) + up * 6 - kneel * 0.45, s.z]} rotation={[kneel * -0.35, 0, 0]}>
        <Her f={f} look={s.look} k={s.k ?? 0} r={s.r} scale={sc} banner={s.banner ?? true} walk={s.walk ?? 0} rim={s.rim} u={U} />
        {track("arrow.hit", f) > 0.5 && SCN(f) === 9 ? <Arrow p={[0.18, 1.32, 0.12]} rot={[0, 2.4, 0.5]} /> : null}
        {track("her.spot", f) > 0.01 ? <pointLight position={[0, 3.2, 1.2]} intensity={2.2 * track("her.spot", f)} distance={7 * U} decay={0} color="#ffe2b8" /> : null}
      </group>
      {up > 0.01 ? (
        <mesh position={[s.x, (s.y ?? 0) + 7, s.z]}>
          <cylinderGeometry args={[0.6, 0.9, 14, 12, 1, true]} />
          <meshBasicMaterial color="#e9e0ff" transparent opacity={0.35 * Math.sin(Math.PI * clamp(up, 0, 1))} side={2} depthWrite={false} />
        </mesh>
      ) : null}
    </Sta>
  );
};

// ------------------------------------------------------------------ estações
const Village: React.FC<{ f: number }> = ({ f }) => {
  const beam = track("voice.beam", f);
  return (
    <Sta st="village">
      {[[-12, -6, 0.2], [-4, -10, -0.1], [6, -8, 0.15], [13, -2, -0.3], [-14, 4, 0.4], [12, 6, -0.2]].map(([x, z, r], i) => <House key={i} p={[x, 0, z]} seed={i + 1} rotY={r} />)}
      <Church p={[3, 0, -1]} rotY={-0.25} />
      <Tree p={[-6, 0, 8]} s={1.1} seed={1} />
      <Tree p={[-16, 0, 12]} s={0.9} seed={2} />
      <Tree p={[16, 0, 12]} seed={3} />
      {beam > 0.01 ? (
        <mesh position={[-3, 9, 9]}>
          <cylinderGeometry args={[0.6, 2.4, 18, 16, 1, true]} />
          <meshBasicMaterial color="#efe6ff" transparent opacity={0.32 * beam} side={2} depthWrite={false} />
        </mesh>
      ) : null}
      {beam > 0.01 ? <pointLight position={[-3, 6, 9]} intensity={1.6 * beam} distance={12 * U} decay={0} color="#e9dcff" /> : null}
      {/* fumaça das chaminés */}
      {[0, 1, 2].map((i) => {
        const t = ((f * 0.01 + i / 3) % 1);
        return (
          <mesh key={i} position={[-12 + 2.4 + t * 1.5, 9 + t * 6, -6 - 1.2]} scale={0.6 + t * 1.4}>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color="#d8d4ce" transparent opacity={0.45 * (1 - t)} roughness={1} />
          </mesh>
        );
      })}
    </Sta>
  );
};

const Vaucouleurs: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  const point = track("captain.point", f);
  return (
    <Sta st="vaucouleurs">
      <Castle gateClose={track("gate.close", f)} />
      {n === 5 || n === 6 ? (
        <>
          <Person frame={f} position={[-1.2, 0, 12.8]} rotY={0.2} scale={P1} {...SOLDIER("fr", 7)} tabard="#6b5a43" sword point={point} seed={5} />
          <Person frame={f} position={[3.2, 0, 11.6]} rotY={-0.3} scale={P1} {...SOLDIER("fr", 3)} spear seed={6} />
        </>
      ) : null}
    </Sta>
  );
};

/** Escolta (s6): 7 cavaleiros na rota Vaucouleurs → Chinon (riders.x 0..1). */
const Riders: React.FC<{ f: number }> = ({ f }) => {
  if (SCN(f) !== 6) return null;
  const x = track("riders.x", f);
  if (x <= 0.001) return null;
  const a = loc("vaucouleurs", 0, 20);
  const b = loc("chinon", 6, 20);
  const dir = Math.atan2(-(b[2] - a[2]), b[0] - a[0]);
  return (
    <group>
      {Array.from({ length: 7 }, (_, i) => {
        const t = clamp(x - i * 0.012, 0, 1);
        const p: Vec3 = [lerp(a[0], b[0], t), LAND_H + 0.02 + Math.sin(t * Math.PI) * 0.01, lerp(a[2], b[2], t) + (i % 2 ? 0.05 : -0.05)];
        const herRide = i === 1;
        return (
          <group key={i} position={p} rotation={[0, dir, 0]} scale={U}>
            <Rider f={f + i * 7} walk={1} horse={herRide ? "#e9e4da" : ["#6b4a33", "#3d2c22", "#8a6a4a"][i % 3]} seed={i} person={herRide ? { ...herPersonMale, scale: P1 } : { ...SOLDIER("fr", i), spear: true, scale: P1 }} />
          </group>
        );
      })}
    </group>
  );
};
const herPersonMale = { skin: "#211a2c", hair: "#211a2c", hairStyle: "short" as const, shirt: "#211a2c", sleeves: "long" as const, pants: "#211a2c", shoes: "#211a2c" };

const Chinon: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  const slump = track("charles.slump", f);
  const theo = track("theologians.show", f);
  return (
    <Sta st="chinon">
      <ThroneHall f={f} />
      <Tower p={[-9, 0, -8]} h={16} r={3} />
      <Tower p={[9, 0, -8]} h={13} r={2.6} />
      <Person frame={f} position={[0, 1.15 - slump * 0.08, -3.9]} scale={P1} skin="#eccaa8" hair="#3b2a22" shirt="#2c4a8a" sleeves="long" pants="#2a2f45" cape="#2f56a8" look={slump * 0.3} seed={2} />
      {n === 3 && track("treaty.show", f) > 0.01 ? <Scroll p={[2.4, 2.6, -2.2]} s={1.3 * clamp(track("treaty.show", f), 0, 1.2)} /> : null}
      {n === 7 && theo > 0.01
        ? [0, 1, 2, 3].map((i) => {
            const a = -Math.PI / 2 + (i - 1.5) * 0.7;
            const R = 2.6;
            return <Person key={i} frame={f} position={[Math.cos(a) * R, 0.3, 1.5 - Math.sin(a) * R]} rotY={Math.atan2(-Math.cos(a), Math.sin(a))} scale={P1 * clamp(theo, 0, 1)} {...crowdLooks(4, "teo")[i]} robe={["#2a2430", "#5a4632", "#3a3040", "#4a3a2c"][i]} hairStyle={i === 0 ? "bald" : "short"} seed={30 + i} />;
          })
        : null}
    </Sta>
  );
};

/** Coroa voando do herdeiro para o lado inglês (s3). */
const FlyingCrown: React.FC<{ f: number }> = ({ f }) => {
  const v = track("crown.float", f);
  if (v <= 0.001 || v >= 0.999 || SCN(f) !== 3) return null;
  const a = loc("chinon", 0, -4, 3);
  const b = loc("rouen", 0, 0, 8);
  const p: Vec3 = [lerp(a[0], b[0], v), lerp(a[1], b[1], v) + Math.sin(v * Math.PI) * 2.2, lerp(a[2], b[2], v)];
  return <Crown p={p} s={0.18 + Math.sin(v * Math.PI) * 0.25} />;
};

const Orleans: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  const forts = track("forts.fall", f);
  const ring = track("siege.ring", f);
  const army = track("army.show", f);
  const convoy = track("convoy.enter", f);
  return (
    <Sta st="orleans">
      {/* Loire da miniatura (cai sobre o Loire do mapa) */}
      <mesh position={[0, 0.03, 42]} receiveShadow>
        <boxGeometry args={[110, 0.08, 15]} />
        <meshStandardMaterial color="#5d9cc9" roughness={0.4} />
      </mesh>
      <OrleansCity f={f} forts={forts} tourelles={forts >= 2.9 ? 1 : 0} showBastilles={false} />
      {[[-38, -9.6], [38, -4.8], [21.6, 54]].map(([x, z], i) => {
        const k = clamp(ring * 3 - i, 0, 1);
        return k > 0.01 ? (
          <group key={i} position={[x, 0, z]} scale={[1, k, 1]}>
            <Bastille f={f} french={forts > i + 0.5 ? 1 : 0} />
          </group>
        ) : null;
      })}
      {/* ingleses em volta das bastilhas (s8–s9, até o forte cair) */}
      {(n === 8 || n === 9) && ring > 0.5
        ? [[-38, -9.6], [38, -4.8], [21.6, 54]].flatMap(([x, z], i) =>
            forts > i + 0.5 ? [] : [0, 1, 2].map((j) => <Person key={`${i}${j}`} frame={f} position={[x + Math.cos(j * 2.1) * 9, 0, z + Math.sin(j * 2.1) * 9]} rotY={Math.atan2(-x, -z)} scale={P1} {...SOLDIER("en", i * 3 + j)} spear seed={70 + i * 3 + j} />),
          )
        : null}
      {/* exército dela (s1) e comboio (s9) */}
      {n === 1 && army > 0.01
        ? Array.from({ length: 6 }, (_, i) => <Person key={`a${i}`} frame={f} position={[-12.5 + (i % 3) * 2.4 - (1 - army) * 6, 0, 26.5 - Math.floor(i / 3) * 2]} rotY={0.15} scale={P1} {...SOLDIER("fr", i)} spear seed={50 + i} />)
        : null}
      {n === 9 || n === 10
        ? Array.from({ length: 8 }, (_, i) => {
            const x = lerp(-50, -15, convoy) + (i % 4) * 2.4;
            return <Person key={`c${i}`} frame={f} position={[x, 0, 27 - Math.floor(i / 4) * 2]} rotY={convoy < 1 ? Math.PI / 2 : 0.2} walk={convoy > 0 && convoy < 1 ? 1 : 0} scale={P1} {...SOLDIER("fr", i + 2)} spear seed={60 + i} />;
          })
        : null}
    </Sta>
  );
};

/** Setas vermelhas no mapa: "se Orléans cair, o sul fica aberto" (s8). */
const SouthArrows: React.FC<{ f: number }> = ({ f }) => {
  const v = track("arrows.south", f);
  if (v <= 0.01 || SCN(f) !== 8) return null;
  const o = loc("orleans", 0, 50);
  return (
    <group>
      {[-1.4, 0, 1.4].map((dx, i) => {
        const len = 1.3 * clamp(v * 1.4 - i * 0.15, 0, 1);
        return (
          <group key={i} position={[o[0] + dx, LAND_H + 0.08, o[2] + 0.4]} rotation={[0, -dx * 0.25, 0]}>
            <mesh position={[0, 0, len / 2]}>
              <boxGeometry args={[0.1, 0.04, len]} />
              <meshStandardMaterial color="#e2563f" emissive="#e2563f" emissiveIntensity={0.4} />
            </mesh>
            <mesh position={[0, 0, len + 0.18]} rotation={[Math.PI / 2, 0, 0]}>
              <coneGeometry args={[0.2, 0.32, 3]} />
              <meshStandardMaterial color="#e2563f" emissive="#e2563f" emissiveIntensity={0.4} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

const Reims: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  const crown = n >= 12 ? 1 : n === 11 ? track("crown.lower", f) : 0;
  return (
    <Sta st="reims">
      <Cathedral glow={track("cathedral.glow", f)} />
      {/* praça na frente da catedral */}
      <mesh position={[0, 0.05, 9]} receiveShadow>
        <boxGeometry args={[30, 0.1, 14]} />
        <meshStandardMaterial color="#b9ad96" roughness={1} />
      </mesh>
      {n === 11 ? (
        <>
          <mesh position={[0, 0.3, 6.5]} receiveShadow castShadow>
            <boxGeometry args={[7, 0.5, 3.4]} />
            <meshStandardMaterial color="#7a2f3b" roughness={0.8} />
          </mesh>
          <Person frame={f} position={[0, 0.55, 6.6]} scale={P1} skin="#eccaa8" hair="#3b2a22" shirt="#2c4a8a" sleeves="long" pants="#2a2f45" cape="#2f56a8" crown={crown} seed={2} />
          <Person frame={f} position={[-1.6, 0.55, 6.2]} rotY={0.6} scale={P1} robe="#e9dfc6" mitre="#efe6cf" {...crowdLooks(3, "arc")[0]} seed={9} />
          {Array.from({ length: 12 }, (_, i) => {
            const a = Math.PI * (0.15 + (0.7 * i) / 11);
            const R = 8 + (i % 2) * 1.6;
            return <Person key={i} frame={f} position={[Math.cos(a) * R, 0.1, 6.6 + Math.sin(a) * R * 0.7]} rotY={Math.atan2(-Math.cos(a), -Math.sin(a))} scale={P1} {...crowdLooks(12, "reims")[i]} sleeves="long" wave={crown > 0.95 && i % 3 === 0 ? 1 : 0} seed={80 + i} />;
          })}
        </>
      ) : null}
    </Sta>
  );
};

const Compiegne: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  const cl = track("captors.close", f);
  return (
    <Sta st="compiegne">
      <Wall2 />
      <Gate p={[0, 0, 0]} />
      <Drawbridge p={[0, 0, 1.6]} raise={track("drawbridge.raise", f)} />
      {n === 12
        ? Array.from({ length: 5 }, (_, i) => {
            const a = Math.PI * 0.2 + (i / 4) * Math.PI * 1.6 + Math.PI;
            const R = lerp(9, 2.2, cl);
            return <Person key={i} frame={f} position={[Math.cos(a) * R, 0, 12 + Math.sin(a) * R]} rotY={Math.atan2(-Math.cos(a), -Math.sin(a))} walk={cl > 0 && cl < 1 ? 1 : 0} scale={P1} {...SOLDIER("bg", i)} spear seed={90 + i} />;
          })
        : null}
    </Sta>
  );
};
const Wall2: React.FC = () => (
  <>
    <mesh position={[-14, 4, -0.5]} castShadow receiveShadow><boxGeometry args={[18, 8, 1.6]} /><meshStandardMaterial color="#b9ab93" roughness={0.9} flatShading /></mesh>
    <mesh position={[14, 4, -0.5]} castShadow receiveShadow><boxGeometry args={[18, 8, 1.6]} /><meshStandardMaterial color="#b9ab93" roughness={0.9} flatShading /></mesh>
    <Tower p={[-23, 0, -0.5]} h={11} r={2.2} />
    <Tower p={[23, 0, -0.5]} h={11} r={2.2} />
  </>
);

const Rouen: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  const fill = n === 13 || n === 14 ? track("court.fill", f) : 0;
  return (
    <Sta st="rouen">
      <CourtRoom />
      <Tower p={[-11, 0, -9]} h={15} r={2.8} />
      {fill > 0.01
        ? Array.from({ length: 21 }, (_, i) => {
            if (i / 21 > fill) return null;
            const row = i % 3;
            const R = 5.2 + row * 1.6;
            const a = Math.PI * (0.1 + (0.8 * Math.floor(i / 3)) / 6);
            const x = Math.cos(a) * -R;
            const z = -Math.sin(a) * R + 2;
            return <Person key={i} frame={f} position={[x, 0.75 + row * 1.2, z]} rotY={Math.atan2(-x, 3.4 - z)} scale={P1} {...crowdLooks(21, "juiz")[i]} robe={i % 3 === 0 ? "#2a2430" : i % 3 === 1 ? "#4a3a2c" : "#3a3040"} seed={40 + i} />;
          })
        : null}
      {fill > 0.01 ? <Person frame={f} position={[0, 0.3, -4.3]} scale={P1} robe="#8a2f3a" mitre="#efe6cf" {...crowdLooks(3, "bispo")[1]} seed={8} /> : null}
    </Sta>
  );
};

const Market: React.FC<{ f: number }> = ({ f }) => {
  const n = SCN(f);
  return (
    <Sta st="pyre">
      <mesh position={[0, 0.04, 0]} receiveShadow>
        <cylinderGeometry args={[13, 13, 0.08, 24]} />
        <meshStandardMaterial color="#a39a86" roughness={1} />
      </mesh>
      {[[-11, -6, 0.6], [-4, -12, 0.1], [7, -11, -0.3], [12, -3, -0.9]].map(([x, z, r], i) => <House key={i} p={[x, 0, z]} seed={i + 20} rotY={r} w={6} h={7} />)}
      <Pyre f={f} fire={track("fire.level", f)} u={U} />
      {n === 15 || n === 1
        ? Array.from({ length: 14 }, (_, i) => {
            const a = Math.PI * (0.18 + (0.64 * i) / 13);
            const R = 7.5 + (i % 2) * 1.5;
            const x = Math.cos(a) * R;
            const z = Math.sin(a) * R;
            return <Person key={i} frame={f} position={[x, 0.08, z]} rotY={Math.atan2(-x, -z)} scale={P1} {...crowdLooks(14, "praca")[i]} sleeves="long" seed={100 + i} />;
          })
        : null}
    </Sta>
  );
};

const Paris: React.FC<{ f: number }> = ({ f }) => {
  const show = track("statue.show", f);
  if (show < 0.5) return null;
  return (
    <Sta st="paris">
      <mesh position={[0, 0.04, 2]} receiveShadow>
        <boxGeometry args={[16, 0.08, 14]} />
        <meshStandardMaterial color="#b9ad96" roughness={1} />
      </mesh>
      <Statue f={f} glow={track("statue.glow", f)} u={U} />
      <Tree p={[-6.5, 0, -2]} s={0.8} seed={7} />
      <Tree p={[6.5, 0, -2]} s={0.8} seed={8} />
    </Sta>
  );
};

// ------------------------------------------------------------------ rotas
const Routes: React.FC<{ f: number }> = ({ f }) => {
  const pose = cameraPoseAt(f);
  const cd = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const op = clamp((cd - 5) / 4, 0, 1); // some nos closes das estações
  const draw = track("route.draw", f) / 5;
  const glow = track("route.glow", f);
  return (
    <group>
      <Route pts={ROUTE} draw={draw} glow={glow} opacity={op} />
      <Route pts={CAPTIVE} draw={track("captive.draw", f)} color="#e2563f" dashed opacity={op} />
      {SCN(f) === 4 ? <Route pts={MISSION} draw={track("mission.draw", f)} color="#f2c14e" dashed opacity={op} /> : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      <Pedestal />
      <FranceMap eng={track("territory.english", f)} fra={track("territory.french", f)} />
      <Routes f={f} />
      <Plinths f={f} />
      <Village f={f} />
      <Vaucouleurs f={f} />
      <Riders f={f} />
      <Chinon f={f} />
      <FlyingCrown f={f} />
      <Orleans f={f} />
      <SouthArrows f={f} />
      <Reims f={f} />
      <Compiegne f={f} />
      <Rouen f={f} />
      <Market f={f} />
      <Paris f={f} />
      <HerInWorld f={f} />
      <MascotFromTracks />
    </group>
  );
};

// usados pela capa/thumbnail
export { PS, rand };
