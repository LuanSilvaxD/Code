import { useMemo } from "react";
import { BufferAttribute, Color, IcosahedronGeometry, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "E se o Sol sumisse?" — elementos novos (aprovar na folha). Low-poly, cores de vértice.
// Regra do render contínuo: materiais que fazem fade usam transparent SEMPRE true (só a opacidade anima).
const C = (h: string) => new Color(h);
const M = { roughness: 0.85, metalness: 0, flatShading: true } as const;
const nz = (x: number, y: number, z: number) =>
  (Math.sin(x * 1.7 + y * 2.3) * Math.cos(z * 1.9 - x * 0.7) + Math.sin(y * 3.1 + z * 2.6) * 0.5 + Math.sin(x * 4.3 - z * 3.7 + y) * 0.25) / 1.75;

/* ------------------------------------------------------------------ TERRA CONGELANDO */

/**
 * Terra low-poly que congela dos polos para o equador (frost 0..1) e escurece sem o Sol (dark 0..1).
 * Gelo: branco-azulado com brilho; oceanos viram placas de gelo; continentes ficam cinza com neve.
 */
export const FrostEarth: React.FC<{ f: number; r?: number; frost?: number; dark?: number }> = ({ f, r = 1, frost = 0, dark = 0 }) => {
  const base = useMemo(() => {
    const g = new IcosahedronGeometry(r, 5);
    const pos = g.attributes.position;
    const land = new Float32Array(pos.count);
    const lat = new Float32Array(pos.count);
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      land[i] = nz(v.x * 2.2 + 3, v.y * 2.2, v.z * 2.2 - 1);
      lat[i] = Math.abs(v.y);
    }
    g.setAttribute("color", new BufferAttribute(new Float32Array(pos.count * 3), 3));
    return { g, land, lat };
  }, [r]);
  const { g, land, lat } = base;
  const col = g.attributes.color;
  const fr = clamp(frost, 0, 1);
  const ocean = C("#2f72c8"), green = C("#4f9a4a"), sand = C("#c9b07a"), ice = C("#e6f2fa"), iceOcean = C("#bcd8ee"), snow = C("#f4f8fb");
  const c = new Color();
  for (let i = 0; i < col.count; i++) {
    const isLand = land[i] > 0.2;
    c.copy(isLand ? (land[i] > 0.5 ? sand : green) : ocean);
    if (lat[i] > 0.86) c.copy(snow);
    // frente de gelo: avança do polo (lat 1) até o equador (lat 0) conforme frost
    const front = 1 - fr * 1.05;
    const t = clamp((lat[i] - front) / 0.12 + (nz(i * 0.01, lat[i] * 3, 0) * 0.3), 0, 1);
    c.lerp(isLand ? ice : iceOcean, t);
    col.setXYZ(i, c.r, c.g, c.b);
  }
  col.needsUpdate = true;
  const k = 1 - 0.75 * clamp(dark, 0, 1);
  return (
    <group rotation={[0.4, f * 0.004, 0]}>
      <mesh geometry={g}>
        <meshStandardMaterial vertexColors roughness={0.55 - fr * 0.25} metalness={fr * 0.15} flatShading color={new Color(k, k, k)} />
      </mesh>
      <mesh scale={1.05}>
        <sphereGeometry args={[r, 32, 20]} />
        <meshBasicMaterial color={new Color("#8fd0ff").lerp(new Color("#dff4ff"), fr)} transparent opacity={0.12 * (1 - 0.6 * dark)} depthWrite={false} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ ÁRVORE MURCHANDO + GEADA */

/** Árvore com folhas que murcham (wilt 0..1: verde → marrom, caindo) e geada (frost 0..1) no chão. */
export const WiltingTree: React.FC<{ f: number; wilt?: number; frost?: number }> = ({ f, wilt = 0, frost = 0 }) => {
  const w = clamp(wilt, 0, 1), fr = clamp(frost, 0, 1);
  const leaves = useMemo(() => Array.from({ length: 14 }, (_, i) => ({
    p: [(rand(`lx${i}`) - 0.5) * 0.9, 0.95 + rand(`ly${i}`) * 0.55, (rand(`lz${i}`) - 0.5) * 0.9] as Vec3,
    r: 0.16 + rand(`lr${i}`) * 0.1,
    fall: rand(`lf${i}`),
  })), []);
  const leafC = C("#3f8f3e").lerp(C("#b87a2a"), clamp(w * 1.4, 0, 1)).lerp(C("#6a4a2a"), clamp(w * 1.4 - 0.6, 0, 1));
  return (
    <group>
      {/* chão com geada */}
      <mesh position={[0, -0.04, 0]} receiveShadow>
        <cylinderGeometry args={[1.5, 1.6, 0.08, 24]} />
        <meshStandardMaterial color={C("#5f8a3a").lerp(C("#dcecf4"), fr)} {...M} />
      </mesh>
      {/* tronco e galhos */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <cylinderGeometry args={[0.06, 0.11, 0.9, 7]} />
        <meshStandardMaterial color="#5a3e26" {...M} />
      </mesh>
      {[[-0.25, 0.85, 0.6], [0.25, 0.9, -0.7], [0.05, 1.0, 0.1]].map(([x, y, rz], i) => (
        <mesh key={i} position={[x * 0.5, y, 0]} rotation={[0, i, rz]}>
          <cylinderGeometry args={[0.025, 0.04, 0.5, 5]} />
          <meshStandardMaterial color="#5a3e26" {...M} />
        </mesh>
      ))}
      {/* folhas (caem conforme murcham) */}
      {leaves.map((l, i) => {
        const fallen = clamp((w - 0.35 - l.fall * 0.5) * 3, 0, 1);
        const y = l.p[1] * (1 - fallen) + 0.03 * fallen;
        return (
          <mesh key={i} position={[l.p[0] * (1 + fallen * 0.6), y, l.p[2] * (1 + fallen * 0.6)]} scale={[1, 1 - fallen * 0.8, 1]}>
            <icosahedronGeometry args={[l.r * (1 - w * 0.25), 0]} />
            <meshStandardMaterial color={leafC} {...M} />
          </mesh>
        );
      })}
      {/* cristais de geada */}
      {fr > 0.01
        ? Array.from({ length: 24 }, (_, i) => {
            const a = rand(`fa${i}`) * Math.PI * 2, rr = 0.3 + rand(`fr${i}`) * 1.1;
            return (
              <mesh key={i} position={[Math.cos(a) * rr, 0.02, Math.sin(a) * rr]} rotation={[0, a, 0]} scale={fr}>
                <octahedronGeometry args={[0.04, 0]} />
                <meshStandardMaterial color="#f0faff" emissive="#9fd8ff" emissiveIntensity={0.3} />
              </mesh>
            );
          })
        : null}
      {/* neve caindo */}
      {fr > 0.01
        ? Array.from({ length: 30 }, (_, i) => {
            const ph = (f * 0.008 + rand(`sn${i}`)) % 1;
            return (
              <mesh key={`s${i}`} position={[(rand(`sx${i}`) - 0.5) * 2.6, 2.2 - ph * 2.2, (rand(`sz${i}`) - 0.5) * 2.2]} scale={0.025}>
                <icosahedronGeometry args={[1, 0]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={fr * 0.9} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/* ------------------------------------------------------------------ OCEANO EM CORTE (gelo por cima) */

/** Bloco de oceano em corte: camada de gelo no topo (ice 0..1 = espessura), água escura embaixo, fundo de rocha. */
export const IceOceanSlice: React.FC<{ ice?: number; w?: number; d?: number; depth?: number }> = ({ ice = 1, w = 8, d = 3, depth = 4 }) => {
  const t = clamp(ice, 0, 1) * 0.5;
  return (
    <group>
      {/* gelo: placa com rachaduras e topo branco */}
      <mesh position={[0, -t / 2 + 0.02, 0]} castShadow receiveShadow>
        <boxGeometry args={[w, Math.max(0.02, t), d]} />
        <meshStandardMaterial color="#cfe6f4" roughness={0.25} metalness={0.05} transparent opacity={0.96} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[(rand(`ic${i}`) - 0.5) * w * 0.9, 0.025, (rand(`iz${i}`) - 0.5) * d * 0.8]} rotation={[-Math.PI / 2, 0, rand(`ir${i}`) * 3]}>
          <planeGeometry args={[0.6, 0.02]} />
          <meshBasicMaterial color="#8fb8d0" />
        </mesh>
      ))}
      {/* água (corte frontal em degradê: azul escuro → quase preto) */}
      {Array.from({ length: 6 }, (_, i) => {
        const y0 = -t - (i * (depth - t)) / 6;
        const h = (depth - t) / 6;
        return (
          <mesh key={`w${i}`} position={[0, y0 - h / 2, d / 2]}>
            <planeGeometry args={[w, h + 0.002]} />
            <meshStandardMaterial color={C("#1e4a7a").lerp(C("#060c1e"), i / 5)} roughness={0.6} />
          </mesh>
        );
      })}
      <mesh position={[0, -depth / 2, -d / 2]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[w, depth]} />
        <meshStandardMaterial color="#081428" />
      </mesh>
      {/* "dentes" de gelo por baixo da placa */}
      {t > 0.05
        ? Array.from({ length: 14 }, (_, i) => (
            <mesh key={`it${i}`} position={[-w / 2 + 0.3 + (i / 13) * (w - 0.6), -t - 0.08 * t * 4, d / 2 - 0.05]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[0.12, 0.3 * t * 3 * (0.6 + rand(`ih${i}`) * 0.8), 5]} />
              <meshStandardMaterial color="#b8d8ec" roughness={0.25} />
            </mesh>
          ))
        : null}
      {/* peixinhos e partículas na água escura */}
      {Array.from({ length: 6 }, (_, i) => (
        <mesh key={`fi${i}`} position={[-w / 2 + 1 + rand(`fx${i}`) * (w - 2), -t - 0.6 - rand(`fy${i}`) * (depth - 1.4), d / 2 + 0.02]} rotation={[0, 0, Math.PI / 2]} scale={[1, 1.8, 1]}>
          <coneGeometry args={[0.05, 0.12, 4]} />
          <meshBasicMaterial color="#6a9ac8" transparent opacity={0.6} />
        </mesh>
      ))}
      {/* brilho quente lá no fundo (fonte hidrotermal) */}
      <mesh position={[w * 0.28, -depth + 0.25, d / 2 + 0.02]}>
        <circleGeometry args={[0.45, 20]} />
        <meshBasicMaterial color="#ff8a3a" transparent opacity={0.45} toneMapped={false} />
      </mesh>
      <mesh position={[w * 0.28, -depth + 0.2, d / 2 + 0.03]}>
        <coneGeometry args={[0.16, 0.5, 6]} />
        <meshStandardMaterial color="#2a2228" emissive="#ff5a10" emissiveIntensity={0.25} flatShading />
      </mesh>
      {/* fundo de rocha */}
      <mesh position={[0, -depth - 0.15, 0]}>
        <boxGeometry args={[w, 0.3, d]} />
        <meshStandardMaterial color="#3a3238" {...M} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ FONTE HIDROTERMAL (vida sem Sol) */

/** Chaminé hidrotermal ("fumante negro") com fumaça quente, brilho laranja na boca e vermes-tubo vermelhos. */
export const HydrothermalVent: React.FC<{ f: number; s?: number; life?: number }> = ({ f, s = 1, life = 1 }) => {
  const lv = clamp(life, 0, 1);
  return (
    <group scale={s}>
      {/* chaminés (pilhas irregulares) */}
      {[[0, 0, 1.0, 0.32], [0.55, 0.2, 0.62, 0.22], [-0.5, -0.15, 0.5, 0.2]].map(([x, z, h, r], i) => (
        <group key={i} position={[x, 0, z]}>
          {Array.from({ length: 4 }, (_, j) => (
            <mesh key={j} position={[Math.sin(j * 2 + i) * 0.03, (j + 0.5) * (h / 4), 0]} castShadow>
              <cylinderGeometry args={[r * (1 - (j + 1) * 0.16), r * (1 - j * 0.16), h / 4, 7]} />
              <meshStandardMaterial color={j % 2 ? "#2a2228" : "#3a2e2a"} {...M} />
            </mesh>
          ))}
          {/* boca brilhante */}
          <mesh position={[0, h + 0.01, 0]}>
            <cylinderGeometry args={[r * 0.3, r * 0.34, 0.03, 8]} />
            <meshStandardMaterial color="#ff8a2a" emissive="#ff5a10" emissiveIntensity={1.4} />
          </mesh>
          {/* fumaça escura subindo */}
          {Array.from({ length: 7 }, (_, j) => {
            const ph = (f * 0.012 + j / 7 + i * 0.3) % 1;
            return (
              <mesh key={`p${j}`} position={[Math.sin(ph * 5 + i) * 0.08, h + 0.1 + ph * 1.4, 0]} scale={(0.1 + ph * 0.28) * r * 3}>
                <icosahedronGeometry args={[1, 1]} />
                <meshStandardMaterial color={C("#3a3038").lerp(C("#1a1418"), ph)} transparent opacity={0.75 * (1 - ph)} depthWrite={false} flatShading />
              </mesh>
            );
          })}
        </group>
      ))}
      {/* vermes-tubo: tubos brancos com pluma vermelha, balançando */}
      {lv > 0.01
        ? Array.from({ length: 16 }, (_, i) => {
            const a = rand(`tw${i}`) * Math.PI * 2, rr = 0.45 + rand(`tr${i}`) * 0.5;
            const h = 0.18 + rand(`th${i}`) * 0.2;
            const sway = Math.sin(f / 14 + i) * 0.12;
            return (
              <group key={i} position={[Math.cos(a) * rr, 0, Math.sin(a) * rr * 0.7]} rotation={[sway, 0, sway * 0.6]} scale={[1, lv, 1]}>
                <mesh position={[0, h / 2, 0]}>
                  <cylinderGeometry args={[0.018, 0.022, h, 6]} />
                  <meshStandardMaterial color="#efe8dc" roughness={0.6} />
                </mesh>
                <mesh position={[0, h + 0.025, 0]}>
                  <sphereGeometry args={[0.035, 8, 6]} />
                  <meshStandardMaterial color="#e83a3a" emissive="#a01a1a" emissiveIntensity={0.3} roughness={0.5} />
                </mesh>
              </group>
            );
          })
        : null}
      {/* chão de rocha + bactérias (manchas claras) */}
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <cylinderGeometry args={[1.4, 1.5, 0.06, 18]} />
        <meshStandardMaterial color="#2e2830" {...M} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => {
        const a = rand(`mb${i}`) * Math.PI * 2, rr = 0.3 + rand(`mr${i}`) * 0.9;
        return (
          <mesh key={`m${i}`} position={[Math.cos(a) * rr, 0.004, Math.sin(a) * rr]} rotation={[-Math.PI / 2, 0, a]}>
            <circleGeometry args={[0.08 + rand(`ms${i}`) * 0.08, 6]} />
            <meshStandardMaterial color="#e8d8b0" emissive="#806040" emissiveIntensity={0.2} />
          </mesh>
        );
      })}
      {/* brilho quente geral */}
      <pointLight position={[0, 1.0, 0.3]} intensity={2.2} distance={3.5} color="#ff9a4a" />
    </group>
  );
};

/** "Trem" de luz: pulsos amarelos viajando do Sol (x=0) até a Terra (x=L). t 0..1 = frente do trem; tail = comprimento. */
export const LightTrain: React.FC<{ L: number; t: number; on?: number; y?: number }> = ({ L, t, on = 1, y = 0 }) => (
  <group>
    {Array.from({ length: 26 }, (_, i) => {
      const u = i / 25;
      const x = u * L;
      const visible = u <= t;
      if (!visible) return null;
      const head = 1 - clamp((t - u) * 6, 0, 1);
      return (
        <mesh key={i} position={[x, y, 0]} scale={0.08 + head * 0.08}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshBasicMaterial color="#ffe27a" transparent opacity={clamp(on, 0, 1) * (0.5 + 0.5 * head)} toneMapped={false} />
        </mesh>
      );
    })}
  </group>
);
