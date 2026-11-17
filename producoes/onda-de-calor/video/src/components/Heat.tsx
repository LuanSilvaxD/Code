import { useMemo } from "react";
import { BufferAttribute, CatmullRomCurve3, Color, DoubleSide, EdgesGeometry, IcosahedronGeometry, PlaneGeometry, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "Por que 2026 está tão quente?" — elementos novos (aprovar na folha). Low-poly, cores de vértice, esquemático.
const C = (h: string) => new Color(h);
const M = { roughness: 0.8, metalness: 0, flatShading: true } as const;

/* ------------------------------------------------------------------ COBERTOR (efeito estufa) */

/** Casca translúcida em volta da Terra: k 0..1 = espessura/opacidade (CO₂ engrossando). Costuras de "colcha". */
export const BlanketShell: React.FC<{ r?: number; k?: number; f: number }> = ({ r = 1, k = 0.5, f }) => {
  const kk = clamp(k, 0, 1.2);
  const R = r * (1.12 + 0.16 * kk);
  const edges = useMemo(() => new EdgesGeometry(new IcosahedronGeometry(1, 2)), []);
  return (
    <group rotation={[0.2, f * 0.002, 0]}>
      <mesh scale={R}>
        <sphereGeometry args={[1, 48, 32]} />
        <meshStandardMaterial color="#ff8a5a" emissive="#ff5a2a" emissiveIntensity={0.15 + 0.35 * kk} transparent opacity={0.07 + 0.2 * kk} depthWrite={false} side={DoubleSide} roughness={0.9} />
      </mesh>
      <lineSegments geometry={edges} scale={R * 1.002}>
        <lineBasicMaterial color="#ffd0a0" transparent opacity={0.15 + 0.4 * kk} />
      </lineSegments>
    </group>
  );
};

/** Seta 3D ao longo de uma curva (tubo + ponta). */
const CurveArrow: React.FC<{ pts: Vec3[]; color: string; r?: number; draw?: number }> = ({ pts, color, r = 0.04, draw = 1 }) => {
  const curve = useMemo(() => new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), [pts]);
  const d = clamp(draw, 0.02, 1);
  const n = 40;
  const tipT = d;
  const tip = curve.getPointAt(tipT);
  const tan = curve.getTangentAt(Math.max(0.001, tipT - 0.001));
  const q = new Vector3(0, 1, 0);
  const axis = new Vector3().crossVectors(q, tan).normalize();
  const ang = Math.acos(clamp(q.dot(tan), -1, 1));
  return (
    <group>
      {Array.from({ length: Math.round(n * d) }, (_, i) => (
        <mesh key={i} position={curve.getPointAt(i / n)}>
          <sphereGeometry args={[r, 6, 4]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      <mesh position={tip} quaternion={[axis.x * Math.sin(ang / 2), axis.y * Math.sin(ang / 2), axis.z * Math.sin(ang / 2), Math.cos(ang / 2)]}>
        <coneGeometry args={[r * 3, r * 7, 10]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
};

/**
 * Raios de Sol entrando (amarelos) e calor saindo (vermelho) que bate no cobertor e volta (trapped 0..1).
 * r = raio da Terra; shell = raio do cobertor.
 */
export const GreenhouseArrows: React.FC<{ r?: number; shell?: number; sun?: number; heat?: number; trapped?: number }> = ({ r = 1, shell = 1.25, sun = 1, heat = 1, trapped = 1 }) => {
  const sunArrows: Vec3[][] = [
    [[-3.2, 2.0, 0.6], [-1.6, 1.0, 0.45], [-0.62 * r, 0.42 * r, 0.6 * r]],
    [[-3.4, 0.6, 1.0], [-1.8, 0.3, 0.8], [-0.82 * r, 0.12 * r, 0.56 * r]],
  ];
  const t = clamp(trapped, 0, 1);
  // calor sai da superfície, sobe até o cobertor e (preso) volta
  const heatArrows: Vec3[][] = [0.5, 1.2].map((a) => {
    const out = new Vector3(Math.cos(a), Math.sin(a), 0.4).normalize();
    const p0 = out.clone().multiplyScalar(r * 1.02);
    const p1 = out.clone().multiplyScalar(shell * 0.98);
    const back = new Vector3(Math.cos(a + 0.35), Math.sin(a + 0.35), 0.4).normalize().multiplyScalar(r * 1.05 + (shell - r) * (1 - t) * 3);
    const free = out.clone().multiplyScalar(shell + 1.6);
    const end = back.clone().lerp(free, 1 - t);
    return [p0.toArray(), p1.toArray(), end.toArray()] as Vec3[];
  });
  return (
    <group>
      {sun > 0.01 ? sunArrows.map((p, i) => <CurveArrow key={`s${i}`} pts={p} color="#ffd23a" draw={sun} r={0.045} />) : null}
      {heat > 0.01 ? heatArrows.map((p, i) => <CurveArrow key={`h${i}`} pts={p} color="#ff3a2a" draw={heat} r={0.06} />) : null}
    </group>
  );
};

/** Fumaça de chaminés (puffs cinzas) subindo da superfície até o cobertor. k 0..1 = quantidade. */
export const SmokePuffs: React.FC<{ r?: number; f: number; k?: number }> = ({ r = 1, f, k = 1 }) => (
  <group>
    {Array.from({ length: Math.round(18 * clamp(k, 0, 1)) }, (_, i) => {
      const a = rand(`sm${i}`) * 1.6 + 0.2;
      const b = rand(`smb${i}`) * 1.2 - 0.2;
      const dir = new Vector3(Math.cos(a) * Math.cos(b), Math.sin(b) * 0.6 + 0.4, Math.sin(a) * Math.cos(b)).normalize();
      const ph = (f * 0.012 + rand(`smp${i}`)) % 1;
      const p = dir.multiplyScalar(r * (1.04 + 0.3 * ph));
      return (
        <mesh key={i} position={p.toArray()} scale={0.06 + 0.12 * ph}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#b8b0b8" transparent opacity={0.75 * (1 - ph)} roughness={1} flatShading depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

/* ------------------------------------------------------------------ ESCADA ROLANTE + TERMÔMETRO */

/** Escada rolante subindo para +x/+y. f anima os degraus. n = nº de degraus visíveis. */
const ST = 0.5, RI = 0.36, WD = 1.5;
export const Escalator: React.FC<{ f: number; n?: number; speed?: number }> = ({ f, n = 10, speed = 0.012 }) => {
  const ph = (f * speed) % 1;
  const L = Math.hypot((n - 1) * ST, (n - 1) * RI);
  const ang = Math.atan2(RI, ST);
  const mid: Vec3 = [((n - 1) * ST) / 2, ((n - 1) * RI) / 2, 0];
  return (
    <group>
      {/* degraus (pisada + espelho) */}
      {Array.from({ length: n + 1 }, (_, i) => {
        const k = i + ph - 1;
        if (k < 0 || k > n - 1) return null;
        return (
          <group key={i} position={[k * ST, k * RI, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[ST, 0.07, WD]} />
              <meshStandardMaterial color="#b4bac6" metalness={0.45} roughness={0.35} flatShading />
            </mesh>
            {Array.from({ length: 6 }, (_, j) => (
              <mesh key={j} position={[0, 0.04, -WD / 2 + 0.12 + j * ((WD - 0.24) / 5)]}>
                <boxGeometry args={[ST * 0.92, 0.01, 0.025]} />
                <meshBasicMaterial color="#7a808c" />
              </mesh>
            ))}
            <mesh position={[ST / 2 - 0.03, -RI / 2, 0]}>
              <boxGeometry args={[0.05, RI, WD]} />
              <meshStandardMaterial color="#8a909c" metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[-ST / 2 + 0.04, 0.042, 0]}>
              <boxGeometry args={[0.06, 0.012, WD]} />
              <meshBasicMaterial color="#ffd23a" />
            </mesh>
          </group>
        );
      })}
      {/* laterais de metal escuro + corrimão preto com faixa roxa (marca) */}
      {[-WD / 2 - 0.08, WD / 2 + 0.08].map((z) => (
        <group key={z} position={mid} rotation={[0, 0, ang]}>
          {/* lado de trás: painel alto; lado da frente (z>0): só a saia baixa, para não esconder os degraus */}
          <mesh position={[0, z > 0 ? -0.22 : 0.25, z]}>
            <boxGeometry args={[L + 0.8, z > 0 ? 0.42 : 0.95, 0.12]} />
            <meshStandardMaterial color="#3a3e4a" metalness={0.3} roughness={0.5} flatShading />
          </mesh>
          {z > 0
            ? [-0.4, -0.2, 0, 0.2, 0.4].map((u) => (
                <mesh key={u} position={[u * L, 0.3, z]}>
                  <boxGeometry args={[0.05, 0.9, 0.05]} />
                  <meshStandardMaterial color="#c8ccd6" metalness={0.6} roughness={0.3} />
                </mesh>
              ))
            : null}
          <mesh position={[0, 0.76, z]}>
            <boxGeometry args={[L + 0.9, 0.09, 0.16]} />
            <meshStandardMaterial color="#1a1624" roughness={0.6} />
          </mesh>
          <mesh position={[0, z > 0 ? -0.1 : 0.25, z + (z > 0 ? 0.065 : -0.065)]}>
            <boxGeometry args={[L + 0.6, 0.05, 0.01]} />
            <meshBasicMaterial color="#8b5cf6" toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* patamares de entrada e saída */}
      <mesh position={[-0.7, -0.05, 0]}>
        <boxGeometry args={[1.0, 0.12, WD + 0.4]} />
        <meshStandardMaterial color="#5a5e6a" {...M} />
      </mesh>
      <mesh position={[(n - 1) * ST + 0.7, (n - 1) * RI - 0.05, 0]}>
        <boxGeometry args={[1.0, 0.12, WD + 0.4]} />
        <meshStandardMaterial color="#5a5e6a" {...M} />
      </mesh>
    </group>
  );
};
export const escalatorTop = (k: number, n = 10): Vec3 => [k * (n - 1) * ST, k * (n - 1) * RI + 0.04, 0];

/** Termômetro 3D: tubo de vidro, coluna vermelha (v 0..1), bulbo e marcas. */
export const Thermometer3D: React.FC<{ v: number; h?: number; glow?: number }> = ({ v, h = 3, glow = 0 }) => {
  const k = clamp(v, 0, 1.05);
  const col = h * 0.92 * k;
  return (
    <group>
      <mesh position={[0, h / 2, 0]}>
        <cylinderGeometry args={[0.16, 0.16, h, 20]} />
        <meshStandardMaterial color="#e8f0ff" transparent opacity={0.35} roughness={0.1} />
      </mesh>
      <mesh position={[0, col / 2, 0]}>
        <cylinderGeometry args={[0.09, 0.09, Math.max(0.01, col), 16]} />
        <meshStandardMaterial color="#ff3a2a" emissive="#ff2a1a" emissiveIntensity={0.3 + glow} />
      </mesh>
      <mesh position={[0, -0.18, 0]}>
        <sphereGeometry args={[0.3, 20, 14]} />
        <meshStandardMaterial color="#ff3a2a" emissive="#ff2a1a" emissiveIntensity={0.3 + glow} roughness={0.3} />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={i} position={[0.17, 0.25 + i * (h - 0.4) / 8, 0]}>
          <boxGeometry args={[0.06, 0.02, 0.02]} />
          <meshBasicMaterial color="#2a2240" />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ PACÍFICO EM CORTE (EL NIÑO) v2 */

const lerpC = (a: Color, b: Color, t: number) => a.clone().lerp(b, clamp(t, 0, 1));
/** Profundidade da termoclina (topo da água fria) em x ∈ [−w/2, w/2]: normal = inclinada (grossa a oeste); El Niño = plana. */
const thermo = (x: number, w: number, warm: number, depth: number) => {
  const u = (x + w / 2) / w; // 0 = oeste (Ásia), 1 = leste (América do Sul)
  const normal = -depth * (0.86 - 0.8 * u);
  const nino = -depth * 0.42;
  return normal + (nino - normal) * clamp(warm, 0, 1);
};

/** Ilha low-poly com praia e coqueiros simples. */
const Island: React.FC<{ s?: number; seed: string; trees?: number }> = ({ s = 1, seed, trees = 2 }) => (
  <group scale={s}>
    <mesh position={[0, -0.05, 0]} scale={[1, 0.18, 0.8]}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshStandardMaterial color="#e8d49a" {...M} />
    </mesh>
    <mesh position={[0, 0.06, 0]} scale={[0.8, 0.35, 0.62]}>
      <icosahedronGeometry args={[0.6, 1]} />
      <meshStandardMaterial color="#4f9a4a" {...M} />
    </mesh>
    {Array.from({ length: trees }, (_, i) => {
      const a = rand(`${seed}t${i}`) * Math.PI * 2;
      const p: Vec3 = [Math.cos(a) * 0.25, 0.18, Math.sin(a) * 0.2];
      return (
        <group key={i} position={p}>
          <mesh position={[0, 0.18, 0]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.025, 0.035, 0.36, 5]} />
            <meshStandardMaterial color="#8a6a4a" {...M} />
          </mesh>
          {[0, 1, 2, 3].map((j) => (
            <mesh key={j} position={[0.03, 0.36, 0]} rotation={[0.5, (j * Math.PI) / 2, 0.9]}>
              <coneGeometry args={[0.05, 0.3, 4]} />
              <meshStandardMaterial color="#3f8a3a" {...M} />
            </mesh>
          ))}
        </group>
      );
    })}
  </group>
);

/** América do Sul em corte: faixa costeira + Andes com neve. */
const Andes: React.FC<{ d: number }> = ({ d }) => (
  <group>
    <mesh position={[0.55, -0.2, 0]} scale={[0.9, 0.5, d / 2 + 0.2]}>
      <boxGeometry args={[1.4, 1, 2]} />
      <meshStandardMaterial color="#6f9a4a" {...M} />
    </mesh>
    <mesh position={[-0.12, 0.06, 0]} scale={[0.22, 0.1, d / 2 + 0.2]}>
      <boxGeometry args={[1, 1, 2]} />
      <meshStandardMaterial color="#e8d49a" {...M} />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => {
      const z = -d / 2 + 0.3 + (i / 6) * (d - 0.6);
      const h = 0.8 + rand(`an${i}`) * 0.5;
      return (
        <group key={i} position={[0.65 + (rand(`ax${i}`) - 0.5) * 0.3, 0.25, z]}>
          <mesh position={[0, h / 2, 0]}>
            <coneGeometry args={[0.38, h, 6]} />
            <meshStandardMaterial color="#8a7a66" {...M} />
          </mesh>
          <mesh position={[0, h * 0.82, 0]}>
            <coneGeometry args={[0.16, h * 0.36, 6]} />
            <meshStandardMaterial color="#f4f6f8" {...M} />
          </mesh>
        </group>
      );
    })}
  </group>
);

/** Nuvem low-poly (chuva opcional). */
const Cloud: React.FC<{ s?: number; rain?: number; f: number }> = ({ s = 1, rain = 0, f }) => (
  <group scale={s}>
    {[[-0.4, 0, 0, 0.42], [0, 0.12, 0.05, 0.55], [0.42, 0, -0.05, 0.4], [0.1, -0.05, 0.3, 0.38]].map(([x, y, z, r], i) => (
      <mesh key={i} position={[x, y, z]}>
        <icosahedronGeometry args={[r, 1]} />
        <meshStandardMaterial color="#e8e4ee" roughness={1} flatShading />
      </mesh>
    ))}
    {rain > 0.01
      ? Array.from({ length: 14 }, (_, i) => {
          const ph = (f * 0.05 + rand(`rn${i}`)) % 1;
          return (
            <mesh key={i} position={[(rand(`rx${i}`) - 0.5) * 1.1, -0.35 - ph * 1.6, (rand(`rz${i}`) - 0.5) * 0.6]}>
              <boxGeometry args={[0.015, 0.14, 0.015]} />
              <meshBasicMaterial color="#9fd0ff" transparent opacity={rain * (1 - ph)} />
            </mesh>
          );
        })
      : null}
  </group>
);

/** Seta de vento (fita branca curva) apontando para −x (alísios). */
const WindArrow: React.FC<{ len?: number; v?: number; ph: number }> = ({ len = 2.4, v = 1, ph }) => {
  const k = clamp(v, 0, 1);
  if (k < 0.02) return null;
  const n = 18;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const u = i / (n - 1);
        const x = len / 2 - u * len;
        const y = Math.sin(u * Math.PI * 2 + ph) * 0.06;
        return (
          <mesh key={i} position={[x, y, 0]} scale={k}>
            <sphereGeometry args={[0.035, 6, 4]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.85} />
          </mesh>
        );
      })}
      <mesh position={[-len / 2 - 0.08, 0, 0]} rotation={[0, 0, Math.PI / 2]} scale={k}>
        <coneGeometry args={[0.1, 0.24, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  );
};

/**
 * Pacífico equatorial em corte (diorama): Ásia/Austrália (ilhas) a oeste (−x), América do Sul (Andes) a leste (+x).
 * Normal (warm 0): alísios fortes empurram a água quente para oeste (camada quente grossa lá), água fria sobe perto da
 * América do Sul, nuvens/chuva a oeste. El Niño (warm 1): ventos fracos, a camada quente "escorrega" para leste,
 * mancha quente no Pacífico central/leste, nuvens vão junto. plumes 0..1: ondas de calor subindo.
 */
export const PacificSlice: React.FC<{ f: number; warm?: number; plumes?: number; w?: number; d?: number }> = ({ f, warm = 0, plumes = 0, w = 10, d = 4 }) => {
  const wk = clamp(warm, 0, 1.2);
  const depth = 2.0;
  // superfície
  const base = useMemo(() => new PlaneGeometry(w, d, 90, 36).rotateX(-Math.PI / 2), [w, d]);
  const geo = useMemo(() => {
    const g = base.clone();
    g.setAttribute("color", new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, [base]);
  const pos = geo.attributes.position, col = geo.attributes.color, bp = base.attributes.position;
  const warmPool = C("#36b0b8"), coolE = C("#1c5f9e"), upw = C("#1a4f8a"), hot = C("#ff5a3a"), hot2 = C("#ffb04a"), foam = C("#e8f6fa");
  for (let i = 0; i < pos.count; i++) {
    const x = bp.getX(i), z = bp.getZ(i);
    const u = (x + w / 2) / w;
    const y = Math.sin(x * 2.3 + f * 0.09 + z) * 0.03 + Math.sin(z * 3.1 - f * 0.08 + x * 0.7) * 0.02;
    pos.setY(i, y);
    // normal: quente a oeste, frio a leste (ressurgência perto da costa)
    let c = lerpC(warmPool, coolE, u);
    c = lerpC(c, upw, clamp((u - 0.8) / 0.2, 0, 1) * (1 - wk));
    // El Niño: anomalia quente central/leste, faixa equatorial
    const g = Math.exp(-((x - 1.0) ** 2) / (2 * 2.4 ** 2) - (z ** 2) / (2 * 0.8 ** 2)) * wk;
    c = lerpC(c, hot, g * 1.25);
    if (g > 0.75) c = lerpC(c, hot2, (g - 0.75) / 0.35);
    if (y > 0.042) c = lerpC(c, foam, (y - 0.042) / 0.01);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeVertexNormals();

  // corte frontal: camada quente acima da termoclina, fria abaixo
  const NX = 120, NY = 60;
  const sec = useMemo(() => {
    const g = new PlaneGeometry(w, depth, NX, NY);
    g.setAttribute("color", new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, [w]);
  const sp = sec.attributes.position, sc = sec.attributes.color;
  const warmL = C("#2fa6b4"), warmLn = C("#ff7a3a"), deep = C("#0d2a5a"), deep2 = C("#081a3a");
  for (let i = 0; i < sp.count; i++) {
    const x = sp.getX(i), yy = sp.getY(i) - depth / 2; // y de 0 (topo) a −depth
    const th = thermo(x, w, wk, depth);
    const above = yy > th;
    let c: Color;
    if (above) {
      const g = Math.exp(-((x - 1.0) ** 2) / (2 * 2.6 ** 2)) * wk;
      c = lerpC(warmL, warmLn, g);
    } else c = lerpC(deep, deep2, clamp(-yy / depth, 0, 1));
    if (Math.abs(yy - th) < depth / NY * 1.1) c = C("#e8f6fa");
    sc.setXYZ(i, c.r, c.g, c.b);
  }
  sc.needsUpdate = true;
  const ph = f * 0.12;
  const wind = 1 - 0.85 * clamp(wk, 0, 1);
  const cloudX = -3.2 + 4.4 * clamp(wk, 0, 1);
  return (
    <group>
      <mesh geometry={geo} receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.3} metalness={0.05} />
      </mesh>
      {/* corte frontal e lateral */}
      <mesh geometry={sec} position={[0, -depth / 2, d / 2]}>
        <meshStandardMaterial vertexColors roughness={0.6} />
      </mesh>
      <mesh position={[0, -depth / 2, -d / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial color="#0a2048" />
      </mesh>
      {/* fundo do mar */}
      <mesh position={[0, -depth - 0.06, 0]}>
        <boxGeometry args={[w + 0.1, 0.12, d + 0.1]} />
        <meshStandardMaterial color="#3a3242" {...M} />
      </mesh>
      {/* ressurgência (água fria subindo perto da América do Sul) — some no El Niño */}
      {wk < 0.95
        ? [0, 1].map((i) => {
            const ph2 = (f * 0.012 + i * 0.5) % 1;
            return (
              <mesh key={i} position={[w / 2 - 0.6 - i * 0.5, -depth + 0.3 + ph2 * (depth - 0.5), d / 2 + 0.02]} rotation={[0, 0, 0]}>
                <coneGeometry args={[0.12, 0.3, 8]} />
                <meshBasicMaterial color="#9fd8ff" transparent opacity={(1 - wk) * (1 - ph2) * 0.9} />
              </mesh>
            );
          })
        : null}
      {/* continentes */}
      <group position={[-w / 2 - 0.35, 0, -0.6]}>
        <Island s={1.6} seed="i1" trees={3} />
      </group>
      <group position={[-w / 2 + 0.6, 0, 0.9]}>
        <Island s={1.1} seed="i2" />
      </group>
      <group position={[-w / 2 + 0.2, 0, -1.6]}>
        <Island s={0.9} seed="i3" trees={1} />
      </group>
      <group position={[w / 2 + 0.15, 0, 0]}>
        <Andes d={d} />
      </group>
      {/* alísios */}
      {[-0.9, 0.4].map((z, i) => (
        <group key={i} position={[0.6 + i * 1.6, 0.55 + i * 0.12, z]}>
          <WindArrow len={2.6} v={wind} ph={ph + i} />
        </group>
      ))}
      {/* nuvens de chuva acompanham a água quente */}
      <group position={[cloudX, 1.5, -0.4]}>
        <Cloud s={1.1} rain={0.9} f={f} />
      </group>
      <group position={[cloudX + 1.2, 1.35, 0.6]}>
        <Cloud s={0.8} rain={0.7} f={f + 13} />
      </group>
      {/* ondas de calor subindo */}
      {plumes > 0.01
        ? Array.from({ length: 16 }, (_, i) => {
            const x = 1.0 + (rand(`pl${i}`) - 0.5) * 4.2;
            const z = (rand(`plz${i}`) - 0.5) * 1.2;
            const p2 = (f * 0.01 + rand(`plp${i}`)) % 1;
            return (
              <mesh key={i} position={[x + Math.sin(p2 * 9 + i) * 0.12, p2 * 3.2 * plumes, z]} scale={[0.22 * (1 - p2 * 0.4), 0.42, 0.22 * (1 - p2 * 0.4)]}>
                <sphereGeometry args={[1, 10, 8]} />
                <meshBasicMaterial color="#ffc890" transparent opacity={0.75 * (1 - p2) * clamp(plumes, 0, 1)} depthWrite={false} toneMapped={false} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};
