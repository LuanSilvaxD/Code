import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { CAS, FOR } from "../data/amz";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { CasarabeMound, LidarPlane, Rainforest, RatanabaFake, UpanoGrid } from "./Amazon";
import { Stars } from "./SpaceScene";

// Mundos do "Cidade perdida na Amazônia". Tudo lê track("alvo.prop", frameGlobal). Posições em data/amz.ts.

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

/** Diorama da floresta: Upano escondido sob as árvores, Ratanabá (boato) e o avião do LiDAR. */
const ForWorld: React.FC<{ f: number }> = ({ f }) => {
  const plane = track("plane", f);
  const px = track("scan.x", f, -99);
  const rk = track("rat.k", f), rc = track("rat.crack", f);
  return (
    <group position={FOR}>
      <Stars count={700} radius={80} frame={f} />
      <Rainforest f={f} scanX={plane > 0.01 ? px : -99} scanW={0.7} revealed={track("revealed", f)} trail={track("trail", f, 1) > 0.5}>
        <UpanoGrid k={1} roads={1} />
      </Rainforest>
      {rk > 0.01 && rc < 0.999 ? (
        <group position={[0, 0, -0.4]}>
          <RatanabaFake f={f} k={rk} crack={rc} />
        </group>
      ) : null}
      {plane > 0.01 ? (
        <group position={[px, 0, 0]}>
          <LidarPlane f={f} h={2.6} fan={clamp(plane, 0, 1)} />
        </group>
      ) : null}
    </group>
  );
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("for", f) ? <ForWorld f={f} /> : null}
      {show("cas", f) ? (
        <group position={CAS}>
          <Stars count={700} radius={80} frame={f} />
          <CasarabeMound k={track("cas.k", f, 1)} water={track("cas.w", f, 1)} />
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
