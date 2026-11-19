import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, Color, DoubleSide, PlaneGeometry, Quaternion, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "O Jack cabia na porta?" — elementos novos, desenhados por nós (nada do visual do filme).
// Escala: METROS (1 u = 1 m) nas cenas de perto; o navio é uma miniatura de fundo.
// Regra do render contínuo: o que faz fade usa transparent SEMPRE true (só a opacidade anima).
const M = { roughness: 0.8, metalness: 0, flatShading: true } as const;
const C = (h: string) => new Color(h);

const Box: React.FC<{ p: Vec3; s: Vec3; c: string; r?: Vec3; e?: string; ei?: number; rough?: number }> = ({ p, s, c, r, e, ei, rough }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} {...M} roughness={rough ?? 0.8} emissive={e} emissiveIntensity={ei} />
  </mesh>
);
const Rod: React.FC<{ a: Vec3; b: Vec3; r: number; c: string; seg?: number }> = ({ a, b, r, c, seg = 6 }) => {
  const va = new Vector3(...a), vb = new Vector3(...b);
  const dir = vb.clone().sub(va);
  const q = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={va.add(vb).multiplyScalar(0.5).toArray() as Vec3} quaternion={q} castShadow>
      <cylinderGeometry args={[r, r, dir.length(), seg]} />
      <meshStandardMaterial color={c} {...M} />
    </mesh>
  );
};

/* ------------------------------------------------------------------ MAR À NOITE (v2) */

/** Ondulação do mar (mesma conta no shader de vértices e para os objetos boiarem). */
export const seaY = (x: number, z: number, f: number, calm = 1) => {
  const t = f / 30;
  const w1 = 1 - Math.abs(Math.sin(x * 0.42 + z * 0.18 + t * 0.9)); // cristas mais pontudas
  const w2 = 1 - Math.abs(Math.sin(x * -0.25 + z * 0.55 + t * 0.7 + 1.3));
  const w3 = Math.sin(x * 1.3 + z * 0.9 - t * 1.6) * 0.5 + Math.sin(x * 2.1 - z * 1.7 + t * 2.1) * 0.25;
  return (w1 * 0.14 + w2 * 0.1 + w3 * 0.035 - 0.12) * calm;
};

/**
 * Mar noturno v2: cristas pontudas, degradê para o horizonte (névoa), trilha de luz da lua com brilhos
 * e espuma nas cristas. Cores de vértice sem depender das luzes do estúdio (meshBasic).
 */
export const NightSea: React.FC<{ f: number; size?: number; moonX?: number; calm?: number; seg?: number }> = ({ f, size = 70, moonX = 4, calm = 1, seg = 130 }) => {
  const base = useMemo(() => new PlaneGeometry(size, size, seg, seg).rotateX(-Math.PI / 2), [size, seg]);
  const geo = useMemo(() => {
    const g = base.clone();
    g.setAttribute("color", new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, [base]);
  const pos = geo.attributes.position, col = geo.attributes.color, bp = base.attributes.position;
  const trough = C("#031427"), body = C("#0b3152"), crest = C("#1d5a82"), foam = C("#cfe6f5"), haze = C("#1e3a5e"), glint = C("#f4ecd0");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = bp.getX(i), z = bp.getZ(i);
    const y = seaY(x, z, f, calm);
    pos.setY(i, y);
    const h = clamp((y / Math.max(0.05, calm) + 0.12) / 0.26, 0, 1); // 0 vale .. 1 crista
    c.copy(trough).lerp(body, clamp(h * 1.4, 0, 1)).lerp(crest, clamp((h - 0.6) * 2.2, 0, 1));
    // espuma só nas cristas mais altas, salpicada
    const fleck = rand(`sf${i % 997}`) > 0.82 ? 1 : 0;
    c.lerp(foam, clamp((h - 0.9) * 8, 0, 1) * 0.55 * fleck);
    // trilha da lua: faixa estreita perto, larga longe; brilhos nas cristas
    const far = clamp(-z / (size / 2), 0, 1);
    const band = Math.exp(-((x - moonX * far) ** 2) / (0.4 + far * 6)) * clamp(far * 1.6, 0, 1);
    c.lerp(C("#6a8cb0"), band * 0.45 * h).lerp(glint, band * clamp((h - 0.7) * 3, 0, 1) * 0.8);
    // névoa no horizonte
    c.lerp(haze, clamp((far - 0.35) * 1.3, 0, 0.85));
    col.setXYZ(i, c.r, c.g, c.b);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  return (
    <mesh geometry={geo}>
      <meshBasicMaterial vertexColors />
    </mesh>
  );
};

/** Pedaços de gelo / destroços boiando (pequenos, espalhados). */
export const Debris: React.FC<{ f: number; n?: number; R?: number }> = ({ f, n = 26, R = 9 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const a = rand(`da${i}`) * Math.PI * 2, r = 1.6 + rand(`dr${i}`) * R;
      const x = Math.cos(a) * r, z = Math.sin(a) * r - 2;
      const ice = i % 3 !== 0;
      return (
        <mesh key={i} position={[x, seaY(x, z, f) + 0.01, z]} rotation={[0.1 * Math.sin(f / 20 + i), rand(`dy${i}`) * 3, 0]} scale={ice ? [0.12 + rand(`ds${i}`) * 0.16, 0.05, 0.1 + rand(`dt${i}`) * 0.14] : [0.45, 0.04, 0.1]}>
          {ice ? <dodecahedronGeometry args={[1, 0]} /> : <boxGeometry args={[1, 1, 1]} />}
          {ice ? <meshStandardMaterial color="#dcecf6" roughness={0.2} flatShading /> : <meshStandardMaterial color="#6a4a2e" {...M} />}
        </mesh>
      );
    })}
  </group>
);

