import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// "O único anfíbio que vivia no mar" — elementos novos (aprovar na folha). METROS, de frente para +x, barriga em y = 0.
// Gerrothorax maritimus = RECONSTRUÇÃO ARTÍSTICA (partes moles não preservadas).

type Key = { x: number; y: number; w: number; h: number; sq?: number };
const sampleKeys = (keys: Key[], x: number) => {
  let i = 0;
  while (i < keys.length - 2 && keys[i + 1].x < x) i++;
  const a = keys[i];
  const b = keys[i + 1];
  const t = clamp((x - a.x) / (b.x - a.x), 0, 1);
  const k = t * t * (3 - 2 * t);
  return { y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k), sq: lerp(a.sq ?? 2, b.sq ?? 2, k) };
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
      const cc = color(x, a, u).clone().convertSRGBToLinear();
      col.push(cc.r, cc.g, cc.b);
    }
  }
  for (let i = 0; i < nS; i++)
    for (let j = 0; j < nR; j++) {
      const a = i * nR + j;
      const b = i * nR + ((j + 1) % nR);
      const c = (i + 1) * nR + j;
      const d = (i + 1) * nR + ((j + 1) % nR);
      idx.push(a, c, b, b, c, d);
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

/* ------------------------------------------------------------------ GERROTHORAX */

export const GERRO = { back: "#56603e", back2: "#343c26", belly: "#c9bf92", scute: "#6e7248", scuteDark: "#3e4228", eye: "#f2b23a", gill: "#d86a6a" };
const GKEYS: Key[] = [
  { x: -0.46, y: 0.05, w: 0.01, h: 0.012, sq: 2 },
  { x: -0.36, y: 0.05, w: 0.035, h: 0.03, sq: 2.2 },
  { x: -0.24, y: 0.055, w: 0.09, h: 0.045, sq: 2.8 },
  { x: -0.1, y: 0.06, w: 0.15, h: 0.06, sq: 3.2 },
  { x: 0.05, y: 0.06, w: 0.165, h: 0.062, sq: 3.4 },
  { x: 0.13, y: 0.055, w: 0.18, h: 0.052, sq: 3.6 },
  { x: 0.2, y: 0.05, w: 0.245, h: 0.045, sq: 4 },
  { x: 0.3, y: 0.048, w: 0.25, h: 0.042, sq: 4 },
  { x: 0.38, y: 0.045, w: 0.22, h: 0.036, sq: 3.6 },
  { x: 0.43, y: 0.042, w: 0.15, h: 0.03, sq: 3 },
  { x: 0.455, y: 0.04, w: 0.06, h: 0.02, sq: 2.4 },
];

/** Gerrothorax maritimus (~0,9 m). swim 0..1 ondula a cauda; armor 0..1 acende as placas; mouth 0..1 abre a boca;
 *  gills 0..1 brânquias externas (o gênero tinha; incerto na espécie); ghost 0..1 vira silhueta escura. */
export const Gerrothorax: React.FC<{ f: number; swim?: number; armor?: number; mouth?: number; gills?: number; ghost?: number }> = ({ f, swim = 0, armor = 1, mouth = 0, gills = 1, ghost = 0 }) => {
  const ph = f * 0.18;
  const tailK = swim * 0.06;
  const geo = useMemo(() => {
    const back = C(GERRO.back);
    const back2 = C(GERRO.back2);
    const belly = C(GERRO.belly);
    return loft(GKEYS, (x, a) => {
      const top = Math.cos(a); // 1 topo, -1 barriga
      if (top < -0.35) return belly.clone();
      const spot = rand(`gs${Math.round(x * 40)}${Math.round(a * 4)}`) > 0.72;
      const c = back.clone().lerp(back2, spot ? 0.75 : 0.2 + 0.15 * Math.sin(x * 30));
      return top < 0.0 ? c.lerp(belly, 0.25 * (-top / 0.35)) : c;
    }, 80, 24, (x) => (x < -0.08 ? Math.sin(ph - x * 10) * tailK * Math.pow((-0.08 - x) / 0.38, 1.5) : 0));
  }, [ph, tailK]);
  // ARMADURA (v2): mosaico de placas grandes e esculpidas no crânio, fileiras de osteodermos no dorso
  // (fileira do meio maior, laterais menores), espinhos na borda e sulcos da linha lateral na cabeça.
  const surfY = (x: number, z: number) => {
    const q = sampleKeys(GKEYS, x);
    const edge = Math.min(1, Math.abs(z) / q.w);
    return q.y + q.h * Math.pow(Math.max(0, 1 - Math.pow(edge, 4)), 0.25);
  };
  const scutes = useMemo(() => {
    type Sc = { p: Vec3; s: number; r: number; dark: boolean; tub: number; head: boolean; sides: number };
    const out: Sc[] = [];
    // crânio: placas poligonais grandes com jitter, evitando as órbitas
    for (let ix = 0; ix < 9; ix++)
      for (let iz = -6; iz <= 6; iz++) {
        const x = 0.165 + ix * 0.032 + (rand(`hx${ix}${iz}`) - 0.5) * 0.01;
        const q = sampleKeys(GKEYS, x);
        const z = iz * 0.036 + (ix % 2) * 0.018 + (rand(`hz${ix}${iz}`) - 0.5) * 0.01;
        if (Math.abs(z) > q.w * 0.86) continue;
        if (Math.hypot(x - 0.29, Math.abs(z) - 0.075) < 0.04) continue;
        out.push({ p: [x, surfY(x, z) - 0.003, z], s: 0.016 + rand(`hs${ix}${iz}`) * 0.006, r: rand(`hr${ix}${iz}`) * Math.PI, dark: rand(`hd${ix}${iz}`) > 0.7, tub: 0.2, head: true, sides: 5 + Math.floor(rand(`hn${ix}${iz}`) * 3) });
      }
    // dorso: fileiras de osteodermos
    for (let ix = 0; ix < 15; ix++) {
      const x = -0.235 + ix * 0.027;
      const q = sampleKeys(GKEYS, x);
      const rows = Math.max(1, Math.round((q.w * 1.7) / 0.032));
      for (let iz = 0; iz <= rows; iz++) {
        const t = rows === 0 ? 0.5 : iz / rows;
        const z = (t - 0.5) * q.w * 1.7 + (ix % 2 ? 0.008 : -0.008);
        const mid = 1 - Math.min(1, Math.abs(z) / (q.w * 0.85));
        out.push({ p: [x + (rand(`bx${ix}${iz}`) - 0.5) * 0.008, surfY(x, z) - 0.002, z], s: 0.009 + 0.009 * mid + rand(`bs${ix}${iz}`) * 0.003, r: rand(`br${ix}${iz}`) * Math.PI, dark: rand(`bd${ix}${iz}`) > 0.55, tub: 0.5 + 0.8 * mid * rand(`bt${ix}${iz}`), head: false, sides: 6 });
      }
    }
    return out;
  }, []);
  const spikes = useMemo(() => {
    const out: { p: Vec3; ang: number; s: number }[] = [];
    for (let i = 0; i < 18; i++) {
      const x = -0.3 + i * 0.03;
      const q = sampleKeys(GKEYS, x);
      [-1, 1].forEach((z) => out.push({ p: [x, q.y + q.h * 0.15, z * q.w * 0.98], ang: z, s: 0.008 + rand(`sp${i}${z}`) * 0.006 }));
    }
    return out;
  }, []);
  const grooves = useMemo(() => {
    const mk = (pts: [number, number][]) => new CatmullRomCurve3(pts.map(([x, z]) => new Vector3(x, surfY(x, z) + 0.003, z)));
    return [1, -1].flatMap((sd) => [
      mk([[0.2, sd * 0.06], [0.27, sd * 0.13], [0.36, sd * 0.17], [0.42, sd * 0.1], [0.44, sd * 0.02]]),
      mk([[0.18, sd * 0.16], [0.24, sd * 0.2], [0.3, sd * 0.22]]),
    ]);
  }, []);
  const k = clamp(armor, 0, 1);
  const sc = C(GERRO.scute);
  const sd = C(GERRO.scuteDark);
  const ghostC = "#0e1424";
  const mat = (c: string) => (ghost > 0.5 ? <meshBasicMaterial color={ghostC} /> : <meshStandardMaterial color={c} {...M} />);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow>
        {ghost > 0.5 ? <meshBasicMaterial color={ghostC} /> : <meshStandardMaterial vertexColors {...M} />}
      </mesh>
      {/* placas de osso (armadura) */}
      {k > 0.01 && ghost < 0.5
        ? scutes.map((q, i) => (
            <group key={i} position={q.p} rotation={[0, q.r, 0]} scale={k}>
              <mesh scale={[q.s * 1.1, q.head ? 0.005 : 0.006, q.s]}>
                <cylinderGeometry args={[1, 1.12, 1, q.sides]} />
                <meshStandardMaterial color={q.dark ? sd : sc} roughness={0.95} flatShading />
              </mesh>
              {q.head ? (
                [0, 1, 2].map((j) => (
                  <mesh key={j} position={[Math.cos(j * 2.1) * q.s * 0.45, 0.003, Math.sin(j * 2.1) * q.s * 0.45]} scale={[q.s * 0.18, 0.002, q.s * 0.18]}>
                    <cylinderGeometry args={[1, 1, 1, 5]} />
                    <meshStandardMaterial color="#262a18" roughness={1} />
                  </mesh>
                ))
              ) : (
                <mesh position={[0, 0.003 + q.s * 0.15 * q.tub, 0]} scale={[q.s * 0.42, q.s * 0.5 * q.tub, q.s * 0.42]}>
                  <coneGeometry args={[1, 1, 6]} />
                  <meshStandardMaterial color={q.dark ? sc : sd} roughness={0.9} flatShading />
                </mesh>
              )}
            </group>
          ))
        : null}
      {/* espinhos na borda do corpo */}
      {k > 0.01 && ghost < 0.5
        ? spikes.map((q, i) => (
            <mesh key={`sp${i}`} position={q.p} rotation={[q.ang * 1.35, 0, 0]} scale={[q.s * k, q.s * 2.2 * k, q.s * k]}>
              <coneGeometry args={[1, 1, 5]} />
              <meshStandardMaterial color={GERRO.scuteDark} roughness={0.9} flatShading />
            </mesh>
          ))
        : null}
      {/* sulcos da linha lateral (órgãos sensoriais de animal aquático) */}
      {ghost < 0.5
        ? grooves.map((c, i) => (
            <mesh key={`gr${i}`}>
              <tubeGeometry args={[c, 24, 0.0035, 4, false]} />
              <meshStandardMaterial color="#1e2212" roughness={1} />
            </mesh>
          ))
        : null}
      {/* linha da boca */}
      {ghost < 0.5 ? (
        <mesh position={[0.3, 0.03, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1.62, 1]}>
          <torusGeometry args={[0.152, 0.004, 4, 40, Math.PI]} />
          <meshStandardMaterial color="#1a1a10" roughness={1} />
        </mesh>
      ) : null}
      {/* olhos no topo da cabeça */}
      {[-1, 1].map((z) => (
        <group key={z} position={[0.29, 0.09, z * 0.075]}>
          <mesh scale={[0.028, 0.02, 0.026]}>
            <sphereGeometry args={[1, 10, 8]} />
            {mat(GERRO.back2)}
          </mesh>
          <mesh position={[0.004, 0.012, 0]} scale={[0.016, 0.012, 0.016]}>
            <sphereGeometry args={[1, 10, 8]} />
            {ghost > 0.5 ? <meshBasicMaterial color={ghostC} /> : <meshStandardMaterial color={GERRO.eye} roughness={0.3} />}
          </mesh>
          <mesh position={[0, 0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.02, 0.005, 5, 14]} />
            {mat(GERRO.scuteDark)}
          </mesh>
          <mesh position={[0.008, 0.02, 0]} scale={[0.004, 0.006, 0.012]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color="#0b0812" />
          </mesh>
        </group>
      ))}
      {/* narinas */}
      {[-1, 1].map((z) => (
        <mesh key={`n${z}`} position={[0.43, 0.065, z * 0.05]} scale={[0.008, 0.004, 0.008]}>
          <sphereGeometry args={[1, 6, 4]} />
          <meshBasicMaterial color="#141008" />
        </mesh>
      ))}
      {/* mandíbula (abre para sugar) */}
      <group position={[0.17, 0.02, 0]} rotation={[0, 0, -0.35 * clamp(mouth, 0, 1)]}>
        <mesh position={[0.12, 0.004, 0]} scale={[0.14, 0.012, 0.2]}>
          <sphereGeometry args={[1, 16, 6]} />
          {mat(GERRO.belly)}
        </mesh>
      </group>
      {/* brânquias externas (penachos atrás da cabeça) */}
      {gills > 0.01
        ? [-1, 1].flatMap((z) =>
            [0, 1, 2].map((j) => (
              <group key={`g${z}${j}`} position={[0.15 - j * 0.02, 0.06, z * (0.2 - j * 0.01)]} rotation={[0, z * (0.5 + j * 0.35) + 0.12 * Math.sin(f / 9 + j), 0]}>
                <mesh position={[-0.05 * gills, 0, 0]} scale={[0.05 * gills, 0.008, 0.012]}>
                  <sphereGeometry args={[1, 8, 4]} />
                  {mat(GERRO.gill)}
                </mesh>
              </group>
            )),
          )
        : null}
      {/* patas curtas e abertas */}
      {[
        [0.08, 1],
        [0.08, -1],
        [-0.17, 1],
        [-0.17, -1],
      ].map(([x, z], i) => {
        const q = sampleKeys(GKEYS, x);
        const st = Math.sin(ph + i * 1.6) * 0.25 * swim;
        return (
          <group key={`l${i}`} position={[x, 0.03, z * q.w * 0.9]} rotation={[z * 0.15, z * (0.4 + st), 0]}>
            <mesh position={[0, 0, z * 0.05]} rotation={[Math.PI / 2, 0, 0]} scale={[0.022, 0.06, 0.018]}>
              <cylinderGeometry args={[1, 0.8, 1, 6]} />
              {mat(GERRO.back)}
            </mesh>
            <mesh position={[0.01, -0.013, z * 0.088]} scale={[0.026, 0.002, 0.022]}>
              <sphereGeometry args={[1, 8, 4]} />
              {mat(GERRO.back2)}
            </mesh>
            {[-1, 0, 1].map((d) => (
              <mesh key={d} position={[d * 0.014 + 0.01, -0.012, z * 0.09]} rotation={[0, d * 0.4, 0]} scale={[0.008, 0.005, 0.022]}>
                <sphereGeometry args={[1, 6, 4]} />
                {mat(GERRO.back2)}
              </mesh>
            ))}
          </group>
        );
      })}
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
