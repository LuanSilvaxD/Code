import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Mascot } from "../components/Mascot";
import { Stars } from "../components/SpaceScene";
import { RadioRoom, TitanicHero } from "../components/Doc3D";
import { BoatDeck, Californian, IceField, Rocket, Treat } from "../components/Doc3D2";
import { Figure1912 } from "../components/Figures1912";
import { Lifeboat, NightSea, seaY } from "../components/Titanic";
import { FONT } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { BAR, Caption, ChapterTag, Cine, Letterbox, NIGHT, P, S, Shot, WS } from "./kit";

// DOCUMENTÁRIO TITANIC — PARTE 3: capítulo 4 "Os botes" + capítulo 5 "O fim". 139 s.
export const PART3_FRAMES = 4170;
const OFF4 = 2.6, OFF5 = 81.39;
const cl = (v: number, a: number, b: number) => interpolate(v, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const Sky: React.FC<{ f: number; n?: number; r?: number; p?: Vec3 }> = ({ f, n = 900, r = 140, p = [0, 0, 0] }) => <group position={p}><Stars count={n} radius={r} frame={f} /></group>;

/* ------------------------------------------------------------------ 2D */

/** Relógio pequeno com a hora escrita (canto superior direito, dentro das barras). */
const ClockBadge: React.FC<{ h: number; m: number; label: string; from: number; len: number }> = ({ h, m, label, from, len }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 15, 0, 1), clamp((len - f) / 15, 0, 1));
  const am = (m / 60) * 360, ah = ((h % 12) / 12) * 360 + m / 2;
  return (
    <div style={{ position: "absolute", right: 130, top: BAR + 40, opacity: a, textAlign: "center" }}>
      <svg width="170" height="170" viewBox="-110 -110 220 220">
        <circle r="100" fill="rgba(244,236,216,0.92)" stroke="#2a2016" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="0" y1="-86" x2="0" y2="-74" stroke="#2a2016" strokeWidth={i % 3 ? 3 : 6} transform={`rotate(${i * 30})`} />)}
        <line x1="0" y1="10" x2="0" y2="-52" stroke="#2a2016" strokeWidth="8" strokeLinecap="round" transform={`rotate(${ah})`} />
        <line x1="0" y1="12" x2="0" y2="-80" stroke="#b8281e" strokeWidth="5" strokeLinecap="round" transform={`rotate(${am})`} />
        <circle r="7" fill="#2a2016" />
      </svg>
      <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 30, color: "#f4efe4", letterSpacing: 4, textShadow: "0 2px 10px #000" }}>{label}</div>
    </div>
  );
};

/** Barras: lugares nos botes × pessoas a bordo. */
const SeatsChart: React.FC = () => {
  const f = useCurrentFrame();
  const a = cl(f, S(0.5), S(2.5)), b = cl(f, S(4.8), S(6.8)), gap = cl(f, S(8.3), S(9.3));
  const max = 2200, Wd = 1200;
  const row = (label: string, v: number, k: number, c: string, y: number) => (
    <div style={{ position: "absolute", left: 360, top: y, fontFamily: FONT, color: "#f4efe4" }}>
      <div style={{ fontWeight: 600, fontSize: 26, letterSpacing: 4, color: "#c8c0b0", marginBottom: 10 }}>{label}</div>
      <div style={{ width: Wd, height: 54, background: "rgba(255,255,255,0.06)", position: "relative" }}>
        <div style={{ width: (v / max) * Wd * k, height: 54, background: c }} />
        <div style={{ position: "absolute", left: (v / max) * Wd * k + 18, top: 4, fontWeight: 800, fontSize: 40, opacity: k }}>{Math.round(v * k).toLocaleString("pt-BR")}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%,#0e1a2c 0%,#02040a 80%)" }}>
      {row("LUGARES NOS 20 BOTES", 1178, a, "#e8e0cc", 330)}
      {row("PESSOAS A BORDO", 2200, b, "#d4ac4c", 520)}
      <div style={{ position: "absolute", left: 360 + (1178 / max) * 1200, top: 600, width: (1022 / max) * 1200, height: 54, border: "3px dashed #ff6a5a", opacity: gap }} />
      <div style={{ position: "absolute", left: 360 + (1178 / max) * 1200, top: 672, fontFamily: FONT, fontWeight: 800, fontSize: 32, color: "#ff8a7a", letterSpacing: 3, opacity: gap }}>QUASE METADE FICARIA DE FORA</div>
    </AbsoluteFill>
  );
};

