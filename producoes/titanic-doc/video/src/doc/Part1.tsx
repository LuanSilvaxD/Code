import { ThreeCanvas } from "@remotion/three";
import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { usePose } from "../components/CameraController";
import { Lighting } from "../components/Lighting";
import { Mascot } from "../components/Mascot";
import { worldScale } from "../components/Person";
import { Stars } from "../components/SpaceScene";
import { Bridge, CrowsNest, HullCutaway, Iceberg, NEST_X, RadioRoom, Rod, TitanicHero } from "../components/Doc3D";
import { Quay, Treat } from "../components/Doc3D2";
import { Figure1912, type Role } from "../components/Figures1912";
import { NightSea } from "../components/Titanic";
import { FONT } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";

// DOCUMENTÁRIO TITANIC — PARTE 1: abertura fria (bloco 0) + título + capítulo 1 "O inafundável".
// 1920×1080, 30 fps, barras de cinema 2,39:1. Cada plano é uma <Sequence> com o seu próprio canvas 3D.
// Tempos em segundos amarrados às falas reais (public/audio/doc/bloco0.json e bloco1.json).

export const PART1_FRAMES = 3690; // 123 s
const S = (sec: number) => Math.round(sec * 30);
const W = 1920, H = 1080, BAR = 138;
const WS = worldScale(1);
const P = WS.person;
const ease = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
type Key = [number, Vec3, Vec3]; // [frame local, posição, alvo]
const poseAt = (f: number, keys: Key[], fov: number) => {
  if (f <= keys[0][0]) return { position: keys[0][1], target: keys[0][2], fov };
  for (let i = 0; i < keys.length - 1; i++) {
    const [f0, p0, t0] = keys[i], [f1, p1, t1] = keys[i + 1];
    if (f <= f1) {
      const k = ease(clamp((f - f0) / Math.max(1, f1 - f0), 0, 1));
      const L = (a: Vec3, b: Vec3): Vec3 => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
      return { position: L(p0, p1), target: L(t0, t1), fov };
    }
  }
  const l = keys[keys.length - 1];
  return { position: l[1], target: l[2], fov };
};

type LightKind = "night" | "day" | "interior" | "none";
const Lights: React.FC<{ kind: LightKind }> = ({ kind }) =>
  kind === "day" ? (
    <Lighting shadowExtent={40} />
  ) : kind === "night" ? (
    <>
      <ambientLight intensity={0.38} color="#8aa0d0" />
      <hemisphereLight args={["#5a6a9a", "#101018", 0.5]} />
      <directionalLight position={[-30, 40, 20]} intensity={0.55} color="#a8b8e8" />
    </>
  ) : kind === "interior" ? (
    <>
      <ambientLight intensity={0.35} color="#d8c8b0" />
      <hemisphereLight args={["#e8d8c0", "#2a2018", 0.35]} />
    </>
  ) : null;

/** Canvas 3D de um plano: câmera animada por chaves (frames locais do plano). */
const Cine: React.FC<{ keys: Key[]; fov?: number; light?: LightKind; bg: string; filter?: string; children: (f: number) => React.ReactNode }> = ({ keys, fov = 40, light = "night", bg, filter, children }) => {
  const f = useCurrentFrame();
  const pose = poseAt(f, keys, fov);
  const Cam = () => {
    usePose(pose);
    return null;
  };
  return (
    <AbsoluteFill style={{ background: bg, filter }}>
      <ThreeCanvas width={W} height={H} gl={{ antialias: true }} shadows flat camera={{ fov, near: 0.1, far: 4000, position: pose.position }} onCreated={({ gl }) => { gl.localClippingEnabled = true; }}>
        <Cam />
        <Lights kind={light} />
        {children(f)}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

/** Plano com fade de entrada/saída (frames). */
const Shot: React.FC<{ from: number; to: number; fin?: number; fout?: number; children: React.ReactNode }> = ({ from, to, fin = 0, fout = 0, children }) => (
  <Sequence from={from} durationInFrames={to - from} layout="none">
    <Fade len={to - from} fin={fin} fout={fout}>{children}</Fade>
  </Sequence>
);
const Fade: React.FC<{ len: number; fin: number; fout: number; children: React.ReactNode }> = ({ len, fin, fout, children }) => {
  const f = useCurrentFrame();
  const a = Math.min(fin > 0 ? clamp(f / fin, 0, 1) : 1, fout > 0 ? clamp((len - f) / fout, 0, 1) : 1);
  return <AbsoluteFill style={{ opacity: a }}>{children}</AbsoluteFill>;
};

const NIGHT = "linear-gradient(180deg,#02040c 0%,#081228 60%,#10203e 100%)";
const DAY = "linear-gradient(180deg,#8fb4d4 0%,#cfdbe4 65%,#e8e2d2 100%)";
const STUDIO = "radial-gradient(circle at 50% 45%,#2a1d48 0%,#0b0812 80%)";

/* ------------------------------------------------------------------ textos 2D (dentro da área útil) */

const Caption: React.FC<{ text: string; sub?: string; from: number; len: number; pos?: "bl" | "c" | "tl" }> = ({ text, sub, from, len, pos = "bl" }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 15, 0, 1), clamp((len - f) / 15, 0, 1));
  const place: React.CSSProperties = pos === "c" ? { left: 0, right: 0, top: H / 2 - 40, textAlign: "center" } : pos === "tl" ? { left: 110, top: BAR + 40 } : { left: 110, bottom: BAR + 46 };
  return (
    <div style={{ position: "absolute", ...place, opacity: a, fontFamily: FONT, color: "#f4efe4", textShadow: "0 2px 12px rgba(0,0,0,0.8)" }}>
      <div style={{ fontWeight: 700, fontSize: 30, letterSpacing: 6 }}>{text}</div>
      {sub ? <div style={{ fontWeight: 500, fontSize: 20, letterSpacing: 4, color: "#c8c0b0", marginTop: 6 }}>{sub}</div> : null}
    </div>
  );
};

