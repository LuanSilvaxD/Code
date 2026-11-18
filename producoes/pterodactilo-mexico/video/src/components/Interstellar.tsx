import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, Color, DoubleSide, IcosahedronGeometry, Matrix4, PlaneGeometry, Quaternion, RingGeometry, Vector3 } from "three";
import { clamp, type Vec3 } from "../utils/animation";

// "Filme × Realidade #1 — o planeta do Interestelar": elementos novos (aprovar na folha). Desenho NOSSO, genérico:
// buraco negro = visual físico (sombra + anel de fótons + disco + imagem do disco curvada pela gravidade), sem copiar o filme.

const C = (h: string) => new Color(h);
const M = { roughness: 0.85, metalness: 0, flatShading: true } as const;
/** ruído suave barato (soma de senos), ~[-1, 1]. */
const nz = (x: number, y: number, z: number) =>
  (Math.sin(x * 1.7 + y * 2.3) * Math.cos(z * 1.9 - x * 0.7) + Math.sin(y * 3.1 + z * 2.6) * 0.5 + Math.sin(x * 4.3 - z * 3.7 + y) * 0.25) / 1.75;

/* ------------------------------------------------------------------ BURACO NEGRO */

/** Cor do disco por raio relativo (0 = borda interna quente, 1 = borda externa). */
const diskColor = (k: number) => {
  const c = new Color();
  if (k < 0.18) return c.copy(C("#fff7e8")).lerp(C("#ffd48a"), k / 0.18);
  if (k < 0.55) return c.copy(C("#ffd48a")).lerp(C("#ff8a2a"), (k - 0.18) / 0.37);
  return c.copy(C("#ff8a2a")).lerp(C("#7a1a08"), (k - 0.55) / 0.45);
};

const diskGeo = (rIn: number, rOut: number, seed: number) => {
  const g = new RingGeometry(rIn, rOut, 160, 24);
  const pos = g.attributes.position;
  const cs = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i);
    const r = Math.hypot(x, y);
    const a = Math.atan2(y, x);
    const k = (r - rIn) / (rOut - rIn);
    // faixas espirais (gás girando) + brilho que cai para fora
    const streak = 0.7 + 0.3 * Math.sin(a * 9 + r * 6 + seed) * Math.sin(a * 3 - r * 2.3 + seed * 2);
    const fall = Math.pow(1 - k, 1.4) * 0.85 + 0.15;
    const c = diskColor(k).multiplyScalar(streak * fall * 1.25);
    cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b;
  }
  g.setAttribute("color", new BufferAttribute(cs, 3));
  return g;
};

/**
 * Buraco negro genérico com disco de acreção. r = raio da sombra.
 * camera/world: posição da câmera e do buraco (mundo) para a "imagem curvada" do disco ficar virada para a câmera.
 * spin 0..1 acelera o giro do disco. tilt = inclinação do disco (rad).
 */
export const BlackHole: React.FC<{ f: number; r?: number; spin?: number; tilt?: number; camera?: Vec3; world?: Vec3 }> = ({ f, r = 1, spin = 0.4, tilt = 0.32, camera, world = [0, 0, 0] }) => {
  const disk = useMemo(() => diskGeo(r * 1.7, r * 5.2, 1), [r]);
  const halo = useMemo(() => diskGeo(r * 1.08, r * 1.75, 3), [r]);
  // quaternion "olhando para a câmera" (imagem do disco vista por cima/baixo da sombra)
  const q = useMemo(() => {
    if (!camera) return new Quaternion();
    const m = new Matrix4().lookAt(new Vector3(...camera), new Vector3(...world), new Vector3(0, 1, 0));
    return new Quaternion().setFromRotationMatrix(m);
  }, [camera, world]);
  const ang = f * (0.004 + 0.03 * clamp(spin, 0, 1.2));
  return (
    <group>
      {/* sombra (horizonte) */}
      <mesh>
        <sphereGeometry args={[r, 48, 32]} />
        <meshBasicMaterial color="#000000" />
      </mesh>
      {/* disco de acreção (plano, levemente inclinado) */}
      <group rotation={[Math.PI / 2 - tilt, 0, 0]}>
        <mesh geometry={disk} rotation={[0, 0, ang]}>
          <meshBasicMaterial vertexColors side={DoubleSide} transparent opacity={0.95} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      </group>
      {/* imagem do disco curvada em volta da sombra + anel de fótons (sempre de frente para a câmera) */}
      <group quaternion={q}>
        <mesh geometry={halo} rotation={[0, 0, -ang * 0.8]} position={[0, 0, -r * 0.2]}>
          <meshBasicMaterial vertexColors side={DoubleSide} transparent opacity={0.8} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, r * 0.05]}>
          <ringGeometry args={[r * 1.02, r * 1.09, 96]} />
          <meshBasicMaterial color="#fff2d8" side={DoubleSide} transparent opacity={0.95} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
};

