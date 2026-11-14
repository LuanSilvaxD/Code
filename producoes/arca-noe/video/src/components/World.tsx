import { useMemo } from "react";
import { BackSide, BufferAttribute, CatmullRomCurve3, Color, SphereGeometry, Vector3 } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { add, BRANCH_Y, FOREST, HIT, MAP, PERCH, STORM, VIEW } from "../data/birds";
import { LIGHTING } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { Branch, InfraWaves, Pine, Supercell, Tree, Warbler } from "./Birds";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";

// Mundos dos "pássaros que ouviram a tempestade". Tudo lê track("alvo.prop", frameGlobal). Posições em data/birds.ts.

/** Luz que acompanha o alvo da câmera (a sombra cobre só o que está em quadro). */
export const KolaLighting: React.FC = () => {
  const f = useCurrentFrame();
  const pose = cameraPoseAt(f);
  const d = Math.hypot(pose.position[0] - pose.target[0], pose.position[1] - pose.target[1], pose.position[2] - pose.target[2]);
  const ext = clamp(d * 0.55, 0.4, 12);
  const myth = 0;
  const k = 1 - 0.3 * myth;
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
        color={new Color(LIGHTING.key.color).lerp(new Color("#ff9a7a"), myth * 0.5)}
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


const show = (k: string, f: number) => track(`${k}.show`, f) > 0.5;

/** Céu em degradê (cúpula). dark 0 = azul limpo, 1 = tempestade. */
const Sky: React.FC<{ dark: number; center: Vec3 }> = ({ dark, center }) => {
  const geo = useMemo(() => new SphereGeometry(180, 32, 16), []);
  const d = clamp(dark, 0, 1);
  const top = new Color("#4a9ad8").lerp(new Color("#262a3a"), d);
  const bot = new Color("#d4ecf6").lerp(new Color("#5a6072"), d);
  const pos = geo.attributes.position;
  const cols = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const t = clamp((pos.getY(i) / 180 + 0.1) / 0.7, 0, 1);
    const c = bot.clone().lerp(top, t);
    cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new BufferAttribute(cols, 3));
  return (
    <mesh geometry={geo} position={center}>
      <meshBasicMaterial vertexColors side={BackSide} depthWrite={false} fog={false} />
    </mesh>
  );
};

/** Chão + floresta ao fundo (árvores e pinheiros em fileiras). */
const Woods: React.FC<{ f: number; dark?: number; wind?: number }> = ({ f, dark = 0, wind = 0 }) => {
  const trees = useMemo(() => Array.from({ length: 20 }, (_, i) => ({ p: [(rand(`wx${i}`) - 0.5) * 60, 0, -14 - rand(`wz${i}`) * 34] as Vec3, s: 1.6 + rand(`ws${i}`) * 1.4, pine: rand(`wp${i}`) > 0.6, seed: `w${i}` })), []);
  return (
    <group>
      <mesh position={[0, -0.05, -10]} receiveShadow>
        <boxGeometry args={[80, 0.1, 60]} />
        <meshStandardMaterial color={new Color("#5a8a3a").lerp(new Color("#2a3a24"), dark * 0.6)} roughness={1} />
      </mesh>
      {trees.map((t, i) => (
        <group key={i} position={t.p}>
          {t.pine ? <Pine f={f} s={t.s} dark={dark} /> : <Tree f={f} s={t.s} seed={t.seed} dark={dark} wind={wind} />}
        </group>
      ))}
    </group>
  );
};

/** Bando no galho: t 0 = pousados, 1 = longe (voando para cima e à direita). */
const Flock: React.FC<{ f: number; t: number; tracker?: number; sing?: number; dir?: number }> = ({ f, t, tracker = 0, sing = 0, dir = 1 }) => (
  <>
    {PERCH.map((x, i) => {
      const d = clamp(t * 1.25 - i * 0.07, 0, 1);
      const e = d * d;
      const p: Vec3 = [x + e * (3 + i * 0.6) * dir, BRANCH_Y + 0.07 + e * (2.2 + i * 0.35), e * (-1 - i * 0.4)];
      const flying = d > 0.02;
      return (
        <group key={i} position={p} rotation={[flying ? -0.25 * dir : 0, i % 2 ? 0.35 : -0.25, 0]}>
          <Warbler f={f + i * 7} fly={flying ? 1 : 0} tracker={i === 2 ? tracker : 0} sing={i === 1 ? sing : 0} look={0} />
        </group>
      );
    })}
  </>
);

const ForestWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = Math.max(track("flock.t", f), track("ret.t", f));
  return (
    <group position={FOREST}>
      <Sky dark={track("sky.dark", f)} center={FOREST} />
      <Woods f={f} />
      <group position={[0, BRANCH_Y, 0]}>
        <Branch f={f} len={3.6} />
      </group>
      <mesh position={[-1.9, BRANCH_Y / 2, -0.1]}>
        <cylinderGeometry args={[0.12, 0.18, BRANCH_Y + 0.4, 8]} />
        <meshStandardMaterial color="#6a4a30" roughness={0.95} flatShading />
      </mesh>
      <Flock f={f} t={t} tracker={track("tracker.k", f)} sing={track("sing", f)} />
      {track("waves.k", f) > 0.01 ? (
        <group position={[0, 0, -60]}>
          <InfraWaves f={f} k={track("waves.k", f)} speed={0.6} maxR={70} n={4} />
        </group>
      ) : null}
    </group>
  );
};

