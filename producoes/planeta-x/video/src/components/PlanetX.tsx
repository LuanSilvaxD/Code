import { useMemo } from "react";
import { AdditiveBlending, BufferAttribute, Color, DoubleSide, IcosahedronGeometry, Vector3 } from "three";
import { clamp, rand, type Vec3 } from "../utils/animation";

// "Existe um Planeta X?" — elementos novos (aprovar na folha). u3d esquemáticos.
const C = (h: string) => new Color(h);
const M = { roughness: 0.85, metalness: 0, flatShading: true } as const;

/* ------------------------------------------------------------------ OBSERVATÓRIO v2 (estilo Rubin, genérico) */

/** Topo de montanha com rochas; prédio de apoio de vários andares com janelas (acendem à noite); cúpula grande
 *  com base cilíndrica + teto facetado, fenda com persianas abertas e o telescópio (treliça + espelho) apontando;
 *  tela de calibração, antena e estrada. night 0..1 acende janelas e luzes; scan 0..1 move o telescópio. */
export const ObservatoryV2: React.FC<{ f: number; night?: number; scan?: number; open?: number }> = ({ f, night = 0, scan = 0, open = 1 }) => {
  const rocks = useMemo(() => Array.from({ length: 26 }, (_, i) => {
    const a = rand(`or${i}`) * Math.PI * 2;
    const r = 2.6 + rand(`orr${i}`) * 2.6;
    return { p: [Math.cos(a) * r, -0.15 - (r - 2.6) * 0.35, Math.sin(a) * r] as Vec3, s: 0.12 + rand(`os${i}`) * 0.3 };
  }), []);
  const winOn = clamp(night, 0, 1);
  const win = new Color("#2a3448").lerp(new Color("#ffd98a"), winOn);
  const az = -0.5 + scan * 1.6 + Math.sin(f / 120) * 0.05;
  const o = clamp(open, 0, 1);
  return (
    <group>
      {/* cume da montanha (terraplanado) + encostas */}
      <mesh position={[0, -2.2, 0]} receiveShadow>
        <coneGeometry args={[7.5, 4.3, 12, 3]} />
        <meshStandardMaterial color="#6e6052" {...M} />
      </mesh>
      <mesh position={[0, -0.06, 0]} receiveShadow>
        <cylinderGeometry args={[2.7, 3.0, 0.14, 14]} />
        <meshStandardMaterial color="#8a7c6a" {...M} />
      </mesh>
      {rocks.map((r, i) => (
        <mesh key={i} position={r.p} scale={[r.s * 1.3, r.s * 0.7, r.s]} castShadow>
          <icosahedronGeometry args={[1, 0]} />
          <meshStandardMaterial color={i % 3 ? "#7a6e60" : "#5e544a"} {...M} />
        </mesh>
      ))}
      {/* estrada em curva */}
      {Array.from({ length: 10 }, (_, i) => {
        const t = i / 9;
        const a = -0.6 + t * 1.8;
        const r = 2.4 + t * 2.2;
        return (
          <mesh key={`rd${i}`} position={[Math.cos(a) * r, 0.0 - t * 1.0, Math.sin(a) * r + 0.6]} rotation={[0, -a, -0.15]}>
            <boxGeometry args={[0.6, 0.03, 0.45]} />
            <meshStandardMaterial color="#4a4640" roughness={1} />
          </mesh>
        );
      })}
      {/* prédio de apoio: bloco de 3 andares + anexo, com faixas de janelas */}
      <group position={[-1.25, 0, 0.35]}>
        <mesh position={[0, 0.55, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.6, 1.1, 1.0]} />
          <meshStandardMaterial color="#e6e6e2" roughness={0.6} />
        </mesh>
        <mesh position={[0.55, 0.22, 0.55]} castShadow>
          <boxGeometry args={[0.9, 0.44, 0.35]} />
          <meshStandardMaterial color="#d4d4d0" roughness={0.6} />
        </mesh>
        {[0.32, 0.62, 0.92].map((y, k) =>
          Array.from({ length: 6 }, (_, j) => (
            <mesh key={`w${k}${j}`} position={[-0.62 + j * 0.25, y, 0.505]}>
              <boxGeometry args={[0.16, 0.12, 0.01]} />
              <meshStandardMaterial color={win} emissive={win} emissiveIntensity={winOn * 0.8} roughness={0.3} />
            </mesh>
          )),
        )}
        {/* faixa escura do telhado + antena parabólica */}
        <mesh position={[0, 1.12, 0]}>
          <boxGeometry args={[1.62, 0.05, 1.02]} />
          <meshStandardMaterial color="#9a9a96" roughness={0.6} />
        </mesh>
        <group position={[-0.55, 1.15, -0.2]}>
          <mesh position={[0, 0.12, 0]}>
            <cylinderGeometry args={[0.02, 0.02, 0.24, 6]} />
            <meshStandardMaterial color="#b0b0ac" />
          </mesh>
          <mesh position={[0, 0.27, 0]} rotation={[-0.7, 0, 0]}>
            <sphereGeometry args={[0.16, 14, 6, 0, Math.PI * 2, 0, Math.PI / 3]} />
            <meshStandardMaterial color="#e8e8e4" side={DoubleSide} />
          </mesh>
        </group>
      </group>
      {/* cúpula: base cilíndrica com frisos + teto facetado com fenda */}
      <group position={[0.85, 0, -0.15]}>
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[1.0, 1.0, 1.5, 28]} />
          <meshStandardMaterial color="#f0f0ee" roughness={0.45} />
        </mesh>
        {[0.25, 0.75, 1.25].map((y, i) => (
          <mesh key={`fr${i}`} position={[0, y, 0]}>
            <torusGeometry args={[1.005, 0.012, 4, 40]} />
            <meshStandardMaterial color="#c8c8c4" />
          </mesh>
        ))}
        <group rotation={[0, az, 0]}>
          {/* teto facetado (meia esfera low-poly) com ABERTURA REAL na fenda (dá pra ver o telescópio dentro) */}
          <mesh position={[0, 1.5, 0]} castShadow>
            <sphereGeometry args={[1.0, 28, 8, Math.PI / 2 + 0.2 * o + 0.03, Math.PI * 2 - 0.4 * o - 0.06, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#f4f4f2" roughness={0.4} flatShading side={DoubleSide} />
          </mesh>
          {/* piso interno escuro + luz interna (o telescópio aparece pela fenda) */}
          <mesh position={[0, 1.503, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.98, 28]} />
            <meshStandardMaterial color="#1a1726" roughness={0.9} />
          </mesh>
          <pointLight position={[0, 2.0, 0.1]} intensity={1.6 + winOn * 2} distance={2.2} color="#d8ccff" />
          <mesh position={[0, 1.15, 0]}>
            <cylinderGeometry args={[1.006, 1.006, 0.7 * o, 16, 1, true, -0.2 * o - 0.02, 0.4 * o + 0.04]} />
            <meshStandardMaterial color="#0e0c16" side={DoubleSide} />
          </mesh>
          {/* persianas (abas abertas ao lado da fenda) */}
          {[-1, 1].map((k) => (
            <mesh key={k} position={[k * (0.22 + 0.04 * o), 1.95, 0.62]} rotation={[-0.75, 0, k * -0.15]}>
              <boxGeometry args={[0.05, 0.75, 0.12]} />
              <meshStandardMaterial color="#dcdcd8" roughness={0.5} />
            </mesh>
          ))}
          {/* telescópio: montagem + treliça + espelho, espiando pela fenda */}
          <group position={[0, 1.1, 0.25]} rotation={[-0.6 - scan * 0.2, 0, 0]}>
            <mesh>
              <cylinderGeometry args={[0.16, 0.2, 0.14, 12]} />
              <meshStandardMaterial color="#3a3a46" metalness={0.5} roughness={0.4} />
            </mesh>
            {Array.from({ length: 6 }, (_, i) => {
              const a = (i / 6) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.cos(a) * 0.15, 0.35, Math.sin(a) * 0.15]} rotation={[Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12]}>
                  <cylinderGeometry args={[0.012, 0.012, 0.7, 4]} />
                  <meshStandardMaterial color="#c8c8d0" metalness={0.6} roughness={0.3} />
                </mesh>
              );
            })}
            <mesh position={[0, 0.72, 0]}>
              <torusGeometry args={[0.13, 0.02, 6, 16]} />
              <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.4 + winOn} />
            </mesh>
            <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
              <circleGeometry args={[0.15, 20]} />
              <meshStandardMaterial color="#cfe4ff" metalness={0.9} roughness={0.05} />
            </mesh>
          </group>
        </group>
      </group>
      {/* tela de calibração (painel alto) */}
      <group position={[2.15, 0, 0.75]}>
        <mesh position={[0, 0.5, 0]}>
          <boxGeometry args={[0.06, 1.0, 0.06]} />
          <meshStandardMaterial color="#9a9a9a" />
        </mesh>
        <mesh position={[0, 0.85, 0]} rotation={[0, -0.6, 0]}>
          <boxGeometry args={[0.6, 0.45, 0.04]} />
          <meshStandardMaterial color="#f4f4f2" roughness={0.4} />
        </mesh>
      </group>
      {/* luzinhas vermelhas de aviso (piscam à noite) */}
      {winOn > 0.05
        ? [[-1.25, 1.35, 0.35], [0.85, 2.55, -0.15]].map((p, i) => (
            <mesh key={`l${i}`} position={p as Vec3}>
              <sphereGeometry args={[0.03, 6, 4]} />
              <meshBasicMaterial color="#ff3a3a" transparent opacity={(0.4 + 0.6 * (Math.sin(f / 8 + i) > 0 ? 1 : 0)) * winOn} toneMapped={false} />
            </mesh>
          ))
        : null}
    </group>
  );
};

