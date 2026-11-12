import { useMemo } from "react";
import { BufferAttribute, Color, DoubleSide, RepeatWrapping, SphereGeometry, SRGBColorSpace, TextureLoader } from "three";
import { useLoader } from "@react-three/fiber";
import { staticFile } from "remotion";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";
import { Box, Gable } from "./Medieval";

// "O buraco mais fundo do mundo" — elementos novos (aprovar na folha de design antes de usar).
// Estação, tundra, boca do furo e tampa: METROS, chão em y = 0 (na maquete: <group scale={U}>, U = 0,03).
// Coluna, régua de escala e globo: u3d ESQUEMÁTICOS (ver scene-plan: 1 km = 2 u3d na coluna).

const MATTE = { roughness: 0.9, metalness: 0, flatShading: true } as const;
export const SNOW = "#e9eef3";
export const SNOW_D = "#cfd8e2";
export const STEEL = "#8b939c";
export const STEEL_D = "#5f6770";
export const RUST = "#8a4a2a";
export const CONCRETE = "#9a9a94";
const mix = (a: string, b: string, t: number) => new Color(a).lerp(new Color(b), clamp(t, 0, 1)).getStyle();

const Cyl: React.FC<{ p: Vec3; r: number; h: number; c: string; seg?: number; rot?: Vec3; e?: string; ei?: number; r1?: number }> = ({ p, r, h, c, seg = 12, rot, e, ei = 0, r1 }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <cylinderGeometry args={[r1 ?? r, r, h, seg]} />
    <meshStandardMaterial {...MATTE} color={c} emissive={e ?? "#000000"} emissiveIntensity={ei} />
  </mesh>
);

