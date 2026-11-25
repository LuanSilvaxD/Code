import { LS_LEN, likeSubscribeSfx } from "./components/LikeSubscribe";
import type { TrackAnimation } from "./utils/animation";

// Abertura do Short. "hook" (padrão do canal desde 19/11/2026: Sol, Pterodáctilo, Titanic): o gancho aparece escrito
// no FRAME 1, sem a animação da fenda, e um selo pequeno da marca fica no canto o vídeo todo; a 1ª fala entra em 0,2 s.
// "fenda": abertura antiga (a fenda se abre sobre a maquete, ~0,7 s; 1ª fala em 0,45 s).
export const OPENING: "hook" | "fenda" = "hook";

/** Texto do gancho (2–3 linhas curtas; a 2ª é a maior) e etiqueta opcional do quadro ("BOATO OU VERDADE? #6"). */
export const HOOK: { lines: [string, string][]; tag?: string; top?: number } = {
  lines: [
    ["UM OI", "#ffffff"],
    ["1 DIA", "#ffd27a"],
    ["PRA CHEGAR", "#ffffff"],
  ],
};

const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: TrackAnimation["easing"] = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });

/**
 * Trilhas da abertura para a 1ª cena: gancho (e etiqueta) visíveis desde o frame 0, saindo em `outAt`
 * (frame local; normalmente quando a fala termina a pergunta, ex.: W("s1", 10)).
 */
export const hookTracks = (outAt: number): TrackAnimation[] => [
  lin("hook", 0, 1, 1, 1, "linear"),
  lin("hook", outAt, outAt + 8, undefined, 0, "in"),
  ...(HOOK.tag ? [lin("tag", 0, 1, 1, 1, "linear"), lin("tag", outAt, outAt + 8, undefined, 0, "in")] : []),
];

/**
 * "Curte e se inscreve" (regra do usuário): no meio do vídeo (~40–55%), numa cena sem texto importante na lateral.
 * Use nas animations da cena (frame local) e some os sons nos audioCues: likeSubscribeCues(at).
 */
export const likeSubscribeTracks = (at: number): TrackAnimation[] => [lin("ls", at, at + LS_LEN, 0, LS_LEN, "linear", "count")];
export { likeSubscribeSfx, LS_LEN };
