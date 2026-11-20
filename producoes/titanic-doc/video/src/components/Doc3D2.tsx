import { useLayoutEffect, useMemo, useRef } from "react";
import { BufferAttribute, Color, DoubleSide, Group, Material, Mesh, Plane, PlaneGeometry, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { HullMesh, Rod } from "./Doc3D";
import { Lifeboat } from "./Titanic";

// Documentário Titanic — folha 2: Carpathia, Californian, convés dos botes, foguetes, cais de Southampton,
// navio partido, destroços no fundo do mar (1985) e submersível. Navios: 1 u = 10 m; cenas de gente: 1 u = 1 m.
const M = { roughness: 0.75, metalness: 0, flatShading: true } as const;
const C = (h: string) => new Color(h);
const Box: React.FC<{ p: Vec3; s: Vec3; c: string; r?: Vec3; e?: string; ei?: number }> = ({ p, s, c, r, e, ei }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial color={c} {...M} emissive={e} emissiveIntensity={ei} />
  </mesh>
);

/* ================================================================== TRATAMENTO: corte (clipping) e ferrugem */

/**
 * Aplica em todos os materiais dos filhos: um plano de corte local (para partir o navio) e/ou ferrugem
 * (cores puxadas para marrom-alaranjado). O canvas precisa de gl.localClippingEnabled = true.
 */
export const Treat: React.FC<{ clip?: { normal: Vec3; constant: number }; rust?: number; children: React.ReactNode }> = ({ clip, rust = 0, children }) => {
  const ref = useRef<Group>(null);
  const plane = useMemo(() => (clip ? new Plane(new Vector3(...clip.normal), clip.constant) : null), [clip?.normal[0], clip?.normal[1], clip?.normal[2], clip?.constant]);
  useLayoutEffect(() => {
    const g = ref.current;
    if (!g) return;
    g.updateWorldMatrix(true, true);
    const world = plane ? plane.clone().applyMatrix4(g.matrixWorld) : null;
    const rustC = C("#6a3a22");
    g.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.material) return;
      const mats = (Array.isArray(mesh.material) ? mesh.material : [mesh.material]) as (Material & { color?: Color })[];
      for (const m of mats) {
        if (world) {
          m.clippingPlanes = [world];
          m.side = DoubleSide;
        }
        if (rust > 0 && m.color) {
          if (!m.userData.orig) m.userData.orig = m.color.clone();
          m.color.copy(m.userData.orig as Color).lerp(rustC, rust);
        }
        m.needsUpdate = true;
      }
    });
  });
  return <group ref={ref}>{children}</group>;
};

/* ================================================================== NAVIOS COADJUVANTES (1 u = 10 m) */

/** Fumaça de chaminé (bolas que sobem e esticam para trás). */
const Smoke: React.FC<{ p: Vec3; f: number; k?: number; n?: number; s?: number }> = ({ p, f, k = 1, n = 7, s = 1 }) => (
  <group position={p}>
    {Array.from({ length: n }, (_, j) => {
      const ph = (f * 0.009 + j / n) % 1;
      return (
        <mesh key={j} position={[-ph * 3.6 * s, ph * 1.6 * s, Math.sin(ph * 5) * 0.2]} scale={(0.3 + ph * 1.0) * s}>
          <icosahedronGeometry args={[1, 1]} />
          <meshStandardMaterial color="#5a5a64" transparent opacity={0.5 * (1 - ph) * k} depthWrite={false} flatShading />
        </mesh>
      );
    })}
  </group>
);

/** Fileira de luzinhas (escotilhas) num costado. */
const LightRow: React.FC<{ x0: number; x1: number; y: number; z: number; n: number; on: number; seed: string }> = ({ x0, x1, y, z, n, on, seed }) => (
  <>
    {Array.from({ length: n }, (_, i) => {
      const lit = rand(`${seed}${i}`) < on;
      return (
        <mesh key={i} position={[x0 + (i / (n - 1)) * (x1 - x0), y, z]} rotation={[0, z > 0 ? 0 : Math.PI, 0]}>
          <circleGeometry args={[0.04, 6]} />
          <meshBasicMaterial color={lit ? "#ffd890" : "#2a2a34"} toneMapped={false} />
        </mesh>
      );
    })}
  </>
);

