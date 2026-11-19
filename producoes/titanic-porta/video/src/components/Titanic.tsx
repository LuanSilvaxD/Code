import { useMemo } from "react";
import { BufferAttribute, Color, DoubleSide, PlaneGeometry, Quaternion, Vector3 } from "three";
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

/* ------------------------------------------------------------------ MAR À NOITE */

/** Mar noturno low-poly com ondulação suave e reflexo da lua (faixa clara em x≈moonX). */
export const NightSea: React.FC<{ f: number; size?: number; moonX?: number; calm?: number }> = ({ f, size = 60, moonX = 4, calm = 1 }) => {
  const base = useMemo(() => new PlaneGeometry(size, size, 90, 90).rotateX(-Math.PI / 2), [size]);
  const geo = useMemo(() => {
    const g = base.clone();
    g.setAttribute("color", new BufferAttribute(new Float32Array(g.attributes.position.count * 3), 3));
    return g;
  }, [base]);
  const pos = geo.attributes.position, col = geo.attributes.color, bp = base.attributes.position;
  const deep = C("#051a30"), mid = C("#0e3656"), glint = C("#8ab4d4");
  const c = new Color();
  for (let i = 0; i < pos.count; i++) {
    const x = bp.getX(i), z = bp.getZ(i);
    const y = (Math.sin(x * 0.7 + f * 0.05) * 0.05 + Math.sin(z * 1.1 - f * 0.04 + x * 0.4) * 0.04) * calm;
    pos.setY(i, y);
    const band = Math.exp(-((x - moonX) ** 2) / 3) * clamp((-z + 5) / 30, 0, 1);
    c.copy(deep).lerp(mid, clamp(0.5 + y * 9 + Math.cos(x * 0.7 + f * 0.05) * 0.25, 0, 1)).lerp(glint, band * clamp(0.4 + y * 10, 0, 1));
    col.setXYZ(i, c.r, c.g, c.b);
  }
  pos.needsUpdate = true;
  col.needsUpdate = true;
  geo.computeVertexNormals();
  return (
    <mesh geometry={geo} receiveShadow>
      <meshBasicMaterial vertexColors />
    </mesh>
  );
};

/** Altura da ondulação do NightSea num ponto (para os objetos boiarem junto). */
export const seaY = (x: number, z: number, f: number, calm = 1) => (Math.sin(x * 0.7 + f * 0.05) * 0.05 + Math.sin(z * 1.1 - f * 0.04 + x * 0.4) * 0.04) * calm;

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

/* ------------------------------------------------------------------ BOTE SALVA-VIDAS */

/** Bote salva-vidas de madeira (~9 m) com remos e lanterna acesa. Proa para +x. */
export const Lifeboat: React.FC<{ f: number; row?: number }> = ({ f, row = 1 }) => {
  const a = Math.sin(f * 0.12) * 0.5 * row;
  return (
    <group>
      <mesh scale={[4.5, 0.7, 1.1]} castShadow>
        <sphereGeometry args={[1, 16, 8, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
        <meshStandardMaterial color="#efece4" {...M} side={DoubleSide} />
      </mesh>
      <mesh position={[0, -0.01, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[4.3, 1.0, 1]}>
        <circleGeometry args={[1, 18]} />
        <meshStandardMaterial color="#8f6438" {...M} />
      </mesh>
      {[-2, -0.7, 0.6, 1.9].map((x, i) => (
        <Box key={i} p={[x, 0.02, 0]} s={[0.25, 0.06, 1.9]} c="#a87a4a" />
      ))}
      {/* remos */}
      {[-1.4, 0, 1.4].map((x, i) =>
        [1, -1].map((s) => (
          <group key={`${i}${s}`} position={[x, 0.05, 1.05 * s]} rotation={[s * (0.5 + a * 0.3), a, 0]}>
            <Rod a={[0, 0, 0]} b={[0, 0, 2.2 * s]} r={0.035} c="#c9a172" />
          </group>
        )),
      )}
      {/* lanterna */}
      <Rod a={[3.6, 0, 0]} b={[3.6, 1.0, 0]} r={0.03} c="#3a3028" />
      <mesh position={[3.6, 1.08, 0]}>
        <boxGeometry args={[0.14, 0.18, 0.14]} />
        <meshBasicMaterial color="#ffd27a" toneMapped={false} />
      </mesh>
      <pointLight position={[3.6, 1.1, 0]} intensity={2.2} distance={6} color="#ffc070" />
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
