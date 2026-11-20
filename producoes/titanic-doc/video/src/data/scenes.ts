// scenes.ts — Filme × Realidade #2: o Jack cabia na porta? (abertura nova, ~54 s). Roteiro e designs v2 APROVADOS (19/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, MUS, PAN, SEA, SL, TK } from "./tit";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-espaco", language: "pt-BR" };

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
export const cut = (at: number, hold: Pose, next: Pose): CameraKey[] => [key(at - 1, hold), key(at, next)];
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");
const WORLDS = ["sea", "mus", "sl", "tk"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
export const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const P = {
  open: orbit(add(SEA, [PAN[0] + 0.1, 0.95, PAN[2]]), 11, 10, 7),
  open2: orbit(add(SEA, [PAN[0] + 0.15, 0.9, PAN[2]]), 10, 18, 8),
  mus: orbit(add(MUS, [0.2, 1.1, 0]), 15, 0, 6),
  mus2: orbit(add(MUS, [0.6, 1.15, 0]), 11, -10, 8),
  cold: orbit(add(SEA, [PAN[0] - 0.4, 0.55, PAN[2]]), 12, -12, 8),
  cold2: orbit(add(SEA, [PAN[0] - 0.8, 0.8, PAN[2] - 1]), 15, -4, 7),
  sl: orbit(add(SL, [0, -0.2, 0]), 20, 8, 6),
  sl2: orbit(add(SL, [0, -0.15, 0]), 18, 14, 6),
  sl3: orbit(add(SL, [0, -0.15, 0]), 18, -8, 7),
  sl4: orbit(add(SL, [0, -0.1, 0]), 17, -2, 7),
  tk: orbit(add(TK, [0.2, 0.3, 0.6]), 20, 15, 28),
  tk2: orbit(add(TK, [0.3, 0.2, 0.3]), 16, 24, 30),
  fin: orbit(add(SEA, [PAN[0] - 0.6, 0.9, PAN[2] - 0.6]), 13, 8, 7),
  fin2: orbit(add(SEA, [PAN[0] - 1.0, 1.1, PAN[2] - 1.0]), 16, -6, 8),
};

const ZERO = ["hook", "tag", "pan.rot", "thermo", "cd.v", "clock", "clock.v", "temp.v", "jk", "m2", "verdict", "lines", "ls", "fade", "both", "m.cheer", "m.wave", "mascot.show"];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Filme ou realidade? Em Titanic, o Jack cabia na porta junto com a Rose?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.open), key(end(0), P.open2, "inOut")] },
    objects: [{ id: "sea", type: "mar à noite + painel + navio afundando", visible: true }, { id: "hook", type: "HookText + SeriesTag + CornerBug", visible: true }],
    animations: [
      ...world(0, "sea"), ...ZERO.map((t) => set(t, 0, 0)), set("bg.dark", 0, 1), set("m.on", 0, 1), set("boat.x", 0, -40), set("sl.y", 0, 0.02),
      set("hook", 0, 1), set("tag", 0, 1), popOut("tag", W("s1", 10), 8), popOut("hook", W("s1", 10), 8),
      set("ship.sink", 0, 0.5), lin("ship.sink", 0, end(0), 0.5, 0.62, "linear"), set("ship.lights", 0, 1), lin("ship.lights", W("s1", 6), W("s1", 6) + 3, 1, 0, "linear"),
      lin("m.wave", W("s1", 12), W("s1", 12) + 6, 0, 1, "out"), lin("m.wave", W("s1", 12) + 30, W("s1", 12) + 36, 1, 0, "in"),
    ],
    badges: [],
    highlights: ["FILME", "REALIDADE", "TITANIC", "JACK", "PORTA", "ROSE"],
    captions: [cap("s1", 0, "Filme ou realidade? Em Titanic, o Jack cabia na porta junto com a Rose?")],
    audioCues: [narration("s1"), sfx("ocean-amb", 0, 0.3), sfx("wind-cold", 0, 0.2), sfx("power-down", W("s1", 6), 0.2)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Primeiro: não era porta. Era um painel entalhado, copiado de um pedaço real do navio que está num museu.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.mus), key(W("s2", 8), P.mus, "linear"), key(end(1), P.mus2, "inOut")] },
    objects: [{ id: "mus", type: "painel em pé + vitrine do museu", visible: true }],
    animations: [
      ...world(0, "mus"), ...fx.whipIn(), set("bg.dark", 0, 0), set("m.on", 0, 0),
      lin("pan.rot", 0, W("s2", 8), -0.25, 0.25, "inOut"), ...fx.punch(W("s2", 2)),
    ],
    badges: [
      { text: "NÃO ERA PORTA", variant: "negative", appearAt: W("s2", 2), disappearAt: W("s2", 8) },
      { text: "PEDAÇO REAL NUM MUSEU", variant: "info", subtitle: "HALIFAX, CANADÁ", appearAt: W("s2", 11) },
    ],
    highlights: ["NÃO", "PORTA", "PAINEL", "ENTALHADO", "COPIADO", "REAL", "NAVIO", "MUSEU"],
    captions: [cap("s2", 1, "Primeiro: não era porta. Era um painel entalhado, copiado de um pedaço real do navio que está num museu.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.3), sfx("buzz", W("s2", 2), 0.25), sfx("shimmer", W("s2", 8), 0.25), sfx("ding", W("s2", 11), 0.25)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "A água estava a dois graus negativos: em uns quinze minutos a pessoa apaga, e o resgate levou quase duas horas.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.cold), key(end(2), P.cold2, "inOut")] },
    objects: [{ id: "sea", type: "termômetro −2 °C + relógio + bote ao longe", visible: true }],
    animations: [
      ...world(0, "sea"), ...fx.whipIn(-1), set("bg.dark", 0, 1), set("m.on", 0, 1), set("ship.sink", 0, 1), set("ship.lights", 0, 0),
      pop("thermo", W("s3", 1)), set("thermo.v", 0, 0.6), lin("thermo.v", W("s3", 1), W("s3", 6), 0.6, 0.08, "inOut"),
      pop("temp.v", W("s3", 4)), set("temp", 0, 10), lin("temp", W("s3", 4), W("s3", 6) + 6, 10, -2, "out", "count"),
      popOut("temp.v", W("s3", 7), 6), pop("clock.v", W("s3", 7)), set("clock", 0, 0),
      lin("clock", W("s3", 8), W("s3", 10) + 4, 0, 15, "inOut", "count"), ...fx.shake(W("s3", 13), 10), lin("clock", W("s3", 16), W("s3", 20) + 6, 15, 115, "in", "count"),
      set("boat.x", 0, -40), set("boat.x", W("s3", 18) - 1, -9), lin("boat.x", W("s3", 18), end(2), -9, -6, "linear"),
    ],
    badges: [
      { text: "ÁGUA A −2 °C", variant: "info", appearAt: W("s3", 4), disappearAt: W("s3", 13) },
      { text: "~15 MIN × ~2 HORAS", variant: "negative", subtitle: "APAGA × RESGATE", appearAt: W("s3", 16) },
    ],
    highlights: ["ÁGUA", "DOIS", "GRAUS", "NEGATIVOS", "QUINZE", "MINUTOS", "APAGA", "RESGATE", "DUAS", "HORAS"],
    captions: [cap("s3", 2, "A água estava a dois graus negativos: em uns quinze minutos a pessoa apaga, e o resgate levou quase duas horas.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.3), sfx("wind-cold", 2, 0.25), sfx("tick", W("s3", 8), 0.3), sfx("alert-tone", W("s3", 13), 0.25), sfx("hourglass", W("s3", 16), 0.25)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Espaço tinha. O problema é boiar: com os dois em cima, a madeira afunda e o corpo fica na água gelada.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.sl), key(end(3), P.sl2, "inOut")] },
    objects: [{ id: "sl", type: "corte da água: 1 boia, 2 afundam", visible: true }],
    animations: [
      ...world(0, "sl"), ...fx.whipIn(), set("bg.dark", 0, 0), set("m.on", 0, 0), set("thermo", 0, 0), set("clock.v", 0, 0), set("boat.x", 0, -40),
      set("sl.y", 0, 0.02), pop("m2", W("s4", 7)), lin("sl.y", W("s4", 8), W("s4", 10), 0.02, -0.04, "out"), lin("sl.y", W("s4", 12), W("s4", 13) + 10, -0.04, -0.16, "inOut"),
      ...fx.shake(W("s4", 13), 10),
    ],
    badges: [
      { text: "ESPAÇO: ✔", variant: "positive", appearAt: W("s4", 0), disappearAt: W("s4", 5) },
      { text: "BOIAR: ✖", variant: "negative", appearAt: W("s4", 5) },
    ],
    highlights: ["ESPAÇO", "PROBLEMA", "BOIAR", "DOIS", "AFUNDA", "CORPO", "ÁGUA", "GELADA"],
    captions: [cap("s4", 3, "Espaço tinha. O problema é boiar: com os dois em cima, a madeira afunda e o corpo fica na água gelada.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("pop", W("s4", 7), 0.3), sfx("bubbles", W("s4", 12), 0.35), sfx("drip", W("s4", 15), 0.25)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Em 2012, os Caçadores de Mitos testaram: com um colete salva-vidas amarrado embaixo, a madeira aguenta os dois.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.sl3), key(end(4), P.sl4, "inOut")] },
    objects: [{ id: "sl", type: "colete entra por baixo e o painel sobe", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...world(0, "sl"), ...fx.whipIn(-1), set("m2", 0, 1), set("sl.y", 0, -0.16),
      lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      lin("jk", W("s5", 9), W("s5", 12), 0, 1, "out"), { type: "spring", target: "sl.y", startFrame: W("s5", 13), endFrame: W("s5", 13) + 30, from: -0.16, to: 0.04, damping: 10, unit: "0-1" },
      ...fx.flash(W("s5", 15), 6),
    ],
    badges: [
      { text: "2012: TESTE NA TV", variant: "info", appearAt: W("s5", 1), disappearAt: W("s5", 12) },
      { text: "COLETE EMBAIXO = BOIA ✔", variant: "positive", appearAt: W("s5", 14) },
    ],
    highlights: ["2012", "CAÇADORES", "MITOS", "COLETE", "SALVA-VIDAS", "EMBAIXO", "AGUENTA", "DOIS"],
    captions: [cap("s5", 4, "Em 2012, os Caçadores de Mitos testaram: com um colete salva-vidas amarrado embaixo, a madeira aguenta os dois.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.25), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("whoosh-soft", W("s5", 9), 0.3), sfx("bubbles", W("s5", 13), 0.3), sfx("ding", W("s5", 15), 0.3)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "E o próprio diretor testou com dublês, e admitiu: o Jack talvez tivesse sobrevivido.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.tk), key(end(5), P.tk2, "inOut")] },
    objects: [{ id: "tk", type: "tanque de teste com dublês", visible: true }, { id: "verdict", type: "VerdictMeter (FUNCIONA, COM ASTERISCO)", visible: true }],
    animations: [
      ...world(0, "tk"), ...fx.whipIn(), set("jk", 0, 0),
      pop("verdict", W("s6", 7)), set("needle", 0, 0), lin("needle", W("s6", 11), W("s6", 13) + 8, 0, 45, "out", "deg"), ...fx.punch(W("s6", 13)),
    ],
    badges: [{ text: "O DIRETOR TESTOU (2022)", variant: "info", subtitle: "COM DUBLÊS E SENSORES", appearAt: W("s6", 3) }],
    highlights: ["DIRETOR", "TESTOU", "DUBLÊS", "ADMITIU", "JACK", "TALVEZ", "SOBREVIVIDO"],
    captions: [cap("s6", 5, "E o próprio diretor testou com dublês, e admitiu: o Jack talvez tivesse sobrevivido.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.3), sfx("hum", W("s6", 4), 0.2), sfx("tick", W("s6", 11), 0.25), sfx("shimmer", W("s6", 13), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Pronto: agora você sabe. Cabia, com asterisco: só com o colete embaixo. Mas aí o filme acabava diferente.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(6), P.fin2, "inOut")] },
    objects: [{ id: "sea", type: "os dois boiando com o colete + bote chegando", visible: true }, { id: "lines", type: "CABIA, COM ASTERISCO*", visible: true }],
    animations: [
      ...world(0, "sea"), ...fx.whipIn(-1), set("bg.dark", 0, 1), set("verdict", 0, 0), set("m.on", 0, 1), set("both", 0, 1), set("ship.sink", 0, 1), set("ship.lights", 0, 0),
      set("boat.x", 0, -8), lin("boat.x", 0, end(6), -8, -2.5, "linear"),
      pop("lines", W("s7", 4)), lin("m.cheer", W("s7", 4), W("s7", 4) + 8, 0, 1, "out"), lin("m.cheer", W("s7", 4) + 40, W("s7", 4) + 48, 1, 0, "in"),
      popOut("lines", end(6) - 30, 10),
    ],
    badges: [],
    highlights: ["PRONTO", "SABE", "CABIA", "ASTERISCO", "COLETE", "EMBAIXO", "FILME", "DIFERENTE"],
    captions: [cap("s7", 6, "Pronto: agora você sabe. Cabia, com asterisco: só com o colete embaixo. Mas aí o filme acabava diferente.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.25), sfx("ocean-amb", 0, 0.25), sfx("final", W("s7", 0), 0.35), sfx("ding", W("s7", 4), 0.3), sfx("shimmer", W("s7", 12), 0.25)],
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
