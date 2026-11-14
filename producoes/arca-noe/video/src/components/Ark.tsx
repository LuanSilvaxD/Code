import { useMemo } from "react";
import { AdditiveBlending, BoxGeometry, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, Shape, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { loft } from "./Amphibia";

// "Acharam a Arca de Noé?" — elementos novos (aprovar na folha). Mundo em u3d: 1 u = 10 m (paisagem), exceto
// objetos de mão (madeira, ovelha, fogueira) em metros.

const C = (h: string) => new Color(h);
const M = { roughness: 0.9, metalness: 0, flatShading: true } as const;

/* ------------------------------------------------------------------ MONTANHAS (Ararat) */

/** Monte Ararat estilizado: cone grande com capa de neve irregular + Pequeno Ararat ao lado. */
export const Ararat: React.FC<{ s?: number }> = ({ s = 1 }) => {
  const peak = (r: number, h: number, snow: number, seed: string, p: Vec3) => (
    <group position={p}>
      <mesh castShadow receiveShadow>
        <coneGeometry args={[r, h, 11, 4]} />
        <meshStandardMaterial color="#7a6a5a" {...M} />
      </mesh>
      {/* capa de neve com bordas irregulares (anéis de "línguas") */}
      <mesh position={[0, h / 2 - (h * snow) / 2, 0]}>
        <coneGeometry args={[r * snow * 1.02, h * snow, 11, 1]} />
        <meshStandardMaterial color="#f2f4f8" roughness={0.7} flatShading />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + rand(`${seed}${i}`) * 0.4;
        const rr = r * snow * 0.98;
        const y = h / 2 - h * snow - 0.02 * h;
        return (
          <mesh key={i} position={[Math.cos(a) * rr * 0.95, y + h * 0.04, Math.sin(a) * rr * 0.95]} rotation={[0, -a, 0.55]} scale={[r * 0.08, h * (0.08 + rand(`${seed}l${i}`) * 0.1), r * 0.12]}>
            <coneGeometry args={[1, 1, 4]} />
            <meshStandardMaterial color="#e8ecf2" roughness={0.7} flatShading />
          </mesh>
        );
      })}
    </group>
  );
  return (
    <group scale={s}>
      {peak(30, 46, 0.32, "big", [0, 23, 0])}
      {peak(16, 22, 0.18, "small", [36, 11, 8])}
    </group>
  );
};

/** Planalto com morrinhos baixos. */
export const Plateau: React.FC<{ w?: number; color?: string }> = ({ w = 220, color = "#9a8a62" }) => {
  const hills = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ p: [(rand(`hx${i}`) - 0.5) * w, -1, -20 - rand(`hz${i}`) * w * 0.4] as Vec3, s: [6 + rand(`hs${i}`) * 14, 2 + rand(`hh${i}`) * 5, 6 + rand(`hd${i}`) * 12] as Vec3 })), [w]);
  return (
    <group>
      <mesh position={[0, -0.1, -w * 0.2]} receiveShadow>
        <boxGeometry args={[w, 0.2, w]} />
        <meshStandardMaterial color={color} roughness={1} />
      </mesh>
      {hills.map((h, i) => (
        <mesh key={i} position={h.p} scale={h.s} receiveShadow>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={C(color).offsetHSL(0, 0, (rand(`hc${i}`) - 0.5) * 0.08)} {...M} />
        </mesh>
      ))}
    </group>
  );
};

/* ------------------------------------------------------------------ DURUPINAR */

/** Formação de Durupinar: monte alongado em forma de casco (~157 m × ~42 m), com estrias de camadas e bordas
 *  erodidas; fica parcialmente enterrado no planalto. Comprimento 15,7 u (1 u = 10 m), ao longo de x. */
