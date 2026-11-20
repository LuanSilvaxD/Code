import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { POST, SAFE } from "../theme";

// Acabamento final por cima de tudo (exceto legendas/badges, que ficam acima): scrims de leitura,
// correção de cor suave, vinheta e grão. Tudo CSS/SVG — funciona igual com GPU ou no render por software.

/** Scrims: escurecem o topo (badges) e a base (legendas) para o texto ler sobre qualquer cenário. */
export const Scrims: React.FC = () => (
  <AbsoluteFill style={{ pointerEvents: "none" }}>
    {POST.scrimTop > 0 ? (
      <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: SAFE.badgeTop + 260, background: `linear-gradient(180deg, rgba(6,10,18,${POST.scrimTop}) 0%, rgba(6,10,18,0) 100%)` }} />
    ) : null}
    {POST.scrimBottom > 0 ? (
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 1920 - SAFE.captionCenterY + 220, background: `linear-gradient(0deg, rgba(6,10,18,${POST.scrimBottom}) 0%, rgba(6,10,18,${POST.scrimBottom * 0.6}) 45%, rgba(6,10,18,0) 100%)` }} />
    ) : null}
  </AbsoluteFill>
);

/** Cor + vinheta + grão (grão determinístico: a semente muda a cada 2 frames, nunca Math.random). */
export const PostFx: React.FC = () => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const seed = Math.floor(frame / 2) % 12;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {POST.grade.opacity > 0 ? <AbsoluteFill style={{ background: POST.grade.color, opacity: POST.grade.opacity, mixBlendMode: "soft-light" }} /> : null}
      {POST.vignette > 0 ? (
        <AbsoluteFill style={{ background: `radial-gradient(ellipse 78% 62% at 50% 46%, rgba(0,0,0,0) 55%, rgba(0,0,0,${POST.vignette}) 100%)` }} />
      ) : null}
      {POST.grain > 0 ? (
        <svg width={width} height={height} style={{ position: "absolute", inset: 0, opacity: POST.grain, mixBlendMode: "overlay" }}>
          <filter id={`grain-${seed}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix type="saturate" values="0" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

/** Barra de progresso fina no topo (opcional, POST.progressBar). */
export const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();
  if (!POST.progressBar) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: (width * frame) / Math.max(1, durationInFrames - 1), background: "#ffffffd9", boxShadow: "0 0 10px rgba(255,255,255,0.6)" }} />
  );
};
