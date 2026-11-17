import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, ExtrudeGeometry, Shape } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "El Niño 2026–2027" — elementos novos (aprovar na folha): barco de pesca, mapa do Brasil 3D por regiões, clima.
const C = (h: string) => new Color(h);
const M = { roughness: 0.8, metalness: 0, flatShading: true } as const;

/* ------------------------------------------------------------------ BARCO DE PESCA (Peru) */

/** Casco "loft": seções em U ao longo de x (proa em +x), cores de vértice (faixas). Winding a,b,c,b,d,c. */
const hullGeo = () => {
  const NX = 18, NU = 10;
  const L = 1.8;
  const pos: number[] = [], col: number[] = [], idx: number[] = [];
  const red = C("#b8352a"), blue = C("#2a64b8"), white = C("#f2efe8"), dark = C("#1e2a40");
  for (let i = 0; i <= NX; i++) {
    const t = i / NX; // 0 = popa, 1 = proa
    const x = -L / 2 + t * L;
    const w = 0.42 * Math.sqrt(Math.max(0, 1 - Math.pow(Math.max(0, (t - 0.55) / 0.45), 2))) * (t < 0.08 ? 0.85 + t * 1.9 : 1);
    const deck = 0.34 + 0.12 * Math.pow(t, 3); // proa mais alta
    const keel = -0.12 + 0.1 * Math.pow(t, 4);
    for (let j = 0; j <= NU; j++) {
      const u = j / NU; // 0..1 de um bordo ao outro passando pela quilha
      const a = (u - 0.5) * Math.PI; // −90..90
      const y = deck - (deck - keel) * Math.cos(a) ** 0.8;
      const z = Math.sin(a) * w * (0.75 + 0.25 * Math.cos(a));
      pos.push(x, y, z);
      const h = (y - keel) / (deck - keel);
      const c = h > 0.86 ? white : h > 0.78 ? dark : h > 0.3 ? blue : red;
      col.push(c.r, c.g, c.b);
    }
  }
  for (let i = 0; i < NX; i++)
    for (let j = 0; j < NU; j++) {
      const a = i * (NU + 1) + j, b = (i + 1) * (NU + 1) + j, c = a + 1, d = b + 1;
      idx.push(a, b, c, b, d, c);
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** Barquinho de pesca artesanal: casco azul/vermelho, convés de madeira, cabine, mastro com bandeirola, rede, boias, lampião. */
export const FishingBoat: React.FC<{ f: number; s?: number; rock?: number }> = ({ f, s = 1, rock = 1 }) => {
  const hull = useMemo(hullGeo, []);
  const roll = Math.sin(f / 18) * 0.06 * rock;
  const pitch = Math.sin(f / 23 + 1) * 0.04 * rock;
  const heave = Math.sin(f / 15) * 0.02 * rock;
  return (
    <group scale={s} position={[0, heave, 0]} rotation={[roll, 0, pitch]}>
      <mesh geometry={hull} castShadow>
        <meshStandardMaterial vertexColors roughness={0.6} side={2} />
      </mesh>
      {/* convés de tábuas */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={i} position={[-0.6 + i * 0.22, 0.33, 0]} receiveShadow>
          <boxGeometry args={[0.2, 0.02, 0.7]} />
          <meshStandardMaterial color={i % 2 ? "#a8784a" : "#b8885a"} {...M} />
        </mesh>
      ))}
      {/* cabine */}
      <group position={[-0.45, 0.34, 0]}>
        <mesh position={[0, 0.2, 0]} castShadow>
          <boxGeometry args={[0.42, 0.4, 0.5]} />
          <meshStandardMaterial color="#f2efe8" {...M} />
        </mesh>
        <mesh position={[0, 0.43, 0]}>
          <boxGeometry args={[0.5, 0.05, 0.58]} />
          <meshStandardMaterial color="#c8402a" {...M} />
        </mesh>
        <mesh position={[0.212, 0.24, 0]}>
          <boxGeometry args={[0.01, 0.13, 0.32]} />
          <meshStandardMaterial color="#9fd8ff" emissive="#9fd8ff" emissiveIntensity={0.2} />
        </mesh>
        {/* lampião */}
        <mesh position={[0.2, 0.3, 0.27]}>
          <sphereGeometry args={[0.04, 8, 6]} />
          <meshStandardMaterial color="#ffd27a" emissive="#ffb03a" emissiveIntensity={0.8} />
        </mesh>
      </group>
      {/* mastro + bandeirola */}
      <mesh position={[0.25, 0.85, 0]}>
        <cylinderGeometry args={[0.018, 0.022, 1.0, 6]} />
        <meshStandardMaterial color="#8a6a4a" {...M} />
      </mesh>
      <mesh position={[0.33, 1.28, 0]} rotation={[0, 0, Math.sin(f / 8) * 0.15]}>
        <boxGeometry args={[0.16, 0.08, 0.005]} />
        <meshStandardMaterial color="#ffcf3a" side={2} />
      </mesh>
      {/* rede amontoada + boias */}
      <mesh position={[0.5, 0.4, -0.12]} scale={[0.22, 0.09, 0.16]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#5a8a7a" roughness={1} flatShading />
      </mesh>
      {[[0.42, -0.18], [0.6, -0.05], [0.55, -0.24]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.46, z]}>
          <sphereGeometry args={[0.035, 8, 6]} />
          <meshStandardMaterial color="#ff8a2a" roughness={0.5} />
        </mesh>
      ))}
      {/* vara de pesca com linha */}
      <group position={[0.15, 0.42, 0.28]} rotation={[0.6, 0, -0.5]}>
        <mesh position={[0, 0.35, 0]}>
          <cylinderGeometry args={[0.008, 0.014, 0.7, 5]} />
          <meshStandardMaterial color="#3a2a1a" />
        </mesh>
      </group>
      <mesh position={[0.42, 0.18, 0.62]} >
        <cylinderGeometry args={[0.003, 0.003, 0.62, 3]} />
        <meshBasicMaterial color="#e8e8e8" />
      </mesh>
    </group>
  );
};