export const Durupinar: React.FC<{ glow?: number }> = ({ glow = 0 }) => {
  const geo = useMemo(() => {
    const keys = [
      { x: -7.85, y: 0.0, w: 0.3, h: 0.35, sq: 2.5 },
      { x: -7.0, y: 0.0, w: 1.4, h: 1.1, sq: 2.6 },
      { x: -4.0, y: 0.0, w: 2.1, h: 1.6, sq: 2.8 },
      { x: 0.0, y: 0.0, w: 2.15, h: 1.7, sq: 2.8 },
      { x: 4.0, y: 0.0, w: 2.0, h: 1.6, sq: 2.8 },
      { x: 6.8, y: 0.0, w: 1.3, h: 1.1, sq: 2.6 },
      { x: 7.85, y: 0.0, w: 0.25, h: 0.3, sq: 2.5 },
    ];
    const base = C("#8a7452");
    const dark = C("#6a5638");
    const light = C("#b09670");
    return loft(
      keys,
      (x, a) => {
        const top = Math.cos(a);
        const side = Math.sin(a);
        // estrias paralelas ao casco (camadas expostas) + manchas
        const stripe = Math.sin(Math.abs(side) * 14 + top * 4);
        let c = base.clone().lerp(stripe > 0.6 ? dark : light, 0.35);
        if (top > 0.85) c = c.lerp(light, 0.25);
        if (rand(`dp${Math.round(x * 3)}${Math.round(a * 5)}`) > 0.8) c = c.lerp(dark, 0.4);
        return c;
      },
      90,
      36,
    );
  }, []);
  return (
    <group>
      <mesh geometry={geo} castShadow receiveShadow position={[0, -0.6, 0]}>
        <meshStandardMaterial vertexColors roughness={1} flatShading />
      </mesh>
      {/* borda elevada (a "amurada") ao redor */}
      <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[7.7, 2.15, 1]}>
        <ringGeometry args={[0.93, 1.0, 64]} />
        <meshStandardMaterial color="#7a6444" roughness={1} side={DoubleSide} />
      </mesh>
      {glow > 0.01 ? (
        <mesh position={[0, 0.9, 0]} rotation={[-Math.PI / 2, 0, 0]} scale={[8, 2.3, 1]}>
          <ringGeometry args={[0.9, 1.05, 64]} />
          <meshBasicMaterial color="#ffcf3a" transparent opacity={0.6 * clamp(glow, 0, 1)} toneMapped={false} side={DoubleSide} />
        </mesh>
      ) : null}
    </group>
  );
};

