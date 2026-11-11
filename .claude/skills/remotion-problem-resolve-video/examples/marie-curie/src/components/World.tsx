import { Color } from "three";
import { useCurrentFrame } from "remotion";
import { track, X } from "../data/scenes";
import { MATTE } from "../theme";
import { clamp, lerp, rand, type Vec3 } from "../utils/animation";
import { Arrow3D } from "./Arrow3D";
import { BrandPedestal } from "./BrandPedestal";
import { Person, personLook, worldScale } from "./Person";

// Linha do tempo em maquete: um pedestal comprido com 8 estações (1867 → hoje). Régua 1 m = 0,3 u3d.
// "Ela" é uma Person de vestido longo, em silhueta até a revelação (her.reveal). Tudo lê trilhas no frame GLOBAL.

export const LINE = { x0: -16.2, x1: 17.6, d: 3.2 };
export const HER_Z = 0.55;
const PS = worldScale(0.3).person;
const SIL = new Color("#120d1a");

/** Mistura uma cor com a silhueta (k = 1 → cor real; 0 → silhueta). */
const sil = (hex: string, k: number) => new Color(hex).lerp(SIL, 1 - clamp(k, 0, 1)).getStyle();

const Box: React.FC<{ p: Vec3; s: Vec3; c: string; e?: string; ei?: number; r?: Vec3 }> = ({ p, s, c, e, ei = 0, r }) => (
  <mesh position={p} rotation={r} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial {...MATTE} color={c} emissive={e ?? "#000000"} emissiveIntensity={ei} />
  </mesh>
);

const Roof: React.FC<{ p: Vec3; w: number; d: number; h: number; c: string }> = ({ p, w, h, c }) => (
  <mesh position={p} rotation={[0, 0, 0]} castShadow>
    <cylinderGeometry args={[0.01, w * 0.62, h, 4, 1]} />
    <meshStandardMaterial {...MATTE} color={c} />
  </mesh>
);

const House: React.FC<{ x: number; z: number; w?: number; h?: number; c: string; roof?: string; lit?: number }> = ({ x, z, w = 1.0, h = 1.4, c, roof = "#8c4a3a", lit = 0 }) => (
  <group>
    <Box p={[x, h / 2, z]} s={[w, h, 0.8]} c={c} />
    <group position={[x, h + 0.25, z]} rotation={[0, Math.PI / 4, 0]} scale={[1, 1, 0.8 / w]}>
      <Roof p={[0, 0, 0]} w={w} d={0.8} h={0.5} c={roof} />
    </group>
    {[-0.25, 0.25].map((dx) => (
      <Box key={dx} p={[x + dx * w, h * 0.62, z + 0.405]} s={[0.2, 0.26, 0.02]} c={lit > 0.5 ? "#ffd27a" : "#2b2f3d"} e="#ffb347" ei={lit > 0.5 ? 1.2 : 0} />
    ))}
    {lit > 0.5 ? (
      // silhuetas estudando na janela acesa
      [-0.3, -0.2, 0.2, 0.3].map((dx) => <Box key={`s${dx}`} p={[x + dx * w, h * 0.58, z + 0.418]} s={[0.04, 0.09, 0.01]} c="#3a2a1a" />)
    ) : null}
  </group>
);

