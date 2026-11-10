import { Color, DoubleSide } from "three";
import { useCurrentFrame } from "remotion";
import { sceneAt, track } from "../data/scenes";
import { MATTE, PALETTE } from "../theme";
import { clamp, pulse, rand, smoothstep } from "../utils/animation";
import {
  BASE_Y, dimOf, layerBox, TELLS, TOP, X_MAX, X_MIN, Z_BACK, Z_FRONT, type Tell, type TellId,
} from "../world/cities";
import { Arrow3D } from "./Arrow3D";

// Cenário persistente: bloco de terreno em corte com quatro tells. Tudo lê trilhas no frame GLOBAL.

const GREY = new Color("#8a8580");
const shade = (hex: string, dim: number, desat = 0) => {
  const c = new Color(hex);
  if (desat > 0) c.lerp(GREY, 0.75 * desat);
  if (dim < 1) c.lerp(new Color("#3a3230"), (1 - dim) * 0.75);
  return c;
};

const Box: React.FC<{ p: [number, number, number]; s: [number, number, number]; c: Color | string; e?: number; ec?: string; op?: number; rot?: [number, number, number] }> = ({ p, s, c, e = 0, ec, op, rot }) => (
  <mesh position={p} rotation={rot} castShadow receiveShadow>
    <boxGeometry args={s} />
    <meshStandardMaterial {...MATTE} color={c} emissive={ec ?? "#000000"} emissiveIntensity={e} transparent={op !== undefined} opacity={op ?? 1} />
  </mesh>
);

// ---------------------------------------------------------------- terreno
const Terrain: React.FC = () => {
  const bands: [number, number, string][] = [
    [-0.0, -0.9, "#c8a77c"],
    [-0.9, -2.2, "#b8946a"],
    [-2.2, -3.8, "#a6825c"],
    [-3.8, BASE_Y, "#937150"],
  ];
  const w = X_MAX - X_MIN;
  return (
    <group>
      <Box p={[0, (BASE_Y + 0) / 2 - 0.001, (Z_FRONT + Z_BACK) / 2]} s={[w, -BASE_Y, Z_FRONT - Z_BACK]} c="#b8946a" />
      {bands.map(([a, b, c], i) => (
        <Box key={i} p={[0, (a + b) / 2, Z_FRONT + 0.004]} s={[w, a - b, 0.01]} c={c} />
      ))}
      {/* topo com grama seca */}
      <Box p={[0, 0.02, (Z_FRONT + Z_BACK) / 2]} s={[w, 0.04, Z_FRONT - Z_BACK]} c="#c9b47a" />
      <Box p={[0, BASE_Y - 0.2, (Z_FRONT + Z_BACK) / 2]} s={[w + 0.6, 0.4, Z_FRONT - Z_BACK + 0.6]} c={PALETTE.pedestal} />
    </group>
  );
};

