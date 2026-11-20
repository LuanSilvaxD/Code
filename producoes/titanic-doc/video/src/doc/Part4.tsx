import { Audio } from "@remotion/media";
import { AbsoluteFill, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { Logo, Wordmark } from "../components/Brand";
import { Mascot } from "../components/Mascot";
import { Stars } from "../components/SpaceScene";
import { Iceberg, RadioRoom, Rod, TitanicHero } from "../components/Doc3D";
import { Californian, Carpathia, IceField, MarineSnow, Rusticles, Seabed, Submersible, Treat } from "../components/Doc3D2";
import { Figure1912 } from "../components/Figures1912";
import { Lifeboat, NightSea, seaY } from "../components/Titanic";
import { FONT } from "../theme";
import { clamp, rand, type Vec3 } from "../utils/animation";
import { BAR, Caption, ChapterTag, Cine, DAY, Letterbox, NIGHT, P, S, Shot, WS } from "./kit";

// DOCUMENTÁRIO TITANIC — PARTE 4: capítulo 6 "O resgate" + capítulo 7 "O que mudou" + 1985 + encerramento. 115 s.
export const PART4_FRAMES = 3450;
const OFF6 = 2.6, OFF7 = 44.95;
const cl = (v: number, a: number, b: number) => interpolate(v, [a, b], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
const Sky: React.FC<{ f: number; n?: number; r?: number; p?: Vec3 }> = ({ f, n = 900, r = 140, p = [0, 0, 0] }) => <group position={p}><Stars count={n} radius={r} frame={f} /></group>;
const DAWN = "linear-gradient(180deg,#1a2448 0%,#5a5a7a 45%,#e0946a 72%,#f4c890 100%)";
const DEEP = "radial-gradient(ellipse at 50% 30%,#06121e 0%,#010306 80%)";

/* ------------------------------------------------------------------ 2D */

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

/** Documento de 1914 (2D, desenho próprio). */
const Solas: React.FC = () => {
  const f = useCurrentFrame();
  const seal = cl(f, S(2.5), S(3.2));
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 45%,#2a2018 0%,#0a0806 80%)", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: 760, height: 760, background: "linear-gradient(180deg,#efe4c8,#ddcca6)", transform: `scale(${0.95 + f * 0.0006}) rotate(-1.5deg)`, boxShadow: "0 30px 80px rgba(0,0,0,0.7)", padding: "54px 60px", fontFamily: "Georgia, serif", color: "#2a2016", position: "relative" }}>
        <div style={{ textAlign: "center", fontSize: 26, letterSpacing: 6 }}>LONDRES · 1914</div>
        <div style={{ textAlign: "center", fontSize: 40, fontWeight: 700, lineHeight: 1.25, margin: "20px 0 24px" }}>Convenção Internacional para a Salvaguarda da Vida Humana no Mar</div>
        {Array.from({ length: 11 }, (_, i) => <div key={i} style={{ height: 9, background: "rgba(42,32,22,0.22)", margin: "13px 0", width: `${84 + rand(`so${i}`) * 16}%` }} />)}
        <div style={{ position: "absolute", right: 70, bottom: 60, width: 130, height: 130, borderRadius: 65, background: "radial-gradient(circle,#c83a2a,#8a1a12)", opacity: seal, transform: `scale(${0.6 + seal * 0.4})`, boxShadow: "0 6px 16px rgba(0,0,0,0.4)" }} />
      </div>
      <div style={{ position: "absolute", bottom: BAR + 36, fontFamily: FONT, fontSize: 18, letterSpacing: 3, color: "#a89a84" }}>DOCUMENTO ILUSTRATIVO</div>
    </AbsoluteFill>
  );
};

/** Contador de profundidade na descida. */
const Depth: React.FC<{ from: number; len: number; to: number }> = ({ from, len, to }) => {
  const f = useCurrentFrame() - from;
  if (f < 0 || f > len) return null;
  const a = Math.min(clamp(f / 15, 0, 1), clamp((len - f) / 15, 0, 1));
  const d = Math.round(interpolate(f, [0, len * 0.9], [0, to], { extrapolateRight: "clamp" }) / 10) * 10;
  return (
    <div style={{ position: "absolute", right: 140, top: BAR + 50, opacity: a, fontFamily: FONT, color: "#bfe6ff", textAlign: "right", textShadow: "0 2px 12px #000" }}>
      <div style={{ fontWeight: 900, fontSize: 84, fontVariantNumeric: "tabular-nums" }}>{d.toLocaleString("pt-BR")} m</div>
      <div style={{ fontWeight: 600, fontSize: 22, letterSpacing: 4, color: "#f4efe4" }}>PROFUNDIDADE</div>
    </div>
  );
};

/** Recapitulação: a sequência de escolhas (sobre o navio escurecido). */
const Recap: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() - from;
  if (f < 0) return null;
  const items = ["AVISOS DE GELO QUE NÃO CHEGARAM", "VELOCIDADE PERTO DA MÁXIMA", "BOTES PARA SÓ METADE", "PRIMEIROS BOTES QUASE VAZIOS", "UM RÁDIO DESLIGADO POR PERTO"];
  return (
    <div style={{ position: "absolute", left: 140, top: BAR + 90, fontFamily: FONT, color: "#f4efe4" }}>
      {items.map((t, i) => {
        const k = cl(f, i * 22, i * 22 + 14);
        return <div key={i} style={{ opacity: k, transform: `translateX(${(1 - k) * -30}px)`, fontWeight: 700, fontSize: 34, letterSpacing: 4, margin: "16px 0", textShadow: "0 2px 12px #000" }}><span style={{ color: "#d4ac4c", marginRight: 18 }}>{i + 1}</span>{t}</div>;
      })}
    </div>
  );
};