/** Ícones de gente: sobreviventes por classe (1ª ~6 em 10, 3ª ~1 em 4). */
const ClassSurvival: React.FC = () => {
  const f = useCurrentFrame();
  const Person = ({ alive, k }: { alive: boolean; k: number }) => (
    <svg width="64" height="110" viewBox="0 0 64 110" style={{ opacity: 0.25 + 0.75 * k }}>
      <circle cx="32" cy="18" r="14" fill={alive && k > 0.99 ? "#f4d27a" : "#5a5a66"} />
      <rect x="14" y="36" width="36" height="66" rx="12" fill={alive && k > 0.99 ? "#f4d27a" : "#5a5a66"} />
    </svg>
  );
  const row = (label: string, n: number, alive: number, from: number, y: number, note: string) => {
    const k = cl(f, from, from + S(1.2));
    return (
      <div style={{ position: "absolute", left: 260, top: y, display: "flex", alignItems: "center", gap: 40, fontFamily: FONT, color: "#f4efe4" }}>
        <div style={{ width: 260 }}>
          <div style={{ fontWeight: 800, fontSize: 40, letterSpacing: 3 }}>{label}</div>
          <div style={{ fontWeight: 600, fontSize: 22, color: "#d4ac4c", opacity: k }}>{note}</div>
        </div>
        <div style={{ display: "flex", gap: 14 }}>{Array.from({ length: n }, (_, i) => <Person key={i} alive={i < alive} k={k} />)}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%,#1a1410 0%,#040302 80%)" }}>
      {row("1ª CLASSE", 10, 6, S(0.3), 300, "~6 EM CADA 10 SOBREVIVERAM")}
      {row("3ª CLASSE", 8, 2, S(5.2), 560, "~1 EM CADA 4 SOBREVIVEU")}
      <div style={{ position: "absolute", bottom: BAR + 30, left: 0, right: 0, textAlign: "center", fontFamily: FONT, fontSize: 18, letterSpacing: 3, color: "#8a8070" }}>PROPORÇÕES APROXIMADAS · INQUÉRITOS DE 1912</div>
    </AbsoluteFill>
  );
};

/** Termômetro grande (2D) −2 °C. */
const ColdBadge: React.FC<{ from: number; len: number }> = ({ from, len }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 15, 0, 1), clamp((len - f) / 15, 0, 1));
  return (
    <div style={{ position: "absolute", right: 140, top: BAR + 50, opacity: a, fontFamily: FONT, fontWeight: 900, color: "#bfe6ff", fontSize: 96, textShadow: "0 4px 18px #000", letterSpacing: 2 }}>
      −2 °C
      <div style={{ fontSize: 24, fontWeight: 600, letterSpacing: 4, color: "#f4efe4" }}>TEMPERATURA DA ÁGUA</div>
    </div>
  );
};

/* ------------------------------------------------------------------ 3D desta parte */