/** Contorno (wireframe dourado) de uma arca de 300 côvados (~150 m), para comparar com a formação. draw 0..1. */
export const ArkOutline: React.FC<{ draw?: number; len?: number }> = ({ draw = 1, len = 15 }) => {
  const curves = useMemo(() => {
    const L = len / 2, Wd = len / 12, H = len / 10; // proporção 300 × 50 × 30 côvados
    const hull = (y: number, w: number) =>
      new CatmullRomCurve3([new Vector3(-L, y, 0), new Vector3(-L * 0.8, y, w), new Vector3(L * 0.8, y, w), new Vector3(L, y, 0), new Vector3(L * 0.8, y, -w), new Vector3(-L * 0.8, y, -w), new Vector3(-L, y, 0)], false, "catmullrom", 0.1);
    return [hull(0.3, Wd * 0.8), hull(H, Wd), hull(H * 1.4, Wd * 0.7)];
  }, [len]);
  const d = clamp(draw, 0, 1);
  return (
    <group>
      {curves.map((c, i) => (
        <mesh key={i}>
          <tubeGeometry args={[new CatmullRomCurve3(c.getSpacedPoints(80).slice(0, Math.max(2, Math.round(81 * d)))), 80, 0.07, 5, false]} />
          <meshBasicMaterial color="#ffcf3a" toneMapped={false} />
        </mesh>
      ))}
      {d > 0.6
        ? [-0.8, -0.4, 0, 0.4, 0.8].map((t, i) => (
            <mesh key={`v${i}`} position={[t * len * 0.5, len / 20 + 0.15, 0]}>
              <boxGeometry args={[0.06, len / 10, len / 6 + 0.1]} />
              <meshBasicMaterial color="#ffcf3a" transparent opacity={0.35} toneMapped={false} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/* ------------------------------------------------------------------ MADEIRA CARBONIZADA (metros) */

/** Pedaços de tábua queimada (pontas quebradas irregulares, veios), sobre lona azul com etiqueta de amostra. */
export const CharredWood: React.FC<{ f: number; n?: number }> = ({ f, n = 5 }) => {
  const pcs = useMemo(
    () =>
      Array.from({ length: n }, (_, i) => {
        const L = 0.12 + rand(`cl${i}`) * 0.1;
        const g = new BoxGeometry(L, 0.03 + rand(`ch${i}`) * 0.015, 0.045 + rand(`cd${i}`) * 0.02, 8, 2, 3);
        const pos = g.attributes.position;
        for (let k = 0; k < pos.count; k++) {
          const x = pos.getX(k);
          const end = Math.abs(x) > L * 0.42;
          const j = (rand(`cj${i}${k}`) - 0.5) * (end ? 0.03 : 0.006);
          pos.setXYZ(k, x + (end ? j : 0), pos.getY(k) + j * 0.5, pos.getZ(k) + (end ? j * 0.6 : 0));
        }
        g.computeVertexNormals();
        return { g, p: [(i - (n - 1) / 2) * 0.17 + (rand(`cw${i}`) - 0.5) * 0.04, 0.02, (rand(`cz${i}`) - 0.5) * 0.14] as Vec3, r: (rand(`cr${i}`) - 0.5) * 1.2, L };
      }),
    [n],
  );
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0.05]}>
        <planeGeometry args={[1.0, 0.55]} />
        <meshStandardMaterial color="#3a5a8a" roughness={0.8} side={DoubleSide} />
      </mesh>
      {pcs.map((q, i) => (
        <group key={i} position={q.p} rotation={[0, q.r, (rand(`ct${i}`) - 0.5) * 0.2]}>
          <mesh geometry={q.g} castShadow>
            <meshStandardMaterial color={i % 2 ? "#1c1410" : "#261a12"} roughness={1} flatShading />
          </mesh>
          {/* veios da madeira */}
          {[-1, 0, 1].map((k) => (
            <mesh key={k} position={[0, 0.0175, k * 0.012]} scale={[q.L * 0.8, 0.002, 0.003]}>
              <boxGeometry args={[1, 1, 1]} />
              <meshStandardMaterial color="#3a2a1c" />
            </mesh>
          ))}
          {/* brilho de carvão nas rachaduras */}
          <mesh position={[q.L * 0.2, 0.017, 0]} scale={[0.02, 0.002, 0.03]}>
            <boxGeometry args={[1, 1, 1]} />
            <meshStandardMaterial color="#5a4a40" />
          </mesh>
        </group>
      ))}
      <mesh position={[0.36, 0.005, 0.18]} rotation={[-Math.PI / 2, 0, 0.1]}>
        <planeGeometry args={[0.12, 0.06]} />
        <meshStandardMaterial color="#f2eedc" />
      </mesh>
      <group visible={f >= 0} />
    </group>
  );
};

/* ------------------------------------------------------------------ GEOLOGIA (dobra sinclinal) */

/** Bloco em corte com camadas dobradas em "U" (sinclinal), contínuas. erode 0..1 baixa o topo (a erosão
 *  remove o que estava acima) e deixa as bordas mais resistentes como um "casco". */
export const SynclineBlock: React.FC<{ fold?: number; erode?: number }> = ({ fold = 1, erode = 0 }) => {
  const layers = ["#c8a878", "#8a6a4a", "#d8c09a", "#7a5a3a", "#b89868", "#6a4a2a", "#caa880"];
  const fk = clamp(fold, 0, 1);
  const top = 2.3 - clamp(erode, 0, 1) * 1.15;
  const geos = useMemo(
    () =>
      layers.map((_, i) => {
        const y0 = i * 0.36 - 0.5;
        const sh = new Shape();
        const N = 48;
        const yb = (x: number) => Math.min(top, y0 + fk * 1.15 * (x / 3) * (x / 3));
        const yt = (x: number) => Math.min(top, y0 + 0.36 + fk * 1.15 * (x / 3) * (x / 3));
        for (let k = 0; k <= N; k++) {
          const x = -3 + (k / N) * 6;
          if (k === 0) sh.moveTo(x, yb(x));
          else sh.lineTo(x, yb(x));
        }
        for (let k = N; k >= 0; k--) {
          const x = -3 + (k / N) * 6;
          sh.lineTo(x, yt(x));
        }
        return new ExtrudeGeometry(sh, { depth: 2.4, bevelEnabled: false });
      }),
    [fk, top],
  );
  return (
    <group position={[0, 0, -1.2]}>
      {geos.map((g, i) => (
        <mesh key={i} geometry={g} castShadow receiveShadow>
          <meshStandardMaterial color={layers[i]} roughness={1} flatShading />
        </mesh>
      ))}
      <mesh position={[0, -0.65, 1.2]}>
        <boxGeometry args={[6.05, 0.3, 2.42]} />
        <meshStandardMaterial color="#5a4a3a" roughness={1} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ SONDA DE PERFURAÇÃO (metros) */

export const DrillRig: React.FC<{ f: number; depth?: number; core?: number }> = ({ f, depth = 0, core = 0 }) => (
  <group>
    {/* tripé */}
    {[0, 1, 2].map((i) => {
      const a = (i / 3) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.55, 1.3, Math.sin(a) * 0.55]} rotation={[Math.sin(a) * 0.38, 0, -Math.cos(a) * 0.38]}>
          <cylinderGeometry args={[0.035, 0.045, 2.8, 6]} />
          <meshStandardMaterial color="#e2a22a" roughness={0.5} metalness={0.3} />
        </mesh>
      );
    })}
    {/* motor e haste girando */}
    <mesh position={[0, 2.5, 0]}>
      <boxGeometry args={[0.35, 0.3, 0.35]} />
      <meshStandardMaterial color="#3a3a42" roughness={0.4} metalness={0.5} />
    </mesh>
    <mesh position={[0, 1.2 - depth * 0.6, 0]} rotation={[0, f * 0.5, 0]}>
      <cylinderGeometry args={[0.04, 0.04, 2.4, 8]} />
      <meshStandardMaterial color="#9aa0a8" roughness={0.3} metalness={0.7} />
    </mesh>
    {/* testemunho (amostra) com a camada escura da madeira */}
    {core > 0.01 ? (
      <group position={[0.9, 0.12, 0.3]} rotation={[0, 0, Math.PI / 2]} scale={clamp(core, 0, 1)}>
        <mesh>
          <cylinderGeometry args={[0.07, 0.07, 1.2, 12]} />
          <meshStandardMaterial color="#9a8462" roughness={1} />
        </mesh>
        <mesh position={[0, -0.4, 0]}>
          <cylinderGeometry args={[0.072, 0.072, 0.12, 12]} />
          <meshStandardMaterial color="#1e1612" roughness={1} />
        </mesh>
      </group>
    ) : null}
    {/* chão em volta */}
    <mesh position={[0, -0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[1.1, 24]} />
      <meshStandardMaterial color="#6a5a42" roughness={1} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ FOGUEIRA (metros) */

export const Campfire: React.FC<{ f: number; s?: number }> = ({ f, s = 1 }) => (
  <group scale={s}>
    {/* pedras em roda */}
    {Array.from({ length: 9 }, (_, i) => {
      const a = (i / 9) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.32, 0.04, Math.sin(a) * 0.32]} scale={[0.08, 0.06, 0.07]}>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#7a7468" {...M} />
        </mesh>
      );
    })}
    {/* lenha cruzada */}
    {[0, 1, 2, 3].map((i) => (
      <mesh key={`l${i}`} position={[0, 0.07, 0]} rotation={[0.35, (i / 4) * Math.PI, 0]}>
        <cylinderGeometry args={[0.03, 0.035, 0.5, 6]} />
        <meshStandardMaterial color={i % 2 ? "#3a2618" : "#4a3020"} {...M} />
      </mesh>
    ))}
    {/* brasas */}
    <mesh position={[0, 0.05, 0]} scale={[0.16, 0.04, 0.16]}>
      <sphereGeometry args={[1, 10, 6]} />
      <meshBasicMaterial color="#ff6a1a" toneMapped={false} />
    </mesh>
    {/* chamas: cones que oscilam */}
    {Array.from({ length: 6 }, (_, i) => {
      const a = (i / 6) * Math.PI * 2;
      const h = 0.28 + 0.12 * Math.sin(f * 0.5 + i * 1.7);
      return (
        <mesh key={`f${i}`} position={[Math.cos(a) * 0.06, 0.08 + h / 2, Math.sin(a) * 0.06]} rotation={[0.1 * Math.sin(f * 0.3 + i), 0, 0.1 * Math.cos(f * 0.35 + i)]}>
          <coneGeometry args={[0.06, h, 6]} />
          <meshBasicMaterial color={i % 2 ? "#ffb02a" : "#ff7a1a"} toneMapped={false} transparent opacity={0.9} />
        </mesh>
      );
    })}
    <mesh position={[0, 0.3, 0]} scale={0.45}>
      <sphereGeometry args={[1, 16, 10]} />
      <meshBasicMaterial color="#ff8a2a" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ OVELHA v2 (metros, padrão novo) */

/** Desloca os vértices ao longo da normal com "ruído" de bolinhas: vira lã encaracolada contínua (sem bolas soltas). */
const fleece = (g: BufferGeometry, amp: number, freq: number, seed: string) => {
  g.computeVertexNormals();
  const pos = g.attributes.position;
  const nor = g.attributes.normal;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const n = Math.sin(x * freq + Math.sin(z * freq * 0.7)) * Math.cos(y * freq * 1.1 + x * 0.5) * 0.5 + (rand(`${seed}${Math.round(x * 40)},${Math.round(y * 40)},${Math.round(z * 40)}`) - 0.5) * 0.6;
    const d = amp * (0.6 + n);
    pos.setXYZ(i, x + nor.getX(i) * d, y + nor.getY(i) * d, z + nor.getZ(i) * d);
  }
  g.computeVertexNormals();
  return g;
};