/* ------------------------------------------------------------------ REFERÊNCIAS GEEK (discretas, sem copiar marca/personagem) */

/** Dígito estilo 7 segmentos (para o "42" do casco — Guia do Mochileiro). */
const SEG: Record<string, number[]> = { "4": [5, 6, 1, 2], "2": [0, 1, 6, 4, 3] };
// segmentos: 0 topo, 1 sup-dir, 2 inf-dir, 3 base, 4 inf-esq, 5 sup-esq, 6 meio
const segPos: [number, number, boolean][] = [[0, 1, true], [0.5, 0.5, false], [0.5, -0.5, false], [0, -1, true], [-0.5, -0.5, false], [-0.5, 0.5, false], [0, 0, true]];
const Digit: React.FC<{ d: string; s?: number; color?: string }> = ({ d, s = 0.05, color = "#ffffff" }) => (
  <group>
    {(SEG[d] ?? []).map((k) => {
      const [x, y, h] = segPos[k];
      return (
        <mesh key={k} position={[x * s * 1.1, y * s * 1.1, 0]}>
          <boxGeometry args={h ? [s * 0.9, s * 0.22, 0.004] : [s * 0.22, s * 0.9, 0.004]} />
          <meshBasicMaterial color={color} />
        </mesh>
      );
    })}
  </group>
);
export const Hull42: React.FC = () => (
  <group>
    {[1, -1].map((side) => (
      <group key={side} position={[0.38, 0.2, side * 0.395]} rotation={[0, side > 0 ? 0 : Math.PI, 0]}>
        <group position={[-0.05 * side, 0, 0]}><Digit d="4" /></group>
        <group position={[0.07 * side, 0, 0]}><Digit d="2" /></group>
      </group>
    ))}
  </group>
);

/** Chapéu de palha (aceno a "pirata do chapéu de palha"): aba larga, copa, fita vermelha. */
export const StrawHat: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <group scale={s}>
    <mesh>
      <cylinderGeometry args={[0.62, 0.66, 0.05, 24]} />
      <meshStandardMaterial color="#e8c46a" roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0, 0.16, 0]}>
      <cylinderGeometry args={[0.3, 0.34, 0.3, 20]} />
      <meshStandardMaterial color="#e2bc5e" roughness={0.9} flatShading />
    </mesh>
    <mesh position={[0, 0.06, 0]}>
      <cylinderGeometry args={[0.345, 0.345, 0.08, 20]} />
      <meshStandardMaterial color="#c8302a" roughness={0.7} />
    </mesh>
  </group>
);

