// scenes.ts — "Acharam a ARCA DE NOÉ?" (Boato ou Verdade #3). Roteiro v1 e designs APROVADOS (14/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, DRILL, FIRE, GEO, LAND, WOOD } from "./ark";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-historia", language: "pt-BR" };

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
const WORLDS = ["land", "wood", "geo", "drill", "fire"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const P = {
  vista: orbit(add(LAND, [-8, 8, -25]), 150, 18, 4),
  vista2: orbit(add(LAND, [-6, 6, -25]), 135, 10, 5),
  wood: orbit(add(WOOD, [0, -0.1, 0.05]), 3.8, 15, 55),
  wood2: orbit(add(WOOD, [0, -0.1, 0.05]), 3.3, 30, 58),
  aerial: orbit(add(LAND, [0, 0, 0]), 70, 35, 30),
  aerial2: orbit(add(LAND, [0, 0, 0]), 66, 50, 34),
  low: orbit(add(LAND, [0, -2, 0]), 48, 60, 6),
  crane: orbit(add(LAND, [0, -3, 0]), 62, 40, 55),
  top: orbit(add(LAND, [0, -2, 0]), 60, 0, 86),
  top2: orbit(add(LAND, [0, -2, 0]), 58, 8, 80),
  geo: orbit(add(GEO, [0, -0.1, 0]), 22, 0, 6),
  geo2: orbit(add(GEO, [0, -0.1, 0]), 20, 12, 10),
  drill: orbit(add(DRILL, [0.2, 1.3, 0]), 17, 25, 8),
  drill2: orbit(add(DRILL, [0.5, 0.7, 0.2]), 10, 40, 14),
  rings: orbit(add(FIRE, [0.5, 0.9, 0]), 13, 20, 8),
  fire: orbit(add(FIRE, [0.6, 0.6, 0]), 11, 20, 10),
  fire2: orbit(add(FIRE, [0.6, 0.6, 0]), 10, 32, 12),
  fin: orbit(add(FIRE, [0.6, 0.9, 0]), 15, -10, 8),
  fin2: orbit(add(FIRE, [0.6, 0.9, 0]), 15, 18, 9),
};

const ZERO = ["wood.k", "series.card", "verdict.show", "verdict.wobble", "verdict.big", "verdict.needle", "verdict.hit", "ruler.k", "ark.draw", "glow", "fold.k", "erode.t", "drill.t", "core.k", "labs.k", "wait.k", "rings.k", "boatq.k", "seal.k", "chk1", "chk2", "chk3", "mascot.float"];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Acharam a Arca de Noé? Essa semana, uma equipe mostrou pedaços de madeira queimada tirados de uma montanha na Turquia. Será verdade?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.vista), ...cut(W("s1", 10), P.vista2, P.wood), key(end(0), P.wood2, "linear")] },
    objects: [{ id: "land", type: "Planalto + Ararat", visible: true }, { id: "wood", type: "CharredWood", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "land"), ...ZERO.map((t) => set(t, 0, 0)), set("fold.k", 0, 1),
      whipMid(W("s1", 10)), ...world(W("s1", 10), "wood"), pop("wood.k", W("s1", 10)),
      ...mascot.place(add(WOOD, [0.75, 0, -0.35]), -0.9, 0.35, W("s1", 10)), ...mascot.float(0, false, 1), ...mascot.point(W("s1", 12), 40, -1.3), ...fx.punch(W("s1", 20)),
    ],
    badges: [
      { text: "ACHARAM A ARCA?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 1), disappearAt: W("s1", 10) },
      { text: "MADEIRA QUEIMADA", variant: "info", appearAt: W("s1", 11) },
    ],
    highlights: ["ARCA", "NOÉ", "SEMANA", "MADEIRA", "QUEIMADA", "TURQUIA", "VERDADE"],
    captions: [cap("s1", 0, "Acharam a Arca de Noé? Essa semana, uma equipe mostrou pedaços de madeira queimada tirados de uma montanha na Turquia. Será verdade?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("wind-cold", 0, 0.2), sfx("whoosh", W("s1", 10), 0.35), sfx("thud", W("s1", 20), 0.4)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Este é o Boato ou Verdade.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.aerial), key(end(1), P.aerial2, "linear")] },
    objects: [{ id: "seriesCard", type: "SeriesCard(BOATO OU VERDADE? · EP. 03)", visible: true }, { id: "verdict", type: "VerdictMeter2D", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "land"), ...mascot.hide(0, 2), set("wood.k", 0, 0), lin("series.card", 0, 10, 0, 1, "out"), lin("verdict.show", 6, 16, 0, 1, "out"), lin("verdict.wobble", 8, 16, 0, 1),
      lin("series.card", end(1) - 8, end(1), 1, 0, "in"), lin("verdict.show", end(1) - 8, end(1), 1, 0, "in"), lin("verdict.wobble", end(1) - 1, end(1), 1, 0),
    ],
    badges: [],
    highlights: ["BOATO", "VERDADE"],
    captions: [cap("s2", 1, "Este é o Boato ou Verdade.")],
    audioCues: [narration("s2"), sfx("badge", 0, 0.45)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "O lugar se chama Durupinar. Visto de cima, parece um barco gigante de 157 metros, perto do Monte Ararat.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.low), key(W("s3", 5), P.low, "linear"), key(W("s3", 9), P.crane, "inOut"), key(W("s3", 16), P.crane), key(end(2), P.vista2, "inOut")] },
    objects: [{ id: "durupinar", type: "Durupinar", visible: true }, { id: "ruler", type: "Régua 157 m", visible: true }],
    animations: [pop("ruler.k", W("s3", 13)), popOut("ruler.k", W("s3", 16), 8), set("seal.k", 0, 1)],
    badges: [
      { text: "DURUPINAR (TURQUIA)", variant: "info", appearAt: W("s3", 4), disappearAt: W("s3", 13) },
      { text: "157 METROS", variant: "info", size: "large", appearAt: W("s3", 13) },
    ],
    highlights: ["DURUPINAR", "CIMA", "BARCO", "GIGANTE", "157", "METROS", "ARARAT"],
    captions: [cap("s3", 2, "O lugar se chama Durupinar. Visto de cima, parece um barco gigante de 157 metros, perto do Monte Ararat.")],
    audioCues: [narration("s3"), sfx("whoosh-soft", 0, 0.3), sfx("wind-cold", 0, 0.2), sfx("tick", W("s3", 13), 0.3)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "E o tamanho bate com a Bíblia: trezentos côvados, uns cento e cinquenta metros. Por isso tem gente que jura que é a Arca.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.top), key(end(3), P.top2, "linear")] },
    objects: [{ id: "durupinar", type: "Durupinar(de cima)", visible: true }, { id: "ark", type: "ArkOutline(300 côvados)", visible: true }],
    animations: [...fx.whipIn(), set("seal.k", 0, 0), lin("ark.draw", W("s4", 7), W("s4", 13), 0, 1, "inOut"), pop("glow", W("s4", 19)), ...fx.punch(W("s4", 19))],
    badges: [
      { text: "300 CÔVADOS ≈ 150 M", variant: "info", appearAt: W("s4", 7), disappearAt: W("s4", 14) },
      { text: "O TAMANHO BATE", variant: "warning", appearAt: W("s4", 14) },
    ],
    highlights: ["TAMANHO", "BÍBLIA", "TREZENTOS", "CÔVADOS", "CINQUENTA", "JURA", "ARCA"],
    captions: [cap("s4", 3, "E o tamanho bate com a Bíblia: trezentos côvados, uns cento e cinquenta metros. Por isso tem gente que jura que é a Arca.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("shimmer", W("s4", 7), 0.35), sfx("glow", W("s4", 19), 0.35)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Só que, para os geólogos, é uma dobra natural de rocha e lama, que a erosão deixou com cara de casco.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.geo), key(end(4), P.geo2, "linear")] },
    objects: [{ id: "syncline", type: "SynclineBlock", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "geo"), set("glow", 0, 0), set("ark.draw", 0, 0), set("fold.k", 0, 0.15), lin("fold.k", W("s5", 6), W("s5", 10), 0.15, 1, "inOut"), lin("erode.t", W("s5", 14), end(4) - 4, 0, 1, "inOut"), set("seal.k", 0, 1)],
    badges: [
      { text: "GEÓLOGOS: FORMAÇÃO NATURAL", variant: "positive", appearAt: W("s5", 3), disappearAt: W("s5", 13) },
      { text: "A EROSÃO FEZ O \"CASCO\"", variant: "info", appearAt: W("s5", 13) },
    ],
    highlights: ["GEÓLOGOS", "DOBRA", "NATURAL", "ROCHA", "LAMA", "EROSÃO", "CASCO"],
    captions: [cap("s5", 4, "Só que, para os geólogos, é uma dobra natural de rocha e lama, que a erosão deixou com cara de casco.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.3), sfx("rumble-soft", W("s5", 7), 0.35), sfx("dust", W("s5", 15), 0.3)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "E a madeira? Saiu de uns nove metros de profundidade e foi para quatro laboratórios. Ainda não tem resultado.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.drill), key(end(5), P.drill2, "inOut")] },
    objects: [{ id: "drill", type: "DrillRig + Person", visible: true }, { id: "labs", type: "4 laboratórios 2D", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "drill"), set("seal.k", 0, 0), lin("drill.t", 0, W("s6", 9), 0, 1, "linear"), pop("core.k", W("s6", 9)), pop("labs.k", W("s6", 13)), pop("wait.k", W("s6", 15))],
    badges: [
      { text: "~9 M DE PROFUNDIDADE", variant: "info", appearAt: W("s6", 6), disappearAt: W("s6", 15) },
      { text: "RESULTADO: AINDA NÃO", variant: "warning", icon: "?", appearAt: W("s6", 15) },
    ],
    highlights: ["MADEIRA", "NOVE", "METROS", "PROFUNDIDADE", "QUATRO", "LABORATÓRIOS", "RESULTADO"],
    captions: [cap("s6", 5, "E a madeira? Saiu de uns nove metros de profundidade e foi para quatro laboratórios. Ainda não tem resultado.")],
    audioCues: [narration("s6"), sfx("drill", 0, 0.3), sfx("pop", W("s6", 13), 0.3), sfx("hourglass", W("s6", 15), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Mesmo se for antiga, a datação mostra a idade da madeira, não que ela era de um barco. O próprio líder da equipe admite: pode ser a fogueira de um pastor.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.rings), ...cut(W("s7", 24), P.rings, P.fire), key(end(6), P.fire2, "linear")] },
    objects: [{ id: "rings", type: "Anéis da madeira 2D ✔ / barco ✖", visible: true }, { id: "fire", type: "Campfire + pastor + ovelhas", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "fire"), set("labs.k", 0, 0), set("wait.k", 0, 0), set("core.k", 0, 0), lin("rings.k", W("s7", 4), W("s7", 8), 0, 1, "out"), pop("boatq.k", W("s7", 11)),
      popOut("rings.k", W("s7", 23), 6), popOut("boatq.k", W("s7", 23), 6), whipMid(W("s7", 24)),
    ],
    badges: [
      { text: "DATA ≠ BARCO", variant: "info", appearAt: W("s7", 11), disappearAt: W("s7", 24) },
      { text: "OU UMA FOGUEIRA?", variant: "warning", icon: "?", appearAt: W("s7", 26) },
    ],
    highlights: ["ANTIGA", "DATAÇÃO", "IDADE", "MADEIRA", "BARCO", "LÍDER", "ADMITE", "FOGUEIRA", "PASTOR"],
    captions: [cap("s7", 6, "Mesmo se for antiga, a datação mostra a idade da madeira, não que ela era de um barco. O próprio líder da equipe admite: pode ser a fogueira de um pastor.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.3), sfx("tick", W("s7", 11), 0.3), sfx("fire", W("s7", 24), 0.35)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Veredito: acharam a Arca? Sem prova. Pronto: agora você sabe o que falta pra essa história virar verdade.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "verdict", type: "VerdictMeter2D(grande)", visible: true }, { id: "checklist", type: "O que falta (3 itens)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      lin("verdict.big", 0, 12, 0, 1, "out"), { type: "spring", target: "verdict.needle", startFrame: W("s8", 4), endFrame: W("s8", 4) + 24, from: 0, to: -60, damping: 9, unit: "deg" },
      pop("verdict.hit", W("s8", 4)), ...fx.shake(W("s8", 4), 12), lin("verdict.big", W("s8", 6), W("s8", 6) + 10, 1, 0),
      pop("chk1", W("s8", 10)), pop("chk2", W("s8", 12)), pop("chk3", W("s8", 14)), ...["chk1", "chk2", "chk3"].map((t) => popOut(t, end(7) - s(5.3))),
      ...mascot.place(add(FIRE, [1.5, 0, 1.4]), -0.6, 0.9, 0), ...mascot.jump(W("s8", 4)), ...mascot.wave(W("s8", 7), 40),
    ],
    badges: [{ text: "VEREDITO: SEM PROVA", variant: "negative", size: "large", appearAt: W("s8", 4), disappearAt: W("s8", 9) }],
    highlights: ["VEREDITO", "ARCA", "SEM", "PROVA", "FALTA", "VERDADE"],
    captions: [cap("s8", 7, "Veredito: acharam a Arca? Sem prova. Pronto: agora você sabe o que falta pra essa história virar verdade.")],
    audioCues: [narration("s8"), sfx("alert-tone", W("s8", 4), 0.3), sfx("thud", W("s8", 4), 0.4), sfx("final", W("s8", 7), 0.35)],
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
