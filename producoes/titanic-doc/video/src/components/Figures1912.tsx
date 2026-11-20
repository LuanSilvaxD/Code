import { RoundedBox } from "@react-three/drei";
import { Person, type PersonLook } from "./Person";
import type { Vec3 } from "../utils/animation";

// Figurino de 1912 por cima da Pessoa do canal (mesmo estilo low-poly). Coordenadas locais da Pessoa:
// pés em y=0, tronco centrado em y=1,1 (0,4 × 0,58 × 0,22, frente em z=+0,11), cabeça em y=1,6 (0,27³).
// Papéis: comandante, oficial, marinheiro (vigia/timoneiro), radiotelegrafista, cavalheiro e dama da 1ª classe,
// homem e mulher da 3ª classe, criança.

export type Role = "captain" | "officer" | "seaman" | "radio" | "gent" | "lady" | "steerageMan" | "steerageWoman" | "child";

const rb = (p: Vec3, s: [number, number, number], c: string, r?: number, rot?: Vec3) => (
  <group position={p} rotation={rot}>
    <RoundedBox args={s} radius={r ?? Math.min(...s) * 0.3} smoothness={3} castShadow>
      <meshStandardMaterial color={c} roughness={0.6} />
    </RoundedBox>
  </group>
);
const metal = (p: Vec3, r: number, c = "#d4ac4c") => (
  <mesh position={p} castShadow>
    <sphereGeometry args={[r, 8, 6]} />
    <meshStandardMaterial color={c} metalness={0.8} roughness={0.25} />
  </mesh>
);

const NAVY = "#18203a";
const LOOK: Record<Role, PersonLook> = {
  captain: { shirt: NAVY, sleeves: "long", pants: NAVY, shoes: "#0e0e12", hair: "#e8e6e0", skin: "#e2b392" },
  officer: { shirt: NAVY, sleeves: "long", pants: NAVY, shoes: "#0e0e12", hair: "#3b2a22", skin: "#e8b48f" },
  seaman: { shirt: "#1e2433", sleeves: "long", pants: "#1a1d28", shoes: "#141418", hair: "#5a3a22", skin: "#d8a47e" },
  radio: { shirt: "#1c2236", sleeves: "long", pants: "#1c2236", shoes: "#0e0e12", hair: "#2a1e18", skin: "#e8bc98" },
  gent: { shirt: "#16161c", sleeves: "long", pants: "#16161c", shoes: "#0a0a0c", hair: "#3a2a1e", skin: "#e8b48f" },
  lady: { shirt: "#5a2a48", sleeves: "long", dress: "#5a2a48", hair: "#6a4428", hairStyle: "bun", skin: "#f0c8a8" },
  steerageMan: { shirt: "#5a4632", sleeves: "long", pants: "#3a3228", shoes: "#2a2018", hair: "#4a3020", skin: "#d49a72" },
  steerageWoman: { shirt: "#4a4a56", sleeves: "long", dress: "#3a3440", hair: "#3a2416", hairStyle: "bun", skin: "#e0aa86" },
  child: { shirt: "#7a5a3a", sleeves: "long", pants: "#4a3e30", shoes: "#2a2018", hair: "#8a5a2a", skin: "#f0c0a0" },
};

/** Quepe de pala (topo, faixa, pala preta, emblema). */
const PeakCap: React.FC<{ top: string; band?: string; badge?: string }> = ({ top, band = "#101016", badge = "#d4ac4c" }) => (
  <group position={[0, 1.79, 0.01]}>
    {rb([0, 0.03, 0], [0.32, 0.07, 0.32], top, 0.03)}
    {rb([0, -0.025, 0], [0.29, 0.05, 0.29], band, 0.02)}
    {rb([0, -0.05, 0.16], [0.24, 0.02, 0.09], "#0a0a0c", 0.01, [0.25, 0, 0])}
    {metal([0, -0.02, 0.15], 0.022, badge)}
  </group>
);

/** Fileiras de botões dourados na frente do paletó. */
const Buttons: React.FC<{ double?: boolean }> = ({ double }) => (
  <>
    {(double ? [-0.07, 0.07] : [0]).map((x) =>
      [1.28, 1.16, 1.04, 0.92].map((y) => <group key={`${x}${y}`}>{metal([x, y, 0.118], 0.016)}</group>),
    )}
  </>
);

/** Divisas douradas no punho. */
const Cuffs: React.FC<{ n: number }> = ({ n }) => (
  <>
    {[-1, 1].map((s) =>
      Array.from({ length: n }, (_, i) => (
        <mesh key={`${s}${i}`} position={[0.245 * s, 0.82 + i * 0.025, 0]}>
          <boxGeometry args={[0.112, 0.012, 0.122]} />
          <meshStandardMaterial color="#d4ac4c" metalness={0.7} roughness={0.3} />
        </mesh>
      )),
    )}
  </>
);

/** Peito de camisa branca + gravata (cavalheiro) ou gravata simples. */
const ShirtFront: React.FC<{ tie?: string; bow?: boolean }> = ({ tie = "#0a0a0c", bow }) => (
  <>
    <mesh position={[0, 1.27, 0.113]} rotation={[0, 0, Math.PI]}>
      <coneGeometry args={[0.07, 0.22, 3]} />
      <meshStandardMaterial color="#f4f2ec" />
    </mesh>
    {bow ? rb([0, 1.36, 0.12], [0.08, 0.035, 0.02], tie, 0.01) : rb([0, 1.28, 0.122], [0.03, 0.14, 0.01], tie, 0.005)}
  </>
);

