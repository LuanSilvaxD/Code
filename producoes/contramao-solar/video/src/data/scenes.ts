// scenes.ts — "A espiral de Fibonacci". Roteiro v1 e designs APROVADOS (13/11/2026); cortes da voz real.
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN. Linha do tempo determinística.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, COMPARE, FLOWER, NAUTILUS, PLANTS, RABBITS, SQUARES } from "./fibo";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-natureza", language: "pt-BR" };

export type BadgeVariant = "positive" | "negative" | "info" | "warning";
export type CameraKey = { at: number; position: Vec3; target: Vec3; zoom?: number; easing?: EaseName };
export type CameraPlan = { projection: "perspective" | "orthographic"; movement: "dolly-in" | "dolly-out" | "vertical" | "orbit" | "tracking" | "split" | "hold"; keys: CameraKey[] };
export type SceneObject = { id: string; type: string; visible: boolean; state?: { start: string; end: string } };
export type SceneBadge = { text: string; variant: BadgeVariant; appearAt: number; disappearAt?: number; subtitle?: string; slot?: "center" | "left" | "right"; icon?: "?"; size?: "normal" | "large" };
export type CaptionBlock = { text: string; from: number; to: number };
export type AudioCue = { kind: "narration" | "sfx"; src: string; at: number; volume: number; status: "planned" | "ready" };
export type ScenePlan = {
  id: string; startFrame: number; durationInFrames: number; voKey: VoKey; narration: string;
  camera: CameraPlan; objects: SceneObject[]; animations: TrackAnimation[]; badges: SceneBadge[];
  highlights: string[]; captions: CaptionBlock[]; audioCues: AudioCue[];
};