// ============================================================ superfície (metros)
/** Placa de tundra nevada com manchas de vegetação rasteira, arbustos e pedras. */
export const Tundra: React.FC<{ w?: number; d?: number; h?: number; seed?: string; hole?: boolean }> = ({ w = 180, d = 140, h = 6, seed = "tundra", hole = true }) => {
  const items = useMemo(() => {
    const out: { k: "shrub" | "rock" | "patch" | "mound"; p: Vec3; s: number; r: number }[] = [];
    for (let i = 0; i < 70; i++) {
      const x = (rand(`${seed}-x${i}`) - 0.5) * w * 0.92;
      const z = (rand(`${seed}-z${i}`) - 0.5) * d * 0.92;
      if (Math.abs(x) < 34 && Math.abs(z) < 26) continue; // área da estação
      const t = rand(`${seed}-t${i}`);
      out.push({ k: t < 0.42 ? "shrub" : t < 0.62 ? "rock" : t < 0.86 ? "patch" : "mound", p: [x, 0, z], s: 0.6 + rand(`${seed}-s${i}`) * 1.2, r: rand(`${seed}-r${i}`) * 6 });
    }
    return out;
  }, [w, d, seed]);
  return (
    <group>
      <Box p={[0, -h / 2, 0]} s={[w, h, d]} c={SNOW} />
      <Box p={[0, -h - 3, 0]} s={[w, 6, d]} c="#6f7a6b" />
      {items.map((it, i) =>
        it.k === "shrub" ? (
          <mesh key={i} position={[it.p[0], 0.7 * it.s, it.p[2]]} rotation={[0, it.r, 0]} castShadow>
            <icosahedronGeometry args={[1.1 * it.s, 0]} />
            <meshStandardMaterial {...MATTE} color={i % 2 ? "#3f5a40" : "#4d5f3a"} />
          </mesh>
        ) : it.k === "rock" ? (
          <mesh key={i} position={[it.p[0], 0.5 * it.s, it.p[2]]} rotation={[it.r, it.r * 2, 0]} castShadow>
            <dodecahedronGeometry args={[1.0 * it.s, 0]} />
            <meshStandardMaterial {...MATTE} color="#7c7f84" />
          </mesh>
        ) : it.k === "patch" ? (
          <mesh key={i} position={[it.p[0], 0.03, it.p[2]]} rotation={[-Math.PI / 2, 0, it.r]} receiveShadow>
            <circleGeometry args={[4 * it.s, 7]} />
            <meshStandardMaterial {...MATTE} color="#7a7d5a" />
          </mesh>
        ) : (
          <mesh key={i} position={[it.p[0], 0, it.p[2]]} scale={[3 * it.s, 1.0 * it.s, 2.2 * it.s]} castShadow receiveShadow>
            <sphereGeometry args={[1, 7, 5, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial {...MATTE} color={SNOW_D} />
          </mesh>
        ),
      )}
      {hole ? null : null}
    </group>
  );
};

const Windows: React.FC<{ x0: number; y0: number; z: number; cols: number; rows: number; dx: number; dy: number; lights: number; rot?: number }> = ({ x0, y0, z, cols, rows, dx, dy, lights, rot = 0 }) => (
  <group rotation={[0, rot, 0]}>
    {Array.from({ length: cols * rows }, (_, i) => {
      const cx = i % cols;
      const cy = Math.floor(i / cols);
      const on = rand(`win-${i}-${x0}`) < 0.75;
      return <Box key={i} p={[x0 + cx * dx, y0 + cy * dy, z]} s={[1.1, 1.4, 0.15]} c="#2a2f3a" e="#ffcf7a" ei={on ? 1.6 * lights : 0} />;
    })}
  </group>
);

/** Estação SG-3: torre de perfuração fechada (~58 m), prédio da base, galpões, tubulação. `ruin` = abandonada. */
export const DrillStation: React.FC<{ lights?: number; ruin?: number }> = ({ lights = 1, ruin = 0 }) => {
  const R = ruin > 0.5;
  const clad = R ? "#7d7a74" : "#8e98a3";
  const band = R ? RUST : "#5c6a7a";
  return (
    <group>
      <Box p={[0, 0.2, 0]} s={[68, 0.4, 52]} c={R ? "#8a8984" : CONCRETE} />
      {!R ? (
        <>
          {/* prédio da base da torre */}
          <Box p={[0, 6.4, 0]} s={[16, 12, 16]} c={clad} />
          <Box p={[0, 12.6, 0]} s={[16.6, 0.6, 16.6]} c={SNOW} />
          <Windows x0={-5} y0={4} z={8.1} cols={4} rows={2} dx={3.3} dy={4} lights={lights} />
          {/* torre: tronco que afina, faixas horizontais, janelas */}
          {Array.from({ length: 6 }, (_, i) => {
            const y0 = 13 + i * 7.5;
            const wd = lerp(10, 6.4, i / 5);
            return (
              <group key={i}>
                <Box p={[0, y0 + 3.75, 0]} s={[wd, 7.5, wd]} c={clad} />
                <Box p={[0, y0 + 7.3, 0]} s={[wd + 0.5, 0.5, wd + 0.5]} c={band} />
                <Box p={[0, y0 + 4, wd / 2 + 0.06]} s={[1, 1.3, 0.12]} c="#2a2f3a" e="#ffcf7a" ei={(i % 2 ? 1.4 : 0.4) * lights} />
              </group>
            );
          })}
          {/* topo da torre: casa de máquinas + guindaste + luz de aviso */}
          <Box p={[0, 60, 0]} s={[7.6, 3.2, 7.6]} c={band} />
          <Box p={[0, 61.8, 0]} s={[8.2, 0.5, 8.2]} c={SNOW} />
          <Box p={[3, 63, 0]} s={[10, 0.7, 0.7]} c="#c9a227" />
          <mesh position={[0, 63.4, 0]}>
            <sphereGeometry args={[0.6, 8, 6]} />
            <meshStandardMaterial color="#ff4d3a" emissive="#ff4d3a" emissiveIntensity={2 * lights} />
          </mesh>
        </>
      ) : (
        <>
          {/* ruína: base da torre com paredes quebradas e entulho */}
          <Box p={[-7.6, 3.5, 0]} s={[0.8, 7, 16]} c={clad} />
          <Box p={[7.6, 2.2, -3]} s={[0.8, 4.4, 10]} c={clad} />
          <Box p={[0, 4.6, -7.6]} s={[16, 9.2, 0.8]} c={clad} />
          <Box p={[-4, 1.4, 7.6]} s={[7, 2.8, 0.8]} c={clad} />
          {Array.from({ length: 9 }, (_, i) => (
            <Box key={i} p={[(rand(`rb${i}`) - 0.5) * 12, 0.6, (rand(`rz${i}`) - 0.5) * 12]} s={[1.5 + rand(`rs${i}`) * 2, 1.2, 1.2 + rand(`rt${i}`) * 1.5]} r={[0, rand(`rr${i}`) * 3, 0.2]} c={i % 3 ? "#77746e" : RUST} />
          ))}
          <Box p={[2, 0.5, 9]} s={[9, 0.3, 0.3]} r={[0, 0.4, 0.15]} c={RUST} />
        </>
      )}
      {/* galpão comprido */}
      <group position={[24, 0.4, 2]}>
        {R ? (
          <>
            <Box p={[-6.6, 3.2, 0]} s={[0.8, 6.4, 34]} c="#7a6d60" />
            <Box p={[6.6, 1.8, -6]} s={[0.8, 3.6, 22]} c="#7a6d60" />
            <Box p={[0, 4, -16.6]} s={[14, 8, 0.8]} c="#7a6d60" />
            <Box p={[-3, 1.2, 16.6]} s={[8, 2.4, 0.8]} c="#7a6d60" />
            <Box p={[1, 0.3, 4]} s={[9, 0.6, 7]} r={[0, 0.3, 0]} c={RUST} />
          </>
        ) : (
          <>
          <Box p={[0, 4.5, 0]} s={[14, 9, 34]} c="#8b7b6b" />
          <>
            <Gable p={[0, 9, 0]} w={14.6} d={34.6} h={4} c="#5d6b78" />
            <Gable p={[0, 9.25, 0]} w={13.2} d={34.6} h={3.2} c={SNOW} />
                        {Array.from({ length: 5 }, (_, i) => <Box key={i} p={[-7.08, 4, -12 + i * 6]} s={[0.15, 1.6, 2.4]} c="#2a2f3a" e="#ffcf7a" ei={1.3 * lights} />)}
          </>
          </>
        )}
      </group>
      {/* galpão menor + chaminé */}
      <group position={[-20, 0.4, -14]}>
        <Box p={[0, 3.5, 0]} s={[18, 7, 11]} c={R ? "#6f6c66" : "#7f8a76"} />
        {R ? null : <Box p={[0, 7.2, 0]} s={[18.4, 0.5, 11.4]} c={SNOW} />}
        <Cyl p={[6, 9, -2]} r={0.9} h={18} c={R ? RUST : "#9a8f86"} />
      </group>
      {/* tubulação */}
      {[0, 1].map((k) => (
        <Cyl key={k} p={[15, 2 + k * 1.4, -8]} r={0.45} h={24} rot={[0, 0, Math.PI / 2]} c={R ? RUST : STEEL} />
      ))}
    </group>
  );
};

/** Boca do furo: tubo de revestimento de 23 cm saindo do concreto, flange e régua amarela de 30 cm. */
export const BoreholeMouth: React.FC<{ ruler?: number }> = ({ ruler = 1 }) => (
  <group>
    <Box p={[0, 0.1, 0]} s={[2.4, 0.2, 2.4]} c={CONCRETE} />
    <Cyl p={[0, 0.35, 0]} r={0.145} h={0.3} c={STEEL} seg={20} />
    <Cyl p={[0, 0.22, 0]} r={0.24} h={0.06} c={STEEL_D} seg={20} />
    <mesh position={[0, 0.505, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <circleGeometry args={[0.115, 20]} />
      <meshStandardMaterial color="#05040a" />
    </mesh>
    {ruler > 0.01 ? (
      <group position={[0, 0.53, 0.16]} scale={[1, 1, ruler]}>
        <Box p={[0, 0, 0]} s={[0.3, 0.012, 0.045]} c="#f2c12e" />
        {Array.from({ length: 7 }, (_, i) => <Box key={i} p={[-0.15 + i * 0.05, 0.008, -0.012]} s={[0.004, 0.006, 0.02]} c="#2a2a2a" />)}
      </group>
    ) : null}
  </group>
);

/** Tampa de metal enferrujada, soldada sobre a laje (como está hoje). */
export const RustyCap: React.FC = () => (
  <group>
    <Box p={[0, 0.15, 0]} s={[3, 0.3, 3]} c="#8f8d86" />
    {Array.from({ length: 5 }, (_, i) => <Box key={i} p={[(rand(`cr${i}`) - 0.5) * 2.4, 0.305, (rand(`cz${i}`) - 0.5) * 2.4]} s={[0.4 + rand(`cs${i}`) * 0.5, 0.01, 0.05]} r={[0, rand(`cq${i}`) * 3, 0]} c="#6f6d67" />)}
    <Cyl p={[0, 0.34, 0]} r={0.36} h={0.08} c={RUST} seg={24} />
    <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
      <torusGeometry args={[0.37, 0.025, 6, 24]} />
      <meshStandardMaterial {...MATTE} color="#5e3320" />
    </mesh>
    {Array.from({ length: 10 }, (_, i) => {
      const a = (i / 10) * Math.PI * 2;
      return <Cyl key={i} p={[Math.cos(a) * 0.29, 0.39, Math.sin(a) * 0.29]} r={0.022} h={0.03} c="#4a2a1c" seg={6} />;
    })}
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={i} position={[(rand(`rp${i}`) - 0.5) * 0.4, 0.381, (rand(`rq${i}`) - 0.5) * 0.4]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04 + rand(`rs${i}`) * 0.06, 6]} />
        <meshStandardMaterial {...MATTE} color={i % 2 ? "#a3582c" : "#6b3a22"} />
      </mesh>
    ))}
  </group>
);

