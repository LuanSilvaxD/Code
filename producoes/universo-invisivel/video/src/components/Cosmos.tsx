import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, BufferGeometry, Color, DoubleSide, Quaternion, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// "95% do universo é invisível" — elementos novos (aprovar na folha de design). Tudo em u3d ESQUEMÁTICOS.

const M = { roughness: 0.6, metalness: 0.1, flatShading: true } as const;

/* ------------------------------------------------------------------ GALÁXIA ESPIRAL */

type Star = { r: number; a: number; y: number; c: Color; s: number };
const useGalaxyStars = (n: number, arms: number, seed: string) =>
  useMemo(() => {
    const out: Star[] = [];
    const inner = new Color("#fff2c8");
    const mid = new Color("#ffd8a0");
    const outer = new Color("#9fc4ff");
    const pink = new Color("#ff9ad8");
    for (let i = 0; i < n; i++) {
      const u = rand(`${seed}r${i}`);
      const r = Math.pow(u, 0.75);
      const arm = Math.floor(rand(`${seed}a${i}`) * arms);
      const spread = (rand(`${seed}s${i}`) - 0.5) * (0.5 + 0.9 * (1 - r)) * 0.9;
      const a = (arm / arms) * Math.PI * 2 + r * 4.2 + spread;
      const y = (rand(`${seed}y${i}`) - 0.5) * 0.12 * (1 - r * 0.7);
      let c = inner.clone().lerp(mid, clamp(r * 2, 0, 1)).lerp(outer, clamp((r - 0.45) * 2, 0, 1));
      if (rand(`${seed}p${i}`) > 0.94 && r > 0.3) c = pink.clone();
      out.push({ r, a, y, c, s: 0.6 + rand(`${seed}z${i}`) * 1.2 });
    }
    return out;
  }, [n, arms, seed]);

/** Galáxia espiral de partículas. spin = rotação (rad); halo 0..1 = névoa de matéria escura (ILUSTRAÇÃO);
 *  scatter 0..1 = sem matéria escura: as estrelas de fora escapam pela tangente. */
