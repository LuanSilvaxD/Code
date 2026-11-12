// scene-plan.ts — "O buraco mais fundo do mundo" (Poço Superprofundo de Kola, SG-3)
// Roteiro v1 (1:55) — AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa até o TTS);
// c(i, f) prende a âncora ao fim da cena. Linha do tempo determinística (sem timers / Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 115;   // 3450 frames (1:55 — o conteúdo pede: mito + desmentido + escala + 3 causas)
//   export const VO_KEYS = ["s1", ..., "s13"] as const;
//   const PLANNED_SECONDS = [9.15, 7.52, 5.91, 8.57, 4.71, 7.52, 9.50, 10.18, 6.18, 5.76, 6.62, 7.31, 12.57];
//   const GAPS = Array(12).fill(0.55);
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4% (cta +0%); no texto do TTS ":" → ",". A voz real decide os cortes.
// ----------------------------------------------------------------------------------------------
//
// FIO CONDUTOR: a DESCIDA pelo furo. Uma broca luminosa desce por uma coluna de rocha em corte; um medidor de
// profundidade (HUD à esquerda) conta os metros; a rocha esquenta de cinza-azulado para laranja e vermelho.
// Fora da coluna: o MITO (a mesma coluna tingida de vermelho-inferno, com microfone), a RÉGUA DE ESCALA
// (Everest × Marianas × Kola) e o GLOBO em corte (0,2% do caminho).
//
// RÉGUAS:
//   Superfície (estação SG-3 na tundra): 1 m = 0,03 u3d → pessoa 1,7 m = 0,051 u3d (worldScale(0.03)).
//   Coluna (ESQUEMÁTICA): 1 km = 2 u3d de profundidade → fundo (12,262 km) em y = −24,52. Largura do furo
//   EXAGERADA (23 cm seriam invisíveis): fio luminoso de 0,04 u3d. Selo "ESCALA ESQUEMÁTICA" sempre que a coluna aparece.
//   Régua de escala (s6–s7): 1 km = 0,25 u3d (Everest 2,21 · Marianas 2,73 · Kola 3,07), centro em x = +12.
//   Globo (s3–s4, s12): raio 3 u3d em x = −14 (crosta engrossada para ser visível; selo esquemático).

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

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

