import { Audio } from "@remotion/media";
import { useMemo } from "react";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { ExtrudeGeometry, Shape } from "three";
import { Mascot } from "../components/Mascot";
import { Stars } from "../components/SpaceScene";
import { Bridge, CrowsNest, HullCutaway, Iceberg, NEST_X, RadioRoom, Rod, TitanicHero } from "../components/Doc3D";
import { BoatDeck, Treat } from "../components/Doc3D2";
import { Figure1912 } from "../components/Figures1912";
import { NightSea } from "../components/Titanic";
import { FONT } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { BAR, Caption, ChapterTag, Cine, H, Letterbox, NIGHT, P, S, Shot, STUDIO, WS } from "./kit";

// DOCUMENTÁRIO TITANIC — PARTE 2: capítulo 2 "Os avisos" + capítulo 3 "O impacto". 146 s.
export const PART2_FRAMES = 4380;
const OFF2 = 2.6, OFF3 = 66.17;
const cl = (v: number, a: number, b: number) => interpolate(v, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

/* ------------------------------------------------------------------ MAPA DO ATLÂNTICO NORTE */

const ll = (lon: number, lat: number, y = 0): Vec3 => [(lon + 37) * 0.25, y, -(lat - 46) * 0.25];
const GB: [number, number][] = [[-5.7, 50.0], [-1.0, 50.7], [1.4, 51.3], [1.7, 52.7], [0.2, 53.6], [-0.5, 54.5], [-1.6, 55.6], [-2.0, 57.6], [-3.1, 58.6], [-5.0, 58.6], [-6.2, 56.5], [-5.0, 55.0], [-3.0, 54.0], [-3.2, 53.3], [-4.7, 52.8], [-5.3, 51.7]];
const IE: [number, number][] = [[-6.0, 52.2], [-6.2, 53.9], [-5.5, 54.7], [-7.3, 55.3], [-8.5, 54.6], [-10.0, 53.5], [-10.3, 51.8], [-8.5, 51.6]];
const FR: [number, number][] = [[-4.8, 48.4], [-1.6, 48.7], [-1.5, 49.7], [0.3, 49.5], [1.6, 50.9], [2.6, 51.1], [4, 46], [-1.5, 46.2], [-2.5, 47.2]];
const NA: [number, number][] = [[-82, 30], [-80, 32], [-75.5, 35.3], [-76, 39], [-74, 40.6], [-70, 41.6], [-70, 43.8], [-66, 44.8], [-64, 44], [-60, 46], [-61, 47], [-64, 48.5], [-60, 50.2], [-56, 51.5], [-60, 53], [-62, 56], [-85, 56]];
const NF: [number, number][] = [[-59.4, 47.6], [-52.7, 46.6], [-52.6, 47.6], [-53.6, 49.5], [-55.5, 51.6], [-57.3, 50.7], [-59.4, 48.4]];
const Land: React.FC<{ poly: [number, number][] }> = ({ poly }) => {
  const g = useMemo(() => {
    const sh = new Shape();
    poly.forEach(([lo, la], i) => {
      const [x, , z] = ll(lo, la);
      if (i === 0) sh.moveTo(x, -z);
      else sh.lineTo(x, -z);
    });
    const e = new ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false });
    e.rotateX(-Math.PI / 2);
    return e;
  }, [poly]);
  return (
    <mesh geometry={g}>
      <meshStandardMaterial color="#6a7a5a" flatShading />
    </mesh>
  );
};
const ROUTE: [number, number][] = [[-1.4, 50.9], [-1.6, 49.9], [-8.3, 51.6], [-20, 48.5], [-35, 44.6], [-49.9, 41.7], [-60, 40.8], [-74, 40.6]];
const routePt = (u: number): Vec3 => {
  const n = ROUTE.length - 1, x = clamp(u, 0, 1) * n, i = Math.min(n - 1, Math.floor(x)), k = x - i;
  const a = ll(...ROUTE[i], 0.15), b = ll(...ROUTE[i + 1], 0.15);
  return [a[0] + (b[0] - a[0]) * k, 0.15, a[2] + (b[2] - a[2]) * k];
};
const WARN: [number, number][] = [[-49.5, 42.6], [-50.8, 42.0], [-48.2, 41.9], [-51.5, 43.1], [-49.0, 41.3], [-50.2, 43.4]];
const NorthAtlantic: React.FC<{ f: number; ship: number; warns: number; ice: number }> = ({ f, ship, warns, ice }) => {
  const sp = routePt(ship);
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[60, 40]} /><meshStandardMaterial color="#14304e" /></mesh>
      {[GB, IE, FR, NA, NF].map((p, i) => <Land key={i} poly={p} />)}
      {/* rota tracejada (planejada) */}
      {Array.from({ length: 90 }, (_, i) => {
        const a = routePt(i / 90), b = routePt((i + 0.5) / 90);
        return <Rod key={i} a={a} b={b} r={0.03} c={i / 90 <= ship ? "#ffd27a" : "#8a9ab0"} seg={4} />;
      })}
      {/* área de gelo */}
      {Array.from({ length: 40 }, (_, i) => {
        const [x, , z] = ll(-50 + (rand(`iz${i}`) - 0.5) * 4, 42.3 + (rand(`iy${i}`) - 0.5) * 2.4, 0.06);
        return <mesh key={i} position={[x, 0.08, z]} scale={0.12 + rand(`is${i}`) * 0.16}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#e8f4fa" transparent opacity={clamp(ice, 0, 1)} flatShading /></mesh>;
      })}
      {/* navio */}
      <mesh position={sp}><sphereGeometry args={[0.22, 14, 10]} /><meshBasicMaterial color="#ffd27a" toneMapped={false} /></mesh>
      <mesh position={[sp[0], 0.1, sp[2]]} rotation={[-Math.PI / 2, 0, 0]}><ringGeometry args={[0.35, 0.42 + 0.1 * Math.sin(f / 6), 24]} /><meshBasicMaterial color="#ffd27a" transparent opacity={0.6} /></mesh>
      {/* avisos de gelo (pinos vermelhos) */}
      {WARN.map(([lo, la], i) => {
        const k = clamp(warns * 6 - i, 0, 1);
        if (k <= 0) return null;
        const [x, , z] = ll(lo, la);
        return (
          <group key={i} position={[x, 0.2, z]} scale={k}>
            <mesh position={[0, 0.55, 0]}><sphereGeometry args={[0.2, 12, 8]} /><meshStandardMaterial color="#ff4a3d" emissive="#ff2a1a" emissiveIntensity={0.4} /></mesh>
            <mesh position={[0, 0.25, 0]} rotation={[Math.PI, 0, 0]}><coneGeometry args={[0.14, 0.45, 10]} /><meshStandardMaterial color="#ff4a3d" /></mesh>
          </group>
        );
      })}
      {/* cidades */}
      {[[-1.4, 50.9], [-74, 40.6]].map(([lo, la], i) => <mesh key={i} position={ll(lo, la, 0.2)}><cylinderGeometry args={[0.12, 0.12, 0.2, 10]} /><meshStandardMaterial color="#f4efe4" /></mesh>)}
    </group>
  );
};