/** RMS Carpathia (Cunard, ~170 m): casco preto, superestrutura branca, 1 chaminé vermelha de topo preto, 4 mastros. */
export const Carpathia: React.FC<{ f: number; lights?: number; smoke?: number }> = ({ f, lights = 1, smoke = 1 }) => {
  const T = 1.16;
  return (
    <group>
      <group scale={[0.62, 0.75, 0.8]}><HullMesh /></group>
      <Box p={[-0.6, T + 0.28, 0]} s={[7.6, 0.56, 1.75]} c="#ece8de" />
      <Box p={[-0.4, T + 0.66, 0]} s={[4.4, 0.24, 1.3]} c="#e6e1d4" />
      <Box p={[3.35, T + 0.62, 0]} s={[0.4, 0.4, 1.6]} c="#ece8de" />
      {[1, -1].map((s) => <LightRow key={s} x0={-6.5} x1={6} y={0.6} z={1.125 * s} n={34} on={lights * 0.8} seed={`cp${s}`} />)}
      {[1, -1].map((s) => <LightRow key={`u${s}`} x0={-4.2} x1={3} y={T + 0.3} z={0.88 * s} n={18} on={lights * 0.9} seed={`cu${s}`} />)}
      {/* chaminé Cunard */}
      <group position={[0.2, T + 0.75, 0]} rotation={[0, 0, 0.07]}>
        <mesh position={[0, 0.8, 0]} scale={[1, 1, 0.8]} castShadow>
          <cylinderGeometry args={[0.36, 0.38, 1.6, 18]} />
          <meshStandardMaterial color="#c8502a" {...M} />
        </mesh>
        <mesh position={[0, 1.7, 0]} scale={[1, 1, 0.8]}>
          <cylinderGeometry args={[0.365, 0.365, 0.34, 18]} />
          <meshStandardMaterial color="#121214" {...M} />
        </mesh>
        {[0.95, 1.2].map((y) => (
          <mesh key={y} position={[0, y, 0]} scale={[1, 1, 0.8]}>
            <cylinderGeometry args={[0.372, 0.372, 0.05, 18]} />
            <meshStandardMaterial color="#121214" />
          </mesh>
        ))}
        {smoke > 0.01 ? <Smoke p={[0, 1.9, 0]} f={f} k={smoke} n={8} /> : null}
      </group>
      {/* 4 mastros */}
      {[6.4, 4.2, -4.4, -6.6].map((x) => <Rod key={x} a={[x, T, 0]} b={[x - 0.15, T + 3.4, 0]} r={0.05} c="#8a6a48" seg={6} />)}
      {[1, -1].map((s) => [1.8, 0.6, -1.6, -2.8].map((x) => (
        <mesh key={`${s}${x}`} position={[x, T + 0.62, 0.78 * s]} scale={[0.32, 0.08, 0.1]}>
          <sphereGeometry args={[1, 8, 4, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2]} />
          <meshStandardMaterial color="#f2efe6" {...M} side={DoubleSide} />
        </mesh>
      )))}
      {lights > 0.01 ? (
        <mesh position={[6.25, T + 3.45, 0]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#fff4d0" toneMapped={false} /></mesh>
      ) : null}
    </group>
  );
};

/** SS Californian (~135 m): cargueiro com passageiros, 1 chaminé alta, quase às escuras, parado no gelo. */
export const Californian: React.FC<{ f: number; lights?: number }> = ({ f, lights = 0.3 }) => {
  const T = 1.08;
  return (
    <group>
      <group scale={[0.5, 0.7, 0.65]}><HullMesh /></group>
      <Box p={[0.4, T + 0.3, 0]} s={[3.0, 0.6, 1.4]} c="#d8d2c4" />
      <Box p={[1.6, T + 0.7, 0]} s={[0.6, 0.3, 1.2]} c="#d8d2c4" />
      <Box p={[-4.6, T + 0.2, 0]} s={[1.4, 0.4, 1.2]} c="#d8d2c4" />
      <group position={[0.2, T + 0.6, 0]}>
        <mesh position={[0, 1.0, 0]} castShadow><cylinderGeometry args={[0.26, 0.28, 2.0, 16]} /><meshStandardMaterial color="#d89a7a" {...M} /></mesh>
        <mesh position={[0, 2.1, 0]}><cylinderGeometry args={[0.265, 0.265, 0.3, 16]} /><meshStandardMaterial color="#121214" {...M} /></mesh>
      </group>
      {[4.6, -3.2].map((x) => <Rod key={x} a={[x, T, 0]} b={[x, T + 3.0, 0]} r={0.045} c="#6a5038" seg={6} />)}
      {[1, -1].map((s) => <LightRow key={s} x0={-1} x1={1.8} y={T + 0.3} z={0.71 * s} n={9} on={lights} seed={`ca${s}`} />)}
      <mesh position={[4.6, T + 3.05, 0]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#fff4d0" toneMapped={false} /></mesh>
      {void f}
    </group>
  );
};

/** Gelo solto na água (campo de gelo em volta do Californian). */
export const IceField: React.FC<{ n?: number; R?: number; seed?: string }> = ({ n = 40, R = 14, seed = "if" }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const a = rand(`${seed}a${i}`) * Math.PI * 2, r = 2 + rand(`${seed}r${i}`) * R;
      const sz = 0.15 + rand(`${seed}s${i}`) * 0.5;
      return (
        <mesh key={i} position={[Math.cos(a) * r, 0.02, Math.sin(a) * r]} rotation={[0, rand(`${seed}y${i}`) * 3, 0]} scale={[sz, 0.06 + sz * 0.15, sz * 0.7]}>
          <dodecahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color="#dcecf6" roughness={0.25} flatShading emissive="#2a4a62" emissiveIntensity={0.3} />
        </mesh>
      );
    })}
  </group>
);

