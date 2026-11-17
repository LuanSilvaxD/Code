import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { DEEP, NIB, OBS, OLD, P9_POS, P9W, PLU, SOL, sysT } from "../data/px";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { AlignedOrbits, Nibiru, ObservatoryV2, OldObservatory, PlanetNine, Pluto } from "./PlanetX";
import { Planet, PLANETS, SolarSystem } from "./Solar";
import { Stars } from "./SpaceScene";

// Mundos do "Existe um Planeta X?". Tudo lê track("alvo.prop", frameGlobal). Posições em data/px.ts.

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

/** Pontos ao longo de uma elipse no plano xz (foco na origem, periélio na direção `dir`). draw 0..1. */
const DotEllipse: React.FC<{ peri: number; apo: number; dir?: number; draw?: number; size?: number; color?: string; n?: number; opacity?: number }> = ({ peri, apo, dir = 0, draw = 1, size = 0.3, color = "#9fc8ff", n = 140, opacity = 1 }) => {
  const a = (peri + apo) / 2;
  const e = (apo - peri) / (apo + peri);
  const N = Math.round(n * clamp(draw, 0, 1));
  return (
    <>
      {Array.from({ length: N }, (_, j) => {
        const u = (j / n) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(u));
        return (
          <mesh key={j} position={[Math.cos(u + dir) * r, 0, -Math.sin(u + dir) * r]}>
            <sphereGeometry args={[size, 6, 4]} />
            <meshBasicMaterial color={color} transparent={opacity < 1} opacity={opacity} toneMapped={false} />
          </mesh>
        );
      })}
    </>
  );
};

