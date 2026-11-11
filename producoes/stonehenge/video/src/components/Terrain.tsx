import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { clamp } from "../utils/animation";

// Planície de Salisbury em METROS (centro do monumento na origem, eixo do solstício = +x = nordeste).
// Diorama redondo de raio R com a borda em corte mostrando o subsolo de GIZ (chalk) com faixas de sílex —
// é o chão real da região, e a vala recém-cavada aparece branca antes de a grama voltar.

export const R = 95;
const DITCH_R = 55;

const hash = (x: number, y: number, s = 0) => {
  const h = Math.sin(x * 127.1 + y * 311.7 + s * 74.7) * 43758.5453;
  return h - Math.floor(h);
};
const bump = (d: number, w: number) => Math.exp(-(d * d) / (w * w));
const smooth = (a: number, b: number, x: number) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};

export const BARROWS: [number, number, number][] = [
  [-66, -40, 8], [-56, -54, 6.5], [-46, 64, 7.5], [-34, 72, 6], [26, -72, 7], [-78, 14, 6],
];

/** Altura do terreno (m). dig 0..1 = profundidade da vala/barranco. */
export const heightAt = (x: number, z: number, dig = 1) => {
  const r = Math.hypot(x, z);
  const th = Math.atan2(z, x);
  const far = smooth(18, 40, r) * (1 - smooth(84, 94, r));
  const hills = far * (2.4 * Math.sin(x * 0.045 + 1.3) * Math.cos(z * 0.038) + 1.1 * Math.sin((x + z) * 0.07) + 0.45 * Math.cos(x * 0.13 - z * 0.11));
  const gap = 1 - bump(th, 0.09) ; // passagem (entrada) a nordeste, no eixo +x
  // vala e barrancos com exagero vertical (~2×) para ler no celular
  const ditch = dig * gap * (-3.4 * bump(r - DITCH_R, 3.0) + 2.0 * bump(r - (DITCH_R - 5.5), 2.6) + 0.8 * bump(r - (DITCH_R + 5), 1.8));
  // Avenida: dois barrancos paralelos saindo da entrada para +x
  const av = dig * smooth(DITCH_R - 1, DITCH_R + 3, x) * (0.9 * bump(z - 8, 1.6) + 0.9 * bump(z + 8, 1.6)) * (1 - smooth(86, 93, x));
  let barrows = 0;
  for (const [bx, bz, br] of BARROWS) barrows += 3.4 * bump(Math.hypot(x - bx, z - bz), br * 0.8);
  return hills + ditch + av + barrows;
};

const GRASS = ["#6f8f4e", "#7a9a52", "#66884a", "#829e57", "#738f4a", "#8aa25c"];
const CHALK = new THREE.Color("#ece6d6");

/** Superfície: grade radial com cores por vértice (grama variada; giz exposto na vala quando `chalk` > 0). */
export const Ground: React.FC<{ dig?: number; chalk?: number; clip?: THREE.Plane[] }> = ({ dig = 1, chalk = 0, clip }) => {
  const geo = useMemo(() => {
    const RINGS = 110;
    const SEG = 160;
    const pos: number[] = [];
    const col: number[] = [];
    const idx: number[] = [];
    const c = new THREE.Color();
    const ringR = (i: number) => R * Math.pow(i / RINGS, 0.85);
    pos.push(0, heightAt(0, 0, dig), 0);
    c.set(GRASS[0]);
    col.push(c.r, c.g, c.b);
    for (let i = 1; i <= RINGS; i++) {
      const rr = ringR(i);
      for (let j = 0; j < SEG; j++) {
        const a = (j / SEG) * Math.PI * 2;
        const x = rr * Math.cos(a);
        const z = rr * Math.sin(a);
        pos.push(x, heightAt(x, z, dig), z);
        // cor por ruído SUAVE (sem redemoinho no centro da malha radial) + leve variação
        const n1 = 0.5 + 0.5 * Math.sin(x * 0.19 + 0.7) * Math.cos(z * 0.23 - 1.1);
        const n2 = 0.5 + 0.5 * Math.sin((x - z) * 0.11 + 2.0);
        c.set(GRASS[0]).lerp(new THREE.Color(GRASS[3]), n1).lerp(new THREE.Color(GRASS[4]), 0.5 * n2);
        c.offsetHSL(0, 0, (hash(Math.round(x * 2), Math.round(z * 2)) - 0.5) * 0.025);
        // manchas mais secas/amareladas
        const patch = 0.5 + 0.5 * Math.sin(x * 0.09 + 2) * Math.sin(z * 0.07);
        c.lerp(new THREE.Color("#a5a55e"), 0.25 * patch * patch);
        // campos em mosaico na periferia (trigo, pasto escuro, palha)
        const fr = smooth(66, 74, rr);
        if (fr > 0) {
          // grade girada + bordas tortas (ruído) → lotes irregulares, não um tabuleiro
          const ca = Math.cos(0.42);
          const sa = Math.sin(0.42);
          const gx = (x * ca - z * sa) / 24 + 0.35 * Math.sin(z * 0.09);
          const gz = (x * sa + z * ca) / 17 + 0.35 * Math.sin(x * 0.08);
          const cell = Math.floor(hash(Math.floor(gx), Math.floor(gz), 4) * 6);
          const fc = ["#b9b06a", "#5f7f45", "#a59a58", "#7c9a50", "#c7b878", "#668a49"][cell];
          c.lerp(new THREE.Color(fc), 0.7 * fr);
        }
        // avenida: faixa de grama mais clara entre os barrancos
        if (x > DITCH_R && Math.abs(z) < 7) c.lerp(new THREE.Color("#9fb06a"), 0.35 * (1 - smooth(84, 92, x)));
        // fundo da vala um pouco mais escuro (sombra/umidade)
        c.multiplyScalar(1 - 0.18 * dig * bump(rr - DITCH_R, 2.5));
        const inDitch = bump(rr - DITCH_R, 3.2) + 0.7 * bump(rr - (DITCH_R - 5), 2.4);
        const th = Math.atan2(z, x);
        const gap = 1 - bump(th, 0.09);
        c.lerp(CHALK, clamp(chalk * inDitch * gap * 1.4, 0, 0.92));
        col.push(c.r, c.g, c.b);
      }
    }
    for (let j = 0; j < SEG; j++) idx.push(0, 1 + ((j + 1) % SEG), 1 + j);
    for (let i = 1; i < RINGS; i++) {
      const a0 = 1 + (i - 1) * SEG;
      const a1 = 1 + i * SEG;
      for (let j = 0; j < SEG; j++) {
        const j1 = (j + 1) % SEG;
        idx.push(a0 + j, a0 + j1, a1 + j, a0 + j1, a1 + j1, a1 + j);
      }
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [dig, chalk]);
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} flatShading clippingPlanes={clip ?? null} />
    </mesh>
  );
};

