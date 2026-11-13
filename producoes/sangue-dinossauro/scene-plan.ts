// scene-plan.ts — "Acharam sangue de dinossauro no Brasil. Dá pra clonar?" — Boato ou Verdade? EP. 02
// Roteiro v1 (~1:52) — AGUARDANDO APROVAÇÃO
//
// Contrato de dados da Fase 1. Na Fase 2 vira src/data/scenes.ts (mesmo motor do vídeo do apagão).
// Frames de animações, badges, legendas, câmera e áudio são LOCAIS à cena; startFrame é global.
// W("sN", i) = frame local da palavra i (base 0) da fala sN (estimativa até o TTS). Linha do tempo determinística.
//
// ---- Configuração que vai para src/utils/timing.ts ----
//   export const SECONDS = 112;   // 3360 frames (a voz real decide; provável 1:50–1:53)
//   export const VO_KEYS = ["s1", ..., "s14"] as const;
//   const PLANNED_SECONDS = [8.5, 2.73, 7.1, 6.1, 5.53, 7.3, 9.3, 7.23, 8.97, 5.83, 9.63, 8.2, 6.1, 19.47];
//   const GAPS = [0.55, 0.8, 0.55, 0.55, 0.8, 0.55, 0.55, 0.55, 0.55, 0.8, 0.55, 0.55, 0.8];
//   Cortes planejados: 0, 255, 337, 550, 733, 899, 1118, 1397, 1614, 1883, 2058, 2347, 2593, 2776 (fim 3360)
//   TTS: edge-tts pt-BR-AntonioNeural, rate +4% (cta +0%); ":" → "," só no texto do TTS.
//
// MUNDOS (só o ativo é desenhado — tracks *.show):
//   DIORAMA  [0, 0, 0]      Cretáceo do Araripe. Régua 1 m = 0,5 u3d → Aratassauro 3,1 m = 1,55 u3d; mascote visitante
//                           na borda do pedestal (MS 0,45, menor que o dino). Selo RECONSTRUÇÃO ARTÍSTICA.
//   MAPA     [0, -400, 0]   mapa do Brasil (aprovado no EP. 01) + Ceará em destaque.
//   MINA     [0, -500, 0]   cava de gesso em degraus (ESQUEMA), fóssil emergindo da camada cinza.
//   MUSEU    [0, -600, 0]   fachada neoclássica genérica + chamas.
//   OSSO     [0, -200, 0]   fóssil da perna (u3d, ~3 de altura) que abre em corte; canal ampliado + hemácias + heme (ESQUEMA).
//   DNA      [0, -300, 0]   hélice + ampulheta + âmbar com mosquito.
// NOVOS NO MOTOR: Dino (Aratasaurus, walk/ghost/reveal), Fossil (cut), Canal/RBC/Heme, Mine, Museum, DNAHelix, Amber.

import { evaluateTrack, orbit, type EaseName, type TrackAnimation, type Vec3 } from "../utils/animation";
import { fx } from "../utils/fx";
import { mascot } from "../utils/mascot";
import { DURATION, FPS, HEIGHT, SCENE_FRAMES, voLocal, WIDTH, wordLocal, type VoKey } from "../utils/timing";

export type VideoConfig = { width: number; height: number; fps: number; durationInFrames: number; theme: string; language: string };
export const VIDEO: VideoConfig = { width: WIDTH, height: HEIGHT, fps: FPS, durationInFrames: DURATION, theme: "fenda-umbra-natureza", language: "pt-BR" };

