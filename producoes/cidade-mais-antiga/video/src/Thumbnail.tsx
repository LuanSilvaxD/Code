import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { CameraController } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { World } from "./components/World";
import { FONT, PALETTE } from "./theme";

// Capa/thumbnail SEM spoiler: quadro de Jericó (torre + faixas vazias), a pergunta em destaque.
// Renderize no quadro THUMB_FRAME: npx remotion still CapaVertical --frame=1330.

export const THUMB_FRAME = 1330;

const Line: React.FC<{ text: string; color: string; size: number }> = ({ text, color, size }) => (
  <div
    style={{
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: size,
      lineHeight: 1.0,
      color,
      WebkitTextStroke: `${Math.round(size * 0.16)}px ${PALETTE.outline}`,
      paintOrder: "stroke fill",
      textShadow: "0 10px 26px rgba(0,0,0,0.55)",
      letterSpacing: -1,
    }}
  >
    {text}
  </div>
);

export const Thumbnail: React.FC<{ layout: "vertical" | "horizontal" }> = ({ layout }) => {
  const { width, height } = useVideoConfig();
  const v = layout === "vertical";
  return (
    <AbsoluteFill style={{ backgroundColor: "#2a1f2c" }}>
      <Background />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: 24, near: 0.5, far: 400, position: [8, 6, 30] }}>
        <CameraController />
        <Lighting />
        <World />
      </ThreeCanvas>
      <AbsoluteFill
        style={{
          background: v
            ? "linear-gradient(180deg, rgba(24,14,10,0.85) 0%, rgba(24,14,10,0.6) 30%, rgba(0,0,0,0) 46%)"
            : "linear-gradient(90deg, rgba(24,14,10,0.88) 0%, rgba(24,14,10,0.45) 50%, rgba(0,0,0,0) 72%)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: v ? 60 : 56,
          right: v ? 60 : undefined,
          top: v ? 170 : 64,
          display: "flex",
          flexDirection: "column",
          alignItems: v ? "center" : "flex-start",
          textAlign: v ? "center" : "left",
          gap: v ? 14 : 8,
        }}
      >
        <Line text="QUAL É A CIDADE" color="#ffffff" size={v ? 86 : 54} />
        <Line text="MAIS ANTIGA" color={PALETTE.warning} size={v ? 150 : 92} />
        <Line text="DO MUNDO?" color="#ffffff" size={v ? 112 : 70} />
        <div style={{ marginTop: v ? 10 : 6, padding: v ? "10px 30px" : "6px 20px", borderRadius: 999, background: PALETTE.negative, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: v ? 44 : 28, letterSpacing: 2, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          NÃO É ROMA
        </div>
      </div>
    </AbsoluteFill>
  );
};