/* ------------------------------------------------------------------ outros cenários */

/** Telegrama (2D) do aviso das 21h40 que não chegou à ponte. */
const Telegram: React.FC = () => {
  const f = useCurrentFrame();
  const stamp = cl(f, S(3.6), S(4.2));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%,#2a2018 0%,#0a0806 80%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 900, padding: "40px 50px", background: "linear-gradient(180deg,#f2e8cc,#e4d6b0)", transform: `rotate(1.5deg) scale(${1.15 + f * 0.0007})`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", fontFamily: "Courier New, monospace", color: "#2a2016", position: "relative" }}>
        <div style={{ fontFamily: "Georgia, serif", fontSize: 40, fontWeight: 700, letterSpacing: 6, borderBottom: "2px solid #2a2016", paddingBottom: 8 }}>MARCONIGRAM</div>
        <div style={{ fontSize: 26, margin: "18px 0" }}>RECEBIDO: 14 ABR 1912 · 21h40</div>
        <div style={{ fontSize: 30, lineHeight: 1.45 }}>"…MUITO GELO PESADO E GRANDE NÚMERO DE ICEBERGS GRANDES. TAMBÉM CAMPO DE GELO…"</div>
        <div style={{ position: "absolute", right: 40, bottom: 26, transform: `rotate(-12deg) scale(${0.6 + stamp * 0.4})`, opacity: stamp, border: "5px solid #b8281e", color: "#b8281e", padding: "6px 18px", fontFamily: FONT, fontWeight: 900, fontSize: 30, letterSpacing: 3 }}>NÃO CHEGOU À PONTE</div>
      </div>
      <div style={{ position: "absolute", bottom: BAR + 36, fontFamily: FONT, fontSize: 18, letterSpacing: 3, color: "#a89a84" }}>TEXTO RESUMIDO DO AVISO RECEBIDO PELO RÁDIO</div>
    </AbsoluteFill>
  );
};

/** Relógio grande (2D) marcando a hora. */
const BigClock: React.FC<{ h: number; m: number; from: number; len: number }> = ({ h, m, from, len }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 15, 0, 1), clamp((len - f) / 15, 0, 1));
  const am = (m / 60) * 360, ah = ((h % 12) / 12) * 360 + m / 2;
  return (
    <div style={{ position: "absolute", right: 140, top: BAR + 50, opacity: a }}>
      <svg width="220" height="220" viewBox="-110 -110 220 220">
        <circle r="100" fill="rgba(244,236,216,0.92)" stroke="#2a2016" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1="-86" x2="0" y2="-74" stroke="#2a2016" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
        <line x1="0" y1="10" x2="0" y2="-52" stroke="#2a2016" strokeWidth="8" strokeLinecap="round" transform={`rotate(${ah})`} />
        <line x1="0" y1="12" x2="0" y2="-80" stroke="#b8281e" strokeWidth="5" strokeLinecap="round" transform={`rotate(${am})`} />
        <circle r="7" fill="#2a2016" />
      </svg>
      <div style={{ textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 34, color: "#f4efe4", letterSpacing: 4, marginTop: 6, textShadow: "0 2px 10px #000" }}>23h40</div>
    </div>
  );
};

