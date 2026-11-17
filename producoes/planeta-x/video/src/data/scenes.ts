// scenes.ts — "Existe um Planeta X?" (pergunta do 1º inscrito). Roteiro v1 e designs APROVADOS (17/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, DEEP, NIB, OBS, OLD, P9W, PLU, SOL } from "./px";

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
const cut = (at: number, hold: Pose, next: Pose): CameraKey[] => [key(at - 1, hold), key(at, next)];
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");
const WORLDS = ["deep", "old", "plu", "nib", "sol", "p9", "obs"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const XS: [number, number, number] = [-18, 4, 7]; // silhueta do "Planeta X" no mundo DEEP
const P = {
  inner: orbit(add(DEEP, [0, -1.2, 0]), 42, 100, 26),
  pair: orbit(add(DEEP, [-8, 0.5, 3]), 64, 111, 38),
  pair2: orbit(add(DEEP, [-8.5, 0.5, 3.4]), 60, 106, 34),
  xclose: orbit(add(DEEP, XS), 20, 111, 14),
  old: orbit(add(OLD, [-0.2, 0.7, 0]), 24, 18, 9),
  old2: orbit(add(OLD, [-0.2, 0.8, 0]), 19, 30, 7),
  plu: orbit(add(PLU, [0.3, -0.6, 0]), 25, -8, 6),
  plu2: orbit(add(PLU, [0.4, -0.7, 0]), 22, 8, 8),
  nib: orbit(add(NIB, [-0.4, 0.6, 0]), 28, 12, 6),
  nib2: orbit(add(NIB, [-0.2, 0.2, 0]), 24, 2, 4),
  p9: orbit(add(P9W, [0, -0.6, 0]), 26, 18, 8),
  p9b: orbit(add(P9W, [0, -0.6, 0]), 23, 30, 6),
  sol: orbit(add(SOL, [10, 0, 0]), 140, -90, 72),
  sol2: orbit(add(SOL, [27, 0, -2]), 190, -84, 76),
  solFar: orbit(add(SOL, [26, 0, 0]), 170, -90, 74),
  solFar2: orbit(add(SOL, [-18, 0, 0]), 345, -90, 80),
  mass: orbit(add(P9W, [0.3, -1.0, 0]), 24, 14, 4),
  mass2: orbit(add(P9W, [0.3, -1.0, 0]), 22, 24, 6),
  dark: orbit(add(P9W, [-0.5, 0.8, 0]), 24, -18, 6),
  dark2: orbit(add(P9W, [-1.0, -1.2, 0]), 34, -22, 8),
  obs: orbit(add(OBS, [0.3, 0.3, 0]), 24, 28, 12),
  obs2: orbit(add(OBS, [0.4, 0.4, 0]), 20, 18, 9),
  slit: orbit(add(OBS, [0.85, 1.6, -0.15]), 6.5, 26, 32),
  slit2: orbit(add(OBS, [0.85, 1.7, -0.15]), 5.4, 28, 40),
  fin: orbit(add(DEEP, [-8, 0.5, 3]), 66, 118, 36),
  fin2: orbit(add(DEEP, [-8, 0.5, 3]), 62, 100, 44),
};

const ZERO = ["x.k", "x.lit", "pluto.k", "nib.t", "orb.k", "p9.k", "pull", "p9.orb", "p9.dark", "earth.k", "farsun.k", "years", "earths", "stamp", "dates", "seal.k", "sealI.k", "mascot.float", "ls"];
const sealOnly = (at: number, which: "seal.k" | "sealI.k" | "none"): TrackAnimation[] => [set("seal.k", at, which === "seal.k" ? 1 : 0), set("sealI.k", at, which === "sealI.k" ? 1 : 0)];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Existe um Planeta X escondido no Sistema Solar? Essa foi a primeira pergunta de um inscrito do canal. Bora abrir essa fenda.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.inner), key(W("s1", 3), P.pair, "inOut"), key(W("s1", 18), P.pair2, "linear"), key(end(0), P.xclose, "inOut")] },
    objects: [{ id: "deep", type: "SolarSystem + silhueta escura", visible: true }, { id: "comment", type: "Balão de comentário 2D", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "deep"), ...ZERO.map((t) => set(t, 0, 0)),
      pop("x.k", W("s1", 3)), ...fx.punch(W("s1", 3)),
      ...mascot.place(add(DEEP, [2, 10, -1]), 1.6, 1.7, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 9), 40),
      lin("comment", W("s1", 8), W("s1", 8) + 10, 0, 1, "out"), popOut("comment", W("s1", 18), 8),
      lin("x.lit", W("s1", 19), end(0), 0, 1, "inOut"), ...fx.flash(W("s1", 19), 8),
    ],
    badges: [{ text: "PLANETA X?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 3), disappearAt: W("s1", 8) }],
    highlights: ["PLANETA", "X", "ESCONDIDO", "SISTEMA", "SOLAR", "PRIMEIRA", "PERGUNTA", "INSCRITO", "FENDA"],
    captions: [cap("s1", 0, "Existe um Planeta X escondido no Sistema Solar? Essa foi a primeira pergunta de um inscrito do canal. Bora abrir essa fenda.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("alert-tone", W("s1", 3), 0.25), sfx("pop", W("s1", 8), 0.3), sfx("whoosh", W("s1", 19), 0.35)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "A busca é antiga. Há mais de cem anos, Percival Lowell procurou um Planeta X depois de Netuno. Em 1930, acharam Plutão, pequeno demais pra ser ele.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.old), ...cut(W("s2", 18), P.old2, P.plu), key(end(1), P.plu2, "linear")] },
    objects: [{ id: "old", type: "OldObservatory (sépia)", visible: true }, { id: "plu", type: "Netuno × Plutão", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "old"), ...mascot.hide(0, 4), ...fx.desaturate(0, W("s2", 18), 0.45), ...sealOnly(0, "none"),
      whipMid(W("s2", 18)), ...world(W("s2", 18), "plu"), pop("pluto.k", W("s2", 21)), ...fx.punch(W("s2", 22)),
    ],
    badges: [
      { text: "HÁ MAIS DE 100 ANOS", variant: "info", appearAt: W("s2", 4), disappearAt: W("s2", 9) },
      { text: "PERCIVAL LOWELL", variant: "info", subtitle: "PROCUROU O \"PLANETA X\" APÓS NETUNO", appearAt: W("s2", 9), disappearAt: W("s2", 18) },
      { text: "1930: PLUTÃO", variant: "positive", appearAt: W("s2", 19), disappearAt: W("s2", 22) },
      { text: "PEQUENO DEMAIS", variant: "negative", subtitle: "MENOR QUE A NOSSA LUA", appearAt: W("s2", 22) },
    ],
    highlights: ["ANTIGA", "CEM", "ANOS", "PERCIVAL", "LOWELL", "NETUNO", "1930", "PLUTÃO", "PEQUENO", "DEMAIS"],
    captions: [cap("s2", 1, "A busca é antiga. Há mais de cem anos, Percival Lowell procurou um Planeta X depois de Netuno. Em 1930, acharam Plutão, pequeno demais pra ser ele.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.35), sfx("tick", W("s2", 9), 0.25), sfx("whoosh-soft", W("s2", 18), 0.3), sfx("ding", W("s2", 21), 0.3), sfx("thud", W("s2", 22), 0.35)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Na internet, o Planeta X virou Nibiru, que ia bater na Terra em 2003, depois em 2012, depois em 2017. Nunca apareceu.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.nib), key(W("s3", 20), P.nib2, "inOut"), key(end(2), P.nib2, "linear")] },
    objects: [{ id: "nib", type: "Nibiru (desenho) × Terra", visible: true }, { id: "dates", type: "Datas 2D riscadas + carimbo BOATO", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "nib"), set("nib.k", 0, 1), lin("nib.t", W("s3", 5), W("s3", 20), 0, 0.9, "linear"),
      lin("dates", W("s3", 13), W("s3", 13) + 1, 0, 1, "linear"), lin("dates", W("s3", 16), W("s3", 16) + 1, 1, 2, "linear"), lin("dates", W("s3", 19), W("s3", 19) + 1, 2, 3, "linear"),
      popOut("nib.k", W("s3", 20), 10), ...fx.flash(W("s3", 20), 8), pop("stamp", W("s3", 20) + 4), ...fx.shake(W("s3", 20) + 4, 16),
    ],
    badges: [{ text: "BOATO DA INTERNET", variant: "warning", appearAt: W("s3", 5), disappearAt: W("s3", 20) }],
    highlights: ["INTERNET", "NIBIRU", "BATER", "TERRA", "2003", "2012", "2017", "NUNCA", "APARECEU"],
    captions: [cap("s3", 2, "Na internet, o Planeta X virou Nibiru, que ia bater na Terra em 2003, depois em 2012, depois em 2017. Nunca apareceu.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.35), sfx("rumble-soft", W("s3", 6), 0.3), sfx("buzz", W("s3", 13) + 8, 0.25), sfx("buzz", W("s3", 16) + 8, 0.25), sfx("buzz", W("s3", 19) + 8, 0.25), sfx("thud", W("s3", 20) + 4, 0.45)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Mas existe uma versão séria: o Planeta Nove. Em 2016, dois astrônomos notaram que objetos depois de Netuno têm órbitas alinhadas, como se algo puxasse.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.p9), ...cut(W("s4", 8), P.p9b, P.sol), key(W("s4", 22), P.sol, "linear"), key(end(3), P.sol2, "inOut")] },
    objects: [{ id: "p9", type: "PlanetNine (ilustração)", visible: true }, { id: "sol", type: "SolarSystem + AlignedOrbits + puxão", visible: true }, { id: "ls", type: "LikeSubscribe (lateral)", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "p9"), set("p9.dark", 0, 0), set("earth.k", 0, 0), set("farsun.k", 0, 0), ...sealOnly(0, "sealI.k"), lin("ls", 10, 90, 0, 80, "linear", "count"),
      whipMid(W("s4", 8)), ...world(W("s4", 8), "sol"), ...sealOnly(W("s4", 8), "seal.k"),
      lin("orb.k", W("s4", 14), W("s4", 20) + 10, 0, 1, "inOut"), pop("p9.k", W("s4", 23)), lin("pull", W("s4", 23), W("s4", 23) + 12, 0, 1, "out"), ...fx.punch(W("s4", 23)),
    ],
    badges: [
      { text: "PLANETA NOVE", variant: "info", subtitle: "HIPÓTESE CIENTÍFICA", appearAt: W("s4", 6), disappearAt: W("s4", 8) },
      { text: "2016 · CALTECH", variant: "info", subtitle: "BATYGIN E BROWN", appearAt: W("s4", 9), disappearAt: W("s4", 19) },
      { text: "ÓRBITAS ALINHADAS", variant: "warning", appearAt: W("s4", 19), disappearAt: W("s4", 23) },
      { text: "ALGO PUXANDO?", variant: "warning", icon: "?", size: "large", appearAt: W("s4", 23) },
    ],
    highlights: ["SÉRIA", "PLANETA", "NOVE", "2016", "ASTRÔNOMOS", "OBJETOS", "NETUNO", "ÓRBITAS", "ALINHADAS", "PUXASSE"],
    captions: [cap("s4", 3, "Mas existe uma versão séria: o Planeta Nove. Em 2016, dois astrônomos notaram que objetos depois de Netuno têm órbitas alinhadas, como se algo puxasse.")],
    audioCues: [narration("s4"), sfx("rewind", 0, 0.3), sfx("click", 10 + 18, 0.3), sfx("click", 10 + 38, 0.3), sfx("whoosh-soft", W("s4", 8), 0.3), sfx("shimmer", W("s4", 14), 0.3), sfx("warp", W("s4", 23), 0.35)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "A conta sugere um planeta de cinco a dez vezes a massa da Terra, tão longe que uma volta no Sol levaria dez mil anos ou mais.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.mass), ...cut(W("s5", 14), P.mass2, P.solFar), key(end(4), P.solFar2, "inOut")] },
    objects: [{ id: "p9", type: "PlanetNine + Terra", visible: true }, { id: "earths", type: "Fileira 2D de Terras (5–10)", visible: true }, { id: "sol", type: "Órbita do Planeta Nove + contador", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "p9"), ...sealOnly(0, "sealI.k"), pop("earth.k", W("s5", 11)),
      lin("earths", W("s5", 6), W("s5", 6) + 10, 0, 5, "out", "count"), lin("earths", W("s5", 8), W("s5", 8) + 10, 5, 10, "out", "count"),
      ...mascot.place(add(P9W, [-1.9, -2.6, 1.8]), 0.5, 0.55, 0), ...mascot.float(0, true, 1), ...mascot.point(W("s5", 3), 40, 0.4),
      whipMid(W("s5", 14)), ...world(W("s5", 14), "sol"), ...mascot.hide(W("s5", 14), 1), ...sealOnly(W("s5", 14), "seal.k"), set("orb.k", W("s5", 14), 1), set("p9.k", W("s5", 14), 1), set("pull", W("s5", 14), 0),
      lin("p9.orb", W("s5", 16), W("s5", 24) + 6, 0, 1, "inOut"), lin("years", W("s5", 18), W("s5", 24), 0, 10000, "out", "count"),
    ],
    badges: [
      { text: "5 A 10× A MASSA DA TERRA", variant: "info", appearAt: W("s5", 6), disappearAt: W("s5", 14) },
      { text: "1 VOLTA: 10 MIL+ ANOS", variant: "warning", appearAt: W("s5", 22) },
    ],
    highlights: ["CONTA", "CINCO", "DEZ", "MASSA", "TERRA", "LONGE", "VOLTA", "MIL", "ANOS"],
    captions: [cap("s5", 4, "A conta sugere um planeta de cinco a dez vezes a massa da Terra, tão longe que uma volta no Sol levaria dez mil anos ou mais.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.35), sfx("pop", W("s5", 6), 0.25), sfx("pop", W("s5", 8), 0.25), sfx("whoosh-soft", W("s5", 14), 0.3), sfx("hourglass", W("s5", 18), 0.25)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "E por que ninguém viu? Lá fora, a luz do Sol é fraquíssima, e o planeta seria escuro e lento no céu.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.dark), key(W("s6", 13), P.dark, "linear"), key(end(5), P.dark2, "inOut")] },
    objects: [{ id: "p9", type: "PlanetNine escurecendo + Sol distante", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "p9"), ...sealOnly(0, "sealI.k"), set("earth.k", 0, 0), set("p9.dark", 0, 0),
      pop("farsun.k", W("s6", 8)), lin("p9.dark", W("s6", 9), W("s6", 12) + 10, 0, 0.88, "inOut"),
    ],
    badges: [
      { text: "POR QUE NINGUÉM VIU?", variant: "warning", icon: "?", appearAt: W("s6", 1), disappearAt: W("s6", 8) },
      { text: "LUZ 250 MIL× MAIS FRACA", variant: "info", subtitle: "SE ELE ESTIVER A ~500 UA", appearAt: W("s6", 12), disappearAt: W("s6", 17) },
      { text: "ESCURO E LENTO", variant: "negative", appearAt: W("s6", 17) },
    ],
    highlights: ["NINGUÉM", "VIU", "LUZ", "SOL", "FRAQUÍSSIMA", "ESCURO", "LENTO"],
    captions: [cap("s6", 5, "E por que ninguém viu? Lá fora, a luz do Sol é fraquíssima, e o planeta seria escuro e lento no céu.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.35), sfx("glow", W("s6", 8), 0.3), sfx("power-down", W("s6", 10), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Agora, o observatório Vera Rubin está varrendo o céu. Os próprios autores dizem: ou ele aparece, ou a hipótese cai.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.obs), ...cut(W("s7", 9), P.obs2, P.slit), key(end(6), P.slit2, "linear")] },
    objects: [{ id: "obs", type: "ObservatoryV2 (noite)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "obs"), ...sealOnly(0, "none"), set("scan", 0, 0.1), lin("scan", W("s7", 5), W("s7", 9), 0.1, 0.6, "inOut"),
      ...mascot.place(add(OBS, [-0.25, 0.0, 1.25]), 0.4, 0.3, 0), ...mascot.float(0, false, 1), ...mascot.point(W("s7", 2), 40, 0.6),
      ...mascot.hide(W("s7", 9), 1), ...fx.punch(W("s7", 15)),
    ],
    badges: [
      { text: "OBSERVATÓRIO VERA RUBIN", variant: "info", subtitle: "CHILE · VARRE O CÉU TODO", appearAt: W("s7", 3), disappearAt: W("s7", 13) },
      { text: "OU ELE APARECE", variant: "positive", appearAt: W("s7", 13) },
      { text: "OU A HIPÓTESE CAI", variant: "negative", appearAt: W("s7", 16) },
    ],
    highlights: ["OBSERVATÓRIO", "VERA", "RUBIN", "VARRENDO", "CÉU", "AUTORES", "APARECE", "HIPÓTESE", "CAI"],
    captions: [cap("s7", 6, "Agora, o observatório Vera Rubin está varrendo o céu. Os próprios autores dizem: ou ele aparece, ou a hipótese cai.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.35), sfx("hydraulic", W("s7", 5), 0.3), sfx("whoosh-soft", W("s7", 9), 0.3), sfx("ding", W("s7", 13), 0.3), sfx("thud", W("s7", 16), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. Nibiru é boato. O Planeta Nove ainda é uma pergunta aberta, e a resposta pode estar perto.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "deep", type: "SolarSystem + Planeta X iluminado", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "deep"), set("x.k", 0, 1), set("x.lit", 0, 1), ...sealOnly(0, "sealI.k"),
      ...mascot.place(add(DEEP, [-1, 9, 3]), 1.6, 2.0, 0), ...mascot.float(0, true, 1), ...mascot.cheer(W("s8", 1), 40), ...mascot.wave(W("s8", 15), 40),
    ],
    badges: [
      { text: "NIBIRU: BOATO", variant: "negative", appearAt: W("s8", 4), disappearAt: end(7) - s(5.3) },
      { text: "PLANETA NOVE: EM ABERTO", variant: "warning", icon: "?", appearAt: W("s8", 7), disappearAt: end(7) - s(5.3) },
    ],
    highlights: ["PRONTO", "NIBIRU", "BOATO", "PLANETA", "NOVE", "PERGUNTA", "ABERTA", "RESPOSTA", "PERTO"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. Nibiru é boato. O Planeta Nove ainda é uma pergunta aberta, e a resposta pode estar perto.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.3), sfx("final", W("s8", 0), 0.4), sfx("thud", W("s8", 4), 0.3)],
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
