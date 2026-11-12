import { RoundedBox } from "@react-three/drei";
import { clamp, type Vec3 } from "../utils/animation";

// ANIMAIS low-poly no estilo da marca (mesma linguagem da Pessoa e do mascote: blocos arredondados, cores
// chapadas, olhinhos simples que piscam). Modelados em METROS reais, de frente para +x, patas em y = 0.
// Na maquete use a MESMA régua das pessoas: scale = uPorMetro (ex.: 1 m = 0,3 u3d → scale={0.3}).
// Animação por função pura do frame: walk (0..1) anda no lugar, rabo/orelhas/asas se mexem sozinhos.

type AProps = { frame?: number; position?: Vec3; rotY?: number; scale?: number; walk?: number; color?: string; seed?: number };

const rb = (args: [number, number, number], color: string, radius?: number) => (
  <RoundedBox args={args} radius={radius ?? Math.min(...args) * 0.3} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.7} metalness={0} />
  </RoundedBox>
);
const At: React.FC<{ p: Vec3; r?: Vec3; s?: Vec3 | number; children: React.ReactNode }> = ({ p, r, s, children }) => (
  <group position={p} rotation={r} scale={s}>
    {children}
  </group>
);
const Ball: React.FC<{ p: Vec3; s: Vec3; c: string; seg?: number }> = ({ p, s, c, seg = 12 }) => (
  <mesh position={p} scale={s} castShadow receiveShadow>
    <sphereGeometry args={[1, seg, Math.max(6, seg - 4)]} />
    <meshStandardMaterial color={c} roughness={0.7} flatShading />
  </mesh>
);

/** Olho: bolinha escura com brilho; pisca a cada ~3,5 s. Coloque nos dois lados (z ±). */
const Eye: React.FC<{ p: Vec3; r: number; frame: number; seed: number }> = ({ p, r, frame, seed }) => {
  const blink = (frame + seed * 37) % 105 < 4 ? 0.15 : 1;
  return (
    <group position={p} scale={[1, blink, 1]}>
      <mesh>
        <sphereGeometry args={[r, 10, 8]} />
        <meshStandardMaterial color="#1a1420" roughness={0.3} />
      </mesh>
      <mesh position={[r * 0.35, r * 0.35, r * 0.6]}>
        <sphereGeometry args={[r * 0.3, 6, 5]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};
const Eyes: React.FC<{ x: number; y: number; z: number; r: number; frame: number; seed: number }> = ({ x, y, z, r, frame, seed }) => (
  <>
    <Eye p={[x, y, z]} r={r} frame={frame} seed={seed} />
    <group scale={[1, 1, -1]}>
      <Eye p={[x, y, z]} r={r} frame={frame} seed={seed} />
    </group>
  </>
);

/** 4 patas com passada diagonal (trote). xs = [x dianteiro, x traseiro]; pés em y = 0. */
const Legs: React.FC<{ xs: [number, number]; z: number; hip: number; w: number; color: string; foot?: string; walk: number; frame: number; speed?: number }> = ({ xs, z, hip, w, color, foot, walk, frame, speed = 0.3 }) => {
  const ph = frame * speed;
  return (
    <>
      {xs.flatMap((x, i) =>
        [-1, 1].map((side) => {
          const a = walk * 0.45 * Math.sin(ph + (i === 0 ? 0 : Math.PI) + (side > 0 ? Math.PI : 0));
          return (
            <group key={`${i}${side}`} position={[x, hip, z * side]} rotation={[0, 0, a]}>
              <At p={[0, -hip / 2, 0]}>{rb([w, hip, w], color, w * 0.35)}</At>
              {foot ? <At p={[0, -hip + w * 0.18, 0]}>{rb([w * 1.08, w * 0.36, w * 1.08], foot, w * 0.12)}</At> : null}
            </group>
          );
        }),
      )}
    </>
  );
};

// ------------------------------------------------------------------------------------------ CACHORRO (0,9 m)
export const Dog: React.FC<AProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, walk = 0, color = "#c9874a", seed = 1 }) => {
  const wag = 0.6 * Math.sin(frame * 0.5);
  const bob = walk * 0.015 * Math.abs(Math.sin(frame * 0.3));
  return (
    <group position={[position[0], position[1] + bob * scale, position[2]]} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 0.42, 0]}>{rb([0.62, 0.28, 0.26], color, 0.1)}</At>
      <At p={[0.2, 0.4, 0]}>{rb([0.24, 0.26, 0.27], "#f0d9b5", 0.1)}</At>
      <Legs xs={[0.22, -0.22]} z={0.08} hip={0.32} w={0.08} color={color} foot="#f0d9b5" walk={walk} frame={frame} />
      {/* cabeça, focinho, nariz, orelhas caídas */}
      <At p={[0.38, 0.64, 0]} r={[0, 0, 0.1 * Math.sin(frame / 40)]}>
        {rb([0.26, 0.24, 0.22], color, 0.08)}
        <At p={[0.15, -0.04, 0]}>{rb([0.14, 0.11, 0.14], "#f0d9b5", 0.05)}</At>
        <At p={[0.225, -0.01, 0]}>{rb([0.04, 0.05, 0.06], "#1a1420", 0.02)}</At>
        <Eyes x={0.08} y={0.05} z={0.1} r={0.022} frame={frame} seed={seed} />
        {[-1, 1].map((sd) => (
          <At key={sd} p={[-0.04, 0.02, 0.12 * sd]} r={[0.25 * sd, 0, -0.2 + 0.08 * Math.sin(frame / 9)]}>
            <At p={[0, -0.07, 0]}>{rb([0.08, 0.16, 0.03], "#8a5a34", 0.015)}</At>
          </At>
        ))}
      </At>
      {/* rabo abanando */}
      <At p={[-0.32, 0.5, 0]} r={[wag * 0.6, 0, 0.9]}>
        <At p={[0, 0.1, 0]}>{rb([0.05, 0.2, 0.05], color, 0.02)}</At>
      </At>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ GATO (0,5 m)
