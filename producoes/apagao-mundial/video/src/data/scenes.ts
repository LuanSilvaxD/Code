// scenes.ts — "O buraco mais fundo do mundo" (Poço Superprofundo de Kola, SG-3)
// Roteiro v1 APROVADO (2026-11-12); cortes derivados da voz real (utils/timing.ts).
//
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local da palavra i (base 0) da fala sN. Linha do tempo determinística.
// FIO CONDUTOR: a descida pela coluna de rocha (broca + medidor de profundidade). Réguas em data/kola.ts.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";
import { BOTTOM_KM, depthY, FACE_Z, GLOBE, KOLA_W, MOUTH, MS, SCALE_POS, SIBERIA_W, Y } from "./kola";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-misterio", language: "pt-BR" };

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
/** segura a pose até `at - 1` e corta seco para `next` em `at` */
const cut = (at: number, hold: Pose, next: Pose): CameraKey[] => [key(at - 1, hold), key(at, next)];
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "ready" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const popOut = (target: string, at: number, len = 8): TrackAnimation => lin(target, at, at + len, undefined, 0, "in");

const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const COL = (km: number, dx = 0): Vec3 => [dx, depthY(km), FACE_Z];
/** visitante da coluna: mascote flutuando à esquerda da face, na altura `km` */
const MASCOT_COL = (km: number): Vec3 => [-1.55, depthY(km) + 0.5, FACE_Z + 0.25];
const MCOL = 0.3;
/** distâncias de câmera: em 9:16 a largura visível é ~0,24·d — os fatores abaixo levam os valores-base à escala certa */
const orbitC = (t: Vec3, d: number, az: number, el: number) => orbit(t, d * 3.3, az, el); // coluna
const orbitG = (t: Vec3, d: number, az: number, el: number) => orbit(t, d * 2.9, az, el); // globo
const orbitS = (t: Vec3, d: number, az: number, el: number) => orbit(t, d * 2.4, az, el); // régua

const P = {
  stationWide: orbit([0.2, 0.55, 0], 12.5, 32, 22),
  station: orbit([0.1, 0.7, 0.1], 7.0, 25, 12),
  stationLow: orbit([0.3, 0.6, 0.2], 5.2, -22, 7),
  mouth: orbit(add(MOUTH, [0.006, 0.012, 0]), 0.16, 25, 48),
  mouth2: orbit(add(MOUTH, [0.006, 0.012, 0]), 0.22, 32, 44),
  shaftTop: orbitC(COL(0.4), 5.2, 22, 8),
  at: (km: number, d = 4.6, az = 20, el = 2) => orbitC(COL(km), d, az, el),
  mythTop: orbitC(COL(1.2), 5.0, 15, 4),
  mythDeep: orbitC(COL(BOTTOM_KM - 0.7), 4.2, 12, 2),
  mythBlur: orbitC(COL(BOTTOM_KM - 0.7), 5.4, 24, 6),
  mythMic: orbitC(COL(BOTTOM_KM - 0.7), 3.6, 4, 2),
  globeSiberia: orbitG(add(GLOBE, [0, 1.0, 0]), 10.5, 160, 32),
  globeSiberia2: orbitG(add(GLOBE, [0, 1.0, 0]), 9.8, 150, 32),
  globeKola: orbitG(KOLA_W, 4.4, 122, 38),
  scale: orbitS(add(SCALE_POS, [0.05, -1.0, 0]), 13.5, 0, 4),
  scaleTilt: orbitS(add(SCALE_POS, [0.05, -1.2, 0]), 14.0, 16, 8),
  scaleOil: orbitS(add(SCALE_POS, [1.7, -1.2, 0]), 11.5, 8, 6),
  water: orbitC(COL(4.5, 0.2), 2.4, 28, 4),
  fossil: orbitC(COL(6.7, 0.35), 1.6, 22, 4),
  bottom: orbitC(COL(BOTTOM_KM - 0.35), 3.2, 20, 3),
  bottomClose: orbitC(COL(BOTTOM_KM - 0.2), 1.5, 26, 4),
  globeZoomKola: orbitG(KOLA_W, 1.4, 122, 38),
  globeCut: orbitG(GLOBE, 11, 150, 20),
  globeCut2: orbitG(GLOBE, 10.4, 158, 18),
  cap: orbit(add(MOUTH, [0, 0.03, 0]), 0.3, 30, 16),
  final: orbit([0.2, 0.5, 0.1], 11, 40, 20),
  final2: orbit([0.2, 0.5, 0.1], 13, 55, 22),
};

