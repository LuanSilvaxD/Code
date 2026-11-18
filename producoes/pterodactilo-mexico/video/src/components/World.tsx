import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { Stars } from "./SpaceScene";
import { Sun } from "./Apagao";
import { FrostEarth, HydrothermalVent, IceOceanSlice, WiltingTree } from "./SunGone";
import { DEPART_DEG, EARTH_R, earthPos, OC, ORBIT_R, SP, SUN, SUN_R, TR, VE } from "../data/sun";
import { rand } from "../utils/animation";

// Mundos do "E se o Sol sumisse?". Tudo lê track("alvo.prop", frameGlobal). Posições em data/sun.ts.

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

/** Pulsos de luz viajando de A até B. Só aparecem entre tail e head (frações 0..1 do caminho). */
const LightSpan: React.FC<{ a: Vec3; b: Vec3; tail: number; head: number; f: number; on?: number }> = ({ a, b, tail, head, f, on = 1 }) => {
  const N = 30;
  return (
    <group>
      {Array.from({ length: N }, (_, i) => {
        const u = (((i + f * 0.35) / N) % 1 + 1) % 1;
        if (u < tail || u > head || on < 0.01) return null;
        const p: Vec3 = [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
        const edge = Math.min(1, (u - tail) * 12, (head - u) * 12 + 0.3);
        return (
          <mesh key={i} position={p} scale={0.07 + 0.06 * edge}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshBasicMaterial color="#ffe27a" transparent opacity={clamp(on, 0, 1) * (0.45 + 0.55 * edge)} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Órbita tracejada (some com `k`) e o caminho reto à frente (aparece com `path`). */
const OrbitLines: React.FC<{ k: number; path: number }> = ({ k, path }) => {
  const a0 = (DEPART_DEG * Math.PI) / 180;
  const p0 = earthPos(DEPART_DEG, 0);
  const tg: Vec3 = [-Math.sin(a0), Math.cos(a0), 0];
  return (
    <group>
      {k > 0.01
        ? Array.from({ length: 72 }, (_, i) => {
            const a = (i / 72) * Math.PI * 2;
            return (
              <mesh key={i} position={[SUN[0] + Math.cos(a) * ORBIT_R, SUN[1] + Math.sin(a) * ORBIT_R, -0.05]} rotation={[0, 0, a]}>
                <boxGeometry args={[0.03, 0.22, 0.03]} />
                <meshBasicMaterial color="#c4b5fd" transparent opacity={0.55 * clamp(k, 0, 1)} depthWrite={false} />
              </mesh>
            );
          })
        : null}
      {path > 0.01
        ? Array.from({ length: 28 }, (_, i) => {
            const d = 0.4 + i * 0.5;
            if (i / 28 > path) return null;
            return (
              <mesh key={`p${i}`} position={[p0[0] + tg[0] * d, p0[1] + tg[1] * d, -0.05]} rotation={[0, 0, a0]}>
                <boxGeometry args={[0.035, 0.24, 0.035]} />
                <meshBasicMaterial color="#ff8a7a" transparent opacity={0.8} depthWrite={false} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Contorno tracejado de onde o Sol estava. */
const SunGhost: React.FC<{ k: number }> = ({ k }) =>
  k < 0.01 ? null : (
    <group position={SUN}>
      {Array.from({ length: 40 }, (_, i) => {
        const a = (i / 40) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * SUN_R, Math.sin(a) * SUN_R, 0]} rotation={[0, 0, a]}>
            <boxGeometry args={[0.04, 0.16, 0.04]} />
            <meshBasicMaterial color="#ffb02a" transparent opacity={0.45 * clamp(k, 0, 1)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );

const SpaceWorld: React.FC<{ f: number }> = ({ f }) => {
  const sk = track("sun.k", f, 1);
  const E = earthPos(track("earth.th", f, -70), track("earth.lx", f));
  const sunAt: Vec3 = SUN;
  return (
    <group position={SP}>
      <Stars count={900} radius={70} frame={f} />
      {sk > 0.01 ? (
        <group position={sunAt} scale={sk}>
          <Sun r={SUN_R} f={f} pulse={track("sun.pulse", f)} />
          <pointLight position={[0, 0, 2.5]} intensity={3 * sk} distance={14} color="#ffc070" />
        </group>
      ) : null}
      <SunGhost k={track("ghost", f)} />
      <OrbitLines k={track("orbit", f, 1)} path={track("path", f)} />
      <LightSpan a={sunAt} b={E} tail={track("light.tail", f)} head={track("light.head", f, 1)} f={f} on={track("light.on", f, 1)} />
      <group position={E}>
        <FrostEarth f={f} r={EARTH_R} frost={track("frost", f)} dark={track("earth.dark", f)} />
      </group>
    </group>
  );
};

/** Neve/poeira fina caindo no fundo do mar ("neve marinha"). */
const MarineSnow: React.FC<{ f: number }> = ({ f }) => (
  <group>
    {Array.from({ length: 40 }, (_, i) => {
      const ph = (f * 0.004 + rand(`ms${i}`)) % 1;
      return (
        <mesh key={i} position={[(rand(`mx${i}`) - 0.5) * 5, 2.6 - ph * 3, (rand(`mz${i}`) - 0.5) * 3]} scale={0.018}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#9fc4e8" transparent opacity={0.5} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("sp", f) ? <SpaceWorld f={f} /> : null}
      {show("tr", f) ? (
        <group position={TR}>
          <Stars count={500} radius={60} frame={f} />
          <WiltingTree f={f} wilt={track("wilt", f)} frost={track("tfrost", f)} />
        </group>
      ) : null}
      {show("oc", f) ? (
        <group position={OC}>
          <Stars count={500} radius={60} frame={f} />
          <IceOceanSlice ice={track("ice", f, 1)} w={4.6} d={2.4} />
        </group>
      ) : null}
      {show("ve", f) ? (
        <group position={VE}>
          <HydrothermalVent f={f} />
          <MarineSnow f={f} />
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
