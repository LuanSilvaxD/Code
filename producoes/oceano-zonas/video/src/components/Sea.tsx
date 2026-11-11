import { RoundedBox } from "@react-three/drei";
import { clamp, type Vec3 } from "../utils/animation";
import { Mascot } from "./Mascot";

// SERES E OBJETOS DO OCEANO (candidatos — aguardando aprovação do usuário antes de entrar na skill).
// Mesmo estilo de Animals.tsx: blocos arredondados, cores chapadas, olhos que piscam; METROS reais, frente +x.

type SProps = { frame?: number; position?: Vec3; rotY?: number; scale?: number; seed?: number; glow?: number };

const rb = (args: [number, number, number], color: string, radius?: number, emissive?: string, ei = 0) => (
  <RoundedBox args={args} radius={radius ?? Math.min(...args) * 0.3} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.65} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
  </RoundedBox>
);
const At: React.FC<{ p: Vec3; r?: Vec3; children: React.ReactNode }> = ({ p, r, children }) => (
  <group position={p} rotation={r}>
    {children}
  </group>
);
const Ball: React.FC<{ p: Vec3; s: Vec3; c: string; seg?: number; e?: string; ei?: number; o?: number }> = ({ p, s, c, seg = 14, e, ei = 0, o = 1 }) => (
  <mesh position={p} scale={s} castShadow={o >= 1} receiveShadow>
    <sphereGeometry args={[1, seg, Math.max(6, seg - 4)]} />
    <meshStandardMaterial color={c} roughness={0.6} flatShading emissive={e ?? "#000000"} emissiveIntensity={ei} transparent={o < 1} opacity={o} />
  </mesh>
);
const Glow: React.FC<{ p: Vec3; r: number; c: string; i?: number }> = ({ p, r, c, i = 1 }) => (
  <group position={p}>
    <mesh>
      <sphereGeometry args={[r, 10, 8]} />
      <meshBasicMaterial color={c} />
    </mesh>
    <mesh>
      <sphereGeometry args={[r * 2.6, 12, 10]} />
      <meshBasicMaterial color={c} transparent opacity={0.22 * i} depthWrite={false} />
    </mesh>
  </group>
);
const Eye: React.FC<{ p: Vec3; r: number; frame: number; seed: number; white?: boolean }> = ({ p, r, frame, seed, white }) => {
  const blink = (frame + seed * 37) % 110 < 4 ? 0.15 : 1;
  return (
    <>
      {[1, -1].map((sd) => (
        <group key={sd} position={[p[0], p[1], p[2] * sd]} scale={[1, blink, 1]}>
          {white ? (
            <mesh>
              <sphereGeometry args={[r * 1.35, 10, 8]} />
              <meshStandardMaterial color="#f2efe8" roughness={0.4} />
            </mesh>
          ) : null}
          <mesh position={[white ? r * 0.3 : 0, 0, white ? r * 0.35 * sd : 0]}>
            <sphereGeometry args={[r, 10, 8]} />
            <meshStandardMaterial color="#1a1420" roughness={0.3} />
          </mesh>
          <mesh position={[r * 0.5, r * 0.4, r * 0.6 * sd]}>
            <sphereGeometry args={[r * 0.3, 6, 5]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </>
  );
};
/** Nadadeira/cauda triangular (prisma de 3 lados) — vértice apontando para +x por padrão. */
const Fin: React.FC<{ p: Vec3; r: Vec3; size: number; thick: number; c: string; sy?: number }> = ({ p, r, size, thick, c, sy = 1 }) => (
  <group position={p} rotation={r}>
    <mesh rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[1, 1, sy]}>
      <cylinderGeometry args={[size, size, thick, 3]} />
      <meshStandardMaterial color={c} roughness={0.6} flatShading />
    </mesh>
  </group>
);

// ------------------------------------------------------------------------------------------ BATISFERA (2,2 m)
export const Bathysphere: React.FC<SProps & { lamp?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, lamp = 1 }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    {/* casco de vidro + anéis de metal + farol + cabo */}
    <Ball p={[0, 1.1, 0]} s={[1.1, 1.1, 1.1]} c="#bfe6ff" o={0.28} seg={24} />
    {[0, Math.PI / 2].map((a) => (
      <mesh key={a} position={[0, 1.1, 0]} rotation={[a, 0, 0]}>
        <torusGeometry args={[1.11, 0.06, 8, 32]} />
        <meshStandardMaterial color="#5b33d6" roughness={0.35} metalness={0.5} />
      </mesh>
    ))}
    <mesh position={[0, 1.1, 0]} rotation={[0, 0, Math.PI / 2]}>
      <torusGeometry args={[1.11, 0.05, 8, 32]} />
      <meshStandardMaterial color="#8d93a0" roughness={0.35} metalness={0.6} />
    </mesh>
    <At p={[0, 0.02, 0]}>{rb([1.0, 0.14, 1.0], "#3a3a44", 0.05)}</At>
    <At p={[1.12, 1.25, 0]} r={[0, 0, -Math.PI / 2]}>
      <mesh>
        <cylinderGeometry args={[0.12, 0.2, 0.3, 12]} />
        <meshStandardMaterial color="#c9ced8" metalness={0.5} roughness={0.3} />
      </mesh>
    </At>
    {lamp > 0.01 ? (
      <mesh position={[2.6, 1.0, 0]} rotation={[0, 0, Math.PI / 2 + 0.15]}>
        <coneGeometry args={[1.1, 2.8, 16, 1, true]} />
        <meshBasicMaterial color="#fff6d6" transparent opacity={0.18 * lamp} depthWrite={false} />
      </mesh>
    ) : null}
    <mesh position={[0, 2.9, 0]}>
      <cylinderGeometry args={[0.03, 0.03, 1.5, 6]} />
      <meshStandardMaterial color="#c9ced8" />
    </mesh>
    {/* o mascote sentado dentro */}
    <Mascot frame={frame} position={[0, 0.25, 0]} scale={0.95} float={0.3} rotY={0.4} />
  </group>
);

// ------------------------------------------------------------------------------------------ TARTARUGA MARINHA (1,1 m)
export const SeaTurtle: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 1 }) => {
  const flap = 0.5 * Math.sin(frame / 10);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <Ball p={[0, 0, 0]} s={[0.55, 0.18, 0.45]} c="#5b7a3a" />
      <Ball p={[0, -0.06, 0]} s={[0.5, 0.1, 0.42]} c="#e6d49a" />
      {[[-0.2, 0.17], [0.1, 0.18], [0.3, 0.12]].map(([x, y], i) => (
        <At key={i} p={[x, y, 0]}>{rb([0.18, 0.03, 0.22], "#6f8f48", 0.01)}</At>
      ))}
      <At p={[0.62, 0.02, 0]}>{rb([0.2, 0.14, 0.16], "#9aa86a", 0.06)}</At>
      <Eye p={[0.68, 0.05, 0.075]} r={0.018} frame={frame} seed={seed} />
      {[1, -1].map((sd) => (
        <group key={sd}>
          <At p={[0.25, -0.02, 0.4 * sd]} r={[flap * sd, 0.4 * sd, 0]}>
            <At p={[0, 0, 0.15 * sd]}>{rb([0.18, 0.03, 0.38], "#9aa86a", 0.012)}</At>
          </At>
          <At p={[-0.42, -0.04, 0.25 * sd]} r={[0, -0.5 * sd, 0]}>
            {rb([0.16, 0.03, 0.14], "#9aa86a", 0.012)}
          </At>
        </group>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ GOLFINHO (2,6 m)
export const Dolphin: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 2 }) => {
  const tail = 0.25 * Math.sin(frame / 8);
  return (
    <group position={position} rotation={[0, rotY, 0.08 * Math.sin(frame / 16)]} scale={scale}>
      <Ball p={[0, 0, 0]} s={[1.1, 0.3, 0.28]} c="#7d8fa8" seg={16} />
      <Ball p={[0.05, -0.1, 0]} s={[0.95, 0.18, 0.25]} c="#e3e8ef" seg={14} />
      <Ball p={[1.0, -0.04, 0]} s={[0.3, 0.07, 0.08]} c="#7d8fa8" />
      <Eye p={[0.8, 0.04, 0.2]} r={0.022} frame={frame} seed={seed} />
      <mesh position={[0.82, -0.04, 0.14]} rotation={[0, 0, -0.1]}>
        <torusGeometry args={[0.07, 0.008, 4, 10, Math.PI]} />
        <meshBasicMaterial color="#3a4152" />
      </mesh>
      <Fin p={[-0.1, 0.33, 0]} r={[0, 0, Math.PI / 2 - 0.6]} size={0.22} thick={0.05} c="#6b7c94" />
      <At p={[0.35, -0.2, 0.22]} r={[0.6, 0.3, -0.5]}>{rb([0.28, 0.03, 0.12], "#6b7c94", 0.012)}</At>
      <group position={[-1.05, 0.02, 0]} rotation={[0, 0, tail]}>
        <Ball p={[-0.2, 0, 0]} s={[0.3, 0.1, 0.1]} c="#7d8fa8" />
        {[1, -1].map((sd) => (
          <At key={sd} p={[-0.48, 0, 0.16 * sd]} r={[0, 0.6 * sd, 0]}>
            {rb([0.22, 0.03, 0.3], "#6b7c94", 0.012)}
          </At>
        ))}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ PEIXE-LANTERNA (8 cm)
export const Lanternfish: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 3, glow = 1 }) => {
  const sw = 0.35 * Math.sin(frame * 0.4 + seed);
  return (
    <group position={position} rotation={[0, rotY + 0.05 * Math.sin(frame * 0.4 + seed), 0]} scale={scale}>
      <Ball p={[0, 0, 0]} s={[0.04, 0.013, 0.008]} c="#4a5a78" />
      <Ball p={[0, -0.003, 0]} s={[0.036, 0.009, 0.0085]} c="#c9d3e6" />
      <Eye p={[0.026, 0.003, 0.006]} r={0.0055} frame={frame} seed={seed} white />
      {/* fileira de luzinhas na barriga (fotóforos) */}
      {Array.from({ length: 7 }, (_, i) => (
        <Glow key={i} p={[0.024 - i * 0.008, -0.009, 0.006]} r={0.0016} c="#7ad7ff" i={glow} />
      ))}
      <group position={[-0.04, 0, 0]} rotation={[0, sw, 0]}>
        {[1, -1].map((sd) => (
          <At key={sd} p={[-0.008, 0.005 * sd, 0]} r={[0, 0, 0.6 * sd]}>
            {rb([0.016, 0.005, 0.002], "#4a5a78", 0.001)}
          </At>
        ))}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ TAMBORIL (15 cm, fêmea de águas profundas)
// Corpo globoso escuro com BOCARRA em meia-lua e mandíbula de baixo projetada (prognata), dentes finos em leque,
// olhinho pequeno, nadadeiras curtas e a haste (ilício) saindo da testa com a isca luminosa (esca).
export const Anglerfish: React.FC<SProps & { bite?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 4, glow = 1, bite = 0 }) => {
  const sway = 0.12 * Math.sin(frame / 12);
  const open = 0.25 + 0.35 * clamp(bite, 0, 1);
  const SKIN = "#2a2230";
  const teeth = (n: number, r: number, up: boolean) =>
    Array.from({ length: n }, (_, i) => {
      const a = -0.9 + (i / (n - 1)) * 1.8; // leque ao longo da boca
      return (
        <mesh key={`${up}${i}`} position={[Math.cos(a) * r * 0.2, 0, Math.sin(a) * r * 0.9]} rotation={[0, 0, up ? Math.PI : 0]}>
          <coneGeometry args={[r * 0.035, r * (0.28 + 0.12 * (i % 2)), 4]} />
          <meshStandardMaterial color="#f4f1ea" roughness={0.3} />
        </mesh>
      );
    });
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* corpo + "testa" alta */}
      <Ball p={[0, 0.005, 0]} s={[0.07, 0.062, 0.055]} c={SKIN} seg={16} />
      <Ball p={[0.02, 0.03, 0]} s={[0.05, 0.04, 0.045]} c="#332a3a" seg={14} />
      {/* interior da boca (escuro) */}
      <Ball p={[0.05, -0.012, 0]} s={[0.03, 0.022, 0.05]} c="#120c16" seg={12} />
      {/* maxila (de cima) com dentes para baixo */}
      <group position={[0.062, -0.004, 0]}>{teeth(9, 0.045, true)}</group>
      {/* mandíbula de baixo, projetada para a frente, abre com bite */}
      <group position={[0.015, -0.028, 0]} rotation={[0, 0, -open * 0.7]}>
        <Ball p={[0.038, -0.004, 0]} s={[0.042, 0.013, 0.048]} c={SKIN} seg={14} />
        <group position={[0.05, 0.007, 0]}>{teeth(9, 0.045, false)}</group>
      </group>
      <Eye p={[0.045, 0.035, 0.04]} r={0.0055} frame={frame} seed={seed} />
      {/* nadadeiras peitoral, dorsal e caudal */}
      <At p={[-0.01, -0.02, 0.055]} r={[0.5, 0.2, 0.3]}>{rb([0.03, 0.004, 0.025], "#3a3042", 0.002)}</At>
      <Fin p={[-0.05, 0.05, 0]} r={[0, 0, Math.PI / 2 + 0.6]} size={0.018} thick={0.004} c="#3a3042" />
      <group position={[-0.075, 0, 0]} rotation={[0, 0.25 * Math.sin(frame / 9), 0]}>
        <Fin p={[-0.015, 0, 0]} r={[0, 0, Math.PI]} size={0.028} thick={0.005} c="#3a3042" sy={1.3} />
      </group>
      {/* ilício (haste curva em 3 gomos) + esca luminosa */}
      <group position={[0.035, 0.07, 0]} rotation={[0, 0, -0.35 + sway]}>
        {[0, 1, 2].map((i) => (
          <mesh key={i} position={[0.012 * i * i * 0.5, 0.022 + i * 0.03, 0]} rotation={[0, 0, -0.25 * i]}>
            <cylinderGeometry args={[0.0016, 0.0022, 0.032, 6]} />
            <meshStandardMaterial color="#3a3242" />
          </mesh>
        ))}
        <Glow p={[0.03, 0.1, 0]} r={0.0085} c="#9ff0ff" i={glow * (0.8 + 0.2 * Math.sin(frame / 6))} />
      </group>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ CAMARÃO VERMELHO DE ÁGUAS PROFUNDAS (10 cm)
export const DeepShrimp: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 5 }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    {Array.from({ length: 6 }, (_, i) => (
      <At key={i} p={[0.03 - i * 0.012, 0.004 * Math.sin(i * 0.8), 0]} r={[0, 0, -0.12 * i]}>
        {rb([0.016, 0.017 - i * 0.0015, 0.013 - i * 0.001], "#d8352f", 0.004)}
      </At>
    ))}
    <At p={[0.045, 0.002, 0]}>{rb([0.03, 0.016, 0.014], "#c9302b", 0.005)}</At>
    <Eye p={[0.055, 0.009, 0.006]} r={0.0025} frame={frame} seed={seed} />
    {/* antenas longas */}
    {[1, -1].map((sd) => (
      <mesh key={sd} position={[0.1, 0.01, 0.004 * sd]} rotation={[0, 0.1 * sd, -1.45 + 0.05 * Math.sin(frame / 9 + sd)]}>
        <cylinderGeometry args={[0.0006, 0.0006, 0.1, 4]} />
        <meshStandardMaterial color="#e5544d" />
      </mesh>
    ))}
    {Array.from({ length: 5 }, (_, i) => (
      <mesh key={`l${i}`} position={[0.035 - i * 0.012, -0.012, 0]} rotation={[0, 0, 0.3 * Math.sin(frame / 5 + i)]}>
        <cylinderGeometry args={[0.0008, 0.0008, 0.014, 4]} />
        <meshStandardMaterial color="#e5544d" />
      </mesh>
    ))}
    <Fin p={[-0.045, -0.004, 0]} r={[0, 0, Math.PI - 0.3]} size={0.012} thick={0.003} c="#d8352f" />
  </group>
);

// ------------------------------------------------------------------------------------------ ÁGUA-VIVA BIOLUMINESCENTE (sino 15 cm)
export const Jellyfish: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, glow = 1 }) => {
  const pulse = 1 + 0.12 * Math.sin(frame / 8);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <mesh scale={[pulse, 1 / pulse, pulse]}>
        <sphereGeometry args={[0.075, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#b37bff" emissive="#8b5cf6" emissiveIntensity={0.6 * glow} transparent opacity={0.75} roughness={0.2} side={2} />
      </mesh>
      <Ball p={[0, 0.015, 0]} s={[0.035, 0.025, 0.035]} c="#ff7ad9" e="#ff7ad9" ei={0.8 * glow} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Glow key={i} p={[Math.cos(a) * 0.072 * pulse, 0.002, Math.sin(a) * 0.072 * pulse]} r={0.004} c="#c4f1ff" i={glow} />;
      })}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const w = 0.012 * Math.sin(frame / 10 + i);
        return (
          <mesh key={`t${i}`} position={[Math.cos(a) * 0.05 + w, -0.07, Math.sin(a) * 0.05]}>
            <cylinderGeometry args={[0.0015, 0.0008, 0.14, 4]} />
            <meshStandardMaterial color="#d9b8ff" emissive="#8b5cf6" emissiveIntensity={0.4 * glow} transparent opacity={0.8} />
          </mesh>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ CACHALOTE (16 m)
export const SpermWhale: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 6 }) => {
  const tail = 0.15 * Math.sin(frame / 18);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* cabeçorra quadrada (1/3 do corpo) + corpo afinando */}
      <At p={[4.6, 0.2, 0]}>{rb([5.6, 3.0, 2.6], "#5a5f6e", 0.9)}</At>
      <Ball p={[0, 0, 0]} s={[4.6, 1.5, 1.4]} c="#5a5f6e" seg={16} />
      <Ball p={[-3.8, 0.1, 0]} s={[2.4, 0.8, 0.7]} c="#5a5f6e" seg={12} />
      {/* mandíbula fina embaixo com dentes */}
      <At p={[4.4, -1.45, 0]}>{rb([4.4, 0.35, 0.7], "#e6e2da", 0.15)}</At>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[2.6 + i * 0.45, -1.2, 0.3]}>
          <coneGeometry args={[0.07, 0.22, 5]} />
          <meshStandardMaterial color="#f2efe8" />
        </mesh>
      ))}
      <Eye p={[2.4, -0.35, 1.32]} r={0.12} frame={frame} seed={seed} />
      {/* pele enrugada (faixas) */}
      {[-1.5, -0.6, 0.3].map((x) => (
        <At key={x} p={[x, 0.3, 1.32]}>{rb([0.1, 1.6, 0.04], "#4d5260", 0.02)}</At>
      ))}
      <At p={[1.6, -0.8, 1.2]} r={[0.5, 0.2, -0.4]}>{rb([1.1, 0.12, 0.45], "#4d5260", 0.05)}</At>
      {/* corcova dorsal + cauda */}
      <Ball p={[-2.4, 1.15, 0]} s={[0.6, 0.35, 0.3]} c="#5a5f6e" />
      <group position={[-6.0, 0.1, 0]} rotation={[0, 0, tail]}>
        {[1, -1].map((sd) => (
          <At key={sd} p={[-0.9, 0, 1.0 * sd]} r={[0, 0.5 * sd, 0]}>
            {rb([1.4, 0.18, 2.0], "#4d5260", 0.08)}
          </At>
        ))}
      </group>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ LULA (1 m, de manto ~45 cm)