// ---------------------------------------------------------------- tell (camadas)
const TellLayers: React.FC<{ t: Tell; frame: number }> = ({ t, frame }) => {
  const dim = dimOf(t.id, frame);
  const desat = t.id === "catal" ? clamp(track("catal.desat", frame), 0, 1) : 0;
  const reveal = clamp(track(`${t.id}.reveal`, frame), 0, 1);
  const outline = t.id === "catal" ? clamp(track("catal.outline", frame), 0, 1) : 0;
  const bottomGlow = t.id === "catal" ? clamp(track("catal.bottomGlow", frame), 0, 1) : 0;
  const built = t.id === "catal" ? track("catal.layers", frame) : t.layers;
  const gaps = t.id === "jericho" ? clamp(track("jericho.gaps", frame), 0, 1) : 0;
  const cont = t.id === "damascus" ? clamp(track("damascus.continuous", frame), 0, 1) : 0;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < t.layers; i++) {
    const b = layerBox(t, i);
    const k = clamp(built - i, 0, 1);
    if (k <= 0.001) continue;
    const isGap = t.gaps?.includes(i) ?? false;
    const col = shade(isGap && gaps > 0.5 ? "#e6d6b4" : t.palette[i], dim, desat);
    const h = (b.y1 - b.y0) * smoothstep(k);
    const glow = 0.12 * reveal * pulse(frame, 50) + 0.25 * outline + (i === 0 ? 0.6 * bottomGlow * (0.6 + 0.4 * pulse(frame, 20)) : 0);
    out.push(<Box key={i} p={[t.x, b.y0 + h / 2, (Z_FRONT + Z_BACK) / 2 + 0.006]} s={[b.half * 2, Math.max(0.001, h - 0.035), Z_FRONT - Z_BACK + 0.012]} c={col} e={glow} ec={i === 0 && bottomGlow > 0 ? "#ffd166" : "#ffcf8a"} />);
    if (isGap && gaps > 0.01) {
      out.push(<Box key={`g${i}`} p={[t.x, (b.y0 + b.y1) / 2, Z_FRONT + 0.03]} s={[b.half * 2 + 0.02, b.y1 - b.y0 - 0.03, 0.02]} c={PALETTE.negative} op={0.55 * gaps} e={0.4} ec={PALETTE.negative} />);
    }
    if (cont > 0.01) {
      out.push(<Box key={`c${i}`} p={[t.x, (b.y0 + b.y1) / 2, Z_FRONT + 0.03]} s={[b.half * 2 + 0.02, b.y1 - b.y0 - 0.02, 0.02]} c={PALETTE.positive} op={0.42 * smoothstep(clamp(cont * t.layers - (t.layers - 1 - i), 0, 1))} e={0.35} ec={PALETTE.positive} />);
    }
  }
  // zona desconhecida (abaixo das camadas conhecidas)
  if (t.unknownTo !== undefined) {
    const u = clamp(track("damascus.unknown", frame), 0, 1);
    const y0 = t.unknownTo;
    const y1 = t.bottom;
    const half = t.wBottom / 2 + 0.6;
    out.push(<Box key="unk" p={[t.x, (y0 + y1) / 2, Z_FRONT + 0.01]} s={[half * 2, y1 - y0, 0.012]} c={shade("#6f6873", dim)} op={0.25 + 0.6 * u} />);
    for (let s = 0; s < 9; s++) {
      const x = t.x - half + 0.3 + (s * (half * 2 - 0.6)) / 8;
      out.push(<Box key={`h${s}`} p={[x, (y0 + y1) / 2, Z_FRONT + 0.02]} s={[0.06, (y1 - y0) * 0.98, 0.01]} rot={[0, 0, 0.5]} c="#9a92a0" op={0.8 * u} />);
    }
  }
  return <group>{out}</group>;
};