export const Cat: React.FC<AProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, walk = 0, color = "#d98a4a", seed = 2 }) => {
  const sway = 0.3 * Math.sin(frame / 18);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 0.19, 0]}>{rb([0.42, 0.2, 0.17], color, 0.08)}</At>
      {[-0.1, 0.02].map((x) => (
        <At key={x} p={[x, 0.24, 0.086]}>{rb([0.035, 0.08, 0.004], "#c47538", 0.004)}</At>
      ))}
      <Legs xs={[0.14, -0.14]} z={0.05} hip={0.11} w={0.055} color={color} foot="#f2e6d6" walk={walk} frame={frame} speed={0.36} />
      <At p={[0.25, 0.3, 0]}>
        {rb([0.16, 0.14, 0.15], color, 0.05)}
        <At p={[0.08, -0.03, 0]}>{rb([0.05, 0.05, 0.08], "#f2e6d6", 0.02)}</At>
        <At p={[0.105, -0.015, 0]}>{rb([0.012, 0.016, 0.02], "#e07a8a", 0.005)}</At>
        <Eyes x={0.07} y={0.02} z={0.065} r={0.015} frame={frame} seed={seed} />
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[0, 0.09, 0.045 * sd]} castShadow>
            <coneGeometry args={[0.035, 0.07, 4]} />
            <meshStandardMaterial color={color} roughness={0.7} flatShading />
          </mesh>
        ))}
        {/* bigodes */}
        {[-1, 1].map((sd) => (
          <mesh key={`w${sd}`} position={[0.09, -0.03, 0.06 * sd]} rotation={[0, 0, 0.1]}>
            <boxGeometry args={[0.005, 0.005, 0.08]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ))}
      </At>
      {/* rabo em "?" balançando */}
      <At p={[-0.2, 0.23, 0]} r={[sway, 0, 0.5]}>
        <At p={[0, 0.1, 0]}>{rb([0.035, 0.2, 0.035], color, 0.015)}</At>
        <At p={[0.03, 0.2, 0]} r={[0, 0, -0.9]}>
          <At p={[0, 0.06, 0]}>{rb([0.035, 0.12, 0.035], color, 0.015)}</At>
        </At>
      </At>
    </group>
  );
};

