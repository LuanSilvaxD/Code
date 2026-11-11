import { ThreeCanvas } from "@remotion/three";
import { AbsoluteFill, useVideoConfig } from "remotion";
import { BRAND } from "./brand";
import { Background } from "./components/Background";
import { Logo, Wordmark } from "./components/Brand";
import { CameraController } from "./components/CameraController";
import { Lighting } from "./components/Lighting";
import { PostFx } from "./components/PostFx";
import { World } from "./components/World";
import { HerMark } from "./scenes/CurieScenes";
import { useCurrentFrame } from "remotion";
import { FONT, PALETTE } from "./theme";

// Capa (Shorts/TikTok, 1080×1920) e thumbnail (YouTube, 1280×720) feitas com o PRÓPRIO cenário 3D.
// Renderize no quadro escolhido:  npx remotion still CapaVertical out/capa-vertical.png --frame=<N>
// (Não use <Freeze> aqui: ele não alcança o ThreeCanvas e a câmera fica no frame 0.)
// Vídeo de revelação → a capa NÃO pode mostrar a resposta; use a pergunta e um quadro do mistério.

export const THUMB_LINES: { text: string; color: string; scale: number }[] = [
  { text: "QUEM FOI", color: "#ffffff", scale: 0.7 },
  { text: "ELA?", color: "#ffd36b", scale: 1.15 },
  { text: "OS CADERNOS AINDA SÃO RADIOATIVOS", color: "#c4b5fd", scale: 0.3 },
];
export const THUMB_TAG = "GIGANTES DA HUMANIDADE · EP. 01";

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
    <AbsoluteFill style={{ backgroundColor: BRAND.colors.umbra }}>
      <Background />
      <ThreeCanvas width={width} height={height} gl={{ antialias: true }} shadows="percentage" flat camera={{ fov: 24, near: 0.5, far: 400, position: [8, 6, 30] }}>
        <CameraController />
        <Lighting />
        <World />
      </ThreeCanvas>
      <PostFx />
      <HerMarkNow />
      <AbsoluteFill style={{ background: v ? "linear-gradient(180deg, rgba(11,8,18,0.88) 0%, rgba(11,8,18,0.55) 34%, rgba(0,0,0,0) 50%)" : "linear-gradient(90deg, rgba(11,8,18,0.9) 0%, rgba(11,8,18,0.45) 50%, rgba(0,0,0,0) 72%)" }} />
      {/* texto no terço superior: a base da capa fica sob a interface do TikTok/Shorts */}
      <div style={{ position: "absolute", left: v ? 60 : 56, right: v ? 60 : undefined, top: v ? 190 : 64, display: "flex", flexDirection: "column", alignItems: v ? "center" : "flex-start", textAlign: v ? "center" : "left", gap: v ? 14 : 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: v ? 6 : 4 }}>
          <Logo size={v ? 96 : 60} />
          <Wordmark size={v ? 28 : 18} />
        </div>
        <div style={{ padding: v ? "10px 30px" : "6px 20px", borderRadius: 999, background: BRAND.colors.accent, color: "#ffffff", fontFamily: FONT, fontWeight: 900, fontSize: v ? 44 : 28, letterSpacing: 2, boxShadow: "0 8px 20px rgba(0,0,0,0.4)" }}>{THUMB_TAG}</div>
        {THUMB_LINES.map((l, i) => (
          <Line key={i} text={l.text} color={l.color} size={Math.round(base * l.scale)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

const HerMarkNow: React.FC = () => <HerMark frame={useCurrentFrame()} />;