/* ------------------------------------------------------------------ TRANSATLÂNTICO DE 1912 (miniatura) */

/**
 * Transatlântico de 4 chaminés (navio histórico de 1912, desenho próprio). Comprimento ~27 u (1 u ≈ 10 m).
 * Proa para +x. sink 0..1: inclina (popa para cima) e afunda. lights 0..1: escotilhas acesas.
 */
export const Liner1912: React.FC<{ f: number; sink?: number; lights?: number }> = ({ f, sink = 0, lights = 1 }) => {
  const sk = clamp(sink, 0, 1);
  const L = 27, H = 2.0, W = 2.8;
  const flick = lights * (Math.sin(f * 0.7) > -0.9 ? 1 : 0.4);
  const ports = useMemo(() => Array.from({ length: 60 }, (_, i) => ({ x: -L / 2 + 1.2 + (i % 30) * ((L - 3) / 30), y: i < 30 ? 1.25 : 0.85, on: rand(`po${i}`) > 0.25 })), []);
  return (
    <group rotation={[0, 0, -sk * 0.5]} position={[-sk * 2, -sk * 3.2, 0]}>
      {/* casco: preto em cima, faixa vermelha embaixo (linha d'água) */}
      <Box p={[0, H / 2 + 0.4, 0]} s={[L, H, W]} c="#15151a" />
      <Box p={[0, 0.2, 0]} s={[L - 0.6, 0.8, W - 0.2]} c="#8a2a22" />
      {/* proa em cunha */}
      <mesh position={[L / 2 + 1.0, H / 2 + 0.3, 0]} rotation={[0, 0, 0]} scale={[2.0, H + 0.6, W / 2]} castShadow>
        <coneGeometry args={[1, 1, 3, 1]} />
        <meshStandardMaterial color="#15151a" {...M} />
      </mesh>
      {/* popa arredondada */}
      <mesh position={[-L / 2, H / 2 + 0.4, 0]} scale={[1.2, H, W / 2]}>
        <cylinderGeometry args={[1, 1, 1, 10, 1, false, Math.PI, Math.PI]} />
        <meshStandardMaterial color="#15151a" {...M} side={DoubleSide} />
      </mesh>
      {/* faixa dourada e conveses brancos */}
      <Box p={[0, H + 0.42, 0]} s={[L + 0.1, 0.06, W + 0.02]} c="#c9a24a" />
      <Box p={[-0.5, H + 0.85, 0]} s={[L - 4, 0.8, W - 0.4]} c="#ece8de" />
      <Box p={[-0.8, H + 1.5, 0]} s={[L - 8, 0.5, W - 0.8]} c="#e2ddd0" />
      <Box p={[6.5, H + 1.55, 0]} s={[2.4, 0.6, W - 1.0]} c="#ece8de" />
      {/* 4 chaminés cor de couro com topo preto, levemente inclinadas */}
      {[-7.5, -3.0, 1.5, 6.0].map((x, i) => (
        <group key={i} position={[x * 0.9, H + 1.75, 0]} rotation={[0, 0, 0.1]}>
          <mesh position={[0, 1.2, 0]} castShadow>
            <cylinderGeometry args={[0.55, 0.62, 2.4, 14]} />
            <meshStandardMaterial color="#c88a3a" {...M} />
          </mesh>
          <mesh position={[0, 2.5, 0]}>
            <cylinderGeometry args={[0.56, 0.56, 0.4, 14]} />
            <meshStandardMaterial color="#121214" {...M} />
          </mesh>
        </group>
      ))}
      {/* botes nos turcos (convés dos botes), dos dois lados */}
      {[-9.5, -8.3, -7.1, -1.2, 0, 1.2, 4.6, 5.8].map((x, i) =>
        [1, -1].map((s) => (
          <group key={`b${i}${s}`} position={[x, H + 1.9, (W / 2 - 0.55) * s]}>
            <mesh scale={[0.5, 0.14, 0.17]}>
              <sphereGeometry args={[1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
              <meshStandardMaterial color="#f2efe6" {...M} side={DoubleSide} />
            </mesh>
            <Rod a={[-0.42, -0.05, 0]} b={[-0.42, 0.3, 0.12 * s]} r={0.02} c="#2a2a30" seg={4} />
            <Rod a={[0.42, -0.05, 0]} b={[0.42, 0.3, 0.12 * s]} r={0.02} c="#2a2a30" seg={4} />
          </group>
        )),
      )}
      {/* ventiladores (bocais) */}
      {[-5.2, -0.8, 3.6, 8.2].map((x, i) => (
        <group key={`v${i}`} position={[x, H + 1.85, 0.6 * (i % 2 ? 1 : -1)]}>
          <Rod a={[0, 0, 0]} b={[0, 0.4, 0]} r={0.06} c="#e2ddd0" seg={6} />
          <mesh position={[0.06, 0.45, 0]} rotation={[0, 0, -Math.PI / 2]}>
            <cylinderGeometry args={[0.11, 0.07, 0.14, 8]} />
            <meshStandardMaterial color="#e2ddd0" {...M} />
          </mesh>
        </group>
      ))}
      {/* fumaça leve saindo das 3 primeiras chaminés */}
      {[6.0, 1.5, -3.0].map((x, i) =>
        Array.from({ length: 4 }, (_, j) => {
          const ph = (f * 0.01 + j / 4 + i * 0.3) % 1;
          return (
            <mesh key={`sm${i}${j}`} position={[x * 0.9 - 0.3 - ph * 2.2, H + 4.6 + ph * 1.6, 0]} scale={0.4 + ph * 0.9}>
              <icosahedronGeometry args={[1, 1]} />
              <meshStandardMaterial color="#5a5a66" transparent opacity={0.35 * (1 - ph) * (1 - sk)} depthWrite={false} flatShading />
            </mesh>
          );
        }),
      )}
      {/* mastros e cordame */}
      <Rod a={[11, H + 0.4, 0]} b={[11.4, H + 6.5, 0]} r={0.06} c="#3a3028" />
      <Rod a={[-10.5, H + 0.4, 0]} b={[-10.8, H + 6.0, 0]} r={0.06} c="#3a3028" />
      <Rod a={[11.4, H + 6.4, 0]} b={[-10.8, H + 5.9, 0]} r={0.015} c="#3a3028" />
      {/* escotilhas acesas (dos dois lados) */}
      {ports.map((p, i) =>
        [1, -1].map((s) => (
          <mesh key={`${i}${s}`} position={[p.x, p.y, (W / 2 + 0.01) * s]} rotation={[0, s > 0 ? 0 : Math.PI, 0]}>
            <circleGeometry args={[0.09, 6]} />
            <meshBasicMaterial color={p.on && flick > 0.5 ? "#ffd27a" : "#2a2a34"} toneMapped={false} />
          </mesh>
        )),
      )}
      {/* janelas dos conveses */}
      {Array.from({ length: 18 }, (_, i) => (
        <mesh key={`w${i}`} position={[-L / 2 + 3 + i * 1.25, H + 0.95, W / 2 - 0.19]}>
          <planeGeometry args={[0.5, 0.25]} />
          <meshBasicMaterial color={lights > 0.5 && rand(`dw${i}`) > 0.2 ? "#ffe2a0" : "#2a2a34"} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ PAINEL ENTALHADO ("a porta") */

const OAK = "#c9a172", OAK_D = "#8f6438", OAK_L = "#e0bf8e";
/**
 * Painel de madeira entalhada (~2,0 × 0,95 m, 8 cm), deitado em XZ (comprimento em x, largura em z), topo em y = 0.08.
 * Moldura em relevo, medalhão oval no centro, volutas e rosetas. wet 0..1 escurece (molhado).
 */
export const WoodPanel: React.FC<{ wet?: number; s?: number }> = ({ wet = 0, s = 1 }) => {
  const k = 1 - 0.25 * clamp(wet, 0, 1);
  const tone = (h: string) => C(h).multiplyScalar(k).getStyle();
  const Lx = 2.0, Wz = 0.95, T = 0.08;
  return (
    <group scale={s}>
      <mesh position={[0, T / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[Lx, T, Wz]} />
        <meshStandardMaterial color={tone(OAK)} {...M} roughness={0.7} />
      </mesh>
      {/* veios da madeira */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`gr${i}`} position={[0, T + 0.001, -Wz / 2 + 0.1 + i * ((Wz - 0.2) / 8)]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[Lx - 0.2, 0.006]} />
          <meshBasicMaterial color={tone(OAK_D)} transparent opacity={0.35} />
        </mesh>
      ))}
      {/* borda chanfrada (lateral mais escura) */}
      <mesh position={[0, T / 2, 0]} scale={[1.006, 0.9, 1.012]}>
        <boxGeometry args={[Lx, T, Wz]} />
        <meshStandardMaterial color={tone(OAK_D)} {...M} />
      </mesh>
      {/* moldura em relevo */}
      {[[0, Wz / 2 - 0.05, Lx - 0.06, 0.06], [0, -Wz / 2 + 0.05, Lx - 0.06, 0.06]].map(([x, z, l, w], i) => (
        <Box key={`h${i}`} p={[x, T + 0.012, z]} s={[l, 0.024, w]} c={tone(OAK_L)} />
      ))}
      {[Lx / 2 - 0.05, -Lx / 2 + 0.05].map((x, i) => (
        <Box key={`v${i}`} p={[x, T + 0.012, 0]} s={[0.06, 0.024, Wz - 0.06]} c={tone(OAK_L)} />
      ))}
      {/* medalhão oval */}
      <mesh position={[0, T + 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 1, 1]}>
        <torusGeometry args={[0.2, 0.022, 6, 28]} />
        <meshStandardMaterial color={tone(OAK_L)} {...M} />
      </mesh>
      <mesh position={[0, T + 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[1.55, 1, 1]}>
        <circleGeometry args={[0.18, 28]} />
        <meshStandardMaterial color={tone(OAK_D)} {...M} />
      </mesh>
      {/* volutas (meias-luas) dos dois lados do medalhão */}
      {[-1, 1].map((sd) =>
        [0.62, 0.36].map((x, j) => (
          <mesh key={`${sd}${j}`} position={[x * sd, T + 0.01, 0]} rotation={[-Math.PI / 2, 0, sd > 0 ? 0 : Math.PI]}>
            <torusGeometry args={[0.1 - j * 0.02, 0.016, 5, 16, Math.PI * 1.4]} />
            <meshStandardMaterial color={tone(OAK_L)} {...M} />
          </mesh>
        )),
      )}
      {/* folhas entalhadas */}
      {[-1, 1].map((sd) =>
        [-1, 1].map((sz) => (
          <mesh key={`l${sd}${sz}`} position={[0.82 * sd, T + 0.012, 0.28 * sz]} rotation={[-Math.PI / 2, 0, (sd * sz * Math.PI) / 4]} scale={[1, 0.45, 1]}>
            <circleGeometry args={[0.07, 5]} />
            <meshStandardMaterial color={tone(OAK_D)} {...M} />
          </mesh>
        )),
      )}
      {/* rosetas nos cantos */}
      {[-1, 1].map((sd) =>
        [-1, 1].map((sz) => (
          <mesh key={`r${sd}${sz}`} position={[(Lx / 2 - 0.13) * sd, T + 0.02, (Wz / 2 - 0.13) * sz]}>
            <sphereGeometry args={[0.035, 8, 5]} />
            <meshStandardMaterial color={tone(OAK_D)} {...M} />
          </mesh>
        )),
      )}
    </group>
  );
};

/* ------------------------------------------------------------------ VITRINE DE MUSEU */

/** Vitrine com o fragmento original (pedaço quebrado do painel) e placa. */
export const MuseumCase: React.FC = () => (
  <group>
    <Box p={[0, 0.45, 0]} s={[1.2, 0.9, 0.8]} c="#2a2232" />
    <Box p={[0, 0.92, 0]} s={[1.26, 0.04, 0.86]} c="#d8c8a0" />
    {/* fragmento: pedaço irregular do painel, inclinado */}
    <group position={[0, 1.05, 0]} rotation={[-0.5, 0, 0]} scale={[0.45, 1, 0.55]}>
      <WoodPanel wet={0.6} />
    </group>
    <mesh position={[0, 1.4, 0]}>
      <boxGeometry args={[1.2, 0.9, 0.8]} />
      <meshStandardMaterial color="#cfe8f4" transparent opacity={0.16} roughness={0.05} metalness={0.2} depthWrite={false} />
    </mesh>
    <Box p={[0, 1.86, 0]} s={[1.22, 0.03, 0.82]} c="#d8c8a0" />
    {/* placa */}
    <mesh position={[0, 0.6, 0.41]}>
      <planeGeometry args={[0.6, 0.18]} />
      <meshStandardMaterial color="#c9a24a" metalness={0.5} roughness={0.35} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ BOTE SALVA-VIDAS (v2) */

/** Casco "duas proas" (baleeira) feito por seções: L comprimento, W boca, D pontal. Branco por fora. */
const useHull = (L: number, W: number, D: number) =>
  useMemo(() => {
    const N = 28, Mn = 10;
    const pos: number[] = [], idx: number[] = [];
    for (let i = 0; i <= N; i++) {
      const u = i / N, x = (u - 0.5) * L;
      const k = Math.sqrt(Math.max(0, 1 - (2 * u - 1) ** 2)) ** 0.8; // afina nas pontas
      const sheer = 0.12 * (2 * u - 1) ** 2; // borda sobe nas pontas
      for (let j = 0; j <= Mn; j++) {
        const th = (j / Mn) * Math.PI;
        pos.push(x, sheer - D * Math.sin(th) * (0.35 + 0.65 * k), (W / 2) * Math.cos(th) * k);
      }
    }
    for (let i = 0; i < N; i++)
      for (let j = 0; j < Mn; j++) {
        const a0 = i * (Mn + 1) + j, a1 = a0 + Mn + 1;
        idx.push(a0, a1, a0 + 1, a1, a1 + 1, a0 + 1);
      }
    const g = new BufferGeometry();
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }, [L, W, D]);

/** Passageiro sentado (casaco escuro, cabeça, gorro/chapéu). Bem simples, para preencher o bote. */
const Seated: React.FC<{ p: Vec3; seed: number; f: number }> = ({ p, seed, f }) => {
  const coats = ["#2a2a34", "#3a2e2a", "#2e3a4a", "#4a3a5a", "#5a4a3a"];
  const skin = ["#e8c4a0", "#c89a72", "#a8744e", "#f0d0b0"][seed % 4];
  const sh = 0.02 * Math.sin(f / 4 + seed * 2); // tremendo de frio
  return (
    <group position={[p[0] + sh, p[1], p[2]]}>
      <mesh position={[0, 0.28, 0]} scale={[0.2, 0.3, 0.17]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color={coats[seed % coats.length]} {...M} />
      </mesh>
      <mesh position={[0, 0.66, 0]} castShadow>
        <sphereGeometry args={[0.11, 10, 8]} />
        <meshStandardMaterial color={skin} {...M} />
      </mesh>
      <mesh position={[0, 0.74, 0]} scale={[1, 0.55, 1]}>
        <sphereGeometry args={[0.115, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={seed % 2 ? "#1a1a20" : "#6a3a3a"} {...M} />
      </mesh>
    </group>
  );
};

/** Bote salva-vidas de madeira (~9 m, baleeira branca) com tábuas, bancos, remos, passageiros e lanterna. Proa +x. */
export const Lifeboat: React.FC<{ f: number; row?: number; people?: number; lamp?: number }> = ({ f, row = 1, people = 6, lamp = 1 }) => {
  const L = 8.4, W = 2.2, D = 0.85;
  const hull = useHull(L, W, D);
  const a = Math.sin(f * 0.12) * 0.45 * row;
  const roll = 0.03 * Math.sin(f / 22), pitch = 0.02 * Math.sin(f / 31 + 1);
  return (
    <group rotation={[roll, 0, pitch]}>
      <mesh geometry={hull} castShadow receiveShadow>
        <meshStandardMaterial color="#f2efe6" {...M} roughness={0.6} side={DoubleSide} />
      </mesh>
      {/* tábuas (linhas do costado) */}
      {[0.2, 0.42, 0.62].map((t, k) =>
        [1, -1].map((s) => (
          <mesh key={`${k}${s}`} position={[0, -D * t + 0.02, (W / 2) * (1 - t * 0.35) * s]} scale={[L * (0.48 - t * 0.12), 1, 1]}>
            <boxGeometry args={[2, 0.012, 0.012]} />
            <meshStandardMaterial color="#b8b4aa" />
          </mesh>
        )),
      )}
      {/* borda de madeira (alcatrate) */}
      {[1, -1].map((s) => (
        <mesh key={`g${s}`} position={[0, 0.04, (W / 2 - 0.02) * s]} scale={[L * 0.47, 1, 1]}>
          <boxGeometry args={[2, 0.06, 0.07]} />
          <meshStandardMaterial color="#9a6a3c" {...M} />
        </mesh>
      ))}
      {/* faixa e número na proa */}
      <mesh position={[0, -0.12, W / 2 - 0.005]} scale={[L * 0.44, 1, 1]}>
        <boxGeometry args={[2, 0.05, 0.01]} />
        <meshStandardMaterial color="#3a5a8a" />
      </mesh>
      {/* fundo e bancos */}
      <mesh position={[0, -D * 0.62, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[L * 0.4, W * 0.32, 1]}>
        <circleGeometry args={[1, 20]} />
        <meshStandardMaterial color="#8f6438" {...M} />
      </mesh>
      {[-2.4, -1.1, 0.2, 1.5, 2.6].map((x, i) => (
        <Box key={i} p={[x, -0.18, 0]} s={[0.26, 0.05, W * Math.sqrt(1 - (x / (L / 2)) ** 2) - 0.1]} c="#a87a4a" />
      ))}
      {/* passageiros */}
      {Array.from({ length: people }, (_, i) => {
        const x = -2.4 + (i % 5) * 1.3, z = (i < 5 ? 0.35 : -0.35) * (i % 2 ? 1 : -1);
        return <Seated key={i} p={[x, -0.15, z]} seed={i + 3} f={f} />;
      })}
      {/* remos */}
      {[-1.7, -0.4, 0.9].map((x, i) =>
        [1, -1].map((s) => (
          <group key={`o${i}${s}`} position={[x, 0.06, (W / 2) * s]} rotation={[s * (0.42 + a * 0.25), a * 0.8, 0]}>
            <Rod a={[0, 0, -0.5 * s]} b={[0, 0, 2.4 * s]} r={0.03} c="#c9a172" />
            <Box p={[0, 0, 2.5 * s]} s={[0.14, 0.02, 0.5]} c="#c9a172" />
          </group>
        )),
      )}
      {/* lanterna com halo */}
      {lamp > 0.01 ? (
        <group position={[3.3, 0, 0]}>
          <Rod a={[0, 0, 0]} b={[0, 1.1, 0]} r={0.03} c="#3a3028" />
          <mesh position={[0, 1.18, 0]}>
            <boxGeometry args={[0.15, 0.2, 0.15]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
          <mesh position={[0, 1.18, 0]}>
            <sphereGeometry args={[0.45, 14, 10]} />
            <meshBasicMaterial color="#ffb050" transparent opacity={0.1 * lamp} depthWrite={false} toneMapped={false} />
          </mesh>
          <pointLight position={[0, 1.2, 0]} intensity={2.4 * lamp} distance={7} color="#ffc070" />
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ COLETE SALVA-VIDAS (1912: lona branca com cortiça) */

/** Colete de cortiça de 1912 aberto e achatado (para ir embaixo do painel): blocos creme com tiras. */
export const LifeJacket: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <group scale={s}>
    {[-0.24, 0, 0.24].map((x, i) =>
      [-0.13, 0.13].map((z, j) => (
        <mesh key={`${i}${j}`} position={[x, 0, z]} castShadow>
          <boxGeometry args={[0.2, 0.09, 0.22]} />
          <meshStandardMaterial color="#efe6cf" {...M} />
        </mesh>
      )),
    )}
    {[-0.12, 0.12].map((x, i) => (
      <Box key={`t${i}`} p={[x, 0.05, 0]} s={[0.03, 0.012, 0.6]} c="#c8b88a" />
    ))}
    <Box p={[0, 0.05, 0]} s={[0.75, 0.012, 0.03]} c="#c8b88a" />
  </group>
);

/* ------------------------------------------------------------------ CORTE DA ÁGUA (flutuação) */

/**
 * Corte de água visto de lado: fundo em degradê, frente transparente, linha d'água marcada.
 * Topo da água em y = 0. w × h × d.
 */
export const WaterSlice: React.FC<{ f: number; w?: number; h?: number; d?: number }> = ({ f, w = 4.4, h = 1.8, d = 2.2 }) => (
  <group>
    <mesh position={[0, -h / 2, -d / 2]}>
      <planeGeometry args={[w, h]} />
      <meshStandardMaterial color="#0e2a48" roughness={0.6} />
    </mesh>
    <mesh position={[0, -h / 2, 0]}>
      <boxGeometry args={[w, h, d]} />
      <meshStandardMaterial color="#2a6aa8" transparent opacity={0.38} roughness={0.15} depthWrite={false} />
    </mesh>
    <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[w, d, 24, 8]} />
      <meshStandardMaterial color="#5a9ad0" transparent opacity={0.55} roughness={0.1} depthWrite={false} />
    </mesh>
    {/* linha d'água na frente (tracejada) */}
    {Array.from({ length: 22 }, (_, i) => (
      <mesh key={i} position={[-w / 2 + 0.1 + i * (w / 22), 0.003 + Math.sin(f * 0.1 + i) * 0.005, d / 2 + 0.01]}>
        <boxGeometry args={[w / 44, 0.02, 0.01]} />
        <meshBasicMaterial color="#cfe8ff" toneMapped={false} />
      </mesh>
    ))}
    {/* camadas mais escuras com a profundidade */}
    {[0.35, 0.65].map((t, i) => (
      <mesh key={`dl${i}`} position={[0, -h * t - (h * 0.35) / 2 + 0.1, d / 2 + 0.004]}>
        <planeGeometry args={[w, h * 0.35]} />
        <meshBasicMaterial color="#04142a" transparent opacity={0.18 + i * 0.12} depthWrite={false} />
      </mesh>
    ))}
    {/* bolhas subindo */}
    {Array.from({ length: 14 }, (_, i) => {
      const ph = (f * 0.012 + rand(`bb${i}`)) % 1;
      return (
        <mesh key={`bu${i}`} position={[-w / 2 + 0.3 + rand(`bx${i}`) * (w - 0.6), -h + 0.1 + ph * (h - 0.15), d / 2 - 0.2 - rand(`bz${i}`) * 0.6]} scale={0.02 + rand(`bs${i}`) * 0.025}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#cfe8ff" transparent opacity={0.55 * (1 - ph * 0.5)} depthWrite={false} />
        </mesh>
      );
    })}
    {/* "gelo" fininho na borda */}
    {Array.from({ length: 10 }, (_, i) => (
      <mesh key={`g${i}`} position={[-w / 2 + 0.2 + rand(`ig${i}`) * (w - 0.4), 0.01, -d / 2 + rand(`iz${i}`) * 0.4]} rotation={[-Math.PI / 2, 0, rand(`ir${i}`) * 3]}>
        <circleGeometry args={[0.08 + rand(`is${i}`) * 0.06, 5]} />
        <meshStandardMaterial color="#e6f2fa" />
      </mesh>
    ))}
    <Box p={[0, -h - 0.04, 0]} s={[w + 0.1, 0.08, d + 0.1]} c="#1a1a22" />
  </group>
);

/* ------------------------------------------------------------------ TANQUE DE TESTE (laboratório) */

/** Piscina de testes com azulejos, água fria, escada e monitor de temperatura corporal. */
export const TestTank: React.FC<{ f: number }> = ({ f }) => (
  <group>
    {/* borda e paredes de azulejo */}
    <Box p={[0, -0.5, -2.05]} s={[6.2, 1.2, 0.1]} c="#dfe8ee" />
    <Box p={[-3.05, -0.5, 0]} s={[0.1, 1.2, 4.2]} c="#dfe8ee" />
    <Box p={[3.05, -0.5, 0]} s={[0.1, 1.2, 4.2]} c="#dfe8ee" />
    <Box p={[0, -1.05, 0]} s={[6.2, 0.1, 4.2]} c="#cfdbe4" />
    {Array.from({ length: 12 }, (_, i) => (
      <Box key={`tl${i}`} p={[-3 + i * 0.5, -0.5, -1.99]} s={[0.012, 1.2, 0.005]} c="#9fb4c4" />
    ))}
    {Array.from({ length: 4 }, (_, i) => (
      <Box key={`th${i}`} p={[0, -1.0 + i * 0.3, -1.99]} s={[6.1, 0.012, 0.005]} c="#9fb4c4" />
    ))}
    {/* deque */}
    <Box p={[0, 0.05, 2.5]} s={[7, 0.1, 0.8]} c="#b8c4cc" />
    {/* água */}
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6, 4]} />
      <meshStandardMaterial color="#5ab0d8" transparent opacity={0.6} roughness={0.1} emissive="#1a5a7a" emissiveIntensity={0.15 + 0.03 * Math.sin(f / 15)} depthWrite={false} />
    </mesh>
    {/* gelo boiando (água gelada) */}
    {Array.from({ length: 14 }, (_, i) => (
      <mesh key={`ic${i}`} position={[-2.6 + rand(`ix${i}`) * 5.2, 0.0, -1.7 + rand(`iy${i}`) * 3.4]} rotation={[0, rand(`irr${i}`) * 3, 0]}>
        <boxGeometry args={[0.18, 0.06, 0.15]} />
        <meshStandardMaterial color="#f0f8ff" roughness={0.1} />
      </mesh>
    ))}
    {/* escada */}
    {[-0.25, 0.25].map((z, i) => (
      <Rod key={i} a={[2.9, -0.9, z]} b={[2.9, 0.5, z]} r={0.03} c="#c0c8d0" />
    ))}
    {/* monitor de temperatura no tripé */}
    <group position={[-2.4, 0.1, 2.6]}>
      <Rod a={[0, 0, 0]} b={[0, 1.2, 0]} r={0.03} c="#3a3a42" />
      <Box p={[0, 1.45, 0]} s={[0.8, 0.5, 0.06]} c="#1a1a22" />
      <mesh position={[0, 1.45, 0.035]}>
        <planeGeometry args={[0.72, 0.42]} />
        <meshBasicMaterial color="#0c2a1a" />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[-0.32 + i * 0.07, 1.36 + 0.12 * Math.exp(-i * 0.25) + 0.01 * Math.sin(f / 6 + i), 0.04]}>
          <boxGeometry args={[0.05, 0.015, 0.005]} />
          <meshBasicMaterial color="#5aff9a" toneMapped={false} />
        </mesh>
      ))}
    </group>
  </group>
);

/** Fios de sensor saindo de um ponto até o monitor (curva simples). */
export const SensorWire: React.FC<{ a: Vec3; b: Vec3 }> = ({ a, b }) => {
  const mid: Vec3 = [(a[0] + b[0]) / 2, Math.max(a[1], b[1]) + 0.4, (a[2] + b[2]) / 2];
  return (
    <>
      <Rod a={a} b={mid} r={0.01} c="#ff4a3d" seg={4} />
      <Rod a={mid} b={b} r={0.01} c="#ff4a3d" seg={4} />
    </>
  );
};