const sc = (i: number) => ({ startFrame: SCENE_FRAMES[i].from, durationInFrames: SCENE_FRAMES[i].durationInFrames });
const end = (i: number) => SCENE_FRAMES[i].durationInFrames;
const W = wordLocal;
type Pose = { position: Vec3; target: Vec3 };
const key = (at: number, pose: Pose, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");
const WORLDS = ["flower", "rabbits", "squares", "compare", "plants", "nautilus"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
/** Degraus: o alvo vale i+1 a partir do frame frames[i]. */
const steps = (target: string, frames: number[]): TrackAnimation[] => frames.map((at, i) => lin(target, at, at + 4, i, i + 1, "out", "count"));
/** Chicote de entrada sem deixar listras: use no meio da cena (fx.whipIn é só para o frame 0). */
const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const FL = add(FLOWER, [0, -1.1, 0]);
const P = {
  fl: orbit(FL, 30, -8, 6),
  fl2: orbit(FL, 27, 4, 8),
  flWide: orbit(add(FLOWER, [0, -1.6, 0]), 38, 10, 8),
  flWide2: orbit(add(FLOWER, [0, -1.6, 0]), 36, 22, 10),
  core: orbit(add(FLOWER, [0, 0.1, 0]), 7.5, 0, 6),
  coreOut: orbit(add(FLOWER, [0, -0.9, 0]), 26, -6, 6),
  fl3: orbit(FL, 28, -14, 6),
  end1: orbit(add(FLOWER, [0, -1.4, 0]), 31, -28, 10),
  end2: orbit(add(FLOWER, [0, -1.4, 0]), 30, 24, 8),
  rab: orbit(add(RABBITS, [0, -0.4, 0.5]), 21, -12, 28),
  rab2: orbit(add(RABBITS, [0, -0.4, 0.5]), 19.5, 12, 32),
  sqTop: orbit(add(SQUARES, [0, -4.1, 0]), 52, 0, 0),
  sqTop2: orbit(add(SQUARES, [0, -4.1, 0]), 51, 3, 0),
  sq: orbit(add(SQUARES, [0, -0.8, 0]), 29, -4, 2),
  sq2: orbit(add(SQUARES, [0, -0.9, 0]), 33, 6, 4),
  cmp: orbit(add(COMPARE, [0, -0.6, 0]), 30, 0, 0),
  cmp2: orbit(add(COMPARE, [0, -0.6, 0]), 29, 5, 2),
  plants: orbit(add(PLANTS, [0, -0.2, 0]), 21, -10, 10),
  plants2: orbit(add(PLANTS, [0, -0.2, 0]), 20, 10, 12),
  naut: orbit(add(NAUTILUS, [0.5, -0.9, 0]), 24, -6, 0),
  naut2: orbit(add(NAUTILUS, [0.5, -0.9, 0]), 23, 6, 3),
};
const M_FLOWER: Vec3 = add(FLOWER, [2.3, -3.6, 2.6]);
const M_PLANTS: Vec3 = add(PLANTS, [2.4, -1.9, 1.6]);
const M_NAUT: Vec3 = add(NAUTILUS, [2.6, -2.8, 1.4]);

const ZERO = [
  "flower.famA", "flower.famB", "dim", "countA", "countB", "seq.step", "seq.sum", "seq.more", "rabbits.n", "casais.k", "ratio.step", "ratio.lock", "squares.n", "spiral.draw", "seal.k",
  "proto.k", "cmp.k", "cmp.bad", "plant.hiA", "plant.hiB", "golden", "cross", "nlabels", "sum1", "sum2", "sum3", "mascot.float",
];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Conte as espirais de um girassol: trinta e quatro num sentido, cinquenta e cinco no outro. Não é coincidência.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.fl), key(end(0), P.fl2, "linear")] },
    objects: [{ id: "sunflower", type: "Sunflower(900 sementes, 137,5°)", visible: true }, { id: "counters", type: "Counter2D(34, 55)", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "flower"), ...ZERO.map((t) => set(t, 0, 0)), set("flower.grow", 0, 1),
      ...mascot.place(M_FLOWER, -0.5, 0.6, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 1), 34),
      lin("flower.famA", W("s1", 6), W("s1", 8) + 6, 0, 1), lin("countA", W("s1", 6), W("s1", 9) + 4, 0, 34, "out", "count"), ...mascot.point(W("s1", 6), 44, -0.9),
      lin("flower.famB", W("s1", 11), W("s1", 13) + 6, 0, 1), lin("countB", W("s1", 11), W("s1", 14) + 4, 0, 55, "out", "count"),
      ...fx.punch(W("s1", 18)),
    ],
    badges: [
      { text: "34 E 55", variant: "info", appearAt: W("s1", 11), disappearAt: W("s1", 16) },
      { text: "NÃO É COINCIDÊNCIA", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 16) },
    ],
    highlights: ["ESPIRAIS", "GIRASSOL", "TRINTA", "QUATRO", "CINQUENTA", "CINCO", "COINCIDÊNCIA"],
    captions: [cap("s1", 0, "Conte as espirais de um girassol: trinta e quatro num sentido, cinquenta e cinco no outro. Não é coincidência.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("shimmer", W("s1", 6), 0.35), sfx("shimmer", W("s1", 11), 0.35), sfx("thud", W("s1", 18), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "São números de Fibonacci: cada um é a soma dos dois anteriores. Um, um, dois, três, cinco, oito, treze.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.fl2), key(end(1), P.flWide, "linear")] },
    objects: [{ id: "sunflower", type: "Sunflower(ao fundo)", visible: true }, { id: "sequence", type: "Sequence2D", visible: true }],
    animations: [
      lin("dim", 0, 10, 0, 1), popOut("countA", 0, 8), popOut("countB", 0, 8), ...mascot.hide(0, 8), pop("seq.sum", W("s2", 8)), popOut("seq.sum", W("s2", 12) - 4, 6),
      ...steps("seq.step", [12, 13, 14, 15, 16, 17, 18].map((i) => W("s2", i))), pop("seq.more", W("s2", 18) + 14),
    ],
    badges: [
      { text: "SEQUÊNCIA DE FIBONACCI", variant: "info", appearAt: W("s2", 3), disappearAt: W("s2", 8) },
      { text: "SOMA DOS DOIS ANTERIORES", variant: "info", appearAt: W("s2", 8) },
    ],
    highlights: ["FIBONACCI", "SOMA", "ANTERIORES", "UM", "DOIS", "TRÊS", "CINCO", "OITO", "TREZE"],
    captions: [cap("s2", 1, "São números de Fibonacci: cada um é a soma dos dois anteriores. Um, um, dois, três, cinco, oito, treze.")],
    audioCues: [narration("s2"), sfx("whoosh-soft", 0, 0.3), sfx("ding", W("s2", 8), 0.3), ...[12, 13, 14, 15, 16, 17, 18].map((i, k) => sfx(k % 2 ? "pop-high" : "pop", W("s2", i), 0.3)), sfx("shimmer", W("s2", 18) + 14, 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "A sequência ficou famosa em 1202, num problema sobre coelhos. Na Índia, já era conhecida séculos antes.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.rab), key(end(2), P.rab2, "linear")] },
    objects: [{ id: "meadow", type: "Gramado", visible: true }, { id: "rabbits", type: "Rabbit×casais(1,1,2,3,5)", visible: true }, { id: "pairs", type: "Counter2D(casais)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "rabbits"), set("dim", 0, 0), set("seq.step", 0, 0), set("seq.more", 0, 0), set("rabbits.n", 0, 1), pop("casais.k", W("s3", 5)),
      ...[W("s3", 7), W("s3", 8), W("s3", 9), W("s3", 9) + 12].map((a, k) => lin("rabbits.n", a, a + 4, k + 1, k + 2, "out", "count")),
      popOut("casais.k", W("s3", 11) - 2, 8),
    ],
    badges: [
      { text: "1202 · O PROBLEMA DOS COELHOS", variant: "info", appearAt: W("s3", 5), disappearAt: W("s3", 11) },
      { text: "ÍNDIA: SÉCULOS ANTES", variant: "info", appearAt: W("s3", 11) },
    ],
    highlights: ["SEQUÊNCIA", "1202", "COELHOS", "ÍNDIA", "SÉCULOS"],
    captions: [cap("s3", 2, "A sequência ficou famosa em 1202, num problema sobre coelhos. Na Índia, já era conhecida séculos antes.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.35), ...[7, 8, 9].map((i) => sfx("bunny-hop", W("s3", i), 0.4)), sfx("bunny-hop", W("s3", 9) + 12, 0.4), sfx("bells", W("s3", 11), 0.18)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Divida um pelo anterior e o resultado se aproxima de 1,618: a proporção áurea.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.sqTop), key(end(3), P.sqTop2, "linear")] },
    objects: [{ id: "squares", type: "FibSquares(crescendo)", visible: true }, { id: "ratios", type: "Ratios2D", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "squares"), set("rabbits.n", 0, 0), set("squares.n", 0, 2), set("spiral.draw", 0, 0),
      ...steps("ratio.step", [0, 1, 3, 5, 7, 8].map((i) => W("s4", i))), ...[0, 1, 3, 5, 7].map((i, k) => lin("squares.n", W("s4", i), W("s4", i) + 8, 2 + k, 3 + k, "out", "count")),
      pop("ratio.lock", W("s4", 10)), ...fx.flash(W("s4", 12), 6),
    ],
    badges: [
      { text: "→ 1,618…", variant: "warning", appearAt: W("s4", 10), disappearAt: W("s4", 12) },
      { text: "PROPORÇÃO ÁUREA", variant: "info", size: "large", appearAt: W("s4", 12) },
    ],
    highlights: ["DIVIDA", "ANTERIOR", "1,618", "PROPORÇÃO", "ÁUREA"],
    captions: [cap("s4", 3, "Divida um pelo anterior e o resultado se aproxima de 1,618: a proporção áurea.")],
    audioCues: [narration("s4"), sfx("whoosh-soft", 0, 0.3), ...[0, 1, 3, 5, 7, 8].map((i) => sfx("tick", W("s4", i), 0.3)), sfx("ding", W("s4", 10), 0.4), sfx("glow", W("s4", 12), 0.35)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Com quadrados desses tamanhos, dá pra desenhar a famosa espiral.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.sqTop2), key(W("s5", 1) + 10, P.sq, "inOut"), key(end(4), P.sq2, "inOut")] },
    objects: [{ id: "squares", type: "FibSquares(7)", visible: true }, { id: "spiral", type: "Espiral dourada", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [popOut("ratio.lock", 0, 8), popOut("ratio.step", 0, 8), set("squares.n", 0, 7), lin("seal.k", 0, 8, 0, 1), lin("spiral.draw", W("s5", 6), W("s5", 9) + 16, 0, 1, "inOut")],
    badges: [{ text: "A ESPIRAL DE FIBONACCI", variant: "info", appearAt: W("s5", 8) }],
    highlights: ["QUADRADOS", "TAMANHOS", "DESENHAR", "ESPIRAL"],
    captions: [cap("s5", 4, "Com quadrados desses tamanhos, dá pra desenhar a famosa espiral.")],
    audioCues: [narration("s5"), sfx("shimmer", W("s5", 6), 0.35)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Mas por que o girassol segue isso? Cada semente nova nasce girada cento e trinta e sete graus e meio: o ângulo áureo.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.fl3), key(W("s6", 7) - 1, P.fl3), key(W("s6", 7), P.core), key(W("s6", 12), P.core), key(end(5), P.coreOut, "inOut")] },
    objects: [{ id: "sunflower", type: "Sunflower(miolo nascendo)", visible: true }, { id: "protractor", type: "Protractor2D(137,5°)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "flower"), set("seal.k", 0, 0), set("squares.n", 0, 0), set("flower.famA", 0, 0), set("flower.famB", 0, 0), set("flower.grow", 0, 1),
      lin("flower.grow", W("s6", 7) - 4, W("s6", 7), undefined, 0.004, "in"), lin("flower.grow", W("s6", 8), end(5) - 4, 0.004, 1, "in"),
      pop("proto.k", W("s6", 11)), popOut("proto.k", W("s6", 22) + 12, 8), ...fx.punch(W("s6", 21)),
    ],
    badges: [
      { text: "POR QUÊ?", variant: "warning", icon: "?", appearAt: W("s6", 0), disappearAt: W("s6", 7) },
      { text: "137,5°: O ÂNGULO ÁUREO", variant: "info", size: "large", appearAt: W("s6", 20) },
    ],
    highlights: ["GIRASSOL", "SEMENTE", "NOVA", "CENTO", "TRINTA", "SETE", "GRAUS", "ÂNGULO", "ÁUREO"],
    captions: [cap("s6", 5, "Mas por que o girassol segue isso? Cada semente nova nasce girada cento e trinta e sete graus e meio: o ângulo áureo.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.35), sfx("seed-pop", W("s6", 8), 0.45), sfx("glow", W("s6", 20), 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Esse ângulo espalha as sementes sem formar raios nem deixar vazios. Com outro ângulo, sobra espaço.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.cmp), key(end(6), P.cmp2, "linear")] },
    objects: [{ id: "heads", type: "SeedHead×3 (137,5° / 120° / 90°)", visible: true }, { id: "labels", type: "Labels(ângulos)", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "compare"), lin("cmp.k", 0, 10, 0, 1), pop("cmp.bad", W("s7", 13))],
    badges: [
      { text: "137,5°: SEM VAZIOS", variant: "positive", appearAt: W("s7", 2), disappearAt: W("s7", 11) },
      { text: "OUTRO ÂNGULO: ESPAÇO PERDIDO", variant: "negative", appearAt: W("s7", 11) },
    ],
    highlights: ["ÂNGULO", "ESPALHA", "RAIOS", "VAZIOS", "OUTRO", "SOBRA", "ESPAÇO"],
    captions: [cap("s7", 6, "Esse ângulo espalha as sementes sem formar raios nem deixar vazios. Com outro ângulo, sobra espaço.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.35), sfx("buzz", W("s7", 14), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "O resultado são espirais em números de Fibonacci. Nas pinhas e no abacaxi, também.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.flWide), key(W("s8", 8) - 1, P.flWide2, "linear"), key(W("s8", 8), P.plants), key(end(7), P.plants2, "linear")] },
    objects: [{ id: "sunflower", type: "Sunflower(espirais acesas)", visible: true }, { id: "pine", type: "PineCone", visible: true }, { id: "ananas", type: "Pineapple", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "flower"), set("cmp.k", 0, 0), set("cmp.bad", 0, 0), set("flower.grow", 0, 1), lin("flower.famA", 2, 14, 0, 1), lin("flower.famB", 8, 20, 0, 1),
      ...mascot.place(add(FLOWER, [3.6, -4.2, 2.4]), -0.5, 0.7, 0, 8), ...mascot.cheer(W("s8", 3), 40),
      whipMid(W("s8", 8)), ...world(W("s8", 8), "plants"), ...mascot.place(M_PLANTS, -0.5, 0.5, W("s8", 8)), lin("plant.hiA", W("s8", 9), W("s8", 9) + 10, 0, 1), lin("plant.hiB", W("s8", 12), W("s8", 12) + 10, 0, 1), ...mascot.point(W("s8", 9), 40, -0.9),
    ],
    badges: [
      { text: "ESPIRAIS DE FIBONACCI", variant: "positive", appearAt: W("s8", 3), disappearAt: W("s8", 8) },
      { text: "PINHA · ABACAXI: 8 E 13", variant: "info", appearAt: W("s8", 9) },
    ],
    highlights: ["RESULTADO", "ESPIRAIS", "FIBONACCI", "PINHAS", "ABACAXI"],
    captions: [cap("s8", 7, "O resultado são espirais em números de Fibonacci. Nas pinhas e no abacaxi, também.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.35), sfx("shimmer", 4, 0.35), sfx("whoosh", W("s8", 8), 0.35), sfx("pop", W("s8", 9), 0.3), sfx("pop-high", W("s8", 12), 0.3)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Agora, o mito: a concha do náutilo não é uma espiral áurea. Medida, ela cresce num ritmo bem diferente.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.naut), key(end(8), P.naut2, "linear")] },
    objects: [{ id: "nautilus", type: "Nautilus(corte)", visible: true }, { id: "golden", type: "Espiral áurea sobreposta", visible: true }, { id: "cross", type: "X2D", visible: true }, { id: "labels", type: "Ratios(1,33 × 1,618)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "nautilus"), set("plant.hiA", 0, 0), set("plant.hiB", 0, 0), ...mascot.place(M_NAUT, -0.5, 0.5, 0), ...mascot.jump(W("s9", 7)),
      lin("golden", W("s9", 8), W("s9", 11) + 6, 0, 1, "inOut"), pop("cross", W("s9", 11)), ...fx.shake(W("s9", 11), 14), popOut("cross", W("s9", 12) + 2, 6), pop("nlabels", W("s9", 13)),
    ],
    badges: [
      { text: "O MITO DO NÁUTILO", variant: "warning", icon: "?", appearAt: W("s9", 1), disappearAt: W("s9", 8) },
      { text: "NÃO É ESPIRAL ÁUREA", variant: "negative", appearAt: W("s9", 8) },
    ],
    highlights: ["MITO", "CONCHA", "NÁUTILO", "ESPIRAL", "ÁUREA", "MEDIDA", "DIFERENTE"],
    captions: [cap("s9", 8, "Agora, o mito: a concha do náutilo não é uma espiral áurea. Medida, ela cresce num ritmo bem diferente.")],
    audioCues: [narration("s9"), sfx("whoosh", 0, 0.35), sfx("record-scratch", W("s9", 2), 0.3), sfx("buzz", W("s9", 11), 0.35), sfx("tick", W("s9", 13), 0.3)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "Pronto: agora você sabe. Não é mágica. É só um jeito eficiente de crescer.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.end1), key(end(9), P.end2, "inOut")] },
    objects: [{ id: "sunflower", type: "Sunflower(espirais acesas)", visible: true }, { id: "mascot", type: "Mascot", visible: true }, { id: "summary", type: "Summary2D(3 itens)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "flower"), set("golden", 0, 0), set("nlabels", 0, 0), set("flower.famA", 0, 1), set("flower.famB", 0, 1),
      ...mascot.place(add(FLOWER, [3.4, -4.3, 2.4]), -0.4, 0.7, 0), ...mascot.cheer(W("s10", 1), 40), ...mascot.wave(W("s10", 10), 36),
      pop("sum1", W("s10", 4)), pop("sum2", W("s10", 7)), pop("sum3", W("s10", 10)), ...["sum1", "sum2", "sum3"].map((t) => popOut(t, end(9) - s(5.3))),
    ],
    badges: [{ text: "NÃO É MÁGICA: É EFICIÊNCIA", variant: "positive", appearAt: W("s10", 7), disappearAt: end(9) - s(5.3) }],
    highlights: ["PRONTO", "MÁGICA", "EFICIENTE", "CRESCER"],
    captions: [cap("s10", 9, "Pronto: agora você sabe. Não é mágica. É só um jeito eficiente de crescer.")],
    audioCues: [narration("s10"), sfx("whoosh", 0, 0.35), sfx("final", W("s10", 6), 0.4)],
  },
];

export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);
export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const sceneIndexAt = (frame: number) => scenes.indexOf(sceneAt(frame));
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
