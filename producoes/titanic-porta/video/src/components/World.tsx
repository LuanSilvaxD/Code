import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { Stars } from "./SpaceScene";
import { Asteroid, BorderMap, FamilyTree, Giraffe, HeronFly, JuarezNight, MapPin, PLACES, Quetzalcoatlus, Shockwave } from "./Ptero";
import { Aratasaurus } from "./Dino";
import { CretaceousDiorama } from "./Sangue";
import { CR, FT, JU, MP, QSC, SC, SKY } from "../data/ptm";

// Mundos do "Pterodáctilo no México?". Tudo lê track("alvo.prop", frameGlobal). Posições em data/ptm.ts.

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

/** Silhueta que cruza o céu: x vai de -1 (esquerda) a 1 (direita); kind 0 = pterossauro, 1 = ave. */
const SkyFlyer: React.FC<{ f: number }> = ({ f }) => {
  const x = track("fly.x", f, -9);
  if (x < -1.5 || x > 1.5) return null;
  const pk = clamp(track("fly.p", f, 1), 0, 1), hk = clamp(track("fly.h", f), 0, 1);
  const p: Vec3 = [SKY[0] + x * 3.2, SKY[1] - 0.2 + Math.sin(x * 2) * 0.15, SKY[2]];
  return (
    <group position={p} rotation={[0.25, 0.25, 0.12]}>
      {pk > 0.01 ? (
        <group scale={0.32 * pk}>
          <Quetzalcoatlus f={f} sil={1} flap={0.9} />
        </group>
      ) : null}
      {hk > 0.01 ? (
        <group scale={1.9 * hk}>
          <HeronFly f={f} sil={1} />
        </group>
      ) : null}
    </group>
  );
};

const Ground: React.FC<{ w: number; d: number; c: string }> = ({ w, d, c }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[w, 0.1, d]} />
    <meshStandardMaterial color={c} roughness={1} flatShading />
  </mesh>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  const ast = track("ast.t", f);
  const chx = PLACES.chicxulub;
  return (
    <>
      {show("ju", f) ? (
        <group position={JU}>
          <Stars count={600} radius={60} frame={f} />
          <JuarezNight f={f} />
          <SkyFlyer f={f} />
        </group>
      ) : null}
      {show("ft", f) ? (
        <group position={FT}>
          <Stars count={500} radius={60} frame={f} />
          <FamilyTree grow={track("tree", f, 1)} />
          {track("dino", f) > 0.01 ? (
            <group position={[-2.1, 2.95, 0]} scale={0.32 * clamp(track("dino", f), 0, 1.1)} rotation={[0, 0.3, 0]}>
              <Aratasaurus frame={f} />
            </group>
          ) : null}
          {track("ptero", f) > 0.01 ? (
            <group position={[2.1, 3.35, 0]} rotation={[0.45, -0.7, 0]} scale={0.22 * clamp(track("ptero", f), 0, 1.1)}>
              <Quetzalcoatlus f={f} flap={0.5} />
            </group>
          ) : null}
        </group>
      ) : null}
      {show("mp", f) ? (
        <group position={MP}>
          <Stars count={400} radius={60} frame={f} />
          <BorderMap f={f} crater={track("crater", f)} line={track("line", f)} />
          <MapPin p={PLACES.juarez} c="#ffb02a" s={clamp(track("pin.j", f), 0, 1.2)} />
          <MapPin p={PLACES.bigbend} c="#ff4a3d" s={clamp(track("pin.b", f), 0, 1.2)} />
          <Asteroid from={[chx[0] + 3, 6, chx[2] - 3]} to={[chx[0], 0.25, chx[2]]} t={ast} f={f} />
          <Shockwave p={[chx[0], 0, chx[2]]} k={track("shock", f)} />
        </group>
      ) : null}
      {show("sc", f) ? (
        <group position={SC}>
          <Stars count={500} radius={80} frame={f} />
          <Ground w={16} d={5} c="#8a7a5a" />
          {track("q.k", f, 1) > 0.01 ? (
            <group position={QSC} rotation={[0.22, -Math.PI / 2, 0]} scale={clamp(track("q.k", f, 1), 0, 1)}>
              <Quetzalcoatlus f={f} flap={0.3} sil={track("q.sil", f)} />
            </group>
          ) : null}
          <group position={[-4.6, 0, 0.8]} rotation={[0, 0.5, 0]}>
            <Giraffe f={f} />
          </group>
        </group>
      ) : null}
      {show("cr", f) ? (
        <group position={CR}>
          <CretaceousDiorama f={f} />
          <group position={[-2.5 + track("cr.x", f) * 5, 2.1, -0.6]} rotation={[0.2, -0.1, 0.1]} scale={0.3}>
            <Quetzalcoatlus f={f} flap={0.4} glide={1} />
          </group>
        </group>
      ) : null}
      <MascotFromTracks />
    </>
  );
};