/* ------------------------------------------------------------------ OBSERVATÓRIO ANTIGO (estilo 1900) */

export const OldObservatory: React.FC<{ f: number; s?: number }> = ({ f, s = 1 }) => (
  <group scale={s}>
    {/* torre de madeira */}
    <mesh position={[0, 0.6, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[0.9, 0.95, 1.2, 16]} />
      <meshStandardMaterial color="#8a5a34" {...M} />
    </mesh>
    {Array.from({ length: 16 }, (_, i) => {
      const a = (i / 16) * Math.PI * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * 0.93, 0.6, Math.sin(a) * 0.93]} rotation={[0, -a, 0]}>
          <boxGeometry args={[0.02, 1.2, 0.06]} />
          <meshStandardMaterial color="#6a4226" />
        </mesh>
      );
    })}
    {/* porta e janela */}
    <mesh position={[0, 0.35, 0.94]}>
      <boxGeometry args={[0.32, 0.6, 0.03]} />
      <meshStandardMaterial color="#4a2e18" />
    </mesh>
    {/* cúpula de madeira pintada com fenda, girando devagar */}
    <group position={[0, 1.2, 0]} rotation={[0, 0.4 + Math.sin(f / 90) * 0.15, 0]}>
      <mesh castShadow>
        <sphereGeometry args={[0.95, 18, 8, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#d8d2c4" roughness={0.7} flatShading />
      </mesh>
      <mesh>
        <sphereGeometry args={[0.957, 14, 6, Math.PI / 2 - 0.16, 0.32, 0.03, Math.PI / 2 - 0.03]} />
        <meshStandardMaterial color="#120e0a" side={DoubleSide} />
      </mesh>
      {/* refrator comprido (latão) saindo pela fenda */}
      <group position={[0, 0.25, 0]} rotation={[-0.7, 0, 0]}>
        <mesh position={[0, 0.7, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 1.5, 12]} />
          <meshStandardMaterial color="#b88a3a" metalness={0.6} roughness={0.35} />
        </mesh>
        <mesh position={[0, 1.45, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.08, 12]} />
          <meshStandardMaterial color="#8a6a2a" metalness={0.6} roughness={0.35} />
        </mesh>
      </group>
    </group>
    {/* casinha anexa + pinheiros */}
    <mesh position={[-1.4, 0.35, 0.2]} castShadow>
      <boxGeometry args={[0.9, 0.7, 0.8]} />
      <meshStandardMaterial color="#c8b898" {...M} />
    </mesh>
    <mesh position={[-1.4, 0.85, 0.2]} rotation={[0, Math.PI / 4, 0]}>
      <coneGeometry args={[0.7, 0.4, 4]} />
      <meshStandardMaterial color="#7a3a2a" {...M} />
    </mesh>
    {[[1.6, -0.6], [-2.2, -0.8], [1.2, 1.0]].map(([x, z], i) => (
      <group key={i} position={[x, 0, z]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.05, 0.07, 0.3, 6]} />
          <meshStandardMaterial color="#5a3a22" />
        </mesh>
        {[0, 1, 2].map((k) => (
          <mesh key={k} position={[0, 0.45 + k * 0.32, 0]}>
            <coneGeometry args={[0.42 - k * 0.1, 0.5, 7]} />
            <meshStandardMaterial color="#2f5a32" {...M} />
          </mesh>
        ))}
      </group>
    ))}
    <mesh position={[0, -0.03, 0]} receiveShadow>
      <cylinderGeometry args={[3.2, 3.4, 0.06, 20]} />
      <meshStandardMaterial color="#7a8a52" roughness={1} />
    </mesh>
  </group>
);

