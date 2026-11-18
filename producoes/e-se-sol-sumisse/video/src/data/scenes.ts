// scenes.ts — VÍDEO-TESTE "E se o Sol sumisse agora?" (abertura nova, ~45 s). Roteiro e designs APROVADOS (18/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, DEPART_DEG, earthPos, OC, SP, TR, VE } from "./sun";

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
const WORLDS = ["sp", "tr", "oc", "ve"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
export const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const E = (lx: number) => add(SP, earthPos(DEPART_DEG, lx));
const ear = (lx: number, d: number, az: number, el: number) => orbit(add(E(lx), [0, -0.2, 0]), d, az, el);
const P = {
  open: orbit(add(SP, [1.75, 1.27, 0]), 28.5, 0, 0),
  open2: orbit(add(SP, [1.85, 1.2, 0]), 27, 5, 3),
  light: orbit(add(SP, [2.3, 0.45, 0]), 14.5, -10, 4),
  light2: orbit(add(SP, [2.55, 0.35, 0]), 13.5, -4, 6),
  wide: orbit(add(SP, [2.0, 2.4, 0]), 36, 6, 4),
  wide2: orbit(add(SP, [2.9, 2.6, 0]), 34, 12, 6),
  tree: orbit(add(TR, [0, 0.75, 0]), 9.5, 18, 12),
  tree2: orbit(add(TR, [0, 0.7, 0]), 8.5, 38, 16),
  wk: ear(3.6, 11, -14, 8),
  wk2: ear(3.9, 10.5, 2, 10),
  yr: ear(4.1, 10.5, 14, 6),
  yr2: ear(4.4, 10, 26, 10),
  oc: orbit(add(OC, [0, -1.7, 0]), 23, 20, 14),
  oc2: orbit(add(OC, [0.2, -1.8, 0]), 21, 26, 12),
  dive: orbit(add(OC, [0.3, -2.3, 0.6]), 17, 22, 8),
  dive2: orbit(add(OC, [0.8, -3.0, 1.2]), 14, 18, 4),
  vent: orbit(add(VE, [0.25, 0.75, 0]), 9.5, 18, 10),
  vent2: orbit(add(VE, [0.25, 0.7, 0]), 8.5, 34, 12),
  fin: ear(4.6, 11, -20, 6),
  fin2: orbit(add(E(5.4), [0, 0.6, 0]), 30, 10, 8),
};
const M_EARTH: [number, number, number] = [3.15, 0.55, 0.8];

const ZERO = ["hook", "cd.v", "dc.v", "temp.v", "ghost", "path", "earth.lx", "frost", "earth.dark", "light.tail", "fade", "music.mute", "bg.dark", "ice.show", "wilt", "tfrost", "ls", "sun.pulse"];
/** Ticks do contador acelerando (frames locais). */
const TICKS = [0, 16, 30, 42, 52, 60, 66, 71, 75, 78];
const BLACK = 80; // frame local de s2 em que a última luz chega e tudo apaga

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "E se o Sol sumisse agora? Durante oito minutos, você nem ia perceber.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.open), key(end(0), P.open2, "inOut")] },
    objects: [{ id: "sp", type: "Sol + Terra + trem de luz", visible: true }, { id: "hook", type: "HookText + Countdown + CornerBug", visible: true }],
    animations: [
      ...world(0, "sp"), ...ZERO.map((t) => set(t, 0, 0)), set("sun.k", 0, 1), set("orbit", 0, 1), set("light.head", 0, 1), set("light.on", 0, 1),
      set("hook", 0, 1), popOut("hook", W("s1", 6) - 4, 8),
      lin("earth.th", 0, end(0), -70, -66, "linear"),
      // o Sol some em "agora": incha e implode
      lin("sun.k", W("s1", 5), W("s1", 5) + 3, 1, 1.12, "out"), lin("sun.k", W("s1", 5) + 3, W("s1", 5) + 11, 1.12, 0, "in"),
      ...fx.flash(W("s1", 5) + 9, 10), lin("ghost", W("s1", 5) + 12, W("s1", 5) + 24, 0, 1, "out"),
      lin("light.tail", W("s1", 5) + 6, end(0), 0, 0.6, "linear"),
      pop("cd.v", W("s1", 7)), set("cd", 0, 500), lin("cd", W("s1", 7) + 4, end(0), 500, 380, "linear", "count"),
      ...mascot.place(add(SP, M_EARTH), -0.5, 0.32, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 9), 40),
    ],
    badges: [],
    highlights: ["SOL", "SUMISSE", "AGORA", "OITO", "MINUTOS", "PERCEBER"],
    captions: [cap("s1", 0, "E se o Sol sumisse agora? Durante oito minutos, você nem ia perceber.")],
    audioCues: [narration("s1"), sfx("deep-amb", 0, 0.25), sfx("warp", W("s1", 5) + 2, 0.4), sfx("thud", W("s1", 5) + 10, 0.35), sfx("tick", W("s1", 7) + 4, 0.35)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "É o tempo que a luz dele leva pra chegar aqui.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.light), key(BLACK, P.light2, "inOut")] },
    objects: [{ id: "sp", type: "trem de luz chegando na Terra", visible: true }],
    animations: [
      ...world(0, "sp"), set("sun.k", 0, 0), set("ghost", 0, 1), lin("earth.th", 0, end(1), -66, -62, "linear"),
      lin("light.tail", 0, BLACK, 0.6, 1, "linear"), set("cd.v", 0, 1), lin("cd", 0, BLACK, 380, 0, "in", "count"), ...mascot.hide(0, 6),
      // a última luz chega: Terra apaga, tela escura e silêncio (~0,8 s)
      lin("earth.dark", BLACK, BLACK + 4, 0, 1, "out"), lin("light.on", BLACK - 2, BLACK, 1, 0, "linear"),
      lin("fade", BLACK, BLACK + 3, 0, 1, "out"), lin("music.mute", BLACK - 3, BLACK, 0, 1, "linear"), set("bg.dark", BLACK, 1),
    ],
    badges: [{ text: "A LUZ LEVA 8 MIN 20 S", variant: "info", appearAt: W("s2", 2) }],
    highlights: ["TEMPO", "LUZ", "CHEGAR", "AQUI"],
    captions: [cap("s2", 1, "É o tempo que a luz dele leva pra chegar aqui.")],
    audioCues: [narration("s2"), ...TICKS.map((t, i) => sfx("tick", t, 0.3 + i * 0.02)), sfx("power-down", BLACK - 3, 0.45)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Depois disso, escuridão total, e a Terra sai da órbita em linha reta.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.wide), key(end(2), P.wide2, "inOut")] },
    objects: [{ id: "sp", type: "Terra escura sai da órbita (linha reta)", visible: true }],
    animations: [
      ...world(0, "sp"), set("sun.k", 0, 0), set("ghost", 0, 1), set("earth.th", 0, -62), set("earth.dark", 0, 1), set("light.on", 0, 0), set("cd.v", 0, 0), set("bg.dark", 0, 1),
      set("fade", 0, 1), lin("fade", 6, 18, 1, 0, "inOut"), set("music.mute", 0, 1), lin("music.mute", 6, 20, 1, 0, "linear"),
      set("orbit", 0, 1), lin("orbit", W("s3", 7), W("s3", 9) + 6, 1, 0, "inOut"), lin("path", W("s3", 9), W("s3", 12) + 6, 0, 1, "out"),
      lin("earth.lx", W("s3", 7), end(2), 0, 3.5, "in"), ...fx.shake(W("s3", 7), 14),
    ],
    badges: [{ text: "TERRA SAI EM LINHA RETA", variant: "negative", appearAt: W("s3", 9) }],
    highlights: ["ESCURIDÃO", "TOTAL", "TERRA", "ÓRBITA", "LINHA", "RETA"],
    captions: [cap("s3", 2, "Depois disso, escuridão total, e a Terra sai da órbita em linha reta.")],
    audioCues: [narration("s3"), sfx("wind-cold", 4, 0.25), sfx("whoosh-big", W("s3", 7), 0.3), sfx("rumble-soft", W("s3", 7), 0.3)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "As plantas param a fotossíntese. Em uma semana, o planeta inteiro fica abaixo de zero.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.tree), ...cut(W("s4", 5), P.tree2, P.wk), key(end(3), P.wk2, "inOut")] },
    objects: [{ id: "tr", type: "WiltingTree", visible: true }, { id: "sp", type: "FrostEarth 0→0,4 + DIA/temperatura", visible: true }],
    animations: [
      ...world(0, "tr"), set("bg.dark", 0, 1), set("earth.dark", 0, 0.55), set("orbit", 0, 0), set("path", 0, 0), set("ghost", 0, 0), set("earth.lx", 0, 3.5),
      lin("wilt", W("s4", 1), W("s4", 5) + 4, 0, 1, "inOut"), lin("tfrost", W("s4", 3), W("s4", 5), 0, 0.8, "in"),
      ...world(W("s4", 5), "sp"), ...fx.whipIn(), lin("earth.lx", W("s4", 5), end(3), 3.5, 4.0, "linear"),
      set("frost", 0, 0.03), lin("frost", W("s4", 6), end(3), 0.03, 0.4, "inOut"),
      pop("dc.v", W("s4", 5) + 2), set("dc", 0, 1), lin("dc", W("s4", 6), W("s4", 7) + 10, 1, 7, "out", "count"),
      set("temp", 0, 15), pop("temp.v", W("s4", 8)), lin("temp", W("s4", 8), W("s4", 14), 15, -2, "inOut", "count"),
    ],
    badges: [
      { text: "FOTOSSÍNTESE PARA", variant: "negative", appearAt: W("s4", 3), disappearAt: W("s4", 5) },
      { text: "1 SEMANA: ABAIXO DE ZERO", variant: "info", appearAt: W("s4", 12) },
    ],
    highlights: ["PLANTAS", "FOTOSSÍNTESE", "SEMANA", "PLANETA", "INTEIRO", "ABAIXO", "ZERO"],
    captions: [cap("s4", 3, "As plantas param a fotossíntese. Em uma semana, o planeta inteiro fica abaixo de zero.")],
    audioCues: [narration("s4"), sfx("wind-cold", 0, 0.3), sfx("dust", W("s4", 3), 0.3), sfx("whoosh", W("s4", 5), 0.3), sfx("badge", W("s4", 5) + 2, 0.25), sfx("ding", W("s4", 12), 0.25)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Em um ano, a média chega a setenta e três graus negativos, e os oceanos congelam por cima.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.yr), ...cut(W("s5", 12), P.yr2, P.oc), key(end(4), P.oc2, "inOut")] },
    objects: [{ id: "sp", type: "FrostEarth 0,4→1", visible: true }, { id: "oc", type: "IceOceanSlice", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...world(0, "sp"), ...fx.whipIn(-1), set("bg.dark", 0, 1), set("earth.dark", 0, 0.55), set("earth.lx", 0, 4.0), lin("earth.lx", 0, W("s5", 12), 4.0, 4.4, "linear"),
      set("frost", 0, 0.4), lin("frost", W("s5", 0), W("s5", 11), 0.4, 1, "inOut"),
      set("dc.v", 0, 1), set("dc", 0, 7), lin("dc", W("s5", 1), W("s5", 3) + 10, 7, 365, "out", "count"),
      set("temp.v", 0, 1), set("temp", 0, -2), lin("temp", W("s5", 7), W("s5", 11) + 6, -2, -73, "out", "count"), ...fx.punch(W("s5", 11)),
      popOut("dc.v", W("s5", 12), 6), popOut("temp.v", W("s5", 12), 6),
      lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      ...world(W("s5", 12), "oc"), set("ice.show", W("s5", 12), 1), set("ice", 0, 0.2), lin("ice", W("s5", 14), W("s5", 17) + 12, 0.2, 1, "out"),
    ],
    badges: [
      { text: "1 ANO: −73 °C (ESTIMATIVA)", variant: "negative", appearAt: W("s5", 10), disappearAt: W("s5", 12) },
      { text: "OCEANO CONGELA POR CIMA", variant: "info", appearAt: W("s5", 15) },
    ],
    highlights: ["ANO", "MÉDIA", "SETENTA", "TRÊS", "GRAUS", "NEGATIVOS", "OCEANOS", "CONGELAM", "CIMA"],
    captions: [cap("s5", 4, "Em um ano, a média chega a setenta e três graus negativos, e os oceanos congelam por cima.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.25), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("strain", W("s5", 10), 0.25), sfx("whoosh-soft", W("s5", 12), 0.3), sfx("crumble", W("s5", 15), 0.3)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Mas lá no fundo, perto das fontes quentes do fundo do mar, a vida ainda pode resistir.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.dive), key(W("s6", 4) - 1, P.dive2, "in"), key(W("s6", 4), P.vent), key(end(5), P.vent2, "inOut")] },
    objects: [{ id: "oc", type: "mergulho no corte", visible: true }, { id: "ve", type: "HydrothermalVent + mascote", visible: true }],
    animations: [
      ...world(0, "oc"), set("ice.show", 0, 1), set("ice", 0, 1), set("bg.dark", 0, 0),
      ...world(W("s6", 4), "ve"), ...fx.flash(W("s6", 4), 6),
      ...mascot.place(add(VE, [0.95, 0, 0.55]), -0.7, 0.22, W("s6", 4)), ...mascot.float(W("s6", 4), false, 1), ...mascot.wave(W("s6", 13), 40),
    ],
    badges: [
      { text: "FONTES HIDROTERMAIS", variant: "info", appearAt: W("s6", 6), disappearAt: W("s6", 12) },
      { text: "A VIDA RESISTE", variant: "positive", appearAt: W("s6", 13) },
    ],
    highlights: ["FUNDO", "FONTES", "QUENTES", "MAR", "VIDA", "RESISTIR"],
    captions: [cap("s6", 5, "Mas lá no fundo, perto das fontes quentes do fundo do mar, a vida ainda pode resistir.")],
    audioCues: [narration("s6"), sfx("dive", 0, 0.35), sfx("bubbles", W("s6", 3), 0.3), sfx("deep-amb", W("s6", 4), 0.3), sfx("glow", W("s6", 6), 0.25), sfx("shimmer", W("s6", 13), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Pronto: agora você sabe. Sem o Sol, a gente teria oito minutos. Depois, só o escuro.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.fin), key(end(6), P.fin2, "inOut")] },
    objects: [{ id: "sp", type: "Terra congelada vagando no escuro", visible: true }],
    animations: [
      ...world(0, "sp"), ...fx.whipIn(), set("ice.show", 0, 0), set("bg.dark", 0, 1), set("frost", 0, 1), set("earth.dark", 0, 0.45), set("ghost", 0, 0),
      set("earth.lx", 0, 4.6), lin("earth.lx", 0, end(6), 4.6, 5.4, "linear"),
      ...mascot.place(add(E(4.9), [0.6, 0.95, 0.6]), -0.6, 0.22, 0), ...mascot.float(0, true, 1), ...mascot.look(W("s7", 4), -0.5),
      set("cd", 0, 500), pop("cd.v", W("s7", 10)), popOut("cd.v", W("s7", 12), 6),
      lin("fade", W("s7", 15), W("s7", 15) + 20, 0, 0.55, "inOut"),
    ],
    badges: [],
    highlights: ["PRONTO", "SABE", "SOL", "OITO", "MINUTOS", "ESCURO"],
    captions: [cap("s7", 6, "Pronto: agora você sabe. Sem o Sol, a gente teria oito minutos. Depois, só o escuro.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.25), sfx("final", W("s7", 0), 0.35), sfx("tick", W("s7", 10), 0.35), sfx("power-down", W("s7", 12), 0.3)],
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
