// scene-plan.ts — "Quem foi ela?" (Marie Curie, com o nome em mistério até o fim) — roteiro v1, AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts SEM tradução (tipos e helpers do template).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local em que a palavra de índice i (base 0) da fala sN começa (estimativa a 155 ppm até o TTS;
// c(i, f) prende a âncora ao fim da cena porque a estimativa pode passar do corte — a voz real é mais rápida).
// Linha do tempo determinística: tudo é função do frame (sem timers, Date.now ou Math.random sem semente).
//
// ---- Configuração que vai para src/utils/timing.ts ------------------------------------------
//   export const SECONDS = 170;   // 5100 frames (2:50); encerramento da marca (~4,7 s, fala "cta") no fim da s16
//   export const VO_KEYS = ["s1", ..., "s16"] as const;
//   const PLANNED_SECONDS = [9.5, 8.1, 6.8, 12.9, 8.7, 8.7, 17.4, 8.1, 9.8, 13.9, 12.5, 10.2, 9.1, 15.0, 7.1, 12.2];
//   const GAPS = [0.6, 0.7, 0.6, 0.6, 0.7, 0.6, 0.6, 0.6, 0.7, 0.8, 1.4, 0.7, 0.7, 2.2, 2.6]; // pausa longa antes do nome
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4%.
// ----------------------------------------------------------------------------------------------
//
// Mundo 3D: uma LINHA DO TEMPO EM MAQUETE — pedestal comprido (x −16..+17, profundidade 3,2 u3d) com 8 estações,
// da esquerda (1867) para a direita (hoje). Régua: 1 m = 0,3 u3d → worldScale(0.3): pessoa ≈ 0,51 u3d, mascote ≈ 0,48.
//   x −13 VARSÓVIA (casas, universidade com portão trancado, janelas da universidade clandestina)
//   x  −9 O TRATO (casa da família onde ela é governanta; trilho e trem para Paris; moedas indo para a irmã)
//   x  −5 PARIS (sótão em corte: cama, escrivaninha, vela; diplomas)
//   x −0,5 LABORATÓRIO (bancada: eletrômetro, amostras de urânio, pedra de pechblenda; átomo esquemático; cartões Po/Ra)
//   x   4 O GALPÃO (telhado com goteiras, caldeirão, monte de minério que encolhe, frasquinho que brilha, balança)
//   x   8 O PALCO (pódio com medalhas 1903 e 1911; púlpito da Sorbonne)
//   x 11,5 A GUERRA (carro com raio X, maca, tela com a bala)
//   x  15 HOJE (cofre da biblioteca: caixa de chumbo com cadernos, contador Geiger) — gancho e revelação
// "ELA" = Person com vestido longo escuro (variação de figurino da Fase 2), em SILHUETA (preta, contorno roxo) com um
// "?" flutuando até a revelação (s15), quando a luz acende o rosto, o cabelo preso e o vestido. Nada de nome, sobrenome,
// apelido ("pequenas Curies") ou rosto realista antes da s15. O marido aparece só como "o físico" (sem nome).

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, s, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-historia", language: "pt-BR" };

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
const c = (i: number, f: number, margin = 2) => Math.min(f, end(i) - margin);
const W = wordLocal;
const key = (at: number, pose: { position: Vec3; target: Vec3 }, easing?: EaseName): CameraKey => ({ at, ...pose, easing });
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "planned" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "planned" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });

// Estações (x) e poses de câmera — orbit(alvo, distância, azimute°, elevação°).
const X = { warsaw: -13, deal: -9, paris: -5, lab: -0.5, shed: 4, stage: 8, war: 11.5, vault: 15 };
const P = {
  vaultClose: orbit([X.vault, 0.45, 0.4], 3.6, 10, 16),
  vault: orbit([X.vault, 0.6, 0.3], 6.5, -12, 12),
  warsawWide: orbit([X.warsaw, 0.8, 0], 9, 14, 14),
  warsawGate: orbit([X.warsaw + 0.6, 0.5, 0.5], 5.5, 22, 8),
  warsawWindows: orbit([X.warsaw - 0.6, 0.8, 0.2], 6, -16, 10),
  deal: orbit([X.deal, 0.6, 0.3], 7, 12, 12),
  dealTrain: orbit([X.deal + 1.6, 0.4, 0.6], 6.5, 30, 10),
  paris: orbit([X.paris, 0.9, 0.4], 6, -10, 10),
  parisDesk: orbit([X.paris + 0.2, 0.75, 0.5], 3.8, 8, 12),
  lab: orbit([X.lab, 0.7, 0.4], 6, 10, 14),
  labMeter: orbit([X.lab + 0.5, 0.6, 0.6], 3.4, 16, 12),
  labSamples: orbit([X.lab - 0.4, 0.55, 0.6], 3.6, -8, 16),
  atom: orbit([X.lab, 1.7, 0.4], 4.2, 6, 4),
  labOre: orbit([X.lab - 0.9, 0.55, 0.6], 3.6, -18, 14),
  elements: orbit([X.lab, 1.3, 0.4], 5, 0, 6),
  shed: orbit([X.shed, 0.8, 0.3], 6.5, 14, 14),
  shedVial: orbit([X.shed + 0.6, 0.6, 0.6], 3.2, 10, 12),
  stage: orbit([X.stage, 0.8, 0.3], 6.5, -10, 12),
  stageMedal: orbit([X.stage - 0.4, 0.95, 0.5], 3.6, 4, 8),
  sorbonne: orbit([X.stage + 1.0, 0.7, 0.5], 4.5, 20, 10),
  war: orbit([X.war, 0.6, 0.4], 6, 16, 12),
  warScreen: orbit([X.war + 0.5, 0.6, 0.7], 3.4, 10, 8),
  reveal: orbit([X.vault, 0.55, 0.5], 3.0, 0, 6),
  all: orbit([0.5, 0.5, 0], 46, 6, 14),
};