/** Perna de cavalo em 2 segmentos (articula no joelho/jarrete), com meia clara e casco. */
const HorseLeg: React.FC<{ x: number; z: number; rear: boolean; phase: number; walk: number; frame: number; color: string }> = ({ x, z, rear, phase, walk, frame, color }) => {
  const t = frame * 0.22 + phase;
  const sw = walk * 0.38 * Math.sin(t);
  const bend = walk * 0.35 * Math.max(0, Math.sin(t + 1.2));
  const a1 = (rear ? -0.24 : 0.04) + sw;
  const a2 = (rear ? 0.34 : -0.03) + (rear ? -bend : bend);
  return (
    <group position={[x, rear ? 1.05 : 1.0, z]} rotation={[0, 0, a1]}>
      <At p={[0, -0.24, 0]}>{rb([rear ? 0.24 : 0.2, 0.52, 0.2], color, 0.08)}</At>
      <group position={[0, -0.48, 0]} rotation={[0, 0, a2]}>
        <At p={[0, -0.2, 0]}>{rb([0.11, 0.44, 0.11], color, 0.04)}</At>
        <At p={[0, -0.39, 0]}>{rb([0.13, 0.08, 0.13], "#efe6d6", 0.03)}</At>
        <At p={[0, -0.47, 0]}>{rb([0.15, 0.08, 0.15], "#2b2420", 0.03)}</At>
      </group>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ CAVALO (2,4 m; cernelha 1,6 m)
export const Horse: React.FC<AProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, walk = 0, color = "#8a5a3c", seed = 3 }) => {
  const nod = 0.05 * Math.sin(frame / 25) + walk * 0.05 * Math.sin(frame * 0.25);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 1.22, 0]}>{rb([1.5, 0.7, 0.6], color, 0.3)}</At>
      {/* peito e garupa arredondados */}
      <Ball p={[0.62, 1.28, 0]} s={[0.36, 0.4, 0.31]} c={color} />
      <Ball p={[-0.62, 1.3, 0]} s={[0.38, 0.4, 0.32]} c={color} />
      {/* pernas de cavalo: coxa grossa + canela fina + casco; traseiras com jarrete (ângulo para trás) */}
      {[
        [0.6, 0.2, false, 0],
        [0.6, -0.2, false, Math.PI],
        [-0.6, 0.2, true, Math.PI],
        [-0.6, -0.2, true, 0],
      ].map(([x, z, rear, ph]) => (
        <HorseLeg key={`${x}${z}`} x={Number(x)} z={Number(z)} rear={Boolean(rear)} phase={Number(ph)} walk={walk} frame={frame} color={color} />
      ))}
      {/* pescoço inclinado + cabeça */}
      <At p={[0.78, 1.62, 0]} r={[0, 0, -0.75 + nod]}>
        <At p={[0, 0.3, 0]}>{rb([0.4, 0.8, 0.32], color, 0.15)}</At>
        <At p={[-0.19, 0.36, 0]}>{rb([0.1, 0.86, 0.14], "#2b2420", 0.04)}</At>
        <At p={[0.1, 0.68, 0]} r={[0, 0, -0.85]}>
          <At p={[0.18, 0, 0]}>{rb([0.56, 0.24, 0.24], color, 0.09)}</At>
          <At p={[0.42, -0.02, 0]}>{rb([0.12, 0.2, 0.22], "#5e3b26", 0.06)}</At>
          <Eyes x={0.06} y={0.06} z={0.115} r={0.026} frame={frame} seed={seed} />
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[-0.06, 0.14, 0.07 * sd]} rotation={[0, 0, 0.3]} castShadow>
              <coneGeometry args={[0.04, 0.13, 4]} />
              <meshStandardMaterial color={color} roughness={0.7} flatShading />
            </mesh>
          ))}
        </At>
      </At>
      {/* rabo */}
      <At p={[-0.8, 1.45, 0]} r={[0.15 * Math.sin(frame / 14), 0, 0.35]}>
        <At p={[0, -0.32, 0]}>{rb([0.1, 0.65, 0.12], "#2b2420", 0.04)}</At>
      </At>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ VACA (2,4 m)