// ---------------------------------------------------------------- estações
const Warsaw: React.FC<{ f: number }> = ({ f }) => {
  const x = X.warsaw;
  const hop = track("windows.hop", f);
  const lit = hop > 0.01 && hop < 3 ? Math.floor(hop) : -1;
  const gate = track("gate.close", f);
  const shadow = track("warsaw.shadow", f);
  const patrol = track("lantern.patrol", f);
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[4.2, 0.02, LINE.d]} c="#8b8f99" />
      {[-2.2, -1.2, -0.2].map((dx, i) => (
        <House key={i} x={x + dx} z={-0.85} c={["#d8c7a3", "#c9a98a", "#b9c2c9"][i]} lit={lit === i ? 1 : 0} />
      ))}
      {/* universidade com colunas */}
      <group position={[x + 1.2, 0, -0.75]}>
        <Box p={[0, 0.9, 0]} s={[1.6, 1.8, 0.9]} c="#e6dccb" />
        <Box p={[0, 1.9, 0]} s={[1.8, 0.2, 1.0]} c="#cfc2ad" />
        {[-0.6, -0.2, 0.2, 0.6].map((dx) => (
          <mesh key={dx} position={[dx, 0.75, 0.5]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 1.5, 8]} />
            <meshStandardMaterial {...MATTE} color="#f2ebdd" />
          </mesh>
        ))}
      </group>
      {/* portão de grades (fecha) */}
      <group position={[x + 1.2, 0, 0.12]}>
        <Box p={[-0.62, 0.35, 0]} s={[0.08, 0.7, 0.08]} c="#3a3a44" />
        <Box p={[0.62, 0.35, 0]} s={[0.08, 0.7, 0.08]} c="#3a3a44" />
        {Array.from({ length: 6 }, (_, i) => {
          const side = i < 3 ? -1 : 1;
          const k = i % 3;
          const open = side * (0.55 - k * 0.08);
          const closed = side * (0.1 + k * 0.17);
          return <Box key={i} p={[lerp(open, closed, gate), 0.32, 0]} s={[0.03, 0.62, 0.03]} c="#2d2d35" />;
        })}
        {gate > 0.5 ? <Box p={[0, 0.64, 0]} s={[1.24, 0.04, 0.04]} c="#2d2d35" /> : null}
      </group>
      {/* nuvem escura do domínio */}
      {shadow > 0.01
        ? [-1.6, -0.4, 0.8].map((dx, i) => (
            <mesh key={i} position={[x + dx, lerp(4.2, 2.7, shadow) + 0.15 * i, -0.6]} scale={[1.0, 0.4, 0.6]}>
              <icosahedronGeometry args={[1, 0]} />
              <meshStandardMaterial {...MATTE} color="#3a3344" transparent opacity={0.85 * shadow} />
            </mesh>
          ))
        : null}
      {/* lanterna da patrulha (passa e não acha a aula) */}
      {patrol > 0.01 && patrol < 0.99 ? (
        <group position={[x + 1.8 - 4 * patrol, 0.35, 1.0]}>
          <mesh>
            <sphereGeometry args={[0.06, 8, 6]} />
            <meshBasicMaterial color="#fff1b0" />
          </mesh>
          <mesh position={[0, -0.18, 0]}>
            <coneGeometry args={[0.3, 0.36, 12, 1, true]} />
            <meshBasicMaterial color="#fff1b0" transparent opacity={0.18} depthWrite={false} />
          </mesh>
        </group>
      ) : null}
    </group>
  );
};

const Deal: React.FC<{ f: number }> = ({ f }) => {
  const x = X.deal;
  const sister = track("sister.show", f);
  const coins = track("coins.flow", f);
  const arrow = track("arrowBack.show", f);
  const trainX = track("train.x", f, x + 1.8);
  const sisterOnTrain = trainX > x + 2.0;
  const look = personLook("irma-curie");
  const from: Vec3 = [x - 0.6, 0.35, HER_Z];
  const to: Vec3 = [x + 0.6, 0.35, HER_Z];
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[3.8, 0.02, LINE.d]} c="#86ad74" />
      <House x={x - 0.6} z={-0.85} w={1.6} h={1.5} c="#e3d2b5" roof="#6b4b3a" />
      {/* trilho até Paris */}
      <Box p={[(x + 0.2 + X.paris) / 2 - 0.4, 0.03, 1.25]} s={[X.paris - x + 1.6, 0.03, 0.3]} c="#5b4a3a" />
      {sister > 0.01 && !sisterOnTrain ? <Person {...look} hairStyle="bun" dress="#5b6e7a" shirt="#5b6e7a" sleeves="long" seed={7} frame={f} position={[x + 0.6, 0, HER_Z]} rotY={-0.6} scale={PS * clamp(sister, 0, 1)} /> : null}
      {/* moedas: da governanta para a irmã */}
      {coins > 0.01 && coins < 0.99
        ? Array.from({ length: 8 }, (_, i) => {
            const t = (coins * 3 + i / 8) % 1;
            const p: Vec3 = [lerp(from[0], to[0], t), from[1] + Math.sin(t * Math.PI) * 0.45, HER_Z];
            return (
              <mesh key={i} position={p} rotation={[Math.PI / 2, 0, f * 0.2 + i]}>
                <cylinderGeometry args={[0.05, 0.05, 0.015, 12]} />
                <meshStandardMaterial color="#f2c14e" metalness={0.6} roughness={0.3} emissive="#a87a10" emissiveIntensity={0.3} />
              </mesh>
            );
          })
        : null}
      {arrow > 0.01 ? <Arrow3D from={[x + 2.4, 0.9, 0.6]} dir={[-1, 0, 0]} length={2.6 * arrow} radius={0.04} color="#20b85a" /> : null}
      {/* trem */}
      <group position={[trainX, 0.05, 1.25]}>
        <Box p={[0, 0.22, 0]} s={[0.7, 0.34, 0.26]} c="#3d4a5c" />
        <Box p={[0.3, 0.46, 0]} s={[0.12, 0.18, 0.12]} c="#2b2b2e" />
        <Box p={[-0.62, 0.2, 0]} s={[0.5, 0.3, 0.24]} c="#7a5a3c" />
        {[-0.8, -0.45, -0.15, 0.2].map((dx) => (
          <mesh key={dx} position={[dx, 0.05, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.03, 10]} />
            <meshStandardMaterial color="#1d1a22" />
          </mesh>
        ))}
      </group>
    </group>
  );
};

