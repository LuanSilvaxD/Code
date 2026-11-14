import { useMemo } from "react";
import { AdditiveBlending, Color, DoubleSide, LatheGeometry, Vector2 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { loft } from "./Amphibia";

// "Os pássaros que ouviram a tempestade" — v2 (padrão Gerrothorax v2).
// Pássaro em DECÍMETROS (1 u = 10 cm; ~1,2 u = 12 cm), de frente para +x, pés em y = 0.

const C = (h: string) => new Color(h);
export const WARBLER = { grey: "#8f97a1", greyDark: "#5b616a", greyLight: "#b4bac2", belly: "#eeede8", yellow: "#f4c830", black: "#141418", white: "#f8f8f4", beak: "#26262a", leg: "#6a5e54", edge: "#e2e4e6" };

// corpo esguio de mariquita
const BKEYS = [
  { x: -0.34, y: 0.43, w: 0.004, h: 0.004, sq: 2 },
  { x: -0.31, y: 0.43, w: 0.04, h: 0.045, sq: 2 },
  { x: -0.24, y: 0.42, w: 0.095, h: 0.11, sq: 2 },
  { x: -0.11, y: 0.41, w: 0.15, h: 0.18, sq: 2.05 },
  { x: 0.03, y: 0.43, w: 0.158, h: 0.19, sq: 2.05 },
  { x: 0.15, y: 0.49, w: 0.13, h: 0.15, sq: 2 },
  { x: 0.23, y: 0.56, w: 0.11, h: 0.12, sq: 2 },
  { x: 0.31, y: 0.61, w: 0.12, h: 0.125, sq: 2 },
  { x: 0.4, y: 0.615, w: 0.1, h: 0.105, sq: 2 },
  { x: 0.46, y: 0.6, w: 0.055, h: 0.065, sq: 2 },
  { x: 0.485, y: 0.595, w: 0.018, h: 0.024, sq: 2 },
];

const Feather: React.FC<{ p: Vec3; r?: Vec3; s: Vec3; c: string; smooth?: boolean }> = ({ p, r = [0, 0, 0], s, c, smooth }) => (
  <mesh position={p} rotation={r} scale={s} castShadow>
    <sphereGeometry args={[1, 12, 6]} />
    <meshStandardMaterial color={c} roughness={0.7} flatShading={!smooth} />
  </mesh>
);

/** Asa v2: penas largas e sobrepostas (primárias escuras com borda clara, secundárias cinza), duas fileiras de
 *  coberturas e a grande mancha amarela. Fechada: colada no flanco. Aberta: leque horizontal; flap = batida. */
const Wing: React.FC<{ side: 1 | -1; open: number; flap: number }> = ({ side, open, flap }) => {
  const o = clamp(open, 0, 1);
  const tilt = (1 - o) * (Math.PI / 2 - 0.3) + o * -flap;
  const N = 9;
  return (
    <group position={[0.12 - 0.02 * o, 0.52 + 0.03 * o, side * (0.13 - 0.01 * o)]} rotation={[side * tilt, 0, (1 - o) * -0.16]}>
      {Array.from({ length: N }, (_, i) => {
        const t = i / (N - 1);
        const fan = (1 - o) * (Math.PI - 0.03 + t * 0.07) + o * (Math.PI / 2 + 1.0 - t * 1.45);
        const len = (0.2 + 0.16 * (1 - t)) * (1 + o * 0.15);
        const prim = i < 4;
        return (
          <group key={i} rotation={[0, -side * fan, 0]}>
            <Feather p={[len * 0.55, -0.003 * i, 0]} s={[len * 0.55, 0.009, 0.055]} c={prim ? WARBLER.greyDark : WARBLER.grey} />
            {prim ? <Feather p={[len * 0.62, -0.003 * i - 0.002, side * 0.012]} s={[len * 0.42, 0.006, 0.02]} c={WARBLER.edge} /> : null}
          </group>
        );
      })}
      {/* coberturas maiores (mancha amarela) e menores (cinza) */}
      {[0, 1].map((row) => (
        <group key={row} rotation={[0, -side * (Math.PI - 0.08 * (1 - o) - o * (1.05 + row * 0.15)), 0]}>
          {Array.from({ length: 5 }, (_, j) => (
            <group key={j} rotation={[0, -side * (j - 2) * (0.06 + 0.12 * o), 0]}>
              <Feather p={[0.1 - row * 0.035, 0.01 + row * 0.008, 0]} s={[0.09 - row * 0.02, 0.01, 0.038]} c={row === 0 ? WARBLER.yellow : WARBLER.grey} />
            </group>
          ))}
        </group>
      ))}
    </group>
  );
};

/** Mariquita v2 (~12 cm, ~10 g). fly 0..1 em voo; tracker rastreador; sing abre o bico; look gira o corpo. */
export const Warbler: React.FC<{ f: number; fly?: number; tracker?: number; sing?: number; look?: number }> = ({ f, fly = 0, tracker = 0, sing = 0, look = 0 }) => {
  const geo = useMemo(
    () =>
      loft(
        BKEYS,
        (x, a) => {
          const top = Math.cos(a);
          const side = Math.abs(Math.sin(a));
          if (x > 0.27 && top > 0.5) return C(WARBLER.yellow); // coroa
          if (x > 0.3 && x < 0.47 && side > 0.62 && top >= 0.38 && top <= 0.5) return C(WARBLER.white); // sobrancelha branca
          if (x > 0.31 && x < 0.48 && side > 0.7 && top > -0.15 && top < 0.38) return C(WARBLER.black); // máscara
          if (x > 0.3 && x < 0.46 && side > 0.55 && top >= -0.42 && top <= -0.15) return C(WARBLER.white); // bigode branco
          if (x > 0.2 && x < 0.44 && top < -0.42) return C(WARBLER.black); // garganta
          if (top < -0.25) return C(WARBLER.belly).lerp(C(WARBLER.greyLight), x < -0.1 ? 0.25 : 0);
          const c = C(WARBLER.grey).lerp(C(WARBLER.greyDark), top > 0.6 ? 0.3 : 0.1);
          return top < 0.15 ? c.lerp(C(WARBLER.belly), 0.45) : c;
        },
        72,
        24,
      ),
    [],
  );
  // penas de contorno (escamas sobrepostas, baixo contraste) no dorso e no peito
  const contour = useMemo(() => {
    const out: { p: Vec3; r: Vec3; c: string }[] = [];
    for (let i = 0; i < 9; i++)
      for (let j = -2; j <= 2; j++) {
        const x = -0.2 + i * 0.045;
        const ang = j * 0.32 + (i % 2) * 0.16;
        out.push({ p: [x, 0.41 + 0.17 * Math.cos(ang) + (x > 0.1 ? (x - 0.1) * 0.5 : 0), 0.16 * Math.sin(ang) * (1 - Math.max(0, x - 0.05) * 1.2)], r: [ang, 0, 0.25], c: (i + j) % 3 ? "#8a929c" : "#969ea8" });
      }
    return out;
  }, []);
  const flapA = fly > 0.01 ? Math.sin(f * 0.9) * 0.75 : 0;
  const breathe = 1 + 0.015 * Math.sin(f / 9);
  const beakOpen = sing * (0.5 + 0.5 * Math.sin(f * 0.8)) * 0.22;
  return (
    <group rotation={[0, look, 0]}>
      <group scale={[1, breathe, 1]}>
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial vertexColors roughness={0.72} />
        </mesh>
        {contour.map((q, i) => (
          <mesh key={i} position={q.p} rotation={q.r} scale={[0.026, 0.004, 0.02]}>
            <sphereGeometry args={[1, 8, 4]} />
            <meshStandardMaterial color={q.c} roughness={0.75} />
          </mesh>
        ))}
      </group>
      {/* olhos com anel fino e brilho */}
      {[-1, 1].map((z) => (
        <group key={z} position={[0.39, 0.635, z * 0.093]}>
          <mesh>
            <sphereGeometry args={[0.027, 14, 10]} />
            <meshStandardMaterial color="#050507" roughness={0.1} />
          </mesh>
          <mesh position={[0.01, 0.011, z * 0.02]}>
            <sphereGeometry args={[0.007, 6, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {/* bico fino e pontudo (duas metades) */}
      <group position={[0.48, 0.597, 0]}>
        <mesh position={[0.065, 0.006, 0]} rotation={[0, 0, -Math.PI / 2 + 0.04 + beakOpen]} scale={[1, 1, 0.8]}>
          <coneGeometry args={[0.019, 0.14, 10]} />
          <meshStandardMaterial color={WARBLER.beak} roughness={0.35} />
        </mesh>
        <mesh position={[0.058, -0.007, 0]} rotation={[0, 0, -Math.PI / 2 - 0.04 - beakOpen]} scale={[0.85, 0.9, 0.75]}>
          <coneGeometry args={[0.017, 0.125, 10]} />
          <meshStandardMaterial color="#3a3a40" roughness={0.35} />
        </mesh>
      </group>
      {/* cauda: 6 penas sobrepostas, abre em leque no voo */}
      {Array.from({ length: 6 }, (_, i) => {
        const t = (i - 2.5) / 2.5;
        return (
          <group key={`t${i}`} position={[-0.28, 0.43, 0]} rotation={[0, t * (0.12 + fly * 0.3), 0.12 - fly * 0.12]}>
            <Feather p={[-0.15, 0.002 * Math.abs(t), 0]} s={[0.17, 0.008, 0.032]} c={Math.abs(t) < 0.3 ? WARBLER.greyDark : WARBLER.grey} />
          </group>
        );
      })}
      <Wing side={1} open={fly} flap={flapA} />
      <Wing side={-1} open={fly} flap={flapA} />
      {/* patas: coxa com penas, tarso com tornozelo, dedos com unhas */}
      {fly < 0.5
        ? [-1, 1].map((z) => (
            <group key={`l${z}`} position={[0.02, 0.27, z * 0.055]}>
              <Feather p={[0, 0.02, 0]} s={[0.05, 0.05, 0.04]} c={WARBLER.greyLight} smooth />
              <mesh position={[0, -0.09, 0]} rotation={[0, 0, 0.12]}>
                <cylinderGeometry args={[0.011, 0.013, 0.17, 6]} />
                <meshStandardMaterial color={WARBLER.leg} roughness={0.55} />
              </mesh>
              <mesh position={[0.01, -0.17, 0]}>
                <sphereGeometry args={[0.016, 8, 6]} />
                <meshStandardMaterial color={WARBLER.leg} roughness={0.55} />
              </mesh>
              {[-0.45, 0, 0.45, Math.PI].map((d, i) => (
                <group key={i} position={[0.01, -0.185, 0]} rotation={[0, -d, 0]}>
                  <mesh position={[0.03, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={[0.008, 0.06, 0.008]}>
                    <cylinderGeometry args={[1, 0.7, 1, 5]} />
                    <meshStandardMaterial color={WARBLER.leg} roughness={0.55} />
                  </mesh>
                  <mesh position={[0.063, -0.008, 0]} rotation={[0, 0, -Math.PI / 2 - 0.6]}>
                    <coneGeometry args={[0.005, 0.02, 4]} />
                    <meshStandardMaterial color="#1a1614" />
                  </mesh>
                </group>
              ))}
            </group>
          ))
        : null}
      {/* rastreador (geolocalizador) com haste de luz */}
      {tracker > 0.01 ? (
        <group position={[-0.15, 0.585, 0]} rotation={[0, 0, 0.08]} scale={clamp(tracker, 0, 1.2)}>
          <mesh>
            <boxGeometry args={[0.09, 0.03, 0.055]} />
            <meshStandardMaterial color="#26262e" roughness={0.35} metalness={0.4} />
          </mesh>
          <mesh position={[-0.055, 0.035, 0]} rotation={[0, 0, 0.9]}>
            <cylinderGeometry args={[0.005, 0.005, 0.08, 5]} />
            <meshStandardMaterial color="#26262e" />
          </mesh>
          <mesh position={[-0.088, 0.062, 0]}>
            <sphereGeometry args={[0.011, 8, 6]} />
            <meshBasicMaterial color="#7ae0ff" toneMapped={false} />
          </mesh>
          {/* alça */}
          {[-1, 1].map((z) => (
            <mesh key={z} position={[0.01, -0.1, z * 0.07]} rotation={[0, 0, 0.1]} scale={[0.012, 0.13, 0.004]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#3a3a42" />
            </mesh>
          ))}
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ ÁRVORES v2 */

/** Árvore de folhas largas: tronco com raízes e galhos; copa em vários tufos com variação de cor. dark escurece (tempestade). */
export const Tree: React.FC<{ f: number; s?: number; seed?: string; dark?: number; wind?: number }> = ({ f, s = 1, seed = "t", dark = 0, wind = 0 }) => {
  const parts = useMemo(() => {
    const branches = Array.from({ length: 4 }, (_, i) => {
      const a = (i / 4) * Math.PI * 2 + rand(`${seed}b${i}`) * 0.8;
      return { a, y: 1.7 + i * 0.3, len: 0.9 + rand(`${seed}bl${i}`) * 0.4 };
    });
    const tufts = Array.from({ length: 16 }, (_, i) => {
      const b = branches[i % 4];
      const r = b.len * (0.7 + rand(`${seed}tr${i}`) * 0.6);
      return { p: [Math.cos(b.a) * r * 0.9 + (rand(`${seed}tx${i}`) - 0.5) * 0.6, b.y + 0.9 + rand(`${seed}ty${i}`) * 1.0, Math.sin(b.a) * r * 0.9 + (rand(`${seed}tz${i}`) - 0.5) * 0.6] as Vec3, s: 0.45 + rand(`${seed}ts${i}`) * 0.35, l: (rand(`${seed}tl${i}`) - 0.5) * 0.08 };
    });
    return { branches, tufts };
  }, [seed]);
  const leaf = new Color("#4f8f3a").lerp(new Color("#1e3420"), dark * 0.65);
  const sway = (0.02 + wind * 0.12) * Math.sin(f / (wind > 0.3 ? 6 : 30));
  return (
    <group scale={s}>
      {/* raízes */}
      {[0, 1, 2, 3, 4].map((i) => (
        <mesh key={i} position={[Math.cos(i * 1.3) * 0.22, 0.08, Math.sin(i * 1.3) * 0.22]} rotation={[Math.sin(i * 1.3) * 0.9, 0, -Math.cos(i * 1.3) * 0.9]}>
          <coneGeometry args={[0.09, 0.4, 5]} />
          <meshStandardMaterial color="#5e4028" roughness={0.95} flatShading />
        </mesh>
      ))}
      <group rotation={[0, 0, sway]}>
        <mesh position={[0, 1.2, 0]} castShadow>
          <cylinderGeometry args={[0.12, 0.24, 2.4, 9]} />
          <meshStandardMaterial color="#6a4a30" roughness={0.95} flatShading />
        </mesh>
        {parts.branches.map((b, i) => (
          <mesh key={`b${i}`} position={[Math.cos(b.a) * b.len * 0.45, b.y + 0.35, Math.sin(b.a) * b.len * 0.45]} rotation={[Math.sin(b.a) * 0.9, 0, -Math.cos(b.a) * 0.9]} castShadow>
            <cylinderGeometry args={[0.04, 0.08, b.len, 6]} />
            <meshStandardMaterial color="#6a4a30" roughness={0.95} flatShading />
          </mesh>
        ))}
        {parts.tufts.map((t, i) => (
          <mesh key={`t${i}`} position={[t.p[0], t.p[1] + 0.03 * Math.sin(f / 25 + i), t.p[2]]} scale={[t.s, t.s * 0.82, t.s]} castShadow>
            <icosahedronGeometry args={[1, 1]} />
            <meshStandardMaterial color={leaf.clone().offsetHSL(0.01 * (i % 3), 0, t.l)} roughness={0.85} flatShading />
          </mesh>
        ))}
      </group>
    </group>
  );
};

/** Conífera (variedade na floresta). */
export const Pine: React.FC<{ f: number; s?: number; dark?: number }> = ({ f, s = 1, dark = 0 }) => {
  const c = new Color("#2f6a3a").lerp(new Color("#14281a"), dark * 0.6);
  return (
    <group scale={s} rotation={[0, 0, 0.015 * Math.sin(f / 35)]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[0.08, 0.14, 1, 7]} />
        <meshStandardMaterial color="#5e4028" roughness={0.95} flatShading />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <mesh key={i} position={[0, 1.1 + i * 0.62, 0]} castShadow>
          <coneGeometry args={[1.0 - i * 0.2, 1.1, 8]} />
          <meshStandardMaterial color={c.clone().offsetHSL(0, 0, (i % 2) * 0.03)} roughness={0.85} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/** Galho para pousar: casca com nós, raminhos e folhas em pares. */
export const Branch: React.FC<{ f: number; len?: number }> = ({ f, len = 3 }) => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.055, 0.085, len, 9]} />
      <meshStandardMaterial color="#6a4a30" roughness={0.95} flatShading />
    </mesh>
    {[-0.7, 0.4, 1.0].map((x, i) => (
      <group key={`tw${i}`} position={[x * (len / 3), 0.03, 0]} rotation={[(i % 2 ? 1 : -1) * 0.7, 0, 0.6]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.012, 0.025, 0.4, 5]} />
          <meshStandardMaterial color="#6a4a30" roughness={0.95} />
        </mesh>
        {[0.15, 0.3, 0.42].map((y, j) => (
          <mesh key={j} position={[(j % 2 ? 0.06 : -0.06), y, 0]} rotation={[0, 0, (j % 2 ? -1 : 1) * 0.9 + 0.05 * Math.sin(f / 15 + i + j)]} scale={[0.09, 0.012, 0.045]}>
            <sphereGeometry args={[1, 10, 5]} />
            <meshStandardMaterial color={j % 2 ? "#5a9a42" : "#4a8a3a"} roughness={0.8} />
          </mesh>
        ))}
      </group>
    ))}
  </group>
);

/* ------------------------------------------------------------------ SUPERCÉLULA v2 */

/** Supercélula: bigorna larga e chata com topo saliente, corpo em torres, base girando com estrias, nuvem-parede,
 *  cortina de chuva e tornado (lathe com perfil afunilado, cinta de detritos). */
export const Supercell: React.FC<{ f: number; tornado?: number; s?: number; flash?: number; rain?: number }> = ({ f, tornado = 1, s = 1, flash = 0, rain = 1 }) => {
  const towers = useMemo(() => Array.from({ length: 26 }, (_, i) => {
    const a = rand(`ta${i}`) * Math.PI * 2;
    const r = Math.sqrt(rand(`tr${i}`)) * 2.6;
    return { p: [Math.cos(a) * r, 3.6 + rand(`ty${i}`) * 2.2, Math.sin(a) * r * 0.7] as Vec3, s: 0.9 + rand(`ts${i}`) * 1.1 };
  }), []);
  const anvil = useMemo(() => Array.from({ length: 22 }, (_, i) => {
    const a = (i / 22) * Math.PI * 2;
    const r = 3.2 + rand(`ar${i}`) * 2.6;
    return { p: [Math.cos(a) * r + 1.2, 6.4 + rand(`ay${i}`) * 0.4, Math.sin(a) * r * 0.6] as Vec3, s: 1.2 + rand(`as${i}`) * 1.0 };
  }), []);
  const funnel = useMemo(() => {
    const pts: Vector2[] = [];
    for (let i = 0; i <= 24; i++) {
      const t = i / 24; // 0 = chão, 1 = nuvem
      const r = 0.12 + 0.95 * Math.pow(t, 2.4) + 0.04 * Math.sin(t * 22);
      pts.push(new Vector2(r, t * 3.1));
    }
    return new LatheGeometry(pts, 20);
  }, []);
  const lit = (c: string, k = 1) => new Color(c).lerp(new Color("#d8deff"), flash * k);
  const tk = clamp(tornado, 0, 1);
  return (
    <group scale={s}>
      {/* bigorna */}
      {anvil.map((q, i) => (
        <mesh key={`a${i}`} position={q.p} scale={[q.s * 1.4, q.s * 0.35, q.s]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={lit("#9aa0b8", 0.8)} roughness={1} flatShading />
        </mesh>
      ))}
      {/* topo saliente */}
      <mesh position={[0, 7.0, 0]} scale={[1.4, 0.8, 1.2]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={lit("#b4b8cc")} roughness={1} flatShading />
      </mesh>
      {/* corpo em torres */}
      {towers.map((q, i) => (
        <mesh key={`t${i}`} position={q.p} scale={[q.s, q.s * 0.85, q.s]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={lit(q.p[1] > 4.8 ? "#7a8098" : "#4e5468")} roughness={1} flatShading />
        </mesh>
      ))}
      {/* base girando com estrias */}
      <group rotation={[0, f * 0.01, 0]}>
        {[0, 1, 2, 3].map((i) => (
          <mesh key={`st${i}`} position={[0, 3.0 + i * 0.22, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[2.9 - i * 0.35, 0.22, 6, 28]} />
            <meshStandardMaterial color={lit(i % 2 ? "#3a3e50" : "#454a5e")} roughness={1} flatShading />
          </mesh>
        ))}
        <mesh position={[0, 2.95, 0]} scale={[2.8, 0.25, 2.2]}>
          <sphereGeometry args={[1, 20, 8]} />
          <meshStandardMaterial color={lit("#2c2f3e")} roughness={1} flatShading />
        </mesh>
      </group>
      {/* nuvem-parede */}
      <mesh position={[0.2, 2.55, 0]} scale={[1.1, 0.4, 1.0]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={lit("#23262f")} roughness={1} flatShading />
      </mesh>
      {/* cortina de chuva: riscos finos */}
      {rain > 0.01
        ? Array.from({ length: 70 }, (_, i) => {
            const a = rand(`rn${i}`) * Math.PI * 2;
            const r = Math.sqrt(rand(`rr${i}`)) * 1.5;
            const y = 2.6 - ((f * 0.12 + rand(`ry${i}`) * 3) % 2.8);
            return (
              <mesh key={`r${i}`} position={[2.7 + Math.cos(a) * r, y, 0.3 + Math.sin(a) * r]} rotation={[0, 0, 0.12]}>
                <boxGeometry args={[0.015, 0.45, 0.015]} />
                <meshBasicMaterial color="#b8c2d8" transparent opacity={0.55 * clamp(rain, 0, 1)} />
              </mesh>
            );
          })
        : null}
      {/* tornado */}
      {tk > 0.01 ? (
        <group position={[0.2, 0, 0]} rotation={[0, f * 0.3, 0.08]} scale={[1.7 * tk, 0.97, 1.7 * tk]}>
          <mesh geometry={funnel}>
            <meshStandardMaterial color="#6a6e7c" roughness={1} transparent opacity={0.9} side={DoubleSide} flatShading />
          </mesh>
          {[0.4, 1.1, 1.8, 2.4].map((y, i) => (
            <mesh key={i} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
              <torusGeometry args={[0.13 + 0.95 * Math.pow(y / 3.1, 2.4) + 0.04, 0.03, 4, 18]} />
              <meshStandardMaterial color="#4e525e" roughness={1} />
            </mesh>
          ))}
          {/* cinta de detritos e poeira */}
          {Array.from({ length: 22 }, (_, i) => {
            const a = i * 0.29 + f * 0.05;
            const r = 0.35 + (i % 5) * 0.12;
            return (
              <mesh key={`d${i}`} position={[Math.cos(a) * r, 0.1 + (i % 6) * 0.1, Math.sin(a) * r]} rotation={[a, a * 1.7, 0]} scale={i % 3 ? 0.05 : 0.09}>
                {i % 3 ? <boxGeometry args={[1, 0.4, 1.5]} /> : <icosahedronGeometry args={[1, 0]} />}
                <meshStandardMaterial color={i % 3 ? "#5a4632" : "#8a7a62"} roughness={1} flatShading />
              </mesh>
            );
          })}
          <mesh position={[0, 0.15, 0]} scale={[1.2, 0.25, 1.2]}>
            <sphereGeometry args={[1, 16, 8]} />
            <meshBasicMaterial color="#8a7a62" transparent opacity={0.35} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** Ondas de infrassom v2: cúpulas (meias-esferas) translúcidas com borda brilhante, se expandindo devagar. */
export const InfraWaves: React.FC<{ f: number; k?: number; speed?: number; maxR?: number; color?: string; n?: number }> = ({ f, k = 1, speed = 0.05, maxR = 30, color = "#a78bfa", n = 4 }) => {
  if (k <= 0.01) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = ((f * speed) / maxR + i / n) % 1;
        const r = 1.5 + t * maxR;
        const fade = Math.sin(Math.min(1, t * 1.2) * Math.PI) * clamp(k, 0, 1);
        return (
          <group key={i}>
            <mesh scale={r}>
              <sphereGeometry args={[1, 40, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
              <meshBasicMaterial color={color} transparent opacity={0.07 * fade} side={DoubleSide} depthWrite={false} blending={AdditiveBlending} toneMapped={false} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[r - 0.12, r + 0.12, 96]} />
              <meshBasicMaterial color={color} transparent opacity={0.8 * fade} depthWrite={false} blending={AdditiveBlending} toneMapped={false} side={DoubleSide} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};