const base: SceneObject[] = [{ id: "mascot", type: "Mascot", visible: true }];

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Os soviéticos cavaram um buraco de doze quilômetros para dentro da Terra. Dizem que pararam porque ouviram gritos. A verdade é mais estranha.",
    camera: {
      projection: "perspective", movement: "vertical",
      keys: [
        key(0, P.stationWide), key(W("s1", 4), P.station, "inOut"), key(W("s1", 6), P.shaftTop, "inOut"),
        key(W("s1", 11), P.at(BOTTOM_KM - 0.6, 5.0), "in"), ...cut(W("s1", 12), P.at(BOTTOM_KM - 0.6, 5.0), P.mythDeep),
        key(W("s1", 18), P.mythBlur, "out"), key(end(0), orbitC(COL(BOTTOM_KM - 0.7), 5.8, 26, 6), "linear"),
      ],
    },
    objects: [...base, { id: "station", type: "DrillStation", visible: true }, { id: "shaft", type: "RockColumn", visible: true }],
    animations: [
      ...fx.flash(0),
      set("station.lights", 0, 1), set("station.ruin", 0, 0),
      lin("shaft.open", W("s1", 4), W("s1", 6), 0, 1),
      lin("drill.km", W("s1", 5), W("s1", 11), 0, BOTTOM_KM, "in", "u3d"),
      lin("rock.heat", W("s1", 5), W("s1", 11), 0, 0.8),
      set("myth.k", 0, 0),
      lin("myth.k", W("s1", 12), W("s1", 12) + 18, 0, 1, "out"),
      pop("myth.waves", W("s1", 16)),
      ...fx.shake(W("s1", 17), 14),
      ...fx.punch(W("s1", 18)),
      lin("myth.k", W("s1", 19), W("s1", 22), 1, 0.7),
      ...mascot.place(add(MOUTH, [0.32, 0, 0.2]), -0.4, MS, 0),
      ...mascot.wave(W("s1", 1), 30),
      ...mascot.place(MASCOT_COL(BOTTOM_KM - 0.9), 0.5, MCOL, W("s1", 12)),
      ...mascot.float(W("s1", 12), true, 1),
      ...mascot.jump(W("s1", 16)),
    ],
    badges: [
      { text: "12 KM PARA DENTRO DA TERRA", variant: "info", appearAt: W("s1", 6), disappearAt: W("s1", 12) - 2 },
      { text: "GRITOS LÁ EMBAIXO?", variant: "warning", icon: "?", appearAt: W("s1", 16), disappearAt: W("s1", 18) - 2 },
      { text: "A VERDADE É MAIS ESTRANHA", variant: "warning", size: "large", appearAt: W("s1", 18) },
    ],
    highlights: ["DOZE", "QUILÔMETROS", "GRITOS", "ESTRANHA"],
    captions: [cap("s1", 0, "Os soviéticos cavaram um buraco de doze quilômetros para dentro da Terra. Dizem que pararam porque ouviram gritos. A verdade é mais estranha.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("drill", W("s1", 5), 0.3), sfx("dive", W("s1", 6), 0.35), sfx("screams-fake", W("s1", 16), 0.22), sfx("thud", W("s1", 18), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Em 1989, rodou o mundo a história do poço para o inferno: microfone no fundo, gritos, calor de mais de mil graus.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.mythTop), key(W("s2", 12), P.mythTop), key(c(1, W("s2", 16)), P.mythMic, "inOut"), key(end(1), orbitC(COL(BOTTOM_KM - 0.75), 3.3, 0, 2), "linear")] },
    objects: [...base, { id: "shaft", type: "RockColumn(myth)", visible: true }, { id: "mic", type: "Microphone", visible: true }, { id: "news", type: "recortes 1989 (2D)", visible: true }],
    animations: [
      set("myth.k", 0, 1), set("myth.waves", 0, 0), set("drill.km", 0, 0), set("rock.heat", 0, 0),
      pop("news.cards", W("s2", 1)), popOut("news.cards", W("s2", 12) - 2, 8),
      set("mic.km", 0, 0.3), lin("mic.km", W("s2", 12), W("s2", 15), 0.3, BOTTOM_KM - 0.6, "in", "u3d"),
      pop("myth.waves", W("s2", 15)),
      lin("flames.level", W("s2", 16), W("s2", 21), 0.3, 1),
      ...mascot.place(MASCOT_COL(1.6), 0.5, MCOL, 0),
      lin("mascot.y", W("s2", 12), W("s2", 15), MASCOT_COL(1.6)[1], MASCOT_COL(BOTTOM_KM - 1.0)[1], "in"),
      ...mascot.jump(W("s2", 16)),
    ],
    badges: [
      { text: "A LENDA DE 1989", subtitle: "o \"poço para o inferno\"", variant: "warning", appearAt: W("s2", 1), disappearAt: W("s2", 12) - 2 },
      { text: "+1.000 °C · GRITOS", subtitle: "segundo a lenda", variant: "negative", appearAt: W("s2", 16) },
    ],
    highlights: ["1989", "INFERNO", "MICROFONE", "GRITOS", "MIL"],
    captions: [cap("s2", 1, "Em 1989, rodou o mundo a história do poço para o inferno: microfone no fundo, gritos, calor de mais de mil graus.")],
    audioCues: [narration("s2"), sfx("whoosh-soft", 0, 0.4), sfx("cable", W("s2", 12), 0.3), sfx("fire", W("s2", 16), 0.28)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Era boato. O áudio era uma montagem de efeitos sonoros, e o poço nem ficava na Sibéria.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbitC(COL(BOTTOM_KM - 0.75), 3.3, 0, 2)), ...cut(W("s3", 10), P.mythBlur, P.globeSiberia), key(end(2), P.globeSiberia2, "linear")] },
    objects: [...base, { id: "stamp", type: "carimbo BOATO (2D)", visible: true }, { id: "globe", type: "EarthGlobe", visible: true }],
    animations: [
      set("mic.km", 0, BOTTOM_KM - 0.6), set("flames.level", 0, 1), set("myth.waves", 0, 1),
      ...fx.whipIn(1),
      pop("stamp.boato", W("s3", 1)), ...fx.shake(W("s3", 1), 10),
      lin("myth.k", W("s3", 1), W("s3", 1) + 20, 1, 0, "out"), lin("flames.level", W("s3", 1), W("s3", 1) + 20, 1, 0), lin("myth.waves", W("s3", 1), W("s3", 1) + 10, 1, 0),
      lin("mic.km", W("s3", 2), W("s3", 9), BOTTOM_KM - 0.6, 0, "inOut", "u3d"),
      pop("waveform.show", W("s3", 3)), lin("waveform.split", W("s3", 6), W("s3", 9), 0, 1),
      popOut("stamp.boato", W("s3", 10) - 2, 6), popOut("waveform.show", W("s3", 10) - 2, 6),
      ...fx.desaturate(W("s3", 2), W("s3", 9), 0.4),
      set("globe.spin", 0, 0),
      pop("pin.siberia", W("s3", 15)), lin("pin.siberiaCross", W("s3", 16), W("s3", 16) + 12, 0, 1),
      ...mascot.hide(W("s3", 10) - 6, 6),
    ],
    badges: [
      { text: "ÁUDIO = EFEITOS SONOROS MONTADOS", variant: "negative", appearAt: W("s3", 6), disappearAt: W("s3", 10) - 2 },
      { text: "NEM ERA NA SIBÉRIA", variant: "negative", appearAt: W("s3", 14) },
    ],
    highlights: ["BOATO", "MONTAGEM", "EFEITOS", "SIBÉRIA"],
    captions: [cap("s3", 2, "Era boato. O áudio era uma montagem de efeitos sonoros, e o poço nem ficava na Sibéria.")],
    audioCues: [narration("s3"), sfx("record-scratch", W("s3", 0), 0.45), sfx("clunk", W("s3", 1), 0.5), sfx("whoosh", W("s3", 10), 0.35), sfx("pop", W("s3", 15), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "O de verdade fica em Kola, no extremo norte da Rússia. Começou em 1970, com uma missão: furar a crosta e ver o que tem lá dentro.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.globeSiberia2), key(W("s4", 5), P.globeKola, "inOut"), ...cut(W("s4", 11), P.globeKola, P.stationWide), key(W("s4", 17), P.station, "inOut"), key(end(3), P.shaftTop, "inOut")] },
    objects: [...base, { id: "globe", type: "EarthGlobe", visible: true }, { id: "station", type: "DrillStation", visible: true }, { id: "people", type: "Person[5]", visible: true }],
    animations: [
      set("pin.siberia", 0, 1), set("pin.siberiaCross", 0, 1), popOut("pin.siberia", 8, 8),
      set("shaft.open", 0, 0), set("drill.km", 0, 0), set("rock.heat", 0, 0), set("myth.k", 0, 0), set("waveform.split", 0, 0),
      pop("pin.kola", W("s4", 5)),
      set("station.lights", 0, 0), lin("station.lights", W("s4", 11), W("s4", 13), 0, 1),
      pop("year.1970", W("s4", 12)),
      lin("shaft.open", W("s4", 18), W("s4", 20), 0, 1),
      ...mascot.place(add(MOUTH, [0.6, 0, 0.45]), -0.9, MS, W("s4", 11)), ...mascot.float(W("s4", 11), false, 1),
      ...mascot.walk(W("s4", 12), W("s4", 16), add(MOUTH, [0.6, 0, 0.45]), add(MOUTH, [0.22, 0, 0.12])),
      ...mascot.point(W("s4", 18), 40, -1.2),
    ],
    badges: [
      { text: "PENÍNSULA DE KOLA · RÚSSIA", variant: "info", appearAt: W("s4", 5), disappearAt: W("s4", 11) - 2 },
      { text: "DESDE 1970", variant: "info", appearAt: W("s4", 12) },
      { text: "MISSÃO: FURAR A CROSTA", subtitle: "pesquisa científica, não petróleo", variant: "info", appearAt: W("s4", 16) },
    ],
    highlights: ["KOLA", "RÚSSIA", "1970", "CROSTA"],
    captions: [cap("s4", 3, "O de verdade fica em Kola, no extremo norte da Rússia. Começou em 1970, com uma missão: furar a crosta e ver o que tem lá dentro.")],
    audioCues: [narration("s4"), sfx("pop", W("s4", 5), 0.45), sfx("wind-cold", W("s4", 11), 0.28), sfx("hydraulic", W("s4", 17), 0.25)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "O furo tem só vinte e três centímetros de largura. Mas foi descendo.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.mouth), key(W("s5", 10), P.mouth2, "linear"), key(W("s5", 11), P.shaftTop, "in"), key(end(4), P.at(4, 4.8), "in")] },
    objects: [...base, { id: "mouth", type: "BoreholeMouth", visible: true }],
    animations: [
      set("shaft.open", 0, 1), set("year.1970", 0, 0),
      pop("ruler.show", W("s5", 4)), popOut("ruler.show", W("s5", 11), 6),
      lin("drill.km", W("s5", 11), end(4), 0, 4, "in", "u3d"), lin("rock.heat", W("s5", 11), end(4), 0, 0.15),
      ...mascot.hide(0, 1),
      ...mascot.place(MASCOT_COL(1.5), 0.5, MCOL, W("s5", 11)),
      ...mascot.float(W("s5", 11), true, 1),
      lin("mascot.y", W("s5", 11), end(4), MASCOT_COL(1.5)[1], MASCOT_COL(4)[1], "in"),
    ],
    badges: [{ text: "SÓ 23 CM DE LARGURA", subtitle: "um prato raso", variant: "info", appearAt: W("s5", 4) }],
    highlights: ["VINTE", "TRÊS", "CENTÍMETROS", "DESCENDO"],
    captions: [cap("s5", 4, "O furo tem só vinte e três centímetros de largura. Mas foi descendo.")],
    audioCues: [narration("s5"), sfx("tick", W("s5", 4), 0.35), sfx("drill", W("s5", 11), 0.3)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Com oito quilômetros e meio, já era mais fundo que o Everest é alto. Com onze, mais fundo que a Fossa das Marianas.",
    camera: { projection: "perspective", movement: "split", keys: [key(0, P.at(4, 4.8)), key(W("s6", 4), P.at(8.849, 4.6), "inOut"), ...cut(W("s6", 9), P.at(8.849, 4.6), P.scale), key(W("s6", 14), P.scale), key(end(5), P.scaleTilt, "inOut")] },
    objects: [...base, { id: "scaleBoard", type: "ScaleBoard", visible: true }],
    animations: [
      set("ruler.show", 0, 0),
      lin("drill.km", 0, W("s6", 4), 4, 8.849, "inOut", "u3d"), lin("rock.heat", 0, W("s6", 4), 0.15, 0.45),
      set("scale.everest", 0, 0), set("scale.marianas", 0, 0), set("scale.kola", 0, 0), set("scale.oil", 0, 0),
      pop("scale.everest", W("s6", 9)), lin("scale.kola", W("s6", 9), W("s6", 13), 0, 8.849 / BOTTOM_KM),
      lin("scale.kola", W("s6", 16), W("s6", 22), 8.849 / BOTTOM_KM, 11 / BOTTOM_KM), pop("scale.marianas", W("s6", 19)),
      ...mascot.place(MASCOT_COL(4.2), 0.5, MCOL, 0),
      lin("mascot.y", 0, W("s6", 4), MASCOT_COL(4.2)[1], MASCOT_COL(8.85)[1], "inOut"),
      ...mascot.place(add(SCALE_POS, [-4.3, 0.15, 0.8]), 0.4, 0.42, W("s6", 9)),
    ],
    badges: [
      { text: "EVEREST: 8.849 M", variant: "info", appearAt: W("s6", 10), disappearAt: W("s6", 15) - 2 },
      { text: "FOSSA DAS MARIANAS: ~10.900 M", variant: "info", appearAt: W("s6", 20) },
    ],
    highlights: ["OITO", "EVEREST", "ONZE", "MARIANAS"],
    captions: [cap("s6", 5, "Com oito quilômetros e meio, já era mais fundo que o Everest é alto. Com onze, mais fundo que a Fossa das Marianas.")],
    audioCues: [narration("s6"), sfx("whoosh", W("s6", 9), 0.35), sfx("badge", W("s6", 10), 0.28), sfx("badge", W("s6", 20), 0.28)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Em 1989, chegou a 12.262 metros. Poços de petróleo já foram mais compridos, mas inclinados. Na vertical, ninguém desceu tanto.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.scaleTilt), key(W("s7", 4), P.scale, "inOut"), key(W("s7", 7), P.scaleOil, "inOut"), key(W("s7", 15), P.scaleOil), key(end(6), P.scale, "inOut")] },
    objects: [...base, { id: "scaleBoard", type: "ScaleBoard", visible: true }],
    animations: [
      set("scale.everest", 0, 1), set("scale.marianas", 0, 1),
      lin("scale.kola", 0, W("s7", 4), 11 / BOTTOM_KM, 1, "out"),
      pop("scale.record", W("s7", 4)), ...fx.flash(W("s7", 4), 8), ...fx.burst("record", W("s7", 4)),
      lin("scale.oil", W("s7", 6), W("s7", 12), 0, 1),
      pop("scale.vguide", W("s7", 15)),
      ...mascot.place(add(SCALE_POS, [-4.3, 0.15, 0.8]), 0.4, 0.42, 0),
      ...mascot.cheer(W("s7", 4), 40),
    ],
    badges: [
      { text: "12.262 M", subtitle: "1989 · poço SG-3", variant: "positive", size: "large", appearAt: W("s7", 4), disappearAt: W("s7", 6) + 8 },
      { text: "MAIS COMPRIDO ≠ MAIS FUNDO", subtitle: "poços de petróleo vão de lado", variant: "warning", appearAt: W("s7", 12), disappearAt: W("s7", 16) - 2 },
      { text: "RECORDE NA VERTICAL", variant: "positive", appearAt: W("s7", 16) },
    ],
    highlights: ["1989", "12.262", "COMPRIDOS", "INCLINADOS", "VERTICAL"],
    captions: [cap("s7", 6, "Em 1989, chegou a 12.262 metros. Poços de petróleo já foram mais compridos, mas inclinados. Na vertical, ninguém desceu tanto.")],
    audioCues: [narration("s7"), sfx("ding", W("s7", 4), 0.45), sfx("whoosh-soft", W("s7", 6), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Lá embaixo, surpresas: rocha rachada e cheia de água, onde ninguém esperava. E fósseis microscópicos de plâncton, com uns dois bilhões de anos.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.at(4.5, 3.4)), key(W("s8", 3), P.water, "inOut"), key(W("s8", 12), P.water), key(W("s8", 13) + 6, P.at(6.7, 2.6), "inOut"), key(W("s8", 15), P.fossil, "inOut"), key(end(7), orbitC(COL(6.7, 0.35), 1.4, 34, 6), "linear")] },
    objects: [...base, { id: "lens", type: "Magnifier + Microfossil[5]", visible: true }],
    animations: [
      set("scale.oil", 0, 1), set("scale.vguide", 0, 1), set("scale.record", 0, 1),
      set("drill.km", 0, 6.0), set("rock.heat", 0, 0.35),
      lin("cracks.open", W("s8", 3), W("s8", 5), 0, 1),
      pop("lens.show", W("s8", 13)), lin("fossils.reveal", W("s8", 14), W("s8", 17), 0, 1),
      ...mascot.place(MASCOT_COL(4.3), 0.6, MCOL, 0),
      ...mascot.float(0, true, 1),
      ...mascot.jump(W("s8", 2)),
      lin("mascot.y", W("s8", 12), W("s8", 15), MASCOT_COL(4.3)[1], MASCOT_COL(6.55)[1], "inOut"),
      lin("mascot.x", W("s8", 12), W("s8", 15), MASCOT_COL(4.3)[0], -0.55, "inOut"),
      ...mascot.point(W("s8", 15), 45, 1.2),
    ],
    badges: [
      { text: "ÁGUA A KM DE PROFUNDIDADE", variant: "warning", appearAt: W("s8", 5), disappearAt: W("s8", 12) - 2 },
      { text: "FÓSSEIS DE PLÂNCTON", subtitle: "~2 bilhões de anos · a quase 7 km", variant: "warning", appearAt: W("s8", 15) },
    ],
    highlights: ["SURPRESAS", "RACHADA", "ÁGUA", "FÓSSEIS", "PLÂNCTON", "BILHÕES"],
    captions: [cap("s8", 7, "Lá embaixo, surpresas: rocha rachada e cheia de água, onde ninguém esperava. E fósseis microscópicos de plâncton, com uns dois bilhões de anos.")],
    audioCues: [narration("s8"), sfx("crumble", W("s8", 3), 0.3), sfx("bubbles", W("s8", 6), 0.28), sfx("shimmer", W("s8", 14), 0.35)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Então por que pararam? Esperavam cem graus no fundo. Encontraram cento e oitenta.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.at(6.7, 3.2)), key(W("s9", 4), P.bottom, "inOut"), key(W("s9", 9), P.bottom), key(end(8), orbitC(COL(BOTTOM_KM - 0.35), 2.8, 30, 3), "linear")] },
    objects: [...base, { id: "thermo", type: "Thermometer (2D)", visible: true }],
    animations: [
      set("cracks.open", 0, 1), set("lens.show", 0, 1), set("fossils.reveal", 0, 1), popOut("lens.show", 4, 8),
      lin("drill.km", 0, W("s9", 4), 6.0, BOTTOM_KM, "inOut", "u3d"), lin("rock.heat", 0, W("s9", 4), 0.35, 0.6),
      pop("thermo.show", W("s9", 4)),
      set("thermo.expected", 0, 0), lin("thermo.expected", W("s9", 4), W("s9", 7), 0, 1),
      set("thermo.real", 0, 0), lin("thermo.real", W("s9", 9), W("s9", 12), 0, 1, "out"),
      lin("rock.heat", W("s9", 9), W("s9", 12), 0.6, 1),
      ...fx.punch(W("s9", 10)),
      ...mascot.place(MASCOT_COL(6.6), 0.6, MCOL, 0),
      lin("mascot.y", 0, W("s9", 4), MASCOT_COL(6.6)[1], MASCOT_COL(BOTTOM_KM - 0.5)[1], "inOut"),
      ...mascot.jump(W("s9", 10)),
    ],
    badges: [
      { text: "POR QUE PARARAM?", variant: "warning", icon: "?", appearAt: W("s9", 0), disappearAt: W("s9", 4) - 2 },
      { text: "ESPERADO: 100 °C", variant: "info", appearAt: W("s9", 4), disappearAt: W("s9", 9) - 2 },
      { text: "REAL: 180 °C", variant: "negative", size: "large", appearAt: W("s9", 9) },
    ],
    highlights: ["PARARAM", "CEM", "CENTO", "OITENTA"],
    captions: [cap("s9", 8, "Então por que pararam? Esperavam cem graus no fundo. Encontraram cento e oitenta.")],
    audioCues: [narration("s9"), sfx("dive", 0, 0.3), sfx("tick", W("s9", 5), 0.3), sfx("buzz", W("s9", 10), 0.4)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "Nesse calor, a rocha fica mole, quase massinha, e vai fechando o furo atrás da broca.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbitC(COL(BOTTOM_KM - 0.35), 2.8, 30, 3)), key(W("s10", 3), P.bottomClose, "inOut"), key(end(9), orbitC(COL(BOTTOM_KM - 0.2), 1.3, 18, 4), "linear")] },
    objects: [...base],
    animations: [
      set("thermo.show", 0, 1), set("thermo.real", 0, 1), popOut("thermo.show", 6, 8),
      set("rock.heat", 0, 1),
      lin("rock.soft", W("s10", 3), W("s10", 6), 0, 1),
      lin("walls.squeeze", W("s10", 9), end(9), 0, 1, "inOut"),
      set("drill.spin", 0, 1), lin("drill.spin", 0, W("s10", 12), 1, 0.15),
      ...fx.shake(W("s10", 10), 18),
      ...mascot.hide(0, 1),
    ],
    badges: [
      { text: "ROCHA MOLE", subtitle: "o calor deixa a rocha plástica", variant: "negative", appearAt: W("s10", 5), disappearAt: W("s10", 10) - 2 },
      { text: "O FURO SE FECHA", variant: "negative", appearAt: W("s10", 10) },
    ],
    highlights: ["CALOR", "MOLE", "MASSINHA", "FECHANDO"],
    captions: [cap("s10", 9, "Nesse calor, a rocha fica mole, quase massinha, e vai fechando o furo atrás da broca.")],
    audioCues: [narration("s10"), sfx("pressure", W("s10", 3), 0.32), sfx("rumble-soft", W("s10", 9), 0.38)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Tentaram até 1992 e não passaram dos doze quilômetros. Aí a União Soviética acabou, e o dinheiro também.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.bottom), ...cut(W("s11", 9), orbitC(COL(BOTTOM_KM - 0.4), 3.6, 20, 3), P.stationLow), key(end(10), P.station, "inOut")] },
    objects: [...base, { id: "station", type: "DrillStation", visible: true }, { id: "coins", type: "Coins", visible: true }],
    animations: [
      set("walls.squeeze", 0, 0.6), set("rock.soft", 0, 1), set("drill.spin", 0, 0.15),
      lin("drill.tries", 0, W("s11", 8), 0, 3, "linear"),
      pop("year.counter", W("s11", 1)), lin("year.count", W("s11", 1), W("s11", 3), 0, 1, "linear"), popOut("year.counter", W("s11", 9) - 2, 6),
      set("station.lights", 0, 1),
      pop("coins.show", W("s11", 9)), set("coins.level", 0, 1), lin("coins.level", W("s11", 13), W("s11", 17), 1, 0, "in"),
      lin("station.lights", W("s11", 14), end(10), 1, 0.15),
      lin("people.leave", W("s11", 13), end(10), 0, 1),
      ...fx.desaturate(W("s11", 12), end(10), 0.45),
      ...mascot.place(add(MOUTH, [0.42, 0, 0.32]), -0.3, MS, W("s11", 9)), ...mascot.float(W("s11", 9), false, 1),
      ...mascot.look(W("s11", 13), 0.8),
    ],
    badges: [
      { text: "1989 → 1992", subtitle: "sem passar dos 12 km", variant: "negative", appearAt: W("s11", 2), disappearAt: W("s11", 9) - 2 },
      { text: "FIM DA URSS · 1991", subtitle: "acabou o dinheiro", variant: "negative", appearAt: W("s11", 12) },
    ],
    highlights: ["1992", "DOZE", "UNIÃO", "SOVIÉTICA", "DINHEIRO"],
    captions: [cap("s11", 10, "Tentaram até 1992 e não passaram dos doze quilômetros. Aí a União Soviética acabou, e o dinheiro também.")],
    audioCues: [narration("s11"), sfx("clunk", s(0.7), 0.3), sfx("clunk", s(1.6), 0.3), sfx("clunk", s(2.5), 0.3), sfx("power-down", W("s11", 14), 0.38)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "E o mais estranho: isso é menos de 0,2% do caminho até o centro da Terra. Nem a casca do planeta foi furada.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.globeZoomKola), key(W("s12", 6), orbitG(KOLA_W, 3.6, 126, 34), "in"), key(W("s12", 10), P.globeCut, "out"), key(W("s12", 16), P.globeCut), key(end(11), P.globeCut2, "linear")] },
    objects: [...base, { id: "globe", type: "EarthGlobe(cut)", visible: true }],
    animations: [
      set("coins.show", 0, 0), set("station.lights", 0, 0.15), set("people.leave", 0, 1),
      set("pin.kola", 0, 0.3), set("pin.siberia", 0, 0),
      pop("hole.mark", 0), popOut("hole.mark", W("s12", 7), 8),
      lin("globe.cut", W("s12", 6), W("s12", 10), 0, 1, "inOut"),
      lin("radius.draw", W("s12", 9), W("s12", 15), 0, 1),
      lin("crust.glow", W("s12", 16), W("s12", 22), 0, 1),
      ...fx.punch(W("s12", 8)),
      ...mascot.hide(0, 1),
    ],
    badges: [
      { text: "< 0,2% DO CAMINHO", subtitle: "12 km de 6.371 km", variant: "warning", size: "large", appearAt: W("s12", 8), disappearAt: W("s12", 16) - 2 },
      { text: "NEM ATRAVESSOU A CROSTA", subtitle: "a crosta continental tem ~35–40 km", variant: "warning", appearAt: W("s12", 17) },
    ],
    highlights: ["ESTRANHO", "0,2%", "CENTRO", "CASCA"],
    captions: [cap("s12", 11, "E o mais estranho: isso é menos de 0,2% do caminho até o centro da Terra. Nem a casca do planeta foi furada.")],
    audioCues: [narration("s12"), sfx("whoosh-big", W("s12", 6), 0.38), sfx("glow", W("s12", 16), 0.3)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "Hoje, o buraco mais fundo do mundo é uma tampa de metal enferrujada. Pronto: agora você sabe. No fundo do poço não tinha inferno. Tinha calor, rocha mole e falta de dinheiro.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.cap), key(W("s13", 12), orbit(add(MOUTH, [0, 0.03, 0]), 0.42, 38, 18), "linear"), key(W("s13", 17), P.final, "inOut"), key(end(12), P.final2, "linear")] },
    objects: [...base, { id: "cap", type: "RustyCap", visible: true }, { id: "ruins", type: "DrillStation(ruin)", visible: true }],
    animations: [
      set("globe.cut", 0, 0), set("crust.glow", 0, 0), set("radius.draw", 0, 0),
      set("station.ruin", 0, 1), set("shaft.open", 0, 0), set("drill.km", 0, 0), set("rock.heat", 0, 0), set("walls.squeeze", 0, 0), set("rock.soft", 0, 0),
      ...mascot.place(add(MOUTH, [0.0, 0.42 * 0.03, 0.0]), 0.5, MS * 0.9, 0), ...mascot.float(0, false, 1),
      ...mascot.wave(W("s13", 13), 36),
      pop("summary.heat", W("s13", 25)), pop("summary.rock", W("s13", 26)), pop("summary.money", W("s13", 29)),
      ...mascot.cheer(W("s13", 24), 40),
      popOut("summary.heat", end(12) - s(5.9), 8), popOut("summary.rock", end(12) - s(5.9), 8), popOut("summary.money", end(12) - s(5.9), 8),
    ],
    badges: [
      { text: "HOJE: UMA TAMPA ENFERRUJADA", variant: "info", appearAt: W("s13", 9), disappearAt: W("s13", 17) - 2 },
      { text: "NÃO ERA INFERNO", subtitle: "calor · rocha mole · falta de dinheiro", variant: "positive", appearAt: W("s13", 21), disappearAt: end(12) - s(5.9) },
    ],
    highlights: ["TAMPA", "ENFERRUJADA", "PRONTO", "INFERNO", "CALOR", "MOLE", "DINHEIRO"],
    captions: [cap("s13", 12, "Hoje, o buraco mais fundo do mundo é uma tampa de metal enferrujada. Pronto: agora você sabe. No fundo do poço não tinha inferno. Tinha calor, rocha mole e falta de dinheiro.")],
    audioCues: [narration("s13"), sfx("wind-cold", 0, 0.28), sfx("clunk", W("s13", 9), 0.3), sfx("final", W("s13", 21), 0.4)],
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
export { SIBERIA_W, KOLA_W, Y };

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
