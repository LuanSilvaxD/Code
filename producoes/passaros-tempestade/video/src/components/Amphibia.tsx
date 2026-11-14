import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// "O único anfíbio que vivia no mar" — elementos novos (aprovar na folha). METROS, de frente para +x, barriga em y = 0.
// Gerrothorax maritimus = RECONSTRUÇÃO ARTÍSTICA (partes moles não preservadas).

type Key = { x: number; y: number; w: number; h: number; sq?: number };
const cr = (p0: number, p1: number, p2: number, p3: number, t: number) => 0.5 * (2 * p1 + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t);
/** Interpolação Catmull-Rom entre as chaves (sem "degraus" de luz entre anéis). */
const sampleKeys = (keys: Key[], x: number) => {
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].x < x) i++;
  const a = keys[Math.max(0, i - 1)];
  const b = keys[i];
  const c = keys[i + 1];
  const d = keys[Math.min(keys.length - 1, i + 2)];
  const t = clamp((x - b.x) / (c.x - b.x), 0, 1);
  const f = (k: (q: Key) => number) => cr(k(a), k(b), k(c), k(d), t);
  return { y: f((q) => q.y), w: Math.max(0.001, f((q) => q.w)), h: Math.max(0.001, f((q) => q.h)), sq: f((q) => q.sq ?? 2) };
};