const MapWorld: React.FC<{ f: number }> = ({ f }) => {
  const draw = clamp(track("route.draw", f), 0, 1);
  const band = clamp(track("band.k", f), 0, 1);
  const curve = useMemo(() => new CatmullRomCurve3([new Vector3(0, 0.3, -3), new Vector3(-1.5, 0.3, 0), new Vector3(-0.5, 0.3, 3.8), new Vector3(1.6, 0.3, 4.5), new Vector3(2.6, 0.3, 1.5), new Vector3(1.2, 0.3, -1.6), new Vector3(0, 0.3, -3)], false), []);
  const n = Math.round(90 * draw);
  return (
    <group position={MAP}>
      <mesh position={[0, -0.15, 0]}>
        <boxGeometry args={[20, 0.3, 16]} />
        <meshStandardMaterial color="#6a8a4a" roughness={1} />
      </mesh>
      <mesh position={[0, -0.05, 7]}>
        <boxGeometry args={[20, 0.3, 4]} />
        <meshStandardMaterial color="#2a6aa8" roughness={0.3} />
      </mesh>
      {/* faixa da tempestade (passa pelo ponto de partida) */}
      {band > 0.01 ? (
        <mesh position={[-6 + band * 6, 0.12, -3]} rotation={[0, 0.5, 0]}>
          <boxGeometry args={[3, 0.06, 18]} />
          <meshBasicMaterial color="#ff4a3a" transparent opacity={0.45} />
        </mesh>
      ) : null}
      {/* pino de partida */}
      <group position={[0, 0, -3]}>
        <mesh position={[0, 0.7, 0]}>
          <sphereGeometry args={[0.32, 16, 12]} />
          <meshStandardMaterial color="#f4c830" roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.3, 0]}>
          <coneGeometry args={[0.16, 0.6, 12]} />
          <meshStandardMaterial color="#f4c830" roughness={0.4} />
        </mesh>
      </group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={curve.getPointAt(i / 90)}>
          <sphereGeometry args={[0.1, 6, 4]} />
          <meshBasicMaterial color={i / 90 < 0.55 ? "#ffffff" : "#4ade80"} toneMapped={false} />
        </mesh>
      ))}
      {n > 0 ? (
        <group position={curve.getPointAt(Math.max(0, (n - 1) / 90)).toArray() as Vec3} rotation={[0, Math.PI / 2, 0]} scale={0.6}>
          <Warbler f={f} fly={1} />
        </group>
      ) : null}
    </group>
  );
};

const ViewWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={VIEW}>
    <Sky dark={track("sky.dark", f)} center={VIEW} />
    <Woods f={f} dark={0.15} />
    <group position={[0, -0.4, -75]}>
      <Supercell f={f} s={3} tornado={0} rain={0.6} />
    </group>
    <group position={[0, 0, -75]}>
      <InfraWaves f={f} k={track("waves.k", f)} speed={0.9} maxR={85} n={5} />
    </group>
    <group position={[0, BRANCH_Y, 0]}>
      <Branch f={f} len={3.6} />
    </group>
    <group position={[0.45, BRANCH_Y + 0.07, 0]} rotation={[0, -0.6, 0]}>
      <Warbler f={f} look={0} />
    </group>
  </group>
);

const StormWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={STORM}>
    <Sky dark={0.85} center={STORM} />
    <Woods f={f} dark={0.6} wind={0.6} />
    <group position={[0, 0, -2]} scale={1.5}>
      <Supercell f={f} tornado={1} rain={1} />
    </group>
    <InfraWaves f={f} k={track("waves.k", f)} speed={0.25} maxR={40} n={4} />
  </group>
);

const HitWorld: React.FC<{ f: number }> = ({ f }) => {
  const r = clamp(track("rain.k", f), 0, 1);
  return (
    <group position={HIT}>
      <Sky dark={1} center={HIT} />
      <Woods f={f} dark={0.9} wind={1} />
      <group position={[3, 0, -24]} scale={1.6}>
        <Supercell f={f} tornado={1} rain={1} />
      </group>
      <group position={[0, BRANCH_Y, 0]} rotation={[0.05 * Math.sin(f / 4), 0, 0.03 * Math.sin(f / 5)]}>
        <Branch f={f * 4} len={3.6} />
      </group>
      {r > 0.01
        ? Array.from({ length: 140 }, (_, i) => {
            const x = (rand(`hx${i}`) - 0.5) * 12;
            const z = 2 - rand(`hz${i}`) * 10;
            const y = 7 - ((f * 0.4 + rand(`hy${i}`) * 8) % 8);
            return (
              <mesh key={i} position={[x, y, z]} rotation={[0, 0, 0.18]}>
                <boxGeometry args={[0.02, 0.5, 0.02]} />
                <meshBasicMaterial color="#c0c8dc" transparent opacity={0.5 * r} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("forest", f) ? <ForestWorld f={f} /> : null}
      {show("map", f) ? <MapWorld f={f} /> : null}
      {show("view", f) ? <ViewWorld f={f} /> : null}
      {show("storm", f) ? <StormWorld f={f} /> : null}
      {show("hit", f) ? <HitWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
export const _w = add;
