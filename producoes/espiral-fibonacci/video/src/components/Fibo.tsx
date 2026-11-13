import { useLayoutEffect, useMemo, useRef } from "react";
import { CatmullRomCurve3, Color, DoubleSide, InstancedMesh, Object3D, Quaternion, Shape, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// "A espiral de Fibonacci" — elementos novos (aprovar na folha de design). u3d esquemáticos.
export const GOLDEN = (137.50776 * Math.PI) / 180;

const M = { roughness: 0.75, metalness: 0, flatShading: true } as const;
const tmp = new Object3D();
const col = new Color();

/* ------------------------------------------------------------------ GIRASSOL (filotaxia real) */

const SEED_A = new Color("#8a5a2a");
const SEED_B = new Color("#b07a3a");
const FAM_A1 = new Color("#ff8a2a");
const FAM_A2 = new Color("#7a3a10");
const FAM_B1 = new Color("#4aa8ff");
const FAM_B2 = new Color("#163a6a");

/** Miolo de sementes. n sementes; angle (rad) entre sementes consecutivas (137,5° = girassol real);
 *  grow 0..1: quantas já nasceram (as novas nascem no centro e empurram as velhas);
 *  famA / famB 0..1: acende as 34 (horárias) e as 55 (anti-horárias) espirais em listras alternadas. */
export const SeedHead: React.FC<{ n?: number; R?: number; angle?: number; grow?: number; famA?: number; famB?: number; dome?: number; gaps?: number }> = ({ n = 900, R = 2, angle = GOLDEN, grow = 1, famA = 0, famB = 0, dome = 0.25, gaps = 0 }) => {
  const ref = useRef<InstancedMesh>(null);
  const shown = Math.max(1, Math.round(n * clamp(grow, 0, 1)));
  const c = R / Math.sqrt(n);
  const seedSize = c * 0.7;
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    for (let i = 0; i < n; i++) {
      if (i >= shown) {
        tmp.position.set(0, -999, 0);
        tmp.scale.setScalar(0.0001);
        tmp.updateMatrix();
        m.setMatrixAt(i, tmp.matrix);
        continue;
      }
      // a semente mais nova (i = shown-1) fica no centro
      const age = shown - 1 - i;
      const r = c * Math.sqrt(age + 0.5);
      const a = i * angle;
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;
      const y = dome * R * (1 - (r / R) * (r / R));
      tmp.position.set(x, y, z);
      tmp.rotation.set(0, -a, 0);
      const s = seedSize * (0.75 + 0.5 * Math.min(1, r / R));
      tmp.scale.set(s * 1.25, s * 0.55, s);
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      // cor: famílias de espirais (parastíquias) = índice mod 34 e mod 55 (só fazem sentido no ângulo áureo)
      const base = (i % 2 ? SEED_A : SEED_B).clone();
      if (famA > 0.01) base.lerp(age % 34 < 34 && (i % 34) % 2 === 0 ? FAM_A1 : FAM_A2, 0.85 * clamp(famA, 0, 1));
      if (famB > 0.01) base.lerp((i % 55) % 2 === 0 ? FAM_B1 : FAM_B2, 0.85 * clamp(famB, 0, 1));
      if (gaps > 0.01) base.lerp(new Color("#ff3b30"), 0);
      m.setColorAt(i, col.copy(base));
    }
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [n, shown, angle, famA, famB, dome, R, c, seedSize, gaps]);
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, n]} castShadow>
      <octahedronGeometry args={[1, 0]} />
      <meshStandardMaterial roughness={0.7} flatShading vertexColors={false} />
    </instancedMesh>
  );
};

