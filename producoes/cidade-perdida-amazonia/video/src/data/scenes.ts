// scenes.ts — "El Niño 2026–2027". Roteiro v1 e designs APROVADOS (17/11/2026; mascote com chapéu de palha).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { ll2, regionCenter } from "../components/Nino";
import { add, BOAT, BR, PAC } from "./nino";

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
const WORLDS = ["pac", "br"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
export const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const NE_N = (() => { const a = regionCenter("N", 0.2), b = regionCenter("NE", 0.2); return [(a[0] + b[0]) / 2, 0.2, (a[2] + b[2]) / 2] as Vec3; })();
const SUL = ll2(-52, -28, 0.3);
const P = {
  open: orbit(add(PAC, [0.8, 0.4, 0]), 34, 70, 34),
  open2: orbit(add(PAC, [1.0, 0.4, 0]), 28, 60, 26),
  boat: orbit(add(PAC, add(BOAT, [0, 0.45, 0])), 6.5, 30, 14),
  boat2: orbit(add(PAC, add(BOAT, [0, 0.45, 0])), 5.5, 48, 12),
  west: orbit(add(PAC, [-2.2, 0.2, 0]), 22, 58, 28),
  east: orbit(add(PAC, [2.6, 0.2, 0]), 22, 72, 26),
  pac: orbit(add(PAC, [0.4, 0.2, 0]), 30, 68, 30),
  pac2: orbit(add(PAC, [0.8, 0.3, 0]), 34, 60, 34),
  br: orbit(add(BR, [0, 0, 0.4]), 24, 0, 56),
  nne: orbit(add(BR, NE_N), 16, -8, 48),
  nne2: orbit(add(BR, NE_N), 14, 6, 42),
  sul: orbit(add(BR, SUL), 9.5, -14, 30),
  sul2: orbit(add(BR, SUL), 8.5, 10, 26),
  tl: orbit(add(PAC, [0.6, 0.2, 0]), 36, 64, 40),
  tl2: orbit(add(PAC, [0.6, 0.2, 0]), 36, 76, 40),
  fin: orbit(add(PAC, add(BOAT, [-1.0, 0.4, 0])), 16, 50, 20),
  fin2: orbit(add(PAC, add(BOAT, [-1.6, 0.4, 0])), 22, 66, 26),
};

const ZERO = ["meter", "meter.v", "cal", "boatwarm", "plumes", "dryN", "dryNE", "wetS", "fire", "storm", "bolt", "tagN", "tagS", "tl", "tl.draw", "tl.peak", "tl.neutral", "seal.k", "sealI.k", "mascot.float", "ls"];
const sealOnly = (at: number, which: "seal.k" | "sealI.k" | "none"): TrackAnimation[] => [set("seal.k", at, which === "seal.k" ? 1 : 0), set("sealI.k", at, which === "sealI.k" ? 1 : 0)];
const M_BOAT = add(PAC, add(BOAT, [0.12, 0.25, 0.02]));
const M_FLY = add(PAC, [2.6, 2.2, 2.0]);

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "O El Niño de 2026 é um dos mais fortes já medidos, e vai mexer com o tempo no Brasil até 2027. Mas o que ele é, afinal?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.open), key(end(0), P.open2, "inOut")] },
    objects: [{ id: "pac", type: "PacificSlice em El Niño", visible: true }, { id: "meter", type: "IntensityMeter", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "pac"), ...ZERO.map((t) => set(t, 0, 0)), set("warm", 0, 1), set("plumes", 0, 0.8), set("mascot.hat", 0, 1),
      pop("meter", W("s1", 6)), lin("meter.v", W("s1", 6), W("s1", 11) + 8, 0, 0.97, "out"), popOut("meter", W("s1", 22) - 4, 8), ...fx.punch(W("s1", 27)),
      ...mascot.place(M_FLY, -0.4, 0.55, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 0) + 4, 36), ...mascot.look(W("s1", 22), 0.4),
    ],
    badges: [
      { text: "EL NIÑO 2026", variant: "warning", subtitle: "UM DOS MAIS FORTES JÁ MEDIDOS", appearAt: W("s1", 6), disappearAt: W("s1", 22) },
      { text: "O QUE ELE É?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 22) },
    ],
    highlights: ["EL", "NIÑO", "2026", "FORTES", "BRASIL", "2027", "AFINAL"],
    captions: [cap("s1", 0, "O El Niño de 2026 é um dos mais fortes já medidos, e vai mexer com o tempo no Brasil até 2027. Mas o que ele é, afinal?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("ocean-amb", 0, 0.2), sfx("badge", W("s1", 6), 0.3), sfx("alert-tone", W("s1", 22), 0.2)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "O nome veio de pescadores do Peru. A água quente aparecia perto do Natal, e eles chamaram de El Niño: o Menino Jesus.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.boat), key(end(1), P.boat2, "inOut")] },
    objects: [{ id: "boat", type: "FishingBoat + mascote (chapéu de palha)", visible: true }, { id: "cal", type: "XmasCalendar", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "pac"), set("warm", 0, 0), set("plumes", 0, 0), set("winds", 0, 0), ...sealOnly(0, "none"),
      ...mascot.place(M_BOAT, 1.6, 0.18, 0), ...mascot.float(0, false, 1),
      lin("boatwarm", W("s2", 7), W("s2", 9) + 12, 0, 1, "out"), pop("cal", W("s2", 13)), ...fx.punch(W("s2", 21)), ...mascot.cheer(W("s2", 21), 30),
    ],
    badges: [
      { text: "PESCADORES DO PERU", variant: "info", appearAt: W("s2", 4), disappearAt: W("s2", 18) },
      { text: "EL NIÑO = O MENINO JESUS", variant: "positive", appearAt: W("s2", 18) },
    ],
    highlights: ["NOME", "PESCADORES", "PERU", "ÁGUA", "QUENTE", "NATAL", "MENINO", "JESUS"],
    captions: [cap("s2", 1, "O nome veio de pescadores do Peru. A água quente aparecia perto do Natal, e eles chamaram de El Niño: o Menino Jesus.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.3), sfx("ocean-amb", 0, 0.3), sfx("bells", W("s2", 13), 0.3), sfx("ding", W("s2", 21), 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Normalmente, ventos sopram de leste pra oeste no Pacífico e empurram a água quente pra perto da Ásia. Perto da América do Sul, sobe água fria do fundo.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.west), key(W("s3", 17), P.west, "linear"), key(W("s3", 22), P.east, "inOut"), key(end(2), P.east, "linear")] },
    objects: [{ id: "pac", type: "PacificSlice normal (ventos, termoclina, ressurgência)", visible: true }],
    animations: [...fx.whipIn(-1), ...world(0, "pac"), set("warm", 0, 0), set("boatwarm", 0, 0), set("winds", 0, 1), ...mascot.hide(0, 1), ...sealOnly(0, "seal.k")],
    badges: [
      { text: "NORMAL: VENTOS PARA OESTE", variant: "info", appearAt: W("s3", 1), disappearAt: W("s3", 18) },
      { text: "ÁGUA FRIA SOBE DO FUNDO", variant: "info", appearAt: W("s3", 23) },
    ],
    highlights: ["NORMALMENTE", "VENTOS", "LESTE", "OESTE", "ÁGUA", "QUENTE", "ÁSIA", "FRIA", "FUNDO"],
    captions: [cap("s3", 2, "Normalmente, ventos sopram de leste pra oeste no Pacífico e empurram a água quente pra perto da Ásia. Perto da América do Sul, sobe água fria do fundo.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.3), sfx("wind-cold", W("s3", 1), 0.3), sfx("bubbles", W("s3", 23), 0.3)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Quando esses ventos enfraquecem, a água quente volta, se espalha até a América do Sul e muda a chuva no planeta inteiro.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.pac), key(end(3), P.pac2, "inOut")] },
    objects: [{ id: "pac", type: "PacificSlice (warm 0→1)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "pac"), ...sealOnly(0, "seal.k"),
      lin("warm", W("s4", 3), W("s4", 14) + 6, 0, 1, "inOut"), lin("plumes", W("s4", 16), W("s4", 18) + 10, 0, 1, "inOut"), ...fx.punch(W("s4", 3)),
    ],
    badges: [
      { text: "VENTOS FRACOS", variant: "warning", appearAt: W("s4", 2), disappearAt: W("s4", 9) },
      { text: "ÁGUA QUENTE VAI PARA LESTE", variant: "negative", appearAt: W("s4", 9) },
    ],
    highlights: ["VENTOS", "ENFRAQUECEM", "QUENTE", "VOLTA", "ESPALHA", "CHUVA", "PLANETA"],
    captions: [cap("s4", 3, "Quando esses ventos enfraquecem, a água quente volta, se espalha até a América do Sul e muda a chuva no planeta inteiro.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("power-down", W("s4", 3), 0.3), sfx("rush", W("s4", 7), 0.3), sfx("rain", W("s4", 16), 0.2)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "No Brasil, o efeito muda de região pra região. Norte e Nordeste ficam mais secos e quentes, com risco de seca e queimadas.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.br), key(W("s5", 9), P.br, "linear"), key(W("s5", 13), P.nne, "inOut"), key(end(4), P.nne2, "linear")] },
    objects: [{ id: "br", type: "BrazilMap (N/NE secando, fogo)", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "br"), ...mascot.hide(0, 1), ...sealOnly(0, "seal.k"), lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      lin("dryN", W("s5", 9), W("s5", 14) + 10, 0, 0.75, "inOut"), lin("dryNE", W("s5", 11), W("s5", 16) + 10, 0, 1, "inOut"), lin("fire", W("s5", 20), W("s5", 22) + 10, 0, 1, "out"), ...fx.shake(W("s5", 22), 14),
      pop("tagN", W("s5", 12)),
    ],
    badges: [{ text: "EFEITO MUDA POR REGIÃO", variant: "info", appearAt: W("s5", 1), disappearAt: W("s5", 9) }],
    highlights: ["BRASIL", "REGIÃO", "NORTE", "NORDESTE", "SECOS", "QUENTES", "SECA", "QUEIMADAS"],
    captions: [cap("s5", 4, "No Brasil, o efeito muda de região pra região. Norte e Nordeste ficam mais secos e quentes, com risco de seca e queimadas.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.3), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("crumble", W("s5", 14), 0.3), sfx("fire", W("s5", 20), 0.35)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Já o Sul recebe chuva acima da média, com risco de enchentes e temporais.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.sul), key(end(5), P.sul2, "inOut")] },
    objects: [{ id: "br", type: "BrazilMap (Sul azul + temporal)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "br"), ...sealOnly(0, "seal.k"), set("dryN", 0, 0.75), set("dryNE", 0, 1), set("fire", 0, 1),
      pop("storm", W("s6", 3)), lin("wetS", W("s6", 4), W("s6", 7) + 8, 0, 1, "inOut"), lin("bolt", W("s6", 13), W("s6", 13) + 3, 0, 1, "linear"), lin("bolt", W("s6", 13) + 6, W("s6", 13) + 12, 1, 0, "linear"), ...fx.flash(W("s6", 13), 6),
      pop("tagS", W("s6", 4)),
    ],
    badges: [],
    highlights: ["SUL", "CHUVA", "ACIMA", "MÉDIA", "ENCHENTES", "TEMPORAIS"],
    captions: [cap("s6", 5, "Já o Sul recebe chuva acima da média, com risco de enchentes e temporais.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.3), sfx("rain", W("s6", 3), 0.35), sfx("thud", W("s6", 13), 0.4)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Pela NOAA e pelo INMET, o pico deve ser entre novembro e janeiro. Depois ele perde força, e lá pelo meio de 2027 o Pacífico deve voltar ao normal.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.tl), key(end(6), P.tl2, "linear")] },
    objects: [{ id: "pac", type: "Pacífico ao fundo (esfriando)", visible: true }, { id: "tl", type: "NinoTimeline", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "pac"), ...sealOnly(0, "none"), set("warm", 0, 1), set("plumes", 0, 0.6),
      pop("tl", W("s7", 0)), lin("tl.draw", W("s7", 1), W("s7", 12) + 6, 0, 0.42, "inOut"), pop("tl.peak", W("s7", 6)), lin("tl.draw", W("s7", 13), W("s7", 22) + 8, 0.42, 1, "inOut"), pop("tl.neutral", W("s7", 26)),
      lin("warm", W("s7", 15), end(6), 1, 0.15, "inOut"), lin("plumes", W("s7", 15), W("s7", 22), 0.6, 0, "inOut"),
    ],
    badges: [
      { text: "PICO: NOV/2026 – JAN/2027", variant: "warning", appearAt: W("s7", 6), disappearAt: W("s7", 22) },
      { text: "NORMAL LÁ PELO MEIO DE 2027", variant: "positive", subtitle: "PREVISÃO NOAA / INMET", appearAt: W("s7", 22) },
    ],
    highlights: ["NOAA", "INMET", "PICO", "NOVEMBRO", "JANEIRO", "FORÇA", "2027", "NORMAL"],
    captions: [cap("s7", 6, "Pela NOAA e pelo INMET, o pico deve ser entre novembro e janeiro. Depois ele perde força, e lá pelo meio de 2027 o Pacífico deve voltar ao normal.")],
    audioCues: [narration("s7"), sfx("whoosh-soft", 0, 0.3), sfx("pop", W("s7", 6), 0.3), sfx("glow", W("s7", 26), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. O El Niño não é uma tempestade: é o oceano mudando o calor de lugar, e o mundo inteiro sentindo.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "pac", type: "Pacífico + barco + mascote", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "pac"), ...sealOnly(0, "none"), set("winds", 0, 0.4), set("warm", 0, 0), lin("warm", W("s8", 11), W("s8", 18), 0, 1, "inOut"), lin("plumes", W("s8", 15), W("s8", 20), 0, 1, "inOut"),
      ...mascot.place(M_BOAT, 1.6, 0.18, 0), ...mascot.float(0, false, 1), ...mascot.cheer(W("s8", 0), 36), ...mascot.wave(W("s8", 19), 40),
    ],
    badges: [{ text: "OCEANO MUDANDO O CALOR DE LUGAR", variant: "info", appearAt: W("s8", 11), disappearAt: end(7) - s(5.2) }],
    highlights: ["PRONTO", "TEMPESTADE", "OCEANO", "CALOR", "LUGAR", "MUNDO"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. O El Niño não é uma tempestade: é o oceano mudando o calor de lugar, e o mundo inteiro sentindo.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.3), sfx("final", W("s8", 0), 0.4), sfx("ocean-amb", 0, 0.25)],
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