const Paris: React.FC<{ f: number }> = ({ f }) => {
  const x = X.paris;
  const frost = track("attic.frost", f);
  const candle = track("candle.burn", f);
  const dp = track("diploma.physics", f);
  const dm = track("diploma.math", f);
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[4, 0.02, LINE.d]} c="#9a958c" />
      {/* quartinho em corte: piso de madeira, paredes de fundo/laterais, teto inclinado */}
      <group position={[x + 0.3, 0, -0.35]}>
        <Box p={[0, 0.02, 0]} s={[1.9, 0.04, 1.3]} c="#8a6a4a" />
        <Box p={[0, 0.55, -0.62]} s={[1.9, 1.1, 0.06]} c="#cbbfae" />
        <Box p={[-0.94, 0.55, 0]} s={[0.06, 1.1, 1.3]} c="#bfb2a0" />
        <Box p={[0.94, 0.55, 0]} s={[0.06, 1.1, 1.3]} c="#bfb2a0" />
        <Box p={[0, 1.22, -0.25]} s={[2.0, 0.06, 0.95]} c="#6b4b3a" r={[0.45, 0, 0]} />
        {/* janela com gelo */}
        <Box p={[-0.45, 0.72, -0.585]} s={[0.36, 0.3, 0.02]} c={new Color("#2b3a55").lerp(new Color("#dfefff"), frost * 0.7).getStyle()} />
        {/* cama */}
        <Box p={[0.55, 0.1, -0.25]} s={[0.6, 0.12, 0.7]} c="#d9d4c7" />
        <Box p={[0.55, 0.18, -0.52]} s={[0.22, 0.06, 0.14]} c="#f2efe8" />
        {/* escrivaninha + vela */}
        <Box p={[-0.35, 0.24, -0.3]} s={[0.55, 0.04, 0.36]} c="#6b4b3a" />
        {[-0.58, -0.12].map((dx) => <Box key={dx} p={[dx, 0.12, -0.3]} s={[0.04, 0.22, 0.3]} c="#5a3d2b" />)}
        <Box p={[-0.2, 0.3, -0.35]} s={[0.04, 0.08 * (1 - 0.6 * candle), 0.04]} c="#f2ead8" />
        <mesh position={[-0.2, 0.36 - 0.05 * candle, -0.35]}>
          <sphereGeometry args={[0.025, 8, 6]} />
          <meshBasicMaterial color="#ffcf6b" />
        </mesh>
        <pointLight position={[-0.2, 0.42, -0.3]} intensity={0.6} distance={1.6} color="#ffb04a" />
        <Box p={[-0.42, 0.27, -0.28]} s={[0.18, 0.02, 0.13]} c="#f4f0e4" />
        {/* diplomas */}
        {[dp, dm].map((v, i) =>
          v > 0.01 ? (
            <group key={i} position={[-0.15 + i * 0.35, 0.75 + 0.05 * Math.sin(f / 15 + i), 0.15]} scale={clamp(v, 0, 1.2)} rotation={[0, 0, Math.PI / 2]}>
              <mesh castShadow>
                <cylinderGeometry args={[0.05, 0.05, 0.3, 10]} />
                <meshStandardMaterial {...MATTE} color="#f3ead2" />
              </mesh>
              <mesh>
                <cylinderGeometry args={[0.055, 0.055, 0.04, 10]} />
                <meshStandardMaterial color="#c0392b" />
              </mesh>
            </group>
          ) : null,
        )}
      </group>
    </group>
  );
};