export const Figure1912: React.FC<{
  role: Role;
  frame: number;
  position?: Vec3;
  rotY?: number;
  scale?: number;
  point?: number;
  wave?: number;
  walk?: number;
  look?: number;
  seed?: number;
  /** cor do vestido / paletó para variar figurantes */
  tint?: string;
}> = ({ role, frame, position = [0, 0, 0], rotY = 0, scale = 1, point = 0, wave = 0, walk = 0, look = 0, seed = 0, tint }) => {
  const base = { ...LOOK[role] };
  if (tint && (role === "lady" || role === "steerageWoman")) {
    base.shirt = tint;
    base.dress = tint;
  }
  if (tint && (role === "gent" || role === "steerageMan")) {
    base.shirt = tint;
    base.pants = tint;
  }
  const k = role === "child" ? 0.62 : 1;
  return (
    <group position={position} rotation={[0, rotY, 0]} scale={scale * k}>
      <Person {...base} frame={frame} point={point} wave={wave} walk={walk} look={look} seed={seed} />
      {role === "captain" ? (
        <>
          <PeakCap top="#f4f2ea" />
          <Buttons double />
          <Cuffs n={4} />
          {/* barba branca e bigode */}
          {rb([0, 1.5, 0.11], [0.25, 0.11, 0.07], "#ece9e2", 0.04)}
          {rb([0, 1.56, 0.14], [0.13, 0.03, 0.02], "#ece9e2", 0.01)}
          {/* lapelas */}
          {[-1, 1].map((s) => rb([0.1 * s, 1.3, 0.112], [0.07, 0.16, 0.01], "#101828", 0.005, [0, 0, -0.35 * s]))}
        </>
      ) : null}
      {role === "officer" ? (
        <>
          <PeakCap top={NAVY} />
          <Buttons double />
          <Cuffs n={2} />
          {rb([0, 1.555, 0.14], [0.11, 0.025, 0.02], "#3b2a22", 0.01)}
        </>
      ) : null}
      {role === "seaman" ? (
        <>
          {/* boné de marinheiro e gola alta do suéter */}
          {rb([0, 1.79, 0], [0.3, 0.08, 0.3], "#1a1e2c", 0.04)}
          {rb([0, 1.4, 0], [0.2, 0.06, 0.2], "#1e2433", 0.03)}
          {rb([0, 1.12, 0.113], [0.2, 0.05, 0.01], "#c8c0a8", 0.005)}
        </>
      ) : null}
      {role === "radio" ? (
        <>
          <PeakCap top="#1c2236" badge="#d4ac4c" />
          <Buttons />
          <ShirtFront />
        </>
      ) : null}
      {role === "gent" ? (
        <>
          {/* cartola, colete, peito branco com gravata-borboleta, bigode, cauda do fraque */}
          <group position={[0, 1.76, 0]}>
            {rb([0, 0, 0], [0.38, 0.025, 0.38], "#0a0a0c", 0.01)}
            <mesh position={[0, 0.13, 0]} castShadow>
              <cylinderGeometry args={[0.13, 0.12, 0.26, 16]} />
              <meshStandardMaterial color="#0a0a0c" roughness={0.4} />
            </mesh>
          </group>
          <ShirtFront bow />
          {rb([0, 1.0, 0.113], [0.2, 0.22, 0.01], "#3a3440", 0.005)}
          {rb([0, 1.555, 0.14], [0.12, 0.03, 0.02], "#3a2a1e", 0.01)}
          {rb([0, 0.72, -0.1], [0.34, 0.3, 0.03], base.shirt ?? "#16161c", 0.01, [0.12, 0, 0])}
          {metal([0.06, 1.06, 0.12], 0.012, "#d4ac4c")}
        </>
      ) : null}
      {role === "lady" ? (
        <>
          {/* chapéu largo com plumas, gola de renda, cinturinha */}
          <group position={[0, 1.8, -0.01]} rotation={[0.08, 0, 0.06]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.32, 0.32, 0.025, 20]} />
              <meshStandardMaterial color="#2a1a24" roughness={0.6} />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.13, 0.15, 0.12, 16]} />
              <meshStandardMaterial color="#2a1a24" />
            </mesh>
            {[-0.06, 0.04].map((x, i) => (
              <mesh key={i} position={[x, 0.13, -0.06]} rotation={[0.6, 0, 0.4 - i * 0.8]} scale={[0.5, 1, 0.25]}>
                <sphereGeometry args={[0.12, 8, 6]} />
                <meshStandardMaterial color={i ? "#f4f0e8" : "#c8b8d8"} />
              </mesh>
            ))}
          </group>
          {rb([0, 1.4, 0.04], [0.2, 0.07, 0.16], "#f4f0e8", 0.03)}
          {rb([0, 0.86, 0], [0.38, 0.06, 0.23], "#2a1a24", 0.02)}
          {metal([0, 1.3, 0.12], 0.018, "#e8e0f0")}
        </>
      ) : null}
      {role === "steerageMan" ? (
        <>
          {/* boina, cachecol, colete */}
          {rb([0, 1.78, 0.03], [0.31, 0.06, 0.34], "#4a4038", 0.03)}
          {rb([0, 1.4, 0.03], [0.22, 0.07, 0.2], "#8a3a2a", 0.03)}
          {rb([0, 1.05, 0.113], [0.22, 0.3, 0.01], "#3a3228", 0.005)}
        </>
      ) : null}
      {role === "steerageWoman" ? (
        <>
          {/* lenço na cabeça e xale nos ombros */}
          {rb([0, 1.7, -0.01], [0.31, 0.2, 0.31], "#6a5a4a", 0.08)}
          {rb([0, 1.3, -0.01], [0.48, 0.16, 0.26], "#7a5a48", 0.06, [0.1, 0, 0])}
        </>
      ) : null}
      {role === "child" ? <>{rb([0, 1.78, 0.03], [0.3, 0.06, 0.32], "#5a4a3a", 0.03)}</> : null}
    </group>
  );
};
