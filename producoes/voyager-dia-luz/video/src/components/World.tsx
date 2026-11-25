import { useMemo } from "react";
import { useCurrentFrame } from "remotion";
import { CatmullRomCurve3, Vector3 } from "three";
import { track } from "../data/scenes";
import { clamp, type Vec3 } from "../utils/animation";
import { Earth } from "./Interstellar";
import { Planet } from "./Solar";
import { Stars } from "./SpaceScene";
import { Heliosphere, Rod, SignalPulse, SunGlow, Voyager } from "./Voyager";

// Dois cenários no mesmo lugar, trocados pelas trilhas set.nave / set.maq:
//  NAVE    — a Voyager em escala real (1 u = 1 m) no espaço profundo, com o mascote flutuando ao lado.
//  MAQUETE — o sistema solar esquemático (Sol no centro): trajetória, régua de 1 dia-luz e a bolha do Sol.

/** Trajetória esquemática da Voyager na maquete (Terra → Júpiter → Saturno → para fora da bolha). */
export const PATH = new CatmullRomCurve3([
  new Vector3(4, 0, 0.3), new Vector3(5.2, 0.05, 5.6), new Vector3(9.4, 0.3, 8.0),
  new Vector3(16, 0.8, 9.2), new Vector3(24, 1.6, 9.8), new Vector3(31, 2.2, 10.2),
]);
const at = (t: number): Vec3 => { const p = PATH.getPointAt(clamp(t, 0, 1)); return [p.x, p.y, p.z]; };
/** Ponto onde a trajetória cruza a borda da bolha (2012). */
export const CROSS_T = 0.66;
const EARTH_M: Vec3 = [4, 0, 0];
const JUP: Vec3 = [5.8, 0, 6.9];
const SAT: Vec3 = [10, 0, 8.4];
/** Terra distante no plano da nave (de onde sai o "oi"). */
export const EARTH_FAR: Vec3 = [-26, 7, -48];

const SpaceLights: React.FC = () => (
  <>
    <ambientLight intensity={0.5} color="#9aa0c8" />
    <hemisphereLight args={["#c8c0ff", "#1a1430", 0.45]} />
    <directionalLight position={[-8, 5, 7]} intensity={1.9} color="#fff3dc" />
    <directionalLight position={[6, -2, -6]} intensity={0.55} color="#8b5cf6" />
  </>
);

const Orbit: React.FC<{ r: number; o?: number }> = ({ r, o = 0.25 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]}>
    <ringGeometry args={[r - 0.025, r + 0.025, 128]} />
    <meshBasicMaterial color="#8b7cff" transparent opacity={o} depthWrite={false} />
  </mesh>
);

const NaveSet: React.FC<{ f: number }> = ({ f }) => {
  const drift = track("drift", f);
  return (
    <group>
      <group position={[0, 0, -drift * 40]} rotation={[0.04 * Math.sin(f / 90), -0.2 + 0.08 * Math.sin(f / 140), 0.03 * Math.sin(f / 70)]}>
        <Voyager f={f} rtg={track("rtg", f, 0.7)} lights={track("lights", f, 6)} recordOut={track("rec", f)} mag={track("mag", f, 0.42)} whips={track("whips", f, 0.45)} />
      </group>
      {/* Terra distante + o "oi" viajando até a nave */}
      <group position={EARTH_FAR} scale={1.4}><Earth f={f} /></group>
      <SignalPulse from={[EARTH_FAR[0] + 1.6, EARTH_FAR[1] - 0.2, EARTH_FAR[2] + 2]} to={[0, 0, 1.2]} t={track("pulse1", f)} size={0.9} />
      {/* o Sol, longe, para o plano final */}
      <group position={[60, 8, 140]}><SunGlow r={1.6} /></group>
    </group>
  );
};

const Maquete: React.FC<{ f: number }> = ({ f }) => {
  const trail = track("trail", f);
  const beam = track("beam", f);
  const ruler = track("ruler", f);
  const helio = track("helio.show", f);
  const dots = useMemo(() => Array.from({ length: 140 }, (_, i) => i / 139), []);
  const vp = at(trail);
  return (
    <group>
      <SunGlow r={1.1} />
      <Orbit r={4} /><Orbit r={9} o={0.18} /><Orbit r={13} o={0.15} />
      <group position={EARTH_M} scale={0.5}><Earth f={f} /></group>
      <group position={JUP}><Planet r={0.9} color="#d8b08a" bands spin={f * 0.01} /></group>
      <group position={SAT}><Planet r={0.75} color="#e6d29a" ring spin={f * 0.01} /></group>
      {/* rastro da trajetória */}
      {dots.filter((t) => t <= trail).map((t, i) => (
        <mesh key={i} position={at(t)}>
          <sphereGeometry args={[0.07, 6, 4]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0.35 + 0.6 * (t / Math.max(0.01, trail))} toneMapped={false} />
        </mesh>
      ))}
      {/* a nave (miniatura) com halo */}
      {trail > 0.001 ? (
        <group position={vp}>
          <group scale={0.55} rotation={[0, -Math.PI / 2 - 0.3, 0]}><Voyager f={f} mag={0} whips={0} /></group>
          <mesh><sphereGeometry args={[0.6, 12, 8]} /><meshBasicMaterial color="#ffffff" transparent opacity={0.12} depthWrite={false} /></mesh>
        </group>
      ) : null}
      {/* régua Terra → nave com marcas e o raio de luz */}
      {ruler > 0.01 ? (
        <group>
          <Rod a={EARTH_M} b={vp} r={0.05} c="#ffd27a" e="#ffd27a" ei={0.6 * ruler} />
          {Array.from({ length: 9 }, (_, i) => {
            const p = new Vector3(...EARTH_M).lerp(new Vector3(...vp), i / 8);
            return <mesh key={i} position={p}><boxGeometry args={[0.12, 0.7 * ruler, 0.12]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>;
          })}
        </group>
      ) : null}
      <SignalPulse from={EARTH_M} to={vp} t={beam} size={1.0} color="#fff1c4" />
      {/* bolha do Sol + marca do cruzamento (2012) */}
      {helio > 0.01 ? (
        <group scale={0.6 + 0.4 * helio}>
          <Heliosphere f={f} R={20} glow={track("helio.glow", f)} />
        </group>
      ) : null}
      {helio > 0.5 ? (
        <mesh position={at(CROSS_T)}><torusGeometry args={[0.6, 0.08, 8, 24]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      <SpaceLights />
      <Stars count={1600} radius={320} frame={f} />
      {track("set.nave", f) > 0.5 ? <NaveSet f={f} /> : null}
      {track("set.maq", f) > 0.5 ? <Maquete f={f} /> : null}
    </group>
  );
};