export const Cow: React.FC<AProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, walk = 0, seed = 4 }) => {
  const chew = 0.015 * Math.sin(frame * 0.35);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 1.02, 0]}>{rb([1.8, 0.85, 0.78], "#f2efe8", 0.3)}</At>
      {/* manchas (dos dois lados) */}
      {[
        [0.3, 1.15, 0.5, 0.4],
        [-0.45, 0.95, 0.42, 0.36],
        [-0.1, 1.32, 0.3, 0.2],
      ].map(([x, y, w, h], i) =>
        [-1, 1].map((sd) => (
          <At key={`${i}${sd}`} p={[x, y, 0.395 * sd]}>
            {rb([w, h, 0.01], "#2b2b33", 0.005)}
          </At>
        )),
      )}
      <Ball p={[-0.35, 0.6, 0]} s={[0.16, 0.1, 0.16]} c="#f2a7b5" />
      <Legs xs={[0.6, -0.6]} z={0.23} hip={0.68} w={0.21} color="#f2efe8" foot="#3a3030" walk={walk} frame={frame} speed={0.2} />
      <At p={[1.05, 1.08, 0]} r={[0, 0, -0.2 + 0.04 * Math.sin(frame / 30)]}>
        {rb([0.42, 0.38, 0.34], "#f2efe8", 0.1)}
        <At p={[0.22, -0.08 + chew, 0]}>{rb([0.12, 0.2, 0.3], "#f2b8c2", 0.06)}</At>
        <Eyes x={0.1} y={0.08} z={0.17} r={0.03} frame={frame} seed={seed} />
        {[-1, 1].map((sd) => (
          <group key={sd}>
            <mesh position={[-0.05, 0.23, 0.15 * sd]} rotation={[0.6 * sd, 0, 0]} castShadow>
              <coneGeometry args={[0.03, 0.14, 6]} />
              <meshStandardMaterial color="#e8dcc0" roughness={0.6} flatShading />
            </mesh>
            <At p={[-0.08, 0.1, 0.22 * sd]} r={[0.4 * sd, 0, 0]}>
              {rb([0.12, 0.06, 0.14], "#2b2b33", 0.02)}
            </At>
          </group>
        ))}
      </At>
      <At p={[-0.9, 1.3, 0]} r={[0.2 * Math.sin(frame / 16), 0, 0.2]}>
        <At p={[0, -0.35, 0]}>{rb([0.05, 0.7, 0.05], "#f2efe8", 0.02)}</At>
        <At p={[0, -0.72, 0]}>{rb([0.1, 0.14, 0.1], "#2b2b33", 0.04)}</At>
      </At>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ ELEFANTE (4,5 m; 3 m de altura)
