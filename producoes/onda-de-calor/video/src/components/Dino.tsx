import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, Quaternion, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// ARATASSAURO (Aratasaurus museunacionali) — RECONSTRUÇÃO ARTÍSTICA (v2, caprichada).
// Terópode coelurossauro jovem, ~3,1 m do focinho à ponta da cauda, quadril a ~1 m.
// METROS, de frente para +x, pés em y = 0 (na cena: scale = uPorMetro).
// Corpo = loft de anéis elípticos ao longo da coluna, com músculo da mandíbula, sobrancelha óssea e cores por vértice
// (dorso com faixas, pintas nos flancos, barriga com placas). Coxa/panturrilha em músculos elipsoides, dedos articulados.
// feathers 0..1: penugem (casca felpuda + crista no pescoço + franjas nos braços e na cauda) — penas são INCERTAS.

export type DinoPalette = { back: string; side: string; thigh: string; belly: string; stripe: string; spot: string; claw: string; eye: string; fuzz: string; fuzzTip: string; scute: string };
export const ARATA_COLORS: DinoPalette = {
  back: "#6a4c2e", side: "#b37a3e", thigh: "#a9733b", belly: "#f1e3bf", stripe: "#2b1f14", spot: "#5a3a20", claw: "#1e1914", eye: "#f4b62c", fuzz: "#8e6a3e", fuzzTip: "#d9b27a", scute: "#d8c49a",
};

type Key = { s: number; x: number; y: number; w: number; h: number };
// s: 0 = ponta da cauda → 1 = focinho. x/y em metros (perfil), w = meia-largura, h = meia-altura.
const SPINE: Key[] = [
  { s: 0.0, x: -1.7, y: 0.76, w: 0.01, h: 0.012 },
  { s: 0.1, x: -1.4, y: 0.81, w: 0.03, h: 0.04 },
  { s: 0.22, x: -0.98, y: 0.88, w: 0.062, h: 0.088 },
  { s: 0.35, x: -0.5, y: 0.96, w: 0.12, h: 0.165 },
  { s: 0.46, x: -0.04, y: 1.0, w: 0.172, h: 0.24 },
  { s: 0.54, x: 0.26, y: 0.97, w: 0.195, h: 0.305 },
  { s: 0.61, x: 0.5, y: 0.98, w: 0.165, h: 0.26 },
  { s: 0.67, x: 0.68, y: 1.07, w: 0.1, h: 0.125 },
  { s: 0.73, x: 0.79, y: 1.21, w: 0.075, h: 0.088 },
  { s: 0.78, x: 0.88, y: 1.33, w: 0.07, h: 0.08 },
  { s: 0.83, x: 0.97, y: 1.41, w: 0.084, h: 0.11 },
  { s: 0.88, x: 1.08, y: 1.43, w: 0.088, h: 0.118 },
  { s: 0.93, x: 1.2, y: 1.4, w: 0.066, h: 0.092 },
  { s: 0.97, x: 1.3, y: 1.36, w: 0.045, h: 0.066 },
  { s: 1.0, x: 1.37, y: 1.33, w: 0.02, h: 0.03 },
];
const sample = (s: number) => {
  let i = 0;
  while (i < SPINE.length - 2 && SPINE[i + 1].s < s) i++;
  const a = SPINE[i];
  const b = SPINE[i + 1];
  const t = clamp((s - a.s) / (b.s - a.s), 0, 1);
  const k = t * t * (3 - 2 * t);
  return { x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) };
};
const bump = (s: number, c: number, w: number) => Math.exp(-((s - c) * (s - c)) / (2 * w * w));

type Pose = { tail: number; neck: number; bob: number; breathe: number; look: number };
const spineAt = (s: number, p: Pose): Vec3 => {
  const q = sample(s);
  const tailK = s < 0.46 ? (0.46 - s) / 0.46 : 0;
  const neckK = s > 0.64 ? (s - 0.64) / 0.36 : 0;
  return [q.x, q.y + p.bob + neckK * neckK * p.neck * 0.1 + tailK * 0.05 * Math.sin(p.tail * 0.7), tailK * tailK * 0.24 * Math.sin(p.tail - s * 6) + neckK * neckK * neckK * p.look * 0.12];
};

