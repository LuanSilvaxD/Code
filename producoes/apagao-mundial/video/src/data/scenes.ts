// scenes.ts — "Vai ter apagão mundial em 17 de novembro?" — Boato ou Verdade? EP. 01
// Roteiro v1 APROVADO (2026-11-12); cortes derivados da voz real (utils/timing.ts).
//
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local da palavra i (base 0) da fala sN. Linha do tempo determinística.
// Mundos (data/apagao.ts): ESPAÇO (globo + Sol), SALA, ITAIPU, BRASIL — só o mundo com *.show > 0 é desenhado.

import { brPos, onGlobe } from "../components/Apagao";
import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { add, azOf, BRAZIL, GLOBE, GLOBE_R, ITAIPU, MS_MAP, MS_ROOM, MS_SPACE, ROOM, SATELLITE, SUN } from "./apagao";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-tecnologia", language: "pt-BR" };

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
const c = (i: number, f: number, margin = 2) => Math.min(f, end(i) - margin);
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
/** liga só um mundo (corte seco no frame `at`) */
const world = (at: number, w: "space" | "room" | "itaipu" | "brazil"): TrackAnimation[] =>
  (["space", "room", "itaipu", "brazil"] as const).map((k) => set(`${k}.show`, at, k === w ? 1 : 0));

// ---- câmera: em 9:16 a largura visível é ~0,237·d ----
const G = (lon: number, lat: number, d: number, daz = 0, del = 0): Pose => orbit(onGlobe(lon, lat, GLOBE_R), d, azOf(lon) + daz, lat + del);
const SPIN = 0.22; // giro do globo no gancho (rad), volta a 0 durante a sala
const P = {
  globeHook: orbit(GLOBE, 32, 60, 14),
  globeHook2: orbit(GLOBE, 37, 64, 16),
  globePunch: orbit(GLOBE, 30, 74, 14),
  globeCard: orbit(GLOBE, 40, 76, 10),
  globeFull: orbit(GLOBE, 33, 70, 14),
  globeFull2: orbit(GLOBE, 32, 52, 10),
  southAmerica: G(-56, -16, 21, 0, 2),
  southAmerica2: G(-56, -16, 18.5, -6, 2),
  roomWide: orbit(add(ROOM, [0, 0.95, -0.7]), 16, 12, 10),
  roomTv: orbit(add(ROOM, [0, 1.1, -1.9]), 10.5, 6, 6),
  roomSide: orbit(add(ROOM, [0.35, 1.0, -1.7]), 11.5, 26, 9),
  tvClose: orbit(add(ROOM, [0, 1.1, -2.15]), 6.4, 0, 1),
  tvIn: orbit(add(ROOM, [0, 1.15, -2.15]), 0.9, 0, 0),
  globeFromTv: orbit(GLOBE, 9, 70, 14),
  itaipuA: orbit(add(ITAIPU, [-1.8, -0.3, 0.7]), 21, 22, 18),
  itaipuB: orbit(add(ITAIPU, [1.8, -0.3, 0.7]), 21, 28, 18),
  brWide: orbit(add(BRAZIL, [0, 0, 0.2]), 42, 12, 52),
  brCeara: orbit(add(BRAZIL, add(brPos("CE"), [0, 0, 0.3])), 15, 18, 46),
  brWide2: orbit(add(BRAZIL, [0, 0, 0.2]), 41, 18, 54),
  brRoraima: orbit(add(BRAZIL, add(brPos("RR"), [0.4, 0, 0.9])), 15, 10, 44),
  brLines: orbit(add(BRAZIL, [0, 0, 0.2]), 42, 0, 60),
  brLines2: orbit(add(BRAZIL, [0, 0, 0.2]), 40, -8, 62),
  sunEarth: orbit(add(GLOBE, [-8.4, 0.8, -2.4]), 110, -16, 8),
  sunEarth2: orbit(add(GLOBE, [-8.4, 0.8, -2.4]), 104, -20, 9),
  cmeMid: orbit(add(GLOBE, [-6, 0.6, -1.8]), 62, -14, 8),
  quebec: G(-72, 50, 15, 0, -12),
  quebec2: G(-72, 50, 13.5, -6, -12),
  satellite: orbit(add(GLOBE, [-6.5, 1.2, -1.9]), 66, -16, 9),
  satellite2: orbit(add(GLOBE, [-6.5, 1.2, -1.9]), 62, -12, 10),
  final0: orbit(GLOBE, 32, 40, 12),
  final1: orbit(GLOBE, 34, 82, 14),
};