/* ------------------------------------------------------------------ PLANETA-OCEANO */

/** Planeta coberto por oceano raso: azul-esverdeado com manchas claras (bancos de areia) e nuvens finas. */
export const OceanPlanet: React.FC<{ f: number; r?: number; dark?: number }> = ({ f, r = 1, dark = 0 }) => {
  const geo = useMemo(() => {
    const g = new IcosahedronGeometry(r, 5);
    const pos = g.attributes.position;
    const cs = new Float32Array(pos.count * 3);
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const n = nz(v.x * 3, v.y * 3, v.z * 3);
      const band = Math.sin(v.y * 9 + n * 2) * 0.5 + 0.5;
      let c = C("#1f6f9a").lerp(C("#3aa6c0"), band * 0.6);
      if (n > 0.55) c = C("#bfe6e0"); // banco de areia / água rasíssima
      else if (n > 0.38) c = C("#6fc6c8");
      cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new BufferAttribute(cs, 3));
    return g;
  }, [r]);
  const k = 1 - 0.7 * clamp(dark, 0, 1);
  return (
    <group rotation={[0.25, f * 0.002, 0.1]}>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.35} metalness={0.05} color={new Color(k, k, k)} />
      </mesh>
      <mesh scale={1.06}>
        <sphereGeometry args={[r, 32, 20]} />
        <meshBasicMaterial color="#9fe8ff" transparent opacity={0.1 * k} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ OCEANO + ONDA GIGANTE (pouso) */

/**
 * Superfície do oceano raso até o horizonte, com uma onda-parede ao fundo. wave 0..1 = altura da onda (cresce);
 * waveZ = posição da crista (negativo = longe). Ondulação pequena animada por f.
 */
export const OceanSurface: React.FC<{ f: number; size?: number; wave?: number; waveZ?: number; waveH?: number }> = ({ f, size = 60, wave = 0, waveZ = -16, waveH = 7 }) => {
  const base = useMemo(() => new PlaneGeometry(size, size, 140, 140).rotateX(-Math.PI / 2), [size]);
  const geo = useMemo(() => {
    const g = base.clone();
    g.setAttribute("color", new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, [base]);
  const pos = geo.attributes.position;
  const col = geo.attributes.color;
  const bp = base.attributes.position;
  const w = clamp(wave, 0, 1.2);
  const deep = C("#14506e"), mid = C("#2b86a8"), foam = C("#e8f6f8"), shallow = C("#5ab4c4");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = bp.getX(i), z = bp.getZ(i);
    let y = Math.sin(x * 0.9 + f * 0.12) * 0.04 + Math.sin(z * 1.3 - f * 0.1 + x * 0.3) * 0.035;
    // onda-parede: frente íngreme (lado da câmera, z maior) e costas suaves
    const d = z - waveZ;
    const prof = d > 0 ? Math.exp(-(d * d) / (2 * 0.7 * 0.7)) : Math.exp(-(d * d) / (2 * 3.2 * 3.2));
    const h = waveH * w * prof * (0.85 + 0.15 * Math.sin(x * 0.25 + 1));
    y += h;
    pos.setY(i, y);
    const t = clamp(h / Math.max(0.001, waveH), 0, 1);
    c.copy(shallow).lerp(mid, clamp(-z / size + 0.5, 0, 1) * 0.6).lerp(deep, Math.min(1, t * 1.6) * 0.85);
    if (t > 0.78) c.copy(deep).lerp(foam, (t - 0.78) / 0.22);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.25} metalness={0.1} />
    </mesh>
  );
};

