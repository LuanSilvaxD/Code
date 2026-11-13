// scenes.ts — "95% do universo é invisível" (Euclid). Roteiro v1 e designs APROVADOS (13/11/2026); cortes da voz real.
// Frames LOCAIS à cena; startFrame global. W("sN", i) = frame local da palavra i da fala sN. Linha do tempo determinística.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, EUCLID_P, FIELD, GAL, ICE, LENS, PIE, SOLAR, SPLIT_A, SPLIT_B, SUN_P, WEB } from "./cosmos";

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
const WORLDS = ["cosmos", "solar", "lens", "web", "ice"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));

// câmera (9:16: largura visível ≈ 0,237·d)
const P = {
  gal: orbit(GAL, 36, 10, 24),
  gal2: orbit(GAL, 30, 18, 28),
  galClose: orbit(GAL, 27, 14, 30),
  pie: orbit(PIE, 26, 0, 14),
  pie2: orbit(PIE, 24, 12, 16),
  split: orbit(add(SPLIT_A, [4.2, 0, 0]), 64, 0, 26),
  split2: orbit(add(SPLIT_A, [4.2, 0, 0]), 60, 6, 28),
  field: orbit(FIELD, 44, 0, 6),
  field2: orbit(FIELD, 52, 8, 8),
  earth: orbit(add(SOLAR, [2.6, 0.5, 0]), 34, 18, 12),
  earth2: orbit(add(SOLAR, [3.2, 0.8, 0]), 32, 24, 14),
  solarWide: orbit(add(SOLAR, [-2.6, 0, 0]), 104, 0, 14),
  solarWide2: orbit(add(SOLAR, [-2.6, 0, 0]), 100, 6, 16),
  lens: orbit(LENS, 46, 0, 0),
  lens2: orbit(LENS, 42, 4, 3),
  web: orbit(WEB, 34, 0, 10),
  web2: orbit(WEB, 30, 40, 16),
  iceTop: orbit(add(ICE, [0, 0.5, 0]), 13, 18, 10),
  iceDeep: orbit(add(ICE, [0, -2.4, 0]), 21, 26, 2),
};
const M_PIE: Vec3 = add(PIE, [3.4, -1.6, 1.4]);

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Tudo o que você enxerga no universo, estrelas, planetas e galáxias, é só cinco por cento dele. O resto é invisível.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.galClose), key(W("s1", 10), P.gal, "inOut"), ...cut(W("s1", 11), P.gal, P.pie), key(end(0), P.pie2, "linear")] },
    objects: [{ id: "galaxy", type: "SpiralGalaxy", visible: true }, { id: "pie", type: "UniversePie(5% + contorno)", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true }],
    animations: [
      ...fx.flash(0), ...world(0, "cosmos"), set("pie.show", 0, 0), set("pie.k5", 0, 0), set("pie.k27", 0, 0), set("pie.k68", 0, 0), set("pie.outline", 0, 0), set("pie.q", 0, 0), set("halo.k", 0, 0), set("pull.k", 0, 0),
      set("split.show", 0, 0), set("scatter", 0, 0), set("field.show", 0, 0), set("expand.t", 0, 0), set("euclid.launch", 0, 0), set("dist.k", 0, 0), set("sky.k", 0, 0), set("lens.pass", 0, 0), set("lens.arcs", 0, 0),
      set("lens.field", 0, 0), set("lens.trace", 0, 0), set("web.light", 0, 0), set("counter", 0, 0), set("label.5", 0, 0), set("label.95", 0, 0), set("legend.k", 0, 0), set("galaxy.show", 0, 1), set("mascot.sit", 0, 0),
      ...mascot.place(add(GAL, [5.2, -2.6, 3]), -0.5, 1.1, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 1), 34),
      set("galaxy.show", W("s1", 11), 0), set("pie.show", W("s1", 11), 1), ...fx.whipIn(), ...mascot.place(M_PIE, -0.6, 0.75, W("s1", 11)),
      pop("pie.k5", W("s1", 13)), lin("legend.k", W("s1", 13), W("s1", 13) + 10, 0, 1), pop("pie.outline", W("s1", 17)), ...fx.punch(W("s1", 20)),
    ],
    badges: [
      { text: "SÓ 5% É VISÍVEL", variant: "warning", appearAt: W("s1", 13), disappearAt: W("s1", 18) },
      { text: "O RESTO? INVISÍVEL", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 18) },
    ],
    highlights: ["ENXERGA", "UNIVERSO", "CINCO", "CENTO", "INVISÍVEL"],
    captions: [cap("s1", 0, "Tudo o que você enxerga no universo, estrelas, planetas e galáxias, é só cinco por cento dele. O resto é invisível.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("shimmer", W("s1", 13), 0.35), sfx("thud", W("s1", 20), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Uns vinte e sete por cento são matéria escura. Ela não brilha, mas puxa tudo em volta.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.pie2), ...cut(W("s2", 7), P.pie2, P.gal2), key(end(1), P.galClose, "linear")] },
    objects: [{ id: "pie", type: "UniversePie(+27%)", visible: true }, { id: "galaxy", type: "SpiralGalaxy(halo)", visible: true }, { id: "seal", type: "Seal(ILUSTRAÇÃO)", visible: true }],
    animations: [
      pop("pie.k27", W("s2", 1)), popOut("pie.outline", W("s2", 1), 10), set("pie.show", W("s2", 7), 0), set("galaxy.show", W("s2", 7), 1), lin("legend.k", W("s2", 7) - 6, W("s2", 7), undefined, 0),
      ...mascot.hide(W("s2", 7) - 4, 4), lin("halo.k", W("s2", 7), W("s2", 9) + 8, 0, 1), pop("pull.k", W("s2", 13)),
    ],
    badges: [
      { text: "MATÉRIA ESCURA: 27%", variant: "info", appearAt: W("s2", 1), disappearAt: W("s2", 10) },
      { text: "NÃO BRILHA, MAS PUXA", variant: "info", appearAt: W("s2", 10) },
    ],
    highlights: ["VINTE", "SETE", "MATÉRIA", "ESCURA", "BRILHA", "PUXA"],
    captions: [cap("s2", 1, "Uns vinte e sete por cento são matéria escura. Ela não brilha, mas puxa tudo em volta.")],
    audioCues: [narration("s2"), sfx("glow", W("s2", 1), 0.4), sfx("whoosh-soft", W("s2", 7), 0.3), sfx("rumble-soft", W("s2", 13), 0.35)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Sem ela, as galáxias giram tão rápido que deveriam se desmanchar.",
    camera: { projection: "perspective", movement: "split", keys: [key(0, P.split), key(end(2), P.split2, "linear")] },
    objects: [{ id: "galA", type: "SpiralGalaxy(halo)", visible: true }, { id: "galB", type: "SpiralGalaxy(scatter)", visible: true }],
    animations: [...fx.whipIn(), set("galaxy.show", 0, 0), set("split.show", 0, 1), lin("scatter", W("s3", 6), W("s3", 10) + 10, 0, 1, "in"), ...mascot.place(add(SPLIT_A, [4.2, -5.2, 6]), 0, 1.4, 0, 8), ...mascot.jump(W("s3", 8))],
    badges: [{ text: "SEM ELA, A GALÁXIA SE DESMANCHA", variant: "negative", appearAt: W("s3", 8) }],
    highlights: ["SEM", "GIRAM", "RÁPIDO", "DESMANCHAR"],
    captions: [cap("s3", 2, "Sem ela, as galáxias giram tão rápido que deveriam se desmanchar.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.35), sfx("whoosh-big", W("s3", 8), 0.4)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "E sessenta e oito por cento é energia escura: algo que faz o universo se expandir cada vez mais rápido.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.pie), ...cut(W("s4", 12), P.pie2, P.field), key(end(3), P.field2, "in")] },
    objects: [{ id: "pie", type: "UniversePie(completa)", visible: true }, { id: "field", type: "ExpandingField", visible: true }],
    animations: [
      ...fx.whipIn(), ...mascot.hide(0, 4), set("split.show", 0, 0), set("pie.show", 0, 1), set("pie.k5", 0, 1), set("pie.k27", 0, 1), lin("legend.k", 0, 8, 0, 1), pop("pie.k68", W("s4", 1)), ...fx.flash(W("s4", 3), 6),
      set("pie.show", W("s4", 12), 0), lin("legend.k", W("s4", 12) - 6, W("s4", 12), undefined, 0), set("field.show", W("s4", 12), 1), lin("expand.t", W("s4", 13), end(3), 0, 1, "in"),
    ],
    badges: [
      { text: "ENERGIA ESCURA: 68%", variant: "info", size: "large", appearAt: W("s4", 1), disappearAt: W("s4", 15) },
      { text: "EXPANSÃO ACELERADA", variant: "warning", appearAt: W("s4", 15) },
    ],
    highlights: ["SESSENTA", "OITO", "ENERGIA", "ESCURA", "EXPANDIR", "RÁPIDO"],
    captions: [cap("s4", 3, "E sessenta e oito por cento é energia escura: algo que faz o universo se expandir cada vez mais rápido.")],
    audioCues: [narration("s4"), sfx("whoosh-soft", 0, 0.3), sfx("ding", W("s4", 1), 0.4), sfx("solar-whoosh", W("s4", 13), 0.4)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Ninguém sabe o que elas são. Por isso, em 2023, a Europa lançou o Euclid.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.pie2), ...cut(W("s5", 6), P.pie, P.earth), key(end(4), P.earth2, "linear")] },
    objects: [{ id: "pie", type: "UniversePie(?)", visible: true }, { id: "earth", type: "NightGlobe", visible: true }, { id: "euclid", type: "Euclid(lançamento)", visible: true }],
    animations: [
      ...fx.whipIn(), set("field.show", 0, 0), set("pie.show", 0, 1), lin("legend.k", 0, 8, 0, 1), pop("pie.q", W("s5", 1)), lin("screen.whip", W("s5", 6), W("s5", 6) + 7, -1, 0, "out"), set("pie.show", W("s5", 6), 0),
      ...world(W("s5", 6), "solar"), lin("legend.k", W("s5", 6) - 6, W("s5", 6), undefined, 0), lin("euclid.launch", W("s5", 11), W("s5", 14) + 18, 0, 1, "out"),
      ...mascot.place(add(SOLAR, [-1.6, -1.6, 3.2]), 0.4, 0.75, W("s5", 6)), ...mascot.point(W("s5", 13), 40, 1.2),
    ],
    badges: [
      { text: "NINGUÉM SABE O QUE SÃO", variant: "warning", icon: "?", appearAt: W("s5", 1), disappearAt: W("s5", 11) },
      { text: "EUCLID · LANÇADO EM 2023", variant: "info", appearAt: W("s5", 11) },
    ],
    highlights: ["NINGUÉM", "SABE", "2023", "EUROPA", "EUCLID"],
    captions: [cap("s5", 4, "Ninguém sabe o que elas são. Por isso, em 2023, a Europa lançou o Euclid.")],
    audioCues: [narration("s5"), sfx("tick", W("s5", 1), 0.3), sfx("whoosh", W("s5", 6), 0.4), sfx("launch", W("s5", 11), 0.5)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Ele fica a um milhão e meio de quilômetros da Terra e vai mapear um terço do céu.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.earth2), key(W("s6", 3), P.solarWide, "inOut"), key(end(5), P.solarWide2, "linear")] },
    objects: [{ id: "sun", type: "Sun", visible: true }, { id: "earth", type: "NightGlobe", visible: true }, { id: "euclid", type: "Euclid(L2)", visible: true }, { id: "sky", type: "SkyThird", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [set("euclid.launch", 0, 1), ...mascot.hide(0, 8), lin("dist.k", W("s6", 3), W("s6", 8), 0, 1), lin("sky.k", W("s6", 13), W("s6", 17) + 8, 0, 1)],
    badges: [
      { text: "1,5 MILHÃO DE KM DA TERRA", variant: "info", appearAt: W("s6", 4), disappearAt: W("s6", 13) },
      { text: "MAPA DE 1/3 DO CÉU", variant: "info", appearAt: W("s6", 13) },
    ],
    highlights: ["MILHÃO", "MEIO", "TERRA", "TERÇO", "CÉU"],
    captions: [cap("s6", 5, "Ele fica a um milhão e meio de quilômetros da Terra e vai mapear um terço do céu.")],
    audioCues: [narration("s6"), sfx("pop", W("s6", 4), 0.3), sfx("shimmer", W("s6", 13), 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "O truque: a matéria escura entorta a luz das galáxias que estão atrás, como uma lente. Medindo essa distorção, dá pra desenhar onde ela está.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.lens), key(end(6), P.lens2, "linear")] },
    objects: [{ id: "lens", type: "Lens", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "lens"), lin("lens.pass", W("s7", 2), W("s7", 7), 0, 1), lin("lens.arcs", W("s7", 5), W("s7", 9) + 8, 0, 1), pop("lens.field", W("s7", 16)), lin("lens.trace", W("s7", 19), W("s7", 24) + 6, 0, 1)],
    badges: [
      { text: "LENTE GRAVITACIONAL", variant: "info", appearAt: W("s7", 13), disappearAt: W("s7", 19) },
      { text: "A DISTORÇÃO REVELA A MATÉRIA ESCURA", variant: "positive", appearAt: W("s7", 19) },
    ],
    highlights: ["TRUQUE", "ENTORTA", "LUZ", "LENTE", "DISTORÇÃO", "DESENHAR"],
    captions: [cap("s7", 6, "O truque: a matéria escura entorta a luz das galáxias que estão atrás, como uma lente. Medindo essa distorção, dá pra desenhar onde ela está.")],
    audioCues: [narration("s7"), sfx("whoosh", 0, 0.35), sfx("warp", W("s7", 5), 0.45), sfx("glow", W("s7", 19), 0.4)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "E já saiu o primeiro grande pacote: mais de novecentos milhões de galáxias, pra montar o mapa 3D do universo invisível.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.web), key(end(7), P.web2, "inOut")] },
    objects: [{ id: "web", type: "CosmicWeb", visible: true }, { id: "counter", type: "Counter2D", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "web"), lin("web.light", W("s8", 2), W("s8", 12) + 10, 0, 1), lin("counter", W("s8", 7), W("s8", 12), 0, 900, "out", "count")],
    badges: [
      { text: "1º PACOTE DE DADOS", variant: "info", appearAt: W("s8", 4), disappearAt: W("s8", 9) },
      { text: "+900 MILHÕES DE GALÁXIAS", variant: "positive", appearAt: W("s8", 9) },
    ],
    highlights: ["PRIMEIRO", "PACOTE", "NOVECENTOS", "MILHÕES", "MAPA", "INVISÍVEL"],
    captions: [cap("s8", 7, "E já saiu o primeiro grande pacote: mais de novecentos milhões de galáxias, pra montar o mapa 3D do universo invisível.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.35), sfx("shimmer", W("s8", 2), 0.35), sfx("ding", W("s8", 9), 0.35)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Pronto: agora você sabe. O universo que a gente vê é só a pontinha do iceberg.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.iceTop), key(W("s9", 4), P.iceTop), key(W("s9", 14), P.iceDeep, "inOut"), key(end(8), orbit(add(ICE, [0, -2.4, 0]), 22, 34, 3), "linear")] },
    objects: [{ id: "iceberg", type: "Iceberg", visible: true }, { id: "labels", type: "Labels(5% / 95%)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "ice"), ...mascot.place(add(ICE, [2.1, 0.5, 1.6]), -0.6, 0.55, 0), ...mascot.float(0, true, 1), ...mascot.cheer(W("s9", 1), 40), ...mascot.wave(W("s9", 13), 36),
      pop("label.5", W("s9", 11)), pop("label.95", W("s9", 14)), popOut("label.5", end(8) - s(5.3)), popOut("label.95", end(8) - s(5.3)),
    ],
    badges: [{ text: "SÓ A PONTINHA: 5%", variant: "positive", appearAt: W("s9", 11), disappearAt: end(8) - s(5.3) }],
    highlights: ["PRONTO", "UNIVERSO", "VÊ", "PONTINHA", "ICEBERG"],
    captions: [cap("s9", 8, "Pronto: agora você sabe. O universo que a gente vê é só a pontinha do iceberg.")],
    audioCues: [narration("s9"), sfx("whoosh", 0, 0.35), sfx("ocean-amb", 0, 0.25), sfx("final", W("s9", 11), 0.45)],
  },
];

export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);
export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const sceneIndexAt = (frame: number) => scenes.indexOf(sceneAt(frame));
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);
export { SUN_P, EUCLID_P, SPLIT_B };

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
