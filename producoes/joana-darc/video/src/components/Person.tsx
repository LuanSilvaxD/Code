import { RoundedBox } from "@react-three/drei";
import { clamp, rand, type Vec3 } from "../utils/animation";

// Pessoa low-poly no MESMO estilo do mascote (blocos arredondados, flat, olhos simples), para figurantes:
// banhistas, trabalhadores, moradores, cientistas... Proporção estilizada adulta: ~1,8 u3d de altura (scale 1),
// pés em y=0. Cores configuráveis; animação por função pura do frame (andar, acenar, apontar, respirar, piscar).

/** Altura da Pessoa com scale = 1 (u3d). */
export const PERSON_HEIGHT = 1.8;

/**
 * ESCALA DO MUNDO: converta "1 metro" da maquete em u3d e derive a escala das pessoas e do mascote.
 * Ex.: se uma casa de 2 andares (~6 m) tem 1,2 u3d na maquete, metro = 0,2 u3d → uma pessoa de 1,7 m
 * deve ter 0,34 u3d → scale = worldScale(0.2).person. Use a MESMA conta para todo personagem da cena.
 */
export const worldScale = (uPerMeter: number, personMeters = 1.7, mascotMeters = 1.6) => ({
  person: (personMeters * uPerMeter) / PERSON_HEIGHT,
  mascot: (mascotMeters * uPerMeter) / 1.65,
});