/** Seta 3D simples ao longo de +x (cilindro + cone). */
const Arrow: React.FC<{ len?: number; color?: string; r?: number }> = ({ len = 3, color = "#ffcf3a", r = 0.35 }) => (
  <group rotation={[0, 0, -Math.PI / 2]}>
    <mesh position={[0, len / 2 - r, 0]}>
      <cylinderGeometry args={[r * 0.4, r * 0.4, len - r * 2, 8]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
    <mesh position={[0, len - r, 0]}>
      <coneGeometry args={[r, r * 2.2, 10]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
  </group>
);

/** s1 e s8: o Sistema Solar visto de longe, e lá fora uma silhueta escura (o "Planeta X"). */
const DeepWorld: React.FC<{ f: number }> = ({ f }) => {
  const q = clamp(track("x.k", f), 0, 1.3);
  return (
    <group position={DEEP}>
      <Stars count={1600} radius={200} frame={f} />
      <SolarSystem f={f} t={sysT(f)} sunR={1.0} arrows={0} />
      {q > 0.01 ? (
        <group position={[-18, 4, 7]} scale={q}>
          <PlanetNine f={f} r={2.2} dark={1 - 0.75 * clamp(track("x.lit", f), 0, 1)} ghost={0} />
        </group>
      ) : null}
    </group>
  );
};

/** s3: Nibiru (desenho de boato) vindo na direção da Terra, e sumindo. */
const NibWorld: React.FC<{ f: number }> = ({ f }) => {
  const t = clamp(track("nib.t", f), 0, 1);
  const k = clamp(track("nib.k", f, 1), 0, 1.2);
  const from: Vec3 = [-1.6, 5.6, -3];
  const to: Vec3 = [-0.5, 1.7, 0];
  const p: Vec3 = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
  return (
    <group position={NIB}>
      <Stars count={1200} radius={90} frame={f} />
      <group position={[0.5, -1.2, 0]}>
        <Planet r={0.85} color="#3f8fe0" spin={f * 0.01} />
        <mesh scale={1.08}>
          <sphereGeometry args={[0.85, 24, 16]} />
          <meshBasicMaterial color="#8fd0ff" transparent opacity={0.14} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      {k > 0.01 ? (
        <group position={p} rotation={[0, 0, -1.05]} scale={k}>
          <Nibiru f={f} r={1.1} trail={1} />
        </group>
      ) : null}
    </group>
  );
};

/** s4/s5/s8: Sistema Solar de cima, órbitas alinhadas (esquema) e o Planeta Nove lá fora puxando. */
const SolWorld: React.FC<{ f: number }> = ({ f }) => {
  const orb = clamp(track("orb.k", f), 0, 1);
  const p9 = clamp(track("p9.k", f), 0, 1.3);
  const pull = clamp(track("pull", f), 0, 1);
  const p9orb = clamp(track("p9.orb", f), 0, 1);
  const pulse = 0.5 + 0.5 * Math.sin(f / 5);
  return (
    <group position={SOL}>
      <SolarSystem f={f} t={sysT(f)} sunR={1.6} arrows={0} />
      {orb > 0.01 ? <AlignedOrbits k={orb} /> : null}
      {p9orb > 0.01 ? <DotEllipse peri={52} apo={92} dir={0.12} draw={p9orb} size={0.7} color="#9fc8ff" n={120} /> : null}
      {p9 > 0.01 ? (
        <group position={P9_POS} scale={p9}>
          <PlanetNine f={f} r={4.2} ghost={0.55} />
        </group>
      ) : null}
      {pull > 0.01
        ? [-10, 0, 10].map((z, i) => {
            const x0 = 30 + pulse * 2.5;
            const ang = Math.atan2(-(P9_POS[2] - z), P9_POS[0] - x0);
            return (
              <group key={i} position={[x0, 0, z]} rotation={[0, ang, 0]} scale={pull}>
                <Arrow len={10} r={1.3} color="#ffcf3a" />
              </group>
            );
          })
        : null}
    </group>
  );
};

/** s5/s6: Planeta Nove de perto (ilustração) com a Terra para comparar; luz do Sol fraca. */
const P9World: React.FC<{ f: number }> = ({ f }) => {
  const dark = clamp(track("p9.dark", f), 0, 1);
  const earth = clamp(track("earth.k", f), 0, 1.3);
  const sun = clamp(track("farsun.k", f), 0, 1.3);
  return (
    <group position={P9W}>
      <Stars count={1400} radius={90} frame={f} />
      <PlanetNine f={f} r={1.5} dark={dark} />
      {earth > 0.01 ? (
        <group position={[1.15, -2.3, 1.2]} scale={earth}>
          <Planet r={0.62} color="#3f8fe0" spin={f * 0.01} />
        </group>
      ) : null}
      {sun > 0.01 ? (
        <group position={[-4, 6, -26]} scale={sun}>
          <mesh>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshBasicMaterial color="#fff6d8" toneMapped={false} />
          </mesh>
          <mesh scale={3.5}>
            <sphereGeometry args={[0.22, 16, 12]} />
            <meshBasicMaterial color="#ffd27a" transparent opacity={0.18} depthWrite={false} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("deep", f) ? <DeepWorld f={f} /> : null}
      {show("old", f) ? (
        <group position={OLD}>
          <OldObservatory f={f} />
        </group>
      ) : null}
      {show("plu", f) ? (
        <group position={PLU}>
          <Stars count={1200} radius={90} frame={f} />
          <group position={[0, 1.0, 0]}>
            <Planet r={1.5} color="#4a6ae0" spin={f * 0.01} />
          </group>
          <group position={[0.9, -1.3, 1.2]} scale={clamp(track("pluto.k", f), 0, 1.3)}>
            <Pluto f={f} r={0.27} />
          </group>
        </group>
      ) : null}
      {show("nib", f) ? <NibWorld f={f} /> : null}
      {show("sol", f) ? <SolWorld f={f} /> : null}
      {show("p9", f) ? <P9World f={f} /> : null}
      {show("obs", f) ? (
        <group position={OBS}>
          <Stars count={1600} radius={90} frame={f} />
          <ObservatoryV2 f={f} night={1} scan={track("scan", f, 0.3)} open={1} />
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
export { PLANETS };