export type BadgeVariant = "positive" | "negative" | "info" | "warning";
export type CameraKey = { at: number; position: Vec3; target: Vec3; easing?: EaseName };
export type CameraPlan = { projection: "perspective"; movement: "dolly-in" | "dolly-out" | "orbit" | "tracking" | "split" | "hold"; keys: CameraKey[] };
export type SceneObject = { id: string; type: string; visible: boolean; state?: { start: string; end: string } };
export type SceneBadge = { text: string; variant: BadgeVariant; appearAt: number; disappearAt?: number; subtitle?: string; icon?: "?"; size?: "normal" | "large" };
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
const narration = (k: VoKey): AudioCue => ({ kind: "narration", src: `audio/vo/${k}.wav`, at: voLocal(k), volume: 1, status: "planned" });
const sfx = (name: string, at: number, volume: number): AudioCue => ({ kind: "sfx", src: `audio/sfx/${name}.wav`, at, volume, status: "planned" });
const cap = (k: VoKey, i: number, text: string): CaptionBlock => ({ text, from: voLocal(k), to: end(i) });
const lin = (target: string, a: number, b: number, from: number | undefined, to: number, easing: EaseName = "inOut", unit: TrackAnimation["unit"] = "0-1"): TrackAnimation => ({ type: "interpolate", target, startFrame: a, endFrame: b, from, to, easing, unit });
const set = (target: string, at: number, v: number): TrackAnimation => lin(target, at, at + 1, v, v, "linear");
const pop = (target: string, at: number): TrackAnimation => ({ type: "spring", target, startFrame: at, endFrame: at + 30, from: 0, to: 1, damping: 12, unit: "0-1" });
const WORLDS = ["diorama", "map", "mine", "museum", "bone", "dna"] as const;
const world = (at: number, w: (typeof WORLDS)[number]): TrackAnimation[] => WORLDS.map((k) => set(`${k}.show`, at, k === w ? 1 : 0));

export const DIORAMA: Vec3 = [0, 0, 0];
export const BONE: Vec3 = [0, -200, 0];
export const DNA: Vec3 = [0, -300, 0];
export const MAP: Vec3 = [0, -400, 0];
export const MINE: Vec3 = [0, -500, 0];
export const MUSEUM: Vec3 = [0, -600, 0];
const add = (a: Vec3, b: Vec3): Vec3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];

// distâncias já na escala 9:16 (largura visível ≈ 0,237·d)
const P = {
  boneClose: orbit(add(BONE, [0, 0.4, 0]), 9, 25, 15),
  mapCeara: orbit(add(MAP, [3.1, 0, -2.2]), 16, 15, 48),
  dino: orbit(add(DIORAMA, [0, 0.6, 0]), 14, 20, 10),
  dinoA: orbit(add(DIORAMA, [-1.6, 0.6, 0]), 13, 15, 10),
  dinoB: orbit(add(DIORAMA, [1.6, 0.6, 0]), 13, 35, 12),
  museum: orbit(add(MUSEUM, [0, 1.2, 0]), 22, 12, 8),
  museum2: orbit(add(MUSEUM, [0, 1.4, 0]), 26, 18, 10),
  mine: orbit(add(MINE, [0, 0, 0]), 18, 30, 40),
  mine2: orbit(add(MINE, [0.3, -0.4, 0.4]), 11, 36, 34),
  boneCut: orbit(add(BONE, [0, 0.2, 0]), 7, 30, 20),
  canal: orbit(add(BONE, [0.3, 0.25, 0.1]), 2.5, 30, 25),
  micro: orbit(add(BONE, [0.3, 0.25, 0.1]), 0.6, 20, 15),
  heme: orbit(add(BONE, [3, 0.5, 0]), 3.2, 10, 8),
  split: orbit(add(BONE, [6, 0.5, 0]), 6.5, 0, 6),
  verdict: orbit(add(BONE, [0, 0.4, 0]), 10, 40, 15),
  dna: orbit(add(DNA, [0, 1, 0]), 12, 10, 6),
  dna2: orbit(add(DNA, [0, 1, 0]), 14, 30, 8),
  amber: orbit(add(DNA, [4, 1, 0]), 5, 10, 8),
  final0: orbit(add(DIORAMA, [0, 0.6, 0]), 14, 0, 10),
  final1: orbit(add(DIORAMA, [0, 0.6, 0]), 16, 40, 14),
};
const M_DIO: Vec3 = add(DIORAMA, [2.6, 0, 1.6]); // borda do pedestal

