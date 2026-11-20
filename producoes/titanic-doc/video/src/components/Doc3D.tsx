import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, IcosahedronGeometry, Object3D, Quaternion, Vector3 } from "three";
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
export const TitanicHero: React.FC<{ f: number; lights?: number; smoke?: number }> = ({ f, lights = 0, smoke = 0 }) => {
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
      <Box p={[7.4, D + 0.17, 0]} s={[2.2, 0.32, 1.4]} c="#ece8de" />
      <Box p={[1.0, D + 0.15, 0]} s={[6.4, 0.28, 1.1]} c="#e6e1d4" />
      <Box p={[-4.6, D + 0.15, 0]} s={[3.6, 0.28, 1.1]} c="#e6e1d4" />
      {/* ponte de comando com asas */}
      <Box p={[8.55, D + 0.2, 0]} s={[0.45, 0.4, 1.3]} c="#ece8de" />
      <Box p={[8.55, D + 0.4, 0]} s={[0.5, 0.04, SHIP.B * 0.96]} c="#ece8de" />
      {[-0.4, -0.2, 0, 0.2, 0.4].map((z, i) => (
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

/* ================================================================== ICEBERG */

/** Iceberg facetado: parte de cima ~2,2 u, massa submersa maior e azulada. */
export const Iceberg: React.FC<{ s?: number; seed?: number; under?: boolean }> = ({ s = 1, seed = 3, under = true }) => {
  const geos = useMemo(() => {
    const mk = (r: number, det: number, yScale: number, k: number) => {
      const g = new IcosahedronGeometry(r, det);
      const p = g.attributes.position;
      const v = new Vector3();
      const col = new Float32Array(p.count * 3);
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i);
        const n = Math.sin(v.x * 1.7 + seed) * Math.cos(v.z * 1.3 - seed) * 0.28 + Math.sin(v.y * 2.4 + v.x) * 0.16 + (rand(`ib${seed}-${i}`) - 0.5) * 0.14;
        v.multiplyScalar(1 + n * k);
        v.y *= yScale;
        p.setXYZ(i, v.x, v.y, v.z);
        const t = clamp((v.y + 1) / 3, 0, 1);
        const c = C("#9fd2ea").lerp(C("#f4fbff"), t);
        col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
      }
      g.setAttribute("color", new BufferAttribute(col, 3));
      g.computeVertexNormals();
      return g;
    };
    return { top: mk(1.6, 1, 1.1, 0.8), peak: mk(0.9, 1, 1.7, 0.9), base: mk(2.6, 1, 0.85, 0.6) };
  }, [seed]);
  return (
    <group scale={s}>
      <mesh geometry={geos.top} position={[0, 0.6, 0]} castShadow>
        <meshStandardMaterial vertexColors roughness={0.35} metalness={0.05} flatShading />
      </mesh>
      <mesh geometry={geos.peak} position={[0.5, 1.7, -0.3]} castShadow>
        <meshStandardMaterial vertexColors roughness={0.35} flatShading />
      </mesh>
      {under ? (
        <mesh geometry={geos.base} position={[0, -2.0, 0]}>
          <meshStandardMaterial vertexColors roughness={0.4} flatShading transparent opacity={0.85} />
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

/** Cesto da gávea: mastro, gaiola com corrimão, sino e telefone. */
export const CrowsNest: React.FC<{ f: number; bell?: number }> = ({ f, bell = 0 }) => {
  const swing = clamp(bell, 0, 1) * 0.5 * Math.sin(f * 0.9);
  return (
    <group>
      <Rod a={[0, -6, 0]} b={[0, 4, 0]} r={0.28} c="#8a6a48" seg={12} />
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 0.08, 20]} />
        <meshStandardMaterial color="#6a5038" {...M} />
      </mesh>
      <mesh position={[0, 0.55, 0]}>
        <cylinderGeometry args={[1.0, 1.0, 1.1, 20, 1, true]} />
        <meshStandardMaterial color="#e8e0cc" {...M} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 1.12, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[1.0, 0.04, 6, 28]} />
        <meshStandardMaterial color="#8a6a48" {...M} />
      </mesh>
      {/* sino */}
      <group position={[0.75, 1.5, 0.4]}>
        <Rod a={[0, -0.4, 0]} b={[0, 0.25, 0]} r={0.025} c="#3a3028" />
        <group position={[0, 0.2, 0]} rotation={[0, 0, swing]}>
          <mesh position={[0, -0.12, 0]}>
            <cylinderGeometry args={[0.07, 0.13, 0.2, 12, 1, true]} />
            <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} side={DoubleSide} />
          </mesh>
        </group>
      </group>
      {/* telefone */}
      <Box p={[-0.8, 0.85, 0.35]} s={[0.16, 0.24, 0.1]} c="#2a2a30" />
    </group>
  );
};

/** Ponte de comando (casa do leme): roda do leme, telégrafo das máquinas, bitácula, janelas para a proa (+x). */
export const Bridge: React.FC<{ f: number; wheel?: number; tele?: number; night?: number }> = ({ f, wheel = 0, tele = 0, night = 1 }) => (
  <group>
    <Box p={[0, -0.05, 0]} s={[6, 0.1, 5]} c="#8f6a44" />
    {/* parede da frente com janelas */}
    <Box p={[2.5, 0.5, 0]} s={[0.12, 1.0, 5]} c="#ece8de" />
    <Box p={[2.5, 2.3, 0]} s={[0.12, 0.6, 5]} c="#ece8de" />
    {[-1.8, -0.6, 0.6, 1.8].map((z, i) => (
      <group key={i}>
        <Box p={[2.5, 1.5, z - 0.6]} s={[0.12, 1.0, 0.12]} c="#ece8de" />
        <mesh position={[2.49, 1.5, z]} rotation={[0, -Math.PI / 2, 0]}>
          <planeGeometry args={[1.08, 0.98]} />
          <meshStandardMaterial color={night > 0.5 ? "#0a1426" : "#a8c8e0"} transparent opacity={0.85} roughness={0.05} metalness={0.3} />
        </mesh>
      </group>
    ))}
    <Box p={[2.5, 1.5, 2.45]} s={[0.12, 1.0, 0.12]} c="#ece8de" />
    {/* teto */}
    <Box p={[0, 2.65, 0]} s={[6, 0.1, 5]} c="#e2ddd0" />
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
    {/* telégrafo das máquinas */}
    <group position={[1.4, 0, 1.4]}>
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
    {/* bitácula (bússola) */}
    <group position={[0.2, 0, -1.4]}>
      <Rod a={[0, 0, 0]} b={[0, 1.0, 0]} r={0.16} c="#7a4a26" seg={10} />
      <mesh position={[0, 1.12, 0]}>
        <sphereGeometry args={[0.2, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.25} />
      </mesh>
    </group>
    {/* lampião */}
    <mesh position={[-1.5, 2.3, 0]}>
      <sphereGeometry args={[0.12, 10, 8]} />
      <meshBasicMaterial color="#ffe0a0" toneMapped={false} />
    </mesh>
    <pointLight position={[-1.5, 2.2, 0]} intensity={2.2 * night + 0.5} distance={8} color="#ffd08a" />
    {void f}
  </group>
);

/** Sala de rádio (Marconi): mesa, aparelho com mostradores, faísca azul, fones, pilhas de mensagens. */
export const RadioRoom: React.FC<{ f: number; spark?: number; papers?: number }> = ({ f, spark = 1, papers = 1 }) => {
  const sp = clamp(spark, 0, 1) * (Math.sin(f * 1.7) > 0.2 ? 1 : 0.25);
  const nP = Math.round(clamp(papers, 0, 1) * 9);
  return (
    <group>
      <Box p={[0, -0.05, 0]} s={[4, 0.1, 3.5]} c="#6a4a30" />
      <Box p={[0, 1.3, -1.75]} s={[4, 2.7, 0.1]} c="#e2d8c4" />
      <Box p={[-2, 1.3, 0]} s={[0.1, 2.7, 3.5]} c="#d8cdb6" />
      {/* mesa */}
      <Box p={[0, 0.75, -1.2]} s={[2.6, 0.06, 0.9]} c="#7a4a26" />
      {[-1.2, 1.2].map((x) => (
        <Box key={x} p={[x, 0.37, -1.2]} s={[0.08, 0.74, 0.8]} c="#5a3a1e" />
      ))}
      {/* aparelho Marconi */}
      <Box p={[-0.5, 1.2, -1.55]} s={[1.3, 0.8, 0.3]} c="#3a2e24" />
      {[-0.95, -0.6, -0.25].map((x, i) => (
        <mesh key={i} position={[x, 1.32, -1.39]}>
          <circleGeometry args={[0.1, 16]} />
          <meshStandardMaterial color="#f2ead6" emissive="#f2ead6" emissiveIntensity={0.2} />
        </mesh>
      ))}
      {/* centelhador (faísca) */}
      <Box p={[0.55, 1.05, -1.5]} s={[0.4, 0.5, 0.3]} c="#2a2a30" />
      <mesh position={[0.55, 1.12, -1.33]}>
        <sphereGeometry args={[0.06 + 0.03 * sp, 10, 8]} />
        <meshBasicMaterial color="#9fd8ff" transparent opacity={0.4 + 0.6 * sp} toneMapped={false} />
      </mesh>
      <pointLight position={[0.55, 1.15, -1.1]} intensity={1.6 * sp} distance={3} color="#9fd8ff" />
      {/* chave de telégrafo */}
      <Box p={[0.1, 0.8, -0.95]} s={[0.22, 0.04, 0.1]} c="#c9a24a" metal={0.6} />
      {/* fones */}
      <mesh position={[-0.9, 0.82, -0.95]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1, 0.02, 6, 16, Math.PI]} />
        <meshStandardMaterial color="#1a1a1e" />
      </mesh>
      {/* mensagens empilhando */}
      {Array.from({ length: nP }, (_, i) => (
        <mesh key={`p${i}`} position={[0.9 + (i % 3) * 0.04, 0.79 + i * 0.012, -1.0 + (i % 2) * 0.03]} rotation={[-Math.PI / 2, 0, rand(`pp${i}`) * 0.6]}>
          <planeGeometry args={[0.21, 0.28]} />
          <meshStandardMaterial color="#f4efe2" side={DoubleSide} />
        </mesh>
      ))}
      {/* lâmpada */}
      <mesh position={[0, 2.4, -0.6]}>
        <sphereGeometry args={[0.1, 10, 8]} />
        <meshBasicMaterial color="#ffe0a0" toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.3, -0.4]} intensity={2.2} distance={7} color="#ffd08a" />
    </group>
  );
};
