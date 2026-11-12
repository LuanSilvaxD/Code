import { RoundedBox } from "@react-three/drei";
import { clamp, type Vec3 } from "../utils/animation";

// VEÍCULOS low-poly no estilo da marca (blocos arredondados, cores chapadas, janelas de vidro escuro).
// Todos modelados em METROS reais, de frente para +x, rodas/casco apoiados em y = 0. Na maquete, passe
// `scale = uPorMetro` (a MESMA régua das pessoas: worldScale(u)) — ex.: 1 m = 0,3 u3d → scale={0.3}.
// `frame` gira rodas/hélices e anima fumaça/chama; `speed` (0..1) controla o giro das rodas.

type VProps = { frame?: number; position?: Vec3; rotY?: number; scale?: number; speed?: number; color?: string };

const GLASS = "#22304a";
const GLASS_HI = "#5d7aa6";
const TIRE = "#1d1a22";
const HUB = "#c9ced8";
const DARK = "#2b2b33";

const rb = (args: [number, number, number], color: string, radius?: number, emissive?: string, ei = 0) => (
  <RoundedBox args={args} radius={radius ?? Math.min(...args) * 0.18} smoothness={3} castShadow receiveShadow>
    <meshStandardMaterial color={color} roughness={0.55} metalness={0.05} emissive={emissive ?? "#000000"} emissiveIntensity={ei} />
  </RoundedBox>
);
const At: React.FC<{ p: Vec3; r?: Vec3; children: React.ReactNode }> = ({ p, r, children }) => (
  <group position={p} rotation={r}>
    {children}
  </group>
);

/** Roda vista de lado: pneu + aro + raios (gira com o frame). Eixo em z. */
const Wheel: React.FC<{ p: Vec3; r: number; frame: number; speed: number; width?: number }> = ({ p, r, frame, speed, width = 0.25 }) => {
  const rot = (-frame * 0.25 * speed) / r;
  return (
    <group position={p} rotation={[0, 0, rot]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[r, r, width, 20]} />
        <meshStandardMaterial color={TIRE} roughness={0.9} flatShading />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, width / 2 + 0.005]}>
        <cylinderGeometry args={[r * 0.58, r * 0.58, 0.02, 16]} />
        <meshStandardMaterial color={HUB} roughness={0.35} metalness={0.5} flatShading />
      </mesh>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0, width / 2 + 0.02]} rotation={[0, 0, (i * Math.PI) / 3]}>
          <boxGeometry args={[r * 1.05, r * 0.1, 0.02]} />
          <meshStandardMaterial color="#8d93a0" roughness={0.4} metalness={0.4} />
        </mesh>
      ))}
    </group>
  );
};

/** Janela lateral: vidro escuro com um reflexo diagonal claro. */
const Win: React.FC<{ p: Vec3; w: number; h: number; z: number }> = ({ p, w, h, z }) => (
  <group position={[p[0], p[1], z]}>
    <mesh>
      <boxGeometry args={[w, h, 0.03]} />
      <meshStandardMaterial color={GLASS} roughness={0.2} metalness={0.3} />
    </mesh>
    <mesh position={[-w * 0.15, 0, 0.02]} rotation={[0, 0, 0.5]}>
      <boxGeometry args={[w * 0.12, h * 1.05, 0.01]} />
      <meshBasicMaterial color={GLASS_HI} transparent opacity={0.55} />
    </mesh>
  </group>
);