/** Tela final: marca + espaço para os elementos de tela final do YouTube (vídeo do Short e inscrever-se). */
const EndScreen: React.FC = () => {
  const f = useCurrentFrame();
  const a = cl(f, 0, 25);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 50%,#1a1430 0%,#05040a 80%)", opacity: a }}>
      <div style={{ position: "absolute", left: 170, top: 330, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18 }}>
        <Logo size={150} />
        <Wordmark size={46} />
        <div style={{ fontFamily: FONT, fontWeight: 600, fontSize: 26, letterSpacing: 3, color: "#c4b5fd" }}>Comenta o tema do próximo documentário</div>
      </div>
      {/* áreas para os elementos de tela final (o YouTube coloca por cima) */}
      <div style={{ position: "absolute", right: 170, top: 300, width: 700, height: 394, borderRadius: 18, border: "3px solid rgba(196,181,253,0.35)" }} />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ 3D desta parte */

/** Sala das caldeiras do Carpathia: frentes de caldeira com fornalhas acesas, carvão, foguistas. 1 u = 1 m. */
const BoilerRoom: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <mesh position={[0, -0.05, 0]}><boxGeometry args={[14, 0.1, 8]} /><meshStandardMaterial color="#2a2622" flatShading /></mesh>
    {[-4, 0, 4].map((x, i) => (
      <group key={i} position={[x, 0, -2.5]}>
        <mesh position={[0, 2.2, 0]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[2.0, 2.0, 2.4, 20]} /><meshStandardMaterial color="#3a3430" flatShading metalness={0.3} roughness={0.6} /></mesh>
        {[-0.8, 0.8].map((dx) => (
          <group key={dx} position={[dx, 1.1, 1.22]}>
            <mesh><circleGeometry args={[0.38, 16]} /><meshBasicMaterial color={`rgb(255,${130 + Math.round(40 * Math.sin(f / 4 + dx + i))},40)`} toneMapped={false} /></mesh>
            <pointLight position={[0, 0, 0.6]} intensity={3} distance={5} color="#ff8a30" />
          </group>
        ))}
      </group>
    ))}
    {Array.from({ length: 30 }, (_, i) => <mesh key={i} position={[-3 + rand(`co${i}`) * 6, 0.08, 1.2 + rand(`cz${i}`) * 1.4]} scale={0.1 + rand(`cs${i}`) * 0.08}><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial color="#121214" flatShading /></mesh>)}
    {[-2.2, 1.6].map((x, i) => <Figure1912 key={i} role="steerageMan" tint="#2a2420" frame={f} position={[x, 0, 1.0]} rotY={Math.PI + (i ? 0.3 : -0.3)} walk={0.5} scale={P} seed={60 + i} point={Math.sin(f / 8 + i) > 0 ? 1 : 0} />)}
  </group>
);