// Objetos persistentes (ids estáveis).
const O = {
  backdrop: { id: "backdrop", type: "estúdio escuro (tint história #2e1f3a) com halo roxo", visible: true },
  timeline: { id: "timeline", type: "pedestal da linha do tempo + placas de ano na borda frontal", visible: true },
  stations: { id: "stations", type: "as 8 estações (cenários) da maquete", visible: true },
  her: { id: "her", type: "ELA: Person de vestido longo, em silhueta com '?' até a revelação (trilhas her.*)", visible: true },
  mascotObj: { id: "mascot", type: "mascote (worldScale(0.3).mascot; trilhas mascot.*)", visible: true },
};
const base = [O.backdrop, O.timeline, O.stations, O.her, O.mascotObj];
/** Ela anda até a estação `x` entre os frames a..b (z 0,55 = frente das estações). */
const herWalk = (a: number, b: number, from: number, to: number): TrackAnimation[] => [
  lin("her.walk", a, a + 6, 0, 1), lin("her.x", a, b, from, to, "linear", "u3d"), lin("her.walk", b - 8, b, 1, 0),
];

export const scenes: ScenePlan[] = [
  // 1 — GANCHO: os cadernos ainda são radioativos (salto para "hoje")
  {
    id: "scene-01-gancho-cadernos",
    startFrame: sc(0).from,
    durationInFrames: sc(0).durationInFrames,
    voKey: "s1",
    narration: "Os cadernos desta mulher ficam guardados em caixas de chumbo. Mais de cem anos depois, eles ainda são radioativos. Quem foi ela?",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.vaultClose), key(W("s1", 10), P.vaultClose, "soft"), key(end(0), P.vault, "soft")] },
    objects: [...base, { id: "leadBox", type: "caixa de chumbo (cinza-azulada) com tampa + 3 cadernos", visible: true, state: { start: "fechada", end: "aberta, cadernos emitindo partículas" } }, { id: "geiger", type: "contador Geiger com ponteiro", visible: true }],
    animations: [
      lin("her.x", 0, 1, X.vault + 1.1, X.vault + 1.1, "linear", "u3d"), lin("her.reveal", 0, 1, 0, 0), lin("her.mystery", 0, 1, 1, 1),
      lin("box.lid", W("s1", 4), W("s1", 9) + 6, 0, 1, "out"),
      lin("notebooks.radiation", W("s1", 15), W("s1", 18) + 6, 0, 1, "out"),
      lin("geiger.needle", W("s1", 16), W("s1", 18) + 10, 0, 0.85, "out"),
      lin("her.spot", c(0, W("s1", 19)), c(0, W("s1", 21) + 8), 0, 1, "out"), // luz de recorte na silhueta, o "?" pulsa
      ...mascot.place([X.vault - 0.9, 0, 0.7], 0.5, 1, 0), // escala real worldScale(0.3).mascot na Fase 2
      ...mascot.jump(c(0, W("s1", 17), 16)),
    ],
    badges: [
      { text: "CAIXAS DE CHUMBO", variant: "info", appearAt: W("s1", 7), disappearAt: W("s1", 15) - 2 },
      { text: "AINDA RADIOATIVOS", variant: "warning", subtitle: "mais de 100 anos depois", appearAt: W("s1", 15), disappearAt: c(0, W("s1", 19)) - 2 },
      { text: "QUEM FOI ELA?", variant: "warning", icon: "?", size: "large", appearAt: c(0, W("s1", 19)), disappearAt: end(0) - 2 },
    ],
    highlights: ["CADERNOS", "CHUMBO", "RADIOATIVOS", "QUEM", "ELA"],
    captions: [cap("s1", 0, "Os cadernos desta mulher ficam guardados em caixas de chumbo. Mais de cem anos depois, eles ainda são radioativos. Quem foi ela?")],
    audioCues: [narration("s1"), sfx("geiger", W("s1", 15), 0.22), sfx("clunk", W("s1", 4), 0.22), sfx("pop-high", c(0, W("s1", 19)), 0.24)],
  },
  // 2 — VARSÓVIA, 1867: universidades fechadas para mulheres
  {
    id: "scene-02-varsovia",
    startFrame: sc(1).from,
    durationInFrames: sc(1).durationInFrames,
    voKey: "s2",
    narration: "A história começa em Varsóvia, em 1867. A Polônia era dominada pela Rússia, e as universidades não aceitavam mulheres.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.warsawWide), key(W("s2", 13), P.warsawGate, "soft"), key(end(1), orbit([X.warsaw + 0.5, 0.55, 0.5], 5, 14, 9), "soft")] },
    objects: [...base, { id: "university", type: "prédio da universidade com portão de grades", visible: true, state: { start: "aberto", end: "portão fecha + ✖ vermelho" } }],
    animations: [
      ...fx.whipIn(-1),
      lin("her.x", 0, 1, X.warsaw + 1.4, X.warsaw + 1.4, "linear", "u3d"),
      lin("year.1867", W("s2", 5), W("s2", 6) + 8, 0, 1, "out"),
      lin("warsaw.shadow", W("s2", 8), W("s2", 12) + 6, 0, 1, "inOut"), // o céu da estação escurece (domínio)
      lin("gate.close", W("s2", 15), W("s2", 17) + 6, 0, 1, "out"),
      ...mascot.place([X.warsaw + 2.1, 0, 0.75], -0.4, 1, 0),
      ...mascot.jump(c(1, W("s2", 18), 16)),
    ],
    badges: [
      { text: "VARSÓVIA, 1867", variant: "info", appearAt: W("s2", 4), disappearAt: W("s2", 13) - 2 },
      { text: "PROIBIDO PARA MULHERES", variant: "negative", subtitle: "universidades", appearAt: W("s2", 15), disappearAt: end(1) - 2 },
    ],
    highlights: ["VARSÓVIA", "1867", "POLÔNIA", "RÚSSIA", "UNIVERSIDADES", "MULHERES"],
    captions: [cap("s2", 1, "A história começa em Varsóvia, em 1867. A Polônia era dominada pela Rússia, e as universidades não aceitavam mulheres.")],
    audioCues: [narration("s2"), sfx("whoosh", 0, 0.24), sfx("clunk", W("s2", 15), 0.26), sfx("buzz", W("s2", 17), 0.2)],
  },
  // 3 — A UNIVERSIDADE CLANDESTINA
  {
    id: "scene-03-clandestina",
    startFrame: sc(2).from,
    durationInFrames: sc(2).durationInFrames,
    voKey: "s3",
    narration: "Então ela estudou escondido, numa universidade clandestina que mudava de endereço para não ser descoberta.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, orbit([X.warsaw + 0.5, 0.55, 0.5], 5, 14, 9)), key(W("s3", 4), P.warsawWindows, "soft"), key(end(2), orbit([X.warsaw - 0.6, 0.8, 0.2], 6.4, -26, 12), "soft")] },
    objects: [...base, { id: "windows", type: "janelas de 3 casas (uma acende por vez, com 4 silhuetas estudando)", visible: true }],
    animations: [
      ...herWalk(W("s3", 1), W("s3", 4), X.warsaw + 1.4, X.warsaw - 0.4),
      lin("windows.hop", W("s3", 5), W("s3", 14) + 10, 0, 3, "linear"), // 0..3: a luz "pula" de casa em casa
      lin("lantern.patrol", W("s3", 11), W("s3", 14) + 10, 0, 1, "linear"), // lanterna de patrulha passa e não acha
    ],
    badges: [{ text: "UNIVERSIDADE CLANDESTINA", variant: "info", subtitle: "aulas secretas em casas", appearAt: W("s3", 5), disappearAt: end(2) - 2 }],
    highlights: ["ESCONDIDO", "CLANDESTINA", "ENDEREÇO", "DESCOBERTA"],
    captions: [cap("s3", 2, "Então ela estudou escondido, numa universidade clandestina que mudava de endereço para não ser descoberta.")],
    audioCues: [narration("s3"), sfx("click", W("s3", 5), 0.22), sfx("click", W("s3", 8), 0.22), sfx("click", W("s3", 11), 0.22)],
  },
  // 4 — O TRATO COM A IRMÃ
  {
    id: "scene-04-trato",
    startFrame: sc(3).from,
    durationInFrames: sc(3).durationInFrames,
    voKey: "s4",
    narration: "Para estudar de verdade, precisava ir para Paris, mas não tinha dinheiro. Então fez um trato com a irmã: trabalhou como governanta para pagar a faculdade dela. Depois, seria a sua vez.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, orbit([X.warsaw - 0.6, 0.8, 0.2], 6.4, -26, 12)), key(W("s4", 4), P.deal, "soft"), key(W("s4", 22), P.dealTrain, "soft"), key(end(3), orbit([X.deal + 2.4, 0.5, 0.5], 6.5, 26, 10), "soft")] },
    objects: [...base, { id: "sister", type: "irmã (Person feminina, vestido; não está em mistério)", visible: true }, { id: "coins", type: "moedas douradas", visible: true }, { id: "train", type: "trem para Paris no trilho da maquete", visible: true }],
    animations: [
      ...herWalk(0, W("s4", 4), X.warsaw - 0.4, X.deal - 0.6),
      lin("wallet.empty", W("s4", 9), W("s4", 11) + 8, 0, 1, "out"), // bolso vazio: "?" de dinheiro
      lin("sister.show", W("s4", 15), W("s4", 18), 0, 1, "out"),
      lin("coins.flow", W("s4", 19), W("s4", 26) + 8, 0, 1, "linear"), // moedas saem dela e vão para a irmã
      lin("train.x", W("s4", 22), W("s4", 26) + 10, X.deal + 0.6, X.deal + 3.4, "inOut", "u3d"), // a irmã parte de trem
      lin("arrowBack.show", W("s4", 27), c(3, W("s4", 31) + 6), 0, 1, "out"), // seta de volta: "depois, a sua vez"
      ...mascot.walk(0, W("s4", 4), [X.warsaw + 2.1, 0, 0.75], [X.deal + 0.4, 0, 0.8]),
    ],
    badges: [
      { text: "SEM DINHEIRO", variant: "negative", appearAt: W("s4", 9), disappearAt: W("s4", 13) - 2 },
      { text: "O TRATO DAS IRMÃS", variant: "positive", subtitle: "uma paga o estudo da outra", appearAt: W("s4", 13), disappearAt: end(3) - 2 },
    ],
    highlights: ["PARIS", "DINHEIRO", "TRATO", "IRMÃ", "GOVERNANTA", "VEZ"],
    captions: [cap("s4", 3, "Para estudar de verdade, precisava ir para Paris, mas não tinha dinheiro. Então fez um trato com a irmã: trabalhou como governanta para pagar a faculdade dela. Depois, seria a sua vez.")],
    audioCues: [narration("s4"), sfx("whoosh-soft", 0, 0.2), sfx("buzz", W("s4", 9), 0.18), sfx("ding", W("s4", 19), 0.2), sfx("rush", W("s4", 22), 0.16)],
  },
  // 5 — PARIS, 1891: o sótão gelado
  {
    id: "scene-05-paris",
    startFrame: sc(4).from,
    durationInFrames: sc(4).durationInFrames,
    voKey: "s5",
    narration: "Em 1891, aos 24 anos, chegou a Paris. Num quartinho gelado, estudou até se formar em física e, depois, em matemática.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([X.deal + 2.4, 0.5, 0.5], 6.5, 26, 10)), key(W("s5", 5), P.paris, "soft"), key(end(4), P.parisDesk, "soft")] },
    objects: [...base, { id: "attic", type: "sótão em corte (telhado inclinado, cama, escrivaninha, vela, flocos de frio na janela)", visible: true }, { id: "diplomas", type: "2 diplomas enrolados: FÍSICA, MATEMÁTICA", visible: true }],
    animations: [
      lin("train.x", 0, W("s5", 5), undefined, X.paris - 1.2, "inOut", "u3d"), // ela chega no mesmo trem
      ...herWalk(W("s5", 5), W("s5", 8), X.paris - 1.0, X.paris + 0.25),
      lin("year.1891", W("s5", 0), W("s5", 1) + 8, 0, 1, "out"),
      lin("attic.frost", W("s5", 9), W("s5", 10) + 10, 0, 1, "out"),
      lin("candle.burn", W("s5", 11), c(4, W("s5", 20) + 10), 0, 1, "linear"),
      pop("diploma.physics", W("s5", 16)),
      pop("diploma.math", c(4, W("s5", 20), 32)),
      ...mascot.place([X.paris + 1.1, 0, 0.75], -0.5, 1, 0),
      ...mascot.wave(W("s5", 5), s(1.2)),
    ],
    badges: [
      { text: "PARIS, 1891", variant: "info", subtitle: "24 anos", appearAt: W("s5", 1), disappearAt: W("s5", 11) - 2 },
      { text: "FÍSICA + MATEMÁTICA", variant: "positive", subtitle: "dois diplomas", appearAt: W("s5", 16), disappearAt: end(4) - 2 },
    ],
    highlights: ["1891", "PARIS", "GELADO", "FÍSICA", "MATEMÁTICA"],
    captions: [cap("s5", 4, "Em 1891, aos 24 anos, chegou a Paris. Num quartinho gelado, estudou até se formar em física e, depois, em matemática.")],
    audioCues: [narration("s5"), sfx("whoosh-soft", 0, 0.2), sfx("pop-high", W("s5", 16), 0.22), sfx("pop-high", c(4, W("s5", 20), 32), 0.22)],
  },
  // 6 — 1896: os raios invisíveis do urânio
  {
    id: "scene-06-raios-uranio",
    startFrame: sc(5).from,
    durationInFrames: sc(5).durationInFrames,
    voKey: "s6",
    narration: "Em 1896, descobriram que o urânio solta raios invisíveis. Ninguém sabia de onde vinham, e ela escolheu esse mistério para o doutorado.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.parisDesk), key(W("s6", 4), P.lab, "soft"), key(end(5), P.labSamples, "soft")] },
    objects: [...base, { id: "bench", type: "bancada de laboratório", visible: true }, { id: "uranium", type: "pedra de urânio amarelo-esverdeada + chapa fotográfica", visible: true }],
    animations: [
      ...herWalk(0, W("s6", 4), X.paris + 0.25, X.lab - 1.3),
      lin("year.1896", W("s6", 0), W("s6", 1) + 8, 0, 1, "out"),
      lin("uranium.rays", W("s6", 5), W("s6", 8) + 8, 0, 1, "out"), // raios "invisíveis": riscos translúcidos tracejados
      lin("plate.fog", W("s6", 6), W("s6", 8) + 12, 0, 1, "out"), // a chapa fotográfica mancha (prova dos raios)
      pop("question.uranium", W("s6", 9)),
      lin("her.look", W("s6", 15), W("s6", 15) + 10, 0, 1),
      ...mascot.walk(0, W("s6", 4), [X.paris + 1.1, 0, 0.75], [X.lab + 1.3, 0, 0.85]),
    ],
    badges: [
      { text: "RAIOS INVISÍVEIS", variant: "info", subtitle: "o urânio emite algo", appearAt: W("s6", 5), disappearAt: W("s6", 9) - 2 },
      { text: "DE ONDE VÊM?", variant: "warning", icon: "?", appearAt: W("s6", 9), disappearAt: end(5) - 2 },
    ],
    highlights: ["1896", "URÂNIO", "RAIOS", "INVISÍVEIS", "MISTÉRIO", "DOUTORADO"],
    captions: [cap("s6", 5, "Em 1896, descobriram que o urânio solta raios invisíveis. Ninguém sabia de onde vinham, e ela escolheu esse mistério para o doutorado.")],
    audioCues: [narration("s6"), sfx("whoosh-soft", 0, 0.2), sfx("shimmer", W("s6", 5), 0.2), sfx("pop-high", W("s6", 9), 0.22)],
  },
  // 7 — A MEDIÇÃO: os raios vêm de dentro do átomo
  {
    id: "scene-07-dentro-do-atomo",
    startFrame: sc(6).from,
    durationInFrames: sc(6).durationInFrames,
    voKey: "s7",
    narration: "Com um aparelho supersensível, criado pelo físico com quem se casou e pelo irmão dele, ela mediu os raios. Quanto mais urânio, mais radiação, não importa a mistura. Se fosse química, a mistura mudaria isso. Não mudava: os raios vinham de dentro do átomo.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.labSamples), key(W("s7", 2), P.labMeter, "soft"), key(W("s7", 19), P.labSamples, "soft"), key(W("s7", 37), P.atom, "soft"), key(end(6), orbit([X.lab, 1.7, 0.4], 3.8, -8, 6), "soft")] },
    objects: [...base, { id: "husband", type: "o físico (Person masculino, sem nome)", visible: true }, { id: "electrometer", type: "eletrômetro (caixa de vidro, ponteiro, escala)", visible: true }, { id: "samples", type: "3 amostras: 1, 2 e 3 doses de urânio em misturas diferentes (pó, cristal, líquido)", visible: true }, { id: "atom", type: "átomo esquemático (núcleo + elétrons) soltando partículas", visible: true }],
    animations: [
      lin("husband.show", W("s7", 4), W("s7", 10), 0, 1, "out"),
      lin("meter.needle", W("s7", 15), W("s7", 18) + 6, 0, 0.3, "out"),
      lin("samples.show", W("s7", 19), W("s7", 21), 0, 1, "out"),
      lin("samples.bars", W("s7", 21), W("s7", 23) + 8, 0, 1, "out"), // barras 1 → 2 → 3 (proporcional ao urânio)
      lin("samples.mixSwap", W("s7", 24), W("s7", 27) + 8, 0, 1, "inOut"), // troca as misturas: barras não mudam
      lin("chem.cross", W("s7", 28), W("s7", 36) + 6, 0, 1, "out"), // hipótese "química" riscada
      lin("atom.zoom", W("s7", 37), c(6, W("s7", 43) + 6), 0, 1, "inOut"),
      lin("atom.emit", W("s7", 39), end(6), 0, 1, "linear"),
      ...mascot.point(W("s7", 15), s(1.6), -0.9),
    ],
    badges: [
      { text: "MAIS URÂNIO = MAIS RADIAÇÃO", variant: "positive", subtitle: "não importa a mistura", appearAt: W("s7", 19), disappearAt: W("s7", 28) - 2 },
      { text: "NÃO É QUÍMICA", variant: "negative", subtitle: "a mistura não muda nada", appearAt: W("s7", 28), disappearAt: W("s7", 37) - 2 },
      { text: "VEM DE DENTRO DO ÁTOMO", variant: "positive", appearAt: W("s7", 37), disappearAt: end(6) - 2 },
    ],
    highlights: ["SUPERSENSÍVEL", "URÂNIO", "RADIAÇÃO", "MISTURA", "QUÍMICA", "ÁTOMO"],
    captions: [cap("s7", 6, "Com um aparelho supersensível, criado pelo físico com quem se casou e pelo irmão dele, ela mediu os raios. Quanto mais urânio, mais radiação, não importa a mistura. Se fosse química, a mistura mudaria isso. Não mudava: os raios vinham de dentro do átomo.")],
    audioCues: [narration("s7"), sfx("tick", W("s7", 15), 0.2), sfx("tick", W("s7", 21), 0.2), sfx("buzz", W("s7", 28), 0.18), sfx("glow", W("s7", 37), 0.26)],
  },
  // 8 — RADIOATIVIDADE + a pechblenda "radioativa demais"
  {
    id: "scene-08-pechblenda",
    startFrame: sc(7).from,
    durationInFrames: sc(7).durationInFrames,
    voKey: "s8",
    narration: "Ela batizou isso de radioatividade. Mas um minério, a pechblenda, soltava radiação demais para o urânio que tinha.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([X.lab, 1.7, 0.4], 3.8, -8, 6)), key(W("s8", 5), P.labOre, "soft"), key(end(7), orbit([X.lab - 0.6, 0.6, 0.6], 4.2, -4, 14), "soft")] },
    objects: [...base, O.timeline, { id: "pitchblende", type: "pedra preta de pechblenda", visible: true }, { id: "electrometer", type: "eletrômetro", visible: true }],
    animations: [
      lin("atom.zoom", 0, 12, undefined, 0, "inOut"),
      pop("word.radioactivity", W("s8", 1)),
      lin("ore.show", W("s8", 6), W("s8", 9), 0, 1, "out"),
      lin("meter.expected", W("s8", 10), W("s8", 12), 0, 1, "out"), // marca tracejada: o que o urânio explicaria
      lin("meter.needle", W("s8", 10), c(7, W("s8", 13) + 8), undefined, 1, "out"), // ponteiro passa muito da marca
      ...fx.shake(c(7, W("s8", 12))),
      ...mascot.jump(c(7, W("s8", 12), 16)),
    ],
    badges: [
      { text: "RADIOATIVIDADE", variant: "info", subtitle: "nome criado por ela", appearAt: W("s8", 1), disappearAt: W("s8", 5) - 2 },
      { text: "RADIAÇÃO DEMAIS!", variant: "warning", subtitle: "mais do que o urânio explica", appearAt: W("s8", 10), disappearAt: end(7) - 2 },
    ],
    highlights: ["RADIOATIVIDADE", "MINÉRIO", "PECHBLENDA", "DEMAIS", "URÂNIO"],
    captions: [cap("s8", 7, "Ela batizou isso de radioatividade. Mas um minério, a pechblenda, soltava radiação demais para o urânio que tinha.")],
    audioCues: [narration("s8"), sfx("badge", W("s8", 1), 0.26), sfx("rumble-soft", W("s8", 10), 0.2)],
  },
  // 9 — 1898: dois elementos novos (polônio e rádio)
  {
    id: "scene-09-polonio-radio",
    startFrame: sc(8).from,
    durationInFrames: sc(8).durationInFrames,
    voKey: "s9",
    narration: "Só podia ter algo desconhecido ali. Em 1898, ela e o marido anunciaram dois elementos novos: o polônio, com o nome do país dela, e o rádio.",
    camera: { projection: "perspective", movement: "vertical", keys: [key(0, orbit([X.lab - 0.6, 0.6, 0.6], 4.2, -4, 14)), key(W("s9", 6), P.elements, "soft"), key(end(8), orbit([X.lab, 1.4, 0.4], 4.6, 10, 6), "soft")] },
    objects: [...base, { id: "elementCards", type: "2 cartões de tabela periódica que saem da pedra: Po (84) e Ra (88)", visible: true }, { id: "flag", type: "bandeira da Polônia pequena ao lado do Po", visible: true }],
    animations: [
      lin("ore.crack", W("s9", 0), W("s9", 5) + 8, 0, 1, "out"), // a pedra abre em corte, dois brilhos dentro
      lin("year.1898", W("s9", 6), W("s9", 7) + 8, 0, 1, "out"),
      pop("card.po", W("s9", 17)),
      pop("flag.pl", W("s9", 20)),
      pop("card.ra", c(8, W("s9", 26), 42)),
      ...fx.burst("elements", c(8, W("s9", 26), 42), 40),
      ...mascot.cheer(c(8, W("s9", 26), 42), s(1.2)),
    ],
    badges: [
      { text: "2 ELEMENTOS NOVOS", variant: "positive", subtitle: "1898", appearAt: W("s9", 13), disappearAt: end(8) - 2 },
    ],
    highlights: ["DESCONHECIDO", "1898", "ELEMENTOS", "POLÔNIO", "PAÍS", "RÁDIO"],
    captions: [cap("s9", 8, "Só podia ter algo desconhecido ali. Em 1898, ela e o marido anunciaram dois elementos novos: o polônio, com o nome do país dela, e o rádio.")],
    audioCues: [narration("s9"), sfx("crumble", W("s9", 0), 0.2), sfx("ding", W("s9", 17), 0.22), sfx("final", c(8, W("s9", 26), 42), 0.24)],
  },
  // 10 — A PROVA: o galpão, as toneladas e o décimo de grama
  {
    id: "scene-10-galpao",
    startFrame: sc(9).from,
    durationInFrames: sc(9).durationInFrames,
    voKey: "s10",
    narration: "Só que os químicos queriam ver para crer. Num galpão com goteiras, ela processou toneladas de minério por quase quatro anos, até separar um décimo de grama de sal de rádio. Pesou, mediu, e ninguém mais duvidou.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, orbit([X.lab, 1.4, 0.4], 4.6, 10, 6)), key(W("s10", 8), P.shed, "soft"), key(W("s10", 22), P.shedVial, "soft"), key(end(9), orbit([X.shed + 0.6, 0.6, 0.6], 3.6, -6, 10), "soft")] },
    objects: [...base, { id: "shed", type: "galpão de madeira com goteiras", visible: true }, { id: "orePile", type: "monte de minério (encolhe)", visible: true }, { id: "cauldron", type: "caldeirão com vapor e pá", visible: true }, { id: "vial", type: "frasquinho com brilho azulado fraco", visible: true }, { id: "scale", type: "balança de pratos", visible: true }],
    animations: [
      lin("doubt.show", W("s10", 2), W("s10", 7) + 6, 0, 1, "out"), // balões "?" sobre químicos (silhuetas na borda)
      ...herWalk(W("s10", 8), W("s10", 12), X.lab - 1.3, X.shed - 0.4),
      lin("shed.drips", W("s10", 9), end(9), 0, 1, "linear"),
      lin("ore.pile", W("s10", 13), W("s10", 21), 1, 0.08, "inOut"), // toneladas viram quase nada
      lin("years.counter", W("s10", 17), W("s10", 20) + 8, 0, 4, "linear"), // contador "ANO 1 … 4" (2D)
      pop("vial.glow", W("s10", 22)),
      lin("scale.weigh", W("s10", 31), W("s10", 33) + 8, 0, 1, "inOut"),
      lin("doubt.show", W("s10", 33), c(9, W("s10", 36) + 6), undefined, 0, "in"),
      ...mascot.walk(W("s10", 8), W("s10", 12), [X.lab + 1.3, 0, 0.85], [X.shed + 1.2, 0, 0.85]),
    ],
    badges: [
      { text: "VER PARA CRER", variant: "warning", icon: "?", appearAt: W("s10", 2), disappearAt: W("s10", 13) - 2 },
      { text: "TONELADAS → 0,1 GRAMA", variant: "info", subtitle: "quase 4 anos de trabalho", appearAt: W("s10", 13), disappearAt: W("s10", 31) - 2 },
      { text: "PROVA: ISOLOU E PESOU", variant: "positive", subtitle: "o rádio existe", appearAt: W("s10", 31), disappearAt: end(9) - 2 },
    ],
    highlights: ["QUÍMICOS", "CRER", "GALPÃO", "TONELADAS", "DÉCIMO", "RÁDIO", "DUVIDOU"],
    captions: [cap("s10", 9, "Só que os químicos queriam ver para crer. Num galpão com goteiras, ela processou toneladas de minério por quase quatro anos, até separar um décimo de grama de sal de rádio. Pesou, mediu, e ninguém mais duvidou.")],
    audioCues: [narration("s10"), sfx("rain", W("s10", 9), 0.12), sfx("dig", W("s10", 13), 0.18), sfx("shimmer", W("s10", 22), 0.24), sfx("ding", W("s10", 33), 0.22)],
  },
  // 11 — 1903: o primeiro Nobel (e quase ficou de fora)
  {
    id: "scene-11-nobel-1903",
    startFrame: sc(10).from,
    durationInFrames: sc(10).durationInFrames,
    voKey: "s11",
    narration: "Em 1903, ganhou o Nobel de Física, com o marido e o descobridor dos raios do urânio. Quase ficou de fora da indicação, mas o marido insistiu. Foi a primeira mulher a ganhar um Nobel.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([X.shed + 0.6, 0.6, 0.6], 3.6, -6, 10)), key(W("s11", 2), P.stage, "soft"), key(c(10, W("s11", 27), 44), P.stageMedal, "soft"), key(end(10), orbit([X.stage - 0.4, 0.95, 0.5], 3.3, -6, 8), "soft")] },
    objects: [...base, { id: "stage", type: "palco/pódio com 3 lugares", visible: true }, { id: "medal1903", type: "medalha dourada FÍSICA 1903", visible: true }, { id: "nominationCard", type: "cartão de indicação 2D com 2 nomes riscáveis (nomes como borrões, sem texto legível)", visible: true }],
    animations: [
      ...herWalk(0, W("s11", 2), X.shed - 0.4, X.stage - 0.4),
      lin("husband.x", 0, W("s11", 2), X.lab + 0.6, X.stage + 0.3, "inOut", "u3d"),
      lin("year.1903", W("s11", 0), W("s11", 1) + 8, 0, 1, "out"),
      pop("medal.1903", W("s11", 4)),
      lin("nomination.show", W("s11", 17), W("s11", 19), 0, 1, "out"), // 2 linhas na indicação; a 3ª (dela) falta
      lin("nomination.add", W("s11", 24), W("s11", 26) + 8, 0, 1, "out"), // o marido "escreve" a 3ª linha
      lin("nomination.show", c(10, W("s11", 27), 44) - 2, c(10, W("s11", 27), 44) + 6, undefined, 0, "in"),
      lin("her.spot", c(10, W("s11", 27), 44), c(10, W("s11", 30), 44) + 8, undefined, 1, "out"),
      ...fx.flash(c(10, W("s11", 29), 44)),
      ...mascot.cheer(c(10, W("s11", 29), 44), s(1.6)),
    ],
    badges: [
      { text: "NOBEL DE FÍSICA, 1903", variant: "positive", subtitle: "dividido em três", appearAt: W("s11", 2), disappearAt: W("s11", 17) - 2 },
      { text: "QUASE FICOU DE FORA", variant: "negative", appearAt: W("s11", 17), disappearAt: c(10, W("s11", 27), 44) - 2 },
      { text: "1ª MULHER COM UM NOBEL", variant: "positive", size: "large", appearAt: c(10, W("s11", 27), 44), disappearAt: end(10) - 2 },
    ],
    highlights: ["1903", "NOBEL", "FÍSICA", "FORA", "INSISTIU", "PRIMEIRA", "MULHER"],
    captions: [cap("s11", 10, "Em 1903, ganhou o Nobel de Física, com o marido e o descobridor dos raios do urânio. Quase ficou de fora da indicação, mas o marido insistiu. Foi a primeira mulher a ganhar um Nobel.")],
    audioCues: [narration("s11"), sfx("whoosh-soft", 0, 0.2), sfx("ding", W("s11", 4), 0.24), sfx("buzz", W("s11", 17), 0.18), sfx("final", c(10, W("s11", 29), 44), 0.26)],
  },
  // 12 — 1906 e 1911: a perda, a Sorbonne, o segundo Nobel
  {
    id: "scene-12-sorbonne-1911",
    startFrame: sc(11).from,
    durationInFrames: sc(11).durationInFrames,
    voKey: "s12",
    narration: "Em 1906, o marido morreu atropelado. Ela assumiu as aulas dele e virou a primeira mulher professora da Sorbonne. Em 1911, ganhou sozinha o Nobel de Química.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.stage), key(W("s12", 6), P.sorbonne, "soft"), key(W("s12", 19), P.stageMedal, "soft"), key(end(11), P.stage, "soft")] },
    objects: [...base, { id: "lectern", type: "púlpito da Sorbonne + quadro-negro", visible: true }, { id: "medal1911", type: "medalha QUÍMICA 1911 (só ela no pódio)", visible: true }],
    animations: [
      lin("year.1906", W("s12", 0), W("s12", 1) + 8, 0, 1, "out"),
      lin("husband.fade", W("s12", 3), W("s12", 5) + 10, 0, 1, "inOut"), // o físico vira silhueta e some com luz suave (sem cena de acidente)
      lin("stage.dim", W("s12", 3), W("s12", 6), 0, 0.5, "inOut"),
      ...herWalk(W("s12", 6), W("s12", 9), X.stage - 0.4, X.stage + 0.9),
      lin("stage.dim", W("s12", 7), W("s12", 9) + 6, undefined, 0, "inOut"),
      lin("chalk.write", W("s12", 9), W("s12", 18), 0, 1, "linear"), // fórmulas no quadro
      lin("year.1911", W("s12", 19), W("s12", 20) + 8, 0, 1, "out"),
      ...herWalk(W("s12", 19), W("s12", 21), X.stage + 0.9, X.stage - 0.4),
      pop("medal.1911", c(11, W("s12", 24), 32)),
    ],
    badges: [
      { text: "1ª PROFESSORA DA SORBONNE", variant: "positive", appearAt: W("s12", 12), disappearAt: W("s12", 19) - 2 },
      { text: "NOBEL DE QUÍMICA, 1911", variant: "positive", subtitle: "sozinha", appearAt: W("s12", 21), disappearAt: end(11) - 2 },
    ],
    highlights: ["1906", "AULAS", "PRIMEIRA", "PROFESSORA", "SORBONNE", "1911", "SOZINHA", "QUÍMICA"],
    captions: [cap("s12", 11, "Em 1906, o marido morreu atropelado. Ela assumiu as aulas dele e virou a primeira mulher professora da Sorbonne. Em 1911, ganhou sozinha o Nobel de Química.")],
    audioCues: [narration("s12"), sfx("rumble-soft", W("s12", 3), 0.12), sfx("click", W("s12", 9), 0.18), sfx("ding", W("s12", 24), 0.24)],
  },
  // 13 — Recorde e a guerra: os carros de raio X
  {
    id: "scene-13-recorde-guerra",
    startFrame: sc(12).from,
    durationInFrames: sc(12).durationInFrames,
    voKey: "s13",
    narration: "É a única pessoa com Nobel em duas ciências diferentes. Na Primeira Guerra, ainda criou carros de raio X para achar balas nos soldados feridos.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.stageMedal), key(W("s13", 10), P.war, "soft"), key(W("s13", 19), P.warScreen, "soft"), key(end(12), orbit([X.war + 0.5, 0.6, 0.7], 3.0, -6, 8), "soft")] },
    objects: [...base, { id: "xrayCar", type: "carro com raio X (gerador + tubo)", visible: true }, { id: "soldier", type: "soldado ferido numa maca (Person, uniforme azul-acinzentado)", visible: true }, { id: "xrayScreen", type: "tela 2D com ossos esquemáticos e uma bala destacada", visible: true }],
    animations: [
      lin("medals.pair", 0, W("s13", 6), 0, 1, "out"), // as duas medalhas lado a lado: FÍSICA + QUÍMICA
      ...herWalk(W("s13", 10), W("s13", 14), X.stage - 0.4, X.war - 0.9),
      lin("year.1914", W("s13", 10), W("s13", 12) + 8, 0, 1, "out"),
      lin("car.x", W("s13", 13), W("s13", 16), X.war + 2.2, X.war + 0.3, "out", "u3d"),
      lin("xray.beam", W("s13", 17), W("s13", 19) + 6, 0, 1, "out"),
      pop("xray.screen", W("s13", 19)),
      lin("bullet.mark", W("s13", 21), W("s13", 21) + 12, 0, 1, "out"),
      ...mascot.walk(W("s13", 10), W("s13", 14), [X.shed + 1.2, 0, 0.85], [X.war - 1.6, 0, 0.85]),
    ],
    badges: [
      { text: "NOBEL EM 2 CIÊNCIAS", variant: "positive", subtitle: "única pessoa até hoje", size: "large", appearAt: W("s13", 0), disappearAt: W("s13", 10) - 2 },
      { text: "RAIO X SOBRE RODAS", variant: "info", subtitle: "Primeira Guerra (1914–1918)", appearAt: W("s13", 14), disappearAt: end(12) - 2 },
    ],
    highlights: ["ÚNICA", "NOBEL", "DUAS", "CIÊNCIAS", "GUERRA", "RAIO", "X", "BALAS"],
    captions: [cap("s13", 12, "É a única pessoa com Nobel em duas ciências diferentes. Na Primeira Guerra, ainda criou carros de raio X para achar balas nos soldados feridos.")],
    audioCues: [narration("s13"), sfx("badge", W("s13", 0), 0.26), sfx("rush", W("s13", 13), 0.18), sfx("hydraulic", W("s13", 17), 0.16)],
  },
  // 14 — O preço: a radiação (e o rádio nos cadernos) — fecha o laço do gancho
  {
    id: "scene-14-o-preco",
    startFrame: sc(13).from,
    durationInFrames: sc(13).durationInFrames,
    voKey: "s14",
    narration: "Mas ninguém conhecia o perigo da radiação. Ela manipulou rádio por décadas, quase sem proteção, e morreu em 1934 de uma doença no sangue, provavelmente causada pela radiação. O rádio ficou até nos cadernos dela.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([X.war + 0.5, 0.6, 0.7], 3.0, -6, 8)), key(W("s14", 7), P.vault, "soft"), key(W("s14", 28), P.vaultClose, "soft"), key(end(13), orbit([X.vault, 0.5, 0.4], 3.4, -8, 14), "soft")] },
    objects: [...base, { id: "leadBox", type: "caixa de chumbo + cadernos (já vistos na s1)", visible: true }, { id: "geiger", type: "contador Geiger", visible: true }],
    animations: [
      ...herWalk(0, W("s14", 7), X.war - 0.9, X.vault + 1.1),
      lin("her.glowHands", W("s14", 8), W("s14", 14) + 8, 0, 1, "inOut"), // partículas saindo do frasco que ela segura
      lin("year.1934", W("s14", 17), W("s14", 18) + 8, 0, 1, "out"),
      lin("her.spot", W("s14", 15), W("s14", 23) + 10, undefined, 0.15, "inOut"), // a luz sobre ela diminui (respeitoso)
      lin("notebooks.radiation", W("s14", 28), c(13, W("s14", 34) + 8), undefined, 1, "out"),
      lin("geiger.needle", W("s14", 29), c(13, W("s14", 34) + 10), undefined, 0.9, "out"),
      ...mascot.place([X.vault - 0.9, 0, 0.7], 0.5, 1, W("s14", 7), 10),
    ],
    badges: [
      { text: "PERIGO DESCONHECIDO", variant: "warning", subtitle: "ninguém usava proteção", appearAt: W("s14", 1), disappearAt: W("s14", 17) - 2 },
      { text: "1934", variant: "info", subtitle: "doença no sangue, provável efeito da radiação", appearAt: W("s14", 17), disappearAt: W("s14", 28) - 2 },
      { text: "RÁDIO NOS CADERNOS", variant: "warning", subtitle: "metade some só em ~1.600 anos", appearAt: W("s14", 28), disappearAt: end(13) - 2 },
    ],
    highlights: ["PERIGO", "RADIAÇÃO", "RÁDIO", "DÉCADAS", "PROTEÇÃO", "1934", "CADERNOS"],
    captions: [cap("s14", 13, "Mas ninguém conhecia o perigo da radiação. Ela manipulou rádio por décadas, quase sem proteção, e morreu em 1934 de uma doença no sangue, provavelmente causada pela radiação. O rádio ficou até nos cadernos dela.")],
    audioCues: [narration("s14"), sfx("whoosh-soft", 0, 0.18), sfx("deep-amb", W("s14", 15), 0.14), sfx("geiger", W("s14", 28), 0.22)],
  },
  // 15 — A REVELAÇÃO DO NOME
  {
    id: "scene-15-revelacao",
    startFrame: sc(14).from,
    durationInFrames: sc(14).durationInFrames,
    voKey: "s15",
    narration: "Ela nasceu Maria Skłodowska. Mas o mundo a conhece como Marie Curie.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit([X.vault, 0.5, 0.4], 3.4, -8, 14)), key(W("s15", 4), orbit([X.vault + 1.0, 0.45, 0.5], 2.6, 6, 6), "soft"), key(end(14), orbit([X.vault + 1.0, 0.45, 0.5], 2.3, -4, 5), "soft")] },
    objects: [...base, { ...O.her, state: { start: "silhueta com '?'", end: "revelada (luz, cores, cabelo preso, vestido escuro)" } }, { id: "nameplate", type: "placa 2D: MARIA SKŁODOWSKA → MARIE CURIE (1867–1934)", visible: true }],
    animations: [
      lin("her.spot", 0, W("s15", 0), undefined, 0, "in"), // escuro total por um instante (pausa dramática)
      pop("name.birth", W("s15", 2)),
      lin("her.mystery", W("s15", 8), W("s15", 10), undefined, 0, "in"), // o "?" se desfaz
      lin("her.reveal", W("s15", 9), W("s15", 11) + 6, 0, 1, "out"),
      lin("name.birth", W("s15", 9), W("s15", 10), undefined, 0, "in"),
      pop("name.known", W("s15", 10)),
      ...fx.flash(W("s15", 10)),
      ...fx.punch(W("s15", 10)),
      ...fx.burst("reveal", W("s15", 10), 50),
      ...mascot.cheer(W("s15", 10), s(1.8)),
    ],
    badges: [{ text: "MARIE CURIE", variant: "positive", size: "large", subtitle: "1867–1934", appearAt: W("s15", 10), disappearAt: end(14) - 2 }],
    highlights: ["MARIA", "SKŁODOWSKA", "MARIE", "CURIE"],
    captions: [cap("s15", 14, "Ela nasceu Maria Skłodowska. Mas o mundo a conhece como Marie Curie.")],
    audioCues: [narration("s15"), sfx("whoosh-big", 0, 0.2), sfx("final", W("s15", 10), 0.3)],
  },
  // 16 — PRONTO (+ encerramento fixo da marca nos últimos ~4,7 s)
  {
    id: "scene-16-final",
    startFrame: sc(15).from,
    durationInFrames: sc(15).durationInFrames,
    voKey: "s16",
    narration: "Pronto: agora você sabe quem é a mulher dos cadernos radioativos.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, orbit([X.vault + 1.0, 0.45, 0.5], 2.3, -4, 5)), key(s(1.4), P.vault, "soft"), key(end(15), P.all, "soft")] },
    objects: [...base, { id: "yearPlates", type: "placas de ano acesas ao longo de toda a linha do tempo", visible: true }],
    animations: [
      lin("timeline.lightUp", W("s16", 1), W("s16", 10) + 20, 0, 1, "linear"), // as 8 estações acendem da esquerda para a direita
      ...mascot.wave(W("s16", 0), s(1.6)),
    ],
    badges: [{ text: "2 NOBEIS · 2 ELEMENTOS", variant: "info", subtitle: "e a palavra “radioatividade”", appearAt: W("s16", 1), disappearAt: W("s16", 10) + 30 }],
    highlights: ["PRONTO", "SABE", "MULHER", "CADERNOS", "RADIOATIVOS"],
    captions: [cap("s16", 15, "Pronto: agora você sabe quem é a mulher dos cadernos radioativos.")],
    audioCues: [narration("s16"), sfx("shimmer", W("s16", 1), 0.2)],
  },
];

/** Valor de uma trilha de animação (ex.: "her.reveal") no frame global. */
export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);

export const sceneAt = (frame: number) => {
  for (let i = scenes.length - 1; i >= 0; i--) if (frame >= scenes[i].startFrame) return scenes[i];
  return scenes[0];
};
export const isVisible = (id: string, frame: number) => sceneAt(frame).objects.some((o) => o.id === id && o.visible);

// Integridade: contígua, começa em 0, soma DURATION (5100).
scenes.forEach((cur, i) => {
  const prev = scenes[i - 1];
  if (prev && prev.startFrame + prev.durationInFrames !== cur.startFrame) throw new Error(`Buraco/sobreposição entre ${prev.id} e ${cur.id}`);
});
const total = scenes.reduce((acc, cur) => acc + cur.durationInFrames, 0);
if (total !== DURATION || scenes[0].startFrame !== 0) throw new Error(`As cenas somam ${total} frames (esperado ${DURATION})`);