export const scenes: ScenePlan[] = [
  {
    id: "s1", ...sc(0), voKey: "s1",
    narration: "Acharam sangue de dinossauro aqui no Brasil, num osso de cento e quinze milhões de anos. Então dá pra clonar um dinossauro?",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.boneClose), key(W("s1", 5) - 1, P.boneClose), key(W("s1", 5), P.mapCeara), key(W("s1", 16) - 1, P.mapCeara), key(W("s1", 16), P.dino), key(end(0), P.dinoA, "linear")] },
    objects: [{ id: "fossil", type: "FossilLeg", visible: true }, { id: "map", type: "BrazilMap(Ceará)", visible: true }, { id: "dino", type: "Aratasaurus(reveal)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [...fx.flash(0), ...world(0, "bone"), pop("bone.glow", W("s1", 1)), ...fx.whipOut(W("s1", 5)), ...world(W("s1", 5), "map"), pop("brazil.ce", W("s1", 6)), ...world(W("s1", 16), "diorama"), lin("dino.reveal", W("s1", 19), W("s1", 19) + 18, 0, 1, "out"), ...fx.punch(W("s1", 20)), ...mascot.place(M_DIO, -0.8, 0.45, W("s1", 16)), ...mascot.jump(W("s1", 19))],
    badges: [
      { text: "SANGUE DE DINOSSAURO?", variant: "warning", icon: "?", appearAt: W("s1", 1), disappearAt: W("s1", 10) },
      { text: "115 MILHÕES DE ANOS", variant: "info", appearAt: W("s1", 10), disappearAt: W("s1", 17) },
      { text: "DÁ PRA CLONAR?", variant: "warning", icon: "?", size: "large", appearAt: W("s1", 17) },
    ],
    highlights: ["SANGUE", "DINOSSAURO", "BRASIL", "QUINZE", "MILHÕES", "CLONAR"],
    captions: [cap("s1", 0, "Acharam sangue de dinossauro aqui no Brasil, num osso de cento e quinze milhões de anos. Então dá pra clonar um dinossauro?")],
    audioCues: [narration("s1"), sfx("fenda-open", 0, 0.7), sfx("drip", W("s1", 1), 0.4), sfx("whoosh", W("s1", 5), 0.4), sfx("dino-call", W("s1", 19), 0.45)],
  },
  {
    id: "s2", ...sc(1), voKey: "s2",
    narration: "Este é o Boato ou Verdade.",
    camera: { projection: "perspective", movement: "hold", keys: [key(0, P.dinoA), key(end(1), P.dino, "linear")] },
    objects: [{ id: "seriesCard", type: "SeriesCard(EP. 02)", visible: true }, { id: "verdict", type: "VerdictMeter2D", visible: true }],
    animations: [lin("series.card", 0, 10, 0, 1, "out"), lin("verdict.show", W("s2", 2), W("s2", 2) + 10, 0, 1, "out"), lin("verdict.wobble", W("s2", 3), W("s2", 3) + 8, 0, 1), lin("series.card", end(1) - 8, end(1), 1, 0, "in"), lin("verdict.show", end(1) - 8, end(1), 1, 0, "in"), ...fx.whipOut(end(1))],
    badges: [],
    highlights: ["BOATO", "VERDADE"],
    captions: [cap("s2", 1, "Este é o Boato ou Verdade.")],
    audioCues: [narration("s2"), sfx("badge", 0, 0.5), sfx("whoosh-soft", end(1) - 8, 0.4)],
  },
  {
    id: "s3", ...sc(2), voKey: "s3",
    narration: "O dono do osso é o Aratassauro: um jovem caçador de uns três metros, que viveu onde hoje fica o Ceará.",
    camera: { projection: "perspective", movement: "tracking", keys: [key(0, P.dinoA), key(end(2), P.dinoB, "linear")] },
    objects: [{ id: "diorama", type: "CretaceousLagoon", visible: true }, { id: "dino", type: "Aratasaurus(walk)", visible: true }, { id: "ruler", type: "Ruler2D(3 m + pessoa 1,7 m)", visible: true }, { id: "seal", type: "Seal(RECONSTRUÇÃO ARTÍSTICA)", visible: true }],
    animations: [...fx.whipIn(), set("dino.reveal", 0, 1), lin("dino.x", 0, end(2), -3, 3, "linear", "u3d"), lin("dino.walk", 0, 6, 0, 1), pop("ruler.show", W("s3", 12)), ...mascot.jump(W("s3", 9)), ...mascot.walk(W("s3", 9), W("s3", 9) + 20, M_DIO, add(M_DIO, [0.4, 0, 0.3]))],
    badges: [
      { text: "ARATASSAURO", subtitle: "Aratasaurus museunacionali", variant: "info", appearAt: W("s3", 6), disappearAt: W("s3", 12) },
      { text: "~3 METROS · JOVEM CAÇADOR", variant: "info", appearAt: W("s3", 12) },
    ],
    highlights: ["ARATASSAURO", "CAÇADOR", "TRÊS", "METROS", "CEARÁ"],
    captions: [cap("s3", 2, "O dono do osso é o Aratassauro: um jovem caçador de uns três metros, que viveu onde hoje fica o Ceará.")],
    audioCues: [narration("s3"), sfx("whoosh", 0, 0.4), sfx("dino-step", 6, 0.4)],
  },
  {
    id: "s4", ...sc(3), voKey: "s4",
    narration: "O nome quer dizer nascido do fogo, uma homenagem ao Museu Nacional, que pegou fogo em 2018.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.dinoB), key(W("s4", 8) - 1, P.dinoB), key(W("s4", 8), P.museum), key(end(3), P.museum2, "linear")] },
    objects: [{ id: "name", type: "Overlay(ARA + ATÁ)", visible: true }, { id: "museum", type: "MuseumFacade", visible: true }, { id: "fire", type: "Flames", visible: true }],
    animations: [pop("name.split", W("s4", 4)), ...world(W("s4", 8), "museum"), lin("fire.level", W("s4", 12), W("s4", 16), 0, 1), ...fx.shake(W("s4", 13), 8), lin("bg.warm", W("s4", 12), W("s4", 16), 0, 1)],
    badges: [
      { text: "\"ARA\" + \"ATÁ\" = NASCIDO DO FOGO", subtitle: "em tupi", variant: "info", appearAt: W("s4", 4), disappearAt: W("s4", 10) },
      { text: "MUSEU NACIONAL · INCÊNDIO DE 2018", variant: "warning", appearAt: W("s4", 10) },
    ],
    highlights: ["NASCIDO", "FOGO", "MUSEU", "NACIONAL", "2018"],
    captions: [cap("s4", 3, "O nome quer dizer nascido do fogo, uma homenagem ao Museu Nacional, que pegou fogo em 2018.")],
    audioCues: [narration("s4"), sfx("shimmer", W("s4", 4), 0.3), sfx("fire", W("s4", 12), 0.35)],
  },
  {
    id: "s5", ...sc(4), voKey: "s5",
    narration: "O fóssil é um pedaço da perna, achado numa mina de gesso em Santana do Cariri.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.mine), key(end(4), P.mine2, "inOut")] },
    objects: [{ id: "mine", type: "GypsumMine", visible: true }, { id: "fossil", type: "FossilLeg(emerge)", visible: true }, { id: "pin", type: "Overlay(mini-mapa CE + pino)", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "mine"), set("bg.warm", 0, 0), lin("fossil.rise", W("s5", 4), W("s5", 7), 0, 1), pop("pin.cariri", W("s5", 13))],
    badges: [
      { text: "PEDAÇO DA PERNA", variant: "info", appearAt: W("s5", 4), disappearAt: W("s5", 13) },
      { text: "SANTANA DO CARIRI · CE", variant: "info", appearAt: W("s5", 13) },
    ],
    highlights: ["PERNA", "MINA", "GESSO", "SANTANA", "CARIRI"],
    captions: [cap("s5", 4, "O fóssil é um pedaço da perna, achado numa mina de gesso em Santana do Cariri.")],
    audioCues: [narration("s5"), sfx("whoosh", 0, 0.4), sfx("crumble", W("s5", 4), 0.35), sfx("pop", W("s5", 13), 0.3)],
  },
  {
    id: "s6", ...sc(5), voKey: "s6",
    narration: "Dentro do osso, há canais finíssimos por onde o sangue passava. Foi ali que os cientistas procuraram.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.boneCut), key(W("s6", 11), P.boneCut), key(end(5), P.canal, "inOut")] },
    objects: [{ id: "fossil", type: "FossilLeg(cut)", visible: true }, { id: "canals", type: "VascularCanals(flow)", visible: true }, { id: "microscope", type: "Microscope", visible: true }, { id: "seal", type: "Seal(ESQUEMA)", visible: true }],
    animations: [...world(0, "bone"), lin("bone.cut", 0, W("s6", 3), 0, 1), lin("canals.flow", W("s6", 8), W("s6", 10), 0, 1), lin("canals.flow", W("s6", 11), W("s6", 11) + 10, 1, 0), lin("bg.inside", W("s6", 11), end(5), 0, 1), ...mascot.place(add(BONE, [-1.6, -1.2, 0.8]), 0.6, 0.6, W("s6", 11), 10), ...mascot.point(W("s6", 13), 40)],
    badges: [
      { text: "CANAIS DO SANGUE", variant: "info", appearAt: W("s6", 4), disappearAt: W("s6", 12) },
      { text: "AQUI DENTRO", variant: "info", appearAt: W("s6", 12) },
    ],
    highlights: ["CANAIS", "FINÍSSIMOS", "SANGUE", "CIENTISTAS"],
    captions: [cap("s6", 5, "Dentro do osso, há canais finíssimos por onde o sangue passava. Foi ali que os cientistas procuraram.")],
    audioCues: [narration("s6"), sfx("whoosh-soft", 0, 0.3), sfx("glow", W("s6", 8), 0.3), sfx("microscope", W("s6", 13), 0.4)],
  },
  {
    id: "s7", ...sc(6), voKey: "s7",
    narration: "E acharam bolinhas de mineral do tamanho de glóbulos vermelhos. Nelas, sinais químicos do heme, a parte do sangue que segura o oxigênio.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, P.canal), key(W("s7", 2), P.micro, "in"), key(W("s7", 13), P.micro), key(W("s7", 14), P.heme), key(end(6), P.heme, "linear")] },
    objects: [{ id: "micro", type: "MicroscopeVignette", visible: true }, { id: "rbc", type: "MineralRBC", visible: true }, { id: "heme", type: "HemeMolecule", visible: true }, { id: "o2", type: "O2", visible: true }],
    animations: [set("bg.inside", 0, 1), lin("micro.zoom", 0, W("s7", 2), 0, 1, "in"), pop("rbc.show", W("s7", 2)), pop("heme.show", W("s7", 14)), ...fx.punch(W("s7", 14)), lin("o2.dock", W("s7", 20), W("s7", 22), 0, 1)],
    badges: [
      { text: "\"HEMÁCIAS\" MINERAIS", variant: "info", appearAt: W("s7", 2), disappearAt: W("s7", 14) },
      { text: "HEME: SEGURA O OXIGÊNIO", variant: "info", appearAt: W("s7", 14) },
    ],
    highlights: ["BOLINHAS", "GLÓBULOS", "VERMELHOS", "HEME", "OXIGÊNIO"],
    captions: [cap("s7", 6, "E acharam bolinhas de mineral do tamanho de glóbulos vermelhos. Nelas, sinais químicos do heme, a parte do sangue que segura o oxigênio.")],
    audioCues: [narration("s7"), sfx("microscope", 0, 0.35), sfx("pop", W("s7", 2), 0.3), sfx("ding", W("s7", 14), 0.35), sfx("pop-high", W("s7", 21), 0.3)],
  },
  {
    id: "s8", ...sc(7), voKey: "s8",
    narration: "Só que não é sangue líquido. É uma marca química, uma sombra do sangue que virou pedra junto com o osso.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.heme), key(W("s8", 10), P.canal, "inOut"), key(end(7), P.boneCut, "inOut")] },
    objects: [{ id: "drop", type: "BloodDrop(✖)", visible: true }, { id: "rbc", type: "MineralRBC(→ pedra)", visible: true }, { id: "heme", type: "HemeMolecule(fantasma)", visible: true }],
    animations: [pop("drop.show", W("s8", 2)), lin("drop.break", W("s8", 5), W("s8", 6) + 8, 0, 1), lin("rbc.stone", W("s8", 10), W("s8", 16), 0, 1), lin("heme.ghost", W("s8", 10), W("s8", 12), 0, 1), lin("bg.inside", W("s8", 16), end(7), 1, 0.4)],
    badges: [
      { text: "NÃO É SANGUE LÍQUIDO", variant: "negative", appearAt: W("s8", 2), disappearAt: W("s8", 8) },
      { text: "SÓ UMA MARCA QUÍMICA", variant: "info", appearAt: W("s8", 8) },
    ],
    highlights: ["LÍQUIDO", "MARCA", "QUÍMICA", "SOMBRA", "PEDRA"],
    captions: [cap("s8", 7, "Só que não é sangue líquido. É uma marca química, uma sombra do sangue que virou pedra junto com o osso.")],
    audioCues: [narration("s8"), sfx("drip", W("s8", 2), 0.35), sfx("dust", W("s8", 5), 0.35), sfx("crumble", W("s8", 15), 0.25)],
  },
  {
    id: "s9", ...sc(8), voKey: "s9",
    narration: "E nem todo mundo está convencido: uma paleontóloga lembra que hemácias de dinossauro deviam ser abauladas, e essas parecem côncavas.",
    camera: { projection: "perspective", movement: "split", keys: [key(0, P.split), key(end(8), orbit(add(BONE, [6, 0.5, 0]), 6.2, 8, 8), "linear")] },
    objects: [{ id: "rbcA", type: "RBC(abaulada com núcleo)", visible: true }, { id: "rbcB", type: "RBC(côncava, do fóssil)", visible: true }, { id: "verdict", type: "VerdictMeter2D", visible: true }],
    animations: [pop("split.show", 0), lin("verdict.show", W("s9", 1), W("s9", 1) + 10, 0, 1, "out"), lin("verdict.wobble", W("s9", 1), W("s9", 1) + 8, 0, 0.7), lin("rbcA.spin", W("s9", 14), W("s9", 14) + 30, 0, Math.PI, "inOut", "rad"), lin("rbcB.spin", W("s9", 18), W("s9", 18) + 30, 0, Math.PI, "inOut", "rad")],
    badges: [
      { text: "NEM TODOS CONCORDAM", variant: "warning", appearAt: W("s9", 1), disappearAt: W("s9", 15) },
      { text: "ESPERADA: ABAULADA · ACHADA: CÔNCAVA", variant: "warning", appearAt: W("s9", 15) },
    ],
    highlights: ["CONVENCIDO", "PALEONTÓLOGA", "ABAULADAS", "CÔNCAVAS"],
    captions: [cap("s9", 8, "E nem todo mundo está convencido: uma paleontóloga lembra que hemácias de dinossauro deviam ser abauladas, e essas parecem côncavas.")],
    audioCues: [narration("s9"), sfx("tick", W("s9", 1), 0.3), sfx("whoosh-soft", W("s9", 14), 0.25), sfx("whoosh-soft", W("s9", 18), 0.25)],
  },
  {
    id: "s10", ...sc(9), voKey: "s10",
    narration: "Primeira parte: achar sangue de dinossauro? Meia verdade.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.verdict), key(end(9), orbit(add(BONE, [0, 0.4, 0]), 10, 60, 15), "linear")] },
    objects: [{ id: "verdict", type: "VerdictMeter2D(grande)", visible: true }, { id: "fossil", type: "FossilLeg", visible: true }],
    animations: [set("verdict.show", 0, 0), lin("verdict.big", 0, 12, 0, 1, "out"), { type: "spring", target: "verdict.needle", startFrame: W("s10", 6), endFrame: W("s10", 6) + 24, from: 30, to: 0, damping: 10, unit: "deg" }, ...fx.flash(W("s10", 6), 6), lin("verdict.big", end(9) - 10, end(9), 1, 0)],
    badges: [
      { text: "1ª CHECAGEM", variant: "info", appearAt: 0, disappearAt: W("s10", 6) },
      { text: "MEIA VERDADE", variant: "warning", size: "large", appearAt: W("s10", 6) },
    ],
    highlights: ["SANGUE", "DINOSSAURO?", "MEIA", "VERDADE"],
    captions: [cap("s10", 9, "Primeira parte: achar sangue de dinossauro? Meia verdade.")],
    audioCues: [narration("s10"), sfx("tick", 0, 0.3), sfx("thud", W("s10", 6), 0.45)],
  },
  {
    id: "s11", ...sc(10), voKey: "s11",
    narration: "Agora, o clone. Pra isso, precisaria de DNA. E no osso o DNA se desfaz rápido: metade some a cada uns quinhentos anos.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.dna), key(end(10), P.dna2, "inOut")] },
    objects: [{ id: "dna", type: "DNAHelix", visible: true, state: { start: "inteira", end: "50% dos degraus" } }, { id: "hourglass", type: "Hourglass", visible: true }],
    animations: [...fx.whipIn(), ...world(0, "dna"), set("bg.inside", 0, 0), pop("dna.show", W("s11", 2)), lin("dna.decay", W("s11", 16), W("s11", 22), 0, 0.5), pop("hourglass.flip", W("s11", 16))],
    badges: [
      { text: "PRECISARIA DE DNA", variant: "info", appearAt: W("s11", 7), disappearAt: W("s11", 16) },
      { text: "METADE SOME A CADA ~500 ANOS", variant: "negative", appearAt: W("s11", 16) },
    ],
    highlights: ["CLONE", "DNA", "DESFAZ", "METADE", "QUINHENTOS"],
    captions: [cap("s11", 10, "Agora, o clone. Pra isso, precisaria de DNA. E no osso o DNA se desfaz rápido: metade some a cada uns quinhentos anos.")],
    audioCues: [narration("s11"), sfx("whoosh", 0, 0.4), sfx("shimmer", W("s11", 2), 0.3), sfx("hourglass", W("s11", 16), 0.35), sfx("dust", W("s11", 18), 0.3)],
  },
  {
    id: "s12", ...sc(11), voKey: "s12",
    narration: "Mesmo no frio ideal, depois de um milhão e meio de anos ele vira picadinho ilegível. Esse osso tem cento e quinze milhões.",
    camera: { projection: "perspective", movement: "dolly-out", keys: [key(0, P.dna2), key(end(11), orbit(add(DNA, [0, 1, 0]), 17, 40, 10), "linear")] },
    objects: [{ id: "frost", type: "FrostParticles", visible: true }, { id: "timeline", type: "Timeline2D(1,5 Ma × 115 Ma)", visible: true }, { id: "dna", type: "DNAHelix(→ pó)", visible: true }],
    animations: [pop("frost.show", W("s12", 2)), lin("timeline.k", W("s12", 6), W("s12", 11), 0, 0.013), lin("dna.decay", W("s12", 13), W("s12", 15), 0.5, 1), lin("timeline.k", W("s12", 19), W("s12", 22), 0.013, 1, "in"), ...fx.shake(W("s12", 21), 8)],
    badges: [
      { text: "ATÉ NO FRIO: ~1,5 MILHÃO DE ANOS", variant: "info", appearAt: W("s12", 6), disappearAt: W("s12", 19) },
      { text: "ESTE OSSO: 115 MILHÕES", variant: "negative", appearAt: W("s12", 19) },
    ],
    highlights: ["FRIO", "MILHÃO", "MEIO", "ILEGÍVEL", "QUINZE", "MILHÕES"],
    captions: [cap("s12", 11, "Mesmo no frio ideal, depois de um milhão e meio de anos ele vira picadinho ilegível. Esse osso tem cento e quinze milhões.")],
    audioCues: [narration("s12"), sfx("shimmer", W("s12", 2), 0.25), sfx("dust", W("s12", 13), 0.35), sfx("rewind", W("s12", 19), 0.3)],
  },
  {
    id: "s13", ...sc(12), voKey: "s13",
    narration: "E o mosquito no âmbar, do filme? Nunca acharam DNA de dinossauro em âmbar.",
    camera: { projection: "perspective", movement: "dolly-in", keys: [key(0, orbit(add(DNA, [0, 1, 0]), 17, 40, 10)), key(W("s13", 2), P.amber, "inOut"), key(end(12), orbit(add(DNA, [4, 1, 0]), 4.4, 30, 10), "linear")] },
    objects: [{ id: "amber", type: "AmberMosquito", visible: true }, { id: "cross", type: "Cross2D", visible: true }],
    animations: [pop("amber.show", W("s13", 2)), pop("amber.cross", W("s13", 7))],
    badges: [
      { text: "E O MOSQUITO?", variant: "warning", icon: "?", appearAt: W("s13", 2), disappearAt: W("s13", 8) },
      { text: "NENHUM DNA DE DINOSSAURO EM ÂMBAR", variant: "negative", appearAt: W("s13", 8) },
    ],
    highlights: ["MOSQUITO", "ÂMBAR", "FILME?", "NUNCA"],
    captions: [cap("s13", 12, "E o mosquito no âmbar, do filme? Nunca acharam DNA de dinossauro em âmbar.")],
    audioCues: [narration("s13"), sfx("amber-ring", W("s13", 2), 0.35), sfx("buzz", W("s13", 7), 0.35)],
  },
  {
    id: "s14", ...sc(13), voKey: "s14",
    narration: "Veredito: clonar o Aratassauro? Boato. Pronto: agora você sabe. Acharam a sombra do sangue, não um dinossauro pronto pra voltar.",
    camera: { projection: "perspective", movement: "orbit", keys: [key(0, P.amber), key(W("s14", 5) - 1, P.amber), key(W("s14", 5), P.final0), key(end(13), P.final1, "inOut")] },
    objects: [{ id: "verdict", type: "VerdictMeter2D(grande)", visible: true }, { id: "dino", type: "Aratasaurus(ghost)", visible: true }, { id: "summary", type: "Overlay(2 ícones)", visible: true }, { id: "mascot", type: "Mascot", visible: true }],
    animations: [
      set("verdict.needle", 0, 0), lin("verdict.big", 0, 12, 0, 1, "out"),
      { type: "spring", target: "verdict.needle", startFrame: W("s14", 4), endFrame: W("s14", 4) + 24, from: 0, to: -82, damping: 9, unit: "deg" },
      ...fx.shake(W("s14", 4), 12), ...fx.flash(W("s14", 4)), lin("verdict.big", W("s14", 5), W("s14", 5) + 10, 1, 0),
      ...world(W("s14", 5), "diorama"), lin("dino.ghost", W("s14", 9), W("s14", 19), 0, 0.35), pop("summary.a", W("s14", 9)), pop("summary.b", W("s14", 14)),
      ...mascot.place(M_DIO, -0.8, 0.45, W("s14", 5)), ...mascot.cheer(W("s14", 5), 40), ...mascot.wave(W("s14", 16), 36),
    ],
    badges: [
      { text: "VEREDITO: BOATO", variant: "negative", size: "large", appearAt: W("s14", 4), disappearAt: W("s14", 11) },
      { text: "ACHARAM A SOMBRA DO SANGUE", variant: "positive", appearAt: W("s14", 11) },
    ],
    highlights: ["VEREDITO", "BOATO", "PRONTO", "SOMBRA", "VOLTAR"],
    captions: [cap("s14", 13, "Veredito: clonar o Aratassauro? Boato. Pronto: agora você sabe. Acharam a sombra do sangue, não um dinossauro pronto pra voltar.")],
    audioCues: [narration("s14"), sfx("tick", 0, 0.3), sfx("thud", W("s14", 4), 0.55), sfx("final", W("s14", 5), 0.45), sfx("dino-step", W("s14", 9), 0.3)],
  },
];

export const track = (target: string, frame: number, fallback = 0) => evaluateTrack(scenes, target, frame, FPS, fallback);