export type PersonLook = {
  skin?: string;
  hair?: string;
  hairStyle?: "short" | "long" | "bald" | "bun";
  /** vestido longo (cor da saia): substitui calça e pernas por uma saia até os pés (figurino de época) */
  dress?: string;
  /** túnica (roupa neolítica): cobre o tronco e desce até o joelho; `belt` = cor do cinto */
  tunic?: string;
  belt?: string;
  /** armadura de placas (cor do aço): peitoral, ombreiras, braçais e grevas por cima da roupa */
  armor?: string;
  /** elmo: "kettle" (chapéu de ferro do soldado) ou "sallet" (elmo arredondado) */
  helmet?: "kettle" | "sallet";
  /** batina/manto longo até os pés (teólogos, juízes, bispo) — mangas longas da mesma cor */
  robe?: string;
  /** mitra de bispo (cor) */
  mitre?: string;
  /** coroa dourada (0..1 = aparece/desce da cabeça) */
  crown?: number;
  /** capa (cor) caindo das costas */
  cape?: string;
  /** cota/sobreveste de soldado (cor do tecido por cima do peito) */
  tabard?: string;
  /** estandarte na mão direita: cor do pano (0 em wave = parado) */
  banner?: string;
  bannerWave?: number;
  /** espada embainhada na cintura */
  sword?: boolean;
  /** lança na mão direita (soldados) */
  spear?: boolean;
  /** montado a cavalo: coxas abertas por fora do lombo, canelas penduradas, mãos à frente (rédeas) */
  ride?: boolean;
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
  dress,
  tunic,
  belt = "#4a3322",
  armor,
  helmet,
  robe,
  mitre,
  crown = 0,
  cape,
  tabard,
  banner,
  bannerWave = 1,
  sword = false,
  spear = false,
  ride = false,
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
  const longSkirt = dress ?? robe;
  const top = robe ?? tunic ?? shirt;
  const holding = Boolean(banner) || spear;
  return (
    <group position={[position[0], position[1] + bob, position[2]]} rotation={[0, rotY, 0]} scale={scale}>
      {/* vestido longo: saia em tronco de cone até os pés */}
      {longSkirt ? (
        <group position={[0, 0.43, 0]}>
          <mesh castShadow receiveShadow>
            <cylinderGeometry args={[0.2, robe ? 0.33 : 0.3, 0.86, 10]} />
            <meshStandardMaterial color={longSkirt} roughness={0.7} flatShading />
          </mesh>
        </group>
      ) : null}
      {/* túnica: saia curta em tronco de cone até o joelho + cinto */}
      {tunic ? (
        <>
          <group position={[0, 0.66, 0]}>
            <mesh castShadow receiveShadow>
              <cylinderGeometry args={[0.215, 0.29, 0.44, 9]} />
              <meshStandardMaterial color={tunic} roughness={0.85} flatShading />
            </mesh>
          </group>
          <group position={[0, 0.86, 0]}>{rb([0.42, 0.06, 0.24], belt, 0.02)}</group>
        </>
      ) : null}
      {/* pernas (calça + sapato) */}
      {ride && !longSkirt ? [-1, 1].map((s) => (
        // coxa abre para fora (em z do mundo = lados do cavalo) e um pouco para a frente; canela desce vertical
        <group key={`rleg${s}`} position={[0.095 * s, 0.82, 0]} rotation={[-0.35, 0, s * 0.95]}>
          <group position={[0, -0.21, 0]}>{rb([0.15, 0.44, 0.16], pants)}</group>
          {armor ? <group position={[0, -0.21, 0.012]}>{rb([0.165, 0.32, 0.175], armor, 0.04)}</group> : null}
          <group position={[0, -0.42, 0]} rotation={[0.35, 0, -s * 0.95]}>
            <group position={[0, -0.19, 0]}>{rb([0.135, 0.4, 0.15], armor ?? pants)}</group>
            <group position={[0, -0.41, 0.04]}>{rb([0.145, 0.08, 0.25], armor ?? shoes, 0.03)}</group>
          </group>
        </group>
      )) : null}
      {longSkirt || ride ? null : [-1, 1].map((s) => (
        <group key={`leg${s}`} position={[0.095 * s, 0.82, 0]} rotation={[s * legSwing, 0, 0]}>
          <group position={[0, -0.38, 0]}>{rb([0.135, 0.76, 0.15], pants)}</group>
          {armor ? <group position={[0, -0.52, 0.012]}>{rb([0.15, 0.36, 0.165], armor, 0.04)}</group> : null}
          {armor ? <group position={[0, -0.2, 0.012]}>{rb([0.155, 0.26, 0.17], armor, 0.04)}</group> : null}
          <group position={[0, -0.79, 0.035]}>{rb([0.145, 0.08, 0.25], armor ?? shoes, 0.03)}</group>
        </group>
      ))}
      {/* capa: placa fina atrás do tronco, alargando até a panturrilha */}
      {cape ? (
        <group position={[0, 0.88, -0.135]} rotation={[0.08 + 0.04 * Math.sin(f / 23), 0, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.5, 1.0, 0.03]} />
            <meshStandardMaterial color={cape} roughness={0.75} flatShading />
          </mesh>
        </group>
      ) : null}
      {/* tronco */}
      <group position={[0, 1.1, 0]} scale={[1, breathe, 1]}>
        {rb([0.4, 0.58, 0.22], top, 0.07)}
        {armor ? <group position={[0, 0.03, 0.01]}>{rb([0.43, 0.5, 0.25], armor, 0.09)}</group> : null}
        {armor ? <group position={[0, -0.26, 0.0]}>{rb([0.44, 0.12, 0.25], armor, 0.04)}</group> : null}
        {tabard ? <group position={[0, -0.02, 0.0]}>{rb([0.41, 0.66, 0.235], tabard, 0.06)}</group> : null}
        {tabard || armor ? <group position={[0, -0.24, 0]}>{rb([0.45, 0.05, 0.26], belt, 0.02)}</group> : null}
      </group>
      {sword ? (
        <group position={[-0.24, 0.72, 0.04]} rotation={[0.25, 0, 0.12]}>
          {rb([0.05, 0.62, 0.05], "#3a2a1e", 0.02)}
          <group position={[0, 0.34, 0]}>{rb([0.18, 0.035, 0.05], "#b8b2a2", 0.012)}</group>
          <group position={[0, 0.42, 0]}>{rb([0.035, 0.13, 0.035], "#5a3b28", 0.01)}</group>
        </group>
      ) : null}
      {/* braços: manga + antebraço + mão */}
      {[-1, 1].map((s) => {
        const right = s > 0;
        const rx = right && holding ? -0.55 : ride ? -0.75 : (right ? -armSwing - pt * 1.45 : armSwing);
        const rz = (right ? waveZ : 0) * s + s * 0.06;
        return (
          <group key={`arm${s}`} position={[0.245 * s, 1.33, 0]} rotation={[rx, 0, rz]}>
            <group position={[0, -0.1, 0]}>{rb([0.12, 0.22, 0.13], top, 0.04)}</group>
            <group position={[0, -0.38, 0]}>{rb(sleeves === "long" || robe ? [0.105, 0.38, 0.115] : [0.09, 0.38, 0.1], sleeves === "long" || robe ? top : skin, 0.035)}</group>
            {armor ? <group position={[0, -0.02, 0]}>{rb([0.17, 0.16, 0.18], armor, 0.06)}</group> : null}
            {armor ? <group position={[0, -0.42, 0]}>{rb([0.12, 0.26, 0.13], armor, 0.04)}</group> : null}
            <group position={[0, -0.6, 0]}>{rb([0.1, 0.1, 0.11], armor ?? skin, 0.035)}</group>
            {right && holding ? (
              <group position={[0, -0.6, 0.02]} rotation={[0.55, 0, -s * 0.06]}>
                <mesh position={[0, 0.55, 0]} castShadow>
                  <cylinderGeometry args={[0.022, 0.022, 2.4, 6]} />
                  <meshStandardMaterial color="#6b4a2e" roughness={0.8} />
                </mesh>
                {spear ? (
                  <mesh position={[0, 1.83, 0]} castShadow>
                    <coneGeometry args={[0.045, 0.2, 4]} />
                    <meshStandardMaterial color="#b8b2a2" roughness={0.4} metalness={0.3} />
                  </mesh>
                ) : null}
                {banner ? <BannerCloth color={banner} f={f} wave={bannerWave} /> : null}
              </group>
            ) : null}
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
        {hairStyle === "bun" ? (
          <>
            <group position={[0, 0.135, -0.01]}>{rb([0.29, 0.09, 0.29], hair, 0.04)}</group>
            <group position={[0, 0.06, -0.12]}>{rb([0.29, 0.16, 0.07], hair, 0.03)}</group>
            <mesh position={[0, 0.17, -0.13]} castShadow>
              <sphereGeometry args={[0.075, 10, 8]} />
              <meshStandardMaterial color={hair} roughness={0.6} />
            </mesh>
          </>
        ) : helmet || mitre ? null : hairStyle !== "bald" ? (
          <>
            <group position={[0, 0.135, -0.01]}>{rb([0.29, 0.09, 0.29], hair, 0.04)}</group>
            <group position={[0, hairStyle === "long" ? -0.05 : 0.05, -0.12]}>{rb([0.29, hairStyle === "long" ? 0.38 : 0.2, 0.07], hair, 0.03)}</group>
            <group position={[-0.07, 0.11, 0.12]} rotation={[0, 0, 0.25]}>{rb([0.16, 0.06, 0.05], hair, 0.02)}</group>
          </>
        ) : null}
        {helmet === "kettle" ? (
          <group position={[0, 0.12, 0]}>
            <mesh castShadow><cylinderGeometry args={[0.15, 0.16, 0.13, 10]} /><meshStandardMaterial color="#8a8a86" roughness={0.45} metalness={0.4} flatShading /></mesh>
            <mesh position={[0, -0.06, 0]} castShadow><cylinderGeometry args={[0.26, 0.26, 0.02, 12]} /><meshStandardMaterial color="#7e7e7a" roughness={0.45} metalness={0.4} flatShading /></mesh>
          </group>
        ) : null}
        {helmet === "sallet" ? (
          <group position={[0, 0.06, -0.01]}>
            <mesh castShadow scale={[1, 0.85, 1.12]}><sphereGeometry args={[0.18, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.62]} /><meshStandardMaterial color="#a9aaa8" roughness={0.35} metalness={0.5} flatShading /></mesh>
          </group>
        ) : null}
        {mitre ? (
          <group position={[0, 0.23, 0]}>
            <mesh castShadow scale={[1, 1, 0.55]}><coneGeometry args={[0.15, 0.34, 4]} /><meshStandardMaterial color={mitre} roughness={0.6} flatShading /></mesh>
            <mesh position={[0, -0.02, 0.045]}><boxGeometry args={[0.03, 0.26, 0.01]} /><meshStandardMaterial color="#d8b04a" roughness={0.4} /></mesh>
          </group>
        ) : null}
        {crown > 0.01 ? (
          <group position={[0, 0.17 + (1 - crown) * 0.5, 0]}>
            <mesh castShadow><cylinderGeometry args={[0.155, 0.15, 0.07, 10, 1, true]} /><meshStandardMaterial color="#e3b341" roughness={0.3} metalness={0.6} side={2} /></mesh>
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[Math.cos((i / 6) * Math.PI * 2) * 0.152, 0.06, Math.sin((i / 6) * Math.PI * 2) * 0.152]}>
                <coneGeometry args={[0.028, 0.07, 4]} />
                <meshStandardMaterial color="#e3b341" roughness={0.3} metalness={0.6} />
              </mesh>
            ))}
          </group>
        ) : null}
      </group>
    </group>
  );
};

