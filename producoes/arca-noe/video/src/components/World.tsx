import { useMemo } from "react";
import { BackSide, BufferAttribute, Color, SphereGeometry } from "three";
import { useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { ARARAT_P, DRILL, FIRE, GEO, LAND, WOOD } from "../data/ark";
import { LIGHTING } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { Ararat, ArkOutline, Campfire, CharredWood, DrillRig, Durupinar, Plateau, Sheep, SynclineBlock } from "./Ark";
import { cameraPoseAt } from "./CameraController";
import { MascotFromTracks } from "./Mascot";
import { Person } from "./Person";

// Mundos do "Acharam a Arca de Noé?". Tudo lê track("alvo.prop", frameGlobal). Posições em data/ark.ts.

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

const Sky: React.FC<{ center: Vec3; r?: number; warm?: number }> = ({ center, r = 180, warm = 0 }) => {
  const geo = useMemo(() => {
    const g = new SphereGeometry(r, 32, 16);
    const top = new Color("#4a8ad0");
    const bot = new Color("#cfe2ee").lerp(new Color("#f2c8a0"), warm);
    const pos = g.attributes.position;
    const cols = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const t = clamp((pos.getY(i) / r + 0.01) / 0.22, 0, 1);
      const c = bot.clone().lerp(top, t);
      cols[i * 3] = c.r; cols[i * 3 + 1] = c.g; cols[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new BufferAttribute(cols, 3));
    return g;
  }, [r, warm]);
  return (
    <mesh geometry={geo} position={center}>
      <meshBasicMaterial vertexColors side={BackSide} depthWrite={false} />
    </mesh>
  );
};

const Ground: React.FC<{ w?: number; c?: string }> = ({ w = 40, c = "#9a8a62" }) => (
  <mesh position={[0, -0.05, 0]} receiveShadow>
    <boxGeometry args={[w, 0.1, w]} />
    <meshStandardMaterial color={c} roughness={1} />
  </mesh>
);

const LandWorld: React.FC<{ f: number }> = ({ f }) => {
  const rk = clamp(track("ruler.k", f), 0, 1.2);
  return (
    <group position={LAND}>
      <Sky center={LAND} r={230} />
      <Plateau w={320} />
      <Durupinar glow={track("glow", f)} />
      {track("ark.draw", f) > 0.01 ? (
        <group position={[0, 0.5, 0]}>
          <ArkOutline draw={track("ark.draw", f)} len={15} />
        </group>
      ) : null}
      {rk > 0.01 ? (
        <group position={[0, 1.3, 3.1]} scale={[rk, 1, 1]}>
          <mesh>
            <boxGeometry args={[15.7, 0.12, 0.12]} />
            <meshBasicMaterial color="#ffffff" toneMapped={false} />
          </mesh>
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * 7.85, 0, 0]}>
              <boxGeometry args={[0.12, 0.9, 0.12]} />
              <meshBasicMaterial color="#ffffff" toneMapped={false} />
            </mesh>
          ))}
        </group>
      ) : null}
      <group position={ARARAT_P}>
        <Ararat />
      </group>
    </group>
  );
};

const WoodWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={WOOD}>
    <Sky center={WOOD} r={60} />
    <Ground w={20} c="#8a7a58" />
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[(rand(`wr${i}`) - 0.5) * 3, 0.02, (rand(`wz${i}`) - 0.5) * 2 - 0.4]} scale={0.03 + rand(`ws${i}`) * 0.05}>
        <icosahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#7a6a54" roughness={1} flatShading />
      </mesh>
    ))}
    <group scale={clamp(track("wood.k", f), 0, 1.2)}>
      <CharredWood f={f} />
    </group>
  </group>
);

const GeoWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={GEO}>
    <SynclineBlock fold={track("fold.k", f, 1)} erode={track("erode.t", f)} />
  </group>
);

const DrillWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={DRILL}>
    <Sky center={DRILL} r={80} />
    <Ground w={40} c="#9a8a62" />
    <DrillRig f={f} depth={track("drill.t", f)} core={track("core.k", f)} />
    <Person frame={f} position={[-1.1, 0, 0.7]} rotY={0.7} seed={3} />
    <Person frame={f + 30} position={[1.6, 0, -0.8]} rotY={-0.9} seed={8} />
  </group>
);

const FireWorld: React.FC<{ f: number }> = ({ f }) => (
  <group position={FIRE}>
    <Sky center={FIRE} r={300} warm={0.35} />
    <Ground w={120} c="#9a8a62" />
    <group position={[-70, 0, -260]} scale={1.2}>
      <Ararat />
    </group>
    <Campfire f={f} />
    <Person frame={f} position={[-0.9, 0, -0.25]} rotY={0.8} seed={11} robe="#7a5a3a" />
    <group position={[1.2, 0, 0.3]} rotation={[0, 2.6, 0]}>
      <Sheep f={f} graze={1} />
    </group>
    <group position={[1.0, 0, -1.1]} rotation={[0, -2.2, 0]}>
      <Sheep f={f + 20} graze={0.3} />
    </group>
    <group position={[2.4, 0, -0.4]} rotation={[0, 3.4, 0]}>
      <Sheep f={f + 40} graze={0.8} wool="#e2d8c4" />
    </group>
  </group>
);

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <>
      {show("land", f) ? <LandWorld f={f} /> : null}
      {show("wood", f) ? <WoodWorld f={f} /> : null}
      {show("geo", f) ? <GeoWorld f={f} /> : null}
      {show("drill", f) ? <DrillWorld f={f} /> : null}
      {show("fire", f) ? <FireWorld f={f} /> : null}
      <MascotFromTracks />
    </>
  );
};
