// scene-plan.ts — "As zonas de profundidade do oceano" (formato FATOS/DOCUMENTÁRIO) — roteiro v2 (2:55), AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa até o TTS;
// c(i, f) prende a âncora ao fim da cena). Linha do tempo determinística (sem timers / Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 175;   // 5250 frames (2:55, igual ao EP. 01); encerramento da marca (~4,7 s) no fim da s15
//   export const VO_KEYS = ["s1", ..., "s15"] as const;
//   const PLANNED_SECONDS = [9.7, 12.5, 9.2, 9.6, 11.2, 12.2, 11.2, 10.5, 12.1, 7.6, 14.5, 11.9, 13.1, 11.4, 18.3];
//   const GAPS = [0.8, 0.7, 0.7, 0.8, 1.0, 0.8, 1.1, 0.8, 0.8, 1.1, 1.0, 0.9, 1.1, 0.9];
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4% (cta em +0%).
// ----------------------------------------------------------------------------------------------
//
// FIO CONDUTOR: uma descida vertical. O mascote vai dentro de uma BATISFERA (esfera de vidro com farol) pela
// COLUNA A — um corte de oceano em pé sobre o pedestal, com as 5 zonas empilhadas (faixas ESTICADAS para caber:
// selo "ESQUEMA · FAIXAS FORA DE ESCALA"). Profundidade real → y (u3d), por trechos:
//   0 m → 0 · 200 m → −2,2 · 1.000 m → −5,4 · 4.000 m → −10,4 · 6.000 m → −13,4 · 11.000 m → −17,6 (fossa estreita).
// COLUNA B (x = 7) é a mesma coluna em ESCALA REAL (1 km = 1 u3d, 11 u de altura): mostra o Everest (8,85 u) dentro
// da fossa (10,94 u) no gancho, e na s10 revela que a zona do sol é só uma faixa fininha. O Everest NUNCA aparece na
// coluna A (esticada), porque lá a comparação ficaria errada.
// Régua da batisfera/mascote: esquemática (não há gente em escala no mar aberto); peixes e cachalote também fora de
// escala em relação à coluna (selo), mas proporcionais entre si.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-oceano", language: "pt-BR" };

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

/** Profundidade real (m) → y na COLUNA A (esticada por trechos). */
export const depthY = (m: number) => {
  const P: [number, number][] = [[0, 0], [200, -2.2], [1000, -5.4], [4000, -10.4], [6000, -13.4], [11000, -17.6]];
  for (let i = 1; i < P.length; i++) if (m <= P[i][0]) return P[i - 1][1] + ((m - P[i - 1][0]) / (P[i][0] - P[i - 1][0])) * (P[i][1] - P[i - 1][1]);
  return P[P.length - 1][1];
};
const XB = 7; // coluna B (escala real)
const pod = (y: number, d = 6, az = 14, el = 6) => orbit([0.3, y, 0.4], d, az, el);
const P = {
  realTop: orbit([XB, -4.5, 0], 30, 10, 6), // coluna B inteira
  realTrench: orbit([XB, -8.5, 0], 16, 8, 4), // fossa + Everest
  surface: orbit([0.2, 0.4, 0.4], 9, 12, 14),
  sun: pod(-1.0, 8, 10, 8),
  algae: pod(-0.8, 5.5, 18, 6),
  press: pod(-2.0, 6, -10, 4),
  twilight: pod(depthY(600), 7, 12, 4),
  twilightWide: orbit([0.2, -2.6, 0.4], 15, 10, 6),
  midnight: pod(depthY(1600), 5.5, -12, 4),
  whale: pod(depthY(2000), 8, 16, 4),
  abyss: pod(depthY(5200), 7, 20, 10),
  hadal: pod(depthY(9000), 6, -14, 2),
  hadalBottom: pod(depthY(10900), 4.6, 6, 6),
  both: orbit([XB / 2, -8, 0], 46, 6, 6),
};

const O = {
  backdrop: { id: "backdrop", type: "estúdio (tint oceano #182a4e) que escurece com a profundidade da câmera", visible: true },
  colA: { id: "colA", type: "COLUNA A: corte de oceano esticado com as 5 zonas, régua de profundidade e selo de esquema", visible: true },
  colB: { id: "colB", type: "COLUNA B: o mesmo oceano em escala real (1 km = 1 u3d) + Everest", visible: true },
  pod: { id: "pod", type: "batisfera de vidro com farol, mascote dentro (trilhas pod.* e mascot.*)", visible: true },
  snow: { id: "snow", type: "neve marinha: partículas brancas caindo devagar na coluna A", visible: true },
};
const base = [O.backdrop, O.colA, O.colB, O.pod, O.snow];

