import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { CMB, GPS, GRID, planetPos, SEA, SKY_BH, SPACE } from "../data/is";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { BlackHole, Clock3D, CmbParticles, Earth, GiantWave, GpsSat, gridY, OceanPlanet, OceanSurface, SpacetimeGrid } from "./Interstellar";
import { Stars } from "./SpaceScene";

// Mundos do "Filme × Realidade #1". Tudo lê track("alvo.prop", frameGlobal). Posições em data/is.ts.

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

/** Buraco negro com a "imagem do disco" virada para a câmera do frame. */
const BH: React.FC<{ f: number; base: Vec3; at?: Vec3; r: number; spin?: number; tilt?: number }> = ({ f, base, at = [0, 0, 0], r, spin = 0.4, tilt }) => {
  const cam = cameraPoseAt(f).position;
  const world: Vec3 = [base[0] + at[0], base[1] + at[1], base[2] + at[2]];
  return (
    <group position={at}>
      <BlackHole f={f} r={r} spin={spin} tilt={tilt} camera={cam} world={world} />
    </group>
  );
};

/** s1/s2/s5/s8: Gargântua + planeta-oceano em órbita (raio orbit.r) + anel da órbita (orbit.k). */
const SpaceWorld: React.FC<{ f: number }> = ({ f }) => {
  const r = track("orbit.r", f, 6);
  const ring = clamp(track("orbit.k", f), 0, 1);
  const p = planetPos(r);
  return (
    <group position={SPACE}>
      <Stars count={1600} radius={160} frame={f} />
      <BH f={f} base={SPACE} r={1.6} spin={track("bh.spin", f, 0.35)} />
      <group position={p}>
        <OceanPlanet f={f} r={0.42} />
      </group>
      {ring > 0.01
        ? Array.from({ length: 90 }, (_, i) => {
            const a = (i / 90) * Math.PI * 2;
            return i / 90 < ring ? (
              <mesh key={i} position={[Math.cos(a) * r, 0.25, Math.sin(a) * r]}>
                <sphereGeometry args={[0.045, 6, 4]} />
                <meshBasicMaterial color="#7fe0ff" toneMapped={false} />
              </mesh>
            ) : null;
          })
        : null}
    </group>
  );
};

/** s3: malha do espaço-tempo afundando + relógios (perto = lento, longe = rápido). */
const GridWorld: React.FC<{ f: number }> = ({ f }) => {
  const depth = clamp(track("grid.depth", f), 0, 1);
  const g0 = track("grid.t0", f, 0);
  const t = Math.max(0, f - g0);
  const clocks: { x: number; z: number; speed: number }[] = [
    { x: 1.7, z: 0.4, speed: 0.012 },
    { x: 4.2, z: 1.4, speed: 0.06 },
    { x: 6.6, z: 2.6, speed: 0.16 },
  ];
  return (
    <group position={GRID}>
      <Stars count={900} radius={90} frame={f} />
      <SpacetimeGrid depth={depth} size={18} />
      <BH f={f} base={GRID} at={[0, -5.5 * depth + 0.6, 0]} r={0.75 * Math.max(0.3, depth)} />
      {clocks.map((c, i) => (
        <group key={i} position={[c.x, gridY(c.x, c.z, depth) + 0.45, c.z]} rotation={[1.0, 0, 0]} scale={clamp(track("clocks.k", f), 0, 1.2)}>
          <Clock3D t={t * c.speed * (0.3 + 0.7 * depth) + i} r={0.62} tint={i === 0 ? "#ffd8d0" : "#f5f0ff"} />
        </group>
      ))}
    </group>
  );
};

/** s4: Terra + satélite de GPS em órbita. */
const GpsWorld: React.FC<{ f: number }> = ({ f }) => {
  const a = -0.2 + (f - 615) * 0.003; // começa à direita da Terra (cena s4 começa ~f615)
  return (
    <group position={GPS}>
      <Stars count={1200} radius={90} frame={f} />
      <Earth f={f} r={1.6} />
      <group position={[Math.cos(a) * 1.9, 2.3 + Math.sin(a * 0.7) * 0.2, Math.sin(a) * 1.2 + 1.4]} rotation={[0.25, -a, 0.15]}>
        <GpsSat s={0.65} clockGlow={track("gps.glow", f)} />
      </group>
    </group>
  );
};

/** s6: pouso no oceano raso; onda gigante cresce; buraco negro enorme no céu. */
const SeaWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={SEA}>
    <Stars count={900} radius={120} frame={f} />
    <BH f={f} base={SEA} at={SKY_BH} r={2.1} tilt={0.28} />
    <OceanSurface f={f} wave={0} size={90} />
    <group position={[0, 0, -14]}>
      <GiantWave f={f} h={8.5} len={110} k={track("wave.k", f)} />
    </group>
  </group>
);

/** s7: planeta + brilho do Big Bang chegando e esquentando. */
const CmbWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={CMB}>
    <Stars count={900} radius={90} frame={f} />
    <OceanPlanet f={f} r={1.1} />
    {track("cmb.k", f) > 0.01 ? <CmbParticles t={(f - track("cmb.t0", f, 0)) / 75} n={130} R={10} /> : null}
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("space", f) ? <SpaceWorld f={f} /> : null}
      {show("grid", f) ? <GridWorld f={f} /> : null}
      {show("gps", f) ? <GpsWorld f={f} /> : null}
      {show("sea", f) ? <SeaWorld f={f} /> : null}
      {show("cmb", f) ? <CmbWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