/** Forma de gelo inclinada: a água transborda de uma casinha para a próxima. tilt 0..1, flow 0..1. */
const IceTray: React.FC<{ tilt: number; flow: number }> = ({ tilt, flow }) => {
  const n = 6;
  return (
    <group rotation={[0, 0, -0.32 * tilt]}>
      <mesh position={[0, -0.06, 0]}><boxGeometry args={[n * 0.6 + 0.1, 0.06, 0.7]} /><meshStandardMaterial color="#cfe0ec" transparent opacity={0.85} roughness={0.1} /></mesh>
      {Array.from({ length: n + 1 }, (_, i) => <mesh key={i} position={[-n * 0.3 + i * 0.6, 0.12, 0]}><boxGeometry args={[0.04, 0.36, 0.7]} /><meshStandardMaterial color="#e0ecf4" transparent opacity={0.8} roughness={0.1} /></mesh>)}
      {[0.35, -0.35].map((z) => <mesh key={z} position={[0, 0.12, z]}><boxGeometry args={[n * 0.6, 0.36, 0.03]} /><meshStandardMaterial color="#e0ecf4" transparent opacity={0.45} roughness={0.1} depthWrite={false} /></mesh>)}
      {Array.from({ length: n }, (_, i) => {
        // a casinha mais baixa (direita = i alto) enche primeiro e transborda para a vizinha
        const j = n - 1 - i;
        const lvl = clamp(flow * n * 1.15 - j, 0, 1) * 0.3;
        if (lvl < 0.005) return null;
        return <mesh key={`w${i}`} position={[-n * 0.3 + 0.3 + i * 0.6, -0.03 + lvl / 2, 0]}><boxGeometry args={[0.54, lvl, 0.64]} /><meshStandardMaterial color="#3f8ad8" transparent opacity={0.75} roughness={0.15} depthWrite={false} /></mesh>;
      })}
    </group>
  );
};