export const scenes: ScenePlan[] = [
  // 1 — GANCHO: o Everest cabe na fossa (coluna B, escala real)
  {
    id: "scene-01-gancho-everest",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration: "O Monte Everest inteiro cabe no ponto mais fundo do oceano, e ainda sobram dois quilômetros de água por cima. Vamos descer até lá?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.realTop), key(W("s1", 4), P.realTrench, "soft"), key(c(0, W("s1", 20), 12), P.realTrench, "soft"), key(end(0), P.surface, "soft")] },
    objects: [...base, { id: "everest", type: "Monte Everest low-poly (rocha + neve) dentro da fossa da coluna B (DESIGN NOVO)", visible: true, state: { start: "abaixo do fundo", end: "pico a 2 km da superfície" } }],
    animations: [
      lin("pod.depth", 0, 1, 0, 0, "linear", "u3d"), lin("light.depth", 0, 1, 0, 0),
      lin("everest.rise", W("s1", 0), W("s1", 4) + 12, 0, 1, "out"),
      lin("bracket.water", W("s1", 12), W("s1", 19), 0, 1, "out"),
      ...fx.whipOut(end(0)),
      ...mascot.place([0.6, 0.1, 0.5], 0.3, 0.32, 0),
      ...mascot.float(0),
      ...mascot.wave(c(0, W("s1", 20), 30), s(1.0)),
    ],
    badges: [
      { text: "EVEREST: 8.849 m", variant: "info", appearAt: W("s1", 1), disappearAt: W("s1", 11) - 2 },
      { text: "FOSSA: ~10.935 m", variant: "info", subtitle: "Abismo Challenger", appearAt: W("s1", 5), disappearAt: W("s1", 11) - 2 },
      { text: "+2 km DE ÁGUA POR CIMA", variant: "warning", appearAt: W("s1", 12), disappearAt: c(0, W("s1", 20)) - 2 },
    ],
    highlights: ["EVEREST", "INTEIRO", "FUNDO", "OCEANO", "DOIS", "QUILÔMETROS", "DESCER"],
    captions: [cap("s1", 0, "O Monte Everest inteiro cabe no ponto mais fundo do oceano, e ainda sobram dois quilômetros de água por cima. Vamos descer até lá?")],
    audioCues: [narration("s1"), sfx("rumble", W("s1", 0), 0.2), sfx("ding", W("s1", 12), 0.2), sfx("whoosh-big", end(0) - 8, 0.26)],
  },
  // 2 — ZONA DO SOL (0–200 m) e a vida que você conhece
  {
    id: "scene-02-zona-sol",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada. É aqui que vive a maior parte da vida marinha que você conhece: tartarugas, golfinhos e cardumes.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.surface), key(W("s2", 14), P.sun, "soft"), key(end(1), pod(-1.2, 6.5, -12, 6), "soft")] },
    objects: [...base, { id: "surface", type: "superfície com ondas, Sol, barco de pesca (Boat) e raios de luz", visible: true }, { id: "sunLife", type: "tartaruga e golfinhos (DESIGNS NOVOS) + cardume (Fish, aprovado)", visible: true }],
    animations: [
      ...fx.whipIn(),
      lin("sunRays.show", 0, W("s2", 8), 0.3, 1, "out"),
      lin("zone.sun", W("s2", 5), W("s2", 8) + 8, 0, 1, "out"),
      pop("turtle.show", W("s2", 27)),
      pop("dolphins.show", W("s2", 28)),
      pop("school.show", c(1, W("s2", 30), 32)),
      lin("pod.depth", W("s2", 2), end(1), 0, 60, "inOut", "u3d"),
    ],
    badges: [{ text: "ZONA DO SOL", variant: "info", subtitle: "0 a 200 m · epipelágica", appearAt: W("s2", 5), disappearAt: end(1) - 2 }],
    highlights: ["DUZENTOS", "METROS", "ZONA", "SOL", "ILUMINADA", "TARTARUGAS", "GOLFINHOS", "CARDUMES"],
    captions: [cap("s2", 1, "Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada. É aqui que vive a maior parte da vida marinha que você conhece: tartarugas, golfinhos e cardumes.")],
    audioCues: [narration("s2"), sfx("water-rise", 0, 0.2), sfx("pop-high", W("s2", 27), 0.18), sfx("pop-high", W("s2", 28), 0.18)],
  },
  // 3 — ALGAS MICROSCÓPICAS E OXIGÊNIO
  {
    id: "scene-03-oxigenio",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "E também algas microscópicas. Elas fazem fotossíntese como as plantas, e o oceano produz cerca de metade do oxigênio do planeta.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, pod(-1.2, 6.5, -12, 6)), key(end(2), P.algae, "soft")] },
    objects: [...base, { id: "plankton", type: "fitoplâncton: partículas verdes + lupa 2D mostrando uma alga ampliada", visible: true }, { id: "o2", type: "bolhas de O₂ subindo", visible: true }, { id: "o2Card", type: "cartão 2D: pizza 'metade do oxigênio'", visible: true }],
    animations: [
      lin("plankton.show", W("s3", 1), W("s3", 3) + 6, 0, 1, "out"),
      pop("magnifier.show", W("s3", 2)),
      lin("o2.flow", W("s3", 5), end(2), 0, 1, "linear"),
      pop("o2Card.show", W("s3", 14)),
      lin("pod.depth", 0, end(2), 60, 110, "linear", "u3d"),
    ],
    badges: [{ text: "~METADE DO OXIGÊNIO", variant: "positive", subtitle: "vem do oceano (NOAA)", appearAt: W("s3", 14), disappearAt: end(2) - 2 }],
    highlights: ["ALGAS", "MICROSCÓPICAS", "FOTOSSÍNTESE", "METADE", "OXIGÊNIO", "PLANETA"],
    captions: [cap("s3", 2, "E também algas microscópicas. Elas fazem fotossíntese como as plantas, e o oceano produz cerca de metade do oxigênio do planeta.")],
    audioCues: [narration("s3"), sfx("bubbles", W("s3", 5), 0.2), sfx("badge", W("s3", 14), 0.24)],
  },
  // 4 — AS CORES SOMEM (o vermelho primeiro)
  {
    id: "scene-04-cores",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "Só que a luz não desce inteira. O vermelho é a primeira cor que a água apaga, por isso, quanto mais fundo, mais tudo fica azul.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.algae), key(end(3), pod(-2.0, 6, 10, 4), "soft")] },
    objects: [...base, { id: "colorBar", type: "barra 2D do arco-íris ao lado da régua: as cores somem de baixo para cima com a profundidade (vermelho primeiro)", visible: true }, { id: "redBall", type: "boia vermelha descendo e ficando cinza-azulada", visible: true }],
    animations: [
      lin("colorBar.show", W("s4", 3), W("s4", 6), 0, 1, "out"),
      lin("redBall.depth", W("s4", 7), W("s4", 16) + 10, 0, 1, "inOut"),
      lin("colorBar.fadeRed", W("s4", 8), W("s4", 16) + 8, 0, 1, "inOut"),
      lin("light.depth", W("s4", 19), end(3), 0, 0.25, "inOut"),
      lin("pod.depth", 0, end(3), 110, 170, "linear", "u3d"),
    ],
    badges: [{ text: "VERMELHO SOME PRIMEIRO", variant: "info", subtitle: "depois laranja, amarelo, verde…", appearAt: W("s4", 7), disappearAt: end(3) - 2 }],
    highlights: ["LUZ", "VERMELHO", "PRIMEIRA", "COR", "APAGA", "FUNDO", "AZUL"],
    captions: [cap("s4", 3, "Só que a luz não desce inteira. O vermelho é a primeira cor que a água apaga, por isso, quanto mais fundo, mais tudo fica azul.")],
    audioCues: [narration("s4"), sfx("shimmer", W("s4", 7), 0.18)],
  },
  // 5 — PRESSÃO (+ o copinho de isopor)
  {
    id: "scene-05-pressao",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "E a pressão aumenta rápido: a cada dez metros, ela sobe o peso de uma atmosfera inteira. Um copinho de isopor que desce bem fundo volta todo encolhido.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, pod(-2.0, 6, 10, 4)), key(W("s5", 17), P.press, "soft"), key(end(4), pod(-2.4, 4.6, -16, 6), "soft")] },
    objects: [...base, { id: "pressure", type: "setas de pressão apertando a batisfera + medidor 2D 'atm'", visible: true }, { id: "cups", type: "dois copinhos de isopor: normal × encolhido (prop simples)", visible: true }],
    animations: [
      lin("pod.depth", 0, end(4), 170, 260, "inOut", "u3d"),
      lin("gauge.atm", W("s5", 5), W("s5", 16), 18, 27, "linear"),
      lin("pressure.arrows", W("s5", 9), W("s5", 12) + 8, 0, 1, "out"),
      pop("cups.show", W("s5", 18)),
      lin("cups.shrink", W("s5", 24), c(4, W("s5", 27) + 10), 0, 1, "inOut"),
      ...mascot.jump(W("s5", 26)),
    ],
    badges: [
      { text: "+1 ATM A CADA 10 m", variant: "warning", appearAt: W("s5", 5), disappearAt: W("s5", 17) - 2 },
      { text: "O ISOPOR ENCOLHE", variant: "info", subtitle: "a água esmaga o ar de dentro", appearAt: W("s5", 24), disappearAt: end(4) - 2 },
    ],
    highlights: ["PRESSÃO", "DEZ", "METROS", "ATMOSFERA", "ISOPOR", "ENCOLHIDO"],
    captions: [cap("s5", 4, "E a pressão aumenta rápido: a cada dez metros, ela sobe o peso de uma atmosfera inteira. Um copinho de isopor que desce bem fundo volta todo encolhido.")],
    audioCues: [narration("s5"), sfx("pressure", W("s5", 9), 0.2), sfx("strain", W("s5", 24), 0.16)],
  },
  // 6 — ZONA DO CREPÚSCULO (200–1.000 m): olhos grandes e luz na barriga
  {
    id: "scene-06-crepusculo",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "De duzentos a mil metros fica a zona do crepúsculo, só com um restinho de luz azul. Muitos peixes daqui têm olhos enormes e luzinhas na barriga, para sumir contra a claridade de cima.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, pod(-2.4, 4.6, -16, 6)), key(W("s6", 6), P.twilight, "soft"), key(W("s6", 17), pod(depthY(600), 3.6, 4, -10), "soft"), key(end(5), pod(depthY(650), 4.2, 14, -14), "soft")] },
    objects: [...base, { id: "lanternfish", type: "peixes-lanterna (DESIGN NOVO): olhos grandes, pontinhos de luz na barriga", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s6", 9), 260, 600, "inOut", "u3d"),
      lin("light.depth", 0, W("s6", 15), 0.25, 0.45, "inOut"),
      lin("zone.twilight", W("s6", 6), W("s6", 9) + 8, 0, 1, "out"),
      pop("lantern.show", W("s6", 17)),
      lin("lantern.bellyGlow", W("s6", 23), W("s6", 26) + 8, 0, 1, "out"),
      lin("lantern.hide", W("s6", 27), c(5, W("s6", 33) + 10), 0, 1, "inOut"), // visto de baixo, a silhueta some na claridade
    ],
    badges: [
      { text: "ZONA DO CREPÚSCULO", variant: "info", subtitle: "200 a 1.000 m · mesopelágica", appearAt: W("s6", 6), disappearAt: W("s6", 17) - 2 },
      { text: "LUZ NA BARRIGA = CAMUFLAGEM", variant: "positive", subtitle: "some vista de baixo", appearAt: W("s6", 24), disappearAt: end(5) - 2 },
    ],
    highlights: ["MIL", "CREPÚSCULO", "AZUL", "OLHOS", "ENORMES", "LUZINHAS", "BARRIGA", "SUMIR"],
    captions: [cap("s6", 5, "De duzentos a mil metros fica a zona do crepúsculo, só com um restinho de luz azul. Muitos peixes daqui têm olhos enormes e luzinhas na barriga, para sumir contra a claridade de cima.")],
    audioCues: [narration("s6"), sfx("dive", 0, 0.18), sfx("shimmer", W("s6", 23), 0.18)],
  },
  // 7 — A MAIOR MIGRAÇÃO DO PLANETA
  {
    id: "scene-07-migracao",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "E toda noite, bilhões de animais sobem daqui para comer perto da superfície e voltam antes do amanhecer. É a maior migração do planeta, e acontece todo dia.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, pod(depthY(650), 4.2, 14, -14)), key(W("s7", 3), P.twilightWide, "soft"), key(end(6), P.twilightWide, "soft")] },
    objects: [...base, { id: "lanternfish", type: "cardume grande de peixes-lanterna + zooplâncton", visible: true }, { id: "dayNight", type: "ícone 2D sol/lua no topo da coluna", visible: true }],
    animations: [
      lin("dayNight.night", W("s7", 1), W("s7", 2) + 8, 0, 1, "inOut"),
      lin("lantern.migrate", W("s7", 3), W("s7", 12), 0, 1, "inOut"),
      lin("dayNight.night", W("s7", 14), W("s7", 17), undefined, 0, "inOut"),
      lin("lantern.migrate", W("s7", 14), W("s7", 17) + 10, undefined, 0, "inOut"),
      ...mascot.look(W("s7", 6), 0.6, 12),
    ],
    badges: [{ text: "A MAIOR MIGRAÇÃO DO PLANETA", variant: "positive", subtitle: "sobe à noite, desce de dia", appearAt: W("s7", 18), disappearAt: end(6) - 2 }],
    highlights: ["NOITE", "BILHÕES", "ANIMAIS", "SUPERFÍCIE", "AMANHECER", "MAIOR", "MIGRAÇÃO", "DIA"],
    captions: [cap("s7", 6, "E toda noite, bilhões de animais sobem daqui para comer perto da superfície e voltam antes do amanhecer. É a maior migração do planeta, e acontece todo dia.")],
    audioCues: [narration("s7"), sfx("whoosh-soft", W("s7", 3), 0.2), sfx("whoosh-soft", W("s7", 14), 0.18), sfx("badge", W("s7", 18), 0.24)],
  },
  // 8 — ZONA DA MEIA-NOITE (1.000–4.000 m)
  {
    id: "scene-08-meia-noite",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a única luz vem dos próprios animais.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.twilightWide), key(W("s8", 4), P.midnight, "soft"), key(end(7), pod(depthY(1700), 5, 10, 4), "soft")] },
    objects: [...base, { id: "podLamp", type: "farol da batisfera (cone de luz)", visible: true }, { id: "jellies", type: "águas-vivas bioluminescentes (DESIGN NOVO) + faíscas azuis", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s8", 6), 600, 1600, "inOut", "u3d"),
      lin("light.depth", W("s8", 2), W("s8", 5), undefined, 1, "in"),
      lin("podLamp.on", W("s8", 5), W("s8", 6) + 4, 0, 1, "out"),
      lin("zone.midnight", W("s8", 6), W("s8", 10) + 8, 0, 1, "out"),
      lin("temp.show", W("s8", 13), W("s8", 17) + 6, 0, 1, "out"),
      lin("podLamp.on", W("s8", 19), W("s8", 21), undefined, 0.15, "inOut"),
      lin("biolum.show", W("s8", 19), c(7, W("s8", 25) + 10), 0, 1, "out"),
    ],
    badges: [
      { text: "ZONA DA MEIA-NOITE", variant: "info", subtitle: "1.000 a 4.000 m · batipelágica", appearAt: W("s8", 6), disappearAt: W("s8", 19) - 2 },
      { text: "LUZ DOS PRÓPRIOS ANIMAIS", variant: "positive", subtitle: "bioluminescência", appearAt: W("s8", 19), disappearAt: end(7) - 2 },
    ],
    highlights: ["MIL", "ESCURIDÃO", "TOTAL", "MEIA-NOITE", "QUATRO", "GRAUS", "LUZ", "ANIMAIS"],
    captions: [cap("s8", 7, "Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a única luz vem dos próprios animais.")],
    audioCues: [narration("s8"), sfx("deep-amb", 0, 0.18), sfx("click", W("s8", 5), 0.2), sfx("shimmer", W("s8", 19), 0.22)],
  },
  // 9 — TAMBORIL E O "VERMELHO INVISÍVEL"
  {
    id: "scene-09-tamboril",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "O tamboril balança uma isca que brilha para atrair presas até a boca. E muitos bichos daqui são vermelhos, porque sem luz vermelha, o vermelho fica preto, quase invisível.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, pod(depthY(1700), 5, 10, 4)), key(W("s9", 1), pod(depthY(1800), 3.4, -10, 2), "soft"), key(W("s9", 13), pod(depthY(1850), 3.6, 14, 4), "soft"), key(end(8), pod(depthY(1900), 4.4, 4, 4), "soft")] },
    objects: [...base, { id: "angler", type: "tamboril com isca de luz (DESIGN NOVO)", visible: true }, { id: "redShrimp", type: "camarão vermelho de águas profundas (DESIGN NOVO): vermelho no farol, preto no escuro", visible: true }],
    animations: [
      pop("angler.show", W("s9", 1)),
      lin("angler.lure", W("s9", 2), W("s9", 6) + 10, 0, 1, "inOut"),
      lin("angler.bite", W("s9", 10), W("s9", 12) + 6, 0, 1, "out"),
      pop("shrimp.show", W("s9", 15)),
      lin("podLamp.on", W("s9", 15), W("s9", 17), undefined, 1, "out"), // no farol: vermelho
      lin("podLamp.on", W("s9", 19), W("s9", 22) + 6, undefined, 0, "inOut"), // sem luz: some
      ...mascot.jump(W("s9", 11)),
    ],
    badges: [
      { text: "ISCA DE LUZ", variant: "info", subtitle: "o tamboril pesca no escuro", appearAt: W("s9", 3), disappearAt: W("s9", 13) - 2 },
      { text: "VERMELHO = INVISÍVEL", variant: "positive", subtitle: "sem luz vermelha, vira preto", appearAt: W("s9", 19), disappearAt: end(8) - 2 },
    ],
    highlights: ["TAMBORIL", "ISCA", "BRILHA", "BOCA", "VERMELHOS", "PRETO", "INVISÍVEL"],
    captions: [cap("s9", 8, "O tamboril balança uma isca que brilha para atrair presas até a boca. E muitos bichos daqui são vermelhos, porque sem luz vermelha, o vermelho fica preto, quase invisível.")],
    audioCues: [narration("s9"), sfx("glow", W("s9", 3), 0.2), sfx("pop", W("s9", 11), 0.2), sfx("click", W("s9", 19), 0.18)],
  },
  // 10 — O CACHALOTE
  {
    id: "scene-10-cachalote",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, pod(depthY(1900), 4.4, 4, 4)), key(W("s10", 3), P.whale, "soft"), key(end(9), pod(depthY(2100), 7, -8, 2), "soft")] },
    objects: [...base, { id: "spermWhale", type: "cachalote (DESIGN NOVO, cabeça quadrada) mergulhando de cabeça", visible: true }, { id: "squid", type: "lula (DESIGN NOVO)", visible: true }],
    animations: [
      lin("podLamp.on", 0, 8, undefined, 0.8, "out"),
      lin("pod.depth", 0, end(9), 1900, 2100, "linear", "u3d"),
      lin("whale.dive", W("s10", 2), W("s10", 10) + 10, 0, 1, "inOut"),
      lin("squid.flee", W("s10", 15), c(9, W("s10", 17) + 12), 0, 1, "out"),
      ...mascot.jump(W("s10", 4)),
    ],
    badges: [{ text: "CACHALOTE: ~2.000 m", variant: "info", subtitle: "num único fôlego", appearAt: W("s10", 4), disappearAt: end(9) - 2 }],
    highlights: ["CACHALOTE", "DOIS", "MIL", "METROS", "FÔLEGO", "LULAS"],
    captions: [cap("s10", 9, "Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas.")],
    audioCues: [narration("s10"), sfx("whoosh-big", W("s10", 2), 0.22), sfx("bubbles", W("s10", 11), 0.16)],
  },
  // 11 — ABISMO (4.000–6.000 m) e a neve marinha
  {
    id: "scene-11-abismo",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "De quatro a seis mil metros é o abismo: planícies enormes de lama gelada. Lá cai devagar uma chuva de restos lá de cima, a neve marinha, que pode levar semanas para chegar ao fundo e vira comida de quem vive ali.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, pod(depthY(2100), 7, -8, 2)), key(W("s11", 6), P.abyss, "soft"), key(W("s11", 27), pod(depthY(5800), 4.6, 26, 14), "soft"), key(end(10), pod(depthY(5900), 4.2, 8, 10), "soft")] },
    objects: [...base, { id: "abyssPlain", type: "planície abissal: plataforma de lama lateral + pepinos-do-mar (DESIGN NOVO)", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s11", 8), 2100, 5600, "inOut", "u3d"),
      lin("zone.abyss", W("s11", 6), W("s11", 8) + 8, 0, 1, "out"),
      lin("snow.amount", W("s11", 14), W("s11", 20), 0.2, 1, "inOut"),
      lin("snow.trace", W("s11", 27), W("s11", 34), 0, 1, "inOut"), // um floco acompanhado até o fundo (relógio 2D "semanas")
      lin("cucumber.eat", W("s11", 36), c(10, W("s11", 41) + 10), 0, 1, "inOut"),
    ],
    badges: [
      { text: "ABISMO", variant: "info", subtitle: "4.000 a 6.000 m · abissopelágica", appearAt: W("s11", 6), disappearAt: W("s11", 24) - 2 },
      { text: "NEVE MARINHA", variant: "info", subtitle: "pode levar semanas para cair", appearAt: W("s11", 24), disappearAt: end(10) - 2 },
    ],
    highlights: ["QUATRO", "SEIS", "MIL", "ABISMO", "LAMA", "GELADA", "NEVE", "MARINHA", "SEMANAS", "COMIDA"],
    captions: [cap("s11", 10, "De quatro a seis mil metros é o abismo: planícies enormes de lama gelada. Lá cai devagar uma chuva de restos lá de cima, a neve marinha, que pode levar semanas para chegar ao fundo e vira comida de quem vive ali.")],
    audioCues: [narration("s11"), sfx("dive", 0, 0.2), sfx("shimmer", W("s11", 24), 0.18)],
  },
  // 12 — ZONA HADAL (6.000–~11.000 m)
  {
    id: "scene-12-hadal",
    startFrame: sc(11).from,
    durationInFrames: sc(11).durationInFrames,
    voKey: "s12",
    narration: "Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da superfície.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, pod(depthY(5900), 4.2, 8, 10)), key(W("s12", 5), P.hadal, "soft"), key(W("s12", 16), P.hadalBottom, "soft"), key(end(11), pod(depthY(10900), 4.2, -6, 4), "soft")] },
    objects: [...base, { id: "trench", type: "paredes da fossa se estreitando (rocha escura)", visible: true }, { id: "gauge", type: "medidor 2D de pressão: 1.000+ atm", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s12", 18), 5600, 10900, "inOut", "u3d"),
      lin("zone.hadal", W("s12", 5), W("s12", 7) + 8, 0, 1, "out"),
      lin("gauge.atm", W("s12", 16), W("s12", 26) + 10, 600, 1090, "out"),
      lin("pressure.arrows", W("s12", 21), W("s12", 23) + 8, 0, 1, "out"),
      ...fx.shake(W("s12", 25)),
      ...mascot.jump(W("s12", 25)),
    ],
    badges: [
      { text: "ZONA HADAL", variant: "info", subtitle: "6.000 a ~11.000 m · nas fossas", appearAt: W("s12", 5), disappearAt: W("s12", 16) - 2 },
      { text: "+1.000× A PRESSÃO", variant: "warning", subtitle: "da superfície", appearAt: W("s12", 21), disappearAt: end(11) - 2 },
    ],
    highlights: ["FOSSAS", "HADAL", "HADES", "MORTOS", "ONZE", "MIL", "PRESSÃO", "VEZES"],
    captions: [cap("s12", 11, "Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da superfície.")],
    audioCues: [narration("s12"), sfx("rumble-soft", W("s12", 5), 0.18), sfx("strain", W("s12", 21), 0.2)],
  },
  // 13 — AINDA ASSIM, VIDA (peixe-caracol) + quase ninguém foi lá
  {
    id: "scene-13-vida-hadal",
    startFrame: sc(12).from,
    durationInFrames: sc(12).durationInFrames,
    voKey: "s13",
    narration: "Mesmo assim, tem vida: um peixe-caracol já foi filmado a mais de oito mil metros. E pouquíssimas pessoas desceram até o ponto mais fundo, bem menos do que as que já foram ao espaço.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, pod(depthY(10900), 4.2, -6, 4)), key(W("s13", 4), pod(depthY(8300), 3.6, 12, 4), "soft"), key(W("s13", 15), pod(depthY(10900), 5, -10, 6), "soft"), key(end(12), pod(depthY(10900), 5.4, 8, 8), "soft")] },
    objects: [...base, { id: "snailfish", type: "peixe-caracol (DESIGN NOVO), translúcido e rosado", visible: true }, { id: "peopleCard", type: "cartão 2D: ~30 pessoas no fundo × 600+ no espaço (ícones)", visible: true }],
    animations: [
      pop("snail.show", W("s13", 4)),
      lin("depthTag.8336", W("s13", 9), W("s13", 14) + 6, 0, 1, "out"), // etiqueta "8.336 m" (2022)
      pop("peopleCard.show", W("s13", 16)),
      lin("peopleCard.space", W("s13", 24), c(12, W("s13", 33) + 10), 0, 1, "out"),
      ...mascot.wave(W("s13", 2), s(1.2)),
    ],
    badges: [
      { text: "PEIXE MAIS FUNDO: 8.336 m", variant: "positive", subtitle: "peixe-caracol filmado em 2022", appearAt: W("s13", 4), disappearAt: W("s13", 15) - 2 },
      { text: "MAIS GENTE NO ESPAÇO", variant: "warning", subtitle: "do que no fundo do mar", appearAt: W("s13", 24), disappearAt: end(12) - 2 },
    ],
    highlights: ["VIDA", "PEIXE-CARACOL", "OITO", "MIL", "POUQUÍSSIMAS", "PESSOAS", "ESPAÇO"],
    captions: [cap("s13", 12, "Mesmo assim, tem vida: um peixe-caracol já foi filmado a mais de oito mil metros. E pouquíssimas pessoas desceram até o ponto mais fundo, bem menos do que as que já foram ao espaço.")],
    audioCues: [narration("s13"), sfx("pop-high", W("s13", 4), 0.2), sfx("badge", W("s13", 24), 0.24)],
  },
  // 14 — ESCALA REAL: a faixa do sol + o fundo quase sem mapa
  {
    id: "scene-14-escala-real",
    startFrame: sc(13).from,
    durationInFrames: sc(13).durationInFrames,
    voKey: "s14",
    narration: "Agora olha o oceano em escala real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro, e menos de um terço do fundo do mar foi mapeado em detalhe.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, pod(depthY(10900), 5.4, 8, 8)), key(W("s14", 3), P.realTop, "soft"), key(W("s14", 16), orbit([XB, -1.5, 0], 18, 8, 6), "soft"), key(end(13), P.realTop, "soft")] },
    objects: [...base, { id: "realBands", type: "faixas das zonas na coluna B com a espessura real", visible: true }, { id: "mapCard", type: "cartão 2D: fundo do mar ~29% mapeado (barra)", visible: true }],
    animations: [
      ...fx.whipOut(W("s14", 3) - 2, -1),
      lin("realBands.show", W("s14", 4), W("s14", 6) + 10, 0, 1, "out"),
      lin("realSun.pulse", W("s14", 8), W("s14", 15), 0, 1, "inOut"),
      lin("realDark.show", W("s14", 16), W("s14", 20) + 10, 0, 1, "inOut"),
      pop("mapCard.show", W("s14", 22)),
    ],
    badges: [
      { text: "SÓ 200 m DE LUZ", variant: "warning", subtitle: "de até 11.000 m de profundidade", appearAt: W("s14", 7), disappearAt: W("s14", 21) - 2 },
      { text: "< 1/3 DO FUNDO MAPEADO", variant: "info", subtitle: "Seabed 2030: ~29%", appearAt: W("s14", 22), disappearAt: end(13) - 2 },
    ],
    highlights: ["ESCALA", "REAL", "SOL", "FININHA", "ESCURO", "TERÇO", "MAPEADO"],
    captions: [cap("s14", 13, "Agora olha o oceano em escala real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro, e menos de um terço do fundo do mar foi mapeado em detalhe.")],
    audioCues: [narration("s14"), sfx("whoosh", W("s14", 3), 0.24), sfx("glow", W("s14", 8), 0.22), sfx("badge", W("s14", 22), 0.22)],
  },
  // 15 — PRONTO (+ encerramento fixo da marca nos últimos ~4,7 s)
  {
    id: "scene-15-final",
    startFrame: sc(14).from,
    durationInFrames: sc(14).durationInFrames,
    voKey: "s15",
    narration: "Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.realTop), key(s(1.4), P.both, "soft"), key(end(14), orbit([XB / 2, -8, 0], 44, 14, 8), "linear")] },
    objects: [...base, { id: "zoneLabels", type: "5 rótulos das zonas acendendo de cima para baixo na coluna A", visible: true }],
    animations: [
      lin("zoneLabels.reveal", W("s15", 4), W("s15", 15) + 10, 0, 1, "linear"),
      lin("pod.depth", 0, s(3), 10900, 0, "inOut", "u3d"),
      ...mascot.cheer(W("s15", 0), s(1.6)),
      ...fx.burst("final", W("s15", 0)),
    ],
    badges: [{ text: "5 ZONAS DO OCEANO", variant: "positive", subtitle: "sol · crepúsculo · meia-noite · abismo · hadal", appearAt: W("s15", 0), disappearAt: W("s15", 15) + 30 }],
    highlights: ["PRONTO", "CINCO", "ZONAS", "OCEANO", "SOL", "FOSSAS"],
    captions: [cap("s15", 14, "Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas.")],
    audioCues: [narration("s15"), sfx("final", W("s15", 0), 0.28)],
  },
];

/** Valor de uma trilha (ex.: "pod.depth" em metros reais) no frame global. */
export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);
export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
