import { AbsoluteFill, useCurrentFrame } from "remotion";
import { track } from "../data/scenes";
import { FONT, PALETTE } from "../theme";
import { clamp } from "../utils/animation";

// Efeitos de tela dirigidos por trilhas (crie-as com os helpers de utils/fx.ts):
//   screen.shake  0→1   tremor (impactos, terremotos, quedas)
//   screen.zoom   0→1   "punch-in" de ~7% (ênfase numa palavra forte)
//   screen.flash  0→1   clarão branco (revelação, impacto)
//   screen.whip  −1..1  chicote lateral com borrão de movimento (transição entre cenas)
//   screen.sat    0..1  dessaturação (1 = cor normal; use para flashback/prévia)
//   rewind        0→1   rebobinar (borrão + linhas de VHS + ◀◀) — para voltar no tempo da história
// Aplicados ao wrapper do fundo + canvas 3D; badges e legendas ficam nítidos por cima.

export const useScreenFx = () => {
  const frame = useCurrentFrame();
  const shake = clamp(track("screen.shake", frame), 0, 1);
  const zoom = clamp(track("screen.zoom", frame), 0, 1.2);
  const whip = clamp(track("screen.whip", frame), -1, 1);
  const rewind = clamp(track("rewind", frame), 0, 1);
  const sat = clamp(track("screen.sat", frame, 1), 0, 1);
  // chicote: desloca e amplia junto (zoom ≥ deslocamento/540 px) para nunca mostrar a borda do canvas
  const dx = shake * 16 * Math.sin(frame * 2.7) + whip * 160;
  const dy = shake * 11 * Math.cos(frame * 3.3);
  const blur = Math.abs(whip) * 14 + rewind * 3;
  return {
    style: {
      transform: `translate(${dx}px, ${dy}px) scale(${1 + 0.07 * zoom + 0.36 * Math.abs(whip) + 0.04 * shake})`,
      filter: `saturate(${sat * (1 - 0.8 * rewind)}) contrast(${1 + 0.15 * rewind}) blur(${blur}px)`,
    } as React.CSSProperties,
    whip,
    rewind,
  };
};

/** Camada por cima do 3D: clarão, riscos do chicote e o visual de rebobinar. */
export const ScreenFxOverlay: React.FC = () => {
  const frame = useCurrentFrame();
  const flash = clamp(track("screen.flash", frame), 0, 1);
  const whip = clamp(track("screen.whip", frame), -1, 1);
  const rewind = clamp(track("rewind", frame), 0, 1);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      {Math.abs(whip) > 0.02 ? (
        <AbsoluteFill style={{ opacity: Math.abs(whip) * 0.8, background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.0) 0px, rgba(255,255,255,0.0) 22px, rgba(255,255,255,0.35) 24px, rgba(255,255,255,0.0) 27px)" }} />
      ) : null}
      {rewind > 0.01 ? (
        <AbsoluteFill style={{ opacity: rewind }}>
          <AbsoluteFill style={{ background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 2px, rgba(0,0,0,0) 2px, rgba(0,0,0,0) 7px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", fontFamily: FONT, fontWeight: 900, fontSize: 150, color: "#ffffff", WebkitTextStroke: `10px ${PALETTE.outline}`, paintOrder: "stroke fill" }}>◀◀</div>
        </AbsoluteFill>
      ) : null}
      {flash > 0.01 ? <AbsoluteFill style={{ background: "#ffffff", opacity: flash * 0.85 }} /> : null}
    </AbsoluteFill>
  );
};