/**
 * Onda gigante (parede d'água de maré): perfil com costas suaves e frente íngreme, crista com espuma e respingos.
 * h = altura (u3d), len = largura em x, k 0..1 = quanto já cresceu. A frente olha para +z.
 */
const WAVE_PROF: [number, number][] = [[-7, 0], [-5, 0.08], [-3.5, 0.26], [-2.2, 0.52], [-1.2, 0.78], [-0.5, 0.94], [0, 1], [0.35, 0.97], [0.62, 0.86], [0.7, 0.66], [0.78, 0.42], [0.9, 0.18], [1.05, 0.03], [1.3, 0]];
export const GiantWave: React.FC<{ f: number; h?: number; len?: number; k?: number }> = ({ f, h = 8, len = 60, k = 1 }) => {
  const NX = 90;
  const geo = useMemo(() => {
    const P = WAVE_PROF.length;
    const pos = new Float32Array(NX * P * 3);
    const col = new Float32Array(NX * P * 3);
    const idx: number[] = [];
    for (let i = 0; i < NX; i++)
      for (let j = 0; j < P - 1; j++) {
        if (i === NX - 1) continue;
        const a = i * P + j, b = (i + 1) * P + j, c2 = i * P + j + 1, d = (i + 1) * P + j + 1;
        idx.push(a, b, c2, b, d, c2);
      }
    const g = new PlaneGeometry(1, 1, 1, 1);
    g.setIndex(idx);
    g.setAttribute("position", new BufferAttribute(pos, 3));
    g.setAttribute("color", new BufferAttribute(col, 3));
    return g;
  }, []);
  const P = WAVE_PROF.length;
  const pos = geo.attributes.position, col = geo.attributes.color;
  const base = C("#0c3a52"), mid = C("#1f7894"), lite = C("#5fc0d4"), foam = C("#f2fbff");
  const c = new Color();
  const kk = clamp(k, 0, 1.2);
  for (let i = 0; i < NX; i++) {
    const x = -len / 2 + (i / (NX - 1)) * len;
    const hx = h * kk * (0.82 + 0.18 * Math.sin(x * 0.12 + 1.3) + 0.06 * Math.sin(x * 0.5 + f * 0.05));
    for (let j = 0; j < P; j++) {
      const [pz, py] = WAVE_PROF[j];
      const y = py * hx;
      pos.setXYZ(i * P + j, x, y, pz * Math.max(1, hx * 0.55));
      const t = py;
      c.copy(base).lerp(mid, clamp(t * 1.6, 0, 1));
      if (t > 0.6) c.lerp(lite, (t - 0.6) / 0.4);
      if (t > 0.9 && j >= 5 && j <= 8) c.lerp(foam, (t - 0.9) / 0.1);
      col.setXYZ(i * P + j, c.r, c.g, c.b);
    }
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <group>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.3} metalness={0.05} side={DoubleSide} />
      </mesh>
      {/* respingos na crista */}
      {kk > 0.3
        ? Array.from({ length: 70 }, (_, i) => {
            const x = -len / 2 + ((i * 0.6180339) % 1) * len;
            const hx = h * kk * (0.82 + 0.18 * Math.sin(x * 0.12 + 1.3));
            const up = ((f * 0.02 + i * 0.37) % 1);
            return (
              <mesh key={i} position={[x, hx * 1.0 + up * h * 0.12, 0.3 * hx * 0.55 + up * 0.6]} scale={0.12 + 0.18 * (1 - up)}>
                <sphereGeometry args={[1, 6, 4]} />
                <meshBasicMaterial color="#f2fbff" transparent opacity={0.85 * (1 - up)} depthWrite={false} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/* ------------------------------------------------------------------ TERRA + SATÉLITE DE GPS */

/** Terra low-poly com continentes (verde/areia) e calotas. */
export const Earth: React.FC<{ f: number; r?: number }> = ({ f, r = 1 }) => {
  const geo = useMemo(() => {
    const g = new IcosahedronGeometry(r, 5);
    const pos = g.attributes.position;
    const cs = new Float32Array(pos.count * 3);
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      const n = nz(v.x * 2.2 + 3, v.y * 2.2, v.z * 2.2 - 1);
      let c = C("#2f72c8");
      if (Math.abs(v.y) > 0.86) c = C("#f2f6fa");
      else if (n > 0.2) c = n > 0.5 ? C("#c9b07a") : C("#4f9a4a");
      cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new BufferAttribute(cs, 3));
    return g;
  }, [r]);
  return (
    <group rotation={[0.4, f * 0.004, 0]}>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.7} flatShading />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[r, 32, 20]} />
        <meshBasicMaterial color="#8fd0ff" transparent opacity={0.13} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
    </group>
  );
};

/** Satélite de GPS: corpo com manta dourada, duas asas de painéis solares, antenas apontando para a Terra (−y). */
export const GpsSat: React.FC<{ s?: number; clockGlow?: number }> = ({ s = 1, clockGlow = 0 }) => (
  <group scale={s}>
    <mesh castShadow>
      <boxGeometry args={[0.5, 0.6, 0.5]} />
      <meshStandardMaterial color="#d8a83a" roughness={0.35} metalness={0.6} flatShading />
    </mesh>
    <mesh position={[0, 0.31, 0]}>
      <boxGeometry args={[0.52, 0.02, 0.52]} />
      <meshStandardMaterial color="#e8e8ea" roughness={0.5} />
    </mesh>
    {/* antenas (lado da Terra) */}
    {[-0.12, 0.12].map((x) =>
      [-0.12, 0.12].map((z) => (
        <mesh key={`${x}${z}`} position={[x, -0.4, z]}>
          <cylinderGeometry args={[0.04, 0.06, 0.2, 8]} />
          <meshStandardMaterial color="#f0f0f2" roughness={0.4} />
        </mesh>
      )),
    )}
    {/* braços + painéis */}
    {[-1, 1].map((k) => (
      <group key={k}>
        <mesh position={[k * 0.45, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.4, 6]} />
          <meshStandardMaterial color="#a0a0a8" metalness={0.6} roughness={0.3} />
        </mesh>
        {[0, 1].map((j) => (
          <group key={j} position={[k * (0.95 + j * 0.62), 0, 0]}>
            <mesh>
              <boxGeometry args={[0.58, 0.02, 0.8]} />
              <meshStandardMaterial color="#1e3a8a" roughness={0.3} metalness={0.5} />
            </mesh>
            {[-0.2, 0, 0.2].map((z) => (
              <mesh key={z} position={[0, 0.012, z]}>
                <boxGeometry args={[0.58, 0.004, 0.012]} />
                <meshBasicMaterial color="#8fb0ff" />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    ))}
    {/* luz do relógio atômico (pisca quando é corrigido) */}
    <mesh position={[0, 0, 0.26]}>
      <circleGeometry args={[0.09, 16]} />
      <meshBasicMaterial color={new Color("#3a2a10").lerp(new Color("#7dff9a"), clamp(clockGlow, 0, 1))} toneMapped={false} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ MALHA DO ESPAÇO-TEMPO + RELÓGIOS */

/** Malha "afundando" perto de uma massa (ESQUEMA). depth 0..1. Desenhada com linhas. */
export const SpacetimeGrid: React.FC<{ depth?: number; size?: number; n?: number; color?: string }> = ({ depth = 1, size = 16, n = 32, color = "#a78bfa" }) => {
  const y = (x: number, z: number) => -depth * 5.5 / (1 + (x * x + z * z) * 0.35);
  const lines = useMemo(() => {
    const out: Vec3[][] = [];
    for (let i = 0; i <= n; i++) {
      const a = -size / 2 + (i / n) * size;
      const l1: Vec3[] = [], l2: Vec3[] = [];
      for (let j = 0; j <= n * 2; j++) {
        const b = -size / 2 + (j / (n * 2)) * size;
        l1.push([a, 0, b]);
        l2.push([b, 0, a]);
      }
      out.push(l1, l2);
    }
    return out;
  }, [size, n]);
  const arr = useMemo(() => new Float32Array(lines.reduce((acc, l) => acc + (l.length - 1) * 6, 0)), [lines]);
  let k = 0;
  for (const l of lines)
    for (let j = 0; j < l.length - 1; j++) {
      const [x0, , z0] = l[j], [x1, , z1] = l[j + 1];
      arr[k++] = x0; arr[k++] = y(x0, z0); arr[k++] = z0;
      arr[k++] = x1; arr[k++] = y(x1, z1); arr[k++] = z1;
    }
  return (
    <lineSegments key={depth.toFixed(3)}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[arr, 3]} />
      </bufferGeometry>
      <lineBasicMaterial color={color} transparent opacity={0.75} toneMapped={false} />
    </lineSegments>
  );
};
export const gridY = (x: number, z: number, depth = 1) => -depth * 5.5 / (1 + (x * x + z * z) * 0.35);

/** Relógio 3D (disco + ponteiro). t = ângulo do ponteiro (rad). Vira-se para +z. */
export const Clock3D: React.FC<{ t: number; r?: number; tint?: string }> = ({ t, r = 0.5, tint = "#f5f0ff" }) => (
  <group>
    <mesh>
      <cylinderGeometry args={[r, r, 0.08, 32]} />
      <meshStandardMaterial color="#2a2240" roughness={0.6} />
    </mesh>
    <mesh position={[0, 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[r * 0.88, 32]} />
      <meshBasicMaterial color={tint} />
    </mesh>
    {Array.from({ length: 12 }, (_, i) => (
      <mesh key={i} position={[Math.sin((i / 12) * Math.PI * 2) * r * 0.74, 0.05, -Math.cos((i / 12) * Math.PI * 2) * r * 0.74]}>
        <boxGeometry args={[r * 0.05, 0.01, r * 0.12]} />
        <meshBasicMaterial color="#2a2240" />
      </mesh>
    ))}
    <group rotation={[0, -t, 0]} position={[0, 0.06, 0]}>
      <mesh position={[0, 0, -r * 0.32]}>
        <boxGeometry args={[r * 0.06, 0.01, r * 0.7]} />
        <meshBasicMaterial color="#ff5a4a" />
      </mesh>
    </group>
    <mesh position={[0, 0.07, 0]}>
      <cylinderGeometry args={[r * 0.07, r * 0.07, 0.02, 12]} />
      <meshBasicMaterial color="#2a2240" />
    </mesh>
  </group>
);

/** Partículas de "luz fóssil" (radiação cósmica de fundo) caindo para o centro e esquentando de cor (azul → laranja). t = fase. */
export const CmbParticles: React.FC<{ t: number; n?: number; R?: number }> = ({ t, n = 90, R = 9 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const a = (i * 2.399963) % (Math.PI * 2);
      const b = Math.acos(1 - (2 * ((i * 0.618034) % 1)));
      const ph = (t * 0.6 + (i * 0.37) % 1) % 1; // 0 = longe, 1 = chegou
      const rr = R * (1 - ph) + 1.25 * ph;
      const p: Vec3 = [Math.sin(b) * Math.cos(a) * rr, Math.cos(b) * rr, Math.sin(b) * Math.sin(a) * rr];
      const c = new Color("#6fb8ff").lerp(new Color("#ffb04a"), Math.pow(ph, 1.6));
      return (
        <mesh key={i} position={p} scale={0.05 + 0.07 * ph}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshBasicMaterial color={c} transparent opacity={0.35 + 0.6 * ph} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);

/** Ilha de rocha baixa para o mascote pisar (opcional no pouso) — água no tornozelo. */
export const ShallowRock: React.FC = () => (
  <mesh position={[0, -0.08, 0]} scale={[1.2, 0.12, 0.9]} receiveShadow>
    <icosahedronGeometry args={[1, 1]} />
    <meshStandardMaterial color="#5a6a70" {...M} />
  </mesh>
);