// Nada "de costas": manto à frente (+x) com as 2 nadadeiras em losango na ponta; atrás, cabeça com olhos grandes,
// 8 braços curtos e 2 tentáculos longos com "clava" na ponta. Pele laranja-avermelhada com pintinhas (cromatóforos).
export const Squid: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 7 }) => {
  const pulse = 1 + 0.05 * Math.sin(frame / 7);
  const C = "#e0755f";
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* manto alongado (tubo afinando até a ponta) */}
      <Ball p={[0.12, 0, 0]} s={[0.24, 0.062 * pulse, 0.062 * pulse]} c={C} seg={16} />
      <mesh position={[0.34, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.05, 0.16, 14]} />
        <meshStandardMaterial color={C} roughness={0.55} flatShading />
      </mesh>
      {/* nadadeiras em losango na ponta do manto */}
      <mesh position={[0.33, 0, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1.2, 1, 0.08]}>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 4]} />
        <meshStandardMaterial color="#d4644f" roughness={0.6} flatShading />
      </mesh>
      {/* pintinhas (cromatóforos) */}
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[0.0 + (i % 5) * 0.06, 0.035 - Math.floor(i / 5) * 0.03, 0.055]}>
          <sphereGeometry args={[0.007, 6, 5]} />
          <meshStandardMaterial color="#9c3b2c" />
        </mesh>
      ))}
      {/* cabeça + olhos grandes */}
      <Ball p={[-0.15, 0, 0]} s={[0.06, 0.05, 0.055]} c="#e88a74" seg={14} />
      <Eye p={[-0.15, 0.012, 0.05]} r={0.016} frame={frame} seed={seed} white />
      {/* 8 braços (curtos, ondulando) */}
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const w = 0.18 * Math.sin(frame / 8 + i);
        return (
          <group key={`a${i}`} position={[-0.2, Math.sin(a) * 0.022, Math.cos(a) * 0.022]} rotation={[Math.sin(a) * 0.15, Math.cos(a) * 0.15, Math.PI / 2 + w]}>
            <mesh position={[0, 0.09, 0]}>
              <cylinderGeometry args={[0.004, 0.011, 0.18, 6]} />
              <meshStandardMaterial color="#e88a74" roughness={0.6} />
            </mesh>
          </group>
        );
      })}
      {/* 2 tentáculos longos com clava */}
      {[1, -1].map((sd) => {
        const w = 0.12 * Math.sin(frame / 10 + sd);
        return (
          <group key={`t${sd}`} position={[-0.2, -0.01, 0.012 * sd]} rotation={[0.08 * sd, 0, Math.PI / 2 + 0.05 * sd + w]}>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.003, 0.005, 0.4, 5]} />
              <meshStandardMaterial color="#e88a74" roughness={0.6} />
            </mesh>
            <Ball p={[0, 0.42, 0]} s={[0.012, 0.035, 0.01]} c="#d4644f" />
          </group>
        );
      })}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ PEPINO-DO-MAR (30 cm)
