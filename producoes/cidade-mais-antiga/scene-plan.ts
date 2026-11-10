// scene-plan.ts — Qual é a cidade mais antiga que ainda existe? (roteiro v1, AGUARDANDO APROVAÇÃO)
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa.
// Linha do tempo determinística: tudo é função do frame (sem timers, Date.now ou Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 90;                    // 2700 frames a 30 fps
//   export const VO_KEYS = ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12","s13","s14"] as const;
//   const PLANNED_SECONDS = [7, 6.5, 6.5, 7, 6.5, 7, 5.5, 6, 6, 4.5, 6.5, 7, 5.5, 8.5]; // soma 90
//   const FIRST_VO = 0.45;  const LEAD = 0.25;
//   const GAPS = [0.8, 0.8, 0.8, 0.8, 0.9, 0.8, 0.8, 0.8, 0.9, 0.7, 1.2, 0.9, 0.9]; // 1,2 s antes da revelação
// ----------------------------------------------------------------------------------------------
//
// Mundo 3D (u3d, ESQUEMÁTICO). Um bloco de terreno em corte (x −30..30, z −3..3, topo y=0, base y=−8)
// com a face de corte em z=+3. Quatro "tells" (morros de cidades empilhadas) ao longo de x:
//   Roma x=−22 · Çatalhöyük x=−8 · Jericó x=6 · Damasco x=20.
// Profundidade = idade: 1 u3d ≈ 2.500 anos (régua do tempo na face de corte; selo "ESQUEMA").
//   Roma ~2.800 anos → camadas até y≈−1,1 · Damasco ≥4.000 → camadas registradas até y≈−1,6, abaixo "?" ·
//   Çatalhöyük ~9.000 → y≈−3,6 · Jericó ~11.000 (torre ~10.000 em y≈−4,0) → y≈−4,4, com 2 faixas vazias.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "low-poly-3d-arqueologia", language: "pt-BR" };

export type BadgeVariant = "positive" | "negative" | "info" | "warning";
export type CameraKey = { at: number; position: Vec3; target: Vec3; zoom?: number; easing?: EaseName };
export type CameraPlan = {
  projection: "perspective" | "orthographic";
  movement: "dolly-in" | "dolly-out" | "vertical" | "orbit" | "tracking" | "split" | "hold";
  keys: CameraKey[];
};
export type SceneObject = { id: string; type: string; visible: boolean; state?: { start: string; end: string } };
export type SceneBadge = {
  text: string; variant: BadgeVariant; appearAt: number; disappearAt?: number;
  subtitle?: string; slot?: "center" | "left" | "right"; icon?: "?"; size?: "normal" | "large";
};
export type CaptionBlock = { text: string; from: number; to: number };
export type AudioCue = { kind: "narration" | "sfx"; src: string; at: number; volume: number; status: "planned" | "ready" };
export type ScenePlan = {
  id: string; startFrame: number; durationInFrames: number; voKey: VoKey; narration: string;
  camera: CameraPlan; objects: SceneObject[]; animations: TrackAnimation[]; badges: SceneBadge[];
  highlights: string[]; captions: CaptionBlock[]; audioCues: AudioCue[];
};

const sc = (i: number) => SCENE_FRAMES[i];
const end = (i: number) => SCENE_FRAMES[i].durationInFrames;
const W = wordLocal;
const key = (at: number, pose: { position: Vec3; target: Vec3 }, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const narration = (k: VoKey, status: AudioCue["status"]): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "planned" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });

// Poses (orbit(alvo, distância, azimute°, elevação°); az 0 = de frente para a face de corte em z=+3).
const P = {
  romeHigh: orbit([-22, 1.2, 0], 16, 28, 26),
  romeCut: orbit([-22, -0.6, 3], 18, 12, 8),
  overview: orbit([0, -1.5, 0], 78, -58, 26),
  catalTop: orbit([-8, 0.8, 0], 16, 24, 22),
  catalCut: orbit([-8, -1.8, 3], 22, 10, 5),
  catalDeep: orbit([-8, -3.2, 3], 16, 6, 2),
  catalWide: orbit([-8, -1.4, 3], 26, 18, 10),
  jerTop: orbit([6, 0.8, 0], 17, 26, 20),
  jerTower: orbit([6, -3.8, 3], 14, 8, 3),
  jerCut: orbit([6, -2.2, 3], 24, 6, 4),
  jerGaps: orbit([6, -2.6, 3], 18, -8, 3),
  rules: orbit([-1, -1.5, 3], 40, 4, 8),
  damTop: orbit([20, 1.2, 0], 18, 30, 24),
  damCut: orbit([20, -1.2, 3], 20, 10, 6),
  damClose: orbit([20, -0.4, 3], 14, 14, 8),
  damHero: orbit([20, 0.8, 0], 15, -20, 14),
  compare: orbit([13, -1.8, 3], 34, -6, 5),
  final: orbit([0, -1.6, 0], 82, -56, 24),
  finalOrbit: orbit([0, -1.6, 0], 78, -46, 26),
};

// Objetos persistentes (ids estáveis).
const O = {
  terrain: { id: "terrain", type: "bloco-de-terreno-em-corte", visible: true },
  ruler: { id: "timeRuler", type: "régua-do-tempo na face de corte (hoje → 11.000 anos)", visible: true },
  rome: { id: "tellRome", type: "tell raso + cidade moderna (Roma)", visible: true },
  catal: { id: "tellCatal", type: "tell profundo, topo só ruína/grama (Çatalhöyük)", visible: true },
  jer: { id: "tellJericho", type: "tell mais profundo com torre e faixas vazias (Jericó)", visible: true },
  dam: { id: "tellDamascus", type: "tell coberto pela cidade atual, base '?' (Damasco)", visible: true },
  sky: { id: "sky", type: "fundo-degradê", visible: true },
};