/** Ponteiro do eletrômetro: v 0..1 → −60°..+60°. */
const Meter: React.FC<{ p: Vec3; v: number; expected: number }> = ({ p, v, expected }) => (
  <group position={p}>
    <Box p={[0, 0.09, 0]} s={[0.26, 0.18, 0.16]} c="#6b4b3a" />
    <mesh position={[0, 0.24, 0]}>
      <cylinderGeometry args={[0.08, 0.08, 0.14, 12, 1, true]} />
      <meshStandardMaterial color="#cfe8f2" transparent opacity={0.35} />
    </mesh>
    <mesh position={[0, 0.12, 0.082]}>
      <circleGeometry args={[0.1, 20, 0, Math.PI]} />
      <meshBasicMaterial color="#f4efe0" />
    </mesh>
    {expected > 0.01 ? (
      <group position={[0, 0.12, 0.084]} rotation={[0, 0, Math.PI / 3 - 0.45 * (2 * Math.PI) / 3]}>
        <Box p={[0, 0.07, 0]} s={[0.008, 0.06, 0.004]} c="#e5383b" />
      </group>
    ) : null}
    <group position={[0, 0.12, 0.086]} rotation={[0, 0, Math.PI / 3 - clamp(v, 0, 1.1) * ((2 * Math.PI) / 3)]}>
      <Box p={[0, 0.045, 0]} s={[0.006, 0.09, 0.004]} c="#1d1a22" />
    </group>
  </group>
);

const Rays: React.FC<{ p: Vec3; f: number; amount: number; color: string; seed: string; n?: number; spread?: number; up?: number }> = ({ p, f, amount, color, seed, n = 14, spread = 0.5, up = 0.6 }) => {
  if (amount < 0.01) return null;
  return (
    <group>
      {Array.from({ length: n }, (_, i) => {
        const T = 40 + 20 * rand(`${seed}t${i}`);
        const t = (rand(`${seed}p${i}`) + f / T) % 1;
        const a = rand(`${seed}a${i}`) * Math.PI * 2;
        const q: Vec3 = [p[0] + Math.cos(a) * spread * t, p[1] + up * t, p[2] + Math.sin(a) * spread * 0.6 * t];
        return (
          <mesh key={i} position={q}>
            <sphereGeometry args={[0.018, 6, 5]} />
            <meshBasicMaterial color={color} transparent opacity={amount * (1 - t)} depthWrite={false} />
          </mesh>
        );
      })}
    </group>
  );
};

const Lab: React.FC<{ f: number }> = ({ f }) => {
  const x = X.lab;
  const needle = track("meter.needle", f);
  const expected = track("meter.expected", f);
  const urRays = track("uranium.rays", f);
  const plate = track("plate.fog", f);
  const samples = track("samples.show", f);
  const bars = track("samples.bars", f);
  const swap = track("samples.mixSwap", f);
  const atom = track("atom.zoom", f);
  const emit = track("atom.emit", f);
  const ore = track("ore.show", f);
  const crack = track("ore.crack", f);
  const top = 0.27;
  const mixes = ["#f2d36b", "#9fd36b", "#d9a65b"];
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[5, 0.02, LINE.d]} c="#a07c58" />
      {/* bancada */}
      <Box p={[x - 0.4, top - 0.02, -0.15]} s={[2.0, 0.04, 0.5]} c="#7a5634" />
      {[-1.3, 0.5].map((dx) => <Box key={dx} p={[x + dx, top / 2, -0.15]} s={[0.05, top, 0.45]} c="#5a3d2b" />)}
      {/* pedra de urânio + chapa fotográfica */}
      <mesh position={[x - 1.05, top + 0.05, -0.1]} castShadow>
        <icosahedronGeometry args={[0.07, 0]} />
        <meshStandardMaterial {...MATTE} color="#c9c45a" emissive="#9fb33a" emissiveIntensity={0.2 * urRays} />
      </mesh>
      <Box p={[x - 1.05, top + 0.005, 0.04]} s={[0.22, 0.01, 0.12]} c={new Color("#e9e4d8").lerp(new Color("#2a2a30"), plate * 0.75).getStyle()} />
      <Rays p={[x - 1.05, top + 0.05, -0.1]} f={f} amount={urRays} color="#cfe86b" seed="ur" spread={0.25} up={0.3} />
      {/* eletrômetro */}
      <Meter p={[x + 0.15, top, -0.15]} v={needle} expected={expected} />
      {/* 3 amostras (1, 2, 3 doses) com barras */}
      {samples > 0.01
        ? [0, 1, 2].map((i) => {
            const mi = swap > 0.5 ? (i + 1) % 3 : i;
            const sx = x - 0.7 + i * 0.22;
            const h = 0.06 * (i + 1) * bars;
            return (
              <group key={i}>
                <mesh position={[sx, top + 0.05, 0.02]} scale={clamp(samples, 0, 1)}>
                  <cylinderGeometry args={[0.045, 0.045, 0.1, 10]} />
                  <meshStandardMaterial color={mixes[mi]} transparent opacity={0.85} roughness={0.3} />
                </mesh>
                <Box p={[sx, top + 0.12 + h / 2, -0.1]} s={[0.07, Math.max(0.001, h), 0.03]} c="#20b85a" e="#20b85a" ei={0.5} />
              </group>
            );
          })
        : null}
      {/* pechblenda */}
      {ore > 0.01 ? (
        <group position={[x - 1.25, top + 0.07, 0.05]} scale={clamp(ore, 0, 1)}>
          {[-1, 1].map((sgn) => (
            <mesh key={sgn} position={[sgn * 0.05 * crack, 0, 0]} rotation={[0, 0, sgn * 0.3 * crack]} castShadow>
              <icosahedronGeometry args={[0.09, 0]} />
              <meshStandardMaterial {...MATTE} color="#26232b" />
            </mesh>
          ))}
          {crack > 0.2
            ? [
                ["#b6ff6a", -0.02],
                ["#8fd3ff", 0.03],
              ].map(([c, dy], i) => (
                <mesh key={i} position={[0, Number(dy), 0.02]}>
                  <sphereGeometry args={[0.025, 8, 6]} />
                  <meshBasicMaterial color={String(c)} transparent opacity={crack} />
                </mesh>
              ))
            : null}
          <Rays p={[0, 0, 0]} f={f} amount={ore} color="#b6ff6a" seed="pb" spread={0.4} up={0.45} n={22} />
        </group>
      ) : null}
      {/* átomo esquemático acima da bancada */}
      {atom > 0.01 ? (
        <group position={[x, 1.7, 0.4]} scale={atom * 0.9}>
          {Array.from({ length: 9 }, (_, i) => (
            <mesh key={i} position={[(rand(`nx${i}`) - 0.5) * 0.18, (rand(`ny${i}`) - 0.5) * 0.18, (rand(`nz${i}`) - 0.5) * 0.18]}>
              <sphereGeometry args={[0.07, 10, 8]} />
              <meshStandardMaterial {...MATTE} color={i % 2 ? "#e5383b" : "#c4c9d4"} />
            </mesh>
          ))}
          {[0, 1.05, 2.1].map((r, i) => (
            <group key={i} rotation={[1.2, r, 0]}>
              <mesh>
                <torusGeometry args={[0.55, 0.006, 6, 48]} />
                <meshBasicMaterial color="#c4b5fd" transparent opacity={0.6} />
              </mesh>
              <mesh position={[0.55 * Math.cos(f * 0.08 + i * 2), 0.55 * Math.sin(f * 0.08 + i * 2), 0]}>
                <sphereGeometry args={[0.035, 8, 6]} />
                <meshBasicMaterial color="#53d6ff" />
              </mesh>
            </group>
          ))}
          <Rays p={[0, 0, 0]} f={f} amount={emit} color="#b6ff6a" seed="at" spread={1.1} up={0.2} n={18} />
        </group>
      ) : null}
    </group>
  );
};

