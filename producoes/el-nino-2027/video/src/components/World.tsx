import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { BOAT, BR, PAC } from "../data/nino";
import { LIGHTING } from "../theme";
import { clamp, type Vec3 } from "../utils/animation";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { PacificSlice } from "./Heat";
import { BrazilMap, FishingBoat } from "./Nino";
import { Stars } from "./SpaceScene";

// Mundos do "El Niño 2026–2027". Tudo lê track("alvo.prop", frameGlobal). Posições em data/nino.ts.

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

/** Pacífico em corte + barco de pesca perto da América do Sul. */
const PacWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={PAC}>
    <Stars count={1000} radius={90} frame={f} />
    <PacificSlice f={f} warm={track("warm", f)} plumes={track("plumes", f)} winds={track("winds", f, 1)} />
    <group position={BOAT} rotation={[0, 0.6, 0]}>
      <FishingBoat f={f} s={0.7} />
    </group>
    {/* água quente em volta do barco (cena do nome) */}
    {track("boatwarm", f) > 0.01 ? (
      <mesh position={[BOAT[0], 0.03, BOAT[2]]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[1.1 * clamp(track("boatwarm", f), 0, 1), 32]} />
        <meshBasicMaterial color={new Color("#ff8a4a")} transparent opacity={0.45} depthWrite={false} />
      </mesh>
    ) : null}
  </group>
);

/** Mapa do Brasil 3D. */
const BrWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={BR}>
    <Stars count={900} radius={80} frame={f} />
    <BrazilMap f={f} dryN={track("dryN", f)} dryNE={track("dryNE", f)} wetS={track("wetS", f)} fire={track("fire", f)} storm={track("storm", f)} bolt={track("bolt", f)} />
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("pac", f) ? <PacWorld f={f} /> : null}
      {show("br", f) ? <BrWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
