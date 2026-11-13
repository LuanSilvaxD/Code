import { useMemo } from "react";
import { CatmullRomCurve3, Color, DoubleSide, LatheGeometry, Quaternion, Vector2, Vector3 } from "three";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";

// "Sangue de dinossauro" — cenários e peças de ciência (aprovar na folha de design).
// Diorama, mina e museu em METROS; fóssil, canal, hemácias, heme, DNA e âmbar em u3d ESQUEMÁTICOS.

const M = { roughness: 0.9, metalness: 0, flatShading: true } as const;
const B: React.FC<{ p?: Vec3; s: Vec3; c: string; r?: Vec3; e?: string; ei?: number; o?: number }> = ({ p = [0, 0, 0], s, c, r, e, ei = 0, o = 1 }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} {...M} emissive={e ?? "#000"} emissiveIntensity={ei} transparent={o < 1} opacity={o} />
  </mesh>
);
const Cy: React.FC<{ p?: Vec3; r1: number; r2?: number; h: number; c: string; rot?: Vec3; seg?: number; e?: string; ei?: number }> = ({ p = [0, 0, 0], r1, r2, h, c, rot, seg = 10, e, ei = 0 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r2 ?? r1, r1, h, seg]} />
    <meshStandardMaterial color={c} {...M} emissive={e ?? "#000"} emissiveIntensity={ei} />
  </mesh>
);
const Ball: React.FC<{ p: Vec3; r: number; c: string; e?: number; o?: number; d?: number }> = ({ p, r, c, e = 0, o = 1, d = 1 }) => (
  <mesh position={p} castShadow>
    <icosahedronGeometry args={[r, d]} />
    <meshStandardMaterial color={c} roughness={0.6} flatShading emissive={c} emissiveIntensity={e} transparent={o < 1} opacity={o} />
  </mesh>
);
/** bastão entre dois pontos */
const Stick: React.FC<{ a: Vec3; b: Vec3; r: number; c: string; o?: number }> = ({ a, b, r, c, o = 1 }) => {
  const va = new Vector3(...a);
  const vb = new Vector3(...b);
  const d = vb.clone().sub(va);
  const len = d.length();
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), d.normalize());
  return (
    <mesh position={mid} quaternion={quat}>
      <cylinderGeometry args={[r, r, len, 6]} />
      <meshStandardMaterial color={c} roughness={0.6} flatShading transparent={o < 1} opacity={o} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ DIORAMA DO CRETÁCEO (metros) */

const Fern: React.FC<{ s?: number; seed: string; c?: string }> = ({ s = 1, seed, c = "#4f7a3a" }) => (
  <group scale={s}>
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2 + rand(seed + i) * 0.4;
      const tilt = 0.7 + rand(seed + "t" + i) * 0.4;
      return (
        <group key={i} rotation={[0, a, 0]}>
          <group rotation={[0, 0, -tilt]}>
            {/* fronde: lâmina estreita com folíolos */}
            <B p={[0, 0.32, 0]} s={[0.025, 0.64, 0.02]} c="#3f5f2c" />
            {Array.from({ length: 7 }, (_, k) => (
              <B key={k} p={[0, 0.1 + k * 0.08, 0]} s={[0.012, 0.035, 0.22 - k * 0.025]} c={k % 2 ? c : "#5d8a44"} />
            ))}
          </group>
        </group>
      );
    })}
  </group>
);
const Conifer: React.FC<{ h?: number; seed: string }> = ({ h = 4.5, seed }) => (
  <group>
    <Cy p={[0, h * 0.45, 0]} r1={0.12} r2={0.07} h={h * 0.9} c="#5a3e2a" seg={7} />
    {/* copa em andares (estilo araucária jovem) */}
    {[0.55, 0.68, 0.8, 0.92].map((k, i) => (
      <mesh key={i} position={[0, h * k, 0]} rotation={[0, rand(seed + i) * 3, 0]} castShadow>
        <coneGeometry args={[0.9 - i * 0.18, 0.55, 7]} />
        <meshStandardMaterial color={i % 2 ? "#2f5a34" : "#3a6a3c"} {...M} />
      </mesh>
    ))}
  </group>
);
const Horsetail: React.FC<{ seed: string; h?: number }> = ({ seed, h = 0.9 }) => (
  <group>
    {Array.from({ length: 6 }, (_, i) => {
      const x = (rand(seed + "x" + i) - 0.5) * 0.4;
      const z = (rand(seed + "z" + i) - 0.5) * 0.4;
      const hh = h * (0.7 + rand(seed + "h" + i) * 0.5);
      return (
        <group key={i} position={[x, 0, z]}>
          {Array.from({ length: 5 }, (_, k) => (
            <Cy key={k} p={[0, (k + 0.5) * (hh / 5), 0]} r1={0.022} h={hh / 5 - 0.012} c={k % 2 ? "#6a8a3a" : "#7a9a46"} seg={6} />
          ))}
        </group>
      );
    })}
  </group>
);