const Shed: React.FC<{ f: number }> = ({ f }) => {
  const x = X.shed;
  const drips = track("shed.drips", f);
  const pile = track("ore.pile", f, 1);
  const vial = track("vial.glow", f);
  const weigh = track("scale.weigh", f);
  const doubt = track("doubt.show", f);
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[4, 0.02, LINE.d]} c="#7a6650" />
      <group position={[x, 0, -0.4]}>
        <Box p={[0, 0.6, -0.7]} s={[2.4, 1.2, 0.06]} c="#8a6a48" />
        <Box p={[-1.2, 0.6, -0.1]} s={[0.06, 1.2, 1.2]} c="#7d5f40" />
        <Box p={[1.2, 0.6, -0.1]} s={[0.06, 1.2, 1.2]} c="#7d5f40" />
        {/* telhado com frestas */}
        {[-0.9, -0.45, 0.05, 0.5, 0.95].map((dx) => <Box key={dx} p={[dx, 1.26, -0.45]} s={[0.38, 0.04, 0.6]} c="#5e4630" r={[0.12, 0, 0]} />)}
        {/* goteiras */}
        {drips > 0.01
          ? [-0.67, 0.27, 0.72].map((dx, i) => {
              const t = ((f + i * 13) % 26) / 26;
              return (
                <mesh key={i} position={[dx, 1.2 - t * 1.15, -0.1 + i * 0.1]}>
                  <sphereGeometry args={[0.02, 6, 5]} />
                  <meshBasicMaterial color="#7cc0ff" transparent opacity={0.85 * drips} />
                </mesh>
              );
            })
          : null}
        {/* caldeirão com vapor */}
        <mesh position={[-0.55, 0.14, -0.1]} castShadow>
          <cylinderGeometry args={[0.2, 0.15, 0.26, 12]} />
          <meshStandardMaterial {...MATTE} color="#2d2a30" />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const t = ((f + i * 9) % 45) / 45;
          return (
            <mesh key={i} position={[-0.55 + 0.05 * Math.sin(i + f / 20), 0.3 + t * 0.6, -0.1]}>
              <sphereGeometry args={[0.05 + 0.06 * t, 8, 6]} />
              <meshBasicMaterial color="#e9e4f2" transparent opacity={0.35 * (1 - t)} depthWrite={false} />
            </mesh>
          );
        })}
        {/* monte de minério (toneladas → quase nada) */}
        <mesh position={[0.7, 0, -0.3]} scale={[pile, pile, pile]} castShadow>
          <coneGeometry args={[0.45, 0.5, 9]} />
          <meshStandardMaterial {...MATTE} color="#2f2b33" />
        </mesh>
      </group>
      {/* mesinha: frasco + balança */}
      <Box p={[x + 0.5, 0.13, 0.25]} s={[0.6, 0.03, 0.3]} c="#6b4b3a" />
      <Box p={[x + 0.5, 0.06, 0.25]} s={[0.04, 0.12, 0.04]} c="#5a3d2b" />
      {vial > 0.01 ? (
        <group position={[x + 0.68, 0.19, 0.28]}>
          <mesh>
            <cylinderGeometry args={[0.018, 0.018, 0.08, 10]} />
            <meshStandardMaterial color="#d8f1ff" transparent opacity={0.7} emissive="#8fd3ff" emissiveIntensity={0.8 * vial} />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.09, 12, 10]} />
            <meshBasicMaterial color="#8fd3ff" transparent opacity={0.22 * clamp(vial, 0, 1)} depthWrite={false} />
          </mesh>
          <pointLight intensity={0.5 * vial} distance={1.2} color="#8fd3ff" />
        </group>
      ) : null}
      <group position={[x + 0.36, 0.15, 0.25]}>
        <Box p={[0, 0.08, 0]} s={[0.02, 0.16, 0.02]} c="#b08d57" />
        <group position={[0, 0.16, 0]} rotation={[0, 0, -0.25 * weigh]}>
          <Box p={[0, 0, 0]} s={[0.24, 0.012, 0.012]} c="#b08d57" />
          {[-0.11, 0.11].map((dx) => <Box key={dx} p={[dx, -0.04, 0]} s={[0.07, 0.008, 0.07]} c="#c9a96a" />)}
        </group>
      </group>
      {/* químicos desconfiados (silhuetas na frente) */}
      {doubt > 0.01
        ? [0, 1].map((i) => <Person key={i} {...personLook(`quim${i}`)} seed={20 + i} frame={f} position={[x - 1.6 + i * 0.4, 0, 1.15]} rotY={Math.PI * 0.85} scale={PS * clamp(doubt, 0, 1)} />)
        : null}
    </group>
  );
};

