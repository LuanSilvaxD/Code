import { useMemo } from "react";
import { BufferGeometry, Color, DoubleSide, Float32BufferAttribute } from "three";
import { useCurrentFrame } from "remotion";
import { isVisible, sceneAt, track } from "../data/scenes";
import { MATTE, PALETTE } from "../theme";
import { clamp, lerp, pulse, rand, smoothstep, type Vec3 } from "../utils/animation";
import {
  BASE_Y, baseFloor, chop, crest, depthAt, floorY, SHIP_X, surfaceY, upliftShape, waveAmp, waveWidth, X_MAX, X_MIN, Z_HALF,
} from "../world/ocean";
import { Arrow3D } from "./Arrow3D";

// Cenário persistente: um perfil do oceano em corte, do mar aberto até a costa.
// Tudo lê as trilhas no frame GLOBAL (track), então nada pula entre cortes; só a câmera se move.

const NX = 340;
const xs = Array.from({ length: NX }, (_, i) => X_MIN + ((X_MAX - X_MIN) * i) / (NX - 1));

const tmp = new Color();
const floorColor = (x: number, y: number) => {
  if (y > 1.0) return "#5e9a47"; // morro
  if (x > 25.3) return "#7fb85c"; // terra/grama
  if (x > 21.4) return "#ecd8a0"; // praia
  if (x > 11.5) return "#d2bd86"; // plataforma arenosa
  if (x > 5.5) return "#9a9a86"; // talude
  return "#68788a"; // planície abissal
};

/** Topo do fundo + face de corte (z = +Z_HALF) até a base do diorama. */
const useSeafloor = (frame: number) => {
  const uplift = track("seafloor.uplift", frame);
  const glow = track("seafloor.slopeGlow", frame);
  return useMemo(() => {
    const pos: number[] = [];
    const col: number[] = [];
    const push = (p: Vec3, c: Color) => {
      pos.push(...p);
      col.push(c.r, c.g, c.b);
    };
    for (let i = 0; i < NX - 1; i++) {
      const x0 = xs[i];
      const x1 = xs[i + 1];
      const y0 = baseFloor(x0) + uplift * upliftShape(x0);
      const y1 = baseFloor(x1) + uplift * upliftShape(x1);
      const xm = (x0 + x1) / 2;
      const top = tmp.set(floorColor(xm, (y0 + y1) / 2)).clone();
      if (glow > 0 && xm > 5.5 && xm < 22) top.lerp(new Color("#f2e36b"), 0.55 * glow * (0.7 + 0.3 * pulse(frame, 24)));
      // topo (dois triângulos)
      push([x0, y0, -Z_HALF], top); push([x0, y0, Z_HALF], top); push([x1, y1, Z_HALF], top);
      push([x0, y0, -Z_HALF], top); push([x1, y1, Z_HALF], top); push([x1, y1, -Z_HALF], top);
      // face de corte: rocha em camadas (cor por profundidade)
      const bands: [number, string][] = [
        [-0.0, "#8a6a4e"],
        [-1.2, "#7a5b44"],
        [-2.6, "#6a4f3c"],
        [-99, "#5a4334"],
      ];
      const yTop0 = y0;
      const yTop1 = y1;
      const levels = [Math.max(yTop0, yTop1) + 0.001, -0.6, -2.0, -4.8, BASE_Y];
      for (let b = 0; b < levels.length - 1; b++) {
        const hiA = Math.min(yTop0, levels[b]);
        const hiB = Math.min(yTop1, levels[b]);
        const lo = levels[b + 1];
        if (hiA <= lo && hiB <= lo) continue;
        const c = tmp.set(bands[Math.min(b, bands.length - 1)][1]).clone();
        const a0 = Math.max(hiA, lo);
        const a1 = Math.max(hiB, lo);
        push([x0, a0, Z_HALF], c); push([x0, lo, Z_HALF], c); push([x1, lo, Z_HALF], c);
        push([x0, a0, Z_HALF], c); push([x1, lo, Z_HALF], c); push([x1, a1, Z_HALF], c);
      }
    }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    g.setAttribute("color", new Float32BufferAttribute(col, 3));
    g.computeVertexNormals();
    return g;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uplift, glow > 0 ? frame : -1]);
};

