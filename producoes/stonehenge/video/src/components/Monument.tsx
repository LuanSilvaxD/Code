import { useMemo } from "react";
import * as THREE from "three";
import { clamp } from "../utils/animation";
import { AltarStone, Bluestone, C, HeelStone, Lintel, roughBlock, Sarsen, Trilithon } from "./Stones";
import { heightAt } from "./Terrain";

// Stonehenge montável em METROS. Eixo do solstício = +x (nordeste). `built` 0..1 ergue tudo em ordem
// (anel → lintéis → trilitos → pedras azuis → Altar); `ruin` 0..1 leva ao estado APROXIMADO de hoje.

const RING = 15; // raio do anel de sarsens (Ø 30 m)
const N = 30;
const deg = (d: number) => (d * Math.PI) / 180;
const upAngle = (i: number) => deg(i * 12 + 6); // pedra em pé i (vão de entrada centrado no eixo +x)
const linAngle = (i: number) => deg(i * 12 + 12); // lintel entre i e i+1

// Estado aproximado de hoje (não é pedra a pedra): o lado nordeste está mais completo.
const STANDING = new Set([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 26, 27, 28, 29, 14]);
const LINTEL_ON = new Set([29, 0, 1, 2, 3, 27]);
const FALLEN_UP = new Set([12, 13, 21, 23, 25]);

export const Monument: React.FC<{ built?: number; ruin?: number; ghost?: number; curve?: number; heel?: number; skipUpright?: number }> = ({
  built = 1, ruin = 0, ghost = 0, curve = 1, heel = 1, skipUpright = -1,
}) => {
  const b = clamp(built, 0, 1);
  const r = clamp(ruin, 0, 1);
  // ordem de construção
  const stage = (start: number, len: number, k: number, n: number) => clamp((b - start) / len * n - k, 0, 1);
  const blue = useMemo(() => {
    const out: { x: number; z: number; a: number; h: number; seed: number; ring: boolean }[] = [];
    for (let i = 0; i < 56; i++) {
      const a = deg(i * (360 / 56) + 3);
      if (Math.abs(Math.cos(a)) > 0.995 && Math.cos(a) > 0) continue; // entrada
      out.push({ x: 11.3 * Math.cos(a), z: 11.3 * Math.sin(a), a, h: 1.8 + (i % 4) * 0.15, seed: 100 + i, ring: true });
    }
    for (let i = 0; i < 19; i++) {
      const a = deg(70 + (i / 18) * 220);
      out.push({ x: 4.6 * Math.cos(a) - 0.8, z: 3.9 * Math.sin(a), a, h: 2.0 + (Math.abs(i - 9) < 3 ? 0.4 : 0), seed: 200 + i, ring: false });
    }
    return out;
  }, []);
  const trilithons: { a: number; r: number; h: number; ruin: "none" | "one" | "all" }[] = [
    { a: 180, r: 5.6, h: 7.3, ruin: "one" },
    { a: 128, r: 6.6, h: 6.5, ruin: "none" },
    { a: -128, r: 6.6, h: 6.5, ruin: "all" },
    { a: 74, r: 7.2, h: 6.0, ruin: "none" },
    { a: -74, r: 7.2, h: 6.0, ruin: "none" },
  ];
  const gh = clamp(ghost, 0, 1);
  return (
    <group>
      {/* anel externo: pedras em pé */}
      {Array.from({ length: N }, (_, i) => {
        if (i === skipUpright) return null;
        const a = upAngle(i);
        const t = stage(0, 0.35, i, N);
        if (t <= 0) return null;
        const gone = !STANDING.has(i) && !FALLEN_UP.has(i);
        const fall = FALLEN_UP.has(i) ? r : 0;
        const vanish = gone ? r : 0;
        if (vanish >= 0.999) return null;
        const x = RING * Math.cos(a);
        const z = RING * Math.sin(a);
        return (
          <group key={`u${i}`} position={[x, heightAt(x, z) - 4.4 * (1 - t) - 4.4 * vanish, z]} rotation={[0, Math.PI / 2 - a, 0]}>
            <group rotation={[fall * 1.45, 0, 0]}>
              <Sarsen h={4.1} seed={i + 1} tenons={1} />
            </group>
          </group>
        );
      })}
      {/* anel externo: lintéis curvos */}
      {Array.from({ length: N }, (_, i) => {
        const a = linAngle(i);
        const t = stage(0.35, 0.2, i, N);
        if (t <= 0) return null;
        const keep = LINTEL_ON.has(i);
        const vanish = keep ? 0 : r;
        if (vanish >= 0.999) return null;
        const x = RING * Math.cos(a);
        const z = RING * Math.sin(a);
        return (
          <group key={`l${i}`} position={[x, 4.1 + 0.25 + 3 * (1 - t) + 6 * vanish, z]} rotation={[0, Math.PI / 2 - a, 0]} scale={1 - vanish}>
            <Lintel R={RING} curved={curve} mortises={false} joints={false} />
          </group>
        );
      })}
      {/* ferradura de trilitos (abre para +x) */}
      {trilithons.map((tr, i) => {
        const t = stage(0.55, 0.2, i, trilithons.length);
        if (t <= 0) return null;
        const a = deg(tr.a);
        const x = tr.r * Math.cos(a);
        const z = tr.r * Math.sin(a);
        return (
          <group key={`t${i}`} position={[x, heightAt(x, z) - 8 * (1 - t), z]} rotation={[0, Math.PI / 2 - a, 0]}>
            <Trilithon h={tr.h} seed={50 + i * 3} fallen={r > 0.5 ? tr.ruin : "none"} />
          </group>
        );
      })}
      {/* pedras azuis: círculo e ferradura */}
      {blue.map((s, i) => {
        const t = stage(0.75, 0.15, i, blue.length);
        if (t <= 0) return null;
        const gone = (i * 7) % 10 < 4 ? r : 0;
        if (gone >= 0.999) return null;
        const stump = r > 0.5 && (i * 3) % 7 === 0;
        return (
          <group key={`b${i}`} position={[s.x, heightAt(s.x, s.z) - 2.4 * (1 - t) - 2.4 * gone, s.z]} rotation={[0, Math.PI / 2 - s.a, 0]}>
            <Bluestone h={s.h} seed={s.seed} lean={r * ((i % 5) - 2) * 0.06} stump={stump} />
          </group>
        );
      })}
      {/* Pedra do Altar: deitada, atravessada no eixo, ao pé do Grande Trilito */}
      {b > 0.92 ? (
        <group position={[-4.2, -0.15 + 0.6 * (1 - clamp((b - 0.92) / 0.08, 0, 1)) * 0, 0.3]} rotation={[0, Math.PI / 2, r * 0.05]} scale={clamp((b - 0.92) / 0.08, 0, 1)}>
          <AltarStone />
        </group>
      ) : null}
      {/* Pedra do Calcanhar: fora da vala, na avenida, no eixo */}
      {heel > 0.01 ? (
        <group position={[78, heightAt(78, 0) - 5 * (1 - clamp(heel, 0, 1)), 0]}>
          <HeelStone />
        </group>
      ) : null}
      {/* fantasma do monumento completo (sobre a ruína) */}
      {gh > 0.01 ? <Ghost opacity={gh} /> : null}
    </group>
  );
};