const Medal: React.FC<{ p: Vec3; s: number; f: number; c?: string }> = ({ p, s, f, c = "#f2c14e" }) =>
  s > 0.01 ? (
    <group position={p} scale={clamp(s, 0, 1.2)} rotation={[0, Math.sin(f / 30) * 0.4, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.025, 24]} />
        <meshStandardMaterial color={c} metalness={0.7} roughness={0.25} emissive="#a87a10" emissiveIntensity={0.25} />
      </mesh>
      <Box p={[0, 0.18, -0.01]} s={[0.05, 0.22, 0.01]} c="#2f6db3" />
    </group>
  ) : null;

const Stage: React.FC<{ f: number }> = ({ f }) => {
  const x = X.stage;
  const m3 = track("medal.1903", f);
  const m11 = track("medal.1911", f);
  const pair = track("medals.pair", f);
  const chalk = track("chalk.write", f);
  const dim = track("stage.dim", f);
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[4, 0.02, LINE.d]} c={new Color("#8e2f3a").lerp(new Color("#2a1a22"), dim).getStyle()} />
      {/* pódio de 3 lugares */}
      <group position={[x - 0.4, 0, -0.6]}>
        <Box p={[0, 0.15, 0]} s={[0.45, 0.3, 0.45]} c="#e8e1d2" />
        <Box p={[-0.47, 0.1, 0]} s={[0.45, 0.2, 0.45]} c="#d9d0bd" />
        <Box p={[0.47, 0.07, 0]} s={[0.45, 0.14, 0.45]} c="#d9d0bd" />
      </group>
      <Medal p={[x - 0.4 - 0.18 * pair, 0.95, -0.4]} s={m3} f={f} />
      <Medal p={[x - 0.4 + 0.18 * pair, 0.95, -0.4]} s={m11} f={f + 40} c="#f6d36b" />
      {/* púlpito + quadro-negro (Sorbonne) */}
      <group position={[x + 1.0, 0, -0.75]}>
        <Box p={[0, 0.55, -0.15]} s={[1.0, 0.6, 0.04]} c="#23302a" />
        {Array.from({ length: 4 }, (_, i) =>
          chalk > i / 4 ? <Box key={i} p={[-0.3 + (i % 2) * 0.35, 0.72 - Math.floor(i / 2) * 0.18, -0.125]} s={[0.25 * clamp(chalk * 4 - i, 0, 1), 0.012, 0.004]} c="#f4f0e4" /> : null,
        )}
        <Box p={[0.1, 0.17, 0.25]} s={[0.26, 0.34, 0.2]} c="#6b4b3a" />
      </group>
    </group>
  );
};

