// scene-plan.ts — "As zonas de profundidade do oceano" (formato FATOS/DOCUMENTÁRIO) — roteiro v1, AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa até o TTS;
// c(i, f) prende a âncora ao fim da cena). Linha do tempo determinística (sem timers / Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 100;   // 3000 frames (1:40); encerramento da marca (~4,7 s) no fim da s11
//   export const VO_KEYS = ["s1", ..., "s11"] as const;
//   const PLANNED_SECONDS = [9.4, 5.4, 6.3, 5.4, 13.2, 10.1, 7.2, 9.3, 12.0, 7.6, 14.1];
//   const GAPS = [0.7, 0.5, 0.6, 0.7, 0.8, 0.6, 0.8, 0.8, 1.2, 0.8];
//   TTS: edge-tts pt-BR-AntonioNeural, rate +6% (cta em +0%).
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
    objects: [...base, { id: "everest", type: "Monte Everest low-poly (rocha + neve) dentro da fossa da coluna B", visible: true, state: { start: "abaixo do fundo", end: "pico a 2 km da superfície" } }],
    animations: [
      lin("pod.depth", 0, 1, 0, 0, "linear", "u3d"), lin("light.depth", 0, 1, 0, 0),
      lin("everest.rise", W("s1", 0), W("s1", 4) + 12, 0, 1, "out"),
      lin("bracket.water", W("s1", 12), W("s1", 19), 0, 1, "out"), // colchete "2 km de água" acima do pico
      ...fx.whipOut(end(0)),
      ...mascot.place([0.6, 0.1, 0.5], 0.3, 0.32, 0), // mascote dentro da batisfera, boiando na superfície
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
  // 2 — ZONA DO SOL (0–200 m)
  {
    id: "scene-02-zona-sol",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.surface), key(end(1), P.sun, "soft")] },
    objects: [...base, { id: "surface", type: "superfície com ondas, Sol, barco de pesca (Boat) e cardume (Fish)", visible: true }, { id: "sunRays", type: "raios de luz entrando na água (cones translúcidos)", visible: true }],
    animations: [
      ...fx.whipIn(),
      lin("sunRays.show", 0, W("s2", 8), 0.3, 1, "out"),
      lin("zone.sun", W("s2", 5), W("s2", 8) + 8, 0, 1, "out"), // a faixa 0–200 m acende na régua
      lin("pod.depth", W("s2", 2), end(1), 0, 120, "inOut", "u3d"), // começa a descer (valor = metros reais)
    ],
    badges: [{ text: "ZONA DO SOL", variant: "info", subtitle: "0 a 200 m · epipelágica", appearAt: W("s2", 5), disappearAt: end(1) - 2 }],
    highlights: ["DUZENTOS", "METROS", "ZONA", "SOL", "ILUMINADA"],
    captions: [cap("s2", 1, "Os primeiros duzentos metros são a zona do sol, a única parte bem iluminada.")],
    audioCues: [narration("s2"), sfx("water-rise", 0, 0.2), sfx("shimmer", W("s2", 8), 0.2)],
  },
  // 3 — ALGAS E OXIGÊNIO
  {
    id: "scene-03-oxigenio",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "Aqui as algas fazem fotossíntese, e o oceano produz cerca de metade do oxigênio do planeta.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.sun), key(end(2), P.algae, "soft")] },
    objects: [...base, { id: "plankton", type: "fitoplâncton: partículas verdes", visible: true }, { id: "o2", type: "bolhas de O₂ subindo", visible: true }, { id: "o2Card", type: "cartão 2D: pizza 'metade do oxigênio' (oceano × terra)", visible: true }],
    animations: [
      lin("plankton.show", W("s3", 1), W("s3", 4) + 6, 0, 1, "out"),
      lin("o2.flow", W("s3", 3), end(2), 0, 1, "linear"),
      pop("o2Card.show", W("s3", 9)),
      lin("pod.depth", 0, end(2), 120, 180, "linear", "u3d"),
    ],
    badges: [{ text: "~METADE DO OXIGÊNIO", variant: "positive", subtitle: "vem do oceano (NOAA)", appearAt: W("s3", 9), disappearAt: end(2) - 2 }],
    highlights: ["ALGAS", "FOTOSSÍNTESE", "METADE", "OXIGÊNIO", "PLANETA"],
    captions: [cap("s3", 2, "Aqui as algas fazem fotossíntese, e o oceano produz cerca de metade do oxigênio do planeta.")],
    audioCues: [narration("s3"), sfx("bubbles", W("s3", 3), 0.2), sfx("badge", W("s3", 9), 0.24)],
  },
  // 4 — PRESSÃO
  {
    id: "scene-04-pressao",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "E a cada dez metros que você desce, a pressão sobe o peso de uma atmosfera.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.algae), key(end(3), P.press, "soft")] },
    objects: [...base, { id: "pressure", type: "setas de pressão apertando a batisfera + medidor 2D 'atm'", visible: true }],
    animations: [
      lin("pod.depth", 0, end(3), 180, 260, "inOut", "u3d"),
      lin("pressure.arrows", W("s4", 8), W("s4", 10) + 8, 0, 1, "out"),
      lin("gauge.atm", W("s4", 2), end(3), 19, 27, "linear"), // 1 + profundidade/10 (mostrado em 2D)
      ...mascot.jump(W("s4", 9)),
    ],
    badges: [{ text: "+1 ATM A CADA 10 m", variant: "warning", appearAt: W("s4", 3), disappearAt: end(3) - 2 }],
    highlights: ["DEZ", "METROS", "PRESSÃO", "ATMOSFERA"],
    captions: [cap("s4", 3, "E a cada dez metros que você desce, a pressão sobe o peso de uma atmosfera.")],
    audioCues: [narration("s4"), sfx("pressure", W("s4", 8), 0.2)],
  },
  // 5 — ZONA DO CREPÚSCULO (200–1.000 m) + a maior migração
  {
    id: "scene-05-crepusculo",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "De duzentos a mil metros fica a zona do crepúsculo, com um restinho de luz azul. Toda noite, bilhões de animais sobem daqui para comer e voltam antes do amanhecer: a maior migração do planeta.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.press), key(W("s5", 6), P.twilight, "soft"), key(W("s5", 16), P.twilightWide, "soft"), key(end(4), P.twilight, "soft")] },
    objects: [...base, { id: "lanternfish", type: "cardume de peixes-lanterna (DESIGN NOVO) com pontinhos de luz", visible: true }, { id: "dayNight", type: "ícone 2D sol/lua no canto da superfície", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s5", 9), 260, 600, "inOut", "u3d"),
      lin("light.depth", 0, W("s5", 15), 0, 0.45, "inOut"), // a cor da água esfria para azul escuro
      lin("zone.twilight", W("s5", 6), W("s5", 9) + 8, 0, 1, "out"),
      lin("dayNight.night", W("s5", 16), W("s5", 17) + 8, 0, 1, "inOut"),
      lin("lantern.migrate", W("s5", 18), W("s5", 25), 0, 1, "inOut"), // sobem até a zona do sol
      lin("dayNight.night", W("s5", 26), W("s5", 29), undefined, 0, "inOut"),
      lin("lantern.migrate", W("s5", 26), W("s5", 29) + 10, undefined, 0, "inOut"), // e descem de volta
      ...mascot.look(W("s5", 21), 0.6, 12),
    ],
    badges: [
      { text: "ZONA DO CREPÚSCULO", variant: "info", subtitle: "200 a 1.000 m · mesopelágica", appearAt: W("s5", 6), disappearAt: W("s5", 16) - 2 },
      { text: "A MAIOR MIGRAÇÃO DO PLANETA", variant: "positive", subtitle: "sobe e desce todo dia", appearAt: W("s5", 30), disappearAt: end(4) - 2 },
    ],
    highlights: ["MIL", "CREPÚSCULO", "AZUL", "NOITE", "BILHÕES", "ANIMAIS", "MAIOR", "MIGRAÇÃO"],
    captions: [cap("s5", 4, "De duzentos a mil metros fica a zona do crepúsculo, com um restinho de luz azul. Toda noite, bilhões de animais sobem daqui para comer e voltam antes do amanhecer: a maior migração do planeta.")],
    audioCues: [narration("s5"), sfx("whoosh-soft", W("s5", 18), 0.2), sfx("whoosh-soft", W("s5", 26), 0.18), sfx("badge", W("s5", 30), 0.24)],
  },
  // 6 — ZONA DA MEIA-NOITE (1.000–4.000 m): escuro e bioluminescência
  {
    id: "scene-06-meia-noite",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a única luz vem dos próprios animais.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.twilight), key(W("s6", 4), P.midnight, "soft"), key(end(5), pod(depthY(1700), 5, 10, 4), "soft")] },
    objects: [...base, { id: "deepLife", type: "tamboril com isca de luz, águas-vivas brilhantes, faíscas azuis (DESIGNS NOVOS)", visible: true }, { id: "podLamp", type: "farol da batisfera (cone de luz)", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s6", 6), 600, 1600, "inOut", "u3d"),
      lin("light.depth", W("s6", 2), W("s6", 5), undefined, 1, "in"), // apaga tudo
      lin("podLamp.on", W("s6", 5), W("s6", 6) + 4, 0, 1, "out"),
      lin("zone.midnight", W("s6", 6), W("s6", 10) + 8, 0, 1, "out"),
      lin("temp.show", W("s6", 13), W("s6", 17) + 6, 0, 1, "out"),
      lin("biolum.show", W("s6", 19), c(5, W("s6", 25) + 10), 0, 1, "out"),
      lin("podLamp.on", W("s6", 20), W("s6", 22), undefined, 0.15, "inOut"), // baixa o farol para ver o brilho deles
    ],
    badges: [
      { text: "ZONA DA MEIA-NOITE", variant: "info", subtitle: "1.000 a 4.000 m · batipelágica", appearAt: W("s6", 6), disappearAt: W("s6", 19) - 2 },
      { text: "LUZ DOS PRÓPRIOS ANIMAIS", variant: "positive", subtitle: "bioluminescência", appearAt: W("s6", 19), disappearAt: end(5) - 2 },
    ],
    highlights: ["MIL", "ESCURIDÃO", "TOTAL", "MEIA-NOITE", "QUATRO", "GRAUS", "LUZ", "ANIMAIS"],
    captions: [cap("s6", 5, "Passou de mil metros, escuridão total. É a zona da meia-noite: a água fica perto de quatro graus, e a única luz vem dos próprios animais.")],
    audioCues: [narration("s6"), sfx("deep-amb", 0, 0.18), sfx("click", W("s6", 5), 0.2), sfx("shimmer", W("s6", 19), 0.22)],
  },
  // 7 — O CACHALOTE
  {
    id: "scene-07-cachalote",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, pod(depthY(1700), 5, 10, 4)), key(W("s7", 3), P.whale, "soft"), key(end(6), pod(depthY(2100), 7, -8, 2), "soft")] },
    objects: [...base, { id: "spermWhale", type: "cachalote (DESIGN NOVO, cabeça quadrada) mergulhando de cabeça", visible: true }, { id: "squid", type: "lula (DESIGN NOVO)", visible: true }],
    animations: [
      lin("pod.depth", 0, end(6), 1600, 2000, "linear", "u3d"),
      lin("whale.dive", W("s7", 2), W("s7", 10) + 10, 0, 1, "inOut"), // vem de cima, passa pela batisfera
      lin("squid.flee", W("s7", 15), c(6, W("s7", 17) + 12), 0, 1, "out"),
      ...mascot.jump(W("s7", 4)),
    ],
    badges: [{ text: "CACHALOTE: ~2.000 m", variant: "info", subtitle: "num único fôlego", appearAt: W("s7", 4), disappearAt: end(6) - 2 }],
    highlights: ["CACHALOTE", "DOIS", "MIL", "METROS", "FÔLEGO", "LULAS"],
    captions: [cap("s7", 6, "Até aqui desce o cachalote, a cerca de dois mil metros, com um único fôlego, para caçar lulas.")],
    audioCues: [narration("s7"), sfx("whoosh-big", W("s7", 2), 0.22), sfx("bubbles", W("s7", 11), 0.16)],
  },
  // 8 — ABISMO (4.000–6.000 m) + neve marinha
  {
    id: "scene-08-abismo",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "De quatro a seis mil metros é o abismo: planícies de lama gelada, onde cai devagar uma chuva de restos lá de cima, a neve marinha.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, pod(depthY(2100), 7, -8, 2)), key(W("s8", 6), P.abyss, "soft"), key(end(7), pod(depthY(5600), 5.5, 26, 12), "soft")] },
    objects: [...base, { id: "abyssPlain", type: "planície abissal: plataforma de lama lateral com pepinos-do-mar (DESIGN NOVO)", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s8", 8), 2000, 5200, "inOut", "u3d"),
      lin("zone.abyss", W("s8", 6), W("s8", 8) + 8, 0, 1, "out"),
      lin("snow.amount", W("s8", 14), W("s8", 19), 0.2, 1, "inOut"),
      lin("podLamp.on", 0, 10, undefined, 0.8, "inOut"),
    ],
    badges: [
      { text: "ABISMO", variant: "info", subtitle: "4.000 a 6.000 m · abissopelágica", appearAt: W("s8", 6), disappearAt: W("s8", 23) - 2 },
      { text: "NEVE MARINHA", variant: "info", subtitle: "restos que caem lá de cima", appearAt: W("s8", 23), disappearAt: end(7) - 2 },
    ],
    highlights: ["QUATRO", "SEIS", "MIL", "ABISMO", "LAMA", "GELADA", "NEVE", "MARINHA"],
    captions: [cap("s8", 7, "De quatro a seis mil metros é o abismo: planícies de lama gelada, onde cai devagar uma chuva de restos lá de cima, a neve marinha.")],
    audioCues: [narration("s8"), sfx("dive", 0, 0.2), sfx("shimmer", W("s8", 23), 0.18)],
  },
  // 9 — ZONA HADAL (6.000–~11.000 m): fossas e pressão extrema
  {
    id: "scene-09-hadal",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da superfície.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, pod(depthY(5600), 5.5, 26, 12)), key(W("s9", 5), P.hadal, "soft"), key(W("s9", 16), P.hadalBottom, "soft"), key(end(8), pod(depthY(10900), 4.2, -6, 4), "soft")] },
    objects: [...base, { id: "trench", type: "paredes da fossa se estreitando (rocha escura)", visible: true }, { id: "gauge", type: "medidor 2D de pressão: 1.000+ atm", visible: true }],
    animations: [
      lin("pod.depth", 0, W("s9", 18), 5200, 10900, "inOut", "u3d"),
      lin("zone.hadal", W("s9", 5), W("s9", 7) + 8, 0, 1, "out"),
      lin("gauge.atm", W("s9", 16), W("s9", 26) + 10, 600, 1090, "out"),
      lin("pressure.arrows", W("s9", 21), W("s9", 23) + 8, 0, 1, "out"),
      ...fx.shake(W("s9", 25)),
      ...mascot.jump(W("s9", 25)),
    ],
    badges: [
      { text: "ZONA HADAL", variant: "info", subtitle: "6.000 a ~11.000 m · nas fossas", appearAt: W("s9", 5), disappearAt: W("s9", 16) - 2 },
      { text: "+1.000× A PRESSÃO", variant: "warning", subtitle: "da superfície", appearAt: W("s9", 21), disappearAt: end(8) - 2 },
    ],
    highlights: ["FOSSAS", "HADAL", "HADES", "MORTOS", "ONZE", "MIL", "PRESSÃO", "MIL VEZES"],
    captions: [cap("s9", 8, "Mais fundo, só nas fossas: a zona hadal, de Hades, o deus do mundo dos mortos. Perto de onze mil metros, a pressão passa de mil vezes a da superfície.")],
    audioCues: [narration("s9"), sfx("rumble-soft", W("s9", 5), 0.18), sfx("strain", W("s9", 21), 0.2)],
  },
  // 10 — ESCALA REAL: a zona do sol é uma faixa fininha
  {
    id: "scene-10-escala-real",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "E olha o oceano em escala real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, pod(depthY(10900), 4.2, -6, 4)), key(W("s10", 3), P.realTop, "soft"), key(end(9), orbit([XB, -1.5, 0], 18, 8, 6), "soft")] },
    objects: [...base, { id: "realBands", type: "faixas coloridas das zonas na coluna B com a espessura real", visible: true }],
    animations: [
      ...fx.whipOut(W("s10", 3) - 2, -1),
      lin("realBands.show", W("s10", 4), W("s10", 6) + 10, 0, 1, "out"),
      lin("realSun.pulse", W("s10", 8), W("s10", 15), 0, 1, "inOut"), // a faixa do sol pisca
      lin("realDark.show", W("s10", 16), end(9), 0, 1, "inOut"), // o resto escurece
    ],
    badges: [
      { text: "ESCALA REAL", variant: "info", subtitle: "1 km = 1 bloco", appearAt: W("s10", 3), disappearAt: W("s10", 7) - 2 },
      { text: "SÓ 200 m DE LUZ", variant: "warning", subtitle: "de até 11.000 m de profundidade", appearAt: W("s10", 7), disappearAt: end(9) - 2 },
    ],
    highlights: ["ESCALA", "REAL", "SOL", "FININHA", "ESCURO"],
    captions: [cap("s10", 9, "E olha o oceano em escala real: a zona do sol é só essa faixa fininha. Quase tudo fica no escuro.")],
    audioCues: [narration("s10"), sfx("whoosh", W("s10", 3), 0.24), sfx("glow", W("s10", 8), 0.22)],
  },
  // 11 — PRONTO (+ encerramento fixo da marca nos últimos ~4,7 s)
  {
    id: "scene-11-final",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([XB, -1.5, 0], 18, 8, 6)), key(s(1.4), P.both, "soft"), key(end(10), orbit([XB / 2, -8, 0], 44, 14, 8), "linear")] },
    objects: [...base, { id: "zoneLabels", type: "5 rótulos das zonas acendendo de cima para baixo na coluna A", visible: true }],
    animations: [
      lin("zoneLabels.reveal", W("s11", 4), W("s11", 15) + 10, 0, 1, "linear"),
      lin("pod.depth", 0, s(3), 10900, 0, "inOut", "u3d"), // a batisfera volta para a superfície
      ...mascot.cheer(W("s11", 0), s(1.6)),
      ...fx.burst("final", W("s11", 0)),
    ],
    badges: [{ text: "5 ZONAS DO OCEANO", variant: "positive", subtitle: "sol · crepúsculo · meia-noite · abismo · hadal", appearAt: W("s11", 0), disappearAt: W("s11", 15) + 30 }],
    highlights: ["PRONTO", "CINCO", "ZONAS", "OCEANO", "SOL", "FOSSAS"],
    captions: [cap("s11", 10, "Pronto: agora você conhece as cinco zonas do oceano, do sol até o fundo das fossas.")],
    audioCues: [narration("s11"), sfx("final", W("s11", 0), 0.28)],
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