/** Patinho de borracha (rubber duck debugging). */
export const RubberDuck: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <group scale={s}>
    <mesh scale={[1.25, 0.85, 1]}>
      <sphereGeometry args={[0.1, 16, 12]} />
      <meshStandardMaterial color="#ffd23a" roughness={0.4} />
    </mesh>
    <mesh position={[0.07, 0.1, 0]}>
      <sphereGeometry args={[0.065, 16, 12]} />
      <meshStandardMaterial color="#ffd23a" roughness={0.4} />
    </mesh>
    <mesh position={[0.135, 0.09, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.7]}>
      <coneGeometry args={[0.025, 0.05, 8]} />
      <meshStandardMaterial color="#ff7a1a" />
    </mesh>
    {[1, -1].map((k) => (
      <mesh key={k} position={[0.1, 0.12, k * 0.035]}>
        <sphereGeometry args={[0.009, 8, 6]} />
        <meshBasicMaterial color="#111" />
      </mesh>
    ))}
  </group>
);

/* ------------------------------------------------------------------ MAPA DO BRASIL (regiões, esquemático) */

type LL = [number, number]; // [lon, lat]
/** Contornos simplificados (aprox.) das 5 regiões — ESQUEMA, não é mapa exato. */
export const REGIONS: Record<"N" | "NE" | "CO" | "SE" | "S", LL[]> = {
  N: [[-74, -7.5], [-73, -9.5], [-70.5, -11], [-66, -10], [-62, -13.4], [-60, -13.5], [-58, -9.5], [-50.5, -9.5], [-50, -13], [-46, -13], [-45.5, -10], [-47.5, -6], [-48, -2], [-46, -1], [-50, 0.5], [-51.5, 4.4], [-54, 2.2], [-56, 1.9], [-58.5, 1.3], [-60, 5.2], [-61.5, 4.2], [-64, 4], [-67, 1.8], [-70, 1.5], [-69.4, -1], [-70, -4], [-72.5, -5]],
  NE: [[-48, -2], [-47.5, -6], [-45.5, -10], [-46, -13], [-46.5, -15], [-44.5, -15], [-41, -15.5], [-39.6, -18.3], [-39, -17], [-38.9, -13], [-37, -11], [-35.2, -9], [-34.8, -7.1], [-35.2, -5.4], [-37.3, -4.7], [-39, -3.1], [-41.8, -2.8], [-44.3, -2.5], [-46, -1]],
  CO: [[-60, -13.5], [-60.2, -16.2], [-58.3, -16.3], [-58, -19.8], [-57.8, -22.1], [-55.8, -22.3], [-54.6, -23.9], [-53, -22.5], [-51, -20], [-50, -19.5], [-47.4, -18.5], [-47.3, -15.5], [-46.5, -15], [-46, -13], [-50, -13], [-50.5, -9.5], [-58, -9.5]],
  SE: [[-46.5, -15], [-47.3, -15.5], [-47.4, -18.5], [-50, -19.5], [-51, -20], [-53, -22.5], [-50, -22.9], [-48.3, -25.2], [-47, -24.5], [-45, -23.6], [-43, -23], [-41.9, -22.4], [-41, -21.5], [-40, -19.8], [-39.6, -18.3], [-41, -15.5], [-44.5, -15]],
  S: [[-54.6, -23.9], [-53, -22.5], [-50, -22.9], [-48.3, -25.2], [-48.5, -26.5], [-48.6, -28.5], [-50, -30.2], [-51.2, -31.8], [-52.5, -33.7], [-53.5, -33.6], [-53.2, -32.5], [-55, -31.3], [-56.9, -30.1], [-55.8, -28.2], [-53.8, -27.2], [-53.7, -26.1], [-54.6, -25.5]],
};
export const MAP_S = 0.12; // u3d por grau
const LON0 = -52, LAT0 = -14;
/** lon/lat → posição local do mapa (x leste, −z norte). */
export const ll2 = (lon: number, lat: number, y = 0): Vec3 => [(lon - LON0) * MAP_S, y, -(lat - LAT0) * MAP_S];
const inPoly = (p: LL, poly: LL[]) => {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i], [xj, yj] = poly[j];
    if (yi > p[1] !== yj > p[1] && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
};
const centroid = (poly: LL[]): LL => [poly.reduce((s, p) => s + p[0], 0) / poly.length, poly.reduce((s, p) => s + p[1], 0) / poly.length];
export const regionCenter = (k: keyof typeof REGIONS, y = 0.3): Vec3 => {
  const c = centroid(REGIONS[k]);
  return ll2(c[0], c[1], y);
};