const War: React.FC<{ f: number }> = ({ f }) => {
  const x = X.war;
  const carX = track("car.x", f, x + 2.2);
  const beam = track("xray.beam", f);
  return (
    <group>
      <Box p={[x, 0.01, 0]} s={[3.6, 0.02, LINE.d]} c="#6d6450" />
      {/* carro com raio X */}
      <group position={[carX, 0, -0.35]}>
        <Box p={[0, 0.32, 0]} s={[1.2, 0.46, 0.55]} c="#6f7a6a" />
        <Box p={[0.66, 0.24, 0]} s={[0.24, 0.3, 0.5]} c="#5d6858" />
        <Box p={[0.68, 0.36, 0]} s={[0.12, 0.12, 0.44]} c="#2b3a55" />
        {[-0.38, 0.45].map((dx) => (
          <mesh key={dx} position={[dx, 0.1, 0.29]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.1, 0.1, 0.06, 14]} />
            <meshStandardMaterial color="#1d1a22" />
          </mesh>
        ))}
        <Box p={[-0.3, 0.62, 0]} s={[0.3, 0.14, 0.2]} c="#c4c9d4" />
      </group>
      {/* maca + soldado */}
      <Box p={[x - 0.2, 0.12, 0.45]} s={[0.62, 0.04, 0.22]} c="#d9d4c7" />
      {[-0.45, 0.05].map((dx) => <Box key={dx} p={[x + dx, 0.06, 0.45]} s={[0.03, 0.12, 0.2]} c="#5a5652" />)}
      <group position={[x - 0.48, 0.15, 0.45]} rotation={[0, 0, -Math.PI / 2]}>
        <Person {...personLook("soldado")} shirt="#5d6b7a" pants="#4a5868" sleeves="long" seed={30} frame={f} position={[0, 0, 0]} scale={PS} />
      </group>
      {/* feixe de raio X do carro até a perna */}
      {beam > 0.01 ? (
        <mesh position={[x + 0.05, 0.4, 0.2]} rotation={[0, 0, 0.9]}>
          <coneGeometry args={[0.18, 0.7 * beam, 12, 1, true]} />
          <meshBasicMaterial color="#8fd3ff" transparent opacity={0.25} depthWrite={false} />
        </mesh>
      ) : null}
    </group>
  );
};

