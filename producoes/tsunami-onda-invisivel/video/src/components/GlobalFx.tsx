import { AbsoluteFill, useCurrentFrame } from "remotion";
import { sceneAt, track } from "../data/scenes";
import { FONT, PALETTE } from "../theme";
import { clamp } from "../utils/animation";

// Efeitos globais: tremor de tela, prévia dessaturada + rebobinar (cenas 2→3) e o selo de escala.

export const useCanvasFx = () => {
  const frame = useCurrentFrame();
  const shake = clamp(track("screen.shake", frame), 0, 1);
  const rewind = clamp(track("rewind", frame), 0, 1);
  const preview = sceneAt(frame).id === "scene-02-paredao-previa";
  const dx = shake * 14 * Math.sin(frame * 2.7);
  const dy = shake * 10 * Math.cos(frame * 3.3);
  const sat = preview ? 0.62 : 1;
  return {
    transform: `translate(${dx}px, ${dy}px)`,
    filter: `saturate(${sat * (1 - 0.8 * rewind)}) contrast(${1 + 0.15 * rewind}) blur(${rewind * 3}px)`,
    rewind,
    preview,
  };
};

export const RewindOverlay: React.FC = () => {
  const { rewind, preview } = useCanvasFx();
  return (
    <>
      {preview ? (
        <div style={{ position: "absolute", left: 90, top: 1240, padding: "8px 20px", borderRadius: 18, background: "rgba(10,20,32,0.7)", color: "#fff", fontFamily: FONT, fontWeight: 800, fontSize: 26, letterSpacing: 2 }}>
          NA COSTA
        </div>
      ) : null}
      {rewind > 0.01 ? (
        <AbsoluteFill style={{ opacity: rewind }}>
          <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ffffff", WebkitTextStroke: `10px ${PALETTE.outline}`, paintOrder: "stroke fill" }}>◀◀</div>
        </AbsoluteFill>
      ) : null}
    </>
  );
};

export const ScaleTag: React.FC = () => {
  const frame = useCurrentFrame();
  const show = clamp(track("scaleTag.show", frame), 0, 1);
  const ex = clamp(track("view.exaggeration", frame), 0, 1);
  const id = sceneAt(frame).id;
  const late = id === "scene-14-final" || id === "scene-02-paredao-previa" || id === "scene-01-gancho-navio";
  const a = show * clamp((ex - 0.5) * 3, 0, 1) * (late ? 0 : 1);
  if (a <= 0.01) return null;
  return (
    <div style={{ position: "absolute", right: 90, top: 1262, padding: "8px 18px", borderRadius: 16, background: "rgba(10,20,32,0.72)", border: "2px solid #ffffff66", color: "#ffffffdd", fontFamily: FONT, fontWeight: 800, fontSize: 22, letterSpacing: 1.5, opacity: a }}>
        ESCALA VERTICAL EXAGERADA
    </div>
  );
};