/** Borda do diorama em corte: grama, terra escura e giz branco com faixas de sílex. */
export const Strata: React.FC<{ depth?: number }> = ({ depth = 9 }) => {
  const layers: { y0: number; y1: number; color: string }[] = [
    { y0: -0.7, y1: 0.02, color: "#5a4632" },
    { y0: -depth, y1: -0.7, color: "#e6dfcd" },
  ];
  const flints = [-2.2, -4.1, -6.3, -8.0];
  return (
    <group>
      {layers.map((l) => (
        <mesh key={l.y0} position={[0, (l.y0 + l.y1) / 2, 0]} receiveShadow>
          <cylinderGeometry args={[R, R, l.y1 - l.y0, 160, 1, true]} />
          <meshStandardMaterial color={l.color} roughness={1} side={THREE.DoubleSide} flatShading />
        </mesh>
      ))}
      {flints.map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[R + 0.05, R + 0.05, 0.28, 160, 1, true]} />
          <meshStandardMaterial color="#4b4a50" roughness={0.8} side={THREE.DoubleSide} flatShading />
        </mesh>
      ))}
      <mesh position={[0, -depth, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[R, 160]} />
        <meshStandardMaterial color="#d9d1bd" side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
};

/** Tufos de capim + flores do campo (instanciados, semeados; evitam a vala e o centro). */
export const Grass: React.FC<{ dig?: number; count?: number; clip?: THREE.Plane[] }> = ({ dig = 1, count = 1400, clip }) => {
  const tufts = useRef<THREE.InstancedMesh>(null);
  const flowers = useRef<THREE.InstancedMesh>(null);
  const pts = useMemo(() => {
    const out: { x: number; z: number; s: number; flower: number }[] = [];
    let k = 0;
    while (out.length < count && k < count * 6) {
      k++;
      const r = 20 + 72 * Math.sqrt(hash(k, 1, 3));
      const a = hash(k, 2, 5) * Math.PI * 2;
      if (Math.abs(r - DITCH_R) < 6) continue;
      const x = r * Math.cos(a);
      const z = r * Math.sin(a);
      if (Math.abs(x) < 6 && z > 8 && z < 70) continue; // canteiro e trilhos limpos
      out.push({ x, z, s: 0.35 + hash(k, 3) * 0.45, flower: hash(k, 9) });
    }
    return out;
  }, [count]);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    const qn = new THREE.Quaternion();
    const e = new THREE.Euler();
    const col = new THREE.Color();
    let fi = 0;
    pts.forEach((p, i) => {
      const y = heightAt(p.x, p.z, dig);
      e.set((hash(i, 4) - 0.5) * 0.3, hash(i, 5) * 6, (hash(i, 6) - 0.5) * 0.3);
      qn.setFromEuler(e);
      m.compose(new THREE.Vector3(p.x, y + 0.35 * p.s, p.z), qn, new THREE.Vector3(p.s, p.s, p.s));
      tufts.current?.setMatrixAt(i, m);
      col.set(GRASS[i % GRASS.length]).multiplyScalar(0.82);
      tufts.current?.setColorAt(i, col);
      if (p.flower > 0.82 && flowers.current) {
        m.compose(new THREE.Vector3(p.x + 0.6, y + 0.35, p.z + 0.3), qn, new THREE.Vector3(1, 1, 1));
        flowers.current.setMatrixAt(fi, m);
        col.set(p.flower > 0.93 ? "#f3e9a8" : p.flower > 0.88 ? "#f5f2ea" : "#c7a8d8");
        flowers.current.setColorAt(fi, col);
        fi++;
      }
    });
    if (tufts.current) {
      tufts.current.instanceMatrix.needsUpdate = true;
      if (tufts.current.instanceColor) tufts.current.instanceColor.needsUpdate = true;
    }
    if (flowers.current) {
      flowers.current.count = fi;
      flowers.current.instanceMatrix.needsUpdate = true;
      if (flowers.current.instanceColor) flowers.current.instanceColor.needsUpdate = true;
    }
  }, [pts, dig]);
  return (
    <>
      <instancedMesh ref={tufts} args={[undefined, undefined, pts.length]} castShadow>
        <coneGeometry args={[0.35, 0.8, 4]} />
        <meshStandardMaterial roughness={1} flatShading clippingPlanes={clip ?? null} />
      </instancedMesh>
      <instancedMesh ref={flowers} args={[undefined, undefined, pts.length]}>
        <icosahedronGeometry args={[0.16, 0]} />
        <meshStandardMaterial roughness={0.8} flatShading clippingPlanes={clip ?? null} />
      </instancedMesh>
    </>
  );
};

