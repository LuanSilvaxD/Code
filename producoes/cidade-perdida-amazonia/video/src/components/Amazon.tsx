import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, Color, DoubleSide, PlaneGeometry } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "Cidade perdida na Amazônia" (Boato ou Verdade #4) — elementos novos (aprovar na folha). Low-poly, esquemático.
const C = (h: string) => new Color(h);
const M = { roughness: 0.85, metalness: 0, flatShading: true } as const;
export const DIO_W = 9, DIO_D = 6; // tamanho do diorama da floresta

/* ------------------------------------------------------------------ TERRENO + RIO */

const riverZ = (x: number) => Math.sin(x * 0.55 + 0.6) * 1.1 + 0.6;

const Terrain: React.FC = () => {
  const geo = useMemo(() => {
    const g = new PlaneGeometry(DIO_W, DIO_D, 72, 48).rotateX(-Math.PI / 2);
    const pos = g.attributes.position;
    const cs = new Float32Array(pos.count * 3);
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const dr = Math.abs(z - riverZ(x));
      const y = dr < 0.35 ? -0.06 : 0.04 * Math.sin(x * 1.3) * Math.cos(z * 1.1) + 0.02;
      pos.setY(i, y);
      const c = dr < 0.35 ? C("#3a7ab8") : dr < 0.5 ? C("#c8a86a") : C("#5a4a32").lerp(C("#7a6a42"), 0.5 + 0.5 * Math.sin(x * 2 + z));
      cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new BufferAttribute(cs, 3));
    g.computeVertexNormals();
    return g;
  }, []);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.9} />
      </mesh>
      {/* corte do diorama (terra em camadas) */}
      <mesh position={[0, -0.4, DIO_D / 2]}>
        <planeGeometry args={[DIO_W, 0.8]} />
        <meshStandardMaterial color="#4a3826" {...M} />
      </mesh>
      <mesh position={[0, -0.12, DIO_D / 2 + 0.002]}>
        <planeGeometry args={[DIO_W, 0.14]} />
        <meshStandardMaterial color="#6a5236" {...M} />
      </mesh>
      <mesh position={[DIO_W / 2, -0.4, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[DIO_D, 0.8]} />
        <meshStandardMaterial color="#3f3020" {...M} />
      </mesh>
      <mesh position={[0, -0.82, 0]}>
        <boxGeometry args={[DIO_W + 0.1, 0.06, DIO_D + 0.1]} />
        <meshStandardMaterial color="#1a1428" {...M} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ FLORESTA (com revelação LiDAR) */

type TreeT = { p: Vec3; s: number; c: string; kind: number };
export const useTrees = (n = 260) =>
  useMemo(() => {
    const out: TreeT[] = [];
    let i = 0;
    while (out.length < n && i < n * 4) {
      const x = (rand(`tx${i}`) - 0.5) * (DIO_W - 0.3);
      const z = (rand(`tz${i}`) - 0.5) * (DIO_D - 0.3);
      i++;
      if (Math.abs(z - riverZ(x)) < 0.5) continue;
      const greens = ["#2f7a38", "#3a8a3e", "#256a32", "#4a9a48", "#2a6e3a"];
      out.push({ p: [x, 0, z], s: 0.7 + rand(`ts${i}`) * 0.6, c: greens[Math.floor(rand(`tc${i}`) * greens.length)], kind: rand(`tk${i}`) > 0.7 ? 1 : 0 });
    }
    return out;
  }, [n]);

/** Árvore de copa larga (amazônica): tronco + 2–3 bolas de copa. op = opacidade (LiDAR "atravessa"). */
const Tree: React.FC<{ t: TreeT; op: number; scanGlow: number }> = ({ t, op, scanGlow }) => {
  if (op < 0.02 && scanGlow < 0.02) return null;
  const s = t.s;
  const col = C(t.c).lerp(C("#7aff9a"), scanGlow * 0.6);
  const tr = op < 0.98;
  return (
    <group position={t.p} scale={s}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.44, 5]} />
        <meshStandardMaterial color="#5a3e26" {...M} transparent={tr} opacity={op} depthWrite={!tr} />
      </mesh>
      {(t.kind ? [[0, 0.5, 0, 0.2], [0.1, 0.44, 0.06, 0.13]] : [[0, 0.48, 0, 0.17], [-0.1, 0.42, 0.05, 0.13], [0.09, 0.43, -0.05, 0.12]]).map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <meshStandardMaterial color={col} emissive={scanGlow > 0.02 ? "#3aff7a" : "#000000"} emissiveIntensity={scanGlow * 0.5} {...M} transparent={tr} opacity={op} depthWrite={!tr} />
        </mesh>
      ))}
    </group>
  );
};