/** Pano do estandarte: retângulo com cauda bifurcada que ondula (segmentos em z), preso no alto do mastro. */
const BannerCloth: React.FC<{ color: string; f: number; wave: number }> = ({ color, f, wave }) => {
  const N = 6;
  return (
    <group position={[0, 1.55, 0]}>
      {Array.from({ length: N }, (_, i) => {
        const t = (i + 0.5) / N;
        const z = Math.sin(f * 0.18 - i * 0.9) * 0.06 * wave * t;
        const h = i < N - 1 ? 0.5 : 0.42;
        return (
          <mesh key={i} position={[0.04 + (i + 0.5) * (0.95 / N), -0.25 + (i === N - 1 ? 0.04 : 0), z]} rotation={[0, Math.cos(f * 0.18 - i * 0.9) * 0.25 * wave, 0]} castShadow>
            <boxGeometry args={[0.95 / N + 0.004, h, 0.012]} />
            <meshStandardMaterial color={color} roughness={0.7} side={2} />
          </mesh>
        );
      })}
      {/* flores-de-lis estilizadas: 3 pontos dourados */}
      {[0.22, 0.42, 0.62].map((x, i) => (
        <mesh key={`fl${i}`} position={[x, -0.25 + (i % 2) * 0.12 - 0.06, Math.sin(f * 0.18 - (x / 0.95) * N * 0.9) * 0.06 * wave * (x / 0.95) + 0.009]}>
          <circleGeometry args={[0.035, 8]} />
          <meshStandardMaterial color="#d8b04a" roughness={0.4} side={2} />
        </mesh>
      ))}
    </group>
  );
};

