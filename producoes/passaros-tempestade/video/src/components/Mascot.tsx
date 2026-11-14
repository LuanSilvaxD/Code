import { RoundedBox } from "@react-three/drei";
import { useCurrentFrame } from "remotion";
import { BRAND } from "../brand";
import { track } from "../data/scenes";
import { clamp, type Vec3 } from "../utils/animation";

// Mascote da Fenda Umbra: um astronautinha low-poly (cabeção, corpo curto, blocos arredondados).
// NÃO narra: é um personagem que aparece em todo vídeo, dentro do cenário do tema, e REAGE à história.
// Toda a animação é função pura do frame (sem estado) e misturável: os "modos" são pesos 0..1 que se somam.
//
// Proporção v3 ("esticado"): corpo e membros mais longos e capacete menor, perto da proporção da Pessoa.
// Escala: ~1,65 u3d de altura com scale=1 (a Pessoa tem ~1,8) (pés em y=0 do grupo). Na maquete, use scale 0,5–0,9 para ele
// ficar como "visitante" do diorama, nunca maior que o objeto explicado.

export type MascotPose = {
  /** frame global (para os ciclos de animação) */
  frame: number;
  position?: Vec3;
  /** rumo do corpo (rad); 0 = de frente para +z (câmera padrão) */
  rotY?: number;
  scale?: number;
  /** pesos 0..1 dos modos */
  walk?: number; // caminhar no lugar (combine com position animada)
  float?: number; // flutuar no espaço / na água (gira devagar, membros soltos)
  wave?: number; // acenar com a mão direita
  point?: number; // apontar com o braço direito para a frente do corpo
  jump?: number; // 0..1 altura do pulinho de surpresa (use spring)
  cheer?: number; // braços para cima (comemoração/revelação)
  /** virar a cabeça (rad), ex.: olhar para o objeto ou para a câmera */
  look?: number;
  /** sentado (0..1): pernas para frente, quadril desce ~0,47 (assento ~0,08 acima do pé) */
  sit?: number;
};

const C = {
  suit: "#eef0f6",
  suitShade: "#d6d9e4",
  joint: "#9aa3b8",
  visor: "#15112a",
  eye: "#d9ccff",
};

const box = (args: [number, number, number], color: string, extra?: { emissive?: string; emissiveIntensity?: number; radius?: number }) => (
  <RoundedBox args={args} radius={extra?.radius ?? Math.min(...args) * 0.28} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} emissive={extra?.emissive ?? "#000000"} emissiveIntensity={extra?.emissiveIntensity ?? 0} />
  </RoundedBox>
);