// ------------------------------------------------------------------------------------------ CARRO (4,3 m)
export const Car: React.FC<VProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, speed = 0, color = "#3f6db3" }) => {
  const z = 0.91;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* carroceria baixa + cabine recuada */}
      <At p={[0, 0.66, 0]}>{rb([4.3, 0.72, 1.8], color, 0.28)}</At>
      <At p={[-0.25, 1.22, 0]}>{rb([2.3, 0.6, 1.62], color, 0.26)}</At>
      <Win p={[0.42, 1.22, 0]} w={0.95} h={0.42} z={z - 0.09} />
      <Win p={[-0.72, 1.22, 0]} w={0.95} h={0.42} z={z - 0.09} />
      {/* frisos, maçaneta, retrovisor */}
      <At p={[0, 0.62, z + 0.005]}>{rb([4.0, 0.05, 0.02], "#e8e6e1", 0.01)}</At>
      <At p={[-0.15, 0.82, z + 0.01]}>{rb([0.02, 0.5, 0.01], "#1d2a44", 0.004)}</At>
      <At p={[0.95, 1.06, z + 0.06]}>{rb([0.16, 0.1, 0.14], color, 0.04)}</At>
      {/* faróis e lanternas */}
      <At p={[2.13, 0.78, 0.6]}>{rb([0.08, 0.16, 0.36], "#fff6d6", 0.04, "#fff1b0", 0.8)}</At>
      <At p={[-2.13, 0.8, 0.6]}>{rb([0.08, 0.14, 0.34], "#e5383b", 0.04, "#e5383b", 0.6)}</At>
      <At p={[2.12, 0.42, 0]}>{rb([0.12, 0.16, 1.7], DARK, 0.05)}</At>
      <At p={[-2.12, 0.42, 0]}>{rb([0.12, 0.16, 1.7], DARK, 0.05)}</At>
      {[1.38, -1.38].map((x) => (
        <Wheel key={x} p={[x, 0.33, 0.8]} r={0.33} frame={frame} speed={speed} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ ÔNIBUS (12 m)
export const Bus: React.FC<VProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, speed = 0, color = "#d9b44a" }) => {
  const z = 1.26;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 1.75, 0]}>{rb([12, 2.7, 2.5], color, 0.35)}</At>
      <At p={[0, 0.62, 0]}>{rb([11.8, 0.5, 2.46], DARK, 0.12)}</At>
      {/* faixa de janelas + para-brisa + porta */}
      {Array.from({ length: 7 }, (_, i) => (
        <Win key={i} p={[-4.6 + i * 1.35, 2.25, 0]} w={1.15} h={0.95} z={z} />
      ))}
      <Win p={[5.62, 2.05, 0]} w={0.6} h={1.5} z={z - 0.1} />
      <At p={[4.55, 1.55, z + 0.01]}>{rb([0.95, 2.1, 0.03], "#1d2a44", 0.04)}</At>
      <At p={[4.55, 1.55, z + 0.03]}>{rb([0.04, 2.0, 0.01], "#8d93a0", 0.01)}</At>
      <At p={[0, 1.15, z + 0.01]}>{rb([11.6, 0.14, 0.02], "#e8e6e1", 0.02)}</At>
      <At p={[6.02, 0.95, 0.85]}>{rb([0.06, 0.22, 0.5], "#fff6d6", 0.04, "#fff1b0", 0.8)}</At>
      <At p={[-6.02, 0.95, 0.85]}>{rb([0.06, 0.22, 0.5], "#e5383b", 0.04, "#e5383b", 0.6)}</At>
      {[3.9, -3.6].map((x) => (
        <Wheel key={x} p={[x, 0.5, 1.12]} r={0.5} frame={frame} speed={speed} width={0.3} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ CAMINHÃO (10,5 m)
export const Truck: React.FC<VProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, speed = 0, color = "#c4704f" }) => {
  const z = 1.26;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* chassi */}
      <At p={[0, 0.85, 0]}>{rb([10.4, 0.3, 2.2], DARK, 0.08)}</At>
      {/* cabine */}
      <At p={[4.15, 1.95, 0]}>{rb([2.1, 2.3, 2.45], color, 0.3)}</At>
      <At p={[4.25, 3.25, 0]}>{rb([1.7, 0.35, 2.3], color, 0.15)}</At>
      <Win p={[4.55, 2.45, 0]} w={0.95} h={0.85} z={z} />
      <At p={[3.6, 1.75, z + 0.01]}>{rb([0.02, 1.1, 0.01], "#7a4632", 0.004)}</At>
      <At p={[5.22, 1.25, 0]}>{rb([0.08, 0.45, 2.1], "#8d93a0", 0.04)}</At>
      <At p={[5.2, 1.65, 0.85]}>{rb([0.06, 0.2, 0.4], "#fff6d6", 0.04, "#fff1b0", 0.8)}</At>
      {/* baú de carga */}
      <At p={[-1.15, 2.45, 0]}>{rb([7.6, 2.9, 2.5], "#e8e6e1", 0.18)}</At>
      {Array.from({ length: 6 }, (_, i) => (
        <At key={i} p={[-4.3 + i * 1.26, 2.45, z + 0.01]}>
          {rb([0.05, 2.7, 0.02], "#cfcbc2", 0.01)}
        </At>
      ))}
      <At p={[-1.15, 2.45, z + 0.02]}>{rb([4.2, 0.6, 0.02], color, 0.08)}</At>
      <At p={[-4.98, 1.2, 0.85]}>{rb([0.06, 0.18, 0.4], "#e5383b", 0.04, "#e5383b", 0.6)}</At>
      {[4.1, -2.6, -3.75].map((x) => (
        <Wheel key={x} p={[x, 0.52, 1.1]} r={0.52} frame={frame} speed={speed} width={0.32} />
      ))}
    </group>
  );
};