export const CretaceousDiorama: React.FC<{ f: number; w?: number; d?: number }> = ({ f, w = 9, d = 5.5 }) => (
  <group>
    {/* base: lama clara e areia */}
    <B p={[0, -0.12, 0]} s={[w, 0.24, d]} c="#b89a6a" />
    <B p={[0, -0.005, 0.2]} s={[w * 0.96, 0.02, d * 0.9]} c="#9c8256" />
    {/* lagoa rasa (fundo) */}
    <mesh position={[0, 0.012, -1.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[w * 0.95, 1.9, 24, 6]} />
      <meshStandardMaterial color="#3f7a7a" roughness={0.25} metalness={0.1} transparent opacity={0.9} emissive="#0e3a3a" emissiveIntensity={0.25 + 0.05 * Math.sin(f / 20)} />
    </mesh>
    {/* pedras */}
    {[[-3.6, 1.6], [3.4, 1.9], [2.4, -0.6], [-2.2, 1.9]].map(([x, z], i) => (
      <mesh key={i} position={[x, 0.08, z]} rotation={[rand(`r${i}`), rand(`q${i}`) * 3, 0]} castShadow>
        <dodecahedronGeometry args={[0.18 + rand(`s${i}`) * 0.15, 0]} />
        <meshStandardMaterial color="#8a8070" {...M} />
      </mesh>
    ))}
    {/* vegetação */}
    {[[-3.8, -0.9, 4.8], [-2.6, -2.3, 3.8], [3.7, -1.1, 5.2], [2.2, -2.4, 4.0]].map(([x, z, h], i) => (
      <group key={`c${i}`} position={[x, 0, z]}>
        <Conifer h={h} seed={`cf${i}`} />
      </group>
    ))}
    {[[-3.0, 0.6], [-1.2, -0.7], [1.0, -0.8], [3.0, 0.4], [-3.9, 2.0], [4.0, 1.6], [0.2, 2.1]].map(([x, z], i) => (
      <group key={`f${i}`} position={[x, 0, z]}>
        <Fern s={0.9 + rand(`fs${i}`) * 0.5} seed={`fe${i}`} />
      </group>
    ))}
    {[[-2.0, -0.9], [2.8, -0.7], [-0.4, -1.0]].map(([x, z], i) => (
      <group key={`h${i}`} position={[x, 0, z]}>
        <Horsetail seed={`ht${i}`} />
      </group>
    ))}
  </group>
);

/* ------------------------------------------------------------------ MINA DE GESSO (metros, esquemática) */

export const GypsumMine: React.FC<{ fossil?: number }> = ({ fossil = 0 }) => (
  <group>
    {/* cava em degraus: cada nível é uma moldura (4 blocos) em volta de um vão menor */}
    {[0, 1, 2, 3].map((i) => {
      const W = 14 - i * 2.6;
      const D = 10 - i * 2.0;
      const t = 1.3;
      const y = -i * 0.9 - 0.45;
      const c = ["#d9cfbd", "#ece5d6", "#e3dac8", "#f2ede2"][i];
      return (
        <group key={i}>
          <B p={[0, y, -(D - t) / 2]} s={[W, 0.9, t]} c={c} />
          <B p={[0, y, (D - t) / 2]} s={[W, 0.9, t]} c={c} />
          <B p={[-(W - t) / 2, y, 0]} s={[t, 0.9, D - 2 * t]} c={c} />
          <B p={[(W - t) / 2, y, 0]} s={[t, 0.9, D - 2 * t]} c={c} />
        </group>
      );
    })}
    <B p={[0, -3.65, 0]} s={[4.8, 0.3, 3.2]} c="#d6ccb8" />
    {/* camada cinza fossilífera exposta num degrau */}
    <B p={[0, -2.55, 2.32]} s={[6.2, 0.3, 0.06]} c="#6e6e68" />
    <B p={[0, -1.65, 3.32]} s={[8.6, 0.22, 0.06]} c="#86827a" />
    {/* bordas de terra vermelha (Araripe) */}
    <B p={[0, 0.06, 0]} s={[14.4, 0.12, 10.4]} c="#a8603a" o={0} />
    {/* fóssil emergindo da camada cinza */}
    <group position={[0.4, -3.5 + 0.3 * clamp(fossil, 0, 1), 0.2]} scale={0.9 * clamp(fossil, 0, 1)}>
      <FossilLeg />
    </group>
    {/* pá carregadeira genérica, pequena */}
    <group position={[-4.6, -0.9 + 0.05, 3.3]}>
      <B p={[0, 0.5, 0]} s={[1.6, 0.6, 0.9]} c="#e0a52a" />
      <B p={[-0.3, 1.0, 0]} s={[0.6, 0.5, 0.8]} c="#2a3346" />
      {[-0.55, 0.55].map((x) => [-0.4, 0.4].map((z) => <Cy key={`${x}${z}`} p={[x, 0.22, z]} r1={0.22} h={0.15} c="#222" rot={[Math.PI / 2, 0, 0]} />))}
    </group>
  </group>
);

/* ------------------------------------------------------------------ MUSEU (metros, fachada genérica) */

export const MuseumFacade: React.FC<{ f: number; fire?: number }> = ({ f, fire = 0 }) => {
  const k = clamp(fire, 0, 1);
  const wall = new Color("#e8dcc0").lerp(new Color("#5a4636"), k * 0.5);
  return (
    <group>
      <B p={[0, -0.1, 0]} s={[22, 0.2, 9]} c="#8a8a80" />
      {/* corpo + alas */}
      <B p={[0, 2.6, -1]} s={[12, 5.2, 4]} c={`#${wall.getHexString()}`} />
      {[-1, 1].map((sd) => <B key={sd} p={[sd * 8.5, 2.1, -0.8]} s={[5, 4.2, 4.4]} c={`#${wall.getHexString()}`} />)}
      {/* escadaria */}
      {[0, 1, 2].map((i) => <B key={i} p={[0, 0.12 + i * 0.2, 2.2 - i * 0.3]} s={[7 - i * 0.6, 0.2, 1.2]} c="#cfc6b0" />)}
      {/* colunata */}
      {[-2.5, -1.5, -0.5, 0.5, 1.5, 2.5].map((x) => <Cy key={x} p={[x, 2.6, 1.15]} r1={0.24} h={4} c="#f2ead8" seg={12} />)}
      <B p={[0, 4.75, 1.1]} s={[6.4, 0.4, 0.8]} c="#e8dcc0" />
      {/* frontão triangular */}
      <mesh position={[0, 5.55, 1.1]} rotation={[0, 0, 0]} castShadow>
        <cylinderGeometry args={[0.001, 3.6, 1.2, 3, 1, false, Math.PI / 2, Math.PI * 2]} />
        <meshStandardMaterial color="#efe4cc" {...M} />
      </mesh>
      {/* janelas */}
      {[-1, 1].flatMap((sd) => [0, 1, 2].map((i) => <B key={`${sd}${i}`} p={[sd * (7 + i * 1.2), 2.4, 1.45]} s={[0.6, 1.4, 0.05]} c={k > 0.2 ? "#ff8a2a" : "#3a4458"} e={k > 0.2 ? "#ff6a10" : "#000"} ei={k * 1.2} />))}
      {/* chamas e fumaça */}
      {k > 0.01 ? (
        <group>
          {Array.from({ length: 26 }, (_, i) => {
            const x = (rand(`fx${i}`) - 0.5) * 18;
            const ph = (f * 0.05 + rand(`fp${i}`)) % 1;
            const h = (1.2 + rand(`fh${i}`) * 2.2) * k * (0.7 + 0.3 * Math.sin(f * 0.3 + i));
            return (
              <mesh key={i} position={[x, 5 + h * 0.5 + ph * 0.3, -1 + (rand(`fz${i}`) - 0.5) * 3]} scale={[1, 1 + 0.2 * Math.sin(f * 0.4 + i), 1]}>
                <coneGeometry args={[0.45 + rand(`fr${i}`) * 0.4, h, 6]} />
                <meshBasicMaterial color={i % 3 ? "#ff7a1a" : "#ffd04a"} toneMapped={false} />
              </mesh>
            );
          })}
          {Array.from({ length: 10 }, (_, i) => {
            const ph = (f * 0.012 + i / 10) % 1;
            return (
              <mesh key={`s${i}`} position={[(rand(`sx${i}`) - 0.5) * 12 + ph * 2, 7 + ph * 6, -1]} scale={1 + ph * 2.5}>
                <icosahedronGeometry args={[0.8, 0]} />
                <meshStandardMaterial color="#3a3638" transparent opacity={0.55 * (1 - ph) * k} flatShading />
              </mesh>
            );
          })}
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ FÓSSIL DA PERNA (u3d) */

const BONE = "#b8a07a";
const BONE_D = "#8c7452";
const ROCK = "#9a958a";

/** Fêmur distal + tíbia proximal + pé parcial, articulados, sobre um bloco de rocha. ~2,6 u3d de comprimento. */
export const FossilLeg: React.FC<{ glow?: number; rock?: boolean }> = ({ glow = 0, rock = true }) => (
  <group>
    {rock ? (
      <mesh position={[0, -0.18, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.1, 0.36, 1.3]} />
        <meshStandardMaterial color={ROCK} {...M} />
      </mesh>
    ) : null}
    {/* fêmur (parte distal) com côndilos */}
    <group position={[-0.9, 0.18, 0]} rotation={[0, 0, -0.35]}>
      <Cy r1={0.17} r2={0.12} h={1.0} c={BONE} seg={12} rot={[0, 0, Math.PI / 2]} p={[-0.3, 0, 0]} e="#ff2a1a" ei={glow * 0.35} />
      <Ball p={[0.25, 0.04, 0.09]} r={0.17} c={BONE} />
      <Ball p={[0.25, -0.04, -0.09]} r={0.15} c={BONE_D} />
      {/* quebra irregular no topo */}
      <mesh position={[-0.82, 0, 0]} rotation={[0, 0, 0.4]}>
        <dodecahedronGeometry args={[0.13, 0]} />
        <meshStandardMaterial color={BONE_D} {...M} />
      </mesh>
    </group>
    {/* tíbia (metade proximal) */}
    <group position={[0.15, 0.12, 0]} rotation={[0, 0, 0.25]}>
      <Ball p={[-0.45, 0, 0]} r={0.16} c={BONE} />
      <Cy r1={0.13} r2={0.09} h={1.0} c={BONE} seg={12} rot={[0, 0, Math.PI / 2]} p={[0.05, 0, 0]} e="#ff2a1a" ei={glow * 0.35} />
      <mesh position={[0.57, 0, 0]} rotation={[0.3, 0, 0.3]}>
        <dodecahedronGeometry args={[0.1, 0]} />
        <meshStandardMaterial color={BONE_D} {...M} />
      </mesh>
    </group>
    {/* pé incompleto: metatarsos e falanges soltas */}
    <group position={[1.05, 0.05, 0]}>
      {[-0.14, 0, 0.14].map((z, i) => (
        <group key={i} position={[0, 0, z]} rotation={[0, 0.1 * (i - 1), -0.05]}>
          <Cy r1={0.04} r2={0.032} h={0.45} c={BONE} rot={[0, 0, Math.PI / 2]} p={[0.15, 0, 0]} />
          <Ball p={[0.4, 0, 0]} r={0.045} c={BONE_D} />
          {i !== 2 ? <Cy r1={0.03} h={0.15} c={BONE} rot={[0, 0, Math.PI / 2]} p={[0.5, 0, 0]} /> : null}
        </group>
      ))}
    </group>
    {/* brilho vermelho interno (gancho) */}
    {glow > 0.01 ? <pointLight position={[-0.4, 0.3, 0.5]} intensity={glow * 2} distance={2.5} color="#ff3a2a" /> : null}
  </group>
);

/** Corte transversal do osso: anel de osso cortical com canais vasculares; flow 0..1 = sangue correndo (vida). */
export const BoneSection: React.FC<{ f: number; flow?: number; r?: number }> = ({ f, flow = 0, r = 1.4 }) => {
  const canals = useMemo(
    () =>
      Array.from({ length: 46 }, (_, i) => {
        const a = rand(`ca${i}`) * Math.PI * 2;
        const rr = r * (0.58 + rand(`cr${i}`) * 0.36);
        return { x: Math.cos(a) * rr, y: Math.sin(a) * rr, s: 0.035 + rand(`cs${i}`) * 0.035 };
      }),
    [r],
  );
  return (
    <group>
      {/* osso cortical (anel) */}
      <mesh>
        <cylinderGeometry args={[r, r, 0.5, 40, 1, true]} />
        <meshStandardMaterial color={BONE_D} {...M} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[r * 0.5, r, 48, 1]} />
        <meshStandardMaterial color="#e2cfa2" roughness={0.9} side={DoubleSide} />
      </mesh>
      {/* cavidade medular preenchida de mineral */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <circleGeometry args={[r * 0.5, 32]} />
        <meshStandardMaterial color="#8a8070" roughness={1} side={DoubleSide} />
      </mesh>
      {/* canais */}
      {canals.map((c, i) => (
        <mesh key={i} position={[c.x, 0.004, c.y]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[c.s, 10]} />
          <meshBasicMaterial color={new Color("#3a2a1c").lerp(new Color("#ff2a2a"), clamp(flow, 0, 1) * (0.7 + 0.3 * Math.sin(f * 0.3 + i)))} side={DoubleSide} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/** Hemácia: kind "concave" (como achada no fóssil) ou "domed" (abaulada com núcleo — o esperado em aves/répteis). */
export const RBC: React.FC<{ kind?: "concave" | "domed"; s?: number; color?: string; stone?: number }> = ({ kind = "concave", s = 1, color = "#c2412f", stone = 0 }) => {
  const geo = useMemo(() => {
    const pts: Vector2[] = [];
    const n = 24;
    for (let i = 0; i <= n; i++) {
      const t = i / n; // 0 centro → 1 borda (ida pela face de cima, volta pela de baixo)
      const rr = Math.sin((t * Math.PI) / 2);
      const top = kind === "concave" ? 0.03 + 0.32 * Math.pow(rr, 3) * Math.sqrt(Math.max(0, 1 - Math.pow(rr, 16))) : 0.03 + 0.5 * Math.sqrt(Math.max(0, 1 - rr * rr));
      pts.push(new Vector2(rr, top));
    }
    for (let i = n; i >= 0; i--) {
      const p = pts[i];
      pts.push(new Vector2(p.x, -p.y));
    }
    return new LatheGeometry(pts, 28);
  }, [kind]);
  const c = new Color(color).lerp(new Color("#8a8476"), clamp(stone, 0, 1));
  return (
    <group scale={[s, s * 0.9, s]}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={c} roughness={0.55} side={DoubleSide} transparent={kind === "domed"} opacity={kind === "domed" ? 0.8 : 1} />
      </mesh>
      {kind === "domed" ? (
        <mesh scale={[0.35, 0.36, 0.28]}>
          <sphereGeometry args={[1, 16, 12]} />
          <meshStandardMaterial color="#6a2a6a" roughness={0.6} transparent opacity={0.85} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Canal vascular ampliado (tubo de parede translúcida) com hemácias minerais presas dentro. */
export const CanalClose: React.FC<{ f: number; rbc?: number; stone?: number }> = ({ f, rbc = 1, stone = 0 }) => {
  const curve = useMemo(() => new CatmullRomCurve3([new Vector3(-3, -0.3, 0), new Vector3(-1, 0.1, 0.2), new Vector3(1, -0.1, -0.1), new Vector3(3, 0.2, 0)]), []);
  return (
    <group>
      <mesh>
        <tubeGeometry args={[curve, 60, 0.75, 18, false]} />
        <meshStandardMaterial color="#c9a678" roughness={0.9} side={DoubleSide} transparent opacity={0.35} />
      </mesh>
      {/* matriz de osso em volta */}
      <mesh position={[0, 0, -1.4]}>
        <boxGeometry args={[7, 3.4, 0.6]} />
        <meshStandardMaterial color="#b89a70" {...M} />
      </mesh>
      {Array.from({ length: 14 }, (_, i) => {
        const t = 0.06 + (i / 14) * 0.88;
        const p = curve.getPoint(t);
        const k = clamp(rbc * 14 - i * 0.6, 0, 1);
        return (
          <group key={i} position={[p.x + (rand(`rx${i}`) - 0.5) * 0.3, p.y + (rand(`ry${i}`) - 0.5) * 0.7, p.z + (rand(`rz${i}`) - 0.5) * 0.6]} rotation={[rand(`ra${i}`) * 3, rand(`rb${i}`) * 3 + f * 0.003, rand(`rc${i}`) * 3]} scale={k}>
            <RBC s={0.32} color={i % 2 ? "#b83a2a" : "#a8452e"} stone={stone} />
          </group>
        );
      })}
    </group>
  );
};

/** Molécula do heme (modelo de bolinhas simplificado): anel de porfirina com o ferro no centro. o2 0..1 encaixa um O₂. */
export const Heme: React.FC<{ f: number; ghost?: number; o2?: number; spin?: boolean }> = ({ f, ghost = 0, o2 = 0, spin = true }) => {
  const o = 1 - clamp(ghost, 0, 0.8);
  const atoms = useMemo(() => {
    const out: { p: Vec3; c: string; r: number }[] = [];
    const links: [Vec3, Vec3][] = [];
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + Math.PI / 4;
      const n: Vec3 = [Math.cos(a) * 0.55, Math.sin(a) * 0.55, 0];
      out.push({ p: n, c: "#3d6bff", r: 0.11 });
      links.push([[0, 0, 0], n]);
      // pirrol: 4 carbonos em pentágono
      const ring: Vec3[] = [];
      for (let j = 0; j < 4; j++) {
        const b = a + (j - 1.5) * 0.55;
        const rr = 0.95 + (j === 1 || j === 2 ? 0.35 : 0);
        const p: Vec3 = [Math.cos(b) * rr, Math.sin(b) * rr, 0];
        ring.push(p);
        out.push({ p, c: "#4a4a52", r: 0.1 });
      }
      links.push([n, ring[0]], [ring[0], ring[1]], [ring[1], ring[2]], [ring[2], ring[3]], [ring[3], n]);
      // ponte de metino até o próximo pirrol
      const am = a + Math.PI / 4;
      const meso: Vec3 = [Math.cos(am) * 1.35, Math.sin(am) * 1.35, 0];
      out.push({ p: meso, c: "#4a4a52", r: 0.09 });
      links.push([ring[3], meso]);
      // grupos laterais
      const side: Vec3 = [ring[1][0] * 1.35, ring[1][1] * 1.35, 0];
      out.push({ p: side, c: k % 2 ? "#e2e2e8" : "#d84a3a", r: 0.09 });
      links.push([ring[1], side]);
    }
    // fecha as pontes
    for (let k = 0; k < 4; k++) {
      const am = (k / 4) * Math.PI * 2 + Math.PI / 2;
      const meso: Vec3 = [Math.cos(am) * 1.35, Math.sin(am) * 1.35, 0];
      const a2 = ((k + 1) / 4) * Math.PI * 2 + Math.PI / 4;
      const b = a2 - 1.5 * 0.55;
      links.push([meso, [Math.cos(b) * 0.95, Math.sin(b) * 0.95, 0]]);
    }
    return { out, links };
  }, []);
  return (
    <group rotation={[0.5, spin ? f * 0.02 : 0, 0]}>
      {/* ferro */}
      <Ball p={[0, 0, 0]} r={0.22} c="#e8a62a" e={0.35} o={o} />
      {atoms.out.map((a, i) => <Ball key={i} p={a.p} r={a.r} c={a.c} o={o} />)}
      {atoms.links.map(([a, b], i) => <Stick key={`l${i}`} a={a} b={b} r={0.03} c="#b8b8c0" o={o} />)}
      {/* O₂ chegando por cima */}
      {o2 > 0.01 ? (
        <group position={[0, 0, lerp(1.6, 0.42, clamp(o2, 0, 1))]}>
          <Ball p={[-0.13, 0, 0]} r={0.15} c="#ff4a4a" />
          <Ball p={[0.13, 0, 0]} r={0.15} c="#ff4a4a" />
        </group>
      ) : null}
    </group>
  );
};

/** Gota de sangue estilizada; brk 0..1 se desfaz em pó. */
export const BloodDrop: React.FC<{ show?: number; brk?: number }> = ({ show = 1, brk = 0 }) => {
  const s = clamp(show, 0, 1);
  const b = clamp(brk, 0, 1);
  if (s < 0.01) return null;
  if (b < 0.05)
    return (
      <group scale={s}>
        <Ball p={[0, 0, 0]} r={0.5} c="#c21f1f" d={2} />
        <mesh position={[0, 0.55, 0]}>
          <coneGeometry args={[0.42, 0.7, 16]} />
          <meshStandardMaterial color="#c21f1f" roughness={0.3} flatShading />
        </mesh>
      </group>
    );
  return (
    <group>
      {Array.from({ length: 40 }, (_, i) => (
        <Ball key={i} p={[(rand(`dx${i}`) - 0.5) * (0.6 + b * 2), (rand(`dy${i}`) - 0.5) * 0.9 - b * b * 1.5, (rand(`dz${i}`) - 0.5) * (0.6 + b)]} r={0.06 * (1 - b * 0.5)} c="#8a5a4a" o={1 - b * 0.8} d={0} />
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ DNA, AMPULHETA, ÂMBAR (u3d) */

const BASES = ["#3d8bff", "#ff9a3c", "#3fd27a", "#ff4a6a"];
/** Hélice dupla; decay 0..1 tira degraus e pedaços (semeado) que caem. */
export const DNAHelix: React.FC<{ f: number; decay?: number; h?: number }> = ({ f, decay = 0, h = 4 }) => {
  const n = 22;
  const d = clamp(decay, 0, 1);
  return (
    <group rotation={[0, f * 0.02, 0]}>
      {Array.from({ length: n }, (_, i) => {
        const t = i / (n - 1);
        const y = (t - 0.5) * h;
        const a = t * Math.PI * 4;
        const gone = rand(`dna${i}`) < d;
        const fall = gone ? Math.min(1, (d - rand(`dna${i}`)) * 4) : 0;
        const p1: Vec3 = [Math.cos(a) * 0.7, y - fall * 2, Math.sin(a) * 0.7];
        const p2: Vec3 = [-Math.cos(a) * 0.7, y - fall * 2.4, -Math.sin(a) * 0.7];
        const op = 1 - fall;
        if (op <= 0.02) return null;
        return (
          <group key={i}>
            <Ball p={p1} r={0.13} c="#e8e8f0" o={op} />
            <Ball p={p2} r={0.13} c="#e8e8f0" o={op} />
            {!gone ? (
              <>
                <Stick a={p1} b={[0, y, 0]} r={0.06} c={BASES[i % 4]} />
                <Stick a={[0, y, 0]} b={p2} r={0.06} c={BASES[(i + 2) % 4]} />
              </>
            ) : null}
          </group>
        );
      })}
    </group>
  );
};

export const Hourglass: React.FC<{ f: number; flip?: number; s?: number }> = ({ f, flip = 0, s = 1 }) => {
  const k = clamp(flip, 0, 1);
  const sand = (f * 0.004) % 1;
  return (
    <group scale={s} rotation={[0, 0, Math.PI * k]}>
      <B p={[0, 1.05, 0]} s={[0.9, 0.12, 0.9]} c="#7a5230" />
      <B p={[0, -1.05, 0]} s={[0.9, 0.12, 0.9]} c="#7a5230" />
      {[-1, 1].map((sg) => (
        <mesh key={sg} position={[0, sg * 0.5, 0]} rotation={[sg > 0 ? 0 : Math.PI, 0, 0]}>
          <coneGeometry args={[0.38, 1.0, 16, 1, true]} />
          <meshStandardMaterial color="#dfeaf2" transparent opacity={0.3} side={DoubleSide} />
        </mesh>
      ))}
      <mesh position={[0, -0.75 + 0.1 * sand, 0]}>
        <coneGeometry args={[0.3, 0.35 + 0.2 * sand, 14]} />
        <meshStandardMaterial color="#e2b866" {...M} />
      </mesh>
      <Cy p={[0, -0.05, 0]} r1={0.015} h={0.9} c="#e2b866" />
    </group>
  );
};

/** Bloco de âmbar com um mosquito dentro. */
export const AmberMosquito: React.FC<{ f: number; s?: number }> = ({ f, s = 1 }) => (
  <group scale={s} rotation={[0.2, f * 0.012, 0.1]}>
    <mesh scale={[1.25, 0.85, 0.95]}>
      <icosahedronGeometry args={[1, 1]} />
      <meshStandardMaterial color="#ffb02a" roughness={0.1} metalness={0} transparent opacity={0.38} emissive="#ff8a00" emissiveIntensity={0.5} flatShading depthWrite={false} />
    </mesh>
    {/* mosquito */}
    <group rotation={[0, 0.4, 0.1]} scale={1.5}>
      <Cy r1={0.05} r2={0.03} h={0.55} c="#2a221a" rot={[0, 0, Math.PI / 2]} p={[-0.12, 0, 0]} />
      <Ball p={[0.2, 0.02, 0]} r={0.07} c="#2a221a" />
      <Ball p={[0.32, 0.03, 0]} r={0.05} c="#2a221a" />
      <Stick a={[0.36, 0.02, 0]} b={[0.62, -0.06, 0]} r={0.008} c="#2a221a" />
      {[-1, 1].map((sd) => (
        <mesh key={sd} position={[0.05, 0.1, sd * 0.18]} rotation={[sd * 0.4, 0, -0.2]}>
          <boxGeometry args={[0.42, 0.01, 0.12]} />
          <meshStandardMaterial color="#f2e8d0" transparent opacity={0.55} />
        </mesh>
      ))}
      {[-1, 1].flatMap((sd) => [0.1, 0.2, 0.3].map((x, i) => <Stick key={`${sd}${i}`} a={[x, -0.02, sd * 0.03]} b={[x - 0.15 + i * 0.1, -0.35, sd * 0.3]} r={0.008} c="#2a221a" />))}
    </group>
  </group>
);

/** Microscópio de bancada simples (metros). */
export const Microscope: React.FC = () => (
  <group>
    <B p={[0, 0.03, 0]} s={[0.3, 0.06, 0.22]} c="#2a3346" />
    <B p={[-0.1, 0.22, 0]} s={[0.06, 0.36, 0.08]} c="#e8e8f0" />
    <B p={[0.02, 0.18, 0]} s={[0.18, 0.02, 0.16]} c="#2a3346" />
    <group position={[0.02, 0.36, 0]} rotation={[0, 0, 0.35]}>
      <Cy r1={0.04} h={0.26} c="#e8e8f0" />
      <Cy p={[0, 0.16, 0]} r1={0.03} h={0.08} c="#2a3346" />
      <Cy p={[0, -0.15, 0]} r1={0.02} h={0.06} c="#aab" />
    </group>
  </group>
);