const Vault: React.FC<{ f: number }> = ({ f }) => {
  const x = X.vault;
  const lid = track("box.lid", f);
  const rad = track("notebooks.radiation", f);
  const g = track("geiger.needle", f);
  return (
    <group>
      <Box p={[x + 0.6, 0.01, 0]} s={[4.6, 0.02, LINE.d]} c="#3b3546" />
      {/* estantes da biblioteca */}
      {[-1.2, 0, 1.2].map((dx, j) => (
        <group key={dx} position={[x + 0.6 + dx, 0, -1.2]}>
          <Box p={[0, 0.8, 0]} s={[1.1, 1.6, 0.3]} c="#4a3426" />
          {[0.35, 0.75, 1.15].map((y) =>
            Array.from({ length: 9 }, (_, i) => (
              <Box key={`${y}-${i}`} p={[-0.45 + i * 0.11, y + 0.12, 0.08]} s={[0.08, 0.22 + 0.05 * rand(`bk${j}${y}${i}`), 0.18]} c={["#7a2e2e", "#2e4a7a", "#5b4636", "#3e6b4a", "#8a6a2e"][(i + j) % 5]} />
            )),
          )}
        </group>
      ))}
      {/* mesa com a caixa de chumbo e o Geiger */}
      <Box p={[x, 0.25, 0.1]} s={[1.2, 0.04, 0.6]} c="#5a3d2b" />
      {[-0.55, 0.55].map((dx) => <Box key={dx} p={[x + dx, 0.12, 0.1]} s={[0.05, 0.24, 0.5]} c="#4a3226" />)}
      <group position={[x - 0.15, 0.27, 0.12]}>
        <Box p={[0, 0.07, 0]} s={[0.46, 0.14, 0.32]} c="#7d8592" />
        {[-0.12, 0, 0.12].map((dx, i) => <Box key={dx} p={[dx, 0.13, 0]} s={[0.1, 0.02 + 0.01 * i, 0.22]} c={["#d9c9a3", "#c9b48a", "#e3d6b8"][i]} />)}
        <group position={[0, 0.14, -0.16]} rotation={[-1.9 * lid, 0, 0]}>
          <Box p={[0, 0.01, 0.16]} s={[0.48, 0.03, 0.33]} c="#8a929e" />
        </group>
        <Rays p={[0, 0.16, 0]} f={f} amount={rad} color="#b6ff6a" seed="nb" spread={0.3} up={0.5} n={20} />
      </group>
      <group position={[x + 0.38, 0.27, 0.15]}>
        <Box p={[0, 0.07, 0]} s={[0.2, 0.14, 0.12]} c="#e0b84a" />
        <mesh position={[0, 0.09, 0.062]}>
          <circleGeometry args={[0.06, 16, 0, Math.PI]} />
          <meshBasicMaterial color="#f4efe0" />
        </mesh>
        <group position={[0, 0.09, 0.064]} rotation={[0, 0, Math.PI / 2 - clamp(g + 0.05 * Math.sin(f * 1.7) * g, 0, 1) * Math.PI]}>
          <Box p={[0, 0.025, 0]} s={[0.005, 0.05, 0.003]} c="#1d1a22" />
        </group>
      </group>
    </group>
  );
};

// ---------------------------------------------------------------- personagens
const Her: React.FC<{ f: number }> = ({ f }) => {
  const reveal = track("her.reveal", f);
  const spot = track("her.spot", f);
  const x = track("her.x", f, X.vault + 0.75);
  const walk = track("her.walk", f);
  const look = track("her.look", f);
  // rumo: de lado quando anda (para onde está indo), quase de frente parada
  const dx = track("her.x", f + 1, X.vault + 0.75) - track("her.x", f - 1, X.vault + 0.75);
  const rot = walk > 0.3 ? (dx >= 0 ? Math.PI / 2 : -Math.PI / 2) : -0.2;
  return (
    <group>
      <Person
        frame={f}
        seed={1}
        position={[x, 0, HER_Z]}
        rotY={rot}
        scale={PS}
        walk={walk}
        look={-0.6 * look}
        skin={sil("#efcfb4", reveal)}
        hair={sil("#7a5a3e", reveal)}
        hairStyle="bun"
        shirt={sil("#2b2433", reveal)}
        sleeves="long"
        dress={sil("#241e2c", reveal)}
        shoes={sil("#1d1a22", reveal)}
      />
      {/* luz de recorte sobre ela (o "palco" do mistério) */}
      <pointLight position={[x + 0.3, 0.9, HER_Z + 0.6]} intensity={1.2 * spot + 1.6 * reveal} distance={2.4} color={reveal > 0.5 ? "#fff2e2" : "#a78bfa"} />
    </group>
  );
};

const Husband: React.FC<{ f: number }> = ({ f }) => {
  const show = track("husband.show", f);
  const fade = track("husband.fade", f);
  const x = track("husband.x", f, X.lab - 0.1);
  const k = clamp(show, 0, 1) * (1 - fade);
  if (k < 0.01) return null;
  const c = (hex: string) => sil(hex, 1 - fade);
  return <Person frame={f} seed={2} position={[x, 0, -0.55]} rotY={0.1} scale={PS * (0.85 + 0.15 * k)} skin={c("#e9c3a3")} hair={c("#3b2a22")} shirt={c("#2f3540")} sleeves="long" pants={c("#262a33")} shoes={c("#1d1a22")} />;
};

export const World: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <group>
      {/* pedestal da linha do tempo */}
      <Box p={[(LINE.x0 + LINE.x1) / 2, -0.3, 0]} s={[LINE.x1 - LINE.x0, 0.6, LINE.d]} c="#5b4a3e" />
      <group position={[(LINE.x0 + LINE.x1) / 2, 0, 0]}>
        <BrandPedestal width={LINE.x1 - LINE.x0} depth={LINE.d} y={-0.6} />
      </group>
      <Warsaw f={f} />
      <Deal f={f} />
      <Paris f={f} />
      <Lab f={f} />
      <Shed f={f} />
      <Stage f={f} />
      <War f={f} />
      <Vault f={f} />
      <Husband f={f} />
      <Her f={f} />
    </group>
  );
};