const ChapterTag: React.FC<{ n: number; title: string; from: number; len: number }> = ({ n, title, from, len }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 18, 0, 1), clamp((len - f) / 18, 0, 1));
  return (
    <div style={{ position: "absolute", left: 110, bottom: BAR + 50, opacity: a, fontFamily: FONT, color: "#f4efe4", textShadow: "0 2px 14px rgba(0,0,0,0.85)" }}>
      <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 8, color: "#d8c8a0" }}>CAPÍTULO {n}</div>
      <div style={{ width: 70 * a, height: 2, background: "#d8c8a0", margin: "8px 0" }} />
      <div style={{ fontWeight: 800, fontSize: 52, letterSpacing: 4 }}>{title}</div>
    </div>
  );
};

const TitleCard: React.FC = () => {
  const f = useCurrentFrame();
  const a = Math.min(clamp(f / 25, 0, 1), clamp((150 - f) / 25, 0, 1));
  const sc = 1 + f * 0.0006;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 60%,#0c1a30 0%,#000 70%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ opacity: a, transform: `scale(${sc})`, textAlign: "center", fontFamily: FONT, color: "#f4efe4" }}>
        <div style={{ fontWeight: 800, fontSize: 150, letterSpacing: 40, marginRight: -40 }}>TITANIC</div>
        <div style={{ width: 520, height: 2, background: "#c9a24a", margin: "14px auto 22px" }} />
        <div style={{ fontWeight: 500, fontSize: 34, letterSpacing: 10, color: "#d8d0c0" }}>O QUE REALMENTE ACONTECEU NAQUELA NOITE</div>
      </div>
    </AbsoluteFill>
  );
};

/** Página de revista técnica de 1911 (2D, desenho próprio) com a frase destacada. */
const MagazinePage: React.FC = () => {
  const f = useCurrentFrame();
  const hl = clamp((f - S(4.2)) / 20, 0, 1);
  const sc = 0.82 + f * 0.0006;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%,#2a2018 0%,#0a0806 80%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 900, background: "linear-gradient(180deg,#efe4c8,#e2d4b2)", transform: `scale(${sc}) rotate(-2deg)`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", padding: "50px 56px", fontFamily: "Georgia, serif", color: "#2a2016", position: "relative" }}>
        <div style={{ textAlign: "center", fontSize: 54, fontWeight: 700, letterSpacing: 4, borderBottom: "3px double #2a2016", paddingBottom: 10 }}>THE SHIPBUILDER</div>
        <div style={{ textAlign: "center", fontSize: 20, letterSpacing: 6, margin: "10px 0 24px" }}>EDIÇÃO ESPECIAL · 1911</div>
        <svg width="648" height="150" viewBox="0 0 648 150">
          <rect x="40" y="90" width="560" height="34" fill="#2a2016" />
          <rect x="140" y="64" width="380" height="26" fill="#6a5a44" />
          {[200, 280, 360, 440].map((x) => <rect key={x} x={x} y="14" width="34" height="52" fill="#2a2016" transform={`skewX(-6)`} />)}
          <line x1="0" y1="124" x2="648" y2="124" stroke="#2a2016" strokeWidth="2" />
        </svg>
        {Array.from({ length: 13 }, (_, i) => (
          <div key={i} style={{ height: 10, background: "rgba(42,32,22,0.22)", margin: "12px 0", width: `${86 + rand(`mg${i}`) * 14}%` }} />
        ))}
        <div style={{ position: "absolute", left: 56, right: 56, top: 560, fontSize: 40, fontStyle: "italic", textAlign: "center" }}>
          <span style={{ background: `linear-gradient(90deg, rgba(255,210,90,0.85) ${hl * 100}%, transparent ${hl * 100}%)`, padding: "0 8px" }}>“practically unsinkable”</span>
        </div>
      </div>
      <div style={{ position: "absolute", bottom: BAR + 40, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 40, letterSpacing: 6, color: "#ffd27a", opacity: hl, textShadow: "0 2px 12px rgba(0,0,0,0.9)" }}>"PRATICAMENTE INAFUNDÁVEL"</div>
    </AbsoluteFill>
  );
};

