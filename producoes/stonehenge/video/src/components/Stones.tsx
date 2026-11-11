import { useMemo } from "react";
import * as THREE from "three";
import { clamp } from "../utils/animation";

// Pedras de Stonehenge, em METROS (y = 0 no chão; frente para +z). Low-poly fosco com superfície irregular
// determinística (ruído semeado). `rough` 1 = bruta (lascada, irregular) · 0 = alisada pelos martelos.

export const C = {
  sarsen: "#a59c88",
  sarsenDark: "#857c6b",
  lichen: "#b9b77e",
  lichen2: "#8f9a72",
  blue: "#6c7c8c",
  blueDark: "#55636f",
  altar: "#9a9a72",
  wood: "#8a6440",
  woodDark: "#6a4a2e",
  rope: "#c8b48a",
  mortise: "#2b2622",
};

const hash = (x: number, y: number, z: number, s: number) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + z * 74.7 + s * 19.19) * 43758.5453;
  return (h - Math.floor(h)) * 2 - 1;
};
const q = (v: number) => Math.round(v * 1000) / 1000;

/** Bloco irregular: caixa subdividida com vértices deslocados (mesma posição → mesmo deslocamento, sem rachar costuras). */
export const roughBlock = (w: number, h: number, d: number, seed: number, rough: number, taper = 0.12, segs: [number, number, number] = [3, 6, 2]) => {
  const g = new THREE.BoxGeometry(w, h, d, ...segs);
  const p = g.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i);
    const y = p.getY(i);
    const z = p.getZ(i);
    const t = (y + h / 2) / h; // 0 base → 1 topo
    const k = 1 - taper * t; // afina para cima
    const n = hash(q(x), q(y), q(z), seed);
    const n2 = hash(q(x) + 3, q(y) - 7, q(z) + 1, seed);
    const amp = (0.025 + 0.11 * rough) * Math.min(w, d);
    const ox = (x / (w / 2)) * n * amp;
    const oz = (z / (d / 2)) * n2 * amp;
    // topo arredondado nas bordas (pedra gasta), mais forte se bruta
    const edge = Math.abs(x) / (w / 2) * Math.abs(z) / (d / 2);
    const oy = t > 0.98 ? -edge * (0.06 + 0.25 * rough) * Math.min(w, d) + n * 0.02 * h * rough : n * 0.012 * h * rough;
    p.setXYZ(i, x * k + ox, y + oy, z * k + oz);
  }
  g.translate(0, h / 2, 0);
  g.computeVertexNormals();
  return g;
};

const Lichen: React.FC<{ w: number; h: number; d: number; seed: number }> = ({ w, h, d, seed }) => (
  <>
    {[0, 1, 2, 3].map((i) => {
      const a = hash(i, seed, 1, 2);
      const b = hash(i, seed, 5, 9);
      return (
        <mesh key={i} position={[a * w * 0.32, h * (0.3 + 0.25 * (b + 1)), d / 2 + 0.012]}>
          <circleGeometry args={[0.14 + 0.08 * Math.abs(a), 7]} />
          <meshStandardMaterial color={i % 2 ? C.lichen : C.lichen2} roughness={1} flatShading />
        </mesh>
      );
    })}
  </>
);

/** Pino (espiga) no topo de uma pedra em pé. */
const Tenon: React.FC<{ x: number; y: number; show: number }> = ({ x, y, show }) =>
  show > 0 ? (
    <mesh position={[x, y + 0.12 * show, 0]} scale={[1, show, 1]} castShadow>
      <cylinderGeometry args={[0.2, 0.26, 0.24, 8]} />
      <meshStandardMaterial color={C.sarsen} roughness={0.95} flatShading />
    </mesh>
  ) : null;

/** Sarsen em pé. h = altura acima do chão. tenons: 0..1 (aparecem quando alisada). */
export const Sarsen: React.FC<{ h?: number; w?: number; d?: number; seed?: number; rough?: number; tenons?: number; tenonX?: number[]; lichen?: boolean; color?: string }> = ({
  h = 4.1, w = 2.1, d = 1.1, seed = 1, rough = 0, tenons = 1, tenonX = [-0.5, 0.5], lichen = true, color = C.sarsen,
}) => {
  const geo = useMemo(() => roughBlock(w, h, d, seed, rough), [w, h, d, seed, rough]);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      {lichen && rough < 0.5 ? <Lichen w={w} h={h} d={d * 0.88} seed={seed} /> : null}
      {tenonX.map((x) => (
        <Tenon key={x} x={x * w * 0.5} y={h - 0.02} show={clamp(tenons, 0, 1)} />
      ))}
    </group>
  );
};

