// scenes.ts — Boato ou Verdade #5: pterodáctilo no México? (abertura nova, ~51 s). Roteiro e designs APROVADOS (18/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, CR, FT, JU, MP, SC } from "./ptm";
import { ll } from "../components/Ptero";

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
const WORLDS = ["ju", "ft", "mp", "sc", "cr"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
export const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const L = (lon: number, lat: number, y = 0) => add(MP, ll(lon, lat, y));
const P = {
  open: orbit(add(JU, [1.0, 2.6, -2.4]), 21, 0, 4),
  open2: orbit(add(JU, [1.1, 2.6, -2.6]), 19, 6, 5),
  cctv: orbit(add(JU, [1.6, 4.2, -6]), 14, -4, -12),
  cctv2: orbit(add(JU, [1.6, 4.2, -6]), 13, 4, -12),
  tree: orbit(add(FT, [0, 2.2, 0]), 27, 0, 8),
  tree2: orbit(add(FT, [1.5, 3.1, 0]), 10, -18, 8),
  map: orbit(L(-104.6, 30.0), 16, 0, 58),
  map2: orbit(L(-104.4, 29.8), 13, 8, 62),
  sc: orbit(add(SC, [0, 3.0, 0]), 50, 0, 4),
  sc2: orbit(add(SC, [0, 3.0, 0]), 46, 8, 6),
  sc3: orbit(add(SC, [0, 3.0, 0]), 44, -6, 6),
  mapw: orbit(L(-97.5, 25.5), 24, -20, 60),
  mapw2: orbit(L(-95, 23.5), 20, -14, 62),
  moon: orbit(add(JU, [1.5, 3.8, -4.5]), 14, 0, -3),
  moon2: orbit(add(JU, [1.5, 3.9, -4.6]), 13, 5, -2),
  fin: orbit(add(JU, [1.0, 2.7, -2.6]), 20, -6, 4),
  cr: orbit(add(CR, [0, 1.3, 0]), 22, 14, 12),
  cr2: orbit(add(CR, [0, 1.3, 0]), 20, 24, 14),
};
const M_STREET: Vec3 = [-2.6, 0, -0.55];

const ZERO = ["hook", "tag", "cctv", "cctv.t", "tree", "dino", "ptero", "pin.j", "pin.b", "line", "seal.k", "q.sil", "ast.t", "shock", "crater", "verdict", "lines", "fly.h", "ls", "fade", "bg.dark", "cr.x"];
const flyBy = (a: number, len = 45): TrackAnimation[] => [set("fly.x", a - 1, -1.4), lin("fly.x", a, a + len, -1.4, 1.4, "linear")];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Boato ou verdade: um pterodáctilo foi filmado voando no México?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.open), key(end(0), P.open2, "inOut")] },
    objects: [{ id: "ju", type: "JuarezNight + silhueta na lua", visible: true }, { id: "hook", type: "HookText + SeriesTag + CornerBug", visible: true }],
    animations: [
      ...world(0, "ju"), ...ZERO.map((t) => set(t, 0, 0)), set("bg.dark", 0, 1), set("fly.p", 0, 1), set("q.k", 0, 1),
      set("hook", 0, 1), set("tag", 0, 1), popOut("tag", end(0) - 10, 8), popOut("hook", end(0) - 10, 8),
      set("fly.x", 0, -0.35), lin("fly.x", 0, 60, -0.35, 1.4, "linear"), ...flyBy(66, 50),
      ...mascot.place(add(JU, M_STREET), 0.4, 0.29, 0), ...mascot.look(0, 0.6), ...mascot.jump(W("s1", 4)), ...mascot.point(W("s1", 7), 30, 0.6),
    ],
    badges: [],
    highlights: ["BOATO", "VERDADE", "PTERODÁCTILO", "FILMADO", "MÉXICO"],
    captions: [cap("s1", 0, "Boato ou verdade: um pterodáctilo foi filmado voando no México?")],
    audioCues: [narration("s1"), sfx("wind-cold", 0, 0.2), sfx("wing-flap", 4, 0.35), sfx("wing-flap", 70, 0.3), sfx("alert-tone", W("s1", 4), 0.2)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "O vídeo viral é de uma câmera de segurança em Ciudad Juárez, à noite, e dura um segundo e meio.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.cctv), key(end(1), P.cctv2, "linear")] },
    objects: [{ id: "ju", type: "visão da câmera (céu + lua)", visible: true }, { id: "cctv", type: "CctvFrame", visible: true }],
    animations: [
      ...world(0, "ju"), ...fx.whipIn(), set("bg.dark", 0, 1), set("cctv", 0, 1), ...mascot.hide(0, 4),
      ...flyBy(W("s2", 6), 45), set("cctv.t", 0, 0), lin("cctv.t", W("s2", 6), W("s2", 6) + 45, 0, 1.5, "linear", "count"),
      ...flyBy(W("s2", 15), 45), set("cctv.t", W("s2", 15) - 1, 0), lin("cctv.t", W("s2", 15), W("s2", 15) + 45, 0, 1.5, "linear", "count"), ...fx.punch(W("s2", 17)),
      lin("cctv", end(1) - 6, end(1), 1, 0, "linear"),
    ],
    badges: [
      { text: "CÂMERA DE SEGURANÇA · JUÁREZ", variant: "info", appearAt: W("s2", 8), disappearAt: W("s2", 15) },
      { text: "SÓ 1,5 SEGUNDO, À NOITE", variant: "warning", appearAt: W("s2", 17) },
    ],
    highlights: ["VIRAL", "CÂMERA", "SEGURANÇA", "CIUDAD", "JUÁREZ", "NOITE", "SEGUNDO", "MEIO"],
    captions: [cap("s2", 1, "O vídeo viral é de uma câmera de segurança em Ciudad Juárez, à noite, e dura um segundo e meio.")],
    audioCues: [narration("s2"), sfx("tv-on", 0, 0.3), sfx("hum", 2, 0.15), sfx("wing-flap", W("s2", 6) + 10, 0.3), sfx("rewind", W("s2", 14), 0.25), sfx("ding", W("s2", 17), 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Detalhe: pterodáctilo nem é dinossauro. É um réptil voador, primo deles.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.tree), key(W("s3", 5), P.tree, "linear"), key(end(2), P.tree2, "inOut")] },
    objects: [{ id: "ft", type: "FamilyTree + Aratasaurus + Quetzalcoatlus", visible: true }],
    animations: [
      ...world(0, "ft"), ...fx.whipIn(-1), set("bg.dark", 0, 0), set("cctv", 0, 0),
      set("tree", 0, 0), lin("tree", 2, W("s3", 1) + 4, 0, 1, "out"), pop("ptero", W("s3", 1)), pop("dino", W("s3", 4)), ...fx.shake(W("s3", 4), 10),
    ],
    badges: [
      { text: "PTEROSSAURO ≠ DINOSSAURO", variant: "negative", appearAt: W("s3", 4), disappearAt: W("s3", 7) },
      { text: "RÉPTIL VOADOR · PRIMO", variant: "info", appearAt: W("s3", 8) },
    ],
    highlights: ["DETALHE", "PTERODÁCTILO", "NEM", "DINOSSAURO", "RÉPTIL", "VOADOR", "PRIMO"],
    captions: [cap("s3", 2, "Detalhe: pterodáctilo nem é dinossauro. É um réptil voador, primo deles.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.3), sfx("seed-pop", W("s3", 1), 0.3), sfx("dino-call", W("s3", 4), 0.22), sfx("buzz", W("s3", 4) + 4, 0.2), sfx("wing-flap", W("s3", 8), 0.3)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "E eles voaram mesmo ali perto: no Texas, colado na fronteira, tem fóssil de um com mais de dez metros de asa.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.map), ...cut(W("s4", 11), P.map2, P.sc), key(end(3), P.sc2, "inOut")] },
    objects: [{ id: "mp", type: "BorderMap + pinos", visible: true }, { id: "sc", type: "Quetzalcoatlus × girafa × mascote", visible: true }],
    animations: [
      ...world(0, "mp"), ...fx.whipIn(), set("q.k", 0, 1), set("q.sil", 0, 0),
      pop("pin.j", W("s4", 4)), pop("pin.b", W("s4", 7)), lin("line", W("s4", 8), W("s4", 10) + 6, 0, 1, "out"), set("seal.k", 0, 1),
      ...world(W("s4", 11), "sc"), set("seal.k", W("s4", 11), 0), ...fx.flash(W("s4", 11), 6),
      ...mascot.place(add(SC, [3.6, 0, 1.0]), -0.6, 0.97, W("s4", 11)), ...mascot.float(W("s4", 11), false, 1), ...mascot.wave(W("s4", 18), 36),
    ],
    badges: [
      { text: "BIG BEND · TEXAS", variant: "info", subtitle: "NA FRONTEIRA COM CHIHUAHUA", appearAt: W("s4", 7), disappearAt: W("s4", 11) },
      { text: "QUETZALCOATLUS · ~11 M DE ASA", variant: "positive", appearAt: W("s4", 16) },
    ],
    highlights: ["VOARAM", "PERTO", "TEXAS", "FRONTEIRA", "FÓSSIL", "DEZ", "METROS", "ASA"],
    captions: [cap("s4", 3, "E eles voaram mesmo ali perto: no Texas, colado na fronteira, tem fóssil de um com mais de dez metros de asa.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("pop", W("s4", 4), 0.3), sfx("pop", W("s4", 7), 0.3), sfx("whoosh-soft", W("s4", 11), 0.3), sfx("wing-flap", W("s4", 13), 0.35), sfx("shimmer", W("s4", 18), 0.25)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Mas sumiram há sessenta e seis milhões de anos, junto com os dinossauros, depois do asteroide que caiu no México.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.sc2), ...cut(W("s5", 13), P.sc3, P.mapw), key(end(4), P.mapw2, "inOut")] },
    objects: [{ id: "sc", type: "Quetzalcoatlus vira sombra e some", visible: true }, { id: "mp", type: "asteroide em Chicxulub", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...world(0, "sc"), set("q.k", 0, 1), lin("q.sil", W("s5", 1), W("s5", 3), 0, 1, "inOut"), lin("q.k", W("s5", 10), W("s5", 12) + 4, 1, 0, "in"), ...mascot.hide(W("s5", 10), 8),
      lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      ...world(W("s5", 13), "mp"), set("pin.j", W("s5", 13), 0), set("pin.b", W("s5", 13), 0), set("line", W("s5", 13), 0), set("seal.k", W("s5", 13), 1),
      lin("ast.t", W("s5", 15), W("s5", 19), 0, 1, "in"), ...fx.flash(W("s5", 19), 12), ...fx.shake(W("s5", 19), 22),
      lin("shock", W("s5", 19), W("s5", 19) + 28, 0, 1, "out"), lin("crater", W("s5", 19), W("s5", 19) + 10, 0, 1, "out"),
    ],
    badges: [
      { text: "HÁ 66 MILHÕES DE ANOS", variant: "warning", appearAt: W("s5", 3), disappearAt: W("s5", 13) },
      { text: "CHICXULUB · MÉXICO", variant: "negative", subtitle: "O ASTEROIDE", appearAt: W("s5", 19) },
    ],
    highlights: ["SUMIRAM", "SESSENTA", "SEIS", "MILHÕES", "DINOSSAUROS", "ASTEROIDE", "MÉXICO"],
    captions: [cap("s5", 4, "Mas sumiram há sessenta e seis milhões de anos, junto com os dinossauros, depois do asteroide que caiu no México.")],
    audioCues: [narration("s5"), sfx("dust", W("s5", 10), 0.3), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("whoosh-big", W("s5", 15), 0.35), sfx("rumble", W("s5", 19), 0.45), sfx("thud", W("s5", 19), 0.4)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "E o vídeo? A Proteção Civil de Juárez diz que é entretenimento, e o mais provável é uma ave grande.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.moon), key(end(5), P.moon2, "inOut")] },
    objects: [{ id: "ju", type: "silhueta → ave grande", visible: true }, { id: "verdict", type: "VerdictMeter → BOATO", visible: true }],
    animations: [
      ...world(0, "ju"), ...fx.whipIn(-1), set("bg.dark", 0, 1), set("seal.k", 0, 0), set("fly.p", 0, 1), set("fly.h", 0, 0),
      set("fly.x", 0, -0.75), lin("fly.x", 0, W("s6", 12), -0.75, -0.05, "linear"), lin("fly.x", W("s6", 12), end(5), -0.05, 0.35, "linear"),
      lin("fly.p", W("s6", 15), W("s6", 18), 1, 0, "inOut"), lin("fly.h", W("s6", 15), W("s6", 18), 0, 1, "inOut"),
      pop("verdict", W("s6", 3)), set("needle", 0, 0), lin("needle", W("s6", 10), W("s6", 11) + 8, 0, -90, "out", "deg"), ...fx.shake(W("s6", 11), 14),
    ],
    badges: [
      { text: "PROTEÇÃO CIVIL: \"ENTRETENIMENTO\"", variant: "negative", appearAt: W("s6", 4), disappearAt: W("s6", 15) },
      { text: "MAIS PROVÁVEL: AVE GRANDE", variant: "info", appearAt: W("s6", 16) },
    ],
    highlights: ["VÍDEO", "PROTEÇÃO", "CIVIL", "ENTRETENIMENTO", "PROVÁVEL", "AVE", "GRANDE"],
    captions: [cap("s6", 5, "E o vídeo? A Proteção Civil de Juárez diz que é entretenimento, e o mais provável é uma ave grande.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.3), sfx("wind-cold", 2, 0.2), sfx("buzz", W("s6", 11), 0.3), sfx("thud", W("s6", 11), 0.3), sfx("shimmer", W("s6", 15), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Pronto: agora você sabe. Pterodáctilo vivo é boato. Mas eles já voaram ali, há setenta milhões de anos.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), ...cut(W("s7", 8), P.fin, P.cr), key(end(6), P.cr2, "inOut")] },
    objects: [{ id: "ju", type: "Juárez → Cretáceo", visible: true }, { id: "lines", type: "duas linhas de veredito", visible: true }],
    animations: [
      ...world(0, "ju"), ...fx.whipIn(), set("bg.dark", 0, 1), set("fly.p", 0, 0), set("fly.h", 0, 1), ...flyBy(4, 70), set("verdict", 0, 0),
      ...mascot.place(add(JU, M_STREET), 0.4, 0.29, 0), ...mascot.float(0, false, 1), ...mascot.look(0, 0.5),
      pop("lines", W("s7", 4)),
      ...world(W("s7", 8), "cr"), set("bg.dark", W("s7", 8), 0), ...fx.flash(W("s7", 8), 12), set("cr.x", W("s7", 8), 0), lin("cr.x", W("s7", 8), end(6), 0, 1, "linear"),
      ...mascot.place(add(CR, [1.5, 0, 1.4]), -0.5, 0.42, W("s7", 8)), ...mascot.wave(W("s7", 11), 40),
      popOut("lines", end(6) - 30, 10),
    ],
    badges: [],
    highlights: ["PRONTO", "SABE", "PTERODÁCTILO", "VIVO", "BOATO", "VOARAM", "SETENTA", "MILHÕES"],
    captions: [cap("s7", 6, "Pronto: agora você sabe. Pterodáctilo vivo é boato. Mas eles já voaram ali, há setenta milhões de anos.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.25), sfx("final", W("s7", 0), 0.35), sfx("thud", W("s7", 7), 0.3), sfx("whoosh-big", W("s7", 8), 0.3), sfx("bird-chirp", W("s7", 9), 0.25), sfx("ding", W("s7", 10), 0.3)],
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