// ============================================================ descida (u3d esquemáticos)
/** Broca tricônica + coluna de hastes até a superfície. Topo em y = 0; ponta em y = tip. */
export const Drill: React.FC<{ tip: number; r?: number; spin?: number; f?: number; heat?: number; top?: number }> = ({ tip, r = 0.05, spin = 1, f = 0, heat = 0, top = 0 }) => {
  const len = Math.max(0.001, top - tip - r * 2.2);
  const rot = f * 0.35 * spin;
  return (
    <group>
      <mesh position={[0, top - len / 2, 0]}>
        <cylinderGeometry args={[r * 0.45, r * 0.45, len, 8]} />
        <meshStandardMaterial color="#c9ced6" metalness={0.6} roughness={0.35} emissive="#a78bfa" emissiveIntensity={0.25} />
      </mesh>
      <group position={[0, tip + r * 1.6, 0]} rotation={[0, rot, 0]}>
        <Cyl p={[0, r * 0.4, 0]} r={r * 0.9} h={r * 1.2} c="#9aa1aa" seg={10} />
        {[0, 1, 2].map((k) => {
          const a = (k / 3) * Math.PI * 2;
          return (
            <mesh key={k} position={[Math.cos(a) * r * 0.45, -r * 0.7, Math.sin(a) * r * 0.45]} rotation={[Math.cos(a) * 0.5, 0, -Math.sin(a) * 0.5]}>
              <coneGeometry args={[r * 0.55, r * 1.2, 7]} />
              <meshStandardMaterial {...MATTE} color={mix("#d4a63a", "#ff7a2a", heat)} emissive="#ff5a1f" emissiveIntensity={heat * 1.2} />
            </mesh>
          );
        })}
      </group>
    </group>
  );
};

