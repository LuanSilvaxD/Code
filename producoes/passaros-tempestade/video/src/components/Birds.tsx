import { useMemo } from "react";
import { AdditiveBlending, CatmullRomCurve3, Color, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { loft } from "./Amphibia";

// "Os pássaros que ouviram a tempestade" — elementos novos (aprovar na folha), no padrão do Gerrothorax v2.
// Pássaro em DECÍMETROS (1 u = 10 cm; corpo ~1,2 u = 12 cm), de frente para +x, pés em y = 0.

const C = (h: string) => new Color(h);
export const WARBLER = { grey: "#8e959e", greyDark: "#5e646c", belly: "#ecebe6", yellow: "#f2c62e", black: "#16161a", white: "#f6f6f2", beak: "#2a2a2e", leg: "#5a5048" };

const BKEYS = [
  { x: -0.36, y: 0.42, w: 0.004, h: 0.004, sq: 2 },
  { x: -0.33, y: 0.42, w: 0.05, h: 0.05, sq: 2 },
  { x: -0.26, y: 0.4, w: 0.12, h: 0.13, sq: 2 },
  { x: -0.12, y: 0.38, w: 0.19, h: 0.22, sq: 2.1 },
  { x: 0.04, y: 0.4, w: 0.2, h: 0.23, sq: 2.1 },
  { x: 0.17, y: 0.46, w: 0.165, h: 0.18, sq: 2.1 },
  { x: 0.26, y: 0.55, w: 0.14, h: 0.15, sq: 2 },
  { x: 0.35, y: 0.6, w: 0.145, h: 0.15, sq: 2 },
  { x: 0.44, y: 0.6, w: 0.115, h: 0.12, sq: 2 },
  { x: 0.5, y: 0.59, w: 0.06, h: 0.07, sq: 2 },
  { x: 0.52, y: 0.585, w: 0.02, h: 0.025, sq: 2 },
];

/** Pena alongada (elipsoide achatado). */
const Feather: React.FC<{ p: Vec3; r: Vec3; s: Vec3; c: string }> = ({ p, r, s, c }) => (
  <mesh position={p} rotation={r} scale={s} castShadow>
    <sphereGeometry args={[1, 10, 6]} />
    <meshStandardMaterial color={c} roughness={0.7} flatShading />
  </mesh>
);

/** Asa: fechada fica colada no flanco (plano vertical, penas para trás); aberta vira leque horizontal para o lado.
 *  Primárias escuras, faixa amarela nas coberturas (marca da espécie). */
const Wing: React.FC<{ side: 1 | -1; open: number; flap: number }> = ({ side, open, flap }) => {
  const o = clamp(open, 0, 1);
  const tilt = (1 - o) * (Math.PI / 2 - 0.35) + o * (-flap);
  return (
    <group position={[0.14 - 0.02 * o, 0.5 + 0.04 * o, side * (0.165 - 0.02 * o)]} rotation={[side * tilt, 0, (1 - o) * -0.18]}>
      {Array.from({ length: 7 }, (_, i) => {
        const t = i / 6;
        const fan = (1 - o) * (Math.PI - 0.05 + t * 0.1) + o * (Math.PI / 2 + 0.95 - t * 1.3);
        const len = (0.22 + 0.13 * (1 - t)) * (1 - o * 0.1) + o * 0.08;
        const c = i < 3 ? WARBLER.greyDark : WARBLER.grey;
        return (
          <group key={i} rotation={[0, -side * fan, 0]}>
            <Feather p={[len * 0.55, -0.002 * i, 0]} r={[0, 0, 0]} s={[len * 0.55, 0.01, 0.045]} c={c} />
          </group>
        );
      })}
      {/* coberturas: base cinza + faixa amarela */}
      <group rotation={[0, -side * (Math.PI - 0.15 * (1 - o) - o * 1.2), 0]}>
        <Feather p={[0.13, 0.012, 0]} r={[0, 0, 0]} s={[0.17, 0.016, 0.06]} c={WARBLER.grey} />
        <Feather p={[0.07, 0.022, 0]} r={[0, 0, 0]} s={[0.1, 0.012, 0.034]} c={WARBLER.yellow} />
      </group>
    </group>
  );
};

/** Mariquita (pássaro canoro, ~10 g). fly 0..1 = em voo (asas abertas, patas recolhidas); f anima a batida. tracker mostra o rastreador. */
export const Warbler: React.FC<{ f: number; fly?: number; tracker?: number; sing?: number; look?: number }> = ({ f, fly = 0, tracker = 0, sing = 0, look = 0 }) => {
  const geo = useMemo(
    () =>
      loft(
        BKEYS,
        (x, a) => {
          const top = Math.cos(a);
          const side = Math.abs(Math.sin(a));
          // coroa amarela
          if (x > 0.3 && top > 0.55) return C(WARBLER.yellow);
          // máscara preta no rosto (com borda branca acima e abaixo)
          if (x > 0.34 && x < 0.5 && side > 0.75 && top > -0.25 && top < 0.45) return C(WARBLER.black);
          if (x > 0.32 && x < 0.5 && side > 0.6 && top >= 0.45 && top < 0.6) return C(WARBLER.white);
          // garganta preta
          if (x > 0.24 && x < 0.47 && top < -0.35) return C(WARBLER.black);
          if (top < -0.3) return C(WARBLER.belly);
          const c = C(WARBLER.grey).lerp(C(WARBLER.greyDark), top > 0.6 ? 0.3 : 0.12);
          return top < 0.1 ? c.lerp(C(WARBLER.belly), 0.4) : c;
        },
        64,
        22,
      ),
    [],
  );
  const flapA = fly > 0.01 ? Math.sin(f * 0.9) * 0.7 : 0;
  const breathe = 1 + 0.015 * Math.sin(f / 9);
  const beakOpen = sing * (0.5 + 0.5 * Math.sin(f * 0.8)) * 0.25;
  return (
    <group rotation={[0, look, 0]}>
      <group scale={[1, breathe, 1]}>
        <mesh geometry={geo} castShadow>
          <meshStandardMaterial vertexColors roughness={0.7} />
        </mesh>
      </group>
      {/* olhos: brilho */}
      {[-1, 1].map((z) => (
        <group key={z} position={[0.415, 0.625, z * 0.105]}>
          <mesh>
            <sphereGeometry args={[0.03, 12, 10]} />
            <meshStandardMaterial color="#060608" roughness={0.15} />
          </mesh>
          <mesh position={[0.012, 0.012, z * 0.022]}>
            <sphereGeometry args={[0.008, 6, 4]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
      {/* bico fino */}
      <group position={[0.51, 0.59, 0]}>
        <mesh position={[0.06, 0.008, 0]} rotation={[0, 0, -Math.PI / 2 + 0.05 + beakOpen]}>
          <coneGeometry args={[0.022, 0.13, 8]} />
          <meshStandardMaterial color={WARBLER.beak} roughness={0.4} />
        </mesh>
        <mesh position={[0.055, -0.008, 0]} rotation={[0, 0, -Math.PI / 2 - 0.05 - beakOpen]} scale={[0.85, 0.9, 0.85]}>
          <coneGeometry args={[0.02, 0.12, 8]} />
          <meshStandardMaterial color={WARBLER.beak} roughness={0.4} />
        </mesh>
      </group>
      {/* cauda em leque */}
      {Array.from({ length: 5 }, (_, i) => {
        const t = (i - 2) / 2;
        return (
          <group key={`t${i}`} position={[-0.3, 0.42, 0]} rotation={[0, t * (0.18 + fly * 0.25), 0.15 - fly * 0.15]}>
            <Feather p={[-0.14, 0, 0]} r={[0, 0, 0]} s={[0.16, 0.012, 0.035]} c={i === 2 ? WARBLER.greyDark : WARBLER.grey} />
          </group>
        );
      })}
      <Wing side={1} open={fly} flap={flapA} />
      <Wing side={-1} open={fly} flap={flapA} />
      {/* patas: tarso + 3 dedos à frente e 1 atrás (agarrando o galho); recolhidas no voo */}
      {fly < 0.5
        ? [-1, 1].map((z) => (
            <group key={`l${z}`} position={[0.02, 0.2, z * 0.06]}>
              <mesh position={[0, -0.09, 0]}>
                <cylinderGeometry args={[0.012, 0.012, 0.2, 6]} />
                <meshStandardMaterial color={WARBLER.leg} roughness={0.6} />
              </mesh>
              {[-0.5, 0, 0.5, Math.PI].map((d, i) => (
                <mesh key={i} position={[Math.cos(d) * 0.035, -0.19, Math.sin(d) * 0.03]} rotation={[0, -d, Math.PI / 2]} scale={[0.008, 0.045, 0.008]}>
                  <cylinderGeometry args={[1, 0.7, 1, 5]} />
                  <meshStandardMaterial color={WARBLER.leg} roughness={0.6} />
                </mesh>
              ))}
            </group>
          ))
        : null}
      {/* rastreador (geolocalizador) com haste de luz e alça nas pernas */}
      {tracker > 0.01 ? (
        <group position={[-0.16, 0.6, 0]} scale={clamp(tracker, 0, 1.2)}>
          <mesh>
            <boxGeometry args={[0.1, 0.035, 0.06]} />
            <meshStandardMaterial color="#2a2a32" roughness={0.4} metalness={0.3} />
          </mesh>
          <mesh position={[-0.06, 0.04, 0]} rotation={[0, 0, 0.9]}>
            <cylinderGeometry args={[0.006, 0.006, 0.09, 5]} />
            <meshStandardMaterial color="#2a2a32" />
          </mesh>
          <mesh position={[-0.095, 0.07, 0]}>
            <sphereGeometry args={[0.012, 8, 6]} />
            <meshBasicMaterial color="#7ae0ff" toneMapped={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ ÁRVORE */

export const Tree: React.FC<{ f: number; s?: number; seed?: string; dark?: number }> = ({ f, s = 1, seed = "t", dark = 0 }) => {
  const leaf = new Color("#4f8a3a").lerp(new Color("#1e3420"), dark * 0.6);
  return (
    <group scale={s}>
      <mesh position={[0, 1.4, 0]} castShadow>
        <cylinderGeometry args={[0.14, 0.22, 2.8, 8]} />
        <meshStandardMaterial color="#6a4a30" roughness={0.9} flatShading />
      </mesh>
      {Array.from({ length: 7 }, (_, i) => {
        const a = rand(`${seed}a${i}`) * Math.PI * 2;
        const r = 0.3 + rand(`${seed}r${i}`) * 0.7;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 2.6 + rand(`${seed}y${i}`) * 1.0 + 0.04 * Math.sin(f / 30 + i), Math.sin(a) * r]} scale={0.55 + rand(`${seed}s${i}`) * 0.4} castShadow>
            <icosahedronGeometry args={[1, 0]} />
            <meshStandardMaterial color={leaf.clone().offsetHSL(0, 0, (rand(`${seed}l${i}`) - 0.5) * 0.06)} roughness={0.85} flatShading />
          </mesh>
        );
      })}
    </group>
  );
};

/** Galho (para o pássaro pousar): cilindro com ramos e folhinhas. */
export const Branch: React.FC<{ f: number; len?: number }> = ({ f, len = 3 }) => (
  <group>
    <mesh rotation={[0, 0, Math.PI / 2]}>
      <cylinderGeometry args={[0.06, 0.09, len, 8]} />
      <meshStandardMaterial color="#6a4a30" roughness={0.9} flatShading />
    </mesh>
    {Array.from({ length: 9 }, (_, i) => (
      <mesh key={i} position={[-len / 2 + 0.3 + i * (len / 9), 0.08 + 0.02 * Math.sin(f / 20 + i), (i % 2 ? 1 : -1) * 0.12]} rotation={[(i % 2 ? 1 : -1) * 0.5, i, 0]} scale={[0.14, 0.02, 0.07]}>
        <sphereGeometry args={[1, 8, 5]} />
        <meshStandardMaterial color={i % 3 ? "#4f8a3a" : "#6aa04a"} roughness={0.8} flatShading />
      </mesh>
    ))}
  </group>
);

/* ------------------------------------------------------------------ SUPERCÉLULA + TORNADO */

export const Supercell: React.FC<{ f: number; tornado?: number; s?: number; flash?: number }> = ({ f, tornado = 1, s = 1, flash = 0 }) => {
  const puffs = useMemo(() => Array.from({ length: 34 }, (_, i) => {
    const a = rand(`sa${i}`) * Math.PI * 2;
    const r = rand(`sr${i}`) * 4;
    const y = i < 20 ? 3.2 + rand(`sy${i}`) * 1.4 : 5.2 + rand(`sy${i}`) * 0.6; // corpo + bigorna
    const rr = i < 20 ? r * 0.6 : r * 1.4 + 1.5;
    return { p: [Math.cos(a) * rr, y, Math.sin(a) * rr * 0.6] as Vec3, s: 1 + rand(`ss${i}`) * 1.2, top: i >= 20 };
  }), []);
  const base = new Color("#3a3e4e").lerp(new Color("#c8d0ff"), flash);
  const funnel = useMemo(() => {
    const pts: Vector3[] = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20;
      pts.push(new Vector3(0.3 * Math.sin(t * 3), 3 - t * 3, 0.2 * Math.cos(t * 2.5)));
    }
    return new CatmullRomCurve3(pts);
  }, []);
  return (
    <group scale={s}>
      {puffs.map((q, i) => (
        <mesh key={i} position={q.p} scale={[q.s * (q.top ? 1.6 : 1), q.s * (q.top ? 0.45 : 0.8), q.s]}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color={q.top ? new Color("#8a90a8").lerp(new Color("#e0e6ff"), flash) : base} roughness={1} flatShading />
        </mesh>
      ))}
      {/* base escura (nuvem-parede) */}
      <mesh position={[0, 2.9, 0]} scale={[2.6, 0.45, 1.8]}>
        <icosahedronGeometry args={[1, 1]} />
        <meshStandardMaterial color="#25283a" roughness={1} flatShading />
      </mesh>
      {/* funil do tornado: anéis girando ao longo da curva */}
      {tornado > 0.01
        ? Array.from({ length: 16 }, (_, i) => {
            const t = i / 15;
            const p = funnel.getPointAt(t);
            const r = (0.08 + 0.55 * (1 - t) ** 1.6) * clamp(tornado, 0, 1);
            return (
              <mesh key={`f${i}`} position={[p.x, p.y, p.z]} rotation={[Math.PI / 2, 0, f * 0.4 + i]}>
                <torusGeometry args={[r, r * 0.35 + 0.02, 5, 12]} />
                <meshStandardMaterial color="#5a5e6e" roughness={1} flatShading transparent opacity={0.85} />
              </mesh>
            );
          })
        : null}
      {/* detritos girando na base */}
      {tornado > 0.01
        ? Array.from({ length: 14 }, (_, i) => {
            const a = f * 0.25 + i * 0.45;
            const r = 0.5 + (i % 4) * 0.2;
            return (
              <mesh key={`d${i}`} position={[Math.cos(a) * r, 0.15 + (i % 5) * 0.12, Math.sin(a) * r]} rotation={[a, a * 2, 0]} scale={0.06}>
                <boxGeometry args={[1, 0.4, 1.4]} />
                <meshStandardMaterial color="#5a4a3a" />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Ondas de infrassom: cascas translúcidas que se expandem devagar a partir da origem (comprimento de onda grande). */
export const InfraWaves: React.FC<{ f: number; k?: number; speed?: number; maxR?: number; color?: string; n?: number }> = ({ f, k = 1, speed = 0.05, maxR = 30, color = "#8b5cf6", n = 5 }) => {
  if (k <= 0.01) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = ((f * speed) / maxR + i / n) % 1;
        const r = 1 + t * maxR;
        return (
          <mesh key={i} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r, r + 0.35 + t * 0.6, 96]} />
            <meshBasicMaterial color={color} transparent opacity={0.5 * (1 - t) * clamp(k, 0, 1)} blending={AdditiveBlending} depthWrite={false} side={2} toneMapped={false} />
          </mesh>
        );
      })}
    </group>
  );
};