/** Ovelha (tipo cara-preta, ~1,1 m de comprimento): tronco de lã encaracolada contínua que segue até o pescoço,
 *  cabeça alongada escura com focinho, orelhas na horizontal, olhos laterais com brilho; pernas com lã até o joelho
 *  e canela escura com casco fendido. walk 0..1 anda; graze 0..1 abaixa a cabeça para pastar. */
export const Sheep: React.FC<{ f: number; walk?: number; graze?: number; wool?: string; face?: string }> = ({ f, walk = 0, graze = 0, wool = "#e9e2d2", face = "#24201c" }) => {
  const body = useMemo(() => {
    const g = loft(
      [
        { x: -0.58, y: 0.66, w: 0.04, h: 0.04, sq: 2 },
        { x: -0.53, y: 0.66, w: 0.2, h: 0.2, sq: 2 },
        { x: -0.38, y: 0.65, w: 0.29, h: 0.26, sq: 2.2 },
        { x: -0.05, y: 0.65, w: 0.31, h: 0.27, sq: 2.3 },
        { x: 0.25, y: 0.67, w: 0.29, h: 0.26, sq: 2.2 },
        { x: 0.42, y: 0.73, w: 0.19, h: 0.2, sq: 2 },
        { x: 0.52, y: 0.82, w: 0.12, h: 0.14, sq: 2 },
        { x: 0.58, y: 0.86, w: 0.07, h: 0.09, sq: 2 },
      ],
      (x, a) => {
        const c = C(wool);
        const top = Math.cos(a);
        return c.lerp(C("#cfc6b2"), top < -0.4 ? 0.35 : 0.05).offsetHSL(0, 0, (rand(`sw${Math.round(x * 30)}${Math.round(a * 7)}`) - 0.5) * 0.05);
      },
      70,
      32,
    );
    return fleece(g, 0.018, 38, "sb");
  }, [wool]);
  const head = useMemo(
    () =>
      loft(
        [
          { x: -0.02, y: 0, w: 0.06, h: 0.07, sq: 2 },
          { x: 0.06, y: 0.005, w: 0.075, h: 0.085, sq: 2 },
          { x: 0.15, y: -0.005, w: 0.06, h: 0.07, sq: 2 },
          { x: 0.22, y: -0.02, w: 0.045, h: 0.055, sq: 2 },
          { x: 0.26, y: -0.03, w: 0.035, h: 0.04, sq: 2 },
          { x: 0.275, y: -0.035, w: 0.01, h: 0.012, sq: 2 },
        ],
        (x) => C(face).offsetHSL(0, 0, x > 0.22 ? 0.04 : 0),
        30,
        18,
      ),
    [face],
  );
  const ph = f * 0.22;
  const g = clamp(graze, 0, 1);
  // pescoço/cabeça: pivô no fim do pescoço; pastar = gira para baixo
  const headRot = -0.45 - g * 1.0 + 0.04 * Math.sin(f / 18);
  const leg = (x: number, z: number, i: number) => {
    const sw = walk * 0.35 * Math.sin(ph + (i === 0 || i === 3 ? 0 : Math.PI));
    return (
      <group key={i} position={[x, 0.5, z]} rotation={[0, 0, sw]}>
        {/* coxa com lã */}
        <mesh position={[0, 0.0, 0]} scale={[0.09, 0.15, 0.085]}>
          <sphereGeometry args={[1, 12, 8]} />
          <meshStandardMaterial color={wool} roughness={0.95} />
        </mesh>
        {/* canela escura, joelho e casco fendido */}
        <mesh position={[0, -0.27, 0]}>
          <cylinderGeometry args={[0.024, 0.02, 0.32, 7]} />
          <meshStandardMaterial color={face} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.2, 0]}>
          <sphereGeometry args={[0.027, 8, 6]} />
          <meshStandardMaterial color={face} roughness={0.8} />
        </mesh>
        {[-1, 1].map((k) => (
          <mesh key={k} position={[0.012, -0.44, k * 0.011]} scale={[0.022, 0.025, 0.011]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshStandardMaterial color="#121010" roughness={0.6} />
          </mesh>
        ))}
      </group>
    );
  };
  return (
    <group>
      <mesh geometry={body} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.98} flatShading />
      </mesh>
      {/* topete de lã na nuca */}
      <mesh position={[0.56, 0.93, 0]} scale={[0.07, 0.05, 0.075]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color={wool} roughness={0.98} flatShading />
      </mesh>
      <group position={[0.57, 0.88, 0]} rotation={[0, 0, headRot]}>
        <mesh geometry={head} castShadow>
          <meshStandardMaterial vertexColors roughness={0.75} />
        </mesh>
        {/* orelhas na horizontal */}
        {[-1, 1].map((z) => (
          <group key={`ear${z}`} position={[0.03, 0.04, z * 0.06]} rotation={[z * -1.2, z * 0.3 + 0.08 * Math.sin(f / 22 + z), 0.2]}>
            <mesh position={[0, 0, z * 0.06]} scale={[0.03, 0.008, 0.065]}>
              <sphereGeometry args={[1, 10, 6]} />
              <meshStandardMaterial color={face} roughness={0.8} />
            </mesh>
            <mesh position={[0, 0.004, z * 0.06]} scale={[0.02, 0.005, 0.05]}>
              <sphereGeometry args={[1, 10, 6]} />
              <meshStandardMaterial color="#5a3a34" roughness={0.8} />
            </mesh>
          </group>
        ))}
        {/* olhos laterais */}
        {[-1, 1].map((z) => (
          <group key={`eye${z}`} position={[0.095, 0.035, z * 0.068]}>
            <mesh>
              <sphereGeometry args={[0.014, 10, 8]} />
              <meshStandardMaterial color="#c8a050" roughness={0.3} />
            </mesh>
            <mesh position={[0.003, 0, z * 0.009]} scale={[0.5, 0.25, 0.4]}>
              <sphereGeometry args={[0.014, 8, 6]} />
              <meshStandardMaterial color="#080606" roughness={0.2} />
            </mesh>
            <mesh position={[0.007, 0.006, z * 0.011]}>
              <sphereGeometry args={[0.003, 4, 3]} />
              <meshBasicMaterial color="#ffffff" />
            </mesh>
          </group>
        ))}
        {/* narinas e boca */}
        {[-1, 1].map((z) => (
          <mesh key={`n${z}`} position={[0.268, -0.022, z * 0.016]} scale={[0.004, 0.007, 0.006]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color="#080606" />
          </mesh>
        ))}
        <mesh position={[0.25, -0.06, 0]} rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 0.6]}>
          <torusGeometry args={[0.02, 0.003, 4, 10, Math.PI]} />
          <meshBasicMaterial color="#0a0808" />
        </mesh>
      </group>
      {leg(0.3, 0.14, 0)}
      {leg(0.3, -0.14, 1)}
      {leg(-0.36, 0.15, 2)}
      {leg(-0.36, -0.15, 3)}
      {/* rabo curto de lã */}
      <mesh position={[-0.6, 0.6, 0]} rotation={[0, 0, -0.6]} scale={[0.045, 0.1, 0.05]}>
        <icosahedronGeometry args={[1, 2]} />
        <meshStandardMaterial color={wool} roughness={0.98} flatShading />
      </mesh>
    </group>
  );
};
