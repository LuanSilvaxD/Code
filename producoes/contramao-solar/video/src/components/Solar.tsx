import { useLayoutEffect, useMemo, useRef } from "react";
import { AdditiveBlending, Color, IcosahedronGeometry, InstancedMesh, Object3D, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { Sun } from "./Apagao";

// "Contramão no Sistema Solar" — elementos novos (aprovar na folha). u3d esquemáticos, fora de escala.
const M = { roughness: 0.8, metalness: 0, flatShading: true } as const;
const tmp = new Object3D();

/** Planetas esquemáticos: raio da órbita (u3d), raio do planeta, cor, período relativo. */
export const PLANETS = [
  { name: "Mercúrio", a: 1.6, r: 0.2, color: "#a89a8a", T: 0.24 },
  { name: "Vênus", a: 2.2, r: 0.3, color: "#e8c27a", T: 0.62 },
  { name: "Terra", a: 2.9, r: 0.32, color: "#3f8fe0", T: 1 },
  { name: "Marte", a: 3.6, r: 0.24, color: "#d0603a", T: 1.88 },
  { name: "Júpiter", a: 5.0, r: 0.72, color: "#d8b08a", T: 11.9, bands: true },
  { name: "Saturno", a: 6.3, r: 0.6, color: "#e6d29a", T: 29.5, ring: true },
  { name: "Urano", a: 7.5, r: 0.45, color: "#8fd8e0", T: 84 },
  { name: "Netuno", a: 8.6, r: 0.45, color: "#4a6ae0", T: 165 },
];
export const NEPTUNE_A = 8.6;

export const Planet: React.FC<{ r: number; color: string; bands?: boolean; ring?: boolean; spin?: number }> = ({ r, color, bands, ring, spin = 0 }) => (
  <group rotation={[0.2, spin, 0]}>
    <mesh castShadow>
      <icosahedronGeometry args={[r, 2]} />
      <meshStandardMaterial color={color} {...M} />
    </mesh>
    {bands
      ? [-0.4, 0, 0.35].map((y, i) => (
          <mesh key={i} position={[0, y * r, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[r * Math.sqrt(1 - y * y) * 1.003, r * 0.06, 4, 24]} />
            <meshStandardMaterial color={i % 2 ? "#b0805a" : "#c49270"} {...M} />
          </mesh>
        ))
      : null}
    {ring ? (
      <mesh rotation={[Math.PI / 2 - 0.35, 0, 0]}>
        <ringGeometry args={[r * 1.4, r * 2.2, 40]} />
        <meshStandardMaterial color="#d9c48a" side={2} transparent opacity={0.85} roughness={0.7} />
      </mesh>
    ) : null}
  </group>
);

/** Linha de órbita circular no plano xz. */
export const OrbitRing: React.FC<{ a: number; color?: string; opacity?: number; w?: number }> = ({ a, color = "#8f86c8", opacity = 0.55, w = 0.018 }) => (
  <mesh rotation={[Math.PI / 2, 0, 0]}>
    <torusGeometry args={[a, w, 4, 128]} />
    <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
  </mesh>
);

/** Seta curva sobre a órbita indicando o sentido (dir 1 = anti-horário visto de cima). */
export const OrbitArrow: React.FC<{ a: number; at: number; dir?: 1 | -1; color?: string; len?: number; v?: number }> = ({ a, at, dir = 1, color = "#4ade80", len = 0.7, v = 1 }) => {
  if (v <= 0.01) return null;
  const k = clamp(v, 0, 1);
  // anti-horário visto de cima (+y) = ângulo crescente em -z... usamos x=cos, z=-sin
  const ang = at;
  const p: Vec3 = [Math.cos(ang) * a, 0.02, -Math.sin(ang) * a];
  const tangent = new Vector3(-Math.sin(ang), 0, -Math.cos(ang)).multiplyScalar(dir);
  const rotY = Math.atan2(tangent.x, tangent.z);
  return (
    <group position={p} rotation={[0, rotY, 0]} scale={k}>
      <mesh position={[0, 0, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, len, 6]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      <mesh position={[0, 0, len / 2 + 0.12]} rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.22, 0.42, 8]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Posição de um planeta na órbita (anti-horário visto de cima). */
export const planetPos = (a: number, ang: number): Vec3 => [Math.cos(ang) * a, 0, -Math.sin(ang) * a];

/** Sistema Solar esquemático. t = "tempo" (rad da Terra). arrows 0..1. */
export const SolarSystem: React.FC<{ f: number; t: number; arrows?: number; dim?: number; sunR?: number }> = ({ f, t, arrows = 0, dim = 0, sunR = 0.85 }) => (
  <group>
    <Sun r={sunR} f={f} />
    {PLANETS.map((p, i) => {
      const ang = t / p.T + i * 1.7;
      return (
        <group key={p.name}>
          <OrbitRing a={p.a} opacity={0.45 * (1 - dim * 0.6)} />
          <group position={planetPos(p.a, ang)}>
            <Planet r={p.r} color={p.color} bands={p.bands} ring={p.ring} spin={f * 0.02} />
          </group>
          <OrbitArrow a={p.a} at={ang + 0.45 + 2.2 / p.a} v={arrows} len={Math.min(0.9, 0.35 + p.a * 0.06)} />
        </group>
      );
    })}
  </group>
);

/** Rocha R631: corpo irregular escuro avermelhado. */
export const Rock: React.FC<{ s?: number; spin?: number; color?: string; seed?: string }> = ({ s = 1, spin = 0, color = "#7a3e30", seed = "r631" }) => {
  const geo = useMemo(() => {
    const g = new IcosahedronGeometry(1, 2);
    const pos = g.attributes.position;
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const n = 0.78 + 0.32 * rand(`${seed}${Math.round(v.x * 5)}${Math.round(v.y * 5)}${Math.round(v.z * 5)}`);
      v.multiplyScalar(n);
      v.x *= 1.35;
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }, [seed]);
  return (
    <group scale={s} rotation={[0.4, spin, 0.2]}>
      <mesh geometry={geo} castShadow>
        <meshStandardMaterial color={color} roughness={0.95} flatShading />
      </mesh>
      {[[0.6, 0.5, 0.55], [-0.5, 0.3, 0.7], [0.1, -0.6, 0.7]].map((p, i) => (
        <mesh key={i} position={p as Vec3} scale={0.22 - i * 0.04}>
          <sphereGeometry args={[1, 8, 6]} />
          <meshStandardMaterial color="#4a2418" roughness={1} flatShading />
        </mesh>
      ))}
    </group>
  );
};

/** Órbita da R631: elipse (periélio por dentro de Netuno) inclinada 142° (= 38° com sentido invertido).
 *  peri/apo em u3d; angle = inclinação em graus (0 = no plano). Retorna também posição no parâmetro u. */
export const r631Orbit = (u: number, peri = 6.6, apo = 15, incl = 142, node = 0.6) => {
  const a = (peri + apo) / 2;
  const e = (apo - peri) / (apo + peri);
  // anomalia: u em rad; r = a(1-e²)/(1+e cos u); periélio em u=0
  const r = (a * (1 - e * e)) / (1 + e * Math.cos(u));
  const x = Math.cos(u) * r;
  const z = -Math.sin(u) * r;
  const I = (incl * Math.PI) / 180;
  // inclina em torno do eixo x (linha dos nodos girada por node)
  const y2 = -z * Math.sin(I);
  const z2 = z * Math.cos(I);
  const c = Math.cos(node), sN = Math.sin(node);
  return [x * c - z2 * sN, y2, x * sN + z2 * c] as Vec3;
};

export const R631Orbit: React.FC<{ incl?: number; draw?: number; color?: string; opacity?: number }> = ({ incl = 142, draw = 1, color = "#ff5a4a", opacity = 0.9 }) => {
  const pts = useMemo(() => Array.from({ length: 241 }, (_, i) => r631Orbit((i / 240) * Math.PI * 2, undefined, undefined, incl)), [incl]);
  const n = Math.max(2, Math.round(240 * clamp(draw, 0, 1)));
  return (
    <group>
      {pts.slice(0, n).map((p, i) =>
        i % 2 === 0 ? (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.045, 6, 4]} />
            <meshBasicMaterial color={color} transparent opacity={opacity} toneMapped={false} />
          </mesh>
        ) : null,
      )}
    </group>
  );
};

/** Observatório Vera Rubin estilizado (genérico): montanha, prédio, cúpula cilíndrica com fenda, telescópio. */
export const Observatory: React.FC<{ f: number; open?: number }> = ({ f, open = 1 }) => (
  <group>
    {/* montanha */}
    <mesh position={[0, -1.6, 0]} receiveShadow>
      <coneGeometry args={[5.5, 3.2, 9]} />
      <meshStandardMaterial color="#6a5a4e" {...M} />
    </mesh>
    <mesh position={[0, -0.02, 0]} receiveShadow>
      <cylinderGeometry args={[1.9, 2.2, 0.12, 9]} />
      <meshStandardMaterial color="#8a7a6a" {...M} />
    </mesh>
    {/* prédio de apoio */}
    <mesh position={[-1.0, 0.45, 0.2]} castShadow>
      <boxGeometry args={[1.5, 0.8, 1.1]} />
      <meshStandardMaterial color="#e8e6e2" {...M} />
    </mesh>
    {/* cúpula cilíndrica */}
    <group position={[0.55, 0.1, 0]} rotation={[0, Math.sin(f / 90) * 0.3, 0]}>
      <mesh position={[0, 0.75, 0]} castShadow>
        <cylinderGeometry args={[0.85, 0.85, 1.5, 24]} />
        <meshStandardMaterial color="#f2f2f0" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.55, 0]}>
        <cylinderGeometry args={[0.78, 0.85, 0.12, 24]} />
        <meshStandardMaterial color="#d8d8d4" roughness={0.5} />
      </mesh>
      {/* fenda aberta */}
      <mesh position={[0, 1.05, 0.8]} scale={[1, open, 1]}>
        <boxGeometry args={[0.42, 0.9, 0.12]} />
        <meshStandardMaterial color="#14101e" />
      </mesh>
      {/* telescópio espiando */}
      <mesh position={[0, 1.2, 0.55]} rotation={[0.7, 0, 0]}>
        <cylinderGeometry args={[0.16, 0.2, 0.7, 10]} />
        <meshStandardMaterial color="#3a3550" metalness={0.4} roughness={0.4} />
      </mesh>
    </group>
  </group>
);