const TUNICS = ["#cbbd9c", "#8c6b4a", "#7a7466", "#a88a5c", "#6e5a43", "#b5a27c", "#5f6152", "#9c7b55"];
const LEGWRAPS = ["#6a4a30", "#57402c", "#7a6048", "#4d3a2a"];
const BELTS = ["#3e2a1c", "#5a3a22", "#2f2a26"];
/** Trabalhadores neolíticos: túnica de lã/couro em tons de terra, perneiras e calçado de couro, cabelo comprido ou preso. */
export const neolithicLooks = (n: number, seed: number | string = 0): PersonLook[] => {
  const o = Math.floor(rand(`neo-${seed}`) * 97);
  const at = <T,>(arr: readonly T[], i: number, step: number) => arr[(o + i * step) % arr.length];
  const styles: PersonLook["hairStyle"][] = ["long", "short", "bun", "long", "short"];
  return Array.from({ length: n }, (_, i) => ({
    skin: at(SKINS, i, 3),
    hair: at(HAIRS, i, 5),
    hairStyle: at(styles, i, 2),
    tunic: at(TUNICS, i, 3),
    belt: at(BELTS, i, 1),
    sleeves: (o + i) % 3 === 0 ? "long" : "short",
    pants: at(LEGWRAPS, i, 1),
    shoes: "#4a3322",
  }));
};