export const scenes: ScenePlan[] = [
  // 1 — GANCHO
  {
    id: "scene-01-gancho",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration: "Qual é a cidade mais antiga que ainda existe? Roma tem quase três mil anos, e nem chega perto.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.romeHigh), key(W("s1", 9), P.romeCut, "soft"), key(end(0), P.overview, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, { ...O.rome, state: { start: "só a cidade na superfície", end: "corte mostra camadas rasas" } }, O.catal, O.jer, O.dam],
    animations: [
      { type: "spring", target: "rome.city", startFrame: -6, endFrame: 30, from: 0, to: 1, damping: 12, unit: "0-1" },
      { type: "interpolate", target: "rome.reveal", startFrame: W("s1", 9), endFrame: W("s1", 14), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "timeRuler.show", startFrame: W("s1", 11), endFrame: W("s1", 14) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "others.dim", startFrame: 0, endFrame: 1, from: 1, to: 1, unit: "0-1" },
      { type: "interpolate", target: "others.dim", startFrame: W("s1", 16), endFrame: end(0), to: 0.4, easing: "inOut", unit: "0-1" },
    ],
    badges: [
      { text: "QUAL É A MAIS ANTIGA?", variant: "warning", icon: "?", appearAt: W("s1", 0), disappearAt: W("s1", 9) - 2 },
      { text: "ROMA ≈ 2.800 ANOS", variant: "info", appearAt: W("s1", 9), disappearAt: end(0) - 2 },
    ],
    highlights: ["CIDADE", "ANTIGA", "EXISTE", "ROMA", "TRÊS", "MIL", "PERTO"],
    captions: [cap("s1", 0, "Qual é a cidade mais antiga que ainda existe? Roma tem quase três mil anos, e nem chega perto.")],
    audioCues: [narration("s1", "planned"), sfx("whoosh", 0, 0.28), sfx("pop-high", W("s1", 0), 0.26), sfx("badge", W("s1", 9), 0.26), sfx("dig", W("s1", 9), 0.22)],
  },
  // 2 — CIDADE SOBRE CIDADE
  {
    id: "scene-02-camadas",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "Pra descobrir, você precisa cavar. Cidades antigas crescem em cima das próprias ruínas, camada por camada.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.overview), key(W("s2", 2), P.catalTop, "soft"), key(end(1), P.catalWide, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, { ...O.catal, state: { start: "planície plana", end: "morro de 8 camadas" } }, O.jer, O.dam,
      { id: "shovel", type: "pá low-poly cavando", visible: true }],
    animations: [
      { type: "interpolate", target: "shovel.dig", startFrame: W("s2", 3), endFrame: W("s2", 5), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "catal.layers", startFrame: W("s2", 7), endFrame: end(1) - 6, from: 0, to: 8, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "catal.reveal", startFrame: W("s2", 5), endFrame: W("s2", 7), from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [{ text: "CIDADE SOBRE CIDADE", variant: "info", appearAt: W("s2", 7), disappearAt: end(1) - 2 }],
    highlights: ["CAVAR", "CRESCEM", "RUÍNAS", "CAMADA"],
    captions: [cap("s2", 1, "Pra descobrir, você precisa cavar. Cidades antigas crescem em cima das próprias ruínas, camada por camada.")],
    audioCues: [narration("s2", "planned"), sfx("dig", W("s2", 4), 0.28), sfx("thud", W("s2", 7), 0.22), sfx("tick", W("s2", 13), 0.2), sfx("tick", W("s2", 15), 0.2)],
  },
  // 3 — TELL
  {
    id: "scene-03-tell",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "Esse morro de cidades empilhadas se chama tell. Quanto mais funda a camada, mais antiga ela é.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.catalWide), key(W("s3", 8), P.catalCut, "soft"), key(end(2), P.catalDeep, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, { ...O.catal, state: { start: "morro em corte", end: "camada do fundo destacada" } }, O.jer, O.dam],
    animations: [
      { type: "interpolate", target: "catal.outline", startFrame: W("s3", 1), endFrame: W("s3", 7) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "depthArrow.show", startFrame: W("s3", 8), endFrame: W("s3", 14), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "catal.bottomGlow", startFrame: W("s3", 13), endFrame: Math.min(W("s3", 16) + 6, end(2)), from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "TELL", variant: "positive", subtitle: "morro de cidades empilhadas", appearAt: W("s3", 7), disappearAt: W("s3", 8) + s(1.4) },
      { text: "MAIS FUNDO = MAIS ANTIGO", variant: "info", appearAt: W("s3", 13), disappearAt: end(2) - 2 },
    ],
    highlights: ["MORRO", "EMPILHADAS", "TELL", "FUNDA", "ANTIGA"],
    captions: [cap("s3", 2, "Esse morro de cidades empilhadas se chama tell. Quanto mais funda a camada, mais antiga ela é.")],
    audioCues: [narration("s3", "planned"), sfx("badge", W("s3", 7), 0.28), sfx("whoosh-soft", W("s3", 8), 0.2), sfx("glow", W("s3", 13), 0.24)],
  },
  // 4 — ÇATALHÖYÜK
  {
    id: "scene-04-catalhoyuk",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "Então é só achar a camada mais funda? Olha Çatalhöyük, na Turquia: mais de nove mil anos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.catalDeep), key(W("s4", 9), P.catalCut, "soft"), key(end(3), P.catalTop, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, { ...O.catal, state: { start: "camada do fundo", end: "nome e idade marcados" } }, O.jer, O.dam],
    animations: [
      { type: "interpolate", target: "timeRuler.mark", startFrame: W("s4", 12), endFrame: W("s4", 16) + 6, from: 0, to: 3.6, easing: "out", unit: "u3d" },
      { type: "interpolate", target: "catal.nameTag", startFrame: W("s4", 9), endFrame: W("s4", 9) + 10, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "A MAIS FUNDA?", variant: "warning", icon: "?", appearAt: W("s4", 3), disappearAt: W("s4", 9) - 2 },
      { text: "ÇATALHÖYÜK", variant: "info", subtitle: "Turquia · mais de 9.000 anos", appearAt: W("s4", 9), disappearAt: end(3) - 2 },
    ],
    highlights: ["FUNDA", "ÇATALHÖYÜK", "TURQUIA", "NOVE", "MIL"],
    captions: [cap("s4", 3, "Então é só achar a camada mais funda? Olha Çatalhöyük, na Turquia: mais de nove mil anos.")],
    audioCues: [narration("s4", "planned"), sfx("pop-high", W("s4", 3), 0.24), sfx("badge", W("s4", 9), 0.28), sfx("shimmer", W("s4", 12), 0.2)],
  },
  // 5 — ABANDONADA → REGRA 1
  {
    id: "scene-05-abandonada",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "Só que ela foi abandonada. Hoje é só ruína. Primeira regra: a cidade tem que estar habitada.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.catalTop), key(end(4), orbit([-8, 0.6, 0], 16, 6, 18), "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, { ...O.catal, state: { start: "casas no topo", end: "ruína coberta de grama, cinza" } }, O.jer, O.dam,
      { id: "ruleCard", type: "cartão 2D de regras", visible: true }],
    animations: [
      { type: "interpolate", target: "catal.ruin", startFrame: W("s5", 3), endFrame: W("s5", 8) + 6, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "catal.desat", startFrame: W("s5", 4), endFrame: W("s5", 8), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "spring", target: "ruleCard.rule1", startFrame: W("s5", 9), endFrame: W("s5", 9) + 30, from: 0, to: 1, damping: 12, unit: "0-1" },
    ],
    badges: [
      { text: "ABANDONADA", variant: "negative", appearAt: W("s5", 4), disappearAt: W("s5", 9) - 2 },
      { text: "REGRA 1: HABITADA HOJE", variant: "positive", appearAt: W("s5", 9), disappearAt: end(4) - 2 },
    ],
    highlights: ["ABANDONADA", "RUÍNA", "REGRA", "HABITADA"],
    captions: [cap("s5", 4, "Só que ela foi abandonada. Hoje é só ruína. Primeira regra: a cidade tem que estar habitada.")],
    audioCues: [narration("s5", "planned"), sfx("crumble", W("s5", 3), 0.3), sfx("buzz", W("s5", 4), 0.24), sfx("badge", W("s5", 9), 0.28)],
  },
  // 6 — JERICÓ
  {
    id: "scene-06-jerico",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "Agora Jericó, na Cisjordânia. Lá tem uma torre de pedra com uns dez mil anos. Ninguém bate isso.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, orbit([-8, 0.6, 0], 16, 6, 18)), key(W("s6", 1), P.jerTop, "soft"), key(W("s6", 7), P.jerTower, "soft"), key(end(5), P.jerCut, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, { ...O.jer, state: { start: "morro com cidade pequena ao lado", end: "corte revela a torre" } }, O.dam],
    animations: [
      { type: "interpolate", target: "jericho.reveal", startFrame: W("s6", 1), endFrame: W("s6", 6), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "jericho.towerGlow", startFrame: W("s6", 7), endFrame: W("s6", 9) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "timeRuler.mark", startFrame: W("s6", 11), endFrame: W("s6", 14) + 6, to: 4.0, easing: "out", unit: "u3d" },
    ],
    badges: [
      { text: "JERICÓ", variant: "info", subtitle: "Cisjordânia", appearAt: W("s6", 1), disappearAt: W("s6", 7) - 2 },
      { text: "TORRE ≈ 10.000 ANOS", variant: "positive", appearAt: W("s6", 7), disappearAt: end(5) - 2 },
    ],
    highlights: ["JERICÓ", "CISJORDÂNIA", "TORRE", "PEDRA", "DEZ", "MIL"],
    captions: [cap("s6", 5, "Agora Jericó, na Cisjordânia. Lá tem uma torre de pedra com uns dez mil anos. Ninguém bate isso.")],
    audioCues: [narration("s6", "planned"), sfx("whoosh-soft", 0, 0.22), sfx("badge", W("s6", 1), 0.26), sfx("dive", W("s6", 4), 0.22), sfx("ding", W("s6", 7), 0.26)],
  },
  // 7 — INTERVALOS VAZIOS
  {
    id: "scene-07-intervalos",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "Mas olha as camadas: em alguns períodos, ficaram séculos vazias. Ninguém morava ali.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.jerCut), key(end(6), P.jerGaps, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, { ...O.jer, state: { start: "camadas normais", end: "duas faixas vazias em vermelho" } }, O.dam],
    animations: [
      { type: "interpolate", target: "jericho.gaps", startFrame: W("s7", 3), endFrame: W("s7", 9) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "jericho.towerGlow", startFrame: 0, endFrame: 10, to: 0.3, easing: "out", unit: "0-1" },
    ],
    badges: [{ text: "SÉCULOS VAZIA", variant: "negative", subtitle: "intervalos sem moradores", appearAt: W("s7", 8), disappearAt: end(6) - 2 }],
    highlights: ["CAMADAS", "SÉCULOS", "VAZIAS", "NINGUÉM"],
    captions: [cap("s7", 6, "Mas olha as camadas: em alguns períodos, ficaram séculos vazias. Ninguém morava ali.")],
    audioCues: [narration("s7", "planned"), sfx("buzz", W("s7", 8), 0.26), sfx("rumble-soft", W("s7", 3), 0.18)],
  },
  // 8 — REGRA 2
  {
    id: "scene-08-regra-dois",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "Por isso, muita gente usa uma regra mais dura: habitada sem parar, sem grandes intervalos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.jerGaps), key(end(7), P.rules, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, O.jer, O.dam, { id: "ruleCard", type: "cartão 2D de regras", visible: true }],
    animations: [
      { type: "spring", target: "ruleCard.rule2", startFrame: W("s8", 9), endFrame: W("s8", 9) + 30, from: 0, to: 1, damping: 12, unit: "0-1" },
      { type: "interpolate", target: "jericho.flag", startFrame: W("s8", 12), endFrame: W("s8", 14) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [{ text: "REGRA 2: SEM PARAR", variant: "positive", subtitle: "ocupação contínua", appearAt: W("s8", 9), disappearAt: end(7) - 2 }],
    highlights: ["REGRA", "DURA", "HABITADA", "PARAR", "INTERVALOS"],
    captions: [cap("s8", 7, "Por isso, muita gente usa uma regra mais dura: habitada sem parar, sem grandes intervalos.")],
    audioCues: [narration("s8", "planned"), sfx("badge", W("s8", 9), 0.28), sfx("whoosh-soft", 0, 0.2)],
  },
  // 9 — PROVAS ENTERRADAS
  {
    id: "scene-09-provas",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "Só que provar isso é difícil: a cidade de hoje está construída em cima das provas.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.rules), key(W("s9", 6), P.damTop, "soft"), key(end(8), P.damCut, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, O.jer, { ...O.dam, state: { start: "cidade densa sem nome", end: "corte: camadas rasas + zona '?'" } },
      { id: "excavator", type: "escavadeira low-poly barrada (✖)", visible: true }],
    animations: [
      { type: "interpolate", target: "damascus.reveal", startFrame: W("s9", 7), endFrame: W("s9", 11) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "damascus.unknown", startFrame: W("s9", 13), endFrame: Math.min(W("s9", 15) + 8, end(8)), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "spring", target: "excavator.blocked", startFrame: W("s9", 10), endFrame: W("s9", 10) + 30, from: 0, to: 1, damping: 12, unit: "0-1" },
      { type: "interpolate", target: "damascus.name", startFrame: 0, endFrame: 1, from: 0, to: 0, unit: "0-1" },
    ],
    badges: [{ text: "PROVAS ENTERRADAS", variant: "negative", subtitle: "sob a cidade atual", appearAt: W("s9", 11), disappearAt: end(8) - 2 }],
    highlights: ["PROVAR", "DIFÍCIL", "HOJE", "CONSTRUÍDA", "PROVAS"],
    captions: [cap("s9", 8, "Só que provar isso é difícil: a cidade de hoje está construída em cima das provas.")],
    audioCues: [narration("s9", "planned"), sfx("hydraulic", W("s9", 10), 0.22), sfx("buzz", W("s9", 11), 0.24)],
  },
  // 10 — A CANDIDATA
  {
    id: "scene-10-candidata",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "Mesmo assim, uma candidata aparece em quase todas as listas.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.damCut), key(end(9), P.damClose, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, O.jer, { ...O.dam, state: { start: "sem nome", end: "silhueta com '?' pulsando" } },
      { id: "listCards", type: "3 cartões de lista 2D com a mesma linha borrada", visible: true }],
    animations: [
      { type: "interpolate", target: "listCards.show", startFrame: W("s10", 4), endFrame: W("s10", 9) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "damascus.mystery", startFrame: W("s10", 3), endFrame: W("s10", 3) + 12, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [{ text: "A FAVORITA...", variant: "warning", icon: "?", appearAt: W("s10", 3), disappearAt: end(9) - 2 }],
    highlights: ["CANDIDATA", "TODAS", "LISTAS"],
    captions: [cap("s10", 9, "Mesmo assim, uma candidata aparece em quase todas as listas.")],
    audioCues: [narration("s10", "planned"), sfx("pop-high", W("s10", 3), 0.24), sfx("tick", W("s10", 6), 0.2), sfx("tick", W("s10", 8), 0.2)],
  },
  // 11 — PISTAS
  {
    id: "scene-11-pistas",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "Registros mostram gente vivendo nela há pelo menos quatro mil anos. E, até onde se sabe, nunca ficou vazia.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.damClose), key(W("s11", 8), P.damCut, "soft"), key(end(10), orbit([20, 0.4, 2], 17, -4, 10), "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, O.jer, { ...O.dam, state: { start: "camadas rasas", end: "faixa contínua verde do topo até ≥4.000 anos" } }],
    animations: [
      { type: "interpolate", target: "timeRuler.mark", startFrame: W("s11", 6), endFrame: W("s11", 10) + 6, to: 1.6, easing: "out", unit: "u3d" },
      { type: "interpolate", target: "damascus.continuous", startFrame: W("s11", 12), endFrame: Math.min(W("s11", 18) + 6, end(10)), from: 0, to: 1, easing: "inOut", unit: "0-1" },
    ],
    badges: [
      { text: "≥ 4.000 ANOS", variant: "info", subtitle: "registros históricos", appearAt: W("s11", 8), disappearAt: W("s11", 12) - 2 },
      { text: "SEM ABANDONO CONHECIDO", variant: "positive", appearAt: W("s11", 16), disappearAt: end(10) - 2 },
    ],
    highlights: ["REGISTROS", "QUATRO", "MIL", "NUNCA", "VAZIA"],
    captions: [cap("s11", 10, "Registros mostram gente vivendo nela há pelo menos quatro mil anos. E, até onde se sabe, nunca ficou vazia.")],
    audioCues: [narration("s11", "planned"), sfx("badge", W("s11", 8), 0.26), sfx("water-rise", W("s11", 12), 0.18), sfx("badge", W("s11", 16), 0.26)],
  },
  // 12 — REVELAÇÃO
  {
    id: "scene-12-damasco",
    startFrame: sc(11).from,
    durationInFrames: sc(11).durationInFrames,
    voKey: "s12",
    narration: "Ela é Damasco, na Síria. Muitos a consideram a cidade habitada sem parar mais antiga do mundo.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, orbit([20, 0.4, 2], 17, -4, 10)), key(W("s12", 2), P.damHero, "out"), key(end(11), orbit([20, 0.8, 0], 16, 8, 16), "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, O.jer, { ...O.dam, state: { start: "'?'", end: "nome DAMASCO + coroa" } }],
    animations: [
      { type: "interpolate", target: "damascus.mystery", startFrame: W("s12", 2) - 4, endFrame: W("s12", 2) + 4, to: 0, easing: "in", unit: "0-1" },
      { type: "spring", target: "damascus.name", startFrame: W("s12", 2), endFrame: W("s12", 2) + 30, from: 0, to: 1, damping: 10, unit: "0-1" },
      { type: "spring", target: "damascus.crown", startFrame: W("s12", 2) + 4, endFrame: W("s12", 2) + 40, from: 0, to: 1, damping: 9, unit: "0-1" },
      { type: "interpolate", target: "confetti", startFrame: W("s12", 2), endFrame: W("s12", 2) + 45, from: 0, to: 1, easing: "linear", unit: "0-1" },
    ],
    badges: [
      { text: "DAMASCO", variant: "positive", size: "large", subtitle: "Síria", appearAt: W("s12", 2), disappearAt: end(11) - 2 },
      { text: "TÍTULO DISPUTADO", variant: "warning", appearAt: W("s12", 5), disappearAt: end(11) - 2 },
    ],
    highlights: ["DAMASCO", "SÍRIA", "HABITADA", "PARAR", "ANTIGA", "MUNDO"],
    captions: [cap("s12", 11, "Ela é Damasco, na Síria. Muitos a consideram a cidade habitada sem parar mais antiga do mundo.")],
    audioCues: [narration("s12", "planned"), sfx("whoosh-big", W("s12", 2) - 8, 0.3), sfx("final", W("s12", 2), 0.32), sfx("shimmer", W("s12", 2) + 6, 0.22), sfx("pop-high", W("s12", 5), 0.22)],
  },
  // 13 — DEPENDE DA REGRA
  {
    id: "scene-13-depende",
    startFrame: sc(12).from,
    durationInFrames: sc(12).durationInFrames,
    voKey: "s13",
    narration: "Jericó é mais velha, mas teve intervalos. Ou seja: a resposta depende da regra.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([20, 0.8, 0], 16, 8, 16)), key(end(12), P.compare, "soft")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, { ...O.jer, state: { start: "faixas vazias", end: "medalha 'mais velha'" } }, { ...O.dam, state: { start: "coroa", end: "medalha 'sem parar'" } }],
    animations: [
      { type: "interpolate", target: "compare.bars", startFrame: 0, endFrame: W("s13", 6) + 6, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "jericho.gaps", startFrame: W("s13", 5), endFrame: W("s13", 6) + 8, from: 1, to: 1, unit: "0-1" },
    ],
    badges: [
      { text: "JERICÓ: MAIS VELHA", variant: "info", subtitle: "com intervalos", appearAt: W("s13", 0), disappearAt: end(12) - 2 },
      { text: "DAMASCO: SEM PARAR", variant: "positive", subtitle: "a mais citada", appearAt: W("s13", 7), disappearAt: end(12) - 2 },
    ],
    highlights: ["JERICÓ", "VELHA", "INTERVALOS", "RESPOSTA", "DEPENDE", "REGRA"],
    captions: [cap("s13", 12, "Jericó é mais velha, mas teve intervalos. Ou seja: a resposta depende da regra.")],
    audioCues: [narration("s13", "planned"), sfx("badge", W("s13", 0), 0.26), sfx("badge", W("s13", 7), 0.26)],
  },
  // 14 — FINAL
  {
    id: "scene-14-final",
    startFrame: sc(13).from,
    durationInFrames: sc(13).durationInFrames,
    voKey: "s14",
    narration: "Pronto: agora você sabe qual é a mais antiga, e por que até arqueólogos discutem isso.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.compare), key(s(1.4), P.final, "soft"), key(end(13), P.finalOrbit, "linear")] },
    objects: [O.sky, O.terrain, O.ruler, O.rome, O.catal, O.jer, O.dam,
      { id: "finalLabels", type: "rótulos 3D: ROMA · ÇATALHÖYÜK (abandonada) · JERICÓ (intervalos) · DAMASCO (sem parar)", visible: true }],
    animations: [
      { type: "interpolate", target: "others.dim", startFrame: 0, endFrame: s(1.2), to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "finalLabels.reveal", startFrame: s(1.4), endFrame: W("s14", 13) + 6, from: 0, to: 1, easing: "linear", unit: "0-1" },
      { type: "interpolate", target: "fade", startFrame: end(13) - 18, endFrame: end(13), from: 0, to: 1, easing: "in", unit: "0-1" },
    ],
    badges: [{ text: "CIDADE MAIS ANTIGA", variant: "info", size: "large", subtitle: "Jericó (mais velha) · Damasco (sem parar)", appearAt: W("s14", 0), disappearAt: end(13) }],
    highlights: ["PRONTO", "ANTIGA", "ARQUEÓLOGOS", "DISCUTEM"],
    captions: [cap("s14", 13, "Pronto: agora você sabe qual é a mais antiga, e por que até arqueólogos discutem isso.")],
    audioCues: [narration("s14", "planned"), sfx("whoosh", 0, 0.24), sfx("final", W("s14", 0), 0.28)],
  },
];

/** Valor de uma trilha de animação (ex.: "catal.layers") no frame global. */
export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);

export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

// Integridade: contígua, começa em 0, soma DURATION (2700).
scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