export const Elephant: React.FC<AProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, walk = 0, color = "#8d8f99", seed = 5 }) => {
  const flap = 0.25 * Math.sin(frame / 12);
  const trunk = 0.12 * Math.sin(frame / 20);
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 2.0, 0]}>{rb([3.0, 1.9, 1.7], color, 0.75)}</At>
      <Legs xs={[0.95, -0.95]} z={0.5} hip={1.35} w={0.5} color={color} foot="#d9d4c7" walk={walk} frame={frame} speed={0.14} />
      <At p={[1.7, 2.45, 0]}>
        {rb([1.1, 1.15, 1.05], color, 0.45)}
        <Eyes x={0.3} y={0.15} z={0.5} r={0.06} frame={frame} seed={seed} />
        {/* orelhas grandes abanando */}
        {[-1, 1].map((sd) => (
          <At key={sd} p={[-0.2, 0.05, 0.52 * sd]} r={[0, flap * sd, 0]}>
            <Ball p={[-0.35, -0.05, 0.05 * sd]} s={[0.5, 0.65, 0.05]} c="#7a7c86" seg={14} />
            <Ball p={[-0.32, -0.05, 0.09 * sd]} s={[0.34, 0.47, 0.015]} c="#c9a3a8" seg={12} />
          </At>
        ))}
        {/* tromba em 4 segmentos */}
        <At p={[0.55, -0.2, 0]} r={[0, 0, -0.3 + trunk]}>
          <At p={[0, -0.25, 0]}>{rb([0.3, 0.55, 0.3], color, 0.12)}</At>
          <At p={[0, -0.5, 0]} r={[0, 0, -0.25 + trunk]}>
            <At p={[0, -0.25, 0]}>{rb([0.24, 0.55, 0.24], color, 0.1)}</At>
            <At p={[0, -0.5, 0]} r={[0, 0, -0.35 + trunk * 1.5]}>
              <At p={[0, -0.2, 0]}>{rb([0.19, 0.45, 0.19], color, 0.08)}</At>
            </At>
          </At>
        </At>
        {/* presas */}
        {[-1, 1].map((sd) => (
          <mesh key={`t${sd}`} position={[0.55, -0.45, 0.22 * sd]} rotation={[0, 0, 1.9]} castShadow>
            <coneGeometry args={[0.07, 0.6, 8]} />
            <meshStandardMaterial color="#f2ead8" roughness={0.4} flatShading />
          </mesh>
        ))}
      </At>
      <At p={[-1.5, 2.3, 0]} r={[0.2 * Math.sin(frame / 15), 0, 0.3]}>
        <At p={[0, -0.4, 0]}>{rb([0.08, 0.8, 0.08], color, 0.03)}</At>
      </At>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ PASSARINHO (15 cm)
