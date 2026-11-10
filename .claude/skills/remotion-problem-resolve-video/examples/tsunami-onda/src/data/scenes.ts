// scene-plan.ts — Tsunami: a onda quase invisível que vira paredão (roteiro v1, AGUARDANDO APROVAÇÃO)
//
// Contrato de dados da Fase 1. Na Fase 2 este arquivo vira src/data/scenes.ts SEM tradução
// (mesmos tipos e helpers de assets/template/src/data/scenes.ts).
//
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// Antes do TTS os cortes vêm de PLANNED_SECONDS; depois, da duração real das falas (SCENE_FRAMES).
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa.
// Linha do tempo determinística: tudo é função do frame (sem timers, Date.now ou Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 90;                    // 2700 frames a 30 fps
//   export const VO_KEYS = ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11","s12","s13","s14"] as const;
//   const PLANNED_SECONDS = [7, 5, 6.5, 4.5, 7.5, 4.5, 6.5, 6, 6.5, 6.5, 6.5, 8, 7.5, 7.5]; // soma 90
//   const FIRST_VO = 0.45;  const LEAD = 0.25;
//   const GAPS = [0.55, 0.7, 0.5, 0.55, 0.5, 0.6, 0.55, 0.6, 0.55, 0.55, 0.6, 0.6, 0.65]; // 13 pausas
// ----------------------------------------------------------------------------------------------
//
// Mundo 3D (u3d, ESQUEMÁTICO: horizontal comprimida, vertical exagerada). Eixo x = perfil mar→costa.
//   Fossa x=-24 (y=-5) · planície abissal x=-20..6 (y=-4.2, "4.000 m") · talude x=6..12 (y→-0.9)
//   plataforma x=12..22 (y -0.9→-0.35) · praia x=22..25 (y→+0.25) · cidade x=26..29 · morro x=31..34 (y até 2.2)
//   Superfície do mar em y=0; fatia de oceano de z=-2 a z=+2 com face de corte em z=+2.
// Onda (World.tsx): η(x) = G · A(h) · [sech²((x−xf)/L(h)) − trough·sech²((x−xf−1.1L)/L)]
//   L(h) ∝ √h (encurta no raso) · A(h) ∝ h^(−1/4) (lei de Green), com teto visual;
//   G = view.exaggeration (0 = escala real ≈ plana; 1 = vertical exagerada); xf = tsunami.x.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "low-poly-3d-oceano", language: "pt-BR" };

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
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });

// Poses compartilhadas (orbit(alvo, distância, azimute°, elevação°); az 0 = câmera em +z, olhando a face de corte).
const P = {
  ship: orbit([-8, 0.1, 0], 15, 22, 13),
  shipLow: orbit([-8, -0.2, 0.5], 11, 30, 4),
  shipWide: orbit([-7, -1.6, 2], 30, 24, 14),
  shipEnd: orbit([-8, 0.1, 0], 14, 34, 11),
  coastTeaser: orbit([23.6, 0.9, 0], 16, 42, 9),
  coastTeaserClose: orbit([23.8, 1.2, 0], 12, 48, 6),
  source: orbit([-19, -4.4, 2], 40, 16, 6),
  trench: orbit([-19.5, -4.8, 2], 34, 12, 3),
  quakeClose: orbit([-19, -3.6, 2], 30, 18, 7),
  columnUp: orbit([-19, -1.9, 2], 30, 16, 10),
  surfaceSide: orbit([-17, -0.4, 1], 24, 6, 3),
  deepSide: orbit([-13, -0.2, 0], 44, -66, 6),
  column: orbit([-4, -2.1, 2], 30, 6, 3),
  chase: orbit([6, -0.4, 0], 40, -62, 22),
  chaseFast: orbit([10, -0.4, 0], 36, -58, 20),
  slope: orbit([13, -0.5, 1.5], 26, -32, 12),
  shelf: orbit([17.5, -0.1, 1.5], 21, -22, 10),
  shelfSide: orbit([18.8, 0.2, 1.5], 18, -8, 8),
  shelfWide: orbit([19.8, 0.4, 1.5], 21, -12, 7),
  shelfClose: orbit([20.6, 0.5, 1.5], 16, -16, 8),
  beach: orbit([21.8, 0.3, 0], 19, -36, 14),
  beachHigh: orbit([26, 0.8, 0], 25, -42, 24),
  town: orbit([26.5, 0.8, 0], 17, -28, 12),
  townWide: orbit([27, 0.6, 0], 23, -36, 16),
  final: orbit([3, -1.2, 0], 112, -60, 25),
  finalOrbit: orbit([3, -1.2, 0], 106, -52, 28),
};

