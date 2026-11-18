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
      {/* bancos de areia no rio */}
      {[-3.2, -0.9, 1.6, 3.6].map((x, i) => (
        <mesh key={i} position={[x, -0.035, riverZ(x) + (i % 2 ? 0.12 : -0.12)]} rotation={[-Math.PI / 2, 0, 0.4]} scale={[1, 0.45, 1]}>
          <circleGeometry args={[0.28, 8]} />
          <meshStandardMaterial color="#d8c08a" {...M} />
        </mesh>
      ))}
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

type TreeT = { p: Vec3; s: number; c: string; kind: number; rot: number };
export const useTrees = (n = 270) =>
  useMemo(() => {
    const out: TreeT[] = [];
    let i = 0;
    while (out.length < n && i < n * 4) {
      const x = (rand(`tx${i}`) - 0.5) * (DIO_W - 0.3);
      const z = (rand(`tz${i}`) - 0.5) * (DIO_D - 0.3);
      i++;
      if (Math.abs(z - riverZ(x)) < 0.52) continue;
      const greens = ["#2f7a38", "#3a8a3e", "#256a32", "#4a9a48", "#2a6e3a", "#3f8f2e", "#1f5f30"];
      const r = rand(`tk${i}`);
      out.push({ p: [x, 0, z], s: 0.7 + rand(`ts${i}`) * 0.6, c: greens[Math.floor(rand(`tc${i}`) * greens.length)], kind: r > 0.88 ? 1 : r > 0.7 ? 2 : 0, rot: rand(`tr${i}`) * Math.PI * 2 });
    }
    return out;
  }, [n]);

type MatP = { op: number; glow: number };
// transparent SEMPRE true: trocar transparent no meio da animação não recompila o shader no render contínuo
// (nos stills funciona, no vídeo não). Opacidade 1 + depthWrite garante o visual opaco normal.
const Leaf: React.FC<{ color: Color } & MatP> = ({ color, op, glow }) => (
  <meshStandardMaterial color={color} emissive={glow > 0.02 ? "#3aff7a" : "#000000"} emissiveIntensity={glow * 0.5} {...M} transparent opacity={op} depthWrite={op >= 0.98} />
);
const Bark: React.FC<MatP & { color?: string }> = ({ op, color = "#5a3e26" }) => (
  <meshStandardMaterial color={color} {...M} transparent opacity={op} depthWrite={op >= 0.98} />
);

/** Árvore: 0 = copa larga (3 bolas), 1 = emergente gigante (copa em guarda-chuva), 2 = palmeira (açaí). op = opacidade (LiDAR). */
const Tree: React.FC<{ t: TreeT; op: number; scanGlow: number }> = ({ t, op, scanGlow }) => {
  if (op < 0.02 && scanGlow < 0.02) return null;
  const col = C(t.c).lerp(C("#7aff9a"), scanGlow * 0.6);
  const mp = { op, glow: scanGlow };
  if (t.kind === 1)
    return (
      <group position={t.p} scale={t.s} rotation={[0, t.rot, 0]}>
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.03, 0.06, 0.84, 6]} />
          <Bark {...mp} color="#6a4a30" />
        </mesh>
        {[[0, 0.9, 0, 0.32], [0.18, 0.86, 0.08, 0.2], [-0.16, 0.87, -0.06, 0.2]].map(([x, y, z, r], i) => (
          <mesh key={i} position={[x, y, z]} scale={[1, 0.45, 1]}>
            <icosahedronGeometry args={[r, 1]} />
            <Leaf color={col.clone().multiplyScalar(1.08)} {...mp} />
          </mesh>
        ))}
      </group>
    );
  if (t.kind === 2)
    return (
      <group position={t.p} scale={t.s * 0.9} rotation={[0, t.rot, 0]}>
        <mesh position={[0.02, 0.32, 0]} rotation={[0, 0, -0.08]}>
          <cylinderGeometry args={[0.012, 0.018, 0.64, 5]} />
          <Bark {...mp} color="#8a7a5a" />
        </mesh>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} position={[0.05, 0.64, 0]} rotation={[0, (i / 7) * Math.PI * 2, 1.05]}>
            <coneGeometry args={[0.035, 0.32, 3]} />
            <Leaf color={C("#4f9a3a").lerp(C("#7aff9a"), scanGlow * 0.6)} {...mp} />
          </mesh>
        ))}
      </group>
    );
  return (
    <group position={t.p} scale={t.s} rotation={[0, t.rot, 0]}>
      <mesh position={[0, 0.22, 0]}>
        <cylinderGeometry args={[0.025, 0.04, 0.44, 5]} />
        <Bark {...mp} />
      </mesh>
      {[[0, 0.48, 0, 0.17], [-0.1, 0.42, 0.05, 0.13], [0.09, 0.43, -0.05, 0.12], [0.02, 0.38, 0.11, 0.1]].map(([x, y, z, r], i) => (
        <mesh key={i} position={[x, y, z]}>
          <icosahedronGeometry args={[r, 0]} />
          <Leaf color={i % 2 ? col.clone().multiplyScalar(0.88) : col} {...mp} />
        </mesh>
      ))}
    </group>
  );
};