/* ------------------------------------------------------------------ PLANETAS */

const banded = (r: number, cols: string[], seed: string, bump = 0.02) => {
  const g = new IcosahedronGeometry(r, 4);
  const pos = g.attributes.position;
  const cs = new Float32Array(pos.count * 3);
  const v = new Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const lat = v.y / r;
    const band = Math.floor((lat + 1) * 3.5 + Math.sin(v.x * 3 + v.z * 2) * 0.4);
    const c = C(cols[Math.abs(band) % cols.length]).offsetHSL(0, 0, (rand(`${seed}${i}`) - 0.5) * 0.04);
    cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b;
    const n = 1 + (rand(`${seed}b${Math.round(v.x * 8)}${Math.round(v.y * 8)}${Math.round(v.z * 8)}`) - 0.5) * bump;
    pos.setXYZ(i, v.x * n, v.y * n, v.z * n);
  }
  g.setAttribute("color", new BufferAttribute(cs, 3));
  g.computeVertexNormals();
  return g;
};

/** Planeta Nove (ILUSTRAÇÃO): gigante de gelo azul-acinzentado, faixas suaves, halo frio. ghost 0..1 = translúcido. */
export const PlanetNine: React.FC<{ f: number; r?: number; ghost?: number; dark?: number }> = ({ f, r = 1, ghost = 0, dark = 0 }) => {
  const geo = useMemo(() => banded(r, ["#5a7a9a", "#6a8aa8", "#4a6a88", "#7a96b0", "#56748e"], "p9", 0.01), [r]);
  const g = clamp(ghost, 0, 1);
  return (
    <group rotation={[0.35, f * 0.004, 0.2]}>
      <mesh geometry={geo}>
        <meshStandardMaterial vertexColors roughness={0.6} transparent opacity={1 - g * 0.65} color={new Color(1, 1, 1).multiplyScalar(1 - dark * 0.7)} />
      </mesh>
      <mesh scale={1.12}>
        <sphereGeometry args={[r, 32, 20]} />
        <meshBasicMaterial color="#9fc8ff" transparent opacity={0.12 * (1 - dark)} blending={AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* anel fino e escuro */}
      <mesh rotation={[Math.PI / 2 - 0.3, 0, 0]}>
        <ringGeometry args={[r * 1.5, r * 1.8, 64]} />
        <meshBasicMaterial color="#8aa0b8" transparent opacity={0.25 * (1 - g * 0.5)} side={DoubleSide} />
      </mesh>
    </group>
  );
};