/* ================================================================== FOGUETE DE SOCORRO */

/** Foguete branco estourando no céu (estrelas que caem). t 0..1 (0,1 = sobe; 0,1–1 = estoura e cai). */
export const Rocket: React.FC<{ p: Vec3; t: number; s?: number }> = ({ p, t, s = 1 }) => {
  if (t <= 0 || t >= 1) return null;
  const up = clamp(t / 0.12, 0, 1), burst = clamp((t - 0.12) / 0.88, 0, 1);
  return (
    <group position={p} scale={s}>
      {burst <= 0 ? (
        <mesh position={[0, -3 + up * 3, 0]}><sphereGeometry args={[0.08, 6, 4]} /><meshBasicMaterial color="#fff8e0" toneMapped={false} /></mesh>
      ) : (
        Array.from({ length: 18 }, (_, i) => {
          const a = (i / 18) * Math.PI * 2, e = (rand(`rk${i}`) - 0.3) * 1.2;
          const r = 1.6 * Math.sqrt(burst);
          return (
            <mesh key={i} position={[Math.cos(a) * r * Math.cos(e), Math.sin(e) * r - burst * burst * 1.4, Math.sin(a) * r * Math.cos(e)]}>
              <sphereGeometry args={[0.06, 6, 4]} />
              <meshBasicMaterial color="#fffbea" transparent opacity={1 - burst * 0.85} toneMapped={false} depthWrite={false} />
            </mesh>
          );
        })
      )}
      {burst > 0 ? <pointLight intensity={4 * (1 - burst)} distance={30} color="#fff4d0" /> : null}
    </group>
  );
};

/* ================================================================== CONVÉS DOS BOTES (1 u = 1 m) */