/** Camadas da coluna (km): rochas vulcano-sedimentares em cima, gnaisse/granito arqueano embaixo (ilustrativo). */
export const STRATA: { from: number; to: number; c: string }[] = [
  { from: 0, to: 0.4, c: "#77806f" },
  { from: 0.4, to: 2.0, c: "#68715f" },
  { from: 2.0, to: 4.5, c: "#5d6870" },
  { from: 4.5, to: 6.8, c: "#6a6274" },
  { from: 6.8, to: 9.5, c: "#86776a" },
  { from: 9.5, to: 12.8, c: "#8d7564" },
];

/** Coluna de rocha em corte. Topo em y = 0, fundo em y = −km·KM. Furo (fenda escura) no centro da face da frente.
 *  heat 0..1 = esquenta com a profundidade; myth 0..1 = tinge de vermelho-inferno; cracks 0..1 = rachaduras com água. */
export const RockColumn: React.FC<{ KM?: number; depthKm?: number; w?: number; d?: number; heat?: number; myth?: number; cracks?: number; f?: number; holeTo?: number; soft?: number }> = ({ KM = 2, depthKm = 12.8, w = 2.4, d = 1.2, heat = 0, myth = 0, cracks = 0, f = 0, holeTo = 12.262, soft = 0 }) => {
  const layers = STRATA.filter((s) => s.from < depthKm);
  const drops = useMemo(() => Array.from({ length: 26 }, (_, i) => ({ x: (rand(`dx${i}`) - 0.5) * w * 0.8, k: 3 + rand(`dk${i}`) * 3, sp: 0.4 + rand(`ds${i}`) })), [w]);
  return (
    <group>
      {layers.map((s, i) => {
        const to = Math.min(s.to, depthKm);
        const h = (to - s.from) * KM;
        const mid = (s.from + to) / 2;
        const hk = clamp(heat * (mid / 12.262) * 1.25 - 0.1, 0, 1);
        const base = mix(mix(s.c, "#c4572a", hk * 0.85), "#5a1410", myth);
        return (
          <mesh key={i} position={[0, -(s.from + to) / 2 * KM, 0]} receiveShadow>
            <boxGeometry args={[w, h, d]} />
            <meshStandardMaterial {...MATTE} color={base} emissive={myth > 0.01 ? "#ff3b14" : "#ff5a1f"} emissiveIntensity={Math.max(hk * hk * 0.7, myth * 0.35)} />
          </mesh>
        );
      })}
      {/* faixas finas (bandamento), sutis, no tom da rocha */}
      {Array.from({ length: Math.floor(depthKm * 3) }, (_, i) => {
        const km = i / 3 + 0.15;
        if (rand(`bv${i}`) > 0.5) return null;
        const layer = STRATA.find((L) => km >= L.from && km < L.to) ?? STRATA[STRATA.length - 1];
        return <Box key={i} p={[(rand(`bx${i}`) - 0.5) * w * 0.3, -km * KM, d / 2 + 0.003]} s={[w * (0.55 + rand(`bw${i}`) * 0.4), 0.025 + rand(`bd${i}`) * 0.04, 0.004]} c={mix(mix(layer.c, "#1a1520", 0.35), "#5a1410", myth)} />;
      })}
      {/* o furo: fenda escura no meio da face da frente */}
      <mesh position={[0, (-holeTo * KM) / 2, d / 2 + 0.006]}>
        <planeGeometry args={[0.07 * (1 - 0.55 * soft), holeTo * KM]} />
        <meshBasicMaterial color="#07050c" />
      </mesh>
      {/* rachaduras com água entre 3 e 6 km */}
      {cracks > 0.01
        ? Array.from({ length: 9 }, (_, i) => {
            const y = -(3 + (i / 8) * 3) * KM;
            const x = (rand(`ck${i}`) - 0.5) * w * 0.7;
            return <Box key={i} p={[x, y, d / 2 + 0.008]} s={[0.7 * cracks + rand(`cl${i}`) * 0.5 * cracks, 0.05, 0.004]} r={[0, 0, (rand(`ca${i}`) - 0.5) * 1.2]} c="#0d1622" e="#4fa3ff" ei={1.6 * cracks} />;
          })
        : null}
      {cracks > 0.01
        ? drops.map((dr, i) => {
            const y = -(dr.k * KM) - ((f * 0.01 * dr.sp) % 0.6);
            return (
              <mesh key={i} position={[dr.x, y, d / 2 + 0.03]}>
                <sphereGeometry args={[0.045, 6, 4]} />
                <meshStandardMaterial color="#7cc4ff" emissive="#4fa3ff" emissiveIntensity={1.2 * cracks} transparent opacity={0.9 * cracks} />
              </mesh>
            );
          })
        : null}
      {/* chamas da lenda no fundo */}
      {myth > 0.01
        ? Array.from({ length: 14 }, (_, i) => {
            const ph = (f * 0.06 + rand(`fl${i}`) * 6) % 1;
            return (
              <mesh key={i} position={[(rand(`fx${i}`) - 0.5) * w * 0.9, -holeTo * KM + 0.2 + ph * 1.2, d / 2 + 0.1]} scale={1 - ph}>
                <coneGeometry args={[0.12, 0.4, 5]} />
                <meshBasicMaterial color={ph < 0.5 ? "#ffb02e" : "#ff4a1a"} transparent opacity={myth * (1 - ph)} />
              </mesh>
            );
          })
        : null}
    </group>
  );
};

