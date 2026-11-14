// scenes.ts — "Os pássaros que OUVIRAM a tempestade chegando". Roteiro v1 e designs APROVADOS (14/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, BRANCH_Y, FOREST, HIT, MAP, STORM, VIEW } from "./birds";

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
const WORLDS = ["forest", "map", "view", "storm", "hit"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const B = add(FOREST, [0, BRANCH_Y, 0]);
const P = {
  flock: orbit(add(B, [0.1, 0.45, 0]), 17, -12, 6),
  up: orbit(add(B, [1.4, 1.2, -0.5]), 12, -8, 0),
  up2: orbit(add(B, [2.4, 2.0, -1]), 14, 2, -4),
  close: orbit(add(B, [0.45, 0.5, 0]), 5.2, 6, 8),
  close2: orbit(add(B, [0.45, 0.5, 0]), 4.6, 14, 10),
  map: orbit(add(MAP, [0, -2, 0]), 34, 0, 62),
  map2: orbit(add(MAP, [0, -2, 0]), 32, 10, 58),
  view: orbit(add(VIEW, [0.45, BRANCH_Y + 0.45, 0]), 5.5, -10, 2),
  view2: orbit(add(VIEW, [0.6, BRANCH_Y + 1.2, -6]), 22, -2, 4),
  storm: orbit(add(STORM, [0.6, 2.4, 0]), 26, 10, 4),
  storm2: orbit(add(STORM, [0.6, 2.0, 0]), 21, 20, 2),
  calm: orbit(add(B, [0.1, 0.1, 0]), 15, 18, 6),
  calm2: orbit(add(B, [0.1, 0.1, 0]), 14, 30, 8),
  hit: orbit(add(HIT, [0.4, BRANCH_Y, 0]), 10, -8, 4),
  hit2: orbit(add(HIT, [0.4, BRANCH_Y, 0]), 9, 6, 6),
  fin: orbit(add(B, [0.2, -0.5, 0]), 16, -10, 6),
  fin2: orbit(add(B, [0.2, -0.4, 0]), 17, 14, 8),
};
const M_GROUND: Vec3 = add(FOREST, [1.9, 0.0, 0.9]);

const ZERO = ["flock.t", "tracker.k", "sing", "sky.dark", "waves.k", "route.draw", "km", "days", "band.k", "back.k", "freq.h", "freq.b", "rain.k", "seal.k", "sealH.k", "ret.t", "mascot.float"];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Em 2014, uns passarinhos nos Estados Unidos fugiram de uma tempestade um dia antes de ela chegar. O céu ainda estava limpo.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.flock), key(W("s1", 7), P.flock), key(W("s1", 12), P.up, "inOut"), key(end(0), P.up2, "linear")] },
    objects: [{ id: "flock", type: "Warbler×4 (galho → voo)", visible: true }, { id: "forest", type: "Floresta + céu", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "forest"), ...ZERO.map((t) => set(t, 0, 0)), set("sing", 2, 1), popOut("sing", W("s1", 6), 4),
      lin("flock.t", W("s1", 7), W("s1", 16), 0, 1, "in"), ...fx.punch(W("s1", 7)),
    ],
    badges: [
      { text: "FUGIRAM 1 DIA ANTES", variant: "warning", appearAt: W("s1", 7), disappearAt: W("s1", 17) },
      { text: "E O CÉU AINDA LIMPO", variant: "info", appearAt: W("s1", 17) },
    ],
    highlights: ["2014", "PASSARINHOS", "FUGIRAM", "TEMPESTADE", "DIA", "ANTES", "LIMPO"],
    captions: [cap("s1", 0, "Em 2014, uns passarinhos nos Estados Unidos fugiram de uma tempestade um dia antes de ela chegar. O céu ainda estava limpo.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("bird-chirp", 4, 0.35), sfx("wing-flap", W("s1", 7), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Eles pesam uns dez gramas, e cientistas tinham colado neles minúsculos rastreadores.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.close), key(end(1), P.close2, "linear")] },
    objects: [{ id: "bird", type: "Warbler(close)", visible: true }, { id: "tracker", type: "Geolocalizador", visible: true }, { id: "scale", type: "Peso 2D", visible: true }],
    animations: [...fx.whipIn(), set("flock.t", 0, 0), pop("tracker.k", W("s2", 8))],
    badges: [
      { text: "~10 GRAMAS", variant: "info", appearAt: W("s2", 2), disappearAt: W("s2", 8) },
      { text: "RASTREADOR MINÚSCULO", variant: "info", appearAt: W("s2", 8) },
    ],
    highlights: ["PESAM", "DEZ", "GRAMAS", "CIENTISTAS", "MINÚSCULOS", "RASTREADORES"],
    captions: [cap("s2", 1, "Eles pesam uns dez gramas, e cientistas tinham colado neles minúsculos rastreadores.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.3), sfx("click", W("s2", 8), 0.35), sfx("bird-chirp", W("s2", 3), 0.2)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Os dados mostraram: eles voaram mais de mil e quinhentos quilômetros em cinco dias, saíram do caminho dos tornados e depois voltaram.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.map), key(end(2), P.map2, "linear")] },
    objects: [{ id: "map", type: "Mapa esquemático", visible: true }, { id: "route", type: "Rota ida e volta", visible: true }, { id: "band", type: "Faixa da tempestade", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "map"), set("tracker.k", 0, 0), set("seal.k", 0, 1), lin("route.draw", W("s3", 3), W("s3", 13), 0, 0.55, "inOut"), lin("km", W("s3", 4), W("s3", 10) + 6, 0, 1500, "out", "count"),
      lin("days", W("s3", 4), W("s3", 13), 0, 5, "linear", "count"), lin("band.k", W("s3", 14), W("s3", 18), 0, 1), lin("route.draw", W("s3", 19), W("s3", 21) + 12, 0.55, 1, "inOut"),
    ],
    badges: [
      { text: "+1.500 KM EM 5 DIAS", variant: "info", appearAt: W("s3", 5), disappearAt: W("s3", 19) },
      { text: "E VOLTARAM", variant: "positive", appearAt: W("s3", 19) },
    ],
    highlights: ["DADOS", "MIL", "QUINHENTOS", "QUILÔMETROS", "CINCO", "DIAS", "TORNADOS", "VOLTARAM"],
    captions: [cap("s3", 2, "Os dados mostraram: eles voaram mais de mil e quinhentos quilômetros em cinco dias, saíram do caminho dos tornados e depois voltaram.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.3), sfx("tick", W("s3", 4), 0.25), sfx("rumble-soft", W("s3", 14), 0.3), sfx("ding", W("s3", 19), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Mas como eles sabiam? A pista mais provável é o infrassom: um som tão grave que a gente não escuta.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.view), key(W("s4", 4), P.view, "linear"), key(end(3), P.view2, "inOut")] },
    objects: [{ id: "bird", type: "Warbler(galho)", visible: true }, { id: "storm", type: "Supercell(horizonte)", visible: true }, { id: "waves", type: "InfraWaves", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "view"), set("seal.k", 0, 0), set("route.draw", 0, 0), set("band.k", 0, 0), lin("sky.dark", 0, end(3), 0.1, 0.25), lin("waves.k", W("s4", 9), W("s4", 11), 0, 1), ...fx.punch(W("s4", 10))],
    badges: [
      { text: "COMO SABIAM?", variant: "warning", icon: "?", appearAt: W("s4", 0), disappearAt: W("s4", 9) },
      { text: "INFRASSOM", variant: "info", size: "large", appearAt: W("s4", 10) },
    ],
    highlights: ["SABIAM", "PISTA", "PROVÁVEL", "INFRASSOM", "GRAVE", "ESCUTA"],
    captions: [cap("s4", 3, "Mas como eles sabiam? A pista mais provável é o infrassom: um som tão grave que a gente não escuta.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("hum", W("s4", 10), 0.35), sfx("rumble-soft", W("s4", 12), 0.3)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Tempestades fortes fazem o ar vibrar bem devagar, e esse som grave viaja centenas de quilômetros.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.storm), key(end(4), P.storm2, "linear")] },
    objects: [{ id: "storm", type: "Supercell + Tornado", visible: true }, { id: "waves", type: "InfraWaves(lentas)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "storm"), set("waves.k", 0, 1), ...fx.shake(W("s5", 5), 18), set("sealH.k", 0, 1)],
    badges: [
      { text: "O AR VIBRA DEVAGAR", variant: "info", appearAt: W("s5", 4), disappearAt: W("s5", 12) },
      { text: "VIAJA CENTENAS DE KM", variant: "warning", appearAt: W("s5", 12) },
    ],
    highlights: ["TEMPESTADES", "VIBRAR", "DEVAGAR", "GRAVE", "VIAJA", "CENTENAS", "QUILÔMETROS"],
    captions: [cap("s5", 4, "Tempestades fortes fazem o ar vibrar bem devagar, e esse som grave viaja centenas de quilômetros.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.3), sfx("rumble", W("s5", 5), 0.35), sfx("wind-cold", 0, 0.25)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "A gente não ouve abaixo de umas vinte vibrações por segundo. Algumas aves percebem sons bem mais graves.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.calm), key(end(5), P.calm2, "linear")] },
    objects: [{ id: "freq", type: "Barra de frequências 2D", visible: true }, { id: "mascot", type: "Mascot", visible: true }, { id: "bird", type: "Warbler", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "forest"), set("sealH.k", 0, 0), set("waves.k", 0, 0), set("sky.dark", 0, 0), pop("freq.h", W("s6", 3)), pop("freq.b", W("s6", 11)),
      ...mascot.hide(0, 2),
    ],
    badges: [
      { text: "HUMANOS: ACIMA DE ~20 HZ", variant: "info", appearAt: W("s6", 6), disappearAt: W("s6", 11) },
      { text: "ALGUMAS AVES: MAIS GRAVE", variant: "positive", appearAt: W("s6", 11) },
    ],
    highlights: ["OUVE", "VINTE", "VIBRAÇÕES", "SEGUNDO", "AVES", "GRAVES"],
    captions: [cap("s6", 5, "A gente não ouve abaixo de umas vinte vibrações por segundo. Algumas aves percebem sons bem mais graves.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.3), sfx("buzz", W("s6", 3), 0.2), sfx("ding", W("s6", 11), 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Ninguém mediu o som daquela tempestade, então ainda é hipótese. Mas os pássaros fugiram antes de tudo.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.hit), key(end(6), P.hit2, "linear")] },
    objects: [{ id: "hit", type: "Floresta sob tempestade, galho vazio", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "hit"), ...mascot.hide(0, 4), set("freq.h", 0, 0), set("freq.b", 0, 0), lin("rain.k", 0, 20, 0, 1), ...fx.flash(W("s7", 10), 8), ...fx.shake(W("s7", 10), 14)],
    badges: [
      { text: "AINDA É HIPÓTESE", variant: "warning", appearAt: W("s7", 5), disappearAt: W("s7", 11) },
      { text: "FUGIRAM ANTES", variant: "positive", appearAt: W("s7", 11) },
    ],
    highlights: ["NINGUÉM", "MEDIU", "HIPÓTESE", "PÁSSAROS", "FUGIRAM", "ANTES"],
    captions: [cap("s7", 6, "Ninguém mediu o som daquela tempestade, então ainda é hipótese. Mas os pássaros fugiram antes de tudo.")],
    audioCues: [narration("s7"), sfx("rain", 0, 0.3), sfx("thud", W("s7", 10), 0.45), sfx("rumble", W("s7", 10), 0.35)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. Enquanto o céu parece calmo, a tempestade já está fazendo barulho.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "flock", type: "Warbler×4 (voltando)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "forest"), set("rain.k", 0, 0), set("ret.t", 0, 1), lin("ret.t", 0, 50, 1, 0, "out"), set("sing", 60, 1), lin("waves.k", W("s8", 6), W("s8", 10), 0, 0.5),
      ...mascot.place(M_GROUND, -0.4, 1.0, 0), ...mascot.float(0, false, 1), ...mascot.cheer(W("s8", 1), 40), ...mascot.wave(W("s8", 9), 40), popOut("waves.k", end(7) - s(5.3)),
    ],
    badges: [{ text: "O CÉU CALMO PODE ENGANAR", variant: "info", appearAt: W("s8", 5), disappearAt: end(7) - s(5.3) }],
    highlights: ["PRONTO", "CÉU", "CALMO", "TEMPESTADE", "BARULHO"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. Enquanto o céu parece calmo, a tempestade já está fazendo barulho.")],
    audioCues: [narration("s8"), sfx("wing-flap", 2, 0.35), sfx("bird-chirp", 60, 0.3), sfx("final", W("s8", 0), 0.35)],
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