/** Lintel curvo do anel externo: setor de coroa circular (raio médio R) extrudado na vertical. Buracos embaixo, lingueta/ranhura nas pontas. */
export const Lintel: React.FC<{ R?: number; arcDeg?: number; h?: number; d?: number; curved?: number; mortises?: boolean; joints?: boolean; color?: string; glow?: number }> = ({
  R = 15, arcDeg = 12, h = 0.8, d = 1.05, curved = 1, mortises = true, joints = true, color = C.sarsen, glow = 0,
}) => {
  const geo = useMemo(() => {
    const a = ((arcDeg * Math.PI) / 180) / 2;
    // raio efetivo: curved 0 → reto (raio enorme)
    const r = curved > 0.01 ? R / curved : 1e5;
    const len = 2 * R * Math.sin(a);
    const half = len / 2;
    const s = new THREE.Shape();
    const N = 10;
    const ri = r - d / 2;
    const ro = r + d / 2;
    const aa = Math.asin(clamp(half / r, -1, 1));
    for (let i = 0; i <= N; i++) {
      const t = -aa + (2 * aa * i) / N;
      const x = ro * Math.sin(t);
      const z = ro * Math.cos(t) - r;
      if (i === 0) s.moveTo(x, z);
      else s.lineTo(x, z);
    }
    for (let i = N; i >= 0; i--) {
      const t = -aa + (2 * aa * i) / N;
      s.lineTo(ri * Math.sin(t), ri * Math.cos(t) - r);
    }
    const g = new THREE.ExtrudeGeometry(s, { depth: h, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.05, bevelSegments: 1 });
    g.rotateX(-Math.PI / 2); // extrusão para +y; forma no plano xz (z da forma → −z)
    g.scale(1, 1, -1);
    g.computeVertexNormals();
    return { g, half };
  }, [R, arcDeg, h, d, curved]);
  return (
    <group>
      <mesh geometry={geo.g} castShadow receiveShadow>
        <meshStandardMaterial color={color} roughness={0.95} flatShading side={THREE.DoubleSide} emissive="#c4b5fd" emissiveIntensity={0.55 * glow} />
      </mesh>
      {mortises
        ? [-1, 1].map((sx) => (
            <mesh key={sx} position={[sx * geo.half * 0.665, -0.004, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.24, 10]} />
              <meshBasicMaterial color={C.mortise} side={THREE.DoubleSide} />
            </mesh>
          ))
        : null}
      {joints ? (
        <>
          {/* lingueta (macho) numa ponta */}
          <mesh position={[geo.half + 0.1, h / 2, 0]} castShadow>
            <boxGeometry args={[0.22, h * 0.5, d * 0.32]} />
            <meshStandardMaterial color={color} roughness={0.95} flatShading />
          </mesh>
          {/* ranhura (fêmea) na outra */}
          <mesh position={[-geo.half - 0.01, h / 2, 0]}>
            <boxGeometry args={[0.04, h * 0.52, d * 0.34]} />
            <meshBasicMaterial color={C.mortise} />
          </mesh>
        </>
      ) : null}
    </group>
  );
};

/** Trilito: 2 em pé + 1 deitada reta por cima. h = altura das pedras em pé acima do chão. */
export const Trilithon: React.FC<{ h?: number; seed?: number; lintel?: number; fallen?: "none" | "lintel" | "one" | "all" }> = ({ h = 6.5, seed = 10, lintel = 1, fallen = "none" }) => {
  const w = 2.2;
  const gap = 0.35;
  const off = w / 2 + gap / 2;
  return (
    <group>
      <group position={[-off, 0, 0]} rotation={fallen === "all" ? [0, 0, Math.PI / 2] : [0, 0, 0]}>
        <Sarsen h={h} w={w} d={1.2} seed={seed} tenonX={[0]} />
      </group>
      {fallen === "one" || fallen === "all" ? (
        <group position={[off + h * 0.5, 0.6, 0.6]} rotation={[0.1, 0.3, -Math.PI / 2]}>
          <Sarsen h={h} w={w} d={1.2} seed={seed + 1} tenonX={[0]} />
        </group>
      ) : (
        <group position={[off, 0, 0]}>
          <Sarsen h={h} w={w} d={1.2} seed={seed + 1} tenonX={[0]} />
        </group>
      )}
      {lintel > 0 && fallen === "none" ? (
        <group position={[0, h + 0.24 * lintel, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[w * 2 + gap + 0.4, 1.0, 1.15]} />
            <meshStandardMaterial color={C.sarsen} roughness={0.95} flatShading />
          </mesh>
        </group>
      ) : null}
      {fallen !== "none" && lintel > 0 ? (
        <mesh position={[0.6, 0.5, 2.2]} rotation={[0, 0.5, 0.05]} castShadow receiveShadow>
          <boxGeometry args={[w * 2 + gap + 0.4, 1.0, 1.15]} />
          <meshStandardMaterial color={C.sarsenDark} roughness={0.95} flatShading />
        </mesh>
      ) : null}
    </group>
  );
};

/** Pedra azul: pilar menor, cinza-azulado. */
export const Bluestone: React.FC<{ h?: number; seed?: number; lean?: number; stump?: boolean }> = ({ h = 2, seed = 20, lean = 0, stump = false }) => {
  const hh = stump ? 0.5 : h;
  const geo = useMemo(() => roughBlock(0.65, hh, 0.5, seed, 0.35, 0.22, [2, 4, 2]), [hh, seed]);
  return (
    <mesh geometry={geo} rotation={[0, 0, lean]} castShadow receiveShadow>
      <meshStandardMaterial color={seed % 3 ? C.blue : C.blueDark} roughness={0.9} flatShading />
    </mesh>
  );
};

/** Pedra do Altar: arenito esverdeado, deitada (~4,9 m). */
export const AltarStone: React.FC<{ seed?: number }> = ({ seed = 40 }) => {
  const geo = useMemo(() => roughBlock(4.9, 0.5, 1.0, seed, 0.3, 0.05, [5, 2, 2]), [seed]);
  return (
    <mesh geometry={geo} castShadow receiveShadow>
      <meshStandardMaterial color={C.altar} roughness={0.9} flatShading />
    </mesh>
  );
};

/** Pedra do Calcanhar: sarsen bruta, nunca trabalhada, inclinada para o centro (−x). */
export const HeelStone: React.FC = () => {
  const geo = useMemo(() => roughBlock(2.4, 4.7, 2.0, 77, 0.55, 0.28, [3, 5, 3]), []);
  return (
    <mesh geometry={geo} rotation={[0, 0, 0.32]} castShadow receiveShadow>
      <meshStandardMaterial color={C.sarsen} roughness={1} flatShading />
    </mesh>
  );
};
