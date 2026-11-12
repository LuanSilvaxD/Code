import { useMemo } from "react";
import { Color, ExtrudeGeometry, Shape } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { Horse } from "./Animals";
import { Person } from "./Person";

// Cenários medievais de "Quem foi ela? | Gigantes da Humanidade #2". Tudo em METROS, chão em y = 0,
// frente para +z. Na maquete, cada estação usa <group scale={U}> com U = 0,06 u3d/m (mesma régua das pessoas).

const MATTE = { roughness: 0.9, metalness: 0, flatShading: true } as const;
export const STONE = "#b9ab93";
export const STONE_D = "#9c8e78";
export const SLATE = "#4a5468";
export const TILE = "#a5553b";
export const WOOD = "#6b4a2e";
export const PLASTER = "#e8dcc4";
export const ENG = "#b5523b"; // terracota: lado inglês (problema)
export const FRA = "#3f6db3"; // azul: lado de Carlos

export const Box: React.FC<{ p: Vec3; s: Vec3; c: string; r?: Vec3; e?: string; ei?: number }> = ({ p, s, c, r, e, ei = 0 }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial {...MATTE} color={c} emissive={e ?? "#000000"} emissiveIntensity={ei} />
  </mesh>
);
const Cyl: React.FC<{ p: Vec3; r0: number; r1: number; h: number; c: string; seg?: number; rot?: Vec3 }> = ({ p, r0, r1, h, c, seg = 10, rot }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r1, r0, h, seg]} />
    <meshStandardMaterial {...MATTE} color={c} />
  </mesh>
);
const Cone: React.FC<{ p: Vec3; r: number; h: number; c: string; seg?: number }> = ({ p, r, h, c, seg = 10 }) => (
  <mesh position={p} castShadow receiveShadow>
    <coneGeometry args={[r, h, seg]} />
    <meshStandardMaterial {...MATTE} color={c} />
  </mesh>
);

/** Telhado de duas águas (prisma triangular): largura w (x), profundidade d (z), altura h; base em y = 0. */
export const Gable: React.FC<{ p: Vec3; w: number; d: number; h: number; c: string }> = ({ p, w, d, h, c }) => {
  const geo = useMemo(() => {
    const sh = new Shape();
    sh.moveTo(-w / 2, 0);
    sh.lineTo(w / 2, 0);
    sh.lineTo(0, h);
    sh.lineTo(-w / 2, 0);
    const g = new ExtrudeGeometry(sh, { depth: d, bevelEnabled: false });
    g.translate(0, 0, -d / 2);
    return g;
  }, [w, d, h]);
  return (
    <mesh position={p} geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial {...MATTE} color={c} />
    </mesh>
  );
};

/** Bandeirinha num mastro (cor do lado). */
export const Flag: React.FC<{ p: Vec3; color: string; f: number; h?: number; s?: number }> = ({ p, color, f, h = 3, s = 1 }) => (
  <group position={p} scale={s}>
    <Cyl p={[0, h / 2, 0]} r0={0.05} r1={0.05} h={h} c="#3a2a1e" seg={5} />
    {[0, 1, 2].map((i) => (
      <Box key={i} p={[0.25 + i * 0.4, h - 0.35, Math.sin(f * 0.2 - i) * 0.08 * (i + 1) / 3]} s={[0.41, 0.6, 0.03]} c={color} r={[0, Math.cos(f * 0.2 - i) * 0.25, 0]} />
    ))}
  </group>
);

/** Ameias ao longo de um segmento (topo de muralha/torre). */
const Merlons: React.FC<{ len: number; y: number; t: number; c?: string }> = ({ len, y, t, c = STONE }) => {
  const n = Math.max(2, Math.floor(len / 1.2));
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Box key={i} p={[-len / 2 + (i + 0.5) * (len / n), y + 0.35, 0]} s={[(len / n) * 0.55, 0.7, t]} c={c} />
      ))}
    </>
  );
};