/** Plutão: pequeno, bege com o "coração" claro (Tombaugh Regio) e manchas escuras. */
export const Pluto: React.FC<{ f: number; r?: number }> = ({ f, r = 0.3 }) => {
  const geo = useMemo(() => {
    const g = new IcosahedronGeometry(r, 3);
    const pos = g.attributes.position;
    const cs = new Float32Array(pos.count * 3);
    const v = new Vector3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i).normalize();
      let c = C("#c8a882");
      // coração: região clara perto de (0.6, -0.1, 0.8)
      const heart = v.distanceTo(new Vector3(0.55, -0.05, 0.83).normalize());
      if (heart < 0.55) c = C("#f2e8dc");
      else if (v.y < -0.2 && v.z > 0) c = C("#6a4a3a");
      cs[i * 3] = c.r; cs[i * 3 + 1] = c.g; cs[i * 3 + 2] = c.b;
    }
    g.setAttribute("color", new BufferAttribute(cs, 3));
    return g;
  }, [r]);
  return (
    <mesh geometry={geo} rotation={[0.2, f * 0.01, 0]}>
      <meshStandardMaterial vertexColors roughness={0.9} flatShading />
    </mesh>
  );
};

/** Nibiru (BOATO): planeta vermelho "apocalíptico" de desenho, com rachaduras de lava e rastro de fogo. */
export const Nibiru: React.FC<{ f: number; r?: number; trail?: number }> = ({ f, r = 1, trail = 1 }) => (
  <group>
    <mesh rotation={[0.3, f * 0.02, 0]}>
      <icosahedronGeometry args={[r, 2]} />
      <meshStandardMaterial color="#7a1a10" roughness={0.8} flatShading emissive="#3a0800" />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => {
      const a = rand(`nl${i}`) * Math.PI * 2;
      const b = (rand(`nb${i}`) - 0.5) * 2;
      return (
        <mesh key={i} position={[Math.cos(a) * r * 0.98 * Math.cos(b * 0.6), Math.sin(b * 0.6) * r * 0.98, Math.sin(a) * r * 0.98 * Math.cos(b * 0.6)]} lookAt={undefined} scale={[r * 0.35, 0.02 * r, 0.03 * r]} rotation={[0, -a, b]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="#ff8a2a" toneMapped={false} />
        </mesh>
      );
    })}
    <mesh scale={1.25}>
      <sphereGeometry args={[r, 24, 16]} />
      <meshBasicMaterial color="#ff4a1a" transparent opacity={0.18} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
    {trail > 0.01
      ? Array.from({ length: 8 }, (_, i) => (
          <mesh key={`t${i}`} position={[-(i + 1) * r * 0.5, 0, 0]} scale={(1 - i / 9) * r * 0.8}>
            <sphereGeometry args={[1, 10, 8]} />
            <meshBasicMaterial color={i < 3 ? "#ffb03a" : "#ff4a1a"} transparent opacity={0.25 * (1 - i / 8) * trail} blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
          </mesh>
        ))
      : null}
  </group>
);