/** Girassol completo: miolo + pétalas + sépalas + caule + folhas. Face voltada para +y. */
export const Sunflower: React.FC<{ f: number; R?: number; grow?: number; famA?: number; famB?: number; petals?: number; stem?: boolean; angle?: number; n?: number }> = ({ f, R = 2, grow = 1, famA = 0, famB = 0, petals = 1, stem = true, angle = GOLDEN, n = 900 }) => {
  const P = 34;
  return (
    <group>
      {/* disco de fundo do miolo */}
      <mesh position={[0, -0.02, 0]}>
        <cylinderGeometry args={[R * 1.03, R * 0.9, R * 0.12, 48]} />
        <meshStandardMaterial color="#1e1208" {...M} />
      </mesh>
      <SeedHead n={n} R={R} grow={grow} famA={famA} famB={famB} angle={angle} />
      {/* pétalas em 2 camadas */}
      {petals > 0.01
        ? [0, 1].flatMap((layer) =>
            Array.from({ length: P }, (_, i) => {
              const a = ((i + layer * 0.5) / P) * Math.PI * 2;
              const L = R * (0.95 + 0.12 * rand(`pl${layer}${i}`)) * clamp(petals, 0, 1);
              return (
                <group key={`${layer}-${i}`} rotation={[0, -a, 0]}>
                  <mesh position={[R + L * 0.45, -0.04 - layer * 0.05, 0]} rotation={[0, 0, 0.12 + layer * 0.08 + 0.05 * Math.sin(f / 30 + i)]} scale={[L * 0.5, 0.025, R * 0.13]}>
                    <sphereGeometry args={[1, 10, 6]} />
                    <meshStandardMaterial color={layer ? "#f5b81a" : "#ffd02a"} roughness={0.6} flatShading />
                  </mesh>
                </group>
              );
            }),
          )
        : null}
      {/* sépalas verdes atrás */}
      {Array.from({ length: 20 }, (_, i) => {
        const a = (i / 20) * Math.PI * 2;
        return (
          <group key={`s${i}`} rotation={[0, -a, 0]}>
            <mesh position={[R * 1.05, -0.18, 0]} rotation={[0, 0, 0.35]} scale={[R * 0.32, 0.03, R * 0.09]}>
              <sphereGeometry args={[1, 8, 5]} />
              <meshStandardMaterial color="#3f7a32" {...M} />
            </mesh>
          </group>
        );
      })}
      {stem ? (
        <group>
          <mesh position={[0, -R * 2.1, -R * 0.25]} rotation={[0.12, 0, 0]}>
            <cylinderGeometry args={[R * 0.07, R * 0.09, R * 4, 10]} />
            <meshStandardMaterial color="#4a8a3a" {...M} />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * R * 0.55, -R * 2.6, -R * 0.2]} rotation={[0.2, 0, s * -0.7]} scale={[R * 0.55, 0.03, R * 0.3]}>
              <sphereGeometry args={[1, 10, 6]} />
              <meshStandardMaterial color="#3f7a32" {...M} />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ COELHO */

export const Rabbit: React.FC<{ f: number; color?: string; hop?: number; s?: number }> = ({ f, color = "#efe8de", hop = 0, s = 1 }) => {
  const h = Math.abs(Math.sin(f * 0.25 + hop * 3)) * 0.12 * (hop > 0 ? 1 : 0);
  const inner = "#f2b8c0";
  return (
    <group scale={s} position={[0, h, 0]}>
      <mesh position={[0, 0.28, 0]} scale={[0.42, 0.3, 0.3]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={color} {...M} />
      </mesh>
      <mesh position={[0.3, 0.48, 0]} scale={[0.2, 0.19, 0.18]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={color} {...M} />
      </mesh>
      {[-1, 1].map((k) => (
        <group key={k} position={[0.27, 0.62, k * 0.07]} rotation={[k * 0.15, 0, 0.25 + 0.05 * Math.sin(f / 15 + k)]}>
          <mesh position={[0, 0.16, 0]} scale={[0.05, 0.18, 0.035]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
          <mesh position={[0.012, 0.16, 0]} scale={[0.03, 0.14, 0.02]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={inner} {...M} />
          </mesh>
        </group>
      ))}
      {[-1, 1].map((k) => (
        <mesh key={`e${k}`} position={[0.44, 0.52, k * 0.08]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshStandardMaterial color="#1a1210" />
        </mesh>
      ))}
      <mesh position={[0.49, 0.47, 0]}>
        <sphereGeometry args={[0.022, 8, 6]} />
        <meshStandardMaterial color="#e88a9a" />
      </mesh>
      <mesh position={[-0.42, 0.34, 0]}>
        <sphereGeometry args={[0.09, 10, 8]} />
        <meshStandardMaterial color="#ffffff" {...M} />
      </mesh>
      {[-1, 1].map((k) => (
        <mesh key={`p${k}`} position={[-0.12, 0.05, k * 0.14]} scale={[0.18, 0.06, 0.07]}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color={color} {...M} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ QUADRADOS DE FIBONACCI + ESPIRAL */

const FIB = [1, 1, 2, 3, 5, 8, 13];
const SQ_COLORS = ["#ffd36a", "#ffb04a", "#ff8a5a", "#e868a8", "#a87cf0", "#5aa8ff", "#4ad0b0"];
/** Quadrados na disposição clássica (espiral no sentido anti-horário). Retorna centro, lado e o arco de cada um. */
export const fibSquares = (k = 1) => {
  const out: { x: number; y: number; s: number; cx: number; cy: number; a0: number }[] = [];
  let minX = 0, minY = 0, maxX = 1, maxY = 1;
  out.push({ x: 0.5, y: 0.5, s: 1, cx: 1, cy: 0, a0: Math.PI / 2 });
  for (let i = 1; i < FIB.length; i++) {
    const s = FIB[i];
    const dir = i % 4; // 1: esquerda, 2: baixo, 3: direita, 0: cima
    let x = 0, y = 0, cx = 0, cy = 0, a0 = 0;
    if (dir === 1) { x = minX - s / 2; y = maxY - s / 2; cx = minX; cy = maxY - s; a0 = Math.PI / 2; minX -= s; }
    else if (dir === 2) { x = minX + s / 2; y = minY - s / 2; cx = minX + s; cy = minY; a0 = Math.PI; minY -= s; }
    else if (dir === 3) { x = maxX + s / 2; y = minY + s / 2; cx = maxX; cy = minY + s; a0 = (3 * Math.PI) / 2; maxX += s; }
    else { x = maxX - s / 2; y = maxY + s / 2; cx = maxX - s; cy = maxY; a0 = 0; maxY += s; }
    out.push({ x, y, s, cx, cy, a0 });
  }
  return out.map((q) => ({ ...q, x: q.x * k, y: q.y * k, s: q.s * k, cx: q.cx * k, cy: q.cy * k }));
};

export const FibSquares: React.FC<{ n?: number; draw?: number; k?: number }> = ({ n = 7, draw = 1, k = 0.3 }) => {
  const qs = fibSquares(k);
  // centraliza
  const xs = qs.flatMap((q) => [q.x - q.s / 2, q.x + q.s / 2]);
  const ys = qs.flatMap((q) => [q.y - q.s / 2, q.y + q.s / 2]);
  const ox = -(Math.min(...xs) + Math.max(...xs)) / 2;
  const oy = -(Math.min(...ys) + Math.max(...ys)) / 2;
  const d = clamp(draw, 0, 1) * qs.length;
  return (
    <group position={[ox, oy, 0]}>
      {qs.map((q, i) => {
        const v = clamp(n - i, 0, 1);
        if (v <= 0) return null;
        return (
          <group key={i} position={[q.x, q.y, 0]} scale={[v, v, 1]}>
            <mesh>
              <boxGeometry args={[q.s * 0.97, q.s * 0.97, 0.08]} />
              <meshStandardMaterial color={SQ_COLORS[i]} roughness={0.6} transparent opacity={0.85} />
            </mesh>
          </group>
        );
      })}
      {/* espiral: quarto de círculo em cada quadrado */}
      {qs.map((q, i) => {
        const part = clamp(d - i, 0, 1);
        if (part <= 0 || i >= n) return null;
        return (
          <mesh key={`a${i}`} position={[q.cx, q.cy, 0.08]} rotation={[0, 0, q.a0]}>
            <torusGeometry args={[q.s, Math.max(0.02, q.s * 0.025 + 0.015), 6, 24, (Math.PI / 2) * part]} />
            <meshBasicMaterial color="#fff2b0" toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ PINHA E ABACAXI (filotaxia na superfície) */

const surfacePoints = (n: number, profile: (t: number) => number, H: number) =>
  Array.from({ length: n }, (_, i) => {
    const t = (i + 0.5) / n; // 0 = base, 1 = topo
    const a = i * GOLDEN;
    const r = profile(t);
    return { i, t, a, p: [Math.cos(a) * r, t * H - H / 2, Math.sin(a) * r] as Vec3, r };
  });

export const PineCone: React.FC<{ hi?: number; s?: number }> = ({ hi = 0, s = 1 }) => {
  const H = 2.4;
  const pts = useMemo(() => surfacePoints(110, (t) => 0.75 * Math.sin(Math.PI * Math.pow(t, 0.8)) + 0.08, H), []);
  return (
    <group scale={s}>
      <mesh scale={[0.55, 1.05, 0.55]}>
        <sphereGeometry args={[1, 16, 12]} />
        <meshStandardMaterial color="#4a2e18" {...M} />
      </mesh>
      {pts.map(({ i, a, p, r, t }) => {
        const fam = (i % 8) % 2 === 0;
        const c = new Color("#8a5a32").lerp(new Color(fam ? "#ff8a2a" : "#5a3418"), 0.8 * hi);
        const out = new Vector3(Math.cos(a), 0.4 - t * 0.6, Math.sin(a)).normalize();
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), out);
        return (
          <mesh key={i} position={p} quaternion={q} scale={[0.17 + r * 0.1, 0.1, 0.13]}>
            <coneGeometry args={[1, 1.2, 5]} />
            <meshStandardMaterial color={c} {...M} />
          </mesh>
        );
      })}
    </group>
  );
};

export const Pineapple: React.FC<{ hi?: number; s?: number; f?: number }> = ({ hi = 0, s = 1, f = 0 }) => {
  const H = 2.2;
  const pts = useMemo(() => surfacePoints(130, (t) => 0.82 * Math.sqrt(Math.sin(Math.PI * (0.06 + t * 0.88))), H), []);
  return (
    <group scale={s}>
      <mesh scale={[0.78, 1.1, 0.78]}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshStandardMaterial color="#8a6a1a" {...M} />
      </mesh>
      {pts.map(({ i, p, a }) => {
        const fam = (i % 13) % 2 === 0;
        const c = new Color("#d9a82a").lerp(new Color(fam ? "#4aa8ff" : "#7a5a10"), 0.75 * hi);
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(Math.cos(a), 0, Math.sin(a)));
        return (
          <mesh key={i} position={p} quaternion={q} scale={[0.15, 0.08, 0.15]}>
            <cylinderGeometry args={[0.6, 1, 1, 6]} />
            <meshStandardMaterial color={c} {...M} />
          </mesh>
        );
      })}
      {/* coroa */}
      {Array.from({ length: 16 }, (_, i) => {
        const a = i * GOLDEN;
        const tilt = 0.35 + (i / 16) * 0.5;
        return (
          <group key={`c${i}`} position={[0, H / 2 + 0.05, 0]} rotation={[0, -a, 0]}>
            <mesh position={[0.18, 0.45, 0]} rotation={[0, 0, -tilt + 0.03 * Math.sin(f / 20 + i)]} scale={[0.06, 0.55 - i * 0.015, 0.02]}>
              <sphereGeometry args={[1, 6, 6]} />
              <meshStandardMaterial color={i % 2 ? "#3f7a32" : "#4f8a3a"} {...M} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

/* ------------------------------------------------------------------ NÁUTILO EM CORTE */

/** Concha em corte (espiral logarítmica: o raio TRIPLICA a cada volta, como medido) com câmaras.
 *  golden 0..1 desenha por cima uma espiral áurea (raio × ~6,85 por volta) que não encaixa. */
export const Nautilus: React.FC<{ golden?: number; s?: number }> = ({ golden = 0, s = 1 }) => {
  const shell = useMemo(() => {
    const b = Math.log(3) / (2 * Math.PI);
    const a0 = 0.06;
    const turns = 3.2;
    const pts: Vector3[] = [];
    for (let i = 0; i <= 260; i++) {
      const th = (i / 260) * turns * Math.PI * 2;
      const r = a0 * Math.exp(b * th);
      pts.push(new Vector3(Math.cos(th) * r, Math.sin(th) * r, 0));
    }
    return { curve: new CatmullRomCurve3(pts), b, a0, turns };
  }, []);
  const goldenCurve = useMemo(() => {
    const b = Math.log(1.6180339 ** 4) / (2 * Math.PI);
    const pts: Vector3[] = [];
    const turns = 2.3;
    for (let i = 0; i <= 200; i++) {
      const th = (i / 200) * turns * Math.PI * 2;
      const r = 0.035 * Math.exp(b * th);
      pts.push(new Vector3(Math.cos(th) * r, Math.sin(th) * r, 0.06));
    }
    return new CatmullRomCurve3(pts);
  }, []);
  const { b, a0, turns } = shell;
  const shellShape = useMemo(() => {
    const sh = new Shape();
    const th0 = (turns - 1) * Math.PI * 2;
    for (let i = 0; i <= 120; i++) {
      const th = th0 + (i / 120) * Math.PI * 2;
      const r = a0 * Math.exp(b * th);
      if (i === 0) sh.moveTo(Math.cos(th) * r, Math.sin(th) * r);
      else sh.lineTo(Math.cos(th) * r, Math.sin(th) * r);
    }
    for (let i = 120; i >= 0; i--) {
      const th = th0 + (i / 120) * Math.PI * 2 - Math.PI * 2;
      const r = a0 * Math.exp(b * Math.max(th, 0));
      sh.lineTo(Math.cos(th) * r * 0.98, Math.sin(th) * r * 0.98);
    }
    return sh;
  }, [a0, b, turns]);
  const g = clamp(golden, 0, 1);
  return (
    <group scale={s}>
      {/* parede externa (espiral) */}
      <mesh>
        <tubeGeometry args={[shell.curve, 260, 0.035, 6, false]} />
        <meshStandardMaterial color="#f2e2c4" roughness={0.5} />
      </mesh>
      {/* nácar: preenche a última volta (forma da concha) */}
      <mesh position={[0, 0, -0.04]}>
        <shapeGeometry args={[shellShape]} />
        <meshStandardMaterial color="#efe0f4" roughness={0.3} metalness={0.25} side={DoubleSide} />
      </mesh>
      {/* câmaras: septos curvos entre voltas consecutivas */}
      {Array.from({ length: 26 }, (_, k) => {
        const th = 2 * Math.PI + (k / 26) * (turns - 1) * Math.PI * 2;
        const r1 = a0 * Math.exp(b * (th - 2 * Math.PI));
        const r2 = a0 * Math.exp(b * th);
        const p1 = new Vector3(Math.cos(th) * r1, Math.sin(th) * r1, 0.01);
        const p2 = new Vector3(Math.cos(th) * r2, Math.sin(th) * r2, 0.01);
        const mid = p1.clone().add(p2).multiplyScalar(0.5);
        const d = p2.clone().sub(p1);
        const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.clone().normalize());
        return (
          <mesh key={k} position={mid} quaternion={q}>
            <cylinderGeometry args={[0.012, 0.012, d.length(), 5]} />
            <meshStandardMaterial color="#d9c4a2" />
          </mesh>
        );
      })}
      {/* listras laranja da parte externa */}
      {Array.from({ length: 10 }, (_, k) => {
        const th = (turns - 1) * Math.PI * 2 + (k / 10) * Math.PI * 1.6;
        const r = a0 * Math.exp(b * th);
        return (
          <mesh key={`st${k}`} position={[Math.cos(th) * r, Math.sin(th) * r, 0.02]} rotation={[0, 0, th]} scale={[0.04, 0.22, 0.02]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#c86a2a" />
          </mesh>
        );
      })}
      {/* espiral áurea dourada (sobreposta, não encaixa) */}
      {g > 0.01 ? (
        <mesh>
          <tubeGeometry args={[goldenCurve, Math.max(2, Math.round(200 * g)), 0.028, 6, false]} />
          <meshBasicMaterial color="#ffcf3a" toneMapped={false} />
        </mesh>
      ) : null}
    </group>
  );
};
export const _fibUnused = lerp;
