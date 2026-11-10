import { RoundedBox } from "@react-three/drei";
import { clamp, rand, type Vec3 } from "../utils/animation";

// Pessoa low-poly no MESMO estilo do mascote (blocos arredondados, flat, olhos simples), para figurantes:
// banhistas, trabalhadores, moradores, cientistas... Proporção estilizada adulta: ~1,8 u3d de altura (scale 1),
// pés em y=0. Cores configuráveis; animação por função pura do frame (andar, acenar, apontar, respirar, piscar).

export type PersonLook = {
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "long" | "bald";
  shirt?: string;
  sleeves?: "short" | "long";
  pants?: string;
  shoes?: string;
};

// Paletas para variar figurantes SEM ficar "padrão" nem destoar: tons discretos, que convivem com o roxo
// da marca e com as cores didáticas (evite camisetas vermelho/verde puros — são cores de problema/solução).
const SKINS = ["#f3cdb0", "#ebbd9b", "#e0a983", "#d29a73", "#c08560", "#a8704d", "#8d5b3e", "#6f4630"];
const HAIRS = ["#1f1714", "#2e211b", "#4a3324", "#6b4a2e", "#8f6a42", "#b08a5c", "#5a5652", "#9b9690"];
const SHIRTS = ["#2f7d8c", "#3f6db3", "#c9874a", "#d9b44a", "#6c8f5e", "#8b6aa8", "#e6e1d6", "#3e4a5a", "#b8607a", "#4f8f8a", "#c4704f", "#7d8fa8"];
const PANTS = ["#2c3445", "#3a3f4a", "#46566e", "#5b4636", "#2b2b2e", "#66705a", "#8a7a63", "#3f3a52"];
const SHOES = ["#1d1a22", "#5a3b28", "#e8e6e1", "#3b3b46", "#7a5a3c"];

/**
 * Visual de um figurante a partir de uma semente (determinístico: a mesma semente = a mesma pessoa).
 * Use uma semente diferente por pessoa: `<Person {...personLook(i)} seed={i} ... />`. Varia LEVEMENTE
 * tom de pele, cabelo, penteado, camiseta, manga, calça e sapato — nenhum figurante igual ao outro.
 */
export const personLook = (seed: number | string): PersonLook => {
  const pick = <T,>(arr: readonly T[], k: string) => arr[Math.floor(rand(`pl-${seed}-${k}`) * arr.length) % arr.length];
  const h = rand(`pl-${seed}-hs`);
  return {
    skin: pick(SKINS, "skin"),
    hair: pick(HAIRS, "hair"),
    hairStyle: h < 0.55 ? "short" : h < 0.9 ? "long" : "bald",
    shirt: pick(SHIRTS, "shirt"),
    sleeves: rand(`pl-${seed}-sl`) < 0.65 ? "short" : "long",
    pants: pick(PANTS, "pants"),
    shoes: pick(SHOES, "shoes"),
  };
};

/**
 * Grupo de figurantes (multidão, praia, fila...): garante que pessoas vizinhas sejam diferentes —
 * percorre as paletas com passos "primos" a partir de uma semente, em vez de sortear às cegas.
 * Ex.: crowdLooks(5, "praia").map((look, i) => <Person key={i} {...look} seed={i} ... />)
 */
export const crowdLooks = (n: number, seed: number | string = 0): PersonLook[] => {
  const o = Math.floor(rand(`crowd-${seed}`) * 97);
  const at = <T,>(arr: readonly T[], i: number, step: number) => arr[(o + i * step) % arr.length];
  const styles: PersonLook["hairStyle"][] = ["short", "long", "short", "short", "long", "bald"];
  return Array.from({ length: n }, (_, i) => ({
    skin: at(SKINS, i, 3),
    hair: at(HAIRS, i, 5),
    hairStyle: at(styles, i, 1),
    shirt: at(SHIRTS, i, 5),
    sleeves: (o + i) % 3 === 2 ? "long" : "short",
    pants: at(PANTS, i, 3),
    shoes: at(SHOES, i, 2),
  }));
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
  sleeves = "short",
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
            <group position={[0, -0.38, 0]}>{rb(sleeves === "long" ? [0.105, 0.38, 0.115] : [0.09, 0.38, 0.1], sleeves === "long" ? shirt : skin, 0.035)}</group>
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
            <group position={[0, hairStyle === "long" ? -0.05 : 0.05, -0.12]}>{rb([0.29, hairStyle === "long" ? 0.38 : 0.2, 0.07], hair, 0.03)}</group>
            <group position={[-0.07, 0.11, 0.12]} rotation={[0, 0, 0.25]}>{rb([0.16, 0.06, 0.05], hair, 0.02)}</group>
          </>
        ) : null}
      </group>
    </group>
  );
};