/** Árvore low-poly (copa em 2–3 blocos). */
export const Tree: React.FC<{ position: [number, number, number]; s?: number; seed?: number }> = ({ position, s = 1, seed = 0 }) => (
  <group position={position} scale={s}>
    <mesh position={[0, 1.6, 0]} castShadow>
      <cylinderGeometry args={[0.25, 0.4, 3.2, 6]} />
      <meshStandardMaterial color="#6b4e34" roughness={1} flatShading />
    </mesh>
    {[0, 1, 2].map((i) => (
      <mesh key={i} position={[(hash(seed, i) - 0.5) * 2, 4.2 + i * 0.9, (hash(seed, i + 7) - 0.5) * 2]} castShadow>
        <icosahedronGeometry args={[2.2 - i * 0.45, 0]} />
        <meshStandardMaterial color={i % 2 ? "#4f6e3b" : "#5c7d43"} roughness={1} flatShading />
      </mesh>
    ))}
  </group>
);

/** Ovelha low-poly (lã branca, cara e pernas escuras). Pasta: cabeça sobe e desce. */
export const Sheep: React.FC<{ frame: number; position: [number, number, number]; rotY?: number; seed?: number }> = ({ frame, position, rotY = 0, seed = 0 }) => {
  const graze = 0.5 + 0.5 * Math.sin((frame + seed * 41) / 38);
  return (
    <group position={position} rotation={[0, rotY, 0]}>
      <mesh position={[0, 0.75, 0]} scale={[1.25, 0.85, 0.85]} castShadow>
        <icosahedronGeometry args={[0.55, 1]} />
        <meshStandardMaterial color="#efeae0" roughness={1} flatShading />
      </mesh>
      <group position={[0.72, 0.85 - graze * 0.35, 0]} rotation={[0, 0, -0.3 - graze * 0.6]}>
        <mesh position={[0.18, 0, 0]} castShadow>
          <boxGeometry args={[0.38, 0.26, 0.24]} />
          <meshStandardMaterial color="#2d2a2e" roughness={0.9} flatShading />
        </mesh>
        {[-1, 1].map((sz) => (
          <mesh key={sz} position={[0.05, 0.1, sz * 0.15]} rotation={[sz * 0.6, 0, 0]}>
            <boxGeometry args={[0.08, 0.05, 0.16]} />
            <meshStandardMaterial color="#2d2a2e" />
          </mesh>
        ))}
      </group>
      {[[-0.35, -0.2], [-0.35, 0.2], [0.35, -0.2], [0.35, 0.2]].map(([lx, lz]) => (
        <mesh key={`${lx}${lz}`} position={[lx, 0.22, lz]} castShadow>
          <boxGeometry args={[0.1, 0.44, 0.1]} />
          <meshStandardMaterial color="#2d2a2e" />
        </mesh>
      ))}
    </group>
  );
};

/** Covinhas de cremação: manchas brancas/cinza na borda interna da vala. */
export const Cremations: React.FC<{ show: number }> = ({ show }) => (
  <>
    {Array.from({ length: 34 }, (_, i) => {
      const a = 0.35 + (i / 34) * Math.PI * 1.7 + hash(i, 3) * 0.05;
      const r = DITCH_R - 7.2 + hash(i, 8) * 1.6;
      const x = r * Math.cos(a);
      const z = r * Math.sin(a);
      const t = clamp(show * 34 - i * 0.6, 0, 1);
      return t > 0 ? (
        <mesh key={i} position={[x, heightAt(x, z) + 0.03, z]} rotation={[-Math.PI / 2, 0, 0]} scale={t}>
          <circleGeometry args={[0.55, 8]} />
          <meshStandardMaterial color={i % 3 ? "#e9e4da" : "#bdb6aa"} roughness={1} />
        </mesh>
      ) : null;
    })}
  </>
);