/** Destroços no fundo: proa (enterrada na lama, enferrujada) e popa destroçada mais longe, com campo de detritos. 1 u = 10 m. */
const Wreck: React.FC<{ f: number }> = ({ f }) => (
  <group>
    <Seabed size={160} />
    {/* proa: corte na altura da quebra, nariz enterrado */}
    <group position={[0, -0.75, 0]} rotation={[0.03, 0.15, -0.04]}>
      <Treat clip={{ normal: [1, 0, 0], constant: 1.0 }} rust={0.78}><TitanicHero f={f} wreck /></Treat>
      <Rusticles x0={1.5} x1={12.5} y={1.55} z={1.42} n={40} />
      <Rusticles x0={1.5} x1={12.5} y={1.55} z={-1.42} n={40} />
      {/* lama acumulada no nariz */}
      <mesh position={[13.4, -0.2, 0]} scale={[2.2, 0.9, 2.4]}><sphereGeometry args={[1, 12, 8]} /><meshStandardMaterial color="#4a4238" flatShading /></mesh>
    </group>
    {/* popa: destroçada, achatada, mais adiante */}
    <group position={[-17, -0.9, 6]} rotation={[0.05, 2.5, 0.06]} scale={[1, 0.72, 1.15]}>
      <Treat clip={{ normal: [-1, 0, 0], constant: -2 }} rust={0.85}><TitanicHero f={f} wreck /></Treat>
    </group>
    {/* campo de detritos entre as partes */}
    {Array.from({ length: 70 }, (_, i) => {
      const t = rand(`dw${i}`);
      const x = -15 + t * 15 + (rand(`dx${i}`) - 0.5) * 4, z = 6 * (1 - t) + (rand(`dz${i}`) - 0.5) * 4;
      const big = i % 9 === 0;
      return big ? (
        <mesh key={i} position={[x, -0.4, z]} rotation={[Math.PI / 2, rand(`dr${i}`) * 3, 0]}><cylinderGeometry args={[0.35, 0.35, 0.7, 10]} /><meshStandardMaterial color="#5a3a22" flatShading /></mesh>
      ) : (
        <mesh key={i} position={[x, -0.55, z]} rotation={[rand(`a${i}`), rand(`b${i}`) * 3, rand(`c${i}`)]}><boxGeometry args={[0.2 + rand(`s${i}`) * 0.6, 0.04, 0.15 + rand(`t${i}`) * 0.4]} /><meshStandardMaterial color={i % 3 ? "#6a4022" : "#3a3028"} flatShading /></mesh>
      );
    })}
    <MarineSnow f={f} n={120} R={20} H={10} />
  </group>
);

/* ================================================================== A PARTE 4 */