export const SpiralGalaxy: React.FC<{ r?: number; spin?: number; halo?: number; scatter?: number; n?: number; arms?: number; seed?: string; tilt?: number; dim?: number }> = ({ r = 3, spin = 0, halo = 0, scatter = 0, n = 4200, arms = 2, seed = "g", tilt = 0.45, dim = 0 }) => {
  const stars = useGalaxyStars(n, arms, seed);
  const geo = useMemo(() => {
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(n * 3), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(n * 3), 3));
    return g;
  }, [n]);
  const pos = geo.getAttribute("position") as BufferAttribute;
  const col = geo.getAttribute("color") as BufferAttribute;
  const sc = clamp(scatter, 0, 1);
  stars.forEach((st, i) => {
    const R = st.r * r;
    const a = st.a + spin;
    let x = Math.cos(a) * R;
    let z = Math.sin(a) * R;
    // escape tangencial (estrelas de fora voam primeiro)
    const k = sc * clamp((st.r - 0.25) / 0.75, 0, 1) * (0.6 + 0.8 * rand(`${seed}e${i}`));
    x += -Math.sin(a) * k * r * 1.6 + Math.cos(a) * k * r * 0.9;
    z += Math.cos(a) * k * r * 1.6 + Math.sin(a) * k * r * 0.9;
    pos.setXYZ(i, x, st.y * r, z);
    const b = 1 - clamp(dim, 0, 1) * 0.7;
    col.setXYZ(i, st.c.r * b, st.c.g * b, st.c.b * b);
  });
  pos.needsUpdate = true;
  col.needsUpdate = true;
  const h = clamp(halo, 0, 1);
  return (
    <group rotation={[tilt, 0, 0.12]}>
      <points geometry={geo}>
        <pointsMaterial vertexColors size={r * 0.04} sizeAttenuation transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} />
      </points>
      {/* núcleo brilhante */}
      <mesh scale={[1, 0.45, 1]}>
        <sphereGeometry args={[r * 0.13, 20, 14]} />
        <meshBasicMaterial color="#fff1c4" toneMapped={false} />
      </mesh>
      <mesh scale={[1, 0.5, 1]}>
        <sphereGeometry args={[r * 0.3, 20, 14]} />
        <meshBasicMaterial color="#ffcf7a" transparent opacity={0.22} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* halo de matéria escura (ilustração) */}
      {h > 0.01
        ? [1.0, 1.35, 1.75].map((k, i) => (
            <mesh key={i} scale={[1, 0.85, 1]}>
              <sphereGeometry args={[r * k, 28, 20]} />
              <meshBasicMaterial color="#8b5cf6" transparent opacity={(0.07 - i * 0.018) * h} blending={AdditiveBlending} depthWrite={false} side={DoubleSide} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/** Setas que puxam as estrelas para o centro (gravidade da matéria escura). */
export const PullArrows: React.FC<{ r?: number; k?: number; f: number }> = ({ r = 3, k = 1, f }) => {
  if (k < 0.01) return null;
  return (
    <group>
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * Math.PI * 2;
        const ph = (f * 0.02 + i * 0.13) % 1;
        const d = r * (1.55 - 0.45 * ph);
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(-Math.cos(a), 0, -Math.sin(a)));
        return (
          <group key={i} position={[Math.cos(a) * d, 0, Math.sin(a) * d]} quaternion={q} scale={clamp(k, 0, 1)}>
            <mesh position={[0, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.5, 6]} />
              <meshBasicMaterial color="#c4b5fd" transparent opacity={1 - ph * 0.6} />
            </mesh>
            <mesh position={[0, 0.32, 0]}>
              <coneGeometry args={[0.12, 0.22, 8]} />
              <meshBasicMaterial color="#c4b5fd" transparent opacity={1 - ph * 0.6} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ PIZZA DO UNIVERSO */

const SLICES = [
  { key: "k5", frac: 0.05, color: "#ffcf5a", emissive: "#ffb020", ei: 0.9, o: 1 },
  { key: "k27", frac: 0.27, color: "#8b5cf6", emissive: "#5b33d6", ei: 0.35, o: 0.78 },
  { key: "k68", frac: 0.68, color: "#1d2c6e", emissive: "#2a4ac8", ei: 0.25, o: 0.9 },
] as const;
/** Pizza 3D (5/27/68). k5/k27/k68 0..1 revelam cada fatia (sobem e crescem); outline = contorno tracejado do vazio. */
export const UniversePie: React.FC<{ r?: number; k5?: number; k27?: number; k68?: number; outline?: number; spin?: number; explode?: number }> = ({ r = 2.4, k5 = 0, k27 = 0, k68 = 0, outline = 0, spin = 0, explode = 0.08 }) => {
  const ks = { k5, k27, k68 } as Record<string, number>;
  let start = Math.PI / 2;
  return (
    <group rotation={[0.55, spin, 0]}>
      {SLICES.map((s) => {
        const len = s.frac * Math.PI * 2;
        const mid = start + len / 2;
        const k = clamp(ks[s.key], 0, 1);
        const st = start;
        start += len;
        if (k < 0.01) return null;
        const ex = explode * r;
        return (
          <group key={s.key} position={[Math.cos(mid) * ex, 0, -Math.sin(mid) * ex]} scale={[1, k, 1]}>
            <mesh position={[0, 0.2, 0]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[r, r, 0.4, 48, 1, false, st - Math.PI / 2 + Math.PI, len]} />
              <meshStandardMaterial color={s.color} emissive={s.emissive} emissiveIntensity={s.ei} transparent={s.o < 1} opacity={s.o} {...M} flatShading={false} />
            </mesh>
          </group>
        );
      })}
      {/* contorno do "resto" ainda não revelado */}
      {outline > 0.01
        ? Array.from({ length: 40 }, (_, i) => {
            const a = (i / 40) * Math.PI * 2;
            if (i % 2) return null;
            return (
              <mesh key={i} position={[Math.cos(a) * r, 0.2, Math.sin(a) * r]} rotation={[0, -a, 0]} scale={clamp(outline, 0, 1)}>
                <boxGeometry args={[0.04, 0.04, r * 0.12]} />
                <meshBasicMaterial color="#c4b5fd" />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/* ------------------------------------------------------------------ CAMPO DE GALÁXIAS (EXPANSÃO) */

/** Galáxias pequenas que se afastam do centro; t 0..1 com aceleração (expansão acelerada). */
export const ExpandingField: React.FC<{ t?: number; f: number; n?: number }> = ({ t = 0, f, n = 26 }) => {
  const k = clamp(t, 0, 1);
  const scale = 1 + 1.6 * k * k;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const p: Vec3 = [(rand(`ex${i}`) - 0.5) * 8, (rand(`ey${i}`) - 0.5) * 6, (rand(`ez${i}`) - 0.5) * 4];
        return (
          <group key={i} position={[p[0] * scale, p[1] * scale, p[2] * scale]} scale={0.18 + rand(`es${i}`) * 0.14}>
            <SpiralGalaxy r={2} n={260} seed={`ef${i}`} spin={f * 0.01 + i} tilt={rand(`et${i}`) * 1.4} />
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ EUCLID (estilizado, sem logos) */

export const Euclid: React.FC<{ s?: number; f: number }> = ({ s = 1, f }) => (
  <group scale={s} rotation={[0.15, f * 0.003, 0.1]}>
    {/* módulo de serviço (base hexagonal dourada) */}
    <mesh position={[0, -0.55, 0]}>
      <cylinderGeometry args={[0.75, 0.75, 0.55, 6]} />
      <meshStandardMaterial color="#d9a92c" metalness={0.5} roughness={0.35} flatShading emissive="#5a3d00" emissiveIntensity={0.15} />
    </mesh>
    {/* tubo do telescópio */}
    <mesh position={[0.05, 0.55, 0.1]}>
      <cylinderGeometry args={[0.42, 0.45, 1.7, 20]} />
      <meshStandardMaterial color="#e8eaf0" metalness={0.3} roughness={0.4} />
    </mesh>
    <mesh position={[0.05, 1.42, 0.1]} rotation={[Math.PI / 2, 0, 0]}>
      <ringGeometry args={[0.3, 0.42, 24]} />
      <meshStandardMaterial color="#2a2f3a" side={DoubleSide} />
    </mesh>
    <mesh position={[0.05, 1.4, 0.1]}>
      <circleGeometry args={[0.3, 24]} />
      <meshStandardMaterial color="#0a0d18" />
    </mesh>
    {/* escudo solar: painel grande inclinado, células azuis atrás */}
    <group position={[-0.62, 0.35, 0]} rotation={[0, 0, 0.08]}>
      <mesh>
        <boxGeometry args={[0.06, 2.4, 1.7]} />
        <meshStandardMaterial color="#c9ccd6" metalness={0.4} roughness={0.4} flatShading />
      </mesh>
      <mesh position={[-0.04, 0, 0]}>
        <boxGeometry args={[0.02, 2.2, 1.5]} />
        <meshStandardMaterial color="#1f3a8a" emissive="#0e1f55" emissiveIntensity={0.4} metalness={0.2} roughness={0.3} />
      </mesh>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((y) => (
        <mesh key={y} position={[-0.055, y, 0]}>
          <boxGeometry args={[0.005, 0.015, 1.5]} />
          <meshBasicMaterial color="#9fb4e8" />
        </mesh>
      ))}
    </group>
    {/* antena */}
    <mesh position={[0.6, -0.75, 0.3]} rotation={[0.4, 0, -0.6]}>
      <coneGeometry args={[0.22, 0.12, 16, 1, true]} />
      <meshStandardMaterial color="#e8e8ee" side={DoubleSide} />
    </mesh>
  </group>
);

/** Rastro de lançamento (partículas que sobem e somem). */
export const LaunchTrail: React.FC<{ from: Vec3; to: Vec3; t: number }> = ({ from, to, t }) => {
  const k = clamp(t, 0, 1);
  if (k < 0.01) return null;
  return (
    <group>
      {Array.from({ length: 30 }, (_, i) => {
        const u = (i / 30) * k;
        const p: Vec3 = [lerp(from[0], to[0], u), lerp(from[1], to[1], u), lerp(from[2], to[2], u)];
        return (
          <mesh key={i} position={p} scale={0.06 + 0.08 * (u / Math.max(k, 0.01))}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={i % 3 ? "#ffd38a" : "#ffffff"} transparent opacity={0.25 + 0.6 * (u / Math.max(k, 0.01))} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Esfera do céu com 1/3 iluminado (área que o Euclid vai mapear). */
export const SkyThird: React.FC<{ r?: number; k?: number }> = ({ r = 5, k = 1 }) => (
  <group>
    <mesh>
      <sphereGeometry args={[r, 40, 28]} />
      <meshBasicMaterial color="#7fb2ff" wireframe transparent opacity={0.08} />
    </mesh>
    {k > 0.01 ? (
      <mesh rotation={[0.3, 0, 0]}>
        <sphereGeometry args={[r * 1.002, 40, 28, 0, Math.PI * 2 * 0.333 * clamp(k, 0, 1)]} />
        <meshBasicMaterial color="#9fd0ff" transparent opacity={0.28} side={DoubleSide} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    ) : null}
  </group>
);

/* ------------------------------------------------------------------ LENTE GRAVITACIONAL */

/** Galáxia de fundo + aglomerado na frente. pass 0..1 traz o aglomerado; arcs 0..1 estica a imagem em arcos;
 *  field 0..1 mostra galáxias pequenas levemente esticadas; trace 0..1 desenha o contorno do halo. */
export const Lens: React.FC<{ f: number; pass?: number; arcs?: number; field?: number; trace?: number }> = ({ f, pass = 1, arcs = 0, field = 0, trace = 0 }) => {
  const p = clamp(pass, 0, 1);
  const a = clamp(arcs, 0, 1);
  const clusterX = lerp(-6, 0, p);
  return (
    <group>
      {/* galáxia de fundo: some quando vira arcos */}
      <group position={[0, 0, -3]} scale={1 - a * 0.8}>
        <SpiralGalaxy r={1.1} n={700} seed="bg" spin={f * 0.004} tilt={0.9} />
      </group>
      {/* arcos (imagens esticadas da galáxia de fundo) */}
      {a > 0.01
        ? [0, 1, 2, 3].map((i) => {
            const ang = i * (Math.PI / 2) + 0.4;
            return (
              <mesh key={i} position={[0, 0, -0.5]} rotation={[0, 0, ang]}>
                <torusGeometry args={[1.9, 0.09 * a, 8, 40, 0.9 * a]} />
                <meshBasicMaterial color="#9fd0ff" transparent opacity={0.9 * a} toneMapped={false} />
              </mesh>
            );
          })
        : null}
      {/* aglomerado: galáxias elípticas amareladas + halo roxo */}
      <group position={[clusterX, 0, 0]}>
        {Array.from({ length: 9 }, (_, i) => (
          <mesh key={i} position={[(rand(`cl${i}`) - 0.5) * 1.4, (rand(`cm${i}`) - 0.5) * 1.2, (rand(`cn${i}`) - 0.5) * 0.6]} scale={[0.22, 0.15, 0.15]}>
            <sphereGeometry args={[1, 14, 10]} />
            <meshBasicMaterial color="#ffd8a0" toneMapped={false} />
          </mesh>
        ))}
        <mesh>
          <sphereGeometry args={[1.6, 28, 20]} />
          <meshBasicMaterial color="#8b5cf6" transparent opacity={0.16} blending={AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>
      {/* campo de galáxias pequenas esticadas em volta */}
      {field > 0.01
        ? Array.from({ length: 36 }, (_, i) => {
            const ang = rand(`fa${i}`) * Math.PI * 2;
            const d = 2.4 + rand(`fd${i}`) * 2.6;
            const stretch = 1 + 1.4 * clamp(field, 0, 1) * (2.5 / d);
            return (
              <mesh key={i} position={[Math.cos(ang) * d, Math.sin(ang) * d, -1]} rotation={[0, 0, ang + Math.PI / 2]} scale={[0.09 * stretch, 0.09 / Math.sqrt(stretch), 0.05]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial color={i % 3 ? "#cfe0ff" : "#ffe2b0"} toneMapped={false} transparent opacity={clamp(field, 0, 1)} />
              </mesh>
            );
          })
        : null}
      {/* contorno desenhado do halo */}
      {trace > 0.01 ? (
        <mesh position={[0, 0, 0.2]}>
          <torusGeometry args={[2.1, 0.035, 6, 64, Math.PI * 2 * clamp(trace, 0, 1)]} />
          <meshBasicMaterial color="#c4b5fd" toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ TEIA CÓSMICA */

export const CosmicWeb: React.FC<{ f: number; light?: number; size?: number }> = ({ f, light = 1, size = 7 }) => {
  const data = useMemo(() => {
    const nodes: Vec3[] = Array.from({ length: 34 }, (_, i) => [(rand(`wn${i}`) - 0.5) * size, (rand(`wm${i}`) - 0.5) * size, (rand(`wo${i}`) - 0.5) * size * 0.6]);
    const links: [number, number][] = [];
    nodes.forEach((a, i) => {
      const d = nodes.map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) })).filter((x) => x.j !== i).sort((x, y) => x.d - y.d);
      d.slice(0, 3).forEach(({ j }) => { if (!links.some(([p, q]) => (p === j && q === i))) links.push([i, j]); });
    });
    // galáxias ao longo dos filamentos
    const pts: number[] = [];
    const cols: number[] = [];
    links.forEach(([i, j], li) => {
      const A = nodes[i];
      const Bn = nodes[j];
      for (let k = 0; k < 40; k++) {
        const u = rand(`wu${li}_${k}`);
        const jit = 0.12;
        pts.push(lerp(A[0], Bn[0], u) + (rand(`wx${li}_${k}`) - 0.5) * jit, lerp(A[1], Bn[1], u) + (rand(`wy${li}_${k}`) - 0.5) * jit, lerp(A[2], Bn[2], u) + (rand(`wz${li}_${k}`) - 0.5) * jit);
        const c = new Color("#9fc4ff").lerp(new Color("#ffd8a0"), rand(`wc${li}_${k}`));
        cols.push(c.r, c.g, c.b);
      }
    });
    nodes.forEach((n, i) => {
      for (let k = 0; k < 60; k++) {
        pts.push(n[0] + (rand(`nx${i}_${k}`) - 0.5) * 0.5, n[1] + (rand(`ny${i}_${k}`) - 0.5) * 0.5, n[2] + (rand(`nz${i}_${k}`) - 0.5) * 0.5);
        cols.push(1, 0.92, 0.75);
      }
    });
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pts), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(cols), 3));
    return { nodes, links, g };
  }, [size]);
  const L = clamp(light, 0, 1);
  return (
    <group rotation={[0.2, f * 0.002, 0]}>
      <points geometry={data.g}>
        <pointsMaterial vertexColors size={0.05} sizeAttenuation transparent opacity={0.15 + 0.85 * L} blending={AdditiveBlending} depthWrite={false} />
      </points>
      {data.links.map(([i, j], k) => {
        const a = new Vector3(...data.nodes[i]);
        const b = new Vector3(...data.nodes[j]);
        const d = b.clone().sub(a);
        const mid = a.clone().add(b).multiplyScalar(0.5);
        const on = clamp(L * 1.6 - (mid.length() / size) * 1.2, 0, 1);
        return (
          <mesh key={k} position={mid} quaternion={new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize())}>
            <cylinderGeometry args={[0.012, 0.012, d.length(), 4]} />
            <meshBasicMaterial color="#8b9cff" transparent opacity={0.08 + 0.45 * on} blending={AdditiveBlending} depthWrite={false} />
          </mesh>
        );
      })}
      {data.nodes.map((n, i) => (
        <mesh key={`n${i}`} position={n}>
          <sphereGeometry args={[0.08, 10, 8]} />
          <meshBasicMaterial color="#ffe8b8" transparent opacity={0.3 + 0.7 * L} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ ICEBERG */

export const Iceberg: React.FC<{ f: number }> = ({ f }) => (
  <group>
    {/* mar */}
    <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[24, 24, 30, 30]} />
      <meshStandardMaterial color="#1e4a7a" transparent opacity={0.55} roughness={0.2} metalness={0.1} side={DoubleSide} emissive="#0a2448" emissiveIntensity={0.3 + 0.04 * Math.sin(f / 15)} />
    </mesh>
    {/* ponta (acima d'água, ~5%) */}
    {[[0, 0.45, 0, 0.9], [0.45, 0.25, 0.2, 0.55], [-0.4, 0.2, -0.15, 0.5]].map(([x, y, z, s], i) => (
      <mesh key={i} position={[x, y, z]} rotation={[rand(`it${i}`), rand(`iu${i}`) * 3, 0]} scale={[s, s * 1.2, s]}>
        <dodecahedronGeometry args={[0.6, 0]} />
        <meshStandardMaterial color="#f4f8ff" roughness={0.4} flatShading emissive="#bcd8ff" emissiveIntensity={0.25} />
      </mesh>
    ))}
    {/* bloco submerso enorme (~95%) */}
    {[[0, -2.6, 0, 2.6], [1.4, -3.4, 0.6, 1.8], [-1.5, -3.6, -0.4, 1.9], [0.3, -4.6, -0.3, 2.1]].map(([x, y, z, s], i) => (
      <mesh key={`u${i}`} position={[x, y, z]} rotation={[rand(`iv${i}`), rand(`iw${i}`) * 3, rand(`ix${i}`)]} scale={[s, s * 0.9, s]}>
        <dodecahedronGeometry args={[1, 0]} />
        <meshStandardMaterial color="#5a6ad8" roughness={0.5} flatShading transparent opacity={0.85} emissive="#2a2a8a" emissiveIntensity={0.35} />
      </mesh>
    ))}
  </group>
);
