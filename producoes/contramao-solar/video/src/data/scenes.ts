// scenes.ts — "Tem algo andando NA CONTRAMÃO no Sistema Solar" (R631). Roteiro v1 e designs APROVADOS (14/11/2026).
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, DISK, NEP, OBS, ROCKW, SOLAR, STAR } from "./solar";

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
const WORLDS = ["solar", "rock", "obs", "disk", "nep", "star"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));
const whipMid = (at: number): TrackAnimation => lin("screen.whip", at, at + 7, -1, 0, "out");

// câmera (9:16: largura visível ≈ 0,237·d; altura ≈ 0,42·d)
const P = {
  inner: orbit(add(SOLAR, [0, 0, 0]), 30, 10, 58),
  wide: orbit(add(SOLAR, [0, -1.5, 0]), 82, 14, 52),
  wide2: orbit(add(SOLAR, [0, -1.5, 0]), 78, 24, 48),
  rock: orbit(add(ROCKW, [0, -0.9, 0]), 30, -10, 8),
  rock2: orbit(add(ROCKW, [0, -0.9, 0]), 26, 15, 12),
  side: orbit(add(SOLAR, [0, -2.2, 0]), 64, 30, 3),
  side2: orbit(add(SOLAR, [0, -2.2, 0]), 62, 36, 5),
  obs: orbit(add(OBS, [0, 1.6, 0]), 17, 22, 8),
  obs2: orbit(add(OBS, [0.2, 1.4, 0]), 18, 30, 9),
  disk: orbit(add(DISK, [0, -0.8, 0]), 30, 0, 50),
  disk2: orbit(add(DISK, [0, -0.8, 0]), 26, 18, 40),
  nep: orbit(add(NEP, [0, -0.5, 0]), 30, 0, 18),
  nep2: orbit(add(NEP, [1, 0.5, 0]), 32, 18, 14),
  star: orbit(add(STAR, [-0.5, -1.2, 0]), 72, 0, 10),
  star2: orbit(add(STAR, [0.5, -1.2, 0]), 66, 8, 14),
  peri: orbit(add(SOLAR, [0, -1.5, 0]), 70, -20, 42),
  peri2: orbit(add(SOLAR, [0, -1.5, 0]), 66, -6, 38),
  fin: orbit(add(SOLAR, [0, -2, 0]), 80, 30, 34),
  fin2: orbit(add(SOLAR, [0, -2, 0]), 80, 70, 30),
};
const M_SOLAR: Vec3 = add(SOLAR, [7.5, -4.5, 9.5]);