/** Silhueta translúcida do anel completo + trilitos (para "ontem × hoje"). */
const Ghost: React.FC<{ opacity: number }> = ({ opacity }) => {
  const mat = useMemo(() => new THREE.MeshBasicMaterial({ color: "#d9ccff", transparent: true, depthWrite: false }), []);
  mat.opacity = opacity * 0.45;
  const up = useMemo(() => roughBlock(2.1, 4.1, 1.1, 1, 0, 0.12, [1, 1, 1]), []);
  return (
    <group>
      {Array.from({ length: N }, (_, i) => {
        const a = upAngle(i);
        return <mesh key={i} geometry={up} material={mat} position={[RING * Math.cos(a), 0, RING * Math.sin(a)]} rotation={[0, Math.PI / 2 - a, 0]} />;
      })}
      <mesh position={[0, 4.5, 0]} material={mat} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[RING - 0.5, RING + 0.5, 90]} />
      </mesh>
    </group>
  );
};

// ---------------------------------------------------------------- canteiro e ferramentas (metros)

const wood = (color = C.wood) => <meshStandardMaterial color={color} roughness={1} flatShading />;

/** Tronco cilíndrico deitado ao longo de x. */
export const Log: React.FC<{ len: number; r?: number; position?: [number, number, number]; rotY?: number; color?: string }> = ({ len, r = 0.18, position = [0, 0, 0], rotY = 0, color = C.wood }) => (
  <mesh position={position} rotation={[0, rotY, Math.PI / 2]} castShadow receiveShadow>
    <cylinderGeometry args={[r, r * 1.05, len, 7]} />
    {wood(color)}
  </mesh>
);