/** Loft de anéis (superelipses) ao longo de x. color(x, ang) devolve a cor do vértice (ang 0 = topo). bend(x) desloca em z. */
export const loft = (keys: Key[], color: (x: number, ang: number, u: number) => Color, nS = 72, nR = 22, bend: (x: number) => number = () => 0) => {
  const x0 = keys[0].x;
  const x1 = keys[keys.length - 1].x;
  const pos: number[] = [];
  const col: number[] = [];
  const idx: number[] = [];
  for (let i = 0; i <= nS; i++) {
    const u = i / nS;
    const x = lerp(x0, x1, u);
    const q = sampleKeys(keys, x);
    const zc = bend(x);
    for (let j = 0; j < nR; j++) {
      const a = (j / nR) * Math.PI * 2;
      const c = Math.cos(a);
      const s = Math.sin(a);
      const e = 2 / q.sq;
      const yy = Math.sign(c) * Math.pow(Math.abs(c), e) * q.h;
      const zz = Math.sign(s) * Math.pow(Math.abs(s), e) * q.w;
      pos.push(x, q.y + yy, zc + zz);
      const cc = color(x, a, u);
      col.push(cc.r, cc.g, cc.b);
    }
  }
  for (let i = 0; i < nS; i++)
    for (let j = 0; j < nR; j++) {
      const a = i * nR + j;
      const b = i * nR + ((j + 1) % nR);
      const c = (i + 1) * nR + j;
      const d = (i + 1) * nR + ((j + 1) % nR);
      idx.push(a, b, c, b, d, c);
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
  g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

const C = (h: string) => new Color(h);
const M = { roughness: 0.75, metalness: 0, flatShading: true } as const;

/* ------------------------------------------------------------------ GERROTHORAX (v2) */

export const GERRO = { back: "#5b5a3a", back2: "#3a3a24", blotch: "#2e2e1c", belly: "#d6c99a", lip: "#8a7e52", plate: "#6a6646", plateDark: "#4a4830", eye: "#e8a62a", gill: "#b8605a", gillTip: "#e09080" };
// Corpo: cabeça em meia-lua mais larga que longa, pescoço mais estreito, ombros, cintura, quadril e cauda achatada lateralmente (remo).
const GKEYS: Key[] = [
  { x: -0.48, y: 0.06, w: 0.004, h: 0.012, sq: 2 },
  { x: -0.43, y: 0.062, w: 0.007, h: 0.04, sq: 2 },
  { x: -0.35, y: 0.064, w: 0.016, h: 0.058, sq: 2.1 },
  { x: -0.27, y: 0.064, w: 0.045, h: 0.06, sq: 2.3 },
  { x: -0.2, y: 0.066, w: 0.105, h: 0.064, sq: 2.6 },
  { x: -0.15, y: 0.066, w: 0.125, h: 0.066, sq: 2.8 },
  { x: -0.07, y: 0.064, w: 0.112, h: 0.06, sq: 2.8 },
  { x: 0.03, y: 0.066, w: 0.135, h: 0.066, sq: 2.9 },
  { x: 0.1, y: 0.062, w: 0.125, h: 0.056, sq: 3 },
  { x: 0.15, y: 0.058, w: 0.19, h: 0.05, sq: 3.4 },
  { x: 0.21, y: 0.055, w: 0.235, h: 0.046, sq: 3.8 },
  { x: 0.28, y: 0.052, w: 0.232, h: 0.043, sq: 3.8 },
  { x: 0.35, y: 0.049, w: 0.2, h: 0.038, sq: 3.6 },
  { x: 0.41, y: 0.046, w: 0.14, h: 0.031, sq: 3.2 },
  { x: 0.445, y: 0.043, w: 0.075, h: 0.024, sq: 2.8 },
  { x: 0.46, y: 0.042, w: 0.02, h: 0.014, sq: 2.4 },
];
const gTop = (x: number, z: number) => {
  const q = sampleKeys(GKEYS, x);
  const e = Math.min(1, Math.abs(z) / q.w);
  return q.y + q.h * Math.pow(Math.max(0, 1 - Math.pow(e, q.sq)), 1 / q.sq);
};

/** Gerrothorax maritimus (~0,94 m), v2. swim 0..1 ondula a cauda-remo; armor 0..1 mostra as fileiras de placas;
 *  mouth 0..1 abre a boca; gills 0..1 brânquias externas (o gênero tinha; incerto na espécie); ghost 0..1 silhueta. */
export const Gerrothorax: React.FC<{ f: number; swim?: number; armor?: number; mouth?: number; gills?: number; ghost?: number }> = ({ f, swim = 0, armor = 1, mouth = 0, gills = 1, ghost = 0 }) => {
  const ph = f * 0.16;
  const tailA = swim * 0.07;
  const bend = (x: number) => (x < -0.12 ? Math.sin(ph - x * 9) * tailA * Math.pow((-0.12 - x) / 0.36, 1.6) : 0);
  const geo = useMemo(() => {
    const back = C(GERRO.back);
    const back2 = C(GERRO.back2);
    const blotch = C(GERRO.blotch);
    const belly = C(GERRO.belly);
    const lip = C(GERRO.lip);
    return loft(
      GKEYS,
      (x, a) => {
        const top = Math.cos(a);
        if (top < -0.3) return belly.clone();
        const n = rand(`gb${Math.round(x * 22)}${Math.round(Math.sin(a) * 6)}`);
        let c = back.clone().lerp(back2, 0.25 + 0.25 * Math.sin(x * 18 + a));
        if (n > 0.78) c = c.lerp(blotch, 0.65);
        if (x > 0.15 && top < 0.15 && top > -0.3) c = c.lerp(lip, 0.5);
        return top < 0.05 ? c.lerp(belly, 0.3 * ((0.05 - top) / 0.35)) : c;
      },
      96,
      28,
      bend,
    );
  }, [ph, tailA]);
  // fileiras de placas só no dorso: central maior, paramedianas médias, laterais pequenas
  const plates = useMemo(() => {
    const out: { p: Vec3; sx: number; sz: number; dark: boolean }[] = [];
    for (let i = 0; i < 13; i++) {
      const x = -0.22 + i * 0.027;
      const q = sampleKeys(GKEYS, x);
      [
        { z: 0, s: 0.017 },
        { z: 0.32, s: 0.013 },
        { z: -0.32, s: 0.013 },
        { z: 0.6, s: 0.009 },
        { z: -0.6, s: 0.009 },
      ].forEach((r, j) => {
        const z = r.z * q.w;
        out.push({ p: [x, gTop(x, z) - 0.002, z], sx: r.s * (1 + 0.15 * rand(`pl${i}${j}`)), sz: r.s * 0.8, dark: (i + j) % 3 === 0 });
      });
    }
    return out;
  }, []);
  // placas do crânio: poucas, grandes e de baixo contraste
  const skull = useMemo(() => {
    const out: { p: Vec3; s: number; r: number; n: number }[] = [];
    for (let i = 0; i < 26; i++) {
      const x = 0.17 + rand(`skx${i}`) * 0.26;
      const q = sampleKeys(GKEYS, x);
      const z = (rand(`skz${i}`) - 0.5) * q.w * 1.6;
      if (Math.hypot(x - 0.27, Math.abs(z) - 0.08) < 0.05) continue;
      out.push({ p: [x, gTop(x, z) - 0.0015, z], s: 0.02 + rand(`sks${i}`) * 0.012, r: rand(`skr${i}`) * 3, n: 5 + Math.floor(rand(`skn${i}`) * 3) });
    }
    return out;
  }, []);
  // lábio: contorno da cabeça um pouco abaixo da linha lateral
  const lipCurve = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = 0.16 + (0.455 - 0.16) * Math.sin(t * Math.PI);
      const side = t < 0.5 ? 1 : -1;
      const q = sampleKeys(GKEYS, x);
      pts.push(new Vector3(x, q.y - q.h * 0.25, side * q.w * 0.985 * (t === 0.5 ? 0 : 1)));
    }
    return new CatmullRomCurve3(pts);
  }, []);
  const grooves = useMemo(() => {
    const mk = (pts: [number, number][]) => new CatmullRomCurve3(pts.map(([x, z]) => new Vector3(x, gTop(x, z) + 0.0015, z)));
    return [1, -1].map((sd) => mk([[0.2, sd * 0.13], [0.27, sd * 0.16], [0.35, sd * 0.14], [0.41, sd * 0.07]]));
  }, []);
  const k = clamp(armor, 0, 1);
  const G = ghost > 0.5;
  const ghostC = "#0e1424";
  const mat = (c: string, rough = 0.8) => (G ? <meshBasicMaterial color={ghostC} /> : <meshStandardMaterial color={c} roughness={rough} flatShading />);
  const limb = (x: number, z: number, big: number, i: number) => {
    const q = sampleKeys(GKEYS, x);
    const st = Math.sin(ph + i * 1.7) * 0.3 * swim;
    return (
      <group key={`limb${i}`} position={[x, 0.05, z * q.w * 0.92]} rotation={[0, z * (0.25 + st) - (x < 0 ? 0.35 * z : -0.2 * z), 0]}>
        {/* braço/coxa: sai para o lado e desce */}
        <group rotation={[z * 0.55, 0, 0]}>
          <mesh position={[0, 0, z * 0.035 * big]} rotation={[Math.PI / 2, 0, 0]} scale={[0.026 * big, 0.075 * big, 0.022 * big]}>
            <cylinderGeometry args={[1, 0.75, 1, 8]} />
            {mat(GERRO.back)}
          </mesh>
          {/* antebraço/canela: dobra para baixo */}
          <group position={[0, 0, z * 0.072 * big]} rotation={[-z * 1.0, 0, 0]}>
            <mesh position={[0, 0, z * 0.025 * big]} rotation={[Math.PI / 2, 0, 0]} scale={[0.018 * big, 0.055 * big, 0.016 * big]}>
              <cylinderGeometry args={[1, 0.8, 1, 8]} />
              {mat(GERRO.back2)}
            </mesh>
            {/* mão/pé com membrana */}
            <group position={[0.006, 0, z * 0.052 * big]} rotation={[z * 0.5, 0, 0]}>
              <mesh scale={[0.03 * big, 0.004, 0.026 * big]}>
                <sphereGeometry args={[1, 10, 6]} />
                {mat(GERRO.back2)}
              </mesh>
              {[-1.2, -0.4, 0.4, 1.2].map((d) => (
                <mesh key={d} position={[Math.cos(d * 0.5) * 0.03 * big, -0.001, z * (0.012 + Math.abs(d) * 0.004) * big + Math.sin(d * 0.5) * 0.02 * big]} rotation={[0, -d * 0.45, 0]} scale={[0.022 * big, 0.005, 0.006 * big]}>
                  <sphereGeometry args={[1, 8, 4]} />
                  {mat(GERRO.back)}
                </mesh>
              ))}
            </group>
          </group>
        </group>
      </group>
    );
  };
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        {G ? <meshBasicMaterial color={ghostC} /> : <meshStandardMaterial vertexColors roughness={0.72} flatShading />}
      </mesh>
      {/* fileiras de placas (dorso) */}
      {k > 0.01 && !G
        ? plates.map((q, i) => (
            <mesh key={`p${i}`} position={[q.p[0] + bend(q.p[0]) * 0, q.p[1], q.p[2] + bend(q.p[0])]} scale={[q.sx * k, 0.006 * k + 0.001, q.sz * k]}>
              <sphereGeometry args={[1, 7, 4]} />
              <meshStandardMaterial color={q.dark ? GERRO.plateDark : GERRO.plate} roughness={0.9} flatShading />
            </mesh>
          ))
        : null}
      {/* placas do crânio (relevo sutil) */}
      {k > 0.01 && !G
        ? skull.map((q, i) => (
            <mesh key={`sk${i}`} position={q.p} rotation={[0, q.r, 0]} scale={[q.s * k, 0.0022, q.s * 0.85 * k]}>
              <cylinderGeometry args={[1, 1.1, 1, q.n]} />
              <meshStandardMaterial color={i % 2 ? GERRO.back : GERRO.back2} roughness={0.95} flatShading />
            </mesh>
          ))
        : null}
      {/* sulcos sensoriais (bem sutis) */}
      {!G
        ? grooves.map((c, i) => (
            <mesh key={`gr${i}`}>
              <tubeGeometry args={[c, 20, 0.0022, 4, false]} />
              <meshStandardMaterial color={GERRO.back2} roughness={1} />
            </mesh>
          ))
        : null}
      {/* lábio */}
      {!G ? (
        <mesh>
          <tubeGeometry args={[lipCurve, 60, 0.0045, 5, false]} />
          <meshStandardMaterial color={GERRO.lip} roughness={0.8} />
        </mesh>
      ) : null}
      {/* olhos grandes no topo, com pálpebra */}
      {[-1, 1].map((z) => (
        <group key={`e${z}`} position={[0.27, gTop(0.27, z * 0.08) - 0.004, z * 0.08]}>
          <mesh scale={[0.034, 0.024, 0.032]}>
            <sphereGeometry args={[1, 14, 10]} />
            {mat(GERRO.back2)}
          </mesh>
          <mesh position={[0.004, 0.012, 0]} scale={[0.024, 0.017, 0.023]}>
            <sphereGeometry args={[1, 14, 10]} />
            {G ? <meshBasicMaterial color={ghostC} /> : <meshStandardMaterial color={GERRO.eye} roughness={0.25} />}
          </mesh>
          <mesh position={[0.008, 0.026, 0]} scale={[0.004, 0.004, 0.014]}>
            <sphereGeometry args={[1, 8, 4]} />
            <meshBasicMaterial color="#0b0812" />
          </mesh>
          <mesh position={[0.012, 0.024, z * 0.006]}>
            <sphereGeometry args={[0.003, 6, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {/* pálpebra superior (meio anel) */}
          <mesh position={[-0.002, 0.016, 0]} rotation={[Math.PI / 2, 0, Math.PI / 2]} scale={[1, 1, 0.6]}>
            <torusGeometry args={[0.024, 0.006, 6, 16, Math.PI]} />
            {mat(GERRO.back)}
          </mesh>
        </group>
      ))}
      {/* narinas */}
      {[-1, 1].map((z) => (
        <mesh key={`n${z}`} position={[0.43, gTop(0.43, z * 0.045) - 0.001, z * 0.045]} scale={[0.007, 0.003, 0.005]}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshBasicMaterial color="#14100a" />
        </mesh>
      ))}
      {/* boca: interior escuro + mandíbula que desce para sugar */}
      {mouth > 0.02 ? (
        <mesh position={[0.32, 0.03, 0]} scale={[0.12, 0.012, 0.19]}>
          <sphereGeometry args={[1, 16, 6]} />
          <meshBasicMaterial color="#3a1416" />
        </mesh>
      ) : null}
      <group position={[0.17, 0.028, 0]} rotation={[0, 0, -0.5 * clamp(mouth, 0, 1)]}>
        <mesh position={[0.135, -0.004, 0]} scale={[0.14, 0.012, 0.215]}>
          <sphereGeometry args={[1, 18, 6]} />
          {mat(GERRO.belly)}
        </mesh>
      </group>
      {/* brânquias externas: 3 hastes plumosas de cada lado, viradas para trás */}
      {gills > 0.01
        ? [-1, 1].flatMap((z) =>
            [0, 1, 2].map((j) => {
              const sway = 0.15 * Math.sin(f / 10 + j + z);
              return (
                <group key={`g${z}${j}`} position={[0.135 - j * 0.012, 0.072 - j * 0.006, z * (0.15 - j * 0.004)]} rotation={[z * (0.35 + j * 0.15), z * (0.9 + j * 0.3) + sway, -0.15]} scale={gills}>
                  <mesh position={[-0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.004, 0.06, 0.004]}>
                    <cylinderGeometry args={[0.6, 1, 1, 5]} />
                    {mat(GERRO.gill)}
                  </mesh>
                  {[0, 1, 2, 3, 4, 5].map((m) => (
                    <mesh key={m} position={[-0.012 - m * 0.009, 0.003, (m % 2 ? 1 : -1) * 0.006]} rotation={[0, (m % 2 ? 1 : -1) * 0.8, 0]} scale={[0.004, 0.003, 0.012 - m * 0.0012]}>
                      <sphereGeometry args={[1, 6, 4]} />
                      {mat(m > 3 ? GERRO.gillTip : GERRO.gill)}
                    </mesh>
                  ))}
                </group>
              );
            }),
          )
        : null}
      {/* patas: dianteiras menores, traseiras maiores */}
      {limb(0.055, 1, 0.9, 0)}
      {limb(0.055, -1, 0.9, 1)}
      {limb(-0.17, 1, 1.1, 2)}
      {limb(-0.17, -1, 1.1, 3)}
    </group>
  );
};