/** Turco (davit) curvo de ferro, com cabo descendo até o bote. */
const Davit: React.FC<{ p: Vec3; s: number; drop?: number }> = ({ p, s, drop = 1.2 }) => (
  <group position={p}>
    <Rod a={[0, 0, 0]} b={[0, 2.2, 0]} r={0.08} c="#e8e2d4" seg={8} />
    <Rod a={[0, 2.2, 0]} b={[0, 2.5, 0.5 * s]} r={0.07} c="#e8e2d4" seg={8} />
    <Rod a={[0, 2.5, 0.5 * s]} b={[0, 2.35, 1.1 * s]} r={0.06} c="#e8e2d4" seg={8} />
    <Rod a={[0, 2.35, 1.1 * s]} b={[0, 2.35 - drop, 1.1 * s]} r={0.012} c="#c8b88a" seg={3} />
  </group>
);

/**
 * Convés dos botes à noite: tábuas, amurada, parede da casaria com janelas acesas, base de uma chaminé,
 * ventiladores, dois turcos e um bote baixando (lower 0..1). Bote do lado +z (mar).
 */
export const BoatDeck: React.FC<{ f: number; lower?: number }> = ({ f, lower = 0.2 }) => {
  const by = 1.0 - clamp(lower, 0, 1) * 6;
  return (
    <group>
      {Array.from({ length: 20 }, (_, i) => (
        <mesh key={i} position={[0, -0.05, -3.2 + i * 0.3]} receiveShadow>
          <boxGeometry args={[16, 0.1, 0.295]} />
          <meshStandardMaterial color={i % 2 ? "#a88a60" : "#9c7e56"} flatShading />
        </mesh>
      ))}
      {/* casaria com janelas */}
      <Box p={[0, 1.3, -3.3]} s={[16, 2.6, 0.3]} c="#ece8de" />
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={`w${i}`} position={[-7 + i * 1.55, 1.4, -3.14]}>
          <planeGeometry args={[0.8, 0.9]} />
          <meshBasicMaterial color={rand(`bd${i}`) > 0.2 ? "#ffe2a0" : "#3a3a46"} toneMapped={false} />
        </mesh>
      ))}
      {/* base de chaminé ao fundo */}
      <mesh position={[3.5, 5, -6]} scale={[1, 1, 0.78]}>
        <cylinderGeometry args={[3.2, 3.4, 8, 24]} />
        <meshStandardMaterial color="#c8873a" {...M} />
      </mesh>
      {/* amurada */}
      <Box p={[0, 1.05, 2.75]} s={[16, 0.08, 0.1]} c="#e8e0cc" />
      {Array.from({ length: 32 }, (_, i) => <Box key={`r${i}`} p={[-7.75 + i * 0.5, 0.52, 2.75]} s={[0.05, 1.05, 0.05]} c="#e8e0cc" />)}
      {/* ventiladores */}
      {[-11, 6.5].map((x) => (
        <group key={x} position={[x, 0, -1.8]}>
          <Rod a={[0, 0, 0]} b={[0, 2.0, 0]} r={0.35} c="#e2ddd0" seg={10} />
          <mesh position={[0.35, 2.3, 0]} rotation={[0, 0, -Math.PI / 2]}><cylinderGeometry args={[0.6, 0.38, 0.8, 12]} /><meshStandardMaterial color="#e2ddd0" {...M} /></mesh>
        </group>
      ))}
      {/* turcos + bote */}
      <Davit p={[-3.6, 0, 2.3]} s={1} drop={2.35 - by - 0.4} />
      <Davit p={[3.6, 0, 2.3]} s={1} drop={2.35 - by - 0.4} />
      <group position={[0, by, 3.4]} scale={0.88}>
        <Lifeboat f={f} people={4} row={0} lamp={0} />
      </group>
      {/* lâmpadas do convés */}
      {[-5, 0, 5].map((x) => (
        <group key={`l${x}`}>
          <mesh position={[x, 2.4, -3.1]}><sphereGeometry args={[0.1, 8, 6]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh>
          <pointLight position={[x, 2.3, -2.6]} intensity={1.8} distance={7} color="#ffd08a" />
        </group>
      ))}
    </group>
  );
};

/* ================================================================== CAIS DE SOUTHAMPTON (1 u = 1 m) */

