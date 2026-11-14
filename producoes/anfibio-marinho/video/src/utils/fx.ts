import type { TrackAnimation } from "./animation";

// Atalhos que geram as trilhas dos efeitos de tela (components/ScreenFx.tsx) e de explosões (Burst).
// Use dentro de `animations` de uma cena, com frames LOCAIS. Ex.:
//   animations: [...fx.flash(W("s12", 2)), ...fx.punch(W("s12", 2)), ...fx.whipOut(end(3))]
//   e na cena seguinte: animations: [...fx.whipIn(), ...]
// Atenção ao motor de trilhas: ANTES da 1ª entrada de um alvo vale o `from` dela. Por isso os efeitos que
// começam "ligados" (shake, whipIn) trazem um pré-zero longe no passado — senão valeriam desde o frame 0.
// Regra de bom gosto: no máximo um efeito "forte" (flash, shake, whip) a cada ~6–8 s; eles marcam
// momentos — impacto, virada, revelação —, não decoram cortes comuns.

// Pré-zero bem antes do início do vídeo: fixa o valor 0 antes da 1ª entrada sem se sobrepor a nenhuma outra.
const zero = (target: string): TrackAnimation => ({ type: "interpolate", target, startFrame: -100000, endFrame: -99999, from: 0, to: 0, unit: "0-1" });

export const fx = {
  /** Clarão rápido (2 f subindo, ~10 f descendo). */
  flash: (at: number, len = 10): TrackAnimation[] => [
    { type: "interpolate", target: "screen.flash", startFrame: at, endFrame: at + 2, from: 0, to: 1, easing: "out", unit: "0-1" },
    { type: "interpolate", target: "screen.flash", startFrame: at + 2, endFrame: at + 2 + len, from: 1, to: 0, easing: "in", unit: "0-1" },
  ],
  /** Tremor que decai. */
  shake: (at: number, len = 22): TrackAnimation[] => [
    zero("screen.shake"),
    { type: "interpolate", target: "screen.shake", startFrame: at, endFrame: at + len, from: 1, to: 0, easing: "out", unit: "0-1" },
  ],
  /** Punch-in de ênfase (~7%) que volta suave. */
  punch: (at: number, hold = 10): TrackAnimation[] => [
    { type: "interpolate", target: "screen.zoom", startFrame: at, endFrame: at + 4, from: 0, to: 1, easing: "out", unit: "0-1" },
    { type: "interpolate", target: "screen.zoom", startFrame: at + 4 + hold, endFrame: at + 4 + hold + 14, from: 1, to: 0, easing: "inOut", unit: "0-1" },
  ],
  /** Chicote saindo da cena: use com o último frame local da cena (end). */
  whipOut: (end: number, dir: 1 | -1 = 1, len = 6): TrackAnimation[] => [
    { type: "interpolate", target: "screen.whip", startFrame: end - len, endFrame: end, from: 0, to: dir, easing: "in", unit: "0-1" },
  ],
  /** Chicote chegando na cena seguinte (frames 0..len). */
  whipIn: (dir: 1 | -1 = 1, len = 7): TrackAnimation[] => [
    zero("screen.whip"),
    { type: "interpolate", target: "screen.whip", startFrame: 0, endFrame: len, from: -dir, to: 0, easing: "out", unit: "0-1" },
  ],
  /** Dessatura (flashback/prévia) e volta. */
  desaturate: (from: number, to: number, amount = 0.35): TrackAnimation[] => [
    { type: "interpolate", target: "screen.sat", startFrame: from, endFrame: from + 6, from: 1, to: amount, easing: "out", unit: "0-1" },
    { type: "interpolate", target: "screen.sat", startFrame: to - 6, endFrame: to, from: amount, to: 1, easing: "in", unit: "0-1" },
  ],
  /** Explosão de confete/brilho (Burst) no alvo `id`: a trilha vai 0→1 durante `len` frames. */
  burst: (id: string, at: number, len = 45): TrackAnimation[] => [
    { type: "interpolate", target: `burst.${id}`, startFrame: at, endFrame: at + len, from: 0, to: 1, easing: "linear", unit: "0-1" },
  ],
};