const N_S = 96;
const N_R = 20;

type Frame = { p: Vector3; up: Vector3; side: Vector3; w: number; h: number };

const useBody = (pose: Pose, pal: DinoPalette) =>
  useMemo(() => {
    const frames: Frame[] = [];
    for (let i = 0; i <= N_S; i++) {
      const s = i / N_S;
      const p = new Vector3(...spineAt(s, pose));
      const p2 = new Vector3(...spineAt(Math.min(1, s + 0.008), pose));
      const p1 = new Vector3(...spineAt(Math.max(0, s - 0.008), pose));
      const t = p2.sub(p1).normalize();
      const side = new Vector3().crossVectors(t, new Vector3(0, 1, 0)).normalize().multiplyScalar(-1);
      const up = new Vector3().crossVectors(t, side).normalize();
      const q = sample(s);
      const br = s > 0.44 && s < 0.64 ? 1 + 0.025 * pose.breathe : 1;
      frames.push({ p, up, side, w: q.w * br, h: q.h * br });
    }
    const c = {
      back: new Color(pal.back), side: new Color(pal.side), belly: new Color(pal.belly), stripe: new Color(pal.stripe), spot: new Color(pal.spot),
      fuzz: new Color(pal.fuzz), tip: new Color(pal.fuzzTip), mouth: new Color("#3a1814"), lip: new Color("#8a5a3a"),
    };
    /** raio do anel j (com mandíbula, sobrancelha e quilha da barriga) */
    const shape = (s: number, a: number, f: Frame) => {
      const ca = Math.cos(a);
      const sa = Math.sin(a);
      let w = f.w;
      let h = ca > 0 ? f.h : f.h * 1.08;
      // músculo da mandíbula (bochecha) e sobrancelha óssea
      const cheek = bump(s, 0.875, 0.018) * clamp(-ca + 0.2, 0, 1) * Math.abs(sa);
      const brow = bump(s, 0.885, 0.012) * clamp(ca - 0.25, 0, 1) * Math.abs(sa);
      w *= 1 + 0.3 * cheek + 0.35 * brow;
      // quilha do peito e linha do dorso levemente marcada
      h *= 1 + 0.06 * bump(s, 0.56, 0.05) * clamp(-ca, 0, 1) + 0.04 * clamp(ca - 0.85, 0, 1) * (s < 0.82 ? 1 : 0);
      return { w, h, ca, sa };
    };
    const pos: number[] = [];
    const col: number[] = [];
    const sPos: number[] = [];
    const sCol: number[] = [];
    frames.forEach((f, i) => {
      const s = i / N_S;
      for (let j = 0; j < N_R; j++) {
        const a = (j / N_R) * Math.PI * 2;
        const { w, h, ca, sa } = shape(s, a, f);
        const v = f.p.clone().addScaledVector(f.up, ca * h).addScaledVector(f.side, sa * w);
        pos.push(v.x, v.y, v.z);
        // ---- cor da pele
        const dorsal = clamp((ca - 0.05) / 0.75, 0, 1);
        const belly = clamp((-ca - 0.3) / 0.5, 0, 1);
        const k = c.side.clone().lerp(c.back, dorsal).lerp(c.belly, belly);
        const head = s > 0.82;
        if (!head && dorsal > 0.12 && s > 0.05 && Math.sin(s * 54) > 0.25) k.lerp(c.stripe, 0.85 * Math.min(1, dorsal * 1.5));
        // pintas nos flancos (hash por "célula")
        const cell = rand(`sp${Math.floor(i / 2)}_${Math.floor(j / 1)}`);
        if (!head && Math.abs(sa) > 0.45 && ca > -0.35 && ca < 0.55 && s > 0.08 && cell > 0.82) k.lerp(c.spot, 0.75);
        // placas da barriga
        if (belly > 0.55 && i % 3 === 0 && s > 0.2 && s < 0.66) k.multiplyScalar(0.9);
        // cabeça: máscara atrás do olho, focinho mais claro, boca
        if (s > 0.83 && s < 0.89 && Math.abs(sa) > 0.55 && ca > -0.15) k.lerp(c.stripe, 0.65);
        if (s > 0.93 && ca > -0.2) k.lerp(c.side, 0.35);
        if (s > 0.88 && s < 0.995 && ca > -0.52 && ca < -0.3) k.copy(c.mouth);
        else if (s > 0.88 && s < 0.995 && ca > -0.62 && ca < -0.52) k.lerp(c.lip, 0.6);
        col.push(k.r, k.g, k.b);
        // ---- casca de penugem
        const on = s > 0.03 && s < 0.85 ? 1 : 0;
        const fk = on * clamp((ca + 0.4) / 0.8, 0, 1);
        const noise = rand(`sh${i}_${j}`);
        const n = 1 + fk * (0.05 + 0.04 * noise) * (s > 0.64 ? 1.3 : 1) * (s < 0.2 ? 0.7 : 1);
        const vv = f.p.clone().addScaledVector(f.up, ca * h * n).addScaledVector(f.side, sa * w * n);
        sPos.push(vv.x, vv.y, vv.z);
        const kk = c.fuzz.clone().lerp(c.back, 0.55 * dorsal).lerp(c.tip, 0.45 * noise * fk);
        if (s > 0.05 && Math.sin(s * 54) > 0.25 && ca > 0.1) kk.lerp(c.stripe, 0.55);
        sCol.push(kk.r, kk.g, kk.b);
      }
    });
    const idx: number[] = [];
    for (let i = 0; i < N_S; i++)
      for (let j = 0; j < N_R; j++) {
        const a = i * N_R + j;
        const b = i * N_R + ((j + 1) % N_R);
        const cc = (i + 1) * N_R + j;
        const d = (i + 1) * N_R + ((j + 1) % N_R);
        idx.push(a, b, cc, b, d, cc);
      }
    const mk = (p: number[], k: number[]) => {
      const g = new BufferGeometry();
      g.setAttribute("position", new BufferAttribute(new Float32Array(p), 3));
      g.setAttribute("color", new BufferAttribute(new Float32Array(k), 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      return g;
    };
    return { g: mk(pos, col), shell: mk(sPos, sCol), frames };
  }, [pose.tail, pose.neck, pose.bob, pose.breathe, pose.look, pal]);

const UP = new Vector3(0, 1, 0);
const quatTo = (d: Vector3) => new Quaternion().setFromUnitVectors(UP, d.clone().normalize());
/** Músculo/osso elipsoide entre dois pontos: r = raio lateral, rf = raio frente-trás, k = quanto passa das pontas. */
const Ellip: React.FC<{ a: Vec3; b: Vec3; r: number; rf?: number; color: string; k?: number }> = ({ a, b, r, rf, color, k = 1.08 }) => {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const d = vb.clone().sub(va);
  const len = d.length();
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={quatTo(d)} scale={[rf ?? r, (len / 2) * k, r]} castShadow receiveShadow>
      <sphereGeometry args={[1, 18, 14]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
};
const Seg: React.FC<{ a: Vec3; b: Vec3; r1: number; r2: number; color: string; sides?: number }> = ({ a, b, r1, r2, color, sides = 10 }) => {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const d = vb.clone().sub(va);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  return (
    <mesh position={mid} quaternion={quatTo(d)} castShadow receiveShadow>
      <cylinderGeometry args={[r2, r1, d.length(), sides]} />
      <meshStandardMaterial color={color} roughness={0.75} />
    </mesh>
  );
};
const Ball: React.FC<{ p: Vec3; r: number; color: string; e?: number; s?: Vec3 }> = ({ p, r, color, e = 0, s }) => (
  <mesh position={p} scale={s} castShadow>
    <sphereGeometry args={[r, 16, 12]} />
    <meshStandardMaterial color={color} roughness={0.35} emissive={color} emissiveIntensity={e} />
  </mesh>
);
/** Garra curva (cone levemente dobrado em 2 partes). */
const Claw: React.FC<{ p: Vec3; dir: Vec3; len: number; r: number; color: string; curl?: number }> = ({ p, dir, len, r, color, curl = 0.5 }) => {
  const d = new Vector3(...dir).normalize();
  const down = new Vector3(0, -1, 0);
  const d2 = d.clone().lerp(down, curl).normalize();
  const m: Vec3 = [p[0] + d.x * len * 0.5, p[1] + d.y * len * 0.5, p[2] + d.z * len * 0.5];
  return (
    <group>
      <mesh position={[p[0] + d.x * len * 0.25, p[1] + d.y * len * 0.25, p[2] + d.z * len * 0.25]} quaternion={quatTo(d)}>
        <cylinderGeometry args={[r * 0.7, r, len * 0.5, 7]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
      <mesh position={[m[0] + d2.x * len * 0.25, m[1] + d2.y * len * 0.25, m[2] + d2.z * len * 0.25]} quaternion={quatTo(d2)}>
        <coneGeometry args={[r * 0.7, len * 0.5, 7]} />
        <meshStandardMaterial color={color} roughness={0.35} />
      </mesh>
    </group>
  );
};

const L1 = 0.4; // fêmur
const L2 = 0.46; // tíbia
const L3 = 0.26; // metatarso
const HIP_Y = 0.98;

const Leg: React.FC<{ side: 1 | -1; phase: number; walk: number; pal: DinoPalette; bob: number }> = ({ side, phase, walk, pal, bob }) => {
  const sw = Math.sin(phase);
  const lift = Math.max(0, Math.sin(phase + Math.PI / 2)) * walk;
  const a1 = 0.45 + 0.5 * sw * walk;
  const a2 = -0.6 - 0.45 * lift;
  const a3 = 0.28 + 0.35 * lift - 0.2 * sw * walk;
  const z = side * 0.14;
  const hip: Vec3 = [0.05, HIP_Y + bob, z];
  const knee: Vec3 = [hip[0] + L1 * Math.sin(a1), hip[1] - L1 * Math.cos(a1), z * 1.12];
  const ankle: Vec3 = [knee[0] + L2 * Math.sin(a2), knee[1] - L2 * Math.cos(a2), z * 1.04];
  const ball: Vec3 = [ankle[0] + L3 * Math.sin(a3), ankle[1] - L3 * Math.cos(a3), z];
  const calfTop: Vec3 = [lerp(knee[0], ankle[0], 0.05), lerp(knee[1], ankle[1], 0.05), knee[2]];
  const calfEnd: Vec3 = [lerp(knee[0], ankle[0], 0.6), lerp(knee[1], ankle[1], 0.6), lerp(knee[2], ankle[2], 0.6)];
  const toeA = 0.12 + 0.65 * lift;
  return (
    <group>
      {/* coxa: músculo grande que nasce dentro do corpo */}
      <Ellip a={[hip[0] - 0.02, hip[1] + 0.2, z * 0.4]} b={[knee[0], knee[1], knee[2] * 0.95]} r={0.095} rf={0.135} color={pal.thigh} k={1.04} />
      {/* panturrilha + canela */}
      <Ellip a={calfTop} b={calfEnd} r={0.06} rf={0.075} color={pal.side} />
      <Seg a={knee} b={ankle} r1={0.042} r2={0.03} color={pal.side} />
      <Ball p={ankle} r={0.034} color={pal.side} />
      {/* metatarso com placas claras na frente */}
      <Seg a={ankle} b={ball} r1={0.03} r2={0.024} color={pal.scute} />
      {/* dedinho de trás (dígito I) */}
      <Claw p={[lerp(ankle[0], ball[0], 0.7) - 0.02, lerp(ankle[1], ball[1], 0.7), lerp(ankle[2], ball[2], 0.7) - side * 0.008]} dir={[-0.7, -0.6, -side * 0.15]} len={0.035} r={0.009} color={pal.claw} curl={0.4} />
      {[-1, 0, 1].map((k) => {
        const spread = k * 0.38;
        const L = k === 0 ? 0.075 : 0.06;
        const d1: Vec3 = [Math.cos(toeA) * Math.cos(spread), -Math.sin(toeA) * 0.55, Math.sin(spread)];
        const j1: Vec3 = [ball[0] + d1[0] * L, Math.max(0.016, ball[1] + d1[1] * L), ball[2] + d1[2] * L];
        const d2: Vec3 = [Math.cos(toeA * 1.4) * Math.cos(spread), -Math.sin(toeA * 1.4) * 0.6, Math.sin(spread)];
        const j2: Vec3 = [j1[0] + d2[0] * L * 0.8, Math.max(0.014, j1[1] + d2[1] * L * 0.8), j1[2] + d2[2] * L * 0.8];
        return (
          <group key={k}>
            <Seg a={ball} b={j1} r1={0.02} r2={0.016} color={pal.scute} sides={7} />
            <Ball p={j1} r={0.017} color={pal.scute} />
            <Seg a={j1} b={j2} r1={0.016} r2={0.012} color={pal.scute} sides={7} />
            <Claw p={j2} dir={[d2[0], -0.15, d2[2]]} len={0.045} r={0.011} color={pal.claw} curl={0.7} />
          </group>
        );
      })}
    </group>
  );
};

const Arm: React.FC<{ side: 1 | -1; f: number; pal: DinoPalette; bob: number; feathers: number }> = ({ side, f, pal, bob, feathers }) => {
  const sh: Vec3 = [0.6, 0.9 + bob, side * 0.12];
  const el: Vec3 = [sh[0] + 0.05, sh[1] - 0.16, side * 0.165];
  const wr: Vec3 = [el[0] + 0.13, el[1] + 0.025 + 0.01 * Math.sin(f / 9), side * 0.155];
  return (
    <group>
      <Ellip a={sh} b={el} r={0.035} rf={0.045} color={pal.side} />
      <Seg a={el} b={wr} r1={0.026} r2={0.019} color={pal.side} />
      {[-1, 0, 1].map((k) => {
        const d: Vec3 = [0.55, -0.6, k * 0.22 + side * 0.05];
        const j: Vec3 = [wr[0] + d[0] * 0.045, wr[1] + d[1] * 0.045, wr[2] + d[2] * 0.045];
        return (
          <group key={k}>
            <Seg a={wr} b={j} r1={0.011} r2={0.009} color={pal.side} sides={6} />
            <Claw p={j} dir={[0.4, -0.9, k * 0.15]} len={0.05} r={0.008} color={pal.claw} curl={0.6} />
          </group>
        );
      })}
      {/* franja de penugem no antebraço */}
      {feathers > 0.01
        ? [0, 1, 2, 3, 4, 5].map((i) => {
            const t = i / 5;
            const p: Vec3 = [lerp(el[0], wr[0], t), lerp(el[1], wr[1], t) - 0.012, lerp(el[2], wr[2], t)];
            return <Claw key={`f${i}`} p={p} dir={[-0.8, -0.7, 0]} len={(0.035 + 0.012 * Math.sin(i * 2.3)) * feathers} r={0.008} color={i % 2 ? pal.fuzz : pal.back} curl={0.05} />;
          })
        : null}
    </group>
  );
};

export const Aratasaurus: React.FC<{ frame: number; walk?: number; feathers?: number; pal?: DinoPalette; ghost?: number; look?: number }> = ({ frame, walk = 0, feathers = 0, pal = ARATA_COLORS, ghost = 0, look = 0 }) => {
  const w = clamp(walk, 0, 1);
  const phase = frame * 0.2;
  const pose: Pose = {
    tail: frame * 0.06 * (1 + w),
    neck: Math.sin(frame / 37) + w * 0.6 * Math.sin(phase * 2),
    bob: w * 0.025 * Math.abs(Math.sin(phase)),
    breathe: Math.sin(frame / 18),
    look: look + 0.25 * Math.sin(frame / 53),
  };
  const { g, frames, shell } = useBody(pose, pal);
  const at = (s: number) => frames[Math.round(s * N_S)];
  const surf = (s: number, ca: number, sa: number, out = 1): Vec3 => {
    const fr = at(s);
    const v = fr.p.clone().addScaledVector(fr.up, ca * fr.h * out).addScaledVector(fr.side, sa * fr.w * out * 1.04);
    return [v.x, v.y, v.z];
  };
  const fuzz = useMemo(() => {
    if (feathers < 0.01) return [];
    const out: { p: Vec3; d: Vec3; len: number; c: number }[] = [];
    for (let n = 0; n < 520; n++) {
      const s = 0.04 + rand(`fs${n}`) * 0.8;
      const fr = frames[Math.round(s * N_S)];
      const a = (rand(`fa${n}`) - 0.5) * Math.PI * 1.25; // dorso e flancos
      const crest = Math.abs(a) < 0.35 && s > 0.62;
      const v = fr.p.clone().addScaledVector(fr.up, Math.cos(a) * fr.h * 1.03).addScaledVector(fr.side, Math.sin(a) * fr.w * 1.03);
      const nrm = fr.up.clone().multiplyScalar(Math.cos(a)).addScaledVector(fr.side, Math.sin(a));
      const d = nrm.multiplyScalar(crest ? 0.6 : 0.35).add(new Vector3(-1, -0.05, 0)).add(new Vector3((rand(`fx${n}`) - 0.5) * 0.4, (rand(`fy${n}`) - 0.5) * 0.3, (rand(`fz${n}`) - 0.5) * 0.4)).normalize();
      const len = (crest ? 0.05 : 0.026) * (0.7 + 0.6 * rand(`fl${n}`)) * (s < 0.2 ? 0.7 : 1);
      out.push({ p: [v.x, v.y, v.z], d: [d.x, d.y, d.z], len, c: rand(`fc${n}`) });
    }
    return out;
  }, [frames, feathers]);
  const op = 1 - clamp(ghost, 0, 0.9);
  const fe = clamp(feathers, 0, 1);
  return (
    <group>
      <mesh geometry={g} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.72} transparent={op < 1} opacity={op} />
      </mesh>
      {fe > 0.01 ? (
        <mesh geometry={shell} castShadow>
          <meshStandardMaterial vertexColors roughness={1} transparent opacity={fe * op} />
        </mesh>
      ) : null}
      {fuzz.map((z, i) => <Claw key={i} p={z.p} dir={z.d} len={z.len * fe} r={0.009} color={z.c > 0.7 ? pal.fuzzTip : z.c > 0.35 ? pal.fuzz : pal.back} curl={0.08} />)}
      {/* olhos: órbita escura, íris, pupila em fenda e brilho */}
      {([1, -1] as const).map((k) => {
        const e = surf(0.872, 0.38, k * 0.86);
        const o: Vec3 = [e[0], e[1], e[2]];
        return (
          <group key={k}>
            <Ball p={o} r={0.021} color={pal.eye} e={0.3} />
            <Ball p={[o[0] + 0.004, o[1], o[2] + k * 0.017]} r={0.011} color="#0e0a08" s={[0.45, 1.2, 0.5]} />
            <Ball p={[o[0] + 0.012, o[1] + 0.009, o[2] + k * 0.019]} r={0.004} color="#ffffff" e={1} />
          </group>
        );
      })}
      {/* dentes */}
      {([1, -1] as const).flatMap((k) =>
        [0.9, 0.912, 0.924, 0.936, 0.948, 0.96, 0.972, 0.984].map((s, i) => {
          const p = surf(s, -0.44, k * 0.92, 1.0);
          return <Claw key={`${k}${i}`} p={p} dir={[0.15, -1, k * 0.15]} len={0.026 - i * 0.0012} r={0.0065} color="#f6f1e4" curl={0.25} />;
        }),
      )}
      {/* narinas */}
      {([1, -1] as const).map((k) => <Ball key={`n${k}`} p={surf(0.982, 0.25, k * 0.8)} r={0.009} color="#120d0a" s={[1.4, 0.7, 0.8]} />)}
      <Leg side={1} phase={phase} walk={w} pal={pal} bob={pose.bob} />
      <Leg side={-1} phase={phase + Math.PI} walk={w} pal={pal} bob={pose.bob} />
      <Arm side={1} f={frame} pal={pal} bob={pose.bob} feathers={fe} />
      <Arm side={-1} f={frame} pal={pal} bob={pose.bob} feathers={fe} />
    </group>
  );
};
