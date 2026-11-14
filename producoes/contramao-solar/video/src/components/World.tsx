import { useMemo } from "react";
import { CatmullRomCurve3, Color, Quaternion, Vector3 } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { DISK, NEP, OBS, r631U, ROCKW, SOLAR, STAR, sysT } from "../data/solar";
import { LIGHTING } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { Sun } from "./Apagao";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { AlienStar, NEPTUNE_A, Observatory, OrbitRing, Planet, PLANETS, ProtoDisk, r631Orbit, R631Orbit, Rock, SolarSystem } from "./Solar";
import { Stars } from "./SpaceScene";

// Mundos da "contramão no Sistema Solar". Tudo lê track("alvo.prop", frameGlobal). Posições em data/solar.ts.

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

/** Setas vermelhas ao longo da órbita da R631 (sentido do movimento). */
const RedArrows: React.FC<{ incl: number; v: number }> = ({ incl, v }) => {
  if (v <= 0.01) return null;
  return (
    <>
      {[0.5, 2.1, 3.7, 5.2].map((u, i) => {
        const p = r631Orbit(u, undefined, undefined, incl);
        const q = r631Orbit(u + 0.05, undefined, undefined, incl);
        const d = new Vector3(q[0] - p[0], q[1] - p[1], q[2] - p[2]).normalize();
        const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d);
        return (
          <group key={i} position={p} quaternion={quat} scale={clamp(v, 0, 1.2)}>
            <mesh position={[0, -0.25, 0]}>
              <cylinderGeometry args={[0.09, 0.09, 0.6, 6]} />
              <meshBasicMaterial color="#ff4a3a" toneMapped={false} />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.26, 0.5, 8]} />
              <meshBasicMaterial color="#ff4a3a" toneMapped={false} />
            </mesh>
          </group>
        );
      })}
    </>
  );
};

const SolarWorld: React.FC<{ f: number }> = ({ f }) => {
  const incl = track("incl", f, 142);
  const k = clamp(track("r631.k", f), 0, 1.3);
  const u = r631U(f);
  return (
    <group position={SOLAR}>
      <Stars count={1400} radius={170} frame={f} />
      <SolarSystem f={f} t={sysT(f)} arrows={track("arrows", f)} sunR={1.0} />
      {track("r631.orbit", f) > 0.01 ? <R631Orbit incl={incl} draw={track("r631.orbit", f)} /> : null}
      <RedArrows incl={incl} v={track("redArrow", f)} />
      {k > 0.01 ? (
        <group position={r631Orbit(u, undefined, undefined, incl)}>
          <Rock s={0.55 * k} spin={f * 0.03} />
          <mesh scale={1.3 * k}>
            <sphereGeometry args={[0.55, 16, 12]} />
            <meshBasicMaterial color="#ff5a4a" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
      {/* plano dos planetas (visível na vista de lado) */}
      {track("incl", f, 142) < 141.9 || f < 0 ? (
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[NEPTUNE_A + 0.6, 64]} />
          <meshBasicMaterial color="#8f86c8" transparent opacity={0.08} depthWrite={false} side={2} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Hipótese 1: cinturão de Kuiper + Netuno; a rocha faz um estilingue e sai num plano virado. */
const NepWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp(track("fly.t", f), 0, 1);
  const curve = useMemo(() => new CatmullRomCurve3([new Vector3(-11, 0, 3), new Vector3(-5, 0, 2.2), new Vector3(-1.6, 0, 1.3), new Vector3(0.3, 0.2, 1.9), new Vector3(1.2, 1.4, 0.6), new Vector3(3.5, 4.5, -2), new Vector3(7, 8.5, -5)]), []);
  const belt = useMemo(() => Array.from({ length: 160 }, (_, i) => {
    const a = rand(`kb${i}`) * Math.PI * 2;
    const r = 6.5 + rand(`kr${i}`) * 6;
    return { p: [Math.cos(a) * r - 4, (rand(`ky${i}`) - 0.5) * 0.6, -Math.sin(a) * r * 0.5 - 2] as Vec3, s: 0.06 + rand(`ks${i}`) * 0.12 };
  }), []);
  const n = Math.round(80 * t);
  const p = curve.getPointAt(Math.max(0.0001, t));
  return (
    <group position={NEP}>
      <Stars count={1000} radius={120} frame={f} />
      {belt.map((b, i) => (
        <mesh key={i} position={b.p} scale={b.s}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#8a7a6a" roughness={1} flatShading />
        </mesh>
      ))}
      <Planet r={1.6} color="#4a6ae0" spin={f * 0.01} />
      <OrbitRing a={2.6} opacity={0.0} />
      {Array.from({ length: n }, (_, i) => {
        const q = curve.getPointAt(i / 80);
        return (
          <mesh key={i} position={q}>
            <sphereGeometry args={[0.07, 6, 4]} />
            <meshBasicMaterial color={i / 80 > 0.5 ? "#ff5a4a" : "#c4b5fd"} toneMapped={false} />
          </mesh>
        );
      })}
      <group position={[p.x, p.y, p.z]}>
        <Rock s={0.5} spin={f * 0.05} />
      </group>
    </group>
  );
};

/** Hipótese 2: viaja de outra estrela até o Sol e entra numa órbita invertida. */
const StarWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp(track("inter.t", f), 0, 1);
  const from = new Vector3(-6.5, 3.4, -4);
  const sunP = new Vector3(5, -1, 0);
  const curve = useMemo(() => new CatmullRomCurve3([new Vector3(-5.2, 2.8, -3.4), new Vector3(-1.5, 1.6, -1.6), new Vector3(2.5, 0.2, 0.6), new Vector3(5.4, -0.6, 2.1), new Vector3(7.3, -1, 0), new Vector3(5.4, -1.5, -2.1), new Vector3(3.2, -1, 0), new Vector3(5, -0.5, 2.1)]), []);
  const n = Math.round(110 * t);
  const p = curve.getPointAt(Math.max(0.0001, t));
  return (
    <group position={STAR}>
      <Stars count={1400} radius={140} frame={f} />
      <group position={from.toArray() as Vec3}>
        <AlienStar f={f} r={1.3} />
      </group>
      <group position={sunP.toArray() as Vec3}>
        <Sun r={1.3} f={f} />
      </group>
      {Array.from({ length: n }, (_, i) => (
        <mesh key={i} position={curve.getPointAt(i / 110)}>
          <sphereGeometry args={[0.06, 6, 4]} />
          <meshBasicMaterial color={new Color("#7ab8ff").lerp(new Color("#ff5a4a"), i / 110)} toneMapped={false} />
        </mesh>
      ))}
      <group position={[p.x, p.y, p.z]}>
        <Rock s={0.45} spin={f * 0.05} />
      </group>
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("solar", f) ? <SolarWorld f={f} /> : null}
      {show("rock", f) ? (
        <group position={ROCKW}>
          <Stars count={900} radius={80} frame={f} />
          <Rock s={1.6} spin={f * 0.012} />
        </group>
      ) : null}
      {show("obs", f) ? (
        <group position={OBS}>
          <Stars count={1600} radius={90} frame={f} />
          <Observatory f={f} open={1.2} />
        </group>
      ) : null}
      {show("disk", f) ? (
        <group position={DISK}>
          <Stars count={900} radius={120} frame={f} />
          <Sun r={0.75} f={f} />
          <ProtoDisk f={f * 6} form={track("disk.form", f)} R={7} n={1800} />
        </group>
      ) : null}
      {show("nep", f) ? <NepWorld f={f} /> : null}
      {show("star", f) ? <StarWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
export { PLANETS };
