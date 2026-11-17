// scenes.ts — "Por que 2026 está tão quente?". Roteiro v1.1 e designs APROVADOS (17/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { LS_LEN, likeSubscribeSfx } from "../components/LikeSubscribe";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { escalatorTop } from "../components/Heat";
import { add, EARTH, ESC, PAC } from "./heat";

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
const WORLDS = ["earth", "esc", "pac"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
export const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const P = {
  e1: orbit(add(EARTH, [0, -0.6, 0]), 24, 20, 12),
  e2: orbit(add(EARTH, [0, -0.5, 0]), 20, 34, 10),
  e3: orbit(add(EARTH, [-0.6, 0.0, 0]), 22, 40, 8),
  e4: orbit(add(EARTH, [-0.6, 0.0, 0]), 20, 52, 12),
  esc: orbit(add(ESC, [2.3, 2.3, -0.8]), 25, 24, 16),
  esc2: orbit(add(ESC, [2.5, 2.4, -0.8]), 23, 32, 13),
  pac: orbit(add(PAC, [0.4, 0.2, 0]), 30, 68, 30),
  pac2: orbit(add(PAC, [0.8, 0.3, 0]), 27, 58, 26),
  pacB: orbit(add(PAC, [0.8, 0.4, 0]), 28, 62, 30),
  pacB2: orbit(add(PAC, [0.8, 0.4, 0]), 30, 72, 26),
  graph: orbit(add(EARTH, [0, 0, 0]), 16, 60, 6),
  graph2: orbit(add(EARTH, [0, 0, 0]), 16, 80, 6),
  fin: orbit(add(ESC, [2.3, 2.4, -0.8]), 25, 16, 14),
  fin2: orbit(add(ESC, [2.5, 2.6, -0.8]), 23, 34, 12),
};
/** Mascote parado num degrau: sobe junto (0,01 u3d/frame em x com speed 0,02). */
const ride = (k0: number, from: number, to: number, rotY = 1.2, scale = 0.8): TrackAnimation[] => {
  const a = add(ESC, escalatorTop(k0));
  const b = add(a, [(to - from) * 0.5 * 0.02, (to - from) * 0.36 * 0.02, 0]);
  return [...mascot.place(a, rotY, scale, from), lin("mascot.x", from + 1, to, a[0], b[0], "linear"), lin("mascot.y", from + 1, to, a[1], b[1], "linear")];
};

const ZERO = ["blanket.k", "smoke", "sun", "heat", "trapped", "hot", "cal", "podium", "y2027", "thermo.glow", "warm", "plumes", "temp", "bars", "avg", "graph", "seal.k", "sealI.k", "mascot.float", "ls", "years.k", "blink"];
const sealOnly = (at: number, which: "seal.k" | "sealI.k" | "none"): TrackAnimation[] => [set("seal.k", at, which === "seal.k" ? 1 : 0), set("sealI.k", at, which === "sealI.k" ? 1 : 0)];
const M_EARTH = add(EARTH, [1.9, 0.2, 2.2]);

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Outubro de 2026 foi o mais quente já medido no planeta. E o ano deve fechar como o segundo mais quente da história. Por quê?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.e1), key(end(0), P.e2, "inOut")] },
    objects: [{ id: "earth", type: "Terra quente", visible: true }, { id: "cal", type: "RecordCalendar", visible: true }, { id: "podium", type: "HeatPodium", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "earth"), ...ZERO.map((t) => set(t, 0, 0)), set("hot", 0, 0.6), set("thermo.v", 0, 0.3),
      pop("cal", W("s1", 0)), lin("cal.stamp", W("s1", 5), W("s1", 5) + 8, 0, 1, "out"), ...fx.punch(W("s1", 5)), popOut("cal", W("s1", 11), 8),
      pop("podium", W("s1", 13)), lin("podium.k", W("s1", 13), W("s1", 20), 0, 1, "out"), popOut("podium", W("s1", 23) - 4, 8), ...fx.shake(W("s1", 23), 12),
      ...mascot.place(M_EARTH, -0.6, 0.45, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 0) + 4, 36), ...mascot.jump(W("s1", 23)),
    ],
    badges: [
      { text: "OUTUBRO/2026: RECORDE", variant: "negative", appearAt: W("s1", 5), disappearAt: W("s1", 13) },
      { text: "2026: 2º MAIS QUENTE (PREVISÃO)", variant: "warning", appearAt: W("s1", 18) },
    ],
    highlights: ["OUTUBRO", "2026", "QUENTE", "MEDIDO", "SEGUNDO", "HISTÓRIA", "POR", "QUÊ"],
    captions: [cap("s1", 0, "Outubro de 2026 foi o mais quente já medido no planeta. E o ano deve fechar como o segundo mais quente da história. Por quê?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("pop", W("s1", 0), 0.3), sfx("thud", W("s1", 5), 0.35), sfx("badge", W("s1", 13), 0.3), sfx("alert-tone", W("s1", 23), 0.2)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Pensa na Terra debaixo de um cobertor. Os gases que a gente solta, como o gás carbônico, engrossam esse cobertor, e o calor não consegue sair.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.e3), key(end(1), P.e4, "inOut")] },
    objects: [{ id: "earth", type: "Terra + cobertor + setas + fumaça", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "earth"), ...sealOnly(0, "seal.k"), set("hot", 0, 0.6),
      lin("blanket.k", W("s2", 5), W("s2", 6) + 10, 0, 0.3, "out"), lin("sun", W("s2", 3), W("s2", 6), 0, 1, "inOut"), lin("heat", W("s2", 6), W("s2", 8) + 8, 0, 1, "inOut"),
      lin("smoke", W("s2", 12), W("s2", 16), 0, 1, "inOut"), lin("blanket.k", W("s2", 17), W("s2", 19) + 12, 0.3, 1, "inOut"), lin("trapped", W("s2", 22), W("s2", 25) + 6, 0, 1, "inOut"), lin("hot", W("s2", 22), end(1), 0.6, 1, "inOut"),
      ...mascot.place(add(EARTH, [1.9, -0.9, 2.2]), -0.6, 0.45, 0), ...mascot.float(0, true, 1), ...mascot.point(W("s2", 16), 40, -0.9),
    ],
    badges: [
      { text: "EFEITO ESTUFA", variant: "info", subtitle: "OS GASES FUNCIONAM COMO UM COBERTOR", appearAt: W("s2", 5), disappearAt: W("s2", 15) },
      { text: "MAIS CO₂ = COBERTOR MAIS GROSSO", variant: "negative", appearAt: W("s2", 17) },
    ],
    highlights: ["TERRA", "COBERTOR", "GASES", "GÁS", "CARBÔNICO", "ENGROSSAM", "CALOR", "SAIR"],
    captions: [cap("s2", 1, "Pensa na Terra debaixo de um cobertor. Os gases que a gente solta, como o gás carbônico, engrossam esse cobertor, e o calor não consegue sair.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.3), sfx("shimmer", W("s2", 3), 0.25), sfx("dust", W("s2", 12), 0.3), sfx("glow", W("s2", 22), 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Isso faz a temperatura subir devagar, ano após ano, como numa escada rolante.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.esc), key(end(2), P.esc2, "linear")] },
    objects: [{ id: "esc", type: "Escalator + Thermometer3D + mascote no degrau", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "esc"), ...sealOnly(0, "none"), ...mascot.float(0, false, 1), ...ride(0.08, 0, end(2)),
      lin("thermo.v", 0, end(2), 0.3, 0.5, "linear"), lin("years.k", W("s3", 6), W("s3", 8) + 10, 0, 3, "linear", "count"),
    ],
    badges: [{ text: "AQUECIMENTO = ESCADA ROLANTE", variant: "warning", appearAt: W("s3", 9) }],
    highlights: ["TEMPERATURA", "SUBIR", "DEVAGAR", "ANO", "ESCADA", "ROLANTE"],
    captions: [cap("s3", 2, "Isso faz a temperatura subir devagar, ano após ano, como numa escada rolante.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.3), sfx("hum", 0, 0.25), sfx("tick", W("s3", 6), 0.25), sfx("tick", W("s3", 8), 0.25)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Mas em 2026 apareceu um empurrão extra: o El Niño. A água do Pacífico esquenta muito e solta esse calor no ar do planeta inteiro.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.pac), key(end(3), P.pac2, "inOut")] },
    objects: [{ id: "pac", type: "PacificSlice (normal → El Niño)", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "pac"), ...mascot.hide(0, 1), ...sealOnly(0, "seal.k"),
      lin("warm", W("s4", 8), W("s4", 15) + 10, 0, 1, "inOut"), lin("plumes", W("s4", 17), W("s4", 21), 0, 1, "inOut"), ...fx.punch(W("s4", 8)),
    ],
    badges: [
      { text: "EL NIÑO", variant: "warning", subtitle: "VENTOS FRACOS · ÁGUA QUENTE VAI PARA LESTE", appearAt: W("s4", 8), disappearAt: W("s4", 17) },
      { text: "PACÍFICO SOLTA CALOR NO AR", variant: "negative", appearAt: W("s4", 17) },
    ],
    highlights: ["2026", "EMPURRÃO", "EXTRA", "EL", "NIÑO", "PACÍFICO", "ESQUENTA", "CALOR", "PLANETA"],
    captions: [cap("s4", 3, "Mas em 2026 apareceu um empurrão extra: o El Niño. A água do Pacífico esquenta muito e solta esse calor no ar do planeta inteiro.")],
    audioCues: [narration("s4"), sfx("whoosh", 0, 0.3), sfx("ocean-amb", 0, 0.25), sfx("alert-tone", W("s4", 8), 0.2), sfx("fire", W("s4", 14), 0.25), sfx("rush", W("s4", 17), 0.3)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "E este El Niño é um dos mais fortes já vistos. Em outubro, a Terra ficou um grau e setenta e cinco acima da época antes das fábricas.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.esc), key(end(4), P.esc2, "inOut")] },
    objects: [{ id: "esc", type: "Escada + PULO do mascote + termômetro dispara", visible: true }, { id: "temp", type: "TempCounter", visible: true }, { id: "ls", type: "LikeSubscribe", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "esc"), ...sealOnly(0, "none"), ...mascot.float(0, false, 1), ...ride(0.2, 0, end(4)), lin("ls", 10, 10 + LS_LEN, 0, LS_LEN, "linear", "count"),
      set("thermo.v", 0, 0.5), lin("mascot.jump", W("s5", 8), W("s5", 8) + 9, 0, 1.6, "out"), lin("mascot.jump", W("s5", 8) + 9, W("s5", 8) + 20, 1.6, 0, "in"), ...mascot.cheer(W("s5", 8), 30),
      lin("thermo.v", W("s5", 8), W("s5", 8) + 14, 0.5, 0.95, "out"), lin("thermo.v", W("s5", 8) + 14, W("s5", 8) + 26, 0.95, 0.88, "inOut"), lin("thermo.glow", W("s5", 8), W("s5", 8) + 10, 0, 1, "out"), ...fx.shake(W("s5", 8) + 6, 16),
      pop("temp", W("s5", 16)), lin("temp.v", W("s5", 16), W("s5", 21) + 6, 1.0, 1.75, "out"),
    ],
    badges: [
      { text: "UM DOS EL NIÑOS MAIS FORTES", variant: "warning", appearAt: W("s5", 5), disappearAt: W("s5", 16) },
      { text: "VS. ANTES DAS FÁBRICAS (PRÉ-INDUSTRIAL)", variant: "info", appearAt: W("s5", 23) },
    ],
    highlights: ["EL", "NIÑO", "FORTES", "OUTUBRO", "GRAU", "SETENTA", "CINCO", "FÁBRICAS"],
    captions: [cap("s5", 4, "E este El Niño é um dos mais fortes já vistos. Em outubro, a Terra ficou um grau e setenta e cinco acima da época antes das fábricas.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.3), sfx("hum", 0, 0.2), ...likeSubscribeSfx(10).map((c) => sfx(c.name, c.at, c.volume)), sfx("launch", W("s5", 8), 0.35), sfx("ding", W("s5", 16), 0.3)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Só que o calor do El Niño chega no ar com uns meses de atraso. Por isso, uma análise dá 96% de chance de 2027 bater o recorde.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.pacB), key(end(5), P.pacB2, "inOut")] },
    objects: [{ id: "pac", type: "Pacífico El Niño (calor subindo devagar)", visible: true }, { id: "podium", type: "HeatPodium + 2027?", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "pac"), ...mascot.hide(0, 1), ...sealOnly(0, "seal.k"), set("warm", 0, 1), set("plumes", 0, 0.6), lin("plumes", W("s6", 7), W("s6", 14), 0.6, 1, "inOut"),
      pop("podium", W("s6", 15)), set("podium.k", W("s6", 15), 1), lin("y2027", W("s6", 24), W("s6", 24) + 18, 0, 1, "out"), ...fx.punch(W("s6", 20)),
    ],
    badges: [
      { text: "⏳ O CALOR CHEGA COM ATRASO", variant: "info", appearAt: W("s6", 10), disappearAt: W("s6", 15) },
      { text: "2027: 96% DE CHANCE DE RECORDE", variant: "warning", subtitle: "ANÁLISE DA CARBON BRIEF", appearAt: W("s6", 20) },
    ],
    highlights: ["CALOR", "ATRASO", "96%", "CHANCE", "2027", "RECORDE"],
    captions: [cap("s6", 5, "Só que o calor do El Niño chega no ar com uns meses de atraso. Por isso, uma análise dá 96% de chance de 2027 bater o recorde.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.3), sfx("hourglass", W("s6", 10), 0.25), sfx("pop", W("s6", 15), 0.3), sfx("alert-tone", W("s6", 24), 0.22)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Calma: um ano acima de um grau e meio ainda não rompe o Acordo de Paris. A conta usa a média de vinte anos. Mas ela está chegando lá.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.graph), key(end(6), P.graph2, "linear")] },
    objects: [{ id: "earth", type: "Terra (fundo)", visible: true }, { id: "graph", type: "ParisGraph", visible: true }],
    animations: [
      ...fx.whipIn(-1), ...world(0, "earth"), ...sealOnly(0, "none"), set("blanket.k", 0, 1), set("hot", 0, 1), set("smoke", 0, 0), set("sun", 0, 0), set("heat", 0, 0),
      pop("graph", W("s7", 0)), lin("bars", W("s7", 1), W("s7", 8) + 6, 0, 1, "linear"), lin("avg", W("s7", 19), W("s7", 23) + 8, 0, 1, "inOut"), ...fx.punch(W("s7", 27)),
      ...mascot.place(add(EARTH, [2.4, -1.6, 2.6]), -0.5, 0.42, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s7", 0), 30),
    ],
    badges: [
      { text: "ACORDO DE PARIS = MÉDIA DE 20 ANOS", variant: "info", appearAt: W("s7", 13) },
      { text: "AINDA ABAIXO… POR POUCO", variant: "warning", appearAt: W("s7", 24) },
    ],
    highlights: ["CALMA", "GRAU", "MEIO", "ACORDO", "PARIS", "MÉDIA", "VINTE", "CHEGANDO"],
    captions: [cap("s7", 6, "Calma: um ano acima de um grau e meio ainda não rompe o Acordo de Paris. A conta usa a média de vinte anos. Mas ela está chegando lá.")],
    audioCues: [narration("s7"), sfx("whoosh-soft", 0, 0.3), sfx("badge", W("s7", 13), 0.3), sfx("strain", W("s7", 24), 0.25)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. O cobertor sobe a escada, e o El Niño dá o pulo. E 2027 promete ser ainda mais quente.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "esc", type: "Escada + pulo final + termômetro 2027?", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "esc"), ...sealOnly(0, "none"), ...mascot.float(0, false, 1), ...ride(0.42, 0, end(7)), set("thermo.v", 0, 0.88), set("thermo.glow", 0, 0.5),
      lin("mascot.jump", W("s8", 15), W("s8", 15) + 9, 0, 1.6, "out"), lin("mascot.jump", W("s8", 15) + 9, W("s8", 15) + 20, 1.6, 0, "in"), ...mascot.cheer(W("s8", 0), 36),
      lin("blink", W("s8", 17), W("s8", 17) + 10, 0, 1, "out"), lin("thermo.v", W("s8", 17), W("s8", 21), 0.88, 1.0, "out"), popOut("blink", end(7) - s(5.2), 8),
    ],
    badges: [
      { text: "COBERTOR = ESCADA · EL NIÑO = PULO", variant: "info", appearAt: W("s8", 4), disappearAt: end(7) - s(5.2) },
    ],
    highlights: ["PRONTO", "COBERTOR", "ESCADA", "EL", "NIÑO", "PULO", "2027", "QUENTE"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. O cobertor sobe a escada, e o El Niño dá o pulo. E 2027 promete ser ainda mais quente.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.3), sfx("final", W("s8", 0), 0.4), sfx("launch", W("s8", 15), 0.3), sfx("alert-tone", W("s8", 17), 0.2)],
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
