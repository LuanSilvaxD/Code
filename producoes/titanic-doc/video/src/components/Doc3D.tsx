import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, Object3D, Quaternion, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// Documentário "Titanic: o que realmente aconteceu naquela noite" — mundo em alta qualidade (16:9).
// Navio: 1 u = 10 m (comprimento 26,9 u). Interiores (cesto, ponte, rádio): 1 u = 1 m.
// Regra do render contínuo: o que faz fade usa transparent SEMPRE true (só a opacidade anima).
const M = { roughness: 0.75, metalness: 0, flatShading: true } as const;
const C = (h: string) => new Color(h);

const Box: React.FC<{ p: Vec3; s: Vec3; c: string; r?: Vec3; e?: string; ei?: number; rough?: number; metal?: number }> = ({ p, s, c, r, e, ei, rough, metal }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} {...M} roughness={rough ?? 0.75} metalness={metal ?? 0} emissive={e} emissiveIntensity={ei} />
  </mesh>
);
export const Rod: React.FC<{ a: Vec3; b: Vec3; r: number; c: string; seg?: number; e?: string; ei?: number }> = ({ a, b, r, c, seg = 6, e, ei }) => {
  const va = new Vector3(...a), vb = new Vector3(...b);
  const dir = vb.clone().sub(va);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={va.add(vb).multiplyScalar(0.5).toArray() as Vec3} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, dir.length(), seg]} />
      <meshStandardMaterial color={c} {...M} emissive={e} emissiveIntensity={ei} />
    </mesh>
  );
};

/* ================================================================== TITANIC (navio herói) */

export const SHIP = { L: 26.9, B: 2.82, top: 1.55, keel: -1.05, deck: 2.25 } as const;
const u01 = (x: number) => (x + SHIP.L / 2) / SHIP.L;
/** Meia-boca do casco em x (proa = +x, popa = −x). */
export const halfBeam = (x: number) => {
  const u = u01(x), W = SHIP.B / 2;
  if (u > 0.78) return W * (1 - ((u - 0.78) / 0.22) ** 1.8);
  if (u < 0.12) return W * (1 - 0.72 * ((0.12 - u) / 0.12) ** 2);
  return W;
};
/** Altura do convés do casco (com tosamento: sobe na proa e na popa). */
export const deckTop = (x: number) => {
  const u = u01(x);
  return SHIP.top + 0.28 * Math.max(0, u - 0.7) ** 2 / 0.09 + 0.14 * Math.max(0, 0.25 - u) ** 2 / 0.0625;
};
const keelAt = (x: number) => {
  const u = u01(x);
  return u < 0.06 ? SHIP.keel + 0.75 * (1 - u / 0.06) : SHIP.keel;
};

/** Meio perfil da seção (borda do convés → costado reto → bojo → fundo), de z = +w até z = 0. */
const halfSection = (w: number, top: number, kl: number): [number, number][] => {
  const r = Math.min(0.35, w * 0.9);
  const side = [top, top - 0.08, 1.0, 0.5, 0.06, 0.02, -0.03, -0.4, kl + r].filter((y, i, arr) => y > kl + r - 1e-6 && (i === 0 || y < arr[i - 1]));
  const pts: [number, number][] = side.map((y) => [w, y]);
  for (let k = 1; k <= 5; k++) {
    const t = (k / 5) * (Math.PI / 2);
    pts.push([w - r + r * Math.cos(t), kl + r - r * Math.sin(t)]);
  }
  pts.push([0, kl]);
  return pts;
};
const SECTION_N = halfSection(SHIP.B / 2, SHIP.top, SHIP.keel).length;