export const SeaCucumber: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1 }) => {
  const k = 1 + 0.05 * Math.sin(frame / 20);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <Ball p={[0, 0.045, 0]} s={[0.15 * k, 0.045, 0.05]} c="#e8a0b4" e="#c4607a" ei={0.15} />
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.1 + i * 0.04, 0.085, 0]}>
          <coneGeometry args={[0.008, 0.035, 5]} />
          <meshStandardMaterial color="#f2c2cf" roughness={0.6} />
        </mesh>
      ))}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={`f${i}`} position={[0.155 * k, 0.05 + 0.012 * Math.sin(i * 1.3), (i - 2) * 0.012]} rotation={[0, 0, -0.3]}>
          <cylinderGeometry args={[0.003, 0.003, 0.03, 4]} />
          <meshStandardMaterial color="#f2c2cf" />
        </mesh>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ PEIXE-CARACOL (25 cm, translúcido)
// Formato de "girino": cabeça grande e redonda, corpo gelatinoso que afina numa cauda longa, nadadeira contínua em
// cima e embaixo, peitorais grandes em leque; rosado translúcido (dá para ver o "fígado" escuro por dentro).
export const Snailfish: React.FC<SProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, seed = 8 }) => {
  const segs = 6;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <Ball p={[0.04, 0, 0]} s={[0.055, 0.048, 0.045]} c="#f6cdd3" o={0.85} seg={16} />
      <Ball p={[0.03, -0.006, 0]} s={[0.025, 0.018, 0.02]} c="#b8606f" />
      <Eye p={[0.075, 0.016, 0.034]} r={0.0065} frame={frame} seed={seed} />
      <mesh position={[0.088, -0.012, 0.02]} rotation={[0, 0, -0.2]}>
        <torusGeometry args={[0.009, 0.0015, 4, 8, Math.PI]} />
        <meshBasicMaterial color="#c97c88" />
      </mesh>
      {/* corpo afinando em gomos que ondulam (natação de enguia) */}
      {Array.from({ length: segs }, (_, i) => {
        const t = (i + 1) / segs;
        const z = 0.012 * Math.sin(frame / 7 - i * 0.7) * t;
        return <Ball key={i} p={[0.0 - t * 0.17, 0, z]} s={[0.035, 0.04 * (1 - t * 0.8), 0.035 * (1 - t * 0.85)]} c="#f6cdd3" o={0.8} seg={12} />;
      })}
      {/* nadadeiras contínuas (dorsal e anal) */}
      <Ball p={[-0.1, 0.027, 0]} s={[0.07, 0.009, 0.003]} c="#fbe1e5" o={0.55} />
      <Ball p={[-0.1, -0.025, 0]} s={[0.065, 0.008, 0.003]} c="#fbe1e5" o={0.55} />
      {/* peitorais grandes em leque */}
      {[1, -1].map((sd) => (
        <At key={sd} p={[0.02, -0.015, 0.042 * sd]} r={[0.6 * sd + 0.15 * Math.sin(frame / 8) * sd, 0, 0.3]}>
          <Ball p={[-0.012, 0, 0.01 * sd]} s={[0.028, 0.004, 0.02]} c="#fbe1e5" o={0.7} />
        </At>
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ MONTE EVEREST (8,849 km) — em QUILÔMETROS
// Modelado em km (1 unidade = 1 km) para a coluna em escala real (1 km = 1 u3d): pico em y = 8,849.
export const Everest: React.FC<SProps> = ({ position = [0, 0, 0], rotY = 0, scale = 1 }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    <mesh position={[0, 4.4245, 0]} castShadow>
      <coneGeometry args={[6.2, 8.849, 5]} />
      <meshStandardMaterial color="#6f6a78" roughness={0.9} flatShading />
    </mesh>
    <mesh position={[-4.2, 2.6, 0.9]} castShadow>
      <coneGeometry args={[4.2, 5.2, 5]} />
      <meshStandardMaterial color="#7d7886" roughness={0.9} flatShading />
    </mesh>
    <mesh position={[4.4, 2.2, -0.6]} castShadow>
      <coneGeometry args={[4.0, 4.4, 5]} />
      <meshStandardMaterial color="#655f6e" roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0, 7.59, 0]}>
      <coneGeometry args={[1.88, 2.52, 5]} />
      <meshStandardMaterial color="#f2f4f8" roughness={0.6} flatShading />
    </mesh>
    <mesh position={[-4.2, 4.5, 0.9]}>
      <coneGeometry args={[1.15, 1.42, 5]} />
      <meshStandardMaterial color="#e8ecf2" roughness={0.6} flatShading />
    </mesh>
  </group>
);