// Objetos persistentes (ids estáveis).
const O = {
  sea: { id: "ocean", type: "fatia-de-oceano-em-corte", visible: true },
  floor: { id: "seafloor", type: "perfil-do-fundo (fossa→abissal→talude→plataforma→praia)", visible: true },
  plates: { id: "plates", type: "placas-tectonicas (oceânica sob continental)", visible: true },
  wave: { id: "tsunami", type: "deslocamento-da-superficie (malha animada)", visible: true },
  ship: { id: "ship", type: "navio-cargueiro-lowpoly", visible: true },
  coast: { id: "coast", type: "praia + cidade + morro", visible: true },
  particles: { id: "columnParticles", type: "partículas-na-coluna-dagua", visible: true },
  depth: { id: "depthGuide", type: "régua-de-profundidade 2D/3D", visible: true },
  sky: { id: "sky", type: "fundo-degradê", visible: true },
};

export const scenes: ScenePlan[] = [
  // 1 — GANCHO
  {
    id: "scene-01-gancho-navio",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration: "No meio do oceano, um tsunami mal se percebe. O navio sobe e desce, e ninguém nota.",
    camera: {
      projection: "perspective",
      movement: "dolly-out",
      keys: [key(0, P.shipLow), key(W("s1", 9), P.ship, "soft"), key(end(0), P.shipWide, "soft")],
    },
    objects: [
      O.sky, O.sea, O.floor, O.ship,
      { ...O.wave, state: { start: "crista a 6 u3d atrás do navio", end: "já passou do navio" } },
      { ...O.coast, visible: false }, { ...O.plates, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "view.exaggeration", startFrame: 0, endFrame: 1, from: 0.3, to: 0.3, unit: "0-1" },
      { type: "interpolate", target: "tsunami.on", startFrame: 0, endFrame: 1, from: 1, to: 1, unit: "0-1" },
      { type: "interpolate", target: "tsunami.x", startFrame: s(0.2), endFrame: end(0), from: -14, to: -2, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "ship.rockAmp", startFrame: 0, endFrame: s(0.5), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "ship.wake", startFrame: 0, endFrame: s(1), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "ocean.chop", startFrame: 0, endFrame: 1, from: 1, to: 1, unit: "0-1" },
    ],
    badges: [
      { text: "TSUNAMI EM MAR ABERTO", variant: "info", appearAt: W("s1", 5), disappearAt: W("s1", 9) + 6 },
      { text: "NINGUÉM NOTA?", variant: "warning", icon: "?", appearAt: W("s1", 15), disappearAt: end(0) - 4 },
    ],
    highlights: ["OCEANO", "TSUNAMI", "NAVIO", "NINGUÉM"],
    captions: [cap("s1", 0, "No meio do oceano, um tsunami mal se percebe. O navio sobe e desce, e ninguém nota.")],
    audioCues: [narration("s1", "ready"), sfx("ocean-amb", 0, 0.22), sfx("water-rise", s(0.5), 0.18), sfx("badge", W("s1", 5), 0.26), sfx("pop-high", W("s1", 15), 0.26)],
  },
  // 2 — CONTRASTE (prévia da costa) + rebobinar
  {
    id: "scene-02-paredao-previa",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "Mas, na praia, essa mesma onda vira um paredão de água. Como?",
    camera: {
      projection: "perspective",
      movement: "dolly-in",
      keys: [key(0, P.coastTeaser), key(W("s2", 8), P.coastTeaserClose, "out"), key(end(1), P.coastTeaserClose)],
    },
    objects: [
      O.sky, O.sea, O.floor, O.coast,
      { id: "previewWall", type: "parede-dágua-prévia (dessaturada, flash-forward)", visible: true, state: { start: "ausente", end: "erguida sobre a praia" } },
      { ...O.ship, visible: false }, { ...O.wave, visible: false },
    ],
    animations: [
      { type: "spring", target: "previewWall.rise", startFrame: W("s2", 6), endFrame: W("s2", 6) + 30, from: 0, to: 1, damping: 14, unit: "0-1" },
      { type: "interpolate", target: "screen.shake", startFrame: W("s2", 8), endFrame: W("s2", 8) + 12, from: 1, to: 0, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "rewind", startFrame: end(1) - 14, endFrame: end(1), from: 0, to: 1, easing: "in", unit: "0-1" },
    ],
    badges: [{ text: "COMO?", variant: "warning", icon: "?", subtitle: "de quase nada a um paredão", appearAt: W("s2", 11), disappearAt: end(1) - 2 }],
    highlights: ["PRAIA", "MESMA", "PAREDÃO", "COMO"],
    captions: [cap("s2", 1, "Mas, na praia, essa mesma onda vira um paredão de água. Como?")],
    audioCues: [narration("s2", "ready"), sfx("whoosh", 0, 0.3), sfx("rush", W("s2", 6), 0.32), sfx("pop-high", W("s2", 11), 0.26), sfx("rewind", end(1) - 14, 0.3)],
  },
  // 3 — ORIGEM: terremoto
  {
    id: "scene-03-terremoto",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "Tudo começa num terremoto no fundo do mar: uma placa travada se solta e ergue o assoalho.",
    camera: {
      projection: "perspective",
      movement: "vertical",
      keys: [key(0, P.source), key(W("s3", 4), P.trench, "soft"), key(W("s3", 14), P.quakeClose, "soft"), key(end(2), P.source, "soft")],
    },
    objects: [
      O.sky, O.sea, O.floor, O.depth,
      { ...O.plates, state: { start: "travadas, tensão acumulando", end: "placa de cima saltou para cima" } },
      { ...O.wave, state: { start: "oculta", end: "oculta" } },
      { ...O.coast, visible: false }, { ...O.ship, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.on", startFrame: 0, endFrame: 4, from: 1, to: 0, unit: "0-1" },
      { type: "interpolate", target: "rewind", startFrame: 0, endFrame: 8, from: 1, to: 0, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "plates.strain", startFrame: W("s3", 8), endFrame: W("s3", 11), from: 0, to: 1, easing: "in", unit: "0-1" },
      { type: "spring", target: "plates.slip", startFrame: W("s3", 12), endFrame: W("s3", 12) + 30, from: 0, to: 1, damping: 9, unit: "0-1" },
      { type: "interpolate", target: "seafloor.uplift", startFrame: W("s3", 12), endFrame: W("s3", 14) + 6, from: 0, to: 0.35, easing: "out", unit: "u3d" },
      { type: "interpolate", target: "screen.shake", startFrame: W("s3", 12), endFrame: W("s3", 12) + 24, from: 1, to: 0, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "TERREMOTO SUBMARINO", variant: "info", subtitle: "zona de subducção", appearAt: W("s3", 3), disappearAt: W("s3", 12) - 2 },
      { text: "O FUNDO SOBE", variant: "info", appearAt: W("s3", 14), disappearAt: end(2) - 4 },
    ],
    highlights: ["TERREMOTO", "FUNDO", "PLACA", "TRAVADA", "SOLTA", "ASSOALHO"],
    captions: [cap("s3", 2, "Tudo começa num terremoto no fundo do mar: uma placa travada se solta e ergue o assoalho.")],
    audioCues: [narration("s3", "ready"), sfx("deep-amb", 0, 0.2), sfx("strain", W("s3", 8), 0.22), sfx("rumble", W("s3", 12), 0.4), sfx("badge", W("s3", 3), 0.26)],
  },
  // 4 — DESLOCAMENTO DA COLUNA D'ÁGUA
  {
    id: "scene-04-coluna-sobe",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "E empurra para cima toda a água acima dela.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.source), key(end(3), P.columnUp, "soft")] },
    objects: [
      O.sky, O.sea, O.floor, O.plates, O.depth,
      { ...O.particles, state: { start: "paradas", end: "coluna inteira deslocada para cima" } },
      { ...O.wave, state: { start: "superfície plana", end: "calombo acima da área erguida" } },
      { ...O.coast, visible: false }, { ...O.ship, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: 1, from: -20, to: -20, unit: "u3d" },
      { type: "interpolate", target: "view.exaggeration", startFrame: 0, endFrame: 1, from: 1, to: 1, unit: "0-1" },
      { type: "interpolate", target: "columnParticles.show", startFrame: 0, endFrame: 10, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "columnParticles.lift", startFrame: W("s4", 1), endFrame: W("s4", 6) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "spring", target: "tsunami.on", startFrame: W("s4", 3), endFrame: W("s4", 3) + 36, from: 0, to: 1, damping: 12, unit: "0-1" },
      { type: "interpolate", target: "liftArrows.show", startFrame: W("s4", 1), endFrame: end(3) - 6, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [{ text: "DESLOCAMENTO DO FUNDO", variant: "positive", subtitle: "a coluna d'água sobe junto", appearAt: W("s4", 4), disappearAt: end(3) - 2 }],
    highlights: ["EMPURRA", "CIMA", "TODA", "ÁGUA"],
    captions: [cap("s4", 3, "E empurra para cima toda a água acima dela.")],
    audioCues: [narration("s4", "ready"), sfx("water-rise", W("s4", 1), 0.3), sfx("badge", W("s4", 4), 0.28)],
  },
  // 5 — BAIXA E LARGA (escala real → exagerada)
  {
    id: "scene-05-baixa-e-larga",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "Na superfície, vira um calombo baixo, em geral com menos de um metro, mas com centenas de quilômetros de largura.",
    camera: {
      projection: "perspective",
      movement: "dolly-out",
      keys: [key(0, P.columnUp), key(W("s5", 9), P.surfaceSide, "soft"), key(W("s5", 15), P.deepSide, "soft"), key(end(4), P.deepSide)],
    },
    objects: [
      O.sky, O.sea, O.floor, O.plates, O.depth,
      { ...O.particles, visible: false },
      { ...O.wave, state: { start: "calombo na fonte", end: "pulso largo indo para a costa (escala exagerada)" } },
      { id: "widthSpan", type: "cota-horizontal 3D 'centenas de km'", visible: true },
      { id: "scaleTag", type: "selo 2D 'escala vertical exagerada'", visible: true },
      { ...O.ship, visible: false }, { ...O.coast, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "view.exaggeration", startFrame: W("s5", 6), endFrame: W("s5", 9), from: 1, to: 0, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "view.exaggeration", startFrame: W("s5", 13), endFrame: W("s5", 15), to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(4), from: -20, to: -14, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "widthSpan.grow", startFrame: W("s5", 15), endFrame: end(4), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "scaleTag.show", startFrame: W("s5", 15), endFrame: W("s5", 15) + 8, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "MENOS DE 1 m", variant: "info", subtitle: "em mar aberto, em geral", appearAt: W("s5", 9), disappearAt: W("s5", 15) - 2 },
      { text: "CENTENAS DE km", variant: "info", subtitle: "de uma ponta à outra", appearAt: W("s5", 15), disappearAt: end(4) - 2 },
    ],
    highlights: ["CALOMBO", "BAIXO", "METRO", "CENTENAS", "QUILÔMETROS", "LARGURA"],
    captions: [cap("s5", 4, "Na superfície, vira um calombo baixo, em geral com menos de um metro, mas com centenas de quilômetros de largura.")],
    audioCues: [narration("s5", "ready"), sfx("whoosh-soft", W("s5", 6), 0.2), sfx("badge", W("s5", 9), 0.26), sfx("whoosh-soft", W("s5", 15), 0.24)],
  },
  // 6 — O NAVIO NEM SENTE (comprimento de onda)
  {
    id: "scene-06-navio-nem-sente",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "A subida é tão suave que o navio nem sente.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.ship), key(end(5), P.shipEnd, "soft")] },
    objects: [
      O.sky, O.sea, O.floor, O.ship,
      { ...O.wave, state: { start: "crista chegando ao navio", end: "navio no topo da crista" } },
      { id: "slopeGauge", type: "inclinação 2D (rampa quase plana)", visible: true },
      { ...O.plates, visible: false }, { ...O.coast, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(5), from: -12.5, to: -7.5, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "view.exaggeration", startFrame: 0, endFrame: 10, from: 1, to: 0.3, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "slopeGauge.show", startFrame: W("s6", 1), endFrame: W("s6", 4), from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [{ text: "COMPRIMENTO DE ONDA", variant: "positive", subtitle: "tão longo que a subida é suave", appearAt: W("s6", 4), disappearAt: end(5) - 2 }],
    highlights: ["SUAVE", "NAVIO", "NEM", "SENTE"],
    captions: [cap("s6", 5, "A subida é tão suave que o navio nem sente.")],
    audioCues: [narration("s6", "ready"), sfx("ocean-amb", 0, 0.2), sfx("badge", W("s6", 4), 0.28)],
  },
  // 7 — MEXE O OCEANO INTEIRO; MAIS FUNDO = MAIS RÁPIDO
  {
    id: "scene-07-oceano-inteiro",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "Só que ela mexe o oceano inteiro. E, quanto mais fundo o mar, mais rápido ela corre.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.shipEnd), key(W("s7", 3), P.column, "soft"), key(end(6), P.chase, "soft")] },
    objects: [
      O.sky, O.sea, O.floor, O.ship, O.depth,
      { ...O.particles, state: { start: "ocultas", end: "toda a coluna oscila na horizontal" } },
      { ...O.wave, state: { start: "sob o navio", end: "à frente, rumo à costa" } },
      { id: "depthSpeedChart", type: "mini-gráfico 2D profundidade×velocidade", visible: true },
      { ...O.plates, visible: false }, { ...O.coast, visible: true, state: { start: "fora de quadro", end: "ao longe" } },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(6), from: -7.5, to: 1, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "view.exaggeration", startFrame: 0, endFrame: 12, from: 0.3, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "columnParticles.show", startFrame: W("s7", 3), endFrame: W("s7", 3) + 10, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "columnParticles.lift", startFrame: 0, endFrame: 1, from: 0, to: 0, unit: "0-1" },
      { type: "interpolate", target: "columnParticles.sway", startFrame: W("s7", 3), endFrame: end(6), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "depthSpeedChart.show", startFrame: W("s7", 8), endFrame: W("s7", 13) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "MOVE O OCEANO INTEIRO", variant: "warning", subtitle: "do fundo à superfície", appearAt: W("s7", 3), disappearAt: W("s7", 8) - 2 },
      { text: "MAIS FUNDO = MAIS RÁPIDO", variant: "positive", appearAt: W("s7", 13), disappearAt: end(6) - 2 },
    ],
    highlights: ["MEXE", "OCEANO", "INTEIRO", "FUNDO", "RÁPIDO", "CORRE"],
    captions: [cap("s7", 6, "Só que ela mexe o oceano inteiro. E, quanto mais fundo o mar, mais rápido ela corre.")],
    audioCues: [narration("s7", "ready"), sfx("whoosh-soft", W("s7", 3), 0.22), sfx("badge", W("s7", 3), 0.26), sfx("badge", W("s7", 13), 0.28)],
  },
  // 8 — VELOCIDADE DE AVIÃO
  {
    id: "scene-08-velocidade-aviao",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "Num mar de quatro mil metros, passa de setecentos quilômetros por hora: velocidade de avião.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.chase), key(end(7), P.chaseFast, "linear")] },
    objects: [
      O.sky, O.sea, O.floor, O.depth,
      { ...O.wave, state: { start: "planície abissal", end: "perto do talude" } },
      { id: "airplane", type: "avião-lowpoly acima, mesma velocidade da crista", visible: true, state: { start: "fora de quadro", end: "emparelhado com a crista" } },
      { ...O.particles, visible: false }, { ...O.ship, visible: false }, O.coast, { ...O.plates, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(7), from: 1, to: 6.5, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "depthGuide.highlight", startFrame: W("s8", 3), endFrame: W("s8", 5) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "airplane.enter", startFrame: W("s8", 12) - 10, endFrame: W("s8", 12) + 8, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "speedLines.show", startFrame: W("s8", 6), endFrame: end(7), from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "4.000 m DE PROFUNDIDADE", variant: "info", appearAt: W("s8", 3), disappearAt: W("s8", 8) - 2 },
      { text: "≈ 700 km/h", variant: "positive", subtitle: "velocidade de avião a jato", appearAt: W("s8", 8), disappearAt: end(7) - 2 },
    ],
    highlights: ["QUATRO", "MIL", "SETECENTOS", "QUILÔMETROS", "HORA", "AVIÃO"],
    captions: [cap("s8", 7, "Num mar de quatro mil metros, passa de setecentos quilômetros por hora: velocidade de avião.")],
    audioCues: [narration("s8", "ready"), sfx("badge", W("s8", 3), 0.24), sfx("badge", W("s8", 8), 0.28), sfx("jet-flyby", W("s8", 12) - 10, 0.3)],
  },
  // 9 — O FUNDO SOBE, A FRENTE FREIA
  {
    id: "scene-09-frente-freia",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "Perto da costa, o fundo sobe, o mar fica raso, e a frente da onda freia.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.chaseFast), key(W("s9", 3), P.slope, "soft"), key(end(8), P.shelf, "soft")] },
    objects: [
      O.sky, O.sea, O.depth, O.coast,
      { ...O.floor, state: { start: "planície", end: "talude e plataforma destacados" } },
      { ...O.wave, state: { start: "rápida no fundo", end: "frente lenta no raso" } },
      { id: "speedArrows", type: "setas 3D frente (curta, vermelha) e trás (longa, verde)", visible: true },
      { id: "airplane", type: "avião-lowpoly", visible: true, state: { start: "emparelhado com a crista", end: "sai de quadro pelo alto" } },
      { ...O.particles, visible: false }, { ...O.ship, visible: false }, { ...O.plates, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "airplane.enter", startFrame: 0, endFrame: 12, to: 0, easing: "in", unit: "0-1" },
      { type: "interpolate", target: "speedLines.show", startFrame: 0, endFrame: 12, to: 0, easing: "in", unit: "0-1" },
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(8), from: 6.5, to: 14, easing: "out", unit: "u3d" },
      { type: "interpolate", target: "seafloor.slopeGlow", startFrame: W("s9", 4), endFrame: W("s9", 5) + 8, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "depthGuide.shallow", startFrame: W("s9", 8), endFrame: W("s9", 9) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "spring", target: "speedArrows.show", startFrame: W("s9", 12), endFrame: Math.min(W("s9", 12) + 30, end(8)), from: 0, to: 1, damping: 12, unit: "0-1" },
    ],
    badges: [
      { text: "ÁGUA RASA = ONDA LENTA", variant: "info", appearAt: W("s9", 9), disappearAt: W("s9", 15) - 2 },
      { text: "A FRENTE FREIA", variant: "negative", appearAt: W("s9", 15), disappearAt: end(8) - 2 },
    ],
    highlights: ["COSTA", "FUNDO", "SOBE", "RASO", "FRENTE", "FREIA"],
    captions: [cap("s9", 8, "Perto da costa, o fundo sobe, o mar fica raso, e a frente da onda freia.")],
    audioCues: [narration("s9", "ready"), sfx("pressure", W("s9", 15), 0.26), sfx("badge", W("s9", 9), 0.24), sfx("buzz", W("s9", 15), 0.26)],
  },
  // 10 — A TRASEIRA ALCANÇA: EMPOLAMENTO
  {
    id: "scene-10-agua-se-empilha",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "Mas a parte de trás ainda vem rápida, alcança a da frente, e a água se empilha.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.shelf), key(end(9), P.shelfSide, "soft")] },
    objects: [
      O.sky, O.sea, O.floor, O.depth, O.coast,
      { ...O.wave, state: { start: "pulso alongado", end: "pulso comprimido e mais alto" } },
      { id: "speedArrows", type: "setas 3D", visible: true, state: { start: "trás longa, frente curta", end: "convergindo" } },
      { id: "pileUp", type: "partículas convergindo na crista", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(9), from: 14, to: 18, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "speedArrows.converge", startFrame: W("s10", 2), endFrame: W("s10", 11), from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "pileUp.show", startFrame: W("s10", 8), endFrame: end(9), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "speedArrows.show", startFrame: end(9) - 10, endFrame: end(9), to: 0, easing: "in", unit: "0-1" },
    ],
    badges: [{ text: "EMPOLAMENTO", variant: "positive", subtitle: "a onda cresce ao chegar no raso", appearAt: W("s10", 15), disappearAt: end(9) - 2 }],
    highlights: ["TRÁS", "RÁPIDA", "ALCANÇA", "FRENTE", "EMPILHA"],
    captions: [cap("s10", 9, "Mas a parte de trás ainda vem rápida, alcança a da frente, e a água se empilha.")],
    audioCues: [narration("s10", "ready"), sfx("water-rise", W("s10", 8), 0.3), sfx("badge", W("s10", 15), 0.28)],
  },
  // 11 — ENCURTA E CRESCE
  {
    id: "scene-11-encurta-cresce",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "A onda encurta e cresce: a mesma energia, espremida em menos profundidade, vira altura.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.shelfSide), key(W("s11", 7), P.shelfWide, "soft"), key(end(10), P.shelfClose, "soft")] },
    objects: [
      O.sky, O.sea, O.floor, O.coast,
      { ...O.wave, state: { start: "comprimida", end: "crista alta e curta sobre a plataforma" } },
      { id: "ghostDeep", type: "silhueta-fantasma da onda de mar aberto (comparação)", visible: true },
      { id: "energyBand", type: "faixa de energia (partículas) que se estreita e sobe", visible: true },
      { ...O.depth, visible: false },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(10), from: 18, to: 21, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "ghostDeep.show", startFrame: W("s11", 2), endFrame: W("s11", 4) + 4, from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "energyBand.squeeze", startFrame: W("s11", 7), endFrame: W("s11", 13) + 6, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "ghostDeep.show", startFrame: end(10) - 10, endFrame: end(10), to: 0, easing: "in", unit: "0-1" },
    ],
    badges: [
      { text: "ENCURTA E CRESCE", variant: "positive", appearAt: W("s11", 2), disappearAt: W("s11", 7) - 2 },
      { text: "ENERGIA VIRA ALTURA", variant: "positive", subtitle: "esquema, fora de escala", appearAt: W("s11", 7), disappearAt: end(10) - 2 },
    ],
    highlights: ["ENCURTA", "CRESCE", "ENERGIA", "ESPREMIDA", "ALTURA"],
    captions: [cap("s11", 10, "A onda encurta e cresce: a mesma energia, espremida em menos profundidade, vira altura.")],
    audioCues: [narration("s11", "ready"), sfx("badge", W("s11", 2), 0.26), sfx("water-rise", W("s11", 7), 0.32), sfx("badge", W("s11", 7), 0.26)],
  },
  // 12 — O MAR RECUA (às vezes) → SUBA PARA O ALTO
  {
    id: "scene-12-mar-recua",
    startFrame: sc(11).from,
    durationInFrames: sc(11).durationInFrames,
    voKey: "s12",
    narration: "Às vezes o mar recua antes, expondo o fundo. Se vir isso, não vá olhar: suba para um lugar alto.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.beach), key(W("s12", 9), P.beachHigh, "soft"), key(end(11), P.beachHigh)] },
    objects: [
      O.sky, O.sea, O.floor,
      { ...O.coast, state: { start: "praia normal", end: "areia exposta; rota até o morro destacada" } },
      { ...O.wave, state: { start: "vale à frente da crista", end: "crista a caminho da praia" } },
      { id: "evacRoute", type: "seta 3D verde praia→morro + bonecos low-poly subindo", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.trough", startFrame: 0, endFrame: s(0.8), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: end(11), from: 21, to: 22.6, easing: "linear", unit: "u3d" },
      { type: "interpolate", target: "coast.drawdown", startFrame: W("s12", 4), endFrame: W("s12", 8) + 8, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "spring", target: "evacRoute.show", startFrame: W("s12", 15), endFrame: W("s12", 15) + 30, from: 0, to: 1, damping: 12, unit: "0-1" },
      { type: "interpolate", target: "evacRoute.people", startFrame: W("s12", 15), endFrame: end(11), from: 0, to: 1, easing: "linear", unit: "0-1" },
    ],
    badges: [
      { text: "MAR RECUANDO", variant: "negative", subtitle: "nem sempre acontece", appearAt: W("s12", 4), disappearAt: W("s12", 12) - 2 },
      { text: "SUBA PARA O ALTO", variant: "positive", subtitle: "não vá ver o mar", appearAt: W("s12", 15), disappearAt: end(11) - 2 },
    ],
    highlights: ["RECUA", "FUNDO", "NÃO", "OLHAR", "SUBA", "ALTO"],
    captions: [cap("s12", 11, "Às vezes o mar recua antes, expondo o fundo. Se vir isso, não vá olhar: suba para um lugar alto.")],
    audioCues: [narration("s12", "ready"), sfx("drain", W("s12", 4), 0.3), sfx("buzz", W("s12", 4), 0.26), sfx("badge", W("s12", 15), 0.28)],
  },
  // 13 — CHEGADA: PAREDÃO QUE NÃO PARA
  {
    id: "scene-13-chegada",
    startFrame: sc(12).from,
    durationInFrames: sc(12).durationInFrames,
    voKey: "s13",
    narration: "E ela não quebra e acaba como onda de surfe: é tão comprida que a água segue avançando por minutos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.beachHigh), key(W("s13", 3), P.town, "soft"), key(end(12), P.townWide, "soft")] },
    objects: [
      O.sky, O.sea, O.floor, O.wave,
      { ...O.coast, state: { start: "areia exposta", end: "cidade baixa inundada; morro seco" } },
      { id: "surfGhost", type: "onda de surfe estilizada (comparação, riscada)", visible: true },
      { id: "flowArrows", type: "setas 3D de correnteza terra adentro", visible: true },
      { id: "evacRoute", type: "seta + bonecos no morro", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "tsunami.x", startFrame: 0, endFrame: s(1.6), from: 22.6, to: 24.5, easing: "in", unit: "u3d" },
      { type: "interpolate", target: "coast.drawdown", startFrame: 0, endFrame: s(1.2), to: 0, easing: "in", unit: "0-1" },
      { type: "spring", target: "surfGhost.show", startFrame: W("s13", 3), endFrame: W("s13", 3) + 30, from: 0, to: 1, damping: 14, unit: "0-1" },
      { type: "interpolate", target: "surfGhost.strike", startFrame: W("s13", 5), endFrame: W("s13", 9), from: 0, to: 1, easing: "out", unit: "0-1" },
      { type: "interpolate", target: "surfGhost.show", startFrame: W("s13", 10), endFrame: W("s13", 10) + 8, to: 0, easing: "in", unit: "0-1" },
      { type: "interpolate", target: "coast.inundation", startFrame: s(1.2), endFrame: end(12), from: 0, to: 1, easing: "soft", unit: "0-1" },
      { type: "interpolate", target: "flowArrows.show", startFrame: W("s13", 15), endFrame: W("s13", 17) + 6, from: 0, to: 1, easing: "out", unit: "0-1" },
    ],
    badges: [
      { text: "NÃO É ONDA DE SURFE", variant: "negative", appearAt: W("s13", 3), disappearAt: W("s13", 10) - 2 },
      { text: "AVANÇA POR MINUTOS", variant: "info", subtitle: "e costuma vir mais de uma onda", appearAt: W("s13", 16), disappearAt: end(12) - 2 },
    ],
    highlights: ["QUEBRA", "SURFE", "COMPRIDA", "ÁGUA", "AVANÇANDO", "MINUTOS"],
    captions: [cap("s13", 12, "E ela não quebra e acaba como onda de surfe: é tão comprida que a água segue avançando por minutos.")],
    audioCues: [narration("s13", "ready"), sfx("rush", 0, 0.34), sfx("buzz", W("s13", 3), 0.26), sfx("flood-loop", s(1.2), 0.22), sfx("badge", W("s13", 16), 0.26)],
  },
  // 14 — SISTEMA COMPLETO
  {
    id: "scene-14-final",
    startFrame: sc(13).from,
    durationInFrames: sc(13).durationInFrames,
    voKey: "s14",
    narration: "Pronto: agora você sabe por que a onda quase invisível no mar vira um paredão na costa.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.townWide), key(s(1.4), P.final, "soft"), key(end(13), P.finalOrbit, "linear")] },
    objects: [
      O.sky, O.sea, O.floor, O.plates, O.coast, O.depth,
      { ...O.wave, visible: false },
      { id: "finalGhosts", type: "3 instantâneos da onda: abissal (baixa, longa), talude (média), costa (alta, curta)", visible: true },
      { id: "finalLabels", type: "rótulos 3D ancorados: ORIGEM · RÁPIDA E BAIXA · FREIA E CRESCE · PAREDÃO", visible: true },
    ],
    animations: [
      { type: "interpolate", target: "coast.inundation", startFrame: 0, endFrame: s(1.4), to: 0, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "tsunami.on", startFrame: 0, endFrame: s(1.4), to: 0, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "flowArrows.show", startFrame: 0, endFrame: 8, to: 0, easing: "in", unit: "0-1" },
      { type: "interpolate", target: "evacRoute.show", startFrame: 0, endFrame: 8, to: 0, easing: "in", unit: "0-1" },
      { type: "interpolate", target: "finalGhosts.reveal", startFrame: s(1.2), endFrame: W("s14", 14) + 6, from: 0, to: 1, easing: "inOut", unit: "0-1" },
      { type: "interpolate", target: "finalLabels.reveal", startFrame: s(1.6), endFrame: W("s14", 14) + 12, from: 0, to: 1, easing: "linear", unit: "0-1" },
      { type: "interpolate", target: "fade", startFrame: end(13) - 18, endFrame: end(13), from: 0, to: 1, easing: "in", unit: "0-1" },
    ],
    badges: [{ text: "TSUNAMI", variant: "info", size: "large", subtitle: "quase invisível no mar, paredão na costa", appearAt: W("s14", 0), disappearAt: end(13) }],
    highlights: ["PRONTO", "INVISÍVEL", "MAR", "PAREDÃO", "COSTA"],
    captions: [cap("s14", 13, "Pronto: agora você sabe por que a onda quase invisível no mar vira um paredão na costa.")],
    audioCues: [narration("s14", "ready"), sfx("whoosh", 0, 0.24), sfx("final", W("s14", 0), 0.3)],
  },
];

/** Valor de uma trilha de animação (ex.: "tsunami.x") no frame global. */
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