// ---------------------------------------------------------------- cidades no topo
const romeCity = (t: Tell, frame: number) => {
  const k = clamp(track("rome.city", frame, 1), 0, 1.2);
  const dim = dimOf("rome", frame);
  const top = t.top;
  const items: React.ReactNode[] = [];
  const blds: [number, number, number, number][] = [[-1.0, -0.8, 0.6, 0.7], [-0.2, 0.6, 0.8, 0.6], [0.7, -0.5, 0.5, 0.65], [1.2, 0.9, 0.7, 0.55], [-1.3, 1.0, 0.45, 0.5], [0.3, -1.6, 0.55, 0.6]];
  blds.forEach(([dx, dz, h, w], i) => {
    items.push(
      <group key={i} position={[t.x + dx, top, dz]} scale={[1, k, 1]}>
        <Box p={[0, h / 2, 0]} s={[w, h, w]} c={shade("#efe0c4", dim)} />
        <mesh position={[0, h + 0.14, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
          <coneGeometry args={[w * 0.75, 0.28, 4]} />
          <meshStandardMaterial {...MATTE} color={shade("#c4573a", dim)} />
        </mesh>
      </group>,
    );
  });
  items.push(
    <group key="dome" position={[t.x + 0.3, top, 0.1]} scale={[1, k, 1]}>
      <Box p={[0, 0.35, 0]} s={[0.9, 0.7, 0.9]} c={shade("#e9d8b8", dim)} />
      <mesh position={[0, 0.7, 0]} castShadow>
        <sphereGeometry args={[0.42, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial {...MATTE} color={shade("#d9c4a0", dim)} />
      </mesh>
    </group>,
  );
  return items;
};

const catalCity = (t: Tell, frame: number) => {
  const built = track("catal.layers", frame);
  if (built < t.layers - 0.05) return [];
  const ruin = clamp(track("catal.ruin", frame), 0, 1);
  const dim = dimOf("catal", frame);
  const desat = clamp(track("catal.desat", frame), 0, 1);
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 7; i++) {
    const dx = -0.75 + (i % 4) * 0.5;
    const dz = -0.6 + Math.floor(i / 4) * 0.9;
    const h = 0.32 * (1 - 0.75 * ruin) * (0.85 + 0.3 * rand(`ch${i}`));
    items.push(<Box key={i} p={[t.x + dx, t.top + h / 2, dz]} s={[0.46, h, 0.6]} c={shade(ruin > 0.5 ? "#9b8f84" : "#c99d6e", dim, desat)} />);
  }
  if (ruin > 0.01) {
    for (let i = 0; i < 9; i++) {
      items.push(<Box key={`gr${i}`} p={[t.x - 0.8 + rand(`gx${i}`) * 1.6, t.top + 0.02, -1.0 + rand(`gz${i}`) * 2.0]} s={[0.35 * ruin, 0.06, 0.35 * ruin]} c="#6f9a4a" />);
    }
  }
  return items;
};

const jerichoCity = (t: Tell, frame: number) => {
  const dim = dimOf("jericho", frame);
  const items: React.ReactNode[] = [];
  // ruínas no topo do tell
  for (let i = 0; i < 5; i++) {
    items.push(<Box key={`r${i}`} p={[t.x - 0.6 + i * 0.3, t.top + 0.08, -0.4 + rand(`jr${i}`) * 0.8]} s={[0.22, 0.16, 0.22]} c={shade("#a69886", dim)} />);
  }
  // cidade atual ao lado do tell
  const homes: [number, number, number][] = [[4.2, 0.9, 0.45], [5.0, -0.4, 0.4], [4.6, -1.5, 0.5], [5.6, 0.7, 0.35], [5.9, -1.0, 0.45]];
  homes.forEach(([dx, dz, h], i) => {
    items.push(<Box key={`h${i}`} p={[t.x + dx, h / 2, dz]} s={[0.55, h, 0.55]} c={shade(i % 2 ? "#f2ead9" : "#e9dcc2", dim)} />);
  });
  for (let i = 0; i < 3; i++) {
    items.push(
      <group key={`p${i}`} position={[t.x + 4.4 + i * 0.7, 0, 2.1]}>
        <Box p={[0, 0.35, 0]} s={[0.07, 0.7, 0.07]} c={shade("#8b6a45", dim)} />
        <mesh position={[0, 0.72, 0]}>
          <coneGeometry args={[0.32, 0.14, 6]} />
          <meshStandardMaterial {...MATTE} color={shade("#4f8f3c", dim)} />
        </mesh>
      </group>,
    );
  }
  // bandeira de alerta
  const flag = clamp(track("jericho.flag", frame), 0, 1);
  if (flag > 0.001) {
    items.push(
      <group key="flag" position={[t.x + 0.2, t.top, 0.6]} scale={flag}>
        <Box p={[0, 0.6, 0]} s={[0.05, 1.2, 0.05]} c="#e8e2d8" />
        <Box p={[0.28, 1.05, 0]} s={[0.5, 0.3, 0.03]} c={PALETTE.negative} e={0.4} ec={PALETTE.negative} />
      </group>,
    );
  }
  return items;
};

const damascusCity = (t: Tell, frame: number) => {
  const dim = dimOf("damascus", frame);
  const items: React.ReactNode[] = [];
  for (let i = 0; i < 16; i++) {
    const dx = -1.35 + (i % 6) * 0.54;
    const dz = -1.3 + Math.floor(i / 6) * 1.0;
    const h = 0.3 + 0.35 * rand(`dh${i}`);
    items.push(<Box key={i} p={[t.x + dx, t.top + h / 2, dz]} s={[0.48, h, 0.7]} c={shade(i % 3 === 0 ? "#f4ecdc" : i % 3 === 1 ? "#e8dcc4" : "#ddcfb4", dim)} />);
  }
  ([[-0.6, 0.2, "#4f9fa6"], [0.7, -0.6, "#3f8a8f"], [0.1, 1.0, "#5aa79f"]] as [number, number, string][]).forEach(([dx, dz, c], i) => {
    items.push(
      <group key={`d${i}`} position={[t.x + dx, t.top + 0.62, dz]}>
        <mesh castShadow>
          <sphereGeometry args={[0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial {...MATTE} color={shade(c, dim)} />
        </mesh>
      </group>,
    );
  });
  items.push(
    <group key="min" position={[t.x + 1.25, t.top, 0.3]}>
      <mesh position={[0, 0.85, 0]} castShadow>
        <cylinderGeometry args={[0.09, 0.11, 1.7, 8]} />
        <meshStandardMaterial {...MATTE} color={shade("#f1e7d3", dim)} />
      </mesh>
      <mesh position={[0, 1.82, 0]} castShadow>
        <coneGeometry args={[0.13, 0.3, 8]} />
        <meshStandardMaterial {...MATTE} color={shade("#3f8a8f", dim)} />
      </mesh>
    </group>,
  );
  // coroa da revelação
  const crown = clamp(track("damascus.crown", frame), 0, 1.3);
  if (crown > 0.001) {
    const y = t.top + 2.6 + 0.08 * Math.sin(frame / 12);
    items.push(
      <group key="crown" position={[t.x, y, 0.6]} rotation={[0.15, frame * 0.03, 0]} scale={crown * 1.1}>
        <mesh>
          <cylinderGeometry args={[0.55, 0.55, 0.28, 10, 1, true]} />
          <meshStandardMaterial roughness={0.35} metalness={0.6} color="#f2c14e" emissive="#f2a81e" emissiveIntensity={0.45} side={DoubleSide} flatShading />
        </mesh>
        {Array.from({ length: 5 }, (_, i) => {
          const a = (i / 5) * Math.PI * 2;
          return (
            <mesh key={i} position={[0.55 * Math.cos(a), 0.3, 0.55 * Math.sin(a)]}>
              <coneGeometry args={[0.13, 0.36, 4]} />
              <meshStandardMaterial roughness={0.35} metalness={0.6} color="#f2c14e" emissive="#f2a81e" emissiveIntensity={0.45} flatShading />
            </mesh>
          );
        })}
      </group>,
    );
  }
  return items;
};

// ---------------------------------------------------------------- objetos de cena
const Tower: React.FC<{ frame: number }> = ({ frame }) => {
  const t = TELLS.jericho;
  const g = clamp(track("jericho.towerGlow", frame), 0, 1);
  const dim = dimOf("jericho", frame);
  const y = TOP - 4.0;
  return (
    <group position={[t.x - 0.5, y, Z_FRONT - 0.05]}>
      <mesh castShadow>
        <cylinderGeometry args={[0.42, 0.5, 0.75, 9]} />
        <meshStandardMaterial {...MATTE} color={shade("#9d968c", dim)} emissive="#ffd166" emissiveIntensity={0.55 * g * (0.7 + 0.3 * pulse(frame, 24))} />
      </mesh>
      {[0, 1, 2].map((i) => (
        <Box key={i} p={[0, -0.25 + i * 0.25, 0.43]} s={[0.7, 0.02, 0.06]} c="#7d766c" />
      ))}
    </group>
  );
};

const Shovel: React.FC<{ frame: number }> = ({ frame }) => {
  if (sceneAt(frame).id !== "scene-02-camadas") return null;
  const d = clamp(track("shovel.dig", frame), 0, 1);
  const vis = 1 - smoothstep(clamp((track("catal.layers", frame) - 1) / 1.5, 0, 1));
  if (vis <= 0.01) return null;
  const a = -0.5 + 0.9 * Math.sin(d * Math.PI * 2);
  return (
    <group position={[TELLS.catal.x + 0.6, 0.05, 1.4]} rotation={[0, 0, a]} scale={vis}>
      <Box p={[0, 0.75, 0]} s={[0.07, 1.3, 0.07]} c="#9a6b3f" />
      <Box p={[0, 0.05, 0]} s={[0.36, 0.42, 0.05]} c="#8d969e" />
    </group>
  );
};

const DepthArrow: React.FC<{ frame: number }> = ({ frame }) => {
  if (sceneAt(frame).id !== "scene-03-tell") return null;
  const k = clamp(track("depthArrow.show", frame), 0, 1);
  if (k <= 0.001) return null;
  const t = TELLS.catal;
  return <Arrow3D from={[t.x + t.wBottom / 2 + 0.9, TOP, Z_FRONT + 0.15]} dir={[0, -1, 0]} length={3.4 * k + 0.01} radius={0.09} color={PALETTE.warning} />;
};

const Excavator: React.FC<{ frame: number }> = ({ frame }) => {
  const id = sceneAt(frame).id;
  if (id !== "scene-09-provas" && id !== "scene-10-candidata") return null;
  const b = clamp(track("excavator.blocked", frame), 0, 1.3);
  const x = TELLS.damascus.x + 4.4;
  return (
    <group position={[x, 0, 1.4]} rotation={[0, -0.5, 0]}>
      <Box p={[0, 0.25, 0]} s={[0.9, 0.3, 0.6]} c="#3a3a3a" />
      <Box p={[0, 0.55, 0]} s={[0.8, 0.35, 0.55]} c="#f2b632" />
      <Box p={[-0.15, 0.85, 0]} s={[0.35, 0.3, 0.45]} c="#f2b632" />
      <Box p={[-0.65, 0.85, 0]} s={[0.8, 0.1, 0.1]} rot={[0, 0, -0.5]} c="#e0a52a" />
      <Box p={[-1.05, 0.55, 0]} s={[0.2, 0.25, 0.3]} c="#7c7c7c" />
      {b > 0.01 ? (
        <group position={[0, 1.6, 0]} scale={b}>
          <Box p={[0, 0, 0]} s={[1.1, 0.16, 0.08]} rot={[0, 0, 0.78]} c={PALETTE.negative} e={0.5} ec={PALETTE.negative} />
          <Box p={[0, 0, 0]} s={[1.1, 0.16, 0.08]} rot={[0, 0, -0.78]} c={PALETTE.negative} e={0.5} ec={PALETTE.negative} />
        </group>
      ) : null}
    </group>
  );
};

// ---------------------------------------------------------------- mundo
export const World: React.FC = () => {
  const frame = useCurrentFrame();
  const items: React.ReactNode[] = [];
  (Object.keys(TELLS) as TellId[]).forEach((id) => {
    const t = TELLS[id];
    items.push(<TellLayers key={id} t={t} frame={frame} />);
  });
  return (
    <group>
      <Terrain />
      {items}
      {romeCity(TELLS.rome, frame)}
      {catalCity(TELLS.catal, frame)}
      {jerichoCity(TELLS.jericho, frame)}
      {damascusCity(TELLS.damascus, frame)}
      <Tower frame={frame} />
      <Shovel frame={frame} />
      <DepthArrow frame={frame} />
      <Excavator frame={frame} />
    </group>
  );
};