/** Corredor de serviço (aço branco, tubulações, lâmpadas). 1 u = 1 m, corredor ao longo de z. */
const Corridor: React.FC = () => (
  <group>
    <mesh position={[0, -0.05, -6]}><boxGeometry args={[2.2, 0.1, 16]} /><meshStandardMaterial color="#6a6458" flatShading /></mesh>
    {[1.1, -1.1].map((x) => <mesh key={x} position={[x, 1.2, -6]}><boxGeometry args={[0.1, 2.4, 16]} /><meshStandardMaterial color="#e2ddd0" flatShading /></mesh>)}
    <mesh position={[0, 2.4, -6]}><boxGeometry args={[2.2, 0.1, 16]} /><meshStandardMaterial color="#d8d2c4" /></mesh>
    {[0.7, 0.45].map((y, i) => <Rod key={i} a={[0.95, 2.2 - i * 0.2, 2]} b={[0.95, 2.2 - i * 0.2, -14]} r={0.05} c={i ? "#8a5a3a" : "#7a7a82"} seg={6} />)}
    {Array.from({ length: 6 }, (_, i) => (
      <group key={i}>
        <mesh position={[0, 2.3, -i * 2.6]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh>
        <pointLight position={[0, 2.2, -i * 2.6]} intensity={1.2} distance={4} color="#ffd8a0" />
        {[1.05, -1.05].map((x) => <mesh key={x} position={[x, 1.2, -i * 2.6 - 1.3]}><boxGeometry args={[0.02, 2.4, 0.06]} /><meshStandardMaterial color="#b8b2a4" /></mesh>)}
      </group>
    ))}
  </group>
);

const Sky: React.FC<{ f: number; n?: number; r?: number; p?: Vec3 }> = ({ f, n = 900, r = 140, p = [0, 0, 0] }) => <group position={p}><Stars count={n} radius={r} frame={f} /></group>;
const DarkBerg: React.FC<{ f: number; k?: number; foam?: number; under?: boolean }> = ({ f, k = 0.62, foam = 1, under = false }) => (
  <Treat tint={["#16222e", k]}><Iceberg f={f} under={under} foam={foam} /></Treat>
);
const Z16 = Array(16).fill(0);

/* ================================================================== A PARTE 2 */

export const DocPart2: React.FC = () => {
  const shipX = (lf: number, x0: number) => x0 + lf * 0.035;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 1 · sala de rádio: mensagens o dia inteiro (0–8 s) */}
      <Shot from={0} to={S(8)} fin={20}>
        <Cine bg="#0c0a08" fov={46} light="interior" keys={[[0, [2.4, 1.7, 2.4], [0, 1.1, -1.2]], [S(8), [1.6, 1.5, 1.6], [0.2, 1.1, -1.3]]]}>
          {(f) => (<><RadioRoom f={f} papers={0.2 + cl(f, 0, S(8)) * 0.6} /><Figure1912 role="radio" frame={f} position={[0.55, 0, -0.55]} rotY={Math.PI + 0.4} scale={P} seed={12} /></>)}
        </Cine>
        <ChapterTag n={2} title="OS AVISOS" from={S(0.2)} len={S(4)} />
      </Shot>
      {/* 2 · mapa: a rota e os avisos de gelo (8–16 s) */}
      <Shot from={S(8)} to={S(16)}>
        <Cine bg="#081428" fov={36} light="day" keys={[[0, [0, 34, 12], [-0.5, 0, 1]], [S(8), [-6, 22, 9], [-6.5, 0, 1]]]}>
          {(f) => <NorthAtlantic f={f} ship={0.42 + cl(f, 0, S(7)) * 0.2} warns={cl(f, S(4.9), S(7.3))} ice={cl(f, S(0.2), S(2))} />}
        </Cine>
        <Caption text="PELO MENOS 6 AVISOS DE GELO" sub="EM 14 DE ABRIL, PELO RÁDIO" from={S(5)} len={S(2.9)} pos="tl" />
      </Shot>
      {/* 3 · alguns chegaram ao capitão (16–20,2 s) */}
      <Shot from={S(16)} to={S(20.2)}>
        <Cine bg={NIGHT} fov={50} light="interior" keys={[[0, [-1.6, 1.7, 2.2], [1.4, 1.3, -0.4]], [S(4.2), [-1.2, 1.65, 1.9], [1.4, 1.3, -0.4]]]}>
          {(f) => (<><group position={[-84, -22.5, 0]} scale={10}><TitanicHero f={f} lights={1} cutBridge /></group><group position={[0, -22.5, 0]} scale={4}><NightSea f={f} size={200} seg={100} /></group><Sky f={f} n={500} p={[150, 30, 0]} /><Bridge f={f} /><Figure1912 role="captain" frame={f} position={[1.4, 0, -0.9]} rotY={-0.8} scale={P} seed={6} point={0.5} /><Figure1912 role="officer" frame={f} position={[0.6, 0, -0.1]} rotY={2.2} scale={P} seed={4} point={1} /><mesh position={[0.95, 1.25, -0.5]} rotation={[-0.4, 0.6, 0]}><planeGeometry args={[0.21, 0.28]} /><meshStandardMaterial color="#f4efe2" side={2} /></mesh></>)}
        </Cine>
      </Shot>
      {/* 4 · operadores ocupados com mensagens dos passageiros (20,2–27,2 s) */}
      <Shot from={S(20.2)} to={S(27.2)}>
        <Cine bg="#0c0a08" fov={42} light="interior" keys={[[0, [1.8, 1.4, 0.6], [0.6, 0.9, -1.1]], [S(7), [1.4, 1.3, 0.3], [0.8, 0.85, -1.0]]]}>
          {(f) => (<><RadioRoom f={f} papers={1} /><Figure1912 role="radio" frame={f} position={[0.0, 0, -0.5]} rotY={Math.PI} scale={P} seed={12} /></>)}
        </Cine>
        <Caption text="MENSAGENS DOS PASSAGEIROS" sub="TELEGRAMAS PARTICULARES PAGOS, UM ATRÁS DO OUTRO" from={S(0.6)} len={S(6.2)} pos="tl" />
      </Shot>
      {/* 5 · o aviso das 21h40 (27,2–33,8 s) */}
      <Shot from={S(27.2)} to={S(33.8)} fin={12}><Telegram /></Shot>
      {/* 6 · a ~40 km/h (33,8–39,6 s) */}
      <Shot from={S(33.8)} to={S(39.6)}>
        <Cine bg={NIGHT} fov={38} keys={[[0, [-4, 2.4, 16], [2, 2, 0]], [S(5.8), [4, 2.4, 16], [8, 2, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={-40} /><group position={[shipX(f, -2), 0, 0]}><TitanicHero f={f} lights={1} smoke={0.6} /></group></>)}
        </Cine>
        <Caption text="~22 NÓS · ~40 KM/H" sub="PERTO DA VELOCIDADE MÁXIMA" from={S(0.4)} len={S(5.2)} />
      </Shot>
      {/* 7 · noite sem lua, mar espelhado (39,6–48,2 s) */}
      <Shot from={S(39.6)} to={S(48.2)} fin={14}>
        <Cine bg="linear-gradient(180deg,#000206 0%,#040a18 70%,#081428 100%)" fov={44} keys={[[0, [0, 3, 30], [0, 6, -40]], [S(8.6), [0, 2.4, 24], [0, 3, -40]]]}>
          {(f) => (<><Sky f={f} n={1400} r={160} /><NightSea f={f} size={300} seg={150} moonX={999} calm={0.1} /><group position={[shipX(f, -14), 0, -40]} scale={0.8}><TitanicHero f={f} lights={1} /></group></>)}
        </Cine>
        <Caption text="SEM LUA · MAR LISO" sub="NOITE DE 14 DE ABRIL" from={S(4.4)} len={S(4)} />
      </Shot>
      {/* 8 · sem ondas, sem espuma (48,2–54,8 s) */}
      <Shot from={S(48.2)} to={S(54.8)}>
        <Cine bg={NIGHT} fov={40} keys={[[0, [9, 1.4, 9], [0, 0.6, 0]], [S(6.6), [7.5, 1.0, 7.5], [0, 0.5, 0]]]}>
          {(f) => { const k = cl(f, S(1.5), S(4)); return (<><Sky f={f} n={700} r={80} /><group position={[0, 0.02, 0]}><NightSea f={f} size={60} seg={110} moonX={999} calm={1 - 0.9 * k} /></group><DarkBerg f={f} k={0.35 + 0.3 * k} foam={1 - k} /></>); }}
        </Cine>
        <Caption text="COM ONDAS: ESPUMA NA BASE" from={S(0.2)} len={S(1.8)} />
        <Caption text="SEM ONDAS: NADA DENUNCIA O GELO" from={S(3.2)} len={S(3.3)} />
      </Shot>
      {/* 9 · os vigias sem binóculos (54,8–59 s) */}
      <Shot from={S(54.8)} to={S(59)}>
        <Cine bg={NIGHT} fov={40} keys={[[0, [3.2, 1.6, 2.2], [0.8, 1.3, 0]], [S(4.2), [2.6, 1.6, 1.8], [0.8, 1.3, 0]]]}>
          {(f) => (<><Sky f={f} n={700} r={60} /><group position={[0, -30, 0]} scale={10}><NightSea f={f} size={120} seg={100} moonX={999} calm={0.2} /></group><CrowsNest f={f} /><Figure1912 role="seaman" frame={f} position={[NEST_X + 0.05, 0.05, 0.12]} rotY={Math.PI / 2 + 0.4} scale={P} seed={5} /></>)}
        </Cine>
        <Caption text="SEM BINÓCULOS" sub="SÓ OS OLHOS, NO ESCURO" from={S(0.3)} len={S(3.8)} />
      </Shot>
      {/* 10 · 23h40 (59–63,2 s) */}
      <Shot from={S(59)} to={S(63.2)} fout={24}>
        <Cine bg={NIGHT} fov={34} keys={[[0, [4, 6, 30], [14, 1.2, 0]], [S(4.2), [10, 4, 22], [16, 1.2, 1]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} /><group position={[shipX(f, 0), 0, 0]}><TitanicHero f={f} lights={1} /></group><group position={[24, 0, 2.2]} scale={0.85}><DarkBerg f={f} k={0.55} foam={0} /></group></>)}
        </Cine>
        <BigClock h={11} m={40} from={S(0.3)} len={S(3.6)} />
      </Shot>

      {/* 11 · cap. 3 — a ordem na ponte (63,2–71,9 s) */}
      <Shot from={S(63.2)} to={S(71.9)} fin={20}>
        <Cine bg={NIGHT} fov={56} light="interior" keys={[[0, [-2.4, 1.75, 0.9], [6, 1.25, -0.2]], [S(8.7), [-1.4, 1.7, 0.5], [6, 1.2, 0.3]]]}>
          {(f) => (<><group position={[-84, -22.5, 0]} scale={10}><TitanicHero f={f} lights={1} cutBridge /></group><group position={[0, -22.5, 0]} scale={4}><NightSea f={f} size={200} seg={100} moonX={999} calm={0.15} /></group><Sky f={f} n={700} p={[150, 30, 0]} /><group position={[60, -22.5, 9]} scale={12}><DarkBerg f={f} k={0.62} foam={0} /></group><Bridge f={f} wheel={interpolate(f, [S(3.3), S(7.5)], [0, -3.4], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} tele={interpolate(f, [S(5.6), S(6.2)], [0, -1.2], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })} /><Figure1912 role="seaman" frame={f} position={[0.75, 0, 0]} rotY={Math.PI / 2} scale={P} seed={2} point={0.6} /><Figure1912 role="officer" frame={f} position={[1.9, 0, 1.0]} rotY={Math.PI / 2 - 0.6} scale={P} seed={4} point={f > S(3.2) ? 1 : 0} /></>)}
        </Cine>
        <ChapterTag n={3} title="O IMPACTO" from={S(0.3)} len={S(3.6)} />
      </Shot>
      {/* 12 · vista de cima: vira devagar demais (71,9–76,4 s) */}
      <Shot from={S(71.9)} to={S(76.4)}>
        <Cine bg={NIGHT} fov={40} keys={[[0, [4, 30, 26], [6, 0, 1]], [S(4.5), [7, 28, 24], [8, 0, 1]]]}>
          {(f) => { const yaw = cl(f, 0, S(4.5)) * 0.12; return (<><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} /><group position={[shipX(f, 0), 0, 0]} rotation={[0, yaw, 0]}><TitanicHero f={f} lights={1} /></group><group position={[15.5, 0.55, 5.6]} scale={1.5}><Iceberg f={f} under={false} foam={0.6} /></group><pointLight position={[17.5, 12, 8]} intensity={30} distance={30} color="#cfe4ff" /></>); }}
        </Cine>
      </Shot>
      {/* 13 · no convés: ele raspa (76,4–80,2 s) — o mascote vê o gelo passar */}
      <Shot from={S(76.4)} to={S(80.2)}>
        <Cine bg={NIGHT} fov={52} keys={[[0, [-6, 1.8, -3], [4, 3, 6]], [S(3.8), [-5, 1.7, -2.5], [4, 3.2, 6]]]}>
          {(f) => (<><Sky f={f} n={600} r={80} /><mesh position={[0, -0.05, 0]}><boxGeometry args={[30, 0.1, 12]} /><meshStandardMaterial color="#8a7a5a" flatShading /></mesh><mesh position={[0, 0.55, 5.8]}><boxGeometry args={[30, 0.06, 0.1]} /><meshStandardMaterial color="#e8e0cc" /></mesh>{Array.from({ length: 30 }, (_, i) => <mesh key={i} position={[-14.5 + i, 0.27, 5.8]}><boxGeometry args={[0.05, 0.55, 0.05]} /><meshStandardMaterial color="#e8e0cc" /></mesh>)}<group position={[interpolate(f, [0, S(3.8)], [26, -22]), -9, 24]} scale={6.5}><DarkBerg f={f} k={0.22} foam={0} /></group>{Array.from({ length: 22 }, (_, i) => { const t0 = rand(`ch${i}`) * S(2.6); const ph = clamp((f - t0) / 18, 0, 1); return <mesh key={`c${i}`} position={[-8 + rand(`cx${i}`) * 16, 6 - ph * ph * 6 + 0.08, 3.5 + rand(`cz${i}`) * 2]} rotation={[f * 0.1 + i, i, 0]} scale={0.12 + rand(`cs${i}`) * 0.2}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#dcecf6" flatShading /></mesh>; })}<Mascot frame={f} position={[-1.2, 0, 3.4]} scale={WS.mascot} rotY={0.3} jump={f > S(1) && f < S(1.6) ? 0.6 : 0} /><Figure1912 role="seaman" frame={f} position={[1.8, 0, 2.6]} rotY={0.2} scale={P} seed={9} point={1} /><pointLight position={[0, 4, 0]} intensity={1.5} distance={12} color="#ffd8a0" /></>)}
        </Cine>
      </Shot>
      {/* 14 · debaixo d'água: ~90 m de raspão (80,2–85,4 s) */}
      <Shot from={S(80.2)} to={S(85.4)}>
        <Cine bg="linear-gradient(180deg,#0a2038 0%,#020810 100%)" fov={36} keys={[[0, [14, -1.2, 14], [8, -0.5, 0]], [S(5.2), [10, -1.4, 13], [7, -0.5, 0]]]}>
          {(f) => { const k = cl(f, S(0.4), S(4.0)); return (<><TitanicHero f={f} /><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}><planeGeometry args={[200, 200]} /><meshBasicMaterial color="#3a6a98" transparent opacity={0.35} side={2} depthWrite={false} /></mesh><mesh position={[12.6 - 4.5 * k, -0.55, 1.43]}><boxGeometry args={[9 * k + 0.01, 0.12, 0.02]} /><meshBasicMaterial color="#ff4a3d" toneMapped={false} /></mesh></>); }}
        </Cine>
        <Caption text="~90 METROS DE RASPÃO" sub="NO LADO DIREITO, ABAIXO DA LINHA D'ÁGUA" from={S(1.2)} len={S(3.8)} pos="tl" />
      </Shot>
      {/* 15 · lá em cima, quase ninguém sentiu (85,4–92,4 s) */}
      <Shot from={S(85.4)} to={S(92.4)}>
        <Cine bg="#120c08" fov={50} light="interior" keys={[[0, [3.6, 1.7, 3.6], [-0.5, 1.4, -1.6]], [S(7), [3.0, 1.6, 3.2], [-0.8, 1.4, -1.8]]]}>
          {(f) => (<><FirstClassLite f={f} /><Figure1912 role="gent" frame={f} position={[1.2, 0, 0.6]} rotY={-1.0} scale={P} seed={1} /><Figure1912 role="lady" frame={f} position={[0.0, 0, 0.7]} rotY={1.0} scale={P} seed={2} look={Math.sin(f / 30) * 0.3} /></>)}
        </Cine>
      </Shot>
      {/* 16–20 · os compartimentos (92,4–120,5 s) */}
      <Shot from={S(92.4)} to={S(120.5)} fin={14}>
        <Cine bg={STUDIO} fov={30} light="day" keys={[[0, [0.6, 1.2, 33], [0.6, 0.7, 0]], [S(3.6), [6, 1.0, 22], [6, 0.6, 0]], [S(10.9), [6, 1.0, 22], [6, 0.6, 0]], [S(15.5), [8, 1.4, 15], [8, 1.2, 0]], [S(19), [8, 1.4, 15], [8, 1.1, 0]], [S(28.1), [3, 1.4, 30], [3, 0.4, 0]]]}>
          {(f) => {
            const start = cl(f, 0, S(3.6)) * 0.25;
            const open6 = cl(f, S(10.9), S(14.5));
            const tilt = cl(f, S(18.9), S(28));
            const fl = Z16.map((_, i) => {
              if (i >= 10) return Math.max(start, open6 * 0.85 + tilt * 0.15);
              const casc = clamp(tilt * 10 - (9 - i), 0, 1);
              return casc * 0.9;
            });
            return (<group rotation={[0, 0, -0.1 * tilt]}><group scale={[1, 1.8, 1]}><HullCutaway f={f} flood={fl} /></group>{f > S(3.6) && f < S(10.9) ? <mesh position={[9.4, 0.6, 0.4]}><boxGeometry args={[5.9, 0.05, 0.05]} /><meshBasicMaterial color="#ffd27a" /></mesh> : null}</group>);
          }}
        </Cine>
        <Caption text="AGUENTAVA ATÉ 4 ALAGADOS" from={S(4)} len={S(6.6)} pos="tl" />
        <Caption text="O ICEBERG ABRIU 5. TALVEZ 6." from={S(11)} len={S(4.4)} pos="tl" />
        <Caption text="AS PAREDES NÃO IAM ATÉ O TETO" from={S(15.6)} len={S(3.3)} pos="tl" />
        <Caption text="A ÁGUA TRANSBORDA PARA O PRÓXIMO" from={S(19.2)} len={S(8.5)} pos="tl" />
      </Shot>
      {/* 21 · como uma forma de gelo inclinada (120,5–123,8 s) */}
      <Shot from={S(120.5)} to={S(123.8)} fin={10}>
        <Cine bg={STUDIO} fov={34} light="day" keys={[[0, [0.4, 2.0, 5.4], [0, 0.1, 0]], [S(3.3), [0.3, 1.8, 4.8], [0, 0.1, 0]]]}>
          {(f) => <IceTray tilt={cl(f, 0, S(1.2))} flow={cl(f, S(0.6), S(3.2))} />}
        </Cine>
      </Shot>
      {/* 22 · Thomas Andrews desce para ver os estragos (123,8–129,3 s) */}
      <Shot from={S(123.8)} to={S(129.3)}>
        <Cine bg="#0c0a08" fov={50} light="interior" keys={[[0, [0, 1.6, 1.8], [0, 1.3, -8]], [S(5.5), [0, 1.6, 0.8], [0, 1.25, -8]]]}>
          {(f) => (<><Corridor /><Figure1912 role="gent" tint="#2a2420" frame={f} position={[0.1, 0, -6 + cl(f, 0, S(5.5)) * 3.5]} rotY={0} walk={1} scale={P} seed={30} /><mesh position={[0, 0.02, -11]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[2, 4]} /><meshStandardMaterial color="#3a6a98" transparent opacity={0.6} roughness={0.05} /></mesh></>)}
        </Cine>
        <Caption text="THOMAS ANDREWS" sub="O ENGENHEIRO QUE PROJETOU O NAVIO" from={S(0.8)} len={S(4.4)} />
      </Shot>
      {/* 23 · o veredito ao capitão (129,3–138 s) */}
      <Shot from={S(129.3)} to={S(138)}>
        <Cine bg={NIGHT} fov={46} light="interior" keys={[[0, [-1.0, 1.65, 2.6], [1.0, 1.4, -0.5]], [S(8.7), [-0.6, 1.6, 2.2], [1.0, 1.4, -0.5]]]}>
          {(f) => (<><group position={[-84, -22.5, 0]} scale={10}><TitanicHero f={f} lights={1} cutBridge /></group><group position={[0, -22.5, 0]} scale={4}><NightSea f={f} size={200} seg={100} moonX={999} calm={0.15} /></group><Sky f={f} n={500} p={[150, 30, 0]} /><Bridge f={f} /><Figure1912 role="captain" frame={f} position={[1.5, 0, -0.9]} rotY={-1.2} scale={P} seed={6} /><Figure1912 role="gent" tint="#2a2420" frame={f} position={[0.5, 0, -0.2]} rotY={1.9} scale={P} seed={30} point={f > S(3.3) ? 0.7 : 0} /></>)}
        </Cine>
        <Caption text="1 A 2 HORAS" sub="O VEREDITO: O TITANIC VAI AFUNDAR" from={S(3.4)} len={S(5.2)} pos="tl" />
      </Shot>
      {/* 24 · "os botes" (138–146 s) */}
      <Shot from={S(138)} to={PART2_FRAMES} fout={30}>
        <Cine bg={NIGHT} fov={56} keys={[[0, [-6.8, 2.6, 0.2], [3, 1.6, 3.4]], [S(8), [-5.4, 2.8, 0.6], [4, 1.8, 3.4]]]}>
          {(f) => (<><group position={[0, -18, 0]}><NightSea f={f} size={300} seg={90} moonX={999} calm={0.15} /></group><Sky f={f} n={600} r={80} p={[30, 25, 60]} /><BoatDeck f={f} lower={0} /></>)}
        </Cine>
      </Shot>
      <Letterbox />
      <Part2Audio />
      {void H}
    </AbsoluteFill>
  );
};

/** Versão leve do salão da 1ª classe para o plano "quase ninguém sentiu" (lustre balança de leve). */
const FirstClassLite: React.FC<{ f: number }> = ({ f }) => (
  <group>
    {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[0, -0.05, -4 + i * 0.5]}><boxGeometry args={[12, 0.1, 0.49]} /><meshStandardMaterial color={i % 2 ? "#5a2a22" : "#6a3428"} flatShading /></mesh>)}
    <mesh position={[0, 2, -4]}><boxGeometry args={[12, 4, 0.2]} /><meshStandardMaterial color="#c8a878" flatShading /></mesh>
    {Array.from({ length: 6 }, (_, i) => <mesh key={`p${i}`} position={[-5 + i * 2, 1.6, -3.88]}><boxGeometry args={[1.4, 2.2, 0.04]} /><meshStandardMaterial color="#a8865a" flatShading /></mesh>)}
    <group position={[0, 3.3, -1]} rotation={[0, 0, 0.04 * Math.sin(f / 9) * clamp((f - 30) / 20, 0, 1) * clamp((120 - f) / 40, 0, 1)]}>
      <Rod a={[0, 0.5, 0]} b={[0, 0, 0]} r={0.02} c="#c9a24a" seg={4} />
      <mesh><torusGeometry args={[0.55, 0.04, 6, 24]} /><meshStandardMaterial color="#c9a24a" metalness={0.7} roughness={0.3} /></mesh>
      {Array.from({ length: 8 }, (_, i) => <mesh key={i} position={[Math.cos((i / 8) * Math.PI * 2) * 0.55, 0.08, Math.sin((i / 8) * Math.PI * 2) * 0.55]}><sphereGeometry args={[0.07, 8, 6]} /><meshBasicMaterial color="#fff0c8" toneMapped={false} /></mesh>)}
      <pointLight intensity={5} distance={12} color="#ffe0a8" />
    </group>
    <group position={[0.6, 0, 0.2]}>
      <mesh position={[0, 0.72, 0]}><cylinderGeometry args={[0.7, 0.7, 0.04, 24]} /><meshStandardMaterial color="#f4f0e6" /></mesh>
      <mesh position={[0, 0.4, 0]}><cylinderGeometry args={[0.72, 0.6, 0.64, 24, 1, true]} /><meshStandardMaterial color="#f4f0e6" /></mesh>
      {[0, 2, 4].map((i) => <mesh key={i} position={[Math.cos(i) * 0.4, 0.82 + 0.005 * Math.sin(f / 3 + i) * clamp((f - 30) / 20, 0, 1) * clamp((90 - f) / 30, 0, 1), Math.sin(i) * 0.4]}><cylinderGeometry args={[0.04, 0.02, 0.14, 8]} /><meshStandardMaterial color="#e8f4ff" transparent opacity={0.6} /></mesh>)}
    </group>
  </group>
);

/* ------------------------------------------------------------------ áudio */

const sfx = (name: string, at: number, volume: number, len?: number) => ({ name, at, volume, len });
const SFX = [
  sfx("spark", 0.6, 0.35), sfx("spark", 2.4, 0.3), sfx("spark", 5.0, 0.3), sfx("tick", 6.4, 0.2),
  sfx("pop", 13.2, 0.25), sfx("pop", 13.6, 0.25), sfx("pop", 14.0, 0.25), sfx("pop", 14.4, 0.25), sfx("pop", 14.8, 0.25), sfx("pop", 15.2, 0.25),
  sfx("spark", 20.6, 0.3), sfx("spark", 22.0, 0.3), sfx("spark", 23.5, 0.3), sfx("spark", 25.1, 0.3), sfx("thud", 31.1, 0.35),
  sfx("ocean-amb", 33.8, 0.3, 30), sfx("wind-cold", 54.8, 0.2), sfx("tick", 59.4, 0.3), sfx("tick", 60.4, 0.3), sfx("tick", 61.4, 0.3),
  sfx("clunk", 68.9, 0.45), sfx("clunk", 69.6, 0.4), sfx("rumble", 76.4, 0.5), sfx("crumble", 76.6, 0.45), sfx("strain", 77.2, 0.35), sfx("crumble", 78.2, 0.35),
  sfx("deep-amb", 80.2, 0.3, 5.2), sfx("water-rise", 92.6, 0.32), sfx("flood-loop", 103.4, 0.24, 17), sfx("drip", 120.6, 0.3), sfx("water-rise", 121.0, 0.2),
  sfx("hum", 123.8, 0.15, 5.5), sfx("thud", 132.6, 0.3), sfx("ocean-amb", 138, 0.25, 8),
];
const Part2Audio: React.FC = () => (
  <>
    <Sequence from={S(OFF2)} layout="none"><Audio src={staticFile("audio/doc/bloco2.wav")} volume={1} /></Sequence>
    <Sequence from={S(OFF3)} layout="none"><Audio src={staticFile("audio/doc/bloco3.wav")} volume={1} /></Sequence>
    <Audio src={staticFile("audio/doc/musica-parte2.wav")} volume={0.9} />
    {SFX.map((c, i) => (
      <Sequence key={i} from={S(c.at)} durationInFrames={c.len ? S(c.len) : undefined} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.name}.wav`)} volume={c.volume} loop={Boolean(c.len)} />
      </Sequence>
    ))}
  </>
);
