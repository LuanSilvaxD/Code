import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, Quaternion, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// ARATASSAURO (Aratasaurus museunacionali) — RECONSTRUÇÃO ARTÍSTICA.
// Terópode coelurossauro jovem, ~3,1 m do focinho à ponta da cauda, quadril a ~0,9 m.
// Modelado em METROS, de frente para +x, pés apoiados em y = 0 (na cena: scale = uPorMetro).
// O corpo é um "loft": anéis elípticos ao longo da coluna (cauda → quadril → peito → pescoço → cabeça),
// com cores por vértice (dorso escuro, faixas, barriga clara). Pernas digitígradas em 3 segmentos + 3 dedos.
// feathers 0..1: penugem leve (protopenas) no dorso, pescoço, braços e cauda — penas são INCERTAS no fóssil.

export type DinoPalette = { back: string; side: string; belly: string; stripe: string; claw: string; eye: string; fuzz: string };
export const ARATA_COLORS: DinoPalette = { back: "#6e5234", side: "#b07c40", belly: "#f0e2bc", stripe: "#2e2216", claw: "#231d18", eye: "#f2b53a", fuzz: "#8a6a40" };

type Key = { s: number; x: number; y: number; w: number; h: number };
// s: 0 = ponta da cauda → 1 = focinho. x/y em metros (perfil), w = meia-largura, h = meia-altura.
const SPINE: Key[] = [
  { s: 0.0, x: -1.7, y: 0.74, w: 0.012, h: 0.014 },
  { s: 0.12, x: -1.35, y: 0.8, w: 0.035, h: 0.048 },
  { s: 0.25, x: -0.9, y: 0.88, w: 0.072, h: 0.1 },
  { s: 0.38, x: -0.45, y: 0.95, w: 0.125, h: 0.17 },
  { s: 0.48, x: 0.0, y: 0.98, w: 0.17, h: 0.24 },
  { s: 0.56, x: 0.28, y: 0.95, w: 0.19, h: 0.3 },
  { s: 0.63, x: 0.52, y: 0.97, w: 0.16, h: 0.25 },
  { s: 0.69, x: 0.7, y: 1.08, w: 0.1, h: 0.12 },
  { s: 0.75, x: 0.82, y: 1.24, w: 0.078, h: 0.088 },
  { s: 0.8, x: 0.92, y: 1.36, w: 0.072, h: 0.082 },
  { s: 0.85, x: 1.0, y: 1.42, w: 0.088, h: 0.118 },
  { s: 0.91, x: 1.13, y: 1.41, w: 0.078, h: 0.1 },
  { s: 0.96, x: 1.27, y: 1.37, w: 0.052, h: 0.072 },
  { s: 1.0, x: 1.36, y: 1.34, w: 0.022, h: 0.035 },
];
const sample = (s: number) => {
  let i = 0;
  while (i < SPINE.length - 2 && SPINE[i + 1].s < s) i++;
  const a = SPINE[i];
  const b = SPINE[i + 1];
  const t = clamp((s - a.s) / (b.s - a.s), 0, 1);
  const k = t * t * (3 - 2 * t);
  return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) };
};

type Pose = { tail: number; neck: number; bob: number; breathe: number };
/** Ponto da coluna com a pose (cauda balança de lado, pescoço sobe/desce). */
const spineAt = (s: number, p: Pose): Vec3 => {
  const q = sample(s);
  const tailK = s < 0.5 ? (0.5 - s) / 0.5 : 0;
  const neckK = s > 0.66 ? (s - 0.66) / 0.34 : 0;
  return [q.x, q.y + p.bob + neckK * neckK * p.neck * 0.12 + tailK * 0.04 * Math.sin(p.tail * 0.7), tailK * tailK * 0.22 * Math.sin(p.tail - s * 6)];
};

const N_S = 70;
const N_R = 14;