/** Torre redonda com ameias e telhado cônico de ardósia (h = altura da alvenaria). */
export const Tower: React.FC<{ p?: Vec3; h?: number; r?: number; roof?: boolean; c?: string }> = ({ p = [0, 0, 0], h = 14, r = 2.6, roof = true, c = STONE }) => (
  <group position={p}>
    <Cyl p={[0, h / 2, 0]} r0={r * 1.06} r1={r} h={h} c={c} seg={12} />
    <Cyl p={[0, h + 0.3, 0]} r0={r + 0.3} r1={r + 0.3} h={0.6} c={STONE_D} seg={12} />
    {roof ? (
      <Cone p={[0, h + 0.6 + r * 1.1, 0]} r={r + 0.45} h={r * 2.2} c={SLATE} seg={12} />
    ) : (
      Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return <Box key={i} p={[Math.cos(a) * (r + 0.1), h + 0.95, Math.sin(a) * (r + 0.1)]} s={[0.9, 0.7, 0.5]} c={c} r={[0, -a, 0]} />;
      })
    )}
    {/* seteiras */}
    {[0.35, 0.65].map((k, i) => (
      <Box key={i} p={[0, h * k, r * 1.02]} s={[0.25, 1.1, 0.1]} c="#2b2430" />
    ))}
  </group>
);

/** Trecho reto de muralha com ameias e adarve. */
export const Wall: React.FC<{ p?: Vec3; len: number; h?: number; t?: number; rotY?: number; c?: string }> = ({ p = [0, 0, 0], len, h = 8, t = 1.6, rotY = 0, c = STONE }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, h / 2, 0]} s={[len, h, t]} c={c} />
    <group position={[0, 0, t / 2 - 0.2]}>
      <Merlons len={len} y={h} t={0.4} c={c} />
    </group>
  </group>
);

/** Portão: duas torres, arco e grade levadiça (close 0 = aberta, 1 = fechada). */
export const Gate: React.FC<{ p?: Vec3; close?: number; rotY?: number }> = ({ p = [0, 0, 0], close = 0, rotY = 0 }) => {
  const k = clamp(close, 0, 1);
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Tower p={[-4, 0, 0]} h={11} r={2.2} />
      <Tower p={[4, 0, 0]} h={11} r={2.2} />
      <Box p={[0, 7.5, 0]} s={[6, 5, 3]} c={STONE} />
      <group position={[0, 0, 1.3]}>
        <Merlons len={6} y={10} t={0.4} />
      </group>
      <Box p={[0, 2.5, 0]} s={[3.2, 5, 3.2]} c="#2b2430" />
      {/* grade levadiça */}
      <group position={[0, 2.5 + (1 - k) * 4.6, 1.55]}>
        {[-1.2, -0.6, 0, 0.6, 1.2].map((x) => (
          <Box key={x} p={[x, 0, 0]} s={[0.14, 5, 0.14]} c="#2a2a2a" />
        ))}
        {[-1.6, 0, 1.6].map((y) => (
          <Box key={`h${y}`} p={[0, y, 0]} s={[3, 0.14, 0.14]} c="#2a2a2a" />
        ))}
      </group>
    </group>
  );
};

/** Ponte levadiça na frente de um portão (raise 0 = baixa, 1 = erguida). */
export const Drawbridge: React.FC<{ p?: Vec3; raise?: number; len?: number }> = ({ p = [0, 0, 0], raise = 0, len = 7 }) => (
  <group position={p}>
    {/* fosso */}
    <Box p={[0, -0.6, len / 2]} s={[8, 1.2, len]} c="#3d6f8a" />
    <group rotation={[-clamp(raise, 0, 1) * 1.35, 0, 0]}>
      <Box p={[0, 0.15, len / 2]} s={[3.2, 0.3, len]} c={WOOD} />
      {Array.from({ length: 7 }, (_, i) => (
        <Box key={i} p={[0, 0.32, 0.5 + i * (len / 7)]} s={[3.2, 0.05, 0.08]} c="#4a3322" />
      ))}
    </group>
    {/* correntes */}
    {[-1.5, 1.5].map((x) => (
      <Box key={x} p={[x, 3.4 - clamp(raise, 0, 1) * 0.6, 1.8 - clamp(raise, 0, 1) * 1.4]} s={[0.08, 0.08, 4.2]} c="#2a2a2a" r={[0.85 - clamp(raise, 0, 1) * 0.9, 0, 0]} />
    ))}
  </group>
);

