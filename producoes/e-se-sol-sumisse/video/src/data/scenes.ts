// scenes.ts — Boato ou Verdade #4: cidade perdida na Amazônia. Roteiro v1 e designs v2 APROVADOS (17–18/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, CAS, CAS_PERSON, FOR } from "./amz";

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
const WORLDS = ["for", "cas"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
export const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const P = {
  open: orbit(add(FOR, [0, 0.3, 0]), 26, 24, 38),
  open2: orbit(add(FOR, [0, 0.4, 0]), 20, 32, 30),
  rat: orbit(add(FOR, [0, 1.6, -0.3]), 21, 12, 16),
  rat2: orbit(add(FOR, [0, 1.6, -0.3]), 18.5, 24, 14),
  time: orbit(add(FOR, [0, 0.6, 0]), 21, 30, 22),
  time2: orbit(add(FOR, [0, 0.6, 0]), 22, 40, 24),
  boato: orbit(add(FOR, [0, 0.5, 0]), 16, 36, 28),
  lid: orbit(add(FOR, [-1.5, 0.9, 0]), 15, 12, 26),
  lid2: orbit(add(FOR, [1.6, 0.9, 0]), 15, 22, 24),
  up: orbit(add(FOR, [0, 0, 0.1]), 21, 8, 58),
  up2: orbit(add(FOR, [0.3, 0, 0.1]), 19, 22, 52),
  cas: orbit(add(CAS, [0.4, 0.8, 0.3]), 12, 28, 20),
  cas2: orbit(add(CAS, [1.0, 0.45, 0.7]), 6.8, 30, 14),
  fin: orbit(add(FOR, [0, 0.4, 0]), 20, -20, 34),
  fin2: orbit(add(FOR, [0, 0.4, 0]), 22, 14, 40),
};

const ZERO = ["series.card", "viral", "views", "ruler", "ruler.k", "dino", "human", "verdict", "needle", "plane", "revealed", "rat.k", "rat.crack", "count", "count.v", "htag", "seal.k", "sealI.k", "mascot.float", "ls", "lines"];
const sealOnly = (at: number, which: "seal.k" | "sealI.k" | "none"): TrackAnimation[] => [set("seal.k", at, which === "seal.k" ? 1 : 0), set("sealI.k", at, which === "sealI.k" ? 1 : 0)];
const M_FLY = add(FOR, [3.4, 1.6, 2.6]);

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Boato ou verdade: existe uma cidade perdida escondida debaixo da Amazônia?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.open), key(end(0), P.open2, "inOut")] },
    objects: [{ id: "for", type: "Rainforest", visible: true }, { id: "series", type: "SeriesCard BOATO OU VERDADE #4", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "for"), ...ZERO.map((t) => set(t, 0, 0)), set("trail", 0, 1),
      lin("series.card", W("s1", 0), W("s1", 0) + 10, 0, 1, "out"), popOut("series.card", W("s1", 4), 8), ...fx.punch(W("s1", 10)),
      ...mascot.place(M_FLY, -0.7, 0.42, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 3), 36),
    ],
    badges: [{ text: "CIDADE PERDIDA NA AMAZÔNIA?", variant: "warning", icon: "?", appearAt: W("s1", 5) }],
    highlights: ["BOATO", "VERDADE", "CIDADE", "PERDIDA", "ESCONDIDA", "AMAZÔNIA"],
    captions: [cap("s1", 0, "Boato ou verdade: existe uma cidade perdida escondida debaixo da Amazônia?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("bird-chirp", 4, 0.25), sfx("badge", W("s1", 0), 0.3), sfx("alert-tone", W("s1", 5), 0.2)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Em 2022, viralizou Ratanabá: uma cidade de 450 milhões de anos, cheia de pirâmides, que seria a capital do mundo.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.rat), key(end(1), P.rat2, "inOut")] },
    objects: [{ id: "rat", type: "RatanabaFake (pirâmides douradas)", visible: true }, { id: "viral", type: "ViralCard", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "for"), ...sealOnly(0, "none"), ...mascot.hide(0, 4),
      pop("viral", W("s2", 1)), lin("views", W("s2", 1), W("s2", 10), 0, 2400000, "out", "count"), popOut("viral", W("s2", 11), 8),
      lin("rat.k", W("s2", 3), W("s2", 13) + 10, 0, 1, "out"), ...fx.flash(W("s2", 13), 8), ...fx.shake(W("s2", 17), 12),
    ],
    badges: [
      { text: "2022: VIRALIZOU \"RATANABÁ\"", variant: "warning", appearAt: W("s2", 2), disappearAt: W("s2", 11) },
      { text: "\"CAPITAL DO MUNDO\" (ALEGAÇÃO)", variant: "warning", appearAt: W("s2", 14) },
    ],
    highlights: ["2022", "VIRALIZOU", "RATANABÁ", "450", "MILHÕES", "PIRÂMIDES", "CAPITAL", "MUNDO"],
    captions: [cap("s2", 1, "Em 2022, viralizou Ratanabá: uma cidade de 450 milhões de anos, cheia de pirâmides, que seria a capital do mundo.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.3), sfx("pop", W("s2", 1), 0.3), sfx("shimmer", W("s2", 5), 0.35), sfx("bells", W("s2", 13), 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Só que, há 450 milhões de anos, nem os dinossauros existiam. E o ser humano só apareceu há uns 300 mil anos.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.time), key(end(2), P.time2, "linear")] },
    objects: [{ id: "ruler", type: "TimeRuler (escala real)", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "for"), set("rat.k", 0, 1), lin("rat.crack", W("s3", 7), end(2), 0, 0.35, "linear"),
      pop("ruler", W("s3", 0)), lin("ruler.k", W("s3", 1), W("s3", 6), 0, 1, "inOut"), pop("dino", W("s3", 9)), pop("human", W("s3", 14)), ...fx.punch(W("s3", 19)),
    ],
    badges: [{ text: "NEM DINOSSAUROS EXISTIAM", variant: "negative", appearAt: W("s3", 9), disappearAt: W("s3", 14) }],
    highlights: ["450", "MILHÕES", "DINOSSAUROS", "HUMANO", "300", "MIL"],
    captions: [cap("s3", 2, "Só que, há 450 milhões de anos, nem os dinossauros existiam. E o ser humano só apareceu há uns 300 mil anos.")],
    audioCues: [narration("s3"), sfx("rewind", 0, 0.3), sfx("dino-call", W("s3", 9), 0.25), sfx("ding", W("s3", 14), 0.25)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Não existe nenhuma prova, e os arqueólogos são claros: Ratanabá é boato.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.boato), key(end(3), P.open2, "inOut")] },
    objects: [{ id: "rat", type: "Ratanabá virando pó", visible: true }, { id: "verdict", type: "VerdictMeter → BOATO", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "for"), set("rat.k", 0, 1), set("rat.crack", 0, 0.35), lin("rat.crack", W("s4", 3), W("s4", 11), 0.35, 1, "inOut"),
      pop("verdict", W("s4", 0)), set("needle", 0, 0), lin("needle", W("s4", 9), W("s4", 11) + 6, 0, -90, "out", "deg"), ...fx.shake(W("s4", 11), 16),
    ],
    badges: [{ text: "RATANABÁ: BOATO", variant: "negative", size: "large", appearAt: W("s4", 11) }],
    highlights: ["NENHUMA", "PROVA", "ARQUEÓLOGOS", "RATANABÁ", "BOATO"],
    captions: [cap("s4", 3, "Não existe nenhuma prova, e os arqueólogos são claros: Ratanabá é boato.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("crumble", W("s4", 5), 0.35), sfx("buzz", W("s4", 11), 0.3), sfx("thud", W("s4", 11), 0.35)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Mas aí vem a reviravolta: cidades antigas na Amazônia existem, sim. Quem achou foi um laser disparado de avião, o LiDAR, que enxerga o chão por baixo das árvores.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.lid), key(W("s5", 14), P.lid, "linear"), key(end(4), P.lid2, "linear")] },
    objects: [{ id: "for", type: "Rainforest + LidarPlane (varredura revela Upano)", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "for"), set("rat.k", 0, 0), set("rat.crack", 0, 1), lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      ...fx.flash(W("s5", 4), 8), ...fx.punch(W("s5", 4)),
      lin("plane", W("s5", 11), W("s5", 11) + 10, 0, 1, "out"), lin("scan.x", W("s5", 11), end(4), -5.4, 4.8, "linear"),
      ...mascot.place(add(FOR, [-3.6, 1.7, 2.6]), 0.8, 0.42, 0), ...mascot.float(0, true, 1), ...mascot.point(W("s5", 15), 40, 1.4),
    ],
    badges: [
      { text: "REVIRAVOLTA!", variant: "warning", size: "large", appearAt: W("s5", 4), disappearAt: W("s5", 11) },
      { text: "LIDAR: LASER QUE VÊ O CHÃO", variant: "info", appearAt: W("s5", 19) },
    ],
    highlights: ["REVIRAVOLTA", "CIDADES", "ANTIGAS", "EXISTEM", "LASER", "AVIÃO", "LIDAR", "CHÃO", "ÁRVORES"],
    captions: [cap("s5", 4, "Mas aí vem a reviravolta: cidades antigas na Amazônia existem, sim. Quem achou foi um laser disparado de avião, o LiDAR, que enxerga o chão por baixo das árvores.")],
    audioCues: [narration("s5"), sfx("record-scratch", W("s5", 3), 0.3), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("jet-flyby", W("s5", 12), 0.3), sfx("hum", W("s5", 15), 0.25)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "No Equador, ele revelou mais de seis mil plataformas de terra, ligadas por estradas retas, com cerca de 2.500 anos.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.up), key(end(5), P.up2, "inOut")] },
    objects: [{ id: "for", type: "Floresta transparente + Upano", visible: true }, { id: "count", type: "BigCount 6.000+", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "for"), set("plane", 0, 0), lin("revealed", 0, 14, 0.6, 1, "out"), ...sealOnly(0, "seal.k"), ...mascot.hide(0, 4),
      pop("count", W("s6", 4)), lin("count.v", W("s6", 4), W("s6", 8) + 6, 0, 6000, "out", "count"), popOut("count", W("s6", 15), 8),
    ],
    badges: [
      { text: "EQUADOR · VALE DO UPANO", variant: "info", subtitle: "SCIENCE, 2024", appearAt: W("s6", 1), disappearAt: W("s6", 16) },
      { text: "~2.500 ANOS", variant: "positive", appearAt: W("s6", 16) },
    ],
    highlights: ["EQUADOR", "SEIS", "MIL", "PLATAFORMAS", "TERRA", "ESTRADAS", "RETAS", "2.500", "ANOS"],
    captions: [cap("s6", 5, "No Equador, ele revelou mais de seis mil plataformas de terra, ligadas por estradas retas, com cerca de 2.500 anos.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.3), sfx("shimmer", W("s6", 4), 0.3), sfx("ding", W("s6", 16), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "E na Bolívia, apareceram pirâmides de terra de até 22 metros, com canais e represas.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.cas), key(W("s7", 8), P.cas, "linear"), key(end(6), P.cas2, "inOut")] },
    objects: [{ id: "cas", type: "CasarabeMound + mascote em escala real", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "cas"), ...sealOnly(0, "none"), set("cas.k", 0, 0), lin("cas.k", W("s7", 2), W("s7", 4) + 10, 0, 1, "out"), set("cas.w", 0, 0), lin("cas.w", W("s7", 11), W("s7", 14) + 10, 0, 1, "inOut"),
      ...mascot.place(add(CAS, CAS_PERSON), -0.6, 0.075, 0), ...mascot.float(0, false, 1), ...mascot.wave(W("s7", 10), 40),
      pop("htag", W("s7", 9)),
    ],
    badges: [{ text: "BOLÍVIA · CASARABE", variant: "info", subtitle: "NATURE, 2022", appearAt: W("s7", 1) }],
    highlights: ["BOLÍVIA", "PIRÂMIDES", "TERRA", "22", "METROS", "CANAIS", "REPRESAS"],
    captions: [cap("s7", 6, "E na Bolívia, apareceram pirâmides de terra de até 22 metros, com canais e represas.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.3), sfx("rumble-soft", W("s7", 2), 0.3), sfx("water-rise", W("s7", 11), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. Ratanabá é boato, mas a Amazônia já foi casa de cidades enormes, e o laser continua achando mais.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "for", type: "Floresta + avião passando de novo", visible: true }, { id: "verdict", type: "VerdictMeter duplo", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "for"), ...sealOnly(0, "none"), set("revealed", 0, 0), set("rat.k", 0, 0),
      pop("verdict", W("s8", 0)), set("needle", 0, -90), lin("needle", W("s8", 14), W("s8", 15) + 10, -90, 90, "out", "deg"), ...fx.flash(W("s8", 15), 8),
      pop("lines", W("s8", 4)), popOut("verdict", end(7) - s(5.2), 8), popOut("lines", end(7) - s(5.2), 8),
      lin("plane", W("s8", 17), W("s8", 17) + 8, 0, 1, "out"), lin("scan.x", W("s8", 17), end(7) - s(5.2), -5.4, 4.8, "linear"),
      ...mascot.place(M_FLY, -0.7, 0.42, 0), ...mascot.float(0, true, 1), ...mascot.cheer(W("s8", 14), 40),
    ],
    badges: [],
    highlights: ["PRONTO", "RATANABÁ", "BOATO", "AMAZÔNIA", "CIDADES", "ENORMES", "LASER"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. Ratanabá é boato, mas a Amazônia já foi casa de cidades enormes, e o laser continua achando mais.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.3), sfx("final", W("s8", 0), 0.4), sfx("thud", W("s8", 5), 0.3), sfx("ding", W("s8", 15), 0.35), sfx("jet-flyby", W("s8", 17), 0.25)],
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
