// scenes.ts — Por que o céu é azul? (roteiro v1, APROVADO; Fase 2 — cortes derivados da voz real)
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa.
// Linha do tempo determinística: tudo é função do frame (sem timers, Date.now ou Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 90;   // 2700 frames; o encerramento da marca (~4,7 s, com a fala "cta") fica no fim da s11
//   export const VO_KEYS = ["s1","s2","s3","s4","s5","s6","s7","s8","s9","s10","s11"] as const;
//   const PLANNED_SECONDS = [6.5, 6.5, 7, 8, 7, 8.5, 9.5, 9, 7.5, 7.5, 13];   // soma 90
//   const GAPS = [0.6, 0.7, 0.6, 0.6, 0.7, 0.8, 1.3, 1.2, 0.7, 0.9];  // pausas maiores antes do espaço e do pôr do sol
// ----------------------------------------------------------------------------------------------
//
// Mundo 3D (u3d, ESQUEMÁTICO para a atmosfera; personagens e objetos do chão em escala entre si):
//   Régua do chão: 1 m = 0,3 u3d (árvore de 5 m = 1,5 u3d) → worldScale(0.3): pessoa ≈ 0,51 u3d, mascote ≈ 0,48 u3d.
//   Maquete 8 × 3,6 u3d sobre o BrandPedestal: mar à esquerda (x −4..−1,6), morro no meio (topo x≈0,6, y≈0,6),
//   deserto com dunas à direita (x 1,8..4). Observadores no topo do morro: pessoa (x 0,95) e mascote (x 0,35).
//   Atmosfera = meia-cúpula translúcida (raio 4,6, eixo x) sobre a maquete, com moléculas dentro (fora de escala).
//   Sol = esfera brilhante num arco: meio-dia alto (x −1,2, y 7,2) → pôr do sol (x −7,8, y 0,7).
//   Luz = feixe de "fótons" (partículas coloridas) do Sol até os observadores; o azul ricocheteia nas moléculas.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { worldScale } from "../components/Person";
import { CLUSTER } from "./sky";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-ceu", language: "pt-BR" };

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
/** Âncora de palavra presa ao fim da cena (a estimativa de 155 ppm pode passar do corte; a voz real é mais rápida). */
const c = (i: number, f: number, margin = 2) => Math.min(f, end(i) - margin);
const W = wordLocal;
/** Escala do mascote na régua da maquete (1 m = 0,3 u3d). */
const MS = worldScale(0.3).mascot;
const key = (at: number, pose: { position: Vec3; target: Vec3 }, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const narration = (k: VoKey, status: AudioCue["status"]): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "ready" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });

// Poses (orbit(alvo, distância, azimute°, elevação°)).
const P = {
  observers: orbit([0.6, 0.95, 0.7], 6.5, 14, 8),
  observersLow: orbit([0.6, 1.3, 0.8], 5.5, 22, -4), // de baixo, olhando o céu por trás deles
  wide: orbit([0, 2.4, 0], 26, 8, 10),
  ocean: orbit([-2.6, 0.9, 0.4], 10, -38, 16),
  desert: orbit([3.0, 0.6, 0.6], 7.5, 22, 12),
  sunPrism: orbit([-0.95, 4.2, 0.1], 12, 4, 4),
  prismOut: orbit([-0.9, 4.1, 0.1], 8.5, -6, 2),
  molecules: orbit(CLUSTER, 4.6, 10, 6),
  molecules2: orbit(CLUSTER, 4.8, -10, 4),
  moleculesWide: orbit([0.1, 1.9, 0.4], 7.5, 14, 8),
  skyAll: orbit([-0.2, 2.2, 0], 18, 6, 12),
  space: orbit([-0.4, 2.6, 0], 22, 12, 30),
  spaceClose: orbit([-0.7, 4.4, 0.6], 7.5, 18, 10),
  sunsetWide: orbit([-1.9, 1.3, 0], 20, 35, 7),
  sunsetPath: orbit([-1.8, 1.0, 0.3], 13, 50, 8),
  final: orbit([-1.4, 2.0, 0], 28, 6, 8),
  finalOrbit: orbit([-1.4, 2.0, 0], 27, 14, 10),
};