/** Castelo modular: 4 muralhas, 4 torres e torre de menagem. */
export const Castle: React.FC<{ p?: Vec3; w?: number; d?: number; keep?: boolean; gateClose?: number; noFront?: boolean }> = ({ p = [0, 0, 0], w = 26, d = 20, keep = true, gateClose = 0, noFront = false }) => (
  <group position={p}>
    <Wall p={[0, 0, -d / 2]} len={w} />
    <Wall p={[-w / 2, 0, 0]} len={d} rotY={Math.PI / 2} />
    <Wall p={[w / 2, 0, 0]} len={d} rotY={-Math.PI / 2} />
    {noFront ? null : (
      <>
        <Wall p={[-w / 4 - 2.5, 0, d / 2]} len={w / 2 - 5} rotY={Math.PI} />
        <Wall p={[w / 4 + 2.5, 0, d / 2]} len={w / 2 - 5} rotY={Math.PI} />
        <Gate p={[0, 0, d / 2]} close={gateClose} />
      </>
    )}
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
      <Tower key={`${sx}${sz}`} p={[(sx * w) / 2, 0, (sz * d) / 2]} h={13} r={2.6} />
    ))}
    {keep ? (
      <group position={[0, 0, -2]}>
        <Box p={[0, 9, 0]} s={[8, 18, 8]} c={STONE} />
        <group position={[0, 0, 3.8]}><Merlons len={8} y={18} t={0.4} /></group>
        <Cone p={[0, 21, 0]} r={6} h={6} c={SLATE} seg={4} />
      </group>
    ) : null}
  </group>
);

/** Casa medieval de enxaimel: reboco claro, vigas escuras, telhado íngreme. */
export const House: React.FC<{ p?: Vec3; w?: number; d?: number; h?: number; seed?: number; rotY?: number; roof?: string }> = ({ p = [0, 0, 0], w = 6, d = 5, h = 5, seed = 0, rotY = 0, roof }) => {
  const rc = roof ?? (rand(`house-${seed}`) < 0.5 ? TILE : "#7a5a3c");
  const wall = new Color(PLASTER).offsetHSL(0, 0, (rand(`hw-${seed}`) - 0.5) * 0.08).getStyle();
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, h / 2, 0]} s={[w, h, d]} c={wall} />
      {/* vigas */}
      {[-w / 2 + 0.1, 0, w / 2 - 0.1].map((x) => (
        <Box key={x} p={[x, h / 2, d / 2 + 0.03]} s={[0.25, h, 0.08]} c="#4a3322" />
      ))}
      <Box p={[0, h * 0.55, d / 2 + 0.03]} s={[w, 0.25, 0.08]} c="#4a3322" />
      <Box p={[w * 0.25, h * 0.75, d / 2 + 0.05]} s={[0.9, 0.9, 0.06]} c="#3a3040" />
      <Box p={[-w * 0.22, 1.1, d / 2 + 0.05]} s={[1.1, 2.2, 0.06]} c="#5a3b28" />
      {/* telhado de duas águas */}
      <Gable p={[0, h, 0]} w={w + 0.7} d={d + 0.6} h={w * 0.62} c={rc} />
      <Box p={[w * 0.28, h + w * 0.42, -d * 0.2]} s={[0.6, 2.2, 0.6]} c="#8a7a6a" />
    </group>
  );
};

/** Igrejinha de vilarejo com campanário. */
export const Church: React.FC<{ p?: Vec3; rotY?: number }> = ({ p = [0, 0, 0], rotY = 0 }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Box p={[0, 3.5, 0]} s={[6, 7, 12]} c={STONE} />
    <Gable p={[0, 7, 0]} w={6.8} d={12.4} h={4} c={SLATE} />
    <Box p={[0, 6, 6.6]} s={[3.4, 12, 3.4]} c={STONE} />
    <Cone p={[0, 15, 6.6]} r={2.6} h={6} c={SLATE} seg={4} />
    <Box p={[0, 2, 8.35]} s={[1.6, 3, 0.1]} c="#5a3b28" />
  </group>
);

