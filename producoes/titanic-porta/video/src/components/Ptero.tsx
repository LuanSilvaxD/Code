import { useMemo } from "react";
import { BufferAttribute, BufferGeometry, CatmullRomCurve3, Color, DoubleSide, ExtrudeGeometry, Quaternion, Shape, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "Pterodáctilo no México?" — elementos novos. Modelados em METROS (1 u = 1 m), cabeça para +x.
// Regra do render contínuo: o que faz fade usa transparent SEMPRE true (só a opacidade anima).
const M = { roughness: 0.8, metalness: 0, flatShading: true } as const;
const C = (h: string) => new Color(h);

/** Material normal ou silhueta preta (sil 0..1 mistura para preto puro). */
const Mat: React.FC<{ c: string; sil?: number; side?: boolean; e?: string; ei?: number }> = ({ c, sil = 0, side, e, ei }) =>
  sil > 0.5 ? (
    <meshBasicMaterial color="#07060c" side={side ? DoubleSide : undefined} />
  ) : (
    <meshStandardMaterial color={C(c).lerp(C("#07060c"), sil * 2)} {...M} side={side ? DoubleSide : undefined} emissive={e} emissiveIntensity={ei} />
  );

/** Cilindro entre dois pontos. */
const Bone: React.FC<{ a: Vec3; b: Vec3; r: number; r2?: number; c: string; sil?: number; seg?: number }> = ({ a, b, r, r2, c, sil, seg = 6 }) => {
  const va = new Vector3(...a), vb = new Vector3(...b);
  const mid = va.clone().add(vb).multiplyScalar(0.5);
  const dir = vb.clone().sub(va);
  const len = dir.length();
  const quat = new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid.toArray() as Vec3} quaternion={quat} castShadow>
      <cylinderGeometry args={[r2 ?? r, r, len, seg]} />
      <Mat c={c} sil={sil} />
    </mesh>
  );
};

/** Membrana: leque de triângulos a partir de um centro, com cor mais escura perto do corpo. */
const useMembrane = (pts: Vec3[], center: Vec3, inner: string, outer: string) =>
  useMemo(() => {
    const g = new BufferGeometry();
    const pos: number[] = [], col: number[] = [];
    const ci = C(inner), co = C(outer);
    const maxD = Math.max(...pts.map((p) => Math.hypot(p[0] - center[0], p[2] - center[2])));
    const push = (p: Vec3) => {
      pos.push(...p);
      const t = clamp(Math.abs(p[2]) / 5.4, 0, 1);
      const c = ci.clone().lerp(co, t);
      col.push(c.r, c.g, c.b);
    };
    for (let i = 0; i < pts.length; i++) {
      push(center);
      push(pts[i]);
      push(pts[(i + 1) % pts.length]);
    }
    void maxD;
    g.setAttribute("position", new BufferAttribute(new Float32Array(pos), 3));
    g.setAttribute("color", new BufferAttribute(new Float32Array(col), 3));
    g.computeVertexNormals();
    return g;
  }, [pts, center, inner, outer]);

/* ------------------------------------------------------------------ QUETZALCOATLUS (voando, ~11 m de asa) */

const WING = (s: number) => {
  const S: Vec3 = [0.25, 0.16, 0.22 * s];
  const E: Vec3 = [0.05, 0.2, 1.05 * s];
  const W: Vec3 = [0.5, 0.18, 2.15 * s];
  const T: Vec3 = [-0.75, 0.1, 5.4 * s];
  const M0: Vec3 = [-1.05, 0.09, 4.85 * s];
  const M1: Vec3 = [-1.2, 0.08, 4.0 * s];
  const M2: Vec3 = [-1.25, 0.04, 2.6 * s];
  const M3: Vec3 = [-1.2, 0.0, 1.3 * s];
  const A: Vec3 = [-1.35, -0.12, 0.42 * s];
  const H: Vec3 = [-0.4, -0.04, 0.18 * s];
  const P: Vec3 = [0.55, 0.17, 1.0 * s]; // borda do propatágio
  return { S, E, W, T, M0, M1, M2, M3, A, H, P };
};