/* ------------------------------------------------------------------ ANFÍBIOS DE HOJE */

export const Frog: React.FC<{ f: number; color?: string; shrink?: number; hop?: number }> = ({ f, color = "#4f9a3a", shrink = 1, hop = 0 }) => {
  const y = Math.abs(Math.sin(f * 0.2)) * 0.06 * hop;
  const belly = "#e2e6a8";
  return (
    <group position={[0, y, 0]} scale={[shrink, shrink * (0.85 + 0.15 * shrink), shrink]}>
      <mesh position={[0, 0.07, 0]} scale={[0.11, 0.065, 0.09]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={color} {...M} />
      </mesh>
      <mesh position={[0, 0.045, 0]} scale={[0.1, 0.04, 0.085]}>
        <sphereGeometry args={[1, 14, 10]} />
        <meshStandardMaterial color={belly} {...M} />
      </mesh>
      {[-1, 1].map((z) => (
        <group key={z}>
          <mesh position={[0.06, 0.13, z * 0.045]}>
            <sphereGeometry args={[0.026, 10, 8]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
          <mesh position={[0.072, 0.145, z * 0.05]}>
            <sphereGeometry args={[0.016, 8, 6]} />
            <meshStandardMaterial color="#1a1208" roughness={0.3} />
          </mesh>
          <mesh position={[-0.05, 0.035, z * 0.09]} rotation={[0, 0, 0.3]} scale={[0.07, 0.025, 0.035]}>
            <sphereGeometry args={[1, 10, 6]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
          <mesh position={[0.06, 0.02, z * 0.07]} scale={[0.02, 0.03, 0.02]}>
            <sphereGeometry args={[1, 8, 6]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
        </group>
      ))}
    </group>
  );
};

export const Salamander: React.FC<{ f: number; color?: string; spots?: string }> = ({ f, color = "#1e1e24", spots = "#f2c21a" }) => {
  const geo = useMemo(
    () =>
      loft(
        [
          { x: -0.2, y: 0.02, w: 0.004, h: 0.005 },
          { x: -0.1, y: 0.022, w: 0.014, h: 0.016 },
          { x: 0.0, y: 0.025, w: 0.024, h: 0.02 },
          { x: 0.08, y: 0.025, w: 0.022, h: 0.019 },
          { x: 0.12, y: 0.026, w: 0.026, h: 0.017 },
          { x: 0.16, y: 0.024, w: 0.016, h: 0.012 },
        ],
        (x, a) => (rand(`sal${Math.round(x * 60)}${Math.round(a * 3)}`) > 0.82 && Math.cos(a) > 0 ? C(spots) : C(color)),
        48,
        14,
        (x) => Math.sin(x * 18 + f * 0.1) * 0.012,
      ),
    [f, color, spots],
  );
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial vertexColors {...M} />
      </mesh>
      {[0.07, -0.03].flatMap((x) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x, 0.01, z * 0.035]} rotation={[z * 0.6, 0, 0]} scale={[0.008, 0.02, 0.008]}>
            <cylinderGeometry args={[1, 1, 1, 5]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
        )),
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ ICTIOSSAURO */

export const Ichthyosaur: React.FC<{ f: number; color?: string }> = ({ f, color = "#4a6a8a" }) => {
  const ph = f * 0.2;
  const geo = useMemo(
    () =>
      loft(
        [
          { x: -1.4, y: 0, w: 0.02, h: 0.03 },
          { x: -1.0, y: 0, w: 0.08, h: 0.12 },
          { x: -0.4, y: 0, w: 0.22, h: 0.3 },
          { x: 0.2, y: 0, w: 0.26, h: 0.34 },
          { x: 0.6, y: 0.02, w: 0.2, h: 0.26 },
          { x: 0.85, y: 0.02, w: 0.12, h: 0.14 },
          { x: 1.15, y: 0.0, w: 0.04, h: 0.05 },
          { x: 1.45, y: -0.02, w: 0.015, h: 0.018 },
        ],
        (_x, a) => (Math.cos(a) < -0.2 ? C("#d9dcc8") : C(color)),
        64,
        18,
        (x) => (x < -0.3 ? Math.sin(ph - x * 2.2) * 0.12 * ((-0.3 - x) / 1.1) : 0),
      ),
    [ph, color],
  );
  return (
    <group>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial vertexColors {...M} />
      </mesh>
      {/* barbatana dorsal */}
      <mesh position={[0.05, 0.42, 0]} rotation={[0, 0, -0.5]} scale={[0.22, 0.2, 0.025]}>
        <coneGeometry args={[1, 1.2, 3]} />
        <meshStandardMaterial color={color} {...M} />
      </mesh>
      {/* cauda em lua (vertical) */}
      <group position={[-1.4, 0, Math.sin(ph + 3) * 0.12]}>
        {[1, -1].map((s) => (
          <mesh key={s} position={[-0.12, s * 0.28, 0]} rotation={[0, 0, s * 0.7]} scale={[0.1, 0.34, 0.025]}>
            <sphereGeometry args={[1, 10, 6]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
        ))}
      </group>
      {/* nadadeiras */}
      {[0.35, -0.55].flatMap((x, i) =>
        [-1, 1].map((z) => (
          <mesh key={`${x}${z}`} position={[x, -0.18, z * 0.24]} rotation={[z * 0.6, z * 0.3, 0.3 + 0.15 * Math.sin(ph + i)]} scale={[0.22 - i * 0.07, 0.03, 0.08]}>
            <sphereGeometry args={[1, 10, 6]} />
            <meshStandardMaterial color={color} {...M} />
          </mesh>
        )),
      )}
      {/* olho grande */}
      {[-1, 1].map((z) => (
        <mesh key={`e${z}`} position={[0.88, 0.06, z * 0.11]}>
          <sphereGeometry args={[0.05, 10, 8]} />
          <meshStandardMaterial color="#14101a" roughness={0.2} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ PELE EM CORTE (esquema) */

export const SkinBlock: React.FC<{ f: number; flow?: number; out?: number; salt?: number }> = ({ f, flow = 0, out = 0, salt = 0 }) => (
  <group>
    {/* camadas */}
    {[
      { y: 0.25, h: 0.12, c: "#6aa86a" },
      { y: 0.1, h: 0.18, c: "#e8b0a0" },
      { y: -0.15, h: 0.32, c: "#d88a7a" },
    ].map((l, i) => (
      <mesh key={i} position={[0, l.y, 0]}>
        <boxGeometry args={[2.4, l.h, 1.4]} />
        <meshStandardMaterial color={l.c} roughness={0.8} />
      </mesh>
    ))}
    {/* moléculas de água atravessando para dentro (flow) ou para fora (out) */}
    {Array.from({ length: 22 }, (_, i) => {
      const t = (((f * 0.012 + rand(`w${i}`)) % 1) + 1) % 1;
      const x = -1.05 + rand(`wx${i}`) * 2.1;
      const z = -0.6 + rand(`wz${i}`) * 1.2;
      const dir = out > 0.5 ? 1 : -1;
      const y = dir > 0 ? -0.2 + t * 1.1 : 0.9 - t * 1.1;
      const v = Math.max(flow, out);
      if (v < 0.01) return null;
      return (
        <mesh key={i} position={[x, y, z]} scale={0.06 * clamp(v, 0, 1)}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#4aa8ff" roughness={0.3} />
        </mesh>
      );
    })}
    {/* sal (cubinhos brancos) por cima */}
    {salt > 0.01
      ? Array.from({ length: 30 }, (_, i) => (
          <mesh key={`s${i}`} position={[-1.1 + rand(`sx${i}`) * 2.2, 0.45 + rand(`sy${i}`) * 0.5, -0.6 + rand(`sz${i}`) * 1.2]} rotation={[rand(`r1${i}`), rand(`r2${i}`), 0]} scale={0.045 * clamp(salt, 0, 1)}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#f4f4f0" roughness={0.4} />
          </mesh>
        ))
      : null}
  </group>
);

/* ------------------------------------------------------------------ FÓSSIL NA LAJE */

export const FossilSlab: React.FC<{ s?: number; seed?: string }> = ({ s = 1, seed = "a" }) => (
  <group scale={s}>
    <mesh position={[0, -0.03, 0]} receiveShadow>
      <boxGeometry args={[1.2, 0.06, 0.75]} />
      <meshStandardMaterial color="#9a8a72" roughness={1} flatShading />
    </mesh>
    {/* crânio largo (contorno em ferradura) */}
    <mesh position={[0.32, 0.005, 0]} rotation={[-Math.PI / 2, 0, -Math.PI / 2]}>
      <ringGeometry args={[0.13, 0.2, 20, 1, 0, Math.PI]} />
      <meshStandardMaterial color="#e8dcc0" roughness={0.9} side={2} />
    </mesh>
    {[-1, 1].map((z) => (
      <mesh key={z} position={[0.36, 0.01, z * 0.07]}>
        <torusGeometry args={[0.03, 0.008, 4, 10]} />
        <meshStandardMaterial color="#e8dcc0" roughness={0.9} />
      </mesh>
    ))}
    {/* coluna e costelas */}
    {Array.from({ length: 16 }, (_, i) => {
      const x = 0.15 - i * 0.04;
      const w = i < 9 ? 0.13 - i * 0.004 : 0.04;
      return (
        <group key={i} position={[x, 0.008, (rand(`${seed}${i}`) - 0.5) * 0.01]}>
          <mesh scale={[0.015, 0.012, 0.022]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#e8dcc0" roughness={0.9} />
          </mesh>
          {i < 9
            ? [-1, 1].map((z) => (
                <mesh key={z} position={[0, 0, z * w * 0.5]} rotation={[0, z * 0.25, 0]} scale={[0.008, 0.008, w]}>
                  <boxGeometry args={[1, 1, 1]} />
                  <meshStandardMaterial color="#ddd0b0" roughness={0.9} />
                </mesh>
              ))
            : null}
        </group>
      );
    })}
    {/* placas espalhadas */}
    {Array.from({ length: 24 }, (_, i) => (
      <mesh key={`p${i}`} position={[-0.25 + rand(`${seed}px${i}`) * 0.5, 0.004, -0.16 + rand(`${seed}pz${i}`) * 0.32]} rotation={[0, rand(`${seed}pr${i}`) * 3, 0]} scale={[0.02, 0.004, 0.018]}>
        <cylinderGeometry args={[1, 1, 1, 6]} />
        <meshStandardMaterial color="#cfc2a2" roughness={0.9} />
      </mesh>
    ))}
  </group>
);
