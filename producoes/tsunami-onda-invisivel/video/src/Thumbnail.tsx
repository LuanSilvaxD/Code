import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { Background } from "./components/Background";
import { CameraController } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { World } from "./components/World";
import { FONT, PALETTE } from "./theme";

// Capa/thumbnail: renderize no quadro THUMB_FRAME (parede d'água, cena 2), ex.: npx remotion still CapaVertical --frame=395.
// vertical = capa de Shorts/TikTok (1080×1920); horizontal = thumbnail do YouTube (1280×720).

export const THUMB_FRAME = 395;

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
    <AbsoluteFill style={{ backgroundColor: "#0e2036" }}>
        <Background />
        <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: v ? 24 : 30, near: 0.5, far: 400, position: [8, 6, 30] }}>
          <CameraController />
          <Lighting />
          <World />
        </ThreeCanvas>
      {/* escurece o alto para o texto ler bem */}
      <AbsoluteFill style={{ background: v ? "linear-gradient(0deg, rgba(5,12,24,0.0) 0%, rgba(5,12,24,0.75) 30%, rgba(5,12,24,0.5) 50%, rgba(0,0,0,0) 66%)" : "linear-gradient(90deg, rgba(5,12,24,0.82) 0%, rgba(5,12,24,0.35) 48%, rgba(0,0,0,0) 70%)" }} />
      <div
        style={{
          position: "absolute",
          left: v ? 70 : 56,
          right: v ? 70 : undefined,
          top: v ? 800 : 70,
          display: "flex",
          flexDirection: "column",
          alignItems: v ? "center" : "flex-start",
          textAlign: v ? "center" : "left",
          gap: v ? 18 : 10,
        }}
      >
        <div style={{ padding: v ? "12px 34px" : "8px 22px", borderRadius: 999, background: PALETTE.negative, color: "#fff", fontFamily: FONT, fontWeight: 900, fontSize: v ? 52 : 34, letterSpacing: 3, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>
          TSUNAMI
        </div>
        <Line text="NO MAR:" color="#ffffff" size={v ? 92 : 62} />
        <Line text="INVISÍVEL" color="#7fe3ff" size={v ? 150 : 96} />
        <Line text="NA COSTA:" color="#ffffff" size={v ? 92 : 62} />
        <Line text="PAREDÃO" color={PALETTE.warning} size={v ? 168 : 110} />
      </div>
    </AbsoluteFill>
  );
};
