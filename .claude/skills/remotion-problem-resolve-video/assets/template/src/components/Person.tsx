import { RoundedBox } from "@react-three/drei";
import { clamp, type Vec3 } from "../utils/animation";

// Pessoa low-poly no MESMO estilo do mascote (blocos arredondados, flat, olhos simples), para figurantes:
// banhistas, trabalhadores, moradores, cientistas... Proporção estilizada adulta: ~1,8 u3d de altura (scale 1),
// pés em y=0. Cores configuráveis; animação por função pura do frame (andar, acenar, apontar, respirar, piscar).

export type PersonLook = {
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "long" | "bald";
  shirt?: string;
  pants?: string;
  shoes?: string;
};

export type PersonPose = {
  frame: number;
  position?: Vec3;
  rotY?: number;
  scale?: number;
  walk?: number;
  wave?: number;
  point?: number;
  look?: number;
  /** semente para variar o ritmo (vários figurantes não piscam/andam em sincronia) */
  seed?: number;
} & PersonLook;

const rb = (args: [number, number, number], color: string, radius?: number) => (
  <RoundedBox args={args} radius={radius ?? Math.min(...args) * 0.3} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.6} metalness={0} />
  </RoundedBox>
);

export const Person: React.FC<PersonPose> = ({
  frame,
  position = [0, 0, 0],
  rotY = 0,
  scale = 1,
  walk = 0,
  wave = 0,
  point = 0,
  look = 0,
  seed = 0,
  skin = "#e8b48f",
  hair = "#3b2a22",
  hairStyle = "short",
  shirt = "#2f7d8c",
  pants = "#2c3445",
  shoes = "#1d1a22",
}) => {
  const f = frame + seed * 17;
  const w = clamp(walk, 0, 1);
  const wv = clamp(wave, 0, 1);
  const pt = clamp(point, 0, 1);
  const ph = f * 0.26;
  const legSwing = w * 0.55 * Math.sin(ph);
  const armSwing = w * 0.45 * Math.sin(ph);
  const bob = w * 0.03 * Math.abs(Math.sin(ph));
  const breathe = 1 + 0.012 * Math.sin(f / 15);
  const blink = f % 110 < 4 ? 0.15 : 1;
  const waveZ = wv * (2.6 + 0.35 * Math.sin(f * 0.45));
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotY, 0]} scale={scale}>
      {/* pernas (calça + sapato) */}
      {[-1, 1].map((s) => (
        <group key={`leg${s}`} position={[0.095 * s, 0.82, 0]} rotation={[s * legSwing, 0, 0]}>
          <group position={[0, -0.38, 0]}>{rb([0.135, 0.76, 0.15], pants)}</group>
          <group position={[0, -0.79, 0.035]}>{rb([0.145, 0.08, 0.25], shoes, 0.03)}</group>
        </group>
      ))}
      {/* tronco */}
      <group position={[0, 1.1, 0]} scale={[1, breathe, 1]}>
        {rb([0.4, 0.58, 0.22], shirt, 0.07)}
      </group>
      {/* braços: manga + antebraço + mão */}
      {[-1, 1].map((s) => {
        const right = s > 0;
        const rx = (right ? -armSwing - pt * 1.45 : armSwing);
        const rz = (right ? waveZ : 0) * s + s * 0.06;
        return (
          <group key={`arm${s}`} position={[0.245 * s, 1.33, 0]} rotation={[rx, 0, rz]}>
            <group position={[0, -0.1, 0]}>{rb([0.12, 0.22, 0.13], shirt, 0.04)}</group>
            <group position={[0, -0.38, 0]}>{rb([0.09, 0.38, 0.1], skin, 0.035)}</group>
            <group position={[0, -0.6, 0]}>{rb([0.1, 0.1, 0.11], skin, 0.035)}</group>
          </group>
        );
      })}
      {/* pescoço + cabeça */}
      <group position={[0, 1.42, 0]}>{rb([0.1, 0.08, 0.1], skin, 0.03)}</group>
      <group position={[0, 1.6, 0]} rotation={[0, look + 0.06 * Math.sin(f / 50), wv * 0.08]}>
        {rb([0.27, 0.3, 0.27], skin, 0.08)}
        {/* olhos */}
        {[-1, 1].map((s) => (
          <mesh key={`eye${s}`} position={[0.058 * s, 0.01, 0.137]} scale={[1, blink, 1]}>
            <boxGeometry args={[0.035, 0.05, 0.01]} />
            <meshStandardMaterial color="#1a1420" />
          </mesh>
        ))}
        {/* cabelo */}
        {hairStyle !== "bald" ? (
          <>
            <group position={[0, 0.135, -0.01]}>{rb([0.29, 0.09, 0.29], hair, 0.04)}</group>
            <group position={[0, 0.05, -0.12]}>{rb([0.29, hairStyle === "long" ? 0.42 : 0.2, 0.07], hair, 0.03)}</group>
            <group position={[-0.07, 0.11, 0.12]} rotation={[0, 0, 0.25]}>{rb([0.16, 0.06, 0.05], hair, 0.02)}</group>
          </>
        ) : null}
      </group>
    </group>
  );
};