/** Pessoas na água (cabeças e coletes brancos), destroços boiando. */
const WaterPeople: React.FC<{ f: number; n?: number; R?: number; k?: number }> = ({ f, n = 70, R = 22, k = 1 }) => (
  <group>
    {Array.from({ length: n }, (_, i) => {
      if (rand(`wp${i}`) > k) return null;
      const a = rand(`wa${i}`) * Math.PI * 2, r = 2 + rand(`wr${i}`) * R;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.6;
      const y = seaY(x, z, f) + 0.02;
      return (
        <group key={i} position={[x, y, z]}>
          <mesh position={[0, 0.06, 0]}><boxGeometry args={[0.32, 0.12, 0.26]} /><meshStandardMaterial color="#e8e0c8" flatShading /></mesh>
          <mesh position={[0, 0.2, 0]}><sphereGeometry args={[0.11, 8, 6]} /><meshStandardMaterial color={["#e0b090", "#c08a68", "#a87050"][i % 3]} flatShading /></mesh>
        </group>
      );
    })}
    {Array.from({ length: 30 }, (_, i) => {
      const a = rand(`dd${i}`) * Math.PI * 2, r = 1 + rand(`dr${i}`) * R;
      const x = Math.cos(a) * r, z = Math.sin(a) * r * 0.6;
      return <mesh key={`d${i}`} position={[x, seaY(x, z, f) + 0.03, z]} rotation={[0, rand(`dy${i}`) * 3, 0]}><boxGeometry args={[0.6 + rand(`ds${i}`) * 0.8, 0.06, 0.25]} /><meshStandardMaterial color="#6a4a2e" flatShading /></mesh>;
    })}
  </group>
);

/** Navio afundando pela proa: tilt 0..1 (inclinação), sink (descida), lights 0..1. Unidades de navio (1 u = 10 m). */
const Sinking: React.FC<{ f: number; tilt: number; sink: number; lights: number }> = ({ f, tilt, sink, lights }) => (
  <group position={[0, -sink, 0]} rotation={[0, 0, -tilt]}>
    <TitanicHero f={f} lights={lights} />
  </group>
);

/* ================================================================== A PARTE 3 */