/** Nuvem de pontos do LiDAR: pontos no chão dentro da faixa (cor por altura), com rastro que some. */
const PointCloud: React.FC<{ scanX: number; scanW: number }> = ({ scanX, scanW }) => {
  const pts = useMemo(() => {
    const out: { x: number; z: number; y: number }[] = [];
    for (let i = 0; i < 900; i++) {
      const x = (rand(`px${i}`) - 0.5) * DIO_W, z = (rand(`pz${i}`) - 0.5) * DIO_D;
      out.push({ x, z, y: 0.045 + 0.04 * Math.sin(x * 1.3) * Math.cos(z * 1.1) });
    }
    return out;
  }, []);
  return (
    <>
      {pts.map((p, i) => {
        const dx = p.x - scanX;
        if (dx > scanW * 0.4 || dx < -scanW * 2.2) return null;
        const a = dx > 0 ? 1 - dx / (scanW * 0.4) : 1 + dx / (scanW * 2.2);
        return (
          <mesh key={i} position={[p.x, p.y + 0.02, p.z]}>
            <boxGeometry args={[0.035, 0.035, 0.035]} />
            <meshBasicMaterial color={new Color("#3aff7a").lerp(new Color("#ffe14a"), clamp((p.z + 3) / 6, 0, 1) * 0.5)} transparent opacity={clamp(a, 0, 1) * 0.9} toneMapped={false} />
          </mesh>
        );
      })}
    </>
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
      {scanX > -50 ? <PointCloud scanX={scanX} scanW={scanW} /> : null}
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

/** Plataforma de terra (topo plano, laterais inclinadas) com rampa de acesso. */
const Platform: React.FC<{ h: number; ramp?: number; color?: string }> = ({ h, ramp = 1, color = "#a8784a" }) => (
  <group>
    <mesh position={[0, h / 2, 0]} rotation={[0, Math.PI / 4, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[Math.SQRT1_2 * 0.82, Math.SQRT1_2, h, 4, 1]} />
      <meshStandardMaterial color={color} {...M} />
    </mesh>
    {ramp > 0 ? (
      <mesh position={[0, h * 0.35, Math.SQRT1_2 * 0.78]} rotation={[0.9, 0, 0]}>
        <boxGeometry args={[0.28, h * 1.1, 0.06]} />
        <meshStandardMaterial color="#b88a5a" {...M} />
      </mesh>
    ) : null}
  </group>
);

/** Assentamentos do vale do Upano (ESQUEMA): grupos irregulares de plataformas em volta de praças com montículo central,
 *  ligados por estradas retas sobre aterro, com valas dos lados. k 0..1 brota; roads 0..1 desenha as estradas. */
export const UpanoGrid: React.FC<{ k?: number; roads?: number }> = ({ k = 1, roads = 1 }) => {
  const clusters: [number, number, number][] = [[-3.1, -1.7, 0.15], [-0.7, -1.95, -0.1], [1.9, -1.45, 0.25], [-2.4, 1.75, -0.2], [0.5, 2.05, 0.1], [3.05, 1.25, -0.15]];
  const plats = useMemo(() => {
    const out: { p: Vec3; w: number; d: number; h: number; rot: number; ci: number; i: number; ramp: number }[] = [];
    let n = 0;
    clusters.forEach(([cx, cz, rot], ci) => {
      const ring = 6 + Math.floor(rand(`nr${ci}`) * 3);
      for (let j = 0; j < ring; j++) {
        const a = rot + (j / ring) * Math.PI * 2 + (rand(`ja${ci}${j}`) - 0.5) * 0.25;
        const r = 0.5 + rand(`jr${ci}${j}`) * 0.12;
        out.push({ p: [cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r * 0.85], w: 0.32 + rand(`jw${ci}${j}`) * 0.16, d: 0.18 + rand(`jd${ci}${j}`) * 0.08, h: 0.09 + rand(`jh${ci}${j}`) * 0.07, rot: -a + Math.PI / 2, ci, i: n++, ramp: j % 2 });
      }
      for (let j = 0; j < 3; j++) {
        const a = rand(`ea${ci}${j}`) * Math.PI * 2;
        out.push({ p: [cx + Math.cos(a) * 1.0, 0, cz + Math.sin(a) * 0.85], w: 0.22, d: 0.14, h: 0.06, rot: a, ci, i: n++, ramp: 0 });
      }
    });
    return out;
  }, []);
  const kk = clamp(k, 0, 1);
  const road = (a: [number, number, number], b: [number, number, number], i: number) => {
    const dx = b[0] - a[0], dz = b[1] - a[1];
    const full = Math.hypot(dx, dz) - 1.0;
    const len = full * clamp(roads * 1.4 - i * 0.08, 0, 1);
    const ang = Math.atan2(dz, dx);
    const sx = a[0] + Math.cos(ang) * 0.5, sz = a[1] + Math.sin(ang) * 0.5;
    if (len < 0.02) return null;
    return (
      <group key={`r${i}`} position={[sx + Math.cos(ang) * len / 2, 0, sz + Math.sin(ang) * len / 2]} rotation={[0, -ang, 0]}>
        <mesh position={[0, 0.04, 0]} castShadow receiveShadow>
          <boxGeometry args={[len, 0.05, 0.11]} />
          <meshStandardMaterial color="#b8925e" {...M} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[0, 0.026, sd * 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[len, 0.05]} />
            <meshStandardMaterial color="#4a3a26" {...M} />
          </mesh>
        ))}
      </group>
    );
  };
  return (
    <group>
      {plats.map((p) => {
        const sc = clamp(kk * 6 - p.ci * 0.8 - (p.i % 9) * 0.06, 0, 1);
        if (sc < 0.01) return null;
        return (
          <group key={p.i} position={p.p} rotation={[0, p.rot, 0]} scale={[p.w * 1.6, sc, p.d * 1.6]}>
            <Platform h={p.h} ramp={p.ramp} />
          </group>
        );
      })}
      {clusters.map(([cx, cz], i) => {
        const sc = clamp(kk * 6 - i * 0.8, 0, 1);
        return (
          <group key={`pl${i}`} position={[cx, 0, cz]} scale={sc}>
            <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.36, 16]} />
              <meshStandardMaterial color="#c8a070" {...M} />
            </mesh>
            <mesh position={[0, 0.07, 0]}>
              <cylinderGeometry args={[0.07, 0.12, 0.08, 8]} />
              <meshStandardMaterial color="#9a6e42" {...M} />
            </mesh>
          </group>
        );
      })}
      {roads > 0.01 ? [road(clusters[0], clusters[1], 0), road(clusters[1], clusters[2], 1), road(clusters[3], clusters[4], 2), road(clusters[4], clusters[5], 3), road(clusters[1], clusters[4], 4), road(clusters[0], clusters[3], 5), road(clusters[2], clusters[5], 6)] : null}
    </group>
  );
};

