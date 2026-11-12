import type { TrackAnimation, Vec3 } from "./animation";

// Atalhos para dirigir o MASCOTE (components/Mascot.tsx → MascotFromTracks) pelas `animations` das cenas.
// Frames LOCAIS da cena, como tudo no scenes.ts. Ex.:
//   animations: [
//     ...mascot.place([-2.2, 0, 0.6], Math.PI / 2, 0.7, 0),   // aparece já na maquete, virado para +x
//     ...mascot.walk(0, s(2), [-2.2, 0, 0.6], [-1, 0, 0.6]),   // anda até perto do objeto
//     ...mascot.wave(W("s1", 0), s(1.2)),                      // acena no gancho
//     ...mascot.point(W("s3", 9), s(1.5), 1.2),                // aponta para o objeto quando o termo é dito
//     ...mascot.jump(W("s5", 4)),                              // pulinho de surpresa no problema
//   ]
// Para o espaço/água use mascot.float(...). O mascote não fala: ele reage aos momentos da narração.

const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: TrackAnimation["easing"] = "inOut"): TrackAnimation => ({
  type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit: "0-1",
});

export const mascot = {
  /** Mostra o mascote numa posição/rumo/escala (corte seco; use `len` > 0 para surgir com zoom). */
  place: (p: Vec3, rotY: number, scale: number, at: number, len = 0): TrackAnimation[] => [
    lin("mascot.x", at, at + 1, p[0], p[0]),
    lin("mascot.y", at, at + 1, p[1], p[1]),
    lin("mascot.z", at, at + 1, p[2], p[2]),
    lin("mascot.rotY", at, at + 1, rotY, rotY),
    lin("mascot.scale", at, at + 1, scale, scale),
    lin("mascot.show", at, at + Math.max(1, len), len > 0 ? 0 : 1, 1, "out"),
  ],
  /** Some (encolhe) — ex.: quando a cena precisa de todo o espaço. */
  hide: (at: number, len = 10): TrackAnimation[] => [lin("mascot.show", at, at + len, undefined, 0, "in")],
  /** Caminha de `from` até `to` entre os frames a..b (pernas e braços balançam; para no fim). */
  walk: (a: number, b: number, from: Vec3, to: Vec3): TrackAnimation[] => {
    const rot = Math.atan2(to[0] - from[0], to[2] - from[2]);
    return [
      lin("mascot.rotY", a, a + 6, undefined, rot),
      lin("mascot.walk", a, a + 6, 0, 1),
      lin("mascot.x", a, b, from[0], to[0], "linear"),
      lin("mascot.y", a, b, from[1], to[1], "linear"),
      lin("mascot.z", a, b, from[2], to[2], "linear"),
      lin("mascot.walk", b - 8, b, 1, 0),
    ];
  },
  /** Vira para um rumo (rad). 0 = de frente para a câmera padrão. */
  turn: (at: number, rotY: number, len = 10): TrackAnimation[] => [lin("mascot.rotY", at, at + len, undefined, rotY)],
  /** Acena por `len` frames. */
  wave: (at: number, len = 36): TrackAnimation[] => [lin("mascot.wave", at, at + 8, 0, 1, "out"), lin("mascot.wave", at + len - 8, at + len, 1, 0, "in")],
  /** Aponta para a frente do corpo por `len` frames; `rotY` opcional vira o corpo para o alvo antes. */
  point: (at: number, len = 45, rotY?: number): TrackAnimation[] => [
    ...(rotY !== undefined ? [lin("mascot.rotY", at - 8, at, undefined, rotY)] : []),
    lin("mascot.point", at, at + 8, 0, 1, "out"),
    lin("mascot.point", at + len - 8, at + len, 1, 0, "in"),
  ],
  /** Pulinho de surpresa (sobe e volta em ~14 frames). */
  jump: (at: number): TrackAnimation[] => [lin("mascot.jump", at, at + 7, 0, 0.6, "out"), lin("mascot.jump", at + 7, at + 14, 0.6, 0, "in")],
  /** Comemora (braços para cima) — revelação, final. */
  cheer: (at: number, len = 40): TrackAnimation[] => [lin("mascot.cheer", at, at + 8, 0, 1, "out"), lin("mascot.cheer", at + len - 8, at + len, 1, 0, "in")],
  /** Liga/desliga o modo flutuar (espaço, água, gravidade zero). */
  float: (at: number, on = true, len = 12): TrackAnimation[] => [lin("mascot.float", at, at + len, undefined, on ? 1 : 0)],
  /** Vira a cabeça (rad) para olhar algo/a câmera. */
  look: (at: number, angle: number, len = 10): TrackAnimation[] => [lin("mascot.look", at, at + len, undefined, angle)],
};