// Objetos persistentes (ids estáveis).
const O = {
  backdrop: { id: "backdrop", type: "fundo-estúdio com tom do céu (dia/espaço/pôr do sol)", visible: true },
  land: { id: "land", type: "maquete: mar · morro com árvores · deserto com dunas", visible: true },
  atmosphere: { id: "atmosphere", type: "meia-cúpula de ar translúcida (esquemática)", visible: true },
  molecules: { id: "molecules", type: "moléculas N₂ e O₂ (pares de esferas) dentro da cúpula", visible: true },
  sun: { id: "sun", type: "Sol low-poly emissivo num arco", visible: true },
  photons: { id: "photons", type: "feixe de fótons coloridos Sol → observadores", visible: true },
  person: { id: "person", type: "pessoa (crowdLooks(1,'ceu'), escala worldScale(0.3).person)", visible: true },
  mascotObj: { id: "mascot", type: "mascote (escala worldScale(0.3).mascot; trilhas mascot.*)", visible: true },
};
const base = [O.backdrop, O.land, O.atmosphere, O.sun, O.person, O.mascotObj];

export const scenes: ScenePlan[] = [
  // 1 — GANCHO
  {
    id: "scene-01-gancho",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration: "Por que o céu é azul? A resposta é a mesma que faz o pôr do sol ficar laranja.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.observersLow), key(W("s1", 6), P.observers, "soft"), key(end(0), P.wide, "soft")] },
    objects: [...base, { ...O.atmosphere, state: { start: "azul", end: "prévia laranja e volta" } }],
    animations: [
      lin("sky.blue", 0, 1, 1, 1), lin("sky.sunset", 0, 1, 0, 0), lin("space.view", 0, 1, 0, 0), lin("sun.angle", 0, 1, 0.12, 0.12),
      // prévia: o céu esquenta para laranja em "pôr do sol" e volta ao azul no fim do plano
      lin("sky.sunset", c(0, W("s1", 14), 30), c(0, W("s1", 17), 14), 0, 0.85, "inOut"),
      lin("sun.angle", c(0, W("s1", 14), 30), c(0, W("s1", 17), 14), 0.12, 0.9, "inOut"),
      lin("sky.sunset", end(0) - 12, end(0), 0.85, 0, "inOut"),
      lin("sun.angle", end(0) - 12, end(0), 0.9, 0.12, "inOut"),
      ...mascot.place([0.35, 0.6, 0.8], 0.4, MS, 0),
      ...mascot.wave(W("s1", 0), s(1.3)),
      ...mascot.look(W("s1", 3), -0.3),
      lin("person.look", W("s1", 3), W("s1", 3) + 10, 0, 1),
    ],
    badges: [
      { text: "POR QUE AZUL?", variant: "warning", icon: "?", appearAt: W("s1", 0), disappearAt: W("s1", 6) - 2 },
      { text: "E O PÔR DO SOL?", variant: "warning", icon: "?", appearAt: W("s1", 14), disappearAt: end(0) - 2 },
    ],
    highlights: ["CÉU", "AZUL", "MESMA", "PÔR", "SOL", "LARANJA"],
    captions: [cap("s1", 0, "Por que o céu é azul? A resposta é a mesma que faz o pôr do sol ficar laranja.")],
    audioCues: [narration("s1", "ready"), sfx("whoosh-soft", 0, 0.24), sfx("pop-high", W("s1", 0), 0.24), sfx("shimmer", W("s1", 14), 0.22)],
  },
  // 2 — O MITO DO REFLEXO
  {
    id: "scene-02-mito-mar",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "Muita gente acha que o céu reflete o mar. Só que ele é azul até no meio do deserto.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.wide), key(W("s2", 5), P.ocean, "soft"), key(W("s2", 10), orbit([-2.4, 0.9, 0.4], 9.5, -30, 14), "soft"), key(W("s2", 14), P.desert, "soft"), key(end(1), orbit([2.6, 1.6, 0.4], 9, 12, 16), "soft")] },
    objects: [...base, { id: "reflectArrows", type: "setas mar→céu riscadas (mito)", visible: true }],
    animations: [
      lin("myth.arrows", W("s2", 5), W("s2", 8), 0, 1, "out"),
      lin("myth.strike", W("s2", 9), W("s2", 11), 0, 1, "out"),
      lin("myth.arrows", W("s2", 12), W("s2", 14), undefined, 0, "in"),
      lin("desert.skyGlow", W("s2", 13), c(1, W("s2", 18)), 0, 1, "out"),
      ...mascot.jump(c(1, W("s2", 18), 18)),
    ],
    badges: [
      { text: "REFLEXO DO MAR?", variant: "negative", subtitle: "mito", appearAt: W("s2", 6), disappearAt: W("s2", 13) - 2 },
      { text: "AZUL NO DESERTO TAMBÉM", variant: "info", appearAt: W("s2", 13), disappearAt: end(1) - 2 },
    ],
    highlights: ["REFLETE", "MAR", "AZUL", "DESERTO"],
    captions: [cap("s2", 1, "Muita gente acha que o céu reflete o mar. Só que ele é azul até no meio do deserto.")],
    audioCues: [narration("s2", "ready"), sfx("whoosh-soft", 0, 0.2), sfx("buzz", W("s2", 9), 0.24), sfx("pop-high", c(1, W("s2", 18), 18), 0.2)],
  },
  // 3 — LUZ BRANCA = TODAS AS CORES
  {
    id: "scene-03-luz-branca",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "O segredo começa na luz do Sol. Ela parece branca, mas é uma mistura de todas as cores.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, orbit([2.6, 1.6, 0.4], 9, 12, 16)), key(W("s3", 4), P.sunPrism, "soft"), key(end(2), P.prismOut, "soft")] },
    objects: [...base, { id: "prism", type: "prisma low-poly flutuante", visible: true, state: { start: "ausente", end: "abre o leque de cores" } }, O.photons],
    animations: [
      lin("ray.white", W("s3", 4), W("s3", 7), 0, 1, "out"),
      { type: "spring", target: "prism.show", startFrame: W("s3", 9), endFrame: W("s3", 9) + 30, from: 0, to: 1, damping: 12, unit: "0-1" },
      lin("spectrum.fan", W("s3", 12), c(2, W("s3", 17) + 6), 0, 1, "out"),
      ...mascot.point(W("s3", 13), s(1.6), -0.6),
    ],
    badges: [
      { text: "LUZ BRANCA", variant: "info", appearAt: W("s3", 9), disappearAt: W("s3", 13) - 2 },
      { text: "TODAS AS CORES", variant: "positive", subtitle: "o espectro da luz", appearAt: W("s3", 13), disappearAt: end(2) - 2 },
    ],
    highlights: ["LUZ", "SOL", "BRANCA", "MISTURA", "CORES"],
    captions: [cap("s3", 2, "O segredo começa na luz do Sol. Ela parece branca, mas é uma mistura de todas as cores.")],
    audioCues: [narration("s3", "ready"), sfx("glow", W("s3", 4), 0.22), sfx("shimmer", W("s3", 12), 0.26)],
  },
  // 4 — O AR: MOLÉCULAS
  {
    id: "scene-04-moleculas",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "No caminho até você, essa luz atravessa o ar: trilhões de moléculas minúsculas de nitrogênio e oxigênio.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.prismOut), key(W("s4", 6), P.moleculesWide, "soft"), key(end(3), P.molecules, "soft")] },
    objects: [...base, O.photons, { ...O.molecules, state: { start: "invisíveis", end: "zoom: pares N₂/O₂ grandes" } }],
    animations: [
      lin("spectrum.fan", 0, 10, undefined, 0, "in"),
      lin("prism.show", 0, 10, undefined, 0, "in"),
      lin("ray.white", 0, 10, undefined, 0, "in"),
      lin("photons.flow", W("s4", 4), W("s4", 6), 0, 1, "out"),
      lin("molecules.zoom", W("s4", 9), W("s4", 12) + 6, 0, 1, "out"),
      lin("molecules.labels", W("s4", 14), W("s4", 16) + 6, 0, 1, "out"),
    ],
    badges: [{ text: "MOLÉCULAS DO AR", variant: "info", subtitle: "nitrogênio (N₂) e oxigênio (O₂)", appearAt: W("s4", 11), disappearAt: end(3) - 2 }],
    highlights: ["LUZ", "AR", "TRILHÕES", "MOLÉCULAS", "NITROGÊNIO", "OXIGÊNIO"],
    captions: [cap("s4", 3, "No caminho até você, essa luz atravessa o ar: trilhões de moléculas minúsculas de nitrogênio e oxigênio.")],
    audioCues: [narration("s4", "ready"), sfx("dive", W("s4", 6), 0.2), sfx("bubbles", W("s4", 9), 0.18)],
  },
  // 5 — ONDA CURTA x ONDA LONGA
  {
    id: "scene-05-onda-curta",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "E essas moléculas desviam muito mais as cores de onda curta, como o azul, do que o vermelho.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.molecules), key(end(4), P.molecules2, "soft")] },
    objects: [...base, O.photons, O.molecules, { id: "waveCard", type: "cartão 2D: onda azul curta × onda vermelha longa", visible: true }],
    animations: [
      lin("photons.scatter", W("s5", 3), W("s5", 5) + 6, 0, 0.6, "out"),
      lin("waveCard.show", W("s5", 8), W("s5", 10) + 6, 0, 1, "out"),
      lin("waveCard.compare", W("s5", 13), c(4, W("s5", 17) + 6), 0, 1, "inOut"),
    ],
    badges: [
      { text: "ONDA CURTA = MAIS DESVIO", variant: "positive", appearAt: W("s5", 9), disappearAt: end(4) - 2 },
    ],
    highlights: ["DESVIAM", "ONDA", "CURTA", "AZUL", "VERMELHO"],
    captions: [cap("s5", 4, "E essas moléculas desviam muito mais as cores de onda curta, como o azul, do que o vermelho.")],
    audioCues: [narration("s5", "ready"), sfx("tick", W("s5", 3), 0.2), sfx("badge", W("s5", 9), 0.26)],
  },
  // 6 — ESPALHAMENTO DE RAYLEIGH: O CÉU FICA AZUL
  {
    id: "scene-06-rayleigh",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "Isso se chama espalhamento de Rayleigh. O azul ricocheteia pelo céu inteiro e chega aos seus olhos de todas as direções.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.molecules2), key(W("s6", 6), P.skyAll, "soft"), key(W("s6", 13), P.observersLow, "soft"), key(end(5), P.observers, "soft")] },
    objects: [...base, O.photons, { ...O.molecules, state: { start: "zoom", end: "voltam a pontinhos" } }],
    animations: [
      lin("waveCard.show", 0, 10, undefined, 0, "in"),
      lin("molecules.zoom", W("s6", 5), W("s6", 7), undefined, 0, "inOut"),
      lin("photons.scatter", W("s6", 6), W("s6", 11), undefined, 1, "out"),
      lin("sky.glowBlue", W("s6", 8), W("s6", 11) + 8, 0, 1, "out"),
      lin("eyeRays.show", W("s6", 13), W("s6", 20) + 6, 0, 1, "out"),
      ...fx.punch(W("s6", 3)),
      ...mascot.look(W("s6", 8), 0, 12),
    ],
    badges: [
      { text: "ESPALHAMENTO DE RAYLEIGH", variant: "positive", appearAt: W("s6", 3), disappearAt: W("s6", 13) - 2 },
      { text: "AZUL DE TODAS AS DIREÇÕES", variant: "info", appearAt: W("s6", 13), disappearAt: end(5) - 2 },
    ],
    highlights: ["ESPALHAMENTO", "RAYLEIGH", "AZUL", "CÉU", "INTEIRO", "DIREÇÕES"],
    captions: [cap("s6", 5, "Isso se chama espalhamento de Rayleigh. O azul ricocheteia pelo céu inteiro e chega aos seus olhos de todas as direções.")],
    audioCues: [narration("s6", "ready"), sfx("badge", W("s6", 3), 0.28), sfx("shimmer", W("s6", 8), 0.24)],
  },
  // 7 — POR QUE NÃO ROXO?
  {
    id: "scene-07-violeta",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "Mas o violeta se espalha ainda mais. Então por que o céu não é roxo? O Sol manda menos violeta, e seus olhos são menos sensíveis a ele.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.observers), key(W("s7", 7), orbit([0.6, 1.4, 0.7], 7.5, -6, 14), "soft"), key(end(6), P.skyAll, "soft")] },
    objects: [...base, O.photons, { id: "violetCard", type: "cartão 2D: 'quanto o Sol manda' × 'quanto o olho vê' por cor", visible: true }],
    animations: [
      lin("photons.violet", W("s7", 1), W("s7", 4), 0, 1, "out"),
      lin("sky.violetTint", W("s7", 9), W("s7", 14), 0, 1, "inOut"), // o céu "testa" ficar roxo...
      lin("sky.violetTint", W("s7", 15), W("s7", 19), undefined, 0, "inOut"), // ...e volta ao azul
      lin("violetCard.show", W("s7", 15), W("s7", 17) + 6, 0, 1, "out"),
      lin("violetCard.eye", W("s7", 20), c(6, W("s7", 25) + 6), 0, 1, "inOut"),
      lin("violetCard.show", end(6) - 10, end(6), undefined, 0, "in"),
      lin("photons.violet", end(6) - 10, end(6), undefined, 0, "in"),
      ...mascot.jump(W("s7", 14)),
    ],
    badges: [
      { text: "E O VIOLETA?", variant: "warning", icon: "?", appearAt: W("s7", 2), disappearAt: W("s7", 15) - 2 },
      { text: "MENOS VIOLETA DO SOL", variant: "info", subtitle: "e o olho vê pouco violeta", appearAt: W("s7", 15), disappearAt: end(6) - 2 },
    ],
    highlights: ["VIOLETA", "ROXO", "SOL", "MENOS", "OLHOS", "SENSÍVEIS"],
    captions: [cap("s7", 6, "Mas o violeta se espalha ainda mais. Então por que o céu não é roxo? O Sol manda menos violeta, e seus olhos são menos sensíveis a ele.")],
    audioCues: [narration("s7", "ready"), sfx("pop-high", W("s7", 2), 0.22), sfx("water-rise", W("s7", 9), 0.16), sfx("badge", W("s7", 15), 0.26)],
  },
  // 8 — A PROVA: NO ESPAÇO O CÉU É PRETO
  {
    id: "scene-08-espaco",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "Quer uma prova? No espaço não tem ar para espalhar a luz. Por isso lá o céu é preto, mesmo com o Sol brilhando.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, P.skyAll), key(W("s8", 4), P.space, "soft"), key(end(7), P.spaceClose, "soft")] },
    objects: [...base, { id: "stars", type: "estrelas (SpaceScene.Stars)", visible: true, state: { start: "ocultas", end: "visíveis acima da cúpula" } }, { ...O.atmosphere, state: { start: "céu azul", end: "fina borda azul vista de fora" } }],
    animations: [
      lin("space.view", W("s8", 3), W("s8", 6) + 6, 0, 1, "inOut"),
      lin("stars.show", W("s8", 4), W("s8", 7) + 6, 0, 1, "out"),
      lin("photons.flow", W("s8", 5), W("s8", 9), undefined, 0.35, "inOut"),
      // o mascote sobe flutuando para fora da atmosfera — astronauta em casa
      ...mascot.float(W("s8", 3)),
      lin("mascot.y", W("s8", 3), W("s8", 11), 0.6, 4.0, "inOut", "u3d"),
      lin("mascot.x", W("s8", 3), W("s8", 11), 0.35, -0.3, "inOut", "u3d"),
      lin("mascot.z", W("s8", 3), W("s8", 11), 0.8, 1.0, "inOut", "u3d"),
      ...mascot.wave(W("s8", 15), s(1.4)),
      ...fx.whipOut(end(7)),
    ],
    badges: [
      { text: "SEM AR = SEM AZUL", variant: "positive", appearAt: W("s8", 7), disappearAt: W("s8", 15) - 2 },
      { text: "CÉU PRETO NO ESPAÇO", variant: "info", appearAt: W("s8", 15), disappearAt: end(7) - 2 },
    ],
    highlights: ["PROVA", "ESPAÇO", "AR", "PRETO", "SOL"],
    captions: [cap("s8", 7, "Quer uma prova? No espaço não tem ar para espalhar a luz. Por isso lá o céu é preto, mesmo com o Sol brilhando.")],
    audioCues: [narration("s8", "ready"), sfx("whoosh-big", W("s8", 3), 0.28), sfx("deep-amb", W("s8", 5), 0.18)],
  },
  // 9 — FIM DA TARDE: CAMINHO MAIS LONGO
  {
    id: "scene-09-fim-tarde",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "E no fim da tarde, o Sol fica baixo. A luz atravessa muito mais ar até chegar em você.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.observers), key(W("s9", 6), P.sunsetWide, "soft"), key(end(8), P.sunsetPath, "soft")] },
    objects: [...base, O.photons, { id: "pathGuides", type: "dois caminhos tracejados: meio-dia (curto) × fim de tarde (longo)", visible: true }],
    animations: [
      ...fx.whipIn(),
      lin("space.view", 0, 8, undefined, 0, "out"),
      lin("stars.show", 0, 8, undefined, 0, "out"),
      ...mascot.float(0, false, 1),
      ...mascot.place([0.35, 0.6, 0.8], 0.6, MS, 0),
      lin("sun.angle", W("s9", 5), W("s9", 8) + 10, 0.12, 0.92, "inOut"),
      lin("photons.flow", W("s9", 5), W("s9", 9), undefined, 1, "out"),
      lin("path.noon", W("s9", 9), W("s9", 11), 0, 1, "out"),
      lin("path.sunset", W("s9", 11), W("s9", 14) + 8, 0, 1, "out"),
    ],
    badges: [
      { text: "SOL BAIXO", variant: "info", appearAt: W("s9", 6), disappearAt: W("s9", 11) - 2 },
      { text: "CAMINHO MUITO MAIS LONGO", variant: "warning", appearAt: W("s9", 11), disappearAt: end(8) - 2 },
    ],
    highlights: ["TARDE", "SOL", "BAIXO", "MUITO", "MAIS", "AR"],
    captions: [cap("s9", 8, "E no fim da tarde, o Sol fica baixo. A luz atravessa muito mais ar até chegar em você.")],
    audioCues: [narration("s9", "ready"), sfx("whoosh", 0, 0.26), sfx("water-rise", W("s9", 6), 0.16)],
  },
  // 10 — O AZUL FICA PARA TRÁS: SOBRA LARANJA E VERMELHO
  {
    id: "scene-10-sobra-laranja",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "No caminho, quase todo o azul se espalha e fica para trás. Sobram o laranja e o vermelho.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.sunsetPath), key(W("s10", 12), orbit([-0.4, 1.0, 0.6], 8.5, 18, 6), "soft"), key(end(9), P.observersLow, "soft")] },
    objects: [...base, O.photons, { id: "pathGuides", type: "caminho longo", visible: true }],
    animations: [
      lin("photons.sunsetStrip", W("s10", 2), W("s10", 11), 0, 1, "inOut"), // os fótons azuis saem do feixe ao longo do caminho
      lin("sky.sunset", W("s10", 9), W("s10", 16) + 8, 0, 1, "inOut"),
      lin("path.noon", W("s10", 1), W("s10", 3), undefined, 0, "in"),
      ...mascot.point(W("s10", 12), s(1.6), -1.2),
      lin("person.look", W("s10", 12), W("s10", 12) + 12, undefined, 0.4),
    ],
    badges: [
      { text: "O AZUL SE PERDE", variant: "negative", subtitle: "espalhado pelo caminho", appearAt: W("s10", 5), disappearAt: W("s10", 12) - 2 },
      { text: "SOBRA LARANJA E VERMELHO", variant: "positive", appearAt: W("s10", 12), disappearAt: end(9) - 2 },
    ],
    highlights: ["AZUL", "ESPALHA", "TRÁS", "LARANJA", "VERMELHO"],
    captions: [cap("s10", 9, "No caminho, quase todo o azul se espalha e fica para trás. Sobram o laranja e o vermelho.")],
    audioCues: [narration("s10", "ready"), sfx("whoosh-soft", W("s10", 5), 0.2), sfx("glow", W("s10", 12), 0.26)],
  },
  // 11 — PRONTO (+ encerramento fixo da marca nos últimos ~4,7 s)
  {
    id: "scene-11-final",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "Pronto: agora você sabe por que o céu é azul e o pôr do sol, laranja.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.observersLow), key(s(1.2), P.final, "soft"), key(end(10), P.finalOrbit, "linear")] },
    objects: [...base, O.photons, { id: "finalLabels", type: "rótulos: MEIO-DIA: caminho curto → azul · FIM DE TARDE: caminho longo → laranja", visible: true }],
    animations: [
      lin("path.sunset", 0, 10, undefined, 0, "in"),
      lin("finalSplit", s(0.8), W("s11", 9) + 10, 0, 1, "inOut"), // metade do céu azul (sol alto) × metade laranja (sol baixo)
      lin("finalLabels.reveal", W("s11", 6), W("s11", 15) + 10, 0, 1, "linear"),
      ...mascot.cheer(W("s11", 0), s(1.6)),
      ...fx.burst("final", W("s11", 0)),
    ],
    badges: [{ text: "O MESMO ESPALHAMENTO", variant: "positive", subtitle: "céu azul · pôr do sol laranja", appearAt: W("s11", 0), disappearAt: W("s11", 15) + 20 }],
    highlights: ["PRONTO", "CÉU", "AZUL", "PÔR", "SOL", "LARANJA"],
    captions: [cap("s11", 10, "Pronto: agora você sabe por que o céu é azul e o pôr do sol, laranja.")],
    audioCues: [narration("s11", "ready"), sfx("final", W("s11", 0), 0.28)],
  },
];

/** Valor de uma trilha de animação (ex.: "sun.angle") no frame global. */
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