/** Microfone da lenda, pendurado pelo cabo (topo do cabo em y = top). */
export const Microphone: React.FC<{ y: number; top?: number; s?: number }> = ({ y, top = 0, s = 0.12 }) => (
  <group>
    <mesh position={[0, (top + y + s * 2) / 2, 0]}>
      <cylinderGeometry args={[s * 0.06, s * 0.06, Math.max(0.001, top - y - s * 2), 5]} />
      <meshStandardMaterial color="#111" />
    </mesh>
    <group position={[0, y, 0]}>
      <Cyl p={[0, s * 1.2, 0]} r={s * 0.28} r1={s * 0.36} h={s * 1.4} c="#2b2b30" />
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[s * 0.5, 10, 8]} />
        <meshStandardMaterial color="#b9bcc4" metalness={0.5} roughness={0.4} wireframe={false} flatShading />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[s * 0.52, 8, 6]} />
        <meshBasicMaterial color="#2b2b30" wireframe />
      </mesh>
    </group>
  </group>
);

// ---------------------------------------------------------------- microfósseis (formas ilustrativas)
const FOSSIL = "#e2d2a6";
export const Microfossil: React.FC<{ kind: 0 | 1 | 2 | 3 | 4; s?: number; spin?: number }> = ({ kind, s = 1, spin = 0 }) => {
  const m = <meshStandardMaterial {...MATTE} color={FOSSIL} emissive="#ffe9a8" emissiveIntensity={0.25} />;
  return (
    <group scale={s} rotation={[spin * 0.4, spin, 0]}>
      {kind === 0 ? (
        <>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1, 1, 0.3, 14]} />
            {m}
          </mesh>
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} rotation={[0, 0, (i / 10) * Math.PI]} position={[0, 0, 0.16]}>
              <boxGeometry args={[1.9, 0.06, 0.04]} />
              <meshStandardMaterial {...MATTE} color="#bfae82" />
            </mesh>
          ))}
        </>
      ) : kind === 1 ? (
        <>
          <mesh>
            <icosahedronGeometry args={[0.8, 0]} />
            {m}
          </mesh>
          {Array.from({ length: 12 }, (_, i) => {
            const t = Math.acos(1 - (2 * (i + 0.5)) / 12);
            const p = Math.PI * (1 + Math.sqrt(5)) * i;
            const dir: Vec3 = [Math.sin(t) * Math.cos(p), Math.cos(t), Math.sin(t) * Math.sin(p)];
            return (
              <mesh key={i} position={[dir[0] * 1.1, dir[1] * 1.1, dir[2] * 1.1]} lookAt={undefined} rotation={[Math.atan2(Math.hypot(dir[0], dir[2]), dir[1]), 0, 0]}>
                <coneGeometry args={[0.08, 0.6, 4]} />
                {m}
              </mesh>
            );
          })}
        </>
      ) : kind === 2 ? (
        <>
          {Array.from({ length: 7 }, (_, i) => {
            const a = i * 0.9;
            const r = 0.25 + i * 0.1;
            return (
              <mesh key={i} position={[Math.cos(a) * r * 1.4, Math.sin(a) * r * 1.4, 0]}>
                <sphereGeometry args={[0.18 + i * 0.07, 8, 6]} />
                {m}
              </mesh>
            );
          })}
        </>
      ) : kind === 3 ? (
        <>
          <mesh>
            <sphereGeometry args={[0.8, 10, 8]} />
            {m}
          </mesh>
          {Array.from({ length: 16 }, (_, i) => {
            const t = Math.acos(1 - (2 * (i + 0.5)) / 16);
            const p = Math.PI * (1 + Math.sqrt(5)) * i;
            return (
              <mesh key={i} position={[Math.sin(t) * Math.cos(p) * 0.85, Math.cos(t) * 0.85, Math.sin(t) * Math.sin(p) * 0.85]}>
                <sphereGeometry args={[0.12, 5, 4]} />
                {m}
              </mesh>
            );
          })}
        </>
      ) : (
        <>
          {Array.from({ length: 5 }, (_, i) => (
            <mesh key={i} position={[(i - 2) * 0.62, Math.sin(i) * 0.15, 0]}>
              <sphereGeometry args={[0.34, 8, 6]} />
              {m}
            </mesh>
          ))}
        </>
      )}
    </group>
  );
};