export const Mascot: React.FC<MascotPose> = ({ frame, position = [0, 0, 0], rotY = 0, scale = 1, walk = 0, float = 0, wave = 0, point = 0, jump = 0, cheer = 0, look = 0, sit = 0 }) => {
  const { accent, accentDeep } = BRAND.colors;
  const w = clamp(walk, 0, 1);
  const fl = clamp(float, 0, 1);
  const wv = clamp(wave, 0, 1);
  const pt = clamp(point, 0, 1);
  const ch = clamp(cheer, 0, 1);
  const ph = frame * 0.28; // ciclo da caminhada

  // corpo
  const breathe = 1 + 0.018 * Math.sin(frame / 14);
  const bob = w * 0.035 * Math.abs(Math.sin(ph)) + fl * 0.09 * Math.sin(frame / 22) + clamp(jump, 0, 1.3) * 0.45;
  const tiltZ = fl * 0.16 * Math.sin(frame / 37) + w * 0.04 * Math.sin(ph);
  const tiltX = fl * 0.12 * Math.sin(frame / 29 + 1) + w * 0.06;
  const drift = fl * 0.35 * Math.sin(frame / 61);

  // pernas
  const legSwing = w * 0.6 * Math.sin(ph);
  const legFloat = fl * (0.22 + 0.12 * Math.sin(frame / 19));
  // braços (rotação em x = para frente/trás; em z = abrir para o lado)
  const armSwing = w * 0.5 * Math.sin(ph);
  const armFloatZ = fl * (0.55 + 0.2 * Math.sin(frame / 23));
  const waveZ = wv * (2.55 + 0.38 * Math.sin(frame * 0.45));
  const pointX = pt * 1.45;
  const cheerZ = ch * (2.7 + 0.12 * Math.sin(frame * 0.35));

  // piscar: 4 frames a cada ~3,3 s (determinístico)
  const blinkT = frame % 100;
  const blink = blinkT < 4 ? 0.15 : 1;
  const antenna = 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(frame / 9));

  // rotação em z positiva levanta o braço DIREITO (x>0) para fora; o esquerdo usa o sinal oposto
  const rightArmZ = armFloatZ + waveZ + cheerZ;
  const leftArmZ = -(armFloatZ + cheerZ);
  return (
    <group position={[position[0], position[1] + bob - 0.47 * clamp(sit, 0, 1) * scale, position[2]]} rotation={[tiltX, rotY + drift, tiltZ]} scale={scale}>
      {/* pernas */}
      {[-1, 1].map((s) => (
        <group key={`leg${s}`} position={[0.095 * s, 0.55, 0]} rotation={[s * legSwing + legFloat * (s > 0 ? 1 : -0.6) - 1.5 * clamp(sit, 0, 1), 0, s * 0.06 * fl]}>
          <group position={[0, -0.235, 0]}>{box([0.125, 0.47, 0.15], C.suit)}</group>
          <group position={[0, -0.51, 0.02]}>{box([0.145, 0.08, 0.21], C.joint)}</group>
        </group>
      ))}
      {/* tronco */}
      <group position={[0, 0.85, 0]} scale={[1, breathe, 1]}>
        {box([0.38, 0.58, 0.28], C.suit)}
        {/* mochila */}
        <group position={[0, 0.04, -0.19]}>{box([0.3, 0.48, 0.12], C.suitShade)}</group>
        {/* emblema da fenda no peito */}
        <group position={[0, 0.08, 0.145]}>
          {box([0.18, 0.14, 0.03], BRAND.colors.umbra, { radius: 0.02 })}
          {[
            [-0.006, 0.05, 0.5],
            [0.012, 0.0, -0.6],
            [-0.008, -0.05, 0.5],
          ].map(([x, y, r], i) => (
            <mesh key={i} position={[x, y, 0.02]} rotation={[0, 0, r]}>
              <boxGeometry args={[0.018, 0.065, 0.01]} />
              <meshStandardMaterial color="#f5f0ff" emissive={accent} emissiveIntensity={1.2} />
            </mesh>
          ))}
        </group>
        {/* cinto */}
        <group position={[0, -0.26, 0]}>{box([0.4, 0.06, 0.3], C.joint, { radius: 0.02 })}</group>
      </group>
      {/* braços */}
      {[-1, 1].map((s) => {
        const right = s > 0;
        const rx = (right ? -armSwing - pointX : armSwing) + fl * 0.25 * Math.sin(frame / 27 + s);
        const rz = right ? rightArmZ : leftArmZ;
        return (
          <group key={`arm${s}`} position={[0.24 * s, 1.08, 0]} rotation={[rx, 0, rz]}>
            {/* ombreira roxa */}
            <group position={[0.015 * s, 0.03, 0]}>{box([0.13, 0.07, 0.17], accent, { emissive: accentDeep, emissiveIntensity: 0.25 })}</group>
            <group position={[0, -0.21, 0]}>{box([0.1, 0.42, 0.115], C.suit)}</group>
            <group position={[0, -0.45, 0]}>{box([0.115, 0.09, 0.125], C.joint)}</group>
          </group>
        );
      })}
      {/* cabeça (capacete) */}
      <group position={[0, 1.15, 0]} rotation={[0.05 * Math.sin(frame / 31) * (1 - w), look + 0.08 * Math.sin(frame / 47), wv * 0.12]}>
        <group position={[0, 0.25, 0]}>{box([0.5, 0.5, 0.47], C.suit, { radius: 0.12 })}</group>
        {/* visor */}
        <group position={[0, 0.24, 0.225]}>{box([0.37, 0.29, 0.06], C.visor, { emissive: accentDeep, emissiveIntensity: 0.28, radius: 0.09 })}</group>
        {/* reflexo do visor */}
        <mesh position={[-0.105, 0.33, 0.258]} rotation={[0, 0, 0.6]}>
          <boxGeometry args={[0.02, 0.09, 0.005]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.55} />
        </mesh>
        {/* olhinhos */}
        {[-1, 1].map((s) => (
          <mesh key={`eye${s}`} position={[0.068 * s, 0.24, 0.258]} scale={[1, blink, 1]}>
            <boxGeometry args={[0.058, 0.085, 0.01]} />
            <meshStandardMaterial color={C.eye} emissive={C.eye} emissiveIntensity={0.9} />
          </mesh>
        ))}
        {/* "fones" laterais com anel roxo */}
        {[-1, 1].map((s) => (
          <group key={`ear${s}`} position={[0.27 * s, 0.25, 0]} rotation={[0, 0, Math.PI / 2]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.05, 14]} />
              <meshStandardMaterial color={C.joint} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0.026 * s, 0]}>
              <cylinderGeometry args={[0.045, 0.045, 0.01, 14]} />
              <meshStandardMaterial color={accent} emissive={accent} emissiveIntensity={0.6} />
            </mesh>
          </group>
        ))}
        {/* antena com luz roxa */}
        <mesh position={[0.11, 0.55, 0]} castShadow>
          <cylinderGeometry args={[0.016, 0.016, 0.14, 6]} />
          <meshStandardMaterial color={C.joint} />
        </mesh>
        <mesh position={[0.11, 0.64, 0]}>
          <sphereGeometry args={[0.04, 12, 10]} />
          <meshStandardMaterial color="#f5f0ff" emissive={accent} emissiveIntensity={1.4 * antenna} />
        </mesh>
      </group>
    </group>
  );
};

/** Mascote dirigido pelas trilhas `mascot.*` do array de cenas (frames globais). */
export const MascotFromTracks: React.FC = () => {
  const frame = useCurrentFrame();
  const show = track("mascot.show", frame);
  if (show <= 0.001) return null;
  const t = (k: string, fb = 0) => track(`mascot.${k}`, frame, fb);
  return (
    <Mascot
      frame={frame}
      position={[t("x"), t("y"), t("z")]}
      rotY={t("rotY")}
      scale={t("scale", 0.7) * clamp(show, 0, 1)}
      walk={t("walk")}
      float={t("float")}
      wave={t("wave")}
      point={t("point")}
      jump={t("jump")}
      cheer={t("cheer")}
      sit={t("sit")}
      look={t("look")}
    />
  );
};