/** Faixas pretas de cinema (2,39:1). */
const Letterbox: React.FC = () => (
  <>
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: BAR, background: "#000" }} />
    <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: BAR, background: "#000" }} />
  </>
);

/* ------------------------------------------------------------------ cenários novos desta parte */

/** Salão da 1ª classe: painéis de madeira, colunas, lustre, mesa redonda, piano. 1 u = 1 m. */
const FirstClassSalon: React.FC<{ f: number }> = ({ f }) => (
  <group>
    {Array.from({ length: 16 }, (_, i) => (
      <mesh key={i} position={[0, -0.05, -4 + i * 0.5]} receiveShadow>
        <boxGeometry args={[12, 0.1, 0.49]} />
        <meshStandardMaterial color={i % 2 ? "#5a2a22" : "#6a3428"} flatShading />
      </mesh>
    ))}
    <mesh position={[0, 2, -4]}><boxGeometry args={[12, 4, 0.2]} /><meshStandardMaterial color="#c8a878" flatShading /></mesh>
    {Array.from({ length: 6 }, (_, i) => (
      <mesh key={`p${i}`} position={[-5 + i * 2, 1.6, -3.88]}><boxGeometry args={[1.4, 2.2, 0.04]} /><meshStandardMaterial color="#a8865a" flatShading /></mesh>
    ))}
    {[-4, 4].map((x) => (
      <group key={x}>
        <Rod a={[x, 0, -2]} b={[x, 4, -2]} r={0.22} c="#e8e0cc" seg={12} />
        <mesh position={[x, 3.85, -2]}><boxGeometry args={[0.7, 0.3, 0.7]} /><meshStandardMaterial color="#c9a24a" metalness={0.5} roughness={0.35} /></mesh>
      </group>
    ))}
    {/* lustre */}
    <group position={[0, 3.3, -1]}>
      <Rod a={[0, 0.5, 0]} b={[0, 0, 0]} r={0.02} c="#c9a24a" seg={4} />
      <mesh><torusGeometry args={[0.55, 0.04, 6, 24]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} /></mesh>
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.55, 0.08, Math.sin((i / 8) * Math.PI * 2) * 0.55]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#fff0c8" toneMapped={false} /></mesh>
      ))}
      <pointLight intensity={5} distance={12} color="#ffe0a8" />
    </group>
    {/* mesa com toalha e taças */}
    <group position={[0.6, 0, 0.2]}>
      <mesh position={[0, 0.72, 0]}><cylinderGeometry args={[0.7, 0.7, 0.04, 24]} /><meshStandardMaterial color="#f4f0e6" /></mesh>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.72, 0.6, 0.64, 24, 1, true]} /><meshStandardMaterial color="#f4f0e6" /></mesh>
      {[0, 2, 4].map((i) => <mesh key={i} position={[Math.cos(i) * 0.4, 0.82, Math.sin(i) * 0.4]}><cylinderGeometry args={[0.04, 0.02, 0.14, 8]} /><meshStandardMaterial color="#e8f4ff" transparent opacity={0.6} /></mesh>)}
    </group>
    {/* piano */}
    <group position={[-3.2, 0, -2.6]}>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[1.5, 1.0, 0.6]} /><meshStandardMaterial color="#121214" roughness={0.3} /></mesh>
      <mesh position={[0, 0.78, 0.32]}><boxGeometry args={[1.3, 0.06, 0.14]} /><meshStandardMaterial color="#f4f0e6" /></mesh>
    </group>
    {void f}
  </group>
);