/** Órbitas alongadas de objetos distantes, todas apontando para o mesmo lado (agrupamento). k 0..1 desenha. */
export const AlignedOrbits: React.FC<{ k?: number; n?: number; spread?: number }> = ({ k = 1, n = 6, spread = 0.5 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const peri = 9 + i * 0.6;
      const apo = 26 + i * 4;
      const a = (peri + apo) / 2;
      const e = (apo - peri) / (apo + peri);
      const ang = (i - (n - 1) / 2) * (spread / n);
      const pts: Vec3[] = [];
      const N = Math.max(2, Math.round(120 * clamp(k - i * 0.06, 0, 1)));
      for (let j = 0; j <= N; j++) {
        const u = (j / 120) * Math.PI * 2;
        const r = (a * (1 - e * e)) / (1 + e * Math.cos(u));
        pts.push([Math.cos(u + ang + Math.PI) * r, 0, -Math.sin(u + ang + Math.PI) * r]);
      }
      return pts.map((p, j) =>
        j % 2 === 0 ? (
          <mesh key={`${i}-${j}`} position={p}>
            <sphereGeometry args={[0.28, 6, 4]} />
            <meshBasicMaterial color={i % 2 ? "#ffcf3a" : "#ffb02a"} toneMapped={false} />
          </mesh>
        ) : null,
      );
    })}
  </group>
);