/** Disco protoplanetário: partículas girando; form 0..1 junta grumos em anéis (planetas nascendo). */
export const ProtoDisk: React.FC<{ f: number; form?: number; n?: number; R?: number }> = ({ f, form = 0, n = 1400, R = 6 }) => {
  const ref = useRef<InstancedMesh>(null);
  const seeds = useMemo(() => Array.from({ length: n }, (_, i) => ({ r: 0.9 + Math.pow(rand(`dr${i}`), 0.8) * (R - 0.9), a: rand(`da${i}`) * Math.PI * 2, y: (rand(`dy${i}`) - 0.5) * 0.25, s: 0.03 + rand(`ds${i}`) * 0.05, ring: Math.floor(rand(`dk${i}`) * 4) })), [n, R]);
  const rings = [1.8, 2.9, 4.1, 5.3];
  useLayoutEffect(() => {
    const m = ref.current;
    if (!m) return;
    const k = clamp(form, 0, 1);
    const c = new Color();
    seeds.forEach((p, i) => {
      const target = rings[p.ring];
      const r = p.r + (target - p.r) * k * 0.9;
      // grumo: ângulo se concentra perto de um ponto por anel
      const clump = p.ring * 1.9;
      let da = ((p.a - clump + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
      da *= 1 - 0.92 * k;
      const w = 0.9 / Math.pow(r, 1.5);
      const a = clump + da + f * w * 0.05;
      tmp.position.set(Math.cos(a) * r, p.y * (1 - k), -Math.sin(a) * r);
      tmp.scale.setScalar(p.s * (1 + k * 0.6));
      tmp.updateMatrix();
      m.setMatrixAt(i, tmp.matrix);
      c.set(r < 2.5 ? "#ffcf8a" : r < 4 ? "#e0a070" : "#9a86d0");
      m.setColorAt(i, c);
    });
    m.instanceMatrix.needsUpdate = true;
    if (m.instanceColor) m.instanceColor.needsUpdate = true;
  }, [f, form, seeds]);
  return (
    <group>
      <instancedMesh ref={ref} args={[undefined, undefined, n]}>
        <icosahedronGeometry args={[1, 0]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.8, R, 64]} />
        <meshBasicMaterial color="#c08a5a" transparent opacity={0.12} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    </group>
  );
};

/** Estrela distante (outra estrela) com halo. */
export const AlienStar: React.FC<{ f: number; r?: number; color?: string }> = ({ f, r = 0.9, color = "#7ab8ff" }) => (
  <group>
    <mesh>
      <icosahedronGeometry args={[r, 3]} />
      <meshBasicMaterial color={color} toneMapped={false} />
    </mesh>
    {Array.from({ length: 7 }, (_, i) => 1.25 + i * 0.4).map((k, i) => (
      <mesh key={i} scale={k * (1 + 0.02 * Math.sin(f / 10 + i))}>
        <sphereGeometry args={[r, 24, 16]} />
        <meshBasicMaterial color={color} transparent opacity={0.07} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
      </mesh>
    ))}
  </group>
);