const useHull = () =>
  useMemo(() => {
    const N = 110;
    const pos: number[] = [], col: number[] = [], idx: number[] = [];
    const red = C("#7a2a22"), black = C("#141418"), boot = C("#e8e2d4");
    let S = 0;
    for (let i = 0; i <= N; i++) {
      const x = -SHIP.L / 2 + (i / N) * SHIP.L;
      const w = Math.max(0.003, halfBeam(x)), top = deckTop(x), kl = keelAt(x);
      let half = halfSection(w, top, kl);
      // mesmo número de pontos em todas as seções (repete o fundo se faltar)
      while (half.length < SECTION_N) half.splice(half.length - 1, 0, half[half.length - 2]);
      half = half.slice(0, SECTION_N);
      const full = [...half, ...half.slice(0, -1).reverse().map(([z, y]) => [-z, y] as [number, number])];
      S = full.length - 1;
      for (const [z, y] of full) {
        pos.push(x, y, z);
        const c = y < -0.01 ? red : y < 0.045 ? boot : black;
        col.push(c.r, c.g, c.b);
      }
    }
    const row = S + 1;
    for (let i = 0; i < N; i++)
      for (let j = 0; j < S; j++) {
        const a = i * row + j, b = a + row;
        idx.push(a, a + 1, b, b, a + 1, b + 1);
      }
    // convés (fecha o topo) e espelho de popa
    for (let i = 0; i < N; i++) {
      const r0 = i * row, l0 = i * row + S, r1 = r0 + row, l1 = l0 + row;
      idx.push(r0, r1, l0, l0, r1, l1);
    }
    for (let j = 1; j < S; j++) idx.push(0, j + 1, j);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);

/** Escotilhas instanciadas (3 fileiras nos dois lados). */
const Portholes: React.FC<{ lights: number }> = ({ lights }) => {
  const pts = useMemo(() => {
    const out: { p: Vec3; s: number }[] = [];
    [0.42, 0.78, 1.14].forEach((y, r) => {
      for (let k = 0; k < 92; k++) {
        const x = -SHIP.L / 2 + 1.6 + k * ((SHIP.L - 4.4) / 92);
        const w = halfBeam(x);
        if (w < SHIP.B / 2 - 0.25 || y > deckTop(x) - 0.12) continue;
        if (rand(`ph${r}-${k}`) < 0.08) continue;
        [1, -1].forEach((s) => out.push({ p: [x, y, (w + 0.004) * s], s }));
      }
    });
    return out;
  }, []);
  const on = useMemo(() => pts.map((_, i) => rand(`on${i}`) > 0.22), [pts]);
  const ref = (mesh: import("three").InstancedMesh | null, lit: boolean) => {
    if (!mesh) return;
    const o = new Object3D();
    let n = 0;
    pts.forEach((pt, i) => {
      if (on[i] !== lit) return;
      o.position.set(...pt.p);
      o.rotation.set(0, pt.s > 0 ? 0 : Math.PI, 0);
      o.updateMatrix();
      mesh.setMatrixAt(n++, o.matrix);
    });
    mesh.count = n;
    mesh.instanceMatrix.needsUpdate = true;
  };
  return (
    <>
      <instancedMesh ref={(m) => ref(m, true)} args={[undefined, undefined, pts.length]}>
        <circleGeometry args={[0.045, 8]} />
        <meshBasicMaterial color={C("#2a2a34").lerp(C("#ffd890"), clamp(lights, 0, 1))} toneMapped={false} />
      </instancedMesh>
      <instancedMesh ref={(m) => ref(m, false)} args={[undefined, undefined, pts.length]}>
        <circleGeometry args={[0.045, 8]} />
        <meshBasicMaterial color="#2a2a34" />
      </instancedMesh>
    </>
  );
};

/** Bote salva-vidas pequeno pendurado no turco (escala do navio). */
const DavitBoat: React.FC<{ p: Vec3; s: number }> = ({ p, s }) => (
  <group position={p}>
    <mesh scale={[0.38, 0.09, 0.11]} castShadow>
      <sphereGeometry args={[1, 10, 5, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
      <meshStandardMaterial color="#f2efe6" {...M} side={DoubleSide} />
    </mesh>
    <Box p={[0, 0.005, 0]} s={[0.7, 0.012, 0.18]} c="#c9b89a" />
    {[-0.3, 0.3].map((dx) => (
      <group key={dx}>
        <Rod a={[dx, -0.06, -0.1 * s]} b={[dx, 0.22, -0.1 * s]} r={0.012} c="#2a2a30" seg={4} />
        <Rod a={[dx, 0.22, -0.1 * s]} b={[dx, 0.22, 0.04 * s]} r={0.012} c="#2a2a30" seg={4} />
      </group>
    ))}
  </group>
);

/**
 * Titanic (desenho próprio, proporções do navio real). Proa +x, linha d'água em y = 0.
 * lights 0..1 acende escotilhas e janelas; smoke 0..1 fumaça nas 3 chaminés de verdade.
 */
export const TitanicHero: React.FC<{ f: number; lights?: number; smoke?: number; cutBridge?: boolean }> = ({ f, lights = 0, smoke = 0, cutBridge = false }) => {
  const hull = useHull();
  const D = SHIP.deck, T = SHIP.top;
  const wins = useMemo(() => Array.from({ length: 64 }, (_, i) => ({ x: -9.3 + i * 0.28, lit: rand(`w${i}`) > 0.25 })), []);
  const lit = (on: boolean) => (on && lights > 0.5 ? "#ffe2a0" : "#3a3a46");
  return (
    <group>
      <mesh geometry={hull} castShadow receiveShadow>
        <meshStandardMaterial vertexColors {...M} roughness={0.55} metalness={0.15} />
      </mesh>
      {/* faixa dourada no alto do casco */}
      {[1, -1].map((s) => (
        <mesh key={`g${s}`} position={[-0.6, T - 0.07, (SHIP.B / 2 + 0.003) * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[SHIP.L * 0.74, 0.025]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      <Portholes lights={lights} />
      {/* castelo de proa e tombadilho */}
      <Box p={[11.6, T + 0.12, 0]} s={[2.6, 0.06, 1.2]} c="#a68a64" />
      {/* superestrutura branca (conveses A/B) */}
      <Box p={[-0.4, (T + D) / 2, 0]} s={[18.4, D - T, SHIP.B * 0.9]} c="#ece8de" />
      {[1, -1].map((s) =>
        wins.map((w, i) =>
          [0, 1].map((r) => (
            <mesh key={`${s}${i}${r}`} position={[w.x, T + 0.18 + r * 0.32, SHIP.B * 0.45 * s + 0.003 * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
              <planeGeometry args={[0.2, 0.14]} />
              <meshBasicMaterial color={lit(w.lit && r === 1 ? true : w.lit)} toneMapped={false} />
            </mesh>
          )),
        ),
      )}
      {/* convés dos botes (madeira) */}
      <Box p={[-0.4, D + 0.01, 0]} s={[18.6, 0.02, SHIP.B * 0.92]} c="#b89a6e" />
      {/* casarias no convés dos botes */}
      {cutBridge ? null : <Box p={[7.4, D + 0.17, 0]} s={[2.2, 0.32, 1.4]} c="#ece8de" />}
      <Box p={[1.0, D + 0.15, 0]} s={[6.4, 0.28, 1.1]} c="#e6e1d4" />
      <Box p={[-4.6, D + 0.15, 0]} s={[3.6, 0.28, 1.1]} c="#e6e1d4" />
      {/* ponte de comando com asas */}
      {cutBridge ? null : <Box p={[8.55, D + 0.2, 0]} s={[0.45, 0.4, 1.3]} c="#ece8de" />}
      {cutBridge ? null : <Box p={[8.55, D + 0.4, 0]} s={[0.5, 0.04, SHIP.B * 0.96]} c="#ece8de" />}
      {(cutBridge ? [] : [-0.4, -0.2, 0, 0.2, 0.4]).map((z, i) => (
        <mesh key={`bw${i}`} position={[8.785, D + 0.26, z]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[0.13, 0.12]} />
          <meshBasicMaterial color={lights > 0.5 ? "#ffe8b0" : "#3a3a46"} toneMapped={false} />
        </mesh>
      ))}
      {/* 4 chaminés elípticas, inclinadas para trás */}
      {[6.0, 2.4, -1.3, -5.0].map((x, i) => (
        <group key={i} position={[x, D + 0.02, 0]} rotation={[0, 0, 0.09]}>
          <mesh position={[0, 1.05, 0]} scale={[1, 1, 0.78]} castShadow>
            <cylinderGeometry args={[0.32, 0.34, 2.1, 20]} />
            <meshStandardMaterial color="#c8873a" {...M} roughness={0.6} />
          </mesh>
          <mesh position={[0, 2.25, 0]} scale={[1, 1, 0.78]}>
            <cylinderGeometry args={[0.325, 0.325, 0.38, 20]} />
            <meshStandardMaterial color="#121214" {...M} />
          </mesh>
          <Rod a={[-0.34, 0.2, 0]} b={[-0.34, 2.3, 0]} r={0.025} c="#c8873a" seg={5} />
          {/* estais */}
          {[1, -1].map((s) => (
            <Rod key={s} a={[0, 1.8, 0.2 * s]} b={[0.2, -0.02, 1.25 * s]} r={0.006} c="#2a2a30" seg={3} />
          ))}
          {/* fumaça */}
          {i < 3 && smoke > 0.01
            ? Array.from({ length: 6 }, (_, j) => {
                const ph = (f * 0.008 + j / 6 + i * 0.27) % 1;
                return (
                  <mesh key={`s${j}`} position={[-0.4 - ph * 3.4, 2.55 + ph * 1.4, Math.sin(ph * 4 + i) * 0.2]} scale={0.3 + ph * 0.9}>
                    <icosahedronGeometry args={[1, 1]} />
                    <meshStandardMaterial color="#6a6a74" transparent opacity={0.42 * (1 - ph) * smoke} depthWrite={false} flatShading />
                  </mesh>
                );
              })
            : null}
        </group>
      ))}
      {/* botes nos turcos */}
      {[7.6, 6.85, 5.0, 4.25, -3.0, -3.75, -6.4, -7.15].map((x, i) =>
        [1, -1].map((s) => <DavitBoat key={`${i}${s}`} p={[x, D + 0.12, (SHIP.B / 2 - 0.12) * s]} s={s} />),
      )}
      {/* ventiladores */}
      {[3.8, 0.2, -2.6, -6.2].map((x, i) =>
        [1, -1].map((s) => (
          <group key={`v${i}${s}`} position={[x, D + 0.02, 0.5 * s]}>
            <Rod a={[0, 0, 0]} b={[0, 0.28, 0]} r={0.05} c="#e2ddd0" seg={6} />
            <mesh position={[0.05, 0.32, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.09, 0.055, 0.12, 8]} />
              <meshStandardMaterial color="#e2ddd0" {...M} />
            </mesh>
          </group>
        )),
      )}
      {/* mastros, cesto da gávea e antena */}
      <Rod a={[10.6, T + 0.1, 0]} b={[10.85, 6.4, 0]} r={0.07} c="#8a6a48" seg={8} />
      <mesh position={[10.72, 3.9, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.22, 10, 1, true]} />
        <meshStandardMaterial color="#e8e0cc" {...M} side={DoubleSide} />
      </mesh>
      <Rod a={[-10.6, T + 0.05, 0]} b={[-10.85, 6.0, 0]} r={0.065} c="#8a6a48" seg={8} />
      <Rod a={[10.85, 6.35, 0]} b={[-10.85, 5.95, 0]} r={0.008} c="#2a2a30" seg={3} />
      {[1, -1].map((s) => (
        <group key={`st${s}`}>
          <Rod a={[10.8, 5.8, 0]} b={[10.0, T + 0.1, 1.2 * s]} r={0.006} c="#2a2a30" seg={3} />
          <Rod a={[-10.8, 5.5, 0]} b={[-10.0, T + 0.1, 1.2 * s]} r={0.006} c="#2a2a30" seg={3} />
        </group>
      ))}
      {/* luz de topo do mastro */}
      {lights > 0.01 ? (
        <mesh position={[10.86, 6.45, 0]}>
          <sphereGeometry args={[0.06, 8, 6]} />
          <meshBasicMaterial color="#fff4d0" toneMapped={false} />
        </mesh>
      ) : null}
      {/* âncoras */}
      {[1, -1].map((s) => (
        <mesh key={`an${s}`} position={[12.2, 1.0, (halfBeam(12.2) + 0.01) * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
          <planeGeometry args={[0.25, 0.3]} />
          <meshStandardMaterial color="#1a1a1e" side={DoubleSide} />
        </mesh>
      ))}
      {/* leme e hélices (embaixo d'água) */}
      <Box p={[-13.35, -0.55, 0]} s={[0.5, 0.95, 0.06]} c="#5a2a22" />
      {[-0.55, 0, 0.55].map((z, i) => (
        <group key={`pr${i}`} position={[-12.75 + (i === 1 ? -0.35 : 0), -0.75, z]} rotation={[f * 0.05 * 0, 0, Math.PI / 2]}>
          {[0, 1, 2].map((k) => (
            <mesh key={k} rotation={[0, (k * Math.PI * 2) / 3, 0]} position={[0, 0, 0]}>
              <boxGeometry args={[0.03, 0.04, 0.42]} />
              <meshStandardMaterial color="#b08a4a" metalness={0.6} roughness={0.35} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
};

/* ================================================================== ICEBERG (v2: blocos facetados) */

type P2 = [number, number];
/** Polígono irregular (raio médio r, n lados) para a base de um bloco de gelo. */
const blob = (n: number, r: number, seed: string, ox = 0, oz = 0, squash = 1): P2[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2 + (rand(`${seed}a${i}`) - 0.5) * 0.35;
    const rr = r * (0.72 + rand(`${seed}r${i}`) * 0.5);
    return [ox + Math.cos(a) * rr, oz + Math.sin(a) * rr * squash];
  });

/**
 * Tronco de prisma (base `poly` em y0, topo encolhido `k` e deslocado em y0+h), faces planas.
 * Cor por face: topo branco-neve, paredes azul-gelo (mais fundas perto da água), paredes viradas para baixo mais escuras.
 */
const frustum = (poly: P2[], y0: number, h: number, k: number, off: P2, seed: string) => {
  const cx = poly.reduce((s, p) => s + p[0], 0) / poly.length, cz = poly.reduce((s, p) => s + p[1], 0) / poly.length;
  const top = poly.map(([x, z], i): [number, number, number] => [cx + (x - cx) * k * (0.9 + rand(`${seed}k${i}`) * 0.2) + off[0], y0 + h * (0.92 + rand(`${seed}h${i}`) * 0.16), cz + (z - cz) * k + off[1]]);
  const bot = poly.map(([x, z]): [number, number, number] => [x, y0, z]);
  const pos: number[] = [], col: number[] = [];
  const snow = C("#f6fbff"), face = C("#cdeaf6"), deep = C("#7fc2de"), shade = C("#5aa6c8");
  const tri = (a: number[], b: number[], c: number[]) => {
    const u = new Vector3(b[0] - a[0], b[1] - a[1], b[2] - a[2]), v = new Vector3(c[0] - a[0], c[1] - a[1], c[2] - a[2]);
    const n = u.cross(v).normalize();
    const midY = (a[1] + b[1] + c[1]) / 3;
    const cc = n.y > 0.75 ? snow.clone() : face.clone().lerp(deep, clamp(1 - (midY + 0.3) / 3, 0, 1)).lerp(shade, clamp(-n.y, 0, 1) * 0.8);
    // leve variação por face (gelo não é uniforme)
    cc.offsetHSL(0, 0, (rand(`${seed}f${pos.length}`) - 0.5) * 0.06);
    for (const p of [a, b, c]) { pos.push(p[0], p[1], p[2]); col.push(cc.r, cc.g, cc.b); }
  };
  const n = poly.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    tri(bot[i], bot[j], top[j]);
    tri(bot[i], top[j], top[i]);
  }
  const tc = [top.reduce((s, p) => s + p[0], 0) / n, top.reduce((s, p) => s + p[1], 0) / n + h * 0.04, top.reduce((s, p) => s + p[2], 0) / n];
  for (let i = 0; i < n; i++) tri(top[i], top[(i + 1) % n], tc);
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
  g.computeVertexNormals();
  return g;
};

/** Iceberg: base larga + bloco do meio + pico inclinado, faces planas, espuma na linha d'água e massa submersa azul. */
export const Iceberg: React.FC<{ s?: number; seed?: number; under?: boolean; f?: number }> = ({ s = 1, seed = 3, under = true, f = 0 }) => {
  const parts = useMemo(() => {
    const sd = `ice${seed}`;
    return {
      base: frustum(blob(9, 3.0, sd + "b", 0, 0, 0.75), -0.25, 0.85, 0.86, [0.1, 0], sd + "b"),
      mid: frustum(blob(8, 1.9, sd + "m", 0.4, -0.1, 0.8), 0.55, 1.25, 0.78, [0.15, 0.05], sd + "m"),
      peak: frustum(blob(6, 1.05, sd + "p", 0.9, -0.2, 0.9), 1.7, 1.7, 0.35, [0.35, 0.1], sd + "p"),
      shard: frustum(blob(5, 0.7, sd + "s", -1.6, 0.4, 0.9), 0.55, 0.9, 0.4, [-0.1, 0], sd + "s"),
      sub: frustum(blob(10, 3.6, sd + "u", 0, 0, 0.8), -3.4, 3.1, 0.82, [0, 0], sd + "u"),
    };
  }, [seed]);
  const mat = <meshStandardMaterial vertexColors roughness={0.28} metalness={0.05} flatShading emissive="#2a4a62" emissiveIntensity={0.35} />;
  return (
    <group scale={s}>
      <mesh geometry={parts.base} castShadow receiveShadow>{mat}</mesh>
      <mesh geometry={parts.mid} castShadow receiveShadow>{mat}</mesh>
      <mesh geometry={parts.peak} castShadow receiveShadow>{mat}</mesh>
      <mesh geometry={parts.shard} castShadow receiveShadow>{mat}</mesh>
      {/* espuma batendo na base */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = (i / 22) * Math.PI * 2;
        const r = 2.75 + Math.sin(i * 1.7) * 0.25;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.02 + 0.02 * Math.sin(f / 10 + i), Math.sin(a) * r * 0.75]} rotation={[-Math.PI / 2, 0, a]} scale={[0.5, 0.18, 1]}>
            <circleGeometry args={[0.5, 7]} />
            <meshBasicMaterial color="#e8f4fa" transparent opacity={0.55} depthWrite={false} />
          </mesh>
        );
      })}
      {under ? (
        <mesh geometry={parts.sub}>
          <meshStandardMaterial vertexColors roughness={0.4} flatShading transparent opacity={0.55} depthWrite={false} color="#7fbcd8" />
        </mesh>
      ) : null}
    </group>
  );
};

/* ================================================================== CORTE DOS COMPARTIMENTOS */

/** Divisões dos 16 compartimentos (x das 15 anteparas, proa = +x). */
export const BULKHEADS = Array.from({ length: 15 }, (_, i) => -11.2 + (i + 1) * (23.6 / 16));
/** Altura do topo das anteparas (não iam até o convés de cima). */
const bhTop = (x: number) => 0.85 + 0.35 * clamp((x - 4) / 8, 0, 1);

/**
 * Corte longitudinal esquemático do casco: casco como perfil, 15 anteparas, conveses e água por compartimento.
 * flood[i] 0..1 = nível do compartimento i (0 = popa … 15 = proa). Água sempre transparente.
 */
export const HullCutaway: React.FC<{ flood?: number[]; f: number }> = ({ flood = [], f }) => {
  const xs = [-11.2, ...BULKHEADS, 12.4];
  const profile = useMemo(() => {
    const N = 60, pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const x = -SHIP.L / 2 + (i / N) * SHIP.L;
      pos.push(x, keelAt(x), 0, x, deckTop(x), 0);
    }
    for (let i = 0; i < N; i++) idx.push(i * 2, i * 2 + 2, i * 2 + 1, i * 2 + 1, i * 2 + 2, i * 2 + 3);
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      {/* fundo interno (parede de trás do corte) */}
      <mesh geometry={profile} position={[0, 0, -0.35]}>
        <meshStandardMaterial color="#2a2834" side={DoubleSide} roughness={0.9} />
      </mesh>
      {/* contorno do casco (quilha + borda) */}
      {Array.from({ length: 40 }, (_, i) => {
        const x0 = -SHIP.L / 2 + (i / 40) * SHIP.L, x1 = -SHIP.L / 2 + ((i + 1) / 40) * SHIP.L;
        return (
          <group key={i}>
            <Rod a={[x0, keelAt(x0), 0]} b={[x1, keelAt(x1), 0]} r={0.06} c="#7a2a22" seg={5} />
            <Rod a={[x0, deckTop(x0), 0]} b={[x1, deckTop(x1), 0]} r={0.05} c="#141418" seg={5} />
          </group>
        );
      })}
      <Rod a={[SHIP.L / 2, keelAt(SHIP.L / 2), 0]} b={[SHIP.L / 2, deckTop(SHIP.L / 2), 0]} r={0.06} c="#141418" />
      <Rod a={[-SHIP.L / 2, keelAt(-SHIP.L / 2), 0]} b={[-SHIP.L / 2, deckTop(-SHIP.L / 2), 0]} r={0.06} c="#141418" />
      {/* conveses internos */}
      {[0.25, 0.55, 1.2].map((y, i) => (
        <Box key={`dk${i}`} p={[0.6, y, -0.1]} s={[23.6, 0.025, 0.4]} c="#5a5468" />
      ))}
      {/* anteparas */}
      {BULKHEADS.map((x, i) => (
        <Box key={`bh${i}`} p={[x, (keelAt(x) + bhTop(x)) / 2, -0.05]} s={[0.07, bhTop(x) - keelAt(x), 0.55]} c="#c4b5fd" />
      ))}
      {/* água por compartimento */}
      {xs.slice(0, -1).map((x0, i) => {
        const x1 = xs[i + 1], k = clamp(flood[i] ?? 0, 0, 1);
        if (k < 0.01) return null;
        const bottom = Math.max(keelAt(x0), keelAt(x1)), topY = deckTop((x0 + x1) / 2) - 0.05;
        const h = (topY - bottom) * k;
        return (
          <group key={`w${i}`}>
            <mesh position={[(x0 + x1) / 2, bottom + h / 2, 0]}>
              <boxGeometry args={[x1 - x0 - 0.08, h, 0.6]} />
              <meshStandardMaterial color="#2f7ac8" transparent opacity={0.6} roughness={0.2} depthWrite={false} />
            </mesh>
            <mesh position={[(x0 + x1) / 2, bottom + h + 0.004 * Math.sin(f * 0.3 + i), 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[x1 - x0 - 0.08, 0.6]} />
              <meshBasicMaterial color="#9fd2ff" transparent opacity={0.7} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ================================================================== INTERIORES (1 u = 1 m) */

/**
 * Cesto da gávea (1912): preso na FRENTE do mastro (proa = +x), parede baixa para ver o vigia da cintura para cima,
 * sino num suporte acima, telefone, escada pela porta do mastro, cabos (estais) e lanterna fraca.
 * O cesto fica centrado em x = NEST_X (relativo ao mastro); o vigia vai lá dentro.
 */
export const NEST_X = 0.9;
export const CrowsNest: React.FC<{ f: number; bell?: number }> = ({ f, bell = 0 }) => {
  const swing = clamp(bell, 0, 1) * 0.55 * Math.sin(f * 0.9);
  return (
    <group>
      {/* mastro (atrás do cesto) */}
      <Rod a={[0, -14, 0]} b={[0, 6, 0]} r={0.3} c="#8a6a48" seg={14} />
      {/* braçadeiras de ferro */}
      {[-0.3, 1.25].map((y) => (
        <mesh key={y} position={[0, y, 0]}>
          <cylinderGeometry args={[0.33, 0.33, 0.1, 14]} />
          <meshStandardMaterial color="#2a2a30" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}
      <group position={[NEST_X, 0, 0]}>
        {/* piso e parede baixa (0,95 m), aberta atrás onde encosta no mastro */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.85, 0.75, 0.1, 22]} />
          <meshStandardMaterial color="#5a4030" {...M} />
        </mesh>
        <mesh position={[0, 0.5, 0]} rotation={[0, Math.PI * 0.62, 0]}>
          <cylinderGeometry args={[0.85, 0.82, 0.95, 26, 1, true, 0, Math.PI * 1.55]} />
          <meshStandardMaterial color="#e6dcc4" {...M} side={DoubleSide} />
        </mesh>
        <mesh position={[0, 0.98, 0]} rotation={[Math.PI / 2, 0, Math.PI * 0.38]}>
          <torusGeometry args={[0.86, 0.035, 6, 30, Math.PI * 1.55]} />
          <meshStandardMaterial color="#7a5a3a" {...M} />
        </mesh>
        {/* faixas de reforço */}
        {[0.2, 0.7].map((y) => (
          <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, Math.PI * 0.38]}>
            <torusGeometry args={[0.855, 0.012, 4, 30, Math.PI * 1.55]} />
            <meshStandardMaterial color="#9a8a6a" />
          </mesh>
        ))}
        {/* telefone na parede de dentro */}
        <Box p={[-0.15, 0.72, -0.7]} s={[0.16, 0.24, 0.08]} c="#1e1e24" />
        <Rod a={[-0.15, 0.72, -0.66]} b={[-0.05, 0.85, -0.6]} r={0.012} c="#1e1e24" seg={4} />
      </group>
      {/* sino num suporte acima do cesto */}
      <group position={[0.45, 1.75, 0.0]}>
        <Rod a={[-0.45, 0, 0]} b={[0.15, 0, 0]} r={0.025} c="#2a2a30" seg={5} />
        <group position={[0.1, -0.02, 0]} rotation={[swing, 0, 0]}>
          <mesh position={[0, -0.14, 0]}>
            <cylinderGeometry args={[0.07, 0.14, 0.22, 14, 1, true]} />
            <meshStandardMaterial color="#c9a24a" metalness={0.75} roughness={0.28} side={DoubleSide} />
          </mesh>
          <mesh position={[0, -0.03, 0]}>
            <sphereGeometry args={[0.07, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#c9a24a" metalness={0.75} roughness={0.28} />
          </mesh>
          <Rod a={[0, -0.05, 0]} b={[0, -0.6, 0]} r={0.006} c="#d8cdb6" seg={3} />
        </group>
      </group>
      {/* estais descendo do mastro */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Rod a={[0, 4.5, 0]} b={[-1.2, -14, 3.2 * s]} r={0.018} c="#2a2a30" seg={3} />
          <Rod a={[0, 3.5, 0]} b={[3.5, -14, 2.2 * s]} r={0.015} c="#2a2a30" seg={3} />
        </group>
      ))}
      {/* lanterna fraca no mastro */}
      <mesh position={[0.32, 1.4, 0.2]}>
        <sphereGeometry args={[0.05, 8, 6]} />
        <meshBasicMaterial color="#ffd890" toneMapped={false} />
      </mesh>
      <pointLight position={[0.6, 1.3, 0.3]} intensity={0.9} distance={3} color="#ffc070" />
    </group>
  );
};

/** Relógio de parede (h, m em horas/minutos). */
export const WallClock: React.FC<{ p: Vec3; r?: number; h?: number; m?: number; rotY?: number }> = ({ p, r = 0.22, h = 11, m = 40, rotY = 0 }) => {
  const am = (m / 60) * Math.PI * 2, ah = ((h % 12) / 12 + m / 720) * Math.PI * 2;
  return (
    <group position={p} rotation={[0, rotY, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.05, 24]} />
        <meshStandardMaterial color="#7a4a26" {...M} />
      </mesh>
      <mesh position={[0, 0, 0.03]}>
        <circleGeometry args={[r * 0.86, 24]} />
        <meshStandardMaterial color="#f4ecd8" emissive="#f4ecd8" emissiveIntensity={0.15} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[Math.sin((i * Math.PI) / 6) * r * 0.72, Math.cos((i * Math.PI) / 6) * r * 0.72, 0.035]}>
          <boxGeometry args={[0.012, 0.03, 0.005]} />
          <meshBasicMaterial color="#2a2a30" />
        </mesh>
      ))}
      <group position={[0, 0, 0.04]} rotation={[0, 0, -ah]}><Box p={[0, r * 0.25, 0]} s={[0.018, r * 0.5, 0.005]} c="#1a1a1e" /></group>
      <group position={[0, 0, 0.045]} rotation={[0, 0, -am]}><Box p={[0, r * 0.35, 0]} s={[0.012, r * 0.7, 0.005]} c="#1a1a1e" /></group>
    </group>
  );
};

/** Piso de tábuas (faixas alternadas). */
const Planks: React.FC<{ w: number; d: number; c1?: string; c2?: string }> = ({ w, d, c1 = "#8f6a44", c2 = "#80603c" }) => (
  <group>
    {Array.from({ length: Math.round(d / 0.25) }, (_, i) => (
      <Box key={i} p={[0, -0.05, -d / 2 + 0.125 + i * 0.25]} s={[w, 0.1, 0.245]} c={i % 2 ? c1 : c2} />
    ))}
  </group>
);

/**
 * Ponte de comando (casa do leme), janelas para a proa (+x). Piso de tábuas, paredes laterais com vigias,
 * mesa de cartas com mapa, relógio, tubos de voz de latão, roda do leme, telégrafo, bitácula e lampiões.
 * Por fora das janelas, a cena coloca mar e estrelas.
 */
export const Bridge: React.FC<{ f: number; wheel?: number; tele?: number; night?: number }> = ({ f, wheel = 0, tele = 0, night = 1 }) => (
  <group>
    <Planks w={6} d={5} />
    {/* parede da frente: rodapé + janelas com caixilhos de madeira escura */}
    <Box p={[2.5, 0.45, 0]} s={[0.14, 0.9, 5]} c="#ece8de" />
    <Box p={[2.5, 2.35, 0]} s={[0.14, 0.5, 5]} c="#ece8de" />
    {[-2.4, -1.2, 0, 1.2, 2.4].map((z, i) => <Box key={`m${i}`} p={[2.5, 1.45, z]} s={[0.16, 1.0, 0.1]} c="#5a3a1e" />)}
    {[-1.8, -0.6, 0.6, 1.8].map((z, i) => (
      <mesh key={`g${i}`} position={[2.48, 1.45, z]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[1.1, 1.0]} />
        <meshStandardMaterial color={night > 0.5 ? "#081022" : "#a8c8e0"} transparent opacity={0.35} roughness={0.05} metalness={0.4} depthWrite={false} />
      </mesh>
    ))}
    {/* paredes laterais com vigias */}
    {[-2.5].map((z, k) => (
      <group key={`w${k}`}>
        <Box p={[0, 1.3, z]} s={[6, 2.6, 0.12]} c="#e6e0d2" />
        {[-1.5, 0.5].map((x, i) => (
          <group key={i} position={[x, 1.55, z - 0.07 * Math.sign(z)]} rotation={[0, z > 0 ? Math.PI : 0, 0]}>
            <mesh><ringGeometry args={[0.2, 0.26, 20]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} side={DoubleSide} /></mesh>
            <mesh><circleGeometry args={[0.2, 20]} /><meshBasicMaterial color="#081022" /></mesh>
          </group>
        ))}
      </group>
    ))}
    {/* parede do fundo (meia altura, aberta para a câmera ver) */}
    <Box p={[-2.95, 0.5, 0]} s={[0.1, 1.0, 5]} c="#7a4a26" />
    {/* vigas do teto (sem teto: cenário aberto para a câmera) */}
    {[-2, -0.7, 0.6, 1.9].map((x, i) => <Box key={`b${i}`} p={[x, 2.56, 0]} s={[0.12, 0.1, 5]} c="#c8bfae" />)}
    {/* mesa de cartas com mapa e compasso */}
    <Box p={[-1.9, 0.9, -1.7]} s={[1.2, 0.06, 0.8]} c="#7a4a26" />
    <Box p={[-1.9, 0.45, -1.7]} s={[1.1, 0.88, 0.7]} c="#5a3a1e" />
    <mesh position={[-1.9, 0.935, -1.7]} rotation={[-Math.PI / 2, 0, 0.1]}>
      <planeGeometry args={[0.9, 0.6]} />
      <meshStandardMaterial color="#e8dcc0" />
    </mesh>
    <Rod a={[-2.1, 0.94, -1.8]} b={[-1.75, 0.94, -1.55]} r={0.006} c="#3a5a8a" seg={3} />
    <WallClock p={[-1.2, 2.0, -2.43]} h={11} m={40} />
    {/* tubos de voz de latão */}
    {[-0.4, 0.0].map((z, i) => (
      <group key={`vt${i}`}>
        <Rod a={[2.25, 0, 1.9 + z]} b={[2.25, 1.15, 1.9 + z]} r={0.04} c="#c9a24a" seg={8} />
        <mesh position={[2.25, 1.2, 1.9 + z]}><cylinderGeometry args={[0.07, 0.045, 0.1, 10]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} /></mesh>
      </group>
    ))}
    {/* roda do leme */}
    <group position={[1.2, 1.2, 0]} rotation={[0, Math.PI / 2, wheel]}>
      <mesh>
        <torusGeometry args={[0.45, 0.04, 8, 24]} />
        <meshStandardMaterial color="#7a4a26" {...M} />
      </mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <Rod key={i} a={[0, 0, 0]} b={[Math.cos((i * Math.PI) / 4) * 0.58, Math.sin((i * Math.PI) / 4) * 0.58, 0]} r={0.022} c="#7a4a26" seg={5} />
      ))}
      <mesh>
        <cylinderGeometry args={[0.08, 0.08, 0.12, 10]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
    <Box p={[1.3, 0.55, 0]} s={[0.3, 1.1, 0.3]} c="#7a4a26" />
    {/* telégrafos das máquinas (par) */}
    {[1.4, -1.4].map((z, k) => (
      <group key={`t${k}`} position={[1.6, 0, z]}>
        <Rod a={[0, 0, 0]} b={[0, 1.1, 0]} r={0.08} c="#c9a24a" seg={10} />
        <mesh position={[0, 1.25, 0]} rotation={[0, Math.PI / 2, 0]}>
          <cylinderGeometry args={[0.26, 0.26, 0.14, 20]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0.075, 1.25, 0]} rotation={[0, Math.PI / 2, 0]}>
          <circleGeometry args={[0.21, 20]} />
          <meshStandardMaterial color="#f2ead6" emissive="#f2ead6" emissiveIntensity={0.15} />
        </mesh>
        <group position={[0.09, 1.25, 0]} rotation={[tele, 0, 0]}>
          <Rod a={[0, 0, 0]} b={[0, 0.3, 0]} r={0.02} c="#2a2a30" seg={4} />
        </group>
      </group>
    ))}
    {/* bitácula (bússola) */}
    <group position={[0.2, 0, -1.2]}>
      <Rod a={[0, 0, 0]} b={[0, 1.0, 0]} r={0.16} c="#7a4a26" seg={10} />
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
    {/* lampiões */}
    {[[-1.5, 0], [0.8, 1.6]].map(([x, z], i) => (
      <group key={`l${i}`}>
        <mesh position={[x, 2.32, z]}><sphereGeometry args={[0.1, 10, 8]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh>
        <pointLight position={[x, 2.2, z]} intensity={1.6 * night + 0.4} distance={6} color="#ffd08a" />
      </group>
    ))}
    {void f}
  </group>
);

/**
 * Sala de rádio (Marconi): paredes de madeira, vigia para a noite, relógio às 23h40, quadro de avisos,
 * mesa com o aparelho (mostradores, faísca azul), chave, fones, cadeira e mensagens empilhando.
 */
export const RadioRoom: React.FC<{ f: number; spark?: number; papers?: number }> = ({ f, spark = 1, papers = 1 }) => {
  const sp = clamp(spark, 0, 1) * (Math.sin(f * 1.7) > 0.2 ? 1 : 0.25);
  const nP = Math.round(clamp(papers, 0, 1) * 12);
  return (
    <group>
      <Planks w={4} d={3.5} c1="#6a4a30" c2="#5e4229" />
      {/* parede do fundo com lambris */}
      <Box p={[0, 1.3, -1.75]} s={[4, 2.7, 0.1]} c="#e2d8c4" />
      <Box p={[0, 0.5, -1.69]} s={[4, 1.0, 0.04]} c="#7a4a26" />
      {Array.from({ length: 10 }, (_, i) => <Box key={`lp${i}`} p={[-1.8 + i * 0.4, 0.5, -1.665]} s={[0.02, 0.95, 0.01]} c="#5a3a1e" />)}
      <Box p={[-2, 1.3, 0]} s={[0.1, 2.7, 3.5]} c="#d8cdb6" />
      {/* vigia com a noite lá fora */}
      <group position={[-1.94, 1.6, 0.6]} rotation={[0, Math.PI / 2, 0]}>
        <mesh><ringGeometry args={[0.2, 0.27, 22]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} side={DoubleSide} /></mesh>
        <mesh><circleGeometry args={[0.2, 22]} /><meshBasicMaterial color="#060c1c" /></mesh>
      </group>
      <WallClock p={[1.3, 2.1, -1.69]} h={11} m={40} />
      {/* quadro de avisos com mensagens presas */}
      <Box p={[-1.0, 1.95, -1.69]} s={[1.0, 0.6, 0.03]} c="#9a7a54" />
      {[[-1.3, 2.05], [-1.0, 1.9], [-0.72, 2.05], [-1.15, 1.8]].map(([x, y], i) => (
        <mesh key={`n${i}`} position={[x, y, -1.67]} rotation={[0, 0, (rand(`nb${i}`) - 0.5) * 0.3]}>
          <planeGeometry args={[0.2, 0.26]} />
          <meshStandardMaterial color="#f4efe2" />
        </mesh>
      ))}
      {/* mesa */}
      <Box p={[0, 0.75, -1.2]} s={[2.6, 0.06, 0.9]} c="#7a4a26" />
      {[-1.2, 1.2].map((x) => <Box key={x} p={[x, 0.37, -1.2]} s={[0.08, 0.74, 0.8]} c="#5a3a1e" />)}
      {/* aparelho Marconi */}
      <Box p={[-0.5, 1.2, -1.55]} s={[1.3, 0.8, 0.3]} c="#3a2e24" />
      {[-0.95, -0.6, -0.25].map((x, i) => (
        <mesh key={i} position={[x, 1.32, -1.39]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#f2ead6" emissive="#f2ead6" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {[-0.95, -0.6, -0.25].map((x, i) => (
        <mesh key={`k${i}`} position={[x, 1.02, -1.38]}><cylinderGeometry args={[0.035, 0.035, 0.04, 10]} /><meshStandardMaterial color="#1a1a1e" /></mesh>
      ))}
      {/* cabos pela parede */}
      <Rod a={[0.1, 1.6, -1.68]} b={[0.1, 2.65, -1.68]} r={0.012} c="#1a1a1e" seg={4} />
      <Rod a={[-0.3, 1.6, -1.68]} b={[-0.3, 2.65, -1.68]} r={0.012} c="#1a1a1e" seg={4} />
      {/* centelhador (faísca) */}
      <Box p={[0.55, 1.05, -1.5]} s={[0.4, 0.5, 0.3]} c="#2a2a30" />
      <mesh position={[0.55, 1.12, -1.33]}>
        <sphereGeometry args={[0.06 + 0.03 * sp, 10, 8]} />
        <meshBasicMaterial color="#9fd8ff" transparent opacity={0.4 + 0.6 * sp} toneMapped={false} />
      </mesh>
      <pointLight position={[0.55, 1.15, -1.1]} intensity={1.6 * sp} distance={3} color="#9fd8ff" />
      <Box p={[0.1, 0.8, -0.95]} s={[0.22, 0.04, 0.1]} c="#c9a24a" metal={0.6} />
      <mesh position={[-0.9, 0.82, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a1e" />
      </mesh>
      {/* cadeira */}
      <group position={[0.0, 0, -0.45]}>
        <Box p={[0, 0.46, 0]} s={[0.45, 0.05, 0.45]} c="#5a3a1e" />
        <Box p={[0, 0.8, 0.21]} s={[0.45, 0.6, 0.05]} c="#5a3a1e" />
        {[[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]].map(([x, z], i) => <Box key={i} p={[x, 0.22, z]} s={[0.04, 0.44, 0.04]} c="#4a2e18" />)}
      </group>
      {/* mensagens empilhando */}
      {Array.from({ length: nP }, (_, i) => (
        <mesh key={`p${i}`} position={[0.9 + (i % 3) * 0.04, 0.79 + i * 0.012, -1.0 + (i % 2) * 0.03]} rotation={[-Math.PI / 2, 0, rand(`pp${i}`) * 0.6]}>
          <planeGeometry args={[0.21, 0.28]} />
          <meshStandardMaterial color="#f4efe2" side={DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, 2.4, -0.6]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color="#ffe0a0" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.3, -0.4]} intensity={2.0} distance={7} color="#ffd08a" />
    </group>
  );
};