// ------------------------------------------------------------------------------------------ TREM (locomotiva a vapor 11 m + vagão 12 m)
export const SteamLocomotive: React.FC<VProps & { smoke?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, speed = 0, color = "#2f3d52", smoke = 1 }) => {
  const z = 1.05;
  const big = [-0.2, 1.55, 3.3];
  const crank = (-frame * 0.25 * speed) / 0.8;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      {/* plataforma e caldeira */}
      <At p={[0, 1.25, 0]}>{rb([10.4, 0.35, 2.4], DARK, 0.08)}</At>
      <mesh position={[1.6, 2.45, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.95, 0.95, 6.0, 20]} />
        <meshStandardMaterial color={color} roughness={0.45} metalness={0.25} flatShading />
      </mesh>
      {[0.2, 1.8, 3.4].map((x) => (
        <mesh key={x} position={[x, 2.45, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.98, 0.98, 0.12, 20]} />
          <meshStandardMaterial color="#c9a14a" roughness={0.3} metalness={0.6} flatShading />
        </mesh>
      ))}
      <mesh position={[4.62, 2.45, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.9, 0.9, 0.08, 20]} />
        <meshStandardMaterial color="#1d2430" roughness={0.5} flatShading />
      </mesh>
      {/* chaminé, domo, sino, farol */}
      <mesh position={[3.8, 3.75, 0]} castShadow>
        <cylinderGeometry args={[0.38, 0.26, 0.95, 14]} />
        <meshStandardMaterial color="#1d2430" roughness={0.5} flatShading />
      </mesh>
      <mesh position={[1.7, 3.45, 0]} castShadow>
        <sphereGeometry args={[0.42, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c9a14a" roughness={0.3} metalness={0.6} flatShading />
      </mesh>
      <At p={[4.75, 2.95, 0]}>{rb([0.3, 0.35, 0.4], "#fff6d6", 0.08, "#fff1b0", 1.0)}</At>
      {/* cabine do maquinista */}
      <At p={[-2.75, 2.75, 0]}>{rb([2.3, 2.6, 2.5], "#8e2f3a", 0.18)}</At>
      <At p={[-2.75, 4.15, 0]}>{rb([2.7, 0.22, 2.7], DARK, 0.08)}</At>
      <Win p={[-2.6, 3.2, 0]} w={1.0} h={0.8} z={z + 0.21} />
      {/* limpa-trilhos */}
      <mesh position={[5.35, 0.7, 0]} rotation={[0, 0, -0.6]} castShadow>
        <boxGeometry args={[0.9, 0.12, 2.0]} />
        <meshStandardMaterial color="#8e2f3a" roughness={0.6} flatShading />
      </mesh>
      {/* rodas: 3 grandes motrizes + 2 pequenas na frente, com biela */}
      {big.map((x) => (
        <Wheel key={x} p={[x, 0.8, z]} r={0.8} frame={frame} speed={speed} width={0.18} />
      ))}
      {[4.4, -4.4].map((x) => (
        <Wheel key={x} p={[x, 0.45, z]} r={0.45} frame={frame} speed={speed} width={0.16} />
      ))}
      <group position={[1.55 + 0.4 * Math.cos(crank), 0.8 + 0.4 * Math.sin(crank), z + 0.16]}>
        <mesh>
          <boxGeometry args={[3.6, 0.12, 0.06]} />
          <meshStandardMaterial color="#c9ced8" roughness={0.3} metalness={0.6} />
        </mesh>
      </group>
      {/* fumaça (anéis subindo) */}
      {smoke > 0.01
        ? Array.from({ length: 6 }, (_, i) => {
            const t = ((frame + i * 10) % 60) / 60;
            return (
              <mesh key={i} position={[3.8 - t * 2.4, 4.3 + t * 2.0, 0]} scale={0.45 + t * 1.1}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#e9e4f2" roughness={1} transparent opacity={0.6 * (1 - t) * smoke} flatShading />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

export const PassengerCar: React.FC<VProps> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, speed = 0, color = "#3f6b4a" }) => {
  const z = 1.31;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale}>
      <At p={[0, 2.35, 0]}>{rb([12, 2.6, 2.6], color, 0.22)}</At>
      <At p={[0, 3.72, 0]}>{rb([12.2, 0.42, 2.7], "#2b2b33", 0.2)}</At>
      {Array.from({ length: 7 }, (_, i) => (
        <Win key={i} p={[-4.8 + i * 1.6, 2.65, 0]} w={1.1} h={0.85} z={z} />
      ))}
      <At p={[0, 1.6, z + 0.01]}>{rb([11.8, 0.12, 0.02], "#c9a14a", 0.02)}</At>
      <At p={[0, 1.0, 0]}>{rb([11.4, 0.3, 2.2], DARK, 0.06)}</At>
      {[-4.6, -3.4, 3.4, 4.6].map((x) => (
        <Wheel key={x} p={[x, 0.45, 1.05]} r={0.45} frame={frame} speed={speed} width={0.16} />
      ))}
    </group>
  );
};

/** Trilho (dormentes + 2 trilhos) ao longo de x, centrado na origem. */
export const Rails: React.FC<{ length: number; position?: Vec3; scale?: number }> = ({ length, position = [0, 0, 0], scale = 1 }) => (
  <group position={position} scale={scale}>
    {Array.from({ length: Math.floor(length / 0.9) }, (_, i) => (
      <mesh key={i} position={[-length / 2 + 0.45 + i * 0.9, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.28, 0.12, 2.6]} />
        <meshStandardMaterial color="#6b4b3a" roughness={0.9} flatShading />
      </mesh>
    ))}
    {[-0.72, 0.72].map((zz) => (
      <mesh key={zz} position={[0, 0.17, zz]}>
        <boxGeometry args={[length, 0.1, 0.08]} />
        <meshStandardMaterial color="#9aa1ad" roughness={0.3} metalness={0.7} />
      </mesh>
    ))}
  </group>
);

// ------------------------------------------------------------------------------------------ NAVIO CARGUEIRO (60 m, estilizado)
const CONTAINER_COLORS = ["#c4704f", "#3f6db3", "#d9b44a", "#3f6b4a", "#8b6aa8", "#e8e6e1", "#2f7d8c"];
export const CargoShip: React.FC<VProps & { bob?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, bob = 1 }) => {
  const roll = 0.012 * Math.sin(frame / 40) * bob;
  return (
    <group position={[position[0], position[1] + 0.25 * Math.sin(frame / 30) * bob * scale, position[2]]} rotation={[roll, rotY, 0]} scale={scale}>
      {/* casco: parte de baixo vermelha (abaixo d'água), de cima azul-escura; proa afinada */}
      <At p={[-2, 0, 0]}>{rb([52, 4, 10], "#a83a3a", 1.2)}</At>
      <At p={[-2, 4, 0]}>{rb([52, 4.4, 10.2], "#2b3d5c", 1.2)}</At>
      {[
        [0, 4, "#a83a3a"],
        [4, 4.4, "#2b3d5c"],
      ].map(([y, h, c]) => (
        <mesh key={String(c)} position={[23.2, Number(y) + Number(h) / 2 - 2, 0]} rotation={[0, Math.PI / 2, 0]} scale={[0.98, 1, 1.6]}>
          <cylinderGeometry args={[5.9, 5.9, Number(h), 3]} />
          <meshStandardMaterial color={String(c)} roughness={0.6} flatShading />
        </mesh>
      ))}
      <At p={[-2, 6.25, 5.12]}>{rb([52, 0.35, 0.05], "#e8e6e1", 0.05)}</At>
      {/* contêineres (6 m × 2,6 m) empilhados */}
      {Array.from({ length: 6 }, (_, col) =>
        Array.from({ length: 2 + (col % 2) }, (_, row) => (
          <At key={`${col}-${row}`} p={[-8 + col * 6.3, 7.5 + row * 2.6, 0]}>
            {rb([6, 2.5, 9], CONTAINER_COLORS[(col * 3 + row) % CONTAINER_COLORS.length], 0.12)}
          </At>
        )),
      )}
      {/* superestrutura (ponte) na popa + chaminé */}
      <At p={[-21, 11, 0]}>{rb([7, 10, 8.5], "#e8e6e1", 0.4)}</At>
      <At p={[-20.4, 16.4, 0]}>{rb([8.5, 1.2, 9.5], "#e8e6e1", 0.3)}</At>
      {Array.from({ length: 4 }, (_, row) =>
        Array.from({ length: 4 }, (_, i) => <Win key={`${row}-${i}`} p={[-23.4 + i * 1.6, 8.4 + row * 2.2, 0]} w={1.0} h={0.8} z={4.28} />),
      )}
      <At p={[-25.2, 18.6, 0]}>{rb([2.6, 4.5, 3], "#8e2f3a", 0.4)}</At>
      <At p={[-25.2, 21.0, 0]}>{rb([2.7, 0.6, 3.1], DARK, 0.2)}</At>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ BARCO DE PESCA (7 m)
export const Boat: React.FC<VProps & { bob?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, bob = 1, color = "#2f7d8c" }) => {
  const roll = 0.04 * Math.sin(frame / 22) * bob;
  return (
    <group position={[position[0], position[1] + 0.06 * Math.sin(frame / 18) * bob * scale, position[2]]} rotation={[roll, rotY, 0.02 * Math.sin(frame / 27) * bob]} scale={scale}>
      {/* casco branco com faixa; proa levantada */}
      <At p={[-0.3, 0.45, 0]}>{rb([6.0, 1.1, 2.3], "#f2efe8", 0.45)}</At>
      <At p={[-0.3, 0.75, 1.16]}>{rb([5.8, 0.18, 0.04], color, 0.04)}</At>
      <At p={[-0.3, 0.05, 0]}>{rb([5.6, 0.3, 2.0], "#a83a3a", 0.12)}</At>
      <mesh position={[2.35, 0.5, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1, 1, 0.8]}>
        <cylinderGeometry args={[1.25, 1.0, 1.1, 3]} />
        <meshStandardMaterial color="#f2efe8" roughness={0.6} flatShading />
      </mesh>
      {/* cabine + teto + mastro com bandeirinha */}
      <At p={[-0.9, 1.65, 0]}>{rb([2.0, 1.4, 1.8], color, 0.18)}</At>
      <At p={[-0.9, 2.42, 0]}>{rb([2.4, 0.16, 2.0], "#f2efe8", 0.06)}</At>
      <Win p={[-0.45, 1.75, 0]} w={0.7} h={0.55} z={0.91} />
      <Win p={[-1.35, 1.75, 0]} w={0.55} h={0.55} z={0.91} />
      <mesh position={[-1.5, 3.4, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.05, 2.0, 8]} />
        <meshStandardMaterial color="#8d93a0" roughness={0.4} metalness={0.4} />
      </mesh>
      <At p={[-1.25, 4.1, 0]}>{rb([0.45, 0.28, 0.02], "#e5383b", 0.02)}</At>
      {/* boia e rede */}
      <mesh position={[1.2, 1.25, 1.1]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.28, 0.08, 6, 14]} />
        <meshStandardMaterial color="#e5383b" roughness={0.5} flatShading />
      </mesh>
    </group>
  );
};

// ------------------------------------------------------------------------------------------ FOGUETE (50 m, genérico)
export const Rocket: React.FC<VProps & { flame?: number }> = ({ frame = 0, position = [0, 0, 0], rotY = 0, scale = 1, flame = 0, color = "#8b5cf6" }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    {/* 1º estágio, 2º estágio, cápsula e coifa (de baixo para cima) */}
    <mesh position={[0, 17, 0]} castShadow>
      <cylinderGeometry args={[2.6, 2.6, 26, 20]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.45} flatShading />
    </mesh>
    {[8, 20, 29].map((y) => (
      <mesh key={y} position={[0, y, 0]}>
        <cylinderGeometry args={[2.63, 2.63, 1.2, 20]} />
        <meshStandardMaterial color={y === 20 ? color : DARK} roughness={0.5} flatShading />
      </mesh>
    ))}
    <mesh position={[0, 36, 0]} castShadow>
      <cylinderGeometry args={[2.0, 2.6, 12, 20]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.45} flatShading />
    </mesh>
    <mesh position={[0, 42.6, 0]} castShadow>
      <cylinderGeometry args={[1.6, 2.0, 1.2, 20]} />
      <meshStandardMaterial color={color} roughness={0.45} flatShading />
    </mesh>
    <mesh position={[0, 46.4, 0]} castShadow>
      <coneGeometry args={[1.6, 6.4, 20]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.45} flatShading />
    </mesh>
    <mesh position={[0, 44, 1.45]}>
      <circleGeometry args={[0.55, 16]} />
      <meshStandardMaterial color={GLASS} roughness={0.2} metalness={0.3} />
    </mesh>
    {/* aletas + motores */}
    {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
      <mesh key={a} position={[Math.sin(a) * 3.2, 6, Math.cos(a) * 3.2]} rotation={[0, a, 0]} castShadow>
        <boxGeometry args={[0.35, 7, 2.6]} />
        <meshStandardMaterial color={color} roughness={0.5} flatShading />
      </mesh>
    ))}
    {[-1.2, 0, 1.2].map((x) => (
      <mesh key={x} position={[x, 3.3, 0]}>
        <cylinderGeometry args={[0.45, 0.8, 1.6, 12]} />
        <meshStandardMaterial color="#5a5652" roughness={0.4} metalness={0.5} flatShading />
      </mesh>
    ))}
    {/* chama (0..1) */}
    {flame > 0.01 ? (
      <group position={[0, 1.2, 0]} scale={[1, clamp(flame, 0, 1) * (1 + 0.08 * Math.sin(frame * 1.3)), 1]}>
        <mesh position={[0, -5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.9, 10, 16]} />
          <meshBasicMaterial color="#ffb347" transparent opacity={0.85} />
        </mesh>
        <mesh position={[0, -3.5, 0]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[1.0, 6, 16]} />
          <meshBasicMaterial color="#fff6d6" />
        </mesh>
      </group>
    ) : null}
  </group>
);