const BASE: Record<keyof typeof REGIONS, string> = { N: "#3f8f4a", NE: "#9aa860", CO: "#86a24e", SE: "#6f9e52", S: "#5f9a62" };
const DRY = C("#c89a5a"), HOT = C("#d8643a"), WET = C("#3a7ac8");

/** Uma região extrudada (com espaço entre regiões). dry 0..1 avermelha; wet 0..1 azula. */
const Region: React.FC<{ k: keyof typeof REGIONS; dry?: number; wet?: number; lift?: number }> = ({ k, dry = 0, wet = 0, lift = 0 }) => {
  const geo = useMemo(() => {
    const poly = REGIONS[k];
    const [cx, cy] = centroid(poly);
    const shrink = 0.985;
    const sh = new Shape();
    poly.forEach(([lon, lat], i) => {
      const x = (cx + (lon - cx) * shrink - LON0) * MAP_S;
      const y = (cy + (lat - cy) * shrink - LAT0) * MAP_S;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    });
    const g = new ExtrudeGeometry(sh, { depth: 0.16, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 1 });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [k]);
  const c = C(BASE[k]).lerp(DRY, clamp(dry * 1.4, 0, 1)).lerp(HOT, clamp(dry * 1.4 - 0.6, 0, 1)).lerp(WET, clamp(wet, 0, 1) * 0.75);
  return (
    <mesh geometry={geo} position={[0, lift, 0]} castShadow receiveShadow>
      <meshStandardMaterial color={c} {...M} />
    </mesh>
  );
};

/** Árvores low-poly espalhadas numa região (Amazônia densa). brown 0..1 = secas. */
const Trees: React.FC<{ k: keyof typeof REGIONS; n: number; brown?: number; seed: string; h?: number }> = ({ k, n, brown = 0, seed, h = 0.14 }) => {
  const pts = useMemo(() => {
    const poly = REGIONS[k];
    const xs = poly.map((p) => p[0]), ys = poly.map((p) => p[1]);
    const out: LL[] = [];
    let i = 0;
    while (out.length < n && i < n * 20) {
      const p: LL = [Math.min(...xs) + rand(`${seed}x${i}`) * (Math.max(...xs) - Math.min(...xs)), Math.min(...ys) + rand(`${seed}y${i}`) * (Math.max(...ys) - Math.min(...ys))];
      if (inPoly(p, poly)) out.push(p);
      i++;
    }
    return out;
  }, [k, n, seed]);
  const g = C("#2f7a38").lerp(C("#9a6a3a"), clamp(brown, 0, 1));
  return (
    <>
      {pts.map(([lon, lat], i) => (
        <mesh key={i} position={ll2(lon, lat, 0.18 + h / 2)} scale={0.8 + rand(`${seed}s${i}`) * 0.5}>
          <coneGeometry args={[0.05, h, 5]} />
          <meshStandardMaterial color={g} {...M} />
        </mesh>
      ))}
    </>
  );
};

/** Rio Amazonas (fita azul simplificada). dry 0..1 afina o rio. */
const AMAZON: LL[] = [[-70, -4.2], [-67, -3.6], [-64, -3.4], [-61, -3.2], [-58, -3.1], [-55, -2.4], [-52, -1.6], [-50, -0.6]];
const River: React.FC<{ dry?: number }> = ({ dry = 0 }) => (
  <>
    {AMAZON.slice(0, -1).map((a, i) => {
      const b = AMAZON[i + 1];
      const p0 = ll2(a[0], a[1], 0.185), p1 = ll2(b[0], b[1], 0.185);
      const dx = p1[0] - p0[0], dz = p1[2] - p0[2];
      const len = Math.hypot(dx, dz);
      return (
        <mesh key={i} position={[(p0[0] + p1[0]) / 2, 0.186, (p0[2] + p1[2]) / 2]} rotation={[0, -Math.atan2(dz, dx), 0]}>
          <boxGeometry args={[len + 0.02, 0.012, 0.045 * (1 - 0.6 * clamp(dry, 0, 1))]} />
          <meshStandardMaterial color="#3a8ad8" roughness={0.3} />
        </mesh>
      );
    })}
  </>
);

/** Chama low-poly com brilho (tremula). */
export const Flame: React.FC<{ f: number; s?: number; seed?: number }> = ({ f, s = 1, seed = 0 }) => {
  const k = 1 + 0.15 * Math.sin(f * 0.6 + seed * 3) + 0.08 * Math.sin(f * 1.3 + seed);
  return (
    <group scale={[s, s * k, s]}>
      <mesh position={[0, 0.09, 0]}>
        <coneGeometry args={[0.06, 0.2, 6]} />
        <meshStandardMaterial color="#ff5a1a" emissive="#ff3a0a" emissiveIntensity={0.9} flatShading />
      </mesh>
      <mesh position={[0, 0.07, 0.01]}>
        <coneGeometry args={[0.035, 0.13, 6]} />
        <meshStandardMaterial color="#ffd23a" emissive="#ffb01a" emissiveIntensity={1} flatShading />
      </mesh>
    </group>
  );
};

/** Nuvem de tempestade escura + chuva + raio (bolt 0..1 pisca). */
export const StormCloud: React.FC<{ f: number; s?: number; rain?: number; bolt?: number }> = ({ f, s = 1, rain = 1, bolt = 0 }) => (
  <group scale={s}>
    {[[-0.22, 0, 0, 0.2], [0, 0.07, 0.02, 0.26], [0.22, 0, -0.02, 0.19], [0.06, -0.03, 0.15, 0.18], [-0.08, 0.02, -0.14, 0.17]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial color="#5a5e6e" roughness={1} flatShading />
      </mesh>
    ))}
    {rain > 0.01
      ? Array.from({ length: 22 }, (_, i) => {
          const ph = (f * 0.06 + rand(`sr${i}`)) % 1;
          return (
            <mesh key={i} position={[(rand(`sx${i}`) - 0.5) * 0.55, -0.15 - ph * 0.7, (rand(`sz${i}`) - 0.5) * 0.35]}>
              <boxGeometry args={[0.01, 0.08, 0.01]} />
              <meshBasicMaterial color="#9fd0ff" transparent opacity={rain * (1 - ph * 0.6)} />
            </mesh>
          );
        })
      : null}
    {bolt > 0.01 ? (
      <group position={[0.05, -0.2, 0.05]}>
        {[[0, 0, 0.18, 0.3], [0.05, -0.15, -0.35, 0.18], [0.0, -0.28, 0.3, 0.16]].map(([x, y, rz, l], i) => (
          <mesh key={i} position={[x, y, 0]} rotation={[0, 0, rz]}>
            <boxGeometry args={[0.025, l, 0.025]} />
            <meshBasicMaterial color="#fff6a0" transparent opacity={clamp(bolt, 0, 1)} toneMapped={false} />
          </mesh>
        ))}
      </group>
    ) : null}
  </group>
);