const useBody = (pose: Pose, pal: DinoPalette) =>
  useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const frames: { p: Vector3; up: Vector3; side: Vector3; w: number; h: number }[] = [];
    const cBack = new Color(pal.back);
    const cSide = new Color(pal.side);
    const cBelly = new Color(pal.belly);
    const cStripe = new Color(pal.stripe);
    for (let i = 0; i <= N_S; i++) {
      const s = i / N_S;
      const p = new Vector3(...spineAt(s, pose));
      const p2 = new Vector3(...spineAt(Math.min(1, s + 0.01), pose));
      const p1 = new Vector3(...spineAt(Math.max(0, s - 0.01), pose));
      const t = p2.sub(p1).normalize();
      const side = new Vector3().crossVectors(t, new Vector3(0, 1, 0)).normalize().multiplyScalar(-1);
      const up = new Vector3().crossVectors(t, side).normalize();
      const q = sample(s);
      const br = s > 0.45 && s < 0.68 ? 1 + 0.025 * pose.breathe : 1;
      frames.push({ p, up, side, w: q.w * br, h: q.h * br });
    }
    const idx: number[] = [];
    frames.forEach((f, i) => {
      const s = i / N_S;
      for (let j = 0; j < N_R; j++) {
        const a = (j / N_R) * Math.PI * 2;
        const ca = Math.cos(a);
        // barriga um pouco achatada e mais funda que o dorso
        const hh = ca > 0 ? f.h : f.h * 1.08;
        const v = f.p.clone().addScaledVector(f.up, ca * hh).addScaledVector(f.side, Math.sin(a) * f.w);
        pos.push(v.x, v.y, v.z);
        const dorsal = clamp((ca - 0.1) / 0.7, 0, 1);
        const belly = clamp((-ca - 0.35) / 0.5, 0, 1);
        const c = cSide.clone().lerp(cBack, dorsal).lerp(cBelly, belly);
        // faixas transversais no dorso (pescoço → cauda)
        if (dorsal > 0.15 && s > 0.06 && s < 0.82 && Math.sin(s * 52) > 0.3) c.lerp(cStripe, 0.85 * Math.min(1, dorsal * 1.4));
        // máscara escura atrás do olho
        if (s > 0.84 && s < 0.9 && Math.abs(Math.sin(a)) > 0.6 && ca > -0.1) c.lerp(cStripe, 0.6);
        // linha da boca
        if (s > 0.9 && s < 0.995 && ca > -0.5 && ca < -0.28) c.set("#3a1c18");
        col.push(c.r, c.g, c.b);
      }
    });
    for (let i = 0; i < N_S; i++)
      for (let j = 0; j < N_R; j++) {
        const a = i * N_R + j;
        const b = i * N_R + ((j + 1) % N_R);
        const c = (i + 1) * N_R + j;
        const d = (i + 1) * N_R + ((j + 1) % N_R);
        idx.push(a, b, c, b, d, c);
      }
    // casca de penugem: mesmo loft, inflado e "eriçado" no dorso/flancos (penas = incerto)
    const shellPos: number[] = [];
    const shellCol: number[] = [];
    const cFuzz = new Color(pal.fuzz);
    frames.forEach((f, i) => {
      const s = i / N_S;
      const on = s > 0.03 && s < 0.86 ? 1 : 0;
      for (let j = 0; j < N_R; j++) {
        const a = (j / N_R) * Math.PI * 2;
        const ca = Math.cos(a);
        const fuzzK = on * clamp((ca + 0.35) / 0.8, 0, 1);
        const n = 1 + fuzzK * (0.1 + 0.16 * rand(`sh${i}_${j}`)) * (s > 0.66 ? 1.3 : 1);
        const hh = (ca > 0 ? f.h : f.h * 1.08) * n;
        const v = f.p.clone().addScaledVector(f.up, ca * hh).addScaledVector(f.side, Math.sin(a) * f.w * n);
        shellPos.push(v.x, v.y, v.z);
        const c = cFuzz.clone().lerp(cBack, 0.5 * clamp((ca - 0.2) / 0.6, 0, 1));
        if (s > 0.06 && s < 0.82 && Math.sin(s * 52) > 0.3 && ca > 0.1) c.lerp(cStripe, 0.6);
        shellCol.push(c.r, c.g, c.b);
      }
    });
    const shell = new BufferGeometry();
    shell.setAttribute("position", new BufferAttribute(new Float32Array(shellPos), 3));
    shell.setAttribute("color", new BufferAttribute(new Float32Array(shellCol), 3));
    shell.setIndex(idx);
    shell.computeVertexNormals();
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return { g, frames, shell };
  }, [pose.tail, pose.neck, pose.bob, pose.breathe, pal]);

const UP = new Vector3(0, 1, 0);
/** Segmento afunilado entre dois pontos (osso de perna/braço). */
const Seg: React.FC<{ a: Vec3; b: Vec3; r1: number; r2: number; color: string; sides?: number }> = ({ a, b, r1, r2, color, sides = 7 }) => {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const d = vb.clone().sub(va);
  const len = d.length();
  const q = new Quaternion().setFromUnitVectors(UP, d.normalize());
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={q} castShadow receiveShadow>
      <cylinderGeometry args={[r2, r1, len, sides]} />
      <meshStandardMaterial color={color} roughness={0.85} flatShading />
    </mesh>
  );
};
const Ball: React.FC<{ p: Vec3; r: number; color: string; e?: number }> = ({ p, r, color, e = 0 }) => (
  <mesh position={p} castShadow>
    <icosahedronGeometry args={[r, 1]} />
    <meshStandardMaterial color={color} roughness={0.7} flatShading emissive={color} emissiveIntensity={e} />
  </mesh>
);
const Claw: React.FC<{ p: Vec3; dir: Vec3; len: number; r: number; color: string }> = ({ p, dir, len, r, color }) => {
  const d = new Vector3(...dir).normalize();
  const q = new Quaternion().setFromUnitVectors(UP, d);
  return (
    <mesh position={[p[0] + d.x * len * 0.5, p[1] + d.y * len * 0.5, p[2] + d.z * len * 0.5]} quaternion={q}>
      <coneGeometry args={[r, len, 5]} />
      <meshStandardMaterial color={color} roughness={0.5} flatShading />
    </mesh>
  );
};