const sc = (i: number) => SCENE_FRAMES[i];
const end = (i: number) => SCENE_FRAMES[i].durationInFrames;
const c = (i: number, f: number, margin = 2) => Math.min(f, end(i) - margin);
const W = wordLocal;
const key = (at: number, pose: { position: Vec3; target: Vec3 }, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "planned" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "planned" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");

/** Profundidade real (km) → y da coluna esquemática (u3d). */
export const KM = 2;
const depthY = (km: number) => -KM * km;
export const Y = { everest: depthY(8.849), marianas: depthY(10.935), bottom: depthY(12.262), fossils: depthY(6.7), water: depthY(4.5) };
export const SCALE_X = 12;
export const GLOBE: Vec3 = [-14, 0, 0];
export const KOLA_ON_GLOBE: Vec3 = [-14 + 1.1, 2.55, 1.15]; // pino no norte da Rússia (posição final ajustada na Fase 2)

const P = {
  station: orbit([0, 0.55, 0], 4.2, 25, 14),
  stationWide: orbit([0, 0.3, 0], 7.5, 32, 26),
  stationLow: orbit([0, 0.6, 0], 3.0, -20, 6),
  shaftTop: orbit([0, -1.2, 0], 5.5, 22, 6),
  mythTop: orbit([0, -2, 0], 5.0, 15, 4),
  mythDeep: orbit([0, -21, 0], 4.2, 12, 2),
  mythBlur: orbit([0, -21, 0], 5.5, 25, 6),
  globeSiberia: orbit([-14 + 0.4, 1.6, 1.8], 6.5, 40, 22),
  globeKola: orbit(KOLA_ON_GLOBE, 4.5, 30, 28),
  holeWidth: orbit([0, -0.2, 0], 0.9, 30, 10),
  at: (km: number, d = 4.6, az = 20) => orbit([0, depthY(km), 0], d, az, 0),
  scale: orbit([SCALE_X, -0.3, 0], 8.5, 0, 6),
  scaleTilt: orbit([SCALE_X, -0.6, 0], 9.0, 18, 10),
  water: orbit([0.25, Y.water, 0], 2.2, 30, 4),
  fossil: orbit([0.35, Y.fossils, 0.2], 1.4, 25, 4),
  bottom: orbit([0, Y.bottom + 0.6, 0], 3.2, 20, 2),
  bottomClose: orbit([0, Y.bottom + 0.3, 0], 1.6, 28, 4),
  globeCut: orbit(GLOBE, 12, 35, 18),
  globeZoomKola: orbit(KOLA_ON_GLOBE, 1.2, 30, 30),
  cap: orbit([0.9, 0.08, 0.6], 1.3, 35, 16),
  final: orbit([0, 0.4, 0], 6.5, 40, 22),
};

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Os soviéticos cavaram um buraco de doze quilômetros para dentro da Terra. Dizem que pararam porque ouviram gritos. A verdade é mais estranha.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.stationWide), key(W("s1", 4), P.station, "inOut"), key(W("s1", 6), P.shaftTop, "inOut"), key(W("s1", 11), P.at(9, 5.2), "in"), key(W("s1", 12) - 1, P.at(12.262, 4.6), "out"), key(W("s1", 12), P.mythDeep), key(W("s1", 18) - 1, P.mythBlur), key(W("s1", 18), P.mythBlur), key(c(0, end(0)), P.mythBlur, "linear")] },
    objects: [
      { id: "station", type: "DrillStation(SG-3)", visible: true }, { id: "tundra", type: "TundraPlate", visible: true },
      { id: "shaft", type: "RockColumn(strata, heat)", visible: true, state: { start: "fechada (só tundra)", end: "aberta em corte" } },
      { id: "drill", type: "DrillBit+String", visible: true, state: { start: "y=0", end: "y=−24,52 (12,262 km)" } },
      { id: "depthHud", type: "DepthGauge2D", visible: true }, { id: "seal", type: "Seal(ESCALA ESQUEMÁTICA)", visible: true },
      { id: "myth", type: "MythTint(red)", visible: true, state: { start: "0", end: "1" } }, { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      ...fx.flash(0), mascot.wave(W("s1", 1), 30)[0], lin("shaft.open", W("s1", 4), W("s1", 6), 0, 1),
      lin("drill.y", W("s1", 5), W("s1", 11), 0, Y.bottom, "in", "u3d"), lin("depthHud.km", W("s1", 5), W("s1", 11), 0, 12.262, "in"),
      lin("myth.k", W("s1", 12), W("s1", 12) + 18, 0, 1, "out"), pop("myth.screams", W("s1", 16)), ...fx.shake(W("s1", 17), 14),
      ...fx.punch(W("s1", 18)), lin("myth.k", W("s1", 19), W("s1", 22), 1, 0.65),
    ],
    badges: [
      { text: "12 KM PARA DENTRO DA TERRA", variant: "info", appearAt: W("s1", 6), disappearAt: W("s1", 12) },
      { text: "GRITOS LÁ EMBAIXO?", variant: "warning", icon: "?", appearAt: W("s1", 16), disappearAt: W("s1", 18) },
      { text: "A VERDADE É MAIS ESTRANHA", variant: "warning", size: "large", appearAt: W("s1", 18) },
    ],
    highlights: ["doze", "quilômetros", "gritos", "estranha"],
    captions: [cap("s1", 0, "Os soviéticos cavaram um buraco de doze quilômetros para dentro da Terra. Dizem que pararam porque ouviram gritos. A verdade é mais estranha.")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("drill", W("s1", 5), 0.35), sfx("dive", W("s1", 6), 0.4), sfx("screams-fake", W("s1", 16), 0.3), sfx("thud", W("s1", 18), 0.5)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Em 1989, rodou o mundo a história do poço para o inferno: microfone no fundo, gritos, calor de mais de mil graus.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.mythTop), key(W("s2", 12), P.mythTop), key(c(1, W("s2", 16)), P.mythDeep, "inOut"), key(end(1), orbit([0, -21.2, 0], 3.8, 4, 2), "linear")] },
    objects: [
      { id: "shaft", type: "RockColumn", visible: true, state: { start: "tingida de vermelho", end: "vermelho-fogo" } },
      { id: "mic", type: "Microphone(on cable)", visible: true, state: { start: "topo", end: "fundo" } },
      { id: "flames", type: "HellGlow(particles)", visible: true }, { id: "newsCards", type: "Overlay(recortes de jornal 1989)", visible: true },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      set("myth.k", 0, 1), pop("news.cards", W("s2", 1)), lin("mic.y", W("s2", 12), W("s2", 15), -0.5, -21.0, "in", "u3d"),
      pop("myth.waves", W("s2", 15)), lin("flames.level", W("s2", 16), W("s2", 21), 0.3, 1), pop("temp.1000", W("s2", 20)),
      mascot.float(0)[0], mascot.jump(W("s2", 15))[0],
    ],
    badges: [
      { text: "A LENDA DE 1989", subtitle: "o \"poço para o inferno\"", variant: "warning", appearAt: W("s2", 1), disappearAt: W("s2", 12) },
      { text: "+1.000 °C · GRITOS", subtitle: "segundo a lenda", variant: "negative", appearAt: W("s2", 16) },
    ],
    highlights: ["1989", "inferno", "microfone", "gritos", "mil graus"],
    captions: [cap("s2", 1, "Em 1989, rodou o mundo a história do poço para o inferno: microfone no fundo, gritos, calor de mais de mil graus.")],
    audioCues: [narration("s2"), sfx("whoosh-soft", 0, 0.4), sfx("cable", W("s2", 12), 0.35), sfx("fire", W("s2", 16), 0.3)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "Era boato. O áudio era uma montagem de efeitos sonoros, e o poço nem ficava na Sibéria.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([0, -21.2, 0], 3.8, 4, 2)), key(W("s3", 10) - 1, P.mythBlur), key(W("s3", 10), P.globeSiberia), key(end(2), orbit([-14 + 0.4, 1.6, 1.8], 6.0, 34, 22), "linear")] },
    objects: [
      { id: "shaft", type: "RockColumn", visible: true, state: { start: "vermelho", end: "normal (lenda some)" } },
      { id: "stamp", type: "Overlay(Stamp BOATO)", visible: true }, { id: "waveform", type: "Overlay(onda de áudio + recortes de efeitos)", visible: true },
      { id: "globe", type: "EarthGlobe(Rússia)", visible: true }, { id: "pin", type: "MapPin", visible: true, state: { start: "Sibéria (riscado)", end: "—" } },
    ],
    animations: [
      ...fx.whipIn(1), pop("stamp.boato", W("s3", 1)), ...fx.shake(W("s3", 1), 10), lin("myth.k", W("s3", 1), W("s3", 1) + 20, 1, 0, "out"),
      pop("waveform.show", W("s3", 3)), lin("waveform.split", W("s3", 6), W("s3", 9), 0, 1), ...fx.desaturate(W("s3", 2), W("s3", 9), 0.4),
      pop("pin.siberia", W("s3", 15)), lin("pin.siberiaCross", W("s3", 16), W("s3", 16) + 12, 0, 1),
    ],
    badges: [
      { text: "BOATO", variant: "negative", size: "large", appearAt: W("s3", 1), disappearAt: W("s3", 10) },
      { text: "ÁUDIO = EFEITOS SONOROS MONTADOS", variant: "negative", appearAt: W("s3", 6), disappearAt: W("s3", 10) },
      { text: "NEM ERA NA SIBÉRIA", variant: "negative", appearAt: W("s3", 14) },
    ],
    highlights: ["boato", "montagem", "Sibéria"],
    captions: [cap("s3", 2, "Era boato. O áudio era uma montagem de efeitos sonoros, e o poço nem ficava na Sibéria.")],
    audioCues: [narration("s3"), sfx("record-scratch", 0, 0.5), sfx("clunk", W("s3", 1), 0.55), sfx("whoosh", W("s3", 10), 0.35)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "O de verdade fica em Kola, no extremo norte da Rússia. Começou em 1970, com uma missão: furar a crosta e ver o que tem lá dentro.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([-14 + 0.4, 1.6, 1.8], 6.0, 34, 22)), key(W("s4", 5), P.globeKola, "inOut"), key(W("s4", 11) - 1, P.globeKola), key(W("s4", 11), P.stationWide), key(W("s4", 17), P.station, "inOut"), key(end(3), P.shaftTop, "inOut")] },
    objects: [
      { id: "globe", type: "EarthGlobe", visible: true }, { id: "pin", type: "MapPin(Kola)", visible: true, state: { start: "oculto", end: "fincado" } },
      { id: "station", type: "DrillStation(SG-3)", visible: true }, { id: "people", type: "Person[5] (operários de inverno)", visible: true },
      { id: "shaft", type: "RockColumn", visible: true, state: { start: "fechada", end: "aberta (camadas: sedimentos/granito)" } },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      pop("pin.kola", W("s4", 5)), lin("globe.spin", 0, W("s4", 5), 0, 1, "out"), pop("year.1970", W("s4", 12)),
      lin("station.lights", W("s4", 11), W("s4", 13), 0, 1), lin("station.snow", 0, end(3), 0, 1, "linear"),
      lin("shaft.open", W("s4", 18), W("s4", 20), 0, 1), lin("crust.label", W("s4", 18), W("s4", 18) + 10, 0, 1),
      ...mascot.walk(W("s4", 11), W("s4", 16), [0.9, 0, 0.8], [0.45, 0, 0.55]), mascot.point(W("s4", 18))[0],
    ],
    badges: [
      { text: "PENÍNSULA DE KOLA · RÚSSIA", variant: "info", appearAt: W("s4", 5), disappearAt: W("s4", 11) },
      { text: "DESDE 1970", variant: "info", appearAt: W("s4", 12) },
      { text: "MISSÃO: FURAR A CROSTA", subtitle: "pesquisa científica, não petróleo", variant: "info", appearAt: W("s4", 16) },
    ],
    highlights: ["Kola", "Rússia", "1970", "crosta"],
    captions: [cap("s4", 3, "O de verdade fica em Kola, no extremo norte da Rússia. Começou em 1970, com uma missão: furar a crosta e ver o que tem lá dentro.")],
    audioCues: [narration("s4"), sfx("pop", W("s4", 5), 0.5), sfx("wind-cold", W("s4", 11), 0.3), sfx("hydraulic", W("s4", 17), 0.3)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "O furo tem só vinte e três centímetros de largura. Mas foi descendo.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.holeWidth), key(W("s5", 10), orbit([0, -0.4, 0], 1.2, 30, 8), "linear"), key(W("s5", 11), P.shaftTop, "in"), key(end(4), P.at(4, 4.8), "in")] },
    objects: [
      { id: "holeTop", type: "BoreholeMouth(23 cm)", visible: true }, { id: "ruler", type: "Ruler(23 cm) + Person(1,7 m) ao lado", visible: true },
      { id: "drill", type: "DrillBit+String", visible: true, state: { start: "y=0", end: "y=−8 (4 km)" } }, { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      pop("ruler.show", W("s5", 4)), mascot.point(W("s5", 5))[0], lin("drill.y", W("s5", 11), end(4), 0, depthY(4), "in", "u3d"),
      lin("depthHud.km", W("s5", 11), end(4), 0, 4, "in"), lin("rock.heat", W("s5", 11), end(4), 0, 0.15),
    ],
    badges: [{ text: "SÓ 23 CM DE LARGURA", subtitle: "um prato raso", variant: "info", appearAt: W("s5", 4) }],
    highlights: ["vinte e três", "centímetros", "descendo"],
    captions: [cap("s5", 4, "O furo tem só vinte e três centímetros de largura. Mas foi descendo.")],
    audioCues: [narration("s5"), sfx("tick", W("s5", 4), 0.4), sfx("drill", W("s5", 11), 0.35)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Com oito quilômetros e meio, já era mais fundo que o Everest é alto. Com onze, mais fundo que a Fossa das Marianas.",
    camera: { projection: "perspective", movement: "split", keys: [key(0, P.at(4, 4.8)), key(W("s6", 4), P.at(8.849, 4.6), "inOut"), key(W("s6", 9) - 1, P.at(8.849, 4.6)), key(W("s6", 9), P.scale), key(W("s6", 14), P.scale), key(end(5), P.scaleTilt, "inOut")] },
    objects: [
      { id: "drill", type: "DrillBit+String", visible: true, state: { start: "4 km", end: "8,85 km" } },
      { id: "scaleBoard", type: "ScaleDiorama(nível do mar, Everest, Fossa das Marianas, Kola)", visible: true, state: { start: "Kola até 8,85 km", end: "Kola até 11 km" } },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      lin("drill.y", 0, W("s6", 4), depthY(4), Y.everest, "inOut", "u3d"), lin("depthHud.km", 0, W("s6", 4), 4, 8.849),
      lin("rock.heat", 0, W("s6", 4), 0.15, 0.45), pop("scale.everest", W("s6", 9)), lin("scale.kola", W("s6", 9), W("s6", 13), 0, 8.849 / 12.262),
      pop("scale.marianas", W("s6", 19)), lin("scale.kola", W("s6", 16), W("s6", 22), 8.849 / 12.262, 11 / 12.262), mascot.float(W("s6", 9))[0],
    ],
    badges: [
      { text: "EVEREST: 8.849 M", variant: "info", appearAt: W("s6", 10), disappearAt: W("s6", 15) },
      { text: "FOSSA DAS MARIANAS: ~10.900 M", variant: "info", appearAt: W("s6", 20) },
    ],
    highlights: ["oito", "Everest", "onze", "Marianas"],
    captions: [cap("s6", 5, "Com oito quilômetros e meio, já era mais fundo que o Everest é alto. Com onze, mais fundo que a Fossa das Marianas.")],
    audioCues: [narration("s6"), sfx("whoosh", W("s6", 9), 0.35), sfx("badge", W("s6", 10), 0.3), sfx("badge", W("s6", 20), 0.3)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "Em 1989, chegou a 12.262 metros. Poços de petróleo já foram mais compridos, mas inclinados. Na vertical, ninguém desceu tanto.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.scaleTilt), key(W("s7", 4), P.scale, "inOut"), key(W("s7", 6), orbit([SCALE_X + 1.6, -1.2, 0], 7.0, 10, 8), "inOut"), key(W("s7", 15), orbit([SCALE_X + 1.6, -1.2, 0], 7.0, 10, 8)), key(end(6), P.scale, "inOut")] },
    objects: [
      { id: "scaleBoard", type: "ScaleDiorama", visible: true, state: { start: "Kola 11 km", end: "Kola 12,262 km (recorde)" } },
      { id: "oilWell", type: "InclinedWell(linha curva, ~12–13 km de comprimento)", visible: true, state: { start: "oculto", end: "curvo, rasa na vertical" } },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      lin("scale.kola", 0, W("s7", 4), 11 / 12.262, 1, "out"), pop("scale.record", W("s7", 4)), ...fx.flash(W("s7", 4), 8),
      lin("scale.oilDraw", W("s7", 6), W("s7", 12), 0, 1), lin("scale.verticalGuide", W("s7", 15), W("s7", 16) + 8, 0, 1), mascot.cheer(W("s7", 4))[0],
    ],
    badges: [
      { text: "12.262 M", subtitle: "1989 · poço SG-3", variant: "positive", size: "large", appearAt: W("s7", 4), disappearAt: W("s7", 6) },
      { text: "MAIS COMPRIDO ≠ MAIS FUNDO", subtitle: "poços de petróleo vão de lado", variant: "warning", appearAt: W("s7", 12) },
      { text: "RECORDE NA VERTICAL", variant: "positive", appearAt: W("s7", 16) },
    ],
    highlights: ["12.262", "compridos", "inclinados", "vertical"],
    captions: [cap("s7", 6, "Em 1989, chegou a 12.262 metros. Poços de petróleo já foram mais compridos, mas inclinados. Na vertical, ninguém desceu tanto.")],
    audioCues: [narration("s7"), sfx("ding", W("s7", 4), 0.5), sfx("whoosh-soft", W("s7", 6), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Lá embaixo, surpresas: rocha rachada e cheia de água, onde ninguém esperava. E fósseis microscópicos de plâncton, com uns dois bilhões de anos.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.scale), key(W("s8", 0), P.at(4.5, 3.2), "inOut"), key(W("s8", 3), P.water, "inOut"), key(W("s8", 12) - 1, P.water), key(W("s8", 12), P.at(6.7, 2.6), "inOut"), key(W("s8", 14), P.fossil, "inOut"), key(end(7), orbit([0.35, Y.fossils, 0.2], 1.25, 40, 6), "linear")] },
    objects: [
      { id: "cracks", type: "RockCracks + WaterDrops(particles)", visible: true, state: { start: "fechadas", end: "brilhando com água" } },
      { id: "lens", type: "MagnifierBubble", visible: true }, { id: "fossils", type: "Microfossil[5] (plâncton low-poly)", visible: true },
      { id: "mascot", type: "Mascot(flutuando ao lado da coluna, lanterna)", visible: true },
    ],
    animations: [
      lin("cracks.open", W("s8", 3), W("s8", 5), 0, 1), lin("water.flow", W("s8", 6), end(7), 0, 1, "linear"), mascot.jump(W("s8", 2))[0],
      pop("lens.show", W("s8", 13)), lin("fossils.reveal", W("s8", 14), W("s8", 17), 0, 1), lin("fossils.spin", W("s8", 14), end(7), 0, 1, "linear"),
      mascot.point(W("s8", 13))[0],
    ],
    badges: [
      { text: "ÁGUA A KM DE PROFUNDIDADE", variant: "warning", appearAt: W("s8", 5), disappearAt: W("s8", 12) },
      { text: "FÓSSEIS DE PLÂNCTON", subtitle: "~2 bilhões de anos · a quase 7 km", variant: "warning", appearAt: W("s8", 15) },
    ],
    highlights: ["rachada", "água", "fósseis", "plâncton", "bilhões"],
    captions: [cap("s8", 7, "Lá embaixo, surpresas: rocha rachada e cheia de água, onde ninguém esperava. E fósseis microscópicos de plâncton, com uns dois bilhões de anos.")],
    audioCues: [narration("s8"), sfx("crumble", W("s8", 3), 0.35), sfx("bubbles", W("s8", 6), 0.3), sfx("shimmer", W("s8", 14), 0.35)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "Então por que pararam? Esperavam cem graus no fundo. Encontraram cento e oitenta.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.at(6.7, 3.0)), key(W("s9", 4), P.bottom, "inOut"), key(W("s9", 9), P.bottom), key(end(8), orbit([0, Y.bottom + 0.6, 0], 2.8, 30, 2), "linear")] },
    objects: [
      { id: "drill", type: "DrillBit", visible: true, state: { start: "7 km", end: "12,262 km" } },
      { id: "thermo", type: "Thermometer2D(esperado × real)", visible: true, state: { start: "100 °C", end: "180 °C" } },
      { id: "shaft", type: "RockColumn(heat)", visible: true, state: { start: "laranja", end: "vermelho incandescente" } },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      lin("drill.y", 0, W("s9", 4), Y.fossils, Y.bottom, "inOut", "u3d"), lin("depthHud.km", 0, W("s9", 4), 6.7, 12.262),
      pop("thermo.show", W("s9", 4)), lin("thermo.expected", W("s9", 4), W("s9", 7), 0, 100), lin("thermo.real", W("s9", 9), W("s9", 12), 100, 180, "out"),
      lin("rock.heat", W("s9", 9), W("s9", 12), 0.6, 1), ...fx.punch(W("s9", 10)), mascot.jump(W("s9", 10))[0],
    ],
    badges: [
      { text: "POR QUE PARARAM?", variant: "warning", icon: "?", appearAt: W("s9", 0), disappearAt: W("s9", 4) },
      { text: "ESPERADO: 100 °C", variant: "info", appearAt: W("s9", 4), disappearAt: W("s9", 9) },
      { text: "REAL: 180 °C", variant: "negative", size: "large", appearAt: W("s9", 9) },
    ],
    highlights: ["pararam", "cem", "cento e oitenta"],
    captions: [cap("s9", 8, "Então por que pararam? Esperavam cem graus no fundo. Encontraram cento e oitenta.")],
    audioCues: [narration("s9"), sfx("dive", 0, 0.35), sfx("tick", W("s9", 5), 0.35), sfx("buzz", W("s9", 10), 0.45)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "Nesse calor, a rocha fica mole, quase massinha, e vai fechando o furo atrás da broca.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([0, Y.bottom + 0.6, 0], 2.8, 30, 2)), key(W("s10", 3), P.bottomClose, "inOut"), key(end(9), orbit([0, Y.bottom + 0.3, 0], 1.4, 18, 4), "linear")] },
    objects: [
      { id: "walls", type: "BoreholeWalls(deformáveis)", visible: true, state: { start: "furo aberto", end: "furo se fechando atrás da broca" } },
      { id: "drill", type: "DrillBit", visible: true, state: { start: "girando", end: "presa" } },
    ],
    animations: [
      lin("rock.soft", W("s10", 3), W("s10", 6), 0, 1), lin("walls.squeeze", W("s10", 9), end(9), 0, 1, "inOut"),
      lin("drill.spin", 0, W("s10", 12), 1, 0.2), ...fx.shake(W("s10", 10), 18),
    ],
    badges: [
      { text: "ROCHA MOLE", subtitle: "o calor deixa a rocha plástica", variant: "negative", appearAt: W("s10", 5), disappearAt: W("s10", 10) },
      { text: "O FURO SE FECHA", variant: "negative", appearAt: W("s10", 10) },
    ],
    highlights: ["mole", "massinha", "fechando"],
    captions: [cap("s10", 9, "Nesse calor, a rocha fica mole, quase massinha, e vai fechando o furo atrás da broca.")],
    audioCues: [narration("s10"), sfx("pressure", W("s10", 3), 0.35), sfx("rumble-soft", W("s10", 9), 0.4)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Tentaram até 1992 e não passaram dos doze quilômetros. Aí a União Soviética acabou, e o dinheiro também.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.bottom), key(W("s11", 9) - 1, orbit([0, Y.bottom + 0.6, 0], 3.6, 20, 2)), key(W("s11", 9), P.stationLow), key(end(10), P.station, "inOut")] },
    objects: [
      { id: "drill", type: "DrillBit", visible: true, state: { start: "tenta descer (3 vezes)", end: "travada em 12,262 km" } },
      { id: "yearCounter", type: "Counter2D(1989 → 1992)", visible: true }, { id: "station", type: "DrillStation", visible: true, state: { start: "acesa", end: "luzes apagando" } },
      { id: "coins", type: "CoinStack(encolhendo)", visible: true }, { id: "people", type: "Person[5]", visible: true, state: { start: "trabalhando", end: "indo embora" } },
      { id: "mascot", type: "Mascot", visible: true },
    ],
    animations: [
      lin("drill.tries", 0, W("s11", 8), 0, 3, "linear"), lin("year.count", W("s11", 1), W("s11", 3), 1989, 1992, "linear"),
      pop("coins.show", W("s11", 9)), lin("coins.level", W("s11", 13), W("s11", 17), 1, 0, "in"), lin("station.lights", W("s11", 14), end(10), 1, 0.15),
      lin("people.leave", W("s11", 13), end(10), 0, 1), ...fx.desaturate(W("s11", 12), end(10), 0.45), mascot.look(W("s11", 13), 0.8)[0],
    ],
    badges: [
      { text: "1989 → 1992", subtitle: "sem passar dos 12 km", variant: "negative", appearAt: W("s11", 2), disappearAt: W("s11", 9) },
      { text: "FIM DA URSS · 1991", subtitle: "acabou o dinheiro", variant: "negative", appearAt: W("s11", 12) },
    ],
    highlights: ["1992", "doze", "União Soviética", "dinheiro"],
    captions: [cap("s11", 10, "Tentaram até 1992 e não passaram dos doze quilômetros. Aí a União Soviética acabou, e o dinheiro também.")],
    audioCues: [narration("s11"), sfx("clunk", 20, 0.35), sfx("clunk", 50, 0.35), sfx("power-down", W("s11", 14), 0.4)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "E o mais estranho: isso é menos de 0,2% do caminho até o centro da Terra. Nem a casca do planeta foi furada.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.globeZoomKola), key(W("s12", 6), orbit(KOLA_ON_GLOBE, 3.5, 30, 28), "in"), key(W("s12", 10), P.globeCut, "out"), key(W("s12", 16), P.globeCut), key(end(11), orbit(GLOBE, 11, 45, 18), "linear")] },
    objects: [
      { id: "globe", type: "EarthGlobe(corte em cunha: crosta, manto, núcleo externo, núcleo interno)", visible: true, state: { start: "inteiro", end: "cunha aberta" } },
      { id: "holeMark", type: "HoleMark(lupa sobre a superfície)", visible: true }, { id: "radiusLine", type: "Line(superfície → centro, 6.371 km)", visible: true },
      { id: "crustBand", type: "CrustHighlight", visible: true }, { id: "seal", type: "Seal(crosta engrossada)", visible: true },
    ],
    animations: [
      pop("hole.mark", 0), lin("globe.cut", W("s12", 6), W("s12", 10), 0, 1, "inOut"), lin("radius.draw", W("s12", 9), W("s12", 15), 0, 1),
      pop("percent.badge", W("s12", 8)), lin("crust.glow", W("s12", 16), W("s12", 22), 0, 1), ...fx.punch(W("s12", 8)),
    ],
    badges: [
      { text: "< 0,2% DO CAMINHO", subtitle: "12 km de 6.371 km", variant: "warning", size: "large", appearAt: W("s12", 8), disappearAt: W("s12", 16) },
      { text: "NEM ATRAVESSOU A CROSTA", subtitle: "a crosta continental tem ~35–40 km", variant: "warning", appearAt: W("s12", 17) },
    ],
    highlights: ["estranho", "0,2%", "centro", "casca"],
    captions: [cap("s12", 11, "E o mais estranho: isso é menos de 0,2% do caminho até o centro da Terra. Nem a casca do planeta foi furada.")],
    audioCues: [narration("s12"), sfx("whoosh-big", W("s12", 6), 0.4), sfx("glow", W("s12", 16), 0.3)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "Hoje, o buraco mais fundo do mundo é uma tampa de metal enferrujada. Pronto: agora você sabe. No fundo do poço não tinha inferno. Tinha calor, rocha mole e falta de dinheiro.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.cap), key(W("s13", 12), P.cap), key(W("s13", 17), P.final, "inOut"), key(end(12), orbit([0, 0.4, 0], 7.5, 55, 24), "linear")] },
    objects: [
      { id: "cap", type: "RustyCap(soldada, laje de concreto)", visible: true }, { id: "ruins", type: "DrillStation(abandonada, sem telhado)", visible: true },
      { id: "summary", type: "Overlay(3 ícones: termômetro, rocha mole, moeda)", visible: true }, { id: "mascot", type: "Mascot(sentado na tampa)", visible: true },
    ],
    animations: [
      set("station.ruin", 0, 1), lin("snow.fall", 0, end(12), 0, 1, "linear"), mascot.wave(W("s13", 13), 36)[0],
      pop("summary.heat", W("s13", 25)), pop("summary.rock", W("s13", 26)), pop("summary.money", W("s13", 29)), mascot.cheer(W("s13", 24))[0],
    ],
    badges: [
      { text: "HOJE: UMA TAMPA ENFERRUJADA", variant: "info", appearAt: W("s13", 9), disappearAt: W("s13", 17) },
      { text: "NÃO ERA INFERNO", subtitle: "calor · rocha mole · falta de dinheiro", variant: "positive", appearAt: W("s13", 21) },
    ],
    highlights: ["tampa", "enferrujada", "inferno", "calor", "dinheiro"],
    captions: [cap("s13", 12, "Hoje, o buraco mais fundo do mundo é uma tampa de metal enferrujada. Pronto: agora você sabe. No fundo do poço não tinha inferno. Tinha calor, rocha mole e falta de dinheiro.")],
    audioCues: [narration("s13"), sfx("wind-cold", 0, 0.3), sfx("clunk", W("s13", 9), 0.35), sfx("final", W("s13", 21), 0.45), sfx("fenda-close", c(12, end(12) - 160), 0.6)],
  },
];

// Integridade: contíguo de 0 a DURATION (verificado ao importar na Fase 2).
void evaluateTrack;