/** Lupa (aro + vidro + cabo). */
export const Magnifier: React.FC<{ r?: number }> = ({ r = 1 }) => (
  <group>
    <mesh>
      <torusGeometry args={[r, r * 0.08, 8, 32]} />
      <meshStandardMaterial {...MATTE} color="#c9a227" />
    </mesh>
    <mesh>
      <circleGeometry args={[r, 32]} />
      <meshStandardMaterial color="#cfe8ff" transparent opacity={0.12} side={DoubleSide} />
    </mesh>
    <mesh position={[r * 0.95, -r * 0.95, 0]} rotation={[0, 0, Math.PI / 4]}>
      <cylinderGeometry args={[r * 0.09, r * 0.11, r * 0.9, 8]} />
      <meshStandardMaterial {...MATTE} color="#4a3322" />
    </mesh>
  </group>
);

// ---------------------------------------------------------------- régua de escala (1 km = K u3d)
/** Nível do mar em y = 0. Everest à esquerda, oceano com a Fossa no meio, Kola (fio que desce) à direita. */
export const ScaleBoard: React.FC<{ K?: number; everest?: number; marianas?: number; kola?: number; oil?: number; f?: number }> = ({ K = 0.25, everest = 1, marianas = 1, kola = 0, oil = 0, f = 0 }) => {
  const E = 8.849 * K;
  const M = 10.935 * K;
  const KO = 12.262 * K;
  const oilPts = useMemo(() => {
    const pts: Vec3[] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      const x = t < 0.25 ? 0 : (t - 0.25) / 0.75;
      pts.push([x * 2.1, -Math.min(t, 0.25) / 0.25 * 0.7 - x * 0.06, 0]);
    }
    return pts;
  }, []);
  return (
    <group>
      {/* terra (esquerda e direita) e oceano (meio) */}
      <Box p={[-2.6, -0.25, 0]} s={[2.2, 0.5, 1.2]} c="#7a6a52" />
      <Box p={[2.7, -KO / 2 - 0.2, 0]} s={[2.4, KO + 0.4, 1.2]} c="#6f6458" />
      {/* oceano (~4 km) e a fossa crescem de cima para baixo com `marianas` */}
      <group scale={[1, Math.max(0.001, marianas), 1]}>
        <Box p={[0.05, -1.0 / 2, 0]} s={[2.9, 1.0, 1.2]} c="#2d6fa6" />
        <mesh position={[0.05, -M / 2, 0]}>
          <boxGeometry args={[0.36, M, 1.2]} />
          <meshStandardMaterial {...MATTE} color="#1f4f7a" />
        </mesh>
      </group>
      <mesh position={[0.05, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[2.9, 1.2]} />
        <meshStandardMaterial color="#5fa3dc" transparent opacity={0.75} />
      </mesh>
      {/* Everest (low-poly, neve no topo) */}
      <group position={[-2.6, 0, 0]} scale={[1, everest, 1]}>
        <mesh position={[0, E / 2, 0]} castShadow>
          <coneGeometry args={[1.0, E, 6]} />
          <meshStandardMaterial {...MATTE} color="#6f6a64" />
        </mesh>
        <mesh position={[0, E * 0.86, 0]}>
          <coneGeometry args={[1.0 * 0.28 + 0.02, E * 0.28, 6]} />
          <meshStandardMaterial {...MATTE} color={SNOW} />
        </mesh>
      </group>
      {/* fossa (cunha escura) */}
      <group visible={marianas > 0.01}>
        <mesh position={[0.05, -M - 0.02, 0.61]}>
          <boxGeometry args={[0.5, 0.04, 0.02]} />
          <meshBasicMaterial color="#9fd0ff" />
        </mesh>
      </group>
      {/* Kola: fio luminoso que desce */}
      <mesh position={[2.7, -(KO * kola) / 2, 0.61]}>
        <planeGeometry args={[0.07, Math.max(0.001, KO * kola)]} />
        <meshBasicMaterial color="#c4b5fd" />
      </mesh>
      <mesh position={[2.7, -KO * kola, 0.63]}>
        <sphereGeometry args={[0.07, 10, 8]} />
        <meshBasicMaterial color="#f5f0ff" />
      </mesh>
      {/* linhas-guia: altura do Everest e fundo da Fossa projetadas */}
      {everest > 0.6 ? <Box p={[0, -E, 0.62]} s={[6.8, 0.014, 0.005]} c="#ffffff" /> : null}
      {marianas > 0.6 ? <Box p={[0, -M, 0.62]} s={[6.8, 0.014, 0.005]} c="#9fd0ff" /> : null}
      {/* poço de petróleo inclinado (mais comprido, pouco fundo) */}
      {oil > 0.01 ? (
        <group position={[1.6, 0, 0.625]}>
          {oilPts.slice(0, Math.max(2, Math.round(oilPts.length * oil))).map((p, i, arr) =>
            i === 0 ? null : (
              <mesh key={i} position={[(p[0] + arr[i - 1][0]) / 2 + 1.0 - 1.0, (p[1] + arr[i - 1][1]) / 2, 0]} rotation={[0, 0, Math.atan2(p[1] - arr[i - 1][1], p[0] - arr[i - 1][0])]}>
                <planeGeometry args={[Math.hypot(p[0] - arr[i - 1][0], p[1] - arr[i - 1][1]) + 0.01, 0.05]} />
                <meshBasicMaterial color="#f2c12e" />
              </mesh>
            ),
          )}
        </group>
      ) : null}
      {void f}
    </group>
  );
};

