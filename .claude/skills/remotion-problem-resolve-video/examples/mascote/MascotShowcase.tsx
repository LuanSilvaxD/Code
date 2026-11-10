import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "./brand";
import { BrandPedestal } from "./components/BrandPedestal";
import { usePose } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { Mascot } from "./components/Mascot";
import { PostFx } from "./components/PostFx";
import { Planet, Stars } from "./components/SpaceScene";
import { EASE, lerp, orbit, progress, rand, type Vec3 } from "./utils/animation";

// Vitrine do mascote (teste de 12 s): parte 1 na maquete (chega andando, acena, aponta para o objeto e dá
// um pulinho de surpresa); chicote; parte 2 no espaço (flutua girando entre planetas, acena, comemora).
// Mostra como o MESMO personagem se adapta ao cenário do tema. Copie para src/ e registre em Root.tsx.

const CUT = 170;

const seg = (f: number, a: number, b: number, ease = EASE.inOut) => progress(f, a, b, ease);

const lerpPose = (a: { position: Vec3; target: Vec3 }, b: { position: Vec3; target: Vec3 }, t: number) => ({
  position: a.position.map((v, i) => lerp(v, b.position[i], t)) as Vec3,
  target: a.target.map((v, i) => lerp(v, b.target[i], t)) as Vec3,
  fov: 24,
});

const Camera: React.FC = () => {
  const f = useCurrentFrame();
  const pose =
    f < CUT
      ? lerpPose(orbit([-0.3, 0.75, 0.4], 15, 14, 13), orbit([0.08, 0.8, 0.4], 13.5, 4, 9), seg(f, 0, CUT))
      : lerpPose(orbit([0, 0.75, 0], 10, -26, 10), orbit([0, 0.75, 0], 8.4, 22, 4), seg(f, CUT, 360, EASE.soft));
  usePose(pose);
  return null;
};

const Tree: React.FC<{ p: Vec3; s?: number }> = ({ p, s = 1 }) => (
  <group position={p} scale={s}>
    <mesh position={[0, 0.25, 0]} castShadow>
      <cylinderGeometry args={[0.06, 0.08, 0.5, 6]} />
      <meshStandardMaterial color="#7a5634" flatShading />
    </mesh>
    <mesh position={[0, 0.72, 0]} castShadow>
      <icosahedronGeometry args={[0.42, 0]} />
      <meshStandardMaterial color="#4f9d6a" flatShading />
    </mesh>
  </group>
);

const EarthSet: React.FC<{ f: number }> = ({ f }) => {
  // mascote: entra andando (0–60), vira para a câmera e acena (66–112), vira para o objeto e aponta (118–150),
  // pulinho de surpresa (138)
  const x = interpolate(f, [0, 60], [-2.6, -0.8], { extrapolateRight: "clamp", easing: EASE.out });
  const walk = 1 - seg(f, 50, 64);
  const rotY = f < 60 ? Math.PI / 2 : f < 114 ? lerp(Math.PI / 2, 0.25, seg(f, 60, 72)) : lerp(0.25, 1.25, seg(f, 114, 124));
  const wave = seg(f, 66, 74) * (1 - seg(f, 106, 114));
  const point = seg(f, 118, 126) * (1 - seg(f, 160, 170));
  const jumpT = (f - 138) / 14;
  const jump = jumpT > 0 && jumpT < 1 ? Math.sin(jumpT * Math.PI) * 0.6 : 0;
  return (
    <group>
      {/* maquete: chão gramado + pedestal da marca + objeto explicado */}
      <mesh position={[0, -0.15, 0]} receiveShadow castShadow>
        <boxGeometry args={[7, 0.3, 4]} />
        <meshStandardMaterial color="#7fae6a" flatShading />
      </mesh>
      <mesh position={[0, -0.75, 0]}>
        <boxGeometry args={[7, 0.9, 4]} />
        <meshStandardMaterial color="#8a6448" flatShading />
      </mesh>
      <BrandPedestal width={7} depth={4} y={-1.2} />
      <Tree p={[-2.6, 0, -1.3]} />
      <Tree p={[2.5, 0, -1.1]} s={1.2} />
      <Tree p={[2.9, 0, 1.2]} s={0.8} />
      <group position={[0.95, 0.6, 0.3]} rotation={[0, f * 0.012, 0]}>
        <mesh castShadow>
          <icosahedronGeometry args={[0.55, 0]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0ea5e9" emissiveIntensity={0.15 + 0.35 * point} flatShading />
        </mesh>
      </group>
      <Mascot frame={f} position={[x, 0, 0.6]} rotY={rotY} scale={0.95} walk={walk} wave={wave} point={point} jump={jump} look={wave * 0.15} />
    </group>
  );
};

const SpaceSet: React.FC<{ f: number }> = ({ f }) => {
  const wave = seg(f, 230, 240) * (1 - seg(f, 282, 292));
  const cheer = seg(f, 304, 314);
  return (
    <group>
      <Stars frame={f} />
      <Planet position={[-3.4, 2.4, -5]} radius={1.6} color="#e8b04b" frame={f} />
      <Planet position={[4.2, -1.6, -7]} radius={2.2} color="#7c5cd6" frame={f} ring="#c4b5fd" spin={0.003} />
      <Planet position={[2.4, 3.1, -3]} radius={0.55} color="#64748b" frame={f} />
      <Planet position={[-2.2, -2.2, -2]} radius={0.38} color="#e0475b" frame={f} />
      {Array.from({ length: 10 }, (_, i) => (
        <Planet key={i} position={[(rand(`ast${i}`) - 0.5) * 12, (rand(`asy${i}`) - 0.5) * 8, -4 - rand(`asz${i}`) * 6]} radius={0.08 + 0.12 * rand(`asr${i}`)} color="#8b8f9c" frame={f} spin={0.02} detail={0} />
      ))}
      <Mascot frame={f} position={[0, 0.1, 0]} rotY={0.4 * Math.sin(f / 70) + 0.25} scale={1.05} float={1} wave={wave} cheer={cheer} look={-0.1} />
    </group>
  );
};

export const MascotShowcase: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const space = f >= CUT;
  // chicote entre os mundos
  const whip = f < CUT ? seg(f, CUT - 7, CUT, EASE.in) : 1 - seg(f, CUT, CUT + 8, EASE.out);
  const dx = (f < CUT ? 1 : -1) * whip * 160;
  const { umbra } = BRAND.colors;
  const bg = space
    ? `radial-gradient(ellipse 80% 55% at 35% 40%, #2b1b55 0%, ${umbra} 70%)`
    : `linear-gradient(180deg, ${umbra} 0%, #2a1d48 55%, ${umbra} 100%)`;
  return (
    <AbsoluteFill style={{ background: umbra }}>
      <AbsoluteFill style={{ transform: `translate(${dx}px,0) scale(${1 + 0.36 * whip})`, filter: `blur(${whip * 14}px)` }}>
        <AbsoluteFill style={{ background: bg }} />
        {!space ? <AbsoluteFill style={{ background: "radial-gradient(ellipse 75% 34% at 50% 52%, #b9a3ff40 0%, rgba(0,0,0,0) 75%)" }} /> : null}
        <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: 24, near: 0.3, far: 300, position: [0, 2, 10] }}>
          <Camera />
          <Lighting />
          {space ? <SpaceSet f={f} /> : <EarthSet f={f} />}
        </ThreeCanvas>
      </AbsoluteFill>
      <PostFx />
    </AbsoluteFill>
  );
};