export const DocPart3: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* 1 · 20 botes (0–11,4 s) */}
    <Shot from={0} to={S(11.4)} fin={20}>
      <Cine bg={NIGHT} fov={56} keys={[[0, [-7.5, 3.4, -1.6], [4, 1.8, 3.6]], [S(11.4), [-5.6, 3.0, -0.2], [5, 1.8, 3.6]]]}>
        {(f) => (<><group position={[0, -18, 0]}><NightSea f={f} size={300} seg={90} moonX={999} calm={0.15} /></group><Sky f={f} n={600} r={80} p={[30, 25, 60]} /><BoatDeck f={f} lower={0} /><Figure1912 role="officer" frame={f} position={[-2.6, 0, 1.6]} rotY={0.9} scale={P} seed={1} /><Figure1912 role="seaman" frame={f} position={[1.6, 0, 2.2]} rotY={-1.2} scale={P} seed={7} /></>)}
      </Cine>
      <ChapterTag n={4} title="OS BOTES" from={S(0.3)} len={S(4)} />
      <Caption text="20 BOTES SALVA-VIDAS" sub="MAIS DO QUE A LEI DE 1912 EXIGIA" from={S(4.8)} len={S(6.2)} pos="tl" />
    </Shot>
    {/* 2 · lugares × pessoas (11,4–23,9 s) */}
    <Shot from={S(11.4)} to={S(23.9)} fin={12}><SeatsChart /></Shot>
    {/* 3 · 0h45: o primeiro bote (23,9–28 s) */}
    <Shot from={S(23.9)} to={S(28)}>
      <Cine bg={NIGHT} fov={52} keys={[[0, [-4, 2.6, -1], [3, 1.4, 3.6]], [S(4.1), [-3.2, 2.4, -0.6], [3, 1.2, 3.6]]]}>
        {(f) => (<><group position={[0, -18, 0]}><NightSea f={f} size={300} seg={90} moonX={999} calm={0.15} /></group><Sky f={f} n={600} r={80} p={[30, 25, 60]} /><BoatDeck f={f} lower={cl(f, 0, S(4)) * 0.12} /><Figure1912 role="officer" frame={f} position={[-1.6, 0, 1.8]} rotY={1.1} scale={P} seed={1} point={1} /><Figure1912 role="seaman" frame={f} position={[2.2, 0, 2.2]} rotY={-1.4} scale={P} seed={7} /></>)}
      </Cine>
      <ClockBadge h={0} m={45} label="0h45" from={S(0.2)} len={S(3.8)} />
    </Shot>
    {/* 4a · muita gente não queria sair (28–30,8 s) */}
    <Shot from={S(28)} to={S(30.8)}>
      <Cine bg="#120c08" fov={50} light="interior" keys={[[0, [3.2, 1.6, 3.2], [-0.4, 1.4, -1]], [S(2.8), [2.8, 1.6, 3.0], [-0.4, 1.4, -1]]]}>
        {(f) => (<><mesh position={[0, -0.05, 0]}><boxGeometry args={[12, 0.1, 10]} /><meshStandardMaterial color="#5a2a22" flatShading /></mesh><mesh position={[0, 2, -4]}><boxGeometry args={[12, 4, 0.2]} /><meshStandardMaterial color="#c8a878" flatShading /></mesh><pointLight position={[0, 3.2, 0]} intensity={4} distance={12} color="#ffe0a8" />{([["gent", 0.8, 0.4, -1.2], ["lady", 0, 0.7, 0.8], ["lady", -1.1, 0.2, 0.6], ["gent", -2, -0.8, 1.2]] as const).map(([r, x, z, ry], i) => <Figure1912 key={i} role={r} tint={i === 2 ? "#2a3a5a" : undefined} frame={f} position={[x, 0, z]} rotY={ry} scale={P} seed={i + 40} />)}</>)}
      </Cine>
    </Shot>
    {/* 4b · "um barquinho no mar gelado, no escuro?" (30,8–36,6 s) */}
    <Shot from={S(30.8)} to={S(36.6)}>
      <Cine bg={NIGHT} fov={48} keys={[[0, [0, 20, -2], [1, 0, 8]], [S(5.8), [0, 19, -1], [1.5, 0, 9]]]}>
        {(f) => (<><Sky f={f} n={500} r={90} p={[0, 0, 40]} /><NightSea f={f} size={120} seg={110} moonX={999} calm={0.15} /><group position={[1.2, 0.15, 8]} rotation={[0, 0.2, 0]} scale={0.9}><Lifeboat f={f} people={4} lamp={1} /></group><mesh position={[0, 10, -1.2]}><boxGeometry args={[30, 20, 0.4]} /><meshStandardMaterial color="#141418" flatShading /></mesh></>)}
      </Cine>
      <Caption text="DE CIMA DO CONVÉS ATÉ A ÁGUA: ~20 METROS" from={S(1)} len={S(4.6)} pos="tl" />
    </Shot>
    {/* 5 · botes descendo quase vazios (36,6–43,9 s) */}
    <Shot from={S(36.6)} to={S(43.9)}>
      <Cine bg={NIGHT} fov={40} keys={[[0, [6, 0.6, 9], [0, 1.4, 1.4]], [S(7.3), [3.5, 0.5, 8], [-1, 1.2, 1.4]]]}>
        {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} /><group position={[0, -0.25, 0]} rotation={[0, 0, -0.025]}><TitanicHero f={f} lights={1} /></group><group position={[1.2, interpolate(f, [0, S(7.3)], [2.3, 0.15]), 1.72]} scale={0.13}><Lifeboat f={f} people={3} lamp={1} row={0} /></group></>)}
      </Cine>
    </Shot>
    {/* 6 · 40 lugares, 12 pessoas — o mascote está nesse bote (43,9–48,6 s) */}
    <Shot from={S(43.9)} to={S(48.6)}>
      <Cine bg={NIGHT} fov={44} keys={[[0, [6, 2.6, 6], [0, 0.2, 0]], [S(4.7), [5, 2.2, 5.4], [0, 0.2, 0]]]}>
        {(f) => (<><Sky f={f} n={600} r={80} /><NightSea f={f} size={80} seg={110} moonX={999} calm={0.2} /><group position={[0, 0.15 + seaY(0, 0, f), 0]} rotation={[0, -0.4, 0]}><Lifeboat f={f} people={10} lamp={1} row={0.4} /><Mascot frame={f} position={[-3.0, -0.1, 0.2]} scale={WS.mascot * 0.9} rotY={1.4} sit={1} look={0.4} /></group></>)}
      </Cine>
      <Caption text="40 LUGARES · 12 PESSOAS" sub="O BOTE Nº 1" from={S(0.3)} len={S(4.2)} pos="tl" />
    </Shot>
    {/* 7 · mulheres e crianças primeiro (48,6–56,3 s) */}
    <Shot from={S(48.6)} to={S(56.3)}>
      <Cine bg={NIGHT} fov={56} keys={[[0, [-6.8, 2.4, 0.4], [3, 1.6, 3.4]], [S(7.7), [-5.6, 2.3, 0.8], [3, 1.5, 3.4]]]}>
        {(f) => (<><group position={[0, -18, 0]}><NightSea f={f} size={300} seg={90} moonX={999} calm={0.15} /></group><Sky f={f} n={600} r={80} p={[30, 25, 60]} /><BoatDeck f={f} lower={0.08} />
          <Figure1912 role="officer" frame={f} position={[-2.6, 0, 1.6]} rotY={0.9} scale={P} point={1} seed={1} />
          <Figure1912 role="lady" frame={f} position={[-1.2, 0, 1.9]} rotY={0.4} scale={P} seed={2} walk={0.3} />
          <Figure1912 role="child" frame={f} position={[-0.6, 0, 2.0]} rotY={0.5} scale={P} seed={3} />
          <Figure1912 role="steerageWoman" frame={f} position={[-3.4, 0, 1.0]} rotY={0.7} scale={P} seed={6} />
          <Figure1912 role="gent" frame={f} position={[-4.4, 0, 0.2]} rotY={0.7} scale={P} seed={4} />
          <Figure1912 role="steerageMan" frame={f} position={[-5.2, 0, 1.0]} rotY={0.6} scale={P} seed={8} />
          <Figure1912 role="seaman" frame={f} position={[1.6, 0, 2.2]} rotY={-1.2} scale={P} seed={7} />
        </>)}
      </Cine>
      <Caption text="MULHERES E CRIANÇAS PRIMEIRO" from={S(0.2)} len={S(3.6)} pos="tl" />
    </Shot>
    {/* 8 · sobrevivência por classe (56,3–64,9 s) */}
    <Shot from={S(56.3)} to={S(64.9)} fin={12}><ClassSurvival /></Shot>
    {/* 9 · foguetes de socorro (64,9–69,6 s) */}
    <Shot from={S(64.9)} to={S(69.6)}>
      <Cine bg={NIGHT} fov={42} keys={[[0, [-6, 3, 34], [0, 6, 0]], [S(4.7), [-4, 2.6, 30], [0, 6, 0]]]}>
        {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} /><Sinking f={f} tilt={0.05} sink={0.5} lights={1} /><Rocket p={[-2, 18, 0]} t={cl(f, 0, S(3))} s={3} /><Rocket p={[3, 20, -2]} t={cl(f, S(2), S(4.7))} s={3} /></>)}
      </Cine>
      <Caption text="FOGUETES DE SOCORRO" sub="BRANCOS, UM APÓS O OUTRO" from={S(0.4)} len={S(4.2)} pos="tl" />
    </Shot>
    {/* 10 · luzes de outro navio no horizonte (69,6–77,4 s) */}
    <Shot from={S(69.6)} to={S(77.4)} fout={20}>
      <Cine bg={NIGHT} fov={34} keys={[[0, [0, 2.0, 0], [-60, 0.8, -30]], [S(7.8), [0, 2.0, 0], [-60, 0.9, -24]]]}>
        {(f) => (<><Sky f={f} n={1000} r={200} /><group position={[0, -16, 0]} scale={10}><NightSea f={f} size={120} seg={100} moonX={999} calm={0.15} /></group><mesh position={[0, 0.55, -1]}><boxGeometry args={[30, 0.06, 0.1]} /><meshStandardMaterial color="#e8e0cc" /></mesh>{Array.from({ length: 20 }, (_, i) => <mesh key={i} position={[-10 + i, 0.27, -1]}><boxGeometry args={[0.05, 0.55, 0.05]} /><meshStandardMaterial color="#e8e0cc" /></mesh>)}<Figure1912 role="officer" frame={f} position={[1.2, 0, -0.4]} rotY={-2.4} scale={P} seed={2} point={1} /><group position={[-120, -15, -55]}>{[0, 1, 2].map((i) => <mesh key={i} position={[i * 3, 2 + (i === 1 ? 1.5 : 0), 0]}><sphereGeometry args={[1.1, 8, 6]} /><meshBasicMaterial color="#ffe8b0" toneMapped={false} /></mesh>)}</group></>)}
      </Cine>
      <Caption text="UM NAVIO NO HORIZONTE" sub="PERTO. MAS NUNCA VEIO." from={S(4.5)} len={S(3.2)} pos="tl" />
    </Shot>
    {/* 11 · cap. 5 — o Californian (77,4–89,4 s) */}
    <Shot from={S(77.4)} to={S(89.4)} fin={20}>
      <Cine bg={NIGHT} fov={40} keys={[[0, [-14, 2.6, 16], [4, 2, -8]], [S(12), [-10, 2.4, 13], [4, 2, -8]]]}>
        {(f) => (<><Sky f={f} n={800} r={120} /><NightSea f={f} size={200} seg={120} calm={0.3} moonX={999} /><IceField n={70} R={22} seed="cf" /><group rotation={[0, -0.3, 0]}><Californian f={f} /></group><Rocket p={[60, 10, -90]} t={((f % 80) / 80) * 0.75 + 0.15} s={2.5} /></>)}
      </Cine>
      <ChapterTag n={5} title="O FIM" from={S(0.3)} len={S(3.6)} />
      <Caption text="SS CALIFORNIAN" sub="PARADO NO GELO, A POUCOS QUILÔMETROS" from={S(4.4)} len={S(7.2)} pos="tl" />
    </Shot>
    {/* 12 · o rádio desligado (89,4–94 s) */}
    <Shot from={S(89.4)} to={S(94)}>
      <Cine bg="#060504" fov={46} light="none" keys={[[0, [2.0, 1.5, 2.0], [0, 1.0, -1.2]], [S(4.6), [1.6, 1.4, 1.6], [0, 1.0, -1.2]]]}>
        {(f) => (<><ambientLight intensity={0.12} color="#8090b0" /><RadioRoom f={f} spark={0} papers={0.1} /></>)}
      </Cine>
      <Caption text="RÁDIO DESLIGADO" sub="O OPERADOR TINHA IDO DORMIR" from={S(0.4)} len={S(4)} pos="tl" />
    </Shot>
    {/* 13 · viram os foguetes, não entenderam (94–101,6 s) */}
    <Shot from={S(94)} to={S(101.6)}>
      <Cine bg={NIGHT} fov={44} keys={[[0, [-3.5, 1.9, 2.8], [5, 2.4, -6]], [S(7.6), [-3, 1.9, 2.5], [5, 2.8, -6]]]}>
        {(f) => (<><Sky f={f} n={900} r={120} /><group position={[0, -8, 0]} scale={4}><NightSea f={f} size={100} seg={90} moonX={999} calm={0.2} /></group><mesh position={[0, -0.05, 0]}><boxGeometry args={[14, 0.1, 6]} /><meshStandardMaterial color="#6a5a44" flatShading /></mesh><mesh position={[0, 0.55, -2.8]}><boxGeometry args={[14, 0.06, 0.1]} /><meshStandardMaterial color="#c8c0ae" /></mesh><Figure1912 role="officer" frame={f} position={[0.4, 0, -1.6]} rotY={2.6} scale={P} seed={50} /><Figure1912 role="seaman" frame={f} position={[-0.8, 0, -1.4]} rotY={2.9} scale={P} seed={51} point={0.6} /><Rocket p={[60, 14, -80]} t={((f % 90) / 90) * 0.8 + 0.1} s={2.6} /></>)}
      </Cine>
      <Caption text="INQUÉRITOS DE 1912" sub="SE TIVESSE RESPONDIDO, MUITAS VIDAS PODERIAM TER SIDO SALVAS" from={S(0.6)} len={S(6.8)} pos="tl" />
    </Shot>
    {/* 14 · 2h: a proa debaixo d'água (101,6–106,5 s) */}
    <Shot from={S(101.6)} to={S(106.5)} fin={14}>
      <Cine bg={NIGHT} fov={42} keys={[[0, [-2, 2.5, 30], [1, 1, 0]], [S(4.9), [-1, 2.3, 27], [1, 1, 0]]]}>
        {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} /><Sinking f={f} tilt={0.12 + cl(f, 0, S(4.9)) * 0.03} sink={1.0 + cl(f, 0, S(4.9)) * 0.2} lights={1} /></>)}
      </Cine>
      <ClockBadge h={2} m={0} label="2h00" from={S(0.2)} len={S(4.6)} />
    </Shot>
    {/* 15–18 · a popa sobe, as luzes apagam, o casco parte, 2h20 (106,5–122,8 s) */}
    <Shot from={S(106.5)} to={S(122.8)}>
      <Cine bg={NIGHT} fov={44} keys={[[0, [-4, 2.4, 28], [-2, 2, 0]], [S(7.4), [-4, 2.2, 26], [-2.5, 2.4, 0]], [S(16.3), [-5, 1.6, 24], [-4, 1.0, 0]]]}>
        {(f) => {
          const rise = cl(f, 0, S(4)); // popa subindo (inclinação maior)
          const flick = f > S(4.2) && f < S(7.4) ? (Math.sin(f * 1.7) > 0 ? 1 : 0.15) * (1 - cl(f, S(6.2), S(7.4))) : f <= S(4.2) ? 1 : 0;
          const brk = cl(f, S(7.4), S(11.6)); // o casco se parte
          const gone = cl(f, S(12.3), S(16.3)); // a popa afunda
          return (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} />
            {brk < 0.01 ? (
              <Sinking f={f} tilt={0.15 + rise * 0.22} sink={1.2 + rise * 0.6} lights={flick} />
            ) : (
              <>
                <group position={[0, -1.8 - brk * 3.5, 0]} rotation={[0, 0, -0.37 - brk * 0.35]}><Treat clip={{ normal: [1, 0, 0], constant: 2 }}><TitanicHero f={f} lights={0} /></Treat></group>
                <group position={[-0.6 * brk, -1.8 + brk * 0.9 - gone * 9, 0]} rotation={[0, 0, -0.37 + brk * 0.2 - gone * 0.9]}><Treat clip={{ normal: [-1, 0, 0], constant: -2 }}><TitanicHero f={f} lights={0} /></Treat></group>
                {Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-2.6 + (i % 5) * 0.4, 0.2 + Math.abs(Math.sin(f / 7 + i)) * 0.8 * (1 - gone), -1 + (i % 3)]} scale={0.3}><icosahedronGeometry args={[1, 0]} /><meshBasicMaterial color="#e8f4fa" transparent opacity={0.6 * (1 - gone * 0.7)} depthWrite={false} /></mesh>)}
              </>
            )}
          </>);
        }}
      </Cine>
      <ClockBadge h={2} m={20} label="2h20" from={S(12.4)} len={S(3.8)} />
    </Shot>
    {/* 19 · mais de mil pessoas na água (122,8–132,2 s) */}
    <Shot from={S(122.8)} to={S(132.2)}>
      <Cine bg={NIGHT} fov={46} keys={[[0, [0, 1.6, 14], [0, 0.2, 0]], [S(9.4), [0, 1.2, 10], [0, 0.2, 0]]]}>
        {(f) => (<><Sky f={f} /><NightSea f={f} size={120} seg={120} moonX={999} calm={0.2} /><WaterPeople f={f} /></>)}
      </Cine>
      <ColdBadge from={S(2.7)} len={S(6.5)} />
      <Caption text="~15 MINUTOS" sub="ATÉ O CORPO APAGAR" from={S(5.9)} len={S(3.3)} />
    </Shot>
    {/* 20 · o socorro estava a horas dali (132,2–139 s) */}
    <Shot from={S(132.2)} to={PART3_FRAMES} fout={36}>
      <Cine bg={NIGHT} fov={40} keys={[[0, [0, 6, 30], [0, 1, 0]], [S(6.8), [0, 10, 38], [0, 1, 0]]]}>
        {(f) => (<><Sky f={f} n={1200} r={160} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.2} />{[[-8, -6], [6, -10], [12, 4]].map(([x, z], i) => <group key={i} position={[x, 0.08, z]} scale={0.2}><Lifeboat f={f} people={8} /></group>)}</>)}
      </Cine>
    </Shot>
    <Letterbox />
    <Part3Audio />
  </AbsoluteFill>
);