/** Árvore low-poly. */
export const Tree: React.FC<{ p?: Vec3; s?: number; seed?: number }> = ({ p = [0, 0, 0], s = 1, seed = 0 }) => (
  <group position={p} scale={s}>
    <Cyl p={[0, 1.6, 0]} r0={0.35} r1={0.25} h={3.2} c="#5a3b28" seg={6} />
    <mesh position={[0, 4.6, 0]} castShadow>
      <icosahedronGeometry args={[2.4 + rand(`tr-${seed}`) * 0.6, 0]} />
      <meshStandardMaterial {...MATTE} color={rand(`tc-${seed}`) < 0.5 ? "#5f8a4a" : "#6e9650"} />
    </mesh>
  </group>
);

/** Salão do trono em corte (piso, 2 paredes, trono, estandartes azuis, braseiros). */
export const ThroneHall: React.FC<{ p?: Vec3; f: number }> = ({ p = [0, 0, 0], f }) => (
  <group position={p}>
    <Box p={[0, 0.15, 0]} s={[14, 0.3, 11]} c="#8f7f6a" />
    {Array.from({ length: 6 }, (_, i) => Array.from({ length: 5 }, (_, j) => ((i + j) % 2 ? <Box key={`${i}${j}`} p={[-6 + i * 2.4, 0.31, -4.4 + j * 2.2]} s={[2.3, 0.02, 2.1]} c="#a8987e" /> : null)))}
    <Box p={[0, 4.3, -5.3]} s={[14, 8, 0.6]} c={STONE} />
    <Box p={[-6.8, 4.3, 0]} s={[0.6, 8, 11]} c={STONE_D} />
    {/* janelas góticas */}
    {[-4, 4].map((x) => (
      <Box key={x} p={[x, 5, -4.95]} s={[1.2, 3, 0.1]} c="#7fa3d9" e="#7fa3d9" ei={0.4} />
    ))}
    {/* tapete + degraus + trono */}
    <Box p={[0, 0.33, 0.5]} s={[2.2, 0.04, 9]} c="#7a2f3b" />
    <Box p={[0, 0.5, -3.6]} s={[4.5, 0.4, 2.4]} c={STONE_D} />
    <group position={[0, 0.7, -4.0]}>
      <Box p={[0, 0.6, 0]} s={[1.6, 1.2, 1.2]} c="#7a5a3c" />
      <Box p={[0, 2.0, -0.5]} s={[1.6, 2.6, 0.25]} c="#7a5a3c" />
      <Box p={[0, 1.25, 0.05]} s={[1.3, 0.15, 1.0]} c={FRA} />
      <Box p={[0, 2.1, -0.36]} s={[1.2, 2.0, 0.05]} c={FRA} />
    </group>
    {/* estandartes azuis com pontos dourados */}
    {[-2.6, 2.6].map((x) => (
      <group key={x} position={[x, 3.4, -4.9]}>
        <Box p={[0, 0, 0]} s={[1.4, 4, 0.06]} c={FRA} />
        {[0.8, 0, -0.8].map((y) => <Box key={y} p={[0, y, 0.04]} s={[0.3, 0.3, 0.02]} c="#d8b04a" />)}
      </group>
    ))}
    {/* braseiros */}
    {[-4.5, 4.5].map((x) => (
      <group key={`b${x}`} position={[x, 0.3, -1.5]}>
        <Cyl p={[0, 0.7, 0]} r0={0.3} r1={0.5} h={1.4} c="#3a3a3a" seg={8} />
        <mesh position={[0, 1.7 + 0.08 * Math.sin(f * 0.5 + x), 0]}>
          <coneGeometry args={[0.35, 0.9, 6]} />
          <meshStandardMaterial color="#ffb347" emissive="#ff8a1e" emissiveIntensity={1.6} />
        </mesh>
      </group>
    ))}
  </group>
);