/** Armazém de tijolo com janelas e telhado de duas águas. */
const Warehouse: React.FC<{ p: Vec3; w: number; h: number; d: number; c?: string }> = ({ p, w, h, d, c = "#8a4a34" }) => (
  <group position={p}>
    <Box p={[0, h / 2, 0]} s={[w, h, d]} c={c} />
    <mesh position={[0, h + 1.2, 0]} rotation={[0, 0, 0]} scale={[w / 2, 1.2, d / 2 + 0.2]}>
      <cylinderGeometry args={[0, 1.42, 1, 4, 1]} />
      <meshStandardMaterial color="#4a4a52" {...M} />
    </mesh>
    {Array.from({ length: Math.floor(w / 3) }, (_, i) =>
      [0, 1].map((r) => (
        <mesh key={`${i}${r}`} position={[-w / 2 + 1.6 + i * 3, h * 0.35 + r * h * 0.35, d / 2 + 0.02]}>
          <planeGeometry args={[1.0, 1.4]} />
          <meshStandardMaterial color="#2a2a36" />
        </mesh>
      )),
    )}
  </group>
);

/** Guindaste de cais (treliça). */
const Crane: React.FC<{ p: Vec3; rot?: number }> = ({ p, rot = 0 }) => (
  <group position={p} rotation={[0, rot, 0]}>
    {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([x, z], i) => <Rod key={i} a={[x, 0, z]} b={[x * 0.6, 12, z * 0.6]} r={0.12} c="#3a3a42" seg={5} />)}
    <Box p={[0, 12.5, 0]} s={[3, 1.6, 2.4]} c="#4a4a52" />
    <Rod a={[0, 13, 0]} b={[14, 18, 0]} r={0.18} c="#3a3a42" seg={5} />
    <Rod a={[0, 13, 0]} b={[-5, 13.5, 0]} r={0.18} c="#3a3a42" seg={5} />
    <Rod a={[14, 18, 0]} b={[14, 8, 0]} r={0.03} c="#1a1a1e" seg={3} />
  </group>
);

/** Cais de pedra com cabeços, armazéns e guindastes (o navio fica do lado +z). */
export const Quay: React.FC = () => (
  <group>
    <Box p={[0, -1, -10]} s={[220, 4, 26]} c="#8a8478" />
    <Box p={[0, 0.98, 2.9]} s={[220, 0.06, 0.3]} c="#6a665e" />
    {Array.from({ length: 12 }, (_, i) => (
      <group key={i} position={[-100 + i * 18, 1, 2.2]}>
        <Rod a={[0, 0, 0]} b={[0, 0.6, 0]} r={0.25} c="#1a1a1e" seg={10} />
      </group>
    ))}
    <Warehouse p={[-60, 1, -16]} w={50} h={10} d={12} />
    <Warehouse p={[-5, 1, -17]} w={40} h={12} d={12} c="#7a4030" />
    <Warehouse p={[45, 1, -16]} w={44} h={9} d={12} c="#8e5038" />
    <Crane p={[-30, 1, -3]} rot={-0.3} />
    <Crane p={[25, 1, -3]} rot={0.2} />
  </group>
);

/* ================================================================== FUNDO DO MAR (1985) */

/** Leito do mar: areia escura com ondulações e pedrinhas. */
export const Seabed: React.FC<{ size?: number }> = ({ size = 80 }) => {
  const g = useMemo(() => {
    const p = new PlaneGeometry(size, size, 80, 80).rotateX(-Math.PI / 2);
    const pos = p.attributes.position, col = new Float32Array(pos.count * 3);
    const a = C("#3a342e"), b = C("#5a524a");
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i);
      const y = Math.sin(x * 0.4) * 0.12 + Math.sin(z * 0.6 + x * 0.2) * 0.1 + (rand(`sb${i % 997}`) - 0.5) * 0.08;
      pos.setY(i, y);
      const c = a.clone().lerp(b, clamp(0.5 + y * 3, 0, 1));
      col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    }
    p.setAttribute("color", new BufferAttribute(col, 3));
    p.computeVertexNormals();
    return p;
  }, [size]);
  return (
    <mesh geometry={g} receiveShadow>
      <meshStandardMaterial vertexColors roughness={1} flatShading />
    </mesh>
  );
};