const L1 = 0.4; // fêmur
const L2 = 0.46; // tíbia
const L3 = 0.26; // metatarso
const HIP_Y = 0.98;

/** Perna digitígrada: ângulos a partir da vertical (+ = para frente). phase = fase do passo. */
const Leg: React.FC<{ side: 1 | -1; phase: number; walk: number; pal: DinoPalette; bob: number }> = ({ side, phase, walk, pal, bob }) => {
  const sw = Math.sin(phase);
  const lift = Math.max(0, Math.sin(phase + Math.PI / 2)) * walk;
  const a1 = 0.45 + 0.5 * sw * walk;
  const a2 = -0.6 - 0.45 * lift;
  const a3 = 0.28 + 0.35 * lift - 0.2 * sw * walk;
  const z = side * 0.14;
  const hip: Vec3 = [0.05, HIP_Y + bob, z];
  const knee: Vec3 = [hip[0] + L1 * Math.sin(a1), hip[1] - L1 * Math.cos(a1), z * 1.15];
  const ankle: Vec3 = [knee[0] + L2 * Math.sin(a2), knee[1] - L2 * Math.cos(a2), z * 1.05];
  const ball: Vec3 = [ankle[0] + L3 * Math.sin(a3), ankle[1] - L3 * Math.cos(a3), z];
  const toeA = 0.15 + 0.6 * lift; // dedos dobram ao levantar
  return (
    <group>
      {/* coxa musculosa */}
      <Seg a={[hip[0] - 0.02, hip[1] + 0.02, z * 0.9]} b={knee} r1={0.13} r2={0.065} color={pal.side} sides={14} />
      <Ball p={knee} r={0.06} color={pal.side} />
      <Seg a={knee} b={ankle} r1={0.058} r2={0.033} color={pal.side} />
      <Seg a={ankle} b={ball} r1={0.032} r2={0.026} color={pal.belly} />
      {[-1, 0, 1].map((k) => {
        const dir: Vec3 = [Math.cos(toeA), -Math.sin(toeA) * 0.6, k * 0.35];
        const L = k === 0 ? 0.13 : 0.1;
        const tip: Vec3 = [ball[0] + dir[0] * L, Math.max(0.012, ball[1] + dir[1] * L), ball[2] + dir[2] * L];
        return (
          <group key={k}>
            <Seg a={ball} b={tip} r1={0.022} r2={0.014} color={pal.belly} sides={5} />
            <Claw p={tip} dir={[1, -0.5, k * 0.3]} len={0.04} r={0.011} color={pal.claw} />
          </group>
        );
      })}
    </group>
  );
};

const Arm: React.FC<{ side: 1 | -1; f: number; pal: DinoPalette; bob: number; feathers: number }> = ({ side, f, pal, bob, feathers }) => {
  const sh: Vec3 = [0.6, 0.9 + bob, side * 0.12];
  const el: Vec3 = [sh[0] + 0.06, sh[1] - 0.15, side * 0.16];
  const wr: Vec3 = [el[0] + 0.13, el[1] + 0.02 + 0.01 * Math.sin(f / 9), side * 0.15];
  return (
    <group>
      <Seg a={sh} b={el} r1={0.035} r2={0.025} color={pal.side} />
      <Seg a={el} b={wr} r1={0.024} r2={0.018} color={pal.side} />
      {[-1, 0, 1].map((k) => <Claw key={k} p={wr} dir={[0.6, -0.8, k * 0.25]} len={0.07} r={0.008} color={pal.claw} />)}
      {feathers > 0.01
        ? [0, 1, 2, 3, 4].map((i) => {
            const t = i / 4;
            const p: Vec3 = [lerp(el[0], wr[0], t), lerp(el[1], wr[1], t) - 0.01, lerp(el[2], wr[2], t)];
            return <Claw key={`f${i}`} p={p} dir={[-0.3, -1, 0]} len={0.07 * feathers} r={0.012} color={pal.fuzz} />;
          })
        : null}
    </group>
  );
};