/** Água: superfície (com marolas) + face de corte translúcida, só onde a água fica acima do fundo. */
const useWater = (frame: number) =>
  useMemo(() => {
    const top: number[] = [];
    const front: number[] = [];
    const NZ = 6;
    for (let i = 0; i < NX - 1; i++) {
      const x0 = xs[i];
      const x1 = xs[i + 1];
      const s0 = surfaceY(x0, frame);
      const s1 = surfaceY(x1, frame);
      const f0 = floorY(x0, frame);
      const f1 = floorY(x1, frame);
      if (s0 <= f0 + 0.004 && s1 <= f1 + 0.004) continue;
      const w0 = Math.max(s0, f0);
      const w1 = Math.max(s1, f1);
      for (let k = 0; k < NZ - 1; k++) {
        const z0 = -Z_HALF + (2 * Z_HALF * k) / (NZ - 1);
        const z1 = -Z_HALF + (2 * Z_HALF * (k + 1)) / (NZ - 1);
        const a = w0 + chop(x0, z0, frame);
        const b = w0 + chop(x0, z1, frame);
        const c = w1 + chop(x1, z1, frame);
        const d = w1 + chop(x1, z0, frame);
        top.push(x0, a, z0, x0, b, z1, x1, c, z1, x0, a, z0, x1, c, z1, x1, d, z0);
      }
      const e0 = w0 + chop(x0, Z_HALF, frame);
      const e1 = w1 + chop(x1, Z_HALF, frame);
      front.push(x0, e0, Z_HALF, x0, f0, Z_HALF, x1, f1, Z_HALF, x0, e0, Z_HALF, x1, f1, Z_HALF, x1, e1, Z_HALF);
    }
    const gt = new BufferGeometry();
    gt.setAttribute("position", new Float32BufferAttribute(top, 3));
    gt.computeVertexNormals();
    const gf = new BufferGeometry();
    gf.setAttribute("position", new Float32BufferAttribute(front, 3));
    gf.computeVertexNormals();
    return { gt, gf };
  }, [frame]);

// ---------------------------------------------------------------- placas tectônicas (face de corte)
const shapeGeom = (pts: [number, number][], z: number) => {
  // polígono convexo-ish em leque a partir do centroide
  const cx = pts.reduce((a, p) => a + p[0], 0) / pts.length;
  const cy = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const pos: number[] = [];
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    pos.push(cx, cy, z, a[0], a[1], z, b[0], b[1], z);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return g;
};