const ZERO = ["arrows", "r631.k", "r631.orbit", "redArrow", "incl", "dots.k", "link.draw", "disk.form", "fly.t", "inter.t", "years", "peri.k", "seal.k", "sealI.k", "mascot.float"];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Todos os planetas giram em volta do Sol no mesmo sentido. Mas, depois de Netuno, acharam algo andando na contramão.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.inner), key(W("s1", 11), orbit(SOLAR, 44, 12, 56), "linear"), key(W("s1", 15), P.wide, "inOut"), key(end(0), P.wide2, "linear")] },
    objects: [{ id: "solar", type: "SolarSystem(8 planetas, setas)", visible: true }, { id: "r631", type: "Rock + órbita retrógrada", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "solar"), ...ZERO.map((t) => set(t, 0, 0)), set("incl", 0, 142), set("seal.k", 0, 1),
      lin("arrows", W("s1", 3), W("s1", 3) + 12, 0, 1),
      ...mascot.place(M_SOLAR, -0.5, 2.4, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 0) + 4, 34),
      pop("r631.k", W("s1", 16)), lin("r631.orbit", W("s1", 16), W("s1", 19) + 16, 0, 1, "inOut"), pop("redArrow", W("s1", 18)), ...fx.punch(W("s1", 19)), ...mascot.jump(W("s1", 19)),
    ],
    badges: [
      { text: "TODOS NO MESMO SENTIDO", variant: "positive", appearAt: W("s1", 8), disappearAt: W("s1", 17) },
      { text: "NA CONTRAMÃO!", variant: "negative", size: "large", appearAt: W("s1", 18) },
    ],
    highlights: ["PLANETAS", "SOL", "MESMO", "SENTIDO", "NETUNO", "CONTRAMÃO"],
    captions: [cap("s1", 0, "Todos os planetas giram em volta do Sol no mesmo sentido. Mas, depois de Netuno, acharam algo andando na contramão.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("shimmer", W("s1", 3), 0.3), sfx("alert-tone", W("s1", 18), 0.25), sfx("thud", W("s1", 19), 0.4)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "O nome provisório é R631. Deve ter uns cem quilômetros, e sua órbita é inclinada cento e quarenta e dois graus: praticamente de ponta-cabeça.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.rock), ...cut(W("s2", 11), P.rock2, P.side), key(end(1), P.side2, "linear")] },
    objects: [{ id: "rock", type: "Rock(close)", visible: true }, { id: "solar", type: "SolarSystem(de lado)", visible: true }, { id: "incl", type: "Órbita inclinando 0→142°", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "rock"), ...mascot.hide(0, 4), set("seal.k", 0, 0),
      whipMid(W("s2", 11)), ...world(W("s2", 11), "solar"), set("incl", W("s2", 11), 0), set("seal.k", W("s2", 11), 1), lin("incl", W("s2", 15), W("s2", 20) + 6, 0, 142, "inOut", "deg"),
    ],
    badges: [
      { text: "R631 · NOME PROVISÓRIO", variant: "info", appearAt: W("s2", 2), disappearAt: W("s2", 5) },
      { text: "~100 KM (ESTIMATIVA)", variant: "info", appearAt: W("s2", 5), disappearAt: W("s2", 15) },
      { text: "142°: DE PONTA-CABEÇA", variant: "warning", size: "large", appearAt: W("s2", 21) },
    ],
    highlights: ["PROVISÓRIO", "R631", "CEM", "QUILÔMETROS", "INCLINADA", "QUARENTA", "DOIS", "GRAUS", "PONTA-CABEÇA"],
    captions: [cap("s2", 1, "O nome provisório é R631. Deve ter uns cem quilômetros, e sua órbita é inclinada cento e quarenta e dois graus: praticamente de ponta-cabeça.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.35), sfx("rumble-soft", 4, 0.25), sfx("whoosh-soft", W("s2", 11), 0.3), sfx("warp", W("s2", 15), 0.35)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "E quem ligou os pontos foi um astrônomo amador, usando dados públicos do novo observatório Vera Rubin.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.obs), key(end(2), P.obs2, "inOut")] },
    objects: [{ id: "obs", type: "Observatory(estilo Rubin)", visible: true }, { id: "dots", type: "Dots2D + linha", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "obs"), set("seal.k", 0, 0), set("incl", 0, 142), lin("dots.k", W("s3", 1), W("s3", 4) + 6, 0, 1), lin("link.draw", W("s3", 2), W("s3", 7), 0, 1, "inOut"), popOut("dots.k", W("s3", 13), 10), popOut("link.draw", W("s3", 13), 10),
      ...mascot.place(add(OBS, [-0.2, 0.05, 1.5]), 0.5, 0.34, 0), ...mascot.float(0, false, 1), ...mascot.point(W("s3", 7), 40, 0.2),
    ],
    badges: [
      { text: "ASTRÔNOMO AMADOR", variant: "positive", appearAt: W("s3", 7), disappearAt: W("s3", 11) },
      { text: "DADOS PÚBLICOS DO RUBIN", variant: "info", appearAt: W("s3", 11) },
    ],
    highlights: ["LIGOU", "PONTOS", "ASTRÔNOMO", "AMADOR", "PÚBLICOS", "VERA", "RUBIN"],
    captions: [cap("s3", 2, "E quem ligou os pontos foi um astrônomo amador, usando dados públicos do novo observatório Vera Rubin.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.35), sfx("tick", W("s3", 2), 0.25), sfx("shimmer", W("s3", 5), 0.3), sfx("ding", W("s3", 7), 0.3)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "Mas por que todo mundo gira igual? O Sistema Solar nasceu de um disco de gás girando, e tudo herdou esse giro.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.disk), key(end(3), P.disk2, "inOut")] },
    objects: [{ id: "disk", type: "ProtoDisk", visible: true }, { id: "seal", type: "Seal(ILUSTRAÇÃO)", visible: true }],
    animations: [...fx.whipIn(-1), ...world(0, "disk"), ...mascot.hide(0, 4), ...fx.desaturate(W("s4", 7), end(3), 0.55), set("sealI.k", 0, 1), lin("disk.form", W("s4", 17), end(3), 0, 1, "inOut")],
    badges: [
      { text: "POR QUÊ?", variant: "warning", icon: "?", appearAt: W("s4", 0), disappearAt: W("s4", 13) },
      { text: "HERANÇA DO DISCO DE GÁS", variant: "info", appearAt: W("s4", 13) },
    ],
    highlights: ["IGUAL", "NASCEU", "DISCO", "GÁS", "GIRANDO", "HERDOU", "GIRO"],
    captions: [cap("s4", 3, "Mas por que todo mundo gira igual? O Sistema Solar nasceu de um disco de gás girando, e tudo herdou esse giro.")],
    audioCues: [narration("s4"), sfx("rewind", 0, 0.35), sfx("glow", W("s4", 13), 0.35)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Pra andar ao contrário, precisa de uma história. A mais provável: ele passou perto demais de Netuno e foi arremessado.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.nep), key(end(4), P.nep2, "inOut")] },
    objects: [{ id: "neptune", type: "Netuno + cinturão de Kuiper", visible: true }, { id: "fly", type: "Rock(estilingue)", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "nep"), set("sealI.k", 0, 0), set("seal.k", 0, 1), lin("fly.t", W("s5", 9), end(4) - 6, 0, 1, "inOut"), ...fx.shake(W("s5", 19), 16),
      ...mascot.place(add(NEP, [-5.5, -4.2, 6]), 0.6, 1.0, 0), ...mascot.float(0, true, 1), ...mascot.point(W("s5", 16), 36, 0.9),
    ],
    badges: [
      { text: "HIPÓTESE 1: NETUNO", variant: "info", appearAt: W("s5", 8), disappearAt: W("s5", 10) + 8 },
      { text: "A MAIS PROVÁVEL", variant: "positive", appearAt: W("s5", 10) + 8 },
    ],
    highlights: ["CONTRÁRIO", "HISTÓRIA", "PROVÁVEL", "PERTO", "NETUNO", "ARREMESSADO"],
    captions: [cap("s5", 4, "Pra andar ao contrário, precisa de uma história. A mais provável: ele passou perto demais de Netuno e foi arremessado.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.35), sfx("solar-whoosh", W("s5", 13), 0.4), sfx("whoosh-big", W("s5", 19), 0.4)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "A mais ousada: ele veio de outra estrela e foi capturado pelo Sol.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.star), key(end(5), P.star2, "inOut")] },
    objects: [{ id: "star", type: "AlienStar", visible: true }, { id: "sun", type: "Sun", visible: true }, { id: "inter", type: "Rock(viagem + captura)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "star"), ...mascot.hide(0, 4), lin("inter.t", W("s6", 3), end(5) - 2, 0, 1, "inOut"), ...fx.flash(W("s6", 10), 8)],
    badges: [{ text: "HIPÓTESE 2: OUTRA ESTRELA", variant: "warning", icon: "?", appearAt: W("s6", 2) }],
    highlights: ["OUSADA", "OUTRA", "ESTRELA", "CAPTURADO", "SOL"],
    captions: [cap("s6", 5, "A mais ousada: ele veio de outra estrela e foi capturado pelo Sol.")],
    audioCues: [narration("s6"), sfx("whoosh", 0, 0.35), sfx("warp", W("s6", 4), 0.35), sfx("pop", W("s6", 10), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Uma volta dele leva uns quinhentos e cinquenta anos. Em 2047, ele chega mais perto do Sol que Netuno.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.peri), key(end(6), P.peri2, "linear")] },
    objects: [{ id: "solar", type: "SolarSystem + órbita R631", visible: true }, { id: "years", type: "Counter2D(anos)", visible: true }, { id: "peri", type: "Marcador 2047 no periélio", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "solar"), set("arrows", 0, 1), set("r631.k", 0, 1), set("r631.orbit", 0, 1), set("redArrow", 0, 1), set("incl", 0, 142),
      lin("years", W("s7", 1), W("s7", 8), 0, 550, "out", "count"), popOut("years", W("s7", 10) - 4, 8), pop("peri.k", W("s7", 10)),
    ],
    badges: [
      { text: "~550 ANOS POR VOLTA", variant: "info", appearAt: W("s7", 5), disappearAt: W("s7", 10) },
      { text: "2047: MAIS PERTO QUE NETUNO", variant: "warning", appearAt: W("s7", 10) },
    ],
    highlights: ["VOLTA", "QUINHENTOS", "CINQUENTA", "ANOS", "2047", "PERTO", "NETUNO"],
    captions: [cap("s7", 6, "Uma volta dele leva uns quinhentos e cinquenta anos. Em 2047, ele chega mais perto do Sol que Netuno.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.35), sfx("hourglass", W("s7", 1), 0.25), sfx("ding", W("s7", 10), 0.35)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Pronto: agora você sabe. Falta a confirmação oficial, mas tem gente andando na contramão no Sistema Solar.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.fin), key(end(7), P.fin2, "inOut")] },
    objects: [{ id: "solar", type: "SolarSystem + R631", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      popOut("peri.k", 0, 10), ...mascot.place(add(SOLAR, [6.5, -3.2, 8.5]), -0.3, 2.4, 0, 10), ...mascot.float(0, true, 1), ...mascot.cheer(W("s8", 1), 40), ...mascot.wave(W("s8", 11), 40),
    ],
    badges: [{ text: "FALTA CONFIRMAÇÃO OFICIAL", variant: "warning", appearAt: W("s8", 4), disappearAt: end(7) - s(5.3) }],
    highlights: ["PRONTO", "CONFIRMAÇÃO", "OFICIAL", "CONTRAMÃO", "SISTEMA", "SOLAR"],
    captions: [cap("s8", 7, "Pronto: agora você sabe. Falta a confirmação oficial, mas tem gente andando na contramão no Sistema Solar.")],
    audioCues: [narration("s8"), sfx("final", W("s8", 0), 0.4)],
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
