import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { BRAND } from "../brand";
import { FONT } from "../theme";
import { clamp, EASE, rand } from "../utils/animation";

// Abertura e encerramento fixos da FENDA UMBRA + marca (wordmark).
// A "fenda" é uma rachadura vertical irregular: dois painéis de sombra com borda serrilhada que se afastam
// (abertura) ou se juntam (encerramento), com um brilho âmbar na borda — a luz que entra pela fenda.

const H = 1920;
const W = 1080;
const STEPS = 14;
// perfil fixo da rachadura (determinístico: random(seed) do Remotion via rand)
const JAG = Array.from({ length: STEPS + 1 }, (_, i) => (rand(`fenda-${i}`) - 0.5) * 70);

/** p = 0 fechada (tela toda em sombra), p = 1 totalmente aberta. */
/** `crack`: opacidade da rachadura/brilho (no encerramento ela some depois de fechar para não cortar a marca). */
export const Slit: React.FC<{ p: number; crack?: number }> = ({ p, crack = 1 }) => {
  if (p >= 0.999) return null;
  const gap = p * (W * 0.75); // meia-abertura máxima
  const edge = (side: -1 | 1) =>
    JAG.map((j, i) => {
      const y = (i / STEPS) * H;
      const x = W / 2 + j * (1 - p * 0.6) + side * gap;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    });
  const left = `0,0 ${edge(-1).join(" ")} 0,${H}`;
  const right = `${W},0 ${edge(1).join(" ")} ${W},${H}`;
  const glow = clamp(1 - p * 1.4, 0, 1) * crack;
  const { umbra, amber } = BRAND.colors;
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0 }}>
      <defs>
        <filter id="fenda-glow" x="-20%" y="-5%" width="140%" height="110%">
          <feGaussianBlur stdDeviation="10" />
        </filter>
      </defs>
      {/* luz vazando pela fenda */}
      <polyline points={edge(-1).join(" ")} fill="none" stroke={amber} strokeWidth={26} opacity={0.75 * glow} filter="url(#fenda-glow)" />
      <polyline points={edge(1).join(" ")} fill="none" stroke={amber} strokeWidth={26} opacity={0.75 * glow} filter="url(#fenda-glow)" />
      <polygon points={left} fill={umbra} />
      <polygon points={right} fill={umbra} />
      <polyline points={edge(-1).join(" ")} fill="none" stroke={amber} strokeWidth={4} opacity={0.95 * glow} />
      <polyline points={edge(1).join(" ")} fill="none" stroke={amber} strokeWidth={4} opacity={0.95 * glow} />
    </svg>
  );
};

/** Marca: FENDA ╱ UMBRA, com a rachadura âmbar entre as palavras. */
export const Wordmark: React.FC<{ size?: number; opacity?: number }> = ({ size = 34, opacity = 1 }) => {
  const { amber, cream } = BRAND.colors;
  const [a, b] = BRAND.name.split(" ");
  return (
    <div style={{ display: "flex", alignItems: "center", gap: size * 0.32, opacity, fontFamily: FONT, fontWeight: 900, fontSize: size, letterSpacing: size * 0.18, color: cream, textShadow: "0 4px 14px rgba(0,0,0,0.6)" }}>
      <span>{a}</span>
      <svg width={size * 0.5} height={size * 1.15} viewBox="0 0 20 46">
        <polyline points="12,0 6,12 13,20 5,31 11,38 8,46" fill="none" stroke={amber} strokeWidth={3.4} strokeLinejoin="round" />
      </svg>
      <span>{b}</span>
    </div>
  );
};

/** Abertura: a fenda se abre sobre a maquete; a marca aparece pequena no topo e sai. */
export const BrandIntro: React.FC = () => {
  const frame = useCurrentFrame();
  const { openStart, openEnd, wordmarkUntil } = BRAND.intro;
  if (frame > wordmarkUntil + 2) return null;
  const p = interpolate(frame, [openStart, openEnd], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
  const wm = interpolate(frame, [openStart + 4, openStart + 12, wordmarkUntil - 12, wordmarkUntil], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Slit p={p} />
      {/* 205 px: abaixo das abas do topo do TikTok e acima dos badges (262 px) */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 205, display: "flex", justifyContent: "center" }}>
        <Wordmark size={30} opacity={wm} />
      </div>
    </AbsoluteFill>
  );
};

/** Encerramento: a fenda se fecha sobre a maquete; marca grande + chamada. Ocupa os últimos BRAND.outro.seconds. */
export const BrandOutro: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, fps } = useVideoConfig();
  const len = Math.round(BRAND.outro.seconds * fps);
  const local = frame - (durationInFrames - len);
  if (local < 0) return null;
  const p = interpolate(local, [0, 18], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.inOut });
  const wm = interpolate(local, [21, 31], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: EASE.out });
  const cta = interpolate(local, [29, 41], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  // a rachadura brilha enquanto fecha e se apaga antes da marca entrar
  const crack = interpolate(local, [12, 22], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const { cream } = BRAND.colors;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <Slit p={p} crack={crack} />
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 34 }}>
        <div style={{ scale: String(0.9 + 0.1 * wm) }}>
          <Wordmark size={64} opacity={wm} />
        </div>
        <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 36, color: cream, opacity: cta * 0.9, letterSpacing: 1, translate: `0px ${(1 - cta) * 14}px` }}>{BRAND.cta}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
