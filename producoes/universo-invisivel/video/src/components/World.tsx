import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { add, EUCLID_P, FIELD, GAL, ICE, LENS, PIE, SOLAR, SPLIT_A, SPLIT_B, SUN_P, WEB } from "../data/cosmos";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { NightGlobe, Sun } from "./Apagao";
import { CosmicWeb, Euclid, ExpandingField, Iceberg, LaunchTrail, Lens, PullArrows, SkyThird, SpiralGalaxy, UniversePie } from "./Cosmos";
import { Stars } from "./SpaceScene";
import { MascotFromTracks } from "./Mascot";

// Mundos do "universo invisível": cosmos (pizza, galáxias, expansão), solar (Sol, Terra, Euclid), lente, teia e iceberg.
// Tudo lê o estado de track("alvo.prop", frameGlobal). Posições em data/cosmos.ts.

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

const CosmosWorld: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <Stars count={1600} radius={160} frame={f} />
    {show("galaxy", f) ? (
      <group position={GAL}>
        <SpiralGalaxy spin={f * 0.008} halo={track("halo.k", f)} />
        <PullArrows f={f} k={track("pull.k", f)} />
      </group>
    ) : null}
    {show("pie", f) ? (
      <group position={PIE}>
        <UniversePie k5={track("pie.k5", f)} k27={track("pie.k27", f)} k68={track("pie.k68", f)} outline={track("pie.outline", f)} spin={f * 0.004} />
      </group>
    ) : null}
    {show("split", f) ? (
      <>
        <group position={SPLIT_A}>
          <SpiralGalaxy spin={f * 0.03} halo={1} seed="a" />
        </group>
        <group position={SPLIT_B}>
          <SpiralGalaxy spin={f * 0.03} scatter={track("scatter", f)} seed="b" />
        </group>
      </>
    ) : null}
    {show("field", f) ? (
      <group position={FIELD}>
        <ExpandingField f={f} t={track("expand.t", f)} />
      </group>
    ) : null}
  </group>
);

const SolarWorld: React.FC<{ f: number }> = ({ f }) => {
  const L = track("euclid.launch", f);
  const k = clamp(L, 0, 1);
  const from: Vec3 = add(SOLAR, [0.9, 1.0, 0.4]);
  const p: Vec3 = [from[0] + (EUCLID_P[0] - from[0]) * k, from[1] + (EUCLID_P[1] - from[1]) * k + Math.sin(k * Math.PI) * 1.2, from[2] + (EUCLID_P[2] - from[2]) * k];
  const dist = track("dist.k", f);
  return (
    <group>
      <Stars count={1600} radius={160} frame={f} />
      <group position={SUN_P}>
        <Sun r={3} f={f} />
      </group>
      <group position={SOLAR}>
        <NightGlobe R={1.5} spin={f * 0.003} />
      </group>
      {k > 0.01 ? (
        <>
          <LaunchTrail from={from} to={p} t={Math.min(1, k * 1.05)} />
          <group position={p}>
            <Euclid f={f} s={0.85} />
          </group>
        </>
      ) : null}
      {dist > 0.01
        ? Array.from({ length: 14 }, (_, i) => {
            if (i / 14 > dist) return null;
            const x = SOLAR[0] + 1.8 + (i / 14) * (EUCLID_P[0] - SOLAR[0] - 2.6);
            return (
              <mesh key={i} position={[x, SOLAR[1] - 2.0, 0]}>
                <boxGeometry args={[0.18, 0.06, 0.06]} />
                <meshBasicMaterial color="#c4b5fd" toneMapped={false} />
              </mesh>
            );
          })
        : null}
      {track("sky.k", f) > 0.01 ? (
        <group position={EUCLID_P}>
          <SkyThird r={3.2} k={track("sky.k", f)} />
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("cosmos", f) ? <CosmosWorld f={f} /> : null}
      {show("solar", f) ? <SolarWorld f={f} /> : null}
      {show("lens", f) ? (
        <group position={LENS}>
          <Stars count={900} radius={120} frame={f} />
          <Lens f={f} pass={track("lens.pass", f)} arcs={track("lens.arcs", f)} field={track("lens.field", f)} trace={track("lens.trace", f)} />
        </group>
      ) : null}
      {show("web", f) ? (
        <group position={WEB}>
          <CosmicWeb f={f} light={track("web.light", f)} />
        </group>
      ) : null}
      {show("ice", f) ? (
        <group position={ICE}>
          <Iceberg f={f} />
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