// mascote: posições por mundo
const M_SPACE = (azDeg: number, side = 1): Vec3 => {
  const a = (azDeg * Math.PI) / 180;
  const right: Vec3 = [Math.cos(a), 0, -Math.sin(a)];
  const fwd: Vec3 = [Math.sin(a), 0, Math.cos(a)];
  return [right[0] * 3.3 * side + fwd[0] * 3.0, -1.5, right[2] * 3.3 * side + fwd[2] * 3.0];
};
const M_ROOM: Vec3 = add(ROOM, [-0.62, 0.5, 0.85]);
const M_MAP: Vec3 = add(BRAZIL, [4.95, -0.02, -0.7]);
const M_MAP_N: Vec3 = add(BRAZIL, [-0.9, -0.02, -5.5]);

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Dia 17 de novembro, o mundo inteiro vai ficar sem luz. É o que tá rodando na internet. Será verdade?",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.globeHook), key(W("s1", 9), P.globeHook, "inOut"), key(W("s1", 11), P.globeHook2, "inOut"), key(W("s1", 18), P.globeHook2), key(W("s1", 19) + 4, P.globePunch, "out"), key(end(0), P.globePunch, "linear")] },
    objects: [
      { id: "globe", type: "NightGlobe", visible: true, state: { start: "aceso", end: "aceso (apaga e volta)" } },
      { id: "posts", type: "Overlay(posts virais genéricos)", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [
      ...fx.flash(0), ...world(0, "space"), set("grids.k", 0, 0), set("cable.on", 0, 0), set("cable.break", 0, 0), set("quebec.off", 0, 0), set("field.show", 0, 0), set("cme.t", 0, 0),
      set("tv.alert", 0, 0), set("tv.cross1", 0, 0), set("tv.cross2", 0, 0), set("tv.on", 0, 0), set("tv.dark", 0, 0), set("tv.calendar", 0, 0), set("radio.waves", 0, 0), set("mascot.sit", 0, 0),
      set("domino.t", 0, 0), set("line.spark", 0, 0), set("gap.show", 0, 0), set("lines.trace", 0, 0), set("roraima.glow", 0, 0), set("verdict.show", 0, 0), set("verdict.big", 0, 0), set("verdict.needle", 0, 0),
      set("sun.show", 0, 0), set("satellite.show", 0, 0), set("lights.on", 0, 1), lin("globe.spin", 0, end(0), 0, SPIN * 0.8, "linear"),
      ...mascot.place(M_SPACE(64), -0.6, MS_SPACE, 0), ...mascot.float(0, true, 1), ...mascot.wave(W("s1", 1), 34),
      lin("lights.on", W("s1", 9), W("s1", 10) + 22, 1, 0), lin("bg.dark", W("s1", 9), W("s1", 10) + 22, 0, 1),
      pop("posts.cards", W("s1", 15)), popOut("posts.cards", W("s1", 18), 8),
      lin("lights.on", W("s1", 18), W("s1", 18) + 14, 0, 1, "out"), lin("bg.dark", W("s1", 18), W("s1", 18) + 14, 1, 0), ...fx.punch(W("s1", 19)), ...mascot.jump(W("s1", 9) + 6),
    ],
    badges: [
      { text: "APAGÃO MUNDIAL EM 17/11?", variant: "warning", icon: "?", appearAt: W("s1", 4), disappearAt: W("s1", 15) },
      { text: "TÁ NA INTERNET", variant: "warning", appearAt: W("s1", 15), disappearAt: W("s1", 18) },
      { text: "SERÁ VERDADE?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 18) },
    ],
    highlights: ["17", "NOVEMBRO", "INTEIRO", "LUZ", "INTERNET", "VERDADE?"],
    captions: [cap("s1", 0, "Dia 17 de novembro, o mundo inteiro vai ficar sem luz. É o que tá rodando na internet. Será verdade?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("power-down", W("s1", 9), 0.5), sfx("pop", W("s1", 15), 0.35), sfx("hum", W("s1", 18), 0.35), sfx("thud", W("s1", 19), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Este é o Boato ou Verdade.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.globePunch), key(end(1), P.globeCard, "inOut")] },
    objects: [
      { id: "seriesCard", type: "SeriesCard(BOATO OU VERDADE? · EP. 01)", visible: true },
      { id: "verdict", type: "VerdictMeter2D", visible: true, state: { start: "oculto", end: "meio, balançando" } }, { id: "globe", type: "NightGlobe", visible: true },
    ],
    animations: [
      lin("globe.spin", 0, end(1), undefined, SPIN, "linear"), lin("series.card", 0, 10, 0, 1, "out"), lin("verdict.show", W("s2", 2), W("s2", 2) + 10, 0, 1, "out"),
      lin("verdict.wobble", W("s2", 3), W("s2", 3) + 8, 0, 1), lin("series.card", end(1) - 8, end(1), 1, 0, "in"), lin("verdict.show", end(1) - 8, end(1), 1, 0, "in"), lin("verdict.wobble", end(1) - 1, end(1), 1, 0),
      ...mascot.hide(0, 8), ...fx.whipOut(end(1)),
    ],
    badges: [],
    highlights: ["BOATO", "VERDADE"],
    captions: [cap("s2", 1, "Este é o Boato ou Verdade.")],
    audioCues: [narration("s2"), sfx("badge", 0, 0.5), sfx("tick", W("s2", 3), 0.3), sfx("whoosh-soft", end(1) - 8, 0.4)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Ela junta duas coisas. Um episódio dos Simpsons, de 2023, em que a cidade fica seis dias no escuro a partir de 17 de novembro.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.roomWide), key(end(2), P.roomTv, "inOut")] },
    objects: [
      { id: "room", type: "LivingRoom", visible: true }, { id: "tv", type: "TV(cidade genérica + calendário)", visible: true, state: { start: "desligada", end: "cidade apagada + 17 NOV" } },
      { id: "mascot", type: "Mascot(sentado no sofá)", visible: true },
    ],
    animations: [
      ...fx.whipIn(), ...world(0, "room"), set("globe.spin", 0, 0), set("lights.on", 0, 1), set("bg.room", 0, 1),
      ...mascot.place(M_ROOM, Math.PI, MS_ROOM, 0), ...mascot.float(0, false, 1), set("mascot.sit", 0, 1),
      lin("tv.on", W("s3", 4), W("s3", 4) + 10, 0, 1, "out"), lin("tv.dark", W("s3", 17), W("s3", 18) + 12, 0, 1), pop("tv.calendar", W("s3", 22)),
    ],
    badges: [
      { text: "PISTA 1: EPISÓDIO DE 2023", variant: "info", appearAt: W("s3", 4), disappearAt: W("s3", 15) },
      { text: "17/11 + 6 DIAS NO ESCURO", variant: "info", appearAt: W("s3", 15) },
    ],
    highlights: ["DUAS", "SIMPSONS", "2023", "SEIS", "DIAS", "17", "NOVEMBRO"],
    captions: [cap("s3", 2, "Ela junta duas coisas. Um episódio dos Simpsons, de 2023, em que a cidade fica seis dias no escuro a partir de 17 de novembro.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.45), sfx("tv-on", W("s3", 4), 0.45), sfx("power-down", W("s3", 17), 0.25), sfx("tick", W("s3", 22), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "E um teste real: nesse dia, os Estados Unidos disparam um alerta de emergência de teste nas TVs e rádios.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.roomTv), key(end(3), P.roomSide, "inOut")] },
    objects: [{ id: "tv", type: "TV(faixa de alerta)", visible: true }, { id: "radio", type: "Radio", visible: true }, { id: "mascot", type: "Mascot(sofá)", visible: true }],
    animations: [lin("tv.alert", W("s4", 9), W("s4", 9) + 8, 0, 1, "out"), pop("radio.waves", W("s4", 17)), ...mascot.jump(W("s4", 11)), ...fx.shake(W("s4", 11), 10)],
    badges: [
      { text: "PISTA 2: TESTE REAL NOS EUA", variant: "info", appearAt: W("s4", 2), disappearAt: W("s4", 14) },
      { text: "SÓ UM TESTE, EM TVs E RÁDIOS", variant: "info", appearAt: W("s4", 14) },
    ],
    highlights: ["TESTE", "REAL", "ESTADOS", "UNIDOS", "ALERTA", "TVS", "RÁDIOS"],
    captions: [cap("s4", 3, "E um teste real: nesse dia, os Estados Unidos disparam um alerta de emergência de teste nas TVs e rádios.")],
    audioCues: [narration("s4"), sfx("alert-tone", W("s4", 9), 0.28), sfx("buzz", W("s4", 17), 0.22)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "Só que o desenho não fala de 2026, nem do mundo. E o teste não desliga nada. Mas dá pra apagar o planeta inteiro de uma vez?",
    camera: {
      projection: "perspective", movement: "dolly-out",
      keys: [key(0, P.roomSide), key(W("s5", 4), P.tvClose, "inOut"), key(W("s5", 17), P.tvClose), key(W("s5", 17) + 10, P.tvIn, "in"), key(W("s5", 17) + 11, P.globeFromTv), key(c(4, W("s5", 24)), P.globeFull, "out"), key(end(4), P.globeFull, "linear")],
    },
    objects: [
      { id: "tv", type: "TV", visible: true }, { id: "crosses", type: "✖ na tela", visible: true },
      { id: "verdict", type: "VerdictMeter2D", visible: true, state: { start: "meio", end: "−35° (para BOATO)" } }, { id: "globe", type: "NightGlobe", visible: true },
    ],
    animations: [
      lin("tv.alert", 0, 8, undefined, 0), pop("tv.cross1", W("s5", 7)), lin("tv.alert", W("s5", 11), W("s5", 11) + 6, 0, 1, "out"), pop("tv.cross2", W("s5", 16)), lin("verdict.show", W("s5", 4), W("s5", 4) + 10, 0, 1, "out"),
      lin("verdict.needle", W("s5", 7), W("s5", 16) + 6, 0, -35, "out", "deg"), lin("verdict.show", W("s5", 17), W("s5", 17) + 8, 1, 0),
      ...fx.flash(W("s5", 17) + 10, 8), ...world(W("s5", 17) + 11, "space"), set("bg.room", W("s5", 17) + 11, 0),
      ...mascot.place(M_SPACE(70, -1), 0.6, MS_SPACE, W("s5", 17) + 11, 10), set("mascot.sit", W("s5", 17) + 11, 0), ...mascot.float(W("s5", 17) + 11, true, 1),
    ],
    badges: [
      { text: "NÃO FALA DE 2026", variant: "negative", appearAt: W("s5", 7), disappearAt: W("s5", 16) },
      { text: "O TESTE NÃO DESLIGA NADA", variant: "negative", appearAt: W("s5", 16), disappearAt: W("s5", 18) },
      { text: "DÁ PRA APAGAR O PLANETA?", variant: "warning", icon: "?", size: "large", appearAt: W("s5", 18) },
    ],
    highlights: ["2026", "MUNDO", "DESLIGA", "NADA", "PLANETA", "INTEIRO"],
    captions: [cap("s5", 4, "Só que o desenho não fala de 2026, nem do mundo. E o teste não desliga nada. Mas dá pra apagar o planeta inteiro de uma vez?")],
    audioCues: [narration("s5"), sfx("buzz", W("s5", 7), 0.35), sfx("buzz", W("s5", 16), 0.35), sfx("whoosh-big", W("s5", 17), 0.45)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Pra isso, a Terra precisaria de uma rede elétrica só. Ela não existe. Cada região tem a sua.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.globeFull), key(end(5), P.globeFull2, "inOut")] },
    objects: [
      { id: "globe", type: "NightGlobe", visible: true, state: { start: "luzes", end: "redes coloridas (ESQUEMA)" } },
      { id: "cable", type: "WorldCable", visible: true, state: { start: "oculto", end: "partido" } }, { id: "seal", type: "Seal(ESQUEMA)", visible: true },
    ],
    animations: [
      lin("cable.on", W("s6", 6), W("s6", 9), 0, 1), lin("cable.break", W("s6", 11), W("s6", 11) + 18, 0, 1, "out"), ...fx.shake(W("s6", 11), 12),
      lin("grids.k", W("s6", 13), W("s6", 16), 0, 1), lin("seal.v", W("s6", 13), W("s6", 13) + 10, 0, 1), ...mascot.point(W("s6", 14), 40),
    ],
    badges: [
      { text: "NÃO EXISTE TOMADA DO PLANETA", variant: "negative", appearAt: W("s6", 10), disappearAt: W("s6", 13) },
      { text: "CADA REGIÃO, UMA REDE", variant: "info", appearAt: W("s6", 13) },
    ],
    highlights: ["REDE", "ELÉTRICA", "SÓ", "EXISTE", "REGIÃO"],
    captions: [cap("s6", 5, "Pra isso, a Terra precisaria de uma rede elétrica só. Ela não existe. Cada região tem a sua.")],
    audioCues: [narration("s6"), sfx("hum", W("s6", 6), 0.3), sfx("spark", W("s6", 11), 0.5), sfx("shimmer", W("s6", 13), 0.35)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Numa rede, todos os geradores giram no mesmo ritmo. E as redes nem combinam: o Brasil usa sessenta hertz; o Paraguai, cinquenta.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.globeFull2), key(W("s7", 2), P.southAmerica, "inOut"), key(end(6), P.southAmerica2, "linear")] },
    objects: [{ id: "globe", type: "NightGlobe(redes)", visible: true }, { id: "rotors", type: "MiniRotors", visible: true }, { id: "waves", type: "Overlay(60 Hz × 50 Hz)", visible: true }],
    animations: [set("grids.k", 0, 1), set("seal.v", 0, 1), pop("rotors.sync", W("s7", 4)), pop("wave60", W("s7", 17)), pop("wave50", W("s7", 21)), ...mascot.hide(0, 10)],
    badges: [
      { text: "TODOS NO MESMO RITMO", variant: "info", appearAt: W("s7", 5), disappearAt: W("s7", 17) },
      { text: "60 Hz × 50 Hz", subtitle: "Brasil × Paraguai", variant: "warning", appearAt: W("s7", 17) },
    ],
    highlights: ["MESMO", "RITMO", "BRASIL", "SESSENTA", "HERTZ", "PARAGUAI", "CINQUENTA"],
    captions: [cap("s7", 6, "Numa rede, todos os geradores giram no mesmo ritmo. E as redes nem combinam: o Brasil usa sessenta hertz; o Paraguai, cinquenta.")],
    audioCues: [narration("s7"), sfx("whoosh-soft", 0, 0.3), sfx("hum", W("s7", 4), 0.25), sfx("ding", W("s7", 17), 0.3), sfx("ding", W("s7", 21), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Tanto que Itaipu, dos dois países, tem metade dos geradores em cada ritmo.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.itaipuA), key(end(7), P.itaipuB, "inOut")] },
    objects: [{ id: "itaipu", type: "ItaipuCutaway(20 rotores)", visible: true }, { id: "labels", type: "Labels(BRASIL 60 Hz / PARAGUAI 50 Hz)", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "itaipu"), pop("itaipu.labels", W("s8", 7))],
    badges: [
      { text: "ITAIPU: 10 + 10 GERADORES", variant: "info", appearAt: W("s8", 2), disappearAt: W("s8", 10) },
      { text: "2 RITMOS NA MESMA USINA", variant: "info", appearAt: W("s8", 10) },
    ],
    highlights: ["ITAIPU", "PAÍSES", "METADE", "RITMO"],
    captions: [cap("s8", 7, "Tanto que Itaipu, dos dois países, tem metade dos geradores em cada ritmo.")],
    audioCues: [narration("s8"), sfx("whoosh", 0, 0.4), sfx("hum", 6, 0.3), sfx("pop", W("s8", 7), 0.3)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Apagão grande existe. Em agosto de 2023, uma linha caiu no Ceará, e a falha correu como dominó: vinte e cinco estados e o Distrito Federal no escuro.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.brWide), key(W("s9", 7), P.brCeara, "inOut"), key(W("s9", 15), P.brCeara), key(c(8, W("s9", 22)), P.brWide2, "inOut"), key(end(8), P.brWide2, "linear")] },
    objects: [
      { id: "brazil", type: "BrazilMap", visible: true, state: { start: "aceso", end: "25 + DF apagados, Roraima acesa" } },
      { id: "counter", type: "Counter2D", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }, { id: "mascot", type: "Mascot(borda)", visible: true },
    ],
    animations: [
      ...fx.whipIn(), ...world(0, "brazil"), ...mascot.place(M_MAP, -1.2, MS_MAP, 0), ...mascot.float(0, false, 1),
      pop("line.spark", W("s9", 9)), ...fx.shake(W("s9", 9), 10), lin("domino.t", W("s9", 15), W("s9", 25), 0, 1, "in"), lin("bg.dark", W("s9", 15), W("s9", 25), 0, 0.7),
      lin("counter", W("s9", 18), W("s9", 25), 0, 26, "linear", "count"), ...mascot.jump(W("s9", 17)),
    ],
    badges: [
      { text: "APAGÃO REAL: 15/08/2023", variant: "info", appearAt: W("s9", 3), disappearAt: W("s9", 18) },
      { text: "25 ESTADOS + DF NO ESCURO", variant: "negative", appearAt: W("s9", 18) },
    ],
    highlights: ["AGOSTO", "2023", "CEARÁ", "DOMINÓ", "VINTE", "CINCO", "ESTADOS"],
    captions: [cap("s9", 8, "Apagão grande existe. Em agosto de 2023, uma linha caiu no Ceará, e a falha correu como dominó: vinte e cinco estados e o Distrito Federal no escuro.")],
    audioCues: [narration("s9"), sfx("whoosh", 0, 0.4), sfx("spark", W("s9", 9), 0.5), sfx("domino", W("s9", 15), 0.45), sfx("power-down", W("s9", 24), 0.4)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "Só Roraima ficou com luz. Por quê? Ela não era ligada à rede nacional. A falha só corre até onde vão os fios.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.brWide2), key(W("s10", 2), P.brRoraima, "inOut"), key(W("s10", 13), P.brRoraima), key(c(9, W("s10", 16)), P.brLines, "inOut"), key(end(9), P.brLines2, "linear")] },
    objects: [{ id: "brazil", type: "BrazilMap", visible: true }, { id: "gap", type: "Gap(Roraima)", visible: true }, { id: "lines", type: "Network", visible: true }],
    animations: [
      set("domino.t", 0, 1), pop("roraima.glow", W("s10", 1)), ...mascot.place(M_MAP_N, 0.4, MS_MAP, 0), ...mascot.point(W("s10", 2), 50), pop("gap.show", W("s10", 10)), lin("lines.trace", W("s10", 14), W("s10", 21), 0, 1),
    ],
    badges: [
      { text: "SÓ RORAIMA COM LUZ", variant: "positive", appearAt: W("s10", 1), disappearAt: W("s10", 10) },
      { text: "FORA DA REDE NACIONAL", variant: "info", appearAt: W("s10", 10), disappearAt: W("s10", 14) },
      { text: "A FALHA SÓ CORRE PELOS FIOS", variant: "info", appearAt: W("s10", 14) },
    ],
    highlights: ["RORAIMA", "LUZ", "REDE", "NACIONAL", "FIOS"],
    captions: [cap("s10", 9, "Só Roraima ficou com luz. Por quê? Ela não era ligada à rede nacional. A falha só corre até onde vão os fios.")],
    audioCues: [narration("s10"), sfx("glow", W("s10", 1), 0.45), sfx("tick", W("s10", 10), 0.3), sfx("shimmer", W("s10", 14), 0.35)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Então, algo derruba várias redes ao mesmo tempo? Tem um candidato: o Sol.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.globeFull), key(c(10, W("s11", 11)), P.sunEarth, "inOut"), key(end(10), P.sunEarth2, "linear")] },
    objects: [{ id: "globe", type: "NightGlobe(redes)", visible: true }, { id: "sun", type: "Sun", visible: true }, { id: "field", type: "MagField", visible: true }],
    animations: [
      ...fx.whipIn(), ...world(0, "space"), set("sun.show", 0, 1), set("grids.k", 0, 1), set("seal.v", 0, 0), set("bg.dark", 0, 0), lin("field.show", W("s11", 6), W("s11", 6) + 15, 0, 1), pop("sun.pulse", W("s11", 12)),
      lin("bg.warm", W("s11", 8), c(10, W("s11", 12)), 0, 1), ...mascot.place(M_SPACE(70, -1), 0.6, MS_SPACE, 0), ...mascot.float(0, true, 1), ...mascot.hide(W("s11", 7), 10),
    ],
    badges: [
      { text: "VÁRIAS REDES DE UMA VEZ?", variant: "warning", icon: "?", appearAt: W("s11", 3), disappearAt: W("s11", 12) },
      { text: "O CANDIDATO: O SOL", variant: "warning", appearAt: W("s11", 12) },
    ],
    highlights: ["VÁRIAS", "REDES", "MESMO", "TEMPO?", "CANDIDATO", "SOL"],
    captions: [cap("s11", 10, "Então, algo derruba várias redes ao mesmo tempo? Tem um candidato: o Sol.")],
    audioCues: [narration("s11"), sfx("whoosh", 0, 0.4), sfx("rumble-soft", W("s11", 6), 0.35), sfx("glow", W("s11", 12), 0.45)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "Em 1989, uma tempestade solar apagou Quebec, no Canadá, em menos de um minuto. Nove horas no escuro.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.sunEarth2), key(W("s12", 3), P.cmeMid, "inOut"), key(W("s12", 6), P.quebec, "inOut"), key(end(11), P.quebec2, "linear")] },
    objects: [{ id: "sun", type: "Sun", visible: true }, { id: "cme", type: "CME", visible: true }, { id: "globe", type: "NightGlobe(zoom Canadá)", visible: true }, { id: "clock", type: "Clock2D", visible: true }],
    animations: [
      lin("grids.k", 0, 18, undefined, 0), lin("cme.t", W("s12", 1), W("s12", 5), 0, 1, "in"), pop("field.shake", W("s12", 5)), lin("quebec.off", W("s12", 5), W("s12", 5) + 12, 0, 1),
      ...fx.flash(W("s12", 5)), lin("field.show", W("s12", 5), W("s12", 6) + 6, undefined, 0), lin("clock.hours", W("s12", 14), W("s12", 17) + 6, 0, 9, "inOut", "count"), lin("bg.warm", W("s12", 5), W("s12", 7), undefined, 0.3),
    ],
    badges: [
      { text: "QUEBEC, 1989", variant: "info", appearAt: W("s12", 1), disappearAt: W("s12", 9) },
      { text: "APAGOU EM MENOS DE 1 MINUTO", variant: "negative", appearAt: W("s12", 9), disappearAt: W("s12", 14) },
      { text: "9 HORAS NO ESCURO", variant: "negative", appearAt: W("s12", 14) },
    ],
    highlights: ["1989", "TEMPESTADE", "SOLAR", "QUEBEC", "MINUTO", "NOVE", "HORAS"],
    captions: [cap("s12", 11, "Em 1989, uma tempestade solar apagou Quebec, no Canadá, em menos de um minuto. Nove horas no escuro.")],
    audioCues: [narration("s12"), sfx("solar-whoosh", W("s12", 1), 0.5), sfx("power-down", W("s12", 5), 0.45), sfx("tick", W("s12", 14), 0.3)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "Só que tempestade solar não tem data marcada. A explosão é vista no Sol horas ou dias antes de chegar.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.quebec2), key(W("s13", 8), P.satellite, "inOut"), key(end(12), P.satellite2, "linear")] },
    objects: [{ id: "calendar", type: "Calendar2D", visible: true }, { id: "satellite", type: "Satellite", visible: true }, { id: "warning", type: "WarningWave", visible: true }],
    animations: [
      lin("quebec.off", 0, 16, undefined, 0), pop("calendar.cross", W("s13", 6)), popOut("calendar.cross", W("s13", 9), 8), pop("satellite.show", W("s13", 8)),
      lin("flare.t", W("s13", 9), W("s13", 11) + 6, 0, 1), lin("warning.wave", W("s13", 11), W("s13", 14) + 6, 0, 1), lin("cme2.t", W("s13", 14), end(12), 0, 0.45, "linear"), lin("bg.warm", 0, 20, undefined, 0.6),
    ],
    badges: [
      { text: "SEM DATA MARCADA", variant: "negative", appearAt: W("s13", 6), disappearAt: W("s13", 14) },
      { text: "AVISO COM HORAS A DIAS", variant: "positive", appearAt: W("s13", 14) },
    ],
    highlights: ["DATA", "MARCADA", "EXPLOSÃO", "HORAS", "DIAS"],
    captions: [cap("s13", 12, "Só que tempestade solar não tem data marcada. A explosão é vista no Sol horas ou dias antes de chegar.")],
    audioCues: [narration("s13"), sfx("buzz", W("s13", 6), 0.3), sfx("pop", W("s13", 8), 0.3), sfx("ding", W("s13", 14), 0.35)],
  },
  {
    id: "s14", ...sc(13), voKey: "s14",
    narration: "Veredito: apagão no mundo inteiro, dia 17? Boato. Pronto: agora você sabe por que não existe um botão que desliga o planeta.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.globeFull), key(W("s14", 8), P.final0, "inOut"), key(end(13), P.final1, "inOut")] },
    objects: [
      { id: "globe", type: "NightGlobe", visible: true, state: { start: "aceso", end: "aceso" } }, { id: "verdict", type: "VerdictMeter2D(grande)", visible: true },
      { id: "summary", type: "Overlay(3 ícones)", visible: true }, { id: "mascot", type: "Mascot(float)", visible: true },
    ],
    animations: [
      ...fx.whipIn(), set("sun.show", 0, 0), set("grids.k", 0, 0), set("field.show", 0, 0), set("satellite.show", 0, 0), set("cme2.t", 0, 0), set("flare.t", 0, 0), set("warning.wave", 0, 0), lin("bg.warm", 0, 14, undefined, 0),
      set("verdict.needle", 0, -35), lin("verdict.big", 0, 12, 0, 1, "out"),
      { type: "spring", target: "verdict.needle", startFrame: W("s14", 7), endFrame: W("s14", 7) + 24, from: -35, to: -82, damping: 9, unit: "deg" },
      pop("verdict.hit", W("s14", 7)), ...fx.shake(W("s14", 7), 12), ...fx.flash(W("s14", 7)), lin("verdict.big", W("s14", 9), W("s14", 9) + 10, 1, 0),
      pop("summary.a", W("s14", 11)), pop("summary.b", W("s14", 13)), pop("summary.c", W("s14", 15)),
      popOut("summary.a", end(13) - s(5.4)), popOut("summary.b", end(13) - s(5.4)), popOut("summary.c", end(13) - s(5.4)),
      ...mascot.place(M_SPACE(40, 1), -0.5, MS_SPACE, W("s14", 8), 10), ...mascot.float(W("s14", 8), true, 1), ...mascot.cheer(W("s14", 9), 44), ...mascot.wave(W("s14", 17), 36),
    ],
    badges: [
      { text: "VEREDITO: BOATO", variant: "negative", size: "large", appearAt: W("s14", 7), disappearAt: W("s14", 14) },
      { text: "NENHUM BOTÃO DESLIGA O PLANETA", variant: "positive", appearAt: W("s14", 14), disappearAt: end(13) - s(5.4) },
    ],
    highlights: ["VEREDITO", "BOATO", "PRONTO", "BOTÃO", "PLANETA"],
    captions: [cap("s14", 13, "Veredito: apagão no mundo inteiro, dia 17? Boato. Pronto: agora você sabe por que não existe um botão que desliga o planeta.")],
    audioCues: [narration("s14"), sfx("tick", 0, 0.3), sfx("thud", W("s14", 7), 0.55), sfx("final", W("s14", 8), 0.45)],
  },
];

/** Valor de uma trilha no frame global. */
export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);
export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const sceneIndexAt = (frame: number) => scenes.indexOf(sceneAt(frame));
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);
export { SUN, SATELLITE };

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