/* ------------------------------------------------------------------ áudio */

const sfx = (name: string, at: number, volume: number, len?: number) => ({ name, at, volume, len });
const SFX = [
  sfx("ocean-amb", 0, 0.28, 11.4), sfx("murmur", 0, 0.18, 11.4), sfx("tick", 24.2, 0.25), sfx("cable", 24.6, 0.3), sfx("murmur", 28, 0.2, 2.8),
  sfx("wind-cold", 30.8, 0.2), sfx("cable", 36.8, 0.3), sfx("ocean-amb", 36.6, 0.25, 20), sfx("launch", 64.9, 0.35), sfx("pop-high", 66.2, 0.3), sfx("launch", 66.9, 0.3), sfx("pop-high", 68.2, 0.28),
  sfx("wind-cold", 69.6, 0.2), sfx("pop-high", 82, 0.12), sfx("pop-high", 85, 0.12), sfx("power-down", 89.6, 0.25), sfx("pop-high", 96, 0.12), sfx("pop-high", 99, 0.12),
  sfx("rumble", 101.8, 0.35), sfx("strain", 106.6, 0.4), sfx("power-down", 111, 0.45), sfx("rumble", 113.9, 0.55), sfx("crumble", 114.4, 0.5), sfx("strain", 115, 0.45), sfx("gush", 119, 0.4),
  sfx("ocean-amb", 122.8, 0.3, 16), sfx("wind-cold", 124, 0.25),
];
const Part3Audio: React.FC = () => (
  <>
    <Sequence from={S(OFF4)} layout="none"><Audio src={staticFile("audio/doc/bloco4.wav")} volume={1} /></Sequence>
    <Sequence from={S(OFF5)} layout="none"><Audio src={staticFile("audio/doc/bloco5.wav")} volume={1} /></Sequence>
    <Audio src={staticFile("audio/doc/musica-parte3.wav")} volume={0.9} />
    {SFX.map((c, i) => (
      <Sequence key={i} from={S(c.at)} durationInFrames={c.len ? S(c.len) : undefined} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.name}.wav`)} volume={c.volume} loop={Boolean(c.len)} />
      </Sequence>
    ))}
  </>
);