// ---------------------------------------------------------------- globo em corte
const LAYERS = [
  { r: 1.0, c: "#8a6a4a" }, // crosta (engrossada no desenho)
  { r: 0.955, c: "#d9772b" }, // manto
  { r: 0.546, c: "#f2a33a" }, // núcleo externo (3.480 km)
  { r: 0.19, c: "#fff0b0" }, // núcleo interno (1.220 km)
];
/** lon/lat (graus) → ponto na esfera de raio R (mesmo mapeamento de UV do SphereGeometry). */
export const onGlobe = (lon: number, lat: number, R: number): Vec3 => {
  const phi = ((lon + 180) * Math.PI) / 180;
  const la = (lat * Math.PI) / 180;
  return [-R * Math.cos(phi) * Math.cos(la), R * Math.sin(la), R * Math.sin(phi) * Math.cos(la)];
};
const CUT_A = ((45 + 180) * Math.PI) / 180; // cunha entre 45°E e 135°E

/** Textura de continentes (public/globe.png). useLoader suspende; o <ThreeCanvas> segura o render até carregar. */
const useGlobeTexture = () => {
  const t = useLoader(TextureLoader, staticFile("globe.png"));
  t.colorSpace = SRGBColorSpace;
  t.wrapS = RepeatWrapping;
  return t;
};

