import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { CameraController } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { PostFx } from "./components/PostFx";
import { World } from "./components/World";
import { FONT, PALETTE } from "./theme";

// Capa (Shorts/TikTok, 1080×1920) e thumbnail (YouTube, 1280×720) feitas com o PRÓPRIO cenário 3D.
// Renderize no quadro escolhido:  npx remotion still CapaVertical out/capa-vertical.png --frame=<N>
// (Não use <Freeze> aqui: ele não alcança o ThreeCanvas e a câmera fica no frame 0.)
// Vídeo de revelação → a capa NÃO pode mostrar a resposta; use a pergunta e um quadro do mistério.

export const THUMB_LINES: { text: string; color: string; scale: number }[] = [
  { text: "PERGUNTA", color: "#ffffff", scale: 0.6 },
  { text: "IMPACTANTE", color: PALETTE.warning, scale: 1 },
  { text: "AQUI?", color: "#ffffff", scale: 0.75 },
];
export const THUMB_TAG = "TEMA";

const Line: React.FC<{ text: string; color: string; size: number }> = ({ text, color, size }) => (
  <div style={{ fontFamily: FONT, fontWeight: 900, fontSize: size, lineHeight: 1.0, color, WebkitTextStroke: `${Math.round(size * 0.16)}px ${PALETTE.outline}`, paintOrder: "stroke fill", textShadow: "0 10px 26px rgba(0,0,0,0.55)", letterSpacing: -1 }}>
    {text}
  </div>
);

export const Thumbnail: React.FC<{ layout: "vertical" | "horizontal" }> = ({ layout }) => {
  const { width, height } = useVideoConfig();
  const v = layout === "vertical";
  const base = v ? 150 : 96;
  return (
    <AbsoluteFill style={{ backgroundColor: "#0e2036" }}>
      <Background />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: 24, near: 0.5, far: 400, position: [8, 6, 30] }}>
        <CameraController />
        <Lighting />
        <World />
      </ThreeCanvas>
      <PostFx />
      <AbsoluteFill style={{ background: v ? "linear-gradient(180deg, rgba(6,10,18,0.82) 0%, rgba(6,10,18,0.5) 32%, rgba(0,0,0,0) 48%)" : "linear-gradient(90deg, rgba(6,10,18,0.85) 0%, rgba(6,10,18,0.4) 50%, rgba(0,0,0,0) 72%)" }} />
      {/* texto no terço superior: a base da capa fica sob a interface do TikTok/Shorts */}
      <div style={{ position: "absolute", left: v ? 60 : 56, right: v ? 60 : undefined, top: v ? 190 : 64, display: "flex", flexDirection: "column", alignItems: v ? "center" : "flex-start", textAlign: v ? "center" : "left", gap: v ? 14 : 8 }}>
        <div style={{ padding: v ? "10px 30px" : "6px 20px", borderRadius: 999, background: PALETTE.negative, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: v ? 44 : 28, letterSpacing: 2, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>{THUMB_TAG}</div>
        {THUMB_LINES.map((l, i) => (
          <Line key={i} text={l.text} color={l.color} size={Math.round(base * l.scale)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