export const DocPart4: React.FC = () => {
  const cX = (lf: number, x0: number) => x0 + lf * 0.04;
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      {/* 1 · o Carpathia recebe o pedido de socorro (0–8,3 s) */}
      <Shot from={0} to={S(8.3)} fin={20}>
        <Cine bg={NIGHT} fov={40} keys={[[0, [-16, 3, 18], [0, 1.8, 0]], [S(8.3), [-12, 2.6, 15], [3, 1.8, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.25} /><group position={[cX(f, -4), 0, 0]}><Carpathia f={f} lights={1} smoke={1} /></group></>)}
        </Cine>
        <ChapterTag n={6} title="O RESGATE" from={S(0.3)} len={S(4)} />
        <Caption text="RMS CARPATHIA" sub="A ~90 KM DALI" from={S(4.6)} len={S(3.5)} pos="tl" />
      </Shot>
      {/* 2 · toda a força nas caldeiras (8,3–13,7 s) */}
      <Shot from={S(8.3)} to={S(13.7)}>
        <Cine bg="#0a0604" fov={50} light="none" keys={[[0, [0, 2.0, 6], [0, 1.4, -2]], [S(5.4), [1.2, 1.8, 5], [0, 1.4, -2]]]}>
          {(f) => (<><ambientLight intensity={0.18} color="#ffb070" /><BoilerRoom f={f} /></>)}
        </Cine>
      </Shot>
      {/* 3 · correndo no escuro entre icebergs (13,7–17,7 s) */}
      <Shot from={S(13.7)} to={S(17.7)}>
        <Cine bg={NIGHT} fov={44} keys={[[0, [6, 4, 14], [0, 1.5, 0]], [S(4), [10, 3.4, 12], [4, 1.5, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.25} /><group position={[cX(f, 0), 0, 0]}><Carpathia f={f} lights={1} smoke={1} /></group><Treat tint={["#16222e", 0.45]}><group position={[12, 0, -6]} scale={0.9}><Iceberg f={f} under={false} /></group><group position={[22, 0, 6]} scale={0.7}><Iceberg f={f} seed={7} under={false} /></group></Treat></>)}
        </Cine>
      </Shot>
      {/* 4 · chega às 4h (17,7–24,9 s) */}
      <Shot from={S(17.7)} to={S(24.9)} fin={14}>
        <Cine bg={DAWN} fov={40} light="day" keys={[[0, [-15, 2.8, 13], [0, 1.6, 0]], [S(7.2), [-13, 2.6, 11], [0, 1.6, 0]]]}>
          {(f) => (<><NightSea f={f} size={200} seg={120} moonX={0} calm={0.6} /><group rotation={[0, 0.5, 0]}><Carpathia f={f} lights={0.6} smoke={0.7} /></group><IceField n={60} R={30} /></>)}
        </Cine>
        <ClockBadge h={4} m={0} label="~4h" from={S(0.2)} len={S(6.8)} />
        <Caption text="QUASE 2 HORAS DEPOIS" sub="DO NAUFRÁGIO" from={S(2.8)} len={S(4.2)} pos="tl" />
      </Shot>
      {/* 5a · os botes chegam (24,9–28,9 s) */}
      <Shot from={S(24.9)} to={S(28.9)}>
        <Cine bg={DAWN} fov={42} light="day" keys={[[0, [-9, 1.6, 9], [0, 1.2, 0]], [S(4), [-8, 1.5, 8], [0, 1.2, 0]]]}>
          {(f) => (<><NightSea f={f} size={200} seg={120} moonX={0} calm={0.6} /><group rotation={[0, 0.5, 0]}><Carpathia f={f} lights={0.5} smoke={0.6} /></group>{[[-5, 3, 0], [-7, 1, 1], [-4.5, 5.5, 2]].map(([x, z, i]) => <group key={i} position={[x + cl(f, 0, S(4)) * 1.2, 0.12 + seaY(x, z, f) * 0.1, z]} rotation={[0, 0.6, 0]} scale={0.1}><Lifeboat f={f} people={10} /></group>)}</>)}
        </Cine>
        <Caption text="~700 SOBREVIVENTES" from={S(0.4)} len={S(3.4)} pos="tl" />
      </Shot>
      {/* 5b · no convés do Carpathia — o mascote ajuda a puxar um bote (28,9–32,6 s) */}
      <Shot from={S(28.9)} to={S(32.6)}>
        <Cine bg={DAWN} fov={50} light="day" keys={[[0, [-5, 2.4, -2], [2, 0, 5]], [S(3.7), [-4.5, 2.3, -1.6], [2, -0.4, 5]]]}>
          {(f) => (<><group position={[0, -9, 0]}><NightSea f={f} size={140} seg={100} moonX={0} calm={0.6} /></group><mesh position={[0, -0.05, 0]}><boxGeometry args={[16, 0.1, 6]} /><meshStandardMaterial color="#a88a60" flatShading /></mesh><mesh position={[0, 0.55, 3]}><boxGeometry args={[16, 0.06, 0.1]} /><meshStandardMaterial color="#e8e0cc" /></mesh>{Array.from({ length: 16 }, (_, i) => <mesh key={i} position={[-7.5 + i, 0.27, 3]}><boxGeometry args={[0.05, 0.55, 0.05]} /><meshStandardMaterial color="#e8e0cc" /></mesh>)}<Rod a={[0.5, 0.5, 3]} b={[1.4, -8.6, 7.2]} r={0.03} c="#c8b88a" /><group position={[1.5, -8.5 + seaY(1.5, 8, f) * 0.5, 8]} rotation={[0, 0.3, 0]} scale={0.9}><Lifeboat f={f} people={8} lamp={0} row={0} /></group><Mascot frame={f} position={[0.2, 0, 2.2]} scale={WS.mascot} rotY={0.1} point={1} /><Figure1912 role="seaman" frame={f} position={[-1.4, 0, 2.3]} rotY={0.1} scale={P} seed={70} point={1} /><Figure1912 role="officer" frame={f} position={[-3, 0, 1.6]} rotY={0.5} scale={P} seed={71} /></>)}
        </Cine>
        <Caption text="DE MAIS DE 2.200 A BORDO" from={S(0.3)} len={S(3.3)} pos="tl" />
      </Shot>
      {/* 6 · o mar cheio de gelo e de silêncio (32,6–38,3 s) */}
      <Shot from={S(32.6)} to={S(38.3)} fin={14}>
        <Cine bg={DAWN} fov={38} light="day" keys={[[0, [-30, 6, 30], [0, 1, 0]], [S(5.7), [-34, 8, 34], [0, 1, 0]]]}>
          {(f) => (<><NightSea f={f} size={240} seg={140} moonX={0} calm={0.5} /><group rotation={[0, 0.5, 0]} scale={0.8}><Carpathia f={f} lights={0.3} smoke={0.4} /></group><IceField n={110} R={45} seed="dawn" /><group position={[20, 0, -16]}><Iceberg f={f} under={false} /></group><group position={[-24, 0, -10]} scale={0.8}><Iceberg f={f} seed={9} under={false} /></group></>)}
        </Cine>
      </Shot>
      {/* 7 · o nascer do sol: aquela noite mudou o mar (38,3–44,9 s) */}
      <Shot from={S(38.3)} to={S(44.9)} fout={20}>
        <Cine bg={DAWN} fov={44} light="day" keys={[[0, [0, 2, 20], [0, 4, -60]], [S(6.6), [0, 3, 18], [0, 6, -60]]]}>
          {(f) => (<><NightSea f={f} size={300} seg={140} moonX={0} calm={0.4} /><mesh position={[0, 3 + f * 0.01, -120]}><circleGeometry args={[6, 32]} /><meshBasicMaterial color="#ffe0a0" toneMapped={false} /></mesh><IceField n={80} R={40} seed="sun" /></>)}
        </Cine>
        <ChapterTag n={7} title="O QUE MUDOU" from={S(3)} len={S(3.4)} />
      </Shot>
      {/* 8 · 1914: as primeiras regras (44,9–51,8 s) */}
      <Shot from={S(44.9)} to={S(51.8)} fin={14}><Solas /></Shot>
      {/* 9 · botes para todos (51,8–56,7 s) */}
      <Shot from={S(51.8)} to={S(56.7)}>
        <Cine bg={DAY} fov={34} light="day" keys={[[0, [6, 6, 22], [0, 2.4, 0]], [S(4.9), [2, 5.4, 20], [0, 2.4, 0]]]}>
          {(f) => (<><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[4000, 4000]} /><meshBasicMaterial color="#2f5f88" /></mesh><TitanicHero f={f} smoke={1} allBoats /></>)}
        </Cine>
        <Caption text="BOTES PARA TODOS A BORDO" from={S(0.4)} len={S(4.2)} pos="tl" />
      </Shot>
      {/* 10 · rádio 24 horas (56,7–60,4 s) */}
      <Shot from={S(56.7)} to={S(60.4)}>
        <Cine bg="#0c0a08" fov={46} light="interior" keys={[[0, [2.2, 1.6, 2.2], [0, 1.1, -1.2]], [S(3.7), [1.6, 1.5, 1.8], [0.2, 1.1, -1.3]]]}>
          {(f) => (<><RadioRoom f={f} papers={0.4} /><Figure1912 role="radio" frame={f} position={[0.0, 0, -0.5]} rotY={Math.PI} scale={P} seed={12} /><Figure1912 role="radio" frame={f} position={[1.3, 0, 0.2]} rotY={Math.PI + 0.8} scale={P} seed={13} /></>)}
        </Cine>
        <Caption text="RÁDIO 24 HORAS POR DIA" from={S(0.3)} len={S(3.2)} pos="tl" />
      </Shot>
      {/* 11 · a patrulha do gelo (60,4–67 s) */}
      <Shot from={S(60.4)} to={S(67)}>
        <Cine bg={DAY} fov={40} light="day" keys={[[0, [-14, 3, 16], [2, 1.5, -2]], [S(6.6), [-10, 2.8, 14], [3, 1.5, -2]]]}>
          {(f) => (<><mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}><planeGeometry args={[4000, 4000]} /><meshBasicMaterial color="#2c5a82" /></mesh><group position={[f * 0.02, 0, 0]} rotation={[0, -0.2, 0]}><Californian f={f} lights={0} /></group><group position={[12, 0, -8]} scale={1.2}><Iceberg f={f} under={false} /></group></>)}
        </Cine>
        <Caption text="PATRULHA INTERNACIONAL DO GELO" sub="CRIADA EM 1914 · ATIVA ATÉ HOJE" from={S(0.4)} len={S(6)} pos="tl" />
      </Shot>
      {/* 12 · a descida: perdido por 73 anos (67–75,1 s) */}
      <Shot from={S(67)} to={S(75.1)} fin={14}>
        <Cine bg={DEEP} fov={50} light="none" keys={[[0, [0, 40, 8], [0, 0, 0]], [S(8.1), [0, 6, 8], [0, 0, 0]]]}>
          {(f) => (<><ambientLight intensity={0.25} color="#4a6a8a" /><fog attach="fog" args={["#020610", 4, 30]} /><MarineSnow f={f * 3} n={160} R={14} H={48} /></>)}
        </Cine>
        <Depth from={S(0.2)} len={S(8)} to={3800} />
        <Caption text="PERDIDO POR 73 ANOS" from={S(3.3)} len={S(4.4)} />
      </Shot>
      {/* 13a · 1985: a proa aparece na luz do submersível (75,1–80,4 s) */}
      <Shot from={S(75.1)} to={S(80.4)} fin={20}>
        <Cine bg={DEEP} fov={44} light="none" keys={[[0, [24, 3.2, 10], [12, 0.6, 0]], [S(5.3), [19, 3.0, 8.5], [10, 0.6, 0]]]}>
          {(f) => (<><ambientLight intensity={1.1} color="#7a9aba" /><hemisphereLight args={["#7a9aca", "#1a1c20", 0.9]} /><directionalLight position={[20, 12, 14]} intensity={1.4} color="#cfe4ff" /><fog attach="fog" args={["#06101c", 14, 60]} /><Wreck f={f} /><group position={[17.5, 2.4, 3]} rotation={[0, Math.PI + 0.5, -0.1]} scale={0.12}><Submersible f={f} /></group><spotLight position={[17, 3, 2.6]} intensity={40} distance={30} angle={0.6} penumbra={0.5} color="#eef6ff" target-position={[11, 0.8, 0]} /></>)}
        </Cine>
        <Caption text="1º DE SETEMBRO DE 1985" sub="~3.800 METROS DE PROFUNDIDADE" from={S(0.6)} len={S(4.4)} pos="tl" />
      </Shot>
      {/* 13b · o mascote no submersível (80,4–83,7 s) */}
      <Shot from={S(80.4)} to={S(83.7)}>
        <Cine bg={DEEP} fov={40} light="none" keys={[[0, [7.5, 0.4, 3.2], [1.7, -0.3, 0]], [S(3.3), [6.4, 0.3, 2.6], [1.7, -0.3, 0]]]}>
          {(f) => (<><ambientLight intensity={0.9} color="#7a9aba" /><directionalLight position={[8, 6, 6]} intensity={1.2} color="#cfe4ff" /><fog attach="fog" args={["#06101c", 8, 34]} /><Treat clip={{ normal: [-1, 0, 0], constant: 2.4 }}><Submersible f={f} beams={0} /></Treat><mesh position={[2.4, 0, 0]} rotation={[0, Math.PI / 2, 0]} scale={[1.06, 1, 1]}><circleGeometry args={[0.92, 32]} /><meshStandardMaterial color="#bfe2f2" transparent opacity={0.18} depthWrite={false} /></mesh><pointLight position={[1.6, 0.5, 0]} intensity={4} distance={4} color="#ffd9a0" /><mesh position={[1.3, -0.75, 0]}><boxGeometry args={[0.8, 0.15, 0.9]} /><meshStandardMaterial color="#3a3a42" /></mesh><Mascot frame={f} position={[1.75, -0.68, 0]} scale={WS.mascot * 0.45} rotY={Math.PI / 2} wave={1} /><MarineSnow f={f} n={60} R={6} H={6} /></>)}
        </Cine>
      </Shot>
      {/* 13c · partido em dois (83,7–87,7 s) */}
      <Shot from={S(83.7)} to={S(87.7)}>
        <Cine bg={DEEP} fov={42} light="none" keys={[[0, [10, 14, 26], [-4, 0, 3]], [S(4), [6, 16, 28], [-5, 0, 3]]]}>
          {(f) => (<><ambientLight intensity={1.1} color="#7a9aba" /><hemisphereLight args={["#7a9aca", "#1a1c20", 0.9]} /><directionalLight position={[10, 20, 14]} intensity={1.4} color="#cfe4ff" /><fog attach="fog" args={["#06101c", 20, 75]} /><Wreck f={f} /></>)}
        </Cine>
        <Caption text="PARTIDO EM DOIS" sub="PROA E POPA A ~600 M UMA DA OUTRA" from={S(0.3)} len={S(3.6)} pos="tl" />
      </Shot>
      {/* 14 · a sequência de escolhas (87,7–97,1 s) */}
      <Shot from={S(87.7)} to={S(97.1)} fin={20}>
        <Cine bg={NIGHT} fov={34} filter="brightness(0.55)" keys={[[0, [4, 3, 34], [2, 2, 0]], [S(9.4), [8, 2.6, 30], [5, 2.2, 0]]]}>
          {(f) => (<><Sky f={f} /><NightSea f={f} size={200} seg={140} moonX={999} calm={0.15} /><group position={[-4 + f * 0.035, 0, 0]}><TitanicHero f={f} lights={1} smoke={0.4} /></group></>)}
        </Cine>
        <Recap from={S(4.2)} />
      </Shot>
      {/* 15 · o Short da porta (97,1–103,1 s) */}
      <Shot from={S(97.1)} to={S(103.1)}>
        <Cine bg={NIGHT} fov={44} keys={[[0, [6, 2.6, 6], [0, 0.2, 0]], [S(6), [5, 2.2, 5.4], [0, 0.2, 0]]]}>
          {(f) => (<><Sky f={f} n={600} r={80} /><NightSea f={f} size={80} seg={110} moonX={999} calm={0.2} /><group position={[0, 0.6 + seaY(0, 0, f), 0]} rotation={[0, -0.4, 0]}><Lifeboat f={f} people={8} lamp={1} row={0.3} /></group></>)}
        </Cine>
        <Caption text="O JACK CABIA NA PORTA?" sub="O VÍDEO ESTÁ NA TELA" from={S(1.5)} len={S(4.4)} pos="tl" />
      </Shot>
      {/* 16 · tela final (103,1–115 s) */}
      <Shot from={S(103.1)} to={PART4_FRAMES}><EndScreen /></Shot>
      <Letterbox />
      <Part4Audio />
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ áudio */

const sfx = (name: string, at: number, volume: number, len?: number) => ({ name, at, volume, len });
const SFX = [
  sfx("ocean-amb", 0, 0.28, 8.3), sfx("spark", 0.8, 0.3), sfx("fire", 8.3, 0.4, 5.4), sfx("clunk", 9.2, 0.3), sfx("dig", 10.4, 0.3), sfx("dig", 11.8, 0.3),
  sfx("rush", 13.7, 0.3), sfx("ocean-amb", 17.7, 0.25, 21), sfx("bird-chirp", 33, 0.12), sfx("shimmer", 38.5, 0.2),
  sfx("clunk", 47.4, 0.3), sfx("whoosh-soft", 51.8, 0.2), sfx("spark", 57, 0.3), sfx("spark", 58.4, 0.25),
  sfx("dive", 67.1, 0.35), sfx("deep-amb", 67.1, 0.35, 20.6), sfx("sub-bell", 75.4, 0.2), sfx("bubbles", 80.6, 0.3),
  sfx("ocean-amb", 87.7, 0.22, 9.4), sfx("ocean-amb", 97.1, 0.25, 6), sfx("fenda-close", 103.2, 0.45),
];
const Part4Audio: React.FC = () => (
  <>
    <Sequence from={S(OFF6)} layout="none"><Audio src={staticFile("audio/doc/bloco6.wav")} volume={1} /></Sequence>
    <Sequence from={S(OFF7)} layout="none"><Audio src={staticFile("audio/doc/bloco7.wav")} volume={1} /></Sequence>
    <Audio src={staticFile("audio/doc/musica-parte4.wav")} volume={0.9} />
    {SFX.map((c, i) => (
      <Sequence key={i} from={S(c.at)} durationInFrames={c.len ? S(c.len) : undefined} layout="none">
        <Audio src={staticFile(`audio/sfx/${c.name}.wav`)} volume={c.volume} loop={Boolean(c.len)} />
      </Sequence>
    ))}
  </>
);