const useGlobeGeo = (R: number, width: number) =>
  useMemo(() => {
    const start = CUT_A + width;
    const len = Math.PI * 2 - width;
    const g = new SphereGeometry(R, 72, 40, start, len);
    const uv = g.getAttribute("uv") as BufferAttribute;
    for (let i = 0; i < uv.count; i++) uv.setX(i, (start + uv.getX(i) * len) / (Math.PI * 2));
    uv.needsUpdate = true;
    return g;
  }, [R, width]);

export const EarthGlobe: React.FC<{ R?: number; cut?: number; spin?: number; crustGlow?: number }> = ({ R = 3, cut = 0, spin = 0, crustGlow = 0 }) => {
  const tex = useGlobeTexture();
  const width = (Math.PI / 2) * clamp(cut, 0, 1);
  const geo = useGlobeGeo(R, Math.max(width, 0.0001));
  const faces = [CUT_A, CUT_A + width];
  return (
    <group rotation={[0, spin, 0]}>
      <mesh geometry={geo} castShadow receiveShadow>
        <meshStandardMaterial map={tex} roughness={0.85} flatShading />
      </mesh>
      {width > 0.01
        ? LAYERS.map((L, i) => {
            const inner = i + 1 < LAYERS.length ? LAYERS[i + 1].r : 0;
            const glow = i === 0 ? crustGlow : i === 3 ? 0.8 : i === 2 ? 0.35 : 0.15;
            return faces.map((phi, k) => (
              <mesh key={`${i}-${k}`} rotation={[0, Math.PI + phi, 0]}>
                <ringGeometry args={[inner * R, L.r * R, 48, 1, -Math.PI / 2, Math.PI]} />
                <meshStandardMaterial color={L.c} emissive={i === 0 ? "#ffd27a" : L.c} emissiveIntensity={glow} side={DoubleSide} flatShading />
              </mesh>
            ));
          })
        : null}
    </group>
  );
};

/** Pino de mapa sobre o globo (ponta tocando a superfície, apontando para fora). */
export const GlobePin: React.FC<{ lon: number; lat: number; R?: number; color?: string; s?: number; cross?: number }> = ({ lon, lat, R = 3, color = "#e2483d", s = 0.35, cross = 0 }) => {
  const p = onGlobe(lon, lat, R);
  const n = p.map((v) => v / R) as Vec3;
  const up: Vec3 = [0, 1, 0];
  // rotação que leva +y até n
  const axis: Vec3 = [up[1] * n[2] - up[2] * n[1], up[2] * n[0] - up[0] * n[2], up[0] * n[1] - up[1] * n[0]];
  const ang = Math.acos(clamp(n[1], -1, 1));
  const al = Math.hypot(...axis) || 1;
  const q = [axis[0] / al * Math.sin(ang / 2), axis[1] / al * Math.sin(ang / 2), axis[2] / al * Math.sin(ang / 2), Math.cos(ang / 2)] as [number, number, number, number];
  return (
    <group position={p} quaternion={q}>
      <mesh position={[0, s * 0.5, 0]}>
        <coneGeometry args={[s * 0.12, s, 8]} />
        <meshStandardMaterial color="#e8e8ea" />
      </mesh>
      <mesh position={[0, s * 1.05, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[s * 0.26, 12, 10]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={0.3} />
      </mesh>
      {cross > 0.01 ? (
        <group position={[0, s * 1.05, s * 0.3]} scale={cross}>
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <boxGeometry args={[s * 0.9, s * 0.12, s * 0.05]} />
            <meshBasicMaterial color="#ff2d2d" />
          </mesh>
          <mesh rotation={[0, 0, -Math.PI / 4]}>
            <boxGeometry args={[s * 0.9, s * 0.12, s * 0.05]} />
            <meshBasicMaterial color="#ff2d2d" />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

/** Pilha de moedas (level 1 → 0 encolhe). */
export const Coins: React.FC<{ level?: number; n?: number; r?: number }> = ({ level = 1, n = 14, r = 0.5 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      const stack = i % 3;
      const k = Math.floor(i / 3);
      const vis = (k + 1) / Math.ceil(n / 3) <= level + 0.001;
      return vis ? <Cyl key={i} p={[(stack - 1) * r * 2.3, r * 0.12 + k * r * 0.24, stack === 1 ? 0.2 : 0]} r={r} h={r * 0.22} c="#d9a92c" seg={14} e="#7a5a10" ei={0.2} /> : null;
    })}
  </group>
);