/** Trenó de madeira (5,5 m) com a pedra deitada por cima, frente para +x. */
export const Sledge: React.FC<{ stone?: boolean; rough?: number }> = ({ stone = true, rough = 1 }) => (
  <group>
    {[-0.85, 0.85].map((z) => (
      <group key={z} position={[0, 0.2, z]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[5.5, 0.3, 0.3]} />
          {wood(C.woodDark)}
        </mesh>
        <mesh position={[2.85, 0.18, 0]} rotation={[0, 0, 0.6]} castShadow>
          <boxGeometry args={[0.6, 0.28, 0.3]} />
          {wood(C.woodDark)}
        </mesh>
      </group>
    ))}
    {[-2.2, -1.1, 0, 1.1, 2.2].map((x) => (
      <Log key={x} len={2.2} r={0.13} position={[x, 0.45, 0]} rotY={Math.PI / 2} />
    ))}
    {stone ? (
      <group position={[0, 0.58, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <group position={[0, -2.1, 0]}>
          <Sarsen h={4.6} w={2.0} d={1.1} seed={9} rough={rough} tenons={0} lichen={false} />
        </group>
      </group>
    ) : null}
  </group>
);

/** Trilho de troncos: dois trilhos longos sobre dormentes, ao longo de x. */
export const Rails: React.FC<{ len?: number; show?: number }> = ({ len = 20, show = 1 }) => {
  const n = Math.floor(len / 1.6);
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const t = clamp(show * n - i, 0, 1);
        return t > 0 ? (
          <group key={i} scale={[1, t, 1]}>
            <Log len={2.6} r={0.12} position={[-len / 2 + i * 1.6 + 0.8, 0.12, 0]} rotY={Math.PI / 2} color={C.woodDark} />
          </group>
        ) : null;
      })}
      {[-0.85, 0.85].map((z) => (
        <Log key={z} len={len * clamp(show, 0, 1)} r={0.14} position={[-len / 2 + (len * clamp(show, 0, 1)) / 2, 0.3, z]} />
      ))}
    </group>
  );
};

/** Corda reta entre dois pontos. */
export const Rope: React.FC<{ a: [number, number, number]; b: [number, number, number]; r?: number }> = ({ a, b, r = 0.04 }) => {
  const va = new THREE.Vector3(...a);
  const vb = new THREE.Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const len = va.distanceTo(vb);
  const qn = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), vb.clone().sub(va).normalize());
  return (
    <mesh position={mid} quaternion={qn}>
      <cylinderGeometry args={[r, r, len, 5]} />
      <meshStandardMaterial color={C.rope} roughness={1} />
    </mesh>
  );
};

/** Martelo de pedra (seixo arredondado). size em metros. */
export const Hammerstone: React.FC<{ size: number; seed?: number; position?: [number, number, number] }> = ({ size, seed = 3, position = [0, 0, 0] }) => {
  const geo = useMemo(() => {
    const g = new THREE.IcosahedronGeometry(size / 2, 1);
    const p = g.attributes.position as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) {
      const k = 1 + 0.12 * Math.sin(p.getX(i) * 40 + seed) * Math.cos(p.getY(i) * 37 + seed * 2);
      p.setXYZ(i, p.getX(i) * k * 1.15, p.getY(i) * k * 0.9, p.getZ(i) * k);
    }
    g.computeVertexNormals();
    return g;
  }, [size, seed]);
  return (
    <mesh geometry={geo} position={position} castShadow>
      <meshStandardMaterial color={seed % 2 ? "#9a9180" : "#6d6a66"} roughness={0.9} flatShading />
    </mesh>
  );
};

/** Lascas (fragmentos) voando de um ponto; t 0..1 = tempo desde o golpe. */
export const Chips: React.FC<{ t: number; origin: [number, number, number]; seed?: number }> = ({ t, origin, seed = 0 }) =>
  t > 0 && t < 1 ? (
    <group position={origin}>
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2 + seed;
        const v = 1.2 + (i % 3) * 0.5;
        return (
          <mesh key={i} position={[Math.cos(a) * v * t * 0.35, 0.6 * t - 0.9 * t * t, Math.sin(a) * v * t * 0.35 + 0.2 * t]} rotation={[i, i * 2, t * 8]}>
            <tetrahedronGeometry args={[0.022 + (i % 2) * 0.014, 0]} />
            <meshStandardMaterial color="#b4ab98" flatShading />
          </mesh>
        );
      })}
    </group>
  ) : null;