/** Neve marinha (partículas descendo devagar). */
export const MarineSnow: React.FC<{ f: number; n?: number; R?: number; H?: number }> = ({ f, n = 80, R = 12, H = 8 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const ph = (f * 0.003 + rand(`mn${i}`)) % 1;
      return (
        <mesh key={i} position={[(rand(`mx${i}`) - 0.5) * R * 2, H - ph * H, (rand(`mz${i}`) - 0.5) * R * 2]} scale={0.03 + rand(`ms${i}`) * 0.03}>
          <icosahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color="#a8c0d0" transparent opacity={0.55} depthWrite={false} />
        </mesh>
      );
    })}
  </group>
);

/** "Estalactites" de ferrugem penduradas na borda do casco. */
export const Rusticles: React.FC<{ x0: number; x1: number; y: number; z: number; n?: number }> = ({ x0, x1, y, z, n = 26 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const h = 0.06 + rand(`rt${i}`) * 0.16;
      return (
        <mesh key={i} position={[x0 + (i / (n - 1)) * (x1 - x0), y - h / 2, z]} rotation={[Math.PI, 0, 0]}>
          <coneGeometry args={[0.025, h, 5]} />
          <meshStandardMaterial color="#8a4a24" roughness={0.9} flatShading />
        </mesh>
      );
    })}
  </group>
);

/** Submersível de pesquisa (genérico): casco branco, faixa laranja, vigia, braços, faróis com feixes. 1 u = 1 m. */
export const Submersible: React.FC<{ f: number; beams?: number }> = ({ f, beams = 1 }) => (
  <group>
    <mesh scale={[3.2, 1.4, 1.5]} castShadow>
      <sphereGeometry args={[1, 24, 16]} />
      <meshStandardMaterial color="#f0ede4" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0.2, 0]} scale={[3.25, 0.2, 1.55]}>
      <sphereGeometry args={[1, 24, 8]} />
      <meshStandardMaterial color="#e0702a" roughness={0.5} />
    </mesh>
    <Box p={[0, 1.55, 0]} s={[1.6, 0.5, 0.5]} c="#e0702a" />
    {/* vigia frontal */}
    <mesh position={[3.0, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
      <ringGeometry args={[0.32, 0.42, 20]} />
      <meshStandardMaterial color="#3a3a42" metalness={0.5} side={DoubleSide} />
    </mesh>
    <mesh position={[2.98, -0.2, 0]} rotation={[0, Math.PI / 2, 0]}>
      <circleGeometry args={[0.32, 20]} />
      <meshStandardMaterial color="#9fd0e8" transparent opacity={0.45} depthWrite={false} />
    </mesh>
    {/* hélices e braço */}
    <mesh position={[-3.3, 0, 0]} rotation={[f * 0.4, 0, Math.PI / 2]}><boxGeometry args={[0.08, 0.1, 1.2]} /><meshStandardMaterial color="#3a3a42" /></mesh>
    <Rod a={[2.4, -0.9, 0.6]} b={[3.6, -1.3, 0.8]} r={0.07} c="#5a5a62" />
    {/* faróis + feixes */}
    {[0.7, -0.7].map((z) => (
      <group key={z} position={[3.0, 0.5, z]}>
        <mesh><sphereGeometry args={[0.12, 8, 6]} /><meshBasicMaterial color="#fffbea" toneMapped={false} /></mesh>
        {beams > 0.01 ? (
          <mesh position={[3.2, -0.9, 0]} rotation={[0, 0, Math.PI / 2 + 0.28]}>
            <coneGeometry args={[1.4, 6.6, 20, 1, true]} />
            <meshBasicMaterial color="#cfe8ff" transparent opacity={0.07 * beams} depthWrite={false} side={DoubleSide} />
          </mesh>
        ) : null}
        <spotLight position={[0, 0, 0]} intensity={6 * beams} distance={20} angle={0.5} penumbra={0.6} color="#e8f4ff" target-position={[8, -3, 0]} />
      </group>
    ))}
  </group>
);