/**
 * Diorama da floresta. scanX = posição x da faixa do laser; scanW = meia-largura; revealed = 0..1 floresta toda transparente
 * (depois da varredura). trail: tudo a oeste de scanX também fica transparente (o avião "já passou").
 */
export const Rainforest: React.FC<{ f: number; scanX?: number; scanW?: number; revealed?: number; trail?: boolean; children?: React.ReactNode }> = ({ f, scanX = -99, scanW = 0.6, revealed = 0, trail = true, children }) => {
  const trees = useTrees();
  return (
    <group>
      <Terrain />
      {children}
      {trees.map((t, i) => {
        const dx = t.p[0] - scanX;
        const inBand = Math.abs(dx) < scanW ? 1 - Math.abs(dx) / scanW : 0;
        const passed = trail && dx < 0 ? 1 : 0;
        const op = Math.min(1 - 0.88 * clamp(revealed, 0, 1), passed ? 0.12 : 1, 1 - 0.88 * inBand);
        return <Tree key={i} t={t} op={op} scanGlow={inBand} />;
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ AVIÃO LIDAR */

const fanCache = new Map<number, import("three").BufferGeometry>();
const fanGeo = (h: number) => {
  const key = Math.round(h * 100);
  if (!fanCache.has(key)) {
    const hh = h - 0.1, wz = (DIO_D * 0.55) / 1.6;
    const g = new PlaneGeometry(1, 1);
    g.setIndex([0, 1, 2]);
    g.setAttribute("position", new BufferAttribute(new Float32Array([0, 0, 0, -wz, -hh, 0, wz, -hh, 0]), 3));
    fanCache.set(key, g);
  }
  return fanCache.get(key)!;
};

/** Aviãozinho bimotor com o leque verde do laser apontado para baixo (fan 0..1). Voa para +x. */
export const LidarPlane: React.FC<{ f: number; fan?: number; h?: number }> = ({ f, fan = 1, h = 2.2 }) => (
  <group>
    <group position={[0, h, 0]} rotation={[0, 0, Math.sin(f / 30) * 0.03]} scale={1.6}>
      {/* fuselagem */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.09, 0.07, 0.9, 10]} />
        <meshStandardMaterial color="#f2f0ea" roughness={0.4} />
      </mesh>
      <mesh position={[0.48, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.09, 0.16, 10]} />
        <meshStandardMaterial color="#f2f0ea" roughness={0.4} />
      </mesh>
      <mesh position={[0.3, 0.05, 0]}>
        <boxGeometry args={[0.16, 0.05, 0.14]} />
        <meshStandardMaterial color="#2a3a5a" roughness={0.2} />
      </mesh>
      {/* faixa roxa (marca) */}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.092, 0.092, 0.12, 10]} />
        <meshStandardMaterial color="#8b5cf6" emissive="#5b33d6" emissiveIntensity={0.3} />
      </mesh>
      {/* asas + motores */}
      <mesh position={[0.06, 0.02, 0]}>
        <boxGeometry args={[0.22, 0.025, 1.3]} />
        <meshStandardMaterial color="#e8e6e0" roughness={0.4} flatShading />
      </mesh>
      {[-0.32, 0.32].map((z) => (
        <group key={z} position={[0.12, 0, z]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.04, 0.045, 0.2, 8]} />
            <meshStandardMaterial color="#9aa0aa" metalness={0.4} roughness={0.4} />
          </mesh>
          <mesh position={[0.11, 0, 0]} rotation={[f * 0.9, 0, 0]}>
            <boxGeometry args={[0.01, 0.2, 0.02]} />
            <meshStandardMaterial color="#2a2a30" />
          </mesh>
        </group>
      ))}
      {/* cauda */}
      <mesh position={[-0.42, 0.1, 0]}>
        <boxGeometry args={[0.14, 0.18, 0.02]} />
        <meshStandardMaterial color="#e8e6e0" flatShading />
      </mesh>
      <mesh position={[-0.42, 0.03, 0]}>
        <boxGeometry args={[0.12, 0.02, 0.4]} />
        <meshStandardMaterial color="#e8e6e0" flatShading />
      </mesh>
      {/* sensor + leque do laser (plano vertical ao longo de z) */}
      <mesh position={[0, -0.1, 0]}>
        <sphereGeometry args={[0.04, 10, 8]} />
        <meshStandardMaterial color="#3aff7a" emissive="#3aff7a" emissiveIntensity={1} />
      </mesh>
      {fan > 0.01 ? (
        <group position={[0, -0.1, 0]}>
          <mesh geometry={fanGeo(h / 1.6)} rotation={[0, Math.PI / 2, 0]}>
            <meshBasicMaterial color="#3aff7a" transparent opacity={0.32 * fan} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </mesh>
          {/* linha do laser no chão */}
          <mesh position={[0, -(h / 1.6 - 0.1) + 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.05, DIO_D * 1.1 / 1.6]} />
            <meshBasicMaterial color="#7aff9a" transparent opacity={0.9 * fan} toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  </group>
);

/* ------------------------------------------------------------------ PLATAFORMAS DO UPANO (Equador) */

/** Grupos de plataformas retangulares de terra em volta de praças, ligados por estradas retas. k 0..1 brota. */
export const UpanoGrid: React.FC<{ k?: number; roads?: number }> = ({ k = 1, roads = 1 }) => {
  const clusters: [number, number][] = [[-3, -1.6], [-0.6, -1.9], [1.9, -1.4], [-2.3, 1.7], [0.6, 2.0], [3.0, 1.2]];
  const plats = useMemo(() => {
    const out: { p: Vec3; s: Vec3; i: number }[] = [];
    let n = 0;
    clusters.forEach(([cx, cz], ci) => {
      [[-0.42, 0, 0.2, 0.66], [0.42, 0, 0.2, 0.66], [0, -0.42, 0.66, 0.2], [0, 0.42, 0.66, 0.2]].forEach(([dx, dz, w, d], j) => {
        out.push({ p: [cx + dx, 0.07, cz + dz], s: [w, 0.14 + 0.05 * rand(`ph${ci}${j}`), d], i: n++ });
      });
      // plataformas extras soltas
      for (let j = 0; j < 4; j++) {
        const a = rand(`pa${ci}${j}`) * Math.PI * 2;
        out.push({ p: [cx + Math.cos(a) * 0.95, 0.05, cz + Math.sin(a) * 0.85], s: [0.26, 0.1, 0.16], i: n++ });
      }
    });
    return out;
  }, []);
  const kk = clamp(k, 0, 1);
  const road = (a: [number, number], b: [number, number], i: number) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const len = Math.hypot(dx, dz) * clamp(roads * 1.4 - i * 0.08, 0, 1);
    const ang = Math.atan2(dz, dx);
    return (
      <mesh key={`r${i}`} position={[a[0] + Math.cos(ang) * len / 2, 0.035, a[1] + Math.sin(ang) * len / 2]} rotation={[0, -ang, 0]}>
        <boxGeometry args={[len, 0.03, 0.09]} />
        <meshStandardMaterial color="#b08a5a" {...M} />
      </mesh>
    );
  };
  return (
    <group>
      {plats.map((p) => {
        const sc = clamp(kk * plats.length / 6 - p.i / 6, 0, 1);
        if (sc < 0.01) return null;
        return (
          <mesh key={p.i} position={[p.p[0], p.p[1] * sc, p.p[2]]} scale={[1, sc, 1]} castShadow>
            <boxGeometry args={p.s} />
            <meshStandardMaterial color="#a8784a" {...M} />
          </mesh>
        );
      })}
      {clusters.map(([cx, cz], i) => (
        <mesh key={`pl${i}`} position={[cx, 0.034, cz]} rotation={[-Math.PI / 2, 0, 0]} scale={kk}>
          <planeGeometry args={[0.62, 0.62]} />
          <meshStandardMaterial color="#c8a070" {...M} />
        </mesh>
      ))}
      {roads > 0.01 ? [road(clusters[0], clusters[1], 0), road(clusters[1], clusters[2], 1), road(clusters[3], clusters[4], 2), road(clusters[4], clusters[5], 3), road(clusters[1], clusters[4], 4), road(clusters[0], clusters[3], 5), road(clusters[2], clusters[5], 6)] : null}
    </group>
  );
};

/* ------------------------------------------------------------------ PIRÂMIDE DE TERRA DE CASARABE (Bolívia) */

/** Plataforma em degraus + pirâmide cônica de terra, calçada elevada, canal e represa. k 0..1 sobe; water 0..1 enche. */
export const CasarabeMound: React.FC<{ k?: number; water?: number }> = ({ k = 1, water = 1 }) => {
  const kk = clamp(k, 0, 1.1);
  return (
    <group>
      {/* gramado/várzea */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <cylinderGeometry args={[3.6, 3.7, 0.06, 40]} />
        <meshStandardMaterial color="#6f9a4a" {...M} />
      </mesh>
      {/* plataforma em degraus */}
      {[[2.4, 0.18], [1.9, 0.18], [1.5, 0.16]].map(([w, h], i) => (
        <mesh key={i} position={[0, (0.09 + i * 0.18) * kk, 0]} scale={[1, kk, 1]} castShadow receiveShadow>
          <boxGeometry args={[w, h, w * 0.8]} />
          <meshStandardMaterial color={i % 2 ? "#9a7046" : "#a87a4c"} {...M} />
        </mesh>
      ))}
      {/* pirâmide cônica (até 22 m) */}
      <mesh position={[0.1, 0.54 + 0.6 * kk, 0]} scale={[1, kk, 1]} castShadow>
        <coneGeometry args={[0.65, 1.2, 9]} />
        <meshStandardMaterial color="#b4844e" {...M} />
      </mesh>
      {/* calçada elevada saindo da plataforma */}
      <mesh position={[2.3, 0.06 * kk, 0.2]} castShadow>
        <boxGeometry args={[2.4, 0.12, 0.24]} />
        <meshStandardMaterial color="#9a7046" {...M} />
      </mesh>
      {/* canal ao lado da calçada + represa */}
      <mesh position={[2.3, 0.005, 0.55]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.4 * clamp(water * 1.3, 0, 1), 0.22]} />
        <meshStandardMaterial color="#3a8ad8" roughness={0.25} />
      </mesh>
      <mesh position={[-1.9, 0.005, 1.6]} rotation={[-Math.PI / 2, 0, 0]} scale={clamp(water, 0, 1)}>
        <planeGeometry args={[1.2, 0.8]} />
        <meshStandardMaterial color="#3a7ac8" roughness={0.25} />
      </mesh>
      <mesh position={[-1.9, 0.04, 1.6]}>
        <boxGeometry args={[1.3, 0.08, 0.9]} />
        <meshStandardMaterial color="#8a6a42" transparent opacity={0.0} />
      </mesh>
      {/* árvores esparsas da savana amazônica */}
      {Array.from({ length: 14 }, (_, i) => {
        const a = rand(`ca${i}`) * Math.PI * 2, r = 2.6 + rand(`cr${i}`) * 0.9;
        return (
          <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 0.3, 5]} />
              <meshStandardMaterial color="#5a3e26" {...M} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
              <icosahedronGeometry args={[0.15, 0]} />
              <meshStandardMaterial color="#3a8a3e" {...M} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ "RATANABÁ" (lenda de internet, de propósito fantasioso) */

/** Pirâmides douradas exageradas com raios de luz — estilo "lenda", claramente falso. k 0..1 surge; crack 0..1 desfaz em pó. */
export const RatanabaFake: React.FC<{ f: number; k?: number; crack?: number }> = ({ f, k = 1, crack = 0 }) => {
  const kk = clamp(k, 0, 1.1);
  const cr = clamp(crack, 0, 1);
  const pyr: [number, number, number][] = [[0, 0, 1.6], [-1.5, 0.6, 1.0], [1.4, 0.4, 1.1]];
  return (
    <group>
      {pyr.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh position={[0, (s * 0.75) * kk * (1 - cr * 0.9), 0]} scale={[s, s * 1.5 * kk * (1 - cr * 0.85), s]} rotation={[0, Math.PI / 4, cr * (i - 1) * 0.3]}>
            <coneGeometry args={[0.7, 1, 4]} />
            <meshStandardMaterial color="#ffcf3a" emissive="#ff9a1a" emissiveIntensity={0.35 + 0.15 * Math.sin(f / 6 + i)} metalness={0.7} roughness={0.25} flatShading transparent={cr > 0.01} opacity={1 - cr * 0.8} />
          </mesh>
          {/* raio de luz de "lenda" */}
          <mesh position={[0, s * 1.6 * kk + 1.2, 0]}>
            <cylinderGeometry args={[0.03, 0.25 * s, 2.4, 10, 1, true]} />
            <meshBasicMaterial color="#fff2a0" transparent opacity={0.35 * kk * (1 - cr)} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* brilhinhos */}
      {Array.from({ length: 30 }, (_, i) => {
        const ph = (f * 0.01 + rand(`rs${i}`)) % 1;
        return (
          <mesh key={i} position={[(rand(`rx${i}`) - 0.5) * 4, ph * 3, (rand(`rz${i}`) - 0.5) * 2.4]} scale={0.03 * (1 - ph)}>
            <octahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color="#fff2a0" transparent opacity={kk * (1 - cr)} toneMapped={false} />
          </mesh>
        );
      })}
      {/* pó dourado caindo ao desfazer */}
      {cr > 0.01
        ? Array.from({ length: 40 }, (_, i) => (
            <mesh key={`d${i}`} position={[(rand(`dx${i}`) - 0.5) * 3.6, 1.6 * (1 - cr) * rand(`dy${i}`) + 0.05, (rand(`dz${i}`) - 0.5) * 2]} scale={0.04}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#d8a83a" transparent opacity={1 - cr * 0.6} flatShading />
            </mesh>
          ))
        : null}
    </group>
  );
};