/** Sala do tribunal em corte: bancadas em 3 fileiras em arco, mesa dos juízes, banco da ré no centro. */
export const CourtRoom: React.FC<{ p?: Vec3 }> = ({ p = [0, 0, 0] }) => (
  <group position={p}>
    <Box p={[0, 0.15, 0]} s={[18, 0.3, 14]} c="#6e5c4a" />
    <Box p={[0, 4.3, -7]} s={[18, 8, 0.6]} c={STONE_D} />
    <Box p={[-9, 4.3, 0]} s={[0.6, 8, 14]} c={STONE} />
    {Array.from({ length: 6 }, (_, i) => <Box key={`v${i}`} p={[-7.5 + i * 3, 4.3, -6.65]} s={[0.4, 8, 0.2]} c="#4a3322" />)}
    {/* 3 fileiras de bancos em arco (degraus) */}
    {[0, 1, 2].map((row) => {
      const R = 5.2 + row * 1.6;
      return Array.from({ length: 7 }, (_, i) => {
        const a = Math.PI * (0.1 + (0.8 * i) / 6);
        return <Box key={`${row}${i}`} p={[Math.cos(a) * -R, 0.5 + row * 0.6, -Math.sin(a) * R + 2]} s={[2.2, 0.5 + row * 1.2, 0.9]} c={WOOD} r={[0, a - Math.PI / 2, 0]} />;
      });
    })}
    {/* mesa dos juízes/escrivães */}
    <Box p={[0, 1.2, -3.2]} s={[5, 0.2, 1.3]} c="#5a3b28" />
    <Box p={[0, 0.6, -3.2]} s={[4.8, 1.0, 1.1]} c="#4a3322" />
    <Box p={[-1, 1.33, -3.2]} s={[0.8, 0.04, 0.6]} c="#efe6cf" />
    <Box p={[1.2, 1.33, -3.1]} s={[0.7, 0.04, 0.5]} c="#efe6cf" />
    {/* banquinho da ré, no centro */}
    <Box p={[0, 0.55, 2.8]} s={[0.9, 0.5, 0.6]} c={WOOD} />
  </group>
);

/** Catedral gótica estilizada (Reims): nave, 2 torres na fachada, rosácea, portais e arcobotantes. */
export const Cathedral: React.FC<{ p?: Vec3; glow?: number }> = ({ p = [0, 0, 0], glow = 0 }) => (
  <group position={p}>
    <Box p={[0, 9, -14]} s={[14, 18, 30]} c={STONE} />
    <Gable p={[0, 18, -14]} w={15} d={30.4} h={8} c={SLATE} />
    {/* arcobotantes */}
    {Array.from({ length: 5 }, (_, i) => [-1, 1].map((s) => (
      <group key={`${i}${s}`} position={[s * 8.5, 0, -24 + i * 5]}>
        <Box p={[0, 6, 0]} s={[1.4, 12, 1.4]} c={STONE_D} />
        <Box p={[-s * 1.3, 12.5, 0]} s={[3.4, 0.6, 0.6]} c={STONE_D} r={[0, 0, s * 0.5]} />
        <Cone p={[0, 13.3, 0]} r={0.9} h={2.6} c={STONE_D} seg={4} />
      </group>
    )))}
    {/* fachada + torres */}
    <Box p={[0, 12, 1.5]} s={[22, 24, 3]} c={STONE} />
    {[-1, 1].map((s) => (
      <group key={s} position={[s * 8, 0, 1.5]}>
        <Box p={[0, 17, 0]} s={[6, 34, 6]} c={STONE} />
        {Array.from({ length: 3 }, (_, k) => <Box key={k} p={[0, 10 + k * 8, 3.05]} s={[1.6, 5, 0.1]} c="#2b2430" />)}
        {[-2.6, 2.6].map((x) => <Cone key={x} p={[x, 35, 2.6]} r={0.6} h={2.4} c={STONE_D} seg={4} />)}
      </group>
    ))}
    {/* rosácea */}
    <mesh position={[0, 16, 3.06]}>
      <circleGeometry args={[3.2, 16]} />
      <meshStandardMaterial color="#8f6ad9" emissive="#c4b5fd" emissiveIntensity={0.35 + glow * 1.4} />
    </mesh>
    <mesh position={[0, 16, 3.07]}>
      <ringGeometry args={[3.0, 3.4, 16]} />
      <meshStandardMaterial color={STONE_D} />
    </mesh>
    {/* 3 portais */}
    {[-6, 0, 6].map((x, i) => (
      <group key={x} position={[x, 0, 3.05]}>
        <Box p={[0, i === 1 ? 4.5 : 3.6, 0]} s={[i === 1 ? 4 : 3, i === 1 ? 9 : 7.2, 0.1]} c="#3a3040" />
        <Cone p={[0, i === 1 ? 10.2 : 8.2, 0.2]} r={i === 1 ? 2.6 : 2} h={3} c={STONE_D} seg={3} />
      </group>
    ))}
  </group>
);