export const Aratasaurus: React.FC<{ frame: number; walk?: number; feathers?: number; pal?: DinoPalette; ghost?: number }> = ({ frame, walk = 0, feathers = 0, pal = ARATA_COLORS, ghost = 0 }) => {
  const w = clamp(walk, 0, 1);
  const phase = frame * 0.2;
  const pose: Pose = {
    tail: frame * 0.06 * (1 + w),
    neck: Math.sin(frame / 37) + w * 0.6 * Math.sin(phase * 2),
    bob: w * 0.025 * Math.abs(Math.sin(phase)),
    breathe: Math.sin(frame / 18),
  };
  const { g, frames, shell } = useBody(pose, pal);
  const at = (s: number) => frames[Math.round(s * N_S)];
  const eye = (k: 1 | -1): Vec3 => {
    const fr = at(0.875);
    const v = fr.p.clone().addScaledVector(fr.up, fr.h * 0.38).addScaledVector(fr.side, k * fr.w * 0.9);
    return [v.x, v.y, v.z];
  };
  const fuzz = useMemo(() => {
    if (feathers < 0.01) return [];
    const out: { p: Vec3; d: Vec3; len: number }[] = [];
    for (let i = 4; i < N_S - 6; i++) {
      const s = i / N_S;
      if (s > 0.84) continue;
      for (let j = -5; j <= 5; j++) {
        const fr = frames[i];
        const a = j * 0.22 + (i % 2) * 0.11;
        const v = fr.p.clone().addScaledVector(fr.up, Math.cos(a) * fr.h * 0.97).addScaledVector(fr.side, Math.sin(a) * fr.w * 0.97);
        const n = fr.up.clone().multiplyScalar(Math.cos(a)).addScaledVector(fr.side, Math.sin(a)).normalize();
        const back = new Vector3(-1, 0.15, 0);
        const d = n.multiplyScalar(0.3).add(back).add(new Vector3(0, -0.12, 0)).normalize();
        const neck = s > 0.66 ? 1.3 : 1;
        const len = (0.045 + 0.03 * rand(`fz${i}${j}`)) * (s < 0.25 ? 0.65 : 1) * neck;
        out.push({ p: [v.x, v.y, v.z], d: [d.x, d.y, d.z], len });
      }
    }
    return out;
  }, [frames, feathers]);
  const op = 1 - clamp(ghost, 0, 0.9);
  return (
    <group>
      <mesh geometry={g} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.8} flatShading transparent={op < 1} opacity={op} />
      </mesh>
      {/* olhos (amarelos com pupila) */}
      {([1, -1] as const).map((k) => {
        const e = eye(k);
        return (
          <group key={k}>
            <Ball p={e} r={0.022} color={pal.eye} e={0.25} />
            <Ball p={[e[0] + 0.012, e[1], e[2] + k * 0.012]} r={0.011} color="#120e0a" />
          </group>
        );
      })}
      {/* dentes: fileira na mandíbula */}
      {([1, -1] as const).flatMap((k) =>
        [0.91, 0.925, 0.94, 0.955, 0.97, 0.985].map((s, i) => {
          const fr = at(s);
          const v = fr.p.clone().addScaledVector(fr.up, -fr.h * 0.42).addScaledVector(fr.side, k * fr.w * 0.9);
          return <Claw key={`${k}${i}`} p={[v.x, v.y, v.z]} dir={[0.1, -1, k * 0.2]} len={0.02} r={0.006} color="#f4efe2" />;
        }),
      )}
      {/* narina */}
      {([1, -1] as const).map((k) => {
        const fr = at(0.985);
        const v = fr.p.clone().addScaledVector(fr.up, fr.h * 0.3).addScaledVector(fr.side, k * fr.w * 0.8);
        return <Ball key={`n${k}`} p={[v.x, v.y, v.z]} r={0.008} color="#1a1410" />;
      })}
      <Leg side={1} phase={phase} walk={w} pal={pal} bob={pose.bob} />
      <Leg side={-1} phase={phase + Math.PI} walk={w} pal={pal} bob={pose.bob} />
      <Arm side={1} f={frame} pal={pal} bob={pose.bob} feathers={feathers} />
      <Arm side={-1} f={frame} pal={pal} bob={pose.bob} feathers={feathers} />
      {feathers > 0.01 ? (
        <mesh geometry={shell} castShadow>
          <meshStandardMaterial vertexColors roughness={1} flatShading transparent opacity={clamp(feathers, 0, 1) * op} />
        </mesh>
      ) : null}
      {fuzz.filter((_, i) => i % 3 === 0 && fuzz[i].p[0] > 0.6).map((z, i) => <Claw key={i} p={z.p} dir={z.d} len={z.len * 1.3 * clamp(feathers, 0, 1)} r={0.016} color={i % 2 ? pal.fuzz : pal.back} />)}
    </group>
  );
};