export const Bird: React.FC<AProps & { fly?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, fly = 0, color = "#3f6db3", seed = 6 }) => {
  const f = clamp(fly, 0, 1);
  const wing = f > 0.01 ? 1.0 * Math.sin(frame * 1.1) : 0.1 * Math.sin(frame / 10);
  const hop = f > 0 ? 0 : Math.max(0, Math.sin(frame / 22)) ** 8 * 0.02;
  return (
    <group position={[position[0], position[1] + hop * scale, position[2]]} rotation={[0, rotY, 0]} scale={scale}>
      <Ball p={[0, 0.08, 0]} s={[0.075, 0.05, 0.045]} c={color} />
      <Ball p={[0.02, 0.07, 0]} s={[0.05, 0.04, 0.042]} c="#f2a05a" />
      <Ball p={[0.065, 0.115, 0]} s={[0.032, 0.032, 0.03]} c={color} />
      <mesh position={[0.1, 0.112, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.009, 0.03, 6]} />
        <meshStandardMaterial color="#f2c14e" roughness={0.5} flatShading />
      </mesh>
      <Eyes x={0.078} y={0.122} z={0.022} r={0.006} frame={frame} seed={seed} />
      {[-1, 1].map((sd) => (
        <At key={sd} p={[0, 0.095, 0.042 * sd]} r={[wing * sd, 0, 0]}>
          <At p={[-0.015, 0, 0.03 * sd]}>{rb([0.08, 0.01, 0.06], "#2f5591", 0.004)}</At>
        </At>
      ))}
      <At p={[-0.085, 0.09, 0]} r={[0, 0, 0.35]}>
        {rb([0.06, 0.008, 0.035], "#2f5591", 0.003)}
      </At>
      {f < 0.5
        ? [-1, 1].map((sd) => (
            <mesh key={`l${sd}`} position={[0.005, 0.02, 0.015 * sd]}>
              <boxGeometry args={[0.004, 0.04, 0.004]} />
              <meshStandardMaterial color="#e0a24a" />
            </mesh>
          ))
        : null}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ PEIXE (50 cm)
export const Fish: React.FC<AProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, color = "#f2884a", seed = 7 }) => {
  const swim = 0.35 * Math.sin(frame * 0.3);
  return (
    <group position={[position[0], position[1] + 0.02 * Math.sin(frame / 15) * scale, position[2]]} rotation={[0, rotY + 0.06 * Math.sin(frame * 0.3), 0]} scale={scale}>
      <Ball p={[0, 0, 0]} s={[0.25, 0.11, 0.06]} c={color} seg={14} />
      <Ball p={[0.02, -0.03, 0]} s={[0.2, 0.06, 0.055]} c="#ffe1b8" seg={12} />
      <At p={[0.06, 0.005, 0]}>{rb([0.025, 0.17, 0.122], "#f2f0ea", 0.01)}</At>
      <Eyes x={0.16} y={0.025} z={0.045} r={0.013} frame={frame} seed={seed} />
      {/* cauda (prisma triangular) balançando */}
      <group position={[-0.24, 0, 0]} rotation={[0, swim, 0]}>
        {[-1, 1].map((sd) => (
          <At key={sd} p={[-0.06, 0.05 * sd, 0]} r={[0, 0, 0.6 * sd]}>
            {rb([0.14, 0.06, 0.02], color, 0.01)}
          </At>
        ))}
      </group>
      <mesh position={[-0.02, 0.12, 0]} rotation={[Math.PI / 2, 0, -Math.PI / 2]} scale={[1, 0.15, 0.6]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 3]} />
        <meshStandardMaterial color={color} roughness={0.6} flatShading />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ BALEIA (14 m, genérica)
export const Whale: React.FC<AProps & { spout?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, color = "#4a5a78", spout = 1, seed = 8 }) => {
  const tail = 0.18 * Math.sin(frame / 20);
  return (
    <group position={[position[0], position[1] + 0.15 * Math.sin(frame / 30) * scale, position[2]]} rotation={[0, rotY, 0]} scale={scale}>
      <Ball p={[0, 0, 0]} s={[6.2, 1.7, 1.8]} c={color} seg={16} />
      <Ball p={[0.6, -0.55, 0]} s={[5.4, 1.15, 1.6]} c="#d6dbe4" seg={14} />
      {/* sulcos da garganta */}
      {[-0.75, -0.95, -1.15].map((y) => (
        <At key={y} p={[3.2, y, 1.25]} r={[0, 0.5, 0]}>
          {rb([2.6, 0.06, 0.02], "#b5bcc8", 0.01)}
        </At>
      ))}
      <Eyes x={4.2} y={-0.1} z={1.25} r={0.12} frame={frame} seed={seed} />
      {/* nadadeiras */}
      <At p={[2.4, -0.9, 1.6]} r={[0.6, 0.3, -0.4]}>
        {rb([2.4, 0.14, 0.7], color, 0.06)}
      </At>
      <mesh position={[-2.5, 1.55, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[1, 0.15, 0.6]}>
        <cylinderGeometry args={[0.7, 0.7, 0.5, 3]} />
        <meshStandardMaterial color={color} roughness={0.6} flatShading />
      </mesh>
      {/* cauda (pedúnculo + nadadeira em V) */}
      <group position={[-5.8, 0.2, 0]} rotation={[0, 0, tail]}>
        <Ball p={[-0.9, 0, 0]} s={[1.4, 0.55, 0.6]} c={color} seg={12} />
        {[-1, 1].map((sd) => (
          <At key={sd} p={[-2.1, 0.1, 0.9 * sd]} r={[0, 0.5 * sd, 0]}>
            {rb([1.2, 0.16, 1.8], color, 0.06)}
          </At>
        ))}
      </group>
      {/* borrifo pelo espiráculo */}
      {spout > 0.01
        ? Array.from({ length: 6 }, (_, i) => {
            const t = ((frame + i * 7) % 42) / 42;
            return (
              <mesh key={i} position={[2.6 - t * 0.6, 1.7 + t * 3.2, (i % 2 ? 0.2 : -0.2) * t]} scale={0.2 + t * 0.5}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#eef6ff" roughness={1} transparent opacity={0.7 * (1 - t) * spout} flatShading />
              </mesh>
            );
          })
        : null}
    </group>
  );
};