/** Bastilha inglesa: paliçada redonda de troncos + torre de madeira + bandeira. */
export const Bastille: React.FC<{ p?: Vec3; f: number; french?: number; r?: number }> = ({ p = [0, 0, 0], f, french = 0, r = 6 }) => {
  const n = 22;
  return (
    <group position={p}>
      <Cyl p={[0, 0.3, 0]} r0={r + 1.6} r1={r + 1.2} h={0.6} c="#7c6a4c" seg={14} />
      {Array.from({ length: n }, (_, i) => {
        const a = (i / n) * Math.PI * 2;
        return <Cyl key={i} p={[Math.cos(a) * r, 2.2, Math.sin(a) * r]} r0={0.42} r1={0.36} h={4.4} c={i % 2 ? WOOD : "#7a5638"} seg={5} />;
      })}
      <Box p={[0, 4, 0]} s={[3.6, 8, 3.6]} c="#7a5638" />
      <Box p={[0, 8.5, 0]} s={[4.6, 1, 4.6]} c={WOOD} />
      <Cone p={[0, 10.2, 0]} r={3.4} h={2.6} c="#5a3b28" seg={4} />
      <Flag p={[0, 11, 0]} color={french > 0.5 ? FRA : ENG} f={f} h={3.2} />
    </group>
  );
};

/** Ponte de pedra com arcos (comprimento em x). */
export const Bridge: React.FC<{ p?: Vec3; len?: number; rotY?: number }> = ({ p = [0, 0, 0], len = 40, rotY = 0 }) => {
  const n = Math.max(3, Math.round(len / 7));
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <Box p={[0, 2.6, 0]} s={[len, 0.9, 5]} c={STONE} />
      {[-2.3, 2.3].map((z) => <Box key={z} p={[0, 3.4, z]} s={[len, 0.7, 0.4]} c={STONE_D} />)}
      {Array.from({ length: n + 1 }, (_, i) => (
        <Box key={i} p={[-len / 2 + (i * len) / n, 0.6, 0]} s={[1.6, 3.6, 5.4]} c={STONE_D} />
      ))}
    </group>
  );
};

/** Forte das Tourelles: duas torres unidas por um corpo, na ponta sul da ponte. */
export const Tourelles: React.FC<{ p?: Vec3; f: number; french?: number }> = ({ p = [0, 0, 0], f, french = 0 }) => (
  <group position={p}>
    <Box p={[0, 5, 0]} s={[10, 10, 7]} c={STONE} />
    <group position={[0, 0, 3.3]}><Merlons len={10} y={10} t={0.4} /></group>
    <Tower p={[-5, 0, 0]} h={13} r={2.4} />
    <Tower p={[5, 0, 0]} h={13} r={2.4} />
    <Flag p={[0, 10.5, 0]} color={french > 0.5 ? FRA : ENG} f={f} h={4} />
  </group>
);

/**
 * Orléans em miniatura: muralha circular com torres, casas, igreja grande, portão norte e a PONTE sobre o
 * Loire (sul, +z) até o forte das Tourelles. Bastilhas inglesas em volta. R = raio da muralha (m).
 */