/** Quetzalcoatlus northropi voando. flap 0..1 = intensidade da batida; sil 0..1 = silhueta preta (vídeo da câmera). */
export const Quetzalcoatlus: React.FC<{ f: number; flap?: number; sil?: number; glide?: number }> = ({ f, flap = 0.5, sil = 0, glide = 0 }) => {
  const a = clamp(flap, 0, 1) * 0.42 * Math.sin(f * 0.22) + 0.06 * (1 - glide);
  const wings = useMemo(() => [1, -1].map((s) => {
    const w = WING(s);
    return { s, w, main: [w.S, w.E, w.W, w.T, w.M0, w.M1, w.M2, w.M3, w.A, w.H] as Vec3[], front: [w.S, w.P, w.W, w.E] as Vec3[] };
  }), []);
  const neck = useMemo(() => new CatmullRomCurve3([new Vector3(0.42, 0.12, 0), new Vector3(1.2, 0.32, 0), new Vector3(2.1, 0.42, 0), new Vector3(2.7, 0.4, 0)]), []);
  const body = "#e6dfd2", back = "#7d6e60", membIn = "#6e3a2a", membOut = "#c8713e", bone = "#d8ccb4";
  return (
    <group>
      {/* tronco */}
      <mesh scale={[0.72, 0.34, 0.34]} castShadow>
        <icosahedronGeometry args={[1, 2]} />
        <Mat c={body} sil={sil} />
      </mesh>
      <mesh position={[0, 0.13, 0]} scale={[0.5, 0.18, 0.22]}>
        <icosahedronGeometry args={[1, 1]} />
        <Mat c={back} sil={sil} />
      </mesh>
      {/* pescoço longo e rígido */}
      <mesh castShadow>
        <tubeGeometry args={[neck, 16, 0.12, 7, false]} />
        <Mat c={body} sil={sil} />
      </mesh>
      {/* cabeça: crânio + bico enorme + crista */}
      <group position={[2.85, 0.42, 0]} rotation={[0, 0, -0.12 + 0.04 * Math.sin(f / 23)]}>
        <mesh scale={[0.42, 0.2, 0.14]} castShadow>
          <icosahedronGeometry args={[1, 1]} />
          <Mat c={body} sil={sil} />
        </mesh>
        <mesh position={[1.25, 0.02, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.62]} castShadow>
          <coneGeometry args={[0.15, 2.1, 5]} />
          <Mat c="#d9c79a" sil={sil} />
        </mesh>
        <mesh position={[1.05, -0.08, 0]} rotation={[0, 0, -Math.PI / 2 - 0.04]} scale={[1, 1, 0.55]}>
          <coneGeometry args={[0.1, 1.7, 5]} />
          <Mat c="#bfae84" sil={sil} />
        </mesh>
        <mesh position={[-0.1, 0.32, 0]} rotation={[0, 0, 0.5]} scale={[0.32, 0.38, 0.04]}>
          <tetrahedronGeometry args={[1, 0]} />
          <Mat c="#c8402e" sil={sil} />
        </mesh>
        {sil < 0.5 ? (
          <mesh position={[0.18, 0.06, 0.12]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial color="#120c08" roughness={0.3} />
          </mesh>
        ) : null}
        {sil < 0.5 ? (
          <mesh position={[0.18, 0.06, -0.12]}>
            <sphereGeometry args={[0.035, 8, 6]} />
            <meshStandardMaterial color="#120c08" roughness={0.3} />
          </mesh>
        ) : null}
      </group>
      {/* asas */}
      {wings.map(({ s, w, main, front }) => (
        <group key={s} position={[0.25, 0.16, 0.22 * s]} rotation={[a * s, 0, 0]}>
          <group position={[-0.25, -0.16, -0.22 * s]}>
            <Membrane pts={main} center={[-0.35, 0.08, 1.9 * s]} sil={sil} inner={membIn} outer={membOut} />
            <Membrane pts={front} center={[0.35, 0.17, 1.3 * s]} sil={sil} inner={membIn} outer={membOut} />
            <Bone a={w.S} b={w.E} r={0.07} c={bone} sil={sil} />
            <Bone a={w.E} b={w.W} r={0.06} r2={0.05} c={bone} sil={sil} />
            <Bone a={w.W} b={w.T} r={0.05} r2={0.015} c={bone} sil={sil} />
            {/* "nervuras" da membrana (actinofibrilas) */}
            {sil < 0.5
              ? [[0.62, w.M0], [0.42, w.M1], [0.22, w.M2]].map(([u, m], i) => {
                  const k = u as number, mm = m as Vec3;
                  const from: Vec3 = [w.W[0] + (w.T[0] - w.W[0]) * k, w.W[1] + (w.T[1] - w.W[1]) * k + 0.01, w.W[2] + (w.T[2] - w.W[2]) * k];
                  return <Bone key={`v${i}`} a={from} b={[mm[0] * 0.92, mm[1] + 0.01, mm[2] * 0.97]} r={0.012} c="#5a2a1c" seg={4} />;
                })
              : null}
            {/* dedinhos com garras no pulso */}
            {[0, 1, 2].map((i) => (
              <Bone key={i} a={w.W} b={[w.W[0] + 0.22, w.W[1] + 0.02 - i * 0.04, w.W[2] + (0.05 - i * 0.05) * s]} r={0.015} r2={0.006} c="#3a3028" sil={sil} />
            ))}
          </group>
        </group>
      ))}
      {/* pernas esticadas para trás */}
      {[1, -1].map((s) => {
        const w = WING(s);
        return (
          <group key={`l${s}`}>
            <Bone a={w.H} b={[-0.9, -0.12, 0.3 * s]} r={0.07} r2={0.05} c={body} sil={sil} />
            <Bone a={[-0.9, -0.12, 0.3 * s]} b={w.A} r={0.045} r2={0.035} c={body} sil={sil} />
            <Bone a={w.A} b={[w.A[0] - 0.22, w.A[1] - 0.02, w.A[2]]} r={0.03} r2={0.01} c="#3a3028" sil={sil} />
          </group>
        );
      })}
      {/* cauda curtinha */}
      <Bone a={[-0.5, 0.0, 0]} b={[-0.85, 0.02, 0]} r={0.05} r2={0.01} c={body} sil={sil} />
    </group>
  );
};

const Membrane: React.FC<{ pts: Vec3[]; center: Vec3; sil: number; inner: string; outer: string }> = ({ pts, center, sil, inner, outer }) => {
  const g = useMembrane(pts, center, inner, outer);
  return (
    <mesh geometry={g} castShadow receiveShadow>
      {sil > 0.5 ? <meshBasicMaterial color="#07060c" side={DoubleSide} /> : <meshStandardMaterial vertexColors side={DoubleSide} {...M} roughness={0.9} />}
    </mesh>
  );
};

/* ------------------------------------------------------------------ AVE GRANDE (garça voando: pescoço dobrado, pernas para trás) */

/** Ave grande voando (~1,8 m de asa). Pescoço recolhido em "S" e pernas esticadas para trás = silhueta "pré-histórica". */
export const HeronFly: React.FC<{ f: number; flap?: number; sil?: number }> = ({ f, flap = 1, sil = 0 }) => {
  const a = clamp(flap, 0, 1) * 0.55 * Math.sin(f * 0.3);
  const plume = "#7d8ea3", dark = "#4a5568", light = "#cfd6de";
  const wingPts = (s: number): Vec3[] => [
    [0.12, 0.05, 0.08 * s], [0.18, 0.06, 0.45 * s], [0.05, 0.05, 0.75 * s], [-0.05, 0.04, 0.92 * s],
    [-0.16, 0.03, 0.85 * s], [-0.2, 0.03, 0.7 * s], [-0.26, 0.03, 0.55 * s], [-0.25, 0.03, 0.38 * s], [-0.22, 0.03, 0.2 * s], [-0.12, 0.03, 0.08 * s],
  ];
  return (
    <group>
      <mesh scale={[0.32, 0.12, 0.11]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <Mat c={plume} sil={sil} />
      </mesh>
      {/* pescoço em S recolhido */}
      <Bone a={[0.2, 0.04, 0]} b={[0.3, 0.14, 0]} r={0.05} c={light} sil={sil} />
      <Bone a={[0.3, 0.14, 0]} b={[0.38, 0.08, 0]} r={0.045} c={light} sil={sil} />
      <mesh position={[0.42, 0.09, 0]} scale={[0.07, 0.05, 0.045]}>
        <icosahedronGeometry args={[1, 1]} />
        <Mat c={light} sil={sil} />
      </mesh>
      <mesh position={[0.58, 0.08, 0]} rotation={[0, 0, -Math.PI / 2]} scale={[1, 1, 0.7]}>
        <coneGeometry args={[0.022, 0.24, 5]} />
        <Mat c="#e0b040" sil={sil} />
      </mesh>
      {/* pernas longas para trás */}
      {[1, -1].map((s) => (
        <group key={s}>
          <Bone a={[-0.22, -0.04, 0.03 * s]} b={[-0.75, -0.06, 0.04 * s]} r={0.012} c="#5a4a3a" sil={sil} />
        </group>
      ))}
      {/* asas largas com pontas "dedilhadas" */}
      {[1, -1].map((s) => (
        <group key={`w${s}`} position={[0, 0.05, 0.08 * s]} rotation={[a * s, 0, 0]}>
          <group position={[0, -0.05, -0.08 * s]}>
            <Membrane pts={wingPts(s)} center={[-0.05, 0.04, 0.4 * s]} sil={sil} inner={dark} outer={plume} />
          </group>
        </group>
      ))}
      <mesh position={[-0.33, 0.02, 0]} scale={[0.1, 0.02, 0.07]}>
        <icosahedronGeometry args={[1, 0]} />
        <Mat c={dark} sil={sil} />
      </mesh>
    </group>
  );
};

/* ------------------------------------------------------------------ GIRAFA (régua de ~5 m) */

export const Giraffe: React.FC<{ f: number }> = ({ f }) => {
  const sk = "#e2b45a", sp = "#9a5a28";
  return (
    <group>
      {/* pernas */}
      {[[0.55, 0.28], [0.55, -0.28], [-0.55, 0.28], [-0.55, -0.28]].map(([x, z], i) => (
        <Bone key={i} a={[x, 0, z]} b={[x * 0.9, 1.8, z * 0.8]} r={0.07} r2={0.09} c={sk} />
      ))}
      <mesh position={[0, 2.05, 0]} scale={[0.85, 0.42, 0.4]} castShadow>
        <icosahedronGeometry args={[1, 1]} />
        <Mat c={sk} />
      </mesh>
      {/* pescoço */}
      <Bone a={[0.55, 2.1, 0]} b={[1.05, 4.4, 0]} r={0.2} r2={0.12} c={sk} seg={7} />
      <group position={[1.12, 4.55, 0]} rotation={[0, 0, -0.15 + 0.05 * Math.sin(f / 30)]}>
        <mesh scale={[0.38, 0.17, 0.16]} castShadow>
          <icosahedronGeometry args={[1, 1]} />
          <Mat c={sk} />
        </mesh>
        <Bone a={[-0.12, 0.12, 0.06]} b={[-0.14, 0.32, 0.06]} r={0.025} c={sp} />
        <Bone a={[-0.12, 0.12, -0.06]} b={[-0.14, 0.32, -0.06]} r={0.025} c={sp} />
      </group>
      {/* manchas */}
      {Array.from({ length: 12 }, (_, i) => (
        <mesh key={i} position={[(rand(`gx${i}`) - 0.5) * 1.3, 1.9 + rand(`gy${i}`) * 0.4, 0.38 * (i % 2 ? 1 : -1)]} rotation={[0, 0, rand(`gr${i}`) * 3]} scale={[0.14, 0.12, 0.02]}>
          <icosahedronGeometry args={[1, 0]} />
          <Mat c={sp} />
        </mesh>
      ))}
      <Bone a={[-0.8, 2.1, 0]} b={[-1.0, 1.4, 0]} r={0.03} c={sk} />
    </group>
  );
};

/* ------------------------------------------------------------------ CIUDAD JUÁREZ À NOITE */

const HOUSE_COLORS = ["#d9a37a", "#9fb9c9", "#e2c46a", "#c97a6a", "#a7c49a", "#d8cfc0", "#b59ad0"];

/** Bairro low-poly de Juárez à noite: casas de laje, muros, postes acesos, câmera de segurança, serra ao fundo e lua. */
export const JuarezNight: React.FC<{ f: number; moon?: number; lights?: number }> = ({ f, moon = 1, lights = 1 }) => {
  const houses = useMemo(() => Array.from({ length: 14 }, (_, i) => {
    const row = i < 7 ? 0 : 1;
    const x = -4.2 + (i % 7) * 1.4 + (rand(`hx${i}`) - 0.5) * 0.3;
    return { x, z: row ? -1.6 : 0.4, w: 1.0 + rand(`hw${i}`) * 0.3, h: 0.6 + rand(`hh${i}`) * 0.45, d: 0.9, c: HOUSE_COLORS[i % HOUSE_COLORS.length], win: rand(`hl${i}`) > 0.45 };
  }), []);
  return (
    <group>
      {/* chão de terra e rua */}
      <mesh position={[0, -0.06, -0.6]} receiveShadow>
        <boxGeometry args={[11, 0.12, 6]} />
        <meshStandardMaterial color="#5a4a3a" {...M} />
      </mesh>
      <mesh position={[0, 0.005, -0.6]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[11, 0.9]} />
        <meshStandardMaterial color="#2e2a2e" roughness={1} />
      </mesh>
      {houses.map((h, i) => (
        <group key={i} position={[h.x, 0, h.z]}>
          <mesh position={[0, h.h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[h.w, h.h, h.d]} />
            <meshStandardMaterial color={h.c} {...M} />
          </mesh>
          <mesh position={[0, h.h + 0.03, 0]}>
            <boxGeometry args={[h.w + 0.06, 0.06, h.d + 0.06]} />
            <meshStandardMaterial color="#e8e0d0" {...M} />
          </mesh>
          {/* caixa d'água */}
          {i % 3 === 0 ? (
            <mesh position={[h.w * 0.25, h.h + 0.16, 0]}>
              <cylinderGeometry args={[0.1, 0.1, 0.2, 8]} />
              <meshStandardMaterial color="#2a2a30" {...M} />
            </mesh>
          ) : null}
          {/* janela acesa / porta */}
          <mesh position={[-h.w * 0.22, h.h * 0.55, h.d / 2 * (h.z > 0 ? -1 : 1) + 0.005 * (h.z > 0 ? -1 : 1)]} rotation={[0, h.z > 0 ? Math.PI : 0, 0]}>
            <planeGeometry args={[0.22, 0.18]} />
            <meshStandardMaterial color={h.win ? "#ffd27a" : "#2a2a38"} emissive={h.win ? "#ffb040" : "#000000"} emissiveIntensity={h.win ? 1.2 * lights : 0} />
          </mesh>
          <mesh position={[h.w * 0.2, 0.2, h.d / 2 * (h.z > 0 ? -1 : 1) + 0.005 * (h.z > 0 ? -1 : 1)]} rotation={[0, h.z > 0 ? Math.PI : 0, 0]}>
            <planeGeometry args={[0.2, 0.4]} />
            <meshStandardMaterial color="#4a3426" />
          </mesh>
        </group>
      ))}
      {/* postes com luz amarela */}
      {[-3.5, -0.7, 2.1, 4.6].map((x, i) => (
        <group key={`p${i}`} position={[x, 0, -0.15]}>
          <mesh position={[0, 0.6, 0]}>
            <cylinderGeometry args={[0.02, 0.025, 1.2, 6]} />
            <meshStandardMaterial color="#3a3a42" />
          </mesh>
          <mesh position={[0.1, 1.2, 0]}>
            <boxGeometry args={[0.22, 0.04, 0.06]} />
            <meshStandardMaterial color="#3a3a42" />
          </mesh>
          <mesh position={[0.18, 1.17, 0]}>
            <sphereGeometry args={[0.045, 8, 6]} />
            <meshBasicMaterial color="#ffd27a" toneMapped={false} />
          </mesh>
          <pointLight position={[0.18, 1.1, 0]} intensity={0.9 * lights} distance={2.4} color="#ffb860" />
        </group>
      ))}
      {/* câmera de segurança na quina de uma casa (a que "filmou") */}
      <group position={[houses[2].x + houses[2].w / 2, houses[2].h - 0.05, houses[2].z + 0.45]} rotation={[0, -0.6, 0.5]}>
        <mesh position={[0.08, 0, 0]}>
          <boxGeometry args={[0.18, 0.07, 0.07]} />
          <meshStandardMaterial color="#e8e8ee" {...M} />
        </mesh>
        <mesh position={[0.18, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.02, 10]} />
          <meshStandardMaterial color="#101018" />
        </mesh>
        <mesh position={[0.03, 0.045, 0.03]}>
          <sphereGeometry args={[0.01, 6, 4]} />
          <meshBasicMaterial color={Math.floor(f / 15) % 2 ? "#ff3030" : "#601010"} toneMapped={false} />
        </mesh>
      </group>
      {/* serra ao fundo */}
      {Array.from({ length: 9 }, (_, i) => (
        <mesh key={`m${i}`} position={[-6 + i * 1.5, 0.6 + rand(`mh${i}`) * 0.6, -4.2 - rand(`mz${i}`) * 0.8]} scale={[1.4, 1.2 + rand(`ms${i}`) * 1.2, 1]}>
          <coneGeometry args={[1, 1.4, 5]} />
          <meshStandardMaterial color="#2a2438" {...M} />
        </mesh>
      ))}
      {/* lua grande */}
      {moon > 0.01 ? (
        <group position={[1.6, 4.4, -8]}>
          <mesh>
            <circleGeometry args={[1.5, 40]} />
            <meshBasicMaterial color="#f4ecd8" toneMapped={false} transparent opacity={clamp(moon, 0, 1)} />
          </mesh>
          {[[0.4, 0.3, 0.25], [-0.5, -0.2, 0.35], [0.2, -0.6, 0.18]].map(([x, y, r], i) => (
            <mesh key={i} position={[x, y, 0.01]}>
              <circleGeometry args={[r, 16]} />
              <meshBasicMaterial color="#ddd2b8" transparent opacity={clamp(moon, 0, 1)} />
            </mesh>
          ))}
          <mesh position={[0, 0, -0.02]}>
            <circleGeometry args={[2.2, 40]} />
            <meshBasicMaterial color="#5a5478" transparent opacity={0.35 * clamp(moon, 0, 1)} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/* ------------------------------------------------------------------ MAPA DA FRONTEIRA (México + sul dos EUA) */

const MEX: [number, number][] = [
  [-117.1, 32.5], [-114.8, 32.5], [-111, 31.33], [-108.2, 31.33], [-106.5, 31.78], [-104.9, 30.6], [-104.4, 29.6], [-103.3, 28.98], [-102.4, 29.8], [-101.0, 29.6], [-100.3, 28.3], [-99.5, 27.5], [-99.1, 26.4], [-97.15, 25.95],
  [-97.6, 24.5], [-97.7, 22.5], [-97.2, 20.7], [-96.1, 19.2], [-94.8, 18.5], [-92.5, 18.6], [-91.5, 18.5], [-90.7, 19.6], [-90.4, 21.0], [-89.0, 21.4], [-87.1, 21.5], [-86.8, 20.8], [-87.4, 19.6], [-88.2, 18.5],
  [-89.1, 17.9], [-91.4, 17.25], [-90.5, 16.1], [-92.2, 14.6], [-93.9, 15.9], [-96.5, 15.7], [-98.6, 16.4], [-101.5, 17.6], [-103.5, 18.3], [-105.5, 20.4], [-105.2, 21.5], [-105.7, 22.5], [-107.5, 24.6],
  [-109.4, 26.0], [-110.6, 27.9], [-112.2, 29.3], [-113.0, 31.2], [-114.6, 31.6], [-113.1, 29.0], [-112.0, 27.6], [-110.3, 24.2], [-109.4, 23.2], [-110.3, 23.5], [-112.1, 24.8], [-114.2, 27.6], [-115.0, 29.5], [-116.6, 31.6],
];
const USA: [number, number][] = [
  [-117.1, 32.5], [-114.8, 32.5], [-111, 31.33], [-108.2, 31.33], [-106.5, 31.78], [-104.9, 30.6], [-104.4, 29.6], [-103.3, 28.98], [-102.4, 29.8], [-101.0, 29.6], [-100.3, 28.3], [-99.5, 27.5], [-99.1, 26.4], [-97.15, 25.95],
  [-97.4, 27.8], [-95.0, 29.3], [-93.8, 29.7], [-90.0, 29.1], [-89.2, 30.3], [-87.5, 30.4], [-85.0, 29.7], [-84.0, 30.0], [-83.5, 36.5], [-118.5, 36.5], [-118.5, 34.0],
];
const K = 0.28;
/** Longitude/latitude → ponto no mapa (u3d), centrado em ~(−100, 25). */
export const ll = (lon: number, lat: number, y = 0): Vec3 => [(lon + 100) * K, y, -(lat - 25) * K];
const useLand = (poly: [number, number][], h: number) =>
  useMemo(() => {
    const sh = new Shape();
    poly.forEach(([lon, lat], i) => {
      const x = (lon + 100) * K, y = (lat - 25) * K;
      if (i === 0) sh.moveTo(x, y);
      else sh.lineTo(x, y);
    });
    const g = new ExtrudeGeometry(sh, { depth: h, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    return g;
  }, [poly, h]);

export const PLACES = {
  juarez: ll(-106.45, 31.7),
  bigbend: ll(-103.25, 29.25),
  chicxulub: ll(-89.5, 21.3),
} as const;

/** Mapa low-poly: México (destacado), sul dos EUA (cinza), mar. crater 0..1 = cratera de Chicxulub. */
export const BorderMap: React.FC<{ f: number; crater?: number; line?: number }> = ({ f, crater = 0, line = 0 }) => {
  const mex = useLand(MEX, 0.22);
  const usa = useLand(USA, 0.16);
  const j = PLACES.juarez, b = PLACES.bigbend;
  return (
    <group>
      <mesh position={[0, -0.05, -1]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[16, 13]} />
        <meshStandardMaterial color="#1e4f7e" roughness={0.4} emissive="#0a2440" emissiveIntensity={0.2 + 0.03 * Math.sin(f / 25)} />
      </mesh>
      <mesh geometry={usa} receiveShadow castShadow>
        <meshStandardMaterial color="#8a8f9c" {...M} />
      </mesh>
      <mesh geometry={mex} receiveShadow castShadow>
        <meshStandardMaterial color="#5f9a52" {...M} />
      </mesh>
      {/* linha da fronteira (rio Bravo) */}
      {MEX.slice(0, 14).map(([lon, lat], i) => {
        if (i === 13) return null;
        const p = ll(lon, lat, 0.23), q = ll(MEX[i + 1][0], MEX[i + 1][1], 0.23);
        return <Bone key={i} a={p} b={q} r={0.025} c="#f0d070" />;
      })}
      {/* linha Juárez → Big Bend */}
      {line > 0.01 ? (
        <Bone a={[j[0], 0.3, j[2]]} b={[j[0] + (b[0] - j[0]) * clamp(line, 0, 1), 0.3, j[2] + (b[2] - j[2]) * clamp(line, 0, 1)]} r={0.03} c="#ffffff" />
      ) : null}
      {/* cratera de Chicxulub (metade em terra, metade no mar) */}
      {crater > 0.01 ? (
        <group position={[PLACES.chicxulub[0], 0.235, PLACES.chicxulub[2]]} scale={clamp(crater, 0, 1)}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.32, 0.46, 28]} />
            <meshStandardMaterial color="#8a5a3a" {...M} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <circleGeometry args={[0.32, 28]} />
            <meshStandardMaterial color="#3a2a22" {...M} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** Pino de mapa (gota) com cor. */
export const MapPin: React.FC<{ p: Vec3; c?: string; s?: number }> = ({ p, c = "#ff4a3d", s = 1 }) =>
  s < 0.01 ? null : (
    <group position={[p[0], p[1] + 0.25, p[2]]} scale={s}>
      <mesh position={[0, 0.32, 0]}>
        <sphereGeometry args={[0.12, 14, 10]} />
        <meshStandardMaterial color={c} roughness={0.4} emissive={c} emissiveIntensity={0.25} />
      </mesh>
      <mesh position={[0, 0.14, 0]} rotation={[Math.PI, 0, 0]}>
        <coneGeometry args={[0.09, 0.3, 12]} />
        <meshStandardMaterial color={c} roughness={0.4} />
      </mesh>
    </group>
  );

/** Asteroide caindo de `from` até `to` (t 0..1) com rastro de fogo. */
export const Asteroid: React.FC<{ from: Vec3; to: Vec3; t: number; f: number; r?: number }> = ({ from, to, t, f, r = 0.35 }) => {
  if (t <= 0.001 || t >= 1) return null;
  const p: Vec3 = [from[0] + (to[0] - from[0]) * t, from[1] + (to[1] - from[1]) * t, from[2] + (to[2] - from[2]) * t];
  const dir = [from[0] - to[0], from[1] - to[1], from[2] - to[2]];
  const dl = Math.hypot(dir[0], dir[1], dir[2]);
  return (
    <group>
      <mesh position={p} rotation={[f * 0.1, f * 0.07, 0]} castShadow>
        <dodecahedronGeometry args={[r, 0]} />
        <meshStandardMaterial color="#5a4a40" {...M} emissive="#ff5a10" emissiveIntensity={0.35} />
      </mesh>
      {Array.from({ length: 12 }, (_, i) => {
        const u = (i + 1) * 0.18;
        return (
          <mesh key={i} position={[p[0] + (dir[0] / dl) * u, p[1] + (dir[1] / dl) * u, p[2] + (dir[2] / dl) * u]} scale={r * (1.1 - i * 0.07)}>
            <icosahedronGeometry args={[1, 0]} />
            <meshBasicMaterial color={C("#fff2a0").lerp(C("#ff4a10"), i / 11)} transparent opacity={0.85 - i * 0.065} toneMapped={false} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

/** Onda de choque (anel que cresce e some) + clarão. k 0..1. */
export const Shockwave: React.FC<{ p: Vec3; k: number; R?: number }> = ({ p, k, R = 3.5 }) =>
  k <= 0.001 || k >= 1 ? null : (
    <group position={p}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.3, 0]}>
        <ringGeometry args={[R * k * 0.9, R * k, 48]} />
        <meshBasicMaterial color="#ffd27a" transparent opacity={0.9 * (1 - k)} toneMapped={false} depthWrite={false} side={DoubleSide} />
      </mesh>
      <mesh position={[0, 0.4, 0]} scale={0.3 + k * 1.4}>
        <icosahedronGeometry args={[1, 1]} />
        <meshBasicMaterial color="#ffb040" transparent opacity={0.8 * (1 - k) ** 2} toneMapped={false} depthWrite={false} />
      </mesh>
    </group>
  );

/** Árvore da família (esquemática): tronco "arcossauros" que se divide em dois galhos. grow 0..1. */
export const FamilyTree: React.FC<{ grow?: number }> = ({ grow = 1 }) => {
  const g = clamp(grow, 0, 1);
  const trunk = clamp(g * 2, 0, 1), br = clamp(g * 2 - 1, 0, 1);
  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow>
        <cylinderGeometry args={[3.4, 3.6, 0.1, 32]} />
        <meshStandardMaterial color="#2a2238" {...M} />
      </mesh>
      {trunk > 0.01 ? <Bone a={[0, 0, 0]} b={[0, 1.6 * trunk, 0]} r={0.14} r2={0.1} c="#c4b5fd" /> : null}
      {br > 0.01 ? (
        <>
          <Bone a={[0, 1.6, 0]} b={[-2.0 * br, 1.6 + 1.3 * br, 0]} r={0.1} r2={0.07} c="#8fd0a0" />
          <Bone a={[0, 1.6, 0]} b={[2.0 * br, 1.6 + 1.3 * br, 0]} r={0.1} r2={0.07} c="#ffb27a" />
        </>
      ) : null}
    </group>
  );
};