/** Rachaduras (linhas escuras) sobre uma região seca. */
const Cracks: React.FC<{ k: keyof typeof REGIONS; v: number }> = ({ k, v }) => {
  const c = centroid(REGIONS[k]);
  if (v < 0.01) return null;
  return (
    <>
      {Array.from({ length: 14 }, (_, i) => {
        const p = ll2(c[0] + (rand(`ck${k}${i}`) - 0.5) * 9, c[1] + (rand(`cy${k}${i}`) - 0.5) * 8, 0.187);
        return (
          <mesh key={i} position={p} rotation={[0, rand(`cr${i}`) * Math.PI, 0]}>
            <boxGeometry args={[0.18 * v, 0.004, 0.012]} />
            <meshBasicMaterial color="#5a3420" />
          </mesh>
        );
      })}
    </>
  );
};

/**
 * Mapa do Brasil 3D por regiões (ESQUEMA). dryN/dryNE 0..1 = seca e calor; wetS 0..1 = chuva no Sul;
 * fire 0..1 = focos de fogo no N/NE; storm 0..1 = tempestades no Sul (bolt = raio). Rótulos 2D por fora.
 */
export const BrazilMap: React.FC<{ f: number; dryN?: number; dryNE?: number; wetS?: number; fire?: number; storm?: number; bolt?: number }> = ({ f, dryN = 0, dryNE = 0, wetS = 0, fire = 0, storm = 0, bolt = 0 }) => {
  const fires: LL[] = [[-60, -8], [-55, -6], [-50, -7.5], [-63, -5], [-42, -8], [-40, -6], [-44, -11], [-38.5, -9.5]];
  return (
    <group>
      {/* oceano em volta (disco) + borda da maquete */}
      <mesh position={[0, -0.02, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[3.5, 64]} />
        <meshStandardMaterial color="#1f5f9a" roughness={0.35} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.14, 0.15]}>
        <cylinderGeometry args={[3.52, 3.6, 0.16, 64]} />
        <meshStandardMaterial color="#1a1428" {...M} />
      </mesh>
      <mesh position={[0, -0.018, 0.15]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.38, 3.5, 64]} />
        <meshBasicMaterial color="#8b5cf6" toneMapped={false} />
      </mesh>
      {/* ondinhas claras no mar */}
      {Array.from({ length: 26 }, (_, i) => {
        const a = rand(`ow${i}`) * Math.PI * 2, r = 2.3 + rand(`owr${i}`) * 1.0;
        return (
          <mesh key={i} position={[Math.cos(a) * r, -0.012, Math.sin(a) * r + 0.15]} rotation={[-Math.PI / 2, 0, a + Math.sin(f / 30 + i) * 0.2]}>
            <planeGeometry args={[0.22, 0.025]} />
            <meshBasicMaterial color="#9fd0ff" transparent opacity={0.45} />
          </mesh>
        );
      })}
      <Region k="N" dry={dryN} />
      <Region k="NE" dry={dryNE} />
      <Region k="CO" />
      <Region k="SE" />
      <Region k="S" wet={wetS} />
      <River dry={dryN} />
      <Trees k="N" n={150} brown={dryN * 0.8} seed="am" h={0.15} />
      <Trees k="CO" n={30} seed="ce" h={0.1} />
      <Trees k="SE" n={30} seed="ma" h={0.11} />
      <Trees k="S" n={22} seed="ar" h={0.13} />
      <Trees k="NE" n={24} brown={0.3 + dryNE * 0.6} seed="ca" h={0.08} />
      <Cracks k="NE" v={dryNE} />
      {fire > 0.01
        ? fires.map(([lon, lat], i) => (
            <group key={i} position={ll2(lon, lat, 0.18)} scale={clamp(fire * 1.6 - i * 0.08, 0, 1)}>
              <Flame f={f} s={1.7} seed={i} />
              {Array.from({ length: 3 }, (_, j) => {
                const ph = (f * 0.015 + j / 3 + i * 0.13) % 1;
                return (
                  <mesh key={j} position={[0.02, 0.25 + ph * 0.5, 0]} scale={0.04 + ph * 0.07}>
                    <icosahedronGeometry args={[1, 0]} />
                    <meshStandardMaterial color="#5a5050" transparent opacity={0.7 * (1 - ph)} depthWrite={false} flatShading />
                  </mesh>
                );
              })}
            </group>
          ))
        : null}
      {storm > 0.01
        ? [[-52, -29.5], [-50, -27], [-54.5, -31.5]].map(([lon, lat], i) => (
            <group key={i} position={ll2(lon, lat, 0.62 + i * 0.05)} scale={clamp(storm, 0, 1) * (1 - i * 0.12)}>
              <StormCloud f={f + i * 7} s={1.1} rain={1} bolt={i === 0 ? bolt : 0} />
            </group>
          ))
        : null}
    </group>
  );
};