export const OrleansCity: React.FC<{ f: number; R?: number; forts?: number; tourelles?: number; showBastilles?: boolean }> = ({ f, R = 24, forts = 0, tourelles = 0, showBastilles = true }) => {
  const n = 9;
  const towers = Array.from({ length: n }, (_, i) => (i / n) * Math.PI * 2 + 0.2);
  return (
    <group>
      {/* muralha em segmentos entre torres */}
      {towers.map((a, i) => {
        const b = towers[(i + 1) % n] + (i === n - 1 ? Math.PI * 2 : 0);
        const m = (a + b) / 2;
        const chord = 2 * R * Math.sin((b - a) / 2);
        return <Wall key={i} p={[Math.cos(m) * R * Math.cos((b - a) / 2), 0, Math.sin(m) * R * Math.cos((b - a) / 2)]} len={chord - 2} rotY={-m + Math.PI / 2} />;
      })}
      {towers.map((a, i) => <Tower key={`t${i}`} p={[Math.cos(a) * R, 0, Math.sin(a) * R]} h={11} r={2.1} />)}
      {/* casas */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = (i / 16) * Math.PI * 2;
        const rr = (i % 2 ? 0.45 : 0.72) * R;
        return <House key={`h${i}`} p={[Math.cos(a) * rr, 0, Math.sin(a) * rr]} w={5} d={4.5} h={4.5 + (i % 3)} seed={i + 3} rotY={-a + Math.PI / 2} />;
      })}
      <Church p={[-3, 0, -3]} rotY={0.3} />
      {/* ponte ao sul até as Tourelles */}
      <Bridge p={[0, 0, R + 18]} len={30} rotY={Math.PI / 2} />
      <Tourelles p={[0, 0, R + 36]} f={f} french={tourelles} />
      {showBastilles
        ? [[-R - 14, -R * 0.4], [R + 14, -R * 0.2], [R * 0.9, R + 30]].map(([x, z], i) => (
            <Bastille key={`b${i}`} p={[x, 0, z]} f={f} french={forts > i + 0.5 ? 1 : 0} />
          ))
        : null}
    </group>
  );
};

/** Fogueira estilizada: plataforma de reboco, estaca, feixes de lenha e chamas/fumaça (fire 0..1). Sem corpo. */
export const Pyre: React.FC<{ p?: Vec3; fire?: number; f: number }> = ({ p = [0, 0, 0], fire = 0, f }) => {
  const k = clamp(fire, 0, 1);
  return (
    <group position={p}>
      <Box p={[0, 0.6, 0]} s={[4.5, 1.2, 4.5]} c={PLASTER} />
      <Cyl p={[0, 3.6, 0]} r0={0.18} r1={0.15} h={5} c="#4a3322" seg={6} />
      {Array.from({ length: 14 }, (_, i) => {
        const a = (i / 14) * Math.PI * 2;
        return <Cyl key={i} p={[Math.cos(a) * 1.0, 1.7, Math.sin(a) * 1.0]} r0={0.12} r1={0.12} h={1.4} c={i % 2 ? WOOD : "#7a5638"} seg={5} rot={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]} />;
      })}
      {/* chamas: cones emissivos que pulsam */}
      {k > 0.01
        ? Array.from({ length: 9 }, (_, i) => {
            const a = (i / 9) * Math.PI * 2;
            const fl = 0.75 + 0.25 * Math.sin(f * 0.6 + i * 1.7);
            return (
              <mesh key={`fl${i}`} position={[Math.cos(a) * 0.8, 1.6 + k * 1.4 * fl, Math.sin(a) * 0.8]} scale={[k, k * fl, k]}>
                <coneGeometry args={[0.55, 2.8, 6]} />
                <meshStandardMaterial color={i % 2 ? "#ffb347" : "#ff7a2e"} emissive={i % 2 ? "#ff9a2e" : "#ff5a1e"} emissiveIntensity={1.8} transparent opacity={0.92} />
              </mesh>
            );
          })
        : null}
      {k > 0.01
        ? Array.from({ length: 6 }, (_, i) => {
            const t = ((f * 0.012 + i / 6) % 1);
            return (
              <mesh key={`sm${i}`} position={[Math.sin(i * 2.1) * 0.6 + t * 0.8, 5 + t * 9, Math.cos(i * 1.3) * 0.5]} scale={(0.8 + t * 2.2) * k}>
                <icosahedronGeometry args={[1, 0]} />
                <meshStandardMaterial color="#5a5560" transparent opacity={0.55 * (1 - t)} roughness={1} />
              </mesh>
            );
          })
        : null}
      {k > 0.01 ? <pointLight position={[0, 3, 1.5]} intensity={4 * k} distance={18} color="#ff9a4a" /> : null}
    </group>
  );
};