/** Buraco em CORTE: bloco de chão (giz) com uma parede vertical (−x) e uma rampa inclinada (+x). */
export const PitSection: React.FC<{ depth?: number; dig?: number }> = ({ depth = 1.8, dig = 1 }) => {
  const d = depth * clamp(dig, 0, 1);
  const shape = useMemo(() => {
    const s = new THREE.Shape();
    // perfil (x, y) da parede de corte; buraco entre x = −1.2 e x = 0.6, rampa até x = 4
    s.moveTo(-5, 0);
    s.lineTo(-1.2, 0);
    s.lineTo(-1.2, -d);
    s.lineTo(0.6, -d);
    s.lineTo(4, 0);
    s.lineTo(6, 0);
    s.lineTo(6, -3.2);
    s.lineTo(-5, -3.2);
    s.closePath();
    return s;
  }, [d]);
  return (
    <group>
      <mesh castShadow receiveShadow>
        <extrudeGeometry args={[shape, { depth: 3, bevelEnabled: false }]} />
        <meshStandardMaterial color="#e6dfcd" roughness={1} flatShading />
      </mesh>
      {/* fundo do buraco (parede de trás, mais sombreada) */}
      <mesh position={[0, -d / 2, 0.02]}>
        <planeGeometry args={[6, d + 0.1]} />
        <meshStandardMaterial color="#b9b09a" roughness={1} />
      </mesh>
      {/* faixa de terra escura no topo do corte */}
      <mesh position={[0.5, -0.18, 3.005]}>
        <planeGeometry args={[11, 0.36]} />
        <meshStandardMaterial color="#5a4632" roughness={1} />
      </mesh>
      {/* grama por cima */}
      <mesh position={[-3.1, 0.01, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 3]} />
        <meshStandardMaterial color="#76944f" roughness={1} />
      </mesh>
      <mesh position={[5, 0.01, 1.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2, 3]} />
        <meshStandardMaterial color="#76944f" roughness={1} />
      </mesh>
    </group>
  );
};

/** Escoras em A (dois troncos cruzados) com corda. Altura em metros. */
export const AFrame: React.FC<{ h?: number; spread?: number }> = ({ h = 5, spread = 1.6 }) => (
  <group>
    {[-1, 1].map((s) => (
      <mesh key={s} position={[0, h / 2, (s * spread) / 2]} rotation={[(-s * Math.atan2(spread / 2, h)), 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.15, Math.hypot(h, spread / 2) * 1.04, 6]} />
        {wood()}
      </mesh>
    ))}
    <mesh position={[0, h * 0.62, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
      <cylinderGeometry args={[0.09, 0.09, spread * 0.55, 6]} />
      {wood(C.woodDark)}
    </mesh>
  </group>
);

/** Plataforma de troncos cruzados: `layers` camadas (pode ser fracionário), cada uma 0,35 m. */
export const Crib: React.FC<{ layers: number; w?: number; d?: number }> = ({ layers, w = 3.6, d = 2.4 }) => {
  const full = Math.floor(layers);
  const frac = layers - full;
  return (
    <group>
      {Array.from({ length: Math.ceil(layers) }, (_, i) => {
        const s = i < full ? 1 : frac;
        const y = i * 0.35 + 0.18;
        const alongX = i % 2 === 0;
        const n = 4;
        return (
          <group key={i} scale={[1, s, 1]}>
            {Array.from({ length: n }, (_, k) => {
              const o = -((n - 1) / 2) * (alongX ? d / (n - 1) : w / (n - 1)) + k * (alongX ? d / (n - 1) : w / (n - 1));
              return alongX ? <Log key={k} len={w} r={0.17} position={[0, y, o]} /> : <Log key={k} len={d} r={0.17} position={[o, y, 0]} rotY={Math.PI / 2} />;
            })}
          </group>
        );
      })}
    </group>
  );
};

/** Sol low-poly com halo (aditivo). */
export const Sun: React.FC<{ position: [number, number, number]; color?: string; size?: number; glow?: number }> = ({ position, color = "#ffd27a", size = 6, glow = 1 }) => (
  <group position={position}>
    <mesh>
      <icosahedronGeometry args={[size, 1]} />
      <meshBasicMaterial color={color} />
    </mesh>
    {[1.6, 2.4, 3.6].map((k, i) => (
      <mesh key={k}>
        <sphereGeometry args={[size * k, 20, 14]} />
        <meshBasicMaterial color={color} transparent opacity={(0.22 - i * 0.06) * glow} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
    ))}
  </group>
);