/* ------------------------------------------------------------------ PIRÂMIDE DE TERRA DE CASARABE (Bolívia) */

/** Assentamento de Casarabe (ESQUEMA): plataforma em degraus com rampas, plataformas em U, pirâmide cônica em terraços (até 22 m),
 *  fosso circular, calçadas elevadas com canais dos dois lados e represa com diques. k 0..1 sobe; water 0..1 enche. */
export const CasarabeMound: React.FC<{ k?: number; water?: number }> = ({ k = 1, water = 1 }) => {
  const kk = clamp(k, 0, 1.1);
  const ww = clamp(water, 0, 1);
  const grass = (i: number) => (i % 3 === 0 ? "#7aa24e" : i % 3 === 1 ? "#6f9a4a" : "#86aa56");
  return (
    <group>
      {/* várzea com manchas */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <cylinderGeometry args={[3.9, 4.0, 0.08, 48]} />
        <meshStandardMaterial color="#6f9a4a" {...M} />
      </mesh>
      {Array.from({ length: 18 }, (_, i) => {
        const a = rand(`gp${i}`) * Math.PI * 2, r = 1.6 + rand(`gr${i}`) * 2.0;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 0.002, Math.sin(a) * r]} rotation={[-Math.PI / 2, 0, a]}>
            <circleGeometry args={[0.25 + rand(`gs${i}`) * 0.3, 7]} />
            <meshStandardMaterial color={grass(i)} {...M} />
          </mesh>
        );
      })}
      {/* fosso circular + dique */}
      <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.7, 1.9, 48]} />
        <meshStandardMaterial color={new Color("#4a3a26").lerp(new Color("#3a8ad8"), ww)} roughness={0.3} />
      </mesh>
      <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.0, 0.07, 4, 48]} />
        <meshStandardMaterial color="#8a6a42" {...M} />
      </mesh>
      {/* plataforma em degraus */}
      {[[2.2, 0.16], [1.8, 0.16], [1.45, 0.14]].map(([w, h], i) => (
        <mesh key={i} position={[0, (0.08 + i * 0.16) * kk, 0]} scale={[1, kk, 1]} castShadow receiveShadow>
          <boxGeometry args={[w, h, w * 0.78]} />
          <meshStandardMaterial color={i % 2 ? "#9a7046" : "#a87a4c"} {...M} />
        </mesh>
      ))}
      {/* rampas */}
      {[1, -1].map((sd) => (
        <mesh key={sd} position={[0, 0.2 * kk, sd * 0.98]} rotation={[sd * 0.55, 0, 0]} scale={[1, kk, 1]}>
          <boxGeometry args={[0.36, 0.06, 0.62]} />
          <meshStandardMaterial color="#b88a5a" {...M} />
        </mesh>
      ))}
      {/* plataformas em U no topo */}
      {[[-0.5, 0, 0.18, 0.9], [0.5, 0, 0.18, 0.9], [0, -0.38, 0.82, 0.16]].map(([x, z, w, d], i) => (
        <mesh key={`u${i}`} position={[x - 0.15, 0.52 * kk, z]} scale={[1, kk, 1]} castShadow>
          <boxGeometry args={[w, 0.1, d]} />
          <meshStandardMaterial color="#b4844e" {...M} />
        </mesh>
      ))}
      {/* pirâmide cônica em terraços */}
      {[[0.62, 0.42], [0.46, 0.4], [0.3, 0.38], [0.15, 0.3]].map(([r, h], i, arr) => {
        const y0 = 0.48 + arr.slice(0, i).reduce((acc, x) => acc + x[1], 0);
        return (
          <mesh key={`c${i}`} position={[0.62, (y0 + h / 2) * kk, 0.15]} scale={[1, kk, 1]} castShadow>
            <cylinderGeometry args={[r * 0.82, r, h, 10]} />
            <meshStandardMaterial color={i % 2 ? "#a87a4c" : "#b88a54"} {...M} />
          </mesh>
        );
      })}
      {/* tufos de mato na pirâmide */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2, r = 0.5 - (i % 3) * 0.12, y = 0.6 + (i % 3) * 0.4;
        return (
          <mesh key={`t${i}`} position={[0.62 + Math.cos(a) * r, y * kk, 0.15 + Math.sin(a) * r]} scale={kk}>
            <icosahedronGeometry args={[0.05, 0]} />
            <meshStandardMaterial color="#5f8a3a" {...M} />
          </mesh>
        );
      })}
      {/* calçadas elevadas com canais dos dois lados (saem do fosso) */}
      {[0.35, -2.3].map((ang, i) => (
        <group key={`cw${i}`} rotation={[0, ang, 0]}>
          <mesh position={[2.9, 0.05, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.0, 0.1, 0.2]} />
            <meshStandardMaterial color="#9a7046" {...M} />
          </mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[2.9, 0.004, sd * 0.2]} rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[2.0 * clamp(ww * 1.3, 0, 1), 0.12]} />
              <meshStandardMaterial color="#3a8ad8" roughness={0.25} />
            </mesh>
          ))}
        </group>
      ))}
      {/* represa com diques */}
      <group position={[-2.6, 0, 1.5]} rotation={[0, 0.4, 0]}>
        <mesh position={[0, 0.006, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[1.1 * (0.3 + 0.7 * ww), 0.75 * (0.3 + 0.7 * ww)]} />
          <meshStandardMaterial color="#3a7ac8" roughness={0.25} />
        </mesh>
        {[[0, 0.42, 1.2, 0.08], [0, -0.42, 1.2, 0.08], [0.6, 0, 0.08, 0.92], [-0.6, 0, 0.08, 0.92]].map(([x, z, w, d], i) => (
          <mesh key={i} position={[x, 0.05, z]}>
            <boxGeometry args={[w, 0.1, d]} />
            <meshStandardMaterial color="#8a6a42" {...M} />
          </mesh>
        ))}
      </group>
      {/* árvores esparsas */}
      {Array.from({ length: 22 }, (_, i) => {
        const a = rand(`ca${i}`) * Math.PI * 2, r = 2.3 + rand(`cr${i}`) * 1.5;
        const s = 0.8 + rand(`cs${i}`) * 0.5;
        return (
          <group key={i} position={[Math.cos(a) * r, 0, Math.sin(a) * r]} scale={s}>
            <mesh position={[0, 0.15, 0]}>
              <cylinderGeometry args={[0.02, 0.03, 0.3, 5]} />
              <meshStandardMaterial color="#5a3e26" {...M} />
            </mesh>
            <mesh position={[0, 0.36, 0]}>
              <icosahedronGeometry args={[0.15, 0]} />
              <meshStandardMaterial color={i % 2 ? "#3a8a3e" : "#2f7a38"} {...M} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ "RATANABÁ" (lenda de internet, de propósito fantasioso) */

/** "Ratanabá" (lenda de internet, de propósito fantasioso): pirâmides douradas escalonadas, frisos brilhando, fachos de luz e
 *  cristais flutuando. k 0..1 surge; crack 0..1 desfaz em pó dourado. */
export const RatanabaFake: React.FC<{ f: number; k?: number; crack?: number }> = ({ f, k = 1, crack = 0 }) => {
  const kk = clamp(k, 0, 1.1);
  const cr = clamp(crack, 0, 1);
  const pyr: [number, number, number][] = [[0, 0, 1.5], [-1.55, 0.7, 0.95], [1.45, 0.5, 1.05]];
  const tiers = 5;
  return (
    <group>
      {pyr.map(([x, z, s], i) => (
        <group key={i} position={[x, 0, z]} scale={[s, s * kk * (1 - cr * 0.85), s]} rotation={[0, Math.PI / 4 + i * 0.2, cr * (i - 1) * 0.25]}>
          {Array.from({ length: tiers }, (_, t) => {
            const w = 1.2 * (1 - t / (tiers + 0.6));
            return (
              <group key={t} position={[0, 0.15 + t * 0.3, 0]}>
                <mesh castShadow>
                  <boxGeometry args={[w, 0.3, w]} />
                  <meshStandardMaterial color="#ffcf3a" emissive="#ff9a1a" emissiveIntensity={0.25 + 0.12 * Math.sin(f / 6 + i + t)} metalness={0.75} roughness={0.25} flatShading transparent opacity={1 - cr * 0.8} depthWrite={cr < 0.02} />
                </mesh>
                {/* friso brilhante */}
                <mesh position={[0, 0.13, 0]}>
                  <boxGeometry args={[w + 0.02, 0.035, w + 0.02]} />
                  <meshBasicMaterial color="#7affff" transparent opacity={(0.6 + 0.4 * Math.sin(f / 5 + t)) * (1 - cr)} toneMapped={false} />
                </mesh>
              </group>
            );
          })}
          {/* topo com cristal */}
          <mesh position={[0, 0.2 + tiers * 0.3 + 0.2 + Math.sin(f / 15 + i) * 0.05, 0]} rotation={[0, f * 0.03, 0]}>
            <octahedronGeometry args={[0.16, 0]} />
            <meshStandardMaterial color="#9affff" emissive="#3affff" emissiveIntensity={1} transparent opacity={1 - cr} />
          </mesh>
        </group>
      ))}
      {/* fachos de luz */}
      {pyr.map(([x, z, s], i) => (
        <mesh key={`b${i}`} position={[x, s * 1.9 * kk + 1.4, z]}>
          <cylinderGeometry args={[0.04, 0.3 * s, 2.8, 12, 1, true]} />
          <meshBasicMaterial color="#fff2a0" transparent opacity={0.28 * kk * (1 - cr)} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
        </mesh>
      ))}
      {/* cristais flutuando */}
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * Math.PI * 2 + f * 0.01;
        return (
          <mesh key={`c${i}`} position={[Math.cos(a) * 2.4, 1.4 + Math.sin(f / 20 + i) * 0.25, Math.sin(a) * 1.4 + 0.5]} rotation={[f * 0.02, f * 0.03 + i, 0]} scale={(0.07 + (i % 3) * 0.03) * kk * (1 - cr)}>
            <octahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={i % 2 ? "#ffd23a" : "#9affff"} emissive={i % 2 ? "#ffb01a" : "#3affff"} emissiveIntensity={0.9} />
          </mesh>
        );
      })}
      {/* pó dourado caindo ao desfazer */}
      {cr > 0.01
        ? Array.from({ length: 50 }, (_, i) => (
            <mesh key={`d${i}`} position={[(rand(`dx${i}`) - 0.5) * 3.8, 1.8 * (1 - cr) * rand(`dy${i}`) + 0.05, (rand(`dz${i}`) - 0.5) * 2.2]} scale={0.045}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial color="#d8a83a" transparent opacity={1 - cr * 0.6} flatShading />
            </mesh>
          ))
        : null}
    </group>
  );
};