// ------------------------------------------------------------------------------------------ AVIÃO (38 m, genérico)
export const Airplane: React.FC<VProps & { gear?: number }> = ({ position = [0, 0, 0], rotY = 0, scale = 1, gear = 1, color = "#3f6db3" }) => (
  <group position={position} rotation={[0, rotY, 0]} scale={scale}>
    {/* fuselagem (cilindro deitado em x) + nariz + cauda */}
    <mesh position={[0, 4.2, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[2.0, 2.0, 30, 20]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.4} flatShading />
    </mesh>
    <mesh position={[16.6, 4.0, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 1]} castShadow>
      <coneGeometry args={[2.0, 3.2, 20]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.4} flatShading />
    </mesh>
    <mesh position={[-17.8, 4.9, 0]} rotation={[0, 0, Math.PI / 2 + 0.12]} scale={[1, 1, 0.8]} castShadow>
      <coneGeometry args={[2.0, 5.6, 20]} />
      <meshStandardMaterial color="#f2efe8" roughness={0.4} flatShading />
    </mesh>
    {/* faixa e janelas */}
    <At p={[-1, 3.6, 2.0]}>{rb([30, 0.35, 0.05], color, 0.05)}</At>
    {Array.from({ length: 20 }, (_, i) => (
      <mesh key={i} position={[-12.5 + i * 1.3, 4.6, 1.99]}>
        <boxGeometry args={[0.45, 0.6, 0.03]} />
        <meshStandardMaterial color={GLASS} roughness={0.2} />
      </mesh>
    ))}
    <Win p={[15.6, 4.8, 0]} w={1.4} h={0.6} z={1.55} />
    {/* leme e estabilizador */}
    <mesh position={[-16.6, 7.4, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.25, 1, 1]} castShadow>
      <cylinderGeometry args={[3.6, 3.6, 0.5, 3]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
    <At p={[-17.5, 5.2, 0]}>{rb([5, 0.4, 12], "#e8e6e1", 0.15)}</At>
    {/* asa (vista de lado: perfil fino) + motor */}
    <At p={[0.5, 2.8, 0]}>{rb([7, 0.5, 34], "#e8e6e1", 0.2)}</At>
    <mesh position={[2.2, 1.6, 3.6]} rotation={[0, 0, Math.PI / 2]} castShadow>
      <cylinderGeometry args={[1.1, 1.1, 4.2, 16]} />
      <meshStandardMaterial color="#c9ced8" roughness={0.35} metalness={0.4} flatShading />
    </mesh>
    {/* trem de pouso */}
    {gear > 0.01
      ? [
          [12, 0.6],
          [-1, 0.75],
        ].map(([x, r]) => (
          <group key={x} position={[x, 0, 0]} scale={[1, gear, 1]}>
            <mesh position={[0, 1.4, 0]}>
              <cylinderGeometry args={[0.15, 0.15, 2.2, 8]} />
              <meshStandardMaterial color="#8d93a0" />
            </mesh>
            <Wheel p={[0, r, 0.4]} r={r} frame={0} speed={0} width={0.4} />
          </group>
        ))
      : null}
  </group>
);