const Plates: React.FC<{ frame: number }> = ({ frame }) => {
  const strain = track("plates.strain", frame);
  const slip = clamp(track("plates.slip", frame), 0, 1.3);
  const uplift = track("seafloor.uplift", frame);
  // placa de cima: a ponta é puxada para baixo (tensão) e depois salta para cima
  const tipDrop = -0.22 * strain * (1 - clamp(slip, 0, 1));
  const geo = useMemo(() => {
    const z = Z_HALF + 0.02;
    const oceanic = shapeGeom(
      [
        [-34, -4.6], [-24.2, -5.15], [-17, -6.6], [-12, -7.35], [-15.5, -7.35], [-24.5, -6.0], [-34, -5.5],
      ],
      z,
    );
    const yUp = (x: number) => baseFloor(x) + uplift * upliftShape(x) + tipDrop * smoothstep((x + 14) / -10);
    const cont: [number, number][] = [];
    for (let x = -23.9; x <= -8; x += 0.8) cont.push([x, yUp(x) - 0.05]);
    cont.push([-8, -5.2], [-12, -7.25], [-17, -6.55]);
    const continental = shapeGeom(cont, z + 0.005);
    return { oceanic, continental };
  }, [uplift, tipDrop]);
  const flash = clamp(1 - Math.abs(slip - 0.5) * 2, 0, 1) * (slip > 0.01 ? 1 : 0);
  return (
    <group>
      <mesh geometry={geo.oceanic}>
        <meshStandardMaterial {...MATTE} color="#3b4f6b" side={DoubleSide} />
      </mesh>
      <mesh geometry={geo.continental}>
        <meshStandardMaterial {...MATTE} color="#d08a4a" side={DoubleSide} emissive="#ff7a3c" emissiveIntensity={0.5 * flash + 0.25 * strain * (1 - clamp(slip, 0, 1)) * pulse(frame, 10)} />
      </mesh>
      {/* linha da falha */}
      {Array.from({ length: 12 }, (_, i) => {
        const t = i / 11;
        const x = lerp(-24.0, -12.4, t);
        const y = lerp(-5.1, -7.2, t);
        return (
          <mesh key={i} position={[x, y, Z_HALF + 0.04]} rotation={[0, 0, -0.18]}>
            <boxGeometry args={[0.55, 0.07, 0.02]} />
            <meshBasicMaterial color={strain > 0.05 || slip > 0.02 ? "#ff4b3e" : "#e9d7c0"} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- navio
const Ship: React.FC<{ frame: number }> = ({ frame }) => {
  const y = surfaceY(SHIP_X, frame);
  const yB = surfaceY(SHIP_X - 0.9, frame);
  const yF = surfaceY(SHIP_X + 0.9, frame);
  const rock = track("ship.rockAmp", frame);
  const pitch = Math.atan2(yF - yB, 1.8) + rock * 0.025 * Math.sin(frame / 11);
  const roll = rock * 0.03 * Math.sin(frame / 14 + 0.6);
  const bob = rock * 0.025 * Math.sin(frame / 9);
  return (
    <group position={[SHIP_X, y + bob + 0.02, 0.2]} rotation={[roll, 0, pitch]}>
      <mesh position={[0, 0.12, 0]} castShadow>
        <boxGeometry args={[2.0, 0.26, 0.55]} />
        <meshStandardMaterial {...MATTE} color="#c0392b" />
      </mesh>
      <mesh position={[0, 0.32, 0]} castShadow>
        <boxGeometry args={[2.05, 0.16, 0.58]} />
        <meshStandardMaterial {...MATTE} color="#22303f" />
      </mesh>
      <mesh position={[1.17, 0.22, 0]} rotation={[Math.PI / 4, 0, -Math.PI / 2]} scale={[1, 1, 0.75]} castShadow>
        <coneGeometry args={[0.3, 0.36, 4]} />
        <meshStandardMaterial {...MATTE} color="#22303f" />
      </mesh>
      <mesh position={[-0.65, 0.62, 0]} castShadow>
        <boxGeometry args={[0.5, 0.44, 0.48]} />
        <meshStandardMaterial {...MATTE} color="#f2f2ee" />
      </mesh>
      <mesh position={[-0.65, 0.95, 0]} castShadow>
        <cylinderGeometry args={[0.07, 0.07, 0.3, 6]} />
        <meshStandardMaterial {...MATTE} color="#e3a52a" />
      </mesh>
      {[0.0, 0.42, 0.84].map((cx, i) => (
        <mesh key={i} position={[cx - 0.1, 0.54, 0]} castShadow>
          <boxGeometry args={[0.36, 0.28, 0.44]} />
          <meshStandardMaterial {...MATTE} color={["#2f7df6", "#f8c815", "#20b85a"][i]} />
        </mesh>
      ))}
    </group>
  );
};

// ---------------------------------------------------------------- costa: casas, árvores, morro, pessoas
const HOUSES: [number, number, number, string][] = [
  [26.2, -0.9, 0.55, "#f4e3c1"], [27.3, 0.4, 0.7, "#e8c39e"], [28.4, -0.5, 0.6, "#f6efe2"], [26.8, 1.2, 0.5, "#d9b38c"], [29.3, 0.9, 0.65, "#efe1c6"], [28.9, -1.4, 0.5, "#e8c39e"],
];
const TREES: [number, number][] = [[25.6, 1.5], [30.2, -1.1], [31.6, 0.8], [32.6, -0.9], [33.4, 0.6], [24.8, -1.4], [30.0, 1.5]];

const Coast: React.FC<{ frame: number }> = ({ frame }) => (
  <group>
    {HOUSES.map(([x, z, h, c], i) => {
      const y = baseFloor(x);
      return (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, h / 2, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.7, h, 0.62]} />
            <meshStandardMaterial {...MATTE} color={c} />
          </mesh>
          <mesh position={[0, h + 0.17, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
            <coneGeometry args={[0.56, 0.36, 4]} />
            <meshStandardMaterial {...MATTE} color="#c0533a" />
          </mesh>
        </group>
      );
    })}
    {TREES.map(([x, z], i) => {
      const y = baseFloor(x);
      return (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.18, 0]} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 0.36, 5]} />
            <meshStandardMaterial {...MATTE} color="#7a5634" />
          </mesh>
          <mesh position={[0, 0.55, 0]} castShadow>
            <icosahedronGeometry args={[0.3, 0]} />
            <meshStandardMaterial {...MATTE} color={i % 2 ? "#3f8a3a" : "#4f9d42"} />
          </mesh>
        </group>
      );
    })}
    {/* coqueirinhos na praia */}
    {[23.6, 24.6].map((x, i) => (
      <group key={i} position={[x, baseFloor(x), -1.5 + i * 0.4]}>
        <mesh position={[0, 0.35, 0]} rotation={[0, 0, 0.15]}>
          <cylinderGeometry args={[0.04, 0.06, 0.7, 5]} />
          <meshStandardMaterial {...MATTE} color="#9b7448" />
        </mesh>
        <mesh position={[0.06, 0.72, 0]}>
          <coneGeometry args={[0.34, 0.16, 6]} />
          <meshStandardMaterial {...MATTE} color="#3f9a3f" />
        </mesh>
      </group>
    ))}
    <EvacRoute frame={frame} />
  </group>
);

const routePoint = (t: number): Vec3 => {
  const x = lerp(24.3, 33.2, t);
  return [x, baseFloor(x) + 0.02, lerp(0.9, 0.2, t)];
};

const EvacRoute: React.FC<{ frame: number }> = ({ frame }) => {
  const show = clamp(track("evacRoute.show", frame), 0, 1.2);
  const people = clamp(track("evacRoute.people", frame), 0, 1);
  if (show <= 0.001) return null;
  return (
    <group>
      {Array.from({ length: 9 }, (_, i) => {
        const t = (i + 0.5) / 9;
        const a = routePoint(t);
        const b = routePoint(t + 0.04);
        const dir: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
        const k = clamp(show * 9 - i, 0, 1);
        return <Arrow3D key={i} from={[a[0], a[1] + 0.12, a[2]]} dir={dir} length={0.55} radius={0.05} color={PALETTE.positive} scale={k} emissive={0.55} />;
      })}
      {Array.from({ length: 5 }, (_, i) => {
        const t = clamp(people * 1.05 - i * 0.06, 0, 1) * 0.95 + 0.02;
        const p = routePoint(t);
        const step = Math.abs(Math.sin(frame / 3 + i));
        return (
          <group key={`p${i}`} position={[p[0], p[1] + 0.05 * step, p[2] - 0.35 + (i % 2) * 0.5]}>
            <mesh position={[0, 0.2, 0]}>
              <capsuleGeometry args={[0.07, 0.2, 2, 6]} />
              <meshStandardMaterial {...MATTE} color={["#f8c815", "#2f7df6", "#e5383b", "#ffffff", "#20b85a"][i]} />
            </mesh>
            <mesh position={[0, 0.43, 0]}>
              <sphereGeometry args={[0.07, 6, 5]} />
              <meshStandardMaterial {...MATTE} color="#f1c9a5" />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- partículas da coluna d'água
const COLS = 30;
const ROWS = 6;
const ColumnParticles: React.FC<{ frame: number }> = ({ frame }) => {
  const show = clamp(track("columnParticles.show", frame), 0, 1);
  const lift = clamp(track("columnParticles.lift", frame), 0, 1);
  const sway = clamp(track("columnParticles.sway", frame), 0, 1);
  if (show <= 0.001 || !isVisible("columnParticles", frame)) return null;
  const c = crest(frame);
  const A = waveAmp(depthAt(c.x));
  const uplift = track("seafloor.uplift", frame);
  const out: React.ReactNode[] = [];
  for (let i = 0; i < COLS; i++) {
    const x0 = -25 + (31 * (i + 0.5)) / COLS;
    const fl = floorY(x0, frame);
    const eta = surfaceY(x0, frame);
    // movimento horizontal igual do fundo à superfície, proporcional à elevação local (onda longa)
    const dx = sway * 1.2 * (A > 0 ? eta / Math.max(0.05, A) : 0) * 0.55;
    for (let r = 0; r < ROWS; r++) {
      const t = (r + 0.5) / ROWS;
      const yBase = lerp(baseFloor(x0) + 0.2, -0.25, t);
      const yLift = lift * uplift * upliftShape(x0) * 1.0 * (1 - 0.3 * t);
      const y = clamp(yBase + yLift, fl + 0.1, eta - 0.12);
      const a = show * (0.75 + 0.25 * rand(`cp${i}-${r}`));
      out.push(
        <mesh key={`${i}-${r}`} position={[x0 + dx, y, Z_HALF + 0.06]} scale={a}>
          <sphereGeometry args={[0.085, 6, 5]} />
          <meshBasicMaterial color="#dff8ff" transparent opacity={0.85} />
        </mesh>,
      );
    }
  }
  return <group>{out}</group>;
};

// ---------------------------------------------------------------- setas de soerguimento, velocidade, fluxo
const LiftArrows: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("liftArrows.show", frame), 0, 1);
  if (k <= 0.001 || sceneAt(frame).id !== "scene-04-coluna-sobe") return null;
  return (
    <group>
      {[-21.5, -19.2, -16.9].map((x, i) => (
        <Arrow3D key={i} from={[x, -3.4 + 0.6 * k, Z_HALF + 0.12]} dir={[0, 1, 0]} length={1.5} radius={0.11} color={PALETTE.positive} scale={k} />
      ))}
    </group>
  );
};

const SpeedArrows: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("speedArrows.show", frame), 0, 1.2);
  const conv = clamp(track("speedArrows.converge", frame), 0, 1);
  if (k <= 0.001) return null;
  const c = crest(frame);
  const fx = c.x + c.L * 0.55;
  const bx = c.x - c.L * lerp(1.7, 0.85, conv);
  return (
    <group>
      <Arrow3D from={[fx, surfaceY(fx, frame) + 0.55, 0.4]} dir={[1, 0, 0]} length={0.55} radius={0.09} color={PALETTE.negative} scale={k} />
      <Arrow3D from={[bx, surfaceY(bx, frame) + 0.55, 0.4]} dir={[1, 0, 0]} length={lerp(1.7, 1.25, conv)} radius={0.09} color={PALETTE.positive} scale={k} />
    </group>
  );
};

const FlowArrows: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("flowArrows.show", frame), 0, 1);
  if (k <= 0.001) return null;
  return (
    <group>
      {[[24.6, 0.9], [26.4, -0.2], [28.0, 1.1], [27.2, -1.3]].map(([x, z], i) => {
        const drift = ((frame / 30 + i * 0.37) % 1) * 0.5;
        return <Arrow3D key={i} from={[x + drift, surfaceY(x, frame) + 0.18, z]} dir={[1, 0, 0]} length={0.85} radius={0.07} color="#e9fbff" scale={k} emissive={0.6} />;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- avião e linhas de velocidade
const Airplane: React.FC<{ frame: number }> = ({ frame }) => {
  const e = clamp(track("airplane.enter", frame), 0, 1);
  if (e <= 0.001) return null;
  const c = crest(frame);
  const leaving = sceneAt(frame).id === "scene-09-frente-freia";
  const x = c.x + (leaving ? 6 * (1 - e) : -7 * (1 - e)) + 0.3;
  const y = 2.6 + (leaving ? 2.2 * (1 - e) : 0);
  return (
    <group position={[x, y, 0.4]} scale={0.95}>
      <mesh rotation={[0, 0, Math.PI / 2]} castShadow>
        <cylinderGeometry args={[0.14, 0.1, 1.7, 7]} />
        <meshStandardMaterial {...MATTE} color="#f4f6f8" />
      </mesh>
      <mesh position={[0.92, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.14, 0.3, 7]} />
        <meshStandardMaterial {...MATTE} color="#f4f6f8" />
      </mesh>
      <mesh position={[0.05, 0, 0]}>
        <boxGeometry args={[0.42, 0.04, 1.9]} />
        <meshStandardMaterial {...MATTE} color="#2f7df6" />
      </mesh>
      <mesh position={[-0.72, 0.2, 0]}>
        <boxGeometry args={[0.24, 0.36, 0.04]} />
        <meshStandardMaterial {...MATTE} color="#2f7df6" />
      </mesh>
      <mesh position={[-0.72, 0.03, 0]}>
        <boxGeometry args={[0.2, 0.03, 0.7]} />
        <meshStandardMaterial {...MATTE} color="#2f7df6" />
      </mesh>
    </group>
  );
};

const SpeedLines: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("speedLines.show", frame), 0, 1);
  if (k <= 0.001) return null;
  const c = crest(frame);
  return (
    <group>
      {Array.from({ length: 14 }, (_, i) => {
        const ph = ((frame * 0.07 + rand(`sl${i}`)) % 1);
        const x = c.x - 1 - ph * 7;
        const z = lerp(-1.6, 1.6, rand(`slz${i}`));
        const y = surfaceY(x, frame) + 0.12 + 0.5 * rand(`sly${i}`);
        return (
          <mesh key={i} position={[x, y, z]} scale={[k * (1 - ph), 1, 1]}>
            <boxGeometry args={[1.1, 0.03, 0.03]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={0.7 * (1 - ph)} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- guias: profundidade, largura, empilhamento, energia
const DepthGuide: React.FC<{ frame: number }> = ({ frame }) => {
  const hl = clamp(track("depthGuide.highlight", frame), 0, 1);
  const sh = clamp(track("depthGuide.shallow", frame), 0, 1);
  const id = sceneAt(frame).id;
  const show = ["scene-03-terremoto", "scene-04-coluna-sobe", "scene-05-baixa-e-larga", "scene-07-oceano-inteiro", "scene-08-velocidade-aviao", "scene-09-frente-freia"].includes(id);
  if (!show) return null;
  const tick = (x: number, y0: number, y1: number, color: string, w: number) => (
    <group>
      <mesh position={[x, (y0 + y1) / 2, Z_HALF + 0.1]}>
        <boxGeometry args={[w, Math.abs(y1 - y0), 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[x, y0, Z_HALF + 0.1]}>
        <boxGeometry args={[0.5, w, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={[x, y1, Z_HALF + 0.1]}>
        <boxGeometry args={[0.5, w, 0.02]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </group>
  );
  return (
    <group>
      {tick(-1.5, 0, -4.2, hl > 0.05 ? "#f8c815" : "#ffffff", 0.06 + 0.05 * hl)}
      {sh > 0.01 ? tick(16, 0, baseFloor(16), "#f8c815", 0.08) : null}
    </group>
  );
};

const WidthSpan: React.FC<{ frame: number }> = ({ frame }) => {
  const g = clamp(track("widthSpan.grow", frame), 0, 1);
  if (g <= 0.001 || sceneAt(frame).id !== "scene-05-baixa-e-larga") return null;
  const c = crest(frame);
  const half = c.L * 2.3 * g;
  const y = c.y + 0.75;
  return (
    <group>
      <mesh position={[c.x, y, 0.3]}>
        <boxGeometry args={[half * 2, 0.06, 0.06]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <Arrow3D from={[c.x + half - 0.4, y, 0.3]} dir={[1, 0, 0]} length={0.45} radius={0.05} color="#ffffff" />
      <Arrow3D from={[c.x - half + 0.4, y, 0.3]} dir={[-1, 0, 0]} length={0.45} radius={0.05} color="#ffffff" />
    </group>
  );
};

const PileUp: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("pileUp.show", frame), 0, 1);
  const id = sceneAt(frame).id;
  if (k <= 0.001 || (id !== "scene-10-agua-se-empilha" && id !== "scene-11-encurta-cresce")) return null;
  const c = crest(frame);
  return (
    <group>
      {Array.from({ length: 18 }, (_, i) => {
        const ph = (frame / 40 + rand(`pu${i}`)) % 1;
        const x = c.x - c.L * 2.4 * (1 - ph);
        const y = surfaceY(x, frame) * lerp(0.4, 0.95, ph) - 0.05;
        return (
          <mesh key={i} position={[x, y, Z_HALF + 0.06]} scale={k * (0.6 + 0.6 * ph)}>
            <sphereGeometry args={[0.07, 6, 5]} />
            <meshBasicMaterial color="#fff6c2" />
          </mesh>
        );
      })}
    </group>
  );
};

const EnergyBand: React.FC<{ frame: number }> = ({ frame }) => {
  const q = clamp(track("energyBand.squeeze", frame), 0, 1);
  if (sceneAt(frame).id !== "scene-11-encurta-cresce") return null;
  const k = smoothstep(clamp(q * 4, 0, 1)) * (1 - smoothstep(clamp((frame - sceneAt(frame).startFrame - (sceneAt(frame).durationInFrames - 12)) / 10, 0, 1)));
  if (k <= 0.001) return null;
  const c = crest(frame);
  const w = lerp(2.6, 0.9, q);
  return (
    <group>
      {Array.from({ length: 24 }, (_, i) => {
        const u = (i % 8) / 7 - 0.5;
        const v = Math.floor(i / 8) / 2;
        const x = c.x + u * w * 2;
        const top = surfaceY(x, frame);
        const fl = floorY(x, frame);
        const y = lerp(fl + 0.08, top - 0.06, lerp(0.2, 0.9, v) * lerp(0.6, 1, q));
        return (
          <mesh key={i} position={[x, y, Z_HALF + 0.07]} scale={k}>
            <sphereGeometry args={[0.055, 6, 5]} />
            <meshBasicMaterial color="#ffd166" />
          </mesh>
        );
      })}
    </group>
  );
};

/** Silhueta da onda de mar aberto, levada até a crista atual (comparação de forma). */
const GhostDeep: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("ghostDeep.show", frame), 0, 1);
  if (k <= 0.001) return null;
  const c = crest(frame);
  const L = waveWidth(4.2);
  const A = waveAmp(4.2);
  return (
    <group>
      {Array.from({ length: 34 }, (_, i) => {
        const u = (i / 33) * 2 - 1;
        const x = c.x + u * L * 2.2;
        const ch = Math.cosh(u * 2.2);
        const y = A / (ch * ch) + 0.03;
        return i % 2 === 0 ? (
          <mesh key={i} position={[x, y, Z_HALF + 0.12]} scale={k}>
            <boxGeometry args={[L * 0.12, 0.05, 0.03]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        ) : null;
      })}
    </group>
  );
};

// ---------------------------------------------------------------- prévia (cena 2) e instantâneos finais
const PreviewWall: React.FC<{ frame: number }> = ({ frame }) => {
  if (sceneAt(frame).id !== "scene-02-paredao-previa") return null;
  const r = clamp(track("previewWall.rise", frame), 0, 1.2);
  const H = 2.3 * r;
  const x0 = 22.9;
  const pos: number[] = [];
  const NZ = 8;
  const prof = (t: number) => {
    // perfil da frente: base larga atrás, frente quase vertical com crista
    const x = lerp(x0 - 3.2, x0 + 0.35, t);
    const y = H * Math.pow(t, 2.2) * (t > 0.92 ? 1 - (t - 0.92) * 2 : 1);
    return [x, y] as const;
  };
  const N = 18;
  for (let i = 0; i < N; i++) {
    const [ax, ay] = prof(i / N);
    const [bx, by] = prof((i + 1) / N);
    for (let k = 0; k < NZ; k++) {
      const z0 = -Z_HALF + (2 * Z_HALF * k) / NZ;
      const z1 = -Z_HALF + (2 * Z_HALF * (k + 1)) / NZ;
      const w0 = 0.12 * Math.sin(z0 * 2 + frame * 0.2);
      const w1 = 0.12 * Math.sin(z1 * 2 + frame * 0.2);
      pos.push(ax, ay, z0, ax, ay, z1, bx + w1, by, z1, ax, ay, z0, bx + w1, by, z1, bx + w0, by, z0);
    }
  }
  // face de frente (parede) até a areia
  const [fx, fy] = prof(1);
  pos.push(fx, fy, -Z_HALF, fx, fy, Z_HALF, fx + 0.1, -0.3, Z_HALF, fx, fy, -Z_HALF, fx + 0.1, -0.3, Z_HALF, fx + 0.1, -0.3, -Z_HALF);
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return (
    <group>
      <mesh geometry={g}>
        <meshStandardMaterial {...MATTE} color="#2c86ad" side={DoubleSide} transparent opacity={0.93} />
      </mesh>
      {Array.from({ length: 10 }, (_, i) => (
        <mesh key={i} position={[fx - 0.05, fy + 0.04, -Z_HALF + 0.2 + i * 0.4]} scale={r}>
          <icosahedronGeometry args={[0.16 + 0.05 * rand(`fo${i}`), 0]} />
          <meshStandardMaterial {...MATTE} color="#f4fbff" />
        </mesh>
      ))}
    </group>
  );
};

const FinalGhosts: React.FC<{ frame: number }> = ({ frame }) => {
  const k = clamp(track("finalGhosts.reveal", frame), 0, 1);
  if (k <= 0.001) return null;
  const snaps = [-10, 10, 22.2];
  return (
    <group>
      {snaps.map((xf, j) => {
        const kj = smoothstep(clamp(k * 3 - j, 0, 1));
        if (kj <= 0.001) return null;
        const h = depthAt(xf);
        const L = waveWidth(h);
        const A = waveAmp(h);
        const Lf = L * (1 - 0.55 * clamp((xf - 8) / 14, 0, 1));
        const pos: number[] = [];
        const N = 40;
        const span = L * 2.6;
        for (let i = 0; i < N; i++) {
          const xa = xf - span + (span * 2 * i) / N;
          const xb = xf - span + (span * 2 * (i + 1)) / N;
          const ua = xa >= xf ? (xa - xf) / Lf : (xa - xf) / L;
          const ub = xb >= xf ? (xb - xf) / Lf : (xb - xf) / L;
          const ya = (A * kj) / Math.cosh(ua) ** 2;
          const yb = (A * kj) / Math.cosh(ub) ** 2;
          pos.push(xa, 0.01, Z_HALF + 0.05, xa, ya + 0.01, Z_HALF + 0.05, xb, yb + 0.01, Z_HALF + 0.05);
          pos.push(xa, 0.01, Z_HALF + 0.05, xb, yb + 0.01, Z_HALF + 0.05, xb, 0.01, Z_HALF + 0.05);
          pos.push(xa, ya + 0.01, -Z_HALF, xa, ya + 0.01, Z_HALF + 0.05, xb, yb + 0.01, Z_HALF + 0.05);
          pos.push(xa, ya + 0.01, -Z_HALF, xb, yb + 0.01, Z_HALF + 0.05, xb, yb + 0.01, -Z_HALF);
        }
        const g = new BufferGeometry();
        g.setAttribute("position", new Float32BufferAttribute(pos, 3));
        g.computeVertexNormals();
        return (
          <mesh key={j} geometry={g}>
            <meshStandardMaterial {...MATTE} color={["#53d6ff", "#4fb0ff", "#2f7df6"][j]} emissive="#1d6fa8" emissiveIntensity={0.35} side={DoubleSide} />
          </mesh>
        );
      })}
    </group>
  );
};

// ---------------------------------------------------------------- mundo
export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const floor = useSeafloor(frame);
  const water = useWater(frame);
  return (
    <group>
      <mesh geometry={floor} receiveShadow castShadow>
        <meshStandardMaterial {...MATTE} vertexColors side={DoubleSide} />
      </mesh>
      {/* pedestal */}
      <mesh position={[0, BASE_Y - 0.2, 0]}>
        <boxGeometry args={[X_MAX - X_MIN + 0.6, 0.4, 2 * Z_HALF + 0.6]} />
        <meshStandardMaterial {...MATTE} color={PALETTE.pedestal} />
      </mesh>
      {isVisible("plates", frame) ? <Plates frame={frame} /> : null}
      <mesh geometry={water.gt} receiveShadow>
        <meshStandardMaterial {...MATTE} color="#2b8fbf" transparent opacity={0.82} side={DoubleSide} />
      </mesh>
      <mesh geometry={water.gf}>
        <meshStandardMaterial roughness={0.6} metalness={0} color="#1f6f9e" transparent opacity={0.5} side={DoubleSide} depthWrite={false} />
      </mesh>
      {isVisible("ship", frame) ? <Ship frame={frame} /> : null}
      {isVisible("coast", frame) ? <Coast frame={frame} /> : null}
      <ColumnParticles frame={frame} />
      <LiftArrows frame={frame} />
      <SpeedArrows frame={frame} />
      <FlowArrows frame={frame} />
      <Airplane frame={frame} />
      <SpeedLines frame={frame} />
      <DepthGuide frame={frame} />
      <WidthSpan frame={frame} />
      <PileUp frame={frame} />
      <EnergyBand frame={frame} />
      <GhostDeep frame={frame} />
      <PreviewWall frame={frame} />
      <FinalGhosts frame={frame} />
    </group>
  );
};