const GOLD = "#c9962f";
/** Estátua equestre dourada sobre pedestal (homenagem — aparece no fim). */
export const Statue: React.FC<{ p?: Vec3; f: number; glow?: number; rider?: React.ReactNode }> = ({ p = [0, 0, 0], f, glow = 0, rider }) => (
  <group position={p}>
    <Box p={[0, 1.6, 0]} s={[4.2, 3.2, 2.4]} c={STONE} />
    <Box p={[0, 3.3, 0]} s={[4.6, 0.3, 2.8]} c={STONE_D} />
    <group position={[0, 3.45, 0]}>
      <Horse frame={0} color={GOLD} scale={1} />
      {rider ?? (
        <group position={[-0.05, 0.72, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Person frame={f} skin={GOLD} hair={GOLD} armor={GOLD} pants={GOLD} shoes={GOLD} shirt={GOLD} banner={GOLD} bannerWave={0} seed={4} scale={0.94} />
        </group>
      )}
    </group>
    {glow > 0.01 ? <pointLight position={[0, 6, 4]} intensity={3 * glow} distance={14} color="#ffe2a0" /> : null}
  </group>
);

/** Coroa avulsa (para flutuar no mapa). */
export const Crown: React.FC<{ p?: Vec3; s?: number }> = ({ p = [0, 0, 0], s = 1 }) => (
  <group position={p} scale={s}>
    <mesh castShadow><cylinderGeometry args={[0.6, 0.55, 0.32, 12, 1, true]} /><meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.6} side={2} /></mesh>
    {Array.from({ length: 8 }, (_, i) => (
      <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.58, 0.28, Math.sin((i / 8) * Math.PI * 2) * 0.58]}>
        <coneGeometry args={[0.1, 0.28, 4]} />
        <meshStandardMaterial color={GOLD} roughness={0.3} metalness={0.6} />
      </mesh>
    ))}
  </group>
);

/** Pergaminho com selo vermelho. */
export const Scroll: React.FC<{ p?: Vec3; s?: number; open?: number }> = ({ p = [0, 0, 0], s = 1, open = 1 }) => (
  <group position={p} scale={s}>
    <Box p={[0, 0, 0]} s={[1.2, 1.6 * clamp(open, 0.05, 1), 0.02]} c="#efe2bf" />
    {[-1, 1].map((k) => <Cyl key={k} p={[0, k * 0.8 * clamp(open, 0.05, 1), 0]} r0={0.08} r1={0.08} h={1.36} c="#d9c79a" rot={[0, 0, Math.PI / 2]} />)}
    <mesh position={[0.3, -0.45 * open, 0.03]}><circleGeometry args={[0.14, 10]} /><meshStandardMaterial color="#9b2a2a" /></mesh>
  </group>
);

/** Flecha (comprimento ~0,8 m), apontando para +x. */
export const Arrow: React.FC<{ p?: Vec3; rot?: Vec3 }> = ({ p = [0, 0, 0], rot }) => (
  <group position={p} rotation={rot}>
    <Cyl p={[0, 0, 0]} r0={0.012} r1={0.012} h={0.8} c="#8a6a42" seg={5} rot={[0, 0, Math.PI / 2]} />
    <mesh position={[0.43, 0, 0]} rotation={[0, 0, -Math.PI / 2]}><coneGeometry args={[0.025, 0.08, 4]} /><meshStandardMaterial color="#555" /></mesh>
    {[0, 1, 2].map((i) => <Box key={i} p={[-0.36, 0, 0]} s={[0.12, 0.05, 0.004]} c="#e9e4da" r={[(i * Math.PI) / 3, 0, 0]} />)}
  </group>
);

/** Cavaleiro: cavalo (aprovado) + pessoa montada (pernas escondidas no corpo do cavalo). Frente para +x. */
export const Rider: React.FC<{ p?: Vec3; rotY?: number; f: number; walk?: number; horse?: string; seed?: number; person: Omit<React.ComponentProps<typeof Person>, "frame"> }> = ({ p = [0, 0, 0], rotY = 0, f, walk = 0, horse, seed = 0, person }) => (
  <group position={p} rotation={[0, rotY, 0]}>
    <Horse frame={f} walk={walk} color={horse} seed={seed} />
    <group position={[-0.05, 0.72 + walk * 0.04 * Math.abs(Math.sin(f * 0.25)), 0]} rotation={[0, Math.PI / 2, 0]}>
      <Person {...person} frame={f} seed={seed} />
    </group>
  </group>
);