/** Cabine da 3ª classe: beliches de ferro, malas, vigia. 1 u = 1 m. */
const ThirdClass: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <mesh position={[0, -0.05, 0]} receiveShadow><boxGeometry args={[8, 0.1, 7]} /><meshStandardMaterial color="#8a8274" flatShading /></mesh>
    <mesh position={[0, 1.4, -3]}><boxGeometry args={[8, 2.8, 0.15]} /><meshStandardMaterial color="#e8e2d2" flatShading /></mesh>
    {Array.from({ length: 12 }, (_, i) => <mesh key={i} position={[-3.8 + i * 0.7, 1.4, -2.92]}><boxGeometry args={[0.03, 2.8, 0.02]} /><meshStandardMaterial color="#c8c0ae" /></mesh>)}
    {/* vigia */}
    <group position={[0, 1.8, -2.9]}>
      <mesh><ringGeometry args={[0.22, 0.3, 20]} /><meshStandardMaterial color="#c9a24a" metalness={0.6} /></mesh>
      <mesh><circleGeometry args={[0.22, 20]} /><meshBasicMaterial color="#9fc4e0" /></mesh>
    </group>
    {/* beliches */}
    {[-2.6, 2.6].map((x) => (
      <group key={x} position={[x, 0, -2.2]}>
        {[[-0.95, -0.4], [0.95, -0.4], [-0.95, 0.4], [0.95, 0.4]].map(([dx, dz], i) => <Rod key={i} a={[dx, 0, dz]} b={[dx, 1.8, dz]} r={0.03} c="#e8e2d2" seg={5} />)}
        {[0.45, 1.35].map((y) => (
          <group key={y}>
            <mesh position={[0, y, 0]}><boxGeometry args={[1.9, 0.08, 0.8]} /><meshStandardMaterial color="#e8e2d2" /></mesh>
            <mesh position={[0, y + 0.08, 0]}><boxGeometry args={[1.8, 0.1, 0.75]} /><meshStandardMaterial color="#9a7a5a" flatShading /></mesh>
          </group>
        ))}
      </group>
    ))}
    {/* malas */}
    {[[-1.2, 0.3, "#6a4a2a"], [-0.7, 0.6, "#4a3a2a"], [1.0, 0.2, "#7a5a3a"]].map(([x, z, c], i) => (
      <mesh key={i} position={[x as number, 0.2, z as number]} rotation={[0, i * 0.4, 0]}><boxGeometry args={[0.6, 0.4, 0.25]} /><meshStandardMaterial color={c as string} flatShading /></mesh>
    ))}
    <pointLight position={[0, 2.4, 0]} intensity={2.6} distance={9} color="#ffe0a8" />
    {void f}
  </group>
);

/* ------------------------------------------------------------------ elementos repetidos */

const Sky: React.FC<{ f: number; n?: number; r?: number; p?: Vec3 }> = ({ f, n = 900, r = 140, p = [0, 0, 0] }) => (
  <group position={p}><Stars count={n} radius={r} frame={f} /></group>
);
const DayWater: React.FC<{ y?: number }> = ({ y = 0 }) => (
  <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y - 0.01, 0]}>
    <planeGeometry args={[6000, 6000]} />
    <meshBasicMaterial color="#2f5f88" />
  </mesh>
);
const CROWD: [Role, string?][] = [["gent"], ["lady"], ["lady", "#2a3a5a"], ["steerageMan"], ["steerageWoman"], ["child"], ["gent", "#2a2622"], ["officer"], ["lady", "#4a5a3a"], ["steerageMan", "#3a3a44"], ["steerageWoman", "#5a3a3a"], ["gent"], ["lady", "#6a3a2a"], ["steerageMan", "#4a4038"], ["child"], ["gent", "#1c2430"]];
/** Iceberg escurecido (noite sem lua: quase uma silhueta). */
const DarkBerg: React.FC<{ f: number; k?: number }> = ({ f, k = 0.62 }) => (
  <Treat tint={["#16222e", k]}><Iceberg f={f} under={false} /></Treat>
);
const FLOOD0 = Array(16).fill(0);

/* ================================================================== A PARTE 1 */

export const DocPart1: React.FC = () => {
  const g = useCurrentFrame();
  const shipX = (lf: number, x0: number) => x0 + lf * 0.035; // ~10 m/s
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* A · mar à noite, o navio iluminado (0–8,5 s) */}
      <Shot from={0} to={S(8.5)} fin={30}>
        <Cine bg={NIGHT} fov={34} keys={[[0, [2, 3.4, 40], [-1, 2, 0]], [S(8.5), [9, 2.8, 30], [6, 2.2, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={150} moonX={-40} /><group position={[shipX(f, -6), 0, 0]}><TitanicHero f={f} lights={1} smoke={0.5} /></group></>)}
        </Cine>
        <Caption text="14 DE ABRIL DE 1912" sub="23h40 · ATLÂNTICO NORTE" from={S(3.4)} len={S(4.8)} />
      </Shot>
      {/* B · subindo o mastro até o cesto da gávea (8,5–12,4 s) */}
      <Shot from={S(8.5)} to={S(12.4)}>
        <Cine bg={NIGHT} fov={46} keys={[[0, [3.6, -7, 4.8], [0.9, -2, 0]], [S(2.2), [3.0, 0.6, 3.4], [0.9, 0.9, 0]], [S(3.9), [-0.3, 2.05, 1.7], [6, 0.7, -0.3]]]}>
          {(f) => (<><Sky f={f} n={700} r={60} /><group position={[0, -30, 0]} scale={10}><NightSea f={f} size={120} seg={110} moonX={-8} /></group><CrowsNest f={f} /><Figure1912 role="seaman" frame={f} position={[NEST_X + 0.05, 0.05, 0.12]} rotY={Math.PI / 2} scale={P} seed={5} /></>)}
        </Cine>
      </Shot>
      {/* C · a sombra à frente (vista do cesto) (12,4–17 s) */}
      <Shot from={S(12.4)} to={S(17)}>
        <Cine bg={NIGHT} fov={40} keys={[[0, [0.2, 1.8, 0], [150, -44, 0]], [S(4.6), [0.4, 1.8, 0], [150, -45, 3]]]}>
          {(f) => (<><Sky f={f} n={900} r={300} /><group position={[0, -39, 0]} scale={10}><NightSea f={f} size={200} seg={140} moonX={-30} /></group><group position={[-107.2, -39, 0]} scale={10}><TitanicHero f={f} lights={1} /></group><group position={[interpolate(f, [0, S(4.6)], [330, 210]), -39, 12]} scale={10}><DarkBerg f={f} k={0.68} /></group></>)}
        </Cine>
      </Shot>
      {/* D · o sino três vezes e o telefone (17–21,6 s) */}
      <Shot from={S(17)} to={S(21.6)}>
        <Cine bg={NIGHT} fov={44} keys={[[0, [3.6, 1.6, 2.4], [0.7, 1.2, 0]], [S(4.6), [3.1, 1.5, 2.0], [0.7, 1.2, 0]]]}>
          {(f) => (<><Sky f={f} n={700} r={60} /><group position={[0, -30, 0]} scale={10}><NightSea f={f} size={120} seg={110} moonX={-8} /></group><CrowsNest f={f} bell={f < S(2.2) ? 1 : 0} /><Figure1912 role="seaman" frame={f} position={[NEST_X + 0.05, 0.05, 0.12]} rotY={Math.PI / 2 + 0.5} scale={P} seed={5} point={f > S(2.4) ? 1 : 0.4} /></>)}
        </Cine>
      </Shot>
      {/* E · na ponte: "Iceberg! Bem à frente!" (21,6–25 s) */}
      <Shot from={S(21.6)} to={S(25)}>
        <Cine bg={NIGHT} fov={56} light="interior" keys={[[0, [-2.4, 1.75, 0.9], [6, 1.25, -0.2]], [S(3.4), [-1.6, 1.7, 0.6], [6, 1.2, 0.2]]]}>
          {(f) => (<><group position={[-84, -22.5, 0]} scale={10}><TitanicHero f={f} lights={1} cutBridge /></group><group position={[0, -22.5, 0]} scale={4}><NightSea f={f} size={200} seg={120} moonX={20} /></group><Sky f={f} n={700} r={140} p={[150, 30, 0]} /><Bridge f={f} wheel={interpolate(f, [S(0.6), S(3.2)], [0, -2.6], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} tele={interpolate(f, [S(0.3), S(0.9)], [0, -1.1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /><Figure1912 role="seaman" frame={f} position={[0.75, 0, 0]} rotY={Math.PI / 2} scale={P} seed={2} point={0.6} /><Figure1912 role="officer" frame={f} position={[1.9, 0, 1.0]} rotY={Math.PI / 2 - 0.3 - Math.min(1, f / 20) * 1.6} scale={P} seed={4} point={f > 12 ? 1 : 0} /></>)}
        </Cine>
      </Shot>
      {/* F · menos de 40 segundos: o navio e o gelo (25–28 s) */}
      <Shot from={S(25)} to={S(28)}>
        <Cine bg={NIGHT} fov={36} keys={[[0, [6, 7, 30], [11, 1.2, 0]], [S(3), [9, 5, 24], [13, 1.2, 1]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={150} moonX={-40} /><group position={[shipX(f, 0), 0, 0]}><TitanicHero f={f} lights={1} /></group><group position={[22, 0, 2.2]} scale={0.85}><DarkBerg f={f} k={0.45} /></group></>)}
        </Cine>
      </Shot>
      {/* G · flash para o futuro: o navio partido (28–36,3 s), sem cor */}
      <Shot from={S(28)} to={S(36.3)} fin={8} fout={20}>
        <Cine bg={NIGHT} fov={44} filter="grayscale(0.75) brightness(0.85) contrast(1.1)" keys={[[0, [-4, 2.4, 28], [-2.5, 1.6, 0]], [S(8.3), [-3, 1.2, 22], [-2.5, 1.0, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={160} seg={140} moonX={-30} />
            <group position={[-1.4, -1.4 - f * 0.004, 0]} rotation={[0, 0, -0.32 - f * 0.0008]}><group position={[2, 0, 0]}><Treat clip={{ normal: [1, 0, 0], constant: 2 }}><TitanicHero f={f} lights={0.2} /></Treat></group></group>
            <group position={[-2.9, -0.1 - f * 0.006, 0]} rotation={[0, 0, -0.42 - f * 0.0006]}><group position={[2, 0, 0]}><Treat clip={{ normal: [-1, 0, 0], constant: -2 }}><TitanicHero f={f} lights={f < S(4.6) ? 1 : 0} /></Treat></group></group>
          </>)}
        </Cine>
      </Shot>
      {/* H · "não foi só o iceberg": o navio de frente, o gelo em primeiro plano (36,3–41,6 s) */}
      <Shot from={S(36.3)} to={S(41.6)} fin={20}>
        <Cine bg={NIGHT} fov={38} keys={[[0, [42, 2.2, 14], [0, 2, 0]], [S(5.3), [36, 2.4, 11], [0, 2, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={220} seg={150} moonX={20} /><group position={[shipX(f, -2), 0, 0]}><TitanicHero f={f} lights={1} smoke={0.4} /></group><group position={[28, 0, 9]} scale={0.7}><DarkBerg f={f} k={0.5} /></group></>)}
        </Cine>
      </Shot>
      {/* I · "voltar quatro dias": a câmera sobe e escurece (41,6–47,4 s) */}
      <Shot from={S(41.6)} to={S(47.4)} fout={40}>
        <Cine bg={NIGHT} fov={40} keys={[[0, [10, 3, 22], [4, 2, 0]], [S(5.8), [2, 30, 40], [0, 30, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={150} moonX={-40} /><group position={[shipX(f, 2), 0, 0]}><TitanicHero f={f} lights={1} smoke={0.5} /></group></>)}
        </Cine>
      </Shot>
      {/* J · título (47,4–52,4 s) */}
      <Shot from={S(47.4)} to={S(52.4)}><TitleCard /></Shot>
      {/* K · Southampton, 10 de abril (52,4–60,5 s) */}
      <Shot from={S(52.4)} to={S(60.5)} fin={20}>
        <Cine bg={DAY} fov={56} light="day" keys={[[0, [-29, 3.2, -13], [-8, 12, 16]], [S(8.1), [-25, 3.6, -11], [-6, 12.5, 16]]]}>
          {(f) => (<><DayWater y={-2} /><Quay /><group position={[30, -2, 17.5]} scale={10}><TitanicHero f={f} smoke={1} /></group>{CROWD.map(([r, t], i) => <Figure1912 key={i} role={r} tint={t} frame={f} position={[-31 + (i % 8) * 1.9 + (i >= 8 ? 0.9 : 0), 1, -0.4 + (i >= 8 ? -1.5 : 0)]} rotY={Math.PI * 0.15 + (i % 3) * 0.1} scale={P} seed={i} wave={i % 3 === 0 ? 1 : 0} />)}<Mascot frame={f} position={[-27.2, 1, 0.4]} scale={WS.mascot} rotY={0.5} wave={1} /></>)}
        </Cine>
        <ChapterTag n={1} title="O INAFUNDÁVEL" from={S(0.3)} len={S(4.4)} />
      </Shot>
      {/* L · o maior objeto em movimento (60,5–68,5 s) */}
      <Shot from={S(60.5)} to={S(68.5)}>
        <Cine bg={DAY} fov={34} light="day" keys={[[0, [-14, 9, 30], [0, 1.6, 0]], [S(8), [8, 7, 30], [1, 1.6, 0]]]}>
          {(f) => (<><DayWater /><group position={[shipX(f, -3), 0, 0]}><TitanicHero f={f} smoke={1} /></group></>)}
        </Cine>
        <Caption text="269 METROS" sub="O MAIOR OBJETO EM MOVIMENTO JÁ CONSTRUÍDO" from={S(0.6)} len={S(7.2)} pos="tl" />
      </Shot>
      {/* M1 · "três mundos": o corte com as classes (68,5–71,6 s) */}
      <Shot from={S(68.5)} to={S(71.6)} fin={12}>
        <Cine bg={STUDIO} fov={30} light="day" keys={[[0, [0.6, 0.9, 33], [0.6, 0.7, 0]], [S(3.1), [0.6, 0.9, 30], [0.6, 0.7, 0]]]}>
          {(f) => (<group scale={[1, 1.8, 1]}><HullCutaway f={f} flood={FLOOD0} />{[[1.0, 1.5, "#d4ac4c"], [0.6, 1.0, "#c0c4cc"], [0.28, 0.55, "#b08060"]].map(([y0, y1, c], i) => <mesh key={i} position={[0.6, ((y0 as number) + (y1 as number)) / 2, 0.32]}><boxGeometry args={[22, (y1 as number) - (y0 as number) - 0.04, 0.02]} /><meshBasicMaterial color={c as string} transparent opacity={0.35 * clamp(f / 20 - i * 0.6, 0, 1)} depthWrite={false} /></mesh>)}</group>)}
        </Cine>
        <Caption text="1ª · 2ª · 3ª CLASSE" sub="TRÊS MUNDOS NO MESMO NAVIO" from={S(0.3)} len={S(2.8)} pos="tl" />
      </Shot>
      {/* M2 · 1ª classe (71,6–76,65 s) */}
      <Shot from={S(71.6)} to={S(76.65)}>
        <Cine bg="#120c08" fov={50} light="interior" keys={[[0, [4.4, 1.7, 4.2], [-0.4, 1.4, -1.6]], [S(5), [3.4, 1.6, 3.6], [-0.8, 1.4, -1.8]]]}>
          {(f) => (<><FirstClassSalon f={f} /><Figure1912 role="gent" frame={f} position={[1.4, 0, 0.8]} rotY={-1.1} scale={P} seed={1} /><Figure1912 role="lady" frame={f} position={[0.1, 0, 0.9]} rotY={1.0} scale={P} seed={2} /><Figure1912 role="lady" tint="#2a3a5a" frame={f} position={[-1.6, 0, -1.2]} rotY={0.4} scale={P} seed={3} /><Figure1912 role="gent" tint="#2a2622" frame={f} position={[-2.4, 0, -0.6]} rotY={0.9} scale={P} seed={4} /></>)}
        </Cine>
      </Shot>
      {/* M3 · 3ª classe (76,65–82,15 s) */}
      <Shot from={S(76.65)} to={S(82.15)}>
        <Cine bg="#0c0a08" fov={50} light="interior" keys={[[0, [3.6, 1.6, 3.6], [-0.4, 1.0, -1.6]], [S(5.5), [2.8, 1.5, 3.2], [-0.6, 1.0, -1.8]]]}>
          {(f) => (<><ThirdClass f={f} /><Figure1912 role="steerageMan" frame={f} position={[-0.2, 0, 0.4]} rotY={0.6} scale={P} seed={5} /><Figure1912 role="steerageWoman" frame={f} position={[0.7, 0, 0.6]} rotY={-0.4} scale={P} seed={6} /><Figure1912 role="child" frame={f} position={[0.25, 0, 1.0]} rotY={0.2} scale={P} seed={7} /><Figure1912 role="steerageWoman" tint="#5a3a3a" frame={f} position={[-2.2, 0, -1.0]} rotY={0.9} scale={P} seed={8} /></>)}
        </Cine>
      </Shot>
      {/* N1 · "a grande aposta dos engenheiros": o casco por fora (82,15–86,55 s) */}
      <Shot from={S(82.15)} to={S(86.55)} fout={14}>
        <Cine bg={DAY} fov={34} light="day" keys={[[0, [2, 1.4, 26], [2, 0.6, 0]], [S(4.4), [2, 1.0, 13], [2, 0.4, 0]]]}>
          {(f) => (<><DayWater /><TitanicHero f={f} smoke={1} /></>)}
        </Cine>
      </Shot>
      {/* N2–N4 · os compartimentos (86,55–103,77 s) */}
      <Shot from={S(86.55)} to={S(103.77)} fin={14}>
        <Cine bg={STUDIO} fov={30} light="day" keys={[[0, [0.6, 1.2, 34], [0.6, 0.7, 0]], [S(5.8), [0.6, 1.1, 31], [0.6, 0.7, 0]], [S(11.6), [1.0, 0.9, 20], [1.0, 0.6, 0]], [S(17.2), [6, 0.9, 20], [6, 0.6, 0]]]}>
          {(f) => {
            const one = clamp((f - S(6.2)) / 40, 0, 1) * 0.55;
            const four = clamp((f - S(12.0)) / 60, 0, 1) * 0.75;
            const fl = FLOOD0.map((_, i) => (i === 7 ? one : 0) + (i >= 12 ? four : 0));
            return (<group scale={[1, 1.8, 1]}><HullCutaway f={f} flood={fl} /><mesh position={[0.6, 0, 0.36]}><boxGeometry args={[28, 0.012, 0.02]} /><meshBasicMaterial color="#5ab0ff" /></mesh></group>);
          }}
        </Cine>
        <Caption text="16 COMPARTIMENTOS" sub="SEPARADOS POR PAREDES DE AÇO" from={S(0.5)} len={S(5.2)} pos="tl" />
        <Caption text="A ÁGUA FICA PRESA" sub="SE UM COMPARTIMENTO ALAGA" from={S(6.4)} len={S(5.2)} pos="tl" />
        <Caption text="ATÉ 4 ALAGADOS" sub="E ELE CONTINUARIA BOIANDO" from={S(12.2)} len={S(5)} pos="tl" />
      </Shot>
      {/* O · a revista: "praticamente inafundável" (103,77–109,87 s) */}
      <Shot from={S(103.77)} to={S(109.87)} fin={12}><MagazinePage /></Shot>
      {/* P · passageiros confiantes no convés (109,87–115,2 s) */}
      <Shot from={S(109.87)} to={S(115.2)}>
        <Cine bg={DAY} fov={48} light="day" keys={[[0, [-6, 1.7, 3], [3, 1.4, -0.5]], [S(5.3), [-4, 1.7, 2.6], [5, 1.4, -0.5]]]}>
          {(f) => (<><DayWater y={-18} /><mesh position={[0, -0.05, 0]} receiveShadow><boxGeometry args={[30, 0.1, 6]} /><meshStandardMaterial color="#b89a6e" flatShading /></mesh><mesh position={[0, 0.55, 3]}><boxGeometry args={[30, 0.06, 0.08]} /><meshStandardMaterial color="#e8e0cc" /></mesh><mesh position={[0, 1.4, -3]}><boxGeometry args={[30, 2.8, 0.2]} /><meshStandardMaterial color="#ece8de" flatShading /></mesh>{CROWD.slice(0, 9).map(([r, t], i) => <Figure1912 key={i} role={r} tint={t} frame={f} position={[-3 + i * 1.3 + f * 0.012 * (i % 2 ? 1 : -1), 0, (i % 3) * 0.7 - 0.6]} rotY={i % 2 ? Math.PI / 2 : -Math.PI / 2} walk={1} scale={P} seed={i + 20} />)}</>)}
        </Cine>
      </Shot>
      {/* Q1 · o navio no oceano, à noite (115,2–118,5 s) */}
      <Shot from={S(115.2)} to={S(118.5)} fin={12}>
        <Cine bg={NIGHT} fov={30} keys={[[0, [-30, 4, 40], [0, 2, 0]], [S(3.3), [-26, 3.6, 36], [0, 2, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={240} seg={150} moonX={-40} /><group position={[shipX(f, 0), 0, 0]}><TitanicHero f={f} lights={1} smoke={0.4} /></group></>)}
        </Cine>
      </Shot>
      {/* Q2 · "o mar já estava avisando": a sala de rádio (118,5–123 s) */}
      <Shot from={S(118.5)} to={PART1_FRAMES} fout={24}>
        <Cine bg="#0c0a08" fov={46} light="interior" keys={[[0, [2.2, 1.6, 2.2], [0, 1.1, -1.2]], [S(4.5), [1.4, 1.4, 1.4], [0.3, 1.1, -1.3]]]}>
          {(f) => (<><RadioRoom f={f} papers={0.15 + clamp(f / S(4), 0, 1) * 0.2} /><Figure1912 role="radio" frame={f} position={[0.55, 0, -0.55]} rotY={Math.PI + 0.4} scale={P} seed={12} /></>)}
        </Cine>
      </Shot>
      <Letterbox />
      <Part1Audio />
      {void g}
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ áudio */

const sfx = (name: string, at: number, volume: number, len?: number) => ({ name, at, volume, len });
const SFX = [
  sfx("ocean-amb", 0, 0.32, 47), sfx("wind-cold", 8.5, 0.18), sfx("sub-bell", 17.3, 0.55), sfx("sub-bell", 17.9, 0.55), sfx("sub-bell", 18.5, 0.55), sfx("click", 19.6, 0.4),
  sfx("clunk", 22.2, 0.45), sfx("rumble-soft", 25, 0.35), sfx("power-down", 28.3, 0.25), sfx("rumble", 29, 0.3), sfx("whoosh-soft", 41.8, 0.25),
  sfx("final", 47.5, 0.45), sfx("rumble-soft", 47.5, 0.3), sfx("murmur", 52.4, 0.28, 8), sfx("whoosh-soft", 60.5, 0.2), sfx("shimmer", 71.8, 0.15), sfx("water-rise", 92.8, 0.3), sfx("flood-loop", 98.6, 0.22, 5),
  sfx("murmur", 109.9, 0.2, 5.3), sfx("ocean-amb", 115.2, 0.28, 4), sfx("spark", 118.6, 0.4), sfx("tick", 119.4, 0.25), sfx("spark", 120.6, 0.3),
];
const Part1Audio: React.FC = () => (
  <>
    <Sequence from={S(1.0)} layout="none"><Audio src={staticFile("audio/doc/bloco0.wav")} volume={1} /></Sequence>
    <Sequence from={S(54.0)} layout="none"><Audio src={staticFile("audio/doc/bloco1.wav")} volume={1} /></Sequence>
    <Audio src={staticFile("audio/doc/musica-parte1.wav")} volume={0.9} />
    {SFX.map((c, i) => (
      <Sequence key={i} from={S(c.at)} durationInFrames={c.len ? S(c.len) : undefined} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.name}.wav`)} volume={c.volume} loop={Boolean(c.len)} />
      </Sequence>
    ))}
  </>
);
